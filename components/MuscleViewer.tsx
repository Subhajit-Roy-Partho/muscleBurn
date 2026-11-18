'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { MODEL_URL } from '@/lib/paths';
import {
  getStructure,
  regionForMuscle,
  STRUCTURE_COUNTS,
  type Region,
  type StructureInfo,
} from '@/data/anatomy';
import { BONE_COLOR, GRID_COLORS, REGION_COLORS, REGION_LABELS, SIDE_LABELS } from '@/lib/muscleColors';
import { clearDerivedAttachments, registerDerivedAttachments } from '@/lib/modelRegistry';

export type ViewPreset = 'anterior' | 'posterior' | 'left' | 'right';
export type ZoomKind = 'in' | 'out' | 'reset';
export type SideFilter = 'both' | 'left' | 'right';

export interface FocusRequest {
  key: string;
  nonce: number;
}

interface MuscleViewerProps {
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  focusRequest?: FocusRequest | null;
}

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

interface MaterialSet {
  base: THREE.MeshStandardMaterial;
  hover: THREE.MeshStandardMaterial;
  selected: THREE.MeshStandardMaterial;
}

interface PreparedModel {
  scene: THREE.Object3D;
  meshes: THREE.Mesh[];
  info: Map<THREE.Mesh, StructureInfo>;
  bone: MaterialSet;
  regions: Map<Region, MaterialSet>;
  dispose: () => void;
}

const HOME_TARGET = new THREE.Vector3(0, 0.9, 0);
const CAMERA_FOV = 32;

const PRESET_POSITIONS: Record<ViewPreset, [number, number, number]> = {
  anterior: [0, 1.0, 3.6],
  posterior: [0, 1.0, -3.6],
  left: [3.6, 1.0, 0],
  right: [-3.6, 1.0, 0],
};

const LAYER_COPY: Record<StructureInfo['layer'], string> = {
  skeleton: 'Skeleton',
  deep: 'Deep muscle',
  superficial: 'Superficial muscle',
};

function makeMaterialSet(color: string, vertexColors: boolean, roughness: number): MaterialSet {
  const base = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.05,
    roughness,
    vertexColors,
  });
  const hover = base.clone();
  hover.emissive = new THREE.Color('#ff7b42');
  hover.emissiveIntensity = 0.34;
  const selected = base.clone();
  selected.emissive = new THREE.Color('#ff5b2b');
  selected.emissiveIntensity = 0.6;
  return { base, hover, selected };
}

/** Fallback record if the GLB and structures.json ever disagree. */
function syntheticStructure(meshName: string): StructureInfo {
  return {
    key: meshName,
    name: meshName,
    layer: 'superficial',
    side: /left/i.test(meshName) ? 'left' : /right/i.test(meshName) ? 'right' : 'midline',
    fma: null,
    group: null,
    tissue: null,
    isBone: false,
    region: regionForMuscle(meshName),
  };
}

function prepare(gltfScene: THREE.Object3D): PreparedModel {
  const bone = makeMaterialSet(BONE_COLOR, true, 0.68);
  const regions = new Map<Region, MaterialSet>();
  const materials: THREE.Material[] = [bone.base, bone.hover, bone.selected];
  for (const [region, color] of Object.entries(REGION_COLORS) as Array<[Region, string]>) {
    const set = makeMaterialSet(color, false, 0.55);
    regions.set(region, set);
    materials.push(set.base, set.hover, set.selected);
  }

  const meshes: THREE.Mesh[] = [];
  const info = new Map<THREE.Mesh, StructureInfo>();

  gltfScene.updateMatrixWorld(true);
  gltfScene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!(mesh as THREE.Mesh & { isMesh?: boolean }).isMesh) return;

    // GLTFLoader sanitises node names ("Body of sternum" -> "Body_of_sternum");
    // the original name lives in the node extras, which land in userData.
    const originalName = typeof mesh.userData.name === 'string' ? mesh.userData.name : mesh.name;
    const structure = getStructure(originalName) ?? syntheticStructure(originalName);
    meshes.push(mesh);
    info.set(mesh, structure);
    mesh.userData.structureKey = structure.key;

    const set = structure.isBone
      ? bone
      : (regions.get(structure.region ?? 'back') ?? regions.get('back'))!;
    mesh.material = set.base;

    // Attachments for muscles without curated text: the two poles of the
    // mesh's longest bounding-box axis, in world (metre) space.
    if (!structure.isBone) {
      const box = new THREE.Box3().setFromObject(mesh);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const axis = size.x >= size.y && size.x >= size.z ? 'x' : size.y >= size.z ? 'y' : 'z';
        const span = size[axis];
        const a = center.clone();
        a[axis] += span / 2;
        const b = center.clone();
        b[axis] -= span / 2;
        const [lower, upper] = a.y <= b.y ? [a, b] : [b, a];
        registerDerivedAttachments(structure.key, {
          origin: lower.toArray() as [number, number, number],
          insertion: upper.toArray() as [number, number, number],
          span,
        });
      }
    }
  });

  return {
    scene: gltfScene,
    meshes,
    info,
    bone,
    regions,
    dispose: () => materials.forEach((material) => material.dispose()),
  };
}

