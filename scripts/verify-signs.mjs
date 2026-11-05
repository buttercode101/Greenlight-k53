import fs from 'node:fs';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { BANK } from '../assets/decision/bank.js';
import { questionSource } from '../assets/decision/sources.js';

// What the app actually displays: procedural decision art at
// assets/decision/art/<id>.svg for every bank item with a sign/scene, sourced
// per-question through sources.js chart sections. The assets/signs library is a
// separate reviewed reference set; this gate never claims it is displayed.
const sw = fs.readFileSync('sw.js', 'utf8');
const artIds = BANK.filter((q) => q.sign || q.scene).map((q) => q.id);
const artDir = fs.readdirSync('assets/decision/art').filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();
assert.deepEqual([...artIds].sort(), artDir, 'Displayed art files must match bank art ids exactly');
for (const q of BANK.filter((q) => q.sign || q.scene)) {
  const svg = fs.readFileSync('assets/decision/art/' + q.id + '.svg', 'utf8');
  assert(svg.startsWith('<svg') && svg.includes('xmlns='), q.id + ': art must be a namespaced svg');
  assert(!/<script|<foreignObject|href="https?:/i.test(svg), q.id + ': art must not embed scripts/links');
  assert(/role="img"/.test(svg), q.id + ': displayed art must be labelled');
  assert(sw.includes('./assets/decision/art/' + q.id + '.svg'), q.id + ': art must be precached');
  // Every displayed sign card is source-checked to a concrete chart section.
  assert(questionSource(q).section?.trim(), q.id + ': missing chart section');
}

// BANK sign types that map onto a reviewed register entry, with the register
// code the chart section in sources.js must agree with.
const register = JSON.parse(fs.readFileSync('assets/signs/register.json', 'utf8'));
const byId = new Map(register.signs.map((s) => [s.id, s]));
const SIGN_MAP = [
  [{ t: 'stop' }, 'stop', 'R1'],
  [{ t: 'yield' }, 'giveway', 'R2'],
  [{ t: 'noentry' }, 'noentry', 'R3'],
  [{ t: 'nopark' }, 'nopark', 'R216'],
  [{ t: 'nostop' }, 'nostop', 'R217'],
  [{ t: 'noturn', d: 'L' }, 'noleft', 'R211'],
  [{ t: 'noturn', d: 'R' }, 'noright', 'R212'],
  [{ t: 'noturn', d: 'U' }, 'nouturn', 'R213'],
  [{ t: 'must', d: 'K' }, 'keepleft', 'R103'],
  [{ t: 'minspeed' }, 'minspeed', 'R101-60'],
  [{ t: 'robot' }, 'robot', 'W301'],
  [{ t: 'speed', n: 60 }, 'speed60', 'R201'],
  [{ t: 'warn', s: 'kids' }, 'children', 'W308'],
  [{ t: 'warn', s: 'ped' }, 'ped', 'W307'],
  [{ t: 'warn', s: 'circle' }, 'roundabout', 'W201'],
  [{ t: 'warn', s: 'slip' }, 'slippery', 'W333'],
  [{ t: 'warn', s: 'bump' }, 'speedbump', 'W332'],
];
const matches = (sign, want) => Object.entries(want).every(([k, v]) => sign[k] === v);
const mapped = new Set();
for (const q of BANK.filter((q) => q.sign)) {
  const hit = SIGN_MAP.find(([want]) => matches(q.sign, want));
  if (!hit) {
    mapped.add('unmapped:' + q.sign.t);
    continue;
  }
  const [, registerId, code] = hit;
  const entry = byId.get(registerId);
  assert(entry, q.id + ': no register entry for ' + JSON.stringify(q.sign));
  assert.equal(entry.code, code, q.id + ': register code must be ' + code);
  assert.equal(entry.status, 'reviewed-study-illustration', q.id + ': mapped sign must be reviewed');
  mapped.add(registerId);
}
// Sign types with no register counterpart must say so via sources.js, not via
// a borrowed code: must L/R, 40 km/h speed, temp, markings and one-way.
for (const t of ['must', 'speed', 'temp', 'mark', 'oneway']) assert(mapped.has('unmapped:' + t), 'Expected unmapped sign type: ' + t);

// Register hygiene (the library itself stays fully reviewed and labelled).
const blocked = [];
assert.equal(new Set(register.signs.map((s) => s.id)).size, register.signs.length, 'Duplicate register ids');
assert.equal(new Set(register.signs.map((s) => s.asset)).size, register.signs.length, 'Duplicate register assets');
for (const sign of register.signs) {
  const svg = fs.readFileSync(join('assets/signs', sign.asset), 'utf8');
  if (sign.status !== 'reviewed-study-illustration' || !sign.code || !sign.source_page || !sign.reviewed_at || !sign.reviewer || !sign.review_note) {
    blocked.push(sign.id + ': missing recorded study-illustration review');
  }
  if (!svg.includes(sign.code)) blocked.push(sign.id + ': asset label does not match registered sign code');
  if (/\p{Extended_Pictographic}/u.test(svg) || />(?:NO OVERTAKE|NO STOP|DIR|TOLL|children)</i.test(svg)) {
    blocked.push(sign.id + ': illustrative symbol or text placeholder');
  }
  if (!sw.includes('./assets/signs/' + sign.asset)) blocked.push(sign.id + ': register asset not precached');
}
if (blocked.length) throw new Error('Sign release gate blocked:\n' + blocked.join('\n'));

console.log(
  'Sign gate: ' + artIds.length + ' displayed decision art files match the bank and are precached; ' +
    mapped.size + ' BANK sign groups map to reviewed register codes; ' +
    register.signs.length + ' register entries reviewed, labelled and precached.',
);
