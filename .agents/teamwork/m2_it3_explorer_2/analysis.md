# Deep-Dive Analysis: State Inversion & Event Timing in `src/app.js` and `KhktShowcaseModal.js`

**Author**: Milestone M2 Iteration 3 Explorer 2 (`m2_it3_explorer_2`)  
**Date**: 2026-11-09  
**Target Files**:
- `src/app.js` (lines 124–126, lines 192–265, lines 270–279)
- `src/components/KhktShowcaseModal.js` (lines 559–602)  
**Target Tests**:
- `tests/modal_deep_stress_adversarial.test.js` (Suite 2: `guarantees ESC key dismissal followed by rapid reopen (<250ms) does not corrupt root open state`)
- `tests/modal_state_adversarial.test.js`

---

## 1. Executive Summary

During adversarial testing of Milestone M2 Iteration 2, Challenger 2 identified a critical **State Inversion Vulnerability** in `src/app.js:handleOpenShowcase()` and `src/components/KhktShowcaseModal.js`.

### The Core Vulnerability
When a user closes an active modal (via the ESC key, clicking the close button, or clicking the backdrop) or when `handleOpenShowcase()` defensively attempts to clean up a previous or lingering modal instance, `this.showcaseModal.close()` dispatches a custom event `'khkt:modal-closed'` on `window`.

In `src/app.js:init()`, the window event listener for `'khkt:modal-closed'` unconditionally sets:
```javascript
this.state.isShowcaseModalOpen = false;
```
If this close event fires during or after `handleOpenShowcase()` begins opening a new or reused modal instance, the event sets `this.state.isShowcaseModalOpen = false` while the modal element is actively mounting or already open in the DOM (`isOpen() === true`).

This inverts the application state:
- **Actual DOM State**: Modal is active, attached to `#modal-root`, and visible with backdrop blur and scroll lock.
- **Application Controller State**: `app.state.isShowcaseModalOpen === false`.

This state corruption breaks subsequent user actions (e.g., clicking open showcase buttons again fails or creates stacked backdrops), breaks tab switching, and violates core integrity contracts.

---

## 2. Forensic Root Cause & Call Stack Breakdown

### 2.1 The Two Roots of State Inversion

#### Root 1: Defensively Calling `close()` Inside `handleOpenShowcase()`
In previous worker revisions (e.g. `m2_it2_worker`), `handleOpenShowcase()` included defensive code:
```javascript
// A prior flaw:
this.state.isShowcaseModalOpen = true;
if (this.showcaseModal && typeof this.showcaseModal.close === 'function') {
  this.showcaseModal.close(); // <-- Dispatches 'khkt:modal-closed' synchronously!
}
```
Because `window.dispatchEvent(new CustomEvent('khkt:modal-closed'))` is **strictly synchronous**, calling `close()` synchronously triggered the window listener in `init()`, which ran:
```javascript
window.addEventListener('khkt:modal-closed', () => {
  this.state.isShowcaseModalOpen = false; // <-- OVERWRITES state to false!
});
```
By the time `handleOpenShowcase()` proceeded to mount and open the modal:
```javascript
this.showcaseModal.open();
```
The modal was mounted and open, but `this.state.isShowcaseModalOpen` was `false`!

#### Root 2: Unconditional Window Listener Without Modal State Guard
In `src/app.js:init()`, the listener:
```javascript
window.addEventListener('khkt:modal-closed', () => {
  this.state.isShowcaseModalOpen = false;
});
```
lacked any verification that:
1. The event originated from the *current* active showcase modal instance (versus a destroyed, orphaned, or stale instance).
2. The current modal is not currently open (`!this.showcaseModal.isOpen()`).

If an older modal instance was closing, or if an event arrived during a rapid reopen sequence, the listener blindly trampled `this.state.isShowcaseModalOpen`, forcing it to `false`.

#### Root 3: The 250ms Delayed `onClose` Callback Cascade
In `src/components/KhktShowcaseModal.js:close()`:
```javascript
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
```
In `src/app.js:handleOpenShowcase()`, the modal was instantiated with:
```javascript
this.showcaseModal = new KhktShowcaseModal({
  container: modalRoot,
  language: this.state.language,
  onClose: this.handleCloseShowcase
});
```
And `handleCloseShowcase()` in `app.js` contained:
```javascript
handleCloseShowcase() {
  this.state.isShowcaseModalOpen = false;
  if (this.showcaseModal && typeof this.showcaseModal.close === 'function') {
    this.showcaseModal.close();
  }
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = '';
  }
}
```
If a modal was closed (e.g. at t=0ms via ESC), and the user reopened the showcase at t=50ms (< 250ms):
If the previous instance was not reused, but replaced:
1. The old modal's `closeTimeout` (scheduled for t=250ms) was **never cancelled** because `this.showcaseModal.open()` only cancelled the *new* instance's `closeTimeout`.
2. At t=250ms, the old modal's timer fired and executed `this.options.onClose()`, which was `app.handleCloseShowcase()`.
3. `app.handleCloseShowcase()` executed at t=250ms:
   - Reset `this.state.isShowcaseModalOpen = false`!
   - Called `this.showcaseModal.close()` on the *new* reopened modal!
   - Wiped `modalRoot.innerHTML = ''`, completely destroying the active modal from the DOM!

---

## 3. The Test Evidence in `tests/modal_deep_stress_adversarial.test.js`

