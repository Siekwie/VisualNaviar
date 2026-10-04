// Scene registry. Keys are referenced by `visual.scene` in content modules. Lazy-loaded.
export const SCENES = {
  'concentration': () => import('./concentration.js'),
  'swirl-residual': () => import('./swirl-residual.js'),
  'scope-table': () => import('./scope-table.js'),
  'similarity-zoom': () => import('./similarity-zoom.js'),
  'oscillation-mean': () => import('./oscillation-mean.js'),
  'error-ledger': () => import('./error-ledger.js'),
  'localization': () => import('./localization.js'),
  'breakdown-logic': () => import('./breakdown-logic.js'),
  'layer-cascade': () => import('./layer-cascade.js'),
  'bkm-integral': () => import('./bkm-integral.js'),
  'lean-stack': () => import('./lean-stack.js'),
  'implications-map': () => import('./implications-map.js'),
  'claims-board': () => import('./claims-board.js'),
  'timeline': () => import('./timeline.js'),
  'definitions-board': () => import('./definitions-board.js'),
  'repo-stats': () => import('./repo-stats.js'),
  'placeholder': () => import('./placeholder.js'),
};
export async function loadScene(key) {
  const loader = SCENES[key] || SCENES.placeholder;
  try { return (await loader()).default; }
  catch (e) { console.error(`Scene "${key}" failed to load`, e); return (await SCENES.placeholder()).default; }
}
