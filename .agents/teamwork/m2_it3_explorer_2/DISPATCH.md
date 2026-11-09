# DISPATCH: Milestone M2 Iteration 3 Explorer 2 (State Inversion & Event Timing)

## Objective
Investigate and formulate an exact, surgical drop-in fix for State Inversion in `src/app.js` and `src/components/KhktShowcaseModal.js`.

## Inputs to Read
1. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md`
2. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md`
3. Target test: `tests/modal_deep_stress_adversarial.test.js` (inspect tests checking `app.state.isShowcaseModalOpen` during defensive modal close / reopen).
4. Source files: `src/app.js` and `src/components/KhktShowcaseModal.js`.

## Problem Description
In `src/app.js:handleOpenShowcase()`, when defensively closing a previous lingering instance (`this.showcaseModal.close()`), the modal dispatches `khkt:modal-closed` onto `window`. The window listener in `app.js:init()` receives this event and sets `this.state.isShowcaseModalOpen = false`.
If this event fires asynchronously or after `handleOpenShowcase()` sets `this.state.isShowcaseModalOpen = true`, it inverts the state: the modal is actively open in the DOM, but `app.state.isShowcaseModalOpen` is `false`!

## Deliverables
- Root cause analysis in `analysis.md`
- Exact drop-in replacement code / patch in `handoff.md`
- Verification commands for `node --test tests/modal_deep_stress_adversarial.test.js`


## 2026-11-09T03:01:33Z
You are Milestone M2 Iteration 3 Explorer 2 (m2_it3_explorer_2).
Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_2
Read:
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_it3_explorer_2/DISPATCH.md
- Target tests: /Users/mac/Desktop/math_english_ai_learn/tests/modal_deep_stress_adversarial.test.js
- Target source: /Users/mac/Desktop/math_english_ai_learn/src/app.js and /Users/mac/Desktop/math_english_ai_learn/src/components/KhktShowcaseModal.js

Investigate State Inversion:
In `src/app.js:handleOpenShowcase()`, closing a previous modal instance triggers `khkt:modal-closed` on `window`, which triggers `this.state.isShowcaseModalOpen = false`, leaving the state as `false` while the modal is open.
Formulate an exact, surgical drop-in fix for `src/app.js` and/or `src/components/KhktShowcaseModal.js`.
Document root cause in `analysis.md` and deliver full 5-component `handoff.md` with exact proposed replacement code.
Send a completion message when finished.
