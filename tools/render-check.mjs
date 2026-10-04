// Headless render check: loads every route, captures console errors, takes screenshots.
// Usage: node tools/render-check.mjs [baseUrl] [outDir] [--dark]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dark = process.argv.includes('--dark');
const base = args[0] || 'http://127.0.0.1:8765';
const out = args[1] || '/tmp/claude-0/-home-user-VisualNaviar/bbe5c005-cad4-513e-b9ed-807d9e724885/scratchpad/shots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(async () => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.goto(base + '/#/', { waitUntil: 'networkidle' });
if (dark) { await page.evaluate(() => { localStorage.setItem('bx-theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); }); }
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/home.png`, fullPage: true });
// Collect routes from the content index.
const routes = await page.evaluate(async () => {
  const m = await import('./content/index.js');
  return m.chapters.flatMap((c) => c.scenes.map((s) => ({ ch: c.id, sc: s.id })));
});
const results = [];
for (const r of routes) {
  for (const depth of ['understand', 'inspect', 'verify']) {
    const before = errors.length;
    await page.goto(`${base}/#/${r.ch}/${r.sc}?depth=${depth}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(depth === 'understand' ? 900 : 350);
    const words = await page.evaluate(() => (document.querySelector('#explain')?.innerText || '').split(/\s+/).filter(Boolean).length);
    const sceneOk = await page.evaluate(() => !!document.querySelector('#scene-host canvas, #scene-host .scene-table, #scene-host .scene-html'));
    if (depth === 'understand') await page.screenshot({ path: `${out}/${r.ch}--${r.sc}.png`, fullPage: false });
    results.push({ route: `${r.ch}/${r.sc}`, depth, words, sceneOk, newErrors: errors.slice(before) });
  }
}
// mobile check of first scene
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/#/${routes[0].ch}/${routes[0].sc}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/mobile.png`, fullPage: true });
const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
await browser.close();
for (const r of results) console.log(`${r.sceneOk ? 'OK ' : 'NOSCENE'} ${r.route.padEnd(40)} ${r.depth.padEnd(10)} ${String(r.words).padStart(5)} words ${r.newErrors.length ? ' ERRORS: ' + r.newErrors.join(' | ') : ''}`);
console.log(`mobile horizontal overflow: ${hscroll}`);
console.log(`total console errors/warnings: ${errors.length}`);
if (errors.length) console.log(errors.slice(0, 20).join('\n'));
