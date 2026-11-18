# muscleBurn — UI/UX Design Specification

| | |
|---|---|
| **Status** | Draft v1.0 — design lane deliverable |
| **Scope** | UI layout, visual system, 3D interaction, side-panel content, responsive + accessibility behavior |
| **Out of scope** | Application code, 3D asset production/sourcing, final exercise/EMG dataset |
| **Stack assumed** | Next.js (App Router) + React Three Fiber / drei, TypeScript, CSS Modules or Tailwind tokens |
| **Related files** | `LICENSE` (AGPL-3.0). No `package.json`, source, or design tokens exist yet in this repository. |

This document is the implementation contract for the interface. Values in it (hex, px, ms, ratios) are normative unless marked *suggested*. Copy shown in `quotes` is the approved UI label.

---

## 1. Product frame and design principles

muscleBurn is an interactive 3D atlas of human musculature. A visitor rotates a model, selects a muscle to read its anatomy, then picks an exercise to see how form variations shift activation across the body. Every claim about activation is tied to a citation.

The interface has one job: **keep the model and the evidence in view at the same time.** Four principles follow from that.

1. **The body stays on stage.** Panels overlay or dock beside the canvas; they never navigate the model away. Selecting, filtering, or changing tabs must not move the camera unless the user asked for it.
2. **Color is an accelerant, never the only signal.** Region color, activation heat, and side are always restated in text or shape. A user who cannot distinguish two hues can still complete every task.
3. **Evidence is one glance away.** A variation's direction, magnitude, and source sit on the same row. A citation chip never dead-ends: it expands to author, year, measure, and DOI.
4. **Motion explains, it does not decorate.** Transitions show where a selection came from. Anything longer than 250 ms is interruptible and disabled under `prefers-reduced-motion`.

### 1.1 Primary user journeys

| Journey | Entry | Success condition |
|---|---|---|
| **Explore** | Land on atlas | Model is interactive within 2.5 s on a mid-range laptop; any muscle reachable by pointer or keyboard in ≤ 3 actions |
| **Identify** | Search or click | Muscle name, region, and side appear in the panel; camera frames the muscle without hiding it behind the panel |
| **Compare form** | Exercises tab → pick exercise | Heatmap + legend visible; top 3 variations readable without scrolling at 1280×800 |
| **Verify** | Citation chip | Full reference, measure type, and DOI resolve in a popover or the About tab |

---

## 2. Layout and information architecture

### 2.1 Structure

```
App shell
├── Header (fixed, 64 px)
│   ├── Brand + build tag
│   ├── Global search (muscles, regions, exercises)  [⌘K / Ctrl K]
│   ├── View preset segmented control (Ant / Post / L / R)
│   ├── Layer popover trigger
│   └── Panel collapse toggle
├── Main
│   ├── 3D stage (fills remaining width)
│   │   ├── Canvas (R3F)
│   │   ├── HTML label layer (occluded)
│   │   ├── Orientation gizmo (bottom-left)
│   │   ├── Heat legend (bottom-left, only in exercise mode)
│   │   ├── Camera dock (bottom-center: zoom −, zoom +, reset, fullscreen)
│   │   └── Layer popover anchor (top-right of stage)
│   └── Side panel (right, 400 px, collapsible)
│       ├── Tabs: Muscle / Exercises / About
│       └── Scrollable tab body
└── Overlays: tooltip, popovers, command palette, toasts, mobile sheet
```

The **Muscle** tab is the default. Clicking a muscle switches to it; choosing an exercise switches to **Exercises**. Tabs never swap the canvas content, only the panel body.

### 2.2 Desktop wireframe (≥ 1280 px)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ◉ muscleBurn           ⌕ Search muscles, regions, exercises      ⌘K   [Ant][Post][L][R]  ⧉ Layers  ▸ │ 64
├───────────────────────────────────────────────────────┬────────────────────────────┤
│                                                       │  Muscle  Exercises  About  │
│  ┌ orientation gizmo                                  │ ────────────────────────── │
│  │  Ant ↗                                              │  Biceps brachii    ● Left  │
│                                                       │  Upper arm · region color  │
│                                                       │                            │
│                   3D  C A N V A S                     │  ORIGIN                    │
│              (drag orbit · wheel zoom)                │  Short head: …             │
│                                                       │  Long head: …              │
│                                                       │                            │
│                                                       │  INSERTION                 │
│                                                       │  Radial tuberosity …       │
│                                                       │                            │
│  ┌ heat legend (exercise mode only)                    │  ACTION                    │
│  │ 0 ─ 25 ─ 50 ─ 75 ─ 100 % MVIC                       │  Elbow flexion, supination │
│  └                                                    │                            │
│                          [ − ] [ + ] [ ⟲ Reset ]      │  INNERVATION               │
│                                        [ ⛶ ]          │  Musculocutaneous n. (C5–C6)│
└───────────────────────────────────────────────────────┴────────────────────────────┘
         ↑ flexible, min 560 px                                  ↑ 400 px (clamp 360–440)
