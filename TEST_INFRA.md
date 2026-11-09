# E2E TEST INFRASTRUCTURE SPECIFICATION (TEST_INFRA.md)
## Project: Math-English CLIL Practical Mathematics Web App (Grade 10 - KHKT)
**Research Project:** Ứng dụng Trí tuệ nhân tạo phát triển video song ngữ học Toán thực tiễn (CLIL) dành cho học sinh Lớp 10  
**School / Author:** THPT Trần Văn Kiết, Vĩnh Long — Tác giả: Phạm Nguyễn Ti Na (10A1) — GVHD: ThS. Lê Thanh Tâm  
**Document Status:** OFFICIAL SPECIFICATION  
**Authoritative Sources:** `ORIGINAL_REQUEST.md`, `extracted_doc.txt`, `PROJECT.md`, `spec_report.md`, `architecture_report.md`

---

## 1. Test Philosophy

### 1.1. Opaque-Box & Requirement-Driven
The E2E test suite adheres to strict **opaque-box (black-box) testing principles**:
- Tests are derived exclusively from user requirements (`ORIGINAL_REQUEST.md`), KHKT pedagogical specifications (`extracted_doc.txt`), and interface contracts defined in `PROJECT.md`.
- Tests never assert against private implementation internals, hidden variables, or incidental DOM tree structures. They evaluate observable inputs, outputs, mathematical truths, language fidelity, state transitions, and contract adherence.
- Every test case has an explicit, authoritative source of truth for its expected output:
  1. **Mathematical Rigor**: Exact analytical solutions from trigonometry (Law of Sines), algebra (quadratic vertex, axis of symmetry), and optimization (AM-GM inequality, quadratic extremum).
  2. **KHKT Empirical Data**: Exact published figures from the research study on $N = 400$ 10th-grade students (pre-test 5.42/10, post-test 7.85/10, $+2.43$ pts, $+28.7\%$ fact extraction, $+34.5\%$ math modeling, $+40.6\%$ Math English vocabulary).
  3. **Regulatory & Pedagogical Standards**: Compliance with Circular 84/2026/TT-BGDĐT on AI transparency and Blum & Leiß's 7-step mathematical modeling cycle.

### 1.2. Zero External Cloud Dependency
- The test suite runs **100% offline and locally** on Node.js v20+ with zero external cloud dependencies.
- No paid third-party APIs, external databases, or cloud speech engines are required.
- Browser APIs such as `localStorage` and `window.speechSynthesis` (Web Speech API) are tested natively or via deterministic headless polyfills in the runner environment.

### 1.3. Adversarial and Boundary Integrity
- Tests incorporate edge conditions: numerical singularities (division by zero when elevation angles converge), physical boundaries (vehicle width exceeding arch span), economic constraints (ticket prices collapsing to non-positive numbers), and security checks (path traversal on the local HTTP server, malformed JSON injection).

---

## 2. Feature Inventory Coverage (F1 – F16)

The test infrastructure provides 100% coverage across all 16 features specified in `PROJECT.md`:

