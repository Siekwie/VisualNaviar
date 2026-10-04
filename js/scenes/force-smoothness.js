// Space-time diagram of where the constructed fields live and how the force is defined.
// Formula-derived parts (all constants from the pinned Lean sources):
//   timeSwitch t = 1 − cutoff((4/3) t): zero for |t| ≤ 3/8, one for t ≥ 3/4        (SmoothCutoffs.timeSwitch, TimeLocalization)
//   timeCutoff t = cutoff((8/5)(t − 11/16)): one on [3/8, 1], support ⊆ [1/16, 21/16]   (R3/PositiveTimeForce)
//   cutoff ≡ 1 for |x| ≤ 1/2, ≡ 0 for |x| ≥ 1 (SmoothCutoffs.cutoff; the ramp is drawn with Mathlib's smoothTransition)
//   supportCylinder K: r² ≤ 1/16, |z| ≤ 1/4; outer support 2K for the force              (SpatialLocalization, R3CompactCandidate)
//   force = residual of the activated fields on [0,1); Taylor–Borel extension across t = 1; zero for t ≥ 2 (periodic case)
//                                                                                        (CandidateFromLimits.force, force_zero_from)
// Schematic parts: the shaded collapsing core inside the velocity box. The residual itself is not computed.
import { theme, labelPill } from '../scene-runtime.js';
import { cutoff } from './error-ledger.js';
import { hexA } from './similarity-zoom.js';

const timeSwitch = (t) => 1 - cutoff((4 / 3) * t);
const timeCutoff = (t) => cutoff((8 / 5) * (t - 11 / 16));

const REGIONS = {
  rest: { title: 'Rest: u = p = 0 for |t| ≤ 3/8', html: 'The time switch <code>timeSwitch t = 1 − scaledCutoff (4/3) t</code> vanishes for |t| ≤ 3/8, so the activated velocity and pressure are identically zero there and the flow starts from rest (<code>theorem_1_1_with_initial_rest</code>). The residual, hence the force, is zero on this interval too.' },
  ramp: { title: 'Switch-on ramp, 3/8 < t < 3/4', html: 'The switch rises from 0 to 1. The activated residual here is <code>χ R + χ′ u + (χ² − χ)(u·∇)u</code> (<code>TimeLocalization.activated_residual_formula</code>); the extra terms are smooth because the raw fields are smooth away from t = 1. Whatever is left is simply part of the force.' },
  vel: { title: 'Velocity and pressure support: [0, 1) × K', html: 'K is the support cylinder r² ≤ 1/16, |z| ≤ 1/4 (<code>SpatialLocalization.supportCylinder</code>). The fields are the time-switched, spatially cut potentials; nothing is claimed about u at or after t = 1.' },
  core: { title: 'The collapse (schematic)', html: 'Inside the plateau the fields agree with the raw construction (<code>localized_eq_raw</code>), and on the axis |u(t,0)| = j(1−t)^{−(1/2+h)} → ∞. The drawn hourglass only indicates that the active region contracts toward (t, x) = (1, 0); its shape is not computed.' },
  force: { title: 'Force support ⊆ [1/16, 21/16] × 2K', html: 'In the whole-space case the force is <code>PositiveTimeForce.force (R3CompactCandidate.compactForce f)</code>: the extended residual, multiplied by the outer spatial cutoff (one on K, supported in 2K) and by <code>timeCutoff</code>, which is one on [3/8, 1] and supported in [1/16, 21/16] (<code>force_tsupport_subset</code>). It is smooth on all of ℝ × ℝ³ and compactly supported in strictly positive time.' },
  sing: { title: 'The singular point (1, 0): residual jets → 0', html: '<code>JointResidualLimits.VanishingJointJets</code>: every iterated derivative of the residual tends to 0 as (t, x) → (1, 0) from t < 1. This is the hard analytic content: the force is smooth at the one point where the velocity is not.' },
  away: { title: 't = 1 away from the origin: smooth one-sided extensions', html: '<code>JointResidualLimits.AwayExtensions</code>: at every terminal point (1, x) with x ≠ 0 there is a genuine smooth extension agreeing with the residual for t < 1. Together with the vanishing jets at the origin these give locally uniform limits of all derivatives (<code>MixedPeriodicAssembly.boundaryLimits</code>).' },
  borel: { title: 'Taylor–Borel extension, t > 1', html: '<code>CandidateFromLimits.force = SpacetimeGluing.smoothExtension 1 (tracedResidual …)</code>: the residual on t ≤ 1 is glued to the Borel realization of its normal time jets, giving a C^∞ function (<code>smoothExtension_contDiff</code>) that is zero for t ≥ 2 (<code>force_zero_from</code>). In the whole-space case the time cutoff then kills it for t ≥ 21/16.' },
  strip: { title: 'The two time functions', html: '<b>timeSwitch</b> (blue) switches the fields on: zero for |t| ≤ 3/8, one for t ≥ 3/4. <b>timeCutoff</b> (orange) confines the force: one on [3/8, 1], zero outside [1/16, 21/16]. Only these plateau and support values enter the Lean statements; the ramp shape is Mathlib’s bump.' },
};

