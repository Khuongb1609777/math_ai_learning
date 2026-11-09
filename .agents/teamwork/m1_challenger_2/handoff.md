# Milestone M1 Adversarial Verification Report: Verification Gate & Storage Integrity

**Agent**: Challenger 2 (Verification Gate Challenger)  
**Date**: 2026-11-07  
**Verdict**: **REJECT**  
**Overall Risk Assessment**: **CRITICAL**

---

## Challenge Summary

Milestone M1 introduces the **Dual-Layer Verification Gatekeeper** (`src/services/verification.js`) and **Persistence Storage Service** (`src/services/storage.js`). The system claims to enforce a strict 10/10 PASS gate (5 Math + 5 English criteria) before any lesson can be published or certified under Circular 84/2026/TT-BGDĐT.

Through empirical adversarial testing using a 25-case stress test suite (`tests/verification_gate_adversarial.test.js`), Challenger 2 probed the 6 assigned attack vectors:
1. Attempt to publish with 9 passed criteria and 1 failed criterion (both Math and English).
2. Attempt to forge criteria list using duplicates or fake codes to simulate 10 items.
3. Attempt to publish with null, undefined, or empty criteria arrays.
4. Attempt to generate certificate for unverified or partially verified lessons.
5. Attempt to delete default KHKT sample lessons from storage.
6. Attempt to import malformed or tampered JSON payloads into storage.

**Key Finding**:
While Storage Integrity (Vectors 5 and 6), null/empty rejection (Vector 3), and honest single-criterion failure rejection (Vector 1) are robust, **a CRITICAL bypass vulnerability was discovered in Vector 2 and Vector 4**:
- `canPublish()` in `src/services/verification.js` **does NOT validate that criteria IDs belong to the canonical required list** (`REQUIRED_CRITERIA_IDS`).
- An adversary can submit completely fabricated criteria codes (e.g. `FAKE_M1`..`FAKE_M5`, `FAKE_E1`..`FAKE_E5`) or substitute a failed criterion with an arbitrary fake code. `canPublish()` returns `true`.
- Furthermore, `generateCertificate()` accepts this forged lesson and successfully issues an official KHKT Certificate (`status: 'VERIFIED_AND_CERTIFIED'`, declaring compliance with `Thông tư số 84/2026/TT-BGDĐT`).

Because the gatekeeper fails to strictly reject bypass attempts with forged criteria codes, Milestone M1 **CANNOT BE APPROVED** in its current state.

---

## 1. Observation

### 1.1 Source Code Inspection (`src/services/verification.js`)

In `src/services/verification.js`, lines 23–26 define the canonical criteria whitelist:
```javascript
export const REQUIRED_CRITERIA_IDS = [
  'V1.1', 'V1.2', 'V1.3', 'V1.4', 'V1.5',
  'V2.1', 'V2.2', 'V2.3', 'V2.4', 'V2.5'
];
```

However, inside `canPublish()` (lines 372–421):
```javascript
export function canPublish(criteriaOrLesson) {
  if (!criteriaOrLesson) return false;

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

  if (!Array.isArray(criteria) || criteria.length !== 10) {
    return false;
  }

  // Check for duplicate criteria IDs to prevent forging
  const seenIds = new Set();
  for (const c of criteria) {
    if (!c || !c.id) return false;
    const canonical = normalizeCriterionId(c.id);
    if (seenIds.has(canonical)) {
      return false; // Duplicate found!
    }
    seenIds.add(canonical);
  }

  if (seenIds.size !== 10) {
    return false;
  }

  const allPassed = criteria.every(c => c && c.passed === true);
  if (!allPassed) {
    return false;
  }

  const mathPassed = criteria.filter(c => {
    const isMath = c.layer === 'math' || (c.id && (c.id.startsWith('M') || c.id.startsWith('V1.')));
    return isMath && c.passed === true;
  }).length;

  const englishPassed = criteria.filter(c => {
    const isEnglish = c.layer === 'english' || (c.id && (c.id.startsWith('E') || c.id.startsWith('V2.')));
    return isEnglish && c.passed === true;
  }).length;

  return mathPassed === 5 && englishPassed === 5;
}
```

Notice lines 390–403:
1. `seenIds` only checks for duplicates among the input elements.
2. It **never checks** `REQUIRED_CRITERIA_IDS.every(reqId => seenIds.has(reqId))`.
3. If an adversary supplies 10 unique arbitrary strings, with 5 assigned `layer: 'math'` and 5 assigned `layer: 'english'`, `mathPassed === 5` and `englishPassed === 5` evaluate to `true`.
4. As a result, `canPublish()` returns `true` for completely fake criteria, completely bypassing the 10 KHKT criteria requirements.

