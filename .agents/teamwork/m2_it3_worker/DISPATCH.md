# DISPATCH: Milestone M2 Iteration 3 Implementation Worker (m2_it3_worker)

## Objective
Implement the surgical fixes synthesized from Explorers 1, 2, and 3 to eliminate the 3 deep stress vulnerabilities uncovered by Challenger 2:
1. Ghost Modal Detachment under rapid open-close-open (<250ms).
2. State Inversion under close event dispatching and window listener timing.
3. In-flight dynamic import async re-entrancy and stacked backdrops.

Verify that all 26 tests in `tests/modal_deep_stress_adversarial.test.js`, all 25 tests in `tests/modal_state_adversarial.test.js`, all 33 tests in `tests/search_filter_adversarial.test.js`, all 189 unit tests in `npm test`, and all 175 E2E tests in `node tests/e2e/runner.js` pass with 100% success.

## Scope & File Write Ownership
You have exclusive write ownership of:
- `src/app.js`
- `src/components/KhktShowcaseModal.js`

Do NOT modify any other files (especially do NOT touch test files or other modules).

## Explorer Reports & Exact Fix Details
Read:
1. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_1/handoff.md`
2. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_2/handoff.md`
3. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_3/handoff.md` and `proposed_app_dynamic_import_lock.patch`

### Key Implementations:
1. **In `src/app.js`**:
   - In `init()`: Update `khkt:modal-closed` listener:
     ```javascript
     window.addEventListener('khkt:modal-closed', (e) => {
       if (e?.detail?.modal && this.showcaseModal && e.detail.modal !== this.showcaseModal) return;
       if (this.showcaseModal && this.showcaseModal.isOpen()) return;
       this.state.isShowcaseModalOpen = false;
     });
     ```
   - In `handleOpenShowcase()`:
     - Implement 4-tier guard: (1) check `this.showcaseModal` + safe DOM attachment (`typeof modalRoot.contains === 'function' ? modalRoot.contains(this.showcaseModal.modalEl) : ...`); (2) class cache `this._KhktShowcaseModalClass`; (3) in-flight import promise coalescing `this._showcaseImportPromise` with `try/catch` error boundary; (4) primary import initiator with mid-flight cancellation check.
     - Ensure `onClose` callback in `KhktShowcaseModal` options does not cause recursive re-entrancy:
       ```javascript
       onClose: () => {
         if (!this.showcaseModal || !this.showcaseModal.isOpen()) {
           this.state.isShowcaseModalOpen = false;
         }
       }
       ```
     - NEVER call `this.showcaseModal.close()` inside `handleOpenShowcase()`.
   - In `handleCloseShowcase()`:
     - Close `this.showcaseModal.close()`. Do NOT wipe `modalRoot.innerHTML = ''` synchronously (or ensure `KhktShowcaseModal.open()` re-appends `this.modalEl` if detached).

2. **In `src/components/KhktShowcaseModal.js`**:
   - In `open(tab)`:
     - Cancel pending `this.closeTimeout` if active.
     - If `this.modalEl` exists, check attachment to container; if detached, call `targetContainer.appendChild(this.modalEl)`.
   - In `close()`:
     - Cancel existing `this.closeTimeout` and `this.focusTimeout`.
     - In 250ms timeout callback: ensure `this.modalEl = null;` executes unconditionally even if `parentNode` is null.
     - In `window.dispatchEvent`: include `{ detail: { modal: this } }`.
   - In `destroy()`:
     - Full teardown of `closeTimeout`, `focusTimeout`, `openRafId`, keydown listener, body overflow, DOM node, and singleton reference.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification Requirements
Run and report the exact outputs of:
1. `node --test tests/modal_deep_stress_adversarial.test.js` (All 26 tests must PASS)
2. `node --test tests/modal_state_adversarial.test.js` (All 25 tests must PASS)
3. `node --test tests/search_filter_adversarial.test.js` (All 33 tests must PASS)
4. `npm test` (All 189 unit & adversarial tests must PASS)
5. `node tests/e2e/runner.js` (All 175 tests must PASS with exit code 0)

Write your full report to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_worker/handoff.md`.


## 2026-11-09T03:09:04Z
You are Milestone M2 Iteration 3 Implementation Worker (m2_it3_worker).

Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_worker
Read:
1. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_worker/DISPATCH.md
3. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_1/handoff.md
4. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_2/handoff.md
5. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_3/handoff.md

Exclusive Write Ownership:
- src/app.js
- src/components/KhktShowcaseModal.js
Do NOT modify any other files (especially do NOT touch test files or other modules).

Tasks:
1. In src/app.js:
   - In init(): update khkt:modal-closed listener with modal instance check and isOpen() guard to prevent state inversion.
   - In handleOpenShowcase(): implement 4-tier guard (existing instance + safe contains check, module class cache this._KhktShowcaseModalClass, in-flight import promise coalescing with try/catch, primary import initiator with mid-flight cancellation check).
   - In handleOpenShowcase(): set onClose option to safe non-recursive handler. Never defensively call this.showcaseModal.close() inside handleOpenShowcase().
   - In handleCloseShowcase(): call this.showcaseModal.close(); do not call modalRoot.innerHTML = ''.
2. In src/components/KhktShowcaseModal.js:
   - In open(tab): cancel this.closeTimeout; if this.modalEl exists and is detached from targetContainer, append it.
   - In close(): cancel existing closeTimeout and focusTimeout; in 250ms callback ensure this.modalEl = null executes unconditionally; dispatch khkt:modal-closed with detail: { modal: this }.
   - In destroy(): clean up closeTimeout, focusTimeout, openRafId, keydown listener, body overflow, remove DOM node, nullify singleton instance.
