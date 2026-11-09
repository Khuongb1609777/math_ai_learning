/**
 * src/components/MathSimulations.js
 * Interactive Dynamic Visual SVG Math Simulations
 * Milestone: M3 (5-Scene Player & Dynamic Visual Simulations - Feature F6)
 *
 * Supported Simulations:
 * 1. Lighthouse Triangulation (Trigonometry - Law of Sines & Inaccessible Base)
 * 2. Parabolic Arch Highway Clearance (Quadratic Function & Vehicle Safety Gauge)
 * 3. Cho Lach Bus Revenue Optimization (Quadratic Revenue & Dynamic Tangent Vertex)
 *
 * Architecture:
 * - Pure SVG & Native DOM (Zero external libraries / CDNs)
 * - Responsive viewBox coordinate systems
 * - Embeddable in Scene 2 ('facts') and Scene 4 ('guidance') of LessonPlayer
 * - Full Tri-State Bilingual support (VI / EN / DUAL)
 */

// Helper: Convert degrees to radians
const degToRad = (deg) => (deg * Math.PI) / 180;

/**
 * Pure Mathematical Calculation Engine: Lighthouse Triangulation
 * @param {Object} params
 * @param {number} [params.AB=30] - Distance between observation stations (meters)
 * @param {number} [params.alpha=42] - Elevation angle at station A (degrees)
 * @param {number} [params.beta=63] - Elevation angle at station B (degrees)
 * @returns {Object} Calculated geometric metrics and validation status
 */
export function calculateLighthouse(params = {}) {
  const AB = Number(params.AB ?? 30);
  const alpha = Number(params.alpha ?? 42);
  const beta = Number(params.beta ?? 63);

  // Geometric validations
  if (alpha >= beta) {
    return {
      isValid: false,
      errorVi: 'Lỗi hình học: Góc nâng tại trạm A (ở xa) phải nhỏ hơn góc nâng tại trạm B (ở gần).',
      errorEn: 'Geometric violation: Elevation angle at station A must be smaller than station B.',
      AB, alpha, beta
    };
  }

  const diffDeg = beta - alpha;
  if (diffDeg <= 0.05) {
    return {
      isValid: false,
      errorVi: 'Lỗi hội tụ: Hai góc nâng quá gần nhau, mẫu số tiến về 0.',
      errorEn: 'Convergence error: Elevation angles too close, denominator approaches zero.',
      AB, alpha, beta
    };
  }

  const alphaRad = degToRad(alpha);
  const betaRad = degToRad(beta);
  const angleADBDeg = diffDeg;
  const angleADBRad = degToRad(angleADBDeg);

  // Law of Sines in triangle ABD: BD / sin(alpha) = AB / sin(angleADB)
  const BD = (AB * Math.sin(alphaRad)) / Math.sin(angleADBRad);

  // In right triangle BCD: CD = BD * sin(beta)
  const CD = BD * Math.sin(betaRad);

  // Inaccessible ground distance: BC = BD * cos(beta)
  const BC = BD * Math.cos(betaRad);

  // Total distance AC = AB + BC
  const AC = AB + BC;

  // Cross-check height via cotangent formula: CD = AB / (cot(alpha) - cot(beta))
  const cotAlpha = 1.0 / Math.tan(alphaRad);
  const cotBeta = 1.0 / Math.tan(betaRad);
  const CD_cot = AB / (cotAlpha - cotBeta);

  return {
    isValid: true,
    AB,
    alpha,
    beta,
    angleADBDeg,
    BD,
    CD,
    BC,
    AC,
    CD_cot,
    heightRounded: Number(CD.toFixed(1)),
    bdRounded: Number(BD.toFixed(2)),
    bcRounded: Number(BC.toFixed(2))
  };
}

/**
 * Pure Mathematical Calculation Engine: Parabolic Arch Highway Clearance
 * @param {Object} params
 * @param {number} [params.span=8.0] - Arch ground span (meters)
 * @param {number} [params.apexHeight=6.0] - Vertex peak height (meters)
 * @param {number} [params.truckWidth=3.0] - Vehicle width (meters)
 * @param {number} [params.truckHeight=4.2] - Vehicle height (meters)
 * @param {number} [params.xOffset=0.0] - Lateral drift displacement from center (meters)
 * @returns {Object} Clearance metrics and safety clearance status
 */
