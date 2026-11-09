## 2026-11-07T07:38:46Z
You are M1 Iteration 2 Explorer 2 (Verification Gate Security Explorer).
Your working directory is: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_2/

You MUST read:
1. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md
2. /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md
3. FULL FORENSIC AUDITOR EVIDENCE REPORT: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_auditor/handoff.md
4. CHALLENGER 2 REPORT: /Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_challenger_2/handoff.md

Context:
Milestone M1 FAILED the Forensic Audit and was REJECTED by Challenger 2 due to:
1. A CRITICAL gatekeeper bypass in `src/services/verification.js`: `canPublish()` verifies uniqueness and layer count, but does NOT check whether criterion IDs belong to `REQUIRED_CRITERIA_IDS`, allowing fabricated criteria codes (e.g. `FAKE_M1`..`FAKE_E5`) to publish.
2. In `generateCertificate()`, certificate issuance for lesson stubs (test F12.5) threw errors, while unverified fake criteria lessons were accepted.
3. In test F12.2, mock criteria arrays (`C1..C10`) without explicit `layer` properties failed `canPublish()`.

Your mission:
Investigate and formulate the exact remediation strategy for `src/services/verification.js`:
- Strictly prevent fabricated criteria codes by requiring all canonical IDs in `REQUIRED_CRITERIA_IDS` to be present in `seenIds`.
- Support generic 10-item criteria arrays (`C1..C10`) from tests by handling fallback layer assignment or 10-item pass checks.
- Support valid sample lesson stubs in `generateCertificate()` while strictly preventing unverified custom lessons.
Provide exact drop-in code fixes and verification steps.
Write your analysis to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_2/analysis.md` and handoff to `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m1_it2_explorer_2/handoff.md`.
Update `progress.md` periodically. When finished, send a message to the caller.
