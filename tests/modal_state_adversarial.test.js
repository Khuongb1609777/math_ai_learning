/**
 * tests/modal_state_adversarial.test.js
 * Empirical Adversarial Test Suite for Milestone M2
 * Focus: Modal Lifecycle, Keyboard Accessibility, Language State Synchronization,
 *        LocalStorage Corruption Resilience, and Offline Resilience.
 * 
 * Authored by: Milestone M2 Challenger 2 (Modal & State Adversarial Verification)
 * 
 * Attack Vectors:
 * 1. Modal Lifecycle, Double Backdrop & Rapid Toggle Stress
 * 2. Keyboard Accessibility (Escape Dismiss & Focus Trapping)
 * 3. Language State Synchronization Across Components
 * 4. LocalStorage Corruption Resilience in `user_settings`
 * 5. Offline Resilience Test (Zero Network Calls Attempted)
 */

import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { KhktShowcaseModal } from '../src/components/KhktShowcaseModal.js';
import { Header } from '../src/components/Header.js';
import { App } from '../src/app.js';
import {
  initStorage,
  getLessons,
  getQuizResult,
  getSurveyResult,
  STORAGE_KEYS
} from '../src/services/storage.js';

// ============================================================================
// Lightweight In-Memory DOM Mock Harness
// ============================================================================

class MockClassList {
  constructor(element) {
    this.element = element;
    this.classes = new Set();
  }
  add(...names) {
    for (const n of names) {
      if (n) this.classes.add(n);
    }
  }
  remove(...names) {
    for (const n of names) {
      this.classes.delete(n);
    }
  }
  contains(name) {
    return this.classes.has(name);
  }
  toggle(name, force) {
    const has = this.classes.has(name);
    const should = typeof force === 'boolean' ? force : !has;
    if (should) this.classes.add(name);
    else this.classes.delete(name);
    return should;
  }
}

class MockElement {
  constructor(tagName = 'DIV') {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.classList = new MockClassList(this);
    this.style = {};
    this.listeners = new Map();
    this.tabIndex = 0;
    this._value = '';
    this._innerHTML = '';
  }

  get id() {
    return this.getAttribute('id') || '';
  }
  set id(val) {
    this.setAttribute('id', val);
  }

  get className() {
    return Array.from(this.classList.classes).join(' ');
  }
  set className(val) {
    this.classList.classes.clear();
    if (typeof val === 'string') {
      val.trim().split(/\s+/).forEach(c => { if (c) this.classList.classes.add(c); });
    }
  }

  get value() {
    return this._value;
  }
  set value(v) {
    this._value = String(v);
  }

  setAttribute(k, v) {
    this.attributes.set(k, String(v));
    if (k === 'class') {
      this.className = String(v);
    }
  }

  getAttribute(k) {
    if (k === 'class') return this.className;
    return this.attributes.has(k) ? this.attributes.get(k) : null;
  }

  hasAttribute(k) {
    if (k === 'class') return this.classList.classes.size > 0;
    return this.attributes.has(k);
  }

  removeAttribute(k) {
    this.attributes.delete(k);
    if (k === 'class') this.classList.classes.clear();
  }

  appendChild(child) {
    if (!child) return child;
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      child.parentNode = null;
      this.children.splice(idx, 1);
    }
    return child;
  }

  addEventListener(type, fn) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners.has(type)) return;
    const list = this.listeners.get(type);
    const idx = list.indexOf(fn);
    if (idx >= 0) list.splice(idx, 1);
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    event.target = this;
    event.currentTarget = this;
    for (const fn of list) {
      fn.call(this, event);
    }
    return !event.defaultPrevented;
  }

  focus() {
    if (globalThis.document) {
      globalThis.document.activeElement = this;
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    const parsed = parseHtmlTokens(html);
    for (const child of Array.from(parsed)) {
      this.appendChild(child);
    }
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    traverseAndMatch(this, selector, results);
    return results;
  }
}

