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
