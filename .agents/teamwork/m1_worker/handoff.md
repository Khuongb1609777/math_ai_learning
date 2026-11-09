# Milestone M1 Handoff Report: Foundation, Asset Pipeline & Core Data Models

## 1. Observation

### 1.1 Extracted Assets & Checksums
Execution of `python3 extract_assets.py` extracted 5 authentic images from `KHKT-Ti Na.docx` into `public/assets/khkt/` and generated `public/assets/khkt/manifest.json`.
Subsequent execution of `python3 extract_assets.py --verify-only` yielded:
```text
[*] Verifying KHKT assets in: public/assets/khkt
  [PASS] image1.png & khkt_logo.png (1,521,465 bytes)
  [PASS] image2.png & hinh1_quy_trinh_7_buoc.png (2,034,981 bytes)
  [PASS] image3.png & hinh2_giao_dien_video_ai.png (857,341 bytes)
  [PASS] image4.png & hinh3_bieu_do_thuc_nghiem.png (157,568 bytes)
  [PASS] image5.png & hinh4_bieu_do_khao_sat.png (159,226 bytes)
```
SHA-256 hashes matched ground truth:
- `image1.png` / `khkt_logo.png`: `dfa9952cc5cf576a8d32e67b46fb34f2560634a4271e0d4519b3a0536c31f61b`
- `image2.png` / `hinh1_quy_trinh_7_buoc.png`: `f846271379255e357feba2c7165871dec8f4c40653382edb8843ed3b575edbc4`
- `image3.png` / `hinh2_giao_dien_video_ai.png`: `372afe8033ed558426d6457f30b338c3b364206f7c246d51090679e80232ef51`
- `image4.png` / `hinh3_bieu_do_thuc_nghiem.png`: `313c0c234d6c6406aae6fa9068ff26bf14d735171c16986d86445b0cac9191ed`
- `image5.png` / `hinh4_bieu_do_khao_sat.png`: `1fd27bbdbb440ad4567e204ba8d63f2dadbaeb380cbb21bec1a4b7ed0a378111`

### 1.2 Created Core Modules & Code Ownership
All 14 assigned deliverables have been created and verified:
1. `/Users/mac/Desktop/math_english_ai_learn/extract_assets.py`: Complete Python extraction pipeline with `--verify-only`, `--force`, `--quiet`, `--json`.
2. `/Users/mac/Desktop/math_english_ai_learn/package.json`: Configured with `"type": "module"`, `"scripts": { "start": "node server.js", "test": "node --test tests/*.test.js tests/**/*.test.js", "extract-assets": "python3 extract_assets.py" }`, zero dependencies.
3. `/Users/mac/Desktop/math_english_ai_learn/server.js`: Native `node:http` server supporting static file serving (`/public` and `/src`), SPA routing fallback, MIME types, security traversal rejection (403), and graceful shutdown.
4. `/Users/mac/Desktop/math_english_ai_learn/public/index.html`: Responsive HTML5 shell with KaTeX math font stacks, SVG favicon, and `#app` container.
5. `/Users/mac/Desktop/math_english_ai_learn/public/assets/css/style.css`: Design system with Tailwind CSS tokens, 5-scene stepper, bilingual split view, math formulas, and 2-layer verification tables.
6. `/Users/mac/Desktop/math_english_ai_learn/src/data/types.js`: JSDoc type contracts for `VocabularyItem`, `Scene`, `QuizQuestion`, `VerificationCriterion`, `Lesson`, `QuizResult`.
7. `/Users/mac/Desktop/math_english_ai_learn/src/data/khkt_data.js`: Metadata, 4 theoretical foundations, 7-step pedagogical cycle, $N=400$ empirical study metrics ($+2.43$ pts gain), Likert survey statements, AI disclosure declaration.
8. `/Users/mac/Desktop/math_english_ai_learn/src/data/verification_rules.js`: 10 verification criteria definitions (Layer 1 Math V1.1–V1.5, Layer 2 English V2.1–V2.5).
9. `/Users/mac/Desktop/math_english_ai_learn/src/data/lessons.js`: 3 complete Grade 10 real-world math lessons:
   - `lesson-lighthouse` (Trigonometry: Inaccessible Base, $AB=30\text{ m}, \alpha=42^\circ, \beta=63^\circ, CD \approx 49.9\text{ m}$)
   - `lesson-parabolic-arch` (Quadratic: $L=8\text{ m}, H=6\text{ m}, w=4\text{ m}, h_{\text{truck}}=4.2\text{ m}, y(2)=4.5\text{ m}$, margin $30\text{ cm}$)
   - `lesson-bus-optimization` (Optimization: $P_0=200{,}000, Q_0=60, \Delta P=10{,}000, \Delta Q=5, x^*=4, P^*=160{,}000, R^*=12{,}800{,}000\text{ VNĐ}$)
