# BÁO CÁO KIẾN TRÚC VÀ THIẾT KẾ UX/UI WEB APP HỌC TOÁN THỰC TIỄN SONG NGỮ (CLIL)
## DỰ ÁN DỰ THI CUỘC THI KHOA HỌC KỸ THUẬT (KHKT) CẤP TỈNH VÀ QUỐC GIA
**Đơn vị nghiên cứu:** Trường THCS & THPT Trần Văn Kiết, Tỉnh Vĩnh Long  
**Đề tài:** Ứng dụng Trí tuệ nhân tạo phát triển video song ngữ học Toán thực tiễn (CLIL) dành cho học sinh Lớp 10  
**Tác giả:** Phạm Nguyễn Ti Na (10A1) — GVHD: ThS. Lê Thanh Tâm  
**Tài liệu tham chiếu:** `extracted_doc.txt`, `KHKT-Ti Na.docx`, `ORIGINAL_REQUEST.md`

---

## 1. TỔNG QUAN HỆ THỐNG VÀ ĐỊNH VỊ SƯ PHẠM KHKT

### 1.1. Bối cảnh và Nhu cầu thực tiễn
Trong chương trình Giáo dục Phổ thông môn Toán (GDPT 2018), năng lực mô hình hóa toán học và giải quyết vấn đề thực tế là năng lực cốt lõi. Tuy nhiên, theo khảo sát thực tế trên 400 học sinh lớp 10:
- **Rào cản ngôn ngữ và nhận thức:** Học sinh gặp khó khăn trong việc trích xuất các đại lượng số học từ văn bản mô tả thực tế dài, phức tạp.
- **Thiếu hụt học liệu tích hợp CLIL:** Học sinh thiếu cơ hội tiếp cận thuật ngữ Tiếng Anh chuyên ngành Toán (Math English) trong môi trường học trực quan.
- **Rủi ro ảo giác từ AI thông thường:** Việc tự sinh video học tập bằng AI thương mại thường mắc lỗi sai số liệu, tỷ lệ hình học sai lệch hoặc chứa chi tiết gây nhiễu nhận thức.

### 1.2. Mục tiêu kiến trúc ứng dụng Web App
Ứng dụng Web App được thiết kế như một **Sản phẩm hoàn chỉnh phục vụ báo cáo và trình diễn tại Cuộc thi KHKT**, đáp ứng các tiêu chuẩn khắt khe:
1. **Khám phá và Quản lý bộ sưu tập học liệu (R1):** Phân loại theo 3 chủ đề trọng tâm Toán 10 (Hệ thức lượng trong tam giác, Hàm số bậc hai & Parabol, Bài toán tối ưu hóa diện tích/doanh thu), tìm kiếm, gắn nhãn KHKT, xem trước bài học.
2. **Trình phát học liệu 5 phân cảnh chuẩn hóa song ngữ (R2):** Chu trình 5 phân cảnh (Bối cảnh $\to$ Dữ kiện $\to$ Vấn đề & Từ vựng $\to$ Gợi mở mô hình hóa $\to$ Thực hành) kết hợp bộ chuyển đổi ngữ hệ (Việt - Anh - Song ngữ), mô phỏng hình học động SVG/Canvas tương tác cao và bảng từ vựng Math English tích hợp Web Speech API phát âm chuẩn bản ngữ.
3. **Phiếu học tập và trắc nghiệm tương tác 3 khía cạnh (R3):** Tự động chấm điểm, phản hồi giải thích chi tiết từng bước cho 3 dạng câu hỏi: Đọc hiểu dữ kiện thực tế, Lập luận mô hình hóa từng bước, và Năng lực từ vựng Math English.
4. **Studio Biên soạn và Kiểm chứng 2 lớp (R4):** Biên soạn bài học 5 màn và bảng kiểm chuyên môn độc lập 2 lớp (Lớp 1: Toán học; Lớp 2: Ngôn ngữ CLIL) với cơ chế khóa phát hành (Publishing Gate) nghiêm ngặt trước khi đưa vào thư viện.
5. **Kiến trúc phần mềm hiện đại, vận hành độc lập (R5):** 100% Client-side runnable (React 18 / Next.js / TypeScript / Tailwind CSS), không phụ thuộc API key đám mây trả phí bên ngoài, sẵn sàng offline/local demo.

---

## 2. KIẾN TRÚC CÔNG NGHỆ TỔNG THỂ (HIGH-LEVEL ARCHITECTURE)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MATH ENGLISH AI LEARN                                │
│                     Web App Học Toán Thực Tiễn Tích Hợp Tiếng Anh                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
 ┌─────────────────────────────────────────┼────────────────────────────────────────────┐
 │                                         │                                            │
 ▼                                         ▼                                            ▼
