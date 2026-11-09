# In-Depth Remediation Analysis: Storage & Speech Services (M1 Iteration 2)

**Author**: M1 Iteration 2 Explorer 3 (Storage & Speech Services Explorer)  
**Date**: 2026-11-07T07:44:00Z  
**Target Files**:
- `/Users/mac/Desktop/math_english_ai_learn/src/services/storage.js`
- `/Users/mac/Desktop/math_english_ai_learn/src/services/speech.js`

---

## 1. Executive Summary

During Milestone M1 forensic audit and adversarial review, two critical service defects were identified that caused runtime failures in the project test suites:

1. **Storage Service (`src/services/storage.js`)**:
   - **Audit/Review Finding**: Test `F13.1` failed with `AssertionError: lessons.length >= 3`.
   - **Root Cause**: `storage.js` did not import `DEFAULT_LESSONS` from `../data/lessons.js`. In addition, when invoked with a custom storage engine such as `getLessons(localStorage)` (passed by test `F13.1`), `getLessons(fallbackDefaults)` treated the `MockLocalStorage` object as the `fallbackDefaults` parameter. Because `fallbackDefaults.length` (the storage map size) was 0 and not an Array of lessons, and because `storage.getItem` was invoked on the module's internal `memoryFallback` rather than the passed storage instance, `getLessons()` returned `[]`.
   - **Remediation**: Import `DEFAULT_LESSONS`, implement robust duck-typing for storage instances (`typeof obj.getItem === 'function'`), auto-seed storage when empty, and support polymorphic parameter signatures (`getLessons(customStorage)`, `getLessons(fallbackDefaults)`, `getLessons()`).

2. **Speech Service (`src/services/speech.js`)**:
   - **Audit/Review Finding**: Test `F5.5` failed with `Error: SpeechSynthesis speak should be recorded`.
   - **Root Cause**: Test `F5.5` invoked `speak('Angle of elevation', 'en-US', window)` where `window` was passed as the 3rd argument. `speech.js` strictly evaluated `typeof window !== 'undefined'` (which is `false` in Node.js test runners) and completely ignored the 3rd argument `windowOverride`. Consequently, it branched into a headless `setTimeout` mock and never called `window.speechSynthesis.speak(utterance)`. Furthermore, `speak` assumed the 2nd argument was always an options object rather than a language string or options object.
   - **Remediation**: Expand `speak()` signature to `speak(text, langOrOptions = {}, windowOverride = null)`, check `isSupported(targetWindow)`, and dispatch to `targetWindow.speechSynthesis` when available.

---

## 2. Investigation of `src/services/storage.js`

### 2.1 The Failure in Test `F13.1`
In `tests/e2e/tier1_features.test.js:889–898`:
```javascript
test('F13.1: Storage service loads pre-packaged KHKT default lessons when storage is empty', async () => {
  const { localStorage } = createBrowserContext();
  const sMod = await loadAppModule('src/services/storage.js');
  if (sMod && sMod.getLessons) {
    const lessons = sMod.getLessons(localStorage);
    assert.ok(lessons.length >= 3);
  } else {
    assert.ok(true, 'Storage initialization contract verified');
  }
});
```

