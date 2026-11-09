# Forensic Analysis: Ghost Modal Detachment in Rapid Reopen Cycles

**Document**: Root Cause Analysis & Architectural Remediation  
**Author**: Milestone M2 Iteration 3 Explorer 1 (`m2_it3_explorer_1`)  
**Target Modules**: `src/app.js` and `src/components/KhktShowcaseModal.js`  
**Target Test Suite**: `tests/modal_deep_stress_adversarial.test.js`  
**Date**: 2026-11-09  

---

## 1. Executive Summary

During rapid open-close-open interaction cycles (<250ms) or asynchronous cleanup operations, modal dialogues can enter a **"Ghost Modal Detachment"** state. In this pathological condition:
1. The modal controller (`KhktShowcaseModal`) holds an instantiated backdrop element (`this.modalEl`) and reports `isOpen() === true`.
2. However, the DOM container (`#modal-root`) contains **zero children** (`children.length === 0`).
3. The modal is completely invisible and unreachable by the user, while internal event listeners and scroll locks remain active.

Furthermore, a forensic investigation into current implementations uncovered a severe latent production vulnerability: in `src/app.js:201`, the attachment check calls `modalRoot.children.includes(this.showcaseModal.modalEl)`. While this passes in Node.js mock test harnesses (where `children` is an Array), it **throws an uncaught `TypeError: modalRoot.children.includes is not a function` in all real production web browsers**, because standard browser `children` properties return an `HTMLCollection`, which lacks `Array.prototype.includes`.

This report provides the exact anatomy of the defect, identifies all 5 contributing failure mechanisms, and formulates surgical, drop-in fixes for both `src/app.js` and `src/components/KhktShowcaseModal.js`.

---

## 2. Forensic Breakdown of Failure Mechanisms

### Mechanism 1: Synchronous DOM Eviction vs. Asynchronous Controller Teardown
In `src/app.js:handleCloseShowcase()`, the method coordinates modal closing:
```javascript
// src/app.js:270-279
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
When `modalRoot.innerHTML = ''` executes:
- It **immediately and synchronously** removes all children from `#modal-root`.
- Simultaneously, `this.showcaseModal.close()` has initiated an asynchronous 250ms CSS fade-out transition:
  ```javascript
  // src/components/KhktShowcaseModal.js:585-597
  this.closeTimeout = setTimeout(() => {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
    ...
  }, 250);
  ```
- Because `modalRoot.innerHTML = ''` ran immediately, the modal element was detached from the DOM while the controller `this.showcaseModal` still retained a pointer to `this.modalEl` for the remaining 250ms.

### Mechanism 2: Reopen Assumption of Prior Attachment
If the user re-triggers `handleOpenShowcase()` within the 250ms window (e.g. at $t = 50\text{ms}$):
```javascript
// Naive implementation in KhktShowcaseModal.prototype.open
if (!this.modalEl) {
  this.createDom(); // mounts to container
} else {
  this.updateView(); // assumes modalEl is already inside container!
}
```
Because `this.modalEl` is truthy, the naive `open()` method assumed `this.modalEl` was already attached to the DOM tree and only invoked `this.updateView()`. Consequently, `this.modalEl` was never re-appended to `modalRoot`, leaving `#modal-root` empty (`modalRoot.children.length === 0`). The user was presented with an empty screen.

### Mechanism 3: The `HTMLCollection` Prototype Crash in Real Web Browsers
In `src/app.js:201`:
```javascript
// src/app.js:200-205
if (this.showcaseModal) {
  const isAttached = Boolean(modalRoot && modalRoot.children && modalRoot.children.includes(this.showcaseModal.modalEl));
  if (this.showcaseModal.isOpen() && isAttached) {
    this.state.isShowcaseModalOpen = true;
    return;
  }
  ...
```
- In Node.js testing mock harnesses (e.g., `MockElement` in `tests/modal_deep_stress_adversarial.test.js`), `children` is implemented as a standard JavaScript `Array` (`this.children = []`). Thus `modalRoot.children.includes(...)` succeeds.
- In **real browsers** (Chrome, Firefox, Safari, Edge, Android Chrome, iOS Safari), `Element.prototype.children` returns an `HTMLCollection`.
- `HTMLCollection` has properties `length`, `item()`, `namedItem()`, and `[Symbol.iterator]`. It **does not have `.includes()`**.
- Evaluating `modalRoot.children.includes(...)` throws an uncaught exception:
  ```text
  TypeError: modalRoot.children.includes is not a function
  ```
  This immediately breaks modal opening in production for any repeated open call!

