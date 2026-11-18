# How Resistance-Training Form Variations Shift Skeletal-Muscle Activation and Mechanical Stress

**An evidence map for major compound and isolation exercises**

Deep-research synthesis · workspace `~/Documents/deep-research/exercise-form-variations-and-skeletal-muscle-activation-an-e/`
Date: 17 November 2026 · 90 included sources · 22 exercises · 68 variations · 209 cited effects

---

## 1. Executive summary

This review maps two *different* quantities that are routinely conflated in training practice:

1. **Neuromuscular activation** — normalised surface EMG amplitude (%MVIC or %peak), which indexes how much electrical drive a muscle receives in a given task, under a given electrode placement and normalisation scheme.
2. **Mechanical stress** — joint moments, joint reaction forces, ligament tensile forces, spinal compression/shear, and finite-element stress. These are computed from kinematics, kinetics and musculoskeletal models, not from EMG.

The central finding is that **form variations usually redistribute stress more reliably than they change total muscle activation, and acute EMG differences frequently fail to predict longitudinal hypertrophy**. The cleanest example is the hip thrust versus squat: the hip thrust produces roughly twice the gluteus maximus EMG of the squat acutely, yet nine weeks of either exercise produced statistically similar gluteal hypertrophy, while the squat produced more quadriceps and adductor growth (Plotkin 2023, doi:10.3389/fphys.2023.1279170; Contreras 2015, doi:10.1123/jab.2014-0301). A second example is grip width in the lat pulldown: three widths produced essentially the same latissimus activation and only trivial differences in 6RM load (Andersen 2014, doi:10.1097/jsc.0000000000000232).

Several variations do have large, replicated, directionally consistent effects:

- **Squat depth** raises gluteus maximus contribution from 16.9% (partial) to 28.0% (parallel) to 35.4% (full) and raises knee-extensor relative muscular effort, while knee and patellofemoral forces rise monotonically with flexion (Caterisano 2002; Bryanton 2012; Escamilla 2001).
- **Bench inclination near 30°** reliably increases clavicular pectoralis activation, while flat bench favours the sternocostal head and inclinations above 45° shift demand to the anterior deltoid (Lauver 2016; Rodríguez-Ridao 2020; López-Vivancos 2023).
- **Training at long muscle lengths** (seated vs prone leg curl, overhead vs neutral triceps extension, initial-ROM biceps and calf work, leg extension with less hip flexion) produces larger hypertrophy of the lengthened muscles — often despite *lower* absolute loads (Maeo 2021; Maeo 2023; Kassiano 2023; Pedrosa 2023; Larsen 2025).
- **Bar position in the squat** and **front vs behind-neck pressing** reliably shift demand between hip/posterior-chain and knee/pectoral structures, with very large standardised differences in the latter (Murawa 2020; Larsen 2021; Coratella 2022).
- **Wide-grip pull-ups and wide-grip bench presses increase shoulder joint moments**, which is a stress cost rather than a hypertrophy benefit (Pouly 2026; Larsen 2020; Noteboom 2024).

Practical translation: choose variations to **bias a target muscle or to manage a joint**, not because an acute EMG trace looks larger. Where the literature reports both acute EMG and longitudinal hypertrophy, the hypertrophy outcome should dominate exercise selection.

---

## 2. Methods

### 2.1 Scope and sub-questions

Nine sub-questions covering squat, hinge, horizontal push, vertical push, horizontal pull, vertical pull, elbow flexion/extension, lower-body isolation/hip extension, and trunk/core, plus a construct-validity question (how EMG relates to stress and growth). Each sub-question had to close with at least two Tier-1 databases contributing.

### 2.2 Tiered search

| Tier | Source | Role | Date |
|---|---|---|---|
| 1 | OpenAlex REST (9 bulk queries × 50 records) | discovery, citation graph, OA locations | 2026-11-17 |
| 1 | Europe PMC / PubMed REST (18 queries × 25 records) | biomedical abstracts, PMIDs | 2026-11-17 |
| 1 | Crossref (`crossref_lookup.sh`, DOI + bibliographic) | authoritative metadata, citation counts | 2026-11-17 |
| 1 | Semantic Scholar (`s2_lookup.sh`) | influential-citation ranking; rate-limited (HTTP 429) on parallel bursts, retried | 2026-11-17 |
| 1 | Scopus (`scopus_lookup.sh`) | attempted; key present but wrapper returned 429/thin views | 2026-11-17 |
| 1 | arXiv | scoping query only; no relevant biomechanics preprints | 2026-11-17 |
| 2 | ASU Library (`asu_status` → `asu_fulltext`) | paywalled full-text abstracts (Ovid/LWW) | 2026-11-17 |
| 2 | LibKey | keyless only (`LIBKEY_KEY` unset); retraction gating degraded | 2026-11-17 |
| 3 | Firecrawl / web | one grey-literature pass; not used for any included claim | 2026-11-17 |

**ASU Library access.** `asu_status` returned `bridgeConnected:true`, `signedIn:true`, `proxyAccess:false`. `asu_fulltext` with the DOI resolved Ovid/LWW records for five paywalled papers and returned their full abstracts (Escamilla 2001 MSSE; Barnett 1995 JSCR; Caterisano 2002 JSCR; Lehman 2005 JSCR; Signorile 2002 JSCR). Escamilla 2010 (JOSPT) resolved only to a catalogue record with "No Online Access"; its abstract was recovered from OpenAlex metadata and is labelled accordingly. No PDFs were written to disk.

**Retraction check.** With `LIBKEY_KEY` unset, LibKey retraction gating is degraded. Crossref and OpenAlex metadata for all 90 included DOIs were checked; no retraction or expression-of-concern notice was found. This is a limitation, not a guarantee.

### 2.3 PRISMA-style counts

| Stage | Count |
|---|---|
| Records identified (OpenAlex 450 + Europe PMC 450 + title/DOI checks 126) | **1,026** |
| Duplicates removed → unique DOIs | **683** |
| Title/abstract screened | 683 |
| Full-text/abstract assessed for eligibility | 148 |
| Excluded (not exercise-form comparison, no activation/stress outcome, non-human, conference abstract without data, or inaccessible) | 58 |
| **Included in evidence map** | **90** |
| Included and cited in `exercises.json` effects | 88 |
| Included but background/methods only | 2 |

Seed recall test: all five pre-registered seeds surfaced in Tier-1 sweeps (Escamilla 2001, Barnett 1995, Contreras 2015, Lehman 2005, Schoenfeld 2010). Database triangulation: every sub-question had ≥2 of OpenAlex / Europe PMC / Crossref, with ASU full text adding magnitudes for five classic paywalled studies.

### 2.4 Evidence grading used below

| Label | Meaning |
|---|---|
| **SR/MA** | systematic review or meta-analysis |
| **RCT** | randomised longitudinal training study, usually within-participant |
| **EMG cohort** | cross-sectional surface-EMG comparison |
| **Biomech** | kinematics/kinetics, musculoskeletal model, finite-element or cadaveric study |
| **Review** | narrative review |

Confidence tags: **(2+ independent)**, **(single)**, **(conflicting)**. A claim is only called established when two independent research groups support it.

### 2.5 What EMG can and cannot tell you

Surface EMG amplitude is a function of motor-unit recruitment, firing rate, fibre-type distribution, subcutaneous fat, electrode placement, cross-talk and normalisation reference. The CEDE consensus matrix lists six normalisation approaches with different interpretations and warns that comparisons across studies are only valid when the reference is comparable (Besomi 2020, doi:10.1016/j.jelekin.2020.102438). Two further constraints matter for this review:

- **Amplitude does not index motor-unit recruitment** (Vigotsky 2016, doi:10.1007/s00421-015-3314-6).
- **Acute EMG amplitude is not a validated predictor of hypertrophy** (Vigotsky 2022, doi:10.1007/s40279-021-01619-2). The direct counter-example is hip thrust vs squat (Plotkin 2023).

Conversely, **regional** activation measured by T2-weighted MRI does track regional hypertrophy (Wakahara 2012, doi:10.1007/s00421-011-2121-y), and long-length training effects replicate across muscles and studies — so *where along a muscle* and *at what length* it is loaded carries more predictive weight than a single whole-muscle EMG number.

For these reasons every effect entry in `exercises.json` records the construct in the `muscle` or `note` field; mechanical-stress entries are explicitly named as joints, ligaments or spinal segments, never as muscles.

---
## 3. Findings by exercise

### 3.1 Barbell back squat

**Depth.** Depth is the most reliable way to change the *distribution* of demand. In ten experienced lifters, gluteus maximus contributed 16.9% of the four-muscle EMG total at partial depth, 28.0% at parallel and 35.4% at full depth (p<0.001), while vastus medialis, vastus lateralis and biceps femoris contributions did not change (Caterisano 2002, doi:10.1519/00124278-200208000-00014). **(single, but classic and frequently replicated directionally)** A biomechanical study using relative muscular effort — joint moment divided by angle-matched maximal torque — showed that knee-extensor effort rises with depth but not with load, ankle plantar-flexor effort rises with load but not depth, and hip-extensor effort rises with both (Bryanton 2012, doi:10.1519/jsc.0b013e31826791a7). A 2026 EMG study across 50°, 90° and 130° knee flexion confirmed that depth most consistently increased quadriceps and erector spinae activation, with only limited modulation of gluteus maximus (Park 2026, doi:10.3390/medicina62071339). **(2+ independent for the quadriceps/erector-spine direction; gluteus maximus findings are less consistent across studies)**

Mechanically, deeper squatting costs more at the knee. Escamilla's three-dimensional analysis found that tibiofemoral compression, posterior-cruciate tensile force and patellofemoral compression all increased with knee flexion, and recommended training within roughly 0–50° when the goal is to minimise knee forces (Escamilla 2001, doi:10.1097/00005768-200109000-00020). **(single, biomech)** The practical implication is a genuine trade-off: full depth is the better quadriceps and glute stimulus, but it is also the higher patellofemoral and PCL load.

**Stance width.** Wider stance increased peak and cumulative vastus medialis activation (p<0.015) in 18 lifters, and narrow stance produced 3.7° more peak knee flexion and 8.2° less hip abduction (Lee 2026, doi:10.1371/journal.pone.0354893). **(single)** In the same study, load mattered more than stance for vastus lateralis and semitendinosus. Escamilla found that wide stance generated greater tibiofemoral and patellofemoral compression and greater PCL tensile force than narrow stance in the squat — but the opposite pattern in the leg press (Escamilla 2001). **(single, biomech)** This exercise-specific reversal is a useful warning: a stance cue cannot be transferred from a machine to a barbell without re-testing.

**Bar position.** Low-bar squats produced higher eccentric-phase EMG than high-bar squats for every recorded muscle at 60% and 65% 1RM in twelve powerlifters (Murawa 2020, doi:10.7717/peerj.9256). **(single)** A separate 2026 study found low-bar increased hamstring and erector spinae activation in specific phase/depth comparisons, while high-bar increased rectus femoris at selected depths (Park 2026). **(single)** The kinetic explanation is clearer than the EMG: low-bar wide stance produced the largest hip contribution to total joint moment, whereas high-bar narrow stance produced the largest knee contribution together with higher vastus lateralis and lower gluteus maximus myoelectric activity (Larsen 2021, doi:10.3389/fspor.2021.719013). **(single, but mechanically coherent with the EMG literature)** A systematic review of 30 studies concluded that knee-extensor activation predominates in all squat variants, low-bar increases hip-extensor demand, front and high-bar squats produce similar patterns, and guided/Smith squats produce the least activation (Gené-Morales 2020, doi:10.14198/jhse.2020.15.proc4.28). **(SR)**

