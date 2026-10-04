// Formula-derived model, not the solution: ‖ω(t)‖_∞ = (T* − t)^−γ with T* = 1 and a free exponent γ.
//   ∫_0^t (T*−s)^−γ ds = (T*^{1−γ} − (T*−t)^{1−γ}) / (1−γ)   (γ ≠ 1),      = ln(T*/(T*−t))   (γ = 1).
//   The limit t → T* is finite exactly when γ < 1.
// Beale–Kato–Majda: a smooth Euler solution continues past T* iff this integral is finite. The theorem proves
// the integral is infinite (vorticity_lintegral_eq_top); it gives no rate, so γ is only an illustration.
// Elementary pointwise fact used for the second curve (operator norms, as in velocityC1Norm): (∇u − (∇u)ᵀ)x = ω × x,
// so |ω| = ‖∇u − (∇u)ᵀ‖ ≤ 2‖∇u‖ and ‖∇u‖_∞ ≥ ‖ω‖_∞ / 2.
import { lineChart, theme, labelPill, fmt } from '../scene-runtime.js';

const TS = 1;
const omega = (g, t) => Math.pow(TS - t, -g);
const integral = (g, t) => (Math.abs(g - 1) < 1e-9 ? Math.log(TS / (TS - t)) : (Math.pow(TS, 1 - g) - Math.pow(TS - t, 1 - g)) / (1 - g));
const limit = (g) => (g < 1 ? Math.pow(TS, 1 - g) / (1 - g) : Infinity);

