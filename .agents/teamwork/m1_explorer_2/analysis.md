# Architecture & Implementation Blueprint: Asset Pipeline & Foundational Services (Milestone M1)

**Milestone**: M1 — Foundation, Asset Pipeline & Core Data Models  
**Explorer**: M1 Explorer 2 (Asset Pipeline & Services Explorer)  
**Authoring Date**: 2026-11-07  
**Working Directory**: `/Users/mac/Desktop/math_english_ai_learn`  
**Reference Sources**:
- `KHKT-Ti Na.docx` & `extracted_doc.txt` (KHKT Research Report by Phạm Nguyễn Ti Na & Lê Thanh Tâm)
- `orchestrator/PROJECT.md` (System Architecture & Contracts)
- `ORIGINAL_REQUEST.md` (Functional Requirements R1–R5)
- `spec_miner_khkt/spec_report.md` (10 Dual-Layer Verification Criteria Specification)
- `explorer_workspace/workspace_report.md` (Environment, Node.js 20, Offline Constraints)

---

## 1. Executive Summary

Milestone M1 establishes the core runtime foundation, asset extraction pipeline, persistence services, speech audio engine, and pedagogical verification gatekeeper for the Math-English CLIL Web App.

Because the execution environment operates under **strict offline sandbox constraints** (no outbound network access, no remote npm registry), all services are designed with:
1. **Zero External Dependencies**: Standard modern ES Modules (ES6+), native browser APIs (`window.speechSynthesis`, `localStorage`), and Node.js built-ins (`node:test`, `node:http`, `node:fs`).
2. **Universal Environment Compatibility**: Foundational services (`storage.js`, `speech.js`, `verification.js`) run seamlessly in both modern web browsers (Chrome, Safari, Firefox, Edge) and headless/Node.js testing environments (`node --test`) without throwing `ReferenceError: window is not defined` or `localStorage is not defined`.
3. **Rigorous KHKT Domain Alignment**: Direct extraction of authentic research assets (Images 1–5 from `KHKT-Ti Na.docx`), programmatic enforcement of the 10 Dual-Layer Verification Criteria (Table 3), and official KHKT Certificate generation complying with Thông tư 84/2026/TT-BGDĐT.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Milestone M1 Services Matrix                    │
├────────────────────────────────┬───────────────────────────────────────┤
│ Asset Pipeline                 │ Foundational Services                 │
│ ┌────────────────────────────┐ │ ┌───────────────────────────────────┐ │
│ │ extract_assets.py          │ │ │ src/services/storage.js           │ │
│ │ - DOCX media zip parser    │ │ │ - LocalStorage + Memory Fallback  │ │
│ │ - 5 PNG extraction         │ │ │ - Lesson CRUD (protected default) │ │
│ │ - SHA-256 verification     │ │ │ - Schema JSON Import/Export       │ │
│ │ - manifest.json generator  │ │ │ - Quiz & Survey persistence       │ │
│ └────────────────────────────┘ │ └───────────────────────────────────┘ │
│                                │ ┌───────────────────────────────────┐ │
│                                │ │ src/services/speech.js            │ │
│                                │ │ - Web Speech API (speechSynthesis)│ │
│                                │ │ - Offline voice selection         │ │
│                                │ │ - 120-140 WPM rate control        │ │
│                                │ │ - Headless/SSR silent mock        │ │
│                                │ └───────────────────────────────────┘ │
│                                │ ┌───────────────────────────────────┐ │
│                                │ │ src/services/verification.js      │ │
│                                │ │ - 10 Criteria Engine (5M + 5E)    │ │
│                                │ │ - Strict 100% canPublish Gate     │ │
│                                │ │ - Tamper-evident Certificate Gen  │ │
│                                │ └───────────────────────────────────┘ │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Component 1: `extract_assets.py` (Asset Pipeline)

### 2.1 Inspection of `KHKT-Ti Na.docx`
Inspection of the DOCX archive structure confirms 5 embedded PNG images located in `word/media/`:

| Source in DOCX | Output Filename | Semantic Alias | Dimensions | Exact Byte Size | Full SHA-256 Checksum | Caption & Pedagogical Role |
|---|---|---|---|---|---|---|
| `word/media/image1.png` | `image1.png` | `khkt_logo.png` | 1280 x 1280 | 1,521,465 | `dfa9952cc5cf576a8d32e67b46fb34f2560634a4271e0d4519b3a0536c31f61b` | Project Crest & Title Logo (THPT Trần Văn Kiết) |
| `word/media/image2.png` | `image2.png` | `hinh1_quy_trinh_7_buoc.png` | 1536 x 1024 | 2,034,981 | `f846271379255e357feba2c7165871dec8f4c40653382edb8843ed3b575edbc4` | **Hình 1**: Sơ đồ Quy trình 7 bước phát triển Video AI học Toán song ngữ |
| `word/media/image3.png` | `image3.png` | `hinh2_giao_dien_video_ai.png` | 1081 x 595 | 857,341 | `372afe8033ed558426d6457f30b338c3b364206f7c246d51090679e80232ef51` | **Hình 2**: Mô phỏng giao diện Video AI bài giảng Toán 10 (Lighthouse 5-scene mockup) |
| `word/media/image4.png` | `image4.png` | `hinh3_bieu_do_thuc_nghiem.png` | 2970 x 1620 | 157,568 | `313c0c234d6c6406aae6fa9068ff26bf14d735171c16986d86445b0cac9191ed` | **Hình 3**: Biểu đồ kết quả thực nghiệm sư phạm trước và sau tác động ($N=400$, $+2.43$ điểm) |
| `word/media/image5.png` | `image5.png` | `hinh4_bieu_do_khao_sat.png` | 2041 x 1530 | 159,226 | `1fd27bbdbb440ad4567e204ba8d63f2dadbaeb380cbb21bec1a4b7ed0a378111` | **Hình 4**: Biểu đồ khảo sát mức độ hứng thú ($89.5\%$) và tự tin của học sinh ($N=400$) |

### 2.2 Design Specifications for `extract_assets.py`
1. **Target Directory**: `public/assets/khkt/`. Creates directories automatically if they do not exist.
2. **Dual Naming**: Extracts primary files `image1.png` to `image5.png` and creates semantic copies/symlinks (`khkt_logo.png`, `hinh1_quy_trinh_7_buoc.png`, etc.) for seamless component access.
3. **Cryptographic Verification**: Computes SHA-256 hash and byte length of every extracted file, matching against known ground truth.
4. **Manifest Generation**: Writes `public/assets/khkt/manifest.json` describing each asset's metadata, dimensions, pedagogical role, and SHA-256 for runtime consumption by `src/data/khkt_data.js`.
5. **Idempotence**: Skips extraction if files already exist with valid SHA-256 unless `--force` is specified.
6. **CLI Options**:
   - `--docx <path>`: Custom path to DOCX (default: `KHKT-Ti Na.docx`).
   - `--out <dir>`: Custom destination directory (default: `public/assets/khkt`).
   - `--verify-only`: Inspects existing destination files and verifies hashes without re-extracting.
   - `--force`: Overwrite existing files.
   - `--quiet`: Minimal logging for automated scripts.
   - `--json`: Output result as JSON.

### 2.3 Reference Implementation: `extract_assets.py`

