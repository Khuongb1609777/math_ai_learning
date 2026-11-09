# Project: Math-English CLIL Practical Mathematics Web App (Grade 10 - KHKT)

## Architecture

### System Overview
A zero-external-dependency, offline-first, client-side Single Page Application (SPA) designed to introduce Grade 10 students to practical mathematics integrated with English (CLIL - Content and Language Integrated Learning). The application showcases the research results of the KHKT project, featuring a standardized 7-step pedagogical cycle and 5-scene bilingual storyboard format.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Container / Router                          │
└──────────────┬──────────────────────────┬──────────────────────────────┘
               │                          │
       ┌───────▼────────┐        ┌────────▼────────┐
       │ Navigation/Nav │        │ KHKT Showcase   │
       └───────┬────────┘        └─────────────────┘
               │
    ┌──────────┴───────────────────────────┬────────────────────────────┐
    │                                      │                            │
┌───▼─────────────────────┐  ┌─────────────▼───────────┐  ┌─────────────▼───────────┐
│ Collection Explorer (R1)│  │ 5-Scene Player (R2)     │  │ Authoring & 2-Layer     │
│ - 3 Core Math Topics    │  │ - 5 Bilingual Scenes    │  │   Verification (R4)     │
│ - Search & Filter       │  │ - Web Speech Audio TTS  │  │ - 5-Scene Lesson Editor │
│ - Dual Verification Badg│  │ - Dynamic SVG Simulation│  │ - 10-Criteria Checklist │
└─────────────────────────┘  └─────────────┬───────────┘  │ - Publish Gate & Cert   │
                                           │              └─────────────────────────┘
                             ┌─────────────▼───────────┐
                             │ Interactive Quiz (R3)   │
                             │ - 3 Cognitive Tiers     │
                             │ - Instant Feedback      │
                             │ - 10-Pt Scoring & Survey│
                             └─────────────────────────┘
