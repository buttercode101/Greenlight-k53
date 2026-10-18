/** Canonical K53 state adapter: no second progress store or mistake queue. */
import { BANK } from "./bank.js?v=28";
import { localToday } from "./engine.js?v=28";
export const BY_ID = Object.freeze(
  Object.setPrototypeOf(Object.fromEntries(BANK.map((q) => [q.id, q])), null),
);
export const topicLabel = {
  signs: "Signs and signals",
  rules: "Rules of the road",
  observe: "Observation",
  controls: "Vehicle controls",
};
const validEvent = (e) =>
  e &&
  [0, 3, 5, 10].includes(e.gained) &&
  BY_ID[e.answer?.id] &&
  ["full", "partial", "helped", "choiceOk", "timedOut"].every(
    (k) => typeof e.answer[k] === "boolean",
  ) &&
  (e.answer.orderOk === null || typeof e.answer.orderOk === "boolean") &&
  (e.answer.choice === null ||
    (Number.isInteger(e.answer.choice) &&
      e.answer.choice >= 0 &&
      e.answer.choice < BY_ID[e.answer.id].options.length));
const number = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);
export function progress(state) {
  const old = state.decision;
  if (
    !old ||
    typeof old !== "object" ||
    Array.isArray(old) ||
    old.version !== 1
  )
    state.decision = { version: 1 };
  const d = state.decision;
  d.xp = number(d.xp);
  d.events =
    d.events && typeof d.events === "object" && !Array.isArray(d.events)
      ? d.events
      : {};
  d.sessions = Array.isArray(d.sessions)
    ? d.sessions
        .filter(
          (x) =>
            x &&
            typeof x.id === "string" &&
            typeof x.title === "string" &&
            Number.isFinite(x.correct) &&
            Number.isFinite(x.total) &&
            Number.isFinite(x.xp) &&
            Number.isFinite(x.bonus),
        )
        .slice(-100)
    : [];
  d.dailyDate = typeof d.dailyDate === "string" ? d.dailyDate : "";
  d.timed = d.timed === true;
  return d;
}
export function reviewQuestion(q) {
  return {
    key: "decision:" + q.id,
    decisionId: q.id,
    code: "2",
    q: q.situation + " — " + q.ask,
    a: q.options.length
      ? q.options[q.correct]
      : "Correct sequence: " + q.order.join(" → "),
    opts: [...q.options],
    ans: q.correct,
    ex: q.why,
    svg: q.sign || q.scene ? `assets/decision/art/${q.id}.svg` : "",
  };
}
export function record(state, q, answer, eventId, now = Date.now()) {
  const d = progress(state);
  const cached = d.events[eventId];
  if (validEvent(cached) && cached.answer.id === q.id) return cached;
  const key = "decision:" + q.id,
    item = reviewQuestion(q),
    previous = state.attempts?.[key];
  state.attempts =
    state.attempts && typeof state.attempts === "object" ? state.attempts : {};
  const row = {
    q: item.q,
    topic: topicLabel[q.topic],
    code: "2",
    decisionId: q.id,
    decisionTopic: q.topic,
    recent: [
      ...(Array.isArray(previous?.recent)
        ? previous.recent.filter((x) => typeof x === "boolean")
        : []),
      answer.full,
    ].slice(-5),
    correct: number(previous?.correct) + (answer.full ? 1 : 0),
    wrong: number(previous?.wrong) + (answer.full ? 0 : 1),
    last: now,
  };
  state.attempts[key] = row;
  state.review = Array.isArray(state.review) ? state.review : [];
  let r = state.review.find((r) => r.key === key);
  if (!answer.full) {
    if (!r) {
      r = { ...item, level: 0, misses: 0, due: now };
      state.review.push(r);
    }
    Object.assign(r, item, {
      level: 0,
      due: now,
      misses: number(r.misses) + 1,
    });
  } else if (r) {
    r.level = Math.min(number(r.level) + 1, 3);
    r.due = now + [0, 1, 3, 7][r.level] * 86400000;
  }
  const gained = answer.full
    ? 10
    : answer.partial
      ? 5
      : answer.helped && answer.choiceOk
        ? 3
        : 0;
  d.xp += gained;
  const event = { answer: structuredClone(answer), gained, at: now };
  d.events[eventId] = event;
  const keys = Object.keys(d.events);
  if (keys.length > 2000)
    for (const k of keys.slice(0, keys.length - 2000)) delete d.events[k];
  return event;
}
export function finish(state, s, now = Date.now()) {
  const d = progress(state),
    previous = d.sessions.find((x) => x.id === s.runId);
  if (previous) return previous;
  const correct = s.answers.filter((a) => a.full).length,
    total = s.ids.length;
  const bonus =
    s.mode === "daily" &&
    correct / total >= 0.75 &&
    d.dailyDate !== localToday(new Date(now))
      ? 40
      : 0;
  if (bonus) {
    d.dailyDate = localToday(new Date(now));
    d.xp += bonus;
  }
  const result = {
    id: s.runId,
    title: s.title,
    at: now,
    correct,
    total,
    xp: s.xpGained,
    bonus,
  };
  d.sessions = [...d.sessions, result].slice(-100);
  return result;
}
export function weakIds(state) {
  return (state.review || [])
    .filter(
      (r) =>
        r.decisionId &&
        BY_ID[r.decisionId] &&
        (!r.level || r.due <= Date.now()),
    )
    .map((r) => r.decisionId);
}
export function importLegacy(state, value) {
  const d = progress(state);
  if (d.legacyImported) return { imported: false, count: 0 };
  const legacy = value?.state;
  if (!legacy || typeof legacy !== "object" || Array.isArray(legacy))
    return { imported: false, count: 0 };
  let count = 0;
  for (const m of Array.isArray(legacy.mistakes) ? legacy.mistakes : []) {
    const q = BY_ID[m?.id];
    if (!q) continue;
    const item = reviewQuestion(q);
    if (!state.review.some((r) => r.key === item.key)) {
      state.review.push({ ...item, level: 0, misses: 1, due: Date.now() });
      count++;
    }
  }
  d.legacyActivityXp = number(legacy.xp);
  d.legacyImported = true;
  return { imported: true, count };
}
