## 2026-11-07T07:09:13Z
From: 87074200-71b1-4f5c-8806-1baad93026e9 (orchestrator / parent)
To: m1_explorer_1
Priority: MESSAGE_PRIORITY_HIGH

You are M1 Explorer 1 (Data & Schema Explorer) for Milestone M1 (Foundation, Asset Pipeline & Core Data Models).
Your working directory is: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_explorer_1/
You MUST read the original request at: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md
You MUST read the project scope document at: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md
You can also consult `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/spec_miner_khkt/spec_report.md`.

Your mission:
Investigate and design complete implementation blueprints for the core data models of Milestone M1:
1. `src/data/types.js`: Complete JSDoc type definitions for VocabularyItem, Scene, QuizQuestion, VerificationCriterion, Lesson, QuizResult.
2. `src/data/khkt_data.js`: Research background data from KHKT project (project title, authors, advisor, school, circular 84 declaration, 7-step pedagogical cycle with step titles & descriptions, N=400 empirical study data with pre/post-test scores +2.43 pts, satisfaction rates, and image asset references).
3. `src/data/lessons.js`: The 3 complete Grade 10 real-world math lessons:
   - Lesson 1 (Trigonometry): Hải đăng & Hệ thức lượng trong tam giác ($AB=30\text{ m}, \alpha=42^\circ, \beta=63^\circ, \widehat{ADB}=21^\circ, CD \approx 49.9\text{ m}$).
   - Lesson 2 (Quadratic): Cổng Parabol & Giới hạn chiều cao xe ($L=8\text{ m}, H=6\text{ m}, w=4\text{ m}, y(2)=4.5\text{ m} > 4.2\text{ m}$).
   - Lesson 3 (Optimization): Tối ưu hóa doanh thu xe buýt du lịch Chợ Lách ($P_0=200{,}000, Q_0=60, \Delta P=10{,}000, \Delta Q=5, x=4, P^*=160{,}000, R^*=12{,}800{,}000$).
   Each lesson must contain:
   - Full 5-scene bilingual scripts (Context, Facts, Problem & Vocab, Modeling Guidance, Practice).
   - Rich vocabulary items (term, IPA phonetics, part of speech, Vietnamese & English definitions, bilingual example sentence).
   - 5 quiz questions spanning fact extraction, mathematical modeling, and Math English terminology with detailed explanations.
   - Initial 10 verification criteria.
4. `src/data/verification_rules.js`: Standard definitions of the 10 verification criteria (5 Math + 5 English).

Write your blueprint to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_explorer_1/analysis.md` and handoff to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_explorer_1/handoff.md`.
Update your `progress.md` periodically. When finished, send a completion message to the caller.
