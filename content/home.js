export default {
  title: 'A proof explorer for finite-time blowup',
  lede: 'In September 2026 a Lean-checked proof claimed that a smoothly forced fluid can reach infinite speed in finite time, and a second one that an unforced ideal fluid can lose its smoothness. This guide lets you understand the central idea, then follow every explanation down to the mathematics and the source that supports it.',
  compareIntro: 'The two results are different theorems about different equations, proved by different constructions. Keeping them apart is the first thing to understand, and the first thing the public discussion blurred.',
  compare: [
    { k: 'Fluid model', ns: 'Viscous, incompressible fluid in three dimensions. Every positive viscosity $\\nu \\gt 0$.', euler: 'Ideal (inviscid) incompressible fluid in three dimensions.' },
    { k: 'External forcing', ns: 'A smooth, deliberately constructed force $f(x,t)$ drives the flow. Its smoothness is the hard part.', euler: 'No external force at all.' },
    { k: 'Initial data', ns: 'The constructed witnesses start from rest: $u_0 = 0$. The force creates the whole flow.', euler: 'Smooth, compactly supported, divergence-free and nonzero. No force at any time.' },
    { k: 'Domain', ns: 'Whole space $\\R^3$ (with decay) and, separately, the periodic torus $\\R^3/\\Z^3$.', euler: 'Whole space $\\R^3$, with compactly supported initial data.' },
    { k: 'What breaks down', ns: 'No global smooth solution with uniformly bounded kinetic energy exists (whole space); no global smooth periodic solution exists (torus).', euler: 'The solution exists only up to some time $T^* \\le 1$. As $t \\to T^*$ the steepest velocity gradient becomes infinite and so does the accumulated vorticity (the formulas are in chapter 3).' },
    { k: 'What stays bounded', ns: 'Kinetic energy, by construction of the class considered.', euler: 'Kinetic energy on $[0,T^*)$.' },
    { k: 'Relation to the Clay problem', ns: 'Exactly alternatives (C) and (D) of the official problem description: the two “breakdown” outcomes it lists as acceptable, both of which permit a smooth force.', euler: 'Not a Clay alternative. A separate theorem about a different equation.' },
    { k: 'Important boundary', ns: 'Does <b>not</b> establish blowup for Navier–Stokes without a force, the question most mathematicians mean by "the" Navier–Stokes problem.', euler: 'Not obtained by "turning viscosity off" in the Navier–Stokes construction. It is its own iterative construction.' },
  ],
  fine: 'This guide is independent and unofficial. Mathematical statements are checked against the public Lean formalization at a pinned commit, where the theorem statements can be read verbatim. The papers themselves are linked but their internal numbering is only cited where the repository metadata states the alignment. Press coverage is used only for context and is labelled as such. Where interpretation is contested (scope, attribution, physical relevance) the guide says so instead of picking a side.',
};
