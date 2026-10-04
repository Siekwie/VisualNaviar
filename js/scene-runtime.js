// Scene runtime: evidence labels, UI helpers, canvas + animation loop, and a small chart.

export const LABELS = {
  'schematic': {
    name: 'Schematic',
    blurb: 'A drawing of the idea. Shapes and motion are illustrative and are not computed from the equations.',
  },
  'formula-derived': {
    name: 'Formula-derived',
    blurb: 'Every number shown is computed from the formulas displayed in the scene, with the parameters you set.',
  },
  'numerically-computed': {
    name: 'Numerically computed',
    blurb: 'Computed in your browser by a stated numerical model. It is a model that illustrates a mechanism, not the proof.',
  },
  'source-quoted': {
    name: 'Source-quoted',
    blurb: 'Not a visualization: the text in this panel is quoted or closely paraphrased from the cited sources.',
  },
};

const fmt = {
  num(v, digits = 3) {
    if (!isFinite(v)) return v > 0 ? '∞' : (v < 0 ? '−∞' : 'NaN');
    const a = Math.abs(v);
    if (a !== 0 && (a >= 1e5 || a < 1e-3)) {
      const e = Math.floor(Math.log10(a));
      const m = v / Math.pow(10, e);
      return `${m.toFixed(2)}×10${sup(e)}`;
    }
    return v.toFixed(a >= 100 ? 0 : a >= 10 ? 1 : digits);
  },
  pct(v) { return `${(v * 100).toFixed(1)}%`; },
};
function sup(n) {
  const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map((c) => map[c] || c).join('');
}
export { fmt };

