import * as THREE from 'three';
import type { MuscleDef, Vec3 } from '@/data/types';

export const LENGTH_SEGMENTS = 24;
export const RADIAL_SEGMENTS = 16;

const toVector = (p: Vec3): THREE.Vector3 => new THREE.Vector3(p[0], p[1], p[2]);

function fiberCurve(def: MuscleDef): THREE.CatmullRomCurve3 {
  const points = [def.origin, ...(def.path ?? []), def.insertion].map(toVector);
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

/** Any unit vector roughly perpendicular to `v`. */
function perpendicularTo(v: THREE.Vector3): THREE.Vector3 {
  const fallback =
    Math.abs(v.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(v, fallback).normalize();
}

/**
 * Elliptical fiber radius at normalized length t: a taper profile that is
 * narrow at both attachments and fullest around the belly.
 */
export function radiusProfile(radius: number, t: number): number {
  return radius * (0.25 + 0.75 * Math.pow(Math.sin(Math.PI * t), 0.7));
}

/**
 * Builds a tapered, optionally flattened tube along a Catmull-Rom fiber curve,
 * swept with parallel-transport frames so it does not twist, capped at both
 * ends, with u = position along the fiber and v = angle around it.
 */
export function buildMuscleGeometry(def: MuscleDef): THREE.BufferGeometry {
  const curve = fiberCurve(def);
  const flatten = THREE.MathUtils.clamp(def.flatten ?? 0, 0, 1);

  const ringCount = LENGTH_SEGMENTS + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const tangents: THREE.Vector3[] = [];
  for (let i = 0; i < ringCount; i += 1) {
    tangents.push(curve.getTangentAt(i / LENGTH_SEGMENTS).normalize());
  }

  // Parallel transport of a starting normal along the tangent field.
  const normals: THREE.Vector3[] = [perpendicularTo(tangents[0])];
  const binormals: THREE.Vector3[] = [];
  for (let i = 0; i < ringCount; i += 1) {
    if (i > 0) {
      const rotation = new THREE.Quaternion().setFromUnitVectors(
        tangents[i - 1],
        tangents[i],
      );
      const transported = normals[i - 1].clone().applyQuaternion(rotation);
      // Re-orthogonalize against drift.
      transported.addScaledVector(tangents[i], -transported.dot(tangents[i]));
      normals.push(transported.normalize());
    }
    binormals.push(
      new THREE.Vector3().crossVectors(tangents[i], normals[i]).normalize(),
    );
  }

  for (let i = 0; i < ringCount; i += 1) {
    const t = i / LENGTH_SEGMENTS;
    const center = curve.getPointAt(t);
    const r = radiusProfile(def.radius, t);
    const rx = r;
    const ry = r * (1 - 0.6 * flatten);

    for (let j = 0; j < RADIAL_SEGMENTS; j += 1) {
      const angle = (j / RADIAL_SEGMENTS) * Math.PI * 2;
      const offset = normals[i]
        .clone()
        .multiplyScalar(Math.cos(angle) * rx)
        .addScaledVector(binormals[i], Math.sin(angle) * ry);
      const vertex = center.clone().add(offset);

      positions.push(vertex.x, vertex.y, vertex.z);
      uvs.push(t, j / RADIAL_SEGMENTS);
    }
  }

  for (let i = 0; i < LENGTH_SEGMENTS; i += 1) {
    for (let j = 0; j < RADIAL_SEGMENTS; j += 1) {
      const jNext = (j + 1) % RADIAL_SEGMENTS;
      const a = i * RADIAL_SEGMENTS + j;
      const b = i * RADIAL_SEGMENTS + jNext;
      const c = (i + 1) * RADIAL_SEGMENTS + j;
      const d = (i + 1) * RADIAL_SEGMENTS + jNext;

      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const lastRingStart = LENGTH_SEGMENTS * RADIAL_SEGMENTS;

  // Proximal cap: fan around a center vertex, wound to face away from the fiber.
  const proximalCenterIndex = positions.length / 3;
  const proximalCenter = curve.getPointAt(0);
  positions.push(proximalCenter.x, proximalCenter.y, proximalCenter.z);
  uvs.push(0, 0.5);
  for (let j = 0; j < RADIAL_SEGMENTS; j += 1) {
    const jNext = (j + 1) % RADIAL_SEGMENTS;
    indices.push(proximalCenterIndex, jNext, j);
  }

  // Distal cap.
  const distalCenterIndex = positions.length / 3;
  const distalCenter = curve.getPointAt(1);
  positions.push(distalCenter.x, distalCenter.y, distalCenter.z);
  uvs.push(1, 0.5);
  for (let j = 0; j < RADIAL_SEGMENTS; j += 1) {
    const jNext = (j + 1) % RADIAL_SEGMENTS;
    indices.push(distalCenterIndex, lastRingStart + j, lastRingStart + jNext);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Midpoint of a muscle's attachment chain, used for camera framing. */
export function muscleCenter(def: MuscleDef): Vec3 {
  const points = [def.origin, ...(def.path ?? []), def.insertion];
  const [x, y, z] = points.reduce<Vec3>((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
  const n = points.length;
  return [x / n, y / n, z / n];
}