┌─────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│   COLLECTION EXPLORER   │   │  5-SCENE BILINGUAL PLAYER│   │   STUDIO & VERIFICATION  │
│   (Module Khám phá R1)  │   │  (Trình phát 5 màn R2-R3)│   │  (Biên soạn & Thẩm định) │
│                         │   │                          │   │                          │
│ • Bộ lọc 3 chủ đề KHKT  │   │ • 5-Scene Sequential Step│   │ • 5-Scene Storyboard Form│
│ • Tìm kiếm từ khóa/tag  │   │ • VI / EN / Dual Switch  │   │ • Math Vocab Manager     │
│ • Thẻ bài học & KHKT Tag│   │ • Interactive Canvas/SVG │   │ • Dual-Layer Checklist:  │
│ • Modal Quick Preview   │   │ • Web Speech API TTS     │   │   - L1: Math Correctness │
│ • Bộ dữ liệu mẫu Toán 10│   │ • 3-Tier Worksheet/Quiz  │   │   - L2: CLIL Linguistics │
│                         │   │ • Automated Scoring & Exp│   │ • Publishing Status Gate │
└─────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                APPLICATION CORE & STATE                                │
│ • LessonStore (Active Lesson, Catalog State, Draft State, Filter State)                │
│ • SpeechEngine (Web Speech API controller, Accent selection, Rate controller)          │
│ • QuizEngine (Answer evaluator, Multi-step grading, Feedback generator)                │
│ • StorageRepository (Preloaded JSON Catalog + LocalStorage Persistence)                │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    UI DESIGN SYSTEM                                    │
│ • Modern Tailwind UI: Deep Blue (#1E3A8A), Emerald (#059669), Amber (#D97706)        │
│ • Lucide-React Icons: Trực quan, sắc nét, đồng bộ                                      │
│ • MathJax / KaTeX rendering: Biểu thức toán học chuẩn LaTeX                            │
│ • Responsive Layout: Tương thích hoàn hảo Desktop (1920/1440/1024) và Mobile/Tablet   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PHÂN HỆ R1: NAVIGATION & COLLECTION EXPLORER

### 3.1. Thiết kế Giao diện & Trải nghiệm Người dùng (UX/UI)
- **Thanh Điều hướng Toàn cục (Global Header):**
  - **Logo & Huy hiệu KHKT:** Biểu tượng Toán - Ngôn ngữ kèm nhãn vàng nổi bật: `"KHKT 2026-2027 THPT Trần Văn Kiết"`.
  - **Menu chuyển phân hệ:** 
    - `Khám phá bài học` (Trang chính danh mục)
    - `Học liệu số & Trình phát 5 màn`
    - `Studio Biên soạn & Thẩm định 2 lớp`
    - `Báo cáo nghiên cứu KHKT` (Hiển thị tóm tắt công trình nghiên cứu, dữ liệu thực nghiệm 400 học sinh, cơ sở lý luận Blum & Leiß và CLIL).
  - **Bộ chuyển đổi ngôn ngữ giao diện:** Nút chuyển đổi nhanh `VIE / ENG` cho toàn bộ UI shell.
- **Hero Banner Khoa học:**
  - Tiêu đề: `"Học Toán Thực Tiễn Lớp 10 Tích Hợp Tiếng Anh (CLIL)"`.
  - Phụ đề: `"Phương pháp tiếp cận trực quan hóa 5 phân cảnh chuẩn hóa & Kiểm chứng 2 lớp độc lập"`.
  - Khối thống kê chỉ số ấn tượng:
    - `15+ Video bài học` | `400 Học sinh thực nghiệm` | `+2.43 Điểm trung bình` | `100% Đạt kiểm chứng 2 lớp`.
- **Thanh Công cụ Lọc và Tìm kiếm Đa tiêu chí:**
  - **Topic Tabs (Pill Buttons):**
    1. *Tất cả bài học (All Lessons)*
    2. *Hệ thức lượng trong tam giác (Trigonometry)*
    3. *Hàm số bậc hai & Parabol (Quadratic Functions & Parabola)*
    4. *Bài toán Tối ưu hóa (Optimization Problems)*
  - **Ô tìm kiếm tức thời (Live Search):** Lọc theo tên bài học tiếng Việt, tiếng Anh, hoặc từ vựng Math English (ví dụ: gõ "Sin", "Lighthouse", "Parabol", "Tối ưu").
  - **Bộ lọc Trạng thái kiểm chứng:** Checkbox `Chỉ hiện bài đã kiểm chứng 100% (Dual-Verified)`.
  - **Bộ lọc Độ khó:** `Cơ bản` | `Vận dụng` | `Vận dụng cao`.
- **Thẻ Bài học (Lesson Card Design):**
  - **Hình ảnh minh họa bối cảnh:** Minh họa 3D/Vector đặc trưng cho bối cảnh bài toán.
  - **Huy hiệu KHKT Kép:**
    - `✓ Toán học chuẩn xác` (Xanh lá)
    - `✓ CLIL Ngôn ngữ chuẩn` (Xanh dương)
  - **Tiêu đề song ngữ:** Tiếng Việt đậm ở trên, Tiếng Anh phụ đề bên dưới.
  - **Thanh lộ trình 5 phân cảnh thu nhỏ:** 5 chấm trạng thái thể hiện 5 màn học.
  - **Danh sách nhãn từ vựng nổi bật (Tags):** Tối đa 3-4 thuật ngữ Math English (vd: `#Angle_of_elevation`, `#Law_of_Sines`).
  - **Cặp nút tương tác nhanh (CTA):**
    - `Xem trước (Preview)`: Mở Modal tóm tắt kịch bản và mục tiêu học tập.
    - `Vào học ngay`: Mở Trình phát 5 phân cảnh (Player).
    - `Phiếu bài tập`: Nhảy thẳng vào phiếu trắc nghiệm tương tác.

### 3.2. Bộ Dữ liệu Mẫu Toán 10 Chuẩn hóa từ Hồ sơ KHKT
Hệ thống tích hợp sẵn tối thiểu 3 bài học hoàn chỉnh theo đúng nghiên cứu thực nghiệm:
1. **Bài học 1: Đo chiều cao ngọn hải đăng khi chân tháp không thể tiếp cận (Measuring Lighthouse Height with Inaccessible Base)**
   - *Chủ đề:* Hệ thức lượng trong tam giác (Định lý Sin và lượng giác vuông).
   - *Thông số:* $AB = 30\text{ m}$, góc nâng tại $A$ là $42^\circ$, góc nâng tại $B$ là $63^\circ$.
   - *Mục tiêu:* Tính khoảng cách $BD$, từ đó tính chiều cao $CD \approx 62.4\text{ m}$.
2. **Bài học 2: Cổng vòm Parabol và bài toán xe tải qua hầm (Parabolic Arch and Clearance Problem)**
   - *Chủ đề:* Hàm số bậc hai $y = ax^2 + bx + c$.
   - *Thông số:* Cổng hình parabol cao $8\text{ m}$, bề rộng chân cổng $12\text{ m}$. Xe tải có bề rộng $4\text{ m}$, chiều cao $7\text{ m}$ có thể đi qua chính giữa cổng không?
   - *Mục tiêu:* Thiết lập hệ trục $Oxy$, lập phương trình parabol $y = -\frac{2}{9}x^2 + 8$, tính chiều cao mép xe tại $x = 2\text{ m}$ ($y \approx 7.11\text{ m} > 7\text{ m} \implies$ Xe lọt qua an toàn).
3. **Bài học 3: Tối ưu hóa diện tích khu đất nuôi trồng thủy sản (Optimization of Agricultural Land Area)**
   - *Chủ đề:* Bất đẳng thức hoặc Giá trị lớn nhất của tam thức bậc hai.
   - *Thông số:* Bác nông dân có $120\text{ m}$ lưới rào để ngăn một mảnh đất hình chữ nhật giáp bờ sông thẳng (không cần rào bờ sông).
   - *Mục tiêu:* Biến $x$ là chiều rộng vuông góc bờ sông ($0 < x < 60$), chiều dài song song bờ sông $y = 120 - 2x$. Diện tích $S(x) = x(120 - 2x) = -2x^2 + 120x$. Tìm giá trị lớn nhất tại đỉnh parabol ($x = 30\text{ m}, S_{\max} = 1800\text{ m}^2$).

---

## 4. PHÂN HỆ R2: TRÌNH PHÁT HỌC LIỆU ĐA PHƯƠNG TIỆN 5 PHÂN CẢNH CHUẨN HÓA

### 4.1. Quy trình 5 Phân cảnh Chuẩn hóa (5-Scene Standardized Sequence)
Cấu trúc kịch bản tuân thủ chặt chẽ mô hình chu trình mô hình hóa toán học Blum & Leiß và lý thuyết Đa biểu diễn (Goldin):

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                LỘ TRÌNH 5 PHÂN CẢNH                                     │
├──────────────┬──────────────┬──────────────┬─────────────────────────────┬──────────────┤
│   MÀN 1      │   MÀN 2      │   MÀN 3      │            MÀN 4            │   MÀN 5      │
│   BỐI CẢNH   │   DỮ KIỆN    │ VẤN ĐỀ & TỪ  │      GỢI MỞ TƯ DUY          │  THỰC HÀNH   │
│   (Context)  │ (Given Facts)│ (Problem/Voc)│   (Modeling Guidance)       │  (Practice)  │
├──────────────┼──────────────┼──────────────┼─────────────────────────────┼──────────────┤
│Tình huống    │Trích xuất    │Xác định ẩn   │Gợi ý từng bước (scaffolding)│Mời làm phiếu │
│đời sống sinh │các số liệu,  │số, câu hỏi cốt│kết nối thực tế sang công thức;│học tập; thử  │
│động, khơi gợi│đơn vị đo, sơ │lõi & Bảng thuật│tính toán trung gian, không đưa│thách mở rộng │
│tò mò khoa học│đồ hình học 2D│ngữ Math EN   │ngay đáp số thô              │& tự đánh giá │
└──────────────┴──────────────┴──────────────┴─────────────────────────────┴──────────────┘
```

### 4.2. Bộ Điều khiển Trình phát (Player Controller UI)
- **Thanh Tiến trình 5 Màn (Scene Navigation Stepper):**
  - Hiển thị 5 bước với tên màn, biểu tượng trực quan và trạng thái: `Đang xem (Active)`, `Đã xem (Completed)`, `Chưa xem (Upcoming)`.
  - Cho phép học sinh click quay lại bất kỳ phân cảnh nào để ôn lại dữ kiện.
- **Bộ chuyển đổi Chế độ Song ngữ (Bilingual Mode Switcher):**
  - **`Chế độ Song ngữ (Dual Mode - Mặc định):`** Hiển thị văn bản tiếng Việt và tiếng Anh song song hoặc phân tầng với huy hiệu cờ 🇻🇳 và 🇬🇧 rõ ràng.
  - **`Chế độ Tiếng Việt (VI Mode):`** Dành cho học sinh cần nắm chắc bản chất toán học trước.
  - **`Chế độ Tiếng Anh (EN Mode - CLIL Immersion):`** Dành cho học sinh luyện tập thẩm thấu tiếng Anh chuyên ngành toàn diện.
- **Khu vực Trực quan hóa Động (Interactive Dynamic Simulation Stage):**
  - Khung hình tỷ lệ 16:9 chuẩn HD.
  - Hỗ trợ 2 chế độ hiển thị:
    1. **Mô phỏng Đồ họa Động (Interactive SVG / Canvas Diagram):** Cho phép tương tác kéo thanh trượt góc, khoảng cách, hiện/ẩn đường gióng, nhãn điểm $A, B, C, D$.
    2. **Video AI / Animation nhúng:** Trình phát video chuẩn với điều khiển phát, dừng, phát lại, thanh thời gian, và phụ đề song ngữ tự động khớp thời gian.

### 4.3. Bảng Từ vựng Chuyên ngành Tương tác (Interactive Math English Glossary)
Mỗi phân cảnh (đặc biệt là Màn 3) liên kết chặt chẽ với Bảng từ vựng Math English:
- **Cấu trúc trường dữ liệu mỗi từ vựng:**
  - `term`: Thuật ngữ tiếng Anh (vd: *Angle of elevation*)
  - `phonetic`: Phiên âm quốc tế IPA (vd: *[ˈæŋɡəl əv ˌɛləˈveɪʃən]*)
  - `vietnameseMeaning`: Nghĩa toán học chuẩn tiếng Việt (vd: *Góc nâng (góc ngắm lên)*)
  - `englishDefinition`: Định nghĩa ngắn gọn bằng tiếng Anh (vd: *The angle between the horizontal line of sight and the line of sight up to an object.*)
  - `exampleSentence`: Câu ngữ cảnh thực tế trong bài toán (vd: *The angle of elevation to the top of the lighthouse from point A is 42 degrees.*)
  - `audioAction`: Nút bấm phát âm chuẩn sử dụng **Web Speech API (`window.speechSynthesis`)**.
- **Cơ chế Phát âm Web Speech API bản địa (Zero Cloud Dependency):**
  ```typescript
  // Web Speech API Voice Controller Architecture
  export const playTermPronunciation = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Dừng câu đang nói dở
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Tốc độ vừa phải cho học sinh THPT
    utterance.pitch = 1.0;
    
    // Tự động tìm giọng đọc bản ngữ chất lượng cao nếu có
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
    if (englishVoice) utterance.voice = englishVoice;
    
    window.speechSynthesis.speak(utterance);
  };
  ```

---

## 5. PHÂN HỆ R3: PHIẾU HỌC TẬP TƯƠNG TÁC (INTERACTIVE WORKSHEETS & QUIZZES)

### 5.1. Ba Dạng Câu hỏi Chuẩn hóa theo Tiêu chí Nghiên cứu KHKT
Phiếu học tập được thiết kế bao phủ toàn diện 3 khía cạnh năng lực của học sinh:

| Dạng câu hỏi | Tên năng lực khảo sát | Mục tiêu đo lường trong KHKT | Ví dụ tương tác minh họa |
|---|---|---|---|
| **Dạng 1** | **Đọc hiểu & Trích xuất dữ kiện thực tế** *(Reading Comprehension & Fact Extraction)* | Đo lường khả năng bóc tách số liệu, góc, khoảng cách, điều kiện biên từ tình huống thực tiễn | Học sinh chọn đúng các giá trị: $AB = 30\text{ m}$, $\widehat{CAD} = 42^\circ$, $\widehat{CBD} = 63^\circ$; xác định tính chất chân tháp $C$ không tiếp cận được. |
| **Dạng 2** | **Lập mô hình toán học & Suy luận từng bước** *(Mathematical Modeling Step-by-Step Reasoning)* | Đo lường chu trình Blum & Leiß: chọn tam giác trung gian, tính góc $\widehat{ADB}$, lập phương trình Định lý Sin | Câu hỏi nhiều bước: <br>• Bước 1: Tính $\widehat{ADB} = 63^\circ - 42^\circ = 21^\circ$<br>• Bước 2: Chọn hệ thức $\frac{BD}{\sin 42^\circ} = \frac{AB}{\sin 21^\circ}$<br>• Bước 3: Tính $CD = BD \cdot \sin 63^\circ$ |
| **Dạng 3** | **Thuật ngữ Tiếng Anh Toán học (CLIL)** *(Math English Terminology & Concept Recall)* | Đo lường mức độ ghi nhớ, hiểu và vận dụng thuật ngữ chuyên ngành tiếng Anh | Ghép nối thuật ngữ với định nghĩa hoặc điền khuyết từ vựng: *The base of the lighthouse is [inaccessible]*, thuật ngữ cho góc $\widehat{CAD}$ là *[angle of elevation]*. |

### 5.2. Động cơ Chấm điểm và Phản hồi Tức thì (Scoring & Feedback Engine)
- **Cơ chế Chấm điểm tự động:**
  - Điểm tổng: Thang điểm 10 chuẩn GDPT Việt Nam.
  - Phân bổ trọng số:
    - *Năng lực đọc hiểu dữ kiện:* 3.0 điểm (30%)
    - *Năng lực mô hình hóa toán học:* 4.5 điểm (45%)
    - *Năng lực từ vựng Math English:* 2.5 điểm (25%)
- **Hệ thống Giải thích Từng bước (Instant Step-by-Step Explanation):**
  - Ngay sau khi học sinh nộp bài (hoặc kiểm tra từng câu):
    - Đổi màu trạng thái trực quan: Xanh lá (Đúng), Đỏ (Sai), Vàng cam (Đúng một phần).
    - Hộp giải thích chi tiết bung ra (Collapsible Explanation Panel):
      - **Lời giải toán học chuẩn:** Công thức định lý, phép thay số và kết quả làm tròn.
      - **Giải thích thuật ngữ tiếng Anh:** Ghi chú ngữ nghĩa từ vựng liên quan.
      - **Cảnh báo lỗi sai phổ biến (Common Misconceptions):** Ví dụ: *"Sai lầm thường gặp: Lấy trực tiếp $30 \cdot \tan 63^\circ$ là sai vì $AB$ không phải là đáy của tam giác vuông $BCD$!"*
  - **Bảng Tổng kết Kết quả (Score Summary Card):**
    - Biểu đồ tròn/thanh tiến trình phân tích điểm theo 3 năng lực.
    - So sánh với mức tăng trưởng thực nghiệm KHKT (+2.43 điểm, +34.5% mô hình hóa).
    - Nút `Làm lại bài (Retake)` và `Xem lại lý thuyết phân cảnh 4`.

---

## 6. PHÂN HỆ R4: STUDIO BIÊN SOẠN VÀ MA TRẬN KIỂM CHỨNG 2 LỚP

### 6.1. Giao diện Biên soạn Bài học 5 Phân cảnh (Authoring Studio Form)
Dành cho giáo viên và học sinh nghiên cứu khoa học xây dựng kịch bản bài học mới:
- **Tab 1: Thông tin Tổng quan (Lesson Metadata):**
  - Tiêu đề bài học (VI / EN)
  - Khối lớp (Mặc định: Lớp 10) & Chủ đề (Lượng giác / Parabol / Tối ưu)
  - Tóm tắt bối cảnh thực tế (Bilingual Abstract)
  - Tác giả & Ngày biên soạn
- **Tab 2: Soạn thảo Kịch bản 5 Phân cảnh (5-Scene Storyboard Editor):**
  - Cung cấp 5 khung nhập liệu tương ứng 5 phân cảnh:
    - Màn 1: Tình huống bối cảnh, câu hỏi mở đầu.
    - Màn 2: Bảng dữ kiện thực tế (Thêm/xóa hàng: Tên đại lượng, Ký hiệu, Giá trị, Đơn vị).
    - Màn 3: Vấn đề toán học & Danh sách từ vựng trọng tâm.
    - Màn 4: Các bước gợi mở tư duy mô hình hóa (Bước 1, Bước 2, Bước 3 kèm công thức LaTeX).
    - Màn 5: Lời kêu gọi thực hành và bài tập mở rộng.
- **Tab 3: Quản lý Thuật ngữ Math English (Vocabulary Manager):**
  - Bảng thêm mới từ vựng với các trường: Thuật ngữ, Phiên âm IPA, Nghĩa tiếng Việt, Định nghĩa tiếng Anh, Câu ví dụ.
  - Nút **"Nghe thử phát âm"** tích hợp trực tiếp Web Speech API để tác giả kiểm tra ngay âm điệu.
- **Tab 4: Thiết kế Phiếu học tập (Worksheet Designer):**
  - Thêm câu hỏi theo 3 dạng chuẩn hóa, thiết lập đáp án đúng, gợi ý và lời giải chi tiết.

### 6.2. Ma trận Bảng kiểm Tiêu chí Đánh giá 2 Lớp (Dual-Layer Verification Matrix)
Được số hóa trực tiếp từ **Bảng 3 trong tài liệu KHKT Trần Văn Kiết**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MA TRẬN KIỂM CHỨNG 2 LỚP (DUAL-LAYER VERIFICATION)              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ LỚP 1: TÍNH CHÍNH XÁC TOÁN HỌC (MATHEMATICAL RIGOR & MODELING)                         │
├─────────┬───────────────────────────────────┬──────────────┬───────────────────────────┤
│ Mã số   │ Tiêu chí kiểm định                │ Trạng thái   │ Tiêu chuẩn nghiệm thu     │
├─────────┼───────────────────────────────────┼──────────────┼───────────────────────────┤
│ M1.1    │ Dữ kiện & Đơn vị thực tế          │ PASS / FAIL  │ Khớp 100% số liệu thực tế │
│ M1.2    │ Quan hệ hình học & Đại số         │ PASS / FAIL  │ Không mâu thuẫn hình học  │
│ M1.3    │ Lời giải chuẩn & Độ chính xác     │ PASS / FAIL  │ Công thức & tính toán đúng│
│ M1.4    │ Tính sư phạm mô hình hóa (Scaff.) │ PASS / FAIL  │ Không tiết lộ đáp số sớm  │
├─────────┴───────────────────────────────────┴──────────────┴───────────────────────────┤
│ LỚP 2: CHUẨN XÁC NGÔN NGỮ TIẾNG ANH TOÁN & CLIL (LINGUISTIC & SEMANTICS)               │
├─────────┬───────────────────────────────────┬──────────────┬───────────────────────────┤
│ Mã số   │ Tiêu chí kiểm định                │ Trạng thái   │ Tiêu chuẩn nghiệm thu     │
├─────────┼───────────────────────────────────┼──────────────┼───────────────────────────┤
│ L2.1    │ Chuẩn thuật ngữ Math English      │ PASS / FAIL  │ Thuật ngữ chuẩn quốc tế   │
│ L2.2    │ Phiên âm IPA & Phát âm rõ ràng    │ PASS / FAIL  │ IPA chuẩn, TTS mượt mà    │
│ L2.3    │ Cấu trúc ngữ pháp & Ngữ nghĩa     │ PASS / FAIL  │ Câu tự nhiên, khớp VI-EN  │
│ L2.4    │ Trực quan hóa & Không gây nhiễu   │ PASS / FAIL  │ Loại bỏ chi tiết sai lệch │
└─────────┴───────────────────────────────────┴──────────────┴───────────────────────────┘
```

