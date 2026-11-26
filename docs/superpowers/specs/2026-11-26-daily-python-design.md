# Daily Python: design

Approved by Adrian, 2026-11-26.

## Why
Keep Python fresh with about 5 minutes a day on a phone, even during busy weeks when full lessons stop for a while.

## Goals
- A daily session that takes about 5 minutes and needs almost no typing.
- Streaks for motivation, with freezes so a single missed day doesn't reset everything.
- Spaced repetition, so returning after a gap brings back older material first.
- Questions follow Adrian's progress (`knowledge-base/skills.md`) and are grounded in LCA and building science.

## Non-goals
- Long code typing, accounts, syncing between devices, running Python in the browser.

## Anti-goals
- Slow to open on a phone (it would get skipped on busy days).
- Code questions whose stated answers are wrong.
- Terminology that breaks `knowledge-base/conventions.md` (for example "embodied carbon").

## Approaches considered
1. **New, separate, light phone app (chosen).** Loads instantly and is built for short sessions. Python Learn stays a separate, deeper tool.
2. **Add a Daily mode to Python Learn.** Everything in one place, but Pyodide loads slowly on a phone, and the file isn't in the repo yet. Adrian had also forgotten the app existed, so it isn't part of his routine.

## Design (as decided with Adrian)
- **Session:** 5 questions. Normally 3 review and 2 new. After a gap, all review questions that are due come first.
- **Question types:** multiple choice, "what does this print?", spot the bug (tap the line, then pick the fix), fill the blank (tap word chips), and put lines in order.
- **Content:** mostly Python, plus some questions from the wider project (terminology, LCA stages, the thermal model).
- **Streaks:** a day counts when 5 questions are finished. Shows the current streak, best streak and a practice calendar.
- **Freezes:** start with 2 banked, earn 1 per 7-day streak, maximum of 3, used automatically on a missed day.
- **Progress:** each question is tagged with a topic from `skills.md`. Only topics Adrian has started appear. The tutor chat adds questions when new topics open up.

## Builder's calls
- One self-contained HTML file at `apps/daily-python/index.html`, with the question bank kept in `apps/daily-python/questions.js` and inlined into the published page.
- Every code question is checked by running real Python at build time (`apps/daily-python/verify_questions.py`).
- Progress is stored in localStorage, with export/import of a JSON backup.
- Spaced repetition: a simplified Leitner system with 5 boxes and review intervals of 1, 2, 4, 8 and 16 days. A wrong answer sends the question back to box 1.
- Published as a private artifact that can be opened on a phone and added to the home screen.
- Starting bank: about 60 questions covering Phase 1 topics, plus some on terminology and LCA.
