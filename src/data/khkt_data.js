/**
 * @fileoverview Research background data and metadata from the KHKT Science & Technology project:
 * "Ứng dụng Trí tuệ nhân tạo phát triển Video song ngữ học Toán thực tiễn"
 * Author: Phạm Nguyễn Ti Na (10A1, THPT Trần Văn Kiết, Vĩnh Long)
 * Advisor: Lê Thanh Tâm
 * Reference: Thông tư 84/2026/TT-BGDĐT & GDPT 2018
 */

export const KHKT_METADATA = {
  projectTitleVi: "Ứng dụng Trí tuệ nhân tạo phát triển Video song ngữ học Toán thực tiễn",
  projectTitleEn: "Application of Artificial Intelligence in Developing Bilingual Videos for Real-World Mathematics Education",
  competition: "Cuộc thi Nghiên cứu Khoa học Kỹ thuật cấp Quốc gia dành cho học sinh trung học năm học 2026 – 2027",
  fieldVi: "Công nghệ thông tin (Phần mềm hệ thống & Học liệu số)",
  fieldEn: "Information Technology (System Software & Digital Educational Resources)",
  author: {
    fullName: "Phạm Nguyễn Ti Na",
    grade: "10A1",
    school: "Trường THCS & THPT Trần Văn Kiết",
    district: "Huyện Chợ Lách",
    province: "Tỉnh Vĩnh Long"
  },
  advisor: {
    fullName: "Lê Thanh Tâm",
    role: "Giáo viên hướng dẫn nghiên cứu",
    institution: "Trường THCS & THPT Trần Văn Kiết"
  },
  implementationPeriod: "07/09/2026 – 20/01/2027",
  documentDate: "2026-11-06",
  legalBasis: [
    {
      code: "Thông tư 84/2026/TT-BGDĐT",
      date: "30/09/2026",
      title: "Quy chế Cuộc thi nghiên cứu khoa học, kỹ thuật cấp quốc gia dành cho học sinh THCS và THPT"
    },
    {
      code: "Thông tư 32/2018/TT-BGDĐT",
      date: "26/12/2018",
      title: "Chương trình Giáo dục phổ thông môn Toán (GDPT 2018)"
    }
  ]
};

export const SCIENTIFIC_FOUNDATIONS = [
  {
    id: "blum-leiss",
    nameVi: "Chu trình Mô hình hóa Toán học Blum & Leiß (2007)",
    nameEn: "Blum & Leiß Mathematical Modeling Cycle (2007)",
    citation: "Blum, W., & Leiß, D. (2007). How do students understand mathematical modelling problems?",
    steps: [
      { step: 1, nameVi: "Tình huống thực tế (Real-world context)" },
      { step: 2, nameVi: "Mô hình thực tế (Real model) - Đơn giản hóa & Cấu trúc hóa" },
      { step: 3, nameVi: "Mô hình toán (Math model) - Toán học hóa" },
      { step: 4, nameVi: "Giải toán (Mathematical solution)" },
      { step: 5, nameVi: "Diễn giải & Đánh giá kết quả thực tế (Interpretation & Validation)" }
    ],
    summaryVi: "Học sinh chuyển đổi từ ngữ cảnh thực tế phức tạp sang mô hình toán học rõ ràng qua các bước cầu nối."
  },
  {
    id: "goldin-representations",
    nameVi: "Lý thuyết Đa biểu diễn Goldin (2014)",
    nameEn: "Goldin Multiple Representations Theory (2014)",
    citation: "Goldin, G. A. (2014). Mathematical representations. Springer.",
    summaryVi: "Sự liên kết tam giác giữa: Ngôn ngữ tự nhiên (lời thoại) ⟷ Trực quan không gian (sơ đồ 2D/3D) ⟷ Ký hiệu toán học hình thức (công thức, hàm số)."
  },
  {
    id: "coyle-clil",
    nameVi: "Khung Dạy học Tích hợp Nội dung và Ngôn ngữ CLIL (Coyle et al., 2010)",
    nameEn: "CLIL Framework (Content and Language Integrated Learning - Coyle et al., 2010)",
    citation: "Coyle, D., Hood, P., & Marsh, D. (2010). CLIL. Cambridge University Press.",
    summaryVi: "Tiếp thu thuật ngữ tiếng Anh toán học tự nhiên trong ngữ cảnh giải quyết bài toán, hỗ trợ phát âm bản ngữ và phụ đề song ngữ."
  },
  {
    id: "mayer-multimedia",
    nameVi: "Lý thuyết Học liệu Đa phương tiện Mayer (2021)",
    nameEn: "Mayer Cognitive Theory of Multimedia Learning (2021)",
    citation: "Mayer, R. E. (2021). Multimedia Learning (3rd ed.). Cambridge University Press.",
    summaryVi: "Tối ưu tải nhận thức bằng cách đồng bộ âm thanh và hình ảnh, loại bỏ chi tiết gây nhiễu, kiểm soát tốc độ thoại (120-140 WPM)."
  }
];

