# Conventions

## Terminology (required)
- Say **"embodied greenhouse gas emissions"** or **"embodied GHG emissions"**. Never "embodied carbon". Carbon itself isn't the problem; greenhouse gases are.
- Say **"greenhouse gas emissions"**. Avoid "carbon emissions" and "carbon-intensive". "Carbon footprint" is fine as a concept term.
- Energy: say "energy use", "use energy" and "users of energy".
- Building heights (ABS/NSW definitions): low-rise 1–3 storeys, medium-rise 4–8, high-rise 9–19, super high-rise 20+ (optional).
- Units: kg CO₂e and t CO₂e for GHG emissions.
- Spelling: Australian English (visualisation, colour, analyse).

## How I like to learn
- Let me try an exercise first, then explain.
- Use building science context (heat transfer, U-values, heat pumps, LCA stages), not generic examples.
- Give simple step-by-step guidance for technical work.
- I build iteratively: get a working version first, then refine it over versions.

## CS50x: my views and fit for my learning
- **What I liked:** it goes into a lot of detail on how computing works, and C being the "grandaddy" of many modern languages. It helps me appreciate how sophisticated Python's memory management is.
- **What I didn't:** I spent weeks on memory management and pointers, gave up on them a few times because they were so convoluted, and they aren't used much afterwards. It felt like a lot of effort for the satisfaction of a green tick.
- **Starter code:** the distribution code (templates linking to other files and libraries) was obscure. I couldn't see what it did or where it lived, and I think I overthought a lot of it.
- **Learning online:** when stuck, there's no office hours. The community is supportive, but people tend to give answers with weaker explanations.
- **What I want from it now:** understanding over completion. I'm not resubmitting, so I'd like Claude to coach me through problem sets for learning only. Old submissions don't show my real level (see `skills.md`).
- **My goal is Python for LCA data analysis, visualisation and small apps.** Treat CS50 as optional background, and take what helps that, not the course for its own sake.

## How I like to build
- Single-file HTML apps (embedded assets, localStorage for persistence) work well for my tools.
- Send updated files straight away after an edit, without being asked.
- Rebuild Python_LCA_Notes.docx in full each time with the same helper functions. Don't patch it.
- Make presentation scenes visually impressive.

## Code style (to settle as I go)
- Clear variable names with units where it helps, e.g. `u_value_w_m2k` and `ghg_kgco2e`.
- Docstrings on every function.
- Put code in this repo by phase: `phase-1-foundations/`, `phase-2-pandas/` and so on.

## Privacy
- Don't connect email to Claude. Suggest other ways to connect tools.
