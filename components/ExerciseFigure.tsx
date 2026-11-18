'use client';

// Original 2D line-art exercise schematic: a sagittal stick figure driven by
// joint angles (see src/data/exercisePoses.ts). No third-party artwork is used;
// the drawing is generated from the poses at run time, so it inherits the
// project licence.

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import {
  getExerciseAnimation,
  type ExerciseAnimation,
  type Pose,
} from '@/data/exercisePoses';

/* ------------------------------- geometry -------------------------------- */

const SEG = {
  torso: 0.3,
  neck: 0.075,
  headOffset: 0.14,
  headRadius: 0.056,
  upperArm: 0.18,
  foreArm: 0.17,
  thigh: 0.245,
  shank: 0.245,
  foot: 0.095,
} as const;

const VB_W = 260;
const VB_H = 210;
const PAD_X = 22;
const PAD_TOP = 16;
const PAD_BOTTOM = 30;
const FLOOR_Y = VB_H - PAD_BOTTOM + 8;
const BENCH_Y = VB_H - 64;
const BAR_Y = 36;

const MOVE_MS = 2200;
const HOLD_MS = 240;
const CYCLE_MS = MOVE_MS * 2 + HOLD_MS * 2;

interface Pt {
  x: number;
  y: number;
}

const RAD = Math.PI / 180;

/** Direction for an angle measured from straight down (+ = toward the front). */
const down = (deg: number): Pt => ({ x: Math.sin(deg * RAD), y: Math.cos(deg * RAD) });
/** Direction for an angle measured from straight up (+ = toward the front). */
const up = (deg: number): Pt => ({ x: Math.sin(deg * RAD), y: -Math.cos(deg * RAD) });

const along = (origin: Pt, direction: Pt, length: number): Pt => ({
  x: origin.x + direction.x * length,
  y: origin.y + direction.y * length,
});

