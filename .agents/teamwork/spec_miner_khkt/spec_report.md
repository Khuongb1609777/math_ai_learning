# BÁO CÁO ĐẶC TẢ KỸ THUẬT & HỌC LIỆU KHKT (KHKT SPECIFICATION REPORT)

**Dự án**: Ứng dụng Trí tuệ nhân tạo phát triển Video song ngữ học Toán thực tiễn (Application of AI in Developing Bilingual Videos for Real-World Mathematics Education)  
**Tác giả đề tài KHKT**: Phạm Nguyễn Ti Na (Lớp 10A1, THPT Trần Văn Kiết, Vĩnh Long)  
**Người hướng dẫn**: Lê Thanh Tâm  
**Lĩnh vực**: Công nghệ thông tin (Phần mềm hệ thống & Học liệu số) — Năm học 2026 – 2027  
**Căn cứ pháp lý & học thuật**: Thông tư 84/2026/TT-BGDĐT; Chương trình GDPT 2018 môn Toán; Chu trình Blum & Leiß (2007); Khung CLIL (Coyle et al., 2010); Đa biểu diễn Goldin (2014); Học liệu đa phương tiện Mayer (2021).

---

## 1. TỔNG QUAN HỆ THỐNG VÀ CƠ SỞ LÝ LUẬN KHKT

### 1.1. Mục tiêu cốt lõi
Giải quyết rào cản nhận thức lớn nhất của học sinh lớp 10 khi học Toán thực tế: **khó khăn trong việc chuyển đổi văn bản tình huống đời sống phức tạp thành mô hình toán học (năng lực mô hình hóa toán học)** kết hợp với việc **thiếu hụt vốn từ vựng tiếng Anh chuyên ngành (Math English)** trong định hướng giáo dục tích hợp nội dung và ngôn ngữ (CLIL).

### 1.2. Ba trụ cột lý luận khoa học
1. **Chu trình mô hình hóa toán học Blum & Leiß (2007)**:
   $$\text{Tình huống thực tế (Real-world context)} \xrightarrow{\text{Hiểu \& Đơn giản hóa}} \text{Mô hình thực tế (Real model)} \xrightarrow{\text{Toán học hóa}} \text{Mô hình toán (Math model)} \xrightarrow{\text{Giải toán}} \text{Kết quả toán} \xrightarrow{\text{Diễn giải \& Đánh giá}} \text{Kết quả thực tế}$$
2. **Lý thuyết Đa biểu diễn (Multiple Representations - Goldin, 2014)**:
   Sự chuyển tiếp liên tục và đồng bộ giữa 3 dạng biểu diễn: Ngôn ngữ tự nhiên (Văn bản/Lời thoại) $\longleftrightarrow$ Trực quan không gian (Hình ảnh/Sơ đồ 2D-3D) $\longleftrightarrow$ Ký hiệu toán học hình thức (Công thức, ẩn số, hàm số).
3. **Mô hình giáo dục song ngữ CLIL (Content and Language Integrated Learning - Coyle et al., 2010)**:
   Học sinh tiếp thu từ vựng và thuật ngữ Toán tiếng Anh một cách tự nhiên trong ngữ cảnh giải quyết vấn đề, được hỗ trợ bởi âm thanh giọng đọc chuẩn bản ngữ và phụ đề song ngữ, tránh tình trạng quá tải nhận thức (Cognitive Load).

### 1.3. Bằng chứng thực nghiệm sư phạm từ đề tài KHKT ($N = 400$ học sinh lớp 10)
- **Điểm trung bình bài kiểm tra**: Tăng từ **$5.42/10$** lên **$7.85/10$** (Tăng $+2.43$ điểm, $p < 0.001$).
- **Tỉ lệ xác định đúng dữ kiện & bối cảnh**: Tăng từ **$58.5\%$** lên **$87.2\%$** ($+28.7\%$).
- **Tỉ lệ thiết lập mô hình toán học đúng**: Tăng từ **$42.0\%$** lên **$76.5\%$** ($+34.5\%$).
- **Tỉ lệ ứng dụng đúng thuật ngữ Math English**: Tăng từ **$31.2\%$** lên **$71.8\%$** ($+40.6\%$ — mức tăng trưởng mạnh nhất).
- **Mức độ hài lòng / Đánh giá tích cực**: Đạt **$92\%$** ($68\%$ rất hứng thú & tự tin, $24\%$ hứng thú & hiểu bài).

---

## 2. QUY TRÌNH 7 BƯỚC DẠY HỌC TOÁN THỰC TIỄN & SỐ HÓA HỌC LIỆU

Hệ thống số hóa quy trình 7 bước đã được chuẩn hóa trong nghiên cứu KHKT thành luồng vận hành khép kín trên Web App:

```
[Bước 1: Chọn bài toán thực tế]
         │
         ▼
[Bước 2: Phân tích Toán & Thuật ngữ Math EN]
         │
         ▼
[Bước 3: Biên soạn kịch bản 5 phân cảnh song ngữ]
         │
         ▼
[Bước 4: Khởi tạo đa phương tiện & Lưu vết Prompt AI]
         │
         ▼
[Bước 5: Thẩm định chéo qua Bảng kiểm 2 lớp (Dual-Verification)]
         │
    ┌────┴────────────────────────┐
    │ Đạt chuẩn 100%             │ Không đạt (Reject)
    ▼                             ▼
[Bước 6: Thử nghiệm diện hẹp]  [Quay lại Bước 2/3/4 chỉnh sửa]
         │
         ▼
[Bước 7: Đóng gói & Phát hành bài học tương tác CLIL]
```

### Chi tiết đặc tả 7 bước:

| Bước | Tên bước | Mục tiêu sư phạm & Kỹ thuật | Đầu vào (Inputs) | Đầu ra (Outputs) | Tác nhân / Công cụ |
|---|---|---|---|---|---|
| **B1** | **Lựa chọn bài toán thực tế** | Tuyển chọn bài toán thực tế trọng tâm môn Toán 10 (Hệ thức lượng, Parabol, Tối ưu hóa) có bối cảnh phong phú, gắn với đời sống/STEM. | Ngân hàng đề THPT, SGK mới (Cánh Diều, KNTT, CTST), đề thi KHKT. | Đề bài thực tế gốc, bối cảnh thực tế xác định. | Giáo viên / Chuyên gia bộ môn. |
| **B2** | **Phân tích Toán học & Tiếng Anh chuyên ngành** | Bóc tách tường minh các đại lượng, dữ kiện đã biết, ẩn số cần tìm, điều kiện biên, giải thuật chuẩn; trích xuất danh mục từ vựng Math English tương ứng kèm IPA và định nghĩa. | Đề bài thực tế gốc. | Ma trận đại lượng, lời giải chuẩn, Math Vocabulary List (term, IPA, POS, definition). | Giáo viên Toán, Giáo viên Tiếng Anh, Claude/ChatGPT hỗ trợ. |
| **B3** | **Viết kịch bản phân cảnh song ngữ** | Cấu trúc hóa bài toán thành 5 phân cảnh ngắn tuần tự theo logic nhận thức, xây dựng lời thoại song ngữ (VN - EN) và mô tả thị giác cho từng màn. | Ma trận phân tích từ B2. | Kịch bản 5 màn (Storyboard Markdown/JSON) đầy đủ visual prompt, voiceover text, checkpoint. | Tác giả bài học. |
| **B4** | **Khởi tạo nội dung đa phương tiện bằng AI** | Tạo hình ảnh minh họa bối cảnh 2D/3D (Midjourney/DALL-E 3), giọng đọc song ngữ chuẩn bản ngữ (ElevenLabs), video ghép tương tác (HeyGen/CapCut). Bắt buộc ghi nhận Prompt History. | Kịch bản B3, danh sách Prompt. | Asset hình ảnh, audio MP3 song ngữ, video clip MP4, Prompt Audit Log. | Bộ sinh AI, Web Speech API / Audio Engine. |
| **B5** | **Kiểm chứng 2 lớp (Dual-Verification)** | Thẩm định độc lập 2 phương diện: Lớp 1 (Toán học - số liệu, công thức, mô hình hóa) và Lớp 2 (Ngôn ngữ - độ chính xác thuật ngữ, ngữ âm, phụ đề). Ngăn chặn hoàn toàn hiện tượng AI hallucination. | Kịch bản B3 + Asset đa phương tiện B4. | Biên bản kiểm định đạt chuẩn 100% (Audit Report Passed) hoặc Ticket yêu cầu sửa chữa. | Ban kiểm định 2 lớp (Toán & Ngôn ngữ), Verification Engine. |
| **B6** | **Thử nghiệm diện hẹp (Pilot Testing)** | Trình chiếu/kiểm thử trên nhóm mẫu nhỏ (20 học sinh) để đo độ nét, âm lượng, tốc độ đọc (WPM ~120-140), khả năng tiếp thu từ vựng và thu thập phản hồi. | Video & Học liệu đã qua B5. | Bảng đánh giá phản hồi thử nghiệm, danh mục tinh chỉnh kỹ thuật. | Nhóm học sinh thử nghiệm, Hệ thống thu nhận khảo sát. |
| **B7** | **Đóng gói học liệu số hoàn chỉnh** | Tích hợp video 5 phân cảnh, bảng từ vựng tương tác, phiếu học tập (Worksheet/Quiz), Rubric chấm điểm và giải thích chi tiết thành gói bài học hoàn chỉnh. | Bài học hoàn thiện qua B6. | Khóa học số hóa sẵn sàng phát hành trên Web App (JSON package). | Nền tảng Web App. |

---

## 3. CẤU TRÚC KỊCH BẢN PHÂN CẢNH 5 MÀN CHUẨN HÓA SONG NGỮ (5-SCENE BILINGUAL STORYBOARD)

Mọi bài học trên Web App bắt buộc tuân thủ chặt chẽ cấu trúc 5 màn (Scenes) nối tiếp theo đúng tâm lý học nhận thức:

```
[Scene 1: Bối cảnh (Context)]
  └─ Kích thích tò mò, mở ra tình huống đời sống sinh động, nêu câu hỏi lớn.
        │
        ▼
[Scene 2: Dữ kiện (Given Facts)]
  └─ Số hóa các đại lượng thực tế thành sơ đồ hình học / đại số trực quan.
        │
        ▼
[Scene 3: Vấn đề & Từ vựng (Problem & Vocabulary)]
  └─ Chỉ rõ mục tiêu toán học và trang bị bảng từ vựng Math English then chốt.
        │
        ▼
[Scene 4: Gợi mở tư duy mô hình hóa (Mathematical Modeling Guidance)]
  └─ Hướng dẫn các bước trung gian (bước cầu nối), KHÔNG đưa ngay đáp số cuối cùng.
        │
        ▼
[Scene 5: Thực hành & Chuyển giao (Practice & Worksheet Transition)]
  └─ Kêu gọi hành động, chuyển sang Phiếu học tập tương tác để tự giải và kiểm chứng.
```

