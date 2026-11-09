# Handoff Report — std_explorer_3 (R3 & R4 Investigation)

## 1. Observation

### R3: Trường THPT Trần Văn Kiết Logo & Lesson 2 Parabolic Arch Simulation
- **Current School Logo Asset**:
  - `public/assets/khkt/image1.png` (and symlink/alias `public/assets/khkt/khkt_logo.png`, `dist/assets/khkt/image1.png`):
    - Verified directly via `view_file`: The image is a circular school emblem containing the text `"TRƯỜNG THCS & THPT TRẦN VĂN KIẾT - VĨNH LONG"` surrounding an open book, flame, and waves.
    - File dimensions: 1280x1280 pixels, size: 1,521,465 bytes, SHA-256: `dfa9952cc5cf576a8d32e67b46fb34f2560634a4271e0d4519b3a0536c31f61b` (recorded in `public/assets/khkt/manifest.json` lines 6-17).
- **Lesson 2 Card Image Specification**:
  - In `src/data/lessons.js` line 334:
    ```javascript
    id: "lesson-parabolic-arch",
    ...
    thumbnail: "/assets/khkt/image1.png",
    ```
    This directly renders the school logo crest inside Card #2 ("Cổng chào Parabol và Giới hạn chiều cao xe tải") in the collection explorer.
  - In `src/components/CollectionExplorer.js` line 469 & line 484:
    ```javascript
    const thumbnailSrc = lesson.thumbnail || '/assets/khkt/image1.png';
    ...
    onerror="this.onerror=null; this.src='/assets/khkt/image1.png';"
    ```
  - In `src/components/AuthoringStudio.js` line 54:
    ```javascript
    thumbnail: '/assets/khkt/image1.png',
    ```
  - In `src/data/khkt_data.js` line 293:
    ```javascript
    path: "/assets/khkt/image1.png",
    nameVi: "Hình 1. Sơ đồ Cổng vòm Parabol & Xe tải",
    ```
- **Reference Image `media_1794232598708_d003594b.png`**:
  - Corresponds to the user-uploaded reference prompt asset representing a 2D/3D architectural simulation graphic of the parabolic entrance arch ($L = 8\text{ m}$, apex $H = 6\text{ m}$, equation $y = -\frac{3}{8}x^2 + 6$) with a box truck ($w = 4\text{ m}$, $h_0 = 4.2\text{ m}$, clearance margin $+0.300\text{ m}$).
  - A clean, dedicated visual simulation graphic (SVG or high-res PNG) matching this exact real-world problem should be placed in `public/assets/khkt/parabolic_arch.png` (and replace `image1.png` content to ensure no stale school logo remains anywhere in the app).

---

### R4: Test Suite Integrity & Dependent Assertions
- **Current Test Suite Baseline**:
  - Unit tests (`npm test`): **325 passed, 0 failed, 75 test suites** (100% pass rate).
  - E2E tests (`node tests/e2e/runner.js`): **175 passed, 0 failed** across Tiers 1–4 and Features F1–F16 (100% pass rate).
  - Build script (`node build.js`): **Passed cleanly** (validates 10 critical artifacts in `dist/`).