### 2.2 Flaws in Existing Implementation (`src/services/storage.js:113–129`)
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
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse lessons from storage, reinitializing...', e);
    return fallbackDefaults ? initStorage(fallbackDefaults) : [];
  }
}
```

Discrepancies identified:
1. `DEFAULT_LESSONS` was **never imported**. If `getLessons()` was called with no arguments on an empty storage, it returned `[]` instead of seeding default lessons.
2. In `getLessons(localStorage)`, `localStorage` was received into `fallbackDefaults`.
   - `localStorage` is an instance of `MockLocalStorage` (duck-type `Storage`).
   - `fallbackDefaults.length` was 0 (getter for map size).
   - `initStorage(fallbackDefaults)` was skipped, returning `[]`.
   - Even if called, `initStorage` used `getStorage()` (`memoryFallback`), completely ignoring the `localStorage` argument!

### 2.3 Required Storage Remediation Logic
1. **Import `DEFAULT_LESSONS`**:
   ```javascript
   import { DEFAULT_LESSONS } from '../data/lessons.js';
   ```
2. **Duck-Type Detection Helper**:
   ```javascript
   const isStorageBackend = (obj) => Boolean(
     obj && typeof obj === 'object' && typeof obj.getItem === 'function'
   );
   ```
3. **Polymorphic Parameter Resolution for `getLessons`**:
   ```javascript
   export function getLessons(storageOrDefaults = DEFAULT_LESSONS, secondaryParam = null) {
     let targetStorage = null;
     let defaults = DEFAULT_LESSONS;

     if (isStorageBackend(storageOrDefaults)) {
       targetStorage = storageOrDefaults;
       if (Array.isArray(secondaryParam) && secondaryParam.length > 0) {
         defaults = secondaryParam;
       }
     } else if (Array.isArray(storageOrDefaults) && storageOrDefaults.length > 0) {
       defaults = storageOrDefaults;
       if (isStorageBackend(secondaryParam)) {
         targetStorage = secondaryParam;
       }
     } else if (isStorageBackend(secondaryParam)) {
       targetStorage = secondaryParam;
     }

     if (!targetStorage) {
       targetStorage = getStorage();
     }

     const raw = targetStorage.getItem(STORAGE_KEYS.LESSONS);
     if (!raw) {
       return initStorage(defaults, targetStorage);
     }

     try {
       const parsed = JSON.parse(raw);
       if (!Array.isArray(parsed) || parsed.length === 0) {
         return initStorage(defaults, targetStorage);
       }
       return parsed;
     } catch (e) {
       console.error('Failed to parse lessons from storage, reinitializing...', e);
       return initStorage(defaults, targetStorage);
     }
   }
   ```
4. **Duck-Type Detection in `initStorage`**:
   ```javascript
   export function initStorage(defaultLessonsOrStorage = DEFAULT_LESSONS, storageOverride = null) {
     let targetStorage = null;
     let lessonsToSeed = null;

     if (isStorageBackend(defaultLessonsOrStorage)) {
       targetStorage = defaultLessonsOrStorage;
       lessonsToSeed = (storageOverride && Array.isArray(storageOverride)) ? storageOverride : DEFAULT_LESSONS;
     } else {
       lessonsToSeed = (Array.isArray(defaultLessonsOrStorage) && defaultLessonsOrStorage.length > 0)
         ? defaultLessonsOrStorage
         : DEFAULT_LESSONS;
       targetStorage = isStorageBackend(storageOverride) ? storageOverride : getStorage();
     }

     const seedItems = () => {
       const seeded = lessonsToSeed.map(lesson => ({
         ...JSON.parse(JSON.stringify(lesson)),
         isDefault: true,
         updatedAt: new Date().toISOString()
       }));
       targetStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(seeded));
       return seeded;
     };

     const raw = targetStorage.getItem(STORAGE_KEYS.LESSONS);
     if (!raw) return seedItems();

     try {
       const existing = JSON.parse(raw);
       if (!Array.isArray(existing) || existing.length === 0) return seedItems();
       return existing;
     } catch (err) {
       return seedItems();
     }
   }
   ```
5. **Preserving Security & Protection Invariants**:
   Ensure `saveLesson`, `deleteLesson`, and `importLessonsJSON` preserve `isDefault: true` on canonical lessons (`lesson-lighthouse`, `lesson-parabolic-arch`, `lesson-bus-optimization`), passing all adversarial tests in `tests/verification_gate_adversarial.test.js`.

---

## 3. Investigation of `src/services/speech.js`

### 3.1 The Failure in Test `F5.5`
In `tests/e2e/tier1_features.test.js:403–417`:
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

### 3.2 Flaws in Existing Implementation (`src/services/speech.js:20–26, 120–153`)
```javascript
export function isSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export function speak(text, options = {}) {
  const { lang = 'en-US', ... } = options;
  if (!isSupported()) {
    // Headless fallback -> uses setTimeout without window.speechSynthesis
  }
  ...
}
```

Discrepancies identified:
1. `isSupported()` only inspected `window` in the global environment (`typeof window !== 'undefined'`). In Node.js, `window` is `undefined`, so `isSupported()` unconditionally returned `false`.
2. Test `F5.5` passed `window` as the 3rd argument: `speak('Angle of elevation', 'en-US', window)`. `speech.js` had only 2 formal parameters: `speak(text, options = {})`.
3. Test `F5.5` passed `'en-US'` (a string) as the 2nd argument. Destructuring `options` as an object failed to extract `lang` properly if custom strings were supplied.
4. Because `isSupported()` was `false`, it never called `window.speechSynthesis.speak(utterance)`. Thus `window.speechSynthesis.history` remained empty.

### 3.3 Required Speech Remediation Logic
1. **Context-Aware `isSupported(win = null)`**:
   ```javascript
   export function isSupported(win = null) {
     const targetWindow = win || (typeof window !== 'undefined' ? window : null);
     return Boolean(
       targetWindow &&
       targetWindow.speechSynthesis &&
       typeof targetWindow.SpeechSynthesisUtterance !== 'undefined'
     );
   }
   ```
2. **Polymorphic `speak(text, langOrOptions = {}, windowOverride = null)`**:
   ```javascript
   export function speak(text, langOrOptions = {}, windowOverride = null) {
     if (!text || typeof text !== 'string') {
       return Promise.resolve(false);
     }

     // Parse langOrOptions: string or object
     let options = {};
     if (typeof langOrOptions === 'string') {
       options = { lang: langOrOptions };
     } else if (langOrOptions && typeof langOrOptions === 'object') {
       if (langOrOptions.speechSynthesis) {
         windowOverride = langOrOptions;
         options = {};
       } else {
         options = { ...langOrOptions };
       }
     }

     // Resolve target window context
     let targetWindow = windowOverride;
     if (!targetWindow && options.window) {
       targetWindow = options.window;
     }
     if (!targetWindow && typeof window !== 'undefined') {
       targetWindow = window;
     }

     const {
       lang = 'en-US',
       rate = 0.9,
       pitch = 1.0,
       volume = 1.0,
       voice = null,
       onStart = null,
       onEnd = null,
       onError = null
     } = options;

     // Check support in resolved targetWindow
     if (!isSupported(targetWindow)) {
       isSpeakingState = true;
       if (typeof onStart === 'function') queueMicrotask(() => onStart());
       return new Promise(resolve => {
         const wordCount = text.trim().split(/\s+/).length;
         const durationMs = Math.min(Math.max(wordCount * 80, 150), 2000);
         setTimeout(() => {
           isSpeakingState = false;
           if (typeof onEnd === 'function') onEnd();
           resolve(true);
         }, durationMs);
       });
     }

     // Browser / Mock Window Execution
     const synth = targetWindow.speechSynthesis;
     const UtteranceClass = targetWindow.SpeechSynthesisUtterance;

     try {
       synth.cancel();
     } catch (e) {
       // Ignore cancel errors
     }

     return new Promise(resolve => {
       const utterance = new UtteranceClass(text);
       utterance.lang = lang;
       utterance.rate = rate;
       utterance.pitch = pitch;
       utterance.volume = volume;

       const selectedVoice = voice || getPreferredVoice(lang, targetWindow);
       if (selectedVoice) {
         utterance.voice = selectedVoice;
       }

       utterance.onstart = () => {
         isSpeakingState = true;
         currentUtterance = utterance;
         if (typeof onStart === 'function') onStart();
       };

       utterance.onend = () => {
         isSpeakingState = false;
         currentUtterance = null;
         if (typeof onEnd === 'function') onEnd();
         resolve(true);
       };

       utterance.onerror = (event) => {
         isSpeakingState = false;
         currentUtterance = null;
         if (event && event.error !== 'canceled' && typeof onError === 'function') {
           onError(event);
         }
         resolve(false);
       };

       try {
         synth.speak(utterance);
       } catch (err) {
         isSpeakingState = false;
         if (typeof onError === 'function') onError(err);
         resolve(false);
       }
     });
   }
   ```
3. **Context Support across all helper methods**:
   - `getVoices(langPrefix, targetWindow)`
   - `getPreferredVoice(lang, targetWindow)`
   - `stop(targetWindow)`
   - `pause(targetWindow)`
   - `resume(targetWindow)`
   - `isSpeaking(targetWindow)`
   - `speakTerm(vocabItem, options, targetWindow)`

---

## 4. Exact Drop-In Replacement Code

### 4.1 Proposed `src/services/storage.js`
Below is the complete drop-in replacement file content for `src/services/storage.js`:

```javascript
/**
 * src/services/storage.js
 * Unified Persistence & Data Management Service
 * 
 * Manages LocalStorage with in-memory fallback for Node.js / headless test environments.
 * Handles lesson CRUD, schema-validated JSON import/export, quiz results, and survey persistence.
 */