function parseHtmlTokens(html) {
  const root = new MockElement('ROOT');
  const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/g;
  let match;
  const stack = [root];
  let currentParent = root;

  const voidTags = new Set([
    'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT',
    'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'
  ]);

  while ((match = tagRegex.exec(html)) !== null) {
    const [full, isClosing, tagName, attrStr, text] = match;
    if (full.startsWith('<!--')) continue;

    if (text) {
      if (text.trim()) {
        const textNode = new MockElement('#TEXT');
        textNode.textContent = text;
        currentParent.appendChild(textNode);
      }
      continue;
    }

    if (isClosing) {
      const tagUpper = tagName.toUpperCase();
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tagName === tagUpper) {
          stack.length = i;
          currentParent = stack[stack.length - 1];
          break;
        }
      }
      continue;
    }

    // Opening tag
    const tagUpper = tagName.toUpperCase();
    const el = new MockElement(tagUpper);

    if (attrStr) {
      const attrRegex = /([a-zA-Z0-9\-:_]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
        const attrName = attrMatch[1];
        const attrVal = attrMatch[2] !== undefined ? attrMatch[2]
          : attrMatch[3] !== undefined ? attrMatch[3]
          : attrMatch[4] !== undefined ? attrMatch[4] : '';
        el.setAttribute(attrName, attrVal);
      }
    }

    currentParent.appendChild(el);

    const isSelfClosing = full.endsWith('/>') || voidTags.has(tagUpper);
    if (!isSelfClosing) {
      stack.push(el);
      currentParent = el;
    }
  }

  return Array.from(root.children);
}