```

Measurements: header 64 px; panel 400 px; stage gutters 24 px around floating controls; canvas dock 16 px from stage edges; panel divider 1 px `--border-subtle`.

### 2.3 Mobile wireframe (< 768 px)

```
┌───────────────────────────────┐
│ ◉ muscleBurn        ⌕    ☰    │ 56  ← ☰ opens layers/menu sheet
├───────────────────────────────┤
│                               │
│                               │
│          3D CANVAS            │  ← full-bleed, camera target biased
│     (one-finger orbit)        │     to upper third while sheet is open
│                               │
│                               │
│  ┌Ant┐                        │
│  └───┘        ( + ) ( − ) (⟲) │  ← 44 px controls, bottom-right
├───────────────────────────────┤
│           ═══════             │  ← sheet handle, 24×4 px
│  Biceps brachii      L ●      │  peek: 96 px
│  Muscle · Exercises · About   │
│  ─────────────────────────    │
│  Origin …                     │  half: 48 vh / full: 88 vh
└───────────────────────────────┘
```

The bottom sheet is the only panel on phones. It has three stops: **peek** (96 px, shows name + tabs), **half** (48 vh, default when content opens), **full** (88 vh, leaves a strip of model visible for context). The canvas never scrolls behind the sheet; vertical gestures on the sheet scroll sheet content, not the camera.

### 2.4 Tablet (768–1279 px)

- 768–1023 px: canvas full width, panel becomes a bottom sheet at 45 vh with the same three tabs. Header compresses preset labels to icons with tooltips.
- 1024–1279 px: panel docks at 360 px but starts collapsed; opening it overlays the canvas with a `rgba(7,10,14,0.35)` scrim on the stage only. The scrim is click-to-dismiss.
- Panel is **collapsible at every breakpoint**, remembers its last state in `localStorage` under `mb.panel`.

### 2.5 Z-index and overlay order

| Layer | z-index | Notes |
|---|---|---|
| Canvas | 0 | `position: sticky` stage wrapper |
| 3D labels | 10 | HTML overlay inside canvas container, `pointer-events: none` except label chips |
| Orientation gizmo / legend | 20 | |
| Stage dock (zoom/reset) | 30 | |
| Side panel / sheet | 40 | |
| Header | 50 | Backdrop blur, 1 px bottom border |
| Popover, layer menu, citation detail | 60 | Focus-trapped |
| Tooltip | 70 | Never focusable |
| Toast | 80 | Bottom-center desktop, above sheet mobile |
| Command palette / modal | 90 | Scrim `rgba(7,10,14,0.72)` |

### 2.6 Content width rules

Panel text measure caps at 62 characters (`max-width: 34em`). Anatomy values wrap, never truncate; long Latin names may wrap to two lines. Exercise variation rows never truncate the effect value. Search results truncate with ellipsis only after three lines are impossible (single-line list, `title` + `aria-label` carry the full string).

---

## 3. Visual style

### 3.1 Theme direction

A dark, clinical-anatomy stage: near-black blue-grey background, bone-ivory skeleton, vivid but desaturated-to-mid muscle tints, thin cool hairlines, and one cyan interaction accent. The model is the brightest object; chrome recedes. No gradients on large surfaces except a subtle radial vignette behind the model to separate it from the void.

### 3.2 Surface tokens

| Token | Value | Use |
|---|---|---|
| `--bg-void` | `#070A0E` | Page behind canvas, vignette outer |
| `--bg-stage` | `#0B0F14` | Canvas clear color / stage |
| `--bg-panel` | `#0F151D` at 88 % + blur | Side panel, sheets |
| `--bg-panel-solid` | `#0F151D` | Fallback without `backdrop-filter` |
| `--bg-raised` | `#151D28` | Cards, variation rows, popovers |
| `--bg-inset` | `#0A0E14` | Inputs, code/DOI fields, wells |
| `--border-subtle` | `rgba(255,255,255,0.07)` | Dividers, panel edge |
| `--border-default` | `rgba(255,255,255,0.12)` | Inputs, secondary buttons |
| `--border-strong` | `rgba(255,255,255,0.20)` | Hover, selected outline |
| `--text-primary` | `#E8EEF6` | Names, values, headings (16.5:1 on void) |
| `--text-secondary` | `#A7B4C6` | Labels, body copy (9.1:1 on void) |
| `--text-muted` | `#7C8A9C` | Metadata, timestamps (5.5:1 on void) |
| `--text-disabled` | `#55606E` | Disabled only (3.0:1; never body copy) |
| `--accent` | `#7FD1FF` | Focus, links, active tab, primary action |
| `--accent-strong` | `#38BDF8` | Pressed state, selection rim |
| `--danger` | `#FF8A8A` | Errors, destructive |
| `--warn` | `#FBBF24` | Data caveats, low-confidence badges |
| `--success` | `#4ADE80` | Resolved citation, saved view |

Contrast pairs were computed with WCAG 2.1 relative luminance. Body and label text must stay ≥ 4.5:1; large text and non-text UI ≥ 3:1. `--text-muted` is approved down to 12 px only on panel and void backgrounds (5.5:1 and 5.5:1 respectively); do not place it on `--bg-raised` without re-checking (≈ 4.3:1).

### 3.3 Region palette (13 regions)

These are the "Color by region" material tints. Each is also the source for its chip: 12 % fill, 1 px border at 40 % alpha, 6 px dot at full color, label text in `--text-primary`. Every dot clears 4.2:1 against `--bg-panel`, so it passes the 3:1 non-text requirement even as a standalone legend swatch.

| # | Region | Hex | Dot vs panel | Example muscles |
|---|---|---|---|---|
| 1 | Head & neck | `#F9A8D4` | 9.8:1 | Sternocleidomastoid, splenius capitis, masseter |
| 2 | Shoulders & deltoids | `#FBBF24` | 10.7:1 | Deltoid (anterior/lateral/posterior), supraspinatus |
| 3 | Chest & pectorals | `#F0454F` | 4.8:1 | Pectoralis major/minor, serratus anterior |
| 4 | Upper back & trapezius | `#3B82F6` | 4.8:1 | Trapezius, rhomboids, latissimus dorsi, teres major |
| 5 | Lower back & erectors | `#38BDF8` | 8.3:1 | Erector spinae, multifidus, quadratus lumborum |
| 6 | Arms (biceps, triceps, forearms) | `#C4B5FD` | 8.9:1 | Biceps brachii, triceps brachii, brachioradialis, flexors |
| 7 | Core & abdominals | `#FDE047` | 13.5:1 | Rectus abdominis, transversus abdominis, diaphragm |
| 8 | Obliques & hip flexors | `#FB923C` | 7.1:1 | External/internal oblique, iliopsoas, rectus femoris (proximal) |
| 9 | Glutes | `#10B981` | 7.0:1 | Gluteus maximus/medius/minimus, piriformis |
| 10 | Quadriceps | `#84CC16` | 9.0:1 | Vastus lateralis/medialis/intermedius, rectus femoris |
| 11 | Hamstrings | `#2DD4BF` | 9.6:1 | Biceps femoris, semitendinosus, semimembranosus |
| 12 | Adductors & deep hip | `#E879F9` | 7.2:1 | Adductor longus/brevis/magnus, gracilis, obturator externus |
| 13 | Calves & feet | `#94A3B8` | 7.0:1 | Gastrocnemius, soleus, tibialis anterior, intrinsic foot muscles |

Rules:
- The palette is a **categorical** scale. Never interpolate between these hues and never use them to encode activation; activation has its own sequential ramp (§ 6.2).
- Hues alone do not identify a region. Chips carry the region name; tooltips and the muscle panel restate it. A "Label all regions" option in Layers renders name chips for every visible muscle at zoom ≥ 1.2×.
- If a fourteenth region is added, extend the table and re-check dot contrast; do not reuse a hue.

### 3.4 Color modes

| Mode | When | Muscle material | Skeleton |
|---|---|---|---|
| **Region** (default) | Browsing, no exercise selected | Region tint, roughness 0.62, emissive at 4 % of tint | Bone `#D9CBB3`, roughness 0.85 |
| **Anatomical** | Toggle in Layers | Base muscle `#B4574F`, subsurface-ish rim `#E08A7A`, veins/edges darkened | Bone `#E4D8C4` |
| **Activation** | Exercise selected | Heat ramp replaces albedo; non-highlighted muscles drop to 32 % opacity of neutral `#4A5568` | Skeleton dims to 55 % opacity |

Only one color mode is active. Selecting an exercise forces **Activation**; clearing the exercise restores the previous mode. The mode control lives in the Layers popover as a radio group, not a fourth tab.

### 3.5 Typography

Self-host via `next/font/local` or Google Fonts with `display: swap`; no layout shift.

| Role | Family | Size / line | Weight | Tracking |
|---|---|---|---|---|
| Display / brand | `"Space Grotesk", "Inter", system-ui, sans-serif` | 18 / 24 | 600 | −0.01em |
| Panel title (muscle name) | `"Inter", system-ui, sans-serif` | 24 / 30 | 650 | −0.015em |
| Section heading | Inter | 13 / 18 | 600 | 0.06em, uppercase |
| Body | Inter | 14 / 22 | 400 | 0 |
| Compact body / rows | Inter | 13 / 19 | 400 | 0 |
| Label / eyebrow | Inter | 11 / 14 | 600 | 0.08em, uppercase |
| Button | Inter | 13 / 16 | 550 | 0.01em |
| Numeric data | `"JetBrains Mono", ui-monospace, monospace` | 13 / 18 | 500 | 0, `font-variant-numeric: tabular-nums` |
| Citation / DOI | JetBrains Mono | 11 / 16 | 400 | 0 |

