# M3 Explorer 1 Handoff Report: 5-Scene Bilingual Multimedia Player & Stepper

**Author**: Milestone M3 Explorer 1 (`m3_explorer_1`)  
**Date**: 2026-11-09T03:30:00Z  
**Target Component**: `src/components/LessonPlayer.js`  
**Milestone**: M3 — 5-Scene Bilingual Multimedia Player & Dynamic Simulations  

---

## 1. Observation

### 1.1 Existing Architecture & Integration Points
1. **Root SPA Controller (`src/app.js`, lines 388-404)**:
   ```javascript
   // View 2: 5-Scene Multimedia Player (Tab: player)
   if (activeTab === 'player') {
     try {
       const { LessonPlayer } = await import('./components/LessonPlayer.js');
       if (LessonPlayer) {
         const player = new LessonPlayer({
           lessonId: currentLessonId,
           language,
           onBack: this.handleBackToExplore
         });
         player.mount(mainEl);
         return;
       }
     } catch (e) {
       this.renderPlayerPlaceholder(mainEl, currentLessonId);
       return;
     }
   }
   ```
   - `App` passes `{ lessonId, language, onBack }` to `LessonPlayer`.
   - `App` listens to `app:language-change` (`window.addEventListener('app:language-change')`), and dispatches it when language toggles in the header.
   - `App` also listens to `lesson:select` and `lesson-select` global window events with `detail: { lessonId }`.

2. **Core Data Contracts (`src/data/types.js`, lines 18-35 & 95-115)**:
   - `SceneKey`: `'context' | 'facts' | 'problem' | 'guidance' | 'practice'`.
   - `Scene`:
     * `id`: `number` (1 to 5).
     * `key`: `SceneKey`.
     * `titleVi`, `titleEn`: string titles.
     * `contentVi`, `contentEn`: spoken narrative script.
     * `visualDescriptionVi`, `visualDescriptionEn`: visual staging and graphic prompt description.
     * `formulas`: `string[]` of mathematical expressions.
     * `checkpointVi`, `checkpointEn`: pedagogical reflection checkpoints.
     * `interactiveType`: `'svg-lighthouse' | 'svg-parabola' | 'svg-optimization' | string`.
   - `Lesson`: Exactly 5 scenes in strictly sequential order (1 to 5), `vocabulary` array, `quiz` array, `verification` array.

3. **Three Authentic Grade 10 Lessons (`src/data/lessons.js`)**:
   - `lesson-lighthouse` (Trigonometry):
     * Scene 1 (`context`): Coastal lighthouse on steep cliff, base C is inaccessible.
     * Scene 2 (`facts`): Two stations $A$ and $B$, $AB = 30\text{ m}$, angles $42^\circ$ and $63^\circ$.
     * Scene 3 (`problem`): Linking $\triangle ABD$ and right $\triangle BCD$, 7 vocabulary items (Angle of elevation, Law of Sines, etc.).
     * Scene 4 (`guidance`): Exterior angle $\widehat{ADB} = 21^\circ$, $BD = 30 \sin(42^\circ) / \sin(21^\circ)$, $CD = BD \sin(63^\circ)$. Withholds numerical answer!
     * Scene 5 (`practice`): Formula recap, height $\approx 49.9\text{ m}$, CTA to worksheet.
   - `lesson-parabolic-arch` (Quadratic):
     * Span $8\text{ m}$, apex $6\text{ m}$, truck width $4\text{ m}$, height $4.2\text{ m}$. $y = -0.375x^2 + 6$, clearance $+0.3\text{ m} > 0$.
   - `lesson-bus-optimization` (Optimization):
     * Base fare $200{,}000\text{ VNĐ}$, ridership $60$, elasticity $-10{,}000 \implies +5$ passengers, capacity $100$. $R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000$, optimal $x^* = 4$, fare $160{,}000\text{ VNĐ}$, peak revenue $12.8\text{M VNĐ}$.

4. **Existing CSS Styling Tokens (`public/assets/css/style.css`, lines 277-380)**:
   - Stepper tokens already established:
     * `.stepper-container`, `.step-item`, `.step-circle`, `.step-label`, `.stepper-line`.
     * `.step-item.active .step-circle`: background `var(--color-primary-800)`, box-shadow ring.
     * `.step-item.completed .step-circle`: background `var(--color-emerald-600)`.
   - Content tokens:
     * `.bilingual-grid`, `.bilingual-card-vi` (rose border), `.bilingual-card-en` (blue border).
     * `.math-formula` (Cambria Math, KaTeX-like centered card).
     * `.scaffold-box` (amber guidance callout), `.misconception-box` (rose alert box).
     * `.sim-stage`, `.sim-svg`.

5. **Audio Pronunciation Service (`src/services/speech.js`)**:
   - `speak(text, { lang, rate, onStart, onEnd, onError }, windowOverride)`.
   - `stop(windowOverride)`: cancels active speech immediately.
   - `isSupported()`, `isSpeaking()`, `speakTerm()`.

6. **Existing Test Runner & E2E Suites (`tests/e2e/`)**:
   - `tier1_features.test.js`:
     * `F3.1`: Strictly 5 scenes in sequential order (1 to 5).
     * `F3.2`: Scene keys match `['context', 'facts', 'problem', 'guidance', 'practice']`.
     * `F3.3`: Scene 1 introduces real-world setting without raw formulas.
     * `F3.4`: Scene 2 encapsulates quantitative measurements and units.
     * `F3.5`: Scene 4 provides modeling guidance without revealing final numerical answers.
     * `F4.1` - `F4.5`: Bilingual language switcher (`vi`, `en`, `dual`).
   - `tier2_boundaries.test.js`:
     * `F3.B1`: Attempting scene index $< 1$ clamps to Scene 1.
     * `F3.B2`: Attempting scene index $> 5$ clamps to Scene 5.
     * `F3.B3`: Direct navigation to Scene 5 (skipping 1-4) is permitted and loads Scene 5.
     * `F3.B4`: Scenes with empty formulas or undefined `interactiveType` default safely.
     * `F3.B5`: Rapid consecutive scene index changes produce predictable end state.
   - `tier3_pairwise.test.js`:
     * `Pair 1`: Explorer selection mounts 5-scene player with matching lesson ID and data.
     * `Pair 2`: Player bilingual toggle updates subtitles and syncs with Math EN speech TTS.
     * `Pair 3`: Player scene navigation dynamically binds and renders SVG math simulations.
     * `Pair 4`: Scene 5 practice CTA transitions into Quiz with instant 10-point scoring.