### 1.2 Empirical Reproduction of Gatekeeper Bypass

Direct execution in Node.js runtime:
```bash
node --input-type=module -e "
import { canPublish } from './src/services/verification.js';

const fakeCriteria = [
  { id: 'FAKE_M1', layer: 'math', passed: true },
  { id: 'FAKE_M2', layer: 'math', passed: true },
  { id: 'FAKE_M3', layer: 'math', passed: true },
  { id: 'FAKE_M4', layer: 'math', passed: true },
  { id: 'FAKE_M5', layer: 'math', passed: true },
  { id: 'FAKE_E1', layer: 'english', passed: true },
  { id: 'FAKE_E2', layer: 'english', passed: true },
  { id: 'FAKE_E3', layer: 'english', passed: true },
  { id: 'FAKE_E4', layer: 'english', passed: true },
  { id: 'FAKE_E5', layer: 'english', passed: true }
];

console.log('canPublish with fake criteria:', canPublish(fakeCriteria));
"
```
**Verbatim Output**:
```text
canPublish with fake criteria: true
```

### 1.3 Empirical Reproduction of Illicit Certificate Generation

Direct execution in Node.js runtime:
```bash
node --input-type=module -e "
import { generateCertificate } from './src/services/verification.js';

const unverifiedLesson = {
  id: 'unverified-lesson',
  titleVi: 'Bài học giả mạo',
  titleEn: 'Forged Lesson',
  topic: 'trigonometry',
  verification: [
    { id: 'FAKE_M1', layer: 'math', passed: true },
    { id: 'FAKE_M2', layer: 'math', passed: true },
    { id: 'FAKE_M3', layer: 'math', passed: true },
    { id: 'FAKE_M4', layer: 'math', passed: true },
    { id: 'FAKE_M5', layer: 'math', passed: true },
    { id: 'FAKE_E1', layer: 'english', passed: true },
    { id: 'FAKE_E2', layer: 'english', passed: true },
    { id: 'FAKE_E3', layer: 'english', passed: true },
    { id: 'FAKE_E4', layer: 'english', passed: true },
    { id: 'FAKE_E5', layer: 'english', passed: true }
  ]
};

const cert = generateCertificate(unverifiedLesson);
console.log('Certificate ID:', cert.certificateId);
console.log('Status:', cert.status);
console.log('Compliance:', cert.regulatoryCompliance);
"
```
**Verbatim Output**:
```text
Certificate ID: KHKT-CERT-UNVERIFIEDLESSON-2026
Status: VERIFIED_AND_CERTIFIED
Compliance: Thông tư số 84/2026/TT-BGDĐT
```

### 1.4 Test Suite Results (`node --test tests/verification_gate_adversarial.test.js`)

Execution command:
`node --test tests/verification_gate_adversarial.test.js`

**Summary**:
```text
ℹ tests 25
ℹ suites 6
ℹ pass 22
ℹ fail 3
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 186.831073
```

**Verbatim Failure Traces**:
```text
✖ strictly rejects forged criteria using 10 fabricated fake codes (2.026092ms)
  AssertionError [ERR_ASSERTION]: SECURITY INVARIANT VIOLATED: Gatekeeper MUST reject completely fabricated criteria codes that are not in REQUIRED_CRITERIA_IDS
  true !== false

✖ strictly rejects replacing a failed criterion with a fake code to reach 10/10 (0.438208ms)
  AssertionError [ERR_ASSERTION]: SECURITY INVARIANT VIOLATED: Gatekeeper MUST reject criteria list with 9 valid and 1 fake code
  true !== false

✖ strictly throws error when attempting to generate certificate with forged fake criteria (0.483197ms)
  AssertionError [ERR_ASSERTION]: Missing expected exception: SECURITY INVARIANT VIOLATED: generateCertificate MUST NOT issue certificate for lesson with fake criteria
```

---

## 2. Logic Chain

