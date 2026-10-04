// Chapter 2 — the Navier–Stokes construction, as a construction path (see content/SCHEMA.md).
// Mathematical ground truth: the Lean sources at the pinned commit. Paper numbering only where formalization.yaml
// or a Lean docstring supplies it. Every Lean anchor below was re-read in the clone (file:line).
export default {
  id: 'navier-stokes',
  number: 2,
  title: 'The Navier–Stokes construction',
  equation: 'ns',
  summary: 'Construct the vortex, find its imbalance, add oscillatory corrections, control the errors, localize, and conclude breakdown.',
  scenes: [
    /* ------------------------------------------------------------------ */
    {
      id: 'why-the-flow-must-stretch',
      title: 'Why the flow must stretch itself',
      question: 'What mechanism can make a fluid speed itself up?',
      visual: { scene: 'vortex-stretching', label: 'formula-derived', caption: 'Model: a Gaussian vortex tube in an imposed strain, solved exactly', params: { gamma: 1.0, nu: 0.02, d0: 1.0 } },
      status: {
        changes: 'Peak vorticity: $e^{\\gamma t}$ for constant strain without viscosity, saturation with it, $(T-t)^{-\\kappa}$ only when the strain itself grows.',
        bounded: 'The circulation $\\Gamma = \\pi A\\delta^2$ is conserved in the model; with viscosity the core radius stops at the Burgers value $\\sqrt{4\\nu/\\gamma}$.',
        fails: 'Self-consistency. The strain is prescribed by hand. A finite-time singularity needs the vortex to produce the strain that stretches it.',
      },
      understand: `
<p>The planar swirl of [[scene:concentration/not-yet-a-proof|chapter 1]] could not speed itself up: in two dimensions vorticity is only carried and diffused. Three dimensions add one mechanism, <strong>vortex stretching</strong>. Pull a spinning tube along its axis and it thins; conservation of circulation then forces it to spin faster, like a skater pulling in her arms.</p>
<p>The scene solves this mechanism exactly for a Gaussian vortex sitting in a strain that pulls fluid in radially and out along the axis. Strain plus swirl is an exact Navier\u2013Stokes solution, but the strain is imposed and carries infinite energy. With a constant strain the result is modest. Without viscosity the peak vorticity grows only exponentially, never infinite in finite time. With viscosity the core stops shrinking at the Burgers radius and the vorticity saturates. Only when the strain itself grows like $1/(T-t)$ does the model blow up in finite time.</p>
<p>That is the lesson. A finite-time singularity needs <em>feedback</em>: the vortex must intensify the strain that stretches it. The next scene shows the self-similar base flow in which the construction arranges exactly this.</p>`,
      inspect: `
<p>Taking the curl of the Navier\u2013Stokes equations gives the vorticity equation</p>
<p>$$\\partial_t \\omega + (u\\cdot\\nabla)\\omega = (\\omega\\cdot\\nabla)u + \\nu\\Delta\\omega .$$</p>
<p>The term $(\\omega\\cdot\\nabla)u$ is vortex stretching: the velocity gradient along a vortex line amplifies the vorticity. In two dimensions it vanishes identically, which is why the planar toy of chapter 1 had no way to grow. The scene isolates this one term in the simplest exact setting.</p>
<h3>The model</h3>
<p>Impose the axisymmetric strain $u_s = (-\\tfrac{\\gamma}{2}x, -\\tfrac{\\gamma}{2}y, \\gamma z)$, which is divergence-free, and add a swirl whose axial vorticity is Gaussian, $\\omega_z = A(t)\\,e^{-r^2/\\delta(t)^2}$. The swirl advects itself only azimuthally, so the vorticity equation reduces to</p>
<p>$$\\partial_t\\omega - \\tfrac{\\gamma r}{2}\\,\\partial_r\\omega = \\gamma\\,\\omega + \\nu\\Big(\\partial_{rr}\\omega + \\tfrac1r\\partial_r\\omega\\Big),$$</p>
<p>and the Gaussian is an exact solution provided</p>
<p>$$\\frac{\\dd}{\\dd t}\\,\\delta^2 = 4\\nu - \\gamma\\,\\delta^2, \\qquad \\Gamma = \\pi A\\delta^2 = \\text{const}.$$</p>
<details class="more"><summary>Deriving the two conditions</summary>
<p>Write $\\omega = A e^{-r^2/\\delta^2}$. Then $\\partial_t\\omega = \\omega\\,(A'/A + 2r^2\\delta'/\\delta^3)$, $\\partial_r\\omega = -2r\\omega/\\delta^2$ and $\\partial_{rr}\\omega + \\partial_r\\omega/r = \\omega\\,(4r^2/\\delta^4 - 4/\\delta^2)$. Substituting and comparing the coefficients of $r^2\\omega$ gives $2\\delta'/\\delta^3 + \\gamma/\\delta^2 = 4\\nu/\\delta^4$, i.e. $(\\delta^2)' = 4\\nu - \\gamma\\delta^2$. The remaining terms give $A'/A = \\gamma - 4\\nu/\\delta^2$, hence $(A\\delta^2)' = 0$: the circulation is conserved and the peak vorticity is $\\Gamma/(\\pi\\delta^2)$.</p></details>
<h3>Three regimes</h3>
<p>With $\\nu = 0$ and constant $\\gamma$, $\\delta^2 = \\delta_0^2 e^{-\\gamma t}$ and $\\omega_{\\max} \\propto e^{\\gamma t}$: unbounded, but never infinite at a finite time. With $\\nu \\gt 0$, $\\delta^2 \\to 4\\nu/\\gamma$ and the vorticity saturates at $\\Gamma\\gamma/(4\\pi\\nu)$; this steady state is the Burgers vortex. If instead the strain grows like $\\gamma = \\kappa/(T-t)$, then $\\delta^2 = \\delta_0^2\\,((T-t)/T)^{\\kappa}$ and $\\omega_{\\max} \\propto (T-t)^{-\\kappa}$: finite-time blowup, but only because the growth of the strain was put in by hand.</p>
<h3>Why this is not yet the construction</h3>
<p>In the model the strain is an external field. In a genuine solution the strain acting on the core is produced by the flow itself, so blowup requires the collapsing vortex to generate a strain of order $1/(T-t)$ at its own location. The construction\u2019s base is an axisymmetric field with swirl and a meridional (in-and-along-the-axis) stream, written as a Euclidean curl of two axisymmetric potentials, and it is designed so that in the collapsing frame all terms balance at the leading order. Its axis speed is an exact power law, $j\\,(1-t)^{-(1/2+h)}$. The next scene describes it.</p>`,
      verify: {
        statements: [
          { title: 'Exact Gaussian vortex in a strain (formula-derived)', html: '<p>For $u = (-\\tfrac{\\gamma}{2}x, -\\tfrac{\\gamma}{2}y, \\gamma z) + v_\\theta e_\\theta$ with axial vorticity $\\omega_z = A(t)e^{-r^2/\\delta(t)^2}$, the vorticity equation holds exactly if and only if $(\\delta^2)\' = 4\\nu - \\gamma\\delta^2$ and $A\\delta^2$ is constant. Consequently $\\omega_{\\max}(t) = \\Gamma/(\\pi\\delta(t)^2)$.</p>' },
          { title: 'Saturation and exponential growth', html: '<p>For constant $\\gamma \\gt 0$: if $\\nu \\gt 0$ then $\\delta^2 \\to 4\\nu/\\gamma$ and $\\omega_{\\max} \\to \\Gamma\\gamma/(4\\pi\\nu)$; if $\\nu = 0$ then $\\omega_{\\max} = \\omega_{\\max}(0)\\,e^{\\gamma t}$. In neither case is there a finite-time singularity.</p>' },
          { title: 'Blowup under growing strain', html: '<p>If $\\nu = 0$ and $\\gamma(t) = \\kappa/(T-t)$ then $\\delta^2 = \\delta_0^2((T-t)/T)^{\\kappa}$ and $\\omega_{\\max} \\propto (T-t)^{-\\kappa}$. The strain is imposed; nothing here shows a fluid producing it.</p>' },
        ],
        lean: [
          { decl: 'NavierStokes.AxisymmetricFields.velocity', file: 'NavierStokes/AxisymmetricFields.lean', line: 39, note: 'The construction\u2019s base is an actual Euclidean curl of an axisymmetric potential built from two profiles; the module docstring (lines 9\u201310) states \u201cNo division by the radius is used, including at the axis.\u201d' },
          { decl: 'NavierStokes.NaturalCore (module docstring)', file: 'NavierStokes/NaturalCore.lean', line: 10, module: true, note: '\u201cThe core is the actual Cartesian curl of meridional and swirl potentials obtained from the natural profiles.\u201d (lines 10\u201311)' },
          { decl: 'NavierStokes.FinalSlowBase.origin', file: 'NavierStokes/FinalSlowBase.lean', line: 361, note: 'The mechanism the construction actually uses: on the axis the base velocity is exactly $((1-t)^{-A}\\, j)\\,e_2$ with $A = 1/2 + h$. Next scene.' },
        ],
        context: [
          { src: 'burgers-1948', note: 'The steady stretched vortex with core radius $\\sqrt{4\\nu/\\gamma}$ is Burgers\u2019 vortex.' },
          { src: 'leray', note: 'Leray\u2019s scaling symmetry and lower bound $(T-t)^{-1/2}$, which the self-similar base of the next scene slightly exceeds.' },
          { src: 'openai-x', note: 'OpenAI\u2019s public description of the vortex as spiralling inward while elongating; this scene\u2019s inflow-plus-axial-outflow strain is the textbook version of that picture, not the paper\u2019s field.' },
        ],
        limits: [
          'This is a classical model: strain plus Gaussian swirl is an exact Navier\u2013Stokes solution, but the strain is imposed by hand and has infinite energy. It is not the construction, and it is not a finite-energy solution.',
          'The \u201cgrowing strain\u201d option is a stand-in for feedback; the exponent \u03ba is a free parameter of the model, unrelated to the construction\u2019s h.',
          'The statement that the base balances all terms at leading order in the collapsing frame is a description of what a self-similar profile is; the profile equations themselves are not shown here.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'the-self-similar-vortex',
      title: 'The self-similar vortex',
      question: 'What does the vortex look like in coordinates that move with the collapse?',
      visual: { scene: 'similarity-zoom', label: 'formula-derived', caption: 'Physical coordinates (r, z) and similarity coordinates (X, \u03b7) of the collapsing base, side by side', params: { h: 0.08, XL: 0.5, XR: 3 } },
      status: {
        changes: 'Axis speed $j(1-t)^{-(1/2+h)}$; core waist $\\propto\\sqrt{1-t}$; axial scale $\\propto (1-t)^{1/2-h}$. The vortex becomes a slender filament.',
        bounded: 'Everything in $(X,\\eta)$: regions, profile, cone data. Far outside the active annulus the base is an explicit heat solution.',
        fails: 'Exactness. The base alone is not a solution; its residual, living in the active annulus, is repaired next.',
      },
      understand: `
<p>Stand where the singularity will form and shrink your ruler as time runs out. With the right ruler the collapsing vortex stops moving. That is what <strong>self-similar</strong> means, and it is how the construction describes its base.</p>
<p>The Lean measures distance from the axis in units of the shrinking core (the scene’s X) and height in units of the shrinking length (η). In those units the core keeps its width, the picture freezes, and only the speed scale grows, slightly faster than the classical <span class="gloss" title="The slowest blowup rate the equations allow, found by Leray in 1934: the peak speed must grow at least like one over the square root of the time left.">Leray rate</span> by a tiny exponent h. On the axis the formalization fixes the speed exactly:</p>
<p>$$|u(t,0)| = j\\,(1-t)^{-(1/2+h)},$$</p>
<p>with h and the amplitude j tiny positive constants, abstract in the Lean.</p>
<p>In these coordinates the base has three fixed regions: a <em>core</em> around the axis, where only the base acts and the speed blows up; an <em>active annulus</em>, where every later correction will live; and an <em>exterior</em>, where only the base remains and which, far out, is an explicit heat solution. Move the time slider: the left picture pinches, the right one does not.</p>`,
      inspect: `
<p>The Lean works in cylindrical data $(t, s, z)$ with $s = (x_0^2 + x_1^2)/2 = r^2/2$ and never divides by $r$. Its similarity coordinate is the unique $q \\gt 0$ with</p>
<p>$$q - z^2 q^{2h} = 1 - t, \\qquad X = \\frac{s}{q} = \\frac{r^2}{2q}, \\qquad \\eta = \\frac{z}{q^{(1-2h)/2}},$$</p>
<p>and its two exponents are $A = \\tfrac12 + h$ and $D = \\tfrac12 - h$, with $A + D = 1$. The docstring calls this \u201cEquation (3), with exactly the manuscript\u2019s exponent $2h$.\u201d Dividing the defining relation by $q$ gives $\\eta^2 = 1 - (1-t)/q$, so $|\\eta| \\lt 1$ always, and for fixed $z \\ne 0$ the scale $q$ tends to a positive limit as $t \\to 1$: only the origin collapses. Far from the symmetry plane the level sets of $X$ are time-frozen and nearly conical ($r \\propto |z|^{1/(1-2h)}$); near it they pinch to a waist of radius $\\sqrt{2Xq}$. That is the hourglass in the scene. On the symmetry plane $z = 0$ the scale is simply $q = 1 - t$: a fixed $X$ is a waist of radius $\\sqrt{2X(1-t)}$, a fixed $\\eta$ a height $|\\eta|\\,(1-t)^{1/2-h}$, and velocities carry $q^{-A} = q^{-(1/2+h)}$, Leray’s $(1-t)^{-1/2}$ sharpened by the exponent $h$. These are the scene’s readouts.</p>
<h3>The base</h3>
<p>The base velocity is a Euclidean curl, <code>AxisymmetricFields.velocity (streamFactor) (swirlPotential)</code>, of an axisymmetric potential with a meridional stream and a swirl component. Each profile is restored to physical scale by a fixed power of $q$: the stream factor carries $q^{-A}$, the swirl potential $q^{1/2 - A} = q^{-h}$, the pressure $q^{-2A}$. The profiles themselves are <em>slow Borel series</em> in the similarity variables,</p>
<p>$$f_0(X,\\eta) + \\sum_{j \\ge 1} \\chi(a_j q)\\, q^{2hj} f_j(X,\\eta),$$</p>
<p>with slow orders $\\lambda_j = 2jh$ and cutoffs $\\chi(a_j q)$ that switch stage $j$ on only when $q$ is small (<code>SlowBorelBase.slowSum</code>, <code>positiveCoefficient</code>). On the axis all of this collapses to one exact formula, <code>FinalSlowBase.origin</code>:</p>
<p>$$u_{\\mathrm{base}}(t, 0) = \\big((1-t)^{-A}\\, j\\big)\\, e_2, \\qquad j \\gt 0,$$</p>
<p>so $\\|u_{\\mathrm{base}}(t,0)\\| \\to \\infty$ as $t \\to 1^-$ (<code>axis_tendsto</code>). Along an inward ray at fixed $X$ the swirl obeys $u_\\theta = \\tau^{-A}(e_0 + O(\\tau^{2h}))$ with $\\tau = 1 - t$ (<code>BaseAngularGrowth.normalized_velocity_ray_bound</code>).</p>
<h3>Regions and parameters</h3>
<p>The active annulus is $X \\in (X_L, X_R)$, $|\\eta| \\le 1$, with $X_L = 4/\\mathrm{scale}$ and $X_R = \\mathrm{radius}\\cdot e^{\\mathrm{tailEnd}}$ taken from the solved profile. \u201cAll correction stages vanish on the inner complement of the active annulus\u201d; on the outer complement, for small $q$, all corrections vanish too and only the slow base remains (<code>exteriorStages</code>). Farther out, for $X \\ge X_{\\mathrm{ext}} := \\max(X_L, X_R, X_{\\mathrm{heat}}) + 1$ and $q \\lt q_*$, that base is \u201cthe actual pure-heat exterior of the summed slow base\u201d, an angular field $r^{-1-2h}H_{\\mathrm{ext}}(\\tau/r^2)$ with pressure $-\\int K^2/\\rho$ (<code>LocalPaperDomain.outerEdge</code>, <code>Properties.exterior</code>).</p>
<details class="more"><summary>What the Lean fixes, and what it leaves abstract</summary>
<p>The exponent is $h := \\mathrm{actualProfile.outgoing.data.}h$, where <code>actualProfile</code> is a <code>Classical.choice</code> from a proved existence theorem (<code>profileData_nonempty</code>, via <code>NominalConeAssembly.exists_nominal_cone</code>). The record only guarantees $0 \\lt h$ and $2h \\lt \\lambda \\lt 1/10$; the axis data satisfy <code>SmallParameters</code>: $0 \\lt h \\le 1/1000$, $0 \\lt j \\le 1/1000$, inside the \u201cfull printed range\u201d $h \\le 1/100$, $j \\le 1/20$. The theorem <code>selected_exponent_small</code> records $0 \\lt h \\lt 1/100$ for the selected profile. No numerical value of $h$, $j$, $X_L$ or $X_R$ is computed; the sliders stand in for them, with $h$ exaggerated.</p></details>
<details class="more"><summary>Viscosity one, then every viscosity</summary>
<p>Everything is done at $\\nu = 1$ (\u201cthe physical Navier\u2013Stokes residual at viscosity exactly one\u201d); other viscosities come from the spatial dilation $\\sqrt{\\nu}\\,u(t, x/\\sqrt{\\nu})$, which keeps the singular time at one ([[scene:navier-stokes/from-one-solution-to-no-solution|last scene]]).</p></details>`,
      stage: {
        need: 'A flow whose own nonlinearity drives the collapse, with a speed that becomes infinite at one point at one time, in a frame where the picture is frozen.',
        whyNot: 'The stretched-vortex model needed a strain imposed by hand, and the planar swirl had no stretching at all. Neither flow feeds back on itself.',
        ingredient: 'An axisymmetric self-similar base with swirl and axial outflow, written in the frozen coordinates and scaled up slightly faster than the Leray rate.',
        remaining: 'The base is not an exact solution: its residual, concentrated in the active annulus, must be cancelled. The exponent, the amplitude and the profile stay abstract in the Lean.',
      },
      verify: {
        statements: [
          { title: 'Similarity coordinate (Lean, verbatim)', html: '<pre>/-- Equation (3), with exactly the manuscript\'s exponent `2h`. -/\ntheorem manuscript_coordinate_existsUnique {h τ : ℝ} (hh : 0 < h)\n    (hh1 : h < 1 / 2) (hτ : 0 < τ) (z : ℝ) :\n    ∃! q : ℝ, 0 < q ∧ q - z ^ 2 * q ^ (2 * h) = τ</pre><p>with <code>q h p := coordinateQ (2h) (1 − t, z)</code>, <code>X h p := s / q</code>, <code>eta h p := coordinateEta (2h) (1 − t, z)</code> and $s = (x_0^2 + x_1^2)/2$.</p>' },
          { title: 'Axis power law (Lean, verbatim)', html: '<pre>theorem origin (upper : ℝ) (B : ℕ) {t : ℝ} (ht : t < 1) :\n    velocity H v upper B (t, 0) =\n      ((1 - t) ^ (-CoordinateAlgebra.A F.data.h) * W.axis.j) • ProblemStatement.coordinateVector 2\n\ntheorem axis_tendsto (upper : ℝ) (B : ℕ) :\n    Tendsto (fun t : ℝ => ‖velocity H v upper B (t, 0)‖) (𝓝[<] 1) atTop</pre>' },
          { title: 'Consequences shown in the scene (formula-derived)', html: '<p>From the definitions: $\\eta^2 = 1 - (1-t)/q \\lt 1$; at fixed $X$ the physical radius is $\\sqrt{2Xq}$, equal to $\\sqrt{2X(1-t)}$ on the plane $z = 0$; at fixed $\\eta$ the height is $|\\eta|\\,q^{1/2-h}$; the ratio of radial to axial scale on the plane is $(1-t)^h$.</p>' },
        ],
        lean: [
          { decl: 'NavierStokes.SimilarityCoordinates.manuscript_coordinate_existsUnique', file: 'NavierStokes/SimilarityCoordinates.lean', line: 554, note: 'Unique positive solution of $q - z^2 q^{2h} = \\tau$; module docstring: \u201cHere a = 2h.\u201d' },
          { decl: 'NavierStokes.SimilarityProfile.q / eta / X', file: 'NavierStokes/SimilarityProfile.lean', line: 27, note: 'The coordinate maps $(t, s, z) \\mapsto q, \\eta, X = s/q$.' },
          { decl: 'NavierStokes.AxisymmetricFields.radialEnergy', file: 'NavierStokes/AxisymmetricFields.lean', line: 27, note: '$s = (x_0^2 + x_1^2)/2$; the velocity (line 39) is the Euclidean curl of the axisymmetric potential.' },
          { decl: 'NavierStokes.PhysicalWaveSum.physicalQ', file: 'NavierStokes/PhysicalWaveSum.lean', line: 391, note: '\u201cThe actual similarity coordinate at a Cartesian spacetime point.\u201d' },
          { decl: 'NavierStokes.CoordinateAlgebra.A / D', file: 'NavierStokes/CoordinateAlgebra.lean', line: 18, note: '$A(h) = 1/2 + h$, $D(h) = 1/2 - h$.' },
          { decl: 'NavierStokes.SlowBorelBase.baseVelocity', file: 'NavierStokes/SlowBorelBase.lean', line: 1179, note: 'Curl of the stream factor (power $-A$, line 1170) and swirl potential (power $1/2 - A$, line 1173); <code>physicalProfile</code> (line 788) restores the leading $q$-power; <code>slowSum</code> (line 254) is $f_0 + \\sum_{j\\ge1}\\chi(a_j q) q^{2hj} f_j$.' },
          { decl: 'NavierStokes.SlowExpansionResidual.slowOrder', file: 'NavierStokes/SlowExpansionResidual.lean', line: 24, note: '\u201cThe manuscript\u2019s slow order $\\lambda_n = 2nh$.\u201d' },
          { decl: 'NavierStokes.FinalSlowBase.origin', file: 'NavierStokes/FinalSlowBase.lean', line: 361, note: 'Axis value $((1-t)^{-A} j) e_2$; <code>axis_tendsto</code> at line 372; <code>velocity</code> at line 274; <code>annulus</code> at line 34; <code>actualProfile</code> at line 634.' },
          { decl: 'NavierStokes.BaseAngularGrowth.normalized_velocity_ray_bound', file: 'NavierStokes/BaseAngularGrowth.lean', line: 114, note: '$|\\tau^A u_\\theta(1-\\tau, \\mathrm{ray}\\,X\\,\\tau) - e_0(X)| \\le C\\tau^{2h}$ along an inward ray at fixed $X$.' },
          { decl: 'NavierStokes.NominalConeAssembly.activeLeft / activeRight', file: 'NavierStokes/NominalConeAssembly.lean', line: 1327, note: '$X_L = 4/\\mathrm{scale}$, $X_R = \\mathrm{radius}\\cdot\\exp(\\mathrm{tailEnd})$; both abstract.' },
          { decl: 'NavierStokes.ActualPolarCoverage.active', file: 'NavierStokes/ActualPolarCoverage.lean', line: 24, note: 'Spacetime points whose $X$ lies in $[X_L, X_R]$.' },
          { decl: 'NavierStokes.LocalAngularGrowth.selected_exponent_small', file: 'NavierStokes/LocalAngularGrowth.lean', line: 230, note: '$0 \\lt h \\lt 1/100$ for the selected profile; module docstring (line 8): \u201cAll correction stages vanish on the inner complement of the active annulus.\u201d' },
          { decl: 'NavierStokes.NaturalAxisData.SmallParameters', file: 'NavierStokes/NaturalAxisData.lean', line: 41, note: '$0 \\lt h \\le 1/1000$, $0 \\lt j \\le 1/1000$; the printed range <code>NaturalAxisRange.Parameters</code> (NaturalAxisRange.lean:13) is $h \\le 1/100$, $j \\le 1/20$.' },
          { decl: 'NavierStokes.OutgoingTail.TailData', file: 'NavierStokes/OutgoingTail.lean', line: 103, note: '$0 \\lt h$ and $2h \\lt \\lambda$, with $\\lambda \\lt 1/10$ from <code>OutgoingSchedule.Parameters</code>.' },
          { decl: 'NavierStokes.CorrectionInitialization.ActualPrimary.h', file: 'NavierStokes/CorrectionInitialization.lean', line: 3889, note: 'The exponent used everywhere downstream is the selected profile\u2019s $h$.' },
          { decl: 'NavierStokes.LocalPaper.Properties.exterior_amplitude_formula', file: 'NavierStokes/LocalPaperHeat.lean', line: 34, note: '\u201cThe exterior angular magnitude is exactly $r^{-1-2h}H_{\\mathrm{ext}}(\\tau/r^2)$\u201d; <code>exterior_radial_form</code> (line 51) gives the field $K e_\\theta$ and pressure $-\\int K^2/\\rho$, under the hypotheses $q \\lt q_*$ and $X_{\\mathrm{ext}} \\le X$ of <code>Properties.exterior</code> (LocalPaperTheorem.lean:79).' },
          { decl: 'NavierStokes.LocalPaperDomain.outerEdge', file: 'NavierStokes/LocalPaperDomain.lean', line: 21, note: 'The heat-exterior radius of the selected fields: $X_{\\mathrm{ext}} = \\max(X_L, X_R, \\mathrm{nominalExteriorRadius}) + 1$, strictly larger than $X_R$; <code>innerEdge</code> $= X_L$ at line 19; <code>qstar</code> at line 16.' },
          { decl: 'NavierStokes.ActualCandidateAssembly.exteriorStages', file: 'NavierStokes/ActualCandidateAssembly.lean', line: 701, note: 'Outside the closed active annulus, for small $q$, every correction potential of stage $\\ge 1$ and every direct field vanishes, while potential and pressure keep the slow-base stage zero (<code>ActualExteriorPrefix.ExteriorStages</code>, ActualExteriorPrefix.lean:56; <code>exteriorDomain</code> at line 23).' },
          { decl: 'NavierStokes.BaseExterior (module docstring)', file: 'NavierStokes/BaseExterior.lean', line: 8, module: true, note: '\u201cThe actual pure-heat exterior of the summed slow base.\u201d (line 8)' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Equation (3) as cited in the Lean docstring of manuscript_coordinate_existsUnique', note: 'The paper itself was not read for this site; only the Lean docstring\u2019s citation is reported.' },
        ],
        limits: [
          'The flow pattern drawn in the physical panel (arrows) is schematic. Only the coordinates, scalings, region boundaries and the axis speed are computed.',
          'The slider h is exaggerated (up to 0.2) for visibility; the Lean requires h \u2264 1/1000. X_L, X_R and j are abstract in the Lean and illustrative here.',
          'The scene does not show the profile functions f_j, which are the output of a long existence argument (NominalConeAssembly, ModulatedProfileAssembly) not explored in this chapter.',
          'The pure-heat identity is proved only for X \u2265 X_ext = max(X_L, X_R, nominalExteriorRadius) + 1 and small q (LocalPaperDomain.outerEdge). Between X_R and X_ext the Lean shows that the corrections vanish and the base remains; the scene draws the single boundary X_R.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'what-the-base-leaves-unbalanced',
      title: 'What the base leaves unbalanced',
      question: 'What is left unbalanced by the base, and how is it paid off stage by stage?',
      visual: { scene: 'error-ledger', label: 'formula-derived', caption: 'The exponent ledger: what each correction cycle books, and how stages switch on as q \u2192 0', params: { J: 4, h: 0.05, logQ: 2.3, g: 2 } },
      status: {
        changes: 'The booked residual class after $J$ cycles: waves $B_J = \\tfrac{7}{10} + \\tfrac{J}{10}$, means $C_J = \\tfrac65 + \\tfrac{J}{10}$; physically a factor $q^{hJ/10}$.',
        bounded: 'Every cutoff $\\chi(a_j q) \\in [0,1]$, identically one for $q \\le 1/(2a_j)$: near the singular point nothing is cut.',
        fails: 'No finite number of cycles suffices. Each leaves a smaller error; the schedule $a_j$ must keep the infinite sum smooth.',
      },
      understand: `
<p>Insert the base into Navier–Stokes and something is left over: [[scene:concentration/not-yet-a-proof|the residual]], the part of the equation the base fails to balance, in the active annulus. The construction does not kill it in one stroke. It repays it in instalments.</p>
<p>Each <em>correction cycle</em> adds a small field that cancels the leading part of the current residual and leaves a new one, smaller by a definite power of the shrinking scale q. The formalization keeps the books in an exponent ledger: each cycle is charged one tenth of an exponent (after J cycles, one fifth plus J tenths), while each wave step actually gains two fifths. Near the singular point the residual shrinks by the factor $q^{hJ/10}$.</p>
<p>Because h is tiny, each instalment is tiny, so infinitely many are needed. Cycle J is the J-th repair; stage j is that repair once the cutoff $\\chi(a_j q)$ switches it on, at small enough q. At any fixed time only finitely many stages are active, yet every cutoff equals one near the singular point. No residual magnitude is computed here.</p>`,
      inspect: `
<p>The residual is the project\u2019s own definition, at viscosity one:</p>
<p>$$R[u,p](t,x) = \\partial_t u + (u\\cdot\\nabla)u - \\Delta u + \\nabla p .$$</p>
<h3>One correction cycle</h3>
<p>A cycle has three moves. A <em>particular</em> wave correction solves \u201cthe current harmonic residual \u2026 on the common cover\u201d; a <em>signed</em> wave correction adjusts the sign structure of the wave covariance; and a <em>five-row mean update</em>, \u201cthe constructed power-moment inverse, transported with the physical length and velocity scales,\u201d repairs the non-oscillatory part. The <em>debt</em> is what the cycle must repay: \u201cthe first-wave debt, the signed covariance change, and the temporal mean change are evaluated on the literal intermediate states.\u201d The bookkeeping is exact: \u201cchanging the wave covariance and changing a mean velocity are not treated as independent black-box state transitions. Every old/new cross term is retained.\u201d The mechanism by which a wave can cancel a slow error is the subject of the [[scene:navier-stokes/fast-waves-slow-mean|next scene]].</p>
<h3>The ledger</h3>
<p>Two bookkeepings run side by side. The <em>exponent ledger</em> (<code>ExponentLedger</code>, which \u201cchecks the arithmetic \u2026 It does not define the analytic classes\u201d) assigns a wave class $B = \\tfrac12 + \\sigma$ and a mean/defect class $C = 1 + \\sigma$ to the state of accuracy $\\sigma$, advances $\\sigma$ by exactly $\\tfrac1{10}$ per cycle ($\\sigma_J = \\tfrac15 + \\tfrac{J}{10}$), and verifies that each step gains more than that: the particular step exactly $\\tfrac25$, the signed step $\\tfrac25 - \\kappa$, with $\\kappa = 10^{-5}$ \u201cfixed in \u00a78.1 and again in \u00a710.2\u201d of the manuscript. The <em>physical</em> ledger converts this to powers of $q$: after $J$ cycles the gain is $hJ/10$, and the residual\u2019s $m$-th derivative near the singular point is bounded by $C\\,q^{\\,hJ/10 - \\mathrm{loss}(m)}$ (<code>finite_residual_rates</code>). This is why the cycles never end: with $h \\le 1/1000$ each adds at most a ten-thousandth to the exponent.</p>
<h3>Switching the stages on</h3>
<p>The corrections are summed as cut potentials,</p>
<p>$$A_{\\mathrm{sum}} = \\sum_{j} \\chi(a_j q)\\, A_j, \\qquad u = \\nabla\\times A_{\\mathrm{sum}} + B_{\\mathrm{sum}},$$</p>
<p>where $B_{\\mathrm{sum}}$ is the direct angular mean, \u201cadded after taking the curl.\u201d The schedule satisfies $1 \\le a_0$, $2a_j \\le a_{j+1}$, $a_j \\to \\infty$ (<code>SelectedSchedule</code>); since $\\chi \\equiv 1$ on $|x| \\le \\tfrac12$ and $\\equiv 0$ on $|x| \\ge 1$, stage $j$ is fully on for $q \\le 1/(2a_j)$ and absent for $q \\ge 1/a_j$. Wherever $q \\gt 0$ \u201can entire tail is identically zero on a common neighborhood,\u201d so the sum is locally finite and smooth; choosing $a_j$ fast enough makes all residual jets vanish at the endpoint (<code>DiagonalScale</code>: \u201cthe decay of powers times logarithms\u201d). The wave labels use dyadic scales $Q_n = 2^{-n}$, a label being active when $q \\le Q_n \\lt 2q$.</p>
<details class="more"><summary>Which part of this chapter is not explored</summary>
<p>The estimates that justify each gain are the bulk of the formalization: <code>CorrectionStep.lean</code> alone is 9,849 lines, and the import closure of the assembled candidate exceeds 360,000 lines. This chapter reports their interfaces (the ledger, the schedule, the residual-limit hypotheses) and quotes their docstrings; it does not reproduce the estimates.</p></details>`,
      stage: {
        need: 'A residual whose every derivative tends to zero at the singular point and extends smoothly at every other terminal point, so that it can serve as the force.',
        whyNot: 'The base alone leaves a residual of fixed relative size in the active annulus; nothing makes it vanish as the singular time approaches.',
        ingredient: 'An iteration (particular wave, signed wave, five-row mean update per cycle), each cycle gaining a power of the scale, summed through the staged cutoffs.',
        remaining: 'How fast oscillations can cancel a slow error at all, and why the infinite sum is still smooth at the singular time. The next two scenes.',
      },
      verify: {
        statements: [
          { title: 'Exponent ledger (Lean, verbatim)', html: '<pre>/-- The good-wave residual exponent `B = 1/2 + σ`. -/\ndef waveExponent (σ : ℝ) : ℝ := 1 / 2 + σ\n/-- The mean and defect target exponent `C = 1 + σ`. -/\ndef meanExponent (σ : ℝ) : ℝ := 1 + σ\n/-- Iterated accuracy parameters; this does not assert existence of the iterates. -/\ndef stageParameter (n : ℕ) : ℝ := 1 / 5 + (n : ℝ) / 10\n\ntheorem particular_gain_eq {σ κ : ℝ} (hσ : 1 / 5 ≤ σ) (hκ : κ ≤ 1 / 100000) :\n    particularGain σ κ = 2 / 5\ntheorem signed_gain_eq {σ κ : ℝ} (hσ : 1 / 5 ≤ σ) (hκ : κ ≤ 1 / 100000) :\n    signedGain σ κ = 2 / 5 - κ</pre>' },
          { title: 'Physical gain after J cycles (Lean, verbatim)', html: '<pre>/-- One common physical gain for all increment types and finite residuals. -/\nnoncomputable def gain (h : ℝ) (j : ℕ) : ℝ := h * (j : ℝ) / 10\n\ntheorem residualWave_formula (J : ℕ) : residualWave J = (J : ℝ) / 10 + 7 / 10\ntheorem residualMean_formula (J : ℕ) : residualMean J = (J : ℝ) / 10 + 6 / 5</pre><p>and <code>finite_residual_rates</code>: for every $J$ and derivative order $m$, the residual of the $J$-th state satisfies <code>JetRate originPast (physicalQ h) (residual) m (gain h J − fixedLoss m)</code>, i.e. $\\|\\nabla^m R\\| \\le C\\, q^{\\,hJ/10 - \\mathrm{fixedLoss}(m)}$ near $(1, 0)$.</p>' },
          { title: 'Diagonal sum and schedule (Lean, verbatim)', html: '<pre>/-- Cut the potential before applying any velocity derivative. -/\ndef cutStage (a : ℕ → ℝ) (q : X → ℝ) (A : ℕ → X → V) (j : ℕ) (x : X) : V :=\n  SmoothCutoffs.scaledCutoff (a j) (q x) • A j x\ndef potentialSum (a : ℕ → ℝ) (q : X → ℝ) (A : ℕ → X → V) (x : X) : V :=\n  ∑\' j : ℕ, cutStage a q A j x\n\ndef SelectedSchedule (h qbig : ℝ) (A B : ℕ → VelocityField) (P : ℕ → PressureField) (a : ℕ → ℕ) : Prop :=\n  1 ≤ a 0 ∧ (∀ j, 0 < a j) ∧ (∀ j, 2 * a j ≤ a (j + 1)) ∧ StrictMono a ∧\n    Tendsto (fun j => (a j : ℝ)) atTop atTop ∧ (∀ j, 1 / (a j : ℝ) < qbig) ∧\n    MixedDiagonalSchedule.ThreeSmoothSums a h A B P ∧\n    JointResidualLimits.VanishingJointJets (MixedDiagonalResidual.residual … A B P)</pre>' },
        ],
        lean: [
          { decl: 'NavierStokes.ProblemStatement.navierStokesResidual', file: 'NavierStokes/ProblemStatement.lean', line: 82, note: '\u201cThe physical Navier\u2013Stokes residual at viscosity exactly one.\u201d' },
          { decl: 'NavierStokes.ExponentLedger.stageParameter', file: 'NavierStokes/ExponentLedger.lean', line: 286, note: '$\\sigma_n = 1/5 + n/10$; <code>waveExponent</code> line 24, <code>meanExponent</code> line 27. Module docstring: Proposition 10.3 of the candidate manuscript; \u03ba = 10\u207b\u2075 fixed in \u00a78.1 and \u00a710.2.' },
          { decl: 'NavierStokes.ExponentLedger.particular_gain_eq', file: 'NavierStokes/ExponentLedger.lean', line: 80, note: 'Particular step gains exactly 2/5; <code>signed_gain_eq</code> (line 114) gives 2/5 \u2212 \u03ba; <code>all_stage_arithmetic</code> (line 304) checks every margin for all n.' },
          { decl: 'NavierStokes.ActualIterationLedger.gain', file: 'NavierStokes/ActualIterationLedger.lean', line: 29, note: 'Physical gain h\u00b7j/10; <code>sigma</code> (line 22), <code>residualWave</code>/<code>residualMean</code> (lines 228\u2013237), <code>all_cycle_margins</code> (line 119).' },
          { decl: 'NavierStokes.ActualCycleResidualBounds.finite_residual_rates', file: 'NavierStokes/ActualCycleResidualBounds.lean', line: 1190, note: 'For iterates satisfying the cycle <code>Invariant</code>: after J cycles the residual\u2019s m-th jet decays like $q^{\\mathrm{gain}(h,J) - \\mathrm{fixedLoss}(m)}$ near the singular point.' },
          { decl: 'NavierStokes.CorrectionStep (module docstring)', file: 'NavierStokes/CorrectionStep.lean', line: 49, module: true, note: '\u201cExact field bookkeeping for one correction cycle. The residuals in this file are the differentiated nonlinear fields in (32).\u201d (lines 49\u201354)' },
          { decl: 'NavierStokes.ActualParticularDynamics (module docstring)', file: 'NavierStokes/ActualParticularDynamics.lean', line: 7, module: true, note: '\u201cThe current harmonic residual is solved on the common cover.\u201d (line 9)' },
          { decl: 'NavierStokes.MeanRankUpdate (module docstring)', file: 'NavierStokes/MeanRankUpdate.lean', line: 11, module: true, note: '\u201cThe physical five-row mean update. The update is the constructed power-moment inverse, transported with the physical length and velocity scales.\u201d (lines 11\u201314)' },
          { decl: 'NavierStokes.ActualIntermediateDebtBounds (module docstring)', file: 'NavierStokes/ActualIntermediateDebtBounds.lean', line: 5, module: true, note: '\u201cMeasured debt before the actual rank correction.\u201d (lines 5\u20139)' },
          { decl: 'NavierStokes.ActualCandidateConstruction.cycle', file: 'NavierStokes/ActualCandidateConstruction.lean', line: 40, note: 'The literal recurrence <code>CycleState.iterate</code> from the initialized state.' },
          { decl: 'NavierStokes.SolenoidalDiagonal.potentialSum', file: 'NavierStokes/SolenoidalDiagonal.lean', line: 37, note: '<code>cutStage</code> at line 32; module docstring (lines 10\u201312): locally a finite prefix.' },
          { decl: 'NavierStokes.MixedCandidateWitness.SelectedSchedule', file: 'NavierStokes/MixedCandidateWitness.lean', line: 25, note: 'The schedule properties, including the vanishing residual jets.' },
          { decl: 'NavierStokes.ActualCandidateAssembly.Witness', file: 'NavierStokes/ActualCandidateAssembly.lean', line: 1121, note: 'The three sums $A_{\\rm sum}, B_{\\rm sum}, P_{\\rm sum}$ over <code>potentialStages</code>, <code>directStages</code>, <code>pressureStages</code>; <code>selected_witness</code> at line 1177.' },
          { decl: 'NavierStokes.MixedPeriodicAssembly.velocity', file: 'NavierStokes/MixedPeriodicAssembly.lean', line: 28, note: '\u201cThe direct field is added after taking the curl.\u201d' },
          { decl: 'NavierStokes.SmoothCutoffs.cutoff', file: 'NavierStokes/SmoothCutoffs.lean', line: 33, note: 'A Mathlib <code>ContDiffBump</code> with inner radius 1/2 and outer radius 1 (lines 27\u201331); <code>scaledCutoff a q = cutoff (a q)</code> at line 134.' },
          { decl: 'NavierStokes.DiagonalScale (module docstring)', file: 'NavierStokes/DiagonalScale.lean', line: 11, module: true, note: '\u201cThis module proves the numerical cutoff-selection step in Lemma 11.3 of the candidate manuscript.\u201d (lines 11\u201312)' },
          { decl: 'NavierStokes.SlotColoring.dyadicQ', file: 'NavierStokes/SlotColoring.lean', line: 33, note: '$Q_n = 2^{-n}$; <code>ActualPolarCoverage</code> docstring (line 8): \u201cthe strict dyadic choice q \u2264 Q n < 2 * q.\u201d' },
          { decl: 'NavierStokes.SlowBorelBase.positiveCoefficient / slowSum', file: 'NavierStokes/SlowBorelBase.lean', line: 254, note: 'Stage $j \\ge 1$ of the slow base carries $q^{2hj}$ and is cut by $\\chi(a_j q)$.' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Proposition 10.3; \u00a78.1 and \u00a710.2 (\u03ba = 10\u207b\u2075); equation (32); Lemma 11.3 \u2014 all as cited in Lean docstrings', note: 'Numbering reported from the Lean docstrings only; the PDF was not read.' },
        ],
        limits: [
          'No residual is computed in the scene. The chart shows the exponent classes the Lean books, not the size of any field.',
          'The schedule a_j = g^j is illustrative; the Lean fixes a_j abstractly (DiagonalScale) subject to 2a_j \u2264 a_{j+1}.',
          'The slow-base sum and the correction sum are two different diagonal sums sharing the same cutoff mechanism; the weights q^{2jh} belong to the slow base.',
          'The estimates behind each gain (hundreds of thousands of lines) are not reproduced; only their interface is.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'fast-waves-slow-mean',
      title: 'Fast waves, slow mean',
      question: 'How can fast oscillations cancel a slow error?',
      visual: { scene: 'oscillation-mean', label: 'formula-derived', caption: 'Generic mechanism: a fast carrier whose square has a slow mean, and the bracketing condition for two signed slots', params: { kappa: 24, T: 0.8, t: 0.3, b: 0.7 } },
      status: {
        changes: 'The carrier frequency $\\kappa$: the leftover oscillation stays as large as the target; its antiderivative shrinks like $1/\\kappa$.',
        bounded: 'The mean: $(a\\cos\\kappa\\Phi)^2$ averages to $a^2/2$ exactly, whatever $\\kappa$ is. That mean is what cancels the slow residual.',
        fails: 'Bracketing can fail: a target stress outside the cone spanned by the two signed slots has no positive-amplitude solution.',
      },
      understand: `
<p>How can a wiggle cancel something smooth? Through the square. Navier–Stokes is quadratic in the velocity, and the square of a fast oscillation is not fast. Write the wave as a slow amplitude times a fast <span class="gloss" title="The rapidly oscillating factor of a wave, here cos κΦ with frequency κ; the Lean uses this name.">carrier</span>:</p>
<p>$$(a\\cos\\kappa\\Phi)^2 = \\tfrac{a^2}{2} + \\tfrac{a^2}{2}\\cos 2\\kappa\\Phi .$$</p>
<p>The first term is slow and can be shaped to cancel a slow residual; the second oscillates twice as fast and, after one integration, shrinks in proportion to one over the frequency. Raise the frequency in the scene and watch the dashed curve collapse while the mean does not move.</p>
<p>A velocity correction enters the equation through its <strong>stress</strong>, the averaged product of the wave with itself (its <span class="gloss" title="The average of the product of two wave components; for a wave with itself, the mean of its square.">covariance</span>), the quantity the construction controls. A square is never negative, so one wave can push the stress only one way. The Lean therefore uses two <em>signed slots</em> pushing to either side and requires the target to lie between them, the <span class="gloss" title="The target must lie inside the wedge (cone) spanned by the two slot directions; in the scene’s labels, |at| &lt; bm.">cone condition</span>; then both squared amplitudes come out positive.</p>
<p>This scene is the generic mechanism. The construction’s waves are far more structured.</p>`,
      inspect: `
<p>Let $w = a(x)\\cos(\\kappa\\Phi(x))$ with $a$ and $\\Phi$ slowly varying and $\\kappa$ large. The nonlinear term of Navier\u2013Stokes is quadratic, so what matters is $w\\otimes w$, whose scalar shadow is $w^2 = \\tfrac{a^2}{2} + \\tfrac{a^2}{2}\\cos 2\\kappa\\Phi$. The mean $\\tfrac{a^2}{2}$ is slow: choosing $a = \\sqrt{2R}$ cancels a nonnegative slow target $R$. The remainder is a pure oscillation; integrating it once against a slow function gains a factor $1/\\kappa$ (the scene computes $\\int_0^x$ of the leftover by the trapezoid rule and reports its maximum, which scales like $\\max(a^2/2)/(4\\pi\\kappa)$ for $\\Phi = 2\\pi x$). This is the sense in which a wave correction trades a slow error of size one for a fast error that is small after integration; the <em>linear</em> terms acting on the wave are what the particular and signed solves handle.</p>
<h3>The Lean\u2019s vocabulary</h3>
<p>The oscillatory factor is <code>HarmonicCalculus.carrier κ Φ x = exp(i κ Φ(x))</code>, with the docstring \u201c<code>κ = k*j</code> gives the carrier in the manuscript.\u201d The phase comes from the auxiliary graph $Y(r,t) = r^d\\,v_r + t\\,v_t$ (<code>GraphCalculus</code>, \u201cDefinition 8.1\u201d). Averages are taken on a torus cover with \u201cthe manuscript\u2019s real covering matrix $[[3,1],[1,5]]$\u201d; the exact average of a nonzero integer harmonic squared is $\\tfrac12$ (<code>angularMean_cos_sq_harmonic</code>), which is the identity above, and averaging $a(z)\\cos^2(j\\theta + \\text{phase}(z))$ over angle and unit square gives $\\tfrac12$ times the unit-square average of $a$ (<code>angular_cosine_covariance</code>; <code>primary_covariance_average</code> is \u201cthe displayed native prefactor in Lemma 8.7\u201d). Waves are indexed by labels $(n, \\text{grid}, \\text{sign})$ with dyadic scale $Q_n = 2^{-n}$, placed in rational slots (Lemma 8.3) with Gaussian slot cutoffs (\u00a78.2). The direct angular mean is \u201ccut as a vector field, separately from the potentials\u201d and vanishes on the axis.</p>
<h3>Bracketing</h3>
<p>From <code>Covariance.lean</code>: \u201cIn the orthonormal $(N,K)$ coordinates, the two normalized columns are $(-a,-b)$ and $(-a,b)$, with positive column scales. A target $(-m,t)$ lies strictly between them precisely when $|a\\,t| \\lt b\\,m$.\u201d Solving $s_-(-a,-b) + s_+(-a,b) = (-m,t)$ gives $s_\\pm = \\tfrac12(m/a \\pm t/b)$, both positive exactly under that condition; these are the squared wave amplitudes (<code>positive_primary</code>, \u201cunder the ratio condition stated in Section 8.3\u201d). The target itself is the chart stress $Q^{2A}\\sigma/\\varepsilon$ of \u201cSection 10.2\u201d (<code>SignedCovariance.chartStress</code>). The underlying cone inequality, \u201cthe square-root criterion and quadratic equivalence in Lemma 3.5 \u2026 the normalized factorization used in equation (11)\u201d, is <code>ConeAlgebra</code>.</p>
<details class="more"><summary>Why signed slots are needed at all</summary>
<p>The stress of a single wave is a square and cannot change sign. A target stress with either sign component therefore needs at least two waves whose covariance columns point to opposite sides of the target; the \u201csigned correction\u201d of each cycle adjusts exactly these two slots. The Lean file is explicit that \u201cthe actual integrated columns in the manuscript include approximation errors. This file does not identify those columns with the exact model.\u201d</p></details>`,
      stage: {
        need: 'A correction that cancels the slow residual of the base without producing a new slow error of the same size.',
        whyNot: 'A slow correction feeds back on itself through the nonlinearity at full size; its own residual would be no smaller than the one it removes.',
        ingredient: 'High-frequency waves: the nonlinearity turns them into a controllable mean stress plus faster oscillations that shrink by one over the frequency with each integration.',
        remaining: 'The actual waves live on a torus cover with many dyadic labels and Gaussian slot cutoffs; their estimates, and the ledger gains, are the bulk of the Lean.',
      },
      verify: {
        statements: [
          { title: 'Mean of the square (formula-derived; Lean, verbatim)', html: '<p>$(a\\cos\\kappa\\Phi)^2 = \\tfrac{a^2}{2} + \\tfrac{a^2}{2}\\cos 2\\kappa\\Phi$. The Lean version for integer harmonics:</p><pre>theorem angularMean_cos_sq_harmonic (j : ℤ) (hj : j ≠ 0) (phase : ℝ) :\n    SmoothLoop.angularMean (fun θ => Real.cos ((j : ℝ) * θ + phase) ^ 2) = 1 / 2\n\ntheorem angular_cosine_covariance (a phase : Plane → ℝ) (j : ℤ) (hj : j ≠ 0) :\n    squareAverage (fun z => SmoothLoop.angularMean\n      (fun θ => a z * Real.cos ((j : ℝ) * θ + phase z) ^ 2)) = (1 / 2) * squareAverage a</pre>' },
          { title: 'Bracketing (Lean docstring, verbatim)', html: '<p>\u201cIn the orthonormal <code>(N,K)</code> coordinates, the two normalized columns are <code>(-a,-b)</code> and <code>(-a,b)</code>, with positive column scales. A target <code>(-m,t)</code> lies strictly between them precisely when <code>|a*t| < b*m</code>.\u201d Solving the $2\\times2$ system: $s_+ = \\tfrac12(m/a + t/b)$, $s_- = \\tfrac12(m/a - t/b)$.</p>' },
          { title: 'Carrier (Lean, verbatim)', html: '<pre>/-- `κ = k*j` gives the carrier in the manuscript. -/\nnoncomputable def carrier (κ : ℝ) (Φ : E → ℝ) (x : E) : ℂ :=\n  Complex.exp (phaseFactor κ * (Φ x : ℂ))</pre>' },
        ],
        lean: [
          { decl: 'NavierStokes.HarmonicCalculus.carrier', file: 'NavierStokes/HarmonicCalculus.lean', line: 77, note: 'The oscillatory factor $e^{i\\kappa\\Phi}$; <code>phaseFactor κ = κ i</code> at line 68.' },
          { decl: 'NavierStokes.TorusAverages.angularMean_cos_sq_harmonic', file: 'NavierStokes/TorusAverages.lean', line: 627, note: 'Average of a squared nonzero integer harmonic is 1/2; <code>angular_cosine_covariance</code> at line 646; <code>primary_covariance_average</code> (line 656): \u201cThe displayed native prefactor in Lemma 8.7.\u201d' },
          { decl: 'NavierStokes.TorusAverages.covering', file: 'NavierStokes/TorusAverages.lean', line: 39, note: '\u201cThe manuscript\u2019s real covering matrix [[3,1],[1,5]].\u201d' },
          { decl: 'NavierStokes.Covariance.positive_primary', file: 'NavierStokes/Covariance.lean', line: 207, note: 'Positive squared amplitudes under the ratio condition; module docstring (lines 10\u201319) quoted above, citing Lemma 8.7 and equation (29).' },
          { decl: 'NavierStokes.ConeAlgebra.coneBound', file: 'NavierStokes/ConeAlgebra.lean', line: 17, note: 'Module docstring (lines 9\u201311): Lemma 3.5 and equation (11); <code>normalized_factorization</code> at line 101.' },
          { decl: 'NavierStokes.SignedCovariance.chartStress', file: 'NavierStokes/SignedCovariance.lean', line: 385, note: '\u201cSection 10.2\u2019s chart stress $Q^{2A}\\sigma/\\varepsilon$.\u201d' },
          { decl: 'NavierStokes.GraphCalculus (module docstring)', file: 'NavierStokes/GraphCalculus.lean', line: 10, module: true, note: '\u201cThe graph is $Y(r,t) = r^d\\,v_r + t\\,v_t$, as in Definition 8.1 of the candidate manuscript.\u201d (lines 10\u201311)' },
          { decl: 'NavierStokes.SlotGeometry (module docstring)', file: 'NavierStokes/SlotGeometry.lean', line: 15, module: true, note: '\u201cThis file constructs the rational centers required in Lemma 8.3 for the specific covering matrix J = [[3,1],[1,5]].\u201d (lines 15\u201316)' },
          { decl: 'NavierStokes.GaussianTailFlat (module docstring)', file: 'NavierStokes/GaussianTailFlat.lean', line: 10, module: true, note: '\u201cThe profile is a constructed smooth bump, with the plateau and support radii from Section 8.2.\u201d (lines 10\u201311)' },
          { decl: 'NavierStokes.SlotColoring.Label', file: 'NavierStokes/SlotColoring.lean', line: 31, note: 'Labels are $(n, \\text{grid}, \\text{sign})$: a dyadic scale index, a lattice position and a sign.' },
          { decl: 'NavierStokes.RadialModulation (module docstring)', file: 'NavierStokes/RadialModulation.lean', line: 18, module: true, note: '\u201cFrequencies are positive real numbers; hence the results apply in particular to positive integer frequencies.\u201d (lines 18\u201319)' },
          { decl: 'NavierStokes.MixedPeriodicAssembly.angularDiagonal_origin', file: 'NavierStokes/MixedPeriodicAssembly.lean', line: 379, note: 'The direct angular sum vanishes on the axis; module docstring (lines 7\u20138): direct angular means are cut \u201cseparately from the potentials.\u201d' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Lemma 8.7, equation (29), Section 8.3, Lemma 8.3, Section 8.2, Definition 8.1, Lemma 3.5, equation (11), Section 10.2 \u2014 all as cited in Lean docstrings', note: 'Numbering reported from the Lean docstrings only; the PDF was not read.' },
        ],
        limits: [
          'The scene is the generic mechanism in one variable with carrier cos(\u03ba\u03a6), \u03a6 = 2\u03c0x. Nothing on screen is one of the construction\u2019s waves.',
          'The actual wave solves are on a torus cover with many labels, with complex carriers e^{i\u03ba\u03a6}, Gaussian slot cutoffs and a separately cut angular mean; none of that is drawn.',
          'The Lean never gives a single closed formula for \u201cthe\u201d frequency: frequencies are per label and abstract. The slider \u03ba is illustrative.',
          'The cone panel uses the exact two-column model; the Lean notes that the real integrated columns carry approximation errors it does not identify with the model.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'the-force-is-the-residual',
      title: 'The force is the residual',
      question: 'Why does the force stay smooth through the singular time?',
      visual: { scene: 'force-smoothness', label: 'formula-derived', caption: 'Where the fields live, where the force lives, and how the force crosses t = 1 (hover the regions)', params: { initial: 'force' } },
      status: {
        changes: 'The velocity: switched on after $t = 3/8$, collapsing toward $(1, 0)$, unbounded as $t \\to 1$; nothing claimed afterwards.',
        bounded: 'Every derivative of the residual: zero in the limit at $(1, 0)$, smoothly extendable at every other terminal point.',
        fails: 'Nothing, by construction: $f$ equals the residual on $(0, 1)$, so the equation holds by definition. Content: the limits.',
      },
      understand: `
<p>Here is the definition that keeps the chapter honest. The force is not chosen and then matched; it is <strong>defined</strong> to be whatever the constructed velocity and pressure leave over, [[scene:concentration/not-yet-a-proof|the residual]] of chapter 1, at every time before the singular time one:</p>
<p>$$f := \\partial_t u + (u\\cdot\\nabla)u - \\Delta u + \\nabla p .$$</p>
<p>The equation then holds by definition, exactly as chapter 1 warned.</p>
<p>So what is proved? That this residual is smooth, including at the one point where the velocity is not. Approaching time one, the Lean shows two things: at the singular point every derivative of the residual tends to zero; at every other point of the final slice the residual extends smoothly from one side. These limits are the <span class="gloss" title="All derivatives up to a given order, taken at one point.">jets</span> of the force at time one. <span class="gloss" title="A classical way to build a smooth function with prescribed derivatives at one point.">Borel’s lemma</span> supplies a smooth function for later times with exactly these jets, and the force is glued across. It vanishes from time two on; in the whole-space case a further cutoff confines it to the time window 1/16 to 21/16 and to a cylinder. The flow starts from rest: velocity and pressure vanish up to time 3/8.</p>`,
      inspect: `
<p>The definition, from <code>CandidateFromLimits</code> (\u201cNo force is an input to this definition\u201d): take the time-switched fields, extend them by zero to negative times, form their residual on all of $t \\lt 1$ (<code>pastResidual</code>), fill in the terminal trace with the limit $L(x)(0)$ of the residual (<code>tracedResidual</code>), and set</p>
<p>$$f := \\mathtt{SpacetimeGluing.smoothExtension}\\;1\\;(\\mathtt{tracedResidual}\\;u\\;p\\;L).$$</p>
<p>The hypothesis <code>hlim</code> feeding this is the whole point: for every order $n$, $\\mathrm{iteratedFDeriv}\\,n$ of the residual converges locally uniformly to $L(x)(n)$ as $t \\to 1^-$. Then:</p>
<ul>
<li><code>force_eq_activated_residual</code>: for $0 \\le t \\lt 1$, $f(t,x) = R[\\chi_t u, \\chi_t p](t,x)$, where $\\chi_t$ is the time switch;</li>
<li><code>force_smooth</code>: $f \\in C^\\infty(\\R\\times\\R^3)$, by <code>smoothExtension_contDiff</code>;</li>
<li><code>force_zero_nonpos</code> and <code>force_zero_from</code>: $f = 0$ for $t \\le 0$ and for $t \\ge 2$.</li>
</ul>
<h3>Where the limits come from</h3>
<p>The limits $L = \\mathtt{boundaryLimits}$ are assembled from two facts about the diagonal sums. At the origin, <code>VanishingJointJets</code>: $\\forall n,\\ \\mathrm{iteratedFDeriv}\\,n\\,R \\to 0$ along $(t,x) \\to (1,0)$ with $t \\lt 1$. Away from it, <code>AwayExtensions</code>: for every $x \\ne 0$ there is a <code>OneSidedExtension</code>, \u201ca genuine smooth extension on a neighborhood, agreeing with the original function on the portion of that neighborhood with $t \\lt 1$.\u201d Compactness turns these local statements into locally uniform limits (<code>LocalJetBounds</code>). The vanishing jets are what the correction cycles deliver through the schedule (<code>SelectedSchedule</code>, previous scene); the away extensions come from the smoothness of the base and corrections off the axis.</p>
<h3>Gluing across $t = 1$</h3>
<p>Given the one-sided jets, <code>SpacetimeGluing.smoothExtension</code> joins \u201cthe closed-past field to the Taylor\u2013Borel realization of its actual normal jets\u201d (<code>SpatialBorelExtension.rightExtension</code>). This is Borel\u2019s lemma: any sequence of jets is the Taylor series of some smooth function. The glued function is smooth because its one-sided derivatives of every order agree at $t = 1$.</p>
<h3>Switching on, cutting off</h3>
<p>The fields are multiplied by <code>timeSwitch t = 1 − cutoff((4/3) t)</code>, zero for $|t| \\le 3/8$ and one for $t \\ge 3/4$; this gives zero initial data and is \u201cthe time-switch portion of Proposition 11.4.\u201d The activated residual is $\\chi R + \\chi' u + (\\chi^2 - \\chi)(u\\cdot\\nabla)u$, smooth because $u$ is smooth for $t \\lt 1$. In the whole-space theorem the extended force is further multiplied by <code>timeCutoff t = cutoff((8/5)(t − 11/16))</code>, one on $[3/8, 1]$ and supported in $[1/16, 21/16]$, and by an outer spatial cutoff; since the residual already vanishes for $t \\lt 3/8$, the equation is preserved (<code>ActualCandidate.of_localized_fields</code>), and <code>force_tsupport_subset</code> gives $\\mathrm{supp} f \\subseteq [1/16, 21/16]\\times 2K$.</p>
<details class="more"><summary>What \u201csmooth\u201d means here</summary>
<p>$C^\\infty$ in the <code>ContDiff</code> scope means all finite orders of differentiability, not analyticity: \u201cThe <code>ContDiff</code> scope\u2019s $\\infty$ means all finite differentiability orders. In this Mathlib version $\\top$ would instead impose the stronger analytic order.\u201d The comparator\u2019s decay conditions are then derived from compact support (<code>forceConditionDecay_of_compact</code>).</p></details>`,
      stage: {
        need: 'A force that is smooth on all of space-time, compactly supported in strictly positive time, and equal to the residual before the singular time.',
        whyNot: 'The corrections control the residual only before time one. A function defined only before time one, however good, is not yet smooth across it.',
        ingredient: 'Limits of all residual derivatives at time one (vanishing jets at the origin, one-sided extensions elsewhere), the Taylor–Borel gluing, then time and outer cutoffs.',
        remaining: 'That the velocity has compact support and bounded energy, that no other solution exists, and that every viscosity is covered.',
      },
      verify: {
        statements: [
          { title: 'The force (Lean, verbatim)', html: '<pre>/-- The specified force: glue the traced past residual to the Taylor--Borel\nseries of its actual normal jets. No force is an input to this definition. -/\ndef force : VelocityField :=\n  SpacetimeGluing.smoothExtension 1 (tracedResidual u p L)\n    (tracedResidual_smooth u p hu hp L hlim)\n\ntheorem force_smooth : ContDiff ℝ ∞ (force u p hu hp L hlim)\n\ntheorem force_eq_activated_residual {t : ℝ} (ht0 : 0 ≤ t) (ht1 : t < 1) (x : Space) :\n    force u p hu hp L hlim (t, x) =\n      navierStokesResidual (activatedVelocity u) (activatedPressure p) t x\n\ntheorem force_zero_from {t : ℝ} (ht : 2 ≤ t) (x : Space) : force u p hu hp L hlim (t, x) = 0\ntheorem force_zero_nonpos {t : ℝ} (ht : t ≤ 0) (x : Space) : force u p hu hp L hlim (t, x) = 0</pre>' },
          { title: 'The two residual-limit notions (Lean, verbatim)', html: '<pre>def AwayExtensions (f : SpaceTime → V) : Prop :=\n  ∀ x : Space, x ≠ 0 → Nonempty (OneSidedExtension f x)\n\ndef VanishingJointJets (f : SpaceTime → V) : Prop :=\n  ∀ n : ℕ, Tendsto (iteratedFDeriv ℝ n f)\n    (𝓝[SpacetimeEndpoint.openPast 1] ((1 : ℝ), (0 : Space))) (𝓝 0)</pre>' },
          { title: 'Time support (Lean, verbatim)', html: '<pre>/-- Zero near time zero, and one for every time at least `3/4`. -/\ndef timeSwitch (t : ℝ) : ℝ := 1 - scaledCutoff (4 / 3) t\n\ndef timeCutoff (t : ℝ) : ℝ :=\n  NavierStokes.SmoothCutoffs.cutoff ((8 / 5 : ℝ) * (t - 11 / 16))\n\ntheorem force_tsupport_subset {f : VelocityField} {K : Set Space}\n    (hK : IsCompact K) (hf : ∀ t x, x ∉ K → f (t, x) = 0) :\n    tsupport (force f) ⊆ Icc (1 / 16 : ℝ) (21 / 16) ×ˢ K</pre><p>Since <code>cutoff</code> is one on $|x| \\le 1/2$ and zero on $|x| \\ge 1$: the switch is zero for $|t| \\le 3/8$ and one for $t \\ge 3/4$; the force cutoff is one on $[3/8, 1]$ and zero outside $[1/16, 21/16]$.</p>' },
        ],
        lean: [
          { decl: 'NavierStokes.CandidateFromLimits.force', file: 'NavierStokes/CandidateFromLimits.lean', line: 82, note: '<code>tracedResidual</code> at line 28; <code>force_smooth</code> 86; <code>force_eq_activated_residual</code> 108; <code>force_zero_from</code> 114; <code>force_zero_nonpos</code> 119. Module docstring: \u201cThe force is the explicit Taylor\u2013Borel extension of the traced residual of the activated, zero-extended fields.\u201d' },
          { decl: 'NavierStokes.PastExtension.pastResidual', file: 'NavierStokes/PastExtension.lean', line: 217, note: '\u201cThe force used by the endpoint theorem is the actual residual of the new fields on the entire open past, including negative times.\u201d' },
          { decl: 'NavierStokes.JointResidualLimits.VanishingJointJets', file: 'NavierStokes/JointResidualLimits.lean', line: 84, note: '<code>AwayExtensions</code> at line 81; <code>OneSidedExtension</code> at line 73.' },
          { decl: 'NavierStokes.SpacetimeGluing.smoothExtension', file: 'NavierStokes/SpacetimeGluing.lean', line: 339, note: '\u201cJoin the closed-past field to the Taylor\u2013Borel realization of its actual normal jets.\u201d <code>smoothExtension_contDiff</code> at line 344.' },
          { decl: 'NavierStokes.SpacetimeEndpoint (module docstring)', file: 'NavierStokes/SpacetimeEndpoint.lean', line: 7, module: true, note: '\u201cJoint spacetime endpoint regularity from locally uniform derivative limits. \u2026 Closed-side smoothness is proved from these data, rather than included as a hypothesis.\u201d (lines 7\u201312)' },
          { decl: 'NavierStokes.LocalJetBounds (module docstring)', file: 'NavierStokes/LocalJetBounds.lean', line: 9, module: true, note: '\u201cActual smooth extensions at each nonsingular terminal point provide compatible limits of every derivative. Compactness turns those local bounds into one bound on any compact spacetime set avoiding the singular point.\u201d (lines 9\u201311)' },
          { decl: 'NavierStokes.MixedPeriodicAssembly.exists_candidate_force', file: 'NavierStokes/MixedPeriodicAssembly.lean', line: 338, note: 'Builds the force from the away extensions and the vanishing joint jets of the three sums.' },
          { decl: 'NavierStokes.SmoothCutoffs.timeSwitch', file: 'NavierStokes/SmoothCutoffs.lean', line: 246, note: '\u201cZero near time zero, and one for every time at least 3/4.\u201d' },
          { decl: 'NavierStokes.TimeLocalization.activated_residual_formula', file: 'NavierStokes/TimeLocalization.lean', line: 128, note: '\u201cExact residual of the constructed activation: $\\chi R + \\chi\' u + (\\chi^2 - \\chi)(u\\cdot\\nabla)u$.\u201d <code>activatedVelocity</code> at line 27; module docstring: \u201cthe time-switch portion of Proposition 11.4.\u201d' },
          { decl: 'NavierStokesR3.PositiveTimeForce.force', file: 'NavierStokes/R3/PositiveTimeForce.lean', line: 46, note: '<code>timeCutoff</code> at line 21; <code>timeCutoff_eq_one</code> 28; <code>timeCutoff_eq_zero</code> 34; <code>force_tsupport_subset</code> 61.' },
          { decl: 'NavierStokesR3.ActualCandidate.of_localized_fields', file: 'NavierStokes/R3/ActualCandidate.lean', line: 78, note: 'The early residual is zero (t < 3/8), so the time cutoff preserves the equation (lines 90\u2013102); <code>selected_candidate_one_with_initial_rest</code> at line 143.' },
          { decl: 'NavierStokesR3.theorem_1_1_with_initial_rest', file: 'NavierStokes/R3/Theorem.lean', line: 26, note: '$u(t,x) = 0$ and $p(t,x) = 0$ for $|t| \\le 3/8$, for every \u03bd > 0.' },
          { decl: 'NavierStokesR3.ProblemStatement.CompactPositiveTimeSupport', file: 'NavierStokes/R3/ProblemStatement.lean', line: 66, note: 'Compact spacetime support inside t > 0; module docstring (lines 14\u201317): \u201cthe zero extension of an element of $C_c^\\infty(\\R^3\\times(0,\\infty);\\R^3)$.\u201d <code>force_smooth : ContDiff ℝ ∞ f</code> at line 101.' },
          { decl: 'NavierStokes.ProblemStatement.CompactFutureTimeSupport', file: 'NavierStokes/ProblemStatement.lean', line: 89, note: 'Periodic case: a common T with f = 0 for t \u2265 T; here T = 2.' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Proposition 11.4 (time switch), as cited in the TimeLocalization docstring', note: 'Numbering from the Lean docstring only.' },
        ],
        context: [
          { src: 'borel-lemma', note: 'The classical lemma realized by SpatialBorelExtension: any sequence of jets is the Taylor series of a smooth function.' },
          { src: 'mathlib-bump', note: 'All cutoffs are a Mathlib ContDiffBump with inner radius 1/2 and outer radius 1; the scene draws its ramp with Mathlib\u2019s smoothTransition.' },
        ],
        limits: [
          'The shaded collapsing core inside the velocity box is schematic. Only the support boxes, the switch values and the time intervals are computed.',
          'The residual is not computed. The scene shows where its limits are taken, not their values.',
          'Only the plateau and support values of the cutoffs enter the Lean statements; the drawn ramp shape is Mathlib\u2019s bump, which the Lean never evaluates numerically.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'localize-and-bound-the-energy',
      title: 'Localize, then bound the energy',
      question: 'How is the solution confined so that its energy stays bounded?',
      visual: { scene: 'localization', label: 'formula-derived', caption: 'The spatial cutoff on the potential (left) and the Gr\u00f6nwall envelope of the energy (right)', params: { C: 1 } },
      status: {
        changes: 'Outside the plateau the fields are cut: $\\chi(x)$ multiplies the potential before the curl; then periodized or kept compact.',
        bounded: 'The $L^2$ norm of the velocity: $\\|u(t)\\|^2 \\le C\\,e$ on $[0,1)$, hence kinetic energy $\\le \\tfrac12 Ce$, where $C$ bounds $\\|f(t)\\|^2$.',
        fails: 'Nothing new: the cut fields keep their residual-jet limits, since every cutoff is one on the plateau around the singularity.',
      },
      understand: `
<p>Energy is an integral over all of space, so before measuring it the construction confines the fields. A fixed cutoff function vanishes outside a cylinder around the origin and is identically one inside a smaller one: the <em>plateau</em>, the region where the cutoff equals one, which contains the core. It multiplies the <em>potential</em> before the curl is taken, so the cut velocity is still divergence-free; the direct angular field and the pressure are cut directly. Whatever the cutoff spoils is, once more, simply added to the force.</p>
<p>With compact support the energy identity closes: the energy changes at a rate equal to minus the dissipation plus the work done by the force, and that work is at most the energy itself plus a constant C bounding the squared <span class="gloss" title="The square root of the integral of the squared magnitude over space; for a velocity, the square root of twice the kinetic energy.">L² norm</span> of the force. <span class="gloss" title="A standard inequality that turns a growth bound into a bound on the solution.">Grönwall’s inequality</span> then gives</p>
<p>$$\\|u(t)\\|^2 \\le C\\,e \\qquad \\text{for all } t \\lt 1,$$</p>
<p>however wild the velocity becomes near the origin. That is the whole-space energy bound the theorem needs.</p>
<p>The periodic theorem instead sums the cut fields over the integer lattice; it needs no energy bound at all, only periodicity.</p>`,
      inspect: `
<p>From <code>SpatialLocalization</code>: \u201cThe fixed cutoff is a smooth function of $x_0^2 + x_1^2$ and $x_2$. It is one on an open cylinder containing the origin and has support strictly inside a unit period cube. We multiply the potential before taking any curl, and periodize the resulting potential by the actual locally finite lattice sum. The pressure is cut and periodized as a scalar.\u201d Concretely</p>
<p>$$\\chi(x) = \\mathrm{cutoff}(16\\,r^2)\\,\\mathrm{cutoff}(4x_2),\\qquad \\text{plateau } \\{r^2 \\lt \\tfrac1{32},\\ |x_2| \\lt \\tfrac18\\},\\qquad K = \\{r^2 \\le \\tfrac1{16},\\ |x_2| \\le \\tfrac14\\},$$</p>
<p>and the final whole-space fields are</p>
<p>$$u = \\chi_t(t)\\,\\big(\\nabla\\times(\\chi A) + \\chi B\\big), \\qquad p = \\chi_t(t)\\,\\chi\\, P, \\qquad f = \\mathrm{timeCutoff}\\cdot\\mathrm{outerCutoff}\\cdot f_{\\mathrm{ext}},$$</p>
<p>with $\\mathrm{outerCutoff}(x) = \\chi(x/2)$, supported in $2K$. The cut velocity is a curl, hence divergence-free. Inside the plateau and for $t \\ge 3/4$ nothing has changed: <code>localized_eq_raw</code> says the localized velocity equals the raw one there, so the axis blowup and the vanishing residual jets at $(1,0)$ survive. Off the plateau the cutoff derivatives are smooth and bounded on compact sets avoiding the singular point, so the away extensions survive too. The cutoffs need not be small: the force absorbs whatever they produce.</p>
<h3>The energy bound</h3>
<p>For a compactly supported smooth solution of $R[u,p] = f$ on $\\R^3$, <code>energy_balance</code> is exact:</p>
<p>$$\\frac{\\dd}{\\dd t}\\int|u|^2 = -2\\sum_i\\int|\\partial_i u|^2 + 2\\int \\langle u, f\\rangle .$$</p>
<p>Dropping the dissipation and applying Young\u2019s inequality $2\\langle u,f\\rangle \\le |u|^2 + |f|^2$ gives $E' \\le E + C$ with $E = \\|u(t)\\|_{L^2}^2$ and $C \\ge \\sup_{t\\in[0,1]}\\|f(t)\\|_{L^2}^2$, which exists because $f$ is smooth with compact support (<code>CompactForceBound.exists_uniform_l2sq_bound</code>). With $E(0) = 0$ the Gr\u00f6nwall lemma <code>forced_gronwall_uniform</code> yields $E(t) \\le C\\,e$ on $[0,1)$, and <code>uniform_finite_energy</code> records the kinetic energy bound $\\tfrac12 C\\,e$, together with square-integrability at every time, proved separately \u201cso that the totalized integral cannot hide infinite energy\u201d (<code>CandidateProperties.uniform_l2_sq_bound</code>). The scene plots the envelope $C(e^t - 1) \\le Ce$; the actual $E(t)$ is not computed.</p>
<details class="more"><summary>The sharper statement (Lemma 10.4 as cited)</summary>
<p><code>IntegratedDissipation.candidate_energy_estimates</code> keeps the dissipation: for every $T \\lt 1$, $\\|u(T)\\|^2 + 2\\nu\\int_0^T \\mathrm{dissipation} \\le (\\int_0^T\\|f\\|_{L^2})^2$, and the total dissipation up to time one is finite. Its docstring calls this \u201cthe complete energy conclusions of Lemma 10.4.\u201d</p></details>
<details class="more"><summary>The periodic case: periodize and compress</summary>
<p>For the torus, the cut potential is summed over integer translates, <code>periodize f z = \u2211\' n, f (z.1, z.2 \u2212 n)</code>, a locally finite sum because the support lies strictly inside the unit cube. The periodic corollary first compresses the whole-space candidate so that all supports fit in the quarter cube $|x_i| \\le 1/4$: <code>pull a l g z = a \u2022 g (clock l z.1, l \u2022 z.2)</code> with the affine clock $l^2(t-1)+1$, which \u201csends time one to itself,\u201d and amplitudes $l$, $l^2$, $l^3$ for velocity, pressure and force. The periodic competitor class has \u201cno energy or pressure normalization,\u201d so no energy bound is needed there.</p></details>`,
      stage: {
        need: 'Compact spatial support and one uniform bound for the kinetic energy before time one, as <code>CandidateProperties</code> on the whole space demands.',
        whyNot: 'The raw fields are defined on all of space with no decay statement; their energy is not even known to be finite.',
        ingredient: 'The cutoff on the potential (divergence preserved), the exact energy balance for compactly supported fields, Young’s inequality and Grönwall’s lemma.',
        remaining: 'That no competing global solution exists, that the blowup survives the cutoffs, and that every viscosity follows from viscosity one.',
      },
      verify: {
        statements: [
          { title: 'Cutoff, cylinder, plateau (Lean, verbatim)', html: '<pre>noncomputable def cutoffProfile (p : ℝ × ℝ) : ℝ :=\n  SmoothCutoffs.cutoff (16 * p.1) * SmoothCutoffs.cutoff (4 * p.2)\nnoncomputable def spatialCutoff (x : Space) : ℝ := cutoffProfile (radialSquare x, x 2)\n/-- The closed support cylinder has radius `1/4` and height `1/2`. -/\nnoncomputable def supportCylinder : Set Space := {x | radialSquare x ≤ 1 / 16 ∧ |x 2| ≤ 1 / 4}\n/-- An open cylinder on which the cutoff is identically one. -/\nnoncomputable def plateau : Set Space := {x | radialSquare x < 1 / 32 ∧ |x 2| < 1 / 8}\n/-- Multiplication of the actual Cartesian potential, before any curl. -/\nnoncomputable def cutPotential (A : VelocityField) : VelocityField := fun z => spatialCutoff z.2 • A z\nnoncomputable def cutVelocity (A : VelocityField) : VelocityField := SpatialCurl.spatialCurl (cutPotential A)</pre>' },
          { title: 'Energy balance and uniform bound (Lean, verbatim)', html: '<pre>/-- The exact forced Navier--Stokes energy balance on all of Euclidean space. -/\ntheorem energy_balance … (hcu : HasCompactSupport (fun x : Space => u (t, x)))\n    (hdiv : ∀ x, spatialDivergence u t x = 0) (hNS : ∀ x, navierStokesResidual u p t x = f (t, x)) :\n    energyRate u t = -2 * dissipation u t + 2 * ∫ x, ⟪u (t, x), f (t, x)⟫_ℝ\n\ntheorem uniform_finite_energy … (hsupp : ∀ t ∈ Ico (0 : ℝ) 1, tsupport (fun x => u (t, x)) ⊆ K)\n    (hf : ContDiff ℝ ∞ f) (hcf : HasCompactSupport f) (hinitial : ∀ x : Space, u (0, x) = 0) … :\n    ProblemStatement.UniformFiniteEnergy (Ico (0 : ℝ) 1) u</pre><p>The proof (lines 353\u2013380) produces the bound $E = \\tfrac12\\,(C\\cdot\\exp 1)$ with $C$ from <code>exists_uniform_l2sq_bound</code>.</p>' },
          { title: 'Envelope (formula-derived)', html: '<p>If $E\' \\le E + C$ on $[0,1)$ and $E(0) = 0$ then $E(t) \\le C(e^t - 1) \\lt C\\,e$. The scene plots this envelope; it is an upper bound, not the solution\u2019s energy.</p>' },
        ],
        lean: [
          { decl: 'NavierStokes.SpatialLocalization.spatialCutoff', file: 'NavierStokes/SpatialLocalization.lean', line: 49, note: '<code>cutoffProfile</code> line 41; <code>supportCylinder</code> 72; <code>plateau</code> 134; <code>cutPotential</code> 165; <code>cutVelocity</code> 171; module docstring lines 10\u201314 quoted above.' },
          { decl: 'NavierStokes.R3CompactCandidate.velocity', file: 'NavierStokes/R3CompactCandidate.lean', line: 201, note: '$\\chi_t(\\nabla\\times(\\chi A) + \\chi B)$; <code>pressure</code> 204; <code>outerCutoff</code> 39; <code>compactForce</code> 88; module docstring (lines 7\u201311): \u201cA second, larger cutoff applied to the already extended smooth force gives a force on \u211d\u00b3 with compact spatial support.\u201d' },
          { decl: 'NavierStokes.MixedPeriodicAssembly.cutVelocity', file: 'NavierStokes/MixedPeriodicAssembly.lean', line: 32, note: '\u201cSpatial localization keeps every potential-cutoff derivative.\u201d The direct angular field is cut as a vector (docstring lines 7\u201312).' },
          { decl: 'NavierStokes.LocalAngularGrowth.localized_eq_raw', file: 'NavierStokes/LocalAngularGrowth.lean', line: 60, note: 'For t \u2265 3/4 and x in the plateau the localized velocity equals the raw one.' },
          { decl: 'NavierStokes.TimeLocalization.activated_residual_formula', file: 'NavierStokes/TimeLocalization.lean', line: 128, note: 'The time-cutoff terms of the residual, all absorbed into the force.' },
          { decl: 'NavierStokes.PeriodicLocalization.periodize', file: 'NavierStokes/PeriodicLocalization.lean', line: 62, note: '\u201cThe actual lattice sum, rather than an assumed periodic extension.\u201d' },
          { decl: 'NavierStokesR3.CompactEnergy.energy_balance', file: 'NavierStokes/R3/CompactEnergy.lean', line: 202, note: '<code>l2Sq</code> 190; <code>dissipation</code> 195; <code>energy_rate_le</code> 253; <code>uniform_finite_energy</code> 343 (kinetic bound \u00bd\u00b7C\u00b7exp 1 at line 354).' },
          { decl: 'NavierStokesR3.ScalarEnergyBound.forced_gronwall_uniform', file: 'NavierStokes/R3/ScalarEnergyBound.lean', line: 66, note: 'The scalar Gr\u00f6nwall step with integrating factor.' },
          { decl: 'NavierStokesR3.CompactForceBound.exists_uniform_l2sq_bound', file: 'NavierStokes/R3/CompactForceBound.lean', line: 25, note: 'The uniform $L^2$ bound $C$ on the force, from smoothness and compact support.' },
          { decl: 'NavierStokesR3.ProblemStatement.UniformFiniteEnergy', file: 'NavierStokes/R3/ProblemStatement.lean', line: 81, note: 'Square-integrability at every time plus one bound on <code>kineticEnergy</code> (line 76).' },
          { decl: 'NavierStokesR3.CompactEnergy.candidate_energy_estimates', file: 'NavierStokes/R3/IntegratedDissipation.lean', line: 279, note: '\u201cThe complete energy conclusions of Lemma 10.4 for one paper candidate.\u201d' },
          { decl: 'NavierStokesR3.ProblemStatement.CandidateProperties.uniform_l2_sq_bound', file: 'NavierStokes/R3/CandidateBreakdown.lean', line: 66, note: 'Docstring (lines 64\u201365): \u201cOne bound for the actual spatial square integrals, with integrability proved separately so that the totalized integral cannot hide infinite energy.\u201d' },
          { decl: 'NavierStokesR3.ParabolicScaling.clock', file: 'NavierStokes/R3/ParabolicDefinitions.lean', line: 11, note: '\u201cThe affine clock sends time one to itself and starts at 1\u2212l\u207b\u00b2.\u201d <code>pull</code> at line 14; velocity/pressure/force amplitudes $l, l^2, l^3$ (lines 17\u201324).' },
          { decl: 'NavierStokes.PeriodicPaper.exists_compression_scale', file: 'NavierStokes/PeriodicPaperScalingSupport.lean', line: 82, note: 'One l > 1 puts velocity, pressure and force supports in the quarter cube |x\u1d62| \u2264 1/4.' },
          { decl: 'NavierStokes.PeriodicPaper.GlobalSmoothSolution', file: 'NavierStokes/PeriodicPaperTheorem.lean', line: 51, note: '\u201cNo energy or pressure normalization is required\u201d for the periodic competitor (docstring lines 49\u201350).' },
          { decl: 'NavierStokesR3.WholeSpaceUniqueness.classical_uniqueness_on_Icc', file: 'NavierStokes/R3/WholeSpaceUniqueness.lean', line: 30, note: 'Docstring (lines 28\u201329): \u201cFinite energy of the reference velocity is a consequence of its compact spatial support.\u201d' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Lemma 10.4 (energy and dissipation), as cited in the IntegratedDissipation docstring', note: 'Numbering from the Lean docstring only.' },
        ],
        context: [
          { src: 'gronwall', note: 'The differential inequality E\u2032 \u2264 E + C with E(0) = 0 gives E(t) \u2264 C(e^t \u2212 1).' },
        ],
        limits: [
          'The energy chart is an envelope. The actual energy of the constructed solution is not computed anywhere on this site.',
          'The cutoff heat map uses Mathlib\u2019s bump shape for the ramp; the Lean uses only its plateau and support values.',
          'The scene shows the slice x\u2081 = 0 of an axisymmetric cutoff; the lattice copies are drawn for |n|, |m| \u2264 1 only.',
        ],
      },
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'from-one-solution-to-no-solution',
      title: 'From one solution to no solution',
      question: 'How does one blowing-up solution rule out every global one?',
      visual: {
        scene: 'breakdown-logic', label: 'schematic', caption: 'The non-existence argument, step by step, with the Lean declaration that carries each step',
        params: {
          initial: 0,
          note: '<b>Schematic.</b> The logical shape of the argument. Each step names the Lean declaration that carries it; the verify tab gives file and line.',
          steps: [
            { title: 'The base speeds up on the axis', kind: 'ns', text: '$\\|u_{\\mathrm{base}}(t,0)\\| = j\\,(1-t)^{-(1/2+h)} \\to \\infty$ as $t \\to 1^-$.', detail: '<p><code>FinalSlowBase.origin</code> gives the exact axis value $((1-t)^{-A} j)\\,e_2$ and <code>axis_tendsto</code> its divergence, using <code>BlowupImplication.negative_power_tendsto_atTop</code> (the docstring calls this \u201cthe terminal inference of Proposition 11.7\u201d).</p>' },
            { title: 'The corrections do not touch the axis', kind: 'ok', text: 'Every correction stage vanishes on a neighbourhood of each axis point before time one; the direct angular sum is zero on the axis.', detail: '<p><code>AxisPreservation</code>: \u201cActual physical wave sums vanish on a neighborhood of each preterminal axis point \u2026 therefore preserves the zeroth potential\u2019s curl.\u201d Hence <code>GermCandidateAssembly.origin_blowup</code> and <code>LocalScheduleWitness.selected_origin_blowup</code>: the full assembled velocity still has $\\|u(t,0)\\| \\to \\infty$.</p>' },
            { title: 'Localization keeps the origin value', kind: 'ok', text: 'The cutoffs are one on the plateau and the time switch is one for $t \\ge 3/4$, so the final fields inherit <code>SpeedUnboundedAtOne</code>; the $H^3$ norm is unbounded too.', arrow: 'the constructed candidate', detail: '<p><code>localized_eq_raw</code> and <code>NaturalCore.speedUnbounded_of_axis_tendsto</code> turn the axis limit into the quantified statement $\\forall M, \\delta\\ \\exists t \\in (1-\\delta, 1), x:\\ M \\lt \\|u(t,x)\\|$. <code>H3Blowup.candidate_h3Norm_unbounded</code> (whole space) and <code>PeriodicSobolev.candidate_derivativeH3_unbounded</code> (torus, via $\\|f\\|_\\infty \\le 3\\,\\|f\\|_{\\dot H^3}$) give the Sobolev form.</p>' },
            { title: 'Suppose a global smooth solution $v$ existed', kind: 'meta', text: 'Same force $f$, same zero initial datum, in the class of the theorem: smooth, divergence-free, with uniformly finite energy on $\\R^3$ (or periodic on the torus).', detail: '<p>This is <code>GlobalFiniteEnergySolution ν f</code> (whole space) or <code>GlobalSmoothSolution ν f</code> (torus). The docstrings stress how little is assumed: \u201cThere are no support, periodicity, pressure-growth, derivative-growth, or energy inequality assumptions on a competitor\u201d; for the torus, \u201cNo kinetic-energy assumption is imposed on the competitor.\u201d</p>' },
            { title: 'Uniqueness before time one: $v = u$ on $[0,1)$', kind: 'ns', text: 'Two solutions in the class with the same data and force coincide on every $[0,T]$, $T \\lt 1$.', arrow: 'uniqueness', detail: '<p>Whole space: <code>WholeSpaceUniqueness.candidate_global_agrees_before_one</code>, built on <code>classical_uniqueness_on_Icc</code> (pressure recovery, a pressure-flux bound and a Gr\u00f6nwall closure; the reference field has compact support, the competitor only finite energy). Torus: <code>PeriodicViscosityUniqueness.classical_uniqueness_on_Icc</code>.</p>' },
            { title: 'Contradiction on the compact set $[0,1]\\times K$', kind: 'bad', text: '$v$ is continuous on $[0,1]\\times K$, hence bounded there; but $v = u$ on $[0,1)\\times K$ and $u$ is unbounded there.', detail: '<p><code>CandidateProperties.not_global_agreement</code>: a continuous $v$ on the compact set $[0,1]\\times K$ has a bound $M$; <code>speed_unbounded</code> produces $(t,x)$ with $t \\lt 1$, $x \\in K$ and $\\|u(t,x)\\| \\gt M$; agreement gives the contradiction. <code>no_global_solution_one</code> packages this; the torus analogue is <code>MaximalLifespan.unbounded_excludes_continuous_extension</code> inside <code>PeriodicViscosity.excludes_global_solution</code>.</p>' },
            { title: 'Every viscosity, by dilation', kind: 'ok', text: '$\\sqrt{\\nu}\\,u(t, x/\\sqrt{\\nu})$, $\\nu\\,p(t, x/\\sqrt{\\nu})$, $\\sqrt{\\nu}\\,f(t, x/\\sqrt{\\nu})$ solve the equation with viscosity $\\nu$ and the same singular time $1$.', arrow: 'spatial scaling', detail: '<p><code>ViscosityScaling.rescale_residual</code>: \u201cMultiplying lengths and velocities by $a$ multiplies viscosity by $a^2$.\u201d <code>candidate_at_viscosity</code> transports every candidate property, and <code>normalized_global_solution</code> pulls a hypothetical $\\nu$-competitor back to viscosity one. This is one construction dilated, not a family or a limit; <code>theorem_1_1</code> is the result for all $\\nu \\gt 0$.</p>' },
            { title: 'The periodic corollary, and the maximal lifespan', kind: 'meta', text: 'Compress the whole-space fields into the quarter cube, sum over the lattice, and exclude periodic competitors by periodic uniqueness. The classical lifespan is exactly one.', detail: '<p><code>PeriodicPaper.periodic_corollary</code> (\u201cCorollary 10.6\u201d per formalization.yaml) uses <code>exists_compression_scale</code> and <code>of_compact_candidate</code>; <code>MaximalLifespan.candidate_is_maximal</code> and <code>theorem_1_1_with_maximalH3</code> show that solutions exist on $[0,T]$ exactly for $T \\in (0,1]$.</p>' },
          ],
        },
      },
      status: {
        changes: 'The axis speed $j(1-t)^{-(1/2+h)} \\to \\infty$ survives corrections, cutoffs and dilation; so does the $H^3$ (three-derivative Sobolev) norm.',
        bounded: 'Any hypothetical global smooth solution: continuous, hence bounded, on the compact set $[0,1]\\times K$.',
        fails: 'The hypothesis: no global smooth finite-energy ($\\R^3$) or smooth periodic (torus) solution for this force and zero data.',
      },
      understand: `
<p>The theorem is a <strong>non-existence</strong> statement, reached by contradiction through uniqueness. The constructed solution is smooth before time one, starts from rest, and its speed is unbounded approaching time one: the axis speed of the self-similar vortex survives the corrections, which vanish near the axis, and the cutoffs, which are one there. Its <span class="gloss" title="A norm that measures a function together with its derivatives; H³ counts derivatives up to order three.">Sobolev norm</span> $H^3$ is unbounded too.</p>
<p>Suppose a global smooth solution existed for the same force and zero data, in the theorem’s class: finite energy on the whole space, or periodic on the torus. Uniqueness in that class forces it to coincide with the constructed solution before time one. But it is continuous on a closed, bounded block of space-time, hence bounded there; the constructed solution is not. Contradiction.</p>
<p>Every viscosity follows from viscosity one by a spatial dilation, not a limit: $\\sqrt{\\nu}\\,u(t, x/\\sqrt{\\nu})$ solves the equation with viscosity ν and the same singular time. The periodic corollary compresses the whole-space fields into a quarter cube and sums over the lattice. That is why the solution class in [[scene:concentration/what-is-claimed|the statement]] matters: uniqueness holds inside it.</p>`,
      inspect: `
<p>The whole-space chain, with the Lean names:</p>
<ol>
<li><strong>Blowup of the candidate.</strong> <code>FinalSlowBase.axis_tendsto</code> gives $\\|u_{\\mathrm{base}}(t,0)\\| \\to \\infty$. <code>AxisPreservation</code> and <code>GermCandidateAssembly.origin_blowup</code> show the corrected sum has the same axis limit; <code>localized_eq_raw</code> shows localization does not change it; <code>NaturalCore.speedUnbounded_of_axis_tendsto</code> converts the limit into <code>SpeedUnboundedAtOne</code>: for every $M, \\delta \\gt 0$ there are $t \\in (1-\\delta, 1)$ and $x$ with $\\|u(t,x)\\| \\gt M$.</li>
<li><strong>Uniqueness.</strong> <code>candidate_global_agrees_before_one</code>: any <code>GlobalFiniteEnergySolution 1 f</code> agrees with $u$ on $[0,1)\\times\\R^3$. The comparison needs only smoothness and the uniform energy bound of the competitor; the reference field\u2019s compact support supplies its own finite energy and the pressure-flux control.</li>
<li><strong>Contradiction.</strong> <code>not_global_agreement</code>: a smooth global $v$ is bounded on $[0,1]\\times K$, while $u = v$ is unbounded inside $K$. Hence <code>no_global_solution_one</code>.</li>
<li><strong>Every viscosity.</strong> With $u_\\nu = \\sqrt{\\nu}\\,u(t,x/\\sqrt{\\nu})$, $p_\\nu = \\nu\\,p(t,x/\\sqrt{\\nu})$, $f_\\nu = \\sqrt{\\nu}\\,f(t,x/\\sqrt{\\nu})$ one has $R_\\nu[u_\\nu, p_\\nu](t,x) = \\sqrt{\\nu}\\,R_1[u,p](t, x/\\sqrt{\\nu}) = f_\\nu(t,x)$ (<code>rescale_residual</code> with $a = \\sqrt\\nu$). The singular time, the rest interval $|t| \\le 3/8$ and the positive-time support of the force are unchanged; the support becomes $\\sqrt{\\nu}K$ (<code>candidate_at_viscosity</code>). A global competitor at viscosity $\\nu$ rescales to one at viscosity one (<code>normalized_global_solution</code>), so <code>theorem_1_1</code> follows.</li>
<li><strong>Clay form.</strong> <code>comparator_of_breakdown</code> takes $u_0 := 0$ and the same force (argument order swapped), derives the comparator\u2019s decay conditions from compact support, and turns a comparator solution into a <code>GlobalFiniteEnergySolution</code>; this is <code>navier_stokes_breakdown_R3</code>, aligned with \u201cTheorem 1.1\u201d in formalization.yaml.</li>
</ol>
<h3>The periodic branch</h3>
<p><code>periodic_corollary</code> starts from <code>theorem_1_1_with_initial_rest</code>, compresses with <code>exists_compression_scale</code>, periodizes with <code>of_compact_candidate</code> (\u201cThe arbitrary post-one extensions are discarded before forming the lattice sum\u201d), and excludes competitors by <code>PeriodicViscosity.excludes_global_solution</code>, which uses periodic uniqueness and the boundedness of a continuous periodic field on $[0,1]\\times\\R^3$. The competitor need not have finite energy, but its pressure must be periodic (the Clay errata). formalization.yaml aligns this with \u201cCorollary 10.6\u201d; the string does not occur in any Lean file.</p>
<details class="more"><summary>Maximal lifespan, and what is not claimed</summary>
<p><code>MaximalLifespan.candidate_is_maximal</code> and <code>theorem_1_1_with_maximalH3</code> state that classical ($H^3$) solutions with this force and zero datum exist on $[0,T]$ exactly for $T \\in (0,1]$: the lifespan is one, not less. Nothing is claimed about $u$ at or after $t = 1$, about weak solutions, or about the unforced equation; see [[scene:implications|chapter 5]].</p></details>`,
      stage: {
        need: 'The theorem’s conclusion: no global smooth solution in the stated class, for every positive viscosity, on the whole space and on the torus.',
        whyNot: 'A single blowing-up solution does not by itself exclude others: a different smooth solution with the same data and force might exist.',
        ingredient: 'Uniqueness before time one inside the class, boundedness of continuous functions on compact sets, the viscosity dilation, and the parabolic compression for the torus.',
        remaining: 'Nothing within the formal statements. What remains is interpretive: forced versus unforced, and the meaning of the solution classes (chapters 4 and 5).',
      },
      verify: {
        statements: [
          { title: 'Uniqueness and contradiction (Lean, verbatim)', html: '<pre>/-- A global smooth solution with uniformly finite kinetic energy must agree\nwith the candidate at every time strictly before one. -/\ntheorem candidate_global_agrees_before_one {u : VelocityField} {p : PressureField}\n    {f : VelocityField} {K : Set Space} (h : CandidateProperties 1 u p f K)\n    (v : GlobalFiniteEnergySolution 1 f) :\n    ∀ t ∈ Ico (0 : ℝ) 1, ∀ x, u (t, x) = v.velocity (t, x)\n\ntheorem CandidateProperties.not_global_agreement {ν : ℝ} … (h : CandidateProperties ν u p f K)\n    {v : VelocityField} (hv : ContDiffOn ℝ ∞ v futureDomain) :\n    ¬ (∀ t ∈ Ico (0 : ℝ) 1, ∀ x, u (t, x) = v (t, x))\n\ntheorem CandidateProperties.no_global_solution_one … (h : CandidateProperties 1 u p f K) :\n    ¬ Nonempty (GlobalFiniteEnergySolution 1 f)</pre>' },
          { title: 'Viscosity by dilation (Lean, verbatim)', html: '<pre>def rescale {V : Type*} [SMul ℝ V] (a b : ℝ) (g : SpaceTime → V) : SpaceTime → V :=\n  fun z => a • g (z.1, b • z.2)\n/-- The velocity/force dilation appropriate for a positive target viscosity. -/\ndef scaledVelocity (ν : ℝ) (u : VelocityField) : VelocityField :=\n  rescale (Real.sqrt ν) (Real.sqrt ν)⁻¹ u\n/-- Pressure amplitude is the target viscosity. -/\ndef scaledPressure (ν : ℝ) (p : PressureField) : PressureField :=\n  rescale ν (Real.sqrt ν)⁻¹ p\n/-- Multiplying lengths and velocities by `a` multiplies viscosity by `a²`. -/\ntheorem rescale_residual (μ a : ℝ) (ha : a ≠ 0) (u : VelocityField) (p : PressureField) (t : ℝ) (x : Space) :\n    ProblemStatement.navierStokesResidual (a ^ 2 * μ) (rescale a a⁻¹ u) (rescale (a ^ 2) a⁻¹ p) t x =\n      a • ProblemStatement.navierStokesResidual μ u p t (a⁻¹ • x)</pre>' },
          { title: 'The theorem (Lean, verbatim)', html: '<pre>theorem theorem_1_1_with_initial_rest (ν : ℝ) (hν : 0 < ν) :\n    ∃ u : VelocityField, ∃ p : PressureField, ∃ f : VelocityField, ∃ K : Set Space,\n      CandidateProperties ν u p f K ∧\n      ¬ Nonempty (GlobalFiniteEnergySolution ν f) ∧\n      ∀ t : ℝ, |t| ≤ 3 / 8 → ∀ x : Space,\n        u (t, x) = 0 ∧ p (t, x) = 0\n\n/-- The full periodic corollary is unconditional for every positive\nviscosity. The affine parabolic clock preserves singular time exactly one. -/\ntheorem periodic_corollary : breakdownStatement</pre>' },
        ],
        lean: [
          { decl: 'NavierStokes.FinalSlowBase.axis_tendsto', file: 'NavierStokes/FinalSlowBase.lean', line: 372, note: 'Axis speed of the base diverges; <code>speedUnbounded</code> at line 380.' },
          { decl: 'NavierStokes.AxisPreservation (module docstring)', file: 'NavierStokes/AxisPreservation.lean', line: 7, module: true, note: '\u201cActual physical wave sums vanish on a neighborhood of each preterminal axis point.\u201d (lines 7\u20138)' },
          { decl: 'NavierStokes.GermCandidateAssembly.origin_blowup', file: 'NavierStokes/GermCandidateAssembly.lean', line: 146, note: 'The assembled velocity has the same axis limit as the base; <code>LocalScheduleWitness.selected_origin_blowup</code> (LocalScheduleWitness.lean:110) for the selected schedule.' },
          { decl: 'NavierStokes.NaturalCore.speedUnbounded_of_axis_tendsto', file: 'NavierStokes/NaturalCore.lean', line: 443, note: 'From an axis limit to <code>SpeedUnboundedAtOne</code> (ProblemStatement.lean:94).' },
          { decl: 'NavierStokes.LocalAngularGrowth.localized_eq_raw', file: 'NavierStokes/LocalAngularGrowth.lean', line: 60, note: 'Localization leaves the fields unchanged on the plateau for t \u2265 3/4.' },
          { decl: 'NavierStokesR3.H3Embedding.candidate_h3Norm_unbounded', file: 'NavierStokes/R3/H3Blowup.lean', line: 40, note: 'Whole-space H\u00b3 blowup; the periodic version is <code>PeriodicSobolev.candidate_derivativeH3_unbounded</code> (PeriodicSobolev.lean:349) via <code>norm_le_three_derivativeH3Norm</code> (line 314).' },
          { decl: 'NavierStokesR3.WholeSpaceUniqueness.candidate_global_agrees_before_one', file: 'NavierStokes/R3/WholeSpaceUniqueness.lean', line: 104, note: '<code>classical_uniqueness_on_Icc</code> at line 30; module docstring (lines 8\u201311): \u201cNo growth, decay, support or derivative bound is assumed for the competing pressure or velocity.\u201d' },
          { decl: 'NavierStokesR3.ProblemStatement.CandidateProperties.not_global_agreement', file: 'NavierStokes/R3/CandidateBreakdown.lean', line: 18, note: 'Bounded on the compact set [0,1] \u00d7 K versus unbounded speed; <code>no_global_solution_one</code> at line 43.' },
          { decl: 'NavierStokesR3.ProblemStatement.GlobalFiniteEnergySolution', file: 'NavierStokes/R3/ProblemStatement.lean', line: 125, note: 'The competitor class: smooth, zero datum, divergence-free, the equation, uniform finite energy on all of \u211d\u00b3 and all t \u2265 0.' },
          { decl: 'NavierStokesR3.ViscosityScaling.scaledVelocity', file: 'NavierStokes/R3/ViscosityScaling.lean', line: 163, note: '<code>rescale</code> 24; <code>rescale_residual</code> 82; <code>scaledPressure</code> 167; <code>candidate_at_viscosity</code> 172; <code>normalized_global_solution</code> 182.' },
          { decl: 'NavierStokesR3.theorem_1_1', file: 'NavierStokes/R3/Theorem.lean', line: 46, note: '<code>theorem_1_1_with_initial_rest</code> at line 26: the \u03bd = 1 candidate is dilated by \u221a\u03bd (lines 32\u201336).' },
          { decl: 'NavierStokesR3.comparator_of_breakdown', file: 'NavierStokes/R3/ComparatorBridge.lean', line: 77, note: '$u_0 := 0$ and the same force give Clay alternative (C); <code>ComparatorBridge.navier_stokes_breakdown_R3</code> (ComparatorR3Theorem.lean:38) and the headline <code>Comparator.navier_stokes_breakdown_R3</code> (ComparatorSolution.lean:16).' },
          { decl: 'NavierStokes.PeriodicPaper.periodic_corollary', file: 'NavierStokes/PeriodicPaperTheorem.lean', line: 155, note: '<code>of_compact_candidate</code> at line 92; <code>GlobalSmoothSolution</code> at line 51.' },
          { decl: 'NavierStokes.PeriodicViscosity.excludes_global_solution', file: 'NavierStokes/PeriodicViscosity.lean', line: 24, note: '\u201cNo kinetic-energy assumption is imposed on the competitor.\u201d Uses <code>MaximalLifespan.unbounded_excludes_continuous_extension</code> (MaximalLifespan.lean:154) and <code>PeriodicViscosityUniqueness.classical_uniqueness_on_Icc</code> (PeriodicViscosityUniqueness.lean:65).' },
          { decl: 'NavierStokes.MaximalLifespan.candidate_is_maximal', file: 'NavierStokes/MaximalLifespan.lean', line: 190, note: 'Admissible classical lifespans are exactly (0, 1] (line 226); H\u00b3 version <code>theorem_1_1_with_maximalH3</code> (R3/H3MaximalLifespan.lean:109).' },
          { decl: 'NavierStokes.BlowupImplication (module docstring)', file: 'NavierStokes/BlowupImplication.lean', line: 9, module: true, note: '\u201cThe terminal inference of Proposition 11.7 \u2026 The resulting field cannot be bounded near, or continuously extended to, the endpoint.\u201d (lines 9\u201313)' },
        ],
        paper: [
          { src: 'ns-paper', where: 'Theorem 1.1 and Corollary 10.6 (per formalization.yaml); Proposition 11.7 (per the BlowupImplication docstring)', note: 'The string \u201cCorollary 10.6\u201d occurs only in formalization.yaml, not in any Lean file.' },
        ],
        context: [
          { src: 'formalization-yaml', note: 'Alignment of the two headline theorems with the paper\u2019s numbering; axioms propext, Classical.choice, Quot.sound; sorry count 0.' },
          { src: 'clay-statement', note: 'The errata requiring periodic pressure, which the periodic competitor class transcribes.' },
        ],
        limits: [
          'The flowchart is schematic; the mathematics is in the cited declarations.',
          'The uniqueness arguments themselves (pressure recovery, flux bounds, Gr\u00f6nwall closure in R3/PressureRecovery, R3/PressureFlux, R3/WholeSpaceComparisonClosure) are not reproduced.',
          'Nothing is claimed about u at or after t = 1, about weak solutions, or about the unforced equations.',
        ],
      },
    },
  ],
};
