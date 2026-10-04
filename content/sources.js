// Source registry. `kind`: primary (the proofs and their formalization), reference (definitions,
// classical results), context (press, statements, commentary — never used as mathematics).
export const LEAN_COMMIT = 'f9e8bc5b38b6e212696e8a30e3e91517af887bbd'; // openai/NavierStokesAndEuler, 2026-09-10
export const LEAN_REPO = 'https://github.com/openai/NavierStokesAndEuler';
export const leanUrl = (file, line) => `${LEAN_REPO}/blob/${LEAN_COMMIT}/${file}${line ? `#L${line}` : ''}`;

import extra2 from './sources-ch2.js';
import extra3 from './sources-ch3.js';
import extra4 from './sources-ch4.js';
import extra5 from './sources-ch5.js';

const BASE = {
  'lean-repo': { kind: 'primary', short: 'Lean repository', title: 'openai/NavierStokesAndEuler — Lean 4 certificates for the Navier–Stokes and Euler results', url: LEAN_REPO, note: `All declaration links point at commit ${LEAN_COMMIT.slice(0, 10)}.` },
  'lean-readme': { kind: 'primary', short: 'repository README', title: 'README of openai/NavierStokesAndEuler', url: `${LEAN_REPO}/blob/${LEAN_COMMIT}/README.md` },
  'formalization-yaml': { kind: 'primary', short: 'formalization.yaml', title: 'formalization.yaml — statement alignment, axioms, sorry counts', url: `${LEAN_REPO}/blob/${LEAN_COMMIT}/formalization.yaml` },
  'comparator-ns': { kind: 'primary', short: 'Comparator reference (NS)', title: 'ComparatorChallenges/NavierStokes.lean — independent reference statement of Clay alternatives (C) and (D)', url: leanUrl('ComparatorChallenges/NavierStokes.lean') },
  'comparator-euler': { kind: 'primary', short: 'Comparator reference (Euler)', title: 'ComparatorChallenges/Euler.lean — independent reference statement of the Euler results', url: leanUrl('ComparatorChallenges/Euler.lean') },
  'ns-paper': { kind: 'primary', short: 'Navier–Stokes paper', title: 'OpenAI, "Finite time blowup for Navier–Stokes" (PDF, 2026)', url: 'https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf' },
  'euler-paper': { kind: 'primary', short: 'Euler paper', title: 'OpenAI, "Finite time blowup for the Euler equation" (PDF, 2026)', url: 'https://cdn.openai.com/pdf/315b36cd-ec98-4023-8342-93345194ece1/euler.pdf' },
  'openai-blog': { kind: 'context', short: 'OpenAI blog post', title: 'OpenAI, "On the Navier–Stokes Millennium Prize Problem" (blog post)', url: 'https://openai.com/index/navier-stokes-solution/' },
  'clay-statement': { kind: 'reference', short: 'Clay problem description', title: 'C. Fefferman, "Existence and smoothness of the Navier–Stokes equation" (official Clay Mathematics Institute problem description)', url: 'https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf' },
  'clay-page': { kind: 'reference', short: 'Clay problem page', title: 'Clay Mathematics Institute — Navier–Stokes Equation (Millennium Prize Problem page)', url: 'https://www.claymath.org/millennium/navier-stokes-equation/' },
  'formal-conjectures': { kind: 'reference', short: 'Formal Conjectures', title: 'Google DeepMind Formal Conjectures — FormalConjectures/Millenium/NavierStokes.lean (source of the reference statements)', url: 'https://github.com/google-deepmind/formal-conjectures/blob/main/FormalConjectures/Millenium/NavierStokes.lean' },
  'comparator-tool': { kind: 'reference', short: 'Comparator', title: 'leanprover/comparator — independent statement-and-proof checker used for the challenges', url: 'https://github.com/leanprover/comparator' },
  'bkm': { kind: 'reference', short: 'Beale–Kato–Majda (1984)', title: 'J. T. Beale, T. Kato, A. Majda, "Remarks on the breakdown of smooth solutions for the 3-D Euler equations", Comm. Math. Phys. 94 (1984)', url: 'https://doi.org/10.1007/BF01212349' },
  'leray': { kind: 'reference', short: 'Leray (1934)', title: 'J. Leray, "Sur le mouvement d\'un liquide visqueux emplissant l\'espace", Acta Math. 63 (1934)', url: 'https://doi.org/10.1007/BF02547354' },
  'wiki-ns': { kind: 'reference', short: 'Wikipedia: existence and smoothness', title: 'Wikipedia — Navier–Stokes existence and smoothness', url: 'https://en.wikipedia.org/wiki/Navier%E2%80%93Stokes_existence_and_smoothness' },
  'wiki-priority': { kind: 'context', short: 'Wikipedia: priority controversy', title: 'Wikipedia — Navier–Stokes priority controversy', url: 'https://en.wikipedia.org/wiki/Navier%E2%80%93Stokes_priority_controversy' },
  'press-quanta': { kind: 'context', short: 'Quanta Magazine', title: 'Quanta Magazine, "AI Has Solved One of Math\'s $1 Million Millennium Prize Problems" (8 Sept 2026)', url: 'https://www.quantamagazine.org/ai-has-solved-one-of-maths-1-million-millennium-prize-problems-20260908/' },
  'press-sciencenews': { kind: 'context', short: 'Science News', title: 'Science News, "AI may have solved one of math\'s biggest puzzles, raising controversy"', url: 'https://www.sciencenews.org/article/ai-math-puzzle-navier-stokes-openai' },
  'press-fortune': { kind: 'context', short: 'Fortune', title: 'Fortune, "OpenAI says it cracked Navier-Stokes…" (8 Sept 2026)', url: 'https://fortune.com/2026/09/08/openai-says-it-cracked-navier-stokes-math-grand-challenge-buckmaster-accusation-cheating-intimidation-tao-lament/' },
  'press-scienceabc': { kind: 'context', short: 'ScienceABC explainer', title: 'ScienceABC, "Did AI Solve The Navier-Stokes Problem? What Was Proved, And Why It Isn\'t Over"', url: 'https://www.scienceabc.com/pure-sciences/navier-stokes-openai-singularity-what-was-proved-what-is-open' },
  'press-implicator': { kind: 'context', short: 'Implicator (Clay response)', title: 'Implicator, "Clay Institute Won\'t Call Navier-Stokes Solved by OpenAI" (reports the Institute\'s 11 Sept 2026 statement)', url: 'https://www.implicator.ai/clay-institute-navier-stokes-openai-proof-claim/' },
  'press-unite': { kind: 'context', short: 'Unite.AI on the dispute', title: 'Unite.AI, "Buckmaster and Alpöge Post AI Fluid Blowup Proofs, Detail OpenAI Calls"', url: 'https://www.unite.ai/buckmaster-and-alpoge-post-ai-fluid-blowup-proofs-dispute-openai-contact/' },
  'buckmaster-statement': { kind: 'context', short: 'Buckmaster statement', title: 'T. Buckmaster, public statement accompanying the Buckmaster–Alpöge preprints (PDF)', url: 'https://cims.nyu.edu/~tristanb/statement.pdf' },
  'tao-blog': { kind: 'context', short: 'Tao blog (7 Sept 2026)', title: 'T. Tao, "Finite time blowup with smooth forcing term for the incompressible porous medium, Boussinesq, and incompressible Euler equations" (blog post, 7 Sept 2026)', url: 'https://terrytao.wordpress.com/2026/09/07/finite-time-blowup-with-smooth-forcing-term-for-the-incompressible-porous-medium-boussinesq-and-incompressible-euler-equations/' },
  'icmat': { kind: 'context', short: 'ICMAT news', title: 'ICMAT, "The Spanish mathematical programme behind AI\'s potential advances in solving the Millennium Prize Problem" (11 Sept 2026)', url: 'https://www.icmat.es/news/11-09-26-en/' },
  'openai-x': { kind: 'context', short: 'OpenAI announcement thread', title: 'OpenAI on X: "The solution is a vortex … that spirals inward and gets increasingly elongated, like spaghetti"', url: 'https://x.com/OpenAI/status/2097374646148481532' },
  'arxiv-swirl': { kind: 'context', short: 'arXiv:2609.17642', title: 'arXiv:2609.17642 — "Self-similar swirl between contracting porous walls … revisited in the similarity variables of the OpenAI 2026 forced blow-up construction"', url: 'https://arxiv.org/abs/2609.17642' },
  'arxiv-ipm-smooth': { kind: 'reference', short: 'arXiv:2609.16470', title: 'arXiv:2609.16470 — "Extending the Córdoba–Martínez-Zoroa IPM Blow-Up to Uniformly Space-Time Smooth Forcing"', url: 'https://arxiv.org/abs/2609.16470' },
};

export const SOURCES = { ...BASE, ...extra2, ...extra3, ...extra4, ...extra5 };
