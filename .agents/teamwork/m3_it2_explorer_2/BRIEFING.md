# BRIEFING — 2026-11-09T04:06:00Z

## Mission
Investigate child component lifecycle management and VocabularyTable window event listener accumulation in LessonPlayer.js, synthesize findings across peers, and formulate exact drop-in code fix for M3 iteration 2.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: explorer, synthesizer
- Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_2
- Original parent: 87074200-71b1-4f5c-8806-1baad93026e9
- Milestone: M3 Iteration 2

## 🔒 Key Constraints
- Read-only investigation — do NOT modify or write any source code files
- Write all findings, analyses, and handoff report inside /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_2/
- Formulate exact drop-in code fix with before/after line numbers for LessonPlayer.js

## Current Parent
- Conversation ID: 87074200-71b1-4f5c-8806-1baad93026e9
- Updated: 2026-11-09T04:03:55Z

## Investigation State
- **Explored paths**:
  - `src/components/LessonPlayer.js` (lines 110–135, 170–275, 584–605, 680–705, 750–800)
  - `src/components/VocabularyTable.js` (lines 80–95, 275–295)
  - `src/components/MathSimulations.js` (lines 1040–1048)
  - `src/services/speech.js` (lines 220–235)
  - `tests/m3_player_vocab_adversarial.test.js` (all 18 tests, especially 2.3, 4.4, 4.5, 4.6)
  - Peer reports: `m3_it2_explorer_1/handoff.md`, `m3_it2_explorer_3/handoff.md`
- **Key findings**:
  - Test 4.5 fails because `VocabularyTable` adds `'app:language-change'` to `window` on instantiation, but navigating away or re-visiting Scene 3 does not call `destroy()`, leaking orphaned listeners.
  - Test 4.4 & 4.6 fail because `speech.stop()` suppresses canceled errors and omits `onEnd`, leaving `isNarrationPlaying` dirty unless synchronously reset to `false`.
  - Reviewer Finding 2 validated: Guarding simulation stage with `(scene.interactiveType && [2, 4].includes(this.currentSceneId))` eliminates stuck simulation placeholder on Scene 3.
  - Test 2.3 compatibility requires calling `stopAudio()` before `destroy()` during cleanup.
- **Unexplored areas**: None. All root causes confirmed and verified.

## Key Decisions Made
- Recommending encapsulated `destroySubComponents()` helper in `LessonPlayer.js` called from `destroy()`, `goToScene()`, `setLesson()`, and `triggerStartWorksheet()`.
- Recommending explicit teardown of existing `vocabTableInstance` / `simulationInstance` at the entry of `mountDynamicSubComponents()` along with asynchronous navigation guard (`if (this.currentSceneId !== 3) return;`).

## Artifact Index
- `DISPATCH.md` — log of incoming orchestrator dispatches
- `BRIEFING.md` — persistent memory and state tracking
- `progress.md` — heartbeat and task status
- `lesson_player_lifecycle.patch` — reference diff patch
- `handoff.md` — comprehensive 5-component handoff report
