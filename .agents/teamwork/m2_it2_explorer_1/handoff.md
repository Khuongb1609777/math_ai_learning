# Milestone M2 Iteration 2 Handoff Report: Modal Lifecycle & Race Condition Fix

**Agent**: Milestone M2 Iteration 2 Explorer 1  
**Target File**: `src/components/KhktShowcaseModal.js`  
**Date**: 2026-11-07  
**Status**: COMPLETE (Hard Handoff)  

---

## 1. Observation

### 1.1 Direct Source Code Inspection (`src/components/KhktShowcaseModal.js`)

In `src/components/KhktShowcaseModal.js`:
- **Lines 423–439**: The constructor initializes `this.activeTab`, `this.selectedStep`, `this.modalEl`, `this.previousActiveElement`, `this.boundKeyHandler`, and `this.showingFigureId`. Neither `this.closeTimeout` nor `this.focusTimeout` are defined.
- **Lines 486–525 (`open()`)**:
  ```javascript
  open(tab) {
    if (typeof document === 'undefined') return;
    injectModalStyles();

    if (tab) {
      this.activeTab = tab;
    }

    if (!this.modalEl) {
      this.createDom();
    } else {
      this.updateView();
    }
  ```
  `open()` checks `if (!this.modalEl)` but never checks or clears any pending asynchronous timers from a prior `close()` call.
- **Lines 530–554 (`close()`)**:
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
  `setTimeout(..., 250)` is executed unconditionally without retaining its timer handle. The cleanup closure removes `this.modalEl` from its DOM parent, sets `this.modalEl = null`, and fires `this.options.onClose()`.

### 1.2 Verbatim Test Failure

Running `node --test tests/modal_state_adversarial.test.js`:
```text
✖ stress-tests rapid open-close-open cycle (<250ms): exposes stale cleanup timer destroying reopened modal (334.554051ms)
  AssertionError [ERR_ASSERTION]: LIFECYCLE VULNERABILITY DETECTED: KhktShowcaseModal.close() schedules a 250ms timeout that is NOT cancelled by open(). The reopened modal was destroyed by the stale closing timer!
  
  false !== true
  
      at TestContext.<anonymous> (file:///Users/mac/Desktop/math_english_ai_learn/tests/modal_state_adversarial.test.js:571:12)
      at async Test.run (node:internal/test_runner/test:797:9)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:527:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual'
  }
```

### 1.3 Test Code Inspection (`tests/modal_state_adversarial.test.js:550–581`)

```javascript
  it('stress-tests rapid open-close-open cycle (<250ms): exposes stale cleanup timer destroying reopened modal', async () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    
    // Step 1: Open modal
    modal.open('pedagogy');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(modal.isOpen(), true);

    // Step 2: Trigger close (schedules 250ms timeout)
    modal.close();

    // Step 3: Reopen immediately at t=20ms (< 250ms)
    modal.open('pedagogy');
    await new Promise(r => setTimeout(r, 10));

    // At t=300ms, the stale 250ms timeout from Step 2 executes if not cancelled!
    await new Promise(r => setTimeout(r, 300));

    // Adversarial invariant: A reopened modal MUST remain open and attached to DOM.
    const modalStillInDom = Boolean(modal.modalEl && modal.modalEl.parentNode);
    assert.equal(
      modalStillInDom,
      true,
      'LIFECYCLE VULNERABILITY DETECTED: KhktShowcaseModal.close() schedules a 250ms timeout that is NOT cancelled by open(). The reopened modal was destroyed by the stale closing timer!'
    );
    assert.equal(
      modal.isOpen(),
      true,
      'modal.isOpen() must remain true for reopened modal'
    );
  });
```

---

## 2. Logic Chain