interface Skeleton {
  pelvis: Pt;
  chest: Pt;
  head: Pt;
  kneeL: Pt;
  ankleL: Pt;
  toeL: Pt;
  kneeR: Pt;
  ankleR: Pt;
  toeR: Pt;
  elbowL: Pt;
  wristL: Pt;
  elbowR: Pt;
  wristR: Pt;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function skeleton(pose: Pose): Skeleton {
  const pelvis: Pt = { x: 0, y: 0 };
  const chest = along(pelvis, up(pose.trunk), SEG.torso);
  const head = along(chest, up(pose.neck), SEG.headOffset);
  const kneeL = along(pelvis, down(pose.hipL), SEG.thigh);
  const ankleL = along(kneeL, down(pose.kneeL), SEG.shank);
  const toeL = along(ankleL, down(pose.ankleL), SEG.foot);
  const kneeR = along(pelvis, down(pose.hipR), SEG.thigh);
  const ankleR = along(kneeR, down(pose.kneeR), SEG.shank);
  const toeR = along(ankleR, down(pose.ankleR), SEG.foot);
  const elbowL = along(chest, down(pose.shoulderL), SEG.upperArm);
  const wristL = along(elbowL, down(pose.elbowL), SEG.foreArm);
  const elbowR = along(chest, down(pose.shoulderR), SEG.upperArm);
  const wristR = along(elbowR, down(pose.elbowR), SEG.foreArm);

  const points = [
    pelvis,
    chest,
    head,
    kneeL,
    ankleL,
    toeL,
    kneeR,
    ankleR,
    toeR,
    elbowL,
    wristL,
    elbowR,
    wristR,
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    pelvis,
    chest,
    head,
    kneeL,
    ankleL,
    toeL,
    kneeR,
    ankleR,
    toeR,
    elbowL,
    wristL,
    elbowR,
    wristR,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Positional interpolation between two poses (angles are linear in between). */
function mixPose(from: Pose, to: Pose, t: number): Pose {
  const blend = (a: number, b: number) => a + (b - a) * t;
  return {
    trunk: blend(from.trunk, to.trunk),
    neck: blend(from.neck, to.neck),
    hipL: blend(from.hipL, to.hipL),
    hipR: blend(from.hipR, to.hipR),
    kneeL: blend(from.kneeL, to.kneeL),
    kneeR: blend(from.kneeR, to.kneeR),
    ankleL: blend(from.ankleL, to.ankleL),
    ankleR: blend(from.ankleR, to.ankleR),
    shoulderL: blend(from.shoulderL, to.shoulderL),
    shoulderR: blend(from.shoulderR, to.shoulderR),
    elbowL: blend(from.elbowL, to.elbowL),
    elbowR: blend(from.elbowR, to.elbowR),
  };
}

/** 0 at the start pose, 1 at the end pose, with a short hold at each extreme. */
function timeline(elapsed: number): number {
  const phase = elapsed % CYCLE_MS;
  const ease = (value: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(value, 0, 1));
  if (phase < HOLD_MS) return 0;
  if (phase < HOLD_MS + MOVE_MS) return ease((phase - HOLD_MS) / MOVE_MS);
  if (phase < MOVE_MS + HOLD_MS * 2) return 1;
  return 1 - ease((phase - MOVE_MS - HOLD_MS * 2) / MOVE_MS);
}

interface Layout {
  scale: number;
  offsetX: number;
  /** Fixed vertical offset for rather static anchors (bench). */
  offsetY: number;
}

function layoutFor(animation: ExerciseAnimation): Layout {
  const a = skeleton(animation.start);
  const b = skeleton(animation.end);
  const width = Math.max(a.maxX - a.minX, b.maxX - b.minX, 0.3);
  const height = Math.max(a.maxY - a.minY, b.maxY - b.minY, 0.3);
  const scale = Math.min(
    (VB_W - PAD_X * 2) / width,
    (VB_H - PAD_TOP - PAD_BOTTOM) / height,
    240,
  );
  const minX = Math.min(a.minX, b.minX);
  const maxX = Math.max(a.maxX, b.maxX);
  const offsetX = VB_W / 2 - ((minX + maxX) / 2) * scale;
  // Bench-anchored figures keep the spine ~0.035 body-units above the pad, so
  // the prop line sits under the back instead of through the torso.
  const padJoint = animation.seat === 'pelvis' ? a.pelvis : a.chest;
  const offsetY =
    animation.anchor === 'bench' ? BENCH_Y - (padJoint.y + 0.035) * scale : 0;
  return { scale, offsetX, offsetY };
}

/* ------------------------------- component -------------------------------- */

export interface ExerciseFigureProps {
  exerciseId: string;
  exerciseName: string;
  category?: string;
  /** Rendered width of the figure in CSS pixels. */
  width?: number;
}

const line = (
  key: string,
  from: Pt,
  to: Pt,
  className: string,
): ReactElement => (
  <line
    key={key}
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
    className={className}
  />
);

export default function ExerciseFigure({
  exerciseId,
  exerciseName,
  category,
  width = 260,
}: ExerciseFigureProps) {
  const animation = useMemo(
    () => getExerciseAnimation(exerciseId, category),
    [exerciseId, category],
  );
  const layout = useMemo(() => layoutFor(animation), [animation]);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const frame = useRef<number>(0);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPlaying(false);
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    let cancelled = false;
    startedAt.current = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      setProgress(timeline(now - startedAt.current));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame.current);
    };
  }, [playing, reducedMotion]);

  const staticPose = reducedMotion || !playing;
  const ratio = staticPose ? 1 : progress;
  const pose = mixPose(animation.start, animation.end, ratio);
  const bones = skeleton(pose);
  const { scale, offsetX, offsetY } = layout;

  // Vertical placement: the anchor decides which contact point stays put.
  let translateY = offsetY;
  if (animation.anchor === 'hang') {
    const startWrist = skeleton(animation.start).wristR;
    translateY = BAR_Y - startWrist.y * scale;
  } else if (animation.anchor === 'hands') {
    const onBench = animation.prop === 'bench';
    translateY = (onBench ? BENCH_Y - 6 : FLOOR_Y) - bones.wristR.y * scale;
  } else if (animation.anchor !== 'bench') {
    translateY = FLOOR_Y - bones.maxY * scale;
  }

  const toScreen = (point: Pt): Pt => ({
    x: offsetX + point.x * scale,
    y: translateY + point.y * scale,
  });

  const p = {
    pelvis: toScreen(bones.pelvis),
    chest: toScreen(bones.chest),
    head: toScreen(bones.head),
    kneeL: toScreen(bones.kneeL),
    ankleL: toScreen(bones.ankleL),
    toeL: toScreen(bones.toeL),
    kneeR: toScreen(bones.kneeR),
    ankleR: toScreen(bones.ankleR),
    toeR: toScreen(bones.toeR),
    elbowL: toScreen(bones.elbowL),
    wristL: toScreen(bones.wristL),
    elbowR: toScreen(bones.elbowR),
    wristR: toScreen(bones.wristR),
  };

  const label = `Schematic demonstration of ${exerciseName}`;
  const propX = p.wristR.x;

  return (
    <figure className="mbx-figure" style={{ width }}>
      <style>{FIGURE_STYLES}</style>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={label}
        className="mbx-figure-svg"
      >
        <title>{label}</title>
        <desc>
          Animated stick-figure schematic of the start and end positions of{' '}
          {exerciseName}. Illustration only — not a photo or an anatomical model.
        </desc>

        {animation.anchor === 'hang' ? (
          <g className="mbx-figure-prop">
            <line x1={propX - 46} y1={BAR_Y} x2={propX + 46} y2={BAR_Y} />
            <line x1={propX - 46} y1={BAR_Y - 4} x2={propX - 46} y2={BAR_Y + 4} />
            <line x1={propX + 46} y1={BAR_Y - 4} x2={propX + 46} y2={BAR_Y + 4} />
          </g>
        ) : null}
        {animation.anchor === 'bench' ? (
          <g className="mbx-figure-prop">
            <line x1={VB_W * 0.12} y1={BENCH_Y} x2={VB_W * 0.88} y2={BENCH_Y} />
          </g>
        ) : null}
        {animation.prop === 'bench' && animation.anchor === 'hands' ? (
          <g className="mbx-figure-prop">
            <line x1={propX - 12} y1={BENCH_Y - 6} x2={propX + 74} y2={BENCH_Y - 6} />
          </g>
        ) : null}
        {animation.anchor !== 'hang' ? (
          <line
            className="mbx-figure-floor"
            x1={8}
            y1={FLOOR_Y}
            x2={VB_W - 8}
            y2={FLOOR_Y}
          />
        ) : null}

        <g className="mbx-figure-far">
          {line('far-thigh', p.pelvis, p.kneeL, 'mbx-figure-limb')}
          {line('far-shank', p.kneeL, p.ankleL, 'mbx-figure-limb')}
          {line('far-foot', p.ankleL, p.toeL, 'mbx-figure-limb')}
          {line('far-arm', p.chest, p.elbowL, 'mbx-figure-limb')}
          {line('far-forearm', p.elbowL, p.wristL, 'mbx-figure-limb')}
        </g>

        <g className="mbx-figure-core">
          {line('spine', p.pelvis, p.chest, 'mbx-figure-torso')}
          {line('neck', p.chest, p.head, 'mbx-figure-limb')}
          <circle
            className="mbx-figure-head"
            cx={p.head.x}
            cy={p.head.y}
            r={SEG.headRadius * scale}
          />
        </g>

        <g className="mbx-figure-near">
          {line('near-thigh', p.pelvis, p.kneeR, 'mbx-figure-limb')}
          {line('near-shank', p.kneeR, p.ankleR, 'mbx-figure-limb')}
          {line('near-foot', p.ankleR, p.toeR, 'mbx-figure-limb')}
          {line('near-arm', p.chest, p.elbowR, 'mbx-figure-limb')}
          {line('near-forearm', p.elbowR, p.wristR, 'mbx-figure-limb')}
        </g>
        <circle className="mbx-figure-joint" cx={p.pelvis.x} cy={p.pelvis.y} r={2.2} />
      </svg>

      <figcaption className="mbx-figure-caption">
        <span className="mbx-figure-caption-top">
          <span className="mbx-figure-tag">Schematic</span>
          {reducedMotion ? (
            <span className="mbx-figure-note">static (reduced motion)</span>
          ) : (
            <button
              type="button"
              className="mbx-figure-play"
              aria-pressed={playing}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          )}
        </span>
        {animation.caption}
      </figcaption>
    </figure>
  );
}

