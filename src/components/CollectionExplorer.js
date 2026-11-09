/**
 * src/components/CollectionExplorer.js
 * Grade 10 Math Problem Collection Explorer (Feature F1 / Requirement R1)
 *
 * Implements:
 * - Search input filtering across Vietnamese & English titles, keywords, topics, and contexts.
 * - Topic filter buttons (All, Trigonometry, Quadratic, Optimization).
 * - Difficulty filter (All, Basic, Medium, Hard).
 * - Lesson Card grid with authentic KHKT figure media thumbnails.
 * - Dual-layer verification badges (Math Rigor Passed, CLIL English Passed, 100% KHKT Gold Seal).
 * - "Bắt đầu học / Start Lesson" selection event dispatching to router/app.js.
 */

import { DEFAULT_LESSONS } from '../data/lessons.js';
import { getLessons } from '../services/storage.js';
import { getPublishGateReport } from '../services/verification.js';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function filterLessons(lessons, filters = {}) {
  if (!Array.isArray(lessons)) return [];

  const rawQuery = filters.query ?? '';
  const cleanQuery = String(rawQuery).trim().toLowerCase();
  const targetTopic = (filters.topic || 'all').toLowerCase();
  const targetDifficulty = (filters.difficulty || 'all').toLowerCase();

  return lessons.filter(lesson => {
    if (!lesson || typeof lesson !== 'object') return false;

    // 1. Topic Filtering (Strict isolation)
    if (targetTopic !== 'all') {
      const lessonTopic = (lesson.topic || '').toLowerCase();
      if (lessonTopic !== targetTopic) {
        return false;
      }
    }

    // 2. Difficulty Filtering
    if (targetDifficulty !== 'all') {
      const lessonDiff = (lesson.difficulty || '').toLowerCase();
      const normalizedDiff = lessonDiff === 'cơ bản' ? 'basic'
        : lessonDiff === 'vận dụng' ? 'medium'
        : lessonDiff === 'vận dụng cao' ? 'hard'
        : lessonDiff;
      if (normalizedDiff !== targetDifficulty) {
        return false;
      }
    }

    // 3. Search Query Matching (Vietnamese & English, Titles & Keywords)
    if (cleanQuery !== '') {
      const titleVi = (lesson.titleVi || '').toLowerCase();
      const titleEn = (lesson.titleEn || '').toLowerCase();
      const topicTitleVi = (lesson.topicTitleVi || '').toLowerCase();
      const topicTitleEn = (lesson.topicTitleEn || '').toLowerCase();
      const contextVi = (lesson.realWorldContextVi || '').toLowerCase();
      const contextEn = (lesson.realWorldContextEn || '').toLowerCase();
      const topicKey = (lesson.topic || '').toLowerCase();

      const directMatch =
        titleVi.includes(cleanQuery) ||
        titleEn.includes(cleanQuery) ||
        topicTitleVi.includes(cleanQuery) ||
        topicTitleEn.includes(cleanQuery) ||
        topicKey.includes(cleanQuery) ||
        contextVi.includes(cleanQuery) ||
        contextEn.includes(cleanQuery);

      if (directMatch) return true;

      // Vocabulary item matching
      if (Array.isArray(lesson.vocabulary)) {
        const vocabMatch = lesson.vocabulary.some(v => {
          if (!v) return false;
          const term = (v.term || '').toLowerCase();
          const defVi = (v.definitionVi || '').toLowerCase();
          const defEn = (v.definitionEn || '').toLowerCase();
          return term.includes(cleanQuery) || defVi.includes(cleanQuery) || defEn.includes(cleanQuery);
        });
        if (vocabMatch) return true;
      }

      // Scene content matching
      if (Array.isArray(lesson.scenes)) {
        const sceneMatch = lesson.scenes.some(s => {
          if (!s) return false;
          const sTitleVi = (s.titleVi || '').toLowerCase();
          const sTitleEn = (s.titleEn || '').toLowerCase();
          const sContentVi = (s.contentVi || '').toLowerCase();
          const sContentEn = (s.contentEn || '').toLowerCase();
          return (
            sTitleVi.includes(cleanQuery) ||
            sTitleEn.includes(cleanQuery) ||
            sContentVi.includes(cleanQuery) ||
            sContentEn.includes(cleanQuery)
          );
        });
        if (sceneMatch) return true;
      }

      return false;
    }

    return true;
  });
}