1. **Premise 1**: When `KhktShowcaseModal.close()` is called, it schedules an asynchronous 250ms callback to remove `this.modalEl` from the DOM and nullify the reference (Observation 1.1).
2. **Premise 2**: JavaScript runtimes maintain active timers until they either expire or are explicitly cancelled via `clearTimeout(timerId)`.
3. **Premise 3**: In `KhktShowcaseModal.close()`, the ID returned by `setTimeout(..., 250)` is never stored, and `KhktShowcaseModal.open()` never invokes `clearTimeout()` (Observation 1.1).
4. **Step 4**: When `open()` is called at $t < 250\text{ ms}$ after `close()`, `this.modalEl` has not yet been removed from the DOM, so `open()` reuses the existing `this.modalEl`, updates its content, and schedules `is-open` class via `requestAnimationFrame` (Observation 1.1 & 1.3).
5. **Step 5**: When the initial 250ms interval concludes, the uncancelled timer callback fires, executing `this.modalEl.parentNode.removeChild(this.modalEl)` and `this.modalEl = null`.
6. **Step 6**: As a consequence, the newly reopened modal is prematurely deleted from the DOM, and `this.options.onClose()` is erroneously executed for a modal that is supposed to be active (Observation 1.2 & 1.3).
7. **Conclusion**: Storing `this.closeTimeout`, clearing it inside `open()` before reattaching/updating, clearing it inside `close()` before rescheduling, and nullifying `this.closeTimeout` upon timer completion completely eliminates the race condition.

---

## 3. Caveats

1. **Scope Boundary**: This investigation focuses strictly on the modal lifecycle in `src/components/KhktShowcaseModal.js`. The double backdrop creation in `src/app.js:170` and the language desynchronization in `src/app.js:155` are assigned to Explorer 2 and Explorer 3 respectively.
2. **Read-Only Protocol**: As Explorer 1, no source files under `src/` were directly modified. The drop-in code and patch are delivered in this handoff and in `.agents/teamwork/m2_it2_explorer_1/KhktShowcaseModal.patch`.
3. **DOM Mock Constraints**: In Node.js testing environments (`tests/modal_state_adversarial.test.js`), `MockElement` does NOT implement `element.contains(child)`. Defensive checks must avoid calling `this.modalEl.contains()` and rely on `this.modalEl.parentNode` or direct equality.

---

## 4. Conclusion

The race condition in `src/components/KhktShowcaseModal.js` is fully diagnosed and solved. 

### Actionable Implementation Package for Worker

Apply the following modifications to `src/components/KhktShowcaseModal.js`:

#### A. In `constructor` (Line ~436):
Add timer tracking fields:
```javascript
    this.showingFigureId = null;
    this.closeTimeout = null;
    this.focusTimeout = null;

    // Singleton caching
    KhktShowcaseModal.instance = this;
```

#### B. In `open(tab)` (Line ~486):
Add timeout cancellation, idempotent keydown listener binding, and focus timer tracking:
```javascript
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

    // Add ESC key listener (remove first to avoid duplicate bindings)
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

#### C. In `close()` (Line ~530):
Track and cancel `closeTimeout` and `focusTimeout`:
```javascript
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

#### D. Add `destroy()` Method (Line ~564):
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

A patch file is ready at:  
`/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_explorer_1/KhktShowcaseModal.patch`

---

## 5. Verification Method

To independently verify the fix:

### 5.1 Adversarial Subtest Execution
Run the specific failing test case:
```bash
node --test --test-name-pattern="stress-tests rapid open-close-open cycle" tests/modal_state_adversarial.test.js
```
- **Prior to fix**: Fails with `AssertionError: LIFECYCLE VULNERABILITY DETECTED: KhktShowcaseModal.close() schedules a 250ms timeout that is NOT cancelled by open().`
- **Post fix**: Passes with 0 assertion errors.

### 5.2 Full Adversarial Suite
Run the complete adversarial suite:
```bash
node --test tests/modal_state_adversarial.test.js
```
- The test `stress-tests rapid open-close-open cycle (<250ms)` must pass.
- All accessibility tests (ESC dismiss, focus restore, focus trapping) in Vector 2 must continue to pass.

### 5.3 Invalidation Conditions
The fix is invalid if:
1. Reopening the modal within 250ms results in `modal.modalEl === null` or `modal.isOpen() === false` at $t = 300\text{ ms}$.
2. Normal close (>250ms) fails to remove `modalEl` from the DOM or fails to restore focus to `previousActiveElement`.
3. An exception is thrown during rapid bursts of ESC key presses.
