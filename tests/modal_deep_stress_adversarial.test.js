/**
 * tests/modal_deep_stress_adversarial.test.js
 * Empirical Adversarial Deep Stress Harness for Milestone M2 Iteration 2
 * 
 * Authored by: Milestone M2 Iteration 2 Challenger 2 (m2_it2_challenger_2)
 * 
 * Re-challenges the 3 previously failed vectors under extreme conditions:
 * Vector 1: Modal Destruction Race Condition (<250ms reopen, micro-delays, timing sweeps, chaos storm)
 * Vector 2: Double Backdrop and Keydown Listener Leak under rapid concurrent bursts (50x parallel, ESC interplay)
 * Vector 3: Cross-Component Language Desynchronization (high-frequency thrashing, reverse broadcast, boundary payloads)
 */

import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { KhktShowcaseModal } from '../src/components/KhktShowcaseModal.js';
import { Header } from '../src/components/Header.js';
import { App } from '../src/app.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

// ============================================================================
// Robust In-Memory Mock DOM Harness for Node.js
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

  click() {
    const event = new MockCustomEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
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

  while ((match = tagRegex.exec(html)) !== null) {
    const [full, isClosing, tagName, attrString] = match;
    if (full.startsWith('<!--')) continue;

    if (tagName) {
      if (isClosing) {
        if (stack.length > 1) {
          stack.pop();
          currentParent = stack[stack.length - 1];
        }
      } else {
        const el = new MockElement(tagName);
        if (attrString) {
          const attrRegex = /([a-zA-Z0-9\-:_]+)(?:=["']([^"']*)["'])?/g;
          let aMatch;
          while ((aMatch = attrRegex.exec(attrString)) !== null) {
            const [, key, val] = aMatch;
            el.setAttribute(key, val !== undefined ? val : '');
          }
        }
        currentParent.appendChild(el);
        const selfClosing = /^(?:img|br|hr|input|meta|link)$/i.test(tagName) || full.endsWith('/>');
        if (!selfClosing) {
          stack.push(el);
          currentParent = el;
        }
      }
    }
  }
  return root.children;
}

function traverseAndMatch(element, selector, results) {
  for (const child of element.children) {
    if (matchesSelector(child, selector)) {
      results.push(child);
    }
    traverseAndMatch(child, selector, results);
  }
}

function matchesSelector(element, selector) {
  const parts = selector.trim().split(/\s+/);
  if (parts.length > 1) {
    return element.tagName.toLowerCase() === parts[parts.length - 1].toLowerCase();
  }
  const sel = selector.trim();
  if (sel.startsWith('#')) return element.id === sel.slice(1);
  
  // Compound: .class[attr="val"] or .class[attr]
  const compoundMatch = sel.match(/^\.([a-zA-Z0-9\-_]+)\[([a-zA-Z0-9\-]+)(?:=["']([^"']*)["'])?\]$/);
  if (compoundMatch) {
    const [, cls, attr, val] = compoundMatch;
    if (!element.classList.contains(cls)) return false;
    if (val === undefined) return element.hasAttribute(attr);
    return element.getAttribute(attr) === val;
  }

  if (sel.startsWith('.')) return element.classList.contains(sel.slice(1));
  const attrMatch = sel.match(/^\[([a-zA-Z0-9\-]+)(?:=["']([^"']*)["'])?\]$/);
  if (attrMatch) {
    const [, k, v] = attrMatch;
    if (v === undefined) return element.hasAttribute(k);
    return element.getAttribute(k) === v;
  }
  const tagWithClass = sel.match(/^([a-zA-Z0-9\-]+)\.([a-zA-Z0-9\-_]+)$/);
  if (tagWithClass) {
    const [, tag, cls] = tagWithClass;
    return element.tagName.toLowerCase() === tag.toLowerCase() && element.classList.contains(cls);
  }
  return element.tagName.toLowerCase() === sel.toLowerCase();
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
  KhktShowcaseModal.instance = null;

  return { mockDocument, mockWindow, mockStorage, modalRoot, headerEl, mainEl, footerEl };
}

