# Milestone M3 Iteration 2 Investigation Report: Narration Audio State Desynchronization

**Investigator**: M3 It2 Narration State Explorer (`m3_it2_explorer_1`)  
**Parent / Caller**: Orchestrator (`87074200-71b1-4f5c-8806-1baad93026e9`)  
**Target File**: `src/components/LessonPlayer.js`  
**Related Components**: `src/services/speech.js`, `src/components/VocabularyTable.js`  
**Test Suite**: `tests/m3_player_vocab_adversarial.test.js`  
**Date**: 2026-11-09T04:05:00Z  
**Patch Artifact**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_1/lesson_player_narration_fix.patch`  

---

## 1. Observation

### 1.1 Direct Test Failure Outputs
Running `node --test tests/m3_player_vocab_adversarial.test.js` reproduced exactly 3 failing tests out of 18 (15 passed):

```text
▶ Vector 4: Lifecycle Teardown & Event Listener Integrity
  ✔ 4.1 destroy() detaches all window event listeners (keydown, app:language-change) and clears container (1.136983ms)
  ✔ 4.2 destroy() cancels ongoing speech audio immediately (1.304689ms)
  ✔ 4.3 Re-entering Scene 3 repeatedly does not cause unhandled listener errors when language change is dispatched (146.239871ms)
  ✖ 4.4 Changing lesson via setLesson() terminates previous audio and resets isNarrationPlaying (5.581074ms)
    AssertionError [ERR_ASSERTION]: isNarrationPlaying must be reset to false when switching lesson
    true !== false
        at TestContext.<anonymous> (tests/m3_player_vocab_adversarial.test.js:746:14)

  ✖ 4.5 Repeatedly visiting Scene 3 does NOT leak VocabularyTable event listeners on window (45.181991ms)
    AssertionError [ERR_ASSERTION]: Re-visiting Scene 3 must NOT leak duplicate listeners on window; got 3
    3 !== 2
        at TestContext.<anonymous> (tests/m3_player_vocab_adversarial.test.js:770:14)

  ✖ 4.6 triggerStartWorksheet() terminates narration speech and resets isNarrationPlaying (4.034325ms)
    AssertionError [ERR_ASSERTION]: isNarrationPlaying must be reset to false when launching worksheet
    true !== false
        at TestContext.<anonymous> (tests/m3_player_vocab_adversarial.test.js:786:14)

