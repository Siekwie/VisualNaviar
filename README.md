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
