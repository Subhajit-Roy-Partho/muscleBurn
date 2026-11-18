#!/usr/bin/env node
/**
 * scripts/validate-mapping.mjs — dependency-free check that every muscle label
 * in the vendored deep-research dataset resolves to an Écorché structure.
 *
 * Reads:
 *   src/data/raw/exercises.json        (vendored snapshot, single source)
 *   src/data/raw/references.json       (citation coverage check)
 *   src/data/raw/muscle-map.json       (alias table shared with the app)
 *   public/models/ecorche.structures.json (atlas structure names)
 *
 * Default exit code is 0 and unmapped names are printed as data, because the
 * dataset intentionally contains joints/ligaments/outcome labels that are not
 * muscles. Pass --strict to exit 1 when a genuine muscle label is unmapped or
 * when an alias points at a structure the atlas does not contain.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const verbose = process.argv.includes('--verbose');

const readJson = async (relative) =>
  JSON.parse(await readFile(path.join(ROOT, relative), 'utf8'));

const [exercises, references, map, structures] = await Promise.all([
  readJson('src/data/raw/exercises.json'),
  readJson('src/data/raw/references.json'),
  readJson('src/data/raw/muscle-map.json'),
  readJson('public/models/ecorche.structures.json'),
]);

const aliases = map.aliases ?? {};
const nonMuscle = new Set((map.nonMuscle ?? []).map((name) => name.toLowerCase()));
const nonMuscleKeywords = (map.nonMuscleKeywords ?? []).map((keyword) =>
  keyword.toLowerCase(),
);

/** Keep in sync with normalizeMuscleName() in src/data/muscleNameMap.ts. */
function normalizeMuscleName(input) {
  let value = String(input)
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

function splitTopLevel(input) {
  const parts = [];
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

function parentheticals(input) {
  return Array.from(input.matchAll(/\(([^)]*)\)/g), (match) => match[1]);
}

function isNonMuscleConcept(input) {
  const whole = normalizeMuscleName(input);
  if (nonMuscle.has(whole)) return true;
  for (const name of nonMuscle) {
    if (whole === name || whole.startsWith(`${name} `)) return true;
  }
  return nonMuscleKeywords.some((keyword) => whole.includes(keyword));
}

function resolveMuscle(input) {
  if (!String(input).trim() || isNonMuscleConcept(input)) return [];
  const resolved = [];
  for (const part of splitTopLevel(String(input))) {
    const base = normalizeMuscleName(part);
    if (!base) continue;
    const specifics = [];
    for (const inner of parentheticals(part)) {
      for (const token of splitTopLevel(inner)) {
        const key = normalizeMuscleName(token);
        if (key && aliases[key]) specifics.push(...aliases[key]);
      }
    }
    if (specifics.length > 0) {
      resolved.push(...specifics);
      continue;
    }
    if (aliases[base]) resolved.push(...aliases[base]);
  }
  return Array.from(new Set(resolved));
}

/** Écorché structure name → lowercase base name ("Long head of left biceps brachii" → "biceps brachii"). */
function baseStructureName(name) {
  let value = String(name).toLowerCase().replace(/\(\d+\)\s*$/g, '').trim();
  value = value.replace(/^(left|right)\s+/, '');
  value = value.replace(/^.+?\s+(?:part|head)\s+of\s+/, '');
  value = value.replace(/^(left|right)\s+/, '');
  value = value.replace(/\s+muscle$/, '');
  return value.replace(/\s+/g, ' ').trim();
}

const structureBases = new Set(
  structures
    .filter((structure) => String(structure.layer ?? '').includes('muscle'))
    .map((structure) => baseStructureName(structure.name)),
);

const labels = new Set();
for (const exercise of exercises) {
  for (const muscle of exercise.primaryMuscles ?? []) labels.add(muscle);
  for (const muscle of exercise.secondaryMuscles ?? []) labels.add(muscle);
  for (const variation of exercise.variations ?? []) {
    for (const effect of variation.effects ?? []) labels.add(effect.muscle);
  }
}
const sortedLabels = Array.from(labels).sort((a, b) => a.localeCompare(b));

const mapped = [];
const skipped = [];
const unmapped = [];
const aliasTargets = new Set();

for (const label of sortedLabels) {
  const names = resolveMuscle(label);
  if (names.length === 0) {
    if (isNonMuscleConcept(label)) skipped.push(label);
    else unmapped.push(label);
    continue;
  }
  mapped.push({ label, names });
  for (const name of names) aliasTargets.add(name);
}

const missingStructures = Array.from(aliasTargets)
  .filter((name) => !structureBases.has(name))
  .sort((a, b) => a.localeCompare(b));

const referenceIds = new Set(references.map((reference) => reference.id));
const cited = new Set();
let referenceLinks = 0;
for (const exercise of exercises) {
  for (const id of exercise.referenceIds ?? []) cited.add(id);
  for (const variation of exercise.variations ?? []) {
    for (const id of variation.referenceIds ?? []) cited.add(id);
    for (const effect of variation.effects ?? []) {
      for (const id of effect.referenceIds ?? []) cited.add(id);
    }
  }
}
const missingReferences = Array.from(cited)
  .filter((id) => !referenceIds.has(id))
  .sort();
for (const reference of references) {
  if (reference.doi || reference.url || reference.pmid) referenceLinks += 1;
}

const variations = exercises.reduce(
  (total, exercise) => total + (exercise.variations?.length ?? 0),
  0,
);
const effects = exercises.reduce(
  (total, exercise) =>
    total +
    (exercise.variations ?? []).reduce(
      (inner, variation) => inner + (variation.effects?.length ?? 0),
      0,
    ),
  0,
);

console.log('muscleBurn — deep-research mapping validation');
console.log('------------------------------------------------');
console.log(`exercises:            ${exercises.length}`);
console.log(`variations:           ${variations}`);
console.log(`effects:              ${effects}`);
console.log(`references:           ${references.length} (${referenceLinks} resolvable links)`);
console.log(`research muscle labels: ${sortedLabels.length}`);
console.log(`  mapped:             ${mapped.length}`);
console.log(`  non-muscle labels:  ${skipped.length}`);
console.log(`  unmapped:           ${unmapped.length}`);
console.log(`Écorché muscle bases: ${structureBases.size}`);
console.log(`alias targets missing from atlas: ${missingStructures.length}`);
console.log(`citation ids missing from references.json: ${missingReferences.length}`);

if (verbose) {
  console.log('\nResolved muscle labels:');
  for (const entry of mapped) console.log(`  ${entry.label} -> ${entry.names.join(', ')}`);
}

console.log('\nUnmapped muscle labels:');
if (unmapped.length === 0) console.log('  (none)');
else for (const label of unmapped) console.log(`  - ${label}`);

if (missingStructures.length > 0) {
  console.log('\nAlias targets with no matching Écorché base structure:');
  for (const name of missingStructures) console.log(`  - ${name}`);
}

if (missingReferences.length > 0) {
  console.log('\nCitation ids with no reference record:');
  for (const id of missingReferences) console.log(`  - ${id}`);
}

const hardFailure =
  unmapped.length > 0 || missingStructures.length > 0 || missingReferences.length > 0;
if (strict && hardFailure) {
  console.log('\n--strict: failing because the checks above are non-empty.');
  process.exit(1);
}
console.log('\nOK (default mode always exits 0; rerun with --strict to fail on gaps).');
