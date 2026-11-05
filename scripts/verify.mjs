import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Current architecture: index.html carries ONE inline preview script. The
// decision engine (assets/decision/*) is a separate ES module set; the deleted
// __K53 inline-data API must not creep back in.
const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .filter(m => !m[0].includes('application/ld+json'));
assert.equal(scripts.length, 1, 'Expected exactly one inline preview script');
assert.doesNotThrow(() => new vm.Script(scripts[0][1]), 'Inline script must parse');
assert(!html.includes('database-loader.js'), 'Dead database loader must not run');
assert(!html.includes('__K53'), 'Deleted inline-data API must not return');
assert(!html.includes('<iframe'), 'Preview must not embed another app via iframe');

for (const path of ['study-guide.html', 'privacy.html', 'corrections.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png']) {
  assert(fs.existsSync(path), 'Missing public asset: ' + path);
}

// Every local URL in markup, the manifest and the install cache must exist.
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
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

// Claim boundaries: the preview must not oversell itself.
assert(html.includes('Not a complete syllabus or exam-readiness assessment'), 'Scope disclaimer missing');
assert(html.includes('six questions'), 'Six-question preview scope missing');
assert(!/official 64-question/i.test(html), 'Must not present 64 questions as an official format');

// Forward navigation stays gated until an answer is chosen (preview quiz).
assert(html.includes('id="nextQuestion" disabled'), 'Next-question button must start disabled');

// Accessibility invariants (styling lives in product.css, live regions in the
// decision practice template).
const css = fs.readFileSync('assets/product.css', 'utf8');
assert(css.includes(':focus-visible'), 'Visible keyboard focus styling missing');
assert(css.includes('prefers-reduced-motion'), 'Reduced-motion support missing');
const practice = fs.readFileSync('assets/decision/practice.js', 'utf8');
assert(practice.includes('role="status"'), 'Dynamic learner feedback must expose a live region');
assert.match(html, /<main class="page" id="app">/, 'Main landmark missing');
const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
assert(imgs.every(tag => /\balt=/.test(tag)), 'Image without alt text in index.html');
const pim = [...practice.matchAll(/<img[^>]*>/g)];
assert(pim.length > 0 && pim.every(tag => /\balt=/.test(tag)), 'Practice artwork <img> must carry alt text');

console.log('Single-script preview, public assets, offline art references, claim boundaries and accessibility invariants passed.');
