// Numerically computed: the scalar amplification ODE that the Lean docstrings call "equation (30)".
//   Euler/EulerProof.lean:13043 (scalar_equation) and :13366 (equation30_endpoint_exponential):
//     d/dt [ (1 + (β t²)²) V'(t) ] = 2 (1 − β·(β t²)) V(t),   V(0) = 1,  V'(0) ≥ 0,  0 < β ≤ 1/16
//   Theorem: V(1/√β) ≥ exp(1/(4√β)).  After the endpoint, V(x/√β) ≥ V(1/√β)/x for x ≥ 1
//   (equation30_post_inversion_lower, Euler/EulerProof.lean:14136).
//   Integrated here with RK4 as the first-order system V' = W/(1+(βt²)²), W' = 2(1 − β² t²) V.
// The left panel is a schematic of the ParentFrame geometry (Euler/PacketSourceGeometryData.lean:25-47):
//   strain M ≈ B + σ·(v̂ ⊗ m̂) with ⟨m, v⟩ = 0, ‖B‖ ≤ G, and the stage invariant ⟨B m̂, m̂⟩ + priorError < 0.
//   The toy takes B m̂ = −b m̂, B v̂ = +b v̂ (trace-free), so the linear flow x ↦ M x deforms the plane by
//   F(t) = [[e^{bt}, σ sinh(bt)/b], [0, e^{−bt}]] in (v, m) coordinates: layers ⟂ m̂ slide along v̂ and
//   their spacing shrinks like e^{−bt}. The toy's b, σ are display choices, not the proof's constants.
import { lineChart, theme, labelPill, fmt } from '../scene-runtime.js';

const N = 1600;
function solve(beta, v1, xmax) {
  const T = 1 / Math.sqrt(beta), Tend = xmax * T, hstep = Tend / N;
  const t = new Float64Array(N + 1), V = new Float64Array(N + 1);
  let v = 1, wv = v1; // W = (1+(βt²)²) V' ; at t = 0 the factor is 1
  const f = (tt, vv, ww, out) => { const s = beta * tt * tt; out[0] = ww / (1 + s * s); out[1] = 2 * (1 - beta * s) * vv; };
  const k1 = [0, 0], k2 = [0, 0], k3 = [0, 0], k4 = [0, 0];
  t[0] = 0; V[0] = 1;
  for (let i = 0; i < N; i++) {
    const tt = i * hstep;
    f(tt, v, wv, k1);
    f(tt + hstep / 2, v + hstep / 2 * k1[0], wv + hstep / 2 * k1[1], k2);
    f(tt + hstep / 2, v + hstep / 2 * k2[0], wv + hstep / 2 * k2[1], k3);
    f(tt + hstep, v + hstep * k3[0], wv + hstep * k3[1], k4);
    v += hstep / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    wv += hstep / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    t[i + 1] = tt + hstep; V[i + 1] = v;
  }
  const iT = Math.round(N / xmax);
  const pts = []; for (let i = 0; i <= N; i += 4) pts.push([t[i], V[i]]);
  const post = []; if (xmax > 1) for (let i = iT; i <= N; i += 8) post.push([t[i], V[iT] / (t[i] / T)]);
  return { T, VT: V[iT], pts, post, bound: Math.exp(1 / (4 * Math.sqrt(beta))) };
}