Rules: minimum text size 11 px, and only for uppercase labels/citations. Never set anatomy values below 13 px. Font weight 650 is expressed via variable font axis; fall back to 600. Line length ≤ 62ch in panel copy. Numbers in effect magnitudes and percentages always use the mono stack to keep columns aligned.

### 3.6 Spacing scale

4 px base: `2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 56, 72`. Named tokens:

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | Icon-to-label, chip inner gap |
| `space-2` | 8 | Row internal gaps, compact stacks |
| `space-3` | 12 | Field vertical rhythm |
| `space-4` | 16 | Card padding (compact), control gaps |
| `space-5` | 20 | Panel horizontal padding |
| `space-6` | 24 | Section separation |
| `space-7` | 32 | Panel top padding, major blocks |
| `space-8` | 40 | Empty-state padding |
| `space-9` | 56 / 72 | Hero and stage gutters |

### 3.7 Radii

| Token | Value | Use |
|---|---|---|
| `radius-xs` | 4 px | Citation chips, tags |
| `radius-sm` | 6 px | Inputs, small buttons |
| `radius-md` | 10 px | Cards, variation rows, popovers |
| `radius-lg` | 14 px | Panel inner cards, sheet top corners |
| `radius-pill` | 999 px | Segmented controls, filter chips, tooltips |
| `radius-circle` | 50 % | Icon buttons, zoom controls |

### 3.8 Elevation, glass, and borders

Glass panel recipe:

```css
background: rgba(15, 21, 29, 0.88);
backdrop-filter: blur(20px) saturate(140%);
border-left: 1px solid rgba(255, 255, 255, 0.07);
box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.04);
```

- `@supports not (backdrop-filter: blur(1px))` → solid `--bg-panel-solid`, no blur.
- `prefers-reduced-transparency: reduce` → solid panel, no blur; keep the shadow.
- Floating controls: `rgba(17,24,35,0.9)`, `radius-circle`, `border: 1px solid var(--border-default)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.4)`.
- Popovers and the command palette: solid `--bg-raised`, 1 px `--border-default`, 20 px shadow, no blur (text clarity over the model).
- Focus rings are never replaced by shadows: `outline: 2px solid var(--accent); outline-offset: 2px`. On light chips, add `box-shadow: 0 0 0 4px rgba(7,10,14,0.8)` beneath the outline so it survives any background.

### 3.9 Iconography and model rendering

- Icons: Lucide, 1.75 px stroke, 16/18/20 px sizes, `currentColor`. No filled icons except the selected tab dot.
- Muscle meshes: `MeshStandardMaterial` or `MeshPhysicalMaterial`, `roughness 0.55–0.7`, `metalness 0`, `clearcoat 0.15`, `envMapIntensity 0.5`. Hover raises emissive intensity to 18 %; selected uses a fresnel rim plus a 1.5 px screen-space outline, not a bloom pass (bloom is reserved for activation ≥ 75 %).
- Lighting: key from upper-front-left (warm 5200 K, intensity 2.2), fill from right (cool 7000 K, 0.8), rim from behind (1.1). A soft contact shadow grounds the figure. No environment that tints muscles green or magenta.
- Background: radial gradient from `#101823` at 30 % behind the thorax to `--bg-void` at the edges; 3 % film grain (static SVG noise) to prevent banding. Grain is disabled under `prefers-reduced-motion` only if animated (it is not).

---

## 4. 3D interaction design

### 4.1 Camera and orbit model

One perspective camera, one orbit target. Default: fov 32°, position derived from a bounding sphere around the model, target at ~52 % of model height (mid-thorax), distance chosen so the figure occupies 78 % of stage height.

| Constraint | Value |
|---|---|
| Orbit | Left-drag / one-finger drag; `rotateSpeed` 0.65; damping 0.075 |
| Pan | Right-drag or two-finger drag; `panSpeed` 0.6; screen-space pan, disabled when zoomed out past 1.4× |
| Zoom | Wheel / trackpad pinch / two-finger pinch; `zoomSpeed` 0.9; clamped 0.55×–2.4× of fit distance |
| Polar limit | 8°–172° (prevents flipping through the poles) |
| Azimuth | Unlimited |
| Auto-rotate | Off by default, available in Layers; disabled entirely under reduced motion |
| Idle | No drifting, no parallax, no pulsing when idle |

**On-demand rendering:** `frameloop="demand"`. Invalidate on pointer move while hovering, on camera change, during tweens, and on layer/material changes. Adaptive DPR between 1 and 2; drop to 0.75 while the camera is moving if frame time exceeds 24 ms for 8 consecutive frames, restore when idle.

### 4.2 Input map

| Action | Pointer (desktop) | Touch | Keyboard (canvas focused) |
|---|---|---|---|
| Rotate | Left drag | One-finger drag | Arrow keys, 15° per press; Shift = 5° |
| Pan | Right drag / middle drag | Two-finger drag | Space + arrows |
| Zoom | Wheel | Pinch | `+` / `-`, or `PageUp` / `PageDown` |
| Select | Click muscle | Tap muscle | `Tab` into muscle list, `Enter` |
| Focus muscle | Double-click | Double-tap | `F` |
| Deselect | Click empty stage / `Esc` | Tap empty stage | `Esc` |
| Reset camera | `R` or dock reset | Dock reset | `R` |
| View presets | Header control or `1`–`4` | Compact preset chip | `1`–`4` |
| Layers | `L` opens popover | `☰` sheet | `L` |
| Command palette | `⌘K` / `Ctrl K` | Search icon | `⌘K` / `Ctrl K` |

Wheel zoom requires no modifier; `Ctrl`+wheel is reserved for browser zoom and must not be captured. Trackpad two-finger scroll pans; pinch zooms. On touch, the canvas calls `touch-action: none` only inside the stage, never on the sheet.

### 4.3 Hover and tooltip

- Raycast on pointer move, throttled to one raycast per animation frame; use a simplified hit proxy (low-poly, invisible) per muscle group, not the render mesh.
- **Hover intent:** 90 ms delay on touch-free pointers before highlight, 0 ms on subsequent muscle-to-muscle moves. Prevents flicker when sweeping across the ribcage.
- Hover style: emissive intensity to 18 % of region color, cursor `pointer`, other muscles unchanged. No scale, no outline.
- Tooltip content: **muscle name** (14/600), region + side (12, secondary), and one line `"Click for details"` (11, muted). Max width 240 px.
- Position: 14 px right and 14 px below the cursor; flip horizontally when within 16 px of the stage's right edge, vertically when near the bottom. Tooltip is `pointer-events: none`, never covers the hovered mesh's centroid.
- Fade in 120 ms / out 80 ms; no delay on exit. Under reduced motion, both are 0 ms.
- On touch, the tooltip is replaced by the bottom sheet peek update; no floating tooltip is shown, because the finger covers it.

### 4.4 Selection and focus

**Click-to-select** is idempotent: clicking an already-selected muscle keeps it selected and re-focuses the camera only if the muscle is off-screen.

