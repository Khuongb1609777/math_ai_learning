/**
 * src/components/Header.js
 * Responsive Header & Navigation Component
 * Milestone: M2 (Navigation, Collection Explorer & KHKT Showcase)
 * 
 * Features:
 * - KHKT Grade 10 Project Branding (∑ Emblem & School Affiliation)
 * - Navigation tabs: Khám phá / Explore, Biên soạn / Studio, Giới thiệu KHKT, Khảo sát / Survey
 * - Tri-state Bilingual Switcher: VI / EN / DUAL (persisted in user_settings)
 * - Responsive Mobile Drawer (<768px) with accessible hamburger toggle
 * - Keyboard navigation and ARIA attributes
 */

export class Header {
  /**
   * @param {Object} options
   * @param {string} [options.activeTab='explore'] - Current active navigation tab
   * @param {string} [options.language='dual'] - Current active language mode ('vi'|'en'|'dual')
   * @param {Function} [options.onNavigate] - Callback invoked when a tab is selected (tabId: string) => void
   * @param {Function} [options.onLanguageChange] - Callback invoked when language is toggled (lang: string) => void
   * @param {Function} [options.onOpenShowcase] - Callback invoked to open KHKT research modal () => void
   */
  constructor(options = {}) {
    this.activeTab = options.activeTab || 'explore';
    this.language = options.language || 'dual';
    this.onNavigate = options.onNavigate || (() => {});
    this.onLanguageChange = options.onLanguageChange || (() => {});
    this.onOpenShowcase = options.onOpenShowcase || (() => {});
    
    this.isMobileMenuOpen = false;
    this.container = null;
    this._listenersAttached = false;
    
    // Binding methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleAppLanguageChange = this.handleAppLanguageChange.bind(this);
  }

  /**
   * Localized UI strings for navigation labels
   */
  static I18N = {
    brandTitle: {
      vi: 'MATH ENGLISH AI LEARN',
      en: 'MATH ENGLISH AI LEARN',
      dual: 'MATH ENGLISH AI LEARN'
    },
    brandSubtitle: {
      vi: 'DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT',
      en: 'KHKT RESEARCH 2026-2027 • TRAN VAN KIET HIGH SCHOOL',
      dual: 'DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT'
    },
    navExplore: {
      vi: 'Bài học',
      en: 'Lessons',
      dual: 'Bài học'
    },
    navPlayer: {
      vi: 'Thực hành',
      en: 'Practice',
      dual: 'Thực hành'
    },
    navQuiz: {
      vi: 'Bài tập',
      en: 'Quiz',
      dual: 'Bài tập'
    },
    navStudio: {
      vi: 'Biên soạn bài học',
      en: 'Authoring Studio',
      dual: 'Biên soạn / Studio'
    },
    navShowcase: {
      vi: 'Giới thiệu đề án',
      en: 'Showcase',
      dual: 'Giới thiệu đề án'
    },
    navSurvey: {
      vi: 'Khảo sát người học',
      en: 'Learner Survey',
      dual: 'Khảo sát / Survey'
    },
    langLabel: {
      vi: 'Ngôn ngữ',
      en: 'Language',
      dual: 'Ngôn ngữ / Language'
    }
  };

  /**
   * Returns localized text for a given key based on current language
   * @param {string} key
   * @returns {string}
   */
  t(key) {
    const entry = Header.I18N[key];
    if (!entry) return key;
    return entry[this.language] || entry.dual || entry.vi;
  }

  /**
   * Sets active navigation tab and updates UI
   * @param {string} tabId
   */
  setActiveTab(tabId) {
    this.activeTab = tabId;
    this.updateActiveNavUI();
  }

  /**
   * Sets language mode and updates UI
   * @param {'vi'|'en'|'dual'} lang
   */
  setLanguage(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    if (this.language === lang && this.container && this.container.innerHTML) return;
    this.language = lang;
    this.render();
  }

  /**
   * Toggles mobile menu drawer
   * @param {boolean} [forceState]
   */
  toggleMobileMenu(forceState) {
    this.isMobileMenuOpen = typeof forceState === 'boolean' ? forceState : !this.isMobileMenuOpen;
    const drawer = this.container?.querySelector('.mobile-nav-drawer');
    const toggleBtn = this.container?.querySelector('.mobile-menu-toggle');
    
    if (drawer && toggleBtn) {
      if (this.isMobileMenuOpen) {
        drawer.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.innerHTML = this.getCloseIconSvg();
      } else {
        drawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = this.getHamburgerIconSvg();
      }
    }
  }

