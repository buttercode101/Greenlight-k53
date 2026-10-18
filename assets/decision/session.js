import { BANK } from "./bank.js?v=30";
import { shuffle } from "./engine.js?v=30";
import { storageProblem } from "./storage.js?v=30";
export const SAVE_KEY = "k53-decision-active-v2";
export const CONTENT_VERSION = "2026-10-18.1";
let memory = null;
let touched = false;
const modes = new Set([
  "signs",
  "rules",
  "observe",
  "controls",
  "mixed",
  "weak",
  "daily",
  "paper",
  "route",
]);
const byId = new Map(BANK.map((q) => [q.id, q]));
const integer = (v) => Number.isSafeInteger(v) && Number(v) >= 0;
export function validateSave(value) {
  if (!value || typeof value !== "object") return null;
  const s = value;
  if (
    s.version !== 2 ||
    s.contentVersion !== CONTENT_VERSION ||
    typeof s.runId !== "string" ||
    !/^[a-zA-Z0-9-]{8,80}$/.test(s.runId)
  )
    return null;
  if (
    !modes.has(s.mode) ||
    typeof s.title !== "string" ||
    s.title.length > 200 ||
    typeof s.blurb !== "string" ||
    s.blurb.length > 2000
  )
    return null;
  if (
    !Array.isArray(s.ids) ||
    !s.ids.length ||
    s.ids.length > BANK.length ||
    new Set(s.ids).size !== s.ids.length ||
    s.ids.some((id) => !byId.has(id))
  )
    return null;
  if (
    !integer(s.index) ||
    s.index >= s.ids.length ||
    !integer(s.xpGained) ||
    s.xpGained > 1e6 ||
    typeof s.timed !== "boolean" ||
    !["learn", "test"].includes(s.rate)
  )
    return null;
  if (
    !["intro", "order", "answer", "reveal", "section"].includes(s.phase) ||
    typeof s.paused !== "boolean"
  )
    return null;
  if (
    !Array.isArray(s.answers) ||
    s.answers.length > s.ids.length ||
    s.answers.length !==
      s.index + (["reveal", "section"].includes(s.phase) ? 1 : 0)
  )
    return null;
  for (const [i, a] of s.answers.entries()) {
    const q = byId.get(s.ids[i]);
    if (
      !a ||
      a.id !== q.id ||
      ["full", "partial", "helped", "choiceOk", "timedOut"].some(
        (k) => typeof a[k] !== "boolean",
      )
    )
      return null;
    if (a.orderOk !== null && typeof a.orderOk !== "boolean") return null;
    if (
      a.choice !== null &&
      (!integer(a.choice) || a.choice >= q.options.length)
    )
      return null;
    if (
      a.full &&
      (!a.choiceOk || a.helped || a.orderOk === false || a.timedOut)
    )
      return null;
  }
  const q = byId.get(s.ids[s.index]);
  if (
    !Array.isArray(s.options) ||
    s.options.length !== q.options.length ||
    new Set(s.options).size !== s.options.length ||
    s.options.some((i) => !integer(i) || i >= q.options.length)
  )
    return null;
  if (!Array.isArray(s.picked) || !Array.isArray(s.pool)) return null;
  const order = q.order ?? [];
  if (
    s.picked.some((label, i) => label !== order[i]) ||
    s.pool.length + s.picked.length !== order.length ||
    new Set([...s.picked, ...s.pool]).size !== order.length ||
    s.pool.some((label) => !order.includes(label))
  )
    return null;
  if (
    typeof s.orderFailed !== "boolean" ||
    typeof s.assisted !== "boolean" ||
    typeof s.hint !== "boolean" ||
    (s.choice !== null && (!integer(s.choice) || s.choice >= q.options.length))
  )
    return null;
  if (
    !Number.isFinite(s.remainingMs) ||
    s.remainingMs < 0 ||
    s.remainingMs > q.seconds * 1000 ||
    (s.deadline !== null &&
      (!Number.isFinite(s.deadline) ||
        s.deadline < 0 ||
        s.deadline > Date.now() + q.seconds * 1000 + 2000))
  )
    return null;
  if (s.sections !== undefined) {
    if (
      !Array.isArray(s.sections) ||
      s.mode !== "paper" ||
      s.sections.length !== 3
    )
      return null;
    const canonical = [
      { title: "Road signs", from: 0, to: 8, need: 7 },
      { title: "Rules of the road", from: 8, to: 16, need: 6 },
      { title: "Vehicle controls", from: 16, to: 20, need: 3 },
    ];
    if (
      s.ids.length !== 20 ||
      JSON.stringify(s.sections) !== JSON.stringify(canonical)
    )
      return null;
  }
  if (s.mode === "paper" && !s.sections) return null;
  return s;
}
function cardState(run, index, now) {
  const q = run.questions[index];
  return {
    index,
    phase: q.order?.length ? "order" : "answer",
    options: shuffle(q.options.map((_, i) => i)),
    pool: shuffle(q.order ?? []),
    picked: [],
    choice: null,
    orderFailed: false,
    assisted: false,
    hint: false,
    remainingMs: q.seconds * 1000,
    deadline: run.timed ? now + q.seconds * 1000 : null,
    paused: false,
  };
}
export function newSave(run, now = Date.now()) {
  const intro = run.mode === "paper" || run.mode === "route";
  return {
    version: 2,
    contentVersion: CONTENT_VERSION,
    runId: crypto.randomUUID(),
    mode: run.mode,
    title: run.title,
    blurb: run.blurb,
    ids: run.questions.map((q) => q.id),
    sections: run.sections,
    timed: run.timed,
    rate: run.rate,
    answers: [],
    xpGained: 0,
    ...cardState(run, 0, now),
    ...(intro ? { phase: "intro", deadline: null } : {}),
  };
}
export function nextCard(s, run, now = Date.now()) {
  return { ...s, ...cardState(run, s.index + 1, now) };
}
export function pauseSave(s, now = Date.now()) {
  return {
    ...s,
    paused: true,
    remainingMs:
      s.deadline === null ? s.remainingMs : Math.max(0, s.deadline - now),
    deadline: null,
  };
}
export function resumeSave(s, now = Date.now()) {
  return {
    ...s,
    paused: false,
    deadline:
      s.timed && ["answer", "order"].includes(s.phase)
        ? now + s.remainingMs
        : null,
  };
}
export function readSave() {
  if (touched) return memory;
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = validateSave(JSON.parse(raw));
    if (!saved) {
      storageProblem("session", true);
      return null;
    }
    memory = saved;
    return saved;
  } catch {
    storageProblem("session", true);
    return memory;
  }
}
export function writeSave(save) {
  memory = save;
  touched = true;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify(save));
    storageProblem("session", false);
  } catch {
    storageProblem("session", true);
  }
}
export function clearSave() {
  memory = null;
  touched = true;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SAVE_KEY);
    storageProblem("session", false);
  } catch {
    storageProblem("session", true);
  }
}
