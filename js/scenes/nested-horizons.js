// Formula-derived from the Lean definitions of the activation times and horizons.
//   Euler/PacketNestedHorizons.lean:15-22
//     stepLength n     = x_{n+1} / sqrt(β_n · a_n · previousShear_n)
//     activationTime n = Σ_{i<n} stepLength i
//     horizonTime n    = activationTime n + 2·timeWidth n
//   Euler/PacketSourceScaleSequence.lean:42   timeWidth n = 3 x_{n+1} x_n / sqrt(previousShear n)
//   Euler/PacketBaseGuardScales.lean:14,30     baseHorizon = 6 J² X^{−498} = 2·timeWidth 0
//   Hypotheses ½ ≤ a_n ≤ 2 and ½ ≤ β_n x_n² ≤ 2 (PacketNestedHorizons.lean:35-38); in a stage a_n = frame.a and
//   β_n = frame.sigma² (PacketStageRestriction.lean:18-19). They enter only through q_n = a_n β_n x_n², since
//     stepLength n = timeWidth n / (3 √q_n),  so  timeWidth/6 ≤ stepLength ≤ 2·timeWidth/3  (stepLength_bounds).
//   The nesting needs timeWidth (n+1) ≤ timeWidth n / 2 (StageGuards.next_width, PacketSourceScaleGuards.lean:129).
// The scene uses one q for every stage (a placeholder inside the Lean's range). All times are shown relative
// to baseHorizon, which is itself astronomically small; absolute values are printed as powers of ten.
import { theme, labelPill, fmt } from '../scene-runtime.js';

const LN10 = Math.LN10;
const ROWS = 6;
function p10(l10) {
  if (!isFinite(l10)) return '—';
  if (Math.abs(l10) < 4) return fmt.num(Math.pow(10, l10));
  const e = Math.round(l10);
  return `10^${Math.abs(e) >= 1e6 ? `(${fmt.num(e)})` : (e < 0 ? `−${-e}` : e)}`;
}
function compute(J, X, q) {
  const n1 = ROWS + 2;
  const lnx = new Float64Array(n1 + 1); lnx[0] = Math.log(X);
  for (let n = 0; n < n1; n++) lnx[n + 1] = lnx[n] + 2 * Math.log(J + n);
  const lnPrev = (n) => (n === 0 ? 1000 * Math.log(X) : Math.exp(lnx[n - 1]) / Math.pow(J + n - 1, 5));
  const lnTw = [], lnStep = [];
  for (let n = 0; n <= ROWS + 1; n++) { lnTw[n] = Math.log(3) + lnx[n + 1] + lnx[n] - 0.5 * lnPrev(n); lnStep[n] = lnTw[n] - Math.log(3) - 0.5 * Math.log(q); }
  const lnBase = Math.log(6) + 2 * Math.log(J) - 498 * Math.log(X);   // = ln 2 + lnTw[0]
  const rows = [];
  for (let n = 0; n <= ROWS; n++) {
    const r = Math.exp(lnTw[n + 1] - lnTw[n]);                      // timeWidth(n+1)/timeWidth(n)
    rows.push({ n, l10stepFrac: (lnStep[n] - lnBase) / LN10, r, l10r: (lnTw[n + 1] - lnTw[n]) / LN10, ok: r <= 0.5,
      l10grad: n === 0 ? NaN : lnPrev(n) / LN10 - Math.log10(2) });
  }
  return { rows, l10base: lnBase / LN10, nextFrac: 1 / (6 * Math.sqrt(q)), firstFail: rows.find((rw) => !rw.ok)?.n ?? -1 };
}
function sub(n) { return String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join(''); }

