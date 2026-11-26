# Daily Python

Five tap-based questions a day on your phone. Each day you finish adds a layer to a rammed-earth wall.

## How it works
- **Daily session:** 5 questions. Normally 3 review and 2 new. After a break, it's all review until you're caught up.
- **Spaced repetition:** a right answer moves a question to a longer gap before it comes back (1 → 2 → 4 → 8 → 16 days). A wrong answer brings it back tomorrow.
- **Streaks:** finishing a session counts for the day. You start with 2 streak freezes, earn 1 for each 7-day streak, and can hold up to 3. Freezes cover missed days automatically.
- **Backup:** progress is stored in your phone's browser. Use ⚙︎ → Copy backup now and then, and paste it into a note.

## Files
| File | What it is |
|---|---|
| `index.html` | The app (loads the two scripts below while developing) |
| `engine.js` | Scheduling, streaks and backup. No screen code |
| `questions.js` | The question bank and the list of unlocked topics |
| `verify_questions.py` | Runs every code question through real Python |
| `build.py` | Inlines everything into `dist/daily-python.html` for publishing |
| `tests/engine.test.js` | Engine tests |

## For the tutor chat: adding questions
1. Add questions to `QUESTIONS` in `questions.js`. For `order` questions, list any other order that also works in `alts`; the verifier will tell you. Use building science and LCA examples, keep code short (phone screen), and write a clear `explain`.
2. When Adrian starts a new topic in `skills.md`, add it to `TOPICS` and `UNLOCKED`.
3. Check and build:
   ```
   python3 -I apps/daily-python/verify_questions.py
   PYTHON=python3.11 python3 -I apps/daily-python/verify_questions.py   # Colab-era Python too
   node --test apps/daily-python/tests/engine.test.js
   python3 -I apps/daily-python/build.py
   python3 apps/daily-python/tests/ui_test.py
   ```
4. Republish `dist/daily-python.html` to the existing "Daily Python" artifact (id `6ca6d743-656b-459a-aec1-b5ecf4fc08d1`). Progress on the phone is kept.