// ============================================================================
// SUITE 1: RE-CHALLENGE VECTOR 1 - MODAL DESTRUCTION RACE CONDITION
// ============================================================================

describe('Vector 1 Deep Stress: Modal Destruction Race Condition (<250ms reopen)', () => {
  beforeEach(() => {
    setupGlobalDom();
  });

  const reopenIntervals = [0, 1, 5, 10, 25, 45, 50, 55, 100, 150, 200, 240, 249];

  for (const delay of reopenIntervals) {
    it(`guarantees reopened modal survives across timing sweep delay: ${delay}ms`, async () => {
      const modal = new KhktShowcaseModal({ container: document.body });
      modal.open('pedagogy');
      await new Promise(r => setTimeout(r, 10));
      assert.equal(modal.isOpen(), true, 'Modal must initially open');

      // Close modal (starts 250ms close timeout)
      modal.close();

      // Wait specific micro-interval
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }

      // Reopen modal within <250ms
      modal.open('pedagogy');
      await new Promise(r => setTimeout(r, 10));

      // Wait until beyond the original 250ms timeout window (e.g. 300ms from close)
      await new Promise(r => setTimeout(r, 300));

      // INVARIANT: The reopened modal must NEVER have been destroyed by the stale close timer
      assert.ok(modal.modalEl, `modalEl must exist for delay=${delay}ms`);
      assert.ok(modal.modalEl.parentNode, `modalEl must be attached to DOM for delay=${delay}ms`);
      assert.equal(modal.isOpen(), true, `modal.isOpen() must be true for delay=${delay}ms`);
      assert.equal(document.body.style.overflow, 'hidden', 'Scroll lock must remain active while open');

      // Clean teardown
      modal.destroy();
    });
  }

  it('stress-tests 50-cycle random jitter chaos reopen burst', async () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    
    // Perform 50 rapid alternating or repeating calls with jitter
    for (let i = 0; i < 50; i++) {
      const action = (i % 2 === 0) ? 'open' : 'close';
      if (action === 'open') {
        modal.open('pedagogy');
      } else {
        modal.close();
      }
      const jitter = (i * 7) % 25; // 0 to 24ms
      await new Promise(r => setTimeout(r, jitter));
    }

    // Explicitly open modal at the end of the storm
    modal.open('pedagogy');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(modal.isOpen(), true, 'Modal must report open');

    // Wait 350ms to ensure all queued timers have had chance to fire
    await new Promise(r => setTimeout(r, 350));

    assert.ok(modal.modalEl, 'Modal element must not be destroyed');
    assert.ok(modal.modalEl.parentNode, 'Modal element must remain attached to parent');
    assert.equal(modal.isOpen(), true, 'Modal must remain open after chaotic burst');

    modal.destroy();
  });

  it('guarantees focusTimeout (50ms) is cleanly cancelled on immediate close (10ms)', async () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');
    assert.ok(modal.focusTimeout !== null, 'focusTimeout must be scheduled on open');

    // Close before 50ms expires
    await new Promise(r => setTimeout(r, 10));
    modal.close();

    assert.equal(modal.focusTimeout, null, 'focusTimeout must be cancelled and nullified on close');

    // Wait until past 50ms (e.g. 70ms)
    await new Promise(r => setTimeout(r, 70));
    assert.equal(modal.focusTimeout, null, 'focusTimeout must remain null');

    modal.destroy();
  });

  it('verifies destroy() method fully cleans up timers and listeners mid-animation', async () => {
    const modal = new KhktShowcaseModal({ container: document.body });
    modal.open('pedagogy');
    modal.close();

    // Call destroy at t=20ms while 250ms close timer is active
    await new Promise(r => setTimeout(r, 20));
    modal.destroy();

    assert.equal(modal.closeTimeout, null, 'closeTimeout must be nullified by destroy()');
    assert.equal(modal.focusTimeout, null, 'focusTimeout must be nullified by destroy()');
    assert.equal(modal.modalEl, null, 'modalEl must be nullified and detached by destroy()');
    assert.equal(document.body.style.overflow, '', 'Body scroll must be restored by destroy()');

    const keydownListeners = (document._docListeners.get('keydown') || []).length;
    assert.equal(keydownListeners, 0, 'No keydown listener should remain after destroy()');
  });
});