### Ma trận quy chuẩn từng màn:

| Phân cảnh (Scene) | Tên màn | Yếu tố hình ảnh (Visual / Canvas) | Lời thoại song ngữ (VN - EN Audio & Subtitle) | Tương tác & Điểm kiểm tra (Checkpoint) |
|---|---|---|---|---|
| **Màn 1** | **Bối cảnh (Context / Introduction)** | Bối cảnh 3D/ảnh thực tế sống động (ngọn hải đăng biển đảo, cổng vòm lễ hội, đoàn xe du lịch). Loại bỏ công thức toán gây sợ hãi ban đầu. | Câu hỏi gợi mở thực tế: "Làm thế nào để...?", "How can we measure/optimize...?". | Nút chuyển màn hoặc tự động phát; học sinh xác định bối cảnh thực tế. |
| **Màn 2** | **Dữ kiện (Given Facts / Data)** | Sơ đồ hình học phẳng/không gian 2D rõ nét, gắn nhãn chính xác các số liệu đo lường, góc nâng, khoảng cách, đơn vị đo. | Thuyết minh từng số liệu: "Từ hai điểm A và B cách nhau 30m...", "From points A and B 30m apart...". | Trực quan hóa dữ kiện; kiểm tra học sinh nắm rõ các giả thiết đã cho. |
| **Màn 3** | **Vấn đề & Từ vựng (Problem & Vocabulary)** | Đánh dấu ẩn số cần tìm bằng dấu hỏi chấm `?` hoặc highlight màu; hiển thị Bảng từ vựng Math English tương tác kèm nút loa phát âm. | Nêu rõ mục tiêu giải quyết: "Hãy áp dụng... để tìm...", "Apply... to determine...". | Học sinh bấm nghe phát âm IPA, xem nghĩa từ vựng chuyên ngành. |
| **Màn 4** | **Gợi mở tư duy (Modeling Guidance)** | Sơ đồ động biểu diễn bước biến đổi trung gian (góc phụ, phương trình hàm số, trục tọa độ $Oxy$). | Gợi ý phương pháp: "Gợi ý: Tính góc... trước, sau đó dùng định lý...", "Hint: Calculate angle... then apply...". | **Quy tắc vàng: Không đưa ra đáp số cuối cùng** để tránh làm mất cơ hội tư duy độc lập của học sinh. |
| **Màn 5** | **Thực hành (Practice & Worksheet)** | Hiển thị tóm tắt công thức chốt và nút bấm nổi bật: "Bắt đầu làm Phiếu học tập / Start Worksheet". | Lời mời thực hành: "Bây giờ, hãy mở phiếu học tập và tính toán nhé!", "Now, open your worksheet and solve it!". | Nhấp chuyển thẳng sang phân hệ Quiz/Worksheet tương tác 3 khía cạnh. |

---

## 4. BỘ DỮ LIỆU 3 BÀI TOÁN THỰC TẾ LỚP 10 CHUẨN HÓA

### BÀI TOÁN 1: ĐO CHIỀU CAO NGỌN HẢI ĐĂNG (HỆ THỨC LƯỢNG TRONG TAM GIÁC)
*Chủ đề: Hệ thức lượng trong tam giác — Lớp 10 (Hình học)*  
*Nguồn gốc: Trích xuất nguyên bản từ Báo cáo KHKT Ti Na (Mục 3.2, Bảng 2 & Hình 2)*

#### 1. Dữ liệu thực nghiệm & Thông số chính xác
- **Bối cảnh**: Đo chiều cao ngọn hải đăng ven biển đứng trên mỏm đá cao dốc đứng, chân tháp $C$ ở vị trí nguy hiểm, sóng lớn không thể tiếp cận trực tiếp.
- **Dữ kiện đo đạc**:
  - Hai điểm quan sát $A$ và $B$ trên mặt đất bằng phẳng ven biển thẳng hàng với chân tháp $C$ ($A, B, C$ thẳng hàng, $B$ nằm giữa $A$ và $C$).
  - Khoảng cách giữa hai mốc đo: $AB = 30\text{ m}$.
  - Góc nâng đo được từ điểm $A$ đến đỉnh ngọn hải đăng $D$: $\widehat{CAD} = \alpha = 42^\circ$.
  - Góc nâng đo được từ điểm $B$ đến đỉnh ngọn hải đăng $D$: $\widehat{CBD} = \beta = 63^\circ$.
  - Tháp thẳng đứng vuông góc với mặt đất: $\widehat{BCD} = 90^\circ$.
- **Mục tiêu**: Tính chiều cao ngọn hải đăng $h = CD$ (đơn vị: mét, làm tròn đến 1 chữ số thập phân).

#### 2. Kịch bản phân cảnh 5 màn song ngữ chi tiết

```json
{
  "id": "lesson-1-lighthouse",
  "title": {
    "vi": "Đo chiều cao ngọn hải đăng với chân tháp không thể tiếp cận",
    "en": "Measuring Lighthouse Height with an Inaccessible Base"
  },
  "topic": "Trigonometric Relations in Triangles",
  "scenes": [
    {
      "sceneNumber": 1,
      "type": "context",
      "title": { "vi": "Mở đầu bối cảnh", "en": "Context Introduction" },
      "visualDescription": "Toàn cảnh 3D ngọn hải đăng sừng sững trên vách đá ven biển lộng gió, sóng vỗ chân bờ đá hiểm trở. Điểm C là chân ngọn hải đăng không thể tiếp cận.",
      "voiceover": {
        "vi": "Chào các bạn! Làm thế nào để đo chiều cao ngọn hải đăng khi ta không thể đến chân tháp?",
        "en": "Hello! How can we measure the height of a lighthouse when its base is inaccessible?"
      },
      "checkpoint": "Quan sát bối cảnh thực tế và nhận diện chướng ngại vật (chân tháp không tiếp cận được)."
    },
    {
      "sceneNumber": 2,
      "type": "given_facts",
      "title": { "vi": "Dữ kiện thực tế", "en": "Given Facts & Measurement" },
      "visualDescription": "Sơ đồ 2D góc nhìn ngang: Đường thẳng mặt đất chứa A, B, C. Tháp thẳng đứng CD vuông góc AC. Khoảng cách AB = 30m. Góc nâng tại A là 42 độ, tại B là 63 độ.",
      "voiceover": {
        "vi": "Từ hai điểm A và B cách nhau 30m, ta đo được góc nâng đến đỉnh hải đăng lần lượt là 42° và 63°.",
        "en": "From points A and B 30m apart, the angles of elevation to the top are 42° and 63°."
      },
      "checkpoint": "Ghi nhận: AB = 30m, góc CAD = 42°, góc CBD = 63°, A-B-C thẳng hàng."
    },
    {
      "sceneNumber": 3,
      "type": "problem_vocabulary",
      "title": { "vi": "Vấn đề & Từ vựng Math English", "en": "Problem & Math English Vocabulary" },
      "visualDescription": "Mô hình tam giác ABD liên kết với tam giác vuông BCD. Hộp từ vựng Math English nổi bật bên cạnh sơ đồ.",
      "voiceover": {
        "vi": "Hãy áp dụng Định lý Sin trong tam giác ABD để tính độ dài cạnh BD, từ đó tìm chiều cao CD!",
        "en": "Apply the Law of Sines in triangle ABD to find length BD, then determine height CD!"
      },
      "checkpoint": "Hiểu yêu cầu bài toán: Tính BD trước, sau đó tính CD trong tam giác vuông BCD."
    },
    {
      "sceneNumber": 4,
      "type": "modeling_guidance",
      "title": { "vi": "Gợi mở tư duy mô hình hóa", "en": "Mathematical Modeling Guidance" },
      "visualDescription": "Sơ đồ góc phụ: Góc ngoài tam giác CBD = 63° => Góc ADB = 63° - 42° = 21°. Công thức định lý Sin: BD / sin(42°) = AB / sin(21°).",
      "voiceover": {
        "vi": "Gợi ý: Góc ADB = 63° - 42° = 21°. Sử dụng Định lý Sin: BD / sin(A) = AB / sin(D) để tính BD.",
        "en": "Hint: Angle ADB = 63° - 42° = 21°. Apply Law of Sines: BD / sin(A) = AB / sin(D) to calculate BD."
      },
      "checkpoint": "Không đưa ra đáp số cuối cùng. Hướng dẫn học sinh suy luận BD."
    },
    {
      "sceneNumber": 5,
      "type": "practice",
      "title": { "vi": "Thực hành tính toán", "en": "Practice & Worksheet" },
      "visualDescription": "Tam giác vuông BCD tại C hiển thị công thức CD = BD * sin(63°). Màn hình xuất hiện lời kêu gọi mở phiếu học tập.",
      "voiceover": {
        "vi": "Bây giờ, hãy mở phiếu học tập và tính chiều cao CD của ngọn hải đăng nhé!",
        "en": "Now, open your worksheet and calculate the height CD of the lighthouse!"
      },
      "checkpoint": "Chuyển tiếp học sinh sang làm phiếu bài tập tương tác."
    }
  ]
}
```

#### 3. Các bước mô hình hóa toán học & Lời giải chuẩn
- **Bước 1: Tính góc $\widehat{ADB}$ trong tam giác $ABD$**
  Vì $\widehat{CBD}$ là góc ngoài tại đỉnh $B$ của tam giác $ABD$:
  $$\widehat{ADB} = \widehat{CBD} - \widehat{CAD} = 63^\circ - 42^\circ = 21^\circ$$
  *(Hoặc: $\widehat{ABD} = 180^\circ - 63^\circ = 117^\circ \implies \widehat{ADB} = 180^\circ - (42^\circ + 117^\circ) = 21^\circ$)*.
- **Bước 2: Áp dụng Định lý Sin trong tam giác $ABD$ để tìm độ dài $BD$**
  $$\frac{BD}{\sin(\widehat{CAD})} = \frac{AB}{\sin(\widehat{ADB})} \implies BD = \frac{AB \cdot \sin(42^\circ)}{\sin(21^\circ)} = \frac{30 \cdot \sin(42^\circ)}{\sin(21^\circ)}$$
  Thay số:
  $$\sin(42^\circ) \approx 0.6691306, \quad \sin(21^\circ) \approx 0.3583680$$
  $$BD \approx \frac{30 \cdot 0.6691306}{0.3583680} \approx 55.9868\text{ m}$$
