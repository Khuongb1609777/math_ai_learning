/**
 * tests/e2e/runner.js
 * Standalone E2E Test Runner for Math-English CLIL Web App (Grade 10 - KHKT)
 *
 * Usage:
 *   node tests/e2e/runner.js                 # Run all 4 tiers
 *   node tests/e2e/runner.js --tier=1        # Run Tier 1 only
 *   node tests/e2e/runner.js --feature=F1    # Run tests matching feature F1
 *   node tests/e2e/runner.js --verbose       # Show stack traces and timings
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ANSI Color constants
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BG_RED = '\x1b[41m';
const BG_GREEN = '\x1b[42m';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  tier: null,
  feature: null,
  grep: null,
  verbose: args.includes('--verbose') || args.includes('-v'),
  bail: args.includes('--bail'),
};

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    options.tier = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--feature=')) {
    options.feature = arg.split('=')[1].toUpperCase();
  } else if (arg.startsWith('--grep=')) {
    options.grep = new RegExp(arg.split('=')[1], 'i');
  }
}

// Registry for tests
export const registry = {
  suites: [],
  currentTier: 1,
  currentFeature: 'GENERAL',
};

/**
 * Register a test case
 * @param {string} name - Test description
 * @param {Function} fn - Async or sync test function
 * @param {Object} [meta] - Metadata { tier, feature }
 */
export function test(name, fn, meta = {}) {
  const tier = meta.tier ?? registry.currentTier;
  const feature = meta.feature ?? registry.currentFeature;
  registry.suites.push({
    name,
    fn,
    tier,
    feature,
  });
}

/**
 * Set active tier context
 * @param {number} tier
 */
export function setTier(tier) {
  registry.currentTier = tier;
}

/**
 * Set active feature context
 * @param {string} feature
 */
export function setFeature(feature) {
  registry.currentFeature = feature;
}

// Re-export assert for test files
export { assert };

/**
 * Helper to dynamically load an application module if it exists
 * @param {string} relativePath - Path relative to project root
 * @returns {Promise<any|null>}
 */
export async function loadAppModule(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  try {
    return await import(`file://${fullPath}?t=${Date.now()}`);
  } catch (err) {
    if (options.verbose) {
      console.warn(`[WARN] Failed to load module ${relativePath}:`, err.message);
    }
    return null;
  }
}

/**
 * Helper to read a project file as text
 * @param {string} relativePath
 * @returns {string|null}
 */
export function readProjectFile(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Helper to check file existence
 * @param {string} relativePath
 * @returns {boolean}
 */
export function fileExists(relativePath) {
  return fs.existsSync(path.resolve(PROJECT_ROOT, relativePath));
}

/**
 * In-memory Mock LocalStorage implementation
 */
export class MockLocalStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) {
    return this._store.has(String(key)) ? this._store.get(String(key)) : null;
  }
  setItem(key, value) {
    this._store.set(String(key), String(value));
  }
  removeItem(key) {
    this._store.delete(String(key));
  }
  clear() {
    this._store.clear();
  }
  get length() {
    return this._store.size;
  }
  key(index) {
    const keys = Array.from(this._store.keys());
    return keys[index] ?? null;
  }
}

/**
 * In-memory Mock SpeechSynthesis implementation
 */
export class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.paused = false;
    this.pending = false;
    this.lastUtterance = null;
    this.history = [];
  }
  speak(utterance) {
    this.speaking = true;
    this.lastUtterance = utterance;
    this.history.push(utterance);
    // Simulate immediate asynchronous completion
    setTimeout(() => {
      this.speaking = false;
      if (utterance.onend) utterance.onend();
    }, 10);
  }
  cancel() {
    this.speaking = false;
    this.paused = false;
    this.pending = false;
  }
  getVoices() {
    return [
      { name: 'Google US English', lang: 'en-US', default: true },
      { name: 'Google Vietnamese', lang: 'vi-VN', default: false },
    ];
  }
}

