// Formula-derived scene: the GENERIC mechanism behind the oscillatory corrections, not the construction's waves.
// Left panel. A slowly varying amplitude a(x) times a fast carrier cos(κΦ), Φ = 2πx. The quadratic nonlinearity gives
//   (a cos κΦ)² = a²/2 + (a²/2) cos 2κΦ.
// The mean a²/2 is matched to a target R(x) by a = √(2R); the leftover (a²/2) cos 2κΦ has an antiderivative of size ∝ 1/κ.
// Right panel. The bracketing ("cone") condition of the Lean file Covariance.lean: in orthonormal (N, K) coordinates the two
// normalized signed columns are (−a, −b) and (−a, b) with positive scales; a target (−m, t) lies strictly between them iff |a t| < b m.
// Solving  s₋(−a,−b) + s₊(−a,b) = (−m, t)  gives  s₊ = (m/a + t/b)/2,  s₋ = (m/a − t/b)/2, the squared wave amplitudes.
import { lineChart, theme, labelPill, fmt } from '../scene-runtime.js';
import { hexA, fitText } from './similarity-zoom.js';

const TITLE_WAVE = ['Wave, its square, and the slow mean', 'Wave, square, slow mean', 'Wave and mean'];
const TITLE_CONE = ['Bracketing by two signed slots', 'Bracketing (two slots)', 'Bracketing'];
const LEGEND = [
  { label: 'wave a(x) cos κΦ', short: 'wave', width: 1.2 },
  { label: '(a cos κΦ)²', short: 'square', width: 1.2 },
  { label: 'mean a²/2 = target R(x)', short: 'mean = target', width: 3 },
  { label: '25 × ∫ leftover  (∝ 1/κ)', short: '25 × ∫ leftover', width: 2, dash: [5, 3] },
];
const LEG_H = 34; // the legend is drawn in a strip below the plot, so it never covers the curves
/** Two-column legend strip; uses the short labels when a row would not fit in maxW. */
function legendStrip(ctx, th, colors, x, y, maxW) {
  ctx.save(); ctx.font = `11px ${th.sans}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const colW = maxW / 2;
  const useShort = LEGEND.some((it) => ctx.measureText(it.label).width + 24 > colW);
  LEGEND.forEach((it, i) => {
    const lx = x + (i % 2) * colW, ly = y + Math.floor(i / 2) * 15;
    ctx.strokeStyle = colors[i]; ctx.lineWidth = it.width; ctx.setLineDash(it.dash || []); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 16, ly); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = th.fg; ctx.fillText(useShort ? it.short : it.label, lx + 21, ly);
  });
  ctx.restore();
}

export default {
  id: 'oscillation-mean', label: 'formula-derived',
  mount(host, params, ui) {
    let kappa = params.kappa ?? 24, T = params.T ?? 0.8, tgt = params.t ?? 0.3, b = params.b ?? 0.7;
    const a = 1, m = 1; // normalized column abscissa and target abscissa (fixed; only ratios matter)
    const N = 1200;
    const xs = new Float64Array(N + 1), amp = new Float64Array(N + 1), wave = new Float64Array(N + 1), sq = new Float64Array(N + 1), mean = new Float64Array(N + 1), left = new Float64Array(N + 1), prim = new Float64Array(N + 1);
    const R = (x) => T * Math.exp(-Math.pow((x - 0.5) / 0.18, 2));
    const c = ui.canvas({ aspect: 16 / 8, minHeight: 320, maxHeight: 480 });
    const ro = ui.readouts([
      { key: 'match', label: 'Mean match', unit: 'max |⟨(a cos κΦ)²⟩ − R|, one-period average' },
      { key: 'left', label: 'Leftover oscillation', unit: 'max |(a²/2) cos 2κΦ|' },
      { key: 'prim', label: 'After one antiderivative', unit: 'max |∫ leftover|  (∝ 1/κ)' },
      { key: 'cone', label: 'Cone condition', unit: '|a t| < b m ?' },
    ]);
    ui.slider({ label: 'Carrier frequency κ', min: 4, max: 80, step: 1, value: kappa, format: (v) => String(v), onChange: (v) => { kappa = v; } });
    ui.slider({ label: 'Target residual height T (R = T·bump)', min: 0.1, max: 1.5, step: 0.05, value: T, onChange: (v) => { T = v; } });
    ui.slider({ label: 'Target stress t  (target = (−m, t), m = 1)', min: -1.5, max: 1.5, step: 0.01, value: tgt, onChange: (v) => { tgt = v; } });
    ui.slider({ label: 'Column slope b  (columns (−a, ∓b), a = 1)', min: 0.15, max: 1.5, step: 0.01, value: b, onChange: (v) => { b = v; } });
    ui.note('<b>Formula-derived, generic mechanism.</b> $(a\\cos\\kappa\\Phi)^2 = \\tfrac{a^2}{2} + \\tfrac{a^2}{2}\\cos 2\\kappa\\Phi$ with $\\Phi = 2\\pi x$ and $a = \\sqrt{2R}$; the antiderivative of the leftover is computed by the trapezoid rule and drawn magnified 25 times. Right: two signed columns $(-a,\\mp b)$ with positive scales $s_\\mp$ reach the target $(-m,t)$ iff $|a t| \\lt b m$ (Covariance.lean). The construction’s actual waves live on a torus cover with many labels and are not shown.');

    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      let maxLeft = 0, maxPrim = 0, acc = 0;
      for (let i = 0; i <= N; i++) {
        const x = i / N; xs[i] = x; const r = R(x); const A = Math.sqrt(2 * r);
        const ph = kappa * 2 * Math.PI * x;
        amp[i] = A; wave[i] = A * Math.cos(ph); sq[i] = wave[i] * wave[i]; mean[i] = A * A / 2; left[i] = (A * A / 2) * Math.cos(2 * ph);
        if (i > 0) acc += 0.5 * (left[i] + left[i - 1]) / N; prim[i] = acc;
        maxLeft = Math.max(maxLeft, Math.abs(left[i])); maxPrim = Math.max(maxPrim, Math.abs(acc));
      }
      // one-period running average of the square, compared with the target
      const per = Math.max(2, Math.round(N / kappa)); let match = 0;
      for (let i = per; i <= N - per; i += 7) { let s = 0; for (let k = -per / 2; k < per / 2; k++) s += sq[i + Math.round(k)]; s /= per; match = Math.max(match, Math.abs(s - R(xs[i]))); }
      const sPlus = (m / a + tgt / b) / 2, sMinus = (m / a - tgt / b) / 2, ok = Math.abs(a * tgt) < b * m;
      ro.update({
        match: { value: match, trend: 'flat', detail: 'the mean of the square equals the target up to the window edges' },
        left: { value: maxLeft, trend: 'flat', detail: 'not small: same size as the target' },
        prim: { value: maxPrim, trend: 'down', detail: `≈ max(a²/2)/(4πκ) = ${fmt.num(T / (4 * Math.PI * kappa))}` },
        cone: { value: ok ? 'bracketed' : 'outside', trend: ok ? 'flat' : 'up', detail: ok ? `s₋ = ${sMinus.toFixed(3)}, s₊ = ${sPlus.toFixed(3)} (squared amplitudes)` : `|a t| = ${Math.abs(a * tgt).toFixed(2)} ≥ b m = ${(b * m).toFixed(2)}: no positive solution` },
      });
      ctx.clearRect(0, 0, w, h);
      const leftW = Math.floor(w * 0.58);
      const pts = (arr, step = 1) => { const out = []; for (let i = 0; i <= N; i += step) out.push([xs[i], arr[i]]); return out; };
      const ymax = Math.max(1.3, 2.2 * T);
      const colors = [hexA(th.accent, 0.55), hexA(th.warn, 0.55), th.ok, th.bad];
      lineChart(ctx, { x: 0, y: 4, w: leftW - 6, h: h - 8 - LEG_H }, {
        title: fitText(ctx, TITLE_WAVE, leftW - 6 - 56, `600 12px ${th.sans}`), xLabel: 'x (Φ = 2πx)', yLabel: 'amplitude', xDomain: [0, 1], yDomain: [-ymax, ymax],
        series: [
          { pts: pts(wave), color: colors[0], width: 1.2 },
          { pts: pts(sq), color: colors[1], width: 1.2 },
          { pts: pts(mean, 6), color: colors[2], width: 3 },
          { pts: pts(prim, 3).map(([x, y]) => [x, 25 * y]), color: colors[3], width: 2, dash: [5, 3] },
        ],
      });
      legendStrip(ctx, th, colors, 12, h - LEG_H + 6, leftW - 18);
      /* ---------- right: the cone / bracketing panel ---------- */
      const cx0 = leftW + 6, cw = w - cx0 - 6, ch = h - 8, cy0 = 4;
      ctx.fillStyle = th.sunken; ctx.fillRect(cx0, cy0, cw, ch);
      const ox = cx0 + cw * 0.78, oy = cy0 + ch * 0.52, S = Math.min(cw, ch) * 0.36; // origin and scale (N axis points left, since columns have N = −a)
      const PX = (nx, ky) => [ox + nx * S, oy - ky * S];
      // the cone of positive combinations: between the rays along (−a, −b) and (−a, b)
      const far = 2.6; const [p1x, p1y] = PX(-a * far, -b * far), [p2x, p2y] = PX(-a * far, b * far);
      ctx.fillStyle = hexA(th.ok, 0.18); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = th.line; ctx.beginPath(); ctx.moveTo(cx0 + 8, oy); ctx.lineTo(cx0 + cw - 8, oy); ctx.moveTo(ox, cy0 + 8); ctx.lineTo(ox, cy0 + ch - 8); ctx.stroke();
      ctx.fillStyle = th.faint; ctx.font = `10.5px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('N', ox + 6, cy0 + ch - 20); ctx.fillText('K', ox + 6, cy0 + 8);
      const col = (nx, ky, color, label) => { const [x, y] = PX(nx, ky); arrow(ctx, ox, oy, x, y, color, 2); labelPill(ctx, label, x - 4, y + (ky > 0 ? -12 : 12), { color, align: 'right', size: 10 }); };
      col(-a, -b, th.accent, 'column (−a, −b)'); col(-a, b, th.accent, 'column (−a, +b)');
      // target and its decomposition
      const [tx, ty] = PX(-m, tgt);
      if (ok) { const [qx, qy] = PX(-a * sMinus, -b * sMinus); ctx.strokeStyle = th.faint; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(qx, qy); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]); }
      arrow(ctx, ox, oy, tx, ty, ok ? th.ok : th.bad, 2.5);
      labelPill(ctx, `target (−m, t) = (−1, ${tgt.toFixed(2)})`, tx - 6, ty + (tgt > 0 ? 14 : -14), { color: ok ? th.ok : th.bad, align: 'right', size: 10 });
      ctx.fillStyle = th.fg; ctx.font = `600 12px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(fitText(ctx, TITLE_CONE, cw - 16, `600 12px ${th.sans}`), cx0 + 8, cy0 + 6);
      const condShort = `|a t| = ${Math.abs(tgt).toFixed(2)} ${ok ? '<' : '≥'} b m = ${b.toFixed(2)}`;
      labelPill(ctx, fitText(ctx, [ok ? `${condShort}: inside the cone` : `${condShort}: outside`, condShort], cw - 16, `600 10.5px ${th.sans}`, 12), cx0 + 8, cy0 + 28, { color: ok ? th.ok : th.bad, size: 10.5 });
      labelPill(ctx, fitText(ctx, ['shaded: {s₋(−a,−b) + s₊(−a,b), s± > 0}', 'shaded: positive combinations'], cw - 16, `600 9.5px ${th.sans}`, 12), cx0 + 8, cy0 + ch - 14, { color: th.muted, size: 9.5 });
    };
    ui.loop(() => draw());
    c.onResize(() => draw());
    return { destroy() {} };
  },
};

function arrow(ctx, x1, y1, x2, y2, color, width) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const an = Math.atan2(y2 - y1, x2 - x1), s = 5 + width;
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(an - 0.5), y2 - s * Math.sin(an - 0.5)); ctx.lineTo(x2 - s * Math.cos(an + 0.5), y2 - s * Math.sin(an + 0.5)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