- **Bước 3: Tính chiều cao $CD$ trong tam giác vuông $BCD$**
  Tam giác $BCD$ vuông tại $C$, do đó:
  $$CD = BD \cdot \sin(\widehat{CBD}) = BD \cdot \sin(63^\circ)$$
  $$\sin(63^\circ) \approx 0.8910065$$
  $$CD \approx 55.9868 \cdot 0.8910065 \approx 49.8847\text{ m} \approx 49.9\text{ m}$$
- *(Phương pháp giải thay thế bằng cotang để kiểm chứng)*:
  $$AC = CD \cdot \cot(42^\circ), \quad BC = CD \cdot \cot(63^\circ)$$
  $$AB = AC - BC = CD \cdot (\cot 42^\circ - \cot 63^\circ) \implies CD = \frac{30}{\cot 42^\circ - \cot 63^\circ} = \frac{30}{1.11061 - 0.50953} = \frac{30}{0.60109} \approx 49.91\text{ m}$$

#### 4. Danh mục từ vựng Math English (CLIL Vocabulary)
| Thuật ngữ (Term) | Phiên âm IPA | Từ loại | Định nghĩa Tiếng Việt | English Definition |
|---|---|---|---|---|
| **Angle of elevation** | /ˈæŋ.ɡəl əv ˌel.ɪˈveɪ.ʃən/ | noun phrase | Góc nâng (góc tạo bởi đường ngắm hướng lên đỉnh và mặt phẳng nằm ngang) | The angle between the horizontal line of sight and the upward line of sight to an object. |
| **Inaccessible base** | /ˌɪn.əkˈses.ə.bəl beɪs/ | noun phrase | Chân tháp không thể tiếp cận (vị trí đáy không thể đo đạc khoảng cách trực tiếp) | A base point of a structure that cannot be directly reached or physically measured. |
| **Law of Sines** | /lɔː əv saɪnz/ | noun | Định lý Sin (tỉ số giữa cạnh tam giác và sin góc đối diện bằng nhau) | The theorem stating that the ratio of a triangle side to the sine of its opposite angle is constant ($\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R$). |
| **Height** | /haɪt/ | noun | Chiều cao (độ dài đoạn thẳng hạ vuông góc từ đỉnh xuống mặt đáy) | The vertical distance from the top of an object to its base. |
| **Right triangle** | /raɪt ˈtraɪ.æŋ.ɡəl/ | noun | Tam giác vuông (tam giác có một góc bằng $90^\circ$) | A triangle having an interior angle of ninety degrees. |
| **Collinear** | /kəʊˈlɪn.i.ər/ | adjective | Thẳng hàng (cùng nằm trên một đường thẳng) | Lying on the same straight line. |
| **Theodolite** | /θiˈɒd.ə.laɪt/ | noun | Giác kế / Máy kinh vĩ (thiết bị quang học đo góc nâng và phương vị) | A precision optical instrument for measuring angles in the horizontal and vertical planes. |

#### 5. Bộ câu hỏi tương tác (Interactive Quiz / Worksheet)
1. **Câu 1 (Trích xuất dữ kiện)**: Trong bài toán trên, vì sao ta không thể tính trực tiếp $CD$ bằng công thức $CD = BC \cdot \tan(63^\circ)$ ngay từ đầu?  
   - *A*. Vì chưa biết góc $\widehat{CBD}$.  
   - *B*. Vì chân tháp $C$ bị cô lập hiểm trở nên độ dài khoảng cách $BC$ chưa đo được trực tiếp. *(Đáp án đúng)*  
   - *C*. Vì tam giác $BCD$ không phải là tam giác vuông.  
   - *D*. Vì thiếu góc nâng tại điểm $A$.  
   *Giải thích*: Chân tháp $C$ là điểm không thể tiếp cận (inaccessible base), do đó khoảng cách $BC$ không thể đo trực tiếp bằng thước dây. Ta bắt buộc phải lập tam giác phụ $ABD$ qua hai mốc đo tự do $A$ và $B$.
2. **Câu 2 (Mô hình hóa)**: Số đo của góc $\widehat{ADB}$ trong tam giác $ABD$ là:  
   - *A*. $42^\circ$  
   - *B*. $63^\circ$  
   - *C*. $21^\circ$ *(Đáp án đúng: $63^\circ - 42^\circ = 21^\circ$)*  
   - *D*. $105^\circ$  
3. **Câu 3 (Thiết lập công thức)**: Công thức đúng theo Định lý Sin để biểu diễn độ dài cạnh $BD$ qua $AB$ là:  
   - *A*. $BD = \frac{AB \cdot \sin(21^\circ)}{\sin(42^\circ)}$  
   - *B*. $BD = \frac{AB \cdot \sin(42^\circ)}{\sin(21^\circ)}$ *(Đáp án đúng)*  
   - *C*. $BD = \frac{AB \cdot \sin(63^\circ)}{\sin(42^\circ)}$  
   - *D*. $BD = AB \cdot \cos(42^\circ)$  
4. **Câu 4 (Tính toán & Diễn giải)**: Chiều cao ngọn hải đăng $CD$ sau khi tính toán và làm tròn đến một chữ số thập phân là bao nhiêu mét?  
   - *A*. $49.9\text{ m}$ *(Đáp án đúng: $CD \approx 49.88\text{ m} \approx 49.9\text{ m}$)*  
   - *B*. $55.0\text{ m}$  
   - *C*. $30.0\text{ m}$  
   - *D*. $63.2\text{ m}$  
5. **Câu 5 (Math English)**: The term "Angle of elevation" corresponds to which Vietnamese concept?  
   - *A*. Góc hạ  
   - *B*. Góc nâng *(Đáp án đúng)*  
   - *C*. Góc tù  
   - *D*. Góc phẳng nhị diện  

---

### BÀI TOÁN 2: CỔNG VÒM PARABOL & XE TẢI LỌT QUA CỔNG (HÀM SỐ BẬC HAI)
*Chủ đề: Hàm số bậc hai và Ứng dụng thực tế — Lớp 10 (Đại số)*  
*Nguồn gốc: Trọng tâm SGK Toán 10 mới & danh mục bài toán điển hình đề tài KHKT (Hình 1 & Báo cáo Mục 3.1)*

#### 1. Dữ liệu thực nghiệm & Thông số chính xác
- **Bối cảnh**: Ban tổ chức lễ hội tại quảng trường cần vận chuyển một xe tải chở thiết bị âm thanh và màn hình LED dạng hình hộp chữ nhật đi qua một cổng chào hình vòm Parabol.
- **Dữ kiện đo đạc**:
  - Cổng vòm có hình dạng một parabol quay bề lõm xuống dưới.
  - Khoảng cách giữa hai chân cổng tiếp xúc mặt đất: $L = AB = 8\text{ m}$.
  - Chiều cao cao nhất của cổng vòm (tính từ mặt đất đến đỉnh vòm cao nhất $S$): $H = 6\text{ m}$.
  - Chiếc xe tải có bề rộng thùng xe là $w = 4\text{ m}$, xe di chuyển chính giữa cổng vòm (đường tim đường đi trùng với trục đối xứng của cổng parabol).
- **Mục tiêu**:
  1. Xác định hàm số bậc hai mô tả đường viền của cổng vòm parabol.
  2. Tính khoảng không chiều cao của cổng vòm tại mép ngoài cùng của xe tải ($x = \pm 2\text{ m}$).
  3. Chiều cao xe tải là $h_0 = 4.2\text{ m}$. Hỏi xe tải có thể đi qua cổng vòm an toàn hay không? Khoảng hở an toàn còn lại là bao nhiêu?

#### 2. Kịch bản phân cảnh 5 màn song ngữ chi tiết

```json
{
  "id": "lesson-2-parabolic-arch",
  "title": {
    "vi": "Cổng chào Parabol và Bài toán chiều cao an toàn cho xe tải",
    "en": "Parabolic Entrance Arch and Vehicle Height Clearance"
  },
  "topic": "Quadratic Functions & Parabola Modeling",
  "scenes": [
    {
      "sceneNumber": 1,
      "type": "context",
      "title": { "vi": "Mở đầu bối cảnh", "en": "Context Introduction" },
      "visualDescription": "Toàn cảnh 3D cổng chào vòm cong parabol uy nghi tại cửa ngõ khu đô thị. Một chiếc xe tải thùng hộp chữ nhật chở thiết bị sân khấu đang tiến vào cổng.",
      "voiceover": {
        "vi": "Một cổng chào lớn có hình dạng parabol. Liệu một chiếc xe tải thùng lớn có thể đi lọt an toàn qua cổng hay không?",
        "en": "A grand entrance arch is shaped like a parabola. Can a large container truck pass safely through the arch?"
      },
      "checkpoint": "Nhận diện dạng hình học thực tế: đường cong cong parabol của cổng và khối hộp của xe tải."
    },
    {
      "sceneNumber": 2,
      "type": "given_facts",
      "title": { "vi": "Dữ kiện thực tế", "en": "Given Facts & Dimensions" },
      "visualDescription": "Mô hình 2D cổng parabol gắn số đo: bề rộng chân cổng AB = 8m, chiều cao đỉnh vòm H = 6m. Xe tải rộng 4m đi giữa tim đường.",
      "voiceover": {
        "vi": "Cổng vòm rộng 8m ở chân và cao 6m ở đỉnh. Xe tải rộng 4m và cao 4,2m chạy chính giữa cổng.",
        "en": "The arch is 8m wide at its base and 6m high at its vertex. A truck 4m wide and 4.2m high drives right down the center."
      },
      "checkpoint": "Xác định rõ các số đo: Chiều rộng đáy 8m, Chiều cao đỉnh 6m, Bề rộng xe 4m, Chiều cao xe 4.2m."
    },
    {
      "sceneNumber": 3,
      "type": "problem_vocabulary",
      "title": { "vi": "Vấn đề & Từ vựng Math English", "en": "Problem & Math English Vocabulary" },
      "visualDescription": "Hệ trục Oxy với gốc O đặt tại mặt đất. Bảng từ vựng Math English xuất hiện bên cạnh đồ thị parabol.",
      "voiceover": {
        "vi": "Hãy lập phương trình Parabol y = ax² + bx + c để tính chiều cao của cổng tại vị trí mép xe tải!",
        "en": "Let's establish the parabola equation y = ax² + bx + c to determine the arch height at the truck outer edges!"
      },
      "checkpoint": "Nắm vững mục tiêu: Lập hàm bậc hai để tính chiều cao trần cổng tại vị trí x = 2m."
    },
    {
      "sceneNumber": 4,
      "type": "modeling_guidance",
      "title": { "vi": "Gợi mở tư duy mô hình hóa", "en": "Mathematical Modeling Guidance" },
      "visualDescription": "Đặt gốc O tại trung điểm chân cổng: Đỉnh S(0, 6), hai chân A(-4, 0) và B(4, 0). Do tính đối xứng qua Oy, hàm số có dạng y = ax² + 6. Thay x = 4, y = 0 để tìm a = -3/8.",
      "voiceover": {
        "vi": "Gợi ý: Chọn hệ trục Oxy với đỉnh S(0; 6) và chân cổng B(4; 0). Từ đó suy ra phương trình y = -3/8 x² + 6.",
        "en": "Hint: Choose the coordinate system with vertex S(0, 6) and ground base B(4, 0). Hence, the equation is y = -3/8 x² + 6."
      },
      "checkpoint": "Hướng dẫn cách đặt hệ tọa độ đối xứng để triệt tiêu hệ số b = 0, đơn giản hóa phương trình."
    },
    {
      "sceneNumber": 5,
      "type": "practice",
      "title": { "vi": "Thực hành tính toán", "en": "Practice & Worksheet" },
      "visualDescription": "Hình vẽ xe tải rộng 4m (mép xe tại x = 2m). Mũi tên chỉ chiều cao y(2) kèm nút mở phiếu học tập.",
      "voiceover": {
        "vi": "Bây giờ, hãy tính chiều cao trần cổng tại x = 2m và kết luận xe tải cao 4,2m có đi lọt hay không!",
        "en": "Now, compute the arch height at x = 2m and determine if the 4.2m high truck can safely clear the gate!"
      },
      "checkpoint": "Chuyển tiếp học sinh sang làm phiếu bài tập tương tác."
    }
  ]
}
```