**Heel elevation.** Graded heel lifts (0–5 cm) reduced peak ankle dorsiflexion and trunk forward lean while increasing peak knee flexion, hip flexion and tibial progression; peak knee moment increased (p<0.001), ankle and hip moments were unchanged, and finite-element peak von Mises stress in L3–L5 *decreased*, most at L4 (Cai 2026, doi:10.1519/jsc.0000000000005639). **(single, biomech)** A meta-analysis of 15 studies (n=269) found posterior wedges increased overall thigh activity and vastus medialis activity, while anterior wedges increased rectus femoris activity (Ghasemi 2024, doi:10.3390/app14052091). **(SR/MA)** Forefoot elevation, by contrast, reduced quadriceps activation relative to flat-heel or heel-elevated squats (Bozkurt 2026, doi:10.3389/fphys.2025.1727141). **(single)** Heel elevation therefore buys a more upright, deeper squat with lower lumbar stress at the cost of higher knee extensor demand.

**Tempo and the bounce.** A ballistic bounce out of the bottom is not a free lunch. In ten lifters across 0–100% body mass, bouncing increased net joint moments at the hip (+38%), knee (+50%) and ankle (+21.3%), and increased the lumbar extension moment by 182%; concentric EMG shifted posteriorly (biceps femoris +40%, gluteus maximus +37%, gluteus medius +28%) with no change in quadriceps activation (Achermann 2026, doi:10.1519/jsc.0000000000005621). **(single, biomech)** For controlled tempo, an 8-week RCT found no significant between-group difference in maximal squat strength across 4/0/X/0, 2/0/X/0 and self-selected tempos, with the 2/0/X/0 group showing the most favourable strength and jump trend (Hao 2026, doi:10.1371/journal.pone.0354725). **(RCT)** A narrative review recommends 2–8 s per repetition for hypertrophy but notes that direct evidence for tempo manipulation is limited (Androulakis Korakakis 2023, doi:10.3390/jfmk9010009). **(Review)**

### 3.2 Front squat

Front squat and high-bar back squat produced similar lower-limb activation patterns across a 30-study systematic review, with the front squat increasing lumbar lordosis without changing lower-limb or trunk muscle activity at equal absolute load (Gené-Morales 2020, doi:10.14198/jhse.2020.15.proc4.28). **(SR, single for the lordosis claim)** The front squat is therefore best treated as a *posture* variation — more upright trunk, anterior bar — rather than a fundamentally different quadriceps stimulus.

### 3.3 Conventional deadlift

**Sumo versus conventional.** These are mechanically different exercises, not two ways of doing the same one. In a three-dimensional analysis of national-level lifters, sumo used a 70 ± 11 cm stance versus 32 ± 8 cm, 42 ± 8° versus 14 ± 6° foot turnout, and a 47 ± 4 cm versus 55 ± 10 cm grip; vertical bar distance, mechanical work and predicted energy expenditure were 25–40% greater in conventional. Sumo generated hip-extensor, knee-extensor and ankle-dorsiflexor moments, while conventional added knee-flexor and ankle-plantarflexor moments. Hip moments themselves did not differ significantly; ankle and knee moments did (Escamilla 2000, doi:10.1097/00005768-200007000-00013). **(single, biomech, but a landmark study)**

A 2025 study of 30 experienced lifters at 85% 1RM found greater biceps femoris activation in conventional in both phases, greater vastus lateralis activation in sumo in phase 1, higher hip extension moments in conventional, and greater frontal/transverse hip and knee moments in sumo (Hanen 2025, doi:10.3389/fbioe.2025.1597209). **(single)** In strength-trained women, conventional and sumo produced larger hip moments near lockout, whereas hex-bar produced greater knee moments, faster bar velocity and more hip/knee flexion (Gundersen 2025, doi:10.1519/jsc.0000000000005011). **(single)** An EMG-assisted musculoskeletal model ranked both conventional and sumo deadlift tier 1 for adductor magnus (ischiocondylar) and gracilis force, alongside the Copenhagen adduction exercise (Collings 2026, doi:10.1249/mss.0000000000004002). **(single, model-based)**

**Hex bar.** The hex bar allows a heavier 1RM (265 ± 41 vs 245 ± 39 kg), lowers peak moments at the lumbar spine, hip and ankle, raises the peak knee moment, and increases peak power (4,872 ± 636 vs 4,388 ± 713 W) relative to a straight bar (Swinton 2011, doi:10.1519/jsc.0b013e3181e73f87). **(single, biomech)** This is the clearest "joint-friendly hinge" substitution in the dataset.

**Grip.** Mixed grip produced the lowest brachioradialis and flexor carpi ulnaris activation (ES 0.64–0.68) and was rated the easiest grip at every load; double-overhand or hook grip maximised forearm activation and were recommended when grip strength is a goal (Pratt 2020, doi:10.1016/j.jelekin.2020.102428). **(single)** Mixed grip is therefore a performance aid, not a forearm builder.

**Set-up.** Placing the bar close to the shins (over the navicular) increased posterior-chain EMG (hamstrings, erector spinae) and decreased quadriceps EMG relative to a far-bar set-up, with no difference in lumbar shear or compression (Edington 2018, doi:10.3390/sports6030090). **(single)** Lifters can choose either set-up without a spinal-loading penalty.

**What is missing.** No eligible EMG or biomechanical study of **deficit or block pulls** was located in the Tier-1 sweeps; the common claim that deficits increase range of motion and quadriceps demand is mechanically plausible but remains uncited here. It is recorded as a gap, not asserted.

### 3.4 Romanian deadlift

At 70% RDL 1RM, conventional deadlift produced more rectus femoris (58.57 ± 13.73 vs 25.26 ± 14.21 %peak) and slightly more gluteus maximus (51.52 ± 6.08 vs 46.88 ± 7.39 %peak) EMG, and greater knee and ankle net joint torques (Lee 2018, doi:10.1016/j.jesf.2018.08.001). **(single)** A systematic review of deadlift variants found that erector spinae and quadriceps are more activated than gluteus maximus and biceps femoris overall, but that the RDL reverses this for the erector spinae relative to the hamstrings (Martín-Fuentes 2020, doi:10.1371/journal.pone.0229507). **(SR)** In the RDL specifically, wide stance increased gluteus maximus EMG and narrow stance increased multifidus, with no difference in vastus lateralis or biceps femoris (Koderi 2020, doi:10.1088/1742-6596/1529/2/022026). **(single, conference proceedings)**

### 3.5 Barbell bench press

**Grip width.** The direction is consistent across four independent studies even though magnitudes are modest:

- Moving from wide to narrow increased triceps activity and decreased sternocostal pectoralis activity; a supinated grip abolished the sternocostal decrease and increased biceps and clavicular pectoralis activity (Lehman 2005, doi:10.1519/00124278-200508000-00017). **(single, classic)**
- In 28 men, biceps activity increased with grip width, wide grip lowered triceps activation relative to medium and narrow, and narrow grip reduced 6RM load (Saeterbakken 2021, doi:10.3390/ijerph18126444). **(single)**
- Wide and medium grips produced greater horizontal shoulder moments than narrow in the sticking region; wide grip generated 13.1–15.7% laterally directed barbell force (Larsen 2020, doi:10.3389/fspor.2020.637066). **(single, biomech)**
- A musculoskeletal shoulder model found narrower grips reduced glenohumeral posterior shear and rotator-cuff activity, which the authors suggest may lower instability and cuff-injury risk; wider grips increased those loads (Noteboom 2024, doi:10.3389/fphys.2024.1393235). **(single, model-based)**

Grip width is therefore a **stress-management variable** first and a muscle-targeting variable second: the EMG differences are small, the shoulder-moment differences are not.

**Bench angle.** The incline story is one of the best-replicated findings in the dataset. Upper pectoralis EMG was 122.5 ± 10.1% MVIC at 30° and 124 ± 9.1% at 45° versus 98.2 ± 5.4% at 0°, measured in the 26–50% window of the concentric phase; lower pectoralis was lower at 45° (71.9 vs 100.1% MVIC) (Lauver 2016, doi:10.1080/17461391.2015.1022605). **(single, but see next)** A separate study of five angles found peak upper-pectoral EMG at 30°, peak middle and lower pectoral EMG at 0°, peak anterior deltoid EMG at 60°, and similar triceps across angles (Rodríguez-Ridao 2020, doi:10.3390/ijerph17197339). **(single)** A meta-analysis of 23 studies found flat bench activated the sternal pectoralis significantly more than incline (SMD 1.80, 95% CI 0.40–3.19) (López-Vivancos 2023, doi:10.3390/app13085203). **(SR/MA)** High-density EMG shows the mechanism is regional: the excitation barycentre shifts cranially toward the clavicular head at 45° without a change in the number of active channels (Cabral 2022, doi:10.1111/sms.14082). **(single, HD-EMG)**

Incline also changes the supporting cast: triceps activation was 58.5–62.6% lower and biceps 48.3–68.7% higher on incline than flat or decline, while 6RM load was 18.5–21.5% lower (Saeterbakken 2017, doi:10.1515/hukin-2017-0047). **(single)**

**Decline.** The evidence conflicts. Barnett's classic study found the sternocostal head was *more* active on a horizontal bench than a decline bench (Barnett 1995, doi:10.1519/00124278-199511000-00003), whereas the 2023 meta-analysis states that the declined variant produced greater sternal activation (López-Vivancos 2023). The contradiction is retained rather than resolved; decline should not be sold as an established sternal-head builder. **(conflicting)**

**Arch and foot placement.** Arched-back benching raised 1RM by 4.2 kg (95% CI 0.0–8.4; ES 0.22) and reduced barbell displacement, with similar pectoralis excitation and a non-significant trend to higher triceps activation (Bartolomei 2024, doi:10.1519/jsc.0000000000004778). **(single)** Lifting the feet with active hip flexion increased rectus abdominis, external oblique and rectus femoris activation, reflecting a greater trunk-stabilisation demand rather than a better chest stimulus (Muyor 2019, doi:10.1371/journal.pone.0218209). **(single)**

**Range of motion.** Partial bench ROM is not simply "less work". Both upper-half and lower-half ROM produced greater pectoralis and anterior deltoid mean excitation than full ROM, and upper-half ROM produced the highest triceps mean excitation and the highest peak EMG in the long and lateral triceps heads (Fischer 2025, doi:10.1038/s41598-025-98354-9). **(single)** This is an acute EMG result and should not be read as a hypertrophy recommendation; the ROM meta-analysis in §4.2 found full ROM superior for strength and lower-limb hypertrophy. **(conflicting constructs, not conflicting data)**

**Close-grip bench.** A grip at 95% biacromial distance reduced the load lifted but increased peak power and velocity and lengthened the pre-sticking region (Lockie 2017, doi:10.3390/sports5030046). **(single, biomech)** It is a power/triceps variation, not a chest-building variation.

### 3.6 Incline bench press

Covered under §3.5. The practical synthesis is: **0° for sternocostal pectoralis, 30° for clavicular pectoralis, ≥45–60° for anterior deltoid, and expect triceps to contribute less as incline rises.** Triceps medial head activation is similar across angles, so the triceps deficit on incline is modest in absolute terms (Rodríguez-Ridao 2020). **(2+ independent for the 30°/clavicular and 60°/deltoid directions)**

### 3.7 Overhead press

