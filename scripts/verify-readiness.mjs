import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import { BANK } from "../assets/decision/bank.js";
import { record } from "../assets/decision/model.js";
const html = fs.readFileSync("index.html", "utf8");
const start = html.indexOf("function mockAcc()"),
  end = html.indexOf("async function openSignLibrary()", start);
const state = {
  vehicleCode: "2",
  sessions: { 1: true, 2: true, 3: true },
  mastery: { 1: 95, 2: 95, 3: 95 },
  secPass: { signs: true, rules: true, controls: true },
  acc: { correct: 60, total: 64 },
  mockPass: true,
  attempts: Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [
      "old:" + i,
      { q: "Old concept " + i, correct: 2, wrong: 0 },
    ]),
  ),
  review: [],
};
const ctx = vm.createContext({
  K: { state },
  visibleForCode: () => true,
  safeHTML: String,
});
vm.runInContext(html.slice(start, end), ctx);
const empty = ctx.readiness();
assert.equal(empty.score, 80);
assert.equal(empty.decision.completed, 0);
assert.match(empty.msg, /Build evidence/);
let serial = 0;
function answer(id, full = true) {
  const q = BANK.find((q) => q.id === id);
  record(
    state,
    q,
    {
      id,
      full,
      partial: false,
      helped: false,
      choiceOk: full,
      orderOk: q.order ? full : null,
      timedOut: false,
      choice: q.options.length ? q.correct : null,
    },
    "readiness:" + serial++,
  );
}
answer("S01");
assert(ctx.readiness().score > empty.score);
answer("R01", false);
assert.equal(ctx.readiness().decision.unresolved, 1);
assert.match(ctx.readiness().verdict, /Resolve/);
answer("R01");
assert.equal(ctx.readiness().decision.unresolved, 0);
for (const [prefix, count] of [
  ["S", 6],
  ["R", 8],
  ["C", 4],
  ["O", 4],
])
  for (let i = 1; i <= count; i++) {
    const id = prefix + String(i).padStart(2, "0");
    for (let n = 0; n < 5; n++) answer(id);
  }
assert.equal(ctx.readiness().score, 100);
assert.equal(ctx.readiness().decision.sufficient, true);
assert.equal(ctx.readiness().decision.completed, 22);
for (let n = 0; n < 5; n++) answer("S01", false);
const weak = ctx.readiness();
assert(weak.score < 100);
assert(weak.score <= 84);
assert.equal(weak.decision.topics.signs.unresolved, 1);
assert(weak.decision.topics.signs.accuracy < 100);
for (let n = 0; n < 5; n++) answer("S01");
assert.equal(ctx.readiness().score, 100);
state.vehicleCode = "1";
assert.equal(ctx.readiness().decision, null);
assert(ctx.readiness().score <= 79);
state.vehicleCode = "2";
const helper = html.slice(
  html.indexOf("function mockDecisionFollowup("),
  html.indexOf("function finishMock("),
);
vm.runInContext(helper, ctx);
assert.match(
  ctx.mockDecisionFollowup({
    rules: { correct: 10, total: 28 },
    signs: { correct: 26, total: 28 },
  }),
  /data-practice-mode="rules"/,
);
assert.match(
  html,
  /data-practice-mode="\$\{\(\{1:'signs',2:'rules',3:'controls'\}\)\[sessNum\]\}"/,
);
console.log(
  "Readiness integration: decision accuracy, unique coverage, persistent mistakes, recent performance, correction recovery, vehicle scope and targeted mock follow-ups passed.",
);

ctx.ringFor=n=>state.mastery[n]||0;ctx.reviewDue=()=>state.review.filter(r=>!(r.level>0)||r.due<=Date.now());vm.runInContext(html.match(/^function nextStep\(\)[^\n]+/m)[0],ctx);state.review=[];for(const key of Object.keys(state.attempts))if(key.startsWith('decision:O'))delete state.attempts[key];assert.equal(ctx.nextStep().mode,'observe');answer('R01',false);assert.equal(ctx.nextStep().go,'review');
