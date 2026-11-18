#!/usr/bin/env node
/**
 * End-to-end proof that selecting an exercise actually recolours the 3D atlas.
 *
 * Usage:
 *   node scripts/e2e-heatmap.mjs [baseUrl]
 *
 * With no argument the script builds nothing itself — it serves the existing
 * static export in out/ the same way the CI smoke test does (a temporary
 * directory with a `muscleBurn -> out` symlink, served by python3 http.server),
 * then drives Chromium through Playwright:
 *
 *   1. page 200, title, non-zero canvas, model finished loading;
 *   2. screenshot the WebGL canvas BEFORE any exercise is selected;
 *   3. click "Barbell Back Squat", wait for the activation legend;
 *   4. screenshot the canvas again and decode both PNGs (zlib only, no deps):
 *      more than 2 % of pixels must have changed, proving the meshes recoloured;
 *   5. switch the Setting filter to Home, select "Push-Up", and repeat the
 *      legend + >2 % recolour check against the squat frame — proving a
 *      home/bodyweight exercise drives the same 3D heat map;
 *   6. open About and count the rendered reference entries (>= 90);
 *   7. fail on any uncaught page error or console error.
 *
 * Playwright is resolved exactly like scripts/ci-smoke.mjs (NODE_PATH or an
 * out-of-repo install); it is never added to package.json.
 *
 * Exit codes: 0 all assertions passed, 1 assertion failed, 2 harness failure.
 */

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const require = createRequire(import.meta.url);

const NAV_TIMEOUT_MS = Number(process.env.E2E_NAV_TIMEOUT_MS || 60000);
const CANVAS_TIMEOUT_MS = Number(process.env.E2E_CANVAS_TIMEOUT_MS || 90000);
const MODEL_TIMEOUT_MS = Number(process.env.E2E_MODEL_TIMEOUT_MS || 120000);
const RENDER_SETTLE_MS = Number(process.env.E2E_RENDER_SETTLE_MS || 1200);
const PIXEL_DELTA = Number(process.env.E2E_PIXEL_DELTA || 24);
const MIN_CHANGED_FRACTION = Number(process.env.E2E_MIN_CHANGED || 0.02);
const MIN_REFERENCES = 90;
const EXERCISE_NAME = 'Barbell Back Squat';
const HOME_EXERCISE_NAME = 'Push-Up';

/* ------------------------------- playwright ------------------------------- */

function loadPlaywright() {
  const attempts = [
    ['playwright', () => require('playwright')],
    [
      './node_modules/playwright',
      () => require(path.join(process.cwd(), 'node_modules', 'playwright')),
    ],
  ];
  for (const [, load] of attempts) {
    try {
      return load();
    } catch {
      // try the next resolution strategy
    }
  }
  console.error(
    'e2e-heatmap: cannot resolve the "playwright" package.\n' +
      'Install it outside the repo, e.g.\n' +
      '  npm install --no-save --prefix /tmp/pw playwright@1.49.0\n' +
      '  /tmp/pw/node_modules/.bin/playwright install chromium\n' +
      'then run with NODE_PATH=/tmp/pw/node_modules node scripts/e2e-heatmap.mjs',
  );
  process.exit(2);
}

/* --------------------------------- server --------------------------------- */

const root = process.cwd();
const outDir = path.join(root, 'out');

async function startServer() {
  const tmp = mkdtempSync(path.join(tmpdir(), 'muscleburn-e2e-'));
  symlinkSync(outDir, path.join(tmp, 'muscleBurn'), 'dir');

  for (let port = 4177; port < 4220; port += 1) {
    const server = spawn(
      'python3',
      ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', tmp],
      { stdio: 'ignore' },
    );
    const url = `http://127.0.0.1:${port}/muscleBurn/`;
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (server.exitCode !== null) break;
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // not listening yet
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (ready) {
      return {
        url,
        stop: () => {
          server.kill('SIGTERM');
          try {
            rmSync(tmp, { recursive: true, force: true });
          } catch {
            // best effort
          }
        },
      };
    }
    server.kill('SIGKILL');
  }
  rmSync(tmp, { recursive: true, force: true });
  throw new Error('could not start python3 http.server on ports 4177-4219');
}

