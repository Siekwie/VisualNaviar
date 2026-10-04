// Schematic: the trust stack behind "a computer checked the proof". DOM only; nothing here is computed.
// params.mode = 'stack' (default): the six layers, paper → independent re-check; click a layer for what it
// guarantees and what it does not. params.mode = 'gaps': the same stack, compact, next to the five things
// that sit outside any checker's reach. All text is paraphrased from the repository at the pinned commit
// and from the Comparator README; file names in "Where to check" are the places to verify it.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const LAYERS = [
  {
    id: 'paper', n: 1, name: 'The papers', sub: 'two PDFs, human prose', tag: 'human', tagCls: 'warn', cardCls: 'warn',
    guarantees: 'Explain the constructions and why the theorems should be true. They name the results (Theorem 1.1 and Corollary 10.6 for Navier–Stokes, Theorem 1.1 for Euler) that <code>formalization.yaml</code> maps to Lean declarations.',
    not: 'Nothing on this layer passes through a checker. Prose, headings, numbering and the informal arguments are read by humans only. The alignment table is metadata written by the authors.',
    where: 'README.md (links to both PDFs); formalization.yaml → alignment',
  },
  {
    id: 'statement', n: 2, name: 'Lean reference statements', sub: 'ComparatorChallenges/ · 2 files, 472 lines · imports only Mathlib', tag: 'statement', tagCls: 'ns', cardCls: 'ns',
    guarantees: 'A fixed, short, human-readable target: the definitions and the four theorem statements, adapted from Google DeepMind’s Formal Conjectures transcription of the Clay problem description. Each theorem ends in <code>sorry</code> on purpose. The proof must hit this text exactly.',
    not: 'Does not guarantee that the text means what the paper, or the Clay description, means. That is a reading, done in the next scene. The proof libraries never import these files, so nothing in the proof can alter them.',
    where: 'ComparatorChallenges/NavierStokes.lean, ComparatorChallenges/Euler.lean',
  },
  {
    id: 'proof', n: 3, name: 'The proof development', sub: 'NavierStokes/ and Euler/ · 2,655 files, 640,857 lines', tag: 'proof', tagCls: 'ns', cardCls: 'ns',
    guarantees: 'Every lemma is written out in full. The metadata reports <code>sorry_count: 0</code>, and a text search of both libraries finds no <code>sorry</code> and no <code>axiom</code> declaration. The two Solution files restate the four theorems over proof-side copies of the definitions and discharge them from the libraries.',
    not: 'Size is not evidence. Until the kernel accepts it, this is text; until Comparator compares it, nothing says the theorem proved is the theorem in the reference.',
    where: 'NavierStokes/ComparatorSolution.lean (32 lines), Euler/Solution.lean (75 lines), formalization.yaml → status',
  },
  {
    id: 'kernel', n: 4, name: 'Lean 4 kernel check', sub: 'lean4 v4.34.0-rc2 · Mathlib at rev v4.34.0-rc2 · lake build', tag: 'machine', tagCls: 'ok', cardCls: 'ok',
    guarantees: 'Each declaration’s proof term is type-checked against its stated type by Lean’s kernel, a small component that is independent of the tactics and automation that produced the term. No step is skipped and no step is trusted because a tactic said so.',
    not: 'Does not check that the definitions are the intended ones, that the statement is interesting, or that the kernel itself is bug-free. Trusts Lean and the pinned Mathlib to behave as documented.',
    where: 'lean-toolchain, lakefile.toml, lake-manifest.json, README.md → “Building the formalizations”',
  },
  {
    id: 'axioms', n: 5, name: 'Axioms used', sub: 'propext · Classical.choice · Quot.sound', tag: 'machine', tagCls: 'ok', cardCls: 'ok',
    guarantees: '<code>#print axioms</code> at the end of both Solution files lists every axiom the four theorems depend on. The repository reports exactly the three standard axioms of classical mathematics in Lean. A <code>sorry</code> anywhere in the dependency tree would appear here as <code>sorryAx</code>.',
    not: 'A clean axiom list says nothing about the statement. It also tells you the proofs are classical (choice is used), which is ordinary for analysis and not a weakness.',
    where: 'NavierStokes/ComparatorSolution.lean:31–32, Euler/Solution.lean:73–75, formalization.yaml → main_results[].axioms, ComparatorChallenges/*.json → permitted_axioms',
  },
  {
    id: 'comparator', n: 6, name: 'Independent re-check', sub: 'leanprover/comparator · landrun · lean4export · nanoda', tag: 'machine', tagCls: 'ok', cardCls: 'ok',
    guarantees: 'Rebuilds the solution in a sandbox, exports the proof terms, replays them in Lean’s kernel and in nanoda, an independently written kernel, and certifies that the named theorems prove the <em>same statement</em> as the reference with no more than the permitted axioms (the README’s three guarantees).',
    not: 'Cannot judge meaning. Its guarantee rests on stated assumptions: the challenge’s imports are trusted, the sandbox holds, at least one kernel is correct. The repository ships the configuration and instructions; this guide did not run it.',
    where: 'ComparatorChallenges/README.md, ComparatorChallenges/NavierStokes.json, ComparatorChallenges/Euler.json',
  },
];