| Feature ID | Feature Name | Primary Verification Scope | Tier Coverage |
|---|---|---|---|
| **F1** | Grade 10 Math Problem Collection Explorer | Catalog display, topic filters (Trigonometry, Quadratic, Optimization), keyword search, difficulty tags, dual-verification badges | T1, T2, T3, T4 |
| **F2** | KHKT Research Showcase & Pedagogy Modal | 7-step pedagogical cycle, $N=400$ empirical data ($+2.43$ pts), theoretical pillars (Blum & Leiß, Goldin, CLIL), Circular 84/2026 AI disclosure | T1, T2, T3, T4 |
| **F3** | 5-Scene Bilingual Multimedia Player | 5-scene sequence: Bối cảnh $\to$ Dữ kiện $\to$ Vấn đề & Từ vựng $\to$ Gợi mở $\to$ Thực hành; scene navigation, progress stepper | T1, T2, T3, T4 |
| **F4** | Bilingual Language Switcher | VI / EN / Dual side-by-side mode toggle, subtitle synchronization, language state persistence across scenes | T1, T2, T3, T4 |
| **F5** | Interactive Math English Glossary & Pronunciation | Terminology table, IPA phonetics format `/.../`, bilingual definitions, contextual examples, Web Speech API TTS integration with fallback | T1, T2, T3, T4 |
| **F6** | Interactive Dynamic Visual Simulations | SVG/Canvas parameter-driven models: Lighthouse triangulation ray-tracer, Parabolic Arch vehicle clearance, Cho Lach Bus Revenue vertex curve | T1, T2, T3, T4 |
| **F7** | Interactive Worksheets & Multi-Tier Quizzes | 3 cognitive tiers: Fact extraction, Mathematical modeling, Math English vocabulary; bilingual questions and options | T1, T2, T3, T4 |
| **F8** | Automated 10-Point Scoring & Scaffolded Feedback | 10-point scoring algorithm, category weighting, positive reinforcement, misconception warnings, step-by-step cognitive explanations | T1, T2, T3, T4 |
| **F9** | Pedagogical Learner Survey | 5-point Likert scale instrument (6 statements from KHKT Annex), data collection, satisfaction aggregation, persistent storage | T1, T2, T3, T4 |
| **F10** | 5-Scene Lesson Authoring Studio | Lesson editor for 5 bilingual scenes, given facts table, formulas, vocabulary manager, quiz question builder, draft persistence | T1, T2, T3, T4 |
| **F11** | Dual-Layer Independent Verification Matrix | 10 inspection criteria: Layer 1 (5 Math criteria: V1.1-V1.5) and Layer 2 (5 English criteria: V2.1-V2.5), reviewer metadata, audit trail | T1, T2, T3, T4 |
| **F12** | Programmatic Publishing Gate & Certificate Generator | Strict gate blocking publication unless 10/10 criteria PASS; status transition DRAFT $\to$ PUBLISHED; KHKT Quality Certificate generator | T1, T2, T3, T4 |
| **F13** | Client-Side Storage & Data Management | LocalStorage persistence, JSON export, JSON import with validation, protection of default KHKT sample lessons against deletion | T1, T2, T3, T4 |
| **F14** | Responsive, Standalone Web Architecture | Valid HTML5, CSS design tokens (deep blue `#1E3A8A`, emerald `#059669`, amber `#D97706`), mobile/desktop viewport adaptability, zero CDN dependencies | T1, T2, T3, T4 |
| **F15** | High-Resolution KHKT Media Asset Pipeline | Python extraction script `extract_assets.py` for Figures 1-5 from `KHKT-Ti Na.docx` into `public/assets/khkt/`, image integrity checks | T1, T2, T3, T4 |
| **F16** | Local Zero-Dependency Server & Automated Test Suite | Native Node.js `node:http` static server in `server.js`, MIME header accuracy, 404 handling, test runner integration | T1, T2, T3, T4 |

---

## 3. Test Architecture

### 3.1. Directory Structure
```
tests/e2e/
├── runner.js                   # Standalone test runner and CLI harness
├── tier1_features.test.js      # Feature coverage tests for F1-F16 (>= 5 tests each, >= 80 total)
├── tier2_boundaries.test.js    # Boundary, edge cases, zero/extreme values (>= 5 tests each, >= 80 total)
├── tier3_pairwise.test.js      # Cross-feature interaction tests (10 comprehensive pairings)
└── tier4_scenarios.test.js     # Real-world student & teacher workflows (5 end-to-end scenarios)
```

### 3.2. Execution Command
The test suite is executable via standard Node.js without requiring third-party test runners:
```bash
# Run the complete 4-tier E2E test suite
node tests/e2e/runner.js

# Optional: Run a specific tier
node tests/e2e/runner.js --tier=1
node tests/e2e/runner.js --tier=2
node tests/e2e/runner.js --tier=3
node tests/e2e/runner.js --tier=4

# Optional: Run a specific feature
node tests/e2e/runner.js --feature=F1
```

