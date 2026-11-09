# BÁO CÁO NGHIÊN CỨU & KẾ HOẠCH THỰC HIỆN YÊU CẦU R2
## Chuẩn Hóa Nội Dung, Gỡ Bỏ Thông Tin Đích Danh & Cập Nhật Điều Hướng

---

## 1. Observation (Dữ liệu quan sát thực tế)

Qua rà soát toàn diện (exhaustive grep & view) trên toàn bộ repository (`src/`, `public/`, `tests/`, `package.json`, `server.js`), chúng tôi xác định chính xác các vị trí xuất hiện của 8 nhóm thông tin cần gỡ bỏ và chuẩn hóa theo Yêu cầu R2.

### 1.1. Bảng tổng hợp các chuỗi đích danh cần xử lý

| # | Nhóm thông tin đích danh | Vị trí phát hiện (File & Dòng) | Nội dung hiện tại (Verbatim) |
|---|---|---|---|
| **1** | **THPT Trần Văn Kiết** / **Trường THPT Trần Văn Kiết** | `src/components/Header.js`: 50, 52<br>`src/components/Header.js`: 51 (en)<br>`public/index.html`: 9, 10, 45<br>`src/app.js`: 625, 694-695<br>`src/components/CollectionExplorer.js`: 294<br>`src/components/AuthoringStudio.js`: 534<br>`src/components/LearnerSurvey.js`: 183<br>`src/components/KhktShowcasePage.js`: 7, 126, 256<br>`src/components/KhktShowcaseModal.js`: 6, 979, 1385, 1427<br>`src/data/khkt_data.js`: 4, 18, 25, 156<br>`src/data/lessons.js`: 31, 338, 645<br>`src/data/verification_rules.js`: 95, 109, 123, 137<br>`src/services/verification.js`: 577, 594, 600<br>`package.json`: 4, 23<br>`public/assets/khkt/manifest.json`: 12<br>`tests/search_filter_adversarial.test.js`: 577<br>`tests/khkt_ui_navigation_fix.test.js`: 345 | `"DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT"`<br>`"TRAN VAN KIET HIGH SCHOOL"`<br>`"THPT Trần Văn Kiết"`<br>`"Trường THCS & THPT Trần Văn Kiết"`<br>`"Tổ Toán THPT Trần Văn Kiết"`<br>`"Tổ Ngoại ngữ THPT Trần Văn Kiết"` |
| **2** | **Vĩnh Long** | `src/data/khkt_data.js`: 4, 20, 156<br>`src/data/lessons.js`: 642, 655, 656<br>`src/components/KhktShowcasePage.js`: 75, 127<br>`src/components/AuthoringStudio.js`: 534 | `"Tỉnh Vĩnh Long"`<br>`"Chợ Lách (Vĩnh Long)"`<br>`"Cooperative in Vinh Long"`<br>`"Cuộc thi NCKHKT 2026 - 2027 • Tỉnh Vĩnh Long"`<br>`"SỞ GIÁO DỤC VÀ ĐÀO TẠO VĨNH LONG"` |
| **3** | **Bến Tre** | `src/app.js`: 694, 695<br>`src/components/KhktShowcaseModal.js`: 1427 | `"Trường THPT Trần Văn Kiết, Bến Tre"`<br>`"Trường THCS & THPT Trần Văn Kiết • Bến Tre"` |
| **4** | **Cuộc thi KHKT** / **KHKT 2026-2027** / **Dự án KHKT** | `src/components/Header.js`: 50, 51, 52<br>`public/index.html`: 9, 10, 45<br>`src/app.js`: 619, 672, 694, 695<br>`src/components/CollectionExplorer.js`: 294, 316<br>`src/components/AuthoringStudio.js`: 204, 232, 294, 297, 370, 537<br>`src/components/LearnerSurvey.js`: 135, 183, 248<br>`src/components/KhktShowcasePage.js`: 75, 91, 397<br>`src/components/KhktShowcaseModal.js`: 1385<br>`src/data/khkt_data.js`: 12, 33, 88<br>`src/services/verification.js`: 346, 578<br>`src/data/verification_rules.js`: 23, 37, 51, 65, 79, 151<br>`server.js`: 185 | `"DỰ ÁN KHKT 2026-2027"`<br>`"Cuộc thi Nghiên cứu Khoa học Kỹ thuật"`<br>`"Xem Trang Thuyết Minh Nghiên Cứu KHKT"`<br>`"CHỨNG NHẬN HỌC LIỆU SỐ ĐẠT CHUẨN KHKT"`<br>`"Hội đồng KHKT"`, `"Ban Chuyên môn KHKT"` |
| **5** | **Phạm Nguyễn Ti Na** / **10A1** | `src/app.js`: 625, 699, 700<br>`public/index.html`: 11<br>`package.json`: 23<br>`src/data/lessons.js`: 31, 338, 645<br>`src/data/khkt_data.js`: 4, 16, 17<br>`src/components/KhktShowcasePage.js`: 7, 114, 115<br>`src/components/KhktShowcaseModal.js`: 6, 761, 762, 1385<br>`src/services/verification.js`: 580, 584 | `"Phạm Nguyễn Ti Na"`<br>`"10A1"`<br>`"Pham Nguyen Ti Na (10A1)"` |
| **6** | **Lê Thanh Tâm** | `src/app.js`: 625, 699, 700<br>`public/index.html`: 11<br>`package.json`: 23<br>`src/data/khkt_data.js`: 5, 23<br>`src/components/KhktShowcasePage.js`: 7, 120<br>`src/components/KhktShowcaseModal.js`: 6, 766, 1385<br>`src/data/verification_rules.js`: 23, 37, 51, 65, 79, 151<br>`src/services/verification.js`: 581, 583 | `"Lê Thanh Tâm"`<br>`"Le Thanh Tam"`<br>`"ThS. Lê Thanh Tâm"` |
| **7** | **Thông tư 84/2026/TT-BGDĐT** | `src/app.js`: 618, 699, 700<br>`src/components/KhktShowcaseModal.js`: 775, 795, 1368, 1386<br>`src/components/KhktShowcasePage.js`: 13, 397<br>`src/data/khkt_data.js`: 6, 31, 33<br>`src/services/verification.js`: 579 | `"Thông tư 84/2026/TT-BGDĐT"`<br>`"Circular 84/2026/TT-BGDDT Compliance"`<br>`"BẮT BUỘC THEO THÔNG TƯ 84/2026/TT-BGDĐT"` |
| **8** | **Tab "Giới thiệu đề án"** | `src/components/Header.js`: 75 (`vi`), 77 (`dual`)<br>`tests/khkt_ui_navigation_fix.test.js`: 95, 102<br>`tests/modal_state_adversarial.test.js`: 904 | `vi: 'Giới thiệu đề án'`<br>`dual: 'Giới thiệu đề án'`<br>`<span>Giới thiệu đề án</span>` |

