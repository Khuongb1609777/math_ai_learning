# Milestone M3 Adversarial Challenge Report: Player & Vocabulary Stress Testing

**Challenger**: Milestone M3 Challenger 2 (`m3_challenger_2`)  
**Parent / Caller**: Orchestrator (`87074200-71b1-4f5c-8806-1baad93026e9`)  
**Target Files**: `src/components/LessonPlayer.js`, `src/components/VocabularyTable.js`, `src/services/speech.js`  
**Test Harness**: `tests/m3_player_vocab_adversarial.test.js`  
**Date**: 2026-11-09T03:55:00Z  
**Verdict**: **REJECT**

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

While `VocabularyTable.js` successfully demonstrated robust concurrency protection via its sequence token (`_utteranceSeq`) and `LessonPlayer.js` successfully handles stepper boundary clamping and keyboard focus guards, empirical stress testing revealed **three critical state desynchronization and event listener leakage defects in `LessonPlayer.js`** that break interactive audio controls and cause unbounded memory/listener leaks upon repeated navigation.

---

## 1. Observation

### 1.1 Empirical Test Execution & Failure Outputs
The adversarial stress harness `tests/m3_player_vocab_adversarial.test.js` was executed via `node --test tests/m3_player_vocab_adversarial.test.js`:

```text
▶ Vector 4: Lifecycle Teardown & Event Listener Integrity
  ✔ 4.1 destroy() detaches all window event listeners (keydown, app:language-change) and clears container (1.393331ms)
  ✔ 4.2 destroy() cancels ongoing speech audio immediately (1.43558ms)
  ✔ 4.3 Re-entering Scene 3 repeatedly does not cause unhandled listener errors when language change is dispatched (165.54005ms)
  ✖ 4.4 Changing lesson via setLesson() terminates previous audio and resets isNarrationPlaying (6.593236ms)
    AssertionError [ERR_ASSERTION]: isNarrationPlaying must be reset to false when switching lesson
    
    true !== false
    
        at TestContext.<anonymous> (file:///Users/mac/Desktop/math_english_ai_learn/tests/m3_player_vocab_adversarial.test.js:746:14)

  ✖ 4.5 Repeatedly visiting Scene 3 does NOT leak VocabularyTable event listeners on window (47.662353ms)
    AssertionError [ERR_ASSERTION]: Re-visiting Scene 3 must NOT leak duplicate listeners on window; got 3
    
    3 !== 2
    
        at TestContext.<anonymous> (file:///Users/mac/Desktop/math_english_ai_learn/tests/m3_player_vocab_adversarial.test.js:770:14)

  ✖ 4.6 triggerStartWorksheet() terminates narration speech and resets isNarrationPlaying (3.967912ms)
    AssertionError [ERR_ASSERTION]: isNarrationPlaying must be reset to false when launching worksheet
    
    true !== false
    
        at TestContext.<anonymous> (file:///Users/mac/Desktop/math_english_ai_learn/tests/m3_player_vocab_adversarial.test.js:786:14)

ℹ tests 18
ℹ suites 5
ℹ pass 15
ℹ fail 3
```

### 1.2 Exact Code Inspection Findings

#### Defect 1: State Desync in `LessonPlayer.setLesson()`
In `src/components/LessonPlayer.js` (lines 201–211):
```javascript
201:   setLesson(lessonId) {
202:     speech.stop();
203:     if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
204:       this.vocabTableInstance.stopAudio();
205:     }
206:     this.lesson = this.resolveLesson(lessonId);
207:     this.currentSceneId = 1;
208:     this.completedScenes = new Set([1]);
209:     this.render();
210:     this.onSelectLesson(this.lesson.id);
211:   }
```
*Observation*: `speech.stop()` cancels browser audio playback. In `src/services/speech.js` (line 228), cancel events are ignored (`if (event && event.error !== 'canceled')`), meaning neither `onEnd` nor `onError` is ever dispatched to `LessonPlayer`. Contrast this with `goToScene()` (line 222), which explicitly sets `this.isNarrationPlaying = false;`. Because `setLesson()` omits this reset, `this.isNarrationPlaying` remains `true` while the re-rendered toolbar button displays the idle "Listen" text.

#### Defect 2: State Desync in `LessonPlayer.triggerStartWorksheet()`
In `src/components/LessonPlayer.js` (lines 260–271):
```javascript
260:   triggerStartWorksheet() {
261:     speech.stop();
262:     if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
263:       this.vocabTableInstance.stopAudio();
264:     }
265:     if (typeof this.onStartQuiz === 'function') {
266:       this.onStartQuiz(this.lesson.id);
267:     }
268:     if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
269:       window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: this.lesson.id } }));
270:     }
271:   }
```
*Observation*: `this.isNarrationPlaying` is never reset to `false` when launching the worksheet from Scene 5.

