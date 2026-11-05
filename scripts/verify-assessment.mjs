import fs from 'node:fs';
import assert from 'node:assert/strict';
import { makeRun } from '../assets/decision/engine.js';
import { newSave, nextCard, pauseSave, resumeSave, validateSave } from '../assets/decision/session.js';
import { finish, progress } from '../assets/decision/model.js';
import { safeLocalStorage, storageWarning } from '../assets/decision/storage.js';

// Real timing logic: session.js owns remainingMs/deadline/seconds.
const timed = makeRun({ mode: 'signs', timedSetting: true });
const t0 = 1000;
const s = newSave(timed, t0);
const q0 = timed.questions[0];
assert.equal(s.remainingMs, q0.seconds * 1000, 'Card must start with the full per-question budget');
assert.equal(s.deadline, t0 + q0.seconds * 1000, 'Timed card deadline must be now + seconds');
assert.equal(s.paused, false);

const untimedRun = makeRun({ mode: 'signs', timedSetting: false });
const untimed = newSave(untimedRun, t0);
assert.equal(untimed.deadline, null, 'Untimed card has no deadline');
assert.equal(untimed.remainingMs, untimedRun.questions[0].seconds * 1000);

// Pausing freezes the budget; resuming re-arms from the frozen remainder, so
// background delay can never extend the timer.
const paused = pauseSave(s, t0 + 2500);
assert.equal(paused.remainingMs, q0.seconds * 1000 - 2500);
assert.equal(paused.deadline, null);
const resumed = resumeSave(paused, 10_000);
assert.equal(resumed.deadline, 10_000 + paused.remainingMs, 'Resume must re-arm from remainingMs, not grant a fresh budget');
assert(paused.remainingMs < q0.seconds * 1000, 'Time spent before pausing must be spent');
const late = pauseSave(s, t0 + q0.seconds * 1000 + 30_000);
assert.equal(late.remainingMs, 0, 'Budget must clamp at zero after the deadline');

// Next card gets its own full budget.
const q1 = timed.questions[1];
assert.equal(nextCard(s, timed, 5000).remainingMs, q1.seconds * 1000);

// validateSave enforces the same timing bounds on restored checkpoints.
assert(validateSave(s));
assert.equal(validateSave({ ...s, remainingMs: q0.seconds * 1000 + 1 }), null, 'Over-budget remainder must be rejected');
assert.equal(validateSave({ ...s, remainingMs: -1 }), null);
assert.equal(validateSave({ ...s, deadline: Date.now() + q0.seconds * 1000 + 2001 }), null, 'Far-future deadline must be rejected');
assert.equal(validateSave({ ...s, deadline: -1 }), null);

// Assessment math: finish counts full marks, is idempotent per run, and the
// paper's section needs (7/8, 6/8, 3/4) come from the canonical sections.
const state = { review: [], attempts: {} };
progress(state);
const run = makeRun({ mode: 'paper', timedSetting: true });
const save = newSave(run);
const good = (id) => ({ id, full: true, partial: false, helped: false, choiceOk: true, orderOk: null, timedOut: false, choice: 0 });
save.answers = save.ids.map((id, i) => (i < 14 ? good(id) : { ...good(id), full: false, choiceOk: false }));
const result = finish(state, save, 5000);
assert.equal(result.correct, 14);
assert.equal(result.total, 20);
assert.equal(finish(state, save, 5000).id, result.id, 'Finishing twice must not double-count');
assert.equal(progress(state).sessions.length, 1);
assert.equal(result.bonus, 0, 'Bonus is daily-mode only');
for (const sec of save.sections) assert(sec.need <= sec.to - sec.from, 'Section need must fit its section');
assert.deepEqual(save.sections.map(x => [x.need, x.to - x.from]), [[7, 8], [6, 8], [3, 4]]);

// Exit guard and repeat-answer rejection in the practice UI.
const practice = fs.readFileSync('assets/decision/practice.js', 'utf8');
assert(practice.includes('beforeunload'), 'Checkpoint must pause on unload');
assert(typeof (await import('../assets/decision/practice.js')).requestLeave === 'function', 'Leave guard must exist');
assert(practice.includes('${reveal ? "disabled" : ""}'), 'Choices must disable once revealed');

// Storage failure must not break answering; the warning flag recovers.
let blocked = true;
const events = [];
const store = new Map();
globalThis.window = {
  dispatchEvent: (e) => events.push(e),
  localStorage: {
    getItem: (k) => (blocked ? null : store.get(k) ?? null),
    setItem: (k, v) => { if (blocked) throw new Error('Quota exceeded'); store.set(k, v); },
    removeItem: (k) => store.delete(k),
  },
};
assert.doesNotThrow(() => safeLocalStorage.setItem('k53-probe', '1'));
assert.equal(storageWarning(), true, 'Failed write must raise the storage warning');
assert.equal(events.length, 1, 'Storage problem must dispatch exactly one event');
blocked = false;
safeLocalStorage.setItem('k53-probe', '1');
assert.equal(storageWarning(), false, 'Successful write must clear the warning');
assert.equal(safeLocalStorage.getItem('k53-probe'), '1');
assert.equal(events.length, 2, 'Recovery must dispatch a second event');
delete globalThis.window;

console.log('Assessment deadline, frozen pause budget, section targets, exit guard and storage recovery passed.');
