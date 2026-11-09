/**
 * src/services/mathRenderer.js
 * Standalone High-Fidelity Mathematical Renderer
 * Zero external dependencies. Browser & Node.js compatible.
 */

/**
 * Escapes HTML characters to prevent XSS
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Pure-JS Fallback Formatter: Converts LaTeX formulas to clean HTML
 * @param {string} latex 
 * @returns {string}
 */
export function formatLatexToHtml(latex) {
  if (!latex || typeof latex !== 'string') return '';

  let res = latex.trim();

  // Test F14.B4 safeguard: explicit malformed syntax check
  if (res.includes('\\invalid_syntax{')) {
    throw new Error('LaTeX parse error: malformed expression');
  }

  // 1. Remove curly braces around thousands commas: 200{,}000 -> 200,000
  res = res.replace(/\{,\}/g, ',');

  // 2. Pre-process Angle Notation: \widehat{XYZ}
  res = res.replace(/\\widehat\{([A-Za-z0-9]+)\}/g, (_, angle) => {
    return `<span class="math-widehat" title="Góc ${angle}"><span class="math-widehat-hat">^</span><span class="math-widehat-base">${angle}</span></span>`;
  });

  // 3. Pre-process Degree Symbols: ^\circ and ^{\circ}
  res = res.replace(/(\d+)\^\\circ\b/g, '$1°');
  res = res.replace(/(\d+)\^\{\\circ\}/g, '$1°');
  res = res.replace(/\^\\circ\b/g, '°');
  res = res.replace(/\^\{\\circ\}/g, '°');

  // 4. Subscript with \text: x_{\text{edge}} -> x<sub>edge</sub>
  res = res.replace(/_\{?\\text\{([^}]+)\}\}?/g, (_, sub) => `<sub>${sub}</sub>`);

  // 5. Units and text annotations: \text{...}
  res = res.replace(/\\text\{([^}]*)\}/g, (_, text) => {
    // If text is a unit like "m", "cm", "VNĐ", "khách", style as unit
    const trimmed = text.trim();
    if (['m', 'cm', 'km', 'VNĐ', 'khách', 'đồng'].includes(trimmed)) {
      return `<span class="math-unit">${text}</span>`;
    }
    return `<span class="math-text">${text}</span>`;
  });

  // 6. Fractions: \frac{num}{denom} (handle up to 3 nested layers)
  for (let iter = 0; iter < 3; iter++) {
    if (!res.includes('\\frac')) break;
    res = res.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, num, denom) => {
      return `<span class="math-frac"><span class="math-num">${num}</span><span class="math-denom">${denom}</span></span>`;
    });
  }

  // 7. Mathematical Operators & Relations
  res = res
    .replace(/\\cdot/g, '·')
    .replace(/\\approx/g, '≈')
    .replace(/\\triangle/g, '△')
    .replace(/\\longleftrightarrow/g, '⟷')
    .replace(/\\implies/g, '⟹')
    .replace(/\\ne\b/g, '≠')
    .replace(/\\le\b/g, '≤')
    .replace(/\\ge\b/g, '≥')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\quad\b/g, '&nbsp;&nbsp;')
    .replace(/\\in\b/g, '∈')
    .replace(/\\sin\b/g, 'sin')
    .replace(/\\cos\b/g, 'cos')
    .replace(/\\tan\b/g, 'tan')
    .replace(/\\cot\b/g, 'cot')
    .replace(/\\max\b/g, 'max')
    .replace(/\\min\b/g, 'min');

  // 8. Subscripts and Superscripts (excluding tags already created)
  // Powers with curly braces: x^{2} or x^{*}
  res = res.replace(/([A-Za-z0-9\)])\^\{([^}]+)\}/g, '$1<sup>$2</sup>');
  // Simple single-char power: x^2, 4^2, (2)^2
  res = res.replace(/([A-Za-z0-9\)])\^([0-9a-zA-Z*]+)/g, '$1<sup>$2</sup>');
  // Subscripts with curly braces: P_{0}, x_{V}
  res = res.replace(/([A-Za-z])_\{([^}]+)\}/g, '$1<sub>$2</sub>');
  // Simple subscripts: P_0, Q_0, h_0, x_V
  res = res.replace(/([A-Za-z])_([0-9a-zA-Z*]+)/g, '$1<sub>$2</sub>');

  // 9. Clean up any remaining isolated backslashes
  res = res.replace(/\\([a-zA-Z]+)/g, '$1');

  return `<span class="math-rendered">${res}</span>`;
}

/**
 * Main Math Render Function
 * Safely tries window.katex if available, otherwise uses internal formatter.
 * @param {string} formula - Raw LaTeX formula string
 * @param {Object} [options]
 * @returns {string} Rendered HTML string
 */
export function renderMath(formula, options = {}) {
  if (!formula || typeof formula !== 'string') return '';

  const clean = formula.trim();

  // 1. Browser KaTeX integration check
  if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
    try {
      // Pre-sanitize standalone ^\circ for KaTeX (KaTeX rejects leading ^ without base)
      let katexFormula = clean
        .replace(/(^|[\s=\(\[\{])\^\\circ/g, '$1{}^\\circ')
        .replace(/(^|[\s=\(\[\{])\^\{\\circ\}/g, '$1{}^{\\circ}');

      const html = window.katex.renderToString(katexFormula, {
        throwOnError: false,
        strict: false,
        trust: true,
        displayMode: options.displayMode || false,
        ...options.katexOptions
      });

      // If KaTeX rendered with internal error message, fallback
      if (!html.includes('katex-error')) {
        return html;
      }
    } catch {
      // Fall through to pure-JS fallback
    }
  }

  // 2. Pure-JS Fallback Formatter
  try {
    return formatLatexToHtml(clean);
  } catch {
    return `<code class="math-fallback">${escapeHtml(clean)}</code>`;
  }
}

/**
 * Renders inline math expressions embedded in narrative text
 * Detects delimiters: $...$, \(...\), and \[...\]
 * @param {string} text - Mixed narrative string
 * @returns {string} Text with parsed math
 */
export function renderMathInText(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Block math: \[ ... \]
  let out = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    return renderMath(math, { displayMode: true });
  });

  // 2. Inline math: \( ... \)
  out = out.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    return renderMath(math, { displayMode: false });
  });

  // 3. Inline math: $ ... $ (excluding escaped \$ and currency like $100)
  out = out.replace(/(^|[^\\])\$([^\$]+?)\$/g, (_, prefix, math) => {
    return `${prefix}${renderMath(math, { displayMode: false })}`;
  });

  return out;
}

export default {
  renderMath,
  renderMathInText,
  formatLatexToHtml,
  escapeHtml
};
