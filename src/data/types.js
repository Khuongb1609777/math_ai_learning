/**
 * @fileoverview Complete JSDoc type definitions for Math-English CLIL Core Data Models.
 * Compatible with TypeScript checking via `// @ts-check` and IDE autocomplete.
 */

/**
 * @typedef {Object} VocabularyItem
 * @property {string} term - Math English terminology (e.g. "Angle of elevation")
 * @property {string} phonetics - Standard IPA transcription enclosed in slashes (e.g. "/ˈæŋ.ɡəl əv ˌel.ɪˈveɪ.ʃən/")
 * @property {'noun' | 'noun phrase' | 'verb' | 'adjective' | 'adverb'} partOfSpeech - Grammatical category
 * @property {string} definitionVi - Pedagogical definition in Vietnamese
 * @property {string} definitionEn - Pedagogical definition in English
 * @property {string} exampleSentence - Contextual bilingual sentence demonstrating authentic usage
 * @property {string} [audioUrl] - Optional pre-recorded audio pronunciation URL
 */

/**
 * @typedef {'context' | 'facts' | 'problem' | 'guidance' | 'practice'} SceneKey
 */

/**
 * @typedef {Object} Scene
 * @property {number} id - Scene index (1 to 5)
 * @property {SceneKey} key - Canonical scene identifier
 * @property {string} titleVi - Vietnamese title (e.g. "Mở đầu bối cảnh")
 * @property {string} titleEn - English title (e.g. "Context Introduction")
 * @property {string} contentVi - Spoken narrative script in Vietnamese
 * @property {string} contentEn - Spoken narrative script in English
 * @property {string} visualDescriptionVi - Visual staging and graphic prompt description in Vietnamese
 * @property {string} visualDescriptionEn - Visual staging and graphic prompt description in English
 * @property {string[]} formulas - Mathematical expressions relevant to the scene
 * @property {string} checkpointVi - Pedagogical reflection checkpoint in Vietnamese
 * @property {string} checkpointEn - Pedagogical reflection checkpoint in English
 * @property {'svg-lighthouse' | 'svg-parabola' | 'svg-optimization' | string} [interactiveType] - Associated dynamic interactive simulation component
 */

/**
 * @typedef {'fact_extraction' | 'modeling' | 'math_english'} QuestionType
 */

/**
 * @typedef {Object} ScaffoldedHints
 * @property {string} hint1Vi - Level 1 Conceptual direction hint (Vietnamese)
 * @property {string} hint1En - Level 1 Conceptual direction hint (English)
 * @property {string} hint2Vi - Level 2 Misconception analysis hint (Vietnamese)
 * @property {string} hint2En - Level 2 Misconception analysis hint (English)
 * @property {string} solutionVi - Level 3 Complete mathematical step-by-step solution (Vietnamese)
 * @property {string} solutionEn - Level 3 Complete mathematical step-by-step solution (English)
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id - Unique question identifier (e.g. "q1_lighthouse_data")
 * @property {1 | 2 | 3} tier - Cognitive tier: 1 (Fact extraction), 2 (Modeling), 3 (Math English)
 * @property {QuestionType} type - Category of learning objective
 * @property {string} questionVi - Question stem in Vietnamese
 * @property {string} questionEn - Question stem in English
 * @property {string[]} optionsVi - Exactly 4 answer choices in Vietnamese
 * @property {string[]} optionsEn - Exactly 4 answer choices in English
 * @property {number} correctIndex - 0-based index of correct option (0, 1, 2, or 3)
 * @property {string} explanationVi - Comprehensive rationale in Vietnamese
 * @property {string} explanationEn - Comprehensive rationale in English
 * @property {ScaffoldedHints} [hints] - Scaffolded multi-tiered feedback
 */

/**
 * @typedef {'math' | 'english'} VerificationLayer
 */

/**
 * @typedef {Object} VerificationCriterion
 * @property {string} id - Unique criterion code ('V1.1' to 'V1.5', 'V2.1' to 'V2.5')
 * @property {VerificationLayer} layer - Layer classification ('math' or 'english')
 * @property {string} code - Machine-readable identifier
 * @property {string} titleVi - Vietnamese criterion title
 * @property {string} titleEn - English criterion title
 * @property {string} descriptionVi - Detailed evaluation standard in Vietnamese
 * @property {string} descriptionEn - Detailed evaluation standard in English
 * @property {boolean} mandatory - Strictly required for publishing gate (always true)
 * @property {boolean} passed - Current audit assessment state
 * @property {string} verifiedBy - Name of auditor / teacher / expert
 * @property {string} verifiedAt - ISO timestamp of verification check
 * @property {string} notes - Audit evidence and notes justifying the pass/fail determination
 */

/**
 * @typedef {'trigonometry' | 'quadratic' | 'optimization'} LessonTopic
 */

/**
 * @typedef {'DRAFT' | 'VERIFIED' | 'PUBLISHED'} LessonStatus
 */

/**
 * @typedef {Object} Lesson
 * @property {string} id - Canonical lesson slug (e.g. "lesson-lighthouse")
 * @property {LessonTopic} topic - Mathematical domain classification
 * @property {string} topicTitleVi - Topic title in Vietnamese
 * @property {string} topicTitleEn - Topic title in English
 * @property {string} titleVi - Lesson title in Vietnamese
 * @property {string} titleEn - Lesson title in English
 * @property {string} grade - Academic level (default "10")
 * @property {'Basic' | 'Medium' | 'Advanced'} difficulty - Pedagogical difficulty rating
 * @property {number} estimatedMinutes - Estimated duration of instructional engagement
 * @property {string} thumbnail - Relative URL path to lesson card image
 * @property {string} realWorldContextVi - Summary of the real-world scenario in Vietnamese
 * @property {string} realWorldContextEn - Summary of the real-world scenario in English
 * @property {Scene[]} scenes - Exactly 5 sequential bilingual scenes
 * @property {VocabularyItem[]} vocabulary - Math English CLIL glossary entries
 * @property {QuizQuestion[]} quiz - Exactly 5 multi-tiered interactive assessment items
 * @property {VerificationCriterion[]} verification - 10-criteria dual-layer inspection matrix
 * @property {LessonStatus} status - Publication lifecycle state
 * @property {string} author - Lesson creator or KHKT attribution
 * @property {string} publishedAt - ISO timestamp of publication
 */

/**
 * @typedef {Object} QuizResult
 * @property {string} lessonId - Target lesson identifier
 * @property {number} score - Achieved score (0 to 10 points)
 * @property {number} maxScore - Maximum possible score (10 points)
 * @property {number} correctCount - Number of correctly answered questions
 * @property {number} totalQuestions - Total count of questions (5)
 * @property {Record<string, number>} answers - Map of question ID to chosen option index
 * @property {string} completedAt - ISO timestamp of submission
 * @property {boolean} passed - Mastery status (score >= 8.0)
 */

/**
 * @typedef {Object} SurveyResponse
 * @property {string} lessonId - Associated lesson
 * @property {number[]} ratings - 6 ratings on 1-5 Likert scale
 * @property {string} studentNotes - Optional student comments
 * @property {string} submittedAt - ISO timestamp
 */

/**
 * Export empty object for ES module compatibility.
 */
export default {};