### 6.3. Cơ chế Khóa Phát hành Nghiêm ngặt (Publishing Gate Enforcement)
- **Quy tắc an toàn (Zero-Tolerance Policy):**
  - Một bài học đang ở trạng thái `DRAFT` (Bản thảo) chỉ có thể chuyển sang `PUBLISHED` (Đã xuất bản) và hiển thị ra Catalog chính khi **100% tiêu chí ở cả Lớp 1 và Lớp 2 đều có trạng thái `PASS`**.
  - Nếu có bất kỳ tiêu chí nào `NEEDS_REVIEW` hoặc `FAIL`, nút `Xuất bản bài học (Publish)` sẽ bị vô hiệu hóa kèm thông báo chỉ rõ tiêu chí nào chưa đạt:
    *Ví dụ: "Không thể xuất bản: Tiêu chí L2.1 (Thuật ngữ Math English) chưa được kiểm duyệt đạt chuẩn."*
  - Mỗi lượt kiểm duyệt lưu vết: Người kiểm định (Reviewer), Vai trò (GV Toán / GV Tiếng Anh), Ngày kiểm và Ghi chú minh chứng.

---

## 7. MÔ HÌNH DỮ LIỆU VÀ TYPESCRIPT SCHEMA (DATA STRUCTURES)