export function calculateParabolicArch(params = {}) {
  const span = Number(params.span ?? 8.0);
  const apexHeight = Number(params.apexHeight ?? 6.0);
  const truckWidth = Number(params.truckWidth ?? 3.0);
  const truckHeight = Number(params.truckHeight ?? 4.2);
  const xOffset = Number(params.xOffset ?? 0.0);

  // Derive quadratic coefficient a for symmetric arch y = a*x^2 + apexHeight
  const halfSpan = span / 2.0;
  const a = -apexHeight / (halfSpan * halfSpan); // -6 / 16 = -0.375

  // Arch ceiling function
  const archY = (x) => {
    if (Math.abs(x) > halfSpan) return 0.0;
    return a * x * x + apexHeight;
  };

  // Outer edge coordinates of truck
  const leftEdgeX = xOffset - truckWidth / 2.0;
  const rightEdgeX = xOffset + truckWidth / 2.0;

  // Arch ceiling at edges
  const ceilingLeft = archY(leftEdgeX);
  const ceilingRight = archY(rightEdgeX);

  // Clearance margins at both edges
  const marginLeft = ceilingLeft - truckHeight;
  const marginRight = ceilingRight - truckHeight;
  const minMargin = Math.min(marginLeft, marginRight);

  // Collision and clearance assessment
  let status = 'PASS';
  let reasonVi = 'Xe lưu thông an toàn qua cổng vòm.';
  let reasonEn = 'Vehicle clears arch ceiling safely.';

  if (truckWidth >= span) {
    status = 'COLLISION';
    reasonVi = 'Va chạm chân cổng: Bề rộng xe vượt quá nhịp đáy cổng vòm!';
    reasonEn = 'Base collision: Vehicle width exceeds arch ground span!';
  } else if (truckHeight >= apexHeight) {
    status = 'COLLISION';
    reasonVi = 'Va chạm đỉnh vòm: Chiều cao xe vượt quá đỉnh cổng!';
    reasonEn = 'Apex collision: Vehicle height exceeds maximum arch apex!';
  } else if (minMargin < 0) {
    status = 'COLLISION';
    reasonVi = `Va chạm nóc xe: Trần cổng thấp hơn xe ${Math.abs(minMargin).toFixed(3)} m!`;
    reasonEn = `Roof collision: Arch ceiling is lower than truck by ${Math.abs(minMargin).toFixed(3)} m!`;
  } else if (minMargin < 0.15) {
    status = 'WARNING';
    reasonVi = `Cảnh báo nguy hiểm: Khoảng hở an toàn quá hẹp (${(minMargin * 100).toFixed(1)} cm)!`;
    reasonEn = `Hazard warning: Clearance margin is critically narrow (${(minMargin * 100).toFixed(1)} cm)!`;
  }

  // Critical drift threshold before roof collision
  // a * (truckWidth/2 + |drift|)^2 + apexHeight = truckHeight
  let maxAllowableDrift = 0;
  if (apexHeight > truckHeight) {
    const maxHalfWidth = Math.sqrt((apexHeight - truckHeight) / -a);
    maxAllowableDrift = Math.max(0, maxHalfWidth - truckWidth / 2.0);
  }

  return {
    span,
    apexHeight,
    a,
    truckWidth,
    truckHeight,
    xOffset,
    leftEdgeX,
    rightEdgeX,
    ceilingLeft,
    ceilingRight,
    marginLeft,
    marginRight,
    minMargin,
    status,
    reasonVi,
    reasonEn,
    maxAllowableDrift,
    clearsSafely: status === 'PASS' || status === 'WARNING'
  };
}

/**
 * Pure Mathematical Calculation Engine: Cho Lach Bus Revenue Optimization
 * @param {Object} params
 * @param {number} [params.x=4] - Discount step count or price adjustment index
 * @returns {Object} Revenue, fare, demand, and derivative tangent metrics
 */
export function calculateBusRevenue(params = {}) {
  const x = Number(params.x ?? 4);

  // Model formula: R(x) = (120,000 + 10,000x) * (100 - 5x)
  // Expanded: R(x) = -50,000x^2 + 400,000x + 12,000,000
  const a = -50000;
  const b = 400000;
  const c = 12000000;

  const fare = 120000 + 10000 * x;
  const riders = 100 - 5 * x;
  const revenue = fare * riders;

  // Tangent slope / Marginal Revenue: R'(x) = 2ax + b = -100,000x + 400,000
  const tangentSlope = 2 * a * x + b;

  // Quadratic vertex
  const vertexX = -b / (2 * a); // 4
  const maxRevenue = a * vertexX * vertexX + b * vertexX + c; // 12,800,000
  const vertexFare = 120000 + 10000 * vertexX; // 160,000
  const vertexRiders = 100 - 5 * vertexX; // 80

  // Baseline at x = 0
  const baselineRevenue = c; // 12,000,000
  const deltaRevenue = revenue - baselineRevenue;

  // Constraint warnings
  let capacityWarning = null;
  if (riders > 100) {
    capacityWarning = {
      vi: `Vượt quá sức chứa tối đa của xe (100 khách)! Cần ${riders} chỗ ngồi.`,
      en: `Exceeds maximum bus capacity (100 riders)! Demands ${riders} seats.`
    };
  } else if (riders <= 0) {
    capacityWarning = {
      vi: 'Giá vé quá cao khiến lượng hành khách giảm về 0!',
      en: 'Ticket fare too high, reducing ridership to 0!'
    };
  }

  let fareWarning = null;
  if (fare <= 0) {
    fareWarning = {
      vi: 'Giá vé không thể mang giá trị âm hoặc bằng 0!',
      en: 'Ticket fare cannot be zero or negative!'
    };
  }

  return {
    x,
    fare,
    riders,
    revenue,
    tangentSlope,
    a, b, c,
    vertexX,
    maxRevenue,
    vertexFare,
    vertexRiders,
    baselineRevenue,
    deltaRevenue,
    capacityWarning,
    fareWarning,
    isOptimal: x === vertexX
  };
}

/**
 * Main Interactive Math Simulations Component
 */
export class MathSimulations {
  /**
   * @param {Object} options
   * @param {HTMLElement} [options.container] - Mounting DOM element
   * @param {'svg-lighthouse'|'svg-parabola'|'svg-optimization'} [options.type='svg-lighthouse']
   * @param {'facts'|'guidance'|'standalone'} [options.mode='facts']
   * @param {'vi'|'en'|'dual'} [options.language='dual']
   * @param {Object} [options.initialParams] - Initial simulation parameters
   * @param {Function} [options.onParameterChange] - Callback invoked when parameters change
   */
  constructor(options = {}) {
    this.container = options.container || null;
    this.type = options.type || 'svg-lighthouse';
    this.mode = options.mode || 'facts';
    this.language = options.language || 'dual';
    this.onParameterChange = options.onParameterChange || (() => {});

    // Internal simulation parameters with authoritative KHKT defaults
    this.params = {
      // Lighthouse
      AB: 30,
      alpha: 42,
      beta: 63,
      // Parabolic Arch
      span: 8.0,
      apexHeight: 6.0,
      truckWidth: 3.0,
      truckHeight: 4.2,
      xOffset: 0.0,
      // Bus Revenue
      busX: 4,
      ...options.initialParams
    };

    this._boundInputHandler = this._handleInput.bind(this);
    this._boundPresetHandler = this._handlePreset.bind(this);

    if (this.container) {
      this.mount(this.container);
    }
  }

  mount(container) {
    if (container) this.container = container;
    if (!this.container) return;
    this.render();
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.render();
  }

  setLanguage(lang) {
    if (this.language === lang) return;
    this.language = lang;
    this.render();
  }

