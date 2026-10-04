// A board of claims, each with a status tag and the source that makes it. Source-quoted, not a visualization.
// The key interaction is the toggle that hides everything except the Lean-checked items.
import { SOURCES, leanUrl } from '../../content/sources.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const refHtml = (refs = []) => refs.map((r) => {
  if (r.src) { const s = SOURCES[r.src]; return s ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.short || s.title)}</a>` : esc(r.src); }
  if (r.lean) return `<a href="${leanUrl(r.lean.file, r.lean.line)}" target="_blank" rel="noopener"><code>${esc(r.lean.decl || r.lean.file)}</code></a>`;
  if (r.url) return `<a href="${r.url}" target="_blank" rel="noopener">${esc(r.label || r.url)}</a>`;
  return '';
}).filter(Boolean).join(' · ');

export default {
  id: 'claims-board', label: 'source-quoted',
  mount(host, params, ui) {
    const statuses = params.statuses || {};
    const claims = params.claims || [];
    const machineKey = params.machineChecked || 'established';
    const wrap = document.createElement('div'); wrap.className = 'scene-html';
    ui.canvasWrap.appendChild(wrap);
    let onlyChecked = false, filter = 'all', sel = null, refocus = null;

    const visible = () => claims.filter((c) => (onlyChecked ? c.status === machineKey : (filter === 'all' || c.status === filter)));
    const render = () => {
      const shown = visible();
      const nChecked = claims.filter((c) => c.status === machineKey).length;
      const legend = `<div class="row" style="margin-bottom:10px">${Object.entries(statuses).map(([k, s]) => `<span class="tag ${s.cls || ''}">${esc(s.label)}</span><span class="muted" style="font-size:12px;margin-right:8px">${claims.filter((c) => c.status === k).length}</span>`).join('')}</div>`;
      const banner = onlyChecked
        ? `<p class="muted" style="margin:0 0 10px;font-size:13px"><b>${nChecked} of ${claims.length}</b> claims are machine-checked. ${params.checkedNote || 'Everything hidden is interpretation, attribution or process.'}</p>`
        : '';
      const cards = shown.map((c) => {
        const s = statuses[c.status] || {};
        const i = claims.indexOf(c);
        return `<div class="card ${s.cls || ''} ${sel === i ? 'sel' : ''}" role="button" tabindex="0" aria-pressed="${sel === i}" data-i="${i}"><span class="tag ${s.cls || ''}">${esc(s.label || c.status)}</span><h4 style="margin-top:6px">${c.claim}</h4><p>${c.by || ''}</p></div>`;
      }).join('');
      const c = sel !== null ? claims[sel] : null;
      const detail = c && shown.includes(c)
        ? `<div class="detail"><span class="tag ${(statuses[c.status] || {}).cls || ''}">${esc((statuses[c.status] || {}).label || c.status)}</span> <b>${c.claim}</b><div style="margin:8px 0 6px">${c.detail || ''}</div>${refHtml(c.refs) ? `<p class="muted" style="margin:0;font-size:12.5px">Source${(c.refs || []).length > 1 ? 's' : ''}: ${refHtml(c.refs)}</p>` : ''}</div>`
        : `<div class="detail muted">${params.prompt || 'Click a claim to read its wording, who makes it, and the source.'}</div>`;
      wrap.innerHTML = legend + banner + (shown.length ? `<div class="grid">${cards}</div>` : '<p class="muted">Nothing matches this filter.</p>') + detail;
      wrap.querySelectorAll('.card[data-i]').forEach((el) => {
        const pick = (viaKey) => { const i = Number(el.dataset.i); sel = sel === i ? null : i; refocus = viaKey ? i : null; render(); };
        el.addEventListener('click', () => pick(false));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(true); } });
      });
      if (refocus !== null) { wrap.querySelector(`.card[data-i="${refocus}"]`)?.focus(); refocus = null; }
      import('../math.js').then((m) => m.typeset(wrap));
    };
    ui.toggle({ label: params.toggleLabel || 'Show only what is machine-checked', value: false, hint: params.toggleHint || 'Hides every claim except those checked by Lean at the pinned commit.', onChange: (v) => { onlyChecked = v; render(); } });
    ui.select({
      label: 'Status', value: 'all',
      options: [{ value: 'all', label: 'All statuses' }, ...Object.entries(statuses).map(([k, s]) => ({ value: k, label: s.label }))],
      onChange: (v) => { filter = v; render(); },
    });
    render();
    if (params.note) ui.note(params.note);
    return { destroy() {} };
  },
};