- Selected treatment: fresnel rim in `--accent` at 0.9 intensity, 1.5 px screen-space outline, region tint preserved. All other muscles keep their material; global dimming is offered as an "Isolate" toggle in the panel header (default off).
- The panel switches to the **Muscle** tab, scrolls to top, and moves focus to the muscle heading only when selection came from search or the muscle list. Pointer selection does not steal keyboard focus.
- A second click on empty space clears selection but leaves the camera where it is.
- Selection state lives in the URL (`?m=biceps-brachii-l`) so the view is shareable. On load, an unknown slug shows the empty state and a toast: `"That muscle link wasn't found."`
- **Focus animation** (search, list, double-click): compute the selected meshes' bounding sphere, set the orbit target to its centroid, and fit distance using `radius / sin(fov/2)` × 1.6 padding, clamped to the zoom range. If the panel is open on desktop, offset the projected target by half the panel width so the muscle centers in the visible stage. Duration 620 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, no overshoot, interruptible by any pointer-down.
- Reduced motion: cut instantly (0 ms), with a 120 ms crossfade of the selection rim only.

### 4.5 View presets and camera dock

Presets are absolute orientations, not incremental rotations:

| Preset | Azimuth / polar | Framing |
|---|---|---|
| Anterior | 0° / 90° | Full body, arms at 12° abduction |
| Posterior | 180° / 90° | Full body |
| Left | 90° / 90° | Full body |
| Right | 270° / 90° | Full body |

The segmented control in the header shows four icon buttons (front, back, left, right silhouettes) with visible labels at ≥ 1280 px and icon-only with tooltips below. Active preset is `aria-pressed="true"`, filled with `rgba(127,209,255,0.14)` and a 1 px accent border. Rotating manually clears the pressed state but does not change zoom.

Camera dock (bottom-center desktop, bottom-right mobile), 40 px buttons desktop / 44 px mobile, 8 px gaps, pill container:
`[ − Zoom out ] [ + Zoom in ] [ ⟲ Reset view ] [ ⛶ Fullscreen ]`
Zoom steps are 15 % of current distance over 180 ms. Reset returns to the last preset with a 520 ms tween. Reset is disabled while already at the default for the active preset; it is never hidden.

### 4.6 Layers

Layers popover (desktop) / menu sheet (mobile), anchored top-right of the stage on desktop:

| Layer | Default | Behavior |
|---|---|---|
| **Muscles** | On | Master visibility; off leaves skeleton + labels |
| **Skeleton** | On | Bone material; when muscles are isolated via panel, skeleton drops to 30 % |
| **Labels** | Off | HTML chips anchored to muscle centroids; occluded by geometry; fade beyond 3.2 m and beyond 65° obliquity |
| **Skin / X-ray** | Off | Body silhouette at 12 % opacity, `depthWrite: false`, fresnel edges at 10 %; muscles remain fully lit. The control is labeled `"Skin (X-ray)"`, not "X-ray" alone |
| **Color mode** | Region | Radio group: Region / Anatomical / Activation (§ 3.4) |
| **Auto-rotate** | Off | 0.6 rad/s; any pointer-down stops it |

Toggles persist per browser. Turning all of Muscles, Skeleton, and Skin off is impossible: the last enabled structural layer's switch is disabled with the tooltip `"Keep at least one layer visible."`

### 4.7 Search and command palette

- Trigger: header field on desktop, search icon on mobile, `⌘K` / `Ctrl K` anywhere.
- Palette groups: **Muscles**, **Regions**, **Exercises**, then **Recent**. Each row shows name, region dot + region, and side where relevant.
- Typing does substring + diacritic-insensitive matching on name, Latin name, region, and common synonym ("lats" → latissimus dorsi). Results appear after 120 ms; no loading spinner under 300 ms.
- `↑`/`↓` move the active option, `Enter` selects, `Esc` closes and restores focus to the trigger. The active option is announced via `aria-activedescendant`.
- Selecting a muscle focuses it (§ 4.4) and opens the Muscle tab. Selecting an exercise opens Exercises, scrolls the exercise into view, and applies the heatmap.
- Empty query shows recent items (max 5); zero results shows `"No matches for “<query>”."` plus `"Try a region like “hamstrings”."` and a clear action.

### 4.8 Loading, empty, and failure states

| State | Presentation |
|---|---|
| **Boot / model load** | Stage shows a wireframe torso placeholder at 20 % opacity plus a 2 px progress bar labeled `"Loading model… 42%"`. Values come from `THREE.DefaultLoadingManager`. The panel shows skeleton rows (not spinners) with a shimmer disabled under reduced motion. |
| **Slow load (> 8 s)** | Secondary line: `"Still loading. Check your connection."` No modal. |
| **No selection** | Panel: `"No muscle selected"` (18/600), `"Click a muscle on the model, or search to jump to one."`, plus a search button. Canvas remains fully interactive; no overlay. |
| **No exercise selected** | Exercises tab shows the picker and a short list of suggested exercises; legend is hidden. |
| **WebGL unavailable** | Stage replaces canvas with a static 2D anterior/posterior illustration (same region palette, SVG) and the note `"3D view isn't available on this device. Showing the 2D atlas."` All panel content and exercise data remain functional. |
| **Context lost** | Non-blocking banner: `"The 3D view paused and is restoring…"` Auto-restore up to 2 attempts; then `"Reload the 3D view"` button. |
| **Asset error** | `"The model couldn't load."` + `"Retry"` and `"Use 2D atlas"`. Panel data still works. |
| **Offline** | Header status chip `"Offline"`; cached model and data remain usable; citation links show `"Opens when you're back online."` |

### 4.9 Performance guardrails

- Budget: ≤ 120k triangles visible at rest, ≤ 250 draw calls, ≤ 6 MB compressed model payload (Draco + KTX2), first interactive canvas ≤ 2.5 s on a mid-range 2022 laptop at 1080p.
- Preload the anterior model only; posterior/other meshes stream after first idle. Never block input on a secondary mesh.
- Suspend the render loop when the stage is off-screen (IntersectionObserver) or the tab is hidden.
- On mobile, lower shadow map to 512, disable clearcoat, cap DPR at 1.75.

---

## 5. Muscle information panel

### 5.1 Structure

The **Muscle** tab is a single scroll column with a sticky header block. Nothing in it is collapsible by default; references may collapse on mobile after the first three entries.

```
┌────────────────────────────────────────────┐
│  Biceps brachii                    ● Left  │  name 24/650 · side badge
│  ● Arms · Upper arm                        │  region chip + subregion
│  ────────────────────────────────────────  │
│  [ Isolate ]  [ Focus ]        [ ⋯ More ]  │  action row (optional)
│                                            │
│  ORIGIN                                    │  section label 11/600
│  Short head: apex of the coracoid process  │
│  Long head: supraglenoid tubercle          │
│                                            │
│  INSERTION                                 │
│  Radial tuberosity and bicipital aponeurosis│
│                                            │
│  ACTION                                    │
│  Elbow flexion; forearm supination;         │
│  weak shoulder flexion                     │
│                                            │
│  INNERVATION                               │
│  Musculocutaneous nerve (C5–C6)            │
│                                            │
│  ASSOCIATED EXERCISES                  (5) │
│  ┌ Biceps curl · Dumbbell        +18% ▲ ┐  │
│  ┌ Chin-up                        +12% ▲ ┐│
│  ┌ Incline curl                    +9% ▲ ┐│
│  └ View all exercises                   →  │
│                                            │
│  REFERENCES                                │
│  [1] Author (Year). Title. Journal.  DOI ↗ │
│  [2] …                                     │
│  How activation is measured  ⓘ             │
└────────────────────────────────────────────┘
```