  updateParameters(newParams = {}) {
    this.params = { ...this.params, ...newParams };
    this.render();
    this.onParameterChange(this.params, this.getCalculationResults());
  }

  getCalculationResults() {
    switch (this.type) {
      case 'svg-lighthouse':
      case 'lighthouse':
        return calculateLighthouse(this.params);
      case 'svg-parabola':
      case 'parabola':
        return calculateParabolicArch(this.params);
      case 'svg-optimization':
      case 'optimization':
        return calculateBusRevenue({ x: this.params.busX });
      default:
        return null;
    }
  }

  render() {
    if (!this.container) return;

    let contentHTML = '';
    switch (this.type) {
      case 'svg-lighthouse':
      case 'lighthouse':
        contentHTML = this._renderLighthouseHTML();
        break;
      case 'svg-parabola':
      case 'parabola':
        contentHTML = this._renderParabolicArchHTML();
        break;
      case 'svg-optimization':
      case 'optimization':
        contentHTML = this._renderBusRevenueHTML();
        break;
      default:
        contentHTML = `<div class="p-6 text-center text-slate-500">Unknown simulation type: ${this.type}</div>`;
    }

    this.container.innerHTML = `<div class="math-simulation-root space-y-4">${contentHTML}</div>`;
    this._attachEventListeners(this.container);
  }