// ============================================================================
// SUITE 2: RE-CHALLENGE VECTOR 2 - DOUBLE BACKDROP & KEYDOWN LISTENER LEAK
// ============================================================================

describe('Vector 2 Deep Stress: Double Backdrop & Listener Leaks under Concurrent Bursts', () => {
  beforeEach(() => {
    KhktShowcaseModal.instance = null;
    setupGlobalDom();
  });

  it('defends against 50 parallel asynchronous handleOpenShowcase() invocations', async () => {
    const app = new App();
    await app.init();
    const modalRoot = document.getElementById('modal-root');

    // Launch 50 concurrent async calls in parallel
    const promises = Array.from({ length: 50 }, () => app.handleOpenShowcase());
    await Promise.all(promises);

    // Give microtasks and rAF time to settle
    await new Promise(r => setTimeout(r, 30));

    // INVARIANT 1: Exactly 1 backdrop element in #modal-root
    const backdrops = modalRoot.querySelectorAll('.khkt-modal-backdrop');
    assert.equal(backdrops.length, 1, 'Exactly 1 backdrop must exist despite 50 concurrent open calls');

    // INVARIANT 2: Keydown listeners on document:
    // Header attaches 1 listener for mobile menu drawer; Modal attaches 1 listener for ESC dismiss.
    // Total must be exactly 2 (1 Header + 1 Modal), and NEVER 50!
    const docKeydownListeners = (document._docListeners.get('keydown') || []).length;
    assert.equal(docKeydownListeners, 2, 'Exactly 2 keydown listeners must be attached (1 Header + 1 Modal), not 50');
    assert.equal(app.state.isShowcaseModalOpen, true, 'App state isShowcaseModalOpen must be true');

    // Now close the modal cleanly
    app.handleCloseShowcase();
    await new Promise(r => setTimeout(r, 300));

    // INVARIANT 3: 0 backdrops and only Header listener remains after close (0 leaked modal listeners)
    const finalBackdrops = modalRoot.querySelectorAll('.khkt-modal-backdrop');
    assert.equal(finalBackdrops.length, 0, '0 backdrops must remain after closing');
    const remainingListeners = (document._docListeners.get('keydown') || []).length;
    assert.equal(remainingListeners, 1, 'Exactly 1 keydown listener remains (Header only, 0 leaked modal listeners)');
    assert.equal(app.state.isShowcaseModalOpen, false, 'App state isShowcaseModalOpen must be false');
  });

  it('stress-tests 30 rapid alternating open/close cycles without awaiting', async () => {
    const app = new App();
    await app.init();
    const modalRoot = document.getElementById('modal-root');

    for (let i = 0; i < 30; i++) {
      if (i % 2 === 0) {
        app.handleOpenShowcase();
      } else {
        app.handleCloseShowcase();
      }
    }

    // Final desired state: Open
    await app.handleOpenShowcase();
    await new Promise(r => setTimeout(r, 50));

    const backdrops = modalRoot.querySelectorAll('.khkt-modal-backdrop');
    assert.equal(
      backdrops.length,
      1,
      `ASYNC RE-ENTRANCY VULNERABILITY DETECTED: Un-awaited rapid open/close cycles bypassed the re-entrancy guard during in-flight dynamic imports, mounting ${backdrops.length} stacked backdrops!`
    );
    assert.equal(app.state.isShowcaseModalOpen, true);

    // Final clean close
    app.handleCloseShowcase();
    await new Promise(r => setTimeout(r, 300));
  });

  it('guarantees ESC key dismissal followed by rapid reopen (<250ms) does not corrupt root open state', async () => {
    const app = new App();
    await app.init();
    const modalRoot = document.getElementById('modal-root');

    // 1. Open modal
    await app.handleOpenShowcase();
    await new Promise(r => setTimeout(r, 20));
    assert.equal(app.state.isShowcaseModalOpen, true);
    assert.ok(app.showcaseModal.isOpen());

    // 2. User presses ESC key
    const escEvent = new MockKeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    document.dispatchEvent(escEvent);

    // Verify modal is closing and event reset app state
    assert.equal(app.state.isShowcaseModalOpen, false, 'app.state.isShowcaseModalOpen must flip to false on ESC');

    // 3. User re-opens showcase immediately at t=50ms (< 250ms)
    await new Promise(r => setTimeout(r, 50));
    await app.handleOpenShowcase();
    await new Promise(r => setTimeout(r, 20));

    assert.equal(
      app.state.isShowcaseModalOpen,
      true,
      'STATE INVERSION VULNERABILITY DETECTED: In app.handleOpenShowcase(), calling this.showcaseModal.close() dispatched khkt:modal-closed, resetting app.state.isShowcaseModalOpen to false while reopening!'
    );
    assert.ok(app.showcaseModal.isOpen(), 'Reopened modal must be open');

    // 4. Wait until t=350ms (well past the first modal 250ms close timer)
    await new Promise(r => setTimeout(r, 300));

    assert.equal(
      app.showcaseModal.isOpen(),
      true,
      'The reopened modal must remain open'
    );
    assert.equal(
      app.state.isShowcaseModalOpen,
      true,
      'app.state.isShowcaseModalOpen must remain true'
    );

    // Clean teardown
    app.handleCloseShowcase();
    await new Promise(r => setTimeout(r, 300));
  });

  it('ghost modal detachment vulnerability: reopening modal within 250ms of handleCloseShowcase() leaves modal detached from modalRoot', async () => {
    const app = new App();
    await app.init();
    const modalRoot = document.getElementById('modal-root');

    await app.handleOpenShowcase();
    assert.equal(modalRoot.children.length, 1, 'Modal must initially mount into modalRoot');

    // Close via handleCloseShowcase()
    app.handleCloseShowcase();
    assert.equal(modalRoot.children.length, 0, 'modalRoot must be emptied on close');

    // Reopen within 50ms (< 250ms)
    await new Promise(r => setTimeout(r, 50));
    await app.handleOpenShowcase();

    // Adversarial invariant: reopened modal must be attached to modalRoot
    assert.equal(
      modalRoot.children.length,
      1,
      'GHOST MODAL VULNERABILITY DETECTED: modalRoot.innerHTML = "" in handleCloseShowcase() detached modalEl, but KhktShowcaseModal.open() assumed modalEl was still attached and did not re-append it to modalRoot!'
    );
  });

  it('handles 20 rapid modal:open-showcase global window events safely', async () => {
    const app = new App();
    await app.init();
    const modalRoot = document.getElementById('modal-root');

    for (let i = 0; i < 20; i++) {
      window.dispatchEvent(new MockCustomEvent('modal:open-showcase'));
    }
    await new Promise(r => setTimeout(r, 50));

    const backdrops = modalRoot.querySelectorAll('.khkt-modal-backdrop');
    assert.equal(backdrops.length, 1, 'Global event storm must produce exactly 1 backdrop');

    app.handleCloseShowcase();
    await new Promise(r => setTimeout(r, 300));
  });
});

