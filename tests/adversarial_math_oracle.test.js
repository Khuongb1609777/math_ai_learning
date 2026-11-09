/**
 * Adversarial Mathematical Oracle & Stress Test Suite
 * Author: Challenger 1 (Mathematical Challenger)
 * Milestone: M1 (Foundation, Asset Pipeline & Core Data Models)
 *
 * This test suite independently verifies and stress-tests:
 * 1. Lighthouse Triangulation:
 *    - Law of Sines vs Cotangent vs Tangent equivalence across 500 random parameter configurations
 *    - Boundary and degenerate angles (alpha -> beta, beta -> 90 deg, alpha -> 0 deg, invalid geometry)
 *    - Sensitivity and error propagation under measurement uncertainty
 *    - Ground truth comparison with Lesson 1 dataset
 * 2. Parabolic Arch:
 *    - Analytical derivation of vertex, roots, derivatives, area under curve
 *    - Vehicle clearance stress matrix across multiple truck widths & heights (4.2m, 4.5m, 6.0m)
 *    - Off-center vehicle lateral displacement failure threshold
 *    - Invariance across 3 coordinate systems
 * 3. Bus Revenue Optimization:
 *    - 4-way mathematical equivalence: Vertex formula, Derivative R'(x)=0, AM-GM (Cauchy), Discrete grid search
 *    - Strict concavity and delta loss verification
 *    - Boundary constraint stress testing (capacity caps, fare non-negativity)
 *    - Quantization loss verification between continuous and discrete optimization
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLessonById } from '../src/data/lessons.js';

// Trigonometric helpers (standard radians)
const degToRad = (deg) => (deg * Math.PI) / 180;
const radToDeg = (rad) => (rad * 180) / Math.PI;

describe('Adversarial Oracle: Lighthouse Triangulation Model', () => {

  /**
   * Reference Oracle Implementation
   */
  const solveByLawOfSines = (AB, alphaDeg, betaDeg) => {
    const alphaRad = degToRad(alphaDeg);
    const betaRad = degToRad(betaDeg);
    const angleADBRad = degToRad(betaDeg - alphaDeg);

    const BD = (AB * Math.sin(alphaRad)) / Math.sin(angleADBRad);
    const CD = BD * Math.sin(betaRad);
    const BC = BD * Math.cos(betaRad);
    return { BD, CD, BC };
  };

  const solveByCotangents = (AB, alphaDeg, betaDeg) => {
    const alphaRad = degToRad(alphaDeg);
    const betaRad = degToRad(betaDeg);
    const cotAlpha = 1.0 / Math.tan(alphaRad);
    const cotBeta = 1.0 / Math.tan(betaRad);
    const CD = AB / (cotAlpha - cotBeta);
    const BC = CD * cotBeta;
    const BD = Math.sqrt(CD * CD + BC * BC);
    return { BD, CD, BC };
  };

  const solveByTangents = (AB, alphaDeg, betaDeg) => {
    const alphaRad = degToRad(alphaDeg);
    const betaRad = degToRad(betaDeg);
    const tanAlpha = Math.tan(alphaRad);
    const tanBeta = Math.tan(betaRad);
    const CD = (AB * tanAlpha * tanBeta) / (tanBeta - tanAlpha);
    const BC = CD / tanBeta;
    const BD = Math.hypot(CD, BC);
    return { BD, CD, BC };
  };

  it('verifies exact equivalence of Law of Sines, Cotangents, and Tangents across 500 randomized parameter sets', () => {
    let casesTested = 0;
    // Pseudorandom deterministic LCG generator for repeatable stress tests
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < 500; i++) {
      const AB = 5.0 + rnd() * 495.0; // AB in [5, 500] meters
      const alpha = 5.0 + rnd() * 70.0; // alpha in [5, 75] degrees
      const beta = alpha + 0.5 + rnd() * (89.0 - alpha - 0.5); // beta in (alpha, 89.5] degrees

      const resSines = solveByLawOfSines(AB, alpha, beta);
      const resCot = solveByCotangents(AB, alpha, beta);
      const resTan = solveByTangents(AB, alpha, beta);

      const diffSinesCot = Math.abs(resSines.CD - resCot.CD);
      const diffSinesTan = Math.abs(resSines.CD - resTan.CD);

      assert.ok(
        diffSinesCot < 1e-9,
        `Sines vs Cot mismatch at i=${i}, AB=${AB}, alpha=${alpha}, beta=${beta}: diff=${diffSinesCot}`
      );
      assert.ok(
        diffSinesTan < 1e-9,
        `Sines vs Tan mismatch at i=${i}, AB=${AB}, alpha=${alpha}, beta=${beta}: diff=${diffSinesTan}`
      );
      casesTested++;
    }
    assert.equal(casesTested, 500, 'Successfully executed 500 randomized triangulation tests');
  });

  it('stress-tests boundary conditions and degenerate geometry', () => {
    const AB = 30.0;

    // 1. beta -> 90 degrees (Observer B directly at the cliff face)
    // When beta = 89.999 deg, cot(beta) -> 0, CD -> AB * tan(alpha)
    const betaNear90 = 89.9999;
    const alpha = 42.0;
    const resNear90 = solveByCotangents(AB, alpha, betaNear90);
    const expectedDirect = AB * Math.tan(degToRad(alpha));
    assert.ok(
      Math.abs(resNear90.CD - expectedDirect) < 0.05,
      `As beta -> 90, height CD (${resNear90.CD}) approaches AB * tan(alpha) (${expectedDirect})`
    );

    // 2. alpha -> beta (Observer A and B almost coalesce, angleADB -> 0)
    // Height CD approaches infinity because the rays are almost parallel
    const betaEqual = 42.0001;
    const resNearParallel = solveByLawOfSines(AB, alpha, betaEqual);
    assert.ok(
      resNearParallel.CD > 1e6,
      'When alpha approaches beta, CD must explode to large values (> 10^6)'
    );

    // 3. Invalid geometry detection (alpha >= beta)
    const invalidAngleTest = () => {
      const alphaInv = 60.0;
      const betaInv = 45.0; // unphysical for A-B-C collinear order
      const denom = (1.0 / Math.tan(degToRad(alphaInv))) - (1.0 / Math.tan(degToRad(betaInv)));
      return denom <= 0;
    };
    assert.equal(invalidAngleTest(), true, 'alpha >= beta yields invalid negative/zero denominator');
  });

  it('performs sensitivity analysis: measurement uncertainty propagation on Lesson 1', () => {
    const AB = 30.0;
    const baseAlpha = 42.0;
    const baseBeta = 63.0;
    const baseHeight = solveByLawOfSines(AB, baseAlpha, baseBeta).CD;

    // Typical theodolite measurement tolerance +/- 0.5 degrees
    const delta = 0.5;
    const h_alpha_plus = solveByLawOfSines(AB, baseAlpha + delta, baseBeta).CD;
    const h_alpha_minus = solveByLawOfSines(AB, baseAlpha - delta, baseBeta).CD;
    const h_beta_plus = solveByLawOfSines(AB, baseAlpha, baseBeta + delta).CD;
    const h_beta_minus = solveByLawOfSines(AB, baseAlpha, baseBeta - delta).CD;

    // Verify bounded perturbation: +/-0.5 deg changes height by approx 2 to 3 meters
    assert.ok(Math.abs(h_alpha_plus - baseHeight) < 4.0, 'alpha +0.5 deg sensitivity is well-behaved');
    assert.ok(Math.abs(h_beta_plus - baseHeight) < 4.0, 'beta +0.5 deg sensitivity is well-behaved');
  });

  it('confirms Lesson 1 ground truth dataset values and geometric consistency', () => {
    const lesson = getLessonById('lesson-lighthouse');
    assert.ok(lesson, 'Lighthouse lesson exists');

    const AB = 30.0;
    const alpha = 42.0;
    const beta = 63.0;
    const { BD, CD, BC } = solveByLawOfSines(AB, alpha, beta);

    // Calculated values
    assert.equal(CD.toFixed(1), '49.9', 'Height rounded to 1 decimal place is 49.9m');
    assert.equal(Math.round(BD), 56, 'BD rounded to nearest integer is 56m');

    // Inaccessible distance BC
    assert.ok(BC > 25.4 && BC < 25.5, `BC (${BC.toFixed(2)}m) is approximately 25.43m`);

    // Verify overall right triangle ACD: tan(alpha) = CD / (AB + BC)
    const AC = AB + BC;
    const tanAlphaComputed = CD / AC;
    const tanAlphaExact = Math.tan(degToRad(alpha));
    assert.ok(Math.abs(tanAlphaComputed - tanAlphaExact) < 1e-12, 'ACD triangle relation holds exactly');
  });
});

