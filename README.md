# muscleBurn

Interactive 3D muscle viewer for skeletal anatomy, built as a statically exported
Next.js (App Router + TypeScript) app. Each muscle is rendered as a swept fiber
between its origin and insertion, can be hovered/selected in 3D, and is described
by its action and innervation. An exercise layer (schema-first) is scaffolded to
record how form variations shift demand across muscles, with citation hooks.

> **Educational only.** This is not medical advice, not a diagnostic tool, and not a
> training prescription. Modeled anatomy is an approximation; exercise effects are
> placeholders until replaced with sourced data.

## Run / build

```bash
npm install
npm run dev        # http://localhost:3000/muscleBurn
npm run typecheck  # tsc --noEmit
npm run build      # static export into ./out
npx serve out      # preview the exported site
```

The app is exported with `output: 'export'`, and is served under the
`/muscleBurn` base path (`basePath` + `assetPrefix` in `next.config.mjs`).

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes the
`out/` directory with the official GitHub Pages actions
(`configure-pages`, `upload-pages-artifact`, `deploy-pages`). Enable
**Settings → Pages → Source: GitHub Actions** on the repository once. Because the
site is exported under a `/muscleBurn` base path, it is published at
`https://<owner>.github.io/muscleBurn/`.

## Project layout

```
app/                    layout, page, global styles (dark anatomical theme)
components/
  ViewerMount.tsx       client-side mount for the 3D viewer (ssr: false)
  MuscleViewer.tsx      react-three-fiber canvas, presets, layers, hover/select
  InfoPanel.tsx         selected muscle details + search
  ExercisePanel.tsx     exercise list / empty state
lib/
  muscleGeometry.ts     CatmullRom fiber -> parallel-transport swept tube geometry
  muscleTexture.ts      procedural striation CanvasTexture
  muscleColors.ts       per-group colors and labels
src/data/
  types.ts              shared schema
  muscles/placeholder.ts approximate muscle set
  exercises.ts          placeholder exercise entries
  references.ts         placeholder citations
```

## Data schema (summary)

All coordinates are in normalized **body space**: `y` up, floor at `y = 0`,
height ≈ 1.8, `+x` = the subject's anatomical right, `+z` = anterior. The
anterior camera looks along `-z`, so the subject's right appears on the viewer's
left, as in a face-to-face anatomical view.

- `Vec3 = [number, number, number]`
- `MuscleGroup` — `head | neck | back | chest | abdomen | shoulder | arm |
  forearm | hand | hip | thigh | leg | foot`
- `MuscleDef` — `{ id, name, group, side, origin, insertion, path?, radius,
  flatten?, action, innervation, referenceIds? }`
- `ExerciseFormVariation` — `{ id, name, description, effects: [{ muscle,
  direction: 'increase' | 'decrease' | 'shift', magnitude?, note?,
  referenceIds }], referenceIds }`
- `ExerciseDef` — `{ id, name, category, primaryMuscles, secondaryMuscles,
  variations, referenceIds }`
- `Reference` — `{ id, title, authors, year, journal?, doi?, pmid?, url?,
  evidenceLevel? }`

Geometry: a `CatmullRomCurve3` through `origin → path → insertion` is swept with
parallel-transport frames, 24 length segments × 16 radial segments, an elliptical
cross-section with radius profile `r(t) = radius · (0.25 + 0.75 · sin(πt)^0.7)`
and `flatten` compressing one axis (`r · (1 − 0.6 · flatten)`). Both ends are
capped; UVs are `u = t` along the fiber and `v = angle / 2π`.

## Adding data

- Muscles: extend `PAIRED` in `src/data/muscles/placeholder.ts`; left sides are
  mirrored automatically (mirroring negates `x`).
- Exercises: add `ExerciseDef` entries to `EXERCISES` (the panel renders an
  empty state when the list is empty).
- References: add `Reference` entries to `REFERENCES`; only cite what you have
  verified — never invent a DOI or PMID.

## License

Source is released under the **GNU Affero General Public License v3.0**
(AGPL-3.0). See [`LICENSE`](./LICENSE). AGPL requires that modified versions
offered over a network make their source available.
