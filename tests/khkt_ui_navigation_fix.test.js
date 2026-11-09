/**
 * tests/khkt_ui_navigation_fix.test.js
 * Verification Test Suite for KHKT Presentation UI & Navigation Fixes
 * 
 * Verifies Requirements R1 - R4:
 * - R1: Logo ∑ dimensions 40x40px, aspect-ratio 1:1, 4 icon-free navigation items, studio & survey removed.
 * - R2: KhktShowcasePage 7 steps and scientific foundations render without any 'undefined' strings.
 * - R3: CollectionExplorer .explorer-hero left alignment, card-media-wrapper height 230-240px with contain.
 * - R4: LessonPlayer scene badge ('Màn 1') adequate size and padding without text clipping.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Header } from '../src/components/Header.js';
import { KhktShowcasePage } from '../src/components/KhktShowcasePage.js';
import { CollectionExplorer } from '../src/components/CollectionExplorer.js';
import { LessonPlayer } from '../src/components/LessonPlayer.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';
import { SEVEN_STEP_PEDAGOGY, SCIENTIFIC_FOUNDATIONS } from '../src/data/khkt_data.js';

function createMockContainer() {
  const store = { html: '' };
  return {
    set innerHTML(val) { store.html = val; },
    get innerHTML() { return store.html; },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  };
}

describe('R1: Header Navigation & Logo Verification', () => {
  it('renders logo ∑ with square 40x40px aspect-ratio 1:1 styling', () => {
    const header = new Header();
    const html = header.renderHtml();

    // Must have standard square styling
    assert.ok(html.includes('width: 40px; height: 40px;'), 'Must have inline width and height of 40px');
    assert.ok(html.includes('aspect-ratio: 1 / 1;'), 'Must have aspect-ratio: 1 / 1');
    assert.ok(html.includes('border-radius: 12px;'), 'Must have 12px border radius');
    assert.ok(html.includes('display: flex; align-items: center; justify-content: center;'), 'Must be centered flex');
    assert.ok(html.includes('∑'), 'Must display sigma symbol');
  });

  it('renders exactly 4 navigation tabs without icons on desktop', () => {
    const header = new Header({ activeTab: 'explore', language: 'vi' });
    const html = header.renderHtml();

    // 4 desktop tabs must exist
    assert.ok(html.includes('data-nav="explore"'), 'Explore tab must exist');
    assert.ok(html.includes('data-nav="player"'), 'Player tab must exist');
    assert.ok(html.includes('data-nav="quiz"'), 'Quiz tab must exist');
    assert.ok(html.includes('data-nav="showcase"'), 'Showcase tab must exist');

    // Studio and Survey must NOT exist
    assert.ok(!html.includes('data-nav="studio"'), 'Studio tab must be removed');
    assert.ok(!html.includes('data-nav="survey"'), 'Survey tab must be removed');
    assert.ok(!html.includes('Biên soạn'), 'Biên soạn text must not be in navigation');
    assert.ok(!html.includes('Khảo sát'), 'Khảo sát text must not be in navigation');

    // Desktop nav buttons must NOT have icon spans
    const desktopNavMatch = html.match(/<nav class="nav-desktop[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(desktopNavMatch, 'Desktop nav must exist');
    const desktopNavHtml = desktopNavMatch[1];
    assert.ok(!desktopNavHtml.includes('nav-icon'), 'Desktop nav buttons must have no nav-icon spans');
    assert.ok(!desktopNavHtml.includes('▶️'), 'Desktop nav buttons must not contain emoji icons');
    assert.ok(!desktopNavHtml.includes('📝'), 'Desktop nav buttons must not contain emoji icons');
    assert.ok(!desktopNavHtml.includes('<svg'), 'Desktop nav buttons must not contain svg icons');
  });

  it('mobile drawer renders exactly the 4 navigation tabs without icons', () => {
    const header = new Header({ activeTab: 'explore', language: 'vi' });
    const html = header.renderHtml();

    const mobileDrawerMatch = html.match(/<div id="mobile-nav-drawer"[^>]*>([\s\S]*?)<\/div>\s*$/);
    assert.ok(mobileDrawerMatch, 'Mobile drawer must exist');
    const mobileDrawerHtml = mobileDrawerMatch[1];

    assert.ok(mobileDrawerHtml.includes('data-nav="explore"'));
    assert.ok(mobileDrawerHtml.includes('data-nav="player"'));
    assert.ok(mobileDrawerHtml.includes('data-nav="quiz"'));
    assert.ok(mobileDrawerHtml.includes('data-nav="showcase"'));

    assert.ok(!mobileDrawerHtml.includes('data-nav="studio"'));
    assert.ok(!mobileDrawerHtml.includes('data-nav="survey"'));
    assert.ok(!mobileDrawerHtml.includes('<svg'), 'Mobile drawer navigation links must not contain svg icons');
    assert.ok(!mobileDrawerHtml.includes('▶️'), 'Mobile drawer links must not contain emoji icons');
    assert.ok(!mobileDrawerHtml.includes('📝'), 'Mobile drawer links must not contain emoji icons');
  });

  it('displays the exact labels: Bài học, Thực hành, Bài tập, Giới thiệu đề án in default/vi mode', () => {
    const header = new Header({ activeTab: 'explore', language: 'vi' });
    const html = header.renderHtml();

    assert.ok(html.includes('<span>Bài học</span>'), 'Must contain <span>Bài học</span>');
    assert.ok(html.includes('<span>Thực hành</span>'), 'Must contain <span>Thực hành</span>');
    assert.ok(html.includes('<span>Bài tập</span>'), 'Must contain <span>Bài tập</span>');
    assert.ok(html.includes('<span>Giới thiệu đề án</span>'), 'Must contain <span>Giới thiệu đề án</span>');
  });

  it('includes responsive hiding classes on mobile menu toggle and drawer', () => {
    const header = new Header({ activeTab: 'explore', language: 'vi' });
    const html = header.renderHtml();

    assert.ok(html.includes('mobile-menu-toggle md:hidden'), 'Toggle button must have md:hidden class');
    assert.ok(html.includes('mobile-nav-drawer md:hidden'), 'Drawer must have md:hidden class');
    assert.ok(html.includes('nav-desktop hidden md:flex'), 'Desktop nav must have md:flex class');
  });

  it('updateActiveNavUI correctly synchronizes active and text-slate-700 on mobile links', () => {
    const createMockLink = (tab, initialClasses) => {
      const cls = new Set(initialClasses);
      return {
        tab,
        getAttribute(k) { return k === 'data-nav' ? this.tab : null; },
        classList: {
          add(c) { cls.add(c); },
          remove(c) { cls.delete(c); },
          contains(c) { return cls.has(c); }
        }
      };
    };

    const linkExplore = createMockLink('explore', ['active']);
    const linkPlayer = createMockLink('player', ['text-slate-700']);
    const mockContainer = {
      querySelectorAll: (sel) => {
        if (sel.includes('.mobile-nav-link')) return [linkExplore, linkPlayer];
        return [];
      }
    };
    const header = new Header({ activeTab: 'player' });
    header.container = mockContainer;
    header.updateActiveNavUI();

    assert.ok(linkPlayer.classList.contains('active'), 'Player link should now be active');
    assert.ok(!linkPlayer.classList.contains('text-slate-700'), 'Player link should not have text-slate-700');
    assert.ok(!linkExplore.classList.contains('active'), 'Explore link should no longer be active');
    assert.ok(linkExplore.classList.contains('text-slate-700'), 'Explore link should now have text-slate-700');
  });

  it('brand-link does not register duplicate click listeners when mounting header', () => {
    let navigateCallCount = 0;
    const header = new Header({
      onNavigate: () => { navigateCallCount++; }
    });

    const brandListeners = [];
    const mockBrandLink = {
      addEventListener: (evt, fn) => {
        if (evt === 'click') brandListeners.push(fn);
      }
    };
    const mockButton = {
      getAttribute: () => 'player',
      addEventListener: () => {}
    };

    const mockContainer = {
      querySelector: (sel) => {
        if (sel === '.brand-link') return mockBrandLink;
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel === 'button[data-nav]') return [mockButton];
        return [];
      }
    };

    header.container = mockContainer;
    header.bindDOMEvents();

    assert.equal(brandListeners.length, 1, 'brand-link should only have 1 click listener registered, not double-bound');
    brandListeners[0]({ preventDefault: () => {} });
    assert.equal(navigateCallCount, 1, 'Clicking brand-link should trigger onNavigate exactly once');
  });

  it('updateActiveNavUI synchronizes aria-current on mobile drawer links', () => {
    const createMockLink = (tab, initialClasses) => {
      const cls = new Set(initialClasses);
      const attrs = new Map();
      return {
        tab,
        getAttribute(k) { return k === 'data-nav' ? this.tab : attrs.get(k); },
        setAttribute(k, v) { attrs.set(k, String(v)); },
        classList: {
          add(c) { cls.add(c); },
          remove(c) { cls.delete(c); },
          contains(c) { return cls.has(c); }
        }
      };
    };

    const linkExplore = createMockLink('explore', ['active']);
    const linkPlayer = createMockLink('player', ['text-slate-700']);
    const mockContainer = {
      querySelectorAll: (sel) => {
        if (sel.includes('.mobile-nav-link')) return [linkExplore, linkPlayer];
        return [];
      }
    };
    const header = new Header({ activeTab: 'player' });
    header.container = mockContainer;
    header.updateActiveNavUI();

    assert.equal(linkPlayer.getAttribute('aria-current'), 'page', 'Active mobile link must have aria-current="page"');
    assert.equal(linkExplore.getAttribute('aria-current'), 'false', 'Inactive mobile link must have aria-current="false"');
  });
});

describe('R2: Showcase Page Undefined Text Elimination', () => {
  it('renders all 7 pedagogical steps without any "undefined" text in output', () => {
    const container = createMockContainer();
    const showcase = new KhktShowcasePage({ container, language: 'vi' });

    assert.ok(!container.innerHTML.includes('undefined'), 'Showcase HTML must NEVER contain the string "undefined"');
    
    // Verify each of the 7 steps has its real title
    for (const step of SEVEN_STEP_PEDAGOGY) {
      assert.ok(
        container.innerHTML.includes(step.nameVi),
        `Must contain title for step ${step.step}: ${step.nameVi}`
      );
    }
  });

  it('renders all sections (pedagogy, empirical, theory, circular84, verification) without "undefined"', () => {
    const container = createMockContainer();
    const showcase = new KhktShowcasePage({ container, language: 'dual' });

    const sections = ['pedagogy', 'empirical', 'theory', 'circular84', 'verification'];
    for (const section of sections) {
      showcase.activeSection = section;
      showcase.render();
      assert.ok(
        !container.innerHTML.includes('undefined'),
        `Section "${section}" must not contain "undefined"`
      );
    }
  });

  it('handles missing or partial properties gracefully with fallback', () => {
    const container = createMockContainer();
    const showcase = new KhktShowcasePage({ container, language: 'en' });
    assert.ok(!container.innerHTML.includes('undefined'), 'English mode must not contain "undefined"');
  });

  it('guarantees dual mode never interpolates "undefined (English Name)" when nameVi is absent', () => {
    const container = createMockContainer();
    const showcase = new KhktShowcasePage({ container, language: 'dual' });
    
    // Check all sections in dual mode
    const sections = ['pedagogy', 'theory', 'circular84'];
    for (const section of sections) {
      showcase.activeSection = section;
      showcase.render();
      assert.ok(!container.innerHTML.includes('undefined'), `Dual section "${section}" must not contain "undefined"`);
    }
  });

  it('handles back-home and start-learning navigation via global fallback when onNavigate is omitted', () => {
    let capturedEvent = null;
    const origWindow = globalThis.window;

    globalThis.window = {
      addEventListener: () => {},
      dispatchEvent: (evt) => { capturedEvent = evt; return true; }
    };

    try {
      const container = createMockContainer();
      const showcase = new KhktShowcasePage({ container, language: 'vi' });

      // Trigger navigate
      showcase.navigate('explore');
      assert.ok(capturedEvent, 'Must dispatch CustomEvent when window exists');
      assert.equal(capturedEvent.detail?.tab, 'explore', 'Must have tab: explore in detail');

      showcase.navigate('player');
      assert.equal(capturedEvent.detail?.tab, 'player', 'Must have tab: player in detail');
    } finally {
      if (origWindow !== undefined) {
        globalThis.window = origWindow;
      } else {
        delete globalThis.window;
      }
    }
  });

  it('falls back to pedagogy section if activeSection is invalid', () => {
    const container = createMockContainer();
    const showcase = new KhktShowcasePage({ container, language: 'vi' });
    showcase.activeSection = 'non-existent-section';
    showcase.render();

    assert.equal(showcase.activeSection, 'pedagogy', 'Must fall back to pedagogy when given invalid section');
    assert.ok(container.innerHTML.includes('Quy Trình 7 Bước Chuẩn Hóa'), 'Must render pedagogy section content');
  });

  it('navigate does not invoke window.app.handleNavigate when onNavigate callback is provided', () => {
    let appNavigateCount = 0;
    let directNavigateCount = 0;
    const origWindow = globalThis.window;

    globalThis.window = {
      app: {
        handleNavigate: () => { appNavigateCount++; }
      },
      dispatchEvent: () => true
    };

    try {
      const container = createMockContainer();
      const showcase = new KhktShowcasePage({
        container,
        language: 'vi',
        onNavigate: () => { directNavigateCount++; }
      });

      showcase.navigate('explore');
      assert.equal(directNavigateCount, 1, 'onNavigate callback should be invoked once');
      assert.equal(appNavigateCount, 0, 'window.app.handleNavigate should NOT be invoked when onNavigate is provided');
    } finally {
      if (origWindow !== undefined) {
        globalThis.window = origWindow;
      } else {
        delete globalThis.window;
      }
    }
  });
});

describe('R3: Collection Explorer Hero Alignment & Card Image Container', () => {
  it('renders .explorer-hero with text-left and items-start alignment classes', () => {
    const container = createMockContainer();
    const explorer = new CollectionExplorer({ container, lessons: DEFAULT_LESSONS });

    const html = container.innerHTML;
    assert.ok(html.includes('explorer-hero text-left'), '.explorer-hero must have text-left class');
    assert.ok(html.includes('items-start'), '.explorer-hero must have items-start alignment');
    assert.ok(html.includes('DỰ ÁN KHKT 2026-2027 • TRƯỜNG THPT TRẦN VĂN KIẾT'), 'Must have KHKT school title');
  });

  it('renders card media wrapper with 235px height (between 230-240px) and object-fit contain', () => {
    const explorer = new CollectionExplorer({ lessons: DEFAULT_LESSONS });
    const cardHtml = explorer.renderCardHtml(DEFAULT_LESSONS[0]);

    // Height must be in 230-240px range
    assert.ok(cardHtml.includes('height: 235px;'), 'Card media wrapper must have height: 235px');
    assert.ok(cardHtml.includes('object-fit: contain;'), 'Card image must use object-fit: contain');
    assert.ok(cardHtml.includes('max-height: 100%;'), 'Card image must have max-height: 100%');
    assert.ok(cardHtml.includes('max-width: 100%;'), 'Card image must have max-width: 100%');
  });

  it('places badges in corners without covering central artwork', () => {
    const explorer = new CollectionExplorer({ lessons: DEFAULT_LESSONS });
    const cardHtml = explorer.renderCardHtml(DEFAULT_LESSONS[0]);

    assert.ok(cardHtml.includes('top: 10px; left: 10px;'), 'Topic badge must be at top-left corner');
    assert.ok(cardHtml.includes('top: 10px; right: 10px;'), 'Difficulty badge must be at top-right corner');
    assert.ok(cardHtml.includes('bottom: 10px; right: 10px;'), 'Duration badge must be at bottom-right corner');
  });

  it('clicking .btn-go-showcase-page invokes onNavigate callback without TypeError', () => {
    let clickedHandler = null;
    const btn = {
      addEventListener(evt, fn) {
        if (evt === 'click') clickedHandler = fn;
      }
    };
    const mockContainer = {
      innerHTML: '',
      querySelector(sel) {
        if (sel === '.btn-go-showcase-page') return btn;
        return null;
      },
      querySelectorAll() { return []; }
    };

    let targetTab = null;
    const explorer = new CollectionExplorer({
      container: mockContainer,
      onNavigate: (tab) => { targetTab = tab; }
    });

    assert.ok(typeof clickedHandler === 'function', 'Click handler must be bound to showcase button');
    assert.doesNotThrow(() => {
      clickedHandler();
    }, 'Showcase button click must NOT throw TypeError');
    assert.equal(targetTab, 'showcase', 'Must successfully navigate to showcase tab');
  });

  it('verifies .explorer-hero CSS contains width: 100% and margin-left: 0', () => {
    const cssPath = path.resolve('public/assets/css/style.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('.explorer-hero'), 'CSS must define .explorer-hero');
    assert.ok(css.includes('width: 100% !important;'), '.explorer-hero must have width: 100% !important');
    assert.ok(css.includes('margin-left: 0 !important;'), '.explorer-hero must have margin-left: 0 !important');
    assert.ok(css.includes('margin-right: 0 !important;'), '.explorer-hero must have margin-right: 0 !important');
    assert.ok(css.includes('height: 235px !important;'), '.card-media-wrapper must have 235px height in CSS');
    assert.ok(css.includes('.whitespace-nowrap'), 'CSS must define .whitespace-nowrap utility');
    assert.ok(css.includes('.flex-shrink-0'), 'CSS must define .flex-shrink-0 utility');
    assert.ok(css.includes('.md\\:block'), 'CSS must define .md:block utility');
    assert.ok(css.includes('.lg\\:block'), 'CSS must define .lg:block utility');
  });
});

describe('R4: Lesson Player Scene Badge Clipping Fix', () => {
  it('renders scene badge for Màn 1 without rigid w-7 h-7 constraints', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, lessonId: 'lesson-lighthouse' });

    const html = container.innerHTML;
    // Must NOT have rigid w-7 h-7
    assert.ok(!html.includes('w-7 h-7 rounded-lg bg-blue-900 text-white font-extrabold text-xs">\n                Màn'),
      'Scene badge must not use w-7 h-7 which clips "Màn 1" text');

    // Must have adequate padding, flex-shrink: 0, and min-width
    assert.ok(html.includes('Màn 1'), 'Must render "Màn 1" text');
    assert.ok(html.includes('px-3 py-1'), 'Must have adequate horizontal and vertical padding');
    assert.ok(html.includes('whitespace-nowrap'), 'Must prevent awkward line-wrapping');
    assert.ok(html.includes('flex-shrink-0') || html.includes('flex-shrink: 0'), 'Must prevent flex shrinkage');
    player.destroy();
  });

  it('renders all 5 scenes without badge text clipping', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, lessonId: 'lesson-lighthouse' });

    for (let sceneId = 1; sceneId <= 5; sceneId++) {
      player.currentSceneId = sceneId;
      const sceneHtml = player.renderSceneViewportHtml();
      assert.ok(sceneHtml.includes(`Màn ${sceneId}`), `Must contain Màn ${sceneId}`);
      assert.ok(sceneHtml.includes('px-3 py-1'), 'Must have px-3 py-1 padding');
    }
    player.destroy();
  });

  it('never renders "Màn undefined" even when custom lesson omits scene.id', () => {
    const container = createMockContainer();
    const customLesson = {
      id: 'custom-lesson-1',
      titleVi: 'Bài toán thực tế',
      titleEn: 'Real-world problem',
      topic: 'trigonometry',
      scenes: [
        {
          sceneNumber: 1, // Notice sceneNumber instead of id
          key: 'context',
          titleVi: 'Bối cảnh',
          titleEn: 'Context',
          contentVi: 'Nội dung tiếng Việt',
          contentEn: 'English content'
        }
      ]
    };

    const player = new LessonPlayer({ container, lessonId: 'custom-lesson-1' });
    player.lesson = customLesson;
    player.currentSceneId = 1;
    const sceneHtml = player.renderSceneViewportHtml();

    assert.ok(!sceneHtml.includes('Màn undefined'), 'Must NEVER render "Màn undefined"');
    assert.ok(sceneHtml.includes('Màn 1'), 'Must fall back to sceneNumber or currentSceneId: "Màn 1"');
    player.destroy();
  });

  it('narration speech safely joins bilingual scripts without speaking "undefined"', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, lessonId: 'lesson-lighthouse', language: 'dual' });

    // Custom scene with missing contentVi
    player.lesson = {
      id: 'test-lesson',
      titleVi: 'Test',
      scenes: [
        {
          id: 1,
          key: 'context',
          titleVi: 'Scene 1',
          contentEn: 'Only English content available.'
          // contentVi is omitted
        }
      ]
    };

    let spokenText = null;
    const origWindow = globalThis.window;
    globalThis.window = {
      speechSynthesis: {
        speak: (utterance) => { spokenText = utterance?.text; },
        cancel: () => {},
        speaking: false,
        getVoices: () => []
      },
      SpeechSynthesisUtterance: function(text) {
        this.text = text;
      }
    };

    try {
      player.toggleNarrationSpeech();
      assert.ok(spokenText, 'Should have spoken text');
      assert.equal(spokenText, 'Only English content available.', 'Should speak English content without undefined prefix');
      assert.ok(!spokenText.includes('undefined'), 'Spoken text must NEVER contain "undefined"');
    } finally {
      if (origWindow !== undefined) {
        globalThis.window = origWindow;
      } else {
        delete globalThis.window;
      }
      player.destroy();
    }
  });

  it('custom lesson without scene.id renders scene-panel id and aria-labelledby matching sceneNumber', () => {
    const container = createMockContainer();
    const customLesson = {
      id: 'custom-lesson-2',
      titleVi: 'Bài toán',
      scenes: [
        {
          sceneNumber: 3,
          key: 'problem',
          titleVi: 'Vấn đề & Từ vựng',
          contentVi: 'Nội dung'
        }
      ]
    };
    const player = new LessonPlayer({ container, lessonId: 'custom-lesson-2' });
    player.lesson = customLesson;
    player.currentSceneId = 3;
    const sceneHtml = player.renderSceneViewportHtml();

    assert.ok(!sceneHtml.includes('scene-panel-undefined'), 'Must never render scene-panel-undefined');
    assert.ok(!sceneHtml.includes('step-tab-undefined'), 'Must never render step-tab-undefined');
    assert.ok(sceneHtml.includes('id="scene-panel-3"'), 'Panel ID must fall back to sceneNumber: scene-panel-3');
    assert.ok(sceneHtml.includes('aria-labelledby="step-tab-3"'), 'Aria-labelledby must fall back to sceneNumber: step-tab-3');
    player.destroy();
  });

  it('custom lesson with sceneNumber: 5 properly renders scene 5 worksheet CTA', () => {
    const container = createMockContainer();
    const customLesson = {
      id: 'custom-lesson-5',
      titleVi: 'Thực hành',
      scenes: [
        {
          sceneNumber: 5,
          key: 'practice',
          titleVi: 'Thực hành & Kết luận',
          contentVi: 'Nội dung tổng kết'
        }
      ]
    };
    const player = new LessonPlayer({ container, lessonId: 'custom-lesson-5' });
    player.lesson = customLesson;
    player.currentSceneId = 5;
    const sceneHtml = player.renderSceneViewportHtml();

    assert.ok(sceneHtml.includes('scene-practice-cta'), 'Must render Scene 5 CTA even when scene.id is missing');
    assert.ok(sceneHtml.includes('btn-launch-worksheet'), 'Must render launch worksheet button in Scene 5');
    player.destroy();
  });

  it('mobile drawer and header topbar have full-width layout classes preventing horizontal cutoff', () => {
    const header = new Header({ activeTab: 'explore', language: 'vi' });
    const html = header.renderHtml();

    assert.ok(html.includes('header-topbar'), 'Header must include header-topbar class');
    assert.ok(html.includes('w-full flex items-center justify-between'), 'Top bar must have w-full to span full width');
    assert.ok(html.includes('id="mobile-nav-drawer" class="mobile-nav-drawer md:hidden xl:hidden w-full'), 'Drawer must have w-full class');

    const cssPath = path.resolve(process.cwd(), 'public/assets/css/style.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('flex-direction: column;'), 'CSS .app-header must be column-oriented to stack drawer vertically under header');
    assert.ok(css.includes('.mobile-nav-drawer.open {\n  display: block !important;\n  width: 100%;\n}'), 'CSS .mobile-nav-drawer.open must take 100% width');
  });
});