export function cssVar(name, el = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Build the helper object handed to scenes. All DOM is created inside `host`. */
export function makeUI(host) {
  host.innerHTML = '';
  const canvasWrap = el('div', 'scene-canvas-wrap');
  const controls = el('div', 'scene-controls');
  const readoutsEl = el('div', 'readouts');
  const noteEl = el('div', 'scene-note');
  host.append(canvasWrap, readoutsEl, controls, noteEl);
  readoutsEl.hidden = controls.hidden = noteEl.hidden = true;

  const disposers = [];
  const ui = {
    host, canvasWrap, controls,

    /** Create a DPR-aware canvas with a fixed aspect ratio. Returns {canvas, ctx, w, h, onResize}. */
    /** minWidth: below this logical width the canvas keeps its size and the card scrolls sideways (phones). */
    canvas({ aspect = 16 / 9, maxHeight = 520, minHeight = 240, minWidth = 460 } = {}) {
      const canvas = document.createElement('canvas');
      canvasWrap.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const state = { canvas, ctx, w: 0, h: 0, dpr: 1, _cbs: [] };
      const resize = () => {
        const avail = canvasWrap.clientWidth || host.clientWidth || 600;
        const cw = Math.max(minWidth, avail);
        const ch = Math.min(maxHeight, Math.max(minHeight, cw / aspect));
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        state.w = cw; state.h = ch; state.dpr = dpr;
        canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
        canvas.style.width = `${cw}px`; canvas.style.height = `${ch}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state._cbs.forEach((cb) => cb(state));
      };
      const ro = new ResizeObserver(() => resize());
      ro.observe(canvasWrap);
      disposers.push(() => ro.disconnect());
      resize();
      state.onResize = (cb) => { state._cbs.push(cb); cb(state); };
      return state;
    },

    /** requestAnimationFrame loop that pauses when hidden. fn(dtSeconds, tSeconds). Returns {stop, start, running}. */
    loop(fn) {
      let raf = 0, last = 0, t0 = 0, running = false;
      const step = (now) => {
        if (!running) return;
        if (!last) { last = now; t0 = now; }
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        try { fn(dt, (now - t0) / 1000); } catch (e) { console.error(e); running = false; return; }
        raf = requestAnimationFrame(step);
      };
      const start = () => { if (running) return; running = true; last = 0; raf = requestAnimationFrame(step); };
      const stop = () => { running = false; cancelAnimationFrame(raf); };
      const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); last = 0; } else if (running) { raf = requestAnimationFrame(step); } };
      document.addEventListener('visibilitychange', vis);
      disposers.push(() => { stop(); document.removeEventListener('visibilitychange', vis); });
      start();
      return { stop, start, get running() { return running; } };
    },

    slider({ label, min, max, step = 0.01, value, format = (v) => fmt.num(v), hint, onChange }) {
      controls.hidden = false;
      const wrap = el('div', 'ctl');
      const lab = document.createElement('label');
      const name = document.createElement('span'); name.textContent = label;
      const val = document.createElement('b');
      lab.append(name, val);
      const input = document.createElement('input');
      input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value;
      input.setAttribute('aria-label', label);
      const set = (v, fire = true) => { input.value = v; val.textContent = format(Number(v)); if (fire) onChange?.(Number(v)); };
      input.addEventListener('input', () => set(input.value));
      wrap.append(lab, input);
      if (hint) { const h = el('div', 'hint'); h.innerHTML = hint; wrap.appendChild(h); }
      controls.appendChild(wrap);
      set(value, false);
      return { get value() { return Number(input.value); }, set, input };
    },

    select({ label, options, value, hint, onChange }) {
      controls.hidden = false;
      const wrap = el('div', 'ctl');
      const lab = document.createElement('label'); lab.textContent = label;
      const sel = document.createElement('select');
      sel.setAttribute('aria-label', label);
      for (const o of options) { const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.label; sel.appendChild(opt); }
      sel.value = value;
      sel.addEventListener('change', () => onChange?.(sel.value));
      wrap.append(lab, sel);
      if (hint) { const h = el('div', 'hint'); h.innerHTML = hint; wrap.appendChild(h); }
      controls.appendChild(wrap);
      return { get value() { return sel.value; }, set(v) { sel.value = v; onChange?.(v); }, select: sel };
    },

    toggle({ label, value = false, hint, onChange }) {
      controls.hidden = false;
      const wrap = el('div', 'ctl toggle');
      const lab = document.createElement('label');
      const input = document.createElement('input'); input.type = 'checkbox'; input.checked = value;
      const name = document.createElement('span'); name.textContent = label;
      lab.append(input, name);
      input.addEventListener('change', () => onChange?.(input.checked));
      wrap.appendChild(lab);
      if (hint) { const h = el('div', 'hint'); h.innerHTML = hint; wrap.appendChild(h); }
      controls.appendChild(wrap);
      return { get value() { return input.checked; }, set(v) { input.checked = v; onChange?.(v); } };
    },

    button({ label, primary = false, onClick }) {
      controls.hidden = false;
      const wrap = el('div', 'ctl');
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (primary) b.className = 'primary';
      b.addEventListener('click', () => onClick?.(b));
      wrap.appendChild(b); controls.appendChild(wrap);
      return b;
    },

    /** readouts([{key, label, unit}]) → update({key: {value, trend:'up'|'flat'|'down', detail}}) */
    readouts(defs) {
      readoutsEl.hidden = false;
      const nodes = {};
      for (const d of defs) {
        const r = el('div', 'readout');
        const k = el('div', 'k'); k.textContent = d.label;
        const v = el('div', 'v'); v.textContent = '—';
        const dd = el('div', 'd'); dd.textContent = d.unit || '';
        r.append(k, v, dd); readoutsEl.appendChild(r);
        nodes[d.key] = { r, v, dd };
      }
      return {
        update(values) {
          for (const key in values) {
            const n = nodes[key]; if (!n) continue;
            const x = values[key];
            const val = typeof x === 'object' && x !== null ? x.value : x;
            n.v.textContent = typeof val === 'number' ? fmt.num(val) : String(val);
            n.r.classList.remove('up', 'flat', 'down');
            if (x && x.trend) n.r.classList.add(x.trend);
            if (x && x.detail !== undefined) n.dd.textContent = x.detail;
          }
        },
      };
    },

    note(html) { noteEl.hidden = false; noteEl.innerHTML = html; return noteEl; },

    onDispose(fn) { disposers.push(fn); },
    dispose() { disposers.splice(0).forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); host.innerHTML = ''; },
  };
  return ui;
}

function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }

/* ---------- Drawing helpers ---------- */

export function theme() {
  return {
    fg: cssVar('--fg'), muted: cssVar('--fg-muted'), faint: cssVar('--fg-faint'),
    line: cssVar('--line'), lineStrong: cssVar('--line-strong'),
    bg: cssVar('--bg-elev'), sunken: cssVar('--bg-sunken'),
    accent: cssVar('--accent'), euler: cssVar('--euler'), ok: cssVar('--ok'), bad: cssVar('--bad'), warn: cssVar('--warn'),
    numeric: cssVar('--lab-numeric'), formula: cssVar('--lab-formula'),
    mono: cssVar('--mono') || 'monospace', sans: cssVar('--sans') || 'sans-serif',
  };
}

/**
 * Minimal line chart. series: [{pts:[[x,y],...], color, label, dash?}], yLog, xLog, xLabel, yLabel,
 * xDomain/yDomain optional. Draws into ctx within rect {x,y,w,h}.
 */
export function lineChart(ctx, rect, { series, xLog = false, yLog = false, xLabel = '', yLabel = '', xDomain, yDomain, marker, title, legend = 'top-left' }) {
  const th = theme();
  const padL = 46, padR = 10, padT = title ? 22 : 10, padB = 28;
  const x0 = rect.x + padL, y0 = rect.y + padT, w = rect.w - padL - padR, h = rect.h - padT - padB;
  const all = series.flatMap((s) => s.pts);
  const fx = xLog ? (v) => Math.log10(v) : (v) => v, fy = yLog ? (v) => Math.log10(v) : (v) => v;
  let xs = all.map((p) => fx(p[0])).filter(isFinite), ys = all.map((p) => fy(p[1])).filter(isFinite);
  let xmin = xDomain ? fx(xDomain[0]) : Math.min(...xs), xmax = xDomain ? fx(xDomain[1]) : Math.max(...xs);
  let ymin = yDomain ? fy(yDomain[0]) : Math.min(...ys), ymax = yDomain ? fy(yDomain[1]) : Math.max(...ys);
  if (!(xmax > xmin)) xmax = xmin + 1; if (!(ymax > ymin)) ymax = ymin + 1;
  if (!yDomain) { const m = (ymax - ymin) * 0.08; ymin -= m; ymax += m; }
  const X = (v) => x0 + ((fx(v) - xmin) / (xmax - xmin)) * w;
  const Y = (v) => y0 + h - ((fy(v) - ymin) / (ymax - ymin)) * h;

  ctx.save();
  ctx.font = `11px ${th.sans}`; ctx.fillStyle = th.faint; ctx.strokeStyle = th.line; ctx.lineWidth = 1;
  // grid + ticks
  const yt = ticks(ymin, ymax, yLog ? 'log' : 'lin'), xt = ticks(xmin, xmax, xLog ? 'log' : 'lin');
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const t of yt) { const yy = y0 + h - ((t - ymin) / (ymax - ymin)) * h; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + w, yy); ctx.stroke(); ctx.fillText(yLog ? pow10Label(t) : trim(t), x0 - 6, yy); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const t of xt) { const xx = x0 + ((t - xmin) / (xmax - xmin)) * w; ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + h); ctx.stroke(); ctx.fillText(xLog ? pow10Label(t) : trim(t), xx, y0 + h + 5); }
  ctx.strokeStyle = th.lineStrong; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0 + w, y0 + h); ctx.stroke();
  if (xLabel) { ctx.fillStyle = th.muted; ctx.textAlign = 'right'; ctx.fillText(xLabel, x0 + w, y0 + h + 15); }
  if (yLabel) { ctx.save(); ctx.translate(rect.x + 11, y0); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = th.muted; ctx.fillText(yLabel, 0, 0); ctx.restore(); }
  if (title) { ctx.fillStyle = th.fg; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = `600 12px ${th.sans}`; ctx.fillText(title, x0, rect.y + 4); }
  // series
  ctx.beginPath(); ctx.rect(x0 - 1, y0 - 1, w + 2, h + 2); ctx.clip();
  for (const s of series) {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
    ctx.beginPath(); let started = false;
    for (const [px, py] of s.pts) {
      if (!isFinite(fx(px)) || !isFinite(fy(py))) { started = false; continue; }
      const xx = X(px), yy = Y(py);
      if (!started) { ctx.moveTo(xx, yy); started = true; } else ctx.lineTo(xx, yy);
    }
    ctx.stroke(); ctx.setLineDash([]);
  }
  if (marker !== undefined) {
    const xx = X(marker); ctx.strokeStyle = th.faint; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + h); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  // legend
  ctx.save(); ctx.font = `11.5px ${th.sans}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const nLeg = series.filter((s) => s.label).length;
  const legW = Math.max(0, ...series.filter((s) => s.label).map((s) => ctx.measureText(s.label).width)) + 30;
  let lx = legend.endsWith('right') ? x0 + w - legW : x0 + 8;
  let ly = legend.startsWith('bottom') ? y0 + h - nLeg * 15 - 4 : y0 + 10;
  for (const s of series) {
    if (!s.label) continue;
    ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.setLineDash(s.dash || []); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 16, ly); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = th.fg; ctx.fillText(s.label, lx + 21, ly);
    ly += 15;
  }
  ctx.restore();
  return { X, Y, x0, y0, w, h };
}
function ticks(min, max, kind) {
  if (kind === 'log') { const out = []; for (let e = Math.ceil(min); e <= Math.floor(max); e++) out.push(e); if (out.length > 8) return out.filter((_, i) => i % Math.ceil(out.length / 8) === 0); if (out.length === 0) return [min, max]; return out; }
  const span = max - min; const raw = span / 5; const p = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / p; const stepv = (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
  const out = []; for (let v = Math.ceil(min / stepv) * stepv; v <= max + 1e-9; v += stepv) out.push(Number(v.toFixed(10))); return out;
}
function trim(v) { return Math.abs(v) >= 1000 ? v.toExponential(0) : String(Number(v.toFixed(3))); }
function pow10Label(e) { return e === 0 ? '1' : e === 1 ? '10' : `10${sup(e)}`; }

/** Draw text with a soft background pill. */
export function labelPill(ctx, text, x, y, { color, bg, align = 'left', size = 11.5 } = {}) {
  const th = theme();
  ctx.save(); ctx.font = `600 ${size}px ${th.sans}`; ctx.textBaseline = 'middle';
  const wdt = ctx.measureText(text).width + 12; const hgt = size + 8;
  const xx = align === 'center' ? x - wdt / 2 : align === 'right' ? x - wdt : x;
  ctx.fillStyle = bg || th.bg; ctx.globalAlpha = 0.92; roundRect(ctx, xx, y - hgt / 2, wdt, hgt, 5); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = color || th.fg; ctx.textAlign = 'left'; ctx.fillText(text, xx + 6, y + 0.5);
  ctx.restore();
}
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/** Perceptual-ish colour ramp for scalar fields: t∈[0,1] → css colour (dark blue → teal → yellow → red). */
export function heat(t) {
  t = Math.max(0, Math.min(1, t));
  const stops = [[0, [22, 36, 80]], [0.3, [19, 120, 140]], [0.6, [250, 204, 21]], [1, [220, 38, 38]]];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i]; const u = (t - a) / (b - a); return `rgb(${ca.map((c, k) => Math.round(c + (cb[k] - c) * u)).join(',')})`; }
  }
  return 'rgb(220,38,38)';
}