/* ------------------------------- PNG decode ------------------------------- */

function decodePng(buffer) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let index = 0; index < signature.length; index += 1) {
    if (buffer[index] !== signature[index]) throw new Error('not a PNG buffer');
  }

  let offset = 8;
  let header = null;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (!header) throw new Error('PNG has no IHDR');
  if (header.bitDepth !== 8 || header.interlace !== 0) {
    throw new Error(
      `unsupported PNG (bitDepth ${header.bitDepth}, interlace ${header.interlace})`,
    );
  }
  const channels = header.colorType === 6 ? 4 : header.colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`unsupported PNG colour type ${header.colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = header.width * channels;
  const out = Buffer.alloc(stride * header.height);
  let previous = Buffer.alloc(stride);

  for (let row = 0; row < header.height; row += 1) {
    const filter = raw[row * (stride + 1)];
    const line = raw.subarray(row * (stride + 1) + 1, (row + 1) * (stride + 1));
    const current = Buffer.alloc(stride);
    for (let index = 0; index < stride; index += 1) {
      const left = index >= channels ? current[index - channels] : 0;
      const up = previous[index];
      const upLeft = index >= channels ? previous[index - channels] : 0;
      const value = line[index];
      switch (filter) {
        case 0:
          current[index] = value;
          break;
        case 1:
          current[index] = (value + left) & 0xff;
          break;
        case 2:
          current[index] = (value + up) & 0xff;
          break;
        case 3:
          current[index] = (value + ((left + up) >> 1)) & 0xff;
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          const predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
          current[index] = (value + predictor) & 0xff;
          break;
        }
        default:
          throw new Error(`unknown PNG filter ${filter}`);
      }
    }
    current.copy(out, row * stride);
    previous = current;
  }

  return { width: header.width, height: header.height, channels, data: out };
}

function changedFraction(before, after) {
  if (before.width !== after.width || before.height !== after.height) {
    throw new Error(
      `canvas size changed between shots: ${before.width}x${before.height} → ${after.width}x${after.height}`,
    );
  }
  const total = before.width * before.height;
  let changed = 0;
  for (let pixel = 0; pixel < total; pixel += 1) {
    const base = pixel * before.channels;
    const delta =
      Math.abs(before.data[base] - after.data[base]) +
      Math.abs(before.data[base + 1] - after.data[base + 1]) +
      Math.abs(before.data[base + 2] - after.data[base + 2]);
    if (delta > PIXEL_DELTA) changed += 1;
  }
  return changed / total;
}

/* -------------------------------- harness --------------------------------- */

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

const IGNORED_CONSOLE = [/favicon/i, /Download the React DevTools/i];
const isIgnored = (text) => IGNORED_CONSOLE.some((re) => re.test(text));

const consoleErrors = [];
const pageErrors = [];

let server = null;
let browser = null;
try {
  const providedUrl = process.argv[2];
  if (providedUrl) {
    console.log(`e2e-heatmap: using supplied base URL ${providedUrl}`);
  } else {
    if (!existsSync(path.join(outDir, 'index.html'))) {
      throw new Error('out/index.html is missing — run `npm run build` first');
    }
    server = await startServer();
    console.log(`e2e-heatmap: serving out/ at ${server.url}`);
  }
  const baseUrl = providedUrl || server.url;

  const { chromium } = loadPlaywright();
  browser = await chromium.launch({
    headless: true,
    // Software WebGL so the three.js canvas can initialise on a headless runner.
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!isIgnored(text)) consoleErrors.push(text);
  });
  page.on('pageerror', (err) => pageErrors.push(err?.stack || String(err)));

  const response = await page.goto(baseUrl, {
    waitUntil: 'domcontentloaded',
    timeout: NAV_TIMEOUT_MS,
  });
  check('response received', Boolean(response), response ? response.url() : 'no response');
  check('HTTP 200', response?.status() === 200, `status ${response?.status() ?? 'n/a'}`);

  const title = await page.title();
  check('title contains "muscleBurn"', /muscleburn/i.test(title), JSON.stringify(title));

  let canvasAppeared = true;
  try {
    await page.waitForSelector('canvas', { timeout: CANVAS_TIMEOUT_MS });
  } catch {
    canvasAppeared = false;
  }
  const canvasCount = await page.locator('canvas').count();
  const canvasBox = canvasCount ? await page.locator('canvas').first().boundingBox() : null;
  check('a <canvas> is present', canvasAppeared && canvasCount > 0, `${canvasCount} canvas element(s)`);
  check(
    'canvas is rendered (non-zero size)',
    Boolean(canvasBox && canvasBox.width > 0 && canvasBox.height > 0),
    canvasBox ? `${Math.round(canvasBox.width)}x${Math.round(canvasBox.height)} CSS px` : 'no box',
  );

  // Wait for the GLB to finish loading AND for the viewer status overlay to go.
  let modelLoaded = true;
  try {
    await page.waitForFunction(
      () => {
        const text = document.body?.innerText ?? '';
        return !/Loading Écorché atlas|The model couldn/i.test(text);
      },
      undefined,
      { timeout: MODEL_TIMEOUT_MS },
    );
  } catch {
    modelLoaded = false;
  }
  check('Écorché model finished loading', modelLoaded, modelLoaded ? 'status overlay gone' : 'timed out');

  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(RENDER_SETTLE_MS);

  const canvas = page.locator('canvas').first();
  const before = decodePng(await canvas.screenshot());
  console.log(
    `e2e-heatmap: baseline canvas ${before.width}x${before.height} (${before.channels} channels)`,
  );

  // Exercises tab → the squat.
  await page.getByRole('tab', { name: 'Exercises' }).click();
  const exerciseButton = page
    .getByRole('button', { name: new RegExp(EXERCISE_NAME, 'i') })
    .first();
  await exerciseButton.waitFor({ state: 'visible', timeout: 30000 });
  await exerciseButton.click();

  const legend = page.locator('[aria-label="Activation heat map legend"]');
  let legendAppeared = true;
  try {
    await legend.waitFor({ state: 'visible', timeout: 30000 });
  } catch {
    legendAppeared = false;
  }
  check('activation legend appears after selecting the exercise', legendAppeared);
  const legendText = legendAppeared ? await legend.innerText() : '';
  check(
    'legend names the active exercise and the ramp ends',
    legendAppeared && /Barbell Back Squat/i.test(legendText) && /Low/i.test(legendText) && /High/i.test(legendText),
    legendAppeared ? JSON.stringify(legendText.replace(/\s+/g, ' ').trim()) : 'legend missing',
  );
  const rampBackground = legendAppeared
    ? await legend.locator('.stage-legend-bar').evaluate((node) => getComputedStyle(node).backgroundImage)
    : '';
  check(
    'legend ramp is drawn from the heat gradient',
    /linear-gradient/.test(rampBackground),
    rampBackground.slice(0, 72),
  );

  await page.waitForTimeout(RENDER_SETTLE_MS);
  const after = decodePng(await canvas.screenshot());
  const fraction = changedFraction(before, after);
  check(
    `3D canvas recoloured (> ${(MIN_CHANGED_FRACTION * 100).toFixed(0)} % of pixels changed)`,
    fraction > MIN_CHANGED_FRACTION,
    `${(fraction * 100).toFixed(1)} % of ${before.width * before.height} pixels changed`,
  );

  /* ------------------- second scenario: a Home exercise ------------------- */

  // Back to the list, then narrow it with the new Setting = Home filter.
  await page.getByRole('button', { name: /All exercises/i }).first().click();
  const homeFilter = page.getByRole('button', { name: /^Home \(/i });
  await homeFilter.waitFor({ state: 'visible', timeout: 20000 });
  await homeFilter.click();
  const homePressed = await homeFilter.getAttribute('aria-pressed');
  check('Setting = Home filter chip is active', homePressed === 'true', `aria-pressed=${homePressed}`);

  const squatRowsAfterFilter = await page
    .getByRole('button', { name: new RegExp(EXERCISE_NAME, 'i') })
    .count();
  check(
    'Setting = Home hides gym-only exercises',
    squatRowsAfterFilter === 0,
    `${squatRowsAfterFilter} squat row(s) visible`,
  );

  const homeExerciseButton = page
    .getByRole('button', { name: new RegExp(`^${HOME_EXERCISE_NAME}\\b`, 'i') })
    .first();
  let homeButtonVisible = true;
  try {
    await homeExerciseButton.waitFor({ state: 'visible', timeout: 20000 });
  } catch {
    homeButtonVisible = false;
  }
  check('home exercise appears under Setting = Home', homeButtonVisible, HOME_EXERCISE_NAME);
  if (homeButtonVisible) await homeExerciseButton.click();

  let homeLegendAppeared = true;
  try {
    await legend.waitFor({ state: 'visible', timeout: 30000 });
  } catch {
    homeLegendAppeared = false;
  }
  const homeLegendText = homeLegendAppeared ? await legend.innerText() : '';
  check(
    'legend names the home exercise',
    homeLegendAppeared && new RegExp(HOME_EXERCISE_NAME, 'i').test(homeLegendText),
    homeLegendAppeared ? JSON.stringify(homeLegendText.replace(/\s+/g, ' ').trim()) : 'legend missing',
  );

  const homeBadge = page.locator('.mbx-detail .mbx-setting-home');
  const homeBadgeText = (await homeBadge.count()) ? await homeBadge.first().innerText() : '';
  check(
    'detail header carries the Home badge',
    /^Home$/.test(homeBadgeText.trim()),
    JSON.stringify(homeBadgeText.trim()),
  );

  await page.waitForTimeout(RENDER_SETTLE_MS);
  const homeFrame = decodePng(await canvas.screenshot());
  const homeFraction = changedFraction(after, homeFrame);
  check(
    `3D canvas recoloured for the home exercise (> ${(MIN_CHANGED_FRACTION * 100).toFixed(0)} % of pixels changed)`,
    homeFraction > MIN_CHANGED_FRACTION,
    `${(homeFraction * 100).toFixed(1)} % of ${after.width * after.height} pixels changed`,
  );

  // About tab → references.
  await page.getByRole('tab', { name: 'About' }).click();
  await page
    .getByRole('heading', { name: 'Sources & method' })
    .waitFor({ state: 'visible', timeout: 20000 })
    .catch(() => {});
  const headingVisible = await page
    .getByRole('heading', { name: 'Sources & method' })
    .isVisible()
    .catch(() => false);
  check('About tab has a "Sources & method" heading', headingVisible);

  let referenceCount = 0;
  try {
    await page.waitForFunction(
      (minimum) => document.querySelectorAll('.mbr-ref').length >= minimum,
      MIN_REFERENCES,
      { timeout: 20000 },
    );
  } catch {
    // reported by the assertion below
  }
  referenceCount = await page.locator('.mbr-ref').count();
  check(
    `references panel lists >= ${MIN_REFERENCES} sources`,
    referenceCount >= MIN_REFERENCES,
    `${referenceCount} entries rendered`,
  );

  check(
    'no uncaught page errors',
    pageErrors.length === 0,
    pageErrors.length ? `${pageErrors.length} error(s)` : 'none',
  );
  check(
    'no console errors',
    consoleErrors.length === 0,
    consoleErrors.length ? `${consoleErrors.length} error(s)` : 'none',
  );

  if (pageErrors.length) {
    console.log('\n--- page errors ---');
    for (const err of pageErrors) console.log(err);
  }
  if (consoleErrors.length) {
    console.log('\n--- console errors ---');
    for (const err of consoleErrors) console.log(err);
  }
} catch (err) {
  console.error(`e2e-heatmap: harness failure — ${err?.stack || err}`);
  if (browser) await browser.close().catch(() => {});
  if (server) server.stop();
  process.exit(2);
} finally {
  if (browser) await browser.close().catch(() => {});
}

if (server) server.stop();

const failures = results.filter((entry) => !entry.ok);
console.log(`\ne2e-heatmap: ${results.length - failures.length}/${results.length} assertions passed`);
if (failures.length) {
  console.error(`e2e-heatmap: FAILED — ${failures.map((entry) => entry.name).join('; ')}`);
  process.exit(1);
}
console.log('e2e-heatmap: OK');
process.exit(0);
