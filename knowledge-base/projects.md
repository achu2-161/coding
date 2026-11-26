# Projects

## Learning tools
### Daily Python (`apps/daily-python/`)
A phone app with 5 tap-based questions a day: multiple choice, "what does this print?", spot the bug, fill the blank, and put lines in order. It uses spaced repetition, so returning after a break starts with review. Streaks are pictured as a rammed-earth wall that gains a layer each day you practise. You start with 2 streak freezes, earn 1 per 7-day streak, and can hold up to 3.
- Questions follow `skills.md`: only topics in `UNLOCKED` appear. Every code answer is checked by real Python (`verify_questions.py`).
- Published as a private artifact, "Daily Python": https://claude.ai/artifact/ERB3MyZEsr2YBKGMdFLGyn (artifact id `6ca6d743-656b-459a-aec1-b5ecf4fc08d1`). Progress is stored in the phone's browser; back it up with ⚙︎ → Copy backup.
- Built 2026-11-26. Coding questions only (58 on Phase 1); Adrian doesn't want PhD/LCA content quizzed here.
- "Explain more" button under each answer asks Claude for a fuller explanation (uses Adrian's Claude usage; needs his approval the first time).

### Python Learn (`python_learn.html`, `python_learn_v2.html`)
A local, single-file HTML app for learning Python.
- **v1:** library of about 50 concepts in 5 categories (Fundamentals, Data Structures, Functions & Scope, LCA-Specific, Libraries). Quiz and flashcard modes, favourites, filters, localStorage. Slide-in menu to launch study modes.
- **v2:** adds Lesson Mode with four activities: Explain, Sandbox (real Python via Pyodide), Output Prediction, and Scenario (LCA coding challenges).
- **Lesson learned:** Pyodide needs a retry loop that waits for `loadPyodide` before calling it, plus a status dot (yellow while loading, green when ready).
- Inspired by Adrian's earlier Adripedia/Yixiaopedia quiz app.

## Teaching tools
### ZARUP Interview Picker (`ZARUP_Interview_Picker.html`)
A spinning wheel that picks oral exam questions (27 questions in 4 categories: GC, LC, BP, BS). Converted from a pygame version.
- Reads student data from an Excel file (sheets `data_feed` and `Detailed timetables`).
- Students are ordered by timetable day (Tuesday to Friday).
- Keeps a log in localStorage, with buttons to save, download as CSV, and clear.
- **Lesson learned:** the XLSX JS library handles sparse columns badly. Use `header:1` mode with explicit array indexing.

### Unity games
- A UI matching game with drag-to-match, delayed scoring and colour-coded line feedback.
- A spin-wheel question selector: 25 questions across 5 themes, eliminating themes one at a time.

## Research visualisation
### Embodied GHG emissions bubble story (proof of concept)
A scrollytelling-style animation with about 16,500 bubbles (1 t CO₂e each), spring physics, and a red "hero" bubble that travels between scenes. It has five acts: total emissions, split by material (concrete, steel, timber, glasswool), split by lifecycle stage, embodied vs operational, and a timber substitution scenario.
- **Next:** replace the bubbles with **house icons** representing dwellings, and apply them to housing stock retrofit scenarios for the confirmation.

### Thermal simulation tools (HTML + Chart.js)
Hourly passive solar simulators. They went from steady-state models to a two-node RC network running 8,760 hours with explicit Euler. They cover six wall materials (clay brick, concrete block, rammed earth, mud brick, limestone, granite) and three city presets (Athens, Rome, Madrid).

### World map (Python, matplotlib + Natural Earth)
A borderless world map showing physical features only. Styles tried: antique, hypsometric relief, and flat terrain bands.