import { DEFAULT_LESSONS } from '../data/lessons.js';

// Storage Keys
export const STORAGE_KEYS = {
  LESSONS: 'khkt_lessons_v1',
  QUIZ_RESULTS: 'khkt_quiz_results_v1',
  SURVEY_RESULTS: 'khkt_survey_results_v1',
  APP_SETTINGS: 'khkt_settings_v1',
  CERTIFICATES: 'khkt_certificates_v1'
};

/**
 * Protected canonical lesson IDs that cannot be deleted or mutated away from isDefault.
 */
const PROTECTED_CANONICAL_IDS = [
  'lesson-lighthouse',
  'lesson-parabolic-arch',
  'lesson-bus-optimization',
  'lesson-optimization',
  'lesson-1-lighthouse',
  'lesson-2-parabolic-arch',
  'lesson-3-optimization-revenue'
];

/**
 * In-memory fallback storage for Node.js and headless environments.
 */
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

const memoryFallback = new MemoryStorage();

/**
 * Duck-type check if an object implements the Web Storage interface.
 * @param {any} obj
 * @returns {boolean}
 */
export function isStorageInstance(obj) {
  return Boolean(obj && typeof obj === 'object' && typeof obj.getItem === 'function');
}

/**
 * Safely resolves the active storage backend.
 * @param {Storage|MemoryStorage} [storageOverride=null]
 * @returns {Storage | MemoryStorage}
 */
export function getStorage(storageOverride = null) {
  if (isStorageInstance(storageOverride)) {
    return storageOverride;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const testKey = '__khkt_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      // Quota exceeded or private browsing restricted
      return memoryFallback;
    }
  }
  return memoryFallback;
}

/**
 * Checks whether persistent LocalStorage is active.
 * @param {Storage} [storageOverride=null]
 * @returns {boolean}
 */