```

### Core Architectural Decisions
1. **Zero External Dependencies**: Built with modern standard ES Modules (ES6+), native CSS tokens (Tailwind aesthetic), inline SVG icons (Lucide-compatible), and standard browser APIs (`window.speechSynthesis`, `localStorage`). Runs 100% offline without cloud credentials.
2. **Server & Test Infrastructure**: Native Node.js HTTP server (`node:http`) in `server.js` and Node's built-in test runner (`node --test`) for deterministic mathematical and validation testing.
3. **Dual Verification Architecture**: Strict programmatic validation gate enforcing 100% PASS on Layer 1 (Math Rigor) and Layer 2 (CLIL Linguistics) before any lesson can be published or exported.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Grade 10 Math Problem Collection Explorer | Browse, search, topic filter (Trigonometry, Quadratic functions, Optimization), difficulty badges, dual verification status badges | M2 | R1, Survey |
| F2 | KHKT Research Showcase & Pedagogy Modal | Sơ đồ quy trình 7 bước (Hình 1), empirical study data (N=400, +2.43 pts, Hình 3, Hình 4), circular 84/2026/TT-BGDĐT declaration | M2 | R1, Spec Miner |
| F3 | 5-Scene Bilingual Multimedia Player | Standardized scene sequence: Bối cảnh (Context) -> Dữ kiện (Data) -> Vấn đề & Từ vựng (Problem & Vocab) -> Gợi mở (Modeling Guidance) -> Thực hành (Practice) with progress stepper | M3 | R2, Survey |
| F4 | Bilingual Language Switcher | VI / EN / Dual side-by-side mode toggle for all 5 scenes with synchronized subtitles | M3 | R2, Survey |
| F5 | Interactive Math English Glossary & Pronunciation | Interactive table with IPA phonetics, bilingual definitions, contextual examples, and native Web Speech API audio TTS | M3 | R2, Spec Miner |
| F6 | Interactive Dynamic Visual Simulations | SVG/Canvas parameter-driven models: Lighthouse triangulation ray-tracer, Parabolic Arch vehicle height clearance test, Cho Lach Bus Revenue profit curve vertex finder | M3 | R2, Spec Miner |
| F7 | Interactive Worksheets & Multi-Tier Quizzes | 3 question categories per lesson: Fact extraction, Mathematical modeling, and Math English terminology | M4 | R3, Survey |
| F8 | Automated 10-Point Scoring & Scaffolded Feedback | Instant scoring out of 10 with step-by-step cognitive explanations and misconception correction | M4 | R3, Survey |
| F9 | Pedagogical Learner Survey | 5-point Likert scale survey on interest and confidence replicating KHKT research instrument | M4 | R3, Spec Miner |
| F10 | 5-Scene Lesson Authoring Studio | Form editor to create and edit 5-scene bilingual scripts, math data, formulas, and vocabulary lists | M5 | R4, Survey |
| F11 | Dual-Layer Independent Verification Matrix | 10-criteria inspection matrix: Layer 1 (5 Math criteria) and Layer 2 (5 English criteria) based on KHKT Table 3 | M5 | R4, Spec Miner |
| F12 | Programmatic Publishing Gate & Certificate Generator | Strict gate blocking publication unless 10/10 criteria pass; generates exportable KHKT Quality Certificate | M5 | R4, Survey |
| F13 | Client-Side Storage & Data Management | LocalStorage persistence with JSON backup, export, and import for all lessons and verification logs | M1 | R4, R5, Workspace |
| F14 | Responsive, Standalone Web Architecture | Mobile/desktop responsive layout, clean CSS design system, typography for LaTeX-style math formulas | M1 | R5, Workspace |
| F15 | High-Resolution KHKT Media Asset Pipeline | Python extraction script to extract images 1-5 from `KHKT-Ti Na.docx` into `public/assets/khkt/` | M1 | R5, Workspace |
| F16 | Local Zero-Dependency Server & Automated Test Suite | `server.js` with static file serving, MIME handling, and unit test runner using `node:test` | M1 | R5, Workspace |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation, Asset Pipeline & Core Data Models | Extract DOCX media assets; define TypeScript/JSDoc lesson schemas; implement 3 complete KHKT sample lesson datasets; build storage manager; build static server & unit test setup | none | DONE |
| M2 | Navigation, Collection Explorer & KHKT Research Showcase | Responsive Header/Nav; Topic filter (Trigonometry, Quadratic, Optimization); search; lesson cards with dual verification badges; KHKT Research Showcase modal (7-step diagram, N=400 empirical graphs) | M1 | DONE |
| M3 | 5-Scene Bilingual Multimedia Player & Dynamic Simulations | 5-Scene player stepper; VI/EN/Dual toggles; Web Speech API audio pronunciation with IPA glossary; dynamic SVG visual simulations (Lighthouse, Parabolic Arch, Bus Revenue) | M1, M2 | IN_PROGRESS |
| M4 | Interactive Worksheets, 10-Point Scoring & Instant Feedback | 3 question types (facts, modeling, vocabulary); auto scoring out of 10; scaffolded explanations; 5-point Likert survey; student result history | M1, M3 | PLANNED |
| M5 | Authoring Studio, Dual-Layer Verification Matrix & Publishing Gate | 5-scene bilingual lesson editor; vocabulary manager; 10-criteria 2-layer verification matrix; strict 10/10 PASS publishing gate; JSON import/export & certificate generator | M1, M4 | PLANNED |
| M6 | Final Milestone: 100% E2E Test Pass & Adversarial Hardening | Phase 1: Pass 100% of E2E Test Suite (Tiers 1-4) published by E2E Testing Track. Phase 2: Adversarial coverage hardening (Tier 5) | M1-M5, TEST_READY | PLANNED |

---

## Interface Contracts

### 1. Data Model (`src/data/types.js` & `src/data/lessons.js`)
```javascript
/**
 * @typedef {Object} VocabularyItem
 * @property {string} term - e.g., "Law of Sines"
 * @property {string} phonetics - e.g., "/lɔː əv saɪnz/"
 * @property {string} partOfSpeech - e.g., "noun phrase"
 * @property {string} definitionVi - Vietnamese definition
 * @property {string} definitionEn - English definition
 * @property {string} exampleSentence - Bilingual example sentence
 *
 * @typedef {Object} Scene
 * @property {number} id - 1 to 5
 * @property {string} key - 'context' | 'facts' | 'problem' | 'guidance' | 'practice'
 * @property {string} titleVi - e.g., "Bối cảnh thực tế"
 * @property {string} titleEn - e.g., "Real-world Context"
 * @property {string} contentVi - Rich narrative in Vietnamese
 * @property {string} contentEn - Rich narrative in English
 * @property {string[]} formulas - Mathematical expressions
 * @property {string} [interactiveType] - 'svg-lighthouse' | 'svg-parabola' | 'svg-optimization'
 *
 * @typedef {Object} QuizQuestion
 * @property {string} id - e.g., "q1"
 * @property {'fact_extraction' | 'modeling' | 'math_english'} type
 * @property {string} questionVi
 * @property {string} questionEn
 * @property {string[]} optionsVi
 * @property {string[]} optionsEn
 * @property {number} correctIndex - 0-indexed
 * @property {string} explanationVi
 * @property {string} explanationEn
 *
 * @typedef {Object} VerificationCriterion
 * @property {string} id - e.g., "M1", "E1"
 * @property {'math' | 'english'} layer
 * @property {string} titleVi
 * @property {string} titleEn
 * @property {string} descriptionVi
 * @property {string} descriptionEn
 * @property {boolean} passed
 * @property {string} verifiedBy
 * @property {string} notes
 *
 * @typedef {Object} Lesson
 * @property {string} id - e.g., "lesson-lighthouse"
 * @property {string} topic - 'trigonometry' | 'quadratic' | 'optimization'
 * @property {string} titleVi
 * @property {string} titleEn
 * @property {string} grade - "10"
 * @property {string} difficulty - "Medium" | "Hard"
 * @property {string} thumbnail - URL or asset path
 * @property {Scene[]} scenes - Exactly 5 scenes
 * @property {VocabularyItem[]} vocabulary
 * @property {QuizQuestion[]} quiz
 * @property {VerificationCriterion[]} verification
 * @property {'DRAFT' | 'VERIFIED' | 'PUBLISHED'} status
 */
