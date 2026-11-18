// Original schematic pose data for the 2D line-art exercise figures.
//
// Licence note: every number in this file is author-written for muscleBurn; no
// third-party artwork, motion-capture data or photographs are used. The figure
// is a stick-figure *schematic*, not an anatomical or photographic reference.
//
// Geometry conventions (sagittal plane, figure faces +x / to the right):
//   trunk      torso lean, degrees forward from upright (0 = standing tall)
//   neck       head lean, degrees forward from upright (0 = looking ahead)
//   hipL/hipR  thigh direction measured from straight-down, + = knee travels
//              forward (hip flexion). 0 = standing, 90 = thigh horizontal.
//   kneeL/R    shank direction from straight-down, + = ankle ahead of knee, so
//              a bent knee under a forward shin is negative.
//   ankleL/R   foot direction from straight-down; 90 = sole flat on the floor.
//   shoulderL/R upper-arm direction from straight-down, + = elbow swings
//              forward/up (0 = hanging by the side, 180 = overhead).
//   elbowL/R   forearm direction from straight-down, same sign convention
//              (0 = straight arm, 150 = full flex with the hand up front).
//   L limbs are the far side (drawn dimmed behind the torso), R the near side.

export interface Pose {
  trunk: number;
  neck: number;
  hipL: number;
  hipR: number;
  kneeL: number;
  kneeR: number;
  ankleL: number;
  ankleR: number;
  shoulderL: number;
  shoulderR: number;
  elbowL: number;
  elbowR: number;
}

export type FigureView = 'side' | 'front';

/**
 * How the drawing is seated in the frame:
 *   floor  the lowest joint rests on the floor line (squats, planks, hinges)
 *   hands  the near wrist stays planted and the body travels (push-ups, dips)
 *   bench  the torso height is fixed by a bench/seat prop (bench press, hip thrust)
 *   hang   the hands stay fixed under a bar and the body travels (pull-ups, rows)
 */
export type FigureAnchor = 'floor' | 'hands' | 'bench' | 'hang';

/** Simple line-art prop drawn behind the skeleton, when the movement needs one. */
export type FigureProp = 'bar' | 'bench';

export interface ExerciseAnimation {
  /** Poses are interpolated start → end → start with an ease-in-out loop. */
  start: Pose;
  end: Pose;
  caption: string;
  /** 'front' only widens the stance slightly; the drawing is still sagittal. */
  view?: FigureView;
  anchor?: FigureAnchor;
  prop?: FigureProp;
  /** For `anchor: 'bench'`, which joint the pad supports (default the chest). */
  seat?: 'chest' | 'pelvis';
}

const mirror = (pose: Pose): Pose => ({
  trunk: pose.trunk,
  neck: pose.neck,
  hipL: pose.hipR,
  hipR: pose.hipL,
  kneeL: pose.kneeR,
  kneeR: pose.kneeL,
  ankleL: pose.ankleR,
  ankleR: pose.ankleL,
  shoulderL: pose.shoulderR,
  shoulderR: pose.shoulderL,
  elbowL: pose.elbowR,
  elbowR: pose.elbowL,
});

/** Standing tall, arms by the sides — the neutral start for most movements. */
export const STAND: Pose = {
  trunk: 3,
  neck: 0,
  hipL: -4,
  hipR: 3,
  kneeL: -1,
  kneeR: 1,
  ankleL: 88,
  ankleR: 88,
  shoulderL: -5,
  shoulderR: 5,
  elbowL: 7,
  elbowR: 9,
};

const withNeutralArms = (pose: Omit<Pose, 'shoulderL' | 'shoulderR' | 'elbowL' | 'elbowR'>): Pose => ({
  ...pose,
  shoulderL: -5,
  shoulderR: 5,
  elbowL: 7,
  elbowR: 9,
});

/* -------------------------- pattern fallbacks ---------------------------- */

export type PosePattern =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'lunge'
  | 'curl'
  | 'extension'
  | 'raise'
  | 'plank'
  | 'calf'
  | 'core';

