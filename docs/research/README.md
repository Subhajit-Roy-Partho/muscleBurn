# Exercise-form evidence map — workspace README

Topic: **How resistance-training form variations shift skeletal-muscle activation and mechanical stress.**
Slug: `exercise-form-variations-and-skeletal-muscle-activation-an-e`
Completed: 2026-11-17/18 · effort tier: high · stop reason: coverage checklist answered.

## Files

| File | What it is |
|---|---|
| `report.md` | Full synthesis (~88 KB): methods, PRISMA counts, per-exercise findings, contradictions, gaps, practical table, 90-reference appendix. |
| `exercises.json` | 22 exercises · 68 variations · 209 effects. Every effect has `referenceIds`. |
| `references.json` | 90 references with id, authors, year, journal, DOI, PMID, URL, evidenceLevel. |
| `sources.json` | Same 90 sources with OA flag, citation count, credibility tier, `viaAsuLibrary`. |
| `research-state.md` | Checklist, iteration log, seed recall test, convergence record. |
| `manifest.json` | Topic metadata, budgets, counts, databases and dates. |
| `work/` | Raw query JSON, merged abstract store, build scripts, report parts. Reproducible. |
| `logs/` | Per-iteration Tier-1 raw outputs. |

## `exercises.json` schema

```json
{
  "id": "barbell-back-squat",
  "name": "Barbell Back Squat",
  "category": "squat",
  "primaryMuscles": ["quadriceps (vastus lateralis)", "..."],
  "secondaryMuscles": ["..."],
  "variations": [
    {
      "id": "back-squat-depth",
      "name": "Depth: full vs parallel vs partial",
      "description": "...",
      "effects": [
        {
          "muscle": "gluteus maximus",
          "direction": "increase",
          "magnitude": "35.4% vs 28.0% vs 16.9%",
          "note": "...",
          "referenceIds": ["caterisano2002"]
        }
      ],
      "referenceIds": ["caterisano2002"]
    }
  ],
  "referenceIds": ["..."]
}
```

`direction` is one of `increase` | `decrease` | `shift` (redistribution or null).
Mechanical-stress effects put the structure in `muscle` (e.g. `knee joint (net knee moment)`,
`lumbar spine (L3-L5 von Mises stress)`) and state "Mechanical stress, not EMG" in `note`,
so a consumer can separate activation from stress with a filter.

## Consuming this in the 3D app

1. Load `references.json` into a map keyed by `id`.
2. Load `exercises.json`; for each variation render the effects, resolving `referenceIds` to DOI links.
3. Badge each effect with `references[n].evidenceLevel` and, for transparency, the number of independent
   references (`referenceIds.length`).
4. Do **not** map `direction` directly to a heat-map intensity without noting that EMG and joint stress are
   different constructs; the `note` field marks which one an effect refers to.

## Coverage summary

- Squat (back, front) — depth, stance, bar position, heel elevation, tempo.
- Deadlift (conventional, RDL) — sumo, hex bar, grip, set-up, stance.
- Bench press (flat, incline) — grip, angle, arch, feet, ROM, close-grip.
- Overhead press — front/back, barbell/machine, DB/KB.
- Row, pull-up, lat pulldown — torso angle, grip, ROM, bar path.
- Biceps curl, triceps pushdown/overhead extension — length, ROM, grip.
- Leg press, leg extension, leg curl, hip thrust, calf raise — foot/stance/hip angle/ROM.
- Lateral raise, chest fly, plank, crunch.
- Construct-validity sources on EMG vs hypertrophy and normalisation.

Known gaps are listed in `report.md` §6 (deficit/block pulls, seated vs standing OHP, OHP grip width,
standing vs seated calf raise, fly implement comparisons, tempo dose-response).