export default {
  id: 'force-smoothness', label: 'formula-derived',
  mount(host, params, ui) {
    let periodic = false, sel = params.initial || 'force', hover = null;
    const c = ui.canvas({ aspect: 16 / 8.4, minHeight: 330, maxHeight: 520 });
    ui.select({ label: 'Case', value: 'r3', options: [{ value: 'r3', label: 'Whole space ℝ³: force cut to [1/16, 21/16] × 2K' }, { value: 'per', label: 'Periodic lift: force zero for t ≤ 0 and t ≥ 2' }], onChange: (v) => { periodic = v === 'per'; } });
    const noteEl = ui.note('');
    const setNote = (key) => { const r = REGIONS[key]; noteEl.innerHTML = `<b>${r.title}.</b> ${r.html}`; };
    setNote(sel);

    let hit = []; // [{key, x, y, w, h}] in CSS pixels, rebuilt each draw
    const pick = (ev) => { const rect = c.canvas.getBoundingClientRect(); const x = ev.clientX - rect.left, y = ev.clientY - rect.top; for (let i = hit.length - 1; i >= 0; i--) { const r = hit[i]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.key; } return null; };
    const onMove = (ev) => { const k = pick(ev); if (k !== hover) { hover = k; c.canvas.style.cursor = k ? 'pointer' : 'default'; if (k) setNote(k); else setNote(sel); } };
    const onClick = (ev) => { const k = pick(ev); if (k) { sel = k; setNote(k); } };
    c.canvas.addEventListener('mousemove', onMove); c.canvas.addEventListener('click', onClick); c.canvas.addEventListener('mouseleave', () => { hover = null; setNote(sel); });

    const draw = () => {
      const { ctx, w, h } = c; const th = theme();
      ctx.clearRect(0, 0, w, h); hit = [];
      const T0 = -0.12, T1 = 1.55, Rmax = 0.62;
      const stripH = 64; const px = { x: 50, y: 24, w: w - 64, h: h - stripH - 60 };
      const TX = (t) => px.x + ((t - T0) / (T1 - T0)) * px.w, RY = (r) => px.y + px.h - (r / Rmax) * px.h;
      const box = (key, t0, t1, r0, r1, fill, stroke, dash) => {
        const x = TX(t0), y = RY(r1), bw = TX(t1) - TX(t0), bh = RY(r0) - RY(r1);
        ctx.fillStyle = fill; ctx.fillRect(x, y, bw, bh);
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = (hover || sel) === key ? 2.2 : 1.2; ctx.setLineDash(dash || []); ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1); ctx.setLineDash([]); }
        if (key) hit.push({ key, x, y, w: bw, h: bh });
      };
      ctx.fillStyle = th.sunken; ctx.fillRect(px.x, px.y, px.w, px.h);
      // force support
      if (periodic) box('force', 0, 2, 0, Rmax * 0.98, hexA(th.warn, 0.12), th.warn, [6, 4]);
      else box('force', 1 / 16, 21 / 16, 0, 0.5, hexA(th.warn, 0.14), th.warn, [6, 4]);
      if (!periodic) box(null, 3 / 8, 1, 0, 0.5, hexA(th.warn, 0.12));
      // velocity / pressure support [0,1) × K, with the rest interval and ramp
      box('vel', 0, 1, 0, 0.25, hexA(th.accent, 0.16), th.accent);
      box('rest', T0 + 0.02, 3 / 8, 0, 0.25, hexA(th.accent, 0.06), null); // hatch below
      ctx.save(); ctx.beginPath(); ctx.rect(TX(0), RY(0.25), TX(3 / 8) - TX(0), RY(0) - RY(0.25)); ctx.clip(); ctx.strokeStyle = th.lineStrong; ctx.lineWidth = 1;
      for (let x = TX(0) - 40; x < TX(3 / 8) + 10; x += 9) { ctx.beginPath(); ctx.moveTo(x, RY(0)); ctx.lineTo(x + 40, RY(0.25)); ctx.stroke(); } ctx.restore();
      box('ramp', 3 / 8, 3 / 4, 0, 0.25, hexA(th.accent, 0.10), null);
      // schematic collapsing core (hourglass toward (1, 0)) drawn as a filled curve r = 0.17·√(1−t) scaled (schematic!)
      ctx.fillStyle = hexA(th.bad, 0.35); ctx.beginPath(); ctx.moveTo(TX(3 / 8), RY(0));
      for (let i = 0; i <= 60; i++) { const t = 3 / 8 + (i / 60) * (1 - 3 / 8); const s = Math.max(0, 1 - t); const r = 0.2 * Math.min(1, Math.pow(s / (1 - 3 / 8), 0.5)) * Math.min(1, timeSwitch(t) + 0.15); ctx.lineTo(TX(t), RY(r)); }
      ctx.lineTo(TX(1), RY(0)); ctx.closePath(); ctx.fill();
      hit.push({ key: 'core', x: TX(0.5), y: RY(0.2), w: TX(1) - TX(0.5), h: RY(0) - RY(0.2) });
      labelPill(ctx, 'collapsing active region (schematic)', TX(0.56), RY(0.21) - 10, { color: th.bad, size: 9.5 });
      // t = 1 line, singular point, away extensions, Borel region
      ctx.strokeStyle = th.lineStrong; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(TX(1), px.y); ctx.lineTo(TX(1), px.y + px.h); ctx.stroke(); ctx.setLineDash([]);
      box('borel', 1, periodic ? 2 : 21 / 16, 0, periodic ? Rmax * 0.98 : 0.5, hexA(th.ok, 0.10), null);
      box('away', 0.985, 1.015, 0.06, periodic ? Rmax * 0.98 : 0.5, hexA(th.ok, 0.0), th.ok, [2, 2]);
      ctx.fillStyle = th.bad; ctx.beginPath(); ctx.arc(TX(1), RY(0), 5, 0, Math.PI * 2); ctx.fill();
      hit.push({ key: 'sing', x: TX(1) - 10, y: RY(0) - 10, w: 20, h: 14 });
      // labels
      labelPill(ctx, '(t, x) = (1, 0): residual jets → 0, |u| → ∞', TX(1) + 8, RY(0) - 8, { color: th.bad, size: 10 });
      labelPill(ctx, 't = 1, x ≠ 0: smooth one-sided extension', TX(1) + 8, RY(0.33), { color: th.ok, size: 10 });
      labelPill(ctx, periodic ? 'Taylor–Borel extension, zero for t ≥ 2' : 'Taylor–Borel extension, cut off by t = 21/16', TX(1) + 8, RY(0.45), { color: th.ok, size: 10 });
      labelPill(ctx, 'u, p: [0,1) × K,  K = {r² ≤ 1/16, |z| ≤ 1/4}', TX(0.02), RY(0.25) - 10, { color: th.accent, size: 10 });
      labelPill(ctx, 'rest: u = p = 0', TX(0.03), RY(0.12), { color: th.accent, size: 9.5 });
      labelPill(ctx, 'ramp', TX(0.4), RY(0.12), { color: th.accent, size: 9.5 });
      labelPill(ctx, periodic ? 'force f: periodic in x, zero for t ≤ 0 and t ≥ 2' : 'force f: support ⊆ [1/16, 21/16] × 2K,  2K = {r ≤ 1/2, |z| ≤ 1/2}', TX(periodic ? 0.02 : 1 / 16 + 0.02), RY(periodic ? 0.6 : 0.5) + 12, { color: th.warn, size: 10 });
      labelPill(ctx, 'f = residual of the activated fields on (0, 1)', TX(0.4), RY(0.4), { color: th.warn, size: 10 });
      // axes
      ctx.strokeStyle = th.lineStrong; ctx.lineWidth = 1; ctx.strokeRect(px.x + 0.5, px.y + 0.5, px.w - 1, px.h - 1);
      ctx.fillStyle = th.muted; ctx.font = `10.5px ${th.sans}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (const [t, lab] of [[0, '0'], [1 / 16, '1/16'], [3 / 8, '3/8'], [3 / 4, '3/4'], [1, '1'], [21 / 16, '21/16'], [1.5, '1.5']]) { ctx.fillText(lab, TX(t), px.y + px.h + 4); }
      ctx.save(); ctx.translate(14, px.y + px.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('distance from the axis  r = |(x₀, x₁)|', 0, 0); ctx.restore();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('1/4', px.x - 4, RY(0.25)); ctx.fillText('1/2', px.x - 4, RY(0.5)); ctx.fillText('0', px.x - 4, RY(0));
      ctx.fillStyle = th.fg; ctx.font = `600 12px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('Space-time support of the fields and of the force  (hover or click a region)', px.x, 6);
      // bottom strip: the two time functions
      const sy = px.y + px.h + 24, sh = stripH - 8;
      ctx.fillStyle = th.bg; ctx.fillRect(px.x, sy, px.w, sh); ctx.strokeStyle = th.line; ctx.strokeRect(px.x + 0.5, sy + 0.5, px.w - 1, sh - 1);
      hit.push({ key: 'strip', x: px.x, y: sy, w: px.w, h: sh });
      const FY = (v) => sy + sh - 6 - v * (sh - 14);
      const plot = (f, color, dash) => { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i <= 300; i++) { const t = T0 + (i / 300) * (T1 - T0); const x = TX(t), y = FY(f(t)); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]); };
      plot(timeSwitch, th.accent); if (!periodic) plot(timeCutoff, th.warn, [5, 3]);
      labelPill(ctx, 'timeSwitch: 0 for |t| ≤ 3/8, 1 for t ≥ 3/4', TX(0.78), FY(1) + 10, { color: th.accent, size: 9.5 });
      if (!periodic) labelPill(ctx, 'timeCutoff: 1 on [3/8, 1], 0 outside [1/16, 21/16]', TX(1.02), FY(0.5), { color: th.warn, size: 9.5 });
      for (const t of [3 / 8, 3 / 4, 1, 21 / 16]) { ctx.strokeStyle = th.line; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(TX(t), sy); ctx.lineTo(TX(t), sy + sh); ctx.stroke(); ctx.setLineDash([]); }
    };
    ui.loop(() => draw());
    c.onResize(() => draw());
    return { destroy() { c.canvas.removeEventListener('mousemove', onMove); c.canvas.removeEventListener('click', onClick); } };
  },
};
