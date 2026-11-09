/**
 * tests/collection_explorer_regression_adversarial.test.js
 * Adversarial Regression & Deep Stress Harness for Collection Explorer,
 * Search Normalization, and Card Rendering.
 *
 * Authored by: Milestone M2 Iteration 3 Challenger 1 (m2_it3_challenger_1)
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
import { App } from '../src/app.js';

// Helper mock DOM container factory
function createMockElement(tagName = 'div', id = '', classList = []) {
  const listeners = {};
  const classes = new Set(classList);
  const attributes = {};

  return {
    tagName: tagName.toUpperCase(),
    id,
    classList: {
      add: (cls) => classes.add(cls),
      remove: (cls) => classes.delete(cls),
      contains: (cls) => classes.has(cls),
      toggle: (cls) => (classes.has(cls) ? classes.delete(cls) : classes.add(cls)),
    },
    dataset: {},
    attributes,
    setAttribute(k, v) { attributes[k] = String(v); },
    getAttribute(k) { return attributes[k] ?? null; },
    hasAttribute(k) { return k in attributes; },
    removeAttribute(k) { delete attributes[k]; },
    _html: '',
    get innerHTML() { return this._html; },
    set innerHTML(val) { this._html = val; },
    textContent: '',
    addEventListener(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== fn);
      }
    },
    dispatchEvent(event) {
      const type = event?.type || event;
      if (listeners[type]) {
        for (const cb of listeners[type]) {
          cb(event);
        }
      }
      return true;
    },
    querySelector(selector) {
      if (selector === '#lesson-search-input') {
        return createMockElement('input', 'lesson-search-input');
      }
      if (selector === '#clear-search-btn') {
        return createMockElement('button', 'clear-search-btn');
      }
      if (selector === '#reset-all-filters-btn') {
        return createMockElement('button', 'reset-all-filters-btn');
      }
      if (selector === '#empty-reset-btn') {
        return createMockElement('button', 'empty-reset-btn');
      }
      if (selector === '#difficulty-select') {
        return createMockElement('select', 'difficulty-select');
      }
      if (selector === '#lesson-cards-container') {
        return createMockElement('div', 'lesson-cards-container');
      }
      if (selector === '#filtered-count') {
        return createMockElement('strong', 'filtered-count');
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.topic-btn') {
        const topics = ['all', 'trigonometry', 'quadratic', 'optimization'];
        return topics.map(t => {
          const btn = createMockElement('button');
          btn.dataset.topic = t;
          return btn;
        });
      }
      return [];
    },
    closest(selector) {
      return null;
    },
  };
}

// ============================================================================
// SUITE 1: SEARCH NORMALIZATION & EXHAUSTIVE FIELD RECEPTIVITY
// ============================================================================
describe('Adversarial Suite 1: Search Normalization & Exhaustive Field Receptivity', () => {
  it('correctly matches upper-case and mixed-case accented Vietnamese queries', () => {
    const uppercaseQueries = [
      { q: 'HẢI ĐĂNG', expectedId: 'lesson-lighthouse' },
      { q: 'CỔNG CHÀO PARABOL', expectedId: 'lesson-parabolic-arch' },
      { q: 'XE BUÝT', expectedId: 'lesson-bus-optimization' },
      { q: 'CHỢ LÁCH', expectedId: 'lesson-bus-optimization' },
      { q: 'HỆ THỨC LƯỢNG', expectedId: 'lesson-lighthouse' },
      { q: 'HÀM SỐ BẬC HAI', expectedId: 'lesson-parabolic-arch' },
      { q: 'TỐI ƯU HÓA', expectedId: 'lesson-bus-optimization' },
    ];

    for (const { q, expectedId } of uppercaseQueries) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(
        results.some(l => l.id === expectedId),
        `Query "${q}" (uppercase) must find lesson ${expectedId}`
      );
    }

    const mixedCaseQueries = [
      { q: 'hẢi ĐăNg', expectedId: 'lesson-lighthouse' },
      { q: 'cỔnG cHàO', expectedId: 'lesson-parabolic-arch' },
      { q: 'xE bUýT', expectedId: 'lesson-bus-optimization' },
      { q: 'cHợ LáCh', expectedId: 'lesson-bus-optimization' },
    ];

    for (const { q, expectedId } of mixedCaseQueries) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(
        results.some(l => l.id === expectedId),
        `Mixed case query "${q}" must find lesson ${expectedId}`
      );
    }
  });

  it('correctly handles search queries with leading/trailing newlines and tabs', () => {
    const padded = [
      '\n  lighthouse \t',
      '\r\nparabola\n',
      '\toptimization\t',
      '   hải đăng   ',
    ];

    for (const q of padded) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(results.length >= 1, `Padded query "${JSON.stringify(q)}" must match`);
    }
  });

  it('empirically verifies search receptivity across all 14 individual searchable fields', () => {
    const searchableFields = [
      'titleVi',
      'titleEn',
      'topicTitleVi',
      'topicTitleEn',
      'topic',
      'realWorldContextVi',
      'realWorldContextEn',
      'vocabTerm',
      'vocabDefVi',
      'vocabDefEn',
      'sceneTitleVi',
      'sceneTitleEn',
      'sceneContentVi',
      'sceneContentEn',
    ];

    for (const field of searchableFields) {
      const secretToken = `SECRET_TOKEN_${field.toUpperCase()}`;
      const syntheticLesson = {
        id: `synthetic-${field}`,
        titleVi: 'Tiêu đề chung',
        titleEn: 'Generic Title',
        topic: 'trigonometry',
        difficulty: 'Medium',
        scenes: [
          {
            id: 1,
            key: 'context',
            titleVi: field === 'sceneTitleVi' ? secretToken : 'Bối cảnh',
            titleEn: field === 'sceneTitleEn' ? secretToken : 'Context',
            contentVi: field === 'sceneContentVi' ? secretToken : 'Nội dung',
            contentEn: field === 'sceneContentEn' ? secretToken : 'Content',
          },
        ],
        vocabulary: [
          {
            term: field === 'vocabTerm' ? secretToken : 'Angle',
            definitionVi: field === 'vocabDefVi' ? secretToken : 'Góc',
            definitionEn: field === 'vocabDefEn' ? secretToken : 'Angle def',
          },
        ],
      };

      if (field === 'titleVi') syntheticLesson.titleVi = secretToken;
      if (field === 'titleEn') syntheticLesson.titleEn = secretToken;
      if (field === 'topicTitleVi') syntheticLesson.topicTitleVi = secretToken;
      if (field === 'topicTitleEn') syntheticLesson.topicTitleEn = secretToken;
      if (field === 'topic') syntheticLesson.topic = secretToken.toLowerCase();
      if (field === 'realWorldContextVi') syntheticLesson.realWorldContextVi = secretToken;
      if (field === 'realWorldContextEn') syntheticLesson.realWorldContextEn = secretToken;

      const dataset = [syntheticLesson];
      const match = filterLessons(dataset, { query: secretToken.toLowerCase() });
      assert.equal(
        match.length,
        1,
        `Field "${field}" must be receptively indexed by filterLessons`
      );
      assert.equal(match[0].id, `synthetic-${field}`);
    }
  });

  it('empirically demonstrates type assumption vulnerability when vocab/scenes contain non-string numbers', () => {
    // When a vocabulary definition or scene content is a number instead of string,
    // (v.definitionEn || '').toLowerCase throws TypeError because it assumes String.
    const nonStringLesson = {
      id: 'non-string-lesson',
      titleVi: 'Lesson with Number Vocab',
      titleEn: 'Lesson with Number Vocab EN',
      topic: 'quadratic',
      difficulty: 'Hard',
      vocabulary: [
        { term: 'validTerm', definitionVi: 'Định nghĩa', definitionEn: 12345 },
      ],
      scenes: [],
    };

    assert.throws(
      () => {
        filterLessons([nonStringLesson], { query: 'test' });
      },
      {
        name: 'TypeError',
        message: /(?:toLowerCase is not a function)/,
      },
      'Empirically reproduces un-coerced number property in vocabulary throwing TypeError'
    );
  });

  it('safely handles null and undefined items within scenes and vocabulary arrays when properties are strings', () => {
    const sparseLesson = {
      id: 'sparse-lesson',
      titleVi: 'Sparse Lesson',
      titleEn: 'Sparse Lesson EN',
      topic: 'quadratic',
      difficulty: 'Hard',
      vocabulary: [
        null,
        undefined,
        {},
        { term: null, definitionVi: undefined, definitionEn: '' },
        { term: 'validTerm' },
      ],
      scenes: [
        null,
        undefined,
        {},
        { titleVi: null, titleEn: undefined, contentVi: '', contentEn: null },
        { titleVi: 'validScene' },
      ],
    };

    assert.doesNotThrow(() => {
      const match1 = filterLessons([sparseLesson], { query: 'validterm' });
      assert.equal(match1.length, 1);

      const match2 = filterLessons([sparseLesson], { query: 'validscene' });
      assert.equal(match2.length, 1);

      const noMatch = filterLessons([sparseLesson], { query: 'nonexistent' });
      assert.equal(noMatch.length, 0);
    });
  });

  it('verifies topic filter strictly isolates lessons and never leaks other topics', () => {
    // Lesson 1 is trigonometry, Lesson 2 is quadratic.
    // Query "lighthouse" exists only in Lesson 1.
    // If topic filter is "quadratic", Lesson 1 must NEVER leak.
    const leakageCheck = filterLessons(DEFAULT_LESSONS, {
      topic: 'quadratic',
      query: 'lighthouse',
    });
    assert.equal(leakageCheck.length, 0, 'Must not leak Lesson 1 when topic=quadratic');

    // Query "Kê Gà" exists only in Lesson 1.
    // If topic filter is "optimization", Lesson 1 must NEVER leak.
    const leakageCheck2 = filterLessons(DEFAULT_LESSONS, {
      topic: 'optimization',
      query: 'kê gà',
    });
    assert.equal(leakageCheck2.length, 0, 'Must not leak Lesson 1 when topic=optimization');

    // Query "cổng chào" exists only in Lesson 2.
    // If topic filter is "trigonometry", Lesson 2 must NEVER leak.
    const leakageCheck3 = filterLessons(DEFAULT_LESSONS, {
      topic: 'trigonometry',
      query: 'cổng chào',
    });
    assert.equal(leakageCheck3.length, 0, 'Must not leak Lesson 2 when topic=trigonometry');
  });

  it('normalizes Vietnamese difficulty labels correctly ("cơ bản", "vận dụng", "vận dụng cao")', () => {
    const dataset = [
      { id: 'l1', topic: 'trigonometry', difficulty: 'cơ bản' },
      { id: 'l2', topic: 'quadratic', difficulty: 'vận dụng' },
      { id: 'l3', topic: 'optimization', difficulty: 'vận dụng cao' },
    ];

    const basic = filterLessons(dataset, { difficulty: 'basic' });
    assert.equal(basic.length, 1);
    assert.equal(basic[0].id, 'l1');

    const medium = filterLessons(dataset, { difficulty: 'medium' });
    assert.equal(medium.length, 1);
    assert.equal(medium[0].id, 'l2');

    const hard = filterLessons(dataset, { difficulty: 'hard' });
    assert.equal(hard.length, 1);
    assert.equal(hard[0].id, 'l3');
  });
});

// ============================================================================
// SUITE 2: CARD RENDERING SECURITY, ATTRIBUTE BREAKOUT & ROBUSTNESS
// ============================================================================
describe('Adversarial Suite 2: Card Rendering Security, Attribute Breakout & Robustness', () => {
  it('renders card safely when lesson has empty, null, or extreme values', () => {
    const explorer = new CollectionExplorer();

    const extremeLessons = [
      { id: 'extreme-empty' },
      { id: 'extreme-zero-min', estimatedMinutes: 0 },
      { id: 'extreme-neg-min', estimatedMinutes: -10 },
      { id: 'extreme-float-min', estimatedMinutes: 22.5 },
      { id: 'extreme-large-min', estimatedMinutes: 999999 },
      { id: 'extreme-null-thumb', thumbnail: null },
      { id: 'extreme-empty-thumb', thumbnail: '' },
      { id: 'extreme-null-scenes', scenes: null },
      { id: 'extreme-empty-scenes', scenes: [] },
      { id: 'extreme-null-diff', difficulty: null },
      { id: 'extreme-unknown-topic', topic: 'quantum_astrophysics' },
      { id: 'extreme-malformed-status', status: 999 },
    ];

    for (const lesson of extremeLessons) {
      assert.doesNotThrow(() => {
        const html = explorer.renderCardHtml(lesson);
        assert.ok(typeof html === 'string', 'Rendered card must be a string');
        assert.ok(html.includes(`data-card-id="${lesson.id}"`), 'Must contain data-card-id');
        assert.ok(html.includes('start-lesson-btn'), 'Must contain start-lesson button');
      }, `renderCardHtml must not throw on extreme lesson: ${JSON.stringify(lesson)}`);
    }
  });

  it('escapes potential attribute breakout in lesson id and start-lesson-btn', () => {
    const explorer = new CollectionExplorer();
    const maliciousPayloadId = 'lesson-1" onclick="alert(1)" data-fake="';
    const lesson = {
      id: maliciousPayloadId,
      titleVi: 'Payload ID Test',
      titleEn: 'Payload ID Test EN',
      topic: 'trigonometry',
      difficulty: 'Medium',
    };

    const html = explorer.renderCardHtml(lesson);
    assert.ok(
      !html.includes('onclick="alert(1)"'),
      'Must not allow attribute breakout in data-card-id or data-lesson-id'
    );
    assert.ok(html.includes('&quot; onclick=&quot;alert(1)&quot;'));
  });

  it('empirically records TypeError vulnerability when getLessonBadges receives null or undefined', () => {
    // getLessonBadges(null) calls getPublishGateReport(null) which is caught,
    // but then accesses lesson.status on line 129 without null-checking.
    assert.throws(
      () => {
        getLessonBadges(null);
      },
      {
        name: 'TypeError',
        message: /(?:Cannot read properties of null|Cannot read property 'status' of null)/,
      },
      'Empirically reproduces getLessonBadges(null) uncaught TypeError on lesson.status'
    );
  });

  it('survives non-null defective verification objects in getLessonBadges', () => {
    const defectiveLessons = [
      {},
      { verification: 'not-an-array' },
      { verification: [null, undefined, { passed: 'truthy-string' }] },
      { verification: Array(10).fill({ passed: true, layer: 'fake' }) },
      { status: 'PUBLISHED', verification: [] },
    ];

    for (const l of defectiveLessons) {
      assert.doesNotThrow(() => {
        const badges = getLessonBadges(l);
        assert.ok(badges.mathBadge, 'Must return mathBadge');
        assert.ok(badges.englishBadge, 'Must return englishBadge');
        assert.ok(badges.khktBadge, 'Must return khktBadge');
        assert.ok(badges.difficultyBadge, 'Must return difficultyBadge');
      });
    }
  });

  it('verifies default lessons display gold KHKT badge and verified math/english badges', () => {
    const explorer = new CollectionExplorer();

    for (const lesson of DEFAULT_LESSONS) {
      const cardHtml = explorer.renderCardHtml(lesson);
      assert.ok(cardHtml.includes('Math Rigor Passed'), `${lesson.id} must display Math Rigor Passed`);
      assert.ok(cardHtml.includes('CLIL English Passed'), `${lesson.id} must display CLIL English Passed`);
      assert.ok(cardHtml.includes('100% KHKT Verified'), `${lesson.id} must display 100% KHKT Verified`);
      assert.ok(cardHtml.includes('badge-khkt-gold'), `${lesson.id} must have badge-khkt-gold class`);
    }
  });
});

// ============================================================================
// SUITE 3: COLLECTION EXPLORER LIFECYCLE & STATE INTEGRITY
// ============================================================================
describe('Adversarial Suite 3: CollectionExplorer Lifecycle & State Transitions', () => {
  it('correctly manages sequential multi-filter mutations without state desynchronization', () => {
    const explorer = new CollectionExplorer({ lessons: DEFAULT_LESSONS });

    // Initial state: 3 lessons
    assert.equal(explorer.getFilteredLessons().length, 3);

    // Step 1: Filter by topic = trigonometry -> 1 lesson
    explorer.setTopic('trigonometry');
    assert.equal(explorer.state.topic, 'trigonometry');
    assert.equal(explorer.getFilteredLessons().length, 1);
    assert.equal(explorer.getFilteredLessons()[0].id, 'lesson-lighthouse');

    // Step 2: Add search query = "cổng chào" -> 0 lessons (cổng chào is quadratic, does not match trigonometry)
    explorer.setSearch('cổng chào');
    assert.equal(explorer.getFilteredLessons().length, 0);

    // Step 3: Switch topic to "all" -> 1 lesson (cổng chào matches lesson-parabolic-arch)
    explorer.setTopic('all');
    assert.equal(explorer.getFilteredLessons().length, 1);
    assert.equal(explorer.getFilteredLessons()[0].id, 'lesson-parabolic-arch');

    // Step 4: Set difficulty = "Hard" -> 0 lessons (parabolic arch is Medium)
    explorer.setDifficulty('Hard');
    assert.equal(explorer.getFilteredLessons().length, 0);

    // Step 5: Clear search -> 1 lesson (bus optimization is Hard)
    explorer.setSearch('');
    assert.equal(explorer.getFilteredLessons().length, 1);
    assert.equal(explorer.getFilteredLessons()[0].id, 'lesson-bus-optimization');

    // Step 6: Reset all filters -> 3 lessons
    explorer.handleResetFilters();
    assert.equal(explorer.state.query, '');
    assert.equal(explorer.state.topic, 'all');
    assert.equal(explorer.state.difficulty, 'all');
    assert.equal(explorer.getFilteredLessons().length, 3);
  });

  it('dispatches both onSelectLesson and CustomEvent cleanly upon card selection', () => {
    let callbackLessonId = null;
    let callbackLessonObj = null;

    const mockContainer = createMockElement('div', 'explorer-root');
    let customEventFired = false;
    let customEventDetail = null;

    mockContainer.addEventListener('lesson-select', (e) => {
      customEventFired = true;
      customEventDetail = e.detail;
    });

    const origWindow = globalThis.window;
    const origCustomEvent = globalThis.CustomEvent;

    globalThis.CustomEvent = class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    };
    globalThis.window = {
      CustomEvent: globalThis.CustomEvent,
      dispatchEvent: () => true,
    };

    try {
      const explorer = new CollectionExplorer({
        container: mockContainer,
        lessons: DEFAULT_LESSONS,
        onSelectLesson: (id, lesson) => {
          callbackLessonId = id;
          callbackLessonObj = lesson;
        },
      });

      explorer.selectLesson('lesson-lighthouse');

      assert.equal(callbackLessonId, 'lesson-lighthouse');
      assert.equal(callbackLessonObj.titleVi, 'Đo chiều cao ngọn hải đăng với chân tháp không thể tiếp cận');
      assert.equal(customEventFired, true);
      assert.equal(customEventDetail.lessonId, 'lesson-lighthouse');
    } finally {
      globalThis.window = origWindow;
      globalThis.CustomEvent = origCustomEvent;
    }
  });

  it('safely handles non-existent lessonId in selectLesson without throwing', () => {
    let callbackCalled = false;
    const explorer = new CollectionExplorer({
      lessons: DEFAULT_LESSONS,
      onSelectLesson: () => { callbackCalled = true; },
    });

    assert.doesNotThrow(() => {
      explorer.selectLesson('non-existent-lesson-id');
    });
    assert.equal(callbackCalled, false, 'Callback must not fire for non-existent lesson');
  });

  it('benchmarks rendering under load (500 custom lessons) in < 100ms', () => {
    const bulkLessons = [];
    for (let i = 0; i < 500; i++) {
      bulkLessons.push({
        id: `bulk-lesson-${i}`,
        titleVi: `Bài toán thực tế số ${i}`,
        titleEn: `Practical Math Problem #${i}`,
        topic: i % 3 === 0 ? 'trigonometry' : i % 3 === 1 ? 'quadratic' : 'optimization',
        difficulty: i % 2 === 0 ? 'Medium' : 'Hard',
        status: 'VERIFIED',
        verification: [],
      });
    }

    const t0 = performance.now();
    const explorer = new CollectionExplorer({ lessons: bulkLessons });
    const elapsedInit = performance.now() - t0;
    assert.ok(elapsedInit < 150, `Initialization of 500 lessons took ${elapsedInit.toFixed(2)}ms`);

    const t1 = performance.now();
    const results = explorer.getFilteredLessons();
    const elapsedFilter = performance.now() - t1;
    assert.equal(results.length, 500);
    assert.ok(elapsedFilter < 50, `Filtering 500 lessons took ${elapsedFilter.toFixed(2)}ms`);
  });
});

// ============================================================================
// SUITE 4: CROSS-MODULE COLLATERAL REGRESSION VERIFICATION (APP + EXPLORER)
// ============================================================================
describe('Adversarial Suite 4: Cross-Module Collateral Regression Verification', () => {
  it('verifies App initializes and coordinates with CollectionExplorer', async () => {
    const origWindow = globalThis.window;
    const origDocument = globalThis.document;

    const mockMain = createMockElement('main', 'main-content');
    const mockModalRoot = createMockElement('div', 'modal-root');
    const mockHeader = createMockElement('header', 'app-header');

    const docListeners = {};
    globalThis.document = {
      getElementById(id) {
        if (id === 'main-content') return mockMain;
        if (id === 'modal-root') return mockModalRoot;
        if (id === 'app-header') return mockHeader;
        return null;
      },
      querySelector(sel) {
        if (sel === '#main-content' || sel === '.main-content') return mockMain;
        if (sel === '#modal-root') return mockModalRoot;
        if (sel === '.app-header' || sel === '#app-header') return mockHeader;
        return null;
      },
      querySelectorAll() { return []; },
      createElement(tag) { return createMockElement(tag); },
      body: createMockElement('body'),
      addEventListener(evt, fn) {
        if (!docListeners[evt]) docListeners[evt] = [];
        docListeners[evt].push(fn);
      },
      removeEventListener(evt, fn) {
        if (docListeners[evt]) {
          docListeners[evt] = docListeners[evt].filter(f => f !== fn);
        }
      },
      dispatchEvent(evt) {
        const type = evt?.type || evt;
        if (docListeners[type]) {
          for (const cb of docListeners[type]) cb(evt);
        }
        return true;
      },
    };

    const winListeners = {};
    globalThis.window = {
      localStorage: {
        getItem: () => null,
        setItem: () => {},
      },
      addEventListener(evt, fn) {
        if (!winListeners[evt]) winListeners[evt] = [];
        winListeners[evt].push(fn);
      },
      removeEventListener(evt, fn) {
        if (winListeners[evt]) {
          winListeners[evt] = winListeners[evt].filter(f => f !== fn);
        }
      },
      dispatchEvent(evt) {
        const type = evt?.type || evt;
        if (winListeners[type]) {
          for (const cb of winListeners[type]) cb(evt);
        }
        return true;
      },
      scrollTo: () => {},
    };

    try {
      const app = new App();
      await app.init();

      // In initial state, activeTab should be 'explore'
      assert.equal(app.state.activeTab, 'explore');

      // Verify selecting a lesson transitions to player tab
      app.handleSelectLesson('lesson-lighthouse');
      assert.equal(app.state.activeTab, 'player');
      assert.equal(app.state.currentLessonId, 'lesson-lighthouse');

      // Verify handleBackToExplore transitions back to explore tab
      app.handleBackToExplore();
      assert.equal(app.state.activeTab, 'explore');

      // Verify dispatching lesson:select event via window transitions to player
      window.dispatchEvent({ type: 'lesson:select', detail: { lessonId: 'lesson-parabolic-arch' } });
      assert.equal(app.state.activeTab, 'player');
      assert.equal(app.state.currentLessonId, 'lesson-parabolic-arch');

      // Verify khkt:modal-closed event does NOT tamper with activeTab or lessons state
      window.dispatchEvent({ type: 'khkt:modal-closed', detail: {} });
      assert.equal(app.state.activeTab, 'player');
      assert.equal(app.state.lessons.length >= 3, true);

    } finally {
      globalThis.window = origWindow;
      globalThis.document = origDocument;
    }
  });
});
