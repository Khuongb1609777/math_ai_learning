## 2026-11-09T03:33:40Z
You are Milestone M3 Implementation Worker (`m3_worker`).
Working Directory: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_worker`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Reference Files:
1. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md` (MANDATORY: Read first)
2. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md` (Architecture, Milestones, Contracts)
3. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_explorer_1/handoff.md` (Full design & drop-in blueprint for `LessonPlayer.js` & `tests/lesson_player.test.js`)
4. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_explorer_2/handoff.md` (Full design & drop-in blueprint for `VocabularyTable.js` & `tests/vocabulary_table.test.js`)
5. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_explorer_3/handoff.md` (Full design & drop-in blueprint for `MathSimulations.js` & `tests/math_simulations.test.js`)
6. `/Users/mac/Desktop/math_english_ai_learn/src/services/speech.js` (Speech service)
7. `/Users/mac/Desktop/math_english_ai_learn/src/data/lessons.js` (Lesson datasets)

Target Files Owned Exclusively:
- `src/components/LessonPlayer.js`
- `src/components/VocabularyTable.js`
- `src/components/MathSimulations.js`
- `src/app.js` (Ensure clean integration when `activeTab === 'player'` or `app.loadLesson(id)`)
- `tests/lesson_player.test.js`
- `tests/vocabulary_table.test.js`
- `tests/math_simulations.test.js`

Your Tasks:
1. Implement `src/components/VocabularyTable.js` based on `m3_explorer_2/handoff.md`:
   - Interactive table with IPA phonetics, PoS badges, bilingual definitions (`vi`, `en`, `dual`), example sentences.
   - Web Speech API TTS audio with 0.85x pedagogical rate, sequence-token concurrency guard, and active playing indicator.
   - Search & PoS chip filters.
   - Export `VocabularyTable`, `escapeHtml`, `validateIpa`.
2. Implement `src/components/MathSimulations.js` based on `m3_explorer_3/handoff.md`:
   - Pure mathematical engines: `calculateLighthouse`, `calculateParabolicArch`, `calculateBusRevenue`.
   - 3 dynamic SVG parameter-driven simulations:
     * Simulation 1 (Lighthouse): auto-fitting viewBox, elevation angles $\alpha, \beta$, ray-tracer, Law of Sines and right-triangle trigonometry.
     * Simulation 2 (Parabolic Arch): $y = -0.375x^2 + 6$, vehicle dimensions (width 3m/4m, height 4.2m), lateral drift slider, tri-state clearance gauge (PASS, WARNING, COLLISION) with exact margin.
     * Simulation 3 (Bus Revenue): $R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000$, price step slider, vertex highlight at $x=4$ ($160{,}000\text{ VNĐ}$ fare, $12.8\text{M VNĐ}$ revenue), tangent slope readout.
   - Export `MathSimulations` class and pure math functions.
3. Implement `src/components/LessonPlayer.js` based on `m3_explorer_1/handoff.md`:
   - 5-Scene standardized workflow stepper: Scene 1 (Bối cảnh), Scene 2 (Dữ kiện), Scene 3 (Vấn đề & Từ vựng), Scene 4 (Gợi mở), Scene 5 (Thực hành).
   - Boundary clamping [1..5], direct step clicking, completion tracking.
   - Tri-state bilingual toggle (`vi`, `en`, `dual`) with subtitle and spoken narrative cards.
   - Dynamic integration: embeds `VocabularyTable` in Scene 3 and `MathSimulations` in Scenes 2 & 4.
   - Web Speech API read-aloud button for scene narration, keyboard arrow navigation (Left/Right) with input focus guard.
   - Scene 5 CTA to start worksheet (`quiz:start` / `onStartQuiz`).
4. Ensure `src/app.js` smoothly mounts and coordinates with `LessonPlayer` when selecting lessons from Explorer or navigating tabs.
5. Create comprehensive unit tests:
   - `tests/lesson_player.test.js`
   - `tests/vocabulary_table.test.js`
   - `tests/math_simulations.test.js`
6. Verify your implementation by running:
   - `node --check src/components/LessonPlayer.js src/components/VocabularyTable.js src/components/MathSimulations.js src/app.js`
   - `node --test tests/lesson_player.test.js`
   - `node --test tests/vocabulary_table.test.js`
   - `node --test tests/math_simulations.test.js`
   - `npm test`
   - `node tests/e2e/runner.js`
7. Produce a detailed Hard Handoff report in `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_worker/handoff.md` and send a message upon completion.