export const PATTERN_ANIMATIONS: Record<PosePattern, ExerciseAnimation> = {
  squat: {
    start: STAND,
    end: {
      trunk: 26,
      neck: -12,
      hipL: 72,
      hipR: 78,
      kneeL: -22,
      kneeR: -26,
      ankleL: 88,
      ankleR: 88,
      shoulderL: 78,
      shoulderR: 82,
      elbowL: 84,
      elbowR: 88,
    },
    caption: 'Squat pattern: hips travel down and back, knees track over the toes, torso stays braced.',
  },
  hinge: {
    start: STAND,
    end: {
      trunk: 62,
      neck: -40,
      hipL: 34,
      hipR: 40,
      kneeL: -6,
      kneeR: -10,
      ankleL: 88,
      ankleR: 88,
      shoulderL: 40,
      shoulderR: 36,
      elbowL: 42,
      elbowR: 38,
    },
    caption: 'Hinge pattern: hips shift back, spine stays long, load hangs close to the shins.',
  },
  push: {
    start: STAND,
    end: {
      trunk: 1,
      neck: 0,
      hipL: -6,
      hipR: 4,
      kneeL: -2,
      kneeR: 0,
      ankleL: 88,
      ankleR: 88,
      shoulderL: 88,
      shoulderR: 92,
      elbowL: 96,
      elbowR: 100,
    },
    caption: 'Push pattern: hands drive forward at chest height, ribs stacked over the pelvis.',
  },
  pull: {
    start: STAND,
    end: {
      trunk: 6,
      neck: -4,
      hipL: -4,
      hipR: 4,
      kneeL: -1,
      kneeR: 1,
      ankleL: 88,
      ankleR: 88,
      shoulderL: 60,
      shoulderR: 64,
      elbowL: 130,
      elbowR: 134,
    },
    caption: 'Pull pattern: elbows travel down and back, shoulder blades set before the arms finish.',
  },
  lunge: {
    start: STAND,
    end: {
      trunk: 12,
      neck: -6,
      hipL: 18,
      hipR: 42,
      kneeL: 4,
      kneeR: -40,
      ankleL: 70,
      ankleR: 88,
      shoulderL: -6,
      shoulderR: 6,
      elbowL: 12,
      elbowR: 14,
    },
    caption: 'Lunge pattern: front knee bends over the foot while the rear leg lengthens behind.',
  },
  curl: {
    start: withNeutralArms({
      trunk: 4,
      neck: 0,
      hipL: -4,
      hipR: 4,
      kneeL: 0,
      kneeR: 0,
      ankleL: 88,
      ankleR: 88,
    }),
    end: {
      trunk: 4,
      neck: 0,
      hipL: -4,
      hipR: 4,
      kneeL: 0,
      kneeR: 0,
      ankleL: 88,
      ankleR: 88,
      shoulderL: -2,
      shoulderR: 2,
      elbowL: 138,
      elbowR: 142,
    },
    caption: 'Curl pattern: the elbow stays pinned while the forearm sweeps to the shoulder.',
  },
  extension: {
    start: STAND,
    end: {
      trunk: 4,
      neck: 2,
      hipL: -4,
      hipR: 4,
      kneeL: 0,
      kneeR: 0,
      ankleL: 88,
      ankleR: 88,
      shoulderL: 34,
      shoulderR: 38,
      elbowL: 36,
      elbowR: 40,
    },
    caption: 'Extension pattern: the elbow angle opens until the arm is straight.',
  },
  raise: {
    start: STAND,
    end: {
      trunk: 2,
      neck: 0,
      hipL: -4,
      hipR: 4,
      kneeL: 0,
      kneeR: 0,
      ankleL: 88,
      ankleR: 88,
      shoulderL: 86,
      shoulderR: 90,
      elbowL: 92,
      elbowR: 96,
    },
    caption: 'Raise pattern: the arm lifts in the plane of the scapula with a soft elbow.',
  },
  plank: {
    start: {
      trunk: 82,
      neck: -60,
      hipL: -98,
      hipR: -94,
      kneeL: -96,
      kneeR: -92,
      ankleL: -64,
      ankleR: -64,
      shoulderL: 2,
      shoulderR: 6,
      elbowL: 86,
      elbowR: 90,
    },
    end: {
      trunk: 86,
      neck: -64,
      hipL: -100,
      hipR: -96,
      kneeL: -98,
      kneeR: -94,
      ankleL: -64,
      ankleR: -64,
      shoulderL: 0,
      shoulderR: 4,
      elbowL: 86,
      elbowR: 90,
    },
    caption: 'Plank pattern: one straight line from ear to ankle, braced trunk, quiet breathing.',
  },
  calf: {
    start: STAND,
    end: {
      trunk: 2,
      neck: 0,
      hipL: 0,
      hipR: 0,
      kneeL: 0,
      kneeR: 0,
      ankleL: 58,
      ankleR: 58,
      shoulderL: -5,
      shoulderR: 5,
      elbowL: 7,
      elbowR: 9,
    },
    caption: 'Calf pattern: the heel lifts while the forefoot stays planted on the floor.',
  },
  core: {
    start: {
      trunk: 62,
      neck: -34,
      hipL: 64,
      hipR: 70,
      kneeL: 34,
      kneeR: 38,
      ankleL: 92,
      ankleR: 92,
      shoulderL: 46,
      shoulderR: 50,
      elbowL: 120,
      elbowR: 124,
    },
    end: {
      trunk: 34,
      neck: -18,
      hipL: 74,
      hipR: 78,
      kneeL: 44,
      kneeR: 48,
      ankleL: 92,
      ankleR: 92,
      shoulderL: 66,
      shoulderR: 70,
      elbowL: 120,
      elbowR: 124,
    },
    caption: 'Core pattern: the spine flexes under control; the hips stay anchored.',
  },
};