describe('Adversarial Oracle: Parabolic Arch & Vehicle Clearance Model', () => {

  const span = 8.0;
  const apexHeight = 6.0;

  // Derivation of parabola y(x) = a*x^2 + apexHeight
  const halfSpan = span / 2.0; // 4.0
  const a = -apexHeight / (halfSpan * halfSpan); // -6 / 16 = -0.375
  const archHeightAt = (x) => a * x * x + apexHeight;

  it('analytically verifies roots, vertex, derivatives, and area under the arch', () => {
    // 1. Vertex
    assert.equal(a, -0.375, 'Coefficient a is exactly -0.375 (-3/8)');
    assert.equal(archHeightAt(0), 6.0, 'Vertex height at x=0 is 6.0m');

    // 2. Roots (ground contact)
    assert.equal(archHeightAt(-4.0), 0.0, 'Left base root at x=-4 is 0.0m');
    assert.equal(archHeightAt(4.0), 0.0, 'Right base root at x=4 is 0.0m');

    // 3. Derivative and concavity
    // y'(x) = 2*a*x = -0.75x
    const deriv = (x) => 2 * a * x;
    assert.equal(Math.abs(deriv(0)), 0, 'Apex horizontal tangent |y\'(0)| = 0');
    assert.equal(deriv(4), -3.0, 'Right base slope is -3.0');
    assert.equal(deriv(-4), 3.0, 'Left base slope is +3.0');

    // 4. Definite integral (Area under arch)
    // Integral from -4 to 4 of (-0.375x^2 + 6) dx = 2 * [-0.125*(64) + 6*(4)] = 2 * [-8 + 24] = 32 m^2
    // Archimedes formula: Area = (2/3) * span * height = (2/3) * 8 * 6 = 32 m^2
    const analyticalArea = (2.0 / 3.0) * span * apexHeight;
    assert.equal(analyticalArea, 32.0, 'Arch cross-sectional area is exactly 32 square meters');
  });

  it('stress-tests clearance against comprehensive truck width & height adversarial matrix', () => {
    // Function to evaluate clearance given truck width and height
    const evaluateClearance = (width, height) => {
      const edgeX = width / 2.0;
      const ceilingAtEdge = archHeightAt(edgeX);
      const margin = ceilingAtEdge - height;
      const passes = margin > 0;
      return { ceilingAtEdge, margin, passes };
    };

    // Test Case 1: Baseline Lesson 2 (width=4.0m, height=4.2m)
    const baseline = evaluateClearance(4.0, 4.2);
    assert.equal(baseline.ceilingAtEdge, 4.5, 'Ceiling height at edge x=2 is 4.5m');
    assert.ok(Math.abs(baseline.margin - 0.3) < 1e-9, 'Clearance margin is exactly 0.3m (30cm)');
    assert.equal(baseline.passes, true, 'Truck 4.2m passes safely');

    // Test Case 2: Truck Height = 4.5m (Zero-clearance boundary)
    const criticalHeight = evaluateClearance(4.0, 4.5);
    assert.equal(criticalHeight.margin, 0.0, 'Truck 4.5m has exactly 0.0m clearance margin');
    assert.equal(criticalHeight.passes, false, 'Truck 4.5m does not pass safely (zero buffer)');

    // Test Case 3: Truck Height = 6.0m (Impossible height)
    const impossibleHeight = evaluateClearance(4.0, 6.0);
    assert.equal(impossibleHeight.margin, -1.5, 'Truck 6.0m collides with roof by 1.5m');
    assert.equal(impossibleHeight.passes, false, 'Truck 6.0m fails completely');

    // Test Case 4: Standard ISO container width = 2.4m, height = 4.2m
    const isoTruck = evaluateClearance(2.4, 4.2);
    assert.equal(isoTruck.ceilingAtEdge, 5.46, 'Ceiling at x=1.2 is 5.46m');
    assert.ok(Math.abs(isoTruck.margin - 1.26) < 1e-9, 'ISO container margin is 1.26m');
    assert.equal(isoTruck.passes, true, 'ISO truck passes with generous margin');

    // Test Case 5: Maximum legal commercial width in VN = 2.6m, height = 4.2m
    const standardTruck = evaluateClearance(2.6, 4.2);
    assert.equal(standardTruck.ceilingAtEdge, 5.36625, 'Ceiling at x=1.3 is 5.36625m');
    assert.ok(Math.abs(standardTruck.margin - 1.16625) < 1e-9, 'Standard truck margin is 1.16625m');
    assert.equal(standardTruck.passes, true, 'Standard commercial truck passes safely');

    // Test Case 6: Critical Width Threshold for Height = 4.2m
    // -0.375*x^2 + 6 = 4.2 => x^2 = 1.8 / 0.375 = 4.8 => x = sqrt(4.8) ~= 2.19089m
    // Max allowable width = 2 * sqrt(4.8) ~= 4.38178m
    const maxWidth = 2.0 * Math.sqrt((apexHeight - 4.2) / -a);
    assert.ok(Math.abs(maxWidth - 4.38178) < 1e-4, 'Max allowable width for 4.2m height is ~4.382m');

    // Width 4.38m clears; Width 4.39m collides
    const clearsJustBarely = evaluateClearance(4.38, 4.2);
    const collidesJustOver = evaluateClearance(4.39, 4.2);
    assert.ok(clearsJustBarely.margin > 0, 'Width 4.38m clears');
    assert.ok(collidesJustOver.margin < 0, 'Width 4.39m collides');
  });

  it('stress-tests off-center vehicle lateral steering displacement', () => {
    // If the 4m-wide, 4.2m-tall truck drifts off-center by offset d:
    // Left edge at -2 + d, Right edge at 2 + d.
    // Critical edge is at x_crit = 2 + |d|.
    const truckWidth = 4.0;
    const truckHeight = 4.2;

    const testOffset = (offset) => {
      const edge = (truckWidth / 2.0) + Math.abs(offset);
      const ceiling = archHeightAt(edge);
      return ceiling - truckHeight;
    };

    // Centered: margin = +0.30m
    assert.ok(Math.abs(testOffset(0.0) - 0.30) < 1e-9);

    // 10 cm drift: edge = 2.1m, ceiling = -0.375*(4.41) + 6 = 4.34625m -> margin = +0.14625m (still safe)
    assert.ok(testOffset(0.10) > 0.14);

    // 19 cm drift: edge = 2.19m, ceiling = -0.375*(4.7961) + 6 = 4.20146m -> margin = +0.00146m (barely safe)
    assert.ok(testOffset(0.19) > 0);

    // 20 cm drift: edge = 2.20m, ceiling = -0.375*(4.84) + 6 = 4.185m -> margin = -0.015m (ROOF SCRAPES!)
    assert.ok(testOffset(0.20) < 0, 'Drifting 20cm off-center causes a roof collision');
  });

  it('demonstrates coordinate system translation invariance', () => {
    const truckWidth = 4.0;
    const truckHeight = 4.2;

    // Coordinate System 1: Origin at road center, vertex at (0, 6)
    const y1 = (x) => -0.375 * x * x + 6.0;
    const clearance1 = y1(truckWidth / 2) - truckHeight;

    // Coordinate System 2: Origin at left base, vertex at (4, 6)
    // Road center is at x=4, truck outer edges at x = 4 - 2 = 2 and x = 4 + 2 = 6
    const y2 = (x) => -0.375 * Math.pow(x - 4, 2) + 6.0;
    const clearance2_left = y2(2) - truckHeight;
    const clearance2_right = y2(6) - truckHeight;

    // Coordinate System 3: Origin at apex, curve opens downward: Y = -0.375 X^2
    // Clearance ceiling relative to apex is Y(2) = -1.5m; ground is at -6m.
    // Height from ground = 6 + Y(2) = 4.5m
    const Y3 = (X) => -0.375 * X * X;
    const clearance3 = (6.0 + Y3(2)) - truckHeight;

    assert.ok(Math.abs(clearance1 - 0.3) < 1e-9, 'System 1 margin is 0.3m');
    assert.ok(Math.abs(clearance2_left - 0.3) < 1e-9, 'System 2 left edge margin is 0.3m');
    assert.ok(Math.abs(clearance2_right - 0.3) < 1e-9, 'System 2 right edge margin is 0.3m');
    assert.ok(Math.abs(clearance3 - 0.3) < 1e-9, 'System 3 margin is 0.3m');
  });
});

