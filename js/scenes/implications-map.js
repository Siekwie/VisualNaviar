// Four lanes of consequence, kept apart. Schematic: the lanes are an editorial structure, not a computed
// object. All text comes from `params.lanes` (content/ch5-implications.js); sources resolve via the registry.
import { SOURCES, leanUrl } from '../../content/sources.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const refHtml = (refs = []) => refs.map((r) => {
  if (r.src) { const s = SOURCES[r.src]; return s ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.short || s.title)}</a>` : esc(r.src); }
  if (r.lean) return `<a href="${leanUrl(r.lean.file, r.lean.line)}" target="_blank" rel="noopener"><code>${esc(r.lean.decl || r.lean.file)}</code></a>`;
  return '';
}).filter(Boolean).join(' · ');

export default {
  id: 'implications-map', label: 'schematic',
  mount(host, params, ui) {
    const lanes = params.lanes || [];
    const wrap = document.createElement('div'); wrap.className = 'scene-html';
    ui.canvasWrap.appendChild(wrap);
    let sel = null;            // { lane, i }
    let focus = 'all';         // lane id or 'all'
    let refocus = null;        // element key to refocus after a keyboard selection

    const detailHtml = () => {
      if (!sel) return `<div class="detail muted">${params.prompt || 'Click an item for a one-paragraph note, its evidence tag and its source.'}</div>`;
      const lane = lanes.find((l) => l.id === sel.lane); const it = lane && lane.items[sel.i];
      if (!it) return '';
      const refs = refHtml(it.refs);
      return `<div class="detail"><span class="tag ${lane.tag || ''}">${esc(lane.tagLabel || lane.title)}</span> <b>${it.label}</b><p style="margin:8px 0 6px">${it.detail || ''}</p>${refs ? `<p class="muted" style="margin:0;font-size:12.5px">Source${it.refs.length > 1 ? 's' : ''}: ${refs}</p>` : `<p class="muted" style="margin:0;font-size:12.5px">${esc(it.noSource || 'No source: this is the guide’s own flag.')}</p>`}</div>`;
    };
    const render = () => {
      const shown = lanes.filter((l) => focus === 'all' || l.id === focus);
      wrap.innerHTML = `<div class="lanes">${shown.map((l) => `<div class="lane"><h4>${esc(l.title)}</h4>${l.intro ? `<p class="muted" style="font-size:12px;margin:0 0 8px">${l.intro}</p>` : ''}${(l.items || []).map((it, i) => `<div class="item ${sel && sel.lane === l.id && sel.i === i ? 'sel' : ''}" role="button" tabindex="0" aria-pressed="${String(!!(sel && sel.lane === l.id && sel.i === i))}" data-lane="${l.id}" data-i="${i}"><span class="tag ${l.tag || ''}">${esc(l.tagLabel || '')}</span> ${it.label}</div>`).join('')}</div>`).join('')}</div>${detailHtml()}`;
      wrap.querySelectorAll('.item[data-lane]').forEach((el) => {
        const pick = (viaKey) => {
          const lane = el.dataset.lane, i = Number(el.dataset.i);
          sel = sel && sel.lane === lane && sel.i === i ? null : { lane, i };
          refocus = viaKey ? `${lane}/${i}` : null;
          render();
        };
        el.addEventListener('click', () => pick(false));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(true); } });
      });
      if (refocus) { const [lane, i] = refocus.split('/'); wrap.querySelector(`.item[data-lane="${lane}"][data-i="${i}"]`)?.focus(); refocus = null; }
      import('../math.js').then((m) => m.typeset(wrap));
    };
    ui.select({
      label: 'Focus', value: 'all',
      options: [{ value: 'all', label: 'All four lanes' }, ...lanes.map((l) => ({ value: l.id, label: l.title }))],
      hint: 'On a narrow screen, focus one lane at a time.',
      onChange: (v) => { focus = v; render(); },
    });
    render();
    if (params.note) ui.note(params.note);
    return { destroy() {} };
  },
};