In `tests/modal_deep_stress_adversarial.test.js`, lines 622–669:
```javascript
it('guarantees ESC key dismissal followed by rapid reopen (<250ms) does not corrupt root open state', async () => {
  const app = new App();
  await app.init();
  const modalRoot = document.getElementById('modal-root');

  // 1. Open modal
  await app.handleOpenShowcase();
  await new Promise(r => setTimeout(r, 20));
  assert.equal(app.state.isShowcaseModalOpen, true);
  assert.ok(app.showcaseModal.isOpen());

  // 2. User presses ESC key
  const escEvent = new MockKeyboardEvent('keydown', { key: 'Escape', cancelable: true });
  document.dispatchEvent(escEvent);

  // Verify modal is closing and event reset app state
  assert.equal(app.state.isShowcaseModalOpen, false, 'app.state.isShowcaseModalOpen must flip to false on ESC');

  // 3. User re-opens showcase immediately at t=50ms (< 250ms)
  await new Promise(r => setTimeout(r, 50));
  await app.handleOpenShowcase();
  await new Promise(r => setTimeout(r, 20));

  assert.equal(
    app.state.isShowcaseModalOpen,
    true,
    'STATE INVERSION VULNERABILITY DETECTED: In app.handleOpenShowcase(), calling this.showcaseModal.close() dispatched khkt:modal-closed, resetting app.state.isShowcaseModalOpen to false while reopening!'
  );
  assert.ok(app.showcaseModal.isOpen(), 'Reopened modal must be open');

  // 4. Wait until t=350ms (well past the first modal 250ms close timer)
  await new Promise(r => setTimeout(r, 300));

  assert.equal(
    app.showcaseModal.isOpen(),
    true,
    'The reopened modal must remain open'
  );
  assert.equal(
    app.state.isShowcaseModalOpen,
    true,
    'app.state.isShowcaseModalOpen must remain true'
  );

  // Clean teardown
  app.handleCloseShowcase();
  await new Promise(r => setTimeout(r, 300));
});
```

---

## 4. Multi-Layer Surgical Solution Design

To completely eliminate the State Inversion Vulnerability and guarantee 100% deterministic state tracking under all rapid, concurrent, and adversarial sequences, four coordinated changes are formulated:

### Layer 1: Instance Reuse Rather Than Close & Recreate in `handleOpenShowcase()`
When `this.showcaseModal` already exists:
- Never call `this.showcaseModal.close()`. Calling `close()` while trying to open a modal is inherently self-defeating.
- Check if it is already open and properly attached to `modalRoot`. If so, ensure `this.state.isShowcaseModalOpen = true` and return immediately.
- If it exists but is not open (or is mid-close animation):
  - Ensure `this.showcaseModal.options.container = modalRoot`.
  - Re-attach `this.showcaseModal.modalEl` to `modalRoot` if detached.
  - Call `this.showcaseModal.open()`.
  - Inside `open()`, any pending `closeTimeout` is cancelled via `clearTimeout(this.closeTimeout); this.closeTimeout = null;`.
  - Set `this.state.isShowcaseModalOpen = true`.

### Layer 2: Guard the Global `'khkt:modal-closed'` Event Listener
In `src/app.js:init()`:
```javascript
window.addEventListener('khkt:modal-closed', (e) => {
  // 1. If event specifies an originating modal instance and it is not our active modal, ignore
  if (e.detail?.modal && this.showcaseModal && e.detail.modal !== this.showcaseModal) {
    return;
  }
  // 2. Prevent state inversion: if our active modal is currently open in the DOM, do not flip state to false
  if (this.showcaseModal && this.showcaseModal.isOpen()) {
    return;
  }
  this.state.isShowcaseModalOpen = false;
});
```

### Layer 3: Dispatch Originating Modal Reference in `KhktShowcaseModal:close()`
In `src/components/KhktShowcaseModal.js:close()`:
```javascript
// Dispatch custom event with originating instance reference
window.dispatchEvent(new CustomEvent('khkt:modal-closed', { detail: { modal: this } }));
```
This enables listeners to distinguish events from stale/orphaned instances vs the active instance.

### Layer 4: Idempotent and Non-Destructive `onClose` Binding
In `src/app.js:handleOpenShowcase()`:
When initializing `new KhktShowcaseModal(...)`:
```javascript
onClose: () => {
  // Only update state if modal is genuinely closed
  if (!this.showcaseModal || !this.showcaseModal.isOpen()) {
    this.state.isShowcaseModalOpen = false;
  }
}
```
And in `handleCloseShowcase()`:
```javascript
handleCloseShowcase() {
  this.state.isShowcaseModalOpen = false;
  if (this.showcaseModal && typeof this.showcaseModal.close === 'function') {
    if (this.showcaseModal.isOpen()) {
      this.showcaseModal.close();
    }
  }
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = '';
  }
}
```
This prevents redundant recursive invocations of `close()` and avoids orphaning DOM elements.

---

## 5. Non-Overlapping Boundaries with Peer Explorers

- **Explorer 1 (`Ghost Modal Detachment`)**:
  Focuses on preventing `modalRoot.innerHTML = ''` from detaching `modalEl` during in-flight reopen animations and ensuring `KhktShowcaseModal.prototype.open()` re-attaches `this.modalEl` to `options.container` if detached.
- **Explorer 2 (This Agent — `State Inversion & Event Timing`)**:
  Focuses on `khkt:modal-closed` event timing, preventing premature `isShowcaseModalOpen = false` resets, eliminating defensive `close()` calls in `handleOpenShowcase()`, and adding the active modal state guard.
- **Explorer 3 (`In-Flight Async Re-Entrancy & Import Lock`)**:
  Focuses on `this._showcaseImportPromise` caching and synchronous locking during dynamic `import('./components/KhktShowcaseModal.js')`.

These 3 scopes are perfectly complementary and combine into a unified, bulletproof modal architecture for the Worker to implement.