#### 3. Các bước mô hình hóa toán học & Lời giải chuẩn
- **Bước 1: Chọn hệ trục tọa độ $Oxy$ phù hợp**
  - Đặt gốc tọa độ $O$ tại trung điểm đoạn nối hai chân cổng trên mặt đất.
  - Trục hoành $Ox$ nằm ngang dọc theo mặt đất.
  - Trục tung $Oy$ thẳng đứng hướng lên, đi qua đỉnh cao nhất của cổng vòm.
  - Do khoảng cách hai chân cổng là $8\text{ m}$ nên toạ độ hai điểm tiếp đất là $A(-4, 0)$ và $B(4, 0)$.
  - Chiều cao đỉnh cổng là $6\text{ m}$ nên đỉnh parabol là $S(0, 6)$.
- **Bước 2: Thiết lập phương trình hàm số bậc hai**
  Parabol có trục đối xứng là $Oy$ ($x = 0$) nên hệ số $b = 0$. Phương trình có dạng:
  $$y = ax^2 + c$$
  Vì parabol đi qua đỉnh $S(0, 6) \implies c = 6$.
  Do đó: $y = ax^2 + 6$.
  Parabol đi qua điểm tiếp đất $B(4, 0)$:
  $$0 = a \cdot 4^2 + 6 \implies 16a = -6 \implies a = -\frac{6}{16} = -\frac{3}{8} = -0.375$$
  Vậy hàm số mô tả đường viền cổng vòm là:
  $$y = -\frac{3}{8}x^2 + 6 \quad (\text{với } -4 \le x \le 4)$$
- **Bước 3: Xác định chiều cao trần cổng tại mép xe tải**
  - Chiếc xe tải rộng $4\text{ m}$ di chuyển chính giữa cổng vòm $\implies$ thân xe trải từ hoành độ $x = -2$ đến $x = 2$ (mép ngoài cùng bên phải của xe tương ứng $x = 2\text{ m}$).
  - Thay $x = 2$ vào phương trình parabol:
    $$y(2) = -\frac{3}{8} \cdot (2)^2 + 6 = -\frac{3}{8} \cdot 4 + 6 = -\frac{3}{2} + 6 = -1.5 + 6 = 4.5\text{ m}$$
- **Bước 4: Đánh giá điều kiện an toàn thực tế**
  - Chiều cao của trần cổng vòm tại mép xe là $4.5\text{ m}$.
  - Xe tải có chiều cao $h_0 = 4.2\text{ m}$.
  - So sánh: $4.2\text{ m} < 4.5\text{ m}$.
  - Khoảng trống an toàn (clearance margin): $\Delta h = 4.5 - 4.2 = 0.3\text{ m} = 30\text{ cm}$.
  - **Kết luận thực tế**: Xe tải hoàn toàn có thể đi qua cổng vòm an toàn với khoảng hở phía trên đạt $30\text{ cm}$.

#### 4. Danh mục từ vựng Math English (CLIL Vocabulary)
| Thuật ngữ (Term) | Phiên âm IPA | Từ loại | Định nghĩa Tiếng Việt | English Definition |
|---|---|---|---|---|
| **Parabolic arch** | /ˌpær.əˈbɒl.ɪk ɑːtʃ/ | noun phrase | Cổng vòm parabol (kết cấu vòm cong có dạng hình học parabol) | An architectural arch structured in the geometric shape of a parabola. |
| **Quadratic function** | /kwɒdˈræt.ɪk ˈfʌŋk.ʃən/ | noun phrase | Hàm số bậc hai (hàm số dạng $y = ax^2 + bx + c$, $a \neq 0$) | A polynomial function of degree two, represented by $f(x) = ax^2 + bx + c$ ($a \ne 0$). |
| **Vertex** | /ˈvɜː.teks/ | noun | Đỉnh của parabol (điểm cực đại hoặc cực tiểu của đồ thị) | The highest or lowest point of a parabola, with coordinates $(-\frac{b}{2a}, -\frac{\Delta}{4a})$. |
| **Axis of symmetry** | /ˈæk.sɪs əv ˈsɪm.ə.tri/ | noun phrase | Trục đối xứng (đường thẳng chia đôi parabol thành hai phần đối xứng) | A vertical line that divides a parabola into two congruent mirror images ($x = -\frac{b}{2a}$). |
| **Clearance height** | /ˈklɪə.rəns haɪt/ | noun phrase | Chiều cao tĩnh không / Khoảng hở an toàn (khoảng cách trống cho phép phương tiện lọt qua) | The vertical space available for a vehicle or object to pass underneath without collision. |
| **Span** | /spæn/ | noun | Nhịp vòm / Bề rộng chân vòm (khoảng cách giữa hai điểm đỡ đáy) | The full extent or distance between the two supporting bases of an arch. |
| **Y-intercept** | /ˈwaɪ ˌɪn.tə.sept/ | noun | Tung độ gốc (giao điểm của đồ thị với trục tung $Oy$) | The point where a graph intersects the y-axis (where $x = 0$). |

#### 5. Bộ câu hỏi tương tác (Interactive Quiz / Worksheet)
1. **Câu 1 (Chọn hệ tọa độ)**: Khi đặt gốc tọa độ $O$ tại chân cổng bên trái $A$, đỉnh vòm có tọa độ là $(4, 6)$ và chân phải $B$ là $(8, 0)$. Hệ số $a$ của parabol $y = ax^2 + bx$ trong cách đặt này so với hệ số $a$ khi đặt gốc $O$ tại trung điểm đáy có thay đổi không?  
   - *A*. Có, hệ số $a$ sẽ bị đảo dấu thành dương.  
   - *B*. Không thay đổi, hệ số $a$ vẫn bằng $-\frac{3}{8}$ vì độ mở và chiều cong của parabol không đổi. *(Đáp án đúng)*  
   - *C*. Có, hệ số $a$ tăng gấp đôi.  
   - *D*. Không xác định được.  
2. **Câu 2 (Mô hình hóa)**: Với cách đặt gốc $O$ tại trung điểm hai chân cổng, hệ số $a$ của phương trình $y = ax^2 + 6$ đi qua điểm $(4, 0)$ là:  
   - *A*. $a = -\frac{3}{4}$  
   - *B*. $a = -\frac{3}{8}$ *(Đáp án đúng: $16a + 6 = 0 \implies a = -0.375$)*  
   - *C*. $a = \frac{3}{8}$  
   - *D*. $a = -\frac{1}{2}$  
3. **Câu 3 (Tính toán)**: Chiều cao của cổng vòm tại mép ngoài cùng của xe tải ($x = 2\text{ m}$) là:  
   - *A*. $4.0\text{ m}$  
   - *B*. $4.5\text{ m}$ *(Đáp án đúng: $y(2) = -\frac{3}{8}(4) + 6 = 4.5\text{ m}$)*  
   - *C*. $5.0\text{ m}$  
   - *D*. $4.2\text{ m}$  
4. **Câu 4 (Diễn giải thực tế)**: Xe tải cao $4.2\text{ m}$ có đi qua cổng an toàn hay không và khoảng hở an toàn là bao nhiêu?  
   - *A*. Không đi qua được vì xe bị va chạm ở nóc.  
   - *B*. Đi qua được, khoảng trống an toàn là $30\text{ cm}$ ($0.3\text{ m}$). *(Đáp án đúng)*  
   - *C*. Đi qua được, khoảng trống an toàn là $50\text{ cm}$.  
   - *D*. Không đi qua được vì cổng chỉ cao $4.5\text{ m}$ ở đỉnh.  
5. **Câu 5 (Math English)**: Which term denotes the highest point of an arch or parabola?  
   - *A*. Span  
   - *B*. Axis of symmetry  
   - *C*. Vertex *(Đáp án đúng)*  
   - *D*. Origin  

---

### BÀI TOÁN 3: TỐI ƯU HÓA DOANH THU XE BUÝT DU LỊCH CHỢ LÁCH (ỨNG DỤNG BẤT ĐẲNG THỨC & CỰC TRỊ BẬC HAI)
*Chủ đề: Bất phương trình & Cực trị hàm số bậc hai — Lớp 10 (Đại số & Kinh tế học STEM)*  
*Nguồn gốc: Bài toán tối ưu doanh thu trong danh mục đề tài KHKT (Mục 1.3, 3.1 & Bối cảnh địa phương Chợ Lách - Vĩnh Long)*