export default {
  id: 'strain-amplification', label: 'numerically-computed',
  mount(host, params, ui) {
    let beta = params.beta ?? 0.02, v1 = params.v1 ?? 0, extend = false, playing = true;
    const b = 0.35, sigma = 0.8;           // toy strain: compression rate and shear strength (display only)
    const tauMax = Math.log(2.2) / b;      // the toy runs until the layer spacing has shrunk by 2.2
    let sol = solve(beta, v1, 1), tAnim = 0;
    const resolve = () => { sol = solve(beta, v1, extend ? 3 : 1); };
    const c = ui.canvas({ aspect: 16 / 8.6, minHeight: 330, maxHeight: 500 });
    const ro = ui.readouts([
      { key: 'T', label: 'Endpoint time T' },
      { key: 'VT', label: 'V(T), integrated' },
      { key: 'B', label: 'Lean lower bound' },
      { key: 'R', label: 'V(T) ÷ bound' },
      { key: 'K', label: 'Toy wavenumber gain' },
    ]);
    ui.slider({ label: 'β in equation (30)  (Lean: 0 < β ≤ 1/16)', min: 0.004, max: 0.0625, step: 0.0005, value: beta, format: (v) => v.toFixed(4), hint: 'In the stage, β ≈ 1/xₙ² (tilt invariant ½ ≤ σ²xₙ² ≤ 2), so the gain e^(1/(4√β)) ≈ e^(xₙ/4) is enormous.', onChange: (v) => { beta = v; resolve(); } });
    ui.slider({ label: 'Initial slope V′(0)  (Lean: ≥ 0)', min: 0, max: 2, step: 0.05, value: v1, onChange: (v) => { v1 = v; resolve(); } });
    ui.toggle({ label: 'Continue past T = 1/√β (post-inversion bound V(T)/x)', value: false, onChange: (v) => { extend = v; resolve(); } });
    ui.toggle({ label: 'Animate the strain acting on the layer', value: true, onChange: (v) => { playing = v; } });
    ui.note('<b>Numerically computed.</b> The right panel integrates the Lean’s scalar equation (30) exactly as stated (RK4, 1600 steps) and compares it with the proved lower bound <code>exp (1 / (4 * √β)) ≤ V (1 / √β)</code>. The left panel is a schematic of the frame geometry: a layer with normal along the ray m inside the strain <code>B + shear·rankOne (unit v) (unit m)</code>; its compression rate b and shear σ are display choices and are not computed from the proof.');

    const draw = (tau) => {
      const { ctx, w, h } = c; const th = theme();
      const e1 = Math.exp(b * tau), e2 = Math.exp(-b * tau), sh = sigma * Math.sinh(b * tau) / b;
      ro.update({
        T: { value: fmt.num(sol.T), detail: `T = 1/√β, β = ${beta.toFixed(4)}` },
        VT: { value: fmt.num(sol.VT), trend: 'up', detail: 'V(0) = 1, RK4' },
        B: { value: fmt.num(sol.bound), detail: 'e^(1/(4√β)), equation30_endpoint_exponential' },
        R: { value: fmt.num(sol.VT / sol.bound), trend: sol.VT >= sol.bound ? 'up' : 'down', detail: sol.VT >= sol.bound ? 'bound respected' : 'bound violated (numerical error?)' },
        K: { value: fmt.num(e1), trend: 'up', detail: `e^(bt): layer spacing ÷ ${e1.toFixed(2)}, toy t = ${tau.toFixed(2)}` },
      });
      ctx.clearRect(0, 0, w, h);
      /* ---- left: schematic geometry ---- */
      const leftW = Math.round(w * 0.5);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, leftW, h); ctx.clip();
      ctx.fillStyle = th.sunken; ctx.fillRect(0, 0, leftW, h);
      const cx = leftW * 0.5, cy = h * 0.54, R = Math.min(leftW, h) * 0.22;
      const P = (xv, xm) => [cx + R * xv, cy - R * xm];
      // background strain field u = M x = (σ x_m + b x_v) v̂ − b x_m m̂
      ctx.strokeStyle = th.faint; ctx.fillStyle = th.faint; ctx.globalAlpha = 0.55; ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        const xv = i * 0.55, xm = j * 0.55; const uv = sigma * xm + b * xv, um = -b * xm;
        const len = Math.hypot(uv, um); if (len < 1e-6) continue;
        const sc = Math.min(0.32, len * 0.22) / len; const [ax, ay] = P(xv, xm), [bx, by] = P(xv + uv * sc, xm + um * sc);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        const ang = Math.atan2(by - ay, bx - ax);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 4 * Math.cos(ang - 0.5), by - 4 * Math.sin(ang - 0.5)); ctx.lineTo(bx - 4 * Math.cos(ang + 0.5), by - 4 * Math.sin(ang + 0.5)); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // deformed envelope F(disc)
      const r0 = 0.5;
      ctx.beginPath();
      for (let k = 0; k <= 72; k++) {
        const a = (k / 72) * Math.PI * 2; const xv = r0 * Math.cos(a), xm = r0 * Math.sin(a);
        const [px, py] = P(e1 * xv + sh * xm, e2 * xm);
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = th.euler; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = th.euler; ctx.lineWidth = 1.5; ctx.stroke();
      // layers ⟂ m̂ inside the envelope: spacing shrinks like e^{−bt}
      ctx.save(); ctx.clip();
      const d0 = 0.11;
      for (let j = -7; j <= 7; j++) {
        const xm = e2 * j * d0; const [, py] = P(0, xm);
        ctx.strokeStyle = j % 2 === 0 ? th.euler : th.fg; ctx.globalAlpha = j % 2 === 0 ? 0.9 : 0.35; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(leftW, py); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
      // frame vectors: ray m (grows like e^{bt} in the toy) and v ⟂ m
      const arrow = (x0, y0, x1, y1, col, lbl, align) => {
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        const ang = Math.atan2(y1 - y0, x1 - x0);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(ang - 0.45), y1 - 8 * Math.sin(ang - 0.45)); ctx.lineTo(x1 - 8 * Math.cos(ang + 0.45), y1 - 8 * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
        labelPill(ctx, lbl, x1 + (align === 'right' ? -6 : 6), y1 - 10, { color: col, align, size: 10.5 });
      };
      const [ox, oy] = P(0, 0);
      const mlen = Math.min(1.1, 0.55 * e1);
      arrow(ox, oy, ...P(0, mlen), th.bad, `ray m  (×${e1.toFixed(2)})`, 'right');
      arrow(ox, oy, ...P(0.8, 0), th.accent, 'v ⟂ m', 'left');
      ctx.fillStyle = th.fg; ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
      labelPill(ctx, 'strain at the origin:  M ≈ B + σ·(v̂ ⊗ m̂)', 8, 14, { color: th.fg, size: 10.5 });
      labelPill(ctx, 'compression invariant:  ⟨B m̂, m̂⟩ = −b < 0', 8, 32, { color: th.fg, size: 10.5 });
      labelPill(ctx, 'layers ⟂ m̂ slide along v̂ and close up', 8, 50, { color: th.muted, size: 10 });
      labelPill(ctx, `next normal := m̂ (joinedNormal) · spacing ×${e2.toFixed(2)}`, 8, h - 14, { color: th.muted, size: 10 });
      ctx.restore();
      /* ---- right: equation (30) ---- */
      const series = [{ pts: sol.pts, color: th.numeric, label: 'V(t)' },
        { pts: [[0, sol.bound], [sol.T, sol.bound]], color: th.euler, dash: [5, 3], label: 'bound e^(1/(4√β)) at T' }];
      if (extend) series.push({ pts: sol.post, color: th.warn, dash: [2, 3], label: 'V(T)·T/t after T' });
      lineChart(ctx, { x: leftW + 6, y: 4, w: w - leftW - 10, h: h - 8 }, {
        title: 'eq. (30): [(1+(βt²)²)V′]′ = 2(1−β²t²)V', xLabel: 't  (rescaled time of equation (30))', yLabel: 'V (log)',
        yLog: true, xDomain: [0, (extend ? 3 : 1) * sol.T], yDomain: [Math.max(0.3, Math.min(1, sol.VT) * 0.8), Math.max(sol.VT, sol.bound) * 3],
        series, marker: sol.T, legend: 'top-left',
      });
    };
    ui.loop((dt, t) => {
      if (playing) tAnim += dt;
      const cyc = tauMax + 1.2, ph = tAnim % cyc;
      const tau = ph < tauMax ? ph : (ph < tauMax + 0.9 ? tauMax : 0);
      draw(tau);
    });
    return { destroy() {} };
  },
};
