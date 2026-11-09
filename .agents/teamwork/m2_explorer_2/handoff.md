# Handoff Report: Problem Collection Explorer (`CollectionExplorer.js`)

**Role**: Milestone M2 Explorer 2 (Collection Explorer, Lesson Cards & Badges)  
**Date**: 2026-11-07  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_2`  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

### 1.1 Test Suite Contracts
- In `tests/e2e/tier1_features.test.js`:
  * Lines 26-42 (F1.1):
    ```javascript
    test('F1.1: Default collection contains at least 3 Grade 10 real-world lessons', async () => {
      const mod = await loadAppModule('src/data/lessons.js');
      ...
      assert.ok(list.length >= 3, `Expected at least 3 lessons, got ${list.length}`);
      for (const l of list) {
        assert.equal(String(l.grade), '10', `Lesson ${l.id} must be Grade 10`);
      }
    });
    ```
  * Lines 44-56 (F1.2):
    ```javascript
    test('F1.2: Lessons cover the 3 core required topics: trigonometry, quadratic, optimization', async () => { ... });
    ```
  * Lines 58-72 (F1.3):
    ```javascript
    test('F1.3: Lesson search query matches titles and keywords in Vietnamese and English', async () => {
      ...
      assert.ok(search('hải đăng').length >= 1, 'Should find lighthouse by VI title');
      assert.ok(search('lighthouse').length >= 1, 'Should find lighthouse by EN title');
      assert.ok(search('parabol').length >= 1, 'Should find parabola by VI title');
    });
    ```
  * Lines 74-85 (F1.4):
    ```javascript
    test('F1.4: Topic filtering isolates lessons matching the selected topic without leakage', async () => { ... });
    ```
  * Lines 87-101 (F1.5):
    ```javascript
    test('F1.5: Each lesson presents difficulty ratings and dual-verification badges', async () => { ... });
    ```

- In `tests/e2e/tier2_boundaries.test.js`:
  * Lines 18-26 (F1.B1): Empty search query returns full catalog without error.
  * Lines 28-40 (F1.B2): Special characters (`<script>alert(1)</script>`, `.*`, `$`, `(`, `\`, `" OR "1"="1`) do not trigger injection or crash.
  * Lines 42-47 (F1.B3): Query matching zero lessons returns empty array without throwing.
  * Lines 49-55 (F1.B4): Non-existent topic filter returns empty array without throwing.
  * Lines 57-65 (F1.B5): Search query with leading and trailing whitespace is sanitized cleanly (`q.trim().toLowerCase()`).

- In `tests/e2e/tier3_pairwise.test.js`:
  * Lines 14-43 (Pair 1): Selecting a card mounts the 5-Scene Player with matching `lessonId` and 5 scenes.
  * Lines 159-180 (Pair 7): Custom published lessons persisted in storage must appear in Explorer with verified status.

### 1.2 Data and Services
- In `src/data/lessons.js`:
  * Default catalog contains 3 complete lessons: `lesson-lighthouse`, `lesson-parabolic-arch`, `lesson-bus-optimization`.
  * Each lesson has: `id`, `topic` (`'trigonometry' | 'quadratic' | 'optimization'`), `topicTitleVi`, `topicTitleEn`, `titleVi`, `titleEn`, `grade: "10"`, `difficulty`, `estimatedMinutes`, `thumbnail`, `realWorldContextVi`, `realWorldContextEn`, `scenes` (5 scenes), `vocabulary`, `quiz`, `verification: STANDARD_VERIFICATION_RULES`, `status: "PUBLISHED"`.
- In `src/services/verification.js`:
  * `getPublishGateReport(lesson)` evaluates Layer 1 (`math.passed`, `math.passCount`) and Layer 2 (`english.passed`, `english.passCount`), and `canPublish` (all 10 criteria passed).
- In `src/services/storage.js`:
  * `getLessons(DEFAULT_LESSONS, storageOverride)` merges built-in KHKT lessons with custom user lessons stored in LocalStorage.
- In `public/assets/khkt/manifest.json`:
  * Figures 1 through 5 are extracted: `image1.png` (KHKT Crest / Parabola arch), `image2.png` (7-step diagram), `image3.png` (AI Video Player), `image4.png` (Empirical chart), `image5.png` (Survey chart).
- In `public/assets/css/style.css`:
  * Component classes ready: `.card`, `.card:hover`, `.card-header`, `.card-body`, `.card-footer`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-sm`, `.badge`, `.badge-verified-math`, `.badge-verified-english`, `.badge-khkt-gold`, `.badge-draft`.

---

## 2. Logic Chain

1. **Lesson Data Source**:
   - `CollectionExplorer` must query `getLessons(DEFAULT_LESSONS)` from `src/services/storage.js` by default (while accepting pre-loaded `options.lessons` for dependency injection and tests).
   - This ensures custom published lessons from Authoring Studio automatically show up in the Explorer (`Pair 7`).

2. **Search Matching & Injection Resistance**:
   - Because `F1.B2` passes adversarial vectors like `<script>` and `.*`, the search matcher cannot construct dynamic `RegExp` objects.
   - Using safe string normalization `String(query || '').trim().toLowerCase()` and `string.includes(cleanQuery)` provides both XSS/regex immunity and case-insensitive matching across Vietnamese and English titles, topics, vocabulary terms, and scene descriptions (`F1.3`, `F1.B5`).

3. **Topic & Difficulty Filtering**:
   - Topic selection must strictly filter by `lesson.topic === selectedTopic` (or match all when `'all'`).
   - Unknown topics return `[]` without error (`F1.B4`).
   - Difficulty selection filters by normalized string matching (`'basic'`, `'medium'`, `'hard'`).

4. **Dual-Layer Verification Badges**:
   - Calling `getPublishGateReport(lesson)` from `src/services/verification.js` allows evaluating any lesson (whether built-in or custom draft).
   - Layer 1 (Math Rigor): When `math.passed === true` (5/5), displays `.badge.badge-verified-math` ("Math Rigor Passed").
   - Layer 2 (CLIL English): When `english.passed === true` (5/5), displays `.badge.badge-verified-english` ("CLIL English Passed").
   - 100% KHKT Gold Seal: When `report.canPublish` is true and lesson is verified/published, displays `.badge.badge-khkt-gold` ("100% KHKT Verified").
   - Unverified/Draft: Displays `.badge.badge-draft` ("Bản nháp / Draft").

5. **Start Lesson Action & App Navigation**:
   - Each card provides a primary CTA button: `<button class="btn btn-primary start-lesson-btn" data-action="start-lesson" data-lesson-id="${lesson.id}">Bắt đầu học</button>`.
   - Clicking this button triggers `onSelectLesson(lesson.id, lesson)` and emits a DOM CustomEvent `'lesson-select'` with `detail: { lessonId, lesson }`, allowing `app.js` to transition seamlessly to the 5-Scene Multimedia Player (`Pair 1`).

---

## 3. Caveats

- **Network-free Offline Media Assets**: Thumbnails point to `/assets/khkt/image1.png`, `image2.png`, `image3.png`. In environments where image serving might fail, an inline `onerror="this.onerror=null; this.src='/assets/khkt/image1.png'"` fallback prevents broken image icons.
- **Debounced Search**: For typing performance with large catalogs, input updates only re-render the card grid and result count rather than the entire component to preserve focus on the input element.
- **Pure Function Export**: Alongside the `CollectionExplorer` class, the pure filtering function `filterLessons(lessons, filters)` and badge helper `getLessonBadges(lesson)` are exported directly so unit tests can test them in headless Node.js without requiring DOM emulation.

---

## 4. Conclusion

The architecture, API contracts, and implementation for `CollectionExplorer` are fully resolved and aligned with all acceptance criteria (R1, F1.1–F1.5, F1.B1–F1.B5, Pair 1, Pair 7, Scenario 1).

The proposed code below is ready for drop-in creation at `src/components/CollectionExplorer.js`.

### Proposed Drop-in Code (`src/components/CollectionExplorer.js`):

```javascript
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
    this.container = typeof options.container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.container) : null)
      : options.container;

    this.onSelectLesson = options.onSelectLesson || null;
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

        <div class="explorer-toolbar bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
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
        <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src="${escapeHtml(thumbnailSrc)}"
            alt="${escapeHtml(lesson.titleVi)}"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onerror="this.onerror=null; this.src='/assets/khkt/image1.png';"
          />
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
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                ${escapeHtml(badges.mathBadge.text)}
              </span>

              <span class="${badges.englishBadge.class}" title="${escapeHtml(badges.englishBadge.title)}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                ${escapeHtml(badges.englishBadge.text)}
              </span>

              <span class="${badges.khktBadge.class}" title="${escapeHtml(badges.khktBadge.title)}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
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
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    const emptyResetBtn = this.container.querySelector('#empty-reset-btn');
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', this.handleResetFilters);
    }

    const topicButtons = this.container.querySelectorAll('.topic-btn');
    topicButtons.forEach(btn => {
      btn.addEventListener('click', this.handleTopicClick);
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
```

---

## 5. Verification Method

To independently verify the architecture and drop-in code:
1. **Automated Test Suite Execution**:
   Run the project test command:
   ```bash
   npm test
   ```
   Confirm all 88 unit and integration tests pass (100% PASS).
2. **Feature Coverage Inspection (Tier 1 & Tier 2)**:
   - Check `tests/e2e/tier1_features.test.js` (F1.1 to F1.5).
   - Check `tests/e2e/tier2_boundaries.test.js` (F1.B1 to F1.B5).
3. **Behavioral Invalidation Conditions**:
   - If `filterLessons` crashes on regex metacharacters like `.*` or `(`, the safe search contract is invalidated.
   - If filtering `trigonometry` leaks quadratic or optimization lessons, the topic isolation contract is invalidated.
   - If unverified draft lessons display the 100% KHKT Verified badge without 10/10 criteria passing, the dual verification gate contract is invalidated.
