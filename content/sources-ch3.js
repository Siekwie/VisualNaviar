// Additional sources used by chapter 3. Same shape as content/sources.js entries. Merged into SOURCES.
// Lean file links are pinned to the same commit as content/sources.js (hard-coded here because this
// module is imported by sources.js and cannot import leanUrl back without a cycle).
const C = 'f9e8bc5b38b6e212696e8a30e3e91517af887bbd';
const L = (file, line) => `https://github.com/openai/NavierStokesAndEuler/blob/${C}/${file}${line ? `#L${line}` : ''}`;

export default {
  'lean-euler-solution': { kind: 'primary', short: 'Euler/Solution.lean', title: 'Euler/Solution.lean — the two Euler theorems and their witnesses (initialDatum, lifespan)', url: L('Euler/Solution.lean') },
  'lean-euler-scales': { kind: 'primary', short: 'PacketSourceScaleSequence.lean', title: 'Euler/PacketSourceScaleSequence.lean — the scale sequences shear, frequency, spike, supportScale, previousShear, timeWidth', url: L('Euler/PacketSourceScaleSequence.lean') },
  'lean-euler-scale-choice': { kind: 'primary', short: 'PacketSourceScaleChoice.lean', title: 'Euler/PacketSourceScaleChoice.lean — scaleSequence x₀ = X, x₍ₙ₊₁₎ = (J+n)² xₙ and the SmallSeries records', url: L('Euler/PacketSourceScaleChoice.lean', 226) },
  'lean-euler-stage': { kind: 'primary', short: 'PacketInductionStage.lean', title: 'Euler/PacketInductionStage.lean — the Stage invariant record of the packet induction', url: L('Euler/PacketInductionStage.lean', 23) },
  'lean-euler-growth': { kind: 'primary', short: 'PacketStageGrowth.lean', title: 'Euler/PacketStageGrowth.lean — activationGradient, gradient_lower, gradient_atTop', url: L('Euler/PacketStageGrowth.lean') },
  'lean-euler-ode30': { kind: 'primary', short: 'EulerProof.lean (equation (30))', title: 'Euler/EulerProof.lean — scalar_equation and equation30_endpoint_exponential, the scalar amplification ODE the docstrings call equation (30)', url: L('Euler/EulerProof.lean', 13367) },
  'lean-euler-horizons': { kind: 'primary', short: 'PacketNestedHorizons.lean', title: 'Euler/PacketNestedHorizons.lean — stepLength, activationTime, horizonTime and the nesting lemmas', url: L('Euler/PacketNestedHorizons.lean') },
  'lean-euler-lifespan': { kind: 'primary', short: 'OrdinaryEulerLifespan.lean', title: 'Euler/OrdinaryEulerLifespan.lean — FiniteLifespan, exists_finite_lifespan (sSup), endpoint_of_bounded_gradient', url: L('Euler/OrdinaryEulerLifespan.lean', 29) },
  'lean-euler-bkm': { kind: 'primary', short: 'OrdinaryEulerBKM.lean', title: 'Euler/OrdinaryEulerBKM.lean — vorticityIntegral_unbounded and vorticity_lintegral_eq_top', url: L('Euler/OrdinaryEulerBKM.lean') },
  'lean-euler-loggrad': { kind: 'primary', short: 'OrdinaryLogarithmicGradient.lean', title: 'Euler/OrdinaryLogarithmicGradient.lean — the whole-space logarithmic gradient (BKM-type) estimate', url: L('Euler/OrdinaryLogarithmicGradient.lean', 29) },
};
