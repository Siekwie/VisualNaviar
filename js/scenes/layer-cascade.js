// Formula-derived sizes from the Lean scale sequences, drawn as a schematic 1-D cross-section.
// Sources (openai/NavierStokesAndEuler, pinned commit):
//   Euler/PacketSourceScaleChoice.lean:226      x_0 = X,  x_{n+1} = (J+n)^2 · x_n
//   Euler/PacketSourceScaleSequence.lean:18-31  shear_n = exp(x_n/(J+n)^5), frequency k_n = exp(x_n/(J+n)^2),
//                                               supportScale ℓ_n = exp(−x_n/(J+n)^{7/2}),
//                                               previousShear_0 = X^1000, previousShear_{n+1} = shear_n
//   Euler/PacketInitialInput.lean:91-96         H^s bound on the oscillating increment (constants and the
//                                               stage-dependent polynomial prefactor dropped here):
//                                                 ℓ_n^{−s} · k_n^{s} · e^{−x_n/8}
//   Euler/PacketStageGrowth.lean:52             activation gradient ≥ previousShear_n / 2  (n ≥ 1)
// Every quantity is handled as a base-10 logarithm: the numbers leave double precision after three stages.
// The wave shapes on the left are schematic; their heights, widths and wavelengths are compressed for display.
import { lineChart, theme, labelPill, fmt } from '../scene-runtime.js';

const LN10 = Math.LN10;
const NST = 8;                 // stages drawn: n = 0 … 7
const SOB = [0, 1, 2, 3, 5];   // Sobolev orders charted

function scales(J, X) {
  const lnx = new Float64Array(NST + 1);
  lnx[0] = Math.log(X);
  for (let n = 0; n < NST; n++) lnx[n + 1] = lnx[n] + 2 * Math.log(J + n);
  const out = [];
  for (let n = 0; n < NST; n++) {
    const x = Math.exp(lnx[n]);                     // ≤ ~1e20 for the slider ranges: finite
    const jn = J + n;
    const l10k = x / (jn * jn) / LN10;              // log10 k_n
    const l10linv = x / Math.pow(jn, 3.5) / LN10;   // log10 (1/ℓ_n)
    const l10amp = -x / 8 / LN10;                   // log10 e^{−x_n/8}
    const l10prev = n === 0 ? 1000 * Math.log10(X) : Math.exp(lnx[n - 1]) / Math.pow(jn - 1, 5) / LN10;
    out.push({ n, x, l10x: lnx[n] / LN10, l10k, l10linv, l10amp, l10prev, l10grad: l10prev - Math.log10(2) });
  }
  return out;
}
/** Readable form of a number given as log10. */
function p10(l10) {
  if (!isFinite(l10)) return '—';
  if (Math.abs(l10) < 4) return fmt.num(Math.pow(10, l10));
  const e = Math.round(l10);
  return `10^${Math.abs(e) >= 1e6 ? `(${fmt.num(e)})` : (e < 0 ? `−${-e}` : e)}`;
}
const bound = (s, q) => s * (q.l10k + q.l10linv) + q.l10amp;   // log10 of ℓ^{−s} k^{s} e^{−x/8}