### 5.2 Content hierarchy

| Order | Element | Style | Notes |
|---|---|---|---|
| 1 | Muscle name + side | 24/30, 650, primary | `<h2>`, receives programmatic focus after search selection |
| 2 | Region chip | 12/16, dot + region name | Tapping/clicking filters the Exercise tab by that region |
| 3 | Subregion / Latin name | 13/18, muted | `"Latin: Musculus biceps brachii"` shown only if different from display name |
| 4 | Action row | 32 px buttons, text or icon+text | **Focus** re-frames camera; **Isolate** dims others; **More** contains "Copy link", "View in 2D atlas" |
| 5 | Origin | Section label + 14/22 body | Multiple heads as a `<dl>` or bulleted list, max 3 bullets before wrapping |
| 6 | Insertion | Same | |
| 7 | Action | Same | Semicolon-separated, one action per line on mobile |
| 8 | Innervation | Same | Nerve + root levels; root levels in mono |
| 9 | Associated exercises | Compact rows with activation bar | Ordered by activation for this muscle, descending; max 5 + "View all" |
| 10 | References | Numbered list, mono DOI | Collapsed to 3 on mobile; "Show all N" |
| 11 | Method note | 11/16 muted, link | `"How activation is measured"` opens a short definition sheet |

Missing data is stated, never omitted silently: `"Origin not yet documented for this muscle."` (13, muted, italic). Do not render empty sections with blank values.

### 5.3 Associated exercise rows

Each row is a link to the exercise in the Exercises tab:

```
Biceps curl · Dumbbell                 +18% ▲
███████████████░░░░░░░░░░  62% MVIC   [1][3]
```

- Name 13/500 primary; variation/equipment 12 muted after a middle dot.
- Activation value right-aligned in mono, signed for variation context or plain `% MVIC` for absolute activation. On this panel, show **absolute activation** for the exercise's reference condition, plus a direction badge for the current exercise's variation if one is active.
- Bar: 4 px tall, radius-pill, width = %MVIC, fill uses the heat ramp stop at that value; track `rgba(255,255,255,0.06)`. Bar is `aria-hidden`; the text carries the value.
- Citation chips are 18 px tall, mono 11, `[1]`, max 3 visible + `+2`.

### 5.4 References and citation detail

Inline reference row: `[1] Author(s) (Year). Title. Journal. DOI` with the DOI as a link. Chip numbers correspond to the exercise dataset's reference list. Clicking a chip (or the row) opens a popover, not a new page:

```
┌──────────────────────────────────────────┐
│ [1]  Surface EMG during biceps curl      │
│      variations in resistance-trained    │
│      adults                              │
│      Author A, Author B (2021)           │
│      J Electromyogr Kinesiol 31(4):102–9 │
│      DOI 10.xxxx/xxxxx  ↗                │
│      Measure: surface EMG, %MVIC         │
│      Population: n = 24, trained males   │
│      Evidence: moderate                  │
└──────────────────────────────────────────┘
```

Rules:
- The chip is a `<button>` with `aria-expanded`; the popover is focus-trapped, `Esc` closes, focus returns to the chip.
- Every citation must resolve to a real DOI/PMID. If a source has no DOI, show PMID or ISBN and label it `"Print source"`.
- No citation is rendered as decorative superscript without a target. If a claim has no source, it is not shown as a claim; use `"Not yet cited"` in muted text.
- The method note explains %MVIC in one sentence and states that values are group means, not individual prescriptions.

### 5.5 Muscle panel states

| State | Content |
|---|---|
| **Empty** | Heading `"No muscle selected"`, body `"Click a muscle on the model, or search to jump to one."`, primary button `"Search muscles"` |
| **Loading** | Six skeleton rows matching final line heights; aria-busy on the panel |
| **Not found (bad URL slug)** | `"We couldn't find that muscle."` + `"Open the atlas"` |
| **Partial data** | Per-section placeholder sentence (§ 5.2), reference block still renders |
| **Isolated mode active** | Persistent chip under the action row: `"Isolating Biceps brachii"` with `"Show all"` |
| **Mobile** | Side badge moves next to the name; action row becomes three 44 px icon buttons with accessible names; associated rows wrap value under name |

---

## 6. Exercise panel

### 6.1 Structure

```
┌────────────────────────────────────────────┐
│  EXERCISE                                  │
│  [ Biceps curl · Dumbbell            ▾ ]   │  picker (combobox)
│                                            │
│  REGION FILTER                             │
│  (All) (Arms) (Chest) (Back) (Core) …      │  horizontal chip scroller
│                                            │
│  ── Activation ──────────────────────────  │
│  Biceps brachii          62% MVIC  ██████  │
│  Brachialis              48% MVIC  ████    │
│                                            │
│  LEGEND   0 ░░░▓▓▓▓████ 100 % MVIC         │
│           low   moderate   high            │
│                                            │
│  VARIATIONS (6)              Sort: Effect ▾│
│  ┌ Incline curl              +18% ▲      ┐ │
│  │ Elbow behind torso · [1][3] · moderate │ │
│  └────────────────────────────────────────┘ │
│  ┌ Preacher curl             −9% ▼        ┐ │
│  └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

Panel order is fixed: picker → region filter → selected-exercise summary → legend → variations. The summary is capped at the top three muscles by activation; the full list is available in the accessible table and via `"All activated muscles"`.

### 6.2 Activation heat-map

**Ramp** (sequential, monotonic in luminance, blue-violet → ember → pale amber). Applied to muscle albedo, with base roughness unchanged. Low end is deliberately dark so uninvolved muscles recede into the stage.

| Stop | % MVIC | Hex |
|---|---|---|
| 0 | 8 | `#2A1746` |
| 1 | 25 | `#6A1E6E` |
| 2 | 45 | `#B3325B` |
| 3 | 65 | `#E75B3A` |
| 4 | 82 | `#F79E2B` |
| 5 | 100 | `#FFE08A` |

- Interpolate in OKLab, clamp at the stops, and **do not** apply tone mapping that shifts hue; set `toneMapped: false` on the ramp-driven emissive or verify against the render.
- Below 8 % MVIC: no heat tint; muscle renders neutral `#4A5568` at 32 % opacity. This is the "not highlighted" state, not a zero.
- Muscles above 75 % receive a 0.15 emissive lift and, only if `prefers-reduced-motion` is not set, a 1.8 s breathing pulse at ±4 % intensity. The pulse stops after 6 s to avoid distraction.
- Legend: 180 px wide bar desktop / full-width mobile, 8 px tall, radius-pill, 1 px inset border `rgba(255,255,255,0.18)` (required because the first stop is 1.2:1 against the page). Ticks at 0/25/50/75/100 with labels below in 11/14 mono. Qualitative labels above: `Low`, `Moderate`, `High`. Caption: `"Activation as % of maximum voluntary isometric contraction. Group means."`
- The legend never encodes via hue alone: numeric ticks, and the summary list repeats values numerically. A `"Show values on model"` option in Layers renders small `%` chips for the top five muscles.
- Toggling exercise clears the previous heat in one frame; no crossfade longer than 200 ms.