### 3.3. Pass / Fail Semantics
- **Exit Code 0**: All executed tests in all suites pass cleanly.
- **Exit Code 1**: One or more tests fail, throw an unhandled assertion error, or encounter an unexpected runtime failure.
- **Output Report**:
  - Colorized console output with status badges: `[PASS]`, `[FAIL]`, `[WARN]`.
  - Detailed failure diagnostics: expected vs actual values, assertion diffs, source file and line numbers.
  - Final summary matrix breaking down tests by Tier and by Feature ID.

### 3.4. Test Harness & In-Memory Environment
To enable true opaque-box E2E testing of both browser-oriented and server-oriented code without requiring heavy browser binaries:
- A lightweight, standard-compliant DOM & Web API environment is provided in the test runner:
  - `window` and `document` event dispatching and element emulation.
  - `window.localStorage` in-memory key-value store with standard methods (`getItem`, `setItem`, `removeItem`, `clear`, `length`, `key`).
  - `window.speechSynthesis` and `SpeechSynthesisUtterance` mocking to verify audio TTS calls, language codes, and speech rate parameters without requiring actual speaker hardware.
  - `node:http` client to test real HTTP requests against `server.js` (status codes, MIME types, security headers).

---

## 4. Coverage Thresholds

| Tier | Focus | Requirement Threshold | Planned Tests |
|---|---|---|---|
| **Tier 1** | Feature Coverage (F1 – F16) | $\ge 5$ test cases per feature | 80 tests |
| **Tier 2** | Boundaries & Edge Cases | $\ge 5$ test cases per feature | 80 tests |
| **Tier 3** | Pairwise Cross-Feature Interactions | Combinatorial cross-feature interactions | 10 tests |
| **Tier 4** | Real-World Application Scenarios | Complete multi-step user workflows | 5 tests |
| **Total** | **Comprehensive E2E Suite** | **Tiers 1 through 4** | **175 tests** |

---

## 5. Real-World Application Scenarios (Tier 4)

### Scenario 1: End-to-End Grade 10 Student Learning Journey
- **User**: Grade 10 Student (Nguyen Van A).
- **Workflow**:
  1. Opens application home page, searches for "Hải đăng" / "Lighthouse".
  2. Selects Lesson 1 ("Đo chiều cao ngọn hải đăng") from the Explorer.
  3. Launches 5-Scene Multimedia Player in **Dual Bilingual Mode (VI / EN)**.
  4. Interacts with Scene 3 Glossary: clicks pronunciation for *"Angle of elevation"*, *"Inaccessible base"*, and *"Law of Sines"*; verifies Web Speech API calls.
  5. Explores Scene 4 Dynamic SVG Simulation: observes triangulation angle geometry ($\alpha = 42^\circ, \beta = 63^\circ \implies \widehat{ADB} = 21^\circ$).
  6. Transitions from Scene 5 to Interactive Worksheet:
     - Answers Fact Extraction question on inaccessible base.
     - Answers Modeling question on Law of Sines ($BD = \frac{30 \cdot \sin 42^\circ}{\sin 21^\circ}$).
     - Answers Math English vocabulary question.
  7. Submits quiz: receives instant score of **10.0/10**, reviews step-by-step cognitive feedback.
  8. Completes 6-item Likert Learner Survey (rating 5/5 for high satisfaction); verifies survey data saved in `localStorage`.

### Scenario 2: Teacher Authoring & 2-Layer Verification Gatekeeper Workflow
- **User**: High School Math Teacher & CLIL Coordinator (Le Thanh Tam).
- **Workflow**:
  1. Opens Lesson Authoring Studio to create a new practical math lesson ("Đo bề rộng sông Cái Mơn").
  2. Enters metadata, bilingual title, topic (`trigonometry`), and 5 sequential scenes.
  3. Adds Math English vocabulary items with phonetics, definitions, and example sentences.
  4. Defines 3 quiz questions covering fact extraction, modeling, and terminology.
  5. Saves draft: verifies status is `DRAFT`.
  6. Initiates Dual-Layer Verification Matrix:
     - Evaluates Layer 1 (Math Rigor): all 5 criteria pass (5/5).
     - Evaluates Layer 2 (CLIL English): criteria V2.1 passes, but V2.2 fails due to a missing IPA phonetic string (4/5).
  7. Attempts to Publish: **Publishing Gate strictly BLOCKS publication**, displays alert with missing criteria.
  8. Teacher provides valid IPA phonetics, re-evaluates Layer 2: all 5 criteria pass (5/5).
  9. Overall score reaches **10/10 PASS**: Gate unblocks publication.
  10. Lesson status updates to `PUBLISHED`; system generates a tamper-evident KHKT Quality Certificate with auditor signatures and timestamp.
  11. Exports complete catalog JSON backup; verifies custom lesson is included with full audit log.

