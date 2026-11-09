/**
 * src/components/VocabularyTable.js
 * Interactive Bilingual Vocabulary Table & Web Speech API TTS Audio
 * Milestone: M3 (Feature F5 / Requirement R2)
 *
 * Capabilities:
 * - Interactive vocabulary table with IPA notation, part of speech pill badges,
 *   bilingual pedagogical definitions (responsive to 'vi'|'en'|'dual'), and contextual examples.
 * - Native Web Speech API audio pronunciation with pedagogical rate (0.85x),
 *   active playing animation, utterance queuing race condition guard, and graceful fallback.
 * - Instant live search & part-of-speech category filtering.
 * - Polymorphic display modes: 'embedded' (Scene 3), 'standalone', and 'modal'.
 * - Clean lifecycle cleanup (stopAudio, destroy) to prevent rogue audio across scenes.
 */

import * as speechService from '../services/speech.js';
import { getLessonById } from '../data/lessons.js';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function validateIpa(ipa) {
  if (typeof ipa !== 'string') return false;
  const trimmed = ipa.trim();
  return /^\/[^/]+\/$/.test(trimmed);
}

export class VocabularyTable {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = {
      container: null,
      vocabulary: [],
      lessonId: null,
      language: 'dual',
      mode: 'embedded',
      speechRate: 0.85,
      onClose: () => {},
      onTermSelect: () => {},
      onSpeakStart: () => {},
      onSpeakEnd: () => {},
      windowOverride: null,
      ...options,
    };

    this.container = this.options.container || null;
    this.language = ['vi', 'en', 'dual'].includes(this.options.language)
      ? this.options.language
      : 'dual';
    this.mode = this.options.mode || 'embedded';
    this.speechRate = this.options.speechRate || 0.85;
    this.targetWindow = this.options.windowOverride || (typeof window !== 'undefined' ? window : null);

    // Load vocabulary: explicit array OR fetched via lessonId
    if (Array.isArray(this.options.vocabulary) && this.options.vocabulary.length > 0) {
      this.rawVocabulary = [...this.options.vocabulary];
    } else if (this.options.lessonId) {
      const lesson = getLessonById(this.options.lessonId);
      this.rawVocabulary = lesson && Array.isArray(lesson.vocabulary) ? [...lesson.vocabulary] : [];
    } else {
      this.rawVocabulary = [];
    }

    // State
    this.state = {
      searchQuery: '',
      posFilter: 'all',
      playingIndex: null,
      speechSupported: speechService.isSupported(this.targetWindow),
      audioError: null,
    };

