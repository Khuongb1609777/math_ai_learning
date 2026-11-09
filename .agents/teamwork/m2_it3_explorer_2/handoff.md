# Milestone M2 Iteration 3 Explorer 2 Handoff Report: State Inversion & Event Timing

**Agent**: Milestone M2 Iteration 3 Explorer 2 (`m2_it3_explorer_2`)  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_2`  
**Target Subject**: State Inversion & Event Timing in `src/app.js` and `src/components/KhktShowcaseModal.js`  
**Handoff Type**: Hard Handoff  

---

## 1. Observation

### 1.1 Direct Source Code Observations
1. **`src/app.js` lines 124–126**:
   ```javascript
   window.addEventListener('khkt:modal-closed', () => {
     this.state.isShowcaseModalOpen = false;
   });
   ```
   *Observation*: The window listener for `khkt:modal-closed` unconditionally assigns `this.state.isShowcaseModalOpen = false`. It does not inspect whether `this.showcaseModal.isOpen()` is true, nor does it check whether the event was dispatched by the active instance versus a previous or orphaned modal instance.

2. **`src/components/KhktShowcaseModal.js` lines 599–601**:
   ```javascript
   // Dispatch custom event
   window.dispatchEvent(new CustomEvent('khkt:modal-closed'));
   ```
   *Observation*: `close()` emits `khkt:modal-closed` without payload/detail, meaning all listeners receive an anonymous notification without identifying which instance initiated closure.

3. **`src/app.js` lines 200–212**:
   ```javascript
   if (this.showcaseModal) {
     const isAttached = Boolean(modalRoot && modalRoot.children && modalRoot.children.includes(this.showcaseModal.modalEl));
     if (this.showcaseModal.isOpen() && isAttached) {
       this.state.isShowcaseModalOpen = true;
       return;
     }
     this.state.isShowcaseModalOpen = true;
     if (this.showcaseModal.options.container !== modalRoot) {
       this.showcaseModal.options.container = modalRoot;
     }
     this.showcaseModal.open();
     return;
   }
   ```
   *Observation*: In prior worker iterations (`m2_it2_worker`), `handleOpenShowcase()` defensively executed `this.showcaseModal.close()` before opening or instantiating a new modal. Because `modal.close()` synchronously dispatches `khkt:modal-closed`, that call triggered the window event listener in `init()`, immediately flipping `this.state.isShowcaseModalOpen` back to `false` while the modal was being opened.

4. **`src/app.js` lines 270–279**:
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
   *Observation*: `handleCloseShowcase()` invokes `this.showcaseModal.close()`, which in turn schedules `this.options.onClose` inside a 250ms timeout. If `onClose` points back to `handleCloseShowcase()`, it triggers an asynchronous secondary call to `handleCloseShowcase()` 250ms later, which wipes `modalRoot.innerHTML = ''` and forces `this.state.isShowcaseModalOpen = false`.

### 1.2 Target Adversarial Test Verification
Execution of the deep stress adversarial suite:
```bash
node --test tests/modal_deep_stress_adversarial.test.js
```
Specifically in Suite 2 (`tests/modal_deep_stress_adversarial.test.js:622–669`):
```javascript
it('guarantees ESC key dismissal followed by rapid reopen (<250ms) does not corrupt root open state', async () => { ... });
```
Lines 645–649 assert:
```javascript
assert.equal(
  app.state.isShowcaseModalOpen,
  true,
  'STATE INVERSION VULNERABILITY DETECTED: In app.handleOpenShowcase(), calling this.showcaseModal.close() dispatched khkt:modal-closed, resetting app.state.isShowcaseModalOpen to false while reopening!'
);
```

---

## 2. Logic Chain

1. **Premise 1 (Event Dispatch Timing)**: `window.dispatchEvent(new CustomEvent('khkt:modal-closed'))` is an in-process, synchronous dispatch. Any listener registered via `window.addEventListener('khkt:modal-closed', ...)` executes immediately on the same call stack before the dispatching function returns.
2. **Premise 2 (Defensive Close Flaw)**: If `handleOpenShowcase()` attempts to clean up a prior instance by calling `this.showcaseModal.close()`, this triggers `'khkt:modal-closed'`.
3. **Premise 3 (State Inversion Mechanism)**:
   - When `handleOpenShowcase()` sets `this.state.isShowcaseModalOpen = true`, but then invokes `close()` on a lingering instance, the synchronous event listener in `init()` executes `this.state.isShowcaseModalOpen = false`.
   - The method then calls `this.showcaseModal.open()`, which mounts/shows the modal in `#modal-root`.
   - Result: The modal is physically attached and open in the DOM, but `this.state.isShowcaseModalOpen` is `false`.
4. **Premise 4 (Stale Event / Race Protection)**:
   - Even if `handleOpenShowcase()` avoids calling `close()`, an asynchronous close event or delayed timer callback from an earlier close interaction (e.g., user pressed ESC 200ms ago) could arrive while a newly opened modal is active.
   - If the window event listener blindly sets `this.state.isShowcaseModalOpen = false` without checking `this.showcaseModal.isOpen()`, state inversion will occur.
