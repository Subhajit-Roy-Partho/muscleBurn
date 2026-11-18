# Resistance-band exercise extension — search log and evidence notes

> Vendored copy of the deep-research workspace notes for provenance. The 12
> exercises and 29 references it describes are merged into
> `src/data/raw/exercises.json` and `src/data/raw/references.json`; the
> original JSON files stay in the workspace at
> `/home/subho/Documents/deep-research/band-exercise-extension/`. Nothing below
> was edited during the merge except this provenance note.

Date: 18 November 2026
Workspace: `/home/subho/Documents/deep-research/band-exercise-extension/`
Scope: 12 home band exercises, 40 variations, 87 cited effects, 29 new references (0 existing references reused inside the JSON).

Deliverables:

- `band-exercises.json` — same schema as `src/data/raw/exercises.json`, plus `"equipment": ["band"]` on every entry and `"context": "home"`.
- `band-references.json` — only references **not** already in `src/data/raw/references.json` (29 records, every DOI resolved through Crossref).
- `notes.md` — this file.

---

## 1. Schema notes (read before merging)

1. **Muscle labels are lowercase in the repository.** The task brief used capitalised examples (`Pectoralis major`), but `exercises.json` uses lowercase throughout (`pectoralis major (sternocostal)`, `latissimus dorsi`, `gluteus maximus`). This file follows the repository, not the brief's examples, so the existing alias table resolves every label.
2. **`equipment` is a new field.** `src/data/types.ts` (`ExerciseDef`) does not declare it, exactly as it did not declare `context` before the previous extension. The TypeScript interface needs `equipment?: string[]` before the app reads it.
3. **`types.ts` is already behind the data** on two other points: `ExerciseFormVariation.effects[].magnitude` is typed `number` but the data (old and new) stores strings, and `Reference.evidenceLevel` is typed as `'textbook' | 'systematic-review' | 'rct' | 'cohort' | 'expert-opinion'` while the JSON uses `'EMG cohort'`, `'systematic review/meta-analysis'`, `'biomechanical crossover'`, etc. No repo file was modified.
4. Mechanical-stress claims are attached to a muscle only where the load on that muscle is what changes; pure band-tension physics is placed in `note` fields so no new non-muscle label had to be invented for `muscle-map.json`.

---

## 2. Search log

### 2.1 Tiers and tools

| Tier | Source | Role | Notes |
|---|---|---|---|
| 1 | Europe PMC REST (`/search`, `resultType=lite|core`) | discovery + abstracts | 27 fielded queries, ~407 raw hits (heavy overlap between queries), 39 abstracts read |
| 1 | Crossref (`crossref_lookup.sh --query/--doi`, then `api.crossref.org/works/{doi}`) | bibliographic metadata for every included DOI | 13 ranked queries; 29/29 DOIs resolved in DOI mode |
| 1 | Semantic Scholar (`s2_lookup.sh`) | influential-citation check | 10 queries; 2 returned no hits, 1 returned HTTP 429 and was retried later |
| 2 | Scopus (`scopus_lookup.sh`) | cross-check | 5 plain keyword queries; `TITLE-ABS-KEY(...)` syntax returned HTTP 400 through the script, so plain queries were used and produced almost nothing usable |
| 2 | ASU Library (`asu_status` → `asu_fulltext`) | paywalled full text | 2 attempts: Iversen 2017 is open access and was read in full (32,736 characters); Skals 2018 returned abstract only (subscription required) |
| 3 | Firecrawl / general web | — | not used for any included claim |

LibKey: `LIBKEY_KEY`/`LIBKEY_API_KEY` unset, so automated retraction gating was unavailable. Every DOI was resolved through Crossref; no retraction or expression-of-concern notice was seen. This is a limitation, not a guarantee.

### 2.2 Europe PMC hit counts (queries preserved for reproducibility)