// ============================================================================
// SUITE 3: RE-CHALLENGE VECTOR 3 - CROSS-COMPONENT LANGUAGE SYNCHRONIZATION
// ============================================================================

describe('Vector 3 Deep Stress: Cross-Component Language Synchronization', () => {
  beforeEach(() => {
    setupGlobalDom();
  });

  it('survives 100-cycle high-frequency language thrashing without desynchronization or stack overflow', async () => {
    const app = new App();
    await app.init();

    const sequence = ['vi', 'en', 'dual', 'vi', 'dual', 'en'];
    for (let i = 0; i < 100; i++) {
      const lang = sequence[i % sequence.length];
      app.handleLanguageChange(lang);
      assert.equal(app.state.language, lang);
      assert.equal(app.header.language, lang);
    }

    // Settle on 'en'
    app.handleLanguageChange('en');
    assert.equal(app.state.language, 'en');
    assert.equal(app.header.language, 'en');

    // Check header DOM reflects 'en'
    const headerContainer = document.getElementById('app-header');
    assert.ok(headerContainer.innerHTML.includes('Lessons'), 'Header DOM must reflect English');
    assert.ok(!headerContainer.innerHTML.includes('Bài học'), 'Header DOM must not retain stale Vietnamese');

    // Check localStorage integrity
    const saved = JSON.parse(window.localStorage.getItem('user_settings'));
    assert.equal(saved.lang, 'en');
  });

  it('guarantees reverse synchronization when external component emits app:language-change', async () => {
    const app = new App();
    await app.init();
    assert.equal(app.state.language, 'dual');
    assert.equal(app.header.language, 'dual');

    // External component broadcasts 'vi'
    window.dispatchEvent(new MockCustomEvent('app:language-change', { detail: { lang: 'vi' } }));

    assert.equal(app.state.language, 'vi', 'App state must synchronize to vi on external window event');
    assert.equal(app.header.language, 'vi', 'Header state must synchronize to vi on external window event');

    // External component broadcasts 'en'
    window.dispatchEvent(new MockCustomEvent('app:language-change', { detail: { lang: 'en' } }));

    assert.equal(app.state.language, 'en', 'App state must synchronize to en on external window event');
    assert.equal(app.header.language, 'en', 'Header state must synchronize to en on external window event');
  });

  it('verifies full roundtrip when user clicks language button in Header UI', async () => {
    const app = new App();
    await app.init();

    const headerContainer = document.getElementById('app-header');
    const viBtn = headerContainer.querySelector('.lang-btn[data-lang="vi"]');
    assert.ok(viBtn, 'VI language button must exist in Header');

    // Simulate user clicking VI button
    viBtn.click();

    assert.equal(app.state.language, 'vi', 'App language must update on Header button click');
    assert.equal(app.header.language, 'vi', 'Header language must update on Header button click');
    const saved = JSON.parse(window.localStorage.getItem('user_settings'));
    assert.equal(saved.lang, 'vi', 'localStorage must persist clicked language');
  });

  it('strictly rejects invalid language codes and prototype attacks without corrupting state', async () => {
    const app = new App();
    await app.init();
    app.handleLanguageChange('dual');

    const invalidInputs = [
      null,
      undefined,
      12345,
      {},
      ['en'],
      '__proto__',
      'constructor',
      'fr',
      'es',
      '<script>alert(1)</script>',
      'VI', // case mismatch
      'DUAL ' // whitespace
    ];

    for (const invalid of invalidInputs) {
      app.handleLanguageChange(invalid);
      assert.equal(app.state.language, 'dual', `Invalid input '${invalid}' must be rejected; state remains dual`);
      assert.equal(app.header.language, 'dual', `Invalid input '${invalid}' must leave header as dual`);
    }
  });

  it('verifies Header clean lifecycle: mount -> destroy -> remount without listener leaks', () => {
    const headerContainer = document.getElementById('app-header');
    let currentLang = 'dual';
    const header = new Header({
      activeTab: 'explore',
      language: currentLang,
      onLanguageChange: (l) => { currentLang = l; }
    });

    header.mount(headerContainer);
    assert.equal((window._windowListeners.get('app:language-change') || []).length, 1);

    // Teardown
    header.destroy();
    assert.equal((window._windowListeners.get('app:language-change') || []).length, 0);
    assert.equal(headerContainer.innerHTML, '');

    // Broadcast while destroyed: must not throw or alter state
    window.dispatchEvent(new MockCustomEvent('app:language-change', { detail: { lang: 'en' } }));
    assert.equal(header.language, 'dual');

    // Remount
    header.mount(headerContainer);
    assert.equal((window._windowListeners.get('app:language-change') || []).length, 1);
    header.destroy();
  });
});