**Front versus behind the neck.** Behind-neck pressing produced very large increases in medial deltoid (ES 3.68 ascending, 4.56 descending), posterior deltoid (ES 9.00, 8.65) and — in the descending phase — anterior deltoid (ES 7.66) excitation relative to front pressing, while front pressing produced greater pectoralis excitation (ES 3.11, 4.20) (Coratella 2022, doi:10.3389/fphys.2022.825880). **(single, but very large effects)** A 2026 high-density EMG replication found front press greater anterior deltoid (ES 1.00–1.03) and pectoralis (ES 0.70–0.74), and behind-neck greater posterior deltoid (ES 1.11), upper trapezius (ES 0.72) and triceps (ES 2.01) in the descending phase (Padovan 2026, doi:10.5114/jhk/205466). **(2+ independent for the front-pectoralis / back-posterior-deltoid split; the anterior deltoid direction is phase-dependent)**

**Barbell versus machine.** Barbell pressing excited the shoulder muscles more than a guided shoulder-press machine, consistent with a greater stabilisation demand (Coratella 2022). **(single)**

**Dumbbell versus kettlebell.** At matched loads (6 kg and 70% 1RM) there were no significant differences, although kettlebells trended higher for all muscles except upper trapezius (Błażkiewicz 2022, doi:10.3390/s22249762). **(single, preliminary)**

**What is missing.** No eligible study directly compared **seated versus standing** overhead press, or **grip width** in the overhead press, in the Tier-1 sweeps. Both are recorded as gaps. The front/back and barbell/machine contrasts are the only well-evidenced OHP variations in this map.

---
### 3.8 Barbell bent-over row

**Torso angle.** The best available comparison is Fenwick's three-row study. The inverted row (more upright torso) elicited the highest latissimus dorsi, upper-back and hip-extensor activation and the lowest lumbar spine load. The standing bent-over row produced large, symmetrical activation from upper to lower back but the **largest lumbar spine load** and the highest spinal stiffness. The one-arm cable row challenged torsional trunk capacity (Fenwick 2009, doi:10.1519/jsc.0b013e3181b07334). **(single, but directly addresses the torso-angle question)** The trade-off is explicit: more upright torso → more lat/upper-back activation per unit of spinal load; more bent-over → more paraspinal demand and more spinal compression.

**Grip width and orientation.** In the incline prone row, narrow grips produced higher estimated 1RM (p<0.001), grip angle had no effect on strength (p=0.154), and forearm angle produced significant main effects on middle trapezius, latissimus, middle deltoid, posterior deltoid, brachioradialis, triceps and biceps (p=0.006–0.049) (Fusco 2026, doi:10.2478/bhk-2026-0028). **(single)** Grip width influenced middle trapezius (p=0.044) and biceps (p=0.001). The practical point is that *forearm rotation* changes which muscles contribute more than *width* changes total pulling strength.

**Range of motion.** Upper-half ROM increased latissimus mean excitation relative to lower-half (d=−0.59) and full ROM (d=−0.58), while lower-half ROM increased trapezius peak excitation (d=0.42–0.54); posterior deltoid and biceps did not differ (Fischer 2025b, doi:10.1016/j.jelekin.2025.103025). **(single)** The authors describe the overall effect as medium and inconsistent, so ROM is a weak lever in rowing compared with torso angle.

### 3.9 Pull-up and chin-up

**Supinated versus pronated.** In 25 participants, latissimus averaged 117–130% MVIC across pull-up variants, biceps 78–96%, infraspinatus 71–79%, lower trapezius 45–56% and pectoralis 44–57%. Chin-ups produced significantly higher biceps and pectoralis activation, while pull-ups produced significantly higher lower-trapezius activation (Youdas 2010, doi:10.1519/jsc.0b013e3181f1598c). **(single, but the largest pull-up EMG dataset located)** The latissimus is already near or above MVIC in all variants, which is why grip changes redistribute rather than multiply the stimulus.

**Grip width and rotation.** Wide grip (50% metacarpal span) with a 30° grip angle increased pectoralis (+14% MVIC) and rectus abdominis (+15% MVIC) activation, while a 0° angle increased infraspinatus, lower trapezius and latissimus activation by up to 60% MVIC; wide grip also increased the shoulder net joint moment by 7% (Pouly 2026, doi:10.1080/14763141.2026.2743113). **(single, biomech + EMG)** This is the clearest example of a variation that buys a small activation change at a real joint-stress cost.

### 3.10 Lat pulldown

**Grip width.** Three pronated widths (1.0, 1.5, 2.0× biacromial) produced similar latissimus, trapezius and infraspinatus activation; only biceps differed (medium > narrow in the concentric phase, p=0.03), and narrow/medium allowed ~3 kg more 6RM load than wide (80.3/80.0 vs 77.3 kg; p=0.02) (Andersen 2014, doi:10.1097/jsc.0000000000000232). **(single, but a well-controlled null)** A seven-variant study of 40 trained men likewise found no significant difference in latissimus activation across grip type, width or trunk inclination (Buonsenso 2025, doi:10.3390/jfmk10030345). **(2+ independent for the null on latissimus)** The persistent gym belief that wide grip isolates the lats is not supported.

**Hand position and bar path.** Wide anterior grip produced greater latissimus activity than wide posterior, supinated or close grip in both phases (Signorile 2002, doi:10.1519/00124278-200211000-00008). **(single, classic)** With high-density EMG, front pulldown produced greater descending-phase latissimus (ES 0.97) and pectoralis (ES 1.17) excitation, while behind-neck produced greater ascending-phase latissimus (ES 0.63); front pulldown also produced greater ascending posterior deltoid (ES 1.77) (Padovan 2024b, doi:10.5114/jhk/185211). **(single)** The phase dependence explains why simple "front vs back" claims disagree across studies.

**Trunk lean.** A 30° back-lean with a wide pronated grip increased posterior deltoid activation relative to upright wide pronated (p=0.011) and wide neutral (p=0.017), with no effect on latissimus (Buonsenso 2025). **(single)** Leaning back is a posterior-deltoid and torso-position variable, not a lat variable.

### 3.11 Biceps curl

**Shoulder position (muscle length).** This is the strongest longitudinal evidence in the elbow-flexor literature. Twelve weeks of incline (shoulder-extended, long-length) versus preacher (shoulder-flexed, short-length) dumbbell curls in 21 untrained adults produced greater biceps brachii growth with incline (+22.1% vs +18.9%, g=0.33), but greater brachialis (+17.1% vs +21.1%, g=0.50) and brachioradialis (+13.5% vs +17.6%, g=0.47) growth with preacher; total elbow-flexor growth did not differ (+17.6% vs +19.2%, p=0.134) (Kobayashi 2026, doi:10.1080/02640414.2026.2741751). **(RCT)** The correct interpretation is **exercise-specific redistribution**, not "incline curls grow more biceps overall".

**Range of motion.** Training the initial (long-length) range produced greater distal biceps CSA at 70% of muscle length and greater full-ROM 1RM than training the final range in 19 women over 8 weeks (Pedrosa 2023, doi:10.3390/sports11020039). **(RCT)** A 5-week study found greater strength and biceps/brachialis thickness with 0–50° than 80–130° elbow angles (reported advantage 8.9 ± 3.9% vs 3.4 ± 2.7%) (Sato 2021, doi:10.3389/fphys.2021.734509). **(RCT)** In trained individuals, initial partial ROM retained a small advantage at 70% length (SMD 0.10, BF 4.87) while full ROM had small strength advantages (MVC at 100° SMD 0.24; 1RM SMD 0.17) (Havers 2025, doi:10.1002/ejsc.70087). **(RCT)** Three independent trials therefore agree that long-length partials favour regional biceps growth, while full ROM favours strength. **(2+ independent)**

**Shoulder extension angle in cable curls.** When resistance profile, elbow ROM and effort were matched, peak shoulder extension versus neutral shoulder produced similar elbow-flexor hypertrophy (~7–9%; Bayes factors anecdotal-to-moderate for the null) (Larsen 2026, doi:10.3389/fphys.2026.1750722). **(RCT)** This is an important negative result: it is the *resistance profile at long length* that matters, not shoulder angle per se — consistent with the "external torque at long length" principle (Pedrosa 2026, doi:10.1055/a-2733-7605).

**Grip.** Brachioradialis activation exceeded biceps brachii during the eccentric phase in supinated and semi-supinated barbell curls, while concentric and combined phases were similar between muscles (Uysal 2026, doi:10.1186/s13102-026-01867-7). **(single)** Supinated grip increased biceps and clavicular pectoralis activity in an isometric bench-hold model (Lehman 2005). **(single, different task)**

### 3.12 Triceps pushdown and overhead extension

**Arm position is the dominant variable.** Twelve weeks of cable elbow extension with one arm overhead (shoulder flexed, long triceps length) and the other neutral produced greater long-head growth overhead (+28.5% vs +19.6%, d=0.61), greater lateral+medial head growth (+14.6% vs +10.5%, d=0.39) and greater whole-triceps growth (+19.9% vs +13.9%, d=0.54) — despite 34–39% *lower* absolute loads overhead (Maeo 2023, doi:10.1080/17461391.2022.2100279). **(RCT, within-participant, MRI)** This is the strongest single demonstration that load magnitude is not the only driver of hypertrophy.

**Regional activation.** T2-weighted MRI showed that the proportion of activated triceps area after one session was lower in the distal region, and the 12-week cross-sectional-area gain was correspondingly smaller distally (Wakahara 2012, doi:10.1007/s00421-011-2121-y). **(RCT)** Regional activation predicted regional growth, which is the strongest available bridge between acute mapping and chronic adaptation.

**Pushdown versus close-grip bench.** No head-specific EMG comparison of pushdown versus close-grip bench was located. The close-grip bench is a legitimate triceps compound — a 95% biacromial grip reduced load but increased peak power and velocity (Lockie 2017) — but it cannot be ranked against pushdowns on current evidence.

### 3.13 Leg press

**Foot placement.** High versus low foot placement produced no difference in knee forces, and both leg-press variants produced lower quadriceps and hamstring activity and lower knee forces than the free-weight squat (Escamilla 2001). **(single, biomech)** This is a clean null: the popular "high feet for glutes, low feet for quads" cue is not supported by the only direct comparison in this dataset.

**Stance.** In the leg press, narrow stance produced greater tibiofemoral and patellofemoral compression than wide — the reverse of the squat pattern — while wide stance increased hamstring activity (Escamilla 2001). **(single)** Exercise-specific reversal again.

**Leg press versus knee extension.** In a 12-week within-participant RCT with MRI of 17 individual muscles, leg press grew gluteus maximus (+15.4%) and adductor magnus (+6.2%) but not rectus femoris (+1.1%), whereas knee extension grew rectus femoris (+13.2%) but not the gluteals or adductors; vasti growth (+4.4–6.2% vs +5.0–7.2%) and whole-quadriceps growth (+4.9% vs +7.1%) were comparable (Kinoshita 2026, doi:10.1249/mss.0000000000003957). **(RCT)** Leg press is the more time-efficient exercise for total lower-body mass; knee extension is necessary for rectus femoris.

### 3.14 Leg extension

**Hip angle.** Ten weeks of leg extension at 40° versus 90° hip flexion in 22 untrained men produced greater rectus femoris hypertrophy at 40° (BF>100, "extreme" evidence) with no difference in vastus lateralis (BF=0.07, "strong" evidence for the null) (Larsen 2025b, doi:10.1080/02640414.2024.2444713). **(RCT)** Because rectus femoris is biarticular, a more extended hip puts it at longer length; the monoarticular vastus is unaffected. This is a clean confirmation of the length principle.

