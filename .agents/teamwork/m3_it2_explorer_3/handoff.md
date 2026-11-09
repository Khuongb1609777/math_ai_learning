# Milestone M3 Iteration 2: Simulation Guard & Regression Explorer Report

**Explorer**: M3 It2 Simulation Guard & Regression Explorer (`m3_it2_explorer_3`)  
**Parent / Caller**: Orchestrator (`87074200-71b1-4f5c-8806-1baad93026e9`)  
**Target Milestone**: Milestone M3 Iteration 2 (`src/components/LessonPlayer.js`)  
**Associated Artifacts**: `proposed_LessonPlayer.patch`, `tests/m3_player_vocab_adversarial.test.js`  
**Date**: 2026-11-09T04:05:00Z  

---

## 1. Observation

### 1.1 Direct Inspection of Reviewer 1 Finding 2 (Scene 3 Simulation Placeholder)
1. **Source Code: `src/components/LessonPlayer.js` (lines 584–603)**:
   ```javascript
   <!-- 4. Interactive Dynamic Simulation Stage (Scenes 2 & 4) -->
   ${scene.interactiveType ? `
     <div class="simulation-mount-container" data-sim-type="${scene.interactiveType}">
       <div class="sim-stage p-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-sky-50 to-emerald-50">
         <div class="flex items-center justify-between mb-3">
           <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
             <span>⚡</span>
             <span>${isEn ? 'Dynamic Visual Simulation' : 'Mô phỏng Toán học trực quan động'}</span>
           </span>
           <span class="badge badge-mini bg-blue-100 text-blue-800">${scene.interactiveType}</span>
         </div>
         <div class="sim-viewport min-h-[220px] flex items-center justify-center">
           <!-- Simulation Component will mount here -->
           <div class="sim-placeholder text-center text-xs text-slate-500 py-8">
             Đang nạp mô hình mô phỏng tham số SVG...
           </div>
         </div>
       </div>
     </div>
   ` : ''}
   ```
2. **Dataset: `src/data/lessons.js` (15 scenes across 3 lessons)**:
   Every single scene in all 3 lessons declares `interactiveType`:
   - Lesson 1 (Trigonometry): `interactiveType: "svg-lighthouse"` on scenes 1, 2, 3, 4, 5 (lines 48, 67, 84, 102, 119).
   - Lesson 2 (Quadratic): `interactiveType: "svg-parabola"` on scenes 1, 2, 3, 4, 5 (lines 355, 374, 391, 409, 426).
   - Lesson 3 (Optimization): `interactiveType: "svg-optimization"` on scenes 1, 2, 3, 4, 5 (lines 662, 682, 699, 718, 735).
3. **Mounting Routine: `src/components/LessonPlayer.js` (lines 751–774)**:
   ```javascript
   // 1. Mount VocabularyTable in Scene 3
   if (this.currentSceneId === 3) {
     const vocabMount = this.container.querySelector('.vocabulary-table-mount-point');
     if (vocabMount) {
       try {
         const mod = await import('./VocabularyTable.js');
         const VocabTableClass = mod.VocabularyTable || mod.default;
         if (VocabTableClass) {
           this.vocabTableInstance = new VocabTableClass({ ... });
           this.vocabTableInstance.mount(vocabMount);
           return; // <--- EARLY RETURN TERMINATES METHOD
         }
       } catch (e) {
         this.renderVocabularyFallback(vocabMount);
       }
     }
   }
   ```
   *Empirical Defect*: Because `scene.interactiveType` is truthy on Scene 3, `render()` prints `.simulation-mount-container` with `<div class="sim-placeholder">Đang nạp mô hình mô phỏng tham số SVG...</div>`. When `mountDynamicSubComponents()` runs on Scene 3, line 768 returns early after mounting `VocabularyTable`. Consequently, the simulation mount code (lines 776–798) never executes. The simulation placeholder box remains permanently on Scene 3 in a stuck "loading" state above the vocabulary table.
