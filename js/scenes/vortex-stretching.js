// Formula-derived scene: a Gaussian vortex tube in an imposed axisymmetric strain.
// Velocity u = (−γx/2, −γy/2, γz) + swirl. The axial vorticity ω_z = A(t) exp(−r²/δ(t)²) solves
//   ∂_t ω + u·∇ω = γ ω + ν Δω        exactly, with
//   d(δ²)/dt = 4ν − γ δ²   ⇒  δ² = 4ν/γ + (δ₀² − 4ν/γ) e^{−γ t}     (constant strain)
// and circulation Γ = π A δ² conserved, so the peak vorticity is ω_max = Γ / (π δ²).
// Option "strain grows like κ/(T−t)": with ν = 0, δ² = δ₀² ((T−t)/T)^κ, ω_max ∝ (T−t)^{−κ} (imposed feedback).
import { lineChart, theme, heat, labelPill, fmt } from '../scene-runtime.js';

export default {
  id: 'vortex-stretching', label: 'formula-derived',
  mount(host, params, ui) {
    let gamma = params.gamma ?? 1.0, nu = params.nu ?? 0.02, d0 = params.d0 ?? 1.0, t = 0, playing = true, growing = false, kappa = 1.0;
    const T = 1, Gamma = Math.PI * d0 * d0; // circulation chosen so that the initial peak vorticity is 1
    const c = ui.canvas({ aspect: 16 / 8.5, minHeight: 300, maxHeight: 480 });
    const ro = ui.readouts([
      { key: 'd', label: 'Core radius', unit: '× initial' },
      { key: 'w', label: 'Peak vorticity', unit: '× initial' },
      { key: 'sat', label: 'Saturation (Burgers)', unit: 'peak vorticity limit' },
      { key: 'g', label: 'Strain γ now', unit: '' },
    ]);
    ui.slider({ label: 'Strain rate γ', min: 0.1, max: 6, step: 0.1, value: gamma, onChange: (v) => { gamma = v; } });
    ui.slider({ label: 'Viscosity ν', min: 0, max: 0.2, step: 0.005, value: nu, onChange: (v) => { nu = v; } });
    ui.toggle({ label: 'Strain grows like κ/(T−t) (imposed feedback)', value: false, hint: 'Models a vortex that strengthens its own strain. With ν = 0 the peak vorticity then blows up like (T−t)^−κ.', onChange: (v) => { growing = v; t = 0; } });
    ui.slider({ label: 'Feedback exponent κ', min: 0.25, max: 2, step: 0.05, value: kappa, onChange: (v) => { kappa = v; } });
    ui.toggle({ label: 'Play', value: true, onChange: (v) => { playing = v; } });
    ui.button({ label: 'Restart', onClick: () => { t = 0; } });
    ui.note('<b>Formula-derived.</b> Exact solution of the vorticity equation $\\partial_t\\omega+u\\cdot\\nabla\\omega=\\gamma\\,\\omega+\\nu\\Delta\\omega$ for a Gaussian vortex in the imposed strain $u=(-\\tfrac{\\gamma}{2}x,-\\tfrac{\\gamma}{2}y,\\gamma z)$: $\\tfrac{d}{dt}\\delta^2=4\\nu-\\gamma\\delta^2$ and $\\omega_{\\max}=\\Gamma/(\\pi\\delta^2)$. The strain is prescribed, not produced by the vortex: this is a model of the stretching mechanism, not a solution of the full equations.');

    const state = (tt) => {
      if (!growing) {
        const dinf = gamma > 0 ? 4 * nu / gamma : Infinity;
        const d2 = isFinite(dinf) ? dinf + (d0 * d0 - dinf) * Math.exp(-gamma * tt) : d0 * d0;
        return { d2, g: gamma, sat: gamma > 0 && nu > 0 ? Gamma / (Math.PI * dinf) : Infinity };
      }
      // γ(t) = κ/(T−t), ν ignored in closed form when ν=0; for ν>0 integrate numerically (small steps)
      const s = Math.max(1e-6, T - tt);
      if (nu === 0) return { d2: d0 * d0 * Math.pow(s / T, kappa), g: kappa / s, sat: Infinity };
      let d2 = d0 * d0, tau = 0; const n = 400, h = tt / n;
      for (let i = 0; i < n; i++) { const gg = kappa / Math.max(1e-6, T - tau); d2 += h * (4 * nu - gg * d2); tau += h; d2 = Math.max(d2, 1e-12); }
      return { d2, g: kappa / s, sat: Infinity };
    };
    const curve = (f) => { const out = []; const tmax = growing ? T * 0.999 : 6 / Math.max(gamma, 0.1); for (let i = 0; i <= 120; i++) { const tt = (i / 120) * tmax; out.push([growing ? T - tt : tt, f(state(tt))]); } return out; };
    // particles for the tube cross-section
    const parts = Array.from({ length: 140 }, () => ({ r: Math.pow(Math.random(), 0.6) * 2.4 + 0.05, a: Math.random() * Math.PI * 2 }));

    const draw = (dt) => {
      const { ctx, w, h } = c; const th = theme();
      const st = state(t); const d = Math.sqrt(st.d2); const wmax = Gamma / (Math.PI * st.d2);
      ro.update({
        d: { value: d / d0, trend: 'down' },
        w: { value: wmax, trend: 'up', detail: growing ? `∝ (T−t)^−${kappa.toFixed(2)} when ν = 0` : (nu > 0 ? 'approaches the Burgers limit' : `= e^{γt}: exponential, no finite-time blowup`) },
        sat: { value: isFinite(st.sat) ? st.sat : Infinity, trend: isFinite(st.sat) ? 'flat' : 'up', detail: isFinite(st.sat) ? `δ∞ = √(4ν/γ) = ${Math.sqrt(4 * nu / gamma).toFixed(3)}` : 'none without viscosity or with growing strain' },
        g: { value: st.g, trend: growing ? 'up' : 'flat' },
      });
      ctx.clearRect(0, 0, w, h);
      // left: cross-section of the tube (top view) + side sketch of strain arrows
      const leftW = Math.min(w * 0.44, h * 1.05); const cx = leftW * 0.5, cy = h * 0.52, R0 = Math.min(leftW, h) * 0.26;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, leftW, h); ctx.clip(); ctx.fillStyle = th.sunken; ctx.fillRect(0, 0, leftW, h);
      const rpx = Math.max(2, R0 * d / d0);
      for (let k = 36; k >= 1; k--) { const rho = (k / 36) * 3; const inten = Math.exp(-rho * rho) * Math.min(1, 0.3 + Math.log10(Math.max(1, wmax)) / 3); ctx.fillStyle = heat(inten); ctx.beginPath(); ctx.arc(cx, cy, rho * rpx, 0, Math.PI * 2); ctx.fill(); }
      // inflow arrows (strain pulls fluid in radially)
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const r1 = R0 * 2.9, r2 = Math.max(rpx * 3.2, R0 * 1.4); const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1, x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const ah = 5; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 + Math.cos(a + 2.6) * ah, y2 + Math.sin(a + 2.6) * ah); ctx.moveTo(x2, y2); ctx.lineTo(x2 + Math.cos(a - 2.6) * ah, y2 + Math.sin(a - 2.6) * ah); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (const q of parts) { const vth = (1 - Math.exp(-q.r * q.r)) / Math.max(q.r, 0.05); const om = Math.min(6, vth * Math.min(wmax, 40) * 0.12); q.a += om * dt * 3; ctx.beginPath(); ctx.arc(cx + Math.cos(q.a) * q.r * rpx, cy + Math.sin(q.a) * q.r * rpx, 1.4, 0, Math.PI * 2); ctx.fill(); }
      labelPill(ctx, `t = ${t.toFixed(2)}${growing ? `   T − t = ${(T - t).toExponential(1)}` : ''}`, 8, 16, { color: th.fg });
      labelPill(ctx, 'cross-section · arrows: inflow of the strain · tube axis points at you', 8, h - 14, { color: th.muted, size: 10.5 });
      ctx.restore();
      // right: chart
      lineChart(ctx, { x: leftW + 6, y: 6, w: w - leftW - 10, h: h - 12 }, {
        title: growing ? 'Peak vorticity and core radius versus T − t' : 'Peak vorticity and core radius versus time',
        xLabel: growing ? 'T − t (log)' : 't', yLabel: 'relative size (log)', xLog: growing, yLog: true, legend: 'top-right',
        xDomain: growing ? [1e-3, 1] : undefined,
        series: [
          { pts: curve((s) => Gamma / (Math.PI * s.d2)), color: th.bad, label: 'peak vorticity ω_max', width: 3 },
          { pts: curve((s) => Math.sqrt(s.d2) / d0), color: th.accent, label: 'core radius δ / δ₀' },
          ...(isFinite(st.sat) && !growing ? [{ pts: curve(() => st.sat), color: th.faint, dash: [4, 4], label: 'Burgers limit Γγ/(4πν)' }] : []),
        ],
        marker: growing ? Math.max(1e-3, T - t) : t,
      });
    };
    ui.loop((dt) => {
      if (playing) {
        if (growing) { t = Math.min(T * 0.999, t + dt * 0.12 * Math.max(0.05, T - t) * 4); if (t >= T * 0.998) t = 0; }
        else { t += dt * 0.6; if (t > 6 / Math.max(gamma, 0.1)) t = 0; }
      }
      draw(dt);
    });
    c.onResize(() => draw(0));
    return { destroy() {} };
  },
};
