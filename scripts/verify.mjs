import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const html = readFileSync('index.html', 'utf8');
const sw = readFileSync('sw.js', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .filter(match => !match[0].includes('application/ld+json'));
assert.equal(scripts.length, 2, 'Expected data and view scripts');
for (const match of scripts) new vm.Script(match[1]);
assert(!html.includes('database-loader.js'), 'Dead database loader must not run');
assert(html.includes('https://greenlight-k53-review.vercel.app/'), 'Canonical URL must match review deployment');

const signPaths = [...html.matchAll(/svg:'(assets\/signs\/[^']+)'/g)].map(match => match[1]);
assert(signPaths.length >= 28, 'Not enough sign questions for a 28-question section');
assert.equal(new Set(signPaths).size, signPaths.length, 'Duplicate sign IDs or assets');
for (const path of signPaths) {
  assert(existsSync(path), `Missing sign asset: ${path}`);
  assert(sw.includes('./' + path), `Sign not precached for offline use: ${path}`);
}
for (const path of ['study-guide.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'icon.svg']) {
  assert(existsSync(path), `Missing public asset: ${path}`);
}
// Every local URL in markup, CSS and the install cache must exist at build time.
const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
const local = new Set([
  ...[...html.matchAll(/(?:src|href)=["']((?:\.\/)?(?:assets\/|icon[^"']*|study-guide[^"']*|manifest[^"']*)[^"']*)["']/g)].map(m => m[1].replace(/^\.\//, '')),
  ...[...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]),
  ...manifest.icons.map(i => i.src.replace(/^\.\//, '')),
]);
for (const path of local) assert(existsSync(path), `Missing local asset: ${path}`);
assert(!html.includes('assets/ctrl/'), 'Cockpit must not rely on missing external art');
assert(html.includes('RIGHT-HAND-DRIVE LAYOUT') && html.includes('ACCELERATOR'), 'Cockpit illustration absent');
assert(html.includes('secCount[q.sec.toLowerCase()]++'));
assert(html.includes('secCorrect[q.sec.toLowerCase()]++'));
assert(html.includes('secCorrect[s]/secCount[s]'));
assert(html.includes('if (b.disabled) return;'), 'Simulator must reject repeat answers');
assert(html.includes('x.disabled=true'), 'Simulator choices must disable after answer');
assert(!html.includes('secCorrect[SECTION_META[s].name]'));
console.log('Syntax, routes, score keys and offline asset references passed.');
