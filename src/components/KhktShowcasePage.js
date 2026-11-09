/**
 * src/components/KhktShowcasePage.js
 * Dedicated Full-Page KHKT Research Showcase & Pedagogy View (Tab: showcase)
 * 
 * Features:
 * - Standalone full-page view replacing modal as requested by user
 * - Project Metadata: Phạm Nguyễn Ti Na (10A1), GVHD: Lê Thanh Tâm, THPT Trần Văn Kiết
 * - 5 Comprehensive Sections:
 *   1. Sơ đồ Quy trình 7 bước chuẩn hóa (kèm ảnh Hình 1)
 *   2. Số liệu thực nghiệm sư phạm N = 400 học sinh (kèm biểu đồ Hình 3, Hình 4)
 *   3. 4 Trụ cột lý luận khoa học (Blum & Leiß, Goldin, CLIL, Mayer)
 *   4. Bảng kiểm chứng 2 lớp (Toán học & Ngôn ngữ)
 *   5. Khai báo trung thực AI theo Thông tư 84/2026/TT-BGDĐT
 * - Bilingual presentation (VI / EN / DUAL)
 */

import {
  KHKT_METADATA,
  SEVEN_STEP_PEDAGOGY,
  EMPIRICAL_STUDY,
  SCIENTIFIC_FOUNDATIONS,
  AI_DISCLOSURE_DECLARATION
} from '../data/khkt_data.js';

