# Root-Cause Analysis: Cross-Component Language State Synchronization

**Investigator**: Milestone M2 Iteration 2 Explorer 3 (Cross-Component State Synchronization)  
**Target Files**: `src/app.js` and `src/components/Header.js`  
**Adversarial Target**: `tests/modal_state_adversarial.test.js` (Vector 3: Language State Synchronization)  
**Timestamp**: 2026-11-07T08:47:00Z  

---

## 1. Executive Summary

In Milestone M2, when a language change is initiated programmatically via `app.handleLanguageChange(lang)` or broadcast from external UI components, the navigation header (`Header.js`) remains desynchronized in its initial `'dual'` mode. This results in stale navigation labels (e.g. "Khám phá / Explore" instead of "Explore Lessons"), mismatched active styling on language toggle buttons (`VI`, `EN`, `DUAL`), and test failure in `tests/modal_state_adversarial.test.js:876`.

This report provides the exact architectural root cause and drop-in patches for `src/app.js` and `src/components/Header.js` to establish deterministic, two-way language synchronization with zero listener leaks and zero re-entrancy recursion.

---

## 2. Root Cause Analysis

### 2.1 Deficiency in `src/app.js` (`handleLanguageChange`)
At line 155 of `src/app.js`:
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

**Flaws Identified**:
1. **Direct Component Desynchronization**: While `this.state.language` is updated, `this.saveUserSettings()` is called, and `renderMainContent()` and `renderFooter()` are executed, `this.header.setLanguage(lang)` is **never invoked**. Because `this.header` retains its internal `this.language = 'dual'`, the Header DOM remains in `'dual'` mode.
2. **Missing Input Validation**: If an invalid language code (e.g., `'fr'`, `null`, `'invalid'`) is passed, `this.state.language` would be corrupted instead of guarded against `['vi', 'en', 'dual']`.
3. **No Inbound Event Listener in App Controller**: If another component dispatches `app:language-change` on `window`, `App` does not listen to it, failing to update `this.state.language` or persist it to `user_settings`.

### 2.2 Deficiency in `src/components/Header.js`
In `src/components/Header.js`:
```javascript
  attachEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('click', this.handleOutsideClick);
  }
```

**Flaws Identified**:
1. **Missing Window Subscription**: `Header` only listens to `keydown` and `click`. It never registers a listener for `window.addEventListener('app:language-change', ...)`. Consequently, programmatic changes or broadcasts from outside the Header component never trigger `Header.setLanguage(lang)`.
2. **Missing Listener Idempotency & Cleanup**: If `mount()` were called multiple times, `attachEventListeners()` would register redundant listeners. Furthermore, `destroy()` does not unregister `app:language-change`.
3. **Redundant Re-render on Click**: In `bindDOMEvents()`, the click handler manually modifies `this.language = lang`, calls `this.onLanguageChange(lang)`, and then calls `this.render()`. By decoupling and consolidating state transition inside `setLanguage(lang)` with an idempotency guard (`if (this.language === lang && this.container?.innerHTML) return;`), we prevent double-renders and recursive event loops.

---

## 3. Two-Way State Synchronization Architecture

```
                    ┌─────────────────────────────────────────┐
                    │            User Interaction             │
                    └───────────┬─────────────────┬───────────┘
                                │                 │
               Clicks Header    │                 │ Calls app.handleLanguageChange(lang)
               Lang Button      │                 │ or external component dispatches
                                ▼                 ▼
                    ┌──────────────────┐    ┌──────────────────┐
                    │ Header Component │    │  App Controller  │
                    └────────┬─────────┘    └────────┬─────────┘
                             │                       │
      Calls onLanguageChange │                       │ Invokes this.header.setLanguage(lang)
                             ▼                       ▼
      ┌────────────────────────────────────────────────────────┐
      │             app.handleLanguageChange(lang)             │
      │  1. Guard: ['vi', 'en', 'dual'].includes(lang)         │
      │  2. this.state.language = lang                         │
      │  3. this.saveUserSettings()                            │
      │  4. this.header.setLanguage(lang)                      │
      │  5. window.dispatchEvent('app:language-change')        │
      │  6. this.renderMainContent() & this.renderFooter()     │
      └──────────────────────────┬─────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  window Event Broadcast │
                    │  ('app:language-change')│
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌───────────────────────────┐             ┌───────────────────────────┐
│ Header.handleAppLangChange│             │   App Global Inbound      │
│ - if lang !== this.lang:  │             │ - if lang !== this.state: │
│     this.setLanguage(lang)│             │     this.handleLang(lang) │
│ - else: NO-OP (idempotent)│             │ - else: NO-OP (no loop)   │
└───────────────────────────┘             └───────────────────────────┘
```

