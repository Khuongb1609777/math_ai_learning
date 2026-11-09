/**
 * proposed_khkt_data_patch.js
 * Proposed aliases and backward-compatible exports to append to src/data/khkt_data.js
 * 
 * Purpose: Ensures direct in-memory compatibility with tests/e2e/tier1_features.test.js (F2.1 - F2.5, F9.1)
 * without needing the test runner to fall back to reading extracted_doc.txt from disk.
 */

import {
  SEVEN_STEP_PEDAGOGY,
  EMPIRICAL_STUDY,
  SCIENTIFIC_FOUNDATIONS,
  AI_DISCLOSURE_DECLARATION,
  LIKERT_SURVEY_STATEMENTS
} from './khkt_data.js';

/**
 * Standardized pedagogical steps alias for F2.1
 */
export const pedagogicalSteps = SEVEN_STEP_PEDAGOGY.map(s => ({
  step: s.step,
  id: s.id,
  titleVi: s.nameVi,
  titleEn: s.nameEn,
  nameVi: s.nameVi,
  nameEn: s.nameEn,
  objectiveVi: s.objectiveVi,
  inputsVi: s.inputsVi,
  outputsVi: s.outputsVi,
  actorsVi: s.actorsVi
}));

/**
 * Standardized empirical study dataset alias for F2.2 & F2.3
 */
export const empiricalData = {
  sampleSize: EMPIRICAL_STUDY.sampleSize,
  school: EMPIRICAL_STUDY.school,
  preTestMean: EMPIRICAL_STUDY.preTestAverage,
  postTestMean: EMPIRICAL_STUDY.postTestAverage,
  scoreDelta: EMPIRICAL_STUDY.scoreDelta,
  pValue: EMPIRICAL_STUDY.pValue,
  cohensD: 1.95,
  indicators: {
    factExtractionGain: 28.7,
    mathModelingGain: 34.5,
    mathEnglishGain: 40.6,
    realInterpretationGain: 32.5
  },
  metrics: EMPIRICAL_STUDY.metrics,
  satisfaction: EMPIRICAL_STUDY.satisfaction
};

/**
 * Standardized theoretical pillars alias for F2.4
 */
export const theoreticalPillars = SCIENTIFIC_FOUNDATIONS.map(f => ({
  id: f.id,
  title: f.nameVi,
  titleEn: f.nameEn,
  author: f.citation,
  summary: f.summaryVi,
  steps: f.steps || []
}));

/**
 * Standardized Circular 84 AI disclosure alias for F2.5
 */
export const aiDisclosure = AI_DISCLOSURE_DECLARATION.map(item => ({
  tool: item.tool,
  purpose: item.purposeVi,
  aiRole: item.aiAssistedVi,
  studentVerification: item.studentVerifiedVi
}));

/**
 * Standardized survey statements alias for F9.1
 */
export const surveyStatements = LIKERT_SURVEY_STATEMENTS;