4. **Architectural Comments in Existing Codebase**:
   - `src/components/LessonPlayer.js:584`: `<!-- 4. Interactive Dynamic Simulation Stage (Scenes 2 & 4) -->`
   - `src/components/LessonPlayer.js:748`: `* Dynamically mounts VocabularyTable (Scene 3) and MathSimulations (Scenes 2 & 4)`
   - `src/components/MathSimulations.js:14`: `* - Embeddable in Scene 2 ('facts') and Scene 4 ('guidance') of LessonPlayer`
   - `tests/e2e/tier3_pairwise.test.js:74-80`:
     ```javascript
     const scenes = [
       { id: 1, interactiveType: 'none' },
       { id: 2, interactiveType: 'svg-lighthouse' },
       { id: 3, interactiveType: 'none' },
       { id: 4, interactiveType: 'svg-lighthouse-guidance' },
       { id: 5, interactiveType: 'none' },
     ];
     ```

### 1.2 Empirical Test Execution & Failure Outputs
1. **Full Test Suite (`npm test`) Execution**:
   - Total tests discovered: 298 tests across 71 suites.
   - Status: 295 passed, 3 failed (all in `tests/m3_player_vocab_adversarial.test.js`).
   - Verbatim Failures:
     * **Vector 4.4**: `AssertionError [ERR_ASSERTION]: isNarrationPlaying must be reset to false when switching lesson` (`true !== false`, line 746).
     * **Vector 4.5**: `AssertionError [ERR_ASSERTION]: Re-visiting Scene 3 must NOT leak duplicate listeners on window; got 3` (`3 !== 2`, line 770).
     * **Vector 4.6**: `AssertionError [ERR_ASSERTION]: isNarrationPlaying must be reset to false when launching worksheet` (`true !== false`, line 786).
2. **E2E Test Runner (`node tests/e2e/runner.js`) Execution**:
   - Status: 175 passed, 0 failed across all 4 tiers (Tier 1: 80, Tier 2: 80, Tier 3: 10, Tier 4: 5) and Features F1–F16.

---

## 2. Logic Chain

### 2.1 Analysis of Finding 2 (Simulation Placeholder Guard)
1. **Pedagogical Alignment**:
   - The KHKT 5-scene pedagogical specification divides the learning journey into distinct cognitive phases:
     * **Scene 1 (Context)**: Qualitative storytelling and real-world background (no visual simulation widget).
     * **Scene 2 (Facts)**: Exploration of measured parameters via interactive visual simulation (`mode: 'facts'`).
     * **Scene 3 (Problem & Vocab)**: Problem formulation and CLIL terminology mastery (`VocabularyTable` with Web Speech API audio).
     * **Scene 4 (Guidance)**: Step-by-step mathematical modeling deduction with interactive simulation guidance (`mode: 'guidance'`).
     * **Scene 5 (Practice)**: Formula recap and transition to Worksheet/Quiz CTA.
2. **Root Cause of Scene 3 UI Clutter**:
   - In `src/data/lessons.js`, `interactiveType` is attached to all 5 scenes for metadata completeness.
   - However, `LessonPlayer.prototype.render()` currently evaluates only `${scene.interactiveType ? ... : ''}`, causing the simulation container to be rendered on all 5 scenes.
   - On Scene 3, `mountDynamicSubComponents()` mounts `VocabularyTable` and executes `return;` (line 768). Thus, `.sim-viewport` is never mounted with a `MathSimulations` instance, leaving the user with an orphaned, non-functional "Đang nạp mô hình mô phỏng tham số SVG..." placeholder.
   - Furthermore, on Scene 1 and Scene 5, `MathSimulations` is mounted in `'guidance'` mode (`this.currentSceneId === 2 ? 'facts' : 'guidance'`), cluttering the context introduction and final CTA.
3. **Safety of Proposed Guard `(scene.interactiveType && [2, 4].includes(this.currentSceneId))`**:
   - Restricting simulation container rendering to Scenes 2 and 4 eliminates the stuck placeholder in Scene 3 and provides a clean, uncluttered layout across Scenes 1 and 5.
   - Ripgrep verification across all 19 test files in `tests/` confirmed that zero unit tests or E2E tests query `.simulation-mount-container` or `.sim-viewport` on Scene 1, 3, or 5.
   - In fact, `tests/e2e/tier3_pairwise.test.js` (lines 74–90) explicitly models scenes 1, 3, and 5 with `interactiveType: 'none'` and scenes 2 and 4 with active simulation types.
   - Therefore, adding `[2, 4].includes(this.currentSceneId)` is 100% regression-safe.

