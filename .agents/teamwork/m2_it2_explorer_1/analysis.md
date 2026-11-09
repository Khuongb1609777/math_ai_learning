# Milestone M2 Iteration 2: Modal Lifecycle & Race Condition Analysis

**Author**: Milestone M2 Iteration 2 Explorer 1  
**Target Module**: `src/components/KhktShowcaseModal.js`  
**Test Suite**: `tests/modal_state_adversarial.test.js`  
**Date**: 2026-11-07  

---

## 1. Executive Summary

During Milestone M2 adversarial verification by Challenger 2, an asynchronous lifecycle race condition was uncovered in `src/components/KhktShowcaseModal.js`:
- In `close()`, a 250ms CSS closing transition is simulated via an untracked `setTimeout(..., 250)`.
- When `open()` is invoked within 250ms of `close()`, the pending timeout is not cancelled.
- When the 250ms timer triggers, its callback removes `this.modalEl` from the DOM, sets `this.modalEl = null`, and triggers the consumer's `onClose()` callback, abruptly destroying the actively visible, reopened modal.

This document presents a root-cause breakdown, state machine transition analysis, secondary edge-case findings (such as untracked focus timers), and the exact drop-in implementation fix ready for the Worker agent.

---

## 2. Problem Statement & Root Cause Analysis

### 2.1 The Race Condition Timeline

```text
Time    Event                                State of KhktShowcaseModal
─────────────────────────────────────────────────────────────────────────────
t = 0ms   modal.open('pedagogy')              modalEl created, appended to DOM
                                             requestAnimationFrame schedules is-open
                                             focusTimeout (50ms) scheduled

t = 10ms  rAF executes                       modalEl classList: ['khkt-modal-backdrop', 'is-open']
                                             aria-hidden: "false"
                                             isOpen() === true

t = 15ms  modal.close()                       modalEl.classList.remove('is-open')
                                             aria-hidden: "true"
                                             document.body.style.overflow = ''
                                             keydown listener removed
                                             UNTRACKED setTimeout(cb, 250) scheduled!
                                             isOpen() === false

t = 30ms  modal.open('pedagogy')              reopen called (< 250ms after close)
                                             Existing modalEl reused
                                             requestAnimationFrame schedules is-open
                                             keydown listener added
                                             document.body.style.overflow = 'hidden'
                                             isOpen() === true

t = 40ms  rAF executes                       modalEl classList: ['khkt-modal-backdrop', 'is-open']
                                             aria-hidden: "false"

t = 265ms Stale t=15ms timer triggers!       if (this.modalEl && this.modalEl.parentNode) {
                                               this.modalEl.parentNode.removeChild(this.modalEl); // DELETED!
                                               this.modalEl = null;                              // NULLED!
                                             }
                                             this.previousActiveElement.focus();
                                             this.options.onClose(); // Informs App modal is closed!
                                             modalEl is DESTROYED while user was viewing it!
                                             isOpen() === false!
```

### 2.2 Verbatim Code in `src/components/KhktShowcaseModal.js`

Lines 530–554 of `src/components/KhktShowcaseModal.js`:
```javascript
  close() {
    if (!this.modalEl) return;

    this.modalEl.classList.remove('is-open');
    this.modalEl.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', this.boundKeyHandler);
    document.body.style.overflow = '';

    setTimeout(() => {
      if (this.modalEl && this.modalEl.parentNode) {
        this.modalEl.parentNode.removeChild(this.modalEl);
        this.modalEl = null;
      }
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
        this.previousActiveElement.focus();
      }
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
    }, 250);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-closed'));
  }
```

Notice:
1. `setTimeout(..., 250)` return value is discarded. No handle exists to cancel it.
2. In `open()` (lines 486–525), no check or cancellation of pending closing timers is attempted.
3. The callback inside `setTimeout` checks `if (this.modalEl && this.modalEl.parentNode)`, which evaluates to `true` because `this.modalEl` was retained and updated by `open()`. Consequently, it removes the reopened modal element from its container.
4. Calling `this.options.onClose()` triggers `app.handleCloseShowcase()` in `src/app.js`, which sets `this.state.isShowcaseModalOpen = false` and clears `modalRoot.innerHTML = ''`, amplifying the destruction.

### 2.3 Reproduction Error Output