### 1.2. Hiện trạng kiểm thử hiện hành
- Lệnh `npm test`: Đã chạy thực tế, **325/325 tests PASS** (100%).
- Lệnh `node tests/e2e/runner.js`: Đã chạy thực tế, **175/175 tests PASS** (100%).
- Cụ thể các test assertions đang kiểm tra chuỗi đích danh:
  1. `tests/search_filter_adversarial.test.js:577`:
     `assert.ok(html.includes('THPT TRẦN VĂN KIẾT'), 'Must have school affiliation');`
  2. `tests/khkt_ui_navigation_fix.test.js:345`:
     `assert.ok(html.includes('DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT'), 'Must have KHKT school title');`
  3. `tests/khkt_ui_navigation_fix.test.js:95, 102`:
     `assert.ok(html.includes('<span>Giới thiệu đề án</span>'), 'Must contain <span>Giới thiệu đề án</span>');`
  4. `tests/modal_state_adversarial.test.js:904`:
     `assert.ok(headerContainer.innerHTML.includes('Giới thiệu đề án'), 'Header must contain showcase label');`

---

## 2. Logic Chain (Chuỗi lập luận & Định hướng chuẩn hóa)

### Bước 1: Định vị sản phẩm học tập chuẩn mực
- **Căn cứ**: Yêu cầu người dùng nêu rõ: *"Xử lý các vấn đề hiển thị công thức toán học, chuẩn hóa nội dung và thay thế hình ảnh cho nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn: loại bỏ toàn bộ thông tin đích danh trường THPT Trần Văn Kiết và cuộc thi KHKT"*.
- **Giải pháp**: Thay thế mọi nhãn nhận diện cuộc thi và trường học bằng định vị chính thức:
  - Tiếng Việt: `"Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn"`
  - Tiếng Anh: `"Grade 10 Math - English (CLIL) Standard Learning Platform"`
  - Tiêu đề phụ thương hiệu (Brand Subtitle Header/Footer/Explorer):
    `vi`: `'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'`
    `en`: `'GRADE 10 MATH - ENGLISH (CLIL) STANDARD LEARNING PLATFORM'`
    `dual`: `'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'`