export function getLessonBadges(lesson) {
  let report;
  try {
    report = getPublishGateReport(lesson);
  } catch (e) {
    report = {
      canPublish: false,
      math: { passed: false, passCount: 0, total: 5 },
      english: { passed: false, passCount: 0, total: 5 },
    };
  }

  const isPublished = lesson.status === 'PUBLISHED' || (report.canPublish && lesson.status === 'VERIFIED');

  return {
    mathBadge: {
      passed: report.math.passed,
      text: report.math.passed ? 'Math Rigor Passed' : `Toán học (${report.math.passCount}/5)`,
      class: report.math.passed ? 'badge badge-verified-math' : 'badge badge-draft',
      title: report.math.passed
        ? 'Lớp 1: Đạt 5/5 tiêu chí tính chính xác Toán học (Nhất quán dữ kiện, Hình học, Biên, Công thức, Dung sai)'
        : `Lớp 1: Đang thẩm định (${report.math.passCount}/5 tiêu chí đạt)`,
    },
    englishBadge: {
      passed: report.english.passed,
      text: report.english.passed ? 'CLIL English Passed' : `Tiếng Anh (${report.english.passCount}/5)`,
      class: report.english.passed ? 'badge badge-verified-english' : 'badge badge-draft',
      title: report.english.passed
        ? 'Lớp 2: Đạt 5/5 tiêu chí chuẩn ngữ nghĩa CLIL (Thuật ngữ, Phiên âm IPA, Đối ứng song ngữ, Audio Speech, Phụ đề)'
        : `Lớp 2: Đang thẩm định (${report.english.passCount}/5 tiêu chí đạt)`,
    },
    khktBadge: isPublished ? {
      passed: true,
      text: '100% KHKT Verified',
      class: 'badge badge-khkt-gold',
      title: 'Đã hoàn tất quy trình kiểm chứng 2 lớp độc lập và đóng gói theo chuẩn KHKT',
    } : {
      passed: false,
      text: 'Bản nháp / Draft',
      class: 'badge badge-draft',
      title: 'Bài học chưa hoàn tất phê duyệt 10/10 tiêu chí kiểm chứng',
    },
    difficultyBadge: getDifficultyBadgeInfo(lesson.difficulty),
    topicLabelVi: getTopicLabelVi(lesson.topic),
  };
}

function getDifficultyBadgeInfo(diff = 'Medium') {
  const norm = String(diff).toLowerCase();
  if (norm === 'basic' || norm === 'cơ bản') {
    return { text: 'Cơ bản / Basic', class: 'bg-emerald-100 text-emerald-800 border border-emerald-300' };
  }
  if (norm === 'hard' || norm === 'advanced' || norm === 'vận dụng cao') {
    return { text: 'Vận dụng cao / Hard', class: 'bg-amber-100 text-amber-800 border border-amber-300' };
  }
  return { text: 'Vận dụng / Medium', class: 'bg-blue-100 text-blue-800 border border-blue-300' };
}

function getTopicLabelVi(topic = '') {
  switch (topic) {
    case 'trigonometry': return 'Hệ thức lượng';
    case 'quadratic': return 'Hàm số bậc hai';
    case 'optimization': return 'Tối ưu hóa';
    default: return topic || 'Toán thực tiễn';
  }
}