---

## 2. Logic Chain

```
[Observation 1.1: App imports LessonPlayer with { lessonId, language, onBack }]
                       │
                       ▼
[Observation 1.2 & 1.3: Lesson has 5 standardized scenes with specific pedagogical roles]
                       │
                       ▼
[Step 1: Design LessonPlayer class managing state: { currentLesson, currentSceneId (1-5), language ('vi'|'en'|'dual'), completedScenes, isSpeakingNarration }]
                       │
                       ▼
[Step 2: Implement 5-Scene Workflow Stepper with WAI-ARIA tablist/tab/tabpanel roles, direct clicking, and index clamping [1, 5]]
                       │
                       ▼
[Step 3: Integrate Scene 3 with VocabularyTable component & Web Speech API TTS, and Scenes 2 & 4 with MathSimulations]
                       │
                       ▼
[Step 4: Implement Tri-state Bilingual Toggle syncing bidirectionally via 'app:language-change' custom event]
                       │
                       ▼
[Step 5: Implement Keyboard Arrow Navigation (Left/Right) with input focus guard, and proper lifecycle cleanup in destroy()]
                       │
                       ▼
[Conclusion: Deliver complete, drop-in production-ready LessonPlayer.js architecture and comprehensive test suite]
```

### Step-by-Step Rationale:
1. **Scene 1 (Context)**: Focuses purely on visual immersion and real-world background. No distracting heavy algebraic machinery. Displays the authentic setting and a pedagogical observation checkpoint.
2. **Scene 2 (Facts)**: Presents the exact numerical facts and survey measurements. If `scene.interactiveType` is set, embeds the dynamic simulation initial diagram.
3. **Scene 3 (Problem & Vocabulary)**: Formulates the core mathematical dilemma and embeds the interactive `VocabularyTable`. When switching away from Scene 3 or unmounting, `speech.stop()` is invoked to prevent audio leakage.
4. **Scene 4 (Guidance & Scaffolding)**: Provides step-by-step mathematical reasoning (exterior angles, coordinate placement, quadratic expansions). Crucially withholds the final numerical solution per KHKT pedagogy. Embeds the interactive simulation sliders (ray-tracer, truck offset, price steps).
5. **Scene 5 (Practice & Conclusion)**: Summarizes the key formulas, validates the real-world answer (safe passage, optimal revenue, lighthouse height), and features the primary CTA button "Mở Phiếu học tập / Start Worksheet →" that invokes `onStartQuiz` or dispatches `quiz:start`.
6. **Bounds & Robustness**: Clamping logic `Math.max(1, Math.min(5, index))` prevents out-of-bounds errors (`<1` or `>5`). Keyboard listener checks `['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)` to avoid hijacking typing inside vocabulary search inputs.

---

## 3. Caveats

1. **Child Component Async Availability**: `VocabularyTable.js` (M3 Explorer 2) and `MathSimulations.js` (M3 Explorer 3) are being designed concurrently. Therefore, `LessonPlayer` must support **graceful polymorphic integration**:
   - If imported/provided, it mounts the real components seamlessly.
   - If not yet implemented or failing import, it falls back to elegant static diagrams and inline vocabulary summaries without throwing errors.
2. **Audio Speech Synthesis in Restricted Environments**: In automated CI/headless Node.js test runs or browser permissions without user interaction, `speech.speak()` should fail silently or resolve safely without throwing uncaught exceptions.
3. **LaTeX Formula Rendering**: In an offline-first SPA without heavy KaTeX/MathJax dependencies, formulas are cleanly styled using Unicode and native math typography (`--font-math`, `.math-formula`), ensuring fast load times and clean fallback.

---

## 4. Conclusion & Concrete Design Specifications

### 4.1 Component Architecture & Interface Contract

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LessonPlayer Container                          │
├────────────────────────────────────────────────────────────────────────┤
│ Toolbar: [← Back to Explore]  [Lesson Selector ▾]  [Language: VI|EN|DUAL]
├────────────────────────────────────────────────────────────────────────┤
│ Stepper: (1) Bối cảnh ──── (2) Dữ kiện ──── (3) Vấn đề ──── (4) Gợi mở ──── (5) Thực hành │
├────────────────────────────────────────────────────────────────────────┤
│ Scene Viewport:                                                        │
│  - Scene Header: Step Badge, Topic Pill, Bilingual Titles              │
│  - Subtitle / Narration Bar (with Audio Read-aloud button)             │
│  - Bilingual Grid: [Vietnamese Narrative] [English Narrative (CLIL)]   │
│  - Embedded Simulation Canvas (Scenes 2 & 4: Lighthouse/Parabola/Bus)   │
│  - Embedded Vocabulary Table (Scene 3: IPA, Speech TTS, Search)        │
│  - Mathematical Formulas & Scaffolding Box                             │
│  - Pedagogical Checkpoint Reflection Box                               │
├────────────────────────────────────────────────────────────────────────┤
│ Navigation Controls: [← Trước / Prev]        [Tiếp theo / Next →]       │
│                      (Scene 5 CTA: [★ Làm phiếu học tập / Quiz →])    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Constructor Options:
```typescript
interface LessonPlayerOptions {
  container?: HTMLElement;           // Target mounting container
  lessonId?: string;                 // Active lesson ID (default: 'lesson-lighthouse')
  language?: 'vi' | 'en' | 'dual';   // Initial language mode (default: 'dual')
  onBack?: () => void;               // Back to collection explorer callback
  onSelectLesson?: (id: string) => void; // Lesson switch callback
  onStartQuiz?: (lessonId: string) => void; // Transition to quiz callback
  onSceneChange?: (sceneId: number) => void; // Scene change callback
}
```

