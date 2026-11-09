## 2026-11-09T03:46:51Z
You are Milestone M3 Challenger 2 (`m3_challenger_2`).
Working Directory: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_challenger_2`

Mission:
Adversarially challenge and stress-test state synchronization, audio concurrency, and rapid lifecycle transitions in `src/components/LessonPlayer.js` and `src/components/VocabularyTable.js`.

Context & Reference Files:
1. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md` (MANDATORY: Read first)
2. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md` (Features F3, F4, F5)
3. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_worker/handoff.md` (Worker implementation report)
4. `/Users/mac/Desktop/math_english_ai_learn/src/components/LessonPlayer.js` (Target file under attack)
5. `/Users/mac/Desktop/math_english_ai_learn/src/components/VocabularyTable.js` (Target file under attack)
6. `/Users/mac/Desktop/math_english_ai_learn/src/services/speech.js` (Speech service)
7. `/Users/mac/Desktop/math_english_ai_learn/tests/lesson_player.test.js`
8. `/Users/mac/Desktop/math_english_ai_learn/tests/vocabulary_table.test.js`

Adversarial Stress Tasks:
1. Web Speech API Concurrency & Race Conditions:
   - Rapidly click different vocabulary items in `VocabularyTable`: verify that previous utterances are cancelled immediately and sequence token `_utteranceSeq` prevents canceled callbacks from resetting the active playing indicator.
   - Rapidly click scene narration read-aloud button: ensure no audio overlapping.
2. Stepper Boundary & Rapid Jumping:
   - Rapid alternating scene navigation: 50 fast jumps across scenes 1 to 5. Verify that `currentSceneId` stays within `[1..5]`.
   - Verify that jumping away from Scene 3 immediately stops vocabulary speech.
   - Rapid keyboard arrow navigation while an input element has focus: verify keystrokes are NOT hijacked.
3. Language Thrashing & Bi-directional State Sync:
   - Rapidly cycle language modes `vi` -> `en` -> `dual` -> `vi` via `setLanguage()` and window event `app:language-change`: verify 0 infinite event loops, 0 stack overflows, and all subtitle cards/glossaries reflect the chosen mode.
4. Lifecycle Teardown:
   - Verify `destroy()` unbinds all keyboard and window listeners, stops audio completely, and destroys child components cleanly.
5. Author an adversarial test script or execute stress assertions.
6. Run independent verification:
   - `node --test tests/lesson_player.test.js tests/vocabulary_table.test.js`
   - `npm test`
   - `node tests/e2e/runner.js`
7. Write your adversarial report with an explicit verdict (**APPROVE** or **REJECT**) to:
   `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_challenger_2/handoff.md`
   and notify caller via send_message.
