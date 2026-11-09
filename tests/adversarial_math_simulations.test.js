/**
 * tests/adversarial_math_simulations.test.js
 * Adversarial Mathematical Stress Test Suite for MathSimulations Engine
 * Milestone: M3 (Dynamic Math Simulations - Feature F6)
 * Author: Empirical Challenger 1 (m3_challenger_1)
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLighthouse,
  calculateParabolicArch,
  calculateBusRevenue,
  MathSimulations
} from '../src/components/MathSimulations.js';

// DOM mock factory for headless Node.js testing
function createMockElement(tagName = 'div') {
  const store = { html: '' };
  const listeners = {};
  const children = [];

  const el = {
    tagName: tagName.toUpperCase(),
    set innerHTML(val) { store.html = val; },
    get innerHTML() { return store.html; },
    dataset: {},
    getAttribute: (attr) => el.dataset[attr.replace(/^data-/, '')] || null,
    setAttribute: (attr, val) => { el.dataset[attr.replace(/^data-/, '')] = val; },
    querySelector: (selector) => {
      // Basic mock for input/button querying
      return null;
    },
    querySelectorAll: (selector) => {
      return [];
    },
    addEventListener: (event, handler) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(h => h !== handler);
    },
    dispatchEvent: (event) => {
      const handlers = listeners[event.type] || [];
      handlers.forEach(h => h(event));
    }
  };
  return el;
}

// Helper: Degree to Radian conversion
const degToRad = (deg) => (deg * Math.PI) / 180;

describe('M3 Adversarial Challenge: Dynamic Math Simulations (Feature F6)', () => {

  // =========================================================================
  // TASK 1: LIGHTHOUSE TRIANGULATION ADVERSARIAL ATTACKS
  // =========================================================================
  describe('Task 1: Lighthouse Triangulation Attacks', () => {

    it('rejects inverted elevation angles where alpha > beta', () => {
      const invertedCases = [
        { alpha: 60, beta: 45 },
        { alpha: 80, beta: 20 },
        { alpha: 45.1, beta: 45.0 }
      ];

      for (const c of invertedCases) {
        const res = calculateLighthouse({ AB: 30, alpha: c.alpha, beta: c.beta });
        assert.equal(res.isValid, false, `alpha=${c.alpha} > beta=${c.beta} must be invalid`);
        assert.ok(res.errorVi && res.errorVi.includes('Lỗi hình học'), 'Provides Vietnamese geometric error message');
        assert.ok(res.errorEn && res.errorEn.includes('Geometric violation'), 'Provides English geometric error message');
      }
    });

    it('rejects equal elevation angles where alpha === beta (parallel sight rays)', () => {
      const res = calculateLighthouse({ AB: 30, alpha: 45, beta: 45 });
      assert.equal(res.isValid, false, 'alpha === beta must be invalid');
      assert.ok(res.errorVi.includes('Lỗi hình học'));
    });

    it('rejects near-zero elevation angle differences (beta - alpha <= 0.05°)', () => {
      const nearZeroCases = [0.01, 0.02, 0.049, 0.05];
      for (const diff of nearZeroCases) {
        const alpha = 42.0;
        const beta = alpha + diff;
        const res = calculateLighthouse({ AB: 30, alpha, beta });
        assert.equal(res.isValid, false, `diff=${diff}° must be rejected as convergence error`);
        assert.ok(res.errorVi.includes('Lỗi hội tụ'), 'Provides Vietnamese convergence error');
        assert.ok(res.errorEn.includes('Convergence error'), 'Provides English convergence error');
      }
    });

    it('successfully computes when angle difference is barely above convergence limit (diff = 0.06°)', () => {
      const alpha = 42.0;
      const beta = 42.06;
      const res = calculateLighthouse({ AB: 30, alpha, beta });
      assert.equal(res.isValid, true, 'diff=0.06° should be valid');
      assert.ok(Number.isFinite(res.CD), 'Calculated height must be finite');
      assert.ok(Number.isFinite(res.BD), 'Calculated BD must be finite');
      assert.ok(res.CD > 1000, 'Height is very large because angle difference is tiny');
    });

    it('handles extreme elevation angles near 90° (beta = 89.9°, beta = 89.99°)', () => {
      const res89_9 = calculateLighthouse({ AB: 30, alpha: 42, beta: 89.9 });
      assert.equal(res89_9.isValid, true);
      assert.ok(Number.isFinite(res89_9.CD), 'Height at beta=89.9 must be finite');
      assert.ok(Math.abs(res89_9.CD - 27.05) < 0.1, `Height ${res89_9.CD} should be ~27.05m`);
      assert.ok(Math.abs(res89_9.CD - res89_9.CD_cot) < 1e-4, 'Law of Sines and Cotangent cross-check agree');

      const res89_99 = calculateLighthouse({ AB: 30, alpha: 42, beta: 89.99 });
      assert.equal(res89_99.isValid, true);
      assert.ok(Number.isFinite(res89_99.CD));
      assert.ok(Math.abs(res89_99.CD - res89_99.CD_cot) < 1e-4);
    });

    it('verifies exact mathematical identity: CD_sines === CD_cotangent across 500 random valid configurations', () => {
      let seed = 12345;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };

      for (let i = 0; i < 500; i++) {
        const AB = 10.0 + rnd() * 90.0; // AB in [10, 100]
        const alpha = 15.0 + rnd() * 55.0; // alpha in [15, 70]
        const beta = alpha + 0.1 + rnd() * (85.0 - alpha - 0.1); // beta in (alpha + 0.1, 85]

        const res = calculateLighthouse({ AB, alpha, beta });
        assert.equal(res.isValid, true);
        const relDiff = Math.abs(res.CD - res.CD_cot) / res.CD;
        assert.ok(relDiff < 1e-9, `Mismatch at i=${i}: CD=${res.CD}, CD_cot=${res.CD_cot}, relDiff=${relDiff}`);
      }
    });

    it('documents empirical behavior on non-positive baseline AB <= 0', () => {
      // Empirical verification: check behavior when AB <= 0
      const resZero = calculateLighthouse({ AB: 0, alpha: 42, beta: 63 });
      const resNeg = calculateLighthouse({ AB: -30, alpha: 42, beta: 63 });

      // Document observed behavior: calculation does not crash, values scale with AB
      assert.equal(resZero.CD, 0, 'Zero baseline yields zero height');
      assert.ok(Number.isFinite(resZero.CD), 'Zero baseline does not produce NaN');
      assert.ok(Number.isFinite(resNeg.CD), 'Negative baseline does not produce NaN');
    });

    it('documents empirical behavior on NaN inputs', () => {
      const resNaN = calculateLighthouse({ AB: 30, alpha: NaN, beta: 63 });
      // When alpha is NaN, alpha >= beta is false, diffDeg <= 0.05 is false in JS
      assert.ok(resNaN !== null, 'Does not throw exception on NaN input');
    });
  });

  // =========================================================================
  // TASK 2: PARABOLIC ARCH HIGHWAY CLEARANCE ATTACKS
  // =========================================================================
  describe('Task 2: Parabolic Arch Highway Clearance Attacks', () => {

    it('validates exact clearance at standard benchmark: Width 3m centered -> +0.956m (PASS)', () => {
      const res = calculateParabolicArch({
        span: 8.0,
        apexHeight: 6.0,
        truckWidth: 3.0,
        truckHeight: 4.2,
        xOffset: 0.0
      });

      assert.equal(res.a, -0.375);
      assert.equal(res.leftEdgeX, -1.5);
      assert.equal(res.rightEdgeX, 1.5);
      assert.equal(res.ceilingLeft, 5.15625);
      assert.equal(res.ceilingRight, 5.15625);
      assert.ok(Math.abs(res.minMargin - 0.95625) < 1e-6, `Margin must be +0.95625m, got ${res.minMargin}`);
      assert.equal(res.status, 'PASS');
      assert.equal(res.clearsSafely, true);
    });

    it('validates exact clearance at standard benchmark: Width 4m centered -> +0.300m (PASS)', () => {
      const res = calculateParabolicArch({
        span: 8.0,
        apexHeight: 6.0,
        truckWidth: 4.0,
        truckHeight: 4.2,
        xOffset: 0.0
      });

      assert.equal(res.leftEdgeX, -2.0);
      assert.equal(res.rightEdgeX, 2.0);
      assert.equal(res.ceilingLeft, 4.5);
      assert.equal(res.ceilingRight, 4.5);
      assert.ok(Math.abs(res.minMargin - 0.3) < 1e-6, `Margin must be +0.300m, got ${res.minMargin}`);
      assert.equal(res.status, 'PASS');
      assert.equal(res.clearsSafely, true);
    });

    it('verifies critical lateral drift threshold for 4m truck is exactly 19.089cm', () => {
      const res = calculateParabolicArch({
        span: 8.0,
        apexHeight: 6.0,
        truckWidth: 4.0,
        truckHeight: 4.2,
        xOffset: 0.0
      });

      // Theoretical: sqrt((6.0 - 4.2) / 0.375) - 2.0 = sqrt(4.8) - 2.0 ≈ 0.19089023m
      const expectedThreshold = Math.sqrt(1.8 / 0.375) - 2.0;
      assert.ok(Math.abs(res.maxAllowableDrift - expectedThreshold) < 1e-9);
      assert.ok(Math.abs(res.maxAllowableDrift - 0.19089) < 0.0001);
    });

    it('validates drift benchmark: Width 4m with drift > 19.1cm -> COLLISION', () => {
      // 19.1cm = 0.191m (> 0.19089m)
      const resDrift19_1 = calculateParabolicArch({
        span: 8.0,
        apexHeight: 6.0,
        truckWidth: 4.0,
        truckHeight: 4.2,
        xOffset: 0.191
      });

      assert.ok(resDrift19_1.minMargin < 0, `minMargin (${resDrift19_1.minMargin}) must be negative`);
      assert.equal(resDrift19_1.status, 'COLLISION');
      assert.equal(resDrift19_1.clearsSafely, false);

      // 25cm drift (Preset arch-drift-collision)
      const resDrift25 = calculateParabolicArch({
        span: 8.0,
        apexHeight: 6.0,
        truckWidth: 4.0,
        truckHeight: 4.2,
        xOffset: 0.25
      });
      assert.ok(resDrift25.minMargin < 0);
      assert.equal(resDrift25.status, 'COLLISION');
      assert.equal(resDrift25.clearsSafely, false);
    });

    it('verifies tri-state status transitions: PASS -> WARNING (< 15cm) -> COLLISION (< 0)', () => {
      // PASS: drift = 0.05m -> margin ≈ 0.226m >= 0.15m
      const resPass = calculateParabolicArch({
        span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.05
      });
      assert.ok(resPass.minMargin >= 0.15);
      assert.equal(resPass.status, 'PASS');
      assert.equal(resPass.clearsSafely, true);

      // WARNING: drift = 0.15m -> margin ≈ 0.066m (< 0.15m and >= 0)
      const resWarn = calculateParabolicArch({
        span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.15
      });
      assert.ok(resWarn.minMargin > 0 && resWarn.minMargin < 0.15);
      assert.equal(resWarn.status, 'WARNING');
      assert.equal(resWarn.clearsSafely, true);

      // COLLISION: drift = 0.20m -> margin ≈ -0.015m (< 0)
      const resCollision = calculateParabolicArch({
        span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.20
      });
      assert.ok(resCollision.minMargin < 0);
      assert.equal(resCollision.status, 'COLLISION');
      assert.equal(resCollision.clearsSafely, false);
    });

    it('triggers base collision when truck width equals or exceeds arch span (w >= 8m)', () => {
      const widths = [8.0, 8.5, 12.0, 50.0];
      for (const w of widths) {
        const res = calculateParabolicArch({
          span: 8.0, apexHeight: 6.0, truckWidth: w, truckHeight: 4.2, xOffset: 0.0
        });
        assert.equal(res.status, 'COLLISION');
        assert.equal(res.clearsSafely, false);
        assert.ok(res.reasonVi.includes('nhịp đáy'));
        assert.ok(res.reasonEn.includes('arch ground span'));
      }
    });

    it('triggers apex collision when truck height equals or exceeds arch peak (h >= 6m)', () => {
      const heights = [6.0, 6.5, 9.0, 20.0];
      for (const h of heights) {
        const res = calculateParabolicArch({
          span: 8.0, apexHeight: 6.0, truckWidth: 3.0, truckHeight: h, xOffset: 0.0
        });
        assert.equal(res.status, 'COLLISION');
        assert.equal(res.clearsSafely, false);
        assert.ok(res.reasonVi.includes('đỉnh'));
        assert.ok(res.reasonEn.includes('arch apex'));
      }
    });

    it('handles extreme lateral drift offsets outside the arch (xOffset = +/-10m)', () => {
      const resPos10 = calculateParabolicArch({
        span: 8.0, apexHeight: 6.0, truckWidth: 3.0, truckHeight: 4.2, xOffset: 10.0
      });
      assert.equal(resPos10.ceilingLeft, 0.0, 'Outside arch span ceiling must clamp to 0');
      assert.equal(resPos10.ceilingRight, 0.0);
      assert.equal(resPos10.status, 'COLLISION');
      assert.equal(resPos10.clearsSafely, false);

      const resNeg10 = calculateParabolicArch({
        span: 8.0, apexHeight: 6.0, truckWidth: 3.0, truckHeight: 4.2, xOffset: -10.0
      });
      assert.equal(resNeg10.ceilingLeft, 0.0);
      assert.equal(resNeg10.ceilingRight, 0.0);
      assert.equal(resNeg10.status, 'COLLISION');
      assert.equal(resNeg10.clearsSafely, false);
    });

    it('proves lateral drift symmetry: minMargin(xOffset) === minMargin(-xOffset)', () => {
      const testOffsets = [0.05, 0.12, 0.18, 0.25, 0.5, 1.2];
      for (const off of testOffsets) {
        const resR = calculateParabolicArch({
          span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: off
        });
        const resL = calculateParabolicArch({
          span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: -off
        });
        assert.ok(Math.abs(resR.minMargin - resL.minMargin) < 1e-12, `Symmetry violation at offset ${off}`);
        assert.equal(resR.status, resL.status);
      }
    });
  });

  // =========================================================================
  // TASK 3: BUS REVENUE OPTIMIZATION ADVERSARIAL ATTACKS
  // =========================================================================
  describe('Task 3: Bus Revenue Optimization Attacks', () => {

    it('verifies quadratic vertex maximum at x=4 (fare 160k, 80 riders, 12.8M VND revenue)', () => {
      const res = calculateBusRevenue({ x: 4 });
      assert.equal(res.x, 4);
      assert.equal(res.fare, 160000, 'Ticket fare P(4) = 160,000 VNĐ');
      assert.equal(res.riders, 80, 'Passenger demand Q(4) = 80 riders');
      assert.equal(res.revenue, 12800000, 'Total revenue R(4) = 12,800,000 VNĐ');
      assert.equal(res.vertexX, 4);
      assert.equal(res.maxRevenue, 12800000);
      assert.equal(res.vertexFare, 160000);
      assert.equal(res.vertexRiders, 80);
      assert.equal(res.isOptimal, true);
      assert.equal(res.deltaRevenue, 800000, 'Delta gain over baseline is +800,000 VNĐ');
    });

    it('verifies first derivative / tangent slope sign transitions around vertex: R\'(3) > 0, R\'(4) = 0, R\'(5) < 0', () => {
      // R'(x) = -100,000x + 400,000
      const res3 = calculateBusRevenue({ x: 3 });
      const res4 = calculateBusRevenue({ x: 4 });
      const res5 = calculateBusRevenue({ x: 5 });

      assert.equal(res3.tangentSlope, 100000, 'R\'(3) = +100,000 VNĐ/step (increasing)');
      assert.ok(res3.tangentSlope > 0);

      assert.equal(res4.tangentSlope, 0, 'R\'(4) = 0 VNĐ/step (stationary point / horizontal tangent)');

      assert.equal(res5.tangentSlope, -100000, 'R\'(5) = -100,000 VNĐ/step (decreasing)');
      assert.ok(res5.tangentSlope < 0);
    });

    it('verifies strict concavity and symmetric delta loss around x=4 across all integer deltas', () => {
      const vertexRev = calculateBusRevenue({ x: 4 }).revenue;

      for (let delta = 1; delta <= 8; delta++) {
        const left = calculateBusRevenue({ x: 4 - delta });
        const right = calculateBusRevenue({ x: 4 + delta });

        assert.equal(left.revenue, right.revenue, `Symmetry must hold at delta=${delta}`);
        assert.ok(left.revenue < vertexRev, `Revenue at x=${4 - delta} must be strictly less than vertex`);
        assert.ok(right.revenue < vertexRev, `Revenue at x=${4 + delta} must be strictly less than vertex`);

        // Delta loss formula: -a * delta^2 = 50,000 * delta^2
        const expectedLoss = 50000 * delta * delta;
        assert.equal(vertexRev - left.revenue, expectedLoss);
        assert.equal(vertexRev - right.revenue, expectedLoss);
      }
    });

    it('flags negative price adjustment warning when x <= -12 (fare <= 0)', () => {
      // x = -12 -> fare = 120,000 + 10,000(-12) = 0
      const resNeg12 = calculateBusRevenue({ x: -12 });
      assert.equal(resNeg12.fare, 0);
      assert.ok(resNeg12.fareWarning !== null, 'x=-12 must trigger fare warning');
      assert.ok(resNeg12.fareWarning.vi.includes('không thể mang giá trị âm hoặc bằng 0'));

      // x = -13 -> fare = -10,000
      const resNeg13 = calculateBusRevenue({ x: -13 });
      assert.equal(resNeg13.fare, -10000);
      assert.ok(resNeg13.fareWarning !== null, 'x=-13 must trigger fare warning');

      // x = -20 -> fare = -80,000
      const resNeg20 = calculateBusRevenue({ x: -20 });
      assert.equal(resNeg20.fare, -80000);
      assert.ok(resNeg20.fareWarning !== null);
    });

    it('flags passenger capacity warning when x < 0 (riders > 100 capacity)', () => {
      const testX = [-1, -3, -8, -10];
      for (const x of testX) {
        const res = calculateBusRevenue({ x });
        assert.ok(res.riders > 100, `Riders (${res.riders}) must exceed 100`);
        assert.ok(res.capacityWarning !== null);
        assert.ok(res.capacityWarning.vi.includes('Vượt quá sức chứa'));
        assert.ok(res.capacityWarning.en.includes('Exceeds maximum bus capacity'));
      }
    });

    it('flags high price adjustment warning when x >= 20 (ridership <= 0)', () => {
      // x = 20 -> riders = 100 - 5(20) = 0
      const res20 = calculateBusRevenue({ x: 20 });
      assert.equal(res20.riders, 0);
      assert.ok(res20.capacityWarning !== null);
      assert.ok(res20.capacityWarning.vi.includes('giảm về 0'));

      // x = 25 -> riders = 100 - 5(25) = -25
      const res25 = calculateBusRevenue({ x: 25 });
      assert.equal(res25.riders, -25);
      assert.ok(res25.capacityWarning !== null);
    });
  });

  // =========================================================================
  // TASK 4: COMPONENT LIFECYCLE & INTEGRATION ROBUSTNESS
  // =========================================================================
  describe('Task 4: Component Lifecycle & Integration Robustness', () => {

    it('instantiates all 3 simulation types and updates parameters cleanly', () => {
      const types = ['svg-lighthouse', 'svg-parabola', 'svg-optimization'];
      for (const type of types) {
        const sim = new MathSimulations({ type, mode: 'facts', language: 'dual' });
        assert.equal(sim.type, type);

        const resInitial = sim.getCalculationResults();
        assert.ok(resInitial !== null, `Initial results for ${type} must be non-null`);

        sim.setMode('guidance');
        assert.equal(sim.mode, 'guidance');

        sim.setLanguage('vi');
        assert.equal(sim.language, 'vi');

        sim.setLanguage('en');
        assert.equal(sim.language, 'en');

        sim.destroy();
      }
    });

    it('handles all preset dispatches without error', () => {
      const presets = [
        'lighthouse-default',
        'arch-3m-center',
        'arch-4m-baseline',
        'arch-drift-collision',
        'bus-vertex',
        'bus-baseline'
      ];

      for (const preset of presets) {
        let type = 'svg-lighthouse';
        if (preset.startsWith('arch')) type = 'svg-parabola';
        if (preset.startsWith('bus')) type = 'svg-optimization';

        const sim = new MathSimulations({ type });
        sim._handlePreset({ currentTarget: { getAttribute: () => preset } });

        const res = sim.getCalculationResults();
        assert.ok(res !== null, `Preset ${preset} must produce non-null results`);
        sim.destroy();
      }
    });

    it('triggers onParameterChange callback when updateParameters is called', () => {
      let callbackFired = false;
      let returnedParams = null;
      let returnedResults = null;

      const sim = new MathSimulations({
        type: 'svg-parabola',
        onParameterChange: (p, r) => {
          callbackFired = true;
          returnedParams = p;
          returnedResults = r;
        }
      });

      sim.updateParameters({ truckWidth: 3.5 });
      assert.equal(callbackFired, true);
      assert.equal(returnedParams.truckWidth, 3.5);
      assert.equal(returnedResults.truckWidth, 3.5);
      sim.destroy();
    });
  });
});