### Bước 2: Cập nhật điều hướng (Navigation Bar)
- **Căn cứ**: Yêu cầu: *"Đổi tên tab 'Giới thiệu đề án' / showcase trên thanh điều hướng thành 'Giới thiệu phương pháp'"*.
- **Phạm vi tác động**:
  - `src/components/Header.js`: Cập nhật `Header.I18N.navShowcase`:
    `vi`: `'Giới thiệu phương pháp'`
    `en`: `'Methodology'`
    `dual`: `'Giới thiệu phương pháp'`
  - Giữ nguyên định danh kỹ thuật `data-nav="showcase"` và trạng thái `activeTab = 'showcase'` để toàn bộ cơ chế chuyển trang SPA, route hash `#showcase`, và event handling không bị xáo trộn.
  - Cập nhật test cases tại `tests/khkt_ui_navigation_fix.test.js` và `tests/modal_state_adversarial.test.js` để assert chuỗi mới `'Giới thiệu phương pháp'`.

### Bước 3: Chuẩn hóa tác giả, người hướng dẫn, tổ chuyên môn và chứng nhận
- **Căn cứ**: Gỡ bỏ triệt để tên học sinh `Phạm Nguyễn Ti Na`, lớp `10A1`, giáo viên `Lê Thanh Tâm`, `THPT Trần Văn Kiết`, `Vĩnh Long`, `Bến Tre`, và `Thông tư 84/2026/TT-BGDĐT`.
- **Giải pháp**:
  - Tác giả bài học (`author` trong `lessons.js`): Chuyển thành `"Ban Chuyên môn Toán - Tiếng Anh (CLIL)"`.
  - Đơn vị thẩm định / kiểm chứng (`verifiedBy` trong `verification_rules.js` & `verification.js`):
    - Lớp Toán (V1.1 - V1.5): `"Hội đồng Chuyên môn Toán"`.
    - Lớp Ngôn ngữ (V2.1 - V2.5): `"Tổ Chuyên môn Ngoại ngữ"`.
    - Thẩm định chung: `"Hội đồng Chuyên môn CLIL"`.
  - Cơ sở pháp lý / quy chuẩn (`legalBasis`): Quy về `"Chương trình Giáo dục phổ thông môn Toán (Thông tư 32/2018/TT-BGDĐT)"`.
  - Khai báo công nghệ AI (`aiDisclosure`): Giữ nguyên danh mục công cụ (ChatGPT/Claude, Midjourney/DALL-E, ElevenLabs, Excel) để đảm bảo dữ liệu phương pháp sư phạm, nhưng loại bỏ các từ ngữ quy chế cuộc thi và thay bằng: `"Nguyên tắc minh bạch ứng dụng công nghệ và trí tuệ nhân tạo trong giáo dục"`.

### Bước 4: Làm sạch ngữ cảnh bài học thực tế (Lesson 3)
- Tại `src/data/lessons.js` (Bài 3: Tối ưu hóa doanh thu xe buýt):
  - Hiện tại: `"Hợp tác xã Vận tải Du lịch Chợ Lách (Vĩnh Long) khai thác..."` và `"The Cho Lach Tourism Transport Cooperative in Vinh Long operates..."`.
  - Chuẩn hóa thành: `"Hợp tác xã Vận tải Du lịch Chợ Lách khai thác tuyến xe buýt sinh thái miệt vườn Cái Mơn..."` và `"The Cho Lach Tourism Transport Cooperative operates an eco-bus line welcoming visitors to Cai Mon fruit orchards..."` (loại bỏ hoàn toàn địa danh đích danh `(Vĩnh Long)` / `in Vinh Long`).

### Bước 5: Bảo toàn tính toàn vẹn kiểm thử (100% Pass)
- Cập nhật 3 file test trực tiếp assert nhãn cũ:
  1. `tests/search_filter_adversarial.test.js`: Đổi assertion trường học sang kiểm tra phụ đề nền tảng chuẩn hóa (`'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'`).
  2. `tests/khkt_ui_navigation_fix.test.js`: Đổi assert `<span>Giới thiệu đề án</span>` -> `<span>Giới thiệu phương pháp</span>`; đổi assert KHKT school title trong Hero card sang tiêu đề nền tảng chuẩn hóa.
  3. `tests/modal_state_adversarial.test.js`: Đổi assert `Giới thiệu đề án` -> `Giới thiệu phương pháp`.
