import { chapters, home } from '../content/index.js';
import { SOURCES, leanUrl, LEAN_COMMIT } from '../content/sources.js';
import { typeset } from './math.js';
import { LABELS, makeUI, theme, heat, labelPill } from './scene-runtime.js';
import { loadScene } from './scenes/index.js';

const DEPTHS = [['understand', 'Understand'], ['inspect', 'Inspect'], ['verify', 'Verify']];
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- Flat index ---------- */
const flat = [];
chapters.forEach((ch) => ch.scenes.forEach((sc, i) => flat.push({ ch, sc, i, n: flat.length })));
const byKey = new Map(flat.map((f) => [`${f.ch.id}/${f.sc.id}`, f]));

/* ---------- Persistent bits ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};
let depth = store.get('bx-depth', 'understand');
const visited = new Set(store.get('bx-visited', []));

/* ---------- Routing ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const q = new URLSearchParams(query);
  const [chId, scId] = path.split('/').filter(Boolean);
  if (q.get('depth') && DEPTHS.some(([k]) => k === q.get('depth'))) { depth = q.get('depth'); store.set('bx-depth', depth); }
  if (!chId) return { home: true };
  if (chId === 'dev' && scId) return { dev: scId };
  const ch = chapters.find((c) => c.id === chId);
  if (!ch) return { home: true };
  const entry = byKey.get(`${ch.id}/${scId}`) || flat.find((f) => f.ch === ch);
  return { entry };
}
export function go(chId, scId, d) {
  const h = `#/${chId}${scId ? '/' + scId : ''}${d ? `?depth=${d}` : ''}`;
  if (location.hash === h) route(); else location.hash = h;
}
window.addEventListener('hashchange', route);

/* ---------- Content link expansion: [[scene:ch/sc|label]] ---------- */
function expand(html) {
  if (!html) return '';
  return html.replace(/\[\[scene:([\w-]+)(?:\/([\w-]+))?\|([^\]]+)\]\]/g, (_, ch, sc, label) => `<a href="#/${ch}${sc ? '/' + sc : ''}">${label}</a>`)
    .replace(/\[\[src:([\w-]+)\]\]/g, (_, id) => { const s = SOURCES[id]; return s ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.short || s.title)}</a>` : id; });
}

/* ---------- Top bar ---------- */
const SHORT = { concentration: 'Peak speed, finite energy', 'navier-stokes': 'Navier–Stokes', euler: 'Euler', verification: 'What Lean verified', implications: 'Implications' };
function renderTopbar(active) {
  const nav = $('#chapter-nav');
  nav.innerHTML = chapters.map((c) => `<a href="#/${c.id}" class="eq-${c.equation} ${active && active.ch === c ? 'active' : ''}" title="${esc(c.title)} — ${esc(c.summary)}"><span class="num">${c.number}</span>${esc(c.short || SHORT[c.id] || c.title)}</a>`).join('');
  const ds = $('#depth-switch');
  ds.innerHTML = DEPTHS.map(([k, l]) => `<button role="tab" data-depth="${k}" aria-selected="${k === depth}">${l}</button>`).join('');
  ds.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => setDepth(b.dataset.depth)));
}
function setDepth(d) {
  depth = d; store.set('bx-depth', d);
  document.querySelectorAll('#depth-switch button, .depth-tabs button[data-depth]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.depth === d)));
  if (current) renderExplain(current);
}
$('#theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const cur = root.getAttribute('data-theme') || (sysDark ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next); try { localStorage.setItem('bx-theme', next); } catch { /* ignore */ }
  if (current) mountVisual(current); // scenes read CSS colours at draw time; remount for a clean repaint
  else drawHero();
});
$('#trail-toggle').addEventListener('click', () => $('#trail').classList.toggle('open'));
document.addEventListener('click', (e) => { if (!e.target.closest('#trail') && !e.target.closest('#trail-toggle')) $('#trail').classList.remove('open'); });

/* ---------- Trail ---------- */
function renderTrail(entry) {
  const t = $('#trail');
  const prev = flat[entry.n - 1], next = flat[entry.n + 1];
  const list = chapters.map((c) => {
    const open = c === entry.ch;
    const scenes = open ? `<ol class="scenes">${c.scenes.map((s) => `<li><a href="#/${c.id}/${s.id}" class="${s === entry.sc ? 'active' : ''} ${visited.has(c.id + '/' + s.id) && s !== entry.sc ? 'done' : ''}">${esc(s.question)}</a></li>`).join('')}</ol>` : '';
    return `<li class="chap eq-${c.equation}"><a href="#/${c.id}"><span class="num">${c.number}</span><span>${esc(c.title)}</span><span class="dot" aria-hidden="true"></span></a>${scenes}</li>`;
  }).join('');
  t.innerHTML = `
    <h2>Where are we?</h2>
    <div class="where"><strong>${esc(entry.ch.title)}</strong>Scene ${entry.i + 1} of ${entry.ch.scenes.length} · ${esc(entry.sc.title)}<span class="sum">${esc(entry.ch.summary)}</span></div>
    <h2>Question trail</h2>
    <ol>${list}</ol>
    <div class="prevnext">
      ${prev ? `<a href="#/${prev.ch.id}/${prev.sc.id}"><span>What came before${prev.ch !== entry.ch ? ` · Chapter ${prev.ch.number}` : ''}</span><strong>${esc(prev.sc.question)}</strong></a>` : ''}
      ${next ? `<a href="#/${next.ch.id}/${next.sc.id}"><span>What comes next${next.ch !== entry.ch ? ` · Chapter ${next.ch.number}` : ''}</span><strong>${esc(next.sc.question)}</strong></a>` : '<a href="#/"><span>End of trail</span><strong>Back to the overview</strong></a>'}
    </div>
    <div class="legend">
      <h2>Evidence labels</h2>
      ${Object.entries(LABELS).map(([k, v]) => `<div><span class="badge ${k}" title="${esc(v.blurb)}">${v.name}</span></div>`).join('')}
    </div>
