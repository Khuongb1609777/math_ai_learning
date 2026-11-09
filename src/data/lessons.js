/**
 * @fileoverview Complete dataset of 3 Grade 10 Real-World Mathematics Lessons (KHKT):
 * 1. Lesson 1 (Trigonometry): Đo chiều cao ngọn hải đăng với chân tháp không thể tiếp cận
 * 2. Lesson 2 (Quadratic): Cổng chào Parabol và Giới hạn chiều cao xe tải
 * 3. Lesson 3 (Optimization): Tối ưu hóa doanh thu xe buýt du lịch Chợ Lách
 */

import { STANDARD_VERIFICATION_RULES } from './verification_rules.js';

/**
 * @type {import('./types.js').Lesson[]}
 */
export const DEFAULT_LESSONS = [
  // =========================================================================
  // LESSON 1: TRIGONOMETRY (HẢI ĐĂNG & HỆ THỨC LƯỢNG)
  // =========================================================================
  {
    id: "lesson-lighthouse",
    topic: "trigonometry",
    topicTitleVi: "Hệ thức lượng trong tam giác",
    topicTitleEn: "Trigonometric Relations in Triangles",
    titleVi: "Đo chiều cao ngọn hải đăng với chân tháp không thể tiếp cận",
    titleEn: "Measuring Lighthouse Height with an Inaccessible Base",
    grade: "10",
    difficulty: "Medium",
    estimatedMinutes: 15,
    thumbnail: "/assets/khkt/image2.png",
    realWorldContextVi: "Ngọn hải đăng ven biển đứng trên vách đá dốc đứng, chân tháp C bị sóng biển bao quanh nguy hiểm, không thể đo khoảng cách trực tiếp bằng thước dây.",
    realWorldContextEn: "A coastal lighthouse stands on rugged steep cliffs where base C is surrounded by turbulent waves, making direct tape measurement impossible.",
    status: "PUBLISHED",
    author: "Ban Chuyên môn Toán - Tiếng Anh (CLIL)",
    publishedAt: "2026-11-06T10:00:00Z",

    // --- 5 SCENES ---
    scenes: [
      {
        id: 1,
        key: "context",
        titleVi: "Mở đầu bối cảnh: Ngọn hải đăng biển đảo",
        titleEn: "Context Introduction: Coastal Lighthouse",
        contentVi: "Chào các bạn! Làm thế nào để đo chiều cao một ngọn hải đăng khi chân tháp đứng trên vách đá hiểm trở và sóng biển bao quanh khiến ta không thể tiếp cận trực tiếp?",
        contentEn: "Hello everyone! How can we measure the height of a coastal lighthouse when its base stands on rugged cliffs surrounded by crashing waves, making it completely inaccessible?",
        visualDescriptionVi: "Toàn cảnh 3D ngọn hải đăng sừng sững trên mỏm đá ven biển lộng gió, sóng vỗ dồn dập vào chân bờ đá C hiểm trở. Điểm C được gắn biển cảnh báo không thể tiếp cận.",
        visualDescriptionEn: "3D panoramic view of a coastal lighthouse towering on rocky ocean cliffs, with wild waves crashing against inaccessible base point C.",
        formulas: ["C \\text{ is inaccessible (không thể tiếp cận)}"],
        checkpointVi: "Quan sát bối cảnh thực tế và nhận diện chướng ngại vật: Chân tháp C không thể tiếp cận trực tiếp.",
        checkpointEn: "Observe the real-world context and identify the core obstacle: Base point C is physically inaccessible.",
        interactiveType: "svg-lighthouse"
      },
      {
        id: 2,
        key: "facts",
        titleVi: "Dữ kiện thực tế & Thông số đo đạc",
        titleEn: "Given Facts & Survey Measurements",
        contentVi: "Từ hai điểm quan sát A và B trên mặt đất bằng phẳng cách nhau 30 mét và thẳng hàng với chân tháp C, người ta dùng giác kế đo được góc nâng đến đỉnh ngọn hải đăng D lần lượt là 42° và 63°. Tháp thẳng đứng vuông góc với mặt đất.",
        contentEn: "From two observation stations A and B located 30 meters apart on flat ground and collinear with tower base C, surveyors use theodolites to measure angles of elevation to apex D as 42° and 63° respectively. The tower stands perpendicular to the ground.",
        visualDescriptionVi: "Sơ đồ 2D mặt phẳng đứng: Đường nằm ngang chứa 3 điểm A, B, C theo thứ tự. Tháp thẳng đứng CD vuông góc với AC tại C. Khoảng cách AB = 30m. Góc CAD = 42°, góc CBD = 63°.",
        visualDescriptionEn: "2D vertical elevation diagram showing horizontal baseline containing collinear points A, B, C. Vertical tower CD is perpendicular to AC at C. AB = 30m, angle CAD = 42°, angle CBD = 63°.",
        formulas: [
          "AB = 30\\text{ m}",
          "\\widehat{CAD} = 42^\\circ",
          "\\widehat{CBD} = 63^\\circ",
          "\\widehat{BCD} = 90^\\circ"
        ],
        checkpointVi: "Ghi nhận 4 dữ kiện: AB = 30m, hai góc nâng tại A và B, 3 điểm A-B-C thẳng hàng, tháp vuông góc mặt đất.",
        checkpointEn: "Record the 4 key facts: AB = 30m, two angles of elevation at A & B, collinear points A-B-C, perpendicular tower.",
        interactiveType: "svg-lighthouse"
      },
      {
        id: 3,
        key: "problem",
        titleVi: "Vấn đề & Từ vựng Math English",
        titleEn: "Problem & Math English Vocabulary",
        contentVi: "Vì khoảng cách BC chưa biết, ta không thể tính ngay CD trong tam giác vuông BCD. Ta liên kết tam giác ABD với tam giác BCD: Hãy áp dụng Định lý Sin trong tam giác ABD để tìm độ dài cạnh BD, từ đó xác định chiều cao CD!",
        contentEn: "Since ground distance BC is unknown, we cannot directly compute CD inside right triangle BCD. Instead, we link triangle ABD with right triangle BCD: Apply the Law of Sines in triangle ABD to determine length BD, then calculate height CD!",
        visualDescriptionVi: "Sơ đồ làm nổi bật tam giác ABD bằng viền màu vàng cam và tam giác vuông BCD bằng màu xanh lam. Bảng từ vựng Math English mở bên cạnh với các nút phát âm tương tác.",
        visualDescriptionEn: "Diagram highlights auxiliary triangle ABD in amber and right triangle BCD in cyan. Math English vocabulary panel appears on the right with interactive audio pronunciation buttons.",
        formulas: [
          "\\text{Target: Height } h = CD = ?",
          "\\triangle ABD \\longleftrightarrow \\triangle BCD \\text{ (shared side } BD \\text{)}"
        ],
        checkpointVi: "Xác lập chiến lược 2 bước: Tính cạnh cầu nối BD trước, sau đó tính chiều cao CD.",
        checkpointEn: "Establish the 2-stage bridge strategy: Calculate connecting edge BD first, then solve for height CD.",
        interactiveType: "svg-lighthouse"
      },
      {
        id: 4,
        key: "guidance",
        titleVi: "Gợi mở tư duy mô hình hóa",
        titleEn: "Mathematical Modeling Guidance",
        contentVi: "Gợi ý: Góc CBD = 63° là góc ngoài tại đỉnh B của tam giác ABD, suy ra góc ADB = 63° - 42° = 21°. Áp dụng Định lý Sin: BD / sin(42°) = 30 / sin(21°). Sau khi có BD, trong tam giác vuông BCD ta tính CD = BD · sin(63°).",
        contentEn: "Hint: Angle CBD = 63° is the exterior angle at vertex B of triangle ABD, yielding angle ADB = 63° - 42° = 21°. Apply Law of Sines: BD / sin(42°) = 30 / sin(21°). Once BD is found, inside right triangle BCD compute CD = BD · sin(63°).",
        visualDescriptionVi: "Sơ đồ động hiển thị công thức góc ngoài ADB = 21°, mũi tên gióng cạnh BD sang tam giác vuông BCD. Không hiển thị đáp số cuối cùng để kích thích học sinh tự tính toán.",
        visualDescriptionEn: "Dynamic visual shows exterior angle deduction ADB = 21° and links BD to right triangle BCD. Final answer is withheld to foster independent student calculation.",
        formulas: [
          "\\widehat{ADB} = 63^\\circ - 42^\\circ = 21^\\circ",
          "BD = \\frac{30 \\cdot \\sin(42^\\circ)}{\\sin(21^\\circ)}",
          "CD = BD \\cdot \\sin(63^\\circ)"
        ],
        checkpointVi: "Hiểu sâu sắc vai trò của góc ngoài và Định lý Sin trong việc giải tam giác gián tiếp.",
        checkpointEn: "Deeply grasp the role of exterior angles and Law of Sines in indirect triangulation.",
        interactiveType: "svg-lighthouse"
      },
      {
        id: 5,
        key: "practice",
        titleVi: "Thực hành & Phiếu học tập",
        titleEn: "Practice & Interactive Worksheet",
        contentVi: "Bây giờ, hãy mở phiếu học tập tương tác, tự tay bấm máy tính để tìm độ dài BD và chiều cao CD của ngọn hải đăng, đồng thời kiểm tra vốn từ vựng Math English của bạn nhé!",
        contentEn: "Now, open your interactive worksheet, perform the calculations to find length BD and lighthouse height CD, and test your mastery of Math English terminology!",
        visualDescriptionVi: "Màn hình hiển thị tóm tắt các hệ thức then chốt kèm nút bấm nổi bật 'Mở Phiếu học tập / Start Worksheet' dẫn thẳng sang phân hệ Quiz 5 câu hỏi.",
        visualDescriptionEn: "Screen displays formula recap cards alongside prominent primary CTA button 'Start Worksheet' leading into the 5-question multi-tier interactive quiz.",
        formulas: [
          "CD \\approx 49.9\\text{ m}",
          "\\text{Double check: } CD = \\frac{AB}{\\cot(42^\\circ) - \\cot(63^\\circ)} \\approx 49.91\\text{ m}"
        ],
        checkpointVi: "Chuyển tiếp học sinh sang làm phiếu bài tập tương tác có chấm điểm và phản hồi tự động.",
        checkpointEn: "Transition student to automated interactive quiz with instant scaffolded feedback.",
        interactiveType: "svg-lighthouse"
      }
    ],

    // --- VOCABULARY LIST (7 ITEMS) ---
    vocabulary: [
      {
        term: "Angle of elevation",
        phonetics: "/ˈæŋ.ɡəl əv ˌel.ɪˈveɪ.ʃən/",
        partOfSpeech: "noun phrase",
        definitionVi: "Góc nâng (góc nhọn tạo bởi đường ngắm hướng lên một vật thể trên cao và đường nằm ngang).",
        definitionEn: "The acute angle formed between the horizontal line of sight and the upward line of sight to an elevated object.",
        exampleSentence: "From observation station A, the surveyor measured an angle of elevation of 42 degrees to the lighthouse apex. (Từ trạm quan sát A, kỹ sư trắc địa đã đo được góc nâng 42 độ đến đỉnh ngọn hải đăng.)"
      },
      {
        term: "Inaccessible base",
        phonetics: "/ˌɪn.əkˈses.ə.bəl beɪs/",
        partOfSpeech: "noun phrase",
        definitionVi: "Chân tháp không thể tiếp cận (vị trí đáy của công trình bị cô lập, không thể đến đo đạc khoảng cách trực tiếp).",
        definitionEn: "A base point of an elevated structure that cannot be directly reached or physically measured due to natural obstacles.",
        exampleSentence: "Because the rocky cliff creates an inaccessible base, indirect triangulation is required. (Vì vách đá tạo ra một chân tháp không thể tiếp cận, phương pháp tam giác đạc gián tiếp là bắt buộc.)"
      },
      {
        term: "Law of Sines",
        phonetics: "/lɔː əv saɪnz/",
        partOfSpeech: "noun",
        definitionVi: "Định lý Sin (trong mọi tam giác, tỉ số giữa mỗi cạnh và sin của góc đối diện là một hằng số bằng hai lần bán kính đường tròn ngoại tiếp).",
        definitionEn: "The trigonometric theorem stating that the side lengths of any triangle are proportional to the sines of their opposite angles.",
        exampleSentence: "We apply the Law of Sines in triangle ABD to determine the length of the connecting side BD. (Ta áp dụng Định lý Sin trong tam giác ABD để xác định độ dài cạnh cầu nối BD.)"
      },
      {
        term: "Right triangle",
        phonetics: "/raɪt ˈtraɪ.æŋ.ɡəl/",
        partOfSpeech: "noun",
        definitionVi: "Tam giác vuông (tam giác có một góc trong bằng đúng 90 độ).",
        definitionEn: "A triangle possessing one interior right angle of exactly ninety degrees.",
        exampleSentence: "In right triangle BCD, the vertical height CD is calculated using the sine of angle CBD. (Trong tam giác vuông BCD, chiều cao thẳng đứng CD được tính bằng sin của góc CBD.)"
      },
      {
        term: "Height",
        phonetics: "/haɪt/",
        partOfSpeech: "noun",
        definitionVi: "Chiều cao (khoảng cách thẳng đứng hạ vuông góc từ đỉnh công trình xuống mặt phẳng nằm ngang tại đáy).",
        definitionEn: "The vertical distance measured perpendicularly from the peak of an object down to ground level.",
        exampleSentence: "The calculated height of the lighthouse is approximately 49.9 meters. (Chiều cao tính toán được của ngọn hải đăng xấp xỉ 49,9 mét.)"
      },
      {
        term: "Collinear",
        phonetics: "/kəʊˈlɪn.i.ər/",
        partOfSpeech: "adjective",
        definitionVi: "Thẳng hàng (nhiều điểm cùng nằm trên một đường thẳng).",
        definitionEn: "Points lying together along the same straight geometric line.",
        exampleSentence: "Observation stations A, B, and the cliff base C are strictly collinear along the coast. (Các trạm quan sát A, B và chân vách đá C hoàn toàn thẳng hàng dọc theo bờ biển.)"
      },
      {
        term: "Theodolite",
        phonetics: "/θiˈɒd.ə.laɪt/",
        partOfSpeech: "noun",
        definitionVi: "Giác kế / Máy kinh vĩ (dụng cụ quang học trắc địa chuyên dùng để đo góc nâng và góc phương vị).",
        definitionEn: "A precision optical survey instrument used to measure horizontal and vertical angles.",
        exampleSentence: "Surveyors set up a theodolite at station B to measure the 63-degree angle of elevation. (Các trắc địa viên đã đặt một máy kinh vĩ tại trạm B để đo góc nâng 63 độ.)"
      }
    ],

    // --- QUIZ (5 QUESTIONS) ---
    quiz: [
      {
        id: "q1_lighthouse_data",
        tier: 1,
        type: "fact_extraction",
        questionVi: "Trong bài toán trên, vì sao ta không thể tính ngay chiều cao CD bằng công thức CD = BC · tan(63°) ngay từ đầu?",
        questionEn: "In this scenario, why cannot we directly compute height CD using the formula CD = BC · tan(63°) right at the start?",
        optionsVi: [
          "A. Vì chân tháp C bị cô lập trên vách đá hiểm trở nên khoảng cách BC không thể đo trực tiếp bằng thước.",
          "B. Vì góc nâng tại điểm B chưa được đo chính xác.",
          "C. Vì tam giác BCD không phải là tam giác vuông tại C.",
          "D. Vì thiếu thông số góc nâng tại điểm A."
        ],
        optionsEn: [
          "A. Because cliff base C is inaccessible, making ground distance BC directly unmeasurable by tape.",
          "B. Because the angle of elevation at station B was not measured accurately.",
          "C. Because triangle BCD is not a right-angled triangle at C.",
          "D. Because the angle of elevation at station A is missing."
        ],
        correctIndex: 0,
        explanationVi: "Chân tháp C là vị trí không thể tiếp cận (inaccessible base), do đó khoảng cách BC là đại lượng chưa biết và không thể đo trực tiếp. Ta bắt buộc phải thiết lập tam giác phụ ABD với hai trạm quan sát A và B trên đất liền để gián tiếp tính toán.",
        explanationEn: "Cliff base C is an inaccessible base, meaning distance BC cannot be directly measured. We must set up auxiliary triangle ABD using two accessible observation stations A and B on flat ground to solve the problem indirectly.",
        hints: {
          hint1Vi: "Hãy quan sát Phân cảnh 1 và 2: Vị trí chân tháp C có đặc điểm gì đặc biệt?",
          hint1En: "Review Scenes 1 and 2: What physical characteristic describes base point C?",
          hint2Vi: "Nếu không đo được BC thì công thức CD = BC · tan(63°) có dùng ngay được không?",
          hint2En: "If BC is unmeasured, can CD = BC · tan(63°) be calculated immediately?",
          solutionVi: "Khoảng cách BC không thể đo trực tiếp nên phải thiết lập tam giác phụ ABD.",
          solutionEn: "Distance BC cannot be physically measured, requiring auxiliary triangle ABD."
        }
      },
      {
        id: "q2_lighthouse_angle",
        tier: 2,
        type: "modeling",
        questionVi: "Trong tam giác ABD, số đo của góc ADB là bao nhiêu độ?",
        questionEn: "Inside triangle ABD, what is the exact angular measure of angle ADB?",
        optionsVi: ["A. 42°", "B. 63°", "C. 21°", "D. 105°"],
        optionsEn: ["A. 42°", "B. 63°", "C. 21°", "D. 105°"],
        correctIndex: 2,
        explanationVi: "Góc CBD = 63° là góc ngoài tại đỉnh B của tam giác ABD. Do đó, theo tính chất góc ngoài của tam giác: góc ADB = góc CBD - góc CAD = 63° - 42° = 21° (Hoặc tính qua góc trong kề bù: góc ABD = 180° - 63° = 117° => góc ADB = 180° - (42° + 117°) = 21°).",
        explanationEn: "Angle CBD = 63° is the exterior angle at vertex B of triangle ABD. Therefore: angle ADB = angle CBD - angle CAD = 63° - 42° = 21° (or via supplementary angle ABD = 180° - 63° = 117° => ADB = 180° - (42° + 117°) = 21°).",
        hints: {
          hint1Vi: "Hãy nhớ lại tính chất góc ngoài của tam giác: Góc ngoài bằng tổng hai góc trong không kề với nó.",
          hint1En: "Recall triangle exterior angle theorem: An exterior angle equals the sum of two opposite interior angles.",
          hint2Vi: "Góc CBD = góc CAD + góc ADB => góc ADB = 63° - 42°.",
          hint2En: "Angle CBD = angle CAD + angle ADB => angle ADB = 63° - 42°.",
          solutionVi: "Số đo góc ADB = 63° - 42° = 21°.",
          solutionEn: "Angle ADB = 63° - 42° = 21°."
        }
      },
      {
        id: "q3_lighthouse_sine",
        tier: 2,
        type: "modeling",
        questionVi: "Công thức nào sau đây áp dụng đúng Định lý Sin trong tam giác ABD để tìm độ dài cạnh BD qua khoảng cách AB = 30m?",
        questionEn: "Which of the following correctly expresses the Law of Sines in triangle ABD to determine edge length BD from AB = 30m?",
        optionsVi: [
          "A. BD = (AB · sin 21°) / sin 42°",
          "B. BD = (AB · sin 42°) / sin 21°",
          "C. BD = (AB · sin 63°) / sin 42°",
          "D. BD = AB · cos 42°"
        ],
        optionsEn: [
          "A. BD = (AB · sin 21°) / sin 42°",
          "B. BD = (AB · sin 42°) / sin 21°",
          "C. BD = (AB · sin 63°) / sin 42°",
          "D. BD = AB · cos 42°"
        ],
        correctIndex: 1,
        explanationVi: "Theo Định lý Sin trong tam giác ABD: BD / sin(góc CAD) = AB / sin(góc ADB) <=> BD / sin(42°) = AB / sin(21°) => BD = (AB · sin 42°) / sin(21°) = (30 · sin 42°) / sin(21°) ≈ 55.99 mét.",
        explanationEn: "By the Law of Sines in triangle ABD: BD / sin(angle CAD) = AB / sin(angle ADB) <=> BD / sin(42°) = AB / sin(21°) => BD = (AB · sin 42°) / sin(21°) = (30 · sin 42°) / sin(21°) ≈ 55.99 meters.",
        hints: {
          hint1Vi: "Định lý Sin: Tỉ số giữa mỗi cạnh và sin của góc đối diện là bằng nhau.",
          hint1En: "Law of Sines: Ratio of each side to the sine of its opposite angle is constant.",
          hint2Vi: "Cạnh BD đối diện góc A (42°); cạnh AB đối diện góc D (21°).",
          hint2En: "Side BD faces angle A (42°); side AB faces angle D (21°).",
          solutionVi: "BD = (AB · sin 42°) / sin 21°.",
          solutionEn: "BD = (AB · sin 42°) / sin 21°."
        }
      },
      {
        id: "q4_lighthouse_height",
        tier: 1,
        type: "fact_extraction",
        questionVi: "Chiều cao ngọn hải đăng CD sau khi tính toán và làm tròn đến một chữ số thập phân là bao nhiêu mét?",
        questionEn: "What is the computed height CD of the lighthouse rounded to one decimal place in meters?",
        optionsVi: ["A. 49.9 m", "B. 55.0 m", "C. 30.0 m", "D. 63.2 m"],
        optionsEn: ["A. 49.9 m", "B. 55.0 m", "C. 30.0 m", "D. 63.2 m"],
        correctIndex: 0,
        explanationVi: "Trong tam giác vuông BCD vuông tại C: CD = BD · sin(63°) ≈ 55.9868 · 0.8910065 ≈ 49.8847 mét ≈ 49.9 mét. (Kiểm chứng qua công thức cotang: CD = 30 / (cot 42° - cot 63°) = 30 / (1.11061 - 0.50953) ≈ 49.91 mét).",
        explanationEn: "In right triangle BCD at C: CD = BD · sin(63°) ≈ 55.9868 · 0.8910065 ≈ 49.8847 meters ≈ 49.9 meters. (Cross-checked via cotangents: CD = 30 / (cot 42° - cot 63°) = 30 / (1.11061 - 0.50953) ≈ 49.91 meters).",
        hints: {
          hint1Vi: "Sử dụng cạnh huyền BD ≈ 55.99m và góc CBD = 63° trong tam giác vuông BCD.",
          hint1En: "Use hypotenuse BD ≈ 55.99m and angle CBD = 63° in right triangle BCD.",
          hint2Vi: "CD = BD · sin(63°) = 55.9868 · 0.8910065.",
          hint2En: "CD = BD · sin(63°) = 55.9868 · 0.8910065.",
          solutionVi: "CD ≈ 49.88m, làm tròn thành 49.9m.",
          solutionEn: "CD ≈ 49.88m, rounding to 49.9m."
        }
      },
      {
        id: "q5_lighthouse_vocab",
        tier: 3,
        type: "math_english",
        questionVi: "Thuật ngữ tiếng Anh nào biểu thị 'góc tạo bởi đường ngắm hướng lên một mục tiêu trên cao và đường nằm ngang'?",
        questionEn: "Which Math English term denotes the acute angle between the horizontal line of sight and an upward line of sight to an object?",
        optionsVi: [
          "A. Angle of depression",
          "B. Angle of elevation",
          "C. Inaccessible base",
          "D. Right triangle"
        ],
        optionsEn: [
          "A. Angle of depression",
          "B. Angle of elevation",
          "C. Inaccessible base",
          "D. Right triangle"
        ],
        correctIndex: 1,
        explanationVi: "'Angle of elevation' có nghĩa là góc nâng (ngắm lên trên). Trái lại, 'Angle of depression' là góc hạ (ngắm từ trên xuống dưới). 'Inaccessible base' là chân tháp không thể tiếp cận.",
        explanationEn: "'Angle of elevation' represents an upward line of sight above horizontal. In contrast, 'Angle of depression' looks downwards from above. 'Inaccessible base' refers to an unapproachable base.",
        hints: {
          hint1Vi: "Từ 'elevation' bắt nguồn từ gốc từ 'elevate' (nâng lên, đưa lên cao).",
          hint1En: "The word 'elevation' shares roots with 'elevate' (to lift or raise upward).",
          hint2Vi: "Đường ngắm hướng lên đỉnh hải đăng là góc nâng.",
          hint2En: "The line of sight pointing up to the lighthouse top is an elevation angle.",
          solutionVi: "'Angle of elevation' là thuật ngữ chính xác.",
          solutionEn: "'Angle of elevation' is the correct term."
        }
      }
    ],

    // --- VERIFICATION MATRIX (10 CRITERIA) ---
    verification: STANDARD_VERIFICATION_RULES
  },

  // =========================================================================
  // LESSON 2: QUADRATIC FUNCTION (CỔNG PARABOL & CHIỀU CAO XE TẢI)
  // =========================================================================
  {
    id: "lesson-parabolic-arch",
    topic: "quadratic",
    topicTitleVi: "Hàm số bậc hai và Ứng dụng thực tế",
    topicTitleEn: "Quadratic Functions and Parabola Modeling",
    titleVi: "Cổng chào Parabol và Giới hạn chiều cao xe tải",
    titleEn: "Parabolic Entrance Arch and Vehicle Height Clearance",
    grade: "10",
    difficulty: "Medium",
    estimatedMinutes: 15,
    thumbnail: "/assets/khkt/image1.png",
    realWorldContextVi: "Ban tổ chức lễ hội cần vận chuyển xe tải chở thiết bị âm thanh và màn hình LED dạng hình hộp chữ nhật đi qua cổng chào hình vòm Parabol có bề rộng chân cổng 8m và chiều cao đỉnh 6m.",
    realWorldContextEn: "A festival committee needs to transport a box truck carrying audio gear and LED stage screens through a parabolic entrance arch measuring 8m across the base and 6m tall at its apex.",
    status: "PUBLISHED",
    author: "Ban Chuyên môn Toán - Tiếng Anh (CLIL)",
    publishedAt: "2026-11-06T10:00:00Z",

    // --- 5 SCENES ---
    scenes: [
      {
        id: 1,
        key: "context",
        titleVi: "Mở đầu bối cảnh: Cổng vòm lễ hội",
        titleEn: "Context Introduction: Festival Entrance Arch",
        contentVi: "Một ban tổ chức lễ hội cần đưa xe tải chở dàn màn hình LED sân khấu đi qua một cổng chào hình vòm Parabol lớn. Liệu chiếc xe tải thùng hộp cao lớn có thể lưu thông an toàn mà không bị va quệt nóc xe vào trần cổng vòm hay không?",
        contentEn: "A festival organizing committee needs to drive a container truck transporting LED stage screens through a grand parabolic entrance arch. Can this tall box truck pass through safely without scraping its roof against the curved arch ceiling?",
        visualDescriptionVi: "Toàn cảnh 3D cổng chào vòm cong parabol uy nghi bắc qua đường lộ. Một chiếc xe tải thùng hộp chữ nhật chở thiết bị sân khấu đang tiến về phía chân cổng.",
        visualDescriptionEn: "3D perspective of a grand parabolic entrance arch spanning a festival boulevard. A rectangular container truck approaches the gateway.",
        formulas: ["\\text{Arch: Parabola curve}", "\\text{Truck: Rectangular prism}"],
        checkpointVi: "Nhận diện dạng hình học: Đường cong vòm parabol ôm lấy tiết diện hình hộp của xe tải.",
        checkpointEn: "Identify geometric shapes: Parabolic arch encompassing the rectangular box cross-section of the truck.",
        interactiveType: "svg-parabola"
      },
      {
        id: 2,
        key: "facts",
        titleVi: "Dữ kiện thực tế & Kích thước đo đạc",
        titleEn: "Given Facts & Dimensions",
        contentVi: "Cổng vòm có nhịp chân tiếp xúc mặt đất rộng 8m và chiều cao tại đỉnh vòm là 6m. Chiếc xe tải có bề rộng thùng xe là 4m và chiều cao xe là 4,2m, di chuyển chính giữa cổng vòm dọc theo tim đường.",
        contentEn: "The arch has a ground span of 8 meters and reaches a maximum height of 6 meters at its vertex. The truck has a cargo box width of 4 meters and height of 4.2 meters, driving centered down the roadway.",
        visualDescriptionVi: "Mô hình 2D trực diện: Nhịp đáy cổng AB = 8m, chiều cao đỉnh S = 6m. Thùng xe rộng w = 4m, cao h0 = 4.2m đặt đối xứng chính giữa tim đường.",
        visualDescriptionEn: "2D front elevation view: Arch ground span AB = 8m, apex height S = 6m. Truck box width w = 4m, height h0 = 4.2m placed symmetrically centered.",
        formulas: [
          "\\text{Span } L = AB = 8\\text{ m}",
          "\\text{Apex height } H = 6\\text{ m}",
          "\\text{Truck width } w = 4\\text{ m}",
          "\\text{Truck height } h_0 = 4.2\\text{ m}"
        ],
        checkpointVi: "Xác định rõ 4 kích thước: Nhịp đáy 8m, cao đỉnh 6m, xe rộng 4m, xe cao 4.2m.",
        checkpointEn: "Verify 4 primary dimensions: Base span 8m, apex 6m, truck width 4m, truck height 4.2m.",
        interactiveType: "svg-parabola"
      },
      {
        id: 3,
        key: "problem",
        titleVi: "Vấn đề & Từ vựng Math English",
        titleEn: "Problem & Math English Vocabulary",
        contentVi: "Hãy thiết lập phương trình Parabol y = ax² + bx + c trên hệ trục tọa độ Oxy để tính chiều cao của vòm cổng tại vị trí mép ngoài cùng của xe tải, rồi đối chiếu với chiều cao 4,2m của xe!",
        contentEn: "Let's establish the quadratic parabola equation y = ax² + bx + c in coordinate system Oxy to compute the arch ceiling height at the truck outer edges, then compare against the 4.2m truck height!",
        visualDescriptionVi: "Hệ trục Oxy với gốc O đặt tại mặt đất. Bảng từ vựng Math English mở bên cạnh: Parabolic arch, Quadratic function, Vertex, Axis of symmetry, Clearance height, Span.",
        visualDescriptionEn: "Coordinate plane Oxy with ground origin O. Math English glossary appears: Parabolic arch, Quadratic function, Vertex, Axis of symmetry, Clearance height, Span.",
        formulas: [
          "y = ax^2 + bx + c \\quad (a \\ne 0)",
          "\\text{Safety condition: } y(x_{\\text{edge}}) > 4.2\\text{ m}"
        ],
        checkpointVi: "Xác lập mục tiêu: Lập hàm bậc hai và tính chiều cao cổng tại x = 2m.",
        checkpointEn: "Establish goal: Formulate quadratic function and determine arch ceiling height at x = 2m.",
        interactiveType: "svg-parabola"
      },
      {
        id: 4,
        key: "guidance",
        titleVi: "Gợi mở tư duy mô hình hóa",
        titleEn: "Mathematical Modeling Guidance",
        contentVi: "Gợi ý: Chọn gốc O tại trung điểm chân cổng trên mặt đất, trục Oy thẳng đứng đi qua đỉnh vòm S(0; 6). Nhờ tính đối xứng, parabol có dạng y = ax² + 6 (b = 0). Chân cổng bên phải là B(4; 0). Thay B(4; 0) vào phương trình: 16a + 6 = 0 suy ra a = -3/8.",
        contentEn: "Hint: Place origin O at the midpoint of ground bases, with vertical y-axis passing through vertex S(0, 6). By symmetry, the equation simplifies to y = ax² + 6 (b = 0). Right base B has coordinates (4, 0). Substituting B(4, 0) yields 16a + 6 = 0, so a = -3/8.",
        visualDescriptionVi: "Sơ đồ tọa độ Oxy: Đỉnh S(0, 6), hai chân A(-4, 0) và B(4, 0). Minh họa các bước biến đổi 16a + 6 = 0 => a = -3/8. Không tính trước y(2).",
        visualDescriptionEn: "Oxy coordinate diagram: Vertex S(0, 6), ground bases A(-4, 0) and B(4, 0). Stepwise animation shows 16a + 6 = 0 => a = -3/8. Calculation of y(2) is withheld.",
        formulas: [
          "S(0, 6) \\implies c = 6, b = 0",
          "B(4, 0) \\implies a \\cdot 4^2 + 6 = 0 \\implies a = -\\frac{3}{8} = -0.375",
          "y = -\\frac{3}{8}x^2 + 6 \\quad (-4 \\le x \\le 4)"
        ],
        checkpointVi: "Hiểu sâu sắc kỹ thuật chọn hệ trục đối xứng để triệt tiêu hệ số b = 0.",
        checkpointEn: "Appreciate symmetric coordinate selection eliminating the linear term b = 0.",
        interactiveType: "svg-parabola"
      },
      {
        id: 5,
        key: "practice",
        titleVi: "Thực hành & Kiểm tra an toàn",
        titleEn: "Practice & Clearance Verification",
        contentVi: "Bây giờ, hãy mở phiếu học tập, tính chiều cao cổng tại mép xe x = 2m, xác định khoảng cách an toàn và kết luận xem xe tải có qua lọt cổng vòm hay không nhé!",
        contentEn: "Now, open your worksheet, compute the arch height at truck edge x = 2m, find the clearance safety margin, and conclude whether the truck passes safely!",
        visualDescriptionVi: "Hình vẽ xe tải rộng 4m (mép x = ±2m) với đường gióng lên đồ thị y(2) = 4.5m. Khoảng hở an toàn 0.3m tô màu xanh lá kèm nút mở phiếu học tập.",
        visualDescriptionEn: "Diagram of the 4m-wide truck with edge projections reaching y(2) = 4.5m. Green safety clearance buffer of 0.3m highlighted with CTA button to worksheet.",
        formulas: [
          "y(2) = -\\frac{3}{8}(2)^2 + 6 = -1.5 + 6 = 4.5\\text{ m}",
          "\\Delta h = 4.5\\text{ m} - 4.2\\text{ m} = 0.3\\text{ m} = 30\\text{ cm} > 0"
        ],
        checkpointVi: "Chuyển tiếp học sinh sang làm phiếu bài tập tương tác.",
        checkpointEn: "Direct learners to interactive assessment worksheet.",
        interactiveType: "svg-parabola"
      }
    ],

    // --- VOCABULARY LIST (7 ITEMS) ---
    vocabulary: [
      {
        term: "Parabolic arch",
        phonetics: "/ˌpær.əˈbɒl.ɪk ɑːtʃ/",
        partOfSpeech: "noun phrase",
        definitionVi: "Cổng vòm parabol (kết cấu vòm cong kiến trúc có dạng hình học của một parabol).",
        definitionEn: "An architectural curved arch structured in the symmetrical shape of a parabola.",
        exampleSentence: "The festival committee designed a parabolic arch spanning 8 meters across the boulevard. (Ban tổ chức lễ hội đã thiết kế một cổng vòm parabol có nhịp rộng 8 mét bắc qua đại lộ.)"
      },
      {
        term: "Quadratic function",
        phonetics: "/kwɒdˈræt.ɪk ˈfʌŋk.ʃən/",
        partOfSpeech: "noun phrase",
        definitionVi: "Hàm số bậc hai (hàm số đa thức bậc hai có dạng y = ax² + bx + c với hệ số a khác 0).",
        definitionEn: "A polynomial function of degree two, represented by f(x) = ax² + bx + c where leading coefficient a ≠ 0.",
        exampleSentence: "We modeled the arch boundary line using a quadratic function with a negative leading coefficient. (Chúng ta mô hình hóa đường viền cổng vòm bằng một hàm số bậc hai có hệ số bậc cao nhất âm.)"
      },
      {
        term: "Vertex",
        phonetics: "/ˈvɜː.teks/",
        partOfSpeech: "noun",
        definitionVi: "Đỉnh của parabol (điểm cực đại hoặc cực tiểu của đường cong parabol, nằm trên trục đối xứng).",
        definitionEn: "The highest or lowest turning point on a parabola, situated on its axis of symmetry at (-b/(2a), -Δ/(4a)).",
        exampleSentence: "The vertex of the entrance arch reaches a maximum height of 6 meters above the road. (Đỉnh của cổng chào đạt chiều cao tối đa 6 mét so với mặt đường.)"
      },
      {
        term: "Axis of symmetry",
        phonetics: "/ˈæk.sɪs əv ˈsɪm.ə.tri/",
        partOfSpeech: "noun phrase",
        definitionVi: "Trục đối xứng (đường thẳng đứng chia đồ thị parabol thành hai nửa đối xứng gương hoàn toàn).",
        definitionEn: "The vertical line that divides a parabola into two congruent, mirror-image halves.",
        exampleSentence: "By centering our coordinate system, the vertical y-axis serves as the axis of symmetry. (Bằng cách đặt hệ tọa độ tại tâm, trục tung Oy đóng vai trò là trục đối xứng.)"
      },
      {
        term: "Clearance height",
        phonetics: "/ˈklɪə.rəns haɪt/",
        partOfSpeech: "noun phrase",
        definitionVi: "Chiều cao tĩnh không / Khoảng hở an toàn (khoảng cách trống cho phép phương tiện lọt qua mà không va chạm).",
        definitionEn: "The available vertical headspace allowing a vehicle or object to travel underneath without collision.",
        exampleSentence: "At the outer edges of the truck, the clearance height is 4.5 meters, leaving a 30 cm buffer. (Tại mép ngoài xe tải, chiều cao tĩnh không là 4,5 mét, để lại khoảng hở an toàn 30 cm.)"
      },
      {
        term: "Span",
        phonetics: "/spæn/",
        partOfSpeech: "noun",
        definitionVi: "Nhịp vòm / Bề rộng chân vòm (khoảng cách nằm ngang giữa hai điểm tiếp đất của cổng vòm).",
        definitionEn: "The full horizontal extent or distance between the two supporting ground bases of an arch.",
        exampleSentence: "The total span of the parabolic arch base on the ground measures exactly 8 meters. (Tổng nhịp đáy của cổng vòm parabol trên mặt đất đo được chính xác 8 mét.)"
      },
      {
        term: "Y-intercept",
        phonetics: "/ˈwaɪ ˌɪn.tə.sept/",
        partOfSpeech: "noun",
        definitionVi: "Tung độ gốc (tọa độ giao điểm của đồ thị hàm số với trục tung Oy tại x = 0).",
        definitionEn: "The y-coordinate of the point where a mathematical graph crosses the vertical y-axis.",
        exampleSentence: "In our centered model, the y-intercept is 6, representing the peak height of the arch. (Trong mô hình đặt tại tâm, tung độ gốc là 6, đại diện cho chiều cao đỉnh vòm.)"
      }
    ],

    // --- QUIZ (5 QUESTIONS) ---
    quiz: [
      {
        id: "q1_parabola_coord",
        tier: 2,
        type: "modeling",
        questionVi: "Khi đặt gốc tọa độ O tại chân cổng bên trái A(-4; 0) và dời hệ trục, hệ số a của parabol trong phương trình có bị thay đổi giá trị so với khi đặt gốc O tại trung điểm chân cổng không?",
        questionEn: "If we shift the coordinate system so the origin is at the left ground base A, does coefficient 'a' change compared to the centered origin?",
        optionsVi: [
          "A. Không thay đổi, hệ số a vẫn bằng -3/8 vì độ mở và chiều cong của parabol là bất biến.",
          "B. Có thay đổi, hệ số a đổi dấu thành dương +3/8.",
          "C. Có thay đổi, hệ số a bị giảm đi một nửa.",
          "D. Không thể xác định được nếu không lập lại toàn bộ phương trình."
        ],
        optionsEn: [
          "A. It does not change; coefficient 'a' remains -3/8 because curvature and aperture are geometrically invariant.",
          "B. It changes; coefficient 'a' flips to positive +3/8.",
          "C. It changes; coefficient 'a' is halved.",
          "D. It cannot be determined without recalculating from scratch."
        ],
        correctIndex: 0,
        explanationVi: "Hệ số a quy định độ mở và hướng bề lõm của parabol. Phép tịnh tiến hệ trục tọa độ chỉ làm thay đổi tọa độ đỉnh, tung độ gốc và hệ số b, c chứ hoàn toàn không làm thay đổi hình dạng hình học hay hệ số a = -3/8 của parabol.",
        explanationEn: "Leading coefficient 'a' dictates the vertical curvature and aperture of the parabola. Rigid translation of the coordinate axes changes only 'b' and 'c', leaving 'a = -3/8' strictly invariant.",
        hints: {
          hint1Vi: "Hãy nhớ lại ý nghĩa hình học của hệ số a trong hàm số bậc hai y = ax² + bx + c.",
          hint1En: "Recall the geometric meaning of coefficient 'a' in quadratic function y = ax² + bx + c.",
          hint2Vi: "Dịch chuyển hệ trục tọa độ (phép tịnh tiến) có làm parabol cong hơn hay dẹt đi không?",
          hint2En: "Does translating coordinate axes alter the curvature of the physical arch?",
          solutionVi: "Độ mở parabol không đổi nên hệ số a luôn bằng -3/8.",
          solutionEn: "Parabola aperture is constant, so coefficient 'a' remains -3/8."
        }
      },
      {
        id: "q2_parabola_equation",
        tier: 2,
        type: "modeling",
        questionVi: "Với cách đặt gốc tọa độ O tại trung điểm hai chân cổng trên mặt đất, phương trình parabol y = ax² + 6 đi qua điểm chân cổng bên phải B(4; 0). Hệ số a được tính như thế nào?",
        questionEn: "With origin O at the ground base midpoint, parabola y = ax² + 6 passes through right base B(4, 0). What is the exact value of coefficient 'a'?",
        optionsVi: [
          "A. a = -3/8 (-0.375)",
          "B. a = 3/8 (0.375)",
          "C. a = -3/4 (-0.75)",
          "D. a = -6/8 (-0.75)"
        ],
        optionsEn: [
          "A. a = -3/8 (-0.375)",
          "B. a = 3/8 (0.375)",
          "C. a = -3/4 (-0.75)",
          "D. a = -6/8 (-0.75)"
        ],
        correctIndex: 0,
        explanationVi: "Thay tọa độ điểm B(4; 0) vào phương trình: 0 = a · (4)² + 6 <=> 16a = -6 <=> a = -6/16 = -3/8 = -0.375.",
        explanationEn: "Substitute coordinates of B(4, 0) into the equation: 0 = a · (4)² + 6 <=> 16a = -6 <=> a = -6/16 = -3/8 = -0.375.",
        hints: {
          hint1Vi: "Thay x = 4 và y = 0 vào phương trình y = ax² + 6.",
          hint1En: "Substitute x = 4 and y = 0 into equation y = ax² + 6.",
          hint2Vi: "Giải phương trình bậc nhất tìm a: 16a + 6 = 0.",
          hint2En: "Solve linear equation for a: 16a + 6 = 0.",
          solutionVi: "a = -6/16 = -3/8 = -0.375.",
          solutionEn: "a = -6/16 = -3/8 = -0.375."
        }
      },
      {
        id: "q3_parabola_height",
        tier: 1,
        type: "fact_extraction",
        questionVi: "Xe tải rộng 4m chạy chính giữa cổng nên mép ngoài thùng xe tương ứng với x = 2m. Chiều cao trần cổng parabol tại mép xe y(2) là bao nhiêu mét?",
        questionEn: "The truck is 4m wide centered on the road, placing its outer edges at x = ±2m. What is the arch ceiling height y(2) in meters?",
        optionsVi: ["A. 4.5 m", "B. 4.0 m", "C. 5.0 m", "D. 4.2 m"],
        optionsEn: ["A. 4.5 m", "B. 4.0 m", "C. 5.0 m", "D. 4.2 m"],
        correctIndex: 0,
        explanationVi: "Thay x = 2 vào hàm số: y(2) = (-3/8) · (2)² + 6 = (-3/8) · 4 + 6 = -3/2 + 6 = -1.5 + 6 = 4.5 mét.",
        explanationEn: "Substitute x = 2 into the function: y(2) = (-3/8) · (2)² + 6 = (-3/8) · 4 + 6 = -3/2 + 6 = -1.5 + 6 = 4.5 meters.",
        hints: {
          hint1Vi: "Thay x = 2 vào phương trình y = -3/8 x² + 6.",
          hint1En: "Substitute x = 2 into equation y = -3/8 x² + 6.",
          hint2Vi: "2 bình phương bằng 4; (-3/8) nhân 4 bằng -1.5.",
          hint2En: "2 squared equals 4; (-3/8) times 4 equals -1.5.",
          solutionVi: "y(2) = -1.5 + 6 = 4.5m.",
          solutionEn: "y(2) = -1.5 + 6 = 4.5m."
        }
      },
      {
        id: "q4_parabola_clearance",
        tier: 1,
        type: "fact_extraction",
        questionVi: "Biết xe tải có chiều cao 4,2m, kết luận nào sau đây là chính xác về tính an toàn khi xe lưu thông qua cổng vòm parabol?",
        questionEn: "Given the truck height of 4.2m, which conclusion accurately evaluates the physical safety of traveling under the arch?",
        optionsVi: [
          "A. Xe tải đi qua an toàn vì chiều cao cổng tại mép xe là 4,5m > 4,2m, khoảng hở an toàn còn lại là 30 cm (0.3m).",
          "B. Xe tải bị va chạm ở nóc vì chiều cao cổng chỉ đạt 4,2m.",
          "C. Xe chỉ đi lọt nếu di chuyển ép sát vào chân cổng bên phải.",
          "D. Xe không đi qua được vì chiều cao trần cổng tại mép ngoài xe chỉ là 4,0m."
        ],
        optionsEn: [
          "A. The truck clears safely because arch height at the edge is 4.5m > 4.2m, leaving a 30 cm (0.3m) clearance buffer.",
          "B. The truck collides because arch height is only 4.2m.",
          "C. The truck only fits if it drives hugging the right ground base.",
          "D. The truck cannot pass because arch ceiling height at the edge is only 4.0m."
        ],
        correctIndex: 0,
        explanationVi: "Tại mép ngoài cùng của xe tải (x = ±2m), chiều cao trần cổng đạt 4.5m. Chiều cao xe là 4.2m < 4.5m. Khoảng hở an toàn là: Δh = 4.5m - 4.2m = 0.3m = 30 cm > 0, do đó xe tải hoàn toàn đi qua an toàn.",
        explanationEn: "At the outer edges of the truck (x = ±2m), arch height reaches 4.5m. The truck height is 4.2m < 4.5m. Safety clearance buffer is Δh = 4.5m - 4.2m = 0.3m = 30 cm > 0, ensuring safe transit.",
        hints: {
          hint1Vi: "So sánh chiều cao trần cổng 4.5m với chiều cao thùng xe 4.2m.",
          hint1En: "Compare the 4.5m arch ceiling height against the 4.2m truck height.",
          hint2Vi: "Tính hiệu số 4.5 - 4.2 = 0.3m.",
          hint2En: "Calculate the clearance margin: 4.5 - 4.2 = 0.3m.",
          solutionVi: "Xe đi qua an toàn với khoảng hở 30 cm.",
          solutionEn: "The truck clears safely with 30 cm clearance buffer."
        }
      },
      {
        id: "q5_parabola_vocab",
        tier: 3,
        type: "math_english",
        questionVi: "Thuật ngữ Math English nào dùng để chỉ 'điểm cao nhất hoặc thấp nhất của đường cong parabol'?",
        questionEn: "Which Math English term denotes the highest or lowest turning point of a parabola?",
        optionsVi: ["A. Span", "B. Vertex", "C. Axis of symmetry", "D. Y-intercept"],
        optionsEn: ["A. Span", "B. Vertex", "C. Axis of symmetry", "D. Y-intercept"],
        correctIndex: 1,
        explanationVi: "'Vertex' là đỉnh của parabol (tọa độ (-b/(2a), -Δ/(4a))). 'Span' là nhịp đáy, 'Axis of symmetry' là trục đối xứng, 'Y-intercept' là tung độ gốc.",
        explanationEn: "'Vertex' is the peak or lowest point of a parabola. 'Span' is horizontal base width, 'Axis of symmetry' is the line of mirror symmetry, and 'Y-intercept' is where it crosses the y-axis.",
        hints: {
          hint1Vi: "Trong hình học giải tích tiếng Anh, đỉnh của parabol được gọi là 'Vertex'.",
          hint1En: "In analytical geometry, the apex or turning point of a parabola is termed 'Vertex'.",
          hint2Vi: "Điểm S(0; 6) chính là đỉnh cao nhất của cổng vòm.",
          hint2En: "Point S(0, 6) is the peak vertex of the arch.",
          solutionVi: "'Vertex' là thuật ngữ chính xác.",
          solutionEn: "'Vertex' is the correct term."
        }
      }
    ],

    // --- VERIFICATION MATRIX (10 CRITERIA) ---
    verification: STANDARD_VERIFICATION_RULES
  },

  // =========================================================================
  // LESSON 3: OPTIMIZATION (TỐI ƯU HÓA DOANH THU XE BUÝT CHỢ LÁCH)
  // =========================================================================
  {
    id: "lesson-bus-optimization",
    topic: "optimization",
    topicTitleVi: "Tối ưu hóa và Cực trị hàm số bậc hai",
    topicTitleEn: "Quadratic Function Optimization & Extremum",
    titleVi: "Tối ưu hóa doanh thu xe buýt du lịch Chợ Lách",
    titleEn: "Maximizing Tourism Bus Revenue in Cho Lach",
    grade: "10",
    difficulty: "Hard",
    estimatedMinutes: 20,
    thumbnail: "/assets/khkt/image3.png",
    realWorldContextVi: "Hợp tác xã Vận tải Du lịch Chợ Lách khai thác tuyến xe buýt sinh thái miệt vườn Cái Mơn. Giá vé hiện tại 200.000 VNĐ với 60 khách/chuyến. Khảo sát cho thấy cứ giảm giá 10.000 VNĐ thì đón thêm 5 khách, sức chứa tối đa xe là 100 khách.",
    realWorldContextEn: "The Cho Lach Tourism Cooperative operates an eco-bus shuttling tourists to Cai Mon fruit orchards. Current fare is 200,000 VND with 60 riders/trip. Market research indicates each 10,000 VND discount attracts 5 more riders, with a maximum capacity of 100 passengers.",
    status: "PUBLISHED",
    author: "Ban Chuyên môn Toán - Tiếng Anh (CLIL)",
    publishedAt: "2026-11-06T10:00:00Z",

    // --- 5 SCENES ---
    scenes: [
      {
        id: 1,
        key: "context",
        titleVi: "Mở đầu bối cảnh: Tuyến xe du lịch sinh thái Chợ Lách",
        titleEn: "Context Introduction: Cho Lach Eco-Tourism Bus",
        contentVi: "Hợp tác xã Vận tải Du lịch Chợ Lách khai thác tuyến xe buýt du lịch sinh thái miệt vườn Cái Mơn. Làm thế nào để định giá vé sao cho vừa thu hút thêm hành khách, vừa đạt tổng doanh thu cao nhất cho mỗi chuyến xe?",
        contentEn: "The Cho Lach Tourism Transport Cooperative operates an eco-bus line welcoming visitors to Cai Mon fruit orchards. How should they price tickets to attract more passengers while maximizing total gross revenue per trip?",
        visualDescriptionVi: "Toàn cảnh bến xe du lịch sinh thái Chợ Lách nhộn nhịp du khách bên dòng sông Tiền hiền hòa, rợp bóng dừa và vườn cây ăn trái Cái Mơn, đoàn xe buýt xanh thân thiện môi trường đón khách.",
        visualDescriptionEn: "Scenic eco-tourism bus depot in Cho Lach along the Mekong riverbanks, bordered by lush fruit orchards, with modern green shuttle buses boarding visitors.",
        formulas: ["\\text{Objective: Maximize total trip revenue } R"],
        checkpointVi: "Nhận thức bài toán thực tế: Sự đánh đổi giữa giảm đơn giá vé và gia tăng số lượng khách đi xe.",
        checkpointEn: "Recognize real-world trade-off: Sacrificing unit fare to expand passenger volume.",
        interactiveType: "svg-optimization"
      },
      {
        id: 2,
        key: "facts",
        titleVi: "Dữ kiện thực tế & Khảo sát thị trường",
        titleEn: "Given Facts & Market Survey",
        contentVi: "Hiện tại giá vé là 200.000 VNĐ ứng với lượng khách trung bình 60 người mỗi chuyến. Khảo sát thị trường cho thấy: Cứ mỗi lần giảm giá vé 10.000 VNĐ thì số khách lại tăng thêm 5 người. Mỗi chuyến xe chở tối đa 100 khách.",
        contentEn: "Currently, tickets cost 200,000 VND with an average of 60 passengers per trip. Market research indicates: Each 10,000 VND fare discount attracts 5 additional passengers. Each bus has a maximum seating capacity of 100.",
        visualDescriptionVi: "Bảng dữ liệu khảo sát thị trường: Giá gốc P0 = 200.000 VNĐ -> Q0 = 60 khách. Quy luật đàn hồi: Giảm 10.000 VNĐ/vé -> Tăng 5 khách. Giới hạn trần sức chứa xe là 100 khách.",
        visualDescriptionEn: "Market survey dashboard: Baseline fare P0 = 200,000 VND -> Baseline ridership Q0 = 60. Elasticity rule: -10,000 VND/ticket -> +5 riders. Seating capacity cap = 100.",
        formulas: [
          "P_0 = 200{,}000\\text{ VNĐ}",
          "Q_0 = 60\\text{ khách}",
          "\\Delta P = 10{,}000\\text{ VNĐ}",
          "\\Delta Q = 5\\text{ khách}",
          "Q_{\\max} = 100\\text{ khách}"
        ],
        checkpointVi: "Nắm vững 5 thông số: P0, Q0, delta P, delta Q và giới hạn trần 100 khách.",
        checkpointEn: "Memorize 5 factual parameters: P0, Q0, delta P, delta Q, and capacity cap of 100.",
        interactiveType: "svg-optimization"
      },
      {
        id: 3,
        key: "problem",
        titleVi: "Vấn đề & Từ vựng Math English",
        titleEn: "Problem & Math English Vocabulary",
        contentVi: "Hãy xây dựng hàm số Doanh thu R(x) = P(x) · Q(x) theo số lần giảm giá x, tìm số lần giảm giá tối ưu để doanh thu đạt cực đại và tính mức doanh thu kỷ lục đó!",
        contentEn: "Let's formulate the quadratic Revenue function R(x) = P(x) · Q(x) in terms of discount steps x, determine the optimal discount count to maximize revenue, and calculate this peak revenue!",
        visualDescriptionVi: "Công thức kinh tế cơ bản Doanh thu = Đơn giá x Lượng khách. Bảng từ vựng Math English mở bên cạnh: Revenue, Unit price, Demand, Optimization, Maximum value, Domain constraint, Trade-off.",
        visualDescriptionEn: "Core economic equation Revenue = Price × Quantity. Math English vocabulary panel appears: Revenue, Unit price, Demand, Optimization, Maximum value, Domain constraint, Trade-off.",
        formulas: [
          "R(x) = P(x) \\cdot Q(x)",
          "\\text{Find } x^* \\in [0, 8] \\text{ such that } R(x^*) = R_{\\max}"
        ],
        checkpointVi: "Hiểu mô hình doanh thu: Tích hai hàm số bậc nhất tạo thành tam thức bậc hai có bề lõm quay xuống.",
        checkpointEn: "Understand revenue model: Product of two linear terms yields a concave downward quadratic.",
        interactiveType: "svg-optimization"
      },
      {
        id: 4,
        key: "guidance",
        titleVi: "Gợi mở tư duy mô hình hóa",
        titleEn: "Mathematical Modeling Guidance",
        contentVi: "Gợi ý: Gọi x là số lần giảm giá. Giá vé mới P(x) = 200.000 - 10.000x, số khách Q(x) = 60 + 5x (với 0 <= x <= 8). Nhân ra ta được R(x) = -50.000x² + 400.000x + 12.000.000. Vì hệ số a = -50.000 âm, parabol đạt giá trị lớn nhất tại đỉnh x = -b / (2a).",
        contentEn: "Hint: Let x be the discount count. New fare P(x) = 200,000 - 10,000x, ridership Q(x) = 60 + 5x (where 0 <= x <= 8). Expanding yields R(x) = -50,000x² + 400,000x + 12,000,000. Since a = -50,000 is negative, the parabola reaches maximum at vertex x = -b / (2a).",
        visualDescriptionVi: "Đồ thị parabol biểu diễn doanh thu cong lên đỉnh. Mũi tên chỉ tọa độ đỉnh x = -400.000 / (2 · -50.000) = 4. Chưa hiển thị giá vé mới và doanh thu cực đại.",
        visualDescriptionEn: "Parabolic revenue curve rising to an optimum. Arrow points to vertex calculation x = -400,000 / (2 · -50,000) = 4. Final fare and revenue are withheld.",
        formulas: [
          "P(x) = 200{,}000 - 10{,}000x",
          "Q(x) = 60 + 5x \\quad (0 \\le x \\le 8)",
          "R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000",
          "x_V = -\\frac{b}{2a} = -\\frac{400{,}000}{2 \\cdot (-50{,}000)} = 4"
        ],
        checkpointVi: "Áp dụng công thức đỉnh parabol lớp 10 để giải quyết bài toán tối ưu hóa kinh tế.",
        checkpointEn: "Apply Grade 10 quadratic vertex formula to solve economic optimization.",
        interactiveType: "svg-optimization"
      },
      {
        id: 5,
        key: "practice",
        titleVi: "Thực hành & Đánh giá kinh tế",
        titleEn: "Practice & Economic Evaluation",
        contentVi: "Bây giờ, hãy mở phiếu học tập, tính giá vé tối ưu, lượng khách đón được và mức doanh thu kỷ lục của nhà xe nhé!",
        contentEn: "Now, open your worksheet, compute the optimal ticket fare, passenger capacity, and record bus revenue!",
        visualDescriptionVi: "Biểu đồ so sánh doanh thu ban đầu 12.000.000 VNĐ với doanh thu tối ưu 12.800.000 VNĐ (tăng 800.000 VNĐ) kèm nút bấm mở phiếu bài tập.",
        visualDescriptionEn: "Comparative revenue chart: baseline 12,000,000 VND vs. peak 12,800,000 VND (+800,000 VND) with primary CTA button to worksheet.",
        formulas: [
          "x^* = 4 \\implies P^* = 160{,}000\\text{ VNĐ}, Q^* = 80\\text{ khách}",
          "R^* = 12{,}800{,}000\\text{ VNĐ} \\quad (\\Delta R = +800{,}000\\text{ VNĐ})"
        ],
        checkpointVi: "Chuyển tiếp học sinh sang làm phiếu bài tập tương tác.",
        checkpointEn: "Transition learners to interactive assessment worksheet.",
        interactiveType: "svg-optimization"
      }
    ],

    // --- VOCABULARY LIST (7 ITEMS) ---
    vocabulary: [
      {
        term: "Revenue",
        phonetics: "/ˈrev.ən.juː/",
        partOfSpeech: "noun",
        definitionVi: "Doanh thu (tổng số tiền thu được từ bán vé hoặc dịch vụ trước khi trừ đi các chi phí vận hành).",
        definitionEn: "The total gross income generated by a business through the sale of goods or services before expenses are subtracted.",
        exampleSentence: "Total bus revenue equals the unit ticket price multiplied by the number of passengers. (Tổng doanh thu chuyến xe bằng đơn giá vé nhân với số lượng hành khách.)"
      },
      {
        term: "Unit price",
        phonetics: "/ˈjuː.nɪt praɪs/",
        partOfSpeech: "noun phrase",
        definitionVi: "Đơn giá / Giá vé (số tiền quy định cho một đơn vị vé hoặc một lượt hành khách).",
        definitionEn: "The monetary cost assigned to an individual unit of product or single travel ticket.",
        exampleSentence: "Discounting the unit price by 10,000 VND stimulates passenger demand. (Việc hạ đơn giá vé 10.000 VNĐ đã kích thích lượng cầu hành khách.)"
      },
      {
        term: "Demand",
        phonetics: "/dɪˈmɑːnd/",
        partOfSpeech: "noun",
        definitionVi: "Cầu / Lượng khách hàng (số lượng hành khách sẵn sàng và có khả năng mua vé ở một mức giá nhất định).",
        definitionEn: "The quantity of a service or commodity that consumers are willing and able to purchase at a given price.",
        exampleSentence: "Passenger demand increases linearly with every ticket fare reduction. (Lượng cầu hành khách tăng tuyến tính theo mỗi nấc giảm giá vé.)"
      },
      {
        term: "Optimization",
        phonetics: "/ˌɒp.tɪ.maɪˈzeɪ.ʃən/",
        partOfSpeech: "noun",
        definitionVi: "Tối ưu hóa (quá trình toán học nhằm tìm giá trị cực đại hoặc cực tiểu của một hàm số theo các biến số).",
        definitionEn: "The mathematical process of finding the maximum or minimum value achievable by a target function.",
        exampleSentence: "Quadratic function optimization helps businesses identify peak profitability. (Tối ưu hóa hàm số bậc hai giúp doanh nghiệp xác định điểm lợi nhuận cao nhất.)"
      },
      {
        term: "Maximum value",
        phonetics: "/ˈmæk.sɪ.məm ˈvæl.juː/",
        partOfSpeech: "noun phrase",
        definitionVi: "Giá trị cực đại / Giá trị lớn nhất (giá trị cao nhất mà hàm số đạt được trên miền khảo sát).",
        definitionEn: "The greatest numeric value attained by a mathematical function within its permissible domain.",
        exampleSentence: "The maximum value of trip revenue occurs when the ticket fare is set to 160,000 VND. (Giá trị cực đại của doanh thu xuất hiện khi giá vé được đặt ở mức 160.000 VNĐ.)"
      },
      {
        term: "Domain constraint",
        phonetics: "/dəʊˈmeɪn kənˈstreɪnt/",
        partOfSpeech: "noun phrase",
        definitionVi: "Ràng buộc miền xác định (điều kiện biên giới hạn giá trị thực tế của biến số trong bài toán).",
        definitionEn: "A physical or mathematical condition that restricts the allowable values of the independent variable.",
        exampleSentence: "Bus seating capacity imposes a strict domain constraint of x ≤ 8. (Sức chứa ghế ngồi của xe buýt áp đặt một ràng buộc miền xác định nghiêm ngặt x ≤ 8.)"
      },
      {
        term: "Trade-off",
        phonetics: "/ˈtreɪd.ɒf/",
        partOfSpeech: "noun",
        definitionVi: "Sự đánh đổi (mối quan hệ đánh đổi: chấp nhận giảm đơn giá để thu hút nhiều lượng khách hơn).",
        definitionEn: "A situational decision involving diminishing one quality in return for gaining another advantage.",
        exampleSentence: "The transport operator balances the trade-off between ticket discount and ridership expansion. (Nhà xe cân đối sự đánh đổi giữa việc giảm giá vé và mở rộng số lượng khách.)"
      }
    ],

    // --- QUIZ (5 QUESTIONS) ---
    quiz: [
      {
        id: "q1_bus_demand",
        tier: 1,
        type: "fact_extraction",
        questionVi: "Nếu gọi x là số lần giảm giá vé (mỗi lần giảm 10.000 VNĐ), biểu thức nào sau đây mô tả đúng lượng hành khách Q(x) trên mỗi chuyến xe?",
        questionEn: "Let x represent the number of 10,000 VND discount steps. Which expression correctly models passenger ridership Q(x)?",
        optionsVi: [
          "A. Q(x) = 60 + 5x",
          "B. Q(x) = 60 - 5x",
          "C. Q(x) = 200.000 + 5x",
          "D. Q(x) = 60 · 5x"
        ],
        optionsEn: [
          "A. Q(x) = 60 + 5x",
          "B. Q(x) = 60 - 5x",
          "C. Q(x) = 200,000 + 5x",
          "D. Q(x) = 60 · 5x"
        ],
        correctIndex: 0,
        explanationVi: "Ban đầu khi chưa giảm giá (x = 0), xe có 60 khách. Khảo sát cho thấy cứ mỗi lần giảm giá vé, xe lại đón thêm 5 khách. Vì vậy, sau x lần giảm giá vé, lượng khách trên xe là Q(x) = 60 + 5x.",
        explanationEn: "At baseline with no discounts (x = 0), ridership is 60. Market research shows each discount step brings 5 additional travelers. Therefore, after x discount steps, ridership is Q(x) = 60 + 5x.",
        hints: {
          hint1Vi: "Ban đầu có 60 khách; mỗi lần giảm giá lại tăng thêm 5 khách.",
          hint1En: "Starts with 60 passengers; each discount step adds 5 more riders.",
          hint2Vi: "Tăng thêm 5 khách cho mỗi lần x tương ứng với phép cộng 5x.",
          hint2En: "Adding 5 passengers per step x corresponds to adding 5x.",
          solutionVi: "Q(x) = 60 + 5x.",
          solutionEn: "Q(x) = 60 + 5x."
        }
      },
      {
        id: "q2_bus_quadratic",
        tier: 2,
        type: "modeling",
        questionVi: "Hàm số tổng doanh thu R(x) = (200.000 - 10.000x)(60 + 5x) sau khi khai triển thành tam thức bậc hai ax² + bx + c có hệ số a bằng bao nhiêu?",
        questionEn: "When expanded into ax² + bx + c, what is leading coefficient 'a' of revenue function R(x) = (200,000 - 10,000x)(60 + 5x)?",
        optionsVi: [
          "A. a = -50.000",
          "B. a = 50.000",
          "C. a = -10.000",
          "D. a = 400.000"
        ],
        optionsEn: [
          "A. a = -50,000",
          "B. a = 50,000",
          "C. a = -10,000",
          "D. a = 400,000"
        ],
        correctIndex: 0,
        explanationVi: "Khi nhân phân phối, số hạng chứa x² là (-10.000x) · (5x) = -50.000x². Do đó hệ số a = -50.000. Hàm số khai triển hoàn chỉnh là: R(x) = -50.000x² + 400.000x + 12.000.000.",
        explanationEn: "Multiplying terms gives the quadratic term (-10,000x) · (5x) = -50,000x², so leading coefficient a = -50,000. Full expanded quadratic is R(x) = -50,000x² + 400,000x + 12,000,000.",
        hints: {
          hint1Vi: "Nhân hệ số của x trong P(x) là -10.000 với hệ số của x trong Q(x) là +5.",
          hint1En: "Multiply the x-coefficient in P(x) (-10,000) with the x-coefficient in Q(x) (+5).",
          hint2Vi: "(-10.000) · 5 = -50.000.",
          hint2En: "(-10,000) · 5 = -50,000.",
          solutionVi: "a = -50.000.",
          solutionEn: "a = -50,000."
        }
      },
      {
        id: "q3_bus_optimal_fare",
        tier: 2,
        type: "modeling",
        questionVi: "Nhà xe nên định giá vé mới là bao nhiêu để doanh thu của mỗi chuyến xe đạt giá trị lớn nhất?",
        questionEn: "What optimal ticket price should the transport operator set to attain maximum revenue per trip?",
        optionsVi: [
          "A. 160.000 VNĐ",
          "B. 180.000 VNĐ",
          "C. 150.000 VNĐ",
          "D. 170.000 VNĐ"
        ],
        optionsEn: [
          "A. 160,000 VND",
          "B. 180,000 VND",
          "C. 150,000 VND",
          "D. 170,000 VND"
        ],
        correctIndex: 0,
        explanationVi: "Hàm số R(x) có a = -50.000 < 0 nên đạt cực đại tại đỉnh x = -b / (2a) = -400.000 / (2 · -50.000) = 4 lần giảm giá. Mức giá vé tối ưu tương ứng là: P(4) = 200.000 - 10.000 · 4 = 160.000 VNĐ.",
        explanationEn: "Because a = -50,000 < 0, revenue R(x) peaks at vertex x = -b / (2a) = -400,000 / (2 · -50,000) = 4 discount steps. Optimal ticket fare is P(4) = 200,000 - 10,000 · 4 = 160,000 VND.",
        hints: {
          hint1Vi: "Tìm tọa độ đỉnh x = -b / (2a) của tam thức bậc hai với b = 400.000 và a = -50.000.",
          hint1En: "Find parabola vertex x = -b / (2a) using b = 400,000 and a = -50,000.",
          hint2Vi: "x = 4; thay x = 4 vào công thức giá vé P(x) = 200.000 - 10.000x.",
          hint2En: "x = 4; substitute x = 4 into fare formula P(x) = 200,000 - 10,000x.",
          solutionVi: "P(4) = 200.000 - 40.000 = 160.000 VNĐ.",
          solutionEn: "P(4) = 200,000 - 40,000 = 160,000 VND."
        }
      },
      {
        id: "q4_bus_max_revenue",
        tier: 1,
        type: "fact_extraction",
        questionVi: "Doanh thu tối đa đạt được của mỗi chuyến xe là bao nhiêu và tăng thêm bao nhiêu so với trước khi giảm giá?",
        questionEn: "What is the maximum revenue achieved per trip, and how much does it increase compared to the baseline?",
        optionsVi: [
          "A. 12.800.000 VNĐ (tăng 800.000 VNĐ so với ban đầu)",
          "B. 12.500.000 VNĐ (tăng 500.000 VNĐ so với ban đầu)",
          "C. 13.000.000 VNĐ (tăng 1.000.000 VNĐ so với ban đầu)",
          "D. 14.200.000 VNĐ (tăng 2.200.000 VNĐ so với ban đầu)"
        ],
        optionsEn: [
          "A. 12,800,000 VND (an increase of 800,000 VND over baseline)",
          "B. 12,500,000 VND (an increase of 500,000 VND over baseline)",
          "C. 13,000,000 VND (an increase of 1,000,000 VND over baseline)",
          "D. 14,200,000 VND (an increase of 2,200,000 VND over baseline)"
        ],
        correctIndex: 0,
        explanationVi: "Tại x = 4: Số khách là Q(4) = 60 + 5 · 4 = 80 người. Giá vé là 160.000 VNĐ. Doanh thu cực đại R(4) = 160.000 · 80 = 12.800.000 VNĐ. So với doanh thu ban đầu R0 = 200.000 · 60 = 12.000.000 VNĐ, doanh thu tăng thêm: 12.800.000 - 12.000.000 = 800.000 VNĐ (+6.67%).",
        explanationEn: "At x = 4: Ridership Q(4) = 60 + 5 · 4 = 80 riders. Fare is 160,000 VND. Maximum revenue R(4) = 160,000 · 80 = 12,800,000 VND. Compared to baseline R0 = 200,000 · 60 = 12,000,000 VND, revenue increases by 12,800,000 - 12,000,000 = 800,000 VND (+6.67%).",
        hints: {
          hint1Vi: "Tính lượng khách tại x = 4: Q(4) = 60 + 5 · 4 = 80 khách.",
          hint1En: "Calculate passenger volume at x = 4: Q(4) = 60 + 5 · 4 = 80 riders.",
          hint2Vi: "Nhân giá vé tối ưu 160.000 với 80 khách rồi trừ doanh thu cũ 12.000.000.",
          hint2En: "Multiply optimal fare 160,000 by 80 riders and subtract baseline 12,000,000.",
          solutionVi: "R* = 12.800.000 VNĐ; tăng 800.000 VNĐ.",
          solutionEn: "R* = 12,800,000 VND; increases by 800,000 VND."
        }
      },
      {
        id: "q5_bus_vocab",
        tier: 3,
        type: "math_english",
        questionVi: "Trong toán kinh tế và tài chính, thuật ngữ nào biểu thị 'tổng số tiền thu được từ bán hàng hoặc dịch vụ trước khi trừ chi phí'?",
        questionEn: "In business mathematics and economics, which term represents the total gross intake before subtracting any costs?",
        optionsVi: ["A. Profit", "B. Revenue", "C. Cost", "D. Margin"],
        optionsEn: ["A. Profit", "B. Revenue", "C. Cost", "D. Margin"],
        correctIndex: 1,
        explanationVi: "'Revenue' là Doanh thu (tổng số tiền thu về). 'Profit' là Lợi nhuận (Doanh thu trừ Chi phí). 'Cost' là Chi phí. 'Margin' là Biên lợi nhuận.",
        explanationEn: "'Revenue' refers to total gross receipts from sales before expenses. 'Profit' is net earnings (Revenue minus Expenses). 'Cost' denotes expenditures, and 'Margin' is profit margin.",
        hints: {
          hint1Vi: "Từ này bắt nguồn từ tiếng Pháp có nghĩa là 'trở về' (tổng tiền thu về).",
          hint1En: "Derived from Old French meaning 'return' (total receipts brought back).",
          hint2Vi: "Doanh thu = Giá vé x Lượng khách = Revenue.",
          hint2En: "Revenue = Price × Quantity.",
          solutionVi: "'Revenue' là thuật ngữ chuẩn xác.",
          solutionEn: "'Revenue' is the correct term."
        }
      }
    ],

    // --- VERIFICATION MATRIX (10 CRITERIA) ---
    verification: STANDARD_VERIFICATION_RULES
  }
];

/**
 * Retrieves the complete list of default KHKT lessons.
 * @returns {import('./types.js').Lesson[]}
 */
export function getDefaultLessons() {
  return JSON.parse(JSON.stringify(DEFAULT_LESSONS));
}

/**
 * Finds a lesson by ID.
 * @param {string} id
 * @returns {import('./types.js').Lesson | undefined}
 */
export function getLessonById(id) {
  return DEFAULT_LESSONS.find(lesson => lesson.id === id);
}

export const defaultLessons = DEFAULT_LESSONS;
export const lessons = DEFAULT_LESSONS;
export default DEFAULT_LESSONS;
