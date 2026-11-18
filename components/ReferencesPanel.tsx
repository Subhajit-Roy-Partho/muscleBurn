'use client';

import { useMemo, useState } from 'react';
import {
  EVIDENCE_GRADE_DEFINITIONS,
  EVIDENCE_GRADE_LABELS,
  REFERENCES,
  evidenceGrade,
  formatAuthors,
  referenceLink,
  splitAuthors,
  authorSurname,
  type ResearchReference,
} from '@/data/references';

const GRADE_RANK = { high: 3, moderate: 2, low: 1 } as const;

const CAVEATS: Array<{ title: string; body: string }> = [
  {
    title: 'EMG is not mechanical stress, and neither is hypertrophy',
    body:
      'Surface EMG amplitude (%MVIC) indexes electrical drive under one electrode placement and normalisation scheme; joint moments, ligament forces and spinal compression are modelled mechanical quantities. Acute EMG is not a validated predictor of growth — hip thrust vs squat produced roughly twice the glute EMG acutely but similar gluteal hypertrophy after nine weeks.',
  },
  {
    title: 'Long-length loading generalises, with exceptions',
    body:
      'Training at long muscle lengths produced larger hypertrophy for hamstrings (seated vs prone leg curl), triceps (overhead vs neutral), rectus femoris, biceps and gastrocnemius across five independent trials. The effect is not universal: the monoarticular hamstring short head and vastus lateralis did not differ. Load at a long length still needs meaningful external torque.',
  },
  {
    title: 'Grip width is a small lever, except at the shoulder',
    body:
      'Bench, pulldown, row and pull-up studies show small or null EMG differences across grip widths. Wide grips do increase shoulder joint moments and rotator-cuff demand, so width is a joint-comfort and specificity choice rather than a lat or pec isolation trick.',
  },
  {
    title: 'Contradictions are retained, not smoothed over',
    body:
      'Decline bench for the sternal pectoralis remains unresolved (Barnett 1995 vs López-Vivancos 2023); front vs behind-neck pressing is phase-dependent; leg-press foot placement is a null result. Directions are reported as the sources found them.',
  },
  {
    title: 'Gaps the review could not close',
    body:
      'No eligible comparisons for deficit/block pulls, seated vs standing overhead press, overhead-press grip width, standing vs seated calf raise, chest-fly implements, neutral-grip curl, eccentric tempo, sex/training-status moderation, or load–variation interactions outside ~60–80 % 1RM. These are open questions, not claims.',
  },
  {
    title: 'Coverage and retraction limits',
    body:
      'Most sources were coded from structured abstracts and open-access text; five paywalled classics used ASU Library full text. No retraction or expression-of-concern notice appeared in Crossref/OpenAlex metadata, but LibKey retraction gating was unavailable, so this is not a guarantee. No meta-analysis was performed.',
  },
];

function GradeBadge({ reference }: { reference: ResearchReference }) {
  const grade = evidenceGrade(reference.evidenceLevel);
  return (
    <span
      className={`mbr-evidence mbr-evidence-${grade}`}
      title={`${EVIDENCE_GRADE_DEFINITIONS[grade]} Source label: ${
        reference.evidenceLevel ?? 'unlabelled'
      }`}
    >
      {EVIDENCE_GRADE_LABELS[grade]}
    </span>
  );
}

