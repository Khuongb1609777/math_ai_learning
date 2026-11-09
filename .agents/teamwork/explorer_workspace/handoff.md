# Handoff Report: Workspace Environment & Technical Feasibility

**Agent**: Workspace Environment Explorer (`explorer_workspace`)  
**Recipient**: Team Orchestrator (`orchestrator`), Architecture Explorer (`explorer_architecture`), Spec Miner (`spec_miner_khkt`)  
**Date**: 2026-11-07  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/explorer_workspace/`  

---

## 1. Observation

### 1.1 Project Root Files & System Architecture
- Working directory `/Users/mac/Desktop/math_english_ai_learn` contains:
  - `KHKT-Ti Na.docx`: 4,792,171 bytes
  - `extracted_doc.txt`: 30,501 bytes (367 lines)
  - `.agents/`: Team metadata directories
- No `package.json`, source files (`src/`), or `.git/` repository are currently present.
- Host machine: macOS Sonoma (Darwin 23.1.0 x86_64, MacBook Pro 16-inch 2019).
- CLI Tool inspection:
  - Node.js: `v20.18.1` (`/Users/mac/.nvm/versions/node/v20.18.1/bin/node`)
  - npm: `10.8.2` (`/Users/mac/.nvm/versions/node/v20.18.1/bin/npm`)
  - Bun: `1.2.20` (`/Users/mac/.bun/bin/bun`)
  - Python: `3.9.6` (`/usr/bin/python3`) and `pip3` (`/usr/local/bin/pip3`, python 3.12)
  - Git: `2.39.3` (`/usr/bin/git`)
  - Yarn: Throws `EPERM: operation not permitted, open '/Users/mac/.yarnrc'` under current sandbox restrictions.

### 1.2 Sandbox Network Restriction
- Running `curl -I --connect-timeout 3 https://registry.npmjs.org` output:
  `curl: (6) Could not resolve host: registry.npmjs.org`
- Elevation with `BypassSandbox: true` was denied by user permission check:
  `Encountered error in tool execution: permission check failed for unsandboxed "curl...": Permission prompt... was denied.`
- Direct `npm install <remote-pkg>` or remote CDN fetching will fail due to lack of outbound DNS/network.
- Node.js built-in HTTP server (`node:http`) and Python's `http.server` bind to local ports (e.g., 3000, 56467) and serve requests without any permission errors.
- Ports `3000`, `5173`, and `8080` are completely unallocated and ready for use.

### 1.3 KHKT Research Materials & Embedded Media Assets
- `extracted_doc.txt` contains 367 lines detailing:
  - Project Title: *Ứng dụng Trí tuệ Nhân tạo phát triển video song ngữ học toán thực tiễn* (THPT Trần Văn Kiết, tác giả Phạm Nguyễn Ti Na, GVHD Lê Thanh Tâm).
  - 7-step standardized AI video workflow (Line 135–144).
  - 5-scene bilingual storyboard for Lighthouse Trigonometry (Line 146–183).
  - 2-layer verification checklist (Table 3, Line 186–208: Math accuracy, Math English precision, visual distraction-free, 1080p audio/subtitles, script docs, AI prompt disclosure).
  - Empirical experimental data (Table 4, Line 214–250: N = 400 students, average score increased from 5.42 to 7.85 (+2.43 pts, p < 0.001)).
  - AI disclosure declaration under Thông tư 84/2026/TT-BGDĐT (Table 6, Line 293–314).
- `KHKT-Ti Na.docx` contains 5 high-resolution PNG images in `word/media/`:
  - `image1.png` (1280x1280, 1.5MB): Official cover logo & emblem.
  - `image2.png` (1536x1024, 2.0MB): Hình 1 — Sơ đồ Quy trình 7 bước chuẩn hóa.
  - `image3.png` (1081x595, 857KB): Hình 2 — Giao diện video AI bài giảng Toán 10 song ngữ (Lighthouse problem).
  - `image4.png` (2970x1620, 157KB): Hình 3 — Biểu đồ kết quả thực nghiệm sư phạm (N = 400).
  - `image5.png` (2041x1530, 159KB): Hình 4 — Biểu đồ khảo sát hứng thú và tự tin của học sinh.

### 1.4 Test Runner Capabilities
- Running `node --test` with Node 20's native test runner (`node:test` + `node:assert`) successfully executed in 133ms with zero dependencies:
  ```
  TAP version 13
  ok 1 - calculates lighthouse height correctly
  # tests 1, suites 1, pass 1, fail 0
  ```
- Python `unittest` (`python3 -m unittest`) is also fully operational out-of-the-box.

---

## 2. Logic Chain

