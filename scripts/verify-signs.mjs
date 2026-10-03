import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { join } from 'node:path';

const register = JSON.parse(readFileSync('assets/signs/register.json', 'utf8'));
assert.equal(register.signs.length, 42, 'The sign register must cover all 42 app entries.');
const html = readFileSync('index.html', 'utf8');
const used = [...html.matchAll(/id:'([^']+)',svg:'assets\/signs\/([^']+)'/g)].map(m => ({id:m[1], asset:m[2]}));
assert.equal(used.length, register.signs.length, 'Every displayed sign must have a register entry.');
for (const item of used) assert(register.signs.some(s => s.id === item.id && s.asset === item.asset), `Unregistered sign: ${item.id}`);
const blocked = [];
for (const sign of register.signs) {
  const svg = readFileSync(join('assets/signs', sign.asset), 'utf8');
  if (sign.status !== 'approved' || !sign.code || !sign.source_page) {
    blocked.push(sign.id + ': missing final manual review');
  }
  if (/\p{Extended_Pictographic}/u.test(svg) || />(?:NO OVERTAKE|NO STOP|DIR|TOLL|children)</i.test(svg)) {
    blocked.push(sign.id + ': illustrative symbol or text placeholder');
  }
}
if (blocked.length) throw new Error('Sign release gate blocked:\n' + blocked.join('\n'));
console.log('All sign drawings and mappings are approved.');