ℹ tests 18
ℹ suites 5
ℹ pass 15
ℹ fail 3
```

### 1.2 Underlying Callback Mechanism in `src/services/speech.js`
In `src/services/speech.js`, lines 224–233:
```javascript
224:     utterance.onerror = (event) => {
225:       isSpeakingState = false;
226:       currentUtterance = null;
227:       // 'canceled' is expected when stop() is called, do not treat as fatal
228:       if (event && event.error !== 'canceled' && typeof onError === 'function') {
229:         onError(event);
230:       }
231:       resolve(false);
232:     };
```
When `speech.stop()` is called (which delegates to `window.speechSynthesis.cancel()`), the browser / mock triggers `onerror` with `event.error = 'canceled'`.
Line 228 explicitly skips calling `onError(event)`. Moreover, `onEnd` is never fired on cancellation.
Therefore, any component calling `speech.stop()` **will never receive an asynchronous callback (`onEnd` or `onError`)** to clear its local playing state. The component MUST reset its state synchronously.

### 1.3 Audit of All Speech Cancellation & Navigation Paths in `src/components/LessonPlayer.js`

| Method / Call Site | Lines in `LessonPlayer.js` | Calls `speech.stop()`? | Resets `this.isNarrationPlaying = false;`? | Status / Defect |
|---|---|---|---|---|
| `setLesson(lessonId)` | 201–211 | Yes (line 202) | **NO** (missing) | **DEFECT (Test 4.4 fail)** |
| `triggerStartWorksheet()` | 260–271 | Yes (line 261) | **NO** (missing) | **DEFECT (Test 4.6 fail)** |
| `goToScene(sceneId)` | 217–235 | Yes (line 218) | **YES** (line 222) | **CLEAN** |
| `destroy()` | 113–128 | Yes (line 115) | **NO** (missing) | **RISK** (state dirty on destroyed instance) |
| `bindDOMEvents()` (`btn-back-explorer`) | 688–695 | Yes (line 691) | **NO** (missing) | **RISK** (state dirty when navigating back) |
| `mountDynamicSubComponents()` | 751–798 | N/A | N/A | **DEFECT (Test 4.5 fail: listener leak on window)** |

---

## 2. Logic Chain

1. **Root Cause of Test 4.4 Failure**:
   - In `LessonPlayer.prototype.setLesson()` (line 201), the user switches the active lesson via the top toolbar `<select>`.
   - `speech.stop()` is invoked at line 202 to abort any active speech audio.
   - Because `speech.stop()` suppresses `onError` and does not fire `onEnd`, the callbacks registered in `toggleNarrationSpeech()` (lines 296–303) never execute.
   - `this.isNarrationPlaying` was never reset to `false` in `setLesson()`.
   - Consequence: `player.isNarrationPlaying` remains `true` (line 746 assertion fails). The user sees an idle "Listen" button in the newly loaded lesson, but clicking it invokes `toggleNarrationSpeech()`, which treats it as currently playing, stops non-existent speech, sets `isNarrationPlaying = false`, and returns without playing. The user must click twice to hear narration.

2. **Root Cause of Test 4.6 Failure**:
   - In `LessonPlayer.prototype.triggerStartWorksheet()` (line 260), the user clicks "Start Worksheet" in Scene 5 or presses ArrowRight past Scene 5.
   - `speech.stop()` is invoked at line 261 to silence narration before launching the quiz.
   - `this.isNarrationPlaying` was never reset to `false`.
   - Consequence: `player.isNarrationPlaying` remains `true` (line 786 assertion fails). If the user returns to the player later, narration state is corrupt.

3. **Analysis of `goToScene(sceneId)` & Other Navigation Methods**:
   - `goToScene(sceneId)` (lines 217–235) correctly executes `this.isNarrationPlaying = false;` at line 222 right after `speech.stop()`. This is why boundary navigation tests passed.
   - However, `destroy()` (line 115) and the back button click handler `btn-back-explorer` (line 691) both call `speech.stop()` but omit `this.isNarrationPlaying = false;`.
   - Resetting `this.isNarrationPlaying = false;` in all cancellation sites establishes invariant consistency across the entire component lifecycle.

4. **Root Cause of Test 4.5 Failure (Event Listener Leak)**:
   - In `LessonPlayer.prototype.mountDynamicSubComponents()` (lines 754–774), entering Scene 3 creates `new VocabTableClass(...)`, which registers an `'app:language-change'` listener on `window`.
   - Leaving Scene 3 does not destroy `this.vocabTableInstance`, nor does entering Scene 3 destroy any pre-existing instance before instantiating a new one.
   - When Scene 3 is re-visited, a second listener is bound to `window`, incrementing the count from 2 to 3 (test 4.5 assertion fails).
   - Solution: Before mounting, destroy existing `this.vocabTableInstance` (and `this.simulationInstance`); when on other scenes, clean up `vocabTableInstance`.

---

## 3. Caveats

- **Autoplay Browser Policies**: Web Speech API (`window.speechSynthesis`) requires user gestures (e.g. click events) to unlock audio playback in Chrome/Safari. All tests execute within synthetic event contexts simulating direct user clicks.
- **Read-Only Explorer Constraints**: In strict adherence to Explorer protocol, no modifications to `src/components/LessonPlayer.js` were made during this turn. All changes have been drafted as exact line-referenced drop-in snippets and a unified diff patch file for the implementation worker.
- No other caveats.

---

## 4. Conclusion & Actionable Code Fix

### 4.1 Summary of Exact Changes Required in `src/components/LessonPlayer.js`

1. **Fix 1 (`destroy`, line 115)**: Add `this.isNarrationPlaying = false;`.
2. **Fix 2 (`setLesson`, lines 201–211)**: Add `this.isNarrationPlaying = false;` and clean up `vocabTableInstance` / `simulationInstance`.
3. **Fix 3 (`triggerStartWorksheet`, lines 260–271)**: Add `this.isNarrationPlaying = false;`.
4. **Fix 4 (`bindDOMEvents`, backBtn, line 691)**: Add `this.isNarrationPlaying = false;` and `stopAudio()`.
5. **Fix 5 (`mountDynamicSubComponents`, lines 751–798)**: Destroy existing `vocabTableInstance` and `simulationInstance` before recreation, and clean up when navigating away.

---

### 4.2 Exact Before / After Drop-In Code Blocks

#### Block 1: `destroy()` (Line 113)
**Before (lines 113–128):**
```javascript
  destroy() {
    this.detachEventListeners();
    speech.stop();
    if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
      this.vocabTableInstance.destroy();
      this.vocabTableInstance = null;
    }
    if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
      this.simulationInstance.destroy();
      this.simulationInstance = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
