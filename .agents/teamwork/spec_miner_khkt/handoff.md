# HANDOFF REPORT — SPECIFICATION MINER (KHKT MATH-ENGLISH CLIL)

## 1. Observation
- **Authoritative Source Documents**:
  - `extracted_doc.txt` (30,501 bytes, 367 lines) and `KHKT-Ti Na.docx` (4,792,171 bytes, containing 7 tables and 5 embedded high-resolution graphics in `word/media/image[1-5].png`).
  - Author: Phạm Nguyễn Ti Na, Grade 10A1, Trần Văn Kiết High School, Vĩnh Long; Research Advisor: Lê Thanh Tâm.
  - Competition: Cuộc thi Nghiên cứu Khoa học Kỹ thuật năm học 2026 – 2027 (Thông tư 84/2026/TT-BGDĐT).
- **Exact Pedagogical Framework (Section 2.1, Lines 104-109)**:
  - 3 theoretical pillars: (1) Blum & Leiß Mathematical Modelling Cycle (2007), (2) Goldin Multiple Representations Theory (2014), (3) CLIL Framework (Coyle, Hood & Marsh, 2010).
- **Standardized 7-Step Workflow (Section 3.1, Lines 134-144 & `image2.png`)**:
  - Step 1: Lựa chọn bài toán thực tế (Chuyển động parabol, tối ưu doanh thu, đo chiều cao/khoảng cách lượng giác).
  - Step 2: Phân tích toán học & Tiếng Anh chuyên ngành (Math Vocabulary List).
  - Step 3: Viết kịch bản phân cảnh song ngữ (5 phân cảnh).
  - Step 4: Khởi tạo nội dung bằng công cụ AI (Midjourney/DALL-E 3, ElevenLabs, HeyGen/CapCut; lưu trữ prompt).
  - Step 5: Kiểm chứng 2 lớp (Dual-verification: Toán học & Ngôn ngữ).
  - Step 6: Thử nghiệm diện hẹp (Pilot test trên 20 học sinh).
  - Step 7: Đóng gói học liệu số.
- **5-Scene Bilingual Storyboard Structure (Section 3.2, Lines 145-183 & `image3.png`)**:
  - Scene 1: Bối cảnh (Mở đầu / Introduction) — Inaccessible base lighthouse cliff context.
  - Scene 2: Dữ kiện (Data) — Measurements $AB = 30\text{ m}$, $\widehat{CAD} = 42^\circ$, $\widehat{CBD} = 63^\circ$.
  - Scene 3: Vấn đề & Tiếng Anh (Problem & English) — Goal $CD$ via Law of Sines in $\Delta ABD$, vocabulary box.
  - Scene 4: Gợi mở (Guiding) — Exterior angle $\widehat{ADB} = 63^\circ - 42^\circ = 21^\circ$, formula $\frac{BD}{\sin 42^\circ} = \frac{AB}{\sin 21^\circ}$; does not give final numerical answer.
  - Scene 5: Kết thúc & Thực hành (Practice) — Right triangle $BCD$, $CD = BD \cdot \sin 63^\circ$, call to action for worksheet.
- **2-Layer Verification Checklist (Section 3.3, Table 3, Lines 184-208)**:
  - 6 general criteria: Absolute mathematical accuracy (100%), Math English accuracy (100%), Visual clarity without distraction (100%), HD 1080p audio/video/subtitles (100%), Full scripts & solutions (100%), Transparent AI Prompt history log (100%).
  - Expanded into 10 software verification rules in `spec_report.md` (5 for Math, 5 for English).
- **Pedagogical Empirical Data (Section 4.2, Table 4, Lines 212-250 & `image4.png`, `image5.png`)**:
  - $N = 400$ Grade 10 students at Trần Văn Kiết High School.
  - Average score improved from 5.42 to 7.85 (+2.43 points, $p < 0.001$).
  - Model formulation improved by +34.5% (42.0% to 76.5%).
  - Math English terminology usage improved by +40.6% (31.2% to 71.8%).
  - Positive evaluation: 92% (68% very interested & confident, 24% interested & comprehending).

