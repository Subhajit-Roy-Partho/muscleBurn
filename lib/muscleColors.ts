import type { Region } from '@/data/anatomy';

/**
 * Region palette for the anatomical model. Hues stay in the meat-and-ivory
 * range so the figure reads as an écorché, but neighbouring regions are
 * separated enough to be told apart while orbiting.
 */
export const REGION_COLORS: Record<Region, string> = {
  head: '#e8896a',
  neck: '#e39a63',
  shoulder: '#e2724a',
  chest: '#d8564e',
  abdomen: '#d1743f',
  back: '#b04a5f',
  arm: '#d4633a',
  forearm: '#c9536b',
  hand: '#bb4f86',
  hip: '#a45a86',
  thigh: '#c94f38',
  leg: '#bd6a44',
  foot: '#96577d',
};

export const REGION_LABELS: Record<Region, string> = {
  head: 'Head',
  neck: 'Neck',
  shoulder: 'Shoulder',
  chest: 'Chest',
  abdomen: 'Abdomen',
  back: 'Back',
  arm: 'Arm',
  forearm: 'Forearm',
  hand: 'Hand',
  hip: 'Hip / pelvis',
  thigh: 'Thigh',
  leg: 'Leg',
  foot: 'Foot',
};

export const BONE_COLOR = '#d8d2c4';

export const SIDE_LABELS = {
  left: 'Left',
  right: 'Right',
  midline: 'Midline',
} as const;

export type SideKey = keyof typeof SIDE_LABELS;

/** Colour of the contact grid, kept close to the page background. */
export const GRID_COLORS = ['#1b2730', '#11181f'] as const;
