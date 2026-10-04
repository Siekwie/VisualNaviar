// Formula-derived scene: the spatial localization and the energy envelope, from the pinned Lean sources.
// Left: the cutoff χ(x) = cutoff(16 (x₀² + x₁²)) · cutoff(4 x₂)  (SpatialLocalization.spatialCutoff, cutoffProfile) on the slice x₁ = 0,
//   plateau {r² < 1/32, |z| < 1/8}, support cylinder K = {r² ≤ 1/16, |z| ≤ 1/4}, outer support 2K for the force, the unit cube,
//   and the lattice sum Σ_n f(x − n) of the periodic case (PeriodicLocalization.periodize). cutoff ≡ 1 for |x| ≤ 1/2, ≡ 0 for |x| ≥ 1;
//   its ramp is drawn with Mathlib's smoothTransition. The compression x ↦ l x of the periodic corollary (ParabolicScaling.pull) is a slider.
// Right: the Gronwall envelope behind CompactEnergy.uniform_finite_energy: with E = ‖u‖²_{L²}, E' = −2·dissipation + 2∫u·f ≤ E + C
//   (energy_balance, energy_rate_le, C = uniform bound on ‖f(t)‖²_{L²}), E(0) = 0, hence E(t) ≤ C(e^t − 1) ≤ C·e and kinetic energy ≤ ½ C e.
import { lineChart, theme, labelPill, fmt } from '../scene-runtime.js';
import { cutoff } from './error-ledger.js';
import { hexA, fitText } from './similarity-zoom.js';

const TITLE_CUT = ['Cutoff χ on the slice x₁ = 0', 'Cutoff χ, slice x₁ = 0', 'Cutoff χ'];
const TITLE_CUT_PER = ['Cutoff χ on the slice x₁ = 0, periodized', 'Cutoff χ, periodized', 'Cutoff χ'];
const TITLE_ENERGY = ['Energy envelope: E′ ≤ E + C, E(0) = 0', 'Energy envelope', 'Energy'];
const LAB_PLATEAU = ['plateau: χ ≡ 1  (r² < 1/32, |z| < 1/8)', 'plateau: χ ≡ 1'];
const LAB_K = ['K: r² ≤ 1/16, |z| ≤ 1/4  (χ = 0 outside)', 'K: χ = 0 outside'];
const LAB_2K = ['2K: force support (whole-space case)', '2K: force support'];
const LEGEND_LONG = ['Lean bound: ‖u‖² ≤ C·e', 'envelope C(eᵗ − 1)', 'kinetic-energy bound ½·C·e', 'force bound C'];
const LEGEND_SHORT = ['‖u‖² ≤ C·e', 'C(eᵗ − 1)', 'kinetic ½·C·e', 'C'];
const LAB_ENV = ['the actual E(t) is below the envelope; not computed', 'actual E(t): below the envelope, not computed', 'E(t) not computed'];

const chi = (x0, x2) => cutoff(16 * x0 * x0) * cutoff(4 * x2);