/** Last-resort mapping from the dataset's `category` labels to a pattern. */
const CATEGORY_PATTERNS: Record<string, PosePattern> = {
  squat: 'squat',
  hinge: 'hinge',
  'horizontal push': 'push',
  'vertical push': 'push',
  'horizontal pull': 'pull',
  'vertical pull': 'pull',
  lunge: 'lunge',
  'elbow flexion': 'curl',
  'elbow extension': 'extension',
  'knee extension': 'extension',
  'knee flexion': 'curl',
  'hip extension': 'hinge',
  plantarflexion: 'calf',
  'shoulder abduction': 'raise',
  'shoulder horizontal adduction': 'raise',
  core: 'core',
};

/** Fallback animation for an exercise id or dataset category we have no pose for. */
export function patternAnimationFor(category: string | undefined): ExerciseAnimation {
  const pattern = (category && CATEGORY_PATTERNS[category]) || 'core';
  return PATTERN_ANIMATIONS[pattern];
}

export { mirror };

/* ------------------------- per-exercise animations ------------------------ */

/** Arms racked behind the neck for barbell back squats. */
const ARMS_ON_BACK: Pick<Pose, 'shoulderL' | 'shoulderR' | 'elbowL' | 'elbowR'> = {
  shoulderL: -18,
  shoulderR: -14,
  elbowL: -150,
  elbowR: -146,
};

/** Hands at the collarbones, elbows high — the front-rack position. */
const ARMS_FRONT_RACK: Pick<Pose, 'shoulderL' | 'shoulderR' | 'elbowL' | 'elbowR'> = {
  shoulderL: 112,
  shoulderR: 118,
  elbowL: -152,
  elbowR: -158,
};

/** Lying supine on a bench, knees bent, feet flat (head toward +x). */
const SUPINE: Pose = {
  trunk: 84,
  neck: 60,
  hipL: 74,
  hipR: 78,
  kneeL: 40,
  kneeR: 44,
  ankleL: 88,
  ankleR: 88,
  shoulderL: 176,
  shoulderR: 180,
  elbowL: 34,
  elbowR: 38,
};

/** Prone on the floor, legs extended behind the pelvis (head toward +x). */
const PRONE: Pose = {
  trunk: 86,
  neck: -58,
  hipL: -88,
  hipR: -84,
  kneeL: -86,
  kneeR: -82,
  ankleL: 108,
  ankleR: 108,
  shoulderL: 88,
  shoulderR: 92,
  elbowL: 92,
  elbowR: 96,
};

const anim = (
  caption: string,
  start: Pose,
  end: Pose,
  extra: Pick<ExerciseAnimation, 'view' | 'anchor' | 'prop' | 'seat'> = {},
): ExerciseAnimation => ({ start, end, caption, ...extra });

