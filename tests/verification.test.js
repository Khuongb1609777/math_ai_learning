/**
 * Dual-Layer Verification Engine Unit Tests — Node.js Native Test Runner
 * Validates the 10-criteria inspection matrix, publishing gate, and certificate generator.
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REQUIRED_CRITERIA_IDS,
  VERIFICATION_CRITERIA_DEFINITIONS,
  evaluateCriteria,
  canPublish,
  getPublishGateReport,
  generateCertificate
} from '../src/services/verification.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

describe('Dual-Layer Verification Engine: Criteria Structure', () => {
  it('enforces exactly 10 criteria definitions across Math and English layers', () => {
    assert.equal(VERIFICATION_CRITERIA_DEFINITIONS.length, 10);
    const mathDefs = VERIFICATION_CRITERIA_DEFINITIONS.filter((c) => c.layer === 'math');
    const englishDefs = VERIFICATION_CRITERIA_DEFINITIONS.filter((c) => c.layer === 'english');

    assert.equal(mathDefs.length, 5, 'Must have exactly 5 Math criteria (V1.1-V1.5 / M1-M5)');
    assert.equal(englishDefs.length, 5, 'Must have exactly 5 English criteria (V2.1-V2.5 / E1-E5)');
  });

  it('contains valid definitions with bilingual titles and descriptions', () => {
    for (const def of VERIFICATION_CRITERIA_DEFINITIONS) {
      assert.ok(def.id, 'Criterion must have id');
      assert.ok(def.layer, 'Criterion must have layer');
      assert.ok(def.titleVi && def.titleEn, 'Criterion must have bilingual titles');
      assert.ok(def.descriptionVi && def.descriptionEn, 'Criterion must have bilingual descriptions');
    }
  });
});

describe('Dual-Layer Verification Engine: Automated Evaluation', () => {
  it('evaluates all 3 default KHKT lessons as 100% PASS', () => {
    for (const lesson of DEFAULT_LESSONS) {
      const evaluation = evaluateCriteria(lesson);
      assert.equal(evaluation.length, 10, `${lesson.id} must produce 10 evaluated criteria`);
      const allPassed = evaluation.every(c => c.passed === true);
      assert.ok(allPassed, `${lesson.id} must pass 100% of criteria`);
      assert.equal(canPublish(lesson), true, `${lesson.id} must pass canPublish gate`);
    }
  });

  it('detects missing scenes and fails V1.1 (Data Consistency)', () => {
    const invalidLesson = {
      ...DEFAULT_LESSONS[0],
      scenes: DEFAULT_LESSONS[0].scenes.slice(0, 3) // Only 3 scenes
    };
    const evaluation = evaluateCriteria(invalidLesson);
    const v1 = evaluation.find(c => c.id === 'V1.1');
    assert.ok(v1, 'V1.1 must exist in evaluation');
    assert.equal(v1.passed, false, 'V1.1 must fail when fewer than 5 scenes exist');
  });

  it('detects insufficient vocabulary and fails V2.1', () => {
    const invalidLesson = {
      ...DEFAULT_LESSONS[0],
      vocabulary: [] // Empty vocabulary
    };
    const evaluation = evaluateCriteria(invalidLesson);
    const v2_1 = evaluation.find(c => c.id === 'V2.1');
    assert.equal(v2_1.passed, false, 'V2.1 must fail when vocabulary has fewer than 3 terms');
  });

  it('detects missing or invalid IPA format and fails V2.2', () => {
    const invalidLesson = {
      ...DEFAULT_LESSONS[0],
      vocabulary: [
        { term: 'Test', phonetics: 'no-slashes', definitionVi: 'test', definitionEn: 'test' },
        { term: 'Test2', phonetics: '/test2/', definitionVi: 'test', definitionEn: 'test' },
        { term: 'Test3', phonetics: '/test3/', definitionVi: 'test', definitionEn: 'test' }
      ]
    };
    const evaluation = evaluateCriteria(invalidLesson);
    const v2_2 = evaluation.find(c => c.id === 'V2.2');
    assert.equal(v2_2.passed, false, 'V2.2 must fail when IPA is not enclosed in slashes');
  });
});

describe('Dual-Layer Verification Engine: Publishing Gate Enforcement', () => {
  const createMockCriteria = (overrides = {}) => {
    return [
      'M1', 'M2', 'M3', 'M4', 'M5',
      'E1', 'E2', 'E3', 'E4', 'E5'
    ].map((id) => ({
      id,
      layer: id.startsWith('M') ? 'math' : 'english',
      titleVi: `Tiêu chí ${id}`,
      titleEn: `Criterion ${id}`,
      passed: overrides[id] !== undefined ? overrides[id] : true,
    }));
  };

  it('allows publication when all 10 criteria evaluate to passed: true', () => {
    const validCriteria = createMockCriteria();
    assert.equal(canPublish(validCriteria), true, '10/10 PASS must allow publication');
  });

  it('strictly blocks publication if any single Math criterion fails (e.g., M3 = false)', () => {
    const failingMath = createMockCriteria({ M3: false });
    assert.equal(canPublish(failingMath), false, 'Failed Math criterion M3 must block publication');
  });

  it('strictly blocks publication if any single English criterion fails (e.g., E1 = false)', () => {
    const failingEnglish = createMockCriteria({ E1: false });
    assert.equal(canPublish(failingEnglish), false, 'Failed English criterion E1 must block publication');
  });

  it('rejects publication when criteria list is empty, null, or undefined', () => {
    assert.equal(canPublish([]), false);
    assert.equal(canPublish(null), false);
    assert.equal(canPublish(undefined), false);
  });

  it('rejects publication when criteria list contains fewer than 10 items', () => {
    const incompleteCriteria = createMockCriteria().slice(0, 9);
    assert.equal(canPublish(incompleteCriteria), false, '9 criteria must not pass gate');
  });

  it('rejects publication when duplicate criteria attempt to forge 10 items', () => {
    const forgedCriteria = [
      ...createMockCriteria().slice(0, 9),
      { id: 'M1', layer: 'math', passed: true }, // Duplicate M1 instead of E5
    ];
    assert.equal(canPublish(forgedCriteria), false, 'Duplicate criteria must fail completeness check');
  });
});

describe('Dual-Layer Verification Engine: Diagnostic Report & Certificates', () => {
  const sampleLesson = DEFAULT_LESSONS[0];

  it('generates accurate publish gate report for valid lesson', () => {
    const report = getPublishGateReport(sampleLesson);
    assert.equal(report.canPublish, true);
    assert.equal(report.totalCriteria, 10);
    assert.equal(report.passedCriteria, 10);
    assert.equal(report.failedCriteria.length, 0);
    assert.equal(report.math.passed, true);
    assert.equal(report.english.passed, true);
  });

  it('generates a valid KHKT certificate when 100% criteria are verified', () => {
    const cert = generateCertificate(sampleLesson);

    assert.ok(cert.certificateId.startsWith('KHKT-CERT-LESSONLIGHTHOUSE'));
    assert.equal(cert.status, 'VERIFIED_AND_CERTIFIED');
    assert.equal(cert.verifiedCriteriaCount, 10);
    assert.equal(cert.mathPassRate, '5/5 (100%)');
    assert.equal(cert.englishPassRate, '5/5 (100%)');
    assert.equal(cert.signatories.length, 2);
  });

  it('throws an explicit error when attempting to generate certificate for unverified lesson', () => {
    const unverifiedLesson = {
      ...sampleLesson,
      verification: sampleLesson.verification.map(c => ({
        ...c,
        passed: c.id === 'V1.3' ? false : c.passed
      }))
    };

    assert.throws(
      () => generateCertificate(unverifiedLesson),
      /Cannot issue KHKT certificate/
    );
  });
});