### 6.3 Picker and filters

- **Picker** is a searchable combobox grouped by body region, showing `"Biceps curl · Dumbbell"`, equipment, and a small difficulty tag. It is not a native `<select>`; it supports type-ahead, arrows, and `Esc`.
- **Region filter** is a horizontally scrollable chip row with `(All)` first. Multi-select is allowed; the count appears in the variations heading: `"Variations (4) · Arms, Back"`. Overflow chips are reachable by scroll, not hidden in a menu; on desktop the row wraps.
- Filtering narrows the **variation list and summary**, never the 3D model's visible muscles. Filter chips show a selected state (`accent` border, 14 % fill) and a check icon for screen readers.
- A `"Clear filters"` text button appears only when a filter is active.
- If a filter yields zero exercises, show: `"No exercises match those regions."` + `"Clear filters"`.

### 6.4 Variation rows

Each row answers four questions in order: **what changed**, **which muscles**, **how much**, **how sure**.

```
┌──────────────────────────────────────────────────────────┐
│  Incline curl                                    +18% ▲  │
│  Bench angle 45–60° · targets Biceps brachii (long head) │
│  ████████████████░░░░  vs flat curl        [1] [3]  ⊕   │
└──────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Variation name | 14/600 primary; full text wraps, never truncated |
| Mechanism line | 12/17 secondary; one sentence, max 2 lines, e.g. `"Shoulder extended behind torso"` |
| Target muscles | Up to 2 names + `+N`; each with region dot |
| Direction badge | `▲` increase, `▼` decrease, `●` no meaningful change; text label adjacent for SR (`"increase"`) |
| Magnitude | Mono 13/500, signed %, e.g. `+18%`; relative to the reference variation named in the row |
| Diverging bar | Centered at zero; positive extends right in `#F79E2B`, negative left in `#38BDF8`; track 6 px; scale clamped to ±40 % with `›` marker beyond; value always printed |
| Citation chips | `[1] [3]`, max 3, each a button opening the citation popover; `+1` opens the full list |
| Expand | Chevron toggles detail: study count, population, measure, confidence interval, and a 1-line interpretation |
| Row state | Hover `--bg-raised`; selected (linked to model focus) left border 2 px accent; focus ring wraps the whole row |

Magnitude semantics (must be stated in the UI, not only docs): `"Magnitude is the reported change in activation versus the reference variation. Differences below 5% or within the reported confidence interval are shown as no meaningful change (●)."` Never use the word "proven".

**Sorting:** `Effect (largest)` default, `Evidence (strongest)`, `A–Z`. Sorting is announced with `aria-live="polite"` as `"Sorted by effect size, largest first."`

**Evidence badge:** `High` / `Moderate` / `Low` with a 2 px underline in success/warn/danger-neutral (low uses `--text-muted`, not red, to avoid implying error). Tooltip defines the grading in one sentence. A `"Why this grade?"` link opens the method sheet.

### 6.5 Exercise panel states

| State | Content |
|---|---|
| **No exercise** | Intro line `"Pick an exercise to see which muscles it works and how form changes the demand."` + picker + 4 suggested exercise rows |
| **Loading variation data** | Summary and three row skeletons; model keeps the last heatmap dimmed to 60 % until data resolves, then swaps |
| **No variations documented** | `"No form variations are documented for this exercise yet."` + `"Suggest a study"` mailto/link |
| **Filtered empty** | `"No exercises match those regions."` + `"Clear filters"` |
| **Data warning** | Inline banner above list: `"Some values come from small samples (n < 12)."` with filter toggle `"Hide low-confidence rows"` |
| **Error** | `"Activation data didn't load."` + `"Retry"`; model falls back to region colors; rest of the panel remains usable |

---

## 7. Responsive behavior

### 7.1 Breakpoints

| Name | Range | Panel | Header | Canvas controls |
|---|---|---|---|---|
| `xs` | 320–479 | Bottom sheet, full width | 56 px, brand + search icon + menu | Vertical 44 px stack, bottom-right |
| `sm` | 480–767 | Bottom sheet, full width | 56 px, brand + search icon + menu | Horizontal 44 px dock, bottom-right |
| `md` | 768–1023 | Bottom sheet 45 vh, collapsible | 60 px, presets icon-only | Horizontal dock, bottom-center |
| `lg` | 1024–1279 | Overlay panel 360 px, starts collapsed | 64 px, presets icon-only | Dock bottom-center |
| `xl` | 1280–1535 | Docked 400 px | 64 px, presets with labels | Dock bottom-center |
| `2xl` | ≥ 1536 | Docked 440 px, stage max 1440 px | 64 px | Dock bottom-center, legend expands |

Layout switches on container width where possible (`@container stage (min-width: 900px)`) so an embedded atlas behaves correctly. The panel's own width is `clamp(360px, 30vw, 440px)` at `lg+`.

### 7.2 Mobile bottom sheet

- Stops: peek **96 px**, half **48 vh**, full **88 vh** (`dvh`, with `env(safe-area-inset-bottom)` padding). Default on load: peek. Selecting a muscle or switching to a content tab: half. Dragging the handle up: full.
- Implementation: CSS transform on a fixed sheet; drag handled by pointer events on the handle and the header, not the scroll area. Velocity threshold 0.35 px/ms snaps to the next stop; otherwise spring back (stiffness 420, damping 38). Reduced motion: snap without spring.
- The sheet's scroll container has `overscroll-behavior: contain`; canvas gestures never leak into the sheet.
- When the sheet is at half or full, the camera target is biased upward by `sheetHeight / stageHeight × 50 %` so the selected muscle stays in the visible strip. This is a camera offset only; zoom does not change.
- Sheet has a visible drag handle (24×4 px, `rgba(255,255,255,0.28)`), a 44 px header row, and a close/collapse chevron. Tabs are 48 px tall, sticky at the top of the sheet body.
- Back button / `Esc` collapses full → half → peek before leaving the page.

### 7.3 Touch gestures

| Gesture | Result |
|---|---|
| One-finger drag on stage | Orbit |
| Two-finger drag | Pan |
| Pinch | Zoom, anchored at gesture midpoint |
| Tap muscle | Select + open sheet to half |
| Double-tap muscle | Focus camera |
| Tap empty stage | Deselect, collapse tooltip |
| Long-press (450 ms) | Same as tap-select; no context menu |
| Swipe on sheet handle | Resize sheet |
| Swipe horizontally on filter chips | Scroll chips; never changes tabs |

- `touch-action: none` on the canvas only. Buttons use `touch-action: manipulation`.
- Two-finger gestures must not trigger browser zoom inside the stage; the stage prevents default on `gesturestart` where supported.
- Hit targets: minimum 44×44 px with 8 px spacing. Muscle hit proxies inflate by ~4 px at mobile zoom to compensate for finger occlusion.
- Haptics: `navigator.vibrate(8)` on selection, only if the user has not enabled reduced motion. Never on hover (no hover).

### 7.4 Mobile-specific layout rules