5. **Conclusion**:
   - `handleOpenShowcase()` must never call `this.showcaseModal.close()`; instead, it must re-use the existing instance and call `this.showcaseModal.open()`.
   - The `'khkt:modal-closed'` listener in `app.js:init()` must guard against active modal state: if `this.showcaseModal && this.showcaseModal.isOpen()`, it must NOT set `this.state.isShowcaseModalOpen = false`.
   - `KhktShowcaseModal:close()` must dispatch `{ detail: { modal: this } }` so listeners can ignore events from orphaned or superseded instances.

---

## 3. Caveats

- **Scope Boundary**: This investigation specifically addresses State Inversion and Event Timing. Asynchronous dynamic import locking is handled by Explorer 3, and `#modal-root` DOM detachment handling is handled by Explorer 1.
- **Node.js Mock DOM**: In the Node test runner, `requestAnimationFrame` is simulated using `setTimeout(cb, 0)`. All state transitions must be resilient to both microtask and macrotask interleaving.
- **No Caveats on Feasibility**: The proposed solution consists of pure standard JavaScript without external dependencies and requires no schema or API contract changes.

---

## 4. Conclusion & Exact Proposed Surgical Fix

### 4.1 Summary of Changes
1. In `src/app.js:init()`: Add guards to `'khkt:modal-closed'` to prevent state inversion when the modal is open or when an event originates from a stale instance.
2. In `src/app.js:handleOpenShowcase()`: Re-use `this.showcaseModal` directly via `this.showcaseModal.open()` without invoking `this.showcaseModal.close()`.
3. In `src/app.js`: Ensure `onClose` callback in `KhktShowcaseModal` constructor options is a non-recursive, state-safe handler (`() => { if (!this.showcaseModal || !this.showcaseModal.isOpen()) { this.state.isShowcaseModalOpen = false; } }`).
4. In `src/components/KhktShowcaseModal.js:close()`: Include `{ detail: { modal: this } }` in `khkt:modal-closed`.

---

### 4.2 Exact Proposed Drop-In Patches

#### Patch 1: `src/app.js` (Window Event Listener in `init()`)
**Target File**: `src/app.js`  
**Line Range**: 124–127

```javascript
// BEFORE (Lines 124-126):
    window.addEventListener('khkt:modal-closed', () => {
      this.state.isShowcaseModalOpen = false;
    });

// AFTER (Drop-in Replacement):
    window.addEventListener('khkt:modal-closed', (e) => {
      // Ignore close events from superseded/orphaned modal instances
      if (e?.detail?.modal && this.showcaseModal && e.detail.modal !== this.showcaseModal) {
        return;
      }
      // Guard against state inversion: do not set false if active modal is open
      if (this.showcaseModal && this.showcaseModal.isOpen()) {
        return;
      }
      this.state.isShowcaseModalOpen = false;
    });
```

#### Patch 2: `src/app.js` (Constructor Options in `handleOpenShowcase()`)
**Target File**: `src/app.js`  
**Line Range**: 240–248

```javascript
// BEFORE (Lines 240-246):
        if (!this.showcaseModal) {
          this.showcaseModal = new KhktShowcaseModal({
            container: modalRoot,
            language: this.state.language,
            onClose: this.handleCloseShowcase
          });
          this.showcaseModal.mount(modalRoot);
        }

// AFTER (Drop-in Replacement):
        if (!this.showcaseModal) {
          this.showcaseModal = new KhktShowcaseModal({
            container: modalRoot,
            language: this.state.language,
            onClose: () => {
              if (!this.showcaseModal || !this.showcaseModal.isOpen()) {
                this.state.isShowcaseModalOpen = false;
              }
            }
          });
          this.showcaseModal.mount(modalRoot);
        }
```

#### Patch 3: `src/components/KhktShowcaseModal.js` (`close()` Event Dispatch)
**Target File**: `src/components/KhktShowcaseModal.js`  
**Line Range**: 599–601

```javascript
// BEFORE (Line 600):
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-closed'));

// AFTER (Drop-in Replacement):
    // Dispatch custom event with originating instance reference
    window.dispatchEvent(new CustomEvent('khkt:modal-closed', { detail: { modal: this } }));
```

---

## 5. Verification Method

To independently verify that State Inversion is completely eliminated:

1. **Adversarial Deep Stress Test**:
   ```bash
   node --test tests/modal_deep_stress_adversarial.test.js
   ```
   *Expected Outcome*: 26/26 tests pass across all 3 suites, including the ESC key dismissal followed by rapid reopen test.

2. **Modal State Adversarial Test**:
   ```bash
   node --test tests/modal_state_adversarial.test.js
   ```
   *Expected Outcome*: 25/25 tests pass across all 5 suites.

3. **Full Project Test Suite**:
   ```bash
   npm test
   ```
   *Expected Outcome*: 189/189 tests pass across 41 suites, 0 failures.

4. **Full E2E Test Suite**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected Outcome*: 175/175 tests pass across Tiers 1–4, exit code 0.

5. **Syntax Validation**:
   ```bash
   node --check src/app.js src/components/KhktShowcaseModal.js
   ```
   *Expected Outcome*: Exit code 0, zero syntax errors.
