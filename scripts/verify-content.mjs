import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { BANK } from '../assets/decision/bank.js';
import { getPracticeQuestions } from '../assets/decision/practice.js';
import { makeRun } from '../assets/decision/engine.js';
import { reviewQuestion } from '../assets/decision/model.js';
import { questionSource } from '../assets/decision/sources.js';

assert.equal(BANK.length, 82, 'BANK must hold 82 questions');
assert.equal(new Set(BANK.map(q => q.id)).size, 82, 'Duplicate question ids');
const topics = BANK.reduce((a, q) => (a[q.topic] = (a[q.topic] || 0) + 1, a), {});
assert.deepEqual(topics, { signs: 28, rules: 34, observe: 10, controls: 10 });

// Choice invariants for every question, including ordering cards.
for (const q of BANK) {
  assert(q.situation?.trim() && q.ask?.trim() && q.why?.trim() && q.rule?.trim(), q.id + ': incomplete text');
  assert(Number.isInteger(q.seconds) && q.seconds > 0, q.id + ': seconds must be positive');
  if (q.order) {
    assert(q.order.length > 0 && new Set(q.order).size === q.order.length, q.id + ': ordering steps must be unique');
  }
  if (q.options.length === 0) {
    assert(q.order?.length > 0 && q.correct === -1, q.id + ': optionless card must be an ordering card');
  } else {
    assert(q.options.length >= 2 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, q.id + ': answer out of range');
    assert.equal(new Set(q.options.map(x => x.trim())).size, q.options.length, 'Duplicate choices: ' + q.id);
    assert(q.options.every(x => x.trim()), q.id + ': empty choice');
  }
}
assert.equal(BANK.filter(q => q.order).length, 5, 'Expected 5 ordering cards');
assert.equal(BANK.filter(q => q.options.length === 0).length, 4, 'Expected 4 optionless ordering cards');

// The decision register must fingerprint-match the bank exactly.
const register = JSON.parse(fs.readFileSync('assets/decision/content-register.json', 'utf8'));
assert.equal(register.items.length, 82);
for (const q of BANK) {
  const r = register.items.find(x => x.id === q.id);
  assert(r, 'Missing register item: ' + q.id);
  assert.equal(r.sha256, crypto.createHash('sha256').update(JSON.stringify(q)).digest('hex'), 'Stale fingerprint: ' + q.id);
  assert.deepEqual(r.source, questionSource(q), 'Source mismatch: ' + q.id);
}

// Shared-bank denominators: ordering cards are excluded from choice pools.
assert.equal(getPracticeQuestions('signs').length, 28);
assert.equal(getPracticeQuestions('rules').length, 34);
assert.equal(getPracticeQuestions('controls').length, 10);
assert.equal(getPracticeQuestions('observe').length, 5);
assert.equal(getPracticeQuestions('mixed').length, 77);
assert.equal(getPracticeQuestions('mixed', '1').length, 0, 'Product is Code 2 only');
assert.equal(getPracticeQuestions('mixed', '3').length, 0, 'Product is Code 2 only');
for (const item of getPracticeQuestions('mixed')) {
  assert(item.decisionId && item.source?.url && item.q && item.ex, 'Practice item missing evidence fields');
}
assert.equal(new Set(getPracticeQuestions('mixed').map(x => x.decisionId)).size, 77, 'Practice pool must deduplicate');

// Paper roster: 8 signs + 8 rules + 4 controls, internal needs 7/6/3.
const paper = makeRun({ mode: 'paper', timedSetting: true });
assert.equal(paper.timed, false, 'Paper runs untimed');
assert.equal(paper.questions.length, 20);
assert.equal(new Set(paper.questions.map(q => q.id)).size, 20, 'Paper roster must not repeat');
assert.deepEqual(paper.sections, [
  { title: 'Road signs', from: 0, to: 8, need: 7 },
  { title: 'Rules of the road', from: 8, to: 16, need: 6 },
  { title: 'Vehicle controls', from: 16, to: 20, need: 3 },
]);
assert.equal(paper.questions.slice(0, 8).every(q => q.topic === 'signs'), true);
assert.equal(paper.questions.slice(8, 16).every(q => q.topic === 'rules'), true);
assert.equal(paper.questions.slice(16).every(q => q.topic === 'controls'), true);

// Displayed art exists and is precached; review records point at it.
const sw = fs.readFileSync('sw.js', 'utf8');
for (const q of BANK.filter(q => q.sign || q.scene)) {
  const p = 'assets/decision/art/' + q.id + '.svg';
  assert(fs.existsSync(p) && sw.includes('./' + p), 'Art missing or not precached: ' + p);
  const rq = reviewQuestion(q);
  assert.equal(rq.key, 'decision:' + q.id);
  assert.equal(rq.svg, p);
}
for (const q of BANK.filter(q => !q.sign && !q.scene)) assert.equal(reviewQuestion(q).svg, '');
const ordering = reviewQuestion(BANK.find(q => q.options.length === 0));
assert.match(ordering.a, /Correct sequence:/);
assert.equal(ordering.ans, -1);

console.log('Content integrity: 82 fingerprints, choice/ordering invariants, 28/34/10/5/77 denominators, 20-question paper roster and displayed art passed.');