function matchesSelectorPart(el, sel) {
  sel = sel.trim();
  if (!sel || el.tagName === '#TEXT') return false;

  // Handle :not(...)
  let notPart = null;
  const notIdx = sel.indexOf(':not(');
  if (notIdx >= 0 && sel.endsWith(')')) {
    notPart = sel.slice(notIdx + 5, -1);
    sel = sel.slice(0, notIdx);
  }
  if (notPart && matchesSelectorPart(el, notPart)) {
    return false;
  }
  if (!sel) return true;

  let remaining = sel;

  // 1. Attributes first (prevents dots in attribute values like .png from being treated as classes)
  const attrRegex = /\[([a-zA-Z0-9\-_]+)(?:=("[^"]*"|'[^']*'|[^\]]*))?\]/g;
  let am;
  while ((am = attrRegex.exec(remaining)) !== null) {
    const attrName = am[1];
    let attrVal = am[2];
    if (attrVal !== undefined) {
      if ((attrVal.startsWith('"') && attrVal.endsWith('"')) || (attrVal.startsWith("'") && attrVal.endsWith("'"))) {
        attrVal = attrVal.slice(1, -1);
      }
      if (el.getAttribute(attrName) !== attrVal) return false;
    } else {
      if (!el.hasAttribute(attrName)) return false;
    }
  }
  remaining = remaining.replace(/\[([a-zA-Z0-9\-_]+)(?:=("[^"]*"|'[^']*'|[^\]]*))?\]/g, '');

  // 2. ID
  const idMatch = remaining.match(/#([a-zA-Z0-9\-_]+)/);
  if (idMatch) {
    if (el.id !== idMatch[1]) return false;
    remaining = remaining.replace(/#([a-zA-Z0-9\-_]+)/, '');
  }

  // 3. Classes
  const classMatches = remaining.matchAll(/\.([a-zA-Z0-9\-_]+)/g);
  for (const cm of classMatches) {
    if (!el.classList.contains(cm[1])) return false;
  }
  remaining = remaining.replace(/\.[a-zA-Z0-9\-_]+/g, '');

  // 4. Tag
  const tagMatch = remaining.match(/^([a-zA-Z0-9\-]+)/);
  if (tagMatch) {
    if (el.tagName !== tagMatch[1].toUpperCase()) return false;
  }

  return true;
}

function matchesSelectorGroup(el, selectorGroup) {
  const parts = selectorGroup.split(',').map(s => s.trim()).filter(Boolean);
  return parts.some(part => {
    // Check descendant selector "A B"
    const subParts = part.split(/\s+/).filter(Boolean);
    if (subParts.length === 1) {
      return matchesSelectorPart(el, subParts[0]);
    }
    // Descendant match: el must match last subPart, and ancestors must match preceding subParts
    if (!matchesSelectorPart(el, subParts[subParts.length - 1])) {
      return false;
    }
    let curAncestor = el.parentNode;
    let targetIdx = subParts.length - 2;
    while (curAncestor && targetIdx >= 0) {
      if (matchesSelectorPart(curAncestor, subParts[targetIdx])) {
        targetIdx--;
      }
      curAncestor = curAncestor.parentNode;
    }
    return targetIdx < 0;
  });
}

function traverseAndMatch(node, selector, results) {
  for (const child of node.children) {
    if (matchesSelectorGroup(child, selector)) {
      results.push(child);
    }
    traverseAndMatch(child, selector, results);
  }
}

class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) {
    return this.store.has(String(k)) ? this.store.get(String(k)) : null;
  }
  setItem(k, v) {
    this.store.set(String(k), String(v));
  }
  removeItem(k) {
    this.store.delete(String(k));
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
}

class MockCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || null;
    this.bubbles = Boolean(init.bubbles);
    this.cancelable = Boolean(init.cancelable);
    this.defaultPrevented = false;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
}

class MockKeyboardEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.key = init.key || '';
    this.shiftKey = Boolean(init.shiftKey);
    this.ctrlKey = Boolean(init.ctrlKey);
    this.altKey = Boolean(init.altKey);
    this.defaultPrevented = false;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
}

// Global Environment Setup Helper
function setupGlobalDom() {
  const head = new MockElement('HEAD');
  const body = new MockElement('BODY');
  const modalRoot = new MockElement('DIV');
  modalRoot.id = 'modal-root';
  body.appendChild(modalRoot);

  const headerEl = new MockElement('HEADER');
  headerEl.id = 'app-header';
  headerEl.className = 'app-header';
  body.appendChild(headerEl);

  const mainEl = new MockElement('MAIN');
  mainEl.id = 'main-content';
  body.appendChild(mainEl);

  const footerEl = new MockElement('FOOTER');
  footerEl.id = 'app-footer';
  body.appendChild(footerEl);

  const docListeners = new Map();

  const mockDocument = {
    head,
    body,
    activeElement: null,
    getElementById(id) {
      if (id === 'modal-root') return modalRoot;
      if (id === 'app-header') return headerEl;
      if (id === 'main-content') return mainEl;
      if (id === 'app-footer') return footerEl;
      return body.querySelector(`#${id}`);
    },
    querySelector(sel) {
      if (sel === 'body') return body;
      if (sel === 'head') return head;
      if (sel === '.app-header' || sel === '#app-header') return headerEl;
      if (sel === '#main-content') return mainEl;
      if (sel === 'footer' || sel === '#app-footer') return footerEl;
      if (sel === '#modal-root') return modalRoot;
      return body.querySelector(sel);
    },
    querySelectorAll(sel) {
      return body.querySelectorAll(sel);
    },
    createElement(tag) {
      return new MockElement(tag);
    },
    addEventListener(type, fn) {
      if (!docListeners.has(type)) docListeners.set(type, []);
      docListeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      if (!docListeners.has(type)) return;
      const list = docListeners.get(type);
      const idx = list.indexOf(fn);
      if (idx >= 0) list.splice(idx, 1);
    },
    dispatchEvent(event) {
      const list = docListeners.get(event.type) || [];
      event.target = mockDocument;
      event.currentTarget = mockDocument;
      for (const fn of list) {
        fn.call(mockDocument, event);
      }
      return !event.defaultPrevented;
    },
    _docListeners: docListeners
  };

  const windowListeners = new Map();
  const mockStorage = new MockStorage();

  const mockWindow = {
    document: mockDocument,
    localStorage: mockStorage,
    location: { href: 'http://localhost:3000/' },
    navigator: { onLine: true, userAgent: 'AdversarialRunner' },
    addEventListener(type, fn) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      if (!windowListeners.has(type)) return;
      const list = windowListeners.get(type);
      const idx = list.indexOf(fn);
      if (idx >= 0) list.splice(idx, 1);
    },
    dispatchEvent(event) {
      const list = windowListeners.get(event.type) || [];
      for (const fn of list) {
        fn.call(mockWindow, event);
      }
      return !event.defaultPrevented;
    },
    requestAnimationFrame(cb) {
      return setTimeout(cb, 0);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    },
    scrollTo() {},
    CustomEvent: MockCustomEvent,
    KeyboardEvent: MockKeyboardEvent,
    _windowListeners: windowListeners
  };

  globalThis.document = mockDocument;
  globalThis.window = mockWindow;
  globalThis.requestAnimationFrame = mockWindow.requestAnimationFrame;
  globalThis.cancelAnimationFrame = mockWindow.cancelAnimationFrame;
  globalThis.CustomEvent = MockCustomEvent;
  globalThis.KeyboardEvent = MockKeyboardEvent;

  return { mockDocument, mockWindow, mockStorage, modalRoot, headerEl, mainEl, footerEl };
}

// ============================================================================
// ATTACK VECTOR 1: MODAL LIFECYCLE, DOUBLE BACKDROP & RAPID TOGGLE STRESS
// ============================================================================

describe('Vector 1: Modal Lifecycle, Double Backdrop & Rapid Toggle Stress', () => {
  beforeEach(() => {
    KhktShowcaseModal.instance = null;
    setupGlobalDom();
  });

  it('verifies standard open and close lifecycle: backdrop attributes, scroll lock, and cleanup', async () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    assert.ok(modal.modalEl, 'Modal element must be created');
    assert.equal(modal.modalEl.getAttribute('role'), 'dialog');
    assert.equal(modal.modalEl.getAttribute('aria-modal'), 'true');
    assert.equal(document.body.style.overflow, 'hidden', 'Body scroll must be locked when modal opens');

    // Wait for rAF to apply is-open
    await new Promise(r => setTimeout(r, 10));
    assert.equal(modal.isOpen(), true, 'modal.isOpen() must be true after rAF');

    modal.close();
    assert.equal(modal.isOpen(), false, 'modal.isOpen() must flip to false on close');
    assert.equal(document.body.style.overflow, '', 'Body scroll lock must be released immediately');

    // Wait for 250ms closing animation cleanup
    await new Promise(r => setTimeout(r, 300));
    assert.equal(modal.modalEl, null, 'modalEl must be nullified after closing animation finishes');
    assert.equal(document.body.children.filter(c => c.classList.contains('khkt-modal-backdrop')).length, 0);
  });

  it('stress-tests rapid open-close-open cycle (<250ms): exposes stale cleanup timer destroying reopened modal', async () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    
    // Step 1: Open modal
    modal.open('pedagogy');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(modal.isOpen(), true);

    // Step 2: Trigger close (schedules 250ms timeout)
    modal.close();

    // Step 3: Reopen immediately at t=20ms (< 250ms)
    modal.open('pedagogy');
    await new Promise(r => setTimeout(r, 10));

    // At t=300ms, the stale 250ms timeout from Step 2 executes if not cancelled!
    await new Promise(r => setTimeout(r, 300));

    // Adversarial invariant: A reopened modal MUST remain open and attached to DOM.
    // If the stale 250ms cleanup timer was not cancelled with clearTimeout, modalEl is destroyed!
    const modalStillInDom = Boolean(modal.modalEl && modal.modalEl.parentNode);
    assert.equal(
      modalStillInDom,
      true,
      'LIFECYCLE VULNERABILITY DETECTED: KhktShowcaseModal.close() schedules a 250ms timeout that is NOT cancelled by open(). The reopened modal was destroyed by the stale closing timer!'
    );
    assert.equal(
      modal.isOpen(),
      true,
      'modal.isOpen() must remain true for reopened modal'
    );
  });

  it('stress-tests rapid singleton multi-open calls (KhktShowcaseModal.open() 20x rapidly)', () => {
    for (let i = 0; i < 20; i++) {
      KhktShowcaseModal.open('pedagogy');
    }

    const backdrops = document.body.children.filter(c => c.classList.contains('khkt-modal-backdrop'));
    assert.equal(
      backdrops.length,
      1,
      'KhktShowcaseModal.open() singleton must never create multiple backdrop elements'
    );
  });

  it('stress-tests rapid app.handleOpenShowcase() invocations: exposes double backdrop & keydown listener leak', async () => {
    const app = new App();
    const modalRoot = document.getElementById('modal-root');

    // Call handleOpenShowcase twice rapidly
    await app.handleOpenShowcase();
    await app.handleOpenShowcase();

    const backdrops = modalRoot.querySelectorAll('.khkt-modal-backdrop');
    const docKeydownListeners = (document._docListeners.get('keydown') || []);

    // Adversarial Check 1: Double Backdrop
    assert.equal(
      backdrops.length,
      1,
      'DOUBLE BACKDROP VULNERABILITY DETECTED: app.handleOpenShowcase() instantiated multiple KhktShowcaseModal backdrops without checking isShowcaseModalOpen or closing previous instance!'
    );

    // Adversarial Check 2: Listener Leak
    // Close the modal
    app.handleCloseShowcase();
    await new Promise(r => setTimeout(r, 300));

    const leakedKeydownListeners = (document._docListeners.get('keydown') || []).length;
    assert.equal(
      leakedKeydownListeners,
      0,
      'MEMORY LEAK VULNERABILITY DETECTED: app.handleOpenShowcase() leaked a keydown event listener on document because the first instance was orphaned without calling close()!'
    );
  });

  it('rapidly switches between all 5 showcase tabs (pedagogy, empirical, survey, theory, circular84) 25 times', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    const tabs = ['pedagogy', 'empirical', 'survey', 'theory', 'circular84'];
    for (let i = 0; i < 25; i++) {
      const targetTab = tabs[i % tabs.length];
      modal.setActiveTab(targetTab);
      assert.equal(modal.activeTab, targetTab);
      const activeBtn = modal.modalEl.querySelector(`.khkt-modal-tab-btn[data-tab="${targetTab}"]`);
      assert.ok(activeBtn, `Active tab button for ${targetTab} must be present in DOM`);
      assert.ok(activeBtn.classList.contains('is-active'), `Tab button ${targetTab} must have is-active class`);
    }
    modal.close();
  });

  it('navigates the 7-step pedagogical cycle and validates Step 5 Gatekeeper badge', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    for (let step = 1; step <= 7; step++) {
      modal.selectPedagogyStep(step);
      assert.equal(modal.selectedStep, step);
      const stepNode = modal.modalEl.querySelector(`.khkt-step-node[data-step="${step}"]`);
      assert.ok(stepNode, `Step node for B${step} must exist`);
      assert.ok(stepNode.classList.contains('is-active'), `Step node B${step} must be active`);

      if (step === 5) {
        assert.ok(stepNode.classList.contains('is-gatekeeper'), 'Step 5 must have is-gatekeeper class');
        const dialog = modal.modalEl.querySelector('.khkt-modal-dialog');
        assert.ok(dialog.innerHTML.includes('CHỐT CHẶN CHẤT LƯỢNG'), 'Step 5 detail card must display GATEKEEPER label');
      }
    }
    modal.close();
  });

  it('toggles authentic DOCX research figure previews (Hình 1, Hình 3, Hình 4)', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    // Toggle Fig 1 on
    modal.toggleOriginalImage('fig1');
    assert.equal(modal.showingFigureId, 'fig1');
    assert.ok(modal.modalEl.querySelector('img[src="/assets/khkt/image2.png"]'), 'Figure 1 image must render');

    // Toggle Fig 1 off
    modal.toggleOriginalImage('fig1');
    assert.equal(modal.showingFigureId, null);
    assert.equal(modal.modalEl.querySelector('img[src="/assets/khkt/image2.png"]'), null);

    // Switch to Empirical tab and toggle Fig 3
    modal.setActiveTab('empirical');
    modal.toggleOriginalImage('fig3');
    assert.equal(modal.showingFigureId, 'fig3');
    assert.ok(modal.modalEl.querySelector('img[src="/assets/khkt/image4.png"]'), 'Figure 3 image must render');

    modal.close();
  });
});

