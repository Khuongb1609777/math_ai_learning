/**
 * Math Models Unit Test Suite — Node.js Native Test Runner
 * Validates mathematical accuracy, formulas, and real-world constraints
 * for all 3 Grade 10 KHKT lessons.
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LESSONS, getLessonById } from '../src/data/lessons.js';

// Helper: Degree to Radian conversion
const degToRad = (degrees) => (degrees * Math.PI) / 180;

describe('KHKT Lesson 1 Math Model: Lighthouse Inaccessible Base Triangulation', () => {
  const AB = 30.0; // Distance between observation stations (meters)
  const angleAlpha = 42.0; // Angle of elevation at point A (degrees)
  const angleBeta = 63.0; // Angle of elevation at point B (degrees)

  it('calculates the top vertex subtended angle ADB correctly', () => {
    // Exterior angle theorem: angleBeta = angleAlpha + angleADB
    const angleADB = angleBeta - angleAlpha;
    assert.equal(angleADB, 21.0, 'Angle ADB must be exactly 21 degrees');
  });

  it('computes distance BD using Law of Sines within tight tolerance', () => {
    const angleADB = angleBeta - angleAlpha;
    const sinAlpha = Math.sin(degToRad(angleAlpha));
    const sinADB = Math.sin(degToRad(angleADB));

    // Law of Sines in triangle ABD: BD / sin(A) = AB / sin(ADB)
    const BD = (AB * sinAlpha) / sinADB;

    assert.ok(BD > 55.95 && BD < 56.05, `BD (${BD.toFixed(2)}m) must be close to 56.0m`);
    assert.ok(Math.abs(BD - 56.01) < 0.05, 'BD matches standard trigonometric calculation');
  });

  it('computes lighthouse height CD using right-triangle trigonometry', () => {
    const angleADB = angleBeta - angleAlpha;
    const BD = (AB * Math.sin(degToRad(angleAlpha))) / Math.sin(degToRad(angleADB));

    // Right triangle BCD: CD = BD * sin(Beta)
    const CD = BD * Math.sin(degToRad(angleBeta));

    assert.ok(CD > 49.85 && CD < 49.95, `CD (${CD.toFixed(2)}m) must be close to 49.9m`);
    assert.equal(CD.toFixed(1), '49.9', 'CD rounded to 1 decimal place must equal 49.9m');
  });

  it('verifies height CD via alternative cotangent formula', () => {
    // Cotangent relationship: CD = AB / (cot(alpha) - cot(beta))
    const cotAlpha = 1.0 / Math.tan(degToRad(angleAlpha));
    const cotBeta = 1.0 / Math.tan(degToRad(angleBeta));
    const CD = AB / (cotAlpha - cotBeta);

    assert.ok(Math.abs(CD - 49.91) < 0.05, 'Cotangent formula verifies identical height');
    assert.equal(CD.toFixed(1), '49.9', 'Alternative method rounds to 49.9m');
  });

  it('confirms inaccessible base property: BC is non-zero and geometric relation holds', () => {
    const angleADB = angleBeta - angleAlpha;
    const BD = (AB * Math.sin(degToRad(angleAlpha))) / Math.sin(degToRad(angleADB));
    const BC = BD * Math.cos(degToRad(angleBeta));
    const CD = BD * Math.sin(degToRad(angleBeta));
    const AC = AB + BC;

    // Verify tan(alpha) = CD / AC
    const computedTanAlpha = CD / AC;
    const actualTanAlpha = Math.tan(degToRad(angleAlpha));
    assert.ok(Math.abs(computedTanAlpha - actualTanAlpha) < 1e-6, 'Geometric consistency across triangles');
  });

  it('matches Lesson 1 dataset values in src/data/lessons.js', () => {
    const lesson = getLessonById('lesson-lighthouse');
    assert.ok(lesson, 'Lesson 1 exists in dataset');
    assert.equal(lesson.scenes.length, 5, 'Lesson 1 has exactly 5 scenes');
    assert.equal(lesson.quiz.length, 5, 'Lesson 1 has exactly 5 quiz items');
    assert.equal(lesson.quiz[3].correctIndex, 0, 'Quiz Q4 correct answer is A (49.9 m)');
  });
});

describe('KHKT Lesson 2 Math Model: Parabolic Entrance Arch & Truck Clearance', () => {
  const span = 8.0; // Width at ground level (meters)
  const height = 6.0; // Height at vertex (meters)
  const truckWidth = 4.0; // Truck box width (meters)
  const truckHeight = 4.2; // Truck height (meters)

  it('derives correct quadratic coefficient a for symmetric arch', () => {
    // Coordinate system: Origin at base center, vertex at (0, 6), roots at (+-4, 0)
    // 0 = a * (4^2) + 6 => 16a = -6 => a = -3/8 = -0.375
    const halfSpan = span / 2.0;
    const a = -height / (halfSpan * halfSpan);

    assert.equal(a, -0.375, 'Leading coefficient a must be exactly -0.375 (-3/8)');
  });

  it('verifies boundary points and vertex on the parabola y = -0.375x^2 + 6', () => {
    const parabola = (x) => -0.375 * x * x + 6.0;

    assert.equal(parabola(0), 6.0, 'Parabola peaks at vertex (0, 6)');
    assert.equal(parabola(4), 0.0, 'Parabola touches ground at right base (4, 0)');
    assert.equal(parabola(-4), 0.0, 'Parabola touches ground at left base (-4, 0)');
  });

  it('calculates clearance height at outer edge of truck', () => {
    // Truck is centered: outer edges are at x = +- (truckWidth / 2) = +-2
    const edgeX = truckWidth / 2.0;
    const archHeightAtEdge = -0.375 * (edgeX * edgeX) + 6.0;

    assert.equal(archHeightAtEdge, 4.5, 'Arch height at x=2 must be exactly 4.5m');
  });

  it('validates truck clearance inequality and calculates safety margin', () => {
    const edgeX = truckWidth / 2.0;
    const archHeightAtEdge = -0.375 * (edgeX * edgeX) + 6.0;
    const canPassSafely = archHeightAtEdge > truckHeight;
    const clearanceMargin = archHeightAtEdge - truckHeight;

    assert.equal(canPassSafely, true, 'Truck must pass safely through the arch');
    assert.ok(Math.abs(clearanceMargin - 0.3) < 1e-9, 'Clearance margin must be exactly 0.3m (30cm)');
  });

  it('confirms coordinate invariance: origin placed at left base gives identical clearance', () => {
    // Origin at left base (0,0), vertex at (4,6), right base at (8,0)
    // y = a*(x-4)^2 + 6 => y = -0.375(x-4)^2 + 6
    // Truck outer edge is at x = 2 (left) and x = 6 (right)
    const shiftedParabola = (x) => -0.375 * Math.pow(x - 4, 2) + 6.0;

    assert.equal(shiftedParabola(0), 0.0);
    assert.equal(shiftedParabola(8), 0.0);
    assert.equal(shiftedParabola(4), 6.0);
    assert.equal(shiftedParabola(2), 4.5, 'Left truck edge at x=2 has height 4.5m');
    assert.equal(shiftedParabola(6), 4.5, 'Right truck edge at x=6 has height 4.5m');
  });

  it('matches Lesson 2 dataset values in src/data/lessons.js', () => {
    const lesson = getLessonById('lesson-parabolic-arch');
    assert.ok(lesson, 'Lesson 2 exists in dataset');
    assert.equal(lesson.scenes.length, 5, 'Lesson 2 has exactly 5 scenes');
    assert.equal(lesson.quiz[2].correctIndex, 0, 'Quiz Q3 correct answer is A (4.5 m)');
    assert.equal(lesson.quiz[3].correctIndex, 0, 'Quiz Q4 clearance confirmation is A (passed, 30cm margin)');
  });
});

describe('KHKT Lesson 3 Math Model: Cho Lach Bus Revenue Optimization', () => {
  const P0 = 200000; // Initial ticket price (VND)
  const Q0 = 60; // Initial passenger demand
  const deltaP = 10000; // Price decrease per step (VND)
  const deltaQ = 5; // Passenger increase per step
  const maxCapacity = 100; // Bus physical capacity limit

  // Revenue function: R(x) = (P0 - deltaP * x) * (Q0 + deltaQ * x)
  const revenueFunc = (x) => (P0 - deltaP * x) * (Q0 + deltaQ * x);

  it('expands to standard quadratic form: R(x) = -50,000x^2 + 400,000x + 12,000,000', () => {
    const a = -deltaP * deltaQ; // -50,000
    const b = P0 * deltaQ - deltaP * Q0; // 1,000,000 - 600,000 = 400,000
    const c = P0 * Q0; // 12,000,000

    assert.equal(a, -50000, 'Quadratic coefficient a must be -50,000');
    assert.equal(b, 400000, 'Linear coefficient b must be 400,000');
    assert.equal(c, 12000000, 'Constant term c must be 12,000,000');

    // Test equivalence at sample points
    for (const x of [0, 2, 4, 6, 8]) {
      const expanded = a * x * x + b * x + c;
      assert.equal(revenueFunc(x), expanded, `Expanded form matches factored form at x=${x}`);
    }
  });

  it('finds vertex x via standard Grade 10 quadratic vertex formula x = -b / (2a)', () => {
    const a = -50000;
    const b = 400000;
    const vertexX = -b / (2 * a);

    assert.equal(vertexX, 4, 'Vertex x must be exactly 4 discount steps');
  });

  it('confirms domain constraint: x=4 satisfies 0 <= x <= 8 and capacity <= 100', () => {
    const optimalX = 4;
    const passengerCount = Q0 + deltaQ * optimalX;
    const ticketPrice = P0 - deltaP * optimalX;

    assert.ok(optimalX >= 0, 'Discount step must be non-negative');
    assert.ok(passengerCount <= maxCapacity, `Passengers (${passengerCount}) must not exceed capacity (${maxCapacity})`);
    assert.equal(passengerCount, 80, 'Optimal passenger count is 80');
    assert.equal(ticketPrice, 160000, 'Optimal ticket price is 160,000 VND');
  });

  it('verifies strict maximum revenue R(4) = 12,800,000 VND', () => {
    const maxRevenue = revenueFunc(4);
    assert.equal(maxRevenue, 12800000, 'Maximum revenue must be 12,800,000 VND');

    // Check that every other integer discount in the valid domain [0, 8] produces strictly lower revenue
    for (let x = 0; x <= 8; x++) {
      if (x !== 4) {
        assert.ok(
          revenueFunc(x) < maxRevenue,
          `Revenue at x=${x} (${revenueFunc(x)}) must be strictly less than maximum at x=4 (${maxRevenue})`
        );
      }
    }
  });

  it('calculates net revenue increase compared to baseline', () => {
    const baselineRevenue = revenueFunc(0);
    const maxRevenue = revenueFunc(4);
    const revenueIncrease = maxRevenue - baselineRevenue;
    const percentageIncrease = (revenueIncrease / baselineRevenue) * 100;

    assert.equal(baselineRevenue, 12000000, 'Baseline revenue is 12,000,000 VND');
    assert.equal(revenueIncrease, 800000, 'Net increase is 800,000 VND');
    assert.ok(Math.abs(percentageIncrease - 6.6667) < 0.01, 'Percentage gain is approximately +6.67%');
  });

  it('matches Lesson 3 dataset values in src/data/lessons.js', () => {
    const lesson = getLessonById('lesson-bus-optimization');
    assert.ok(lesson, 'Lesson 3 exists in dataset');
    assert.equal(lesson.scenes.length, 5, 'Lesson 3 has exactly 5 scenes');
    assert.equal(lesson.quiz[1].correctIndex, 0, 'Quiz Q2 leading coefficient is -50,000');
    assert.equal(lesson.quiz[2].correctIndex, 0, 'Quiz Q3 optimal ticket price is 160,000 VND');
    assert.equal(lesson.quiz[3].correctIndex, 0, 'Quiz Q4 maximum revenue is 12,800,000 VND (+800,000 VND)');
  });
});
