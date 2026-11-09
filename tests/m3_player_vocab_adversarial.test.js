/**
 * tests/m3_player_vocab_adversarial.test.js
 * Empirical Adversarial Stress Test Suite for Milestone M3
 * Target components: LessonPlayer.js & VocabularyTable.js
 * 
 * Authored by: Milestone M3 Challenger 2 (m3_challenger_2)
 * 
 * Adversarial Focus Areas:
 * 1. Web Speech API Concurrency & Race Conditions (_utteranceSeq, cancel(), audio overlap)
 * 2. Stepper Boundary & Rapid Jumping (50x fast jumps, bounds [1..5], audio cut-off on exit, input guard)
 * 3. Language Thrashing & Bi-directional State Sync (vi -> en -> dual cycling, 0 infinite loops, UI sync)
 * 4. Lifecycle Teardown & Listener Integrity (event unbinding, audio cancel, child teardown)
 */

import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { LessonPlayer } from '../src/components/LessonPlayer.js';
import { VocabularyTable, validateIpa } from '../src/components/VocabularyTable.js';
import * as speechService from '../src/services/speech.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

// ============================================================================
// Comprehensive Mock DOM & Web Speech API Harness
// ============================================================================

class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...names) {
    for (const n of names) if (n) this.classes.add(n);
  }
  remove(...names) {
    for (const n of names) this.classes.delete(n);
  }
  contains(name) {
    return this.classes.has(name);
  }
}

class MockElement {
  constructor(tagName = 'DIV') {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.classList = new MockClassList();
    this.listeners = new Map();
    this.value = '';
    this._innerHTML = '';
    this.dataset = {};
  }

  get id() { return this.getAttribute('id') || ''; }
  set id(val) { this.setAttribute('id', val); }

  setAttribute(k, v) {
    this.attributes.set(k, String(v));
    if (k.startsWith('data-')) {
      const prop = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[prop] = String(v);
    }
  }

  getAttribute(k) {
    return this.attributes.has(k) ? this.attributes.get(k) : null;
  }

  hasAttribute(k) {
    return this.attributes.has(k);
  }

  appendChild(child) {
    if (!child) return child;
    if (child.parentNode) child.parentNode.removeChild(child);
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
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners.has(type)) return;
    const list = this.listeners.get(type);
    const idx = list.indexOf(fn);
    if (idx >= 0) list.splice(idx, 1);
  }

  dispatchEvent(event) {
    event.target = this;
    event.currentTarget = this;
    const list = this.listeners.get(event.type) || [];
    for (const fn of list) {
      fn.call(this, event);
    }
    return !event.defaultPrevented;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, defaultPrevented: false, stopPropagation: () => {} });
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    // Lightweight parser for mock elements
    const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/g;
    let match;
    const stack = [this];
    let currentParent = this;

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
              if (key === 'class') {
                val.split(/\s+/).forEach(c => el.classList.add(c));
              }
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
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    const traverse = (node) => {
      for (const child of node.children) {
        if (matchSelector(child, selector)) results.push(child);
        traverse(child);
      }
    };
    traverse(this);
    return results;
  }
}

function matchSelector(el, sel) {
  sel = sel.trim();
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) {
    const cls = sel.slice(1).split('[')[0];
    return el.classList.contains(cls);
  }
  return el.tagName.toLowerCase() === sel.toLowerCase();
}

class MockCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail || null;
    this.bubbles = Boolean(init.bubbles);
    this.cancelable = Boolean(init.cancelable);
    this.defaultPrevented = false;
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() {}
}

