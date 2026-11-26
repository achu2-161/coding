# Chat registry

Each Claude chat has one job. They share this repo as their memory.

| Chat | Where | Role | Owns |
|---|---|---|---|
| **Project manager** | "Learning Python 🐍" project | Plans, tracks progress, sets priorities and deadlines, keeps this knowledge base tidy | `goals.md`, `curriculum.md`, `chats.md` |
| **Python tutor** ("Starting with Python") | "Learning Python 🐍" project | Teaches the curriculum lesson by lesson, sets exercises, maintains Python_LCA_Notes.docx, adds Daily Python questions when topics open up (see `apps/daily-python/README.md`) | `skills.md`, lesson entries in `progress-log.md`, `apps/daily-python/questions.js` |
| **Python Learn app** ("Idea to explore") | "Learning Python 🐍" project | Builds and fixes the Python Learn HTML app | Python Learn entry in `projects.md` |
| **PhD research / visualisation** | PhD project | Literature review, research visualisation (bubble story, house icons), confirmation | Research-viz entries in `projects.md` |
| **Coding help, no learning focus** | — | One-off practical builds (e.g. ZARUP picker) where the goal is the tool, not learning | Teaching tool entries in `projects.md` |

## Starting a new chat
Paste this:
> Read `CLAUDE.md` and `knowledge-base/` in github.com/achu2-161/coding. Your role in this chat is **[role]**. Update the progress log when we finish.
