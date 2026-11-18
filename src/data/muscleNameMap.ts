// Source: deep-research workspace
// ~/Documents/deep-research/exercise-form-variations-and-skeletal-muscle-activation-an-e
// (report.md). Data © synthesized from the cited literature; see REFERENCES.
//
// Bridge between the free-text muscle labels used by the research dataset and
// the Écorché atlas structure names. The Écorché model splits many muscles into
// heads/parts ("Clavicular part of left pectoralis major", "Long head of left
// biceps brachii"), so this module maps onto the lowercase *base* structure name
// ("pectoralis major", "biceps brachii"). Composite labels expand to several
// base names (quadriceps, hamstrings, erector spinae, …).
//
// The alias table itself lives in src/data/raw/muscle-map.json so the dependency
// free validator (scripts/validate-mapping.mjs) reads the same source of truth.

import muscleMap from './raw/muscle-map.json';

type MuscleMap = {
  aliases: Record<string, string[]>;
  nonMuscle: string[];
  nonMuscleKeywords: string[];
};

const MAP = muscleMap as MuscleMap;

/** Normalized research muscle label → one or more Écorché base structure names. */
export const RESEARCH_TO_MESH: Readonly<Record<string, readonly string[]>> =
  MAP.aliases;

const NON_MUSCLE = new Set(MAP.nonMuscle.map((name) => name.toLowerCase()));
const NON_MUSCLE_KEYWORDS = MAP.nonMuscleKeywords.map((keyword) =>
  keyword.toLowerCase(),
);

/**
 * Lowercase, strip side markers, head qualifiers, parentheticals and the word
 * "muscle". This is the canonical lookup key; parenthetical specifics such as
 * "quadriceps (vastus lateralis)" are handled by resolveResearchMuscle before
 * the key is looked up.
 */
export function normalizeMuscleName(input: string): string {
  let value = input
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014]/g, '-');
  value = value.replace(/\([^)]*\)/g, ' ');
  value = value.replace(/\b(left|right|bilateral)\b/g, ' ');
  value = value.replace(/\b(long|short|lateral|medial)\s+heads?\b/g, ' ');
  value = value.replace(
    /\b(lateral|medial|anterior|posterior|middle|upper|lower)\s+(deltoid|trapezius)\b/g,
    '$2',
  );
  value = value.replace(/^whole\s+/, ' ');
  value = value.replace(/\bmuscles?\b/g, ' ');
  value = value.replace(/[^a-z0-9+ ]+/g, ' ');
  return value.replace(/\s+/g, ' ').trim();
}

/** Split "a / b and c" at the top level, ignoring separators inside parentheses. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '(') depth += 1;
    if (character === ')') depth = Math.max(0, depth - 1);
    if (depth === 0) {
      if (character === '/' || character === ',' || character === '+') {
        parts.push(current);
        current = '';
        continue;
      }
      if (character === ' ' && /^ and\s/i.test(input.slice(index))) {
        parts.push(current);
        index += 4;
        current = '';
        continue;
      }
    }
    current += character;
  }
  parts.push(current);
  return parts.filter((part) => part.trim().length > 0);
}

function parentheticals(input: string): string[] {
  const found: string[] = [];
  for (const match of input.matchAll(/\(([^)]*)\)/g)) found.push(match[1]);
  return found;
}

/** True for labels that are not muscles (joints, ligaments, outcomes, equipment). */
export function isNonMuscleConcept(input: string): boolean {
  const whole = normalizeMuscleName(input);
  if (NON_MUSCLE.has(whole)) return true;
  for (const name of NON_MUSCLE) {
    if (whole === name || whole.startsWith(`${name} `)) return true;
  }
  return NON_MUSCLE_KEYWORDS.some((keyword) => whole.includes(keyword));
}

/**
 * Resolve one raw research label to Écorché base structure names.
 * Returns an empty array for non-muscle concepts and unknown labels.
 */
export function resolveResearchMuscle(input: string): string[] {
  if (!input.trim()) return [];
  if (isNonMuscleConcept(input)) return [];

  const resolved: string[] = [];
  for (const part of splitTopLevel(input)) {
    const base = normalizeMuscleName(part);
    if (!base) continue;

    // A parenthetical that names a specific muscle wins over the group label:
    // "quadriceps (vastus lateralis)" → vastus lateralis,
    // "upper back (trapezius/rhomboids)" → trapezius, rhomboids.
    const specifics: string[] = [];
    for (const inner of parentheticals(part)) {
      for (const token of splitTopLevel(inner)) {
        const key = normalizeMuscleName(token);
        if (key && RESEARCH_TO_MESH[key]) specifics.push(...RESEARCH_TO_MESH[key]);
      }
    }
    if (specifics.length > 0) {
      resolved.push(...specifics);
      continue;
    }
    if (RESEARCH_TO_MESH[base]) resolved.push(...RESEARCH_TO_MESH[base]);
  }
  return Array.from(new Set(resolved));
}

/** Expanded Écorché base names for one label (usually one; groups give several). */
export const meshNamesFor = (researchName: string): string[] =>
  resolveResearchMuscle(researchName);

interface MappingSource {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  variations: Array<{ effects: Array<{ muscle: string }> }>;
}

/** Distinct research labels in a dataset, sorted for stable diagnostics. */
export function researchMuscleLabels(exercises: readonly MappingSource[]): string[] {
  const labels = new Set<string>();
  for (const exercise of exercises) {
    for (const muscle of exercise.primaryMuscles) labels.add(muscle);
    for (const muscle of exercise.secondaryMuscles) labels.add(muscle);
    for (const variation of exercise.variations) {
      for (const effect of variation.effects) labels.add(effect.muscle);
    }
  }
  return Array.from(labels).sort((a, b) => a.localeCompare(b));
}

/**
 * Muscle labels that are neither mapped nor recognisably non-muscular.
 * Empty is the expected result; the validator prints anything returned.
 */
export function unmappedResearchMuscles(
  exercises: readonly MappingSource[],
): string[] {
  return researchMuscleLabels(exercises).filter(
    (label) => resolveResearchMuscle(label).length === 0 && !isNonMuscleConcept(label),
  );
}

/** Diagnostic summary for the UI / validator. */
export function mappingReport(exercises: readonly MappingSource[]): {
  labels: number;
  mapped: number;
  nonMuscle: number;
  unmapped: string[];
  meshNames: string[];
} {
  const labels = researchMuscleLabels(exercises);
  const meshNames = new Set<string>();
  let mapped = 0;
  let nonMuscle = 0;
  for (const label of labels) {
    const names = resolveResearchMuscle(label);
    if (names.length > 0) {
      mapped += 1;
      for (const name of names) meshNames.add(name);
    } else if (isNonMuscleConcept(label)) {
      nonMuscle += 1;
    }
  }
  return {
    labels: labels.length,
    mapped,
    nonMuscle,
    unmapped: unmappedResearchMuscles(exercises),
    meshNames: Array.from(meshNames).sort((a, b) => a.localeCompare(b)),
  };
}
