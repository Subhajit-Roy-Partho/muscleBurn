'use client';

import { EXERCISES } from '@/data/exercises';
import { getReference } from '@/data/references';
import { getMuscle } from '@/data/muscles/placeholder';

const muscleName = (id: string): string => getMuscle(id)?.name ?? id;

export default function ExercisePanel() {
  if (EXERCISES.length === 0) {
    return (
      <div className="panel-body">
        <p className="muted empty">
          No exercises yet. Exercise entries, their form variations and the muscles they
          emphasize will appear here once the library is populated.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-body">
      <ul className="exercise-list">
        {EXERCISES.map((exercise) => (
          <li key={exercise.id} className="exercise-card">
            <header>
              <h2>{exercise.name}</h2>
              <span className="pill">{exercise.category}</span>
            </header>

            <p className="muted">
              <strong>Primary:</strong> {exercise.primaryMuscles.map(muscleName).join(', ')}
            </p>
            <p className="muted">
              <strong>Secondary:</strong>{' '}
              {exercise.secondaryMuscles.length
                ? exercise.secondaryMuscles.map(muscleName).join(', ')
                : '—'}
            </p>

            {exercise.variations.map((variation) => (
              <section key={variation.id} className="variation">
                <h3>{variation.name}</h3>
                <p>{variation.description}</p>
                <ul className="effect-list">
                  {variation.effects.map((effect, index) => (
                    <li key={`${variation.id}-${index}`}>
                      <span className={`effect effect-${effect.direction}`}>
                        {effect.direction}
                      </span>
                      <span>{muscleName(effect.muscle)}</span>
                      {effect.magnitude !== undefined ? (
                        <span className="muted">
                          ×{effect.magnitude.toFixed(2)} estimated demand
                        </span>
                      ) : null}
                      {effect.note ? <em className="muted">{effect.note}</em> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <footer className="refs">
              {exercise.referenceIds.map((id) => {
                const reference = getReference(id);
                return (
                  <span key={id} className="pill" title={reference?.title ?? id}>
                    {reference ? `${reference.authors[0]} ${reference.year}` : id}
                  </span>
                );
              })}
            </footer>
          </li>
        ))}
      </ul>
      <p className="muted fineprint">
        Placeholder content: variation effects are illustrative scaffolding, not measured
        values, and are not training or medical advice.
      </p>
    </div>
  );
}