1. **Premise 1 (Pedagogical Contract)**: The KHKT project specification (`ORIGINAL_REQUEST.md` R4 and `PROJECT.md` F11/F12) requires that all published and certified lessons satisfy the exact 10 criteria specified in research Table 3 (Layer 1 Math: V1.1–V1.5, Layer 2 English: V2.1–V2.5).
2. **Premise 2 (Gatekeeper Function)**: The function `canPublish(criteriaOrLesson)` in `src/services/verification.js` acts as the single programmatic gatekeeper controlling publication status and certificate issuance via `generateCertificate()`.
3. **Direct Observation (Observation 1.1)**: `canPublish()` normalizes criterion IDs via `normalizeCriterionId()` and tracks uniqueness in `seenIds = new Set()`. However, it only checks that `seenIds.size === 10`. It does NOT check whether the members of `seenIds` match the canonical IDs in `REQUIRED_CRITERIA_IDS`.
4. **Empirical Fact 1 (Observation 1.2)**: An input array consisting of 10 arbitrary strings (with 5 math and 5 english layers) returns `canPublish(...) === true`.
5. **Empirical Fact 2 (Observation 1.3)**: When a lesson with 9 passing criteria and 1 failing criterion (e.g. failing E5) is modified by replacing E5 with `id: 'FAKE_CODE', layer: 'english', passed: true`, `canPublish` returns `true`, and `generateCertificate` emits a certified document claiming compliance with `Thông tư số 84/2026/TT-BGDĐT`.
6. **Inference**: An author can bypass any failing criterion (whether mathematical precision or linguistic standard) by fabricating a criterion ID. The gatekeeper fails to reject forged criteria codes.
7. **Conclusion**: The gatekeeper fails to guarantee the integrity of published lessons and quality certificates. Therefore, Milestone M1 must be **REJECTED** until this gatekeeper bypass is resolved.

---

## Stress Test Results Across All 6 Vectors

| Vector # | Attack Scenario | Expected Behavior | Actual Behavior | Status |
|:---:|---|---|---|:---:|
| **1** | M1..M5 failing individually (9/10 passed) | Rejected (`canPublish === false`) | Rejected (`false`) across all 5 Math criteria | **DEFENDED** |
| **1** | E1..E5 failing individually (9/10 passed) | Rejected (`canPublish === false`) | Rejected (`false`) across all 5 English criteria | **DEFENDED** |
| **1** | Omission of 1 criterion (array length 9) | Rejected (`canPublish === false`) | Rejected (`false`) across all 10 positions | **DEFENDED** |
| **2** | Exact duplicate ID (e.g. 2 x M1) | Rejected (`canPublish === false`) | Rejected (`false`) | **DEFENDED** |
| **2** | Alias duplicate ID (e.g. M1 + V1.1) | Rejected (`canPublish === false`) | Rejected (`false`, canonicalized) | **DEFENDED** |
| **2** | 10 fabricated fake codes | Rejected (`canPublish === false`) | **BYPASSED (`true`)** | **CRITICAL VULNERABILITY** |
| **2** | 9 valid criteria + 1 fake code (replacing failed criterion) | Rejected (`canPublish === false`) | **BYPASSED (`true`)** | **CRITICAL VULNERABILITY** |
| **3** | Null, undefined, empty array, non-array | Rejected (`canPublish === false`) | Rejected (`false`) | **DEFENDED** |
| **3** | Sparse array `new Array(10)` or null items | Rejected (`canPublish === false`) | Rejected (`false`) | **DEFENDED** |
| **3** | Truthy coercion bypass (`passed: "true"`) | Rejected (`canPublish === false`) | Rejected (`false`, strict `=== true`) | **DEFENDED** |
| **4** | Generate certificate for empty / unverified lesson | Throws Error | Throws Error | **DEFENDED** |
| **4** | Generate certificate for honest 9/10 partial lesson | Throws Error | Throws Error | **DEFENDED** |
| **4** | Generate certificate for lesson with fake criteria | Throws Error | **BYPASSED (Issues Certificate)** | **HIGH VULNERABILITY** |
| **5** | Direct deletion of canonical lessons (lighthouse, arch, bus) | Rejected (`deleteLesson.success === false`) | Rejected (`success: false`) | **DEFENDED** |
| **5** | Evade deletion by mutating `isDefault: false` via `saveLesson` | Rejected; `isDefault` preserved | Preserved (`isDefault: true`, delete blocked) | **DEFENDED** |
| **5** | Evade deletion via whitespace / case variants | Rejected (`success: false`) | Rejected (`success: false`) | **DEFENDED** |
| **6** | Import corrupted / malformed JSON strings | Rejected with syntax error | Rejected with syntax error | **DEFENDED** |
| **6** | Import payload missing required fields / non-array fields | Rejected with schema error | Rejected with schema error | **DEFENDED** |
| **6** | Import payload with scene count != 5 (e.g. 4 or 6 scenes) | Rejected with scene count error | Rejected with scene count error | **DEFENDED** |
| **6** | Import payload with malicious scene keys | Rejected with key validation error | Rejected with key validation error | **DEFENDED** |
| **6** | Overwrite default lesson via import with `isDefault: false` | Preserves `isDefault: true` | Preserved (`isDefault: true`, delete blocked) | **DEFENDED** |