```

**After:**
```javascript
  destroy() {
    this.detachEventListeners();
    speech.stop();
    this.isNarrationPlaying = false;
    if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
      this.vocabTableInstance.destroy();
      this.vocabTableInstance = null;
    }
    if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
      this.simulationInstance.destroy();
      this.simulationInstance = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
```

---

#### Block 2: `setLesson()` (Line 201)
**Before (lines 201–211):**
```javascript
  setLesson(lessonId) {
    speech.stop();
    if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
      this.vocabTableInstance.stopAudio();
    }
    this.lesson = this.resolveLesson(lessonId);
    this.currentSceneId = 1;
    this.completedScenes = new Set([1]);
    this.render();
    this.onSelectLesson(this.lesson.id);
  }
```

**After:**
```javascript
  setLesson(lessonId) {
    speech.stop();
    if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
      this.vocabTableInstance.destroy();
      this.vocabTableInstance = null;
    } else if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
      this.vocabTableInstance.stopAudio();
    }
    if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
      this.simulationInstance.destroy();
      this.simulationInstance = null;
    }
    this.isNarrationPlaying = false;
    this.lesson = this.resolveLesson(lessonId);
    this.currentSceneId = 1;
    this.completedScenes = new Set([1]);
    this.render();
    this.onSelectLesson(this.lesson.id);
  }
```

---

#### Block 3: `triggerStartWorksheet()` (Line 260)
**Before (lines 260–271):**
```javascript
  triggerStartWorksheet() {
    speech.stop();
    if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
      this.vocabTableInstance.stopAudio();
    }
    if (typeof this.onStartQuiz === 'function') {
      this.onStartQuiz(this.lesson.id);
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: this.lesson.id } }));
    }
  }
```

**After:**
```javascript
  triggerStartWorksheet() {
    speech.stop();
    if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
      this.vocabTableInstance.stopAudio();
    }
    this.isNarrationPlaying = false;
    if (typeof this.onStartQuiz === 'function') {
      this.onStartQuiz(this.lesson.id);
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: this.lesson.id } }));
    }
  }
```

---

#### Block 4: `bindDOMEvents()` Back Button (Line 688)
**Before (lines 688–695):**
```javascript
    // Back to Explore
    const backBtn = this.container.querySelector('.btn-back-explorer');
    if (backBtn) {
      backBtn.onclick = () => {
        speech.stop();
        this.onBack();
      };
    }
```

**After:**
```javascript
    // Back to Explore
    const backBtn = this.container.querySelector('.btn-back-explorer');
    if (backBtn) {
      backBtn.onclick = () => {
        speech.stop();
        if (this.vocabTableInstance && typeof this.vocabTableInstance.stopAudio === 'function') {
          this.vocabTableInstance.stopAudio();
        }
        this.isNarrationPlaying = false;
        this.onBack();
      };
    }
