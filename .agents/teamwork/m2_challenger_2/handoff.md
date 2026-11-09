# Milestone M2 Adversarial Verification Report: Modal Lifecycle & State Transitions

**Agent**: Milestone M2 Challenger 2 (Modal & State Adversarial Verification)  
**Date**: 2026-11-07  
**Verdict**: **REJECT**  
**Overall Risk Assessment**: **HIGH**

---

## Challenge Summary

Milestone M2 implements the **KHKT Research Showcase Modal** (`src/components/KhktShowcaseModal.js`), the **Navigation Header** (`src/components/Header.js`), and the **Root Application Controller** (`src/app.js`).

Challenger 2 constructed an adversarial test suite with 25 test cases (`tests/modal_state_adversarial.test.js`) targeting the 5 mandatory challenge vectors:
1. **Vector 1**: Rapid opening and closing of modal without memory leak or double backdrop.
2. **Vector 2**: Keyboard accessibility (Escape key dismiss, focus trapping within dialog).
3. **Vector 3**: Language state synchronization across components when switching between `'vi'`, `'en'`, and `'dual'`.
4. **Vector 4**: LocalStorage corruption resilience in `user_settings` (malformed JSON, missing properties, quota limits).
5. **Vector 5**: Offline resilience test (ensuring zero network calls are attempted).

### Test Suite Execution Summary
- **E2E Test Suite** (`node tests/e2e/runner.js`): **175 / 175 PASS** (Tiers 1–4, 100% pass rate).
- **Unit & Adversarial Suite** (`npm test`): **143 / 146 PASS**, **3 FAIL** exposing 3 critical state/lifecycle flaws:
  1. *Vector 1 (Race Condition)*: Reopening the modal within 250ms of closing triggers an un-cancelled cleanup timer that deletes the reopened modal from the DOM.
  2. *Vector 1 (Re-entrancy Leak)*: Rapid consecutive calls to `app.handleOpenShowcase()` create duplicate backdrop elements in `#modal-root` and permanently leak `keydown` listeners on `document`.
  3. *Vector 3 (State Desynchronization)*: Changing language via `app.handleLanguageChange(lang)` leaves `app.header.language` stuck at initial `'dual'` without synchronization.

Because of confirmed memory leaks, double backdrop creation, premature modal destruction, and cross-component UI state desynchronization, Milestone M2 **CANNOT BE APPROVED** in its current state.

---

## 1. Observation

### 1.1 Source Code Inspection: Uncancelled Timeout on Rapid Reopen (`src/components/KhktShowcaseModal.js`)

In `src/components/KhktShowcaseModal.js`, lines 530–554 implement `close()`:
```javascript
  close() {
    if (!this.modalEl) return;

    this.modalEl.classList.remove('is-open');
    this.modalEl.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', this.boundKeyHandler);
    document.body.style.overflow = '';

    setTimeout(() => {
      if (this.modalEl && this.modalEl.parentNode) {
        this.modalEl.parentNode.removeChild(this.modalEl);
        this.modalEl = null;
      }
      if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
        this.previousActiveElement.focus();
      }
      if (typeof this.options.onClose === 'function') {
        this.options.onClose();
      }
    }, 250);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('khkt:modal-closed'));
  }
```

Notice lines 539–550:
1. `setTimeout(..., 250)` is scheduled unconditionally without storing the timer identifier (e.g., `this.closeTimeout`).
2. Inside `open()` (lines 486–526), there is no call to `clearTimeout(this.closeTimeout)`.
3. If `open()` is called while the 250ms timer is active, `this.modalEl` is reused. However, when the 250ms timer expires, it executes `this.modalEl.parentNode.removeChild(this.modalEl)` and `this.modalEl = null`, destroying the actively displayed modal and invoking `this.options.onClose()`.

**Verbatim Test Failure**:
```text
✖ stress-tests rapid open-close-open cycle (<250ms): exposes stale cleanup timer destroying reopened modal (330.399619ms)
  AssertionError [ERR_ASSERTION]: LIFECYCLE VULNERABILITY DETECTED: KhktShowcaseModal.close() schedules a 250ms timeout that is NOT cancelled by open(). The reopened modal was destroyed by the stale closing timer!
  false !== true
      at TestContext.<anonymous> (tests/modal_state_adversarial.test.js:571:12)
```

---

### 1.2 Source Code Inspection: Double Backdrop & Keydown Listener Leak (`src/app.js`)

