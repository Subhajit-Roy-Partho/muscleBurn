'use client';

import { useMemo, useState } from 'react';
import {
  EXERCISES,
  EXERCISE_REGION_LABELS,
  EXERCISE_SETTING_LABELS,
  exerciseMatchesSetting,
  exerciseSetting,
  type ExerciseSettingFilter,
} from '@/data/exercises';
import {
  TRAIN_REGION_ORDER,
  getTrainableMuscle,
  listTrainableMuscles,
  rankExercisesForMuscles,
  type MatchMode,
  type MuscleRole,
  type TrainableMuscle,
} from '@/data/exerciseMuscleIndex';

export interface TrainPanelProps {
  /** Selected trainable-muscle keys, owned by app/page.tsx. */
  selectedMuscles: string[];
  onSelectedMusclesChange: (muscles: string[]) => void;
  /** Open an exercise in the Exercises tab. */
  onOpenExercise: (exerciseId: string) => void;
}

const SETTING_FILTERS: ExerciseSettingFilter[] = ['all', 'home', 'gym'];

const SETTING_FILTER_LABELS: Record<ExerciseSettingFilter, string> = {
  all: 'All',
  home: 'Home',
  gym: 'Gym',
};

const ROLE_LABELS: Record<MuscleRole, string> = {
  primary: 'primary',
  secondary: 'secondary',
};

