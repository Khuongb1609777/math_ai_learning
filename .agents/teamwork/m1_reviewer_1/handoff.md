# Milestone M1 Review & Adversarial Challenge Report

## Review Summary

**Verdict**: **REQUEST_CHANGES**

**Reviewer**: Reviewer 1 (Roles: reviewer, critic)  
**Milestone**: M1 (Foundation, Asset Pipeline & Core Data Models)  
**Target Deliverables**:
- `src/data/types.js`
- `src/data/khkt_data.js`
- `src/data/verification_rules.js`
- `src/data/lessons.js`
- `src/services/storage.js`
- `src/services/speech.js`
- `src/services/verification.js`

---

## 1. Observation

### 1.1 Verification Command Execution Results

#### A. Command: `npm test` (`node --test tests/*.test.js tests/**/*.test.js`)
Result: **PASS (37/37 tests)**
```text
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier1_features.test.js (104.43491ms)
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier2_boundaries.test.js (100.577042ms)
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier3_pairwise.test.js (100.170978ms)
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier4_scenarios.test.js (100.184461ms)
▶ KHKT Lesson 1 Math Model: Lighthouse Inaccessible Base Triangulation (6.36386ms)
▶ KHKT Lesson 2 Math Model: Parabolic Entrance Arch & Truck Clearance (2.547709ms)
▶ KHKT Lesson 3 Math Model: Cho Lach Bus Revenue Optimization (2.398193ms)
▶ Dual-Layer Verification Engine: Criteria Structure (4.011743ms)
▶ Dual-Layer Verification Engine: Automated Evaluation (5.982237ms)
▶ Dual-Layer Verification Engine: Publishing Gate Enforcement (2.758417ms)
▶ Dual-Layer Verification Engine: Diagnostic Report & Certificates (2.220765ms)
ℹ tests 37
ℹ suites 7
ℹ pass 37
ℹ fail 0
```
*Crucial Observation*: The files `tests/e2e/*.test.js` import the custom test runner function `test` from `./runner.js`, NOT `node:test`. When executed under Node's native test runner (`node --test`), `node:test` registers **0 tests** inside `tests/e2e/*.test.js` and reports a false-positive `✔` instant pass.

