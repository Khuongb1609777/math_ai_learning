# Handoff Report: Export Aliases and Lesson Schema Remediation

**Agent**: M1 Iteration 2 Explorer 1 (Export & Lesson Schema Explorer)  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_1`  
**Date**: 2026-11-07T07:44:00Z  
**Type**: Hard Handoff  

---

## 1. Observation

### 1.1 Direct Runtime Observation
Running `node tests/e2e/runner.js` produces 28 test failures with exit code 1:
```text
================================================================
   E2E TEST RUNNER — MATH-ENGLISH CLIL WEB APP (GRADE 10 - KHKT) 
================================================================
Discovered 175 tests. Running 175 selected tests...

FFFFF.....FFFFFFFFFFFFFFF.....FFFFF...............  [50/175]
......F..FF.......................................  [100/175]
..................................................  [150/175]
.........................  [175/175]

28 OF 175 E2E TESTS FAILED (0.12s)
```

Running feature-specific slices:
- `node tests/e2e/runner.js --feature=F1`: `5 OF 10 E2E TESTS FAILED` (F1.1, F1.2, F1.3, F1.4, F1.5 fail)
- `node tests/e2e/runner.js --feature=F3`: `5 OF 10 E2E TESTS FAILED` (F3.1, F3.2, F3.3, F3.4, F3.5 fail)
- `node tests/e2e/runner.js --feature=F4`: `5 OF 10 E2E TESTS FAILED` (F4.1, F4.2, F4.3, F4.4, F4.5 fail)
- `node tests/e2e/runner.js --feature=F5`: `5 OF 10 E2E TESTS FAILED` (F5.1, F5.2, F5.3, F5.4 fail on lessons, F5.5 fails on speech)
- `node tests/e2e/runner.js --feature=F7`: `5 OF 10 E2E TESTS FAILED` (F7.1, F7.2, F7.3, F7.4, F7.5 fail)

### 1.2 Inspection of Test Expectations in `tests/e2e/tier1_features.test.js`
In `tests/e2e/tier1_features.test.js`:
- Line 27–29 (F1.1):
  ```javascript
  const mod = await loadAppModule('src/data/lessons.js');
  if (mod) {
    const list = mod.lessons || mod.defaultLessons || mod.default;
    assert.ok(Array.isArray(list), 'lessons must be an array');
  ```
- Lines 47, 61, 77, 90, 191, 206, 225, 239, 253, 272, 289, 302, 314, 326, 347, 360, 377, 392, 498, 514, 529, 544, 557:
  Each test calls `const list = mod.lessons || mod.defaultLessons || mod.default;` and then iterates on `list`.
- Line 92 (F1.5):
  ```javascript
  assert.ok(['Basic', 'Medium', 'Hard', 'Cơ bản', 'Vận dụng', 'Vận dụng cao'].includes(l.difficulty), `Valid difficulty for ${l.id}`);
  ```
- Lines 754–756 (F11.1):
  ```javascript
  const mod = await loadAppModule('src/data/verification_rules.js');
  if (mod && mod.verificationRules) {
    assert.equal(mod.verificationRules.length, 10);
  ```

### 1.3 Inspection of `src/data/lessons.js`
- Lines 13:
  ```javascript
  export const DEFAULT_LESSONS = [ ... ];
  ```
- Lines 638–640 (Lesson 3, `lesson-bus-optimization`):
  ```javascript
  grade: "10",
  difficulty: "Advanced",
  estimatedMinutes: 20,
  ```
  Note: `"Advanced"` is NOT in `['Basic', 'Medium', 'Hard', 'Cơ bản', 'Vận dụng', 'Vận dụng cao']` and contradicts `PROJECT.md:128` (`"Medium" | "Hard"`).
- Lines 952–964:
  ```javascript
  export function getDefaultLessons() { ... }
  export function getLessonById(id) { ... }
  ```
  Missing exports: `lessons`, `defaultLessons`, and `default`.

### 1.4 Inspection of `src/data/verification_rules.js`
- Line 11:
  ```javascript
  export const STANDARD_VERIFICATION_RULES = [ ... ];
  ```
- Line 162:
  ```javascript
  export function createInitialVerificationRules(auditorName = "Chưa kiểm định") { ... }
  ```
  Missing exports: `verificationRules`, `standardVerificationRules`, and `default`.

---

## 2. Logic Chain

1. **Step 1 (Root Cause of 24 Failures)**:
   In `tests/e2e/tier1_features.test.js`, tests F1.1–F1.5, F3.1–F3.5, F4.1–F4.5, F5.1–F5.4, and F7.1–F7.5 import `src/data/lessons.js` and extract `const list = mod.lessons || mod.defaultLessons || mod.default;` (Observation 1.2).
   Because `src/data/lessons.js` only exports `DEFAULT_LESSONS`, `mod.lessons`, `mod.defaultLessons`, and `mod.default` are `undefined` (Observation 1.3).
   Therefore, `list` evaluates to `undefined`, causing `assert.ok(Array.isArray(list))` and all array operations (`list.map`, `list.filter`, `for (const l of list)`) to throw `TypeError: list is not iterable` or `AssertionError: lessons must be an array` (Observation 1.1).

2. **Step 2 (Hidden Failure in F1.5)**:
   When `list` becomes an array via export aliases, test F1.5 iterates over `list` and asserts:
   `['Basic', 'Medium', 'Hard', 'Cơ bản', 'Vận dụng', 'Vận dụng cao'].includes(l.difficulty)` (Observation 1.2).
   Lesson 3 (`lesson-bus-optimization`) has `difficulty: "Advanced"` (Observation 1.3).
   `"Advanced"` is not in the set of allowed difficulties and violates `PROJECT.md:128` which defines `difficulty: "Medium" | "Hard"`.
   Therefore, without updating `difficulty: "Advanced"` to `"Hard"`, F1.5 will still fail.

3. **Step 3 (Verification Rules Activation in F11)**:
   In `tier1_features.test.js:754-756`, test F11.1 checks `if (mod && mod.verificationRules)` (Observation 1.2).
   Currently `verificationRules` is not exported from `src/data/verification_rules.js` (Observation 1.4).
   Exporting `export const verificationRules = STANDARD_VERIFICATION_RULES;` activates primary direct validation of the 10 criteria (5 Math + 5 English) without falling back to file scraping.

4. **Step 4 (Remediation Sufficiency)**:
   Direct algorithmic verification of all 3 lessons in `DEFAULT_LESSONS` against every test assertion in F1, F3, F4, F5, F7 confirms that when `difficulty: "Hard"` is applied and export aliases are added, 100% of the assertions in all 24 failing tests pass with 0 errors.

---

## 3. Caveats

- **Scope Boundary**: This report focuses on `src/data/lessons.js` and `src/data/verification_rules.js`. The remaining 4 E2E failures (F5.5 in `src/services/speech.js`, F12.2 and F12.5 in `src/services/verification.js`, and F13.1 in `src/services/storage.js`) are handled by Explorer 2 and implementers.
- **Storage Seeding Dependency**: Note that `src/services/storage.js` line 110 should import `DEFAULT_LESSONS` (or `lessons`) from `../data/lessons.js` to seed empty LocalStorage for test F13.1.
- No other caveats.

---

## 4. Conclusion

The 24 E2E test failures and the hidden schema defect are fully understood with deterministic evidence.

### Required Drop-In Code Edits:

#### File 1: `src/data/lessons.js`

1. **At line 639**: Replace `"Advanced"` with `"Hard"`:
```javascript
// BEFORE (line 638-640):
    grade: "10",
    difficulty: "Advanced",
    estimatedMinutes: 20,

// AFTER:
    grade: "10",
    difficulty: "Hard",
    estimatedMinutes: 20,
```

2. **At line 964 (end of file)**: Append the export aliases:
```javascript
// =========================================================================
// EXPORT ALIASES (E2E Test Runner & Consumer Compatibility)
// =========================================================================
export const defaultLessons = DEFAULT_LESSONS;
export const lessons = DEFAULT_LESSONS;
export default DEFAULT_LESSONS;
```

#### File 2: `src/data/verification_rules.js`

1. **At line 171 (end of file)**: Append the export aliases:
```javascript
// =========================================================================
// EXPORT ALIASES (E2E Test Runner & Consumer Compatibility)
// =========================================================================
export const verificationRules = STANDARD_VERIFICATION_RULES;
export const standardVerificationRules = STANDARD_VERIFICATION_RULES;
export default STANDARD_VERIFICATION_RULES;
```

---

## 5. Verification Method

### 5.1 Step-by-Step Independent Verification Commands

1. **Verify Export Aliases & Schema Integrity**:
   ```bash
   node -e '
   import("./src/data/lessons.js").then((mod) => {
     const assert = require("assert");
     assert.ok(Array.isArray(mod.lessons), "mod.lessons is array");
     assert.ok(Array.isArray(mod.defaultLessons), "mod.defaultLessons is array");
     assert.ok(Array.isArray(mod.default), "mod.default is array");
     assert.equal(mod.lessons, mod.DEFAULT_LESSONS);
     const l3 = mod.lessons.find(l => l.id === "lesson-bus-optimization");
     assert.equal(l3.difficulty, "Hard", "Lesson 3 difficulty is Hard");
     console.log("src/data/lessons.js verification: PASS");
   });
   import("./src/data/verification_rules.js").then((mod) => {
     const assert = require("assert");
     assert.ok(Array.isArray(mod.verificationRules), "mod.verificationRules is array");
     assert.equal(mod.verificationRules.length, 10);
     console.log("src/data/verification_rules.js verification: PASS");
   });
   '
   ```

2. **Run E2E Test Suites for Remediated Features**:
   ```bash
   node tests/e2e/runner.js --feature=F1
   node tests/e2e/runner.js --feature=F3
   node tests/e2e/runner.js --feature=F4
   node tests/e2e/runner.js --feature=F5
   node tests/e2e/runner.js --feature=F7
   node tests/e2e/runner.js --feature=F11
   ```
   *Expected*:
   - F1: 10/10 PASS
   - F3: 10/10 PASS
   - F4: 10/10 PASS
   - F5: 9/10 PASS (F5.5 is speech service)
   - F7: 10/10 PASS
   - F11: 10/10 PASS

3. **Verify Zero Regressions on Existing Unit Tests**:
   ```bash
   npm test
   ```
   *Expected*: All unit test suites pass.

### 5.2 Invalidation Conditions
This handoff is invalidated if:
- Any property in `DEFAULT_LESSONS` is deleted or mutated inconsistently with Grade 10 curriculum.
- `DEFAULT_LESSONS` is renamed instead of aliased, breaking existing unit test imports.
- `difficulty` of Lesson 3 is left as `"Advanced"`, causing test F1.5 to fail.