export const EXERCISE_ANIMATIONS: Record<string, ExerciseAnimation> = {
  'barbell-back-squat': anim(
    'Barbell back squat: hips drop between the heels, knees track over the toes, bar stays over mid-foot.',
    { ...STAND, ...ARMS_ON_BACK },
    {
      ...STAND,
      ...ARMS_ON_BACK,
      trunk: 26,
      neck: -14,
      hipL: 68,
      hipR: 74,
      kneeL: -20,
      kneeR: -26,
    },
  ),
  'front-squat': anim(
    'Front squat: a more upright torso keeps the bar over mid-foot while the knees travel forward.',
    { ...STAND, ...ARMS_FRONT_RACK },
    {
      ...STAND,
      ...ARMS_FRONT_RACK,
      trunk: 12,
      neck: -6,
      hipL: 62,
      hipR: 68,
      kneeL: -30,
      kneeR: -36,
    },
  ),
  'conventional-deadlift': anim(
    'Conventional deadlift: the bar breaks the floor with the hips and shoulders rising together, then the hips finish the lockout.',
    {
      ...STAND,
      trunk: 56,
      neck: -30,
      hipL: 46,
      hipR: 50,
      kneeL: -10,
      kneeR: -14,
      shoulderL: 8,
      shoulderR: 12,
      elbowL: 8,
      elbowR: 12,
    },
    {
      ...STAND,
      trunk: 2,
      neck: 0,
      hipL: 0,
      hipR: 3,
      kneeL: 0,
      kneeR: 1,
      shoulderL: 2,
      shoulderR: 5,
      elbowL: 2,
      elbowR: 4,
    },
  ),
  'romanian-deadlift': anim(
    'Romanian deadlift: the shins stay near vertical while the hips travel back and the hamstrings lengthen.',
    {
      ...STAND,
      trunk: 68,
      neck: -40,
      hipL: 20,
      hipR: 24,
      kneeL: -4,
      kneeR: -7,
      shoulderL: 6,
      shoulderR: 10,
      elbowL: 6,
      elbowR: 10,
    },
    {
      ...STAND,
      trunk: 2,
      hipL: 0,
      hipR: 3,
      shoulderL: 2,
      shoulderR: 5,
      elbowL: 2,
      elbowR: 4,
    },
  ),
  'barbell-bench-press': anim(
    'Barbell bench press: the bar touches the sternum with the elbows tucked, then presses to a stacked lockout.',
    { ...SUPINE, shoulderL: 176, shoulderR: 180, elbowL: 40, elbowR: 44 },
    { ...SUPINE, shoulderL: 176, shoulderR: 180, elbowL: 182, elbowR: 186 },
    { anchor: 'bench' },
  ),
  'incline-bench-press': anim(
    'Incline bench press: on a 30-degree bench the bar travels over the upper chest and the elbows stay under the wrists.',
    {
      ...SUPINE,
      trunk: 58,
      neck: 28,
      hipL: 74,
      hipR: 78,
      shoulderL: 168,
      shoulderR: 172,
      elbowL: 36,
      elbowR: 40,
    },
    {
      ...SUPINE,
      trunk: 58,
      neck: 28,
      hipL: 74,
      hipR: 78,
      shoulderL: 168,
      shoulderR: 172,
      elbowL: 176,
      elbowR: 180,
    },
    { anchor: 'bench' },
  ),
  'overhead-press': anim(
    'Overhead press: the bar starts on the front delts, the head moves back, and the bar finishes over the mid-foot.',
    { ...STAND, shoulderL: 44, shoulderR: 48, elbowL: 138, elbowR: 142 },
    { ...STAND, trunk: 1, shoulderL: 163, shoulderR: 167, elbowL: 167, elbowR: 171 },
  ),
  'barbell-row': anim(
    'Bent-over row: the torso stays hinged near 60 degrees while the elbows drive back past the ribs.',
    {
      ...STAND,
      trunk: 62,
      neck: -36,
      hipL: 18,
      hipR: 22,
      kneeL: -6,
      kneeR: -9,
      shoulderL: 6,
      shoulderR: 10,
      elbowL: 8,
      elbowR: 12,
    },
    {
      ...STAND,
      trunk: 62,
      neck: -36,
      hipL: 18,
      hipR: 22,
      kneeL: -6,
      kneeR: -9,
      shoulderL: -28,
      shoulderR: -24,
      elbowL: -128,
      elbowR: -124,
    },
  ),
  'pull-up': anim(
    'Pull-up: from a dead hang the shoulder blades set first, then the elbows drive to the ribs until the chin clears the bar.',
    {
      ...STAND,
      trunk: 1,
      hipL: 6,
      hipR: 9,
      kneeL: 14,
      kneeR: 18,
      shoulderL: 169,
      shoulderR: 173,
      elbowL: 171,
      elbowR: 175,
    },
    {
      ...STAND,
      trunk: 4,
      hipL: 8,
      hipR: 11,
      kneeL: 18,
      kneeR: 22,
      shoulderL: 150,
      shoulderR: 154,
      elbowL: -138,
      elbowR: -134,
    },
    { anchor: 'hang' },
  ),
  'lat-pulldown': anim(
    'Lat pulldown: a fixed torso lets the bar travel to the collarbones with the elbows leading down and back.',
    {
      ...STAND,
      trunk: -6,
      hipL: 82,
      hipR: 86,
      kneeL: -4,
      kneeR: -1,
      shoulderL: 168,
      shoulderR: 172,
      elbowL: 172,
      elbowR: 176,
    },
    {
      ...STAND,
      trunk: -4,
      hipL: 82,
      hipR: 86,
      kneeL: -4,
      kneeR: -1,
      shoulderL: 128,
      shoulderR: 132,
      elbowL: -132,
      elbowR: -128,
    },
    { anchor: 'bench', seat: 'pelvis' },
  ),
  'biceps-curl': anim(
    'Biceps curl: the upper arm stays vertical and still while the forearm sweeps to the shoulder.',
    { ...STAND, shoulderL: -2, shoulderR: 2, elbowL: 8, elbowR: 12 },
    { ...STAND, shoulderL: 2, shoulderR: 6, elbowL: 136, elbowR: 140 },
  ),
  'triceps-pushdown': anim(
    'Triceps pushdown: the elbows stay pinned to the ribs and only the forearm travels.',
    { ...STAND, shoulderL: 14, shoulderR: 18, elbowL: 96, elbowR: 100 },
    { ...STAND, shoulderL: 10, shoulderR: 14, elbowL: 12, elbowR: 16 },
  ),
  'overhead-triceps-extension': anim(
    'Overhead triceps extension: the upper arm stays beside the head while the forearm lowers behind it and extends again.',
    { ...STAND, shoulderL: 158, shoulderR: 162, elbowL: 56, elbowR: 60 },
    { ...STAND, shoulderL: 160, shoulderR: 164, elbowL: 166, elbowR: 170 },
  ),
  'leg-press': anim(
    'Leg press: the sled returns until the knees reach about 90 degrees, then the legs press away without locking hard.',
    {
      ...STAND,
      trunk: -42,
      neck: 10,
      hipL: 104,
      hipR: 108,
      kneeL: -50,
      kneeR: -54,
      ankleL: 96,
      ankleR: 96,
      shoulderL: 52,
      shoulderR: 56,
      elbowL: 128,
      elbowR: 132,
    },
    {
      ...STAND,
      trunk: -42,
      neck: 10,
      hipL: 82,
      hipR: 86,
      kneeL: 12,
      kneeR: 16,
      ankleL: 96,
      ankleR: 96,
      shoulderL: 52,
      shoulderR: 56,
      elbowL: 128,
      elbowR: 132,
    },
    { anchor: 'bench', seat: 'pelvis' },
  ),
  'leg-extension': anim(
    'Leg extension: the knee opens from roughly 90 degrees of flexion to near full extension, then returns under control.',
    {
      ...STAND,
      trunk: -8,
      hipL: 86,
      hipR: 90,
      kneeL: 4,
      kneeR: 8,
      ankleL: 96,
      ankleR: 96,
      shoulderL: 60,
      shoulderR: 64,
      elbowL: 120,
      elbowR: 124,
    },
    {
      ...STAND,
      trunk: -8,
      hipL: 84,
      hipR: 88,
      kneeL: 86,
      kneeR: 88,
      ankleL: 96,
      ankleR: 96,
      shoulderL: 60,
      shoulderR: 64,
      elbowL: 120,
      elbowR: 124,
    },
    { anchor: 'bench', seat: 'pelvis' },
  ),
  'leg-curl': anim(
    'Leg curl: prone on the machine, the heels travel toward the glutes with the hips pressed into the pad.',
    {
      ...PRONE,
      trunk: 84,
      neck: -52,
      hipL: -84,
      hipR: -80,
      kneeL: -84,
      kneeR: -80,
      ankleL: 108,
      ankleR: 108,
      shoulderL: 76,
      shoulderR: 80,
      elbowL: 120,
      elbowR: 124,
    },
    {
      ...PRONE,
      trunk: 84,
      neck: -52,
      hipL: -84,
      hipR: -80,
      kneeL: -138,
      kneeR: -132,
      ankleL: 108,
      ankleR: 108,
      shoulderL: 76,
      shoulderR: 80,
      elbowL: 120,
      elbowR: 124,
    },
  ),
  'hip-thrust': anim(
    'Hip thrust: the shoulder blades stay on the bench while the hips drive to a straight line from knees to shoulders.',
    {
      ...SUPINE,
      trunk: 30,
      neck: 8,
      hipL: 58,
      hipR: 62,
      kneeL: -18,
      kneeR: -14,
      shoulderL: 0,
      shoulderR: 4,
      elbowL: 120,
      elbowR: 124,
    },
    {
      ...SUPINE,
      trunk: 78,
      neck: 52,
      hipL: 84,
      hipR: 88,
      kneeL: -6,
      kneeR: -2,
      shoulderL: 0,
      shoulderR: 4,
      elbowL: 120,
      elbowR: 124,
    },
    { anchor: 'bench' },
  ),
  'calf-raise': PATTERN_ANIMATIONS.calf,
  'lateral-raise': {
    ...PATTERN_ANIMATIONS.raise,
    view: 'front',
    caption:
      'Lateral raise, drawn front-on: the arms travel out to shoulder height with a soft elbow and no shrug.',
  },
  'chest-fly': anim(
    'Chest fly: lying supine, the arms sweep from a wide stretch back to vertical over the chest with a fixed soft elbow.',
    { ...SUPINE, shoulderL: 202, shoulderR: 206, elbowL: 210, elbowR: 214 },
    { ...SUPINE, shoulderL: 176, shoulderR: 180, elbowL: 182, elbowR: 186 },
    { anchor: 'bench' },
  ),
  plank: {
    ...PATTERN_ANIMATIONS.plank,
    caption:
      'Plank: forearms and toes carry the load while the ribs stay stacked over the pelvis for the whole hold.',
  },
  crunch: anim(
    'Crunch: the spine flexes a few degrees off the floor; the hips stay down rather than anchoring a full sit-up.',
    {
      ...SUPINE,
      trunk: 84,
      neck: 56,
      hipL: 74,
      hipR: 78,
      kneeL: 42,
      kneeR: 46,
      shoulderL: 104,
      shoulderR: 108,
      elbowL: 44,
      elbowR: 48,
    },
    {
      ...SUPINE,
      trunk: 42,
      neck: 16,
      hipL: 74,
      hipR: 78,
      kneeL: 42,
      kneeR: 46,
      shoulderL: 104,
      shoulderR: 108,
      elbowL: 44,
      elbowR: 48,
    },
  ),
  'home-push-up': anim(
    'Push-up: one straight line from ear to ankle; the elbows bend toward the ribs and the hands stay under the shoulders.',
    {
      ...STAND,
      trunk: 86,
      neck: -58,
      hipL: -96,
      hipR: -92,
      kneeL: -94,
      kneeR: -90,
      ankleL: -64,
      ankleR: -64,
      shoulderL: 2,
      shoulderR: 6,
      elbowL: 4,
      elbowR: 8,
    },
    {
      ...STAND,
      trunk: 84,
      neck: -56,
      hipL: -96,
      hipR: -92,
      kneeL: -94,
      kneeR: -90,
      ankleL: -64,
      ankleR: -64,
      shoulderL: 34,
      shoulderR: 38,
      elbowL: -30,
      elbowR: -26,
    },
    { anchor: 'hands' },
  ),
  'home-bodyweight-squat': {
    ...PATTERN_ANIMATIONS.squat,
    caption:
      'Bodyweight squat: arms reach forward as a counterweight while the hips sink between the heels and the spine stays braced.',
  },
  'home-bulgarian-split-squat': anim(
    'Bulgarian split squat: the rear foot rests on a bench and the front knee tracks over the toes as the hips drop straight down.',
    {
      ...STAND,
      trunk: 8,
      hipL: -20,
      hipR: 30,
      kneeL: -118,
      kneeR: -12,
      ankleL: 70,
      ankleR: 88,
      shoulderL: -8,
      shoulderR: 4,
      elbowL: 20,
      elbowR: 24,
    },
    {
      ...STAND,
      trunk: 18,
      neck: -8,
      hipL: -38,
      hipR: 64,
      kneeL: -148,
      kneeR: -30,
      ankleL: 70,
      ankleR: 88,
      shoulderL: -8,
      shoulderR: 4,
      elbowL: 20,
      elbowR: 24,
    },
  ),
  'home-reverse-lunge': anim(
    'Reverse lunge: the trailing leg steps back, both knees bend, and the front shin stays roughly vertical.',
    STAND,
    {
      ...STAND,
      trunk: 14,
      neck: -6,
      hipL: -34,
      hipR: 26,
      kneeL: -58,
      kneeR: -22,
      ankleL: 66,
      ankleR: 88,
      shoulderL: -10,
      shoulderR: 2,
      elbowL: 24,
      elbowR: 28,
    },
  ),
  'home-glute-bridge': anim(
    'Glute bridge: heels stay close, the ribs stay down, and the hips lift until knees, hips and shoulders line up.',
    {
      ...SUPINE,
      trunk: 22,
      neck: 4,
      hipL: 58,
      hipR: 62,
      kneeL: -22,
      kneeR: -18,
      shoulderL: 4,
      shoulderR: 8,
      elbowL: 118,
      elbowR: 122,
    },
    {
      ...SUPINE,
      trunk: 80,
      neck: 54,
      hipL: 86,
      hipR: 90,
      kneeL: -6,
      kneeR: -2,
      shoulderL: 4,
      shoulderR: 8,
      elbowL: 118,
      elbowR: 122,
    },
  ),
  'home-inverted-row': anim(
    'Inverted row: the body stays rigid on a straight line while the elbows pull the chest toward the bar.',
    {
      ...STAND,
      trunk: 56,
      neck: -30,
      hipL: -54,
      hipR: -50,
      kneeL: -56,
      kneeR: -52,
      ankleL: 60,
      ankleR: 60,
      shoulderL: 174,
      shoulderR: 178,
      elbowL: 178,
      elbowR: 182,
    },
    {
      ...STAND,
      trunk: 52,
      neck: -26,
      hipL: -54,
      hipR: -50,
      kneeL: -56,
      kneeR: -52,
      ankleL: 60,
      ankleR: 60,
      shoulderL: 146,
      shoulderR: 150,
      elbowL: -138,
      elbowR: -134,
    },
    { anchor: 'hang', prop: 'bar' },
  ),
  'home-bench-dip': anim(
    'Bench dip: hands stay on the bench behind the hips and the elbows fold to about 90 degrees before pressing back up.',
    {
      ...STAND,
      trunk: 10,
      hipL: 42,
      hipR: 46,
      kneeL: -48,
      kneeR: -44,
      ankleL: 88,
      ankleR: 88,
      shoulderL: -18,
      shoulderR: -14,
      elbowL: -14,
      elbowR: -10,
    },
    {
      ...STAND,
      trunk: 16,
      hipL: 46,
      hipR: 50,
      kneeL: -50,
      kneeR: -46,
      ankleL: 88,
      ankleR: 88,
      shoulderL: -20,
      shoulderR: -16,
      elbowL: -138,
      elbowR: -134,
    },
    { anchor: 'hands', prop: 'bench' },
  ),
  'home-pike-push-up': anim(
    'Pike push-up: hips stay high over the shoulders while the head lowers between the hands and presses back up.',
    {
      ...STAND,
      trunk: 102,
      neck: -86,
      hipL: -62,
      hipR: -58,
      kneeL: -62,
      kneeR: -58,
      ankleL: 28,
      ankleR: 28,
      shoulderL: 44,
      shoulderR: 48,
      elbowL: 48,
      elbowR: 52,
    },
    {
      ...STAND,
      trunk: 104,
      neck: -88,
      hipL: -62,
      hipR: -58,
      kneeL: -62,
      kneeR: -58,
      ankleL: 28,
      ankleR: 28,
      shoulderL: 66,
      shoulderR: 70,
      elbowL: -22,
      elbowR: -18,
    },
    { anchor: 'hands' },
  ),
  'home-nordic-hamstring-curl': anim(
    'Nordic hamstring curl: the knees stay anchored and the torso lowers forward slowly, then the hamstrings pull it back up.',
    {
      ...STAND,
      trunk: 4,
      neck: 0,
      hipL: 2,
      hipR: 5,
      kneeL: -88,
      kneeR: -84,
      ankleL: -88,
      ankleR: -84,
      shoulderL: 88,
      shoulderR: 92,
      elbowL: 142,
      elbowR: 146,
    },
    {
      ...STAND,
      trunk: 58,
      neck: -36,
      hipL: 14,
      hipR: 17,
      kneeL: -88,
      kneeR: -84,
      ankleL: -88,
      ankleR: -84,
      shoulderL: 118,
      shoulderR: 122,
      elbowL: 44,
      elbowR: 48,
    },
  ),
  'home-single-leg-calf-raise': anim(
    'Single-leg calf raise: the working heel lifts over a full range while the other leg hangs relaxed.',
    {
      ...STAND,
      hipL: -22,
      hipR: 2,
      kneeL: 34,
      kneeR: 0,
      ankleL: 70,
      ankleR: 58,
    },
    {
      ...STAND,
      hipL: -22,
      hipR: 2,
      kneeL: 34,
      kneeR: 0,
      ankleL: 70,
      ankleR: 24,
    },
  ),
  'home-side-plank': {
    ...PATTERN_ANIMATIONS.plank,
    view: 'front',
    caption:
      'Side plank, drawn front-on: one forearm and the outer foot carry the load while the top arm reaches up.',
  },
  'home-step-up': anim(
    'Step-up: the trailing leg drives as the front hip flexes high enough to place the foot on the box, then the knee extends.',
    STAND,
    {
      ...STAND,
      trunk: 12,
      neck: -4,
      hipL: -14,
      hipR: 84,
      kneeL: -10,
      kneeR: -66,
      ankleL: 88,
      ankleR: 84,
      shoulderL: -8,
      shoulderR: 6,
      elbowL: 22,
      elbowR: 26,
    },
  ),
  'home-band-pull-apart': {
    ...PATTERN_ANIMATIONS.pull,
    view: 'front',
    caption:
      'Band pull-apart, drawn front-on: arms stay near shoulder height as the hands travel apart against the band.',
  },
  'home-superman': anim(
    'Superman: lying prone, the arms and legs lift together a few centimetres while the neck stays neutral.',
    {
      ...PRONE,
      shoulderL: 86,
      shoulderR: 90,
      elbowL: 90,
      elbowR: 94,
      hipL: -86,
      hipR: -82,
      kneeL: -84,
      kneeR: -80,
    },
    {
      ...PRONE,
      trunk: 78,
      neck: -50,
      shoulderL: 58,
      shoulderR: 62,
      elbowL: 62,
      elbowR: 66,
      hipL: -58,
      hipR: -54,
      kneeL: -56,
      kneeR: -52,
    },
  ),
};

/** Animation for one exercise, falling back to its category pattern. */
export function getExerciseAnimation(
  exerciseId: string,
  category?: string,
): ExerciseAnimation {
  return EXERCISE_ANIMATIONS[exerciseId] ?? patternAnimationFor(category);
}

/** True when the figure comes from a hand-tuned per-exercise entry. */
export function hasCustomPose(exerciseId: string): boolean {
  return exerciseId in EXERCISE_ANIMATIONS;
}