  /**
   * Renders the complete Header HTML
   * @returns {string}
   */
  renderHtml() {
    return `
      <div class="header-topbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 min-h-[4rem] w-full flex items-center justify-between gap-3">
        <!-- Brand / Logo Section -->
        <a href="#explore" class="brand-link flex items-center gap-2.5 select-none flex-shrink-0" data-nav="explore" aria-label="Math English AI Learn Home">
          <div class="brand-logo rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md border border-blue-700/50 flex-shrink-0" style="width: 40px; height: 40px; min-width: 40px; min-height: 40px; border-radius: 12px; aspect-ratio: 1 / 1; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            ∑
          </div>
          <div class="brand-text flex flex-col justify-center">
            <div class="brand-title font-black text-blue-950 tracking-tight text-sm sm:text-base whitespace-nowrap leading-snug">
              ${this.t('brandTitle')}
            </div>
            <div class="brand-subtitle text-[10px] sm:text-xs text-blue-600 font-bold tracking-wider uppercase whitespace-nowrap leading-snug hidden lg:block">
              ${this.t('brandSubtitle')}
            </div>
          </div>
        </a>

        <!-- Desktop Navigation Bar (hidden on mobile/tablet, visible on md+) -->
        <nav class="nav-desktop hidden md:flex xl:flex items-center gap-1" role="navigation" aria-label="Chính / Main Navigation">
          <button type="button" class="nav-link ${this.activeTab === 'explore' ? 'active' : ''}" data-nav="explore" aria-current="${this.activeTab === 'explore' ? 'page' : 'false'}">
            <span>${this.t('navExplore')}</span>
          </button>

          <button type="button" class="nav-link ${this.activeTab === 'player' ? 'active' : ''}" data-nav="player" aria-current="${this.activeTab === 'player' ? 'page' : 'false'}">
            <span>${this.t('navPlayer')}</span>
          </button>

          <button type="button" class="nav-link ${this.activeTab === 'quiz' ? 'active' : ''}" data-nav="quiz" aria-current="${this.activeTab === 'quiz' ? 'page' : 'false'}">
            <span>${this.t('navQuiz')}</span>
          </button>

          <button type="button" class="nav-link nav-link-showcase ${this.activeTab === 'showcase' ? 'active' : ''}" data-nav="showcase" aria-current="${this.activeTab === 'showcase' ? 'page' : 'false'}">
            <span>${this.t('navShowcase')}</span>
          </button>
        </nav>

        <!-- Right Controls: Bilingual Switcher & Mobile Menu Toggle -->
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <!-- Tri-state Bilingual Switcher (VI / EN / DUAL) -->
          <div class="lang-toggle-group hidden sm:inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner" role="group" aria-label="${this.t('langLabel')}">
            <button type="button" class="lang-btn ${this.language === 'vi' ? 'active' : ''}" data-lang="vi" aria-pressed="${this.language === 'vi'}" title="Chế độ Tiếng Việt">
              VI
            </button>
            <button type="button" class="lang-btn ${this.language === 'en' ? 'active' : ''}" data-lang="en" aria-pressed="${this.language === 'en'}" title="English CLIL Mode">
              EN
            </button>
            <button type="button" class="lang-btn ${this.language === 'dual' ? 'active' : ''}" data-lang="dual" aria-pressed="${this.language === 'dual'}" title="Song ngữ tích hợp (Bilingual Dual Mode)">
              DUAL
            </button>
          </div>

          <!-- Mobile Hamburger Toggle Button (< md/xl) -->
          <button type="button" class="mobile-menu-toggle md:hidden xl:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-blue-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav-drawer">
            ${this.getHamburgerIconSvg()}
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-nav-drawer" class="mobile-nav-drawer md:hidden xl:hidden w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg px-4 pt-3 pb-5 space-y-2">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${this.t('langLabel')}</span>
          <div class="lang-toggle-group inline-flex items-center bg-slate-100 p-1 rounded-full border border-slate-200" role="group">
            <button type="button" class="lang-btn ${this.language === 'vi' ? 'active' : ''}" data-lang="vi">VI</button>
            <button type="button" class="lang-btn ${this.language === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            <button type="button" class="lang-btn ${this.language === 'dual' ? 'active' : ''}" data-lang="dual">DUAL</button>
          </div>
        </div>

        <button type="button" class="mobile-nav-link w-full flex items-center px-3 py-2.5 rounded-lg text-left text-sm font-semibold ${this.activeTab === 'explore' ? 'active' : 'text-slate-700'}" data-nav="explore" aria-current="${this.activeTab === 'explore' ? 'page' : 'false'}">
          <span>${this.t('navExplore')}</span>
        </button>

        <button type="button" class="mobile-nav-link w-full flex items-center px-3 py-2.5 rounded-lg text-left text-sm font-semibold ${this.activeTab === 'player' ? 'active' : 'text-slate-700'}" data-nav="player" aria-current="${this.activeTab === 'player' ? 'page' : 'false'}">
          <span>${this.t('navPlayer')}</span>
        </button>

        <button type="button" class="mobile-nav-link w-full flex items-center px-3 py-2.5 rounded-lg text-left text-sm font-semibold ${this.activeTab === 'quiz' ? 'active' : 'text-slate-700'}" data-nav="quiz" aria-current="${this.activeTab === 'quiz' ? 'page' : 'false'}">
          <span>${this.t('navQuiz')}</span>
        </button>

        <button type="button" class="mobile-nav-link w-full flex items-center px-3 py-2.5 rounded-lg text-left text-sm font-semibold ${this.activeTab === 'showcase' ? 'active' : 'text-slate-700'}" data-nav="showcase" aria-current="${this.activeTab === 'showcase' ? 'page' : 'false'}">
          <span>${this.t('navShowcase')}</span>
        </button>
      </div>
    `;
  }

