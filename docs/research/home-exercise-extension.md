# Home / bodyweight exercise extension — search log and evidence notes

> Vendored copy of the deep-research workspace notes for provenance. The 14
> exercises and 24 references it describes are merged into
> `src/data/raw/exercises.json` and `src/data/raw/references.json`; the
> original JSON files stay in the workspace.

Date: 18 November 2026
Workspace: `/home/subho/Documents/deep-research/home-exercise-extension/`
Scope: 14 home exercises, 46 variations, 105 cited effects, 24 new references (15 existing references reused).

Deliverables:

- `home-exercises.json` — same schema as `src/data/raw/exercises.json`, plus `"context": "home"` on every entry.
- `home-references.json` — only references **not** already in `src/data/raw/references.json` (24 records, all DOI-verified through Crossref).
- `notes.md` — this file.

---

## 1. Search log

### 1.1 Tools and tiers used

| Tier | Source | Role | Notes |
|---|---|---|---|
| 1 | Crossref (`~/.config/opencode/crossref/crossref_lookup.sh --query/--doi`) | discovery + authoritative metadata for every new DOI | no key needed; 30 bibliographic queries + 25 DOI lookups |
| 1 | Europe PMC REST (`.../europepmc/webservices/rest/search`) | abstracts, PMIDs, hit counts | used for discovery of posterior-chain/core items; intermittent HTTP 503, retried |
| 1 | OpenAlex REST (`api.openalex.org`) | abstracts where Europe PMC lacked the record | HTTP 429 on burst queries; used for single-DOI abstract lookups only |
| 1 | Semantic Scholar (`s2_lookup.sh --doi`) | influential-citation check | HTTP 404 for one 2005 JSCR DOI (not indexed); not relied on |
| 2 | ASU Library (`asu_status`/`asu_search`/`asu_fulltext`) | paywalled full text | **not needed** — all 24 new references had an accessible abstract via Europe PMC or OpenAlex; no PDFs saved |
| 3 | Firecrawl / general web | — | not used for any included claim |
| — | Scopus | — | key present, not queried: every claim resolved at Tier-1 metadata/abstract level; quota preserved |
| — | arXiv | — | not queried: no biomechanics preprint was needed |

LibKey: `LIBKEY_KEY` unset, so automated retraction gating was unavailable. Crossref/OpenAlex metadata were checked for all 24 new DOIs; no retraction or expression-of-concern notice was seen. This is a limitation, not a guarantee.

### 1.2 Crossref bibliographic queries (all returned 5 ranked hits each)

Push-up: hand positions; incline/decline; knee vs standard; push-up vs bench press hypertrophy; push-up plus; Gouvali/Boudolos variants; Lehman hand positions; feet elevated; stable vs unstable; suspended push-up.
Squat: bodyweight stance width; bodyweight depth; partial vs full; narrow/wide; bodyweight vs loaded; squat ROM kinetics.
Unilateral: Bulgarian split squat; split squat vs lunge; forward vs reverse lunge; lunge knee load; patellofemoral lunge; lunge variations; backward lunge.
Posterior chain / core: single-leg bridge; bridge variations; prone extension; superman; side plank; hollow hold; hollow body; Nordic EMG; Nordic RCT; Nordic knee angle; Nordic meta-analysis; single-leg calf raise; unilateral heel raise; calf knee flexion; step-up; step-up height; lateral step-up; inverted row; bodyweight row; band row; band pull-apart; bench dip; pike push-up; handstand push-up.

### 1.3 Europe PMC hit counts (queries preserved for reproducibility)

| Query | hitCount | Outcome |
|---|---|---|
| `"superman exercise" AND electromyography` | 16 | 1 usable (`10.3390/medicina61060986`) |
| `handstand AND (electromyography OR EMG) AND (shoulder OR upper limb)` | 20 | none report push-up activation; 1 handstand balance SR (not used) |
| `"pike push-up" OR "pike push up"` | 1 | irrelevant (liver-transplant protocol); confirms the gap |
| `"single-leg bridge" OR "single leg bridge" AND (electromyography OR EMG)` | 62 | none compare single- vs double-leg bridge activation |
| `(unilateral OR "one-leg") AND bridge AND gluteus AND (EMG)` | 260 | no eligible direct comparison |

### 1.4 OpenAlex

