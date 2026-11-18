# muscleBurn

Interactive 3D muscle viewer for skeletal anatomy, built as a statically exported
Next.js (App Router + TypeScript) app. The figure is the **Écorché** full-body
atlas — one named mesh per anatomical structure — hovered and selected in 3D, with
attachments, actions and innervation in the side panel. An exercise layer records
how form variations shift demand across muscles, with citation hooks: **36 cited
exercises (22 gym + 14 home/bodyweight)** backed by **114 references**, filterable
by body region and by Home/Gym setting.

> **Educational only.** This is not medical advice, not a diagnostic tool, and not a
> training prescription. Exercise effects are placeholders until replaced with
> sourced data.

## The 3D model

[Écorché](https://github.com/Charleeh/ecorche) by Charleeh, licensed **CC BY-SA 4.0**.
The shipped asset is `public/models/ecorche.meshopt.glb` (6.0 MB, glTF 2.0 with
`EXT_meshopt_compression` + `KHR_mesh_quantization`), included **as-is**; the app
only assigns its own materials and colours at runtime — the mesh data is not
modified. Metadata for every mesh ships as `public/models/ecorche.structures.json`.

| | count |
|---|---|
| Structures (meshes) | 634 |
| Skeletal meshes | 272 (198 bone, 42 cartilage, 28 tooth, 4 eye) |
| Muscle meshes | 362 (159 deep, 203 superficial) |
| Triangles | ≈ 985,000 |
| Body space | metres, Y up, soles at y = 0, figure faces +Z, subject's left is +X |

Loading uses `GLTFLoader` with `MeshoptDecoder` (`three/examples/jsm`). The decoder
is mandatory: the meshopt GLB declares both extensions as *required*.

### Attribution (required by CC BY-SA 4.0)

> Écorché (github.com/Charleeh/ecorche), CC BY-SA 4.0. Based on BodyParts3D, © The
> Database Center for Life Science, CC BY 4.0, and Z-Anatomy by Gauthier Kervyn,
> CC BY-SA 4.0.

Full credits, licence notices and the list of changes made to the source data are
in [`public/models/ATTRIBUTION.md`](./public/models/ATTRIBUTION.md); the licence
text is in [`public/models/LICENSE-ECORCHE.md`](./public/models/LICENSE-ECORCHE.md).

- BodyParts3D — https://dbarchive.biosciencedbc.jp/en/bodyparts3d/ (CC BY 4.0)
- Z-Anatomy — https://www.z-anatomy.com/ (CC BY-SA 4.0)
- Écorché — https://github.com/Charleeh/ecorche (model CC BY-SA 4.0, viewer code MIT)

## Run / build

```bash
npm install
npm run dev        # http://localhost:3000/muscleBurn
npm run typecheck  # tsc --noEmit
npm run build      # static export into ./out
npx serve out      # preview the exported site
```

The app is exported with `output: 'export'` and served under the `/muscleBurn`
base path (`basePath` + `assetPrefix` in `next.config.mjs`). Runtime asset URLs are
built from `BASE_PATH` in [`lib/paths.ts`](./lib/paths.ts), which must stay in sync
with `next.config.mjs`.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes the
`out/` directory with the official GitHub Pages actions
(`configure-pages`, `upload-pages-artifact`, `deploy-pages`). Enable
**Settings → Pages → Source: GitHub Actions** once. Because the site is exported
under a `/muscleBurn` base path, it is published at
`https://<owner>.github.io/muscleBurn/`.

## Project layout

```
app/                    layout, page, global styles (dark anatomical theme)
components/
  ViewerMount.tsx       client-side mount for the 3D viewer (ssr: false)
  MuscleViewer.tsx      canvas, meshopt GLTF load, raycast picking, presets,
                        camera tweens, layer + side toggles, hover tooltip
  InfoPanel.tsx         structure search + attachments/action/innervation
  ExercisePanel.tsx     exercise list / empty state
lib/
  paths.ts              BASE_PATH + model URL
  muscleColors.ts       per-region palette and labels
  modelRegistry.ts      mesh-derived attachment spans, read by the panel
public/models/          ecorche.meshopt.glb, ecorche.structures.json,
                        ATTRIBUTION.md, LICENSE-ECORCHE.md
src/data/
  anatomy.ts            typed index over structures.json, region classifier
  muscles/meta.ts       curated origin/insertion/action/innervation (~127 muscles)
  types.ts              exercise/reference schema
  exercises.ts          exercise records (36) + region/setting filters
  references.ts         citations (114)
```

## How the atlas is wired

- **Index.** `src/data/anatomy.ts` maps every structure name (unique per mesh) to
  `{ name, layer, side, fma, group, tissue, isBone, region }`, and classifies
  muscles into a body region from their name (`regionForMuscle`). 13 regions:
  head, neck, shoulder, chest, abdomen, back, arm, forearm, hand, hip, thigh, leg,
  foot.
- **Materials.** One `MeshStandardMaterial` per region (plus one for bone) is built
  once and shared by every mesh of that region — metalness 0.05, roughness 0.55
  (bone 0.68, keeping its baked vertex colours). Hover and selection variants share
  the same base colour and add emissive.
- **Picking.** Hover and click are resolved with a manual `Raycaster` over visible
  meshes, throttled to ~60 ms, instead of per-mesh R3F event handlers — 634 meshes
  re-raycasting on every pointer move would stall the frame. Note that GLTFLoader
  sanitises node names (`Body of sternum` → `Body_of_sternum`); the original name
  is read from the node `extras` in `mesh.userData.name` and used as the key.
- **Camera.** Presets, zoom steps and structure focus are interruptible tweens
  (~520–620 ms); any pointer-down cancels them.
- **Attachments.** Muscles in the curated set (`src/data/muscles/meta.ts`, keyed by
  a side- and head-stripped slug, so `Lateral head of left triceps brachii` →
  `triceps-brachii`) show textbook attachments. Everything else shows the two poles
  of the mesh's longest bounding-box axis, marked `(derived)`; action and
  innervation then state explicitly that they are not yet documented.

## Data schema (exercise layer)

- `ExerciseFormVariation` — `{ id, name, description, effects: [{ muscle,
  direction: 'increase' | 'decrease' | 'shift', magnitude?, note?,
  referenceIds }], referenceIds }`
- `ExerciseDef` — `{ id, name, category, context?, primaryMuscles,
  secondaryMuscles, variations, referenceIds }`
- `Reference` — `{ id, title, authors, year, journal?, doi?, pmid?, url?,
  evidenceLevel? }`

### Home / Gym setting

`context` is `'home' | 'gym' | 'both'`; records without it are treated as `gym`.
The 14 `home` entries come from `docs/research/home-exercise-extension.md`
(no equipment assumed). Seven of the 22 gym movements are tagged `both` because
they need no equipment beyond a bar/pull-up bar or a single dumbbell and are
realistically performed at home: pull-up, biceps curl, hip thrust, calf raise,
lateral raise, plank, crunch. The remaining 15 stay `gym` (barbell/machine/bench
set-ups). The Exercise tab exposes this as an All / Home / Gym chip row combined
with the region filter and search; `Home` and `Gym` both include `both`
exercises, so nothing is hidden from either setting.

Exercise and reference records are a curated subset of the cited literature;
every effect carries `referenceIds`. Methodology, caveats and the educational
disclaimer are unchanged.

## Adding data

- Curated anatomy: add an entry to `MUSCLE_META` in `src/data/muscles/meta.ts`
  keyed by `muscleSlug(meshName)`; run `npx tsc --noEmit` to catch typos.
- Exercises: append an `ExerciseDef`-shaped record to
  `src/data/raw/exercises.json` (include `context`), then run
  `node scripts/validate-mapping.mjs --strict` — every muscle label must resolve
  through `src/data/raw/muscle-map.json`. Add an alias there rather than editing
  the research label.
- References: append to `src/data/raw/references.json`; only cite what you have
  verified — never invent a DOI or PMID.
- Verification: `npx tsc --noEmit`, `npm run build`, `node scripts/validate-mapping.mjs
  --strict`, then `node scripts/e2e-heatmap.mjs` (Playwright resolved out-of-repo).

## License

- **Application code:** GNU Affero General Public License v3.0 (AGPL-3.0), see
  [`LICENSE`](./LICENSE). AGPL requires that modified versions offered over a
  network make their source available.
- **3D model and its metadata** (`public/models/ecorche.meshopt.glb`,
  `ecorche.structures.json`, `ATTRIBUTION.md`, `LICENSE-ECORCHE.md`): third-party
  material under **CC BY-SA 4.0**, © the Écorché project and its sources as listed
  above. Share-alike applies to the model files and to modified meshes, not to the
  app code.
