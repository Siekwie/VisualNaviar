// Formula-derived scene: the similarity coordinates of the Lean construction, in two linked panels.
// Definitions taken from the pinned Lean sources (see the chapter's verify trail):
//   q(t, z) is the unique positive solution of   q − z² q^{2h} = 1 − t        (SimilarityCoordinates, SimilarityProfile.q)
//   X = r² / (2q)   (SimilarityProfile.X with radialEnergy s = r²/2),   η = z / q^{(1−2h)/2}   (SimilarityProfile.eta)
//   A = 1/2 + h,  D = 1/2 − h                                            (CoordinateAlgebra.A, .D)
//   base axis speed  |u(t, 0)| = j · (1 − t)^{−A}                          (FinalSlowBase.origin)
//   core X < X_L, active annulus X_L ≤ X ≤ X_R, exterior X > X_R         (FinalSlowBase.annulus, ActualPolarCoverage.active)
//   outside the annulus only the slow base remains (ActualCandidateAssembly.exteriorStages); the pure-heat identity
//   is proved for X >= outerEdge = max(X_L, X_R, nominalExteriorRadius) + 1 and q < q*  (LocalPaperDomain.outerEdge, LocalPaper.Properties.exterior)
// The Lean leaves h, j, X_L (= 4/scale) and X_R (= radius·exp(tailEnd)) abstract; here they are sliders, and h is
// deliberately exaggerated for visibility (the Lean's SmallParameters has h ≤ 1/1000). The flow pattern is schematic.
import { theme, labelPill, fmt } from '../scene-runtime.js';

