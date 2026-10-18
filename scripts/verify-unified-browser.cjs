const fs = require("fs"),
  path = require("path"),
  http = require("http"),
  { chromium } = require("playwright"),
  assert = require("node:assert/strict");
let old = false,
  browser;
const current = process.cwd(),
  previous =
    process.env.K53_BASELINE_ROOT ||
    fs.mkdtempSync(path.join(require("os").tmpdir(), "k53-baseline-")),
  evidence = process.env.K53_EVIDENCE_DIR || "artifacts/browser-unified",
  out = { checks: [], errors: [] };
if (!process.env.K53_BASELINE_ROOT) {
  const cp = require("child_process");
  const archive = cp.execFileSync(
    "git",
    ["archive", "--format=tar", "f470ece6d3a74574737fd339953be305bf01af50"],
    { maxBuffer: 32 * 1024 * 1024 },
  );
  cp.execFileSync("tar", ["-x", "-C", previous], { input: archive });
}
fs.mkdirSync(evidence, { recursive: true });
function rec(name, data = {}) {
  out.checks.push({ name, ...data });
  fs.writeFileSync(evidence + "/results.json", JSON.stringify(out, null, 2));
  console.log(name, JSON.stringify(data));
}
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};
const server = http.createServer((req, res) => {
  const root = old ? previous : current;
  let file = path.resolve(
    root,
    "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
  );
  if (file === root) file += "/index.html";
  if (!file.startsWith(root + "/")) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
(async () => {
  await new Promise((r) => server.listen(8085, "127.0.0.1", r));
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: "Africa/Johannesburg",
  });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => out.errors.push(e.message));
  for (const suffix of [
    "#practice",
    "#decision",
    "?go=practice",
    "?go=decision",
  ]) {
    await p.goto("http://localhost:8085/" + suffix, {
      waitUntil: "domcontentloaded",
    });
    await p.locator("#decisionTimed").waitFor();
    assert.equal(await p.locator("#drillSigns").count(), 1);
    const sizes=await p.locator("#drillSigns .ti,#drillRules .ti,#drillCtrl .ti,#drillMixed .ti").evaluateAll(nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));assert.equal(sizes.length,4);assert(sizes.every(s=>s.w<=24&&s.h<=24));
    assert.equal(await p.locator(".topbar").count(), 1);
    assert.doesNotMatch(
      await p.locator("#app").innerText(),
      /\bXP\b|Open shared review/,
    );
    rec("one catalogue at " + suffix);
  }
  for (const [page, mode] of [
    ["session1", "signs"],
    ["session2", "rules"],
    ["session3", "controls"],
    ["practical", "observe"],
  ]) {
    await p.goto("http://localhost:8085/", { waitUntil: "domcontentloaded" });
    await p.evaluate(() => {
      sessionStorage.clear();
    });
    if (page !== "practical") await p.locator('[data-go="learn"]').first().click();
    if (page === "practical") {
      await p.locator('[data-go="journey"]').first().click();
      await p.locator(".plan-route").last().locator("summary").first().click();
    }
    await p.locator(`[data-go="${page}"]`).first().click();
    await p.locator(`[data-practice-mode="${mode}"]`).click();
    await p
      .locator("[data-question-id]")
      .waitFor({ timeout: 8000 })
      .catch(async (e) => {
        fs.writeFileSync(
          evidence + "/failure.txt",
          await p.locator("body").innerText(),
        );
        throw e;
      });
    assert.equal(await p.locator(".topbar").count(), 1);
    assert.match(p.url(), /#practice\/resume$/);
    await p.locator('.practice-back [data-go="practice"]').click();
    await p.locator("#decisionConfirm").click();
    await p.locator("#decisionTimed").waitFor();
    assert.equal(await p.locator("#drillSigns").count(), 1);
    rec("lesson to exercise to Practise " + page);
    await p.locator("#decisionDiscard").click();
    await p.locator("#decisionConfirm").click();
  }
  await p.goto("http://localhost:8085/#practice/signs", {
    waitUntil: "domcontentloaded",
  });
  await p.locator("[data-question-id]").waitFor();
  rec("direct exercise link opens the actual player");
  await ctx.close();
  old = true;
  const legacy = await browser.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: "Africa/Johannesburg",
  });
  const q = await legacy.newPage();
  q.on("pageerror", (e) => out.errors.push(e.message));
  await q.goto("http://localhost:8085/", { waitUntil: "domcontentloaded" });
  await q.evaluate(async () => {
    await navigator.serviceWorker.ready;
    window.__K53.state.sessions[1] = true;
    window.__K53.state.bookmarks.keep = {
      q: "Existing bookmark",
      a: "Preserved",
    };
    window.__K53.save();
    await caches.open("unrelated-cache");
  });
  await q.reload({ waitUntil: "domcontentloaded" });
  await q.locator('[data-go="decision"]').first().click();
  await q.locator('[data-decision-mode="signs"]').click();
  const { BANK } = await import("../assets/decision/bank.js");
  let id = await q
    .locator("[data-question-id]")
    .getAttribute("data-question-id");
  await q
    .locator(`[data-choice="${BANK.find((x) => x.id === id).correct}"]`)
    .click();
  await q.locator("#decisionNext").click();
  const checkpoint = await q.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  old = false;
  await q.reload({ waitUntil: "domcontentloaded" });
  await q.locator("#resumeRoadPractice").waitFor();
  await q.locator("#swReload").waitFor({ timeout: 30000 });
  rec("existing cached app sees new Home recovery and pending update");
  await q.locator("#resumeRoadPractice").click();
  await q.locator("#decisionConfirm").click();
  await q.waitForTimeout(1200);
  assert.equal(await q.locator("#swReload").isDisabled(), true);
  const after = await q.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  assert.deepEqual(after.ids, checkpoint.ids);
  assert.deepEqual(after.options, checkpoint.options);
  assert.deepEqual(after.answers, checkpoint.answers);
  assert.equal(after.index, checkpoint.index);
  rec("update blocked during active practice; exact old checkpoint preserved");
  await q.locator('.practice-back [data-go="practice"]').click();
  await q.locator("#decisionConfirm").click();
  await q.locator("#decisionTimed").waitFor();
  await q.waitForFunction(() => !document.getElementById("swReload").disabled);
  await Promise.all([
    q.waitForEvent("domcontentloaded"),
    q.locator("#swReload").click(),
  ]);
  await q.locator("#decisionTimed").waitFor();
  const state = await q.evaluate(() => ({
    keys: window.__K53.state.bookmarks,
    sessions: window.__K53.state.sessions,
    saved: JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  }));
  assert.equal(state.keys.keep.q, "Existing bookmark");
  assert.equal(state.sessions[1], true);
  assert.deepEqual(state.saved.answers, checkpoint.answers);
  const keys = await q.evaluate(() => caches.keys());
  assert(keys.includes("unrelated-cache"));
  assert(keys.includes("greenlight-k53-v28-readers"));
  assert(!keys.includes("greenlight-k53-v23-decision"));
  rec("safe update preserves old study progress and unrelated caches");
  await legacy.setOffline(true);
  await q.reload({ waitUntil: "domcontentloaded" });
  await q.locator("#decisionTimed").waitFor();
  assert.equal(await q.locator("#drillSigns").count(), 1);
  await q.locator("#decisionResume").click();
  await q.locator("#decisionConfirm").click();
  assert.equal(
    await q.locator("[data-question-id]").getAttribute("data-question-id"),
    checkpoint.ids[checkpoint.index],
  );
  rec("upgraded app opens unified Practise and exact saved attempt offline");
  assert.deepEqual(out.errors, []);
  rec("no uncaught integration errors", { count: out.errors.length });
  await browser.close();
  await new Promise((r) => server.close(r));
})().catch(async (e) => {
  rec("FAILED", { error: e.stack });
  await browser?.close().catch(() => {});
  server.close();
  process.exitCode = 1;
});
