/**
 * Reverse index: trainable muscle → exercises that train it.
 *
 * The research dataset labels muscles in free text ("quadriceps (vastus
 * lateralis)", "lower trapezius", "biceps brachii (long head)"). This module
 * collapses those labels onto one entry per normalised label
 * (`normalizeMuscleName`), and resolves each entry to Écorché base mesh names
 * with `resolveResearchMuscle`, exactly the way `lib/heatmap.ts` builds the
 * activation map. If either side's normalisation drifts, the heat map and this
 * list would disagree, so keep `normalizeMuscleName` / `resolveResearchMuscle`
 * as the single source of truth for both.
 *
 * Only `primaryMuscles` and `secondaryMuscles` are indexed. The variation
 * `effects` labels mix muscles with joints, outcomes and whole-body measures,
 * so they answer "what changed versus the reference form?", not "what does this
 * movement train?".
 *
 * Dependency-free (no React, no DOM) so it can be unit-tested or reused by the
 * 3D viewer.
 */

import {
  EXERCISES,
  type ExerciseRegion,
  type ResearchExercise,
} from './exercises';
import { baseMuscleName, regionForMuscle, type Region } from './anatomy';
import {
  RESEARCH_TO_MESH,
  normalizeMuscleName,
  resolveResearchMuscle,
} from './muscleNameMap';

export type MuscleRole = 'primary' | 'secondary';

export type MatchMode = 'any' | 'all';

export interface TrainableMuscle {
  /** Stable lookup key: `normalizeMuscleName` of the research label. */
  key: string;
  /** Display label, sentence case (e.g. "Gluteus maximus"). */
  label: string;
  /** Coarse region used to group the picker; `null` when unresolvable. */
  region: ExerciseRegion | null;
  /** Single atlas base mesh name, or `null` for a composite (multi-mesh) muscle. */
  meshKey: string | null;
  /** Every atlas base mesh name the muscle resolves to. */
  meshKeys: string[];
  /** Raw research labels collapsed into this entry ("quadriceps (rectus femoris)"…). */
  labels: string[];
  /** Alias terms from the muscle map that resolve onto this entry ("quads", "lats"…). */
  aliases: string[];
  /** Exercises where the muscle is primary or secondary. */
  exerciseCount: number;
  /** Exercises where the muscle is primary. */
  primaryCount: number;
}

export interface MuscleExercise {
  exercise: ResearchExercise;
  role: MuscleRole;
}

export interface MuscleMatch {
  /** Display label of the matched trainable muscle. */
  label: string;
  role: MuscleRole;
}

export interface RankedExercise {
  exercise: ResearchExercise;
  /** 2 per primary hit + 1 per secondary hit. */
  score: number;
  primaryHits: number;
  secondaryHits: number;
  matched: MuscleMatch[];
}

/* ----------------------------- index building ---------------------------- */

interface MuscleRecord {
  key: string;
  labels: Set<string>;
  meshes: Set<string>;
  /** exercise id → strongest role across label variants. */
  entries: Map<string, MuscleRole>;
}

/**
 * Anatomy regions are finer than the picker's six groups. The foot and hand are
 * mapped onto the limb they belong to; head/neck muscles cannot be trained by
 * this dataset, so they stay unmapped.
 */
const ANATOMY_TO_EXERCISE_REGION: Record<Region, ExerciseRegion | null> = {
  head: null,
  neck: null,
  shoulder: 'shoulders',
  chest: 'chest',
  abdomen: 'core',
  back: 'back',
  arm: 'arms',
  forearm: 'arms',
  hand: 'arms',
  hip: 'legs',
  thigh: 'legs',
  leg: 'legs',
  foot: 'legs',
};

/** Display order for grouping; also breaks ties when a muscle spans regions. */
export const TRAIN_REGION_ORDER: ExerciseRegion[] = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
];