#### Defect 3: Window Event Listener & Memory Leak upon Scene 3 Re-entry
In `src/components/LessonPlayer.js` (lines 751–774):
```javascript
751:   async mountDynamicSubComponents() {
752:     if (!this.container || typeof this.container.querySelector !== 'function') return;
753: 
754:     // 1. Mount VocabularyTable in Scene 3
755:     if (this.currentSceneId === 3) {
756:       const vocabMount = this.container.querySelector('.vocabulary-table-mount-point');
757:       if (vocabMount) {
758:         try {
759:           const mod = await import('./VocabularyTable.js');
760:           const VocabTableClass = mod.VocabularyTable || mod.default;
761:           if (VocabTableClass) {
762:             this.vocabTableInstance = new VocabTableClass({
763:               vocabulary: this.lesson.vocabulary || [],
764:               language: this.language,
765:               container: vocabMount
766:             });
767:             this.vocabTableInstance.mount(vocabMount);
768:             return;
769:           }
```
In `src/components/VocabularyTable.js` (lines 87–92):
```javascript
87:     if (this.targetWindow && typeof this.targetWindow.addEventListener === 'function') {
88:       this.targetWindow.addEventListener('app:language-change', this._appLanguageHandler);
89:       if (this.mode === 'modal') {
90:         this.targetWindow.addEventListener('keydown', this._handleKeyDown);
91:       }
92:     }
```
*Observation*: Every time Scene 3 is entered, a new `VocabTableClass` is constructed, attaching an `app:language-change` listener to `window`. When moving to another scene (e.g. Scene 2 or 4), the existing `this.vocabTableInstance` is NOT destroyed, nor is it destroyed before creating a replacement on line 762. Each visit to Scene 3 permanently leaks an orphaned `VocabularyTable` listener on `window`. When `LessonPlayer.destroy()` is called (lines 116–119), only the most recent reference is cleaned up, leaving all previously created instances permanently leaked.

---

## 2. Logic Chain

1. **Audio State Lifecycle desynchronization**:
   - Web Speech API speech cancellation via `speechSynthesis.cancel()` aborts utterances without invoking normal completion callbacks (`onend`).
   - `LessonPlayer` correctly recognized this in `goToScene()` (line 222) by manually executing `this.isNarrationPlaying = false;`.
   - However, in `setLesson()` (lines 201–211) and `triggerStartWorksheet()` (lines 260–271), `speech.stop()` was called without resetting `this.isNarrationPlaying = false;`.
   - Consequence: When a user switches lessons via the dropdown while listening to narration, `this.isNarrationPlaying` remains `true`. The UI button renders "Listen", but clicking it invokes `toggleNarrationSpeech()`, which sees `this.isNarrationPlaying === true`, resets the flag to `false`, and returns without speaking. The user is forced to click twice to hear narration.

2. **Component Lifecycle & Listener Accumulation**:
   - `VocabularyTable` registers a global listener on `window` for `'app:language-change'`.
   - `LessonPlayer` re-renders and re-instantiates child components dynamically when switching scenes.
   - Because `this.vocabTableInstance` is not destroyed upon leaving Scene 3 or before instantiating a new instance in `mountDynamicSubComponents()`, $N$ visits to Scene 3 produce $N$ live instances attached to `window`.
   - Consequence: As users navigate through the lesson, memory leaks accumulate. When language is switched, $N$ separate instances run updates on detached DOM nodes, leading to degraded performance and potential zombie handler conflicts.

---

## 3. Challenges

### [High] Challenge 1: Narration Button Desync on Lesson Change
- **Assumption Challenged**: Calling `speech.stop()` is sufficient to terminate audio and reset component state.
- **Attack Scenario**: Play narration on Lesson 1 -> switch to Lesson 2 -> click narration button.
- **Blast Radius**: First click on the narration button in the new lesson fails silently; user experience feels unresponsive.
- **Mitigation**: Add `this.isNarrationPlaying = false;` in `LessonPlayer.prototype.setLesson` and `triggerStartWorksheet`.

### [High] Challenge 2: Zombie VocabularyTable Listeners on Scene Navigation
- **Assumption Challenged**: GC cleans up child components when parent HTML is overwritten.
- **Attack Scenario**: Jump between Scene 2 and Scene 3 multiple times; dispatch `app:language-change`.
- **Blast Radius**: Memory leak; $N$ unmanaged instances of `VocabularyTable` attached to `window`; zombie render cycles on detached DOM elements.
- **Mitigation**: In `mountDynamicSubComponents()` or `goToScene()`, explicitly call `if (this.vocabTableInstance) { this.vocabTableInstance.destroy(); this.vocabTableInstance = null; }` before instantiating a new child component.

---

## 4. Stress Test Results Summary

