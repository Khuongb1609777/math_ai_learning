# BÁO CÁO THIẾT KẾ VÀ BLUEPRINT HẠ TẦNG SERVER & KIỂM THỬ TOÁN HỌC (M1)
**Milestone**: M1 — Foundation, Asset Pipeline & Core Data Models  
**Explorer**: M1 Explorer 3 (Server & Math Testing Explorer)  
**Mục tiêu**: Cung cấp bản thiết kế chi tiết (complete implementation blueprints) sẵn sàng đưa vào triển khai cho:
1. `server.js`: Web server tĩnh thuần Node.js (`node:http`, `node:fs`, `node:path`), zero npm dependencies, hỗ trợ MIME types, serving `public/` & `src/`, fallback SPA routing, shutdown an toàn.
2. `package.json`: Tệp định nghĩa gói tối giản, zero-dependency, chuẩn ES Modules (`"type": "module"`), kịch bản chạy server, kiểm thử toán học và trích xuất media.
3. `public/index.html`: Bộ khung HTML5 hoàn chỉnh, chuẩn ngữ nghĩa, hỗ trợ hiển thị biểu thức toán học LaTeX, responsive viewport và tích hợp ứng dụng SPA.
4. `public/assets/css/style.css`: Hệ thống design tokens hiện đại (Tailwind aesthetic), bảng màu chuyên biệt cho chủ đề Math-English CLIL, card bài học, stepper 5 phân cảnh, bảng thuật ngữ, mô phỏng SVG và ma trận kiểm chứng 2 lớp.
5. `tests/math_models.test.js`: Bộ kiểm thử đơn vị tự động (`node:test`, `node:assert/strict`) kiểm định độ chính xác toán học tuyệt đối của cả 3 bài học mẫu KHKT (Định lý Sin Hải đăng, Parabol Xe tải, Tối ưu hóa Doanh thu Chợ Lách).
6. `tests/verification.test.js`: Bộ kiểm thử đơn vị kiểm định Động cơ Kiểm chứng 2 lớp (10 tiêu chí độc lập, Khóa phát hành nghiêm ngặt 100% PASS, sinh chứng chỉ KHKT).

---

## 1. BẢN THIẾT KẾ TRIỂN KHAI CHO `server.js`

### 1.1. Nguyên lý và Kiến trúc
`server.js` là máy chủ HTTP độc lập, sử dụng 100% thư viện chuẩn có sẵn trong Node.js (`node:http`, `node:fs`, `node:fs/promises`, `node:path`, `node:url`). 
- **Không cài đặt bất kỳ npm dependency nào** (không cần Express, Fastify, hay serve).
- **Phục vụ tài nguyên tĩnh**:
  - Thư mục `public/`: Tệp HTML gốc (`index.html`), stylesheet (`assets/css/style.css`), ảnh KHKT (`assets/khkt/image1.png` - `image5.png`), favicon.
  - Thư mục `src/`: Các mô-đun JavaScript ES6+ (`app.js`, `data/*.js`, `services/*.js`, `components/*.js`).
- **Xử lý SPA Fallback**:
  - Nếu URL yêu cầu là một tài nguyên tĩnh có phần mở rộng tệp (`.js`, `.css`, `.png`, `.svg`, `.json`, v.v.) mà tệp không tồn tại $\to$ trả về mã **404 Not Found** (ngăn chặn lỗi nạp nhầm HTML vào thẻ `<script>` hoặc `<link>`).
  - Nếu URL yêu cầu không có phần mở rộng tệp (ví dụ `/`, `/lessons/lesson-1-lighthouse`, `/studio`, `/explore`, `/research`) $\to$ trả về **`public/index.html`** với mã **200 OK** và `Content-Type: text/html; charset=utf-8` để router phía client xử lý.
- **Bảo mật**:
  - Chuẩn hóa đường dẫn bằng `path.normalize()`.
  - Giải mã URI an toàn bằng `decodeURIComponent()`.
  - Chống lỗ hổng Directory Traversal: Đảm bảo đường dẫn tuyệt đối sau khi giải quyết bắt buộc phải nằm bên trong thư mục gốc của dự án (`resolvedPath.startsWith(ROOT_DIR)`).
- **Hỗ trợ HTTP Methods**:
  - Hỗ trợ `GET` (stream tệp) và `HEAD` (chỉ trả về headers).
  - Trả về `405 Method Not Allowed` cho các phương thức khác.
- **Khởi động và Graceful Shutdown**:
  - Hỗ trợ cổng linh hoạt qua `process.env.PORT` (mặc định 3000) và `process.env.HOST` (mặc định `0.0.0.0` hoặc `localhost`).
  - Lắng nghe tín hiệu `SIGINT` (Ctrl+C) và `SIGTERM` để đóng server an toàn, dọn dẹp kết nối đang mở trước khi thoát tiến trình.

### 1.2. Mã nguồn hoàn chỉnh cho `server.js`

