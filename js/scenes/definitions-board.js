// Source-quoted board of Lean definitions. Each card is one definition from the reference statements;
// clicking it shows the Lean text verbatim (as passed in params, copied from the pinned commit), its
// plain meaning, the subtlety it carries, and a link to file:line. Optionally shows formalization.yaml's
// paper ↔ Lean alignment table. Not a visualization: nothing is computed.
import { leanUrl } from '../../content/sources.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LEVELS = {
  harmless: { cls: 'ok', label: 'harmless' },
  note: { cls: 'warn', label: 'worth knowing' },
  choice: { cls: 'ns', label: 'a real choice' },
};
const EQ = { ns: 'Navier–Stokes', euler: 'Euler' };

export default {
  id: 'definitions-board', label: 'source-quoted',
  mount(host, params, ui) {
    const defs = Array.isArray(params.defs) ? params.defs : [];
    const root = document.createElement('div');
    root.className = 'scene-html';
    ui.canvasWrap.appendChild(root);
    let filter = params.filter || 'all';
    let sel = params.selected || (defs[0] ? defs[0].id : null);

    const render = () => {
      const shown = defs.filter((d) => filter === 'all' || d.eq === filter);
      const cards = shown.map((d) => {
        const lv = LEVELS[d.level] || LEVELS.note;
        return `<div class="card ${d.eq || ''}${sel === d.id ? ' sel' : ''}" data-id="${esc(d.id)}" role="button" tabindex="0" aria-pressed="${sel === d.id}" style="cursor:pointer">
          <h4><code>${esc(d.name)}</code></h4>
          <p>${d.plain}</p>
          <span class="tag ${d.eq}">${EQ[d.eq] || ''}</span><span class="tag ${lv.cls}">${lv.label}</span>
        </div>`;
      }).join('');
      const d = defs.find((x) => x.id === sel);
      const lv = d ? (LEVELS[d.level] || LEVELS.note) : null;
      const detail = d ? `<div class="detail">
          <div class="row" style="justify-content:space-between">
            <b><code>${esc(d.name)}</code></b>
            <a href="${leanUrl(d.file, d.line)}" target="_blank" rel="noopener" style="font-family:var(--mono);font-size:12px">${esc(d.file)}:${d.line} ↗</a>
          </div>
          <pre>${esc(d.lean)}</pre>
          <p><b class="tag">Plain meaning</b> ${d.plain}</p>
          <p><b class="tag ${lv.cls}">${lv.label}</b> ${d.subtlety}</p>
        </div>` : '';
      const al = Array.isArray(params.alignment) && params.alignment.length ? `<div class="detail">
          <h4 style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--fg-faint)">formalization.yaml · alignment (paper ↔ Lean)</h4>
          <div class="scene-table" style="padding:0"><table>
            <thead><tr><th>Paper (as named in the YAML)</th><th>Lean declaration</th><th>Module</th><th>Status</th></tr></thead>
            <tbody>${params.alignment.map((a) => `<tr><td style="width:auto;color:var(--fg)">${esc(a.source)}</td><td class="${a.eq || ''}"><code>${esc(a.lean)}</code></td><td>${esc(a.module)}</td><td><span class="tag ok">${esc(a.status)}</span></td></tr>`).join('')}</tbody>
          </table></div>
          <p class="muted" style="margin:8px 0 0;font-size:12.5px">The paper numbering is quoted from the YAML; this guide has not independently confirmed it against the PDFs.</p>
        </div>` : '';
      root.innerHTML = `<div class="grid">${cards}</div>${detail}${al}`;
      root.querySelectorAll('.card[data-id]').forEach((n) => {
        const pick = () => { sel = n.dataset.id; render(); const f = root.querySelector(`.card[data-id="${CSS.escape(sel)}"]`); if (f) f.focus(); };
        n.addEventListener('click', pick);
        n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      if (window.renderMathInElement) import('../math.js').then((m) => m.typeset(root)).catch(() => {});
    };
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