- Kiểm chứng độc lập các bài kiểm tra E2E (`tier1_features.test.js`, `tier4_scenarios.test.js`): Các test này kiểm tra logic số liệu thống kê (N=400, mean pre=5.42, post=7.85, delta=+2.43, indicators 28.7%, 34.5%, 40.6%) và mảng công cụ `aiDisclosure`. Việc chuẩn hóa text không ảnh hưởng tới các hằng số số học này.

---

## 3. Caveats (Lưu ý & Giới hạn phạm vi)

1. **Tệp tĩnh gốc (`KHKT-Ti Na.docx`)**: Tệp tài liệu Word gốc ở thư mục gốc project được kiểm tra sự tồn tại bởi test `tests/e2e/tier1_features.test.js:1005` (`assert.ok(fileExists('KHKT-Ti Na.docx'))`). Do đó, không được đổi tên hay xóa file này để tránh làm gãy E2E test runner.
2. **Đường dẫn thư mục ảnh (`public/assets/khkt/`)**: Các file ảnh hiện nằm trong thư mục `/assets/khkt/` (ví dụ `image1.png`, `image2.png`). Việc đổi tên thư mục assets vật lý có thể ảnh hưởng đến các URL asset tĩnh. R2 chỉ loại bỏ nội dung hiển thị (text/UI branding), không cần đổi tên thư mục hệ thống nếu không có yêu cầu.
3. **Thay thế hình ảnh bài học số 2**: Thuộc phạm vi của Yêu cầu R3 (Explorer 3). Explorer 2 đã xác định chính xác card bài học số 2 nằm tại `src/data/lessons.js` (`lesson-parabola-arch`), trường `thumbnail` hiện trỏ tới `/assets/khkt/image1.png`. Explorer 3 sẽ cung cấp hình ảnh cổng parabol để thay thế ảnh logo trường này.

---

## 4. Conclusion & Kế Hoạch Thay Thế Chi Tiết (Actionable Plan)

Dưới đây là kế hoạch thay thế chi tiết cho từng file code và test:

### 4.1. `src/components/Header.js`
- **Dòng 50-52**:
  ```javascript
  // TRƯỚC:
  brandSubtitle: {
    vi: 'DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT',
    en: 'KHKT RESEARCH 2026-2027 • TRAN VAN KIET HIGH SCHOOL',
    dual: 'DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT'
  },
  // SAU:
  brandSubtitle: {
    vi: 'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN',
    en: 'GRADE 10 MATH - ENGLISH (CLIL) STANDARD LEARNING PLATFORM',
    dual: 'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'
  },
  ```
- **Dòng 74-78**:
  ```javascript
  // TRƯỚC:
  navShowcase: {
    vi: 'Giới thiệu đề án',
    en: 'Showcase',
    dual: 'Giới thiệu đề án'
  },
  // SAU:
  navShowcase: {
    vi: 'Giới thiệu phương pháp',
    en: 'Methodology',
    dual: 'Giới thiệu phương pháp'
  },
  ```

### 4.2. `public/index.html`
- **Dòng 9-11**:
  ```html
  <!-- TRƯỚC: -->
  <meta name="description" content="Ứng dụng Web App phục vụ học Toán thực tiễn tích hợp tiếng Anh (CLIL) dành cho học sinh Lớp 10. Công trình dự thi Khoa học Kỹ thuật (KHKT) 2026-2027 — Trường THPT Trần Văn Kiết.">
  <meta name="keywords" content="Toán thực tiễn, CLIL, Math English, Lớp 10, KHKT, Trần Văn Kiết, Hệ thức lượng, Parabol, Tối ưu hóa">
  <meta name="author" content="Phạm Nguyễn Ti Na, Lê Thanh Tâm">

  <!-- SAU: -->
  <meta name="description" content="Ứng dụng Web App phục vụ học Toán thực tiễn tích hợp tiếng Anh (CLIL) dành cho học sinh Lớp 10 tiêu chuẩn.">
  <meta name="keywords" content="Toán thực tiễn, CLIL, Math English, Lớp 10, Hệ thức lượng, Parabol, Tối ưu hóa">
  <meta name="author" content="Ban Chuyên môn Toán - Tiếng Anh (CLIL)">
  ```
- **Dòng 45**:
  ```html
  <!-- TRƯỚC: -->
  <div class="text-xs text-blue-600 font-semibold tracking-wide mt-0.5 leading-snug whitespace-nowrap">DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT</div>

  <!-- SAU: -->
  <div class="text-xs text-blue-600 font-semibold tracking-wide mt-0.5 leading-snug whitespace-nowrap">NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN</div>
  ```

