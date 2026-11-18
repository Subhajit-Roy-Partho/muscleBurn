import rawStructures from '../../public/models/ecorche.structures.json';

/**
 * Index over the Écorché full-body atlas (github.com/Charleeh/ecorche).
 *
 * The GLB carries one named mesh per anatomical structure (634 meshes: 272
 * skeletal, 159 deep muscles, 203 superficial muscles). `ecorche.structures.json`
 * is the same metadata the GLB stores in node `extras`; it is imported here so
 * the panel can search and describe structures before the model finishes
 * loading. Mesh/node names are unique and are used as the key.
 *
 * Body space: Y up, metres, soles at y = 0, figure faces +Z. The subject's left
 * is +X (BodyParts3D convention), so an anterior camera at +Z sees the
 * subject's left on the viewer's right.
 */

export type Region =
  | 'head'
  | 'neck'
  | 'shoulder'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'arm'
  | 'forearm'
  | 'hand'
  | 'hip'
  | 'thigh'
  | 'leg'
  | 'foot';

export type StructureLayer = 'skeleton' | 'deep' | 'superficial';
export type StructureSide = 'left' | 'right' | 'midline';

export interface StructureInfo {
  /** glTF mesh / node name — unique in the atlas. */
  key: string;
  name: string;
  layer: StructureLayer;
  side: StructureSide;
  /** Foundational Model of Anatomy concept id (BodyParts3D structures only). */
  fma: string | null;
  /** Z-Anatomy grouping label, when the source provides one. */
  group: string | null;
  tissue: string | null;
  isBone: boolean;
  /** Null for skeletal structures, which are not region-tinted. */
  region: Region | null;
}

interface RawStructure {
  name?: string;
  layer?: string;
  side?: string;
  source?: string;
  fma?: string;
  group?: string;
  tissue?: string;
}

const LAYERS: Record<string, StructureLayer> = {
  skeleton: 'skeleton',
  'deep muscles': 'deep',
  'superficial muscles': 'superficial',
};

const SIDES: Record<string, StructureSide> = {
  left: 'left',
  right: 'right',
  midline: 'midline',
};

/**
 * Region rules, evaluated in order on a side-free, lower-cased mesh name.
 * Order matters: `flexor hallucis longus` is a leg muscle, `abductor hallucis`
 * is a foot muscle, so the leg rules run before the foot rules.
 */
const REGION_RULES: Array<[Region, RegExp[]]> = [
  [
    'head',
    [
      /frontalis/,
      /occipitalis/,
      /temporalis/,
      /masseter/,
      /pterygoid/,
      /orbicularis oculi/,
      /orbicularis oris/,
      /zygomaticus/,
      /levator labii/,
      /depressor labii/,
      /depressor anguli/,
      /risorius/,
      /mentalis/,
      /procerus/,
      /nasalis/,
      /corrugator/,
      /buccinator/,
      /auricularis/,
    ],
  ],
  [
    'neck',
    [
      /sternocleidomastoid/,
      /scalenus/,
      /splenius/,
      /semispinalis capitis/,
      /semispinalis cervicis/,
      /longissimus capitis/,
      /longissimus cervicis/,
      /iliocostalis cervicis/,
      /rectus capitis/,
      /obliquus capitis/,
      /suboccipital/,
      /infrahyoid/,
      /sternohyoid/,
      /sternothyroid/,
      /thyrohyoid/,
      /omohyoid/,
      /levator scapulae/,
      /longus colli/,
      /longus capitis/,
      /platysma/,
    ],
  ],
  [
    'shoulder',
    [
      /deltoid/,
      /supraspinatus/,
      /infraspinatus/,
      /teres major/,
      /teres minor/,
      /subscapularis/,
    ],
  ],
  [
    'chest',
    [/pectoralis/, /intercostal/, /serratus anterior/, /subclavius/, /transversus thoracis/],
  ],
  [
    'abdomen',
    [
      /rectus abdominis/,
      /external oblique/,
      /internal oblique/,
      /transversus abdominis/,
      /pyramidalis/,
      /linea alba/,
    ],
  ],
  [
    'back',
    [
      /trapezius/,
      /latissimus/,
      /rhomboid/,
      /iliocostalis/,
      /longissimus thoracis/,
      /spinalis/,
      /semispinalis thoracis/,
      /multifidus/,
      /rotatores/,
      /serratus posterior/,
      /thoracolumbar fascia/,
      /quadratus lumborum/,
      /levator costae/,
      /erector spinae/,
    ],
  ],
  [
    'arm',
    [/biceps brachii/, /triceps brachii/, /brachialis/, /coracobrachialis/, /anconeus/],
  ],
  [
    'forearm',
    [
      /brachioradialis/,
      /extensor carpi/,
      /extensor digitorum/,
      /extensor digiti minimi/,
      /extensor indicis/,
      /extensor pollicis/,
      /abductor pollicis longus/,
      /flexor carpi/,
      /flexor digitorum superficialis/,
      /flexor digitorum profundus/,
      /flexor pollicis longus/,
      /palmaris longus/,
      /pronator/,
      /supinator/,
      /retinaculum/,
    ],
  ],
  [
    'thigh',
    [
      /sartorius/,
      /rectus femoris/,
      /vastus/,
      /adductor brevis/,
      /adductor longus/,
      /adductor magnus/,
      /adductor minimus/,
      /gracilis/,
      /pectineus/,
      /biceps femoris/,
      /semitendinosus/,
      /semimembranosus/,
    ],
  ],
  [
    'leg',
    [
      /gastrocnemius/,
      /soleus/,
      /plantaris/,
      /popliteus/,
      /tibialis/,
      /fibularis/,
      /peroneus/,
      /digitorum longus/,
      /hallucis longus/,
      /calcaneal tendon/,
      /triceps surae/,
    ],
  ],
  [
    'hip',
    [
      /gluteus/,
      /piriformis/,
      /gemellus/,
      /obturator/,
      /quadratus femoris/,
      /iliacus/,
      /psoas/,
      /tensor fasciae latae/,
      /iliotibial tract/,
    ],
  ],
  [
    'foot',
    [
      /\bfoot\b/,
      /hallucis/,
      /digitorum brevis/,
      /plantar interosse/,
      /plantar aponeurosis/,
      /quadratus plantae/,
    ],
  ],
  [
    'hand',
    [
      /\bhand\b/,
      /pollicis brevis/,
      /opponens pollicis/,
      /adductor pollicis/,
      /palmar aponeurosis/,
      /lumbrical/,
      /interosse/,
    ],
  ],
];

