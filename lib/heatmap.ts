/**
 * Activation heat scale for the exercise mode.
 *
 * Values are normalised to 0..1, where 1 = 100 % MVIC. The underlying data are
 * group means from mixed EMG/biomechanics protocols, so a value is a *relative
 * UI encoding*, not an individual prescription.
 *
 * Combination rules (documented because the research data are qualitative in
 * places):
 *  - primary muscles start at 0.90, secondary at 0.55 (max wins when both);
 *  - a variation `increase` adds 0.25, `decrease` subtracts 0.30;
 *  - a `shift` adds or subtracts 0.10 depending on whether the reported text
 *    describes a gain or a loss, and does nothing when the source reports a
 *    null/unchanged result (so "no difference" is not drawn as a change);
 *  - when a variation lists the same muscle twice (e.g. full-depth vs
 *    partial-depth directions), only the first entry is applied;
 *  - everything is clamped to 0..1.
 * Muscles that never appear keep no entry, which the renderer should treat as
 * "below the 8 % MVIC heat floor" (neutral, not zero).
 *
 * The ramp stops are the normative values from docs/design-spec.md §6.2 and are
 * interpolated in OKLab, per the spec.
 */

import { resolveResearchMuscle } from '@/data/muscleNameMap';

export interface ActivationExercise {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  variations: Array<{
    id: string;
    effects: Array<{
      muscle: string;
      direction: 'increase' | 'decrease' | 'shift';
      note?: string;
      magnitude?: number;
      magnitudeText?: string;
    }>;
  }>;
}

/** Normative ramp from docs/design-spec.md §6.2 (stop positions are % MVIC). */
export const HEAT_STOPS: ReadonlyArray<{ at: number; hex: string }> = [
  { at: 0.08, hex: '#2A1746' },
  { at: 0.25, hex: '#6A1E6E' },
  { at: 0.45, hex: '#B3325B' },
  { at: 0.65, hex: '#E75B3A' },
  { at: 0.82, hex: '#F79E2B' },
  { at: 1.0, hex: '#FFE08A' },
];

/** No heat tint below the first stop; the spec's neutral material colour. */
export const HEAT_NEUTRAL = '#4A5568';

const PRIMARY_BASE = 0.9;
const SECONDARY_BASE = 0.55;
const INCREASE_DELTA = 0.25;
const DECREASE_DELTA = -0.3;
const SHIFT_DELTA = 0.1;

const NULL_SHIFT =
  /no (significant )?(difference|change)|unchanged|similar|not differ|did not differ/i;
const NEGATIVE_SHIFT = /decreas|lower|reduc|less|diminish|attenuat/i;
const POSITIVE_SHIFT =
  /increas|greater|higher|rises?|toward|concentrat|shift(?:s|ed)? to/i;