    this._utteranceSeq = 0;
    this._appLanguageHandler = this._handleAppLanguageChange.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);

    // Global listener for cross-component language synchronization
    if (this.targetWindow && typeof this.targetWindow.addEventListener === 'function') {
      this.targetWindow.addEventListener('app:language-change', this._appLanguageHandler);
      if (this.mode === 'modal') {
        this.targetWindow.addEventListener('keydown', this._handleKeyDown);
      }
    }

    if (this.container) {
      this.mount(this.container);
    }
  }

  // =========================================================================
  // LOCALIZATION & TRANSLATIONS
  // =========================================================================
  static I18N = {
    title: {
      vi: 'Bảng Thuật Ngữ Math English',
      en: 'Math English Vocabulary Table',
      dual: 'Bảng Thuật Ngữ Math English / Vocabulary Table',
    },
    subtitle: {
      vi: 'Thuật ngữ toán học chuẩn CLIL, phiên âm quốc tế IPA và phát âm chuẩn bản ngữ.',
      en: 'CLIL standard mathematical terminology, IPA notation, and native speech TTS.',
      dual: 'Thuật ngữ CLIL Lớp 10 • Ký hiệu phiên âm quốc tế IPA • Phát âm Web Speech API',
    },
    searchPlaceholder: {
      vi: 'Tìm thuật ngữ, phiên âm, định nghĩa...',
      en: 'Search terms, IPA, definitions...',
      dual: 'Tìm thuật ngữ, phiên âm, định nghĩa... / Search glossary...',
    },
    colTerm: { vi: 'Thuật ngữ & Phát âm', en: 'Term & Audio', dual: 'Thuật ngữ / Term' },
    colPos: { vi: 'Từ loại', en: 'Part of Speech', dual: 'Từ loại / PoS' },
    colDef: { vi: 'Định nghĩa', en: 'Definition', dual: 'Định nghĩa / Bilingual Definition' },
    colExample: { vi: 'Ví dụ ngữ cảnh', en: 'Contextual Example', dual: 'Ví dụ / Context' },
    posAll: { vi: 'Tất cả', en: 'All', dual: 'Tất cả / All' },
    posNoun: { vi: 'Danh từ', en: 'Noun', dual: 'Danh từ / Noun' },
    posVerb: { vi: 'Động từ', en: 'Verb', dual: 'Động từ / Verb' },
    posAdj: { vi: 'Tính từ', en: 'Adj', dual: 'Tính từ / Adj' },
    emptyTitle: {
      vi: 'Không tìm thấy thuật ngữ phù hợp',
      en: 'No matching terms found',
      dual: 'Không tìm thấy thuật ngữ phù hợp / No matching terms',
    },
    emptyDesc: {
      vi: 'Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc.',
      en: 'Please try another keyword or reset filters.',
      dual: 'Thử lại với từ khóa khác hoặc đặt lại bộ lọc / Try another keyword.',
    },
    resetFilters: { vi: 'Đặt lại bộ lọc', en: 'Reset Filters', dual: 'Đặt lại / Reset' },
    speedNormal: { vi: 'Chuẩn (0.85x)', en: 'Normal (0.85x)', dual: '0.85x' },
    speedSlow: { vi: 'Chậm (0.70x)', en: 'Slow (0.70x)', dual: '0.70x' },
    listenTooltip: {
      vi: 'Nhấp để nghe phát âm tiếng Anh chuẩn bản ngữ',
      en: 'Click to listen to native English pronunciation',
      dual: 'Nghe phát âm chuẩn IPA / Listen (Web Speech API)',
    },
    ttsUnavailable: {
      vi: 'Trình duyệt không hỗ trợ Web Speech API',
      en: 'Web Speech API is not supported in this browser',
      dual: 'Trình duyệt không hỗ trợ phát âm Web Speech API',
    },
    closeModal: { vi: 'Đóng', en: 'Close', dual: 'Đóng / Close' },
  };

  t(key) {
    const entry = VocabularyTable.I18N[key];
    if (!entry) return key;
    return entry[this.language] || entry.dual || entry.vi || '';
  }

  // =========================================================================
  // PUBLIC API METHODS
  // =========================================================================

  /**
   * Mounts the component to target DOM container
   * @param {HTMLElement} containerEl
   */
  mount(containerEl) {
    if (!containerEl) return;
    this.container = containerEl;
    this.render();
  }

  /**
   * Sets active language ('vi'|'en'|'dual') and updates view
   * @param {'vi'|'en'|'dual'} lang
   */
  setLanguage(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    if (this.language === lang && this.container?.innerHTML) return;
    this.language = lang;
    this.render();
  }

  /**
   * Updates vocabulary dataset
   * @param {Array<Object>} newVocab
   */
  setVocabulary(newVocab) {
    this.stopAudio();
    this.rawVocabulary = Array.isArray(newVocab) ? [...newVocab] : [];
    this.render();
  }

  /**
   * Sets speech rate (e.g. 0.85 for normal, 0.70 for slow)
   * @param {number} rate
   */
  setSpeechRate(rate) {
    if (typeof rate === 'number' && rate >= 0.5 && rate <= 1.5) {
      this.speechRate = rate;
      this.updateSpeedButtonsUI();
    }
  }

  /**
   * Pronounces a term by index in filtered list
   * @param {number} filteredIndex
   * @returns {Promise<boolean>}
   */
  async speak(filteredIndex) {
    const list = this.getFilteredVocabulary();
    const item = list[filteredIndex];
    if (!item || !item.term) return false;

    // Toggle: clicking active item stops it
    if (this.state.playingIndex === filteredIndex && speechService.isSpeaking(this.targetWindow)) {
      this.stopAudio();
      return true;
    }

    // Stop current speech
    this.stopAudio();

    const currentSeq = ++this._utteranceSeq;
    this.state.playingIndex = filteredIndex;
    this.state.audioError = null;
    this.updateAudioButtonsUI();

    if (typeof this.options.onSpeakStart === 'function') {
      this.options.onSpeakStart(item, filteredIndex);
    }

    try {
      const success = await speechService.speak(item.term, {
        lang: 'en-US',
        rate: this.speechRate,
        pitch: 1.0,
        volume: 1.0,
        window: this.targetWindow,
        onStart: () => {
          if (this._utteranceSeq !== currentSeq) return;
          this.state.playingIndex = filteredIndex;
          this.updateAudioButtonsUI();
        },
        onEnd: () => {
          if (this._utteranceSeq !== currentSeq) return;
          this.state.playingIndex = null;
          this.updateAudioButtonsUI();
          if (typeof this.options.onSpeakEnd === 'function') {
            this.options.onSpeakEnd(item, filteredIndex);
          }
        },
        onError: (err) => {
          if (this._utteranceSeq !== currentSeq) return;
          this.state.playingIndex = null;
          this.state.audioError = err?.error || 'speech-error';
          this.updateAudioButtonsUI();
        },
      }, this.targetWindow);

      return success;
    } catch (e) {
      if (this._utteranceSeq === currentSeq) {
        this.state.playingIndex = null;
        this.state.audioError = e?.message || 'unknown';
        this.updateAudioButtonsUI();
      }
      return false;
    }
  }

  /**
   * Immediately stops active speech utterance
   */
  stopAudio() {
    this._utteranceSeq++;
    speechService.stop(this.targetWindow);
    this.state.playingIndex = null;
    this.updateAudioButtonsUI();
  }

  /**
   * Cleans up event listeners and cancels audio
   */
  destroy() {
    this.stopAudio();
    if (this.targetWindow && typeof this.targetWindow.removeEventListener === 'function') {
      this.targetWindow.removeEventListener('app:language-change', this._appLanguageHandler);
      this.targetWindow.removeEventListener('keydown', this._handleKeyDown);
    }
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }

  // =========================================================================
  // FILTERING & DATA LOGIC
  // =========================================================================

  /**
   * Returns list of unique parts of speech present in current vocabulary
   * @returns {string[]}
   */
  getAvailablePartsOfSpeech() {
    const set = new Set();
    for (const v of this.rawVocabulary) {
      if (v && v.partOfSpeech) {
        set.add(v.partOfSpeech.toLowerCase().trim());
      }
    }
    return Array.from(set);
  }

  /**
   * Filters vocabulary by search query and part of speech
   * @returns {Array<Object>}
   */
  getFilteredVocabulary() {
    const query = (this.state.searchQuery || '').trim().toLowerCase();
    const pos = (this.state.posFilter || 'all').toLowerCase();

    return this.rawVocabulary.filter(item => {
      if (!item || typeof item !== 'object') return false;

      // Filter by Part of Speech
      if (pos !== 'all') {
        const itemPos = (item.partOfSpeech || '').toLowerCase().trim();
        if (itemPos !== pos && !itemPos.startsWith(pos)) {
          return false;
        }
      }

      // Filter by Search Query
      if (query !== '') {
        const term = (item.term || '').toLowerCase();
        const phonetics = (item.phonetics || '').toLowerCase();
        const defVi = (item.definitionVi || '').toLowerCase();
        const defEn = (item.definitionEn || '').toLowerCase();
        const ex = (item.exampleSentence || '').toLowerCase();
        const posText = (item.partOfSpeech || '').toLowerCase();

        const matches =
          term.includes(query) ||
          phonetics.includes(query) ||
          defVi.includes(query) ||
          defEn.includes(query) ||
          ex.includes(query) ||
          posText.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  _handleAppLanguageChange(e) {
    const lang = e.detail?.lang;
    if (lang && ['vi', 'en', 'dual'].includes(lang)) {
      this.setLanguage(lang);
    }
  }

  _handleKeyDown(e) {
    if (this.mode === 'modal' && (e.key === 'Escape' || e.keyCode === 27)) {
      this.closeModal();
    }
  }

  closeModal() {
    this.stopAudio();
    if (typeof this.options.onClose === 'function') {
      this.options.onClose();
    }
    if (this.container && this.mode === 'modal') {
      this.container.innerHTML = '';
    }
  }

  // =========================================================================
  // RENDERING
  // =========================================================================

  render() {
    if (!this.container) return;
    this.container.innerHTML = this.renderHtml();
    this.bindDOMEvents();
  }

  renderHtml() {
    const filtered = this.getFilteredVocabulary();
    const totalCount = this.rawVocabulary.length;
    const filteredCount = filtered.length;
    const isModal = this.mode === 'modal';

    const innerContent = `
      <div class="vocab-component bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Header Toolbar -->
        <div class="vocab-header px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="vocab-badge-icon w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                Aa
              </span>
              <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                ${escapeHtml(this.t('title'))}
              </h3>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ml-1">
                ${filteredCount}/${totalCount}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1 max-w-xl">
              ${escapeHtml(this.t('subtitle'))}
            </p>
          </div>

          <!-- Controls: Speed Toggle & Modal Close -->
          <div class="flex items-center gap-2 self-start md:self-auto">
            <!-- Pedagogical Speech Rate Selector -->
            <div class="inline-flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-xs shadow-2xs" role="group" aria-label="Speech Speed">
              <button type="button" class="vocab-speed-btn px-2.5 py-1 rounded-md font-medium transition-colors ${this.speechRate === 0.85 ? 'bg-blue-900 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}" data-rate="0.85" title="Tốc độ đọc tự nhiên (0.85x)">
                ${escapeHtml(this.t('speedNormal'))}
              </button>
              <button type="button" class="vocab-speed-btn px-2.5 py-1 rounded-md font-medium transition-colors ${this.speechRate === 0.70 ? 'bg-blue-900 text-white shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}" data-rate="0.70" title="Tốc độ chậm rõ âm IPA (0.70x)">
                ${escapeHtml(this.t('speedSlow'))}
              </button>
            </div>

            ${isModal ? `
              <button type="button" class="vocab-modal-close-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors" aria-label="${escapeHtml(this.t('closeModal'))}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <!-- Instant Search Box -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input
              type="text"
              class="vocab-search-input w-full pl-10 pr-10 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="${escapeHtml(this.t('searchPlaceholder'))}"
              value="${escapeHtml(this.state.searchQuery)}"
              aria-label="${escapeHtml(this.t('searchPlaceholder'))}"
            />
            ${this.state.searchQuery ? `
              <button type="button" class="vocab-clear-search absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600" aria-label="Clear search">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
              </button>
            ` : ''}
          </div>

          <!-- Part of Speech Filter Chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Part of Speech Filter">
            <button type="button" class="vocab-pos-chip px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${this.state.posFilter === 'all' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-pos="all">
              ${escapeHtml(this.t('posAll'))}
            </button>
            <button type="button" class="vocab-pos-chip px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${this.state.posFilter === 'noun' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-pos="noun">
              ${escapeHtml(this.t('posNoun'))}
            </button>
            <button type="button" class="vocab-pos-chip px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${this.state.posFilter === 'adjective' ? 'bg-blue-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-pos="adjective">
              ${escapeHtml(this.t('posAdj'))}
            </button>
          </div>
        </div>

        <!-- Main Body: Desktop Table View + Mobile Card View -->
        ${filteredCount > 0 ? `
          <!-- Desktop Table (md+) -->
          <div class="hidden md:block overflow-x-auto">
            <table class="vocab-table w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th scope="col" class="py-3 px-4 w-1/4">${escapeHtml(this.t('colTerm'))}</th>
                  <th scope="col" class="py-3 px-3 w-28">${escapeHtml(this.t('colPos'))}</th>
                  <th scope="col" class="py-3 px-4 w-2/5">${escapeHtml(this.t('colDef'))}</th>
                  <th scope="col" class="py-3 px-4">${escapeHtml(this.t('colExample'))}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${filtered.map((item, idx) => this.renderTableRowHtml(item, idx)).join('')}
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards (< md) -->
          <div class="md:hidden divide-y divide-slate-100">
            ${filtered.map((item, idx) => this.renderMobileCardHtml(item, idx)).join('')}
          </div>
        ` : `
          <!-- Empty State -->
          <div class="vocab-empty py-12 px-4 text-center">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h4 class="text-sm font-bold text-slate-800 mb-1">${escapeHtml(this.t('emptyTitle'))}</h4>
            <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">${escapeHtml(this.t('emptyDesc'))}</p>
            <button type="button" class="vocab-reset-btn px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">
              ${escapeHtml(this.t('resetFilters'))}
            </button>
          </div>
        `}
      </div>
    `;

    if (isModal) {
      return `
        <div class="vocab-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="${escapeHtml(this.t('title'))}">
          <div class="vocab-modal-container w-full max-w-4xl max-h-[90vh] flex flex-col my-auto">
            ${innerContent}
          </div>
        </div>
      `;
    }

    return innerContent;
  }

  /**
   * Renders single table row for desktop view
   * @param {Object} item
   * @param {number} idx
   * @returns {string}
   */
  renderTableRowHtml(item, idx) {
    const isPlaying = this.state.playingIndex === idx;
    const ipaValid = validateIpa(item.phonetics);
    const posBadgeClass = this.getPosBadgeClass(item.partOfSpeech);

    return `
      <tr class="vocab-row hover:bg-blue-50/40 transition-colors ${isPlaying ? 'bg-blue-50/70' : ''}" data-index="${idx}">
        <!-- Term & Pronunciation Speaker -->
        <td class="py-3 px-4 align-top">
          <div class="flex items-start gap-3">
            <button
              type="button"
              class="vocab-audio-btn flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                isPlaying
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 ring-offset-1 animate-pulse'
                  : 'bg-white text-blue-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
              }"
              data-index="${idx}"
              aria-label="Listen to ${escapeHtml(item.term)}"
              title="${escapeHtml(this.t('listenTooltip'))}"
            >
              ${this.getSpeakerIconSvg(isPlaying)}
            </button>
            <div>
              <div class="vocab-term font-bold text-slate-900 text-sm tracking-tight leading-snug">
                ${escapeHtml(item.term)}
              </div>
              <div class="vocab-ipa font-mono text-xs ${ipaValid ? 'text-slate-500' : 'text-amber-600 font-semibold'} mt-0.5">
                ${escapeHtml(item.phonetics || '—')}
              </div>
            </div>
          </div>
        </td>

        <!-- Part of Speech Pill Badge -->
        <td class="py-3 px-3 align-top">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${posBadgeClass}">
            ${escapeHtml(item.partOfSpeech || 'noun')}
          </span>
        </td>

        <!-- Bilingual Definitions (Responsive to this.language) -->
        <td class="py-3 px-4 align-top text-xs sm:text-sm text-slate-700 leading-relaxed">
          ${this.renderDefinitionHtml(item)}
        </td>

        <!-- Contextual Bilingual Example -->
        <td class="py-3 px-4 align-top text-xs text-slate-600 leading-relaxed italic">
          <div class="vocab-example bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
            ${escapeHtml(item.exampleSentence || '—')}
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Renders single mobile card (< md)
   * @param {Object} item
   * @param {number} idx
   * @returns {string}
   */
  renderMobileCardHtml(item, idx) {
    const isPlaying = this.state.playingIndex === idx;
    const posBadgeClass = this.getPosBadgeClass(item.partOfSpeech);

    return `
      <div class="vocab-card p-4 space-y-2.5 ${isPlaying ? 'bg-blue-50/50' : ''}" data-index="${idx}">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="vocab-audio-btn w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                isPlaying
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 ring-offset-1 animate-pulse'
                  : 'bg-white text-blue-700 border-slate-200 active:bg-blue-100'
              }"
              data-index="${idx}"
              aria-label="Listen to ${escapeHtml(item.term)}"
            >
              ${this.getSpeakerIconSvg(isPlaying)}
            </button>
            <div>
              <div class="font-bold text-slate-900 text-sm">${escapeHtml(item.term)}</div>
              <div class="font-mono text-xs text-slate-500">${escapeHtml(item.phonetics || '—')}</div>
            </div>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${posBadgeClass}">
            ${escapeHtml(item.partOfSpeech || 'noun')}
          </span>
        </div>

        <div class="text-xs text-slate-700 pl-1 leading-relaxed">
          ${this.renderDefinitionHtml(item)}
        </div>

        ${item.exampleSentence ? `
          <div class="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 italic">
            ${escapeHtml(item.exampleSentence)}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Renders definition depending on language toggle mode ('vi'|'en'|'dual')
   * @param {Object} item
   * @returns {string}
   */
  renderDefinitionHtml(item) {
    const defVi = item.definitionVi || '';
    const defEn = item.definitionEn || '';

    if (this.language === 'vi') {
      return `<div>${escapeHtml(defVi || defEn)}</div>`;
    }
    if (this.language === 'en') {
      return `<div>${escapeHtml(defEn || defVi)}</div>`;
    }

    // Dual mode (both with badges)
    return `
      <div class="space-y-1.5">
        <div class="vocab-def-vi flex items-start gap-1.5">
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 mt-0.5 flex-shrink-0">
            VI
          </span>
          <span>${escapeHtml(defVi)}</span>
        </div>
        <div class="vocab-def-en flex items-start gap-1.5 text-slate-600">
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-0.5 flex-shrink-0">
            EN
          </span>
          <span>${escapeHtml(defEn)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Returns Tailwind color classes for Part of Speech pill badges
   * @param {string} pos
   * @returns {string}
   */
  getPosBadgeClass(pos = '') {
    const p = String(pos).toLowerCase().trim();
    if (p.includes('noun')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (p.includes('verb')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (p.includes('adj')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (p.includes('adv')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (p.includes('formula')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }

  /**
   * Returns Speaker SVG icon (idle or playing wave)
   * @param {boolean} isPlaying
   * @returns {string}
   */
  getSpeakerIconSvg(isPlaying) {
    if (isPlaying) {
      return `
        <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/>
        </svg>
      `;
    }
    return `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M11 5L6 9H2v6h4l5 4V5z"/>
      </svg>
    `;
  }

  // =========================================================================
  // DOM EVENT BINDINGS
  // =========================================================================

  bindDOMEvents() {
    if (!this.container) return;

    // Search Input
    const searchInput = this.container.querySelector('.vocab-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.render();
        // Restore focus to search input
        const reSearch = this.container.querySelector('.vocab-search-input');
        if (reSearch) {
          reSearch.focus();
          reSearch.selectionStart = reSearch.selectionEnd = reSearch.value.length;
        }
      });
    }

    // Clear Search Button
    const clearBtn = this.container.querySelector('.vocab-clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.state.searchQuery = '';
        this.render();
      });
    }

    // Part of Speech Filter Chips
    const posChips = this.container.querySelectorAll('.vocab-pos-chip');
    posChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const pos = chip.getAttribute('data-pos') || 'all';
        this.state.posFilter = pos;
        this.render();
      });
    });

    // Reset Filters Button (empty state)
    const resetBtn = this.container.querySelector('.vocab-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.state.searchQuery = '';
        this.state.posFilter = 'all';
        this.render();
      });
    }

    // Audio Speaker Buttons (Event Delegation)
    const audioButtons = this.container.querySelectorAll('.vocab-audio-btn');
    audioButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          this.speak(idx);
        }
      });
    });

    // Speed Rate Toggle Buttons
    const speedButtons = this.container.querySelectorAll('.vocab-speed-btn');
    speedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const rate = parseFloat(btn.getAttribute('data-rate'));
        if (!isNaN(rate)) {
          this.setSpeechRate(rate);
        }
      });
    });

    // Modal Close
    if (this.mode === 'modal') {
      const closeBtn = this.container.querySelector('.vocab-modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }
      const backdrop = this.container.querySelector('.vocab-modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            this.closeModal();
          }
        });
      }
    }
  }

  /**
   * Updates only audio buttons DOM state without full re-render
   */
  updateAudioButtonsUI() {
    if (!this.container) return;
    const buttons = this.container.querySelectorAll('.vocab-audio-btn');
    buttons.forEach(btn => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const isPlaying = idx === this.state.playingIndex;
      btn.innerHTML = this.getSpeakerIconSvg(isPlaying);
      if (isPlaying) {
        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600', 'shadow-md', 'ring-2', 'ring-blue-300', 'animate-pulse');
        btn.classList.remove('bg-white', 'text-blue-700', 'border-slate-200');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600', 'shadow-md', 'ring-2', 'ring-blue-300', 'animate-pulse');
        btn.classList.add('bg-white', 'text-blue-700', 'border-slate-200');
      }
    });

    // Update row highlighting
    const rows = this.container.querySelectorAll('.vocab-row');
    rows.forEach(r => {
      const idx = parseInt(r.getAttribute('data-index'), 10);
      if (idx === this.state.playingIndex) {
        r.classList.add('bg-blue-50/70');
      } else {
        r.classList.remove('bg-blue-50/70');
      }
    });
  }

  /**
   * Updates speed button active classes
   */
  updateSpeedButtonsUI() {
    if (!this.container) return;
    const speedButtons = this.container.querySelectorAll('.vocab-speed-btn');
    speedButtons.forEach(btn => {
      const rate = parseFloat(btn.getAttribute('data-rate'));
      if (rate === this.speechRate) {
        btn.classList.add('bg-blue-900', 'text-white', 'shadow-xs', 'font-semibold');
        btn.classList.remove('text-slate-600');
      } else {
        btn.classList.remove('bg-blue-900', 'text-white', 'shadow-xs', 'font-semibold');
        btn.classList.add('text-slate-600');
      }
    });
  }
}

export default VocabularyTable;
