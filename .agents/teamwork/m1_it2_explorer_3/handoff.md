# Handoff Report: Storage & Speech Services Remediation (Milestone M1 Iteration 2)

**Agent**: M1 Iteration 2 Explorer 3 (Storage & Speech Services Explorer)  
**Date**: 2026-11-07T07:46:00Z  
**Type**: Hard Handoff  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_3/`  
**Related Documents**:
- In-depth Analysis: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_3/analysis.md`
- Dispatch Record: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_3/DISPATCH.md`

---

## 1. Observation

### 1.1 Storage Service Defect (`src/services/storage.js`)
- **Direct Code Observation**: In `/Users/mac/Desktop/math_english_ai_learn/src/services/storage.js`:
  - `DEFAULT_LESSONS` was not imported from `../data/lessons.js`.
  - Lines 113–129 defined:
    ```javascript
    export function getLessons(fallbackDefaults = []) {
      const storage = getStorage();
      const raw = storage.getItem(STORAGE_KEYS.LESSONS);
      if (!raw) {
        if (fallbackDefaults && fallbackDefaults.length > 0) {
          return initStorage(fallbackDefaults);
        }
        return [];
      }
      ...
    ```
- **Test Invocation Observation**: In `/Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier1_features.test.js:889–898`:
  ```javascript
  test('F13.1: Storage service loads pre-packaged KHKT default lessons when storage is empty', async () => {
    const { localStorage } = createBrowserContext();
    const sMod = await loadAppModule('src/services/storage.js');
    if (sMod && sMod.getLessons) {
      const lessons = sMod.getLessons(localStorage);
      assert.ok(lessons.length >= 3);
    } else { ... }
  });
  ```
- **Verbatim Error**:
  ```text
  28) [T1:F13] F13.1: Storage service loads pre-packaged KHKT default lessons when storage is empty
     Tier: 1 | Feature: F13
     Error: The expression evaluated to a falsy value: assert.ok(lessons.length >= 3)
  ```
- **Mechanism**:
  1. `sMod.getLessons(localStorage)` passes a `MockLocalStorage` instance as the 1st argument.
  2. `getLessons` mapped this object to parameter `fallbackDefaults`.
  3. `MockLocalStorage` is an object, not an Array. Its `.length` property is a getter returning `this._store.size` (which is 0 when storage is empty).
  4. The check `fallbackDefaults && fallbackDefaults.length > 0` evaluated to `0 > 0` (false), returning `[]`.
  5. Storage was never auto-seeded on empty, and the caller's custom `localStorage` instance was ignored.

---

### 1.2 Speech Service Defect (`src/services/speech.js`)
- **Direct Code Observation**: In `/Users/mac/Desktop/math_english_ai_learn/src/services/speech.js`:
  - Lines 20–26 defined:
    ```javascript
    export function isSupported() {
      return (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.SpeechSynthesisUtterance !== 'undefined'
      );
    }
    ```
  - Lines 120–153 defined:
    ```javascript
    export function speak(text, options = {}) {
      const { lang = 'en-US', ... } = options;
      ...
      if (!isSupported()) {
        // Headless fallback using setTimeout, never calling window.speechSynthesis
      }
    }
    ```
- **Test Invocation Observation**: In `/Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier1_features.test.js:403–417`:
  ```javascript
  test('F5.5: Speech service speak(text, lang) invokes Web Speech API with correct en-US language tag', async () => {
    const { window } = createBrowserContext();
    const speechMod = await loadAppModule('src/services/speech.js');
    if (speechMod && speechMod.speak) {
      speechMod.speak('Angle of elevation', 'en-US', window);
      assert.ok(window.speechSynthesis.history.length >= 1, 'SpeechSynthesis speak should be recorded');
    } else { ... }
  });
  ```
- **Verbatim Error**:
  ```text
  20) [T1:F5] F5.5: Speech service speak(text, lang) invokes Web Speech API with correct en-US language tag
     Tier: 1 | Feature: F5
     Error: SpeechSynthesis speak should be recorded
  ```
- **Mechanism**:
  1. Test calls `speak('Angle of elevation', 'en-US', window)` where `window` is passed as the 3rd argument.
  2. In Node.js test environment, `typeof window === 'undefined'`.
  3. `isSupported()` inspected only global `window` and returned `false`.
  4. `speak()` ignored the 3rd argument `window`, routed to headless mock `setTimeout`, and never called `window.speechSynthesis.speak()`.
  5. Consequently, `window.speechSynthesis.history` had length 0.

---

## 2. Logic Chain

1. **Step 1 (Interface Requirement Traceability)**:
   - `PROJECT.md` Section 2 specifies that `getLessons()` must return an array of all lessons and merge default KHKT lessons with user-authored lessons from LocalStorage.
   - `PROJECT.md` Section 3 specifies `speak(text, lang = 'en-US')` using `window.speechSynthesis` with graceful fallback.
2. **Step 2 (Root Cause Validation)**:
   - In `storage.js`, failing to import `DEFAULT_LESSONS` directly causes empty storage to yield `[]` instead of 3 canonical lessons.
   - Calling `getLessons(localStorage)` passes an engine implementing `Storage` (`getItem`, `setItem`). Duck-typing `isStorageInstance(obj)` (`Boolean(obj && typeof obj.getItem === 'function')`) distinguishes a storage engine from a lesson array.
   - In `speech.js`, Node.js test runners isolate DOM APIs inside a mock context (`createBrowserContext()`). Passing `windowOverride` as the 3rd argument (or resolving `options.window`) allows `speak` to execute against the active test harness window.
3. **Step 3 (Adversarial Security Preservation)**:
   - Preserving `isDefault: true` on canonical lessons (`lesson-lighthouse`, `lesson-parabolic-arch`, `lesson-bus-optimization`) across `saveLesson`, `deleteLesson`, and `importLessonsJSON` ensures 100% PASS on the 6 adversarial attack vectors in `tests/verification_gate_adversarial.test.js`.
4. **Step 4 (Empirical Proof)**:
   - Dynamic simulation in Node.js confirms:
     `getLessons(localStorage)` returns 3 lessons and populates `localStorage`.
     `speak('Angle of elevation', 'en-US', window)` records 1 utterance to `window.speechSynthesis.history`.

---

## 3. Caveats

1. **Division of Responsibility**:
   - Explorer 3 specifically owns the diagnosis and drop-in code remediation for `src/services/storage.js` and `src/services/speech.js`.
   - Missing export aliases in `src/data/lessons.js` (`lessons`, `defaultLessons`, `default`) are analyzed and remediated by Explorer 1.
   - Gatekeeper criteria validation and certificate generation edge cases in `src/services/verification.js` are analyzed and remediated by Explorer 2.
2. **Global Voice Cache**:
   - `initVoices()` safely ignores voice loading when run in headless environments or when `window.speechSynthesis.getVoices` is undefined.

---

## 4. Conclusion & Remediation Package

To resolve test failures `F13.1` and `F5.5` without regressing adversarial tests:

### 4.1 Changes to `src/services/storage.js`
1. Import `DEFAULT_LESSONS` from `../data/lessons.js`.
2. Add `isStorageInstance(obj)` duck-typing check for `typeof obj.getItem === 'function'`.
3. Support polymorphic signatures in `getLessons(storageOrDefaults = DEFAULT_LESSONS, secondaryParam = null)`:
   - If argument is storage instance, use it as active storage.
   - If storage is empty, auto-seed with `DEFAULT_LESSONS` via `initStorage(defaults, targetStorage)`.
4. Apply `storageOverride` throughout helper methods (`getLessonById`, `saveLesson`, `deleteLesson`, `resetToDefault`, `exportLessonsJSON`, `exportLessonJSON`, `importLessonsJSON`, `getQuizResult`, `saveQuizResult`, `getAllQuizResults`, `clearQuizResults`, `saveSurveyResult`, `getSurveyResult`, `getAllSurveyResults`, `clearAll`).
5. Complete drop-in code is documented in Section 4.1 of `analysis.md`.

### 4.2 Changes to `src/services/speech.js`
1. Update `isSupported(win = null)` to accept an optional target window context.
2. Update `speak(text, langOrOptions = {}, windowOverride = null)`:
   - Handle string `langOrOptions` (e.g. `'en-US'`) as `{ lang: 'en-US' }`.
   - Resolve `targetWindow` from `windowOverride`, `options.window`, or global `window`.
   - Dispatch utterance via `targetWindow.speechSynthesis.speak(utterance)` when supported.
3. Update `stop(targetWindow)`, `pause(targetWindow)`, `resume(targetWindow)`, `isSpeaking(targetWindow)`, and `speakTerm(vocabItem, options, targetWindow)` to accept optional window context.
4. Complete drop-in code is documented in Section 4.2 of `analysis.md`.

---

## 5. Verification Method

To independently verify the proposed remediation:

### Test Step 1: Verify Storage Auto-Seeding & Duck-Typing (`F13.1`)
```bash
node --input-type=module -e '
import { createBrowserContext } from "./tests/e2e/runner.js";
import { getLessons, getStorage } from "./src/services/storage.js";
import assert from "node:assert/strict";

