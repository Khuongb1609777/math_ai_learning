# Original User Request

## Initial Request — 2026-11-09T05:28:15Z

This is a single self-contained fix; keep it small and focused.
Sửa các lỗi giao diện và cập nhật điều hướng (Header, Showcase page, Collection Explorer, Lesson Player) phục vụ trình diễn đề án Khoa học Kỹ thuật (KHKT) cho ứng dụng học Toán thực tiễn tích hợp tiếng Anh (CLIL) lớp 10.

Working directory: /Users/mac/Desktop/math_english_ai_learn
Integrity mode: development

## Verification Resources
- Unit and adversarial test suites: `npm test` (bao gồm `tests/search_filter_adversarial.test.js`, `tests/modal_state_adversarial.test.js`, `tests/modal_deep_stress_adversarial.test.js`)
- E2E test runner: `node tests/e2e/runner.js`
- Reference screenshots: `media_1794200401668_df156d84.png`, `media_1794200401690_54c8f1aa.png`, `media_1794200403382_951a45e5.png`, `media_1794200444100_441c6955.png`, `media_1794200467631_f9b50139.png`

## Requirements

### R1. Sửa lỗi Logo và cập nhật Header navigation
Trong `src/components/Header.js`:
- Khắc phục lỗi logo thương hiệu ∑ bị bẹp/méo, đặt kích thước và tỉ lệ hiển thị vuông chuẩn 40x40px (`width: 40px; height: 40px; min-width: 40px; min-height: 40px; border-radius: 12px; aspect-ratio: 1 / 1; flex-shrink: 0; display: flex; align-items: center; justify-content: center;`).
- Bỏ toàn bộ icon trong các mục điều hướng ở header.
- Cập nhật 4 mục điều hướng: "Bài học" (data-nav="explore"), "Thực hành" (data-nav="player"), "Bài tập" (data-nav="quiz"), "Giới thiệu đề án" (data-nav="showcase").
- Gỡ bỏ hoàn toàn 2 mục "Khảo sát" (data-nav="survey") và "Biên soạn bài học" (data-nav="studio") trên cả Desktop nav và Mobile menu drawer.
- Đảm bảo tất cả unit test và adversarial test của Header tiếp tục pass.

### R2. Khắc phục lỗi hiển thị 'undefined' trên trang Giới thiệu đề án
Trong `src/components/KhktShowcasePage.js`:
- Sửa lỗi hiển thị text 'undefined' khi render 7 bước sư phạm (lặp qua `SEVEN_STEP_PEDAGOGY`).
- Chuẩn hóa việc truy xuất thuộc tính từ `src/data/khkt_data.js` (kiểm tra `title` vs `titleVi`, `description` vs `descriptionVi`, v.v.) và bổ sung giá trị dự phòng (fallback) để giao diện không bao giờ hiển thị chữ 'undefined'.

### R3. Canh trái card Hero và tối ưu hiển thị ảnh card bài học
Trong `src/components/CollectionExplorer.js`:
- Canh sát lề trái toàn bộ nội dung khối card DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT (`.explorer-hero`), loại bỏ auto-centering hoặc lệch margin bên phải (`text-left`, `items-start`).
- Tăng chiều cao vùng chứa hình ảnh của các card bài học (khoảng 230px - 240px). Đảm bảo hình ảnh hiển thị sắc nét, căn giữa, không bị méo (`object-fit: contain; max-height: 100%; max-width: 100%; width: auto; height: auto;`).
- Đảm bảo các huy hiệu (Toán 10, Độ khó, Thời lượng) được bố trí gọn gàng, không che khuất đồ họa chính của bài học.

### R4. Sửa lỗi cắt chữ huy hiệu phân cảnh Lesson Player
Trong `src/components/LessonPlayer.js`:
- Khắc phục lỗi vỡ/cắt chữ (text clipping) bên trong huy hiệu phân cảnh "Màn 1" (scene badge), căn chỉnh font-size, line-height và padding cho vừa vặn trong huy hiệu.

## Acceptance Criteria

### Header & Navigation
- [ ] Logo ∑ hiển thị đúng kích thước 40x40px, aspect-ratio 1:1, căn giữa hoàn hảo, không bị méo lệch hay bẹp theo chiều ngang/dọc.
- [ ] Header (desktop và mobile menu drawer) hiển thị đúng 4 mục điều hướng không chứa icon: "Bài học", "Thực hành", "Bài tập", "Giới thiệu đề án".
- [ ] Các mục "Khảo sát" và "Biên soạn" không còn hiển thị trên desktop header cũng như mobile drawer.
- [ ] Các bài test Header trong `tests/search_filter_adversarial.test.js`, `tests/modal_state_adversarial.test.js`, `tests/modal_deep_stress_adversarial.test.js` đạt 100% pass.

### Showcase Page
- [ ] Khối 7 bước sư phạm trong `KhktShowcasePage.js` hiển thị đầy đủ thông tin, không xuất hiện bất kỳ chuỗi 'undefined' nào trên giao diện.

### Collection Explorer
- [ ] Toàn bộ nội dung trong card DỰ ÁN KHKT 2026-2027 được canh sát lề trái hoàn chỉnh.
- [ ] Vùng chứa ảnh của card bài học có chiều cao khoảng 230-240px, ảnh rõ nét, giữ đúng tỷ lệ, căn giữa, không che lấp thông tin huy hiệu.

### Lesson Player
- [ ] Huy hiệu phân cảnh "Màn 1" hiển thị chữ đầy đủ, không bị cắt xén viền trên/dưới hay tràn lề.

### Automated Test Verification
- [ ] Lệnh `npm test` chạy thành công và đạt 100% pass across all tests.
- [ ] Lệnh `node tests/e2e/runner.js` chạy thành công và đạt 100% pass across all tests.
