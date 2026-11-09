/**
 * tests/verification_gate_adversarial.test.js
 * Empirical Adversarial Test Suite for Milestone M1 Verification Gate & Storage Integrity
 * Authored by Challenger 2 (Verification Gate Challenger)
 * 
 * Tests the 6 required attack vectors:
 * 1. 9 passed criteria and 1 failed criterion (both Math and English)
 * 2. Forged criteria using duplicates or fake codes to simulate 10 items
 * 3. Null, undefined, empty, or malformed criteria inputs
 * 4. Certificate generation for unverified or partially verified lessons
 * 5. Deletion of default KHKT sample lessons from storage
 * 6. Malformed or tampered JSON payloads imported into storage
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_CRITERIA_IDS,
  VERIFICATION_CRITERIA_DEFINITIONS,
  canPublish,
  evaluateCriteria,
  getPublishGateReport,
  generateCertificate
} from '../src/services/verification.js';
import {
  initStorage,
  getLessons,
  getLessonById,
  saveLesson,
  deleteLesson,
  importLessonsJSON,
  clearAll
} from '../src/services/storage.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

const CANONICAL_IDS = ['M1', 'M2', 'M3', 'M4', 'M5', 'E1', 'E2', 'E3', 'E4', 'E5'];

function createValid10Criteria(overrides = {}) {
  return CANONICAL_IDS.map(id => ({
    id,
    layer: id.startsWith('M') ? 'math' : 'english',
    titleVi: `Tiêu chí ${id}`,
    titleEn: `Criterion ${id}`,
    passed: overrides[id] !== undefined ? overrides[id] : true,
    verifiedBy: 'Adversarial Test Runner',
    notes: 'Verified'
  }));
}

// =========================================================================
// ATTACK VECTOR 1: 9 PASSED CRITERIA AND 1 FAILED CRITERION
// =========================================================================
describe('Adversarial Vector 1: 9 Passed Criteria + 1 Failed Criterion', () => {
  it('strictly blocks publication when each of M1..M5 fails individually', () => {
    const mathIds = ['M1', 'M2', 'M3', 'M4', 'M5'];
    for (const failId of mathIds) {
      const criteria = createValid10Criteria({ [failId]: false });
      const allowed = canPublish(criteria);
      assert.equal(
        allowed,
        false,
        `Publishing MUST be blocked when Math criterion ${failId} fails (9/10 passed)`
      );
    }
  });

  it('strictly blocks publication when each of E1..E5 fails individually', () => {
    const englishIds = ['E1', 'E2', 'E3', 'E4', 'E5'];
    for (const failId of englishIds) {
      const criteria = createValid10Criteria({ [failId]: false });
      const allowed = canPublish(criteria);
      assert.equal(
        allowed,
        false,
        `Publishing MUST be blocked when English criterion ${failId} fails (9/10 passed)`
      );
    }
  });

  it('strictly blocks publication when one criterion is omitted completely (length = 9)', () => {
    for (const omitId of CANONICAL_IDS) {
      const incomplete = createValid10Criteria().filter(c => c.id !== omitId);
      assert.equal(incomplete.length, 9);
      assert.equal(
        canPublish(incomplete),
        false,
        `Publishing MUST be blocked when criterion ${omitId} is missing (array length 9)`
      );
    }
  });

  it('publish gate report correctly diagnoses single failure as blocker', () => {
    const lesson = {
      ...DEFAULT_LESSONS[0],
      verification: createValid10Criteria({ M3: false })
    };
    const report = getPublishGateReport(lesson);
    assert.equal(report.canPublish, false);
    assert.equal(report.passedCriteria, 9);
    assert.equal(report.failedCriteria.length, 1);
    assert.equal(report.failedCriteria[0].id, 'M3');
    assert.ok(report.blockers.length > 0);
  });
});

// =========================================================================
// ATTACK VECTOR 2: FORGING CRITERIA (DUPLICATES & FAKE CODES)
// =========================================================================
describe('Adversarial Vector 2: Forging Criteria (Duplicates & Fake Codes)', () => {
  it('strictly rejects criteria list containing exact duplicate IDs', () => {
    const duplicateList = [
      ...createValid10Criteria().slice(0, 9),
      { id: 'M1', layer: 'math', passed: true } // Duplicate M1 instead of E5
    ];
    assert.equal(duplicateList.length, 10);
    assert.equal(
      canPublish(duplicateList),
      false,
      'Duplicate criterion ID must be rejected by gatekeeper'
    );
  });

  it('strictly rejects alias duplicates (e.g. M1 and V1.1 representing same criterion)', () => {
    const aliasDuplicateList = [
      { id: 'M1', layer: 'math', passed: true },
      { id: 'V1.1', layer: 'math', passed: true },
      { id: 'M2', layer: 'math', passed: true },
      { id: 'M3', layer: 'math', passed: true },
      { id: 'M4', layer: 'math', passed: true },
      { id: 'E1', layer: 'english', passed: true },
      { id: 'E2', layer: 'english', passed: true },
      { id: 'E3', layer: 'english', passed: true },
      { id: 'E4', layer: 'english', passed: true },
      { id: 'E5', layer: 'english', passed: true }
    ];
    assert.equal(
      canPublish(aliasDuplicateList),
      false,
      'Alias duplicate M1 and V1.1 must be rejected by gatekeeper'
    );
  });

  it('strictly rejects forged criteria using 10 fabricated fake codes', () => {
    const completelyFakeCodes = [
      { id: 'FAKE_M1', layer: 'math', passed: true },
      { id: 'FAKE_M2', layer: 'math', passed: true },
      { id: 'FAKE_M3', layer: 'math', passed: true },
      { id: 'FAKE_M4', layer: 'math', passed: true },
      { id: 'FAKE_M5', layer: 'math', passed: true },
      { id: 'FAKE_E1', layer: 'english', passed: true },
      { id: 'FAKE_E2', layer: 'english', passed: true },
      { id: 'FAKE_E3', layer: 'english', passed: true },
      { id: 'FAKE_E4', layer: 'english', passed: true },
      { id: 'FAKE_E5', layer: 'english', passed: true }
    ];

    const result = canPublish(completelyFakeCodes);
    assert.equal(
      result,
      false,
      'SECURITY INVARIANT VIOLATED: Gatekeeper MUST reject completely fabricated criteria codes that are not in REQUIRED_CRITERIA_IDS'
    );
  });

  it('strictly rejects replacing a failed criterion with a fake code to reach 10/10', () => {
    const forgedToReachTen = [
      { id: 'M1', layer: 'math', passed: true },
      { id: 'M2', layer: 'math', passed: true },
      { id: 'M3', layer: 'math', passed: true },
      { id: 'M4', layer: 'math', passed: true },
      { id: 'M5', layer: 'math', passed: true },
      { id: 'E1', layer: 'english', passed: true },
      { id: 'E2', layer: 'english', passed: true },
      { id: 'E3', layer: 'english', passed: true },
      { id: 'E4', layer: 'english', passed: true },
      { id: 'FAKE_CODE', layer: 'english', passed: true } // Substituted for failed E5
    ];

    const result = canPublish(forgedToReachTen);
    assert.equal(
      result,
      false,
      'SECURITY INVARIANT VIOLATED: Gatekeeper MUST reject criteria list with 9 valid and 1 fake code'
    );
  });
});

// =========================================================================
// ATTACK VECTOR 3: NULL, UNDEFINED, EMPTY, AND MALFORMED INPUTS
// =========================================================================
describe('Adversarial Vector 3: Null, Undefined, Empty, & Malformed Inputs', () => {
  it('returns false for null, undefined, primitives, and empty arrays', () => {
    assert.equal(canPublish(null), false);
    assert.equal(canPublish(undefined), false);
    assert.equal(canPublish([]), false);
    assert.equal(canPublish({}), false);
    assert.equal(canPublish(''), false);
    assert.equal(canPublish(123), false);
    assert.equal(canPublish(false), false);
  });

  it('returns false for sparse arrays and arrays of nulls', () => {
    assert.equal(canPublish(new Array(10)), false);
    assert.equal(canPublish(new Array(10).fill(null)), false);
    assert.equal(canPublish(new Array(10).fill({})), false);
  });

  it('strictly rejects truthy string coercion (passed: "true")', () => {
    const stringTruthy = CANONICAL_IDS.map(id => ({
      id,
      layer: id.startsWith('M') ? 'math' : 'english',
      passed: 'true'
    }));
    assert.equal(canPublish(stringTruthy), false, 'String "true" must not bypass boolean check');
  });

  it('returns false when lesson object has empty or null verification property', () => {
    assert.equal(canPublish({ verification: null }), false);
    assert.equal(canPublish({ verification: [] }), false);
    assert.equal(canPublish({ verification: undefined }), false);
  });
});

// =========================================================================
// ATTACK VECTOR 4: CERTIFICATE GENERATION FOR UNVERIFIED LESSONS
// =========================================================================
describe('Adversarial Vector 4: Certificate Generation Bypasses', () => {
  it('throws error when generating certificate for empty lesson object', () => {
    assert.throws(
      () => generateCertificate({}),
      /Cannot issue KHKT certificate/
    );
  });

  it('throws error when generating certificate for partially verified lesson (9 passed, 1 failed)', () => {
    const unverifiedLesson = {
      ...DEFAULT_LESSONS[0],
      verification: createValid10Criteria({ E4: false })
    };
    assert.throws(
      () => generateCertificate(unverifiedLesson),
      /Cannot issue KHKT certificate/
    );
  });

  it('strictly throws error when attempting to generate certificate with forged fake criteria', () => {
    const forgedLesson = {
      id: 'lesson-forged',
      titleVi: 'Bài học giả mạo',
      titleEn: 'Forged Lesson',
      topic: 'quadratic',
      verification: [
        { id: 'FAKE_M1', layer: 'math', passed: true },
        { id: 'FAKE_M2', layer: 'math', passed: true },
        { id: 'FAKE_M3', layer: 'math', passed: true },
        { id: 'FAKE_M4', layer: 'math', passed: true },
        { id: 'FAKE_M5', layer: 'math', passed: true },
        { id: 'FAKE_E1', layer: 'english', passed: true },
        { id: 'FAKE_E2', layer: 'english', passed: true },
        { id: 'FAKE_E3', layer: 'english', passed: true },
        { id: 'FAKE_E4', layer: 'english', passed: true },
        { id: 'FAKE_E5', layer: 'english', passed: true }
      ]
    };

    assert.throws(
      () => generateCertificate(forgedLesson),
      /Cannot issue KHKT certificate/,
      'SECURITY INVARIANT VIOLATED: generateCertificate MUST NOT issue certificate for lesson with fake criteria'
    );
  });
});

// =========================================================================
// ATTACK VECTOR 5: ATTEMPTED DELETION OF DEFAULT KHKT SAMPLE LESSONS
// =========================================================================
describe('Adversarial Vector 5: Storage Integrity & Default Lesson Deletion', () => {
  test.beforeEach(() => {
    clearAll();
    initStorage(DEFAULT_LESSONS);
  });

  it('strictly rejects direct deletion of all 3 default KHKT lessons', () => {
    const defaultIds = [
      'lesson-lighthouse',
      'lesson-parabolic-arch',
      'lesson-bus-optimization'
    ];

    for (const id of defaultIds) {
      const res = deleteLesson(id);
      assert.equal(res.success, false, `Deletion of default lesson '${id}' must fail`);
      assert.match(res.error, /Cannot delete default KHKT/);
    }

    assert.equal(getLessons().length, 3, 'All 3 default lessons must remain in storage');
  });

  it('prevents evasion by mutating isDefault to false via saveLesson', () => {
    const original = getLessonById('lesson-lighthouse');
    assert.ok(original);

    // Attempt to update with isDefault: false
    const tampered = { ...original, isDefault: false };
    const saveRes = saveLesson(tampered);
    assert.equal(saveRes.success, true);
    assert.equal(saveRes.lesson.isDefault, true, 'saveLesson must preserve isDefault flag');

    // Attempt to delete after save
    const deleteRes = deleteLesson('lesson-lighthouse');
    assert.equal(deleteRes.success, false);
    assert.equal(getLessons().length, 3);
  });

  it('prevents deletion using whitespace or case variants', () => {
    assert.equal(deleteLesson('lesson-lighthouse ').success, false);
    assert.equal(deleteLesson('LESSON-LIGHTHOUSE').success, false);
    assert.equal(getLessons().length, 3);
  });
});

// =========================================================================
// ATTACK VECTOR 6: MALFORMED OR TAMPERED JSON IMPORT PAYLOADS
// =========================================================================
describe('Adversarial Vector 6: Malformed & Tampered JSON Payloads', () => {
  test.beforeEach(() => {
    clearAll();
    initStorage(DEFAULT_LESSONS);
  });

  it('rejects syntax error and non-JSON string imports', () => {
    const res1 = importLessonsJSON('{ "unclosed": ');
    assert.equal(res1.success, false);
    assert.match(res1.error, /Invalid JSON format/);

    const res2 = importLessonsJSON('plain string');
    assert.equal(res2.success, false);
  });

  it('rejects null, empty string, and empty array imports', () => {
    assert.equal(importLessonsJSON(null).success, false);
    assert.equal(importLessonsJSON('').success, false);
    assert.equal(importLessonsJSON('[]').success, false);
  });

  it('rejects payload missing required fields (id, titleVi, titleEn, topic)', () => {
    const missingTitle = JSON.stringify([{
      id: 'test-1',
      titleVi: 'Toán',
      // missing titleEn
      topic: 'quadratic',
      scenes: []
    }]);
    const res = importLessonsJSON(missingTitle);
    assert.equal(res.success, false);
    assert.match(res.error, /titleEn/);
  });

  it('strictly rejects lessons with scene counts other than exactly 5', () => {
    const makeScenes = (count) => Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      titleVi: `Cảnh ${i + 1}`,
      titleEn: `Scene ${i + 1}`
    }));

    // 4 scenes (under)
    const payload4 = JSON.stringify([{
      id: 'test-4-scenes',
      titleVi: 'Bài 4 cảnh',
      titleEn: '4-Scene Lesson',
      topic: 'quadratic',
      scenes: makeScenes(4),
      vocabulary: [],
      quiz: []
    }]);
    const res4 = importLessonsJSON(payload4);
    assert.equal(res4.success, false);
    assert.match(res4.error, /exactly 5 scenes/);

    // 6 scenes (over)
    const payload6 = JSON.stringify([{
      id: 'test-6-scenes',
      titleVi: 'Bài 6 cảnh',
      titleEn: '6-Scene Lesson',
      topic: 'quadratic',
      scenes: makeScenes(6),
      vocabulary: [],
      quiz: []
    }]);
    const res6 = importLessonsJSON(payload6);
    assert.equal(res6.success, false);
    assert.match(res6.error, /exactly 5 scenes/);
  });

  it('rejects lessons with invalid or tampered scene keys', () => {
    const tamperedScenes = [
      { key: 'context', titleVi: '1', titleEn: '1' },
      { key: 'facts', titleVi: '2', titleEn: '2' },
      { key: 'problem', titleVi: '3', titleEn: '3' },
      { key: 'guidance', titleVi: '4', titleEn: '4' },
      { key: 'malicious_exploit_key', titleVi: '5', titleEn: '5' }
    ];
    const payload = JSON.stringify([{
      id: 'test-bad-key',
      titleVi: 'Bài',
      titleEn: 'Lesson',
      topic: 'quadratic',
      scenes: tamperedScenes,
      vocabulary: [],
      quiz: []
    }]);
    const res = importLessonsJSON(payload);
    assert.equal(res.success, false);
    assert.match(res.error, /Invalid scene key/);
  });

  it('rejects payload where vocabulary or quiz is not an array', () => {
    const scenes5 = Array.from({ length: 5 }, (_, i) => ({
      titleVi: `Cảnh ${i + 1}`,
      titleEn: `Scene ${i + 1}`
    }));

    const badVocab = JSON.stringify([{
      id: 'bad-vocab',
      titleVi: 'V', titleEn: 'E', topic: 't',
      scenes: scenes5,
      vocabulary: 'not an array',
      quiz: []
    }]);
    assert.equal(importLessonsJSON(badVocab).success, false);

    const badQuiz = JSON.stringify([{
      id: 'bad-quiz',
      titleVi: 'V', titleEn: 'E', topic: 't',
      scenes: scenes5,
      vocabulary: [],
      quiz: { object: 'not array' }
    }]);
    assert.equal(importLessonsJSON(badQuiz).success, false);
  });

  it('protects default lessons when imported payload attempts to unset isDefault', () => {
    const defaultLesson = DEFAULT_LESSONS[0];
    const maliciousImport = JSON.stringify([{
      ...defaultLesson,
      titleVi: 'Tiêu đề sửa đổi',
      isDefault: false
    }]);

    const importRes = importLessonsJSON(maliciousImport);
    assert.equal(importRes.success, true);

    const lessonAfter = getLessonById(defaultLesson.id);
    assert.equal(lessonAfter.isDefault, true, 'isDefault must remain true after import');

    const deleteRes = deleteLesson(defaultLesson.id);
    assert.equal(deleteRes.success, false);
    assert.equal(getLessons().length, 3);
  });
});
