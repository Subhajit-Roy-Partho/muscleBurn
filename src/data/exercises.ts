// Source: deep-research workspace
// ~/Documents/deep-research/exercise-form-variations-and-skeletal-muscle-activation-an-e
// (report.md). Data © synthesized from the cited literature; see REFERENCES.
//
// Raw snapshot: src/data/raw/exercises.json (verbatim copy of the workspace's
// exercises.json). The types below extend the shared ExerciseDef schema locally:
// the research file stores each effect's magnitude as reported free text
// ("+40% concentric activation", "no significant difference", …), so the text is
// preserved in `magnitudeText` and `magnitude` is populated only when the source
// states an explicit signed percentage (kept for consumers of ExerciseDef).

import type { ExerciseDef, ExerciseFormVariation } from './types';
import rawExercises from './raw/exercises.json';
import { resolveResearchMuscle } from './muscleNameMap';

export type EffectDirection = 'increase' | 'decrease' | 'shift';

/** Where an exercise is realistically performed. */
export type ExerciseSetting = 'home' | 'gym' | 'both';

export const EXERCISE_SETTING_LABELS: Record<ExerciseSetting, string> = {
  home: 'Home',
  gym: 'Gym',
  both: 'Home & gym',
};

/** Records without an explicit context predate the setting field → gym. */
export function exerciseSetting(exercise: Pick<ExerciseDef, 'context'>): ExerciseSetting {
  return exercise.context ?? 'gym';
}

/** Setting filter chip values; `all` is the neutral option. */
export type ExerciseSettingFilter = 'all' | 'home' | 'gym';

export const EXERCISE_SETTING_FILTERS: ExerciseSettingFilter[] = ['all', 'home', 'gym'];

/**
 * `Home` includes home-only and dual-use movements, `Gym` includes gym-only and
 * dual-use ones, so a `both` exercise is never hidden from either setting.
 */
export function exerciseMatchesSetting(
  exercise: Pick<ExerciseDef, 'context'>,
  filter: ExerciseSettingFilter,
): boolean {
  if (filter === 'all') return true;
  const setting = exerciseSetting(exercise);
  return setting === filter || setting === 'both';
}

export interface ResearchEffect
  extends Omit<ExerciseFormVariation['effects'][number], 'magnitude'> {
  /** Magnitude exactly as written in the source (may be qualitative). */
  magnitudeText: string;
  /** Parsed only from an explicit leading signed percentage, e.g. "+40%". */
  magnitude?: number;
}

export interface ResearchVariation
  extends Omit<ExerciseFormVariation, 'effects'> {
  effects: ResearchEffect[];
}

export interface ResearchExercise extends Omit<ExerciseDef, 'variations'> {
  variations: ResearchVariation[];
}

interface RawEffect {
  muscle: string;
  direction: string;
  magnitude: string;
  note?: string;
  referenceIds: string[];
}

interface RawVariation {
  id: string;
  name: string;
  description: string;
  effects: RawEffect[];
  referenceIds: string[];
}

interface RawExercise {
  id: string;
  name: string;
  category: string;
  context?: ExerciseSetting;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  variations: RawVariation[];
  referenceIds: string[];
}

const DIRECTIONS: ReadonlySet<string> = new Set(['increase', 'decrease', 'shift']);

/** Parse "+40% concentric activation" / "−9%" but not descriptive magnitudes. */
function parseSignedMagnitude(text: string): number | undefined {
  const match = text.trim().match(/^([+\u2212-])\s*(\d+(?:\.\d+)?)\s*%/);
  if (!match) return undefined;
  const value = Number.parseFloat(match[2]);
  return match[1] === '+' ? value : -value;
}

function mapEffect(effect: RawEffect): ResearchEffect {
  const direction = DIRECTIONS.has(effect.direction)
    ? (effect.direction as EffectDirection)
    : 'shift';
  return {
    muscle: effect.muscle,
    direction,
    magnitudeText: effect.magnitude,
    magnitude: parseSignedMagnitude(effect.magnitude),
    note: effect.note,
    referenceIds: effect.referenceIds,
  };
}

const RAW_EXERCISES = rawExercises as unknown as RawExercise[];

