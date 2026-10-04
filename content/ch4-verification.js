// Chapter 4 — What Lean verified. Follows content/SCHEMA.md and the shape of ch1-concentration.js.
// Ground truth: openai/NavierStokesAndEuler at f9e8bc5b (content/sources.js → lean-repo). Line numbers below
// were taken with `cat -n` / `grep -n` in a clone at that commit. Press figures appear only in verify.context
// or in attributed prose, never as mathematics.

/* Lean text quoted verbatim from ComparatorChallenges/NavierStokes.lean and ComparatorChallenges/Euler.lean
   at the pinned commit. Doc comments are omitted unless they carry the point (then kept verbatim). */
const DEFS = [
  {
    id: 'ns-divergence', eq: 'ns', name: 'divergence (∇⬝)', file: 'ComparatorChallenges/NavierStokes.lean', line: 81, level: 'harmless',
    plain: `The divergence of a vector field, computed as the trace of its Fréchet derivative <code>fderiv</code>.`,
    lean: 'noncomputable\ndef divergence (v : ℝ^n → ℝ^n) (x : ℝ^n) : ℝ := (fderiv ℝ v x).trace ℝ (ℝ^n)\n\n/-- The divergence of a vector field is $0$ at points where `fderiv` has its junk value. -/\n@[simp]\ntheorem divergence_of_not_differentiableAt {v : ℝ^n → ℝ^n} {x : ℝ^n}\n    (hv : ¬ DifferentiableAt ℝ v x) : ∇⬝ v x = 0 := by\n  simp [divergence, fderiv_zero_of_not_differentiableAt hv]',
    subtlety: `Mathlib’s <code>fderiv</code> is the zero map where a function is not differentiable, so the divergence is $0$ there (a “junk value”); a nowhere-differentiable field would count as divergence-free. Harmless, because every place <code>div_free</code> is required also requires smoothness: <code>ContDiff ℝ ∞ u₀</code> for data, <code>ContDiffOn ℝ ∞</code> for solutions. Where the derivative matters, it is the honest one.`,
  },
  {
    id: 'ns-data', eq: 'ns', name: 'InitialVelocityConditionDecay', file: 'ComparatorChallenges/NavierStokes.lean', line: 150, level: 'harmless',
    plain: `Initial data: smooth, divergence-free, and every spatial derivative decays faster than any polynomial (the file cites Clay condition 4).`,
    lean: 'structure InitialVelocityCondition (u₀ : ℝ^n → ℝ^n) : Prop where\n  div_free : ∀ x, ∇⬝ u₀ x = 0\n  smooth : ContDiff ℝ ∞ u₀\n\nstructure InitialVelocityConditionDecay (u₀ : ℝ^n → ℝ^n) : Prop extends\n    InitialVelocityCondition u₀ where\n  decay : ∀ m : ℕ, ∀ K : ℝ, ∃ C : ℝ, ∀ x, ‖iteratedFDeriv ℝ m u₀ x‖ ≤ C / (1 + ‖x‖) ^ K',
    subtlety: `The quantifier order $\\forall m\\,\\forall K\\,\\exists C$ lets the constant depend on the derivative order and on the decay rate, which is the standard reading of “decays faster than any polynomial”. Under <code>open ContDiff</code>, <code>∞</code> is Mathlib’s notation for $C^\\infty$ (analytic would be <code>ω</code>).`,
  },
  {
    id: 'ns-force', eq: 'ns', name: 'ForceConditionDecay', file: 'ComparatorChallenges/NavierStokes.lean', line: 185, level: 'harmless',
    plain: `The force: jointly smooth on $\\R^n\\times[0,\\infty)$, with all space–time derivatives decaying faster than any polynomial in $|x|+t$ (Clay condition 5).`,
    lean: 'structure ForceCondition (f : ℝ^n → ℝ → ℝ^n) : Prop where\n  smooth : ContDiffOn ℝ ∞ (↿f) (Set.univ ×ˢ Set.Ici 0)\n\nstructure ForceConditionDecay (f : ℝ^n → ℝ → ℝ^n) : Prop extends ForceCondition f where\n  decay : ∀ m : ℕ, ∀ K : ℝ, ∃ C : ℝ, ∀ x, ∀ t ≥ 0,\n    ‖iteratedFDerivWithin ℝ m (↿f) (Set.univ ×ˢ Set.Ici 0) (x, t)‖ ≤ C / (1 + ‖x‖ + t) ^ K',
    subtlety: `<code>↿f</code> uncurries $f$ into a function of $(x,t)$. Smoothness and the derivative bounds are taken <em>within</em> the closed half-space $\\R^n\\times[0,\\infty)$, so the force must be smooth up to and including $t=0$ and for all later times, with no exception at the blowup time. This is the condition that makes forced blowup hard ([[scene:concentration/not-yet-a-proof|chapter 1]]).`,
  },
  {
    id: 'ns-equation', eq: 'ns', name: 'NavierStokesExistenceAndSmoothness.navier_stokes', file: 'ComparatorChallenges/NavierStokes.lean', line: 222, level: 'harmless',
    plain: `The equation $\\partial_t v + (v\\cdot\\nabla)v = \\nu\\Delta v - \\nabla p + f$ at every $x$ and every $t \\ge 0$, with the time derivative taken within $[0,\\infty)$.`,
    lean: '  navier_stokes : ∀ x, ∀ t ≥ 0,\n    derivWithin (v x ·) (Set.Ici 0) t + fderiv ℝ (v · t) x (v x t) =\n      nu • Δ (v · t) x - gradient (p · t) x + f x t\n  div_free : ∀ x, ∀ t ≥ 0, ∇⬝ (v · t) x = 0\n  initial_condition : ∀ x, v x 0 = u₀ x',
    subtlety: `<code>derivWithin … (Set.Ici 0) t</code> is the one-sided derivative at $t=0$ and the ordinary derivative for $t \\gt 0$. The module docstring (line 56) says why: the Clay statement poses equation (1) on the closed half-line $t \\ge 0$. <code>fderiv ℝ (v · t) x (v x t)</code> is $(v\\cdot\\nabla)v$, the spatial derivative applied to $v$ itself; <code>Δ</code> and <code>gradient</code> are Mathlib’s Laplacian and gradient.`,
  },
  {
    id: 'ns-smooth', eq: 'ns', name: 'velocity_smooth / pressure_smooth', file: 'ComparatorChallenges/NavierStokes.lean', line: 232, level: 'harmless',
    plain: `Velocity and pressure are $C^\\infty$ jointly in $(x,t)$ on $\\R^n\\times[0,\\infty)$ (Clay conditions 6 and 11).`,
    lean: '  velocity_smooth : ContDiffOn ℝ ∞ (↿v) (Set.univ ×ˢ Set.Ici 0)\n  pressure_smooth : ContDiffOn ℝ ∞ (↿p) (Set.univ ×ˢ Set.Ici 0)',
    subtlety: `Joint smoothness in space and time, not merely smoothness in $x$ at each $t$. This is the clause that makes the junk values of <code>fderiv</code> irrelevant for solutions, and it is what a hypothetical global solution would have to satisfy at and after the blowup time.`,
  },
  {
    id: 'ns-energy', eq: 'ns', name: 'NavierStokesExistenceAndSmoothnessRn', file: 'ComparatorChallenges/NavierStokes.lean', line: 245, level: 'note',
    plain: `The whole-space class: in addition, $\\|v(\\cdot,t)\\|$ is in $L^2$ at each time and the kinetic energy is uniformly bounded (Clay condition 7).`,
    lean: 'structure NavierStokesExistenceAndSmoothnessRn\n    (nu : ℝ) (u₀ : ℝ^n → ℝ^n) (f : ℝ^n → ℝ → ℝ^n)\n    (v : ℝ^n → ℝ → ℝ^n) (p : ℝ^n → ℝ → ℝ) : Prop\n  extends NavierStokesExistenceAndSmoothness nu u₀ f v p where\n  integrable : ∀ t ≥ 0, MemLp (‖v · t‖) 2\n  globally_bounded_energy : ∃ E, ∀ t ≥ 0, (∫ x : ℝ^n, ‖v x t‖ ^ 2) < E',
    subtlety: `Mathlib’s integral is total: a non-integrable function integrates to $0$, so the energy bound alone could hold vacuously. The <code>integrable</code> clause (<code>MemLp … 2</code>) rules that out; the docstring adds that the integral is the Lebesgue integral. Worth knowing because bounded energy is part of the class being ruled out: the theorem does not exclude global smooth solutions of infinite energy.`,
  },
  {
    id: 'ns-periodic', eq: 'ns', name: 'NavierStokesExistenceAndSmoothnessPeriodic', file: 'ComparatorChallenges/NavierStokes.lean', line: 262, level: 'note',
    plain: `The torus class: velocity and pressure are both 1-periodic in each coordinate for all $t \\ge 0$ (Clay condition 10, plus the errata for the pressure).`,
    lean: 'def IsOnePeriodic {α : Sort*} (f : ℝ^n → α) : Prop :=\n  ∀ x i, f (x + EuclideanSpace.single i 1) = f x\n\nstructure NavierStokesExistenceAndSmoothnessPeriodic\n    (nu : ℝ) (u₀ : ℝ^n → ℝ^n) (f : ℝ^n → ℝ → ℝ^n)\n    (v : ℝ^n → ℝ → ℝ^n) (p : ℝ^n → ℝ → ℝ) : Prop\n  extends NavierStokesExistenceAndSmoothness nu u₀ f v p where\n  /-- The velocity is 1-periodic in space for all times $t \\ge 0$ (condition 10). -/\n  isOnePeriodic_velocity : ∀ t ≥ 0, IsOnePeriodic (v · t)\n  /-- The pressure is 1-periodic in space for all times $t \\ge 0$ (Clay errata). -/\n  isOnePeriodic_pressure : ∀ t ≥ 0, IsOnePeriodic (p · t)',
    subtlety: `Requiring the pressure, not only the velocity, to be periodic is attributed by the file to an errata appended to the Clay statement. Every extra requirement on the hypothetical solution makes a non-existence theorem easier to prove, so it is worth knowing; it is also what the corrected problem asks for. The torus class has no energy clause: a smooth periodic field has finite energy on the torus automatically.`,
  },
  {
    id: 'eu-class-global', eq: 'euler', name: 'EulerExistenceAndSmoothnessR3', file: 'ComparatorChallenges/Euler.lean', line: 77, level: 'harmless',
    plain: `The global Euler class: the Navier–Stokes whole-space class with $\\nu = 0$ and $f = 0$, keeping joint smoothness, $L^2$ velocity and uniformly bounded energy.`,
    lean: 'structure EulerExistenceAndSmoothness\n    (u₀ : ℝ³ → ℝ³) (v : ℝ³ → ℝ → ℝ³) (p : ℝ³ → ℝ → ℝ) : Prop where\n  /-- `∂ₜv + (v · ∇)v = -∇p`: viscosity and external force are both zero. -/\n  euler : ∀ x, ∀ t ≥ 0,\n    derivWithin (v x ·) (Set.Ici 0) t + fderiv ℝ (v · t) x (v x t) =\n      -gradient (p · t) x\n  div_free : ∀ x, ∀ t ≥ 0, ∇⬝ (v · t) x = 0\n  initial_condition : ∀ x, v x 0 = u₀ x\n  velocity_smooth : ContDiffOn ℝ ∞ (Function.uncurry v) (Set.univ ×ˢ Set.Ici 0)\n  pressure_smooth : ContDiffOn ℝ ∞ (Function.uncurry p) (Set.univ ×ˢ Set.Ici 0)\n\nstructure EulerExistenceAndSmoothnessR3\n    (u₀ : ℝ³ → ℝ³) (v : ℝ³ → ℝ → ℝ³) (p : ℝ³ → ℝ → ℝ) : Prop\n    extends EulerExistenceAndSmoothness u₀ v p where\n  integrable : ∀ t ≥ 0, MemLp (‖v · t‖) 2\n  globally_bounded_energy : ∃ E : ℝ, ∀ t ≥ 0, (∫ x : ℝ³, ‖v x t‖ ^ 2) < E',
    subtlety: `This is the class in which <code>euler_breakdown_R3</code> says no global solution exists. The file header describes it as the whole-space breakdown alternative specialised to zero viscosity and zero force. It is <em>not</em> a Clay problem statement: the Clay problem is about Navier–Stokes.`,
  },
  {
    id: 'eu-toL2', eq: 'euler', name: 'toL2', file: 'ComparatorChallenges/Euler.lean', line: 114, level: 'harmless',
    plain: `The $L^2$ class of a function, with $0$ as a fallback when the function is not square-integrable.`,
    lean: '/-- The L² equivalence class of a square-integrable function. The fallback makes\nthis a total function; the solution conditions require square integrability\nwherever it is used. -/\nnoncomputable def toL2 {V : Type*} [NormedAddCommGroup V] (f : ℝ³ → V) :\n    Lp V 2 (volume : Measure ℝ³) := by\n  classical\n  exact if h : MemLp f 2 volume then h.toLp f else 0',
    subtlety: `Lean functions must be total, so a non-$L^2$ input has to map somewhere; the choice is $0$. Harmless for the same reason as the energy clause: <code>SobolevSmoothOn</code> requires <code>MemLp … 2</code> at every time where <code>toL2</code> is applied, so the fallback is never reached inside the solution class.`,
  },
  {
    id: 'eu-sobolev', eq: 'euler', name: 'SobolevSmoothOn', file: 'ComparatorChallenges/Euler.lean', line: 121, level: 'note',
    plain: `A velocity path on a time set $I$: smooth in space at each time, with every spatial derivative in $L^2$ and depending continuously on time in $L^2$.`,
    lean: 'structure SobolevSmoothOn (I : Set ℝ) (v : ℝ³ → ℝ → ℝ³) : Prop where\n  spatial_smooth : ∀ t ∈ I, ContDiff ℝ ∞ (v · t)\n  integrable : ∀ t ∈ I, MemLp (v · t) 2\n  jets_integrable : ∀ m : ℕ, ∀ t ∈ I, MemLp (iteratedFDeriv ℝ m (v · t)) 2\n  continuous : ContinuousOn (fun t => toL2 (v · t)) I\n  jets_continuous : ∀ m : ℕ,\n    ContinuousOn (fun t => toL2 (iteratedFDeriv ℝ m (v · t))) I',
    subtlety: `An all-order Sobolev class, $C(I;H^m)$ for every $m$: strong in space, continuous (not smooth) in time. Unlike the Navier–Stokes class it is not jointly $C^\\infty$ in $(x,t)$; time regularity enters separately through the derivative witness in the next definition. Standard in Euler well-posedness theory, but it is the project’s own class, not an external transcription.`,
  },
  {
    id: 'eu-class', eq: 'euler', name: 'EulerSobolevExistenceAndSmoothnessR3On', file: 'ComparatorChallenges/Euler.lean', line: 136, level: 'choice',
    plain: `Euler on a time set $I$ in the Sobolev class: the equation holds at interior times with a strong $L^2$ time derivative $w$; the pressure need only be differentiable in space at interior times.`,
    lean: 'structure EulerSobolevExistenceAndSmoothnessR3On (I : Set ℝ)\n    (u₀ : ℝ³ → ℝ³) (v : ℝ³ → ℝ → ℝ³) (p : ℝ³ → ℝ → ℝ) : Prop where\n  div_free : ∀ x, ∀ t ∈ I, ∇⬝ (v · t) x = 0\n  initial_condition : ∀ x, v x 0 = u₀ x\n  velocity_smooth : SobolevSmoothOn I v\n  pressure_differentiable : ∀ t ∈ interior I, Differentiable ℝ (p · t)\n  euler : ∃ w : ℝ³ → ℝ → ℝ³,\n    SobolevSmoothOn I w ∧\n      (∀ t ∈ interior I,\n        HasDerivAt (fun s => toL2 (v · s)) (toL2 (w · t)) t) ∧\n      (∀ x, ∀ t ∈ interior I,\n        w x t + fderiv ℝ (v · t) x (v x t) = -gradient (p · t) x)',
    subtlety: `Three decisions live here. The time derivative is a witness $w$ with $\\tfrac{d}{dt}v = w$ in $L^2$ (a strong derivative), not a pointwise <code>derivWithin</code>. The equation and the pressure condition are imposed only at <em>interior</em> times, so there is no endpoint derivative at $t=0$. And no time regularity or normalisation is imposed on the pressure at all (the section docstring says so). The lifespan clause “a solution on $[0,T]$ exists iff $T \\lt T^*$” is relative to this class.`,
  },
  {
    id: 'eu-norms', eq: 'euler', name: 'velocityC1Norm / vorticityNorm', file: 'ComparatorChallenges/Euler.lean', line: 157, level: 'harmless',
    plain: `The $C^1$ norm (sup of $|v|$ plus sup of $|\\nabla v|$) and the sup norm of the vorticity, as values in $[0,\\infty]$.`,
    lean: 'noncomputable def vorticity (v : ℝ³ → ℝ³) (x : ℝ³) : ℝ³ :=\n  WithLp.toLp 2 (fun i : Fin 3 =>\n    (fderiv ℝ v x (EuclideanSpace.single (i + 1) 1)) (i + 2) -\n      (fderiv ℝ v x (EuclideanSpace.single (i + 2) 1)) (i + 1))\n\nnoncomputable def velocityC1Norm (v : ℝ³ → ℝ³) : ℝ≥0∞ :=\n  (⨆ x, ENNReal.ofReal ‖v x‖) + (⨆ x, ENNReal.ofReal ‖fderiv ℝ v x‖)\n\nnoncomputable def vorticityNorm (v : ℝ³ → ℝ³) : ℝ≥0∞ :=\n  ⨆ x, ENNReal.ofReal ‖vorticity v x‖',
    subtlety: `Suprema in <code>ℝ≥0∞</code> make an unbounded field have norm <code>⊤</code> instead of being undefined, so “$= \\top$ at $T^*$” is an honest “infinite”. The theorem also asserts a bounded $C^1$ norm and a finite vorticity integral on every $[0,T]$ with $T \\lt T^*$, locating the singularity at the endpoint. The vorticity is the ordinary curl, written out with cyclic indices in <code>Fin 3</code>.`,
  },
];