export class KhktShowcasePage {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container]
   * @param {'vi'|'en'|'dual'} [options.language='dual']
   * @param {Function} [options.onNavigate]
   */
  constructor(options = {}) {
    this.container = options.container || null;
    this.language = ['vi', 'en', 'dual'].includes(options.language) ? options.language : 'dual';
    this.onNavigate = typeof options.onNavigate === 'function' ? options.onNavigate : null;
    this.activeSection = 'pedagogy'; // 'pedagogy' | 'empirical' | 'theory' | 'verification' | 'circular84'

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

  render() {
    if (!this.container) return;

    const validSections = ['pedagogy', 'empirical', 'theory', 'circular84', 'verification'];
    if (!validSections.includes(this.activeSection)) {
      this.activeSection = 'pedagogy';
    }

    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';

    this.container.innerHTML = `
      <div class="khkt-showcase-page max-w-6xl mx-auto space-y-8 pb-16 animate-fadeIn">
        <!-- Top Navigation / Breadcrumb -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div class="flex items-center gap-3">
            <button type="button" class="btn-back-home px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5">
              ← ${isEn ? 'Back to Lesson Explorer' : 'Về Trang Khám Phá Bài Học'}
            </button>
            <span class="text-xs text-slate-400 font-semibold">•</span>
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              🏆 Cuộc thi NCKHKT 2026 - 2027 • Tỉnh Vĩnh Long
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" class="btn-start-learning px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow transition flex items-center gap-1.5">
              ▶️ ${isEn ? 'Experience 5-Scene Lessons' : 'Trải nghiệm Bài học 5 màn →'}
            </button>
          </div>
        </div>

        <!-- Hero Header Showcase Banner -->
        <div class="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-blue-900/40">
          <div class="relative z-10 space-y-4 max-w-3xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider shadow">
                ★ BÁO CÁO NGHIÊN CỨU KHOA HỌC KỸ THUẬT
              </span>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-800/80 text-blue-200 border border-blue-700/60">
                Lĩnh vực: Công nghệ thông tin (Phần mềm hệ thống & Học liệu số)
              </span>
            </div>

            <h1 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              ${isEn 
                ? 'Application of Artificial Intelligence in Developing Bilingual Videos for Real-World Mathematics Education'
                : 'Ứng Dụng Trí Tuệ Nhân Tạo Phát Triển Video Song Ngữ Học Toán Thực Tiễn (CLIL)'}
            </h1>

            <p class="text-blue-200 text-sm sm:text-base leading-relaxed">
              ${isEn
                ? 'A 7-step standardized pedagogical framework with dual-layer verification (Mathematical Precision & CLIL Linguistics) designed to overcome mathematical modeling obstacles and cognitive overload for Grade 10 students.'
                : 'Quy trình công nghệ 7 bước chuẩn hóa có kiểm chứng 2 lớp độc lập (Toán học & Ngôn ngữ CLIL) giúp học sinh lớp 10 vượt qua rào cản chuyển hóa từ ngữ cảnh thực tế sang mô hình toán học và tiếp thu tiếng Anh chuyên ngành.'}
            </p>

            <!-- Authorship & Affiliation Metadata Card -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 text-xs">
              <div class="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <div class="text-blue-300 font-medium">Học sinh nghiên cứu:</div>
                <div class="font-bold text-white text-sm mt-0.5">${KHKT_METADATA.author?.fullName || 'Phạm Nguyễn Ti Na'}</div>
                <div class="text-[11px] text-blue-200">Lớp ${KHKT_METADATA.author?.grade || '10A1'}</div>
              </div>

              <div class="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <div class="text-blue-300 font-medium">Người hướng dẫn:</div>
                <div class="font-bold text-white text-sm mt-0.5">${KHKT_METADATA.advisor?.fullName || 'Lê Thanh Tâm'}</div>
                <div class="text-[11px] text-blue-200">${KHKT_METADATA.advisor?.role || 'Giáo viên hướng dẫn'}</div>
              </div>

              <div class="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <div class="text-blue-300 font-medium">Đơn vị thực hiện:</div>
                <div class="font-bold text-white text-sm mt-0.5">${KHKT_METADATA.author?.school || 'THPT Trần Văn Kiết'}</div>
                <div class="text-[11px] text-blue-200">${[KHKT_METADATA.author?.district, KHKT_METADATA.author?.province].filter(Boolean).join(', ') || 'Tỉnh Vĩnh Long'}</div>
              </div>

              <div class="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <div class="text-blue-300 font-medium">Mẫu thực nghiệm:</div>
                <div class="font-bold text-amber-300 text-sm mt-0.5">N = 400 Học Sinh</div>
                <div class="text-[11px] text-emerald-300 font-bold">+2.43 điểm (p &lt; 0.001)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button type="button" class="tab-btn px-4 py-3 font-extrabold text-sm border-b-2 transition whitespace-nowrap ${this.activeSection === 'pedagogy' ? 'border-blue-600 text-blue-900 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-section="pedagogy">
            🚀 1. Quy Trình 7 Bước Chuẩn Hóa
          </button>
          <button type="button" class="tab-btn px-4 py-3 font-extrabold text-sm border-b-2 transition whitespace-nowrap ${this.activeSection === 'empirical' ? 'border-blue-600 text-blue-900 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-section="empirical">
            📊 2. Thực Nghiệm Sư Phạm (N=400)
          </button>
          <button type="button" class="tab-btn px-4 py-3 font-extrabold text-sm border-b-2 transition whitespace-nowrap ${this.activeSection === 'theory' ? 'border-blue-600 text-blue-900 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-section="theory">
            📚 3. Cơ Sở Lý Luận (Blum & Leiß, CLIL)
          </button>
          <button type="button" class="tab-btn px-4 py-3 font-extrabold text-sm border-b-2 transition whitespace-nowrap ${this.activeSection === 'circular84' ? 'border-blue-600 text-blue-900 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-section="circular84">
            🤖 4. Khai Báo Sử Dụng AI (TT 84)
          </button>
          <button type="button" class="tab-btn px-4 py-3 font-extrabold text-sm border-b-2 transition whitespace-nowrap ${this.activeSection === 'verification' ? 'border-blue-600 text-blue-900 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-section="verification">
            🛡️ 5. Bảng Kiểm Chứng 2 Lớp
          </button>
        </div>

        <!-- SECTION 1: 7-Step Standardized Pedagogy -->
        ${this.activeSection === 'pedagogy' ? `
          <div class="space-y-6">
            <div class="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 class="text-xl font-black text-slate-900">
                    Quy Trình 7 Bước Chuẩn Hóa Phát Triển Video AI Song Ngữ
                  </h2>
                  <p class="text-xs text-slate-500 mt-1">
                    Chu trình công nghệ khép kín với cửa ngõ kiểm định độc lập 2 lớp tại Bước 5
                  </p>
                </div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0 whitespace-nowrap self-start sm:self-auto">
                  Chuẩn hóa theo Hình 1 Báo cáo KHKT
                </span>
              </div>

              <!-- Graphic Image 1 Preview from KHKT docx -->
              <div class="p-3 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center overflow-hidden">
                <img 
                  src="/assets/khkt/hinh1_quy_trinh_7_buoc.png" 
                  alt="Sơ đồ quy trình 7 bước" 
                  class="rounded-xl shadow-md border border-slate-200 mx-auto" 
                  style="max-width: 100%; height: auto; max-height: 480px; object-fit: contain; display: block;" 
                  onerror="this.src='/assets/khkt/image2.png'"
                >
                <div class="text-xs font-bold text-slate-500 mt-2.5">
                  Hình 1. Sơ đồ Quy trình 7 bước chuẩn hóa phát triển Video AI học Toán song ngữ (Nguồn: Báo cáo KHKT)
                </div>
              </div>

              <!-- 7 Steps List -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                ${SEVEN_STEP_PEDAGOGY.map((st) => {
                  if (!st) return '';
                  const stepNum = st.step || (st.id ? String(st.id).replace(/\D/g, '') : '') || '';
                  const nameVi = st.nameVi || st.titleVi || st.name || st.title || (stepNum ? `Bước ${stepNum}` : '');
                  const nameEn = st.nameEn || st.titleEn || '';
                  let title = '';
                  if (isEn) {
                    title = nameEn || nameVi || `Step ${stepNum}`;
                  } else if (isDual) {
                    title = (nameVi && nameEn) ? `${nameVi} (${nameEn})` : (nameVi || nameEn || `Bước ${stepNum}`);
                  } else {
                    title = nameVi || nameEn || `Bước ${stepNum}`;
                  }
                  const descVi = st.objectiveVi || st.descriptionVi || st.objective || st.description || '';
                  const descEn = st.objectiveEn || st.descriptionEn || '';
                  const desc = (isEn && descEn) ? descEn : (descVi || descEn || '');
                  const inputs = st.inputsVi || st.inputs || '';
                  const outputs = st.outputsVi || st.outputs || '';
                  return `
                    <div class="p-4 rounded-2xl border ${st.step === 5 ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-400/30' : 'border-slate-200 bg-slate-50'} space-y-2">
                      <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-xl ${st.step === 5 ? 'bg-amber-600' : 'bg-blue-900'} text-white font-black text-xs flex items-center justify-center shadow flex-shrink-0">
                          B${stepNum}
                        </span>
                        <div class="font-extrabold text-sm text-slate-900">
                          ${title}
                        </div>
                      </div>
                      <div class="text-xs text-slate-600 leading-relaxed">
                        ${desc}
                      </div>
                      ${inputs ? `
                        <div class="text-[11px] text-slate-500 pt-1">
                          <span class="font-semibold text-slate-700">Đầu vào:</span> ${inputs}
                        </div>
                      ` : ''}
                      ${outputs ? `
                        <div class="text-[11px] text-slate-500">
                          <span class="font-semibold text-slate-700">Đầu ra:</span> ${outputs}
                        </div>
                      ` : ''}
                      ${st.step === 5 ? `
                        <span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md mt-1">
                          🔒 Cửa Ngõ Quyết Định (Gatekeeper 10/10)
                        </span>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SECTION 2: Empirical Pedagogical Study -->
        ${this.activeSection === 'empirical' ? `
          <div class="space-y-6">
            <div class="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 class="text-xl font-black text-slate-900">
                    Số Liệu Thực Nghiệm Sư Phạm Diện Rộng (N = 400 Học Sinh Lớp 10)
                  </h2>
                  <p class="text-xs text-slate-500 mt-1">
                    Thiết kế thực nghiệm so sánh Trước - Sau tác động (Pre/Post-test) trong 04 tuần tại THPT Trần Văn Kiết
                  </p>
                </div>
                <div class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                  Phân tích SPSS & Excel (p &lt; 0.001)
                </div>
              </div>

              <!-- Key Metrics Highlight Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-1">
                  <div class="text-xs font-bold text-blue-700 uppercase">Điểm Trung Bình (Thang 10)</div>
                  <div class="text-4xl font-black text-blue-950">5.42 → 7.85</div>
                  <div class="text-xs font-bold text-emerald-600">+2.43 điểm (Tăng 44.8%)</div>
                </div>

                <div class="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <div class="text-xs font-bold text-emerald-700 uppercase">Từ Vựng Tiếng Anh Toán</div>
                  <div class="text-4xl font-black text-emerald-950">+40.6%</div>
                  <div class="text-xs font-bold text-emerald-700">31.2% lên 71.8%</div>
                </div>

                <div class="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-1">
                  <div class="text-xs font-bold text-indigo-700 uppercase">Lập Mô Hình Toán Đúng</div>
                  <div class="text-4xl font-black text-indigo-950">+34.5%</div>
                  <div class="text-xs font-bold text-indigo-700">42.0% lên 76.5%</div>
                </div>

                <div class="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                  <div class="text-xs font-bold text-amber-700 uppercase">Mức Độ Hài Lòng Video</div>
                  <div class="text-4xl font-black text-amber-950">89.5%</div>
                  <div class="text-xs font-bold text-amber-700">Khảo sát Likert 5 mức</div>
                </div>
              </div>

              <!-- Graphic Image 3 & 4 Previews from docx -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div class="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/khkt/hinh3_bieu_do_thuc_nghiem.png" 
                    alt="Biểu đồ thực nghiệm" 
                    class="rounded-xl shadow border border-slate-200 mx-auto" 
                    style="max-width: 100%; height: auto; max-height: 380px; object-fit: contain; display: block;" 
                    onerror="this.src='/assets/khkt/image4.png'"
                  >
                  <div class="text-xs font-bold text-slate-600 mt-2">
                    Hình 3. Biểu đồ so sánh kết quả thực nghiệm trước và sau tác động (N = 400)
                  </div>
                </div>

                <div class="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/khkt/hinh4_bieu_do_khao_sat.png" 
                    alt="Biểu đồ khảo sát hứng thú" 
                    class="rounded-xl shadow border border-slate-200 mx-auto" 
                    style="max-width: 100%; height: auto; max-height: 380px; object-fit: contain; display: block;" 
                    onerror="this.src='/assets/khkt/image5.png'"
                  >
                  <div class="text-xs font-bold text-slate-600 mt-2">
                    Hình 4. Biểu đồ khảo sát mức độ hứng thú và tự tin của học sinh (N = 400)
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SECTION 3: Scientific Foundations -->
        ${this.activeSection === 'theory' ? `
          <div class="space-y-6">
            <div class="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div class="pb-4 border-b border-slate-200">
                <h2 class="text-xl font-black text-slate-900">
                  4 Trụ Cột Lý Luận Khoa Học Cốt Lõi Của Đề Tài
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  Đảm bảo nền tảng sư phạm và tâm lý học nhận thức vững chắc trong thiết kế học liệu số
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${SCIENTIFIC_FOUNDATIONS.map(th => {
                  if (!th) return '';
                  const nameVi = th.nameVi || th.titleVi || th.name || th.title || '';
                  const nameEn = th.nameEn || th.titleEn || '';
                  let title = '';
                  if (isEn) {
                    title = nameEn || nameVi || '';
                  } else if (isDual) {
                    title = (nameVi && nameEn) ? `${nameVi} (${nameEn})` : (nameVi || nameEn || '');
                  } else {
                    title = nameVi || nameEn || '';
                  }
                  const authorCitation = th.citation || (th.author ? `${th.author}${th.year ? ` (${th.year})` : ''}` : '');
                  const descVi = th.summaryVi || th.descriptionVi || th.summary || th.description || '';
                  const descEn = th.summaryEn || th.descriptionEn || '';
                  const desc = (isEn && descEn) ? descEn : (descVi || descEn || '');
                  const appMap = {
                    'blum-leiss': 'Chuyển hóa bài toán thực tiễn thành 5 phân cảnh nhận thức và mô hình hóa hình học.',
                    'goldin-representations': 'Tích hợp tam giác biểu diễn: lời thoại, sơ đồ trực quan 2D/3D và công thức giải tích.',
                    'coyle-clil': 'Học thuật ngữ tiếng Anh toán học qua ngữ cảnh trực quan, phiên âm IPA và audio bản ngữ.',
                    'mayer-multimedia': 'Kiểm soát tải nhận thức: đồng bộ âm thanh - hình ảnh, tốc độ đọc 120-140 WPM.'
                  };
                  const appDesc = th.applicationVi || appMap[th.id] || '';
                  return `
                    <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-xl bg-indigo-900 text-white font-bold text-sm flex items-center justify-center shadow flex-shrink-0">
                          §
                        </span>
                        <div>
                          <div class="font-extrabold text-sm text-slate-900">${title}</div>
                          ${authorCitation ? `<div class="text-xs text-indigo-700 font-semibold">${authorCitation}</div>` : ''}
                        </div>
                      </div>
                      <div class="text-xs text-slate-700 leading-relaxed">
                        ${desc}
                      </div>
                      ${appDesc ? `
                        <div class="text-[11px] text-blue-900 font-bold bg-blue-100/60 p-2 rounded-lg">
                          Ứng dụng trong dự án: ${appDesc}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SECTION 4: AI Disclosure (Circular 84) -->
        ${this.activeSection === 'circular84' ? `
          <div class="space-y-6">
            <div class="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 class="text-xl font-black text-slate-900">
                    Khai Báo Sử Dụng Công Nghệ Số Và Trí Tuệ Nhân Tạo (AI Disclosure)
                  </h2>
                  <p class="text-xs text-slate-500 mt-1">
                    Tuân thủ nghiêm ngặt Quy chế Cuộc thi NCKHKT cấp Quốc gia (Thông tư số 84/2026/TT-BGDĐT)
                  </p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Cam kết trung thực học thuật 100%
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b-2 border-slate-200 bg-slate-100/80 text-slate-700 uppercase font-extrabold">
                      <th class="p-3 rounded-l-xl">Công cụ AI</th>
                      <th class="p-3">Mục đích sử dụng</th>
                      <th class="p-3">Phần AI hỗ trợ</th>
                      <th class="p-3 rounded-r-xl">Phần học sinh tự làm & Kiểm chứng</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    ${AI_DISCLOSURE_DECLARATION.map(item => {
                      if (!item) return '';
                      return `
                      <tr class="hover:bg-slate-50 transition">
                        <td class="p-3 font-bold text-blue-950">${item.tool || ''}</td>
                        <td class="p-3 text-slate-700">${item.purposeVi || item.purpose || ''}</td>
                        <td class="p-3 text-slate-600 bg-slate-50/50">${item.aiAssistedVi || item.aiContributionVi || ''}</td>
                        <td class="p-3 font-semibold text-emerald-900 bg-emerald-50/30">${item.studentVerifiedVi || item.humanValidationVi || ''}</td>
                      </tr>
                    `;}).join('')}
                  </tbody>
                </table>
              </div>

              <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed font-semibold">
                🛡️ Cam kết của nhóm tác giả: Toàn bộ số liệu thực nghiệm trên 400 học sinh là số liệu thật 100% thu thập tại trường; AI chỉ đóng vai trò công cụ tạo sinh minh họa đa phương tiện dưới sự giám sát và hiệu chỉnh trực tiếp của con người.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SECTION 5: Dual-Layer Verification Checklist -->
        ${this.activeSection === 'verification' ? `
          <div class="space-y-6">
            <div class="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div class="pb-4 border-b border-slate-200">
                <h2 class="text-xl font-black text-slate-900">
                  Bảng Kiểm Tiêu Chí Đánh Giá 2 Lớp (Dual-Layer Checklist - Bảng 3)
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  Mọi học liệu số trong dự án bắt buộc phải đạt 100% ở cả 2 lớp tiêu chuẩn chuyên môn
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Layer 1: Math -->
                <div class="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div class="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-blue-900 text-white font-black text-xs flex items-center justify-center">1</span>
                    Lớp 1: Tính chính xác Toán học tuyệt đối (100% ĐẠT)
                  </div>
                  <ul class="text-xs text-slate-700 space-y-2 leading-relaxed">
                    <li>• <strong>Khớp số liệu:</strong> Dữ kiện góc đo, khoảng cách, ẩn số khớp 100% đề gốc.</li>
                    <li>• <strong>Quan hệ hình học:</strong> Mô hình 2D/3D biểu diễn đúng góc vuông, góc nhọn, tiếp tuyến.</li>
                    <li>• <strong>Loại bỏ chi tiết nhiễu:</strong> Video không chứa các chi tiết sai lệch gây hiểu lầm.</li>
                    <li>• <strong>Tính giải được:</strong> Lời giải chuẩn bảo đảm học sinh tự giải ra đáp số chính xác.</li>
                  </ul>
                </div>

                <!-- Layer 2: English -->
                <div class="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div class="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                    <span class="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center">2</span>
                    Lớp 2: Chuẩn mực Ngôn ngữ & Thuật ngữ CLIL (100% ĐẠT)
                  </div>
                  <ul class="text-xs text-slate-700 space-y-2 leading-relaxed">
                    <li>• <strong>Thuật ngữ chuẩn:</strong> Danh mục Math English sử dụng thuật ngữ quốc tế chính xác.</li>
                    <li>• <strong>Phiên âm IPA:</strong> Đầy đủ phiên âm quốc tế để rèn luyện kỹ năng nghe nói.</li>
                    <li>• <strong>Phát âm bản ngữ:</strong> Tích hợp Web Speech API đọc chuẩn ngữ âm Anh - Mỹ (en-US).</li>
                    <li>• <strong>Ví dụ ngữ cảnh:</strong> Câu mẫu gắn liền với tình huống thực tiễn của bài toán.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  navigate(tab) {
    let handled = false;
    if (typeof this.onNavigate === 'function') {
      try {
        this.onNavigate(tab);
        handled = true;
      } catch (e) {
        handled = false;
      }
    }
    if (!handled && typeof window !== 'undefined') {
      if (window.app && typeof window.app.handleNavigate === 'function') {
        window.app.handleNavigate(tab);
      } else if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('app:navigate', { detail: { tab } }));
      }
    }
  }

  attachEventListeners() {
    if (!this.container) return;

    // Tab buttons switching
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeSection = e.currentTarget.dataset.section;
        this.render();
      });
    });

    // Back to home button
    this.container.querySelector('.btn-back-home')?.addEventListener('click', () => {
      this.navigate('explore');
    });

    // Start learning button
    this.container.querySelector('.btn-start-learning')?.addEventListener('click', () => {
      this.navigate('player');
    });
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}