/** Slider format for a decade slider: prints 1 at the start instead of 10^−0.00. */
export const fmtPow10 = (v) => (v < 0.005 ? '1' : `10^−${v.toFixed(2)}`);
/** The first candidate string that fits in maxW (plus pad) at the given font; the last candidate otherwise. */
export function fitText(ctx, candidates, maxW, font, pad = 0) {
  ctx.save(); if (font) ctx.font = font;
  let pick = candidates[candidates.length - 1];
  for (const s of candidates) if (ctx.measureText(s).width + pad <= maxW) { pick = s; break; }
  ctx.restore();
  return pick;
}
const TITLE_PHYS = ['Physical coordinates (r, z)', 'Physical (r, z)'];
const TITLE_SIM = ['Similarity plane (X, η): frozen', 'Similarity (X, η): frozen', '(X, η): frozen'];
const ARROWS_NOTE = ['arrows: swirl + meridional stream, schematic', 'arrows: schematic'];
const LEGEND_LONG = [['core: base only, blowup here', 'core'], ['active annulus: all corrections', 'annulus'], ['exterior: base only', 'exterior']];
const LEGEND_SHORT = [['core', 'core'], ['active annulus', 'annulus'], ['exterior', 'exterior']];
/** One legend row for the three regions, with the band colours; falls back to short labels when the row would not fit. */
function legendRow(ctx, th, x, y, maxW) {
  ctx.save(); ctx.font = `10.5px ${th.sans}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const width = (items) => items.reduce((s, [t]) => s + 28 + ctx.measureText(t).width, 0);
  const items = width(LEGEND_LONG) <= maxW ? LEGEND_LONG : LEGEND_SHORT;
  let cx = x;
  for (const [text, kind] of items) {
    ctx.fillStyle = kind === 'core' ? hexA(th.accent, 0.28) : kind === 'annulus' ? hexA(th.warn, 0.22) : th.sunken;
    ctx.fillRect(cx, y - 5, 10, 10);
    ctx.strokeStyle = kind === 'core' ? th.accent : kind === 'annulus' ? th.warn : th.lineStrong; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, y - 4.5, 9, 9);
    ctx.fillStyle = th.muted; ctx.fillText(text, cx + 14, y);
    cx += 28 + ctx.measureText(text).width;
  }
  ctx.restore();
}

/** Solve q − z² q^{2h} = τ for the unique q > 0 (bisection; q ≥ τ always). */
function solveQ(tau, z, h) {
  const z2 = z * z, a = 2 * h;
  if (z2 === 0) return tau;
  const f = (q) => q - z2 * Math.pow(q, a) - tau;
  let lo = tau, hi = tau + z2 + 1;
  while (f(hi) < 0) hi *= 2;
  for (let i = 0; i < 48; i++) { const mid = 0.5 * (lo + hi); if (f(mid) < 0) lo = mid; else hi = mid; }
  return 0.5 * (lo + hi);
}

export default {
  id: 'similarity-zoom', label: 'formula-derived',
  mount(host, params, ui) {
    let h = params.h ?? 0.08, XL = params.XL ?? 0.5, XR = params.XR ?? 3, logS = params.logS ?? 0.3, playing = false, zoom = false;
    const P = { r: 0.95, z: -0.42 }; // a fixed physical probe point, drawn in both panels
    const NZ = 121; // z samples for the region boundaries
    const qz = new Float64Array(NZ), zs = new Float64Array(NZ);
    const trail = [];

    const c = ui.canvas({ aspect: 16 / 8.2, minHeight: 320, maxHeight: 500 });
    const ro = ui.readouts([
      { key: 'U', label: 'Axis speed |u(t,0)|', unit: 'units of j (Lean: j ≤ 1/1000, abstract)' },
      { key: 'w', label: 'Core waist radius', unit: '√(2 X_L (1−t))' },
      { key: 'L', label: 'Axial scale on z = 0', unit: '(1−t)^(1/2−h)' },
      { key: 'asp', label: 'Width / length', unit: '(1−t)^h → 0' },
    ]);
    const sT = ui.slider({ label: 'Time to blowup, 1 − t', min: 0, max: 3, step: 0.01, value: logS, format: fmtPow10, onChange: (v) => { logS = v; } });
    ui.slider({ label: 'Exponent h', min: 0.001, max: 0.2, step: 0.001, value: h, format: (v) => v.toFixed(3), hint: 'Exaggerated for visibility; the Lean requires 0 < h ≤ 1/1000.', onChange: (v) => { h = v; trail.length = 0; } });
    ui.slider({ label: 'Core edge X_L', min: 0.1, max: 2, step: 0.05, value: XL, hint: 'Illustrative band edge: it only moves the drawn boundary and the waist readout. The Lean\u2019s activeLeft (4/scale) is abstract.', onChange: (v) => { XL = Math.min(v, XR - 0.1); } });
    ui.slider({ label: 'Annulus edge X_R', min: 1, max: 8, step: 0.1, value: XR, hint: 'Illustrative band edge: it only moves the drawn boundary. The Lean\u2019s activeRight (radius·e^tailEnd) is abstract.', onChange: (v) => { XR = Math.max(v, XL + 0.1); } });
    ui.toggle({ label: 'Zoom the physical panel with the collapse (r ∝ √(1−t), z ∝ (1−t)^(1/2−h))', value: false, onChange: (v) => { zoom = v; } });
    ui.toggle({ label: 'Play: approach t = 1', value: false, onChange: (v) => { playing = v; if (v && logS >= 2.99) logS = 0; } });
    ui.note('<b>Formula-derived.</b> $q$ solves $q - z^2 q^{2h} = 1-t$; $X = r^2/(2q)$, $\\eta = z/q^{(1-2h)/2}$; the axis speed is $j\\,(1-t)^{-(1/2+h)}$; the three regions are $X \\lt X_L$ (core), $X_L \\le X \\le X_R$ (active annulus), $X \\gt X_R$ (exterior: only the base remains; the pure heat identity holds beyond $X_{\\mathrm{ext}} \\ge X_R + 1$, not drawn). The slider $h$ is exaggerated for visibility and $X_L, X_R, j$ are abstract in the Lean. The swirl and meridional arrows are schematic.');

    const draw = () => {
      const { ctx, w, hgt } = { ctx: c.ctx, w: c.w, hgt: c.h }; const th = theme();
      const tau = Math.pow(10, -logS), t = 1 - tau, A = 0.5 + h, D = 0.5 - h;
      const U = Math.pow(tau, -A), waist = Math.sqrt(2 * XL * tau), Lz = Math.pow(tau, D);
      ro.update({
        U: { value: U, trend: 'up', detail: `= (1−t)^−${A.toFixed(3)} · j` },
        w: { value: waist, trend: 'down', detail: `∝ √(1−t) = ${Math.sqrt(tau).toExponential(2)}` },
        L: { value: Lz, trend: 'down', detail: 'z at fixed η shrinks like q^(1/2−h)' },
        asp: { value: Math.pow(tau, h), trend: 'down', detail: 'slender: width shrinks faster than length' },
      });
      ctx.clearRect(0, 0, w, hgt);
      const gap = 10, leftW = Math.floor(w * 0.5) - gap, rightX = leftW + 2 * gap, rightW = w - rightX;
      /* ---------- left: physical half-plane (r, z) ---------- */
      const Rmax0 = 2.4, Zmax0 = 1.1;
      const Rmax = zoom ? Rmax0 * Math.sqrt(tau) * 1.0 : Rmax0, Zmax = zoom ? Zmax0 * Math.pow(tau, D) : Zmax0;
      const px = { x: 44, y: 38, w: leftW - 54, h: hgt - 64 };
      const RX = (r) => px.x + (r / Rmax) * px.w, ZY = (z) => px.y + px.h / 2 - (z / Zmax) * (px.h / 2);
      for (let i = 0; i < NZ; i++) { const z = -Zmax + (2 * Zmax * i) / (NZ - 1); zs[i] = z; qz[i] = solveQ(tau, z, h); }
      ctx.save(); ctx.beginPath(); ctx.rect(px.x, px.y, px.w, px.h); ctx.clip();
      ctx.fillStyle = th.sunken; ctx.fillRect(px.x, px.y, px.w, px.h);
      // exterior = background; annulus band; core band (drawn as polygons between the boundary curves)
      const band = (Xa, Xb, color) => {
        ctx.fillStyle = color; ctx.beginPath();
        for (let i = 0; i < NZ; i++) ctx.lineTo(RX(Math.sqrt(2 * Xa * qz[i])), ZY(zs[i]));
        for (let i = NZ - 1; i >= 0; i--) ctx.lineTo(RX(Math.sqrt(2 * Xb * qz[i])), ZY(zs[i]));
        ctx.closePath(); ctx.fill();
      };
      band(0, XR, hexA(th.warn, 0.22)); band(0, XL, hexA(th.accent, 0.28));
      ctx.strokeStyle = th.warn; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < NZ; i++) ctx.lineTo(RX(Math.sqrt(2 * XR * qz[i])), ZY(zs[i])); ctx.stroke();
      ctx.strokeStyle = th.accent; ctx.beginPath(); for (let i = 0; i < NZ; i++) ctx.lineTo(RX(Math.sqrt(2 * XL * qz[i])), ZY(zs[i])); ctx.stroke();
      // η = ±1/2 lines: z = ±η q^D with q = τ/(1 − η²)
      const eta = 0.5, qEta = tau / (1 - eta * eta), zEta = eta * Math.pow(qEta, D);
      ctx.strokeStyle = th.faint; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(px.x, ZY(zEta)); ctx.lineTo(px.x + px.w, ZY(zEta)); ctx.moveTo(px.x, ZY(-zEta)); ctx.lineTo(px.x + px.w, ZY(-zEta)); ctx.stroke(); ctx.setLineDash([]);
      labelPill(ctx, 'η = ±½', px.x + px.w - 8, ZY(-zEta) + 9, { color: th.muted, align: 'right', size: 10 });
      // axis of symmetry and the axis velocity arrow at the origin (formula-derived direction e₂, magnitude j(1−t)^−A)
      ctx.strokeStyle = th.lineStrong; ctx.beginPath(); ctx.moveTo(RX(0) + 0.5, px.y); ctx.lineTo(RX(0) + 0.5, px.y + px.h); ctx.stroke();
      const ah = Math.min(px.h * 0.42, 18 + 14 * Math.log10(Math.max(1, U)));
      arrow(ctx, RX(0) + 0.5, ZY(0), RX(0) + 0.5, ZY(0) - ah, th.bad, 2.2);
      labelPill(ctx, `u(t,0) = j(1−t)^−${A.toFixed(2)} e₂`, RX(0) + 8, ZY(0) - ah - 2, { color: th.bad, size: 10.5 });
      // schematic flow hints: inward radial arrows in the annulus near z = 0, swirl glyph
      const rIn = Math.sqrt(2 * XR * tau) * 0.92, rOut = Math.sqrt(2 * XL * tau) * 1.25;
      if (RX(rIn) - RX(rOut) > 14) {
        arrow(ctx, RX(rIn), ZY(0) + 0.5, RX(rOut), ZY(0) + 0.5, th.muted, 1.2);
        arrow(ctx, RX(rIn), ZY(zEta * 0.5), RX(rOut * 1.3), ZY(zEta * 0.5), th.muted, 1);
        arrow(ctx, RX(rIn), ZY(-zEta * 0.5), RX(rOut * 1.3), ZY(-zEta * 0.5), th.muted, 1);
      }
      // probe point P
      ctx.fillStyle = th.numeric; ctx.beginPath(); ctx.arc(RX(P.r), ZY(P.z), 4, 0, Math.PI * 2); ctx.fill();
      labelPill(ctx, 'P', RX(P.r) + 6, ZY(P.z) - 8, { color: th.numeric, size: 10 });
      ctx.restore();
      ctx.strokeStyle = th.lineStrong; ctx.strokeRect(px.x + 0.5, px.y + 0.5, px.w - 1, px.h - 1);
      ctx.fillStyle = th.muted; ctx.font = `11px ${th.sans}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(zoom ? `r  (0 … ${Rmax.toExponential(1)})` : 'r (distance from the axis)', px.x + px.w / 2, px.y + px.h + 6);
      ctx.save(); ctx.translate(12, px.y + px.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(zoom ? `z  (±${Zmax.toExponential(1)})` : 'z (along the axis)', 0, 0); ctx.restore();
      ctx.fillStyle = th.fg; ctx.font = `600 12px ${th.sans}`; ctx.textAlign = 'left'; ctx.fillText(fitText(ctx, TITLE_PHYS, px.w + 10, `600 12px ${th.sans}`), px.x, 6);
      legendRow(ctx, th, px.x, 24, w - px.x - 8); // region colours, shared by both panels
      // only the time readout sits inside the panel; it is shortened when the panel is narrow
      labelPill(ctx, fitText(ctx, [`t = ${t.toFixed(3)}   q(z=0) = 1 − t = ${tau.toExponential(2)}`, `t = ${t.toFixed(3)}`], px.w - 8, `600 10.5px ${th.sans}`, 12), px.x + 4, px.y + 14, { color: th.fg, size: 10.5 });
      labelPill(ctx, fitText(ctx, ARROWS_NOTE, px.w - 8, `600 9.5px ${th.sans}`, 12), px.x + 4, px.y + px.h - 12, { color: th.muted, size: 9.5 });
      /* ---------- right: similarity plane (X, η) — frozen in time ---------- */
      const Xmax = XR * 1.35;
      const sx = { x: rightX + 40, y: 38, w: rightW - 50, h: hgt - 64 };
      const SX = (X) => sx.x + (X / Xmax) * sx.w, SY = (e) => sx.y + sx.h / 2 - e * (sx.h / 2) * 0.94;
      ctx.fillStyle = th.sunken; ctx.fillRect(sx.x, sx.y, sx.w, sx.h);
      ctx.fillStyle = hexA(th.warn, 0.22); ctx.fillRect(SX(XL), SY(1), SX(XR) - SX(XL), SY(-1) - SY(1));
      ctx.fillStyle = hexA(th.accent, 0.28); ctx.fillRect(SX(0), SY(1), SX(XL) - SX(0), SY(-1) - SY(1));
      ctx.strokeStyle = th.faint; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(sx.x, SY(0.5)); ctx.lineTo(sx.x + sx.w, SY(0.5)); ctx.moveTo(sx.x, SY(-0.5)); ctx.lineTo(sx.x + sx.w, SY(-0.5)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = th.lineStrong; ctx.beginPath(); ctx.moveTo(sx.x, SY(1)); ctx.lineTo(sx.x + sx.w, SY(1)); ctx.moveTo(sx.x, SY(-1)); ctx.lineTo(sx.x + sx.w, SY(-1)); ctx.stroke();
      ctx.strokeStyle = th.accent; ctx.beginPath(); ctx.moveTo(SX(XL), sx.y); ctx.lineTo(SX(XL), sx.y + sx.h); ctx.stroke();
      ctx.strokeStyle = th.warn; ctx.beginPath(); ctx.moveTo(SX(XR), sx.y); ctx.lineTo(SX(XR), sx.y + sx.h); ctx.stroke();
      // probe point in similarity coordinates and its trail as t → 1
      const qP = solveQ(tau, P.z, h), XP = (P.r * P.r) / (2 * qP), etaP = P.z / Math.pow(qP, D);
      if (!trail.length || Math.abs(trail[trail.length - 1][2] - logS) > 0.02) { trail.push([XP, etaP, logS]); if (trail.length > 400) trail.shift(); }
      ctx.strokeStyle = th.numeric; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.beginPath();
      for (let i = 0; i < trail.length; i++) { const [X, e] = trail[i]; if (i === 0) ctx.moveTo(SX(X), SY(e)); else ctx.lineTo(SX(X), SY(e)); } ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = th.numeric; ctx.beginPath(); ctx.arc(Math.min(SX(XP), sx.x + sx.w), SY(etaP), 4, 0, Math.PI * 2); ctx.fill();
      labelPill(ctx, `P: X = ${fmt.num(XP)}  η = ${etaP.toFixed(3)}`, Math.min(SX(XP), sx.x + sx.w - 150) + 6, SY(etaP) + (etaP < -0.6 ? -12 : 12), { color: th.numeric, size: 10 });
      ctx.strokeStyle = th.lineStrong; ctx.strokeRect(sx.x + 0.5, sx.y + 0.5, sx.w - 1, sx.h - 1);
      ctx.fillStyle = th.fg; ctx.font = `600 12px ${th.sans}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(fitText(ctx, TITLE_SIM, w - sx.x - 4, `600 12px ${th.sans}`), sx.x, 6);
      ctx.fillStyle = th.muted; ctx.font = `11px ${th.sans}`; ctx.textAlign = 'center'; ctx.fillText('X = r² / (2q)', sx.x + sx.w / 2, sx.y + sx.h + 6);
      ctx.save(); ctx.translate(rightX + 10, sx.y + sx.h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('η = z / q^(1/2−h)', 0, 0); ctx.restore();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = th.faint; ctx.font = `10px ${th.sans}`;
      ctx.fillText('+1', sx.x - 4, SY(1)); ctx.fillText('−1', sx.x - 4, SY(-1)); ctx.fillText('0', sx.x - 4, SY(0));
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText('X_L', SX(XL) + 3, sx.y + sx.h - 3); ctx.fillText('X_R', SX(XR) + 3, sx.y + sx.h - 3);
    };
    ui.loop((dt) => {
      if (playing) { logS = Math.min(3, logS + dt * 0.45); sT.set(logS, false); if (logS >= 3) playing = false; }
      draw();
    });
    c.onResize(() => draw());
    return { destroy() {} };
  },
};

function arrow(ctx, x1, y1, x2, y2, color, width) {
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), s = 5 + width;
  ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.5), y2 - s * Math.sin(a - 0.5)); ctx.lineTo(x2 - s * Math.cos(a + 0.5), y2 - s * Math.sin(a + 0.5)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** css colour (#rrggbb) → rgba with alpha; falls back to the colour itself. */
export function hexA(col, alpha) {
  const m = /^#([0-9a-f]{6})$/i.exec(col.trim());
  if (!m) return col;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