export function isPersistent(storageOverride = null) {
  const active = getStorage(storageOverride);
  return typeof window !== 'undefined' && window.localStorage && active === window.localStorage;
}

/**
 * Initializes storage with default KHKT lessons if storage is empty.
 * @param {Array<Object>|Storage} [defaultLessonsOrStorage=DEFAULT_LESSONS]
 * @param {Storage} [storageOverride=null]
 * @returns {Array<Object>} The active lessons in storage
 */
export function initStorage(defaultLessonsOrStorage = DEFAULT_LESSONS, storageOverride = null) {
  let targetStorage = null;
  let lessonsToSeed = null;

  if (isStorageInstance(defaultLessonsOrStorage)) {
    targetStorage = defaultLessonsOrStorage;
    lessonsToSeed = (storageOverride && Array.isArray(storageOverride) && storageOverride.length > 0)
      ? storageOverride
      : DEFAULT_LESSONS;
  } else {
    lessonsToSeed = (Array.isArray(defaultLessonsOrStorage) && defaultLessonsOrStorage.length > 0)
      ? defaultLessonsOrStorage
      : DEFAULT_LESSONS;
    targetStorage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  }

  const raw = targetStorage.getItem(STORAGE_KEYS.LESSONS);
  
  const seedItems = () => {
    const seeded = lessonsToSeed.map(lesson => ({
      ...JSON.parse(JSON.stringify(lesson)),
      isDefault: true,
      updatedAt: new Date().toISOString()
    }));
    targetStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(seeded));
    return seeded;
  };

  if (!raw) {
    return seedItems();
  }

  try {
    const existing = JSON.parse(raw);
    if (!Array.isArray(existing) || existing.length === 0) {
      return seedItems();
    }
    return existing;
  } catch (err) {
    return seedItems();
  }
}

/**
 * Retrieves all lessons from storage.
 * Automatically seeds default KHKT lessons if storage is empty.
 * Supports polymorphic arguments:
 * - getLessons()
 * - getLessons(customStorage)
 * - getLessons(fallbackDefaults)
 * - getLessons(customStorage, fallbackDefaults)
 * - getLessons(fallbackDefaults, customStorage)
 * 
 * @param {Array<Object>|Storage} [storageOrDefaults=DEFAULT_LESSONS]
 * @param {Storage|Array<Object>} [secondaryParam=null]
 * @returns {Array<Object>}
 */
export function getLessons(storageOrDefaults = DEFAULT_LESSONS, secondaryParam = null) {
  let targetStorage = null;
  let defaults = DEFAULT_LESSONS;

  if (isStorageInstance(storageOrDefaults)) {
    targetStorage = storageOrDefaults;
    if (Array.isArray(secondaryParam) && secondaryParam.length > 0) {
      defaults = secondaryParam;
    }
  } else if (Array.isArray(storageOrDefaults) && storageOrDefaults.length > 0) {
    defaults = storageOrDefaults;
    if (isStorageInstance(secondaryParam)) {
      targetStorage = secondaryParam;
    }
  } else if (isStorageInstance(secondaryParam)) {
    targetStorage = secondaryParam;
  }

  if (!targetStorage) {
    targetStorage = getStorage();
  }

  const raw = targetStorage.getItem(STORAGE_KEYS.LESSONS);
  if (!raw) {
    return initStorage(defaults, targetStorage);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return initStorage(defaults, targetStorage);
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse lessons from storage, reinitializing...', e);
    return initStorage(defaults, targetStorage);
  }
}

/**
 * Retrieves a single lesson by ID.
 * @param {string} id
 * @param {Storage} [storageOverride=null]
 * @returns {Object|null}
 */
export function getLessonById(id, storageOverride = null) {
  if (!id) return null;
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const lessons = getLessons(DEFAULT_LESSONS, storage);
  return lessons.find(l => l.id === id) || null;
}

/**
 * Saves or updates a lesson in storage.
 * @param {Object} lesson
 * @param {Storage} [storageOverride=null]
 * @returns {{ success: boolean, lesson?: Object, error?: string }}
 */
export function saveLesson(lesson, storageOverride = null) {
  if (!lesson || typeof lesson !== 'object') {
    return { success: false, error: 'Invalid lesson object' };
  }
  if (!lesson.id || typeof lesson.id !== 'string') {
    return { success: false, error: 'Lesson ID is required and must be a string' };
  }
  if (!lesson.titleVi || !lesson.titleEn) {
    return { success: false, error: 'Bilingual titles (titleVi, titleEn) are required' };
  }
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length !== 5) {
    return { success: false, error: 'Lesson must contain exactly 5 scenes' };
  }

  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const lessons = getLessons(DEFAULT_LESSONS, storage);
  const now = new Date().toISOString();
  const index = lessons.findIndex(l => l.id === lesson.id);

  const updatedLesson = {
    ...JSON.parse(JSON.stringify(lesson)),
    updatedAt: now
  };

  const isProtected = PROTECTED_CANONICAL_IDS.includes(lesson.id);

  if (index >= 0) {
    // Preserve isDefault flag from existing or protected catalog
    if (lessons[index].isDefault || isProtected) {
      updatedLesson.isDefault = true;
    }
    lessons[index] = updatedLesson;
  } else {
    updatedLesson.createdAt = updatedLesson.createdAt || now;
    updatedLesson.isDefault = isProtected ? true : Boolean(lesson.isDefault);
    lessons.push(updatedLesson);
  }

  storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  return { success: true, lesson: updatedLesson };
}

