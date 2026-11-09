# Progress — M3 It2 Simulation Guard & Regression Explorer

Last visited: 2026-11-09T04:02:30Z

## Status
Investigation completed:
1. Reviewer 1 Finding 2 verified: Scene 3 (Problem & Vocab) unconditionally rendered an unmounted `.simulation-mount-container` with uncompleted placeholder ("Đang nạp mô hình mô phỏng tham số SVG...") because `interactiveType` is present on all 5 scenes in `lessons.js` but `mountDynamicSubComponents()` returns early at Scene 3 for `VocabularyTable`.
2. Confirmed that guarding simulation rendering with `(scene.interactiveType && [2, 4].includes(this.currentSceneId))` strictly aligns with KHKT 5-scene pedagogy (Scene 2 Facts & Scene 4 Guidance), eliminates unmounted UI clutter in Scene 3, and cleans up Scenes 1 & 5.
3. Cross-checked all 19 test files and 175 E2E tests: zero tests depend on simulation containers in Scenes 1, 3, or 5. Tier 3 Pairwise (Pair 3) explicitly defines scenes 1, 3, 5 as having no simulation.
4. Synthesized unified patch resolving Challenger 2's 3 failing tests (`setLesson`, `triggerStartWorksheet`, and Scene 3 re-entry listener leak) alongside Reviewer 1's Finding 2.
5. Formulated end-to-end regression verification strategy ensuring 100% pass across all 298 unit/adversarial tests and 175 E2E tests (473 total tests).
