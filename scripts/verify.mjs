import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Reconnected architecture (DESIGN_SYSTEM.md §8): index.html is the full
// engine shell — two inline scripts (data + view), product.css/practice.css,
// dynamic practice.js import, manifest + SW registration, ?go= deep links.
// The decision engine (assets/decision/*) is a separate ES module set.
const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .filter(m => !m[0].includes('application/ld+json'));
assert.equal(scripts.length, 2, 'Expected data and view inline scripts');
for (const m of scripts) assert.doesNotThrow(() => new vm.Script(m[1]), 'Inline script must parse');
assert(!html.includes('database-loader.js'), 'Dead database loader must not run');
assert(!html.includes('<iframe'), 'App must not embed another app via iframe');
assert(html.includes('https://k53.skillcert.co.za/'), 'Canonical URL must match production');

// Engine reconnection wiring (DESIGN_SYSTEM.md §8.2) — all 7 journeys.
assert(html.includes('./assets/product.css?v=37'), 'product.css must be linked');
assert(html.includes('./assets/decision/practice.css?v=33'), 'practice.css must be linked');
assert(html.includes("import('./assets/decision/practice.js?v=33')"), 'practice.js must be dynamically imported');
assert(html.includes('./manifest.webmanifest'), 'Manifest link missing');
assert(html.includes('serviceWorker'), 'Service worker registration missing');
assert(html.includes("updateViaCache:'none'"), 'SW must revalidate itself');
assert(html.includes('SKIP_WAITING'), 'Waiting SW must be applyable in-flow');
assert(html.includes('decisionBridge'), 'decisionBridge contract missing');
assert(html.includes('loadDecisionModule'), 'Decision module loader missing');
assert(html.includes('Reconnect once'), 'Decision load failure must offer inline recovery, not a blank app');
assert(html.includes('URLSearchParams'), '?go= deep-link handling missing');
for (const go of ['mock:openMock', 'session1:openSession1', 'session3:openSession3', 'flash:openFlash'])
  assert(html.includes(go), 'Deep link route missing: ' + go);
assert(html.includes('unknownGoNotice'), 'Unknown ?go= must land on Home with a notice');
assert(html.includes("STORE='k53ww_v2'") || html.includes('k53ww_v2'), 'Canonical progress store missing');
assert(sw.includes("CACHE = 'greenlight-k53-v40-phase4'"), 'SW cache must be bumped for the reconnected release');
assert(sw.includes('./assets/product.css?v=37') && sw.includes('./assets/decision/practice.js?v=33'), 'SW precache versions must match the shell');

// Sign learning: registered SVG art, never emoji-only cards; honest progress.
assert(!html.includes('68%'), 'Hardcoded fake progress (68%) must not return');
assert(!html.includes('progress-ring'), 'Decorative progress ring must not return');
const signPaths = [...html.matchAll(/svg:'(assets\/signs\/[^']+)'/g)].map(m => m[1]);
assert(signPaths.length >= 28, 'Not enough sign assets for a 28-question section');
assert.equal(new Set(signPaths).size, signPaths.length, 'Duplicate sign assets');
for (const path of signPaths) {
  assert(fs.existsSync(path), 'Missing sign asset: ' + path);
  assert(sw.includes('./' + path), 'Sign not precached for offline use: ' + path);
}
// Sign cards render via signImg() SVG markup, not emoji.
assert(html.includes('signImg('), 'Sign cards must render registered SVG art');

for (const path of ['study-guide.html', 'privacy.html', 'corrections.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png']) {
  assert(fs.existsSync(path), 'Missing public asset: ' + path);
}

// Every local URL in markup, the manifest and the install cache must exist.
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
assert.equal(manifest.background_color, '#f4efe6', 'Manifest background must align with the paper/warm token');
const local = new Set([
  ...[...html.matchAll(/(?:src|href)=["']((?:\.\/)?(?:assets\/|icon[^"']*|study-guide[^"']*|manifest[^"']*)[^"']*)["']/g)].map(m => m[1].replace(/^\.\//, '')),
  ...[...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]),
  ...manifest.icons.map(i => i.src.replace(/^\.\//, '')),
]);
for (const path of local) {
  if (!path.includes('${')) assert(fs.existsSync(path.split(/[?#]/)[0]), 'Missing local asset: ' + path);
}

// Offline reference integrity for the art the app actually displays.
const bank = (await import('../assets/decision/bank.js')).BANK;
const artIds = bank.filter(q => q.sign || q.scene).map(q => q.id);
const artDir = fs.readdirSync('assets/decision/art').filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4)).sort();
assert.deepEqual([...artIds].sort(), artDir, 'Decision art files must match bank art ids exactly');
for (const id of artIds) {
  const p = 'assets/decision/art/' + id + '.svg';
  assert(fs.existsSync(p), 'Missing decision art: ' + p);
  assert(sw.includes('./' + p), 'Decision art not precached: ' + p);
}
const register = JSON.parse(fs.readFileSync('assets/signs/register.json', 'utf8'));
assert.equal(new Set(register.signs.map(s => s.asset)).size, register.signs.length, 'Duplicate register assets');
for (const s of register.signs) assert(sw.includes('./assets/signs/' + s.asset), 'Register sign not precached: ' + s.asset);

// Claim boundaries: honest scope, 64Q is GreenLight's mock design, not official.
assert(html.includes('not a complete or independently certified syllabus'), 'Scope disclaimer missing');
assert(html.includes("GreenLight's independent mock uses 64 questions"), '64Q must be identified as GreenLight mock design');
assert(!/official 64-question/i.test(html), 'Must not present 64 questions as an official format');
assert(html.includes('24 months'), 'Learner-licence validity disclosure missing');

// Result screens must bridge onward (missed review + next step), not dead-end.
assert(html.includes('retryMissedButton') || html.includes('Review mistakes') || html.includes('Review missed'), 'Result screen must offer missed-question review');

// Accessibility invariants (product.css + live regions in the engines).
const css = fs.readFileSync('assets/product.css', 'utf8');
assert(css.includes(':focus-visible'), 'Visible keyboard focus styling missing');
assert(css.includes('prefers-reduced-motion'), 'Reduced-motion support missing');
const practice = fs.readFileSync('assets/decision/practice.js', 'utf8');
assert(practice.includes('role="status"'), 'Dynamic learner feedback must expose a live region');
assert(html.includes('aria-live'), 'Feedback must expose a live region');
assert.match(html, /<main class="wrap" id="app" tabindex="-1">/, 'Main landmark/focus target missing');
assert(html.includes('class="feedback hidden" role="status"'), 'Quiz feedback must be a live region');
const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
assert(imgs.every(tag => /\balt=/.test(tag)), 'Image without alt text in index.html');
const pim = [...practice.matchAll(/<img[^>]*>/g)];
assert(pim.length > 0 && pim.every(tag => /\balt=/.test(tag)), 'Practice artwork <img> must carry alt text');

console.log('Reconnected engine: shell wiring, 7-journey routes, deep links, offline assets, honest progress, claim boundaries and accessibility invariants passed.');
