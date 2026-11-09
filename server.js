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
  if (cleanUrl.includes('..') || decodedPath.includes('..') || normalized.includes('..')) {
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
export function handleRequest(req, res) {
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
}

export const server = http.createServer(handleRequest);

// Standalone Server Startup (only outside Vercel serverless environment)
if (process.env.VERCEL !== '1') {
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

    setTimeout(() => {
      console.error('[WARN] Forcefully terminating active connections after timeout.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default function handler(req, res) {
  return handleRequest(req, res);
}