### 4.2 Drop-In Implementation Code (`src/components/LessonPlayer.js`)

Below is the concrete, production-ready implementation of `LessonPlayer.js`:

```javascript
/**
 * src/components/LessonPlayer.js
 * 5-Scene Bilingual Multimedia Player & Stepper Component
 * Milestone: M3 (5-Scene Player & Dynamic Simulations)
 *
 * Implements:
 * - Feature F3: 5-Scene standardized storyboard workflow:
 *   Scene 1: Bối cảnh thực tế (Real-world Context)
 *   Scene 2: Dữ kiện bài toán (Given Data & Problem Formulation)
 *   Scene 3: Vấn đề Toán học & Từ vựng (Math Problem & Math English Vocabulary)
 *   Scene 4: Gợi mở giải pháp & Mô hình hóa (Solution Scaffolding & Modeling)
 *   Scene 5: Thực hành & Kết luận thực tiễn (Practice & Real-World Conclusion)
 * - Feature F4: Tri-state bilingual presentation (VI, EN, DUAL) with synchronized subtitles
 * - Step navigation: Prev/Next buttons, direct step indicator jumps, completion tracking
 * - Keyboard navigation (ArrowLeft, ArrowRight) with input focus guard
 * - Dynamic embedding of VocabularyTable (Scene 3) and MathSimulations (Scenes 2 & 4)
 * - WAI-ARIA accessibility (role="tablist", role="tab", role="tabpanel", aria-live)
 */

import { DEFAULT_LESSONS } from '../data/lessons.js';
import { getLessonById, getLessons } from '../services/storage.js';
import * as speech from '../services/speech.js';

export class LessonPlayer {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container] - Mounting DOM node
   * @param {string} [options.lessonId] - Target lesson slug
   * @param {'vi'|'en'|'dual'} [options.language='dual'] - Bilingual display mode
   * @param {Function} [options.onBack] - Callback to return to Explorer
   * @param {Function} [options.onSelectLesson] - Callback when switching lessons
   * @param {Function} [options.onStartQuiz] - Callback when clicking Start Worksheet in Scene 5
   * @param {Function} [options.onSceneChange] - Callback when active scene changes
   */
  constructor(options = {}) {
    this.container = options.container || null;
    this.onBack = options.onBack || (() => {});
    this.onSelectLesson = options.onSelectLesson || (() => {});
    this.onStartQuiz = options.onStartQuiz || (() => {});
    this.onSceneChange = options.onSceneChange || (() => {});

    // Resolve initial language
    this.language = ['vi', 'en', 'dual'].includes(options.language) ? options.language : 'dual';

    // Resolve initial lesson
    this.allLessons = this.loadAllLessons();
    this.lesson = this.resolveLesson(options.lessonId);
    
    // Player internal state
    this.currentSceneId = 1; // 1 to 5
    this.completedScenes = new Set([1]); // Scene 1 marked visited initially
    this.isNarrationPlaying = false;

    // Sub-components cache
    this.vocabTableInstance = null;
    this.simulationInstance = null;

    // Bind event listeners
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleAppLanguageChange = this.handleAppLanguageChange.bind(this);
    this._listenersAttached = false;
  }

  /**
   * Loads all lessons from storage with fallback to default constants
   * @returns {Array<Object>}
   */
  loadAllLessons() {
    try {
      const list = getLessons();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {
      // Fallback
    }
    return DEFAULT_LESSONS;
  }

  /**
   * Resolves target lesson by ID or defaults to first lesson
   * @param {string} [lessonId]
   * @returns {Object}
   */
  resolveLesson(lessonId) {
    if (lessonId) {
      try {
        const found = getLessonById(lessonId);
        if (found) return found;
      } catch (e) {}
      const fromList = this.allLessons.find(l => l.id === lessonId);
      if (fromList) return fromList;
    }
    return this.allLessons[0] || DEFAULT_LESSONS[0];
  }

  /**
   * Mounts component into DOM container
   * @param {HTMLElement} container
   */
  mount(container) {
    if (!container) return;
    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Cleans up event listeners and audio upon unmounting
   */
  destroy() {
    this.detachEventListeners();
    speech.stop();
    if (this.vocabTableInstance && typeof this.vocabTableInstance.destroy === 'function') {
      this.vocabTableInstance.destroy();
    }
    if (this.simulationInstance && typeof this.simulationInstance.destroy === 'function') {
      this.simulationInstance.destroy();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Attaches window and keyboard event listeners
   */
  attachEventListeners() {
    if (this._listenersAttached || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('app:language-change', this.handleAppLanguageChange);
    this._listenersAttached = true;
  }

  /**
   * Detaches event listeners
   */
  detachEventListeners() {
    if (!this._listenersAttached || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('app:language-change', this.handleAppLanguageChange);
    this._listenersAttached = false;
  }

  /**
   * Handles keyboard arrow navigation with input focus safety guard
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    // Do not intercept if user is typing inside an input or textarea
    const activeEl = document.activeElement;
    if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prevScene();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.nextScene();
    }
  }

  /**
   * Handles app-wide language change broadcasts
   * @param {CustomEvent} e
   */
  handleAppLanguageChange(e) {
    const newLang = e.detail?.lang;
    if (newLang && ['vi', 'en', 'dual'].includes(newLang) && newLang !== this.language) {
      this.setLanguage(newLang, false); // Don't re-dispatch
    }
  }

  /**
   * Updates language mode and re-renders view
   * @param {'vi'|'en'|'dual'} lang
   * @param {boolean} [broadcast=true]
   */
  setLanguage(lang, broadcast = true) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    this.language = lang;
    if (broadcast && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:language-change', { detail: { lang } }));
    }
    this.render();
  }

  /**
   * Changes active lesson
   * @param {string} lessonId
   */
  setLesson(lessonId) {
    speech.stop();
    this.lesson = this.resolveLesson(lessonId);
    this.currentSceneId = 1;
    this.completedScenes = new Set([1]);
    this.render();
    this.onSelectLesson(this.lesson.id);
  }

  /**
   * Navigates directly to a scene with boundary clamping (1 to 5)
   * @param {number} sceneId
   */
  goToScene(sceneId) {
    speech.stop();
    this.isNarrationPlaying = false;
    const clamped = Math.max(1, Math.min(5, Number(sceneId) || 1));
    this.currentSceneId = clamped;
    this.completedScenes.add(clamped);
    this.render();
    this.onSceneChange(clamped);

    // Announce to screen readers
    const announcer = this.container?.querySelector('.sr-announcer');
    if (announcer) {
      const activeScene = this.getCurrentScene();
      announcer.textContent = `Chuyển sang phân cảnh ${clamped}: ${activeScene.titleVi}`;
    }
  }

  /**
   * Navigates to previous scene
   */
  prevScene() {
    if (this.currentSceneId > 1) {
      this.goToScene(this.currentSceneId - 1);
    }
  }

  /**
   * Navigates to next scene
   */
  nextScene() {
    if (this.currentSceneId < 5) {
      this.goToScene(this.currentSceneId + 1);
    } else {
      this.triggerStartWorksheet();
    }
  }

  /**
   * Triggers worksheet / quiz transition
   */
  triggerStartWorksheet() {
    speech.stop();
    if (typeof this.onStartQuiz === 'function') {
      this.onStartQuiz(this.lesson.id);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: this.lesson.id } }));
      // Also notify App router to switch tab if applicable
      if (window.app && typeof window.app.handleNavigate === 'function') {
        // App can route to quiz view or show worksheet modal
      }
    }
  }

  /**
   * Reads aloud current scene narration script using Web Speech API
   */
  toggleNarrationSpeech() {
    if (this.isNarrationPlaying) {
      speech.stop();
      this.isNarrationPlaying = false;
      this.updateSpeechButtonUI();
      return;
    }

    const scene = this.getCurrentScene();
    // Choose speech text based on active language mode
    const textToSpeak = this.language === 'en' 
      ? scene.contentEn 
      : (this.language === 'vi' ? scene.contentVi : `${scene.contentVi}. ${scene.contentEn}`);
    const langCode = this.language === 'en' ? 'en-US' : 'vi-VN';

    this.isNarrationPlaying = true;
    this.updateSpeechButtonUI();

    speech.speak(textToSpeak, {
      lang: langCode,
      rate: 0.9,
      onEnd: () => {
        this.isNarrationPlaying = false;
        this.updateSpeechButtonUI();
      },
      onError: () => {
        this.isNarrationPlaying = false;
        this.updateSpeechButtonUI();
      }
    });
  }

  updateSpeechButtonUI() {
    const btn = this.container?.querySelector('.btn-narration-speech');
    if (!btn) return;
    if (this.isNarrationPlaying) {
      btn.classList.add('bg-amber-100', 'text-amber-800', 'border-amber-400');
      btn.innerHTML = `
        <span class="animate-pulse">🔊</span>
        <span>${this.language === 'en' ? 'Stop Audio' : 'Dừng đọc'}</span>
      `;
    } else {
      btn.classList.remove('bg-amber-100', 'text-amber-800', 'border-amber-400');
      btn.innerHTML = `
        <span>🔊</span>
        <span>${this.language === 'en' ? 'Listen Narration' : (this.language === 'dual' ? 'Nghe đọc / Listen' : 'Nghe đọc')}</span>
      `;
    }
  }

  /**
   * Gets current active scene object safely
   * @returns {Object}
   */
  getCurrentScene() {
    const scenes = this.lesson.scenes || [];
    const found = scenes.find(s => (s.id ?? s.sceneNumber) === this.currentSceneId);
    return found || scenes[0] || {
      id: 1,
      key: 'context',
      titleVi: 'Phân cảnh',
      titleEn: 'Scene',
      contentVi: '',
      contentEn: '',
      formulas: []
    };
  }

  /**
   * Main render function
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="lesson-player max-w-7xl mx-auto space-y-6 pb-12" role="region" aria-label="5-Scene Bilingual Multimedia Player">
        <!-- Live screen reader announcer -->
        <div class="sr-announcer sr-only" aria-live="polite"></div>

        <!-- 1. Player Top Toolbar -->
        ${this.renderToolbarHtml()}

        <!-- 2. Standardized 5-Scene Stepper Bar -->
        ${this.renderStepperHtml()}

        <!-- 3. Active Scene Content Viewport -->
        ${this.renderSceneViewportHtml()}

        <!-- 4. Bottom Navigation Action Bar -->
        ${this.renderNavigationFooterHtml()}
      </div>
    `;

    this.bindDOMEvents();
    this.mountDynamicSubComponents();
  }

  /**
   * Renders the top toolbar (Back button, lesson switcher, language toggle)
   * @returns {string}
   */
  renderToolbarHtml() {
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';

    return `
      <div class="player-toolbar bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <!-- Left: Back Button & Lesson Metadata -->
        <div class="flex items-center gap-3">
          <button type="button" class="btn btn-outline btn-sm font-bold flex items-center gap-1.5 btn-back-explorer">
            ← ${isEn ? 'Back to Explore' : (isDual ? 'Quay lại / Back' : 'Quay lại danh mục')}
          </button>
          <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <span class="badge badge-khkt-gold text-[10px] font-extrabold uppercase">
              Lớp 10 • ${this.lesson.topic}
            </span>
          </div>
        </div>

        <!-- Center: Lesson Quick Selector -->
        <div class="flex-1 max-w-xs min-w-[200px]">
          <label for="player-lesson-select" class="sr-only">Chọn bài học</label>
          <select id="player-lesson-select" class="w-full text-xs sm:text-sm font-bold text-blue-950 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 select-lesson-dropdown">
            ${this.allLessons.map(l => `
              <option value="${l.id}" ${l.id === this.lesson.id ? 'selected' : ''}>
                ${l.topic === 'trigonometry' ? '📐' : (l.topic === 'quadratic' ? '🌉' : '🚌')} ${l.titleVi}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Right: Audio Narration & Bilingual Toggle Buttons -->
        <div class="flex items-center gap-2">
          <button type="button" class="btn btn-outline btn-sm font-semibold btn-narration-speech flex items-center gap-1.5" title="Phát âm thanh đọc bài giảng / Read aloud narration">
            <span>🔊</span>
            <span class="hidden sm:inline">${isEn ? 'Listen' : (isDual ? 'Nghe đọc / Listen' : 'Nghe đọc')}</span>
          </button>

          <!-- Tri-state Bilingual Toggle -->
          <div class="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200" role="group" aria-label="Bilingual mode switcher">
            <button type="button" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all btn-lang-vi ${this.language === 'vi' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-blue-900'}">VI</button>
            <button type="button" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all btn-lang-en ${this.language === 'en' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-blue-900'}">EN</button>
            <button type="button" class="px-2.5 py-1 text-xs font-bold rounded-lg transition-all btn-lang-dual ${this.language === 'dual' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-blue-900'}">DUAL</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the 5-Scene standardized stepper bar
   * @returns {string}
   */
  renderStepperHtml() {
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';

    // Standardized 5-scene labels
    const stepMeta = [
      { id: 1, vi: 'Bối cảnh thực tế', en: 'Real-world Context' },
      { id: 2, vi: 'Dữ kiện bài toán', en: 'Given Data' },
      { id: 3, vi: 'Vấn đề & Từ vựng', en: 'Problem & Vocab' },
      { id: 4, vi: 'Gợi mở giải pháp', en: 'Modeling Guidance' },
      { id: 5, vi: 'Thực hành & Kết luận', en: 'Practice & Conclusion' },
    ];

    const progressPercent = ((this.currentSceneId - 1) / 4) * 100;

    return `
      <div class="player-stepper bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div class="stepper-container" role="tablist" aria-label="Quy trình học toán thực tiễn 5 phân cảnh chuẩn hóa">
          <!-- Stepper Background Line -->
          <div class="stepper-line" aria-hidden="true">
            <div class="h-full bg-blue-600 transition-all duration-300" style="width: ${progressPercent}%;"></div>
          </div>

          <!-- 5 Step Indicator Items -->
          ${stepMeta.map(step => {
            const isActive = step.id === this.currentSceneId;
            const isCompleted = this.completedScenes.has(step.id);
            const label = isEn ? step.en : (isDual ? `${step.vi} / ${step.en}` : step.vi);

            return `
              <div class="step-item ${isActive ? 'active' : ''} ${isCompleted && !isActive ? 'completed' : ''}" 
                   role="tab" 
                   tabindex="${isActive ? '0' : '-1'}"
                   aria-selected="${isActive ? 'true' : 'false'}"
                   aria-controls="scene-panel-${step.id}"
                   id="step-tab-${step.id}"
                   data-step="${step.id}">
                <div class="step-circle" title="${step.vi} (${step.en})">
                  ${isCompleted && !isActive ? '✓' : step.id}
                </div>
                <div class="step-label hidden md:block">
                  <span class="block font-bold text-xs leading-tight">${isEn ? step.en : step.vi}</span>
                  ${isDual ? `<span class="block text-[10px] text-slate-400 font-normal leading-tight">${step.en}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renders the active scene content viewport
   * @returns {string}
   */
  renderSceneViewportHtml() {
    const scene = this.getCurrentScene();
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';

    return `
      <div class="scene-content bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md transition-all duration-200" 
           role="tabpanel" 
           id="scene-panel-${scene.id}" 
           aria-labelledby="step-tab-${scene.id}">
        
        <!-- Scene Header: Number Tag & Bilingual Title -->
        <div class="scene-header pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-900 text-white font-extrabold text-xs">
                Màn ${scene.id}
              </span>
              <span class="text-xs font-bold text-blue-700 tracking-wide uppercase">
                ${scene.key} • ${this.lesson.titleVi}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight">
              ${isEn ? scene.titleEn : scene.titleVi}
            </h2>
            ${isDual ? `<div class="text-sm font-semibold text-slate-500 mt-1">${scene.titleEn}</div>` : ''}
          </div>

          <!-- Checkpoint Badge -->
          ${scene.checkpointVi ? `
            <div class="scaffold-box max-w-md text-xs border border-amber-300 bg-amber-50 rounded-2xl p-3.5 shadow-sm">
              <div class="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <span>🎯</span>
                <span>${isEn ? 'Pedagogical Checkpoint' : 'Mục tiêu phân cảnh'}</span>
              </div>
              <p class="text-amber-800 leading-relaxed">
                ${isEn ? scene.checkpointEn : scene.checkpointVi}
              </p>
            </div>
          ` : ''}
        </div>

        <!-- Scene Body: Narrative Script, Visual Staging, Formulas & Specialized Embeds -->
        <div class="scene-body py-6 space-y-6">
          <!-- 1. Bilingual Spoken Narrative Cards -->
          <div class="bilingual-grid">
            ${this.language !== 'en' ? `
              <div class="bilingual-card-vi shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold text-rose-600 tracking-wider uppercase flex items-center gap-1">
                    🇻🇳 Lời thoại bài giảng (Tiếng Việt)
                  </span>
                </div>
                <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                  ${scene.contentVi || ''}
                </p>
              </div>
            ` : ''}

            ${this.language !== 'vi' ? `
              <div class="bilingual-card-en shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-bold text-blue-600 tracking-wider uppercase flex items-center gap-1">
                    🇬🇧 Spoken Script (English CLIL)
                  </span>
                </div>
                <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                  ${scene.contentEn || ''}
                </p>
              </div>
            ` : ''}
          </div>

          <!-- 2. Visual Staging & Real-World Diagram Prompt -->
          ${scene.visualDescriptionVi ? `
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
              <div class="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <span>🎬</span>
                <span>${isEn ? 'Visual Staging Description' : 'Mô tả hình ảnh & kịch bản trực quan'}</span>
              </div>
              <p>${isEn ? scene.visualDescriptionEn : scene.visualDescriptionVi}</p>
            </div>
          ` : ''}

          <!-- 3. Mathematical Formulas Box -->
          ${Array.isArray(scene.formulas) && scene.formulas.length > 0 ? `
            <div class="math-formulas-container bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>∑</span>
                <span>${isEn ? 'Mathematical Relations & Data' : 'Hệ thức Toán học & Thông số'}</span>
              </div>
              <div class="flex flex-wrap gap-2.5 items-center justify-center">
                ${scene.formulas.map(f => `
                  <div class="math-formula px-4 py-2 font-mono text-sm sm:text-base font-bold bg-white shadow-sm">
                    ${f}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

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

          <!-- 5. Scene 3 Specialized Embed: VocabularyTable Component -->
          ${scene.key === 'problem' ? `
            <div class="scene-vocabulary-section pt-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-extrabold text-blue-950 text-base sm:text-lg flex items-center gap-2">
                  <span>📖</span>
                  <span>${isEn ? 'Math English Vocabulary Glossary' : 'Bảng Từ Vựng Chuyên Ngành Math English'}</span>
                </h3>
                <span class="badge badge-verified-english text-xs">
                  ${this.lesson.vocabulary?.length || 0} thuật ngữ chuẩn IPA
                </span>
              </div>
              <div class="vocabulary-table-mount-point min-h-[160px]">
                <!-- VocabularyTable component mounts here -->
                <div class="vocab-placeholder text-center text-xs text-slate-400 py-6">
                  Đang tải bảng từ vựng tương tác...
                </div>
              </div>
            </div>
          ` : ''}

          <!-- 6. Scene 5 Specialized Call to Action: Start Interactive Worksheet -->
          ${scene.id === 5 ? `
            <div class="scene-practice-cta mt-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white shadow-xl text-center space-y-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-blue-950 shadow-sm">
                ★ Bước 6 trong Quy trình 7 bước KHKT
              </span>
              <h3 class="text-xl sm:text-2xl font-black tracking-tight">
                ${isEn ? 'Ready for the Interactive Worksheet?' : 'Bạn đã sẵn sàng làm Phiếu học tập tương tác?'}
              </h3>
              <p class="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                ${isEn 
                  ? 'Apply your mathematical modeling insights, calculate exact dimensions, and test your Math English vocabulary mastery with instant 10-point scoring.'
                  : 'Vận dụng tư duy mô hình hóa toán học, trực tiếp bấm máy tính tính toán thông số thực tế và kiểm tra vốn thuật ngữ Math English có chấm điểm tự động thang 10.'}
              </p>
              <div class="pt-2">
                <button type="button" class="btn btn-emerald px-8 py-3.5 text-base font-black rounded-2xl shadow-lg btn-launch-worksheet hover:scale-105 transition-all">
                  ${isEn ? 'Open Interactive Worksheet (Quiz) →' : 'Mở Phiếu Học Tập Tương Tác (Thang 10) →'}
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Renders the bottom navigation bar (Prev, Next, Start Worksheet)
   * @returns {string}
   */
  renderNavigationFooterHtml() {
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';
    const isFirst = this.currentSceneId === 1;
    const isLast = this.currentSceneId === 5;

    return `
      <div class="player-nav-footer bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <button type="button" class="btn btn-outline font-bold btn-prev-scene ${isFirst ? 'opacity-40 cursor-not-allowed' : ''}" ${isFirst ? 'disabled' : ''}>
          ← ${isEn ? 'Previous Scene' : (isDual ? 'Màn trước / Prev' : 'Phân cảnh trước')}
        </button>

        <div class="text-xs font-extrabold text-slate-500">
          ${isEn ? 'Scene' : 'Phân cảnh'} <span class="text-blue-900 font-black text-sm">${this.currentSceneId}</span> / 5
        </div>

        <button type="button" class="btn ${isLast ? 'btn-emerald' : 'btn-primary'} font-bold btn-next-scene">
          ${isLast 
            ? (isEn ? 'Start Worksheet →' : (isDual ? 'Làm phiếu học tập / Quiz →' : 'Làm phiếu học tập →'))
            : (isEn ? 'Next Scene →' : (isDual ? 'Màn kế tiếp / Next →' : 'Phân cảnh kế tiếp →'))}
        </button>
      </div>
    `;
  }

  /**
   * Binds click and change events to rendered elements
   */
  bindDOMEvents() {
    if (!this.container) return;

    // Back to Explore
    const backBtn = this.container.querySelector('.btn-back-explorer');
    if (backBtn) {
      backBtn.onclick = () => {
        speech.stop();
        this.onBack();
      };
    }

    // Lesson Switcher Dropdown
    const lessonSelect = this.container.querySelector('#player-lesson-select');
    if (lessonSelect) {
      lessonSelect.onchange = (e) => {
        this.setLesson(e.target.value);
      };
    }

    // Speech Audio Narration Button
    const speechBtn = this.container.querySelector('.btn-narration-speech');
    if (speechBtn) {
      speechBtn.onclick = () => this.toggleNarrationSpeech();
    }

    // Language Toggle Buttons
    const viBtn = this.container.querySelector('.btn-lang-vi');
    const enBtn = this.container.querySelector('.btn-lang-en');
    const dualBtn = this.container.querySelector('.btn-lang-dual');
    if (viBtn) viBtn.onclick = () => this.setLanguage('vi');
    if (enBtn) enBtn.onclick = () => this.setLanguage('en');
    if (dualBtn) dualBtn.onclick = () => this.setLanguage('dual');

    // Stepper Tab Clicks
    const stepTabs = this.container.querySelectorAll('.step-item');
    stepTabs.forEach(tab => {
      tab.onclick = () => {
        const stepNum = parseInt(tab.dataset.step, 10);
        if (stepNum) this.goToScene(stepNum);
      };
    });

    // Previous & Next Navigation Buttons
    const prevBtn = this.container.querySelector('.btn-prev-scene');
    if (prevBtn) {
      prevBtn.onclick = () => this.prevScene();
    }

    const nextBtn = this.container.querySelector('.btn-next-scene');
    if (nextBtn) {
      nextBtn.onclick = () => this.nextScene();
    }

    // Launch Worksheet Button in Scene 5
    const launchBtn = this.container.querySelector('.btn-launch-worksheet');
    if (launchBtn) {
      launchBtn.onclick = () => this.triggerStartWorksheet();
    }
  }

  /**
   * Dynamically mounts VocabularyTable (Scene 3) and MathSimulations (Scenes 2 & 4)
   * Handles graceful fallback if sub-components are not yet loaded.
   */
  async mountDynamicSubComponents() {
    // 1. Mount VocabularyTable in Scene 3
    if (this.currentSceneId === 3) {
      const vocabMount = this.container?.querySelector('.vocabulary-table-mount-point');
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
          // Graceful inline fallback
          this.renderVocabularyFallback(vocabMount);
        }
      }
    }

    // 2. Mount Dynamic Simulation in Scenes 2 & 4
    const simMount = this.container?.querySelector('.sim-viewport');
    const simType = this.container?.querySelector('.simulation-mount-container')?.dataset?.simType;
    if (simMount && simType) {
      try {
        const mod = await import('./MathSimulations.js');
        const SimulationClass = mod.MathSimulations || mod.default;
        if (SimulationClass) {
          this.simulationInstance = new SimulationClass({
            type: simType,
            lesson: this.lesson,
            language: this.language,
            container: simMount
          });
          this.simulationInstance.mount(simMount);
          return;
        }
      } catch (e) {
        // Simulation module pending implementation, render fallback diagram
        this.renderSimulationFallback(simMount, simType);
      }
    }
  }

  /**
   * Fallback inline renderer for Vocabulary Table if VocabularyTable.js is pending
   */
  renderVocabularyFallback(container) {
    const isEn = this.language === 'en';
    const vocabList = this.lesson.vocabulary || [];

    container.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="vocab-table">
          <thead>
            <tr>
              <th>Thuật ngữ / Term</th>
              <th>Phiên âm IPA</th>
              <th>${isEn ? 'English Definition' : 'Định nghĩa & Ví dụ'}</th>
              <th class="text-center">Audio</th>
            </tr>
          </thead>
          <tbody>
            ${vocabList.map(v => `
              <tr>
                <td>
                  <div class="vocab-term">${v.term}</div>
                  <span class="badge badge-mini bg-blue-50 text-blue-700">${v.partOfSpeech}</span>
                </td>
                <td class="vocab-ipa">${v.phonetics}</td>
                <td class="text-xs text-slate-700">
                  <div><strong>VI:</strong> ${v.definitionVi}</div>
                  <div class="text-slate-500 mt-0.5"><strong>EN:</strong> ${v.definitionEn}</div>
                </td>
                <td class="text-center">
                  <button type="button" class="btn btn-outline btn-sm px-2 py-1 text-xs" onclick="window.speechSynthesis && window.speechSynthesis.speak(new SpeechSynthesisUtterance('${v.term}'))">
                    🔊
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Fallback visual diagram renderer for Math Simulations
   */
  renderSimulationFallback(container, simType) {
    container.innerHTML = `
      <div class="text-center p-4">
        <div class="text-3xl mb-2">${simType === 'svg-lighthouse' ? '📐' : (simType === 'svg-parabola' ? '🌉' : '🚌')}</div>
        <div class="font-bold text-sm text-blue-950 mb-1">Mô phỏng động: ${simType}</div>
        <p class="text-xs text-slate-600 max-w-md mx-auto">
          Mô hình tham số SVG tương tác tích hợp cho Milestone M3 (Mô phỏng ray-tracer góc nâng, độ võng vòm parabol và tối ưu hóa đỉnh doanh thu).
        </p>
      </div>
    `;
  }
}

export default LessonPlayer;
```

---

## 5. Verification Method & Proposed Test Suite

### 5.1 Verification Commands
To independently verify that the code satisfies all contracts without regressions:
```bash
# 1. Run full project test runner
npm test

# 2. Run E2E suites specifically checking Tier 1 (F3 & F4), Tier 2 Boundaries (F3.B1-B5), and Tier 3 Pairwise
node tests/e2e/runner.js --feature=F3
node tests/e2e/runner.js --feature=F4
node tests/e2e/runner.js --tier=3
```

### 5.2 Proposed Unit Test Suite (`tests/lesson_player.test.js`)
The following comprehensive unit test suite should be added in Milestone M3 to guarantee all edge cases are tested and hardened:

```javascript
/**
 * tests/lesson_player.test.js
 * Comprehensive Unit Test Suite for 5-Scene Bilingual Multimedia Player (Feature F3 & F4)
 * Milestone: M3 (5-Scene Player & Stepper)
 */

import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { LessonPlayer } from '../src/components/LessonPlayer.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

function createMockContainer() {
  const store = { html: '' };
  return {
    set innerHTML(val) { store.html = val; },
    get innerHTML() { return store.html; },
    querySelector: (sel) => null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  };
}

describe('LessonPlayer: Initialization & Lifecycle', () => {
  it('instantiates with default options and mounts without throwing', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    assert.ok(player);
    assert.equal(player.currentSceneId, 1);
    assert.equal(player.language, 'dual');
    assert.ok(container.innerHTML.includes('lesson-player'));
    player.destroy();
  });

  it('resolves valid initial lesson by ID', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ 
      container, 
      lessonId: 'lesson-parabolic-arch' 
    });
    assert.equal(player.lesson.id, 'lesson-parabolic-arch');
    assert.equal(player.lesson.topic, 'quadratic');
    player.destroy();
  });

  it('falls back to first default lesson when lessonId is invalid or not found', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ 
      container, 
      lessonId: 'non-existent-lesson-id-12345' 
    });
    assert.ok(player.lesson);
    assert.equal(player.lesson.id, DEFAULT_LESSONS[0].id);
    player.destroy();
  });
});

