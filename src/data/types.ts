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
    magnitude?: number;
    note?: string;
    referenceIds: string[];
  }[];
  referenceIds: string[];
}

export interface ExerciseDef {
  id: string;
  name: string;
  category: string;
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
  evidenceLevel?: 'textbook' | 'systematic-review' | 'rct' | 'cohort' | 'expert-opinion';
}
