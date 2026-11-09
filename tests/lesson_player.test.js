/**
 * tests/lesson_player.test.js
 * Comprehensive Unit Test Suite for 5-Scene Bilingual Multimedia Player (Feature F3 & F4)
 * Milestone: M3 (5-Scene Player & Stepper)
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LessonPlayer } from '../src/components/LessonPlayer.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

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

describe('LessonPlayer: Initialization & Lifecycle', () => {
  it('instantiates with default options and mounts without throwing', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    assert.ok(player);
    assert.equal(player.currentSceneId, 1);
    assert.equal(player.language, 'dual');
    assert.ok(container.innerHTML.includes('lesson-player'));
    player.destroy();
  });

  it('resolves valid initial lesson by ID', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ 
      container, 
      lessonId: 'lesson-parabolic-arch' 
    });
    assert.equal(player.lesson.id, 'lesson-parabolic-arch');
    assert.equal(player.lesson.topic, 'quadratic');
    player.destroy();
  });

  it('falls back to first default lesson when lessonId is invalid or not found', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ 
      container, 
      lessonId: 'non-existent-lesson-id-12345' 
    });
    assert.ok(player.lesson);
    assert.equal(player.lesson.id, DEFAULT_LESSONS[0].id);
    player.destroy();
  });
});

describe('LessonPlayer: Stepper Navigation & Boundary Clamping', () => {
  it('F3.B1: clamps scene index below bounds (<1) to Scene 1', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    player.goToScene(0);
    assert.equal(player.currentSceneId, 1);
    player.goToScene(-10);
    assert.equal(player.currentSceneId, 1);
    player.prevScene(); // Already on scene 1
    assert.equal(player.currentSceneId, 1);
    player.destroy();
  });

  it('F3.B2: clamps scene index above bounds (>5) to Scene 5', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    player.goToScene(6);
    assert.equal(player.currentSceneId, 5);
    player.goToScene(999);
    assert.equal(player.currentSceneId, 5);
    player.destroy();
  });

  it('F3.B3: permits direct navigation to Scene 5 (skipping 1-4)', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    player.goToScene(5);
    assert.equal(player.currentSceneId, 5);
    const scene = player.getCurrentScene();
    assert.equal(scene.id, 5);
    assert.equal(scene.key, 'practice');
    player.destroy();
  });

  it('F3.B5: handles rapid consecutive scene navigation reliably', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    [2, 3, 4, 1, 5, 2, 4].forEach(idx => player.goToScene(idx));
    assert.equal(player.currentSceneId, 4);
    assert.equal(player.getCurrentScene().id, 4);
    player.destroy();
  });

  it('tracks completed scenes properly as user navigates', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container });
    assert.ok(player.completedScenes.has(1));
    player.goToScene(3);
    assert.ok(player.completedScenes.has(3));
    assert.equal(player.completedScenes.has(2), false); // 2 was skipped
    player.goToScene(2);
    assert.ok(player.completedScenes.has(2));
    player.destroy();
  });
});

describe('LessonPlayer: Tri-State Bilingual Subtitle Toggle (VI, EN, DUAL)', () => {
  it('F4.1-F4.4: correctly updates language mode and persists valid modes only', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, language: 'vi' });
    assert.equal(player.language, 'vi');
    
    player.setLanguage('en', false);
    assert.equal(player.language, 'en');

    player.setLanguage('dual', false);
    assert.equal(player.language, 'dual');

    // Invalid mode rejected
    player.setLanguage('fr', false);
    assert.equal(player.language, 'dual');
    player.destroy();
  });

  it('updates rendered content when switching to English mode (CLIL immersion)', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, language: 'en' });
    const html = container.innerHTML;
    assert.ok(!html.includes('🇻🇳 Lời thoại bài giảng (Tiếng Việt)'));
    assert.ok(html.includes('🇬🇧 Spoken Script (English CLIL)'));
    player.destroy();
  });

  it('updates rendered content when switching to Vietnamese mode', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({ container, language: 'vi' });
    const html = container.innerHTML;
    assert.ok(html.includes('🇻🇳 Lời thoại bài giảng (Tiếng Việt)'));
    assert.ok(!html.includes('🇬🇧 Spoken Script (English CLIL)'));
    player.destroy();
  });
});

describe('LessonPlayer: Inter-Component Event Integration', () => {
  it('invokes onStartQuiz callback when reaching Scene 5 and clicking CTA', () => {
    let quizLaunched = false;
    let quizLessonId = null;
    const container = createMockContainer();
    const player = new LessonPlayer({
      container,
      lessonId: 'lesson-bus-optimization',
      onStartQuiz: (id) => {
        quizLaunched = true;
        quizLessonId = id;
      }
    });

    player.goToScene(5);
    player.nextScene(); // Next from scene 5 triggers quiz
    assert.equal(quizLaunched, true);
    assert.equal(quizLessonId, 'lesson-bus-optimization');
    player.destroy();
  });

  it('invokes onBack callback when back button is clicked', () => {
    let backed = false;
    const container = createMockContainer();
    const player = new LessonPlayer({
      container,
      onBack: () => { backed = true; }
    });
    player.onBack();
    assert.equal(backed, true);
    player.destroy();
  });

  it('changes active lesson dynamically via setLesson()', () => {
    const container = createMockContainer();
    const player = new LessonPlayer({
      container,
      lessonId: 'lesson-lighthouse'
    });
    assert.equal(player.lesson.id, 'lesson-lighthouse');

    player.setLesson('lesson-parabolic-arch');
    assert.equal(player.lesson.id, 'lesson-parabolic-arch');
    assert.equal(player.currentSceneId, 1);
    assert.ok(container.innerHTML.includes('lesson-parabolic-arch') || container.innerHTML.includes('Parabol'));
    player.destroy();
  });
});
