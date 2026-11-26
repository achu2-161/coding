# Instructions for Claude

This repo is Adrian's shared knowledge base for his coding projects. Several Claude chats work on it. Each chat has a different job, but they all read and update the same files.

## At the start of every chat
1. Read `knowledge-base/` before you answer, starting with `profile.md`, `skills.md` and `curriculum.md`.
2. Find this chat's role in `knowledge-base/chats.md`. Stay within that role.
3. Don't ask Adrian for anything these files already say.

## While working
- Ground every Python example in building science or LCA (U-values, heat transfer, emission factors, lifecycle stages, retrofit scenarios).
- Let Adrian attempt an exercise before you explain the answer. He debugs by iterating and often asks conceptual questions partway through.
- Follow the terminology rules in `knowledge-base/conventions.md`. They are not optional.
- When you hand over an updated file (HTML app, notes doc), send it straight away. Adrian shouldn't have to ask for it.

## At the end of a session, or a natural milestone
- Add a dated entry to `knowledge-base/progress-log.md`: what was covered and what's next.
- Update `skills.md` when a concept has actually been practised, not just mentioned.
- Update the status in `curriculum.md` when a lesson or phase finishes.
- Keep entries short, and record only what Adrian did or decided. Your own suggestions belong in "Next up", labelled as suggestions.
- Commit with a clear message, for example `log: Phase 1 lesson 3 – loops and zip()`.

## Git workflow
- When Adrian asks you to update the repo, **commit and push straight to `main`**. Don't use branches or pull requests.
- Update only when Adrian asks, or at the end-of-session points above.

## Who owns what
- **Project manager chat**: owns `goals.md`, `curriculum.md` and `chats.md`, and keeps the whole knowledge base tidy.
- **Python tutor chat**: owns `skills.md` and the lesson entries in `progress-log.md`.
- **PhD visualisation/research chat**: owns the research-viz entries in `projects.md`.
- Any chat can add to the progress log.
