// Schematic, data-driven flowchart of a non-existence argument. params.steps: [{id, title, text, detail, kind}],
// params.branches optional: [{from, to, label}] drawn as side notes. Clicking a step reveals its detail.
export default {
  id: 'breakdown-logic', label: 'schematic',
  mount(host, params, ui) {
    const steps = params.steps || DEFAULT_STEPS;
    const wrap = document.createElement('div'); wrap.className = 'scene-html'; ui.canvasWrap.appendChild(wrap);
    let sel = params.initial ?? 0;
    const render = () => {
      wrap.innerHTML = `<div class="flow">${steps.map((s, i) => `
        <div class="flow-step ${s.kind || ''} ${i === sel ? 'sel' : ''}" data-i="${i}" role="button" tabindex="0">
          <span class="flow-num">${i + 1}</span>
          <div><div class="flow-title">${s.title}</div><div class="flow-text">${s.text}</div></div>
        </div>${i < steps.length - 1 ? `<div class="flow-arrow ${s.arrow ? 'has-label' : ''}">${s.arrow ? `<span>${s.arrow}</span>` : '↓'}</div>` : ''}`).join('')}
      </div>
      <div class="detail flow-detail"><b>${steps[sel].title}</b>${steps[sel].detail || ''}</div>`;
      wrap.querySelectorAll('.flow-step').forEach((el) => {
        const pick = () => { sel = Number(el.dataset.i); render(); };
        el.addEventListener('click', pick); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      import('../math.js').then((m) => m.typeset(wrap));
    };
    render();
    if (params.note) ui.note(params.note);
    return { destroy() {} };
  },
};

const DEFAULT_STEPS = [
  { title: 'Construct a solution on [0, T)', text: 'Build $(u,p)$ explicitly and define the force as the residual, $f := R[u,p]$.', detail: '<p>Everything about the construction goes into making $f$ smooth on $\\R^3\\times[0,\\infty)$, with decay, including across $t = T$ where $u$ ceases to exist.</p>', kind: 'ns' },
  { title: 'Show a norm of $u$ blows up as $t \\to T$', text: 'The peak speed in a fixed ball around the collapse point becomes infinite.', detail: '<p>Because the singularity is localized, the blowup is already visible on a compact set in space, which is what step 5 needs.</p>', kind: 'bad' },
  { title: 'Suppose a global smooth solution $(v,q)$ existed', text: 'Same data $u_0$, same force $f$, in the class of the theorem (smooth, bounded energy / periodic).', arrow: 'uniqueness', detail: '<p>This is the hypothesis to be refuted. The class is the one spelled out in the Lean structures: smooth on $\\R^3\\times[0,\\infty)$, divergence-free, square-integrable with uniformly bounded energy on the whole space; periodic velocity and pressure on the torus.</p>', kind: 'meta' },
  { title: 'Uniqueness: $v = u$ on $[0,T)$', text: 'Two smooth solutions in the class with the same data and force coincide while both exist.', detail: '<p>A weak–strong or energy-type uniqueness argument run inside the class. This is why the solution class in the statement matters: uniqueness is proved for that class.</p>', kind: 'ok', arrow: 'smoothness up to $t = T$' },
  { title: 'Contradiction', text: '$v$ is continuous on the compact set $[0,T]\\times\\overline{B}$, hence bounded there; but $u = v$ is unbounded on it.', detail: '<p>So no such $(v,q)$ exists. The theorem is a non-existence statement, obtained from one explicit blowing-up solution plus uniqueness.</p>', kind: 'bad' },
];
