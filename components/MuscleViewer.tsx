'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { MuscleDef, Vec3 } from '@/data/types';
import { buildMuscleGeometry, muscleCenter } from '@/lib/muscleGeometry';
import { getMuscleTexture } from '@/lib/muscleTexture';
import { GROUP_COLORS, GROUP_LABELS, SIDE_LABELS } from '@/lib/muscleColors';

export type ViewPreset = 'anterior' | 'posterior' | 'left' | 'right';
export type ZoomKind = 'in' | 'out' | 'reset';

export interface FocusRequest {
  id: string;
  nonce: number;
}

interface MuscleViewerProps {
  muscles: MuscleDef[];
  selectedId: string | null;
  onSelect: (def: MuscleDef) => void;
  focusRequest?: FocusRequest | null;
}

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

const HOME_TARGET = new THREE.Vector3(0, 0.95, 0);

const PRESET_POSITIONS: Record<ViewPreset, [number, number, number]> = {
  anterior: [0, 1.05, 2.9],
  posterior: [0, 1.05, -2.9],
  left: [-2.9, 1.05, 0],
  right: [2.9, 1.05, 0],
};

function CameraRig({
  preset,
  presetNonce,
  zoom,
  focusRequest,
  muscles,
}: {
  preset: ViewPreset;
  presetNonce: number;
  zoom: { kind: ZoomKind; nonce: number } | null;
  focusRequest?: FocusRequest | null;
  muscles: MuscleDef[];
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as OrbitLike | null;
  const lastZoom = useRef(-1);
  const lastFocus = useRef(-1);

  const applyPreset = (nextPreset: ViewPreset) => {
    camera.position.set(...PRESET_POSITIONS[nextPreset]);
    camera.lookAt(HOME_TARGET);
    if (controls) {
      controls.target.copy(HOME_TARGET);
      controls.update();
    }
  };

  useEffect(() => {
    applyPreset(preset);
    // applyPreset only touches stable three.js objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, presetNonce, camera, controls]);

  useEffect(() => {
    if (!zoom || zoom.nonce === lastZoom.current) return;
    lastZoom.current = zoom.nonce;

    if (zoom.kind === 'reset') {
      applyPreset('anterior');
      return;
    }

    const target = controls ? controls.target.clone() : HOME_TARGET.clone();
    const factor = zoom.kind === 'in' ? 0.85 : 1.18;
    camera.position.sub(target).multiplyScalar(factor).add(target);
    if (controls) controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, camera, controls]);

  useEffect(() => {
    if (!focusRequest || focusRequest.nonce === lastFocus.current) return;
    const def = muscles.find((m) => m.id === focusRequest.id);
    if (!def) return;
    lastFocus.current = focusRequest.nonce;

    const center = new THREE.Vector3(...muscleCenter(def));
    const currentTarget = controls ? controls.target : HOME_TARGET;
    const direction = camera.position.clone().sub(currentTarget);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0, 1);
    direction.normalize();

    camera.position.copy(center).addScaledVector(direction, 0.55);
    if (controls) {
      controls.target.copy(center);
      controls.update();
    } else {
      camera.lookAt(center);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest, muscles, camera, controls]);

  return null;
}

function MuscleMesh({
  def,
  geometry,
  texture,
  hovered,
  selected,
  showLabel,
  onHover,
  onSelect,
}: {
  def: MuscleDef;
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture | null;
  hovered: boolean;
  selected: boolean;
  showLabel: boolean;
  onHover: (id: string | null) => void;
  onSelect: (def: MuscleDef) => void;
}) {
  const material = useMemo(() => {
    const base = new THREE.Color(GROUP_COLORS[def.group]);
    const tint = base.clone().lerp(new THREE.Color('#ffffff'), 0.4);
    return new THREE.MeshStandardMaterial({
      color: tint,
      map: texture,
      roughness: 0.62,
      metalness: 0.06,
      emissive: new THREE.Color('#000000'),
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
    });
  }, [def.group, texture]);

  useEffect(() => {
    if (selected) {
      material.emissive.set('#ffcf8a');
      material.emissiveIntensity = 0.32;
    } else if (hovered) {
      material.emissive.set('#ff9a5a');
      material.emissiveIntensity = 0.3;
    } else {
      material.emissive.set('#000000');
      material.emissiveIntensity = 0;
    }
    material.needsUpdate = true;
  }, [hovered, selected, material]);

  useEffect(() => () => material.dispose(), [material]);

  const labelPosition = useMemo(() => {
    const center = muscleCenter(def);
    return [center[0], center[1] + 0.02, center[2]] as [number, number, number];
  }, [def]);

  return (
    <group>
      <mesh
        geometry={geometry}
        material={material}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(def.id);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(def);
        }}
      />
      {showLabel ? (
        <Html position={labelPosition} center distanceFactor={2.4} zIndexRange={[10, 0]}>
          <span
            className="muscle-label"
            style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}
          >
            {def.name}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

const BONES: Array<[Vec3, Vec3]> = [
  [[0, 0.92, 0], [0, 1.45, 0]],
  [[-0.07, 0.92, 0], [0.07, 0.92, 0]],
  [[-0.15, 1.42, 0], [0.15, 1.42, 0]],
  [[0, 1.45, 0], [0, 1.57, 0]],
  [[0, 1.57, 0], [0, 1.74, 0]],
  [[-0.17, 1.42, 0], [-0.25, 0.97, 0]],
  [[0.17, 1.42, 0], [0.25, 0.97, 0]],
  [[-0.25, 0.97, 0], [-0.3, 0.72, 0]],
  [[0.25, 0.97, 0], [0.3, 0.72, 0]],
  [[-0.1, 0.9, 0], [-0.09, 0.53, 0]],
  [[0.1, 0.9, 0], [0.09, 0.53, 0]],
  [[-0.09, 0.53, 0], [-0.07, 0.08, 0]],
  [[0.09, 0.53, 0], [0.07, 0.08, 0]],
];

function Bone({ from, to }: { from: Vec3; to: Vec3 }) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const length = direction.length() || 0.001;
    const position = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    return { position, quaternion, length };
  }, [from, to]);

  return (
    <mesh position={transform.position} quaternion={transform.quaternion}>
      <cylinderGeometry args={[0.016, 0.016, transform.length, 8]} />
      <meshStandardMaterial color="#d8cbb4" roughness={0.85} transparent opacity={0.5} />
    </mesh>
  );
}

export default function MuscleViewer({
  muscles,
  selectedId,
  onSelect,
  focusRequest,
}: MuscleViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [preset, setPreset] = useState<ViewPreset>('anterior');
  const [presetNonce, setPresetNonce] = useState(0);
  const [zoom, setZoom] = useState<{ kind: ZoomKind; nonce: number } | null>(null);
  const [layers, setLayers] = useState({ muscles: true, skeleton: false, labels: false });
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const texture = useMemo(() => getMuscleTexture(), []);

  const meshes = useMemo(
    () =>
      muscles.map((def) => ({
        def,
        geometry: buildMuscleGeometry(def),
      })),
    [muscles],
  );

  useEffect(
    () => () => {
      meshes.forEach((entry) => entry.geometry.dispose());
    },
    [meshes],
  );

  const hoveredDef = hoveredId ? muscles.find((m) => m.id === hoveredId) : undefined;

  const applyPreset = (next: ViewPreset) => {
    setPreset(next);
    setPresetNonce((n) => n + 1);
  };

  const applyZoom = (kind: ZoomKind) => {
    setZoom({ kind, nonce: Date.now() });
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="viewer">
      <div
        className="viewer-canvas"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}
      >
        <Canvas
          camera={{ position: PRESET_POSITIONS.anterior, fov: 35, near: 0.05, far: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#080b10']} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[2.6, 3.2, 3]} intensity={2.1} color="#ffe9d6" />
          <directionalLight position={[-2.4, 1.8, -2.6]} intensity={1.1} color="#7fbfff" />
          <directionalLight position={[0, -1.5, 1.5]} intensity={0.35} color="#ff9a6a" />

          <group position={[0, 0, 0]}>
            {layers.muscles
              ? meshes.map(({ def, geometry }) => (
                  <MuscleMesh
                    key={def.id}
                    def={def}
                    geometry={geometry}
                    texture={texture}
                    hovered={hoveredId === def.id}
                    selected={selectedId === def.id}
                    showLabel={layers.labels}
                    onHover={setHoveredId}
                    onSelect={onSelect}
                  />
                ))
              : null}
            {layers.skeleton
              ? BONES.map(([from, to], index) => (
                  <Bone key={`bone-${index}`} from={from} to={to} />
                ))
              : null}
          </group>

          <gridHelper args={[7, 28, '#1b2730', '#11181f']} position={[0, 0, 0]} />
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minDistance={0.6}
            maxDistance={6}
            target={[0, 0.95, 0]}
          />
          <CameraRig
            preset={preset}
            presetNonce={presetNonce}
            zoom={zoom}
            focusRequest={focusRequest}
            muscles={muscles}
          />
        </Canvas>

        {hoveredDef ? (
          <div
            className="muscle-tooltip"
            style={{ left: pointer.x + 16, top: pointer.y + 16 }}
          >
            <strong>{hoveredDef.name}</strong>
            <span>
              {GROUP_LABELS[hoveredDef.group]} · {SIDE_LABELS[hoveredDef.side]}
            </span>
          </div>
        ) : null}
      </div>

      <div className="viewer-toolbar">
        <div className="toolbar-group" role="group" aria-label="View preset">
          <span className="toolbar-label">View</span>
          {(['anterior', 'posterior', 'left', 'right'] as ViewPreset[]).map((option) => (
            <button
              key={option}
              type="button"
              className={preset === option ? 'chip chip-active' : 'chip'}
              onClick={() => applyPreset(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="toolbar-group" role="group" aria-label="Zoom">
          <span className="toolbar-label">Zoom</span>
          <button type="button" className="chip" onClick={() => applyZoom('in')}>
            +
          </button>
          <button type="button" className="chip" onClick={() => applyZoom('out')}>
            −
          </button>
          <button type="button" className="chip" onClick={() => applyZoom('reset')}>
            reset
          </button>
        </div>

        <div className="toolbar-group" role="group" aria-label="Layers">
          <span className="toolbar-label">Layers</span>
          <button
            type="button"
            className={layers.muscles ? 'chip chip-active' : 'chip'}
            onClick={() => toggleLayer('muscles')}
          >
            muscles
          </button>
          <button
            type="button"
            className={layers.skeleton ? 'chip chip-active' : 'chip'}
            onClick={() => toggleLayer('skeleton')}
          >
            skeleton
          </button>
          <button
            type="button"
            className={layers.labels ? 'chip chip-active' : 'chip'}
            onClick={() => toggleLayer('labels')}
          >
            labels
          </button>
        </div>
      </div>
    </div>
  );
}