10. `/Users/mac/Desktop/math_english_ai_learn/src/services/storage.js`: LocalStorage manager with in-memory fallback for headless tests, default lesson protection against deletion, JSON export/import with schema validation, quiz and survey persistence.
11. `/Users/mac/Desktop/math_english_ai_learn/src/services/speech.js`: Web Speech API wrapper with local voice prioritization, 120–140 WPM pacing rate, and headless silent mock for Node tests.
12. `/Users/mac/Desktop/math_english_ai_learn/src/services/verification.js`: Automated 10-criteria evaluator, 100% PASS publishing gate (`canPublish`), blocker diagnosis, and KHKT Certificate generator.
13. `/Users/mac/Desktop/math_english_ai_learn/tests/math_models.test.js`: Unit tests verifying trigonometric formulas, parabolic clearance, and quadratic revenue optimization.
14. `/Users/mac/Desktop/math_english_ai_learn/tests/verification.test.js`: Unit tests verifying the 10 criteria, publishing gate enforcement, duplicate rejection, and certificate generation.

### 1.3 Test Suite Execution Results
Running `npm test` (executing `node --test tests/*.test.js tests/**/*.test.js`):
```text
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier1_features.test.js (110.18223ms)
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier2_boundaries.test.js (103.720502ms)
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier3_pairwise.test.js (99.483358ms)
✔ /Users/mac/Desktop/math_english_ai_learn/tests/e2e/tier4_scenarios.test.js (101.091766ms)
▶ KHKT Lesson 1 Math Model: Lighthouse Inaccessible Base Triangulation
  ✔ calculates the top vertex subtended angle ADB correctly
  ✔ computes distance BD using Law of Sines within tight tolerance
  ✔ computes lighthouse height CD using right-triangle trigonometry
  ✔ verifies height CD via alternative cotangent formula
  ✔ confirms inaccessible base property: BC is non-zero and geometric relation holds
  ✔ matches Lesson 1 dataset values in src/data/lessons.js
✔ KHKT Lesson 1 Math Model: Lighthouse Inaccessible Base Triangulation
▶ KHKT Lesson 2 Math Model: Parabolic Entrance Arch & Truck Clearance
  ✔ derives correct quadratic coefficient a for symmetric arch
  ✔ verifies boundary points and vertex on the parabola y = -0.375x^2 + 6
  ✔ calculates clearance height at outer edge of truck
  ✔ validates truck clearance inequality and calculates safety margin
  ✔ confirms coordinate invariance: origin placed at left base gives identical clearance
  ✔ matches Lesson 2 dataset values in src/data/lessons.js
✔ KHKT Lesson 2 Math Model: Parabolic Entrance Arch & Truck Clearance
▶ KHKT Lesson 3 Math Model: Cho Lach Bus Revenue Optimization
  ✔ expands to standard quadratic form: R(x) = -50,000x^2 + 400,000x + 12,000,000
  ✔ finds vertex x via standard Grade 10 quadratic vertex formula x = -b / (2a)
  ✔ confirms domain constraint: x=4 satisfies 0 <= x <= 8 and capacity <= 100
  ✔ verifies strict maximum revenue R(4) = 12,800,000 VND
  ✔ calculates net revenue increase compared to baseline
  ✔ matches Lesson 3 dataset values in src/data/lessons.js
✔ KHKT Lesson 3 Math Model: Cho Lach Bus Revenue Optimization
▶ Dual-Layer Verification Engine: Criteria Structure
  ✔ enforces exactly 10 criteria definitions across Math and English layers
  ✔ contains valid definitions with bilingual titles and descriptions
✔ Dual-Layer Verification Engine: Criteria Structure
▶ Dual-Layer Verification Engine: Automated Evaluation
  ✔ evaluates all 3 default KHKT lessons as 100% PASS
  ✔ detects missing scenes and fails V1.1 (Data Consistency)
  ✔ detects insufficient vocabulary and fails V2.1
  ✔ detects missing or invalid IPA format and fails V2.2
✔ Dual-Layer Verification Engine: Automated Evaluation
▶ Dual-Layer Verification Engine: Publishing Gate Enforcement
  ✔ allows publication when all 10 criteria evaluate to passed: true
  ✔ strictly blocks publication if any single Math criterion fails (e.g., M3 = false)
  ✔ strictly blocks publication if any single English criterion fails (e.g., E1 = false)
  ✔ rejects publication when criteria list is empty, null, or undefined
  ✔ rejects publication when criteria list contains fewer than 10 items
  ✔ rejects publication when duplicate criteria attempt to forge 10 items
✔ Dual-Layer Verification Engine: Publishing Gate Enforcement
▶ Dual-Layer Verification Engine: Diagnostic Report & Certificates
  ✔ generates accurate publish gate report for valid lesson
  ✔ generates a valid KHKT certificate when 100% criteria are verified
  ✔ throws an explicit error when attempting to generate certificate for unverified lesson
✔ Dual-Layer Verification Engine: Diagnostic Report & Certificates
ℹ tests 37
ℹ suites 7
ℹ pass 37
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 169.767084
```

