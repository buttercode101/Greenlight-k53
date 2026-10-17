const fs = require("fs"),
  path = require("path"),
  http = require("http"),
  { chromium } = require("playwright"),
  assert = require("node:assert/strict");
const root = process.cwd(),
  evidence = path.resolve(
    process.env.K53_EVIDENCE_DIR || "artifacts/browser-decision-edge",
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
  await p.locator('[data-go="decision"]').first().click();
  await p.locator("#decisionTimed").waitFor();
  rec("host entry and single shell", {
    topbars: await p.locator(".topbar").count(),
    headings: await p.locator("h2").allTextContents(),
  });
  assert.equal(await p.locator(".topbar").count(), 1);
  const { BANK, ROUTES } = await import("../assets/decision/bank.js");
  async function fresh() {
    await p.goto("http://localhost:8085/", { waitUntil: "domcontentloaded" });
    await p.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await p.reload({ waitUntil: "domcontentloaded" });
    await p.locator('[data-go="decision"]').first().click();
    await p.locator("#decisionTimed").waitFor();
  }
  async function seed(ids) {
    await p.evaluate(async (ids) => {
      const { reviewQuestion, BY_ID } =
        await import("/assets/decision/model.js");
      window.__K53.state.review = ids.map((id) => ({
        ...reviewQuestion(BY_ID[id]),
        level: 0,
        misses: 1,
        due: 0,
      }));
      window.__K53.save();
    }, ids);
    await p.reload({ waitUntil: "domcontentloaded" });
    await p.locator('[data-go="decision"]').first().click();
  }
  async function pickCorrect() {
    const id = await p
      .locator("[data-question-id]")
      .getAttribute("data-question-id");
    const q = BANK.find((q) => q.id === id);
    await p.locator(`[data-choice="${q.correct}"]`).click();
    return q;
  }
  assert.equal(await p.locator("#decisionStorageStatus").count(), 0);
  await p.locator('[data-decision-mode="signs"]').click();
  assert.equal(await p.locator("#decisionStorageStatus").count(), 0);
  rec("successful saves never show a storage warning");
  await fresh();
  await p.locator("#decisionTimed").click();
  await p.locator('[data-decision-mode="signs"]').click();
  await p.waitForTimeout(1500);
  const initial = await p.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator("#decisionResume").click();
  const recovered = await p.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  assert.deepEqual(recovered.ids, initial.ids);
  assert.deepEqual(recovered.options, initial.options);
  assert(recovered.remainingMs <= initial.remainingMs);
  assert.equal(await p.getByRole("dialog").count(), 1);
  const before = await p.evaluate(
    () => Object.keys(window.__K53.state.decision.events).length,
  );
  await p.evaluate(() => {
    document.querySelector("[data-choice]")?.click();
    document.querySelector("[data-choice]")?.focus();
  });
  assert.equal(
    await p.evaluate(
      () => Object.keys(window.__K53.state.decision.events).length,
    ),
    before,
  );
  assert(await p.evaluate(() => !!document.activeElement.closest("dialog")));
  await p.locator("#decisionConfirm").click();
  rec("first-answer recovery, exact choices, timer and modal isolation", {
    id: initial.ids[0],
    remainingMs: recovered.remainingMs,
  });
  await p.locator('[data-go="home"]').first().click();
  const savedWhileLeaving = await p.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  await p.waitForTimeout(14000);
  assert.equal(
    await p.evaluate(
      () => Object.keys(window.__K53.state.decision.events).length,
    ),
    before,
  );
  assert.equal(savedWhileLeaving.paused, true);
  await p.locator("#decisionCancel").click();
  const resumed = await p.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  assert.equal(resumed.remainingMs, savedWhileLeaving.remainingMs);
  await p.locator('[data-go="home"]').first().click();
  await p.locator("#decisionConfirm").click();
  assert.equal(await p.locator("[data-question-id]").count(), 0);
  rec("leave confirmation freezes time and navigation stops player");
  await fresh();
  await seed(["O02"]);
  await p.locator('[data-decision-mode="weak"]').click();
  await p
    .getByRole("button", {
      name: BANK.find((q) => q.id === "O02").order[0],
      exact: true,
    })
    .click();
  const partial = await p.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator("#decisionResume").click();
  await p.locator("#decisionConfirm").click();
  const after = await p.evaluate(() =>
    JSON.parse(sessionStorage.getItem("k53-decision-active-v2")),
  );
  assert.deepEqual(after.picked, partial.picked);
  assert.deepEqual(after.pool, partial.pool);
  assert.equal(after.ids[after.index], "O02");
  rec("partial observation checkpoint survives reload", {
    picked: after.picked,
  });
  await fresh();
  await p.locator('[data-decision-mode="signs"]').click();
  await p.locator("#decisionHint").click();
  await pickCorrect();
  const hint = await p.getByRole("status").last().innerText();
  assert.match(hint, /Right, with help/);
  assert.doesNotMatch(hint, /out of order/);
  const stats = await p.evaluate(() =>
    structuredClone(window.__K53.state.attempts),
  );
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator("#decisionResume").click();
  assert.deepEqual(await p.evaluate(() => window.__K53.state.attempts), stats);
  rec("hint feedback and reveal reload do not duplicate scoring");
  await fresh();
  await seed(["O01"]);
  await p.locator('[data-decision-mode="weak"]').click();
  await p.getByRole("button", { name: "Signal right", exact: true }).click();
  await pickCorrect();
  assert.match(
    await p.getByRole("status").last().innerText(),
    /checks were out of order/,
  );
  assert.equal(await p.evaluate(() => window.__K53.state.decision.xp), 5);
  rec("partial observation earns partial credit and stays due");
  await fresh();
  await p.locator('[data-decision-mode="signs"]').click();
  await p.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("test quota failure", "QuotaExceededError");
    };
  });
  await pickCorrect();
  assert.equal(await p.locator("#decisionNext").count(), 1);
  assert.equal(await p.locator("#storageStatus").count(), 1);
  assert.equal(
    await p.evaluate(() => Object.keys(window.__K53.state.attempts).length),
    1,
  );
  rec("denied storage keeps answering and canonical in-memory progress");
  await fresh();
  await seed(["O02"]);
  await p.locator('[data-go="home"]').first().click();
  await p.locator('[data-go="review"]').first().click();
  await p.locator("#reviewStart").click();
  await p.locator('[data-question-id="O02"]').waitFor();
  for (const label of BANK.find((q) => q.id === "O02").order)
    await p.getByRole("button", { name: label, exact: true }).click();
  await p.locator("#decisionNext").click();
  assert.match(await p.locator("#app").innerText(), /Review complete/);
  assert.equal(
    await p.evaluate(
      () => window.__K53.state.review.find((r) => r.decisionId === "O02").level,
    ),
    1,
  );
  rec(
    "shared review retries the full observation task and schedules next review",
  );
  await fresh();
  await p.evaluate(() => {
    setVehicleCode("1");
    renderHome();
  });
  await p.locator('[data-go="decision"]').first().click();
  assert.equal(await p.locator("[data-decision-mode]").count(), 0);
  assert.match(await p.locator("#app").innerText(), /Code 1 study material/);
  rec("vehicle-code scope protects motorcycle users");
  await fresh();
  await p.evaluate(() => {
    localStorage.setItem(
      "gld-drive-v1",
      JSON.stringify({
        state: { xp: 1500, mistakes: [{ id: "O02" }, { id: "bad" }] },
      }),
    );
    window.__K53.state.sessions[1] = true;
    window.__K53.state.bookmarks.legacy = { q: "Keep me", a: "yes" };
    window.__K53.save();
  });
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator("#decisionImport").click();
  assert.equal(await p.locator("#decisionImport").count(), 0);
  const migrated = await p.evaluate(() => ({
    d: window.__K53.state.decision,
    sessions: window.__K53.state.sessions,
    bookmarks: window.__K53.state.bookmarks,
    review: window.__K53.state.review,
  }));
  assert.equal(migrated.review.length, 1);
  assert.equal(migrated.d.xp, 0);
  assert.equal(migrated.d.legacyActivityXp, 1500);
  assert.equal(migrated.sessions[1], true);
  assert.equal(migrated.bookmarks.legacy.q, "Keep me");
  rec("idempotent same-origin import preserves existing study history");
  await fresh();
  await p.evaluate(() => {
    window.__K53.state.decision = { version: 1, timed: true };
    window.__K53.save();
  });
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator('[data-decision-mode="signs"]').click();
  const timedId = await p
    .locator("[data-question-id]")
    .getAttribute("data-question-id");
  await p.waitForTimeout(
    BANK.find((q) => q.id === timedId).seconds * 1000 + 500,
  );
  assert.match(await p.getByRole("status").last().innerText(), /Time ran out/);
  assert.equal(await p.evaluate(() => window.__K53.state.decision.xp), 0);
  rec("timed-out answer records once and gives no XP");
  assert.deepEqual(out.errors, []);
  rec("uncaught regression page errors", { count: out.errors.length });
  await browser.close();
  await new Promise((r) => server.close(r));
})().catch(async (e) => {
  rec("FAILED", { error: e.stack });
  await browser?.close().catch(() => {});
  server.close();
  process.exitCode = 1;
});