/**
 * All 36 exercises / 114 variations / 314 effects. IDs are stable.
 *
 * 22 gym movements (7 of which are genuinely home-capable, tagged `both`) plus
 * the 14 cited home/bodyweight movements from the home-exercise-extension
 * workspace, tagged `home`.
 */
export const EXERCISES: ResearchExercise[] = RAW_EXERCISES.map((exercise) => ({
  id: exercise.id,
  name: exercise.name,
  category: exercise.category,
  context: exercise.context,
  primaryMuscles: exercise.primaryMuscles,
  secondaryMuscles: exercise.secondaryMuscles,
  variations: exercise.variations.map((variation) => ({
    id: variation.id,
    name: variation.name,
    description: variation.description,
    effects: variation.effects.map(mapEffect),
    referenceIds: variation.referenceIds,
  })),
  referenceIds: exercise.referenceIds,
}));

export const EXERCISE_BY_ID: Record<string, ResearchExercise> = Object.fromEntries(
  EXERCISES.map((exercise) => [exercise.id, exercise]),
);

export const getExercise = (id: string): ResearchExercise | undefined =>
  EXERCISE_BY_ID[id];

export const getVariation = (
  exerciseId: string,
  variationId: string,
): ResearchVariation | undefined =>
  getExercise(exerciseId)?.variations.find((variation) => variation.id === variationId);

/** Coarse body regions used by the exercise filter chips. */
export type ExerciseRegion = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs';

export const EXERCISE_REGION_LABELS: Record<ExerciseRegion, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
  legs: 'Legs',
};

const REGION_ORDER: ExerciseRegion[] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
];

const REGION_RULES: Array<[ExerciseRegion, RegExp]> = [
  ['chest', /pectoralis|serratus anterior/],
  [
    'back',
    /latissimus|trapezius|rhomboid|teres (major|minor)|erector spinae|iliocostalis|longissimus|spinalis|multifidus|infraspinatus|supraspinatus|subscapularis/,
  ],
  ['shoulders', /deltoid|rotator cuff/],
  [
    'arms',
    /biceps brachii|triceps brachii|brachialis|brachioradialis|anconeus|forearm flexors|flexor carpi/,
  ],
  [
    'core',
    /rectus abdominis|external oblique|internal oblique|transversus abdominis|quadratus lumborum/,
  ],
  [
    'legs',
    /gluteus|quadriceps|rectus femoris|vastus|biceps femoris|semitendinosus|semimembranosus|hamstrings|adductor|gastrocnemius|soleus|tibialis|popliteus|fibularis|peroneus/,
  ],
];

function meshNames(muscle: string): string[] {
  return resolveResearchMuscle(muscle);
}

/** Coarse regions an exercise loads, derived from its primary/secondary muscles. */
export function exerciseRegions(exercise: ExerciseDef): ExerciseRegion[] {
  const meshes = new Set<string>();
  for (const muscle of [...exercise.primaryMuscles, ...exercise.secondaryMuscles]) {
    for (const name of meshNames(muscle)) meshes.add(name);
  }
  return REGION_ORDER.filter((region) =>
    REGION_RULES.some(
      ([candidate, pattern]) =>
        candidate === region &&
        Array.from(meshes).some((name) => pattern.test(name)),
    ),
  );
}

/** Region chips present in the dataset, in display order. */
export function listRegions(): ExerciseRegion[] {
  const present = new Set<ExerciseRegion>();
  for (const exercise of EXERCISES) {
    for (const region of exerciseRegions(exercise)) present.add(region);
  }
  return REGION_ORDER.filter((region) => present.has(region));
}

export function exercisesByRegion(region: ExerciseRegion): ResearchExercise[] {
  return EXERCISES.filter((exercise) => exerciseRegions(exercise).includes(region));
}

/** Case/diacritic-insensitive search over name, category, muscles and variation names. */
export function exerciseMatches(exercise: ResearchExercise, query: string): boolean {
  const needle = query
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  if (!needle) return true;
  const haystack = [
    exercise.name,
    exercise.category,
    ...exercise.primaryMuscles,
    ...exercise.secondaryMuscles,
    ...exercise.variations.map((variation) => variation.name),
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  return haystack.includes(needle);
}
