/* GreenLight K53 — shared SM-2 scheduling. Pure state transform; no network or second storage. */
(function (root) {
  "use strict";
  const VERSION = 1;
  const DAY = 86400000;
  const MAX_INTERVAL = 21;
  const MIN_EASE = 1.3;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const finite = (n, fallback = 0) => Number.isFinite(n) ? n : fallback;
  const object = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : Object.create(null);
  const cleanText = (v, max = 12000) => typeof v === "string" ? v.slice(0, max) : "";
  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36).padStart(7, "0");
  }
  function questionId(q) {
    if (typeof q === "string") return "gl:" + hash(q.trim().toLowerCase());
    q = object(q);
    const explicit = q.questionId || q.id || q.decisionId || q.reviewId;
    if (typeof explicit === "string" && explicit.trim()) return explicit.startsWith("decision:") ? explicit : "gl:" + hash(explicit.trim());
    const stableArt = cleanText(q.svg || q.sourceId || q.type);
    const prompt = cleanText(q.q || q.situation || q.ask).trim().toLowerCase().replace(/\s+/g, " ");
    const answer = cleanText(q.opts?.[q.ans] ?? q.a).trim().toLowerCase().replace(/\s+/g, " ");
    return "gl:" + hash(stableArt + "|" + prompt + "|" + answer);
  }
  function ensure(state) {
    state = object(state);
    const old = object(state.sm2);
    const items = object(old.items);
    const events = object(old.events);
    const days = object(old.days);
    state.sm2 = {
      version: VERSION,
      items: Object.fromEntries(Object.entries(items).filter(([id, row]) =>
        typeof id === "string" && id.length <= 180 && row && typeof row === "object" &&
        Number.isInteger(row.repetitions) && row.repetitions >= 0 &&
        Number.isFinite(row.interval) && row.interval >= 0 &&
        Number.isFinite(row.easeFactor) && row.easeFactor >= MIN_EASE &&
        Number.isFinite(row.nextReview) && row.nextReview >= 0
      ).map(([id, row]) => [id, {
        ...row,
        interval: clamp(row.interval, 0, MAX_INTERVAL),
        easeFactor: clamp(row.easeFactor, MIN_EASE, 3),
        repetitions: clamp(row.repetitions, 0, 10000),
        question: sanitizeQuestion(row.question),
      }])),
      events: Object.fromEntries(Object.entries(events).filter(([id, at]) => typeof id === "string" && Number.isFinite(at)).slice(-2000)),
      days: Object.fromEntries(Object.entries(days).filter(([day, row]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && row && Number.isFinite(row.attempts) && Number.isFinite(row.correct) && Number.isFinite(row.wrong)).sort(([a],[b])=>a.localeCompare(b)).slice(-90).map(([day,row])=>[day,{attempts:clamp(row.attempts,0,1000000),correct:clamp(row.correct,0,1000000),wrong:clamp(row.wrong,0,1000000)}])),
    };
    return state.sm2;
  }
  function sanitizeQuestion(q) {
    q = object(q);
    const opts = Array.isArray(q.opts) ? q.opts.filter(x => typeof x === "string").slice(0, 12).map(x => x.slice(0, 2000)) : [];
    const ans = Number.isInteger(q.ans) && q.ans >= 0 && q.ans < opts.length ? q.ans : -1;
    return {
      q: cleanText(q.q), opts, ans, a: cleanText(q.a || (ans >= 0 ? opts[ans] : "")),
      ex: cleanText(q.ex), svg: cleanText(q.svg, 300), topic: cleanText(q.topic, 100),
      code: ["1", "2", "3"].includes(String(q.code)) ? String(q.code) : "",
      decisionId: cleanText(q.decisionId, 20),
    };
  }
  function recordAnswer(state, question, correct, now = Date.now(), eventId = "") {
    const sm2 = ensure(state);
    const id = questionId(question);
    if (eventId && sm2.events[eventId]) return sm2.items[id] || null;
    const previous = sm2.items[id] || { repetitions: 0, interval: 0, easeFactor: 2.5, nextReview: 0 };
    const ease = previous.easeFactor;
    let repetitions, interval, easeFactor;
    if (correct === true) {
      repetitions = previous.repetitions + 1;
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.min(MAX_INTERVAL, Math.max(1, Math.round(previous.interval * ease)));
      easeFactor = clamp(ease + 0.1, MIN_EASE, 3);
    } else {
      repetitions = 0;
      interval = 1;
      const quality = 1;\n      const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);\n      easeFactor = clamp(ease + delta, MIN_EASE, 3);
    }
    const row = {
      id, repetitions, interval, easeFactor, nextReview: now + interval * DAY,
      lastReviewed: now, lastCorrect: correct === true,
      attempts: Math.min(1000000, finite(previous.attempts) + 1),
      lapses: finite(previous.lapses) + (correct === true ? 0 : 1),
      question: sanitizeQuestion(question),
    };
    sm2.items[id] = row;
    const date = new Date(now);
    const dayKey = [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
    const day = sm2.days[dayKey] || (sm2.days[dayKey] = { attempts: 0, correct: 0, wrong: 0 });
    day.attempts++; if (correct === true) day.correct++; else day.wrong++;
    const dayKeys = Object.keys(sm2.days).sort(); if (dayKeys.length > 90) for (const key of dayKeys.slice(0, dayKeys.length - 90)) delete sm2.days[key];
    if (eventId) {
      sm2.events[eventId] = now;
      const keys = Object.keys(sm2.events);
      if (keys.length > 2000) for (const key of keys.slice(0, keys.length - 2000)) delete sm2.events[key];
    }
    return row;
  }
  function isDue(row, now = Date.now()) {
    return !!row && Number.isFinite(row.nextReview) && row.nextReview <= now;
  }
  function getDueItems(state, now = Date.now(), code = "") {
    const items = ensure(state).items;
    return Object.values(items).filter(row =>
      isDue(row, now) && (!code || !row.question.code || row.question.code === String(code)) &&
      row.question.q && row.question.opts.length > 1 && row.question.ans >= 0
    ).sort((a, b) => a.nextReview - b.nextReview || a.lastReviewed - b.lastReviewed);
  }
  function recordToReview(state, question, correct, now = Date.now(), eventId = "") {
    const q = object(question);
    const row = recordAnswer(state, q, correct, now, eventId);
    if (!row) return null;
    state.review = Array.isArray(state.review) ? state.review : [];
    const id = row.id;
    const key = cleanText(q.key) || (q.decisionId ? "decision:" + q.decisionId : id);
    let saved = state.review.find(item => item && item.key === key);
    const clean = sanitizeQuestion(q);
    if (!saved) {
      saved = { key, q: clean.q, a: clean.a, opts: clean.opts, ans: clean.ans, ex: clean.ex, svg: clean.svg, topic: clean.topic, code: clean.code, decisionId: clean.decisionId || undefined, level: 0, misses: 0, due: row.nextReview };
      state.review.push(saved);
    }
    Object.assign(saved, {
      q: clean.q, a: clean.a, opts: clean.opts, ans: clean.ans, ex: clean.ex,
      svg: clean.svg, topic: clean.topic, code: clean.code,
      decisionId: clean.decisionId || saved.decisionId,
      level: row.repetitions, misses: row.lapses, due: row.nextReview,
      sm2Id: id,
    });
    return row;
  }
  function getStats(state, now = Date.now(), code = "") {
    const rows = Object.values(ensure(state).items).filter(row => !code || !row.question.code || row.question.code === String(code));
    const due = rows.filter(row => isDue(row, now));
    const future = rows.filter(row => row.nextReview > now);
    const accuracyAttempts = rows.reduce((n, row) => n + row.attempts, 0);
    const lapses = rows.reduce((n, row) => n + row.lapses, 0);
    const byTopic = Object.create(null);
    for (const row of rows) {
      const topic = row.question.topic || "Other";
      const stat = byTopic[topic] || (byTopic[topic] = { topic, total: 0, due: 0, lapses: 0 });
      stat.total++;
      stat.due += isDue(row, now) ? 1 : 0;
      stat.lapses += row.lapses;
    }
    const daily = Object.entries(ensure(state).days).sort(([a],[b])=>a.localeCompare(b)).slice(-14).map(([date,value])=>({date,...value}));
    return { total: rows.length, due: due.length, scheduled: future.length, attempts: accuracyAttempts, lapses, byTopic: Object.values(byTopic).sort((a,b)=>b.due-a.due || b.lapses-a.lapses), daily };
  }
  root.GreenLightSM2 = Object.freeze({ VERSION, DAY, MAX_INTERVAL, questionId, ensure, recordAnswer, recordToReview, isDue, getDueItems, getStats });
})(globalThis);