- `"bench dip triceps muscle activation"` → 1 hit, the included IJERPH 2022 dip study.
- `"handstand push up muscle activation electromyography"` → 0 hits.
- Burst queries returned HTTP 429 (three retries with backoff); abandoned in favour of Crossref + Europe PMC.

### 1.5 Full-text / abstract verification

Every one of the 24 new references was read at abstract level before any magnitude was written (Europe PMC `resultType=core` or OpenAlex `abstract_inverted_index` reconstruction). No magnitude in `home-exercises.json` is inferred from a title. Where an abstract gave only a direction, the `magnitude` field says so ("greater", "highest", "lower") rather than inventing a number.

---

## 2. Existing references reused (15)

| Existing id | Used for |
|---|---|
| `caterisano2002` | bodyweight squat depth → gluteus maximus contribution |
| `bryanton2012` | squat depth → knee-extensor relative muscular effort |
| `escamilla2001` | partial depth → lower patellofemoral/tibiofemoral compression |
| `hao2026` | squat tempo RCT (barbell) |
| `korakakis2023` | tempo / hypertrophy guidance |
| `williams2021` | split squat vs hip thrust (gluteus maximus) |
| `fenwick2009` | inverted row vs bent-over and one-arm cable row |
| `kennedy2024` | glute bridge vs hip thrust (conflicting side) |
| `nunes2020` | single-leg calf raise foot rotation |
| `kassiano2023` | single-leg calf raise range of motion |
| `escamilla2010` | plank family vs roll-out/pike |
| `batista2024` | plank on unstable surfaces |
| `collings2026` | Copenhagen plank → adductor magnus force |
| `coratella2022`, `padovan2026` | vertical-press muscle pattern (pike push-up extrapolation) |

Reuse rule applied: an existing reference was reused whenever its DOI/title already covered the claim (e.g. `kennedy2024` already holds the bridge-vs-thrust comparison; `nunes2020`/`kassiano2023` already hold the unilateral calf-raise training data). No existing reference was duplicated into the new file. The fifteen reused ids are: `batista2024`, `bryanton2012`, `caterisano2002`, `collings2026`, `coratella2022`, `escamilla2001`, `escamilla2010`, `fenwick2009`, `hao2026`, `kassiano2023`, `kennedy2024`, `korakakis2023`, `nunes2020`, `padovan2026`, `williams2021`.

---

## 3. New references (24, all DOI-verified)

| id | DOI | Year | Journal | Evidence level |
|---|---|---|---|---|
| `cogley2005` | 10.1519/00124278-200508000-00024 | 2005 | J Strength Cond Res | EMG cohort |
| `gouvali2005` | 10.1519/00124278-200502000-00025 | 2005 | J Strength Cond Res | EMG cohort |
| `kikuchi2017` | 10.1016/j.jesf.2017.06.003 | 2017 | J Exerc Sci Fit | RCT |
| `calatayud2015` | 10.1519/jsc.0000000000000589 | 2015 | J Strength Cond Res | RCT |
| `vandentillaar2019` | 10.1055/a-1001-2526 | 2019 | Sports Med Int Open | EMG cohort |
| `intziegianni2026` | 10.3390/muscles5010018 | 2026 | Muscles | EMG cohort |
| `lin2026` | 10.1186/s13102-026-01582-3 | 2026 | BMC Sports Sci Med Rehabil | EMG cohort |
| `almosnino2013` | 10.1123/jab.29.1.33 | 2013 | J Appl Biomech | biomechanical |
| `hopkins2024` | 10.1016/j.jbiomech.2024.112391 | 2024 | J Biomech | biomechanical crossover |
| `drinkwater2012` | 10.1519/jsc.0b013e318248ad2e | 2012 | J Strength Cond Res | biomechanical crossover |
| `aygunpolat2025` | 10.1186/s13102-025-01306-z | 2025 | BMC Sports Sci Med Rehabil | EMG cohort |
| `topcu2025` | 10.1038/s41598-025-32203-7 | 2025 | Sci Rep | EMG cohort |
| `goulette2021` | 10.1016/j.ptsp.2020.12.001 | 2021 | Phys Ther Sport | biomechanical |
| `muyor2020` | 10.1371/journal.pone.0230841 | 2020 | PLOS One | EMG cohort |
| `mckenzie2022` | 10.3390/ijerph192013211 | 2022 | Int J Environ Res Public Health | EMG cohort |
| `hirose2021` | 10.52082/jssm.2021.275 | 2021 | J Sports Sci Med | EMG cohort |
| `keerasomboon2022` | 10.26603/001c.36627 | 2022 | Int J Sports Phys Ther | EMG cohort |
| `medeiros2021` | 10.1123/jsr.2019-0388 | 2021 | J Sport Rehabil | systematic review/meta-analysis |
| `garciajaen2026` | 10.1519/jsc.0000000000005684 | 2026 | J Strength Cond Res | EMG cohort |
| `mercer2009` | 10.2522/ptj.20080229 | 2009 | Phys Ther | EMG cohort |
| `simenz2012` | 10.1519/jsc.0b013e3182472fad | 2012 | J Strength Cond Res | EMG cohort |
| `kim2026` | 10.1080/09593985.2026.2714954 | 2026 | Physiother Theory Pract | EMG cohort |
| `fukunaga2022` | 10.26603/001c.33026 | 2022 | Int J Sports Phys Ther | EMG cohort |
| `atalay2025` | 10.3390/medicina61060986 | 2025 | Medicina | EMG cohort |

