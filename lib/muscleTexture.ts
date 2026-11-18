import * as THREE from 'three';

let cached: THREE.CanvasTexture | null = null;

/**
 * Procedural muscle surface: deep red base with lighter longitudinal
 * striations along the fiber axis (canvas x maps to uv.u, i.e. the direction
 * from origin to insertion). Tinted per muscle group by the material color.
 */
export function createMuscleTexture(): THREE.CanvasTexture {
  const width = 256;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('2D canvas context unavailable for muscle texture');
  }

  ctx.fillStyle = '#6e1a20';
  ctx.fillRect(0, 0, width, height);

  // Longitudinal streaks (fiber bundles) running along u.
  for (let i = 0; i < 170; i += 1) {
    const y = Math.random() * height;
    const h = 1 + Math.random() * 3.5;
    const light = Math.random();
    const alpha = 0.08 + Math.random() * 0.35;
    if (light > 0.45) {
      ctx.fillStyle = `rgba(214, 122, 118, ${alpha})`;
    } else {
      ctx.fillStyle = `rgba(52, 10, 14, ${alpha * 0.8})`;
    }
    ctx.fillRect(0, y, width, h);
  }

  // Fine connective-tissue sheen across the fibers.
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 40; i += 1) {
    const y = Math.random() * height;
    ctx.strokeStyle = `rgba(236, 198, 186, ${0.04 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= width; x += 32) {
      ctx.lineTo(x, y + Math.sin((x / width) * Math.PI * 2) * 3);
    }
    ctx.stroke();
  }

  // Speckle for depth.
  for (let i = 0; i < 900; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle =
      Math.random() > 0.5 ? 'rgba(244, 190, 180, 0.06)' : 'rgba(30, 6, 8, 0.10)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/** Lazily created, shared across meshes (browser only). */
export function getMuscleTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (!cached) cached = createMuscleTexture();
  return cached;
}