export default {
  id: 'bkm-integral', label: 'formula-derived',
  mount(host, params, ui) {
    let g = params.gamma ?? 1, logS = 1, showGrad = false, playing = false;
    const c = ui.canvas({ aspect: 16 / 8, minHeight: 300, maxHeight: 460 });
    const ro = ui.readouts([
      { key: 'w', label: '‖ω(t)‖∞ (model)' },
      { key: 'I', label: '∫₀ᵗ ‖ω‖∞ ds so far' },
      { key: 'L', label: 'Limit as t → T*' },
      { key: 'V', label: 'Verdict for this model γ' },
    ]);
    const sl = {};
    sl.t = ui.slider({ label: 'Time to the singular time, T* − t', min: 0.3, max: 4, step: 0.01, value: logS, format: (v) => { const s = Math.pow(10, -v); return s >= 0.01 ? String(Number(s.toPrecision(2))) : `10^−${v.toFixed(2)}`; }, onChange: (v) => { logS = v; } });
    ui.slider({ label: 'Model exponent γ  (‖ω‖∞ ∝ (T*−t)^−γ)', min: 0.2, max: 2, step: 0.05, value: g, format: (v) => v.toFixed(2), hint: 'The theorem proves the integral is infinite; it does not state any γ. γ ≥ 1 is the regime consistent with it.', onChange: (v) => { g = v; } });
    ui.toggle({ label: 'Show the gradient lower bound ‖∇v‖∞ ≥ ‖ω‖∞ / 2', value: false, hint: 'Elementary, in operator norms: |ω| = ‖∇v − (∇v)ᵀ‖ ≤ 2‖∇v‖. The theorem’s C¹ clause is limsup ‖v‖∞ + ‖∇v‖∞ = ∞.', onChange: (v) => { showGrad = v; } });
    ui.toggle({ label: 'Play: approach T*', value: false, onChange: (v) => { playing = v; if (v && logS >= 3.99) logS = 0.3; } });
    ui.note('<b>Formula-derived model.</b> A power law $(T^*-t)^{-\\gamma}$ stands in for the vorticity supremum; nothing here is taken from the actual solution, whose rate is not known. The shaded area is the time integral in the Beale–Kato–Majda criterion. Finite area: the solution could be continued. Infinite area: a genuine breakdown. The theorem proves the second alternative for the constructed data.');

    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      const s = Math.pow(10, -logS), t = TS - s;
      const wv = omega(g, t), I = integral(g, t), Lim = limit(g);
      ro.update({
        w: { value: wv, trend: 'up', detail: `‖ω(t)‖∞ at T* − t = ${s.toExponential(1)}` },
        I: { value: I, trend: 'up', detail: g < 1 ? `∫₀ᵗ ‖ω‖∞ ds → ${fmt.num(Lim)}` : '∫₀ᵗ ‖ω‖∞ ds → ∞' },
        L: { value: isFinite(Lim) ? fmt.num(Lim) : '∞', trend: isFinite(Lim) ? 'flat' : 'up', detail: g < 1 ? `γ = ${g.toFixed(2)} < 1` : `γ = ${g.toFixed(2)} ≥ 1` },
        V: { value: isFinite(Lim) ? 'continues' : 'breakdown', trend: isFinite(Lim) ? 'down' : 'up', detail: `${isFinite(Lim) ? 'finite integral → this model would extend past T*.' : 'infinite integral → no continuation.'} The theorem’s own integral is infinite; this slider only explores the criterion` },
      });
      ctx.clearRect(0, 0, w, h);
      const half = w / 2;
      // left: the model vorticity supremum with the integral shaded
      const curve = [], grad = []; const M = 220;
      for (let i = 0; i <= M; i++) { const tt = TS * (1 - Math.pow(10, -4.2 * i / M)); curve.push([tt, omega(g, tt)]); grad.push([tt, omega(g, tt) / 2]); }
      const yTop = Math.max(10, Math.pow(10, 4.2 * g) * 1.3);
      const series = [{ pts: curve, color: th.bad, label: '‖ω(t)‖∞ = (T*−t)^−γ (model)' }];
      if (showGrad) series.push({ pts: grad, color: th.euler, dash: [5, 3], label: '‖∇v‖∞ ≥ ‖ω‖∞ / 2' });
      const ch = lineChart(ctx, { x: 0, y: 4, w: half - 4, h: h - 8 }, {
        title: 'Vorticity supremum as t → T*', xLabel: 't  (T* = 1)', yLabel: '‖ω‖∞ (log)', yLog: true, xDomain: [0, TS], yDomain: [0.8, yTop],
        series, marker: t, legend: 'top-left',
      });
      // shade ∫₀ᵗ under the curve (log axis: fill down to the chart floor)
      ctx.save(); ctx.beginPath(); ctx.rect(ch.x0, ch.y0, ch.w, ch.h); ctx.clip();
      ctx.beginPath(); ctx.moveTo(ch.X(0), ch.y0 + ch.h);
      for (const [tt, vv] of curve) { if (tt > t) break; ctx.lineTo(ch.X(tt), ch.Y(vv)); }
      ctx.lineTo(ch.X(t), ch.Y(wv)); ctx.lineTo(ch.X(t), ch.y0 + ch.h); ctx.closePath();
      ctx.fillStyle = th.bad; ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
      labelPill(ctx, `shaded: ∫₀ᵗ ‖ω‖∞ = ${fmt.num(I)}`, ch.x0 + 8, ch.y0 + (showGrad ? 58 : 44), { color: th.bad, size: 10.5 });
      // right: the running integral and its limit
      const run = []; for (let i = 0; i <= M; i++) { const tt = TS * (1 - Math.pow(10, -4 * i / M)); run.push([tt, integral(g, tt)]); }
      const yMax = Math.max(2, (isFinite(Lim) ? Lim * 1.3 : 0), I * 1.15);   // headroom keeps the legend off the limit line
      const series2 = [{ pts: run, color: th.accent, label: 'running integral ∫₀ᵗ ‖ω‖∞ ds' }];
      if (isFinite(Lim)) series2.push({ pts: [[0, Lim], [TS, Lim]], color: th.ok, dash: [5, 3], label: `finite limit ${fmt.num(Lim)}: continuation` });
      const ch2 = lineChart(ctx, { x: half + 4, y: 4, w: half - 4, h: h - 8 }, {
        title: 'The Beale–Kato–Majda integral', xLabel: 't  (T* = 1)', yLabel: 'integral', xDomain: [0, TS], yDomain: [0, yMax],
        series: series2, marker: t, legend: 'top-left',
      });
      // verdict caption, measured so it stays inside the right chart
      ctx.font = `600 10.5px ${th.sans}`;
      const vLong = isFinite(Lim) ? 'finite limit: this model would continue past T*' : 'no finite limit: ∫₀^T* ‖ω‖∞ = ∞, genuine breakdown';
      const vShort = isFinite(Lim) ? 'finite: would continue' : 'integral = ∞: breakdown';
      labelPill(ctx, ctx.measureText(vLong).width + 20 <= ch2.w ? vLong : vShort, ch2.x0 + ch2.w - 8, ch2.y0 + ch2.h - 14, { color: isFinite(Lim) ? th.ok : th.bad, size: 10.5, align: 'right' });
    };
    ui.loop((dt) => {
      if (playing) { logS = Math.min(4, logS + dt * 0.5); sl.t.set(logS, false); if (logS >= 4) playing = false; }
      draw();
    });
    return { destroy() {} };
  },
};
