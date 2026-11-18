// Data schema for the muscle viewer and exercise reference model.
// All skeletal coordinates live in a normalized "body space":
//   y up, floor at y = 0, total height ~1.8,
//   +x = subject's anatomical right, +z = anterior (the direction the subject faces).
// The anterior camera therefore looks along -z, so the subject's right side
// appears on the viewer's left, as in a face-to-face anatomical view.

export type Vec3 = [number, number, number];

export type MuscleGroup =
  | 'head'
  | 'neck'
  | 'back'
  | 'chest'
  | 'abdomen'
  | 'shoulder'
  | 'arm'
  | 'forearm'
  | 'hand'
  | 'hip'
  | 'thigh'
  | 'leg'
  | 'foot';

export interface MuscleDef {
  id: string;
  name: string;
  group: MuscleGroup;
  side: 'left' | 'right' | 'midline';
  /** Proximal attachment point. */
  origin: Vec3;
  /** Distal attachment point. */
  insertion: Vec3;
  /** Optional intermediate points shaping the fiber curve (proximal -> distal). */
  path?: Vec3[];
  /** Base fiber radius in body-space units. */
  radius: number;
  /** 0..1 flattening factor for the cross-section (0 = round, 1 = flat). */
  flatten?: number;
  action: string;
  innervation: string;
  referenceIds?: string[];
}

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