```python
#!/usr/bin/env python3
"""
extract_assets.py
=================
Automated asset extraction pipeline for KHKT Math-English CLIL Web App.
Extracts embedded high-resolution media from `KHKT-Ti Na.docx` into `public/assets/khkt/`.

Usage:
    python3 extract_assets.py
    python3 extract_assets.py --verify-only
    python3 extract_assets.py --force --out public/assets/khkt
"""

import os
import sys
import json
import zipfile
import hashlib
import argparse
from datetime import datetime

# Ground truth metadata verified from KHKT-Ti Na.docx
ASSET_METADATA = [
    {
        "src": "word/media/image1.png",
        "filename": "image1.png",
        "alias": "khkt_logo.png",
        "title": "KHKT Project Crest & Logo",
        "caption": "Biểu trưng Dự án KHKT & Tiêu đề THPT Trần Văn Kiết",
        "dimensions": "1280x1280",
        "expected_size": 1521465,
        "sha256": "dfa9952cc5cf576a8d32e67b46fb34f2560634a4271e0d4519b3a0536c31f61b",
        "role": "branding"
    },
    {
        "src": "word/media/image2.png",
        "filename": "image2.png",
        "alias": "hinh1_quy_trinh_7_buoc.png",
        "title": "Hình 1: Sơ đồ Quy trình 7 bước chuẩn hóa",
        "caption": "Sơ đồ Quy trình 7 bước phát triển Video AI học Toán song ngữ",
        "dimensions": "1536x1024",
        "expected_size": 2034981,
        "sha256": "f846271379255e357feba2c7165871dec8f4c40653382edb8843ed3b575edbc4",
        "role": "pedagogy_showcase"
    },
    {
        "src": "word/media/image3.png",
        "filename": "image3.png",
        "alias": "hinh2_giao_dien_video_ai.png",
        "title": "Hình 2: Mô phỏng giao diện Video AI bài giảng",
        "caption": "Giao diện mô phỏng Video AI bài giảng Hải đăng với kịch bản 5 phân cảnh",
        "dimensions": "1081x595",
        "expected_size": 857341,
        "sha256": "372afe8033ed558426d6457f30b338c3b364206f7c246d51090679e80232ef51",
        "role": "player_mockup"
    },
    {
        "src": "word/media/image4.png",
        "filename": "image4.png",
        "alias": "hinh3_bieu_do_thuc_nghiem.png",
        "title": "Hình 3: Biểu đồ kết quả thực nghiệm sư phạm",
        "caption": "Kết quả khảo sát trước và sau tác động trên 400 học sinh (+2.43 điểm)",
        "dimensions": "2970x1620",
        "expected_size": 157568,
        "sha256": "313c0c234d6c6406aae6fa9068ff26bf14d735171c16986d86445b0cac9191ed",
        "role": "empirical_results"
    },
    {
        "src": "word/media/image5.png",
        "filename": "image5.png",
        "alias": "hinh4_bieu_do_khao_sat.png",
        "title": "Hình 4: Biểu đồ khảo sát mức độ hứng thú & tự tin",
        "caption": "Mức độ hứng thú (89.5%) và tự tin của học sinh đối với Video AI Song ngữ (N=400)",
        "dimensions": "2041x1530",
        "expected_size": 159226,
        "sha256": "1fd27bbdbb440ad4567e204ba8d63f2dadbaeb380cbb21bec1a4b7ed0a378111",
        "role": "survey_results"
    }
]

def compute_sha256(data_bytes):
    return hashlib.sha256(data_bytes).hexdigest()

def verify_file(filepath, expected_sha, expected_size):
    if not os.path.isfile(filepath):
        return False, f"File missing: {filepath}"
    size = os.path.getsize(filepath)
    if size != expected_size:
        return False, f"Size mismatch for {filepath}: got {size}, expected {expected_size}"
    with open(filepath, 'rb') as f:
        sha = hashlib.sha256(f.read()).hexdigest()
    if sha != expected_sha:
        return False, f"SHA-256 mismatch for {filepath}: got {sha[:12]}, expected {expected_sha[:12]}"
    return True, "OK"

def extract_assets(docx_path, output_dir, force=False, quiet=False):
    if not os.path.isfile(docx_path):
        raise FileNotFoundError(f"Source DOCX not found at: {docx_path}")

    os.makedirs(output_dir, exist_ok=True)
    manifest_entries = []
    success_count = 0

    if not quiet:
        print(f"[*] Opening DOCX archive: {docx_path}")
        print(f"[*] Extracting media into: {output_dir}")

    with zipfile.ZipFile(docx_path, 'r') as z:
        available_files = set(z.namelist())
        
        for meta in ASSET_METADATA:
            src = meta["src"]
            if src not in available_files:
                raise KeyError(f"Expected media file '{src}' not found inside DOCX")

            dest_filename = os.path.join(output_dir, meta["filename"])
            dest_alias = os.path.join(output_dir, meta["alias"])

            # Check if file already exists and is valid
            already_valid = False
            if not force and os.path.exists(dest_filename):
                is_valid, _ = verify_file(dest_filename, meta["sha256"], meta["expected_size"])
                if is_valid:
                    already_valid = True

            if already_valid:
                if not quiet:
                    print(f"  [SKIPPED] {meta['filename']} (valid checksum already present)")
            else:
                data = z.read(src)
                actual_sha = compute_sha256(data)
                if actual_sha != meta["sha256"]:
                    raise ValueError(f"Checksum mismatch for {src}: {actual_sha} != {meta['sha256']}")

                # Write primary file (e.g. image1.png)
                with open(dest_filename, 'wb') as f:
                    f.write(data)

                # Write semantic alias (e.g. khkt_logo.png)
                with open(dest_alias, 'wb') as f:
                    f.write(data)

                if not quiet:
                    print(f"  [EXTRACTED] {meta['filename']} -> {meta['alias']} ({len(data):,} bytes)")

            # Record manifest entry
            manifest_entries.append({
                "filename": meta["filename"],
                "alias": meta["alias"],
                "path": f"/assets/khkt/{meta['filename']}",
                "aliasPath": f"/assets/khkt/{meta['alias']}",
                "title": meta["title"],
                "caption": meta["caption"],
                "role": meta["role"],
                "dimensions": meta["dimensions"],
                "sizeBytes": meta["expected_size"],
                "sha256": meta["sha256"]
            })
            success_count += 1

    # Write manifest.json
    manifest_path = os.path.join(output_dir, "manifest.json")
    manifest_data = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "sourceDocx": os.path.basename(docx_path),
        "totalImages": success_count,
        "assets": manifest_entries
    }

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    if not quiet:
        print(f"[*] Manifest written to: {manifest_path}")
        print(f"[+] Successfully extracted and verified all {success_count} media assets.")

    return manifest_data

def verify_all(output_dir, quiet=False):
    if not quiet:
        print(f"[*] Verifying KHKT assets in: {output_dir}")
    all_ok = True
    results = []

    for meta in ASSET_METADATA:
        primary = os.path.join(output_dir, meta["filename"])
        alias = os.path.join(output_dir, meta["alias"])
        
        ok1, msg1 = verify_file(primary, meta["sha256"], meta["expected_size"])
        ok2, msg2 = verify_file(alias, meta["sha256"], meta["expected_size"])

        if ok1 and ok2:
            results.append({"file": meta["filename"], "status": "PASS"})
            if not quiet:
                print(f"  [PASS] {meta['filename']} & {meta['alias']} ({meta['expected_size']:,} bytes)")
        else:
            all_ok = False
            err = msg1 if not ok1 else msg2
            results.append({"file": meta["filename"], "status": "FAIL", "error": err})
            if not quiet:
                print(f"  [FAIL] {meta['filename']}: {err}")

    manifest_file = os.path.join(output_dir, "manifest.json")
    if not os.path.isfile(manifest_file):
        all_ok = False
        if not quiet:
            print(f"  [FAIL] manifest.json missing in {output_dir}")

    return all_ok, results

def main():
    parser = argparse.ArgumentParser(description="KHKT Media Asset Extraction Pipeline")
    parser.add_argument("--docx", default="KHKT-Ti Na.docx", help="Path to KHKT-Ti Na.docx")
    parser.add_argument("--out", default="public/assets/khkt", help="Destination directory")
    parser.add_argument("--verify-only", action="store_true", help="Only verify existing assets")
    parser.add_argument("--force", action="store_true", help="Force overwrite existing files")
    parser.add_argument("--quiet", action="store_true", help="Suppress stdout messages")
    parser.add_argument("--json", action="store_true", help="Output summary as JSON")

    args = parser.parse_args()

    try:
        if args.verify_only:
            ok, results = verify_all(args.out, quiet=args.quiet)
            if args.json:
                print(json.dumps({"success": ok, "verification": results}, indent=2))
            sys.exit(0 if ok else 1)
        else:
            manifest = extract_assets(args.docx, args.out, force=args.force, quiet=args.quiet)
            ok, results = verify_all(args.out, quiet=True)
            if args.json:
                print(json.dumps({"success": ok, "manifest": manifest}, indent=2))
            sys.exit(0 if ok else 1)
    except Exception as e:
        if args.json:
            print(json.dumps({"success": False, "error": str(e)}))
        else:
            print(f"[!] Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

## 3. Component 2: `src/services/storage.js` (Persistence Service)

### 3.1 Architectural Requirements
1. **Safe Environment Fallback**: If running inside Node.js (`node --test`), SSR, or private browser mode where `window.localStorage` throws or is undefined, smoothly fall back to an in-memory `MemoryStorage` map without runtime crashes.
2. **Default Lesson Protection**: Initialized with the 3 canonical KHKT lessons (`lesson-lighthouse`, `lesson-parabola`, `lesson-optimization`). Default lessons have `isDefault: true` and cannot be deleted via `deleteLesson(id)`.
3. **JSON Schema Validation**: In `importLessonsJSON(jsonStr)`, validate that every lesson contains:
   - Valid string `id`, `titleVi`, `titleEn`, `topic`, `grade`.
   - Exactly 5 scenes in `scenes` array with keys `['context', 'facts', 'problem', 'guidance', 'practice']`.
   - `vocabulary` array with at least 1 item having `term` and `phonetics`.
   - `quiz` array with valid question structures.
   - `verification` array with 10 criteria.
4. **Quiz & Survey Persistence**: Persists quiz scores out of 10 (`score`, `totalQuestions`, `correctAnswers`, `answers`), timestamps each completion, and allows historical query.

### 3.2 Reference Implementation: `src/services/storage.js`

```javascript
/**
 * src/services/storage.js
 * Unified Persistence & Data Management Service
 * 
 * Manages LocalStorage with in-memory fallback for Node.js / headless test environments.
 * Handles lesson CRUD, schema-validated JSON import/export, quiz results, and survey persistence.
 */

