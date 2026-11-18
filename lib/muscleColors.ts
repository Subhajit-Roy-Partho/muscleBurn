import type { MuscleGroup } from '@/data/types';

/** Base tint per muscle group (multiplied by the procedural striation map). */
export const GROUP_COLORS: Record<MuscleGroup, string> = {
  head: '#c0855c',
  neck: '#cf7a5b',
  back: '#8f3b4c',
  chest: '#c14545',
  abdomen: '#c96f4a',
  shoulder: '#cf6b3a',
  arm: '#b8442f',
  forearm: '#a63a52',
  hand: '#9a3f5f',
  hip: '#9c4a6b',
  thigh: '#a8402f',
  leg: '#b2503a',
  foot: '#8f4257',
};

export const GROUP_LABELS: Record<MuscleGroup, string> = {
  head: 'Head',
  neck: 'Neck',
  back: 'Back',
  chest: 'Chest',
  abdomen: 'Abdomen',
  shoulder: 'Shoulder',
  arm: 'Arm',
  forearm: 'Forearm',
  hand: 'Hand',
  hip: 'Hip',
  thigh: 'Thigh',
  leg: 'Leg',
  foot: 'Foot',
};

export const SIDE_LABELS = {
  left: 'Left',
  right: 'Right',
  midline: 'Midline',
} as const;
