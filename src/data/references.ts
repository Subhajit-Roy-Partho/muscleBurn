import type { Reference } from './types';

/**
 * Placeholder reference set.
 *
 * Only textbook entries are listed here because their metadata is easy to
 * verify. Add primary literature (with DOI/PMID) as exercise notes become
 * evidence-backed; never invent a DOI.
 */
export const REFERENCES: Reference[] = [
  {
    id: 'ref-moore-anatomy',
    title: 'Clinically Oriented Anatomy (8th ed.)',
    authors: ['Moore, K. L.', 'Dalley, A. F.', 'Agur, A. M. R.'],
    year: 2018,
    journal: 'Wolters Kluwer',
    evidenceLevel: 'textbook',
  },
  {
    id: 'ref-delavier-anatomy',
    title: 'Strength Training Anatomy (4th ed.)',
    authors: ['Delavier, F.'],
    year: 2022,
    journal: 'Human Kinetics',
    evidenceLevel: 'textbook',
  },
];

export const REFERENCE_BY_ID: Record<string, Reference> = Object.fromEntries(
  REFERENCES.map((r) => [r.id, r]),
);

export const getReference = (id: string): Reference | undefined => REFERENCE_BY_ID[id];
