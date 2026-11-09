/**
 * tests/vocabulary_table.test.js
 * Unit & Integration Test Suite for Interactive Vocabulary Table & Speech Audio (Milestone M3)
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VocabularyTable,
  escapeHtml,
  validateIpa
} from '../src/components/VocabularyTable.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

// Mock DOM Container Factory
function createMockContainer() {
  const container = {
    _html: '',
    attributes: {},
    listeners: new Map(),
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    set innerHTML(val) { this._html = val; },
    get innerHTML() { return this._html; },
    addEventListener(event, cb) {
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push(cb);
    },
    querySelector: function (selector) {
      if (selector.includes('.vocab-search-input')) {
        return {
          value: '',
          focus: () => {},
          addEventListener: () => {},
        };
      }
      return null;
    },
    querySelectorAll: function () {
      return [];
    },
  };
  return container;
}

// Mock Window Context for Web Speech API Verification
function createSpeechMockWindow() {
  const history = [];
  let speakingState = false;

  const mockSynth = {
    speaking: false,
    paused: false,
    history,
    speak: function (utterance) {
      speakingState = true;
      this.speaking = true;
      history.push(utterance);
      if (utterance.onstart) utterance.onstart();
      setTimeout(() => {
        speakingState = false;
        this.speaking = false;
        if (utterance.onend) utterance.onend();
      }, 10);
    },
    cancel: function () {
      speakingState = false;
      this.speaking = false;
    },
    getVoices: function () {
      return [{ name: 'Google US English', lang: 'en-US' }];
    },
  };

  class MockUtterance {
    constructor(text = '') {
      this.text = text;
      this.lang = 'en-US';
      this.rate = 1.0;
      this.pitch = 1.0;
      this.volume = 1.0;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  }

  return {
    speechSynthesis: mockSynth,
    SpeechSynthesisUtterance: MockUtterance,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

// ============================================================================
// TEST SUITE: VOCABULARY TABLE COMPONENT
// ============================================================================

describe('Milestone M3: VocabularyTable Unit & Edge Case Tests', () => {

  describe('1. Data Ingestion & Sanitization', () => {
    it('correctly ingests vocabulary from Lesson 1 (Lighthouse)', () => {
      const lesson1 = DEFAULT_LESSONS[0];
      const table = new VocabularyTable({ vocabulary: lesson1.vocabulary });
      assert.equal(table.rawVocabulary.length, 7);
      assert.equal(table.rawVocabulary[0].term, 'Angle of elevation');
    });

    it('safely handles empty, null, or undefined vocabulary inputs', () => {
      const table1 = new VocabularyTable({ vocabulary: null });
      assert.equal(table1.rawVocabulary.length, 0);

      const table2 = new VocabularyTable({ vocabulary: [] });
      assert.equal(table2.rawVocabulary.length, 0);

      const html = table2.renderHtml();
      assert.ok(html.includes('vocab-empty'));
    });

    it('sanitizes malicious XSS strings in term and definitions', () => {
      const maliciousVocab = [
        {
          term: '<script>alert("XSS")</script>',
          phonetics: '/xss/',
          partOfSpeech: 'noun',
          definitionVi: '<img src=x onerror=alert(1)>',
          definitionEn: 'Dangerous "quote" & ampersand',
          exampleSentence: '<svg onload=alert(2)>',
        },
      ];
      const table = new VocabularyTable({ vocabulary: maliciousVocab });
      const html = table.renderHtml();

      assert.ok(!html.includes('<script>alert("XSS")</script>'));
      assert.ok(html.includes('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'));
      assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
      assert.ok(!html.includes('<svg onload=alert(2)>'));
    });
  });

  describe('2. IPA Phonetic Validation', () => {
    it('validates authentic IPA phonetic notation with leading and trailing slashes', () => {
      assert.ok(validateIpa('/ˈæŋ.ɡəl əv ˌel.ɪˈveɪ.ʃən/'));
      assert.ok(validateIpa('/lɔː əv saɪnz/'));
      assert.ok(validateIpa('/haɪt/'));
    });

    it('rejects malformed IPA strings missing slashes or empty', () => {
      assert.equal(validateIpa('haɪt'), false);
      assert.equal(validateIpa('/'), false);
      assert.equal(validateIpa(''), false);
      assert.equal(validateIpa(null), false);
      assert.equal(validateIpa(123), false);
    });
  });

  describe('3. Bilingual View Modes (VI, EN, DUAL)', () => {
    const sampleItem = [
      {
        term: 'Parabolic arch',
        phonetics: '/ˌpær.əˈbɒl.ɪk ɑːtʃ/',
        partOfSpeech: 'noun phrase',
        definitionVi: 'Cổng vòm parabol',
        definitionEn: 'An architectural curved arch',
        exampleSentence: 'A parabolic arch spanning 8 meters.',
      },
    ];

    it('renders only Vietnamese definition in "vi" mode', () => {
      const table = new VocabularyTable({ vocabulary: sampleItem, language: 'vi' });
      const html = table.renderHtml();
      assert.ok(html.includes('Cổng vòm parabol'));
      assert.ok(!html.includes('An architectural curved arch'));
    });

    it('renders only English definition in "en" mode', () => {
      const table = new VocabularyTable({ vocabulary: sampleItem, language: 'en' });
      const html = table.renderHtml();
      assert.ok(html.includes('An architectural curved arch'));
      assert.ok(!html.includes('Cổng vòm parabol'));
    });

    it('renders both Vietnamese and English definitions with badges in "dual" mode', () => {
      const table = new VocabularyTable({ vocabulary: sampleItem, language: 'dual' });
      const html = table.renderHtml();
      assert.ok(html.includes('Cổng vòm parabol'));
      assert.ok(html.includes('An architectural curved arch'));
      assert.ok(html.includes('vocab-def-vi'));
      assert.ok(html.includes('vocab-def-en'));
    });
  });

  describe('4. Instant Search & Part of Speech Filtering', () => {
    const lesson1Vocab = DEFAULT_LESSONS[0].vocabulary;

    it('filters vocabulary accurately by English term substring', () => {
      const table = new VocabularyTable({ vocabulary: lesson1Vocab });
      table.state.searchQuery = 'sines';
      const results = table.getFilteredVocabulary();
      assert.equal(results.length, 1);
      assert.equal(results[0].term, 'Law of Sines');
    });

    it('filters vocabulary accurately by Vietnamese definition substring', () => {
      const table = new VocabularyTable({ vocabulary: lesson1Vocab });
      table.state.searchQuery = 'kinh vĩ';
      const results = table.getFilteredVocabulary();
      assert.equal(results.length, 1);
      assert.equal(results[0].term, 'Theodolite');
    });

    it('filters vocabulary by part of speech chip', () => {
      const table = new VocabularyTable({ vocabulary: lesson1Vocab });
      table.state.posFilter = 'adjective';
      const results = table.getFilteredVocabulary();
      assert.equal(results.length, 1);
      assert.equal(results[0].term, 'Collinear');
    });

    it('returns empty array when search query matches nothing', () => {
      const table = new VocabularyTable({ vocabulary: lesson1Vocab });
      table.state.searchQuery = 'NonExistentTermXYZ';
      const results = table.getFilteredVocabulary();
      assert.equal(results.length, 0);
    });
  });

  describe('5. Web Speech API Audio Pronunciation Integration', () => {
    it('invokes SpeechSynthesis.speak with correct term and "en-US" language code', async () => {
      const mockWin = createSpeechMockWindow();
      const lesson1Vocab = DEFAULT_LESSONS[0].vocabulary;
      const table = new VocabularyTable({
        vocabulary: lesson1Vocab,
        windowOverride: mockWin,
      });

      const success = await table.speak(0);
      assert.equal(success, true);
      assert.equal(mockWin.speechSynthesis.history.length, 1);
      assert.equal(mockWin.speechSynthesis.history[0].text, 'Angle of elevation');
      assert.equal(mockWin.speechSynthesis.history[0].lang, 'en-US');
    });

    it('cancels active playback when clicking the same term again (toggle behavior)', async () => {
      const mockWin = createSpeechMockWindow();
      const lesson1Vocab = DEFAULT_LESSONS[0].vocabulary;
      const table = new VocabularyTable({
        vocabulary: lesson1Vocab,
        windowOverride: mockWin,
      });

      // Start speaking
      table.speak(0);
      assert.equal(table.state.playingIndex, 0);

      // Re-click same term
      table.speak(0);
      assert.equal(table.state.playingIndex, null);
      assert.equal(mockWin.speechSynthesis.speaking, false);
    });

    it('cancels previous utterance when clicking a different term', async () => {
      const mockWin = createSpeechMockWindow();
      const lesson1Vocab = DEFAULT_LESSONS[0].vocabulary;
      const table = new VocabularyTable({
        vocabulary: lesson1Vocab,
        windowOverride: mockWin,
      });

      table.speak(0); // 'Angle of elevation'
      table.speak(1); // 'Inaccessible base'

      assert.equal(table.state.playingIndex, 1);
      assert.equal(mockWin.speechSynthesis.history.length, 2);
      assert.equal(mockWin.speechSynthesis.history[1].text, 'Inaccessible base');
    });

    it('stopAudio() resets playingIndex and cancels speechSynthesis', () => {
      const mockWin = createSpeechMockWindow();
      const lesson1Vocab = DEFAULT_LESSONS[0].vocabulary;
      const table = new VocabularyTable({
        vocabulary: lesson1Vocab,
        windowOverride: mockWin,
      });

      table.state.playingIndex = 2;
      mockWin.speechSynthesis.speaking = true;

      table.stopAudio();
      assert.equal(table.state.playingIndex, null);
      assert.equal(mockWin.speechSynthesis.speaking, false);
    });
  });

  describe('6. Lifecycle & Destroy', () => {
    it('destroy() clears container and stops active audio', () => {
      const mockWin = createSpeechMockWindow();
      const mockContainer = createMockContainer();
      const table = new VocabularyTable({
        container: mockContainer,
        vocabulary: DEFAULT_LESSONS[0].vocabulary,
        windowOverride: mockWin,
      });

      assert.ok(mockContainer.innerHTML.includes('Angle of elevation'));
      table.destroy();
      assert.equal(mockContainer.innerHTML, '');
      assert.equal(table.container, null);
    });
  });
});