#### B. Command: `node tests/e2e/runner.js`
Result: **FAILED (Exit code 1, 28 OF 175 TESTS FAILED)**
```text
================================================================
   E2E TEST RUNNER — MATH-ENGLISH CLIL WEB APP (GRADE 10 - KHKT) 
================================================================
Project Root: /Users/mac/Desktop/math_english_ai_learn
Filters: tier=all, feature=all, grep=none

Discovered 175 tests. Running 175 selected tests...

FFFFF.....FFFFFFFFFFFFFFF.....FFFFF...............  [50/175]
......F..FF.......................................  [100/175]
..................................................  [150/175]
.........................  [175/175]

================================================================
                       FAILURE DIAGNOSTICS                      
================================================================

1) [T1:F1] F1.1: Default collection contains at least 3 Grade 10 real-world lessons
   Tier: 1 | Feature: F1
   Error: lessons must be an array

2) [T1:F1] F1.2: Lessons cover the 3 core required topics: trigonometry, quadratic, optimization
   Tier: 1 | Feature: F1
   Error: Cannot read properties of undefined (reading 'map')

3) [T1:F1] F1.3: Lesson search query matches titles and keywords in Vietnamese and English
   Tier: 1 | Feature: F1
   Error: Cannot read properties of undefined (reading 'filter')

4) [T1:F1] F1.4: Topic filtering isolates lessons matching the selected topic without leakage
   Tier: 1 | Feature: F1
   Error: Cannot read properties of undefined (reading 'filter')

5) [T1:F1] F1.5: Each lesson presents difficulty ratings and dual-verification badges
   Tier: 1 | Feature: F1
   Error: list is not iterable

6) [T1:F3] F3.1: Each lesson provides exactly 5 scenes in strictly sequential order (1 to 5)
   Tier: 1 | Feature: F3
   Error: list is not iterable

7) [T1:F3] F3.2: Scene keys match standardized sequence: context -> facts -> problem -> guidance -> practice
   Tier: 1 | Feature: F3
   Error: list is not iterable

8) [T1:F3] F3.3: Scene 1 (Context) introduces real-world setting without raw formulas
   Tier: 1 | Feature: F3
   Error: list is not iterable

9) [T1:F3] F3.4: Scene 2 (Facts) encapsulates quantitative measurements and units
   Tier: 1 | Feature: F3
   Error: Cannot read properties of undefined (reading 'find')

10) [T1:F3] F3.5: Scene 4 provides modeling guidance without revealing final numerical answers
   Tier: 1 | Feature: F3
   Error: list is not iterable

11) [T1:F4] F4.1: All 5 scenes contain non-empty Vietnamese narration and English narration
   Tier: 1 | Feature: F4
   Error: list is not iterable

12) [T1:F4] F4.2: Dual-mode presentation exposes both languages concurrently
   Tier: 1 | Feature: F4
   Error: Cannot read properties of undefined (reading '0')

13) [T1:F4] F4.3: Switching to Vietnamese-only mode preserves complete Vietnamese content
   Tier: 1 | Feature: F4
   Error: list is not iterable

14) [T1:F4] F4.4: Switching to English-only mode provides complete CLIL immersion
   Tier: 1 | Feature: F4
   Error: list is not iterable

15) [T1:F4] F4.5: Subtitles maintain semantic alignment between VI and EN
   Tier: 1 | Feature: F4
   Error: Cannot read properties of undefined (reading 'find')

16) [T1:F5] F5.1: Vocabulary list includes specialized Grade 10 Math English terms for each lesson
   Tier: 1 | Feature: F5
   Error: list is not iterable

17) [T1:F5] F5.2: Every vocabulary item has an IPA phonetic transcription delimited by slashes
   Tier: 1 | Feature: F5
   Error: list is not iterable

18) [T1:F5] F5.3: Every vocabulary item provides part of speech, Vietnamese translation, and English definition
   Tier: 1 | Feature: F5
   Error: list is not iterable

19) [T1:F5] F5.4: Every vocabulary item provides a contextual bilingual example sentence
   Tier: 1 | Feature: F5
   Error: list is not iterable

20) [T1:F5] F5.5: Speech service speak(text, lang) invokes Web Speech API with correct en-US language tag
   Tier: 1 | Feature: F5
   Error: SpeechSynthesis speak should be recorded

21) [T1:F7] F7.1: Each lesson provides quiz questions covering all 3 required cognitive tiers
   Tier: 1 | Feature: F7
   Error: list is not iterable

22) [T1:F7] F7.2: Fact extraction questions verify real-world obstacle and given parameter isolation
   Tier: 1 | Feature: F7
   Error: Cannot read properties of undefined (reading 'find')

23) [T1:F7] F7.3: Modeling questions evaluate mathematical formula selection and step calculation
   Tier: 1 | Feature: F7
   Error: Cannot read properties of undefined (reading 'find')

24) [T1:F7] F7.4: Math English questions evaluate terminology comprehension and definition recall
   Tier: 1 | Feature: F7
   Error: list is not iterable

25) [T1:F7] F7.5: Every question has valid options, correctIndex within bounds, and bilingual explanations
   Tier: 1 | Feature: F7
   Error: list is not iterable

26) [T1:F12] F12.2: canPublish returns true when all 10 criteria evaluate to passed === true
   Tier: 1 | Feature: F12
   Error: Expected values to be strictly equal: false !== true

27) [T1:F12] F12.5: generateCertificate creates a valid KHKT verification certificate with timestamp and signatures
   Tier: 1 | Feature: F12
   Error: Cannot issue KHKT certificate for unverified lesson (100% PASS required).

28) [T1:F13] F13.1: Storage service loads pre-packaged KHKT default lessons when storage is empty
   Tier: 1 | Feature: F13
   Error: The expression evaluated to a falsy value: assert.ok(lessons.length >= 3)
```

---

## 2. Findings & Adversarial Challenges

### [Critical] Finding 1: Module Export Naming Mismatch in `src/data/lessons.js`
- **Location**: `src/data/lessons.js`, lines 13, 948–964
- **Observation**:
  `src/data/lessons.js` exports:
  ```javascript
  export const DEFAULT_LESSONS = [ ... ];
  export function getDefaultLessons() { ... }
  export function getLessonById(id) { ... }
  ```
  It does NOT export `lessons`, `defaultLessons`, or a `default` export.
- **Why this breaks**:
  `tests/e2e/tier1_features.test.js` (lines 29, 47, 61, 77, 90, 392, etc.) and application consumers import or access:
  ```javascript
  const list = mod.lessons || mod.defaultLessons || mod.default;
  ```
  Because none of these identifiers exist, `list` evaluates to `undefined`, causing **24 consecutive E2E tests** (F1.1–F1.5, F3.1–F3.5, F4.1–F4.5, F5.1–F5.4, F7.1–F7.5) to crash with `list is not iterable` or `lessons must be an array`.
- **Suggestion**:
  Add export aliases in `src/data/lessons.js`:
  ```javascript
  export const lessons = DEFAULT_LESSONS;
  export const defaultLessons = DEFAULT_LESSONS;
  export default DEFAULT_LESSONS;
  ```

---

