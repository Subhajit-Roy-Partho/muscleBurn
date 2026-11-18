// Source: deep-research workspace
// ~/Documents/deep-research/exercise-form-variations-and-skeletal-muscle-activation-an-e
// (report.md). Data © synthesized from the cited literature; see REFERENCES.
//
// The raw snapshot lives in src/data/raw/references.json (copied verbatim from
// the workspace's references.json) so the app and scripts/validate-mapping.mjs
// share one source. This module only adds typing and presentation helpers.

import type { Reference as BaseReference } from './types';
import rawReferences from './raw/references.json';

/**
 * The research set uses free-form evidence labels ("EMG cohort", "RCT",
 * "systematic review/meta-analysis", "biomechanical crossover", …), which are
 * wider than the placeholder union in src/data/types.ts. Extend locally instead
 * of editing the shared schema.
 */
export interface ResearchReference extends Omit<BaseReference, 'evidenceLevel'> {
  evidenceLevel?: string;
  /** Citation count reported by the metadata source, when known. */
  citedBy?: number;
  /** crossref | openalex | pubmed … when the workspace recorded it. */
  metadataSource?: string;
}

export type EvidenceGrade = 'high' | 'moderate' | 'low';

/** Local, widened view of the shared schema (the research labels are free text). */
export type Reference = ResearchReference;

/** All 114 references, in the source order (90 original + 24 home-exercise). */
export const REFERENCES: Reference[] =
  rawReferences as unknown as ResearchReference[];

export const REFERENCE_BY_ID: Record<string, ResearchReference> = Object.fromEntries(
  REFERENCES.map((reference) => [reference.id, reference]),
);

export const getReference = (id: string): ResearchReference | undefined =>
  REFERENCE_BY_ID[id];

const TITLE_CASE_PARTICLES = new Set([
  'van',
  'von',
  'de',
  'del',
  'der',
  'den',
  'da',
  'di',
  'la',
  'le',
]);

function toNameCase(value: string): string {
  const lower = value.toLocaleLowerCase();
  return lower
    .split(/([ -])/)
    .map((part) => {
      if (!part || part === ' ' || part === '-') return part;
      if (TITLE_CASE_PARTICLES.has(part) && part !== lower.split(/([ -])/)[0]) {
        return part;
      }
      return part.charAt(0).toLocaleUpperCase() + part.slice(1);
    })
    .join('');
}

/**
 * The source stores authors inconsistently: sometimes one name per array entry
 * ("Chloe X. Y. Lee"), sometimes all-caps ("RAFAEL F. ESCAMILLA"), sometimes one
 * packed string ("Murawa M, Fryzowicz A, …"). Normalise to individual names.
 */
export function splitAuthors(authors: readonly string[]): string[] {
  if (authors.length === 1) {
    const packed = authors[0].trim().replace(/\.$/, '');
    const pieces = packed.split(/\s*,\s*/).filter(Boolean);
    if (pieces.length >= 2) return pieces;
  }
  return authors.map((author) => author.trim()).filter(Boolean);
}

/** Surname for citation display, handling all-caps and "Surname Initials" forms. */
export function authorSurname(author: string): string {
  const trimmed = author.trim().replace(/\.$/, '');
  if (!trimmed) return '';
  if (trimmed.includes(',')) {
    return toNameCase(trimmed.split(',')[0].trim());
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return toNameCase(parts[0]);
  const last = parts[parts.length - 1];
  const looksLikeInitials = /^[A-Z]{1,3}$/.test(last);
  return toNameCase(
    looksLikeInitials ? parts.slice(0, -1).join(' ') : last,
  );
}

/**
 * "Author et al. (Year)" — the house citation style.
 * One author: "Maeo (2023)"; two: "Maeo & Larsen (2023)"; three or more:
 * "Maeo et al. (2023)".
 */
export function formatCitation(
  reference: Pick<ResearchReference, 'authors' | 'year'>,
): string {
  const names = splitAuthors(reference.authors ?? []).map(authorSurname).filter(Boolean);
  const year = `(${reference.year})`;
  if (names.length === 0) return year;
  if (names.length === 1) return `${names[0]} ${year}`;
  if (names.length === 2) return `${names[0]} & ${names[1]} ${year}`;
  return `${names[0]} et al. ${year}`;
}

/** Full author list for the detail card, source caps normalised. */
export function formatAuthors(authors: readonly string[], limit = 6): string {
  const names = splitAuthors(authors);
  if (names.length === 0) return '';
  const formatPerson = (name: string): string => {
    const packed = name.match(/^(.+?)\s+([A-Z]{1,3})$/);
    if (packed) return `${toNameCase(packed[1])} ${packed[2]}`;
    return toNameCase(name);
  };
  const shown = names.slice(0, limit).map(formatPerson);
  const suffix = names.length > limit ? `, +${names.length - limit} more` : '';
  return `${shown.join(', ')}${suffix}`;
}

/** Map the research labels onto the three-level badge used by the UI. */
export function evidenceGrade(level?: string): EvidenceGrade {
  const value = (level ?? '').toLowerCase();
  if (value.includes('systematic') || value.includes('meta') || value === 'rct') {
    return 'high';
  }
  if (value.includes('review')) return 'low';
  if (value.includes('cadaver')) return 'low';
  if (
    value.includes('emg') ||
    value.includes('biomech') ||
    value.includes('crossover')
  ) {
    return 'moderate';
  }
  return 'low';
}

export const EVIDENCE_GRADE_LABELS: Record<EvidenceGrade, string> = {
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
};

/** Short explanation used in badge tooltips. */
export const EVIDENCE_GRADE_DEFINITIONS: Record<EvidenceGrade, string> = {
  high: 'Systematic review, meta-analysis, or randomised longitudinal trial.',
  moderate: 'Controlled cross-sectional EMG cohort or biomechanical crossover.',
  low: 'Narrative review or indirect/cadaveric evidence; treat as background.',
};

/** Resolvable public link for a reference (DOI first, then URL, then PubMed). */
export function referenceLink(reference: ResearchReference): string | undefined {
  if (reference.doi) return `https://doi.org/${reference.doi}`;
  if (reference.url) return reference.url;
  if (reference.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`;
  return undefined;
}