### Safety Invariants Guaranteed:
1. **Loop Prevention (Re-entrancy Guard)**:
   - When `app.handleLanguageChange('en')` dispatches `'app:language-change'`, `this.state.language` is already `'en'`. App's window listener compares `newLang !== this.state.language` which evaluates to `false`, halting propagation.
   - Header's `handleAppLanguageChange` checks `lang !== this.language`. Since `this.header.setLanguage('en')` was already invoked, `this.language` is already `'en'`, halting propagation.
2. **Direct Synchronous Consistency**:
   - Calling `app.handleLanguageChange('en')` immediately updates `app.header.language` synchronously before the method returns. The adversarial assertion `assert.equal(app.header.language, 'en')` is satisfied instantaneously.
3. **Environment Resilience**:
   - Guards against headless Node test runners where `window` or `document` may be absent or mocked: `typeof window !== 'undefined' && typeof window.addEventListener === 'function'`.

---

## 4. Proposed Drop-In Fix

### 4.1 Target File: `src/app.js`

#### Location 1: Lines 110–125 (Inside `init()` method)
```javascript
<<<< CURRENT CODE (lines 110-125):
    // 4. Listen to global window events for cross-component coordination
    const handleLessonSelectEvent = (e) => {
      const lessonId = e.detail?.lessonId || (typeof e.detail === 'string' ? e.detail : null);
      if (lessonId) {
        this.handleSelectLesson(lessonId);
      }
    };
    window.addEventListener('lesson:select', handleLessonSelectEvent);
    window.addEventListener('lesson-select', handleLessonSelectEvent);

    window.addEventListener('modal:open-showcase', () => {
      this.handleOpenShowcase();
    });

    // 5. Render Active View in #main-content
==== REPLACEMENT CODE:
    // 4. Listen to global window events for cross-component coordination
    const handleLessonSelectEvent = (e) => {
      const lessonId = e.detail?.lessonId || (typeof e.detail === 'string' ? e.detail : null);
      if (lessonId) {
        this.handleSelectLesson(lessonId);
      }
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('lesson:select', handleLessonSelectEvent);
      window.addEventListener('lesson-select', handleLessonSelectEvent);

      window.addEventListener('modal:open-showcase', () => {
        this.handleOpenShowcase();
      });

      window.addEventListener('app:language-change', (e) => {
        const newLang = e.detail?.lang;
        if (newLang && ['vi', 'en', 'dual'].includes(newLang) && newLang !== this.state.language) {
          this.handleLanguageChange(newLang);
        }
      });
    }

    // 5. Render Active View in #main-content
>>>>
```

#### Location 2: Lines 151–167 (`handleLanguageChange`)
```javascript
<<<< CURRENT CODE (lines 151-167):
  /**
   * Handles language toggle (VI / EN / DUAL)
   * @param {'vi'|'en'|'dual'} lang
   */
  handleLanguageChange(lang) {
    this.state.language = lang;
    this.saveUserSettings();
    
    // Broadcast event for all active and nested components
    window.dispatchEvent(new CustomEvent('app:language-change', { detail: { lang } }));
    
    // Re-render views with new language
    this.renderMainContent();
    this.renderFooter();
  }
==== REPLACEMENT CODE:
  /**
   * Handles language toggle (VI / EN / DUAL)
   * @param {'vi'|'en'|'dual'} lang
   */
  handleLanguageChange(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) {
      return;
    }

    this.state.language = lang;
    this.saveUserSettings();

    // Synchronize Header component state
    if (this.header && typeof this.header.setLanguage === 'function') {
      this.header.setLanguage(lang);
    }
    
    // Broadcast event for all active and nested components
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('app:language-change', { detail: { lang } }));
    }
    
    // Re-render views with new language
    this.renderMainContent();
    this.renderFooter();
  }
>>>>
```

---

### 4.2 Target File: `src/components/Header.js`