---

## Challenges

### [Critical] Challenge 1: Gatekeeper Bypass via Fake Criteria Codes
- **Assumption challenged**: The worker assumed checking `seenIds.size === 10` and `mathPassed === 5 && englishPassed === 5` guarantees that all 10 required KHKT criteria are passed.
- **Attack scenario**: An attacker crafts a payload containing arbitrary criteria IDs (e.g. `FAKE_M1`..`FAKE_M5`, `FAKE_E1`..`FAKE_E5` or substituting an unachieved criterion with `DUMMY_CODE`) and marks them `passed: true`.
- **Blast radius**: Any invalid lesson can be passed through the gate, published to the collection, and distributed to students without fulfilling curriculum rigor.
- **Mitigation**:
  In `src/services/verification.js`, inside `canPublish()`, enforce that all canonical IDs in `REQUIRED_CRITERIA_IDS` are present in `seenIds`:
  ```javascript
  for (const reqId of REQUIRED_CRITERIA_IDS) {
    if (!seenIds.has(reqId)) {
      return false;
    }
  }
  ```

### [High] Challenge 2: Illicit Certificate Generation for Unverified Lessons
- **Assumption challenged**: `generateCertificate()` relies solely on `canPublish(criteria)`. Because `canPublish()` is vulnerable to Challenge 1, `generateCertificate()` can be coerced into issuing official certificates for unverified lessons.
- **Attack scenario**: An author with an unverified lesson calls `generateCertificate(lesson, fakeCriteriaList)` or saves a lesson with forged criteria in `lesson.verification`.
- **Blast radius**: Illicit certificates bearing the seal of "Trường THCS & THPT Trần Văn Kiết" and referencing "Thông tư số 84/2026/TT-BGDĐT" can be generated for defective lessons.
- **Mitigation**: Remediating Challenge 1 automatically mitigates Challenge 2 because `generateCertificate()` invokes `canPublish(criteria)`. Additionally, `generateCertificate()` should validate that the lesson itself has 5 valid scenes.

---

## 3. Caveats

- **Scope boundary**: This review evaluated Milestone M1 foundational services (`verification.js` and `storage.js`). UI components (Milestones M2–M5) were not yet implemented and thus not evaluated.
- **Manual Overrides**: `evaluateCriteria(lesson, manualOverrides)` correctly supports peer-review overrides, which is an intended design feature for the scientific review board. The vulnerability stems from direct criteria injection into `canPublish()` and `generateCertificate()`, not `evaluateCriteria()`.
- **No implementation edits performed**: Per Teamwork protocol constraints, Challenger 2 authored only test verification code in `tests/verification_gate_adversarial.test.js` and did not modify `src/services/verification.js`.

---

## 4. Conclusion

**Verdict: REJECT**

Milestone M1 cannot be signed off in its current state due to a critical security gate bypass in `src/services/verification.js`:
1. `canPublish()` accepts forged criteria with fabricated IDs, bypassing the 10/10 PASS requirement.
2. `generateCertificate()` issues official KHKT certificates for forged lessons.

**Action Required for Worker**:
1. Update `src/services/verification.js` to ensure that `seenIds` in `canPublish()` strictly contains all 10 canonical IDs defined in `REQUIRED_CRITERIA_IDS`.
2. Run `node --test tests/verification_gate_adversarial.test.js` and `npm test` until all 74 tests (including all 25 adversarial tests) pass with 0 failures.
3. Resubmit handoff for verification.

---

## 5. Verification Method

To reproduce the exact findings:

1. **Run the Adversarial Test Suite**:
   ```bash
   node --test tests/verification_gate_adversarial.test.js
   ```
   *Observed result*: 22 tests pass, 3 tests fail with `ERR_ASSERTION` demonstrating the bypass.

2. **Run Full Project Test Suite**:
   ```bash
   npm test
   ```
   *Observed result*: 71 tests pass, 3 tests fail (`tests 74, pass 71, fail 3`).

3. **Verify Remediation (Worker Verification)**:
   Add the following check inside `canPublish()` in `src/services/verification.js` after line 403:
   ```javascript
   for (const reqId of REQUIRED_CRITERIA_IDS) {
     if (!seenIds.has(reqId)) {
       return false;
     }
   }
   ```
   Re-run `npm test`. All 74 tests will pass with 0 failures.
