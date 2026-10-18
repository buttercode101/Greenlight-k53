import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import {
  getPracticeQuestions,
  recordChoiceAttempt,
} from "../assets/decision/practice.js";
const html = fs.readFileSync("index.html", "utf8"),
  window = {};
const ctx = vm.createContext({
  window,
  console,
  Math,
  Date,
  crypto,
  localStorage: { getItem: () => null, setItem() {} },
});
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], ctx);
const K = window.__K53;
ctx.K = K;
K.decisionQuestions = (topic) =>
  getPracticeQuestions(topic, K.state.vehicleCode);
K.recordDecisionQuestion = (q, ok) => recordChoiceAttempt(K.state, q, ok);
function load(a, b) {
  vm.runInContext(
    html.slice(html.indexOf(a), html.indexOf(b, html.indexOf(a))),
    ctx,
  );
}
load("function buildDrill(", "function drill(");
load("function buildSection(", "function openMock(");
load("function recordAttempt(", "function bookmarkButton(");
assert.equal(getPracticeQuestions("mixed").length, 77);
assert.equal(getPracticeQuestions("signs").length, 28);
assert.equal(getPracticeQuestions("rules").length, 34);
assert.equal(getPracticeQuestions("controls").length, 10);
assert.equal(getPracticeQuestions("mixed", "1").length, 0);
const identity = (q) =>
  q.decisionId || [q.svg || "", q.q, q.opts[q.ans]].join("|");
for (const [topic, count] of [
  ["signs", 112],
  ["rules", 131],
  ["controls", 37],
]) {
  const pool = ctx.buildDrill(topic);
  assert.equal(pool.length, count);
  assert.equal(new Set(pool.map(identity)).size, count);
  for (const q of pool.filter((q) => q.decisionId)) {
    assert(q.source.section && q.decisionEventId);
    assert(q.opts.length >= 2 && q.ans >= 0 && q.ans < q.opts.length);
  }
  const papers = [1, 2, 3].map((n) => ctx.buildSection(topic, n));
  assert.equal(
    new Set(papers.flat().map(identity)).size,
    topic === "controls" ? 24 : 84,
  );
  assert(papers.flat().some((q) => q.decisionId));
  const seen = new Set(papers.flat().map(identity));
  assert(
    ctx.buildSection(topic, 4).some((q) => !seen.has(identity(q))),
    "Later papers must reach beyond the first three rosters",
  );
}
const q = getPracticeQuestions("signs")[0];
ctx.recordAttempt(q, false);
ctx.recordAttempt(q, false);
assert.equal(
  K.state.review.filter((r) => r.decisionId === q.decisionId).length,
  1,
);
assert.equal(K.state.attempts["decision:" + q.decisionId].wrong, 1);
const retry = { ...q, decisionEventId: crypto.randomUUID() };
ctx.recordAttempt(retry, true);
assert.equal(
  K.state.review.find((r) => r.decisionId === q.decisionId).level,
  1,
);
assert.equal(K.state.attempts["decision:" + q.decisionId].correct, 1);
K.state.vehicleCode = "1";
assert.equal(
  ctx.buildDrill("controls").some((q) => q.decisionId),
  false,
);
console.log(
  "Shared bank: 72 source-linked MCQs join original drills and mocks (112 signs, 131 rules, 37 controls for Code 2); unique rotating papers, canonical scoring/review and Code 1 isolation passed.",
);