Dưới đây là đặc tả cấu trúc dữ liệu hoàn chỉnh chuẩn hóa toàn bộ ứng dụng:

```typescript
// ==========================================
// 1. VOCABULARY DATA SCHEMA
// ==========================================
export interface VocabularyItem {
  id: string;
  term: string;                      // Thuật ngữ tiếng Anh: "Angle of elevation"
  phonetic: string;                  // Phiên âm IPA: "[ˈæŋɡəl əv ˌɛləˈveɪʃən]"
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'phrase';
  vietnameseMeaning: string;         // Nghĩa tiếng Việt
  englishDefinition: string;         // Định nghĩa tiếng Anh
  exampleSentence: string;           // Câu ví dụ bối cảnh
  audioUrl?: string;                 // URL audio dự phòng (nếu có)
}

// ==========================================
// 2. 5-SCENE STORYBOARD DATA SCHEMA
// ==========================================
export type SceneType = 'context' | 'given_facts' | 'problem_vocab' | 'modeling_guidance' | 'practice';

export interface GivenFactItem {
  key: string;                       // Ký hiệu: "AB"
  value: string | number;            // Giá trị: 30
  unit: string;                      // Đơn vị: "m"
  descriptionVi: string;             // Mô tả tiếng Việt: "Khoảng cách giữa hai điểm quan sát"
  descriptionEn: string;             // Mô tả tiếng Anh: "Distance between observation points"
}

export interface ModelingStep {
  stepNumber: number;
  titleVi: string;
  titleEn: string;
  formulaLatex: string;              // Công thức LaTeX: "\frac{BD}{\sin 42^\circ} = \frac{AB}{\sin 21^\circ}"
  explanationVi: string;
  explanationEn: string;
  hintVi?: string;
  hintEn?: string;
}

export interface Scene {
  sceneNumber: 1 | 2 | 3 | 4 | 5;
  sceneType: SceneType;
  titleVi: string;
  titleEn: string;
  visualType: 'interactive_svg' | 'canvas' | 'video' | 'image';
  visualSimulationId: string;        // ID của linh kiện trực quan: "lighthouse_sim"
  narrationVi: string;               // Lời thuyết minh tiếng Việt
  narrationEn: string;               // Lời thuyết minh tiếng Anh
  durationSeconds: number;           // Thời lượng kịch bản (giây)
  
  // Dữ liệu mở rộng theo phân cảnh
  givenFacts?: GivenFactItem[];      // Dùng cho Màn 2
  vocabularyIds?: string[];          // Dùng cho Màn 3 (tham chiếu tới VocabularyItem)
  modelingSteps?: ModelingStep[];    // Dùng cho Màn 4
  practicePromptVi?: string;         // Dùng cho Màn 5
  practicePromptEn?: string;
}

// ==========================================
// 3. WORKSHEET & QUIZ SCHEMA
// ==========================================
export type QuestionCategory = 'fact_extraction' | 'math_modeling' | 'math_english';

export interface QuizOption {
  id: string;
  textVi: string;
  textEn: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  category: QuestionCategory;        // 3 dạng bắt buộc theo KHKT
  questionVi: string;
  questionEn: string;
  options: QuizOption[];
  points: number;                    // Điểm số
  stepHintVi?: string;               // Gợi ý tư duy
  stepHintEn?: string;
  explanationVi: string;             // Giải thích chi tiết bước giải
  explanationEn: string;
  commonErrorWarningVi?: string;     // Cảnh báo lỗi sai phổ biến
  commonErrorWarningEn?: string;
}

export interface QuizSubmission {
  lessonId: string;
  answers: Record<string, string>;   // questionId -> selectedOptionId
  scoreTotal: number;
  scoreBreakdown: {
    factExtraction: number;
    mathModeling: number;
    mathEnglish: number;
  };
  submittedAt: string;
}

// ==========================================
// 4. DUAL-LAYER VERIFICATION MATRIX SCHEMA
// ==========================================
export type VerificationStatus = 'PASS' | 'NEEDS_REVIEW' | 'PENDING';

export interface VerificationCriterion {
  id: string;                        // "M1.1", "L2.1", ...
  layer: 'math_rigor' | 'clil_linguistics';
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  status: VerificationStatus;
  reviewerName: string;
  reviewerRole: 'Math_Lead' | 'English_CLIL_Lead' | 'AI_Supervisor';
  verifiedAt?: string;
  evidenceNotes: string;             // Ghi chú minh chứng thẩm định
}

export interface VerificationMatrix {
  isFullyApproved: boolean;          // true chỉ khi 100% criteria đạt PASS
  mathLayerApproved: boolean;
  linguisticLayerApproved: boolean;
  criteria: VerificationCriterion[];
  lastAuditedAt: string;
}

// ==========================================
// 5. MASTER LESSON SCHEMA
// ==========================================
export type LessonTopic = 'trigonometry' | 'quadratic_functions' | 'optimization';
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  slug: string;
  titleVi: string;
  titleEn: string;
  topic: LessonTopic;
  difficulty: DifficultyLevel;
  gradeLevel: 10;
  coverImage: string;
  summaryVi: string;
  summaryEn: string;
  
  // Khối kịch bản & học liệu
  scenes: Scene[];                   // Đầy đủ 5 phân cảnh chuẩn
  vocabulary: VocabularyItem[];      // Bảng từ vựng Math English
  quizQuestions: QuizQuestion[];     // Phiếu học tập 3 dạng
  
  // Khối kiểm chứng 2 lớp
  verification: VerificationMatrix;
  publicationStatus: 'DRAFT' | 'PUBLISHED';
  
  createdAt: string;
  updatedAt: string;
}
```

