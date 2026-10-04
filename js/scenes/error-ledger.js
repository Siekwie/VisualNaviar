// Formula-derived scene: the exponent ledger of the correction iteration, as stated in the Lean sources.
// Nothing here computes a residual. Every number comes from these definitions (pinned commit):
//   stage parameter σ_J = 1/5 + J/10                         ExponentLedger.stageParameter, ActualIterationLedger.sigma
//   wave class  B_J = 1/2 + σ_J = 7/10 + J/10                ActualIterationLedger.residualWave
//   mean class  C_J = 1 + σ_J = 6/5 + J/10                    ActualIterationLedger.residualMean
//   per-step gains: particular 2/5, signed 2/5 − κ, κ = 10⁻⁵   ExponentLedger.particular_gain_eq, signed_gain_eq
//   physical gain after J cycles: h·J/10 (a q-power)           ActualIterationLedger.gain; ActualCycleResidualBounds.finite_residual_rates
//   diagonal cutoffs χ(a_j q) with cutoff ≡ 1 for |x| ≤ 1/2, ≡ 0 for |x| ≥ 1, schedule 2 a_j ≤ a_{j+1}
//                                                             SmoothCutoffs.cutoff, SolenoidalDiagonal.cutStage, MixedCandidateWitness.SelectedSchedule
//   slow-base weights q^{2jh}                                  SlowBorelBase.positiveCoefficient, SlowExpansionResidual.slowOrder
//   dyadic labels Q n = 2^{−n}, active when q ≤ Q n < 2q       SlotColoring.dyadicQ, ActualPolarCoverage
// The schedule a_j is abstract in the Lean (chosen by DiagonalScale); the geometric a_j = g^j below is illustrative.
import { lineChart, theme, labelPill, fmt } from '../scene-runtime.js';

const KAPPA = 1e-5;
/** Mathlib's smoothTransition, used only to draw the shape of the cutoff ramp. */
const glue = (x) => (x > 0 ? Math.exp(-1 / x) : 0);
const smoothTransition = (x) => { const a = glue(x), b = glue(1 - x); return a / (a + b || 1); };
export const cutoff = (x) => smoothTransition(2 * (1 - Math.abs(x))); // ≡ 1 for |x| ≤ 1/2, ≡ 0 for |x| ≥ 1

