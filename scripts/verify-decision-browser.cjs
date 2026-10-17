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
  await p.locator('[data-go="decision"]').first().click();
  await p.locator("#decisionTimed").waitFor();
  rec("host entry and single shell", {
    topbars: await p.locator(".topbar").count(),
    headings: await p.locator("h2").allTextContents(),
  });
  assert.equal(await p.locator(".topbar").count(), 1);
  const { BANK, ROUTES } = await import("../assets/decision/bank.js");
  async function solve() {
    let count = 0;
    for (let guard = 0; guard < 900; guard++) {
      if (await p.locator("#decisionBegin").count()) {
        await p.locator("#decisionBegin").click();
        continue;
      }
      if (await p.locator("#decisionHome").count())
        return { count, text: await p.locator("#app").innerText() };
      if (await p.locator("#decisionSection").count()) {
        await p.locator("#decisionSection").click();
        continue;
      }
      const panel = p.locator("[data-question-id]");
      await panel.waitFor();
      const id = await panel.getAttribute("data-question-id"),
        q = BANK.find((q) => q.id === id);
      assert(q, "known bank ID");
      if ((await panel.getAttribute("data-phase")) === "reveal") {
        count++;
        await p.locator("#decisionNext").click();
        continue;
      }
      for (const label of q.order || []) {
        const chip = p.getByRole("button", { name: label, exact: true });
        if (await chip.count()) await chip.click();
      }
      if (
        q.options.length &&
        (await panel.getAttribute("data-phase")) !== "reveal"
      )
        await panel.locator(`[data-choice="${q.correct}"]`).click();
      assert.equal(await panel.getAttribute("data-phase"), "reveal");
      count++;
      await p.locator("#decisionNext").click();
    }
    throw Error("player loop exhausted");
  }
  for (const mode of [
    "signs",
    "rules",
    "observe",
    "controls",
    "mixed",
    "daily",
    "paper",
  ]) {
    await p.locator(`[data-decision-mode="${mode}"]`).click();
    const r = await solve();
    assert.match(r.text, /100% practice accuracy/);
    rec("merged " + mode, { count: r.count });
    await p.locator("#decisionHome").click();
  }
  for (const route of ROUTES) {
    await p.locator(`[data-decision-route="${route.id}"]`).click();
    const r = await solve();
    assert.equal(r.count, route.ids.length);
    rec("merged route " + route.id, { count: r.count });
    await p.locator("#decisionHome").click();
  }
  await p.evaluate(async () => {
    const { reviewQuestion } = await import("/assets/decision/model.js");
    const { BANK } = await import("/assets/decision/bank.js");
    const K = window.__K53;
    K.state.review = BANK.map((q) => ({
      ...reviewQuestion(q),
      level: 0,
      misses: 1,
      due: 0,
    }));
    K.save();
  });
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator('[data-decision-mode="weak"]').click();
  const all = await solve();
  assert.equal(all.count, 82);
  assert.match(all.text, /100% practice accuracy/);
  assert.equal(
    await p.evaluate(
      () =>
        window.__K53.state.review.filter((r) => r.decisionId && r.level === 0)
          .length,
    ),
    0,
  );
  rec("all 82 cards through merged UI and shared review", { count: all.count });
  await p.locator("#decisionHome").click();
  for (const width of [320, 390, 480, 768, 834, 1024, 1440, 1920]) {
    await p.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await p.evaluate((t) => {
        window.__K53.applyTheme(t === "dark");
      }, theme);
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "horizontal overflow " + width + theme,
      );
    }
    rec("layout " + width, { themes: ["light", "dark"] });
  }
  await p.setViewportSize({ width: 390, height: 844 });
  await p.screenshot({ path: evidence + "/mobile-dark.png", fullPage: true });
  await p.evaluate(() => window.__K53.applyTheme(false));
  await p.screenshot({ path: evidence + "/mobile-light.png", fullPage: true });
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({ path: evidence + "/desktop.png", fullPage: true });
  await p.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await ctx.setOffline(true);
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.locator('[data-go="decision"]').first().click();
  await p.locator('[data-decision-mode="mixed"]').click();
  const offline = await solve();
  assert.equal(offline.count, 12);
  assert.match(offline.text, /100% practice accuracy/);
  rec("offline cold host reload, module import and full drill", {
    count: offline.count,
  });
  await ctx.setOffline(false);
  await p.locator("#decisionHome").click();
  const decoded = await p.evaluate(async () => {
    const { BANK } = await import("/assets/decision/bank.js");
    return Promise.all(
      BANK.filter((q) => q.sign || q.scene).map(
        (q) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ id: q.id, ok: img.naturalWidth > 0 });
            img.onerror = () => resolve({ id: q.id, ok: false });
            img.src = "/assets/decision/art/" + q.id + ".svg";
          }),
      ),
    );
  });
  assert(decoded.every((x) => x.ok));
  rec("every decision illustration decodes in browser", {
    count: decoded.length,
  });
  for (const code of ["1", "2", "3"]) {
    await p.goto("http://localhost:8085/", { waitUntil: "domcontentloaded" });
    await p.evaluate((code) => {
      setVehicleCode(code);
      renderHome();
    }, code);
    await p.locator('[data-go="sim"]').first().click();
    await p.locator("#simNoTime").click();
    for (let i = 0; i < 64; i++) {
      const c = await p.evaluate(() => window.__K53.state.activeAssessment);
      assert(c?.mode === "sim");
      const answer = c.questions[c.i].ans;
      await p.locator(`.opt[data-i="${answer}"]`).click();
      if (i === 0) {
        const snapshot = await p.evaluate(() =>
          structuredClone(window.__K53.state.activeAssessment),
        );
        await p.reload({ waitUntil: "domcontentloaded" });
        await p.locator("#resumeAssessment").click();
        assert.deepEqual(
          await p.evaluate(() => window.__K53.state.activeAssessment),
          {
            ...snapshot,
            questions: snapshot.questions.map((q) => ({
              ...q,
              svg: q.svg || "",
              ex: q.ex || "",
            })),
          },
        );
        assert.equal(await p.locator(".opt:enabled").count(), 0);
      }
      await p.locator(".next").click();
    }
    assert.match(await p.locator("#app").innerText(), /64\/64 overall/);
    assert.match(
      await p.locator(".result-title").innerText(),
      /Practice test passed/,
    );
    rec("existing full simulation and locked-answer recovery Code " + code, {
      count: 64,
    });
  }
  assert.deepEqual(out.errors, []);
  rec("uncaught merged page errors", { count: out.errors.length });
  await browser.close();
  await new Promise((r) => server.close(r));
})().catch(async (e) => {
  rec("FAILED", { error: e.stack });
  await browser?.close().catch(() => {});
  server.close();
  process.exitCode = 1;
});
