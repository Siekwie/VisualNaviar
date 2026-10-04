# Authoring guide for the Blowup Explorer

This site is a **proof explorer**, not a prettier proof document. Every page lets a reader
understand one idea, then follow it down to the mathematics and the sources that support it.

## Non-negotiables

1. **Traceable.** Every mathematical claim must be supportable from a source listed in
   `content/sources.js`. The mathematical ground truth is the Lean formalization at the pinned
   commit (`content/sources.js` → `lean-repo`). Press reports are *context*, never mathematics.
2. **Honest visuals.** Every visual carries exactly one evidence label:
   - `schematic` — a drawing of the idea; shapes and motion are illustrative, not computed.
   - `formula-derived` — every number on screen comes from the displayed formulas.
   - `numerically-computed` — produced by a stated numerical model in the browser; a model, not the proof.
   A pretty animation must never masquerade as evidence.
3. **No contested interpretation stated as fact.** Scope, attribution and physical relevance are
   disputed. Use the `caution` block (`<div class="callout caution">…</div>`) and attribute
   claims ("OpenAI's README states…", "press reports say…").
4. **Progressive disclosure.** Nobody gets 100,000 lines at once.
   - `understand`: ≤ 180 words of plain language. At most one formula. No jargon without a gloss.
   - `inspect`: the equations, the estimate, and *why the step works*. ≤ 450 words plus math.
     Use `<details class="more"><summary>…</summary>…</details>` for optional depth.
   - `verify`: precise statements, paper references (only if the source map lists them),
     Lean declarations (with file + line), and limits/assumptions.
5. **Don't invent numbering.** Paper theorem/section numbers may only be cited when they
   appear in `content/sources.js` or the source maps. Otherwise cite the Lean declaration.
6. **Do not force the two proofs into one picture.** Navier–Stokes and Euler are separate
   constructions with separate scenes.

## Chapter module shape (`content/chN-*.js`)

```js
export default {
  id: 'concentration',            // url segment
  number: 1,
  title: 'Infinite peak speed, finite energy',
  equation: 'ns' | 'euler' | 'both' | 'meta',
  summary: 'One sentence shown in the trail and on the home page.',
  scenes: [ /* Scene objects, in reading order */ ],
};
```

## Scene object

```js
{
  id: 'peak-vs-energy',
  title: 'Peak speed versus total energy',
  question: 'How can the fastest point go to infinity while the total energy stays finite?',
  visual: { scene: 'concentration', label: 'formula-derived', params: { /* scene-specific */ } },
  // The status strip under the visual. Each ≤ 20 words.
  status: { changes: '…', bounded: '…', fails: '…' },
  // HTML strings. Math: $…$ inline, $$…$$ display. In math use \lt and \gt, never raw < >.
  understand: `<p>…</p>`,
  inspect: `<p>…</p>`,
  // Optional. For construction stages: the four questions.
  stage: { need: '…', whyNot: '…', ingredient: '…', remaining: '…' },
  verify: {
    statements: [ { title: 'Precise statement', html: '…' } ],
    paper:  [ { src: 'ns-paper', where: 'Theorem 1.1', note: '…' } ],
    lean:   [ { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3',
                file: 'NavierStokes/ComparatorSolution.lean', line: 17, note: '…' },
              // a module docstring or a whole file: set module: true (only file + line range are checked)
              { decl: 'NavierStokes/ProblemStatement.lean (module docstring)', module: true,
                file: 'NavierStokes/ProblemStatement.lean', line: 4, note: '…' } ],
    context:[ { src: 'press-quanta', note: '…' } ],        // non-mathematical sources
    limits: [ 'What this scene does NOT show or prove …' ],
  },
}
```

`visual.scene` must be a key of the registry in `js/scenes/index.js`. A scene module exports
`{ id, label, mount(host, params, ui) → { destroy() } }` and must use the `ui` helpers
(`ui.canvas`, `ui.slider`, `ui.select`, `ui.toggle`, `ui.readouts`, `ui.loop`, `ui.note`).
Scenes must stay under ~60 fps budget with no allocations in the draw loop, handle resize,
and pause when the tab is hidden (the `ui.loop` helper does this).

## Writing style

- Lead with the question, answer it, then show why. Short paragraphs. One idea per paragraph.
- Name quantities in words before symbols ("the fastest speed anywhere, $\|u\|_{L^\infty}$").
- Prefer "the construction", "the paper", "the Lean statement" over "they".
- Expand acronyms the first time (Beale–Kato–Majda, BKM).
- When a step depends on something not yet shown, say so and link forward: `[[scene:chapter/scene|label]]`.