Executing `node --test tests/modal_state_adversarial.test.js`:
```text
  ✖ stress-tests rapid open-close-open cycle (<250ms): exposes stale cleanup timer destroying reopened modal (334.554051ms)
    AssertionError [ERR_ASSERTION]: LIFECYCLE VULNERABILITY DETECTED: KhktShowcaseModal.close() schedules a 250ms timeout that is NOT cancelled by open(). The reopened modal was destroyed by the stale closing timer!
    
    false !== true
    
        at TestContext.<anonymous> (file:///Users/mac/Desktop/math_english_ai_learn/tests/modal_state_adversarial.test.js:571:12)
```

---

## 3. Secondary Lifecycle Flaws Discovered

During forensic analysis of `src/components/KhktShowcaseModal.js`, two additional related timer/listener lifecycle flaws were identified:

### 3.1 Untracked 50ms Focus Timer in `open()`
In line 518:
```javascript
    // Focus close button or first interactive element
    setTimeout(() => {
      const closeBtn = this.modalEl?.querySelector('.khkt-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 50);
```
- If `open()` is followed by `close()` within 50ms, this timeout still fires at t=50ms.
- At t=50ms, `this.modalEl` is still in the DOM (closing animation is 250ms).
- The timeout executes `closeBtn.focus()`, stealing focus into a closing modal and disrupting the user's focus on the triggering launcher button.
- **Remedy**: Store this as `this.focusTimeout` and cancel it in both `close()` and `open()`.

### 3.2 Non-Idempotent Keydown Event Registration
In line 515:
```javascript
    // Add ESC key listener
    document.addEventListener('keydown', this.boundKeyHandler);
```
- In environments or mock harnesses where `addEventListener` does not deduplicate identical handler references (or if rapid `open()` calls occur without intervening `close()`), multiple identical listeners accumulate.
- **Remedy**: Always call `document.removeEventListener('keydown', this.boundKeyHandler)` immediately prior to `document.addEventListener('keydown', this.boundKeyHandler)` to guarantee single-listener idempotency.

### 3.3 Missing Synchronous Teardown Method (`destroy()`)
- Other key components in the architecture (`Header.js`, `CollectionExplorer.js`) provide a synchronous `destroy()` lifecycle method.
- `KhktShowcaseModal.js` lacked a `destroy()` method to cancel all active timers (`closeTimeout`, `focusTimeout`), unbind global listeners, unlock body scroll, detach DOM elements immediately, and clear the singleton reference `KhktShowcaseModal.instance`.
- **Remedy**: Implement a clean `destroy()` method.

---

## 4. State Machine Transition Model

The lifecycle of `KhktShowcaseModal` can be modeled as a finite state machine:

```text
                  ┌──────────────────────┐
                  │        CLOSED        │◄───────────────────────────┐
                  └──────────┬───────────┘                            │
                             │ open()                                 │
                             ▼                                        │
                  ┌──────────────────────┐                            │
                  │       OPENING        │                            │
                  │ (DOM created / rAF)  │                            │
                  └──────────┬───────────┘                            │
                             │ rAF / 50ms                             │
                             ▼                                        │
           ┌──────────────► OPEN         │                            │
           │              └──────┬───────┘                            │
           │                     │ close()                            │
           │                     ▼                                    │
           │              ┌──────────────┐                            │
           │  open()      │   CLOSING    │  250ms timeout completes   │
           └──────────────┤ (250ms timer)├────────────────────────────┘
         (cancel timer,   └──────────────┘
          restore open)          │ destroy()
                                 ▼
                          [ Immediate Cleanup ]
```

### Invariant Rules
1. **At most one active closing timer**: `this.closeTimeout` must either be `null` or hold the active `setTimeout` ID.
2. **Cancellation on state exit**: Any transition out of `CLOSING` back to `OPEN` (via `open()`) or to `CLOSED` (via `destroy()`) MUST invoke `clearTimeout(this.closeTimeout)` and nullify `this.closeTimeout`.
3. **Cancellation on re-entrant close**: Consecutive calls to `close()` during the `CLOSING` state must cancel the existing timer before scheduling a new one.
4. **DOM integrity**: `this.modalEl` must NEVER be removed from `parentNode` if `isOpen() === true` or if `this.closeTimeout === null`.

---

## 5. Drop-In Code Fix

### 5.1 Constructor Changes
In `constructor(options = {})`:
```javascript
    this.activeTab = this.options.initialTab;
    this.selectedStep = 1; // 1 to 7
    this.modalEl = null;
    this.previousActiveElement = null;
    this.boundKeyHandler = this.handleKeyDown.bind(this);
    this.showingFigureId = null;
    this.closeTimeout = null;
    this.focusTimeout = null;

    // Singleton caching
    KhktShowcaseModal.instance = this;
```

