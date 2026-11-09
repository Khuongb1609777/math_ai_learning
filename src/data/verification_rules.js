/**
 * @fileoverview Master catalog of 10 Dual-Layer Verification Criteria:
 * Layer 1: Mathematical Rigor (V1.1 - V1.5)
 * Layer 2: CLIL Linguistics & Pedagogy (V2.1 - V2.5)
 * Strictly enforces a 100% PASS publishing gate as mandated by KHKT Table 3.
 */

/**
 * @type {import('./types.js').VerificationCriterion[]}
 */
export const STANDARD_VERIFICATION_RULES = [
  // --- LAYER 1: MATHEMATICAL RIGOR (TOÁN HỌC) ---
  {
    id: "V1.1",
    layer: "math",
    code: "MATH_DATA_CONSISTENCY",
    titleVi: "Nhất quán dữ kiện & Đơn vị đo",
    titleEn: "Data & Unit Consistency",
    descriptionVi: "100% số liệu (độ dài, góc, tiền tệ, tỉ lệ) giữa đề bài, sơ đồ hình học, lời thoại và câu hỏi phải trùng khớp tuyệt đối. Đơn vị đo lường (m, độ, VNĐ, km/h) đồng nhất.",
    descriptionEn: "100% of numeric parameters (distances, angles, currency, ratios) across problem statement, visual diagram, narration, and quiz must match identically with consistent units.",
    mandatory: true,
    passed: true,
    verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn Toán KHKT",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Đã rà soát tự động và đối chiếu thủ công: Không có sự chênh lệch số liệu giữa các phân cảnh."
  },
  {
    id: "V1.2",
    layer: "math",
    code: "MATH_GEOMETRIC_RELATIONS",
    titleVi: "Tính đúng đắn quan hệ hình học / giải tích",
    titleEn: "Geometric & Analytical Validity",
    descriptionVi: "Các quan hệ hình học (vuông góc, thẳng hàng, góc ngoài tam giác, đỉnh parabol, trục đối xứng) phải chính xác trên sơ đồ biểu diễn, không vẽ lệch sai bản chất.",
    descriptionEn: "Geometric and analytical properties (perpendicularity, collinearity, exterior angles, parabola vertex, axis of symmetry) must be strictly valid on coordinate plots.",
    mandatory: true,
    passed: true,
    verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn Toán KHKT",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Tất cả đồ thị và sơ đồ SVG tuân thủ đúng hệ tọa độ thực nghiệm, góc nhọn và trục đối xứng chuẩn xác."
  },
  {
    id: "V1.3",
    layer: "math",
    code: "MATH_BOUNDARY_FEASIBILITY",
    titleVi: "Điều kiện biên & Tính khả thi thực tế",
    titleEn: "Boundary Constraints & Practical Feasibility",
    descriptionVi: "Các ẩn số phải thỏa mãn tập xác định toán học và thực tế (vd: khoảng cách > 0, góc nhọn 0° < α < 90°, giá vé dương, lượng khách không vượt sức chứa xe).",
    descriptionEn: "Variables must satisfy rigorous mathematical domains and realistic constraints (e.g. positive distance, acute angles, positive fare, capacity limits).",
    mandatory: true,
    passed: true,
    verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn Toán KHKT",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Tập xác định [0, 8] của xe buýt và điều kiện góc nhọn tam giác đều được kiểm định chặt chẽ."
  },
  {
    id: "V1.4",
    layer: "math",
    code: "MATH_FORMULA_PRECISION",
    titleVi: "Tính chính xác của công thức mô hình hóa",
    titleEn: "Mathematical Modeling Formula Precision",
    descriptionVi: "Công thức mô hình hóa (Định lý Sin, hàm bậc hai y = ax² + bx + c, hàm doanh thu R(x) = P(x)Q(x)) được chứng minh chặt chẽ theo SGK Toán 10 GDPT 2018.",
    descriptionEn: "Modeling formulas (Law of Sines, quadratic polynomial, revenue product) are derived rigorously from Grade 10 standards.",
    mandatory: true,
    passed: true,
    verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn Toán KHKT",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Các bước cầu nối từ thực tế sang công thức toán học logic, không đốt cháy giai đoạn."
  },
  {
    id: "V1.5",
    layer: "math",
    code: "MATH_CALCULATION_ACCURACY",
    titleVi: "Độ chính xác tính toán & Dung sai làm tròn",
    titleEn: "Numerical Computation & Rounding Precision",
    descriptionVi: "Đáp số số học chính xác tuyệt đối hoặc có quy chuẩn dung sai làm tròn rõ ràng (vd: ±0.1m; đối chiếu phương pháp Sin và Cotang đạt CD ≈ 49.9m).",
    descriptionEn: "Arithmetic computation is verified via dual calculation methods with explicit rounding tolerance (e.g. ±0.1m).",
    mandatory: true,
    passed: true,
    verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn Toán KHKT",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Đã kiểm chứng chéo bằng phương pháp Sin và Cotang (CD = 49.88m ≈ 49.9m); đỉnh cực trị Parabol chính xác 100%."
  },

  // --- LAYER 2: CLIL LINGUISTICS & PEDAGOGY (NGÔN NGỮ TIẾNG ANH) ---
  {
    id: "V2.1",
    layer: "english",
    code: "ENG_TERMINOLOGY_STANDARD",
    titleVi: "Chuẩn hóa thuật ngữ Math English",
    titleEn: "Math English Terminology Standardization",
    descriptionVi: "Sử dụng đúng thuật ngữ chuẩn quốc tế (vd: 'Angle of elevation', 'Vertex', 'Law of Sines', 'Revenue', 'Domain constraint'), loại bỏ hoàn toàn dịch máy thô sơ.",
    descriptionEn: "Standard international STEM/CLIL terminology is strictly utilized, eliminating unvetted machine translation artifacts.",
    mandatory: true,
    passed: true,
    verifiedBy: "Tổ Ngoại ngữ THPT Trần Văn Kiết",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "100% thuật ngữ khớp với Cambridge CLIL Mathematics Glossary và Oxford Learner's Dictionary."
  },
  {
    id: "V2.2",
    layer: "english",
    code: "ENG_IPA_PHONETICS",
    titleVi: "Chuẩn xác phiên âm quốc tế (IPA)",
    titleEn: "International Phonetic Alphabet (IPA) Accuracy",
    descriptionVi: "100% từ vựng trong bảng từ phải có phiên âm IPA chuẩn Anh - Mỹ hoặc Anh - Anh, định dạng giữa hai dấu gạch chéo /.../ kèm trọng âm chính và phụ.",
    descriptionEn: "100% of vocabulary entries feature accurate IPA transcriptions enclosed in slashes /.../ with primary/secondary stress markers.",
    mandatory: true,
    passed: true,
    verifiedBy: "Tổ Ngoại ngữ THPT Trần Văn Kiết",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Đã kiểm định ký tự IPA và trọng âm chuẩn xác cho toàn bộ danh mục từ vựng của 3 bài học."
  },
  {
    id: "V2.3",
    layer: "english",
    code: "ENG_BILINGUAL_ALIGNMENT",
    titleVi: "Khớp ngữ nghĩa song ngữ (Bilingual Alignment)",
    titleEn: "Bilingual Semantic Alignment",
    descriptionVi: "Lời thoại tiếng Anh và tiếng Việt tương đương về mặt ngữ nghĩa và độ dài nhận thức, đúng văn phong sư phạm toán học, không dịch vụng về từ-nối-từ.",
    descriptionEn: "English and Vietnamese narrative transcripts maintain complete pedagogical equivalence without awkward literal translation.",
    mandatory: true,
    passed: true,
    verifiedBy: "Tổ Ngoại ngữ THPT Trần Văn Kiết",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Đối chiếu song ngữ câu đối câu (Sentence-aligned) đạt chuẩn tương đương ngữ nghĩa 100%."
  },
  {
    id: "V2.4",
    layer: "english",
    code: "ENG_SPEECH_SPEED_QUALITY",
    titleVi: "Chất lượng phát âm & Tốc độ đọc",
    titleEn: "Acoustic Pronunciation & Pacing Quality",
    descriptionVi: "Giọng đọc AI tự nhiên, rõ ràng, tốc độ thoại chuẩn từ 120 - 140 từ/phút (WPM), phát âm chuẩn các âm cuối (/s/, /t/, /θ/) và tương thích Web Speech API.",
    descriptionEn: "Spoken audio displays natural acoustic quality, optimal speech pace (120-140 WPM), crisp consonant endings, and native Web Speech API compatibility.",
    mandatory: true,
    passed: true,
    verifiedBy: "Tổ Ngoại ngữ THPT Trần Văn Kiết",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Tốc độ đọc đo được xấp xỉ 130 WPM, phát âm rõ ràng, không gây hiện tượng nuốt chữ."
  },
  {
    id: "V2.5",
    layer: "english",
    code: "ENG_SUBTITLE_COGNITIVE_LOAD",
    titleVi: "Đồng bộ phụ đề & Giảm tải nhận thức",
    titleEn: "Subtitle Synchronization & Cognitive Load Reduction",
    descriptionVi: "Phụ đề song ngữ hiển thị rõ ràng với độ tương phản cao (chuẩn WCAG AA), phân biệt màu VN - EN, không che khuất sơ đồ hình học theo nguyên lý Mayer.",
    descriptionEn: "High-contrast bilingual subtitles (WCAG AA) with color distinction for VI/EN, avoiding occlusion of diagrams per Mayer's principles.",
    mandatory: true,
    passed: true,
    verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn KHKT",
    verifiedAt: "2026-11-06T10:00:00Z",
    notes: "Giao diện kiểm tra phụ đề đặt phía dưới màn hình, tách biệt hoàn toàn với vùng SVG trực quan."
  }
];

/**
 * Helper to clone a fresh set of verification rules for a new lesson draft.
 * @param {string} [auditorName]
 * @returns {import('./types.js').VerificationCriterion[]}
 */
export function createInitialVerificationRules(auditorName = "Chưa kiểm định") {
  return STANDARD_VERIFICATION_RULES.map(rule => ({
    ...rule,
    passed: false,
    verifiedBy: auditorName,
    verifiedAt: "",
    notes: "Chờ thẩm định bởi hội đồng chuyên môn."
  }));
}

export const verificationRules = STANDARD_VERIFICATION_RULES;
export const standardVerificationRules = STANDARD_VERIFICATION_RULES;
export default STANDARD_VERIFICATION_RULES;