| Query | hitCount | Outcome |
|---|---|---|
| `(TITLE:"elastic band" OR "elastic resistance" OR "resistance band" OR "TheraBand") AND (ABSTRACT/TITLE:electromyograph*)` | 43 | the core pool; 12 included |
| elastic + `"chest press"` | 6 | none report chest-press EMG |
| elastic + `"lat pull*" OR "pulldown"` | 1 | Iversen 2017 (included) |
| `"face pull"` (title/abstract) | 2 | 1 biomechanics paper (included), 1 irrelevant |
| `"Pallof"` | 5 | 1 postural-control study, no EMG |
| elastic + `"hip thrust" OR "glute bridge"` | 0 | confirms the gap |
| elastic + `"deadlift"` | 6 | 1 single-leg deadlift study (elastic barbell, excluded as a different implement) |
| elastic + `"calf raise" OR "heel raise" OR "plantarflex*"` | 1 | Mullaney 2011 (included) |
| elastic + `"shoulder press" OR "overhead press" OR "military press"` | 5 | none report press EMG |
| elastic + `"biceps" OR "elbow flexion" OR "curl"` | 66 | 2 included |
| elastic + `"triceps" OR "elbow extension"` | 12 | none usable |
| elastic + `"pectoralis" OR "chest press" OR "horizontal adduction"` | 17 | 2 included |
| elastic + `"bench press"` | 17 | none report band chest-press EMG |
| `TITLE:"elastic" AND TITLE:"electromyograph*"` AND squat/row/press | 0 | — |
| elastic + `force-elongation / force-length / tension` | 16 | Uchida 2016, Shoepe 2010 (included) |
| elastic resistance + perceived exertion | 12 | none needed |
| `TITLE:"hip thrust"` | 36 | no band hip-thrust EMG |
| `TITLE:"prone hip extension"` + band | 2 | both used a **non-elastic** band for reciprocal inhibition — excluded |
| anti-rotation (title) | 0 | confirms the Pallof gap |
| `TITLE:"wood chop"` | 4 | no EMG |
| `TITLE:"pull-apart"` | 19 | only Fukunaga 2022 is exercise-relevant |
| `TITLE:"band"` + triceps/elbow extension | 49 | all clinical tension-band or irrelevant |
| `TITLE:"elastic"` + calf/plantarflex/heel raise | 23 | none beyond Mullaney 2011 |
| full-text: `"elastic band" AND "chest press" AND EMG` | 22 | full-text co-occurrence only; no direct study |
| full-text: `"elastic resistance" AND "shoulder press" AND EMG` | 7 | no direct study |
| full-text: `"band" AND "face pull"` | 14 | no direct study |
| full-text: `"elastic" AND "lateral raise" AND EMG` | 22 | Andersen 2010 (included) |

### 2.3 Crossref queries

`elastic resistance training systematic review meta-analysis muscle strength`; `elastic band chest press electromyography pectoralis`; `elastic resistance lat pulldown muscle activation`; `elastic band row exercise muscle activation`; `Pallof press electromyography core`; `chest press elastic tubing muscle activity`; `shoulder press elastic band muscle activity deltoid`; `elastic band bench press kinematics`; `band exercise biceps brachii electromyographic`; `shoulder press with elastic band`; `elastic resistance overhead press electromyography`; `triceps extension elastic resistance electromyography`; `elastic band triceps pushdown`. The last six returned only book chapters, non-peer-reviewed dissertations or irrelevant records, which is the basis for calling the shoulder-press and triceps gaps real rather than search artefacts.

### 2.4 Full-text verification

Every magnitude in `band-exercises.json` was read in an abstract or full text before writing. Where the source gave only a direction, the `magnitude` string says "lower", "higher" or "no difference" rather than inventing a number. Iversen 2017 was read in full, which is why its percentages (11-15%, 11-13%, 11%) and phase names (C1/C2/E1/E2) are exact.

---

## 3. Per-exercise confidence

