# Daily Python Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A phone-first daily Python practice game with 5 tap-based questions a day, streaks with freezes, and spaced repetition.

**Architecture:** The logic lives in a pure JavaScript engine (`engine.js`), with no DOM access, tested with `node --test`. The question bank (`questions.js`) is plain data, and every code answer in it is checked by real Python (`verify_questions.py`). `index.html` is the UI. `build.py` inlines the engine and the bank into one self-contained `dist/daily-python.html`, which is published as an artifact.

**Tech Stack:** Vanilla JS (ES2020), HTML/CSS, Node 18+ built-in test runner, Python 3 standard library.

**Spec:** `docs/superpowers/specs/2026-11-26-daily-python-design.md`

## Global Constraints
- 5 questions per session: normally 3 review and 2 new; when 5 or more reviews are due, all 5 are reviews.
- Leitner boxes 1–5 with intervals of 1, 2, 4, 8 and 16 days. A wrong answer goes back to box 1, due tomorrow.
- Freezes: start with 2, earn 1 each time the streak reaches a multiple of 7, maximum 3, used automatically on missed days.
- Terminology follows `knowledge-base/conventions.md`: "embodied GHG emissions", never "embodied carbon" or "carbon emissions"; Australian spelling.
- No network requests at runtime and no Python in the browser. Must work with touch only, on a 360 px wide screen.
- All dates are the device's local calendar date, `YYYY-MM-DD`.

## Review Focus
1. Finishing a second session on the same day must not add to the streak twice or earn an extra freeze.
2. Coming back after a gap longer than the freezes held resets the streak to 1 and uses no freezes; a gap the freezes cover uses exactly the missed days.
3. Saved progress that refers to question ids no longer in the bank is ignored, without crashing.
4. If fewer than 5 questions are available, the session uses what there is, and a session of 0 shows a message instead of breaking.
5. Importing a malformed backup file leaves the current progress untouched and shows an error.

---

### Task 1: Engine (scheduling, streaks, backup)

**Files:**
- Create: `apps/daily-python/engine.js` (UMD: `module.exports` under Node, `window.Engine` in the browser)
- Test: `apps/daily-python/tests/engine.test.js`

**Interfaces:**
- Produces:
  - `newState() -> State` where State = `{v:1, cards:{[id]:{box:number,due:string}}, days:string[], streak:0, best:0, freezes:2, lastDay:null}`
  - `addDays(day:string, n:number) -> string`, `daysBetween(a:string, b:string) -> number`, `localDay(date:Date) -> string`
  - `pickSession(state, questions:Question[], unlocked:string[], today:string, rng=Math.random) -> string[]` (question ids)
  - `recordAnswer(state, id:string, correct:boolean, today:string) -> void` (mutates)
  - `completeDay(state, today:string) -> {streak, freezesUsed, freezeEarned:boolean, alreadyDone:boolean}`
  - `exportState(state) -> string`, `importState(json:string) -> State` (throws `Error` on invalid input)

- [ ] **Step 1: Write the failing tests** (in `engine.test.js`, using `node:test` and `assert`)
  - `pickSession` with 0 due: 5 ids, all unseen, all with topics in `unlocked`.
  - With 2 due: the 2 due ids plus 3 new ones (fills to 5 when fewer than 3 are due).
  - With 4 due and 10 new: 3 due plus 2 new.
  - With 7 due: 5 ids, all due, oldest due first.
  - Questions whose topic isn't unlocked are never picked; a bank of 3 questions gives 3 ids; an empty bank gives `[]`.
  - Ids in `state.cards` that are missing from the bank are ignored.
  - `recordAnswer` correct on a new card → box 2, due `today+2`; correct at box 5 → stays at 5, due `today+16`; wrong → box 1, due `today+1`.
  - `completeDay` first ever → streak 1. Next day → 2. Same day twice → second call has `alreadyDone:true` and the streak is unchanged.
  - Missed 1 day with 2 freezes → streak continues, `freezesUsed:1`, freezes 1. Missed 3 days with 2 freezes → streak 1, freezes still 2.
  - Reaching streak 7 → `freezeEarned:true`, freezes +1, capped at 3.
  - `best` tracks the maximum streak.
  - `importState(exportState(s))` deep-equals `s`; `importState('nope')` and `importState('{"v":9}')` throw.
  - `addDays('2026-12-31',1) === '2027-01-01'`; `daysBetween('2026-11-26','2026-12-01') === 5`.