export default {
  id: 'error-ledger', label: 'formula-derived',
  mount(host, params, ui) {
    let J = params.J ?? 4, h = params.h ?? 0.05, logQ = params.logQ ?? 2.3, g = params.g ?? 2;
    const JMAX = 20, ROWS = 8;
    const c = ui.canvas({ aspect: 16 / 8.2, minHeight: 320, maxHeight: 500 });
    const ro = ui.readouts([
      { key: 'B', label: 'Wave class after J cycles', unit: 'B_J = 7/10 + J/10' },
      { key: 'C', label: 'Mean class after J cycles', unit: 'C_J = 6/5 + J/10' },
      { key: 'g', label: 'Physical gain', unit: 'h·J/10 (power of q)' },
      { key: 'n', label: 'Active stages at this q', unit: 'and dyadic label n' },
    ]);
    const sJ = ui.slider({ label: 'Completed correction cycles J', min: 0, max: JMAX, step: 1, value: J, format: (v) => String(v), onChange: (v) => { J = v; } });
    ui.slider({ label: 'Exponent h (exaggerated; Lean: h ≤ 1/1000)', min: 0.001, max: 0.2, step: 0.001, value: h, format: (v) => v.toFixed(3), onChange: (v) => { h = v; } });
    ui.slider({ label: 'Similarity scale q (marker)', min: 0, max: 6, step: 0.01, value: logQ, format: (v) => `10^−${v.toFixed(2)}`, onChange: (v) => { logQ = v; } });
    ui.slider({ label: 'Schedule growth a_{j+1} / a_j (illustrative; Lean: ≥ 2)', min: 2, max: 6, step: 0.5, value: g, format: (v) => v.toFixed(1), onChange: (v) => { g = v; } });
    ui.note('<b>Formula-derived from the Lean exponent ledger; no residual is computed here.</b> After $J$ cycles the booked classes are $B_J = \\tfrac{7}{10} + \\tfrac{J}{10}$ (waves) and $C_J = \\tfrac65 + \\tfrac{J}{10}$ (means); each wave step gains $\\tfrac25$ (particular) or $\\tfrac25 - \\kappa$ (signed), $\\kappa = 10^{-5}$, more than the booked $\\tfrac1{10}$. In physical units the residual near the singular point improves by $q^{hJ/10}$. Stages are switched on by $\\chi(a_j q)$, with $\\chi \\equiv 1$ for $|x| \\le \\tfrac12$ and $\\chi \\equiv 0$ for $|x| \\ge 1$; the slow base weights stage $j$ by $q^{2jh}$. The schedule $a_j = g^j$ is illustrative.');

    const draw = () => {
      const { ctx, w, h: H } = c; const th = theme();
      const q = Math.pow(10, -logQ);
      const B = 0.7 + J / 10, C = 1.2 + J / 10, gain = h * J / 10;
      const aj = (j) => Math.pow(g, j); // illustrative schedule, a_0 = 1
      let active = 0; for (let j = 0; j < 60; j++) if (cutoff(aj(j) * q) > 0) active = j + 1;
      const nLabel = Math.floor(-Math.log2(q));
      ro.update({
        B: { value: B, trend: 'up', detail: `gain per step ≥ 2/5 − κ = ${(0.4 - KAPPA).toFixed(5)} > 1/10 booked` },
        C: { value: C, trend: 'up', detail: `C_J = B_J + 1/2` },
        g: { value: gain, trend: 'up', detail: `residual jets ≲ q^(${gain.toFixed(4)} − loss) near (1, 0)` },
        n: { value: active, trend: 'flat', detail: `Q_n = 2^−${nLabel} with q ≤ Q_n < 2q` },
      });
      ctx.clearRect(0, 0, w, H);
      const leftW = Math.floor(w * 0.46);
      /* ---------- left: the ledger versus J ---------- */
      const pts = (f) => { const out = []; for (let j = 0; j <= JMAX; j++) out.push([j, f(j)]); return out; };
      const ch = lineChart(ctx, { x: 0, y: 4, w: leftW - 6, h: H - 8 }, {
        title: 'Booked exponent classes vs cycles J', xLabel: 'cycles J', yLabel: 'exponent', xDomain: [0, JMAX], yDomain: [0, 4.4], legend: 'top-left',
        series: [
          { pts: pts((j) => 1.2 + j / 10), color: th.warn, label: 'mean class C_J = 6/5 + J/10', width: 2.5 },
          { pts: pts((j) => 0.7 + j / 10), color: th.accent, label: 'wave class B_J = 7/10 + J/10', width: 2.5 },
          { pts: pts((j) => 0.4), color: th.ok, dash: [5, 3], label: 'gain per wave step: 2/5 or 2/5 − κ' },
          { pts: pts((j) => h * j / 10), color: th.numeric, dash: [2, 3], label: `physical gain h·J/10 (h = ${h.toFixed(3)})`, width: 2 },
        ],
        marker: J,
      });
      ctx.fillStyle = th.accent; ctx.beginPath(); ctx.arc(ch.X(J), ch.Y(B), 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = th.warn; ctx.beginPath(); ctx.arc(ch.X(J), ch.Y(C), 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = th.numeric; ctx.beginPath(); ctx.arc(ch.X(J), ch.Y(gain), 4, 0, Math.PI * 2); ctx.fill();
      /* ---------- right: stages switched on along q ---------- */
      const rx = leftW + 50, rw = w - rx - 14, top = 46, rowH = Math.min(24, (H - 130) / ROWS), bot = top + ROWS * rowH;
      const LQ = (lq) => rx + (lq / 6) * rw; // lq = −log10 q ∈ [0, 6]
      ctx.fillStyle = th.fg; ctx.font = `600 12px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('Stages switched on by χ(a_j q) as q → 0', rx, 6);
      ctx.strokeStyle = th.line; ctx.lineWidth = 1;
      for (let k = 0; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(LQ(k), top); ctx.lineTo(LQ(k), bot + 34); ctx.stroke(); ctx.fillStyle = th.faint; ctx.font = `10.5px ${th.sans}`; ctx.textAlign = 'center'; ctx.fillText(k === 0 ? 'q = 1' : `10⁻${k}`, LQ(k), bot + 36); }
      for (let j = 0; j < ROWS; j++) {
        const y = top + j * rowH, a = aj(j);
        const lqOn = Math.log10(2 * a), lqRamp = Math.log10(a); // χ ≡ 1 for q ≤ 1/(2a) i.e. −log q ≥ log(2a); ramp for 1/(2a) < q < 1/a
        ctx.fillStyle = th.faint; ctx.font = `10.5px ${th.mono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(`j=${j}`, rx - 6, y + rowH / 2);
        const isOn = cutoff(a * q) > 0;
        const col = isOn ? th.accent : th.lineStrong;
        // ramp drawn by sampling the cutoff shape
        if (lqRamp < 6) {
          const x1 = LQ(Math.max(0, lqRamp)), x2 = LQ(Math.min(6, lqOn));
          const n = Math.max(2, Math.floor((x2 - x1) / 2));
          for (let i = 0; i < n; i++) { const lq = Math.max(0, lqRamp) + ((Math.min(6, lqOn) - Math.max(0, lqRamp)) * (i + 0.5)) / n; const v = cutoff(a * Math.pow(10, -lq)); ctx.fillStyle = col; ctx.globalAlpha = 0.15 + 0.75 * v; ctx.fillRect(x1 + ((x2 - x1) * i) / n, y + 4, (x2 - x1) / n + 0.5, rowH - 8); }
          ctx.globalAlpha = 1;
        }
        if (lqOn < 6) { ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.fillRect(LQ(lqOn), y + 4, LQ(6) - LQ(lqOn), rowH - 8); ctx.globalAlpha = 1; }
        if (isOn) { const wgt = Math.pow(q, 2 * j * h); labelPill(ctx, j === 0 ? 'f₀ (uncut)' : `q^${(2 * j * h).toFixed(3)} = ${fmt.num(wgt)}`, LQ(6) - 4, y + rowH / 2, { color: th.fg, align: 'right', size: 9.5 }); }
      }
      // dyadic labels row
      const yD = bot + 6;
      ctx.fillStyle = th.faint; ctx.font = `10.5px ${th.mono}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('Q_n', rx - 6, yD + 8);
      for (let n = 0; n <= 20; n++) { const lq = n * Math.log10(2); if (lq > 6) break; const on = n === nLabel; ctx.fillStyle = on ? th.bad : th.lineStrong; ctx.fillRect(LQ(lq) - (on ? 1.5 : 0.5), yD, on ? 3 : 1, 16); }
      { const lx = nLabel * Math.log10(2); const right = lx > 3; labelPill(ctx, `label n = ${nLabel}: q ≤ 2^−${nLabel} < 2q`, LQ(Math.min(6, lx)) + (right ? -6 : 6), yD + 8, { color: th.bad, size: 9.5, align: right ? 'right' : 'left' }); }
      // marker
      ctx.strokeStyle = th.bad; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(LQ(logQ), top - 4); ctx.lineTo(LQ(logQ), bot + 24); ctx.stroke(); ctx.setLineDash([]);
      labelPill(ctx, `q = ${q.toExponential(2)}: ${active} stage${active === 1 ? '' : 's'} on`, LQ(logQ) + (logQ > 3.6 ? -6 : 6), top - 12, { color: th.bad, align: logQ > 3.6 ? 'right' : 'left', size: 10 });
      ctx.fillStyle = th.muted; ctx.font = `10.5px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`a_j = ${g}^j illustrative (Lean: 2a_j ≤ a_{j+1}, a_j → ∞)`, rx - 30, bot + 52);
      ctx.fillText('χ ≡ 1 for q ≤ 1/(2a_j): near q = 0 all cutoffs are one', rx - 30, bot + 66);
    };
    ui.loop(() => draw());
    c.onResize(() => draw());
    sJ.set(J, false);
    return { destroy() {} };
  },
};