Every DOI above was resolved through `crossref_lookup.sh --doi` and the record's title/authors/year/journal were taken from Crossref, not retyped. Citation counts (`citedBy`) are Crossref `is-referenced-by-count` at the time of retrieval.

---

## 4. Per-exercise confidence

| Exercise | Confidence | Basis and caveat |
|---|---|---|
| `home-push-up` | **High** | Two independent hand-width EMG studies, a body-angle EMG study with a graded design, a bodyweight-load study, and two randomised training trials showing push-up ≈ bench press. Caveat: `intziegianni2026` normalised within-push-up, not to %MVIC. |
| `home-bodyweight-squat` | **Moderate** | Stance/foot-rotation data are genuinely bodyweight (`almosnino2013`); depth and tempo rest on barbell studies (`caterisano2002`, `bryanton2012`, `drinkwater2012`, `hao2026`). Direction is transferred, magnitude is not. |
| `home-bulgarian-split-squat` | **Moderate** | Three recent BSS-specific EMG studies (trunk position, suspension, rear-foot instability). No BSS-versus-back-squat trial was eligible; the only hit was a conference abstract and was excluded. |
| `home-reverse-lunge` | **Moderate** | One musculoskeletal-model study for forward vs backward loading (`goulette2021`) and one EMG study for lunge vs monopodal squat/step-up (`muyor2020`). No direct forward-vs-reverse *EMG* comparison located. |
| `home-glute-bridge` | **Moderate–low** | Two small male studies directly contradict each other on bridge vs hip thrust; recorded as a `shift` with both citations. Elevated-feet effect is single-source. No single-leg bridge EMG found. |
| `home-inverted-row` | **Moderate–low** | Single 7-participant study (`fenwick2009`), but it is the established comparison and doubles as the lumbar-load argument. No grip-width or doorway-row data. |
| `home-bench-dip` | **Low–moderate** | One study, 13 experienced males, raw mV rather than %MVIC; the only usable dip-kinematics dataset found. |
| `home-pike-push-up` | **Low (explicitly extrapolated)** | No pike or handstand push-up EMG exists in Crossref, Europe PMC or OpenAlex. Effects are labelled as extrapolated from a graded body-angle push-up study plus overhead-press EMG. Do not present magnitudes as measured. |
| `home-nordic-hamstring-curl` | **High** | Meta-analysis of 12 randomised trials plus two mechanistic EMG studies (knee angle, inclined board). |
| `home-single-leg-calf-raise` | **High** | Two randomised training studies that specifically used **unilateral** calf raises (foot rotation; range of motion). |
| `home-side-plank` | **Moderate** | One 15-participant, 10-variation EMG study for side plank/Copenhagen, plus a large meta-analysis for surface stability, plus the existing plank-vs-roll-out data. |
| `home-step-up` | **Moderate** | Three small studies (older adults; trained women at 6RM; active adults at 60% 5RM) covering direction and comparison with squat/lunge. |
| `home-band-pull-apart` | **Low–moderate** | Single 10-male study; the only real EMG evidence for elastic-band scapular work located. Hand-position and direction effects are within-subject. |
| `home-superman` | **Low** | One 22-participant observational study; the comparison set is small and the paper's primary aim was spinal alignment, not exercise selection. |

---