function labelFor(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Short alias terms whose atlas meshes overlap this entry, so searching "quads"
 * or "lats" finds the picker row even though the dataset only uses the full
 * anatomical labels.
 */
function aliasesFor(meshKeys: readonly string[]): string[] {
  const aliases: string[] = [];
  for (const [alias, meshes] of Object.entries(RESEARCH_TO_MESH)) {
    if (meshes.some((mesh) => meshKeys.includes(mesh))) aliases.push(alias);
  }
  return aliases.sort((a, b) => a.localeCompare(b));
}

function regionForMeshes(meshes: readonly string[]): ExerciseRegion | null {
  const counts = new Map<ExerciseRegion, number>();
  for (const mesh of meshes) {
    const anatomyRegion = regionForMuscle(mesh);
    if (!anatomyRegion) continue;
    const region = ANATOMY_TO_EXERCISE_REGION[anatomyRegion];
    if (!region) continue;
    counts.set(region, (counts.get(region) ?? 0) + 1);
  }
  let best: ExerciseRegion | null = null;
  let bestCount = 0;
  for (const region of TRAIN_REGION_ORDER) {
    const count = counts.get(region) ?? 0;
    if (count > bestCount) {
      best = region;
      bestCount = count;
    }
  }
  return best;
}

function buildIndex(): Map<string, MuscleRecord> {
  const records = new Map<string, MuscleRecord>();

  for (const exercise of EXERCISES) {
    const lists: Array<readonly [MuscleRole, readonly string[]]> = [
      ['primary', exercise.primaryMuscles],
      ['secondary', exercise.secondaryMuscles],
    ];
    for (const [role, labels] of lists) {
      for (const raw of labels) {
        const key = normalizeMuscleName(raw);
        if (!key) continue;

        let record = records.get(key);
        if (!record) {
          record = { key, labels: new Set(), meshes: new Set(), entries: new Map() };
          records.set(key, record);
        }
        record.labels.add(raw);
        for (const mesh of resolveResearchMuscle(raw)) record.meshes.add(mesh);

        const previous = record.entries.get(exercise.id);
        if (previous !== 'primary') record.entries.set(exercise.id, role);
      }
    }
  }

  return records;
}

const RECORDS = buildIndex();

// A normalised key that is itself a muscle-map alias ("quadriceps",
// "hamstrings") can be broader than the specific labels the dataset uses
// ("quadriceps (vastus medialis)"). Fold the alias's meshes in so a 3D pick of
// any of those structures resolves back to the group.
for (const record of RECORDS.values()) {
  const aliasMeshes = RESEARCH_TO_MESH[record.key];
  if (aliasMeshes) {
    for (const mesh of aliasMeshes) record.meshes.add(mesh);
  }
}

/** Snapshot of the picker's muscles, sorted by region then label. */
export const TRAINABLE_MUSCLES: TrainableMuscle[] = Array.from(RECORDS.values())
  .map((record) => {
    const meshKeys = Array.from(record.meshes).sort((a, b) => a.localeCompare(b));
    return {
      key: record.key,
      label: labelFor(record.key),
      region: regionForMeshes(meshKeys),
      meshKey: meshKeys.length === 1 ? meshKeys[0] : null,
      meshKeys,
      labels: Array.from(record.labels).sort((a, b) => a.localeCompare(b)),
      aliases: aliasesFor(meshKeys),
      exerciseCount: record.entries.size,
      primaryCount: Array.from(record.entries.values()).filter((role) => role === 'primary')
        .length,
    };
  })
  .sort((a, b) => {
    const rankA = a.region ? TRAIN_REGION_ORDER.indexOf(a.region) : TRAIN_REGION_ORDER.length;
    const rankB = b.region ? TRAIN_REGION_ORDER.indexOf(b.region) : TRAIN_REGION_ORDER.length;
    return rankA - rankB || a.label.localeCompare(b.label);
  });

const MUSCLE_BY_KEY = new Map(TRAINABLE_MUSCLES.map((muscle) => [muscle.key, muscle]));

/**
 * Atlas mesh base name → trainable muscle key. When several entries share a
 * mesh (the "quadriceps" group and the specific "rectus femoris" entry), the
 * most specific entry — the one with the fewest meshes — wins, so clicking a
 * single mesh in the viewer resolves to that named structure rather than the
 * whole group.
 */
const MUSCLE_KEY_BY_MESH = new Map<string, string>();
for (const muscle of TRAINABLE_MUSCLES) {
  for (const mesh of muscle.meshKeys) {
    const currentKey = MUSCLE_KEY_BY_MESH.get(mesh);
    if (!currentKey) {
      MUSCLE_KEY_BY_MESH.set(mesh, muscle.key);
      continue;
    }
    const current = MUSCLE_BY_KEY.get(currentKey);
    if (current && muscle.meshKeys.length < current.meshKeys.length) {
      MUSCLE_KEY_BY_MESH.set(mesh, muscle.key);
    }
  }
}

const MUSCLE_KEY_BY_RAW_LABEL = new Map<string, string>();
for (const muscle of TRAINABLE_MUSCLES) {
  for (const label of muscle.labels) {
    MUSCLE_KEY_BY_RAW_LABEL.set(label.toLocaleLowerCase(), muscle.key);
  }
}

/* -------------------------------- queries -------------------------------- */

/** Muscle entries present in the exercise dataset, ordered for display. */
export function listTrainableMuscles(): TrainableMuscle[] {
  return TRAINABLE_MUSCLES;
}

/** Look up a trainable muscle by record (no resolution). */
export function getTrainableMuscle(key: string): TrainableMuscle | undefined {
  return MUSCLE_BY_KEY.get(key);
}

/**
 * Resolve a muscle key, a research label ("lower trapezius"), or an atlas
 * structure name ("Long head of left biceps brachii") to a trainable key.
 * Returns `null` for bones, joints and muscles absent from the dataset.
 */
export function resolveMuscleKey(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const exact = MUSCLE_BY_KEY.get(trimmed);
  if (exact) return exact.key;

  const rawLabel = MUSCLE_KEY_BY_RAW_LABEL.get(trimmed.toLocaleLowerCase());
  if (rawLabel) return rawLabel;

  const normalized = normalizeMuscleName(trimmed);
  if (normalized && MUSCLE_BY_KEY.has(normalized)) return normalized;

  // Atlas structure names carry side/part prefixes ("Left gluteus maximus",
  // "Clavicular part of left pectoralis major").
  const base = normalizeMuscleName(baseMuscleName(trimmed));
  if (base) {
    if (MUSCLE_BY_KEY.has(base)) return base;
    const meshHit = MUSCLE_KEY_BY_MESH.get(base);
    if (meshHit) return meshHit;
  }

  // A free-text research label may expand to several meshes; take the first
  // indexed one in a stable order.
  for (const mesh of resolveResearchMuscle(trimmed)) {
    const key = MUSCLE_KEY_BY_MESH.get(normalizeMuscleName(mesh));
    if (key) return key;
  }

  return null;
}

/**
 * Exercises that train a muscle, primary first. `keyOrLabel` accepts anything
 * `resolveMuscleKey` accepts.
 */
export function exercisesForMuscle(keyOrLabel: string): MuscleExercise[] {
  const key = resolveMuscleKey(keyOrLabel);
  if (!key) return [];
  const record = RECORDS.get(key);
  if (!record) return [];

  const results: MuscleExercise[] = [];
  for (const [exerciseId, role] of record.entries) {
    const exercise = EXERCISES.find((entry) => entry.id === exerciseId);
    if (exercise) results.push({ exercise, role });
  }
  return results.sort(
    (a, b) =>
      (a.role === b.role ? 0 : a.role === 'primary' ? -1 : 1) ||
      a.exercise.name.localeCompare(b.exercise.name),
  );
}

/**
 * Rank exercises against one or more selected muscles.
 *
 * `any` keeps every exercise that trains at least one selection; `all` keeps
 * only those that train every selection. Primary matches score 2, secondary 1.
 * Results are sorted by score desc, then exercise name.
 */
export function rankExercisesForMuscles(
  muscles: readonly string[],
  mode: MatchMode = 'any',
): RankedExercise[] {
  const keys = Array.from(
    new Set(
      muscles
        .map((muscle) => resolveMuscleKey(muscle))
        .filter((key): key is string => Boolean(key)),
    ),
  );
  if (keys.length === 0) return [];

  const byExercise = new Map<
    string,
    { matched: MuscleMatch[]; primaryHits: number; secondaryHits: number }
  >();

  for (const key of keys) {
    const record = RECORDS.get(key);
    const muscle = MUSCLE_BY_KEY.get(key);
    if (!record || !muscle) continue;
    for (const [exerciseId, role] of record.entries) {
      let entry = byExercise.get(exerciseId);
      if (!entry) {
        entry = { matched: [], primaryHits: 0, secondaryHits: 0 };
        byExercise.set(exerciseId, entry);
      }
      entry.matched.push({ label: muscle.label, role });
      if (role === 'primary') entry.primaryHits += 1;
      else entry.secondaryHits += 1;
    }
  }

  const results: RankedExercise[] = [];
  for (const [exerciseId, entry] of byExercise) {
    if (mode === 'all' && entry.matched.length < keys.length) continue;
    const exercise = EXERCISES.find((candidate) => candidate.id === exerciseId);
    if (!exercise) continue;
    entry.matched.sort(
      (a, b) =>
        (a.role === b.role ? 0 : a.role === 'primary' ? -1 : 1) ||
        a.label.localeCompare(b.label),
    );
    results.push({
      exercise,
      score: entry.primaryHits * 2 + entry.secondaryHits,
      primaryHits: entry.primaryHits,
      secondaryHits: entry.secondaryHits,
      matched: entry.matched,
    });
  }

  return results.sort(
    (a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name),
  );
}

/**
 * Atlas base mesh name for a selection, used to bridge 3D structure picks onto
 * this index. Accepts a muscle key, a research label or a structure name;
 * returns the single mesh when the entry has one, otherwise the first mesh of
 * the composite group.
 */
export function resolveSelectionMeshKey(
  keyOrLabel: string | null | undefined,
): string | null {
  if (!keyOrLabel) return null;
  const key = resolveMuscleKey(keyOrLabel);
  if (key) {
    const muscle = MUSCLE_BY_KEY.get(key);
    if (muscle) return muscle.meshKey ?? muscle.meshKeys[0] ?? null;
  }

  // Not trainable, but still a valid research label for an atlas structure.
  const base = normalizeMuscleName(baseMuscleName(keyOrLabel));
  const aliases = RESEARCH_TO_MESH[base];
  return aliases && aliases.length > 0 ? aliases[0] : null;
}
