import type { Vec3 } from '@/data/types';

/**
 * Bridge between the loaded GLB and the DOM panel.
 *
 * Attachment text for muscles outside the curated set is derived from the mesh
 * itself (the two poles of its longest bounding-box axis), which only the 3D
 * scene can compute. The viewer registers those spans here so `InfoPanel` can
 * read them without being inside the react-three-fiber canvas.
 */

export interface DerivedAttachments {
  /** Lower-Y pole of the mesh's longest bounding-box axis. */
  origin: Vec3;
  /** Higher-Y pole of the mesh's longest bounding-box axis. */
  insertion: Vec3;
  /** Size of the mesh along that axis, in metres. */
  span: number;
}

const derived = new Map<string, DerivedAttachments>();

export function registerDerivedAttachments(key: string, value: DerivedAttachments): void {
  derived.set(key, value);
}

export function getDerivedAttachments(key: string | null): DerivedAttachments | null {
  if (!key) return null;
  return derived.get(key) ?? null;
}

export function clearDerivedAttachments(): void {
  derived.clear();
}

export const formatPoint = ([x, y, z]: Vec3): string =>
  `${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)} m`;