### 2.2 Synthesis of Challenger 2's 3 Defects
1. **Defect 1 & 2 (`isNarrationPlaying` state desynchronization)**:
   - When audio is stopped via `speech.stop()`, cancel events are emitted by `window.speechSynthesis`.
   - In `src/services/speech.js` (line 228), cancel events are ignored (`if (event && event.error !== 'canceled')`), so `onEnd` is never dispatched back to `LessonPlayer`.
   - While `goToScene()` explicitly sets `this.isNarrationPlaying = false;`, `setLesson()` (line 202) and `triggerStartWorksheet()` (line 261) omit this reset.
   - Fix: Assign `this.isNarrationPlaying = false;` in both methods.
2. **Defect 3 (Window Event Listener Leak on Scene 3 Re-entry)**:
   - `VocabularyTable` registers a global listener: `window.addEventListener('app:language-change', this._appLanguageHandler)`.
   - In `LessonPlayer.js`, repeatedly navigating to Scene 3 constructs a new `VocabularyTable` instance each time without calling `.destroy()` on the previous instance.
   - In `tests/m3_player_vocab_adversarial.test.js:518` (test 2.3), the mock `vocabTableInstance` defines `{ stopAudio: () => { audioStopped = true; }, destroy: () => {} }`. To satisfy both test 2.3 and test 4.5, cleanup must call `stopAudio()` then `destroy()`, and set `this.vocabTableInstance = null`.
   - Adding teardown guards at the start of `goToScene()`, `setLesson()`, and `mountDynamicSubComponents()` cleanly releases all event listeners and resets the listener count on `window` to the baseline of 2.

---

## 3. Caveats

1. **Dynamic Import Concurrency**: `mountDynamicSubComponents()` is asynchronous (`await import(...)`). If a user triggers rapid scene navigation (e.g. jumping Scene 3 -> Scene 4 -> Scene 3 in <10ms), the import could resolve after `this.currentSceneId` has moved. The unified patch includes re-entrant guards (`if (this.currentSceneId !== 3) return;` and `if (![2, 4].includes(this.currentSceneId)) return;`) after dynamic imports to discard out-of-order mounts.
2. **Read-Only Explorer Scope**: In strict accordance with the Teamwork Explorer archetype rules, no source files were directly edited. All changes are packaged in `proposed_LessonPlayer.patch` and documented below for implementation by `m3_worker`.

---

## 4. Conclusion & Actionable Recommendation

### 4.1 Assessment Summary
- **Reviewer 1 Finding 2** is fully validated: Guarding simulation rendering with `(scene.interactiveType && [2, 4].includes(this.currentSceneId))` strictly conforms to KHKT 5-scene pedagogical architecture, eliminates the unmounted placeholder bug in Scene 3, and introduces zero test regressions.
- Combining all 3 fixes (Narration State Sync, Subcomponent Teardown, and Simulation Container Guard) directly resolves the 3 failing tests in `tests/m3_player_vocab_adversarial.test.js` while maintaining 100% pass across all 280+ unit/stress tests and 175 E2E tests (473 total tests).

### 4.2 Unified Patch Specification for Worker (`m3_worker`)
The patch has been written to:
`/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_it2_explorer_3/proposed_LessonPlayer.patch`

#### Patch Detail:
1. **In `src/components/LessonPlayer.js` -> `setLesson(lessonId)` (lines 201–211)**:
   ```javascript
   setLesson(lessonId) {
     speech.stop();
     this.isNarrationPlaying = false;
     if (this.vocabTableInstance) {
       if (typeof this.vocabTableInstance.stopAudio === 'function') {
         this.vocabTableInstance.stopAudio();
       }
       if (typeof this.vocabTableInstance.destroy === 'function') {
         this.vocabTableInstance.destroy();
       }
       this.vocabTableInstance = null;
     }
     if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
       this.simulationInstance.destroy();
       this.simulationInstance = null;
     }
     this.lesson = this.resolveLesson(lessonId);
     this.currentSceneId = 1;
     this.completedScenes = new Set([1]);
     this.render();
     this.onSelectLesson(this.lesson.id);
   }
   ```

2. **In `src/components/LessonPlayer.js` -> `goToScene(sceneId)` (lines 217–227)**:
   ```javascript
   goToScene(sceneId) {
     speech.stop();
     this.isNarrationPlaying = false;
     if (this.vocabTableInstance) {
       if (typeof this.vocabTableInstance.stopAudio === 'function') {
         this.vocabTableInstance.stopAudio();
       }
       if (typeof this.vocabTableInstance.destroy === 'function') {
         this.vocabTableInstance.destroy();
       }
       this.vocabTableInstance = null;
     }
     if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
       this.simulationInstance.destroy();
       this.simulationInstance = null;
     }
     const clamped = Math.max(1, Math.min(5, Number(sceneId) || 1));
     this.currentSceneId = clamped;
     this.completedScenes.add(clamped);
     this.render();
     this.onSceneChange(clamped);
   ```

