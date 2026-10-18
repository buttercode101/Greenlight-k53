import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { BANK, ROUTES } from "../assets/decision/bank.js";
import { makeRun } from "../assets/decision/engine.js";
import {
  newSave,
  validateSave,
  pauseSave,
  resumeSave,
  nextCard,
} from "../assets/decision/session.js";
import {
  progress,
  record,
  finish,
  weakIds,
  importLegacy,
} from "../assets/decision/model.js";
import { questionSource } from "../assets/decision/sources.js";
const register = JSON.parse(
  fs.readFileSync("assets/decision/content-register.json", "utf8"),
);
assert.equal(BANK.length, 82);
assert.equal(new Set(BANK.map((q) => q.id)).size, 82);
assert.equal(register.items.length, 82);
for (const q of BANK) {
  const r = register.items.find((r) => r.id === q.id);
  assert.equal(
    r.sha256,
    crypto.createHash("sha256").update(JSON.stringify(q)).digest("hex"),
  );
  assert.deepEqual(r.source, questionSource(q));
  assert(
    (q.options.length >= 2 && q.correct < q.options.length) ||
      (q.options.length === 0 && q.order?.length > 0 && q.correct === -1),
  );
  if (q.order) assert.equal(new Set(q.order).size, q.order.length);
  if (q.sign || q.scene) {
    const p = `assets/decision/art/${q.id}.svg`;
    assert(fs.existsSync(p));
    const svg = fs.readFileSync(p, "utf8");
    assert(svg.startsWith("<svg") && svg.includes("xmlns="));
    assert(!/<script|<foreignObject|href="https?:/i.test(svg));
    assert(fs.readFileSync("sw.js", "utf8").includes("./" + p));
  }
}
const state = {
  review: [],
  attempts: {},
  sessions: { 1: true },
  vehicleCode: "2",
  mockPass: true,
};
progress(state);
const q = BANK[0],
  good = {
    id: q.id,
    full: true,
    partial: false,
    helped: false,
    choiceOk: true,
    orderOk: null,
    timedOut: false,
    choice: q.correct,
  },
  bad = { ...good, full: false, choiceOk: false };
record(state, q, bad, "run-a:0");
assert.deepEqual(weakIds(state), [q.id]);
record(state, q, good, "run-a:1");
assert.equal(weakIds(state).length, 0);
assert(state.review[0].due > Date.now());
const once = record(state, q, good, "run-a:1");
assert.equal(once.gained, 10);
assert.equal(progress(state).xp, 10);
assert.equal(state.attempts["decision:" + q.id].correct, 1);
assert.equal(state.sessions[1], true);
assert.equal(state.mockPass, true);
const daily = makeRun({ mode: "daily", timedSetting: false });
const save = newSave(daily);
assert.equal(save.ids.length, 8);
assert(validateSave(save));
save.answers = save.ids.map((id) => ({ ...good, id, full: false }));
assert.equal(finish(state, save).bonus, 0);
const retry = {
  ...save,
  runId: crypto.randomUUID(),
  answers: save.ids.map((id) => ({ ...good, id })),
};
assert.equal(finish(state, retry).bonus, 40);
assert.equal(finish(state, retry).bonus, 40);
assert.equal(progress(state).xp, 50);
assert.equal(progress(state).sessions.length, 2);
const timed = makeRun({ mode: "signs", timedSetting: true }),
  s = newSave(timed, 1000),
  paused = pauseSave(s, 3500),
  resumed = resumeSave(paused, 10000);
assert.equal(paused.remainingMs, timed.questions[0].seconds * 1000 - 2500);
assert.equal(resumed.deadline, 10000 + paused.remainingMs);
assert.deepEqual(resumed.options, s.options);
assert(validateSave({ ...newSave(timed), index: -1 }) === null);
const observation = makeRun({
    mode: "weak",
    timedSetting: false,
    weakIds: ["O02"],
  }),
  o = newSave(observation);
o.picked = [observation.questions[0].order[0]];
o.pool = o.pool.filter((x) => x !== o.picked[0]);
assert(validateSave(o));
assert.equal(validateSave({ ...o, picked: ["invented"] }), null);
for (const route of ROUTES) {
  const run = makeRun({
    mode: "route",
    routeId: route.id,
    timedSetting: false,
  });
  assert.deepEqual(
    run.questions.map((q) => q.id),
    route.ids,
  );
  const s = newSave(run);
  assert(validateSave(s));
  assert.deepEqual(nextCard(s, run).ids, s.ids);
}
const paper = newSave(makeRun({ mode: "paper", timedSetting: true }));
assert.equal(paper.timed, false);
assert.equal(paper.ids.length, 20);
assert(validateSave(paper));
assert.equal(validateSave({ ...paper, sections: [] }), null);
const before = state.review.length;
assert(
  importLegacy(state, {
    state: {
      xp: 1200,
      mistakes: [{ id: "O02" }, { id: "no-such-card" }, { id: "__proto__" }],
    },
  }).imported,
);
assert.equal(state.review.length, before + 1);
assert.equal(
  importLegacy(state, { state: { mistakes: [{ id: "O03" }] } }).imported,
  false,
);
assert.equal(progress(state).xp, 50);
assert.equal(progress(state).legacyActivityXp, 1200);
const broken = {
  review: [],
  attempts: {},
  decision: { version: 1, xp: NaN, events: null, sessions: null },
};
assert.equal(progress(broken).xp, 0);
assert.deepEqual(progress(broken).sessions, []);
const html = fs.readFileSync("index.html", "utf8");
assert(html.includes("decision:openPractice"));
assert(!html.includes("<iframe"));
assert(html.includes("r.decisionId"));
assert(html.includes("import('./assets/decision/practice.js?v=28')"));
console.log(
  "Decision integration: all 82 content hashes/art, shared progress/review, duplicate scoring, daily retry, migration, recovery, timer and exact routes passed.",
);

// Corrupt cached events cannot suppress a real answer; inherited object keys are not IDs.
const invalidEventState = {
  review: [],
  attempts: {},
  decision: {
    version: 1,
    events: { "corrupt:0": { answer: { id: "S01" }, gained: 10 } },
  },
};
record(invalidEventState, q, good, "corrupt:0");
assert.equal(invalidEventState.attempts["decision:S01"].correct, 1);
assert.equal(
  importLegacy(invalidEventState, {
    state: { mistakes: [{ id: "__proto__" }] },
  }).count,
  0,
);

assert(html.includes('decisionPracticePanel'));assert(html.includes('practiceResumeSlot'));assert(html.includes('data-practice-mode="observe"'));assert(html.includes('waitingWorker.postMessage'));
