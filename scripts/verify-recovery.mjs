import assert from 'node:assert/strict';
import { makeRun } from '../assets/decision/engine.js';
import {
  newSave, nextCard, pauseSave, resumeSave, validateSave,
  readSave, writeSave, clearSave, CONTENT_VERSION,
} from '../assets/decision/session.js';
import { progress, record } from '../assets/decision/model.js';

// Checkpoint/recovery lives in session.js: newSave -> writeSave/readSave ->
// validateSave, with pause/resume preserving the time budget across reloads.
const store = new Map();
globalThis.sessionStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
globalThis.window = { sessionStorage: globalThis.sessionStorage, dispatchEvent() {} };

const roundtrip = (save) => validateSave(JSON.parse(JSON.stringify(save)));

// Timed and untimed saves roundtrip through serialization exactly.
const timedRun = makeRun({ mode: 'signs', timedSetting: true });
const save = newSave(timedRun, 1000);
assert(roundtrip(save));
assert.deepEqual(roundtrip(save).ids, save.ids);
const untimed = newSave(makeRun({ mode: 'signs', timedSetting: false }), 1000);
assert.equal(untimed.deadline, null);
assert(roundtrip(untimed));

// Pause, "reload" later, resume: the frozen remainder survives and the new
// deadline is resume-time + remainder (never a fresh full budget).
const paused = pauseSave(save, 3500);
const reloaded = JSON.parse(JSON.stringify(paused));
assert(roundtrip(reloaded));
const resumed = resumeSave(roundtrip(reloaded), 21_000);
assert.equal(resumed.remainingMs, paused.remainingMs, 'Reload must not restore spent time');
assert.equal(resumed.deadline, 21_000 + paused.remainingMs);
assert(roundtrip(resumed));

// sessionStorage read/write/clear path.
writeSave(resumed);
assert.deepEqual(readSave().ids, resumed.ids);
clearSave();
assert.equal(readSave(), null, 'Cleared checkpoint must read back as absent');

// Pre-answer reload: nothing scored, nothing locked, budget intact.
assert.equal(roundtrip(newSave(timedRun, 1000)).answers.length, 0);
assert.equal(roundtrip(newSave(timedRun, 1000)).index, 0);

// Answered (reveal-phase) save validates with exactly one locked answer.
const q0 = timedRun.questions[0];
const answered = {
  ...save,
  phase: 'reveal',
  answers: [{ id: q0.id, full: true, partial: false, helped: false, choiceOk: true, orderOk: null, timedOut: false, choice: q0.correct }],
};
assert(roundtrip(answered), 'Revealed-answer checkpoint must validate');
assert.equal(roundtrip({ ...answered, answers: [] }), null, 'Reveal phase with no answer must be rejected');

// Corrupt checkpoints are rejected (the hostile-restore matrix).
const corrupt = [
  { version: 1 },
  { contentVersion: '1999-01-01' },
  { runId: 'short' },
  { mode: 'no-such-mode' },
  { ids: ['no-such-card'] },
  { ids: [save.ids[0], save.ids[0]] },
  { index: save.ids.length },
  { index: -1 },
  { answers: answered.answers, phase: 'answer' },
  { answers: [{ ...answered.answers[0], id: 'S02' }], phase: 'reveal' },
  { answers: [{ ...answered.answers[0], choice: 99 }], phase: 'reveal' },
  { answers: [{ ...answered.answers[0], full: true, timedOut: true }], phase: 'reveal' },
  { options: [0, 0, 1, 2] },
  { remainingMs: q0.seconds * 1000 + 1 },
  { remainingMs: -5 },
  { deadline: -1 },
  { deadline: Date.now() + q0.seconds * 1000 + 5000 },
];
for (const change of corrupt) assert.equal(validateSave({ ...save, ...change }), null, 'Corrupt save must be rejected: ' + JSON.stringify(change));
assert.equal(validateSave(null), null);
assert.equal(validateSave('junk'), null);
assert.equal(validateSave({ ...save, contentVersion: CONTENT_VERSION + '.x' }), null);

// Ordering picks must be a prefix of the card's order, pool the remainder.
const obs = newSave(makeRun({ mode: 'observe', timedSetting: false }), 1000);
const oq = makeRun({ mode: 'observe', timedSetting: false }).questions[0];
const probe = newSave(makeRun({ mode: 'weak', timedSetting: false, weakIds: ['O02'] }), 1000);
const o2 = probe.questions ?? probe;
const runO2 = makeRun({ mode: 'weak', timedSetting: false, weakIds: ['O02'] });
const sO2 = newSave(runO2, 1000);
assert(!sO2.pool.includes('invented'));
assert.equal(validateSave({ ...sO2, picked: ['invented'] }), null, 'Invented pick must be rejected');
assert.equal(validateSave({ ...sO2, pool: sO2.pool.slice(1) }), null, 'Dropped pool step must be rejected');

// No double scoring: the same event id records once; finishing twice counts once.
const state = { review: [], attempts: {} };
progress(state);
const good = { id: q0.id, full: true, partial: false, helped: false, choiceOk: true, orderOk: null, timedOut: false, choice: q0.correct };
record(state, q0, good, 'recovery-1', 1000);
record(state, q0, good, 'recovery-1', 1000);
assert.equal(state.attempts['decision:' + q0.id].correct, 1, 'Duplicate event must not rescore');
assert.equal(progress(state).xp, 10);

delete globalThis.sessionStorage;
delete globalThis.window;
console.log('Recovery: roundtrip, frozen-budget resume, locked answers, corrupt-save rejection and no double scoring passed.');