const OUTSIDE = [
  {
    id: 'out-a', letter: 'a', name: 'Which problem was solved', sub: 'statement choice and interpretation',
    why: 'The checker verifies alternatives (C) and (D) of the Clay description exactly as transcribed. Whether a breakdown <em>with a smooth force</em> is “the Navier–Stokes problem” is interpretation; the unforced alternatives (A) and (B) are not addressed by any theorem in the repository, and no checker can rule on which reading is the right one.',
    fix: 'Only a human reading of the Clay description and of what the field expects. Chapter 5 collects the positions.',
  },
  {
    id: 'out-b', letter: 'b', name: 'The papers’ prose', sub: 'only the Lean was checked',
    why: 'Only Lean text passes through the kernel. The two PDFs are connected to the Lean by <code>formalization.yaml</code>’s alignment table, which the authors wrote. Whether the informal arguments match the formal ones, and whether the exposition is right, are not machine questions.',
    fix: 'Refereeing of the papers; a reader comparing the paper statement and the Lean statement side by side.',
  },
  {
    id: 'out-c', letter: 'c', name: 'Trusted computing base', sub: 'kernel, Mathlib, exporter, second kernel, sandbox',
    why: 'Trust bottoms out in Lean’s kernel, in Mathlib’s definitions at the pinned revision (the statement is written in them), and for the re-check in lean4export, the landrun sandbox and the nanoda kernel. Comparator’s README lists its assumptions explicitly, including “at least one of the kernels is correct”.',
    fix: 'More independent kernels; an audit of the Mathlib definitions the statement actually uses. These components are small and well studied, but they are not nothing.',
  },
  {
    id: 'out-d', letter: 'd', name: 'Review status', sub: 'formalization.yaml: “self-assessed”',
    why: 'The repository records <code>review: status: "self-assessed"</code>. Formal verification replaces the referee’s line-by-line check of the proof; it does not replace the referee’s judgement about the statement, the alignment with the paper, or the significance.',
    fix: 'Peer review, which now has a smaller but real job. None of the sources listed in this guide records one.',
  },
  {
    id: 'out-e', letter: 'e', name: 'Physical relevance', sub: 'not a mathematical question',
    why: 'The force is an input to the construction, chosen so that the solution breaks down. Whether a flow driven by such a force tells us anything about turbulence or real fluids is a question of physics and judgement, not something a proof checker can decide.',
    fix: 'Nothing mechanical. Chapter 5 separates the direct consequences from the speculation.',
  },
];

function layerItem(l, sel, compact) {
  return `<div class="item${sel === l.id ? ' sel' : ''}" data-id="${l.id}" role="button" tabindex="0" aria-pressed="${sel === l.id}">
    <span class="tag ${l.tagCls}">${l.n} · ${esc(l.tag)}</span><b>${esc(l.name)}</b>
    ${compact ? '' : `<div class="muted" style="font-size:12px;margin-top:3px">${esc(l.sub)}</div>`}
  </div>`;
}
function outsideItem(o, sel) {
  return `<div class="item${sel === o.id ? ' sel' : ''}" data-id="${o.id}" role="button" tabindex="0" aria-pressed="${sel === o.id}">
    <span class="tag warn">(${o.letter}) · human</span><b>${esc(o.name)}</b>
    <div class="muted" style="font-size:12px;margin-top:3px">${esc(o.sub)}</div>
  </div>`;
}
const ARROW = '<div class="muted" aria-hidden="true" style="text-align:center;font-size:12px;line-height:1;margin:-2px 0 6px">↓</div>';