## 2. Logic Chain
1. *Observation*: The KHKT research report by Phạm Nguyễn Ti Na is the authoritative scientific basis for the application, establishing that high school students struggle with translating natural language context into mathematical models while lacking English terminology.
2. *Inference*: To address this, the application must not just be a static quiz site, but an interactive visual learning system implementing the 5-scene bilingual storyboard and the 7-step pedagogical cycle.
3. *Observation*: Section 3.2 provides the complete exemplar data for the Lighthouse problem ($AB = 30\text{ m}$, angles $42^\circ$ and $63^\circ$), while Section 1.3 and Section 3.1 specify Parabolic motion / arch and Revenue optimization as the other core Grade 10 real-world topics.
4. *Inference*: In `spec_report.md`, all 3 datasets are comprehensively formalized with exact integer and standard values, coordinate systems, derivations (Blum & Leiß steps), bilingual narratives, full IPA phonetics, and 5 quiz items per topic.
5. *Observation*: Circular 84/2026/TT-BGDĐT and Section 3.3 mandate strict 2-layer verification (Math accuracy & English accuracy) plus AI prompt transparency.
6. *Inference*: The authoring tool on the Web App must implement a Dual-Layer Verification Checklist with a Publish Blocker that prevents publishing unless all criteria are marked PASS.

## 3. Caveats
- The original docx provided the full 5-scene script table for the Lighthouse problem, while describing the Parabolic Arch and Revenue Optimization problems as part of the broader 15-video curriculum library. The exact numerical parameters and step-by-step models for Parabolic Arch ($L = 8\text{ m}, H = 6\text{ m}, w = 4\text{ m}, y(2) = 4.5\text{ m}$) and Cho Lach Tourism Bus Revenue ($P_0 = 200{,}000, Q_0 = 60, \Delta P = 10{,}000, \Delta Q = 5, x_V = 4, P^* = 160{,}000, R^* = 12{,}800{,}000$) were synthesized using standard Grade 10 curriculum problem archetypes and localized context from Cho Lach, Vinh Long.
- Web Speech API support varies across browsers (Chrome/Safari have native support; Firefox desktop may require system voices). A fallback audio/text mechanism was specified.

## 4. Conclusion
The specification mining process has completely uncovered, verified, and structured all required specifications for the KHKT Math-English CLIL Web App into:
`/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/spec_miner_khkt/spec_report.md`
The report contains:
1. Theoretical foundations & empirical study statistics ($N = 400$, $+2.43$ score improvement).
2. The 7-step pedagogical workflow.
3. The standardized 5-scene bilingual storyboard format.
4. 3 complete Grade 10 real-world problem datasets (Lighthouse, Parabolic arch, Revenue optimization) with full 5-scene scripts, formulas, calculations, vocabulary (IPA, definitions), and quiz items.
5. The 10-criteria 2-layer verification matrix (Math & English) with Publish Blocker mechanics.
6. Interactive worksheet/quiz architecture with 3-tier scaffolded feedback and Likert 5-point survey.
7. Features Discovered table (16 features) and Edge Cases table (10 edge cases).

## 5. Verification Method
- **Inspect Generated Specification**:
  `cat /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/spec_miner_khkt/spec_report.md`
- **Verify Consistency with KHKT Doc**:
  Cross-check Section 4 (Lighthouse) with `extracted_doc.txt` lines 149-183 and Figure 2 (`image3.png`).
- **Mathematical Correctness Check**:
  - Problem 1: $BD = 30 \cdot \frac{\sin 42^\circ}{\sin 21^\circ} \approx 55.9868\text{ m}$; $CD = 55.9868 \cdot \sin 63^\circ \approx 49.8847\text{ m} \approx 49.9\text{ m}$.
  - Problem 2: Parabola $y = -0.375x^2 + 6$; at $x = 2$, $y(2) = -0.375(4) + 6 = 4.5\text{ m} > 4.2\text{ m}$ (safe clearance $0.3\text{ m}$).
  - Problem 3: $R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000$; vertex at $x = -\frac{400{,}000}{2(-50{,}000)} = 4$; optimal ticket price $160{,}000\text{ VNĐ}$, maximum revenue $12{,}800{,}000\text{ VNĐ}$.