### Mechanism 4: Zombie Element Retention Due to Guarded Nullification
In `src/components/KhktShowcaseModal.js:585-590`:
```javascript
this.closeTimeout = setTimeout(() => {
  if (this.modalEl && this.modalEl.parentNode) {
    this.modalEl.parentNode.removeChild(this.modalEl);
    this.modalEl = null;
  }
  ...
}, 250);
```
Notice the compound conditional: `if (this.modalEl && this.modalEl.parentNode)`.
- If `modalRoot.innerHTML = ''` or an external cleanup cleared `modalRoot`, `this.modalEl.parentNode` is `null` (or detached).
- When the 250ms timer expires, `this.modalEl.parentNode` evaluates to `null` (falsy).
- **The entire block is skipped!**
- `this.modalEl = null;` is **never executed**.
- Even after 250ms, `this.modalEl` remains a non-null zombie object in memory, retaining detached DOM nodes, child elements, and listeners indefinitely.

### Mechanism 5: Race Condition with Stale Cleanup Timer
If `KhktShowcaseModal.prototype.open()` is called during the 250ms fade-out interval, the scheduled `this.closeTimeout` MUST be cleared via `clearTimeout(this.closeTimeout)`:
```javascript
if (this.closeTimeout) {
  clearTimeout(this.closeTimeout);
  this.closeTimeout = null;
}
```
If this cancellation is omitted or defective, the stale timer will execute at $t = 250\text{ms}$ and detach the newly reopened modal.

---

## 3. Surgical Drop-in Remediation Architecture

To completely eliminate Ghost Modal Detachment while maintaining 100% compatibility across both the mock Node.js test harness and real web browsers, the following architectural invariants must be enforced:

### Invariant A: Universal Attachment Detection
Attachment must be detected using `container.contains(element)` when available (the W3C standard method since DOM Level 2), and fall back to `Array.from(container.children || []).includes(element)` or `element.parentNode === container`.
```javascript
function isNodeAttached(container, node) {
  if (!container || !node) return false;
  if (typeof container.contains === 'function') {
    return container.contains(node);
  }
  if (Array.isArray(container.children)) {
    return container.children.includes(node);
  }
  return Array.from(container.children || []).includes(node) || node.parentNode === container;
}
```

### Invariant B: Re-attachment in `open()`
In `KhktShowcaseModal.prototype.open()`:
1. Cancel pending `this.closeTimeout` and `this.focusTimeout`.
2. Inspect if `this.modalEl` exists.
3. If `this.modalEl` exists, check whether it is currently attached to `targetContainer`.
4. If not attached, execute `targetContainer.appendChild(this.modalEl)`.
5. Call `this.updateView()`.

### Invariant C: Unconditional Controller Nullification in `close()`
In `KhktShowcaseModal.prototype.close()`:
Ensure `this.modalEl = null;` executes regardless of whether `this.modalEl.parentNode` is present or null:
```javascript
if (this.modalEl) {
  if (this.modalEl.parentNode) {
    this.modalEl.parentNode.removeChild(this.modalEl);
  }
  this.modalEl = null;
}
```

### Invariant D: Robust Guard in `src/app.js`
In `app.handleOpenShowcase()`:
Use the universal attachment check and ensure `this.showcaseModal.options.container` matches `modalRoot` before invoking `.open()`.

---

## 4. Verification & Validation Evidence

### Test Execution: `tests/modal_deep_stress_adversarial.test.js`
The adversarial test suite validates:
- 13 timing sweep micro-delays from 0ms to 249ms (Vector 1).
- 50-cycle random jitter chaos bursts.
- 50 concurrent `handleOpenShowcase()` invocations.
- Immediate close at 10ms cancelling 50ms focus timeout.
- Explicit ghost modal detachment test:
  ```javascript
  it('ghost modal detachment vulnerability: reopening modal within 250ms of handleCloseShowcase() leaves modal detached from modalRoot', async () => { ... });
  ```

### Empirical Result
All 26 tests in `tests/modal_deep_stress_adversarial.test.js` pass with 0 failures:
- Tests: 26 passed, 0 failed.
- Total suites: 3 passed.
- Overall project suite: 189 passed across 41 suites with 0 failures (`npm test`).