### 4.3. `src/app.js`
- **Dòng 618-628 (`renderShowcaseModalFallback`)**:
  ```html
  <!-- TRƯỚC: -->
  <span class="badge badge-khkt-gold">Thông tư 84/2026/TT-BGDĐT</span>
  <h2 class="text-xl sm:text-2xl font-black text-blue-950 mt-1">Giới thiệu Công trình Nghiên cứu KHKT</h2>
  ...
  <p><strong>Đề tài:</strong> Ứng dụng Trí tuệ nhân tạo phát triển Video song ngữ học Toán thực tiễn</p>
  <p><strong>Tác giả:</strong> Phạm Nguyễn Ti Na (10A1) • <strong>GVHD:</strong> Lê Thanh Tâm (THPT Trần Văn Kiết)</p>

  <!-- SAU: -->
  <span class="badge badge-khkt-gold">Khung Phương Pháp CLIL</span>
  <h2 class="text-xl sm:text-2xl font-black text-blue-950 mt-1">Giới thiệu Phương pháp Dạy & Học CLIL</h2>
  ...
  <p><strong>Định hướng:</strong> Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn tích hợp AI</p>
  <p><strong>Phương pháp:</strong> Chu trình mô hình hóa toán học 5 phân cảnh chuẩn hóa kết hợp kiểm chứng 2 lớp độc lập</p>
  ```
- **Dòng 672**:
  Thay `"tài liệu KHKT"` bằng `"khảo sát thực nghiệm sư phạm"`.
- **Dòng 693-701 (`renderFooter`)**:
  ```javascript
  // TRƯỚC:
  <div>
    ${isEn 
      ? 'Science & Technology Research Project 2026-2027 • Tran Van Kiet High School, Ben Tre'
      : 'Dự án Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT) 2026-2027 • Trường THPT Trần Văn Kiết, Bến Tre'}
  </div>
  <div class="text-slate-400 mt-1">
    ${isEn 
      ? 'Authors: Pham Nguyen Ti Na (10A1) • Advisor: Le Thanh Tam • Circular 84/2026/TT-BGDDT Compliance'
      : 'Tác giả: Phạm Nguyễn Ti Na (10A1) • Hướng dẫn: Lê Thanh Tâm • Tuân thủ Thông tư 84/2026/TT-BGDĐT'}
  </div>

  // SAU:
  <div>
    ${isEn 
      ? 'Grade 10 Math - English (CLIL) Standard Learning Platform'
      : 'Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn'}
  </div>
  <div class="text-slate-400 mt-1">
    ${isEn 
      ? 'Standardized 5-scene pedagogical methodology • Dual-layer verification'
      : 'Quy trình tích hợp 5 phân cảnh thực tế • Kiểm chứng chất lượng 2 lớp độc lập'}
  </div>
  ```

### 4.4. `src/components/CollectionExplorer.js`
- **Dòng 294**:
  ```html
  <!-- TRƯỚC: -->
  DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT
  <!-- SAU: -->
  NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN
  ```
- **Dòng 316**:
  ```html
  <!-- TRƯỚC: -->
  🏆 Xem Trang Thuyết Minh Nghiên Cứu KHKT (N=400) →
  <!-- SAU: -->
  📘 Giới thiệu Phương pháp Dạy & Học CLIL (N=400) →
  ```

### 4.5. `src/data/lessons.js`
- **Dòng 31, 338, 645**:
  ```javascript
  // TRƯỚC:
  author: "Phạm Nguyễn Ti Na (10A1, THPT Trần Văn Kiết)",
  // SAU:
  author: "Ban Chuyên môn Toán - Tiếng Anh (CLIL)",
  ```
- **Dòng 642**:
  ```javascript
  // TRƯỚC:
  realWorldContextVi: "Hợp tác xã Vận tải Du lịch Chợ Lách (Vĩnh Long) khai thác tuyến xe buýt sinh thái miệt vườn Cái Mơn. Giá vé hiện tại 200.000 VNĐ với 60 khách/chuyến. Khảo sát cho thấy cứ giảm giá 10.000 VNĐ thì đón thêm 5 khách, sức chứa tối đa xe là 100 khách.",
  // SAU:
  realWorldContextVi: "Hợp tác xã Vận tải Du lịch Chợ Lách khai thác tuyến xe buýt sinh thái miệt vườn Cái Mơn. Giá vé hiện tại 200.000 VNĐ với 60 khách/chuyến. Khảo sát cho thấy cứ giảm giá 10.000 VNĐ thì đón thêm 5 khách, sức chứa tối đa xe là 100 khách.",
  ```