/**
 * Deletes a custom lesson from storage.
 * Default KHKT lessons are strictly protected and cannot be deleted.
 * @param {string} id
 * @param {Storage} [storageOverride=null]
 * @returns {{ success: boolean, error?: string, id?: string }}
 */
export function deleteLesson(id, storageOverride = null) {
  if (!id) return { success: false, error: 'Lesson ID required' };
  
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const lessons = getLessons(DEFAULT_LESSONS, storage);
  const target = lessons.find(l => l.id === id);

  if (!target) {
    return { success: false, error: `Lesson '${id}' not found` };
  }

  if (target.isDefault === true || PROTECTED_CANONICAL_IDS.includes(id) || PROTECTED_CANONICAL_IDS.includes(target.id)) {
    return { success: false, error: 'Cannot delete default KHKT canonical lesson' };
  }

  const filtered = lessons.filter(l => l.id !== id);
  storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(filtered));
  return { success: true, id };
}

/**
 * Resets storage to the default canonical lessons.
 * @param {Array<Object>|Storage} [defaultLessonsOrStorage=DEFAULT_LESSONS]
 * @param {Storage} [storageOverride=null]
 * @returns {Array<Object>}
 */
export function resetToDefault(defaultLessonsOrStorage = DEFAULT_LESSONS, storageOverride = null) {
  let targetStorage = null;
  let lessonsToSeed = defaultLessonsOrStorage;

  if (isStorageInstance(defaultLessonsOrStorage)) {
    targetStorage = defaultLessonsOrStorage;
    lessonsToSeed = (storageOverride && Array.isArray(storageOverride)) ? storageOverride : DEFAULT_LESSONS;
  } else {
    targetStorage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
    lessonsToSeed = (Array.isArray(defaultLessonsOrStorage) && defaultLessonsOrStorage.length > 0)
      ? defaultLessonsOrStorage
      : DEFAULT_LESSONS;
  }

  targetStorage.removeItem(STORAGE_KEYS.LESSONS);
  return initStorage(lessonsToSeed, targetStorage);
}

/**
 * Exports all lessons as a formatted JSON string with metadata.
 * @param {Storage} [storageOverride=null]
 * @returns {string} JSON string
 */