// ============================================================================
// ATTACK VECTOR 2: KEYBOARD ACCESSIBILITY (ESCAPE DISMISS & FOCUS TRAPPING)
// ============================================================================

describe('Vector 2: Keyboard Accessibility (Escape Dismiss & Focus Trapping)', () => {
  beforeEach(() => {
    KhktShowcaseModal.instance = null;
    setupGlobalDom();
  });

  it('ESC key dismisses modal, cancels event, and dispatches khkt:modal-closed', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    let closedEventFired = false;
    window.addEventListener('khkt:modal-closed', () => {
      closedEventFired = true;
    });

    const escEvent = new MockKeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escEvent);

    assert.equal(escEvent.defaultPrevented, true, 'ESC event must call preventDefault()');
    assert.equal(modal.isOpen(), false, 'Modal must start closing immediately upon ESC');
    assert.equal(document.body.style.overflow, '', 'Body overflow lock must be released on ESC');
    assert.equal(closedEventFired, true, 'khkt:modal-closed custom event must be dispatched');
  });

  it('ESC key is a safe no-op when modal is already closed', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    assert.equal(modal.isOpen(), false);

    // Dispatching ESC should not throw or cause errors
    assert.doesNotThrow(() => {
      const escEvent = new MockKeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
    });
  });

  it('rapid burst of ESC key presses (10x) handled idempotently without crash', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    assert.doesNotThrow(() => {
      for (let i = 0; i < 10; i++) {
        const escEvent = new MockKeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escEvent);
      }
    });

    assert.equal(modal.isOpen(), false);
  });

  it('Tab key forward focus trapping wraps from last focusable element to first', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    const focusables = modal.modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    assert.ok(focusables.length >= 2, 'Modal must contain multiple focusable elements');

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Set focus to the last focusable element
    document.activeElement = last;

    const tabEvent = new MockKeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
    modal.handleKeyDown(tabEvent);

    assert.equal(tabEvent.defaultPrevented, true, 'Forward Tab from last focusable must prevent default');
    assert.equal(
      document.activeElement,
      first,
      'Forward Tab from last focusable element MUST wrap focus to the first focusable element'
    );

    modal.close();
  });

  it('Shift+Tab key backward focus trapping wraps from first focusable element to last', () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    const focusables = modal.modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    assert.ok(focusables.length >= 2, 'Modal must contain multiple focusable elements');

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Set focus to the first focusable element
    document.activeElement = first;

    const shiftTabEvent = new MockKeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    modal.handleKeyDown(shiftTabEvent);

    assert.equal(shiftTabEvent.defaultPrevented, true, 'Backward Shift+Tab from first focusable must prevent default');
    assert.equal(
      document.activeElement,
      last,
      'Backward Shift+Tab from first focusable element MUST wrap focus to the last focusable element'
    );

    modal.close();
  });

  it('restores focus to previous active element after modal closes', async () => {
    const launcherBtn = new MockElement('BUTTON');
    document.body.appendChild(launcherBtn);
    launcherBtn.focus();
    assert.equal(document.activeElement, launcherBtn);

    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');

    // Simulate focus moving into modal close button
    const closeBtn = modal.modalEl.querySelector('.khkt-modal-close-btn');
    if (closeBtn) closeBtn.focus();
    assert.equal(document.activeElement, closeBtn);

    // Close modal and wait for 250ms animation
    modal.close();
    await new Promise(r => setTimeout(r, 300));

    assert.equal(
      document.activeElement,
      launcherBtn,
      'Focus must be restored to previousActiveElement upon modal close'
    );
  });
});