```

### 2. Storage Service (`src/services/storage.js`)
- `getLessons()`: Returns Array of all lessons (merges default KHKT lessons with user-authored lessons from LocalStorage).
- `getLessonById(id)`: Returns single lesson.
- `saveLesson(lesson)`: Validates and persists custom lesson in LocalStorage.
- `deleteLesson(id)`: Removes custom lesson (prevents deletion of default KHKT sample lessons).
- `exportLessonsJSON()`: Returns stringified JSON of all lessons.
- `importLessonsJSON(jsonString)`: Validates and restores lessons.
- `getQuizResult(lessonId)`: Returns saved score and completed answers.
- `saveQuizResult(lessonId, result)`: Persists quiz score out of 10.

### 3. Speech Service (`src/services/speech.js`)
- `speak(text, lang = 'en-US')`: Speaks text using `window.speechSynthesis` with graceful fallback.
- `stop()`: Cancels current speech utterance.
- `isSupported()`: Returns boolean indicating browser support.

### 4. Verification Engine (`src/services/verification.js`)
- `evaluateCriteria(lesson)`: Evaluates 10 criteria (5 Math + 5 English).
- `canPublish(verificationResults)`: Returns true only if all 10 criteria evaluate to `passed === true`.
- `generateCertificate(lesson)`: Returns verification certificate metadata.

---

## Code Layout

```
math_english_ai_learn/
├── server.js                      # Native Node.js static HTTP server (port 3000)
├── package.json                   # Project metadata & npm test command
├── extract_assets.py              # Script to extract media from KHKT-Ti Na.docx
├── public/
│   ├── index.html                 # Main SPA entrypoint
│   └── assets/
│       ├── khkt/                  # Extracted KHKT research images (image1-image5)
│       └── css/
│           └── style.css          # Design system & Tailwind-inspired tokens
├── src/
│   ├── app.js                     # Main SPA controller & router
│   ├── data/
│   │   ├── types.js               # JSDoc type contracts
│   │   ├── khkt_data.js           # KHKT research data (7-step, N=400 empirical stats)
│   │   ├── lessons.js             # 3 Complete Grade 10 real-world lessons
│   │   └── verification_rules.js  # 10 Verification criteria definitions
│   ├── services/
│   │   ├── storage.js             # LocalStorage & JSON backup service
│   │   ├── speech.js              # Web Speech API audio TTS service
│   │   └── verification.js        # 2-Layer verification engine & gatekeeper
│   └── components/
│       ├── Header.js              # App navigation & branding
│       ├── CollectionExplorer.js  # R1: Lesson search, filter & card grid
│       ├── KhktShowcaseModal.js   # R1: KHKT research methodology & charts modal
│       ├── LessonPlayer.js        # R2: 5-scene bilingual multimedia player
│       ├── VocabularyTable.js     # R2: Interactive glossary with speech TTS
│       ├── MathSimulations.js     # R2: Interactive SVG simulations (Lighthouse, Parabola, Bus)
│       ├── WorksheetQuiz.js       # R3: Interactive quiz with 10-point scoring
│       ├── LearnerSurvey.js       # R3: 5-point Likert learner survey
│       ├── AuthoringStudio.js     # R4: 5-scene lesson editor & vocab manager
│       └── VerificationMatrix.js  # R4: 2-layer verification matrix & publish gate
└── tests/
    ├── math_models.test.js        # Mathematical accuracy unit tests
    ├── verification.test.js       # 2-layer verification gate unit tests
    ├── quiz_scoring.test.js       # 10-point quiz scoring unit tests
    └── e2e/                       # E2E Testing Track test suites (Tiers 1-4)
```