---

## 8. THIẾT KẾ MÔ PHỎNG ĐỒ HỌA ĐỘNG (DYNAMIC VISUAL SIMULATIONS)

Để thỏa mãn yêu cầu R2 về **"Dynamic visual simulation / SVG / Canvas diagrams"**, hệ thống kiến trúc 3 linh kiện đồ họa vector động tương tác theo thời gian thực (Real-time Interactive Graphics) cho 3 bài học mẫu:

### 8.1. Linh kiện 1: `LighthouseTrigSimulation` (Đo chiều cao Hải đăng)
- **Cơ chế đồ họa SVG:**
  - Tọa độ $C(600, 350)$ là chân vách đá, $D(600, 100)$ là đỉnh ngọn hải đăng (chiều cao $CD = h$).
  - Tọa độ $B(420, 350)$ là điểm quan sát thứ 2 (cách $C$ khoảng cách $x$).
  - Tọa độ $A(180, 350)$ là điểm quan sát thứ 1 (cách $B$ một đoạn $AB = 30\text{ m}$).
  - Tia ngắm $AD$ và tia ngắm $BD$ tạo góc nâng $42^\circ$ và $63^\circ$ có cung tròn ký hiệu góc.
  - Vùng tam giác trung gian $\triangle ABD$ được tô bóng viền phát sáng khi người dùng chuyển sang Màn 3 và Màn 4.
  - Hiệu ứng đèn hải đăng xoay chùm sáng nhấp nháy tạo không khí sinh động thực tế.