// Test F13.1: Custom mock localStorage passed as 1st argument
const { localStorage } = createBrowserContext();
const lessons = getLessons(localStorage);
assert.ok(Array.isArray(lessons), "Lessons must be an array");
assert.ok(lessons.length >= 3, "Lessons must contain at least 3 default lessons");
assert.ok(localStorage.getItem("khkt_lessons_v1"), "Storage must be seeded");

// Test default parameter invocation without arguments
const defaultLessons = getLessons();
assert.ok(defaultLessons.length >= 3, "getLessons() without arguments must auto-seed");

console.log("✓ Storage F13.1 Verification PASS");
'
```

### Test Step 2: Verify Speech Service Web Speech API Recording (`F5.5`)
```bash
node --input-type=module -e '
import { createBrowserContext } from "./tests/e2e/runner.js";
import { speak } from "./src/services/speech.js";
import assert from "node:assert/strict";

const { window } = createBrowserContext();
speak("Angle of elevation", "en-US", window);

assert.ok(window.speechSynthesis.history.length >= 1, "SpeechSynthesis speak should be recorded");
assert.equal(window.speechSynthesis.lastUtterance.text, "Angle of elevation");
assert.equal(window.speechSynthesis.lastUtterance.lang, "en-US");

console.log("✓ Speech F5.5 Verification PASS");
'
```

### Test Step 3: Run Full E2E Test Runner
```bash
node tests/e2e/runner.js
```
*Expected*: Tests `F13.1` and `F5.5` pass.