  // =========================================================================
  // SIMULATION 1: LIGHTHOUSE TRIANGULATION RENDERER
  // =========================================================================
  _renderLighthouseHTML() {
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';
    const data = calculateLighthouse(this.params);

    const titleText = isEn
      ? 'Interactive Lighthouse Triangulation Ray-Tracer'
      : (isDual
        ? 'Mô Phỏng Lượng Giác Hải Đăng / Lighthouse Triangulation'
        : 'Mô Phỏng Đo Chiều Cao Ngọn Hải Đăng Bằng Giác Kế');

    const subtitleText = this.mode === 'facts'
      ? (isEn ? 'Scene 2: Problem Measurements & Inaccessible Base' : 'Phân cảnh 2: Dữ kiện thực tế & Chân tháp không thể tiếp cận')
      : (isEn ? 'Scene 4: Modeling Guidance & Law of Sines Bridge' : 'Phân cảnh 4: Gợi mở giải pháp & Cầu nối Định lý Sin');

    // Dynamic auto-scaling SVG coordinates
    let svgContent = '';
    if (!data.isValid) {
      svgContent = `
        <svg viewBox="0 0 800 450" class="sim-svg w-full h-auto">
          <rect width="800" height="450" fill="#f8fafc" />
          <text x="400" y="210" font-family="sans-serif" font-size="18" font-weight="bold" fill="#e11d48" text-anchor="middle">
            ⚠ ${isEn ? data.errorEn : data.errorVi}
          </text>
          <text x="400" y="245" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">
            ${isEn ? 'Please adjust sliders so that beta > alpha.' : 'Vui lòng điều chỉnh góc beta lớn hơn góc alpha.'}
          </text>
        </svg>
      `;
    } else {
      const { AB, alpha, beta, BD, CD, BC, AC } = data;
      const s = Math.min(480 / AC, 260 / CD, 8.0);
      const groundY = 370;
      const xC = 710;
      const yC = groundY;
      const xB = xC - BC * s;
      const yB = groundY;
      const xA = xB - AB * s;
      const yA = groundY;
      const xD = xC;
      const yD = groundY - CD * s;

      // Guidance triangle shading
      const showGuidance = this.mode === 'guidance';
      const abdShading = showGuidance ? `<polygon points="${xA},${yA} ${xB},${yB} ${xD},${yD}" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3" />` : '';
      const bcdShading = showGuidance ? `<polygon points="${xB},${yB} ${xC},${yC} ${xD},${yD}" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4,3" />` : '';

      svgContent = `
        <svg viewBox="0 0 800 450" class="sim-svg w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#bae6fd" />
              <stop offset="65%" stop-color="#e0f2fe" />
              <stop offset="100%" stop-color="#f0fdf4" />
            </linearGradient>
            <linearGradient id="cliffGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#64748b" />
              <stop offset="100%" stop-color="#334155" />
            </linearGradient>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0284c7" />
              <stop offset="100%" stop-color="#0369a1" />
            </linearGradient>
            <pattern id="hazardHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#f43f5e" stroke-width="3" />
            </pattern>
          </defs>

          <!-- Sky Background -->
          <rect width="800" height="${groundY}" fill="url(#skyGrad)" />

          <!-- Ocean / Turbulent Waves Area (Inaccessible Base C) -->
          <rect x="${xB}" y="${groundY}" width="${800 - xB}" height="${450 - groundY}" fill="url(#seaGrad)" />
          <path d="M ${xB} ${groundY + 12} Q ${(xB + xC) / 2} ${groundY + 6} ${xC} ${groundY + 14} T 800 ${groundY + 10}" fill="none" stroke="#e0f2fe" stroke-width="2" opacity="0.8" />
          <path d="M ${xB} ${groundY + 28} Q ${(xB + xC) / 2} ${groundY + 22} ${xC} ${groundY + 30} T 800 ${groundY + 25}" fill="none" stroke="#bae6fd" stroke-width="2" opacity="0.5" />

          <!-- Hazard Striping under Inaccessible Span BC -->
          <rect x="${xB}" y="${groundY + 36}" width="${xC - xB}" height="28" fill="url(#hazardHatch)" opacity="0.25" rx="4" />
          <text x="${(xB + xC) / 2}" y="${groundY + 54}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#be123c" text-anchor="middle">
            ⚠ ${isEn ? 'INACCESSIBLE (BC)' : 'KHÔNG THỂ TIẾP CẬN (BC)'}
          </text>

          <!-- Solid Ground Plane (Observation stations A & B) -->
          <polygon points="0,${groundY} ${xB},${groundY} ${xB},450 0,450" fill="#e2e8f0" />
          <line x1="0" y1="${groundY}" x2="${xB}" y2="${groundY}" stroke="#475569" stroke-width="3" />

          <!-- Rocky Cliff Under Lighthouse C -->
          <polygon points="${xC - 25},${groundY} ${xC + 40},${groundY} ${xC + 50},450 ${xC - 40},450" fill="url(#cliffGrad)" />

          <!-- Triangle Guidance Shading -->
          ${abdShading}
          ${bcdShading}

          <!-- Lighthouse Tower CD -->
          <rect x="${xC - 10}" y="${yD}" width="20" height="${groundY - yD}" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
          <!-- Tower Masonry Stripes -->
          <rect x="${xC - 10}" y="${yD + (groundY - yD) * 0.25}" width="20" height="${(groundY - yD) * 0.2}" fill="#e11d48" />
          <rect x="${xC - 10}" y="${yD + (groundY - yD) * 0.65}" width="20" height="${(groundY - yD) * 0.2}" fill="#e11d48" />
          <!-- Lantern Room & Roof -->
          <rect x="${xC - 14}" y="${yD - 14}" width="28" height="14" fill="#fbbf24" stroke="#1e293b" stroke-width="2" rx="2" />
          <polygon points="${xC - 18},${yD - 14} ${xC},${yD - 28} ${xC + 18},${yD - 14}" fill="#1e293b" />
          <!-- Lighthouse Beam -->
          <polygon points="${xC},${yD - 20} 0,${Math.max(20, yD - 80)} 0,${yD + 60}" fill="rgba(254, 240, 138, 0.22)" />

          <!-- Right Angle Marker at C -->
          <polyline points="${xC - 12},${groundY} ${xC - 12},${groundY - 12} ${xC},${groundY - 12}" fill="none" stroke="#0f172a" stroke-width="1.5" />

          <!-- Ground Baseline Dimension AB -->
          <line x1="${xA}" y1="${groundY + 16}" x2="${xB}" y2="${groundY + 16}" stroke="#0f172a" stroke-width="2" />
          <text x="${(xA + xB) / 2}" y="${groundY + 30}" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">
            AB = ${AB} m
          </text>

          <!-- Sight Ray A -> D -->
          <line x1="${xA}" y1="${yA}" x2="${xD}" y2="${yD}" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4" />
          <!-- Sight Ray B -> D -->
          <line x1="${xB}" y1="${yB}" x2="${xD}" y2="${yD}" stroke="#d97706" stroke-width="2.5" stroke-dasharray="6,4" />

          <!-- Angle Arcs -->
          <path d="M ${xA + 36} ${groundY} A 36 36 0 0 0 ${xA + 36 * Math.cos(degToRad(alpha))} ${groundY - 36 * Math.sin(degToRad(alpha))}" fill="none" stroke="#2563eb" stroke-width="2" />
          <text x="${xA + 44}" y="${groundY - 10}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1d4ed8">α = ${alpha}°</text>

          <path d="M ${xB + 32} ${groundY} A 32 32 0 0 0 ${xB + 32 * Math.cos(degToRad(beta))} ${groundY - 32 * Math.sin(degToRad(beta))}" fill="none" stroke="#d97706" stroke-width="2" />
          <text x="${xB + 38}" y="${groundY - 10}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#b45309">β = ${beta}°</text>

          <!-- Station Nodes: A, B, C, D -->
          <circle cx="${xA}" cy="${yA}" r="5" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
          <text x="${xA}" y="${groundY - 8}" font-family="sans-serif" font-size="13" font-weight="900" fill="#1e3a8a" text-anchor="middle">A</text>

          <circle cx="${xB}" cy="${yB}" r="5" fill="#d97706" stroke="#ffffff" stroke-width="2" />
          <text x="${xB}" y="${groundY - 8}" font-family="sans-serif" font-size="13" font-weight="900" fill="#78350f" text-anchor="middle">B</text>

          <circle cx="${xC}" cy="${yC}" r="5" fill="#64748b" stroke="#ffffff" stroke-width="2" />
          <text x="${xC + 14}" y="${groundY - 6}" font-family="sans-serif" font-size="13" font-weight="900" fill="#0f172a">C</text>

          <circle cx="${xD}" cy="${yD}" r="5" fill="#e11d48" stroke="#ffffff" stroke-width="2" />
          <text x="${xD + 16}" y="${yD + 4}" font-family="sans-serif" font-size="13" font-weight="900" fill="#9f1239">D</text>

          <!-- Height Dimension Bar CD -->
          <line x1="${xC + 30}" y1="${groundY}" x2="${xC + 30}" y2="${yD}" stroke="#e11d48" stroke-width="2" />
          <line x1="${xC + 24}" y1="${groundY}" x2="${xC + 36}" y2="${groundY}" stroke="#e11d48" stroke-width="2" />
          <line x1="${xC + 24}" y1="${yD}" x2="${xC + 36}" y2="${yD}" stroke="#e11d48" stroke-width="2" />
          <text x="${xC + 40}" y="${(groundY + yD) / 2}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#be123c" dominant-baseline="middle">
            h = CD ≈ ${CD.toFixed(1)} m
          </text>
        </svg>
      `;
    }

    return `
      <div class="card sim-stage p-4 sm:p-6 shadow-lg bg-white rounded-2xl border border-slate-200">
        <!-- Title & Subtitle Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              📐 Trigonometry Triangulation • Hệ thức lượng tam giác
            </span>
            <h3 class="text-lg sm:text-xl font-bold text-blue-950 mt-1">${titleText}</h3>
            <p class="text-xs sm:text-sm text-slate-500">${subtitleText}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn btn-sm btn-outline text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50" data-preset="lighthouse-default">
              ⟲ ${isEn ? 'KHKT Default (30m, 42°, 63°)' : 'Dữ kiện gốc KHKT'}
            </button>
          </div>
        </div>

        <!-- SVG Visual Stage -->
        <div class="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
          ${svgContent}
        </div>

        <!-- Interactive Sliders Panel -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
          <div>
            <div class="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Khoảng cách trạm AB:</span>
              <span class="text-blue-600 font-mono font-bold">${this.params.AB} m</span>
            </div>
            <input type="range" class="w-full cursor-pointer accent-blue-600" min="10" max="100" step="1" value="${this.params.AB}" data-param="AB" />
            <div class="flex justify-between text-[11px] text-slate-400"><span>10 m</span><span>100 m</span></div>
          </div>

          <div>
            <div class="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Góc nâng tại A (α):</span>
              <span class="text-blue-600 font-mono font-bold">${this.params.alpha}°</span>
            </div>
            <input type="range" class="w-full cursor-pointer accent-blue-600" min="15" max="75" step="1" value="${this.params.alpha}" data-param="alpha" />
            <div class="flex justify-between text-[11px] text-slate-400"><span>15°</span><span>75°</span></div>
          </div>

          <div>
            <div class="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Góc nâng tại B (β):</span>
              <span class="text-amber-600 font-mono font-bold">${this.params.beta}°</span>
            </div>
            <input type="range" class="w-full cursor-pointer accent-amber-600" min="20" max="85" step="1" value="${this.params.beta}" data-param="beta" />
            <div class="flex justify-between text-[11px] text-slate-400"><span>20°</span><span>85°</span></div>
          </div>
        </div>

        <!-- Real-time Mathematical Step-by-Step Readout -->
        ${data.isValid ? `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span class="font-bold text-amber-900 block">Góc ngoài ADB:</span>
              <span class="text-sm font-mono font-black text-amber-700">63° - 42° = ${data.angleADBDeg}°</span>
            </div>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span class="font-bold text-blue-900 block">Cạnh cầu nối BD:</span>
              <span class="text-sm font-mono font-black text-blue-700">${data.bdRounded} m</span>
            </div>
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span class="font-bold text-emerald-900 block">Chiều cao ngọn hải đăng h:</span>
              <span class="text-base font-mono font-black text-emerald-700">${data.heightRounded} m</span>
            </div>
            <div class="p-3 bg-slate-100 border border-slate-200 rounded-xl">
              <span class="font-bold text-slate-700 block">Kiểm chứng qua Cotang:</span>
              <span class="text-sm font-mono font-bold text-slate-800">${data.CD_cot.toFixed(2)} m</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // =========================================================================
  // SIMULATION 2: PARABOLIC ARCH HIGHWAY CLEARANCE RENDERER
  // =========================================================================
  _renderParabolicArchHTML() {
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';
    const data = calculateParabolicArch(this.params);

    const titleText = isEn
      ? 'Interactive Parabolic Arch Highway Clearance Simulator'
      : (isDual
        ? 'Mô Phỏng Cổng Parabol & Giới Hạn Chiều Cao Xe Tải'
        : 'Mô Phỏng Cổng Vòm Parabol & Kiểm Tra An Toàn Xe Tải');

    // SVG coordinate mapping: origin (0, 0) at (400, 420)
    // 1 meter = 70 px horizontal, 55 px vertical
    const toSvgX = (x) => 400 + x * 70;
    const toSvgY = (y) => 420 - y * 55;

    // Generate smooth parabola polyline
    const points = [];
    for (let x = -4.0; x <= 4.001; x += 0.1) {
      const y = -0.375 * x * x + 6.0;
      points.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
    }
    const archPathD = `M ${toSvgX(-4)},420 ` + points.map(p => `L ${p}`).join(' ') + ` L ${toSvgX(4)},420 Z`;
    const archCurveD = `M ${toSvgX(-4)},420 ` + points.map(p => `L ${p}`).join(' ');

    // Truck box coordinates
    const truckLeftSvg = toSvgX(data.leftEdgeX);
    const truckRightSvg = toSvgX(data.rightEdgeX);
    const truckWidthSvg = (data.truckWidth) * 70;
    const truckTopSvg = toSvgY(data.truckHeight);
    const truckHeightSvg = (data.truckHeight) * 55;

    // Ceiling at truck edges
    const ceilLeftSvg = toSvgY(data.ceilingLeft);
    const ceilRightSvg = toSvgY(data.ceilingRight);

    // Color tokens based on status
    let statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    let truckColor = '#10b981';
    if (data.status === 'WARNING') {
      statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
      truckColor = '#f59e0b';
    } else if (data.status === 'COLLISION') {
      statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      truckColor = '#e11d48';
    }

    const svgContent = `
      <svg viewBox="0 0 800 480" class="sim-svg w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <linearGradient id="archPortalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#eff6ff" />
            <stop offset="100%" stop-color="#f8fafc" />
          </linearGradient>
        </defs>

        <!-- Sky Backdrop -->
        <rect width="800" height="420" fill="#f1f5f9" />

        <!-- Outer Arch Wall -->
        <rect x="80" y="40" width="640" height="380" fill="#cbd5e1" rx="8" />
        <path d="${archPathD}" fill="url(#archPortalGrad)" stroke="#64748b" stroke-width="3" />

        <!-- Ground / Asphalt Road Plane -->
        <rect x="0" y="420" width="800" height="60" fill="url(#roadGrad)" />
        <!-- Road Yellow Center Dashes -->
        <line x1="0" y1="450" x2="800" y2="450" stroke="#facc15" stroke-width="3" stroke-dasharray="24,16" />

        <!-- Coordinate Axes Oxy -->
        <line x1="80" y1="420" x2="720" y2="420" stroke="#475569" stroke-width="2" />
        <line x1="400" y1="430" x2="400" y2="50" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />

        <!-- Apex Vertex S(0, 6) -->
        <circle cx="400" cy="${toSvgY(6)}" r="6" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
        <text x="400" y="${toSvgY(6) - 12}" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">
          S(0; 6)
        </text>

        <!-- Base Roots A(-4, 0) and B(4, 0) -->
        <circle cx="${toSvgX(-4)}" cy="420" r="5" fill="#475569" />
        <text x="${toSvgX(-4)}" y="440" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">A(-4; 0)</text>
        <circle cx="${toSvgX(4)}" cy="420" r="5" fill="#475569" />
        <text x="${toSvgX(4)}" y="440" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">B(4; 0)</text>

        <!-- Truck Cargo Container Box -->
        <rect x="${truckLeftSvg}" y="${truckTopSvg}" width="${truckWidthSvg}" height="${truckHeightSvg}" fill="${truckColor}" fill-opacity="0.25" stroke="${truckColor}" stroke-width="3" rx="4" />
        <!-- Truck Cabin Window & Visual Detailing -->
        <rect x="${truckLeftSvg + 8}" y="${truckTopSvg + 12}" width="${truckWidthSvg - 16}" height="${Math.min(40, truckHeightSvg * 0.25)}" fill="#ffffff" fill-opacity="0.6" rx="2" />
        <!-- Wheels -->
        <circle cx="${truckLeftSvg + 24}" cy="420" r="10" fill="#0f172a" stroke="#94a3b8" stroke-width="2" />
        <circle cx="${truckRightSvg - 24}" cy="420" r="10" fill="#0f172a" stroke="#94a3b8" stroke-width="2" />

        <!-- Clearance Needles & Indicators (Left & Right Roof Corners) -->
        <line x1="${truckLeftSvg}" y1="${truckTopSvg}" x2="${truckLeftSvg}" y2="${ceilLeftSvg}" stroke="${truckColor}" stroke-width="2" stroke-dasharray="3,2" />
        <circle cx="${truckLeftSvg}" cy="${ceilLeftSvg}" r="4" fill="${truckColor}" />

        <line x1="${truckRightSvg}" y1="${truckTopSvg}" x2="${truckRightSvg}" y2="${ceilRightSvg}" stroke="${truckColor}" stroke-width="2" stroke-dasharray="3,2" />
        <circle cx="${truckRightSvg}" cy="${ceilRightSvg}" r="4" fill="${truckColor}" />

        <!-- Clearance Gauge Tags -->
        <text x="${truckLeftSvg - 8}" y="${(truckTopSvg + ceilLeftSvg) / 2}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${truckColor}" text-anchor="end">
          Δh_L = ${data.marginLeft.toFixed(2)}m
        </text>
        <text x="${truckRightSvg + 8}" y="${(truckTopSvg + ceilRightSvg) / 2}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${truckColor}" text-anchor="start">
          Δh_R = ${data.marginRight.toFixed(2)}m
        </text>

        <!-- Primary Parabolic Curve Stroke -->
        <path d="${archCurveD}" fill="none" stroke="#2563eb" stroke-width="3.5" />
      </svg>
    `;

    return `
      <div class="card sim-stage p-4 sm:p-6 shadow-lg bg-white rounded-2xl border border-slate-200">
        <!-- Title & Subtitle Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              🌉 Quadratic Parabola • Hàm số bậc hai y = -0.375x² + 6
            </span>
            <h3 class="text-lg sm:text-xl font-bold text-blue-950 mt-1">${titleText}</h3>
            <p class="text-xs sm:text-sm text-slate-500">
              Nhịp đáy 8m (x ∈ [-4, 4]), cao đỉnh 6m. Thử nghiệm độ lệch lái và chiều cao xe tải.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusBadgeClass}">
              ● ${data.status}: ${(data.minMargin * 100).toFixed(0)} cm buffer
            </span>
          </div>
        </div>

        <!-- SVG Visual Stage -->
        <div class="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
          ${svgContent}
        </div>

        <!-- Interactive Sliders Panel -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
          <div>
            <div class="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Bề rộng xe tải (w):</span>
              <span class="text-indigo-600 font-mono font-bold">${this.params.truckWidth} m</span>
            </div>
            <input type="range" class="w-full cursor-pointer accent-indigo-600" min="2.0" max="5.0" step="0.1" value="${this.params.truckWidth}" data-param="truckWidth" />
            <div class="flex justify-between text-[11px] text-slate-400"><span>2.0 m</span><span>5.0 m</span></div>
          </div>

          <div>
            <div class="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Chiều cao xe tải (h):</span>
              <span class="text-indigo-600 font-mono font-bold">${this.params.truckHeight} m</span>
            </div>
            <input type="range" class="w-full cursor-pointer accent-indigo-600" min="3.0" max="5.5" step="0.1" value="${this.params.truckHeight}" data-param="truckHeight" />
            <div class="flex justify-between text-[11px] text-slate-400"><span>3.0 m</span><span>5.5 m</span></div>
          </div>

          <div>
            <div class="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Độ lệch tim đường (x_offset):</span>
              <span class="text-indigo-600 font-mono font-bold">${this.params.xOffset > 0 ? '+' : ''}${this.params.xOffset} m</span>
            </div>
            <input type="range" class="w-full cursor-pointer accent-indigo-600" min="-2.0" max="2.0" step="0.05" value="${this.params.xOffset}" data-param="xOffset" />
            <div class="flex justify-between text-[11px] text-slate-400"><span>-2.0 m (Trái)</span><span>+2.0 m (Phải)</span></div>
          </div>
        </div>

        <!-- Presets Bar -->
        <div class="flex flex-wrap items-center gap-2 pt-2">
          <span class="text-xs font-bold text-slate-500">Cấu hình mẫu / Presets:</span>
          <button type="button" class="btn btn-sm btn-outline text-xs px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-50" data-preset="arch-3m-center">
            Xe rộng 3m chính giữa (Δh = +0.956m)
          </button>
          <button type="button" class="btn btn-sm btn-outline text-xs px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-50" data-preset="arch-4m-baseline">
            Xe rộng 4m chuẩn KHKT (Δh = +0.300m)
          </button>
          <button type="button" class="btn btn-sm btn-outline text-xs px-2.5 py-1 rounded-md border border-slate-300 hover:bg-slate-50 text-rose-600 border-rose-200" data-preset="arch-drift-collision">
            Xe rộng 4m lệch 25cm (Va chạm!)
          </button>
        </div>

        <!-- Step-by-Step Readout -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-slate-100">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span class="font-bold text-slate-700 block">Tọa độ mép xe:</span>
            <span class="text-sm font-mono font-bold text-slate-800">[${data.leftEdgeX.toFixed(2)}m ; ${data.rightEdgeX.toFixed(2)}m]</span>
          </div>
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span class="font-bold text-blue-900 block">Trần cổng tại mép ngoài:</span>
            <span class="text-sm font-mono font-bold text-blue-800">${Math.min(data.ceilingLeft, data.ceilingRight).toFixed(3)} m</span>
          </div>
          <div class="p-3 ${data.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : (data.status === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900')} rounded-xl border">
            <span class="font-bold block">Khoảng hở an toàn (Δh):</span>
            <span class="text-base font-mono font-black">${(data.minMargin * 100).toFixed(1)} cm (${data.minMargin.toFixed(3)} m)</span>
          </div>
          <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <span class="font-bold text-indigo-900 block">Độ lệch lái tối đa cho phép:</span>
            <span class="text-sm font-mono font-bold text-indigo-800">± ${(data.maxAllowableDrift * 100).toFixed(1)} cm</span>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SIMULATION 3: CHO LACH BUS REVENUE OPTIMIZATION RENDERER
  // =========================================================================
  _renderBusRevenueHTML() {
    const isEn = this.language === 'en';
    const isDual = this.language === 'dual';
    const data = calculateBusRevenue({ x: this.params.busX });

    const titleText = isEn
      ? 'Interactive Bus Revenue Quadratic Optimization Curve'
      : (isDual
        ? 'Tối Ưu Hóa Doanh Thu Xe Buýt Chợ Lách / Bus Revenue Optimization'
        : 'Mô Phỏng Đường Cong Tối Ưu Hóa Doanh Thu Xe Buýt');

    // Domain: x in [-10, 16], R in [0, 14,000,000]
    // Math to SVG mapping: viewBox="0 0 800 450"
    const toSvgX = (x) => 90 + ((x - (-10)) / 26) * 640;
    const toSvgY = (R) => 400 - (R / 14000000) * 340;

    // Generate parabola curve points
    const points = [];
    for (let t = -10; t <= 16.001; t += 0.25) {
      const rev = -50000 * t * t + 400000 * t + 12000000;
      points.push(`${toSvgX(t).toFixed(1)},${toSvgY(rev).toFixed(1)}`);
    }
    const curveD = `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ');

    // Current operating point
    const currSvgX = toSvgX(data.x);
    const currSvgY = toSvgY(data.revenue);

    // Vertex coordinates
    const vSvgX = toSvgX(data.vertexX);
    const vSvgY = toSvgY(data.maxRevenue);

    // Dynamic tangent line segment
    const slope = data.tangentSlope;
    const tSpan = 2.5;
    const tanX1 = data.x - tSpan;
    const tanR1 = data.revenue + slope * (-tSpan);
    const tanX2 = data.x + tSpan;
    const tanR2 = data.revenue + slope * (tSpan);

    const tanSvgX1 = toSvgX(tanX1);
    const tanSvgY1 = toSvgY(tanR1);
    const tanSvgX2 = toSvgX(tanX2);
    const tanSvgY2 = toSvgY(tanR2);

    let tangentColor = '#10b981'; // Green
    if (Math.abs(slope) < 1e-4) tangentColor = '#f59e0b'; // Gold at vertex
    else if (slope < 0) tangentColor = '#e11d48'; // Red

    const svgContent = `
      <svg viewBox="0 0 800 450" class="sim-svg w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid Guidelines -->
        <rect width="800" height="450" fill="#f8fafc" />
        
        <!-- Y Axis Revenue Gridlines (2M, 4M, 6M, 8M, 10M, 12M, 14M) -->
        ${[2, 4, 6, 8, 10, 12, 14].map(mill => `
          <line x1="90" y1="${toSvgY(mill * 1e6)}" x2="730" y2="${toSvgY(mill * 1e6)}" stroke="#e2e8f0" stroke-width="1" />
          <text x="80" y="${toSvgY(mill * 1e6) + 4}" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="end">${mill}M</text>
        `).join('')}

        <!-- X Axis Tick Marks -->
        ${[-8, -4, 0, 4, 8, 12, 16].map(t => `
          <line x1="${toSvgX(t)}" y1="400" x2="${toSvgX(t)}" y2="406" stroke="#475569" stroke-width="1.5" />
          <text x="${toSvgX(t)}" y="422" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">x = ${t}</text>
        `).join('')}

        <!-- Coordinate Axes -->
        <line x1="90" y1="400" x2="740" y2="400" stroke="#334155" stroke-width="2" />
        <line x1="${toSvgX(0)}" y1="400" x2="${toSvgX(0)}" y2="50" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3" />

        <!-- Capacity Limit Zone (x < 0 implies Q > 100) -->
        <rect x="90" y="50" width="${toSvgX(0) - 90}" height="350" fill="rgba(244, 63, 94, 0.05)" />
        <text x="${(90 + toSvgX(0)) / 2}" y="70" font-family="sans-serif" font-size="10" font-weight="bold" fill="#e11d48" text-anchor="middle">
          ⚠ Vượt trần 100 khách (Q > 100)
        </text>

        <!-- Parabolic Curve R(x) -->
        <path d="${curveD}" fill="none" stroke="#2563eb" stroke-width="3.5" />

        <!-- Vertex Point Projections (x = 4, R = 12.8M) -->
        <line x1="${vSvgX}" y1="400" x2="${vSvgX}" y2="${vSvgY}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4" />
        <line x1="90" y1="${vSvgY}" x2="${vSvgX}" y2="${vSvgY}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4" />
        <circle cx="${vSvgX}" cy="${vSvgY}" r="7" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />
        <text x="${vSvgX}" y="${vSvgY - 14}" font-family="sans-serif" font-size="12" font-weight="900" fill="#b45309" text-anchor="middle">
          ★ Đỉnh cực đại: 12.8M VNĐ (x* = 4, Vé 160k)
        </text>

        <!-- Dynamic Tangent Line -->
        <line x1="${tanSvgX1}" y1="${tanSvgY1}" x2="${tanSvgX2}" y2="${tanSvgY2}" stroke="${tangentColor}" stroke-width="2.5" stroke-linecap="round" />

        <!-- Current Operating Point Cursor -->
        <circle cx="${currSvgX}" cy="${currSvgY}" r="8" fill="#1e293b" stroke="#ffffff" stroke-width="2.5" />
        <circle cx="${currSvgX}" cy="${currSvgY}" r="12" fill="none" stroke="#1e293b" stroke-width="1" stroke-dasharray="2,2" />

        <!-- Cursor Readout Label -->
        <rect x="${Math.min(610, Math.max(100, currSvgX - 70))}" y="${currSvgY - 45}" width="140" height="32" fill="#1e293b" rx="6" />
        <text x="${Math.min(610, Math.max(100, currSvgX - 70)) + 70}" y="${currSvgY - 26}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">
          R(${data.x}) = ${(data.revenue / 1e6).toFixed(2)}M VNĐ
        </text>
      </svg>
    `;

    return `
      <div class="card sim-stage p-4 sm:p-6 shadow-lg bg-white rounded-2xl border border-slate-200">
        <!-- Title & Subtitle Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              📊 Economic Quadratic Optimization • R(x) = -50.000x² + 400.000x + 12.000.000
            </span>
            <h3 class="text-lg sm:text-xl font-bold text-blue-950 mt-1">${titleText}</h3>
            <p class="text-xs sm:text-sm text-slate-500">
              Khảo sát sự đánh đổi giữa đơn giá vé và lượng cầu hành khách để tìm đỉnh doanh thu tối đa.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-sm btn-outline text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50" data-preset="bus-vertex">
              ★ Đỉnh tối ưu (x = 4)
            </button>
            <button type="button" class="btn btn-sm btn-outline text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold hover:bg-slate-50" data-preset="bus-baseline">
              ⟲ Giá gốc (x = 0)
            </button>
          </div>
        </div>

        <!-- SVG Visual Stage -->
        <div class="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
          ${svgContent}
        </div>

        <!-- Interactive Slider Panel -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-2">
          <div class="flex justify-between font-semibold text-slate-700">
            <span>Nấc điều chỉnh giá vé (x): <span class="text-emerald-700 font-mono font-black text-base">${data.x}</span></span>
            <span class="text-slate-500 text-xs">Giá vé: <strong>${data.fare.toLocaleString('vi-VN')} VNĐ</strong> | Lượng khách: <strong>${data.riders} người</strong></span>
          </div>
          <input type="range" class="w-full cursor-pointer accent-emerald-600" min="-10" max="15" step="1" value="${this.params.busX}" data-param="busX" />
          <div class="flex justify-between text-[11px] text-slate-400">
            <span>x = -10 (Vé 20k)</span>
            <span class="font-bold text-amber-700">x = 4 (Tối ưu 160k)</span>
            <span>x = 15 (Vé 270k)</span>
          </div>
        </div>

        <!-- Key Financial Indicators Readout -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-slate-100">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span class="font-bold text-slate-700 block">Đơn giá vé P(x):</span>
            <span class="text-sm font-mono font-bold text-slate-900">${data.fare.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span class="font-bold text-blue-900 block">Số lượng khách Q(x):</span>
            <span class="text-sm font-mono font-bold text-blue-800">${data.riders} khách</span>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span class="font-bold text-emerald-900 block">Tổng doanh thu R(x):</span>
            <span class="text-base font-mono font-black text-emerald-700">${data.revenue.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span class="font-bold text-amber-900 block">Độ dốc tiếp tuyến R'(x):</span>
            <span class="text-sm font-mono font-bold ${data.tangentSlope > 0 ? 'text-emerald-700' : (data.tangentSlope < 0 ? 'text-rose-700' : 'text-amber-700')}">
              ${data.tangentSlope.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // EVENT ATTACHMENT & PRESET DISPATCH
  // =========================================================================
  _attachEventListeners(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return;

    const inputs = container.querySelectorAll('input[type="range"]');
    if (inputs && inputs.forEach) {
      inputs.forEach(input => {
        if (input && input.addEventListener) {
          input.addEventListener('input', this._boundInputHandler);
        }
      });
    }

    const presetButtons = container.querySelectorAll('button[data-preset]');
    if (presetButtons && presetButtons.forEach) {
      presetButtons.forEach(btn => {
        if (btn && btn.addEventListener) {
          btn.addEventListener('click', this._boundPresetHandler);
        }
      });
    }
  }

  _handleInput(e) {
    const target = e.target;
    const param = target?.getAttribute ? target.getAttribute('data-param') : target?.dataset?.param;
    const val = parseFloat(target?.value);
    if (!param || isNaN(val)) return;

    this.updateParameters({ [param]: val });
  }

  _handlePreset(e) {
    const btn = e.currentTarget || e.target;
    const preset = btn?.getAttribute ? btn.getAttribute('data-preset') : btn?.dataset?.preset;
    if (!preset) return;

    switch (preset) {
      case 'lighthouse-default':
        this.updateParameters({ AB: 30, alpha: 42, beta: 63 });
        break;
      case 'arch-3m-center':
        this.updateParameters({ truckWidth: 3.0, truckHeight: 4.2, xOffset: 0.0 });
        break;
      case 'arch-4m-baseline':
        this.updateParameters({ truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.0 });
        break;
      case 'arch-drift-collision':
        this.updateParameters({ truckWidth: 4.0, truckHeight: 4.2, xOffset: 0.25 });
        break;
      case 'bus-vertex':
        this.updateParameters({ busX: 4 });
        break;
      case 'bus-baseline':
        this.updateParameters({ busX: 0 });
        break;
    }
  }

  destroy() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container = null;
  }
}

export default MathSimulations;