#### Location 1: Lines 23–36 (Constructor)
```javascript
<<<< CURRENT CODE (lines 23-36):
  constructor(options = {}) {
    this.activeTab = options.activeTab || 'explore';
    this.language = options.language || 'dual';
    this.onNavigate = options.onNavigate || (() => {});
    this.onLanguageChange = options.onLanguageChange || (() => {});
    this.onOpenShowcase = options.onOpenShowcase || (() => {});
    
    this.isMobileMenuOpen = false;
    this.container = null;
    
    // Binding methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }
==== REPLACEMENT CODE:
  constructor(options = {}) {
    this.activeTab = options.activeTab || 'explore';
    this.language = options.language || 'dual';
    this.onNavigate = options.onNavigate || (() => {});
    this.onLanguageChange = options.onLanguageChange || (() => {});
    this.onOpenShowcase = options.onOpenShowcase || (() => {});
    
    this.isMobileMenuOpen = false;
    this.container = null;
    this._listenersAttached = false;
    
    // Binding methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleAppLanguageChange = this.handleAppLanguageChange.bind(this);
  }
>>>>
```

#### Location 2: Lines 99–108 (`setLanguage`)
```javascript
<<<< CURRENT CODE (lines 99-108):
  /**
   * Sets language mode and updates UI
   * @param {'vi'|'en'|'dual'} lang
   */
  setLanguage(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    this.language = lang;
    this.render();
  }
==== REPLACEMENT CODE:
  /**
   * Sets language mode and updates UI
   * @param {'vi'|'en'|'dual'} lang
   */
  setLanguage(lang) {
    if (!['vi', 'en', 'dual'].includes(lang)) return;
    if (this.language === lang && this.container && this.container.innerHTML) return;
    this.language = lang;
    this.render();
  }
>>>>
```

#### Location 3: Lines 282–289 (`attachEventListeners`)
```javascript
<<<< CURRENT CODE (lines 282-289):
  /**
   * Attaches one-time global listeners
   */
  attachEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('click', this.handleOutsideClick);
  }
==== REPLACEMENT CODE:
  /**
   * Attaches one-time global listeners
   */
  attachEventListeners() {
    if (this._listenersAttached) return;
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('click', this.handleOutsideClick);
    }
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('app:language-change', this.handleAppLanguageChange);
    }
    this._listenersAttached = true;
  }
>>>>
```

#### Location 4: Lines 323–336 (Inside `bindDOMEvents`)
```javascript
<<<< CURRENT CODE (lines 323-336):
    // Language buttons
    const langButtons = this.container.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== this.language) {
          this.language = lang;
          this.onLanguageChange(lang);
          this.render();
        }
      });
    });
==== REPLACEMENT CODE:
    // Language buttons
    const langButtons = this.container.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== this.language) {
          this.setLanguage(lang);
          this.onLanguageChange(lang);
        }
      });
    });
>>>>
```

#### Location 5: Lines 346–366 (`handleAppLanguageChange` and `destroy`)
```javascript
<<<< CURRENT CODE (lines 346-366):
  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isMobileMenuOpen) {
      this.toggleMobileMenu(false);
    }
  }

  handleOutsideClick(e) {
    if (this.isMobileMenuOpen && this.container && !this.container.contains(e.target)) {
      this.toggleMobileMenu(false);
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleOutsideClick);
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
==== REPLACEMENT CODE:
  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isMobileMenuOpen) {
      this.toggleMobileMenu(false);
    }
  }

  handleOutsideClick(e) {
    if (this.isMobileMenuOpen && this.container && !this.container.contains(e.target)) {
      this.toggleMobileMenu(false);
    }
  }

  /**
   * Handles external window language change broadcast
   * @param {CustomEvent} e
   */
  handleAppLanguageChange(e) {
    const lang = e?.detail?.lang;
    if (lang && ['vi', 'en', 'dual'].includes(lang) && lang !== this.language) {
      this.setLanguage(lang);
    }
  }

  destroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('click', this.handleOutsideClick);
    }
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('app:language-change', this.handleAppLanguageChange);
    }
    this._listenersAttached = false;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
>>>>
```

---

## 5. Empirical Verification Proof

A verification script was executed in Node.js importing the exact classes and validating all 4 transition vectors:
1. **Programmatic change**: `app.handleLanguageChange('en')` immediately synchronizes `app.header.language` to `'en'`.
2. **Window event broadcast**: `window.dispatchEvent('app:language-change', { detail: { lang: 'vi' } })` synchronizes both `app.state.language` and `app.header.language` to `'vi'`.
3. **UI click**: `app.header.onLanguageChange('dual')` synchronizes `app.state.language` and `app.header.language` to `'dual'`.
4. **Invalid inputs**: `app.handleLanguageChange('invalid_xyz')` safely preserves `'dual'` without crashing.
5. **Memory leak protection**: `header.destroy()` cleanly removes the window event listener.

All 5 scenarios passed with 0 errors.
