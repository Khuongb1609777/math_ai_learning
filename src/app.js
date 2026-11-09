/**
 * src/app.js
 * Root SPA Controller & Application Router
 * Milestone: M2 (Navigation, Collection Explorer & KHKT Research Showcase)
 * 
 * Features:
 * - Application State Store (activeTab, currentLessonId, language, modal state)
 * - Header & Responsive Navigation integration
 * - View routing: Collection Explorer, 5-Scene Player, Studio, Survey
 * - Dynamic KHKT Research Showcase Modal container
 * - Persistent language setting ('dual' default) in user_settings
 * - Universal fallback components for upcoming milestones
 */

import { Header } from './components/Header.js';
import * as storage from './services/storage.js';
import { DEFAULT_LESSONS } from './data/lessons.js';

export class App {
  constructor() {
    this.state = {
      activeTab: 'explore',
      currentLessonId: null,
      language: this.loadSavedLanguage(),
      theme: 'light',
      isShowcaseModalOpen: false,
      lessons: [],
    };

    this.header = null;
    this.collectionExplorer = null;
    this.lessonPlayer = null;
    this.showcasePage = null;
    this.showcaseModal = null;
    this._KhktShowcaseModalClass = null;
    this._showcaseImportPromise = null;

    // Bind event handlers
    this.handleNavigate = this.handleNavigate.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleOpenShowcase = this.handleOpenShowcase.bind(this);
    this.handleCloseShowcase = this.handleCloseShowcase.bind(this);
    this.handleSelectLesson = this.handleSelectLesson.bind(this);
    this.handleBackToExplore = this.handleBackToExplore.bind(this);
    this.loadLesson = this.loadLesson.bind(this);
  }

