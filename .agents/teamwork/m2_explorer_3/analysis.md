# KHKT Research Showcase & Pedagogical Modal — Technical Analysis

**Target Component**: `src/components/KhktShowcaseModal.js`  
**Milestone**: M2 (Navigation, Collection Explorer & KHKT Research Showcase)  
**Author**: Milestone M2 Explorer 3  
**Date**: 2026-11-07  

---

## 1. Executive Summary

This report establishes the technical specification, design system, and reference implementation for the **KHKT Research Showcase Modal** (`src/components/KhktShowcaseModal.js`), satisfying Feature F2 of the KHKT Grade 10 Math-English CLIL Web App.

The component serves as the **academic credibility centerpiece** of the entire application for judges, educators, and competition evaluators. It visualizes:
1. **Authorship & Institutional Identity**: Student author Phạm Nguyễn Ti Na (10A1), Advisor Lê Thanh Tâm, THPT Trần Văn Kiết, Chợ Lách.
2. **Circular 84/2026/TT-BGDĐT Compliance**: Mandatory academic integrity pledge and Table 6 AI usage transparency declaration.
3. **4 Theoretical Pillars**: Blum & Leiß (2007) Modeling Cycle, Goldin (2014) Multiple Representations, Coyle et al. (2010) CLIL Framework, and Mayer (2021) Multimedia Learning.
4. **Interactive 7-Step Pedagogical Cycle**: Standardized workflow diagram with Step 5 (Dual-Verification) highlighted as the quality gatekeeper.
5. **Empirical Study Data ($N=400$)**: Pre-test ($5.42 \pm 1.34$) vs Post-test ($7.85 \pm 1.12$), showing a $+2.43$ pts gain ($p < 0.001$, Cohen's $d = 1.95$), with Math English terminology experiencing the highest gain ($+40.6\%$).
6. **Pure SVG Vector Charts**: Zero-dependency, responsive dual-bar comparison chart and Likert satisfaction donut chart ($89.5\%$ satisfaction).
7. **Production Accessibility**: Complete focus trapping, ESC key listener, backdrop overlay dismissal, and ARIA dialog semantics.

---

## 2. Problem Statement & System Architecture

### 2.1 Role within Milestone M2
In Milestone M2, three core UI modules interface with the user:
- `Header.js` (Explorer 1): App branding, language toggle, and "Giới thiệu KHKT / Research Showcase" trigger button.
- `CollectionExplorer.js` (Explorer 2): Catalog browser with search, topic filtering, and dual-verification badges.
- `KhktShowcaseModal.js` (Explorer 3 - This Component): Deep research evidence modal accessible globally across all views.

```
┌────────────────────────────────────────────────────────┐
│                   Header.js (Nav)                      │
│ [Brand Crest]  [Explore] [Studio] [Giới thiệu KHKT]    │
└───────────────────────────────────────┬────────────────┘
                                        │ (Click Event)
                                        ▼
┌────────────────────────────────────────────────────────┐
│            KhktShowcaseModal.js (Singleton)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Header: Crest, Project Title, Circular 84 Tag    │  │
│  │ Author Bar: Ti Na (10A1) • GVHD Tâm • TVK School │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Tabs: [7 Bước] [N=400 Stats] [Likert] [Lý Luận]  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Tab Body: Dynamic SVG Charts, Interactive Nodes, │  │
│  │           Table 6 AI Audit, Authentic Fig Toggle │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Pedagogical & Scientific Foundations

The research is grounded in four foundational educational theories:

| Pillar | Theory | Citation | Operationalization in Web App |
|---|---|---|---|
| **1** | **Blum & Leiß Modeling Cycle** | Blum & Leiß (2007) | Structured 5-scene storyboard transitioning from real context to formal math model without premature answer revelation. |
| **2** | **Multiple Representations** | Goldin (2014) | Triad linking natural language narration $\longleftrightarrow$ dynamic spatial SVG $\longleftrightarrow$ formal equations ($CD = h$). |
| **3** | **CLIL Framework** | Coyle et al. (2010) | Math English terminology acquired in situational problem-solving with Web Speech API audio TTS and IPA phonetics. |
| **4** | **Cognitive Multimedia Learning** | Mayer (2021) | Dual-channel audio/visual synchronization, elimination of split-attention distractors, speech rate capped at 120–140 WPM. |

---

## 4. Standardized 7-Step Pedagogical Workflow

The modal features an interactive stepper diagram mapping steps B1 to B7:

```
[B1: Chọn bài toán] ──> [B2: Phân tích Toán & EN] ──> [B3: Kịch bản 5 màn]
                                                             │
[B7: Đóng gói số] <── [B6: Thử nghiệm N=20] <── [B5: Kiểm chứng 2 lớp 🔒] <── [B4: Sinh AI]
```

- **Step 1 (B1)**: Real-world problem selection (Trigonometry, Parabola, Optimization).
- **Step 2 (B2)**: Mathematical modeling decomposition & vocabulary extraction with IPA.
- **Step 3 (B3)**: 5-scene bilingual storyboard scripting.
- **Step 4 (B4)**: AI multimedia asset generation with prompt audit logging.
- **Step 5 (B5 - Gatekeeper)**: Dual-layer independent verification (Layer 1: Math Rigor + Layer 2: CLIL Linguistics). Requires 10/10 PASS before publication.
- **Step 6 (B6)**: Pilot testing ($N=20$) for speech rate (120–140 WPM) and cognitive load.
- **Step 7 (B7)**: Interactive digital courseware packaging into web app.

---

## 5. Empirical Study ($N=400$) & Quantitative Findings

Conducted with 400 Grade 10 students at THPT Trần Văn Kiết (September 7 – October 7, 2026):

### 5.1 Key Statistical Metrics
- **Sample Size ($N$)**: $400$ Grade 10 students (Experimental Group vs Control Group).
- **Pre-Test Score**: $5.42 \pm 1.34$ / 10.
- **Post-Test Score**: $7.85 \pm 1.12$ / 10.
- **Score Gain ($\Delta$)**: $+2.43$ points ($+44.8\%$ relative improvement).
- **Statistical Significance**: $p < 0.001$ (Student's paired t-test).
- **Effect Size**: Cohen's $d = 1.95$ (Massive pedagogical impact, $> 0.8$ threshold).

### 5.2 Breakdown by Cognitive Competencies

| Competency Indicator | Pre-Test | Post-Test | Gain ($\Delta$) | Pedagogical Implication |
|---|---|---|---|---|
| **1. Overall Score Average** | $5.42$ pts | $7.85$ pts | $+2.43$ pts ($+44.8\%$) | High synthesis capacity |
| **2. Fact & Context Extraction** | $58.5\%$ | $87.2\%$ | $+28.7\%$ | Eliminates premise confusion |
| **3. Mathematical Modeling** | $42.0\%$ | $76.5\%$ | $+34.5\%$ | Core GDPT 2018 competence |
| **4. Math English Application** | $31.2\%$ | $71.8\%$ | $+40.6\%$ | Highest growth via CLIL |
| **5. Real-World Interpretation** | $36.5\%$ | $69.0\%$ | $+32.5\%$ | Economic & safety evaluation |

---

## 6. Pure SVG Visual Charts Architecture

To maintain zero runtime dependencies and 100% offline reliability, all charts are generated programmatically as clean inline SVG:

### 6.1 Multi-Bar Comparison Chart (`generateEmpiricalSvgChart`)
- ViewBox: `0 0 640 230`, fully responsive with vector-scaling.
- Dual horizontal bars per metric:
  - Pre-test bar: `#cbd5e1` (Slate) with score label.
  - Post-test bar: `#2563eb` (Primary Blue) with score label.
- Vertical reference gridlines at $0\%, 25\%, 50\%, 75\%, 100\%$.
- Green badge showing positive delta values (e.g., $+40.6\%$).

### 6.2 Satisfaction Donut Chart (`generateSatisfactionDonutSvg`)
- ViewBox: `0 0 180 180`, circumference-based SVG `stroke-dasharray` & `stroke-dashoffset`.
- Proportions:
  - $68.0\%$ High Interest & Confidence (Emerald `#10b981`)
  - $24.0\%$ Clear Understanding (Blue `#3b82f6`)
  - $8.0\%$ Neutral / Needs Improvement (Amber `#f59e0b`)
- Center cutout with aggregate satisfaction rating: **$89.5\%$**.

---

## 7. Circular 84/2026/TT-BGDĐT AI Disclosure & Academic Integrity

The modal enforces strict compliance with Circular 84 (Section 7, Table 6):

| AI Tool | Purpose | AI Assistive Role | Student Direct Verification Role |
|---|---|---|---|
| **ChatGPT / Claude 3.5** | Script ideation & bilingual vocabulary | Drafts rough scenes and translation suggestions | Student solves formulas, verifies rigor, edits scripts, checks math lexicons |
| **Midjourney / DALL-E 3** | 2D/3D real-world visual context | Generates conceptual scenes based on prompts | Student crafts mathematical prompts, removes visual clutter/distractors |
| **ElevenLabs / HeyGen** | Audio voiceover & bilingual lip-sync | Synthesizes natural pronunciation | Student monitors WPM (120–140), validates phonetics and subtitles |
| **Microsoft Excel / SPSS** | Empirical statistical processing | Computes t-test, mean, standard deviation | Student inputs raw exam data, verifies data veracity and honesty |

---

## 8. Modal Open/Close Controls & Accessibility Matrix

| Control / Event | Mechanism | Behavior |
|---|---|---|
| **Escape Key (`keydown`)** | `e.key === 'Escape'` | Closes modal immediately, restores focus to previous active element |
| **Backdrop Click** | `e.target === backdropEl` | Closes modal if user clicks outside the dialog card |
| **Close Button ('✕')** | Button click | Explicit close action with `aria-label="Đóng hộp thoại giới thiệu KHKT"` |
| **Focus Trapping** | `Tab` / `Shift+Tab` | Cycles focus strictly between modal interactive elements |
| **Body Scroll Lock** | `document.body.style.overflow = 'hidden'` | Prevents background page scrolling while modal is active |
| **Semantic ARIA** | `role="dialog"`, `aria-modal="true"` | Screen readers announce modal dialog with title reference |

---

## 9. Boundary Condition Handling (Tier 2 Boundaries)

The proposed code implements dedicated utility functions validating edge cases:
- `F2.B1`: `computeSurveyAverage([])` returns `0.0` safely without `NaN`.
- `F2.B2`: `calcConfidenceInterval(0)` and `calcConfidenceInterval(1000000)` execute without division-by-zero or numeric overflow.
- `F2.B3`: `clampScore(-2.5)` clamps to `0.0`, `clampScore(12.5)` clamps to `10.0`.
- `F2.B4`: `validateGain(-150)` returns `false`, `validateGain(40.6)` returns `true`.
- `F2.B5`: `validateAiDisclosureItem` validates presence of tool name and student verification.

---

## 10. Integration Contract

The modal is instantiated and triggered via:
```javascript
// Method 1: Global static call from Header.js or any button
import { KhktShowcaseModal } from './components/KhktShowcaseModal.js';
KhktShowcaseModal.open('pedagogy'); // or 'empirical', 'survey', 'theory', 'circular84'

// Method 2: Instance lifecycle
const modal = new KhktShowcaseModal({ container: document.body });
modal.open();
modal.close();
```
