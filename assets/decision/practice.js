import { BANK, ROUTES } from "./bank.js?v=31";
import { makeRun, runFromSave, shuffle } from "./engine.js?v=31";
import {
  newSave,
  nextCard,
  readSave,
  writeSave,
  clearSave,
  pauseSave,
  resumeSave,
  validateSave,
} from "./session.js?v=31";
import { storageWarning } from "./storage.js?v=31";
import { questionSource } from "./sources.js?v=31";
import {
  BY_ID,
  progress,
  record,
  finish,
  weakIds,
  importLegacy,
} from "./model.js?v=31";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let host,
  saved = null,
  run = null,
  timer = null,
  dialog = null,
  active = false,
  completeCallback = null;
const root = () => host.root;
const current = () => saved && BY_ID[saved.ids[saved.index]];
const live = () => active && saved && ["answer", "order"].includes(saved.phase);
const checkpoint = () => {
  if (saved) writeSave(saved);
};
function update(next) {
  saved = next;
  checkpoint();
}
function commitSave() {
  host.save();
  host.storageStatus();
}
function focusHeading() {
  root()
    .querySelector("[data-decision-heading]")
    ?.focus({ preventScroll: true });
}
function wrap(body, title = "Practise") {
  root().innerHTML =
    host.header(title) +
    `<section class="decision-screen">${storageWarning() ? '<p class="decision-notice" role="status">This browser could not save the practice checkpoint. Keep this tab open to finish.</p>' : ""}${body}</section>`;
  host.bind();
  root()
    .querySelector("[data-speak-top]")
    ?.addEventListener(
      "click",
      () => {
        if (live()) {
          pause();
          showPause();
        }
      },
      true,
    );
}
function button(id, label, kind = "btn-primary") {
  return `<button class="btn ${kind}" type="button" id="${id}">${label}</button>`;
}
function bind(id, fn) {
  root()
    .querySelector("#" + id)
    ?.addEventListener("click", fn);
}
function modal(
  title,
  copy,
  yes = "Resume",
  action = () => {},
  no = null,
  cancel = () => {},
) {
  dialog?.close();
  dialog?.remove();
  const prior = document.activeElement;
  dialog = document.createElement("dialog");
  dialog.className = "decision-modal";
  dialog.setAttribute("aria-labelledby", "decisionDialogTitle");
  dialog.innerHTML = `<h2 id="decisionDialogTitle">${esc(title)}</h2><p>${esc(copy)}</p>${button("decisionConfirm", esc(yes))}${no ? button("decisionCancel", esc(no), "btn-ghost") : ""}`;
  const d = dialog;
  document.body.append(d);
  const close = (fn) => {
    d.close();
    d.remove();
    dialog = null;
    if (prior?.isConnected) prior.focus();
    fn();
  };
  d.querySelector("#decisionConfirm").onclick = () => close(action);
  if (no) d.querySelector("#decisionCancel").onclick = () => close(cancel);
  d.addEventListener("cancel", (e) => {
    e.preventDefault();
    close(no ? cancel : action);
  });
  d.showModal();
  d.querySelector("button").focus();
}
function pause() {
  if (live() && !saved.paused) update(pauseSave(saved));
}
function resume() {
  if (saved) {
    history.replaceState(null, "", "#practice/resume");
    update(resumeSave(saved));
    render();
  }
}
function showPause() {
  pause();
  modal(
    "Paused",
    "The timer is paused. Resume when you are ready.",
    "Resume",
    resume,
  );
}
function leaveAction(action) {
  if (!active) {
    action();
    return;
  }
  pause();
  modal(
    "Leave this practice?",
    "Your exact place is saved on this device. You can resume from Practise or Home.",
    "Leave",
    () => {
      stop();
      action();
    },
    "Stay",
    resume,
  );
}
export function requestLeave(action) {
  leaveAction(action);
}
export function isActive() {
  return active;
}
function stop() {
  pause();
  active = false;
  if (timer) clearInterval(timer);
  timer = null;
  host.stopSpeech();
}
export function mount(bridge, args = {}) {
  if (host && host !== bridge) stop();
  host = bridge;
  completeCallback = args.onComplete || null;
  progress(host.state);
  stop();
  if (host.state.vehicleCode !== "2") {
    wrap(
      `<div class="block"><p class="kicker">Code ${esc(host.state.vehicleCode)}</p><h2 data-decision-heading tabindex="-1">Light-vehicle decision practice</h2><p class="lead">This selected bank covers light vehicles. Your Code ${esc(host.state.vehicleCode)} study material is available in the existing lessons and section drills.</p><button class="btn btn-primary" data-go="practice">Open your section drills</button><button class="btn btn-ghost" data-go="journey">View vehicle code</button></div>`,
    );
    return;
  }
  saved = readSave();
  if (args.ids) {
    start({
      mode: "weak",
      ids: args.ids,
      title: args.title || "Review decisions",
    });
    return;
  }
  if (args.resume && saved && (!args.mode || args.mode === saved.mode)) {
    activate(saved);
    return;
  }
  if (args.mode) {
    start(args);
    return;
  }
  home();
}
function home(message = "") {
  stop();
  host.openPractice(message);
}
export function renderPracticePanel(bridge, container, message = "") {
  if (!container?.isConnected || bridge.state.vehicleCode !== "2") return;
  host = bridge;
  completeCallback = null;
  stop();
  saved = readSave();
  const d = progress(host.state),
    weak = weakIds(host.state),
    last = d.sessions.at(-1);
  container.innerHTML = `<div class="block"><p class="kicker">Road decisions · Code 2</p><h2 id="roadPracticeTitle">Drive</h2><p class="lead">Apply what you have learned to road decisions and observation. Your results join the same progress and review queue.</p>${message ? `<p role="status" class="decision-notice">${esc(message)}</p>` : ""}${saved ? `<div class="mini"><b>Continue ${esc(saved.title)}</b><p>Question ${saved.index + 1} of ${saved.ids.length} · exact choices and timer saved.</p>${button("decisionResume", "Resume practice")}${button("decisionDiscard", "Discard saved practice", "btn-ghost")}</div>` : ""}<div class="decision-toolbar"><span>Optional timer for each decision</span>${button("decisionTimed", d.timed ? "Timed mode: on" : "Timed mode: off", "btn-soft")}</div><div class="decision-grid drive-quick">${[["mixed","Mixed road decisions","12 decisions across topics"],["observe","Observation sequences","8 step-by-step checks"],["weak","Review missed decisions",`${weak.length} decisions due`]].map(([mode,name,copy])=>`<button class="btn btn-soft" data-decision-mode="${mode}" ${mode==="weak"&&!weak.length?"disabled":""}>${name}<span class="sub">${copy}</span></button>`).join("")}</div><details class="drive-more"><summary>More Drive exercises &amp; routes</summary><div class="decision-grid">${[
    ["signs", "Sign snap", "12 sign decisions"],
    ["rules", "Right of way", "10 road decisions"],

    ["controls", "Controls", "8 light-vehicle checks"],

    ["daily", "Today's drive", "8 decisions · a fresh set each day"],
    ["paper", "Short study check", "20 questions · internal section targets"],

  ]
    .map(
      ([mode, name, copy]) =>
        `<button class="btn btn-soft" data-decision-mode="${mode}" ${mode === "weak" && !weak.length ? "disabled" : ""}>${name}<span class="sub">${copy}</span></button>`,
    )
    .join(
      "",
    )}</div><h3>Scenario routes</h3><p>Selected road decisions, not a driving-test simulation.</p><div class="decision-routes">${ROUTES.map((r) => `<button class="btn btn-ghost" data-decision-route="${r.id}">${esc(r.name)}<span class="sub">${esc(r.blurb)} · ${r.ids.length} decisions</span></button>`).join("")}</div></details>${last ? `<p class="reference-note">Last practice: ${esc(last.title)} · ${last.correct}/${last.total} full marks.</p>` : ""}<button class="btn btn-ghost" data-go="review">Review mistakes</button><details class="decision-source"><summary>Content scope and sources</summary><p>28 signs, 34 road rules, 10 observation and 10 controls cards. Source locators are shown with each question. Independent instructor review is pending. Use the official manuals for complete preparation.</p><a href="assets/decision/content-register.json" target="_blank" rel="noopener">View item-level content register</a></details>${legacyAvailable() ? button("decisionImport", "Restore earlier practice history", "btn-ghost") : ""}</div>`;
  host.bind(container);
  bind("decisionResume", () => activate(saved));
  bind("decisionDiscard", () =>
    modal(
      "Discard saved practice?",
      "Recorded answers stay in your study history. The unfinished checkpoint will be removed.",
      "Discard",
      () => {
        clearSave();
        saved = null;
        host.openPractice();
      },
      "Keep",
      () => {},
    ),
  );
  bind("decisionTimed", () => {
    d.timed = !d.timed;
    commitSave();
    home();
  });
  root()
    .querySelectorAll("[data-decision-mode]")
    .forEach(
      (b) => (b.onclick = () => start({ mode: b.dataset.decisionMode })),
    );
  root()
    .querySelectorAll("[data-decision-route]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          start({ mode: "route", routeId: b.dataset.decisionRoute })),
    );
  bind("decisionImport", () => {
    try {
      const result = importLegacy(
        host.state,
        JSON.parse(localStorage.getItem("gld-drive-v1")),
      );
      commitSave();
      home(
        result.imported
          ? `${result.count} earlier mistakes restored to Review. Your current study history is preserved.`
          : "No valid previous progress was found.",
      );
    } catch {
      home(
        "Previous progress could not be read. Current study history is unchanged.",
      );
    }
  });
}
export function renderResumeNotice(bridge, container) {
  if (!container?.isConnected || bridge.state.vehicleCode !== "2") return;
  const checkpoint = readSave();
  if (!checkpoint) {
    container.replaceChildren();
    return;
  }
  container.innerHTML = `<section class="block recovery-row"><h2>Resume ${esc(checkpoint.title)}</h2><p>Question ${checkpoint.index + 1} of ${checkpoint.ids.length}. Your exact choices and place are saved.</p><button class="btn btn-soft" id="resumeRoadPractice">Resume practice</button><button class="btn btn-ghost" data-go="practice">View practice options</button></section>`;
  bridge.bind(container);
  container.querySelector("#resumeRoadPractice").onclick = () =>
    bridge.openDecision({ resume: true });
}
function legacyAvailable() {
  try {
    return (
      !progress(host.state).legacyImported &&
      !!localStorage.getItem("gld-drive-v1")
    );
  } catch {
    return false;
  }
}
function start(args) {
  const launch = () => {
    const result = args.ids
      ? {
          mode: "weak",
          title: args.title,
          blurb: "Retry your due decisions with the complete observation task.",
          questions: args.ids.map((id) => BY_ID[id]).filter(Boolean),
          timed: progress(host.state).timed,
          rate: progress(host.state).timed ? "test" : "learn",
        }
      : makeRun({
          ...args,
          timedSetting: progress(host.state).timed,
          weakIds: weakIds(host.state),
        });
    if ("error" in result || !result.questions.length) {
      home(result.error || "No valid questions are available.");
      return;
    }
    run = result;
    clearSave();
    saved = newSave(run);
    checkpoint();
    activate(saved);
  };
  if (saved)
    modal(
      "Replace unfinished practice?",
      "Recorded answers stay in your history. Starting a new drill replaces the current checkpoint.",
      "Start new drill",
      launch,
      "Keep saved practice",
      () => {},
    );
  else launch();
}
function activate(value) {
  saved = validateSave(value);
  if (!saved) {
    clearSave();
    home(
      "The checkpoint was invalid or from an older content version. Start a new drill.",
    );
    return;
  }
  run = runFromSave(saved);
  active = true;
  history.replaceState(null, "", "#practice/resume");
  if (timer) clearInterval(timer);
  timer = setInterval(tick, 200);
  render();
  if (saved.paused) showPause();
}
function tick() {
  if (!live() || saved.paused || saved.deadline === null || dialog) return;
  const ms = Math.max(0, saved.deadline - Date.now()),
    el = root().querySelector("#decisionClock");
  if (el) el.textContent = Math.ceil(ms / 1000) + "s · Pause";
  if (ms <= 0) answer(null, true);
}
function render() {
  if (!saved || !active) return;
  const q = current(),
    src = questionSource(q),
    reveal = saved.phase === "reveal" || saved.phase === "section";
  if (saved.phase === "intro") {
    wrap(
      `<div class="block"><p class="kicker">${esc(run.title)}</p><h2 data-decision-heading tabindex="-1">Before you begin</h2><p class="lead">${esc(run.blurb)}</p><p>${saved.ids.length} questions · ${saved.timed ? "Timed questions; pausing stops the clock." : "Untimed practice."}</p>${button("decisionBegin", "Begin")}</div>`,
    );
    bind("decisionBegin", () => {
      update(
        resumeSave({ ...saved, phase: q.order?.length ? "order" : "answer" }),
      );
      render();
    });
    focusHeading();
    return;
  }
  const a = saved.answers[saved.index],
    last = saved.index === saved.ids.length - 1;
  wrap(
    `<div class="block" data-question-id="${q.id}" data-phase="${saved.phase}"><div class="decision-toolbar"><span>${esc(saved.title)} · ${saved.index + 1}/${saved.ids.length}</span>${saved.timed && !reveal ? button("decisionClock", Math.ceil((saved.deadline === null ? saved.remainingMs : Math.max(0, saved.deadline - Date.now())) / 1000) + "s · Pause", "btn-soft decision-timer") : !reveal ? button("decisionPause", "Pause", "btn-ghost") : ""}</div><div class="decision-progress" aria-hidden="true"><i style="width:${(saved.index / saved.ids.length) * 100}%"></i></div><p class="kicker">${esc(q.rule)}</p>${q.sign || q.scene ? `<img class="decision-art${q.sign ? " sign" : ""}" src="assets/decision/art/${q.id}.svg" alt="${esc(q.situation)}">` : ""}<p class="lead">${esc(q.situation)}</p><h2 data-decision-heading tabindex="-1">${esc(q.ask)}</h2>${q.order ? `<p>Observation sequence: choose each step in order.</p><ol class="decision-picked">${saved.picked.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}${saved.phase === "order" ? `<div class="decision-steps" role="group" aria-label="Observation steps">${saved.pool.map((s, i) => `<button type="button" data-step="${i}">${esc(s)}</button>`).join("")}</div>` : ""}${q.options.length && (saved.phase === "answer" || reveal) ? `<div role="group" aria-label="Answers">${saved.options.map((i) => `<button class="opt${reveal && i === q.correct ? " correct" : reveal && i === saved.choice ? " wrong" : ""}" type="button" data-choice="${i}" ${reveal ? "disabled" : ""}>${esc(q.options[i])}</button>`).join("")}</div>` : ""}${!reveal ? button("decisionHint", saved.hint ? "Hint shown" : "Show hint — assisted attempt", "btn-ghost") : ""}${saved.hint ? `<p class="decision-notice">${esc(q.rule)}. This is assisted practice; try again without help for a full mark.</p>` : ""}${reveal ? `<div class="feedback ${a.full ? "ok" : "no"}" role="status" tabindex="-1"><b>${a.full ? "Correct" : a.timedOut ? "Time ran out" : a.partial ? "Decision was right" : a.helped && a.choiceOk ? "Right, with help" : "Review this decision"}</b><p>${esc(q.why)}</p>${a.orderOk === false ? `<p>The checks were out of order. Correct order: ${q.order.map(esc).join(" → ")}.</p>` : ""}${a.helped ? "<p>This was assisted practice; it does not count as a full mark.</p>" : ""}</div>${button("decisionNext", last ? "See results" : "Continue")}` : ""}${button("decisionSpeak", "Read question aloud", "btn-ghost")}<details class="decision-source"><summary>Source and scope</summary><p><a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.title)}</a> · ${esc(src.section)}</p><p>Source checked ${esc(src.checked)} · ${esc(src.review)}.</p></details></div>`,
  );
  bind("decisionPause", showPause);
  bind("decisionClock", showPause);
  bind("decisionHint", () => {
    if (!live() || saved.paused || dialog) return;
    update({ ...saved, hint: true, assisted: true });
    render();
  });
  bind("decisionSpeak", () => {
    if (live()) {
      pause();
      showPause();
    }
    host.speak([q.situation, q.ask, ...q.options].join(". "));
  });
  root()
    .querySelectorAll("[data-step]")
    .forEach(
      (b) => (b.onclick = () => step(saved.pool[Number(b.dataset.step)])),
    );
  root()
    .querySelectorAll("[data-choice]")
    .forEach((b) => (b.onclick = () => answer(Number(b.dataset.choice))));
  bind("decisionNext", next);
  if (reveal) root().querySelector(".feedback")?.focus();
  else focusHeading();
}
function step(label) {
  if (!live() || saved.paused || dialog || saved.phase !== "order") return;
  if (saved.deadline !== null && Date.now() >= saved.deadline) {
    answer(null, true);
    return;
  }
  const q = current();
  if (label !== q.order[saved.picked.length]) {
    update({ ...saved, orderFailed: true, phase: "answer" });
    if (!q.options.length) answer(null);
    else render();
    return;
  }
  const picked = [...saved.picked, label];
  update({
    ...saved,
    picked,
    pool: saved.pool.filter((s) => s !== label),
    phase: picked.length === q.order.length ? "answer" : "order",
  });
  if (picked.length === q.order.length && !q.options.length) answer(null);
  else render();
}
function answer(choice, timedOut = false) {
  if (!live() || saved.paused || dialog) return;
  const q = current();
  if (!timedOut && saved.phase !== "answer") return;
  if (!timedOut && saved.deadline !== null && Date.now() >= saved.deadline) {
    answer(null, true);
    return;
  }
  const orderOk = q.order
      ? !saved.orderFailed && saved.picked.length === q.order.length
      : null,
    choiceOk =
      !timedOut && (q.options.length ? choice === q.correct : orderOk === true);
  const full = choiceOk && orderOk !== false && !saved.assisted && !timedOut;
  const result = {
    id: q.id,
    full,
    partial: choiceOk && orderOk === false && !timedOut,
    helped: saved.assisted,
    choiceOk,
    orderOk,
    timedOut,
    choice,
  };
  const event = record(host.state, q, result, saved.runId + ":" + saved.index);
  host.touch();
  commitSave();
  update({
    ...saved,
    phase: "reveal",
    choice: event.answer.choice,
    deadline: null,
    answers: [...saved.answers, event.answer],
    xpGained: saved.xpGained + event.gained,
  });
  host.stopSpeech();
  if (host.state.decision.haptics && navigator.vibrate)
    navigator.vibrate(full ? 20 : [30, 30, 30]);
  render();
}
function next() {
  if (!saved || !["reveal", "section"].includes(saved.phase) || dialog) return;
  if (saved.index === saved.ids.length - 1) {
    results();
    return;
  }
  const boundary = saved.sections?.find((s) => s.to === saved.index + 1);
  if (boundary && saved.phase !== "section") {
    update({ ...saved, phase: "section" });
    wrap(
      `<div class="block"><h2 data-decision-heading tabindex="-1">${esc(boundary.title)} complete</h2><p>${saved.answers.slice(boundary.from, boundary.to).filter((a) => a.full).length}/${boundary.to - boundary.from} full marks. Internal study target: ${boundary.need}.</p>${button("decisionSection", "Continue")}</div>`,
    );
    bind("decisionSection", () => {
      update(nextCard(saved, run));
      render();
    });
    focusHeading();
    return;
  }
  update(nextCard(saved, run));
  render();
}
function results() {
  history.replaceState(null, "", "#practice");
  const s = saved,
    result = finish(host.state, s);
  commitSave();
  clearSave();
  saved = null;
  stop();
  if (completeCallback) {
    const callback = completeCallback;
    completeCallback = null;
    callback(result);
    return;
  }
  wrap(
    `<div class="block"><p class="kicker">Practice complete</p><h2 data-decision-heading tabindex="-1">${result.correct}/${result.total} full marks</h2><p class="lead">${Math.round((result.correct / result.total) * 100)}% practice accuracy${result.bonus ? " · Daily goal complete" : ""}.</p>${s.sections ? s.sections.map((sec) => `<div class="decision-section-score"><span>${esc(sec.title)}</span><span>${s.answers.slice(sec.from, sec.to).filter((a) => a.full).length}/${sec.to - sec.from} · target ${sec.need}</span></div>`).join("") : ""}<p>Activity and selected-topic practice, not a prediction of passing. Missed questions are saved in Review.</p>${button("decisionRetry", "Retry same set")}${button("decisionHome", "Back to Practise", "btn-soft")}<button class="btn btn-ghost" data-go="review">Review mistakes</button></div>`,
  );
  bind("decisionHome", () => home());
  bind("decisionRetry", () => {
    run = runFromSave(s);
    saved = newSave(run);
    checkpoint();
    activate(saved);
  });
  focusHeading();
}
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", pause);
  window.addEventListener("beforeunload", pause);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && live()) {
      pause();
    } else if (live() && saved.paused && !dialog) showPause();
  });
}

/** The same source-linked cards also feed the existing drills, atlas and mock pools. */
export function getPracticeQuestions(topic, code = "2") {
  if (code !== "2") return [];
  return BANK.filter(
    (q) =>
      q.options.length >= 2 &&
      !q.order &&
      (topic === "mixed" || q.topic === topic),
  ).map((q) => {
    const order = shuffle(q.options.map((_, i) => i));
    const path = q.sign || q.scene ? `assets/decision/art/${q.id}.svg` : "";
    return {
      q: q.situation + " — " + q.ask,
      opts: order.map((i) => q.options[i]),
      ans: order.indexOf(q.correct),
      ex: q.why,
      svg: path
        ? `<img class="decision-art${q.sign ? " sign" : ""}" src="${path}" alt="${esc(q.situation)}">`
        : "",
      decisionId: q.id,
      decisionEventId: crypto.randomUUID(),
      source: questionSource(q),
    };
  });
}
export function recordChoiceAttempt(state, question, full) {
  const q = BY_ID[question.decisionId];
  if (!q || q.order) return;
  record(
    state,
    q,
    {
      id: q.id,
      full,
      partial: false,
      helped: false,
      choiceOk: full,
      orderOk: null,
      timedOut: false,
      choice: full ? q.correct : null,
    },
    question.decisionEventId || crypto.randomUUID(),
  );
}
