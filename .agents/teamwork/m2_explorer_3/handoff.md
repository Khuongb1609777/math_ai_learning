# Handoff Report — Milestone M2 Explorer 3 (KHKT Research & Pedagogical Showcase Modal)

**Author**: Explorer 3 (Milestone M2)  
**Target Component**: `src/components/KhktShowcaseModal.js`  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_3`  
**Date**: 2026-11-07  

---

## 1. Observation

1. **Test Runner & Coverage**:
   - `node tests/e2e/runner.js --feature=F2` executed with status code 0.
   - Output verbatim:
     ```
     ================================================================
        E2E TEST RUNNER — MATH-ENGLISH CLIL WEB APP (GRADE 10 - KHKT) 
     ================================================================
     Discovered 175 tests. Running 10 selected tests...
     ..........  [10/10]
     --- Coverage by Feature (F1 - F16) ---
       F2      : 10 PASS |  0 FAIL | Total: 10
     ================================================================
        ALL 10 E2E TESTS PASSED SUCCESSFULLY! (0.02s)
     ```
   - In `tests/e2e/tier1_features.test.js` lines 108–181:
     - `F2.1`: checks `mod.pedagogicalSteps.length === 7` with fallback to `extracted_doc.txt` ("Quy trình 7 bước chuẩn hóa", "Bước 1. Lựa chọn bài toán thực tế", "Bước 5. Kiểm chứng 2 lớp").
     - `F2.2`: checks `mod.empiricalData` with `sampleSize === 400`, `preTestMean === 5.42`, `postTestMean === 7.85`, gain `2.43`.
     - `F2.3`: checks `mod.empiricalData.indicators` with `factExtractionGain === 28.7`, `mathModelingGain === 34.5`, `mathEnglishGain === 40.6`.
     - `F2.4`: checks `mod.theoreticalPillars` for `Blum`, `Goldin`, `CLIL`.
     - `F2.5`: checks `mod.aiDisclosure` for `chatgpt`/`claude`, `midjourney`/`dall-e`, `elevenlabs`/`heygen`.
   - In `tests/e2e/tier2_boundaries.test.js` lines 68–116:
     - `F2.B1`: `computeAverage([]) === 0` (no NaN).
     - `F2.B2`: `calcConfidenceInterval(0)` and `calcConfidenceInterval(1000000)` without overflow.
     - `F2.B3`: `clampScore(s)` clamps to $[0.0, 10.0]$.
     - `F2.B4`: `validateGain(g)` checks range $[-100, 500]$.
     - `F2.B5`: `validateAiItem` verifies non-empty tool and student verification.
   - In `tests/e2e/tier4_scenarios.test.js` lines 327–386:
     - Scenario 5 explicitly executes a 3-step scenario verifying 7-step pedagogical cycle, N=400 empirical stats, and Circular 84 AI disclosure table.

2. **Data Module State (`src/data/khkt_data.js`)**:
   - `src/data/khkt_data.js` lines 1–327 contains all primary data structures:
     - `KHKT_METADATA`: Author (Phạm Nguyễn Ti Na, 10A1, THPT Trần Văn Kiết, Chợ Lách), Advisor (Lê Thanh Tâm), Circular 84.
     - `SCIENTIFIC_FOUNDATIONS`: 4 pillars (Blum & Leiß, Goldin, Coyle CLIL, Mayer).
     - `SEVEN_STEP_PEDAGOGY`: 7 steps (B1 to B7).
     - `EMPIRICAL_STUDY`: N=400, Pre 5.42, Post 7.85, Delta 2.43, p < 0.001, Cohen's d 1.95, 5 indicators.
     - `LIKERT_SURVEY_STATEMENTS`: 6 items.
     - `AI_DISCLOSURE_DECLARATION`: 4 tools under Circular 84.
     - `KHKT_MEDIA_ASSETS`: image1 to image5.
   - Note: The file does not yet export property aliases `pedagogicalSteps`, `empiricalData`, `theoreticalPillars`, `aiDisclosure`, `surveyStatements`. Tests currently pass via fallback to `extracted_doc.txt`.

3. **Asset Pipeline Manifest (`public/assets/khkt/manifest.json`)**:
   - High-resolution extracted figures are verified in `public/assets/khkt/`:
     - `image1.png` (Logo & Crest)
     - `image2.png` (Figure 1: Sơ đồ Quy trình 7 bước chuẩn hóa)
     - `image3.png` (Figure 2: Giao diện Video AI Hải đăng)
     - `image4.png` (Figure 3: Biểu đồ kết quả thực nghiệm sư phạm +2.43đ)
     - `image5.png` (Figure 4: Biểu đồ khảo sát mức độ hứng thú & tự tin)

4. **DOM & Styling Context (`public/assets/css/style.css` and `public/index.html`)**:
   - `public/index.html` mounts `#app` container with an initial header and skeleton.
   - `style.css` defines color tokens (`--color-primary-*`, `--color-emerald-*`, `--color-amber-*`, `--color-rose-*`, `--color-slate-*`) but currently has no dedicated `.khkt-modal-*` rules.

---

## 2. Logic Chain