function normalizeQuery(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function muscleMatchesQuery(muscle: TrainableMuscle, needle: string): boolean {
  if (!needle) return true;
  const haystack = [muscle.label, ...muscle.labels, ...muscle.aliases, ...muscle.meshKeys]
    .join(' ')
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
  return haystack.includes(needle);
}

function SettingBadge({ exercise }: { exercise: { context?: 'home' | 'gym' | 'both' } }) {
  const setting = exerciseSetting(exercise);
  return (
    <span className={`mbt-setting mbt-setting-${setting}`}>
      <span className="mbt-setting-dot" aria-hidden="true" />
      {EXERCISE_SETTING_LABELS[setting]}
    </span>
  );
}

export default function TrainPanel({
  selectedMuscles,
  onSelectedMusclesChange,
  onOpenExercise,
}: TrainPanelProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<MatchMode>('any');
  const [setting, setSetting] = useState<ExerciseSettingFilter>('all');

  const muscles = useMemo(() => listTrainableMuscles(), []);
  const needle = normalizeQuery(query);

  const grouped = useMemo(() => {
    const visible = muscles.filter((muscle) => muscleMatchesQuery(muscle, needle));
    const buckets = new Map<string, TrainableMuscle[]>();
    for (const muscle of visible) {
      const bucket = muscle.region ?? 'other';
      const list = buckets.get(bucket) ?? [];
      list.push(muscle);
      buckets.set(bucket, list);
    }
    const order = [...TRAIN_REGION_ORDER, 'other'];
    return order
      .filter((region) => buckets.has(region))
      .map((region) => ({
        region,
        title:
          region === 'other'
            ? 'Other'
            : EXERCISE_REGION_LABELS[region as keyof typeof EXERCISE_REGION_LABELS],
        muscles: buckets.get(region) ?? [],
      }));
  }, [muscles, needle]);

  const selected = useMemo(
    () =>
      selectedMuscles
        .map((key) => getTrainableMuscle(key))
        .filter((muscle): muscle is TrainableMuscle => Boolean(muscle)),
    [selectedMuscles],
  );

  const ranked = useMemo(
    () => rankExercisesForMuscles(selectedMuscles, mode),
    [selectedMuscles, mode],
  );

  const filtered = useMemo(
    () =>
      ranked.filter((entry) => exerciseMatchesSetting(entry.exercise, setting)),
    [ranked, setting],
  );

  const toggleMuscle = (key: string) => {
    onSelectedMusclesChange(
      selectedMuscles.includes(key)
        ? selectedMuscles.filter((entry) => entry !== key)
        : [...selectedMuscles, key],
    );
  };

  const muscleNoun = (count: number) => (count === 1 ? 'muscle' : 'muscles');
  const exerciseNoun = (count: number) => (count === 1 ? 'exercise' : 'exercises');

  return (
    <div className="panel-body mbt-panel">
      <label className="search mbt-search">
        <span className="search-label">Search {muscles.length} trainable muscles</span>
        <input
          type="search"
          value={query}
          placeholder="e.g. gluteus, quads, biceps…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <fieldset className="mbt-block">
        <legend className="mbt-legend">Muscles to train</legend>
        {grouped.length === 0 ? (
          <p className="muted mbt-search-empty">No muscle matches “{query.trim()}”.</p>
        ) : (
          grouped.map((group) => {
            const headingId = `mbt-region-${group.region}`;
            return (
              <div
                key={group.region}
                className="mbt-region"
                role="group"
                aria-labelledby={headingId}
              >
                <p id={headingId} className="mbt-region-label">
                  {group.title}
                </p>
                <ul className="mbt-options">
                  {group.muscles.map((muscle) => (
                    <li key={muscle.key}>
                      <label className="mbt-option">
                        <input
                          type="checkbox"
                          checked={selectedMuscles.includes(muscle.key)}
                          onChange={() => toggleMuscle(muscle.key)}
                        />
                        <span className="mbt-option-label">{muscle.label}</span>
                        <span className="mbt-option-count" aria-hidden="true">
                          {muscle.exerciseCount}
                        </span>
                        <span className="mbt-sr-only">
                          {muscle.exerciseCount} {exerciseNoun(muscle.exerciseCount)},
                          primary in {muscle.primaryCount}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </fieldset>

      {selected.length > 0 ? (
        <div className="mbt-selection">
          <p className="mbt-eyebrow">
            Selected ({selected.length} {muscleNoun(selected.length)})
          </p>
          <ul className="mbt-chips" aria-label="Selected muscles">
            {selected.map((muscle) => (
              <li key={muscle.key}>
                <button
                  type="button"
                  className="mbt-chip"
                  onClick={() => toggleMuscle(muscle.key)}
                  aria-label={`Remove ${muscle.label} from the training selection`}
                >
                  {muscle.label}
                  <span className="mbt-chip-x" aria-hidden="true">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mbt-controls">
        <div className="mbt-control">
          <span className="mbt-eyebrow" id="mbt-mode-label">
            Match
          </span>
          <div className="mbt-chips" role="group" aria-labelledby="mbt-mode-label">
            <button
              type="button"
              className="mbt-toggle"
              aria-pressed={mode === 'all'}
              onClick={() => setMode('all')}
            >
              Match all selected
            </button>
            <button
              type="button"
              className="mbt-toggle"
              aria-pressed={mode === 'any'}
              onClick={() => setMode('any')}
            >
              Match any
            </button>
          </div>
        </div>

        <div className="mbt-control">
          <span className="mbt-eyebrow" id="mbt-setting-label">
            Setting
          </span>
          <div className="mbt-chips" role="group" aria-labelledby="mbt-setting-label">
            {SETTING_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className="mbt-toggle"
                aria-pressed={setting === filter}
                onClick={() => setSetting(filter)}
              >
                {SETTING_FILTER_LABELS[filter]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mbt-result-count" aria-live="polite">
        {selected.length === 0
          ? 'No muscles selected yet.'
          : `${filtered.length} ${exerciseNoun(filtered.length)} train ${
              selected.length === 1 ? 'this' : 'these'
            } ${muscleNoun(selected.length)}${mode === 'all' ? ' (all matched)' : ''}${
              setting === 'all' ? '' : ` · ${SETTING_FILTER_LABELS[setting]} setting`
            }.`}
      </p>

      {selected.length === 0 ? (
        <p className="muted empty">
          Pick one or more muscles to see the exercises that train them. Primary movers
          count double in the ranking.
        </p>
      ) : ranked.length === 0 ? (
        <p className="muted empty">
          No exercise trains all of these — try Match any.
          {mode === 'all' ? (
            <>
              {' '}
              <button
                type="button"
                className="mbt-link"
                onClick={() => setMode('any')}
              >
                Switch to Match any
              </button>
            </>
          ) : null}
        </p>
      ) : filtered.length === 0 ? (
        <p className="muted empty">
          No {EXERCISE_SETTING_LABELS[setting === 'home' ? 'home' : 'gym'].toLowerCase()}{' '}
          exercise trains these muscles.{' '}
          <button type="button" className="mbt-link" onClick={() => setSetting('all')}>
            Show all settings
          </button>
        </p>
      ) : (
        <ul className="mbt-results">
          {filtered.map((entry) => (
            <li key={entry.exercise.id}>
              <button
                type="button"
                className="mbt-result"
                onClick={() => onOpenExercise(entry.exercise.id)}
              >
                <span className="mbt-result-head">
                  <span className="mbt-result-name">{entry.exercise.name}</span>
                  <SettingBadge exercise={entry.exercise} />
                  <span
                    className="mbt-score"
                    title="2 points per primary match, 1 per secondary match"
                  >
                    {entry.score}
                  </span>
                </span>
                <span className="mbt-matches">
                  {entry.matched.map((match) => (
                    <span
                      key={`${entry.exercise.id}-${match.label}`}
                      className={`mbt-match mbt-match-${match.role}`}
                    >
                      {match.label} · {ROLE_LABELS[match.role]}
                    </span>
                  ))}
                </span>
                <span className="mbt-sr-only">Opens in the Exercises tab.</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mbt-caption">
        Rankings count primary movers twice and secondary movers once. The research data
        covers {muscles.length} muscles and {EXERCISES.length} exercises; the model&apos;s
        mesh names are the bridge between the two. Educational information, not a training
        prescription.
      </p>
    </div>
  );
}