function meshBox(mesh: THREE.Mesh): THREE.Box3 {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

interface Tween {
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  started: number;
  duration: number;
}

interface Layers {
  muscles: boolean;
  deep: boolean;
  skeleton: boolean;
  labels: boolean;
}

interface SceneProps {
  model: PreparedModel;
  selectedKey: string | null;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
  onSelect: (key: string | null) => void;
  focusRequest?: FocusRequest | null;
  preset: ViewPreset;
  presetNonce: number;
  zoom: { kind: ZoomKind; nonce: number } | null;
  layers: Layers;
  side: SideFilter;
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

function SceneContents({
  model,
  selectedKey,
  hoveredKey,
  onHover,
  onSelect,
  focusRequest,
  preset,
  presetNonce,
  zoom,
  layers,
  side,
}: SceneProps) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const controls = useThree((state) => state.controls) as unknown as OrbitLike | null;

  const tween = useRef<Tween | null>(null);
  const lastPreset = useRef(-1);
  const lastZoom = useRef(-1);
  const lastFocus = useRef(-1);
  const lastSelection = useRef<string | null>(null);
  const cb = useRef({ onHover, onSelect });
  cb.current = { onHover, onSelect };

  const startTween = (
    toPosition: THREE.Vector3,
    toTarget: THREE.Vector3,
    duration: number,
  ) => {
    tween.current = {
      fromPosition: camera.position.clone(),
      toPosition,
      fromTarget: (controls ? controls.target : HOME_TARGET).clone(),
      toTarget,
      started: performance.now(),
      duration,
    };
  };

  // one material instance per region, reused across every mesh of that region
  useEffect(() => {
    for (const mesh of model.meshes) {
      const structure = model.info.get(mesh);
      if (!structure) continue;
      const set = structure.isBone
        ? model.bone
        : (model.regions.get(structure.region ?? 'back') ?? model.bone);
      const key = mesh.userData.structureKey as string;
      mesh.material =
        key === selectedKey ? set.selected : key === hoveredKey ? set.hover : set.base;
    }
  }, [model, selectedKey, hoveredKey]);

  // layer + side visibility
  useEffect(() => {
    for (const mesh of model.meshes) {
      const structure = model.info.get(mesh);
      if (!structure) continue;
      const sideVisible =
        side === 'both' || structure.side === 'midline' || structure.side === side;
      const layerVisible = structure.isBone
        ? layers.skeleton
        : layers.muscles && (structure.layer === 'superficial' || layers.deep);
      mesh.visible = sideVisible && layerVisible;
    }
  }, [model, layers, side]);

  // pointer picking (manual raycast: R3F events would raycast the whole figure
  // on every move, and 634 meshes is too much for that)
  useEffect(() => {
    const element = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hoverTimer: number | undefined;
    let pending: { x: number; y: number } | null = null;
    let down: { x: number; y: number } | null = null;

    const pick = (clientX: number, clientY: number): THREE.Mesh | null => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const candidates = model.meshes.filter((mesh) => mesh.visible);
      const hit = raycaster.intersectObjects(candidates, false)[0];
      return (hit?.object as THREE.Mesh | undefined) ?? null;
    };

    const runHover = () => {
      hoverTimer = undefined;
      if (!pending) return;
      const mesh = pick(pending.x, pending.y);
      cb.current.onHover(mesh ? (mesh.userData.structureKey as string) : null);
      element.style.cursor = mesh ? 'pointer' : '';
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.buttons !== 0) return;
      pending = { x: event.clientX, y: event.clientY };
      if (hoverTimer !== undefined) return;
      hoverTimer = window.setTimeout(runHover, 60);
    };

    const onPointerLeave = () => {
      if (hoverTimer !== undefined) {
        window.clearTimeout(hoverTimer);
        hoverTimer = undefined;
      }
      pending = null;
      element.style.cursor = '';
      cb.current.onHover(null);
    };

    const onPointerDown = (event: PointerEvent) => {
      tween.current = null; // any pointer-down interrupts a camera move
      down = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(event.clientX - down.x, event.clientY - down.y);
      down = null;
      if (moved > 6) return;
      const mesh = pick(event.clientX, event.clientY);
      cb.current.onSelect(mesh ? (mesh.userData.structureKey as string) : null);
    };

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', onPointerLeave);
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointerup', onPointerUp);
    return () => {
      if (hoverTimer !== undefined) window.clearTimeout(hoverTimer);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', onPointerLeave);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointerup', onPointerUp);
      element.style.cursor = '';
    };
    // callbacks are read through cb.current so this binds once per model/camera
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera, model]);

  // view presets
  useEffect(() => {
    if (presetNonce === lastPreset.current) return;
    lastPreset.current = presetNonce;
    const position = new THREE.Vector3(...PRESET_POSITIONS[preset]);
    startTween(position, HOME_TARGET.clone(), 520);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, presetNonce]);

  // stepped zoom
  useEffect(() => {
    if (!zoom || zoom.nonce === lastZoom.current) return;
    lastZoom.current = zoom.nonce;
    if (zoom.kind === 'reset') {
      startTween(new THREE.Vector3(...PRESET_POSITIONS.anterior), HOME_TARGET.clone(), 520);
      return;
    }
    const target = (controls ? controls.target : HOME_TARGET).clone();
    const offset = camera.position.clone().sub(target);
    if (offset.lengthSq() < 1e-6) offset.set(0, 0, 1);
    const factor = zoom.kind === 'in' ? 0.85 : 1.18;
    const distance = THREE.MathUtils.clamp(offset.length() * factor, 0.3, 7);
    startTween(offset.setLength(distance).add(target), target, 180);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // frame the selected structure
  useEffect(() => {
    if (!selectedKey) {
      lastSelection.current = null;
      return;
    }
    const requestedHere =
      !!focusRequest && focusRequest.key === selectedKey && focusRequest.nonce !== lastFocus.current;
    if (lastSelection.current === selectedKey && !requestedHere) return;
    lastSelection.current = selectedKey;
    if (requestedHere) lastFocus.current = focusRequest.nonce;

    const mesh = model.meshes.find(
      (candidate) => candidate.userData.structureKey === selectedKey,
    );
    if (!mesh || !mesh.visible) return;
    const box = meshBox(mesh);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius || 0.05;
    const fit = radius / Math.sin((CAMERA_FOV * Math.PI) / 360);
    const distance = THREE.MathUtils.clamp(fit * 1.4, 0.3, 2.6);
    const reference = controls ? controls.target : HOME_TARGET;
    const direction = camera.position.clone().sub(reference);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0, 1);
    direction.normalize();
    startTween(center.clone().addScaledVector(direction, distance), center, 620);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, focusRequest, model]);

  useFrame(() => {
    const active = tween.current;
    if (!active) return;
    const progress = Math.min(1, (performance.now() - active.started) / active.duration);
    const eased = easeOutQuart(progress);
    camera.position.lerpVectors(active.fromPosition, active.toPosition, eased);
    if (controls) {
      controls.target.lerpVectors(active.fromTarget, active.toTarget, eased);
      controls.update();
    } else {
      camera.lookAt(active.toTarget);
    }
    if (progress >= 1) tween.current = null;
  });

  const selectedStructure = selectedKey ? getStructure(selectedKey) : null;
  const labelAnchor = useMemo(() => {
    if (!selectedKey) return null;
    const mesh = model.meshes.find(
      (candidate) => candidate.userData.structureKey === selectedKey,
    );
    if (!mesh) return null;
    const center = meshBox(mesh).getCenter(new THREE.Vector3());
    return [center.x, center.y + 0.02, center.z] as [number, number, number];
  }, [selectedKey, model]);

  return (
    <>
      <primitive object={model.scene} />
      {layers.labels && labelAnchor && selectedStructure ? (
        <Html position={labelAnchor} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <span className="muscle-label" style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            {selectedStructure.name}
          </span>
        </Html>
      ) : null}
    </>
  );
}

