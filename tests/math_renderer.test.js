import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderMath, renderMathInText, formatLatexToHtml } from '../src/services/mathRenderer.js';
import { DEFAULT_LESSONS } from '../src/data/lessons.js';

describe('Requirement R1: Math Formula & Symbol Renderer', () => {
  it('Bug 1: correctly renders degree symbols (^\\circ) to ° without raw LaTeX', () => {
    assert.ok(renderMath('63^\\circ').includes('63°'));
    assert.ok(renderMath('42^\\circ').includes('42°'));
    assert.ok(renderMath('^\\circ').includes('°'));
    assert.ok(!renderMath('63^\\circ').includes('^\\circ'));
  });

  it('Bug 2: correctly renders angle widehat notation (\\widehat{CBD})', () => {
    const rendered = renderMath('\\widehat{CBD} = 63^\\circ');
    assert.ok(rendered.includes('math-widehat'));
    assert.ok(rendered.includes('CBD'));
    assert.ok(rendered.includes('63°'));
    assert.ok(!rendered.includes('\\widehat'));
  });

  it('Bug 3: cleanly formats units (\\text{ m}, \\text{ VNĐ}) and commas ({,})', () => {
    const mRender = renderMath('AB = 30\\text{ m}');
    assert.ok(mRender.includes('30'));
    assert.ok(mRender.includes('m'));
    assert.ok(!mRender.includes('\\text'));

    const vndRender = renderMath('P_0 = 200{,}000\\text{ VNĐ}');
    assert.ok(vndRender.includes('200,000'));
    assert.ok(vndRender.includes('VNĐ'));
    assert.ok(!vndRender.includes('{,}'));
    assert.ok(!vndRender.includes('\\text'));
  });

  it('Bug 4: preserves nested Vietnamese text in \\text{...} without errors', () => {
    const rendered = renderMath('C \\text{ is inaccessible (không thể tiếp cận)}');
    assert.ok(rendered.includes('không thể tiếp cận'));
    assert.ok(!rendered.includes('\\text'));
  });

  it('Bug 5: formats fractions, square powers, and subscripts', () => {
    const frac = renderMath('BD = \\frac{30 \\cdot \\sin(42^\\circ)}{\\sin(21^\\circ)}');
    assert.ok(frac.includes('math-frac'));
    assert.ok(frac.includes('math-num'));
    assert.ok(frac.includes('math-denom'));
    assert.ok(frac.includes('·'));
    assert.ok(!frac.includes('\\frac'));

    const quad = renderMath('y = ax^2 + bx + c');
    assert.ok(quad.includes('<sup>2</sup>'));
    assert.ok(!quad.includes('^2'));

    const vertex = renderMath('x_V = 4');
    assert.ok(vertex.includes('<sub>V</sub>'));
    assert.ok(!vertex.includes('_V'));
  });

  it('Test F14.B4: Malformed LaTeX expressions display fallback without throwing', () => {
    const res = renderMath('\\invalid_syntax{');
    assert.ok(res.includes('math-fallback'));
    assert.ok(!res.includes('undefined'));
  });

  it('verifies all 39 formulas across all 3 lessons render without leaking raw LaTeX', () => {
    for (const lesson of DEFAULT_LESSONS) {
      for (const scene of lesson.scenes) {
        for (const formula of (scene.formulas || [])) {
          const rendered = renderMath(formula);
          assert.ok(rendered && rendered.length > 0, `Formula renders non-empty: ${formula}`);
          assert.ok(!rendered.includes('\\widehat'), `Leak \\widehat in: ${formula}`);
          assert.ok(!rendered.includes('^\\circ'), `Leak ^\\circ in: ${formula}`);
          assert.ok(!rendered.includes('\\text{'), `Leak \\text{ in: ${formula}`);
          assert.ok(!rendered.includes('\\frac{'), `Leak \\frac{ in: ${formula}`);
          assert.ok(!rendered.includes('\\cdot'), `Leak \\cdot in: ${formula}`);
          assert.ok(!rendered.includes('{,}'), `Leak {,} in: ${formula}`);
        }
      }
    }
  });

  it('parses inline math expressions with renderMathInText', () => {
    const text = 'Calculate distance $AB = 30\\text{ m}$ accurately.';
    const parsed = renderMathInText(text);
    assert.ok(parsed.includes('30'));
    assert.ok(!parsed.includes('$'));
    assert.ok(!parsed.includes('\\text'));
  });
});