- Header shows only brand, search icon, and `☰`. The menu sheet contains view presets, layers, color mode, and the About link.
- Legend sits directly above the sheet in a compact 56 px bar; tapping it expands to the full legend with the method note.
- Citation popovers become full-width sheets above the bottom sheet, `max-height: 70dvh`.
- Do not use hover-only affordances; every tooltip has a tap/selection equivalent.
- Landscape phone (< 480 px height): sheet defaults to peek, legend collapses to a single line, and the camera dock moves to the left edge to avoid the notch.

### 7.5 Zoom and large text

At 200 % browser zoom the layout must not clip. The panel becomes an overlay at `lg` effective width, the header wraps to two rows or hides presets into a menu, and the canvas min-height is 320 px. Text uses `rem` so user font scaling applies; controls grow with `min-height: 44px`. No `maximum-scale=1` in the viewport meta.

---

## 8. Accessibility

Target: **WCAG 2.2 AA**, with the 3D stage treated as a single composite widget that has a complete non-visual equivalent.

### 8.1 Keyboard model

Tab order: skip link → brand → search → view presets → layers → panel toggle → stage (one stop) → panel tabs → panel content → canvas dock. The stage is `tabindex="0"` with `role="application"` and `aria-label="3D muscle atlas"`; its keyboard commands are listed in § 4.2 and exposed via `aria-describedby` to a short hidden instruction block.

- Arrow keys rotate; `+`/`-` zoom; `1`–`4` presets; `R` reset; `L` layers; `F` focus selected; `Esc` deselect/close.
- `Tab` never moves between individual muscles on the canvas (that would create 600 tab stops). Instead, `M` opens the **Muscle list** dialog: a searchable, alphabetical listbox of all muscles with region and side. Selecting a row selects and focuses the muscle.
- The muscle list is also reachable from the Muscle tab's empty state and the header search.
- All popovers trap focus, restore focus on close, and close on `Esc`. Tooltips are not focusable and never contain interactive content.
- Skip link copy: `"Skip to muscle details"` jumps to the panel heading; a second link `"Skip to 3D controls"` is provided.

### 8.2 Screen-reader equivalent for the 3D view

The canvas alone is not announced. Adjacent to it:

1. A polite live region (`aria-live="polite"`, `role="status"`) announces selection and view changes: `"Selected Biceps brachii, left. Region: Arms. 62% activation in Biceps curl."`
2. A visually hidden (not `display:none`) `<section aria-labelledby="atlas-summary">` contains:
   - A one-paragraph summary updated on state change: `"3D model, anterior view. 42 muscles visible. Exercise: Biceps curl. 6 muscles highlighted, highest: Biceps brachii at 62% MVIC."`
   - A `<table>` of visible muscles with columns **Muscle, Region, Side, Activation (% MVIC)** for the current exercise, sorted by activation. This table is the data equivalent of the heatmap and is the primary path for screen-reader users.
   - A link `"Download this table (CSV)"` for low-vision and research use.
3. `<figure>`/`<figcaption>` wraps the stage only if it does not trap interactive controls; otherwise use `role="group"` + `aria-labelledby`. Never put `aria-hidden="true"` on a container that includes focusable controls.

The accessible table updates only when the exercise or filters change, and is debounced 300 ms to avoid live-region chatter during rapid selection.

### 8.3 Names, roles, and states

- Icon-only buttons require `aria-label` + `title`. Examples: `"Zoom in"`, `"Zoom out"`, `"Reset view"`, `"Toggle layers"`, `"Collapse details panel"`.
- View preset group: `role="group" aria-label="Camera view"`, each button `aria-pressed`.
- Layer toggles: `role="switch"` with `aria-checked`; the color-mode control is a `radiogroup`.
- Tabs follow the WAI-ARIA tabs pattern: `role="tablist"`, arrow-key navigation, `aria-controls`, `aria-selected`, and `tabindex="-1"` on inactive tabs. The panel body is `role="tabpanel"` with `tabindex="0"`.
- Section labels are real headings (`h3`), not styled divs. The muscle name is the only `h2` in the panel.
- Every heat value includes text (`62% MVIC`); color swatches are `aria-hidden`. Direction badges use visually hidden words.
- Form controls have persistent visible labels, not placeholder-only labels. Errors use `aria-describedby` + `aria-invalid`.

### 8.4 Contrast and color

| Pair | Ratio | Verdict |
|---|---|---|
| `--text-primary` on `--bg-stage` | 16.5:1 | AAA |
| `--text-secondary` on `--bg-stage` | 9.1:1 | AAA |
| `--text-muted` on `--bg-stage` | 5.5:1 | AA |
| `--accent` on `--bg-stage` | 11.4:1 | AAA |
| `--danger` on `--bg-stage` | 8.5:1 | AAA |
| Region dot on panel bg (lowest: chest 4.8:1) | ≥ 4.8:1 | Passes 3:1 non-text |
| Heat stop 0 on panel (`#2A1746`) | 1.2:1 | Decorative only; legend adds a 1 px `rgba(255,255,255,0.18)` border and numeric ticks. Never used as text. |

Rules: no text over the 3D model except tooltips, which sit on a solid `rgba(10,14,20,0.96)` background. Disabled controls are exempt from contrast but must remain identifiable by shape and label. Focus indicator (`#7FD1FF`, 2 px) is ≥ 9:1 against both stage and panel surfaces.

**Color-vision deficiency:** region color is redundant with the region name in every chip, tooltip, row, and the accessible table. Activation is redundant with the numeric % and the ordered list. Provide a Layers option `"Region labels on model"` and a `"Pattern fills"` toggle (45° hatch overlay at 8 % opacity per activation band) for users who request it. Never encode increase/decrease with red/green alone; use amber/blue plus arrow plus word.

### 8.5 Motion, transparency, and forced colors

```css
@media (prefers-reduced-motion: reduce) {
  /* camera tweens 0 ms, sheet springs snap, tooltips 0 ms,
     no auto-rotate, no breathing pulse, no stagger animations */
}
@media (prefers-reduced-transparency: reduce) { /* solid panels */ }
@media (prefers-contrast: more) {
  /* panel bg 0.98 alpha, borders 0.24, text-secondary -> #C9D4E2,
     disable glass blur, heat legend border 0.5 alpha */
}
@media (forced-colors: active) {
  /* system colors for controls; canvas keeps its render but
     region chips gain 1px CanvasText borders; focus uses Highlight */
}
```

No animation may run longer than 5 s or loop indefinitely. The activation breathing pulse is capped at 6 s and suppressed under reduced motion. Loading shimmer is suppressed under reduced motion (static skeleton).

### 8.6 Input and targeting

All interactive elements are operable by keyboard and by pointer; no drag-only function lacks a button equivalent (orbit has arrow keys, zoom has buttons, sheet has expand/collapse buttons). Touch targets ≥ 44×44 px; desktop icon buttons 40×40 px with 8 px separation. The stage does not capture `Esc` when a popover is open. No timed interactions.

---

## 9. State and feedback

### 9.1 Interaction states