export default function MuscleViewer({
  selectedKey,
  onSelect,
  focusRequest,
}: MuscleViewerProps) {
  const [model, setModel] = useState<PreparedModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(0);
  const [attempt, setAttempt] = useState(0);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [preset, setPreset] = useState<ViewPreset>('anterior');
  const [presetNonce, setPresetNonce] = useState(0);
  const [zoom, setZoom] = useState<{ kind: ZoomKind; nonce: number } | null>(null);
  const [layers, setLayers] = useState<Layers>({
    muscles: true,
    deep: true,
    skeleton: true,
    labels: true,
  });
  const [side, setSide] = useState<SideFilter>('both');
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // Load the atlas once. MeshoptDecoder is required: the GLB is compressed with
  // EXT_meshopt_compression and quantised with KHR_mesh_quantization.
  useEffect(() => {
    let cancelled = false;
    setModel(null);
    setError(null);
    setProgress(0);

    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (cancelled) return;
        setModel(prepare(gltf.scene));
        setProgress(null);
      },
      (event) => {
        if (cancelled) return;
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      },
      (cause) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : 'The model could not be loaded.');
        setProgress(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => () => clearDerivedAttachments(), []);

  useEffect(() => {
    return () => {
      model?.dispose();
    };
  }, [model]);

  const hovered = hoveredKey ? getStructure(hoveredKey) : null;

  const applyPreset = (next: ViewPreset) => {
    setPreset(next);
    setPresetNonce((nonce) => nonce + 1);
  };

  const applyZoom = (kind: ZoomKind) => {
    setZoom({ kind, nonce: Date.now() });
  };

  const toggleLayer = (key: keyof Layers) => {
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
          camera={{ position: PRESET_POSITIONS.anterior, fov: CAMERA_FOV, near: 0.02, far: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#080b10']} />
          <ambientLight intensity={0.75} />
          <hemisphereLight args={['#dfe9ff', '#3a1d16', 0.5]} />
          <directionalLight position={[2.6, 3.2, 3]} intensity={2.2} color="#ffe9d6" />
          <directionalLight position={[-2.4, 1.8, -2.6]} intensity={1.2} color="#8fc4ff" />
          <directionalLight position={[0, -1.5, 1.5]} intensity={0.4} color="#ff9a6a" />

          {model ? (
            <SceneContents
              model={model}
              selectedKey={selectedKey}
              hoveredKey={hoveredKey}
              onHover={setHoveredKey}
              onSelect={onSelect}
              focusRequest={focusRequest}
              preset={preset}
              presetNonce={presetNonce}
              zoom={zoom}
              layers={layers}
              side={side}
            />
          ) : null}

          <gridHelper args={[7, 28, GRID_COLORS[0], GRID_COLORS[1]]} position={[0, 0, 0]} />
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            enableDamping
            dampingFactor={0.08}
            minDistance={0.25}
            maxDistance={8}
            target={[0, 0.9, 0]}
          />
        </Canvas>

        {progress !== null ? (
          <div className="viewer-status">
            Loading Écorché atlas… {progress}%
          </div>
        ) : null}

        {error ? (
          <div className="viewer-status viewer-status-error" role="alert">
            <strong>The model couldn&apos;t load.</strong>
            <span>{error}</span>
            <button type="button" className="chip" onClick={() => setAttempt((n) => n + 1)}>
              retry
            </button>
          </div>
        ) : null}

        {hovered ? (
          <div
            className="muscle-tooltip"
            style={{ left: pointer.x + 16, top: pointer.y + 16 }}
          >
            <strong>{hovered.name}</strong>
            <span>
              {hovered.isBone
                ? 'Skeleton'
                : `${hovered.region ? REGION_LABELS[hovered.region] : 'Muscle'} · ${
                    LAYER_COPY[hovered.layer]
                  }`}{' '}
              · {SIDE_LABELS[hovered.side]}
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
            aria-pressed={layers.muscles}
            onClick={() => toggleLayer('muscles')}
          >
            muscles
          </button>
          <button
            type="button"
            className={layers.deep ? 'chip chip-active' : 'chip'}
            aria-pressed={layers.deep}
            disabled={!layers.muscles}
            onClick={() => toggleLayer('deep')}
          >
            deep
          </button>
          <button
            type="button"
            className={layers.skeleton ? 'chip chip-active' : 'chip'}
            aria-pressed={layers.skeleton}
            onClick={() => toggleLayer('skeleton')}
          >
            skeleton
          </button>
          <button
            type="button"
            className={layers.labels ? 'chip chip-active' : 'chip'}
            aria-pressed={layers.labels}
            onClick={() => toggleLayer('labels')}
          >
            labels
          </button>
        </div>

        <div className="toolbar-group" role="group" aria-label="Side filter">
          <span className="toolbar-label">Side</span>
          {(['both', 'left', 'right'] as SideFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={side === option ? 'chip chip-active' : 'chip'}
              aria-pressed={side === option}
              onClick={() => setSide(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <span className="toolbar-note">
          {STRUCTURE_COUNTS.total} structures · {STRUCTURE_COUNTS.muscles} muscles ·{' '}
          {STRUCTURE_COUNTS.bones} bones
        </span>
      </div>
    </div>
  );
}