**Versus leg press.** As above, knee extension is the superior rectus femoris stimulus (Kinoshita 2026). **(RCT)**

### 3.15 Leg curl

**Seated versus prone.** Twelve weeks of seated (hip-flexed, long-length) versus prone (short-length) leg curls in 20 adults produced greater whole-hamstring growth seated (+14% vs +9%), with biarticular hamstring gains of +8–24% versus +4–19% and no difference in the monoarticular short head (+10% vs +9%) (Maeo 2021, doi:10.1249/mss.0000000000002523). **(RCT, MRI)** Both conditions similarly reduced susceptibility to eccentric muscle damage. **(2+ independent for the long-length principle; this is the hamstring-specific demonstration)**

**Hip flexion angle and regional activation.** In nine bodybuilders, semitendinosus was preferentially activated over biceps femoris and semimembranosus across 0°, 40° and 80° hip flexion, and activation was region-specific and longitudinally compartmentalised; subjective contraction sensation was dissociated from objective T2 activation (Mitsuya 2026, doi:10.1186/s13102-026-01910-7). **(single)** Perceived squeeze is not a reliable guide to which hamstring region is working.

### 3.16 Hip thrust

**Versus squat.** The acute EMG difference is large and consistent: hip thrust produced roughly double the gluteus maximus activation of the squat (upper mean 69.5% vs 29.4%, peak 172% vs 84.9%; lower mean 86.8% vs 45.4%, peak 216% vs 130%) and more than double the biceps femoris activation, with no difference in vastus lateralis (Contreras 2015, doi:10.1123/jab.2014-0301). **(single)** In male team-sport athletes, peak gluteus maximus EMG was higher in the hip thrust than the back squat (95% CI 4–56% MVIC) and split squat (6–58% MVIC), even though ground reaction force was lower (Williams 2021, doi:10.1519/jsc.0000000000002651). **(single)**

**But hypertrophy does not follow EMG.** Nine weeks of volume-matched squat versus hip thrust training produced **similar gluteal hypertrophy** at lower, mid and upper gluteal sites, while the squat produced greater quadriceps (+3.6 cm²; 95% CI 0.7–6.4) and adductor (+2.5 cm²; 95% CI 1.2–3.9) growth (Plotkin 2023, doi:10.3389/fphys.2023.1279170). **(RCT, MRI)** The authors explicitly note that gluteal sEMG was higher in the thrust but "did not consistently predict gluteal hypertrophy outcomes". This single trial is the strongest argument in the dataset against programming by EMG amplitude.

**Versus glute bridge.** The floor glute bridge produced greater upper and lower gluteus maximus peak and mean activity and greater gluteus medius mean activity than the hip thrust, while the hip thrust produced greater vastus lateralis activity (Kennedy 2024, doi:10.1080/14763141.2022.2074875). **(single)** This contradicts the common assumption that greater hip ROM (thrust) means more glute work.

**Programming.** A meta-analysis of 12 studies found a moderate pooled effect of resistance training on gluteus maximus hypertrophy (SMD 0.71, 95% CI 0.50–0.91) and recommended prioritising single-joint hip extension such as the hip thrust when gluteus maximus is the target (Krause Neto 2025, doi:10.3389/fphys.2025.1542334). **(SR/MA)** This is a hypertrophy-based recommendation and is compatible with the Plotkin null because both exercises grow the glutes; the hip thrust simply adds less quadriceps and adductor growth.

### 3.17 Lateral raise

**Dumbbell versus cable.** Eight weeks of within-participant dumbbell versus cable lateral raises in 24 trained participants produced similar lateral deltoid hypertrophy (3.3–4.6% overall), with moderate-to-extreme Bayes factors supporting the null (Larsen 2025, doi:10.3389/fphys.2025.1611468). **(RCT)** Implement choice is not a meaningful hypertrophy variable here.

**Technique.** A systematic review of 33 studies found that lateral raises with internal rotation produced the greatest middle-deltoid activation, inclined dumbbell fly the greatest anterior-deltoid activation, and pull-ups the greatest posterior-deltoid activation (Rabello 2024, doi:10.1016/j.jbmt.2022.12.002). **(SR)** In a direct comparison, lateral raise produced 30.3% MVIC middle deltoid and 24% MVIC posterior deltoid, versus 5% and 3.5% for bench press and 3.4% and 2.5% for dumbbell fly (Campos 2020, doi:10.2478/hukin-2020-0033). **(single)** The posterior-deltoid contribution of lateral raises is often under-appreciated.

### 3.18 Chest fly

**Versus bench press.** The meta-analysis found traditional bench press produced greater pectoralis activation than other pectoral variants (p=0.023 to 0.001), and flat bench specifically outperformed incline for the sternal head (López-Vivancos 2023). **(SR/MA)** Dumbbell fly produced 18.8% MVIC anterior deltoid versus 21.4% for bench press (not significant) and 3.4% middle deltoid (Campos 2020). **(single)** The fly is therefore a pec-focused exercise with a lower anterior-deltoid contribution than pressing, but it does not out-activate the bench press for the pectoralis overall.

**Incline fly.** Inclined dumbbell fly produced the greatest anterior-deltoid activation among individual exercises in the deltoid review (Rabello 2024). **(SR)** That is a cost, not a benefit, if the goal is pectoralis isolation.

### 3.19 Calf raise

**Foot rotation.** Nine weeks of unilateral calf raises with toes out, in, or forward produced head-specific hypertrophy: foot-out increased medial gastrocnemius thickness by 8.4% versus 3.8% foot-in and 5.8% forward, while foot-in increased lateral gastrocnemius by 9.1% versus 5.5% foot-out and 6.4% forward (Nunes 2020, doi:10.1519/jsc.0000000000003674). **(RCT)** Foot rotation is a genuine head-specific lever.

**Range of motion.** Initial (long-length, dorsiflexed) partial ROM produced medial gastrocnemius gains of +15.2% versus +6.7% for full ROM and +3.4% for final ROM, and lateral gastrocnemius gains of +14.9% versus +6.2% for final ROM (Kassiano 2023, doi:10.1519/jsc.0000000000004460). **(RCT)** This is one of the largest long-length effects in the dataset and argues for training the calf through the stretched portion rather than only the top range.

**What is missing.** No eligible study directly compared **standing versus seated** calf raises (knee-extended vs knee-flexed) with regional hypertrophy or EMG outcomes in this dataset. The gastrocnemius/soleus distinction is anatomically well established but is recorded here as an evidence gap rather than asserted.

### 3.20 Plank, crunch and core

**Plank versus dynamic flexion.** In 18 subjects, Swiss-ball roll-out produced upper rectus abdominis 63% MVIC and lower rectus abdominis 53% MVIC, external oblique 46% and internal oblique 46%; pike produced upper 46%, lower 55%, external oblique 84% and internal oblique 56%. Crunch and bent-knee sit-up were among the lowest for rectus abdominis, and lumbar paraspinal activation was below 10% MVIC in all exercises (Escamilla 2010, doi:10.2519/jospt.2010.3073). **(single, but the most comprehensive core EMG comparison located)** The plank is a low-to-moderate rectus abdominis exercise; roll-outs and pikes are substantially higher.

**Stable versus unstable.** A meta-analysis of 86 studies (1,783 participants) found unstable surfaces increased rectus abdominis (SMD 0.51), external oblique (0.44), internal oblique (1.04), erector spinae (0.37) and multifidus (0.35), but not lower-limb muscles (Batista 2024, doi:10.3390/sports12040111). **(SR/MA)** In a direct plank comparison, dual instability (rings + Bosu) produced the greatest upper and lower rectus abdominis activation, while anterior deltoid activation was greatest on the stable floor (Sağlam 2026, doi:10.5114/jhk/203417). **(single)**

**Training status.** Untrained individuals showed greater erector spinae (p=0.024) and multifidus (p=0.027) activation during a plank to failure than trained individuals (Fonza 2026b, doi:10.1016/j.jelekin.2026.103154). **(single)** The same absolute plank is a different stimulus for a novice and a trained lifter.

**Exercise class.** A systematic review found free-weight exercises produced the greatest rectus abdominis, external oblique and erector spinae activity, core-stability exercises the greatest internal oblique activity, and traditional exercises the greatest multifidus activity (Oliva-Lozano 2020, doi:10.3390/ijerph17124306). **(SR)** "Core training" is not one stimulus; the category determines which trunk muscle dominates.

---
## 4. Cross-cutting findings

### 4.1 Muscle length is the most generalisable variable

Five independent longitudinal designs point the same way:

| Model | Long-length condition | Short-length condition | Outcome | Source |
|---|---|---|---|---|
| Hamstrings, 12 wk | Seated leg curl +14% | Prone leg curl +9% | muscle volume (MRI) | Maeo 2021 |
| Triceps, 12 wk | Overhead extension +28.5% long head | Neutral +19.6% | muscle volume (MRI) | Maeo 2023 |
| Rectus femoris, 10 wk | Leg extension at 40° hip flexion | 90° hip flexion | hypertrophy (US) | Larsen 2025b |
| Biceps, 8 wk | Initial ROM (0–68°) | Final ROM (68–135°) | distal CSA | Pedrosa 2023 |
| Gastrocnemius, 8 wk | Initial ROM +15.2% medial | Final ROM +3.4% | muscle thickness (US) | Kassiano 2023 |

**(2+ independent across five muscles)** The effect is not universal — the monoarticular hamstring short head and the vastus lateralis did not differ — which is exactly what the anatomy predicts. The practical rule is to load the target muscle near its longest tolerable length *with meaningful external torque in that position*; a long length without torque does not produce the effect (Pedrosa 2026).

### 4.2 Full ROM versus partial ROM

A meta-analysis of 16 studies found full ROM produced greater strength gains (ES 0.56, p=0.004) and greater lower-limb hypertrophy (ES 0.88, p=0.027) than partial ROM, with no significant difference in muscle thickness, pennation angle or fascicle length (ES 0.28, p=0.226) (Pallarés 2021, doi:10.1111/sms.14006). **(SR/MA)** The biceps and calf trials above show that *which* partial range is used matters: partials at long length can beat full ROM for regional growth, whereas arbitrary partials do not. Full ROM remains the safer default for strength.

### 4.3 Grip width is usually a small lever, with one large exception

Across bench press, lat pulldown, row and pull-up, grip width changed EMG by amounts that are small relative to between-study variability, and several well-controlled studies found no difference at all (Andersen 2014; Buonsenso 2025; Saeterbakken 2021). The exception is the **shoulder joint**: wide grips increase horizontal shoulder moments, glenohumeral posterior shear and rotator-cuff activity, and wide-grip pull-ups increase the shoulder net moment by ~7% (Larsen 2020; Noteboom 2024; Pouly 2026). Grip width should be selected for joint comfort and sport specificity, not for a hoped-for EMG boost.

### 4.4 Acute EMG is a weak proxy for hypertrophy

Three lines of evidence converge:

1. Methodological: amplitude does not index motor-unit recruitment (Vigotsky 2016) and is not a validated predictor of hypertrophy (Vigotsky 2022).
2. Empirical: hip thrust vs squat produced ~2× glute EMG acutely but similar gluteal growth after 9 weeks (Plotkin 2023).
3. Positive control: regional T2 activation *does* track regional hypertrophy (Wakahara 2012), and long-length effects replicate — so the useful signal is spatial and length-specific, not a single whole-muscle amplitude.