export function exportLessonsJSON(storageOverride = null) {
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const lessons = getLessons(DEFAULT_LESSONS, storage);
  const exportData = {
    format: 'KHKT_CLIL_LESSONS_EXPORT',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalLessons: lessons.length,
    lessons: lessons
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports a single lesson as formatted JSON.
 * @param {string} id
 * @param {Storage} [storageOverride=null]
 * @returns {string|null}
 */
export function exportLessonJSON(id, storageOverride = null) {
  const lesson = getLessonById(id, storageOverride);
  if (!lesson) return null;
  const exportData = {
    format: 'KHKT_SINGLE_LESSON_EXPORT',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    lesson: lesson
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Validates the schema of an imported lesson object.
 * @param {Object} lesson
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLessonSchema(lesson) {
  if (!lesson || typeof lesson !== 'object') {
    return { valid: false, error: 'Lesson must be an object' };
  }
  const requiredStrings = ['id', 'titleVi', 'titleEn', 'topic'];
  for (const field of requiredStrings) {
    if (!lesson[field] || typeof lesson[field] !== 'string') {
      return { valid: false, error: `Missing or invalid required field '${field}'` };
    }
  }
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length !== 5) {
    return { valid: false, error: 'Lesson must have exactly 5 scenes in scenes array' };
  }
  const validKeys = ['context', 'facts', 'problem', 'guidance', 'practice'];
  for (let i = 0; i < 5; i++) {
    const s = lesson.scenes[i];
    if (!s || typeof s !== 'object' || !s.titleVi || !s.titleEn) {
      return { valid: false, error: `Scene at index ${i} missing required titleVi/titleEn` };
    }
    if (s.key && !validKeys.includes(s.key)) {
      return { valid: false, error: `Invalid scene key '${s.key}' at index ${i}` };
    }
  }
  if (!Array.isArray(lesson.vocabulary)) {
    return { valid: false, error: 'Vocabulary must be an array' };
  }
  if (!Array.isArray(lesson.quiz)) {
    return { valid: false, error: 'Quiz must be an array' };
  }
  return { valid: true };
}

/**
 * Imports lessons from a JSON string with comprehensive validation.
 * @param {string} jsonStr
 * @param {Storage} [storageOverride=null]
 * @returns {{ success: boolean, count?: number, importedIds?: string[], error?: string }}
 */
export function importLessonsJSON(jsonStr, storageOverride = null) {
  if (!jsonStr || typeof jsonStr !== 'string') {
    return { success: false, error: 'Input must be a non-empty string' };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    return { success: false, error: `Invalid JSON format: ${err.message}` };
  }

  let lessonsToImport = [];
  if (Array.isArray(parsed)) {
    lessonsToImport = parsed;
  } else if (parsed && Array.isArray(parsed.lessons)) {
    lessonsToImport = parsed.lessons;
  } else if (parsed && parsed.lesson && typeof parsed.lesson === 'object') {
    lessonsToImport = [parsed.lesson];
  } else if (parsed && typeof parsed === 'object' && parsed.id) {
    lessonsToImport = [parsed];
  } else {
    return { success: false, error: 'Unrecognized JSON structure: expected array or object containing lessons' };
  }

  if (lessonsToImport.length === 0) {
    return { success: false, error: 'No lessons found in import payload' };
  }

  const validatedLessons = [];
  for (let i = 0; i < lessonsToImport.length; i++) {
    const candidate = lessonsToImport[i];
    const validation = validateLessonSchema(candidate);
    if (!validation.valid) {
      return { success: false, error: `Validation failed for lesson at index ${i}: ${validation.error}` };
    }
    validatedLessons.push(candidate);
  }

  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const existingLessons = getLessons(DEFAULT_LESSONS, storage);
  const existingMap = new Map(existingLessons.map(l => [l.id, l]));
  const importedIds = [];

  for (const l of validatedLessons) {
    const existing = existingMap.get(l.id);
    const isDefault = (existing && existing.isDefault) || PROTECTED_CANONICAL_IDS.includes(l.id);
    existingMap.set(l.id, {
      ...l,
      isDefault: isDefault,
      updatedAt: new Date().toISOString()
    });
    importedIds.push(l.id);
  }

  const merged = Array.from(existingMap.values());
  storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(merged));

  return { success: true, count: validatedLessons.length, importedIds };
}

// ==========================================
// QUIZ & WORKSHEET PERSISTENCE
// ==========================================

export function getQuizResult(lessonId, storageOverride = null) {
  if (!lessonId) return null;
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const raw = storage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  if (!raw) return null;
  try {
    const map = JSON.parse(raw);
    return map[lessonId] || null;
  } catch (e) {
    return null;
  }
}

export function saveQuizResult(lessonId, result, storageOverride = null) {
  if (!lessonId || !result || typeof result !== 'object') {
    return { success: false, error: 'Invalid arguments' };
  }

  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  let map = {};
  const raw = storage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  if (raw) {
    try { map = JSON.parse(raw); } catch (e) { map = {}; }
  }

  const savedRecord = {
    lessonId,
    score: typeof result.score === 'number' ? result.score : 0,
    totalQuestions: result.totalQuestions || 0,
    correctAnswers: result.correctAnswers || 0,
    answers: Array.isArray(result.answers) ? result.answers : [],
    completedAt: new Date().toISOString()
  };

  map[lessonId] = savedRecord;
  storage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(map));
  return { success: true, result: savedRecord };
}

export function getAllQuizResults(storageOverride = null) {
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const raw = storage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

export function clearQuizResults(storageOverride = null) {
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  storage.removeItem(STORAGE_KEYS.QUIZ_RESULTS);
}

// ==========================================
// LEARNER SURVEY PERSISTENCE
// ==========================================

export function saveSurveyResult(lessonId, responses, storageOverride = null) {
  if (!lessonId || !responses) return { success: false, error: 'Invalid parameters' };
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  let map = {};
  const raw = storage.getItem(STORAGE_KEYS.SURVEY_RESULTS);
  if (raw) {
    try { map = JSON.parse(raw); } catch (e) { map = {}; }
  }

  const record = {
    lessonId,
    responses,
    submittedAt: new Date().toISOString()
  };

  map[lessonId] = record;
  storage.setItem(STORAGE_KEYS.SURVEY_RESULTS, JSON.stringify(map));
  return { success: true, survey: record };
}

export function getSurveyResult(lessonId, storageOverride = null) {
  if (!lessonId) return null;
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const raw = storage.getItem(STORAGE_KEYS.SURVEY_RESULTS);
  if (!raw) return null;
  try {
    const map = JSON.parse(raw);
    return map[lessonId] || null;
  } catch (e) {
    return null;
  }
}

export function getAllSurveyResults(storageOverride = null) {
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  const raw = storage.getItem(STORAGE_KEYS.SURVEY_RESULTS);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

export function clearAll(storageOverride = null) {
  const storage = isStorageInstance(storageOverride) ? storageOverride : getStorage();
  storage.clear();
}
```

---

### 4.2 Proposed `src/services/speech.js`
Below is the complete drop-in replacement file content for `src/services/speech.js`:

```javascript
/**
 * src/services/speech.js
 * Native Web Speech API Wrapper for Math-English Pronunciation
 * 
 * Complies with KHKT Criterion V2.4:
 * - Pedagogical rate control (120-140 WPM, default rate: 0.9)
 * - Offline native voice prioritization
 * - Polymorphic context handling (Browser window, Mock window, Node.js headless fallback)
 */

let voicesCache = [];
let voicesLoaded = false;
let currentUtterance = null;
let isSpeakingState = false;

/**
 * Checks if Web Speech API is supported in current or provided environment.
 * @param {Object} [win=null] - Optional browser window context
 * @returns {boolean}
 */
export function isSupported(win = null) {
  const targetWindow = win || (typeof window !== 'undefined' ? window : null);
  return Boolean(
    targetWindow &&
    targetWindow.speechSynthesis &&
    typeof targetWindow.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Initializes and caches available system voices.
 * @param {Object} [win=null]
 */
function initVoices(win = null) {
  const targetWindow = win || (typeof window !== 'undefined' ? window : null);
  if (!isSupported(targetWindow)) return;
  
  const synth = targetWindow.speechSynthesis;
  const updateVoices = () => {
    try {
      const voices = synth.getVoices();
      if (voices && voices.length > 0) {
        voicesCache = voices;
        voicesLoaded = true;
      }
    } catch (e) {
      // Ignored in restricted environments
    }
  };

  updateVoices();
  if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = updateVoices;
  }
}

// Auto-initialize on import in browser
if (typeof window !== 'undefined') {
  initVoices(window);
}

/**
 * Gets list of available voices, optionally filtered by language prefix.
 * @param {string} [langPrefix=''] - e.g. 'en' or 'vi'
 * @param {Object} [targetWindow=null] - Browser window context override
 * @returns {Array<SpeechSynthesisVoice>}
 */
export function getVoices(langPrefix = '', targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (!isSupported(win)) return [];
  if (voicesCache.length === 0 && win.speechSynthesis) {
    try {
      voicesCache = win.speechSynthesis.getVoices() || [];
    } catch (e) {
      voicesCache = [];
    }
  }
  if (!langPrefix) return voicesCache;
  return voicesCache.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
}

/**
 * Selects the optimal voice for a given language code.
 * Prioritizes local, high-clarity offline voices.
 * @param {string} [lang='en-US']
 * @param {Object} [targetWindow=null]
 * @returns {SpeechSynthesisVoice|null}
 */
export function getPreferredVoice(lang = 'en-US', targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  const voices = getVoices(lang.split('-')[0], win);
  if (!voices || voices.length === 0) return null;

  // Preferred English voice names
  const preferredNames = [
    'Samantha', 'Alex', 'Daniel', 'Victoria', 'Karen',
    'Google US English', 'Microsoft Zira', 'Microsoft David'
  ];

  for (const name of preferredNames) {
    const found = voices.find(v => v.name && v.name.includes(name));
    if (found) return found;
  }

  // Fallback to any local voice matching exact lang
  const exactLocal = voices.find(v => v.lang === lang && v.localService);
  if (exactLocal) return exactLocal;

  // Fallback to any voice matching exact lang
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;

  return voices[0] || null;
}

/**
 * Speaks text using Web Speech API with pedagogical settings.
 * Returns a Promise that resolves true on completion, false on cancel/error.
 * 
 * Supports polymorphic signatures:
 * - speak(text)
 * - speak(text, 'en-US')
 * - speak(text, 'en-US', window)
 * - speak(text, { lang: 'en-US', rate: 0.9 })
 * - speak(text, { lang: 'en-US' }, window)
 * - speak(text, window)
 * 
 * @param {string} text - Text to pronounce
 * @param {string|Object} [langOrOptions={}] - Language code or configuration options
 * @param {Object} [windowOverride=null] - Window context override (e.g. mock test context)
 * @returns {Promise<boolean>}
 */
export function speak(text, langOrOptions = {}, windowOverride = null) {
  if (!text || typeof text !== 'string') {
    return Promise.resolve(false);
  }

  let options = {};
  if (typeof langOrOptions === 'string') {
    options = { lang: langOrOptions };
  } else if (langOrOptions && typeof langOrOptions === 'object') {
    if (langOrOptions.speechSynthesis) {
      windowOverride = langOrOptions;
      options = {};
    } else {
      options = { ...langOrOptions };
    }
  }

  // Resolve target window context
  let targetWindow = windowOverride;
  if (!targetWindow && options.window) {
    targetWindow = options.window;
  }
  if (!targetWindow && typeof window !== 'undefined') {
    targetWindow = window;
  }

  const {
    lang = 'en-US',
    rate = 0.9,
    pitch = 1.0,
    volume = 1.0,
    voice = null,
    onStart = null,
    onEnd = null,
    onError = null
  } = options;

  // HEADLESS / MOCK FALLBACK (for Node.js or unsupported browsers without mock window)
  if (!isSupported(targetWindow)) {
    isSpeakingState = true;
    if (typeof onStart === 'function') {
      queueMicrotask(() => onStart());
    }
    return new Promise(resolve => {
      // Simulate realistic speech duration (approx 80ms per word)
      const wordCount = text.trim().split(/\s+/).length;
      const durationMs = Math.min(Math.max(wordCount * 80, 150), 2000);
      setTimeout(() => {
        isSpeakingState = false;
        if (typeof onEnd === 'function') onEnd();
        resolve(true);
      }, durationMs);
    });
  }

  // BROWSER / MOCK WINDOW EXECUTION
  const synth = targetWindow.speechSynthesis;
  const UtteranceClass = targetWindow.SpeechSynthesisUtterance;

  // Stop any active utterance to prevent speech stacking
  try {
    synth.cancel();
  } catch (e) {
    // Ignore cancel errors
  }

  return new Promise(resolve => {
    const utterance = new UtteranceClass(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const selectedVoice = voice || getPreferredVoice(lang, targetWindow);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      isSpeakingState = true;
      currentUtterance = utterance;
      if (typeof onStart === 'function') onStart();
    };

    utterance.onend = () => {
      isSpeakingState = false;
      currentUtterance = null;
      if (typeof onEnd === 'function') onEnd();
      resolve(true);
    };

    utterance.onerror = (event) => {
      isSpeakingState = false;
      currentUtterance = null;
      // 'canceled' is expected when stop() is called, do not treat as fatal
      if (event && event.error !== 'canceled' && typeof onError === 'function') {
        onError(event);
      }
      resolve(false);
    };

    try {
      synth.speak(utterance);
    } catch (err) {
      isSpeakingState = false;
      if (typeof onError === 'function') onError(err);
      resolve(false);
    }
  });
}

/**
 * Immediately cancels active speech and clears utterance queue.
 * @param {Object} [targetWindow=null]
 */
export function stop(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win)) {
    try {
      win.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
  isSpeakingState = false;
  currentUtterance = null;
}

/**
 * Pauses active speech.
 * @param {Object} [targetWindow=null]
 */
export function pause(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win) && win.speechSynthesis.speaking) {
    win.speechSynthesis.pause();
  }
}

/**
 * Resumes paused speech.
 * @param {Object} [targetWindow=null]
 */
export function resume(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win) && win.speechSynthesis.paused) {
    win.speechSynthesis.resume();
  }
}

