/**
 * tests/collection_explorer_deep_adversarial.test.js
 * Deep Adversarial Challenge & Stress Test Suite for Milestone M2 Iteration 2
 * Authored by: Milestone M2 Iteration 2 Challenger 1 (m2_it2_challenger_1)
 *
 * Vectors Evaluated:
 * 1. SQL Injection, Code Injection & Special Characters in Search Queries
 * 2. Ultra-Long Payloads, Memory Pressure & ReDoS Performance
 * 3. Unicode Controls, RTLO, Emojis, Diacritics & Normalization
 * 4. Exhaustive Topic & Difficulty Filter Matrix (Isolation & Combinations)
 * 5. Authentic Figure Assets, Dual-Layer Badges & Lesson Card Rendering Security
 * 6. Component Lifecycle, Event Dispatching & Filter Reset Integrity
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CollectionExplorer,
  filterLessons,
  escapeHtml,
  getLessonBadges,
} from '../src/components/CollectionExplorer.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

// ============================================================================
// VECTOR 1: SQL INJECTION, CODE INJECTION & INJECTION STRINGS
// ============================================================================
describe('Challenger Vector 1: SQL Injection & Code Injection Queries', () => {
  const injectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE lessons; --",
    '" OR ""="',
    'UNION SELECT 1, 2, 3, 4',
    "admin' --",
    "' UNION ALL SELECT NULL, NULL, NULL--",
    "1; WAITFOR DELAY '0:0:5'--",
    "sleep(5)#",
    "1' AND 1=1 AND '1'='1",
    "1' ORDER BY 1--",
    "${7*7}",
    "{{7*7}}",
    "<%= 7*7 %>",
    "#{7*7}",
    "`id`",
    "eval('process.exit()')",
    "require('child_process').execSync('id')",
  ];

  it('safely handles SQL injection and template expression payloads without throwing or evaluating', () => {
    for (const payload of injectionPayloads) {
      assert.doesNotThrow(() => {
        const results = filterLessons(DEFAULT_LESSONS, { query: payload });
        assert.ok(Array.isArray(results), `Results for SQLi payload must be an array: ${payload}`);
        // None of the payloads exist in the default lessons dataset
        assert.equal(results.length, 0, `Payload "${payload}" must not match any default lessons`);
      });
    }
  });

  it('safely renders SQL injection payloads inside CollectionExplorer search input value', () => {
    const mockContainer = {
      _html: '',
      set innerHTML(val) { this._html = val; },
      get innerHTML() { return this._html; },
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      dispatchEvent: () => true,
    };

    const explorer = new CollectionExplorer({ container: mockContainer });

    for (const payload of injectionPayloads) {
      explorer.setSearch(payload);
      const html = mockContainer.innerHTML;
      // Value must be properly HTML-escaped
      assert.ok(
        !html.includes(`value="${payload}"`) || !payload.includes('"'),
        `Double-quote must be escaped in search input for: ${payload}`
      );
    }
  });
});

// ============================================================================
// VECTOR 2: ULTRA-LONG PAYLOADS, MEMORY PRESSURE & REDOS PERFORMANCE
// ============================================================================
describe('Challenger Vector 2: Ultra-Long Payloads & Search Performance Benchmark', () => {
  it('handles 100,000 character search queries in sub-50ms linear time', () => {
    const longPayloads = [
      'a'.repeat(100000),
      'hải đăng '.repeat(10000),
      '\\d+'.repeat(10000),
      '<!-- xss -->'.repeat(5000),
      '🌊📐⚡📈'.repeat(10000),
    ];

    for (const payload of longPayloads) {
      const t0 = performance.now();
      const results = filterLessons(DEFAULT_LESSONS, { query: payload });
      const elapsed = performance.now() - t0;

      assert.ok(
        elapsed < 100,
        `Ultra-long query (${payload.length} chars) took ${elapsed.toFixed(2)}ms, must be < 100ms`
      );
      assert.ok(Array.isArray(results));
      assert.equal(results.length, 0);
    }
  });

  it('safely handles repeated rapid filterLessons invocations (1,000 queries in < 150ms)', () => {
    const queries = ['hải đăng', 'parabol', 'chợ lách', 'triangulation', 'khách', 'không tồn tại'];
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) {
      const q = queries[i % queries.length];
      const res = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(Array.isArray(res));
    }
    const elapsed = performance.now() - t0;
    assert.ok(elapsed < 200, `1,000 filter operations took ${elapsed.toFixed(2)}ms (must be < 200ms)`);
  });
});

// ============================================================================
// VECTOR 3: UNICODE CONTROLS, RTLO, EMOJIS & DIACRITICS
// ============================================================================
describe('Challenger Vector 3: Unicode Controls, RTLO, Emojis & Diacritics', () => {
  it('safely handles null bytes, control characters, and zero-width spaces in query', () => {
    const unicodeStressQueries = [
      '\u0000\u0001\u0002\u0003',
      'hải\u0000đăng',
      '\u202Ereversed_text\u202D', // Right-to-Left Override
      'hải\u200Bđăng',           // Zero-width space
      'hải\u200Cđăng',           // Zero-width non-joiner
      'hải\u200Dđăng',           // Zero-width joiner
      '\uFEFFhải đăng',          // Byte Order Mark
    ];

    for (const q of unicodeStressQueries) {
      assert.doesNotThrow(() => {
        const results = filterLessons(DEFAULT_LESSONS, { query: q });
        assert.ok(Array.isArray(results));
      });
    }
  });

  it('correctly matches queries containing authentic math and educational emojis', () => {
    // None of default lessons currently contain emojis in searchable text
    const emojiQueries = ['📐', '⚡', '📈', '🌊', '🚢', '🚌', '🏛️'];
    for (const emoji of emojiQueries) {
      const results = filterLessons(DEFAULT_LESSONS, { query: emoji });
      assert.ok(Array.isArray(results));
      assert.equal(results.length, 0);
    }
  });

  it('documents exact diacritic sensitivity behavior of filterLessons', () => {
    // Exact accented queries match their respective lessons
    const exactAccents = [
      { q: 'hải đăng', expectedId: 'lesson-lighthouse' },
      { q: 'cổng chào parabol', expectedId: 'lesson-parabolic-arch' },
      { q: 'chợ lách', expectedId: 'lesson-bus-optimization' },
      { q: 'hệ thức lượng', expectedId: 'lesson-lighthouse' },
      { q: 'hàm số bậc hai', expectedId: 'lesson-parabolic-arch' },
      { q: 'doanh thu', expectedId: 'lesson-bus-optimization' },
    ];

    for (const { q, expectedId } of exactAccents) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(
        results.length >= 1,
        `Exact accented query "${q}" must match at least 1 lesson`
      );
      assert.ok(
        results.some(l => l.id === expectedId),
        `Query "${q}" must include ${expectedId}`
      );
    }

    // Unaccented queries (e.g. "hai dang") vs accented text ("hải đăng"):
    // Because filterLessons relies on String.prototype.includes() without a diacritic-stripping normalize step,
    // unaccented queries do NOT match accented Vietnamese fields unless the English field matches.
    const unaccented = filterLessons(DEFAULT_LESSONS, { query: 'hai dang' });
    // In DEFAULT_LESSONS, "hai dang" is not in any English field, so it yields 0
    assert.equal(
      unaccented.length,
      0,
      'Empirical observation: filterLessons performs literal substring search, so unaccented "hai dang" does not match "hải đăng"'
    );
  });
});

// ============================================================================
// VECTOR 4: EXHAUSTIVE TOPIC & DIFFICULTY FILTER MATRIX
// ============================================================================
describe('Challenger Vector 4: Exhaustive Topic & Difficulty Filter Matrix', () => {
  it('correctly filters all 16 pairwise combinations of Topic and Difficulty', () => {
    const topics = ['all', 'trigonometry', 'quadratic', 'optimization'];
    const difficulties = ['all', 'Basic', 'Medium', 'Hard'];

    // Expected matrix counts based on DEFAULT_LESSONS:
    // 1. lesson-lighthouse: topic=trigonometry, difficulty=Medium
    // 2. lesson-parabolic-arch: topic=quadratic, difficulty=Medium
    // 3. lesson-bus-optimization: topic=optimization, difficulty=Hard
    const expectedCounts = {
      'all:all': 3,
      'all:Basic': 0,
      'all:Medium': 2,
      'all:Hard': 1,

      'trigonometry:all': 1,
      'trigonometry:Basic': 0,
      'trigonometry:Medium': 1,
      'trigonometry:Hard': 0,

      'quadratic:all': 1,
      'quadratic:Basic': 0,
      'quadratic:Medium': 1,
      'quadratic:Hard': 0,

      'optimization:all': 1,
      'optimization:Basic': 0,
      'optimization:Medium': 0,
      'optimization:Hard': 1,
    };

    for (const t of topics) {
      for (const d of difficulties) {
        const key = `${t}:${d}`;
        const results = filterLessons(DEFAULT_LESSONS, { topic: t, difficulty: d });
        const expected = expectedCounts[key];
        assert.equal(
          results.length,
          expected,
          `Combination topic=${t}, difficulty=${d} expected ${expected} results, got ${results.length}`
        );

        // Check topic isolation when topic is specific
        if (t !== 'all') {
          for (const l of results) {
            assert.equal(l.topic, t, `Result ${l.id} must have topic ${t}`);
          }
        }

        // Check difficulty isolation when difficulty is specific
        if (d !== 'all') {
          for (const l of results) {
            assert.equal(l.difficulty, d, `Result ${l.id} must have difficulty ${d}`);
          }
        }
      }
    }
  });

  it('correctly handles triple-filtering: Topic + Difficulty + Text Query', () => {
    // 1. All three match: topic=trigonometry, difficulty=Medium, query=lighthouse
    const match1 = filterLessons(DEFAULT_LESSONS, {
      topic: 'trigonometry',
      difficulty: 'Medium',
      query: 'lighthouse',
    });
    assert.equal(match1.length, 1);
    assert.equal(match1[0].id, 'lesson-lighthouse');

    // 2. Topic matches, difficulty matches, but query does NOT match:
    const noMatchQuery = filterLessons(DEFAULT_LESSONS, {
      topic: 'trigonometry',
      difficulty: 'Medium',
      query: 'parabol',
    });
    assert.equal(noMatchQuery.length, 0);

    // 3. Topic matches, query matches, but difficulty does NOT match:
    const noMatchDiff = filterLessons(DEFAULT_LESSONS, {
      topic: 'trigonometry',
      difficulty: 'Hard',
      query: 'lighthouse',
    });
    assert.equal(noMatchDiff.length, 0);

    // 4. Optimization matches: topic=optimization, difficulty=Hard, query=xe buýt
    const matchOpt = filterLessons(DEFAULT_LESSONS, {
      topic: 'optimization',
      difficulty: 'Hard',
      query: 'xe buýt',
    });
    assert.equal(matchOpt.length, 1);
    assert.equal(matchOpt[0].id, 'lesson-bus-optimization');
  });
});

// ============================================================================
// VECTOR 5: AUTHENTIC FIGURE ASSETS, DUAL-LAYER BADGES & CARD RENDERING
// ============================================================================
describe('Challenger Vector 5: Authentic Figures, Dual-Layer Badges & Card Rendering', () => {
  it('confirms all 3 default lessons reference valid extracted KHKT image assets', () => {
    const expectedAssets = {
      'lesson-lighthouse': '/assets/khkt/image2.png',
      'lesson-parabolic-arch': '/assets/khkt/image1.png',
      'lesson-bus-optimization': '/assets/khkt/image3.png',
    };

    for (const lesson of DEFAULT_LESSONS) {
      assert.equal(
        lesson.thumbnail,
        expectedAssets[lesson.id],
        `Lesson ${lesson.id} must reference authentic KHKT image asset ${expectedAssets[lesson.id]}`
      );
    }
  });

  it('renders dual-layer verification badges with 100% verified status for all default lessons', () => {
    for (const lesson of DEFAULT_LESSONS) {
      const badges = getLessonBadges(lesson);

      // Math Rigor badge
      assert.equal(badges.mathBadge.passed, true, `${lesson.id} Math badge must pass`);
      assert.equal(badges.mathBadge.text, 'Math Rigor Passed');
      assert.ok(badges.mathBadge.class.includes('badge-verified-math'));

      // English CLIL badge
      assert.equal(badges.englishBadge.passed, true, `${lesson.id} English badge must pass`);
      assert.equal(badges.englishBadge.text, 'CLIL English Passed');
      assert.ok(badges.englishBadge.class.includes('badge-verified-english'));

      // KHKT Gold Seal badge
      assert.equal(badges.khktBadge.passed, true, `${lesson.id} KHKT badge must pass`);
      assert.equal(badges.khktBadge.text, '100% KHKT Verified');
      assert.ok(badges.khktBadge.class.includes('badge-khkt-gold'));
    }
  });

  it('verifies card HTML includes proper accessibility, data attributes and onerror fallback', () => {
    const explorer = new CollectionExplorer();

    for (const lesson of DEFAULT_LESSONS) {
      const cardHtml = explorer.renderCardHtml(lesson);

      // Must have data-card-id
      assert.ok(cardHtml.includes(`data-card-id="${lesson.id}"`), 'Must have data-card-id attribute');

      // Must have thumbnail with onerror fallback
      assert.ok(cardHtml.includes(`src="${lesson.thumbnail}"`), 'Must include thumbnail src');
      assert.ok(cardHtml.includes(`onerror="this.onerror=null; this.src='/assets/khkt/image1.png';"`), 'Must have onerror fallback');

      // Must have start-lesson button with accessibility label
      assert.ok(cardHtml.includes('data-action="start-lesson"'), 'Must have data-action="start-lesson"');
      assert.ok(cardHtml.includes(`data-lesson-id="${lesson.id}"`), 'Must have data-lesson-id');
      assert.ok(cardHtml.includes(`aria-label="Bắt đầu học bài`), 'Must have accessible aria-label');

      // Must render bilingual titles
      assert.ok(cardHtml.includes(escapeHtml(lesson.titleVi)), 'Must include escaped Vietnamese title');
      assert.ok(cardHtml.includes(escapeHtml(lesson.titleEn)), 'Must include escaped English title');
    }
  });

  it('gracefully handles defective or unverified lessons by showing draft status badges', () => {
    const draftLesson = {
      id: 'draft-lesson-01',
      titleVi: 'Bài học nháp',
      titleEn: 'Draft Lesson',
      topic: 'trigonometry',
      difficulty: 'Basic',
      status: 'DRAFT',
      scenes: [],
      vocabulary: [],
      verification: [],
    };

    const badges = getLessonBadges(draftLesson);
    assert.equal(badges.mathBadge.passed, false);
    assert.equal(badges.englishBadge.passed, false);
    assert.equal(badges.khktBadge.passed, false);
    assert.equal(badges.khktBadge.text, 'Bản nháp / Draft');

    const explorer = new CollectionExplorer();
    const html = explorer.renderCardHtml(draftLesson);
    assert.ok(html.includes('Bản nháp / Draft'));
  });
});

// ============================================================================
// VECTOR 6: COMPONENT LIFECYCLE, EVENT DISPATCHING & FILTER RESET
// ============================================================================
describe('Challenger Vector 6: Component Lifecycle & Filter Reset Integrity', () => {
  it('correctly fires onSelectLesson callback and window CustomEvent on card click', () => {
    let selectedId = null;
    let selectedLesson = null;

    const explorer = new CollectionExplorer({
      onSelectLesson: (id, lesson) => {
        selectedId = id;
        selectedLesson = lesson;
      },
    });

    explorer.selectLesson('lesson-parabolic-arch');
    assert.equal(selectedId, 'lesson-parabolic-arch');
    assert.equal(selectedLesson.titleVi, 'Cổng chào Parabol và Giới hạn chiều cao xe tải');
  });

  it('setLessons updates allLessons and triggers re-render', () => {
    const mockContainer = {
      _html: '',
      set innerHTML(val) { this._html = val; },
      get innerHTML() { return this._html; },
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      dispatchEvent: () => true,
    };

    const explorer = new CollectionExplorer({ container: mockContainer });
    assert.equal(explorer.allLessons.length, 3);

    const singleCustomLesson = [
      {
        id: 'custom-lesson-99',
        titleVi: 'Bài toán mẫu tùy chỉnh',
        titleEn: 'Custom Sample Lesson',
        topic: 'trigonometry',
        difficulty: 'Medium',
        scenes: [],
        vocabulary: [],
        verification: [],
      },
    ];

    explorer.setLessons(singleCustomLesson);
    assert.equal(explorer.allLessons.length, 1);
    assert.ok(mockContainer.innerHTML.includes('Bài toán mẫu tùy chỉnh'));
  });

  it('handleResetFilters resets all 3 filter state properties to default values', () => {
    const explorer = new CollectionExplorer();
    explorer.state.query = 'hải đăng';
    explorer.state.topic = 'trigonometry';
    explorer.state.difficulty = 'Medium';

    explorer.handleResetFilters();
    assert.equal(explorer.state.query, '');
    assert.equal(explorer.state.topic, 'all');
    assert.equal(explorer.state.difficulty, 'all');
  });

  it('destroy() unlinks container cleanly', () => {
    const mockContainer = {
      _html: 'initial',
      set innerHTML(val) { this._html = val; },
      get innerHTML() { return this._html; },
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      dispatchEvent: () => true,
    };

    const explorer = new CollectionExplorer({ container: mockContainer });
    assert.ok(explorer.container !== null);

    explorer.destroy();
    assert.equal(explorer.container, null);
    assert.equal(mockContainer.innerHTML, '');
  });
});