**(2+ independent)** A corollary for the accompanying web app: EMG percentages should be presented as "acute activation in this exact protocol", never as "growth potential".

### 4.5 Stability and free weights

Unstable surfaces increase core and some upper-limb EMG (rectus abdominis SMD 0.51; internal oblique 1.04) but not lower-limb EMG (Batista 2024). Free-weight core exercises produce the highest rectus abdominis/external oblique/erector spinae activity (Oliva-Lozano 2020). Instability is a core-specific tool, not a general hypertrophy tool.

### 4.6 Tempo

Controlled tempos between roughly 2 and 8 s per repetition are recommended for hypertrophy, but direct comparisons of eccentric duration are scarce and an 8-week squat RCT found no significant strength difference between 2 s, 4 s and self-selected tempos (Androulakis Korakakis 2023; Hao 2026). Ballistic bouncing is a different construct: it raises joint moments substantially and shifts work to the posterior chain (Achermann 2026). **(single/Review; low certainty)**

---

## 5. Contradictions and how to read them

| Contradiction | Side A | Side B | Resolution |
|---|---|---|---|
| Decline bench and the sternal pectoralis | Barnett 1995: horizontal > decline | López-Vivancos 2023 meta: decline > flat for sternal head | **Unresolved.** Different loads, ROM, normalisation and pooling. Do not claim a decline benefit. |
| Hip thrust: EMG vs growth | Contreras 2015 / Williams 2021: thrust ≫ squat for glute EMG | Plotkin 2023: similar gluteal hypertrophy | **Resolved conceptually**: acute EMG is not the growth driver; total effective volume and loading matter. |
| Lat pulldown grip width | Gym convention: wide = more lats | Andersen 2014 and Buonsenso 2025: no difference | **Null is better evidenced.** Wide grip is not a lat isolate. |
| Front vs behind-neck press | Coratella 2022: back > front for all deltoid heads | Padovan 2026: front > back for anterior deltoid | **Phase-dependent.** Ascending vs descending phase and different normalisation; posterior-deltoid superiority of behind-neck is consistent. |
| Barbell row torso angle | More bent-over = more back | Fenwick 2009: bent-over has the highest spinal load, inverted row the highest lat/upper-back EMG | **Goal-dependent trade-off**, not a contradiction: activation and spinal load move together. |
| Leg press foot placement | High feet = glutes, low feet = quads | Escamilla 2001: no difference in knee forces | **Null.** The cue is unsupported. |

---

## 6. Evidence gaps

These are questions the Tier-1 sweep could not close; they are *not* claims:

1. **Deficit and block pulls** — no eligible EMG or biomechanical comparison. The ROM/quadriceps rationale is untested here.
2. **Seated versus standing overhead press** — no eligible direct comparison; trunk and stability demands are inferred, not measured.
3. **Overhead press grip width** — no eligible study.
4. **Standing versus seated calf raise** (knee-extended vs knee-flexed) — the gastrocnemius/soleus distinction is anatomical, but no eligible regional-hypertrophy or EMG comparison was located.
5. **Chest fly implement comparisons** (pec deck vs cable vs dumbbell) — only fly-vs-press and incline-fly data were found.
6. **Hammer/neutral-grip curl** — grip orientation effects were measured mostly in barbell curls; brachialis-specific longitudinal data are thin.
7. **Tempo** — few randomised comparisons of eccentric duration with hypertrophy outcomes.
8. **Sex and training-status moderation** — most mechanistic studies are small, male, and resistance-trained; the 2026 squat and bench studies are exceptions.
9. **Load–variation interaction** — most EMG studies use 60–80% 1RM or 6–10RM; whether the same redistribution holds at 30% or 90% is largely unknown.

---

## 7. Practical summary table

Directions are for the *listed* muscle/structure when moving from the reference condition to the variation. "↑" = increase, "↓" = decrease, "↔" = no meaningful change, "⇄" = redistribution.

| Exercise | Variation | Best-supported direction | Certainty |
|---|---|---|---|
| Back squat | Deeper | glute max ↑, knee extensor effort ↑, patellofemoral/PCL load ↑ | 2+ independent (EMG); single (biomech) |
| Back squat | Wide stance | vastus medialis ↑, TF/PF compression ↑, PCL tension ↑ | single |
| Back squat | Low bar | hamstrings/erector spinae ↑, rectus femoris ↓, hip moment share ↑ | 2+ independent (direction) |
| Back squat | Heel elevation | knee moment ↑, lumbar stress ↓, upright trunk ↑ | single (biomech) + SR (wedges) |
| Back squat | Bounce tempo | hip/knee/ankle moments ↑, lumbar extension moment ↑↑, posterior-chain EMG ↑ | single |
| Front squat | vs high-bar back squat | quadriceps ⇄, more upright trunk | SR |
| Deadlift | Sumo | biceps femoris ↓, vastus lateralis ↑, frontal-plane knee/hip moment ↑, adductor magnus force ↑ | 2+ independent (direction) |
| Deadlift | Hex bar | knee moment ↑, lumbar/hip moment ↓, 1RM ↑ | single |
| Deadlift | Mixed grip | forearm EMG ↓, perceived difficulty ↓ | single |
| Deadlift | Close-bar set-up | posterior chain ↑, quadriceps ↓, spinal load ↔ | single |
| RDL | vs conventional | rectus femoris ↓, knee/ankle torque ↓, erector spinae ↓ relative to hamstrings | 2+ independent |
| Bench press | Wide grip | sternal pec ↑, triceps ↓, shoulder moment/shear ↑ | 2+ independent (direction) |
| Bench press | Narrow grip | triceps ↑, sternal pec ↓, shoulder shear ↓, load ↓ | 2+ independent |
| Bench press | 30° incline | clavicular pec ↑, sternal pec ↓, ant. deltoid ↑ at ≥45° | 2+ independent |
| Bench press | Decline | sternal pec ⇄/conflicting | conflicting |
| Bench press | Arch | 1RM ↑, pec EMG ↔, triceps trend ↑ | single |
| Bench press | Feet up | trunk stabilisers ↑ | single |
| Bench press | Upper-half ROM | triceps ↑, pec ↑ (acute) | single |
| Overhead press | Behind neck | posterior/medial deltoid ↑↑, triceps ↑, pec ↓ | 2+ independent (direction) |
| Overhead press | Barbell vs machine | shoulder excitation ↑ with barbell | single |
| Barbell row | More upright | lat/upper back ↑, spinal load ↓ | single |
| Barbell row | Narrow grip | 1RM ↑, biceps/trap ⇄ | single |
| Barbell row | Upper-half ROM | lat ↑, trapezius ↓ | single |
| Pull-up | Chin-up | biceps ↑, pec ↑, lower trap ↓ | single |
| Pull-up | Wide + 30° grip | pec/rectus abdominis ↑, shoulder moment ↑ | single |
| Lat pulldown | Grip width | lat ↔, biceps medium > narrow | 2+ independent (null) |
| Lat pulldown | Front vs back | front: lat/pec descending ↑; back: lat ascending ↑ | single |
| Lat pulldown | 30° lean | posterior deltoid ↑ | single |
| Biceps curl | Incline vs preacher | biceps ↑ incline; brachialis/brachioradialis ↑ preacher | RCT |
| Biceps curl | Initial ROM | distal biceps ↑ | 3 RCTs |
| Biceps curl | Cable shoulder angle | ↔ when profile/ROM matched | RCT |
| Triceps extension | Overhead vs neutral | long head ↑↑, whole triceps ↑ | RCT |
| Leg press | Foot high vs low | knee forces ↔ | single |
| Leg press | vs leg extension | glute max/adductor ↑; rectus femoris ↓ | RCT |
| Leg extension | 40° vs 90° hip | rectus femoris ↑ | RCT |
| Leg curl | Seated vs prone | whole hamstrings ↑, biarticular ↑ | RCT |
| Hip thrust | vs squat | acute glute EMG ↑↑, chronic glute growth ↔, quad/adductor growth ↓ | RCT + EMG |
| Hip thrust | vs glute bridge | glute max EMG ↓ | single |
| Lateral raise | DB vs cable | ↔ | RCT |
| Lateral raise | Internal rotation | middle deltoid ↑ | SR |
| Chest fly | vs bench press | pec EMG ↓, ant. deltoid ↓ | SR/MA |
| Calf raise | Toes out | medial gastroc ↑ | RCT |
| Calf raise | Toes in | lateral gastroc ↑ | RCT |
| Calf raise | Initial ROM | medial/lateral gastroc ↑ | RCT |
| Plank | Unstable surface | rectus abdominis/obliques ↑ | SR/MA |
| Plank | vs roll-out/pike | rectus abdominis/obliques ↓ | single |
| Crunch | vs roll-out/pike | rectus abdominis ↓ | single |

---

## 8. Limitations of this review

- **Abstract-level extraction for most sources.** Full text was obtained via ASU for five paywalled classics; the rest were coded from structured abstracts and OA full text where available. Some magnitudes (exact % changes) are therefore unreported rather than absent.
- **Heterogeneous EMG methods.** Normalisation (MVIC vs peak vs submaximal), electrode placement and load differ across studies; cross-study %MVIC comparisons carry substantial error (Besomi 2020).
- **Small samples.** Most EMG cohorts have 10–30 participants; many are male and resistance-trained.
- **Publication and citation lag.** 2025–2026 sources are included but have low citation counts; the 2026 dates reflect advance online publication.
- **Scopus under-used.** The API key was present but the wrapper returned 429/thin views; Crossref, OpenAlex and Europe PMC carried triangulation. This is a coverage limitation for non-PubMed sports-science journals.
- **Retraction gating degraded.** `LIBKEY_KEY` was unset. No retraction flags were found in Crossref/OpenAlex, but this is not equivalent to a LibKey check.
- **Grey literature not used for claims.** One pass was performed; no included claim depends on Tier-3 material.
- **No meta-analysis performed.** Directions and reported magnitudes are synthesised qualitatively; pooling was not appropriate given methodological heterogeneity.

---

## 9. Deliverables in this workspace

| File | Contents |
|---|---|
| `report.md` | this document |
| `references.json` | 90 references: id, title, authors, year, journal, DOI, PMID, URL, evidenceLevel |
| `exercises.json` | 22 exercises, 68 variations, 209 effects, every effect with `referenceIds` |
| `sources.json` | per-source DOI, venue, year, citations, OA flag, credibility tier, `viaAsuLibrary` |
| `research-state.md` | live checklist, iteration log, seed recall, convergence record |
| `work/` | raw query outputs, merged records, build scripts (reproducible) |
| `logs/` | per-iteration Tier-1 outputs |

`exercises.json` schema is exactly the requested one: `{id, name, category, primaryMuscles[], secondaryMuscles[], variations[{id, name, description, effects[{muscle, direction, magnitude, note, referenceIds[]}], referenceIds[]}], referenceIds[]}`. Mechanical-stress effects use joint/ligament/spinal-segment names in the `muscle` field and say "mechanical stress, not EMG" in `note`, so downstream consumers can filter activation from stress.

---

## 10. Reference list

Every DOI below resolves to the cited work. Evidence level is the study design actually used for the claim, not the journal's prestige.