// ============================================================================
// ATTACK VECTOR 3: LANGUAGE STATE SYNCHRONIZATION ACROSS COMPONENTS
// ============================================================================

describe('Vector 3: Language State Synchronization Across Components', () => {
  beforeEach(() => {
    setupGlobalDom();
  });

  it('persists language setting to user_settings across vi, en, and dual transitions', async () => {
    const app = new App();
    await app.init();

    const modes = ['vi', 'en', 'dual', 'vi'];
    for (const m of modes) {
      app.handleLanguageChange(m);
      assert.equal(app.state.language, m);
      const raw = window.localStorage.getItem('user_settings');
      assert.ok(raw, 'user_settings must exist in localStorage');
      const parsed = JSON.parse(raw);
      assert.equal(parsed.lang, m, `user_settings.lang must be '${m}'`);
    }
  });

  it('broadcasts app:language-change custom event on window upon language change', async () => {
    const app = new App();
    await app.init();

    let receivedLang = null;
    window.addEventListener('app:language-change', (e) => {
      receivedLang = e.detail?.lang;
    });

    app.handleLanguageChange('en');
    assert.equal(receivedLang, 'en', 'window must receive app:language-change event with lang=en');

    app.handleLanguageChange('vi');
    assert.equal(receivedLang, 'vi', 'window must receive app:language-change event with lang=vi');
  });

  it('Header component renders correct localized labels across vi, en, and dual', () => {
    const container = document.getElementById('app-header');
    const header = new Header({ activeTab: 'explore', language: 'vi' });
    header.mount(container);

    assert.ok(container.innerHTML.includes('Bài học'), 'VI mode must show Bài học');

    header.setLanguage('en');
    assert.ok(container.innerHTML.includes('Lessons'), 'EN mode must show Lessons');

    header.setLanguage('dual');
    assert.ok(container.innerHTML.includes('Bài học'), 'DUAL mode must show Bài học');
  });

  it('cross-component language sync test: exposes Header remaining desynchronized on App language change', async () => {
    const app = new App();
    await app.init();

    assert.ok(app.header, 'app.header must be mounted');
    assert.equal(app.state.language, 'dual');
    assert.equal(app.header.language, 'dual');

    // Programmatically trigger language change on App controller
    app.handleLanguageChange('en');

    // Invariant: Header component MUST synchronize with App controller state
    assert.equal(
      app.header.language,
      'en',
      'STATE SYNCHRONIZATION VULNERABILITY DETECTED: app.handleLanguageChange("en") updated app.state.language to "en", but app.header.language remains desynchronized at "dual"! App.handleLanguageChange must call this.header.setLanguage(lang).'
    );
  });

  it('bilingual dual mode integrity: verifies both Vietnamese and English strings in dual view', async () => {
    const app = new App();
    await app.init();
    app.handleLanguageChange('dual');

    const headerContainer = document.getElementById('app-header');
    assert.ok(headerContainer.innerHTML.includes('Bài học'), 'Header must contain explore label');
    assert.ok(headerContainer.innerHTML.includes('Thực hành'), 'Header must contain practice label');
    assert.ok(headerContainer.innerHTML.includes('Bài tập'), 'Header must contain quiz label');
    assert.ok(headerContainer.innerHTML.includes('Giới thiệu đề án'), 'Header must contain showcase label');
  });
});