/**
 * Returns whether speech is currently in progress.
 * @param {Object} [targetWindow=null]
 * @returns {boolean}
 */
export function isSpeaking(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win)) {
    return win.speechSynthesis.speaking || isSpeakingState;
  }
  return isSpeakingState;
}

/**
 * Convenience helper to pronounce a Math English vocabulary item.
 * Uses optimal pedagogical rate (0.85) for phonetics clarity.
 * @param {Object} vocabItem - { term, phonetics }
 * @param {Object} [options]
 * @param {Object} [targetWindow=null]
 * @returns {Promise<boolean>}
 */
export function speakTerm(vocabItem, options = {}, targetWindow = null) {
  if (!vocabItem || !vocabItem.term) return Promise.resolve(false);
  const win = targetWindow || (options && options.window ? options.window : null);
  return speak(vocabItem.term, {
    lang: 'en-US',
    rate: 0.85,
    pitch: 1.0,
    ...(typeof options === 'object' ? options : {})
  }, win);
}
```

---

## 5. Verification & Test Plan

1. **Verify Storage Service Fix (`F13.1`)**:
   Run:
   ```bash
   node --input-type=module -e '
   import { createBrowserContext } from "./tests/e2e/runner.js";
   import { getLessons } from "./src/services/storage.js";
   import assert from "node:assert/strict";

   const { localStorage } = createBrowserContext();
   const lessons = getLessons(localStorage);
   assert.ok(Array.isArray(lessons), "Lessons must be an array");
   assert.ok(lessons.length >= 3, "Must have at least 3 default lessons");
   console.log("F13.1 Verification PASS: count =", lessons.length);
   '
   ```
   *Expected Output*: `F13.1 Verification PASS: count = 3`

2. **Verify Speech Service Fix (`F5.5`)**:
   Run:
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
   console.log("F5.5 Verification PASS: recorded utterance =", window.speechSynthesis.lastUtterance.text);
   '
   ```
   *Expected Output*: `F5.5 Verification PASS: recorded utterance = Angle of elevation`

3. **Verify Adversarial Storage Invariants**:
   Run:
   ```bash
   node --test tests/verification_gate_adversarial.test.js
   ```
   *Expected Output*: Vectors 5 and 6 pass with 100% green checkmarks.

4. **Verify E2E Test Suite Runner**:
   After all 4 fixes (including Explorer 1 and Explorer 2 fixes) are applied:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected Output*: `ALL 175 E2E TESTS PASSED SUCCESSFULLY!`.
