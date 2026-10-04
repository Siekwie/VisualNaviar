// An attributed timeline. Source-quoted: every entry names who reported it and carries a basis tag
// (checked in the repository clone / reported by a named outlet / contested between parties).
import { SOURCES, leanUrl } from '../../content/sources.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const refHtml = (refs = []) => refs.map((r) => {
  if (r.src) { const s = SOURCES[r.src]; return s ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.short || s.title)}</a>` : esc(r.src); }
  if (r.lean) return `<a href="${leanUrl(r.lean.file, r.lean.line)}" target="_blank" rel="noopener"><code>${esc(r.lean.decl || r.lean.file)}</code></a>`;
  return '';
}).filter(Boolean).join(' · ');
const BASIS = { checked: { cls: 'ok', label: 'checked in clone' }, reported: { cls: '', label: 'reported' }, contested: { cls: 'warn', label: 'contested' } };

export default {
  id: 'timeline', label: 'source-quoted',
  mount(host, params, ui) {
    const events = (params.events || []).slice().sort((a, b) => String(a.when).localeCompare(String(b.when)));
    const filters = params.filters || [{ value: 'all', label: 'Everything' }];
    const wrap = document.createElement('div'); wrap.className = 'scene-html';
    ui.canvasWrap.appendChild(wrap);
    let filter = 'all'; const open = new Set(); let refocus = null;

    const matches = (e) => filter === 'all' || e.kind === filter || e.basis === filter;
    const render = () => {
      const shown = events.filter(matches);
      const legend = `<div class="row" style="margin-bottom:10px;font-size:12px">${Object.values(BASIS).map((b) => `<span class="tag ${b.cls}">${esc(b.label)}</span>`).join('')}<span class="muted">${params.legend || 'Dot colour: amber = Euler-type mathematics, blue = the Navier–Stokes result, yellow = the dispute, green = repository facts, grey = institutions and press.'}</span></div>`;
      const items = shown.map((e) => {
        const k = events.indexOf(e); const b = BASIS[e.basis] || BASIS.reported; const isOpen = open.has(k);
        return `<li class="${e.cls || ''}" data-k="${k}"><span class="when">${esc(e.label || e.when)} · <span class="tag ${b.cls}">${esc(b.label)}</span></span><div role="button" tabindex="0" aria-expanded="${isOpen}" data-k="${k}" style="cursor:pointer"><span class="who">${e.who || ''}</span> — ${e.what || ''}${isOpen ? '' : ' <span class="muted">▸</span>'}</div>${isOpen ? `<div class="detail" style="margin-top:8px;padding-top:8px">${e.detail || ''}${refHtml(e.refs) ? `<p class="muted" style="margin:6px 0 0;font-size:12.5px">Source${(e.refs || []).length > 1 ? 's' : ''}: ${refHtml(e.refs)}</p>` : ''}</div>` : ''}</li>`;
      }).join('');
      wrap.innerHTML = legend + (shown.length ? `<ol class="tl">${items}</ol>` : '<p class="muted">Nothing matches this filter.</p>');
      wrap.querySelectorAll('[role="button"][data-k]').forEach((el) => {
        const pick = (viaKey) => { const k = Number(el.dataset.k); if (open.has(k)) open.delete(k); else open.add(k); refocus = viaKey ? k : null; render(); };
        el.addEventListener('click', () => pick(false));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(true); } });
      });
      if (refocus !== null) { wrap.querySelector(`[role="button"][data-k="${refocus}"]`)?.focus(); refocus = null; }
      import('../math.js').then((m) => m.typeset(wrap));
    };
    ui.select({ label: 'Show', value: 'all', options: filters, onChange: (v) => { filter = v; render(); } });
    ui.button({ label: 'Expand all', onClick: () => { events.forEach((_, k) => open.add(k)); render(); } });
    ui.button({ label: 'Collapse all', onClick: () => { open.clear(); render(); } });
    render();
    if (params.note) ui.note(params.note);
    return { destroy() {} };
  },
};
