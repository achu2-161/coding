# Python curriculum

Five phases. Every example is grounded in building science and LCA. Main environment: Google Colab.

| Phase | Topic | Planned length | Status |
|---|---|---|---|
| 1 | Python foundations | 2–3 weeks | 🔵 In progress |
| 2 | Data analysis: Pandas / NumPy | 3–4 weeks | ⬜ Not started |
| 3 | Visualisation: Matplotlib / Plotly | 2–3 weeks | ⬜ Not started |
| 4 | LCA tooling: Brightway2 | 3–4 weeks | ⬜ Not started |
| 5 | Small apps: Streamlit | 3–4 weeks | ⬜ Not started |

## Phase 1: Python foundations
- [x] Lesson 1: variables and types, f-strings, lists and loops with `zip()`, dictionaries as emission factor lookups, functions with docstrings
- [ ] Exercise: `compare_materials` function (🔵 in progress, not finished; **pick up here next**)
- [ ] Remaining foundations: `while` loops, list comprehensions, error handling, file I/O (CSV), modules
- [ ] **Phase 1 capstone (suggested):** a small embodied GHG emissions calculator that reads material quantities and emission factors and prints a formatted lifecycle-stage table

## Phase 2: Pandas / NumPy
Load and clean an LCA dataset, group by material and lifecycle stage, run retrofit scenario comparisons.

## Phase 3: Matplotlib / Plotly
Material comparison bar charts, stacked lifecycle-stage breakdowns, figures fit for the confirmation presentation.

## Phase 4: Brightway2
Set up LCA projects and databases, define activities and run impact assessment.

## Phase 5: Streamlit
A simple embodied GHG emissions estimator as a shareable web app.

## Supporting material
- **Python_LCA_Notes.docx:** living reference notes, rebuilt in full (Node.js + `docx`) at each milestone. Part 1 covers foundations, Part 2 the lesson exercises.
- **Python Learn app:** concept library, quizzes and flashcards, and Lesson Mode with Pyodide (see `projects.md`).