## 5. Evidence gaps (not claims)

1. **Pike push-up / wall handstand push-up** — zero EMG studies indexed. Requesting a direct trial is the single highest-value follow-up.
2. **Single-leg glute bridge** — 62–260 hits screened, no study compares single- versus double-leg bridge activation. Variation omitted rather than guessed.
3. **Hollow hold** — no EMG study of the hollow body hold located; omitted from the plank entry. The existing plank→roll-out/pike data cover the flexion-vs-anti-extension distinction instead.
4. **Walking lunge** — no EMG or joint-load study located; only forward/backward and lunge-vs-squat comparisons exist.
5. **Bodyweight-specific squat depth and tempo** — every depth/tempo trial found used a barbell. The app should describe depth effects as directionally transferable, not measured at bodyweight.
6. **Band/exercise-tube row** — no EMG study; only the band pull-apart qualifies under the "real EMG evidence" rule.
7. **Bench dip** — no %MVIC data; raw mV prevents comparison with other exercises.
8. **Bulgarian split squat vs back squat** — no full paper; a 2021 conference abstract (`10.70252/ciyt8956`, Int J Exerc Sci) was found and deliberately excluded.
9. **Seated vs standing calf raise (soleus vs gastrocnemius)** — still open. The heel-raise-test paper (`10.2519/jospt.2011.3489`) measures knee angle and repetitions, not activation, and was excluded on purpose.
10. **Bridge vs hip thrust** — unresolved contradiction between `kennedy2024` and `kim2026`; retained as a conflict rather than averaged.
11. **Sex/training-status moderation** — most new studies are small, male and resistance-trained (exceptions: `aygunpolat2025` female athletes, `kassiano2023` young women, `goulette2021` females).

---

## 6. Schema and integration notes

- `context: "home"` is present on all 14 exercises. `src/data/types.ts` does **not** declare a `context` field yet, so the app's TypeScript types will need it added before the field is read. No repo file was modified by this task.
- Muscle labels reuse the existing spellings (`quadriceps (vastus lateralis)`, `gluteus maximus`, `biceps femoris`, `erector spinae`, `serratus anterior`, `triceps brachii`, `anterior deltoid`, …) so the existing alias table resolves them.
- Mechanical-stress entries are named as joints/segments (`patellofemoral joint (reaction force and stress)`, `knee joint (flexion net joint moment)`, `hip joint (extensor net joint moment)`, `lumbar spine (load)`), never as muscles — same convention as the gym dataset.
- New categories introduced: `lunge` (reverse lunge, step-up). All other categories reuse existing values (`horizontal push`, `squat`, `hip extension`, `horizontal pull`, `elbow extension`, `vertical push`, `knee flexion`, `plantarflexion`, `core`).

---

## 7. Validation output

`python3 verify.py` (reads both deliverables plus the repo dataset):

```
JSON parse: OK (both files)
exercises=14  variations=46  effects=105
references: existing=90  new=24  combined=114
dangling referenceIds: 0 []
exercise-id collisions with existing dataset: 0
variation-id duplicates: 0
new refs whose DOI already exists in references.json: 0
new refs missing doi/title/year/authors: []
new refs with non-DOI identifiers: []
directions: {'increase': 59, 'decrease': 35, 'shift': 11}
context field: Counter({'home': 14})
exercise ids: home-push-up, home-bodyweight-squat, home-bulgarian-split-squat, home-reverse-lunge,
home-glute-bridge, home-inverted-row, home-bench-dip, home-pike-push-up, home-nordic-hamstring-curl,
home-single-leg-calf-raise, home-side-plank, home-step-up, home-band-pull-apart, home-superman
```

The repository's own `scripts/validate-mapping.mjs` was copied to `/tmp` and re-pointed at the new files (no repo edit). With `--strict` and the union of existing + new references it returns:

```
muscleBurn — deep-research mapping validation
------------------------------------------------
exercises:            14
variations:           46
effects:              105
references:           114 (114 resolvable links)
research muscle labels: 58
  mapped:             44
  non-muscle labels:  14
  unmapped:           0
Écorché muscle bases: 178
alias targets missing from atlas: 0
citation ids missing from references.json: 0

Unmapped muscle labels:
  (none)

OK
exit=0
```

That means: every muscle label resolves through `src/data/raw/muscle-map.json` to an Écorché structure name, and every effect reference resolves to a reference record.