| Exercise | Confidence | Basis and caveat |
|---|---|---|
| `band-row` | **High** | Direct within-subject comparison, n=29, 10RM matched, phase-resolved, magnitude quantified (11-13%). Caveat: "unilateral row" was the band condition, cable/barbell the comparator. |
| `band-lat-pulldown` | **High** | Same study, same design, 11-15% deficit quantified; the authors explicitly call bands viable for this lift. |
| `band-hamstring-curl` | **High** | Direct crossover, n=19, peak activity >80% MVIC in both modes, angle- and phase-resolved. Caveat: the band was slightly worse exactly where the hamstrings are most lengthened (30-50 degrees). |
| `band-squat` | **High for the negative quadriceps finding, moderate for the gluteal benefit** | Iversen 2017 is unambiguous that band squats are not a barbell substitute for quadriceps. The gluteal/hip-extensor advantage is supported by the same study (first eccentric phase) plus Martins 2022 (GMed +83%, GMax +68% with a forefoot loop). Do not present the band squat as quadriceps-equivalent. |
| `band-lateral-raise` | **Moderate** | One 16-female 3RM comparison showing no significant difference, plus a 30-participant load-equivalence study that passed only in men. No study in trained lifters. |
| `band-romanian-deadlift` | **Moderate** | One crossover (n=29) with quantified 11% erector-spinae deficit; the band was anchored behind the body rather than under the feet, so the comparison is not purely a load-mode comparison. |
| `band-biceps-curl` | **Low-moderate** | No matched-load band-versus-dumbbell EMG study. Supported by load-equivalence testing, one clinical study (elastic > unloaded) and one accommodating-resistance kinematics study on a cable+elastic setup. |
| `band-calf-raise` | **Moderate-low** | One study, 20 healthy lower extremities, comparing exercises rather than modalities; band plantarflexion was 45% MVIC, far below a single-leg heel raise (112%). Useful mainly to rank band calf work as a low-load option. |
| `band-chest-press` | **Low** | No direct study. Effects are transferred from flyes (band vs dumbbell), elastic-resisted push-ups (vs bench press) and pooled strength meta-analyses. Every note says so. |
| `band-face-pull` | **Low** | No band face-pull EMG exists. Supported by OpenSim posterior-deltoid forces for the pattern (dumbbell), reverse-fly band-vs-dumbbell EMG, arm-position EMG and a dual-vector study. |
| `band-glute-bridge` | **Low-moderate** | One 11-participant GTA-index study plus band-placement evidence from standing hip work (not a bridge). The placement variation is labelled as adjacent evidence. |
| `band-woodchop` | **Moderate** | One direct band-versus-machine comparison (n=17) with exact nEMG; only one study, and the machine was better for external oblique while the band was better for erector spinae. |

---

## 4. Existing references reused

**None inside `band-exercises.json`.** This is deliberate: the existing band-adjacent references are barbell or machine studies (`andersen2014` grip width in lat pulldown, `coratella2022` overhead press, `contreras2015` hip thrust, `kennedy2024`/`kim2026` bridge versus thrust), and transferring a modality-specific magnitude would have violated the no-overclaim rule. Where those papers would only have repeated claims already made in `docs/research/home-exercise-extension.md`, they were left out.

Two existing references are relevant as **method caveats** and are cited here rather than in the JSON:

- `vigotsky2022`, `vigotsky2016` — surface EMG amplitude is not a validated proxy for hypertrophy or motor-unit recruitment. Every "decrease"/"increase" in this dataset is an activation claim, not a growth claim.
- `besomi2020` — amplitude-normalisation standards; all included studies normalised to MVC, but the normalisation tasks differed.

`fukunaga2022` remains the sole source for the existing `home-band-pull-apart` entry (see §6).

---

## 5. New references (29, all DOI-verified through Crossref)

