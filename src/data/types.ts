// Shared schema for the exercise reference model.
// The 3D anatomy itself is described in src/data/anatomy.ts (Écorché atlas);
// body-space coordinates are metres, y up, soles at y = 0, figure facing +Z.

export type Vec3 = [number, number, number];

export interface ExerciseFormVariation {
  id: string;
  name: string;
  description: string;
  effects: {
    muscle: string;
    direction: 'increase' | 'decrease' | 'shift';
    /**
     * Reported change versus the reference form. The research dataset stores the
     * source's own wording ("+40 % concentric activation", "no significant
     * difference"), so this is free text; `ResearchEffect.magnitude` in
     * src/data/exercises.ts additionally parses an explicit leading signed
     * percentage into a number for sorting.
     */
    magnitude?: string | number;
    note?: string;
    referenceIds: string[];
  }[];
  referenceIds: string[];
}

export interface ExerciseDef {
  id: string;
  name: string;
  category: string;
  /**
   * Where the exercise is realistically performed. `both` marks a movement that
   * needs no gym equipment but is also loaded in a gym; omitted on legacy records
   * means `gym` (see `exerciseSetting` in src/data/exercises.ts).
   */
  context?: 'home' | 'gym' | 'both';
  /**
   * Implements the movement needs: `band`, `barbell`, `dumbbell`, `machine`,
   * `cable`, `pull-up-bar`, `bench`, `step`, `kettlebell`, `bodyweight`.
   * Free text on purpose — `EXERCISE_EQUIPMENT_LABELS` in src/data/exercises.ts
   * is the display vocabulary and unknown tags fall back to their raw string.
   */
  equipment?: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  variations: ExerciseFormVariation[];
  referenceIds: string[];
}

export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  /**
   * Free-form evidence label used by the research set ("RCT", "EMG cohort",
   * "systematic review/meta-analysis", "biomechanical crossover",
   * "cadaveric/biomechanical", "review", "textbook"…). The union is kept for
   * backwards compatibility only; `evidenceGrade` in src/data/references.ts is
   * the single place that maps labels onto high/moderate/low.
   */
  evidenceLevel?:
    | 'textbook'
    | 'systematic-review'
    | 'rct'
    | 'cohort'
    | 'expert-opinion'
    | (string & {});
}