- **Thanh trượt tương tác (Interactive Sliders):**
  - Học sinh có thể kéo thanh trượt đổi khoảng cách $AB$ (từ $20\text{m} \to 50\text{m}$) hoặc góc nâng để quan sát sự thay đổi tự động của chiều cao $CD$ trên bảng số liệu trực tiếp.

### 8.2. Linh kiện 2: `ParabolicArchSimulation` (Cổng vòm Parabol & Xe tải)
- **Cơ chế đồ họa SVG / Canvas:**
  - Hệ trục tọa độ Đề-các $Oxy$: Trục hoành là mặt đất, đỉnh cổng tại $(0, 8)$, hai chân cổng tại $(-6, 0)$ và $(6, 0)$ (bề rộng $12\text{ m}$).
  - Đường cong Parabol biểu diễn hàm số $y = -\frac{2}{9}x^2 + 8$.
  - Hình chữ nhật đại diện cho thùng xe tải: rộng $4\text{ m}$ (từ $x = -2$ đến $x = 2$), cao $7\text{ m}$.
  - Tính năng tương tác:
    - Nút bấm *"Mô phỏng xe tải đi qua"*: Xe di chuyển vào chính giữa cổng.
    - Điểm kiểm tra an toàn tại góc thùng xe $(2, 7)$ so với điểm parabol tương ứng $(2, 7.11)$, hiển thị khoảng cách thông thủy an toàn $0.11\text{ m}$ màu xanh lá.