#### 1. Dữ liệu thực nghiệm & Thông số chính xác
- **Bối cảnh**: Hợp tác xã Vận tải Du lịch Chợ Lách (Vĩnh Long) khai thác tuyến xe buýt du lịch sinh thái miệt vườn đón khách từ bến xe đến các vườn cây ăn trái Cái Mơn.
- **Dữ kiện đo đạc & Khảo sát thị trường**:
  - Mức giá vé hiện hành: $P_0 = 200{,}000\text{ VNĐ/vé}$.
  - Với mức giá này, trung bình mỗi chuyến xe phục vụ $Q_0 = 60\text{ hành khách}$.
  - Khảo sát thị trường cho thấy: **Cứ mỗi lần giảm giá vé $10{,}000\text{ VNĐ}$ thì số lượng khách đăng ký trên mỗi chuyến xe tăng thêm $5\text{ hành khách}$**.
  - Sức chứa tối đa của mỗi chuyến xe (công suất trần) là $100\text{ hành khách}$.
- **Mục tiêu**:
  1. Lập hàm số biểu diễn tổng doanh thu mỗi chuyến xe theo số lần giảm giá.
  2. Xác định công ty nên giảm giá vé bao nhiêu lần (hoặc định giá vé là bao nhiêu) để doanh thu của mỗi chuyến xe đạt giá trị cực đại?
  3. Tính doanh thu tối đa đạt được và mức tăng doanh thu so với mức ban đầu.

#### 2. Kịch bản phân cảnh 5 màn song ngữ chi tiết

```json
{
  "id": "lesson-3-optimization-revenue",
  "title": {
    "vi": "Tối ưu hóa doanh thu tuyến xe buýt du lịch Chợ Lách",
    "en": "Maximizing Tourism Bus Revenue in Cho Lach"
  },
  "topic": "Quadratic Function Optimization & Extremum",
  "scenes": [
    {
      "sceneNumber": 1,
      "type": "context",
      "title": { "vi": "Mở đầu bối cảnh", "en": "Context Introduction" },
      "visualDescription": "Toàn cảnh đoàn xe du lịch xanh thân thiện môi trường đón khách tham quan miệt vườn Chợ Lách (Vĩnh Long). Khung cảnh bến xe tấp nập du khách.",
      "voiceover": {
        "vi": "Một nhà xe du lịch muốn giảm giá vé để thu hút thêm hành khách. Làm thế nào để định giá vé sao cho tổng doanh thu thu về là lớn nhất?",
        "en": "A tourism bus operator wants to discount ticket prices to attract more travelers. How should they price tickets to maximize total revenue?"
      },
      "checkpoint": "Nhận thức bài toán thực tế: Sự đánh đổi giữa giảm đơn giá vé và tăng số lượng hành khách."
    },
    {
      "sceneNumber": 2,
      "type": "given_facts",
      "title": { "vi": "Dữ kiện thực tế", "en": "Given Facts & Pricing Data" },
      "visualDescription": "Bảng tương quan số liệu: Giá gốc 200.000 VNĐ -> 60 khách. Quy luật giảm giá: Cứ giảm 10.000 VNĐ thì tăng 5 khách.",
      "voiceover": {
        "vi": "Hiện tại giá vé là 200.000 đồng ứng với 60 khách. Cứ giảm 10.000 đồng mỗi vé thì số khách lại tăng thêm 5 người.",
        "en": "Currently, tickets cost 200,000 VND with 60 passengers. Each 10,000 VND discount attracts 5 additional travelers."
      },
      "checkpoint": "Nắm vững các thông số: P0 = 200.000, Q0 = 60, bước giảm delta P = 10.000, bước tăng delta Q = 5."
    },
    {
      "sceneNumber": 3,
      "type": "problem_vocabulary",
      "title": { "vi": "Vấn đề & Từ vựng Math English", "en": "Problem & Math English Vocabulary" },
      "visualDescription": "Công thức kinh tế cơ bản Doanh thu = Đơn giá x Lượng khách. Bảng từ vựng Math English xuất hiện nổi bật.",
      "voiceover": {
        "vi": "Hãy xây dựng hàm số bậc hai R(x) biểu diễn Doanh thu theo số lần giảm giá x, và tìm điểm cực đại của hàm số!",
        "en": "Formulate the quadratic revenue function R(x) in terms of discount steps x, and find its maximum value!"
      },
      "checkpoint": "Hiểu công thức cốt lõi: R(x) = P(x) * Q(x) và mục tiêu tìm cực trị bậc hai."
    },
    {
      "sceneNumber": 4,
      "type": "modeling_guidance",
      "title": { "vi": "Gợi mở tư duy mô hình hóa", "en": "Mathematical Modeling Guidance" },
      "visualDescription": "Biểu thức: P(x) = 200.000 - 10.000x; Q(x) = 60 + 5x. Nhân đa thức R(x) = -50.000x² + 400.000x + 12.000.000. Parabol có hệ số a < 0 đạt cực đại tại x = -b / (2a).",
      "voiceover": {
        "vi": "Gợi ý: Hàm doanh thu R(x) là tam thức bậc hai có hệ số a = -50.000 âm, nên đạt giá trị lớn nhất tại đỉnh x = -b / (2a).",
        "en": "Hint: The revenue function R(x) is a quadratic with negative leading coefficient a = -50,000, peaking at vertex x = -b / (2a)."
      },
      "checkpoint": "Hướng dẫn học sinh tìm tọa độ đỉnh của parabol bằng công thức lớp 10."
    },
    {
      "sceneNumber": 5,
      "type": "practice",
      "title": { "vi": "Thực hành tính toán", "en": "Practice & Worksheet" },
      "visualDescription": "Màn hình hiển thị đỉnh x = 4. Nút bấm mời học sinh tính mức giá vé tối ưu và doanh thu tối đa trong phiếu học tập.",
      "voiceover": {
        "vi": "Bây giờ, hãy mở phiếu học tập, tính giá vé tối ưu và tổng doanh thu cực đại của chuyến xe nhé!",
        "en": "Now, open your worksheet, compute the optimal ticket price and maximum bus revenue!"
      },
      "checkpoint": "Chuyển tiếp học sinh sang làm phiếu bài tập tương tác."
    }
  ]
}
```

#### 3. Các bước mô hình hóa toán học & Lời giải chuẩn
- **Bước 1: Chọn ẩn số và xác định điều kiện bài toán**
  - Gọi $x$ là số lần giảm giá vé ($x \in \mathbb{R}$, thực tế là số tự nhiên hoặc số thực không âm $x \ge 0$).
  - Để giá vé luôn dương: $200{,}000 - 10{,}000x > 0 \implies x < 20$.
  - Để số lượng khách không vượt quá sức chứa xe ($100$ khách): $60 + 5x \le 100 \implies 5x \le 40 \implies x \le 8$.
  - Do đó điều kiện xác định chặt chẽ là: $0 \le x \le 8$.
- **Bước 2: Thiết lập hàm số Doanh thu**
  - Hàm giá vé sau khi giảm:
    $$P(x) = 200{,}000 - 10{,}000x \quad (\text{VNĐ/vé})$$
  - Hàm số lượng khách:
    $$Q(x) = 60 + 5x \quad (\text{người})$$
  - Hàm tổng doanh thu $R(x)$ (Revenue):
    $$R(x) = P(x) \cdot Q(x) = (200{,}000 - 10{,}000x)(60 + 5x)$$
    Đặt nhân tử chung ra ngoài để tính toán gọn gàng:
    $$R(x) = 10{,}000 \cdot 5 \cdot (20 - x)(12 + x) = 50{,}000 \cdot (240 + 8x - x^2)$$
    $$R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000 \quad (\text{VNĐ})$$
- **Bước 3: Tìm điểm cực trị bằng tính chất hàm số bậc hai (Toán 10)**
  - Hàm số $R(x)$ là tam thức bậc hai với các hệ số:
    $$a = -50{,}000 < 0, \quad b = 400{,}000, \quad c = 12{,}000{,}000$$
  - Vì $a = -50{,}000 < 0$, đồ thị của $R(x)$ là một parabol có bề lõm quay xuống dưới $\implies$ hàm số đạt giá trị lớn nhất tại đỉnh:
    $$x_V = -\frac{b}{2a} = -\frac{400{,}000}{2 \cdot (-50{,}000)} = \frac{400{,}000}{100{,}000} = 4$$
  - Kiểm tra điều kiện: $x = 4$ thỏa mãn $0 \le x \le 8$.
- **Bước 4: Tính các đại lượng tối ưu và đánh giá thực tế**
  - Số lần giảm giá tối ưu: $x = 4$ lần.
  - Mức giá vé tối ưu:
    $$P(4) = 200{,}000 - 10{,}000 \cdot 4 = 160{,}000\text{ VNĐ/vé}$$
  - Số lượng khách tương ứng:
    $$Q(4) = 60 + 5 \cdot 4 = 80\text{ khách}$$ (thỏa mãn sức chứa $\le 100$).
  - Doanh thu tối đa đạt được:
    $$R(4) = 160{,}000 \times 80 = 12{,}800{,}000\text{ VNĐ}$$
  - So sánh với doanh thu ban đầu:
    $$R_0 = 200{,}000 \times 60 = 12{,}000{,}000\text{ VNĐ}$$
    $$\Delta R = 12{,}800{,}000 - 12{,}000{,}000 = +800{,}000\text{ VNĐ} \quad (+6.67\%)$$
  - *(Cách giải mở rộng theo Bất đẳng thức Cauchy / AM-GM)*:
    $$(20 - x) + (12 + x) = 32 \text{ (không đổi)}$$
    $$\implies (20 - x)(12 + x) \le \left(\frac{(20 - x) + (12 + x)}{2}\right)^2 = 16^2 = 256$$
    Đẳng thức xảy ra khi và chỉ khi $20 - x = 12 + x \iff 2x = 8 \iff x = 4$.  
    $R_{\max} = 50{,}000 \times 256 = 12{,}800{,}000\text{ VNĐ}$.

#### 4. Danh mục từ vựng Math English (CLIL Vocabulary)
| Thuật ngữ (Term) | Phiên âm IPA | Từ loại | Định nghĩa Tiếng Việt | English Definition |
|---|---|---|---|---|
| **Revenue** | /ˈrev.ən.juː/ | noun | Doanh thu (tổng số tiền thu được từ bán vé/dịch vụ trước khi trừ chi phí) | The total amount of income generated by the sale of goods or services. |
| **Unit price / Ticket fare** | /ˈjuː.nɪt praɪs/ | noun phrase | Đơn giá / Giá vé (số tiền cho một vé/đơn vị sản phẩm) | The cost associated with a single ticket or unit of product. |
| **Demand** | /dɪˈmɑːnd/ | noun | Cầu / Lượng khách hàng (số người có nhu cầu và khả năng mua) | The quantity of a service or commodity that consumers are willing and able to purchase. |
| **Optimization** | /ˌɒp.tɪ.maɪˈzeɪ.ʃən/ | noun | Tối ưu hóa (quá trình tìm giá trị lớn nhất hoặc nhỏ nhất của một đại lượng) | The mathematical process of finding the maximum or minimum value of a function. |
| **Maximum value** | /ˈmæk.sɪ.məm ˈvæl.juː/ | noun phrase | Giá trị cực đại / Giá trị lớn nhất (đỉnh cao nhất của hàm số trong miền xét) | The greatest value that a function attains within a given domain. |
| **Domain constraint** | /dəʊˈmeɪn kənˈstreɪnt/ | noun phrase | Ràng buộc miền xác định (điều kiện biên giới hạn giá trị của biến số) | A condition that restricts the allowable values of the independent variable in a real context. |
| **Trade-off** | /ˈtreɪd.ɒf/ | noun | Sự đánh đổi (mối quan hệ đánh đổi: giảm giá để đổi lấy tăng sản lượng) | A situational decision that involves diminishing or losing one quality in return for gaining another. |

