/**
 * src/components/KhktShowcaseModal.js
 * KHKT Research Showcase & Pedagogical Architecture Modal
 * 
 * Features:
 * - Authorship & Competition Metadata: Phạm Nguyễn Ti Na (10A1), GVHD: Lê Thanh Tâm, THPT Trần Văn Kiết.
 * - Circular 84/2026/TT-BGDĐT Academic Integrity & AI Disclosure Table.
 * - 4 Theoretical Foundations: Blum & Leiß (2007), Goldin (2014), CLIL (2010), Mayer (2021).
 * - Standardized 7-Step Pedagogical Cycle (Interactive Stepper B1 - B7 with Step 5 Gatekeeper).
 * - Empirical Study (N=400 Grade 10 Students, +2.43 pts gain, p < 0.001, Cohen's d = 1.95).
 * - Dynamic SVG Visual Charts: Pre/Post Score Distributions & Likert Survey Donut.
 * - Full accessibility: ESC key, backdrop click, focus trap, ARIA dialog.
 */

import {
  KHKT_METADATA,
  SCIENTIFIC_FOUNDATIONS,
  SEVEN_STEP_PEDAGOGY,
  EMPIRICAL_STUDY,
  LIKERT_SURVEY_STATEMENTS,
  AI_DISCLOSURE_DECLARATION,
  KHKT_MEDIA_ASSETS
} from '../data/khkt_data.js';

// ============================================================================
// Mathematical & Validation Utility Functions (Tier 2 Boundaries Compliant)
// ============================================================================

/**
 * Computes survey average safely without NaN on empty or invalid arrays (F2.B1).
 * @param {number[]} ratings
 * @returns {number}
 */
export function computeSurveyAverage(ratings) {
  if (!Array.isArray(ratings) || ratings.length === 0) return 0;
  const validNumbers = ratings.map(r => Number(r)).filter(n => !Number.isNaN(n));
  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, val) => acc + val, 0);
  const avg = sum / validNumbers.length;
  return Number.isNaN(avg) ? 0 : Math.round(avg * 100) / 100;
}

/**
 * Clamps test scores strictly between [0.0, 10.0] (F2.B3).
 * @param {number} score
 * @returns {number}
 */
export function clampScore(score) {
  const num = Number(score);
  if (Number.isNaN(num)) return 0.0;
  return Math.max(0.0, Math.min(10.0, Math.round(num * 100) / 100));
}

/**
 * Validates gain percentage range [-100, 500] (F2.B4).
 * @param {number} gain
 * @returns {boolean}
 */
export function validateGain(gain) {
  const num = Number(gain);
  return !Number.isNaN(num) && num >= -100 && num <= 500;
}

/**
 * Validates AI disclosure items under Circular 84 (F2.B5).
 * @param {Object} item
 * @returns {boolean}
 */
export function validateAiDisclosureItem(item) {
  if (!item || typeof item !== 'object') return false;
  const tool = String(item.tool || '').trim();
  const studentRole = String(item.studentVerification || item.studentVerifiedVi || '').trim();
  return Boolean(tool && studentRole);
}

/**
 * Computes statistical confidence interval without arithmetic overflow (F2.B2).
 * @param {number} n - Sample size
 * @param {number} [p=0.5] - Proportion
 * @returns {{ margin: number, valid: boolean }}
 */
export function calcConfidenceInterval(n, p = 0.5) {
  if (typeof n !== 'number' || n <= 0 || !Number.isFinite(n)) {
    return { margin: 0, valid: false };
  }
  const safeP = Math.max(0, Math.min(1, p));
  const se = Math.sqrt((safeP * (1 - safeP)) / n);
  const margin = 1.96 * se;
  return { margin: Math.round(margin * 10000) / 10000, valid: true };
}

// ============================================================================
// Scoped CSS Stylesheet (Self-injected)
// ============================================================================

const MODAL_STYLE_ID = 'khkt-showcase-modal-styles';

function injectModalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(MODAL_STYLE_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = MODAL_STYLE_ID;
  styleEl.textContent = `
    .khkt-modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .khkt-modal-backdrop.is-open {
      opacity: 1;
    }
    .khkt-modal-dialog {
      background: #ffffff;
      border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 64rem;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.96) translateY(12px);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid #e2e8f0;
    }
    .khkt-modal-backdrop.is-open .khkt-modal-dialog {
      transform: scale(1) translateY(0);
    }
    .khkt-modal-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #312e81 100%);
      color: #ffffff;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .khkt-modal-title-group {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .khkt-modal-badge-crest {
      width: 2.75rem;
      height: 2.75rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      color: #fde047;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .khkt-modal-title {
      font-size: 1.125rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1.25;
    }
    .khkt-modal-subtitle {
      font-size: 0.75rem;
      color: #93c5fd;
      font-weight: 500;
      margin-top: 0.2rem;
    }
    .khkt-modal-close-btn {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      cursor: pointer;
      transition: background 0.15s ease;
      border: none;
    }
    .khkt-modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    .khkt-modal-author-strip {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.625rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.8125rem;
    }
    .khkt-modal-author-item {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: #334155;
    }
    .khkt-modal-author-item strong {
      color: #0f172a;
    }
    .khkt-modal-author-tag {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid #bfdbfe;
    }
    .khkt-modal-tabs {
      display: flex;
      overflow-x: auto;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1rem;
      gap: 0.25rem;
    }
    .khkt-modal-tab-btn {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .khkt-modal-tab-btn:hover {
      color: #1e3a8a;
      border-bottom-color: #cbd5e1;
    }
    .khkt-modal-tab-btn.is-active {
      color: #1d4ed8;
      border-bottom-color: #2563eb;
    }
    .khkt-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
      background: #ffffff;
    }
    /* 7-Step Cycle Stepper */
    .khkt-stepper-nav {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.75rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px dashed #e2e8f0;
    }
    .khkt-step-node {
      flex: 1;
      min-width: 7.5rem;
      padding: 0.625rem 0.75rem;
      border-radius: 0.75rem;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .khkt-step-node:hover {
      border-color: #93c5fd;
      background: #eff6ff;
    }
    .khkt-step-node.is-active {
      background: #eff6ff;
      border-color: #2563eb;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.12);
    }
    .khkt-step-node.is-gatekeeper {
      border-left: 3px solid #f59e0b;
    }
    .khkt-step-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .khkt-step-node.is-active .khkt-step-badge {
      color: #2563eb;
    }
    .khkt-step-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.25;
    }
    .khkt-step-detail-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.25rem;
    }
    /* KPI Stats Grid */
    .khkt-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .khkt-stat-card {
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid #e2e8f0;
      border-radius: 0.875rem;
      padding: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .khkt-stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .khkt-stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #1e3a8a;
      margin: 0.25rem 0;
      display: flex;
      align-items: baseline;
      gap: 0.375rem;
    }
    .khkt-stat-delta {
      font-size: 0.875rem;
      font-weight: 700;
      color: #10b981;
    }
    .khkt-stat-desc {
      font-size: 0.75rem;
      color: #64748b;
    }
    /* Chart Container */
    .khkt-chart-wrapper {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .khkt-chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .khkt-chart-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: #0f172a;
    }
    /* Table styling */
    .khkt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
    }
    .khkt-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 0.625rem 0.75rem;
      border-bottom: 1px solid #cbd5e1;
    }
    .khkt-table td {
      padding: 0.625rem 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .khkt-table tr:hover td {
      background: #f8fafc;
    }
    /* Image preview lightbox / trigger */
    .khkt-asset-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      margin-top: 1rem;
    }
  `;
  document.head.appendChild(styleEl);
}

// ============================================================================
// KhktShowcaseModal Component Class
// ============================================================================

export class KhktShowcaseModal {
  /**
   * @param {Object} [options={}]
   * @param {HTMLElement} [options.container] - Target container (defaults to document.body)
   * @param {string} [options.initialTab='pedagogy'] - 'pedagogy' | 'empirical' | 'survey' | 'theory' | 'circular84'
   */
  constructor(options = {}) {
    this.options = {
      container: options.container || (typeof document !== 'undefined' ? document.body : null),
      initialTab: options.initialTab || 'pedagogy',
      ...options
    };

    this.activeTab = this.options.initialTab;
    this.selectedStep = 1; // 1 to 7
    this.modalEl = null;
    this.previousActiveElement = null;
    this.boundKeyHandler = this.handleKeyDown.bind(this);
    this.showingFigureId = null;

    // Singleton caching
    KhktShowcaseModal.instance = this;
  }

  /**
   * Returns current active singleton instance or creates one.
   * @param {Object} [options]
   * @returns {KhktShowcaseModal}
   */
  static getInstance(options) {
    if (!KhktShowcaseModal.instance) {
      KhktShowcaseModal.instance = new KhktShowcaseModal(options);
    }
    return KhktShowcaseModal.instance;
  }

  /**
   * Static helper to open modal directly from any button.
   * @param {string} [tab='pedagogy']
   */
  static open(tab = 'pedagogy') {
    const modal = KhktShowcaseModal.getInstance();
    modal.open(tab);
  }

  /**
   * Static helper to close modal.
   */
  static close() {
    if (KhktShowcaseModal.instance) {
      KhktShowcaseModal.instance.close();
    }
  }

  /**
   * Opens modal, locks background scroll, traps focus.
   * @param {string} [tab]
   */
  open(tab) {
    if (typeof document === 'undefined') return;
    injectModalStyles();

    if (tab) {
      this.activeTab = tab;
    }

    if (!this.modalEl) {
      this.createDom();
    } else {
      this.updateView();
    }

    // Save previous active element for focus restoration
    this.previousActiveElement = document.activeElement;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Show backdrop with transition
    requestAnimationFrame(() => {
      if (this.modalEl) {
        this.modalEl.classList.add('is-open');
        this.modalEl.setAttribute('aria-hidden', 'false');
      }
    });

    // Add ESC key listener
    document.addEventListener('keydown', this.boundKeyHandler);

    // Focus close button or first interactive element
    setTimeout(() => {
      const closeBtn = this.modalEl?.querySelector('.khkt-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }, 50);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-opened', { detail: { tab: this.activeTab } }));
  }

  /**
   * Closes modal and restores focus.
   */
  close() {
    if (!this.modalEl) return;

    this.modalEl.classList.remove('is-open');
    this.modalEl.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', this.boundKeyHandler);
    document.body.style.overflow = '';

    setTimeout(() => {
      if (this.modalEl && this.modalEl.parentNode) {
        this.modalEl.parentNode.removeChild(this.modalEl);
        this.modalEl = null;
      }
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
        this.previousActiveElement.focus();
      }
    }, 250);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-closed'));
  }

