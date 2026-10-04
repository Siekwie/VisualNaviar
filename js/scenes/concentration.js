// Formula-derived scene: a core of width w(t) and length L(t) carrying speed U(t) as t → T.
// Everything on screen follows from the displayed power laws:
//   U = (T−t)^−α,  w = (T−t)^β_w,  L = (T−t)^β_L,  E_core = U² w² L,  |∇u| ≈ U/w,  enstrophy ≈ (U/w)² w² L.
import { lineChart, theme, heat, labelPill, fmt } from '../scene-runtime.js';

const PRESETS = {
  leray: { label: 'Natural Navier–Stokes scaling (α = ½, isotropic)', a: 0.5, bw: 0.5, bl: 0.5 },
  slender: { label: 'Slender core: width shrinks faster than length (illustrative)', a: 0.5, bw: 0.65, bl: 0.35 },
  naive: { label: 'Speed grows, size barely shrinks (energy blows up)', a: 0.5, bw: 0.2, bl: 0.2 },
  custom: { label: 'Custom', a: 0.5, bw: 0.5, bl: 0.5 },
};

export default {
  id: 'concentration', label: 'formula-derived',
  mount(host, params, ui) {
    const p = Object.assign({ a: 0.5, bw: 0.5, bl: 0.5, preset: 'leray' }, params);
    let a = p.a, bw = p.bw, bl = p.bl;
    let logS = 0; // s = T − t = 10^−logS
    let playing = false;
    const parts = Array.from({ length: 170 }, () => ({ r: Math.pow(Math.random(), 0.75) * 2.2 + 0.06, ang: Math.random() * Math.PI * 2, k: 0.7 + Math.random() * 0.6 }));

    const c = ui.canvas({ aspect: 16 / 8.5, minHeight: 300, maxHeight: 480 });
    const ro = ui.readouts([
      { key: 'U', label: 'Peak speed', unit: '× initial' },
      { key: 'E', label: 'Core energy', unit: '× initial' },
      { key: 'G', label: 'Velocity gradient', unit: '× initial' },
      { key: 'Z', label: 'Core enstrophy', unit: '× initial' },
    ]);
    const sl = {};
    const sync = () => { sl.a.set(a, false); sl.bw.set(bw, false); sl.bl.set(bl, false); };
    const presetSel = ui.select({
      label: 'Scaling preset', value: p.preset,
      options: Object.entries(PRESETS).map(([value, v]) => ({ value, label: v.label })),
      onChange: (v) => { if (v !== 'custom') { a = PRESETS[v].a; bw = PRESETS[v].bw; bl = PRESETS[v].bl; sync(); } },
    });
    sl.t = ui.slider({ label: 'Time to blowup, T − t', min: 0, max: 4, step: 0.01, value: 0, format: (v) => `10^−${v.toFixed(2)}`, onChange: (v) => { logS = v; } });
    sl.a = ui.slider({ label: 'Speed exponent α  (U ∝ (T−t)^−α)', min: 0.1, max: 1.5, step: 0.05, value: a, onChange: (v) => { a = v; presetSel.select.value = 'custom'; } });
    sl.bw = ui.slider({ label: 'Width exponent β_w  (w ∝ (T−t)^β_w)', min: 0.05, max: 1.5, step: 0.05, value: bw, onChange: (v) => { bw = v; presetSel.select.value = 'custom'; } });
    sl.bl = ui.slider({ label: 'Length exponent β_L  (L ∝ (T−t)^β_L)', min: 0, max: 1.5, step: 0.05, value: bl, onChange: (v) => { bl = v; presetSel.select.value = 'custom'; } });
    ui.toggle({ label: 'Play: approach the blowup time', value: false, onChange: (v) => { playing = v; if (v && logS >= 3.99) logS = 0; } });
    ui.note('<b>Formula-derived.</b> Core energy = U²·w²·L, velocity gradient ≈ U / w, enstrophy ≈ (U/w)²·w²·L, all up to constants. The “natural scaling” preset is the scaling symmetry of Navier–Stokes (Leray); the “slender core” exponents are illustrative, not the paper’s.');

    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      const s = Math.pow(10, -logS);
      const U = Math.pow(s, -a), wd = Math.pow(s, bw), L = Math.pow(s, bl);
      const E = U * U * wd * wd * L, G = U / wd, Z = G * G * wd * wd * L;
      const pE = 2 * bw + bl - 2 * a, pZ = bl - 2 * a;
      ro.update({
        U: { value: U, trend: 'up' },
        E: { value: E, trend: pE > 0 ? 'down' : pE === 0 ? 'flat' : 'up', detail: `∝ (T−t)^${fmt.num(pE, 2)} — ${pE >= 0 ? 'stays bounded' : 'blows up'}` },
        G: { value: G, trend: 'up', detail: `∝ (T−t)^−${fmt.num(a + bw, 2)}` },
        Z: { value: Z, trend: pZ > 0 ? 'down' : pZ === 0 ? 'flat' : 'up', detail: `∝ (T−t)^${fmt.num(pZ, 2)} — ${pZ >= 0 ? 'bounded' : 'blows up'}` },
      });
      ctx.clearRect(0, 0, w, h);
      // ---- left: top view (clipped to its panel) with an inset side view
      const leftW = Math.min(w * 0.46, h * 1.1);
      const cx = leftW * 0.5, cy = h * 0.5, R0 = Math.min(leftW, h) * 0.27;
      const rw = Math.max(2.5, R0 * wd);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, leftW, h); ctx.clip();
      ctx.fillStyle = th.sunken; ctx.fillRect(0, 0, leftW, h);
      for (let k = 44; k >= 1; k--) {
        const rho = (k / 44) * 2.6; const v = rho * Math.exp((1 - rho * rho) / 2);
        const inten = v * Math.min(1, 0.22 + Math.log10(Math.max(1, U)) / 3.2);
        ctx.fillStyle = heat(inten); ctx.beginPath(); ctx.arc(cx, cy, rho * rw, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (const q of parts) {
        const v = q.r * Math.exp((1 - q.r * q.r) / 2);
        const om = Math.min(7, (v / Math.max(q.r, 0.05)) * Math.min(U, 50) * 0.18) * q.k;
        q.ang += om / 60;
        ctx.beginPath(); ctx.arc(cx + Math.cos(q.ang) * q.r * rw, cy + Math.sin(q.ang) * q.r * rw, q.r < 1.7 ? 1.5 : 1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 1.7 * rw, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      labelPill(ctx, 'top view · dashed ring = shear annulus', 8, h - 14, { color: th.muted, size: 10.5 });
      labelPill(ctx, `T − t = ${s.toExponential(1)}`, 8, 16, { color: th.fg });
      labelPill(ctx, `w = ${wd.toFixed(3)}   L = ${L.toFixed(3)}   U = ${fmt.num(U)}`, 8, 36, { color: th.muted, size: 11 });
      // inset: side view of the core, width ∝ w, length ∝ L
      const iw = 64, ih = 112, ix = leftW - iw - 8, iy = 8;
      ctx.fillStyle = th.bg; ctx.globalAlpha = 0.92; ctx.fillRect(ix, iy, iw, ih); ctx.globalAlpha = 1;
      ctx.strokeStyle = th.line; ctx.strokeRect(ix + 0.5, iy + 0.5, iw - 1, ih - 1);
      const Lpx = Math.max(3, 84 * L), wpx = Math.max(2, 40 * wd);
      ctx.fillStyle = heat(Math.min(1, 0.45 + Math.log10(Math.max(1, U)) / 3.2));
      ctx.beginPath(); ctx.ellipse(ix + iw / 2, iy + 10 + 42, wpx / 2, Lpx / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = th.faint; ctx.font = `10px ${th.sans}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('side view', ix + iw / 2, iy + ih - 6);
      ctx.restore();
      // ---- right: chart (log-log) of the ledger vs T − t
      const pts = (f) => { const out = []; for (let i = 0; i <= 80; i++) { const ss = Math.pow(10, -(i / 80) * 4); out.push([ss, f(ss)]); } return out; };
      lineChart(ctx, { x: leftW + 6, y: 6, w: w - leftW - 10, h: h - 12 }, {
        xLog: true, yLog: true, xLabel: 'T − t  (log, → blowup)', yLabel: 'relative size (log)', title: 'The ledger as t → T',
        xDomain: [1e-4, 1], yDomain: [1e-3, 1e4],
        series: [
          { pts: pts((ss) => Math.pow(ss, -a)), color: th.bad, label: 'peak speed U' },
          { pts: pts((ss) => Math.pow(ss, -a - bw)), color: th.warn, label: 'gradient U/w', dash: [5, 3] },
          { pts: pts((ss) => Math.pow(ss, pE)), color: th.ok, label: 'core energy U²w²L' },
          { pts: pts((ss) => Math.pow(ss, pZ)), color: th.numeric, label: 'enstrophy U²L', dash: [2, 3] },
        ],
        marker: s, legend: 'bottom-right',
      });
    };
    ui.loop((dt) => {
      if (playing) { logS = Math.min(4, logS + dt * 0.55); sl.t.set(logS, false); if (logS >= 4) { playing = false; } }
      draw();
    });
    c.onResize(() => draw());
    return { destroy() {} };
  },
};
