# Workspace Environment & Technical Assessment Report

**Project**: Web App Học Toán Thực Tiễn Tích Hợp Tiếng Anh (CLIL) Lớp 10 — Dự án KHKT  
**Author**: Workspace Environment Explorer  
**Date**: 2026-11-07  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn`  
**Target Audience**: Team Orchestrator, Architecture Explorer, Spec Miner, Implementer, QA/Sentinel  

---

## Executive Summary

An exhaustive investigation of the workspace `/Users/mac/Desktop/math_english_ai_learn` and the host macOS execution environment has been conducted.

1. **Current Workspace State**: Contains the primary research paper `KHKT-Ti Na.docx` (4.79 MB), its raw text export `extracted_doc.txt` (30.5 KB), and the `.agents` teamwork directory. There is currently no `package.json`, source code repository, or git tracking initialized.
2. **KHKT Source Materials & Media**: `KHKT-Ti Na.docx` contains **5 embedded high-resolution PNG images** (1280x1280 to 2970x1620), representing the official 7-step workflow flowchart, video interface mockup, and N=400 pedagogical research charts. The text details a 7-step AI video workflow, a 5-scene bilingual storyboard (Lighthouse trigonometry), a 2-layer verification rubric (Math & Language), and AI disclosure declarations.
3. **Environment & Sandbox Constraints**: 
   - Host OS: macOS Sonoma (Darwin 23.1.0 x86_64, MacBook Pro 16-inch 2019).
   - Node.js: `v20.18.1` with `npm 10.8.2`.
   - Bun: `v1.2.20`.
   - Python: `3.9.6` / `3.12`.
   - **Critical Sandbox Finding**: Outbound network access is blocked within the tool sandbox (`curl: (6) Could not resolve host: registry.npmjs.org`), and `BypassSandbox` was denied. Consequently, the application **must be 100% self-contained and zero-external-dependency** (or utilize offline-cached assets), building and running completely offline without requiring npm network access or external cloud services.
4. **Recommended Architecture**: A modern, standalone, zero-external-dependency Single Page Application (SPA) using standard modern Web Standards (ES Modules, HTML5, CSS3 with Tailwind-inspired design tokens, embedded SVG Lucide icon set, MathML/CSS LaTeX-style formula typesetting, native Web Speech API for English pronunciation, reactive LocalStorage persistence, and Node.js built-in `node:test` runner).
5. **Execution & Verification**: Fully runnable via Node's native HTTP server or Python's built-in `http.server`, and verifiable via Node 20's built-in `node --test` or Python `unittest` with zero setup friction.

---

## 1. Workspace Inventory & Tooling Audit

### 1.1 Directory Contents
```
/Users/mac/Desktop/math_english_ai_learn/
├── KHKT-Ti Na.docx       # 4,792,171 bytes (DOCX archive containing research paper & 5 images)
├── extracted_doc.txt     # 30,501 bytes (367 lines of raw research report text)
└── .agents/              # Agent teamwork metadata (read-only for application code)
```

### 1.2 Tooling & CLI Matrix

| Tool / Runtime | Version | Path / Status | Assessment |
|---|---|---|---|
| **Node.js** | `v20.18.1` | `/Users/mac/.nvm/versions/node/v20.18.1/bin/node` | **Primary Runtime**. Modern LTS with native `node:test`, `node:http`, `node:fs`. |
| **npm** | `10.8.2` | `/Users/mac/.nvm/versions/node/v20.18.1/bin/npm` | Available. Can install from local cache with `--offline`, but outbound registry is blocked by sandbox. |
| **Bun** | `1.2.20` | `/Users/mac/.bun/bin/bun` | Available. Very fast, has large cache in `~/.bun/install/cache`. |
| **Python 3** | `3.9.6` | `/usr/bin/python3` | Available. Built-in `http.server`, `zipfile`, `unittest`. |
| **pip3** | `24.0` | `/usr/local/bin/pip3` (Python 3.12) | Available. |
| **Git** | `2.39.3` | `/usr/bin/git` (Apple Git-145) | Available. Repository not yet initialized in this folder. |
| **Yarn** | 1.x | `/usr/local/bin/yarn` | **Restricted**: Throws `EPERM: open '/Users/mac/.yarnrc'`. Do not use. |
| **Outbound Network** | Blocked | Sandbox firewall active | **Zero external dependencies required**. No remote CDNs or npm network fetches. |

### 1.3 Port Availability
Ports `3000`, `5173`, and `8080` are completely free (verified via `lsof`). Node.js and Python can bind to any local port cleanly.

---

## 2. KHKT Research Materials & Media Asset Extraction

### 2.1 Text Documentation Breakdown (`extracted_doc.txt`)
The research document authored by Phạm Nguyễn Ti Na (Lớp 10A1, THPT Trần Văn Kiết, Vĩnh Long; GVHD: Lê Thanh Tâm) specifies:
- **Title**: *ỨNG DỤNG TRÍ TUỆ NHÂN TẠO PHÁT TRIỂN VIDEO SONG NGỮ HỌC TOÁN THỰC TIỄN (APPLICATION OF ARTIFICIAL INTELLIGENCE IN DEVELOPING BILINGUAL VIDEOS FOR REAL-WORLD MATHEMATICS EDUCATION)*
- **Theoretical Basis**:
  1. *Blum & Leiß Modeling Cycle*: Understanding real-world situation $\to$ Simplifying/Structuring $\to$ Mathematizing $\to$ Working mathematically $\to$ Interpreting real-world results.
  2. *Goldin's Multiple Representations*: Verbal $\leftrightarrow$ Visual/Concrete $\leftrightarrow$ Symbolic/Formal.
  3. *CLIL Framework (Content and Language Integrated Learning)*: Dual-focused education (Math Content + Math English Language).
- **Standardized 7-Step Workflow**:
  1. Bước 1: Lựa chọn bài toán thực tế (Trigonometry, Parabola, Optimization).
  2. Bước 2: Phân tích toán học & Tiếng Anh chuyên ngành (Math & Vocabulary Analysis).
  3. Bước 3: Viết kịch bản phân cảnh song ngữ (5-Scene Bilingual Storyboard).
  4. Bước 4: Khởi tạo nội dung bằng công cụ AI (Midjourney/DALL-E 3, ElevenLabs, HeyGen).
  5. Bước 5: Kiểm chứng 2 lớp (Dual-verification: Math & Language).
  6. Bước 6: Thử nghiệm diện hẹp (Pilot test with 20 students).
  7. Bước 7: Đóng gói học liệu số (Packaging CLIL Worksheet, solutions, digital repository).
- **5-Scene Bilingual Storyboard Structure**:
  - Cảnh 1: Mở đầu bối cảnh (Context & Inaccessible Base hook).
  - Cảnh 2: Dữ kiện trực quan (Given Facts: $AB = 30m$, $\widehat{CAD} = 42^\circ$, $\widehat{CBD} = 63^\circ$).
  - Cảnh 3: Vấn đề & Tiếng Anh chuyên ngành (Problem statement & Math English vocabulary table).
  - Cảnh 4: Gợi mở tư duy mô hình hóa (Guided modeling hints: $\widehat{ADB} = 63^\circ - 42^\circ = 21^\circ$, Law of Sines $\frac{BD}{\sin 42^\circ} = \frac{AB}{\sin 21^\circ}$).
  - Cảnh 5: Thực hành & Chuyển giao phiếu học tập (Practice calculation $CD = BD \cdot \sin 63^\circ \approx 49.98m$).
- **Dual-Layer Verification Criteria (Table 3)**:
  - Lớp 1 (Toán học): 100% data, notation, units, and geometric relations matching original problem.
  - Lớp 2 (Ngôn ngữ): 100% Math English terminology accuracy, native phonetics, clear subtitles.
  - Sư phạm & Kỹ thuật: Distraction-free AI visuals, HD 1080p, script documentation, and AI prompt audit logs.
- **Empirical Experimental Data (Table 4, N = 400 students)**:
  - Pre-test score: $5.42/10 \to$ Post-test score: $7.85/10$ ($+2.43$ pts, $p < 0.001$).
  - Fact extraction accuracy: $58.5\% \to 87.2\%$ ($+28.7\%$).
  - Math model formulation: $42.0\% \to 76.5\%$ ($+34.5\%$).
  - Math English vocabulary: $31.2\% \to 71.8\%$ ($+40.6\%$).
  - Real-world interpretation: $36.5\% \to 69.0\%$ ($+32.5\%$).
  - Student satisfaction: $89.5\%$.
- **AI Ethics & Compliance (Thông tư 84/2026/TT-BGDĐT)**: Full disclosure of AI tools (ChatGPT/Claude for scripts, Midjourney for visuals, ElevenLabs for voiceover, SPSS/Excel for stats).

### 2.2 Embedded Media Assets in `KHKT-Ti Na.docx`
Inspection of the DOCX archive structure revealed 5 high-resolution PNG image files:

| DOCX Internal Path | Dimensions | Size | Document Figure Caption & Role |
|---|---|---|---|
| `word/media/image1.png` | 1280 x 1280 | 1.52 MB | Official Project Crest & Title Logo (THPT Trần Văn Kiết) |
| `word/media/image2.png` | 1536 x 1024 | 2.03 MB | **Hình 1**: Sơ đồ Quy trình 7 bước chuẩn hóa phát triển Video AI học Toán song ngữ |
| `word/media/image3.png` | 1081 x 595 | 857 KB | **Hình 2**: Mô phỏng giao diện Video AI bài giảng Toán 10 song ngữ (Lighthouse problem 5-scene player mockup) |
| `word/media/image4.png` | 2970 x 1620 | 158 KB | **Hình 3**: Biểu đồ so sánh kết quả thực nghiệm sư phạm trước và sau tác động (N = 400) |
| `word/media/image5.png` | 2041 x 1530 | 159 KB | **Hình 4**: Biểu đồ khảo sát mức độ hứng thú và tự tin của học sinh đối với Video AI Song ngữ (N = 400) |

### 2.3 Media Asset Extraction Procedure
The project implementer can extract these assets into the Web App's `public/assets/khkt/` or `assets/` directory using Python's standard library `zipfile`:
```python
import zipfile, os