export const SEVEN_STEP_PEDAGOGY = [
  {
    step: 1,
    id: "B1",
    nameVi: "Lựa chọn bài toán thực tế",
    nameEn: "Real-World Problem Selection",
    objectiveVi: "Tuyển chọn bài toán thực tế trọng tâm môn Toán 10 (Hệ thức lượng, Parabol, Tối ưu hóa) có ngữ cảnh đời sống phong phú.",
    inputsVi: "Ngân hàng đề THPT, SGK mới (Cánh Diều, KNTT, CTST), đề thi KHKT.",
    outputsVi: "Đề bài thực tế gốc, bối cảnh thực tế xác định.",
    actorsVi: "Giáo viên Toán / Chuyên gia bộ môn."
  },
  {
    step: 2,
    id: "B2",
    nameVi: "Phân tích Toán học & Tiếng Anh chuyên ngành",
    nameEn: "Mathematical & Math English Analysis",
    objectiveVi: "Bóc tách tường minh các đại lượng, dữ kiện đã biết, ẩn số cần tìm, điều kiện biên; trích xuất danh mục từ vựng Math English có IPA.",
    inputsVi: "Đề bài thực tế gốc.",
    outputsVi: "Ma trận đại lượng, lời giải chuẩn, Math Vocabulary List (term, IPA, POS, definition).",
    actorsVi: "Giáo viên Toán, Giáo viên Tiếng Anh, Claude 3.5 / ChatGPT."
  },
  {
    step: 3,
    id: "B3",
    nameVi: "Biên soạn kịch bản 5 phân cảnh song ngữ",
    nameEn: "5-Scene Bilingual Storyboard Scripting",
    objectiveVi: "Cấu trúc hóa bài toán thành 5 phân cảnh ngắn theo tâm lý nhận thức: Bối cảnh -> Dữ kiện -> Vấn đề & Từ vựng -> Gợi mở -> Thực hành.",
    inputsVi: "Ma trận phân tích từ B2.",
    outputsVi: "Kịch bản 5 màn (Storyboard JSON/Markdown) đầy đủ visual prompt, voiceover text, checkpoint.",
    actorsVi: "Tác giả học sinh, Giáo viên hướng dẫn."
  },
  {
    step: 4,
    id: "B4",
    nameVi: "Khởi tạo nội dung đa phương tiện bằng AI",
    nameEn: "AI Multimedia Generation & Prompt Audit",
    objectiveVi: "Tạo hình minh họa bối cảnh 2D/3D (Midjourney/DALL-E 3), giọng đọc bản ngữ (ElevenLabs), video tương tác. Bắt buộc lưu vết Prompt History.",
    inputsVi: "Kịch bản B3, danh sách Prompt thiết kế.",
    outputsVi: "Tài nguyên hình ảnh, audio MP3 song ngữ, video clip, Prompt Audit Log.",
    actorsVi: "Công cụ AI, Web Speech API, Học sinh kiểm soát chất lượng."
  },
  {
    step: 5,
    id: "B5",
    nameVi: "Kiểm chứng 2 lớp độc lập (Dual-Verification)",
    nameEn: "Dual-Layer Independent Verification",
    objectiveVi: "Thẩm định độc lập 2 phương diện: Lớp 1 (Toán học - số liệu, công thức, mô hình) và Lớp 2 (Ngôn ngữ - thuật ngữ, phiên âm IPA, phụ đề).",
    inputsVi: "Kịch bản B3 + Tài nguyên đa phương tiện B4.",
    outputsVi: "Biên bản kiểm định đạt chuẩn 100% (Pass 10/10) hoặc Ticket yêu cầu sửa chữa.",
    actorsVi: "Ban kiểm định 2 lớp (Toán & Ngôn ngữ), Verification Engine."
  },
  {
    step: 6,
    id: "B6",
    nameVi: "Thử nghiệm diện hẹp (Pilot Testing)",
    nameEn: "Pilot Testing (N=20)",
    objectiveVi: "Trình chiếu và kiểm thử trên nhóm mẫu nhỏ 20 học sinh để đo độ nét, âm lượng, tốc độ đọc (120-140 WPM), khả năng tiếp thu từ vựng.",
    inputsVi: "Video & Học liệu đã qua B5 kiểm chứng.",
    outputsVi: "Bảng đánh giá phản hồi thử nghiệm, danh mục tinh chỉnh kỹ thuật.",
    actorsVi: "Nhóm 20 học sinh thử nghiệm, Hệ thống thu nhận khảo sát."
  },
  {
    step: 7,
    id: "B7",
    nameVi: "Đóng gói học liệu số hoàn chỉnh",
    nameEn: "Interactive Digital Courseware Packaging",
    objectiveVi: "Tích hợp video 5 phân cảnh, bảng từ vựng tương tác, phiếu học tập (Worksheet/Quiz), Rubric chấm điểm và giải thích chi tiết thành gói bài học hoàn chỉnh.",
    inputsVi: "Bài học hoàn thiện qua B6.",
    outputsVi: "Khóa học số hóa sẵn sàng phát hành trên Web App (JSON package).",
    actorsVi: "Nền tảng Web App, LocalStorage persistence."
  }
];

