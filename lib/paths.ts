/**
 * Runtime asset paths.
 *
 * The site is exported with `output: 'export'` and served from a sub-path, so
 * every runtime URL has to be built from the same basePath that
 * `next.config.mjs` declares. `next/image` and bundled imports get the prefix
 * automatically; plain `fetch`/loader URLs do not, hence this module.
 */
export const BASE_PATH = '/muscleBurn';

export const MODEL_URL = `${BASE_PATH}/models/ecorche.meshopt.glb`;