#### 5. Bộ câu hỏi tương tác (Interactive Quiz / Worksheet)
1. **Câu 1 (Xác định biến số)**: Nếu gọi $x$ là số lần giảm giá vé ($10{,}000$ VNĐ/lần), biểu thức nào sau đây mô tả đúng lượng hành khách $Q(x)$ trên mỗi chuyến xe?  
   - *A*. $Q(x) = 60 - 5x$  
   - *B*. $Q(x) = 60 + 5x$ *(Đáp án đúng: mỗi lần giảm giá vé lại tăng 5 khách)*  
   - *C*. $Q(x) = 60 \cdot 5x$  
   - *D*. $Q(x) = 200{,}000 + 5x$  
2. **Câu 2 (Mô hình hóa)**: Hàm số tổng doanh thu $R(x)$ có hệ số $a$ bằng bao nhiêu?  
   - *A*. $a = 50{,}000$  
   - *B*. $a = -50{,}000$ *(Đáp án đúng: $R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000$)*  
   - *C*. $a = -10{,}000$  
   - *D*. $a = 400{,}000$  
3. **Câu 3 (Tính toán tối ưu)**: Nhà xe nên định giá vé mới là bao nhiêu để doanh thu đạt cực đại?  
   - *A*. $180{,}000\text{ VNĐ}$  
   - *B*. $160{,}000\text{ VNĐ}$ *(Đáp án đúng: $x = 4 \implies P(4) = 200{,}000 - 40{,}000 = 160{,}000\text{ VNĐ}$)*  
   - *C*. $150{,}000\text{ VNĐ}$  
   - *D*. $140{,}000\text{ VNĐ}$  
4. **Câu 4 (Đánh giá kinh tế)**: Doanh thu tối đa của chuyến xe đạt được là bao nhiêu và tăng bao nhiêu so với ban đầu?  
   - *A*. $12.500.000\text{ VNĐ}$ (tăng $500.000\text{ VNĐ}$)  
   - *B*. $12.800.000\text{ VNĐ}$ (tăng $800.000\text{ VNĐ}$) *(Đáp án đúng: $160{,}000 \times 80 = 12{,}800{,}000\text{ VNĐ}$)*  
   - *C*. $13.000.000\text{ VNĐ}$ (tăng $1.000.000\text{ VNĐ}$)  
   - *D*. $14.200.000\text{ VNĐ}$ (tăng $2.200.000\text{ VNĐ}$)  
5. **Câu 5 (Math English)**: In financial mathematics, which term represents the total income before subtracting any costs?  
   - *A*. Profit  
   - *B*. Cost  
   - *C*. Revenue *(Đáp án đúng)*  
   - *D*. Margin  

---

## 5. BẢNG TIÊU CHÍ KIỂM CHỨNG 2 LỚP ĐỘC LẬP (DUAL-LAYER VERIFICATION MATRIX)

Để hiện thực hóa yêu cầu của Báo cáo KHKT (Mục 3.3, Bảng kiểm chất lượng 6 tiêu chí) thành công cụ kiểm định phần mềm trực quan trên Web App, hệ thống chia thành 2 lớp kiểm tra độc lập bắt buộc:

```
                      [ BÀI HỌC MỚI BIÊN SOẠN ]
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
      [ LỚP 1: TOÁN HỌC ]                 [ LỚP 2: NGÔN NGỮ TIẾNG ANH ]
      - Nhất quán dữ kiện & Đơn vị        - Chuẩn thuật ngữ Math EN
      - Quan hệ hình học / Đại số         - Phiên âm quốc tế IPA
      - Điều kiện biên & Khả thi          - Khớp ngữ nghĩa song ngữ
      - Chứng minh công thức              - Chất lượng phát âm & Giọng đọc
      - Độ chính xác số học / Sai số      - Đồng bộ phụ đề & Trực quan
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                 [ TỔNG HỢP KIỂM CHỨNG (100% PASS) ]
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
            [ ĐỦ ĐIỀU KIỆN ]               [ BỊ KHÓA XUẤT BẢN ]
            Cho phép xuất bản             Báo lỗi chi tiết tại tiêu
            ra bộ sưu tập bài học         chí chưa đạt để tác giả sửa
```

### 5.1. Bảng đặc tả chi tiết 10 tiêu chí kiểm chứng (Checklist Criteria Specification)

| Mã tiêu chí | Nhóm lớp | Tên tiêu chí kiểm định | Tiêu chuẩn đánh giá chi tiết (Specification) | Mức độ bắt buộc | Phương thức kiểm tra trên Web App |
|---|---|---|---|---|---|
| **V1.1** | **Lớp 1: Toán học** | **Nhất quán dữ kiện & Đơn vị đo** | 100% số liệu (độ dài, góc, số tiền, tỉ lệ) giữa văn bản đề, sơ đồ trực quan và lời thoại phải trùng khớp tuyệt đối. Đơn vị đo lường (m, độ, VNĐ, km/h) đồng nhất. | **Bắt buộc (100%)** | Auto-checker quét regex số liệu đối chiếu văn bản và kịch bản; chuyên gia duyệt thủ công. |
| **V1.2** | **Lớp 1: Toán học** | **Tính đúng đắn quan hệ hình học / giải tích** | Các quan hệ toán học (vuông góc, thẳng hàng, góc ngoài tam giác, đỉnh parabol, trục đối xứng) phải chính xác trên sơ đồ biểu diễn, không vẽ lệch sai bản chất. | **Bắt buộc (100%)** | Kiểm tra logic hình học; vẽ đồ thị/sơ đồ động theo tọa độ thực. |
| **V1.3** | **Lớp 1: Toán học** | **Điều kiện biên & Tính khả thi thực tế** | Các ẩn số phải thỏa mãn tập xác định toán học và thực tế (vd: $x > 0$, góc nhọn $0^\circ < \alpha < 90^\circ$, giá vé không âm, số khách $\le$ sức chứa xe). | **Bắt buộc (100%)** | Solver xác thực miền giá trị $[x_{\min}, x_{\max}]$ và điều kiện bài toán. |
| **V1.4** | **Lớp 1: Toán học** | **Tính chính xác của công thức mô hình hóa** | Công thức mô hình hóa (Định lý Sin, hàm bậc hai $y = ax^2+bx+c$, hàm doanh thu $R(x)=P(x)Q(x)$) được chứng minh chặt chẽ theo SGK Toán 10. | **Bắt buộc (100%)** | Math Engine kiểm chứng công thức giải tích; đối chiếu lời giải mẫu. |
| **V1.5** | **Lớp 1: Toán học** | **Độ chính xác tính toán & Dung sai làm tròn** | Đáp án số học chính xác tuyệt đối hoặc có khoảng dung sai làm tròn quy định rõ (vd: $\pm 0.1\text{ m}$ hoặc $\pm 1$ đơn vị thập phân). | **Bắt buộc (100%)** | Auto-calculation đối chiếu kết quả giữa các phương pháp giải (vd: Sin vs Cotang). |
| **V2.1** | **Lớp 2: Ngôn ngữ** | **Chuẩn hóa thuật ngữ Math English** | Sử dụng đúng thuật ngữ chuẩn quốc tế (vd: "Angle of elevation" không dùng "upward angle", "Vertex" không dùng "top point", "Law of Sines" thay vì dịch máy thô). | **Bắt buộc (100%)** | Dictionary Lookup đối chiếu với Từ điển Math English chuẩn tích hợp sẵn trong App. |
| **V2.2** | **Lớp 2: Ngôn ngữ** | **Chuẩn xác phiên âm quốc tế (IPA)** | 100% từ vựng trong bảng từ phải có phiên âm IPA chuẩn Anh - Mỹ hoặc Anh - Anh, định dạng giữa hai dấu gạch chéo `/.../`. | **Bắt buộc (100%)** | IPA Validator kiểm tra ký tự phiên âm quốc tế. |
| **V2.3** | **Lớp 2: Ngôn ngữ** | **Khớp ngữ nghĩa song ngữ (Bilingual Alignment)** | Câu thoại tiếng Anh và tiếng Việt tương đương về ngữ nghĩa, đúng văn phong sư phạm toán học, không dịch vụng word-by-word. | **Bắt buộc (100%)** | Đối chiếu song ngữ trực quan (Side-by-side verification); Chuyên gia ngoại ngữ ký duyệt. |
| **V2.4** | **Lớp 2: Ngôn ngữ** | **Chất lượng phát âm AI & Tốc độ đọc** | Giọng đọc AI tự nhiên, rõ ràng, chuẩn ngữ điệu bản ngữ, tốc độ thoại chuẩn từ 120 - 140 từ/phút (WPM), phát âm chuẩn âm cuối (/s/, /t/, /θ/). | **Bắt buộc (100%)** | Audio Player cho phép nghe thử từng câu thoại; Web Speech API kiểm tra phát âm. |
| **V2.5** | **Lớp 2: Ngôn ngữ** | **Đồng bộ phụ đề & Không gây nhiễu thị giác** | Phụ đề song ngữ hiển thị rõ ràng (font chữ tương phản cao, phân biệt màu VN - EN), không che khuất sơ đồ hình vẽ hoặc ký hiệu toán học (theo nguyên lý Mayer). | **Bắt buộc (100%)** | Preview trực tiếp trên giao diện trình phát; kiểm tra tương phản WCAG AA. |