export default {
  id: 'layer-cascade', label: 'formula-derived',
  mount(host, params, ui) {
    let J = params.J ?? 3, X = params.X ?? 8, stage = params.stage ?? 2;
    let S = scales(J, X);
    const c = ui.canvas({ aspect: 16 / 9.5, minHeight: 340, maxHeight: 520 });
    const ro = ui.readouts([
      { key: 'x', label: 'Scale xₙ' },
      { key: 'k', label: 'Wavenumber kₙ' },
      { key: 'l', label: 'Support scale ℓₙ' },
      { key: 'a', label: 'Amplitude factor' },
      { key: 'g', label: 'Activation gradient' },
    ]);
    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      const q = S[stage];
      ro.update({
        x: { value: p10(q.l10x), detail: `x₍ₙ₊₁₎ = (J+n)²·xₙ, J = ${J}, n = ${stage}` },
        k: { value: p10(q.l10k), trend: 'up', detail: 'frequency = exp(xₙ/(J+n)²)' },
        l: { value: p10(-q.l10linv), trend: 'down', detail: 'supportScale = exp(−xₙ/(J+n)^(7/2))' },
        a: { value: p10(q.l10amp), trend: 'down', detail: `e^(−xₙ/8): H⁰ bound of increment ${stage}` },
        g: { value: stage === 0 ? 'n/a' : p10(q.l10grad), trend: 'up', detail: stage === 0 ? 'gradient_lower needs n ≠ 0' : '≥ previousShearₙ / 2 (gradient_lower)' },
      });
      ctx.clearRect(0, 0, w, h);
      /* ---- left: waterfall of schematic increments ---- */
      const leftW = Math.round(w * 0.5);
      ctx.fillStyle = th.sunken; ctx.fillRect(0, 0, leftW, h);
      const top = 26, rowH = (h - top - 6) / NST;
      const textW = Math.min(170, leftW * 0.52);
      const waveL = textW + 4, waveR = leftW - 8, cx = (waveL + waveR) / 2, Wmax = (waveR - waveL) / 2;
      for (let n = 0; n < NST; n++) {
        const s = S[n], hl = n === stage;
        const y0 = top + n * rowH, ym = y0 + rowH * 0.6;
        if (hl) { ctx.fillStyle = th.bg; ctx.globalAlpha = 0.9; ctx.fillRect(2, y0 + 1, leftW - 4, rowH - 2); ctx.globalAlpha = 1; }
        // display compression (double logarithm): keeps every stage visible while preserving the ordering
        const ampF = 1 / (1 + Math.log10(1 + Math.abs(s.l10amp)));
        const A = Math.max(1, rowH * 0.4 * ampF);
        const lam = Math.max(2.6, 44 / (1 + Math.log10(1 + s.l10k + s.l10linv)));
        const W = Math.max(6, Wmax / (1 + Math.log10(1 + s.l10linv)));
        ctx.strokeStyle = th.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(waveL, ym + 0.5); ctx.lineTo(waveR, ym + 0.5); ctx.stroke();
        ctx.strokeStyle = hl ? th.euler : th.muted; ctx.globalAlpha = hl ? 1 : 0.75; ctx.lineWidth = hl ? 1.6 : 1.1;
        ctx.beginPath();
        const x0 = Math.max(waveL, cx - W), x1 = Math.min(waveR, cx + W);
        for (let px = x0; px <= x1; px += 0.5) {
          const u = (px - cx) / W; const env = Math.pow(Math.cos(Math.PI * u / 2), 2);
          const y = ym - A * env * Math.cos(2 * Math.PI * (px - cx) / lam);
          if (px === x0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
        // compact exact numbers (three short lines); x_n and the gradient bound are in the readouts
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = hl ? th.fg : th.muted;
        ctx.font = `${hl ? 700 : 600} 10px ${th.sans}`; ctx.fillText(`n = ${n}   amp ${p10(s.l10amp)}`, 8, y0 + rowH * 0.24);
        ctx.font = `10px ${th.sans}`;
        ctx.fillText(`k = ${p10(s.l10k)}`, 8, y0 + rowH * 0.52);
        ctx.fillText(`ℓ = ${p10(-s.l10linv)}`, 8, y0 + rowH * 0.8);
      }
      labelPill(ctx, 'schematic shapes · exact numbers · amp = e^(−xₙ/8)', 6, 13, { color: th.muted, size: 10.5 });
      /* ---- right: two charts ---- */
      const rx = leftW + 6, rw = w - leftW - 10;
      const h1 = Math.round(h * 0.57);
      const series1 = SOB.map((s, i) => ({ pts: S.map((q2) => [q2.n, bound(s, q2)]), color: [th.ok, th.accent, th.numeric, th.warn, th.bad][i], label: `s = ${s}`, width: s === 0 ? 2.4 : 1.8 }));
      const yr = 40 * X;
      lineChart(ctx, { x: rx, y: 2, w: rw, h: h1 - 4 }, {
        title: 'log₁₀ of the Hˢ bound  ℓₙ⁻ˢ kₙˢ e^(−xₙ/8)', xLabel: 'stage n', yLabel: 'log₁₀ (bound)',
        xDomain: [0, NST - 1], yDomain: [-yr, yr], series: series1, marker: stage, legend: 'top-right',
      });
      const off = S[NST - 1];
      labelPill(ctx, `n = 7, s = 0:  ${p10(bound(0, off))}`, rx + 54, 36, { color: th.muted, size: 10 });
      lineChart(ctx, { x: rx, y: h1, w: rw, h: h - h1 - 2 }, {
        title: 'log₁₀ gradient bound  previousShearₙ/2', xLabel: 'stage n', yLabel: 'log₁₀ (bound)',
        xDomain: [0, NST - 1], yDomain: [-1, 4 * X], marker: stage, legend: 'top-left',
        series: [{ pts: S.filter((q2) => q2.n >= 1).map((q2) => [q2.n, q2.l10grad]), color: th.euler, label: 'gradient_lower (n ≥ 1)' }],
      });
      labelPill(ctx, `n = 7:  ${p10(off.l10grad)}`, rx + 54, h1 + 52, { color: th.muted, size: 10 });
    };
    ui.slider({ label: 'Stage n (highlighted)', min: 0, max: NST - 1, step: 1, value: stage, format: (v) => `n = ${v}`, onChange: (v) => { stage = v; draw(); } });
    ui.slider({ label: 'Stage offset J  (Lean: 3 ≤ J)', min: 3, max: 6, step: 1, value: J, format: (v) => `J = ${v}`, hint: 'Lean docstring (EulerProof.lean:18954): “J+n is the stage index in the source”.', onChange: (v) => { J = v; S = scales(J, X); draw(); } });
    ui.slider({ label: 'Base scale X  (Lean: 8 ≤ X)', min: Math.log10(8), max: 7, step: 0.01, value: Math.log10(X), format: (v) => `X = ${fmt.num(Math.pow(10, v))}`, hint: 'Every exponent is proportional to X, so X only rescales the vertical axes. The floor 8 is far below the value the other conditions force.', onChange: (v) => { X = Math.pow(10, v); S = scales(J, X); draw(); } });
    ui.note('<b>Formula-derived sizes, schematic shapes.</b> Every number in the rows, readouts and charts is computed from the Lean definitions <code>scaleSequence</code>, <code>frequency</code>, <code>supportScale</code>, <code>previousShear</code> and the <code>initial_bounds</code> estimate (constants and the polynomial prefactor dropped). The wave drawings are illustrations: amplitudes, widths and wavelengths are compressed by a double logarithm so that all stages stay visible.');
    c.onResize(() => draw());
    return { destroy() {} };
  },
};