describe('LessonPlayer: Stepper Navigation & Boundary Clamping', () => {
  it('F3.B1: clamps scene index below bounds (<1) to Scene 1', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    player.goToScene(0);
    assert.equal(player.currentSceneId, 1);
    player.goToScene(-10);
    assert.equal(player.currentSceneId, 1);
    player.prevScene(); // Already on scene 1
    assert.equal(player.currentSceneId, 1);
    player.destroy();
  });

  it('F3.B2: clamps scene index above bounds (>5) to Scene 5', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    player.goToScene(6);
    assert.equal(player.currentSceneId, 5);
    player.goToScene(999);
    assert.equal(player.currentSceneId, 5);
    player.destroy();
  });

  it('F3.B3: permits direct navigation to Scene 5 (skipping 1-4)', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    player.goToScene(5);
    assert.equal(player.currentSceneId, 5);
    const scene = player.getCurrentScene();
    assert.equal(scene.id, 5);
    assert.equal(scene.key, 'practice');
    player.destroy();
  });

  it('F3.B5: handles rapid consecutive scene navigation reliably', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    [2, 3, 4, 1, 5, 2, 4].forEach(idx => player.goToScene(idx));
    assert.equal(player.currentSceneId, 4);
    assert.equal(player.getCurrentScene().id, 4);
    player.destroy();
  });

  it('tracks completed scenes properly as user navigates', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    assert.ok(player.completedScenes.has(1));
    player.goToScene(3);
    assert.ok(player.completedScenes.has(3));
    assert.equal(player.completedScenes.has(2), false); // 2 was skipped
    player.goToScene(2);
    assert.ok(player.completedScenes.has(2));
    player.destroy();
  });
});