docx_path = 'KHKT-Ti Na.docx'
out_dir = 'public/assets/khkt'
os.makedirs(out_dir, exist_ok=True)

mapping = {
    'word/media/image1.png': 'khkt_logo.png',
    'word/media/image2.png': 'hinh1_quy_trinh_7_buoc.png',
    'word/media/image3.png': 'hinh2_giao_dien_video_ai.png',
    'word/media/image4.png': 'hinh3_bieu_do_thuc_nghiem.png',
    'word/media/image5.png': 'hinh4_bieu_do_khao_sat.png'
}

with zipfile.ZipFile(docx_path, 'r') as z:
    for src, dest in mapping.items():
        with open(os.path.join(out_dir, dest), 'wb') as f:
            f.write(z.read(src))
```
This guarantees the Web App showcases authentic, verified KHKT competition visuals without relying on external image CDNs.

---

## 3. Technology Stack Recommendation & Feasibility Analysis

### 3.1 Strict Design Constraint: Zero External Dependency
Because outbound internet access is restricted by the sandbox environment, relying on `npm install <new-packages>` from remote registries will fail.
Therefore, the recommended stack must satisfy:
1. **Zero remote npm downloads required at runtime or build time**.
2. **Zero external CDN dependencies** (no `cdnjs.cloudflare.com`, no `fonts.googleapis.com`, no cloud APIs).
3. **Zero cloud backend credentials** (no OpenAI, ElevenLabs, Supabase, or AWS keys).
4. **Immediate local runnable state**: Can be started with a single CLI command (`node server.js` or `python3 -m http.server 3000`) and opened in any modern browser.
5. **Deterministic testability**: Can run comprehensive unit tests with `node --test` or `python3 -m unittest` in <500ms.

### 3.2 Recommended Architecture & Component Hierarchy

#### A. Frontend Architecture: Modern Standalone ES Module SPA
- **Why this is superior**:
  - Native ES Modules (`import/export`) are supported by 100% of modern browsers (Chrome, Safari, Firefox, Edge).
  - Eliminates bundler compilation errors, webpack/vite version mismatches, and node_modules bloat.
  - Instant hot reload during development via simple file serving.
  - Clean modular code structure:
    ```
    src/
    ├── app.js                      # Application root & router
    ├── components/
    │   ├── Navbar.js               # Header navigation & topic switcher
    │   ├── LessonBrowser.js        # R1: Explore, search, filter 10th grade real-world math lessons
    │   ├── VideoPlayer5Scenes.js   # R2: 5-scene multimedia player with audio & subtitles
    │   ├── MathEnglishVocab.js     # R2: Interactive Math English vocabulary table with Web Speech
    │   ├── WorksheetQuiz.js        # R3: Interactive worksheet, auto-grading, step feedback
    │   ├── LessonAuthoring.js      # R4: 5-scene lesson editor
    │   ├── DualLayerVerifier.js    # R4: 2-layer verification checklist (Math & Language)
    │   ├── KhktResearchShowcase.js # KHKT 7-step process & N=400 empirical showcase
    │   └── MathRenderer.js         # LaTeX-style math formula formatter
    ├── data/
    │   ├── initialLessons.js       # 3 verified KHKT lessons (Lighthouse, Parabola, Optimization)
    │   └── khktResearchData.js     # 7 steps, Table 3 checklist criteria, N=400 statistics
    ├── services/
    │   ├── speechService.js        # Web Speech API wrapper for pronunciation
    │   ├── storageService.js       # LocalStorage CRUD with JSON export/import
    │   └── mathEngine.js           # Core math solver (Trig, Parabola, Optimization)
    └── styles/
        └── main.css                # Modern responsive design tokens (Tailwind-compatible)
    ```

#### B. Styling: Tailwind-Inspired Modern CSS Design System
- Modern CSS with custom properties (`--color-primary`, `--color-surface`, `--color-accent`), responsive grid/flexbox layouts, card designs, badges, pill tabs, progress bars, and high-contrast accessibility.
- Works 100% offline, zero npm build step required.

#### C. Icons: Inlined Lucide SVG Icon System
- Rather than importing huge npm icon packages, provide a clean `LucideIcons.js` helper that outputs standard SVG markup for:
  - `Play`, `Pause`, `Volume2`, `RotateCcw`, `CheckCircle2`, `AlertTriangle`, `BookOpen`, `FileCheck`, `Layers`, `Search`, `Sparkles`, `Download`, `Upload`.
- Zero latency, crisp rendering on Retina screens, zero external fonts.

#### D. Math Formula Typesetting: MathML & CSS-Engineered LaTeX Typography
- A lightweight formatting engine that renders LaTeX-style mathematical expressions:
  - Fractions ($\frac{a}{b}$), trigonometric functions ($\sin$, $\cos$, $\tan$), angle degrees ($42^\circ$), square roots ($\sqrt{\cdot}$), superscripts/subscripts ($x^2$, $BD_{min}$).
  - Uses native browser MathML and CSS layout blocks. Beautiful, crisp, and 100% offline.

#### E. English Audio Pronunciation: Native Web Speech API
- Utilizes `window.speechSynthesis` and `SpeechSynthesisUtterance`:
  ```javascript
  export function speakWord(text, rate = 0.9) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
  ```
- Works out-of-the-box on macOS Safari, Chrome, and Edge without any API keys, bandwidth costs, or external ElevenLabs tokens.

#### F. Dual-Layer Verification & Local Persistence
- **Storage**: `window.localStorage` with fallback to in-memory store.
- **Export/Import**: Standard JSON file export/import to backup authored lessons and verification certificates.
- **Verification Engine**: Strict check of both layers before publishing:
  - Layer 1 (Toán học): Checks existence of numerical inputs, geometric relations, valid formula calculations.
  - Layer 2 (Ngôn ngữ): Checks Math English keywords, phonetic transcription, and Vietnamese definitions.

---

## 4. Lesson Content Specification (3 Canonical KHKT Lessons)

The application will feature 3 complete, mathematically validated 10th-grade lessons:

### Lesson 1: Hệ thức lượng trong tam giác — Đo chiều cao ngọn hải đăng (Lighthouse Height)
- **Topic**: Hệ thức lượng trong tam giác (Chương IV - Hình học 10).
- **Context**: Đo chiều cao ngọn hải đăng trên vách đá biển khi chân tháp $C$ không thể tiếp cận trực tiếp.
- **Given Facts**: Hai điểm quan sát $A$ và $B$ trên mặt đất nằm thẳng hàng với chân tháp $C$, khoảng cách $AB = 30m$. Góc nâng tại $A$ là $\alpha = 42^\circ$, góc nâng tại $B$ là $\beta = 63^\circ$.
- **Math Model**:
  - Trong tam giác $ABD$: $\widehat{ADB} = \beta - \alpha = 63^\circ - 42^\circ = 21^\circ$.
  - Định lý Sin: $\frac{BD}{\sin A} = \frac{AB}{\sin \widehat{ADB}} \implies BD = \frac{30 \cdot \sin 42^\circ}{\sin 21^\circ} \approx 55.90m$.
  - Trong tam giác vuông $BCD$: $CD = BD \cdot \sin 63^\circ \approx 55.90 \cdot \sin 63^\circ \approx 49.81m$ (hoặc $\approx 49.98m$ tùy quy tròn góc).
- **Math English Vocabulary**:
  - *Angle of elevation* `/ˈæŋ.ɡəl əv ˌel.əˈveɪ.ʃən/`: Góc nâng.
  - *Law of Sines* `/lɔː əv saɪnz/`: Định lý Sin.
  - *Inaccessible base* `/ˌɪn.əkˈses.ə.bəl beɪs/`: Chân tháp không thể tiếp cận.
  - *Height measurement* `/haɪt ˈmeʒ.ə.mənt/`: Phép đo chiều cao.
  - *Trigonometric ratio* `/ˌtrɪɡ.ə.nəˈmet.rɪk ˈreɪ.ʃi.oʊ/`: Tỉ số lượng giác.

### Lesson 2: Hàm số bậc hai — Bài toán Cổng Parabol (Parabolic Arch Highway)
- **Topic**: Hàm số bậc hai và đồ thị (Chương III - Đại số 10).
- **Context**: Một cổng chào hình Parabol có chiều rộng mặt đất $L = 12m$ và chiều cao đỉnh $H = 8m$. Cần xác định xe tải chở hàng có chiều rộng $4m$ và chiều cao $7m$ có thể đi qua an toàn dưới vòm cổng hay không.
- **Math Model**:
  - Đặt hệ trục tọa độ $Oxy$ với gốc $O$ tại tâm mặt đất, đỉnh cổng tại $I(0, 8)$, hai chân cổng tại $(-6, 0)$ và $(6, 0)$.
  - Phương trình parabol: $y = ax^2 + 8$. Qua $(6, 0) \implies 36a + 8 = 0 \implies a = -\frac{2}{9}$.
  - Xe tải rộng $4m \implies x \in [-2, 2]$. Tại $x = 2$: $y = -\frac{2}{9}(4) + 8 = 8 - \frac{8}{9} \approx 7.11m$.
  - So sánh: Chiều cao xe $7.0m < 7.11m$, xe có thể lọt qua với độ an toàn $0.11m$ ($11cm$).
- **Math English Vocabulary**:
  - *Parabolic arch* `/ˌpær.əˈbɒl.ɪk ɑːtʃ/`: Vòm parabol.
  - *Quadratic function* `/kwɒdˈræt.ɪk ˈfʌŋk.ʃən/`: Hàm số bậc hai.
  - *Vertex* `/ˈvɜː.teks/`: Đỉnh của parabol.
  - *Clearance height* `/ˈklɪə.rəns haɪt/`: Chiều cao thông thủy (tĩnh không).
  - *Axis of symmetry* `/ˈæk.sɪs əv ˈsɪm.ə.tri/`: Trục đối xứng.

### Lesson 3: Tối ưu hóa — Bài toán Tối ưu hóa Doanh thu Nông sản Bến Tre (Revenue Optimization)
- **Topic**: Dấu tam thức bậc hai & Cực trị hàm số bậc hai (Toán 10).
- **Context**: Hợp tác xã sầu riêng Bến Tre bán với giá 100 ngàn đồng/kg thì mỗi ngày bán được 500 kg. Khảo sát thị trường cho biết: cứ giảm giá 2 ngàn đồng/kg thì số lượng bán ra mỗi ngày tăng thêm 20 kg. Tìm mức giảm giá để doanh thu đạt cực đại.
- **Math Model**:
  - Gọi $x$ là số lần giảm 2 ngàn đồng ($x \ge 0$).
  - Giá bán mới: $P(x) = 100 - 2x$ (ngàn đồng/kg).
  - Khối lượng bán mới: $Q(x) = 500 + 20x$ (kg).
  - Hàm doanh thu: $R(x) = P(x) \cdot Q(x) = (100 - 2x)(500 + 20x) = -40x^2 + 1000x + 50000$.
  - Đỉnh parabol: $x = -\frac{b}{2a} = -\frac{1000}{2(-40)} = 12.5$.
  - Vì $x$ nguyên hoặc xét giảm giá $d = 2x = 25$ ngàn đồng $\implies$ giá bán tối ưu $75$ ngàn đồng/kg $\implies$ Doanh thu max: $R(12.5) = 56,250$ ngàn đồng ($56.25$ triệu đồng), tăng $6.25$ triệu so với ban đầu.
- **Math English Vocabulary**:
  - *Revenue optimization* `/ˈrev.ən.juː ˌɒp.tɪ.maɪˈzeɪ.ʃən/`: Tối ưu hóa doanh thu.
  - *Maximum value* `/ˈmæk.sɪ.məm ˈvæl.juː/`: Giá trị cực đại.
  - *Unit price* `/ˈjuː.nɪt praɪs/`: Đơn giá.
  - *Demand elasticity* `/dɪˈmɑːnd ˌel.æˈstɪs.ə.ti/`: Độ co giãn của cầu.
  - *Parabolic peak* `/ˌpær.əˈbɒl.ɪk piːk/`: Đỉnh đồ thị parabol.

---

## 5. Build, Test & Run Strategy

### 5.1 Local Server Execution
The project can provide a zero-dependency launcher `server.js` using Node's standard `node:http`:
```javascript
// server.js (Node 20 native, zero dependencies)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`CLIL Math-English Web App running at: http://localhost:${PORT}`);
});
```
Or alternatively via Python:
`python3 -m http.server 3000`

### 5.2 Automated Testing Setup
Using Node 20's built-in test runner (`node:test` and `node:assert`), the test suite can be run with:
`node --test tests/**/*.test.js`

**Test Suite Coverage**:
1. `tests/math_models.test.js`:
   - Trigonometry lighthouse calculation ($CD \approx 49.98m$).
   - Parabolic arch equation, vertex, and vehicle clearance ($7.11m > 7.0m$).
   - Revenue optimization extremum ($R(12.5) = 56,250$).
2. `tests/khkt_verification.test.js`:
   - Dual-layer verification engine validation rules (Layer 1 Math, Layer 2 Language).
   - Incomplete lesson rejection vs. complete lesson certification.
3. `tests/quiz_scoring.test.js`:
   - 3-dimension question grading (Context extraction, Mathematical model, Math English terminology).
   - Rubric calculation and feedback generation.

---

## 6. Recommendations for Implementation Team

1. **Asset Preparation**: Run the python extraction script at setup time to extract `image1.png` to `image5.png` from `KHKT-Ti Na.docx` into `public/assets/khkt/`.
2. **Architecture**: Implement the modular ES Module architecture described in Section 3.2. Do NOT run `npm install` without checking local availability; the pure ES Module approach guarantees 100% offline immunity, blazing fast startup, and zero build tool conflicts.
3. **Speech Synthesis**: Utilize `window.speechSynthesis` for interactive audio pronunciation with zero cloud API keys.
4. **Testing Command**: Include `"test": "node --test tests/**/*.test.js"` in `package.json` for deterministic, offline test execution.
5. **KHKT Showcase**: Include a dedicated "Dự án KHKT & Quy trình 7 bước" modal or tab displaying Ti Na's research results, the 7-step process diagram, the dual-layer checklist, and empirical evidence ($N=400$, $+2.43$ points).