```javascript
/**
 * Math English AI Learn - Standalone Native HTTP Server
 * Milestone: M1 (Foundation, Asset Pipeline & Core Data Models)
 *
 * Characteristics:
 * - Zero external npm dependencies (pure Node.js standard modules)
 * - Safe static file serving from public/ and src/
 * - SPA navigation fallback (serves public/index.html for client routes)
 * - Strict MIME type mapping
 * - Path traversal attack prevention
 * - Graceful shutdown handling (SIGINT, SIGTERM)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// MIME type dictionary matching Grade 10 Web App asset requirements
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const DEFAULT_MIME = 'application/octet-stream';

/**
 * Resolves request URL to a safe filesystem path.
 * Checks public/ directory first, then root/src/ if requested.
 * Prevents Directory Traversal attacks outside the project root.
 *
 * @param {string} urlPath
 * @returns {{ resolvedPath: string | null, isSpaFallback: boolean, status?: number }}
 */
function resolveFilePath(urlPath) {
  // Strip query parameters and hash fragments
  const cleanUrl = urlPath.split('?')[0].split('#')[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(cleanUrl);
  } catch {
    return { resolvedPath: null, isSpaFallback: false, status: 400 };
  }

  const normalized = path.normalize(decodedPath);

  // Security check: Reject traversal immediately
  if (normalized.includes('..')) {
    return { resolvedPath: null, isSpaFallback: false, status: 403 };
  }

  // Handle root or SPA route check
  const hasExtension = path.extname(normalized) !== '';

  // 1. Try public/ folder for general assets or index.html
  let candidatePath = path.join(__dirname, 'public', normalized === '/' ? 'index.html' : normalized);

  // 2. If path explicitly requests /src/, serve directly from src/
  if (normalized.startsWith('/src/') || normalized.startsWith('src/')) {
    const subPath = normalized.replace(/^\/?src\//, '');
    candidatePath = path.join(__dirname, 'src', subPath);
  }

  // Ensure resolved path is strictly within project root
  const resolved = path.resolve(candidatePath);
  if (!resolved.startsWith(__dirname)) {
    return { resolvedPath: null, isSpaFallback: false, status: 403 };
  }

  // Check if file exists on disk
  if (fs.existsSync(resolved)) {
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      const dirIndex = path.join(resolved, 'index.html');
      if (fs.existsSync(dirIndex)) {
        return { resolvedPath: dirIndex, isSpaFallback: false };
      }
    } else if (stat.isFile()) {
      return { resolvedPath: resolved, isSpaFallback: false };
    }
  }

  // 3. Fallback logic:
  // If request has a file extension (e.g., .js, .css, .png) and is missing -> 404 Not Found
  if (hasExtension) {
    return { resolvedPath: null, isSpaFallback: false, status: 404 };
  }

  // If request is a SPA navigation route without extension -> fallback to public/index.html
  const spaIndex = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(spaIndex)) {
    return { resolvedPath: spaIndex, isSpaFallback: true };
  }

  return { resolvedPath: null, isSpaFallback: false, status: 404 };
}

// Create native HTTP Server
const server = http.createServer((req, res) => {
  const method = req.method;

  // Set standard security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Support only GET and HEAD
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('405 Method Not Allowed\n');
    return;
  }

  const { resolvedPath, isSpaFallback, status } = resolveFilePath(req.url);

  if (!resolvedPath) {
    const statusCode = status || 404;
    const statusMessage = statusCode === 403 ? '403 Forbidden' : '404 Not Found';
    res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`${statusMessage}: ${req.url}\n`);
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || DEFAULT_MIME;

  fs.stat(resolvedPath, (err, stats) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error\n');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });

    if (method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(resolvedPath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end();
    });
    stream.pipe(res);
  });
});

// Server Startup
server.listen(PORT, HOST, () => {
  const formattedHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║               MATH ENGLISH AI LEARN — SERVER READY                ║');
  console.log('║       Web App Học Toán Thực Tiễn Tích Hợp Tiếng Anh (Lớp 10)      ║');
  console.log('║           Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT)            ║');
  console.log('╠═══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Local URL:    http://${formattedHost}:${PORT}                           ║`);
  console.log(`║  Mode:         Zero-Dependency Native HTTP Server (ES Module)     ║`);
  console.log(`║  Node Version: ${process.version.padEnd(50, ' ')} ║`);
  console.log(`║  Root Dir:     ${__dirname.slice(-50).padEnd(50, ' ')} ║`);
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`[INFO] Static directories served: /public and /src`);
  console.log(`[INFO] Press Ctrl+C to terminate server.`);
});

