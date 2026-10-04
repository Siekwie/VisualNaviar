// Additional sources used by chapter 4. Same shape as content/sources.js entries. Merged into SOURCES.
// (The commit is repeated here rather than imported, because sources.js imports this module.)
const COMMIT = 'f9e8bc5b38b6e212696e8a30e3e91517af887bbd';
const blob = (path) => `https://github.com/openai/NavierStokesAndEuler/blob/${COMMIT}/${path}`;

export default {
  /* ---- repository metadata and configuration at the pinned commit (primary) ---- */
  'comparator-challenges-readme': { kind: 'primary', short: 'ComparatorChallenges/README.md', title: 'ComparatorChallenges/README.md — how to run Comparator on the two challenges (landrun, lean4export, nanoda_bin)', url: blob('ComparatorChallenges/README.md') },
  'comparator-config-ns': { kind: 'primary', short: 'ComparatorChallenges/NavierStokes.json', title: 'ComparatorChallenges/NavierStokes.json — Comparator configuration: challenge and solution modules, the two theorem names, permitted axioms, nanoda enabled', url: blob('ComparatorChallenges/NavierStokes.json') },
  'comparator-config-euler': { kind: 'primary', short: 'ComparatorChallenges/Euler.json', title: 'ComparatorChallenges/Euler.json — Comparator configuration for the two Euler theorems', url: blob('ComparatorChallenges/Euler.json') },
  'lakefile': { kind: 'primary', short: 'lakefile.toml', title: 'lakefile.toml — build configuration: Mathlib and Comparator at rev v4.34.0-rc2, the three libraries', url: blob('lakefile.toml') },
  'lean-toolchain': { kind: 'primary', short: 'lean-toolchain', title: 'lean-toolchain — leanprover/lean4:v4.34.0-rc2', url: blob('lean-toolchain') },
  'lake-manifest': { kind: 'primary', short: 'lake-manifest.json', title: 'lake-manifest.json — exact dependency commits (mathlib 85e3a25e…, Comparator 19e111e2…, lean4export cacf989b…)', url: blob('lake-manifest.json') },
  'ns-comparator-definitions': { kind: 'primary', short: 'NavierStokes/ComparatorDefinitions.lean', title: 'NavierStokes/ComparatorDefinitions.lean — the proof-side copy of the Navier–Stokes definitions, without the challenge theorems', url: blob('NavierStokes/ComparatorDefinitions.lean') },
  'euler-solution-definitions': { kind: 'primary', short: 'Euler/SolutionDefinitions.lean', title: 'Euler/SolutionDefinitions.lean — the proof-side copy of the Euler definitions, without the challenge theorems', url: blob('Euler/SolutionDefinitions.lean') },

  /* ---- tooling (reference) ---- */
  'comparator-readme': { kind: 'reference', short: 'Comparator README', title: 'leanprover/comparator — README: what Comparator guarantees and the assumptions it rests on', url: 'https://github.com/leanprover/comparator/blob/master/README.md' },
  'formal-conjectures-pinned': { kind: 'reference', short: 'Formal Conjectures (pinned)', title: 'Google DeepMind Formal Conjectures — FormalConjectures/Millenium/NavierStokes.lean at commit 8bf45ed7, the version the Navier–Stokes reference was copied from', url: 'https://github.com/google-deepmind/formal-conjectures/blob/8bf45ed70d48b2b2a501de9c00b26bfa38c573ee/FormalConjectures/Millenium/NavierStokes.lean' },
  'lean4export': { kind: 'reference', short: 'lean4export', title: 'leanprover/lean4export — plain-text declaration export for Lean 4, the format external checkers consume', url: 'https://github.com/leanprover/lean4export' },
  'nanoda': { kind: 'reference', short: 'nanoda', title: 'ammkrn/nanoda_lib — an independent type checker for Lean 4 exports, written in Rust', url: 'https://github.com/ammkrn/nanoda_lib' },
  'landrun': { kind: 'reference', short: 'landrun', title: 'Zouuup/landrun — the Linux sandbox Comparator runs the solution build in', url: 'https://github.com/Zouuup/landrun' },
  'lean4': { kind: 'reference', short: 'Lean 4', title: 'leanprover/lean4 — the Lean 4 theorem prover (kernel, elaborator, Lake)', url: 'https://github.com/leanprover/lean4' },
  'mathlib-repo': { kind: 'reference', short: 'Mathlib', title: 'leanprover-community/mathlib4 — the mathematical library the formalization builds on', url: 'https://github.com/leanprover-community/mathlib4' },
  'wiki-lean': { kind: 'reference', short: 'Wikipedia: Lean', title: 'Wikipedia — Lean (proof assistant); source of the Mathlib size figure used for scale (“over 210,000 theorems and 100,000 definitions” as of May 2025)', url: 'https://en.wikipedia.org/wiki/Lean_(proof_assistant)' },

  /* ---- press (context only) ---- */
  'press-scalevise': { kind: 'context', short: 'Scalevise report', title: 'Scalevise, "OpenAI Reports Navier-Stokes Breakthrough, With GPT-6 Astra Used for Lean Verification" (reports the 17-hour Lean formalization figure)', url: 'https://scalevise.com/resources/openai-navier-stokes-breakthrough-gpt-6-astra/' },
  'press-vktr': { kind: 'context', short: 'VKTR report', title: 'VKTR, "OpenAI Says 10,000 AI Agents Solved a 90-Year-Old Math Problem"', url: 'https://www.vktr.com/ai-news/openai-says-10000-ai-agents-solved-a-90-year-old-math-problem/' },
  'press-batch': { kind: 'context', short: 'The Batch (DeepLearning.AI)', title: 'DeepLearning.AI, The Batch: "OpenAI model solves Navier-Stokes equations"', url: 'https://www.deeplearning.ai/the-batch/openai-model-solves-navier-stokes-equations' },
};