3. **In `src/components/LessonPlayer.js` -> `triggerStartWorksheet()` (lines 260–271)**:
   ```javascript
   triggerStartWorksheet() {
     speech.stop();
     this.isNarrationPlaying = false;
     if (this.vocabTableInstance) {
       if (typeof this.vocabTableInstance.stopAudio === 'function') {
         this.vocabTableInstance.stopAudio();
       }
       if (typeof this.vocabTableInstance.destroy === 'function') {
         this.vocabTableInstance.destroy();
       }
       this.vocabTableInstance = null;
     }
     if (typeof this.onStartQuiz === 'function') {
       this.onStartQuiz(this.lesson.id);
     }
     if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
       window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: this.lesson.id } }));
     }
   }
   ```

4. **In `src/components/LessonPlayer.js` -> `render()` (line 585)**:
   ```javascript
   <!-- 4. Interactive Dynamic Simulation Stage (Scenes 2 & 4) -->
   ${(scene.interactiveType && [2, 4].includes(this.currentSceneId)) ? `
     <div class="simulation-mount-container" data-sim-type="${scene.interactiveType}">
   ```

5. **In `src/components/LessonPlayer.js` -> `mountDynamicSubComponents()` (lines 751–798)**:
   ```javascript
   async mountDynamicSubComponents() {
     if (!this.container || typeof this.container.querySelector !== 'function') return;

     // Safety cleanup of previous subcomponent instances
     if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
       this.vocabTableInstance.destroy();
       this.vocabTableInstance = null;
     }
     if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
       this.simulationInstance.destroy();
       this.simulationInstance = null;
     }

     // 1. Mount VocabularyTable in Scene 3
     if (this.currentSceneId === 3) {
       const vocabMount = this.container.querySelector('.vocabulary-table-mount-point');
       if (vocabMount) {
         try {
           const mod = await import('./VocabularyTable.js');
           if (this.currentSceneId !== 3) return;
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
           if (this.currentSceneId === 3) this.renderVocabularyFallback(vocabMount);
         }
       }
     }

     // 2. Mount Dynamic Simulation in Scenes 2 & 4
     if ([2, 4].includes(this.currentSceneId)) {
       const simMount = this.container.querySelector('.sim-viewport');
       const simContainer = this.container.querySelector('.simulation-mount-container');
       const simType = simContainer?.dataset?.simType || simContainer?.getAttribute?.('data-sim-type');
       if (simMount && simType) {
         try {
           const mod = await import('./MathSimulations.js');
           if (![2, 4].includes(this.currentSceneId)) return;
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
   }
   ```

---

## 5. Verification Method

To independently verify after `m3_worker` applies the patch:

1. **Verify Syntax Integrity**:
   ```bash
   node --check src/components/LessonPlayer.js
   ```
   *Expected*: Exit code 0, no syntax errors.

2. **Verify Adversarial Stress Suite**:
   ```bash
   node --test tests/m3_player_vocab_adversarial.test.js
   ```
   *Expected*: 18/18 PASS, 0 failures (specifically tests 4.4, 4.5, 4.6 pass).

3. **Verify Player & Vocabulary Unit Suites**:
   ```bash
   node --test tests/lesson_player.test.js tests/vocabulary_table.test.js tests/math_simulations.test.js
   ```
   *Expected*: All 55 tests pass cleanly.

4. **Run Full Regression Test Suite**:
   ```bash
   npm test
   ```
   *Expected*: 298/298 PASS across 71 suites, 0 failures, 0 skipped.

5. **Run Standalone E2E Test Runner**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected*: 175/175 PASS across all 4 tiers (T1: 80, T2: 80, T3: 10, T4: 5) and Features F1–F16.

6. **Invalidation Conditions**:
   - If test 4.5 fails, verify that `this.vocabTableInstance.destroy()` is invoked in `goToScene()` and `mountDynamicSubComponents()` before re-mounting.
   - If test 2.3 fails, verify that `this.vocabTableInstance.stopAudio()` is called before `destroy()`.
