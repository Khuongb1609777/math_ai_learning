Tập hợp thành viên đội. Xử lý các vấn đề hiển thị công thức toán học, chuẩn hóa nội dung và thay thế hình ảnh cho nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn: sửa các ký hiệu toán học bị lỗi render, loại bỏ toàn bộ thông tin đích danh trường THPT Trần Văn Kiết và cuộc thi KHKT, đổi tên tab điều hướng thành "Giới thiệu phương pháp", và thay ảnh logo trường bằng ảnh mô phỏng kiến trúc cổng vòm/parabol.

Working directory: /Users/mac/Desktop/math_english_ai_learn
Integrity mode: development

## Verification Resources
- Unit test suite: `npm test`
- E2E test runner: `node tests/e2e/runner.js`
- Reference image: `media_1794232598708_d003594b.png`

## Requirements

### R1. Sửa lỗi render ký hiệu và công thức toán học
Kiểm tra và xử lý triệt để các ký hiệu và công thức toán học bị lỗi hiển thị (ví dụ: `^\circ`, `\widehat{CBD} = 63^\circ`, `\text{ m}`, `C \text{ is inaccessible (không thể tiếp cận)}`). Đảm bảo công thức toán học được render sạch sẽ, đúng chuẩn, dễ đọc và không hiển thị raw LaTeX code lỗi ra màn hình cho người học.

### R2. Chuẩn hóa nội dung, gỡ bỏ thông tin đích danh và cập nhật điều hướng
Gỡ bỏ hoàn toàn mọi thông tin liên quan tới: Trường THPT Trần Văn Kiết, Vĩnh Long, Bến Tre; Dự án Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT) 2026-2027; Tác giả Phạm Nguyễn Ti Na (10A1), Hướng dẫn Lê Thanh Tâm; Tuân thủ Thông tư 84/2026/TT-BGDĐT.
Viết lại nội dung chung chung theo hướng sản phẩm/nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn, không chỉ rõ cuộc thi hay đích danh cá nhân/trường học nào.
Đổi tên tab "Giới thiệu đề án" / showcase trên thanh điều hướng thành "Giới thiệu phương pháp".

### R3. Thay thế ảnh logo trường bằng ảnh mô phỏng bài toán
Gỡ bỏ hoàn toàn hình ảnh logo trường THPT Trần Văn Kiết. Tại card bài học số 2 ("Cổng chào Parabol và Giới hạn chiều cao xe tải"), thay thế hình ảnh logo trường bằng hình ảnh đồ họa mô phỏng kiến trúc cổng vòm / cầu parabol phù hợp với bài toán thực tế.

### R4. Bảo toàn tính toàn vẹn hệ thống kiểm thử
Duy trì tỷ lệ đạt 100% khi chạy toàn bộ test suite (`npm test` và `node tests/e2e/runner.js`). Cập nhật các test assertion tương ứng nếu có thay đổi về nhãn điều hướng hoặc nội dung đã chuẩn hóa.

## Acceptance Criteria

### Math Rendering
- [ ] Mọi công thức và ký hiệu toán học (bao gồm `^\circ`, `\widehat{CBD}`, `\text{ m}`, các chuỗi text lồng trong công thức) được render sạch sẽ, đúng định dạng toán học, dễ đọc cho người học.
- [ ] Không hiển thị raw LaTeX code lỗi (như `^\circ`, `\text{...}`) ra giao diện người dùng.

### Generic Content & Branding
- [ ] Không còn xuất hiện các cụm từ "THPT Trần Văn Kiết", "Trường THPT Trần Văn Kiết", "Vĩnh Long", "Bến Tre", "Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT) 2026-2027", "Phạm Nguyễn Ti Na", "Lê Thanh Tâm", "Thông tư 84/2026/TT-BGDĐT" trên toàn bộ giao diện và dữ liệu ứng dụng.
- [ ] Nội dung giới thiệu thể hiện đúng định vị nền tảng học tập Toán - Tiếng Anh (CLIL) Lớp 10 tiêu chuẩn.
- [ ] Tab điều hướng trên Header (cả desktop và mobile menu) hiển thị tên "Giới thiệu phương pháp" thay cho "Giới thiệu đề án".

### Visual Assets & Simulation Image
- [ ] Không còn hiển thị logo trường THPT Trần Văn Kiết trên bất kỳ thành phần nào của giao diện.
- [ ] Card bài học số 2 ("Cổng chào Parabol và Giới hạn chiều cao xe tải") hiển thị ảnh mô phỏng kiến trúc cổng vòm/cầu parabol trực quan thay thế cho logo trường.

### Automated Test Verification
- [ ] Lệnh `npm test` thực thi thành công với tỷ lệ pass 100%.
- [ ] Lệnh `node tests/e2e/runner.js` thực thi thành công với tỷ lệ pass 100%.