1. **Premise 1 (Network Restriction)**: The tool sandbox does not provide outbound internet access to package registries (`curl: (6) Could not resolve host`), and `BypassSandbox` was denied.
2. **Inference 1**: Any build step or runtime relying on online `npm install` from the registry or remote CDN links (like unpkg, cdnjs, or google fonts) will fail.
3. **Premise 2 (Local Capabilities)**: Node.js 20.18.1 and modern browsers natively support ES Modules (`import/export`), CSS custom properties, MathML, Canvas/SVG, Web Speech API (`window.speechSynthesis`), LocalStorage, and `node:test`.
4. **Inference 2**: A standalone, zero-external-dependency Single Page Application (SPA) using standard modern Web Standards (modular ES6+ components, Tailwind-inspired CSS tokens, embedded Lucide SVG icons, client-side math typesetting, and Web Speech API audio) will run 100% reliably, start in <100ms, and require zero cloud credentials.
5. **Premise 3 (Asset Authenticity)**: The actual KHKT competition visuals (Hình 1 to Hình 4) reside as 5 high-res PNGs inside `KHKT-Ti Na.docx`.
6. **Inference 3**: Extracting these 5 images into the application's assets directory during setup directly elevates the authenticity of the product for the KHKT competition showcase without needing external graphics generation.
7. **Premise 4 (Automated Testing)**: Node.js 20 includes native `node:test` and `node:assert`, capable of executing unit tests without downloading Vitest or Jest.
8. **Inference 4**: Mathematical calculations (Lighthouse Law of Sines, Parabolic Arch quadratic equation, Revenue optimization extremum) and dual-layer verification logic can be tested deterministically with `npm test` pointing to `node --test tests/**/*.test.js`.

---

## 3. Caveats

- **No Live Yarn**: `yarn` fails due to permissions on `~/.yarnrc`. All build scripts and instructions should specify `node` or `npm`.
- **Offline Math Typesetting**: Because KaTeX from npm cannot be downloaded over the network without pre-existing cache, formulas should be rendered using standard MathML, SVG, and structured CSS classes that deliver crisp LaTeX-style visual appearance ($\frac{a}{b}$, $\sin \theta$, $x^2$).
- **Web Speech Voice Availability**: `window.speechSynthesis` uses the operating system's built-in English text-to-speech voices (e.g., Samantha, Daniel on macOS). On macOS, this provides clear, natural English pronunciation offline.
- **Port Selection**: Default to port `3000` or allow dynamic port assignment via `process.env.PORT`.

---

## 4. Conclusion

1. **Application Architecture**: Build a responsive, standalone, zero-external-dependency Web App structured in modular ES6+ components (`src/components/`, `src/services/`, `src/data/`, `src/styles/`), served via a lightweight Node.js native HTTP server (`server.js`) or Python's `http.server 3000`.
2. **KHKT Media Integration**: Extract `image1.png` through `image5.png` from `KHKT-Ti Na.docx` into `public/assets/khkt/` to showcase the authentic 7-step process diagram, 5-scene video mockup, and N=400 empirical graphs.
3. **Feature Scope & Delivery**:
   - **R1 (Lesson Discovery)**: 3 complete 10th-grade lessons (Lighthouse Trigonometry, Parabolic Arch, Revenue Optimization) with search, filter, and difficulty tags.
   - **R2 (5-Scene Player & Math English)**: Standardized 5-scene player with bilingual subtitles, pause/play/scrubber, and interactive vocabulary table with Web Speech API audio pronunciation.
   - **R3 (Interactive Worksheet)**: Multi-step quiz assessing context extraction, math modeling, and English vocabulary with immediate scoring and explanations.
   - **R4 (Authoring & Dual-Layer Verifier)**: 5-scene lesson editor with the official 2-layer checklist (Toán học & Ngôn ngữ) based on KHKT Table 3, certificate generation, and JSON export/import.
   - **KHKT Research Showcase**: Dedicated view presenting the research poster, methodology, and experimental results ($N=400$, $+2.43$ pts).
4. **Test Suite**: Automate test execution via `node --test tests/**/*.test.js` covering mathematical formulas, quiz scoring algorithms, and verification logic.

---

## 5. Verification Method

To independently verify the observations and recommendations in this report:

1. **Verify Node.js & Built-in Test Runner**:
   ```bash
   node -v
   node --test -e "const { test } = require('node:test'); const assert = require('node:assert'); test('sanity', () => assert.strictEqual(2+2, 4));"
   ```
2. **Verify DOCX Embedded Media Assets**:
   ```bash
   unzip -l "KHKT-Ti Na.docx" | grep "word/media"
   ```
3. **Verify Asset Extraction Script**:
   ```bash
   python3 -c "
   import zipfile
   with zipfile.ZipFile('KHKT-Ti Na.docx', 'r') as z:
       for n in range(1, 6):
           data = z.read(f'word/media/image{n}.png')
           print(f'image{n}.png: {len(data)} bytes')
   "
   ```
4. **Verify Offline Local HTTP Server**:
   ```bash
   node -e "const http = require('node:http'); const s = http.createServer((q,r)=>r.end('OK')).listen(3000, ()=>{ console.log('Listening on 3000'); s.close(); });"
   ```
5. **Invalidation Conditions**:
   - If user grants unsandboxed internet access and requests a remote npm build, a Vite + Tailwind build could be run; however, the zero-external-dependency approach remains strictly superior because it guarantees immediate, offline, forever-portable demonstration at the KHKT competition.