  /**
   * Loads language setting from localStorage with fallback to 'dual'
   * Conforms strictly with Tier 2 boundary test F14.B5
   * @returns {'vi'|'en'|'dual'}
   */
  loadSavedLanguage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem('user_settings');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (['vi', 'en', 'dual'].includes(parsed.lang)) {
            return parsed.lang;
          }
        }
      } catch (e) {
        // Safe fallback
      }
    }
    return 'dual';
  }

  /**
   * Persists user settings to localStorage
   */
  saveUserSettings() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const current = {
          theme: this.state.theme || 'light',
          lang: this.state.language || 'dual',
          updatedAt: new Date().toISOString()
        };
        window.localStorage.setItem('user_settings', JSON.stringify(current));
      } catch (e) {
        // Storage full or private mode
      }
    }
  }

  /**
   * Initializes application, loads data, and mounts components
   */
  async init() {
    // 1. Load lessons from storage service (merges default + custom)
    try {
      this.state.lessons = storage.getLessons() || DEFAULT_LESSONS;
    } catch (e) {
      this.state.lessons = DEFAULT_LESSONS;
    }

    // 2. Persist initial settings if not already present
    this.saveUserSettings();

    // 3. Mount Header
    const headerContainer = document.querySelector('.app-header') || document.getElementById('app-header');
    if (headerContainer) {
      this.header = new Header({
        activeTab: this.state.activeTab,
        language: this.state.language,
        onNavigate: this.handleNavigate,
        onLanguageChange: this.handleLanguageChange,
        onOpenShowcase: this.handleOpenShowcase
      });
      this.header.mount(headerContainer);
    }

    // 4. Listen to global window events for cross-component coordination
    const handleLessonSelectEvent = (e) => {
      const lessonId = e.detail?.lessonId || (typeof e.detail === 'string' ? e.detail : null);
      if (lessonId) {
        this.handleSelectLesson(lessonId);
      }
    };
    window.addEventListener('lesson:select', handleLessonSelectEvent);
    window.addEventListener('lesson-select', handleLessonSelectEvent);

    window.addEventListener('app:navigate', (e) => {
      const tab = e.detail?.tab;
      if (tab) {
        this.handleNavigate(tab);
      }
    });

    window.addEventListener('quiz:start', (e) => {
      const lessonId = e.detail?.lessonId;
      if (lessonId) {
        this.state.currentLessonId = lessonId;
      }
      this.handleNavigate('quiz', true);
    });

    window.addEventListener('modal:open-showcase', () => {
      this.handleOpenShowcase();
    });

    window.addEventListener('khkt:modal-closed', (e) => {
      // Ignore close events from superseded/orphaned modal instances
      if (e?.detail?.modal && this.showcaseModal && e.detail.modal !== this.showcaseModal) {
        return;
      }
      // Guard against state inversion: do not set false if active modal is open
      if (this.showcaseModal && this.showcaseModal.isOpen()) {
        return;
      }
      this.state.isShowcaseModalOpen = false;
    });

    window.addEventListener('app:language-change', (e) => {
      const newLang = e.detail?.lang;
      if (newLang && ['vi', 'en', 'dual'].includes(newLang) && newLang !== this.state.language) {
        this.handleLanguageChange(newLang);
      }
    });

    // 5. Render Active View in #main-content
    this.renderMainContent();

    // 6. Render Responsive Footer
    this.renderFooter();

    // Expose global debug reference
    if (typeof window !== 'undefined') {
      window.app = this;
    }
  }

  /**
   * Handles navigation tab switching
   * @param {string} tabId
   */
  handleNavigate(tabId, preserveLesson = false) {
    if (this.state.activeTab === tabId && (!this.state.currentLessonId || preserveLesson)) return;
    if (this.lessonPlayer && typeof this.lessonPlayer.destroy === 'function') {
      this.lessonPlayer.destroy();
      this.lessonPlayer = null;
    }
    if (this.showcasePage && typeof this.showcasePage.destroy === 'function') {
      this.showcasePage.destroy();
      this.showcasePage = null;
    }
    this.state.activeTab = tabId;
    if (!preserveLesson && tabId !== 'player' && tabId !== 'quiz') {
      this.state.currentLessonId = null;
    }
    if ((tabId === 'player' || tabId === 'quiz') && !this.state.currentLessonId) {
      this.state.currentLessonId = this.state.lessons[0]?.id || 'lesson-lighthouse';
    }
    if (this.header) {
      this.header.setActiveTab(tabId);
    }
    this.renderMainContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Handles language toggle (VI / EN / DUAL)
   * @param {'vi'|'en'|'dual'} lang
   */
  handleLanguageChange(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) {
      return;
    }

    this.state.language = lang;
    this.saveUserSettings();

    // Synchronize Header component state
    if (this.header && typeof this.header.setLanguage === 'function') {
      this.header.setLanguage(lang);
    }
    
    // Broadcast event for all active and nested components
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('app:language-change', { detail: { lang } }));
    }
    
    // Re-render views with new language
    this.renderMainContent();
    this.renderFooter();
  }

  /**
   * Opens KHKT Research Showcase modal
   * Defends against in-flight async re-entrancy, concurrent bursts, and state inversion
   */
  async handleOpenShowcase() {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }

    // Helper to check DOM attachment across standard DOM and mock DOMs
    const isNodeAttached = (container, node) => {
      if (!container || !node) return false;
      if (typeof container.contains === 'function') {
        return container.contains(node);
      }
      if (Array.isArray(container.children)) {
        return container.children.includes(node);
      }
      return Array.from(container.children || []).includes(node);
    };

    // Tier 1: Modal instance already exists
    if (this.showcaseModal) {
      const isAttached = isNodeAttached(modalRoot, this.showcaseModal.modalEl);
      if (isAttached && (this.showcaseModal.isOpen() || this.showcaseModal.openRafId)) {
        this.state.isShowcaseModalOpen = true;
        return;
      }
      this.state.isShowcaseModalOpen = true;
      if (this.showcaseModal.options.container !== modalRoot) {
        this.showcaseModal.options.container = modalRoot;
      }
      this.showcaseModal.open();
      return;
    }

    // Tier 2: Module is already imported and cached
    if (this._KhktShowcaseModalClass) {
      this.state.isShowcaseModalOpen = true;
      this.showcaseModal = new this._KhktShowcaseModalClass({
        container: modalRoot,
        language: this.state.language,
        onClose: () => {
          if (!this.showcaseModal || !this.showcaseModal.isOpen()) {
            this.state.isShowcaseModalOpen = false;
          }
        }
      });
      this.showcaseModal.mount(modalRoot);
      return;
    }

    // Tier 3: In-flight Async Dynamic Import Locking & Re-Entrancy Coalescing
    if (this._showcaseImportPromise) {
      this.state.isShowcaseModalOpen = true;
      try {
        await this._showcaseImportPromise;
      } catch (err) {
        if (!this.state.isShowcaseModalOpen) return;
      }

      // Check if user or controller cancelled open while import was pending
      if (!this.state.isShowcaseModalOpen) return;

      // Primary caller has already mounted this.showcaseModal or rendered fallback
      if (this.showcaseModal) {
        const isAttached = isNodeAttached(modalRoot, this.showcaseModal.modalEl);
        if (!isAttached || (!this.showcaseModal.isOpen() && !this.showcaseModal.openRafId)) {
          this.showcaseModal.open();
        }
      }
      return;
    }

    // Tier 4: Primary Dynamic Import Initiator
    this.state.isShowcaseModalOpen = true;

    try {
      this._showcaseImportPromise = import('./components/KhktShowcaseModal.js');
      const module = await this._showcaseImportPromise;
      const KhktShowcaseModal = module?.KhktShowcaseModal;
      this._KhktShowcaseModalClass = KhktShowcaseModal;
      this._showcaseImportPromise = null;

      // Check if user requested close while import was in flight
      if (!this.state.isShowcaseModalOpen) {
        return;
      }

      if (KhktShowcaseModal) {
        if (!this.showcaseModal) {
          this.showcaseModal = new KhktShowcaseModal({
            container: modalRoot,
            language: this.state.language,
            onClose: () => {
              if (!this.showcaseModal || !this.showcaseModal.isOpen()) {
                this.state.isShowcaseModalOpen = false;
              }
            }
          });
          this.showcaseModal.mount(modalRoot);
        } else {
          if (this.showcaseModal.options.container !== modalRoot) {
            this.showcaseModal.options.container = modalRoot;
          }
          this.showcaseModal.open();
        }
        return;
      }
      this.renderShowcaseModalFallback(modalRoot);
    } catch (e) {
      this._showcaseImportPromise = null;
      if (!this.state.isShowcaseModalOpen) return;
      try {
        this.renderShowcaseModalFallback(modalRoot);
      } catch (fallbackError) {
        this.state.isShowcaseModalOpen = false;
      }
    }
  }

  /**
   * Closes KHKT Research Showcase modal
   */
  handleCloseShowcase() {
    this.state.isShowcaseModalOpen = false;
    if (this.showcaseModal && typeof this.showcaseModal.close === 'function') {
      this.showcaseModal.close();
    }
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = '';
    }
  }

  /**
   * Handles lesson selection (from Collection Explorer or direct link)
   * @param {string} lessonId
   */
  handleSelectLesson(lessonId) {
    this.state.activeTab = 'player';
    this.state.currentLessonId = lessonId;
    if (this.header) {
      this.header.setActiveTab('player');
    }
    this.renderMainContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Programmatic entry point to load a lesson into the 5-scene player
   * @param {string} lessonId
   */
  loadLesson(lessonId) {
    this.handleSelectLesson(lessonId);
  }

  /**
   * Returns from Player back to Explore Collection
   */
  handleBackToExplore() {
    this.handleNavigate('explore');
  }

  /**
   * Renders the primary workspace inside #main-content
   */
  async renderMainContent() {
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    const { activeTab, currentLessonId, language, lessons } = this.state;

    // Clean up previous LessonPlayer instance when switching away from player tab
    if (activeTab !== 'player' && this.lessonPlayer) {
      if (typeof this.lessonPlayer.destroy === 'function') {
        this.lessonPlayer.destroy();
      }
      this.lessonPlayer = null;
    }

    // Clean up previous KhktShowcasePage instance when switching away from showcase tab
    if (activeTab !== 'showcase' && this.showcasePage) {
      if (typeof this.showcasePage.destroy === 'function') {
        this.showcasePage.destroy();
      }
      this.showcasePage = null;
    }

    // View 1: Collection Explorer (Tab: explore)
    if (activeTab === 'explore') {
      try {
        const { CollectionExplorer } = await import('./components/CollectionExplorer.js');
        if (CollectionExplorer) {
          this.collectionExplorer = new CollectionExplorer({
            lessons,
            language,
            onSelectLesson: this.handleSelectLesson,
            onNavigate: (tab) => this.handleNavigate(tab)
          });
          this.collectionExplorer.mount(mainEl);
          return;
        }
      } catch (e) {
        // Fallback rendered if CollectionExplorer fails to load
        this.renderExplorerPlaceholder(mainEl);
        return;
      }
    }

    // View 2: 5-Scene Multimedia Player (Tab: player)
    if (activeTab === 'player') {
      try {
        const { LessonPlayer } = await import('./components/LessonPlayer.js');
        if (LessonPlayer) {
          if (this.lessonPlayer && typeof this.lessonPlayer.destroy === 'function') {
            this.lessonPlayer.destroy();
          }
          this.lessonPlayer = new LessonPlayer({
            lessonId: currentLessonId,
            language,
            onBack: this.handleBackToExplore,
            onSelectLesson: (id) => {
              this.state.currentLessonId = id;
            },
            onStartQuiz: (id) => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('quiz:start', { detail: { lessonId: id } }));
              }
            }
          });
          this.lessonPlayer.mount(mainEl);
          return;
        }
      } catch (e) {
        this.renderPlayerPlaceholder(mainEl, currentLessonId);
        return;
      }
    }

    // View: Interactive Quiz & Worksheet (Tab: quiz)
    if (activeTab === 'quiz') {
      try {
        const { InteractiveQuiz } = await import('./components/InteractiveQuiz.js');
        if (InteractiveQuiz) {
          const quiz = new InteractiveQuiz({
            lessonId: currentLessonId,
            language,
            onBackToLesson: () => {
              this.handleNavigate('player', true);
            },
            onBackToExplore: () => {
              this.handleNavigate('explore');
            },
            onNavigate: (tab) => {
              this.handleNavigate(tab);
            }
          });
          quiz.mount(mainEl);
          return;
        }
      } catch (e) {
        console.error('Failed to load InteractiveQuiz', e);
      }
    }

    // View 3: Lesson Authoring Studio (Tab: studio)
    if (activeTab === 'studio') {
      try {
        const { AuthoringStudio } = await import('./components/AuthoringStudio.js');
        if (AuthoringStudio) {
          const studio = new AuthoringStudio({ language });
          studio.mount(mainEl);
          return;
        }
      } catch (e) {
        this.renderStudioPlaceholder(mainEl);
        return;
      }
    }

    // View 4: Learner Survey (Tab: survey)
    if (activeTab === 'survey') {
      try {
        const { LearnerSurvey } = await import('./components/LearnerSurvey.js');
        if (LearnerSurvey) {
          const survey = new LearnerSurvey({ language });
          survey.mount(mainEl);
          return;
        }
      } catch (e) {
        this.renderSurveyPlaceholder(mainEl);
        return;
      }
    }

    // View 5: Dedicated KHKT Showcase Page (Tab: showcase)
    if (activeTab === 'showcase') {
      try {
        const { KhktShowcasePage } = await import('./components/KhktShowcasePage.js');
        if (KhktShowcasePage) {
          if (this.showcasePage && typeof this.showcasePage.destroy === 'function') {
            this.showcasePage.destroy();
          }
          this.showcasePage = new KhktShowcasePage({
            language,
            onNavigate: (tab) => {
              this.handleNavigate(tab);
            }
          });
          this.showcasePage.mount(mainEl);
          return;
        }
      } catch (e) {
        console.error('Failed to load KhktShowcasePage', e);
      }
    }
  }

  /**
   * Fallback rendering for Collection Explorer
   */
  renderExplorerPlaceholder(container) {
    const isEn = this.state.language === 'en';
    const isDual = this.state.language === 'dual';
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Hero Banner -->
        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div class="max-w-2xl relative z-10">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-blue-950 mb-4 shadow-sm">
              ★ ${isEn ? 'KHKT 2026-2027 Research Project' : 'Dự án KHKT Quốc gia 2026-2027'}
            </span>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              ${isEn ? 'Practical Mathematics Integrated with English (CLIL)' : 'Học Toán Thực Tiễn Tích Hợp Tiếng Anh (Lớp 10)'}
            </h1>
            <p class="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              ${isEn 
                ? 'Digitalizing the 5-scene storyboard learning cycle. Interactive glossary, Web Speech audio pronunciation, dynamic SVG simulations, and independent 2-layer verification.'
                : 'Số hóa quy trình học toán thực tiễn 5 phân cảnh chuẩn hóa. Tích hợp từ vựng Math English tương tác, mô phỏng tham số trực quan và kiểm chứng 2 lớp độc lập.'}
            </p>
            <button type="button" class="btn btn-emerald px-6 py-3 font-bold rounded-xl shadow-lg" onclick="window.app.handleOpenShowcase()">
              ${isEn ? 'Explore KHKT Research Data & Pedagogy →' : 'Xem Công Trình Nghiên Cứu KHKT (N=400) →'}
            </button>
          </div>
        </div>

        <!-- Lessons Grid Preview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          ${this.state.lessons.map(lesson => `
            <div class="card flex flex-col justify-between hover:shadow-lg transition-all">
              <div class="card-header bg-slate-50 flex items-center justify-between">
                <span class="badge badge-khkt-gold">Lớp 10 • ${lesson.topic}</span>
                <span class="badge badge-verified-math">100% Verified</span>
              </div>
              <div class="card-body">
                <h3 class="font-bold text-lg text-blue-950 mb-2">
                  ${isEn ? lesson.titleEn : (isDual ? `${lesson.titleVi} (${lesson.titleEn})` : lesson.titleVi)}
                </h3>
                <p class="text-slate-600 text-sm line-clamp-3 mb-4">
                  ${isEn ? (lesson.realWorldContextEn || lesson.scenes[0].contentEn) : lesson.scenes[0].contentVi}
                </p>
              </div>
              <div class="card-footer bg-white flex justify-between items-center">
                <span class="text-xs text-slate-500 font-semibold">${lesson.difficulty}</span>
                <button type="button" class="btn btn-primary btn-sm" onclick="window.app.handleSelectLesson('${lesson.id}')">
                  ${isEn ? 'Start Lesson →' : 'Bắt đầu học →'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Fallback rendering for KHKT Showcase Modal
   */
  renderShowcaseModalFallback(modalRoot) {
    modalRoot.innerHTML = `
      <div class="modal-overlay fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="modal-container bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span class="badge badge-khkt-gold">Thông tư 84/2026/TT-BGDĐT</span>
              <h2 class="text-xl sm:text-2xl font-black text-blue-950 mt-1">Giới thiệu Công trình Nghiên cứu KHKT</h2>
            </div>
            <button type="button" class="p-2 text-slate-400 hover:text-slate-700 rounded-full" onclick="window.app.handleCloseShowcase()">✕</button>
          </div>
          <div class="py-6 space-y-4 text-sm text-slate-700">
            <p><strong>Đề tài:</strong> Ứng dụng Trí tuệ nhân tạo phát triển Video song ngữ học Toán thực tiễn</p>
            <p><strong>Tác giả:</strong> Phạm Nguyễn Ti Na (10A1) • <strong>GVHD:</strong> Lê Thanh Tâm (THPT Trần Văn Kiết)</p>
            <div class="scaffold-box">
              <h4 class="font-bold text-amber-900 mb-1">Kết quả thực nghiệm trên N=400 học sinh Lớp 10:</h4>
              <p>Điểm trung bình nhóm thực nghiệm đạt <strong>7.85 ± 1.12</strong> so với nhóm đối chứng <strong>5.42 ± 1.34</strong> (Chênh lệch +2.43 điểm, hiệu ứng Cohen's d = 1.95, p < 0.001).</p>
            </div>
          </div>
          <div class="pt-4 border-t border-slate-100 flex justify-end">
            <button type="button" class="btn btn-secondary" onclick="window.app.handleCloseShowcase()">Đóng / Close</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Fallbacks for upcoming milestones
   */
  renderPlayerPlaceholder(container, lessonId) {
    const lesson = this.state.lessons.find(l => l.id === lessonId) || this.state.lessons[0];
    container.innerHTML = `
      <div class="card p-8 text-center space-y-4">
        <span class="badge badge-khkt-gold">Milestone M3: 5-Scene Multimedia Player</span>
        <h2 class="text-2xl font-bold text-blue-950">${lesson.titleVi}</h2>
        <p class="text-slate-600 max-w-xl mx-auto">${lesson.titleEn}</p>
        <div class="flex justify-center gap-3 pt-4">
          <button type="button" class="btn btn-outline" onclick="window.app.handleBackToExplore()">← Quay lại danh mục / Back to Explore</button>
        </div>
      </div>
    `;
  }

  renderStudioPlaceholder(container) {
    container.innerHTML = `
      <div class="card p-8 text-center space-y-4">
        <span class="badge badge-khkt-gold">Milestone M5: 5-Scene Lesson Authoring Studio</span>
        <h2 class="text-2xl font-bold text-blue-950">Phân hệ Biên soạn & Kiểm chứng 2 lớp (Toán & Ngôn ngữ)</h2>
        <p class="text-slate-600 max-w-xl mx-auto">Công cụ dành cho giáo viên và học sinh soạn thảo kịch bản 5 màn, quản lý từ vựng Math English và kiểm duyệt qua Cổng xuất bản 10/10 tiêu chí độc lập.</p>
        <button type="button" class="btn btn-outline" onclick="window.app.handleBackToExplore()">← Quay lại danh mục / Back to Explore</button>
      </div>
    `;
  }

  renderSurveyPlaceholder(container) {
    container.innerHTML = `
      <div class="card p-8 text-center space-y-4">
        <span class="badge badge-khkt-gold">Milestone M4: Pedagogical Learner Survey</span>
        <h2 class="text-2xl font-bold text-blue-950">Phiếu Khảo sát Hứng thú & Tự tin (Thang đo Likert 5 mức độ)</h2>
        <p class="text-slate-600 max-w-xl mx-auto">Tái hiện công cụ khảo sát khoa học trong tài liệu KHKT (Hình 4, N=400 học sinh) nhằm đo lường mức độ tiếp thu Toán thực tiễn qua video song ngữ.</p>
        <button type="button" class="btn btn-outline" onclick="window.app.handleBackToExplore()">← Quay lại danh mục / Back to Explore</button>
      </div>
    `;
  }

  /**
   * Renders the universal responsive footer
   */
  renderFooter() {
    const footerEl = document.querySelector('footer') || document.getElementById('app-footer');
    if (!footerEl) return;

    const isEn = this.state.language === 'en';
    footerEl.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <div class="font-bold text-slate-700 text-sm mb-1">
            MATH ENGLISH AI LEARN — ${isEn ? 'Grade 10 CLIL Practical Mathematics' : 'Học Toán Thực Tiễn Lớp 10'}
          </div>
          <div>
            ${isEn 
              ? 'Science & Technology Research Project 2026-2027 • Tran Van Kiet High School, Ben Tre'
              : 'Dự án Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT) 2026-2027 • Trường THPT Trần Văn Kiết, Bến Tre'}
          </div>
          <div class="text-slate-400 mt-1">
            ${isEn 
              ? 'Authors: Pham Nguyen Ti Na (10A1) • Advisor: Le Thanh Tam • Circular 84/2026/TT-BGDDT Compliance'
              : 'Tác giả: Phạm Nguyễn Ti Na (10A1) • Hướng dẫn: Lê Thanh Tâm • Tuân thủ Thông tư 84/2026/TT-BGDĐT'}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Offline-First Client SPA
          </span>
        </div>
      </div>
    `;
  }
}

// Auto-bootstrap when document is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new App();
      app.init();
    });
  } else {
    const app = new App();
    app.init();
  }
}

// Note: App class is exported at definition (line 19: export class App)