| id | DOI | Year | Journal | Evidence level |
|---|---|---|---|---|
| `lopes2019` | 10.1177/2050312119831116 | 2019 | SAGE Open Medicine | systematic review/meta-analysis |
| `iversen2017` | 10.1080/17461391.2017.1337229 | 2017 | European Journal of Sport Science | EMG cohort |
| `bergquist2018` | 10.1515/hukin-2017-0137 | 2018 | Journal of Human Kinetics | EMG cohort |
| `andersen2010` | 10.2522/ptj.20090167 | 2010 | Physical Therapy | EMG cohort |
| `jakobsen2014` | 10.1097/phm.0000000000000043 | 2014 | American Journal of Physical Medicine & Rehabilitation | EMG cohort |
| `saeterbakken2014` | 10.1519/jsc.0000000000000516 | 2014 | Journal of Strength and Conditioning Research | EMG cohort |
| `shi2024` | 10.1123/ijspp.2024-0009 | 2024 | International Journal of Sports Physiology and Performance | biomechanical crossover |
| `ebben2002` | 10.1519/1533-4287(2002)016<0547:eakaot>2.0.co;2 | 2002 | Journal of Strength and Conditioning Research | EMG cohort |
| `martins2022` | 10.3390/jfmk7030060 | 2022 | Journal of Functional Morphology and Kinesiology | EMG cohort |
| `mullaney2011` | 10.1177/1941738111416911 | 2011 | Sports Health | EMG cohort |
| `calatayud2014` | 10.3810/psm.2014.11.2097 | 2014 | The Physician and Sportsmedicine | EMG cohort |
| `vinstrup2015` | 10.1155/2015/403068 | 2015 | Scientifica | EMG cohort |
| `vinstrup2017` | 10.1007/s00421-017-3620-2 | 2017 | European Journal of Applied Physiology | EMG cohort |
| `zhu2025` | 10.37190/abb/217836 | 2025 | Acta of Bioengineering and Biomechanics | biomechanical |
| `tsuruike2020` | 10.1177/1941738120929305 | 2020 | Sports Health | EMG cohort |
| `bishop2018` | 10.26603/ijspt20180668 | 2018 | International Journal of Sports Physical Therapy | EMG cohort |
| `cambridge2012` | 10.1016/j.clinbiomech.2012.03.002 | 2012 | Clinical Biomechanics | EMG cohort |
| `martinruiz2026` | 10.1177/19417381251353769 | 2026 | Sports Health | EMG cohort |
| `garcialopez2010` | 10.1519/jsc.0b013e3181e3482f | 2010 | Journal of Strength and Conditioning Research | biomechanical crossover |
| `uchida2016` | 10.1589/jpts.28.1266 | 2016 | Journal of Physical Therapy Science | biomechanical |
| `shoepe2010` | 10.1519/jsc.0b013e318199d963 | 2010 | Journal of Strength and Conditioning Research | biomechanical |
| `li2026a` | 10.5114/jhk/202810 | 2026 | Journal of Human Kinetics | systematic review/meta-analysis |
| `li2026b` | 10.1519/JSC.0000000000005369 | 2026 | Journal of Strength and Conditioning Research | systematic review/meta-analysis |
| `seguin2022` | 10.3390/sports10020024 | 2022 | Sports | systematic review/meta-analysis |
| `jakobsen2013` | 10.1016/j.humov.2012.07.002 | 2013 | Human Movement Science | EMG cohort |
| `meng2025` | 10.3389/fspor.2025.1649305 | 2025 | Frontiers in Sports and Active Living | systematic review/meta-analysis |
| `schott2026` | 10.1016/j.exger.2026.113182 | 2026 | Experimental Gerontology | RCT |
| `bench2021` | 10.26603/001c.21309 | 2021 | International Journal of Sports Physical Therapy | EMG cohort |
| `calatayud2019` | 10.1093/ptj/pzy136 | 2019 | Physical Therapy | EMG cohort |

Metadata provenance and caveats:

- Title, authors, journal and DOI were taken from the Crossref record, not retyped. `citedBy` is Crossref's `is-referenced-by-count` at retrieval; older DOIs are undercounted there (Ebben 2002 shows 3 despite ~66 citations in Europe PMC), so treat the field as relative, not absolute.
- Year is the print/issue year where Crossref has one, otherwise the online year. Two records disagree between Crossref and Europe PMC (`zhu2025`, `martinruiz2026`); the issue year was used and matches the `id`.
- `seguin2022` is a systematic review **without** pooled meta-analysis; it carries the `systematic review/meta-analysis` label because that is the closest value in the repository's controlled vocabulary. Do not cite it as a meta-analysis.
- `bergquist2018`'s DOI resolves but its publisher landing page (reference-global.com) returns 404, so its `url` points at the open-access PMC copy (PMC5873332). All other DOIs resolve to live publisher pages; a few return 403 to automated HEAD requests but resolve normally in a browser.

---

## 6. `home-band-pull-apart` — deliberately not duplicated

`home-band-pull-apart` already exists with 3 variations, 6 effects and one reference (`fukunaga2022`). A dedicated search (`TITLE:"pull-apart"`, 19 hits; plus the 43-record elastic-EMG pool) found **no new evidence** on the pull-apart after 2022. No variation was added, because inventing one would have required either duplicating `fukunaga2022` or citing unrelated band work. The entry should be left exactly as it is.