export default {
  id: 'localization', label: 'formula-derived',
  mount(host, params, ui) {
    let C = params.C ?? 1, periodic = false, l = 1, tMark = 0.75;
    const c = ui.canvas({ aspect: 16 / 8.2, minHeight: 320, maxHeight: 500 });
    const ro = ro_(ui);
    ui.slider({ label: 'Force bound C  (sup_t ‖f(t)‖²_{L²} ≤ C)', min: 0.1, max: 5, step: 0.1, value: C, onChange: (v) => { C = v; } });
    ui.slider({ label: 'Time t', min: 0, max: 0.999, step: 0.001, value: tMark, format: (v) => v.toFixed(3), onChange: (v) => { tMark = v; } });
    ui.toggle({ label: 'Periodic case: lattice sum of the cut fields', value: false, onChange: (v) => { periodic = v; } });
    ui.slider({ label: 'Compression l (periodic corollary: x ↦ l·x, supports into |xᵢ| ≤ 1/4)', min: 1, max: 4, step: 0.05, value: 1, format: (v) => v.toFixed(2), onChange: (v) => { l = v; } });
    ui.note('<b>Formula-derived.</b> Left: $\\chi(x) = \\mathrm{cutoff}(16(x_0^2+x_1^2))\\,\\mathrm{cutoff}(4x_2)$ on the slice $x_1 = 0$, with $\\mathrm{cutoff} \\equiv 1$ on $|s| \\le \\tfrac12$ and $\\equiv 0$ on $|s| \\ge 1$ (ramp: Mathlib’s bump). It multiplies the <em>potential</em> before the curl, so the cut velocity stays divergence-free. Right: from $E\' \\le E + C$ and $E(0) = 0$ the envelope $E(t) \\le C(e^t - 1) \\le C\\,e$; the Lean bound on the kinetic energy is $\\tfrac12 C e$. No actual energy curve is computed: the construction’s $E(t)$ is unknown here.');

    // precomputed heat-map of χ on the slice (static)
    const NX = 160, NZ = 160; const field = new Float32Array(NX * NZ);
    const span = 1.55; // view half-width when the lattice is shown
    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      const E1 = C * (Math.E - 1), Et = C * (Math.exp(tMark) - 1);
      ro.update({ Et: { value: Et, trend: 'up', detail: `envelope C(e^t − 1) at t = ${tMark.toFixed(3)}` }, E1: { value: E1, trend: 'flat', detail: 'the sharp Gronwall value at t → 1' }, lean: { value: C * Math.E, trend: 'flat', detail: 'forced_gronwall_uniform' }, ke: { value: 0.5 * C * Math.E, trend: 'flat', detail: 'uniform_finite_energy: ½·C·exp 1' } });
      ctx.clearRect(0, 0, w, h);
      const leftW = Math.floor(w * 0.47);
      /* ---------- left: the cutoff geometry ---------- */
      const px = { x: 40, y: 24, w: leftW - 50, h: h - 50 };
      const half = periodic ? span : 0.62; const S = Math.min(px.w, px.h) / (2 * half);
      const cx = px.x + px.w / 2, cy = px.y + px.h / 2;
      const PX = (x) => cx + x * S, PY = (z) => cy - z * S;
      ctx.save(); ctx.beginPath(); ctx.rect(px.x, px.y, px.w, px.h); ctx.clip(); ctx.fillStyle = th.sunken; ctx.fillRect(px.x, px.y, px.w, px.h);
      // heat map of χ (with lattice copies when periodic; compression x ↦ l x shrinks everything by 1/l)
      const cells = Math.round(Math.min(px.w, px.h) / 3);
      const cs = Math.min(px.w, px.h) / cells;
      for (let i = 0; i < cells; i++) for (let k = 0; k < cells; k++) {
        const x0 = -half + (2 * half * (i + 0.5)) / cells, x2 = half - (2 * half * (k + 0.5)) / cells;
        let v = 0;
        if (periodic) { for (let n = -2; n <= 2; n++) for (let m = -2; m <= 2; m++) v += chi(l * (x0 - n), l * (x2 - m)); }
        else v = chi(l * x0, l * x2);
        if (v <= 0.002) continue;
        ctx.fillStyle = hexA(th.accent, 0.12 + 0.6 * Math.min(1, v)); ctx.fillRect(cx - half * S + i * cs, cy - half * S + k * cs, cs + 0.5, cs + 0.5);
      }
      const rect = (hx, hz, color, dash, lw = 1.2) => { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.strokeRect(PX(-hx / l), PY(hz / l), 2 * hx * S / l, 2 * hz * S / l); ctx.setLineDash([]); };
      const copies = periodic ? [-1, 0, 1] : [0];
      for (const n of copies) for (const m of copies) {
        ctx.save(); ctx.translate(n * S, -m * S);
        rect(Math.sqrt(1 / 32), 1 / 8, th.accent, [3, 3]);        // plateau
        rect(0.25, 0.25, th.accent, [], 1.6);                      // support cylinder K
        rect(0.5, 0.5, th.warn, [6, 4]);                           // outer support 2K (force)
        ctx.restore();
      }
      // fundamental cube and quarter cube
      ctx.strokeStyle = th.lineStrong; ctx.lineWidth = 1; ctx.setLineDash([]); ctx.strokeRect(PX(-0.5), PY(0.5), S, S);
      if (periodic) { ctx.strokeStyle = th.ok; ctx.setLineDash([2, 3]); ctx.strokeRect(PX(-0.25), PY(0.25), S / 2, S / 2); ctx.setLineDash([]); }
      if (periodic) for (const n of [-1, 0, 1]) for (const m of [-1, 0, 1]) { if (n === 0 && m === 0) continue; ctx.strokeStyle = th.line; ctx.strokeRect(PX(-0.5 + n), PY(0.5 + m), S, S); }
      ctx.restore();
      ctx.strokeStyle = th.lineStrong; ctx.strokeRect(px.x + 0.5, px.y + 0.5, px.w - 1, px.h - 1);
      ctx.fillStyle = th.fg; ctx.font = `600 12px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(fitText(ctx, periodic ? TITLE_CUT_PER : TITLE_CUT, leftW - px.x, `600 12px ${th.sans}`), px.x, 6);
      ctx.fillStyle = th.muted; ctx.font = `10.5px ${th.sans}`; ctx.textAlign = 'center'; ctx.fillText('x₀ (radial)', px.x + px.w / 2, px.y + px.h + 6);
      ctx.save(); ctx.translate(12, px.y + px.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('x₂ (axial)', 0, 0); ctx.restore();
      const pillFont = `600 9.5px ${th.sans}`, pillMax = px.w - 12;
      labelPill(ctx, fitText(ctx, LAB_PLATEAU, pillMax, pillFont, 12), px.x + 6, px.y + 14, { color: th.accent, size: 9.5 });
      labelPill(ctx, fitText(ctx, LAB_K, pillMax, pillFont, 12), px.x + 6, px.y + 32, { color: th.accent, size: 9.5 });
      labelPill(ctx, fitText(ctx, LAB_2K, pillMax, pillFont, 12), px.x + 6, px.y + 50, { color: th.warn, size: 9.5 });
      labelPill(ctx, fitText(ctx, periodic ? [`unit cube |xᵢ| ≤ 1/2; dotted: quarter cube; l = ${l.toFixed(2)}`, `unit cube; l = ${l.toFixed(2)}`] : [`unit cube |xᵢ| ≤ 1/2 (fundamental cube)${l > 1 ? `; compressed by l = ${l.toFixed(2)}` : ''}`, `unit cube${l > 1 ? `; l = ${l.toFixed(2)}` : ''}`], pillMax, pillFont, 12), px.x + 6, px.y + px.h - 12, { color: th.muted, size: 9.5 });
      /* ---------- right: energy envelope ---------- */
      const pts = (f) => { const out = []; for (let i = 0; i <= 100; i++) { const t = i / 100; out.push([t, f(t)]); } return out; };
      const ymax = C * Math.E * 1.5;
      const LEG = fitText(ctx, [LEGEND_LONG[2], ''], w - leftW - 8 - 56 - 30, `11.5px ${th.sans}`) !== '' ? LEGEND_LONG : LEGEND_SHORT;
      const ch = lineChart(ctx, { x: leftW + 4, y: 4, w: w - leftW - 8, h: h - 8 }, {
        title: fitText(ctx, TITLE_ENERGY, w - leftW - 8 - 56, `600 12px ${th.sans}`), xLabel: 't', yLabel: 'E = ‖u(t)‖²_{L²}', xDomain: [0, 1], yDomain: [0, ymax], legend: 'top-left',
        series: [
          { pts: pts(() => C * Math.E), color: th.bad, dash: [6, 4], label: LEG[0], width: 2 },
          { pts: pts((t) => C * (Math.exp(t) - 1)), color: th.accent, label: LEG[1], width: 3 },
          { pts: pts(() => 0.5 * C * Math.E), color: th.ok, dash: [2, 3], label: LEG[2], width: 2 },
          { pts: pts(() => C), color: th.faint, dash: [1, 3], label: LEG[3] },
        ],
        marker: tMark,
      });
      ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(ch.X(tMark), ch.Y(Et), 4, 0, Math.PI * 2); ctx.fill();
      labelPill(ctx, fitText(ctx, LAB_ENV, ch.w - 12, `600 9.5px ${th.sans}`, 12), ch.x0 + ch.w - 6, ch.y0 + ch.h - 14, { color: th.muted, align: 'right', size: 9.5 });
    };
    ui.loop(() => draw());
    c.onResize(() => draw());
    return { destroy() {} };
  },
};

function ro_(ui) {
  return ui.readouts([
    { key: 'Et', label: 'Envelope at t', unit: 'C(eᵗ − 1)' },
    { key: 'E1', label: 'Envelope as t → 1', unit: 'C(e − 1)' },
    { key: 'lean', label: 'Lean L² bound', unit: 'C · e' },
    { key: 'ke', label: 'Kinetic-energy bound', unit: '½ · C · e' },
  ]);
}
