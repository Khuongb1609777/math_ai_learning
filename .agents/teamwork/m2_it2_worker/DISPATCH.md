## 2026-11-07T08:49:57Z
You are M2 It2 Implementation Worker (m2_it2_worker) working on Milestone M2 Iteration 2 of the KHKT Math-English CLIL Web App project.

Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_worker
You must read:
1. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_worker/DISPATCH.md
3. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_explorer_1/handoff.md
4. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_explorer_2/handoff.md
5. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_explorer_3/handoff.md

Your exclusive write ownership:
- src/components/KhktShowcaseModal.js
- src/app.js
- src/components/Header.js
Do NOT modify any other files (especially do NOT touch test files or other modules).

Task:
Apply the 3 surgical fixes identified by Explorers 1, 2, and 3:
1. Modal Lifecycle in src/components/KhktShowcaseModal.js:
   - Track this.closeTimeout and this.focusTimeout.
   - In open(tab): clear this.closeTimeout if active, track focusTimeout, prevent duplicate ESC listener bindings.
   - In close(): clear existing closeTimeout and focusTimeout, set this.closeTimeout = setTimeout(...), nullify on execution.
   - Add destroy() method.
2. Re-entrancy Guard & Backdrop Leak in src/app.js:
   - In init(): listen to 'khkt:modal-closed' to reset this.state.isShowcaseModalOpen = false.
   - In handleOpenShowcase(): add re-entrancy guard `if (this.state.isShowcaseModalOpen || (this.showcaseModal && this.showcaseModal.isOpen())) { return; }`. Defensively close lingering modal before new instance.
3. Cross-Component Language Sync in src/app.js & src/components/Header.js:
   - In src/app.js:
     * In init(): listen to 'app:language-change' to sync state.
     * In handleLanguageChange(lang): call `if (this.header && typeof this.header.setLanguage === 'function') { this.header.setLanguage(lang); }`.
   - In src/components/Header.js:
     * In constructor: bind this.handleAppLanguageChange.
     * In setLanguage(lang): add idempotency guard `if (this.language === lang && this.container && this.container.innerHTML) return;`.
     * In attachEventListeners(): listen to 'app:language-change'.
     * In destroy(): unlisten from 'app:language-change'.
     * In bindDOMEvents(): language button click calls `this.setLanguage(lang); this.onLanguageChange(lang);`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verification Requirements:
Run and report the exact results of:
1. `node --test tests/modal_state_adversarial.test.js` (Must pass all 25 tests)
2. `node --test tests/search_filter_adversarial.test.js` (Must pass all 33 tests)
3. `npm test` (Must pass all 146 unit & adversarial tests)
4. `node tests/e2e/runner.js` (Must pass all 175 tests with exit code 0)

Write your full report to /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it2_worker/handoff.md following the 5-component protocol (Observation, Logic Chain, Caveats, Conclusion, Verification).
Send a completion message when finished.