### 5.2. Cơ chế khóa và Lưu vết kiểm định (Audit Trail)
- **Cơ chế Khóa xuất bản (Publish Blocker)**: Một bài học mới soạn thảo chỉ chuyển từ trạng thái `DRAFT` sang `PUBLISHED` khi **toàn bộ 10 tiêu chí trên đều nhận trạng thái "ĐẠT" (Pass)**. Nếu có bất kỳ tiêu chí nào "CHƯA ĐẠT" (Fail), hệ thống hiển thị bảng cảnh báo đỏ và chặn xuất bản.
- **Lưu vết minh bạch (AI Prompt & Audit History)**: Hệ thống ghi nhận tên kiểm định viên, ngày giờ duyệt, và lịch sử Prompt AI tạo học liệu tuân thủ đúng Quy chế Cuộc thi NCKHKT (Thông tư 84/2026/TT-BGDĐT).

---

## 6. ĐẶC TẢ PHÂN HỆ PHIẾU HỌC TẬP TƯƠNG TÁC (WORKSHEET / QUIZ) & PHẢN HỒI

### 6.1. Ba phân nhóm câu hỏi bắt buộc cho mỗi bài học
Mỗi bài học số hóa phải có Phiếu học tập tương tác bao phủ trọn vẹn 3 khía cạnh năng lực:
1. **Khía cạnh 1: Đọc hiểu và Trích xuất dữ kiện thực tế (Reading & Data Extraction)**
   - Dạng câu hỏi: Trắc nghiệm khách quan 4 lựa chọn (MCQ) hoặc Ghép nối dữ kiện.
   - Mục tiêu: Kiểm tra xem học sinh có nhận diện đúng giả thiết, đại lượng thực tế và điều kiện biên bài toán hay không.
2. **Khía cạnh 2: Các bước lập mô hình toán học (Mathematical Modeling Stages)**
   - Dạng câu hỏi: Chọn công thức đúng, sắp xếp các bước mô hình hóa theo chu trình Blum & Leiß, điền số tính toán trung gian.
   - Mục tiêu: Rèn luyện tư duy toán học hóa: đặt ẩn, liên hệ quan hệ hình học/hàm số, thiết lập phương trình.
3. **Khía cạnh 3: Năng lực tiếng Anh chuyên ngành (Math English Acquisition)**
   - Dạng câu hỏi: Nối thuật ngữ với định nghĩa, điền từ vào chỗ trống trong câu toán tiếng Anh, nhận diện từ vựng qua âm thanh (Audio listening).
   - Mục tiêu: Củng cố khả năng hiểu và sử dụng thuật ngữ tiếng Anh toán học trong ngữ cảnh.

### 6.2. Cơ chế chấm điểm và Phản hồi tức thì đa tầng (Immediate Scaffolded Feedback)
- **Tự động chấm điểm (Instant Auto-Grading)**:
  - Khi học sinh bấm "Kiểm tra / Check" hoặc nộp bài, hệ thống hiển thị ngay điểm số tổng và trạng thái đúng/sai từng câu.
  - Sử dụng mã màu chuẩn sư phạm: Xanh lá (Đúng - Correct), Đỏ cam (Chưa đúng - Incorrect).
- **Phản hồi khi học sinh làm ĐÚNG**:
  - Lời khen ngợi động viên (Bilingual praise: *"Chính xác! / Excellent!"*).
  - Tóm tắt logic cốt lõi giải thích vì sao phương án đó đúng.
  - Nhắc lại thuật ngữ tiếng Anh kèm biểu tượng loa nghe lại phát âm.
- **Phản hồi khi học sinh làm SAI (Cơ chế gợi ý phân tầng - Scaffolded Hints)**:
  - **Tầng 1 (Gợi ý định hướng - Conceptual Hint)**: Nhắc học sinh xem lại phân cảnh tương ứng trong video (vd: *"Hãy xem lại Phân cảnh 3: Tam giác ABD và Định lý Sin"*).
  - **Tầng 2 (Phân tích lỗi sai điển hình - Misconception Analysis)**: Giải thích vì sao đáp án học sinh vừa chọn là nhầm lẫn (vd: *"Bạn đã nhầm góc ngoài $63^\circ$ với góc trong tam giác. Hãy nhớ $\widehat{ADB} = 63^\circ - 42^\circ = 21^\circ$"*).
  - **Tầng 3 (Lời giải chi tiết - Step-by-step Solution)**: Hiển thị đầy đủ các bước tính toán và đáp án chính xác để học sinh tự đối chiếu học tập.
- **Thử lại không giới hạn (Mastery Learning)**: Cho phép học sinh làm lại để đạt điểm tối đa $10/10$.

### 6.3. Khung Rubric đánh giá năng lực học sinh (Thang điểm 10)
Trích xuất từ Báo cáo KHKT (Bảng 1 & Bảng 4):
- **Tiêu chí 1: Đọc hiểu tình huống (2.5 điểm)**: Trích xuất đúng 100% dữ kiện, xác định đúng điều kiện biên và biến số bài toán.
- **Tiêu chí 2: Lập mô hình toán học (3.5 điểm)**: Thiết lập đúng phương trình/hàm số/hệ thức lượng, diễn giải các bước trung gian logic.
- **Tiêu chí 3: Tính toán & Diễn giải kết quả thực tế (2.0 điểm)**: Tính toán chính xác số học, đối chiếu điều kiện an toàn/thực tế, kết luận rõ ràng.
- **Tiêu chí 4: Thuật ngữ Tiếng Anh Toán (2.0 điểm)**: Nhận biết, phát âm và sử dụng chính xác từ vựng chuyên ngành trong bài tập.

### 6.4. Mẫu Phiếu khảo sát phản hồi học sinh (Likert 5 mức độ trích từ Phụ lục KHKT)
Hệ thống tích hợp form phản hồi học sinh sau mỗi bài học với 6 phát biểu chuẩn hóa:
1. *Video AI giúp em dễ dàng hình dung bối cảnh thực tế của bài toán. (The AI video helps me easily visualize the real-world context.)*
2. *Sau khi xem video, em xác định đúng các dữ kiện và ẩn số cần tìm. (After watching, I correctly identify given data and variables.)*
3. *Thuật ngữ tiếng Anh Toán trong video dễ hiểu và bổ ích. (The Math English terminology in the video is clear and useful.)*
4. *Các câu hỏi gợi mở giúp em tự lập được phương trình/mô hình toán. (Guided questions help me formulate the mathematical model myself.)*
5. *Âm thanh giọng đọc AI và phụ đề song ngữ rõ ràng, chuẩn xác. (The AI voiceover and bilingual subtitles are clear and accurate.)*
6. *Video không chứa chi tiết gây nhiễu làm em hiểu sai bài toán. (The video contains no distracting details causing misunderstanding.)*
Thang đo: $1 =$ Hoàn toàn không đồng ý $\to 5 =$ Hoàn toàn đồng ý.

---

## 7. DANH MỤC TÍNH NĂNG ĐƯỢC PHÁT HIỆN (FEATURES DISCOVERED)