| # | Stress Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1.1 | Rapid vocabulary item clicks (5 items in tight sequence) | Previous utterances canceled, only 1 active, concurrency = 1 | Cancelled immediately, max concurrency = 1 | **PASS** |
| 1.2 | Delayed `canceled` callback after rapid item switch | `_utteranceSeq` prevents canceled callback from clearing newer `playingIndex` | Sequence token guarded, `playingIndex` preserved | **PASS** |
| 1.3 | Toggle audio on active vocabulary item | Immediate stop, no double-play | Stopped cleanly | **PASS** |
| 1.4 | Rapid narration button clicks (10 toggles) | Clean toggle, even toggles stop, no overlapping | State maintained, no overlap | **PASS** |
| 2.1 | 50 chaotic boundary jumps (<1, >5, NaN, floats) | Clamped strictly in `[1..5]` | All 50 jumps strictly in `[1..5]` | **PASS** |
| 2.2 | Visited scene tracking | Correct `completedScenes` set | Set accurately records visited scenes | **PASS** |
| 2.3 | Jump away from Scene 3 during vocab playback | Vocab audio stopped immediately | Audio stopped | **PASS** |
| 2.4 | Arrow navigation while `<input>`/`<select>`/`<textarea>` focused | Keystrokes not hijacked, scene unchanged | Input focus guard preserved | **PASS** |
| 3.1 | 50 rapid `setLanguage()` cycles (`vi` -> `en` -> `dual`) | 0 stack overflows, correct mode | Clean synchronization | **PASS** |
| 3.2 | 30 external `app:language-change` window events | 0 infinite loops, correct mode | Clean synchronization | **PASS** |
| 3.3 | Subtitle card presence in VI, EN, DUAL modes | Strictly matching cards rendered | Matching cards only | **PASS** |
| 3.4 | Vocab definition language updates | Content matches selected mode | Cleanly updated | **PASS** |
| 4.1 | `destroy()` listener and DOM teardown | Detached from `window`, HTML cleared | Clean unbind | **PASS** |
| 4.2 | `destroy()` terminates active narration audio | `speechSynthesis` canceled | Speech stopped | **PASS** |
| 4.3 | Repeated Scene 3 visits with language change | No crash on event dispatch | Does not crash | **PASS** |
| 4.4 | Lesson switch via `setLesson()` terminates speech & resets flag | `isNarrationPlaying === false` | **`isNarrationPlaying === true` (FAILED)** | **FAIL** |
| 4.5 | Re-visiting Scene 3 does not leak window listeners | Listener count remains 2 | **Listener count increments to 3 (FAILED)** | **FAIL** |
| 4.6 | `triggerStartWorksheet()` resets `isNarrationPlaying` | `isNarrationPlaying === false` | **`isNarrationPlaying === true` (FAILED)** | **FAIL** |

**Summary**: 15 PASS, 3 FAIL out of 18 adversarial stress tests.

---

## 5. Caveats

- **Autoplay Security Policy**: Modern browsers restrict `speechSynthesis` without direct user gesture. All tests operated with simulated click events matching user actions.
- **No Implementation Modification**: In strict accordance with the Empirical Challenger rules, no modifications to `src/components/LessonPlayer.js` or `src/components/VocabularyTable.js` were made. All findings must be addressed by the implementation worker (`m3_worker`).

---

## 6. Conclusion & Actionable Recommendations

### Verdict: **REJECT**

Milestone M3 cannot be approved in its current state due to the 3 reproducible defects in `LessonPlayer.js`.

### Required Worker Fixes:
1. **In `src/components/LessonPlayer.js` line 205 (`setLesson`)**:
   Add `this.isNarrationPlaying = false;`.
2. **In `src/components/LessonPlayer.js` line 264 (`triggerStartWorksheet`)**:
   Add `this.isNarrationPlaying = false;`.
3. **In `src/components/LessonPlayer.js` lines 754–774 (`mountDynamicSubComponents`)**:
   Before creating a new `VocabTableClass` or `SimulationClass`, destroy any existing instance:
   ```javascript
   if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
     this.vocabTableInstance.destroy();
     this.vocabTableInstance = null;
   }
   ```
   Similarly, clean up `simulationInstance` if it exists.

---

## 7. Verification Method

To independently verify and reproduce these findings:

1. **Run Dedicated Adversarial Test Suite**:
   ```bash
   node --test tests/m3_player_vocab_adversarial.test.js
   ```
   *Current Result*: 15 passed, 3 failed (`4.4`, `4.5`, `4.6`).
   *Expected After Fix*: 18 passed, 0 failed.

2. **Run Existing Component Tests**:
   ```bash
   node --test tests/lesson_player.test.js tests/vocabulary_table.test.js
   ```
   *Result*: 31 passed.

3. **Run E2E Suite**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Result*: 175 passed.