  /**
   * Checks if modal is currently open.
   * @returns {boolean}
   */
  isOpen() {
    return Boolean(this.modalEl && this.modalEl.classList.contains('is-open'));
  }

  /**
   * Switches active navigation tab.
   * @param {string} tabId
   */
  setActiveTab(tabId) {
    this.activeTab = tabId;
    this.updateView();
  }

  /**
   * Selects active pedagogy step.
   * @param {number} stepNumber (1 - 7)
   */
  selectPedagogyStep(stepNumber) {
    this.selectedStep = Math.max(1, Math.min(7, stepNumber));
    this.updateView();
  }

  /**
   * Toggles authentic figure preview.
   * @param {string|null} figureId
   */
  toggleOriginalImage(figureId) {
    this.showingFigureId = this.showingFigureId === figureId ? null : figureId;
    this.updateView();
  }

  /**
   * Keyboard accessibility handler (ESC to close, Tab to cycle focus).
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = this.modalEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  /**
   * Creates DOM elements and attaches to container.
   */
  createDom() {
    const backdrop = document.createElement('div');
    backdrop.className = 'khkt-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'khkt-showcase-title');
    backdrop.setAttribute('aria-hidden', 'true');

    // Close on backdrop overlay click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    const dialog = document.createElement('div');
    dialog.className = 'khkt-modal-dialog';

    backdrop.appendChild(dialog);
    this.modalEl = backdrop;

    const targetContainer = this.options.container || document.body;
    targetContainer.appendChild(backdrop);

    this.updateView();
  }

  /**
   * Updates modal inner HTML and rebinds handlers.
   */
  updateView() {
    if (!this.modalEl) return;
    const dialog = this.modalEl.querySelector('.khkt-modal-dialog');
    if (!dialog) return;

    dialog.innerHTML = `
      <!-- Header -->
      <header class="khkt-modal-header">
        <div class="khkt-modal-title-group">
          <div class="khkt-modal-badge-crest" title="Crest Cuộc thi KHKT 2026-2027">∑</div>
          <div>
            <div id="khkt-showcase-title" class="khkt-modal-title">HỒ SƠ NGHIÊN CỨU KHOA HỌC KỸ THUẬT (KHKT)</div>
            <div class="khkt-modal-subtitle">${KHKT_METADATA.competition} • ${KHKT_METADATA.fieldVi}</div>
          </div>
        </div>
        <button type="button" class="khkt-modal-close-btn" aria-label="Đóng hộp thoại giới thiệu KHKT" title="Đóng (ESC)">
          ✕
        </button>
      </header>

      <!-- Authorship & Institutional Metadata Strip -->
      <div class="khkt-modal-author-strip">
        <div class="khkt-modal-author-item">
          <span>Tác giả:</span>
          <strong>${KHKT_METADATA.author.fullName}</strong>
          <span class="khkt-modal-author-tag">Lớp ${KHKT_METADATA.author.grade}</span>
        </div>
        <div class="khkt-modal-author-item">
          <span>GVHD:</span>
          <strong>${KHKT_METADATA.advisor.fullName}</strong>
        </div>
        <div class="khkt-modal-author-item">
          <span>Đơn vị:</span>
          <strong>${KHKT_METADATA.author.school}</strong>
          <span style="color: #64748b;">(${KHKT_METADATA.author.district}, ${KHKT_METADATA.author.province})</span>
        </div>
        <div class="khkt-modal-author-item">
          <span class="khkt-modal-author-tag" style="background: #fef3c7; color: #92400e; border-color: #fde68a;">
            Thông tư 84/2026/TT-BGDĐT
          </span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="khkt-modal-tabs" aria-label="KHKT Showcase Sections">
        <button type="button" class="khkt-modal-tab-btn ${this.activeTab === 'pedagogy' ? 'is-active' : ''}" data-tab="pedagogy">
          <span>🔄</span> 7 Bước Sư Phạm
        </button>
        <button type="button" class="khkt-modal-tab-btn ${this.activeTab === 'empirical' ? 'is-active' : ''}" data-tab="empirical">
          <span>📊</span> Thực Nghiệm N=400 (+2.43đ)
        </button>
        <button type="button" class="khkt-modal-tab-btn ${this.activeTab === 'survey' ? 'is-active' : ''}" data-tab="survey">
          <span>📋</span> Khảo Sát Likert (89.5%)
        </button>
        <button type="button" class="khkt-modal-tab-btn ${this.activeTab === 'theory' ? 'is-active' : ''}" data-tab="theory">
          <span>🏛️</span> 4 Trụ Cột Lý Luận
        </button>
        <button type="button" class="khkt-modal-tab-btn ${this.activeTab === 'circular84' ? 'is-active' : ''}" data-tab="circular84">
          <span>🛡️</span> Thông Tư 84 & Khai Báo AI
        </button>
      </nav>

      <!-- Main Tab Content Body -->
      <main class="khkt-modal-body">
        ${this.renderActiveTabContent()}
      </main>
    `;

    this.bindEvents(dialog);
  }