| id | citation | year | evidence | DOI |
|---|---|---|---|---|
| `barnett1995` | Chris Barnett, Vaughan Kippers, Peter Turner. Effects of Variations of the Bench Press Exercise on the EMG Activity of Five Shoulder Muscles. *The Journal of Strength and Conditioning Research*. | 1995 | EMG cohort | [10.1519/00124278-199511000-00003](https://doi.org/10.1519/00124278-199511000-00003) |
| `escamilla2000` | Rafael F. Escamilla, Anthony C. Francisco, Glenn S. Fleisig et al. A three-dimensional biomechanical analysis of sumo and conventional style deadlifts. *Medicine & Science in Sports & Exercise*. | 2000 | biomechanical | [10.1097/00005768-200007000-00013](https://doi.org/10.1097/00005768-200007000-00013) |
| `escamilla2001` | Rafael F. Escamilla, Glenn S. Fleisig, Naiquan Zheng et al. Effects of technique variations on knee biomechanics during the squat and leg press. *Medicine & Science in Sports & Exercise*. | 2001 | biomechanical | [10.1097/00005768-200109000-00020](https://doi.org/10.1097/00005768-200109000-00020) |
| `caterisano2002` | Anthony Caterisano, Raymond E Moss, Thomas K. Pellinger et al. The Effect of Back Squat Depth on the EMG Activity of 4 Superficial Hip and Thigh Muscles. *Journal of Strength and Conditioning Research*. | 2002 | EMG cohort | [10.1519/00124278-200208000-00014](https://doi.org/10.1519/00124278-200208000-00014) |
| `signorile2002` | Joseph E Signorile, Attila J. Zink, Steven P. Szwed. A Comparative Electromyographical Investigation of Muscle Utilization Patterns Using Various Hand Positions During the Lat Pull-down. *Journal of Strength and Conditioning Research*. | 2002 | EMG cohort | [10.1519/00124278-200211000-00008](https://doi.org/10.1519/00124278-200211000-00008) |
| `lehman2005` | Gregory J. Lehman. THE INFLUENCE OF GRIP WIDTH AND FOREARM PRONATION/SUPINATION ON UPPER-BODY MYOELECTRIC ACTIVITY DURING THE FLAT BENCH PRESS. *Journal of Strength and Conditioning Research*. | 2005 | EMG cohort | [10.1519/00124278-200508000-00017](https://doi.org/10.1519/00124278-200508000-00017) |
| `fenwick2009` | Chad MJ Fenwick, Stephen HM Brown, Stuart M McGill. Comparison of Different Rowing Exercises: Trunk Muscle Activation and Lumbar Spine Motion, Load, and Stiffness. *Journal of Strength and Conditioning Research*. | 2009 | EMG cohort | [10.1519/jsc.0b013e3181b07334](https://doi.org/10.1519/jsc.0b013e3181b07334) |
| `escamilla2010` | Rafael F. Escamilla, Clare Lewis, Duncan Bell et al. Core Muscle Activation During Swiss Ball and Traditional Abdominal Exercises. *Journal of Orthopaedic & Sports Physical Therapy*. | 2010 | EMG cohort | [10.2519/jospt.2010.3073](https://doi.org/10.2519/jospt.2010.3073) |
| `schoenfeld2010` | Brad J Schoenfeld. Squatting Kinematics and Kinetics and Their Application to Exercise Performance. *Journal of Strength and Conditioning Research*. | 2010 | review | [10.1519/jsc.0b013e3181bac2d7](https://doi.org/10.1519/jsc.0b013e3181bac2d7) |
| `youdas2010` | James W Youdas, Collier L Amundson, Kyle S Cicero et al. Surface Electromyographic Activation Patterns and Elbow Joint Motion During a Pull-Up, Chin-Up, or Perfect-Pullup™ Rotational Exercise. *Journal of Strength and Conditioning Research*. | 2010 | EMG cohort | [10.1519/jsc.0b013e3181f1598c](https://doi.org/10.1519/jsc.0b013e3181f1598c) |
| `swinton2011` | Paul A Swinton, Arthur Stewart, Ioannis Agouris et al. A Biomechanical Analysis of Straight and Hexagonal Barbell Deadlifts Using Submaximal Loads. *Journal of Strength and Conditioning Research*. | 2011 | biomechanical crossover | [10.1519/jsc.0b013e3181e73f87](https://doi.org/10.1519/jsc.0b013e3181e73f87) |
| `wakahara2012` | Taku Wakahara, Naokazu Miyamoto, Norihide Sugisaki et al. Association between regional differences in muscle activation in one session of resistance exercise and in muscle hypertrophy after resistance training. *European Journal of Applied Physiology*. | 2011 | RCT | [10.1007/s00421-011-2121-y](https://doi.org/10.1007/s00421-011-2121-y) |
| `bryanton2012` | Megan A. Bryanton, Michael D. Kennedy, Jason P. Carey et al. Effect of Squat Depth and Barbell Load on Relative Muscular Effort in Squatting. *Journal of Strength and Conditioning Research*. | 2012 | biomechanical | [10.1519/jsc.0b013e31826791a7](https://doi.org/10.1519/jsc.0b013e31826791a7) |
| `clark2012` | Dave R. Clark, Mike I. Lambert, Angus M. Hunter. Muscle Activation in the Loaded Free Barbell Squat. *Journal of Strength and Conditioning Research*. | 2012 | review | [10.1519/jsc.0b013e31822d533d](https://doi.org/10.1519/jsc.0b013e31822d533d) |
| `andersen2014` | Vidar Andersen, Marius S. Fimland, Espen Wiik et al. Effects of Grip Width on Muscle Strength and Activation in the Lat Pull-Down. *Journal of Strength and Conditioning Research*. | 2014 | EMG cohort | [10.1097/jsc.0000000000000232](https://doi.org/10.1097/jsc.0000000000000232) |
| `contreras2015` | Contreras B, Vigotsky AD, Schoenfeld BJ, Beardsley C, Cronin J. A Comparison of Gluteus Maximus, Biceps Femoris, and Vastus Lateralis Electromyographic Activity in the Back Squat and Barbell Hip Thrust Exercises. *Journal of applied biomechanics*. | 2015 | EMG cohort | [10.1123/jab.2014-0301](https://doi.org/10.1123/jab.2014-0301) |
| `lauver2016` | Jakob D. Lauver, Trent E. Cayot, Barry W. Scheuermann. Influence of bench angle on upper extremity muscular activation during bench press exercise. *European Journal of Sport Science*. | 2015 | EMG cohort | [10.1080/17461391.2015.1022605](https://doi.org/10.1080/17461391.2015.1022605) |
| `vigotsky2016` | Andrew D. Vigotsky, Dan Ogborn, Stuart M. Phillips. Motor unit recruitment cannot be inferred from surface EMG amplitude and basic reporting standards must be adhered to. *European Journal of Applied Physiology*. | 2015 | review | [10.1007/s00421-015-3314-6](https://doi.org/10.1007/s00421-015-3314-6) |
| `lockie2017` | Lockie RG, Callaghan SJ, Moreno MR, Risso FG, Liu TM, Stage AA, Birmingham-Babauta SA, Stokes JJ, Giuliano DV, Lazar A, Davis DL, Orjalo AJ. An Investigation of the Mechanics and Sticking Region of a One-Repetition Maximum Close-Grip Bench Press versus the Traditional Bench Press. *Sports (Basel, Switzerland)*. | 2017 | biomechanical | [10.3390/sports5030046](https://doi.org/10.3390/sports5030046) |
| `saeterbakken2017` | Atle Hole Saeterbakken, Dag-André Mo, Suzanne Scott et al. The Effects of Bench Press Variations in Competitive Athletes on Muscle Activity and Performance. *Journal of Human Kinetics*. | 2017 | EMG cohort | [10.1515/hukin-2017-0047](https://doi.org/10.1515/hukin-2017-0047) |
| `stastny2017` | Petr Stastny, Artur Gołaś, Dusan Blazek et al. A systematic review of surface electromyography analyses of the bench press movement task. *PLOS ONE*. | 2017 | SR/MA | [10.1371/journal.pone.0171632](https://doi.org/10.1371/journal.pone.0171632) |
| `edington2018` | Edington C, Greening C, Kmet N, Philipenko N, Purves L, Stevens J, Lanovaz J, Butcher S. The Effect of Set Up Position on EMG Amplitude, Lumbar Spine Kinetics, and Total Force Output During Maximal Isometric Conventional-Stance Deadlifts. *Sports (Basel, Switzerland)*. | 2018 | EMG cohort | [10.3390/sports6030090](https://doi.org/10.3390/sports6030090) |
| `lee2018` | Sangwoo Lee, Jacob Schultz, Joseph Timgren et al. An electromyographic and kinetic comparison of conventional and Romanian deadlifts. *Journal of Exercise Science & Fitness*. | 2018 | EMG cohort | [10.1016/j.jesf.2018.08.001](https://doi.org/10.1016/j.jesf.2018.08.001) |
| `muyor2019` | José M. Muyor, David Rodríguez-Ridao, Isabel Martín-Fuentes et al. Evaluation and comparison of electromyographic activity in bench press with feet on the ground and active hip flexion. *PLOS ONE*. | 2019 | EMG cohort | [10.1371/journal.pone.0218209](https://doi.org/10.1371/journal.pone.0218209) |
| `besomi2020` | Manuela Besomi, Paul W. Hodges, Edward A. Clancy et al. Consensus for experimental design in electromyography (CEDE) project: Amplitude normalization matrix. *Journal of Electromyography and Kinesiology*. | 2020 | review | [10.1016/j.jelekin.2020.102438](https://doi.org/10.1016/j.jelekin.2020.102438) |
| `campos2020` | Campos YAC, Vianna JM, Guimarães MP, Oliveira JLD, Hernández-Mosqueira C, da Silva SF, Marchetti PH. Different Shoulder Exercises Affect the Activation of Deltoid Portions in Resistance-Trained Individuals. *Journal of human kinetics*. | 2020 | EMG cohort | [10.2478/hukin-2020-0033](https://doi.org/10.2478/hukin-2020-0033) |
| `gener2020` | Javier Gene-Morales, Jorge Flandez, Alvaro Juesas et al. A systematic review on the muscular activation on the lower limbs with five different variations of the squat exercise. *Journal of Human Sport and Exercise - 2020 - Summer Conferences of Sports Science*. | 2020 | SR/MA | [10.14198/jhse.2020.15.proc4.28](https://doi.org/10.14198/jhse.2020.15.proc4.28) |
| `koderi2020` | Khalila Liyana Koderi, Kevin Tan, Mohamad Shahrul Azzfar et al. The effects of stance width on muscle activation and performance during Romanian deadlift exercise. *Journal of Physics: Conference Series*. | 2020 | EMG cohort | [10.1088/1742-6596/1529/2/022026](https://doi.org/10.1088/1742-6596/1529/2/022026) |
| `maeo2021` | Sumiaki Maeo, Meng Huang, Yuhang Wu et al. Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths. *Medicine & Science in Sports & Exercise*. | 2020 | RCT | [10.1249/mss.0000000000002523](https://doi.org/10.1249/mss.0000000000002523) |
| `martinfuentes2020` | Martín-Fuentes I, Oliva-Lozano JM, Muyor JM. Electromyographic activity in deadlift exercise and its variants. A systematic review. *PloS one*. | 2020 | SR/MA | [10.1371/journal.pone.0229507](https://doi.org/10.1371/journal.pone.0229507) |
| `murawa2020` | Murawa M, Fryzowicz A, Kabacinski J, Jurga J, Gorwa J, Galli M, Zago M. Muscle activation varies between high-bar and low-bar back squat. *PeerJ*. | 2020 | EMG cohort | [10.7717/peerj.9256](https://doi.org/10.7717/peerj.9256) |
| `nunes2020` | João Pedro Nunes, Bruna D.V. Costa, Witalo Kassiano et al. Different Foot Positioning During Calf Training to Induce Portion-Specific Gastrocnemius Muscle Hypertrophy. *Journal of Strength and Conditioning Research*. | 2020 | RCT | [10.1519/jsc.0000000000003674](https://doi.org/10.1519/jsc.0000000000003674) |
| `olivalozano2020` | José M. Oliva-Lozano, José M. Muyor. Core Muscle Activity during Physical Fitness Exercises: A Systematic Review. *International Journal of Environmental Research and Public Health*. | 2020 | SR/MA | [10.3390/ijerph17124306](https://doi.org/10.3390/ijerph17124306) |
| `pratt2020` | Jedd Pratt, Arianna Hoffman, Adam Grainger et al. Forearm electromyographic activity during the deadlift exercise is affected by grip type and sex. *Journal of Electromyography and Kinesiology*. | 2020 | EMG cohort | [10.1016/j.jelekin.2020.102428](https://doi.org/10.1016/j.jelekin.2020.102428) |
| `rodriguezridao2020` | David Rodríguez-Ridao, José A. Antequera-Vique, Isabel Martín-Fuentes et al. Effect of Five Bench Inclinations on the Electromyographic Activity of the Pectoralis Major, Anterior Deltoid, and Triceps Brachii during the Bench Press Exercise. *International Journal of Environmental Research and Public Health*. | 2020 | EMG cohort | [10.3390/ijerph17197339](https://doi.org/10.3390/ijerph17197339) |
| `cabral2022` | Hélio V. Cabral, Leonardo M. L. de Souza, Liliam F. de Oliveira et al. Non‐uniform excitation of the pectoralis major muscle during flat and inclined bench press exercises. *Scandinavian Journal of Medicine & Science in Sports*. | 2021 | EMG cohort | [10.1111/sms.14082](https://doi.org/10.1111/sms.14082) |
| `larsen2020` | Stian Larsen, Olav Gomo, Roland van den Tillaar. A Biomechanical Analysis of Wide, Medium, and Narrow Grip Width Effects on Kinematics, Horizontal Kinetics, and Muscle Activity on the Sticking Region in Recreationally Trained Males During 1-RM Bench Pressing. *Frontiers in Sports and Active Living*. | 2021 | biomechanical | [10.3389/fspor.2020.637066](https://doi.org/10.3389/fspor.2020.637066) |
| `larsen2021` | Larsen S, Kristiansen E, Helms E, van den Tillaar R. Effects of Stance Width and Barbell Placement on Kinematics, Kinetics, and Myoelectric Activity in Back Squats. *Frontiers in sports and active living*. | 2021 | biomechanical crossover | [10.3389/fspor.2021.719013](https://doi.org/10.3389/fspor.2021.719013) |
| `pallares2021` | Jesús G. Pallarés, Alejandro Hernández‐Belmonte, Alejandro Martínez‐Cava et al. Effects of range of motion on resistance training adaptations: A systematic review and meta‐analysis. *Scandinavian Journal of Medicine & Science in Sports*. | 2021 | SR/MA | [10.1111/sms.14006](https://doi.org/10.1111/sms.14006) |
| `saeterbakken2021` | Saeterbakken AH, Stien N, Pedersen H, Solstad TEJ, Cumming KT, Andersen V. The Effect of Grip Width on Muscle Strength and Electromyographic Activity in Bench Press among Novice- and Resistance-Trained Men. *International journal of environmental research and public health*. | 2021 | EMG cohort | [10.3390/ijerph18126444](https://doi.org/10.3390/ijerph18126444) |
| `sato2021` | Shigeru Sato, Riku Yoshida, Ryosuke Kiyono et al. Elbow Joint Angles in Elbow Flexor Unilateral Resistance Exercise Training Determine Its Effects on Muscle Strength and Thickness of Trained and Non-trained Arms. *Frontiers in Physiology*. | 2021 | RCT | [10.3389/fphys.2021.734509](https://doi.org/10.3389/fphys.2021.734509) |
| `williams2021` | Michael J. Williams, Neil V. Gibson, Graeme G. Sorbie et al. Activation of the Gluteus Maximus During Performance of the Back Squat, Split Squat, and Barbell Hip Thrust and the Relationship With Maximal Sprinting. *Journal of Strength & Conditioning Research*. | 2021 | EMG cohort | [10.1519/jsc.0000000000002651](https://doi.org/10.1519/jsc.0000000000002651) |
| `blazkiewicz2022` | Michalina Błażkiewicz, Anna Hadamus. The Effect of the Weight and Type of Equipment on Shoulder and Back Muscle Activity in Surface Electromyography during the Overhead Press—Preliminary Report. *Sensors*. | 2022 | EMG cohort | [10.3390/s22249762](https://doi.org/10.3390/s22249762) |
| `coratella2022` | Coratella G, Tornatore G, Longo S, Esposito F, Cè E. Front vs Back and Barbell vs Machine Overhead Press: An Electromyographic Analysis and Implications For Resistance Training. *Frontiers in physiology*. | 2022 | EMG cohort | [10.3389/fphys.2022.825880](https://doi.org/10.3389/fphys.2022.825880) |
| `maeo2023` | Sumiaki Maeo, Yuhang Wu, Meng Huang et al. Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position. *European Journal of Sport Science*. | 2022 | RCT | [10.1080/17461391.2022.2100279](https://doi.org/10.1080/17461391.2022.2100279) |
| `vigotsky2022` | Andrew D. Vigotsky, Israel Halperin, Gabriel S. Trajano et al. Longing for a Longitudinal Proxy: Acutely Measured Surface EMG Amplitude is not a Validated Predictor of Muscle Hypertrophy. *Sports Medicine*. | 2022 | review | [10.1007/s40279-021-01619-2](https://doi.org/10.1007/s40279-021-01619-2) |
| `kassiano2023` | Witalo Kassiano, Bruna Costa, Gabriel Kunevaliki et al. Greater Gastrocnemius Muscle Hypertrophy After Partial Range of Motion Training Performed at Long Muscle Lengths. *Journal of Strength & Conditioning Research*. | 2023 | RCT | [10.1519/jsc.0000000000004460](https://doi.org/10.1519/jsc.0000000000004460) |
| `korakakis2023` | Patroklos Androulakis Korakakis, Milo Wolf, Max Coleman et al. Optimizing Resistance Training Technique to Maximize Muscle Hypertrophy: A Narrative Review. *Journal of Functional Morphology and Kinesiology*. | 2023 | review | [10.3390/jfmk9010009](https://doi.org/10.3390/jfmk9010009) |
| `lopezvivancos2023` | Abraham López-Vivancos, Noelia González-Gálvez, Francisco Javier Orquín-Castrillón et al. Electromyographic Activity of the Pectoralis Major Muscle during Traditional Bench Press and Other Variants of Pectoral Exercises: A Systematic Review and Meta-Analysis. *Applied Sciences*. | 2023 | SR/MA | [10.3390/app13085203](https://doi.org/10.3390/app13085203) |
| `muyor2023` | Muyor JM, Rodríguez-Ridao D, Oliva-Lozano JM. Comparison of Muscle Activity between the Horizontal Bench Press and the Seated Chest Press Exercises Using Several Grips. *Journal of human kinetics*. | 2023 | EMG cohort | [10.5114/jhk/161468](https://doi.org/10.5114/jhk/161468) |
| `pedrosa2023` | Gustavo F. Pedrosa, Marina G. Simões, Marina O. C. Figueiredo et al. Training in the Initial Range of Motion Promotes Greater Muscle Adaptations Than at Final in the Arm Curl. *Sports*. | 2023 | RCT | [10.3390/sports11020039](https://doi.org/10.3390/sports11020039) |
| `plotkin2023` | Plotkin DL, Rodas MA, Vigotsky AD, McIntosh MC, Breeze E, Ubrik R, Robitzsch C, Agyin-Birikorang A, Mattingly ML, Michel JM, Kontos NJ, Lennon S, Frugé AD, Wilburn CM, Weimar WH, Bashir A, Beyers RJ, Henselmans M, Contreras BM, Roberts MD. Hip thrust and back squat training elicit similar gluteus muscle hypertrophy and transfer similarly to the deadlift. *Frontiers in physiology*. | 2023 | RCT | [10.3389/fphys.2023.1279170](https://doi.org/10.3389/fphys.2023.1279170) |
| `bartolomei2024` | Sandro Bartolomei, Emanuele Caroli, Vittorio Coloretti et al. Flat-Back vs. Arched-Back Bench Press: Examining the Different Techniques Performed by Power Athletes. *Journal of Strength & Conditioning Research*. | 2024 | biomechanical crossover | [10.1519/jsc.0000000000004778](https://doi.org/10.1519/jsc.0000000000004778) |
| `batista2024` | Gabriel de Amorim Batista, Sol Patricia Beltrán, Muana Hiandra Pereira dos Passos et al. Comparison of the Electromyography Activity during Exercises with Stable and Unstable Surfaces: A Systematic Review and Meta-Analysis. *Sports*. | 2024 | SR/MA | [10.3390/sports12040111](https://doi.org/10.3390/sports12040111) |
| `ghasemi2024` | Mohammadhossein Ghasemi, Behnam Gholami-Borujeni, Kristín Briem. Effects of Various Foot Wedges on Thigh Muscle Activity during Squatting in Healthy Adults: A Systematic Review and Meta-Analysis. *Applied Sciences*. | 2024 | SR/MA | [10.3390/app14052091](https://doi.org/10.3390/app14052091) |
| `gundersen2025` | Andreas H. Gundersen, Roland van den Tillaar, Hallvard N. Falch et al. A Biomechanical Comparison Between Conventional, Sumo, and Hex-Bar Deadlifts Among Resistance Trained Women. *Journal of Strength & Conditioning Research*. | 2024 | biomechanical crossover | [10.1519/jsc.0000000000005011](https://doi.org/10.1519/jsc.0000000000005011) |
| `kennedy2024` | Kennedy D, Casebolt JB, Farren GL, Fiaud V, Bartlett M, Strong L. Electromyographic differences of the gluteus maximus, gluteus medius, biceps femoris, and vastus lateralis between the barbell hip thrust and barbell glute bridge. *Sports biomechanics*. | 2024 | EMG cohort | [10.1080/14763141.2022.2074875](https://doi.org/10.1080/14763141.2022.2074875) |
| `noteboom2024` | Noteboom L, Belli I, Hoozemans MJM, Seth A, Veeger HEJ, Van Der Helm FCT. Effects of bench press technique variations on musculoskeletal shoulder loads and potential injury risk. *Frontiers in physiology*. | 2024 | biomechanical | [10.3389/fphys.2024.1393235](https://doi.org/10.3389/fphys.2024.1393235) |
| `padovan2024a` | Riccardo Padovan, Giuseppe Marcolin, Stefano Longo et al. Surface electromyography excitation in barbell vs. kettlebell overhead press prime movers and stabilizer muscles. *Sport Sciences for Health*. | 2024 | review | [10.1007/s11332-024-01301-w](https://doi.org/10.1007/s11332-024-01301-w) |
| `padovan2024b` | Riccardo Padovan, Nicholas Toninelli, Stefano Longo et al. High-Density Electromyography Excitation in Front vs. Back Lat Pull-Down Prime Movers. *Journal of Human Kinetics*. | 2024 | EMG cohort | [10.5114/jhk/185211](https://doi.org/10.5114/jhk/185211) |
| `rabello2024` | Rodrigo Rabello, Filippo Bertozzi, Ivan Lucas Hauschild de Freitas et al. Activation of the three deltoid muscle portions during common strengthening exercises: A systematic review. *Journal of Bodywork and Movement Therapies*. | 2024 | SR/MA | [10.1016/j.jbmt.2022.12.002](https://doi.org/10.1016/j.jbmt.2022.12.002) |
| `buonsenso2025` | Buonsenso A, Di Fonza D, Di Claudio G, Carangelo M, Centorbi M, di Cagno A, Calcagno G, Fiorilli G. Electromyographic Analysis of Back Muscle Activation During Lat Pulldown Exercise: Effects of Grip Variations and Forearm Orientation. *Journal of functional morphology and kinesiology*. | 2025 | EMG cohort | [10.3390/jfmk10030345](https://doi.org/10.3390/jfmk10030345) |
| `fischer2025a` | Josef Fischer, Christian Burger, Josefina Andrea Manieu Seguel et al. Acute muscle excitation response across various bench press ranges of motion. *Scientific Reports*. | 2025 | EMG cohort | [10.1038/s41598-025-98354-9](https://doi.org/10.1038/s41598-025-98354-9) |
| `fischer2025b` | Fischer J, Burger C, Seguel JM, Rodoplu C, Paternoster FK, Tilp M, Konrad A. Impact of different ranges of motion in the prone barbell row on muscle excitation. *Journal of electromyography and kinesiology : official journal of the International Society of Electrophysiological Kinesiology*. | 2025 | EMG cohort | [10.1016/j.jelekin.2025.103025](https://doi.org/10.1016/j.jelekin.2025.103025) |
| `hanen2025` | N. C. Hanen, K. Ben Mansour, G. N. Ertel et al. Biomechanical analysis of conventional and sumo deadlift. *Frontiers in Bioengineering and Biotechnology*. | 2025 | biomechanical crossover | [10.3389/fbioe.2025.1597209](https://doi.org/10.3389/fbioe.2025.1597209) |
| `havers2025` | Tim Havers, Niklas Wagner, Steffen Held et al. Partial Range, Full Gains? The Effect of 8 Weeks of Partial Range of Motion Training at Long Muscle Lengths on Elbow Flexor Hypertrophy and Strength in Trained Individuals. *European Journal of Sport Science*. | 2025 | RCT | [10.1002/ejsc.70087](https://doi.org/10.1002/ejsc.70087) |
| `krauseneto2025` | Walter Krause Neto, Thaís Lima Vieira Krause, Eliane Florencio Gama. The impact of resistance training on gluteus maximus hypertrophy: a systematic review and meta-analysis. *Frontiers in Physiology*. | 2025 | SR/MA | [10.3389/fphys.2025.1542334](https://doi.org/10.3389/fphys.2025.1542334) |
| `larsen2025` | Stian Larsen, Milo Wolf, Brad J. Schoenfeld et al. Dumbbell versus cable lateral raises for lateral deltoid hypertrophy: an experimental study. *Frontiers in Physiology*. | 2025 | RCT | [10.3389/fphys.2025.1611468](https://doi.org/10.3389/fphys.2025.1611468) |
| `larsen2025b` | Larsen S, Sandvik Kristiansen B, Swinton PA, Wolf M, Bao Fredriksen A, Nygaard Falch H, van den Tillaar R, Østerås Sandberg N. The effects of hip flexion angle on quadriceps femoris muscle hypertrophy in the leg extension exercise. *Journal of sports sciences*. | 2025 | RCT | [10.1080/02640414.2024.2444713](https://doi.org/10.1080/02640414.2024.2444713) |
| `padovan2026` | Riccardo Padovan, Nicholas Toninelli, Stefano Longo et al. High-Density Surface Electromyography Excitation in Front vs. Back Overhead Press Prime Movers. *Journal of Human Kinetics*. | 2025 | EMG cohort | [10.5114/jhk/205466](https://doi.org/10.5114/jhk/205466) |
| `pedrosa2026` | Gustavo Ferreira Pedrosa, Mariano Rezende Pereira, Witalo Kassiano. The interplay between muscle length, range of motion, and exercise
                    selection: a review. *Sports Medicine International Open*. | 2025 | review | [10.1055/a-2733-7605](https://doi.org/10.1055/a-2733-7605) |
| `saglam2026` | Ali Fatih Sağlam, Erbil Murat Aydın, Erkan Demirkan et al. Effects of Surface Stability on Muscle Activation  during Plank Exercise. *Journal of Human Kinetics*. | 2025 | EMG cohort | [10.5114/jhk/203417](https://doi.org/10.5114/jhk/203417) |
| `achermann2026` | Basil B. Achermann, Taewoong Kong, Anna Drewek et al. Acute Effect of the Bounce Technique on Joint Angles, Net Joint Moments, and Muscle Activity in the Free Weight Back Squat. *Journal of Strength & Conditioning Research*. | 2026 | biomechanical crossover | [10.1519/jsc.0000000000005621](https://doi.org/10.1519/jsc.0000000000005621) |
| `alqahtani2026` | Bijad S. Alqahtani, Husam A. Almalki. Effects of Squat Exercise Variations on Lower Limb Biomechanics and Functional Outcomes: Implications for Physiotherapy and Rehabilitation: A Systematic Review. *Healthcare*. | 2026 | SR/MA | [10.3390/healthcare14213561](https://doi.org/10.3390/healthcare14213561) |
| `bozkurt2026` | Ömer Bozkurt, Deniz Erdağ, Cevdet Tinazci et al. Mechanobiological and neuromuscular responses to foot-position variations during front and back squat exercises. *Frontiers in Physiology*. | 2026 | EMG cohort | [10.3389/fphys.2025.1727141](https://doi.org/10.3389/fphys.2025.1727141) |
| `cai2026` | Jiachao Cai, Dong Sun, Fengping Li et al. Dose-Dependent Effects of Heel Elevation on Kinetic Chain Reconstruction and Lumbar Stress During Loaded Squatting in Men With Restricted Ankle Dorsiflexion. *Journal of Strength & Conditioning Research*. | 2026 | biomechanical crossover | [10.1519/jsc.0000000000005639](https://doi.org/10.1519/jsc.0000000000005639) |
| `cherni2026` | Bilel Cherni, Hamza Marzouki, Okba Selmi et al. Beyond the Neutral Spine: A Narrative Review and Modern Framework for Low Back Injury Prevention in Deadlifting. *Sports*. | 2026 | review | [10.3390/sports14040151](https://doi.org/10.3390/sports14040151) |
| `collings2026` | Tyler J. Collings, Annelinde Horsman, Andrea H. Hams et al. Hip Adductor Muscle Forces during Strength Training and Rehabilitation Exercises. *Medicine & Science in Sports & Exercise*. | 2026 | biomechanical | [10.1249/mss.0000000000004002](https://doi.org/10.1249/mss.0000000000004002) |
| `fonza2026a` | Domenico Di Fonza, Gloria Di Claudio, Gianmaria Colantuono et al. Electromyographic Analysis of Latissimus Dorsi Activation During Common Resistance Training Exercises: A Narrative Review. *Journal of Functional Morphology and Kinesiology*. | 2026 | review | [10.3390/jfmk11030315](https://doi.org/10.3390/jfmk11030315) |
| `fonza2026b` | Fonza DD, Claudio GD, Centorbi M, Persichini L, Garofalo L, Calcagno G, di Cagno A, Buonsenso A, Fiorilli G. Is the plank exercise suitable for Everyone? An electromyographic comparison between trained and untrained individuals. *Journal of electromyography and kinesiology : official journal of the International Society of Electrophysiological Kinesiology*. | 2026 | EMG cohort | [10.1016/j.jelekin.2026.103154](https://doi.org/10.1016/j.jelekin.2026.103154) |
| `fusco2026` | Anthony M. Fusco, Harbinder Dhariwal, Sean P. McBride et al. Impact of grip orientation on strength and muscle activation during the incline prone row. *Biomedical Human Kinetics*. | 2026 | EMG cohort | [10.2478/bhk-2026-0028](https://doi.org/10.2478/bhk-2026-0028) |
| `hao2026` | Mushuai Hao, Haonan Qi, Liang Zhao et al. The effect of squat training with different eccentric contraction tempos on lower limb muscle strength. *PLOS One*. | 2026 | RCT | [10.1371/journal.pone.0354725](https://doi.org/10.1371/journal.pone.0354725) |
| `kinoshita2026` | Momoka Kinoshita, Sumiaki Maeo, Yuuto Kobayashi et al. Hypertrophic Effects of Single- versus Multi-Joint Exercise: A Direct Comparison between Knee Extension and Leg Press. *Medicine & Science in Sports & Exercise*. | 2026 | RCT | [10.1249/mss.0000000000003957](https://doi.org/10.1249/mss.0000000000003957) |
| `kobayashi2026` | Yuuto Kobayashi, Sumiaki Maeo, Yuuri Eihara et al. Exercise-specific preferential hypertrophy of individual elbow flexor muscles after incline versus preacher dumbbell curl training. *Journal of Sports Sciences*. | 2026 | RCT | [10.1080/02640414.2026.2741751](https://doi.org/10.1080/02640414.2026.2741751) |
| `larsen2026` | Larsen S, Sandvik Kristiansen B, Østerås Sandberg N, Bao Fredriksen A, van den Tillaar R, Wolf M, Swinton PA, Nygaard Falch H. The effects of shoulder extension angle on elbow flexor hypertrophy in the cable curl exercise. *Frontiers in physiology*. | 2026 | RCT | [10.3389/fphys.2026.1750722](https://doi.org/10.3389/fphys.2026.1750722) |
| `lee2026` | Chloe X. Y. Lee, Antony J. Crossman, Angela E. Kedgley. The effects of bar positioning, stance width, repetition, and load on muscle activity during the barbell back squat. *PLOS One*. | 2026 | EMG cohort | [10.1371/journal.pone.0354893](https://doi.org/10.1371/journal.pone.0354893) |
| `mitsuya2026` | Hiroku Mitsuya, Koichi Nakazato, Takashi Okada. Region-specific hamstring activation and its dissociation from subjective contraction sensation during leg curl exercise at different hip flexion angles. *BMC Sports Science, Medicine and Rehabilitation*. | 2026 | EMG cohort | [10.1186/s13102-026-01910-7](https://doi.org/10.1186/s13102-026-01910-7) |
| `park2026` | Ju-Hyung Park, Shi Lei, Hwi-Young Cho et al. Effects of Barbell Position and Squat Depth on Trunk and Lower-Extremity Muscle Activation During the Back Squat in Healthy Adult Men. *Medicina*. | 2026 | EMG cohort | [10.3390/medicina62071339](https://doi.org/10.3390/medicina62071339) |
| `pouly2026` | Thibaut Pouly, Alexis Garcia, Aurore Valgalier et al. Effects of grip width and angle on sEMG, joint kinematics and moments during pull-ups. *Sports Biomechanics*. | 2026 | biomechanical | [10.1080/14763141.2026.2743113](https://doi.org/10.1080/14763141.2026.2743113) |
| `uysal2026` | Abdullah Uysal, Batuhan Karaduman, Recep Soslu et al. Effects of grip variation on biceps brachii and brachioradialis electromyographic activity during concentric and eccentric phases of the barbell curl exercise. *BMC Sports Science, Medicine and Rehabilitation*. | 2026 | EMG cohort | [10.1186/s13102-026-01867-7](https://doi.org/10.1186/s13102-026-01867-7) |