export default {
  id: 'nested-horizons', label: 'formula-derived',
  mount(host, params, ui) {
    let J = params.J ?? 3, l10X = params.log10X ?? 7.5, q = params.q ?? 1;
    let D = compute(J, Math.pow(10, l10X), q);
    const c = ui.canvas({ aspect: 16 / 9.5, minHeight: 380, maxHeight: 560 });
    const ro = ui.readouts([
      { key: 'base', label: 'baseHorizon = 6J²X^(−498)' },
      { key: 't1', label: 'First activation t₁' },
      { key: 'r0', label: 'Width ratio tw₁ / tw₀' },
      { key: 'nest', label: 'Nesting tw₍ₙ₊₁₎ ≤ twₙ/2' },
    ]);
    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      const r0 = D.rows[0];
      ro.update({
        base: { value: p10(D.l10base), detail: 'T* ≤ baseHorizon ≤ 1 (lifespan_le_base, time_small)' },
        t1: { value: `${fmt.num(D.nextFrac)} × baseHorizon`, detail: 'stepLength 0 = baseHorizon/(6√q); Lean: ≥ baseHorizon/12' },
        r0: { value: p10(r0.l10r), trend: r0.ok ? 'down' : 'up', detail: r0.ok ? 'next horizon is this much shorter' : 'exceeds ½: hypothesis next_width fails' },
        nest: { value: D.firstFail < 0 ? `holds for n ≤ ${ROWS}` : `fails at n = ${D.firstFail}`, trend: D.firstFail < 0 ? 'flat' : 'up', detail: D.firstFail < 0 ? 'as the Scales record guarantees' : 'this (J, X) is not admissible in the Lean' },
      });
      ctx.clearRect(0, 0, w, h);
      const xL = 150, xR = w - 24, span = xR - xL;
      /* ---- top: absolute axis 0 … baseHorizon ---- */
      const yA = 40;
      ctx.strokeStyle = th.lineStrong; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xL, yA); ctx.lineTo(xR, yA); ctx.stroke();
      const tick = (x, lbl, col, up, align = 'center') => { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(x, yA - 6); ctx.lineTo(x, yA + 6); ctx.stroke(); labelPill(ctx, lbl, x, up ? yA - 17 : yA + 17, { color: col, align, size: 10 }); };
      tick(xL, '0', th.muted, true); tick(xR, `baseHorizon = ${p10(D.l10base)}`, th.muted, true, 'right');
      tick(xL + span / 12, 'baseHorizon/12', th.faint, false);
      const x1 = xL + span * D.nextFrac;
      tick(x1, 't₁ (stage 1 switched on)', th.euler, true);
      labelPill(ctx, `t₂, t₃, … lie within ${p10(D.rows[1].l10stepFrac + 0.3)} × baseHorizon of t₁  →  T* ≤ baseHorizon`, x1 + 6, yA + 17, { color: th.fg, size: 10 });
      labelPill(ctx, 'absolute time (unit = baseHorizon)', 8, yA, { color: th.muted, size: 10 });
      /* ---- rows: each horizon rescaled to full width ---- */
      const top = 78, rowH = (h - top - 30) / ROWS;
      for (let i = 0; i < ROWS; i++) {
        const rw = D.rows[i], y = top + i * rowH + rowH * 0.62;
        const yPrev = top + (i - 1) * rowH + rowH * 0.62;
        const xa = xL + span * D.nextFrac;
        const wNext = Math.min(xR - xa, Math.max(3, span * rw.r));
        if (i > 0) { // zoom lines from the previous row's "next horizon" strip to this row
          const pr = D.rows[i - 1]; const xb = xa + Math.min(xR - xa, Math.max(3, span * pr.r));
          ctx.strokeStyle = th.line; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xa, yPrev + 4); ctx.lineTo(xL, y - 4); ctx.moveTo(xb, yPrev + 4); ctx.lineTo(xR, y - 4); ctx.stroke(); ctx.setLineDash([]);
        }
        // the stage's own horizon [t_n, t_n + 2·timeWidth n]
        ctx.strokeStyle = th.lineStrong; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xR, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(xL, y - 7); ctx.lineTo(xL, y + 7); ctx.moveTo(xR, y - 7); ctx.lineTo(xR, y + 7); ctx.stroke();
        labelPill(ctx, `stage ${i}`, 8, y - 9, { color: th.fg, size: 11 });
        labelPill(ctx, i === 0 ? 'horizon = baseHorizon' : `[tₙ, tₙ + 2·twₙ]`, 8, y + 8, { color: th.muted, size: 10 });
        // activation spike at t_n (n ≥ 1): |∇u(t_n, 0)| ≥ previousShear n / 2
        if (i >= 1) {
          const hs = Math.min(rowH * 0.5, 6 + 7 * Math.log10(1 + Math.max(0, rw.l10grad)));
          ctx.strokeStyle = th.bad; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xL, y - hs); ctx.stroke();
          labelPill(ctx, `|∇u(tₙ,0)| ≥ previousShearₙ/2 = ${p10(rw.l10grad)}`, xL + 8, y - hs - 2, { color: th.bad, size: 10 });
        } else {
          labelPill(ctx, 'no bound at n = 0', xR, y - 12, { color: th.faint, size: 10, align: 'right' });
        }
        // next activation and the next (nested) horizon
        ctx.fillStyle = rw.ok ? th.euler : th.bad; ctx.globalAlpha = 0.85; ctx.fillRect(xa, y - 4, wNext, 8); ctx.globalAlpha = 1;
        ctx.strokeStyle = th.euler; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xa, y - 9); ctx.lineTo(xa, y + 9); ctx.stroke();
        labelPill(ctx, `t${sub(i + 1)} = t${sub(i)} + tw${sub(i)}/(3√q)`, xa, y + 18, { color: th.euler, size: 10, align: 'center' });
        labelPill(ctx, `next horizon: ${p10(rw.l10r)} × this one ${rw.ok ? '(≤ ½ ✓)' : '(> ½ ✗)'}`, Math.min(xa + wNext + 8, xR - 250), y - 12, { color: rw.ok ? th.ok : th.bad, size: 10 });
      }
    };
    ui.slider({ label: 'Stage offset J  (Lean: 3 ≤ J)', min: 3, max: 6, step: 1, value: J, format: (v) => `J = ${v}`, onChange: (v) => { J = v; D = compute(J, Math.pow(10, l10X), q); draw(); } });
    ui.slider({ label: 'Base scale X  (Lean: 8 ≤ X, chosen by existence)', min: 6, max: 9, step: 0.05, value: l10X, format: (v) => `X = 10^${v.toFixed(2)}`, hint: 'Below roughly X ≈ 4·10⁶ (for J = 3) the first nesting ratio exceeds ½; the Lean’s Scales exclude such X.', onChange: (v) => { l10X = v; D = compute(J, Math.pow(10, l10X), q); draw(); } });
    ui.slider({ label: 'q = aₙ·βₙ·xₙ²  (Lean: ¼ ≤ q ≤ 4; placeholder, one value for all n)', min: 0.25, max: 4, step: 0.05, value: q, format: (v) => fmt.num(v, 2), onChange: (v) => { q = v; D = compute(J, Math.pow(10, l10X), q); draw(); } });
    ui.note('<b>Formula-derived.</b> Times are computed from <code>stepLength</code>, <code>activationTime</code>, <code>horizonTime</code>, <code>timeWidth</code> and <code>baseHorizon</code> as defined in the Lean, with the unknown frame numbers aₙ and βₙ replaced by one placeholder q inside the range the Lean hypothesises. Each row rescales one stage’s horizon to full width; the shaded strip is the next stage’s horizon at true relative size (at least 3 px). Spike heights are compressed; their labels are exact. Stage 0 has no spike because <code>gradient_lower</code> requires n ≠ 0.');
    c.onResize(() => draw());
    return { destroy() {} };
  },
};
