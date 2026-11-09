## 2026-11-09T14:33:26Z
You are std_explorer_2, a teamwork_explorer.
Working directory: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/std_explorer_2

MANDATORY FIRST STEP:
Read /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md.

YOUR FOCUS: Requirement R2 - Chuẩn hóa nội dung, gỡ bỏ thông tin đích danh và cập nhật điều hướng.
Task details:
- Perform an exhaustive grep / search across the entire repository (`src/`, `public/`, `tests/`, `index.html`, etc.) for all occurrences of specific naming and branding:
  1. "THPT Trần Văn Kiết" / "Trường THPT Trần Văn Kiết"
  2. "Vĩnh Long"
  3. "Bến Tre"
  4. "Cuộc thi Nghiên cứu Khoa học Kỹ thuật" / "KHKT" / "KHKT 2026-2027" / "Dự án KHKT"
  5. "Phạm Nguyễn Ti Na" / "10A1"
  6. "Lê Thanh Tâm"
  7. "Thông tư 84/2026/TT-BGDĐT"
  8. Navigation tab "Giới thiệu đề án" (both desktop navigation and mobile drawer / menu)
- Formulate standardized replacement text for every occurrence:
  * Brand as standard Grade 10 Math - English (CLIL) learning platform ("Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn"), generalized without referencing any specific school, competition, student, or teacher.
  * Rename navigation tab to "Giới thiệu phương pháp" (across Header desktop menu, mobile menu, aria-labels, and route handlers).
  * Check modal / showcase views (e.g. `ResearchShowcaseModal.js` or similar) that present the methodology, ensuring they explain the CLIL 5-scene methodology generically and professionally.
- Check all test files in `tests/` that check for these exact strings, and prepare the exact replacements for test assertions.
- Formulate a precise implementation plan with exact file paths, line numbers, and replacement text.
- Write your complete findings, evidence chains, and plan to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/std_explorer_2/handoff.md`.
- Notify the orchestrator when finished via send_message.
