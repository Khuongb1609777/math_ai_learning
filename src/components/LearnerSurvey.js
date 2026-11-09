/**
 * src/components/LearnerSurvey.js
 * Pedagogical Learner Survey Component (Feature F9)
 * 
 * Replicates the authentic bilingual survey instrument from the KHKT Research Report Annex:
 * - 6 standardized statements on cognitive load reduction, CLIL vocabulary acquisition, and modeling
 * - 5-point Likert scale (1 = Strongly Disagree to 5 = Strongly Agree)
 * - Real-time calculation of Average Score and Positive Rating Percentage (>=4)
 * - Benchmark comparison against N=400 empirical study findings
 * - LocalStorage persistence with anonymous participant ID
 */

import { EMPIRICAL_STUDY_DATA } from '../data/khkt_data.js';

export class LearnerSurvey {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container] - Mounting DOM node
   * @param {'vi'|'en'|'dual'} [options.language='dual'] - Bilingual display mode
   * @param {Function} [options.onNavigate] - Tab navigation callback
   */
  constructor(options = {}) {
    this.container = options.container || null;
    this.language = ['vi', 'en', 'dual'].includes(options.language) ? options.language : 'dual';
    this.onNavigate = options.onNavigate || (() => {});

    // Survey Statements
    this.statements = [
      {
        id: 1,
        textVi: 'Video AI giúp em dễ dàng hình dung bối cảnh thực tế của bài toán.',
        textEn: 'The AI video helps me easily visualize the real-world context of the problem.'
      },
      {
        id: 2,
        textVi: 'Sau khi xem video, em xác định đúng các dữ kiện và ẩn số cần tìm.',
        textEn: 'After watching, I correctly identify given data and unknown variables.'
      },
      {
        id: 3,
        textVi: 'Thuật ngữ tiếng Anh Toán trong video dễ hiểu và bổ ích cho việc học CLIL.',
        textEn: 'The Math English terminology in the video is clear and beneficial for CLIL learning.'
      },
      {
        id: 4,
        textVi: 'Các câu hỏi gợi mở giúp em tự lập được phương trình / mô hình toán học.',
        textEn: 'Guided questions help me formulate the equation or mathematical model by myself.'
      },
      {
        id: 5,
        textVi: 'Âm thanh giọng đọc AI và phụ đề song ngữ rõ ràng, chuẩn ngữ âm.',
        textEn: 'The AI voiceover and bilingual subtitles are clear with authentic pronunciation.'
      },
      {
        id: 6,
        textVi: 'Video tập trung vào trọng tâm, không chứa chi tiết gây nhiễu làm em hiểu sai.',
        textEn: 'The video is focused and contains no distracting details causing misunderstanding.'
      }
    ];

    // Survey State
    this.ratings = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5 }; // default high satisfaction
    this.isSubmitted = false;
    this.stats = null;
    this.participantId = `HS_${Math.floor(1000 + Math.random() * 9000)}`;

    if (this.container) {
      this.mount(this.container);
    }
  }

  mount(container) {
    this.container = container;
    this.render();
  }

  setLanguage(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    this.language = lang;
    this.render();
  }

  calculateStats() {
    const values = Object.values(this.ratings);
    if (values.length === 0) return { mean: 5, positivePct: 100 };

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = Math.round((sum / values.length) * 100) / 100;
    const positiveCount = values.filter(v => v >= 4).length;
    const positivePct = Math.round((positiveCount / values.length) * 100 * 10) / 10;

    return { mean, positivePct, totalCount: values.length };
  }

  handleSubmit() {
    this.isSubmitted = true;
    this.stats = this.calculateStats();

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const payload = {
          participantId: this.participantId,
          ratings: this.ratings,
          stats: this.stats,
          submittedAt: new Date().toISOString()
        };
        window.localStorage.setItem(`survey_${this.participantId}`, JSON.stringify(payload));
      } catch (e) {}
    }

    this.render();
  }

  render() {
    if (!this.container) return;

    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';
    const stats = this.stats || this.calculateStats();

    const likertLabels = [
      { score: 1, vi: 'Hoàn toàn không đồng ý', en: 'Strongly Disagree' },
      { score: 2, vi: 'Không đồng ý', en: 'Disagree' },
      { score: 3, vi: 'Phân vân / Trung lập', en: 'Neutral' },
      { score: 4, vi: 'Đồng ý', en: 'Agree' },
      { score: 5, vi: 'Hoàn toàn đồng ý', en: 'Strongly Agree' }
    ];

    this.container.innerHTML = `
      <div class="learner-survey max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
        <!-- Survey Header Banner -->
        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div class="relative z-10 max-w-2xl space-y-3">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-blue-950 uppercase tracking-wider shadow-sm">
              📋 ${isEn ? 'Standardized Survey Instrument' : 'Mẫu Phiếu Phản Hồi Trải Nghiệm Học Tập'}
            </span>
            <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              ${isEn ? 'Bilingual Learner Experience Survey' : 'Khảo Sát Đánh Giá Trải Nghiệm Học Toán Song Ngữ'}
            </h1>
            <p class="text-blue-200 text-sm sm:text-base leading-relaxed">
              ${isEn 
                ? 'Standardized Likert 5-point evaluation measuring cognitive load reduction, contextual visualization, and Math English acquisition.'
                : 'Thang đo Likert 5 mức độ đánh giá mức độ giảm tải nhận thức, hiệu quả trực quan hóa bối cảnh và khả năng tiếp thu thuật ngữ Math English.'}
            </p>
          </div>
        </div>

        <!-- Submission Feedback Summary Banner (if submitted) -->
        ${this.isSubmitted ? `
          <div class="p-6 sm:p-8 bg-emerald-50 border-2 border-emerald-500 rounded-3xl shadow-lg space-y-6 animate-scaleIn">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-emerald-200">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-3xl flex items-center justify-center shadow-inner">
                  ✓
                </div>
                <div>
                  <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Mã học sinh: ${this.participantId}</div>
                  <div class="text-2xl font-black text-emerald-950 mt-0.5">
                    ${isEn ? 'Survey Submitted Successfully!' : 'Đã Ghi Nhận Phản Hồi Của Bạn!'}
                  </div>
                  <div class="text-xs text-emerald-700 mt-1">
                    Cảm ơn bạn đã đóng góp số liệu thực nghiệm cho đề tài Nghiên cứu Khoa học Kỹ thuật.
                  </div>
                </div>
              </div>

              <!-- Metrics -->
              <div class="flex items-center gap-4">
                <div class="text-center px-5 py-3 rounded-2xl bg-white shadow-sm border border-emerald-200">
                  <div class="text-xs font-bold text-slate-500 uppercase">Điểm TB / Mean</div>
                  <div class="text-3xl font-black text-emerald-800">${stats.mean.toFixed(2)}<span class="text-sm text-slate-400">/5</span></div>
                </div>
                <div class="text-center px-5 py-3 rounded-2xl bg-white shadow-sm border border-emerald-200">
                  <div class="text-xs font-bold text-slate-500 uppercase">Hài lòng / Positive</div>
                  <div class="text-3xl font-black text-blue-800">${stats.positivePct}%</div>
                </div>
              </div>
            </div>

            <!-- Comparison with KHKT N=400 Study -->
            <div class="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 text-xs leading-relaxed text-slate-700">
              <div class="font-bold text-blue-950 uppercase flex items-center gap-1.5">
                📊 So sánh với thực nghiệm diện rộng KHKT (N = 400 học sinh THPT Trần Văn Kiết):
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-600">
                <div>• Tỉ lệ học sinh đánh giá video hữu ích: <strong>89.5%</strong></div>
                <div>• Mức độ tăng điểm đọc hiểu & mô hình hóa: <strong>+2.43 điểm</strong> (5.42 → 7.85)</div>
                <div>• Tỉ lệ nắm vững từ vựng Math English: <strong>+40.6%</strong> (31.2% → 71.8%)</div>
                <div>• Tỉ lệ lập mô hình toán học phù hợp: <strong>+34.5%</strong> (42.0% → 76.5%)</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Survey Statements Form -->
        <div class="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-8">
          <div class="space-y-1">
            <h2 class="text-lg font-black text-slate-900">
              ${isEn ? '6 Evaluation Statements' : '6 Tiêu Chí Đánh Giá Trải Nghiệm'}
            </h2>
            <p class="text-xs text-slate-500">
              Thang điểm 1 (Hoàn toàn không đồng ý) đến 5 (Hoàn toàn đồng ý)
            </p>
          </div>

          <div class="space-y-6">
            ${this.statements.map((st) => {
              const currentScore = this.ratings[st.id] || 5;

              return `
                <div class="statement-card p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 transition hover:border-blue-300 hover:bg-blue-50/20" data-statement-id="${st.id}">
                  <div class="flex items-start gap-3">
                    <span class="w-7 h-7 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ${st.id}
                    </span>
                    <div class="flex-1">
                      <div class="text-sm font-bold text-slate-900 leading-snug">
                        ${st.textVi}
                      </div>
                      ${isDual ? `<div class="text-xs font-medium text-slate-500 mt-1">${st.textEn}</div>` : ''}
                    </div>
                  </div>

                  <!-- 5-Point Likert Radios -->
                  <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    ${likertLabels.map((lbl) => {
                      const isSelected = currentScore === lbl.score;

                      return `
                        <label class="likert-label flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition select-none ${isSelected ? 'border-blue-600 bg-blue-100/60 text-blue-950 font-bold ring-2 ring-blue-500/20' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}">
                          <input type="radio" name="st_${st.id}" value="${lbl.score}" class="sr-only" ${isSelected ? 'checked' : ''} ${this.isSubmitted ? 'disabled' : ''}>
                          <span class="text-lg font-black ${isSelected ? 'text-blue-900' : 'text-slate-400'}">${lbl.score}</span>
                          <span class="text-[11px] leading-tight mt-1">
                            ${isEn ? lbl.en : lbl.vi}
                          </span>
                        </label>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${!this.isSubmitted ? `
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div class="text-xs text-slate-500">
                Toàn bộ dữ liệu phản hồi được mã hóa ẩn danh tuân thủ quy chuẩn nghiên cứu KHKT.
              </div>
              <button type="button" class="btn-submit-survey px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg hover:shadow-blue-500/25 transition">
                🚀 ${isEn ? 'Submit Survey Responses' : 'Gửi Đánh Giá Của Bạn'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    if (!this.container) return;

    // Likert score radio changes
    this.container.querySelectorAll('.likert-label input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (this.isSubmitted) return;
        const card = e.target.closest('.statement-card');
        const stId = card?.dataset?.statementId;
        if (stId) {
          this.ratings[stId] = parseInt(e.target.value, 10);
          this.render();
        }
      });
    });

    // Submit button
    this.container.querySelector('.btn-submit-survey')?.addEventListener('click', () => {
      this.handleSubmit();
    });
  }

  destroy() {
    this.container = null;
  }
}