### 8.3. Linh kiện 3: `OptimizationAreaSimulation` (Tối ưu hóa Diện tích Khu đất)
- **Cơ chế đồ họa trực quan kép:**
  - Khung bên trái: Hình chữ nhật mảnh đất giáp bờ sông xanh biếc. Rào 3 cạnh với tổng chiều dài $120\text{ m}$.
  - Khung bên phải: Đồ thị hàm số diện tích parabol $S(x) = -2x^2 + 120x$ với đỉnh cực đại tại $x = 30, S = 1800$.
  - Thanh trượt kích thước $x$: Khi học sinh kéo $x$ từ $10\text{m} \to 50\text{m}$, hình chữ nhật biến dạng tương ứng (dài hẹp sang ngắn bẹt) và điểm chấm trên đồ thị parabol di chuyển theo. Khi $x = 30$, đỉnh đồ thị bừng sáng huy hiệu *"Diện tích tối đa! (Maximum Area)"*.

---

## 9. CÂY CẤU TRÚC LINH KIỆN VÀ TỔ CHỨC FILE (COMPONENT HIERARCHY & CODE LAYOUT)

```
math_english_ai_learn/
├── src/
│   ├── app/                              # Next.js App Router hoặc React Pages
│   │   ├── layout.tsx                    # Root Layout kèm Navbar & Footer
│   │   ├── page.tsx                      # Trang chủ & Collection Explorer (R1)
│   │   ├── lessons/
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Trang Trình phát 5 phân cảnh (R2)
│   │   │       └── quiz/
│   │   │           └── page.tsx          # Trang Phiếu học tập tương tác (R3)
│   │   ├── studio/
│   │   │   └── page.tsx                  # Studio Biên soạn & Kiểm chứng 2 lớp (R4)
│   │   └── research/
│   │       └── page.tsx                  # Báo cáo Khoa học KHKT (400 học sinh, SPSS)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx                # Thanh điều hướng, Logo KHKT, Lang Switch
│   │   │   └── Footer.tsx                # Thông tin nhóm nghiên cứu Trần Văn Kiết
│   │   ├── explorer/
│   │   │   ├── HeroBanner.tsx            # Thống kê KHKT ấn tượng & Giới thiệu
│   │   │   ├── TopicFilters.tsx          # Thanh nút lọc chủ đề & ô tìm kiếm
│   │   │   ├── LessonCard.tsx            # Card bài học kèm huy hiệu 2-layer verified
│   │   │   └── LessonPreviewModal.tsx    # Modal xem nhanh kịch bản bài học
│   │   ├── player/
│   │   │   ├── SceneStepper.tsx          # Thanh 5 phân cảnh chuẩn hóa
│   │   │   ├── BilingualToggle.tsx       # Công tắc VI / EN / Dual mode
│   │   │   ├── SceneView.tsx             # Bộ hiển thị nội dung phân cảnh hiện tại
│   │   │   ├── VocabularyDrawer.tsx      # Bảng từ vựng Math English tương tác
│   │   │   ├── PronunciationButton.tsx   # Nút phát âm Web Speech API
│   │   │   └── ModelingGuidance.tsx      # Khung gợi mở từng bước Màn 4
│   │   ├── simulations/
│   │   │   ├── LighthouseSimulation.tsx  # Mô phỏng Hệ thức lượng (Hải đăng)
│   │   │   ├── ParabolaSimulation.tsx    # Mô phỏng Parabol (Cổng vòm)
│   │   │   └── OptimizationSimulation.tsx# Mô phỏng Tối ưu hóa (Diện tích)
│   │   ├── quiz/
│   │   │   ├── QuizContainer.tsx         # Khung phiếu bài tập 3 dạng
│   │   │   ├── QuestionItem.tsx          # Linh kiện từng câu hỏi trắc nghiệm
│   │   │   ├── StepExplanation.tsx       # Hộp giải thích bước giải chi tiết
│   │   │   └── ScoreReportCard.tsx       # Bảng điểm tổng kết và phân tích năng lực
│   │   └── studio/
│   │       ├── LessonEditorForm.tsx      # Form nhập liệu 5 màn kịch bản
│   │       ├── VocabManager.tsx          # Quản lý thêm/sửa từ vựng và test âm thanh
│   │       ├── VerificationMatrix.tsx    # Bảng kiểm chứng 2 lớp chuyên môn
│   │       └── PublishingGateBanner.tsx  # Khóa logic xuất bản an toàn
│   │
│   ├── data/
│   │   ├── sampleLessons.ts              # 3 bài học mẫu Toán 10 chuẩn KHKT
│   │   └── defaultChecklist.ts           # Tiêu chí bảng kiểm 2 lớp mặc định
│   │
│   ├── lib/
│   │   ├── speech.ts                     # Web Speech API utility module
│   │   ├── quizEvaluator.ts              # Logic chấm điểm và phân loại năng lực
│   │   └── storage.ts                    # LocalStorage persistence repository
│   │
│   ├── types/
│   │   └── lesson.ts                     # Toàn bộ TypeScript interfaces & types
│   │
│   └── tests/                            # Bộ kiểm thử độc lập (Vitest / Jest)
│       ├── mathLogic.test.ts             # Kiểm thử độ chính xác các công thức toán
│       ├── quizScoring.test.ts           # Kiểm thử động cơ chấm điểm
│       └── verificationGate.test.ts      # Kiểm thử khóa logic xuất bản 2 lớp
```