function shiftSign(effect: ActivationExercise['variations'][number]['effects'][number]): number {
  const text = `${effect.magnitudeText ?? ''} ${effect.note ?? ''}`;
  if (NULL_SHIFT.test(text)) return 0;
  if (NEGATIVE_SHIFT.test(text) && !POSITIVE_SHIFT.test(text)) return -1;
  return 1;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Build the activation map for an exercise, optionally with one variation
 * applied. Keys are lowercase Écorché base structure names.
 */
export function buildActivationMap(
  exercise: ActivationExercise,
  variationId?: string,
): Map<string, number> {
  const map = new Map<string, number>();

  const bump = (muscle: string, value: number): void => {
    for (const name of resolveResearchMuscle(muscle)) {
      map.set(name, clamp01(value));
    }
  };

  for (const muscle of exercise.primaryMuscles) bump(muscle, PRIMARY_BASE);
  for (const muscle of exercise.secondaryMuscles) {
    for (const name of resolveResearchMuscle(muscle)) {
      map.set(name, Math.max(map.get(name) ?? 0, SECONDARY_BASE));
    }
  }

  if (!variationId) return map;
  const variation = exercise.variations.find((entry) => entry.id === variationId);
  if (!variation) return map;

  const applied = new Set<string>();
  for (const effect of variation.effects) {
    const delta =
      effect.direction === 'increase'
        ? INCREASE_DELTA
        : effect.direction === 'decrease'
          ? DECREASE_DELTA
          : SHIFT_DELTA * shiftSign(effect);
    if (delta === 0) continue;
    for (const name of resolveResearchMuscle(effect.muscle)) {
      if (applied.has(name)) continue;
      const current = map.get(name);
      // A decrease on a muscle that was not highlighted is not a change.
      if (current === undefined && delta < 0) continue;
      applied.add(name);
      map.set(name, clamp01((current ?? 0) + delta));
    }
  }

  return map;
}

/** Relative activation for one muscle, `undefined` when not highlighted. */
export function activationFor(
  exercise: ActivationExercise,
  muscle: string,
  variationId?: string,
): number | undefined {
  const map = buildActivationMap(exercise, variationId);
  for (const name of resolveResearchMuscle(muscle)) {
    const value = map.get(name);
    if (value !== undefined) return value;
  }
  return undefined;
}

/* ---------- OKLab interpolation ---------- */

interface Oklab {
  l: number;
  a: number;
  b: number;
}

const srgbToLinear = (channel: number): number =>
  channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;

const linearToSrgb = (channel: number): number =>
  channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055;

function hexToOklab(hex: string): Oklab {
  const value = hex.replace('#', '');
  const r = srgbToLinear(Number.parseInt(value.slice(0, 2), 16) / 255);
  const g = srgbToLinear(Number.parseInt(value.slice(2, 4), 16) / 255);
  const b = srgbToLinear(Number.parseInt(value.slice(4, 6), 16) / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToHex({ l, a, b }: Oklab): string {
  const lPrime = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mPrime = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sPrime = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const r = 4.0767416621 * lPrime - 3.3077115913 * mPrime + 0.2309699292 * sPrime;
  const g = -1.2684380046 * lPrime + 2.6097574011 * mPrime - 0.3413193965 * sPrime;
  const blue = -0.0041960863 * lPrime - 0.7034186147 * mPrime + 1.707614701 * sPrime;

  const toByte = (channel: number): string =>
    Math.round(clamp01(linearToSrgb(clamp01(channel))) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toByte(r)}${toByte(g)}${toByte(blue)}`.toUpperCase();
}

const STOP_LAB_CACHE = HEAT_STOPS.map((stop) => ({
  at: stop.at,
  lab: hexToOklab(stop.hex),
}));

/**
 * Heat colour for a 0..1 activation value, interpolated in OKLab between the
 * spec's stops. Below 8 % MVIC returns the neutral "not highlighted" colour.
 */
export function heatColor(value: number): string {
  const t = clamp01(Number.isFinite(value) ? value : 0);
  if (t < HEAT_STOPS[0].at) return HEAT_NEUTRAL;
  if (t >= STOP_LAB_CACHE[STOP_LAB_CACHE.length - 1].at) {
    return HEAT_STOPS[HEAT_STOPS.length - 1].hex.toUpperCase();
  }

  for (let index = 1; index < STOP_LAB_CACHE.length; index += 1) {
    const previous = STOP_LAB_CACHE[index - 1];
    const next = STOP_LAB_CACHE[index];
    if (t <= next.at) {
      const span = next.at - previous.at || 1;
      const ratio = (t - previous.at) / span;
      return oklabToHex({
        l: previous.lab.l + (next.lab.l - previous.lab.l) * ratio,
        a: previous.lab.a + (next.lab.a - previous.lab.a) * ratio,
        b: previous.lab.b + (next.lab.b - previous.lab.b) * ratio,
      });
    }
  }
  return HEAT_NEUTRAL;
}

/** CSS gradient for legends, sampled from the same OKLab function. */
export function heatRampGradient(steps = 24): string {
  const samples: string[] = [];
  for (let index = 0; index <= steps; index += 1) {
    samples.push(`${heatColor(index / steps)} ${(index / steps) * 100}%`);
  }
  return `linear-gradient(90deg, ${samples.join(', ')})`;
}

/** Descriptive band for a value, used as redundant text next to the colour. */
export function heatBand(value: number): 'none' | 'low' | 'moderate' | 'high' {
  if (value < HEAT_STOPS[0].at) return 'none';
  if (value < 0.45) return 'low';
  if (value < 0.75) return 'moderate';
  return 'high';
}
