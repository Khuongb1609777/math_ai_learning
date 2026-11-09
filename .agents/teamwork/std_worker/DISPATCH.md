## 2026-11-09T15:28:41Z
You are std_worker, a teamwork_worker.
Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/std_worker

MANDATORY FIRST STEP:
Read /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL INCOMING CONTEXT FROM USER:
Khẩn cấp từ User: "Làm nhanh bước cuối đi, push code nhanh".
Tiến hành áp dụng toàn bộ các thay đổi R1, R2, R3, R4 vào mã nguồn, chạy kiểm thử xác nhận 100% pass và hoàn tất để sẵn sàng commit/push code lên Git thật nhanh.

Read the complete handoff reports from the 3 Explorers:
1. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/std_explorer_1/handoff.md (Detailed drop-in code for R1: Math Rendering)
2. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/std_explorer_2/handoff.md (Detailed line-by-line replacements for R2: Branding, Generic Content & Navigation)
3. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/std_explorer_3/handoff.md (Detailed plan for R3: Parabolic Arch Image & R4: Test Suite Integrity)

IMPLEMENTATION TASKS:

Task 1 (R1 - Math Formula Rendering):
- Create `src/services/mathRenderer.js` using the zero-dependency pure-JS & HTML LaTeX formatter provided by std_explorer_1 (handling `^\circ`, `\widehat{...}`, `\text{...}`, `\frac{...}{...}`, nested Vietnamese text annotations like `C \text{ is inaccessible (không thể tiếp cận)}`, and math symbols). Do NOT add remote CDN URLs to index.html (forbidden by tests).
- Update `src/components/LessonPlayer.js` to import `renderMath` from `../services/mathRenderer.js` and wrap formulas inside the Mathematical Formulas Box (`renderMath(f)`).
- Update `public/assets/css/style.css` with the CSS rules for `.math-frac`, `.math-widehat`, `.math-unit`, `.math-text`, `.math-fallback`.
- Add `tests/math_renderer.test.js` to verify math rendering of all formulas.

Task 2 (R2 - Generic Content & Branding):
- Remove all occurrences of "THPT Trần Văn Kiết", "Vĩnh Long", "Bến Tre", "Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT) 2026-2027", "Phạm Nguyễn Ti Na", "Lê Thanh Tâm", "Thông tư 84/2026/TT-BGDĐT" across all files:
  * `src/components/Header.js`: Brand subtitle -> "NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN", nav tab label -> "Giới thiệu phương pháp" (keep data-nav="showcase").
  * `public/index.html`: Update title, meta tags, and header brand subtitle.
  * `src/app.js`: Update footer branding, guidelines references, and modal text.
  * `src/components/CollectionExplorer.js`: Hero badges and school references.
  * `src/components/AuthoringStudio.js`: Standardize certification rules and committee references.
  * `src/components/LearnerSurvey.js`: Generic pedagogy survey description.
  * `src/components/KhktShowcasePage.js` & `src/components/KhktShowcaseModal.js`: Standardize methodology, CLIL 5-scene framework, and expert committees.
  * `src/data/khkt_data.js`: Update metadata, authors to "Ban Chuyên môn CLIL", legalBasis to Thông tư 32/2018/TT-BGDĐT.
  * `src/data/lessons.js`: Author -> "Ban Chuyên môn Toán - Tiếng Anh (CLIL)", Lesson 3 text remove "(Vĩnh Long)" / "in Vinh Long".
  * `src/data/verification_rules.js` & `src/services/verification.js`: Update verifiedBy committees and legal basis.
  * `package.json`: Update description and author.
  * `server.js`: Update console log / startup banner if needed.

Task 3 (R3 - Parabolic Arch Visual Asset & School Logo Removal):
- Completely remove the school logo from all components and assets.
- Generate or place a clean, high-contrast architectural simulation graphic of the Parabolic Arch & Clearance Truck ($L = 8\text{m}, H = 6\text{m}, y = -\frac{3}{8}x^2 + 6, w = 4\text{m}, h = 4.2\text{m}, \Delta h = +0.3\text{m}$) at `public/assets/khkt/parabolic_arch.png`.
- Overwrite `public/assets/khkt/image1.png` and `public/assets/khkt/khkt_logo.png` with this parabolic arch graphic so that no stale school logo remains anywhere in the app.
- Update Lesson 2 card in `src/data/lessons.js` to point to `/assets/khkt/parabolic_arch.png` (or `/assets/khkt/image1.png`).
- Update `src/components/CollectionExplorer.js` and `src/components/AuthoringStudio.js` defaults/fallbacks.

Task 4 (R4 - Test Suite Integrity & Verification):
- Update test assertions in:
  * `tests/khkt_ui_navigation_fix.test.js`: Update to check "Giới thiệu phương pháp" and standardized header subtitle.
  * `tests/modal_state_adversarial.test.js`: Update line 904 to check "Giới thiệu phương pháp".
  * `tests/search_filter_adversarial.test.js`: Update line 572 & 577 to check standardized subtitle.
  * `tests/collection_explorer_deep_adversarial.test.js`: Update line 300 to match updated thumbnail path.
- Run `npm test` and ensure 100% pass rate.
- Run `node tests/e2e/runner.js` and ensure 100% pass rate.
- Run `node build.js` to ensure production bundle is cleanly built in `dist/`.
- Run grep checks to verify zero occurrences of "Trần Văn Kiết" in `src/` and `public/index.html`.