---

## 10. CHIẾN LƯỢC KIỂM THỬ VÀ ĐẢM BẢO CHẤT LƯỢNG (TESTING STRATEGY)

Để bảo đảm nghiệm thu đạt chuẩn kỹ thuật khắt khe, dự án thiết lập hệ thống kiểm thử tự động gồm 3 phân nhóm:

### 10.1. Kiểm thử Tính đúng đắn của Thuật toán Toán học (Math Accuracy Tests)
- **Mục tiêu:** Đảm bảo toàn bộ công thức và giá trị trong các bài học mẫu tuyệt đối chính xác, không sai số làm tròn quá $\pm 0.1$.
- **Test Cases cụ thể:**
  1. `test_lighthouse_law_of_sines`:
     - Input: $AB = 30$, $\angle A = 42^\circ$, $\angle B = 63^\circ$.
     - $\angle ADB = 63 - 42 = 21^\circ$.
     - $BD = \frac{30 \cdot \sin(42^\circ)}{\sin(21^\circ)} \approx 55.999\text{ m}$.
     - Chiều cao $CD = BD \cdot \sin(63^\circ) \approx 49.896 \approx 49.9\text{ m}$ (hoặc theo số liệu chuẩn của kịch bản).
  2. `test_parabola_truck_clearance`:
     - Phương trình: $y = -\frac{2}{9}x^2 + 8$.
     - Đỉnh tại $(0, 8)$, chân cổng tại $x = \pm 6 \implies y = 0$.
     - Tại $x = 2$ (mép xe tải rộng $4\text{m}$): $y(2) = -\frac{2}{9}(4) + 8 = 7.111\text{ m} > 7.0\text{ m}$. Đảm bảo xe tải cao $7\text{m}$ chui lọt an toàn.
  3. `test_area_optimization_vertex`:
     - Hàm diện tích $S(x) = -2x^2 + 120x$.
     - Đạo hàm hoặc hoành độ đỉnh: $x = -\frac{b}{2a} = -\frac{120}{2(-2)} = 30\text{ m}$.
     - Diện tích cực đại $S(30) = 1800\text{ m}^2$.

### 10.2. Kiểm thử Động cơ Chấm điểm Phiếu học tập (Quiz Engine Tests)
- Kiểm tra tính toán điểm số chính xác theo 3 nhóm câu hỏi.
- Kiểm tra khả năng hiển thị đúng giải thích tương ứng với câu trả lời của học sinh.

### 10.3. Kiểm thử Khóa Logic Xuất bản 2 Lớp (Publishing Gate Tests)
- `test_cannot_publish_with_pending_criteria`: Nếu có bất kỳ tiêu chí nào `PENDING` hoặc `NEEDS_REVIEW`, hàm `canPublishLesson(lesson)` phải trả về `false`.
- `test_can_publish_only_when_100_percent_pass`: Trả về `true` khi và chỉ khi cả 8 tiêu chí thuộc 2 lớp đều đạt `PASS`.

---

## 11. KẾ HOẠCH TRIỂN KHAI PHẦN CỨNG & MÔI TRƯỜNG THỰC THI (DEPLOYMENT & STANDALONE DEMO)

- **Môi trường chạy:**
  - Nền tảng: Node.js v20+, npm 10+.
  - Không yêu cầu kết nối cơ sở dữ liệu cloud phức tạp; toàn bộ catalog được nạp sẵn từ `sampleLessons.ts` kết hợp đồng bộ `localStorage` cho bài học tự tạo mới.
  - Tương thích 100% khi chạy offline trên máy tính xách tay của giám khảo KHKT mà không cần internet (Web Speech API sử dụng giọng bản địa của trình duyệt Chrome/Safari/Edge).
- **Responsive Viewports:**
  - Hỗ trợ màn hình máy chiếu/Laptop giám khảo ($1920 \times 1080$, $1440 \times 900$).
  - Hỗ trợ màn hình máy tính bảng và điện thoại thông minh học sinh ($375\text{px} \to 768\text{px}$).

---
*Báo cáo được biên soạn và chuẩn hóa bởi Web App Architecture Explorer.*