export class CollectionExplorer {
  constructor(options = {}) {
    this.options = options;
    this.container = typeof options.container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.container) : null)
      : options.container;

    this.onSelectLesson = options.onSelectLesson || null;
    this.onNavigate = options.onNavigate || null;
    this.storageOverride = options.storageOverride || null;

    if (Array.isArray(options.lessons) && options.lessons.length > 0) {
      this.allLessons = options.lessons;
    } else {
      this.reloadLessonsFromStorage();
    }

    this.state = {
      query: '',
      topic: 'all',
      difficulty: 'all',
    };

    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleTopicClick = this.handleTopicClick.bind(this);
    this.handleDifficultyClick = this.handleDifficultyClick.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);

    if (this.container) {
      this.render();
    }
  }

  reloadLessonsFromStorage() {
    try {
      this.allLessons = getLessons(DEFAULT_LESSONS, this.storageOverride);
    } catch (e) {
      this.allLessons = DEFAULT_LESSONS;
    }
  }

  mount(container) {
    this.container = typeof container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(container) : null)
      : container;
    this.render();
  }

  setLessons(lessons) {
    if (Array.isArray(lessons)) {
      this.allLessons = lessons;
      this.render();
    }
  }

  setSearch(query) {
    this.state.query = query || '';
    this.render();
  }

  setTopic(topic) {
    this.state.topic = topic || 'all';
    this.render();
  }

  setDifficulty(difficulty) {
    this.state.difficulty = difficulty || 'all';
    this.render();
  }

  selectLesson(lessonId) {
    const lesson = this.allLessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (typeof this.onSelectLesson === 'function') {
      this.onSelectLesson(lesson.id, lesson);
    }

    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      const event = new CustomEvent('lesson-select', {
        detail: { lessonId: lesson.id, lesson },
        bubbles: true,
      });

      if (this.container && typeof this.container.dispatchEvent === 'function') {
        this.container.dispatchEvent(event);
      } else if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(event);
      }
    }
  }

  getFilteredLessons() {
    return filterLessons(this.allLessons, this.state);
  }

  render() {
    if (!this.container) return;

    const filtered = this.getFilteredLessons();
    const isFiltered = this.state.query !== '' || this.state.topic !== 'all' || this.state.difficulty !== 'all';

    this.container.innerHTML = `
      <section class="collection-explorer space-y-8" aria-label="Bộ sưu tập bài toán thực tế Toán 10">
        <div class="explorer-hero text-left bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col items-start justify-start">
          <div class="relative z-10 max-w-3xl text-left flex flex-col items-start">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-700/60 text-xs font-semibold text-blue-200 mb-3 text-left">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 text-left">
              Bộ Sưu Tập Bài Toán Thực Tế Lớp 10 (CLIL)
            </h1>
            <p class="text-sm sm:text-base text-blue-200 leading-relaxed mb-4 text-left">
              Khám phá và giải quyết các bài toán thực tiễn tích hợp tiếng Anh qua quy trình học 5 phân cảnh chuẩn hóa, bảng từ vựng tương tác có phát âm Web Speech API và hệ thống kiểm chứng 2 lớp độc lập.
            </p>
            <div class="flex flex-wrap items-center justify-start gap-2.5 text-xs text-blue-200 text-left">
              <span class="inline-flex items-center gap-1.5 bg-blue-800/60 px-3 py-1.5 rounded-lg border border-blue-700/50">
                📐 3 Chủ đề cốt lõi Lớp 10
              </span>
              <span class="inline-flex items-center gap-1.5 bg-blue-800/60 px-3 py-1.5 rounded-lg border border-blue-700/50">
                🛡️ 100% Đạt chuẩn kiểm chứng 2 lớp
              </span>
              <span class="inline-flex items-center gap-1.5 bg-blue-800/60 px-3 py-1.5 rounded-lg border border-blue-700/50">
                📝 Phiếu học tập 10 điểm tự động
              </span>
            </div>

            <div class="pt-3 text-left">
              <button type="button" class="btn-go-showcase-page inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition">
                🏆 Xem Trang Thuyết Minh Nghiên Cứu KHKT (N=400) →
              </button>
            </div>
          </div>
        </div>

        <div class="explorer-toolbar bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" width="16" height="16" style="width: 16px; height: 16px; min-width: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                id="lesson-search-input"
                class="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                placeholder="Tìm bài học (hải đăng, parabol, tối ưu, lighthouse, quadratic, bus...)"
                value="${escapeHtml(this.state.query)}"
                autocomplete="off"
                aria-label="Tìm kiếm bài học"
              />
              ${this.state.query ? `
                <button
                  type="button"
                  id="clear-search-btn"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  title="Xóa tìm kiếm"
                >
                  <svg class="w-4 h-4" width="16" height="16" style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              ` : ''}
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-600">
              <span class="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                Hiển thị <strong id="filtered-count" class="text-blue-700">${filtered.length}</strong> / ${this.allLessons.length} bài học
              </span>
              ${isFiltered ? `
                <button
                  type="button"
                  id="reset-all-filters-btn"
                  class="text-blue-600 hover:text-blue-800 underline text-xs font-medium ml-2"
                >
                  Đặt lại lọc
                </button>
              ` : ''}
            </div>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div class="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Lọc theo chủ đề">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Chủ đề:</span>
              <button
                type="button"
                class="topic-btn btn btn-sm ${this.state.topic === 'all' ? 'btn-primary' : 'btn-outline'}"
                data-topic="all"
                aria-pressed="${this.state.topic === 'all'}"
              >
                Tất cả (All)
              </button>
              <button
                type="button"
                class="topic-btn btn btn-sm ${this.state.topic === 'trigonometry' ? 'btn-primary' : 'btn-outline'}"
                data-topic="trigonometry"
                aria-pressed="${this.state.topic === 'trigonometry'}"
              >
                📐 Hệ thức lượng
              </button>
              <button
                type="button"
                class="topic-btn btn btn-sm ${this.state.topic === 'quadratic' ? 'btn-primary' : 'btn-outline'}"
                data-topic="quadratic"
                aria-pressed="${this.state.topic === 'quadratic'}"
              >
                ⚡ Hàm số bậc hai
              </button>
              <button
                type="button"
                class="topic-btn btn btn-sm ${this.state.topic === 'optimization' ? 'btn-primary' : 'btn-outline'}"
                data-topic="optimization"
                aria-pressed="${this.state.topic === 'optimization'}"
              >
                📈 Tối ưu hóa
              </button>
            </div>

            <div class="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Lọc theo độ khó">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Độ khó:</span>
              <button
                type="button"
                class="difficulty-btn btn btn-sm ${this.state.difficulty === 'all' ? 'btn-primary' : 'btn-outline'}"
                data-difficulty="all"
                aria-pressed="${this.state.difficulty === 'all'}"
              >
                Tất cả (All)
              </button>
              <button
                type="button"
                class="difficulty-btn btn btn-sm ${this.state.difficulty === 'Basic' ? 'btn-primary' : 'btn-outline'}"
                data-difficulty="Basic"
                aria-pressed="${this.state.difficulty === 'Basic'}"
              >
                Cơ bản
              </button>
              <button
                type="button"
                class="difficulty-btn btn btn-sm ${this.state.difficulty === 'Medium' ? 'btn-primary' : 'btn-outline'}"
                data-difficulty="Medium"
                aria-pressed="${this.state.difficulty === 'Medium'}"
              >
                Vận dụng
              </button>
              <button
                type="button"
                class="difficulty-btn btn btn-sm ${this.state.difficulty === 'Hard' ? 'btn-primary' : 'btn-outline'}"
                data-difficulty="Hard"
                aria-pressed="${this.state.difficulty === 'Hard'}"
              >
                Vận dụng cao
              </button>

              <select
                id="difficulty-select"
                class="sr-only"
                aria-label="Lọc theo độ khó"
                tabindex="-1"
              >
                <option value="all" ${this.state.difficulty === 'all' ? 'selected' : ''}>Tất cả độ khó (All)</option>
                <option value="Basic" ${this.state.difficulty === 'Basic' ? 'selected' : ''}>Cơ bản (Basic)</option>
                <option value="Medium" ${this.state.difficulty === 'Medium' ? 'selected' : ''}>Vận dụng (Medium)</option>
                <option value="Hard" ${this.state.difficulty === 'Hard' ? 'selected' : ''}>Vận dụng cao (Hard)</option>
              </select>
            </div>
          </div>
        </div>

        <div id="lesson-cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.length > 0
            ? filtered.map(lesson => this.renderCardHtml(lesson)).join('')
            : this.renderEmptyStateHtml()}
        </div>
      </section>
    `;

    this.bindEvents();
  }

  renderCardHtml(lesson) {
    const badges = getLessonBadges(lesson);
    const thumbnailSrc = lesson.thumbnail || '/assets/khkt/image1.png';
    const sceneCount = Array.isArray(lesson.scenes) ? lesson.scenes.length : 5;
    const estMin = lesson.estimatedMinutes || 15;

    return `
      <article
        class="card group flex flex-col justify-between hover:shadow-lg transition-all duration-200 border border-slate-200 bg-white rounded-2xl overflow-hidden cursor-pointer"
        data-card-id="${escapeHtml(lesson.id)}"
      >
        <div class="card-media-wrapper" style="position: relative; width: 100%; height: 235px; min-height: 235px; background-color: #0f172a; overflow: hidden; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e2e8f0;">
          <img
            src="${escapeHtml(thumbnailSrc)}"
            alt="${escapeHtml(lesson.titleVi)}"
            loading="lazy"
            style="object-fit: contain; max-height: 100%; max-width: 100%; width: auto; height: auto; margin: auto; display: block; padding: 6px 8px;"
            onerror="this.onerror=null; this.src='/assets/khkt/image1.png';"
          />
          <div style="position: absolute; top: 10px; left: 10px; z-index: 10; pointer-events: none;">
            <span style="display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: rgba(30, 58, 138, 0.95); color: #ffffff; border: 1px solid rgba(96, 165, 250, 0.4); box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              Toán 10 • ${escapeHtml(badges.topicLabelVi)}
            </span>
          </div>
          <div style="position: absolute; top: 10px; right: 10px; z-index: 10; pointer-events: none;">
            <span class="${badges.difficultyBadge.class}" style="display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.25);">
              ${escapeHtml(badges.difficultyBadge.text)}
            </span>
          </div>
          <div style="position: absolute; bottom: 10px; right: 10px; z-index: 10; pointer-events: none;">
            <span style="display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(15, 23, 42, 0.88); color: #e2e8f0; border: 1px solid rgba(71, 85, 105, 0.6); box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ⏱️ ${estMin} phút
            </span>
          </div>
        </div>

        <div class="card-body p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
              ${escapeHtml(lesson.titleVi)}
            </h3>
            <h4 class="text-xs sm:text-sm font-medium text-slate-500 italic mt-1 leading-normal">
              ${escapeHtml(lesson.titleEn)}
            </h4>
            <p class="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
              ${escapeHtml(lesson.realWorldContextVi || lesson.scenes?.[0]?.contentVi || '')}
            </p>
          </div>

          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kiểm chứng KHKT 2 lớp:
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="${badges.mathBadge.class}" title="${escapeHtml(badges.mathBadge.title)}">
                <svg class="w-3.5 h-3.5" width="14" height="14" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                ${escapeHtml(badges.mathBadge.text)}
              </span>

              <span class="${badges.englishBadge.class}" title="${escapeHtml(badges.englishBadge.title)}">
                <svg class="w-3.5 h-3.5" width="14" height="14" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                ${escapeHtml(badges.englishBadge.text)}
              </span>

              <span class="${badges.khktBadge.class}" title="${escapeHtml(badges.khktBadge.title)}">
                <svg class="w-3.5 h-3.5" width="14" height="14" style="width: 14px; height: 14px;" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                ${escapeHtml(badges.khktBadge.text)}
              </span>
            </div>
          </div>
        </div>

        <div class="card-footer p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div class="text-[11px] text-slate-500 font-medium">
            <span class="font-bold text-slate-700">${sceneCount}</span> phân cảnh song ngữ
          </div>
          <button
            type="button"
            class="btn btn-primary btn-sm px-4 py-2 text-xs font-bold rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5 start-lesson-btn"
            data-action="start-lesson"
            data-lesson-id="${escapeHtml(lesson.id)}"
            aria-label="Bắt đầu học bài ${escapeHtml(lesson.titleVi)}"
          >
            <span>Bắt đầu học</span>
            <svg class="w-3.5 h-3.5" width="14" height="14" style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }

  renderEmptyStateHtml() {
    return `
      <div class="col-span-full py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
          🔍
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1">
          Không tìm thấy bài học phù hợp
        </h3>
        <p class="text-sm text-slate-500 max-w-md mx-auto mb-5">
          Không có bài học nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc.
        </p>
        <button
          type="button"
          id="empty-reset-btn"
          class="btn btn-secondary text-xs px-4 py-2 font-semibold"
        >
          Đặt lại tất cả bộ lọc / Reset Filters
        </button>
      </div>
    `;
  }

  bindEvents() {
    if (!this.container) return;

    const searchInput = this.container.querySelector('#lesson-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearchInput);
    }

    const clearBtn = this.container.querySelector('#clear-search-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.state.query = '';
        this.render();
      });
    }

    const resetBtn = this.container.querySelector('#reset-all-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', this.handleResetFilters);
    }

    const showcasePageBtn = this.container.querySelector('.btn-go-showcase-page');
    if (showcasePageBtn) {
      showcasePageBtn.addEventListener('click', () => {
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('showcase');
        } else if (typeof this.options?.onNavigate === 'function') {
          this.options.onNavigate('showcase');
        } else if (typeof window !== 'undefined' && window.app && typeof window.app.handleNavigate === 'function') {
          window.app.handleNavigate('showcase');
        } else if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab: 'showcase' } }));
        }
      });
    }

    const emptyResetBtn = this.container.querySelector('#empty-reset-btn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', this.handleResetFilters);
    }

    const topicButtons = this.container.querySelectorAll('.topic-btn');
    topicButtons.forEach(btn => {
      btn.addEventListener('click', this.handleTopicClick);
    });

    const diffButtons = this.container.querySelectorAll('.difficulty-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', this.handleDifficultyClick);
    });

    const diffSelect = this.container.querySelector('#difficulty-select');
    if (diffSelect) {
      diffSelect.addEventListener('change', this.handleDifficultyChange);
    }

    const cardsContainer = this.container.querySelector('#lesson-cards-container');
    if (cardsContainer) {
      cardsContainer.addEventListener('click', this.handleCardClick);
    }
  }

  handleSearchInput(e) {
    this.state.query = e.target.value;
    this.updateCardsGrid();
  }

  handleTopicClick(e) {
    const btn = e.target.closest('.topic-btn');
    if (!btn) return;
    const topic = btn.dataset.topic || 'all';
    this.state.topic = topic;
    this.render();
  }

  handleDifficultyClick(e) {
    const btn = e.target.closest('.difficulty-btn');
    if (!btn) return;
    const diff = btn.dataset.difficulty || 'all';
    this.state.difficulty = diff;
    this.render();
  }

  handleDifficultyChange(e) {
    this.state.difficulty = e.target.value;
    this.render();
  }

  handleResetFilters() {
    this.state.query = '';
    this.state.topic = 'all';
    this.state.difficulty = 'all';
    this.render();
  }

  handleCardClick(e) {
    const startBtn = e.target.closest('.start-lesson-btn');
    if (startBtn) {
      e.stopPropagation();
      const lessonId = startBtn.dataset.lessonId;
      if (lessonId) this.selectLesson(lessonId);
      return;
    }

    const card = e.target.closest('[data-card-id]');
    if (card) {
      const lessonId = card.dataset.cardId;
      if (lessonId) this.selectLesson(lessonId);
    }
  }

  updateCardsGrid() {
    if (!this.container) return;
    const cardsContainer = this.container.querySelector('#lesson-cards-container');
    if (!cardsContainer) {
      this.render();
      return;
    }

    const filtered = this.getFilteredLessons();
    cardsContainer.innerHTML = filtered.length > 0
      ? filtered.map(lesson => this.renderCardHtml(lesson)).join('')
      : this.renderEmptyStateHtml();

    const emptyResetBtn = this.container.querySelector('#empty-reset-btn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', this.handleResetFilters);
    }

    const countEl = this.container.querySelector('#filtered-count');
    if (countEl) {
      countEl.textContent = String(filtered.length);
    }

    const clearBtn = this.container.querySelector('#clear-search-btn');
    if (clearBtn) {
      if (this.state.query) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

export default CollectionExplorer;
