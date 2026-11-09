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