class MockSpeechSynthesisUtterance {
  constructor(text = '') {
    this.text = text;
    this.lang = 'en-US';
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

function createSpeechMockWindow() {
  const history = [];
  const cancelHistory = [];
  let currentActive = null;
  let concurrentCount = 0;
  let maxConcurrent = 0;

  const mockSynth = {
    speaking: false,
    paused: false,
    history,
    cancelHistory,
    getMaxConcurrent: () => maxConcurrent,

    speak: function (utterance) {
      concurrentCount++;
      if (concurrentCount > maxConcurrent) maxConcurrent = concurrentCount;

      this.speaking = true;
      currentActive = utterance;
      history.push(utterance);

      // Async trigger for onstart
      queueMicrotask(() => {
        if (utterance.onstart) utterance.onstart();
      });

      // Realistic finish after small delay
      const timer = setTimeout(() => {
        if (currentActive === utterance) {
          concurrentCount = Math.max(0, concurrentCount - 1);
          this.speaking = false;
          currentActive = null;
          if (utterance.onend) utterance.onend();
        }
      }, 15);

      utterance._timer = timer;
    },

    cancel: function () {
      cancelHistory.push(Date.now());
      if (currentActive) {
        clearTimeout(currentActive._timer);
        const cancelledUtterance = currentActive;
        concurrentCount = Math.max(0, concurrentCount - 1);
        this.speaking = false;
        currentActive = null;

        // In standard Web Speech API, cancel fires 'error' event with { error: 'canceled' }
        queueMicrotask(() => {
          if (cancelledUtterance.onerror) {
            cancelledUtterance.onerror({ error: 'canceled' });
          }
        });
      }
    },

    getVoices: function () {
      return [
        { name: 'Google US English', lang: 'en-US', localService: true },
        { name: 'Samantha', lang: 'en-US', localService: true }
      ];
    }
  };

  const listeners = new Map();

  const win = {
    speechSynthesis: mockSynth,
    SpeechSynthesisUtterance: MockSpeechSynthesisUtterance,
    CustomEvent: MockCustomEvent,
    listeners,
    addEventListener: function (type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener: function (type, fn) {
      if (!listeners.has(type)) return;
      const list = listeners.get(type);
      const idx = list.indexOf(fn);
      if (idx >= 0) list.splice(idx, 1);
    },
    dispatchEvent: function (event) {
      const list = listeners.get(event.type) || [];
      for (const fn of [...list]) {
        fn.call(win, event);
      }
      return true;
    },
    getListenerCount: function (type) {
      return (listeners.get(type) || []).length;
    }
  };

  return win;
}

// ============================================================================
// ADVERSARIAL STRESS TEST SUITE
// ============================================================================

describe('Milestone M3: Empirical Adversarial Stress & Concurrency Test Suite', () => {

  let mockWin;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    mockWin = createSpeechMockWindow();
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    globalThis.window = mockWin;
    globalThis.document = {
      activeElement: null,
      querySelector: () => null,
      querySelectorAll: () => []
    };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  // --------------------------------------------------------------------------
  // Vector 1: Web Speech API Concurrency & Sequence Token Guard
  // --------------------------------------------------------------------------
  describe('Vector 1: Web Speech API Concurrency & Race Conditions', () => {

    it('1.1 Rapidly clicking different vocabulary items cancels previous utterances immediately and maintains single active utterance', async () => {
      const container = new MockElement('DIV');
      const table = new VocabularyTable({
        container,
        vocabulary: DEFAULT_LESSONS[0].vocabulary,
        windowOverride: mockWin
      });

      // Rapidly trigger speak across 5 different vocabulary indices in tight sequence
      const speakPromises = [
        table.speak(0),
        table.speak(1),
        table.speak(2),
        table.speak(3),
        table.speak(4)
      ];

      // Immediately verify that the active playingIndex is set to the LAST item (4)
      assert.equal(table.state.playingIndex, 4, 'playingIndex must immediately update to the latest clicked index');
      assert.ok(mockWin.speechSynthesis.cancelHistory.length >= 4, 'Previous utterances must have received cancel() calls');

      await Promise.all(speakPromises);

      // Wait for the final speech to finish
      await new Promise(r => setTimeout(r, 30));

      // Max concurrent utterances speaking simultaneously must NEVER exceed 1
      assert.equal(mockWin.speechSynthesis.getMaxConcurrent(), 1, 'Audio concurrency must never exceed 1');
      assert.equal(table.state.playingIndex, null, 'playingIndex must be cleanly reset after latest playback ends');
      table.destroy();
    });

    it('1.2 Sequence token _utteranceSeq prevents canceled callbacks from resetting playingIndex of newer active utterance', async () => {
      const container = new MockElement('DIV');
      const table = new VocabularyTable({
        container,
        vocabulary: DEFAULT_LESSONS[0].vocabulary,
        windowOverride: mockWin
      });

      // Start utterance 0
      const p1 = table.speak(0);
      assert.equal(table.state.playingIndex, 0);

      // Immediately start utterance 1 (this cancels utterance 0)
      const p2 = table.speak(1);
      assert.equal(table.state.playingIndex, 1);

      // Even if cancelled utterance 0 callback fires microtask, playingIndex must NOT become null
      await new Promise(r => queueMicrotask(r));
      assert.equal(table.state.playingIndex, 1, 'Canceled utterance 0 must NOT reset playingIndex while utterance 1 is playing');

      await Promise.all([p1, p2]);
      await new Promise(r => setTimeout(r, 25));

      assert.equal(table.state.playingIndex, null, 'playingIndex resets only when the final active utterance completes');
      table.destroy();
    });

    it('1.3 Toggle audio on active vocabulary item stops playback immediately without double-playing', async () => {
      const container = new MockElement('DIV');
      const table = new VocabularyTable({
        container,
        vocabulary: DEFAULT_LESSONS[0].vocabulary,
        windowOverride: mockWin
      });

      // First click: start
      table.speak(0);
      assert.equal(table.state.playingIndex, 0);

      // Second click on SAME item while speaking: toggle stop
      table.speak(0);
      assert.equal(table.state.playingIndex, null, 'Re-clicking active item must immediately toggle to stopped');
      assert.equal(mockWin.speechSynthesis.speaking, false, 'SpeechSynthesis must be stopped');

      table.destroy();
    });

    it('1.4 Rapidly clicking narration read-aloud button in LessonPlayer ensures no overlapping audio and clean state toggling', async () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({
        container,
        lessonId: 'lesson-lighthouse'
      });

      // Rapidly toggle narration 10 times in tight sequence
      for (let i = 0; i < 10; i++) {
        player.toggleNarrationSpeech();
      }

      // 10 toggles (even number) must result in stopped state
      assert.equal(player.isNarrationPlaying, false, 'Even number of toggles must result in isNarrationPlaying = false');

      // 11th toggle starts playback
      player.toggleNarrationSpeech();
      assert.equal(player.isNarrationPlaying, true, 'Odd toggle must start narration playback');

      // Wait for playback to complete or stop
      player.toggleNarrationSpeech(); // 12th toggle stops it
      assert.equal(player.isNarrationPlaying, false);

      player.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // Vector 2: Stepper Boundary & Rapid Jumping Stress
  // --------------------------------------------------------------------------
  describe('Vector 2: Stepper Boundary & Rapid Jumping Stress', () => {

    it('2.1 50 rapid alternating and chaotic scene navigation jumps clamp strictly within [1..5]', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      // Matrix of chaotic target scene values: extreme negatives, overflow, decimals, strings, NaN
      const chaoticTargets = [
        0, -1, -999, 6, 7, 100, 1.5, 4.9, '3', 'NaN', null, undefined,
        5, 1, 4, 2, 3, 5, -50, 1000, 2, 4, 1, 3, 5, 2, 1, 5, 4, 3,
        0, 6, 99999, -42, 1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 3, 1, 5, 2, 4, 1
      ];

      assert.equal(chaoticTargets.length, 50, 'Must execute exactly 50 jumps');

      for (const target of chaoticTargets) {
        player.goToScene(target);
        assert.ok(
          player.currentSceneId >= 1 && player.currentSceneId <= 5,
          `currentSceneId must strictly be between 1 and 5; got ${player.currentSceneId} from target ${target}`
        );
        const activeScene = player.getCurrentScene();
        assert.ok(activeScene, 'getCurrentScene() must return valid scene object');
        assert.ok([1, 2, 3, 4, 5].includes(activeScene.id ?? activeScene.sceneNumber));
      }

      player.destroy();
    });

    it('2.2 Completed scenes tracking correctly records set of all visited scenes without duplicate or corrupted IDs', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      assert.deepEqual(Array.from(player.completedScenes), [1], 'Scene 1 must be initially marked visited');

      player.goToScene(3);
      assert.ok(player.completedScenes.has(1) && player.completedScenes.has(3));
      assert.equal(player.completedScenes.has(2), false, 'Skipped Scene 2 must not be marked visited yet');

      player.goToScene(5);
      player.goToScene(2);
      player.goToScene(4);

      assert.equal(player.completedScenes.size, 5, 'All 5 scenes must be in completedScenes');
      for (let i = 1; i <= 5; i++) {
        assert.ok(player.completedScenes.has(i));
      }

      player.destroy();
    });

    it('2.3 Jumping away from Scene 3 immediately stops active vocabulary speech', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container, lessonId: 'lesson-lighthouse' });

      // Jump to Scene 3
      player.goToScene(3);
      assert.equal(player.currentSceneId, 3);

      // Simulate an active vocabulary instance with ongoing audio
      let audioStopped = false;
      player.vocabTableInstance = {
        stopAudio: () => { audioStopped = true; },
        destroy: () => {}
      };

      // Jump away to Scene 4
      player.goToScene(4);
      assert.equal(player.currentSceneId, 4);
      assert.equal(audioStopped, true, 'Vocabulary audio must be stopped immediately when navigating away from Scene 3');

      player.destroy();
    });

    it('2.4 Rapid ArrowLeft / ArrowRight keyboard navigation does NOT hijack input when an INPUT, TEXTAREA, or SELECT is focused', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });
      player.goToScene(2);
      assert.equal(player.currentSceneId, 2);

      // Simulate focus inside an INPUT element (e.g. search query box)
      const inputEl = new MockElement('INPUT');
      globalThis.document.activeElement = inputEl;

      const leftEvent = { key: 'ArrowLeft', defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      const rightEvent = { key: 'ArrowRight', defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };

      // Dispatch 10 arrow events while INPUT is active
      for (let i = 0; i < 5; i++) {
        player.handleKeyDown(leftEvent);
        player.handleKeyDown(rightEvent);
      }

      assert.equal(player.currentSceneId, 2, 'Scene must NOT change when an INPUT is focused');
      assert.equal(leftEvent.defaultPrevented, false, 'Default input keystroke behavior must NOT be prevented');

      // Test TEXTAREA focus
      const textareaEl = new MockElement('TEXTAREA');
      globalThis.document.activeElement = textareaEl;
      player.handleKeyDown(rightEvent);
      assert.equal(player.currentSceneId, 2, 'Scene must NOT change when a TEXTAREA is focused');

      // Test SELECT focus
      const selectEl = new MockElement('SELECT');
      globalThis.document.activeElement = selectEl;
      player.handleKeyDown(leftEvent);
      assert.equal(player.currentSceneId, 2, 'Scene must NOT change when a SELECT is focused');

      // Test non-input element (e.g. DIV or body)
      const divEl = new MockElement('DIV');
      globalThis.document.activeElement = divEl;
      player.handleKeyDown(rightEvent);
      assert.equal(player.currentSceneId, 3, 'Scene must advance when focus is on non-input element');

      player.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // Vector 3: Language Thrashing & Bi-directional State Sync
  // --------------------------------------------------------------------------
  describe('Vector 3: Language Thrashing & Bi-directional State Sync', () => {

    it('3.1 Rapidly cycles language modes (50 iterations: vi -> en -> dual -> vi) via setLanguage() with 0 recursion or stack overflow', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      const modes = ['vi', 'en', 'dual'];
      for (let i = 0; i < 50; i++) {
        const targetMode = modes[i % 3];
        player.setLanguage(targetMode, false); // internal switch without broadcast
        assert.equal(player.language, targetMode);
      }

      assert.equal(player.language, modes[49 % 3]);
      player.destroy();
    });

    it('3.2 Rapidly cycles language modes via window "app:language-change" CustomEvent without infinite event loop', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      const modes = ['vi', 'en', 'dual'];
      // Dispatch 30 external language change events
      for (let i = 0; i < 30; i++) {
        const targetMode = modes[i % 3];
        mockWin.dispatchEvent(new MockCustomEvent('app:language-change', {
          detail: { lang: targetMode }
        }));
        assert.equal(player.language, targetMode, `Player must synchronize to external event language ${targetMode}`);
      }

      player.destroy();
    });

    it('3.3 Subtitle cards and visual narratives reflect strictly the chosen mode in every scene', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      // Mode: VI
      player.setLanguage('vi', false);
      let html = container.innerHTML;
      assert.ok(html.includes('bilingual-card-vi'), 'VI mode must render Vietnamese card');
      assert.ok(!html.includes('bilingual-card-en'), 'VI mode must NOT render English card');

      // Mode: EN
      player.setLanguage('en', false);
      html = container.innerHTML;
      assert.ok(!html.includes('bilingual-card-vi'), 'EN mode must NOT render Vietnamese card');
      assert.ok(html.includes('bilingual-card-en'), 'EN mode must render English card');

      // Mode: DUAL
      player.setLanguage('dual', false);
      html = container.innerHTML;
      assert.ok(html.includes('bilingual-card-vi'), 'DUAL mode must render Vietnamese card');
      assert.ok(html.includes('bilingual-card-en'), 'DUAL mode must render English card');

      player.destroy();
    });

    it('3.4 Vocabulary definitions in VocabularyTable dynamically reflect the active language mode', () => {
      const container = new MockElement('DIV');
      const table = new VocabularyTable({
        container,
        vocabulary: [
          {
            term: 'Theodolite',
            phonetics: '/θiˈɒd.ə.laɪt/',
            partOfSpeech: 'noun',
            definitionVi: 'Máy kinh vĩ đo góc',
            definitionEn: 'Precision optical instrument',
            exampleSentence: 'Surveyors use a theodolite.'
          }
        ],
        language: 'vi',
        windowOverride: mockWin
      });

      // VI mode
      assert.ok(container.innerHTML.includes('Máy kinh vĩ đo góc'));
      assert.ok(!container.innerHTML.includes('Precision optical instrument'));

      // EN mode
      table.setLanguage('en');
      assert.ok(!container.innerHTML.includes('Máy kinh vĩ đo góc'));
      assert.ok(container.innerHTML.includes('Precision optical instrument'));

      // DUAL mode
      table.setLanguage('dual');
      assert.ok(container.innerHTML.includes('Máy kinh vĩ đo góc'));
      assert.ok(container.innerHTML.includes('Precision optical instrument'));
      assert.ok(container.innerHTML.includes('vocab-def-vi'));
      assert.ok(container.innerHTML.includes('vocab-def-en'));

      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // Vector 4: Lifecycle Teardown & Event Listener Integrity
  // --------------------------------------------------------------------------
  describe('Vector 4: Lifecycle Teardown & Event Listener Integrity', () => {

    it('4.1 destroy() detaches all window event listeners (keydown, app:language-change) and clears container', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      // Verify listeners were attached
      assert.equal(player._listenersAttached, true);
      assert.ok(mockWin.getListenerCount('keydown') >= 1);
      assert.ok(mockWin.getListenerCount('app:language-change') >= 1);

      // Destroy player
      player.destroy();

      assert.equal(player._listenersAttached, false);
      assert.equal(mockWin.getListenerCount('keydown'), 0, 'keydown listener must be detached on destroy()');
      assert.equal(mockWin.getListenerCount('app:language-change'), 0, 'app:language-change listener must be detached on destroy()');
      assert.equal(container.innerHTML, '', 'container innerHTML must be cleared');
      assert.equal(player.container, null, 'container reference must be nulled');
    });

    it('4.2 destroy() cancels ongoing speech audio immediately', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      // Start narration
      player.toggleNarrationSpeech();
      assert.equal(player.isNarrationPlaying, true);

      // Destroy component
      player.destroy();

      assert.equal(mockWin.speechSynthesis.speaking, false, 'SpeechSynthesis must be stopped on destroy()');
    });

    it('4.3 Re-entering Scene 3 repeatedly does not cause unhandled listener errors when language change is dispatched', async () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      // Simulate visiting Scene 3 multiple times
      for (let i = 0; i < 5; i++) {
        player.goToScene(3);
        // Yield to microtasks for dynamic import
        await new Promise(r => setTimeout(r, 10));
        player.goToScene(2);
      }

      // Dispatch global language change event - must not throw or crash
      assert.doesNotThrow(() => {
        mockWin.dispatchEvent(new MockCustomEvent('app:language-change', {
          detail: { lang: 'en' }
        }));
      });

      player.destroy();
    });

    it('4.4 Changing lesson via setLesson() terminates previous audio and resets isNarrationPlaying', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container, lessonId: 'lesson-lighthouse' });

      player.toggleNarrationSpeech();
      assert.equal(player.isNarrationPlaying, true);
      assert.equal(mockWin.speechSynthesis.speaking, true);

      // Change lesson
      player.setLesson('lesson-parabolic-arch');
      assert.equal(player.lesson.id, 'lesson-parabolic-arch');
      assert.equal(mockWin.speechSynthesis.speaking, false, 'Speech audio must be stopped when switching lesson');
      assert.equal(player.isNarrationPlaying, false, 'isNarrationPlaying must be reset to false when switching lesson');

      player.destroy();
    });

    it('4.5 Repeatedly visiting Scene 3 does NOT leak VocabularyTable event listeners on window', async () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container });