const ALIGNMENT = [
  { eq: 'ns', source: 'Theorem 1.1 (Navier–Stokes on ℝ³)', lean: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', module: 'NavierStokes.ComparatorSolution', status: 'proved' },
  { eq: 'ns', source: 'Corollary 10.6 (Navier–Stokes on ℝ³/ℤ³)', lean: 'NavierStokes.Comparator.navier_stokes_breakdown_periodic', module: 'NavierStokes.ComparatorSolution', status: 'proved' },
  { eq: 'eu', source: 'Theorem 1.1 (Euler)', lean: 'Euler.euler_breakdown_R3', module: 'Euler.Solution', status: 'proved' },
  { eq: 'eu', source: 'Theorem 1.1 (Euler), alternate version', lean: 'Euler.exists_compact_smooth_euler_singularity', module: 'Euler.Solution', status: 'proved' },
];

export default {
  id: 'verification',
  number: 4,
  title: 'What Lean verified',
  equation: 'both',
  summary: 'What a machine check certifies and what it cannot, the Lean definitions behind the four theorems, the size of the formalization, and the boundary of formal verification.',
  scenes: [
    /* ------------------------------------------------------------------ */
    {
      id: 'what-a-check-means',
      title: 'What a machine check certifies',
      question: 'What does it mean that a computer checked the proof?',
      visual: { scene: 'lean-stack', label: 'schematic', caption: 'The trust stack, from prose to independent re-check. Click a layer.', params: { mode: 'stack' } },
      status: {
        changes: 'Each layer up the stack removes one kind of doubt: typos, gaps, hidden assumptions, statement drift.',
        bounded: 'Axioms, per formalization.yaml: <code>propext</code>, <code>Classical.choice</code>, <code>Quot.sound</code>, nothing else. No <code>sorry</code> in the proof libraries (text search).',
        fails: 'No layer can check that the Lean statement is the question a reader cares about. That stays human.',
      },
      understand: `
<p>A Lean proof is a very long chain of small steps, each of which a program can check mechanically. “The computer checked the proof” means, per the repository: starting from Mathlib’s definitions and the statement written in Lean, every declaration in the two proof libraries (roughly 641,000 lines) was accepted by Lean’s kernel, no step was left as a placeholder (<code>sorry</code>), and the only axioms used are the three standard ones of classical mathematics in Lean, the same three Mathlib itself relies on.</p>
<p>That is a strong guarantee about one thing: the proof proves the statement. It is a guarantee about nothing else. It does not say the statement is the right one, that the definitions mean what the paper means, or that the result matters. Those are human readings, and the next scene is about them.</p>
<p>The stack in the scene is ordered by what each layer rules out. The last layer, Comparator, exists because the biggest remaining risk in a formal proof is not a wrong step but a quietly changed statement.</p>`,
      inspect: `
<p>In Lean a theorem is a pair: a <em>type</em>, which is the statement, and a <em>term</em>, which is the proof. The kernel’s only job is to confirm that the term has the type. That is why statement and proof have different trust stories, and why the repository keeps them in different places.</p>
<h3>Statement, proof and the bridge between them</h3>
<p>The statements live in <code>ComparatorChallenges/</code>: two files, 472 lines, importing nothing but Mathlib, adapted from Google DeepMind’s Formal Conjectures transcription of Fefferman’s problem description. Each of its four challenge theorems ends in <code>sorry</code>, Lean’s placeholder that proves anything and is recorded as an extra axiom <code>sorryAx</code> (the five small divergence lemmas there are proved). The proofs live in <code>NavierStokes/</code> and <code>Euler/</code> and never import the reference files (a text search finds no such import). Instead <code>NavierStokes/ComparatorSolution.lean</code> and <code>Euler/Solution.lean</code> restate the four theorems word for word over proof-side copies of the definitions and discharge them from the libraries, in 32 and 75 lines.</p>
<h3>What the kernel check buys</h3>
<p><code>lake build</code> elaborates every declaration and has the kernel re-check each proof term against its type. There are no unchecked steps, and a <code>sorry</code> anywhere in the dependency tree would print a warning and appear under <code>#print axioms</code>. The two solution files end with exactly those commands. The repository metadata reports <code>sorry_count: 0</code> and the axiom list <code>propext</code>, <code>Classical.choice</code>, <code>Quot.sound</code>: propositional extensionality, the axiom of choice and quotient soundness. A proof that uses only these is an ordinary classical proof.</p>
<h3>Why Comparator exists: statement drift</h3>
<p>The kernel checks that <em>some</em> statement was proved. Nothing in <code>lake build</code> checks that the theorem proved inside a 2,655-file development is the theorem in the 472-line reference: a changed definition, a different notation or a stray local instance can make two texts that look identical elaborate to different terms. Comparator is built to close that gap. Given a challenge module and a solution module, it rebuilds the solution in a sandbox (<code>landrun</code>), exports the proof terms (<code>lean4export</code>), replays them in Lean’s kernel and optionally in <code>nanoda</code>, an independently written kernel in Rust, and then checks that the named theorems have the same statement as the challenge and use no more than the permitted axioms. The repository’s two configuration files name the four theorems, enable nanoda, and permit exactly the three axioms above.</p>
<p>“The proof root never imports the reference” is what makes that comparison meaningful: the challenge’s import closure is Mathlib alone, so nothing the proof does can alter the text it is compared against.</p>
<details class="more"><summary>A visible example of why matching is delicate</summary>
<p><code>Euler/Solution.lean</code> adds, just before the quantitative theorem, <code>attribute [local instance] CompletePartialOrder.toSupSet</code> with the comment “Match the reference’s elaboration of ENNReal suprema independently of import order.” The suprema in <code>velocityC1Norm</code> must elaborate to the same term on both sides or Comparator would report a mismatch, even though the source text is identical.</p></details>
<details class="more"><summary>What this guide did, and did not do</summary>
<p>This guide read the files at the pinned commit and counted. It did not run <code>lake build</code> or Comparator. The claims that the proof is accepted by the kernel and uses only the three axioms are the repository’s own, reproducible with the two commands in its README and the three in <code>ComparatorChallenges/README.md</code>.</p></details>`,
      verify: {
        statements: [
          { title: 'What the repository asserts about its own status (formalization.yaml)', html: '<pre>status:\n  scope: "Full formalization of main results."\n  sorry_count: 0\n  sorry_in_definitions: 0\n  main_results:            # four entries, each with\n      sorry_count: 0\n      axioms: ["propext", "Classical.choice", "Quot.sound"]\n      comparator_config: "ComparatorChallenges/NavierStokes.json"   # or Euler.json\nautomation:\n  methods:\n    - method: "agent"\n      models: ["GPT-6 Astra"]\n      framework: "Codex"\nreview:\n  status: "self-assessed"</pre><p>Condensed from lines 47–104 of the file; the quoted values are verbatim.</p>' },
          { title: 'What Comparator certifies (its README)', html: '<p>If the Comparator command succeeds, “all theorems in <code>Solution</code> that are listed in <code>theorem_names</code> are guaranteed to: 1. Prove the same statement as provided in <code>Challenge</code>; 2. Use no more axioms than listed in <code>permitted_axioms</code>; 3. Be accepted by the Lean kernel.” This holds under stated assumptions, among them that the import closure of the challenge file and the lakefile are trustworthy, that the <code>landrun</code> sandbox works, and that “The Lean kernel is correct (with <code>external_kernels</code> this can be reduced to ‘At least one of the Lean kernel or the <code>external_kernels</code> is correct’)”. It lists six assumptions in all.</p>' },
          { title: 'Toolchain and pins', html: '<p><code>lean-toolchain</code>: <code>leanprover/lean4:v4.34.0-rc2</code>. <code>lakefile.toml</code> requires <code>mathlib</code> and <code>Comparator</code> at <code>rev = "v4.34.0-rc2"</code> and declares three libraries, <code>NavierStokes</code>, <code>Euler</code> (with <code>warningAsError = true</code>) and <code>ComparatorChallenges</code>. <code>lake-manifest.json</code> pins mathlib to <code>85e3a25e…</code>, Comparator to <code>19e111e2…</code> and lean4export to <code>cacf989b…</code>.</p>' },
          { title: 'Separation of statement and proof', html: '<p><code>ComparatorChallenges/NavierStokes.lean</code>, line 32: “Neither the proof root nor the submission imports this reference.” <code>NavierStokes/ComparatorSolution.lean</code>, line 8: “The adapters import <code>ComparatorDefinitions</code>, never the challenge module.” A search for <code>import ComparatorChallenges</code> in <code>NavierStokes/</code> and <code>Euler/</code> returns nothing. The Comparator configs name <code>ComparatorChallenges.NavierStokes</code> / <code>Euler</code> as challenge modules and <code>NavierStokes.ComparatorSolution</code> / <code>Euler.Solution</code> as solution modules.</p>' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', file: 'NavierStokes/ComparatorSolution.lean', line: 16, note: 'The proved statement, discharged by `exact ComparatorBridge.navier_stokes_breakdown_R3 nu hnu`.' },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_periodic', file: 'NavierStokes/ComparatorSolution.lean', line: 23 },
          { decl: '#print axioms NavierStokes.Comparator.navier_stokes_breakdown_R3 / _periodic', file: 'NavierStokes/ComparatorSolution.lean', line: 31, note: 'Prints the axioms the two theorems depend on when the file is built.' },
          { decl: 'Euler.euler_breakdown_R3', file: 'Euler/Solution.lean', line: 33 },
          { decl: 'Euler.exists_compact_smooth_euler_singularity', file: 'Euler/Solution.lean', line: 43 },
          { decl: '#print axioms Euler.euler_breakdown_R3 / Euler.exists_compact_smooth_euler_singularity', file: 'Euler/Solution.lean', line: 73 },
          { decl: 'attribute [local instance] CompletePartialOrder.toSupSet', file: 'Euler/Solution.lean', line: 41, note: '“Match the reference’s elaboration of ENNReal suprema independently of import order.”' },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3 (reference, ends in sorry)', file: 'ComparatorChallenges/NavierStokes.lean', line: 273, note: 'The challenge statement; the sorry is at line 277. Module docstring at line 32: the proof never imports this file.' },
          { decl: 'Euler.euler_breakdown_R3 (reference, ends in sorry)', file: 'ComparatorChallenges/Euler.lean', line: 85, note: 'The sorry is at line 88; the quantitative challenge is at line 170 with its sorry at 184.' },
          { decl: 'NavierStokes.ComparatorDefinitions (module docstring)', file: 'NavierStokes/ComparatorDefinitions.lean', line: 22, note: '“Comparator checks these definitions against the independent reference at runtime.”' },
          { decl: 'Euler.SolutionDefinitions (module docstring)', file: 'Euler/SolutionDefinitions.lean', line: 34, note: '“These definitions reproduce the independent reference exactly. This module contains no challenge theorem or proof placeholder and does not import Euler.”' },
        ],
        context: [
          { src: 'lean-readme', note: '“The project uses Lean 4.34.0-rc2, Mathlib, and Lake”; build with `lake exe cache get` and `lake build`.' },
          { src: 'formalization-yaml', note: 'Status, axioms, automation and review fields quoted above.' },
          { src: 'lean-toolchain' }, { src: 'lakefile' }, { src: 'lake-manifest' },
          { src: 'comparator-challenges-readme', note: 'Names landrun, lean4export and nanoda_bin, and the two `lake exe comparator` commands.' },
          { src: 'comparator-config-ns' }, { src: 'comparator-config-euler' },
          { src: 'comparator-readme', note: 'Source of the three guarantees and the assumption list.' },
          { src: 'comparator-tool' }, { src: 'lean4export' }, { src: 'nanoda' }, { src: 'landrun' },
          { src: 'formal-conjectures', note: 'Origin of the reference definitions, per the file headers and formalization.yaml → related_formalizations.' },
        ],
        limits: [
          'This guide did not rebuild the project or run Comparator. Kernel acceptance and the axiom list are the repository’s claims, reproducible with `lake build` and the Comparator commands.',
          'Comparator’s guarantee is conditional on the assumptions in its README. The sandbox and the second kernel reduce, but do not remove, trust in software.',
          '`sorry_count: 0` is a statement about the proof libraries. The reference files contain `sorry` by design, four placeholders in all.',
          'The stack is an organisation of trust, not a chronology. The repository does not record when, or by whom, Comparator was run.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'is-it-the-same-statement',
      title: 'The statement, definition by definition',
      question: 'Is the statement that was checked the same as the theorem in the paper?',
      visual: {
        scene: 'definitions-board', label: 'source-quoted', caption: 'The Lean definitions behind the four theorems, with the subtlety each carries. Click one.',
        params: {
          defs: DEFS, alignment: ALIGNMENT, selected: 'ns-equation',
          note: '<b>Source-quoted.</b> Lean text is copied verbatim from the reference files at the pinned commit (doc comments omitted unless they carry the point); the plain meaning and the assessment of each subtlety are this guide’s reading, not the repository’s.',
        },
      },
      status: {
        changes: 'Each definition replaces a phrase of the Clay text by one Lean term; each replacement is a choice.',
        bounded: 'The reading load: two reference files, 286 and 186 lines, importing only Mathlib.',
        fails: 'Nothing mechanical. Whether these definitions are the Clay conditions is a reading, not a computation.',
      },
      understand: `
<p>A checker checks that the proof proves the statement. Whether the statement is the right one is a human reading, and here that reading is unusually easy: the two reference files are short, import only Mathlib, and were adapted from Google DeepMind’s Formal Conjectures transcription of the Clay problem description.</p>
<p>Short does not mean free of choices. Every informal phrase (“smooth”, “divergence-free”, “bounded energy”, “time derivative at $t = 0$”) had to become one specific Lean term, and each term carries a small decision. The board lists the ones that matter and grades each as harmless, worth knowing, or a real choice.</p>
<p>Two things stand out. The Navier–Stokes definitions follow the Clay text clause by clause; the doc comments cite its condition numbers, including an errata requiring periodic pressure. The Euler theorems use a solution class written to match the project’s own theorem: a Sobolev class in which the pressure need only be differentiable at interior times. A legitimate class, but the project’s choice, not an external one.</p>`,
      inspect: `
<p>The checker guarantees that the proof proves <em>this</em> text. The question is whether the text says what the Clay description says, and whether the transcription choices change the theorem. Four deserve a close look.</p>
<h3>1. Junk values are harmless here</h3>
<p>Mathlib’s <code>fderiv</code> returns the zero map where a function is not differentiable, so “divergence-free” could be satisfied by a nowhere-differentiable field. The transcription neutralises this by always pairing <code>div_free</code> with smoothness: initial data must satisfy <code>ContDiff ℝ ∞ u₀</code>, and solutions must be <code>ContDiffOn ℝ ∞</code> jointly in $(x,t)$ on $\\R^3\\times[0,\\infty)$ (Navier–Stokes) or <code>ContDiff ℝ ∞ (v · t)</code> at each time (the Euler Sobolev class). Wherever the divergence is required to vanish, the derivative is the honest one.</p>
<h3>2. The one-sided time derivative</h3>
<p><code>derivWithin (v x ·) (Set.Ici 0) t</code> is the derivative of $t \\mapsto v(x,t)$ taken inside $[0,\\infty)$. For $t \\gt 0$ it is the ordinary derivative; at $t = 0$ it is the right-hand derivative. The file says why: the Clay statement poses the equation on the closed half-line $t \\ge 0$. For a jointly smooth solution, imposing it at $t = 0$ costs nothing.</p>
<h3>3. Energy needs two clauses</h3>
<p>Mathlib’s integral is total: a non-integrable integrand integrates to $0$. A lone bound $\\int \\norm{v}^2 \\lt E$ could therefore hold vacuously. The class first asks that $\\norm{v(\\cdot,t)}$ be in $L^2$ (<code>MemLp … 2</code>) and only then bounds the integral, so the energy bound means what it says. The same pattern protects <code>toL2</code> in the Euler class: <code>SobolevSmoothOn</code> demands square integrability wherever it is applied, so its fallback $0$ is never reached.</p>
<h3>4. Which class the Euler lifespan refers to</h3>
<p>The quantitative Euler theorem says a solution on $[0,T]$ exists <em>if and only if</em> $T \\lt T^*$, but existence is always relative to a class. Here it is <code>EulerSobolevExistenceAndSmoothnessR3On</code>: velocity smooth in space with every derivative in $L^2$ and continuous in time, a strong $L^2$ time derivative $w$ supplied as a witness, the equation imposed at interior times only, and pressure merely differentiable in space at those times. The theorem’s final clause separately rules out solutions in the broader global class from the reference, but “the maximal lifespan is $T^*$” is a statement about this class, which the project wrote to match its own theorem.</p>
<details class="more"><summary>Two more, briefly</summary>
<p><strong>Periodic pressure.</strong> The torus class requires the pressure, not only the velocity, to be 1-periodic, which the file attributes to an errata appended to the Clay statement. Demanding more of the hypothetical solution makes a non-existence theorem easier to prove, so this is worth knowing; according to the file it is also what the corrected problem asks for.</p>
<p><strong>Norms in $[0,\\infty]$.</strong> <code>velocityC1Norm</code> and <code>vorticityNorm</code> take values in <code>ℝ≥0∞</code>, as suprema of <code>ENNReal.ofReal</code> over all $x$, so an unbounded field has norm $\\top$ rather than being undefined. “$= \\top$ at $T^*$” is then an honest “infinite”, and the theorem also asserts finiteness on every $[0,T]$ with $T \\lt T^*$, so the blowup is located at the endpoint.</p></details>`,
      verify: {
        statements: [
          { title: 'The trust boundary', html: '<p>A successful Comparator run certifies that each proved theorem has the <em>same statement</em> as the corresponding theorem in <code>ComparatorChallenges/</code> and uses only the permitted axioms. It does not, and cannot, certify that those 472 lines say what the Clay description, or the papers, say. That step is a reading of the definitions on the board.</p>' },
          { title: 'Alignment as stated in formalization.yaml (lines 106–126)', html: '<pre>alignment:\n  namespaces: ["NavierStokes.Comparator", "Euler"]\n  statements:\n    - source: "Theorem 1.1 (Navier–Stokes on ℝ³)"\n      lean: "NavierStokes.Comparator.navier_stokes_breakdown_R3"      status: "proved"\n    - source: "Corollary 10.6 (Navier–Stokes on ℝ³/ℤ³)"\n      lean: "NavierStokes.Comparator.navier_stokes_breakdown_periodic"  status: "proved"\n    - source: "Theorem 1.1 (Euler)"\n      lean: "Euler.euler_breakdown_R3"                                 status: "proved"\n    - source: "Theorem 1.1 (Euler), alternate version"\n      lean: "Euler.exists_compact_smooth_euler_singularity"           status: "proved"</pre><p>Condensed layout; names and statuses verbatim. The paper numbering is the authors’ metadata and has not been checked against the PDFs by this guide.</p>' },
          { title: 'Provenance of the reference files', html: '<p><code>ComparatorChallenges/NavierStokes.lean</code>, lines 25–32: “Standalone comparator copied from” the Formal Conjectures file at commit <code>8bf45ed7…</code>; “the upstream definitions, helper proofs, and breakdown alternatives (C) and (D) are retained, including their intentional <code>sorry</code> challenge placeholders … All utility dependencies are inlined; only Mathlib is imported.” <code>ComparatorChallenges/Euler.lean</code>, lines 28–36: “the whole-space breakdown alternative specialized to zero viscosity and zero external force … The reference imports only Mathlib, independently of the Euler proof development.”</p>' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Theorem 1.1 and Corollary 10.6 (per formalization.yaml)', note: 'The alignment is taken from the repository metadata, not from a reading of the PDF.' },
          { src: 'euler-paper', where: 'Theorem 1.1 (per formalization.yaml)', note: 'Same caveat.' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.divergence', file: 'ComparatorChallenges/NavierStokes.lean', line: 81, note: 'Trace of fderiv. The junk value is documented at lines 77–78 and proved at line 88.' },
          { decl: 'NavierStokes.Comparator.InitialVelocityConditionDecay', file: 'ComparatorChallenges/NavierStokes.lean', line: 150, note: 'div_free and smooth are inherited from InitialVelocityCondition (line 134); decay at line 155.' },
          { decl: 'NavierStokes.Comparator.ForceConditionDecay', file: 'ComparatorChallenges/NavierStokes.lean', line: 185, note: 'Joint smoothness within ℝⁿ × [0,∞) at line 177; decay at lines 190–191.' },
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothness', file: 'ComparatorChallenges/NavierStokes.lean', line: 217, note: 'The equation with derivWithin at lines 222–224; joint smoothness of v and p at lines 232 and 235.' },
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothnessRn', file: 'ComparatorChallenges/NavierStokes.lean', line: 245, note: 'integrable (MemLp 2) at line 250; globally_bounded_energy at line 253.' },
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothnessPeriodic', file: 'ComparatorChallenges/NavierStokes.lean', line: 262, note: 'isOnePeriodic_pressure at line 269, “(Clay errata)”.' },
          { decl: 'Module docstring on derivWithin and Set.Ici 0', file: 'ComparatorChallenges/NavierStokes.lean', line: 56 },
          { decl: 'Euler.EulerExistenceAndSmoothnessR3', file: 'ComparatorChallenges/Euler.lean', line: 77, note: 'Global class; the equation with derivWithin is at lines 68–70.' },
          { decl: 'Euler.toL2', file: 'ComparatorChallenges/Euler.lean', line: 114 },
          { decl: 'Euler.SobolevSmoothOn', file: 'ComparatorChallenges/Euler.lean', line: 121 },
          { decl: 'Euler.EulerSobolevExistenceAndSmoothnessR3On', file: 'ComparatorChallenges/Euler.lean', line: 136, note: 'pressure_differentiable at line 141; the strong-derivative witness at lines 142–147. Section docstring at lines 90–107.' },
          { decl: 'Euler.velocityC1Norm / Euler.vorticityNorm', file: 'ComparatorChallenges/Euler.lean', line: 157, note: 'vorticity at line 151; vorticityNorm at line 161.' },
          { decl: 'Euler.exists_compact_smooth_euler_singularity (reference)', file: 'ComparatorChallenges/Euler.lean', line: 170, note: 'The lifespan clause (↔ T < Tstar) at lines 176–177; finiteness below T* at lines 178–180; the ⊤ clauses at 181–182.' },
          { decl: 'NavierStokes.ComparatorDefinitions (proof-side copy)', file: 'NavierStokes/ComparatorDefinitions.lean', line: 22, module: true },
          { decl: 'Euler.SolutionDefinitions (proof-side copy)', file: 'Euler/SolutionDefinitions.lean', line: 22, module: true },
        ],
        context: [
          { src: 'formalization-yaml', note: 'Alignment table (lines 106–126) and related_formalizations (lines 33–38).' },
          { src: 'clay-statement', note: 'The condition numbers (4), (5), (6), (7), (8), (9), (10), (11) cited in the Lean doc comments refer to this document.' },
          { src: 'formal-conjectures' },
          { src: 'formal-conjectures-pinned', note: 'The exact upstream version named in the Navier–Stokes reference header.' },
        ],
        limits: [
          'The plain-meaning column is a paraphrase and the harmless / worth knowing / real choice labels are this guide’s assessment, not a theorem.',
          'This guide did not diff the reference files against the upstream Formal Conjectures file; the description of what was adapted is the files’ own.',
          'The Clay errata on periodic pressure is reported as the file reports it; the errata text was not read here.',
          'Paper theorem numbers come from formalization.yaml; the PDFs were not consulted.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'how-big-is-it',
      title: 'The size of the formalization',
      question: 'How large is the formalization, and how was it produced?',
      visual: { scene: 'repo-stats', label: 'numerically-computed', caption: 'Files, lines and declarations per library at the pinned commit', params: { metric: 'lines' } },
      status: {
        changes: 'The metric. Navier–Stokes leads on lines and theorems; Euler has more than twice as many files.',
        bounded: 'The reference: 2 files, 472 lines, 15 structures, 7 definitions, 9 theorems, 4 of them <code>sorry</code>.',
        fails: 'Size as evidence. Line counts say nothing about correctness or depth; the kernel check is not stronger for length.',
      },
      understand: `
<p>At the pinned commit the repository holds 2,659 Lean files and 641,332 lines. The Navier–Stokes library is 816 files and about 429,000 lines; the Euler library 1,839 files and about 212,000 lines; the two reference statements together are 472 lines. Counting declarations, the two proof libraries contain 38,500 <code>theorem</code> declarations, about 10,800 <code>def</code>s and about 650 <code>structure</code>s. The longest single file, <code>Euler/EulerProof.lean</code>, runs to 20,755 lines.</p>
<p>For scale: Wikipedia’s article on Lean reports that Mathlib, the library this project builds on, had over 210,000 theorems and 100,000 definitions as of May 2025. By that rough measure this one development is about a fifth of Mathlib’s theorem count, written on top of it.</p>
<p>How it was produced is documented only in outline. The repository’s metadata names the automation method (“agent”), the model (“GPT-6 Astra”) and the framework (“Codex”), and marks review as “self-assessed”. Press reports add timings and agent counts; those are reported figures, not something the repository shows, and they are attributed under Verify.</p>`,
      inspect: `
<p>The numbers are counts of text at commit <code>f9e8bc5b</code>, produced with the shell commands below. They measure how much was written, not how deep it is: one <code>theorem</code> line is one declaration whether it closes a trivial rewrite or the main estimate.</p>
<h3>How the counting works</h3>
<p>A declaration is counted when a line starts with <code>theorem</code>, <code>lemma</code>, <code>def</code> or <code>structure</code>, optionally preceded by an attribute such as <code>@[simp]</code> and modifiers such as <code>private</code> or <code>noncomputable</code>. Indented declarations are missed; a second pass that allows indentation changes the Navier–Stokes theorem count by nine. <code>instance</code> (68 and 1,510, counted with <code>local</code> also allowed as a modifier; 40 and 1,491 of them are <code>local instance</code> declarations) and <code>abbrev</code> (796 and 103) are not in the headline figures. Lines are <code>wc -l</code>, so comments and blank lines count.</p>
<h3>What the shape suggests</h3>
<p>The two libraries are organised differently. The Navier–Stokes library has fewer, longer files and a nested <code>R3/</code> subdirectory (109 files) for the whole-space argument; the Euler library has more than twice as many files at half the total length. Across both, the median file is 114 lines and 119 files exceed 1,000. Eleven files carry a <code>NoOptions</code> suffix next to a file of the same name; the 5,573-line <code>CorrectionInitializationNoOptions.lean</code> differs from its twin in 15 lines, so some material exists in two near-identical variants. 440 files import Mathlib modules directly (only four import the whole library); the rest import project modules.</p>
<h3>How it was produced, as documented</h3>
<p>The repository itself says little. <code>formalization.yaml</code> lists one automation method, <code>agent</code>, with model <code>GPT-6 Astra</code> and framework <code>Codex</code>, and a review status of <code>self-assessed</code>. GitHub lists two commits, 8 and 10 September 2026; the pinned commit is the later (this guide’s clone is shallow). Press reports, which this guide can attribute but not confirm, say the Lean formalization took about 17 additional hours after the mathematical proof, that the Navier–Stokes proof itself involved roughly 10,000 concurrent agents over about 88 hours, and the Euler proof fewer than 100 agents over roughly 50 hours. OpenAI’s own account is its blog post, which could not be fetched from this environment.</p>
<details class="more"><summary>The commands (run in a clone at the pinned commit)</summary>
<pre>git rev-parse HEAD        # f9e8bc5b38b6e212696e8a30e3e91517af887bbd

# files and lines per library
for d in NavierStokes Euler ComparatorChallenges; do
  echo "$d: $(find $d -name '*.lean' | wc -l) files, $(find $d -name '*.lean' -print0 | xargs -0 cat | wc -l) lines"
done

# declarations per library (keyword at line start, after optional attribute and modifiers)
for d in NavierStokes Euler ComparatorChallenges; do for k in theorem lemma def structure; do
  echo "$d $k: $(grep -rhE "^(@\\[[^]]*\\] *)?(private |protected |noncomputable |nonrec )*$k " --include='*.lean' $d | wc -l)"
done; done
# instance and abbrev: the same, with "local |scoped " added to the modifier list

# the eight longest files
find NavierStokes Euler ComparatorChallenges -name '*.lean' -print0 | xargs -0 wc -l | sort -rn | grep -v total | head -8

# files importing Mathlib directly
grep -rlE '^import Mathlib' --include='*.lean' NavierStokes Euler ComparatorChallenges | wc -l

# sorry (whole word) per library, and imports of the reference from the proof libraries
for d in NavierStokes Euler ComparatorChallenges; do echo "$d: $(grep -rnw sorry --include='*.lean' $d | wc -l)"; done
grep -rl 'import ComparatorChallenges' --include='*.lean' NavierStokes Euler | wc -l</pre>
<p>Results: NavierStokes 816 files / 429,279 lines / 27,272 theorem / 1 lemma / 7,525 def / 524 structure; Euler 1,839 / 211,578 / 11,228 / 28 / 3,295 / 129; ComparatorChallenges 2 / 472 / 9 / 0 / 7 / 15; plus the two import-only root modules (3 lines). Mathlib imports: 440 (only 4 of them <code>import Mathlib</code> itself). <code>sorry</code>: 0, 0 and 5 textual matches (four placeholders and one mention in a docstring). Reference imports from the proof libraries: 0.</p></details>`,
      verify: {
        statements: [
          { title: 'Counts at the pinned commit (numerically computed)', html: '<pre>library                files    lines   theorem  lemma    def  structure  imports Mathlib\nNavierStokes/            816  429,279    27,272      1  7,525        524             270\nEuler/                 1,839  211,578    11,228     28  3,295        129             168\nComparatorChallenges/      2      472         9      0      7         15               2\nroot modules               2        3\ntotal                  2,659  641,332    38,509     29 10,827        668             440</pre><p>Longest files: Euler/EulerProof.lean 20,755; NavierStokes/CorrectionStep.lean 9,849; CorrectionInitializationNoOptions.lean 5,573; CorrectionInitialization.lean 5,562; VariableGaugeMean.lean 3,004; InitialPhysicalData.lean 2,854; BaseResidual.lean 2,807; NominalProfile.lean 2,679.</p>' },
          { title: 'What the repository records about its production', html: '<p><code>formalization.yaml</code>, lines 96–104: <code>automation: methods: - method: "agent"  models: - "GPT-6 Astra"  framework: "Codex"</code>; <code>review: status: "self-assessed"</code>. Lines 128–130 thank “the authors of Lean 4 and mathlib, as well as Formal Conjectures, Lake, Comparator, lean4export, nanoda, and related tools.” GitHub lists two commits (8 and 10 September 2026); the clone used here is shallow and holds only the pinned one.</p>' },
          { title: 'Reported, not verified', html: '<p>The figures “about 17 additional hours” for the Lean formalization, “roughly 10,000 agents” and “about 88 hours” for the Navier–Stokes proof, and “under 100 agents” and “about 50 hours” for Euler are press reports of OpenAI’s announcement. They are not in the repository and this guide could not reach OpenAI’s blog post to confirm them.</p>' },
        ],
        lean: [
          { decl: 'Euler/EulerProof.lean (20,755 lines, the longest file)', file: 'Euler/EulerProof.lean', line: 1, module: true },
          { decl: 'NavierStokes/CorrectionStep.lean (9,849 lines)', file: 'NavierStokes/CorrectionStep.lean', line: 1, module: true },
          { decl: 'NavierStokes/CorrectionInitializationNoOptions.lean (5,573 lines; 15 lines differ from CorrectionInitialization.lean)', file: 'NavierStokes/CorrectionInitializationNoOptions.lean', line: 1, module: true },
          { decl: 'NavierStokes.lean (root module: two imports)', file: 'NavierStokes.lean', line: 1, module: true },
          { decl: 'Euler.lean (root module: one import)', file: 'Euler.lean', line: 1, module: true },
        ],
        context: [
          { src: 'lean-repo', note: 'All counts refer to this repository at the pinned commit.' },
          { src: 'formalization-yaml', note: 'Automation and review fields.' },
          { src: 'wiki-lean', note: 'Source of the Mathlib size figure (over 210,000 theorems and 100,000 definitions as of May 2025). Counting method unknown; order-of-magnitude comparison only.' },
          { src: 'mathlib-repo' },
          { src: 'press-scalevise', note: 'Reports 17 further hours for the Lean formalization via GPT-6 Astra; roughly 10,000 agents over about 88 hours for the proof.' },
          { src: 'press-vktr', note: 'Headline figure of 10,000 agents.' },
          { src: 'press-batch', note: 'Summary of the announcement: roughly 10,000 agents, 88 hours, 17 further hours in Lean; under 100 agents and about 50 hours for Euler.' },
          { src: 'openai-blog', note: 'OpenAI’s own account; not reachable from this environment, cited by URL only.' },
        ],
        limits: [
          'Counts are textual. A keyword at the start of a comment line would be counted; indented declarations are not. Treat the declaration totals as accurate to within a few tens.',
          'Lines include comments and blank lines. Disk usage (`du -sh`: 24 MB and 14 MB; 22.8 MB and 10.9 MB of file content) is given only as a cross-check.',
          'The Mathlib figure comes from Wikipedia at a different date and with an unknown counting method; the comparison is order-of-magnitude only.',
          'Timings and agent counts are press reports of an announcement. They are context, not evidence, and are not used anywhere as mathematics.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'what-is-not-checked',
      title: 'The boundary of the check',
      question: 'What is outside the reach of the checker?',
      visual: { scene: 'lean-stack', label: 'schematic', caption: 'The same stack, with what sits outside it. Click an item.', params: { mode: 'gaps' } },
      status: {
        changes: 'Nothing inside the stack. This scene adds the five things around it that no checker can decide.',
        bounded: 'The machine-checked core: from Mathlib and three standard axioms, the four stated theorems follow.',
        fails: 'Transfer. Confidence in the kernel does not carry over to interpretation, review status or physical meaning.',
      },
      understand: `
<p>Formal verification moves the question; it does not remove it. After the check, nobody needs to re-read 641,000 lines to trust that the stated theorems follow from Mathlib. What remains is everything the statement does not contain.</p>
<p>Five things sit outside the checker’s reach. The choice of statement: whether the forced equations are “the Navier–Stokes problem” is interpretation, and the checker has no opinion. The papers: their prose, headings and theorem numbers were not checked; only the Lean was. The trusted base: Lean’s kernel, the Mathlib definitions the statement is written in, and the exporter and second kernel used for the independent re-check. Review: the repository marks its own status as “self-assessed”, and no source listed here records a peer review. Physical relevance: whether a smooth, deliberately constructed force says anything about real fluids is not a mathematical question.</p>
<p>None of these is a flaw. They are the shape of what a proof checker can do. The interpretation debate itself is [[scene:implications|chapter 5]].</p>`,
      inspect: `
<p>Everything in the stack reduces to one certified sentence: <em>from Mathlib’s definitions and three standard axioms, the four stated theorems follow.</em> Each item outside the stack is a question that sentence does not contain.</p>
<h3>(a) Which problem was solved</h3>
<p>The Lean reference transcribes alternatives (C) and (D) of the Clay description, which allow a smooth force. A reader who means the unforced equations when saying “the Navier–Stokes problem” will find that no theorem in the repository addresses alternatives (A) or (B), and no checker can rule on which reading is the right one. The statements themselves are compared in [[scene:concentration/what-is-claimed|chapter 1]].</p>
<h3>(b) The papers were not checked</h3>
<p>Only Lean text passes through the kernel. The papers’ prose, headings and numbering are connected to the Lean by <code>formalization.yaml</code>, an alignment table written by the authors that maps “Theorem 1.1” and “Corollary 10.6” to declarations. Whether the informal arguments in the PDFs match the formal ones, and whether the exposition is right, are ordinary questions for human referees.</p>
<h3>(c) The trusted base</h3>
<p>Trust bottoms out in Lean’s kernel (version 4.34.0-rc2 here); in Mathlib at the pinned revision, since <code>fderiv</code>, <code>ContDiffOn</code>, <code>MemLp</code>, the integral and <code>ENNReal</code> suprema are Mathlib’s definitions and the statement is only as meaningful as they are; and, for the independent re-check, in <code>lean4export</code>, the <code>landrun</code> sandbox and the <code>nanoda</code> kernel. Comparator’s README lists its own assumptions, including that the challenge’s imports are trustworthy and that at least one of the kernels is correct. These are small, well-studied components. They are not nothing.</p>
<h3>(d) Review status</h3>
<p><code>formalization.yaml</code> records <code>review: status: "self-assessed"</code>. Formal verification replaces the referee’s line-by-line check of the proof; it does not replace the referee’s judgement about the statement, the alignment with the paper, or the significance. None of the sources listed in this guide records a peer review of the papers.</p>
<h3>(e) Physical relevance</h3>
<p>The force is an input to the construction, chosen so that the solution breaks down. Whether a flow driven by such a force tells us anything about turbulence or real fluids is a question for physics and judgement, not for a proof checker, and it is where much of the public disagreement lives. That debate is [[scene:implications|chapter 5]].</p>
<details class="more"><summary>What a sceptical reader can do in an afternoon</summary>
<p>Read the two reference files (472 lines). Rebuild the project with the two commands in the README. Run the two Comparator commands in <code>ComparatorChallenges/README.md</code>. Compare the reference against the upstream Formal Conjectures file at the commit named in its header. Each step moves one item from “trusted” to “checked”; none of them touches (a), (d) or (e).</p></details>`,
      verify: {
        statements: [
          { title: 'The certified sentence', html: '<p>From the definitions in Mathlib (manifest revision <code>85e3a25e…</code>) and the axioms <code>propext</code>, <code>Classical.choice</code>, <code>Quot.sound</code>, the declarations <code>NavierStokes.Comparator.navier_stokes_breakdown_R3</code>, <code>…_periodic</code>, <code>Euler.euler_breakdown_R3</code> and <code>Euler.exists_compact_smooth_euler_singularity</code> are theorems, with statements identical to the reference. This is what <code>lake build</code>, the <code>#print axioms</code> commands and a successful Comparator run establish, per the Comparator README; the repository reports the first two and ships the configuration for the third. Nothing outside this sentence is certified.</p>' },
          { title: 'The trusted base, as the sources describe it', html: '<p>Lean 4 (<code>leanprover/lean4:v4.34.0-rc2</code>); Mathlib at the pinned manifest revision; for Comparator: <code>landrun</code> (sandbox), <code>lean4export</code> (export of the environment), <code>nanoda</code> (second kernel), and the operating system and hardware they run on, which the Comparator README notes are part of landrun’s trusted code base. Comparator’s assumptions include a trustworthy challenge import closure and “At least one of the Lean kernel or the <code>external_kernels</code> is correct”.</p>' },
          { title: 'Review status', html: '<p><code>formalization.yaml</code>, lines 103–104: <code>review:</code> <code>status: "self-assessed"</code>. No peer review of either paper is recorded in any source listed in this guide as of their dates.</p>' },
        ],
        lean: [
          { decl: 'NavierStokes.ComparatorSolution (imports: the two bridge modules)', file: 'NavierStokes/ComparatorSolution.lean', line: 1, module: true, note: 'The proved theorems are adapters over NavierStokes.ComparatorR3Theorem and NavierStokes.ComparatorTheorem.' },
          { decl: 'Euler.Solution (imports: seven project modules)', file: 'Euler/Solution.lean', line: 1, module: true },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3 (reference, “(C) Breakdown of Navier–Stokes solutions on ℝ³”)', file: 'ComparatorChallenges/NavierStokes.lean', line: 272, note: 'The checker verifies this statement; whether (C) is “the problem” is item (a).' },
          { decl: 'NavierStokes.ComparatorDefinitions (module docstring)', file: 'NavierStokes/ComparatorDefinitions.lean', line: 22, note: 'The proof-side definitions Comparator compares against the reference at runtime.' },
        ],
        context: [
          { src: 'formalization-yaml', note: 'review.status and the alignment table.' },
          { src: 'comparator-readme', note: 'Assumption list and the note on landrun’s trusted code base.' },
          { src: 'clay-statement', note: 'Alternatives (A)–(D).' },
          { src: 'lean4' }, { src: 'mathlib-repo' }, { src: 'lean4export' }, { src: 'nanoda' }, { src: 'landrun' },
          { src: 'press-implicator', note: 'Reports that the Clay Mathematics Institute has not described the problem as solved (statement of 11 September 2026). Cited for item (a) as context; the article was not read in this environment.' },
        ],
        limits: [
          'This scene lists boundaries, not defects. Nothing here is evidence that any theorem is wrong.',
          'The trusted-base list is assembled from the repository files and the Comparator README; a full audit of what the statement depends on inside Mathlib was not done.',
          '“No peer review recorded” is a statement about the sources listed in this guide as of their dates, not a claim about the state of the literature.',
          'The physical-relevance question is deliberately left open here; chapter 5 collects the positions with attribution.',
        ],
      },
    },
  ],
};