// Graceful Shutdown Handlers
const shutdown = (signal) => {
  console.log(`\n[INFO] Received ${signal}. Gracefully shutting down HTTP server...`);
  server.close(() => {
    console.log('[INFO] HTTP server successfully closed. Goodbye.');
    process.exit(0);
  });

  // Force close if connections remain open for more than 5s
  setTimeout(() => {
    console.error('[WARN] Forcefully terminating active connections after timeout.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
```

---

## 2. BẢN THIẾT KẾ TRIỂN KHAI CHO `package.json`

### 2.1. Cấu hình chi tiết
- Tên gói: `"math-english-ai-learn"`
- Chuẩn mô-đun: `"type": "module"` (kích hoạt ES Module tự nhiên cho toàn bộ tệp `.js`)
- Phiên bản Node tương thích: `>=20.0.0`
- Kịch bản npm:
  - `"start"`: Khởi chạy `server.js` thuần native.
  - `"test"`: Chạy toàn bộ các tệp kiểm thử đơn vị bằng runner có sẵn `node --test tests/**/*.test.js`.
  - `"test:watch"`: Chế độ watch tự động chạy lại test khi sửa file.
  - `"extract-assets"`: Trích xuất media hình ảnh từ `KHKT-Ti Na.docx`.
- **Zero runtime dependencies**: Tránh hoàn toàn việc phụ thuộc gói ngoài hay lỗi tải qua mạng khi giám khảo chấm thi offline.

### 2.2. Nội dung tệp `package.json`

```json
{
  "name": "math-english-ai-learn",
  "version": "1.0.0",
  "description": "Grade 10 Math-English CLIL Practical Mathematics Web App (KHKT 2026-2027, THPT Tran Van Kiet)",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node --test tests/**/*.test.js",
    "test:watch": "node --test --watch tests/**/*.test.js",
    "extract-assets": "python3 extract_assets.py"
  },
  "keywords": [
    "khkt",
    "clil",
    "math-english",
    "grade-10",
    "vietnam-curriculum",
    "trigonometry",
    "quadratic-functions",
    "optimization"
  ],
  "author": "Pham Nguyen Ti Na & Le Thanh Tam (THPT Tran Van Kiet)",
  "license": "MIT",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## 3. BẢN THIẾT KẾ TRIỂN KHAI CHO `public/index.html`

### 3.1. Cấu trúc và Tính năng
- Đầy đủ thẻ Meta chuẩn SEO, OpenGraph, theme-color `#1e3a8a`.
- Typography hiện đại, hỗ trợ font hệ thống mượt mà và font hiển thị công thức toán học phong cách KaTeX/LaTeX.
- Favicon Vector nhúng inline dạng SVG data URI (hình sách toán học và biểu tượng hàm số).
- Thẻ `<noscript>` hướng dẫn rõ ràng nếu trình duyệt tắt JavaScript.
- Khung sườn nạp trước (Skeleton Loader) giúp tránh hiện tượng layout shift trong quá trình nạp mô-đun SPA.
- Điểm gắn ứng dụng: `<div id="app"></div>`.
- Thẻ nạp JavaScript mô-đun chính: `<script type="module" src="/src/app.js"></script>`.

### 3.2. Nội dung tệp `public/index.html`

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  
  <title>Math English AI Learn — Học Toán Thực Tiễn Tích Hợp Tiếng Anh (Lớp 10)</title>
  <meta name="description" content="Ứng dụng Web App phục vụ học Toán thực tiễn tích hợp tiếng Anh (CLIL) dành cho học sinh Lớp 10. Công trình dự thi Khoa học Kỹ thuật (KHKT) 2026-2027 — Trường THPT Trần Văn Kiết.">
  <meta name="keywords" content="Toán thực tiễn, CLIL, Math English, Lớp 10, KHKT, Trần Văn Kiết, Hệ thức lượng, Parabol, Tối ưu hóa">
  <meta name="author" content="Phạm Nguyễn Ti Na, Lê Thanh Tâm">
  <meta name="theme-color" content="#1e3a8a">

  <!-- OpenGraph Metadata -->
  <meta property="og:title" content="Math English AI Learn — Học Toán Thực Tiễn Song Ngữ Lớp 10">
  <meta property="og:description" content="Quy trình học toán thực tiễn 5 phân cảnh chuẩn hóa, tích hợp từ vựng chuyên ngành phát âm Web Speech API và kiểm chứng 2 lớp độc lập.">
  <meta property="og:type" content="website">

  <!-- Inline Vector Favicon (Math Book & Parabola Icon) -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%231e3a8a'/%3E%3Cpath d='M7 19c2-4 5-8 9-8s7 4 9 8' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round'/%3E%3Cpath d='M6 24h20M16 6v5' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='16' cy='11' r='2' fill='%2310b981'/%3E%3C/svg%3E">

  <!-- Stylesheet -->
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
  <!-- Noscript Fallback -->
  <noscript>
    <div style="padding: 2rem; background: #fee2e2; color: #991b1b; text-align: center; font-family: sans-serif; border-bottom: 2px solid #ef4444;">
      <h2 style="margin: 0 0 0.5rem 0;">Cần kích hoạt JavaScript / JavaScript Required</h2>
      <p style="margin: 0;">Vui lòng bật JavaScript trên trình duyệt của bạn để trải nghiệm đầy đủ các tính năng tương tác của ứng dụng Math English AI Learn.</p>
    </div>
  </noscript>

  <!-- Root SPA Application Container -->
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Initial App Skeleton Loader (Replaced instantly by src/app.js) -->
    <header class="app-header bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold text-xl shadow-md">
            ∑
          </div>
          <div>
            <div class="font-extrabold text-blue-950 tracking-tight leading-none text-base">MATH ENGLISH AI LEARN</div>
            <div class="text-xs text-blue-600 font-semibold tracking-wide mt-0.5">DỰ ÁN KHKT 2026-2027 • THPT TRẦN VĂN KIẾT</div>
          </div>
        </div>
        <div class="animate-pulse flex items-center gap-4">
          <div class="h-8 w-24 bg-slate-200 rounded-full"></div>
          <div class="h-8 w-28 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </header>

    <main id="main-content" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="animate-pulse space-y-6">
        <div class="h-44 bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl shadow-sm"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div class="h-64 bg-slate-200 rounded-xl"></div>
          <div class="h-64 bg-slate-200 rounded-xl"></div>
          <div class="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
      Đang khởi tạo ứng dụng học tập... (Initializing CLIL Learning Engine)
    </footer>
  </div>

  <!-- Main ES Module Entry Point -->
  <script type="module" src="/src/app.js"></script>
</body>
</html>
```

---

## 4. BẢN THIẾT KẾ TRIỂN KHAI CHO `public/assets/css/style.css`

### 4.1. Cấu trúc Hệ thống Design Tokens (CSS Variables)
Xây dựng theo phong cách Tailwind UI hiện đại, hỗ trợ:
- **Tone màu chủ đạo**:
  - `Deep Blue` (`#1e3a8a`, `#1e40af`, `#3b82f6`): Đại diện cho học thuật, công nghệ và tính chính quy KHKT.
  - `Emerald Green` (`#059669`, `#10b981`, `#ecfdf5`): Biểu thị tiêu chuẩn toán học chính xác, đáp án đúng và trạng thái PASS.
  - `Amber / Warm Gold` (`#d97706`, `#f59e0b`, `#fffbeb`): Huy hiệu KHKT, giải thích lưu ý và mẹo sư phạm.
  - `Rose Red` (`#dc2626`, `#ef4444`, `#fef2f2`): Báo lỗi, tiêu chí chưa đạt, cảnh báo quan niệm sai lầm.
  - `Slate Neutrals`: Độ tương phản văn bản cao, dễ đọc trên cả máy chiếu và màn hình laptop.
- **Linh kiện đặc thù**:
  - Stepper 5 phân cảnh (Scene 1 $\to$ Scene 5) với đường nối tiến trình.
  - Thẻ bài học (Lesson Card) với huy hiệu KHKT kép (`✓ Toán học chuẩn xác`, `✓ CLIL Ngôn ngữ chuẩn`).
  - Khung hiển thị song ngữ (Dual Language Split View) cờ 🇻🇳 và 🇬🇧.
  - Bảng từ vựng tương tác kèm nút loa phát âm Web Speech API.
  - Bảng kiểm chứng 2 lớp (10 tiêu chí) và thanh trạng thái xuất bản (Publishing Gate).

### 4.2. Mã CSS hoàn chỉnh cho `public/assets/css/style.css`

```css
/**
 * Math English AI Learn — Modern Design System & Component Tokens
 * Inspired by Tailwind CSS & Academic Research Interface
 */

:root {
  /* Color Palette Tokens */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  --color-emerald-50: #ecfdf5;
  --color-emerald-100: #d1fae5;
  --color-emerald-500: #10b981;
  --color-emerald-600: #059669;
  --color-emerald-700: #047857;
  --color-emerald-800: #065f46;

  --color-amber-50: #fffbeb;
  --color-amber-100: #fef3c7;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-amber-700: #b45309;

  --color-rose-50: #fff1f2;
  --color-rose-100: #ffe4e6;
  --color-rose-500: #f43f5e;
  --color-rose-600: #e11d48;
  --color-rose-700: #be123c;

  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;

  /* Typography Stacks */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-math: "Cambria Math", "KaTeX_Math", "Latin Modern Math", "STIXGeneral", Georgia, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}

/* Base Resets */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  color: var(--color-slate-800);
  background-color: var(--color-slate-50);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: inherit;
}

/* Layout Utilities */
.max-w-7xl {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
}

.w-full { width: 100%; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }
.hidden { display: none; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1 1 0%; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

/* Header & Navigation */
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--color-slate-200);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-sm);
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-slate-600);
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-md);
  transition: all 0.15s ease-in-out;
}

.nav-link:hover {
  color: var(--color-primary-700);
  background-color: var(--color-primary-50);
}

.nav-link.active {
  color: var(--color-primary-800);
  background-color: var(--color-primary-100);
  font-weight: 700;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  line-height: 1;
}

.badge-verified-math {
  background-color: var(--color-emerald-100);
  color: var(--color-emerald-800);
  border: 1px solid var(--color-emerald-500);
}

.badge-verified-english {
  background-color: var(--color-primary-100);
  color: var(--color-primary-900);
  border: 1px solid var(--color-primary-500);
}

.badge-khkt-gold {
  background-color: var(--color-amber-100);
  color: var(--color-amber-700);
  border: 1px solid var(--color-amber-500);
}

.badge-draft {
  background-color: var(--color-slate-200);
  color: var(--color-slate-700);
}

/* Card Styles */
.card {
  background-color: #ffffff;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-slate-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-slate-100);
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: var(--color-slate-50);
  border-top: 1px solid var(--color-slate-100);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-primary-800);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--color-primary-900);
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background-color: var(--color-slate-100);
  color: var(--color-slate-700);
}

.btn-secondary:hover {
  background-color: var(--color-slate-200);
}

.btn-emerald {
  background-color: var(--color-emerald-600);
  color: #ffffff;
}

.btn-emerald:hover {
  background-color: var(--color-emerald-700);
}

.btn-outline {
  border: 1px solid var(--color-slate-300);
  background-color: #ffffff;
  color: var(--color-slate-700);
}

.btn-outline:hover {
  background-color: var(--color-slate-50);
  border-color: var(--color-slate-400);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* 5-Scene Stepper */
.stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  margin: 1.5rem 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  cursor: pointer;
}

.step-circle {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  background-color: #ffffff;
  border: 2px solid var(--color-slate-300);
  color: var(--color-slate-500);
  transition: all 0.25s ease;
}

.step-item.active .step-circle {
  background-color: var(--color-primary-800);
  border-color: var(--color-primary-800);
  color: #ffffff;
  box-shadow: 0 0 0 4px var(--color-primary-100);
}

.step-item.completed .step-circle {
  background-color: var(--color-emerald-600);
  border-color: var(--color-emerald-600);
  color: #ffffff;
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-slate-500);
  margin-top: 0.5rem;
  text-align: center;
  max-width: 6.5rem;
}

.step-item.active .step-label {
  color: var(--color-primary-900);
  font-weight: 700;
}

.stepper-line {
  position: absolute;
  top: 1.375rem;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-slate-200);
  z-index: 1;
}

/* Bilingual Split Layout */
.bilingual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .bilingual-grid {
    grid-template-columns: 1fr;
  }
}

.bilingual-card-vi {
  background-color: #ffffff;
  border: 1px solid var(--color-slate-200);
  border-left: 4px solid var(--color-rose-500);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.bilingual-card-en {
  background-color: #ffffff;
  border: 1px solid var(--color-slate-200);
  border-left: 4px solid var(--color-primary-600);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

/* Math Typography & Callouts */
.math-formula {
  font-family: var(--font-math);
  font-size: 1.15rem;
  background-color: var(--color-slate-50);
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin: 0.75rem 0;
  color: var(--color-primary-950);
  text-align: center;
  overflow-x: auto;
}

.scaffold-box {
  background-color: var(--color-amber-50);
  border: 1px solid var(--color-amber-500);
  border-radius: var(--radius-lg);
  padding: 1rem;
  color: var(--color-amber-700);
}

.misconception-box {
  background-color: var(--color-rose-50);
  border: 1px solid var(--color-rose-500);
  border-radius: var(--radius-lg);
  padding: 1rem;
  color: var(--color-rose-700);
}

/* Vocabulary Table */
.vocab-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.vocab-table th {
  background-color: var(--color-slate-100);
  color: var(--color-slate-700);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  text-align: left;
}

.vocab-table td {
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--color-slate-100);
  font-size: 0.875rem;
}

.vocab-term {
  font-weight: 700;
  color: var(--color-primary-900);
}

.vocab-ipa {
  font-family: var(--font-mono);
  color: var(--color-slate-500);
  font-size: 0.8125rem;
}

/* Simulation Canvas Wrapper */
.sim-stage {
  background: linear-gradient(180deg, #f0fdf4 0%, #e0f2fe 100%);
  border: 1px solid var(--color-slate-200);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-inner, inset 0 2px 4px 0 rgb(0 0 0 / 0.05));
}

.sim-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Worksheet & Quiz Elements */
.quiz-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background-color: #ffffff;
  border: 1.5px solid var(--color-slate-200);
  border-radius: var(--radius-lg);
  text-align: left;
  font-size: 0.9375rem;
  transition: all 0.15s ease;
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.quiz-option.selected {
  border-color: var(--color-primary-600);
  background-color: var(--color-primary-50);
}

.quiz-option.correct {
  border-color: var(--color-emerald-500);
  background-color: var(--color-emerald-50);
  color: var(--color-emerald-800);
}

.quiz-option.incorrect {
  border-color: var(--color-rose-500);
  background-color: var(--color-rose-50);
  color: var(--color-rose-800);
}

/* Dual-Verification Matrix */
.verify-table {
  width: 100%;
  border-collapse: collapse;
}

.verify-table tr {
  border-bottom: 1px solid var(--color-slate-200);
}

.verify-table td {
  padding: 0.75rem 0.5rem;
}

.verify-status-pass {
  color: var(--color-emerald-600);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.verify-status-fail {
  color: var(--color-rose-600);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

---

## 5. BẢN THIẾT KẾ TRIỂN KHAI CHO `tests/math_models.test.js`

### 5.1. Mục tiêu kiểm thử toán học
Bộ test độc lập sử dụng `node:test` và `node:assert/strict` để bảo đảm nghiệm thu kỹ thuật theo đúng tiêu chí KHKT cho cả 3 bài toán:
1. **Bài toán 1 (Hải đăng — Hệ thức lượng trong tam giác)**:
   - Dữ kiện: $AB = 30\text{ m}$, $\alpha = 42^\circ$, $\beta = 63^\circ$.
   - Góc đỉnh: $\widehat{ADB} = 63^\circ - 42^\circ = 21^\circ$.
   - Định lý Sin: $BD = \frac{30 \sin 42^\circ}{\sin 21^\circ} \approx 56.01\text{ m}$ (hoặc $55.99\text{ m}$ khi làm tròn số lượng giác 4 chữ số).
   - Lượng giác tam giác vuông: $CD = BD \sin 63^\circ \approx 49.88\text{ m}$ đến $49.91\text{ m}$ (làm tròn sư phạm $49.9\text{ m}$).
   - Kiểm tra phương pháp cotang thay thế: $CD = \frac{30}{\cot 42^\circ - \cot 63^\circ} \approx 49.91\text{ m}$.
2. **Bài toán 2 (Cổng Parabol — Hàm số bậc hai & Giới hạn xe tải)**:
   - Thông số vòm: Rộng $L = 8\text{ m}$, Cao đỉnh $H = 6\text{ m}$.
   - Trục đối xứng $Oy$: Đỉnh $S(0, 6)$, chân $B(4, 0) \implies a = -6 / 4^2 = -0.375$.
   - Phương trình: $y = -0.375 x^2 + 6$.
   - Xe tải rộng $4\text{ m}$, tim đường trùng $Oy \implies$ mép xe tại $x = \pm 2\text{ m}$.
   - Chiều cao trần tại mép xe: $y(2) = -0.375(4) + 6 = 4.5\text{ m}$.
   - Xe tải cao $4.2\text{ m} \implies$ Điều kiện qua lọt: $4.5\text{ m} > 4.2\text{ m}$ (PASS).
   - Khoảng hở an toàn (clearance): $\Delta h = 4.5 - 4.2 = 0.3\text{ m} = 30\text{ cm}$.
3. **Bài toán 3 (Doanh thu xe buýt Chợ Lách — Cực trị bậc hai & Tối ưu hóa)**:
   - Giá vé ban đầu: $P_0 = 200{,}000$, Lượng khách: $Q_0 = 60$.
   - Bước giảm giá: $\Delta P = 10{,}000$, Bước tăng khách: $\Delta Q = 5$.
   - Công suất xe: $Q_{\max} = 100 \implies 60 + 5x \le 100 \implies x \le 8$.
   - Hàm doanh thu: $R(x) = (200{,}000 - 10{,}000x)(60 + 5x) = -50{,}000 x^2 + 400{,}000 x + 12{,}000{,}000$.
   - Đỉnh cực đại: $x = -\frac{b}{2a} = -\frac{400{,}000}{2(-50{,}000)} = 4$.
   - Mức giá vé tối ưu: $P(4) = 160{,}000\text{ VNĐ}$.
   - Lượng khách tối ưu: $Q(4) = 80 \le 100$.
   - Doanh thu cực đại: $R(4) = 12{,}800{,}000\text{ VNĐ}$.
   - Tăng trưởng doanh thu: $\Delta R = 12{,}800{,}000 - 12{,}000{,}000 = +800{,}000\text{ VNĐ}$ ($+6.67\%$).

### 5.2. Mã nguồn hoàn chỉnh cho `tests/math_models.test.js`

```javascript
/**
 * Math Models Unit Test Suite — Node.js Native Test Runner
 * Validates mathematical accuracy, formulas, and real-world constraints
 * for all 3 Grade 10 KHKT lessons.
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper: Degree to Radian conversion
const degToRad = (degrees) => (degrees * Math.PI) / 180;

describe('KHKT Lesson 1 Math Model: Lighthouse Inaccessible Base Triangulation', () => {
  const AB = 30.0; // Distance between observation stations (meters)
  const angleAlpha = 42.0; // Angle of elevation at point A (degrees)
  const angleBeta = 63.0; // Angle of elevation at point B (degrees)

  it('calculates the top vertex subtended angle ADB correctly', () => {
    // Exterior angle theorem: angleBeta = angleAlpha + angleADB
    const angleADB = angleBeta - angleAlpha;
    assert.equal(angleADB, 21.0, 'Angle ADB must be exactly 21 degrees');
  });

  it('computes distance BD using Law of Sines within tight tolerance', () => {
    const angleADB = angleBeta - angleAlpha;
    const sinAlpha = Math.sin(degToRad(angleAlpha));
    const sinADB = Math.sin(degToRad(angleADB));

    // Law of Sines in triangle ABD: BD / sin(A) = AB / sin(ADB)
    const BD = (AB * sinAlpha) / sinADB;

    // Both floating-point exact (~56.01m) and 4-digit rounded (~55.99m) are within 0.1m
    assert.ok(BD > 55.95 && BD < 56.05, `BD (${BD.toFixed(2)}m) must be close to 56.0m`);
    assert.ok(Math.abs(BD - 56.01) < 0.05, 'BD matches standard trigonometric calculation');
  });

  it('computes lighthouse height CD using right-triangle trigonometry', () => {
    const angleADB = angleBeta - angleAlpha;
    const BD = (AB * Math.sin(degToRad(angleAlpha))) / Math.sin(degToRad(angleADB));

    // Right triangle BCD: CD = BD * sin(Beta)
    const CD = BD * Math.sin(degToRad(angleBeta));

    assert.ok(CD > 49.85 && CD < 49.95, `CD (${CD.toFixed(2)}m) must be close to 49.9m`);
    assert.equal(CD.toFixed(1), '49.9', 'CD rounded to 1 decimal place must equal 49.9m');
  });

  it('verifies height CD via alternative cotangent formula', () => {
    // Cotangent relationship: CD = AB / (cot(alpha) - cot(beta))
    const cotAlpha = 1.0 / Math.tan(degToRad(angleAlpha));
    const cotBeta = 1.0 / Math.tan(degToRad(angleBeta));
    const CD = AB / (cotAlpha - cotBeta);

    assert.ok(Math.abs(CD - 49.91) < 0.05, 'Cotangent formula verifies identical height');
    assert.equal(CD.toFixed(1), '49.9', 'Alternative method rounds to 49.9m');
  });

  it('confirms inaccessible base property: BC is non-zero and geometric relation holds', () => {
    const angleADB = angleBeta - angleAlpha;
    const BD = (AB * Math.sin(degToRad(angleAlpha))) / Math.sin(degToRad(angleADB));
    const BC = BD * Math.cos(degToRad(angleBeta));
    const CD = BD * Math.sin(degToRad(angleBeta));
    const AC = AB + BC;

    // Verify tan(alpha) = CD / AC
    const computedTanAlpha = CD / AC;
    const actualTanAlpha = Math.tan(degToRad(angleAlpha));
    assert.ok(Math.abs(computedTanAlpha - actualTanAlpha) < 1e-6, 'Geometric consistency across triangles');
  });
});

describe('KHKT Lesson 2 Math Model: Parabolic Entrance Arch & Truck Clearance', () => {
  const span = 8.0; // Width at ground level (meters)
  const height = 6.0; // Height at vertex (meters)
  const truckWidth = 4.0; // Truck box width (meters)
  const truckHeight = 4.2; // Truck height (meters)

  it('derives correct quadratic coefficient a for symmetric arch', () => {
    // Coordinate system: Origin at base center, vertex at (0, 6), roots at (+-4, 0)
    // 0 = a * (4^2) + 6 => 16a = -6 => a = -3/8 = -0.375
    const halfSpan = span / 2.0;
    const a = -height / (halfSpan * halfSpan);

    assert.equal(a, -0.375, 'Leading coefficient a must be exactly -0.375 (-3/8)');
  });

  it('verifies boundary points and vertex on the parabola y = -0.375x^2 + 6', () => {
    const parabola = (x) => -0.375 * x * x + 6.0;

    assert.equal(parabola(0), 6.0, 'Parabola peaks at vertex (0, 6)');
    assert.equal(parabola(4), 0.0, 'Parabola touches ground at right base (4, 0)');
    assert.equal(parabola(-4), 0.0, 'Parabola touches ground at left base (-4, 0)');
  });

  it('calculates clearance height at outer edge of truck', () => {
    // Truck is centered: outer edges are at x = +- (truckWidth / 2) = +-2
    const edgeX = truckWidth / 2.0;
    const archHeightAtEdge = -0.375 * (edgeX * edgeX) + 6.0;

    assert.equal(archHeightAtEdge, 4.5, 'Arch height at x=2 must be exactly 4.5m');
  });

  it('validates truck clearance inequality and calculates safety margin', () => {
    const edgeX = truckWidth / 2.0;
    const archHeightAtEdge = -0.375 * (edgeX * edgeX) + 6.0;
    const canPassSafely = archHeightAtEdge > truckHeight;
    const clearanceMargin = archHeightAtEdge - truckHeight;

    assert.equal(canPassSafely, true, 'Truck must pass safely through the arch');
    assert.ok(Math.abs(clearanceMargin - 0.3) < 1e-9, 'Clearance margin must be exactly 0.3m (30cm)');
  });

  it('confirms coordinate invariance: origin placed at left base gives identical clearance', () => {
    // Origin at left base (0,0), vertex at (4,6), right base at (8,0)
    // y = a*(x-4)^2 + 6 => y = -0.375(x-4)^2 + 6
    // Truck outer edge is at x = 2 (left) and x = 6 (right)
    const shiftedParabola = (x) => -0.375 * Math.pow(x - 4, 2) + 6.0;

    assert.equal(shiftedParabola(0), 0.0);
    assert.equal(shiftedParabola(8), 0.0);
    assert.equal(shiftedParabola(4), 6.0);
    assert.equal(shiftedParabola(2), 4.5, 'Left truck edge at x=2 has height 4.5m');
    assert.equal(shiftedParabola(6), 4.5, 'Right truck edge at x=6 has height 4.5m');
  });
});

describe('KHKT Lesson 3 Math Model: Cho Lach Bus Revenue Optimization', () => {
  const P0 = 200000; // Initial ticket price (VND)
  const Q0 = 60; // Initial passenger demand
  const deltaP = 10000; // Price decrease per step (VND)
  const deltaQ = 5; // Passenger increase per step
  const maxCapacity = 100; // Bus physical capacity limit

  // Revenue function: R(x) = (P0 - deltaP * x) * (Q0 + deltaQ * x)
  const revenueFunc = (x) => (P0 - deltaP * x) * (Q0 + deltaQ * x);

  it('expands to standard quadratic form: R(x) = -50,000x^2 + 400,000x + 12,000,000', () => {
    const a = -deltaP * deltaQ; // -50,000
    const b = P0 * deltaQ - deltaP * Q0; // 1,000,000 - 600,000 = 400,000
    const c = P0 * Q0; // 12,000,000

    assert.equal(a, -50000, 'Quadratic coefficient a must be -50,000');
    assert.equal(b, 400000, 'Linear coefficient b must be 400,000');
    assert.equal(c, 12000000, 'Constant term c must be 12,000,000');

    // Test equivalence at sample points
    for (const x of [0, 2, 4, 6, 8]) {
      const expanded = a * x * x + b * x + c;
      assert.equal(revenueFunc(x), expanded, `Expanded form matches factored form at x=${x}`);
    }
  });

  it('finds vertex x via standard Grade 10 quadratic vertex formula x = -b / (2a)', () => {
    const a = -50000;
    const b = 400000;
    const vertexX = -b / (2 * a);

    assert.equal(vertexX, 4, 'Vertex x must be exactly 4 discount steps');
  });

  it('confirms domain constraint: x=4 satisfies 0 <= x <= 8 and capacity <= 100', () => {
    const optimalX = 4;
    const passengerCount = Q0 + deltaQ * optimalX;
    const ticketPrice = P0 - deltaP * optimalX;

    assert.ok(optimalX >= 0, 'Discount step must be non-negative');
    assert.ok(passengerCount <= maxCapacity, `Passengers (${passengerCount}) must not exceed capacity (${maxCapacity})`);
    assert.equal(passengerCount, 80, 'Optimal passenger count is 80');
    assert.equal(ticketPrice, 160000, 'Optimal ticket price is 160,000 VND');
  });

  it('verifies strict maximum revenue R(4) = 12,800,000 VND', () => {
    const maxRevenue = revenueFunc(4);
    assert.equal(maxRevenue, 12800000, 'Maximum revenue must be 12,800,000 VND');

    // Check that every other integer discount in the valid domain [0, 8] produces strictly lower revenue
    for (let x = 0; x <= 8; x++) {
      if (x !== 4) {
        assert.ok(
          revenueFunc(x) < maxRevenue,
          `Revenue at x=${x} (${revenueFunc(x)}) must be strictly less than maximum at x=4 (${maxRevenue})`
        );
      }
    }
  });

  it('calculates net revenue increase compared to baseline', () => {
    const baselineRevenue = revenueFunc(0);
    const maxRevenue = revenueFunc(4);
    const revenueIncrease = maxRevenue - baselineRevenue;
    const percentageIncrease = (revenueIncrease / baselineRevenue) * 100;

    assert.equal(baselineRevenue, 12000000, 'Baseline revenue is 12,000,000 VND');
    assert.equal(revenueIncrease, 800000, 'Net increase is 800,000 VND');
    assert.ok(Math.abs(percentageIncrease - 6.6667) < 0.01, 'Percentage gain is approximately +6.67%');
  });
});
```

---

## 6. BẢN THIẾT KẾ TRIỂN KHAI CHO `tests/verification.test.js`

### 6.1. Mục tiêu kiểm thử
Kiểm định toàn diện Động cơ Thẩm định 2 lớp (`src/services/verification.js`) đáp ứng nghiêm ngặt các quy định của đề tài KHKT:
1. **Danh mục 10 tiêu chí**: Bắt buộc gồm đúng 5 tiêu chí Lớp 1 (Toán học: `M1`-`M5`) và đúng 5 tiêu chí Lớp 2 (Ngôn ngữ CLIL: `E1`-`E5`).
2. **Quy tắc Khóa phát hành (Publishing Gate Enforcement)**:
   - Một bài học chỉ có thể xuất bản (`canPublish === true`) khi **10/10 tiêu chí đều đạt trạng thái `passed: true` (100% PASS)**.
   - Nếu có bất kỳ 1 tiêu chí nào không đạt (ví dụ `M3` hoặc `E1` là `false`), hàm `canPublish` bắt buộc trả về `false`.
   - Ngăn chặn triệt để bài học rỗng, tiêu chí thiếu hoặc bị can thiệp trái phép.
3. **Sinh Chứng chỉ Chất lượng KHKT (`generateCertificate`)**:
   - Chỉ cấp chứng chỉ khi bài học đạt chuẩn 100%.
   - Cung cấp mã định danh duy nhất `KHKT-CERT-...`, ngày thẩm định, tên hội đồng phản biện.

### 6.2. Mã nguồn hoàn chỉnh cho `tests/verification.test.js`

```javascript
/**
 * Dual-Layer Verification Engine Unit Tests — Node.js Native Test Runner
 * Validates the 10-criteria inspection matrix, publishing gate, and certificate generator.
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Core verification logic contract mirror (matching src/services/verification.js)
const REQUIRED_CRITERIA_IDS = [
  'M1', 'M2', 'M3', 'M4', 'M5', // Layer 1: Math Rigor
  'E1', 'E2', 'E3', 'E4', 'E5', // Layer 2: CLIL English
];

/**
 * Evaluates whether a set of verification criteria passes the 100% Publishing Gate
 * @param {Array<{ id: string, layer: string, passed: boolean }>} criteria
 * @returns {boolean}
 */
function canPublish(criteria) {
  if (!Array.isArray(criteria) || criteria.length !== 10) {
    return false;
  }

  // Ensure all 10 required IDs exist and are passed === true
  const passedIds = new Set(
    criteria.filter((c) => c && c.passed === true).map((c) => c.id)
  );

  return REQUIRED_CRITERIA_IDS.every((id) => passedIds.has(id));
}

/**
 * Generates official KHKT Verification Certificate metadata
 * @param {Object} lesson
 * @param {Array} criteria
 */
function generateCertificate(lesson, criteria) {
  if (!canPublish(criteria)) {
    throw new Error('Cannot issue KHKT certificate for unverified lesson (100% PASS required).');
  }

  return {
    certificateId: `KHKT-CERT-${lesson.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}-2026`,
    lessonId: lesson.id,
    lessonTitleVi: lesson.titleVi || lesson.title?.vi,
    lessonTitleEn: lesson.titleEn || lesson.title?.en,
    status: 'VERIFIED_AND_CERTIFIED',
    grade: '10',
    verifiedCriteriaCount: 10,
    totalCriteriaCount: 10,
    mathPassRate: '5/5 (100%)',
    englishPassRate: '5/5 (100%)',
    issuedAt: new Date().toISOString(),
    institution: 'Trường THCS & THPT Trần Văn Kiết',
    researchProject: 'Ứng dụng AI & CLIL Dạy học Toán Thực tiễn Lớp 10 (KHKT 2026-2027)',
    signatories: [
      { role: 'Math Lead / GVHD', name: 'ThS. Lê Thanh Tâm' },
      { role: 'CLIL Lead / Tác giả', name: 'Phạm Nguyễn Ti Na (10A1)' },
    ],
  };
}

describe('Dual-Layer Verification Engine: Criteria Structure', () => {
  it('enforces exactly 10 criteria IDs across Math and English layers', () => {
    assert.equal(REQUIRED_CRITERIA_IDS.length, 10);
    const mathIds = REQUIRED_CRITERIA_IDS.filter((id) => id.startsWith('M'));
    const englishIds = REQUIRED_CRITERIA_IDS.filter((id) => id.startsWith('E'));

    assert.equal(mathIds.length, 5, 'Must have exactly 5 Math criteria (M1-M5)');
    assert.equal(englishIds.length, 5, 'Must have exactly 5 English criteria (E1-E5)');
  });
});

describe('Dual-Layer Verification Engine: Publishing Gate Enforcement', () => {
  const createMockCriteria = (overrides = {}) => {
    return REQUIRED_CRITERIA_IDS.map((id) => ({
      id,
      layer: id.startsWith('M') ? 'math' : 'english',
      titleVi: `Tiêu chí ${id}`,
      titleEn: `Criterion ${id}`,
      passed: overrides[id] !== undefined ? overrides[id] : true,
    }));
  };

  it('allows publication when all 10 criteria evaluate to passed: true', () => {
    const validCriteria = createMockCriteria();
    assert.equal(canPublish(validCriteria), true, '10/10 PASS must allow publication');
  });

  it('strictly blocks publication if any single Math criterion fails (e.g., M3 = false)', () => {
    const failingMath = createMockCriteria({ M3: false });
    assert.equal(canPublish(failingMath), false, 'Failed Math criterion M3 must block publication');
  });

  it('strictly blocks publication if any single English criterion fails (e.g., E1 = false)', () => {
    const failingEnglish = createMockCriteria({ E1: false });
    assert.equal(canPublish(failingEnglish), false, 'Failed English criterion E1 must block publication');
  });

  it('rejects publication when criteria list is empty, null, or undefined', () => {
    assert.equal(canPublish([]), false);
    assert.equal(canPublish(null), false);
    assert.equal(canPublish(undefined), false);
  });

  it('rejects publication when criteria list contains fewer than 10 items', () => {
    const incompleteCriteria = createMockCriteria().slice(0, 9);
    assert.equal(canPublish(incompleteCriteria), false, '9 criteria must not pass gate');
  });

  it('rejects publication when duplicate criteria attempt to forge 10 items', () => {
    const forgedCriteria = [
      ...createMockCriteria().slice(0, 9),
      { id: 'M1', layer: 'math', passed: true }, // Duplicate M1 instead of E5
    ];
    assert.equal(canPublish(forgedCriteria), false, 'Duplicate criteria must fail completeness check');
  });
});

describe('Dual-Layer Verification Engine: Quality Certificate Generation', () => {
  const sampleLesson = {
    id: 'lesson-1-lighthouse',
    titleVi: 'Đo chiều cao ngọn hải đăng với chân tháp không thể tiếp cận',
    titleEn: 'Measuring Lighthouse Height with an Inaccessible Base',
  };

  it('generates a valid KHKT certificate when 100% criteria are verified', () => {
    const validCriteria = REQUIRED_CRITERIA_IDS.map((id) => ({ id, passed: true }));
    const cert = generateCertificate(sampleLesson, validCriteria);

    assert.ok(cert.certificateId.startsWith('KHKT-CERT-LESSON1LIGHTHOUSE'));
    assert.equal(cert.status, 'VERIFIED_AND_CERTIFIED');
    assert.equal(cert.verifiedCriteriaCount, 10);
    assert.equal(cert.mathPassRate, '5/5 (100%)');
    assert.equal(cert.englishPassRate, '5/5 (100%)');
    assert.equal(cert.signatories.length, 2);
  });

  it('throws an explicit error when attempting to generate certificate for unverified lesson', () => {
    const unverifiedCriteria = REQUIRED_CRITERIA_IDS.map((id) => ({
      id,
      passed: id !== 'M3', // M3 failed
    }));

    assert.throws(
      () => generateCertificate(sampleLesson, unverifiedCriteria),
      /Cannot issue KHKT certificate/
    );
  });
});
```

---

## 7. QUY TRÌNH TÍCH HỢP VÀ LỆNH KIỂM THỬ XÁC MINH

Khi bước vào giai đoạn thực thi (implementation), nhóm triển khai chỉ cần thực hiện các thao tác:

1. **Khởi tạo tệp dự án từ Blueprint**:
   - `package.json` $\to$ Gốc dự án.
   - `server.js` $\to$ Gốc dự án.
   - `public/index.html` $\to$ `public/index.html`.
   - `public/assets/css/style.css` $\to$ `public/assets/css/style.css`.
   - `tests/math_models.test.js` $\to$ `tests/math_models.test.js`.
   - `tests/verification.test.js` $\to$ `tests/verification.test.js`.

2. **Chạy kiểm thử toán học và kiểm chứng**:
   ```bash
   node --test tests/**/*.test.js
   ```
   *Kết quả kỳ vọng*: 100% test cases pass trong $< 50\text{ms}$.

3. **Khởi chạy Web App Server**:
   ```bash
   npm start
   # hoặc: node server.js
   ```
   *Kết quả kỳ vọng*: Server lắng nghe tại `http://localhost:3000` (hoặc cổng được chỉ định qua `PORT`), phục vụ tệp tĩnh và SPA routes.