/** Strip side and part prefixes so heads of one muscle share a base name. */
export function baseMuscleName(meshName: string): string {
  return meshName
    .replace(/\(2\)/g, ' ')
    .replace(/\b(left|right)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:[a-z]+\s+)?(?:head|part)\s+of\s+/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*muscle$/i, '')
    .trim();
}

/** `Pectoralis major` → `pectoralis-major`, used to key curated metadata. */
export function muscleSlug(meshName: string): string {
  return baseMuscleName(meshName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function regionForMuscle(meshName: string): Region | null {
  const needle = baseMuscleName(meshName).toLowerCase();
  for (const [region, patterns] of REGION_RULES) {
    for (const pattern of patterns) {
      if (pattern.test(needle)) return region;
    }
  }
  return null;
}

function classify(raw: RawStructure): StructureInfo {
  const key = raw.name ?? 'Unnamed structure';
  const layer = LAYERS[raw.layer ?? ''] ?? 'skeleton';
  const tissue = raw.tissue ?? null;
  const isBone = layer === 'skeleton';
  return {
    key,
    name: key,
    layer,
    side: SIDES[raw.side ?? ''] ?? 'midline',
    fma: raw.fma ?? null,
    group: raw.group ?? null,
    tissue,
    isBone,
    region: isBone ? null : regionForMuscle(key),
  };
}

export const STRUCTURES: StructureInfo[] = (rawStructures as RawStructure[]).map(classify);

export const STRUCTURE_BY_NAME: ReadonlyMap<string, StructureInfo> = new Map(
  STRUCTURES.map((structure) => [structure.key, structure]),
);

export const MUSCLE_STRUCTURES: StructureInfo[] = STRUCTURES.filter((s) => !s.isBone);

export const BONE_STRUCTURES: StructureInfo[] = STRUCTURES.filter((s) => s.isBone);

export const STRUCTURE_COUNTS = {
  total: STRUCTURES.length,
  bones: BONE_STRUCTURES.length,
  muscles: MUSCLE_STRUCTURES.length,
  deep: MUSCLE_STRUCTURES.filter((s) => s.layer === 'deep').length,
  superficial: MUSCLE_STRUCTURES.filter((s) => s.layer === 'superficial').length,
} as const;

export function getStructure(key: string | null): StructureInfo | null {
  if (!key) return null;
  return STRUCTURE_BY_NAME.get(key) ?? null;
}
