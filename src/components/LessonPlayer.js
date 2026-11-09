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
import { renderMath } from '../services/mathRenderer.js';

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

    if (this.container) {
      this.mount(this.container);
    }
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
    this.isNarrationPlaying = false;
    this.destroySubComponents();
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }

  /**
   * Destroys child subcomponents (VocabularyTable, MathSimulations) and releases event listeners
   */
  destroySubComponents() {
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
    // Do not intercept if user is typing inside an input, select or textarea
    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement;
      if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
        return;
      }
    }

    if (e.key === 'ArrowLeft') {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      this.prevScene();
    } else if (e.key === 'ArrowRight') {
      if (typeof e.preventDefault === 'function') e.preventDefault();
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
    if (broadcast && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
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
    this.isNarrationPlaying = false;
    this.destroySubComponents();
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
    this.destroySubComponents();
    const clamped = Math.max(1, Math.min(5, Number(sceneId) || 1));
    this.currentSceneId = clamped;
    this.completedScenes.add(clamped);
    this.render();
    this.onSceneChange(clamped);

    // Announce to screen readers
    const announcer = this.container?.querySelector ? this.container.querySelector('.sr-announcer') : null;
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
    this.isNarrationPlaying = false;
    this.destroySubComponents();
    if (typeof this.onStartQuiz === 'function') {
      this.onStartQuiz(this.lesson.id);
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: this.lesson.id } }));
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
    const contentVi = scene.contentVi || '';
    const contentEn = scene.contentEn || '';
    const textToSpeak = this.language === 'en' 
      ? contentEn 
      : (this.language === 'vi' ? contentVi : [contentVi, contentEn].filter(Boolean).join('. '));
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
    const btn = this.container?.querySelector ? this.container.querySelector('.btn-narration-speech') : null;
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
    const sceneIdVal = scene.id ?? scene.sceneNumber ?? this.currentSceneId;

    return `
      <div class="scene-content bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md transition-all duration-200" 
           role="tabpanel" 
           id="scene-panel-${sceneIdVal}" 
           aria-labelledby="step-tab-${sceneIdVal}">
        
        <!-- Scene Header: Number Tag & Bilingual Title -->
        <div class="scene-header pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-blue-900 text-white font-extrabold text-xs whitespace-nowrap leading-snug flex-shrink-0" style="min-width: 56px; min-height: 28px; line-height: 1.25; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; box-sizing: border-box; white-space: nowrap;">
                Màn ${sceneIdVal}
              </span>
              <span class="text-xs font-bold text-blue-700 tracking-wide uppercase">
                ${scene.key || 'scene'} • ${this.lesson.titleVi || this.lesson.title || ''}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight">
              ${isEn ? (scene.titleEn || scene.titleVi || '') : (scene.titleVi || scene.titleEn || '')}
            </h2>
            ${isDual && scene.titleEn ? `<div class="text-sm font-semibold text-slate-500 mt-1">${scene.titleEn}</div>` : ''}
          </div>

          <!-- Checkpoint Badge -->
          ${(scene.checkpointVi || scene.checkpointEn) ? `
            <div class="scaffold-box max-w-md text-xs border border-amber-300 bg-amber-50 rounded-2xl p-3.5 shadow-sm">
              <div class="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <span>🎯</span>
                <span>${isEn ? 'Pedagogical Checkpoint' : 'Mục tiêu phân cảnh'}</span>
              </div>
              <p class="text-amber-800 leading-relaxed">
                ${isEn ? (scene.checkpointEn || scene.checkpointVi || '') : (scene.checkpointVi || scene.checkpointEn || '')}
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
          ${(scene.visualDescriptionVi || scene.visualDescriptionEn) ? `
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
              <div class="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <span>🎬</span>
                <span>${isEn ? 'Visual Staging Description' : 'Mô tả hình ảnh & kịch bản trực quan'}</span>
              </div>
              <p>${isEn ? (scene.visualDescriptionEn || scene.visualDescriptionVi || '') : (scene.visualDescriptionVi || scene.visualDescriptionEn || '')}</p>
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
                    ${renderMath(f)}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 4. Interactive Dynamic Simulation Stage (Scenes 2 & 4) -->
          ${(scene.interactiveType && [2, 4].includes(this.currentSceneId)) ? `
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
          ${sceneIdVal === 5 ? `
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
    if (!this.container || typeof this.container.querySelector !== 'function') return;

    // Back to Explore
    const backBtn = this.container.querySelector('.btn-back-explorer');
    if (backBtn) {
      backBtn.onclick = () => {
        speech.stop();
        this.isNarrationPlaying = false;
        this.destroySubComponents();
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
    const stepTabs = this.container.querySelectorAll ? this.container.querySelectorAll('.step-item') : [];
    if (stepTabs && stepTabs.forEach) {
      stepTabs.forEach(tab => {
        tab.onclick = () => {
          const stepNum = parseInt(tab.dataset ? tab.dataset.step : tab.getAttribute('data-step'), 10);
          if (stepNum) this.goToScene(stepNum);
        };
      });
    }

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

  /**
   * Fallback inline renderer for Vocabulary Table if VocabularyTable.js is pending
   */
  renderVocabularyFallback(container) {
    if (!container) return;
    const isEn = this.language === 'en';
    const vocabList = this.lesson.vocabulary || [];

    container.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="vocab-table w-full text-left">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <th class="p-3">Thuật ngữ / Term</th>
              <th class="p-3">Phiên âm IPA</th>
              <th class="p-3">${isEn ? 'English Definition' : 'Định nghĩa & Ví dụ'}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            ${vocabList.map(v => `
              <tr>
                <td class="p-3 font-bold text-slate-900">${v.term}</td>
                <td class="p-3 font-mono text-slate-500">${v.phonetics}</td>
                <td class="p-3 text-slate-700">
                  <div><strong>VI:</strong> ${v.definitionVi}</div>
                  <div class="text-slate-500 mt-0.5"><strong>EN:</strong> ${v.definitionEn}</div>
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
    if (!container) return;
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
