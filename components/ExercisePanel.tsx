'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  EXERCISES,
  EXERCISE_REGION_LABELS,
  exerciseMatches,
  exerciseRegions,
  getExercise,
  listRegions,
  type ExerciseRegion,
  type ResearchExercise,
  type ResearchVariation,
} from '@/data/exercises';
import {
  EVIDENCE_GRADE_DEFINITIONS,
  EVIDENCE_GRADE_LABELS,
  evidenceGrade,
  formatAuthors,
  formatCitation,
  getReference,
  referenceLink,
} from '@/data/references';
import { isNonMuscleConcept } from '@/data/muscleNameMap';
import { buildActivationMap, heatColor, heatRampGradient } from '@/lib/heatmap';

export interface ExercisePanelProps {
  /** Optional controlled selection (URL / 3D-viewer integration). */
  selectedExerciseId?: string | null;
  /** Optional controlled variation, applied to the activation map. */
  selectedVariationId?: string | null;
  onSelectExercise?: (exerciseId: string | null) => void;
  onSelectVariation?: (exerciseId: string, variationId: string | null) => void;
}

type SortKey = 'effect' | 'evidence' | 'name';

const SORT_LABELS: Record<SortKey, string> = {
  effect: 'Effect (largest)',
  evidence: 'Evidence (strongest)',
  name: 'A–Z',
};

const GRADE_RANK = { high: 3, moderate: 2, low: 1 } as const;

const DIRECTION_GLYPH: Record<string, string> = {
  increase: '▲',
  decrease: '▼',
  shift: '●',
};

const DIRECTION_WORD: Record<string, string> = {
  increase: 'increase',
  decrease: 'decrease',
  shift: 'redistribution or no meaningful change',
};

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

function variationEffectScore(variation: ResearchVariation): number {
  return variation.effects.reduce((best, effect) => {
    const score =
      effect.magnitude !== undefined
        ? Math.abs(effect.magnitude)
        : effect.direction === 'shift'
          ? 5
          : 15;
    return Math.max(best, score);
  }, 0);
}

function variationEvidence(
  variation: ResearchVariation,
): 'high' | 'moderate' | 'low' {
  let best: 'high' | 'moderate' | 'low' = 'low';
  for (const referenceId of variation.referenceIds) {
    const reference = getReference(referenceId);
    const grade = evidenceGrade(reference?.evidenceLevel);
    if (GRADE_RANK[grade] > GRADE_RANK[best]) best = grade;
  }
  return best;
}

function EvidenceBadge({ grade }: { grade: 'high' | 'moderate' | 'low' }) {
  return (
    <span
      className={`mbx-evidence mbx-evidence-${grade}`}
      title={EVIDENCE_GRADE_DEFINITIONS[grade]}
    >
      {EVIDENCE_GRADE_LABELS[grade]}
    </span>
  );
}

function CitationChip({ referenceId }: { referenceId: string }) {
  const [open, setOpen] = useState(false);
  const reference = getReference(referenceId);

  if (!reference) {
    return (
      <span className="mbx-chip mbx-chip-missing" title="Reference not found">
        {referenceId}
      </span>
    );
  }

  const grade = evidenceGrade(reference.evidenceLevel);
  const link = referenceLink(reference);

  return (
    <span className="mbx-citation-wrap">
      <button
        type="button"
        className="mbx-chip"
        aria-expanded={open}
        title={`${reference.title} — ${reference.journal ?? ''}`}
        onClick={() => setOpen((value) => !value)}
      >
        {formatCitation(reference)}
      </button>
      {open ? (
        <span className="mbx-ref-detail" role="region" aria-label="Reference details">
          <span className="mbx-ref-title">{reference.title}</span>
          <span className="mbx-ref-meta">
            {formatAuthors(reference.authors)} · {reference.year}
          </span>
          {reference.journal ? (
            <span className="mbx-ref-meta">{reference.journal}</span>
          ) : null}
          <span className="mbx-ref-meta mbx-mono">
            {reference.doi ? (
              <a href={link} target="_blank" rel="noreferrer">
                DOI {reference.doi} ↗
              </a>
            ) : link ? (
              <a href={link} target="_blank" rel="noreferrer">
                Source ↗
              </a>
            ) : (
              'No DOI recorded'
            )}
            {reference.pmid ? (
              <>
                {' · '}
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  PMID {reference.pmid} ↗
                </a>
              </>
            ) : null}
          </span>
          <span className="mbx-ref-meta">
            Evidence: <EvidenceBadge grade={grade} />
            {reference.evidenceLevel ? ` (${reference.evidenceLevel})` : ''}
          </span>
        </span>
      ) : null}
    </span>
  );
}