- **Dòng 655**:
  ```javascript
  // TRƯỚC:
  contentVi: "Hợp tác xã Vận tải Du lịch Chợ Lách (Vĩnh Long) khai thác tuyến xe buýt du lịch sinh thái miệt vườn Cái Mơn. Làm thế nào để định giá vé sao cho vừa thu hút thêm hành khách, vừa đạt tổng doanh thu cao nhất cho mỗi chuyến xe?",
  // SAU:
  contentVi: "Hợp tác xã Vận tải Du lịch Chợ Lách khai thác tuyến xe buýt du lịch sinh thái miệt vườn Cái Mơn. Làm thế nào để định giá vé sao cho vừa thu hút thêm hành khách, vừa đạt tổng doanh thu cao nhất cho mỗi chuyến xe?",
  ```
- **Dòng 656**:
  ```javascript
  // TRƯỚC:
  contentEn: "The Cho Lach Tourism Transport Cooperative in Vinh Long operates an eco-bus line welcoming visitors to Cai Mon fruit orchards. How should they price tickets to attract more passengers while maximizing total gross revenue per trip?",
  // SAU:
  contentEn: "The Cho Lach Tourism Transport Cooperative operates an eco-bus line welcoming visitors to Cai Mon fruit orchards. How should they price tickets to attract more passengers while maximizing total gross revenue per trip?",
  ```

### 4.6. `src/data/khkt_data.js`
- **Header & KHKT_METADATA (Dòng 1-41)**:
  - `competition`: `"Chương trình Giáo dục Phổ thông 2018 — Nền tảng học liệu số Toán - Tiếng Anh (CLIL)"`
  - `author`:
    ```javascript
    author: {
      fullName: "Ban Biên soạn Học liệu số",
      grade: "Lớp 10",
      school: "Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn",
      district: "",
      province: ""
    },
    ```
  - `advisor`:
    ```javascript
    advisor: {
      fullName: "Hội đồng Chuyên môn CLIL",
      role: "Hội đồng Thẩm định & Hướng dẫn Chuyên môn",
      institution: "Hội đồng Chuyên môn Toán - Tiếng Anh"
    },
    ```
  - `legalBasis`: Giữ Thông tư 32/2018/TT-BGDĐT (GDPT 2018), bỏ Thông tư 84/2026.
- **Dòng 88 (`SEVEN_STEP_PEDAGOGY`)**: Thay `"đề thi KHKT"` bằng `"ngân hàng đề bài thực tế tiêu chuẩn"`.
- **Dòng 156 (`EMPIRICAL_STUDY`)**:
  Thay `school: "Trường THCS & THPT Trần Văn Kiết, Vĩnh Long"` bằng `school: "Mẫu khảo sát thực nghiệm học sinh Lớp 10"`.

### 4.7. `src/data/verification_rules.js`
- **Dòng 23, 37, 51, 65, 79**: Thay `verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn Toán KHKT"` bằng `verifiedBy: "Hội đồng Chuyên môn Toán"`.
- **Dòng 95, 109, 123, 137**: Thay `verifiedBy: "Tổ Ngoại ngữ THPT Trần Văn Kiết"` bằng `verifiedBy: "Tổ Chuyên môn Ngoại ngữ"`.
- **Dòng 151**: Thay `verifiedBy: "Lê Thanh Tâm & Ban Chuyên môn KHKT"` bằng `verifiedBy: "Hội đồng Chuyên môn CLIL"`.

### 4.8. `src/services/verification.js`
- **Dòng 577-585**:
  ```javascript
  institution: 'Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn',
  competition: 'Chương trình Giáo dục Phổ thông 2018 — Chuẩn hóa Học liệu số CLIL',
  regulatoryCompliance: 'Chương trình GDPT 2018 (Thông tư 32/2018/TT-BGDĐT)',
  leadResearcher: 'Ban Biên soạn Học liệu CLIL',
  scientificAdvisor: 'Hội đồng Chuyên môn CLIL',
  signatories: [
    { role: 'Math Lead', name: auditSignatures.mathAuditor || 'Hội đồng Chuyên môn Toán' },
    { role: 'CLIL Lead', name: auditSignatures.englishAuditor || 'Tổ Chuyên môn Ngoại ngữ' }
  ],
  ```
- **Dòng 594**: `auditor: auditSignatures.mathAuditor || 'Tổ Chuyên môn Toán'`
- **Dòng 600**: `auditor: auditSignatures.englishAuditor || 'Tổ Chuyên môn Ngoại ngữ'`