### Scenario 3: Parabolic Arch Highway Clearance Investigation
- **User**: STEM Student exploring quadratic modeling.
- **Workflow**:
  1. Loads Lesson 2 ("Cổng chào Parabol và Xe tải lọt qua cổng").
  2. Extracts given facts: arch base span $L = 8\text{ m}$ (points $A(-4, 0), B(4, 0)$), arch peak height $H = 6\text{ m}$ ($S(0, 6)$), container truck width $w = 4\text{ m}$, truck height $h_0 = 4.2\text{ m}$.
  3. Formulates quadratic equation $y = ax^2 + 6$; verifies $a = -\frac{3}{8} = -0.375$.
  4. Tests clearance height at truck outer edge ($x = 2\text{ m}$): $y(2) = -\frac{3}{8}(4) + 6 = 4.5\text{ m}$.
  5. Compares with truck height: $4.5\text{ m} - 4.2\text{ m} = 0.3\text{ m} = 30\text{ cm}$ clearance margin.
  6. Confirms truck can safely pass through the arch.
  7. Answers quiz questions on coordinate origin placement and vertex coordinates; verifies common error warnings on asymmetric coordinate origin selection.

### Scenario 4: Offline STEM-CLIL Data Backup, Export, and Restoration Lifecycle
- **User**: Teacher migrating lesson data to an offline laptop.
- **Workflow**:
  1. Verifies that 3 default KHKT lessons are loaded and marked as protected.
  2. Attempts to delete a default KHKT sample lesson: verifies operation is rejected with an error.
  3. Creates a custom practical lesson in storage.
  4. Executes `exportLessonsJSON()`: captures full JSON string payload.
  5. Clears `localStorage` to simulate a clean browser state.
  6. Reinitializes storage: verifies default 3 KHKT lessons load automatically.
  7. Executes `importLessonsJSON()` with the previously exported payload: verifies custom lesson is restored with its verification audit log and certificates intact.

### Scenario 5: KHKT National Competition Research Showcase & Audit Compliance
- **User**: KHKT National Competition Judge / Evaluator.
- **Workflow**:
  1. Navigates to KHKT Research Showcase modal.
  2. Inspects 7-Step Pedagogical Cycle diagram and validates all 7 standardized steps (B1 to B7).
  3. Inspects empirical study quantitative results ($N = 400$ Grade 10 students):
     - Pre-test score: $5.42/10$; Post-test score: $7.85/10$ ($+2.43$ pts, $p < 0.001$).
     - Fact extraction: $+28.7\%$; Modeling formulation: $+34.5\%$; Math EN vocabulary: $+40.6\%$; Real-world interpretation: $+32.5\%$.
  4. Inspects Circular 84/2026/TT-BGDĐT AI Disclosure Table:
     - ChatGPT/Claude: raw script ideas, student verification of formulas.
     - Midjourney/DALL-E: visual context generation, student filtering of mathematical accuracy.
     - ElevenLabs: bilingual voiceover, student speech rate calibration.
     - Excel/SPSS: statistical processing, student raw data entry.
  5. Confirms full scientific integrity and ethical research compliance declarations.

---

## 6. Verification and Maintenance Guide

- **Running Tests**: Run `node tests/e2e/runner.js`.
- **Adding New Tests**: Add test cases to the appropriate tier file (`tier1_features.test.js`, `tier2_boundaries.test.js`, etc.) using the test registration helper `test(name, fn)`.
- **Debugging**: Use `node tests/e2e/runner.js --verbose` to print stack traces and execution timings for individual test cases.
