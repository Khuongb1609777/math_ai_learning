# Milestone M2 Review & Adversarial Critic Report: Collection Explorer & KHKT Showcase Modal

**Reviewer / Critic Agent**: Milestone M2 Reviewer 2  
**Date**: 2026-11-07  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_reviewer_2`  
**Verdict**: **APPROVE**  
**Overall Risk Assessment**: **LOW**

---

## 1. Observation

1. **Target Files Inspected**:
   - `src/components/CollectionExplorer.js` (671 lines, 27,347 bytes):
     * Implements `escapeHtml`, `filterLessons`, `getLessonBadges`, and `CollectionExplorer` class.
     * Topic filter (`trigonometry`, `quadratic`, `optimization`, `all`) strictly partitions the catalog.
     * Difficulty filter supports bilingual mapping (`basic`/`cơ bản`, `medium`/`vận dụng`, `hard`/`vận dụng cao`).
     * Search scans `titleVi`, `titleEn`, `topicTitleVi`, `topicTitleEn`, `realWorldContextVi/En`, `vocabulary` (`term`, `definitionVi`, `definitionEn`), and `scenes` (`titleVi/En`, `contentVi/En`).
     * `getLessonBadges` evaluates Math rigor (Layer 1), CLIL English (Layer 2), and KHKT Gold verification status via `getPublishGateReport(lesson)` from `src/services/verification.js`.
     * Card clicks and "Bắt đầu học" buttons dispatch custom `lesson-select` events with bubble support.
     * Search input re-renders only `#lesson-cards-container` and `#filtered-count` via `updateCardsGrid()`, preserving typing focus.
   - `src/components/KhktShowcaseModal.js` (1,359 lines, 52,513 bytes):
     * Features 5 interactive tabs:
       1. Standardized 7-Step Pedagogical Cycle (B1–B7) with Step 5 Gatekeeper highlight and authentic Figure 1 toggle.
       2. Empirical Study data ($N=400$, pre $5.42$, post $7.85$, $+2.43$ pts gain, $p < 0.001$, Cohen's $d = 1.95$) with responsive inline SVG horizontal dual-bar comparison chart.
       3. Likert Survey statements (6 items, 89.5% positive rating) with dynamic pure SVG satisfaction donut chart.
       4. 4 Theoretical Foundations: Blum & Leiß (2007), Goldin (2014), Coyle CLIL (2010), Mayer Multimedia (2021).
       5. Circular 84/2026/TT-BGDĐT Academic Integrity Pledge and AI Disclosure Table (Table 6).
     * Includes accessibility features: ESC key dismiss, backdrop click overlay dismiss, keyboard Tab focus trap cycling, and ARIA dialog roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
     * Exports mathematical and boundary utilities: `computeSurveyAverage`, `clampScore`, `validateGain`, `validateAiDisclosureItem`, `calcConfidenceInterval`.
   - `src/data/khkt_data.js` (398 lines, 17,313 bytes):
     * Exports authoritative metadata `KHKT_METADATA`, `SCIENTIFIC_FOUNDATIONS`, `SEVEN_STEP_PEDAGOGY`, `EMPIRICAL_STUDY`, `LIKERT_SURVEY_STATEMENTS`, `AI_DISCLOSURE_DECLARATION`, `KHKT_MEDIA_ASSETS`.
     * Provides standardized backward-compatible aliases: `pedagogicalSteps`, `empiricalData`, `theoreticalPillars`, `aiDisclosure`, `surveyStatements`, and `default export KHKT_METADATA`.
   - Supporting files verified:
     * `src/components/Header.js`: Responsive navigation tabs, tri-state bilingual switcher (`VI`, `EN`, `DUAL`), mobile hamburger drawer.
     * `src/app.js`: SPA router and root controller coordinating Header, CollectionExplorer, and KhktShowcaseModal.
     * `public/assets/css/style.css`: Design system tokens, badge tokens, responsive grid, modal animations.

2. **Test Command Execution Results**:
   - `npm test`:
     * Command: `node --test tests/*.test.js tests/**/*.test.js`
     * Result: **88 passed**, 0 failed, 0 cancelled, 0 skipped, 21 suites (duration ~223ms).
   - `node tests/e2e/runner.js`:
     * Result: **175 passed**, 0 failed across Tiers 1–4 (duration ~0.11s).
     * Tier 1: 80/80 passed.
     * Tier 2: 80/80 passed.
     * Tier 3: 10/10 passed.
     * Tier 4: 5/5 passed.
     * Feature F1 (Collection Explorer): 10/10 PASS.
     * Feature F2 (KHKT Showcase): 10/10 PASS.
     * Feature F14 (Responsive Layout & Header): 10/10 PASS.
   - Syntax validation:
     * `node --check src/components/Header.js src/components/CollectionExplorer.js src/components/KhktShowcaseModal.js src/app.js src/data/khkt_data.js`: Exit code 0 (All modules syntactically valid).

3. **Integrity Audit**:
   - No hardcoded test responses or bypasses detected in source files.
   - SVG charts calculate genuine SVG coordinates, widths, stroke offsets, and percentages dynamically.
   - 2-layer verification badges query `getPublishGateReport(lesson)` from `src/services/verification.js` rather than returning stubbed boolean constants.
   - Verification output is genuine and independent.

---

## 2. Logic Chain

1. **Requirement Fulfillment (R1 & F1)**:
   - R1 mandates a Grade 10 real-world math collection browser supporting topic filtering (Trigonometry, Quadratic, Optimization), difficulty badges, dual verification status, and search matching.
   - Direct observation of `src/components/CollectionExplorer.js`:
     * Pure function `filterLessons` correctly evaluates topic isolation and difficulty mapping.
     * Search query is safely trimmed, lower-cased, and matched via substring containment against Vietnamese/English titles, contexts, vocabularies, and scene scripts without regex denial-of-service risks.
     * Function `getLessonBadges` evaluates all 3 sample lessons (`lesson-1-lighthouse`, `lesson-parabolic-arch`, `lesson-bus-optimization`) as 100% verified KHKT Gold Seal, correctly displaying Math Rigor and CLIL English badges.
   - Conclusion: R1 / F1 requirements are fully met.

2. **Requirement Fulfillment (F2 & Circular 84)**:
   - F2 mandates displaying the 7-step pedagogical cycle, empirical study data ($N=400$, $+2.43$ pts gain), theoretical pillars, and Circular 84 AI disclosure table.
   - Direct observation of `src/components/KhktShowcaseModal.js` and `src/data/khkt_data.js`:
     * Modal cleanly segments information across 5 tabs.
     * Step 5 Gatekeeper ("Chốt chặn kiểm định 2 lớp") is prominently highlighted in the stepper.
     * The empirical comparison SVG chart and satisfaction donut chart are implemented using pure, dependency-free inline SVG, conforming to the zero-external-dependency architectural constraint.
     * Accessible dialog semantics (`role="dialog"`, `aria-modal="true"`, ESC key listener, Tab key focus trap cycling) are fully implemented.
   - Conclusion: F2 requirements are fully met.

3. **Interface & Contract Compatibility**:
   - `src/data/khkt_data.js` satisfies both camelCase and UPPERCASE export conventions required by E2E test suites (`pedagogicalSteps`, `empiricalData`, `theoreticalPillars`, `aiDisclosure`, `surveyStatements`).
   - `src/components/CollectionExplorer.js` and `src/components/KhktShowcaseModal.js` expose standard `mount(container)` methods compatible with `src/app.js` and router lifecycle management.

---

## 3. Review Findings

### [Minor] Finding 1: `filterLessons` throws TypeError when `filters` argument is explicitly `null`
- **What**: Passing `null` as the second argument (`filterLessons(lessons, null)`) throws `TypeError: Cannot read properties of null (reading 'query')`.
- **Where**: `src/components/CollectionExplorer.js`, line 28 & 31:
  ```javascript
  export function filterLessons(lessons, filters = {}) {
    if (!Array.isArray(lessons)) return [];
    const rawQuery = filters.query ?? ''; // Throws TypeError if filters is null
  ```
- **Why**: In JavaScript, default parameters only trigger on `undefined`. When an explicit `null` is passed, `filters` remains `null`.
- **Suggestion**: Use `const safeFilters = filters || {};` before reading `safeFilters.query`, `safeFilters.topic`, and `safeFilters.difficulty`.

### [Minor] Finding 2: Search query does not support unaccented Vietnamese search
- **What**: Searching "hai dang" or "toi uu" yields 0 results, whereas searching "hải đăng" or "tối ưu" correctly finds the lessons.
- **Where**: `src/components/CollectionExplorer.js`, lines 60–106.
- **Why**: Query matching utilizes `.toLowerCase().includes(cleanQuery)` without normalizing Unicode diacritics via `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")`.
- **Suggestion**: In a future enhancement, normalize both the haystack and query with a simple Vietnamese diacritics removal helper so students typing without Vietnamese IME can also discover lessons.

### [Minor] Finding 3: `validateGain(null)` evaluates to `true`
- **What**: `validateGain(null)` returns `true` because `Number(null)` evaluates to `0`, which falls within the `[-100, 500]` range.
- **Where**: `src/components/KhktShowcaseModal.js`, lines 59–62:
  ```javascript
  export function validateGain(gain) {
    const num = Number(gain);
    return !Number.isNaN(num) && num >= -100 && num <= 500;
  }
  ```
- **Why**: `Number(null)` and `Number("")` cast to `0` in JavaScript.
- **Suggestion**: Add a check `gain !== null && gain !== ''` before range comparison.

### [Minor] Finding 4: Minor geographical note regarding provincial affiliation
- **What**: `khkt_data.js` records `province: "Tỉnh Vĩnh Long"` (faithfully matching lines 19 & 39 of the original `extracted_doc.txt`), whereas `KhktShowcaseModal.js` line 1343 and `app.js` line 455 write "Bến Tre".
- **Where**: `src/data/khkt_data.js:20` vs `src/components/KhktShowcaseModal.js:1343` and `src/app.js:455`.
- **Why**: Chợ Lách is geographically in Bến Tre province, but the source manuscript text cited Vĩnh Long in its header.
- **Suggestion**: Align the institutional footer note uniformly across all UI strings.

---

## 4. Adversarial Challenges

### [Low] Challenge 1: Focus trap behavior when modal dialog contains zero focusable children
- **Assumption Challenged**: Modal assumes there will always be at least one focusable element inside `.khkt-modal-dialog`.
- **Attack Scenario**: If DOM rendering is interrupted or a tab has no interactive elements, `focusables[0]` is undefined.
- **Blast Radius**: `handleKeyDown` already guards `if (focusables.length === 0) return;` at line 606, preventing runtime errors.
- **Mitigation Verified**: Guard is present and resilient.

### [Low] Challenge 2: Search input injection / ReDoS attack vector
- **Assumption Challenged**: User enters malicious characters (`<script>alert(1)</script>`, `([.*+?^${}()|[\\]/\\\\])`) into the search input.
- **Attack Scenario**: Crafting malicious regex patterns to freeze the UI thread or inject DOM nodes.
- **Blast Radius**: `filterLessons` uses string `includes()` instead of `RegExp()`, and `render()` uses `escapeHtml()` on `this.state.query` before setting HTML. Tested with adversarial string vectors: 0 crashes, 0 injections.
- **Mitigation Verified**: Fully sanitized and safe.

### [Low] Challenge 3: SVG Rendering under dynamic or extreme metrics
- **Assumption Challenged**: SVG chart generator assumes metrics array always contains non-zero scores.
- **Attack Scenario**: Passing empty metrics array `[]` or boundary score `0.0`.
- **Stress Test Result**: `generateEmpiricalSvgChart([])` generates a valid SVG grid without crashing. When score is 0.0, bar width is 0px with no NaN coordinates.
- **Mitigation Verified**: Robust.

---

## 5. Verified Claims & Test Coverage

| Verified Claim | Method | Result |
|---|---|---|
| Collection Explorer topic filtering (`trigonometry`, `quadratic`, `optimization`) | Node automated test & E2E runner F1 | **PASS** (10/10) |
| Search query matching across Vietnamese and English | E2E test F1.3 & Node test | **PASS** |
| Dual-layer verification badges evaluated via publish gate | Unit test & Node inspection | **PASS** |
| 7-step pedagogical cycle defined with Step 5 Gatekeeper | E2E test F2.1 & code inspection | **PASS** (10/10) |
| Empirical study data ($N=400$, $+2.43$ pts gain) | E2E test F2.2, F2.3 & DOM inspection | **PASS** |
| Pure SVG visual charts (Dual-bar comparison & satisfaction donut) | Node SVG generator stress test | **PASS** |
| Circular 84 AI disclosure declaration (Table 6) | E2E test F2.5 & code review | **PASS** |
| Modal accessibility (ESC dismiss, backdrop click, focus trap) | Code review & E2E runner F2 | **PASS** |
| Zero external CDN dependencies (offline-first compliance) | Code inspection of CSS and JS modules | **PASS** |
| Complete Unit Test Suite | `npm test` (88 tests) | **PASS** (88/88) |
| Complete E2E Multi-Tier Test Suite | `node tests/e2e/runner.js` (175 tests) | **PASS** (175/175) |

---

## 6. Caveats

- **No Caveats**: All 3 mandatory review files (`CollectionExplorer.js`, `KhktShowcaseModal.js`, `khkt_data.js`) as well as supporting integration files (`Header.js`, `app.js`, `style.css`) were inspected and executed against both the unit test suite and multi-tier E2E test suite.

---

## 7. Conclusion

Milestone M2 implementation is of exceptionally high quality, strictly adheres to all architectural constraints and project specifications, introduces zero external dependencies, provides full test coverage across 88 unit tests and 175 E2E tests, and contains no integrity violations or fake facades.

**Verdict: APPROVE**

---

## 8. Verification Method

To independently reproduce and verify this review verdict:

1. **Run Full Unit Test Suite**:
   ```bash
   npm test
   ```
   *Expected Output*: 88 tests passed in 21 suites, 0 failures.

2. **Run Full E2E Test Suite**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected Output*: 175 tests passed across Tiers 1–4, 0 failures.

3. **Run Feature-Specific E2E Tests for M2**:
   ```bash
   node tests/e2e/runner.js --feature=F1
   node tests/e2e/runner.js --feature=F2
   node tests/e2e/runner.js --feature=F14
   ```
   *Expected Output*: 10/10 PASS for each feature suite.

4. **Verify Syntax of Implementation Modules**:
   ```bash
   node --check src/components/Header.js src/components/CollectionExplorer.js src/components/KhktShowcaseModal.js src/app.js src/data/khkt_data.js
   ```
   *Expected Output*: Exit code 0.
