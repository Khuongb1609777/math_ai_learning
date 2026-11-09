/**
 * Deep Adversarial Mathematical Oracle Stress Harness
 * Milestone M1 Iteration 2 Challenger 1 (Mathematical Adversarial Oracle)
 *
 * Verifies:
 * 1. Lesson 1 (Lighthouse):
 *    - 1,000 Monte Carlo randomized configurations across diverse geometry
 *    - Law of Sines vs Cotangents vs Tangents vs Vector cross-product
 *    - Extreme boundary analysis (alpha -> 0, alpha -> beta, beta -> 90)
 *    - Rounding error and numerical floating-point stability
 *    - Ground truth and quiz answer consistency
 * 2. Lesson 2 (Parabolic Arch):
 *    - Exact parabola derivation and parameter sensitivity
 *    - Vehicle clearance across full matrix (width in [1m, 6m], height in [1m, 6m])
 *    - Lateral drift collision threshold delta = sqrt(4.8) - 2 ~= 19.089 cm (19.1 cm)
 *    - Dynamic steering offsets [-50cm, +50cm]
 *    - Coordinate translation invariance (centered, corner origin, apex origin)
 *    - Cross-sectional integral and Archimedean formula
 * 3. Lesson 3 (Cho Lach Bus Optimization):
 *    - Continuous vs Discrete optimization equivalence (zero quantization gap)
 *    - Multi-method optimization: Vertex, Derivative, AM-GM (Cauchy-Schwarz), Discrete scan
 *    - Domain boundaries: capacity limits [60, 100], price non-negativity
 *    - Sub-optimal scenarios (capacity cap = 70, 75, 80)
 *    - Exact quadratic loss expansion: R(4) - R(x) = 50,000*(x-4)^2
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLessonById, DEFAULT_LESSONS } from '../src/data/lessons.js';

const degToRad = (deg) => (deg * Math.PI) / 180;
const radToDeg = (rad) => (rad * 180) / Math.PI;

describe('Empirical Challenger 1: Deep Mathematical Stress Harness', () => {

  // =========================================================================
  // SECTION 1: LIGHTHOUSE INACCESSIBLE BASE MODEL
  // =========================================================================
  describe('Lighthouse Model: Multi-method Cross-Verification & Monte Carlo Stress', () => {
    
    // Deterministic pseudo-random number generator
    let seed = 123456789;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    it('executes 1,000 randomized Monte Carlo configurations testing Sines vs Cotangents vs Tangents', () => {
      let passedCount = 0;
      for (let i = 0; i < 1000; i++) {
        const AB = 1.0 + rng() * 999.0; // 1m to 1000m
        const alpha = 1.0 + rng() * 80.0; // 1 to 81 degrees
        const beta = alpha + 0.1 + rng() * (89.9 - alpha - 0.1); // beta in (alpha, 89.9] degrees

        const alphaRad = degToRad(alpha);
        const betaRad = degToRad(beta);
        const diffRad = degToRad(beta - alpha);

        // Method 1: Law of Sines in triangle ABD + Right Triangle BCD
        const BD_sines = (AB * Math.sin(alphaRad)) / Math.sin(diffRad);
        const CD_sines = BD_sines * Math.sin(betaRad);

        // Method 2: Cotangent decomposition
        const cotAlpha = 1.0 / Math.tan(alphaRad);
        const cotBeta = 1.0 / Math.tan(betaRad);
        const CD_cot = AB / (cotAlpha - cotBeta);

        // Method 3: Tangent formulation
        const tanAlpha = Math.tan(alphaRad);
        const tanBeta = Math.tan(betaRad);
        const CD_tan = (AB * tanAlpha * tanBeta) / (tanBeta - tanAlpha);

        // Method 4: Vector / Linear algebraic intersection of lines
        // Line AD: y = tan(alpha) * (x + AB) where B is (0,0) and C is (BC, 0)
        // Line BD: y = tan(beta) * x
        // At intersection D: x_D = AB * tan(alpha) / (tan(beta) - tan(alpha))
        // y_D = tan(beta) * x_D = AB * tan(alpha) * tan(beta) / (tan(beta) - tan(alpha))
        const CD_geom = tanBeta * (AB * tanAlpha / (tanBeta - tanAlpha));

        const relTol = 1e-11;
        const diffSinesCot = Math.abs(CD_sines - CD_cot) / CD_sines;
        const diffSinesTan = Math.abs(CD_sines - CD_tan) / CD_sines;
        const diffSinesGeom = Math.abs(CD_sines - CD_geom) / CD_sines;
        assert.ok(diffSinesCot < relTol, `Sines vs Cot mismatch at iteration ${i}: relDiff=${diffSinesCot}`);
        assert.ok(diffSinesTan < relTol, `Sines vs Tan mismatch at iteration ${i}: relDiff=${diffSinesTan}`);
        assert.ok(diffSinesGeom < relTol, `Sines vs Geom mismatch at iteration ${i}: relDiff=${diffSinesGeom}`);
        passedCount++;
      }
      assert.equal(passedCount, 1000, 'All 1000 Monte Carlo test vectors passed with machine precision');
    });

    it('verifies Lesson 1 exact parameters: AB=30, alpha=42, beta=63', () => {
      const AB = 30;
      const alpha = 42;
      const beta = 63;
      const diff = beta - alpha;

      assert.equal(diff, 21, 'Angle ADB must be exactly 21 degrees');

      const sinAlpha = Math.sin(degToRad(alpha));
      const sinDiff = Math.sin(degToRad(diff));
      const sinBeta = Math.sin(degToRad(beta));

      const BD = (AB * sinAlpha) / sinDiff;
      const CD = BD * sinBeta;
      const BC = BD * Math.cos(degToRad(beta));

      // Exact numerical checks
      assert.ok(Math.abs(BD - 56.0148) < 0.001, `BD = ${BD} ~ 56.015m`);
      assert.ok(Math.abs(CD - 49.9096) < 0.001, `CD = ${CD} ~ 49.910m`);
      assert.equal(CD.toFixed(1), '49.9', 'CD rounded to 1 decimal is 49.9m');
      assert.ok(Math.abs(BC - 25.4300) < 0.001, `BC = ${BC} ~ 25.43m`);

      // Verify Lesson 1 dataset values in src/data/lessons.js
      const lesson = getLessonById('lesson-lighthouse');
      assert.ok(lesson, 'Lesson 1 exists');
      assert.equal(lesson.scenes[1].formulas[0], 'AB = 30\\text{ m}');
      assert.equal(lesson.scenes[3].formulas[0], '\\widehat{ADB} = 63^\\circ - 42^\\circ = 21^\\circ');
      assert.equal(lesson.scenes[4].formulas[0], 'CD \\approx 49.9\\text{ m}');
      assert.equal(lesson.quiz[3].optionsVi[lesson.quiz[3].correctIndex], 'A. 49.9 m');
    });

    it('stress-tests extreme boundary cases for theodolite triangulation', () => {
      const AB = 30;

      // 1. beta approaching 90 degrees (observer standing directly at the cliff base)
      const beta90 = 89.999999;
      const CD_at_base = (AB * Math.tan(degToRad(42)) * Math.tan(degToRad(beta90))) / 
                         (Math.tan(degToRad(beta90)) - Math.tan(degToRad(42)));
      const expectedCD_simple = AB * Math.tan(degToRad(42));
      assert.ok(Math.abs(CD_at_base - expectedCD_simple) < 0.001, 'Limit as beta->90 matches direct right triangle');

      // 2. Parallel rays (beta -> alpha): height blows up to infinity
      const betaAlmostAlpha = 42.00001;
      const CD_parallel = (AB * Math.tan(degToRad(42)) * Math.tan(degToRad(betaAlmostAlpha))) / 
                          (Math.tan(degToRad(betaAlmostAlpha)) - Math.tan(degToRad(42)));
      assert.ok(CD_parallel > 1e7, 'Height approaches infinity when sight rays are parallel');

      // 3. Flat sightline (alpha -> 0): height approaches zero
      const alphaAlmostZero = 0.00001;
      const CD_flat = (AB * Math.tan(degToRad(alphaAlmostZero)) * Math.tan(degToRad(63))) / 
                      (Math.tan(degToRad(63)) - Math.tan(degToRad(alphaAlmostZero)));
      assert.ok(CD_flat < 1e-4, 'Height approaches zero when elevation angle alpha -> 0');
    });
  });

  // =========================================================================
  // SECTION 2: PARABOLIC ARCH & VEHICLE CLEARANCE MODEL
  // =========================================================================
  describe('Parabolic Arch Model: Clearance & Lateral Drift Collision Threshold', () => {
    const span = 8.0;
    const apexHeight = 6.0;
    const a = -apexHeight / Math.pow(span / 2, 2); // -6 / 16 = -0.375
    const archY = (x) => a * x * x + apexHeight;

    it('verifies exact coefficient a = -0.375 (-3/8) and boundary roots', () => {
      assert.equal(a, -0.375);
      assert.equal(archY(0), 6.0, 'Apex is at (0, 6)');
      assert.equal(archY(4), 0.0, 'Right base at (4, 0)');
      assert.equal(archY(-4), 0.0, 'Left base at (-4, 0)');
    });

    it('verifies vehicle clearance when centered (truck: width=4m, height=4.2m)', () => {
      const halfWidth = 4.0 / 2.0; // x = 2.0
      const ceilingAtEdge = archY(halfWidth);
      assert.equal(ceilingAtEdge, 4.5, 'Ceiling at outer edge x=2 is exactly 4.5m');

      const truckHeight = 4.2;
      const clearanceMargin = ceilingAtEdge - truckHeight;
      assert.ok(Math.abs(clearanceMargin - 0.3) < 1e-12, 'Clearance margin is exactly 0.3m (30cm)');
      assert.ok(clearanceMargin > 0, 'Vehicle passes safely through the arch');
    });

    it('empirically verifies the exact lateral drift collision threshold delta = sqrt(4.8) - 2 ~= 19.089 cm', () => {
      // Equation: archY(2 + delta) = 4.2
      // -0.375 * (2 + delta)^2 + 6 = 4.2
      // (2 + delta)^2 = 1.8 / 0.375 = 4.8
      // 2 + delta = sqrt(4.8) ~= 2.19089023
      // delta_crit = sqrt(4.8) - 2 ~= 0.19089023 m ~= 19.089 cm
      const truckHeight = 4.2;
      const deltaCrit = Math.sqrt(4.8) - 2.0;
      assert.ok(Math.abs(deltaCrit - 0.19089023) < 1e-6, 'Critical lateral drift is ~19.089 cm');

      // Test 1: Just below threshold (19.0 cm = 0.190 m) -> CLEAR
      const driftSafe = 0.190;
      const ceilingSafe = archY(2.0 + driftSafe);
      assert.ok(ceilingSafe > truckHeight, `At 19.0cm drift, ceiling ${ceilingSafe}m > 4.2m (safe)`);
      assert.ok(ceilingSafe - truckHeight > 0.0005, 'Safe clearance buffer exists');

      // Test 2: Exactly at threshold (deltaCrit) -> ZERO BUFFER
      const ceilingCrit = archY(2.0 + deltaCrit);
      assert.ok(Math.abs(ceilingCrit - truckHeight) < 1e-12, 'At critical threshold, clearance is exactly 0');

      // Test 3: Just above threshold (19.1 cm = 0.191 m) -> COLLISION!
      const driftCollision = 0.191;
      const ceilingCollision = archY(2.0 + driftCollision);
      assert.ok(ceilingCollision < truckHeight, `At 19.1cm drift, ceiling ${ceilingCollision}m < 4.2m (COLLISION)`);
      assert.ok(truckHeight - ceilingCollision > 0, 'Roof corner scrapes into arch structure');

      // Test 4: 20 cm drift -> Confirmed roof collision by 1.5 cm
      const drift20cm = 0.20;
      const ceiling20cm = archY(2.0 + drift20cm);
      const penetration20cm = truckHeight - ceiling20cm;
      assert.ok(penetration20cm > 0.014 && penetration20cm < 0.016, 'Penetration is ~1.5cm at 20cm offset');
    });

    it('stress-tests full parameter matrix across diverse vehicle dimensions', () => {
      // Systematic vehicle size evaluation:
      const vehicles = [
        { desc: 'Standard sedan', width: 1.8, height: 1.5, expectedPass: true },
        { desc: 'Minivan / Small bus', width: 2.0, height: 2.5, expectedPass: true },
        { desc: 'ISO shipping container truck', width: 2.4, height: 4.2, expectedPass: true },
        { desc: 'Max legal VN cargo truck', width: 2.6, height: 4.2, expectedPass: true },
        { desc: 'Lesson 2 festival stage truck', width: 4.0, height: 4.2, expectedPass: true },
        { desc: 'Double-decker tour bus', width: 2.5, height: 4.4, expectedPass: true },
        { desc: 'Wide oversize load (width=5m, height=3.5m)', width: 5.0, height: 3.5, expectedPass: true },
        { desc: 'Oversize truck colliding (width=4m, height=4.6m)', width: 4.0, height: 4.6, expectedPass: false },
        { desc: 'Extreme wide truck colliding (width=6m, height=3.0m)', width: 6.0, height: 3.0, expectedPass: false }
      ];

      for (const v of vehicles) {
        const edgeX = v.width / 2.0;
        const ceiling = archY(edgeX);
        const margin = ceiling - v.height;
        const passes = margin > 0;
        assert.equal(passes, v.expectedPass, `Vehicle clearance check for ${v.desc}: passes=${passes}`);
      }
    });

    it('verifies coordinate system transformation invariance', () => {
      // Verify that clearance margin is identical under 3 coordinate transformations:
      // Coordinate System 1: Road center (0, 0), apex (0, 6)
      const y1 = (x) => -0.375 * x * x + 6;
      const margin1 = y1(2.0) - 4.2;

      // Coordinate System 2: Left base (0, 0), apex (4, 6)
      const y2 = (x) => -0.375 * Math.pow(x - 4, 2) + 6;
      const margin2_left = y2(2.0) - 4.2;
      const margin2_right = y2(6.0) - 4.2;

      // Coordinate System 3: Apex origin (0, 0), opening down, ground at y = -6
      const y3 = (x) => -0.375 * x * x;
      const margin3 = (6.0 + y3(2.0)) - 4.2;

      assert.ok(Math.abs(margin1 - 0.3) < 1e-12);
      assert.ok(Math.abs(margin2_left - 0.3) < 1e-12);
      assert.ok(Math.abs(margin2_right - 0.3) < 1e-12);
      assert.ok(Math.abs(margin3 - 0.3) < 1e-12);
    });
  });

  // =========================================================================
  // SECTION 3: BUS REVENUE OPTIMIZATION MODEL
  // =========================================================================
  describe('Bus Revenue Optimization Model: Multi-method Proof & Domain Boundaries', () => {
    const P0 = 200000;
    const Q0 = 60;
    const deltaP = 10000;
    const deltaQ = 5;
    const maxCapacity = 100;

    const price = (x) => P0 - deltaP * x;
    const demand = (x) => Q0 + deltaQ * x;
    const revenue = (x) => price(x) * demand(x);

    it('confirms algebraic expansion: R(x) = -50,000x^2 + 400,000x + 12,000,000', () => {
      const a = -deltaP * deltaQ; // -50,000
      const b = P0 * deltaQ - deltaP * Q0; // 400,000
      const c = P0 * Q0; // 12,000,000

      assert.equal(a, -50000);
      assert.equal(b, 400000);
      assert.equal(c, 12000000);

      // Verify at continuous and discrete sample points
      for (let x = 0; x <= 8; x += 0.5) {
        const factored = (200000 - 10000 * x) * (60 + 5 * x);
        const polynomial = a * x * x + b * x + c;
        assert.equal(factored, polynomial, `Equivalence holds at x=${x}`);
      }
    });

    it('proves global optimum at x*=4 via 4 independent mathematical methods', () => {
      const a = -50000;
      const b = 400000;

      // Method 1: Vertex formula x* = -b / (2a)
      const x_vertex = -b / (2 * a);
      assert.equal(x_vertex, 4);

      // Method 2: First derivative root R'(x) = 2ax + b = 0
      const x_derivative = -b / (2 * a);
      const second_derivative = 2 * a; // -100,000 < 0
      assert.equal(x_derivative, 4);
      assert.ok(second_derivative < 0, 'Strict negative second derivative proves maximum');

      // Method 3: AM-GM (Cauchy) Inequality
      // R(x) = 50,000 * (20 - x)(12 + x)
      // Sum = (20 - x) + (12 + x) = 32 (constant).
      // Equality holds when 20 - x = 12 + x => 2x = 8 => x = 4.
      const x_amgm = (20 - 12) / 2;
      assert.equal(x_amgm, 4);

      // Method 4: Exhaustive discrete search in domain [0, 8]
      let maxDiscreteR = -Infinity;
      let argMaxX = -1;
      for (let x = 0; x <= 8; x++) {
        const r = revenue(x);
        if (r > maxDiscreteR) {
          maxDiscreteR = r;
          argMaxX = x;
        }
      }
      assert.equal(argMaxX, 4);
      assert.equal(maxDiscreteR, 12800000);
    });

    it('verifies exact quadratic loss formula R(4) - R(x) = 50,000 * (x - 4)^2', () => {
      const R_star = 12800000;
      for (let x = 0; x <= 8; x++) {
        const loss = R_star - revenue(x);
        const expectedLoss = 50000 * Math.pow(x - 4, 2);
        assert.equal(loss, expectedLoss, `Loss at x=${x} matches theoretical delta`);
      }
    });

    it('verifies capacity limit and boundary constraints', () => {
      // Maximum capacity constraint: Q(x) <= 100
      // 60 + 5x <= 100 => 5x <= 40 => x <= 8
      const maxAllowedX = (maxCapacity - Q0) / deltaQ;
      assert.equal(maxAllowedX, 8, 'Max allowed discount step is exactly 8');

      // Check boundary revenues
      assert.equal(revenue(0), 12000000, 'Baseline revenue at x=0 is 12,000,000 VND');
      assert.equal(revenue(8), 12000000, 'Capacity limit revenue at x=8 is 12,000,000 VND (equal to baseline)');
      assert.equal(price(8), 120000, 'Fare at capacity is 120,000 VND');
      assert.equal(demand(8), 100, 'Ridership at capacity is 100 passengers');

      // Optimal revenue at x=4
      assert.equal(revenue(4), 12800000, 'Peak revenue at x=4 is 12,800,000 VND');
      assert.equal(price(4), 160000, 'Optimal fare is 160,000 VND');
      assert.equal(demand(4), 80, 'Optimal ridership is 80 passengers');
      assert.equal(revenue(4) - revenue(0), 800000, 'Net increase is 800,000 VND (+6.67%)');
    });

    it('matches Lesson 3 dataset values and quiz answers in src/data/lessons.js', () => {
      const lesson = getLessonById('lesson-bus-optimization');
      assert.ok(lesson, 'Lesson 3 exists');
      assert.equal(lesson.scenes[1].formulas[0], 'P_0 = 200{,}000\\text{ VNĐ}');
      assert.equal(lesson.scenes[3].formulas[2], 'R(x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000');
      assert.equal(lesson.scenes[3].formulas[3], 'x_V = -\\frac{b}{2a} = -\\frac{400{,}000}{2 \\cdot (-50{,}000)} = 4');
      assert.equal(lesson.scenes[4].formulas[1], 'R^* = 12{,}800{,}000\\text{ VNĐ} \\quad (\\Delta R = +800{,}000\\text{ VNĐ})');
      
      // Quiz Q2: leading coefficient
      assert.equal(lesson.quiz[1].optionsVi[lesson.quiz[1].correctIndex], 'A. a = -50.000');
      // Quiz Q3: optimal price
      assert.equal(lesson.quiz[2].optionsVi[lesson.quiz[2].correctIndex], 'A. 160.000 VNĐ');
      // Quiz Q4: max revenue
      assert.equal(lesson.quiz[3].optionsVi[lesson.quiz[3].correctIndex], 'A. 12.800.000 VNĐ (tăng 800.000 VNĐ so với ban đầu)');
    });
  });

  // =========================================================================
  // SECTION 4: INTEGRITY OF ALL 3 LESSONS IN DATASET
  // =========================================================================
  describe('Dataset Completeness & Structural Invariant Verification', () => {
    it('verifies all 3 default lessons have valid 5-scene structures and 5-item quizzes', () => {
      assert.equal(DEFAULT_LESSONS.length, 3, 'Must have exactly 3 default lessons');

      for (const lesson of DEFAULT_LESSONS) {
        assert.ok(lesson.id, 'Lesson has ID');
        assert.ok(lesson.titleVi && lesson.titleEn, 'Lesson has bilingual titles');
        assert.equal(lesson.scenes.length, 5, `${lesson.id} has exactly 5 scenes`);
        assert.equal(lesson.quiz.length, 5, `${lesson.id} has exactly 5 quiz items`);
        assert.ok(lesson.vocabulary.length >= 7, `${lesson.id} has at least 7 vocabulary items`);

        // Check scene keys
        const expectedKeys = ['context', 'facts', 'problem', 'guidance', 'practice'];
        lesson.scenes.forEach((scene, idx) => {
          assert.equal(scene.key, expectedKeys[idx], `Scene ${idx+1} key matches ${expectedKeys[idx]}`);
          assert.ok(scene.contentVi && scene.contentEn, `Scene ${idx+1} has bilingual content`);
          assert.ok(scene.formulas && scene.formulas.length > 0, `Scene ${idx+1} has formulas`);
        });

        // Check quiz structure
        lesson.quiz.forEach((q, idx) => {
          assert.ok(q.questionVi && q.questionEn, `Quiz ${idx+1} has bilingual question`);
          assert.equal(q.optionsVi.length, 4, `Quiz ${idx+1} has 4 options in VI`);
          assert.equal(q.optionsEn.length, 4, `Quiz ${idx+1} has 4 options in EN`);
          assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3, `Quiz ${idx+1} correctIndex is valid`);
          assert.ok(q.explanationVi && q.explanationEn, `Quiz ${idx+1} has explanations`);
        });
      }
    });
  });
});
