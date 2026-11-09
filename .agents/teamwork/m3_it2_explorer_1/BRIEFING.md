# BRIEFING — 2026-11-09T04:02:00Z

## Mission
Investigate speech audio narration state desynchronization in LessonPlayer.js and formulate precise code fix.

## 🔒 My Identity
- Archetype: explorer
- Roles: teamwork_explorer
- Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_1
- Original parent: 87074200-71b1-4f5c-8806-1baad93026e9
- Milestone: M3 Iteration 2

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify or write any source code files

## Current Parent
- Conversation ID: 87074200-71b1-4f5c-8806-1baad93026e9
- Updated: 2026-11-09T04:02:00Z

## Investigation State
- **Explored paths**:
  - `src/components/LessonPlayer.js` (lines 1-853)
  - `src/services/speech.js` (lines 1-314)
  - `src/components/VocabularyTable.js` (lifecycle, destroy, audio)
  - `src/components/MathSimulations.js` (lifecycle, destroy)
  - `tests/m3_player_vocab_adversarial.test.js` (vectors 1-4)
  - `tests/lesson_player.test.js`
  - `.agents/teamwork/m3_challenger_2/handoff.md`
- **Key findings**:
  1. `speech.js` suppresses `onError` when `event.error === 'canceled'`. Calling `speech.stop()` never fires `onEnd` or `onError` callbacks.
  2. `LessonPlayer.prototype.setLesson()` (line 202) calls `speech.stop()`, but fails to reset `this.isNarrationPlaying = false;`.
  3. `LessonPlayer.prototype.triggerStartWorksheet()` (line 261) calls `speech.stop()`, but fails to reset `this.isNarrationPlaying = false;`.
  4. `LessonPlayer.prototype.destroy()` (line 115) and `btn-back-explorer.onclick` (line 691) also call `speech.stop()` without resetting `this.isNarrationPlaying = false;`.
  5. `mountDynamicSubComponents()` (lines 751-798) instantiates new `VocabTableClass` without destroying existing `this.vocabTableInstance`, causing duplicate `app:language-change` window listeners (failing test 4.5).
  6. In `goToScene()`, `this.isNarrationPlaying = false;` is already present (line 222).
- **Unexplored areas**: None. Complete coverage achieved across all navigation and speech cancellation codepaths.

## Key Decisions Made
- Formulate exact before/after line-number patch for `LessonPlayer.js` resolving all 3 failures (4.4, 4.5, 4.6).
- Document all 5 speech cancellation paths (`setLesson`, `triggerStartWorksheet`, `goToScene`, `destroy`, `bindDOMEvents/onBack`).

## Artifact Index
- `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_1/handoff.md` — 5-component handoff report
- `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_1/lesson_player_narration_fix.patch` — Unified diff patch for worker