export const EMPIRICAL_STUDY = {
  sampleSize: 400,
  school: "Trường THCS & THPT Trần Văn Kiết, Vĩnh Long",
  targetGroup: "Học sinh Lớp 10 (Nhóm thực nghiệm vs Nhóm đối chứng tương đồng năng lực đầu vào)",
  durationWeeks: 4,
  period: "07/09/2026 – 07/10/2026",
  preTestAverage: 5.42,
  postTestAverage: 7.85,
  scoreDelta: 2.43,
  pValue: "p < 0.001",
  significance: "Rất có ý nghĩa thống kê (Highly statistically significant)",
  metrics: [
    {
      id: "score",
      indicatorVi: "Điểm trung bình bài kiểm tra (Thang 10)",
      indicatorEn: "Test score average (Scale of 10)",
      preValue: 5.42,
      postValue: 7.85,
      delta: "+2.43",
      deltaPercent: "+44.8%",
      unit: "điểm",
      noteVi: "Tăng trưởng vượt bậc về năng lực tổng hợp"
    },
    {
      id: "data_extraction",
      indicatorVi: "Tỉ lệ xác định đúng dữ kiện & bối cảnh",
      indicatorEn: "Correct data & context identification rate",
      preValue: 58.5,
      postValue: 87.2,
      delta: "+28.7%",
      deltaPercent: "+28.7%",
      unit: "%",
      noteVi: "Khắc phục triệt để tình trạng nhầm lẫn giả thiết bài toán"
    },
    {
      id: "math_modeling",
      indicatorVi: "Tỉ lệ thiết lập mô hình toán học đúng",
      indicatorEn: "Correct mathematical modeling rate",
      preValue: 42.0,
      postValue: 76.5,
      delta: "+34.5%",
      deltaPercent: "+34.5%",
      unit: "%",
      noteVi: "Cải thiện mạnh mẽ năng lực cốt lõi theo GDPT 2018"
    },
    {
      id: "math_english",
      indicatorVi: "Tỉ lệ ứng dụng đúng thuật ngữ Math English",
      indicatorEn: "Accurate Math English terminology usage rate",
      preValue: 31.2,
      postValue: 71.8,
      delta: "+40.6%",
      deltaPercent: "+40.6%",
      unit: "%",
      noteVi: "Mức tăng trưởng ấn tượng nhất nhờ tích hợp CLIL song ngữ"
    },
    {
      id: "real_interpretation",
      indicatorVi: "Tỉ lệ diễn giải đúng kết quả thực tế",
      indicatorEn: "Accurate real-world interpretation rate",
      preValue: 36.5,
      postValue: 69.0,
      delta: "+32.5%",
      deltaPercent: "+32.5%",
      unit: "%",
      noteVi: "Tăng khả năng liên hệ toán học với an toàn và kinh tế thực tế"
    }
  ],
  satisfaction: {
    overallUsefulPercent: 89.5,
    highInterestAndConfidencePercent: 68.0,
    clearUnderstandingPercent: 24.0,
    neutralOrNeedsImprovementPercent: 8.0
  }
};

export const LIKERT_SURVEY_STATEMENTS = [
  {
    id: 1,
    statementVi: "Video AI giúp em dễ dàng hình dung bối cảnh thực tế của bài toán.",
    statementEn: "The AI video helps me easily visualize the real-world context of the problem."
  },
  {
    id: 2,
    statementVi: "Sau khi xem video, em xác định đúng các dữ kiện và ẩn số cần tìm.",
    statementEn: "After watching the video, I correctly identify given data and variables to solve."
  },
  {
    id: 3,
    statementVi: "Thuật ngữ tiếng Anh Toán trong video dễ hiểu và bổ ích.",
    statementEn: "The Math English terminology in the video is clear and useful."
  },
  {
    id: 4,
    statementVi: "Các câu hỏi gợi mở giúp em tự lập được phương trình/mô hình toán.",
    statementEn: "The guided questions help me formulate the mathematical model myself."
  },
  {
    id: 5,
    statementVi: "Âm thanh giọng đọc AI và phụ đề song ngữ rõ ràng, chuẩn xác.",
    statementEn: "The AI voiceover audio and bilingual subtitles are clear and accurate."
  },
  {
    id: 6,
    statementVi: "Video không chứa chi tiết gây nhiễu làm em hiểu sai bài toán.",
    statementEn: "The video contains no distracting visual details causing misunderstanding."
  }
];