const FIGURE_STYLES = `
.mbx-figure { margin: 0; flex: 0 0 auto; max-width: 100%; }
.mbx-figure-svg { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 9px; background: radial-gradient(120% 90% at 50% 0%, #101c26 0%, #0a1118 70%); }
.mbx-figure-limb { stroke: #cfdae4; stroke-width: 3.2; stroke-linecap: round; }
.mbx-figure-torso { stroke: var(--accent-soft); stroke-width: 4.4; stroke-linecap: round; }
.mbx-figure-head { fill: none; stroke: #e8eef4; stroke-width: 3.2; }
.mbx-figure-joint { fill: var(--accent-soft); }
.mbx-figure-far { opacity: .42; }
.mbx-figure-far .mbx-figure-limb { stroke-width: 2.8; }
.mbx-figure-floor { stroke: var(--line-strong); stroke-width: 1.5; stroke-dasharray: 5 4; }
.mbx-figure-prop line { stroke: #48606f; stroke-width: 3; stroke-linecap: round; }
.mbx-figure-caption { margin-top: 6px; color: var(--muted); font-size: .68rem; line-height: 1.45; }
.mbx-figure-caption-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px; }
.mbx-figure-tag { font-size: .58rem; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line-strong); border-radius: 999px; padding: 0 6px; }
.mbx-figure-note { font-size: .62rem; font-style: italic; }
.mbx-figure-play { font-family: inherit; font-size: .66rem; cursor: pointer; color: var(--accent-soft); background: none; border: 1px solid var(--line-strong); border-radius: 999px; padding: 1px 9px; }
.mbx-figure-play:hover { border-color: var(--accent); color: #ffe6e2; }
.mbx-figure-play:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
`;
