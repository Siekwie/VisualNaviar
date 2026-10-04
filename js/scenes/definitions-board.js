// Source-quoted board of Lean definitions. Left: a list of the definitions from the reference statements;
// right: the selected one with its Lean text verbatim (as passed in params, copied from the pinned commit),
// its plain meaning, the subtlety it carries, and a link to file:line. Optionally shows formalization.yaml's
// paper ↔ Lean alignment table underneath. Not a visualization: nothing is computed.
import { leanUrl } from '../../content/sources.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LEVELS = {
  harmless: { cls: 'ok', label: 'harmless' },
  note: { cls: 'warn', label: 'worth knowing' },
  choice: { cls: 'ns', label: 'a real choice' },
};
const EQ = { ns: 'Navier–Stokes', euler: 'Euler' };
const WRAP = 'word-break:break-word;overflow-wrap:anywhere';

export default {
  id: 'definitions-board', label: 'source-quoted',
  mount(host, params, ui) {
    params = params || {};
    const defs = Array.isArray(params.defs) ? params.defs : [];
    const root = document.createElement('div');
    root.className = 'scene-html';
    ui.canvasWrap.appendChild(root);
    let filter = params.filter || 'all';
    let sel = params.selected || (defs[0] ? defs[0].id : null);
    const narrow = () => (root.clientWidth || 640) < 560;
    let lastNarrow = narrow();

    const render = () => {
      const shown = defs.filter((d) => filter === 'all' || d.eq === filter);
      const list = shown.map((d) => {
        const lv = LEVELS[d.level] || LEVELS.note;
        return `<div class="item${sel === d.id ? ' sel' : ''}" data-id="${esc(d.id)}" role="button" tabindex="0" aria-pressed="${sel === d.id}">
          <code style="display:block;font-size:11.5px;margin-bottom:4px;${WRAP}">${esc(d.name)}</code>
          <span class="tag ${d.eq}">${EQ[d.eq] || ''}</span><span class="tag ${lv.cls}">${lv.label}</span>
        </div>`;
      }).join('');
      const d = defs.find((x) => x.id === sel);
      const lv = d ? (LEVELS[d.level] || LEVELS.note) : null;
      const detail = d ? `<div class="card ${d.eq || ''}">
          <h4 style="${WRAP}"><code>${esc(d.name)}</code></h4>
          <p>${d.plain}</p>
          <pre>${esc(d.lean)}</pre>
          <p style="color:var(--fg)"><b class="tag ${lv.cls}">${lv.label}</b> ${d.subtlety}</p>
          <p class="muted" style="font-size:12px;margin:0"><a href="${leanUrl(d.file, d.line)}" target="_blank" rel="noopener" style="font-family:var(--mono)">${esc(d.file)}:${d.line} ↗</a> · Lean text verbatim at the pinned commit</p>
        </div>` : '<div class="card"><p>Select a definition.</p></div>';
      const al = Array.isArray(params.alignment) && params.alignment.length ? `<div class="card" style="margin-top:12px">
          <h4>formalization.yaml · alignment (paper ↔ Lean)</h4>
          <div class="scene-table" style="padding:0"><table>
            <thead><tr><th>Paper (as named in the YAML)</th><th>Lean declaration</th><th>Module</th><th>Status</th></tr></thead>
            <tbody>${params.alignment.map((a) => `<tr><td style="width:auto;color:var(--fg)">${esc(a.source)}</td><td class="${a.eq || ''}"><code style="${WRAP}">${esc(a.lean)}</code></td><td>${esc(a.module)}</td><td><span class="tag ok">${esc(a.status)}</span></td></tr>`).join('')}</tbody>
          </table></div>
          <p class="muted" style="margin:8px 0 0;font-size:12.5px">The paper numbering is quoted from the YAML; this guide has not confirmed it against the PDFs.</p>
        </div>` : '';
      const cols = narrow() ? '1fr' : 'minmax(220px,1fr) minmax(0,1.9fr)';
      root.innerHTML = `<div style="display:grid;grid-template-columns:${cols};gap:12px;align-items:start">
          <div class="lane" style="min-width:0"><h4>Definitions · click one</h4>${list || '<p class="muted">None for this filter.</p>'}</div>
          <div data-detail style="min-width:0;scroll-margin-top:64px">${detail}</div>
        </div>${al}`;
      root.querySelectorAll('.item[data-id]').forEach((n) => {
        const pick = () => {
          sel = n.dataset.id; render();
          const f = root.querySelector(`.item[data-id="${CSS.escape(sel)}"]`); if (f) f.focus({ preventScroll: true });
          const d = root.querySelector('[data-detail]');
          if (d) { const r = d.getBoundingClientRect(); if (r.top < 60 || r.top > window.innerHeight - 120) d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        };
        n.addEventListener('click', pick);
        n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      if (window.renderMathInElement) import('../math.js').then((m) => m.typeset(root)).catch(() => {});
    };
    const ro = new ResizeObserver(() => { const n = narrow(); if (n !== lastNarrow) { lastNarrow = n; render(); } });
    ro.observe(root);
    ui.onDispose(() => ro.disconnect());
    ui.select({
      label: 'Show definitions for', value: filter,
      options: [{ value: 'all', label: 'Both equations' }, { value: 'ns', label: 'Navier–Stokes (ComparatorChallenges/NavierStokes.lean)' }, { value: 'euler', label: 'Euler (ComparatorChallenges/Euler.lean)' }],
      onChange: (v) => { filter = v; if (!defs.some((d) => d.id === sel && (v === 'all' || d.eq === v))) { const first = defs.find((d) => v === 'all' || d.eq === v); sel = first ? first.id : null; } render(); },
    });
    render();
    if (params.note) ui.note(params.note);
    return { destroy() {} };
  },
};