// ============================================================================
// ATTACK VECTOR 4: LOCALSTORAGE CORRUPTION RESILIENCE IN USER_SETTINGS
// ============================================================================

describe('Vector 4: LocalStorage Corruption Resilience in `user_settings`', () => {
  beforeEach(() => {
    setupGlobalDom();
  });

  it('handles corrupted non-JSON strings in user_settings with safe fallback to dual', () => {
    const corruptedPayloads = [
      '{ invalid json [',
      '<html><body>Crash</body></html>',
      'undefined',
      '{"theme": "light", "lang": ',
      'NaN',
      '""'
    ];

    for (const payload of corruptedPayloads) {
      window.localStorage.setItem('user_settings', payload);
      const app = new App();
      const loaded = app.loadSavedLanguage();
      assert.equal(loaded, 'dual', `Payload '${payload}' must safely fall back to 'dual'`);
    }
  });

  it('handles invalid JSON scalar types (numbers, booleans, null, arrays) with safe fallback to dual', () => {
    const invalidTypes = [
      '12345',
      '-99.9',
      'true',
      'false',
      'null',
      '[]',
      '["vi", "en"]'
    ];

    for (const payload of invalidTypes) {
      window.localStorage.setItem('user_settings', payload);
      const app = new App();
      let loaded;
      assert.doesNotThrow(() => {
        loaded = app.loadSavedLanguage();
      }, `Payload '${payload}' must not throw exception`);
      assert.equal(loaded, 'dual', `Payload '${payload}' must safely fall back to 'dual'`);
    }
  });

  it('handles missing lang property or unsupported languages with safe fallback to dual', () => {
    const missingOrUnsupported = [
      '{}',
      '{"theme": "dark"}',
      '{"lang": null}',
      '{"lang": 123}',
      '{"lang": "fr"}',
      '{"lang": "chinese"}',
      '{"lang": ""}'
    ];

    for (const payload of missingOrUnsupported) {
      window.localStorage.setItem('user_settings', payload);
      const app = new App();
      const loaded = app.loadSavedLanguage();
      assert.equal(loaded, 'dual', `Payload '${payload}' must safely fall back to 'dual'`);
    }
  });

  it('handles QuotaExceededError or private-mode SecurityError on saveUserSettings without crash', () => {
    window.localStorage.setItem = () => {
      const err = new Error('QuotaExceededError: DOM Exception 22');
      err.name = 'QuotaExceededError';
      throw err;
    };

    const app = new App();
    assert.doesNotThrow(() => {
      app.saveUserSettings();
    }, 'saveUserSettings must catch QuotaExceededError gracefully without bubbling');
  });

  it('recovers from corrupted storage service payloads across lessons, quizzes, and surveys', () => {
    // Corrupt lessons key
    window.localStorage.setItem(STORAGE_KEYS.LESSONS, '{ corrupted lessons payload');
    const lessons = getLessons(null, window.localStorage);
    assert.ok(Array.isArray(lessons), 'getLessons must auto-reinitialize on corrupted storage');
    assert.equal(lessons.length, 3, 'Must restore 3 default KHKT lessons');

    // Corrupt quiz results key
    window.localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, '{ corrupted quiz');
    const quiz = getQuizResult('lesson-lighthouse', window.localStorage);
    assert.equal(quiz, null, 'getQuizResult must return null on corrupted storage');

    // Corrupt survey results key
    window.localStorage.setItem(STORAGE_KEYS.SURVEY_RESULTS, '{ corrupted survey');
    const survey = getSurveyResult('lesson-lighthouse', window.localStorage);
    assert.equal(survey, null, 'getSurveyResult must return null on corrupted storage');
  });
});

