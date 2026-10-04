// Chapter 5 — implications, the Clay question, and attribution. This is where contested interpretation
// lives, so every contested statement is attributed ("X said", "as reported by Y") and never asserted in
// the guide's own voice. Mathematics is checked against the pinned Lean commit; press is context only.
const L = (file, line, decl) => ({ lean: { file, line, decl } });
const S = (src) => ({ src });

export default {
  id: 'implications', number: 5, title: 'Implications and open questions', equation: 'meta', short: 'Implications',
  summary: 'What the theorems imply and what they do not, whether the Clay problem is solved, and who said what, with every contested statement attributed.',
  scenes: [
    /* ------------------------------------------------------------------ */
    {
      id: 'implications-map',
      title: 'What follows, and what does not',
      question: 'What follows from these theorems, and what does not?',
      visual: {
        scene: 'implications-map', label: 'schematic', caption: 'Four lanes: consequence, connection, open question, speculation',
        params: {
          note: 'Click an item for a one-paragraph note with its evidence tag and source. The lanes are an editorial structure, not a computed object: the drawing is schematic.',
          lanes: [
            {
              id: 'direct', title: 'Direct consequences', tag: 'ok', tagLabel: 'Lean-checked', intro: 'Only what the four statements say, quantifiers in order.',
              items: [
                { label: 'A smooth decaying force can defeat global regularity, at every viscosity',
                  detail: `The theorem is quantified over every $\\nu \\gt 0$. For each it produces a datum $u_0$ and a force $f$ satisfying the Clay-style smoothness and decay conditions such that no pair $(v,p)$ is a global smooth solution with square-integrable velocity and uniformly bounded kinetic energy. So the hoped-for statement \u201csmooth, rapidly decaying forcing always yields a global smooth bounded-energy solution\u201d is false. In the proof the datum is in fact zero: the comparator witness is <code>u\u2080 := fun _ => 0</code>, and the force alone sets the fluid in motion.`,
                  refs: [L('NavierStokes/ComparatorSolution.lean', 16, 'navier_stokes_breakdown_R3'), L('NavierStokes/R3/ComparatorBridge.lean', 77, 'comparator_of_breakdown (witness u\u2080 := fun _ => 0)')] },
                { label: 'The same on the periodic torus',
                  detail: `On $\\R^3/\\mathbb{Z}^3$ the theorem gives smooth 1-periodic data and a smooth force, periodic in space and decaying in time, for which no global smooth solution exists with velocity and pressure both 1-periodic. Energy plays no role in this class; periodicity replaces decay. The repository metadata aligns it with the paper\u2019s Corollary 10.6, derived from the whole-space construction rather than proved independently.`,
                  refs: [L('NavierStokes/ComparatorSolution.lean', 23, 'navier_stokes_breakdown_periodic'), S('formalization-yaml')] },
                { label: '\u201cFor every \u03bd\u201d is not \u201cas \u03bd \u2192 0\u201d',
                  detail: `The existential quantifiers over the datum and the force sit inside the universal quantifier over $\\nu$, so the witnesses may depend on $\\nu$. In the repository they do: the construction is carried out at viscosity one and rescaled, $u_\\nu(t,x) = \\sqrt{\\nu}\\,u(t,x/\\sqrt{\\nu})$, which keeps the singular time at $t = 1$ and shrinks the spatial support by $\\sqrt{\\nu}$. The statement says nothing about a limit of these solutions as $\\nu \\to 0$, and the Euler theorem is not obtained as such a limit.`,
                  refs: [L('NavierStokes/R3/Theorem.lean', 26, 'theorem_1_1_with_initial_rest'), L('NavierStokes/R3/ViscosityScaling.lean', 163, 'scaledVelocity')] },
                { label: 'The non-existence is relative to a class',
                  detail: `The ruled-out class requires $C^\\infty$ velocity and pressure on $\\R^3\\times[0,\\infty)$, square-integrable velocity at each time, and one energy bound for all time. The theorem says nothing about weak (Leray\u2013Hopf) solutions, about solutions whose energy grows without bound, or about other function spaces. Those are different questions, not consequences.`,
                  refs: [L('ComparatorChallenges/NavierStokes.lean', 245, 'NavierStokesExistenceAndSmoothnessRn')] },
                { label: 'Euler: a smooth, compactly supported datum with a finite lifespan',
                  detail: `The quantitative Euler theorem names a nonzero, smooth, compactly supported, divergence-free datum and a time $T^* \\in (0,1]$ such that a solution exists in the all-order Sobolev class on $[0,T]$ exactly when $T \\lt T^*$, has bounded energy on $[0,T^*)$, and satisfies $\\limsup_{t \\to T^*}\\norm{v(t)}_{C^1} = \\infty$ and $\\int_0^{T^*}\\norm{\\omega(t)}_{\\Linf}\\dd t = \\infty$. Read with the classical Beale\u2013Kato\u2013Majda criterion, a reference result that is not part of the Lean statement, the last clause locates a singular time in the classical sense rather than an artefact of the solution class.`,
                  refs: [L('Euler/Solution.lean', 43, 'exists_compact_smooth_euler_singularity'), S('bkm')] },
                { label: 'No force, no viscosity, and no logical dependence on the Navier\u2013Stokes theorem',
                  detail: `The Euler solution class has $\\partial_t v + (v\\cdot\\nabla)v = -\\nabla p$ with no $f$ and no $\\nu$. The two results are checked against separate reference files and separate Comparator configurations; neither theorem is derived from the other, and nothing in the repository connects the Euler datum to the Navier\u2013Stokes force. That is a statement about the formal proofs only. OpenAI\u2019s account of its process, as reported by Interesting Engineering, says the Euler result was fed to the agents working on Navier\u2013Stokes; that is a matter of process, not of logical dependence.`,
                  refs: [L('ComparatorChallenges/Euler.lean', 65, 'EulerExistenceAndSmoothness'), L('ComparatorChallenges/Euler.json', 6, 'Euler.euler_breakdown_R3 (challenge configuration)'), S('press-ie')] },
              ],
            },
            {
              id: 'research', title: 'Research connections', tag: '', tagLabel: 'attributed', intro: 'Lines of work the results touch. Each connection is somebody\u2019s description.',
              items: [
                { label: 'Concentration and self-similar blowup',
                  detail: `OpenAI describes the Navier\u2013Stokes solution as a vortex that \u201cspirals inward and gets increasingly elongated\u201d. In the Lean sources the construction lives in a similarity coordinate $q$ solving $q - z^2 q^{2h} = 1 - t$, with an axisymmetric base profile. This is the classical self-similar route to blowup, whose scaling symmetry and slowest admissible rate go back to Leray (1934); [[scene:concentration/peak-vs-energy|chapter 1]] shows the bookkeeping and [[scene:navier-stokes|chapter 2]] the construction.`,
                  refs: [S('openai-x'), S('leray'), L('NavierStokes/SimilarityCoordinates.lean', 124, 'coordinateQ')] },
                { label: 'Oscillatory corrections',
                  detail: `Both libraries add rapidly oscillating corrections to a slowly varying base so that what is left over is smooth: correction \u201ccycles\u201d of high-frequency waves on an active annulus for Navier\u2013Stokes, \u201cpackets\u201d carrying a plane-wave phase for Euler. Tao\u2019s post on the Alp\u00f6ge\u2013Buckmaster work says their \u201chigh frequency corrections appear to have better spatial localization properties\u201d than the earlier C\u00f3rdoba\u2013Mart\u00ednez-Zoroa construction (quoted as indexed; the post could not be fetched here).`,
                  refs: [S('tao-blog'), L('NavierStokes/ActualIterationLedger.lean', 22, 'sigma (cycle accuracy ledger)'), L('Euler/PacketInfiniteConstruction.lean', 39, 'stages')] },
                { label: 'The C\u00f3rdoba\u2013Mart\u00ednez-Zoroa programme',
                  detail: `ICMAT describes a \u201cvorticity layer cascade\u201d: an infinite sequence of smaller, more concentrated layers of vorticity, each regular on its own, arranged so that the strain of the larger-scale layers amplifies the smaller ones while self-interactions and feedback are suppressed. The 2024 IPM paper (arXiv:2410.22920) is the published instance with a smooth source. ICMAT states that Alp\u00f6ge and Buckmaster explicitly took the programme as their starting point, and that it served as the basis for the teams that announced advances on the Euler and Navier\u2013Stokes equations with AI tools, OpenAI\u2019s Millennium announcement included. That attribution is ICMAT\u2019s; the guide reports it and does not assess it.`,
                  refs: [S('icmat'), S('cordoba-mz-ipm')] },
                { label: 'Hydrodynamic instability of blowup',
                  detail: `Vasseur and Vishik (2020) show that if a smooth solution of 3D Euler blows up, it becomes unstable as time approaches the blowup time, which, in the words of their abstract, explains why predicting such a blowup by direct numerical experiment is so difficult. The connection is a caution: a constructed singular solution need not be approachable by nearby data or by a simulation. The Lean statements assert nothing about stability either way.`,
                  refs: [S('vasseur-vishik')] },
                { label: 'Formal verification at scale',
                  detail: `The repository has 2,659 Lean files (1,839 for Euler, 816 for Navier\u2013Stokes) on Lean 4.34.0-rc2 and Mathlib, with zero <code>sorry</code> and the three standard axioms. The statements are checked by Comparator against reference files adapted from Google DeepMind\u2019s Formal Conjectures. [[scene:verification|Chapter 4]] explains what that certifies and what it leaves to humans.`,
                  refs: [S('lean-repo'), S('comparator-tool'), S('formal-conjectures'), S('formalization-yaml')] },
                { label: 'AI-generated mathematics and how it is reviewed',
                  detail: `The metadata records <code>automation: agent</code>, model \u201cGPT-6 Astra\u201d, framework Codex, and <code>review: self-assessed</code>. The declaration of 25 Fields medalists, posted on 11 September on Terence Tao\u2019s blog and reported by Implicator, warns that rushed AI announcements leave too little time for write-ups and citations, raising \u201csevere attribution and plagiarism questions\u201d; MIT Technology Review asks how human mathematicians fit into a future in which progress needs frontier-lab resources. Both are positions, reported here, not findings.`,
                  refs: [S('formalization-yaml'), S('fields-declaration'), S('press-fields'), S('press-techreview')] },
                { label: 'Follow-up preprints',
                  detail: `Within weeks, preprints built on the construction. Cao, Chi and Nie (arXiv:2609.10262) start from \u201cthe compact forced blowup solution of OpenAI\u201d and show that forces producing blowup by a prescribed time are dense in a weak topology. A note (arXiv:2609.17642) revisits a 1998 exact solution in the construction\u2019s similarity variables. Alp\u00f6ge, Buckmaster and Coiculescu (arXiv:2609.16470) extend the C\u00f3rdoba\u2013Mart\u00ednez-Zoroa IPM blowup to uniformly space-time smooth forcing. Abstracts only; none was read in full here.`,
                  refs: [S('arxiv-cao-chi-nie'), S('arxiv-swirl'), S('arxiv-ipm-smooth')] },
              ],
            },
            {
              id: 'open', title: 'Open questions', tag: 'warn', tagLabel: 'open', intro: 'What nobody has proved. Forecasts are quoted, not adopted.',
              items: [
                { label: 'Unforced Navier\u2013Stokes: alternatives (A) and (B)',
                  detail: `With the force identically zero, neither global regularity nor blowup is known. Proving (C) leaves (A) untouched: (A) is a statement about all unforced flows, (C) about one designed forced flow, and both could be true. The README does not claim (A) or (B), the reference file contains only the two breakdown alternatives, and no theorem in the repository concerns $f \\equiv 0$ for Navier\u2013Stokes.`,
                  refs: [S('lean-readme'), S('clay-statement'), L('ComparatorChallenges/NavierStokes.lean', 45, 'navier_stokes_breakdown_R3 (reference docstring: breakdown alternatives only)')] },
                { label: 'Can the force be removed?',
                  detail: `Tao\u2019s post of 7 September, as indexed by search, says it is expected that such singularities can also be constructed without the forcing term, and OfficeChai and Fortune report him seeing no obvious obstacle to pushing the smooth-forcing methods to Navier\u2013Stokes. In the other direction, Constantin, Ignatova and Vicol (arXiv:2609.20803) respond to the OpenAI announcement by proving that solutions with the construction\u2019s anisotropic bounds and axisymmetric core are regular when the force is real-analytic; Scientific American reports this as showing that the blowup disappears once the force is removed and that the method cannot work without a contrived force. Neither the post nor the preprint could be read in full here. Both positions are reported, not endorsed.`,
                  refs: [S('tao-blog'), S('press-fortune'), S('press-officechai-tao'), S('arxiv-civ'), S('press-sciam')] },
                { label: 'Is the singularity stable?',
                  detail: `The theorems are existence statements for one datum and one force per viscosity, and for one Euler datum. Nothing in the Lean statements says what happens to nearby data or nearby forces. Vasseur\u2013Vishik suggests instability is the rule for Euler blowup; whether these particular singularities survive perturbation is open, and no source found by the guide claims stability for them.`,
                  refs: [S('vasseur-vishik'), L('Euler/Solution.lean', 43, 'exists_compact_smooth_euler_singularity')] },
                { label: 'Physical relevance',
                  detail: `Three gaps separate the theorem from a laboratory. The continuum model is used below every scale; the force is a mathematical device, compactly supported in space and in strictly positive time and designed to cancel a residual; and the fluid is incompressible. Scientific American reports mathematicians calling the forced variant \u201cdisconnected from reality\u201d. Whether any of this bears on real flows is not a question the Lean statements answer, and the guide leaves it open.`,
                  refs: [S('press-sciam'), S('press-scienceabc'), L('NavierStokes/R3/Theorem.lean', 26, 'theorem_1_1_with_initial_rest (force supported in positive time)')] },
                { label: 'Peer review and Clay acceptance',
                  detail: `The repository\u2019s metadata says <code>review: self-assessed</code>. As reported by Implicator, the Clay Mathematics Institute called its evaluation \u201cdeliberately unhurried\u201d; as reported by Decrypt and Implicator, the prize rules require publication in a peer-reviewed journal and a two-year wait after acceptance by the community before a committee is convened. No refereed publication was found by this guide as of 4 October 2026. The next scene lays out every claim and its status.`,
                  refs: [S('formalization-yaml'), S('press-implicator'), S('press-decrypt')] },
                { label: 'Who did what first',
                  detail: `Attribution is contested between Buckmaster and Alp\u00f6ge on one side and OpenAI on the other; see [[scene:implications/who-did-what-first|the timeline]]. The mathematics in the first lane does not depend on the answer. The history does.`,
                  refs: [S('buckmaster-statement'), S('press-officechai-openai')] },
              ],
            },
            {
              id: 'speculation', title: 'Speculation', tag: 'bad', tagLabel: 'speculation', intro: 'Possibilities with no established benefit. Kept short on purpose.',
              items: [
                { label: 'Numerics',
                  detail: `An explicit forced singular solution could, in principle, serve as a benchmark for near-singular simulations. No source found by the guide proposes this; the one arXiv note that works in the construction\u2019s similarity variables (arXiv:2609.17642) compares them with a 1998 exact solution, not with a computation. No numerical result exists; this is a possibility, not a benefit.`,
                  refs: [S('arxiv-swirl')] },
                { label: 'Turbulence modelling',
                  detail: `It is sometimes suggested that singularity formation bears on intermittency in turbulence. The result here is forced and designed; no connection to turbulence statistics has been established, and the guide knows of no source claiming one.`,
                  refs: [], noSource: 'No source: this is the guide\u2019s own flag, included so that the lane is not empty of the most common guess.' },
                { label: 'Verification tooling',
                  detail: `Comparator-style checking of a proof against an independently written statement may become routine for machine-generated proofs. That is a projection about practice, not a consequence of any theorem.`,
                  refs: [S('comparator-tool')] },
              ],
            },
          ],
        },
      },
      status: {
        changes: 'The evidence standard, lane by lane: Lean-checked, attributed, open, speculative. Same theorems, four different kinds of sentence.',
        bounded: 'The direct lane. It contains only what the four Lean statements say, read with their quantifiers in order.',
        fails: 'Any sentence that crosses a lane boundary, say a Lean consequence restated as a claim about turbulence.',
      },
      understand: `
<p>Read the board left to right, from the strongest evidence to the weakest. The first lane holds only what the four machine-checked statements say, with their quantifiers in the order written. The second connects the results to lines of research, and every connection is attributed to whoever drew it. The third lists what nobody has proved. The fourth is guesswork, labelled as such and kept short.</p>
<p>The discipline is never to let a sentence drift one lane to the left. \u201cA smooth force can defeat regularity at every viscosity\u201d is a theorem. \u201cThis is the C\u00f3rdoba\u2013Mart\u00ednez-Zoroa cascade\u201d is a description someone gave. \u201cThe force can be removed\u201d is a forecast. \u201cThis will improve turbulence models\u201d is a wish.</p>
<p>Click any item for a one-paragraph note, its evidence tag and its source. First-lane items link to the Lean declaration; the others link to the person or report that said it.</p>
<div class="callout key"><b class="tag">Two boundaries</b>Nothing in the first lane depends on the papers. Nothing in the other three lanes was checked by a machine.</div>`,
      inspect: `
<p>Three items are the ones most often misread. Each gets a closer look here.</p>
<h3>\u201cFor every \u03bd\u201d is not \u201cas \u03bd \u2192 0\u201d</h3>
<p>The whole-space theorem has the shape</p>
<p>$$\\forall\\,\\nu \\gt 0\\ \\ \\exists\\, u_0, f:\\quad (\\text{data and force conditions}) \\;\\wedge\\; \\neg\\big(\\exists\\, v,p:\\ \\text{global smooth bounded-energy solution}\\big).$$</p>
<p>The datum and force are chosen <em>after</em> $\\nu$, so they may depend on it. In the repository they do, in a specific way: the construction is carried out at viscosity one and then rescaled, $u_\\nu(t,x) = \\sqrt{\\nu}\\,u(t, x/\\sqrt{\\nu})$, which multiplies the viscosity by $\\nu$, keeps the singular time at $t = 1$, and shrinks the spatial support by $\\sqrt{\\nu}$. Nothing is claimed about a limit of these solutions as $\\nu \\to 0$, and the Euler theorem is not obtained that way; it is a separate construction with its own Comparator challenge. A reader who hears \u201cuniform in viscosity\u201d should hear \u201cone rescaled family\u201d, not \u201ca statement about the inviscid limit\u201d.</p>
<h3>The Beale\u2013Kato\u2013Majda clause</h3>
<p>For the Euler equations, a smooth solution on $[0,T)$ can be continued past $T$ if and only if</p>
<p>$$\\int_0^{T} \\norm{\\omega(t)}_{\\Linf}\\dd t \\lt \\infty, \\qquad \\omega = \\nabla \\times v .$$</p>
<p>The Lean statement asserts that this integral is infinite on $[0,T^*)$ and finite on every $[0,T]$ with $T \\lt T^*$. So the theorem does not merely say \u201cthe solution stops\u201d. It exhibits the one quantity whose divergence is known to be necessary and sufficient for stopping, and it locates the divergence exactly at $T^*$. Together with the criterion, a classical theorem outside the Lean, this makes $T^*$ a singular time in the classical sense, independent of the particular solution class used to state maximality.</p>
<h3>Instability and observability</h3>
<p>Vasseur and Vishik proved that a blowup solution of three-dimensional Euler becomes unstable as $t \\to T^*$, in a sense made precise in their paper, and drew the practical conclusion that predicting such a blowup by direct numerical experiment is difficult. For this guide the consequence is a boundary rather than a result: an existence theorem for a singular solution says nothing about whether nearby data behave the same way, and the Lean statements assert nothing of the kind. Robustness lives in the third lane as an open question, not in the first as a consequence.</p>
<details class="more"><summary>Why proving (C) does not refute (A)</summary>
<p>In the official description, alternatives (A) and (B) take the force to be identically zero and ask for a global smooth solution for <em>every</em> admissible datum; alternatives (C) and (D) allow a smooth force and ask for <em>one</em> datum-and-force pair with no global smooth solution. A proof of (C) therefore leaves (A) untouched: it is logically consistent for every unforced flow to stay smooth forever while some forced flow does not. This is why the unforced question is listed as open rather than as refuted.</p></details>
<details class="more"><summary>What the ruled-out class excludes</summary>
<p>The whole-space class requires the velocity to be square-integrable at each time and the kinetic energy to be bounded uniformly in time. The theorem says nothing about weak (Leray\u2013Hopf) solutions, about solutions whose energy grows without bound, or about solutions in other function spaces. Those are separate questions, not consequences, and none of them is addressed in the repository.</p></details>`,
      verify: {
        statements: [
          { title: 'Quantifier order in alternative (C)', html: '<pre>theorem navier_stokes_breakdown_R3 (nu : \u211d) (hnu : nu &gt; 0) :\n    \u2203 (u\u2080 : \u211d\u00b3 \u2192 \u211d\u00b3) (f : \u211d\u00b3 \u2192 \u211d \u2192 \u211d\u00b3),\n    InitialVelocityConditionDecay u\u2080 \u2227 ForceConditionDecay f \u2227\n    \u00ac (\u2203 v p, NavierStokesExistenceAndSmoothnessRn nu u\u2080 f v p)</pre><p>The existential quantifiers over $u_0$ and $f$ are inside the universal quantifier over $\\nu$. Nothing in the statement relates the witnesses for different values of $\\nu$.</p>' },
          { title: 'Viscosity by rescaling (Lean module docstring, verbatim)', html: '<p>\u201cThe actual selected construction supplies the viscosity-one fields. Spatial rescaling gives every positive viscosity while retaining singular time one, compact support in strictly positive time for the force, and one kinetic-energy bound for all times before the singularity. Whole-space comparison excludes a global smooth finite-energy solution with the same prescribed force and datum.\u201d (<code>NavierStokes/R3/Theorem.lean</code>, lines 6\u201314.) The rescaling is <code>scaledVelocity \u03bd u = rescale (\u221a\u03bd) (\u221a\u03bd)\u207b\u00b9 u</code>, i.e. $u_\\nu(t,x) = \\sqrt{\\nu}\\,u(t,x/\\sqrt\\nu)$.</p>' },
          { title: 'Zero initial datum in the comparator witness', html: '<pre>refine \u27e8fun _ =&gt; 0, toComparator f, zero_initial_condition_decay, \u2026\u27e9</pre><p>The whole-space comparator theorem is proved with $u_0 \\equiv 0$ (<code>NavierStokes/R3/ComparatorBridge.lean</code>, <code>comparator_of_breakdown</code>). Independently, <code>theorem_1_1_with_initial_rest</code> certifies that the constructed velocity and pressure vanish for $|t| \\le 3/8$.</p>' },
          { title: 'The Beale\u2013Kato\u2013Majda clauses as stated', html: '<pre>(\u2200 T \u2208 Ioo 0 Tstar, \u2026 \u2227 (\u222b\u207b t in Ico (0 : \u211d) T, vorticityNorm (v \u00b7 t)) &lt; \u22a4) \u2227\n\u2026 \u2227 (\u222b\u207b t in Ico (0 : \u211d) Tstar, vorticityNorm (v \u00b7 t)) = \u22a4</pre><p>Here <code>vorticityNorm</code> is the spatial supremum of the Euclidean norm of the curl, valued in $[0,\\infty]$. Classical criterion (Beale\u2013Kato\u2013Majda, 1984): a smooth Euler solution on $[0,T)$ extends past $T$ if and only if $\\int_0^T \\norm{\\omega(t)}_{\\Linf}\\dd t \\lt \\infty$.</p>' },
          { title: 'Vasseur\u2013Vishik (reference, from the abstract)', html: '<p>If a solution of the incompressible 3D Euler equation with smooth initial data develops a singularity in finite time, the solution becomes unstable as time approaches the blowup time. The authors state that this explains why predicting such a blowup via direct numerical experiments is so difficult. The theorem\u2019s precise notion of instability is in the paper, which was not read here.</p>' },
        ],
        paper: [
          { src: 'bkm', where: 'Continuation criterion', note: 'The classical statement behind the vorticity-integral clause.' },
          { src: 'vasseur-vishik', where: 'Abstract and main theorem', note: 'Cited from the arXiv abstract; the paper itself was not consulted.' },
          { src: 'cordoba-mz-ipm', where: 'Abstract', note: 'The published instance of the layer-cascade programme with a smooth source, as ICMAT describes it.' },
          { src: 'arxiv-civ', where: 'Title and abstract (as indexed)', note: 'Regularity under spatially analytic forcing for asymptotically axisymmetric flows; discusses the OpenAI construction. Its bearing on the unforced problem is reported by Scientific American, not assessed here.' },
          { src: 'arxiv-cao-chi-nie', where: 'Abstract', note: 'Builds directly on the OpenAI construction.' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', file: 'NavierStokes/ComparatorSolution.lean', line: 16, note: 'Alternative (C): \u2200 \u03bd \u003e 0, \u2203 u\u2080 f, \u2026' },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_periodic', file: 'NavierStokes/ComparatorSolution.lean', line: 23, note: 'Alternative (D).' },
          { decl: 'NavierStokesR3.comparator_of_breakdown', file: 'NavierStokes/R3/ComparatorBridge.lean', line: 77, note: 'The bridge from the paper-style theorem to the comparator statement; its witness datum is fun _ => 0.' },
          { decl: 'NavierStokesR3.theorem_1_1_with_initial_rest', file: 'NavierStokes/R3/Theorem.lean', line: 26, note: 'Every viscosity, singular time one, fields at rest for |t| \u2264 3/8; the module docstring describes the rescaling.' },
          { decl: 'ViscosityScaling.scaledVelocity', file: 'NavierStokes/R3/ViscosityScaling.lean', line: 163, note: 'u_\u03bd(t,x) = \u221a\u03bd \u00b7 u(t, x/\u221a\u03bd).' },
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothnessRn', file: 'ComparatorChallenges/NavierStokes.lean', line: 245, note: 'The ruled-out class: square-integrable at each time (line 250), uniformly bounded energy (line 253).' },
          { decl: 'Euler.exists_compact_smooth_euler_singularity', file: 'Euler/Solution.lean', line: 43, note: 'The quantitative Euler statement with the two vorticity-integral clauses.' },
          { decl: 'Euler.vorticityNorm', file: 'ComparatorChallenges/Euler.lean', line: 161, note: 'Supremum of the curl, valued in \u211d\u22650\u221e.' },
          { decl: 'Euler.euler_breakdown_R3', file: 'ComparatorChallenges/Euler.json', line: 6, note: 'The Euler challenge is a separate Comparator configuration from the Navier\u2013Stokes one.' },
        ],
        context: [
          { src: 'icmat', note: 'Source of the \u201cvorticity layer cascade\u201d description and of the attribution of the teams\u2019 announcements, OpenAI\u2019s included, to the C\u00f3rdoba\u2013Mart\u00ednez-Zoroa programme.' },
          { src: 'tao-blog', note: 'Tao\u2019s 7 Sept 2026 post; quoted only as indexed by search, since the page could not be fetched.' },
          { src: 'press-officechai-tao', note: 'Reports Tao\u2019s remarks on extending the methods to Navier\u2013Stokes.' },
          { src: 'press-sciam', note: 'Reports the Constantin\u2013Ignatova\u2013Vicol preprint as an obstruction to the method, and quotes Luis Silvestre.' },
          { src: 'openai-x', note: 'OpenAI\u2019s description of the vortex.' },
          { src: 'press-fields', note: 'Reports the 11 Sept 2026 declaration of 25 Fields medalists.' },
          { src: 'press-techreview', note: 'The review-and-resources question.' },
          { src: 'arxiv-swirl', note: 'The note that revisits a 1998 exact solution in the construction\u2019s similarity variables; title and abstract as indexed. It does not propose a computation; the numerics item is the guide\u2019s own flag.' },
          { src: 'formalization-yaml', note: 'Automation and review metadata.' },
        ],
        limits: [
          'The lanes are an editorial device. Nothing about their layout is computed; the evidence tags are assigned by the guide.',
          'Items in the research and open lanes rest on abstracts, docstrings and press snippets. Neither OpenAI paper, nor Tao\u2019s post, nor the Constantin\u2013Ignatova\u2013Vicol preprint could be read in this environment.',
          'The description of alternatives (A)\u2013(D) is taken from the Lean reference docstrings and standard accounts; the Clay PDF is linked but could not be fetched.',
          'The speculation lane is deliberately thin. Absence of an item there is not a judgement.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'did-it-solve-the-clay-problem',
      title: 'Did this solve the Millennium Prize problem?',
      question: 'Did this solve the Millennium Prize problem?',
      visual: {
        scene: 'claims-board', label: 'source-quoted', caption: 'Claims about the result, each with a status and the source that makes it',
        params: {
          note: 'Four statuses. Established: Lean-checked at the pinned commit. Claimed: a named party said it. Disputed: named parties disagree. Open: nobody claims it is settled. Every quotation is attributed to the report it was taken from.',
          toggleLabel: 'Show only what is machine-checked',
          toggleHint: 'The key interaction: everything that disappears is interpretation, attribution or process.',
          checkedNote: 'What remains is the entire mathematical content of the announcement.',
          statuses: {
            established: { label: 'Established (Lean-checked)', cls: 'ok' },
            claimed: { label: 'Claimed by a party', cls: 'ns' },
            disputed: { label: 'Disputed', cls: 'warn' },
            open: { label: 'Open', cls: 'bad' },
          },
          claims: [
            { status: 'established', claim: 'For every $\\nu \\gt 0$ there are smooth decaying data and a smooth decaying force with no global smooth bounded-energy solution on $\\R^3$.', by: 'Lean, <code>navier_stokes_breakdown_R3</code>; the transcription of alternative (C)',
              detail: `Checked at commit <code>f9e8bc5</code> against the Comparator reference copied from Google DeepMind\u2019s Formal Conjectures. Axioms: <code>propext</code>, <code>Classical.choice</code>, <code>Quot.sound</code>; <code>sorry_count: 0</code> per <code>formalization.yaml</code>. The proof\u2019s witness datum is identically zero.`,
              refs: [L('NavierStokes/ComparatorSolution.lean', 16, 'navier_stokes_breakdown_R3'), S('formalization-yaml')] },
            { status: 'established', claim: 'The periodic analogue on $\\R^3/\\mathbb{Z}^3$: smooth periodic data and force with no global smooth periodic solution.', by: 'Lean, <code>navier_stokes_breakdown_periodic</code>; the transcription of alternative (D)',
              detail: `Same checking chain and axioms. The class requires velocity and pressure to be 1-periodic, following, per the reference docstring, \u201cthe errata appended to the Clay problem statement\u201d.`,
              refs: [L('NavierStokes/ComparatorSolution.lean', 23, 'navier_stokes_breakdown_periodic'), L('ComparatorChallenges/NavierStokes.lean', 262, 'NavierStokesExistenceAndSmoothnessPeriodic')] },
            { status: 'established', claim: 'A smooth, divergence-free, rapidly decaying Euler datum on $\\R^3$ has no global smooth bounded-energy solution.', by: 'Lean, <code>euler_breakdown_R3</code>',
              detail: `The statement names only the decay class (<code>InitialVelocityConditionDecay</code>: smooth, divergence-free, every derivative decaying faster than any polynomial) and the ruled-out class (<code>EulerExistenceAndSmoothnessR3</code>: global, smooth, square-integrable at each time, uniformly bounded energy). Compact support appears in the next statement, which the proof witnesses with the same datum. Checked against a reference specialised from the Formal Conjectures Navier\u2013Stokes file to zero viscosity and zero force. Not part of the Clay problem.`,
              refs: [L('Euler/Solution.lean', 33, 'euler_breakdown_R3'), L('ComparatorChallenges/Euler.lean', 77, 'EulerExistenceAndSmoothnessR3'), L('ComparatorChallenges/Euler.json', 6, 'Euler.euler_breakdown_R3 (challenge configuration)')] },
            { status: 'established', claim: 'A nonzero, smooth, compactly supported, divergence-free Euler datum has a finite maximal lifespan $T^* \\le 1$ in the all-order Sobolev class, with divergent $C^1$ norm and divergent vorticity integral at $T^*$, and no global smooth bounded-energy solution.', by: 'Lean, <code>exists_compact_smooth_euler_singularity</code>',
              detail: `The quantitative statement: existence on $[0,T]$ exactly for $T \\lt T^*$, bounded energy on $[0,T^*)$, $\\limsup \\norm{v}_{C^1} = \\infty$, $\\int_0^{T^*}\\norm{\\omega}_{\\Linf}\\dd t = \\infty$. In the proof the datum is the one used for <code>euler_breakdown_R3</code>; the statement itself is a separate existential.`,
              refs: [L('Euler/Solution.lean', 43, 'exists_compact_smooth_euler_singularity')] },
            { status: 'claimed', claim: '\u201cThese are alternatives (C) \u2026 and (D) \u2026 in the Clay Mathematics Institute\u2019s official problem description.\u201d', by: 'The repository README (OpenAI)',
              detail: `The README\u2019s wording, verbatim: \u201cThese are alternatives <b>(C)</b> \u201cBreakdown of Navier\u2013Stokes solutions on \u211d\u00b3\u201d and <b>(D)</b> \u201cBreakdown of Navier\u2013Stokes Solutions on \u211d\u00b3/\u2124\u00b3\u201d in the Clay Mathematics Institute\u2019s official problem description of the Navier\u2013Stokes existence and smoothness Millennium Prize Problem.\u201d The README links both letters to page 2 of the description, which does list breakdown as an acceptable resolution. What supports the claim: the Lean reference was written by a third party (Formal Conjectures) and its docstrings cite the description\u2019s numbered conditions. What no machine checked: that the transcription matches the PDF. The PDF could not be fetched here, so the guide records the claim as the README\u2019s.`,
              refs: [S('lean-readme'), { url: 'https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf#page=2', label: 'Clay description, page 2 (PDF)' }, S('formal-conjectures')] },
            { status: 'claimed', claim: 'OpenAI will not claim the Millennium Prize.', by: 'OpenAI, as reported',
              detail: `The Next Web quotes OpenAI\u2019s publication as saying the result \u201cresolves the Navier-Stokes Millennium Prize problem by establishing statement \u2018C\u2019 (and also \u2018D\u2019) in the official Millennium Prize formulation\u201d and that \u201cWe do not intend to claim the Millennium Prize for this result.\u201d Wikipedia\u2019s article on the dispute likewise records that OpenAI stated it would not claim the prize. The guide did not find a first-party page it could read; the quotations are The Next Web\u2019s.`,
              refs: [S('press-tnw-prize'), S('wiki-priority')] },
            { status: 'disputed', claim: '\u201cThe Navier\u2013Stokes problem is solved.\u201d', by: 'Some headlines, and the Institute\u2019s provisional \u201capparently been settled\u201d, on one side; mathematicians quoted by Scientific American and Implicator on the other',
              detail: `The Clay Mathematics Institute\u2019s news item of 11 September, as indexed, says the problem \u201chas apparently been settled\u201d, pending its review. Quanta\u2019s headline of 8 September: \u201cAI Has Solved One of Math\u2019s $1 Million Millennium Prize Problems\u201d. Fortune: \u201cOpenAI says it cracked Navier-Stokes\u201d. Science News: \u201cAI may have solved one of math\u2019s biggest puzzles, raising controversy\u201d. ScienceABC: \u201cWhat Was Proved, And Why It Isn\u2019t Over\u201d, noting that (C) and (D) are addressed while the unforced alternatives are untouched. Scientific American: \u201cDid OpenAI solve the wrong Navier-Stokes problem?\u201d, quoting Luis Silvestre: \u201cThe Clay problem is settled, but the main problem for the Navier-Stokes equations is not.\u201d Implicator reports that the official formulation permits the force and that most working mathematicians exclude it from the question they care about. The disagreement is about which problem \u201cthe\u201d problem is; the guide reports both readings.`,
              refs: [S('clay-announcement'), S('press-quanta'), S('press-fortune'), S('press-sciencenews'), S('press-scienceabc'), S('press-sciam'), S('press-implicator')] },
            { status: 'disputed', claim: 'The method extends to the unforced equations.', by: 'Tao (expectation, as indexed and reported) versus Constantin\u2013Ignatova\u2013Vicol (as reported)',
              detail: `Tao\u2019s post of 7 September, as indexed by search, says it is expected that such singularities can also be constructed without the forcing term; OfficeChai and Fortune report him seeing no obvious obstacle to pushing the smooth-forcing methods to Navier\u2013Stokes. Constantin, Ignatova and Vicol (arXiv:2609.20803) respond to the OpenAI announcement by proving that solutions with the construction\u2019s anisotropic bounds and axisymmetric core are regular when the force is real-analytic; Scientific American reports this as showing that the blowup disappears once the force is removed and that the method cannot work without a contrived force. Neither primary source could be read in full here.`,
              refs: [S('tao-blog'), S('press-fortune'), S('press-officechai-tao'), S('arxiv-civ'), S('press-sciam')] },
            { status: 'open', claim: 'The Clay Mathematics Institute has accepted the result.', by: 'Not yet; the Institute\u2019s position, as reported',
              detail: `The Institute\u2019s own news item, dated 11 September and cited here as indexed by search, says it \u201cshares in the excitement of the global mathematical community as we contemplate the announcement that the Navier-Stokes problem has apparently been settled\u201d; The Decoder carries the same wording and the hope \u201cto see waves of new human understanding unleashed as the innovations behind this work are analyzed and interrogated\u201d. Implicator reports president Martin Bridson calling the announcement exciting and the evaluation \u201cdeliberately unhurried\u201d and \u201cabsolutely rigorous\u201d, and that the Institute still lists the problem as unsolved. Decrypt and Implicator report the prize rules as publication in a peer-reviewed journal and a two-year wait after acceptance by the community before a committee is convened. No Institute page could be fetched in full.`,
              refs: [S('clay-announcement'), S('press-implicator'), S('press-decoder'), S('press-decrypt'), S('clay-page')] },
            { status: 'open', claim: 'The proof has been peer reviewed.', by: 'formalization.yaml; press reports',
              detail: `The repository\u2019s own metadata: <code>review: status: "self-assessed"</code>. The Lean check certifies that the proof proves the Lean statements; it is not a review of the statement choice or of the papers. ScienceABC describes the result as not yet verified by independent mathematicians, and Science News reports it as a possible solution amid controversy. This guide found no refereed publication as of 4 October 2026.`,
              refs: [S('formalization-yaml'), S('press-scienceabc'), S('press-sciencenews')] },
            { status: 'open', claim: 'Blowup, or regularity, for the unforced Navier\u2013Stokes equations (alternatives (A) and (B)).', by: 'Nobody claims it',
              detail: `The README does not claim it, no theorem in the repository concerns the unforced Navier\u2013Stokes equations, and the forced result is logically compatible with either answer. Tao\u2019s forecast and the reported obstruction are both on the board above.`,
              refs: [S('lean-readme'), L('ComparatorChallenges/NavierStokes.lean', 45, 'navier_stokes_breakdown_R3 (reference docstring: breakdown alternatives only)')] },
          ],
        },
      },
      status: {
        changes: 'The verb. \u201cProved\u201d is machine-checked; \u201cresolves alternative (C)\u201d is the README\u2019s claim; \u201csolved the problem\u201d is contested.',
        bounded: 'Four statements, checked by Lean against reference statements a third party wrote. Toggle the board to see only those.',
        fails: 'Nothing fails. The prize question is one of interpretation and process, and the Institute has not ruled.',
      },
      understand: `
<p>The honest answer takes three sentences. Four theorems were proved and machine-checked, and two of them match, symbol for symbol, the Lean transcription of the two \u201cbreakdown\u201d alternatives that the official problem description offers as acceptable resolutions. Whether that counts as solving <em>the</em> Navier\u2013Stokes problem is contested, because, as Scientific American and Implicator report, many mathematicians mean the unforced equations; the Clay Mathematics Institute has said the problem has \u201capparently been settled\u201d while, as Implicator reports, calling its evaluation \u201cdeliberately unhurried\u201d, and no peer-reviewed publication or prize decision exists as of early October 2026.</p>
<p>The board sorts what people have said into four statuses. <strong>Established</strong> means Lean-checked at the pinned commit. <strong>Claimed</strong> means a named party said it. <strong>Disputed</strong> means named parties disagree. <strong>Open</strong> means nobody claims it is settled.</p>
<p>Switch on \u201cshow only what is machine-checked\u201d and watch the board empty. What remains is the entire mathematical content. Everything that disappears is interpretation, attribution or process, which does not make it unimportant.</p>`,
      inspect: `
<h3>Alternatives (A) to (D)</h3>
<p>The official description offers four statements, any one of which resolves the problem. (A) and (B) are <em>existence and smoothness</em>: for every smooth, divergence-free, rapidly decaying datum on $\\R^3$ (A), or every smooth periodic datum on $\\R^3/\\mathbb{Z}^3$ (B), with the force identically zero, a global smooth solution exists. (C) and (D) are <em>breakdown</em>: there exist a datum and a smooth force, decaying on $\\R^3$ for (C), periodic in space and decaying in time for (D), for which no global smooth solution exists. The Lean reference transcribes (C) and (D) with the description\u2019s numbered conditions recorded in its docstrings: (4) for the datum, (5) and (9) for the force, (6), (7), (10) and (11) for the solution. The README\u2019s claim is that the two proved theorems are those two statements.</p>
<h3>Permitted, but not the question most mathematicians mean, as reported</h3>
<p>A smooth force is allowed by the letter of (C). Implicator reports that most working mathematicians exclude it from the question they care about, and Scientific American reports the objection that the forced variant is disconnected from reality. The mathematical reason behind the objection is the residual identity in [[scene:concentration/not-yet-a-proof|chapter 1]]: any smooth divergence-free field solves the forced equation for <em>some</em> force, so a forced blowup theorem is, in part, a theorem about the regularity of a force one gets to design. The unforced question asks whether the fluid\u2019s own nonlinearity, unassisted, can produce the singularity. The other reading, that the official description offers (C) as an acceptable resolution and the result establishes it, is OpenAI\u2019s, as quoted by The Next Web, and provisionally the Institute\u2019s, as indexed. Luis Silvestre, as quoted by Scientific American: \u201cThe Clay problem is settled, but the main problem for the Navier-Stokes equations is not.\u201d Tao, writing the day before the announcement about the Alp\u00f6ge\u2013Buckmaster results, says (as indexed) that it is expected to be possible without the forcing term. An expectation, not a theorem.</p>
<h3>What acceptance would require</h3>
<p>As reported by Decrypt and Implicator, the prize rules require publication in a peer-reviewed journal and a two-year wait after acceptance by the community before a committee is convened; the Institute\u2019s 11 September statement says the problem has \u201capparently been settled\u201d, and Implicator reports its president calling the evaluation \u201cdeliberately unhurried\u201d. The repository\u2019s own metadata records <code>review: status: "self-assessed"</code>. Machine-checking certifies that the proof proves the Lean statement. Whether the Lean statement is the Clay statement, and whether the Clay statement is the question the field cares about, are both human judgements.</p>
<details class="more"><summary>Reading the README\u2019s claim against the Lean reference</summary>
<p>The reference file is a copy of Google DeepMind\u2019s Formal Conjectures transcription, written independently of the proof. The proof never imports it; Comparator checks that the submitted theorems have exactly the reference\u2019s types, using only the three permitted axioms. The chain is therefore: Fefferman\u2019s PDF \u2192 Formal Conjectures\u2019 Lean \u2192 Comparator reference \u2192 proved theorem. The first arrow is the one no machine checked, and it is where any dispute about transcription would live.</p></details>
<details class="more"><summary>The periodic pressure</summary>
<p>The reference requires the pressure, not only the velocity, to be 1-periodic, \u201cfollowing the errata appended to the Clay problem statement\u201d. This is a point where the transcription made a choice and recorded why; the guide has not verified the errata.</p></details>`,
      verify: {
        statements: [
          { title: 'README wording, verbatim (commit f9e8bc5)', html: '<p>\u201cFor every positive viscosity, we prove two results: <b>Whole space \u211d\u00b3:</b> There exist smooth initial data and forcing for which no global smooth solution with uniformly bounded kinetic energy exists. <b>Periodic torus \u211d\u00b3/\u2124\u00b3:</b> There exist smooth periodic initial data and forcing for which no global smooth solution exists. These are alternatives <b>(C)</b> \u201cBreakdown of Navier\u2013Stokes solutions on \u211d\u00b3\u201d and <b>(D)</b> \u201cBreakdown of Navier\u2013Stokes Solutions on \u211d\u00b3/\u2124\u00b3\u201d in the Clay Mathematics Institute\u2019s official problem description of the Navier\u2013Stokes existence and smoothness Millennium Prize Problem.\u201d</p><p>On Euler: \u201cWe construct smooth, compactly supported, divergence-free initial velocity on \u211d\u00b3 whose solution to the unforced incompressible Euler equations develops a singularity in finite time. The velocity\u2019s C\u00b9 norm becomes unbounded near that time, and the time integral of the vorticity\u2019s L\u221e norm diverges.\u201d</p>' },
          { title: 'formalization.yaml, verbatim excerpts', html: '<pre>status:\n  scope: "Full formalization of main results."\n  sorry_count: 0\n  sorry_in_definitions: 0\n  main_results: \u2026 axioms: propext, Classical.choice, Quot.sound (each)\nautomation:\n  methods:\n    - method: "agent"\n      models: ["GPT-6 Astra"]\n      framework: "Codex"\nreview:\n  status: "self-assessed"</pre>' },
          { title: 'Comparator challenge configuration', html: '<pre>"theorem_names": ["NavierStokes.Comparator.navier_stokes_breakdown_R3",\n                  "NavierStokes.Comparator.navier_stokes_breakdown_periodic"],\n"permitted_axioms": ["propext", "Quot.sound", "Classical.choice"]</pre><p>The Euler configuration names <code>Euler.euler_breakdown_R3</code> and <code>Euler.exists_compact_smooth_euler_singularity</code> with the same axioms.</p>' },
          { title: 'What the reference does not contain', html: '<p>The reference file\u2019s header states: \u201cThis reference includes the two breakdown alternatives\u201d, naming (C) and (D). It contains no statement of (A) or (B), and no theorem in the repository concerns the unforced Navier\u2013Stokes equations.</p>' },
        ],
        paper: [
          { src: 'clay-statement', where: 'Page 2, alternatives (A)\u2013(D); conditions (4)\u2013(11)', note: 'Linked, not read: the PDF could not be fetched in this environment. Condition numbers are taken from the Lean reference docstrings, which cite them.' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', file: 'NavierStokes/ComparatorSolution.lean', line: 16 },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_periodic', file: 'NavierStokes/ComparatorSolution.lean', line: 23 },
          { decl: 'Euler.euler_breakdown_R3', file: 'Euler/Solution.lean', line: 33 },
          { decl: 'Euler.exists_compact_smooth_euler_singularity', file: 'Euler/Solution.lean', line: 43 },
          { decl: 'navier_stokes_breakdown_R3 (reference header)', file: 'ComparatorChallenges/NavierStokes.lean', line: 45, note: '\u201cThis reference includes the two breakdown alternatives\u201d: (C) at line 45, (D) at line 46.' },
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothnessPeriodic', file: 'ComparatorChallenges/NavierStokes.lean', line: 262, note: 'Periodic pressure \u201cfollowing the errata appended to the Clay problem statement\u201d (docstring, lines 259\u2013260).' },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', file: 'ComparatorChallenges/NavierStokes.json', line: 6, note: 'The Navier\u2013Stokes challenge configuration.' },
          { decl: 'Euler.euler_breakdown_R3', file: 'ComparatorChallenges/Euler.json', line: 6, note: 'The Euler challenge configuration.' },
        ],
        context: [
          { src: 'lean-readme', note: 'The claim that the two theorems are alternatives (C) and (D), quoted verbatim above.' },
          { src: 'formalization-yaml', note: 'Review status \u201cself-assessed\u201d; automation metadata; sorry count.' },
          { src: 'clay-page', note: 'The Institute\u2019s problem page; reported by Implicator to still list the problem as unsolved. Not fetched.' },
          { src: 'clay-announcement', note: 'The Institute\u2019s own 11 Sept 2026 news item (\u201capparently been settled\u201d); found by search, cited as indexed, not fetched.' },
          { src: 'press-implicator', note: 'Reports the Institute\u2019s 11 Sept 2026 statement (\u201cdeliberately unhurried\u201d, \u201cabsolutely rigorous\u201d), that the problem is still listed as unsolved, and the prize rules.' },
          { src: 'press-decoder', note: 'Reports the Institute\u2019s \u201capparently been settled\u201d wording.' },
          { src: 'press-tnw-prize', note: 'Quotes OpenAI\u2019s \u201cestablishing statement \u2018C\u2019 (and also \u2018D\u2019)\u201d and \u201cWe do not intend to claim the Millennium Prize for this result.\u201d' },
          { src: 'press-quanta', note: 'Headline reporting the problem as solved.' },
          { src: 'press-sciencenews', note: 'Reports the result as a possible solution and the controversy.' },
          { src: 'press-sciam', note: 'Reports the \u201cwrong problem\u201d reading and quotes Luis Silvestre.' },
          { src: 'press-scienceabc', note: 'Explains (C)/(D) versus the unforced alternatives.' },
          { src: 'press-fortune', note: 'Reports OpenAI\u2019s claim and quotes Tao\u2019s \u201cwithout the forcing term\u201d sentence.' },
          { src: 'press-officechai-tao', note: 'Reports Tao on extending the methods.' },
          { src: 'wiki-priority', note: 'Records that OpenAI stated it would not claim the prize.' },
          { src: 'press-decrypt', note: 'Reports the prize rules (peer-reviewed publication, two-year wait).' },
        ],
        limits: [
          'The board is a sorting of sentences, not a ruling. The guide assigns statuses; the Institute, the authors and the field may disagree with the assignment.',
          'The Institute\u2019s wording is cited from search snippets of its own news item and from the outlets that carried it; no Institute page could be fetched in full.',
          '\u201cEstablished\u201d means checked by Lean against a third-party reference statement. It does not mean the reference statement is the Clay statement; that correspondence is a human reading.',
          'The claim that OpenAI will not seek the prize rests on press reports and Wikipedia; no first-party page was readable here.',
          'The summary of alternatives (A) and (B) (force identically zero, every admissible datum) follows the official description as it is commonly summarised and as the Lean reference’s condition numbers suggest; the PDF itself could not be fetched here.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'who-did-what-first',
      title: 'Where the ideas came from, and who said what',
      question: 'Where did the ideas come from, and who said what?',
      visual: {
        scene: 'timeline', label: 'source-quoted', caption: 'An attributed timeline: each entry names who reported it',
        params: {
          note: 'Click an entry to open it. Dates marked \u201cas reported\u201d come from the named outlet, not from a document the guide could read. The allegation and the responses are presented with the same prominence; the guide adjudicates neither.',
          filters: [
            { value: 'all', label: 'Everything' },
            { value: 'math', label: 'Mathematics and preprints' },
            { value: 'dispute', label: 'The dispute, both sides' },
            { value: 'result', label: 'OpenAI\u2019s account of its run' },
            { value: 'institution', label: 'Institutions and press' },
            { value: 'checked', label: 'Checked in the repository clone' },
          ],
          events: [
            { when: '2024-10-30', label: 'Oct 2024, after nearly a decade', who: 'C\u00f3rdoba and Mart\u00ednez-Zoroa', what: 'The vorticity-layer-cascade programme; IPM singularities with a smooth source (arXiv:2410.22920).', cls: 'euler', kind: 'math', basis: 'reported',
              detail: `ICMAT describes the strategy as developed over nearly a decade: an infinite sequence of smaller, more concentrated vorticity layers, each regular on its own, with larger-scale strain amplifying smaller-scale vorticity and self-interactions suppressed. The arXiv abstract of the 2024 paper states that smooth, finite-energy solutions of the 2D incompressible porous media equation with a compactly supported smooth source develop singularities in finite time.`,
              refs: [S('cordoba-mz-ipm'), S('icmat')] },
            { when: '2026-08-22', label: '22 Aug 2026 (as reported)', who: 'Buckmaster and Alp\u00f6ge', what: 'Reach their Euler blowup result, per Decrypt.', cls: 'euler', kind: 'math', basis: 'reported',
              detail: `Decrypt reports Buckmaster\u2019s statement as saying that the two chased a related proof for almost a year and finished by 22 August; Implicator reports the same date as the completion of Lean verification. The date is the outlets\u2019 account of Buckmaster\u2019s statement.`,
              refs: [S('press-decrypt'), S('press-implicator'), S('buckmaster-statement')] },
            { when: '2026-08-28', label: '28 Aug \u2013 1 Sept 2026 (as reported)', who: 'OpenAI', what: 'Says training of its internal model began on 28 August; on 1 September, after rumours, it pointed the model at every open Millennium problem.', cls: 'ns', kind: 'result', basis: 'reported',
              detail: `As summarised by NYU Shanghai\u2019s RITS page from OpenAI\u2019s announcement: training on a model \u201csignificantly more capable than GPT-6 Astra\u201d began 28 August; on 1 September, after hearing rumours that two Millennium Prize problems had been solved (a rumour it later connected to Alp\u00f6ge and Buckmaster, per Unite.AI), the company directed it at every open problem on the list. This is OpenAI\u2019s account of its own timeline, as reported.`,
              refs: [S('press-rits'), S('press-unite'), S('openai-blog')] },
            { when: '2026-09-03', label: '3 Sept 2026 (as reported)', who: 'Buckmaster', what: 'Emails a mathematician at OpenAI about the project, amid rumours that a major problem had been solved.', cls: 'warn', kind: 'dispute', basis: 'contested',
              detail: `Unite.AI reports Buckmaster\u2019s account: on 3 September, amid rumours that Anthropic had solved a major problem, he emailed a mathematician at OpenAI to say the work was a personal collaboration, unaffiliated with either company, and would be posted shortly. This is Buckmaster\u2019s account as reported; OpenAI\u2019s statement, below, says its researchers and agents did not see the work until it was public.`,
              refs: [S('press-unite'), S('buckmaster-statement')] },
            { when: '2026-09-05', label: '5 Sept 2026 (as reported)', who: 'OpenAI', what: 'Says its agents reached the Navier\u2013Stokes result after about 88 hours; roughly 10,000 agents; Euler by about 100 agents in about 50 hours.', cls: 'ns', kind: 'result', basis: 'reported',
              detail: `Interesting Engineering reports OpenAI\u2019s account: almost 100 agents spent about 50 hours on the unforced Euler problem; that result was fed into the Navier\u2013Stokes effort, with Codex consolidating ideas between agent groups; roughly 10,000 agents reached the Navier\u2013Stokes result on 5 September after about 88 hours; a further 17 hours of Lean formalization followed. Quanta and The Next Web carry the same headline numbers. All figures are OpenAI\u2019s.`,
              refs: [S('press-ie'), S('press-rits'), S('press-quanta'), S('press-tnw-prize')] },
            { when: '2026-09-06', label: '6 Sept 2026', who: 'Buckmaster and S\u00e9bastien Bubeck', what: 'A call between the two. Two accounts of it exist.', cls: 'warn', kind: 'dispute', basis: 'contested',
              detail: `<p><b>Buckmaster\u2019s account</b> (Fortune, TechCrunch, Unite.AI): on the call he learned that an internal model had produced a roughly 100-page proof of forced Navier\u2013Stokes blowup along \u201cthe exact same line of attack\u201d; he alleges a proposal that he publish without Alp\u00f6ge, who works at Anthropic, and that he was asked why he would ruin his career; The Next Web quotes his statement that Bubeck \u201ctwice asserted that he wanted Levent removed from authorship\u201d.</p><p><b>Bubeck\u2019s account</b> (The Next Web, Decrypt): he denies wanting Alp\u00f6ge removed from authorship, says the call \u201cturned hostile\u201d, and apologised for the career remark as \u201cthis extremely poor choice of words\u201d; he says he first contacted Alp\u00f6ge to coordinate the releases, that his remark was that \u201cit would be simpler if Levent was not an Anthropic employee\u201d because an Anthropic employee authoring OpenAI\u2019s work would be inappropriate, and he posted messages he says show he offered the pair the option to publish first.</p><p>The guide reproduces both and decides nothing.</p>`,
              refs: [S('press-fortune'), S('press-techcrunch'), S('press-unite'), S('press-tnw-bubeck'), S('press-decrypt')] },
            { when: '2026-09-07a', label: '7 Sept 2026', who: 'Terence Tao', what: 'Blog post on the Alp\u00f6ge\u2013Buckmaster smooth-forcing results for IPM, Boussinesq and 3D Euler.', cls: 'euler', kind: 'math', basis: 'reported',
              detail: `The post (as indexed; it could not be fetched here) describes the work as building on C\u00f3rdoba and Mart\u00ednez-Zoroa and says it is expected that such singularities can also be constructed without the forcing term. OfficeChai reports Tao calling the work \u201ca remarkable achievement\u201d and seeing no obvious obstacle to pushing the methods to Navier\u2013Stokes; Fortune reports the same remark, made on Mastodon.`,
              refs: [S('tao-blog'), S('press-officechai-tao'), S('press-fortune')] },
            { when: '2026-09-07b', label: '7 Sept 2026, about 12 hours before the announcement (as reported)', who: 'Buckmaster, partly on behalf of Alp\u00f6ge', what: 'Posts three preprints with Lean formalizations and a public statement alleging a leak.', cls: 'warn', kind: 'dispute', basis: 'contested',
              detail: `Wikipedia\u2019s article on the dispute and Unite.AI report that about twelve hours before OpenAI\u2019s announcement Buckmaster posted three preprints, on finite-time blowup with smooth forcing for IPM, 2D Boussinesq and 3D Euler, with Lean formalizations, made with Claude and Codex, and a statement, on behalf of himself and partly Alp\u00f6ge, claiming that their Euler advances were leaked to OpenAI a few days earlier and may have inspired the prompts given to the agents. The statement also raises the question of whether data from their Codex sessions reached OpenAI\u2019s models. The guide links the statement; it could not be fetched here.`,
              refs: [S('buckmaster-statement'), S('wiki-priority'), S('press-unite')] },
            { when: '2026-09-08a', label: '8 Sept 2026', who: 'OpenAI', what: 'Announces both results: a blog post and two papers.', cls: 'ns', kind: 'result', basis: 'reported',
              detail: `The blog post and the two PDFs are the primary sources; the announcement thread describes the Navier\u2013Stokes solution as a vortex that \u201cspirals inward and gets increasingly elongated\u201d. Quanta (8 September), Fortune and Science News report the announcement; Quanta and The Next Web carry the agent and hour counts above.`,
              refs: [S('openai-blog'), S('openai-x'), S('press-quanta'), S('press-fortune'), S('press-sciencenews')] },
            { when: '2026-09-08b', label: '8 Sept 2026 (as reported)', who: 'OpenAI, Bubeck and Sam Altman', what: 'Respond to the allegation.', cls: 'warn', kind: 'dispute', basis: 'contested',
              detail: `<p><b>OpenAI\u2019s statement</b>, posted on X and quoted by OfficeChai and Wikipedia: \u201cWe congratulate Levent Alp\u00f6ge and Tristan Buckmaster on their remarkable mathematical work\u201d; \u201cWe (the researchers and the agents) did not see any of their work through any means until they released it publicly \u2014 in particular, no specific user data was accessed in order to solve this problem. While unlikely, we cannot rule out that de-identified data derived from their usage of our products helped improve our models.\u201d</p><p><b>Bubeck</b>, as reported by OfficeChai and Decrypt: OpenAI did not use the pair\u2019s prompts or proofs to prompt its models (the outlets give slightly different wordings, so the sentence is paraphrased here); he called Buckmaster\u2019s account \u201cfalse and inflammatory\u201d.</p><p><b>Altman</b>, as reported by Decrypt and The Next Web: Bubeck \u201cacted with integrity and generosity throughout\u201d, and OpenAI offered to let the pair publish first once it concluded that their result was Euler rather than full Navier\u2013Stokes.</p>`,
              refs: [S('openai-x-statement'), S('press-officechai-openai'), S('press-officechai-bubeck'), S('press-decrypt'), S('press-tnw-bubeck'), S('wiki-priority')] },
            { when: '2026-09-10a', label: '10 Sept 2026', who: 'The repository', what: 'openai/NavierStokesAndEuler at commit f9e8bc5, the second of two public commits (the first is dated 8 Sept).', cls: 'ok', kind: 'repo', basis: 'checked',
              detail: `Checked in the clone: one commit, <code>f9e8bc5b</code>, author date 2026-09-10 07:51 (UTC\u22124). Lean 4.34.0-rc2; <code>formalization.yaml</code> records sorry count 0, the three standard axioms, automation by agent (GPT-6 Astra, Codex) and review status \u201cself-assessed\u201d. On 4 October 2026 <code>git ls-remote</code> showed <code>main</code> still at this commit.`,
              refs: [S('lean-repo'), S('formalization-yaml')] },
            { when: '2026-09-10b', label: '10 Sept 2026 (as reported)', who: 'OpenAI', what: 'Withdraws sponsorship of the Caltech Mathathon after an open letter by 771 mathematicians.', cls: '', kind: 'institution', basis: 'reported',
              detail: `The Next Web and Implicator report that an open letter, with 771 signatories when published on 10 September and warning of \u201cslop mathematics\u201d, led OpenAI to withdraw its sponsorship of a student-run Caltech contest that day; Implicator reports that the organisers redesigned the contest and that other sponsors remained listed.`,
              refs: [S('press-tnw-caltech'), S('press-implicator-caltech')] },
            { when: '2026-09-11a', label: '11 Sept 2026 (as reported)', who: 'Clay Mathematics Institute', what: 'Statement: the problem has \u201capparently been settled\u201d; evaluation \u201cdeliberately unhurried\u201d; still listed as unsolved.', cls: '', kind: 'institution', basis: 'reported',
              detail: `The Institute\u2019s own news item of 11 September, as indexed by search, says it \u201cshares in the excitement of the global mathematical community as we contemplate the announcement that the Navier-Stokes problem has apparently been settled\u201d. The Decoder carries that wording and the hope \u201cto see waves of new human understanding unleashed as the innovations behind this work are analyzed and interrogated\u201d. Implicator reports president Martin Bridson calling the announcement exciting and the evaluation \u201cdeliberately unhurried\u201d and \u201cabsolutely rigorous\u201d, with the problem still listed as unsolved.`,
              refs: [S('clay-announcement'), S('press-implicator'), S('press-decoder')] },
            { when: '2026-09-11b', label: '11 Sept 2026', who: 'ICMAT', what: 'Describes the C\u00f3rdoba\u2013Mart\u00ednez-Zoroa programme and says the teams\u2019 Euler and Navier\u2013Stokes announcements built on it.', cls: 'euler', kind: 'math', basis: 'reported',
              detail: `ICMAT\u2019s news article states that Alp\u00f6ge and Buckmaster took the programme as their starting point and, \u201cwith significant assistance from Claude and different versions of Codex\u201d, extended it to smooth forces for IPM, Boussinesq and 3D Euler, and that the programme served as the basis for the teams that announced advances on Euler and Navier\u2013Stokes with AI tools, the Millennium announcement included. This is ICMAT\u2019s attribution.`,
              refs: [S('icmat')] },
            { when: '2026-09-11c', label: '11 Sept 2026 (as reported)', who: '25 Fields medalists', what: 'Declaration \u201cA Severe Misalignment of AI in Mathematics\u201d.', cls: '', kind: 'institution', basis: 'reported',
              detail: `A declaration posted on Terence Tao\u2019s blog and reported by Implicator, signed by 25 Fields medalists, among them Deligne, Scholze, Viazovska, Hairer, Villani and Bhargava, saying that rushed AI announcements leave too little time for write-ups or citations and raise \u201csevere attribution and plagiarism questions\u201d, and that AI companies\u2019 use of open problems as benchmarks is \u201cseverely misaligned\u201d with the goals of the field.`,
              refs: [S('fields-declaration'), S('press-fields')] },
            { when: '2026-09-18', label: '18 Sept 2026', who: 'ICMAT', what: 'Spain\u2019s Prime Minister and Science Minister visit ICMAT to recognise C\u00f3rdoba and Mart\u00ednez-Zoroa.', cls: '', kind: 'institution', basis: 'reported',
              detail: `ICMAT reports the visit \u201con the occasion of recent milestones in the study of fluid equations, driven by the work of\u201d C\u00f3rdoba and Mart\u00ednez-Zoroa, and quotes the minister saying ICMAT\u2019s work \u201chas helped take a giant step toward solving one of the Millennium Problems\u201d.`,
              refs: [S('icmat-visit')] },
            { when: '2026-09-20', label: 'September 2026', who: 'Follow-up preprints and commentary', what: 'Cao\u2013Chi\u2013Nie; Alp\u00f6ge\u2013Buckmaster\u2013Coiculescu (IPM); a self-similar-swirl note; Constantin\u2013Ignatova\u2013Vicol; Scientific American\u2019s \u201cwrong problem\u201d article.', cls: 'ns', kind: 'math', basis: 'reported',
              detail: `arXiv:2609.10262 builds on \u201cthe compact forced blowup solution of OpenAI\u201d; arXiv:2609.16470 extends the C\u00f3rdoba\u2013Mart\u00ednez-Zoroa IPM blowup to uniformly space-time smooth forcing; arXiv:2609.17642 revisits a 1998 exact solution in the construction\u2019s similarity variables; arXiv:2609.20803 (Constantin, Ignatova, Vicol) responds to the OpenAI announcement by proving regularity, under real-analytic forcing, for solutions with the construction\u2019s anisotropic bounds and axisymmetric core; Scientific American reports this as showing that the blowup disappears once the force is removed. Abstracts and snippets only.`,
              refs: [S('arxiv-cao-chi-nie'), S('arxiv-ipm-smooth'), S('arxiv-swirl'), S('arxiv-civ'), S('press-sciam')] },
            { when: '2026-10-04', label: '4 Oct 2026', who: 'This guide', what: 'Status check: repository unchanged; no refereed publication found; prize not awarded, as reported.', cls: 'ok', kind: 'repo', basis: 'checked',
              detail: `<code>git ls-remote</code> on 4 October 2026 shows <code>main</code> at <code>f9e8bc5</code>. A web search found no refereed publication of either paper and no new Institute decision; those two negatives are search results, not facts about the world.`,
              refs: [S('lean-repo'), S('press-implicator')] },
          ],
        },
      },
      status: {
        changes: 'Who is speaking. Every entry is tagged: checked in the repository clone, reported by a named outlet, or contested between parties.',
        bounded: 'The repository facts: one commit, 10 September 2026, unchanged on 4 October; four theorems; metadata naming the tools.',
        fails: 'Adjudication. The guide cannot see prompts, drafts, logs or the papers, and does not decide the \u201cinspired by\u201d question.',
      },
      understand: `
<p>Attribution is disputed because two groups reached neighbouring results within days, both using AI tools, and one says the other learned of its work first. Tristan Buckmaster\u2019s statement, posted about twelve hours before OpenAI\u2019s announcement according to Wikipedia and Unite.AI, says his and Levent Alp\u00f6ge\u2019s Euler advances were leaked to OpenAI days earlier and may have inspired the agents\u2019 prompts. OpenAI\u2019s statement, posted on X and quoted by OfficeChai and Wikipedia, says neither its researchers nor its agents saw that work before it was public, while adding that it \u201ccannot rule out\u201d that de-identified product data helped improve its models.</p>
<p>This guide takes no side, for a plain reason: deciding would need prompts, drafts, access logs and the two papers, none of which can be examined here. What can be examined is the repository, whose public history shows two commits, dated 8 and 10 September 2026, and the public record of who said what, when, according to whom.</p>
<p>Every entry carries a tag: <em>checked</em> in the clone, <em>reported</em> by a named outlet, or <em>contested</em> between the parties.</p>`,
      inspect: `
<p>What the constructions have in common is itself contested. Buckmaster\u2019s statement, per Fortune, says OpenAI\u2019s Navier\u2013Stokes proof followed \u201cthe exact same line of attack\u201d; OpenAI, per Wikipedia\u2019s summary, claims \u201csignificant\u201d differences in the Euler case. The papers could not be read here, so what follows rests on ICMAT\u2019s description, Tao\u2019s post as indexed, and the organisation of the Lean sources, which shows how the proofs are built, not where the ideas came from.</p>
<h3>Cascades: C\u00f3rdoba\u2013Mart\u00ednez-Zoroa, Alp\u00f6ge\u2013Buckmaster, OpenAI\u2019s Euler</h3>
<p>ICMAT describes a \u201cvorticity layer cascade\u201d: an infinite sequence of smaller, more concentrated vorticity layers, each regular on its own, arranged so that the strain generated by the larger layers amplifies the smaller ones, with self-interactions and feedback suppressed. ICMAT states that Alp\u00f6ge and Buckmaster took this as their starting point and, with AI assistance, extended it to a uniformly smooth force; Tao\u2019s post, as indexed, says their ODEs \u201cappear to be more unstable\u201d and their \u201chigh frequency corrections appear to have better spatial localization properties\u201d. ICMAT also counts the teams\u2019 Euler and Navier\u2013Stokes announcements, OpenAI\u2019s included, as built on the programme. The Lean sources for Euler are consistent with a staged construction: the Euler library is an induction over \u201cpackets\u201d (<code>stages 0 := firstStage</code>, <code>stages (n+1) := successor</code>), the packet added at stage $n$ oscillates at frequency $k_n = \\exp\\!\\big(x_n/(J+n)^2\\big)$ with $x_{n+1} = (J+n)^2 x_n$, and its wave normal is aligned with the shear of the flow built so far. That is a scale cascade in the Lean, whatever its provenance.</p>
<h3>The self-similar vortex: OpenAI\u2019s Navier\u2013Stokes</h3>
<p>The Navier\u2013Stokes library is organised differently: a similarity coordinate $q$ solving $q - z^2 q^{2h} = 1 - t$, an axisymmetric base profile in the variable $X = r^2/2q$, and correction \u201ccycles\u201d of high-frequency waves on an active annulus, each cycle improving the residual by a fixed power of $q$. This matches OpenAI\u2019s own description of an inward-spiralling, elongating vortex. ICMAT nonetheless counts the Navier\u2013Stokes announcement among the programme\u2019s results, and Buckmaster says the line of attack was his; file organisation cannot say whether a similarity coordinate with correction cycles is a different idea from a layer cascade or the same idea in other clothes. The guide records the difference and draws no conclusion from it.</p>
<h3>What would settle it, and what cannot</h3>
<p>Public timestamps settle only the order of posting: Buckmaster\u2019s preprints and statement, on 7 September, preceded OpenAI\u2019s announcement by about twelve hours, as reported. Each side also dates its own completion earlier: Buckmaster\u2019s statement, as reported, to 22 August; OpenAI, in its own account, to 5 September. Neither order answers the question of influence. That would take the prompts, the agents\u2019 transcripts and the drafts, none of which is public, and this guide does not speculate about them.</p>
<details class="more"><summary>What the Lean module names suggest, and do not</summary>
<p>File-name counts under <code>Euler/</code>: \u201cPacket\u201d in 677 names, \u201cStage\u201d in 23; under <code>NavierStokes/</code>: \u201cWave\u201d in 25, \u201cCycle\u201d in 13, with the similarity coordinates and profile in the central modules. Names show how the formalisers organised the proof, not where the ideas came from.</p></details>
<details class="more"><summary>The two accounts of the 6 September call, side by side</summary>
<p><b>Buckmaster</b> (per Fortune, TechCrunch and Unite.AI): he was told an internal model had a roughly 100-page proof of forced Navier\u2013Stokes blowup; he says a proposal was made to publish without Alp\u00f6ge, and that he was asked why he would ruin his career. <b>Bubeck</b> (per The Next Web and Decrypt): he denies wanting Alp\u00f6ge removed, says the call \u201cturned hostile\u201d, and apologised for the career remark as an \u201cextremely poor choice of words\u201d; he says he first contacted Alp\u00f6ge to coordinate the releases and posted messages he says show he offered the pair the option to publish first. <b>Altman</b> (per Decrypt and The Next Web): Bubeck \u201cacted with integrity and generosity throughout\u201d. The guide reproduces both and adjudicates neither.</p></details>`,
      verify: {
        statements: [
          { title: 'Repository commit (checked in the clone)', html: '<pre>commit  f9e8bc5b38b6e212696e8a30e3e91517af887bbd\ndate    2026-09-10 07:51:24 -0400\nlean    leanprover/lean4:v4.34.0-rc2</pre><p><code>git ls-remote https://github.com/openai/NavierStokesAndEuler</code> on 4 October 2026 returned <code>main \u2192 f9e8bc5b\u2026</code>; no later commit exists on the default branch.</p>' },
          { title: 'The Euler construction is staged (Lean, verbatim docstrings)', html: '<p>\u201cThe invariant for a finite, actually constructed packet stage. All fields refer to its genuine Euler state, source guards and frame. The cumulative bounds use only earlier indices.\u201d (<code>Euler/PacketInductionStage.lean</code>.) \u201cThe first stage of the actual induction is constructed from the literal compact base solution and the first same-Q packet choice.\u201d (<code>Euler/BaseInductionStage.lean</code>.) Scale recursion: <code>scaleSequence J X (n+1) = (J+n)\u00b2 \u00b7 scaleSequence J X n</code>; packet frequency <code>frequency J X n = exp(scaleSequence J X n / (J+n)\u00b2)</code>.</p>' },
          { title: 'The Navier\u2013Stokes construction is self-similar with correction cycles (Lean, verbatim docstrings)', html: '<p>\u201cHere <code>a = 2h</code>. We construct the unique positive solution of <code>\u03c4 = q - z\u00b2 q^a</code> for <code>0 \u003c a \u003c 1</code> and <code>\u03c4 \u003e 0</code>.\u201d (<code>NavierStokes/SimilarityCoordinates.lean</code>.) \u201cThe input of cycle <code>n</code> has accuracy <code>sigma n</code>. Its physical increment has index <code>n+1</code>, while a finite prefix after <code>J</code> cycles has accuracy <code>sigma J</code>.\u201d (<code>NavierStokes/ActualIterationLedger.lean</code>.) \u201cSpatial rescaling gives every positive viscosity while retaining singular time one.\u201d (<code>NavierStokes/R3/Theorem.lean</code>.)</p>' },
        ],
        paper: [
          { src: 'cordoba-mz-ipm', where: 'Abstract', note: 'The published instance of the programme, as ICMAT describes it.' },
          { src: 'arxiv-civ', where: 'Title and abstract', note: 'Discusses the OpenAI construction; reported by Scientific American as an obstruction.' },
        ],
        lean: [
          { decl: 'EulerPacketInduction.stages', file: 'Euler/PacketInfiniteConstruction.lean', line: 39, note: 'stages 0 := firstStage; stages (n+1) := successor. The induction over packets.' },
          { decl: 'EulerPacketInductionScales.Scales.firstStage', file: 'Euler/BaseInductionStage.lean', line: 22, note: '\u201cThe first stage of the actual induction\u201d (module docstring).' },
          { decl: 'scaleSequence', file: 'Euler/PacketSourceScaleChoice.lean', line: 226, note: 'x_{n+1} = (J+n)\u00b2 x_n, \u201cthe sequence in (37), now constructed rather than supplied\u201d.' },
          { decl: 'frequency', file: 'Euler/PacketSourceScaleSequence.lean', line: 21, note: 'Packet frequency exp(x_n/(J+n)\u00b2).' },
          { decl: 'SimilarityCoordinates.coordinateQ', file: 'NavierStokes/SimilarityCoordinates.lean', line: 124, note: 'The similarity coordinate q with q \u2212 z\u00b2 q^{2h} = \u03c4 (module docstring, lines 8\u201312).' },
          { decl: 'ExponentLedger.particular_gain_eq', file: 'NavierStokes/ExponentLedger.lean', line: 80, note: 'The fixed residual gain per correction cycle.' },
          { decl: 'sigma', file: 'NavierStokes/ActualIterationLedger.lean', line: 22, note: 'Cycle accuracy ledger (module docstring, lines 4\u201311).' },
          { decl: 'NavierStokesR3.theorem_1_1_with_initial_rest', file: 'NavierStokes/R3/Theorem.lean', line: 26, note: 'Viscosity by rescaling; singular time one.' },
        ],
        context: [
          { src: 'icmat', note: 'The programme description, the \u201cClaude and different versions of Codex\u201d sentence, and the attribution of the teams\u2019 announcements to the programme.' },
          { src: 'icmat-visit', note: 'The 18 Sept 2026 visit.' },
          { src: 'arxiv-ipm-smooth', note: 'Alpöge, Buckmaster and Coiculescu, uniformly space-time smooth forcing for IPM; per its indexed text the paper attributes the Boussinesq and Euler results to Alpöge and Buckmaster. Listed as context in the registry.' },
          { src: 'buckmaster-statement', note: 'The statement itself (PDF). Linked; could not be fetched here, so its content is cited through Wikipedia and Unite.AI.' },
          { src: 'wiki-priority', note: '\u201cAbout 12 hours before\u201d; the wording of the allegation; OpenAI\u2019s denial and the \u201ccannot rule out\u201d sentence.' },
          { src: 'press-unite', note: 'The 3 Sept contact, the 6 Sept call, the three preprints and the tools used.' },
          { src: 'press-fortune', note: 'The 6 Sept date of the call; \u201cthe exact same line of attack\u201d; Tao\u2019s \u201cremarkable achievement\u201d on Mastodon.' },
          { src: 'press-techcrunch', note: 'Buckmaster\u2019s allegations about authorship and the career remark.' },
          { src: 'press-tnw-bubeck', note: 'Bubeck\u2019s account and apology; Altman\u2019s post.' },
          { src: 'openai-x-statement', note: 'OpenAI\u2019s statement itself, on X; found by search, cited as indexed.' },
          { src: 'press-officechai-openai', note: 'OpenAI\u2019s statement, quoted.' },
          { src: 'press-officechai-bubeck', note: 'Bubeck\u2019s \u201cfalse and inflammatory\u201d and his denial.' },
          { src: 'press-decrypt', note: 'The 22 Aug date; Bubeck\u2019s denial (paraphrased); Altman\u2019s \u201cintegrity and generosity\u201d and the offer to publish first.' },
          { src: 'press-rits', note: 'OpenAI\u2019s timeline (28 Aug, 1 Sept, 5 Sept) as summarised.' },
          { src: 'press-ie', note: 'Agent and hour counts, including the Euler figures.' },
          { src: 'press-quanta', note: 'Announcement coverage.' },
          { src: 'press-sciencenews', note: 'Announcement coverage.' },
          { src: 'openai-blog', note: 'Primary announcement; not fetched.' },
          { src: 'openai-x', note: 'The vortex description.' },
          { src: 'tao-blog', note: 'Quoted as indexed.' },
          { src: 'press-officechai-tao', note: 'Tao\u2019s \u201cremarkable achievement\u201d and \u201cno obvious obstacle\u201d, as reported.' },
          { src: 'clay-announcement', note: 'The Institute\u2019s own 11 Sept news item; cited as indexed.' },
          { src: 'press-implicator', note: 'Clay statement; the 22 Aug Lean-verification date.' },
          { src: 'press-decoder', note: 'Clay wording.' },
          { src: 'fields-declaration', note: 'The declaration itself, on Tao\u2019s blog.' },
          { src: 'press-fields', note: 'Implicator\u2019s report of the declaration.' },
          { src: 'press-tnw-caltech', note: 'The sponsorship withdrawal.' },
          { src: 'press-implicator-caltech', note: 'The 771 signatories; the redesigned contest.' },
          { src: 'press-sciam', note: 'The \u201cwrong problem\u201d article.' },
        ],
        limits: [
          'Neither OpenAI paper, nor the Buckmaster\u2013Alp\u00f6ge preprints, nor Buckmaster\u2019s statement, nor Tao\u2019s post could be read in this environment. Their content is cited through the outlets named on each entry.',
          'Dates marked \u201cas reported\u201d are the outlet\u2019s. Only the repository commit date and its unchanged state were checked directly.',
          'The comparison of constructions uses Lean docstrings and ICMAT\u2019s description. It shows what the formalised proofs are built from, not what either team knew or when.',
          'Where a source uses words such as \u201cscooped\u201d or \u201cfought dirty\u201d, those are the source\u2019s words. The guide uses none of them in its own voice and takes no position on the allegation or the responses.',
          'Where outlets give different wordings for the same remark (Bubeck\u2019s denial), the guide paraphrases rather than choosing one.',
        ],
      },
    },
  ],
};