- [ ] **Step 2: Run** `node --test apps/daily-python/tests/` → FAIL (module not found)
- [ ] **Step 3: Implement `engine.js`.** Date maths uses UTC `Date.UTC` on the `YYYY-MM-DD` parts, to avoid daylight-saving drift. Shuffle new questions with `rng`.
- [ ] **Step 4: Run** `node --test apps/daily-python/tests/` → all pass
- [ ] **Step 5: Commit** `feat(daily-python): engine with Leitner scheduling and streak freezes`

### Task 2: Question bank and Python verifier

**Files:**
- Create: `apps/daily-python/questions.js` (sets `QUESTIONS` and `UNLOCKED`; UMD like the engine)
- Create: `apps/daily-python/verify_questions.py`

**Interfaces:**
- Produces: a `Question` is `{id, topic, type, prompt, explain, ...}`, where the type is one of:
  - `mcq`: `options:string[]`, `answer:number`
  - `predict`: `code:string`, `options:string[]`, `answer:number`
  - `bug`: `code:string`, `bugLine:number` (0-based), `fixes:string[]`, `answer:number`, `expect:string`
  - `blank`: `code` (containing exactly one `___`), `chips:string[]`, `answer:number`, `expect:string`
  - `order`: `lines:string[]` (in correct order; shuffled on screen), `expect:string`
- `UNLOCKED`: the topic ids marked 🟡 or ✅ in `knowledge-base/skills.md`: `variables, operators, conditionals, lists-loops, zip, dicts, tuples, functions, fstrings, terminology, lca`
- The verifier is run with `python3 -I apps/daily-python/verify_questions.py`. It extracts the bank via `node -e`, runs each code question in a subprocess with a 5-second timeout and compares stdout (stripped):
  - `predict`: output equals `options[answer]`
  - `bug`: the original either raises an error or doesn't print `expect`; with the fix applied it prints `expect`
  - `blank`: with the chip filled in it prints `expect`; with every other chip it doesn't
  - `order`: the joined lines print `expect`
  - All types: ids are unique, every topic is known, no banned terms (`embodied carbon`, `carbon emissions`, `carbon-intensive`). Exits non-zero on any failure.

- [ ] **Step 1: Write the verifier** and 3 seed questions, one of them deliberately wrong. Run it → it reports exactly that question and exits 1.
- [ ] **Step 2: Fix the seed question and write about 60 questions** across the unlocked topics. All types are represented, and at least 8 questions are `terminology` or `lca`. Every example uses building science and LCA context.
- [ ] **Step 3: Run** the verifier → `OK: N questions verified`, exit 0
- [ ] **Step 4: Add an engine test** confirming that `pickSession` on the real bank with `UNLOCKED` returns 5 ids. Run `node --test` → pass.
- [ ] **Step 5: Commit** `feat(daily-python): verified Phase 1 question bank`

### Task 3: UI and single-file build

**Files:**
- Create: `apps/daily-python/index.html` (loads `engine.js` and `questions.js` with `<script src>` for development)
- Create: `apps/daily-python/build.py` → writes `apps/daily-python/dist/daily-python.html` with both scripts inlined
- Create: `apps/daily-python/README.md` (how to play, how the tutor chat adds questions and unlocks topics, how to rebuild)

**Interfaces:**
- Consumes: the `Engine.*` functions from Task 1, and `QUESTIONS` and `UNLOCKED` from Task 2.
- Saves to localStorage under key `dailyPython.v1`. Reads and writes are wrapped in try/catch, falling back to in-memory state.

- [ ] **Step 1: Build the screens.**
  - **Home:** streak 🔥, best, freezes ❄️, a 5-week calendar of practice days, and a "Start today's 5" button (or "Done for today ✓" with an option to practise more, which doesn't count toward the streak).
  - **Question:** one renderer per type, all tap-only; the bug type has two steps (tap the line, then pick the fix); code is shown monospace and scrolls sideways.
  - **Feedback:** ✓ or ✗ with the explanation and a Next button.
  - **Summary:** score, the streak update, and any freeze used or earned.
  - **Settings:** export (download or copy) and import (paste), with an error message on bad input.
- [ ] **Step 2: Run** `python3 -I apps/daily-python/build.py` → `dist/daily-python.html` exists and contains no `<script src=`.
- [ ] **Step 3: Check it in a browser at 390×844.** Play a full session covering every question type and confirm the streak becomes 1 and survives a reload. Import `"nope"` and confirm the error shows and progress is unchanged.
- [ ] **Step 4: Commit** `feat(daily-python): phone UI and single-file build`

### Task 4: Publish and record

- [ ] Publish `dist/daily-python.html` as a private artifact titled "Daily Python".
- [ ] Add Daily Python to `knowledge-base/projects.md`, and add a line to `chats.md` saying the tutor chat adds questions to it. Add a progress-log entry.
- [ ] Commit `docs: Daily Python app in knowledge base`, then push.