- **Direct Test Assertions depending on Old Strings & Assets**:
  1. **`tests/khkt_ui_navigation_fix.test.js`**:
     - Line 95 & Line 102:
       ```javascript
       // Line 95
       it('displays the exact labels: Bài học, Thực hành, Bài tập, Giới thiệu đề án in default/vi mode', () => {
       ...
       // Line 102
       assert.ok(html.includes('<span>Giới thiệu đề án</span>'), 'Must contain <span>Giới thiệu đề án</span>');
       ```
       *Failure Risk*: Header change to "Giới thiệu phương pháp" will fail line 102.
     - Line 345:
       ```javascript
       assert.ok(html.includes('DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT'), 'Must have KHKT school title');
       ```
       *Failure Risk*: Removing school name from CollectionExplorer hero badge will fail line 345.
  2. **`tests/modal_state_adversarial.test.js`**:
     - Line 904:
       ```javascript
       assert.ok(headerContainer.innerHTML.includes('Giới thiệu đề án'), 'Header must contain showcase label');
       ```
       *Failure Risk*: Header change to "Giới thiệu phương pháp" will fail line 904.
  3. **`tests/search_filter_adversarial.test.js`**:
     - Line 572 & Line 577:
       ```javascript
       it('renders KHKT brand title, school affiliation, and sigma emblem', () => {
         const header = new Header();
         const html = header.renderHtml();
         assert.ok(html.includes('MATH ENGLISH AI LEARN'), 'Must have brand title');
         assert.ok(html.includes('THPT TRẦN VĂN KIẾT'), 'Must have school affiliation');
         assert.ok(html.includes('∑'), 'Must have sigma emblem');
       });
       ```
       *Failure Risk*: Removing `THPT TRẦN VĂN KIẾT` from `Header.js` `brandSubtitle` will fail line 577.
  4. **`tests/collection_explorer_deep_adversarial.test.js`**:
     - Line 300:
       ```javascript
       const expectedAssets = {
         'lesson-lighthouse': '/assets/khkt/image2.png',
         'lesson-parabolic-arch': '/assets/khkt/image1.png',
         'lesson-bus-optimization': '/assets/khkt/image3.png',
       };
       ```
       *Failure Risk*: If `lesson-parabolic-arch` thumbnail is updated to `/assets/khkt/parabolic_arch.png`, line 300 must be updated accordingly.
     - Line 345:
       ```javascript
       assert.ok(cardHtml.includes(`onerror="this.onerror=null; this.src='/assets/khkt/image1.png';"`), 'Must have onerror fallback');
       ```
       *Failure Risk*: Must align with fallback defined in `CollectionExplorer.js`.
  5. **`tests/e2e/tier1_features.test.js`**:
     - Line 1004-1005: Asserts `KHKT-Ti Na.docx` exists in project root.
     - Line 1014-1019: Asserts `extracted_doc.txt` exists and contains "Hình 1. Sơ đồ...", etc.
     *Observation*: Root research files `KHKT-Ti Na.docx` and `extracted_doc.txt` must be kept intact so E2E test runner remains 100% pass.

---

## 2. Logic Chain

1. **R3 Image Replacement Rationale**:
   - The user request explicitly demands:
     `"Gỡ bỏ hoàn toàn hình ảnh logo trường THPT Trần Văn Kiết. Tại card bài học số 2 ("Cổng chào Parabol và Giới hạn chiều cao xe tải"), thay thế hình ảnh logo trường bằng hình ảnh đồ họa mô phỏng kiến trúc cổng vòm / cầu parabol phù hợp với bài toán thực tế."`
   - Card #2 gets its image from `DEFAULT_LESSONS[1].thumbnail` (`/assets/khkt/image1.png`).
   - If we replace `public/assets/khkt/image1.png` content with an authentic high-resolution parabolic arch & clearance simulation diagram, any component referencing `/assets/khkt/image1.png` will immediately show the correct architectural math diagram instead of the school crest.
   - In addition, creating `public/assets/khkt/parabolic_arch.png` and updating `thumbnail: "/assets/khkt/parabolic_arch.png"` in `src/data/lessons.js` (and updating `tests/collection_explorer_deep_adversarial.test.js` line 300) guarantees semantic clarity while eliminating all school logo rendering.
   - For `build.js` line 60, `path.join(DIST_DIR, 'assets', 'khkt', 'image1.png')` will continue to pass because `image1.png` exists (with new visual content).

2. **R4 Test Suite Preservation Rationale**:
   - The user request explicitly states:
     `"Duy trì tỷ lệ đạt 100% khi chạy toàn bộ test suite (npm test và node tests/e2e/runner.js). Cập nhật các test assertion tương ứng nếu có thay đổi về nhãn điều hướng hoặc nội dung đã chuẩn hóa."`
   - Therefore, updating the test assertions in `tests/khkt_ui_navigation_fix.test.js`, `tests/modal_state_adversarial.test.js`, `tests/search_filter_adversarial.test.js`, and `tests/collection_explorer_deep_adversarial.test.js` to match the standardized strings and updated asset paths is not only permitted, it is strictly required to preserve 100% test integrity.