---

## 7. Exercises deliberately omitted (and why)

| Candidate | Why it was omitted |
|---|---|
| **Band shoulder press** | No EMG study, no training study, no biomechanical study of a band overhead press was located across Europe PMC, Crossref, Semantic Scholar and Scopus. The nearest data are deltoid activation during generic band exercises in bed, which does not identify a press. Including it would have meant assigning directions and magnitudes from extrapolation alone. |
| **Band triceps extension / pushdown** | Same result: 12 Europe PMC hits and 49 title hits, none reporting triceps EMG for elastic resistance. The existing `overhead-triceps-extension` and `triceps-pushdown` entries already carry the cable/dumbbell evidence (`maeo2023`), which does not transfer to a band without a study. |
| **Band Pallof press** | Zero anti-rotation EMG studies. The only Pallof-specific paper ranks postural-control difficulty across body positions (accelerometer, not EMG) and cannot support a muscle effect. |
| **Band hip thrust (as opposed to bridge)** | Zero band hip-thrust studies. The bridge entry uses bridge evidence and labels the placement variation as standing-work evidence. |
| **Band lateral walk / monster walk** | Not on the requested list, and the only data (Cambridge 2012) are already used as placement evidence inside `band-glute-bridge`. |

Twelve exercises were delivered rather than fourteen because these four would have been unsourced. The requested 10-14 range is met.

---

## 8. Evidence gaps (not claims)

1. **Band chest press** — the single largest gap. No matched-load band-versus-dumbbell or band-versus-cable chest-press EMG study exists in the indexed literature. The entry is explicitly a transfer from flyes and elastic push-ups.
2. **Band face pull** — no EMG at all; the posterior-deltoid force data come from a dumbbell face pull.
3. **Band shoulder press and triceps** — no studies (see §7).
4. **Band hip thrust** — no studies; bridge is the proxy.
5. **Load quantification** — band tension depends on colour, brand, elongation and anchor geometry. Uchida 2016 shows manufacturer tables overestimate tension for 5 of 8 Thera-Band colours, so "10RM matched" in the band arm of every crossover study carries extra error. The Iversen 2017 authors say so themselves and recommend prescribing rep ranges (6-12, 10-15) rather than exact loads.
6. **Population** — most samples are young, healthy and mixed-sex; `calatayud2019` (haemophilia) and `schott2026` (older adults) are the exceptions. `bishop2018` (n=11 participants) and `cambridge2012` (n=9) are small.
7. **Sex moderation** — `martinruiz2026` found load equivalence in men but not women for elbow flexion and shoulder abduction; no other included study was powered to test sex differences.
8. **Hypertrophy** — no training study measured band-only hypertrophy at a matched load. All growth claims here are strength outcomes, not muscle size.

---

## 9. Validation output

`python3 validate_only.py` (reads both deliverables plus the repo dataset):

```
JSON parse: OK (both files)
exercises=12  variations=40  effects=87
references: existing=114  new=29  combined=143
directions: {'decrease': 29, 'increase': 35, 'shift': 23}
dangling referenceIds: 0 []
exercise-id collisions: 0
variation-id duplicates/collisions: 0 0
new-ref id collisions: 0
new-ref DOI collisions: 0
new refs missing fields: []
new refs not cited: []
bad context/equipment entries: []
ERRORS: none
```

The repository's own `scripts/validate-mapping.mjs` was copied to `/tmp/bandsearch/vm.mjs` and re-pointed at the new files and the merged reference set (no repo edit). With `--strict`:

```
muscleBurn — deep-research mapping validation
------------------------------------------------
exercises:            12
variations:           40
effects:              87
references:           143 (143 resolvable links)
research muscle labels: 44
  mapped:             41
  non-muscle labels:  3
  unmapped:           0
Écorché muscle bases: 178
alias targets missing from atlas: 0
citation ids missing from references.json: 0

Unmapped muscle labels:
  (none)

OK
exit=0
```

Every muscle label resolves through `src/data/raw/muscle-map.json` to an Écorché structure, and every effect reference resolves to a reference record.
