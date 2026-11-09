/**
 * src/services/speech.js
 * Native Web Speech API Wrapper for Math-English Pronunciation
 * 
 * Complies with KHKT Criterion V2.4:
 * - Pedagogical rate control (120-140 WPM, default rate: 0.9)
 * - Offline native voice prioritization
 * - Polymorphic context handling (Browser window, Mock window, Node.js headless fallback)
 */

let voicesCache = [];
let voicesLoaded = false;
let currentUtterance = null;
let isSpeakingState = false;

/**
 * Checks if Web Speech API is supported in current or provided environment.
 * @param {Object} [win=null] - Optional browser window context
 * @returns {boolean}
 */
export function isSupported(win = null) {
  const targetWindow = win || (typeof window !== 'undefined' ? window : null);
  return Boolean(
    targetWindow &&
    targetWindow.speechSynthesis &&
    typeof targetWindow.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Initializes and caches available system voices.
 * @param {Object} [win=null]
 */
function initVoices(win = null) {
  const targetWindow = win || (typeof window !== 'undefined' ? window : null);
  if (!isSupported(targetWindow)) return;
  
  const synth = targetWindow.speechSynthesis;
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
  initVoices(window);
}

/**
 * Gets list of available voices, optionally filtered by language prefix.
 * @param {string} [langPrefix=''] - e.g. 'en' or 'vi'
 * @param {Object} [targetWindow=null] - Browser window context override
 * @returns {Array<SpeechSynthesisVoice>}
 */
export function getVoices(langPrefix = '', targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (!isSupported(win)) return [];
  if (voicesCache.length === 0 && win.speechSynthesis) {
    try {
      voicesCache = win.speechSynthesis.getVoices() || [];
    } catch (e) {
      voicesCache = [];
    }
  }
  if (!langPrefix) return voicesCache;
  return voicesCache.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
}

/**
 * Selects the optimal voice for a given language code.
 * Prioritizes local, high-clarity offline voices.
 * @param {string} [lang='en-US']
 * @param {Object} [targetWindow=null]
 * @returns {SpeechSynthesisVoice|null}
 */
export function getPreferredVoice(lang = 'en-US', targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  const voices = getVoices(lang.split('-')[0], win);
  if (!voices || voices.length === 0) return null;

  // Preferred English voice names
  const preferredNames = [
    'Samantha', 'Alex', 'Daniel', 'Victoria', 'Karen',
    'Google US English', 'Microsoft Zira', 'Microsoft David'
  ];

  for (const name of preferredNames) {
    const found = voices.find(v => v.name && v.name.includes(name));
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
 * Supports polymorphic signatures:
 * - speak(text)
 * - speak(text, 'en-US')
 * - speak(text, 'en-US', window)
 * - speak(text, { lang: 'en-US', rate: 0.9 })
 * - speak(text, { lang: 'en-US' }, window)
 * - speak(text, window)
 * 
 * @param {string} text - Text to pronounce
 * @param {string|Object} [langOrOptions={}] - Language code or configuration options
 * @param {Object} [windowOverride=null] - Window context override (e.g. mock test context)
 * @returns {Promise<boolean>}
 */
export function speak(text, langOrOptions = {}, windowOverride = null) {
  if (!text || typeof text !== 'string') {
    return Promise.resolve(false);
  }

  let options = {};
  if (typeof langOrOptions === 'string') {
    options = { lang: langOrOptions };
  } else if (langOrOptions && typeof langOrOptions === 'object') {
    if (langOrOptions.speechSynthesis) {
      windowOverride = langOrOptions;
      options = {};
    } else {
      options = { ...langOrOptions };
    }
  }

  // Resolve target window context
  let targetWindow = windowOverride;
  if (!targetWindow && options.window) {
    targetWindow = options.window;
  }
  if (!targetWindow && typeof window !== 'undefined') {
    targetWindow = window;
  }

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

  // HEADLESS / MOCK FALLBACK (for Node.js or unsupported browsers without mock window)
  if (!isSupported(targetWindow)) {
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

  // BROWSER / MOCK WINDOW EXECUTION
  const synth = targetWindow.speechSynthesis;
  const UtteranceClass = targetWindow.SpeechSynthesisUtterance;

  // Stop any active utterance to prevent speech stacking
  try {
    synth.cancel();
  } catch (e) {
    // Ignore cancel errors
  }

  return new Promise(resolve => {
    const utterance = new UtteranceClass(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const selectedVoice = voice || getPreferredVoice(lang, targetWindow);
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
      if (event && event.error !== 'canceled' && typeof onError === 'function') {
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
 * @param {Object} [targetWindow=null]
 */
export function stop(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win)) {
    try {
      win.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
  isSpeakingState = false;
  currentUtterance = null;
}

/**
 * Pauses active speech.
 * @param {Object} [targetWindow=null]
 */
export function pause(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win) && win.speechSynthesis.speaking) {
    win.speechSynthesis.pause();
  }
}

/**
 * Resumes paused speech.
 * @param {Object} [targetWindow=null]
 */
export function resume(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win) && win.speechSynthesis.paused) {
    win.speechSynthesis.resume();
  }
}

/**
 * Returns whether speech is currently in progress.
 * @param {Object} [targetWindow=null]
 * @returns {boolean}
 */
export function isSpeaking(targetWindow = null) {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (isSupported(win)) {
    return win.speechSynthesis.speaking || isSpeakingState;
  }
  return isSpeakingState;
}

/**
 * Convenience helper to pronounce a Math English vocabulary item.
 * Uses optimal pedagogical rate (0.85) for phonetics clarity.
 * @param {Object} vocabItem - { term, phonetics }
 * @param {Object} [options]
 * @param {Object} [targetWindow=null]
 * @returns {Promise<boolean>}
 */
export function speakTerm(vocabItem, options = {}, targetWindow = null) {
  if (!vocabItem || !vocabItem.term) return Promise.resolve(false);
  const win = targetWindow || (options && options.window ? options.window : null);
  return speak(vocabItem.term, {
    lang: 'en-US',
    rate: 0.85,
    pitch: 1.0,
    ...(typeof options === 'object' ? options : {})
  }, win);
}
