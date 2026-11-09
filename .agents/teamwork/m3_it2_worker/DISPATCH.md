## 2026-11-09T04:06:14Z
You are the Milestone M3 Iteration 2 Remediation Worker (teamwork_worker).
Your working directory is /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_worker.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read:
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_worker/DISPATCH.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_1/handoff.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_2/handoff.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_3/handoff.md
- /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_3/proposed_LessonPlayer.patch

Target File Ownership:
You have exclusive write ownership over `/Users/mac/Desktop/math_english_ai_learn/src/components/LessonPlayer.js`.

Objectives:
1. Apply the synthesized remediation changes to `src/components/LessonPlayer.js`:
   - In `destroy()`: add `this.isNarrationPlaying = false;` and invoke `this.destroySubComponents();`.
   - Implement `destroySubComponents()` method to safely call `stopAudio()` then `destroy()` on `this.vocabTableInstance`, setting it to null, and `destroy()` on `this.simulationInstance`, setting it to null.
   - In `setLesson(lessonId)`: add `speech.stop();`, `this.isNarrationPlaying = false;`, and call `this.destroySubComponents();`.
   - In `goToScene(sceneId)`: add `speech.stop();`, `this.isNarrationPlaying = false;`, and call `this.destroySubComponents();`.
   - In `triggerStartWorksheet()`: add `speech.stop();`, `this.isNarrationPlaying = false;`, and call `this.destroySubComponents();`.
   - In `render()` line 585: update simulation container rendering to `${(scene.interactiveType && [2, 4].includes(this.currentSceneId)) ? ... : ''}`.
   - In `mountDynamicSubComponents()`: clean up previous subcomponents, and add async navigation race condition guards (`if (this.currentSceneId !== 3) return;` / `if (![2, 4].includes(this.currentSceneId)) return;`).
2. Run validation commands:
   - `node --check src/components/LessonPlayer.js`
   - `node --test tests/m3_player_vocab_adversarial.test.js` (MUST pass 18/18 with zero failures)
   - `node --test tests/lesson_player.test.js tests/vocabulary_table.test.js tests/math_simulations.test.js`
   - `npm test` (MUST pass all 298 tests)
   - `node tests/e2e/runner.js` (MUST pass 175/175 tests)
3. Write your completion report to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_worker/handoff.md`.
When done, send a message to the orchestrator.
