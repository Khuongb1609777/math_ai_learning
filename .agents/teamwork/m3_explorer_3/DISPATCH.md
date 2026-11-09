## 2026-11-09T03:24:50Z

You are Milestone M3 Explorer 3 (`m3_explorer_3`).
Working Directory: `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_explorer_3`
Identity: Read-only exploration agent. You MUST NOT write or modify application source code.

Your Mission:
Investigate and design the **Dynamic Math Simulations** component (`src/components/MathSimulations.js`) for Milestone M3.

Authoritative Context & Files to Read:
1. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/ORIGINAL_REQUEST.md` (MANDATORY: Read first)
2. `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/orchestrator/PROJECT.md` (Feature F6, Simulation requirements)
3. `/Users/mac/Desktop/math_english_ai_learn/src/data/lessons.js` (Inspect mathematical scenarios, formulas, parameters for Lessons 1, 2, and 3)
4. `/Users/mac/Desktop/math_english_ai_learn/src/data/khkt_data.js` (Authentic research data & formulas)

Specific Deliverables:
1. Detailed design for `src/components/MathSimulations.js` supporting 3 parameter-driven dynamic visual SVG simulations:
   - **Simulation 1: Lighthouse Triangulation (Trigonometry)**:
     * Interactive cliff height $H$, angles of elevation $\alpha, \beta$ sliders.
     * Ray-tracer visualization in dynamic SVG with line-of-sight rays, angle arcs, distance readout $d$.
     * Exact trigonometric formula calculation and step-by-step mathematical readout.
   - **Simulation 2: Parabolic Arch Highway Clearance (Quadratic)**:
     * Parabola equation $y = -0.375x^2 + 6$ with span $8\text{ m}$ (from $x=-4$ to $x=4$) and peak height $6\text{ m}$.
     * Vehicle dimensions: truck width $3\text{ m}$ (from $-1.5\text{ m}$ to $+1.5\text{ m}$), truck height $4.2\text{ m}$.
     * Interactive lateral drift offset slider ($x_{offset}$) and truck height slider.
     * Real-time clearance gauge calculation: $y(\pm 1.5 + x_{offset})$ and exact clearance margin gauge ($5.156\text{ m} - 4.2\text{ m} = +0.956\text{ m}$ safety margin). Dynamic PASS/COLLISION warning.
   - **Simulation 3: Cho Lach Bus Revenue Optimization (Quadratic / Optimization)**:
     * Revenue equation $R(x) = (120{,}000 + 10{,}000x)(100 - 5x) = -50{,}000x^2 + 400{,}000x + 12{,}000{,}000$.
     * Interactive price step slider $x \in [-10, 15]$ (fare $20{,}000$ to $270{,}000\text{ VNĐ}$).
     * Interactive SVG parabolic curve, vertex highlight at $x=4$ ($160{,}000\text{ VNĐ}$, $12.8\text{M VNĐ}$ maximum), current operating point cursor, tangent slope readout.
2. Architecture requirements:
   - Zero external libraries or CDNs: Pure SVG and native DOM manipulation.
   - Responsive viewBox coordinate systems.
   - Embeddable into Scene 2 (Dữ kiện) and Scene 4 (Gợi mở giải pháp) of `LessonPlayer`.
3. Concrete drop-in code recommendations and mathematical formulas.
4. Edge case analysis and proposed test suite (`tests/math_simulations.test.js`).

Output Requirements:
- Write your full analysis and recommendations to:
  `/Users/mac/Desktop/math_english_ai_learn/.agents/teamwork/m3_explorer_3/handoff.md`
- Use send_message to report completion back to parent.
