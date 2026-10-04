// Formula-derived toy model: a planar swirl v_θ(r,t) = U(t) F(r / w(t)) with F(ρ) = ρ e^{(1−ρ²)/2}.
// Plugging it into Navier–Stokes, the radial momentum balance is absorbed by the pressure exactly,
// and the azimuthal balance says what force is required:
//   f_θ = ∂_t v_θ − ν (∂_rr v_θ + ∂_r v_θ / r − v_θ / r²).
// With U = s^−α, w = s^β, s = T − t, and ρ = r/w this is closed-form:
//   f_θ = α s^−α−1 F(ρ) + β s^−α−1 ρ F'(ρ) − ν s^−α−2β e^{(1−ρ²)/2} (ρ³ − 4ρ).
import { lineChart, theme, fmt } from '../scene-runtime.js';

const F = (r) => r * Math.exp((1 - r * r) / 2);
const Fp = (r) => (1 - r * r) * Math.exp((1 - r * r) / 2);
const Lap = (r) => Math.exp((1 - r * r) / 2) * (r * r * r - 4 * r); // F'' + F'/ρ − F/ρ²

export default {
  id: 'swirl-residual', label: 'formula-derived',
  mount(host, params, ui) {
    let a = params.a ?? 0.5, b = params.b ?? 0.5, nu = params.nu ?? 0.05, logS = 0, similarity = false;
    const c = ui.canvas({ aspect: 16 / 8, minHeight: 300, maxHeight: 460 });
    const ro = ui.readouts([
      { key: 'U', label: 'Peak speed', unit: '× initial' },
      { key: 'Fmax', label: 'Peak required force', unit: '× initial' },
      { key: 'ratio', label: 'Force / speed', unit: '' },
      { key: 'E', label: 'Energy per unit length', unit: '× initial' },
    ]);
    ui.slider({ label: 'Time to blowup, T − t', min: 0, max: 3, step: 0.01, value: 0, format: (v) => `10^−${v.toFixed(2)}`, onChange: (v) => { logS = v; } });
    ui.slider({ label: 'Speed exponent α', min: 0.1, max: 1.5, step: 0.05, value: a, onChange: (v) => { a = v; } });
    ui.slider({ label: 'Width exponent β', min: 0.1, max: 1.5, step: 0.05, value: b, onChange: (v) => { b = v; } });
    ui.slider({ label: 'Viscosity ν', min: 0, max: 0.3, step: 0.005, value: nu, onChange: (v) => { nu = v; } });
    ui.toggle({ label: 'Use similarity coordinate ρ = r / w(t)', value: false, hint: 'In the rescaled coordinate the velocity profile stops moving; the required force does not stop growing.', onChange: (v) => { similarity = v; } });
    ui.note('<b>Formula-derived toy model.</b> A planar swirl $v_\\theta = U(t)\\,F(r/w(t))$ with $F(\\rho)=\\rho\\,e^{(1-\\rho^2)/2}$ is divergence-free and the pressure balances the centripetal term exactly, so the force the equation demands is $f_\\theta=\\partial_t v_\\theta-\\nu\\,(\\partial_{rr}v_\\theta+\\partial_r v_\\theta/r-v_\\theta/r^2)$. In this toy there is no mechanism for the flow to amplify itself: the force must supply all of the growth.');

    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      const s = Math.pow(10, -logS); const U = Math.pow(s, -a), wd = Math.pow(s, b);
      const N = 240, vel = [], force = [], inertia = [], visc = [];
      let Fmax = 0;
      const rmax = similarity ? 3.2 : 3.2; // in units of w (similarity) or of initial width (physical)
      for (let i = 1; i <= N; i++) {
        const xr = (i / N) * rmax; // plotted coordinate
        const rho = similarity ? xr : xr / wd; // similarity variable
        const v = U * F(rho);
        const fi = (a * F(rho) + b * rho * Fp(rho)) * Math.pow(s, -a - 1);
        const fv = -nu * Math.pow(s, -a - 2 * b) * Lap(rho);
        const f = fi + fv;
        Fmax = Math.max(Fmax, Math.abs(f));
        vel.push([xr, v]); force.push([xr, f]); inertia.push([xr, fi]); visc.push([xr, fv]);
      }
      const F0 = (a * F(1) + b * 1 * Fp(1)) + nu * 0 ; // initial peak force reference ≈ at ρ=1: αF(1) (β term vanishes there)
      const F0ref = Math.max(1e-9, Math.abs(a * F(1)) + nu * 3 * Math.exp(0) * 0 + 1e-9);
      const E = U * U * wd * wd; // ∝ ∫ v² r dr per unit length
      ro.update({
        U: { value: U, trend: 'up' },
        Fmax: { value: Fmax / F0ref, trend: 'up', detail: `≈ ∝ (T−t)^−${fmt.num(a + 1, 2)} (inertial) ${nu > 0 ? `or ^−${fmt.num(a + 2 * b, 2)} (viscous)` : ''}` },
        ratio: { value: Fmax / F0ref / U, trend: 'up', detail: 'the force outruns the speed' },
        E: { value: E, trend: b > a ? 'down' : b === a ? 'flat' : 'up', detail: `∝ (T−t)^${fmt.num(2 * b - 2 * a, 2)}` },
      });
      ctx.clearRect(0, 0, w, h);
      const half = w / 2;
      const xLabel = similarity ? 'ρ = r / w(t)' : 'r  (units of the initial core width)';
      lineChart(ctx, { x: 0, y: 4, w: half - 4, h: h - 8 }, {
        title: 'The proposed swirl  v_θ(r, t)', xLabel, yLabel: 'speed', yDomain: [0, Math.max(1.2, U * 1.08)], xDomain: [0, rmax],
        series: [{ pts: vel, color: th.accent, label: `v_θ  (peak ${fmt.num(U)})` }], legend: 'top-right',
      });
      const fscale = Math.max(1, Fmax * 1.08);
      lineChart(ctx, { x: half + 4, y: 4, w: half - 4, h: h - 8 }, {
        title: 'What force the equation demands  f_θ(r, t)', xLabel, yLabel: 'force', yDomain: [-fscale, fscale], xDomain: [0, rmax],
        series: [
          { pts: force, color: th.bad, label: `required force (peak ${fmt.num(Fmax)})` },
          { pts: inertia, color: th.warn, dash: [5, 3], label: 'from ∂ₜv (inertia)' },
          { pts: visc, color: th.numeric, dash: [2, 3], label: 'from −νΔv (viscosity)' },
        ], legend: 'bottom-right',
      });
    };
    ui.loop(() => draw());
    c.onResize(() => draw());
    return { destroy() {} };
  },
};
