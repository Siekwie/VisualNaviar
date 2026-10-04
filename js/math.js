// KaTeX helper. The vendored auto-render script exposes `renderMathInElement`.
const OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
  ],
  throwOnError: false,
  strict: 'ignore',
  trust: false,
  ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
  macros: {
    '\\R': '\\mathbb{R}',
    '\\T': '\\mathbb{T}',
    '\\norm': '\\left\\lVert #1 \\right\\rVert',
    '\\abs': '\\left\\lvert #1 \\right\\rvert',
    '\\dd': '\\,\\mathrm{d}',
    '\\Linf': 'L^{\\infty}',
    '\\divg': '\\nabla\\cdot',
  },
};

let pending = null;
function ready() {
  if (typeof window.renderMathInElement === 'function') return Promise.resolve();
  if (!pending) {
    pending = new Promise((resolve) => {
      const tick = () => (typeof window.renderMathInElement === 'function' ? resolve() : setTimeout(tick, 30));
      tick();
    });
  }
  return pending;
}

/** Typeset all math inside `el` (idempotent for already-rendered nodes). */
export async function typeset(el) {
  if (!el) return;
  await ready();
  try { window.renderMathInElement(el, OPTS); } catch (e) { console.warn('KaTeX render failed', e); }
}

/** Render a single TeX string to an HTML string (inline by default). */
export function tex(src, display = false) {
  if (typeof window.katex === 'undefined') return display ? `$$${src}$$` : `$${src}$`;
  try { return window.katex.renderToString(src, { displayMode: display, throwOnError: false, macros: OPTS.macros }); }
  catch (e) { return src; }
}