      const initialCount = mockWin.getListenerCount('app:language-change');
      assert.equal(initialCount, 1, 'Initially only 1 listener from LessonPlayer');

      // Visit Scene 3 first time
      player.goToScene(3);
      await new Promise(r => setTimeout(r, 20));
      const countAfterVisit1 = mockWin.getListenerCount('app:language-change');
      assert.equal(countAfterVisit1, 2, '1 from LessonPlayer + 1 from VocabularyTable');

      // Visit Scene 2, then Scene 3 second time
      player.goToScene(2);
      player.goToScene(3);
      await new Promise(r => setTimeout(r, 20));
      const countAfterVisit2 = mockWin.getListenerCount('app:language-change');

      assert.equal(countAfterVisit2, 2, `Re-visiting Scene 3 must NOT leak duplicate listeners on window; got ${countAfterVisit2}`);

      player.destroy();
    });

    it('4.6 triggerStartWorksheet() terminates narration speech and resets isNarrationPlaying', () => {
      const container = new MockElement('DIV');
      const player = new LessonPlayer({ container, lessonId: 'lesson-lighthouse' });

      player.toggleNarrationSpeech();
      assert.equal(player.isNarrationPlaying, true);
      assert.equal(mockWin.speechSynthesis.speaking, true);

      // Trigger worksheet CTA
      player.triggerStartWorksheet();
      assert.equal(mockWin.speechSynthesis.speaking, false, 'Speech audio must be stopped when launching worksheet');
      assert.equal(player.isNarrationPlaying, false, 'isNarrationPlaying must be reset to false when launching worksheet');

      player.destroy();
    });
  });
});