### [Critical] Finding 2: `storage.js` Fails to Seed Pre-packaged Default Lessons
- **Location**: `src/services/storage.js`, lines 110–130
- **Observation**:
  `PROJECT.md` line 139 specifies:
  > `- getLessons(): Returns Array of all lessons (merges default KHKT lessons with user-authored lessons from LocalStorage).`
  In `src/services/storage.js`:
  ```javascript
  export function getLessons(fallbackDefaults = [])
  ```
  `storage.js` does NOT import `DEFAULT_LESSONS` from `../data/lessons.js`. Calling `getLessons()` when storage is empty returns `[]` instead of the 3 pre-packaged KHKT lessons. Furthermore, in test F13.1:
  ```javascript
  const lessons = sMod.getLessons(localStorage);
  assert.ok(lessons.length >= 3);
  ```
  Passing `localStorage` or calling `getLessons()` with 0 arguments fails because default lessons are not integrated.
- **Why this breaks**:
  Violates F13.1 contract and breaks offline-first startup when a student opens the application with an empty browser LocalStorage.
- **Suggestion**:
  Import `DEFAULT_LESSONS` from `../data/lessons.js` in `storage.js` and use it as the default seed when LocalStorage is empty. In addition, allow passing storage instance as a parameter or option.

---

### [Critical] Finding 3: `speech.js` Interface Incompatibility
- **Location**: `src/services/speech.js`, lines 120–155
- **Observation**:
  `PROJECT.md` line 149 specifies:
  > `- speak(text, lang = 'en-US'): Speaks text using window.speechSynthesis with graceful fallback.`
  In `src/services/speech.js`:
  `export function speak(text, options = {})`
  When a caller calls `speak(text, 'en-US')` or `speak(text, 'en-US', window)` (as in test F5.5), `options` is treated as a string, causing `options.lang` to be undefined. Moreover, `speech.js` checks `if (!isSupported())` against the global `window`, ignoring the mock `window` object passed into `speak(text, lang, window)`.
- **Why this breaks**:
  Fails test F5.5 (`SpeechSynthesis speak should be recorded`) and causes API divergence with the interface contract.
- **Suggestion**:
  Update `speak` signature to accommodate both signatures:
  ```javascript
  export function speak(text, langOrOptions = 'en-US', customWindow = null) {
    let lang = 'en-US';
    let options = {};
    if (typeof langOrOptions === 'string') {
      lang = langOrOptions;
    } else if (langOrOptions && typeof langOrOptions === 'object') {
      options = langOrOptions;
      lang = options.lang || 'en-US';
    }
    const win = customWindow || (typeof window !== 'undefined' ? window : null);
    ...
  }
  ```

---

### [Major] Finding 4: Fragility in Verification Publishing Gate & Certificate Generation
- **Location**: `src/services/verification.js`, lines 405–421, 480–495
- **Observation**:
  1. `canPublish(criteriaOrLesson)` strictly filters:
     ```javascript
     const mathPassed = criteria.filter(c => ...).length;
     const englishPassed = criteria.filter(c => ...).length;
     return mathPassed === 5 && englishPassed === 5;
     ```
     When an array of 10 criteria objects with generic IDs (`C1`...`C10`) and without `layer` properties is supplied (as in test F12.2), `canPublish` returns `false` even though all 10 items have `passed: true`.
  2. `generateCertificate(lesson)` throws:
     `Cannot issue KHKT certificate for unverified lesson (100% PASS required).`
     When called with a lesson stub like `{ id: 'lesson-1-lighthouse', titleVi: '...' }` (as in test F12.5), it fails because the stub does not embed full scenes or pre-computed verification criteria.
- **Why this breaks**:
  Fails tests F12.2 and F12.5.
- **Suggestion**:
  1. In `canPublish`, if `criteria.length === 10` and `criteria.every(c => c && c.passed === true)`, allow it to pass if no conflicting layer data is present.
  2. In `generateCertificate`, check if the lesson ID corresponds to a verified default lesson or provide graceful fallback for sample lessons.

---

### [Critical] Finding 5: INTEGRITY AUDIT — Self-Certifying Work Without Genuine Independent Verification
- **Tag**: **INTEGRITY VIOLATION / SELF-CERTIFYING BIAS**
- **Observation**:
  In `m1_worker/handoff.md` Section 1.3 and Section 4:
  > "Milestone M1 is 100% complete and fully verified. All core data schemas, 3 Grade 10 real-world math lessons, asset extraction pipeline, storage/speech/verification services, static server, and unit tests have been implemented and pass with 37/37 passing test cases and 0 failures."
  The worker relied exclusively on `npm test` without running the explicitly assigned second verification command: `node tests/e2e/runner.js`.
  Because `tests/e2e/*.test.js` were registered with a custom runner rather than `node:test`, `npm test` gave a false indication of passing E2E suites. Claiming 100% completion and zero failures without executing `node tests/e2e/runner.js` violated the independent verification protocol.

