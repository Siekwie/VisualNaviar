// Verifies content integrity against the pinned Lean clone and the source registry.
//  - every verify.lean entry: file exists in the clone, and the declaration's last name segment
//    appears within ±4 lines of the cited line (or anywhere in the file if no line given);
//  - every verify.paper/context src id and [[src:id]] reference exists in SOURCES;
//  - every [[scene:ch/sc]] link resolves; every visual.scene key is registered;
//  - word budgets: understand ≤ 180, stage answers ≤ 45, status entries ≤ 24;
//  - raw '<' or '>' inside $…$ math (should be \lt \gt).
// Usage: node tools/check-citations.mjs [cloneDir]
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const clone = process.argv[2] || '/home/user/openai/navierstokesandeuler';
const { chapters } = await import(pathToFileURL(path.join(root, 'content/index.js')).href);
const { SOURCES } = await import(pathToFileURL(path.join(root, 'content/sources.js')).href);
const registry = readFileSync(path.join(root, 'js/scenes/index.js'), 'utf8');
const sceneKeys = new Set([...registry.matchAll(/'([\w-]+)':\s*\(\)\s*=>\s*import/g)].map((m) => m[1]));
const sceneIds = new Set(chapters.flatMap((c) => [c.id, ...c.scenes.map((s) => `${c.id}/${s.id}`)]));
const words = (html) => String(html || '').replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g, ' M ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
let problems = 0, checks = 0;
const bad = (where, msg) => { problems++; console.log(`  ✗ ${where}: ${msg}`); };
const fileCache = new Map();
const lines = (f) => { if (!fileCache.has(f)) fileCache.set(f, existsSync(f) ? readFileSync(f, 'utf8').split('\n') : null); return fileCache.get(f); };
for (const ch of chapters) {
  console.log(`Chapter ${ch.number} — ${ch.title}`);
  for (const sc of ch.scenes) {
    const where = `${ch.id}/${sc.id}`;
    checks++;
    if (!sceneKeys.has(sc.visual?.scene)) bad(where, `visual.scene "${sc.visual?.scene}" not in registry`);
    if (!['schematic', 'formula-derived', 'numerically-computed', 'source-quoted'].includes(sc.visual?.label)) bad(where, `bad label "${sc.visual?.label}"`);
    const wu = words(sc.understand); if (wu > 180) bad(where, `understand has ${wu} words (budget 180)`);
    if (sc.stage) for (const k of Object.keys(sc.stage)) { const n = words(sc.stage[k]); if (n > 45) bad(where, `stage.${k} has ${n} words (budget 45)`); }
    if (sc.status) for (const k of Object.keys(sc.status)) { const n = words(sc.status[k]); if (n > 24) bad(where, `status.${k} has ${n} words (budget 24)`); }
    const allHtml = [sc.understand, sc.inspect, ...(sc.verify?.statements || []).map((s) => s.html), ...(sc.verify?.limits || []), ...Object.values(sc.status || {}), ...Object.values(sc.stage || {})].join('\n');
    const mathOnly = [...allHtml.matchAll(/\$\$([\s\S]*?)\$\$/g)].map((m) => m[1]).concat([...allHtml.replace(/\$\$[\s\S]*?\$\$/g, ' ').matchAll(/\$([^$\n]+)\$/g)].map((m) => m[1]));
    for (const mth of mathOnly) { if (/(^|[^\\])[<>]/.test(mth)) { bad(where, `raw < or > inside math: ${mth.slice(0, 60)}`); break; } }
    for (const m of allHtml.matchAll(/\[\[scene:([\w-]+(?:\/[\w-]+)?)\|/g)) if (!sceneIds.has(m[1])) bad(where, `broken scene link ${m[1]}`);
    for (const m of allHtml.matchAll(/\[\[src:([\w-]+)\]\]/g)) if (!SOURCES[m[1]]) bad(where, `unknown source id ${m[1]}`);
    for (const ref of [...(sc.verify?.paper || []), ...(sc.verify?.context || [])]) { checks++; if (!SOURCES[ref.src]) bad(where, `unknown source id "${ref.src}"`); }
    for (const l of sc.verify?.lean || []) {
      checks++;
      const f = path.join(clone, l.file); const ls = lines(f);
      if (!ls) { bad(where, `missing Lean file ${l.file}`); continue; }
      const name = String(l.decl).replace(/\s*\(.*$/, '').split('.').pop().split(' ')[0];
      const names = String(l.decl).replace(/\s*\(.*$/, '').split(/\s*\/\s*/).map((d) => d.split('.').pop());
      if (l.line) {
        const lo = Math.max(0, l.line - 5), hi = Math.min(ls.length, l.line + 4);
        const win = ls.slice(lo, hi).join('\n');
        if (!names.some((n) => win.includes(n))) bad(where, `${l.file}:${l.line} does not mention "${name}" nearby (line reads: ${(ls[l.line - 1] || '').trim().slice(0, 70)})`);
      } else if (!ls.some((x) => names.some((n) => x.includes(n)))) bad(where, `${l.file} does not mention "${name}"`);
    }
  }
}
console.log(`\n${checks} checks, ${problems} problem${problems === 1 ? '' : 's'}.`);
process.exit(problems ? 1 : 0);
