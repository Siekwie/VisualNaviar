// Chapter 3 — the Euler construction. Mathematical ground truth: the Lean library Euler/ at the pinned commit.
// Paper equation numbers appear only as "the Lean docstring cites equation (N)"; the PDF was not read.
export default {
  id: 'euler', number: 3, title: 'The Euler construction', equation: 'euler',
  summary: 'Localized oscillations at wildly separated scales are amplified stage by stage; the limit of the stages is smooth initial data whose solution cannot be continued.',
  scenes: [
    /* ------------------------------------------------------------------ */
    {
      id: 'layers-at-smaller-scales',
      title: 'Layers at ever smaller scales',
      question: 'How can smooth initial data already contain a singularity?',
      visual: { scene: 'layer-cascade', label: 'formula-derived', caption: 'Stage-by-stage increments: sizes from the Lean scale sequences, wave shapes schematic', params: { J: 3, X: 8, stage: 2 } },
      status: {
        changes: 'From stage to stage the scale $x_n$ grows like $(J+n)^2 x_{n-1}$; wavenumbers and shears grow as exponentials of it.',
        bounded: 'Every Sobolev norm of the sum: the increments’ $H^s$ bounds collapse like $e^{-x_n/8}$ once $(J+n)^2$ exceeds about $8s$.',
        fails: 'Nothing yet. The data are smooth and compactly supported. The Lean proves the sum converges; the singularity needs the dynamics.',
      },
      understand: `
<p>The initial velocity is assembled in stages. Stage $n$ adds one thin layer: a localized plane wave with wavenumber $k_n$ and amplitude of order $e^{-x_n/8}$, where the scale parameters explode,</p>
<p>$$x_{n+1} = (J+n)^2\\, x_n, \\qquad k_n = e^{x_n/(J+n)^2}.$$</p>
<p>Each layer on its own is harmless: a smooth, compactly supported field. The layers live at wildly separated scales, and their sizes shrink so fast that the sum converges in every Sobolev norm. The limit is a $C^\\infty$, divergence-free field supported in the ball of radius 2. Nothing in the data looks singular.</p>
<p>The singularity is in what the flow will do with the layers. At the moment layer $n$ is switched on, the solution’s velocity gradient at the origin is already at least $\\tfrac12\\,\\mathrm{previousShear}_n$, a quantity that grows without bound. Smooth data, unbounded future gradients: that is the plan of the whole chapter.</p>
<div class="callout key"><b class="tag">Boundary</b>This is not the Navier–Stokes construction with viscosity switched off. The Euler proof is its own iterative construction, in a separate Lean library (<code>Euler/</code>, 1,839 files) that imports nothing from the Navier–Stokes part.</div>`,
      stage: {
        need: 'Smooth, compactly supported, divergence-free initial data that nevertheless carry an infinite sequence of structures at separated scales.',
        whyNot: 'A single vortex, or any finite sum of waves, has a smooth solution for a positive time; no finite picture forces blowup.',
        ingredient: 'The scale recursion $x_{n+1}=(J+n)^2x_n$: amplitudes $e^{-x_n/8}$ beat every power of the wavenumber $e^{x_n/(J+n)^2}$, so the sum is smooth.',
        remaining: 'That each stage is an actual Euler solution on its horizon, and that gradients at activation grow: the next two scenes.',
      },
      inspect: `
<p>The scale sequences, as defined in the Lean ([[src:lean-euler-scales]]; the module docstring calls them “the literal sequences in (37)”):</p>
<p>$$x_0 = X,\\quad x_{n+1} = (J+n)^2 x_n,\\qquad k_n = e^{x_n/(J+n)^2},\\quad \\ell_n = e^{-x_n/(J+n)^{7/2}},\\quad \\mathrm{shear}_n = e^{x_n/(J+n)^5},$$</p>
<p>with $\\mathrm{previousShear}_0 = X^{1000}$ and $\\mathrm{previousShear}_{n+1} = \\mathrm{shear}_n$. The record <code>Scales</code> demands $J \\ge 3$, $X \\ge 8$, $D \\ge 2000$ and summability conditions; its values come from an existence proof ([[scene:euler/nested-horizons|scene 3]]).</p>
<p>Stage $n+1$ starts from stage $n$’s initial velocity plus <code>high k + mean k</code> with $k = k_n$ (<code>stages_initial_step</code>). The Lean bound on the oscillating part, in the norm $\\|f\\|_{H^s} := \\sum_{j\\le s}\\|\\nabla^j f\\|_{L^2}$ (<code>derivativeSum</code>):</p>
<p>$$\\|\\mathrm{high}_n\\|_{H^s} \\le \\ell_n^{-s}\\,k_n^{\\,s}\\; C_s\\, P_n^{\\,d_s}\\; e^{-x_n/8}, \\qquad \\|\\mathrm{mean}_n\\|_{H^s} \\le \\ell_n^{-s}\\,k_n^{-2}\\; C_s\\, P_n^{\\,d_s},$$</p>
<p>where $P_n$ is a polynomial in earlier scales (<code>parameterSize</code>) and $C_s, d_s$ are fixed constants.</p>
<h3>Why the sum converges in every $H^s$</h3>
<p>Take logarithms of the first bound:</p>
<p>$$\\log \\|\\mathrm{high}_n\\|_{H^s} \\le x_n\\Big[\\frac{s}{(J+n)^2} + \\frac{s}{(J+n)^{7/2}} - \\frac18\\Big] + O(\\log P_n).$$</p>
<p>The bracket tends to $-\\tfrac18$ while $x_n$ grows faster than any exponential ($x_n = X\\,\\big((J+n-1)!/(J-1)!\\big)^2$), and $\\log P_n$ is only polynomial in $\\log x_n$. So for each fixed $s$ the terms are eventually below $e^{-x_n/16}$: summable. The Lean proves this majorant summable, polynomial factor included (<code>initial_increment_majorants_summable</code>), and concludes <code>actual_increment_summable</code>. The chart shows the turning point: the bracket is negative once $(J+n)^2$ exceeds roughly $8s$. Before that the bound may exceed $1$: a “finite exceptional prefix”, kept inside stage one’s velocity (docstring of <code>PacketStageInitialLimit</code>).</p>
<p>Convergence in every $H^s$ gives a $C^\\infty$ limit (<code>initialDatum_Hm</code>); supports stay in the closed ball of radius $2$ (<code>initial_support</code>, <code>initialDatum_support</code>); the limit is divergence-free (<code>initialDatum_divergence</code>).</p>
<h3>Odd symmetry</h3>
<p>Every flow in the induction is odd under $x\\mapsto -x$ (docstring of <code>ParentPacketParity</code>). The origin is therefore a fixed point of each stage’s flow, and the strain there equals the velocity gradient there (<code>strain_origin</code>). All growth is measured at $x=0$.</p>
<details class="more"><summary>What one packet is, in the Lean</summary>
<p>Packets are built on the cylinder $\\R^3\\times(\\R/2\\pi\\Z)$ with an extra angle $\\theta$. The terminal wave is $\\chi_1(y)\\,f_\\delta(\\theta)\\,\\xi$ with profile $f_\\delta(\\theta) = \\arctan\\big(\\sin\\theta/(1+\\delta-\\cos\\theta)\\big)$ (<code>profile</code>: “a narrow positive derivative peak”). The physical field is the restriction to the graph $\\theta = k\\langle m, x\\rangle$ (<code>graphMap</code>): a plane-wave phase with wavenumber $k$ along the unit normal $m$. Only $\\lfloor k^{\\vartheta}\\rfloor$ corrector grades are kept, $\\vartheta = 10^{-6}$ (<code>truncation</code>). The $\\theta$-independent part is the <em>mean</em>, of initial size $O(k^{-2})$.</p></details>
<details class="more"><summary>Indexing and the first stages</summary>
<p>The Lean reindexes the paper’s sequence: “<code>x 0 = x_{J-1}</code> and <code>x (n+1) = (J+n)^2 x n</code>; hence <code>J+n</code> is the stage index in the source” (<code>EulerProof.lean</code>). Stage $0$ is a base datum, the curl of a cut-off potential (<code>BaseEulerDatum</code>); its shear floor is $X^{1000}$ and its frequency floor $X^{D}$. The first packet is activated at time $0$ (the <em>forward</em> step); every later one at a positive time (the <em>joined</em> steps).</p></details>`,
      verify: {
        statements: [
          { title: 'Scale sequences (Lean, verbatim)', html: `<pre>def scaleSequence (J : ℕ) (X : ℝ) : ℕ → ℝ
  | 0 => X
  | n+1 => ((J+n : ℕ) : ℝ)^2*scaleSequence J X n

def shear (J : ℕ) (X : ℝ) (n : ℕ) : ℝ := exp (scaleSequence J X n/((J+n : ℕ) : ℝ)^5)
def frequency (J : ℕ) (X : ℝ) (n : ℕ) : ℝ := exp (scaleSequence J X n/((J+n : ℕ) : ℝ)^2)
def supportScale (J : ℕ) (X : ℝ) (n : ℕ) : ℝ := exp (-scaleSequence J X n/((J+n : ℕ) : ℝ)^(7/2 : ℝ))
def previousShear (J : ℕ) (X : ℝ) : ℕ → ℝ
  | 0 => X^1000
  | n+1 => shear J X n</pre>` },
          { title: 'Size of one increment (Lean, verbatim)', html: `<pre>theorem initial_bounds (x : ℝ) (hσ : A.frame.sigma*x ≤ 2) (k : ℝ)
    (hk : 4 ≤ k) (hfrequency : A.frequencyGuard k) (s : ℕ) :
    derivativeSum s (A.high k) ≤
      (A.parent.ell⁻¹)^s*k^s*(EulerPacketInitialAmplitude.constant*EulerPacketInitialCost.sourceConstant s*
        A.parameterSize^(EulerPacketInitialAmplitude.degree+EulerPacketInitialCost.sourcePower s))*
        Real.exp (-x/8) ∧
    derivativeSum s (A.mean k) ≤
      (A.parent.ell⁻¹)^s/k^2*(EulerPacketInitialCost.sourceConstant s*
        A.parameterSize^EulerPacketInitialCost.sourcePower s)</pre><p>In use, $x = x_n$ (<code>scaleSequence</code>), $k = k_n$ and <code>parent.ell</code> $= \\ell_n$ (stage field <code>scale_eq</code>).</p>` },
          { title: 'Convergence of the data (Lean, verbatim)', html: `<pre>theorem initialDatum_Hm (s : ℕ) :
    Tendsto (fun n => derivativeSum s
      ((fun x => (packets n).state.evolution.velocity (0,x))-initialDatum.field))
      atTop (𝓝 0)</pre><p>For every $s$: the stage-$n$ initial velocities converge to <code>initialDatum</code> in $H^s$.</p>` },
          { title: 'What the charts plot (formula-derived)', html: `<p>Top: $\\log_{10}\\big(\\ell_n^{-s}k_n^{s}e^{-x_n/8}\\big) = \\frac{x_n}{\\ln 10}\\Big[\\frac{s}{(J+n)^2}+\\frac{s}{(J+n)^{7/2}}-\\frac18\\Big]$ for $s = 0,1,2,3,5$. Bottom: $\\log_{10}\\big(\\mathrm{previousShear}_n/2\\big)$ for $n\\ge1$. Constants $C_s$ and the prefactor $P_n^{d_s}$ are omitted; both charts are therefore proportional to $X$.</p>` },
        ],
        paper: [
          { src: 'euler-paper', where: 'Equations (37), (22), (36), (39) — as cited by the Lean docstrings', note: 'The docstrings cite (37) for the scale sequences (PacketSourceScaleChoice.lean:225, PacketSourceScaleSequence.lean:4), (22) for the increment bounds and their summability (PacketInitialSummability.lean:4, EulerProof.lean:19419), (36) for the physical size at target (PacketPhysicalSize.lean:109) and (39) for the “full logarithmic separation” of the scale costs (PacketSourceScaleGuards.lean:238). The paper itself was not consulted; nothing is claimed about its text beyond these citations.' },
        ],
        lean: [
          { decl: 'EulerPacketSourceScaleChoice.scaleSequence', file: 'Euler/PacketSourceScaleChoice.lean', line: 226, note: 'x₀ = X, x₍ₙ₊₁₎ = (J+n)²·xₙ. Docstring: “The sequence in (37), now constructed rather than supplied.”' },
          { decl: 'EulerPacketSourceScaleSequence.shear / frequency / spike / supportScale / previousShear / timeWidth', file: 'Euler/PacketSourceScaleSequence.lean', line: 18, note: 'Lines 18–43. Exponents 5, 2, 3, 7/2 in exp(±xₙ/(J+n)^e); previousShear₀ = X^1000; previousFrequency₀ = X^D.' },
          { decl: 'EulerPacketInductionScales.Scales', file: 'Euler/PacketInductionScales.lean', line: 83, note: 'stage_large : 3 ≤ J (line 88), base_power : 2000 ≤ D (89), x_large : 8 ≤ X (90), δ ≤ 1/16, SmallSeries summability records, time_small : baseHorizon ≤ 1 (110).' },
          { decl: 'EulerPacketInductionScales.exists_scales', file: 'Euler/PacketInductionScales.lean', line: 123, note: 'Picks D, then J, then δ, then X from eventual bounds; the construction fixes them with Classical.choice (constructionScales, PacketInfiniteConstruction.lean:68).' },
          { decl: 'EulerPacketInitial.Input.initial_bounds', file: 'Euler/PacketInitialInput.lean', line: 91, note: 'The Hˢ bounds on the high and mean parts of one increment.' },
          { decl: 'EulerPacketInitial.Input.initial_support', file: 'Euler/PacketInitialInput.lean', line: 107, note: 'tsupport (A.high k) ⊆ closedBall 0 2 ∧ tsupport (A.mean k) ⊆ closedBall 0 2.' },
          { decl: 'EulerPacketInduction.stages_initial_step', file: 'Euler/PacketInfiniteConstruction.lean', line: 52, note: 'velocity(stage n+1)(0,·) = velocity(stage n)(0,·) + high (frequency n) + mean (frequency n).' },
          { decl: 'EulerPacketInduction.initialDatum / initialDatum_Hm', file: 'Euler/PacketFiniteLifespan.lean', line: 18, note: 'The limiting datum (line 18) and its convergence in every Hˢ (line 20).' },
          { decl: 'EulerPacketInitial.actual_increment_summable', file: 'Euler/PacketInitialSmoothLimit.lean', line: 48, note: 'Module docstring: “The actual packet initial increments converge in every finite Sobolev norm to a single smooth field with the same compact support.”' },
          { decl: 'EulerScale.initial_increment_majorants_summable', file: 'Euler/EulerProof.lean', line: 19422, note: 'Summability of exp(−b·xₙ + m·xₙ/(J+n)² + m·xₙ/(J+n)^(7/2) + C·log(aggregate)) for every b > 0: the polynomial prefactor is included.' },
          { decl: 'EulerPacketInduction.initialDatum_support / initialDatum_compact', file: 'Euler/EulerFiniteLifespan.lean', line: 17, note: 'Support inside closedBall 0 2 (line 17); compact support (line 21).' },
          { decl: 'EulerPacketInduction.initialDatum_divergence', file: 'Euler/PacketFiniteLifespan.lean', line: 42, note: 'Divergence-free, from membership in the solenoidal space.' },
          { decl: 'EulerGraphInvariantFlow (module docstring on oddness)', file: 'Euler/ParentPacketParity.lean', line: 6, note: '“Oddness of the actual displacement propagates … fixes the origin … The genuine child flow preserves it.”' },
          { decl: 'strain_origin', file: 'Euler/ParentEulerParity.lean', line: 38, note: 'A.strain.field t 0 = fderiv ℝ (fun y => E.velocity (t,y)) 0: at the origin the strain is the velocity gradient.' },
          { decl: 'EulerProof.lean (module docstring of the EulerScale section: reindexing note)', file: 'Euler/EulerProof.lean', line: 18954, module: true, note: '“x 0 = x_{J-1} and x (n+1) = (J+n)^2 x n; hence J+n is the stage index in the source.”' },
          { decl: 'EulerPeriodicProfile.profile / graphMap / truncation', file: 'Euler/EulerProof.lean', line: 11758, note: 'profile δ t = arctan (sin t / (1 + δ − cos t)) (line 11758); graphMap k m v = (v, k⟨m,v⟩) (line 12439); truncation k = ⌊k^ϑ⌋, ϑ = 10⁻⁶ (PacketSourceFrequency.lean:13–15).' },
        ],
        context: [
          { src: 'icmat', note: 'Connects the Euler construction to the ICMAT programme of Diego Córdoba and Luis Martínez-Zoroa on singularities for incompressible fluid equations; press reports repeat the connection. The Lean sources do not mention this lineage: a search of the pinned clone for those names finds nothing.' },
          { src: 'lean-readme', note: 'The repository’s one-paragraph description of the Euler result: smooth, compactly supported, divergence-free data whose solution “develops a singularity in finite time”.' },
        ],
        limits: [
          'The waveforms are drawings. Only the printed numbers and the charts are computed, and they use the Lean bound with its constants and the prefactor $P_n^{d_s}$ dropped; the Lean proves summability with that prefactor included.',
          'The charts show an upper bound on each increment, not its actual size.',
          '$X$ is shown from its floor $8$ upwards; the other conditions in <code>Scales</code> force $X$ far larger, and the actual $J, D, X, \\delta$ are produced by <code>Classical.choice</code>. None of the displayed stages corresponds to a known numerical value.',
          'Paper equation numbers are quoted from Lean docstrings only; the paper was not read for this guide.',
          'The boundary “not Navier–Stokes with $\\nu = 0$” rests on the structure of the repository: <code>Euler/</code> imports nothing from <code>NavierStokes/</code> and builds its own packet induction. Neither paper was consulted on this point.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'strain-amplifies-the-next-layer',
      title: 'Strain amplifies the next layer',
      question: 'Why does each layer get amplified by the ones before it?',
      visual: { scene: 'strain-amplification', label: 'numerically-computed', caption: 'Left: a layer in a compressive shear (schematic). Right: the Lean’s scalar amplification equation (30), integrated in the browser', params: { beta: 0.02, v1: 0 } },
      status: {
        changes: 'A layer aligned with the ray $m$ is compressed when $\\langle B\\hat m,\\hat m\\rangle \\lt 0$; equation (30) then gains at least $e^{1/(4\\sqrt\\beta)}$.',
        bounded: 'The bounded part of the strain, $\\|B\\|\\le G$, plus the remainder error: together at most $\\tfrac12\\,\\mathrm{previousShear}_n$.',
        fails: 'Nothing is broken yet; but a gradient of size $\\mathrm{previousShear}_n/2$ at the origin at each activation will force the breakdown.',
      },
      understand: `
<p>Picture the flow the earlier layers create. Near the origin it is a linear flow, a <em>strain</em>. The Lean records it at every stage as a bounded part $B$ plus a dominant rank-one shear of strength $\\mathrm{previousShear}_n$ along two perpendicular directions: the velocity $v$ and the ray $m$.</p>
<p>A strain that compresses along $m$ squeezes every wave whose crests are perpendicular to $m$: the crests move closer together, the wavenumber grows, and so does the velocity gradient. Large-scale strain amplifying small-scale structure is vortex stretching at its simplest. The construction makes the next layer a plane wave with normal along the current ray, switched on while the compression condition $\\langle B\\hat m,\\hat m\\rangle \\lt 0$ holds.</p>
<p>Its growth is then governed by one scalar ODE, the Lean’s “equation (30)”, which multiplies the amplitude by at least $e^{1/(4\\sqrt\\beta)}$ by the rescaled time $1/\\sqrt\\beta$, with $\\beta\\approx 1/x_n^2$ tiny. The layer does not amplify itself: a transverse plane wave does not advect itself, so the growth comes from the earlier layers’ strain.</p>`,
      stage: {
        need: 'A mechanism by which the layers already present make the next layer’s gradient grow by a huge, controlled factor.',
        whyNot: 'Layers at separated scales barely interact linearly; by itself a smooth layer just transports. Growth needs the nonlinear term: strain acting on finer structure.',
        ingredient: 'The frame: at the origin the strain is a rank-one shear $\\mathrm{previousShear}_n\\,(\\hat v\\otimes\\hat m)$ plus a compressive bounded part; the next normal is the ray $m$.',
        remaining: 'That the invariants (shear, tilt, compression, small errors) propagate to the next stage with summable losses, and that the horizons nest.',
      },
      inspect: `
<p>The frame carried by each stage is the record <code>ParentFrame</code> (<code>PacketSourceGeometryData.lean</code>; the stage record is [[src:lean-euler-stage]]). Its fields, in words: a matrix path $B(t)$ with $\\|B\\|\\le G$; a ray $m(t)$ and a velocity $v(t)$ with</p>
<p>$$m' = -B^{*}m,\\qquad v' = -Bv + \\frac{2\\langle m, Bv\\rangle}{|m|^2}\\,m,\\qquad \\langle m, v\\rangle = 0;$$</p>
<p>and the <strong>remainder bound</strong>: at the packet centre the parent strain $M$ satisfies $\\|M - B - \\sigma\\,\\mathrm{rankOne}(\\hat v)(\\hat m)\\| \\le \\mathrm{error}$, with $\\sigma = \\mathrm{primaryShear} = c\\,|m|\\,|v|$. Since $\\mathrm{rankOne}(\\hat v)(\\hat m)\\,z = \\langle \\hat m, z\\rangle\\,\\hat v$, this says $Mz \\approx Bz + \\sigma\\langle\\hat m,z\\rangle\\hat v$: layers perpendicular to $\\hat m$ slide along $\\hat v$. A shear.</p>
<p>The stage invariant pins the numbers: <code>frame_shear : frame.shear = previousShear n</code>, <code>frame_bound : G ≤ frameConstant·(1 + olderShear n)</code>, <code>frame_error ≤ priorError n</code>, the tilt $\\tfrac12 \\le \\sigma_{\\mathrm{tilt}}^2 x_n^2 \\le 2$, and for $n\\ne0$ the <strong>compression</strong> $\\langle B(t_n)\\hat m,\\hat m\\rangle + \\mathrm{priorError}_n \\lt 0$.</p>
<h3>Why the gradient at activation is at least $\\mathrm{previousShear}_n/2$</h3>
<p>$\\|M\\| \\ge \\|\\sigma\\,\\mathrm{rankOne}(\\hat v)(\\hat m)\\| - \\|B\\| - \\mathrm{error} \\ge \\mathrm{previousShear}_n - G - \\mathrm{error}$, and <code>activation_small</code> gives $G + \\mathrm{error} \\le \\mathrm{activationMargin}\\cdot\\mathrm{previousShear}_n$ with $\\mathrm{activationMargin}\\le\\tfrac12$. By oddness, $M = \\nabla u(t_n, 0)$ (<code>strain_origin</code>). That is <code>gradient_lower</code>. Then <code>shear_separation</code>, $\\mathrm{previousShear}_n^2 \\le \\mathrm{shear}_n/4$, together with $\\mathrm{previousShear}_n \\ge n+1$, gives <code>gradient_atTop</code>: the activation gradients tend to infinity.</p>
<h3>Why the ray lengthens</h3>
<p>From $m' = -B^*m$, $\\tfrac{d}{dt}|m|^2 = -2\\langle Bm, m\\rangle$, so the compression invariant says $|m|$ grows. (This one-line consequence is ours, not a named Lean lemma.) The gradient of a phase transported by the linear flow $B$ obeys exactly $k' = -B^{*}k$: the ray is the wave vector of the layer, and its growth is the shortening of the wavelength drawn on the left.</p>
<h3>Equation (30)</h3>
<p>$$\\frac{d}{dt}\\Big[\\big(1+(\\beta t^2)^2\\big)V'\\Big] = 2\\big(1-\\beta\\cdot\\beta t^2\\big)V,\\qquad V(0)=1,\\ V'(0)\\ge 0,\\ 0\\lt\\beta\\le\\tfrac1{16}\\ \\Longrightarrow\\ V\\big(1/\\sqrt\\beta\\big) \\ge e^{1/(4\\sqrt\\beta)}.$$</p>
<p>The Lean derives the equation from a two-component system (<code>scalar_equation</code>), proves global existence (<code>equation30_exists_global</code>), the endpoint gain (<code>equation30_endpoint_exponential</code>) and, after the endpoint, $V(x/\\sqrt\\beta)\\ge V(1/\\sqrt\\beta)/x$ (<code>equation30_post_inversion_lower</code>). In the stage it is applied with $\\sigma^2 = \\beta$ and a target time $T\\ge1/\\sigma$: $e^{1/(4\\sigma)} \\le \\Theta\\,Z(T)$ (<code>equation30_target_exp_le</code>). A docstring calls this “the finite-ODE amplification mechanism underlying equation (36)”. The scene integrates the ODE numerically; the Lean does not integrate anything, it proves the inequality.</p>
<details class="more"><summary>Self-interaction and the mean part</summary>
<p>A plane wave $u = a\\cos(k\\langle m,x\\rangle)$ with $a\\perp m$ has $(u\\cdot\\nabla)u = 0$: it does not advect itself. In the Lean the frame keeps $\\langle m, v\\rangle = 0$ (<code>tangent</code>), and what the packet produces at zero angular frequency is collected in the <em>mean</em> part, of initial size $O(k^{-2})$ (docstring of <code>PacketInitialPhysical</code>). Interactions between neighbouring Lagrangian labels are handled by the <code>Neighbor</code> family of files with losses summable in the stage index.</p></details>
<details class="more"><summary>How the next normal is read off</summary>
<p><code>joinedNormal := restrictedFrame.activationNormal …</code> (<code>PacketStageGeometry.lean</code>): the next packet’s unit normal is computed from the current frame at the activation time, and <code>joinedFrame</code> is the renewed frame. Docstring of <code>PacketPhysicalFrameRenewal</code>: “The source’s next-frame scalar formulas represent the actual normalized physical ray and velocity.” Docstring of <code>PacketPhysicalStage</code>: “the actual parent rank-one decomposition, and physical coefficient bounds imply relative amplification for the scaled primary.”</p></details>`,
      verify: {
        statements: [
          { title: 'The frame’s remainder bound (Lean, verbatim)', html: `<pre>structure ParentFrame (D : Data U) (τ : ℝ) where
  B : ℝ → Space →L[ℝ] Space
  …
  ray_equation : ∀ t ∈ Icc τ D.T,
    HasDerivWithinAt m (-(B t).adjoint (m t)) (Icc τ D.T) t
  …
  tangent : ∀ t ∈ Icc τ D.T, ⟪m t,v t⟫_ℝ=0
  B_bound : ∀ t ∈ Icc τ D.T, ‖B t‖ ≤ G
  …
  remainder_bound : ∀ t ∈ Icc τ D.T,
    ‖D.M.field (D.clamp t) 0-B t-
      primaryShear c m v t • rankOne ℝ (unit (v t)) (unit (m t))‖ ≤ error</pre><p>Docstring: “It contains no new ray, new velocity or amplification assertion.”</p>` },
          { title: 'Activation gradient (Lean, verbatim)', html: `<pre>def activationGradient : ℝ :=
  ‖fderiv ℝ (fun x => P.state.evolution.velocity (P.time,x)) 0‖

theorem gradient_lower (hn : n ≠ 0) : previousShear S.J S.X n/2 ≤ P.activationGradient

theorem gradient_atTop (P : ∀ n, Stage S n) :
    Tendsto (fun n => (P n).activationGradient) atTop atTop</pre>` },
          { title: 'Equation (30) endpoint gain (Lean, verbatim)', html: `<pre>theorem equation30_endpoint_exponential
    {β : ℝ} {V V₁ : ℝ → ℝ}
    (hβ : 0 &lt; β) (hβsmall : β ≤ 1 / 16)
    (hV : ∀ t ∈ Icc 0 (1 / √β), HasDerivAt V (V₁ t) t)
    (hflux : ∀ t ∈ Icc 0 (1 / √β),
      HasDerivAt (fun s => (1 + (β * s ^ 2) ^ 2) * V₁ s)
        (2 * (1 - β * (β * t ^ 2)) * V t) t)
    (hV0 : V 0 = 1) (hV₁0 : 0 ≤ V₁ 0) :
    exp (1 / (4 * √β)) ≤ V (1 / √β)</pre><p>Docstring: “At <code>T = 1 / sqrt β</code>, equation (30) amplifies by at least <code>exp (1 / (4 sqrt β))</code>, uniformly over every nonnegative initial derivative.”</p>` },
          { title: 'What the scene computes', html: `<p>Right panel: the system $V' = W/(1+(\\beta t^2)^2)$, $W' = 2(1-\\beta^2t^2)V$, $V(0)=1$, $W(0)=V'(0)$, integrated by RK4 with 1600 steps on $[0, 1/\\sqrt\\beta]$ (or $[0,3/\\sqrt\\beta]$), compared with $e^{1/(4\\sqrt\\beta)}$ and with $V(1/\\sqrt\\beta)\\cdot\\frac{1/\\sqrt\\beta}{t}$. Left panel: the linear flow $x\\mapsto Mx$ with $M\\hat m = -b\\hat m$, $M\\hat v = b\\hat v + \\sigma\\hat v\\langle\\hat m,\\cdot\\rangle$, $b = 0.35$, $\\sigma = 1$: display constants with no counterpart in the proof.</p>` },
        ],
        paper: [
          { src: 'euler-paper', where: 'Equations (30), (31), (36), (23), (24), (34) — as cited by the Lean docstrings', note: '(30) is the scalar amplification ODE (EulerProof.lean:13042, 13365, 18389; PacketTargetAmplification.lean); (31) a uniform O(√β) Riccati estimate for it (EulerProof.lean:13741); (36) the physical size at target (PacketPhysicalSize.lean:109, EulerProof.lean:18565); (23) frame coefficients and “the logarithmic shear law” (PacketFrameCoefficients.lean:5,124); (24) “the two frame invariants” (EulerProof.lean:19488); (34) the next normalized frame (PacketPhysicalFrameRenewal.lean:80). The paper itself was not consulted.' },
        ],
        lean: [
          { decl: 'EulerPacketSourceGeometry.ParentFrame', file: 'Euler/PacketSourceGeometryData.lean', line: 25, note: 'ray_equation (34), velocity_equation (36), tangent (42), B_bound (43), remainder_bound (45–47).' },
          { decl: 'EulerPacketMovingFrame.primaryShear', file: 'Euler/PacketFrameCoefficients.lean', line: 122, note: 'primaryShear c m v t = c·(‖m t‖·‖v t‖).' },
          { decl: 'EulerPacketInduction.Stage (frame invariants)', file: 'Euler/PacketInductionStage.lean', line: 48, note: 'frame_shear (48), frame_bound (49), frame_error (50), coupling_error (51), tilt_lower/upper (52–53), compression (54–55).' },
          { decl: 'EulerPacketInduction.Stage.activationGradient / gradient_lower / gradient_atTop', file: 'Euler/PacketStageGrowth.lean', line: 49, note: 'Definition (49), lower bound previousShear/2 (52), divergence with n (83). Module docstring: “This uses the invariant’s true frame decomposition.”' },
          { decl: 'EulerPacketInductionScales.Scales.activation_small / shear_separation', file: 'Euler/PacketInductionScaleBounds.lean', line: 101, note: 'frameConstant·(1+olderShear) + priorError ≤ activationMargin·previousShear (101); previousShear² ≤ shear/4 (61).' },
          { decl: 'EulerPacketInductionScales.activationMargin_le_half / Scales.previousShear_ge_index', file: 'Euler/PacketStageGrowth.lean', line: 12, note: 'activationMargin ≤ 1/2 (12); n + 1 ≤ previousShear n (25).' },
          { decl: 'EulerPacketGrowth.scalar_equation', file: 'Euler/EulerProof.lean', line: 13043, note: 'Docstring: “Equation (30), derived from the ideal two-component ODE with its actual coefficients.”' },
          { decl: 'EulerPacketGrowth.equation30_endpoint_exponential', file: 'Euler/EulerProof.lean', line: 13367, note: 'The endpoint gain exp(1/(4√β)) ≤ V(1/√β); docstring at 13365–13366.' },
          { decl: 'EulerPacketGrowth.equation30_post_inversion_lower', file: 'Euler/EulerProof.lean', line: 14136, note: 'V(1/ε)/x ≤ V(x/ε) for x ≥ 1: after the endpoint the solution decays at most like 1/x.' },
          { decl: 'EulerPacketGrowth.equation30_exists_global', file: 'Euler/EulerProof.lean', line: 18390, note: 'Global existence for arbitrary real initial data; first-order form with scalarCoefficientA/B (18313–18317).' },
          { decl: 'EulerPacketMovingFrame.equation30_target_exp_le', file: 'Euler/PacketTargetAmplification.lean', line: 15, note: 'exp(1/(4σ)) ≤ Θ·Z T for σ ≤ 1/4 and 1/σ ≤ T ≤ Θ.' },
          { decl: 'EulerPacketGrowth.early_forward_exponential_suppression', file: 'Euler/EulerProof.lean', line: 18566, note: 'Docstring: “This is the finite-ODE amplification mechanism underlying equation (36).”' },
          { decl: 'EulerPacketInduction.Stage.joinedNormal / joinedFrame', file: 'Euler/PacketStageGeometry.lean', line: 102, note: 'The next normal (102) and frame (111), built from the current frame at the activation time.' },
          { decl: 'strain_origin', file: 'Euler/ParentEulerParity.lean', line: 38, note: 'Used in gradient_lower to identify the frame strain with the velocity gradient at the origin.' },
          { decl: 'EulerPacketInitial (module docstring on the mean part)', file: 'Euler/PacketInitialPhysical.lean', line: 4, note: '“The high initial increment retains its small amplitude, while the mean initial increment is O(k⁻²) without any oscillatory-graph loss.”' },
        ],
        context: [
          { src: 'lean-euler-ode30', note: 'The ODE section of EulerProof.lean opens with: “Order estimates for the scalar ODE occurring in equation (30) of the proposed Euler packet argument. These are finite-dimensional ODE results only.”' },
        ],
        limits: [
          'The left panel is a schematic. Its compression rate $b$ and shear $\\sigma$ are display choices; the relation between the toy and the $\\beta$ of equation (30) is not computed and not claimed.',
          'The right panel is a numerical integration of a two-dimensional linear ODE: reliable as arithmetic, but a model display. The proof uses only the inequality.',
          'How the amplification of the scalar $V$ becomes the stage invariant <code>frame_shear = previousShear n</code> involves many more estimates (frame renewal, neighbour labels, correction terms) that this scene does not show.',
          'The statement “a transverse plane wave does not advect itself” is classical, not a Lean lemma; the Lean bookkeeping of the packet’s own quadratic terms lives in the mean part and the correction.',
          'Paper equation numbers are quoted from Lean docstrings only.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'nested-horizons',
      title: 'Nested horizons pin down the singular time',
      question: 'How is the singular time pinned down?',
      visual: { scene: 'nested-horizons', label: 'formula-derived', caption: 'Activation times accumulate inside a shrinking nest of horizons below baseHorizon = 6J²X⁻⁴⁹⁸', params: { J: 3, log10X: 7.5, q: 1 } },
      status: {
        changes: 'Each activation time is $t_{n+1} = t_n + x_{n+1}/\\sqrt{\\beta_n a_n\\,\\mathrm{previousShear}_n}$; the steps shrink faster than geometrically.',
        bounded: 'All horizons: $t_n + 2\\,\\mathrm{timeWidth}_n \\le \\mathrm{baseHorizon} = 6J^2X^{-498} \\le 1$. Every stage lives inside the first interval.',
        fails: 'A smooth solution up to $\\mathrm{baseHorizon}$: $H^3$ stability would bound the activation gradients, which diverge.',
      },
      understand: `
<p>Every stage $n$ of the construction is a genuine smooth Euler solution on its own interval $[0,T_n]$, with $T_n = t_n + 2\\,\\mathrm{timeWidth}_n$, where $t_n$ is the time at which layer $n$ is switched on. The steps $t_{n+1}-t_n$ shrink so fast that each horizon fits inside the previous one. All activation times therefore stay below one number, $\\mathrm{baseHorizon} = 6J^2X^{-498}$, which is at most $1$.</p>
<p>Now suppose the limiting data had a smooth solution all the way to $\\mathrm{baseHorizon}$. The stage-$n$ data converge to the limiting data in $H^3$, and $H^3$ stability of Euler would keep the stage-$n$ solutions close to the hypothetical one, including their velocity gradients at the origin at time $t_n$. But those gradients are at least $\\mathrm{previousShear}_n/2 \\to \\infty$. Contradiction: the maximal lifespan $T^*$ is at most $\\mathrm{baseHorizon}$.</p>
<p>What $T^*$ is numerically, nobody knows. $J$ and $X$ come from an existence proof, and $T^*$ is defined as a supremum.</p>`,
      stage: {
        need: 'A single finite time by which every stage’s growth has already happened, so that one hypothetical solution can be compared with all stages.',
        whyNot: 'Each stage is a solution on its own horizon; without nesting, the activation times could march off to infinity and prove nothing.',
        ingredient: 'Steps $t_{n+1}-t_n = \\mathrm{timeWidth}_n/(3\\sqrt{q_n})$ with widths at least halving, so all horizons sit inside $[0,\\mathrm{baseHorizon}]$, $\\mathrm{baseHorizon}\\le 1$.',
        remaining: 'That the maximal solution really breaks down at $T^*$ in the Beale–Kato–Majda sense, not merely in the Sobolev class: the last scene.',
      },
      inspect: `
<p>Definitions ([[src:lean-euler-horizons]]), with $a_n, \\beta_n$ the frame’s coupling and tilt numbers:</p>
<p>$$\\mathrm{step}_n = \\frac{x_{n+1}}{\\sqrt{\\beta_n a_n\\,\\mathrm{previousShear}_n}},\\qquad t_n = \\sum_{i\\lt n}\\mathrm{step}_i,\\qquad T_n = t_n + 2\\,\\mathrm{timeWidth}_n,\\qquad \\mathrm{timeWidth}_n = \\frac{3x_{n+1}x_n}{\\sqrt{\\mathrm{previousShear}_n}}.$$</p>
<p>The Lean hypothesises $\\tfrac12\\le a_n\\le 2$ and $\\tfrac12\\le\\beta_n x_n^2\\le 2$; in a stage, $a_n$ is <code>frame.a</code> and $\\beta_n$ is <code>frame.sigma²</code> (<code>Stage.step</code>), guaranteed by <code>coupling_bounds</code> and <code>tilt_lower/upper</code>. Writing $q_n = a_n\\beta_n x_n^2$, $\\mathrm{step}_n = \\mathrm{timeWidth}_n/(3\\sqrt{q_n})$, hence $\\mathrm{timeWidth}_n/6 \\le \\mathrm{step}_n \\le 2\\,\\mathrm{timeWidth}_n/3$ (<code>stepLength_bounds</code>). With the width-halving guard <code>next_width : timeWidth (n+1) ≤ timeWidth n / 2</code>, the horizons nest (<code>horizonTime_antitone</code>) below $\\mathrm{horizonTime}\\,0 = 2\\,\\mathrm{timeWidth}_0 = \\mathrm{baseHorizon}$ (<code>baseHorizon_eq_timeWidth</code>), and $t_n \\ge \\mathrm{baseHorizon}/12$ for $n\\ge1$ (<code>activationTime_lower</code>; the stage field <code>time_lower</code>).</p>
<h3>Why $X$ must be enormous</h3>
<p>For $n=0$ the halving condition reads, from the formulas, $\\ln\\frac{x_2}{x_0} + 500\\ln X + \\ln 2 \\le \\frac{X}{2J^5}$, because $\\mathrm{previousShear}_0 = X^{1000}$ while $\\mathrm{previousShear}_1 = e^{X/J^5}$. For $J=3$ this needs $X \\gtrsim 3.6\\times10^6$. That is arithmetic on the Lean definitions, not a Lean statement; the Lean records only the floor <code>x_large : 8 ≤ X</code> and obtains the actual $D$, $J$, $\\delta$, $X$ in turn from eventual bounds (<code>exists_scales</code>), then fixes them by <code>Classical.choice</code> (<code>constructionScales</code>). The base horizon $6J^2X^{-498}$ is then unimaginably small, and the scene prints it as a power of ten.</p>
<h3>The contradiction</h3>
<p><code>false_of_evolution</code>: let $U$ solve Euler on $[0,\\mathrm{baseHorizon}]$ with $U(0)=u_0$, and let $V_n$ be the stage-$n$ solution on $[0,T_n]$, $T_n\\le\\mathrm{baseHorizon}$. Restrict $U$ to $[0,T_n]$. The $H^3$ norm of $V_n(0)-u_0$ tends to $0$ (<code>initialDatum_Hm</code> with $s=3$). The varying-horizon stability theorem <code>no_gradient_escape_of_initial_tendsto_varying</code> then forbids $\\|\\nabla V_n(t_n)(0)\\|\\to\\infty$. But that quantity is <code>activationGradient</code>, which does tend to infinity (<code>gradient_atTop</code>). Hence <code>initialDatum_no_base</code>.</p>
<p>From a local solution (<code>initialDatum_local</code>) and this failure, <code>exists_finite_lifespan</code> builds the record <code>FiniteLifespan</code> with $T^* = \\sup\\{T : \\text{a smooth solution exists on }[0,T]\\}\\le\\mathrm{baseHorizon}\\le 1$. The endpoint itself is excluded afterwards: any solution on a closed interval extends a little (<code>exists_extension</code>: local existence from the endpoint state, then concatenation), so a solution on $[0,T^*]$ would contradict maximality (<code>no_endpoint</code>).</p>
<details class="more"><summary>The record, verbatim</summary><pre>structure FiniteLifespan (A : SmoothL2Field Space) where
  duration : ℝ
  duration_pos : 0 &lt; duration
  shorter : ∀ S, 0 &lt; S → S &lt; duration → HasEulerEvolution A S
  maximal : ∀ S, duration &lt; S → ¬ HasEulerEvolution A S</pre><p>Module docstring: “Existence below the supremum and failure above it follow from restriction; membership of the endpoint is deliberately left to a continuation theorem.”</p></details>
<details class="more"><summary>Stage horizons, verbatim</summary><pre>time_lower : n ≠ 0 → baseHorizon S.J S.X/12 ≤ time
horizon_eq : parent.T=time+2*timeWidth S.J S.X n
horizon_le : parent.T ≤ baseHorizon S.J S.X
…
def step : ℝ := stepLength S.J S.X (fun _ => P.frame.a) (fun _ => P.frame.sigma^2) n
def nextTime : ℝ := P.time+P.step
def nextHorizon : ℝ := P.nextTime+2*timeWidth S.J S.X (n+1)
theorem nextHorizon_lt : P.nextHorizon &lt; P.parent.T</pre></details>`,
      verify: {
        statements: [
          { title: 'Activation times and horizons (Lean, verbatim)', html: `<pre>def stepLength (J : ℕ) (X : ℝ) (a β : ℕ → ℝ) (n : ℕ) : ℝ :=
  scaleSequence J X (n+1)/sqrt (β n*a n*previousShear J X n)

def activationTime (J : ℕ) (X : ℝ) (a β : ℕ → ℝ) (n : ℕ) : ℝ :=
  ∑ i ∈ range n, stepLength J X a β i

def horizonTime (J : ℕ) (X : ℝ) (a β : ℕ → ℝ) (n : ℕ) : ℝ :=
  activationTime J X a β n+2*timeWidth J X n

def timeWidth (J : ℕ) (X : ℝ) (n : ℕ) : ℝ :=
  3*scaleSequence J X (n+1)*scaleSequence J X n/sqrt (previousShear J X n)

def baseHorizon (J : ℕ) (X : ℝ) : ℝ := 6*(J : ℝ)^2*X^(-498 : ℝ)</pre><p>Hypotheses used for the nesting lemmas: <code>∀ n, 1/2 ≤ a n</code>, <code>a n ≤ 2</code>, <code>1/2 ≤ β n*scaleSequence J X n^2</code>, <code>… ≤ 2</code>.</p>` },
          { title: 'No solution on the base horizon (Lean, verbatim)', html: `<pre>theorem no_euler_evolution_of_initial_H3 :
    ¬ ∃ U : Evolution (baseHorizon S.J S.X) (baseHorizon_pos S.J S.j_one S.x_pos).le,
      (U.velocity ⟨0,le_rfl,(baseHorizon_pos S.J S.j_one S.x_pos).le⟩).field=u₀

theorem initialDatum_finite_lifespan :
    ∃ L : FiniteLifespan initialDatum,
      L.duration ≤ baseHorizon constructionScales.J constructionScales.X

theorem lifespan_le_one : lifespan.duration ≤ 1</pre>` },
          { title: 'What the scene computes (formula-derived)', html: `<p>With one placeholder $q\\in[\\tfrac14,4]$ for every $q_n = a_n\\beta_n x_n^2$: $\\mathrm{step}_n = \\mathrm{timeWidth}_n/(3\\sqrt q)$, $t_n = \\sum_{i\\lt n}\\mathrm{step}_i$, $T_n = t_n + 2\\,\\mathrm{timeWidth}_n$, all divided by $\\mathrm{baseHorizon}$; the ratio $\\mathrm{timeWidth}_{n+1}/\\mathrm{timeWidth}_n$ is checked against $\\tfrac12$; spike labels are $\\log_{10}(\\mathrm{previousShear}_n/2)$. Everything is evaluated on logarithms.</p>` },
        ],
        paper: [
          { src: 'euler-paper', where: 'Equations (38) and (37) — as cited by the Lean docstrings', note: 'PacketNestedHorizons.lean:4: “The literal activation times and nested horizons in (38).” EulerProof.lean:19487: “The activation-time interval in (38) follows from the two frame invariants in (24), with the numerical constants stated in the source.” The paper itself was not consulted.' },
        ],
        lean: [
          { decl: 'EulerPacketNestedHorizons.stepLength / activationTime / horizonTime', file: 'Euler/PacketNestedHorizons.lean', line: 15, note: 'Definitions at 15, 18, 21; hypotheses on a, β at 35–38; stepLength_bounds (41); horizonTime_antitone (90), horizonTime_le_base (96), activationTime_lower (102).' },
          { decl: 'EulerPacketInduction.Stage.step / nextTime / nextHorizon', file: 'Euler/PacketStageRestriction.lean', line: 18, note: 'a_n := frame.a, β_n := frame.sigma² (18–19); nextTime (21); nextHorizon (23); nextHorizon_lt (47); nextHorizon_one (60).' },
          { decl: 'StageGuards.next_width', file: 'Euler/PacketSourceScaleGuards.lean', line: 129, note: 'timeWidth J X (n+1) ≤ timeWidth J X n/2 — the halving that makes the horizons nest.' },
          { decl: 'EulerPacketBaseGuardScales.baseHorizon / baseHorizon_eq_timeWidth', file: 'Euler/PacketBaseGuardScales.lean', line: 14, note: 'baseHorizon = 6J²X⁻⁴⁹⁸ (14), baseRadius = X⁻¹⁰⁰⁰ (16), baseHorizon = 2·timeWidth 0 (30).' },
          { decl: 'EulerPacketInduction.Stage (time fields)', file: 'Euler/PacketInductionStage.lean', line: 30, note: 'time_lower (30), horizon_eq (31), horizon_le (32); coupling_bounds and tilt bounds give the a, β hypotheses.' },
          { decl: 'EulerPacketInduction.Stage.false_of_evolution / no_euler_evolution_of_initial_H3', file: 'Euler/PacketStageContradiction.lean', line: 25, note: 'The contradiction (25) and its packaged form (67). Module docstring: “Each stage is compared only on its own genuine horizon.”' },
          { decl: 'EulerOrdinarySobolev.Evolution.no_gradient_escape_of_initial_tendsto_varying', file: 'Euler/OrdinaryEulerVaryingHorizon.lean', line: 96, note: 'H³ stability on varying horizons: H³-convergent initial data forbid a divergent gradient at the origin.' },
          { decl: 'EulerPacketInduction.initialDatum_local / initialDatum_no_base / lifespan', file: 'Euler/PacketFiniteLifespan.lean', line: 27, note: 'Local existence (27), failure on the base horizon (31), the FiniteLifespan (46, 54) and lifespan_le_base (56).' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan / exists_finite_lifespan', file: 'Euler/OrdinaryEulerLifespan.lean', line: 29, note: 'The record (29) and its construction as sSup {T | HasEulerEvolution A T} (35).' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan.no_endpoint / Evolution.exists_extension', file: 'Euler/OrdinaryEulerContinuation.lean', line: 53, note: 'The endpoint is excluded (53) because every closed evolution extends (20).' },
          { decl: 'EulerPacketInduction.lifespan_le_one', file: 'Euler/EulerFiniteLifespan.lean', line: 24, note: 'T* ≤ baseHorizon ≤ 1.' },
          { decl: 'EulerPacketInductionScales.Scales.x_large / exists_scales; constructionScales', file: 'Euler/PacketInductionScales.lean', line: 90, note: '8 ≤ X is only a floor (90); exists_scales (123); constructionScales := Classical.choice … (PacketInfiniteConstruction.lean:68).' },
        ],
        limits: [
          'The frame numbers $a_n$, $\\beta_n$ are not numeric in the Lean; the scene replaces all of them by one slider value inside the hypothesised range. Real activation times are not known.',
          '$J$ and $X$ are chosen by existence; the slider ranges are illustrative. The condition “$X \\gtrsim 3.6\\times10^6$ for $J = 3$” is derived here from the Lean formulas and is not a Lean statement.',
          'Times are drawn relative to $\\mathrm{baseHorizon}$, which is itself of order $10^{-3000}$ or smaller for the displayed $X$; the absolute $T^*$ is unknown beyond $0 \\lt T^* \\le \\mathrm{baseHorizon} \\le 1$.',
          'Spike heights are compressed for display; only their labels are the formula values.',
          'The $H^3$ stability theorem and the local-existence theory are used here as black boxes; their statements are cited, their proofs are not shown.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'why-this-is-a-real-singularity',
      title: 'Why this is a genuine singularity',
      question: 'Why is this a genuine singularity and not an artifact of the solution class?',
      visual: { scene: 'bkm-integral', label: 'formula-derived', caption: 'A model vorticity blowup (T*−t)^−γ and its time integral: the Beale–Kato–Majda dividing line', params: { gamma: 1 } },
      status: {
        changes: 'As $t \\to T^*$ the gradient supremum exceeds every bound infinitely often; the vorticity integral $\\int_0^{T^*}\\norm{\\omega}_{\\Linf}$ is $+\\infty$.',
        bounded: 'Kinetic energy, exactly conserved: $\\norm{v(t)}_{L^2}^2 = \\norm{u_0}_{L^2}^2$ for $t \\lt T^*$; and every norm on every $[0,T]$ with $T \\lt T^*$.',
        fails: 'Continuation. A finite gradient integral would extend the solution to the closed interval; the extension would contradict maximality.',
      },
      understand: `
<p>Could the solution be continued past $T^*$ by someone cleverer, or in a slightly different class? The Beale–Kato–Majda criterion (1984) says: a smooth Euler solution on $[0,T)$ extends past $T$ unless $\\int_0^{T}\\norm{\\omega(t)}_{\\Linf}\\dd t = \\infty$, where $\\omega$ is the vorticity. The theorem proves exactly this integral is infinite, and that $\\sup|\\nabla v|$ exceeds every bound as $t\\to T^*$. So $T^*$ is not an artifact of asking for too much smoothness: the one quantity whose finiteness would permit continuation is infinite.</p>
<p>A second clause closes another exit: there is no global smooth solution with bounded energy in the Comparator’s class either. Any such solution would agree with the constructed one by uniqueness; its vorticity stays inside a fixed ball, hence is bounded on compact time intervals, contradicting the infinite integral.</p>
<p>Not claimed: a blowup rate, a profile, pointwise vorticity blowup, or anything about weak continuation. The exponent $\\gamma$ in the scene is yours to choose; the theorem only says “the integral is infinite”.</p>`,
      stage: {
        need: 'Assurance that $T^*$ is a real singularity: no continuation by any smooth solution, in the construction’s class or in the Comparator’s global class.',
        whyNot: 'Maximality in a Sobolev class only says the construction’s own method stops; a cleverer class might, in principle, go on.',
        ingredient: 'The Beale–Kato–Majda mechanism: a finite $\\int\\norm{\\omega}_{\\Linf}$ would bound $\\int\\norm{\\nabla u}_{\\Linf}$ through the logarithmic estimate and extend the solution; hence both diverge.',
        remaining: 'Nothing, for the theorem. Open: rate, profile, pointwise vorticity blowup, weak continuation, and any relevance to Navier–Stokes.',
      },
      inspect: `
<p>The engine is a whole-space logarithmic inequality, proved in the Lean through a Gaussian heat kernel ([[src:lean-euler-loggrad]]):</p>
<p>$$\\norm{\\nabla A}_{\\Linf} \\le C\\Big(1 + \\norm{A}_{L^2} + W\\,\\log\\big(e + \\norm{A}_{H^3}\\big)\\Big)\\quad\\text{whenever } \\divg A = 0 \\text{ and } |\\mathrm{curl}\\,A| \\le W,$$</p>
<p>with $C = 36\\cdot\\mathrm{splitCost}$ and $\\norm{\\cdot}_{H^3}$ the sum of the $L^2$ norms of the first three derivative tensors (<code>tensorNorm 3</code>). Suppose $\\int_0^t\\norm{\\omega}_{\\Linf}\\le G$ on every shorter interval. The inequality then closes by a Gronwall argument on the gradient integral: $\\int_0^t\\norm{\\nabla u}_{\\Linf} \\le \\exp\\big(C'\\,(T+G)\\big)$ (<code>gradientIntegral_of_vorticity_bound</code>). A gradient integral bounded on all shorter intervals yields a solution on the closed interval $[0,T^*]$ (<code>endpoint_of_bounded_gradient</code>, via <code>exists_smooth_endpoint</code>), which <code>no_endpoint</code> forbids. Therefore the partial vorticity integrals exceed every bound (<code>vorticityIntegral_unbounded</code>) and, as an extended Lebesgue integral, $\\int_{[0,T^*)}\\norm{\\omega}_{\\Linf} = \\top$ (<code>vorticity_lintegral_eq_top</code>; the docstring: the extended integral is used “so divergence is not obscured by the convention for nonintegrable real integrals”).</p>
<h3>The $C^1$ clause</h3>
<p>The same continuation theorem gives <code>gradient_unbounded_near_endpoint</code>: after every $\\tau\\lt T^*$ the gradient supremum exceeds every $K$. That is $\\limsup_{t\\uparrow T^*}\\norm{\\nabla v}_{\\Linf} = \\top$ (<code>maximalGradientNorm_limsup</code>); the velocity supremum is merely added to get <code>maximalC1Norm_limsup</code>, and <code>velocityC1Norm_maximal</code> identifies this with the reference’s $[0,\\infty]$-valued norm.</p>
<h3>Energy</h3>
<p>Kinetic energy is exactly conserved on every evolution (<code>kineticEnergy_conserved</code>), so the bound in the theorem is $E = \\norm{u_0}_{L^2}^2 + 1$.</p>
<h3>The Comparator’s global class</h3>
<p>Let $(v,p)$ be a global smooth bounded-energy solution in the reference class <code>EulerExistenceAndSmoothnessR3</code>. Its initial vorticity is compactly supported, so for a short time it is an ordinary <code>Evolution</code> (<code>compactCurlLocalUpgrade</code>), and uniqueness identifies it with the maximal solution on all of $[0,T^*)$ (<code>maximalVelocity_eq_of_compactCurlLocalUpgrade</code>). The maximal solution’s vorticity stays in the ball of radius $2 + \\mathrm{particleDisplacementCap}$ (<code>canonical_vorticity_support</code>). A jointly smooth global solution has bounded vorticity on a compact set times $[0,T^*]$ (<code>vorticity_bounded_on_compact</code>), so $\\int_0^{T^*}\\norm{\\omega}_{\\Linf}$ would be finite: contradiction (<code>finiteLifespan_contradiction_of_compact_vorticity</code>).</p>
<details class="more"><summary>The model in the scene</summary>
<p>$\\int_0^{T^*}(T^*-t)^{-\\gamma}\\dd t$ is finite exactly when $\\gamma\\lt1$. The theorem proves the integral infinite but names no $\\gamma$ and no power law; the real $\\norm{\\omega(t)}_{\\Linf}$ need not even tend to infinity for its integral to diverge, and the Lean says nothing about its pointwise behaviour.</p></details>
<details class="more"><summary>The two norms, as the reference defines them</summary>
<pre>noncomputable def velocityC1Norm (v : ℝ³ → ℝ³) : ℝ≥0∞ :=
  (⨆ x, ENNReal.ofReal ‖v x‖) + (⨆ x, ENNReal.ofReal ‖fderiv ℝ v x‖)

noncomputable def vorticityNorm (v : ℝ³ → ℝ³) : ℝ≥0∞ :=
  ⨆ x, ENNReal.ofReal ‖vorticity v x‖</pre><p>Suprema in $[0,\\infty]$, so an unbounded field has norm $\\top$. The clause “a solution on $[0,T]$ exists iff $T\\lt T^*$” is <code>maximal_sobolev_existence_iff</code>, stated in the all-order Sobolev class; see [[scene:concentration/what-is-claimed|chapter 1]] for the full statement.</p></details>`,
      verify: {
        statements: [
          { title: 'Logarithmic gradient estimate (Lean, verbatim)', html: `<pre>theorem logarithmic_gradient_bound (A : SmoothL2Field Space)
    (hdiv : ∀ y, divergence A.field y = 0) (W : ℝ)
    (hW : ∀ y, ‖vectorCurl A.field y‖ ≤ W) (x : Space) :
    ‖fderiv ℝ A.field x‖ ≤ logarithmicGradientConstant*
      (1+‖A.toLp‖+W*Real.log (Real.exp 1+tensorNorm 3 A))</pre><p>Docstring: “A genuine whole-space BKM logarithmic estimate from the actual velocity, its actual H³ tensors, and its actual vorticity.” <code>logarithmicGradientConstant := 36*splitCost</code>.</p>` },
          { title: 'Vorticity integral (Lean, verbatim)', html: `<pre>theorem vorticityIntegral_unbounded (G : ℝ) :
    ∃ (S : ℝ) (hS : 0 &lt; S) (hSL : S &lt; L.duration)
      (t : Icc (0 : ℝ) S), G &lt; (L.evolution S hS hSL).vorticityIntegral t

theorem vorticity_lintegral_eq_top :
    (∫⁻ r in Ico (0 : ℝ) L.duration, ENNReal.ofReal (L.maximalVorticityDensity r))=⊤</pre>` },
          { title: 'Comparator-class contradiction (Lean, verbatim)', html: `<pre>theorem finiteLifespan_contradiction_of_compact_vorticity
    (h : EulerExistenceAndSmoothnessR3 A.field v p)
    (K : Set Space) (hK : IsCompact K)
    (hmatch : ∀ t : L.Time, L.maximalVelocity t = (v · (t : ℝ)))
    (hsupport : ∀ (t : L.Time) x, x ∉ K →
      vectorCurl (L.maximalVelocity t) x = 0) : False</pre><p>Module docstring: “The contradiction uses the proved Beale–Kato–Majda integral criterion.”</p>` },
          { title: 'Model identity (formula-derived)', html: `<p>$\\int_0^t (T^*-s)^{-\\gamma}\\dd s = \\dfrac{(T^*)^{1-\\gamma}-(T^*-t)^{1-\\gamma}}{1-\\gamma}$ for $\\gamma\\ne1$ and $\\ln\\dfrac{T^*}{T^*-t}$ for $\\gamma=1$; the limit $t\\to T^*$ is finite iff $\\gamma\\lt1$. The second curve uses the pointwise fact $|\\omega| = \\|\\nabla v-(\\nabla v)^{\\!\\top}\\| \\le 2\\|\\nabla v\\|$.</p>` },
        ],
        lean: [
          { decl: 'EulerOrdinarySobolev.logarithmic_gradient_bound', file: 'Euler/OrdinaryLogarithmicGradient.lean', line: 29, note: 'The BKM-type logarithmic inequality; constant at line 21.' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan.vorticity_unbounded_of_logarithmic', file: 'Euler/OrdinaryBKMReduction.lean', line: 34, note: 'From the logarithmic inequality and endpoint_of_bounded_gradient to unbounded partial vorticity integrals; uses gradientIntegral_of_vorticity_bound (same file).' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan.endpoint_of_bounded_gradient', file: 'Euler/OrdinaryEulerLifespan.lean', line: 77, note: 'A uniform bound on ∫‖∇u‖∞ over all shorter intervals gives a solution on the closed maximal interval (exists_smooth_endpoint, OrdinaryEulerEndpoint.lean:39).' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan.no_endpoint / gradient_unbounded_near_endpoint', file: 'Euler/OrdinaryEulerContinuation.lean', line: 53, note: 'No solution on [0,T*] (53); after every τ < T* the gradient exceeds every K (86).' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan.vorticityIntegral_unbounded / vorticity_lintegral_eq_top', file: 'Euler/OrdinaryEulerBKM.lean', line: 20, note: 'Partial integrals unbounded (20); the extended integral equals ⊤ (35).' },
          { decl: 'EulerOrdinarySobolev.FiniteLifespan.maximalGradientNorm_limsup / maximalC1Norm_limsup', file: 'Euler/EulerC1Limsup.lean', line: 54, note: 'limsup of the gradient sup-norm is ⊤ (54); the C¹ norm adds the velocity sup-norm (60).' },
          { decl: 'Euler.ComparatorBridge.maximalVelocityExtension_c1_limsup / _vorticity_integral / _bounded_energy', file: 'Euler/ComparatorMaximalFields.lean', line: 117, note: 'The clauses of the main theorem in the reference’s norms (117, 123); energy bound E = ‖u₀‖² + 1 (82).' },
          { decl: 'EulerOrdinarySobolev.Evolution.kineticEnergy_conserved', file: 'Euler/OrdinaryEulerKineticEnergy.lean', line: 33, note: '‖v(t)‖²_{L²} = ‖v(0)‖²_{L²} on every evolution.' },
          { decl: 'Euler.ComparatorBridge.finiteLifespan_contradiction_of_compact_vorticity', file: 'Euler/CompactVorticityContradiction.lean', line: 18, note: 'Used in Solution.lean:24–31 to prove ¬ (∃ v p, EulerExistenceAndSmoothnessR3 initialDatum.field v p).' },
          { decl: 'EulerExistenceAndSmoothnessR3.vorticity_bounded_on_compact', file: 'Euler/CompactCurlBounds.lean', line: 19, note: 'A jointly smooth global solution has bounded curl on K × [0,T].' },
          { decl: 'Euler.ComparatorBridge.compactCurlLocalUpgrade', file: 'Euler/ComparatorLocalEvolution.lean', line: 91, note: 'A Comparator solution with compact initial vorticity is, for a short time, an ordinary Evolution.' },
          { decl: 'Euler.ComparatorBridge.maximalVelocity_eq_of_compactCurlLocalUpgrade', file: 'Euler/ComparatorIdentification.lean', line: 38, note: 'Identification of the Comparator solution with the canonical maximal solution, by uniqueness.' },
          { decl: 'EulerPacketInduction.canonical_vorticity_support / canonicalVorticityBall', file: 'Euler/CanonicalVorticityConfinement.lean', line: 69, note: 'Vorticity of the maximal solution stays in closedBall 0 (2 + particleDisplacementCap …) (ball defined at 22).' },
          { decl: 'Euler.ComparatorBridge.maximal_sobolev_existence_iff', file: 'Euler/ComparatorMaximalSolution.lean', line: 107, note: '(∃ v p, EulerSobolevExistenceAndSmoothnessR3On (Icc 0 T) …) ↔ T < L.duration.' },
          { decl: 'Euler.velocityC1Norm / Euler.vorticityNorm', file: 'Euler/SolutionDefinitions.lean', line: 130, note: 'The reference norms, valued in ℝ≥0∞ (130, 134).' },
          { decl: 'Euler.exists_compact_smooth_euler_singularity', file: 'Euler/Solution.lean', line: 43, note: 'The theorem assembling all clauses; statement printed in [[scene:concentration/what-is-claimed|chapter 1]].' },
        ],
        context: [
          { src: 'bkm', note: 'The classical criterion: a smooth Euler solution can be continued past T if and only if ∫₀ᵀ ‖ω(t)‖∞ dt < ∞. The Lean proves its own version with its own constant; the classical paper is cited for the idea, not used in the proof.' },
          { src: 'comparator-euler', note: 'The independent reference statement; its comment on the solution class: “Maximality below is asserted in this all-order Sobolev class. The last clause independently retains nonexistence in the broader global class.”' },
        ],
        limits: [
          'No blowup rate or profile is claimed by the theorem; the exponent $\\gamma$ and the power law are the scene’s model, not the solution.',
          'What blows up is the supremum of $|\\nabla v|$ (hence the $C^1$ norm) and the time integral of $\\sup|\\omega|$. Nothing is proved about $\\sup|\\omega(t)|$ tending to infinity pointwise in time, or about where in space the growth happens.',
          'Maximality and the “iff $T \\lt T^*$” clause are in the all-order Sobolev class; the last clause excludes the Comparator’s jointly smooth, bounded-energy global class via uniqueness. Other classes are not addressed.',
          'Nothing is said about weak or distributional continuation past $T^*$.',
          'Zero viscosity, no forcing, whole space only; nothing here transfers to Navier–Stokes.',
        ],
      },
    },
  ],
};