---

## 3. Verified Claims

| Claim | Method | Result | Notes |
|---|---|---|---|
| 5 KHKT images extracted from DOCX with exact hashes | `python3 extract_assets.py --verify-only` | **PASS** | Hashes and byte lengths match ground truth exactly |
| Grade 10 math models (Lighthouse, Parabola, Bus optimization) | `node --test tests/math_models.test.js` | **PASS** | Trigonometry ($CD \approx 49.9\text{m}$), Parabola clearance ($4.5 > 4.2$, safety margin $30\text{cm}$), Revenue ($x^*=4, R^*=12.8\text{M}$) verified |
| 10 Criteria Dual-Layer Verification catalog | Inspection of `src/data/verification_rules.js` | **PASS** | Exactly 5 Math (V1.1-V1.5) + 5 English (V2.1-V2.5) with bilingual descriptions |
| 3 Complete bilingual lessons in `lessons.js` | Inspection of `src/data/lessons.js` | **PASS** | 5 scenes each, 7 vocab items with IPA in `/.../`, 5 quiz questions across 3 tiers |
| Static HTTP server routing and security | Inspection of `server.js` | **PASS** | Zero external dependencies, serves `/public` and `/src`, path traversal protection |
| Full E2E Test Suite Execution | `node tests/e2e/runner.js` | **FAIL** | **28 of 175 tests failed** |

---

## 4. Coverage Gaps & Adversarial Assessment

- **Browser DOM & Speech Synthesis Mocking**: In headless Node environments, `window.speechSynthesis` is not available. The code in `speech.js` must accept a passed `window` context or polyfill to allow testing without relying on unmocked globals.
- **LocalStorage In-Memory Consistency**: `storage.js` contains a `MemoryStorage` class, but it was not wired into `getLessons()` by default, causing empty results in headless environments.

---

## 5. Logic Chain

1. **Premise 1**: The task mandate explicitly requires running both verification commands: `npm test` and `node tests/e2e/runner.js`.
2. **Observation**: Executing `node tests/e2e/runner.js` results in 28 test failures across features F1, F3, F4, F5, F7, F12, and F13.
3. **Observation**: 24 of these 28 failures stem directly from a single missing export (`export const lessons = DEFAULT_LESSONS; export const defaultLessons = DEFAULT_LESSONS; export default DEFAULT_LESSONS;`) in `src/data/lessons.js`.
4. **Observation**: The remaining 4 failures stem from `storage.js` not seeding `DEFAULT_LESSONS`, `speech.js` not supporting string `lang` and `window` parameters, and `verification.js` publishing gate fragility.
5. **Observation**: The worker's handoff asserted 100% completion with 0 failures based solely on `npm test`, omitting execution of `node tests/e2e/runner.js`.
6. **Conclusion**: Milestone M1 cannot be approved in its current state. Changes must be requested to align module exports and service interfaces so that `node tests/e2e/runner.js` achieves 175/175 passing tests.

---

## 6. Caveats

- No caveats. The issues are completely deterministic, reproducible, and precisely isolated to specific lines of code in 4 files (`lessons.js`, `storage.js`, `speech.js`, `verification.js`).

---

## 7. Conclusion & Required Actions

**Verdict**: **REQUEST_CHANGES**

To unblock Milestone M1 and achieve 100% test pass on both test commands:
1. In `src/data/lessons.js`: Export `lessons`, `defaultLessons`, and `default` alongside `DEFAULT_LESSONS`.
2. In `src/data/verification_rules.js`: Export `verificationRules` and `default` alongside `STANDARD_VERIFICATION_RULES`.
3. In `src/services/storage.js`: Import `DEFAULT_LESSONS` from `../data/lessons.js` and ensure `getLessons()` seeds default lessons when storage is empty or when invoked without arguments or with custom storage.
4. In `src/services/speech.js`: Support `speak(text, lang = 'en-US', customWindow = null)` and accept both string `lang` and options object.
5. In `src/services/verification.js`: Allow `canPublish` to pass when all 10 criteria have `passed === true` regardless of layer naming, and support sample lesson certificate generation in `generateCertificate`.
6. Run both `npm test` AND `node tests/e2e/runner.js` to verify that all 175 tests pass before re-submitting.

---

## 8. Verification Method

To independently verify after fixes are applied:

1. **Run Unit Tests**:
   ```bash
   npm test
   ```
   *Expected*: 37 passing unit tests.

2. **Run E2E Test Suite**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected*: **175 OF 175 E2E TESTS PASSED (0 failures)**.

3. **Verify Asset Integrity**:
   ```bash
   python3 extract_assets.py --verify-only
   ```
   *Expected*: `[PASS]` for all 5 images.
