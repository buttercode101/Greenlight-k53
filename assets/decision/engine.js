import { validateSave } from "./session.js?v=31";
import { BANK, ROUTES } from "./bank.js?v=31";
export function localToday(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
export function shiftDate(iso, delta) {
  const [y, m, da] = iso.split("-").map(Number);
  const dt = new Date(y || 2000, (m || 1) - 1, da || 1);
  dt.setDate(dt.getDate() + delta);
  return localToday(dt);
}
export function shuffle(list, rng = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i];
    copy[i] = copy[j];
    copy[j] = a;
  }
  return copy;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFrom(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export const BY_ID = Object.fromEntries(BANK.map((item) => [item.id, item]));
const TAKE = {
  signs: 12,
  rules: 10,
  observe: 8,
  controls: 8,
  mixed: 12,
};
const TITLES = {
  signs: "Sign snap",
  rules: "Right of way",
  observe: "Observation",
  controls: "Controls",
  mixed: "Mixed drill",
  weak: "Weak areas",
  daily: "Today's drive",
  paper: "Short study check",
  route: "Mini-route",
};
export function makeRun(args) {
  const today = localToday();
  let questions = [];
  let sections;
  let blurb = "";
  let title = args.title ?? TITLES[args.mode];
  if (args.mode === "route") {
    const route = ROUTES.find((item) => item.id === args.routeId) ?? ROUTES[0];
    if (!route) return { error: "No route is available." };
    questions = route.ids
      .map((id) => BY_ID[id])
      .filter((item) => Boolean(item));
    title = route.name;
    blurb = route.blurb;
  } else if (args.mode === "weak") {
    questions = (args.weakIds ?? [])
      .map((id) => BY_ID[id])
      .filter((item) => Boolean(item));
    blurb = "Only the decisions you missed. A full mark clears the card.";
    if (!questions.length)
      return {
        error:
          "No misses yet. They land here when a decision is not a full mark.",
      };
  } else if (args.mode === "daily") {
    const rng = mulberry32(seedFrom(today));
    const topics = ["signs", "rules", "observe", "controls"];
    questions = topics.flatMap((topic) =>
      shuffle(
        BANK.filter((item) => item.topic === topic),
        rng,
      ).slice(0, 2),
    );
    blurb =
      "Eight decisions, the same set all day. 75% or better pays a once-off bonus.";
  } else if (args.mode === "paper") {
    const signs = shuffle(BANK.filter((item) => item.topic === "signs")).slice(
      0,
      8,
    );
    const rules = shuffle(BANK.filter((item) => item.topic === "rules")).slice(
      0,
      8,
    );
    const controls = shuffle(
      BANK.filter((item) => item.topic === "controls"),
    ).slice(0, 4);
    questions = [...signs, ...rules, ...controls];
    sections = [
      { title: "Road signs", from: 0, to: signs.length, need: 7 },
      {
        title: "Rules of the road",
        from: signs.length,
        to: signs.length + rules.length,
        need: 6,
      },
      {
        title: "Vehicle controls",
        from: signs.length + rules.length,
        to: questions.length,
        need: 3,
      },
    ];
    blurb =
      "Three sections. You need 7/8 signs, 6/8 rules, and 3/4 controls. This is a short study check with internal targets, not the DLTC paper or a readiness prediction.";
  } else if (args.mode === "mixed") {
    questions = shuffle(BANK).slice(0, TAKE.mixed);
    blurb = "A random mix from every topic.";
  } else {
    const topic = args.mode;
    questions = shuffle(BANK.filter((item) => item.topic === topic)).slice(
      0,
      TAKE[topic],
    );
    blurb =
      topic === "signs"
        ? "Name the sign and the action it demands."
        : topic === "rules"
          ? "Priority, speed and safe road decisions."
          : topic === "observe"
            ? "The order is the skill. The chips are shuffled on purpose."
            : "The controls, lights, and warnings from the driver's seat.";
  }
  if (!questions.length) return { error: "Nothing to run in that set." };
  const timed = args.mode === "paper" ? false : args.timedSetting;
  const rate = args.mode === "paper" || timed ? "test" : "learn";
  return { mode: args.mode, title, blurb, questions, sections, timed, rate };
}
export function runFromSave(value) {
  const saved = validateSave(value);
  if (!saved) return null;
  return {
    mode: saved.mode,
    title: saved.title,
    blurb: saved.blurb,
    questions: saved.ids.map((id) => BY_ID[id]),
    sections: saved.sections,
    timed: saved.timed,
    rate: saved.rate,
  };
}
export const RANKS = [
  { name: "Learner", min: 0 },
  { name: "Building a habit", min: 150 },
  { name: "Road sense", min: 450 },
  { name: "Regular practice", min: 900 },
  { name: "Dedicated learner", min: 1500 },
];
export function rankFor(xp) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) index = i;
  }
  const current = RANKS[index];
  const next = RANKS[index + 1];
  const span = next ? next.min - current.min : 1;
  const pct = next
    ? Math.min(100, Math.round(((xp - current.min) / span) * 100))
    : 100;
  return {
    name: current.name,
    next: next?.name ?? null,
    remain: next ? next.min - xp : 0,
    pct,
  };
}
export function masteryPct(stat) {
  if (!stat.attempts) return null;
  return Math.round((stat.correct / stat.attempts) * 100);
}
