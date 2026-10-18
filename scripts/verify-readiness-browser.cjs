const fs = require("fs"),
  path = require("path"),
  http = require("http"),
  { chromium } = require("playwright"),
  assert = require("node:assert/strict");
const root = process.cwd(),
  evidence = path.resolve(
    process.env.K53_EVIDENCE_DIR || "artifacts/browser-decision",
  );
fs.mkdirSync(evidence, { recursive: true });
let browser;
const out = { checks: [], errors: [] };
function rec(name, data = {}) {
  out.checks.push({ name, ...data });
  fs.writeFileSync(evidence + "/results.json", JSON.stringify(out, null, 2));
  console.log(name, JSON.stringify(data));
}
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};
const server = http.createServer((req, res) => {
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
  await p.goto("http://localhost:8085/", { waitUntil: "domcontentloaded" });
  await p.locator('[data-go="drive"]').first().click();
  await p.locator("#decisionTimed").waitFor();
  rec("host entry and single shell", {
    topbars: await p.locator(".topbar").count(),
    headings: await p.locator("h2").allTextContents(),
  });
  assert.equal(await p.locator(".topbar").count(), 1);
  const { BANK, ROUTES } = await import("../assets/decision/bank.js");
  await p.evaluate(() => {
    const s = window.__K53.state;
    s.sessions = { 1: true, 2: true, 3: true };
    s.mastery = { 1: 95, 2: 95, 3: 95 };
    s.secPass = { signs: true, rules: true, controls: true };
    s.acc = { correct: 60, total: 64 };
    s.mockPass = true;
    s.review = [];
    s.attempts = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [
        "old:" + i,
        { q: "Existing concept " + i, correct: 2, wrong: 0 },
      ]),
    );
    window.__K53.save();
    renderHome();
  });
  const initial = await p.evaluate(() => readiness().score);
  assert.equal(initial, 80);
  assert.match(await p.locator("#app").innerText(), /80% practice readiness/);
  await p.locator(".tool-disclosure summary").click();
  await p.locator('[data-go="signlibrary"]').click();
  await p.locator("#signCategory").selectOption("concepts");
  await p.locator("#signSearch").fill("Red octagonal");
  await p.locator('[data-practice-id="S01"]').click();
  await p.locator('[data-choice="1"]').click();
  await p.locator("#decisionNext").click();
  await p.locator("#decisionHome").click();
  await p.locator('.practice-back [data-go="home"]').click();
  assert.equal(await p.evaluate(() => readiness().decision.unresolved), 1);
  assert.match(
    await p.locator("#next-title").innerText(),
    /Repair your road decisions/,
  );
  const afterMiss = await p.evaluate(() => readiness().score);
  assert(afterMiss < initial);
  rec("missed decision changes main readiness and next-best action", {
    before: initial,
    after: afterMiss,
  });
  await p.locator('[data-practice-mode="weak"]').click();
  assert.equal(
    await p.locator("[data-question-id]").getAttribute("data-question-id"),
    "S01",
  );
  await p.locator('[data-choice="0"]').click();
  await p.locator("#decisionNext").click();
  await p.locator("#decisionHome").click();
  await p.locator('.practice-back [data-go="home"]').click();
  const improved = await p.evaluate(() => readiness());
  assert.equal(improved.decision.unresolved, 0);
  assert(improved.score > afterMiss);
  assert.equal(improved.decision.topics.signs.seen, 1);
  assert.match(
    await p.locator("#app").innerText(),
    new RegExp(improved.score + "% practice readiness"),
  );
  rec("correcting shared weakness raises actual main readiness", {
    before: afterMiss,
    after: improved.score,
  });
  await p.locator('[data-go="practice"]').first().click();
  await p.locator("#decisionTimed").waitFor();
  assert.match(await p.locator("#drillSigns").innerText(), /28 source-linked/);
  await p.locator("#drillSigns").click();
  let count = 0;
  while (!(await p.locator("#drillAgain").count())) {
    const right = await p.evaluate(() => {
      const title = document.querySelector("#app h2").textContent,
        img = document.querySelector(".question-art img")?.getAttribute("src");
      const match = buildDrill("signs").find(
        (q) => q.q === title && (!img || q.svg?.includes(img)),
      );
      if (!match) throw Error("Unknown rendered question " + title);
      return match.opts[match.ans];
    });
    await p.getByRole("button", { name: right, exact: true }).click();
    await p.locator(".next").click();
    count++;
    assert(count <= 112);
  }
  assert.equal(count, 112);
  assert.match(await p.locator(".result-sub").innerText(), /112\/112/);
  assert.equal(
    await p.evaluate(
      () =>
        Object.keys(window.__K53.state.attempts).filter((k) =>
          /^decision:S/.test(k),
        ).length,
    ),
    28,
  );
  rec(
    "original Signs drill completes all 112 questions with canonical decision scoring",
    { count },
  );
  await p.locator('[data-practice-mode="signs"]').click();
  await p.locator("[data-question-id]").waitFor();
  assert.match(
    await p.locator("[data-question-id]").getAttribute("data-question-id"),
    /^S/,
  );
  rec("existing drill results offer one-tap targeted decision practice");
  await p.locator('.practice-back [data-go="practice"]').click();await p.locator('#decisionConfirm').click();await p.locator('#decisionTimed').waitFor();
  await p.locator("#decisionDiscard").click();await p.locator("#decisionConfirm").click();await p.locator("#decisionTimed").waitFor();
  await p.evaluate(()=>{window.__K53.state.mockResults={rules:{correct:12,total:28,answered:28,pass:false,need:22}};window.__K53.state.secPass={rules:false};finishMock('rules');});
  await p.locator('[data-practice-mode="rules"]').click();await p.locator('[data-question-id]').waitFor();assert.match(await p.locator('[data-question-id]').getAttribute('data-question-id'),/^R/);rec('actual mock result offers one-tap practice of its weakest section');
  assert.deepEqual(out.errors, []);
  rec("no readiness or shared-bank browser errors", {
    count: out.errors.length,
  });
  await browser.close();
  await new Promise((r) => server.close(r));
})().catch(async (e) => {
  rec("FAILED", { error: e.stack });
  await browser?.close().catch(() => {});
  server.close();
  process.exitCode = 1;
});
