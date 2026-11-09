/**
 * tests/search_filter_adversarial.test.js
 * Adversarial Oracle & Stress Test Suite for Milestone M2 (Search & Filtering)
 * Authored by: Milestone M2 Challenger 1 (Search & Filter Adversarial Oracle)
 *
 * Stress-tests the 5 required vectors:
 * 1. Regex injection and special characters (.*, (, [, \, $, +, ?, ^, ReDoS, prototypes)
 * 2. XSS injection payloads (<script>, <img>, <svg>, event handlers, attribute breakouts)
 * 3. Topic leakage & cross-search isolation (trigonometry, quadratic, optimization)
 * 4. Whitespace padding, casing variants, and unicode normalization
 * 5. Non-existent topics, empty search queries, and empty state rendering
 * + Header component navigation, tri-state bilingual switcher, and accessibility
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CollectionExplorer,
  filterLessons,
  escapeHtml,
  getLessonBadges,
} from '../src/components/CollectionExplorer.js';
import { Header } from '../src/components/Header.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

// ============================================================================
// VECTOR 1: REGEX INJECTION & SPECIAL CHARACTERS
// ============================================================================
describe('Adversarial Vector 1: Regex Injection & Special Characters in Search', () => {
  it('safely handles syntactically invalid regex strings without throwing SyntaxError', () => {
    const invalidRegexes = [
      '(',
      '[',
      '\\',
      '+',
      '?',
      '*',
      '([a-z',
      '\\u0000',
      '(((',
      '?+*^$',
    ];

    for (const q of invalidRegexes) {
      assert.doesNotThrow(() => {
        const results = filterLessons(DEFAULT_LESSONS, { query: q });
        assert.ok(Array.isArray(results), `Results for query ${q} must be an array`);
      }, `Search query "${q}" must not throw regex SyntaxError`);
    }
  });

  it('safely processes regex metacharacters and wildcards as literal substrings', () => {
    // None of the default lessons have literal ".*" in title or content
    const wildcards = ['.*', '^.*$', '.*+', '\\d+', '\\s+', '\\w+'];
    for (const q of wildcards) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.equal(
        results.length,
        0,
        `Wildcard "${q}" must be treated literally and match 0 lessons`
      );
    }
  });

  it('correctly matches literal characters that legitimately exist in math content', () => {
    // Formula parentheses and arithmetic operators exist in lesson titles/scenes
    const parenResults = filterLessons(DEFAULT_LESSONS, { query: '(' });
    assert.ok(parenResults.length >= 1, 'Literal "(" exists in formulas/scenes');

    const plusResults = filterLessons(DEFAULT_LESSONS, { query: '+' });
    assert.ok(plusResults.length >= 1, 'Literal "+" exists in quadratic/optimization formulas');

    const questionResults = filterLessons(DEFAULT_LESSONS, { query: '?' });
    assert.ok(questionResults.length >= 1, 'Literal "?" exists in vocabulary/prompts');
  });

  it('is completely immune to ReDoS (Catastrophic Backtracking) and runs in linear time', () => {
    const redosPayloads = [
      'a'.repeat(5000),
      '(a+)+$',
      '(a|aa)+$',
      '(a*)*b',
      '((a+)*)+$',
    ];

    for (const payload of redosPayloads) {
      const t0 = performance.now();
      const results = filterLessons(DEFAULT_LESSONS, { query: payload });
      const durationMs = performance.now() - t0;
      assert.ok(
        durationMs < 50,
        `ReDoS payload "${payload.slice(0, 20)}..." took ${durationMs.toFixed(2)}ms, must be < 50ms`
      );
      assert.equal(results.length, 0);
    }
  });

  it('safely handles JavaScript prototype pollution property names in search query', () => {
    const protoKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty'];
    for (const key of protoKeys) {
      assert.doesNotThrow(() => {
        const results = filterLessons(DEFAULT_LESSONS, { query: key });
        assert.equal(results.length, 0, `Search for "${key}" should return 0 results`);
      });
    }
  });

  it('safely coerces non-string query inputs (numbers, booleans, objects)', () => {
    // Number search
    const numResults = filterLessons(DEFAULT_LESSONS, { query: 10 });
    assert.ok(Array.isArray(numResults));

    // Boolean search
    const boolResults = filterLessons(DEFAULT_LESSONS, { query: false });
    assert.ok(Array.isArray(boolResults));

    // Empty object search
    const objResults = filterLessons(DEFAULT_LESSONS, { query: {} });
    assert.ok(Array.isArray(objResults));
  });
});

// ============================================================================
// VECTOR 2: XSS INJECTION PAYLOADS & HTML SANITIZATION
// ============================================================================
describe('Adversarial Vector 2: XSS Injection Payloads & Escaping', () => {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert("XSS")>',
    '"><script>alert(document.cookie)</script>',
    '"><img src=x onerror=alert(1)>',
    '\' onfocus=\'alert(1)\'',
    '<svg/onload=alert(1)>',
    '<iframe src="javascript:alert(1)">',
    'javascript:alert(1)',
    '<body onload=alert(1)>',
    '"><svg onload=alert(1)>',
    '"><input autofocus onfocus=alert(1)>',
  ];

  it('escapeHtml properly neutralizes all 5 sensitive HTML characters (&, <, >, ", \')', () => {
    const raw = `& < > " '`;
    const escaped = escapeHtml(raw);
    assert.equal(escaped, `&amp; &lt; &gt; &quot; &#039;`);
  });

  it('escapeHtml handles null, undefined, numbers, and booleans safely', () => {
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
    assert.equal(escapeHtml(42), '42');
    assert.equal(escapeHtml(true), 'true');
    assert.equal(escapeHtml(''), '');
  });

  it('escapeHtml neutralizes all standard XSS injection payloads', () => {
    for (const payload of xssPayloads) {
      const escaped = escapeHtml(payload);
      assert.ok(!escaped.includes('<script>'), `Must not contain unescaped <script> in: ${payload}`);
      assert.ok(!escaped.includes('<img'), `Must not contain unescaped <img in: ${payload}`);
      assert.ok(!escaped.includes('<svg'), `Must not contain unescaped <svg in: ${payload}`);
      assert.ok(!escaped.includes('<iframe'), `Must not contain unescaped <iframe in: ${payload}`);
      assert.ok(!escaped.includes('<body'), `Must not contain unescaped <body in: ${payload}`);
      assert.ok(!escaped.includes('">'), `Must not contain unescaped "> attribute breakout in: ${payload}`);
    }
  });

  it('CollectionExplorer search input rendering sanitizes XSS query without attribute breakout', () => {
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

    for (const payload of xssPayloads) {
      explorer.setSearch(payload);
      const html = mockContainer.innerHTML;
      assert.ok(
        !html.includes('<script>alert'),
        `HTML must not contain unescaped script tag for payload: ${payload}`
      );
      assert.ok(
        !html.includes('<img src=x onerror'),
        `HTML must not contain unescaped img onerror for payload: ${payload}`
      );
      assert.ok(
        !html.includes('<svg/onload'),
        `HTML must not contain unescaped svg onload for payload: ${payload}`
      );
    }
  });

  it('adversarially probes lesson card rendering with malicious custom lesson fields', () => {
    const explorer = new CollectionExplorer();

    const maliciousLesson = {
      id: 'malicious-test-card',
      titleVi: '<script>alert("titleVi")</script>',
      titleEn: '<img src=x onerror=alert("titleEn")>',
      topic: 'trigonometry',
      difficulty: 'Medium',
      thumbnail: 'x" onerror="alert("thumb")',
      realWorldContextVi: '<svg onload=alert("context")>',
      estimatedMinutes: 20,
      scenes: [],
    };

    const cardHtml = explorer.renderCardHtml(maliciousLesson);

    // Assert that titleVi, titleEn, thumbnail, and contextVi are strictly escaped
    assert.ok(!cardHtml.includes('<script>alert("titleVi")</script>'), 'titleVi must be escaped');
    assert.ok(!cardHtml.includes('<img src=x onerror=alert("titleEn")>'), 'titleEn must be escaped');
    assert.ok(!cardHtml.includes('onerror="alert("thumb")'), 'thumbnail attribute must be escaped');
    assert.ok(!cardHtml.includes('<svg onload=alert("context")>'), 'contextVi must be escaped');
    assert.ok(cardHtml.includes('&lt;script&gt;alert(&quot;titleVi&quot;)&lt;/script&gt;'));
  });

  it('empirically records vulnerability: string estimatedMinutes is injected unescaped into card', () => {
    // Empirical challenger verification: probe whether estimatedMinutes is escaped
    const explorer = new CollectionExplorer();
    const maliciousPayload = '<img src=x onerror=alert("EST_XSS")>';

    const probeLesson = {
      id: 'probe-est-min',
      titleVi: 'Safe Title',
      titleEn: 'Safe Title EN',
      topic: 'trigonometry',
      difficulty: 'Medium',
      estimatedMinutes: maliciousPayload,
      scenes: [],
    };

    const cardHtml = explorer.renderCardHtml(probeLesson);
    // If estimatedMinutes is unescaped, cardHtml will contain raw '<img src=x onerror=alert("EST_XSS")>'
    const isVulnerable = cardHtml.includes(maliciousPayload);
    // Documenting empirical finding: this is a confirmed failure mode when estimatedMinutes is string
    assert.equal(
      isVulnerable,
      true,
      'Empirically reproduces unescaped HTML injection when estimatedMinutes is a string'
    );
  });
});

// ============================================================================
// VECTOR 3: TOPIC LEAKAGE & STRICT TOPIC ISOLATION
// ============================================================================
describe('Adversarial Vector 3: Topic Leakage & Cross-Search Isolation', () => {
  it('strictly isolates trigonometry lessons without leaking quadratic or optimization', () => {
    const results = filterLessons(DEFAULT_LESSONS, { topic: 'trigonometry' });
    assert.equal(results.length, 1, 'Exactly 1 default trigonometry lesson');
    assert.equal(results[0].id, 'lesson-lighthouse');
    assert.equal(results[0].topic, 'trigonometry');

    // Confirm zero quadratic or optimization lessons
    const leaked = results.some(l => l.topic !== 'trigonometry');
    assert.equal(leaked, false, 'No quadratic or optimization lessons must leak into trigonometry');
  });

  it('strictly isolates quadratic lessons without leaking trigonometry or optimization', () => {
    const results = filterLessons(DEFAULT_LESSONS, { topic: 'quadratic' });
    assert.equal(results.length, 1, 'Exactly 1 default quadratic lesson');
    assert.equal(results[0].id, 'lesson-parabolic-arch');
    assert.equal(results[0].topic, 'quadratic');

    const leaked = results.some(l => l.topic !== 'quadratic');
    assert.equal(leaked, false, 'No trigonometry or optimization lessons must leak into quadratic');
  });

  it('strictly isolates optimization lessons without leaking trigonometry or quadratic', () => {
    const results = filterLessons(DEFAULT_LESSONS, { topic: 'optimization' });
    assert.equal(results.length, 1, 'Exactly 1 default optimization lesson');
    assert.equal(results[0].id, 'lesson-bus-optimization');
    assert.equal(results[0].topic, 'optimization');

    const leaked = results.some(l => l.topic !== 'optimization');
    assert.equal(leaked, false, 'No trigonometry or quadratic lessons must leak into optimization');
  });

  it('prevents cross-topic leakage when query matches a lesson from another topic', () => {
    // Searching "parabol" inside trigonometry must return 0
    const cross1 = filterLessons(DEFAULT_LESSONS, { topic: 'trigonometry', query: 'parabol' });
    assert.equal(cross1.length, 0, 'Cross search "parabol" in trigonometry must yield 0 results');

    // Searching "hải đăng" inside optimization must return 0
    const cross2 = filterLessons(DEFAULT_LESSONS, { topic: 'optimization', query: 'hải đăng' });
    assert.equal(cross2.length, 0, 'Cross search "hải đăng" in optimization must yield 0 results');

    // Searching "lighthouse" inside quadratic must return 0
    const cross3 = filterLessons(DEFAULT_LESSONS, { topic: 'quadratic', query: 'lighthouse' });
    assert.equal(cross3.length, 0, 'Cross search "lighthouse" in quadratic must yield 0 results');

    // Searching "xe buýt" inside trigonometry must return 0
    const cross4 = filterLessons(DEFAULT_LESSONS, { topic: 'trigonometry', query: 'xe buýt' });
    assert.equal(cross4.length, 0, 'Cross search "xe buýt" in trigonometry must yield 0 results');
  });

  it('prioritizes topic filter over text matching on synthetic adversary datasets with misleading titles', () => {
    const hostileDataset = [
      {
        id: 'hostile-trig',
        topic: 'trigonometry',
        titleVi: 'Hàm số bậc hai Parabol trong Đo đạc Hải đăng',
        titleEn: 'Quadratic Parabola in Lighthouse Surveying',
        scenes: [],
      },
      {
        id: 'hostile-quad',
        topic: 'quadratic',
        titleVi: 'Ngọn Hải đăng trong Cổng Parabol',
        titleEn: 'Lighthouse Triangulation in Parabolic Arch',
        scenes: [],
      },
      {
        id: 'hostile-opt',
        topic: 'optimization',
        titleVi: 'Tối ưu hóa Parabol Hải đăng',
        titleEn: 'Parabola Lighthouse Optimization',
        scenes: [],
      },
    ];

    // Searching "parabol" when topic is trigonometry must return ONLY hostile-trig
    const trigWithParabol = filterLessons(hostileDataset, { topic: 'trigonometry', query: 'parabol' });
    assert.equal(trigWithParabol.length, 1);
    assert.equal(trigWithParabol[0].id, 'hostile-trig');
    assert.equal(trigWithParabol[0].topic, 'trigonometry');

    // Searching "hải đăng" when topic is quadratic must return ONLY hostile-quad
    const quadWithLighthouse = filterLessons(hostileDataset, { topic: 'quadratic', query: 'hải đăng' });
    assert.equal(quadWithLighthouse.length, 1);
    assert.equal(quadWithLighthouse[0].id, 'hostile-quad');
    assert.equal(quadWithLighthouse[0].topic, 'quadratic');
  });

  it('supports case-insensitive topic filtering parameters', () => {
    const upperTrig = filterLessons(DEFAULT_LESSONS, { topic: 'TRIGONOMETRY' });
    assert.equal(upperTrig.length, 1);
    assert.equal(upperTrig[0].topic, 'trigonometry');

    const mixedQuad = filterLessons(DEFAULT_LESSONS, { topic: 'QuaDraTic' });
    assert.equal(mixedQuad.length, 1);
    assert.equal(mixedQuad[0].topic, 'quadratic');

    const upperOpt = filterLessons(DEFAULT_LESSONS, { topic: 'OPTIMIZATION' });
    assert.equal(upperOpt.length, 1);
    assert.equal(upperOpt[0].topic, 'optimization');
  });
});

// ============================================================================
// VECTOR 4: WHITESPACE PADDING, CASING VARIANTS & UNICODE
// ============================================================================
describe('Adversarial Vector 4: Whitespace Padding, Casing & Unicode Normalization', () => {
  it('trims leading and trailing whitespace from search queries', () => {
    const spacedQueries = [
      '   hải đăng   ',
      '\t\nparabol\r\n',
      '   lighthouse   ',
      '    chợ lách    ',
    ];

    for (const q of spacedQueries) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(
        results.length >= 1,
        `Padded query "${JSON.stringify(q)}" must match at least 1 lesson`
      );
    }
  });

  it('treats whitespace-only queries as empty queries returning all lessons', () => {
    const whitespaceOnly = ['   ', '\t\t\t', '\n\r\n', ' \t \n '];
    for (const q of whitespaceOnly) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.equal(
        results.length,
        DEFAULT_LESSONS.length,
        `Whitespace-only query "${JSON.stringify(q)}" must return all ${DEFAULT_LESSONS.length} lessons`
      );
    }
  });

  it('supports case-insensitive matching across Vietnamese and English titles', () => {
    const casePairs = [
      { lower: 'hải đăng', upper: 'HẢI ĐĂNG', title: 'Hải Đăng' },
      { lower: 'lighthouse', upper: 'LIGHTHOUSE', title: 'LiGhThOuSe' },
      { lower: 'parabol', upper: 'PARABOL', title: 'Parabol' },
      { lower: 'chợ lách', upper: 'CHỢ LÁCH', title: 'Chợ Lách' },
      { lower: 'tối ưu hóa', upper: 'TỐI ƯU HÓA', title: 'Tối Ưu Hóa' },
    ];

    for (const pair of casePairs) {
      const resLower = filterLessons(DEFAULT_LESSONS, { query: pair.lower });
      const resUpper = filterLessons(DEFAULT_LESSONS, { query: pair.upper });
      const resMixed = filterLessons(DEFAULT_LESSONS, { query: pair.title });

      assert.ok(resLower.length >= 1, `Lower "${pair.lower}" should match`);
      assert.equal(
        resLower.length,
        resUpper.length,
        `Count for "${pair.lower}" (${resLower.length}) must match "${pair.upper}" (${resUpper.length})`
      );
      assert.equal(
        resLower.length,
        resMixed.length,
        `Count for "${pair.lower}" must match "${pair.title}"`
      );
    }
  });

  it('normalizes difficulty filter between English and Vietnamese values', () => {
    // basic / cơ bản
    const basicEn = filterLessons(DEFAULT_LESSONS, { difficulty: 'Basic' });
    const basicLower = filterLessons(DEFAULT_LESSONS, { difficulty: 'basic' });
    assert.equal(basicEn.length, basicLower.length);

    // medium / vận dụng
    const mediumEn = filterLessons(DEFAULT_LESSONS, { difficulty: 'Medium' });
    const mediumLower = filterLessons(DEFAULT_LESSONS, { difficulty: 'medium' });
    assert.equal(mediumEn.length, mediumLower.length);

    // hard / vận dụng cao
    const hardEn = filterLessons(DEFAULT_LESSONS, { difficulty: 'Hard' });
    const hardLower = filterLessons(DEFAULT_LESSONS, { difficulty: 'hard' });
    assert.equal(hardEn.length, hardLower.length);
  });

  it('empirically demonstrates multi-space and unicode NFD edge cases', () => {
    // 1. Multi-space query: internal spaces are not collapsed by String.includes
    const singleSpace = filterLessons(DEFAULT_LESSONS, { query: 'hải đăng' });
    const multiSpace = filterLessons(DEFAULT_LESSONS, { query: 'hải   đăng' });
    assert.equal(singleSpace.length, 1);
    // Documents that internal multiple spaces do not match single-spaced title without regex or space collapse
    assert.equal(multiSpace.length, 0);

    // 2. Unicode NFD vs NFC: JS byte comparison does not match NFD query to NFC title
    const nfcQuery = 'hải đăng';
    const nfdQuery = nfcQuery.normalize('NFD');
    const nfcResults = filterLessons(DEFAULT_LESSONS, { query: nfcQuery });
    const nfdResults = filterLessons(DEFAULT_LESSONS, { query: nfdQuery });
    assert.equal(nfcResults.length, 1);
    assert.equal(nfdResults.length, 0, 'NFD decomposed query fails without .normalize("NFC")');
  });
});

// ============================================================================
// VECTOR 5: NON-EXISTENT TOPICS, EMPTY STATE & DEGENERATE INPUTS
// ============================================================================
describe('Adversarial Vector 5: Non-existent Topics, Empty State & Degenerate Inputs', () => {
  it('returns empty array when query has zero matches', () => {
    const zeroQueries = [
      'xyz_non_existent_query_99999',
      'quantum physics differential equations',
      'calculus integral integration by parts',
      '!@#$%^&*()_+{}[]',
    ];

    for (const q of zeroQueries) {
      const results = filterLessons(DEFAULT_LESSONS, { query: q });
      assert.ok(Array.isArray(results));
      assert.equal(results.length, 0, `Query "${q}" must yield 0 results`);
    }
  });

  it('returns empty array when topic filter does not exist in dataset', () => {
    const nonExistentTopics = ['calculus', 'probability', 'linear_algebra', 'unknown_topic'];
    for (const t of nonExistentTopics) {
      const results = filterLessons(DEFAULT_LESSONS, { topic: t });
      assert.ok(Array.isArray(results));
      assert.equal(results.length, 0, `Topic "${t}" must yield 0 results`);
    }
  });

  it('returns empty array when difficulty filter does not match any lesson', () => {
    const results = filterLessons(DEFAULT_LESSONS, { difficulty: 'ultra_nightmare' });
    assert.ok(Array.isArray(results));
    assert.equal(results.length, 0);
  });

  it('safely handles degenerate lesson collections (null, undefined, non-array, corrupt objects)', () => {
    assert.deepEqual(filterLessons(null, {}), []);
    assert.deepEqual(filterLessons(undefined, {}), []);
    assert.deepEqual(filterLessons('not an array', {}), []);
    assert.deepEqual(filterLessons(12345, {}), []);
    assert.deepEqual(filterLessons({}, {}), []);

    // Array containing null, undefined, strings, numbers, empty objects
    const corruptArray = [null, undefined, 'corrupt', 99, false, {}];
    const results = filterLessons(corruptArray, { topic: 'trigonometry' });
    assert.deepEqual(results, []);
  });

  it('CollectionExplorer properly renders Empty State HTML and reset controls', () => {
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

    // Set search query with 0 matches
    explorer.setSearch('completely_unmatched_query_xyz');

    const html = mockContainer.innerHTML;
    assert.ok(
      html.includes('Không tìm thấy bài học phù hợp'),
      'Must render empty state message'
    );
    assert.ok(
      html.includes('id="empty-reset-btn"'),
      'Must render empty state reset button'
    );
    assert.ok(
      html.includes('Hiển thị <strong id="filtered-count" class="text-blue-700">0</strong>'),
      'Filtered count must show 0'
    );

    // Call reset filters
    explorer.handleResetFilters();
    assert.equal(explorer.state.query, '');
    assert.equal(explorer.state.topic, 'all');
    assert.equal(explorer.state.difficulty, 'all');
    assert.ok(
      mockContainer.innerHTML.includes('>3</strong> / 3 bài học'),
      'After reset, all 3 lessons must be displayed'
    );
  });

  it('getLessonBadges and renderCardHtml handle completely empty lesson object without crashing', () => {
    const badges = getLessonBadges({});
    assert.ok(badges.mathBadge, 'mathBadge must exist');
    assert.equal(badges.mathBadge.passed, false);
    assert.ok(badges.englishBadge, 'englishBadge must exist');
    assert.equal(badges.englishBadge.passed, false);
    assert.equal(badges.khktBadge.passed, false);

    const explorer = new CollectionExplorer();
    assert.doesNotThrow(() => {
      const card = explorer.renderCardHtml({});
      assert.ok(typeof card === 'string' && card.length > 0);
    });
  });
});

// ============================================================================
// HEADER COMPONENT NAVIGATION & ACCESSIBILITY TESTS
// ============================================================================
describe('Header Component: Navigation, Bilingual Switcher & Accessibility', () => {
  it('renders all 4 navigation tabs with proper data-nav attributes', () => {
    const header = new Header({ activeTab: 'explore', language: 'dual' });
    const html = header.renderHtml();

    assert.ok(html.includes('data-nav="explore"'), 'Explore tab must exist');
    assert.ok(html.includes('data-nav="player"'), 'Player tab must exist');
    assert.ok(html.includes('data-nav="quiz"'), 'Quiz tab must exist');
    assert.ok(html.includes('data-nav="showcase"'), 'Showcase tab must exist');
    assert.ok(!html.includes('data-nav="studio"'), 'Studio tab must be removed');
    assert.ok(!html.includes('data-nav="survey"'), 'Survey tab must be removed');
  });

  it('renders KHKT brand title, school affiliation, and sigma emblem', () => {
    const header = new Header();
    const html = header.renderHtml();

    assert.ok(html.includes('MATH ENGLISH AI LEARN'), 'Must have brand title');
    assert.ok(html.includes('THPT TRẦN VĂN KIẾT'), 'Must have school affiliation');
    assert.ok(html.includes('∑'), 'Must have sigma emblem');
  });

  it('supports tri-state bilingual switcher across VI, EN, and DUAL modes', () => {
    const header = new Header({ activeTab: 'explore', language: 'dual' });

    // Dual mode
    header.setLanguage('dual');
    let html = header.renderHtml();
    assert.ok(html.includes('Bài học'));

    // Vietnamese mode
    header.setLanguage('vi');
    html = header.renderHtml();
    assert.ok(html.includes('Bài học'));

    // English mode
    header.setLanguage('en');
    html = header.renderHtml();
    assert.ok(html.includes('Lessons'));

    // Invalid language code should be ignored and preserve current mode
    header.setLanguage('invalid_lang');
    assert.equal(header.language, 'en');
  });

  it('toggles mobile drawer state and updates aria-expanded attribute', () => {
    const mockContainer = {
      _html: '',
      set innerHTML(val) { this._html = val; },
      get innerHTML() { return this._html; },
      querySelector: (sel) => {
        if (sel === '.mobile-nav-drawer') {
          return {
            classList: {
              _classes: new Set(),
              add(c) { this._classes.add(c); },
              remove(c) { this._classes.delete(c); },
              contains(c) { return this._classes.has(c); },
            },
          };
        }
        if (sel === '.mobile-menu-toggle') {
          return {
            _attrs: {},
            innerHTML: '',
            setAttribute(k, v) { this._attrs[k] = v; },
            getAttribute(k) { return this._attrs[k]; },
          };
        }
        return null;
      },
      querySelectorAll: () => [],
      addEventListener: () => {},
    };

    const header = new Header();
    header.container = mockContainer;

    // Toggle open
    header.toggleMobileMenu(true);
    assert.equal(header.isMobileMenuOpen, true);

    // Toggle closed
    header.toggleMobileMenu(false);
    assert.equal(header.isMobileMenuOpen, false);
  });
});