---

## 3. Caveats

- `KHKT-Ti Na.docx` and `extracted_doc.txt` in the root workspace directory are tested by E2E test F15.2 and F15.4 (`tests/e2e/tier1_features.test.js`). They should NOT be deleted or renamed.
- When generating or placing the new parabolic arch graphic, ensure it is copied to both `public/assets/khkt/` and `dist/assets/khkt/` (or rebuilt via `node build.js`).
- The image aspect ratio in `CollectionExplorer.js` is rendered within `height: 235px` with `object-fit: contain; background-color: #0f172a`. A dark or transparent high-contrast mathematical diagram with dimensions around 1200x800 or 1280x1280 will display sharp and centered.

---

## 4. Conclusion

- **R3 Implementation Blueprint**:
  1. Create the new parabolic arch architectural simulation graphic:
     - Illustrating: Parabolic arch $y = -\frac{3}{8}x^2 + 6$ with $L = 8\text{m}$, apex $H = 6\text{m}$, box truck $w = 4\text{m}$, $h = 4.2\text{m}$, clearance $+0.300\text{m}$.
     - Save as `public/assets/khkt/parabolic_arch.png` and also overwrite `public/assets/khkt/image1.png` and `public/assets/khkt/khkt_logo.png` so no school logo remains in any asset file.
  2. In `src/data/lessons.js` line 334:
     - Update `thumbnail: "/assets/khkt/parabolic_arch.png"` (or `"/assets/khkt/image1.png"`).
  3. In `src/components/CollectionExplorer.js` line 469 and 484:
     - Update fallback thumbnail to `/assets/khkt/parabolic_arch.png`.
  4. In `src/components/AuthoringStudio.js` line 54:
     - Update default template thumbnail to `/assets/khkt/parabolic_arch.png`.
  5. In `src/data/khkt_data.js` lines 290-297:
     - Update caption and path for `image1` to reference the Parabolic Arch simulation graphic.

- **R4 Test Suite Updates Blueprint**:
  1. `tests/khkt_ui_navigation_fix.test.js`:
     - Line 95: change description to `...Giới thiệu phương pháp...`
     - Line 102: change assertion to `assert.ok(html.includes('<span>Giới thiệu phương pháp</span>'));`
     - Line 345: change assertion to match new standardized header banner text (e.g. `NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10`).
  2. `tests/modal_state_adversarial.test.js`:
     - Line 904: change assertion to `assert.ok(headerContainer.innerHTML.includes('Giới thiệu phương pháp'));`
  3. `tests/search_filter_adversarial.test.js`:
     - Line 572 & 577: change assertion from checking `'THPT TRẦN VĂN KIẾT'` to checking the updated standardized subtitle (e.g. `'NỀN TẢNG HỌC TẬP TOÁN - TIẾNG ANH (CLIL) LỚP 10'`).
  4. `tests/collection_explorer_deep_adversarial.test.js`:
     - Line 300: update expected thumbnail for `lesson-parabolic-arch` if set to `/assets/khkt/parabolic_arch.png`.
     - Line 345: align fallback onerror check if updated in `CollectionExplorer.js`.

---

## 5. Verification Method

To independently verify after worker execution:
1. **Unit Tests**:
   ```bash
   npm test
   ```
   Must pass 325/325 tests (0 failures).
2. **E2E Tests**:
   ```bash
   node tests/e2e/runner.js
   ```
   Must pass 175/175 tests (0 failures).
3. **Build Script & Module Integrity**:
   ```bash
   node build.js
   ```
   Must exit code 0 and output valid bundle to `dist/`.
4. **Branding & Logo Absence Verification**:
   ```bash
   grep -ri "Trần Văn Kiết" src/ public/index.html
   ```
   Must return 0 occurrences in user-facing application source code.
5. **Visual Inspection**:
   - Inspect Card #2 in Collection Explorer: ensure the parabolic arch simulation graphic is rendered cleanly and no school logo is shown.