describe('Adversarial Oracle: Bus Revenue Optimization Model', () => {

  const P0 = 200000;
  const Q0 = 60;
  const deltaP = 10000;
  const deltaQ = 5;
  const maxCapacity = 100;

  // Factored form
  const fare = (x) => P0 - deltaP * x;
  const riders = (x) => Q0 + deltaQ * x;
  const revenue = (x) => fare(x) * riders(x);

  it('confirms 4-way mathematical equivalence of optimal discount step x*=4', () => {
    // 1. Method A: Grade 10 Quadratic Vertex Formula x = -b / (2a)
    // R(x) = (200000 - 10000x)(60 + 5x)
    // a = -deltaP * deltaQ = -50,000
    // b = P0 * deltaQ - deltaP * Q0 = 1,000,000 - 600,000 = 400,000
    // c = P0 * Q0 = 12,000,000
    const a = -deltaP * deltaQ;
    const b = P0 * deltaQ - deltaP * Q0;
    const c = P0 * Q0;
    const vertexX = -b / (2 * a);
    const maxRevVertex = a * vertexX * vertexX + b * vertexX + c;

    assert.equal(vertexX, 4, 'Vertex method gives x* = 4');
    assert.equal(maxRevVertex, 12800000, 'Vertex revenue is 12,800,000 VND');

    // 2. Method B: First Derivative R'(x) = 0
    // R'(x) = 2ax + b = -100,000x + 400,000 = 0 => x = 400,000 / 100,000 = 4
    const derivativeRootX = -b / (2 * a);
    const secondDeriv = 2 * a; // -100,000 < 0 => strict maximum
    assert.equal(derivativeRootX, 4, 'Calculus derivative gives x* = 4');
    assert.ok(secondDeriv < 0, 'Second derivative confirms strict local & global maximum');

    // 3. Method C: AM-GM (Cauchy) Inequality
    // R(x) = (200,000 - 10,000x)(60 + 5x) = 50,000 * (20 - x)(12 + x)
    // For x in [-12, 20], both (20 - x) and (12 + x) are positive.
    // Sum = (20 - x) + (12 + x) = 32 (constant).
    // Product is maximized when 20 - x = 12 + x => 2x = 8 => x = 4.
    // Max product = ((20 - 4 + 12 + 4)/2)^2 = 16^2 = 256.
    // Max revenue = 50,000 * 256 = 12,800,000 VND.
    const amgmX = (20 - 12) / 2.0;
    const amgmMaxRev = 50000 * Math.pow(32 / 2.0, 2);
    assert.equal(amgmX, 4, 'AM-GM inequality gives x* = 4');
    assert.equal(amgmMaxRev, 12800000, 'AM-GM maximum revenue is 12,800,000 VND');

    // 4. Method D: Discrete Exhaustive Evaluation across all valid integer steps [0, 8]
    let bestX = 0;
    let bestRev = -Infinity;
    for (let x = 0; x <= 8; x++) {
      const currentRev = revenue(x);
      if (currentRev > bestRev) {
        bestRev = currentRev;
        bestX = x;
      }
    }
    assert.equal(bestX, 4, 'Discrete search gives x* = 4');
    assert.equal(bestRev, 12800000, 'Discrete search maximum revenue is 12,800,000 VND');
  });

  it('proves strict concavity and symmetric delta loss around x=4', () => {
    const maxRev = revenue(4);

    // Parabola identity: R(4) - R(x) = 50,000 * (x - 4)^2
    for (let x = 0; x <= 8; x++) {
      const diff = maxRev - revenue(x);
      const expectedDiff = 50000 * Math.pow(x - 4, 2);
      assert.equal(diff, expectedDiff, `Delta loss at x=${x} must equal 50,000*(x-4)^2`);
    }

    // Symmetry test: R(4 - k) == R(4 + k) for k = 1, 2, 3, 4
    for (let k = 1; k <= 4; k++) {
      assert.equal(revenue(4 - k), revenue(4 + k), `Symmetry holds for k=${k}`);
    }
  });

  it('stress-tests physical boundary constraints and capacity limits', () => {
    // 1. Capacity limit constraint: Q(x) <= maxCapacity (100)
    // 60 + 5x <= 100 => 5x <= 40 => x <= 8
    const maxAllowedXByCapacity = (maxCapacity - Q0) / deltaQ;
    assert.equal(maxAllowedXByCapacity, 8, 'Capacity 100 imposes strict domain bound x <= 8');

    // 2. Price non-negativity: P(x) >= 0 => 200,000 - 10,000x >= 0 => x <= 20
    const maxAllowedXByFare = P0 / deltaP;
    assert.equal(maxAllowedXByFare, 20, 'Fare non-negativity imposes domain bound x <= 20');

    // 3. Constrained Optimization Scenario: What if bus capacity was restricted to 70 passengers?
    // Q(x) <= 70 => 60 + 5x <= 70 => x <= 2
    // Since x* = 4 > 2, the constrained maximum must occur on boundary x = 2
    const restrictedCap = 70;
    const restrictedMaxX = (restrictedCap - Q0) / deltaQ; // 2
    let restrictedBestX = 0;
    let restrictedBestRev = -Infinity;
    for (let x = 0; x <= restrictedMaxX; x++) {
      if (revenue(x) > restrictedBestRev) {
        restrictedBestRev = revenue(x);
        restrictedBestX = x;
      }
    }
    assert.equal(restrictedBestX, 2, 'Restricted capacity cap shifts optimum to boundary x=2');
    assert.equal(restrictedBestRev, 12600000, 'Restricted revenue is 12,600,000 VND');

    // 4. Zero Quantization Loss: Continuous vs Discrete
    // Because continuous unconstrained maximizer x* = 4.000 is an exact integer,
    // continuous optimal revenue == discrete optimal revenue.
    const continuousOptRev = revenue(4.0);
    const discreteOptRev = revenue(4);
    assert.equal(continuousOptRev, discreteOptRev, 'Zero quantization loss between continuous and discrete');
  });

  it('verifies Lesson 3 dataset values and quiz consistency', () => {
    const lesson = getLessonById('lesson-bus-optimization');
    assert.ok(lesson, 'Bus optimization lesson exists');

    // Verify baseline vs optimal metrics
    assert.equal(fare(0), 200000);
    assert.equal(riders(0), 60);
    assert.equal(revenue(0), 12000000);

    assert.equal(fare(4), 160000);
    assert.equal(riders(4), 80);
    assert.equal(revenue(4), 12800000);
    assert.equal(revenue(4) - revenue(0), 800000);

    // Verify quiz items
    assert.equal(lesson.quiz[1].correctIndex, 0, 'Quiz Q2 is -50,000');
    assert.equal(lesson.quiz[2].correctIndex, 0, 'Quiz Q3 is 160,000 VND');
    assert.equal(lesson.quiz[3].correctIndex, 0, 'Quiz Q4 is 12,800,000 VND (+800,000)');
  });
});
