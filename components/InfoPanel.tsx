'use client';

import { useMemo, useState } from 'react';
import {
  getStructure,
  STRUCTURE_COUNTS,
  STRUCTURES,
  type Region,
  type StructureInfo,
} from '@/data/anatomy';
import { lookupMuscleMeta } from '@/data/muscles/meta';
import {
  exercisesForMuscle,
  getTrainableMuscle,
  resolveMuscleKey,
} from '@/data/exerciseMuscleIndex';
import { REGION_LABELS, SIDE_LABELS } from '@/lib/muscleColors';
import { formatPoint, getDerivedAttachments } from '@/lib/modelRegistry';

interface InfoPanelProps {
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onFocus: (key: string) => void;
  /** Open an exercise in the Exercises tab (reverse lookup result). */
  onOpenExercise?: (exerciseId: string) => void;
  /** Add a trainable muscle to the Train tab selection and switch to it. */
  onAddTrainingMuscle?: (muscleKey: string) => void;
  /** Current Train tab selection, for the button's pressed state. */
  trainingMuscleKeys?: string[];
}

const LAYER_LABELS: Record<StructureInfo['layer'], string> = {
  skeleton: 'Skeleton',
  deep: 'Deep layer',
  superficial: 'Superficial layer',
};

const regionLabel = (structure: StructureInfo): string =>
  structure.region ? REGION_LABELS[structure.region] : 'Skeleton';

const matches = (structure: StructureInfo, needle: string): boolean => {
  const haystack = [
    structure.name,
    structure.region ? REGION_LABELS[structure.region] : 'skeleton',
    structure.group ?? '',
    structure.fma ?? '',
    structure.layer,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
};

export default function InfoPanel({
  selectedKey,
  onSelect,
  onFocus,
  onOpenExercise,
  onAddTrainingMuscle,
  trainingMuscleKeys = [],
}: InfoPanelProps) {
  const [query, setQuery] = useState('');
  const selected = getStructure(selectedKey);
  const meta = selected && !selected.isBone ? lookupMuscleMeta(selected.name) : null;
  const derived = selected && !selected.isBone ? getDerivedAttachments(selected.key) : null;

  const trainableKey = selected && !selected.isBone ? resolveMuscleKey(selected.name) : null;
  const trainable = trainableKey ? getTrainableMuscle(trainableKey) : undefined;
  const trainingEntries = useMemo(
    () => (trainableKey ? exercisesForMuscle(trainableKey) : []),
    [trainableKey],
  );
  const inTraining = trainableKey ? trainingMuscleKeys.includes(trainableKey) : false;

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return STRUCTURES.filter((structure) => matches(structure, trimmed)).slice(0, 14);
  }, [query]);

  return (
    <div className="panel-body">
      <label className="search">
        <span className="search-label">Search {STRUCTURE_COUNTS.total} structures</span>
        <input
          type="search"
          value={query}
          placeholder="e.g. deltoid, femur, thigh…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {query.trim() ? (
        <ul className="search-results">
          {results.length === 0 ? (
            <li className="muted">No structure matches “{query.trim()}”.</li>
          ) : (
            results.map((structure) => (
              <li key={structure.key}>
                <button
                  type="button"
                  className="result"
                  onClick={() => {
                    onSelect(structure.key);
                    onFocus(structure.key);
                    setQuery('');
                  }}
                >
                  <span>{structure.name}</span>
                  <span className="muted">
                    {regionLabel(structure)} · {SIDE_LABELS[structure.side]}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {selected ? (
        <article className="muscle-detail">
          <header>
            <h2>{selected.name}</h2>
            <p className="pill-row">
              <span className="pill">{regionLabel(selected)}</span>
              <span className="pill">{SIDE_LABELS[selected.side]}</span>
              <span className="pill">{LAYER_LABELS[selected.layer]}</span>
            </p>
          </header>

          <div className="detail-actions">
            <button type="button" className="chip" onClick={() => onFocus(selected.key)}>
              focus
            </button>
            {selected.fma ? <span className="pill pill-mono">{selected.fma}</span> : null}
            {selected.group ? <span className="pill">{selected.group}</span> : null}
          </div>

          {selected.isBone ? (
            <p className="muted empty">
              Skeletal structure. Attachments are recorded on the muscles that attach to
              it; select a muscle to read them.
            </p>
          ) : (
            <dl>
              <dt>Origin</dt>
              <dd>
                {meta ? (
                  meta.origin
                ) : derived ? (
                  <>
                    {formatPoint(derived.origin)} <em className="derived-badge">(derived)</em>
                  </>
                ) : (
                  <span className="missing">Origin not yet documented for this muscle.</span>
                )}
              </dd>

              <dt>Insertion</dt>
              <dd>
                {meta ? (
                  meta.insertion
                ) : derived ? (
                  <>
                    {formatPoint(derived.insertion)} <em className="derived-badge">(derived)</em>
                  </>
                ) : (
                  <span className="missing">Insertion not yet documented for this muscle.</span>
                )}
              </dd>

              <dt>Action</dt>
              <dd>
                {meta ? (
                  meta.action
                ) : (
                  <span className="missing">Action not yet documented for this muscle.</span>
                )}
              </dd>

              <dt>Innervation</dt>
              <dd>
                {meta ? (
                  meta.innervation
                ) : (
                  <span className="missing">
                    Innervation not yet documented for this muscle.
                  </span>
                )}
              </dd>
            </dl>
          )}

          {!selected.isBone ? (
            <section className="mbt-info" aria-labelledby="mbt-info-heading">
              <h3 id="mbt-info-heading">Exercises that train this</h3>
              {trainable ? (
                <>
                  <p className="muted fineprint mbt-info-note">
                    {trainingEntries.length}{' '}
                    {trainingEntries.length === 1 ? 'exercise trains' : 'exercises train'}{' '}
                    {trainable.label.toLowerCase()} as a primary or secondary mover; primary
                    matches are listed first.
                  </p>
                  {trainingEntries.length > 0 ? (
                    <ul className="search-results mbt-info-list">
                      {trainingEntries.slice(0, 6).map((entry) => (
                        <li key={entry.exercise.id}>
                          <button
                            type="button"
                            className="result"
                            onClick={() => onOpenExercise?.(entry.exercise.id)}
                          >
                            <span>{entry.exercise.name}</span>{' '}
                            <span className="pill">{entry.role}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No exercise in the dataset trains this muscle yet.</p>
                  )}
                  {onAddTrainingMuscle ? (
                    <div className="mbt-info-actions">
                      <button
                        type="button"
                        className="chip mbt-add"
                        aria-pressed={inTraining}
                        onClick={() => onAddTrainingMuscle(trainable.key)}
                      >
                        {inTraining
                          ? 'In training selection · open Train'
                          : '+ Add to training selection'}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="muted">
                  This muscle is not named by the exercise dataset, so there is nothing to
                  cross-reference yet.
                </p>
              )}
            </section>
          ) : null}

          {selected.isBone && selected.tissue ? (
            <p className="muted fineprint">Tissue: {selected.tissue}</p>
          ) : null}
          {!meta && !selected.isBone ? (
            <p className="muted fineprint">
              Attachment coordinates marked <em className="derived-badge">(derived)</em> are
              the ends of the mesh&apos;s longest axis, not dissected attachment sites. The
              curated record covers the major muscles only.
            </p>
          ) : null}
        </article>
      ) : (
        <p className="muted empty">
          Hover a muscle for its name, then click it (or use search) to pin its region,
          attachments, action and innervation here.
        </p>
      )}
    </div>
  );
}