`;
}

/* ---------- Stage (visual) ---------- */
let current = null, mounted = null;
async function mountVisual(entry) {
  const host = $('#scene-host');
  if (!host) return;
  if (mounted) { try { mounted.instance?.destroy?.(); } catch { /* ignore */ } try { mounted.ui.dispose(); } catch { /* ignore */ } mounted = null; }
  const ui = makeUI(host);
  const mod = await loadScene(entry.sc.visual?.scene);
  if (current !== entry) return; // navigated away while loading
  let instance = null;
  try { instance = mod.mount(host, entry.sc.visual?.params || {}, ui); }
  catch (e) { console.error('Scene mount failed', e); host.innerHTML = `<div class="scene-note">This scene failed to start: <code>${esc(e.message)}</code></div>`; }
  mounted = { ui, instance };
  typeset($('#scene-host'));
}
function renderStage(entry) {
  const { ch, sc } = entry;
  const label = sc.visual?.label || 'schematic';
  const L = LABELS[label] || LABELS.schematic;
  const prev = flat[entry.n - 1], next = flat[entry.n + 1];
  $('#stage').innerHTML = `
    <div class="scene-head">
      <span class="crumb">Chapter ${ch.number} · ${esc(ch.title)}</span>
      <h1>${esc(sc.title)}</h1>
      <p class="question">${esc(sc.question)}</p>
    </div>
    <button type="button" class="mobile-jump" id="mobile-jump">Read the explanation ↓</button>
    <div class="scene-card">
      <div class="scene-bar"><span class="title">${esc(sc.visual?.caption || 'Interactive scene')}</span><span class="badge ${label}" title="${esc(L.blurb)}">${L.name}</span></div>
      <div class="scene-host" id="scene-host"></div>
    </div>
    ${sc.status ? `<div class="status-strip">
      <div class="status changes" title="What grows or blows up in this scene"><b>What changes</b>${expand(sc.status.changes)}</div>
      <div class="status bounded" title="What the argument keeps under control"><b>What stays bounded</b>${expand(sc.status.bounded)}</div>
      <div class="status fails" title="What this scene cannot yet deliver, which the next scene addresses"><b>What fails</b>${expand(sc.status.fails)}</div>
    </div>` : ''}
    <div class="scene-nav">
      ${prev ? `<a href="#/${prev.ch.id}/${prev.sc.id}" class="prev">← <span><span class="lbl">Before${prev.ch !== ch ? ` · Chapter ${prev.ch.number}` : ''}</span><br>${esc(prev.sc.title)}</span></a>` : '<span></span>'}
      ${next ? `<a href="#/${next.ch.id}/${next.sc.id}" class="next"><span><span class="lbl">Next${next.ch !== ch ? ` · Chapter ${next.ch.number}` : ''}</span><br>${esc(next.sc.title)}</span> →</a>` : ''}
    </div>
    <div class="kbd-hint"><kbd>←</kbd> <kbd>→</kbd> move between scenes · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> change depth</div>`;
  $('#mobile-jump')?.addEventListener('click', () => $('#explain').scrollIntoView({ behavior: 'smooth', block: 'start' }));
  mountVisual(entry);
  typeset($('#stage'));
}

/* ---------- Explanation ---------- */
function renderExplain(entry) {
  const { ch, sc } = entry;
  const tabs = `<div class="depth-tabs" role="tablist">${DEPTHS.map(([k, l]) => `<button role="tab" data-depth="${k}" aria-selected="${k === depth}">${l}</button>`).join('')}<span class="spacer"></span><span class="eq-tag ${ch.equation}">${{ ns: 'Navier–Stokes', euler: 'Euler', both: 'Both results', meta: 'Context' }[ch.equation]}</span></div>`;
  let body = '';
  if (depth === 'understand') {
    body = `<div class="prose">${expand(sc.understand)}${sc.stage ? stageBlock(sc.stage) : ''}</div>`;
  } else if (depth === 'inspect') {
    body = `<div class="prose">${expand(sc.inspect || '<p>No deeper layer for this scene yet.</p>')}</div>`;
  } else {
    body = verifyBlock(sc);
  }
  const ex = $('#explain');
  ex.innerHTML = tabs + body;
  ex.querySelectorAll('.depth-tabs button[data-depth]').forEach((b) => b.addEventListener('click', () => setDepth(b.dataset.depth)));
  typeset(ex);
  if (window.innerWidth > 820) ex.scrollTop = 0;
}
function stageBlock(st) {
  return `<details class="more stagebox"><summary>This step in four questions <span class="sub">· need · gap · new ingredient · what remains</span></summary><div class="stage-questions">
    <div><b>What do we need?</b>${expand(st.need)}</div>
    <div><b>Why doesn't the previous step provide it?</b>${expand(st.whyNot)}</div>
    <div><b>What new ingredient fixes that?</b>${expand(st.ingredient)}</div>
    <div><b>What still needs proving?</b>${expand(st.remaining)}</div></div></details>`;
}
function srcLine(ref) {
  const s = SOURCES[ref.src];
  if (!s) return `<li><span class="srcname">${esc(ref.src)}</span>${ref.where ? `<span class="where">${esc(ref.where)}</span>` : ''}${ref.note ? `<span class="note">${expand(ref.note)}</span>` : ''}</li>`;
  const name = s.url ? `<a class="srcname" href="${s.url}" target="_blank" rel="noopener">${esc(s.title)}</a>` : `<span class="srcname">${esc(s.title)}</span>`;
  return `<li><span><span class="kind">${esc(s.kind)}</span> ${name}</span>${ref.where ? `<span class="where">${esc(ref.where)}</span>` : ''}${ref.note ? `<span class="note">${expand(ref.note)}</span>` : ''}</li>`;
}
function verifyBlock(sc) {
  const v = sc.verify || {};
  const label = sc.visual?.label || 'schematic';
  const L = LABELS[label] || LABELS.schematic;
  const parts = [];
  parts.push(`<div class="label-note"><span class="badge ${label}">${L.name}</span> — ${esc(L.blurb)}</div>`);
  if (v.statements?.length) parts.push(`<h3>Precise statement${v.statements.length > 1 ? 's' : ''}</h3>` + v.statements.map((s) => `<div class="stmt"><div class="t">${esc(s.title || '')}</div>${expand(s.html)}</div>`).join(''));
  if (v.paper?.length) parts.push(`<h3>Paper references</h3><ul class="refs">${v.paper.map(srcLine).join('')}</ul>`);
  if (v.lean?.length) parts.push(`<h3>Lean declarations <span class="note">(pinned commit <code>${LEAN_COMMIT.slice(0, 10)}</code>)</span></h3><ul class="refs">${v.lean.map((l) => `<li><a class="decl" href="${leanUrl(l.file, l.line)}" target="_blank" rel="noopener">${esc(l.decl)}</a><span class="where">${esc(l.file)}${l.line ? `:${l.line}` : ''}</span>${l.note ? `<span class="note">${expand(l.note)}</span>` : ''}</li>`).join('')}</ul>`);
  if (v.context?.length) parts.push(`<h3>Context sources (not mathematics)</h3><ul class="refs">${v.context.map(srcLine).join('')}</ul>`);
  if (v.limits?.length) parts.push(`<h3>Assumptions and limits</h3><ul class="limits">${v.limits.map((l) => `<li>${expand(l)}</li>`).join('')}</ul>`);
  if (parts.length === 1) parts.push('<p class="note">No verification trail has been written for this scene yet.</p>');
  return `<div class="verify">${parts.join('')}</div>`;
}

/* ---------- Home ---------- */
let heroStop = null;
function renderHome() {
  const h = $('#home');
  h.hidden = false; $('#layout').hidden = true;
  h.innerHTML = `
    <section class="hero">
      <div>
        <h1>${home.title}</h1>
        <p class="lede">${home.lede}</p>
        <p class="depths-line">Every scene has three depths: <b>Understand</b> · <b>Inspect</b> · <b>Verify</b>. Switch with the tabs or the keys 1, 2, 3.</p>
        <div class="cta">
          <a class="btn primary" href="#/${chapters[0].id}">Start the guided trail →</a>
          <a class="btn" href="#/concentration/what-is-claimed?depth=verify">Jump to the Lean statements</a>
        </div>
      </div>
      <div class="hero-visual"><canvas id="hero-canvas" aria-label="Animated schematic of a contracting vortex core"></canvas><div class="cap"><span>A core that shrinks while its speed grows. The whole site is about when, and whether, this picture becomes mathematics.</span><span class="badge schematic" title="${esc(LABELS.schematic.blurb)}">Schematic</span></div></div>
    </section>
    <h2>First: two separate results</h2>
    <p style="color:var(--fg-muted);max-width:70ch">${home.compareIntro}</p>
    <div class="table-wrap"><table class="compare"><thead><tr><th></th><th>Navier–Stokes (forced)</th><th>Euler (unforced)</th></tr></thead><tbody>
      ${home.compare.map((r) => `<tr><td>${expand(r.k)}</td><td class="ns">${expand(r.ns)}</td><td class="eu">${expand(r.euler)}</td></tr>`).join('')}
    </tbody></table></div>
    <h2>The trail</h2>
    <div class="chapter-grid">
      ${chapters.map((c) => `<a class="chapter-card" href="#/${c.id}"><span class="eq-tag ${c.equation}">${{ ns: 'Navier–Stokes', euler: 'Euler', both: 'Both', meta: 'Context' }[c.equation]}</span><div class="num">Chapter ${c.number}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><div class="count">${c.scenes.length} scene${c.scenes.length === 1 ? '' : 's'}</div></a>`).join('')}
    </div>
    <h2>How to read this</h2>
    <div class="howto">
      <div><h3>Understand</h3><p>Plain language and a visual intuition. Enough to follow the storyline.</p></div>
      <div><h3>Inspect</h3><p>The equations and estimates, and why each step works.</p></div>
      <div><h3>Verify</h3><p>Precise statements, paper references, Lean declarations at a pinned commit, and the limits of each scene.</p></div>
      <div><h3>The strip under each scene</h3><p><b>What changes</b> is what grows or blows up. <b>What stays bounded</b> is what the argument controls. <b>What fails</b> is what the scene cannot yet deliver, which the next scene addresses.</p></div>
      ${Object.entries(LABELS).map(([k, v]) => `<div><h3><span class="badge ${k}">${v.name}</span></h3><p>${esc(v.blurb)}</p></div>`).join('')}
    </div>
    <p class="fine">${home.fine}</p>`;
  typeset(h);
  drawHero();
}
function drawHero() {
  if (heroStop) { heroStop(); heroStop = null; }
  const canvas = $('#hero-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, devicePixelRatio || 1);
  let w = 0, h = 0;
  const size = () => { w = canvas.parentElement.clientWidth; h = Math.max(260, Math.min(360, w * 0.62)); canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size();
  const ro = new ResizeObserver(size); ro.observe(canvas.parentElement);
  const N = 220, parts = Array.from({ length: N }, (_, i) => ({ r: Math.pow(Math.random(), 0.7) * 1.9 + 0.08, a: Math.random() * Math.PI * 2, s: 0.6 + Math.random() * 0.8 }));
  let t = 0, raf = 0, running = true;
  const frame = (now) => {
    if (!running) return;
    t += 1 / 60;
    const th = theme();
    const period = 11; const phase = (t % period) / period; // 0..1 approach, then reset
    const s = Math.max(1e-3, 1 - Math.min(0.999, Math.pow(phase, 0.75) * 1.0));// 'T - t'
    const width = Math.pow(s, 0.5), speed = Math.pow(s, -0.5);
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.5, R0 = Math.min(w, h) * 0.42;
    const rw = Math.max(3, R0 * width);
    // rings
    for (let k = 40; k >= 1; k--) {
      const rho = (k / 40) * 2.6; const v = rho * Math.exp((1 - rho * rho) / 2);
      const inten = v * Math.min(1, 0.25 + Math.log10(speed) / 2.2);
      ctx.fillStyle = heat(inten); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(cx, cy, rho * rw, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // particles
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const p of parts) {
      const rho = p.r; const v = rho * Math.exp((1 - rho * rho) / 2);
      const om = Math.min(6, (v / Math.max(rho, 0.05)) * speed * 0.25) * p.s;
      p.a += om / 60;
      const x = cx + Math.cos(p.a) * rho * rw, y = cy + Math.sin(p.a) * rho * rw;
      ctx.beginPath(); ctx.arc(x, y, rho < 1.6 ? 1.6 : 1.1, 0, Math.PI * 2); ctx.fill();
    }
    // annulus
    ctx.strokeStyle = th.faint; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 1.7 * rw, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // captions
    labelPill(ctx, 'a core that shrinks while it spins faster', 10, 16, { color: th.fg });
    labelPill(ctx, 'dashed ring: the shear annulus around it', 10, 36, { color: th.muted, size: 11 });
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  heroStop = () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); };
}

/* ---------- Route ---------- */
function route() {
  const r = parseHash();
  renderTopbar(r.entry);
  document.documentElement.dataset.view = r.home ? 'home' : 'scene';
  if (r.home) { current = null; if (mounted) { try { mounted.instance?.destroy?.(); } catch { /* */ } mounted.ui.dispose(); mounted = null; } renderHome(); document.title = 'Blowup Explorer — finite-time singularities in Navier–Stokes and Euler'; window.scrollTo(0, 0); return; }
  if (heroStop) { heroStop(); heroStop = null; }
  $('#home').hidden = true; $('#layout').hidden = false;
  if (r.dev) { // developer preview: #/dev/<sceneKey>  — mounts a scene with default params
    const q = new URLSearchParams((location.hash.split('?')[1] || ''));
    let params = {}; try { params = q.get('params') ? JSON.parse(q.get('params')) : {}; } catch { /* ignore */ }
    const entry = { ch: { id: 'dev', number: 0, title: 'Developer preview', equation: 'meta', scenes: [] }, sc: { id: r.dev, title: `Scene preview: ${r.dev}`, question: 'Developer preview of a single scene with default parameters.', visual: { scene: r.dev, label: 'schematic', params }, understand: '<p>Developer preview. Pass <code>?params=&#123;…&#125;</code> (URL-encoded JSON) to try parameters.</p>' }, i: 0, n: -1 };
    current = entry; $('#trail').innerHTML = ''; renderStage(entry); renderExplain(entry); return;
  }
  const entry = r.entry; current = entry;
  visited.add(`${entry.ch.id}/${entry.sc.id}`); store.set('bx-visited', [...visited]);
  renderTrail(entry); renderStage(entry); renderExplain(entry);
  $('#progress .progress-bar').style.width = `${((entry.n + 1) / flat.length) * 100}%`;
  document.title = `${entry.sc.title} — ${entry.ch.title} — Blowup Explorer`;
  $('#trail').classList.remove('open');
  window.scrollTo(0, 0);
}
document.addEventListener('keydown', (e) => {
  if (!current) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (['input', 'select', 'textarea', 'button'].includes(tag) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'ArrowRight') { const n = flat[current.n + 1]; if (n) go(n.ch.id, n.sc.id); }
  else if (e.key === 'ArrowLeft') { const p = flat[current.n - 1]; if (p) go(p.ch.id, p.sc.id); }
  else if (e.key === '1') setDepth('understand'); else if (e.key === '2') setDepth('inspect'); else if (e.key === '3') setDepth('verify');
});
route();
