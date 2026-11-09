/**
 * Build Script for Vercel & Production Static Deployment
 * Math English AI Learn (Grade 10 CLIL - KHKT 2026-2027)
 *
 * Characteristics:
 * - Zero external dependencies (uses standard Node.js modules)
 * - Bundles public assets and src ES modules into dist/
 * - Performs integrity verification on critical deployment artifacts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SRC_DIR = path.join(__dirname, 'src');

console.log('🚀 [BUILD] Starting production build for Vercel deployment...');

// 1. Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  console.log('🧹 [BUILD] Cleaned previous dist/ directory.');
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 2. Copy public/ contents to dist/
if (fs.existsSync(PUBLIC_DIR)) {
  fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true });
  console.log('📦 [BUILD] Copied public/ -> dist/');
} else {
  console.error('❌ [BUILD] Missing public/ directory!');
  process.exit(1);
}

// 3. Copy src/ contents to dist/src/
const DIST_SRC = path.join(DIST_DIR, 'src');
if (fs.existsSync(SRC_DIR)) {
  fs.cpSync(SRC_DIR, DIST_SRC, { recursive: true });
  console.log('📦 [BUILD] Copied src/ -> dist/src/');
} else {
  console.error('❌ [BUILD] Missing src/ directory!');
  process.exit(1);
}

// 4. Verification of critical files
const CRITICAL_FILES = [
  path.join(DIST_DIR, 'index.html'),
  path.join(DIST_DIR, 'assets', 'css', 'style.css'),
  path.join(DIST_DIR, 'src', 'app.js'),
  path.join(DIST_DIR, 'src', 'data', 'lessons.js'),
  path.join(DIST_DIR, 'src', 'components', 'Header.js'),
  path.join(DIST_DIR, 'src', 'components', 'CollectionExplorer.js'),
  path.join(DIST_DIR, 'src', 'components', 'LessonPlayer.js'),
  path.join(DIST_DIR, 'src', 'components', 'KhktShowcasePage.js'),
  path.join(DIST_DIR, 'assets', 'khkt', 'image1.png'),
  path.join(DIST_DIR, 'assets', 'khkt', 'hinh1_quy_trinh_7_buoc.png')
];

let missingCount = 0;
for (const filePath of CRITICAL_FILES) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [BUILD] Critical file missing: ${path.relative(__dirname, filePath)}`);
    missingCount++;
  }
}

if (missingCount > 0) {
  console.error(`❌ [BUILD] Build failed with ${missingCount} missing critical files.`);
  process.exit(1);
}

// 5. Verification of ES module imports in dist/src
async function validateModuleImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await validateModuleImports(fullPath);
    } else if (entry.name.endsWith('.js')) {
      try {
        await import(fullPath);
      } catch (err) {
        console.error(`❌ [BUILD] ES Module Import/Export Error in ${path.relative(__dirname, fullPath)}: ${err.message}`);
        process.exit(1);
      }
    }
  }
}
await validateModuleImports(DIST_SRC);
console.log('🔍 [BUILD] All ES module exports & imports verified successfully.');

// 6. Calculate statistics
function countFilesAndSize(dir) {
  let count = 0;
  let totalBytes = 0;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = countFilesAndSize(fullPath);
      count += sub.count;
      totalBytes += sub.totalBytes;
    } else if (entry.isFile()) {
      count++;
      totalBytes += fs.statSync(fullPath).size;
    }
  }

  return { count, totalBytes };
}

const stats = countFilesAndSize(DIST_DIR);
const sizeMb = (stats.totalBytes / (1024 * 1024)).toFixed(2);

// 7. Generate Vercel Build Output API v3 (.vercel/output)
const VERCEL_OUTPUT_DIR = path.join(__dirname, '.vercel', 'output');
const VERCEL_STATIC_DIR = path.join(VERCEL_OUTPUT_DIR, 'static');

try {
  if (fs.existsSync(VERCEL_OUTPUT_DIR)) {
    fs.rmSync(VERCEL_OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VERCEL_STATIC_DIR, { recursive: true });

  // Copy all dist/ contents into .vercel/output/static/
  fs.cpSync(DIST_DIR, VERCEL_STATIC_DIR, { recursive: true });

  // Write .vercel/output/config.json
  const vercelConfig = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/index.html' }
    ]
  };
  fs.writeFileSync(
    path.join(VERCEL_OUTPUT_DIR, 'config.json'),
    JSON.stringify(vercelConfig, null, 2),
    'utf8'
  );
  console.log('⚡ [BUILD] Generated Vercel Build Output API v3 (.vercel/output/)');
} catch (err) {
  console.warn('⚠️ [BUILD] Note on .vercel/output:', err.message);
}

console.log('✅ [BUILD] Build successful!');
console.log(`📁 [BUILD] Output Directory: ${DIST_DIR}`);
console.log(`📊 [BUILD] Total Artifacts: ${stats.count} files (~${sizeMb} MB)`);
console.log('🎉 [BUILD] Ready for Vercel production deployment.');