In `src/app.js`, lines 170–196 implement `handleOpenShowcase()`:
```javascript
  async handleOpenShowcase() {
    this.state.isShowcaseModalOpen = true;
    
    // Dynamically attempt to load KhktShowcaseModal if available
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }

    try {
      const { KhktShowcaseModal } = await import('./components/KhktShowcaseModal.js');
      if (KhktShowcaseModal) {
        this.showcaseModal = new KhktShowcaseModal({
          container: modalRoot,
          language: this.state.language,
          onClose: this.handleCloseShowcase
        });
        this.showcaseModal.mount(modalRoot);
        return;
      }
    } catch (e) {
      // Graceful inline fallback
      this.renderShowcaseModalFallback(modalRoot);
    }
  }
```

Notice lines 170–190:
1. `handleOpenShowcase()` never checks `if (this.state.isShowcaseModalOpen)` or `if (this.showcaseModal && this.showcaseModal.isOpen())`.
2. Every call constructs a new instance `new KhktShowcaseModal({ container: modalRoot, ... })`.
3. `mount(modalRoot)` appends a new `.khkt-modal-backdrop` into `modalRoot`.
4. In `KhktShowcaseModal.open()`, line 515 attaches a unique `boundKeyHandler` via `document.addEventListener('keydown', this.boundKeyHandler)`.
5. When `this.showcaseModal` is reassigned to instance 2, instance 1 is orphaned without calling `close()`.
6. When `app.handleCloseShowcase()` is called, only instance 2 is closed. Instance 1's `keydown` listener remains permanently registered on `document`.

**Verbatim Test Failure**:
```text
✖ stress-tests rapid app.handleOpenShowcase() invocations: exposes double backdrop & keydown listener leak (3.97787ms)
  AssertionError [ERR_ASSERTION]: DOUBLE BACKDROP VULNERABILITY DETECTED: app.handleOpenShowcase() instantiated multiple KhktShowcaseModal backdrops without checking isShowcaseModalOpen or closing previous instance!
  2 !== 1
      at TestContext.<anonymous> (tests/modal_state_adversarial.test.js:608:12)
```

---

### 1.3 Source Code Inspection: Header Desynchronization on Language Switch (`src/app.js`)

In `src/app.js`, lines 155–165 implement `handleLanguageChange()`:
```javascript
  handleLanguageChange(lang) {
    this.state.language = lang;
    this.saveUserSettings();
    
    // Broadcast event for all active and nested components
    window.dispatchEvent(new CustomEvent('app:language-change', { detail: { lang } }));
    
    // Re-render views with new language
    this.renderMainContent();
    this.renderFooter();
  }
```

Notice lines 155–165:
1. `app.handleLanguageChange()` updates `this.state.language`, saves settings, dispatches a window event, and calls `renderMainContent()` and `renderFooter()`.
2. It **never calls `this.header.setLanguage(lang)`**.
3. In `src/components/Header.js` (lines 285–288), `Header` only listens to `keydown` and `click`, and **never registers an event listener for `'app:language-change'`**.
4. As a result, when language is toggled via `app.handleLanguageChange('en')` or when initiated outside the header button (e.g. from a deep link, route, or settings), `app.header.language` remains `'dual'`, displaying stale navigation text and showing the wrong active button in the language switch toggle.

**Verbatim Test Failure**:
```text
✖ cross-component language sync test: exposes Header remaining desynchronized on App language change (2.808934ms)
  AssertionError [ERR_ASSERTION]: STATE SYNCHRONIZATION VULNERABILITY DETECTED: app.handleLanguageChange("en") updated app.state.language to "en", but app.header.language remains desynchronized at "dual"! App.handleLanguageChange must call this.header.setLanguage(lang).
  'dual' !== 'en'
      at TestContext.<anonymous> (tests/modal_state_adversarial.test.js:887:12)
```

---

### 1.4 Test Suite Summary (`npm test` and `node tests/e2e/runner.js`)

Execution command: `npm test`  
**Output Summary**:
```text
ℹ tests 146
ℹ suites 32
ℹ pass 143
ℹ fail 3
ℹ duration_ms 1491.665409
```

Execution command: `node tests/e2e/runner.js`  
**Output Summary**:
```text
Discovered 175 tests. Running 175 selected tests...
ALL 175 E2E TESTS PASSED SUCCESSFULLY! (0.11s)
```

---

## 2. Logic Chain

