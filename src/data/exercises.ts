import type { ExerciseDef } from './types';

/**
 * Placeholder exercise library.
 *
 * The single example below exists to exercise the UI and the schema; it is not
 * a training recommendation. Replace/extend with evidence-backed entries and
 * attach real referenceIds.
 */
export const EXERCISES: ExerciseDef[] = [
  {
    id: 'barbell-bench-press',
    name: 'Barbell bench press',
    category: 'Horizontal push',
    primaryMuscles: ['pectoralis-major-left', 'pectoralis-major-right'],
    secondaryMuscles: [
      'deltoid-left',
      'deltoid-right',
      'triceps-brachii-left',
      'triceps-brachii-right',
    ],
    variations: [
      {
        id: 'bench-press-wide-grip',
        name: 'Wider grip (1.5x shoulder width)',
        description:
          'Example variation entry: a wider grip is often used to emphasize the sternal fibers of the pectoralis major, at the cost of a longer moment arm on the shoulder.',
        effects: [
          {
            muscle: 'pectoralis-major-left',
            direction: 'increase',
            magnitude: 0.2,
            note: 'Greater horizontal adduction demand on the sternocostal head.',
            referenceIds: ['ref-delavier-anatomy'],
          },
          {
            muscle: 'triceps-brachii-left',
            direction: 'decrease',
            magnitude: 0.15,
            note: 'Shorter elbow extension range under load.',
            referenceIds: ['ref-delavier-anatomy'],
          },
        ],
        referenceIds: ['ref-delavier-anatomy'],
      },
    ],
    referenceIds: ['ref-moore-anatomy', 'ref-delavier-anatomy'],
  },
];

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
);

export const getExercise = (id: string): ExerciseDef | undefined => EXERCISE_BY_ID[id];
