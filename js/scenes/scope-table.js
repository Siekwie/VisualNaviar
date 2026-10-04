// A side-by-side statement table with an optional "show the Lean wording" layer. Source-quoted, not a visualization.
export default {
  id: 'scope-table', label: 'source-quoted',
  mount(host, params, ui) {
    const rows = params.rows || [];
    const wrap = document.createElement('div'); wrap.className = 'scene-table';
    ui.canvasWrap.appendChild(wrap);
    let showLean = false, hl = null;
    const render = () => {
      wrap.innerHTML = `<table><thead><tr><th></th><th>${params.left || 'Navier–Stokes'}</th><th>${params.right || 'Euler'}</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${hl === i ? 'hl' : ''}" data-i="${i}"><td>${r.k}</td><td class="ns">${r.a}${showLean && r.aLean ? `<span class="lean">${r.aLean}</span>` : ''}</td><td class="eu">${r.b}${showLean && r.bLean ? `<span class="lean">${r.bLean}</span>` : ''}</td></tr>`).join('')}</tbody></table>`;
      wrap.querySelectorAll('tr[data-i]').forEach((tr) => tr.addEventListener('click', () => { hl = hl === Number(tr.dataset.i) ? null : Number(tr.dataset.i); render(); }));
      if (window.renderMathInElement) import('../math.js').then((m) => m.typeset(wrap));
    };
    ui.toggle({ label: 'Show the Lean wording under each cell', value: false, onChange: (v) => { showLean = v; render(); } });
    render();
    if (params.note) ui.note(params.note);
    return { destroy() {} };
  },
};
