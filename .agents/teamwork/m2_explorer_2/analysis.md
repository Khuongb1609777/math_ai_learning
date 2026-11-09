# Technical Analysis: Problem Collection Explorer (`CollectionExplorer.js`)

**Role**: Milestone M2 Explorer 2 (Collection Explorer, Lesson Cards & Badges)  
**Date**: 2026-11-07  
**Artifact**: Architecture, Design Specification & Drop-in Proposed Implementation  

---

## 1. Executive Summary & Objective

In accordance with **Requirement R1** from `ORIGINAL_REQUEST.md` and **Feature F1** from `PROJECT.md`, the `CollectionExplorer` component provides Grade 10 students and educators with an intuitive, responsive catalog for discovering, searching, and filtering real-world practical mathematics problems integrated with English (CLIL).

This component serves as the primary home screen and discovery hub of the application. It highlights the authentic research findings of the KHKT project (THPT Trần Văn Kiết) by showcasing the 3 core Grade 10 curriculum topics:
1. **Trigonometry / Hệ thức lượng trong tam giác** (`lesson-lighthouse`: Đo chiều cao ngọn hải đăng với chân tháp không thể tiếp cận).
2. **Quadratic Function / Hàm số bậc hai** (`lesson-parabolic-arch`: Cổng chào Parabol và Giới hạn chiều cao xe tải).
3. **Optimization / Tối ưu hóa** (`lesson-bus-optimization`: Tối ưu hóa doanh thu xe buýt du lịch Chợ Lách).

It enforces strict test adherence across:
- **Tier 1 Feature Tests (F1.1 - F1.5)**: 3 default Grade 10 lessons, 3 core topics, bilingual keyword search, strict topic isolation, difficulty ratings, and dual-layer verification badges.
- **Tier 2 Boundary Tests (F1.B1 - F1.B5)**: Null/empty query tolerance, regex/HTML injection immunity, zero-match empty state without throwing, non-existent topic resilience, and whitespace trimming.
- **Tier 3 Pairwise & Tier 4 Scenarios (Pair 1, Pair 7, Scenario 1)**: Seamless card selection transition to the 5-Scene Player (`lesson-select` event with payload `{ lessonId, lesson }`), and dynamic inclusion of custom user-authored lessons from LocalStorage.

---

## 2. Component Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Container (src/app.js)                      │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │  Header & Navigation (F14 / M2 Explorer 1)                   │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │           CollectionExplorer (src/components/CollectionExplorer)    │
│   │                                                              │     │
│   │  ┌────────────────────────────────────────────────────────┐  │     │
│   │  │ Hero Banner: KHKT Grade 10 CLIL Mathematics Overview   │  │     │
│   │  └────────────────────────────────────────────────────────┘  │     │
│   │                                                              │     │
│   │  ┌────────────────────────────────────────────────────────┐  │     │
│   │  │ Toolbar: Search Input + Topic Filter Pills + Diff Dropdown ││   │
│   │  └──────────────────────────┬─────────────────────────────┘  │     │
│   │                             │ Filter State                   │     │
│   │                             ▼                                │     │
│   │  ┌────────────────────────────────────────────────────────┐  │     │
│   │  │ Lesson Cards Grid (3 Columns Responsive)               │  │     │
│   │  │                                                        │  │     │
│   │  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────┐  │  │     │
│   │  │  │ Lesson Card 1    │ │ Lesson Card 2    │ │ Card 3 │  │  │     │
│   │  │  │ - KHKT Thumbnail │ │ - KHKT Thumbnail │ │ ...    │  │  │     │
│   │  │  │ - Bilingual Title│ │ - Bilingual Title│          │  │  │     │
│   │  │  │ - Dual Badges    │ │ - Dual Badges    │          │  │  │     │
│   │  │  │ - "Start Lesson" │ │ - "Start Lesson" │          │  │  │     │
│   │  │  └────────┬─────────┘ └──────────────────┘ └────────┘  │  │     │
│   │  └───────────┼────────────────────────────────────────────┘  │     │
│   └──────────────┼───────────────────────────────────────────────┘     │
│                  │                                                     │
│                  │ Event: 'lesson-select' ({ lessonId, lesson })       │
│                  ▼                                                     │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │      5-Scene Bilingual Multimedia Player (src/components/     │     │
│   │               LessonPlayer.js - Milestone M3)                │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Technical Requirements & Implementation Strategies