1. **Premise 1 (Vector 1 Contract)**: The dispatch explicitly mandates: "Rapid opening and closing of modal without memory leak or double backdrop".
2. **Direct Observation (Observation 1.1)**: In `KhktShowcaseModal.js:539`, `close()` initiates an un-tracked 250ms asynchronous timer. Calling `open()` before 250ms re-attaches the modal, but the timer executes unconditionally at 250ms, removes the reopened modal from the DOM, and sets `modalEl = null`.
3. **Direct Observation (Observation 1.2)**: In `app.js:170`, `handleOpenShowcase()` lacks an `isShowcaseModalOpen` guard. Calling it twice rapidly adds 2 `.khkt-modal-backdrop` elements to `#modal-root` and permanently leaks a `keydown` listener on `document` upon close.
4. **Premise 2 (Vector 3 Contract)**: The dispatch explicitly mandates: "Language state synchronization across components when switching between 'vi', 'en', and 'dual'".
5. **Direct Observation (Observation 1.3)**: In `app.js:155`, `handleLanguageChange(lang)` sets `this.state.language = lang`, but does not invoke `this.header.setLanguage(lang)`. Header does not subscribe to `'app:language-change'`. Calling `app.handleLanguageChange('en')` leaves `app.header.language === 'dual'`.
6. **Inference**: The system fails the non-functional requirements of modal lifecycle stability, memory leak prevention, and state synchronization across components.
7. **Conclusion**: Milestone M2 work product contains blocking bugs in Vectors 1 and 3, requiring a **REJECT** verdict.

---

## Stress Test Results Across All 5 Vectors

| Vector # | Target Scope | Attack Scenario | Expected Invariant | Actual Behavior | Result |
|:---:|---|---|---|---|:---:|
| **1** | Modal Lifecycle | Rapid open-close-open cycle (<250ms) | Reopened modal stays open; close timer cancelled | Modal abruptly destroyed at 250ms; `isOpen() == false` | **FAIL (Bug)** |
| **1** | App Controller | Rapid consecutive `handleOpenShowcase()` | Exactly 1 backdrop; 0 leaked listeners | 2 backdrops created; 1 leaked `keydown` listener | **FAIL (Bug)** |
| **1** | Singleton Modal | `KhktShowcaseModal.open()` called 20x rapidly | Reuses single modalEl; exactly 1 backdrop | Defended; exactly 1 backdrop | **PASS** |
| **1** | Tab Stepper | Rapid tab switching (25x) across 5 tabs | Consistent DOM, correct `is-active` class | Defended; 100% active tab consistency | **PASS** |
| **1** | 7-Step Stepper | Navigation across Steps 1 to 7 | Step 5 displays gatekeeper badge | Defended; gatekeeper badge present | **PASS** |
| **1** | Figure Preview | Toggling figures (Fig 1, Fig 3, Fig 4) | Injects authentic docx image asset | Defended; image rendered/hidden properly | **PASS** |
| **2** | Accessibility | Escape key dismiss when open | Closes modal, restores scroll, dispatches event | Defended; `khkt:modal-closed` fired | **PASS** |
| **2** | Accessibility | Escape key dismiss when closed | Safe no-op without error | Defended; no unhandled exception | **PASS** |
| **2** | Accessibility | 10x rapid burst of Escape presses | Idempotent cleanup | Defended; no crash | **PASS** |
| **2** | Focus Trapping | Forward Tab from last focusable element | Wraps focus to first focusable element | Defended; `document.activeElement === first` | **PASS** |
| **2** | Focus Trapping | Backward Shift+Tab from first element | Wraps focus to last focusable element | Defended; `document.activeElement === last` | **PASS** |
| **2** | Focus Restore | Focus restoration after modal close | Restores focus to `previousActiveElement` | Defended; focus returned to launcher | **PASS** |
| **3** | State Sync | Language toggle persistence in storage | Stores `{"lang": mode}` in `user_settings` | Defended; persisted across all modes | **PASS** |
| **3** | State Sync | Language change window event dispatch | Emits `app:language-change` with detail | Defended; event received on window | **PASS** |
| **3** | State Sync | Header localized label rendering | Shows correct text in 'vi', 'en', 'dual' | Defended; correct text rendered | **PASS** |
| **3** | State Sync | Programmatic language change sync | Updates `app.header.language` | **Header language remains stuck at 'dual'** | **FAIL (Bug)** |
| **3** | State Sync | Dual mode bilingual string integrity | Displays both VI and EN titles | Defended; dual text present in UI | **PASS** |
| **4** | Corruption | Malformed non-JSON string in `user_settings` | Safe fallback to `'dual'` without crash | Defended; returns `'dual'` | **PASS** |
| **4** | Corruption | Invalid scalar types (numbers, booleans, null) | Safe fallback to `'dual'` without crash | Defended; returns `'dual'` | **PASS** |
| **4** | Corruption | Missing `lang` or invalid language codes | Safe fallback to `'dual'` without crash | Defended; returns `'dual'` | **PASS** |
| **4** | Corruption | `QuotaExceededError` / private mode write error | Catches gracefully without crashing app | Defended; no unhandled exception | **PASS** |
| **4** | Corruption | Corrupted payloads in lessons/quiz/surveys | Auto-reinitializes default canonical lessons | Defended; restores 3 default lessons | **PASS** |
| **5** | Offline | Application execution when `navigator.onLine=false` | Fully functional UI with zero remote requests | Defended; operates 100% offline | **PASS** |
| **5** | Offline | Network tripwire (fetch, XHR, WebSocket) | Zero network calls attempted | Defended; exactly 0 network calls | **PASS** |
| **5** | Offline | External CDN / remote script inspection | Zero remote URLs in index.html / modules | Defended; no external scripts or fonts | **PASS** |