  /**
   * Mounts the Header component into a target DOM container
   * @param {HTMLElement} targetEl
   */
  mount(targetEl) {
    if (!targetEl) return;
    this.container = targetEl;
    this.render();
    this.attachEventListeners();
  }

  /**
   * Renders and updates container innerHTML
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = this.renderHtml();
    this.bindDOMEvents();
  }

  /**
   * Updates only active classes on navigation items without full re-render
   */
  updateActiveNavUI() {
    if (!this.container) return;
    const desktopLinks = this.container.querySelectorAll('.nav-desktop .nav-link');
    desktopLinks.forEach(link => {
      const tab = link.getAttribute('data-nav');
      if (tab === this.activeTab) {
        link.classList.add('active');
        if (typeof link.setAttribute === 'function') link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        if (typeof link.setAttribute === 'function') link.setAttribute('aria-current', 'false');
      }
    });

    const mobileLinks = this.container.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      const tab = link.getAttribute('data-nav');
      if (tab === this.activeTab) {
        link.classList.add('active');
        link.classList.remove('text-slate-700');
        if (typeof link.setAttribute === 'function') link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.classList.add('text-slate-700');
        if (typeof link.setAttribute === 'function') link.setAttribute('aria-current', 'false');
      }
    });
  }

  /**
   * Attaches one-time global listeners
   */
  attachEventListeners() {
    if (this._listenersAttached) return;
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('click', this.handleOutsideClick);
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('app:language-change', this.handleAppLanguageChange);
    }
    this._listenersAttached = true;
  }

  /**
   * Binds click handlers to interactive elements inside header
   */
  bindDOMEvents() {
    if (!this.container) return;

    // Brand link
    const brandLink = this.container.querySelector('.brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveTab('explore');
        this.onNavigate('explore');
        this.toggleMobileMenu(false);
      });
    }

    // Navigation buttons (Desktop and Mobile) - buttons only to avoid double-binding brandLink
    const navButtons = this.container.querySelectorAll('button[data-nav]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-nav');
        this.setActiveTab(tab);
        this.onNavigate(tab);
        this.toggleMobileMenu(false);
      });
    });

    // Language buttons
    const langButtons = this.container.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== this.language) {
          this.setLanguage(lang);
          this.onLanguageChange(lang);
        }
      });
    });

    // Mobile menu toggle button
    const toggleBtn = this.container.querySelector('.mobile-menu-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMobileMenu();
      });
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isMobileMenuOpen) {
      this.toggleMobileMenu(false);
    }
  }

  handleOutsideClick(e) {
    if (this.isMobileMenuOpen && this.container && !this.container.contains(e.target)) {
      this.toggleMobileMenu(false);
    }
  }

  /**
   * Handles external window language change broadcast
   * @param {CustomEvent} e
   */
  handleAppLanguageChange(e) {
    const lang = e?.detail?.lang;
    if (lang && ['vi', 'en', 'dual'].includes(lang) && lang !== this.language) {
      this.setLanguage(lang);
    }
  }

  destroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('click', this.handleOutsideClick);
    }
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('app:language-change', this.handleAppLanguageChange);
    }
    this._listenersAttached = false;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // --- Inline Vector Icons (Lucide-compatible, zero external CDN) ---
  getCompassIconSvg() {
    return `<svg class="w-4 h-4 inline-block flex-shrink-0" width="16" height="16" style="width:16px;height:16px;min-width:16px;max-width:16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
  }

  getPencilIconSvg() {
    return `<svg class="w-4 h-4 inline-block flex-shrink-0" width="16" height="16" style="width:16px;height:16px;min-width:16px;max-width:16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
  }

  getTrophyIconSvg() {
    return `<svg class="w-4 h-4 inline-block flex-shrink-0" width="16" height="16" style="width:16px;height:16px;min-width:16px;max-width:16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>`;
  }

  getClipboardIconSvg() {
    return `<svg class="w-4 h-4 inline-block flex-shrink-0" width="16" height="16" style="width:16px;height:16px;min-width:16px;max-width:16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>`;
  }

  getHamburgerIconSvg() {
    return `<svg class="w-6 h-6 flex-shrink-0" width="24" height="24" style="width:24px;height:24px;min-width:24px;max-width:24px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>`;
  }

  getCloseIconSvg() {
    return `<svg class="w-6 h-6 flex-shrink-0" width="24" height="24" style="width:24px;height:24px;min-width:24px;max-width:24px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
  }
}

export default Header;
