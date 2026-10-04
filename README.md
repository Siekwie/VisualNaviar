# Blowup Explorer

An independent, unofficial **proof explorer** for the September 2026 finite-time blowup results:
the forced three-dimensional Navier–Stokes equations (Clay alternatives (C) and (D)) and the
unforced three-dimensional Euler equations, as formalized in
[openai/NavierStokesAndEuler](https://github.com/openai/NavierStokesAndEuler).

It is not a prettier proof document. Each scene lets you **understand** one idea with an interactive
visual, **inspect** the mathematics behind it, and **verify** it against precise statements, paper
references and Lean declarations at a pinned commit.

## Run it

It is a static site with no build step.

```sh
python3 -m http.server 8765          # or any static server
# open http://127.0.0.1:8765/
```

GitHub Pages: serve the repository root.

## Principles

- **Traceable.** Mathematical claims trace to the Lean formalization (pinned commit in
  `content/sources.js`) or to classical references. Press coverage is context only and labelled.
- **Honest visuals.** Every visual carries one evidence label: *schematic*, *formula-derived*,
  *numerically computed*, or *source-quoted*.
- **Progressive disclosure.** Three depth levels per scene; nobody gets the whole proof at once.
- **Two results, kept apart.** Navier–Stokes and Euler have separate chapters and separate scenes.
- **Contested things stay contested.** Scope, attribution and physical relevance are reported, not decided.

## What the guide is built on, and what it is not

- **Ground truth is the Lean formalization** at the pinned commit (`content/sources.js` → `LEAN_COMMIT`).
  Theorem statements are quoted verbatim; every Lean citation carries a file and line and is checked
  by `tools/check-citations.mjs` against a clone of the repository.
- **The two papers could not be read** in the environment where this guide was written (their host
  was unreachable). Paper theorem and equation numbers appear only where the repository's own
  metadata or Lean docstrings cite them, and are labelled as such. Treat any statement about the
  papers' prose as unverified.
- **Press coverage is context, never mathematics.** It is confined to "Context sources" and to
  attributed sentences ("as reported by …"), mainly in chapters 4 and 5.
- **Contested questions stay contested**: whether the forced result "solves" the Clay problem, who
  had which idea first, and physical relevance are reported from both sides without a verdict.
- The guide is independent and unofficial, with no affiliation to OpenAI, the Clay Mathematics
  Institute, or the mathematicians named.

## Deploying

Any static host works. For GitHub Pages, serve the repository root (Settings → Pages → branch, folder `/`).
No build step, no server-side code, no external requests except the links the reader clicks.

## Layout

```
index.html            app shell
css/app.css           tokens, layout, light/dark
js/app.js             router, trail, stage, explanation, home
js/scene-runtime.js   evidence labels, UI helpers, canvas loop, charts
js/scenes/*.js        interactive scenes (one module each, lazy-loaded)
content/chN-*.js      chapter content (see content/SCHEMA.md)
content/sources.js    source registry + Lean commit pin
tools/render-check.mjs headless render test (Playwright)
vendor/katex          vendored KaTeX (MIT)
```

## Checks

```sh
node tools/render-check.mjs http://127.0.0.1:8765
```

Loads every scene at every depth, reports console errors, word counts per depth, and takes screenshots.

```sh
node tools/check-citations.mjs /path/to/clone/of/openai/NavierStokesAndEuler
```

Verifies every cited Lean declaration against the pinned clone (file exists, declaration name near
the cited line), every source id, every internal link, every scene key, the word budgets, and that
math uses `\lt`/`\gt` instead of raw angle brackets.