---

## 3. Caveats

- **Scope boundary**: This review specifically evaluated Milestone M2 components (`KhktShowcaseModal.js`, `Header.js`, `CollectionExplorer.js`, and `app.js`). Downstream milestones (M3 5-Scene Player dynamic SVG simulation, M4 Worksheet/Survey scoring, M5 Authoring Studio) are planned for future iterations.
- **Robust areas verified**:
  - Vector 2 (Keyboard accessibility and focus trapping) is comprehensively implemented.
  - Vector 4 (LocalStorage corruption resilience) handles arbitrary corrupted payloads safely.
  - Vector 5 (Offline resilience) is fully compliant with zero external dependencies.
- **No implementation code modified**: Per Teamwork protocol constraints, Challenger 2 strictly adhered to the review-only role and only authored adversarial tests in `tests/modal_state_adversarial.test.js`.

---

## 4. Conclusion

**Verdict: REJECT**

Milestone M2 cannot be approved due to 3 reproducible defects in Vectors 1 and 3:
1. **Modal destruction race condition** (`KhktShowcaseModal.js`): `close()` timeout of 250ms is not tracked or cleared in `open()`.
2. **Double backdrop & keydown listener leak** (`app.js`): `handleOpenShowcase()` lacks an open check, creating stacked backdrops and leaking keyboard listeners.
3. **Cross-component language desynchronization** (`app.js` & `Header.js`): `app.handleLanguageChange()` does not synchronize `app.header`.

### Actionable Remediation Guide for Worker

1. **Fix `src/components/KhktShowcaseModal.js`**:
   Track and cancel the closing timeout:
   - In constructor: `this.closeTimeout = null;`
   - In `open()`:
     ```javascript
     if (this.closeTimeout) {
       clearTimeout(this.closeTimeout);
       this.closeTimeout = null;
     }
     ```
   - In `close()`:
     ```javascript
     if (this.closeTimeout) {
       clearTimeout(this.closeTimeout);
     }
     this.closeTimeout = setTimeout(() => {
       ...
       this.closeTimeout = null;
     }, 250);
     ```

2. **Fix `src/app.js`**:
   - In `handleOpenShowcase()`:
     Add a guard to prevent duplicate modal creation when already open:
     ```javascript
     if (this.state.isShowcaseModalOpen || (this.showcaseModal && this.showcaseModal.isOpen())) {
       return;
     }
     ```
   - In `handleLanguageChange(lang)`:
     Ensure the header component language is synchronized:
     ```javascript
     handleLanguageChange(lang) {
       this.state.language = lang;
       this.saveUserSettings();
       if (this.header && typeof this.header.setLanguage === 'function') {
         this.header.setLanguage(lang);
       }
       window.dispatchEvent(new CustomEvent('app:language-change', { detail: { lang } }));
       this.renderMainContent();
       this.renderFooter();
     }
     ```
   - Optionally in `Header.js`:
     Add an event listener in `attachEventListeners()`:
     ```javascript
     window.addEventListener('app:language-change', (e) => {
       if (e.detail?.lang && e.detail.lang !== this.language) {
         this.setLanguage(e.detail.lang);
       }
     });
     ```

---

## 5. Verification Method

To independently reproduce the adversarial findings:

1. **Run the Adversarial Test Suite**:
   ```bash
   node --test tests/modal_state_adversarial.test.js
   ```
   *Expected Result*: 22 tests pass, 3 tests fail with `ERR_ASSERTION` demonstrating the exact vulnerabilities described in Section 1.

2. **Run Full Project Test Suite**:
   ```bash
   npm test
   ```
   *Expected Result*: 143 tests pass, 3 tests fail (`tests 146, pass 143, fail 3`).

3. **Run E2E Test Runner**:
   ```bash
   node tests/e2e/runner.js
   ```
   *Expected Result*: All 175 tests pass (0.11s).

4. **Verify Remediation (Post-Worker Fix)**:
   Apply the three mitigations outlined in Section 4. Re-run `npm test`. All 146 tests across all 32 suites will pass with **0 failures**.