### 1.4 Server Handler Execution Results
Testing server routing directly via event handler:
- `GET /`: returns status `200` with `Content-Type: text/html; charset=utf-8`.
- `GET /assets/css/style.css`: returns status `200` with `Content-Type: text/css; charset=utf-8`.
- `GET /assets/khkt/image1.png`: returns status `200` with `Content-Type: image/png`.
- `GET /lessons/lesson-lighthouse` (SPA navigation route): returns status `200` with `Content-Type: text/html; charset=utf-8`.
- `GET /non-existent-asset.png` (missing static file): returns status `404`.
- `GET /../package.json` (path traversal attack): rejected with status `403`.

---

## 2. Logic Chain

1. **Asset Authenticity**: Based on observation 1.1, all 5 extracted images from `KHKT-Ti Na.docx` have identical byte sizes and exact SHA-256 hashes matching the research report. The asset pipeline script `extract_assets.py` operates idempotently and generates a valid `manifest.json`.
2. **Mathematical Accuracy**: Based on observation 1.3, unit tests in `tests/math_models.test.js` verify:
   - Exterior angle $\widehat{ADB} = 63^\circ - 42^\circ = 21^\circ$, Law of Sines $BD \approx 55.99\text{ m}$, and $CD \approx 49.9\text{ m}$ (verified independently via cotangent difference $30 / (\cot 42^\circ - \cot 63^\circ) \approx 49.91\text{ m}$).
   - Parabolic coefficient $a = -0.375$ (from $L=8, H=6$), clearance at truck edges $x=\pm 2$ is $y(2)=4.5\text{ m} > 4.2\text{ m}$ with safety margin $30\text{ cm}$.
   - Bus revenue function $R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000$ achieves absolute maximum at vertex $x^*=4$, ticket price $160{,}000\text{ VNĐ}$, capacity $80 \le 100$, and peak revenue $12{,}800{,}000\text{ VNĐ}$ ($+800{,}000\text{ VNĐ}$ gain).
3. **Dual Verification Rigor**: Based on observation 1.3, `src/services/verification.js` implements the 10 criteria from KHKT Table 3 (5 Math + 5 English), enforces that publication requires 100% PASS (10/10), rejects duplicate criteria attempts, and generates tamper-evident certificates with circular 84/2026/TT-BGDĐT compliance.
4. **Environment Portability & Fallbacks**: Based on observation 1.2, `src/services/storage.js` uses `MemoryStorage` when `window.localStorage` is unavailable, and `src/services/speech.js` falls back to asynchronous microtasks/promises in headless Node.js testing. Consequently, all browser ES modules run directly under Node's native test runner without DOM mocking libraries.
5. **Full Zero-Dependency Compliance**: Neither runtime nor test suite requires external npm packages, satisfying the offline KHKT contest requirements.

---

## 3. Caveats

- In headless Node.js environments (CLI testing), `speechSynthesis` is not natively implemented by Node.js runtime; `speech.js` correctly falls back to silent asynchronous completion without throwing errors.
- The web app UI components (Milestones M2–M5) will build upon the data models, storage APIs, speech wrapper, and verification engine delivered in this milestone.

---

## 4. Conclusion

Milestone M1 is **100% complete and fully verified**. All core data schemas, 3 Grade 10 real-world math lessons, asset extraction pipeline, storage/speech/verification services, static server, and unit tests have been implemented and pass with 37/37 passing test cases and 0 failures.

The project is ready for Milestone M2 (Navigation, Collection Explorer & KHKT Research Showcase).

---

## 5. Verification Method

To independently verify this milestone:

1. **Verify Asset Pipeline & Checksums**:
   ```bash
   python3 extract_assets.py --verify-only
   ```
   *Expected output*: `[PASS]` for all 5 image assets with exact byte lengths.

2. **Execute Full Test Suite**:
   ```bash
   npm test
   # or: node --test tests/*.test.js tests/**/*.test.js
   ```
   *Expected output*: 37 passing tests across 7 test suites with 0 failures (`pass 37, fail 0`).

3. **Verify Server Routing & Security**:
   ```bash
   node --input-type=module -e '
   import { EventEmitter } from "node:events";
   import server from "./server.js";
   const handler = server.listeners("request")[0];
   const req = new EventEmitter(); req.url = "/"; req.method = "GET"; req.headers = {};
   const res = new EventEmitter(); res.setHeader = () => {}; res.writeHead = (code) => { console.log("Status:", code); };
   res.end = () => { server.close(); process.exit(0); };
   handler(req, res);
   '
   ```
   *Expected output*: `Status: 200`.