export class MockSpeechSynthesisUtterance {
  constructor(text = '') {
    this.text = text;
    this.lang = 'en-US';
    this.pitch = 1.0;
    this.rate = 1.0;
    this.voice = null;
    this.onend = null;
    this.onerror = null;
  }
}

/**
 * Creates a browser-like mock execution context for client-side scripts
 */
export function createBrowserContext() {
  const localStorage = new MockLocalStorage();
  const speechSynthesis = new MockSpeechSynthesis();

  const mockWindow = {
    localStorage,
    speechSynthesis,
    SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
    location: { href: 'http://localhost:3000/' },
    navigator: { userAgent: 'E2E-Opaque-Runner/1.0', onLine: true },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    CustomEvent: class CustomEvent {
      constructor(type, detail = {}) {
        this.type = type;
        this.detail = detail;
      }
    },
  };

  const mockDocument = {
    title: 'Math English AI Learn',
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      attributes: {},
      children: [],
      setAttribute: function (k, v) { this.attributes[k] = v; },
      getAttribute: function (k) { return this.attributes[k]; },
      appendChild: function (c) { this.children.push(c); },
      addEventListener: () => {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
      },
    }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    body: { appendChild: () => {}, innerHTML: '' },
  };

  return { window: mockWindow, document: mockDocument, localStorage, speechSynthesis };
}

/**
 * Helper to perform an HTTP GET request against a running server
 * @param {string} url - Target URL e.g. http://localhost:3000/
 * @returns {Promise<{statusCode: number, headers: Object, body: string}>}
 */
export function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error(`HTTP request to ${url} timed out after 3000ms`));
    });
  });
}