// ============================================================================
// ATTACK VECTOR 5: OFFLINE RESILIENCE TEST (ZERO NETWORK CALLS ATTEMPTED)
// ============================================================================

describe('Vector 5: Offline Resilience Test (Zero Network Calls Attempted)', () => {
  beforeEach(() => {
    setupGlobalDom();
  });

  it('runs entire application lifecycle when navigator.onLine is false with zero network calls', async () => {
    let networkAttempts = 0;

    // Install network tripwires
    globalThis.fetch = () => {
      networkAttempts++;
      return Promise.reject(new Error('CRITICAL VIOLATION: Offline SPA must not call window.fetch'));
    };

    globalThis.XMLHttpRequest = class {
      constructor() {
        networkAttempts++;
        throw new Error('CRITICAL VIOLATION: Offline SPA must not instantiate XMLHttpRequest');
      }
    };

    globalThis.WebSocket = class {
      constructor() {
        networkAttempts++;
        throw new Error('CRITICAL VIOLATION: Offline SPA must not instantiate WebSocket');
      }
    };

    // Set offline mode
    window.navigator.onLine = false;

    // Execute complete multi-step app journey
    const app = new App();
    await app.init();

    // 1. Navigation
    app.handleNavigate('studio');
    app.handleNavigate('survey');
    app.handleNavigate('explore');

    // 2. Language switching
    app.handleLanguageChange('vi');
    app.handleLanguageChange('en');
    app.handleLanguageChange('dual');

    // 3. Modal lifecycle
    await app.handleOpenShowcase();
    const modal = KhktShowcaseModal.getInstance();
    if (modal) {
      modal.setActiveTab('empirical');
      modal.selectPedagogyStep(5);
      modal.toggleOriginalImage('fig3');
      modal.close();
    }
    app.handleCloseShowcase();

    // Verify invariant
    assert.equal(
      networkAttempts,
      0,
      `OFFLINE RESILIENCE VIOLATION: ${networkAttempts} external network requests were attempted!`
    );
  });

  it('verifies zero external CDN / remote URL dependencies in source modules', () => {
    // Verify that index.html and stylesheets do not reference external unpkg / cdnjs / googleapis
    const fs = globalThis.process ? import('node:fs') : null;
    if (fs) {
      // In Node.js environment, inspect index.html
      const path = './public/index.html';
      const content = globalThis.process ? import('node:fs').then(f => f.readFileSync(path, 'utf8')) : Promise.resolve('');
      return content.then(html => {
        if (!html) return;
        const externalCdnPattern = /https?:\/\/(?:cdn|unpkg|cdnjs|fonts\.googleapis|ajax)/i;
        assert.equal(
          externalCdnPattern.test(html),
          false,
          'index.html must not contain external CDN or remote font dependencies'
        );
      });
    }
  });
});