Theo yêu cầu chuẩn của Specification Miner, bảng dưới đây tổng hợp toàn bộ các tính năng được phát hiện từ tài liệu KHKT và yêu cầu bài toán:

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Khám phá bài học | Danh mục bài toán thực tế Toán 10 | Giao diện hiển thị bộ sưu tập bài toán thực tế theo chủ đề (Lượng giác, Parabol, Tối ưu hóa) có lọc và tìm kiếm | Từ khóa tìm kiếm, bộ lọc chủ đề | Danh sách thẻ bài học kèm độ khó, thời lượng, chủ đề | Hiển thị thông báo "Không tìm thấy bài học phù hợp" nếu lọc rỗng | ORIGINAL_REQUEST R1, KHKT Mục 5.1 Bảng 5 |
| 2 | Khám phá bài học | Thẻ bài học tương tác | Hiển thị tóm tắt bài học: hình ảnh minh họa, tên song ngữ, từ vựng trọng tâm, tiến độ học | ID bài học | Card UI trực quan có nút "Bắt đầu học" | Báo lỗi nếu ID bài học không tồn tại | KHKT Hình 2, ORIGINAL_REQUEST R1 |
| 3 | Trình phát học liệu | Trình diễn kịch bản 5 màn song ngữ | Trình phát chuyển cảnh mượt mà qua 5 màn chuẩn hóa (Bối cảnh -> Dữ kiện -> Vấn đề & Từ vựng -> Gợi mở -> Thực hành) | Điều hướng Next/Prev hoặc thanh tiến trình màn 1-5 | Giao diện phân cảnh tương ứng kèm hình ảnh/sơ đồ và thuyết minh song ngữ | Giới hạn chỉ chuyển trong phạm vi màn 1-5 | KHKT Mục 3.2 Bảng 2 & Hình 2, ORIGINAL_REQUEST R2 |
| 4 | Trình phát học liệu | Lời thoại & Phụ đề song ngữ (VN-EN) | Hiển thị song song hoặc chuyển đổi phụ đề Tiếng Việt và Tiếng Anh với định dạng màu sắc tương phản cao | Lựa chọn ngôn ngữ hiển thị (Cả hai / Chỉ VN / Chỉ EN) | Phụ đề đồng bộ với giọng đọc | Hiển thị fallback song ngữ nếu thiết lập lỗi | KHKT Mục 3.2 Bảng 2, ORIGINAL_REQUEST R2 |
| 5 | Trình phát học liệu | Trình phát âm thanh song ngữ (Audio Engine) | Phát âm giọng đọc lời thoại tiếng Việt và tiếng Anh bằng âm thanh chất lượng cao hoặc Web Speech API | Lệnh phát/dừng của người dùng | Luồng âm thanh chuẩn, tốc độ 120-140 WPM | Thông báo fallback nếu trình duyệt không hỗ trợ Web Speech | KHKT Mục 3.1 B4, ORIGINAL_REQUEST R2 |
| 6 | Trình phát học liệu | Bảng từ vựng Math English tương tác | Hộp từ vựng nổi bật hiển thị danh mục thuật ngữ, phiên âm IPA, định nghĩa song ngữ và nút loa nghe phát âm | Click vào từ vựng hoặc danh sách từ của bài | Popover/bảng chi tiết kèm âm thanh phát âm chuẩn | Hiển thị thông báo lỗi âm thanh nếu thiết bị tắt tiếng | KHKT Mục 3.2 Bảng 2, ORIGINAL_REQUEST R2 |
| 7 | Trình phát học liệu | Sơ đồ hình học & Đồ thị trực quan động | Hiển thị sơ đồ tam giác, đồ thị parabol với các thông số đo đạc động, làm nổi bật góc nâng và đỉnh vòm | Thông số hình học của bài toán | Canvas/SVG minh họa sắc nét chuẩn toán học | Báo lỗi nếu thiếu tham số hình học | KHKT Hình 2 & Hình 3, ORIGINAL_REQUEST R2 |
| 8 | Phiếu học tập | Trắc nghiệm đọc hiểu dữ kiện thực tế | Câu hỏi kiểm tra trích xuất giả thiết, đơn vị đo, bối cảnh thực tế | Lựa chọn của học sinh (A, B, C, D) | Kết quả đúng/sai, điểm số, giải thích chi tiết | Yêu cầu học sinh chọn đáp án trước khi bấm kiểm tra | KHKT Bảng 1 & Bảng 4, ORIGINAL_REQUEST R3 |
| 9 | Phiếu học tập | Bài tập bước lập mô hình toán học | Câu hỏi kiểm tra việc lập phương trình, định lý Sin, tọa độ đỉnh parabol, biểu thức doanh thu | Lựa chọn/điền công thức của học sinh | Đánh giá tính đúng đắn toán học, giải thích từng bước | Báo lỗi cú pháp nếu điền số liệu không hợp lệ | KHKT Bảng 1 & Bảng 4, ORIGINAL_REQUEST R3 |
| 10 | Phiếu học tập | Kiểm tra từ vựng Math English (CLIL Quiz) | Câu hỏi kiểm tra nhận diện thuật ngữ tiếng Anh, ghép cặp từ với định nghĩa hoặc điền khuyết | Ghép cặp hoặc chọn thuật ngữ | Kết quả, hiển thị phát âm IPA và mẫu câu ví dụ | Thông báo nếu chưa hoàn thành ghép cặp | KHKT Bảng 1 & Bảng 4, ORIGINAL_REQUEST R3 |
| 11 | Phiếu học tập | Chấm điểm tự động & Phản hồi phân tầng | Tự động tính điểm tổng (thang 10), hiển thị lời khen khi đúng, phân tích lỗi sai và gợi ý (Scaffolded Hint) khi sai | Bài nộp của học sinh | Bảng điểm, mã màu xanh/đỏ, gợi ý tầng 1 -> tầng 2 -> lời giải | Yêu cầu hoàn thành các câu bắt buộc trước khi tính điểm | KHKT Bảng 4, ORIGINAL_REQUEST R3 |
| 12 | Phiếu học tập | Khảo sát phản hồi học sinh (Likert 5 mức) | Form thu thập đánh giá mức độ dễ hiểu, hứng thú và tự tin của học sinh sau bài học | Điểm đánh giá 1-5 cho 6 phát biểu chuẩn KHKT | Lưu dữ liệu khảo sát, hiển thị biểu đồ phân tích | Cảnh báo nếu chưa trả lời đủ 6 phát biểu | KHKT Phụ lục & Hình 4 |
| 13 | Biên soạn & Kiểm chứng | Form biên soạn bài học 5 phân cảnh | Cho phép giáo viên nhập tiêu đề, bối cảnh, dữ kiện, công thức, từ vựng và hình ảnh cho cả 5 màn song ngữ | Dữ liệu văn bản, thông số toán học, danh sách từ vựng | Bản thảo bài học (Lesson Draft) lưu trong hệ thống | Báo lỗi validation nếu để trống các trường bắt buộc | ORIGINAL_REQUEST R4, KHKT Mục 3.1 B3 |
| 14 | Biên soạn & Kiểm chứng | Bảng kiểm 2 lớp tương tác (Dual-Verification Checklist) | Giao diện kiểm định 10 tiêu chí độc lập (Lớp 1 Toán học & Lớp 2 Ngôn ngữ) với trạng thái Đạt/Chưa đạt và ghi chú minh chứng | Thao tác kiểm định của auditor hoặc auto-rule | Trạng thái kiểm định từng tiêu chí (Pass/Fail) và tổng thể | Báo đỏ các tiêu chí không đạt | KHKT Mục 3.3 Bảng 3, ORIGINAL_REQUEST R4 |
| 15 | Biên soạn & Kiểm chứng | Cơ chế khóa xuất bản (Publish Blocker) | Chặn xuất bản bài học ra thư viện nếu chưa đạt 100% tiêu chí của cả 2 lớp kiểm chứng | Lệnh xuất bản (Publish action) | Xuất bản thành công hoặc Hộp thoại từ chối kèm danh sách lỗi | Chặn thao tác xuất bản, yêu cầu khắc phục lỗi | KHKT Mục 3.3 Bảng 3, ORIGINAL_REQUEST R4 |
| 16 | Biên soạn & Kiểm chứng | Nhật ký Prompt AI & Khai báo minh bạch | Ghi nhận và hiển thị lịch sử các câu lệnh Prompt AI đã dùng để tạo asset (Midjourney, ElevenLabs) tuân thủ TT 84 | Dữ liệu Prompt, công cụ AI sử dụng | Nhật ký Audit Trail minh bạch | Cảnh báo nếu bài học dùng AI mà không khai báo prompt | KHKT Mục 7 Bảng 6 (Thông tư 84/2026/TT-BGDĐT) |

---

## 8. BẢNG TRƯỜNG HỢP BIÊN & DỮ LIỆU ĐẶC BIỆT (EDGE CASES)

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Tính chiều cao hải đăng ($CD$) | Góc nâng tại hai điểm quá gần nhau: $\alpha = 42^\circ, \beta = 42.1^\circ$ (góc $\widehat{ADB} \to 0^\circ$) | Góc $\widehat{ADB} = 0.1^\circ \implies \sin(0.1^\circ) \approx 0.00175$, mẫu số tiến tới 0 dẫn tới giá trị $BD$ bùng nổ sai số cực lớn. Hệ thống kiểm định Lớp 1 phải cảnh báo dữ kiện thực tế không hợp lý. |
| 2 | Tính chiều cao hải đăng ($CD$) | Đảo ngược góc đo: Nhập góc nâng tại mốc xa $A$ lớn hơn mốc gần $B$ ($\alpha > \beta$) | Góc $\widehat{ADB} = \beta - \alpha < 0^\circ \implies$ khoảng cách $BD < 0$ vô lý hình học. Hệ thống lập tức báo lỗi kiểm định V1.2 (Quan hệ hình học không hợp lệ). |
| 3 | Cổng vòm Parabol | Chiều cao xe tải vượt quá chiều cao đỉnh vòm: Xe cao $h_0 = 6.5\text{ m} > H = 6\text{ m}$ | Mép xe và nóc xe đều vượt quá vòm cổng. Khoảng hở an toàn âm ($\Delta h = -2.0\text{ m}$). Hệ thống đưa ra cảnh báo nguy hiểm va chạm nghiêm trọng. |
| 4 | Cổng vòm Parabol | Chiều rộng xe tải vượt quá hoặc bằng bề rộng chân cổng: $w \ge 8\text{ m}$ | Xe không thể đi vào cổng dù chiều cao xe có nhỏ. Điểm $x = \pm 4\text{ m}$ nằm tại mặt đất $y = 0$. Hệ thống cảnh báo vi phạm điều kiện biên vật lý. |
| 5 | Tối ưu hóa doanh thu | Số lần giảm giá $x \ge 20$ dẫn tới đơn giá vé $P(x) \le 0$ | Giá vé bằng 0 hoặc âm. Vi phạm điều kiện biên kinh tế $P(x) > 0$. Hệ thống kiểm định V1.3 tự động từ chối bài toán. |
| 6 | Tối ưu hóa doanh thu | Số khách sau khi giảm giá vượt quá sức chứa xe ($60 + 5x > 100 \implies x > 8$) | Dù về mặt toán học parabol đạt đỉnh tại $x = 4$ (hợp lệ $80 \le 100$), nhưng nếu bài toán thay đổi tham số làm đỉnh $x_V > 8$, cực đại thực tế bị chặn tại biên $x = 8$. Hệ thống solver phải xử lý bài toán tối ưu trên đoạn $[0, 8]$. |
| 7 | Phát âm từ vựng Math EN | Trình duyệt ngoại tuyến hoặc không hỗ trợ Web Speech Synthesis API | Nút phát âm không bị đơ/treo; hệ thống chuyển sang sử dụng file audio dự phòng MP3 hoặc hiển thị thông báo phiên âm IPA kèm text giải thích. |
| 8 | Biên soạn & Kiểm chứng 2 lớp | Giáo viên nhập thiếu 1 trong 10 tiêu chí kiểm định (ví dụ bỏ qua tiêu chí IPA) | Nút "Xuất bản bài học / Publish" bị disable kèm tooltip chỉ rõ: "Còn 1 tiêu chí Lớp 2 (V2.2 - IPA) chưa đạt kiểm định". |
| 9 | Chuyển cảnh phân cảnh 5 màn | Người dùng đang làm dang dở câu hỏi Quiz ở màn 5 rồi bấm lùi lại màn 1 | Trạng thái câu trả lời đã điền của học sinh không bị xóa mất (state persistence), cho phép học sinh xem lại bối cảnh rồi quay lại làm tiếp. |
| 10 | Làm tròn số thập phân | Học sinh nhập $49.88\text{ m}$ hoặc $50\text{ m}$ thay vì $49.9\text{ m}$ cho chiều cao hải đăng | Hệ thống chấp nhận đáp án trong khoảng dung sai $\pm 0.2\text{ m}$ và hiển thị ghi chú giải thích quy tắc làm tròn 1 chữ số thập phân chuẩn. |

---

## 9. KẾT LUẬN & KHUYẾN NGHỊ THIẾT KẾ CHO ĐỘI NGŨ PHÁT TRIỂN

1. **Về Cấu trúc Dữ liệu Bài học (Lesson Data Schema)**:  
   Mỗi bài học cần được cấu trúc hóa dưới dạng JSON thống nhất gồm 5 khối tương ứng 5 màn, kèm mảng `vocabulary` (có audio, ipa, nghĩa), `mathModel` (công thức, ẩn số, lời giải), `quizItems` (phân loại theo 3 nhóm năng lực) và `verificationLog` (kết quả 10 tiêu chí kiểm định 2 lớp).
2. **Về Trải nghiệm Trực quan (UX/UI)**:  
   Giao diện 5 màn nên có thanh tiến trình hiển thị rõ ràng 5 bước, hỗ trợ cả nút chuyển màn thủ công và phím tắt bàn phím. Sơ đồ hình học và đồ thị hàm số nên vẽ bằng SVG/Canvas sắc nét, có animation vẽ góc và đường gióng để học sinh dễ liên tưởng.
3. **Về Công cụ Biên soạn & Kiểm chứng 2 lớp**:  
   Giao diện biên soạn cần tách biệt tab "Soạn thảo kịch bản" và tab "Kiểm chứng 2 lớp", trong đó bảng kiểm chứng cung cấp checkbox tương tác và trường nhập minh chứng cụ thể cho từng tiêu chí, bảo đảm tính nghiêm ngặt học thuật chuẩn cuộc thi KHKT quốc gia.