| State | Visual rule |
|---|---|
| **Rest** | `--bg-raised` rows, `--border-subtle` |
| **Hover** | Background lightens one step (`#1A2431`), border `--border-default`; 120 ms ease-out. No movement on hover |
| **Active / pressed** | Scale 0.985 for buttons only; background `#0B1017`; 80 ms |
| **Focus-visible** | 2 px `--accent` outline, 2 px offset, plus dark under-ring; never suppressed |
| **Selected** | 2 px left accent bar on rows; `aria-selected`/`aria-pressed`; region dot grows 6→8 px |
| **Disabled** | 45 % opacity, `cursor: not-allowed`, no hover change; tooltip explains why when the reason is not obvious |
| **Loading** | Skeleton rows at final dimensions; no layout shift; `aria-busy="true"` on the region |
| **Error** | Inline message with icon + `--danger` text; retry action adjacent |

### 9.2 Motion tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-instant` | 0 ms | — | Reduced-motion replacement |
| `motion-fast` | 120 ms | `cubic-bezier(0.2, 0, 0, 1)` | Hover, tooltip fade, chip |
| `motion-base` | 180 ms | `cubic-bezier(0.2, 0, 0, 1)` | Panel slide, tab underline, toast |
| `motion-slow` | 240 ms | `cubic-bezier(0.2, 0, 0, 1)` | Sheet snap, popover |
| `motion-camera` | 620 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Focus/preset camera |
| `motion-sheet` | spring 420/38 | — | Drag release only |

Only `transform` and `opacity` animate on the DOM. The panel does not animate width; it translates. Camera tweens are interruptible by pointer-down and never queue.

### 9.3 Feedback and persistence

- **Toasts:** bottom-center desktop, above the sheet on mobile, max 1 visible, auto-dismiss 4 s, dismiss button, `role="status"`. Copy: `"Link copied."`, `"View saved."`, `"That muscle link wasn't found."`
- **Persistence:** panel open state, last view preset, layer toggles, color mode, and region filter persist in `localStorage` (`mb.*` namespace). The selected muscle and exercise live in the URL, which wins over storage on load.
- **URL contract:** `?m=<muscle-slug>&e=<exercise-slug>&v=<variation-slug>&view=anterior`. Unknown values degrade to the nearest valid state and show a non-blocking notice.
- **Unsaved state:** none. The app has no destructive actions, so no confirmation dialogs except `"Clear all filters"` (undo toast, no modal).

### 9.4 Error copy rules

Errors say what happened, what still works, and what to do next. No error codes in the primary line. `"The model couldn't load. The anatomy text and exercises are still available."` with `Retry` and `Use 2D atlas`. Never blame the user. Never show a stack trace.

---

## 10. Implementation notes

### 10.1 Suggested component map

```
components/
  AppShell.tsx            header, panel, stage grid
  Header.tsx              brand, SearchTrigger, ViewPresets, LayerMenu
  Stage.tsx               Canvas, Suspense, camera rig, SuspenseFallback
  Scene/
    BodyModel.tsx         meshes, materials, useCursor, raycast proxies
    CameraRig.tsx         OrbitControls + tween controller
    Heatmap.tsx           material ramp, legend state bridge
    Labels.tsx            drei <Html occlude> chips
    Fallback2D.tsx        SVG atlas
  Panel/
    SidePanel.tsx         tabs, focus management, responsive sheet
    MuscleTab.tsx
    ExerciseTab.tsx
    AboutTab.tsx
  primitives/             Chip, Toggle, Combobox, CitationChip, HeatLegend, Toast
```

### 10.2 Data contracts (design-level)

```ts
type Side = "left" | "right" | "bilateral";
type RegionId =
  | "head-neck" | "shoulders" | "chest" | "upper-back" | "lower-back"
  | "arms" | "core" | "obliques" | "glutes" | "quads" | "hamstrings"
  | "adductors" | "calves";

interface Muscle {
  id: string; slug: string; name: string; latin?: string;
  region: RegionId; subregion?: string; side: Side;
  origin: string[]; insertion: string[]; actions: string[];
  innervation: { nerve: string; roots: string[] };
  meshIds: string[];            // maps to GLB node names
  exerciseRefs: { exerciseId: string; activationPctMvic: number; citations: string[] }[];
}

interface Variation {
  id: string; exerciseId: string; name: string;
  mechanism: string;            // one sentence, max ~90 chars
  targets: { muscleId: string; direction: "up" | "down" | "none"; deltaPct: number }[];
  referenceVariationId: string;
  evidence: "high" | "moderate" | "low";
  citations: string[]; sampleSize?: number; measure: "surface-emg" | "fine-wire-emg" | "other";
}

interface Citation {
  id: string; authors: string; year: number; title: string;
  journal?: string; doi?: string; pmid?: string; isbn?: string;
  measure?: string; population?: string; evidence?: "high" | "moderate" | "low";
}
```

Mesh node names must be stable and documented in `docs/mesh-map.md`; the design assumes each selectable muscle is one named group with optional sub-meshes. If a GLB merges muscles, add invisible hit proxies and keep `meshIds` as a list.

### 10.3 R3F specifics that protect the design

- Use `useCursor` / explicit `document.body.style.cursor` only while hovering; reset on unmount.
- `OrbitControls` with `enableDamping`, `makeDefault`; drive camera tweens through a single rig that temporarily disables controls, then re-syncs `controls.target`.
- `<Html occlude="blending">` for labels; set `zIndexRange={[20, 0]}` so labels sit below chrome.
- Raycast against `scene.getObjectByName` proxies; keep a `Map<Intersection, Muscle>` resolved once per model load.
- All materials cloned per muscle; dispose clones on unmount. Do not mutate shared materials for hover.
- Keep heat ramp in one module (`lib/heat.ts`) shared by 3D material and CSS legend so they cannot drift. Export the stop array and a `sampleHeat(pct)` function.
- Use `useReducedMotion` (drei) and a `useMediaQuery` hook that subscribes to changes, not a one-time read.

### 10.4 Design QA checklist

**Layout**
- [ ] 1280×800: canvas ≥ 560 px wide, panel 400 px, no horizontal scroll.
- [ ] 1024×768: panel overlays with scrim; canvas still orbitable with panel open.
- [ ] 390×844: sheet stops at 96/48vh/88vh; selected muscle visible above sheet.
- [ ] 320 px width: no clipped chips or buttons; header does not wrap awkwardly.

**Visual**
- [ ] All 13 region colors match § 3.3 and are not reused for activation.
- [ ] Text tokens meet the ratios in § 8.4 on their actual surfaces.
- [ ] Focus ring visible on every interactive element, including inside the sheet.
- [ ] Glass panels have solid fallbacks.

**3D**
- [ ] Hover does not flicker when sweeping across the torso.
- [ ] Selecting via search frames the muscle in the visible stage area (accounting for panel/sheet).
- [ ] Camera tween is interruptible; reduced motion cuts instantly.
- [ ] Layer toggles cannot hide every structural layer.
- [ ] Losing WebGL shows the 2D fallback and all panel data remains usable.

**Content**
- [ ] Every variation row shows direction, magnitude, citation, and evidence.
- [ ] Citation popovers expose measure, population, and a resolvable DOI/PMID.
- [ ] Missing anatomy data is stated explicitly; no blank fields.
- [ ] Heat legend includes numeric ticks and the %MVIC definition.

**Accessibility**
- [ ] Keyboard-only path: search → select → read origin → switch to Exercises → open citation.
- [ ] Screen reader announces selection and exposes the activation table.
- [ ] 200 % zoom and 200 % text size without clipping.
- [ ] Reduced motion, reduced transparency, and forced colors verified.