export const AI_DISCLOSURE_DECLARATION = [
  {
    tool: "ChatGPT / Claude 3.5",
    purposeVi: "Gợi ý ý tưởng kịch bản & dịch thuật từ vựng Math EN",
    aiAssistedVi: "Hỗ trợ dự thảo kịch bản thô và gợi ý danh mục từ vựng đối sánh.",
    studentVerifiedVi: "Học sinh tự giải toán, kiểm tra công thức, biên tập kịch bản chuẩn, đối chiếu từ điển chuyên ngành."
  },
  {
    tool: "Midjourney / DALL-E 3",
    purposeVi: "Tạo hình ảnh bối cảnh minh họa thực tế (3D / 2D)",
    aiAssistedVi: "Sinh hình ảnh 3D/minh họa bối cảnh theo Prompt mô tả.",
    studentVerifiedVi: "Học sinh thiết kế Prompt, chọn lọc hình ảnh chuẩn toán học, loại bỏ chi tiết sai lệch hoặc gây nhiễu thị giác."
  },
  {
    tool: "ElevenLabs / HeyGen",
    purposeVi: "Tạo giọng đọc song ngữ & ghép chuyển động",
    aiAssistedVi: "Chuyển văn bản kịch bản thành giọng đọc truyền cảm chuẩn bản ngữ.",
    studentVerifiedVi: "Học sinh kiểm tra tốc độ thoại (120-140 WPM), căn chỉnh thời lượng và khớp phụ đề song ngữ."
  },
  {
    tool: "Microsoft Excel / SPSS",
    purposeVi: "Xử lý số liệu thống kê thực nghiệm sư phạm",
    aiAssistedVi: "Hỗ trợ hàm tính điểm trung bình, độ lệch chuẩn, kiểm định t-test và biểu đồ so sánh.",
    studentVerifiedVi: "Học sinh trực tiếp nhập dữ liệu bài thi thật của 400 học sinh, đối chiếu tính trung thực khoa học."
  }
];

export const KHKT_MEDIA_ASSETS = [
  {
    id: "image1",
    path: "/assets/khkt/image1.png",
    nameVi: "Hình 1. Sơ đồ Cổng vòm Parabol & Xe tải",
    nameEn: "Figure 1. Parabolic Entrance Arch & Vehicle Clearance",
    captionVi: "Mô hình toán học Parabol y = -3/8 x² + 6 và khoảng cách an toàn xe tải."
  },
  {
    id: "image2",
    path: "/assets/khkt/image2.png",
    nameVi: "Hình 2. Giao diện Video AI Bài toán Hải đăng",
    nameEn: "Figure 2. Lighthouse Trigonometry Problem AI Video Interface",
    captionVi: "Mô phỏng trình phát kịch bản phân cảnh song ngữ và sơ đồ giác kế lượng giác."
  },
  {
    id: "image3",
    path: "/assets/khkt/image3.png",
    nameVi: "Hình 3. Biểu đồ Thực nghiệm Sư phạm (N = 400)",
    nameEn: "Figure 3. Pedagogical Experiment Pre/Post Comparison Chart (N = 400)",
    captionVi: "So sánh kết quả trước và sau tác động: Điểm trung bình tăng từ 5.42 lên 7.85 (+2.43 điểm)."
  },
  {
    id: "image4",
    path: "/assets/khkt/image4.png",
    nameVi: "Hình 4. Khảo sát Mức độ Hài lòng và Hứng thú (N = 400)",
    nameEn: "Figure 4. Student Interest and Confidence Survey Chart (N = 400)",
    captionVi: "89.5% học sinh đánh giá tích cực, 68% đạt mức rất hứng thú và tự tin."
  },
  {
    id: "image5",
    path: "/assets/khkt/image5.png",
    nameVi: "Hình 5. Sơ đồ Quy trình 7 bước Chuẩn hóa",
    nameEn: "Figure 5. Standardized 7-Step Workflow Diagram",
    captionVi: "Quy trình khép kín từ lựa chọn bài toán đến kiểm chứng 2 lớp và đóng gói học liệu số."
  }
];


// ============================================================================
// Standardized Aliases & Backward-Compatible Exports
// ============================================================================

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

export default KHKT_METADATA;