function matches(reference: ResearchReference, needle: string): boolean {
  if (!needle) return true;
  const haystack = [
    reference.title,
    reference.journal ?? '',
    reference.doi ?? '',
    reference.pmid ?? '',
    String(reference.year),
    reference.evidenceLevel ?? '',
    ...splitAuthors(reference.authors),
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  return haystack.includes(needle);
}

const STYLES = `
.mbr-panel { display: flex; flex-direction: column; gap: 12px; }
.mbr-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.mbr-head h2 { margin: 0; font-size: 1.08rem; }
.mbr-count { color: var(--muted); font-size: .7rem; }
.mbr-note { border: 1px solid var(--line); border-radius: 9px; background: #0a1118; padding: 10px; }
.mbr-note h3 { margin: 0 0 6px; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.mbr-note p { margin: 0 0 6px; color: var(--muted); font-size: .72rem; line-height: 1.5; }
.mbr-note p:last-child { margin-bottom: 0; }
.mbr-caveats { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.mbr-caveats li { border-left: 2px solid var(--line-strong); padding-left: 8px; }
.mbr-caveats strong { display: block; font-size: .74rem; color: var(--text); margin-bottom: 2px; }
.mbr-caveats span { display: block; color: var(--muted); font-size: .7rem; line-height: 1.5; }
.mbr-grades { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.mbr-controls { display: flex; flex-direction: column; gap: 6px; }
.mbr-search { display: flex; flex-direction: column; gap: 5px; }
.mbr-search span { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.mbr-search input { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line-strong); background: #0a1017; color: var(--text); font-family: inherit; font-size: .85rem; }
.mbr-search input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(224,87,79,.18); }
.mbr-sortrow { display: flex; justify-content: space-between; gap: 8px; color: var(--muted); font-size: .68rem; }
.mbr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.mbr-ref { border: 1px solid var(--line); border-radius: 8px; background: #0c131a; padding: 9px 10px; }
.mbr-ref-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.mbr-ref-title { font-size: .8rem; font-weight: 600; line-height: 1.4; color: var(--text); }
.mbr-ref-year { font-family: var(--font-mono); font-size: .7rem; color: var(--muted); white-space: nowrap; }
.mbr-ref-meta { margin: 3px 0 0; color: var(--muted); font-size: .68rem; line-height: 1.45; }
.mbr-ref-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; font-family: var(--font-mono); font-size: .65rem; }
.mbr-ref-links a { color: var(--accent-soft); overflow-wrap: anywhere; }
.mbr-evidence { font-size: .6rem; text-transform: uppercase; letter-spacing: .06em; border-bottom: 2px solid var(--line-strong); padding-bottom: 1px; white-space: nowrap; }
.mbr-evidence-high { border-bottom-color: var(--teal); color: var(--teal); }
.mbr-evidence-moderate { border-bottom-color: var(--warn); color: var(--warn); }
.mbr-evidence-low { border-bottom-color: var(--line-strong); color: var(--muted); }
.mbr-empty { border: 1px dashed var(--line-strong); border-radius: 8px; padding: 14px; color: var(--muted); font-size: .78rem; line-height: 1.5; }
`;

export default function ReferencesPanel({ embedded = false }: { embedded?: boolean }) {
  const [query, setQuery] = useState('');

  const needle = query
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  const visible = useMemo(() => {
    return [...REFERENCES]
      .filter((reference) => matches(reference, needle))
      .sort(
        (a, b) =>
          b.year - a.year ||
          (authorSurname(splitAuthors(a.authors)[0] ?? '') || '').localeCompare(
            authorSurname(splitAuthors(b.authors)[0] ?? '') || '',
          ),
      );
  }, [needle]);

  const high = REFERENCES.filter(
    (reference) => evidenceGrade(reference.evidenceLevel) === 'high',
  ).length;

  return (
    <div className={embedded ? 'mbr-panel' : 'panel-body mbr-panel'}>
      <style>{STYLES}</style>

      <div className="mbr-head">
        <h2>References</h2>
        <span className="mbr-count">
          {REFERENCES.length} sources · {high} high-evidence
        </span>
      </div>

      <div className="mbr-note">
        <h3>How activation is measured</h3>
        <p>
          Values in this atlas are group means of normalised surface EMG (%MVIC or %peak) from
          cross-sectional comparisons, biomechanical models and longitudinal training trials.
          They describe acute activation in a specific protocol — not growth potential, not
          mechanical stress, and not an individual prescription.
        </p>
        <p>
          Evidence badges grade the study design: High = systematic review/meta-analysis or
          randomised trial; Moderate = controlled EMG cohort or biomechanical crossover; Low =
          narrative review or indirect/cadaveric evidence.
        </p>
        <div className="mbr-grades">
          {(['high', 'moderate', 'low'] as const).map((grade) => (
            <span key={grade} className={`mbr-evidence mbr-evidence-${grade}`}>
              {EVIDENCE_GRADE_LABELS[grade]}
            </span>
          ))}
        </div>
      </div>

      <div className="mbr-note">
        <h3>Headline caveats</h3>
        <ul className="mbr-caveats">
          {CAVEATS.map((caveat) => (
            <li key={caveat.title}>
              <strong>{caveat.title}</strong>
              <span>{caveat.body}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mbr-controls">
        <label className="mbr-search">
          <span>Search references</span>
          <input
            type="search"
            value={query}
            placeholder="author, title, journal, DOI, year…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="mbr-sortrow">
          <span>
            {visible.length} match{visible.length === 1 ? '' : 'es'}
            {needle ? ` for “${query.trim()}”` : ''}
          </span>
          <span>Newest first</span>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mbr-empty">
          No reference matches “{query.trim()}”. Try a surname, a DOI fragment, or clear the
          search.
        </p>
      ) : (
        <ol className="mbr-list">
          {visible.map((reference) => {
            const link = referenceLink(reference);
            return (
              <li key={reference.id} className="mbr-ref">
                <div className="mbr-ref-head">
                  <span className="mbr-ref-title">{reference.title}</span>
                  <span className="mbr-ref-year">{reference.year}</span>
                </div>
                <p className="mbr-ref-meta">
                  {formatAuthors(reference.authors)}
                </p>
                {reference.journal ? (
                  <p className="mbr-ref-meta">{reference.journal}</p>
                ) : null}
                <div className="mbr-ref-links">
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer">
                      {reference.doi ? `DOI ${reference.doi} ↗` : 'Source ↗'}
                    </a>
                  ) : null}
                  {reference.pmid ? (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      PMID {reference.pmid} ↗
                    </a>
                  ) : null}
                  <GradeBadge reference={reference} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