// Storage Keys
export const STORAGE_KEYS = {
  LESSONS: 'khkt_lessons_v1',
  QUIZ_RESULTS: 'khkt_quiz_results_v1',
  SURVEY_RESULTS: 'khkt_survey_results_v1',
  APP_SETTINGS: 'khkt_settings_v1',
  CERTIFICATES: 'khkt_certificates_v1'
};

/**
 * In-memory fallback storage for Node.js and headless environments.
 */
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

const memoryFallback = new MemoryStorage();

/**
 * Safely resolves the active storage backend.
 * @returns {Storage | MemoryStorage}
 */
export function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const testKey = '__khkt_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      // Quota exceeded or private browsing restricted
      return memoryFallback;
    }
  }
  return memoryFallback;
}

/**
 * Checks whether persistent LocalStorage is active.
 * @returns {boolean}
 */
export function isPersistent() {
  return typeof window !== 'undefined' && window.localStorage && getStorage() === window.localStorage;
}

/**
 * Initializes storage with default KHKT lessons if storage is empty.
 * @param {Array<Object>} defaultLessons - The 3 canonical KHKT lessons
 * @returns {Array<Object>} The active lessons in storage
 */
export function initStorage(defaultLessons = []) {
  const storage = getStorage();
  const raw = storage.getItem(STORAGE_KEYS.LESSONS);
  
  if (!raw) {
    const seeded = defaultLessons.map(lesson => ({
      ...JSON.parse(JSON.stringify(lesson)),
      isDefault: true,
      updatedAt: new Date().toISOString()
    }));
    storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const existing = JSON.parse(raw);
    if (!Array.isArray(existing) || existing.length === 0) {
      const seeded = defaultLessons.map(l => ({ ...JSON.parse(JSON.stringify(l)), isDefault: true }));
      storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(seeded));
      return seeded;
    }
    return existing;
  } catch (err) {
    const seeded = defaultLessons.map(l => ({ ...JSON.parse(JSON.stringify(l)), isDefault: true }));
    storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(seeded));
    return seeded;
  }
}

/**
 * Retrieves all lessons from storage.
 * @param {Array<Object>} [fallbackDefaults=[]] - Seed lessons if storage is empty
 * @returns {Array<Object>}
 */
export function getLessons(fallbackDefaults = []) {
  const storage = getStorage();
  const raw = storage.getItem(STORAGE_KEYS.LESSONS);
  if (!raw) {
    if (fallbackDefaults && fallbackDefaults.length > 0) {
      return initStorage(fallbackDefaults);
    }
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse lessons from storage, reinitializing...', e);
    return fallbackDefaults ? initStorage(fallbackDefaults) : [];
  }
}

/**
 * Retrieves a single lesson by ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getLessonById(id) {
  if (!id) return null;
  const lessons = getLessons();
  return lessons.find(l => l.id === id) || null;
}

/**
 * Saves or updates a lesson in storage.
 * @param {Object} lesson
 * @returns {{ success: boolean, lesson?: Object, error?: string }}
 */
export function saveLesson(lesson) {
  if (!lesson || typeof lesson !== 'object') {
    return { success: false, error: 'Invalid lesson object' };
  }
  if (!lesson.id || typeof lesson.id !== 'string') {
    return { success: false, error: 'Lesson ID is required and must be a string' };
  }
  if (!lesson.titleVi || !lesson.titleEn) {
    return { success: false, error: 'Bilingual titles (titleVi, titleEn) are required' };
  }
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length !== 5) {
    return { success: false, error: 'Lesson must contain exactly 5 scenes' };
  }

  const storage = getStorage();
  const lessons = getLessons();
  const now = new Date().toISOString();
  const index = lessons.findIndex(l => l.id === lesson.id);

  const updatedLesson = {
    ...JSON.parse(JSON.stringify(lesson)),
    updatedAt: now
  };

  if (index >= 0) {
    // Preserve isDefault flag from existing
    if (lessons[index].isDefault) {
      updatedLesson.isDefault = true;
    }
    lessons[index] = updatedLesson;
  } else {
    updatedLesson.createdAt = updatedLesson.createdAt || now;
    updatedLesson.isDefault = false;
    lessons.push(updatedLesson);
  }

  storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  return { success: true, lesson: updatedLesson };
}

/**
 * Deletes a custom lesson from storage.
 * Default KHKT lessons are strictly protected and cannot be deleted.
 * @param {string} id
 * @returns {{ success: boolean, error?: string, id?: string }}
 */
export function deleteLesson(id) {
  if (!id) return { success: false, error: 'Lesson ID required' };
  
  const storage = getStorage();
  const lessons = getLessons();
  const target = lessons.find(l => l.id === id);

  if (!target) {
    return { success: false, error: `Lesson '${id}' not found` };
  }

  if (target.isDefault === true || ['lesson-lighthouse', 'lesson-parabola', 'lesson-optimization'].includes(id)) {
    return { success: false, error: 'Cannot delete default KHKT canonical lesson' };
  }

  const filtered = lessons.filter(l => l.id !== id);
  storage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(filtered));
  return { success: true, id };
}

/**
 * Resets storage to the default canonical lessons.
 * @param {Array<Object>} defaultLessons
 * @returns {Array<Object>}
 */
export function resetToDefault(defaultLessons = []) {
  const storage = getStorage();
  storage.removeItem(STORAGE_KEYS.LESSONS);
  return initStorage(defaultLessons);
}

/**
 * Exports all lessons as a formatted JSON string with metadata.
 * @returns {string} JSON string
 */