### 3.1 Search Input & Query Sanitization
- **Searchable Attributes**:
  The search matching algorithm evaluates a combined set of attributes to maximize discovery while preventing false negatives:
  * Vietnamese Title: `lesson.titleVi`
  * English Title: `lesson.titleEn`
  * Vietnamese Topic Name: `lesson.topicTitleVi`
  * English Topic Name: `lesson.topicTitleEn`
  * Topic Code: `lesson.topic`
  * Real-World Context Narrative: `lesson.realWorldContextVi` & `lesson.realWorldContextEn`
  * Vocabulary Terms & Definitions: `lesson.vocabulary[].term`, `definitionVi`, `definitionEn`
  * Scene Titles & Checkpoints: `lesson.scenes[].titleVi`, `titleEn`, `checkpointVi`, `checkpointEn`
- **Sanitization & Safety (F1.B2, F1.B5)**:
  * User input is sanitized via `String(rawQuery || '').trim().toLowerCase()`.
  * Comparison uses pure string `.includes(cleanQuery)` rather than `new RegExp(...)`, ensuring that regex metacharacters (`.*`, `(`, `)`, `\`, `$`, `^`, `?`) and script tags (`<script>alert(1)</script>`) cannot trigger execution errors or XSS.
  * Special characters are rendered safely using HTML entity encoding (`escapeHtml`).
  * Empty or whitespace-only search string immediately matches 100% of the lessons in the current category without overhead.

### 3.2 Topic Filter
- Supported topic buttons:
  * `all`: "Tất cả chủ đề / All Topics" (Returns all lessons)
  * `trigonometry`: "📐 Hệ thức lượng (Trigonometry)"
  * `quadratic`: "⚡ Hàm số bậc hai (Quadratic)"
  * `optimization`: "📈 Tối ưu hóa (Optimization)"
- Selection isolates matching lessons with exact equality: `lesson.topic === selectedTopic`.
- Inactive topic query (e.g. `'topology'`) yields an empty list without throwing (`F1.B4`).
- Active button is styled with `btn-primary` and `aria-pressed="true"`; inactive buttons use `btn-outline`.

### 3.3 Difficulty Filter & Badges
- Filter options: `all`, `Basic` (Cơ bản), `Medium` (Vận dụng), `Hard` (Vận dụng cao).
- Difficulty Badge display on card:
  * `Basic` / `Cơ bản`: emerald/teal badge
  * `Medium` / `Vận dụng`: blue/indigo badge
  * `Hard` / `Vận dụng cao`: amber/orange badge

### 3.4 Lesson Cards & Dual Verification Badges
Each card displays:
1. **Thumbnail Header**:
   - Points to authentic KHKT figure from `public/assets/khkt/manifest.json`:
     * Lesson 1: `/assets/khkt/image2.png` (Hình 1: Sơ đồ Quy trình 7 bước)
     * Lesson 2: `/assets/khkt/image1.png` (Biểu trưng Dự án KHKT & Cổng Parabol)
     * Lesson 3: `/assets/khkt/image3.png` (Hình 2: Giao diện Video AI bài giảng & Xe buýt)
   - Fallback `onerror` handler automatically reverts to `/assets/khkt/image1.png` if an asset fails to load.
   - Overlay pills indicate `Toán 10 • [Topic]` and `⏱️ [Estimated Minutes]`.
2. **Bilingual Typography**:
   - Prominent Vietnamese Title (`text-lg font-bold text-slate-900 group-hover:text-blue-700`).
   - English Title in italics (`text-xs sm:text-sm font-medium text-slate-500 italic`).
   - Two-line excerpt of real-world context (`text-xs text-slate-600 line-clamp-2`).
3. **Dual-Layer Verification Badges**:
   - Leverages `getPublishGateReport(lesson)` from `src/services/verification.js`.
   - **Math Rigor Passed (Layer 1)**:
     * 5/5 Math criteria passed: `<span class="badge badge-verified-math">✓ Math Rigor Passed (5/5)</span>`
     * Incomplete: `<span class="badge badge-draft">Math Review (${count}/5)</span>`
   - **CLIL English Passed (Layer 2)**:
     * 5/5 English criteria passed: `<span class="badge badge-verified-english">✓ CLIL English Passed (5/5)</span>`
     * Incomplete: `<span class="badge badge-draft">CLIL Review (${count}/5)</span>`
   - **100% KHKT Gold Seal**:
     * Displayed when 10/10 criteria pass and status is `PUBLISHED` or `VERIFIED`:
       `<span class="badge badge-khkt-gold">★ 100% KHKT Verified</span>`
     * Displayed as `Bản nháp / Draft` if unverified.
4. **Action CTA**:
   - "Bắt đầu học / Start Lesson →" button with `data-action="start-lesson"` and `data-lesson-id="${lesson.id}"`.
   - Accessible keyboard trigger (Enter/Space on button).
   - Emits custom DOM event `lesson-select` and calls `onSelectLesson(lesson.id, lesson)`.

---

## 4. Proposed Drop-in Implementation Code

Below is the complete, modular drop-in code for `src/components/CollectionExplorer.js`:

```javascript
/**
 * src/components/CollectionExplorer.js
 * Grade 10 Math Problem Collection Explorer (Feature F1 / Requirement R1)
 *
 * Capabilities:
 * 1. Search input filtering across Vietnamese/English titles, topics, keywords, and context.
 * 2. Topic filter pills (All, Trigonometry, Quadratic, Optimization).
 * 3. Difficulty selector (All, Basic, Medium, Hard).
 * 4. Card grid with authentic KHKT figure media thumbnails and fallback handling.
 * 5. Dual-layer verification badges (Layer 1 Math Rigor, Layer 2 CLIL English, 100% KHKT Gold Seal).
 * 6. "Bắt đầu học / Start Lesson" selection event dispatching.
 *
 * Zero external dependencies — pure ES Module with Tailwind-inspired design tokens.
 */

import { DEFAULT_LESSONS } from '../data/lessons.js';
import { getLessons } from '../services/storage.js';
import { getPublishGateReport } from '../services/verification.js';

/**
 * Escapes unsafe characters for HTML embedding to strictly prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Pure function: Filters a list of lessons by search query, topic, and difficulty.
 * Guaranteed to satisfy Tier 1 (F1.1-F1.5) and Tier 2 boundary cases (F1.B1-F1.B5).
 *
 * @param {Array<Object>} lessons - Array of lesson objects
 * @param {Object} [filters={}] - Filter criteria
 * @param {string} [filters.query=''] - Search term in Vietnamese or English
 * @param {string} [filters.topic='all'] - Topic filter ('all', 'trigonometry', 'quadratic', 'optimization')
 * @param {string} [filters.difficulty='all'] - Difficulty ('all', 'Basic', 'Medium', 'Hard')
 * @returns {Array<Object>} Filtered lesson array
 */
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
      // Map Vietnamese aliases if needed
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

      // Check primary metadata
      const directMatch =
        titleVi.includes(cleanQuery) ||
        titleEn.includes(cleanQuery) ||
        topicTitleVi.includes(cleanQuery) ||
        topicTitleEn.includes(cleanQuery) ||
        topicKey.includes(cleanQuery) ||
        contextVi.includes(cleanQuery) ||
        contextEn.includes(cleanQuery);

      if (directMatch) return true;

      // Check vocabulary items
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

      // Check scene content
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

/**
 * Computes dual-layer verification badge metadata for a lesson.
 * @param {Object} lesson
 * @returns {Object}
 */
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

/**
 * CollectionExplorer Component Class
 */
export class CollectionExplorer {
  /**
   * @param {Object} options
   * @param {HTMLElement|string} [options.container] - Target DOM container or selector
   * @param {Array<Object>} [options.lessons] - Optional pre-loaded lessons list
   * @param {Function} [options.onSelectLesson] - Callback when student clicks "Bắt đầu học"
   * @param {Storage} [options.storageOverride] - Optional custom storage instance
   */
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.container) : null)
      : options.container;

    this.onSelectLesson = options.onSelectLesson || null;
    this.storageOverride = options.storageOverride || null;

    // Load initial lesson catalog
    if (Array.isArray(options.lessons) && options.lessons.length > 0) {
      this.allLessons = options.lessons;
    } else {
      this.reloadLessonsFromStorage();
    }

    // Filter & search state
    this.state = {
      query: '',
      topic: 'all',
      difficulty: 'all',
    };

    // Bind event handlers
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleTopicClick = this.handleTopicClick.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);

    // Initial render if container is provided
    if (this.container) {
      this.render();
    }
  }

  /**
   * Reloads lessons from unified storage service with fallback to DEFAULT_LESSONS.
   */
  reloadLessonsFromStorage() {
    try {
      this.allLessons = getLessons(DEFAULT_LESSONS, this.storageOverride);
    } catch (e) {
      this.allLessons = DEFAULT_LESSONS;
    }
  }

  /**
   * Mounts the component into a container element.
   * @param {HTMLElement|string} container
   */
  mount(container) {
    this.container = typeof container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(container) : null)
      : container;
    this.render();
  }

  /**
   * Updates the lesson catalog and re-renders.
   * @param {Array<Object>} lessons
   */
  setLessons(lessons) {
    if (Array.isArray(lessons)) {
      this.allLessons = lessons;
      this.render();
    }
  }

  /**
   * Programmatically updates search query.
   * @param {string} query
   */
  setSearch(query) {
    this.state.query = query || '';
    this.render();
  }

  /**
   * Programmatically updates topic filter.
   * @param {string} topic
   */
  setTopic(topic) {
    this.state.topic = topic || 'all';
    this.render();
  }

  /**
   * Programmatically updates difficulty filter.
   * @param {string} difficulty
   */
  setDifficulty(difficulty) {
    this.state.difficulty = difficulty || 'all';
    this.render();
  }

  /**
   * Triggers the start lesson action.
   * @param {string} lessonId
   */
  selectLesson(lessonId) {
    const lesson = this.allLessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (typeof this.onSelectLesson === 'function') {
      this.onSelectLesson(lesson.id, lesson);
    }

    // Dispatch DOM CustomEvent
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

  /**
   * Computes the currently filtered lessons list.
   * @returns {Array<Object>}
   */
  getFilteredLessons() {
    return filterLessons(this.allLessons, this.state);
  }

  /**
   * Renders the complete CollectionExplorer markup into the container.
   */
  render() {
    if (!this.container) return;

    const filtered = this.getFilteredLessons();
    const isFiltered = this.state.query !== '' || this.state.topic !== 'all' || this.state.difficulty !== 'all';

    this.container.innerHTML = `
      <section class="collection-explorer space-y-8" aria-label="Bộ sưu tập bài toán thực tế Toán 10">
        <!-- Hero Introduction Banner -->
        <div class="explorer-hero bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-700/60 text-xs font-semibold text-blue-200 mb-3">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Bộ Sưu Tập Bài Toán Thực Tế Lớp 10 (CLIL)
            </h1>
            <p class="text-sm sm:text-base text-blue-200 leading-relaxed mb-4">
              Khám phá và giải quyết các bài toán thực tiễn tích hợp tiếng Anh qua quy trình học 5 phân cảnh chuẩn hóa, bảng từ vựng tương tác có phát âm Web Speech API và hệ thống kiểm chứng 2 lớp độc lập.
            </p>
            <div class="flex flex-wrap items-center gap-2.5 text-xs text-blue-200">
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
          </div>
        </div>

        <!-- Controls Toolbar: Search & Filters -->
        <div class="explorer-toolbar bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <!-- Search Row -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              ` : ''}
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-600">
              <span class="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                Hiển thị <strong class="text-blue-700">${filtered.length}</strong> / ${this.allLessons.length} bài học
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

          <!-- Filter Pills Row -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <!-- Topic Filter Buttons -->
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

            <!-- Difficulty Filter -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Độ khó:</span>
              <select
                id="difficulty-select"
                class="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label="Lọc theo độ khó"
              >
                <option value="all" ${this.state.difficulty === 'all' ? 'selected' : ''}>Tất cả độ khó (All)</option>
                <option value="Basic" ${this.state.difficulty === 'Basic' ? 'selected' : ''}>Cơ bản (Basic)</option>
                <option value="Medium" ${this.state.difficulty === 'Medium' ? 'selected' : ''}>Vận dụng (Medium)</option>
                <option value="Hard" ${this.state.difficulty === 'Hard' ? 'selected' : ''}>Vận dụng cao (Hard)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Cards Grid Container -->
        <div id="lesson-cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.length > 0
            ? filtered.map(lesson => this.renderCardHtml(lesson)).join('')
            : this.renderEmptyStateHtml()}
        </div>
      </section>
    `;

    this.bindEvents();
  }

  /**
   * Renders the HTML markup for an individual lesson card.
   * @param {Object} lesson
   * @returns {string}
   */
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
        <!-- Media Header with authentic KHKT figure -->
        <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src="${escapeHtml(thumbnailSrc)}"
            alt="${escapeHtml(lesson.titleVi)}"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onerror="this.onerror=null; this.src='/assets/khkt/image1.png';"
          />
          <!-- Top Badges Overlay -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-900/90 text-white backdrop-blur-sm shadow-sm">
              Toán 10 • ${escapeHtml(badges.topicLabelVi)}
            </span>
          </div>
          <div class="absolute top-3 right-3">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${badges.difficultyBadge.class} backdrop-blur-sm shadow-sm">
              ${escapeHtml(badges.difficultyBadge.text)}
            </span>
          </div>
          <div class="absolute bottom-2 right-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm">
              ⏱️ ${estMin} phút
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <!-- Bilingual Titles -->
            <h3 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
              ${escapeHtml(lesson.titleVi)}
            </h3>
            <h4 class="text-xs sm:text-sm font-medium text-slate-500 italic mt-1 leading-normal">
              ${escapeHtml(lesson.titleEn)}
            </h4>

            <!-- Real-World Context Excerpt -->
            <p class="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
              ${escapeHtml(lesson.realWorldContextVi || lesson.scenes?.[0]?.contentVi || '')}
            </p>
          </div>

          <!-- Dual-Layer Verification Badges -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Kiểm chứng KHKT 2 lớp:
            </div>
            <div class="flex flex-wrap items-center gap-1.5">
              <!-- Math Rigor Badge -->
              <span class="${badges.mathBadge.class}" title="${escapeHtml(badges.mathBadge.title)}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                ${escapeHtml(badges.mathBadge.text)}
              </span>

              <!-- CLIL English Badge -->
              <span class="${badges.englishBadge.class}" title="${escapeHtml(badges.englishBadge.title)}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                ${escapeHtml(badges.englishBadge.text)}
              </span>

              <!-- KHKT Gold Seal -->
              <span class="${badges.khktBadge.class}" title="${escapeHtml(badges.khktBadge.title)}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                ${escapeHtml(badges.khktBadge.text)}
              </span>
            </div>
          </div>
        </div>

        <!-- Card Footer Action -->
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
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Renders the empty state when no lessons match filters.
   * @returns {string}
   */
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

  /**
   * Binds interactive DOM events.
   */
  bindEvents() {
    if (!this.container) return;

    // Search input event
    const searchInput = this.container.querySelector('#lesson-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearchInput);
    }

    // Clear search button
    const clearBtn = this.container.querySelector('#clear-search-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.state.query = '';
        this.render();
      });
    }

    // Reset all filters button
    const resetBtn = this.container.querySelector('#reset-all-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', this.handleResetFilters);
    }

    // Empty state reset button
    const emptyResetBtn = this.container.querySelector('#empty-reset-btn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', this.handleResetFilters);
    }

    // Topic buttons
    const topicButtons = this.container.querySelectorAll('.topic-btn');
    topicButtons.forEach(btn => {
      btn.addEventListener('click', this.handleTopicClick);
    });

    // Difficulty selector
    const diffSelect = this.container.querySelector('#difficulty-select');
    if (diffSelect) {
      diffSelect.addEventListener('change', this.handleDifficultyChange);
    }

    // Card click & start-lesson button click delegation
    const cardsContainer = this.container.querySelector('#lesson-cards-container');
    if (cardsContainer) {
      cardsContainer.addEventListener('click', this.handleCardClick);
    }
  }

  handleSearchInput(e) {
    this.state.query = e.target.value;
    // Re-render only cards container and count to preserve input focus
    this.updateCardsGrid();
  }

  handleTopicClick(e) {
    const btn = e.target.closest('.topic-btn');
    if (!btn) return;
    const topic = btn.dataset.topic || 'all';
    this.state.topic = topic;
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

  /**
   * Lightweight updater for smooth typing without losing search input focus.
   */
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

    // Re-bind empty reset button if rendered
    const emptyResetBtn = this.container.querySelector('#empty-reset-btn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', this.handleResetFilters);
    }

    // Update count indicator
    const countEl = this.container.querySelector('#filtered-count');
    if (countEl) {
      countEl.textContent = String(filtered.length);
    }

    // Toggle clear search button visibility
    const clearBtn = this.container.querySelector('#clear-search-btn');
    if (clearBtn) {
      if (this.state.query) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
  }

  /**
   * Cleans up event listeners and DOM elements.
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}

export default CollectionExplorer;
```

