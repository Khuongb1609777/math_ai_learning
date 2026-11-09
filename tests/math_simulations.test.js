/**
 * tests/math_simulations.test.js
 * Comprehensive Unit Test Suite for MathSimulations Engine & Components
 * Milestone: M3 (Feature F6)
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLighthouse,
  calculateParabolicArch,
  calculateBusRevenue,
  MathSimulations
} from '../src/components/MathSimulations.js';

function createMockContainer() {
  const store = { html: '' };
  return {
    set innerHTML(val) { store.html = val; },
    get innerHTML() { return store.html; },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('Feature F6: Dynamic Math Simulations Unit Tests', () => {

  // =========================================================================
  // 1. LIGHTHOUSE TRIANGULATION TESTS
  // =========================================================================
  describe('Simulation 1: Lighthouse Triangulation Calculation Engine', () => {
    it('calculates standard KHKT baseline (AB=30m, alpha=42°, beta=63°)', () => {
      const res = calculateLighthouse({ AB: 30, alpha: 42, beta: 63 });
      assert.equal(res.isValid, true);
      assert.equal(res.angleADBDeg, 21);
      assert.ok(Math.abs(res.BD - 55.99) < 0.05, `BD ${res.BD} should be ~55.99m`);
      assert.equal(res.heightRounded, 49.9, 'Height rounded to 1 decimal place is 49.9m');
      assert.ok(Math.abs(res.CD_cot - 49.91) < 0.05, 'Cotangent cross-check verifies 49.91m');
      assert.ok(Math.abs(res.BC - 25.42) < 0.05, 'Inaccessible base BC is ~25.42m');
    });

    it('rejects inverted elevation angles (alpha >= beta) gracefully', () => {
      const res = calculateLighthouse({ AB: 30, alpha: 65, beta: 45 });
      assert.equal(res.isValid, false);
      assert.ok(res.errorVi.includes('Lỗi hình học'));
      assert.ok(res.errorEn.includes('Geometric violation'));
    });

    it('rejects converging elevation angles (diff <= 0.05°) against zero-division', () => {
      const res = calculateLighthouse({ AB: 30, alpha: 42.0, beta: 42.01 });
      assert.equal(res.isValid, false);
      assert.ok(res.errorVi.includes('Lỗi hội tụ'));
      assert.ok(res.errorEn.includes('Convergence error'));
    });

    it('dynamically adapts to varied surveyor distances AB in [10, 100]', () => {
      const resShort = calculateLighthouse({ AB: 15, alpha: 42, beta: 63 });
      const resLong = calculateLighthouse({ AB: 60, alpha: 42, beta: 63 });
      assert.ok(Math.abs(resShort.CD - 24.95) < 0.1);
      assert.ok(Math.abs(resLong.CD - 99.8) < 0.2);
    });
  });

  // =========================================================================
  // 2. PARABOLIC ARCH HIGHWAY CLEARANCE TESTS
  // =========================================================================
  describe('Simulation 2: Parabolic Arch Highway Clearance Engine', () => {
    it('validates standard KHKT centered 4m truck baseline (width=4m, height=4.2m, offset=0)', () => {
      const res = calculateParabolicArch({ span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.0 });
      assert.equal(res.a, -0.375);
      assert.equal(res.leftEdgeX, -2.0);
      assert.equal(res.rightEdgeX, 2.0);
      assert.equal(res.ceilingLeft, 4.5);
      assert.equal(res.ceilingRight, 4.5);
      assert.ok(Math.abs(res.minMargin - 0.3) < 1e-6, 'Clearance margin must be exactly 0.3m (30cm)');
      assert.equal(res.status, 'PASS');
      assert.equal(res.clearsSafely, true);
    });

    it('validates 3m truck centered clearance (w=3m, h=4.2m, offset=0) yielding +0.956m margin', () => {
      const res = calculateParabolicArch({ span: 8.0, apexHeight: 6.0, truckWidth: 3.0, truckHeight: 4.2, xOffset: 0.0 });
      assert.equal(res.leftEdgeX, -1.5);
      assert.equal(res.rightEdgeX, 1.5);
      // y(1.5) = -0.375*(2.25) + 6 = 5.15625
      assert.equal(res.ceilingLeft, 5.15625);
      assert.equal(res.ceilingRight, 5.15625);
      assert.ok(Math.abs(res.minMargin - 0.95625) < 1e-5);
      assert.equal(res.status, 'PASS');
    });

    it('detects razor-thin warning when margin is between 0 and 15cm', () => {
      // Offset 15cm for width 4m: edge = 2.15m => y(2.15) = -0.375*(4.6225) + 6 = 4.26656m => margin = 6.6cm
      const res = calculateParabolicArch({ span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.15 });
      assert.equal(res.status, 'WARNING');
      assert.equal(res.clearsSafely, true);
      assert.ok(res.minMargin > 0 && res.minMargin < 0.15);
    });

    it('detects roof collision when truck drifts beyond threshold (offset >= 20cm for 4m truck)', () => {
      const res = calculateParabolicArch({ span: 8.0, apexHeight: 6.0, truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.20 });
      assert.equal(res.status, 'COLLISION');
      assert.equal(res.clearsSafely, false);
      assert.ok(res.minMargin < 0);
    });

    it('detects base collision when truck width equals or exceeds arch span', () => {
      const res = calculateParabolicArch({ span: 8.0, apexHeight: 6.0, truckWidth: 8.5, truckHeight: 4.2, xOffset: 0.0 });
      assert.equal(res.status, 'COLLISION');
      assert.ok(res.reasonVi.includes('Bề rộng xe vượt quá nhịp đáy'));
    });

    it('detects top apex collision when truck height exceeds arch peak', () => {
      const res = calculateParabolicArch({ span: 8.0, apexHeight: 6.0, truckWidth: 2.0, truckHeight: 6.5, xOffset: 0.0 });
      assert.equal(res.status, 'COLLISION');
      assert.ok(res.reasonVi.includes('Chiều cao xe vượt quá đỉnh'));
    });
  });

  // =========================================================================
  // 3. BUS REVENUE OPTIMIZATION TESTS
  // =========================================================================
  describe('Simulation 3: Cho Lach Bus Revenue Optimization Engine', () => {
    it('calculates optimal vertex at x=4 with fare 160k, 80 riders, and 12.8M VND revenue', () => {
      const res = calculateBusRevenue({ x: 4 });
      assert.equal(res.x, 4);
      assert.equal(res.fare, 160000, 'Ticket fare at x=4 is 160,000 VND');
      assert.equal(res.riders, 80, 'Passenger ridership at x=4 is 80');
      assert.equal(res.revenue, 12800000, 'Total revenue at x=4 is 12,800,000 VND');
      assert.equal(res.tangentSlope, 0, 'Tangent slope at vertex must be exactly 0 (horizontal tangent)');
      assert.equal(res.isOptimal, true);
      assert.equal(res.deltaRevenue, 800000, 'Revenue gain over baseline is +800,000 VND');
    });

    it('evaluates baseline revenue at x=0 with fare 120k and 100 riders', () => {
      const res = calculateBusRevenue({ x: 0 });
      assert.equal(res.fare, 120000);
      assert.equal(res.riders, 100);
      assert.equal(res.revenue, 12000000);
      assert.equal(res.tangentSlope, 400000, 'Marginal revenue rate at x=0 is +400,000 VND/step');
    });

    it('verifies strict concavity and symmetric delta loss around x=4', () => {
      const rAtVertex = calculateBusRevenue({ x: 4 }).revenue;
      const rStep3 = calculateBusRevenue({ x: 3 }).revenue;
      const rStep5 = calculateBusRevenue({ x: 5 }).revenue;

      assert.equal(rStep3, rStep5, 'Revenue curve is symmetric around x=4');
      assert.ok(rAtVertex > rStep3, 'Vertex revenue strictly exceeds x=3');
      assert.ok(rAtVertex > rStep5, 'Vertex revenue strictly exceeds x=5');
      assert.equal(rAtVertex - rStep3, 50000, 'Loss of 1 step from optimum is exactly 50,000 VND');
    });

    it('flags physical capacity warning when ridership exceeds 100 (x < 0)', () => {
      const res = calculateBusRevenue({ x: -2 });
      assert.ok(res.riders > 100);
      assert.ok(res.capacityWarning !== null);
      assert.ok(res.capacityWarning.vi.includes('Vượt quá sức chứa'));
    });

    it('flags negative fare warning when x <= -13', () => {
      const res = calculateBusRevenue({ x: -13 });
      assert.ok(res.fare < 0);
      assert.ok(res.fareWarning !== null);
    });
  });

  // =========================================================================
  // 4. COMPONENT LIFECYCLE & STATE TESTS
  // =========================================================================
  describe('Simulation Component API & Lifecycle', () => {
    it('instantiates and provides public methods without throwing', () => {
      const sim = new MathSimulations({
        type: 'svg-lighthouse',
        mode: 'facts',
        language: 'dual'
      });
      assert.equal(sim.type, 'svg-lighthouse');
      assert.equal(sim.mode, 'facts');
      assert.equal(sim.language, 'dual');

      sim.setMode('guidance');
      assert.equal(sim.mode, 'guidance');

      sim.setLanguage('en');
      assert.equal(sim.language, 'en');

      sim.updateParameters({ AB: 45 });
      assert.equal(sim.params.AB, 45);

      const results = sim.getCalculationResults();
      assert.equal(results.AB, 45);
      assert.equal(results.isValid, true);
    });

    it('mounts into container and renders SVG content for each simulation type', () => {
      const container = createMockContainer();

      // Lighthouse
      const sim1 = new MathSimulations({ container, type: 'svg-lighthouse' });
      assert.ok(container.innerHTML.includes('Trigonometry Triangulation'));
      assert.ok(container.innerHTML.includes('<svg'));

      // Parabolic Arch
      const sim2 = new MathSimulations({ container, type: 'svg-parabola' });
      assert.ok(container.innerHTML.includes('Quadratic Parabola'));
      assert.ok(container.innerHTML.includes('<svg'));

      // Bus Revenue
      const sim3 = new MathSimulations({ container, type: 'svg-optimization' });
      assert.ok(container.innerHTML.includes('Bus Revenue'));
      assert.ok(container.innerHTML.includes('<svg'));

      sim3.destroy();
      assert.equal(container.innerHTML, '');
    });
  });
});