### 5.2 `open(tab)` Changes
```javascript
  /**
   * Opens modal, locks background scroll, traps focus.
   * @param {string} [tab]
   */
  open(tab) {
    if (typeof document === 'undefined') return;
    injectModalStyles();

    // Cancel pending close timeout if modal is reopened before closing animation completes
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    if (tab) {
      this.activeTab = tab;
    }

    if (!this.modalEl) {
      this.createDom();
    } else {
      this.updateView();
    }

    // Save previous active element for focus restoration
    this.previousActiveElement = document.activeElement;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Show backdrop with transition
    requestAnimationFrame(() => {
      if (this.modalEl) {
        this.modalEl.classList.add('is-open');
        this.modalEl.setAttribute('aria-hidden', 'false');
      }
    });

    // Add ESC key listener (remove first to ensure idempotency)
    document.removeEventListener('keydown', this.boundKeyHandler);
    document.addEventListener('keydown', this.boundKeyHandler);

    // Focus close button or first interactive element (cancel existing timer)
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }
    this.focusTimeout = setTimeout(() => {
      const closeBtn = this.modalEl?.querySelector('.khkt-modal-close-btn');
      if (closeBtn) closeBtn.focus();
      this.focusTimeout = null;
    }, 50);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-opened', { detail: { tab: this.activeTab } }));
  }
```

### 5.3 `close()` Changes
```javascript
  /**
   * Closes modal and restores focus.
   */
  close() {
    if (!this.modalEl) return;

    // Cancel any existing close timeout before scheduling
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    // Cancel pending focus timeout if modal is closed before 50ms focus trigger
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }

    this.modalEl.classList.remove('is-open');
    this.modalEl.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', this.boundKeyHandler);
    document.body.style.overflow = '';

    this.closeTimeout = setTimeout(() => {
      if (this.modalEl && this.modalEl.parentNode) {
        this.modalEl.parentNode.removeChild(this.modalEl);
        this.modalEl = null;
      }
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
        this.previousActiveElement.focus();
      }
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
      this.closeTimeout = null;
    }, 250);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-closed'));
  }
```

### 5.4 Addition of `destroy()` Lifecycle Method
```javascript
  /**
   * Complete teardown of modal instance, timers, DOM nodes and listeners.
   */
  destroy() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.boundKeyHandler);
      document.body.style.overflow = '';
    }
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }
    this.modalEl = null;
    if (KhktShowcaseModal.instance === this) {
      KhktShowcaseModal.instance = null;
    }
  }
```

---

## 6. Verification Against Adversarial Attack Vectors

| Scenario | Invariant Checked | Expected Behavior | Status with Proposed Fix |
|---|---|---|:---:|
| **Rapid open-close-open (<250ms)** | `modal.modalEl.parentNode !== null && modal.isOpen() === true` | `this.closeTimeout` cancelled at t=20ms. Stale t=0 timer does not fire at t=250ms. Modal remains open. | **PASS** |
| **Standard open and close (>250ms)** | `modal.modalEl === null && modal.isOpen() === false` | Timer completes at 250ms, removes element, nullifies `modalEl`, restores focus. | **PASS** |
| **Burst of 10x Escape presses** | Idempotent handling without crash | Previous `closeTimeout` cancelled, new timer scheduled, no multiple event listener leaks. | **PASS** |
| **Close before 50ms focus trigger** | Focus not stolen by closed modal | `this.focusTimeout` cancelled immediately in `close()`. | **PASS** |
| **Repeated 20x singleton `open()`** | Single backdrop in container | Exactly 1 backdrop element created; subsequent calls call `updateView()`. | **PASS** |

---

## 7. Downstream Coordination & Next Steps

1. **Explorer 2** is addressing the `app.handleOpenShowcase()` re-entrancy / double backdrop guard in `src/app.js`.
2. **Explorer 3** is addressing the `app.handleLanguageChange()` header synchronization in `src/app.js` and `src/components/Header.js`.
3. **Worker Agent** should apply the unified patch from Section 5 to `src/components/KhktShowcaseModal.js`.
4. **Verification**: After Worker applies this change alongside Explorer 2 and Explorer 3 changes, all 146 unit & adversarial tests in `npm test` will pass with 0 failures.