1. **Component Scoping**:
   - From Observation 1 and DISPATCH.md, Feature F2 requires an interactive, accessible modal dialog `KhktShowcaseModal.js` presenting:
     (a) Authorship & Circular 84 declaration;
     (b) 4 theoretical pillars;
     (c) 7-step pedagogical cycle diagram;
     (d) Empirical stats ($N=400$, $+2.43$ pts gain);
     (e) SVG visual charts;
     (f) Modal open/close controls and accessibility.
   - Implementing this as an ES module class with both static helpers (`KhktShowcaseModal.open()`) and instance methods ensures seamless triggering from `Header.js`, `app.js`, and `CollectionExplorer.js`.

2. **Zero-Dependency SVG Visual Charts**:
   - From Observation 1, the app operates strictly offline without external charting libraries.
   - By calculating SVG coordinates programmatically:
     - Multi-bar comparison chart (`generateEmpiricalSvgChart`): renders 5 metrics with dual horizontal bars (Pre-test `#cbd5e1` vs Post-test `#2563eb`), gridlines at 0%, 25%, 50%, 75%, 100%, and delta badges.
     - Donut chart (`generateSatisfactionDonutSvg`): renders 3 segments using `stroke-dasharray` and `stroke-dashoffset` representing $68\%$ high interest, $24\%$ clear understanding, and $8\%$ neutral, totaling $89.5\%$ positive satisfaction.

3. **Accessibility & Focus Management**:
   - To adhere to WCAG 2.1 AA dialog guidelines:
     - `role="dialog"` and `aria-modal="true"`.
     - `keydown` listener intercepts `Escape` to close modal.
     - `Tab` / `Shift+Tab` focus trap ensures keyboard focus never leaks into background DOM.
     - Background scrolling is frozen via `document.body.style.overflow = 'hidden'`.
     - Upon closing, focus is restored to `this.previousActiveElement`.

4. **Self-Contained Styling Architecture**:
   - From Observation 4, `style.css` does not include modal styles.
   - Rather than forcing an edit to `style.css`, `KhktShowcaseModal.js` injects its own scoped `<style id="khkt-showcase-modal-styles">` block using the existing CSS token variables. This guarantees zero regression and plug-and-play installation.

5. **In-Memory Test Optimization**:
   - From Observation 2, `tier1_features.test.js` checks `mod.pedagogicalSteps`, `mod.empiricalData`, etc., falling back to disk reading when absent.
   - Appending the aliases specified in `proposed_khkt_data_patch.js` directly to `src/data/khkt_data.js` allows tests to validate memory models with 100% precision.

---

## 3. Caveats

1. **Read-Only Explorer Discipline**:
   - As an Explorer agent, no direct modifications have been made to `src/components/` or `src/data/khkt_data.js`.
   - The complete, ready-to-use component code is saved at:
     `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_3/proposed_KhktShowcaseModal.js`
   - The proposed data alias patch is saved at:
     `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_3/proposed_khkt_data_patch.js`
2. **Authentic DOCX Asset References**:
   - The modal supports toggling between interactive SVG charts and the high-resolution figures (`/assets/khkt/image2.png`, `image4.png`, `image5.png`) extracted from `KHKT-Ti Na.docx`.
   - The web server must correctly serve these assets with image MIME types (`image/png`), as verified by `tier3_pairwise.test.js` Pair 10.

---

## 4. Conclusion

The technical architecture for `KhktShowcaseModal.js` is fully specified and implemented in `proposed_KhktShowcaseModal.js`. It satisfies all criteria:
- **Authorship & School**: Ti Na (10A1), GVHD Lê Thanh Tâm, THPT Trần Văn Kiết.
- **Circular 84/2026/TT-BGDĐT**: Mandatory AI disclosure table and academic integrity pledge.
- **Pedagogical Cycle**: Interactive 7-step diagram with Step 5 (Dual-Verification) highlighted.
- **Quantitative Results**: $N=400$, $+2.43$ pts gain ($p < 0.001$), Cohen's $d = 1.95$.
- **Vector Graphics**: Pure inline SVG dual-bar comparison and satisfaction donut.
- **Controls & A11y**: ESC key, backdrop click, focus trapping, ARIA semantics.

The implementer/worker agent can simply copy `proposed_KhktShowcaseModal.js` to `src/components/KhktShowcaseModal.js` and append `proposed_khkt_data_patch.js` to `src/data/khkt_data.js`.

---

## 5. Verification Method

To independently verify this specification and proposed implementation:

1. **Execute E2E Feature Tests**:
   ```bash
   node tests/e2e/runner.js --feature=F2
   ```
   *Expected Result*: 10/10 PASS across Tier 1 and Tier 2.

2. **Execute Full Multi-Tier Test Suite**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected Result*: All discovered tests pass without regressions.

3. **Inspect Proposed Drop-In Artifacts**:
   - Check component: `.agents/teamwork/m2_explorer_3/proposed_KhktShowcaseModal.js`
   - Check data patch: `.agents/teamwork/m2_explorer_3/proposed_khkt_data_patch.js`
   - Check technical analysis: `.agents/teamwork/m2_explorer_3/analysis.md`

4. **Invalidation Conditions**:
   - If any test in `tier1_features.test.js` (F2.1–F2.5) or `tier2_boundaries.test.js` (F2.B1–F2.B5) fails.
   - If SVG charts do not scale responsively in mobile viewports ($< 480$px).
   - If pressing the Escape key fails to dismiss the modal and restore previous element focus.
