import assert from 'node:assert/strict';
import { BANK } from '../assets/decision/bank.js';
import { getPracticeQuestions, recordChoiceAttempt } from '../assets/decision/practice.js';
import { progress, record, weakIds, importLegacy } from '../assets/decision/model.js';

// Product evidence denominators: the product is Code 2 only; legacy vehicle
// codes yield no questions instead of silently serving the wrong syllabus.
for (const topic of ['signs', 'rules', 'observe', 'controls', 'mixed']) {
  assert.equal(getPracticeQuestions(topic, '1').length, 0, topic + ' must not serve Code 1');
  assert.equal(getPracticeQuestions(topic, '3').length, 0, topic + ' must not serve Code 3');
}
assert.equal(getPracticeQuestions('signs').length, 28);
assert.equal(getPracticeQuestions('rules').length, 34);
assert.equal(getPracticeQuestions('controls').length, 10);
assert.equal(getPracticeQuestions('observe').length, 5);
assert.equal(getPracticeQuestions('mixed').length, 77);
assert.equal(new Set(getPracticeQuestions('mixed').map((x) => x.decisionId)).size, 77, 'Pool must deduplicate');
assert(getPracticeQuestions('mixed').every((x) => !x.decisionId || BANK.some((q) => q.id === x.decisionId)));

// Evidence semantics from model.record: first answer is permanent, retention
// requires spaced full marks, a miss drops retention but never rewrites firstOk.
const state = { review: [], attempts: {} };
progress(state);
const d = BANK.find((q) => q.id === 'S01');
const full = { id: d.id, full: true, partial: false, helped: false, choiceOk: true, orderOk: null, timedOut: false, choice: d.correct };
const miss = { ...full, full: false, choiceOk: false };
const t0 = 1_800_000_000_000;
record(state, d, full, 'evidence-1', t0);
const key = 'decision:S01';
assert.equal(state.attempts[key].firstOk, true);
assert.equal(state.attempts[key].retainedAt, undefined, 'First answer cannot be retention');
record(state, d, full, 'evidence-2', t0 + 1000);
assert.equal(state.attempts[key].retainedAt, undefined, 'Immediate repetition must not count as retention');
record(state, d, full, 'evidence-3', t0 + 1000 + 86_400_001);
assert.equal(state.attempts[key].retainedAt, t0 + 1000 + 86_400_001, 'Spaced full mark must set retention');
record(state, d, miss, 'evidence-4', t0 + 1000 + 86_400_002);
assert.equal(state.attempts[key].retainedAt, undefined, 'A miss must drop retention');
assert.equal(state.attempts[key].firstOk, true, 'First answer must not be rewritten');
assert.equal(state.attempts[key].correct, 3);
assert.equal(state.attempts[key].wrong, 1);

// Grade math: 10 full / 5 partial / 3 helped-and-right-choice / 0 otherwise.
for (const [answer, gained] of [
  [{ ...full, full: false, partial: true }, 5],
  [{ ...full, full: false, helped: true, choiceOk: true }, 3],
  [{ ...full, full: false, helped: true, choiceOk: false }, 0],
  [miss, 0],
]) {
  const s = { review: [], attempts: {} };
  progress(s);
  assert.equal(record(s, d, answer, 'grade', t0).gained, gained);
}

// The shared-bank path records into the same evidence store.
const shared = { review: [], attempts: {} };
progress(shared);
const choice = getPracticeQuestions('signs').find((x) => x.decisionId === 'S01');
recordChoiceAttempt(shared, choice, true);
assert.equal(shared.attempts['decision:S01'].firstOk, true);
recordChoiceAttempt(shared, choice, true);
assert.equal(shared.attempts['decision:S01'].correct, 1, 'Shared path event ids must prevent double scoring');

// Weak queue follows the review schedule, not a separate mistake store.
const weak = { review: [], attempts: {} };
progress(weak);
record(weak, d, miss, 'weak-1', t0);
assert.deepEqual(weakIds(weak), ['S01'], 'Missed card must surface as weak');
record(weak, d, full, 'weak-2', t0 + 1000);
assert.deepEqual(weakIds(weak), [], 'Cleared card must leave the weak queue');

// Legacy import boundary: known ids only, once, and never invents firstOk.
const legacyState = { review: [], attempts: {} };
progress(legacyState);
const result = importLegacy(legacyState, {
  state: { xp: 1200, mistakes: [{ id: 'O02' }, { id: 'no-such-card' }, { id: '__proto__' }] },
});
assert.equal(result.imported, true);
assert.equal(result.count, 1);
assert.equal(legacyState.attempts['decision:O02'], undefined, 'Import must not invent attempt history');
assert.equal(importLegacy(legacyState, { state: { mistakes: [{ id: 'O03' }] } }).imported, false, 'Import is once-only');
assert.equal(progress(legacyState).legacyActivityXp, 1200);

// Hostile progress state is repaired, never trusted.
const hostile = { review: [], attempts: {}, decision: { version: 1, xp: NaN, events: null, sessions: null } };
assert.equal(progress(hostile).xp, 0);
assert.deepEqual(progress(hostile).sessions, []);

console.log('Product evidence: Code 2 denominators, first answers, spaced retention, grade math, shared-bank recording, weak queue and hostile-state repair passed.');
