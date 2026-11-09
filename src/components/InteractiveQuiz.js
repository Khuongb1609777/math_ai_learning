/**
 * src/components/InteractiveQuiz.js
 * Interactive Worksheet & Multi-Tier Quiz Component (Feature F7 & F8)
 * 
 * Features:
 * - 3 Cognitive Tiers: Fact Extraction, Math Modeling, Math English Terminology
 * - Tri-state Bilingual Presentation (Vietnamese, English, Dual side-by-side)
 * - Instant Automated 10-Point Scoring Engine
 * - Step-by-Step Pedagogical Scaffolding & Explanations with Scene cross-references
 * - Score Persistence in LocalStorage
 */

import { DEFAULT_LESSONS } from '../data/lessons.js';
import { getLessonById, getLessons } from '../services/storage.js';

export class InteractiveQuiz {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container] - Mounting DOM node
   * @param {string} [options.lessonId] - Target lesson slug
   * @param {'vi'|'en'|'dual'} [options.language='dual'] - Bilingual display mode
   * @param {Function} [options.onBackToLesson] - Return to 5-scene player
   * @param {Function} [options.onBackToExplore] - Return to Explorer
   * @param {Function} [options.onNavigate] - Navigate to other tabs (e.g. survey)
   */
  constructor(options = {}) {
    this.container = options.container || null;
    this.onBackToLesson = options.onBackToLesson || (() => {});
    this.onBackToExplore = options.onBackToExplore || (() => {});
    this.onNavigate = options.onNavigate || (() => {});

    this.language = ['vi', 'en', 'dual'].includes(options.language) ? options.language : 'dual';
    this.allLessons = this.loadAllLessons();
    this.lesson = this.resolveLesson(options.lessonId);

    // Quiz State
    this.userAnswers = {}; // { [questionId]: selectedOptionIndex }
    this.isSubmitted = false;
    this.scoreResult = null;

    // Load any existing saved score
    this.loadSavedResult();

    if (this.container) {
      this.mount(this.container);
    }
  }

  loadAllLessons() {
    try {
      const list = getLessons();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (e) {}
    return DEFAULT_LESSONS;
  }

  resolveLesson(lessonId) {
    if (lessonId) {
      try {
        const found = getLessonById(lessonId);
        if (found) return found;
      } catch (e) {}
      const fromList = this.allLessons.find(l => l.id === lessonId);
      if (fromList) return fromList;
    }
    return this.allLessons[0] || DEFAULT_LESSONS[0];
  }

  loadSavedResult() {
    if (typeof window !== 'undefined' && window.localStorage && this.lesson) {
      try {
        const raw = window.localStorage.getItem(`quiz_${this.lesson.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.score === 'number') {
            this.savedScore = parsed;
          }
        }
      } catch (e) {}
    }
  }

  saveResult(result) {
    if (typeof window !== 'undefined' && window.localStorage && this.lesson) {
      try {
        window.localStorage.setItem(`quiz_${this.lesson.id}`, JSON.stringify(result));
      } catch (e) {}
    }
  }

  setLanguage(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    this.language = lang;
    this.render();
  }

  setLesson(lessonId) {
    this.lesson = this.resolveLesson(lessonId);
    this.userAnswers = {};
    this.isSubmitted = false;
    this.scoreResult = null;
    this.loadSavedResult();
    this.render();
  }

  mount(container) {
    this.container = container;
    this.render();
  }

  /**
   * Helper to format localized text
   */
  t(vi, en) {
    if (this.language === 'vi') return vi;
    if (this.language === 'en') return en;
    return `${vi} <span class="text-blue-500 font-normal">/</span> <span class="text-slate-600">${en}</span>`;
  }

  /**
   * Calculate 10-point scale score
   */
  calculateScore() {
    const questions = this.lesson.quiz || [];
    if (questions.length === 0) return { score: 10, total: 0, correctCount: 0, breakdown: {} };

    let correctCount = 0;
    const breakdown = {
      fact_extraction: { correct: 0, total: 0 },
      modeling: { correct: 0, total: 0 },
      math_english: { correct: 0, total: 0 }
    };

    questions.forEach(q => {
      const type = q.type || 'modeling';
      if (!breakdown[type]) breakdown[type] = { correct: 0, total: 0 };
      breakdown[type].total += 1;

      const userAns = this.userAnswers[q.id];
      if (userAns !== undefined && userAns === q.correctIndex) {
        correctCount += 1;
        breakdown[type].correct += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 10 * 10) / 10;

    return {
      score,
      total: questions.length,
      correctCount,
      breakdown,
      completedAt: new Date().toISOString()
    };
  }

  handleSubmit() {
    const questions = this.lesson.quiz || [];
    const answeredCount = Object.keys(this.userAnswers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = confirm(
        this.language === 'en'
          ? `You have answered ${answeredCount}/${questions.length} questions. Do you still want to submit?`
          : `Bạn mới trả lời ${answeredCount}/${questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài chấm điểm ngay?`
      );
      if (!confirmSubmit) return;
    }

    this.isSubmitted = true;
    this.scoreResult = this.calculateScore();
    this.saveResult(this.scoreResult);
    this.render();

    // Scroll to results summary smoothly
    const resultEl = this.container?.querySelector('#quiz-result-banner');
    if (resultEl) {
      resultEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleRetake() {
    this.userAnswers = {};
    this.isSubmitted = false;
    this.scoreResult = null;
    this.render();
  }

  render() {
    if (!this.container || !this.lesson) return;

    const isEn = this.language === 'en';
    const isVi = this.language === 'vi';
    const isDual = this.language === 'dual';
    const questions = this.lesson.quiz || [];

    const tierBadge = (type) => {
      switch (type) {
        case 'fact_extraction':
          return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            📊 ${isEn ? 'Tier 1: Fact Extraction' : 'Tầng 1: Đọc hiểu Dữ kiện thực tế'}
          </span>`;
        case 'modeling':
          return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            📐 ${isEn ? 'Tier 2: Math Modeling' : 'Tầng 2: Mô hình hóa Toán học'}
          </span>`;
        case 'math_english':
          return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            🌐 ${isEn ? 'Tier 3: Math English (CLIL)' : 'Tầng 3: Thuật ngữ Math English'}
          </span>`;
        default:
          return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            ✏️ ${isEn ? 'Question' : 'Câu hỏi'}
          </span>`;
      }
    };

    const scaffoldHint = (type) => {
      switch (type) {
        case 'fact_extraction':
          return isEn 
            ? '💡 Hint: Review Scene 2 (Given Facts) to isolate authentic measurements.'
            : '💡 Gợi ý: Hãy xem lại Phân cảnh 2: Dữ kiện thực tế để xác định đúng số liệu.';
        case 'modeling':
          return isEn
            ? '💡 Hint: Review Scene 4 (Modeling Guidance) to formulate the exact equations.'
            : '💡 Gợi ý: Hãy xem lại Phân cảnh 4: Gợi mở tư duy mô hình hóa để thiết lập phương trình.';
        case 'math_english':
          return isEn
            ? '💡 Hint: Review Scene 3 (Math English Vocabulary) with native audio pronunciation.'
            : '💡 Gợi ý: Hãy xem lại Bảng từ vựng Math English tại Phân cảnh 3 để củng cố thuật ngữ.';
        default:
          return '';
      }
    };

    this.container.innerHTML = `
      <div class="interactive-quiz max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
        <!-- Top Navigation Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div class="flex items-center gap-3">
            <button type="button" class="btn-back-to-lesson px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition flex items-center gap-2">
              ← ${isEn ? 'Back to 5-Scene Lesson' : 'Quay lại Bài học 5 màn'}
            </button>
            <button type="button" class="btn-back-to-explore px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition flex items-center gap-2">
              🏠 ${isEn ? 'Topic Explorer' : 'Danh mục bài toán'}
            </button>
          </div>

          <!-- Lesson Selector -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${isEn ? 'Lesson:' : 'Bài học:'}</span>
            <select class="quiz-lesson-select text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500">
              ${this.allLessons.map(l => `
                <option value="${l.id}" ${l.id === this.lesson.id ? 'selected' : ''}>
                  ${isEn ? l.titleEn : l.titleVi}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Quiz Header Banner -->
        <div class="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div class="relative z-10 max-w-2xl space-y-3">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
                📝 ${isEn ? 'Interactive Worksheet & CLIL Quiz' : 'Phiếu Học Tập Tương Tác & Chấm Điểm Thang 10'}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-800 text-blue-200 border border-blue-600">
                Lớp 10 • KHKT 2026-2027
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              ${isEn ? this.lesson.titleEn : this.lesson.titleVi}
            </h1>
            <p class="text-blue-200 text-sm leading-relaxed">
              ${isEn 
                ? 'Assess your understanding across 3 essential cognitive tiers: fact extraction, mathematical modeling, and Math English terminology.'
                : 'Đánh giá năng lực toàn diện qua 3 tầng nhận thức cốt lõi: đọc hiểu bóc tách dữ kiện, xây dựng mô hình toán học và vận dụng thuật ngữ tiếng Anh chuyên ngành.'}
            </p>
          </div>
        </div>

        <!-- Results Banner (If Submitted) -->
        ${this.isSubmitted && this.scoreResult ? `
          <div id="quiz-result-banner" class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 ${this.scoreResult.score >= 8 ? 'border-emerald-500 bg-emerald-50/30' : this.scoreResult.score >= 5 ? 'border-blue-500 bg-blue-50/30' : 'border-amber-500 bg-amber-50/30'} space-y-6 animate-scaleIn">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${this.scoreResult.score >= 8 ? 'bg-emerald-100 text-emerald-700' : this.scoreResult.score >= 5 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}">
                  ${this.scoreResult.score >= 8 ? '🏆' : this.scoreResult.score >= 5 ? '🎯' : '📚'}
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">${isEn ? 'Evaluation Result' : 'Kết quả đánh giá học tập'}</div>
                  <div class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    ${this.scoreResult.score >= 8 
                      ? (isEn ? 'Outstanding Achievement!' : 'Xuất Sắc! Nắm Vững Kiến Thức') 
                      : this.scoreResult.score >= 5 
                      ? (isEn ? 'Good Effort — Passed!' : 'Rất Tốt! Đạt Yêu Cầu') 
                      : (isEn ? 'Keep Practicing!' : 'Cần Tiếp Tục Ôn Luyện')}
                  </div>
                  <div class="text-sm text-slate-600 mt-1">
                    ${isEn 
                      ? `Correct answers: ${this.scoreResult.correctCount}/${this.scoreResult.total} questions`
                      : `Số câu trả lời đúng: ${this.scoreResult.correctCount}/${this.scoreResult.total} câu hỏi`}
                  </div>
                </div>
              </div>

              <!-- Big Score Badge -->
              <div class="text-center px-6 py-4 rounded-2xl bg-white shadow-md border border-slate-200">
                <div class="text-xs font-bold text-slate-500 uppercase">${isEn ? 'Total Score' : 'Điểm Số'}</div>
                <div class="text-4xl sm:text-5xl font-black text-blue-900 tracking-tight">
                  ${this.scoreResult.score.toFixed(1)}<span class="text-lg text-slate-400 font-medium">/10</span>
                </div>
              </div>
            </div>

            <!-- Tier Breakdown Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div class="text-xs font-bold text-amber-900 uppercase">📊 ${isEn ? 'Fact Extraction' : 'Đọc Hiểu Dữ Kiện'}</div>
                <div class="text-2xl font-extrabold text-amber-950 mt-1">
                  ${this.scoreResult.breakdown.fact_extraction ? `${this.scoreResult.breakdown.fact_extraction.correct}/${this.scoreResult.breakdown.fact_extraction.total}` : '1/1'}
                </div>
                <div class="text-xs text-amber-700 mt-0.5">${isEn ? 'Real-world Context' : 'Bóc tách số liệu thực tiễn'}</div>
              </div>

              <div class="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div class="text-xs font-bold text-blue-900 uppercase">📐 ${isEn ? 'Math Modeling' : 'Mô Hình Hóa'}</div>
                <div class="text-2xl font-extrabold text-blue-950 mt-1">
                  ${this.scoreResult.breakdown.modeling ? `${this.scoreResult.breakdown.modeling.correct}/${this.scoreResult.breakdown.modeling.total}` : '1/1'}
                </div>
                <div class="text-xs text-blue-700 mt-0.5">${isEn ? 'Equations & Formulas' : 'Thiết lập công thức toán học'}</div>
              </div>

              <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div class="text-xs font-bold text-emerald-900 uppercase">🌐 ${isEn ? 'Math English' : 'Tiếng Anh Toán'}</div>
                <div class="text-2xl font-extrabold text-emerald-950 mt-1">
                  ${this.scoreResult.breakdown.math_english ? `${this.scoreResult.breakdown.math_english.correct}/${this.scoreResult.breakdown.math_english.total}` : '1/1'}
                </div>
                <div class="text-xs text-emerald-700 mt-0.5">${isEn ? 'CLIL Terminology' : 'Vốn từ vựng chuyên ngành'}</div>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button type="button" class="btn-retake px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition">
                🔄 ${isEn ? 'Retake Worksheet' : 'Làm lại phiếu học tập'}
              </button>
              <button type="button" class="btn-go-survey px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition">
                📋 ${isEn ? 'Go to Learner Survey (KHKT)' : 'Đánh giá khảo sát học sinh →'}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Questions List -->
        <div class="space-y-6">
          ${questions.map((q, qIndex) => {
            const userChoice = this.userAnswers[q.id];
            const isAnswered = userChoice !== undefined;
            const isCorrect = isAnswered && userChoice === q.correctIndex;
            const isWrong = this.isSubmitted && isAnswered && !isCorrect;
            const options = q.optionsVi || q.optionsEn || [];

            return `
              <div class="question-card p-6 bg-white rounded-2xl shadow-sm border ${this.isSubmitted ? (isCorrect ? 'border-emerald-300 bg-emerald-50/10' : 'border-rose-300 bg-rose-50/10') : 'border-slate-200'} space-y-4 transition" data-question-id="${q.id}">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="w-7 h-7 rounded-lg bg-blue-900 text-white font-black text-sm flex items-center justify-center shadow-sm">
                      ${qIndex + 1}
                    </span>
                    ${tierBadge(q.type)}
                  </div>

                  ${this.isSubmitted ? `
                    <div>
                      ${isCorrect ? `
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          ✓ ${isEn ? 'Correct (+3.3 pts)' : 'Chính xác! (+3.3 điểm)'}
                        </span>
                      ` : `
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                          ✗ ${isEn ? 'Incorrect' : 'Chưa chính xác'}
                        </span>
                      `}
                    </div>
                  ` : ''}
                </div>

                <!-- Question Text -->
                <div class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  ${isDual 
                    ? `<div>${q.questionVi}</div><div class="text-sm font-semibold text-blue-700 mt-1">${q.questionEn}</div>`
                    : isEn ? q.questionEn : q.questionVi}
                </div>

                <!-- Options -->
                <div class="space-y-2.5 pt-1">
                  ${options.map((opt, optIndex) => {
                    const optEn = q.optionsEn && q.optionsEn[optIndex] ? q.optionsEn[optIndex] : '';
                    const isSelected = userChoice === optIndex;
                    const isTargetCorrect = this.isSubmitted && optIndex === q.correctIndex;
                    const isTargetUserWrong = this.isSubmitted && isSelected && !isCorrect;

                    let optClasses = 'border-slate-200 hover:border-blue-400 bg-slate-50/50 text-slate-800';
                    if (isSelected && !this.isSubmitted) {
                      optClasses = 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-500/20';
                    } else if (this.isSubmitted) {
                      if (isTargetCorrect) {
                        optClasses = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-500/30';
                      } else if (isTargetUserWrong) {
                        optClasses = 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-500/30 line-through opacity-80';
                      } else {
                        optClasses = 'border-slate-200 bg-white opacity-60 text-slate-600';
                      }
                    }

                    return `
                      <label class="option-label flex items-start gap-3 p-3.5 rounded-xl border ${optClasses} cursor-pointer transition select-none">
                        <input type="radio" name="q_${q.id}" value="${optIndex}" class="mt-1 text-blue-600 focus:ring-blue-500 h-4 w-4" ${isSelected ? 'checked' : ''} ${this.isSubmitted ? 'disabled' : ''}>
                        <div class="flex-1 text-sm leading-relaxed">
                          <span class="font-bold text-slate-900 mr-2">${String.fromCharCode(65 + optIndex)}.</span>
                          ${isDual ? `<span>${opt}</span> <span class="text-slate-500 text-xs block sm:inline mt-0.5 sm:mt-0 font-medium">(${optEn})</span>` : isEn ? optEn : opt}
                        </div>
                        ${this.isSubmitted && isTargetCorrect ? '<span class="text-emerald-600 font-bold text-sm">✓</span>' : ''}
                      </label>
                    `;
                  }).join('')}
                </div>

                <!-- Explanation & Scaffold Hint (After Submission) -->
                ${this.isSubmitted ? `
                  <div class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm leading-relaxed">
                    <div class="font-bold text-slate-900 flex items-center gap-1.5">
                      📖 ${isEn ? 'Pedagogical Explanation & Modeling Step:' : 'Lời giải chi tiết & Bước mô hình hóa:'}
                    </div>
                    <div class="text-slate-700">
                      ${isEn ? q.explanationEn : q.explanationVi}
                    </div>
                    <div class="text-xs text-blue-800 font-semibold pt-1">
                      ${scaffoldHint(q.type)}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Bottom Action Bar -->
        ${!this.isSubmitted ? `
          <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-slate-600">
              ${isEn 
                ? `Answer all questions to receive instant 10-point scoring.` 
                : `Hoàn thành các câu hỏi để nhận kết quả phân tích điểm số thang 10.`}
            </div>
            <button type="button" class="btn-submit-quiz px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg hover:shadow-emerald-500/25 transition">
              🚀 ${isEn ? 'Submit & Grade Worksheet' : 'Nộp Bài & Chấm Điểm Ngay'}
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    if (!this.container) return;

    // Back buttons
    this.container.querySelector('.btn-back-to-lesson')?.addEventListener('click', () => {
      this.onBackToLesson();
    });

    this.container.querySelector('.btn-back-to-explore')?.addEventListener('click', () => {
      this.onBackToExplore();
    });

    // Lesson selector
    this.container.querySelector('.quiz-lesson-select')?.addEventListener('change', (e) => {
      this.setLesson(e.target.value);
    });

    // Radio option selections
    this.container.querySelectorAll('.option-label input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (this.isSubmitted) return;
        const qCard = e.target.closest('.question-card');
        const qId = qCard?.dataset?.questionId;
        if (qId) {
          this.userAnswers[qId] = parseInt(e.target.value, 10);
          this.render();
        }
      });
    });

    // Submit button
    this.container.querySelector('.btn-submit-quiz')?.addEventListener('click', () => {
      this.handleSubmit();
    });

    // Retake button
    this.container.querySelector('.btn-retake')?.addEventListener('click', () => {
      this.handleRetake();
    });

    // Go to survey button
    this.container.querySelector('.btn-go-survey')?.addEventListener('click', () => {
      this.onNavigate('survey');
    });
  }

  destroy() {
    this.container = null;
  }
}
