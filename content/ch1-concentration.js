// Chapter 1 — the template chapter. Every later chapter follows this shape (see content/SCHEMA.md).
export default {
  id: 'concentration',
  number: 1,
  title: 'Infinite peak speed, finite energy',
  equation: 'ns',
  summary: 'The apparent contradiction at the heart of the result, why a picture of it is not a proof, and what exactly the theorems say.',
  scenes: [
    /* ------------------------------------------------------------------ */
    {
      id: 'peak-vs-energy',
      title: 'Peak speed versus total energy',
      question: 'How can a fluid\u2019s maximum speed become infinite while its total kinetic energy stays finite?',
      visual: { scene: 'concentration', label: 'formula-derived', caption: 'A contracting core: speed up, size down, energy on a ledger', params: { preset: 'leray' } },
      status: {
        changes: 'The fastest speed anywhere, and the velocity gradient across the core, grow without bound as $t \\to T$.',
        bounded: 'The energy stored in the core, speed$^2$ \u00d7 volume, whenever the core shrinks fast enough to pay for the speed.',
        fails: 'Nothing yet. This is bookkeeping, not an equation. The picture does not know it has to satisfy Navier\u2013Stokes.',
      },
      understand: `
<p>Kinetic energy is not the same thing as speed. Energy adds up motion over the <em>whole</em> fluid; speed is the motion at a single point. A tiny region can move extremely fast and still contribute almost nothing to the total, because the total is weighted by volume.</p>
<p>So imagine a small core of fluid that spins faster and faster while it shrinks. Its energy is roughly</p>
<p>$$E_{\\text{core}} \;\\approx\; (\\text{characteristic speed})^2 \\times (\\text{core volume}).$$</p>
<p>If the volume collapses faster than the squared speed grows, the energy in the core stays bounded, or even goes to zero, while the peak speed heads to infinity. Drag the time slider toward the blowup time and watch the two readouts separate.</p>
<div class="callout key"><b class="tag">Label this carefully</b>This is the <strong>concentration intuition</strong>. It explains why infinite speed and finite energy are not contradictory. It does not explain why the fluid would do this, and it says nothing about the energy outside the core. In the proof, bounding the energy of the <em>whole</em> solution is a separate argument.</div>`,
      inspect: `
<p>Write $s = T - t$ for the time left before the blowup, and suppose the core has width $w(s)$, length $L(s)$ and characteristic speed $U(s)$, all power laws:</p>
<p>$$U \\sim s^{-\\alpha}, \\qquad w \\sim s^{\\beta_w}, \\qquad L \\sim s^{\\beta_L}.$$</p>
<p>Then, up to constants, the ledger in the scene reads</p>
<p>$$E_{\\text{core}} \\sim U^2 w^2 L \\sim s^{\\,2\\beta_w + \\beta_L - 2\\alpha}, \\qquad |\\nabla u| \\sim \\frac{U}{w} \\sim s^{-(\\alpha+\\beta_w)}, \\qquad \\int_{\\text{core}} |\\nabla u|^2 \\sim U^2 L \\sim s^{\\,\\beta_L - 2\\alpha}.$$</p>
<p>The core energy stays bounded exactly when $2\\beta_w + \\beta_L \\ge 2\\alpha$: the volume must shrink at least as fast as the squared speed grows. The gradient always blows up. The core <em>enstrophy</em> (the squared gradient, integrated) blows up unless the length collapses faster than $s^{2\\alpha}$.</p>
<h3>Why $\\alpha = \\tfrac12$ is the natural guess</h3>
<p>The Navier\u2013Stokes equations have a scaling symmetry: if $u(x,t)$ solves them, so does $\\lambda\\,u(\\lambda x, \\lambda^2 t)$ for every $\\lambda \\gt 0$. A solution that reproduces itself under this symmetry as it approaches $T$ has the form</p>
<p>$$u(x,t) = \\frac{1}{\\sqrt{T-t}}\; \\mathbf{U}\\!\\left(\\frac{x}{\\sqrt{T-t}}\\right),$$</p>
<p>which is the preset \u201cnatural scaling\u201d: $\\alpha = \\beta_w = \\beta_L = \\tfrac12$. Its core energy scales like $s^{1/2} \\to 0$. Leray showed in 1934 that if a solution of the unforced equation breaks down at time $T$, its peak speed must grow at least like $(T-t)^{-1/2}$; the natural scaling is the slowest allowed blowup.</p>
<details class="more"><summary>Isotropic versus slender</summary>
<p>Press descriptions of the construction speak of a vortex whose <em>radial width decreases faster than its axial length</em>, with inward spiralling and axial outflow. In the ledger that is $\\beta_w \\gt \\beta_L$: the core becomes a thin, long filament. The \u201cslender core\u201d preset illustrates the shape of such bookkeeping; its exponents are illustrative, not taken from the paper. The scene shows what every such choice implies for energy, gradient and enstrophy.</p></details>
<details class="more"><summary>What the whole-solution energy bound has to handle</summary>
<p>Three things live outside this heuristic: the shear annulus around the core, where the velocity drops from its peak to the background; the far field, which must decay fast enough to be square-integrable; and the work done by the external force, which can pump energy in. The statement that the solution has uniformly bounded kinetic energy on $[0,T)$ must control all three. The scene only displays the first term.</p></details>`,
      verify: {
        statements: [
          { title: 'Scaling bookkeeping (formula-derived)', html: '<p>For $U \\sim s^{-\\alpha}$, $w \\sim s^{\\beta_w}$, $L \\sim s^{\\beta_L}$: $U^2 w^2 L \\sim s^{2\\beta_w+\\beta_L-2\\alpha}$ is bounded as $s \\to 0$ if and only if $2\\beta_w + \\beta_L \\ge 2\\alpha$. This is an identity about the displayed power laws, not a statement about any solution of the equations.</p>' },
          { title: 'Where bounded energy enters the theorem', html: '<p>In the Lean statement of Clay alternative (C), uniformly bounded kinetic energy is part of the <em>solution class that is shown not to exist</em>: a global smooth solution is required to satisfy <code>globally_bounded_energy : \u2203 E, \u2200 t \u2265 0, \u222b \u2016v x t\u2016\u00b2 \u003c E</code>. The theorem says no such solution exists for the constructed data and force.</p>' },
          { title: 'Leray\u2019s lower bound (classical, unforced equation)', html: '<p>If a smooth solution of the unforced Navier\u2013Stokes equations on $\\R^3$ first loses regularity at time $T$, then $\\norm{u(t)}_{\\Linf} \\ge c\\,\\nu^{1/2}\\,(T-t)^{-1/2}$ for $t \\lt T$. This fixes $\\alpha \\ge \\tfrac12$ as the slowest possible blowup of the peak speed.</p>' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Main theorem (Theorem 1.1 per formalization.yaml)', note: 'The paper is the source for the specific scaling of the constructed vortex. Its exponents are not reproduced here because the PDF could not be read in this environment; the ledger uses the natural scaling and illustrative presets.' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothnessRn', file: 'ComparatorChallenges/NavierStokes.lean', line: 245, note: 'The whole-space solution class: smooth, divergence-free, square-integrable at each time, and uniformly bounded energy (line 253).' },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', file: 'NavierStokes/ComparatorSolution.lean', line: 16, note: 'For every \u03bd \u003e 0 there are smooth decaying data and force with no global smooth bounded-energy solution.' },
        ],
        context: [
          { src: 'openai-x', note: 'OpenAI\u2019s description of the solution as a vortex that \u201cspirals inward and gets increasingly elongated\u201d.' },
          { src: 'leray', note: 'Origin of the scaling symmetry, the energy inequality and the lower bound on the blowup rate.' },
        ],
        limits: [
          'The scene computes power laws, not solutions. No fluid equation is solved here.',
          'The slender-core exponents are illustrative. The paper\u2019s actual scaling is cited but not reproduced.',
          'Energy outside the core (shear annulus, far field) and the work done by the force are not shown; the uniform energy bound of the real solution is a separate estimate in the paper.',
          'The Leray lower bound is stated for the unforced equation; with a force the constant depends on the force as well.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'not-yet-a-proof',
      title: 'Why a shrinking vortex is not yet a proof',
      question: 'If we insert the proposed flow into the equation, what is left unbalanced?',
      visual: { scene: 'swirl-residual', label: 'formula-derived', caption: 'Toy model: a planar swirl that contracts on schedule, and the force it would need', params: { a: 0.5, b: 0.5, nu: 0.05 } },
      status: {
        changes: 'The force the equation demands grows faster than the speed: at least like $(T-t)^{-\\alpha-1}$ from the time derivative alone.',
        bounded: 'The toy\u2019s energy per unit length, when the width shrinks at least as fast as the speed grows ($\\beta \\ge \\alpha$).',
        fails: 'Smoothness of the force. The theorem needs $f$ smooth for all $t \\ge 0$, including at and after $T$. A force that becomes infinite is not allowed.',
      },
      understand: `
<p>Here is the uncomfortable truth behind every forced blowup result: <strong>any</strong> smooth divergence-free velocity field is a solution of Navier\u2013Stokes with <em>some</em> force. Plug the field into the equation; whatever is left unbalanced, call it the force. A shrinking vortex animation is therefore always \u201ca solution\u201d. The entire content of the theorem is in the quality of the force: it must be smooth, decay, and stay smooth through the moment the velocity becomes infinite.</p>
<p>The leftover is called the <strong>residual</strong>. The scene computes it for the simplest possible contracting vortex, a flat swirl that is told to shrink on schedule. The required force grows even faster than the velocity. It blows up. So this flow is a solution of the equations, but with a singular force, and that proves nothing.</p>
<p>In this toy the fluid has no way to speed itself up: the pressure balances the spinning exactly and nothing else happens. A real construction needs the fluid\u2019s own nonlinear term to do the amplifying, so that the force only has to patch a mismatch. The next chapter is about making that mismatch smooth.</p>`,
      inspect: `
<p>Write the incompressible Navier\u2013Stokes equations as</p>
<p>$$\\partial_t u + (u\\cdot\\nabla)u - \\nu\\Delta u + \\nabla p = f, \\qquad \\nabla\\cdot u = 0.$$</p>
<p>For a proposed divergence-free field $u$ and any pressure $p$, define the <strong>residual</strong></p>
<p>$$R[u,p] := \\partial_t u + (u\\cdot\\nabla)u - \\nu\\Delta u + \\nabla p.$$</p>
<p>Setting $f := R[u,p]$ makes $(u,p)$ a solution by definition. The pressure can be chosen to absorb the gradient part of the nonlinearity, so the real question is whether what remains is smooth and decays. That is the whole game.</p>
<h3>The toy in the scene</h3>
<p>Take a planar swirl $u = v_\\theta(r,t)\\,e_\\theta$ with $v_\\theta = U(t)\\,F(r/w(t))$ and $F(\\rho) = \\rho\\, e^{(1-\\rho^2)/2}$, so $F$ peaks at $\\rho = 1$ with value $1$. It is divergence-free. The nonlinear term is purely centripetal, $(u\\cdot\\nabla)u = -(v_\\theta^2/r)\\,e_r$, and the pressure $\\partial_r p = v_\\theta^2/r$ cancels it exactly. What survives in the azimuthal direction is</p>
<p>$$f_\\theta = \\partial_t v_\\theta - \\nu\\Big(\\partial_{rr}v_\\theta + \\tfrac1r \\partial_r v_\\theta - \\tfrac{v_\\theta}{r^2}\\Big).$$</p>
<p>With $U = s^{-\\alpha}$, $w = s^{\\beta}$, $s = T-t$ and $\\rho = r/w$, this is explicit:</p>
<p>$$f_\\theta = s^{-\\alpha-1}\\big(\\alpha F(\\rho) + \\beta\\,\\rho F'(\\rho)\\big) \;-\; \\nu\\, s^{-\\alpha-2\\beta}\\, e^{(1-\\rho^2)/2}\\,(\\rho^3 - 4\\rho).$$</p>
<p>The first term comes from the time derivative and grows like $s^{-\\alpha-1}$, one full power faster than the speed. The viscous term grows like $s^{-\\alpha-2\\beta}$. Either way, $\\max|f_\\theta| \\to \\infty$ as $s \\to 0$. Switch on the similarity coordinate $\\rho = r/w(t)$: the velocity profile freezes, the force does not.</p>
<h3>Why the toy cannot help itself</h3>
<p>A planar swirl has no vortex stretching. In two dimensions vorticity is only transported and diffused, which is why two-dimensional Navier\u2013Stokes is globally regular. Growth has to come from the three-dimensional term $(\\omega\\cdot\\nabla)u$, which tilts and stretches vortex lines. Press descriptions of the construction match this: inward spiralling combined with axial outflow, so that the contracting core is stretched along its axis and the shear in the surrounding annulus is strengthened by the flow itself.</p>
<details class="more"><summary>What \u201csmooth force\u201d means in the Clay formulation</summary>
<p>The official problem description, and its Lean transcription, require the force to be $C^\\infty$ on $\\R^3 \\times [0,\\infty)$ and to satisfy, for every derivative order $m$ and every rate $K$, a bound $\\|\\partial^m_{x,t} f(x,t)\\| \\le C/(1+|x|+t)^K$. In words: infinitely smooth in space and time, decaying faster than any polynomial, for all time, with no exception at the blowup time.</p></details>`,
      verify: {
        statements: [
          { title: 'Residual identity', html: '<p>For any sufficiently smooth divergence-free $u$ and any $p$, the pair $(u,p)$ solves $\\partial_t u + (u\\cdot\\nabla)u - \\nu\\Delta u + \\nabla p = f$ with $f := R[u,p]$. Trivially true by definition; the content of a blowup theorem is the regularity and decay of $f$.</p>' },
          { title: 'Toy force (formula-derived)', html: '<p>For $v_\\theta = U(t)F(r/w(t))$, $F(\\rho) = \\rho e^{(1-\\rho^2)/2}$, $U = s^{-\\alpha}$, $w = s^\\beta$: $f_\\theta = s^{-\\alpha-1}(\\alpha F + \\beta \\rho F\') - \\nu s^{-\\alpha-2\\beta} e^{(1-\\rho^2)/2}(\\rho^3-4\\rho)$. At $\\rho = 1$ the inertial part equals $\\alpha\\, s^{-\\alpha-1}$, which is unbounded as $s \\to 0$ for every $\\alpha \\gt -1$.</p>' },
          { title: 'Force conditions in the theorem', html: '<p>Clay alternative (C) requires <code>ForceConditionDecay f</code>: $f$ is $C^\\infty$ on $\\R^3\\times[0,\\infty)$ and all space-time derivatives decay faster than any polynomial in $|x| + t$. Alternative (D) requires <code>ForceConditionPeriodic f</code>: smooth, 1-periodic in space, decaying in time.</p>' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Introduction and construction of the force', note: 'The paper constructs the actual force as the residual of a corrected ansatz and proves it is smooth and compactly supported. Its internal structure is explored in chapter 2.' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.ForceConditionDecay', file: 'ComparatorChallenges/NavierStokes.lean', line: 185, note: 'Smooth on \u211d\u00b3 \u00d7 [0,\u221e) with faster-than-polynomial decay of every derivative in space and time.' },
          { decl: 'NavierStokes.Comparator.ForceConditionPeriodic', file: 'ComparatorChallenges/NavierStokes.lean', line: 200, note: 'The periodic counterpart used for alternative (D).' },
          { decl: 'NavierStokes.Comparator.NavierStokesExistenceAndSmoothness', file: 'ComparatorChallenges/NavierStokes.lean', line: 217, note: 'The equation itself, as transcribed in Lean: the field navier_stokes at line 222.' },
        ],
        context: [
          { src: 'openai-x', note: 'Source of the \u201cspirals inward\u201d and \u201cincreasingly elongated\u201d description.' },
          { src: 'clay-statement', note: 'Conditions (5) and (9) on the force, which the Lean structures transcribe.' },
        ],
        limits: [
          'The toy is two-dimensional and axisymmetric. It is chosen because it has no self-amplification, to make the obstacle visible; it is not the paper\u2019s flow.',
          'Energy per unit length is shown because a planar swirl has infinite extent in the axial direction.',
          'The claim that the real construction uses axial stretching is taken from OpenAI\u2019s public description, not from a reading of the paper.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'what-is-claimed',
      title: 'What exactly is claimed',
      question: 'Which statements were actually proven, and for which equation?',
      visual: {
        scene: 'scope-table', label: 'source-quoted', caption: 'The four machine-checked statements, side by side',
        params: {
          left: 'Navier\u2013Stokes (forced)', right: 'Euler (unforced)',
          note: 'Click a row to highlight it. The Lean wording is copied from the pinned commit of the repository; the plain wording is a paraphrase.',
          rows: [
            { k: 'Equation', a: '$\\partial_t v + (v\\cdot\\nabla)v = \\nu\\Delta v - \\nabla p + f$, $\\nabla\\cdot v = 0$, every $\\nu \\gt 0$', aLean: 'derivWithin (v x ·) (Set.Ici 0) t + fderiv ℝ (v · t) x (v x t) = nu • Δ (v · t) x - gradient (p · t) x + f x t', b: '$\\partial_t v + (v\\cdot\\nabla)v = -\\nabla p$, $\\nabla\\cdot v = 0$, no viscosity, no force', bLean: 'derivWithin (v x ·) (Set.Ici 0) t + fderiv ℝ (v · t) x (v x t) = -gradient (p · t) x' },
            { k: 'Initial data', a: 'Smooth, divergence-free, every derivative decays faster than any polynomial (whole space); smooth, divergence-free, 1-periodic (torus)', aLean: 'InitialVelocityConditionDecay u₀   /   InitialVelocityConditionPeriodic u₀', b: 'Smooth, divergence-free, compactly supported, nonzero', bLean: 'InitialVelocityConditionDecay u₀ ∧ HasCompactSupport u₀ ∧ u₀ ≠ 0' },
            { k: 'Force', a: 'Smooth on $\\R^3\\times[0,\\infty)$, every space-time derivative decays faster than any polynomial (whole space); smooth, periodic in space, decaying in time (torus)', aLean: 'ForceConditionDecay f   /   ForceConditionPeriodic f', b: 'None', bLean: '(no f in the equation)' },
            { k: 'Conclusion', a: 'There is <b>no</b> global smooth solution with uniformly bounded kinetic energy (whole space); there is <b>no</b> global smooth periodic solution (torus)', aLean: '¬ (∃ v p, NavierStokesExistenceAndSmoothnessRn nu u₀ f v p)\n¬ (∃ v p, NavierStokesExistenceAndSmoothnessPeriodic nu u₀ f v p)', b: 'There is no global smooth bounded-energy solution; moreover a solution exists on $[0,T^*)$ with $0 \\lt T^* \\le 1$, exists on $[0,T]$ iff $T \\lt T^*$, has bounded energy, and $\\limsup_{t\\to T^*}\\|v(t)\\|_{C^1} = \\infty$, $\\int_0^{T^*}\\|\\omega(t)\\|_{\\Linf}dt = \\infty$', bLean: 'Filter.limsup (fun t => velocityC1Norm (v · t)) (𝓝[<] Tstar) = ⊤ ∧\n(∫⁻ t in Ico 0 Tstar, vorticityNorm (v · t)) = ⊤' },
            { k: 'Relation to the Clay problem', a: 'Exactly alternatives (C) and (D) of the official description, which permit a smooth force', aLean: 'Reference statements adapted from Google DeepMind\u2019s Formal Conjectures transcription of Fefferman\u2019s description', b: 'Not part of the Clay problem', bLean: '' },
            { k: 'Not claimed', a: 'Blowup for the <b>unforced</b> Navier\u2013Stokes equations (alternatives (A)/(B) remain open)', aLean: '', b: 'Blowup for Navier\u2013Stokes by \u201cturning off\u201d viscosity; a statement about the Navier\u2013Stokes force', bLean: '' },
          ],
        },
      },
      status: {
        changes: 'Which equation, which domain, which force. Four theorems about two different equations.',
        bounded: 'Kinetic energy is a hypothesis of the solution class ruled out on the whole space, and a proven property of the Euler solution on $[0,T^*)$.',
        fails: 'Existence of a global smooth solution, in the stated class, for the constructed data and force.',
      },
      understand: `
<p>Four statements were machine-checked. Two are about the viscous Navier\u2013Stokes equations <em>with</em> a smooth external force, and they are exactly the two \u201cbreakdown\u201d alternatives (C) and (D) that the official Clay problem description lists as acceptable resolutions. Two are about the ideal Euler equations <em>without</em> any force, and they are not part of the Clay problem at all.</p>
<p>Notice the logical form of the Navier\u2013Stokes theorem. It does not say \u201chere is a solution that blows up\u201d. It says: here are initial data and a force such that <strong>no</strong> global smooth solution (with bounded energy, on the whole space) exists. The blowing-up solution is how the proof gets there, but the theorem is a non-existence statement in a precisely defined class.</p>
<p>The Euler theorem is more concrete: it names the data, gives the maximal lifetime $T^*$, and says which norms become infinite at $T^*$.</p>
<div class="callout caution"><b class="tag">Contested, and left contested</b>Whether the forced result \u201csolves\u201d the Navier\u2013Stokes problem is a matter of interpretation: the written problem permits it, but many mathematicians mean the unforced question. This guide reports both readings; see [[scene:implications|chapter 5]].</div>`,
      inspect: `
<p>Both whole-space theorems have the shape</p>
<p>$$\\exists\\, u_0,\\ (f):\\quad \\text{(data conditions)} \;\\wedge\; \\neg\\,\\big(\\exists\\, v, p:\\ \\text{(global smooth solution conditions)}\\big).$$</p>
<p>How does a proof of this look? One constructs a specific smooth solution $(v,p)$ on $[0,T)$ for the chosen data, shows that a norm of $v$ becomes infinite as $t \\to T$, and then rules out any other global smooth solution by a <em>uniqueness</em> argument: two smooth, decaying solutions with the same data and force must coincide on their common interval of existence. A hypothetical global smooth solution would therefore agree with the constructed one on $[0,T)$, inherit its unbounded norm, and contradict its own smoothness at $T$.</p>
<p>This is why the solution class matters. The whole-space class asks for square-integrable velocity at each time and uniformly bounded energy; the periodic class asks for periodicity of velocity and pressure. Each uniqueness argument is run inside its class.</p>
<h3>Reading the Euler statement</h3>
<p>The quantitative Euler theorem fixes data $u_0$ and a time $T^* \\in (0,1]$ and asserts five things: a solution in an all-order Sobolev class exists on $[0,T^*)$; it has bounded energy there; solutions on closed intervals $[0,T]$ exist precisely for $T \\lt T^*$; the $C^1$ norm (sup of velocity plus sup of its gradient) is finite on every $[0,T]$ with $T \\lt T^*$ but its $\\limsup$ at $T^*$ is infinite; and the time integral of the vorticity supremum diverges at $T^*$. The last clause is the Beale\u2013Kato\u2013Majda criterion in action: a smooth Euler solution can be continued past $T^*$ if and only if $\\int_0^{T^*}\\norm{\\omega(t)}_{\\Linf}\\dd t \\lt \\infty$, so its divergence certifies that $T^*$ is a genuine singular time.</p>
<details class="more"><summary>Why there are two Navier\u2013Stokes theorems</summary>
<p>The Clay description treats the whole space and the periodic torus separately, with different decay requirements. The repository\u2019s metadata aligns the whole-space result with the paper\u2019s Theorem 1.1 and the periodic result with its Corollary 10.6, so the periodic case is derived from the whole-space construction rather than proved independently.</p></details>`,
      verify: {
        statements: [
          { title: 'Navier\u2013Stokes, whole space, alternative (C)', html: '<pre>theorem navier_stokes_breakdown_R3 (nu : ℝ) (hnu : nu > 0) :\n    ∃ (u₀ : ℝ³ → ℝ³) (f : ℝ³ → ℝ → ℝ³),\n    InitialVelocityConditionDecay u₀ ∧ ForceConditionDecay f ∧\n    ¬ (∃ v p, NavierStokesExistenceAndSmoothnessRn nu u₀ f v p)</pre>' },
          { title: 'Navier\u2013Stokes, periodic torus, alternative (D)', html: '<pre>theorem navier_stokes_breakdown_periodic (nu : ℝ) (hnu : nu > 0) :\n    ∃ (u₀ : ℝ³ → ℝ³) (f : ℝ³ → ℝ → ℝ³),\n    InitialVelocityConditionPeriodic u₀ ∧ ForceConditionPeriodic f ∧\n    ¬ (∃ v p, NavierStokesExistenceAndSmoothnessPeriodic nu u₀ f v p)</pre>' },
          { title: 'Euler, non-existence of a global smooth solution', html: '<pre>theorem euler_breakdown_R3 :\n    ∃ u₀ : ℝ³ → ℝ³, InitialVelocityConditionDecay u₀ ∧\n      ¬ (∃ v p, EulerExistenceAndSmoothnessR3 u₀ v p)</pre>' },
          { title: 'Euler, quantitative singularity', html: '<pre>theorem exists_compact_smooth_euler_singularity :\n    ∃ (u₀ : ℝ³ → ℝ³) (Tstar : ℝ) (v : ℝ³ → ℝ → ℝ³) (p : ℝ³ → ℝ → ℝ),\n      InitialVelocityConditionDecay u₀ ∧ HasCompactSupport u₀ ∧ u₀ ≠ 0 ∧\n      0 < Tstar ∧ Tstar ≤ 1 ∧\n      EulerSobolevExistenceAndSmoothnessR3On (Ico 0 Tstar) u₀ v p ∧\n      (∃ E : ℝ, ∀ t ∈ Ico (0 : ℝ) Tstar, (∫ x : ℝ³, ‖v x t‖ ^ 2) < E) ∧\n      (∀ T : ℝ, 0 < T →\n        ((∃ w q, EulerSobolevExistenceAndSmoothnessR3On (Icc 0 T) u₀ w q) ↔ T < Tstar)) ∧\n      (∀ T ∈ Ioo 0 Tstar,\n        (⨆ t ∈ Icc (0 : ℝ) T, velocityC1Norm (v · t)) < ⊤ ∧\n        (∫⁻ t in Ico (0 : ℝ) T, vorticityNorm (v · t)) < ⊤) ∧\n      Filter.limsup (fun t : ℝ => velocityC1Norm (v · t)) (𝓝[<] Tstar) = ⊤ ∧\n      (∫⁻ t in Ico (0 : ℝ) Tstar, vorticityNorm (v · t)) = ⊤ ∧\n      ¬ (∃ w q, EulerExistenceAndSmoothnessR3 u₀ w q)</pre>' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Theorem 1.1 and Corollary 10.6', note: 'Alignment stated in formalization.yaml; the numbering is taken from there, not from a reading of the PDF.' },
          { src: 'euler-paper', where: 'Theorem 1.1', note: 'Alignment stated in formalization.yaml.' },
        ],
        lean: [
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3', file: 'NavierStokes/ComparatorSolution.lean', line: 16 },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_periodic', file: 'NavierStokes/ComparatorSolution.lean', line: 23 },
          { decl: 'Euler.euler_breakdown_R3', file: 'Euler/Solution.lean', line: 33 },
          { decl: 'Euler.exists_compact_smooth_euler_singularity', file: 'Euler/Solution.lean', line: 43 },
          { decl: 'NavierStokes.Comparator.navier_stokes_breakdown_R3 (reference, with sorry)', file: 'ComparatorChallenges/NavierStokes.lean', line: 273, note: 'The independent reference statement, adapted from Formal Conjectures, against which the proof is compared.' },
          { decl: 'Euler.velocityC1Norm / Euler.vorticityNorm', file: 'ComparatorChallenges/Euler.lean', line: 157, note: 'Definitions of the norms that diverge: suprema in \u211d\u22650\u221e, so an unbounded field has norm \u22a4.' },
        ],
        context: [
          { src: 'formalization-yaml', note: 'States the alignment between paper theorems and Lean declarations, the axioms used, and sorry count 0.' },
          { src: 'clay-statement', note: 'Alternatives (A)\u2013(D) are on page 2 of the official description.' },
          { src: 'bkm', note: 'The continuation criterion behind the vorticity-integral clause.' },
        ],
        limits: [
          'The plain-language column is a paraphrase; the Lean wording is authoritative.',
          'Lean checks that the proof proves the statement. Whether the statement is the problem one cares about is a human judgement; see [[scene:verification|chapter 4]].',
          'The description of the proof strategy (construct, blow up, uniqueness) is the standard logical shape of such results; the specific uniqueness arguments live in the repository and are not reproduced here.',
        ],
      },
    },
  ],
};