  /**
   * Binds click and interactive events in modal dialog.
   * @param {HTMLElement} dialog
   */
  bindEvents(dialog) {
    // Close button
    dialog.querySelector('.khkt-modal-close-btn')?.addEventListener('click', () => this.close());

    // Tab buttons
    dialog.querySelectorAll('.khkt-modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) this.setActiveTab(tab);
      });
    });

    // Pedagogy step nodes
    dialog.querySelectorAll('.khkt-step-node').forEach(node => {
      node.addEventListener('click', () => {
        const step = parseInt(node.getAttribute('data-step') || '1', 10);
        this.selectPedagogyStep(step);
      });
    });

    // Image preview triggers
    dialog.querySelectorAll('[data-toggle-img]').forEach(btn => {
      btn.addEventListener('click', () => {
        const imgId = btn.getAttribute('data-toggle-img');
        this.toggleOriginalImage(imgId);
      });
    });
  }

  /**
   * Renders content for currently active tab.
   * @returns {string} HTML string
   */
  renderActiveTabContent() {
    switch (this.activeTab) {
      case 'pedagogy':
        return this.renderPedagogyTab();
      case 'empirical':
        return this.renderEmpiricalTab();
      case 'survey':
        return this.renderSurveyTab();
      case 'theory':
        return this.renderTheoryTab();
      case 'circular84':
        return this.renderCircular84Tab();
      default:
        return this.renderPedagogyTab();
    }
  }

  // ==========================================================================
  // Tab 1: 7-Step Pedagogical Cycle
  // ==========================================================================

  renderPedagogyTab() {
    const cur = SEVEN_STEP_PEDAGOGY.find(s => s.step === this.selectedStep) || SEVEN_STEP_PEDAGOGY[0];
    const isShowingFig1 = this.showingFigureId === 'fig1';

    return `
      <div>
        <div style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0;">
              Quy trình 7 Bước Chuẩn Hóa Dạy Học Toán Thực Tiễn & Số Hóa
            </h3>
            <p style="font-size: 0.8125rem; color: #64748b; margin: 0.25rem 0 0 0;">
              Mô hình khép kín kết hợp Chu trình Blum & Leiß, CLIL và kiểm chứng 2 lớp độc lập.
            </p>
          </div>
          <button type="button" data-toggle-img="fig1" class="khkt-modal-author-tag" style="cursor: pointer; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.375rem 0.75rem;">
            📷 ${isShowingFig1 ? 'Ẩn Sơ đồ Hình 1' : 'Xem Sơ đồ gốc (Hình 1)'}
          </button>
        </div>

        ${isShowingFig1 ? `
          <div style="margin-bottom: 1.25rem; text-align: center; background: #0f172a; border-radius: 0.75rem; padding: 1rem;">
            <img src="/assets/khkt/image2.png" alt="Hình 1: Sơ đồ Quy trình 7 bước chuẩn hóa" style="max-width: 100%; max-height: 24rem; border-radius: 0.5rem; object-fit: contain;">
            <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.5rem;">
              Hình 1: Sơ đồ Quy trình 7 bước phát triển Video AI học Toán song ngữ (Trích Báo cáo KHKT, trang 4)
            </div>
          </div>
        ` : ''}

        <!-- 7-Step Stepper Nodes -->
        <div class="khkt-stepper-nav" role="tablist">
          ${SEVEN_STEP_PEDAGOGY.map(s => `
            <div class="khkt-step-node ${s.step === this.selectedStep ? 'is-active' : ''} ${s.step === 5 ? 'is-gatekeeper' : ''}" 
                 data-step="${s.step}" 
                 role="tab" 
                 tabindex="0"
                 title="${s.nameVi}">
              <div class="khkt-step-badge">
                <span>BƯỚC ${s.step}</span>
                ${s.step === 5 ? '<span style="color: #d97706;" title="Chốt chặn kiểm định 2 lớp">🔒</span>' : ''}
              </div>
              <div class="khkt-step-label">${s.nameVi}</div>
            </div>
          `).join('')}
        </div>

        <!-- Detailed Card for Selected Step -->
        <div class="khkt-step-detail-card">
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.75rem;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 700; color: #2563eb; background: #dbeafe; padding: 0.125rem 0.5rem; border-radius: 0.375rem;">
                BƯỚC ${cur.step} • ${cur.id}
              </span>
              <h4 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0.375rem 0 0.125rem 0;">
                ${cur.nameVi}
              </h4>
              <div style="font-size: 0.8125rem; color: #64748b; font-style: italic;">
                ${cur.nameEn}
              </div>
            </div>
            ${cur.step === 5 ? `
              <span style="background: #fef3c7; color: #b45309; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.625rem; border-radius: 9999px; border: 1px solid #fde68a;">
                ⭐ CHỐT CHẶN CHẤT LƯỢNG (GATEKEEPER)
              </span>
            ` : ''}
          </div>

          <div style="margin-bottom: 1rem; color: #334155; font-size: 0.875rem; line-height: 1.5;">
            <strong>Mục tiêu sư phạm:</strong> ${cur.objectiveVi}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.8125rem; margin-bottom: 1rem;">
            <div style="background: #ffffff; padding: 0.875rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">📥 Đầu vào (Inputs):</div>
              <div style="color: #475569;">${cur.inputsVi}</div>
            </div>
            <div style="background: #ffffff; padding: 0.875rem; border-radius: 0.5rem; border: 1px solid #e2e8f0;">
              <div style="font-weight: 700; color: #059669; margin-bottom: 0.25rem;">📤 Đầu ra (Outputs):</div>
              <div style="color: #475569;">${cur.outputsVi}</div>
            </div>
          </div>

          <div style="font-size: 0.8125rem; color: #64748b; display: flex; align-items: center; justify-content: space-between;">
            <div><strong>Tác nhân / Công cụ:</strong> ${cur.actorsVi}</div>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" data-step="${Math.max(1, cur.step - 1)}" class="khkt-step-node" style="min-width: auto; padding: 0.25rem 0.75rem; font-size: 0.75rem;">
                ← Bước trước
              </button>
              <button type="button" data-step="${Math.min(7, cur.step + 1)}" class="khkt-step-node" style="min-width: auto; padding: 0.25rem 0.75rem; font-size: 0.75rem;">
                Bước sau →
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Tab 2: Empirical Study (N=400, +2.43 pts & SVG Charts)
  // ==========================================================================

  renderEmpiricalTab() {
    const isShowingFig3 = this.showingFigureId === 'fig3';

    return `
      <div>
        <div style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0;">
              Kết Quả Nghiên Cứu Thực Nghiệm Sư Phạm (N = 400 Học Sinh Lớp 10)
            </h3>
            <p style="font-size: 0.8125rem; color: #64748b; margin: 0.25rem 0 0 0;">
              Thực hiện tại Trường THCS & THPT Trần Văn Kiết từ 07/09/2026 – 07/10/2026.
            </p>
          </div>
          <button type="button" data-toggle-img="fig3" class="khkt-modal-author-tag" style="cursor: pointer; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.375rem 0.75rem;">
            📷 ${isShowingFig3 ? 'Ẩn Biểu đồ gốc' : 'Xem Biểu đồ gốc (Hình 3)'}
          </button>
        </div>

        ${isShowingFig3 ? `
          <div style="margin-bottom: 1.25rem; text-align: center; background: #0f172a; border-radius: 0.75rem; padding: 1rem;">
            <img src="/assets/khkt/image4.png" alt="Hình 3: Biểu đồ kết quả thực nghiệm sư phạm" style="max-width: 100%; max-height: 24rem; border-radius: 0.5rem; object-fit: contain;">
            <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.5rem;">
              Hình 3: Kết quả khảo sát điểm số thực nghiệm sư phạm (N = 400 học sinh)
            </div>
          </div>
        ` : ''}

        <!-- 4 Key Stat Cards -->
        <div class="khkt-stats-grid">
          <div class="khkt-stat-card">
            <div class="khkt-stat-label">Cỡ mẫu thực nghiệm</div>
            <div class="khkt-stat-value">
              <span>N = ${EMPIRICAL_STUDY.sampleSize}</span>
            </div>
            <div class="khkt-stat-desc">Lớp 10 Thực nghiệm vs Đối chứng</div>
          </div>

          <div class="khkt-stat-card">
            <div class="khkt-stat-label">Điểm trung bình (Thang 10)</div>
            <div class="khkt-stat-value">
              <span>${EMPIRICAL_STUDY.postTestAverage}</span>
              <span class="khkt-stat-delta">+${EMPIRICAL_STUDY.scoreDelta}</span>
            </div>
            <div class="khkt-stat-desc">Tăng từ ${EMPIRICAL_STUDY.preTestAverage} lên ${EMPIRICAL_STUDY.postTestAverage} (+44.8%)</div>
          </div>

          <div class="khkt-stat-card">
            <div class="khkt-stat-label">Ý nghĩa thống kê</div>
            <div class="khkt-stat-value" style="font-size: 1.5rem; color: #059669;">
              <span>p &lt; 0.001</span>
            </div>
            <div class="khkt-stat-desc">Cohen's d = 1.95 (Hiệu quả cực lớn)</div>
          </div>

          <div class="khkt-stat-card">
            <div class="khkt-stat-label">Mức tăng Math English</div>
            <div class="khkt-stat-value" style="color: #2563eb;">
              <span>+40.6%</span>
            </div>
            <div class="khkt-stat-desc">Từ 31.2% lên 71.8% tiếp thu chuẩn</div>
          </div>
        </div>

        <!-- Dynamic SVG Visual Comparison Chart -->
        <div class="khkt-chart-wrapper">
          <div class="khkt-chart-header">
            <div>
              <div class="khkt-chart-title">So Sánh 5 Chỉ Số Năng Lực Trước & Sau Thực Nghiệm</div>
              <div style="font-size: 0.75rem; color: #64748b;">(Thực nghiệm: 4 tuần áp dụng Video AI & Kịch bản 5 màn)</div>
            </div>
            <div style="display: flex; gap: 1rem; font-size: 0.75rem; font-weight: 600;">
              <span style="display: flex; align-items: center; gap: 0.375rem;">
                <span style="width: 0.75rem; height: 0.75rem; background: #94a3b8; border-radius: 2px;"></span>
                Trước TN (Pre-test)
              </span>
              <span style="display: flex; align-items: center; gap: 0.375rem;">
                <span style="width: 0.75rem; height: 0.75rem; background: #2563eb; border-radius: 2px;"></span>
                Sau TN (Post-test)
              </span>
            </div>
          </div>

          ${this.generateEmpiricalSvgChart(EMPIRICAL_STUDY.metrics)}
        </div>

        <!-- Metrics Data Table -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden;">
          <table class="khkt-table">
            <thead>
              <tr>
                <th>Chỉ số năng lực khảo sát</th>
                <th style="text-align: right;">Trước TN</th>
                <th style="text-align: right;">Sau TN</th>
                <th style="text-align: right;">Mức tăng (Delta)</th>
                <th>Ý nghĩa sư phạm</th>
              </tr>
            </thead>
            <tbody>
              ${EMPIRICAL_STUDY.metrics.map(m => `
                <tr>
                  <td><strong>${m.indicatorVi}</strong></td>
                  <td style="text-align: right; color: #64748b;">${m.preValue} ${m.unit}</td>
                  <td style="text-align: right; font-weight: 700; color: #1e3a8a;">${m.postValue} ${m.unit}</td>
                  <td style="text-align: right; font-weight: 700; color: #059669;">${m.delta}</td>
                  <td style="font-size: 0.75rem; color: #475569;">${m.noteVi}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Generates pure SVG horizontal dual-bar chart.
   * @param {Array} metrics
   * @returns {string} SVG markup
   */
  generateEmpiricalSvgChart(metrics) {
    const width = 640;
    const barHeight = 12;
    const rowGap = 36;
    const startY = 30;
    const labelWidth = 190;
    const chartWidth = 380;
    const height = startY + metrics.length * rowGap + 20;

    const gridLines = [0, 25, 50, 75, 100];

    return `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; font-family: sans-serif;" role="img" aria-label="Biểu đồ so sánh trước và sau thực nghiệm">
        <!-- Background Grid -->
        ${gridLines.map(val => {
          const x = labelWidth + (val / 100) * chartWidth;
          return `
            <line x1="${x}" y1="15" x2="${x}" y2="${height - 20}" stroke="#f1f5f9" stroke-width="1.5" />
            <text x="${x}" y="${height - 6}" font-size="9" fill="#94a3b8" text-anchor="middle">${val}%</text>
          `;
        }).join('')}

        <!-- Metric Rows -->
        ${metrics.map((m, idx) => {
          const y = startY + idx * rowGap;
          // Scale to percentage (if score out of 10, multiply by 10)
          const prePct = m.unit === 'điểm' ? m.preValue * 10 : m.preValue;
          const postPct = m.unit === 'điểm' ? m.postValue * 10 : m.postValue;
          const preW = (prePct / 100) * chartWidth;
          const postW = (postPct / 100) * chartWidth;

          return `
            <!-- Metric Name Label -->
            <text x="${labelWidth - 10}" y="${y + 11}" font-size="11" font-weight="600" fill="#334155" text-anchor="end">
              ${m.indicatorVi.split('(')[0].trim()}
            </text>

            <!-- Pre-test Bar -->
            <rect x="${labelWidth}" y="${y}" width="${preW}" height="${barHeight}" rx="3" fill="#cbd5e1" />
            <text x="${labelWidth + preW + 4}" y="${y + 9}" font-size="9" font-weight="600" fill="#64748b">
              ${m.preValue}${m.unit === '%' ? '%' : ''}
            </text>

            <!-- Post-test Bar -->
            <rect x="${labelWidth}" y="${y + barHeight + 3}" width="${postW}" height="${barHeight}" rx="3" fill="#2563eb" />
            <text x="${labelWidth + postW + 4}" y="${y + barHeight + 12}" font-size="9" font-weight="700" fill="#1e3a8a">
              ${m.postValue}${m.unit === '%' ? '%' : ''}
            </text>

            <!-- Delta Tag -->
            <text x="${labelWidth + chartWidth + 40}" y="${y + 16}" font-size="10" font-weight="800" fill="#059669" text-anchor="end">
              ${m.delta}
            </text>
          `;
        }).join('')}
      </svg>
    `;
  }

  // ==========================================================================
  // Tab 3: Likert Survey Results (89.5% Positive & Donut Chart)
  // ==========================================================================

  renderSurveyTab() {
    const isShowingFig4 = this.showingFigureId === 'fig4';
    const sat = EMPIRICAL_STUDY.satisfaction;

    return `
      <div>
        <div style="margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0;">
              Khảo Sát Mức Độ Hứng Thú, Tự Tin & Tiếp Thu (N = 400)
            </h3>
            <p style="font-size: 0.8125rem; color: #64748b; margin: 0.25rem 0 0 0;">
              Mẫu phiếu phản hồi 6 phát biểu theo thang đo Likert 5 mức độ (Phụ lục Báo cáo KHKT).
            </p>
          </div>
          <button type="button" data-toggle-img="fig4" class="khkt-modal-author-tag" style="cursor: pointer; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.375rem 0.75rem;">
            📷 ${isShowingFig4 ? 'Ẩn Biểu đồ gốc' : 'Xem Biểu đồ gốc (Hình 4)'}
          </button>
        </div>

        ${isShowingFig4 ? `
          <div style="margin-bottom: 1.25rem; text-align: center; background: #0f172a; border-radius: 0.75rem; padding: 1rem;">
            <img src="/assets/khkt/image5.png" alt="Hình 4: Biểu đồ khảo sát mức độ hứng thú & tự tin" style="max-width: 100%; max-height: 24rem; border-radius: 0.5rem; object-fit: contain;">
            <div style="color: #94a3b8; font-size: 0.75rem; margin-top: 0.5rem;">
              Hình 4: Tỉ lệ phản hồi tích cực của 400 học sinh đối với phương pháp Video AI CLIL
            </div>
          </div>
        ` : ''}

        <!-- Top Donut & Summary Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.25rem; margin-bottom: 1.5rem;">
          <div class="khkt-chart-wrapper" style="margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="font-size: 0.875rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
              Tỉ Lệ Đánh Giá Chung
            </div>
            ${this.generateSatisfactionDonutSvg(sat)}
          </div>

          <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 0.75rem; padding: 1rem;">
              <div style="font-size: 0.8125rem; font-weight: 700; color: #065f46;">
                🌟 89.5% Học sinh đánh giá Video AI CLIL thực sự hữu ích
              </div>
              <div style="font-size: 0.75rem; color: #047857; margin-top: 0.25rem; line-height: 1.4;">
                Học sinh cảm thấy tự tin hơn rõ rệt khi giải quyết các bài toán có lời văn thực tế và không còn tâm lý e ngại thuật ngữ tiếng Anh.
              </div>
            </div>

            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem;">
              <div style="font-size: 0.8125rem; font-weight: 700; color: #1e40af;">
                🎯 68.0% Đạt mức "Rất hứng thú & Tự tin"
              </div>
              <div style="font-size: 0.75rem; color: #1d4ed8; margin-top: 0.25rem; line-height: 1.4;">
                Âm thanh song ngữ Web Speech API cùng sơ đồ mô phỏng giúp kích thích tư duy trực quan không gian theo lý thuyết Goldin.
              </div>
            </div>

            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 0.75rem; padding: 1rem;">
              <div style="font-size: 0.8125rem; font-weight: 700; color: #92400e;">
                ⚖️ 8.0% Cần thêm thời gian làm quen
              </div>
              <div style="font-size: 0.75rem; color: #b45309; margin-top: 0.25rem; line-height: 1.4;">
                Một bộ phận nhỏ học sinh cần luyện tập thêm kỹ năng trích xuất giả thiết toán học từ câu văn tiếng Anh.
              </div>
            </div>
          </div>
        </div>

        <!-- 6 Likert Survey Statements Table -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden;">
          <div style="padding: 0.75rem 1rem; background: #f8fafc; font-weight: 700; font-size: 0.875rem; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
            Nội dung 6 Tiêu Chí Khảo Sát Phản Hồi (Chuẩn KHKT)
          </div>
          <table class="khkt-table">
            <thead>
              <tr>
                <th style="width: 3rem;">#</th>
                <th>Phát biểu khảo sát (Tiếng Việt & English)</th>
                <th style="width: 7rem; text-align: center;">Đồng thuận</th>
              </tr>
            </thead>
            <tbody>
              ${LIKERT_SURVEY_STATEMENTS.map(s => `
                <tr>
                  <td style="font-weight: 700; color: #2563eb;">#${s.id}</td>
                  <td>
                    <div style="font-weight: 600; color: #0f172a;">${s.statementVi}</div>
                    <div style="font-size: 0.75rem; color: #64748b; font-style: italic;">${s.statementEn}</div>
                  </td>
                  <td style="text-align: center;">
                    <span style="background: #ecfdf5; color: #065f46; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem;">
                      ${s.id === 1 ? '91.2%' : s.id === 3 ? '92.5%' : s.id === 4 ? '87.8%' : s.id === 5 ? '90.0%' : '88.4%'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Generates pure SVG Donut chart for satisfaction breakdown.
   * @param {Object} sat
   * @returns {string} SVG markup
   */
  generateSatisfactionDonutSvg(sat) {
    const size = 180;
    const strokeWidth = 24;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    const p1 = (sat.highInterestAndConfidencePercent || 68.0) / 100;
    const p2 = (sat.clearUnderstandingPercent || 24.0) / 100;
    const p3 = (sat.neutralOrNeedsImprovementPercent || 8.0) / 100;

    const stroke1 = p1 * circumference;
    const stroke2 = p2 * circumference;
    const stroke3 = p3 * circumference;

    const offset1 = 0;
    const offset2 = -stroke1;
    const offset3 = -(stroke1 + stroke2);

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display: block;">
        <g transform="rotate(-90 ${size / 2} ${size / 2})">
          <!-- Segment 1: High Interest (Emerald) -->
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#10b981" 
                  stroke-width="${strokeWidth}" stroke-dasharray="${stroke1} ${circumference - stroke1}" 
                  stroke-dashoffset="${offset1}" />
          
          <!-- Segment 2: Clear Understanding (Blue) -->
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#3b82f6" 
                  stroke-width="${strokeWidth}" stroke-dasharray="${stroke2} ${circumference - stroke2}" 
                  stroke-dashoffset="${offset2}" />
          
          <!-- Segment 3: Neutral (Amber) -->
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="#f59e0b" 
                  stroke-width="${strokeWidth}" stroke-dasharray="${stroke3} ${circumference - stroke3}" 
                  stroke-dashoffset="${offset3}" />
        </g>
        <!-- Center Text -->
        <text x="${size / 2}" y="${size / 2 - 4}" text-anchor="middle" font-size="18" font-weight="800" fill="#0f172a">
          89.5%
        </text>
        <text x="${size / 2}" y="${size / 2 + 14}" text-anchor="middle" font-size="10" font-weight="600" fill="#64748b">
          Hài Lòng
        </text>
      </svg>
    `;
  }

  // ==========================================================================
  // Tab 4: Theoretical Foundations (4 Pillars)
  // ==========================================================================

  renderTheoryTab() {
    return `
      <div>
        <div style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0;">
            4 Trụ Cột Cơ Sở Khoa Học & Lý Luận Của Đề Tài
          </h3>
          <p style="font-size: 0.8125rem; color: #64748b; margin: 0.25rem 0 0 0;">
            Bảo đảm tính chặt chẽ về mặt phương pháp luận giáo dục và tâm lý học nhận thức.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(26rem, 1fr)); gap: 1rem;">
          ${SCIENTIFIC_FOUNDATIONS.map(f => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.875rem; padding: 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 0.2rem 0.5rem; border-radius: 0.375rem;">
                  ${f.id.toUpperCase()}
                </span>
                <span style="font-size: 0.75rem; color: #94a3b8;">Cơ sở lý luận</span>
              </div>
              <h4 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem 0;">
                ${f.nameVi}
              </h4>
              <div style="font-size: 0.75rem; color: #64748b; font-style: italic; margin-bottom: 0.75rem;">
                ${f.nameEn}
              </div>
              <div style="font-size: 0.8125rem; color: #334155; line-height: 1.5; margin-bottom: 0.75rem;">
                ${f.summaryVi}
              </div>
              ${f.steps ? `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.625rem 0.75rem; margin-bottom: 0.75rem;">
                  <div style="font-size: 0.75rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem;">Các bước chu trình:</div>
                  <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.75rem; color: #475569;">
                    ${f.steps.map(st => `<li>${st.nameVi}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}
              <div style="font-size: 0.75rem; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 0.5rem;">
                <strong>Trích dẫn khoa học:</strong> ${f.citation}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Tab 5: Circular 84 Declaration & Academic Integrity
  // ==========================================================================

  renderCircular84Tab() {
    return `
      <div>
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span style="background: #fef3c7; color: #b45309; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 9999px;">
              BẮT BUỘC THEO THÔNG TƯ 84/2026/TT-BGDĐT
            </span>
          </div>
          <h3 style="font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 0;">
            Bản Cam Đoan Liêm Chính Khoa Học & Khai Báo Ứng Dụng AI
          </h3>
          <p style="font-size: 0.8125rem; color: #64748b; margin: 0.25rem 0 0 0;">
            Kê khai minh bạch mọi công cụ trí tuệ nhân tạo được sử dụng và vai trò trực tiếp của học sinh tác giả.
          </p>
        </div>

        <!-- Academic Integrity Pledge Box -->
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 0.875rem; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #166534; font-size: 0.9375rem; margin-bottom: 0.5rem;">
            <span>🛡️</span> Cam kết chính danh và liêm chính học thuật:
          </div>
          <p style="font-size: 0.8125rem; color: #15803d; line-height: 1.5; margin: 0;">
            Tác giả đề tài (Phạm Nguyễn Ti Na, Lớp 10A1, THPT Trần Văn Kiết) cam đoan toàn bộ ý tưởng phương pháp, lời giải toán học thực tế lớp 10, cấu trúc kịch bản phân cảnh 5 màn, và dữ liệu thực nghiệm sư phạm trên 400 học sinh đều do tác giả trực tiếp thực hiện dưới sự hướng dẫn của thầy Lê Thanh Tâm. Đề tài không sao chép, không vi phạm quyền sở hữu trí tuệ, và hoàn toàn tuân thủ Quy chế Cuộc thi NCKHKT cấp Quốc gia ban hành kèm Thông tư số 84/2026/TT-BGDĐT.
          </p>
        </div>

        <!-- AI Disclosure Table (Table 6 from docx) -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; margin-bottom: 1.25rem;">
          <div style="padding: 0.75rem 1rem; background: #f8fafc; font-weight: 700; font-size: 0.875rem; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
            Bảng 6. Khai Báo Chi Tiết Việc Ứng Dụng Công Cụ Trí Tuệ Nhân Tạo (AI)
          </div>
          <table class="khkt-table">
            <thead>
              <tr>
                <th style="width: 11rem;">Công cụ AI sử dụng</th>
                <th style="width: 14rem;">Mục đích ứng dụng</th>
                <th>Vai trò AI hỗ trợ</th>
                <th>Vai trò học sinh kiểm chứng & giải toán</th>
              </tr>
            </thead>
            <tbody>
              ${AI_DISCLOSURE_DECLARATION.map(item => `
                <tr>
                  <td>
                    <strong style="color: #1e3a8a;">${item.tool}</strong>
                  </td>
                  <td>${item.purposeVi}</td>
                  <td style="color: #64748b; font-size: 0.75rem;">${item.aiAssistedVi}</td>
                  <td style="color: #0f172a; font-weight: 500; font-size: 0.75rem; background: #f0fdf4;">
                    ✓ ${item.studentVerifiedVi}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Verification Signature Badge -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem;">
          <div>
            <div style="font-size: 0.8125rem; font-weight: 700; color: #0f172a;">
              Xác nhận của Ban Hướng Dẫn Nghiên Cứu
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">
              Trường THCS & THPT Trần Văn Kiết • Bến Tre, Ngày 06 tháng 11 năm 2026
            </div>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; padding: 0.375rem 0.875rem; background: #dcfce7; color: #15803d; border: 1.5px solid #86efac; border-radius: 9999px; font-weight: 700; font-size: 0.75rem;">
              ✓ ĐÃ XÁC NHẬN CHÍNH DANH
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

// Default export
export default KhktShowcaseModal;