---

## 5. Integration Plan with `src/app.js`

In `src/app.js`, the main application router manages the active view (`'explorer'`, `'player'`, `'studio'`, `'showcase'`).
The integration is minimal and decoupled:

```javascript
// Example integration inside src/app.js:
import { CollectionExplorer } from './components/CollectionExplorer.js';
import { getLessons } from './services/storage.js';

let activeExplorer = null;

export function renderExplorerView(mainContentElement) {
  if (activeExplorer) {
    activeExplorer.destroy();
  }

  activeExplorer = new CollectionExplorer({
    container: mainContentElement,
    onSelectLesson: (lessonId, lesson) => {
      // Transition to 5-Scene Multimedia Player
      navigateTo('player', { lessonId });
    }
  });

  // Also listen for container DOM event
  mainContentElement.addEventListener('lesson-select', (event) => {
    const { lessonId } = event.detail;
    navigateTo('player', { lessonId });
  }, { once: true });
}
```

---

## 6. Verification Against Acceptance Criteria & Test Suites

| Requirement / Test Case | Criteria | Verification Assessment |
|---|---|---|
| **F1.1** | Default collection >= 3 Grade 10 lessons | `DEFAULT_LESSONS` contains 3 Grade 10 lessons; loaded by default. |
| **F1.2** | 3 core topics: trigonometry, quadratic, optimization | All 3 topics represented in filter pills and datasets. |
| **F1.3** | Search matches VI/EN titles & keywords | Case-insensitive multi-attribute search across VI/EN titles, topics, vocabulary, and scene text. |
| **F1.4** | Topic filtering isolates matches | Strict topic matching prevents any leakage between topics. |
| **F1.5** | Difficulty ratings & dual-verification badges | Math Rigor (Layer 1), CLIL English (Layer 2), and 100% KHKT Gold Seal displayed on each card. |
| **F1.B1** | Empty search returns full catalog | `cleanQuery === ''` returns all lessons. |
| **F1.B2** | Special chars / regex / XSS safety | Safe string matching using `.includes()` + `escapeHtml()`. |
| **F1.B3** | Zero matches returns empty array | Displays friendly empty state illustration and reset button without throwing. |
| **F1.B4** | Non-existent topic returns empty array | Strictly filtered; zero results handled safely. |
| **F1.B5** | Search query whitespace trimmed | `cleanQuery = String(rawQuery).trim().toLowerCase()`. |
| **Pair 1 (F1 + F3)** | Explorer card selection triggers 5-Scene player | Dispatches `lesson-select` event and invokes `onSelectLesson`. |
| **Pair 7** | Custom published lessons appear in Explorer | Loads lessons from `storage.getLessons()`, merging custom published lessons. |