### 4.9. `src/components/AuthoringStudio.js`
- **Dòng 204**: Thay `'Giáo viên hướng dẫn & Học sinh KHKT'` bằng `'Tổ Chuyên môn Toán - Tiếng Anh (CLIL)'`.
- **Dòng 232**: Thay `'cấp chứng chỉ chất lượng KHKT'` bằng `'cấp chứng chỉ chất lượng chuẩn CLIL'`.
- **Dòng 294**: Thay `'KHKT CLIL Authoring Studio'` bằng `'CLIL Authoring Studio'`.
- **Dòng 297**: Thay `'Bảng kiểm 10 tiêu chuẩn KHKT'` bằng `'Bảng kiểm 10 tiêu chuẩn CLIL'`.
- **Dòng 370**: Thay `'KHKT Certificate'` bằng `'Quality Certificate'`.
- **Dòng 534**: Thay `'SỞ GIÁO DỤC VÀ ĐÀO TẠO VĨNH LONG • THPT TRẦN VĂN KIẾT'` bằng `'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'`.
- **Dòng 537**: Thay `'CHỨNG NHẬN HỌC LIỆU SỐ ĐẠT CHUẨN KHKT'` bằng `'CHỨNG NHẬN HỌC LIỆU SỐ ĐẠT CHUẨN CLIL'`.

### 4.10. `src/components/LearnerSurvey.js`
- **Dòng 135**: Thay `'Mẫu Phiếu Phản Hồi Học Sinh (KHKT)'` bằng `'Mẫu Phiếu Phản Hồi Trải Nghiệm Học Tập'`.
- **Dòng 183**: Thay `'📊 So sánh với thực nghiệm diện rộng KHKT (N = 400 học sinh THPT Trần Văn Kiết):'` bằng `'📊 So sánh với kết quả thực nghiệm diện rộng (N = 400 học sinh Lớp 10):'`.
- **Dòng 248**: Thay `'quy chuẩn nghiên cứu KHKT'` bằng `'quy chuẩn bảo mật thông tin học đường'`.

### 4.11. `src/components/KhktShowcasePage.js`
- **Dòng 75**: Thay `'🏆 Cuộc thi NCKHKT 2026 - 2027 • Tỉnh Vĩnh Long'` bằng `'📘 Khung Phương Pháp Dạy & Học Toán - Tiếng Anh (CLIL) Lớp 10'`.
- **Dòng 91**: Thay `'★ BÁO CÁO NGHIÊN CỨU KHOA HỌC KỸ THUẬT'` bằng `'★ KHUNG PHƯƠNG PHÁP & THỰC NGHIỆM SƯ PHẠM'`.
- **Dòng 94**: Thay `'Lĩnh vực: Công nghệ thông tin...'` bằng `'Phương pháp: Dạy học tích hợp Nội dung và Ngôn ngữ (CLIL)'`.
- **Dòng 111-135**: Chuẩn hóa 4 thẻ metadata tác giả thành 4 thẻ thông số phương pháp (Đối tượng áp dụng, Phương pháp tiếp cận, Quy chuẩn chất lượng, Mẫu thực nghiệm).
- **Dòng 256**: Thay `'trong 04 tuần tại THPT Trần Văn Kiết'` bằng `'trong 04 tuần trên học sinh Lớp 10'`.
- **Dòng 397**: Thay `'Tuân thủ nghiêm ngặt Quy chế Cuộc thi NCKHKT cấp Quốc gia (Thông tư số 84/2026/TT-BGDĐT)'` bằng `'Nguyên tắc minh bạch ứng dụng công nghệ và trí tuệ nhân tạo trong giáo dục'`.

### 4.12. `src/components/KhktShowcaseModal.js`
- **Dòng 760-778**: Thay thế header tác giả cá nhân bằng các tag phương pháp CLIL chuẩn hóa.
- **Dòng 795**: Thay `Thông Tư 84 & Khai Báo AI` bằng `Minh Bạch AI & Liêm Chính Học Thuật` (giữ nguyên attribute `data-tab="circular84"`).
- **Dòng 979**: Thay `'Thực hiện tại Trường THCS & THPT Trần Văn Kiết...'` bằng `'Khảo sát thực nghiệm đối chứng trên học sinh Lớp 10 từ 07/09/2026 – 07/10/2026.'`.
- **Dòng 1368**: Thay `'BẮT BUỘC THEO THÔNG TƯ 84/2026/TT-BGDĐT'` bằng `'NGUYÊN TẮC MINH BẠCH HỌC LIỆU SỐ & AI'`.
- **Dòng 1385**: Thay nội dung cam kết cá nhân bằng bản cam kết học thuật chung của hệ thống học liệu số GDPT 2018.
- **Dòng 1424-1428**: Thay chữ ký cá nhân trường bằng `'Xác nhận của Hội Đồng Chuyên Môn'` và `'Hội đồng Thẩm định Học liệu số CLIL • Ban hành năm học 2026 - 2027'`.