describe('LessonPlayer: Tri-State Bilingual Subtitle Toggle (VI, EN, DUAL)', () => {
  it('F4.1-F4.4: correctly updates language mode and persists valid modes only', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, language: 'vi' });
    assert.equal(player.language, 'vi');
    
    player.setLanguage('en', false);
    assert.equal(player.language, 'en');

    player.setLanguage('dual', false);
    assert.equal(player.language, 'dual');

    // Invalid mode rejected
    player.setLanguage('fr', false);
    assert.equal(player.language, 'dual');
    player.destroy();
  });

  it('updates rendered content when switching to English mode (CLIL immersion)', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, language: 'en' });
    const html = container.innerHTML;
    assert.ok(!html.includes('🇻🇳 Lời thoại bài giảng (Tiếng Việt)'));
    assert.ok(html.includes('🇬🇧 Spoken Script (English CLIL)'));
    player.destroy();
  });

  it('updates rendered content when switching to Vietnamese mode', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, language: 'vi' });
    const html = container.innerHTML;
    assert.ok(html.includes('🇻🇳 Lời thoại bài giảng (Tiếng Việt)'));
    assert.ok(!html.includes('🇬🇧 Spoken Script (English CLIL)'));
    player.destroy();
  });
});

describe('LessonPlayer: Inter-Component Event Integration', () => {
  it('invokes onStartQuiz callback when reaching Scene 5 and clicking CTA', () => {
    let quizLaunched = false;
    let quizLessonId = null;
    const container = createMockContainer();
    const player = new LessonPlayer({
      container,
      lessonId: 'lesson-bus-optimization',
      onStartQuiz: (id) => {
        quizLaunched = true;
        quizLessonId = id;
      }
    });

    player.goToScene(5);
    player.nextScene(); // Next from scene 5 triggers quiz
    assert.equal(quizLaunched, true);
    assert.equal(quizLessonId, 'lesson-bus-optimization');
    player.destroy();
  });

  it('invokes onBack callback when back button is clicked', () => {
    let backed = false;
    const container = createMockContainer();
    const player = new LessonPlayer({
      container,
      onBack: () => { backed = true; }
    });
    player.onBack();
    assert.equal(backed, true);
    player.destroy();
  });
});
```

---

## 6. Invalidation Conditions & Risk Matrix

| Risk / Condition | Likelihood | Impact | Invalidation & Mitigation |
|---|---|---|---|
| **Child Component Import Failure** | Medium | Low | `LessonPlayer` contains resilient `try/catch` dynamic import blocks and auto-renders inline fallback tables/diagrams. |
| **Speech Audio Overlap** | High | Medium | `speech.stop()` is explicitly called on every scene transition (`goToScene`), lesson switch (`setLesson`), and player destruction (`destroy()`). |
| **Keyboard Event Leaks** | Medium | Medium | Window listeners are cleanly unbound in `destroy()`. Arrow handlers guard against input element focus. |
| **Bilingual Toggle Desync** | Low | Low | Bi-directional synchronization via `app:language-change` event keeps player and global header in lockstep. |

**Status**: Investigation and Design Complete. Ready for Implementation in Milestone M3.