function detailLayer(l) {
  return `<div class="card ${l.cardCls}">
    <h4>${l.n}. ${esc(l.name)}</h4>
    <p class="muted" style="font-size:12.5px">${esc(l.sub)}</p>
    <p><b class="tag ok">What this layer guarantees</b></p><p style="color:var(--fg)">${l.guarantees}</p>
    <p><b class="tag bad">What it does not</b></p><p style="color:var(--fg)">${l.not}</p>
    <p class="muted" style="font-size:12.5px;margin:0"><b class="tag">Where to check</b> ${esc(l.where)}</p>
  </div>`;
}
function detailOutside(o) {
  return `<div class="card warn">
    <h4>(${o.letter}) ${esc(o.name)}</h4>
    <p class="muted" style="font-size:12.5px">${esc(o.sub)}</p>
    <p><b class="tag warn">Why no checker can decide it</b></p><p style="color:var(--fg)">${o.why}</p>
    <p><b class="tag">What would address it</b></p><p style="color:var(--fg);margin:0">${o.fix}</p>
  </div>`;
}

export default {
  id: 'lean-stack', label: 'schematic',
  mount(host, params, ui) {
    const mode = params && params.mode === 'gaps' ? 'gaps' : 'stack';
    const root = document.createElement('div');
    root.className = 'scene-html';
    ui.canvasWrap.appendChild(root);
    let sel = (params && params.selected) || (mode === 'gaps' ? 'out-a' : 'statement');
    const narrow = () => (root.clientWidth || 640) < 560;
    let lastNarrow = narrow();

    const render = () => {
      const layer = LAYERS.find((l) => l.id === sel);
      const out = OUTSIDE.find((o) => o.id === sel);
      const detail = layer ? detailLayer(layer) : out ? detailOutside(out) : '';
      const cols = narrow() ? '1fr' : 'minmax(230px,1fr) minmax(0,1.35fr)';
      let left;
      if (mode === 'stack') {
        left = `<div class="lane"><h4>Trust stack · top to bottom</h4>${LAYERS.map((l, i) => layerItem(l, sel, false) + (i < LAYERS.length - 1 ? ARROW : '')).join('')}</div>`;
      } else {
        left = `<div style="display:grid;gap:10px">
          <div class="lane"><h4>Inside the checker’s reach</h4>${LAYERS.slice(1).map((l, i, a) => layerItem(l, sel, true) + (i < a.length - 1 ? ARROW : '')).join('')}
            <div class="muted" style="font-size:12px;margin-top:6px">One certified sentence: from Mathlib’s definitions and three standard axioms, the four stated theorems follow.</div></div>
          <div class="lane"><h4>Outside its reach</h4>${OUTSIDE.map((o) => outsideItem(o, sel)).join('')}</div>
        </div>`;
      }
      root.innerHTML = `<div style="display:grid;grid-template-columns:${cols};gap:12px;align-items:start"><div style="min-width:0">${left}</div><div data-detail style="min-width:0;scroll-margin-top:64px">${detail}</div></div>`;
      root.querySelectorAll('.item[data-id]').forEach((n) => {
        const pick = () => {
          sel = n.dataset.id; render();
          const f = root.querySelector(`.item[data-id="${sel}"]`); if (f) f.focus({ preventScroll: true });
          const d = root.querySelector('[data-detail]');
          if (d) { const r = d.getBoundingClientRect(); if (r.top < 60 || r.top > window.innerHeight - 120) d.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        };
        n.addEventListener('click', pick);
        n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
    };
    const ro = new ResizeObserver(() => { const n = narrow(); if (n !== lastNarrow) { lastNarrow = n; render(); } });
    ro.observe(root);
    ui.onDispose(() => ro.disconnect());
    render();
    ui.note((params && params.note) || (mode === 'stack'
      ? '<b>Schematic.</b> The layers are a way of organising trust, not a timeline. Green layers are mechanical; the blue ones are texts a machine checks but a human must read; the yellow one is never checked. Counts are from the repository at the pinned commit.'
      : '<b>Schematic.</b> The right-hand items are not flaws. They are the questions a proof checker is not built to answer, and they stay open however many times the proof is re-checked.'));
    return { destroy() {} };
  },
};
