// Numerically computed: sizes of the three Lean libraries at the pinned commit. The numbers were produced
// with shell commands run in a clone of openai/NavierStokesAndEuler at f9e8bc5b (the exact commands are
// listed in the chapter's Inspect tab) and are hard-coded here. They count text, not mathematics.

const COMMIT = 'f9e8bc5b38b6e212696e8a30e3e91517af887bbd';

const LIBS = [
  { key: 'ns', name: 'NavierStokes/', cls: '', files: 816, lines: 429279, theorem: 27272, lemma: 1, def: 7525, structure: 524, instance: 68, abbrev: 796, mathlib: 270, sorry: 0 },
  { key: 'euler', name: 'Euler/', cls: 'euler', files: 1839, lines: 211578, theorem: 11228, lemma: 28, def: 3295, structure: 129, instance: 1510, abbrev: 103, mathlib: 168, sorry: 0 },
  { key: 'ref', name: 'ComparatorChallenges/', cls: 'meta', files: 2, lines: 472, theorem: 9, lemma: 0, def: 7, structure: 15, instance: 0, abbrev: 0, mathlib: 2, sorry: 4 },
];
const ROOT = { files: 2, lines: 3 }; // NavierStokes.lean and Euler.lean, import-only root modules
const LONGEST = [
  ['Euler/EulerProof.lean', 20755, 'euler'],
  ['NavierStokes/CorrectionStep.lean', 9849, 'ns'],
  ['NavierStokes/CorrectionInitializationNoOptions.lean', 5573, 'ns'],
  ['NavierStokes/CorrectionInitialization.lean', 5562, 'ns'],
  ['NavierStokes/VariableGaugeMean.lean', 3004, 'ns'],
  ['NavierStokes/InitialPhysicalData.lean', 2854, 'ns'],
  ['NavierStokes/BaseResidual.lean', 2807, 'ns'],
  ['NavierStokes/NominalProfile.lean', 2679, 'ns'],
];
const METRICS = {
  lines: { label: 'Lines of Lean (wc -l)', unit: 'lines' },
  files: { label: '.lean files', unit: 'files' },
  theorem: { label: 'theorem declarations', unit: 'theorem' },
  def: { label: 'def declarations', unit: 'def' },
  structure: { label: 'structure declarations', unit: 'structure' },
  instance: { label: 'instance declarations', unit: 'instance' },
  mathlib: { label: 'files importing Mathlib directly', unit: 'files' },
};

const n = (v) => Number(v).toLocaleString('en-US');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default {
  id: 'repo-stats', label: 'numerically-computed',
  mount(host, params, ui) {
    const libs = Array.isArray(params.libs) && params.libs.length ? params.libs : LIBS;
    const longest = Array.isArray(params.longest) && params.longest.length ? params.longest : LONGEST;
    let metric = params.metric && METRICS[params.metric] ? params.metric : 'lines';

    const root = document.createElement('div');
    root.className = 'scene-html';
    ui.canvasWrap.appendChild(root);

    const totals = libs.reduce((a, l) => { for (const k of Object.keys(METRICS)) a[k] = (a[k] || 0) + (l[k] || 0); return a; }, {});
    const ro = ui.readouts([
      { key: 'files', label: 'Lean files', unit: 'incl. 2 root modules' },
      { key: 'lines', label: 'Lines', unit: 'incl. comments and blanks' },
      { key: 'thm', label: 'theorem declarations', unit: 'all three libraries' },
      { key: 'sorry', label: 'sorry in proof libraries', unit: '4 placeholders in the reference' },
    ]);
    ro.update({
      files: { value: n(totals.files + ROOT.files), trend: 'flat' },
      lines: { value: n(totals.lines + ROOT.lines), trend: 'flat' },
      thm: { value: n(totals.theorem), trend: 'flat' },
      sorry: { value: '0', trend: 'flat' },
    });

    const bar = (label, value, max, cls, title) => {
      const pct = max > 0 ? Math.max(0.6, (value / max) * 100) : 0;
      const fill = cls === 'meta' ? ' style="width:' + pct.toFixed(1) + '%;background:var(--meta)"' : ' style="width:' + pct.toFixed(1) + '%"';
      return `<div class="bar ${cls === 'euler' ? 'euler' : ''}" style="grid-template-columns:minmax(110px,38%) 1fr 72px"${title ? ` title="${esc(title)}"` : ''}><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${label}</span><i${fill}></i><b>${n(value)}</b></div>`;
    };

    const render = () => {
      const m = METRICS[metric];
      const max = Math.max(...libs.map((l) => l[metric] || 0));
      const maxLong = Math.max(...longest.map((f) => f[1]));
      root.innerHTML = `
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
          <div class="card">
            <h4>${esc(m.label)} per library</h4>
            <div class="bars">${libs.map((l) => bar(`<span class="tag ${l.cls === 'euler' ? 'euler' : l.cls === 'meta' ? '' : 'ns'}">${l.cls === 'meta' ? 'ref' : l.cls === 'euler' ? 'Euler' : 'NS'}</span>${esc(l.name)}`, l[metric] || 0, max, l.cls, `${l.name}: ${n(l[metric] || 0)} ${m.unit}`)).join('')}</div>
            <p class="muted" style="margin:8px 0 0;font-size:12px">${metric === 'theorem' ? 'Plus <code>lemma</code>: 1 (NavierStokes/), 28 (Euler/). <code>abbrev</code> and <code>instance</code> are not counted here.' : metric === 'mathlib' ? 'The other files import project modules; Mathlib is reached transitively.' : metric === 'lines' ? 'Root modules NavierStokes.lean and Euler.lean add 3 lines.' : metric === 'files' ? 'Plus the two import-only root modules.' : 'Keyword at the start of a line, after optional attributes and modifiers.'}</p>
          </div>
          <div class="card">
            <h4>The eight longest files</h4>
            <div class="bars">${longest.map((f) => bar(`<span class="tag ${f[2] === 'euler' ? 'euler' : 'ns'}">${f[2] === 'euler' ? 'Euler' : 'NS'}</span>${esc(f[0].split('/').pop())}`, f[1], maxLong, f[2], f[0])).join('')}</div>
            <p class="muted" style="margin:8px 0 0;font-size:12px">Median file in the two proof libraries: 114 lines. 119 files exceed 1,000 lines.</p>
          </div>
        </div>`;
    };
    ui.select({
      label: 'Metric', value: metric,
      options: Object.entries(METRICS).map(([value, v]) => ({ value, label: v.label })),
      onChange: (v) => { metric = v; render(); },
    });
    render();
    ui.note(params.note || `<b>Numerically computed.</b> Counts from the repository at commit <code>${COMMIT.slice(0, 10)}</code>, produced with the shell commands listed under Inspect. They measure text, not mathematics: a one-line rewrite and the main estimate are each one <code>theorem</code>.`);
    return { destroy() {} };
  },
};