```

---

#### Block 5: `mountDynamicSubComponents()` (Line 751)
**Before (lines 751–798):**
```javascript
  async mountDynamicSubComponents() {
    if (!this.container || typeof this.container.querySelector !== 'function') return;

    // 1. Mount VocabularyTable in Scene 3
    if (this.currentSceneId === 3) {
      const vocabMount = this.container.querySelector('.vocabulary-table-mount-point');
      if (vocabMount) {
        try {
          const mod = await import('./VocabularyTable.js');
          const VocabTableClass = mod.VocabularyTable || mod.default;
          if (VocabTableClass) {
            this.vocabTableInstance = new VocabTableClass({
              vocabulary: this.lesson.vocabulary || [],
              language: this.language,
              container: vocabMount
            });
            this.vocabTableInstance.mount(vocabMount);
            return;
          }
        } catch (e) {
          this.renderVocabularyFallback(vocabMount);
        }
      }
    }

    // 2. Mount Dynamic Simulation in Scenes 2 & 4
    const simMount = this.container.querySelector('.sim-viewport');
    const simContainer = this.container.querySelector('.simulation-mount-container');
    const simType = simContainer?.dataset?.simType || simContainer?.getAttribute?.('data-sim-type');
    if (simMount && simType) {
      try {
        const mod = await import('./MathSimulations.js');
        const SimulationClass = mod.MathSimulations || mod.default;
        if (SimulationClass) {
          this.simulationInstance = new SimulationClass({
            type: simType,
            mode: this.currentSceneId === 2 ? 'facts' : 'guidance',
            language: this.language,
            container: simMount
          });
          this.simulationInstance.mount(simMount);
          return;
        }
      } catch (e) {
        this.renderSimulationFallback(simMount, simType);
      }
    }
  }
```

**After:**
```javascript
  async mountDynamicSubComponents() {
    if (!this.container || typeof this.container.querySelector !== 'function') return;

    // 1. Mount VocabularyTable in Scene 3
    if (this.currentSceneId === 3) {
      if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
        this.vocabTableInstance.destroy();
        this.vocabTableInstance = null;
      }
      const vocabMount = this.container.querySelector('.vocabulary-table-mount-point');
      if (vocabMount) {
        try {
          const mod = await import('./VocabularyTable.js');
          const VocabTableClass = mod.VocabularyTable || mod.default;
          if (VocabTableClass) {
            this.vocabTableInstance = new VocabTableClass({
              vocabulary: this.lesson.vocabulary || [],
              language: this.language,
              container: vocabMount
            });
            this.vocabTableInstance.mount(vocabMount);
            return;
          }
        } catch (e) {
          this.renderVocabularyFallback(vocabMount);
        }
      }
    } else {
      if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
        this.vocabTableInstance.destroy();
        this.vocabTableInstance = null;
      }
    }

    // 2. Mount Dynamic Simulation in Scenes 2 & 4
    const simMount = this.container.querySelector('.sim-viewport');
    const simContainer = this.container.querySelector('.simulation-mount-container');
    const simType = simContainer?.dataset?.simType || simContainer?.getAttribute?.('data-sim-type');
    if (simMount && simType) {
      if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
        this.simulationInstance.destroy();
        this.simulationInstance = null;
      }
      try {
        const mod = await import('./MathSimulations.js');
        const SimulationClass = mod.MathSimulations || mod.default;
        if (SimulationClass) {
          this.simulationInstance = new SimulationClass({
            type: simType,
            mode: this.currentSceneId === 2 ? 'facts' : 'guidance',
            language: this.language,
            container: simMount
          });
          this.simulationInstance.mount(simMount);
          return;
        }
      } catch (e) {
        this.renderSimulationFallback(simMount, simType);
      }
    } else {
      if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
        this.simulationInstance.destroy();
        this.simulationInstance = null;
      }
    }
  }
```

---

## 5. Verification Method

To independently verify after the worker applies the patch:

1. **Verify Adversarial Player & Vocabulary Test Suite**:
   ```bash
   node --test tests/m3_player_vocab_adversarial.test.js
   ```
   - Invalidation condition: Any failure among 18 tests.
   - Expected result: 18 passed, 0 failed.

2. **Verify Component Unit Tests**:
   ```bash
   node --test tests/lesson_player.test.js tests/vocabulary_table.test.js
   ```
   - Expected result: All 31 tests passed.

3. **Verify Entire Project Test Suite**:
   ```bash
   npm test
   ```
   - Expected result: All 298 tests passed.