function ActivationSummary({
  exercise,
  variation,
}: {
  exercise: ResearchExercise;
  variation: ResearchVariation | null;
}) {
  const activation = useMemo(
    () => buildActivationMap(exercise, variation?.id),
    [exercise, variation],
  );
  const top = useMemo(
    () =>
      Array.from(activation.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [activation],
  );

  if (top.length === 0) {
    return (
      <p className="muted">
        No mapped muscles for this exercise. The source labels could not be resolved to atlas
        structures.
      </p>
    );
  }

  return (
    <div className="mbx-activation">
      <div className="mbx-activation-head">
        <h4>Activation</h4>
        <span className="mbx-muted">
          {variation ? `vs reference · ${variation.name}` : 'Reference condition'}
        </span>
      </div>
      <ul className="mbx-activation-list">
        {top.map(([muscle, value]) => (
          <li key={muscle}>
            <span className="mbx-activation-name">{capitalize(muscle)}</span>
            <span className="mbx-bar" aria-hidden="true">
              <span
                className="mbx-bar-fill"
                style={{ width: `${Math.round(value * 100)}%`, background: heatColor(value) }}
              />
            </span>
            <span className="mbx-activation-value mbx-mono">
              {Math.round(value * 100)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mbx-legend" aria-hidden="true">
        <span className="mbx-legend-bar" style={{ background: heatRampGradient() }} />
        <span className="mbx-legend-ticks mbx-mono">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </span>
      </div>
      <p className="mbx-caption">
        Relative score (0–100) built from primary (90) and secondary (55) muscle tags plus the
        selected variation&apos;s reported direction (+25 increase, −30 decrease, ±10
        redistribution). A comparison aid, not a measured %MVIC value.
      </p>
    </div>
  );
}

function VariationRow({
  exercise,
  variation,
  active,
  onActivate,
}: {
  exercise: ResearchExercise;
  variation: ResearchVariation;
  active: boolean;
  onActivate: () => void;
}) {
  const grade = variationEvidence(variation);

  return (
    <li className={active ? 'mbx-variation mbx-variation-active' : 'mbx-variation'}>
      <div className="mbx-variation-head">
        <button
          type="button"
          className="mbx-variation-select"
          aria-pressed={active}
          onClick={onActivate}
          title={active ? 'Clear this variation' : 'Show this variation in the heat map'}
        >
          <span>{variation.name}</span>
          <span className="mbx-variation-state">{active ? 'On model ✓' : 'Show'}</span>
        </button>
        <EvidenceBadge grade={grade} />
      </div>
      <p className="mbx-variation-desc">{variation.description}</p>
      <ul className="mbx-effects">
        {variation.effects.map((effect, index) => (
          <li key={`${variation.id}-${index}`} className="mbx-effect">
            <span
              className={`mbx-direction mbx-direction-${effect.direction}`}
              aria-hidden="true"
            >
              {DIRECTION_GLYPH[effect.direction] ?? '●'}
            </span>
            <span className="mbx-sr-only">{DIRECTION_WORD[effect.direction] ?? 'effect'}</span>
            <span className="mbx-effect-muscle">{capitalize(effect.muscle)}</span>
            {isNonMuscleConcept(effect.muscle) ? (
              <span className="mbx-nonmuscle">mechanical / non-muscle</span>
            ) : null}
            <span className="mbx-effect-magnitude mbx-mono">{effect.magnitudeText}</span>
            <span className="mbx-inline-refs">
              {effect.referenceIds.map((id) => (
                <CitationChip key={`${variation.id}-${index}-${id}`} referenceId={id} />
              ))}
            </span>
            {effect.note ? <em className="mbx-effect-note">{effect.note}</em> : null}
          </li>
        ))}
      </ul>
      <p className="mbx-caption">
        Magnitude is the change reported by the source versus the reference variation; many
        entries are qualitative, so no numerical bar is drawn. Differences within the reported
        confidence interval are not meaningful. {exercise.name} · {variation.effects.length}{' '}
        cited effect{variation.effects.length === 1 ? '' : 's'}.
      </p>
    </li>
  );
}

const PANEL_STYLES = `
.mbx-panel { display: flex; flex-direction: column; gap: 12px; }
.mbx-eyebrow { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.mbx-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mbx-chip, .mbx-filter-chip, .mbx-back, .mbx-clear, .mbx-variation-select {
  font-family: inherit; cursor: pointer;
}
.mbx-filter-chip { border: 1px solid var(--line-strong); background: var(--panel-soft); color: var(--text); font-size: .72rem; padding: 3px 10px; border-radius: 999px; }
.mbx-filter-chip[aria-pressed="true"] { background: rgba(224,87,79,.18); border-color: var(--accent); color: #ffe6e2; }
.mbx-filter-chip:focus-visible, .mbx-chip:focus-visible, .mbx-back:focus-visible, .mbx-variation-select:focus-visible, .mbx-exercise:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mbx-clear { border: 0; background: none; color: var(--accent-soft); font-size: .72rem; padding: 0; text-decoration: underline; }
.mbx-back { align-self: flex-start; border: 0; background: none; color: var(--accent-soft); font-size: .78rem; padding: 0; }
.mbx-result-count { margin: 0; color: var(--muted); font-size: .72rem; }
.mbx-exercise-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.mbx-exercise { width: 100%; display: flex; flex-direction: column; gap: 3px; text-align: left; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel-soft); color: var(--text); font-family: inherit; cursor: pointer; }
.mbx-exercise:hover { border-color: var(--accent); }
.mbx-exercise-name { font-size: .86rem; font-weight: 600; }
.mbx-exercise-meta { font-size: .7rem; color: var(--muted); }
.mbx-detail-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
.mbx-detail-head h2 { margin: 0; font-size: 1.08rem; }
.mbx-detail-regions { display: flex; flex-wrap: wrap; gap: 5px; margin: 6px 0 10px; }
.mbx-muscles { display: grid; grid-template-columns: 78px minmax(0,1fr); gap: 4px 10px; margin: 0 0 12px; }
.mbx-muscles dt { color: var(--accent-soft); font-size: .68rem; text-transform: uppercase; letter-spacing: .07em; padding-top: 2px; }
.mbx-muscles dd { margin: 0; font-size: .78rem; line-height: 1.45; }
.mbx-activation { border: 1px solid var(--line); border-radius: 9px; background: #0a1118; padding: 10px; margin-bottom: 14px; }
.mbx-activation-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; margin-bottom: 8px; }
.mbx-activation-head h4 { margin: 0; font-size: .74rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
.mbx-activation-list { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.mbx-activation-list li { display: grid; grid-template-columns: minmax(0,1fr) 86px 26px; gap: 8px; align-items: center; font-size: .75rem; }
.mbx-activation-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mbx-bar { height: 5px; border-radius: 999px; background: rgba(255,255,255,.06); overflow: hidden; }
.mbx-bar-fill { display: block; height: 100%; border-radius: 999px; }
.mbx-activation-value { text-align: right; color: var(--text); }
.mbx-legend-bar { display: block; height: 8px; border-radius: 999px; border: 1px solid rgba(255,255,255,.18); }
.mbx-legend-ticks { display: flex; justify-content: space-between; color: var(--muted); font-size: 10px; margin-top: 2px; }
.mbx-caption { margin: 6px 0 0; color: var(--muted); font-size: .68rem; line-height: 1.45; }
.mbx-muted { color: var(--muted); font-size: .7rem; }
.mbx-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.mbx-variations-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.mbx-variations-head h3 { margin: 0; }
.mbx-variations-head label { display: flex; align-items: center; gap: 5px; color: var(--muted); font-size: .68rem; }
.mbx-variations-head select { background: #0a1017; color: var(--text); border: 1px solid var(--line-strong); border-radius: 6px; font-family: inherit; font-size: .7rem; padding: 3px 5px; }
.mbx-variations { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.mbx-variation { border: 1px solid var(--line); border-left: 3px solid transparent; border-radius: 8px; background: #0c131a; padding: 9px 10px; }
.mbx-variation-active { border-left-color: var(--accent); background: #131a21; }
.mbx-variation-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.mbx-variation-select { display: flex; align-items: baseline; gap: 8px; flex: 1; border: 0; padding: 0; background: none; color: var(--text); font-size: .8rem; font-weight: 600; text-align: left; }
.mbx-variation-select:hover span:first-child { color: var(--accent-soft); }
.mbx-variation-state { font-size: .62rem; color: var(--muted); border: 1px solid var(--line-strong); border-radius: 999px; padding: 1px 6px; white-space: nowrap; }
.mbx-variation-desc { margin: 4px 0 7px; color: var(--muted); font-size: .73rem; line-height: 1.45; }
.mbx-effects { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.mbx-effect { display: flex; flex-wrap: wrap; align-items: baseline; gap: 5px; font-size: .73rem; padding-bottom: 6px; border-bottom: 1px dashed var(--line); }
.mbx-effect:last-child { border-bottom: 0; padding-bottom: 0; }
.mbx-direction { font-size: .68rem; line-height: 1; }
.mbx-direction-increase { color: #F79E2B; }
.mbx-direction-decrease { color: #38BDF8; }
.mbx-direction-shift { color: var(--muted); }
.mbx-effect-muscle { color: var(--text); font-weight: 600; }
.mbx-nonmuscle { font-size: .6rem; text-transform: uppercase; letter-spacing: .05em; color: var(--warn); border: 1px solid rgba(232,180,90,.35); border-radius: 4px; padding: 0 4px; }
.mbx-effect-magnitude { flex-basis: 100%; color: #d5e2ec; font-size: .7rem; line-height: 1.45; }
.mbx-effect-note { flex-basis: 100%; color: var(--muted); font-size: .69rem; line-height: 1.45; }
.mbx-inline-refs { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.mbx-chip { font-family: var(--font-mono); font-size: 10px; line-height: 1.4; color: var(--accent-soft); border: 1px solid var(--line-strong); background: #0a1118; border-radius: 4px; padding: 1px 5px; }
.mbx-chip[aria-expanded="true"] { border-color: var(--accent); color: #ffe6e2; }
.mbx-chip-missing { color: var(--warn); }
.mbx-citation-wrap { display: inline-flex; flex-direction: column; gap: 2px; max-width: 100%; }
.mbx-ref-detail { display: flex; flex-direction: column; gap: 3px; flex-basis: 100%; margin: 4px 0 2px; padding: 8px 9px; border: 1px solid var(--line-strong); border-radius: 7px; background: #0a1017; max-width: 34em; }
.mbx-ref-title { font-size: .74rem; line-height: 1.4; color: var(--text); }
.mbx-ref-meta { font-size: .68rem; line-height: 1.45; color: var(--muted); }
.mbx-ref-meta a { color: var(--accent-soft); }
.mbx-evidence { font-size: .6rem; text-transform: uppercase; letter-spacing: .06em; border-bottom: 2px solid var(--line-strong); padding-bottom: 1px; white-space: nowrap; }
.mbx-evidence-high { border-bottom-color: var(--teal); color: var(--teal); }
.mbx-evidence-moderate { border-bottom-color: var(--warn); color: var(--warn); }
.mbx-evidence-low { border-bottom-color: var(--line-strong); color: var(--muted); }
.mbx-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.mbx-caveat { margin: 12px 0 0; padding: 9px 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--muted); font-size: .7rem; line-height: 1.5; }
`;

export default function ExercisePanel({
  selectedExerciseId = null,
  selectedVariationId = null,
  onSelectExercise,
  onSelectVariation,
}: ExercisePanelProps) {
  const [query, setQuery] = useState('');
  const [regions, setRegions] = useState<ExerciseRegion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(selectedExerciseId);
  const [activeVariationId, setActiveVariationId] = useState<string | null>(
    selectedVariationId,
  );
  const [sort, setSort] = useState<SortKey>('effect');
  const [sortAnnouncement, setSortAnnouncement] = useState('');

  useEffect(() => {
    if (selectedExerciseId !== undefined) setSelectedId(selectedExerciseId);
  }, [selectedExerciseId]);

  useEffect(() => {
    if (selectedVariationId !== undefined) setActiveVariationId(selectedVariationId);
  }, [selectedVariationId]);

  const filtered = useMemo(
    () =>
      EXERCISES.filter((exercise) => {
        if (
          regions.length > 0 &&
          !regions.some((region) => exerciseRegions(exercise).includes(region))
        ) {
          return false;
        }
        return exerciseMatches(exercise, query);
      }),
    [regions, query],
  );

  const selected = selectedId ? getExercise(selectedId) : undefined;
  const activeVariation =
    selected && activeVariationId
      ? (selected.variations.find((variation) => variation.id === activeVariationId) ??
        null)
      : null;

  const variations = useMemo(() => {
    if (!selected) return [];
    const list = [...selected.variations];
    if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'evidence') {
      list.sort(
        (a, b) =>
          GRADE_RANK[variationEvidence(b)] - GRADE_RANK[variationEvidence(a)] ||
          a.name.localeCompare(b.name),
      );
    } else {
      list.sort(
        (a, b) =>
          variationEffectScore(b) - variationEffectScore(a) ||
          a.name.localeCompare(b.name),
      );
    }
    return list;
  }, [selected, sort]);

  const chooseExercise = (id: string | null) => {
    setSelectedId(id);
    setActiveVariationId(null);
    setQuery('');
    onSelectExercise?.(id);
    if (id) onSelectVariation?.(id, null);
  };

  const chooseVariation = (variationId: string | null) => {
    if (!selected) return;
    const next = activeVariationId === variationId ? null : variationId;
    setActiveVariationId(next);
    onSelectVariation?.(selected.id, next);
  };

  const toggleRegion = (region: ExerciseRegion) => {
    setRegions((previous) =>
      previous.includes(region)
        ? previous.filter((entry) => entry !== region)
        : [...previous, region],
    );
  };

  const handleSort = (value: SortKey) => {
    setSort(value);
    setSortAnnouncement(`Sorted by ${SORT_LABELS[value].toLowerCase()}.`);
  };

  const browsing = !selected || query.trim().length > 0 || regions.length > 0;

  return (
    <div className="panel-body mbx-panel">
      <style>{PANEL_STYLES}</style>

      <label className="search mbx-search">
        <span className="search-label">Search {EXERCISES.length} exercises</span>
        <input
          type="search"
          value={query}
          placeholder="e.g. squat, bench press, biceps…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="mbx-filter">
        <span className="mbx-eyebrow">Region filter</span>
        <div className="mbx-chips" role="group" aria-label="Filter by body region">
          <button
            type="button"
            className="mbx-filter-chip"
            aria-pressed={regions.length === 0}
            onClick={() => setRegions([])}
          >
            All
          </button>
          {listRegions().map((region) => (
            <button
              key={region}
              type="button"
              className="mbx-filter-chip"
              aria-pressed={regions.includes(region)}
              onClick={() => toggleRegion(region)}
            >
              {EXERCISE_REGION_LABELS[region]}
            </button>
          ))}
        </div>
        {regions.length > 0 ? (
          <button type="button" className="mbx-clear" onClick={() => setRegions([])}>
            Clear filters
          </button>
        ) : null}
      </div>

      {browsing ? (
        <>
          {selected ? (
            <button type="button" className="mbx-back" onClick={() => chooseExercise(null)}>
              ← All exercises
            </button>
          ) : (
            <p className="mbx-caption">
              Pick an exercise to see which muscles it works and how form changes the demand.
            </p>
          )}
          <p className="mbx-result-count">
            {filtered.length} exercise{filtered.length === 1 ? '' : 's'}
            {regions.length > 0
              ? ` · ${regions.map((region) => EXERCISE_REGION_LABELS[region]).join(', ')}`
              : ''}
          </p>
          {filtered.length === 0 ? (
            <p className="muted empty">
              No exercises match those regions.
              {regions.length > 0 ? (
                <>
                  {' '}
                  <button
                    type="button"
                    className="mbx-clear"
                    onClick={() => setRegions([])}
                  >
                    Clear filters
                  </button>
                </>
              ) : null}
            </p>
          ) : (
            <ul className="mbx-exercise-list">
              {filtered.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    type="button"
                    className="mbx-exercise"
                    onClick={() => chooseExercise(exercise.id)}
                  >
                    <span className="mbx-exercise-name">{exercise.name}</span>
                    <span className="mbx-exercise-meta">
                      {capitalize(exercise.category)} ·{' '}
                      {exerciseRegions(exercise)
                        .map((region) => EXERCISE_REGION_LABELS[region])
                        .join(' · ')}{' '}
                      · {exercise.variations.length} variation
                      {exercise.variations.length === 1 ? '' : 's'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : selected ? (
        <article className="mbx-detail">
          <button type="button" className="mbx-back" onClick={() => chooseExercise(null)}>
            ← All exercises
          </button>
          <div className="mbx-detail-head">
            <h2>{selected.name}</h2>
            <span className="pill">{capitalize(selected.category)}</span>
          </div>
          <div className="mbx-detail-regions">
            {exerciseRegions(selected).map((region) => (
              <span key={region} className="pill">
                {EXERCISE_REGION_LABELS[region]}
              </span>
            ))}
          </div>

          <dl className="mbx-muscles">
            <dt>Primary</dt>
            <dd>{selected.primaryMuscles.map(capitalize).join(', ')}</dd>
            <dt>Secondary</dt>
            <dd>
              {selected.secondaryMuscles.length > 0
                ? selected.secondaryMuscles.map(capitalize).join(', ')
                : '—'}
            </dd>
          </dl>

          <ActivationSummary exercise={selected} variation={activeVariation} />

          <section aria-labelledby="mbx-variations-heading">
            <div className="mbx-variations-head">
              <h3 id="mbx-variations-heading">
                Variations ({selected.variations.length})
              </h3>
              {selected.variations.length > 1 ? (
                <label>
                  Sort
                  <select
                    value={sort}
                    onChange={(event) => handleSort(event.target.value as SortKey)}
                  >
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                      <option key={key} value={key}>
                        {SORT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
            <p className="mbx-sr-only" aria-live="polite">
              {sortAnnouncement}
            </p>

            {selected.variations.length === 0 ? (
              <p className="muted empty">
                No form variations are documented for this exercise yet.
              </p>
            ) : (
              <ul className="mbx-variations">
                {variations.map((variation) => (
                  <VariationRow
                    key={variation.id}
                    exercise={selected}
                    variation={variation}
                    active={activeVariationId === variation.id}
                    onActivate={() => chooseVariation(variation.id)}
                  />
                ))}
              </ul>
            )}
          </section>

          <p className="mbx-caveat">
            Activation values are group means from mixed surface-EMG and biomechanics
            protocols. Acute EMG is not a validated predictor of hypertrophy, and mechanical
            stress is a separate construct. Form choices should target a muscle or manage a
            joint, not chase a larger EMG trace. This is educational information, not medical
            or training advice.
          </p>
        </article>
      ) : null}
    </div>
  );
}
