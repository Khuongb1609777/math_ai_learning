# BRIEFING — 2026-11-09T03:28:30Z

## Mission
Investigate and design the Interactive Bilingual Vocabulary Table & Web Speech API TTS Audio component (`src/components/VocabularyTable.js`) and test suite (`tests/vocabulary_table.test.js`) for Milestone M3.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer, investigator, synthesizer
- Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_explorer_2
- Original parent: 87074200-71b1-4f5c-8806-1baad93026e9
- Milestone: M3

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify application source code
- Strictly adhere to .agents/teamwork workspace convention (write only to own directory)
- Provide concrete drop-in designs, edge cases, and test specifications

## Current Parent
- Conversation ID: 87074200-71b1-4f5c-8806-1baad93026e9
- Updated: 2026-11-09T03:28:30Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md` (R1-R5, KHKT standards)
  - `PROJECT.md` (Feature F5, Speech contracts, Milestone M3 layout)
  - `src/services/speech.js` (isSupported, speak, stop, speakTerm, voice selection, callbacks)
  - `src/data/lessons.js` (vocabulary items across Lessons 1, 2, 3: 7 items each with term, IPA, POS, definitionVi, definitionEn, exampleSentence)
  - `src/data/types.js` (VocabularyItem schema)
  - `src/components/Header.js`, `CollectionExplorer.js`, `app.js` (Component lifecycle, DOM mounting, event handling)
  - `public/assets/css/style.css` (existing `.vocab-table`, `.vocab-term`, `.vocab-ipa`, badges)
  - `tests/e2e/runner.js`, `tier1_features.test.js`, `tier2_boundaries.test.js` (speech testing patterns, mock speechSynthesis)
  - M3 Explorer 1 (`LessonPlayer.js` Scene 3 embedding) & Explorer 3 (`MathSimulations.js`)
- **Key findings**:
  - `speech.js` has comprehensive browser and mock fallback support with callbacks (`onStart`, `onEnd`, `onError`) and cancels in-flight utterances.
  - Vocabulary lists across all 3 default lessons are 100% complete and conform to IPA `/.../` formatting.
  - Integration with `LessonPlayer.js` occurs in Scene 3 (`problem`), but component also supports standalone and modal invocation.
  - Audio button requires visual pulse/equalizer animation during playback and immediate cancellation on scene switches or term re-clicks.
  - Comprehensive adversarial test suite is required to handle XSS escaping, IPA edge cases, rapid burst clicks, and filter matching.
- **Unexplored areas**: None for M3 Explorer 2 scope.

## Key Decisions Made
- Architecture: ES6 Class-based component `VocabularyTable` matching `Header.js` and `CollectionExplorer.js`.
- State Management: Internal reactive state with sequence token `_utteranceSeq` to prevent race condition callback bugs on rapid consecutive clicks.
- Visual Feedback: CSS animation on speaker button when playing, displaying active wave SVG or pulse ring.
- Responsive layout: Hybrid table (desktop) / card grid (mobile <768px).
- Test Strategy: Comprehensive Node.js native test suite `tests/vocabulary_table.test.js` covering rendering, language modes, search/filters, audio invocation, edge cases, and lifecycle.

## Artifact Index
- `DISPATCH.md` — dispatch record
- `progress.md` — liveness and execution heartbeat
- `BRIEFING.md` — persistent working memory
- `handoff.md` — full 5-component handoff report with drop-in code recommendations