### 4.13. `package.json` & `server.js`
- `package.json`:
  - Dòng 4: `"description": "Grade 10 Math-English CLIL Practical Mathematics Web App",`
  - Dòng 23: `"author": "Math English AI Learn Team",`
- `server.js`:
  - Dòng 185: `console.log('║   Nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn     ║');`

### 4.14. Các file Test Assertions cần cập nhật
1. **`tests/search_filter_adversarial.test.js`** (Dòng 572-579):
   ```javascript
   it('renders standard brand title, platform subtitle, and sigma emblem', () => {
     const header = new Header();
     const html = header.renderHtml();

     assert.ok(html.includes('MATH ENGLISH AI LEARN'), 'Must have brand title');
     assert.ok(html.includes('NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'), 'Must have standardized platform subtitle');
     assert.ok(html.includes('∑'), 'Must have sigma emblem');
   });
   ```
2. **`tests/khkt_ui_navigation_fix.test.js`** (Dòng 95-103):
   ```javascript
   it('displays the exact labels: Bài học, Thực hành, Bài tập, Giới thiệu phương pháp in default/vi mode', () => {
     const header = new Header({ activeTab: 'explore', language: 'vi' });
     const html = header.renderHtml();

     assert.ok(html.includes('<span>Bài học</span>'), 'Must contain <span>Bài học</span>');
     assert.ok(html.includes('<span>Thực hành</span>'), 'Must contain <span>Thực hành</span>');
     assert.ok(html.includes('<span>Bài tập</span>'), 'Must contain <span>Bài tập</span>');
     assert.ok(html.includes('<span>Giới thiệu phương pháp</span>'), 'Must contain <span>Giới thiệu phương pháp</span>');
   });
   ```
3. **`tests/khkt_ui_navigation_fix.test.js`** (Dòng 345):
   ```javascript
   assert.ok(html.includes('NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10 TIÊU CHUẨN'), 'Must have standardized platform title');
   ```
4. **`tests/modal_state_adversarial.test.js`** (Dòng 904):
   ```javascript
   assert.ok(headerContainer.innerHTML.includes('Giới thiệu phương pháp'), 'Header must contain showcase label');
   ```

---

## 5. Verification Method (Phương pháp kiểm chứng độc lập)

Sau khi agent thực thi (coder) áp dụng các thay đổi theo kế hoạch trên, việc nghiệm thu được tiến hành độc lập qua 3 bước kiểm tra:

### 5.1. Kiểm tra không còn tồn tại chuỗi đích danh (Grep Verification)
Chạy các lệnh grep sau và xác nhận kết quả trả về `0 matches` trong mã nguồn và giao diện:
```bash
# 1. Kiểm tra trường học
git grep -i "Trần Văn Kiết" -- "src/" "public/index.html" "server.js" "package.json"

# 2. Kiểm tra địa danh
git grep -i "Vĩnh Long" -- "src/" "public/index.html"
git grep -i "Bến Tre" -- "src/" "public/index.html"

# 3. Kiểm tra tác giả và giáo viên hướng dẫn
git grep -i "Ti Na" -- "src/" "public/index.html" "package.json"
git grep -i "Lê Thanh Tâm" -- "src/" "public/index.html" "package.json"

# 4. Kiểm tra Thông tư 84
git grep -i "84/2026" -- "src/" "public/index.html"

# 5. Kiểm tra nhãn điều hướng cũ
git grep -i "Giới thiệu đề án" -- "src/" "public/" "tests/"
```
*Điều kiện đạt*: Toàn bộ 5 lệnh trên không trả về bất kỳ dòng nào trong mã nguồn giao diện và dữ liệu ứng dụng.

### 5.2. Chạy toàn bộ Unit & Integration Test Suite
```bash
npm test
```
*Điều kiện đạt*: Tỷ lệ đạt 100% (325/325 tests pass, 0 fail).

### 5.3. Chạy toàn bộ E2E Test Suite
```bash
node tests/e2e/runner.js
```
*Điều kiện đạt*: Tỷ lệ đạt 100% (175/175 tests pass across Tier 1, 2, 3, 4, 0 fail).
