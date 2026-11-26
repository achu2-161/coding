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
