// Daily Python engine: spaced repetition (Leitner), streaks with freezes, backup.
// Pure logic, no DOM. Works in Node (module.exports) and the browser (window.Engine).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SESSION_SIZE = 5;
  const REVIEW_SLOTS = 3;
  const INTERVALS = [0, 1, 2, 4, 8, 16]; // days, indexed by box 1–5
  const MAX_BOX = 5;
  const START_FREEZES = 2;
  const MAX_FREEZES = 3;
  const FREEZE_EVERY = 7;

  // ---- dates (local calendar days as 'YYYY-MM-DD') ----
  function pad(n) { return String(n).padStart(2, '0'); }
  function localDay(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function toUTC(day) {
    const [y, m, d] = day.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }
  function addDays(day, n) {
    const t = new Date(toUTC(day) + n * 86400000);
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  }
  function daysBetween(a, b) { return Math.round((toUTC(b) - toUTC(a)) / 86400000); }

  // ---- state ----
  function newState() {
    return { v: 1, cards: {}, days: [], streak: 0, best: 0, freezes: START_FREEZES, lastDay: null };
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- scheduling ----
  function pickSession(state, questions, unlocked, today, rng = Math.random) {
    const open = questions.filter(q => unlocked.includes(q.topic));
    const due = open
      .filter(q => state.cards[q.id] && state.cards[q.id].due <= today)
      .sort((a, b) => (state.cards[a.id].due < state.cards[b.id].due ? -1 : state.cards[a.id].due > state.cards[b.id].due ? 1 : 0))
      .map(q => q.id);
    const fresh = shuffle(open.filter(q => !state.cards[q.id]).map(q => q.id), rng);

    let reviews = due.length >= SESSION_SIZE ? due.slice(0, SESSION_SIZE) : due.slice(0, REVIEW_SLOTS);
    let picked = reviews.concat(fresh.slice(0, SESSION_SIZE - reviews.length));
    // Top up from whichever pool still has questions.
    if (picked.length < SESSION_SIZE) {
      const extra = due.filter(id => !picked.includes(id));
      picked = picked.concat(extra.slice(0, SESSION_SIZE - picked.length));
    }
    return picked;
  }

  function recordAnswer(state, id, correct, today) {
    const card = state.cards[id] || { box: 1, due: today };
    card.box = correct ? Math.min(card.box + 1, MAX_BOX) : 1;
    card.due = addDays(today, INTERVALS[card.box]);
    state.cards[id] = card;
  }

  // ---- streaks ----
  function completeDay(state, today) {
    if (state.lastDay !== null && today <= state.lastDay) { // same day, or clock moved back
      return { streak: state.streak, freezesUsed: 0, freezeEarned: false, alreadyDone: true };
    }
    let freezesUsed = 0;
    if (state.lastDay === null) {
      state.streak = 1;
    } else {
      const missed = daysBetween(state.lastDay, today) - 1;
      if (missed <= 0) state.streak += 1;
      else if (missed <= state.freezes) {
        state.freezes -= missed;
        freezesUsed = missed;
        state.streak += 1;
      } else state.streak = 1;
    }
    let freezeEarned = false;
    if (state.streak % FREEZE_EVERY === 0 && state.freezes < MAX_FREEZES) {
      state.freezes += 1;
      freezeEarned = true;
    }
    state.best = Math.max(state.best, state.streak);
    state.lastDay = today;
    state.days.push(today);
    return { streak: state.streak, freezesUsed, freezeEarned, alreadyDone: false };
  }

  // Streak to show on the home screen: 0 if the missed days are already more than the freezes.
  function displayStreak(state, today) {
    if (state.lastDay === null) return 0;
    const missed = daysBetween(state.lastDay, today) - 1;
    return missed > state.freezes ? 0 : state.streak;
  }

  // Prompt for the "Explain more" button. Claude has no memory, so send everything.
  function explainPrompt(q, picked, correct) {
    const right = q.type === 'mcq' || q.type === 'predict' ? q.options[q.answer]
      : q.type === 'bug' ? `line ${q.bugLine + 1} should be: ${q.fixes[q.answer].trim()}`
      : q.type === 'blank' ? q.chips[q.answer]
      : q.lines.join('\n');
    return [
      'You are a friendly Python tutor. The learner is a PhD student in building science and LCA,',
      'a Python beginner who knows some C from CS50. They are on their phone doing a quick daily quiz.',
      `They just answered this ${q.type} question and got it ${correct ? 'right' : 'wrong'}.`,
      '',
      `Question: ${q.prompt}`,
      q.code ? `Code:\n${q.code}` : '',
      q.options ? `Options: ${q.options.join(' | ')}` : '',
      q.chips ? `Choices for the blank: ${q.chips.join(' | ')}` : '',
      q.fixes ? `Fix options: ${q.fixes.join(' | ')}` : '',
      `They picked: ${picked}`,
      `Correct answer: ${right}`,
      `Short explanation already shown: ${q.explain}`,
      '',
      'Explain it more deeply than the short explanation, in under 150 words, plain text (no markdown headings or tables).',
      correct ? 'Confirm why it is right and add one thing worth knowing next.'
        : 'Explain why their pick was wrong and why the correct answer is right.',
      'Step through what Python does line by line where it helps. Use a tiny building-science or LCA example if it helps.',
      'Use Australian English. Say "embodied GHG emissions", never "embodied carbon" or "carbon emissions".',
    ].filter(Boolean).join('\n');
  }

  // ---- backup ----
  function exportState(state) { return JSON.stringify(state); }
  function importState(json) {
    const s = JSON.parse(json); // throws on junk
    const ok = s && s.v === 1 && typeof s.cards === 'object' && s.cards !== null &&
      Array.isArray(s.days) && Number.isInteger(s.streak) && Number.isInteger(s.best) &&
      Number.isInteger(s.freezes) && (s.lastDay === null || typeof s.lastDay === 'string');
    if (!ok) throw new Error('This does not look like a Daily Python backup.');
    return s;
  }

  return { SESSION_SIZE, localDay, addDays, daysBetween, newState, pickSession, recordAnswer, completeDay, displayStreak, explainPrompt, exportState, importState };
});
