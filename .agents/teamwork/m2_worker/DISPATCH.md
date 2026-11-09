# DISPATCH: Milestone M2 Implementation Worker

**Milestone**: M2 (Navigation, Collection Explorer & KHKT Research Showcase)
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_worker`
**Target Workspace**: `/Users/mac/Desktop/math_english_ai_learn`
**Reference Documents**:
- Original User Request: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md`
- Project Document: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md`
- Explorer 1 Report (Header & App Router): `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_1/handoff.md` and `analysis.md`
- Explorer 2 Report (Collection Explorer & Badges): `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_2/handoff.md` and `analysis.md`
- Explorer 3 Report (KHKT Showcase Modal): `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_3/handoff.md` and `proposed_KhktShowcaseModal.js`, `proposed_khkt_data_patch.js`

---

## 1. Exclusive File Write Ownership

You have exclusive write ownership over the following 6 files:
1. `src/components/Header.js`
2. `src/components/CollectionExplorer.js`
3. `src/components/KhktShowcaseModal.js`
4. `src/app.js`
5. `src/data/khkt_data.js`
6. `public/assets/css/style.css`

You MUST NOT modify any other implementation files.

---

## 2. Mandatory Integrity Warning

> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A teamwork_auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.

---

## 3. Implementation Requirements

### Task 1: `src/components/Header.js`
Implement the Header component from Section 4.1 of `.agents/teamwork/m2_explorer_1/analysis.md`.
Requirements:
- Brand title: `MATH ENGLISH AI LEARN / DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT`.
- Navigation tabs: `explore` (Khám phá bài học), `studio` (Biên soạn), `showcase` (Giới thiệu KHKT), `survey` (Khảo sát).
- Language toggle: `VI`, `EN`, `DUAL` with persistent active state.
- Responsive mobile hamburger menu and collapsible mobile drawer with touch targets >= 44px.
- Zero-CDN inline SVGs.

### Task 2: `src/components/CollectionExplorer.js`
Implement the Collection Explorer component from Section 4 of `.agents/teamwork/m2_explorer_2/handoff.md`.
Requirements:
- Search input with safe string normalization (immune to regex/injection).
- Topic filter buttons: All, Trigonometry / Hệ thức lượng, Quadratic / Hàm số bậc hai, Optimization / Tối ưu hóa.
- Difficulty select filter: All, Basic, Medium, Hard.
- Lesson card rendering with thumbnail images from `/assets/khkt/image1.png` etc.
- Dual-layer verification badges (`Math Rigor Passed`, `CLIL English Passed`, `100% KHKT Verified`, `Draft`).
- "Bắt đầu học / Start Lesson" button dispatching `lesson-select` CustomEvent and invoking `onSelectLesson`.
- Export pure functions `filterLessons` and `getLessonBadges`.

### Task 3: `src/components/KhktShowcaseModal.js`
Implement the KHKT Showcase Modal component from `.agents/teamwork/m2_explorer_3/proposed_KhktShowcaseModal.js`.
Requirements:
- Authorship & Circular 84 declaration (Phạm Nguyễn Ti Na, Lê Thanh Tâm, THPT Trần Văn Kiết).
- 4 Theoretical foundations (Blum, Goldin, Coyle, Mayer).
- 7-Step Pedagogical Cycle interactive stepper.
- Empirical statistics ($N=400$, $+2.43$ pts gain, $p < 0.001$, Cohen's $d = 1.95$).
- Zero-dependency inline SVG comparison charts and satisfaction donut chart.
- Accessibility: ESC key dismiss, backdrop click, focus trap, ARIA dialog attributes.

### Task 4: `src/data/khkt_data.js`
Append the export aliases from `.agents/teamwork/m2_explorer_3/proposed_khkt_data_patch.js` to the end of `src/data/khkt_data.js`:
- `pedagogicalSteps = SEVEN_STEP_PEDAGOGY;`
- `empiricalData = EMPIRICAL_STUDY;`
- `theoreticalPillars = SCIENTIFIC_FOUNDATIONS;`
- `aiDisclosure = AI_DISCLOSURE_DECLARATION;`
- `surveyStatements = LIKERT_SURVEY_STATEMENTS;`
- default export of `KHKT_METADATA`.

### Task 5: `src/app.js`
Implement the SPA orchestrator and router from Section 4.2 of `.agents/teamwork/m2_explorer_1/analysis.md`.
Requirements:
- Mount Header, render CollectionExplorer into `#app-content`.
- Initialize `user_settings` with `{ theme: 'light', lang: 'dual' }` when empty (satisfies test `F14.B5`).
- Listen for `modal:open-showcase` to open `KhktShowcaseModal`.
- Listen for `lesson-select` to transition to the lesson view.
- Max-width containment capped at 1440px / `max-w-7xl` (satisfies test `F14.B2`).

### Task 6: `public/assets/css/style.css`
Append the CSS extensions from Section 4.3 of `.agents/teamwork/m2_explorer_1/analysis.md` (mobile drawer, badge tokens, responsive utilities).

---

## 4. Verification Requirements

After implementing all files, you MUST run:
1. `npm test`
   - All unit & adversarial test suites must pass (100% PASS, 0 failures).
2. `node tests/e2e/runner.js`
   - All 175 E2E tests across Tiers 1-4 and Features F1-F16 must pass with exit code 0!
3. `node tests/e2e/runner.js --feature=F1` and `node tests/e2e/runner.js --feature=F2`
   - Both feature test suites must pass 10/10.

Write your report to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_worker/handoff.md`.
Then notify the orchestrator via `send_message`.


## 2026-11-07T08:12:19Z
Received message from 87074200-71b1-4f5c-8806-1baad93026e9:
You are Milestone M2 Implementation Worker.
Your working directory is: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_worker`
Your DISPATCH file is at: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_worker/DISPATCH.md`
Implement all 6 files according to `DISPATCH.md` using the exact drop-in code prepared by:
- `m2_explorer_1`: Header.js, app.js, and CSS extensions in `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_1/analysis.md`
- `m2_explorer_2`: CollectionExplorer.js in `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_2/handoff.md`
- `m2_explorer_3`: KhktShowcaseModal.js in `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_3/proposed_KhktShowcaseModal.js` and khkt_data patch in `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m2_explorer_3/proposed_khkt_data_patch.js`