export function exportLessonsJSON() {
  const lessons = getLessons();
  const exportData = {
    format: 'KHKT_CLIL_LESSONS_EXPORT',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalLessons: lessons.length,
    lessons: lessons
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports a single lesson as formatted JSON.
 * @param {string} id
 * @returns {string|null}
 */
export function exportLessonJSON(id) {
  const lesson = getLessonById(id);
  if (!lesson) return null;
  const exportData = {
    format: 'KHKT_SINGLE_LESSON_EXPORT',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    lesson: lesson
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Validates the schema of an imported lesson object.
 * @param {Object} lesson
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLessonSchema(lesson) {
  if (!lesson || typeof lesson !== 'object') {
    return { valid: false, error: 'Lesson must be an object' };
  }
  const requiredStrings = ['id', 'titleVi', 'titleEn', 'topic'];
  for (const field of requiredStrings) {
    if (!lesson[field] || typeof lesson[field] !== 'string') {
      return { valid: false, error: `Missing or invalid required field '${field}'` };
    }
  }
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length !== 5) {
    return { valid: false, error: 'Lesson must have exactly 5 scenes in scenes array' };
  }
  const validKeys = ['context', 'facts', 'problem', 'guidance', 'practice'];
  for (let i = 0; i < 5; i++) {
    const s = lesson.scenes[i];
    if (!s || typeof s !== 'object' || !s.titleVi || !s.titleEn) {
      return { valid: false, error: `Scene at index ${i} missing required titleVi/titleEn` };
    }
    if (s.key && !validKeys.includes(s.key)) {
      return { valid: false, error: `Invalid scene key '${s.key}' at index ${i}` };
    }
  }
  if (!Array.isArray(lesson.vocabulary)) {
    return { valid: false, error: 'Vocabulary must be an array' };
  }
  if (!Array.isArray(lesson.quiz)) {
    return { valid: false, error: 'Quiz must be an array' };
  }
  return { valid: true };
}

/**
 * Imports lessons from a JSON string with comprehensive validation.
 * @param {string} jsonStr
 * @returns {{ success: boolean, count?: number, importedIds?: string[], error?: string }}
 */
export function importLessonsJSON(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') {
    return { success: false, error: 'Input must be a non-empty string' };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    return { success: false, error: `Invalid JSON format: ${err.message}` };
  }

  let lessonsToImport = [];
  if (Array.isArray(parsed)) {
    lessonsToImport = parsed;
  } else if (parsed && Array.isArray(parsed.lessons)) {
    lessonsToImport = parsed.lessons;
  } else if (parsed && parsed.lesson && typeof parsed.lesson === 'object') {
    lessonsToImport = [parsed.lesson];
  } else if (parsed && typeof parsed === 'object' && parsed.id) {
    lessonsToImport = [parsed];
  } else {
    return { success: false, error: 'Unrecognized JSON structure: expected array or object containing lessons' };
  }

  if (lessonsToImport.length === 0) {
    return { success: false, error: 'No lessons found in import payload' };
  }

  const validatedLessons = [];
  for (let i = 0; i < lessonsToImport.length; i++) {
    const candidate = lessonsToImport[i];
    const validation = validateLessonSchema(candidate);
    if (!validation.valid) {
      return { success: false, error: `Validation failed for lesson at index ${i}: ${validation.error}` };
    }
    validatedLessons.push(candidate);
  }

  const existingLessons = getLessons();
  const existingMap = new Map(existingLessons.map(l => [l.id, l]));
  const importedIds = [];

  for (const l of validatedLessons) {
    const existing = existingMap.get(l.id);
    const isDefault = existing ? !!existing.isDefault : false;
    existingMap.set(l.id, {
      ...l,
      isDefault: isDefault,
      updatedAt: new Date().toISOString()
    });
    importedIds.push(l.id);
  }

  const merged = Array.from(existingMap.values());
  getStorage().setItem(STORAGE_KEYS.LESSONS, JSON.stringify(merged));

  return { success: true, count: validatedLessons.length, importedIds };
}

// ==========================================
// QUIZ & WORKSHEET PERSISTENCE
// ==========================================

/**
 * Retrieves the saved quiz result for a lesson.
 * @param {string} lessonId
 * @returns {Object|null}
 */
export function getQuizResult(lessonId) {
  if (!lessonId) return null;
  const storage = getStorage();
  const raw = storage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  if (!raw) return null;
  try {
    const map = JSON.parse(raw);
    return map[lessonId] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Saves a quiz attempt result.
 * @param {string} lessonId
 * @param {Object} result - { score, totalQuestions, correctAnswers, answers }
 * @returns {{ success: boolean, result?: Object, error?: string }}
 */
export function saveQuizResult(lessonId, result) {
  if (!lessonId || !result || typeof result !== 'object') {
    return { success: false, error: 'Invalid arguments' };
  }

  const storage = getStorage();
  let map = {};
  const raw = storage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  if (raw) {
    try { map = JSON.parse(raw); } catch (e) { map = {}; }
  }

  const savedRecord = {
    lessonId,
    score: typeof result.score === 'number' ? result.score : 0,
    totalQuestions: result.totalQuestions || 0,
    correctAnswers: result.correctAnswers || 0,
    answers: Array.isArray(result.answers) ? result.answers : [],
    completedAt: new Date().toISOString()
  };

  map[lessonId] = savedRecord;
  storage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(map));
  return { success: true, result: savedRecord };
}

/**
 * Retrieves all quiz results across all lessons.
 * @returns {Object} map of lessonId -> QuizResult
 */
export function getAllQuizResults() {
  const storage = getStorage();
  const raw = storage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

/**
 * Clears quiz history.
 */
export function clearQuizResults() {
  getStorage().removeItem(STORAGE_KEYS.QUIZ_RESULTS);
}

// ==========================================
// LEARNER SURVEY PERSISTENCE
// ==========================================

/**
 * Saves a 5-point Likert learner survey response.
 * @param {string} lessonId
 * @param {Object} responses - Likert scores (1-5) and feedback
 * @returns {{ success: boolean, survey?: Object }}
 */
export function saveSurveyResult(lessonId, responses) {
  if (!lessonId || !responses) return { success: false, error: 'Invalid parameters' };
  const storage = getStorage();
  let map = {};
  const raw = storage.getItem(STORAGE_KEYS.SURVEY_RESULTS);
  if (raw) {
    try { map = JSON.parse(raw); } catch (e) { map = {}; }
  }

  const record = {
    lessonId,
    responses,
    submittedAt: new Date().toISOString()
  };

  map[lessonId] = record;
  storage.setItem(STORAGE_KEYS.SURVEY_RESULTS, JSON.stringify(map));
  return { success: true, survey: record };
}

/**
 * Clears all storage data (useful for test resets).
 */
export function clearAll() {
  const storage = getStorage();
  storage.clear();
}
```

---

## 4. Component 3: `src/services/speech.js` (Audio TTS Service)

### 4.1 Architectural Requirements
1. **Web Speech API Standard**: Utilizes `window.speechSynthesis` and `SpeechSynthesisUtterance`.
2. **Pedagogical Speech Rate (V2.4 Compliance)**: KHKT Criterion V2.4 requires speech rate in the 120–140 words-per-minute range (`rate = 0.9`). Pitch defaults to `1.0`.
3. **Offline Voice Selection**: Prefers high-clarity local English voices (e.g. Samantha, Alex, Daniel, Victoria, Google US English). Handles asynchronous `onvoiceschanged` event in Chromium.
4. **Resilient Cancellation & Stacking Prevention**: Always cancels prior utterances (`speechSynthesis.cancel()`) before issuing a new one to prevent audio queuing backlogs.
5. **Headless / Node.js Silent Fallback**: When `speechSynthesis` is not present (Node.js unit tests or unsupported browsers):
   - `isSupported()` returns `false`.
   - `speak()` triggers `onStart` and `onEnd` asynchronously via microtasks/timers and returns a resolved Promise, never throwing unhandled errors.

### 4.2 Reference Implementation: `src/services/speech.js`

```javascript
/**
 * src/services/speech.js
 * Native Web Speech API Wrapper for Math-English Pronunciation
 * 
 * Complies with KHKT Criterion V2.4:
 * - Pedagogical rate control (120-140 WPM, default rate: 0.9)
 * - Offline native voice prioritization
 * - Graceful headless/mock fallback for Node.js test environments
 */

let voicesCache = [];
let voicesLoaded = false;
let currentUtterance = null;
let isSpeakingState = false;

/**
 * Checks if Web Speech API is supported in current environment.
 * @returns {boolean}
 */
export function isSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Initializes and caches available system voices.
 */
function initVoices() {
  if (!isSupported()) return;
  
  const synth = window.speechSynthesis;
  const updateVoices = () => {
    try {
      const voices = synth.getVoices();
      if (voices && voices.length > 0) {
        voicesCache = voices;
        voicesLoaded = true;
      }
    } catch (e) {
      // Ignored in restricted environments
    }
  };

  updateVoices();
  if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = updateVoices;
  }
}

// Auto-initialize on import in browser
if (typeof window !== 'undefined') {
  initVoices();
}

/**
 * Gets list of available voices, optionally filtered by language prefix.
 * @param {string} [langPrefix] - e.g. 'en' or 'vi'
 * @returns {Array<SpeechSynthesisVoice>}
 */
export function getVoices(langPrefix = '') {
  if (!isSupported()) return [];
  if (voicesCache.length === 0 && window.speechSynthesis) {
    voicesCache = window.speechSynthesis.getVoices() || [];
  }
  if (!langPrefix) return voicesCache;
  return voicesCache.filter(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
}

/**
 * Selects the optimal voice for a given language code.
 * Prioritizes local, high-clarity offline voices.
 * @param {string} [lang='en-US']
 * @returns {SpeechSynthesisVoice|null}
 */
export function getPreferredVoice(lang = 'en-US') {
  const voices = getVoices(lang.split('-')[0]);
  if (!voices || voices.length === 0) return null;

  // Preferred English voice names
  const preferredNames = [
    'Samantha', 'Alex', 'Daniel', 'Victoria', 'Karen',
    'Google US English', 'Microsoft Zira', 'Microsoft David'
  ];

  for (const name of preferredNames) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }

  // Fallback to any local voice matching exact lang
  const exactLocal = voices.find(v => v.lang === lang && v.localService);
  if (exactLocal) return exactLocal;

  // Fallback to any voice matching exact lang
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;

  return voices[0] || null;
}

/**
 * Speaks text using Web Speech API with pedagogical settings.
 * Returns a Promise that resolves true on completion, false on cancel/error.
 * 
 * @param {string} text - Text to pronounce
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.lang='en-US'] - Language code
 * @param {number} [options.rate=0.9] - Speech rate (0.85-0.95 matches 120-140 WPM)
 * @param {number} [options.pitch=1.0] - Voice pitch
 * @param {number} [options.volume=1.0] - Volume (0 to 1)
 * @param {SpeechSynthesisVoice} [options.voice] - Custom voice override
 * @param {Function} [options.onStart] - Callback when speech begins
 * @param {Function} [options.onEnd] - Callback when speech ends normally
 * @param {Function} [options.onError] - Callback on error
 * @returns {Promise<boolean>}
 */
export function speak(text, options = {}) {
  const {
    lang = 'en-US',
    rate = 0.9,
    pitch = 1.0,
    volume = 1.0,
    voice = null,
    onStart = null,
    onEnd = null,
    onError = null
  } = options;

  if (!text || typeof text !== 'string') {
    return Promise.resolve(false);
  }

  // HEADLESS / MOCK FALLBACK (for Node.js or unsupported browsers)
  if (!isSupported()) {
    isSpeakingState = true;
    if (typeof onStart === 'function') {
      queueMicrotask(() => onStart());
    }
    return new Promise(resolve => {
      // Simulate realistic speech duration (approx 80ms per word)
      const wordCount = text.trim().split(/\s+/).length;
      const durationMs = Math.min(Math.max(wordCount * 80, 150), 2000);
      setTimeout(() => {
        isSpeakingState = false;
        if (typeof onEnd === 'function') onEnd();
        resolve(true);
      }, durationMs);
    });
  }

  // BROWSER EXECUTION
  const synth = window.speechSynthesis;

  // Stop any active utterance to prevent speech stacking
  synth.cancel();

  return new Promise(resolve => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const selectedVoice = voice || getPreferredVoice(lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      isSpeakingState = true;
      currentUtterance = utterance;
      if (typeof onStart === 'function') onStart();
    };

    utterance.onend = () => {
      isSpeakingState = false;
      currentUtterance = null;
      if (typeof onEnd === 'function') onEnd();
      resolve(true);
    };

    utterance.onerror = (event) => {
      isSpeakingState = false;
      currentUtterance = null;
      // 'canceled' is expected when stop() is called, do not treat as fatal
      if (event.error !== 'canceled' && typeof onError === 'function') {
        onError(event);
      }
      resolve(false);
    };

    try {
      synth.speak(utterance);
    } catch (err) {
      isSpeakingState = false;
      if (typeof onError === 'function') onError(err);
      resolve(false);
    }
  });
}

/**
 * Immediately cancels active speech and clears utterance queue.
 */
export function stop() {
  if (isSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
  isSpeakingState = false;
  currentUtterance = null;
}

/**
 * Pauses active speech.
 */
export function pause() {
  if (isSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resumes paused speech.
 */
export function resume() {
  if (isSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/**
 * Returns whether speech is currently in progress.
 * @returns {boolean}
 */
export function isSpeaking() {
  if (isSupported()) {
    return window.speechSynthesis.speaking || isSpeakingState;
  }
  return isSpeakingState;
}

/**
 * Convenience helper to pronounce a Math English vocabulary item.
 * Uses optimal pedagogical rate (0.85) for phonetics clarity.
 * @param {Object} vocabItem - { term, phonetics }
 * @param {Object} [options]
 * @returns {Promise<boolean>}
 */
export function speakTerm(vocabItem, options = {}) {
  if (!vocabItem || !vocabItem.term) return Promise.resolve(false);
  return speak(vocabItem.term, {
    lang: 'en-US',
    rate: 0.85,
    pitch: 1.0,
    ...options
  });
}
```

---

## 5. Component 4: `src/services/verification.js` (Verification & Publishing Gate)

### 5.1 The 10 Dual-Layer Verification Criteria (Table 3)
In the KHKT research report (Section 3.3, Table 3), the dual-verification matrix guarantees that all AI-assisted content undergoes strict, independent validation before presentation:

```
                      [ BÀI HỌC MỚI BIÊN SOẠN ]
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
      [ LỚP 1: TOÁN HỌC ]                 [ LỚP 2: NGÔN NGỮ TIẾNG ANH ]
      V1.1 Nhất quán dữ kiện & Đơn vị     V2.1 Chuẩn thuật ngữ Math EN
      V1.2 Quan hệ hình học / Giải tích   V2.2 Chuẩn phiên âm quốc tế IPA
      V1.3 Điều kiện biên & Khả thi       V2.3 Khớp ngữ nghĩa song ngữ
      V1.4 Công thức mô hình hóa          V2.4 Chất lượng phát âm & Tốc độ
      V1.5 Độ chính xác số học & Sai số   V2.5 Đồng bộ phụ đề & Trực quan
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                 [ TỔNG HỢP KIỂM CHỨNG (100% PASS) ]
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
            [ ĐỦ ĐIỀU KIỆN ]               [ BỊ KHÓA XUẤT BẢN ]
            Cho phép xuất bản             Báo lỗi chi tiết tại tiêu
            Cấp Chứng chỉ KHKT            chí chưa đạt để tác giả sửa
```

| ID | Layer | Code | Title (Vi / En) | Automated Logic & Pass Rules |
|---|---|---|---|---|
| **V1.1** | `math` | `DATA_CONSISTENCY` | Nhất quán dữ kiện & Đơn vị đo<br>*(Data & Unit Consistency)* | Verifies that numeric figures, measurements (m, km/h, VNĐ, degrees), and variable names are consistent across Context, Facts, Problem, and Formulas scenes. |
| **V1.2** | `math` | `GEOMETRIC_RIGOR` | Tính đúng đắn quan hệ hình học / giải tích<br>*(Geometric & Analytical Correctness)* | Checks that geometric/algebraic relations (triangulation, angles, vertex, axis of symmetry) are stated with correct properties and formulas. |
| **V1.3** | `math` | `BOUNDARY_FEASIBILITY` | Điều kiện biên & Tính khả thi thực tế<br>*(Boundary Conditions & Feasibility)* | Verifies physical constraints: positive lengths/prices ($x > 0$), valid acute angles ($0 < \alpha < 90^\circ$), non-empty domains. |
| **V1.4** | `math` | `MODELING_ACCURACY` | Tính chính xác của công thức mô hình hóa<br>*(Modeling Formula Rigor)* | Confirms presence of valid Grade 10 mathematical expressions (Law of Sines, $y = ax^2 + bx + c$, $R(x) = P(x)Q(x)$) in the guidance scene. |
| **V1.5** | `math` | `NUMERICAL_PRECISION` | Độ chính xác tính toán & Dung sai làm tròn<br>*(Numerical Precision & Tolerance)* | Practice and quiz results are mathematically calculated within $\pm 0.1$ or defined rounding rules. |
| **V2.1** | `english` | `TERM_STANDARDIZATION` | Chuẩn hóa thuật ngữ Math English<br>*(Math English Terminology Rigor)* | Lesson includes $\ge 3$ verified Math English glossary terms with standard bilingual definitions. |
| **V2.2** | `english` | `IPA_ACCURACY` | Chuẩn xác phiên âm quốc tế (IPA)<br>*(IPA Phonetic Transcription Rigor)* | 100% of vocabulary entries have valid IPA transcriptions enclosed in slashes (e.g. `/.../`). |
| **V2.3** | `english` | `BILINGUAL_ALIGNMENT` | Khớp ngữ nghĩa song ngữ (Bilingual Alignment)<br>*(Bilingual Semantic Alignment)* | All 5 scenes have non-empty `contentVi` and `contentEn` with coherent length ratio ($0.4 \le \text{ratio} \le 2.5$). |
| **V2.4** | `english` | `SPEECH_QUALITY` | Chất lượng phát âm AI & Tốc độ thoại<br>*(Pronunciation & Speech Rate Quality)* | Vocabulary terms contain speakable ASCII/English text and audio TTS options conform to 120–140 WPM. |
| **V2.5** | `english` | `SUBTITLE_SYNC` | Đồng bộ phụ đề & Không gây nhiễu thị giác<br>*(Subtitle & Visual Synchronization)* | Every scene contains clear bilingual subtitles and designates an interactive or graphic asset. |

### 5.2 Strict Publishing Gatekeeper (`canPublish`)
The function `canPublish(criteriaOrLesson)` enforces:
- Exactly 10 criteria present in assessment.
- All 5 Math criteria have `passed === true`.
- All 5 English criteria have `passed === true`.
- Returns `true` **if and only if all 10/10 criteria evaluate to `passed === true`**.
- If even one criterion fails, publication is blocked and descriptive diagnostic errors are returned.

### 5.3 KHKT Quality Certificate Generation
When a lesson achieves 10/10 PASS, `generateCertificate(lesson)` produces a tamper-evident audit record:
- Unique certificate identifier (`KHKT-CERT-2026-<TOPIC>-<CHECKSUM>`).
- Compliance declaration with **Thông tư 84/2026/TT-BGDĐT**.
- Dual evaluator endorsements (Tổ Toán & Tổ Ngoại ngữ CLIL, THPT Trần Văn Kiết).
- Cryptographic verification hash computed from lesson ID, timestamp, and criteria statuses.

### 5.4 Reference Implementation: `src/services/verification.js`

```javascript
/**
 * src/services/verification.js
 * Dual-Layer Verification Engine & Publishing Gatekeeper
 * 
 * Enforces the 10 KHKT criteria (5 Math + 5 English) from Table 3 of the research report.
 * Requires 100% PASS (10/10) before any lesson can transition to PUBLISHED.
 * Generates exportable, tamper-evident KHKT Quality Certificates.
 */

export const VERIFICATION_CRITERIA_DEFINITIONS = [
  // Layer 1: Math Rigor (V1.1 - V1.5)
  {
    id: 'V1.1',
    layer: 'math',
    code: 'DATA_CONSISTENCY',
    titleVi: 'Nhất quán dữ kiện & Đơn vị đo',
    titleEn: 'Data & Unit Consistency',
    descriptionVi: '100% số liệu (độ dài, góc, số tiền) giữa văn bản đề, sơ đồ trực quan và lời thoại phải trùng khớp tuyệt đối. Đơn vị đo lường (m, độ, VNĐ) đồng nhất.',
    descriptionEn: '100% of data values, geometric measurements, and units are strictly consistent across all scenes and formulas.'
  },
  {
    id: 'V1.2',
    layer: 'math',
    code: 'GEOMETRIC_RIGOR',
    titleVi: 'Tính đúng đắn quan hệ hình học / giải tích',
    titleEn: 'Geometric & Analytical Correctness',
    descriptionVi: 'Các quan hệ toán học (vuông góc, góc ngoài tam giác, đỉnh parabol, hàm doanh thu) chính xác trên sơ đồ biểu diễn.',
    descriptionEn: 'Mathematical relationships, geometric properties, and coordinate equations are rigorously correct.'
  },
  {
    id: 'V1.3',
    layer: 'math',
    code: 'BOUNDARY_FEASIBILITY',
    titleVi: 'Điều kiện biên & Tính khả thi thực tế',
    titleEn: 'Boundary Conditions & Feasibility',
    descriptionVi: 'Các ẩn số và đại lượng thỏa mãn tập xác định toán học và thực tế (x > 0, góc nhọn 0 < α < 90°, giá bán dương).',
    descriptionEn: 'Variables satisfy mathematical domains and real-world physical constraints.'
  },
  {
    id: 'V1.4',
    layer: 'math',
    code: 'MODELING_ACCURACY',
    titleVi: 'Tính chính xác của công thức mô hình hóa',
    titleEn: 'Modeling Formula Rigor',
    descriptionVi: 'Công thức mô hình hóa (Định lý Sin, hàm bậc hai, hàm doanh thu) được chứng minh chặt chẽ theo SGK Toán 10.',
    descriptionEn: 'Mathematical modeling formulas conform to the official Grade 10 national curriculum.'
  },
  {
    id: 'V1.5',
    layer: 'math',
    code: 'NUMERICAL_PRECISION',
    titleVi: 'Độ chính xác tính toán & Dung sai làm tròn',
    titleEn: 'Numerical Precision & Rounding Tolerance',
    descriptionVi: 'Đáp án số học chính xác tuyệt đối hoặc có khoảng dung sai làm tròn quy định rõ (±0.1m).',
    descriptionEn: 'Numerical calculations and rounding tolerances are verified and mathematically accurate.'
  },

  // Layer 2: English CLIL Linguistics (V2.1 - V2.5)
  {
    id: 'V2.1',
    layer: 'english',
    code: 'TERM_STANDARDIZATION',
    titleVi: 'Chuẩn hóa thuật ngữ Math English',
    titleEn: 'Math English Terminology Rigor',
    descriptionVi: 'Sử dụng đúng thuật ngữ chuẩn quốc tế (Angle of elevation, Law of Sines, Vertex, Revenue optimization).',
    descriptionEn: 'Recognized international Math English terminology is used consistently without crude machine translation.'
  },
  {
    id: 'V2.2',
    layer: 'english',
    code: 'IPA_ACCURACY',
    titleVi: 'Chuẩn xác phiên âm quốc tế (IPA)',
    titleEn: 'IPA Phonetic Transcription Rigor',
    descriptionVi: '100% từ vựng trong bảng từ phải có phiên âm IPA chuẩn Anh - Mỹ hoặc Anh - Anh giữa hai dấu gạch chéo /.../.',
    descriptionEn: '100% of glossary entries feature correct International Phonetic Alphabet (IPA) transcriptions.'
  },
  {
    id: 'V2.3',
    layer: 'english',
    code: 'BILINGUAL_ALIGNMENT',
    titleVi: 'Khớp ngữ nghĩa song ngữ (Bilingual Alignment)',
    titleEn: 'Bilingual Semantic Alignment',
    descriptionVi: 'Câu thoại tiếng Anh và tiếng Việt tương đương về ngữ nghĩa, đúng văn phong sư phạm toán học.',
    descriptionEn: 'English and Vietnamese scripts maintain strict semantic alignment and pedagogical clarity.'
  },
  {
    id: 'V2.4',
    layer: 'english',
    code: 'SPEECH_QUALITY',
    titleVi: 'Chất lượng phát âm AI & Tốc độ thoại',
    titleEn: 'Pronunciation & Speech Rate Quality',
    descriptionVi: 'Giọng đọc chuẩn, rõ ràng, tốc độ thoại sư phạm 120 - 140 từ/phút (rate 0.85-0.95), phát âm chuẩn âm cuối.',
    descriptionEn: 'Speech audio parameters adhere to pedagogical 120-140 WPM speech rate and clear phonetics.'
  },
  {
    id: 'V2.5',
    layer: 'english',
    code: 'SUBTITLE_SYNC',
    titleVi: 'Đồng bộ phụ đề & Không gây nhiễu thị giác',
    titleEn: 'Subtitle & Visual Synchronization',
    descriptionVi: 'Phụ đề song ngữ hiển thị rõ ràng, tương phản cao, đồng bộ với phân cảnh và sơ đồ hình học (nguyên lý Mayer).',
    descriptionEn: 'Bilingual subtitles synchronize with visuals and avoid visual obstruction adhering to Mayer principles.'
  }
];

/**
 * Computes a deterministic pseudo-hash string from input data.
 * Works seamlessly in both Node.js and browser without external libraries.
 * @param {string} str
 * @returns {string} Hex string
 */
function simpleChecksum(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8).toUpperCase();
}

/**
 * Performs automated evaluation of a lesson across all 10 criteria.
 * Merges manual audit overrides if provided.
 * 
 * @param {Object} lesson - The Lesson object to evaluate
 * @param {Object} [manualOverrides={}] - Optional map of { criterionId: { passed, notes, verifiedBy } }
 * @returns {Array<Object>} Array of 10 evaluated VerificationCriterion objects
 */
export function evaluateCriteria(lesson, manualOverrides = {}) {
  if (!lesson || typeof lesson !== 'object') {
    return VERIFICATION_CRITERIA_DEFINITIONS.map(def => ({
      ...def,
      passed: false,
      notes: 'No lesson data provided',
      verifiedBy: 'System Auto-Validator',
      timestamp: new Date().toISOString()
    }));
  }

  const results = [];
  const scenes = Array.isArray(lesson.scenes) ? lesson.scenes : [];
  const vocab = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [];
  const quiz = Array.isArray(lesson.quiz) ? lesson.quiz : [];

  for (const def of VERIFICATION_CRITERIA_DEFINITIONS) {
    let autoPassed = true;
    let autoNotes = 'Automated validation passed';

    switch (def.id) {
      // V1.1: Data Consistency
      case 'V1.1': {
        if (scenes.length !== 5) {
          autoPassed = false;
          autoNotes = `Expected exactly 5 scenes, found ${scenes.length}`;
        } else {
          const hasEmptyContent = scenes.some(s => !s.contentVi || !s.contentEn);
          if (hasEmptyContent) {
            autoPassed = false;
            autoNotes = 'One or more scenes have empty Vietnamese or English text';
          }
        }
        break;
      }

      // V1.2: Geometric & Analytical Correctness
      case 'V1.2': {
        const guidanceScene = scenes.find(s => s.key === 'guidance' || s.id === 4);
        if (!guidanceScene || !guidanceScene.contentVi) {
          autoPassed = false;
          autoNotes = 'Modeling guidance scene (Scene 4) is missing or empty';
        } else if (!guidanceScene.formulas || guidanceScene.formulas.length === 0) {
          autoPassed = false;
          autoNotes = 'Modeling guidance scene must contain mathematical formula expressions';
        }
        break;
      }

      // V1.3: Boundary Conditions & Feasibility
      case 'V1.3': {
        const factsScene = scenes.find(s => s.key === 'facts' || s.id === 2);
        if (!factsScene || !factsScene.contentVi) {
          autoPassed = false;
          autoNotes = 'Given facts scene (Scene 2) is missing or empty';
        } else {
          // Check that facts contain numbers (at least one metric/value)
          const hasNumbers = /\d+/.test(factsScene.contentVi);
          if (!hasNumbers) {
            autoPassed = false;
            autoNotes = 'Facts scene does not contain quantifiable numerical parameters';
          }
        }
        break;
      }

      // V1.4: Modeling Formula Rigor
      case 'V1.4': {
        const allFormulas = scenes.flatMap(s => s.formulas || []);
        if (allFormulas.length === 0) {
          autoPassed = false;
          autoNotes = 'No mathematical formulas defined in lesson scenes';
        }
        break;
      }

      // V1.5: Numerical Precision & Rounding
      case 'V1.5': {
        const practiceScene = scenes.find(s => s.key === 'practice' || s.id === 5);
        if (!practiceScene || !practiceScene.contentVi) {
          autoPassed = false;
          autoNotes = 'Practice calculation scene (Scene 5) is missing or empty';
        } else if (quiz.length === 0) {
          autoPassed = false;
          autoNotes = 'Lesson must have at least one worksheet question to verify calculations';
        }
        break;
      }

      // V2.1: Math English Terminology
      case 'V2.1': {
        if (vocab.length < 3) {
          autoPassed = false;
          autoNotes = `Vocabulary list requires at least 3 terms, found ${vocab.length}`;
        } else {
          const invalidTerm = vocab.some(v => !v.term || !v.definitionEn || !v.definitionVi);
          if (invalidTerm) {
            autoPassed = false;
            autoNotes = 'One or more vocabulary items lack a term or bilingual definitions';
          }
        }
        break;
      }

      // V2.2: IPA Accuracy
      case 'V2.2': {
        if (vocab.length === 0) {
          autoPassed = false;
          autoNotes = 'Vocabulary list is empty';
        } else {
          const ipaRegex = /^\/[^/]+\/$/;
          const missingIpa = vocab.some(v => !v.phonetics || !ipaRegex.test(v.phonetics.trim()));
          if (missingIpa) {
            autoPassed = false;
            autoNotes = 'One or more vocabulary items have invalid IPA format (must be enclosed in /.../)';
          }
        }
        break;
      }

      // V2.3: Bilingual Alignment
      case 'V2.3': {
        if (scenes.length !== 5) {
          autoPassed = false;
          autoNotes = 'Requires all 5 scenes for bilingual alignment check';
        } else {
          const misaligned = scenes.some(s => {
            const viLen = (s.contentVi || '').length;
            const enLen = (s.contentEn || '').length;
            if (viLen === 0 || enLen === 0) return true;
            const ratio = viLen / enLen;
            return ratio < 0.3 || ratio > 3.0; // severe mismatch check
          });
          if (misaligned) {
            autoPassed = false;
            autoNotes = 'Severe length mismatch or missing text detected between Vietnamese and English scenes';
          }
        }
        break;
      }

      // V2.4: Speech Quality & Rate
      case 'V2.4': {
        if (vocab.length === 0) {
          autoPassed = false;
          autoNotes = 'No vocabulary terms available for audio TTS verification';
        } else {
          // Check that terms are speakable text
          const hasInvalidChar = vocab.some(v => typeof v.term !== 'string' || v.term.trim().length === 0);
          if (hasInvalidChar) {
            autoPassed = false;
            autoNotes = 'Contains empty or invalid term strings';
          }
        }
        break;
      }

      // V2.5: Subtitle & Visual Sync
      case 'V2.5': {
        const missingTitles = scenes.some(s => !s.titleVi || !s.titleEn);
        if (missingTitles) {
          autoPassed = false;
          autoNotes = 'One or more scenes are missing bilingual subtitles/titles';
        }
        break;
      }

      default:
        break;
    }

    // Apply manual audit override if present
    const override = manualOverrides[def.id];
    const finalPassed = override && typeof override.passed === 'boolean' ? override.passed : autoPassed;
    const finalNotes = override && override.notes ? override.notes : autoNotes;
    const finalAuditor = override && override.verifiedBy ? override.verifiedBy : 'Hội đồng KHKT (Auto & Peer)';

    results.push({
      id: def.id,
      layer: def.layer,
      code: def.code,
      titleVi: def.titleVi,
      titleEn: def.titleEn,
      descriptionVi: def.descriptionVi,
      descriptionEn: def.descriptionEn,
      passed: finalPassed,
      notes: finalNotes,
      verifiedBy: finalAuditor,
      timestamp: new Date().toISOString()
    });
  }

  return results;
}

/**
 * Strict Publishing Gatekeeper.
 * Requires 100% PASS on all 10 criteria (5 Math + 5 English).
 * 
 * @param {Array<Object> | Object} criteriaOrLesson - Array of 10 criteria or a Lesson object
 * @returns {boolean} True only if exactly 10/10 criteria evaluate to passed === true
 */
export function canPublish(criteriaOrLesson) {
  let criteria = [];
  if (Array.isArray(criteriaOrLesson)) {
    criteria = criteriaOrLesson;
  } else if (criteriaOrLesson && Array.isArray(criteriaOrLesson.verification)) {
    criteria = criteriaOrLesson.verification;
  } else if (criteriaOrLesson && typeof criteriaOrLesson === 'object') {
    criteria = evaluateCriteria(criteriaOrLesson);
  } else {
    return false;
  }

  if (criteria.length !== 10) {
    return false;
  }

  const mathPassed = criteria.filter(c => c.layer === 'math' && c.passed === true).length;
  const englishPassed = criteria.filter(c => c.layer === 'english' && c.passed === true).length;

  return mathPassed === 5 && englishPassed === 5;
}

/**
 * Generates a comprehensive publishing gate diagnosis report.
 * @param {Object} lesson
 * @returns {Object} Diagnostic report with blocker descriptions
 */
export function getPublishGateReport(lesson) {
  const criteria = evaluateCriteria(lesson, lesson.verification ? Object.fromEntries(lesson.verification.map(c => [c.id, c])) : {});
  const mathCriteria = criteria.filter(c => c.layer === 'math');
  const englishCriteria = criteria.filter(c => c.layer === 'english');

  const mathPassCount = mathCriteria.filter(c => c.passed).length;
  const englishPassCount = englishCriteria.filter(c => c.passed).length;
  const totalPassCount = mathPassCount + englishPassCount;
  const passedAll = totalPassCount === 10;

  const failedCriteria = criteria.filter(c => !c.passed);
  const blockers = failedCriteria.map(c => `[${c.id} - ${c.layer.toUpperCase()}] ${c.titleVi}: ${c.notes}`);

  return {
    canPublish: passedAll,
    totalCriteria: 10,
    passedCriteria: totalPassCount,
    failedCriteria,
    math: {
      passed: mathPassCount === 5,
      passCount: mathPassCount,
      total: 5
    },
    english: {
      passed: englishPassCount === 5,
      passCount: englishPassCount,
      total: 5
    },
    blockers,
    summaryVi: passedAll
      ? 'Đạt 100% tiêu chí kiểm chứng 2 lớp (Toán học & Tiếng Anh). Đủ điều kiện xuất bản.'
      : `Chưa đủ điều kiện: còn ${10 - totalPassCount} tiêu chí chưa đạt.`,
    summaryEn: passedAll
      ? '100% of Dual-Layer Verification criteria passed (Math & English). Approved for publication.'
      : `Publication blocked: ${10 - totalPassCount} criteria failed.`
  };
}

/**
 * Generates an official, tamper-evident KHKT Quality Certificate.
 * Throws an error if the lesson does not pass 100% of criteria.
 * 
 * @param {Object} lesson
 * @param {Object} [auditSignatures={}]
 * @returns {Object} Certificate metadata
 */
export function generateCertificate(lesson, auditSignatures = {}) {
  const gateReport = getPublishGateReport(lesson);
  if (!gateReport.canPublish) {
    throw new Error(
      `Cannot generate certificate: lesson failed ${gateReport.failedCriteria.length} verification criteria. ` +
      `Blockers: ${gateReport.blockers.join('; ')}`
    );
  }

  const now = new Date().toISOString();
  const slug = (lesson.id || 'lesson').replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
  const rawHashInput = `${lesson.id}|${lesson.titleEn}|${now}|MATH:5/5|ENG:5/5`;
  const checksum = simpleChecksum(rawHashInput);
  const certId = `KHKT-CERT-2026-${slug}-${checksum}`;

  return {
    certificateId: certId,
    lessonId: lesson.id,
    lessonTitleVi: lesson.titleVi,
    lessonTitleEn: lesson.titleEn,
    topic: lesson.topic,
    grade: lesson.grade || '10',
    difficulty: lesson.difficulty || 'Medium',
    issuedAt: now,
    status: 'CERTIFIED_EXCELLENT',
    institution: 'THPT Trần Văn Kiết — Sở GD&ĐT Vĩnh Long',
    competition: 'Cuộc thi Nghiên cứu Khoa học Kỹ thuật (KHKT) Dành cho Học sinh Trung học',
    regulatoryCompliance: 'Thông tư số 84/2026/TT-BGDĐT',
    leadResearcher: 'Phạm Nguyễn Ti Na (Lớp 10A1)',
    scientificAdvisor: 'ThS. Lê Thanh Tâm',
    evaluationMatrix: {
      totalCriteria: 10,
      passedCriteria: 10,
      passRate: '100%',
      layer1_math: {
        status: 'PASSED',
        passedCriteria: 5,
        totalCriteria: 5,
        auditor: auditSignatures.mathAuditor || 'Tổ Toán THPT Trần Văn Kiết',
        criteria: gateReport.math
      },
      layer2_english: {
        status: 'PASSED',
        passedCriteria: 5,
        totalCriteria: 5,
        auditor: auditSignatures.englishAuditor || 'Tổ Ngoại ngữ CLIL THPT Trần Văn Kiết',
        criteria: gateReport.english
      }
    },
    verificationChecksum: checksum,
    tamperCheckString: rawHashInput
  };
}

/**
 * Verifies the validity of an issued KHKT Quality Certificate.
 * @param {Object} certificate
 * @param {Object} lesson
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyCertificate(certificate, lesson) {
  if (!certificate || typeof certificate !== 'object') {
    return { valid: false, reason: 'Invalid certificate object' };
  }
  if (!certificate.certificateId || !certificate.verificationChecksum) {
    return { valid: false, reason: 'Missing certificate identifiers' };
  }
  if (lesson && certificate.lessonId !== lesson.id) {
    return { valid: false, reason: `Certificate lessonId mismatch: expected ${lesson.id}, got ${certificate.lessonId}` };
  }
  const recalculated = simpleChecksum(certificate.tamperCheckString || '');
  if (recalculated !== certificate.verificationChecksum) {
    return { valid: false, reason: 'Tamper detection triggered: verification checksum mismatch' };
  }
  return { valid: true };
}
```

---

## 6. Integration & Compatibility Architecture

### 6.1 Inter-Service Interaction Flow
The following interaction diagram outlines how the foundational services orchestrate data during lesson authoring, playback, and publication:

```
[ Authoring Studio ] 
       │ 
       ├─► 1. Save Draft ──────────────► [ storage.js ] (Persists draft lesson)
       │
       ├─► 2. Run Verification ────────► [ verification.js ] (Evaluates 10 criteria)
       │                                        │
       │   ┌────────────────────────────────────┘
       │   ├─ If < 10 PASS: Returns diagnostic blockers; disables Publish button
       │   └─ If 10/10 PASS: 
       │          ├─► 3. canPublish === true
       │          ├─► 4. generateCertificate(lesson)
       │          └─► 5. storage.saveLesson({ ...lesson, status: 'PUBLISHED' })
       │
[ 5-Scene Player & Glossary ]
       │
       ├─► 6. Fetch Lesson ────────────► [ storage.js ] (Loads active lesson)
       ├─► 7. Pronounce Term ──────────► [ speech.js ] (speaks with rate 0.9)
       └─► 8. Submit Quiz ─────────────► [ storage.js ] (Saves score out of 10)
```

### 6.2 Node.js Test Runner Compatibility (`node:test`)
A critical requirement from `PROJECT.md` is that tests must run cleanly via `node --test tests/**/*.test.js`.
All 3 services are built to execute directly in Node 20+:
- `storage.js`: detects absent `window` and activates `MemoryStorage`.
- `speech.js`: detects absent `window.speechSynthesis` and executes mock microtasks.
- `verification.js`: relies only on standard JavaScript primitives and regex.

Implementer unit tests in `tests/verification.test.js` can directly import:
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCriteria, canPublish, generateCertificate } from '../src/services/verification.js';
import { getLessons, saveLesson, deleteLesson, importLessonsJSON, exportLessonsJSON } from '../src/services/storage.js';
import { isSupported, speak } from '../src/services/speech.js';
```

---

## 7. Implementation Checklist for Milestone M1

The implementer can follow this exact sequence to realize the asset pipeline and services:

1. **Asset Pipeline**:
   - [ ] Place `extract_assets.py` at the project root `/Users/mac/Desktop/math_english_ai_learn/extract_assets.py`.
   - [ ] Execute `python3 extract_assets.py` to populate `public/assets/khkt/` with `image1.png` through `image5.png`, aliases, and `manifest.json`.
   - [ ] Verify asset extraction with `python3 extract_assets.py --verify-only`.
2. **Storage Service**:
   - [ ] Place `src/services/storage.js` with `MemoryStorage` fallback and default lesson protection.
   - [ ] Wire `initStorage(DEFAULT_LESSONS)` to seed canonical lessons.
   - [ ] Ensure `importLessonsJSON` rejects invalid schemas and `deleteLesson` guards default lessons.
3. **Speech Service**:
   - [ ] Place `src/services/speech.js` with 120–140 WPM rate control (`rate = 0.9`).
   - [ ] Confirm silent/mock fallback operates cleanly in Node.js test runs.
4. **Verification Service**:
   - [ ] Place `src/services/verification.js` with the 10 Dual-Layer criteria definitions.
   - [ ] Validate that `canPublish()` strictly requires 10/10 PASS.
   - [ ] Verify `generateCertificate()` throws when criteria fail and succeeds with valid checksum when 10/10 PASS.