// -------------------------------------------------------------
// Test Execution Engine
// -------------------------------------------------------------
async function run() {
  const startTime = Date.now();

  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   E2E TEST RUNNER — MATH-ENGLISH CLIL WEB APP (GRADE 10 - KHKT) ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${DIM}Project Root: ${PROJECT_ROOT}${RESET}`);
  console.log(`${DIM}Filters: tier=${options.tier ?? 'all'}, feature=${options.feature ?? 'all'}, grep=${options.grep ?? 'none'}${RESET}\n`);

  // Load test suite files
  const testFiles = [
    'tier1_features.test.js',
    'tier2_boundaries.test.js',
    'tier3_pairwise.test.js',
    'tier4_scenarios.test.js',
  ];

  for (const file of testFiles) {
    const fullPath = path.resolve(__dirname, file);
    if (fs.existsSync(fullPath)) {
      try {
        await import(`file://${fullPath}?t=${Date.now()}`);
      } catch (err) {
        console.error(`${RED}[ERROR] Failed to load test suite ${file}:${RESET}`, err);
        process.exit(1);
      }
    } else {
      console.warn(`${YELLOW}[WARN] Test suite file missing: ${file}${RESET}`);
    }
  }

  // Filter tests based on options
  const testsToRun = registry.suites.filter((t) => {
    if (options.tier !== null && t.tier !== options.tier) return false;
    if (options.feature !== null && t.feature !== options.feature) return false;
    if (options.grep !== null && !options.grep.test(t.name)) return false;
    return true;
  });

  console.log(`${BOLD}Discovered ${registry.suites.length} tests. Running ${testsToRun.length} selected tests...${RESET}\n`);

  let passed = 0;
  let failed = 0;
  const failureList = [];
  const featureStats = {};
  const tierStats = { 1: { pass: 0, fail: 0 }, 2: { pass: 0, fail: 0 }, 3: { pass: 0, fail: 0 }, 4: { pass: 0, fail: 0 } };

  // Execute each test sequentially
  for (let i = 0; i < testsToRun.length; i++) {
    const item = testsToRun[i];
    const testId = `[T${item.tier}:${item.feature}]`;
    const testName = `${testId} ${item.name}`;

    // Track feature stats
    if (!featureStats[item.feature]) {
      featureStats[item.feature] = { pass: 0, fail: 0 };
    }

    const t0 = Date.now();
    try {
      await item.fn();
      const elapsed = Date.now() - t0;
      passed++;
      tierStats[item.tier].pass++;
      featureStats[item.feature].pass++;

      if (options.verbose) {
        console.log(`  ${GREEN}✓ PASS${RESET} ${DIM}(${elapsed}ms)${RESET} ${testName}`);
      } else {
        process.stdout.write(`${GREEN}.${RESET}`);
        if ((i + 1) % 50 === 0 || i === testsToRun.length - 1) {
          process.stdout.write(`  [${i + 1}/${testsToRun.length}]\n`);
        }
      }
    } catch (err) {
      const elapsed = Date.now() - t0;
      failed++;
      tierStats[item.tier].fail++;
      featureStats[item.feature].fail++;

      failureList.push({
        name: testName,
        tier: item.tier,
        feature: item.feature,
        error: err,
        elapsed,
      });

      if (options.verbose) {
        console.log(`  ${RED}✗ FAIL${RESET} ${DIM}(${elapsed}ms)${RESET} ${testName}`);
        console.log(`    ${RED}${err.message}${RESET}`);
      } else {
        process.stdout.write(`${RED}F${RESET}`);
        if ((i + 1) % 50 === 0 || i === testsToRun.length - 1) {
          process.stdout.write(`  [${i + 1}/${testsToRun.length}]\n`);
        }
      }

      if (options.bail) {
        console.log(`\n${RED}[BAIL] Stopping immediately on first test failure.${RESET}`);
        break;
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print failure details
  if (failureList.length > 0) {
    console.log(`\n\n${BOLD}${RED}================================================================${RESET}`);
    console.log(`${BOLD}${RED}                       FAILURE DIAGNOSTICS                      ${RESET}`);
    console.log(`${BOLD}${RED}================================================================${RESET}\n`);

    failureList.forEach((f, idx) => {
      console.log(`${BOLD}${RED}${idx + 1}) ${f.name}${RESET}`);
      console.log(`   ${DIM}Tier:${RESET} ${f.tier} | ${DIM}Feature:${RESET} ${f.feature}`);
      console.log(`   ${RED}Error: ${f.error.message}${RESET}`);
      if (f.error.stack && options.verbose) {
        console.log(`   ${DIM}${f.error.stack.split('\n').slice(1, 4).join('\n   ')}${RESET}`);
      }
      console.log('');
    });
  }

  // Print Breakdown Matrix
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}                  E2E TEST COVERAGE BREAKDOWN                   ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);

  console.log(`\n${BOLD}--- Coverage by Tier ---${RESET}`);
  for (let t = 1; t <= 4; t++) {
    const s = tierStats[t];
    const total = s.pass + s.fail;
    const color = s.fail > 0 ? RED : GREEN;
    console.log(`  Tier ${t}: ${color}${s.pass} passed${RESET}, ${s.fail > 0 ? RED : DIM}${s.fail} failed${RESET} / ${total} total`);
  }

  console.log(`\n${BOLD}--- Coverage by Feature (F1 - F16) ---${RESET}`);
  const features = Object.keys(featureStats).sort();
  for (const feat of features) {
    const s = featureStats[feat];
    const total = s.pass + s.fail;
    const color = s.fail > 0 ? RED : GREEN;
    console.log(`  ${feat.padEnd(8)}: ${color}${String(s.pass).padStart(2)} PASS${RESET} | ${s.fail > 0 ? RED : DIM}${String(s.fail).padStart(2)} FAIL${RESET} | Total: ${total}`);
  }

  // Final Verdict
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  if (failed === 0) {
    console.log(`${BOLD}${BG_GREEN}   ALL ${passed} E2E TESTS PASSED SUCCESSFULLY! (${totalTime}s)   ${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${BOLD}${BG_RED}   ${failed} OF ${testsToRun.length} E2E TESTS FAILED (${totalTime}s)   ${RESET}\n`);
    process.exit(1);
  }
}

// Auto-run when executed directly via node
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error('Fatal runner error:', err);
    process.exit(1);
  });
}
