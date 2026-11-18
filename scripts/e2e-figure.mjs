#!/usr/bin/env node
/**
 * End-to-end proof that every exercise detail carries an animated schematic
 * figure (components/ExerciseFigure.tsx).
 *
 * Usage:
 *   node scripts/e2e-figure.mjs [baseUrl]
 *
 * With no argument it serves the existing static export in out/ the same way
 * scripts/e2e-heatmap.mjs does (temporary dir + `muscleBurn -> out` symlink +
 * python3 http.server) and drives Chromium through Playwright:
 *
 *   1. open the Exercises tab and select a few representative exercises
 *      (squat, hinge, push, pull, bench, core);
 *   2. assert an <svg role="img"> with the accessible label
 *      "Schematic demonstration of <exercise>" exists, together with the
 *      caption and the play/pause control;
 *   3. screenshot the figure twice ~600 ms apart and decode both PNGs
 *      (zlib only, no deps): the frames must differ, proving the skeleton is
 *      actually animating rather than painted once;
 *   4. assert the figure also renders with prefers-reduced-motion: reduce, and
 *      that it is then static (identical frames) with the "static" note;
 *   5. optionally write per-exercise PNGs when FIGURE_SHOTS_DIR is set, for
 *      eyeballing the drawings.
 *
 * Playwright is resolved like scripts/ci-smoke.mjs (NODE_PATH or an out-of-repo
 * install); it is never added to package.json.
 *
 * Exit codes: 0 all assertions passed, 1 assertion failed, 2 harness failure.
 */

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const require = createRequire(import.meta.url);

const NAV_TIMEOUT_MS = Number(process.env.E2E_NAV_TIMEOUT_MS || 60000);
const CANVAS_TIMEOUT_MS = Number(process.env.E2E_CANVAS_TIMEOUT_MS || 90000);
const MODEL_TIMEOUT_MS = Number(process.env.E2E_MODEL_TIMEOUT_MS || 120000);
const FRAME_GAP_MS = Number(process.env.E2E_FRAME_GAP_MS || 600);
const PIXEL_DELTA = Number(process.env.E2E_PIXEL_DELTA || 24);
const MIN_CHANGED_FRACTION = Number(process.env.E2E_MIN_FIGURE_CHANGED || 0.004);
const SHOTS_DIR = process.env.FIGURE_SHOTS_DIR || '';

/** Exercises that exercise the different pose families and anchor modes. */
const CASES = [
  { name: 'Barbell Back Squat', custom: true },
  { name: 'Conventional Deadlift', custom: true },
  { name: 'Barbell Bench Press', custom: true },
  { name: 'Pull-Up', custom: true },
  { name: 'Push-Up', custom: true },
  { name: 'Biceps Curl', custom: true },
  // Pattern fallback (no bespoke keyframes): the band dataset added 12 records
  // whose categories resolve to a shared pattern animation.
  { name: 'Band Row', custom: false },
];

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
    'e2e-figure: cannot resolve the "playwright" package.\n' +
      'Install it outside the repo, e.g.\n' +
      '  npm install --no-save --prefix /tmp/pw playwright@1.49.0\n' +
      '  /tmp/pw/node_modules/.bin/playwright install chromium\n' +
      'then run with NODE_PATH=/tmp/pw/node_modules node scripts/e2e-figure.mjs',
  );
  process.exit(2);
}

/* --------------------------------- server --------------------------------- */

const root = process.cwd();
const outDir = path.join(root, 'out');

async function startServer() {
  const tmp = mkdtempSync(path.join(tmpdir(), 'muscleburn-figure-'));
  symlinkSync(outDir, path.join(tmp, 'muscleBurn'), 'dir');

  for (let port = 4230; port < 4270; port += 1) {
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
  throw new Error('could not start python3 http.server on ports 4230-4269');
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

/** Wait for two composited frames so a screenshot cannot reuse a stale raster. */
async function settleFrame(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)));
      }),
  );
}

/**
 * Screenshot an element by clipping the page: Playwright's own element
 * screenshot waits for the node to be "stable", which never happens for a
 * continuously animating figure.
 */
async function shoot(page, locator) {
  // The exercise panel scrolls; a clip outside the viewport captures a blank
  // strip and every frame would look identical.
  await locator.scrollIntoViewIfNeeded({ timeout: 20000 }).catch(() => {});
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  if (!box) throw new Error('figure has no bounding box');
  if (viewport && (box.y < -1 || box.y + box.height > viewport.height + 1)) {
    throw new Error(
      `figure is outside the viewport (y ${Math.round(box.y)}, height ${Math.round(
        box.height,
      )}) — cannot compare frames`,
    );
  }
  return page.screenshot({
    timeout: 120000,
    clip: {
      x: Math.max(0, Math.floor(box.x)),
      y: Math.max(0, Math.floor(box.y)),
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
  });
}

/** Largest pixel difference over every pair of captured frames. */
function maxPairDelta(frames) {
  let best = 0;
  for (let i = 0; i < frames.length; i += 1) {
    for (let j = i + 1; j < frames.length; j += 1) {
      best = Math.max(best, changedFraction(frames[i], frames[j]));
    }
  }
  return best;
}

/** Screen-space geometry of the near-side limb lines, for a cheap DOM check. */
async function limbGeometry(page, label) {
  return page.evaluate((ariaLabel) => {
    const svg = document.querySelector(`svg[aria-label="${ariaLabel}"]`);
    if (!svg) return null;
    return Array.from(svg.querySelectorAll('.mbx-figure-near line, .mbx-figure-core line')).map(
      (node) =>
        ['x1', 'y1', 'x2', 'y2']
          .map((name) => Number.parseFloat(node.getAttribute(name) || '0'))
          .join(','),
    );
  }, label);
}

const geometryMoved = (before, after) => {
  if (!before || !after || before.length !== after.length) return 0;
  let biggest = 0;
  for (let index = 0; index < before.length; index += 1) {
    const a = before[index].split(',').map(Number);
    const b = after[index].split(',').map(Number);
    for (let axis = 0; axis < a.length; axis += 1) {
      biggest = Math.max(biggest, Math.abs(a[axis] - b[axis]));
    }
  }
  return biggest;
};

function changedFraction(before, after) {
  if (before.width !== after.width || before.height !== after.height) {
    throw new Error(
      `figure size changed between shots: ${before.width}x${before.height} → ${after.width}x${after.height}`,
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

const IGNORED_CONSOLE = [
  /favicon/i,
  /Download the React DevTools/i,
  // This spec deliberately blocks the atlas GLB (see below), so the browser
  // logs the cancelled request; that is expected here, not a page bug.
  /Failed to load resource/i,
  /\.glb/i,
];
const isIgnored = (text) => IGNORED_CONSOLE.some((re) => re.test(text));

const consoleErrors = [];
const pageErrors = [];

let server = null;
let browser = null;
try {
  const providedUrl = process.argv[2];
  if (providedUrl) {
    console.log(`e2e-figure: using supplied base URL ${providedUrl}`);
  } else {
    if (!existsSync(path.join(outDir, 'index.html'))) {
      throw new Error('out/index.html is missing — run `npm run build` first');
    }
    server = await startServer();
    console.log(`e2e-figure: serving out/ at ${server.url}`);
  }
  const baseUrl = providedUrl || server.url;
  if (SHOTS_DIR) mkdirSync(SHOTS_DIR, { recursive: true });

  const { chromium } = loadPlaywright();
  browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  // The software-WebGL écorché leaves the page CPU-starved (rAF drops to ~1 fps
  // and screenshots take tens of seconds). This spec only covers the 2D SVG
  // figure, so the atlas download is cancelled and the render loop stays empty.
  await page.route('**/*.glb', (route) => route.abort());

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
  check('HTTP 200', response?.status() === 200, `status ${response?.status() ?? 'n/a'}`);

  await page.waitForSelector('canvas', { timeout: CANVAS_TIMEOUT_MS });
  await page
    .waitForFunction(
      () => !/Loading Écorché atlas|The model couldn/i.test(document.body?.innerText ?? ''),
      undefined,
      { timeout: MODEL_TIMEOUT_MS },
    )
    .catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(800);

  await page.getByRole('tab', { name: 'Exercises' }).click();

  for (const testCase of CASES) {
    const label = `Schematic demonstration of ${testCase.name}`;
    const figure = page.locator(`svg[role="img"][aria-label="${label}"]`);

    await page.getByRole('button', { name: /All exercises/i }).first().click().catch(() => {});
    const row = page.getByRole('button', { name: new RegExp(testCase.name, 'i') }).first();
    let visible = true;
    try {
      await row.waitFor({ state: 'visible', timeout: 20000 });
    } catch {
      visible = false;
    }
    if (!visible) {
      check(`${testCase.name}: list row present`, false, 'row not found');
      continue;
    }
    await row.click();

    let appeared = true;
    try {
      await figure.waitFor({ state: 'visible', timeout: 20000 });
    } catch {
      appeared = false;
    }
    const title = appeared ? await figure.locator('title').textContent() : '';
    check(
      `${testCase.name}: labelled <svg role="img"> figure present`,
      appeared && title.trim() === label,
      appeared ? JSON.stringify(title.trim()) : 'figure missing',
    );
    if (!appeared) continue;

    const caption = await page
      .locator('.mbx-figure .mbx-figure-caption')
      .first()
      .innerText()
      .catch(() => '');
    check(
      `${testCase.name}: caption names the schematic and the cue`,
      /schematic/i.test(caption) && caption.length > 40,
      JSON.stringify(caption.replace(/\s+/g, ' ').slice(0, 90)),
    );

    const pauseButton = page.locator('.mbx-figure .mbx-figure-play').first();
    check(
      `${testCase.name}: play/pause control available`,
      (await pauseButton.count()) > 0,
      (await pauseButton.count()) ? 'present' : 'missing',
    );

    const before = await limbGeometry(page, label);
    await page.waitForTimeout(FRAME_GAP_MS);
    const after = await limbGeometry(page, label);
    const moved = geometryMoved(before, after);
    check(
      `${testCase.name}: skeleton joint coordinates move over ${FRAME_GAP_MS} ms`,
      moved > 1,
      `${moved.toFixed(1)} px of largest joint displacement`,
    );

    // Pixel proof. Pausing pins the figure to its end pose, so comparing that
    // frame with frames captured while playing (start→end interpolation) is
    // deterministic instead of depending on where in the loop the sampling
    // lands. Two playing frames ~600 ms apart must also differ.
    await pauseButton.click();
    await page.waitForFunction(
      (book) => {
        const node = document.querySelector(`svg[aria-label="${book}"]`);
        const button = document.querySelector('.mbx-figure .mbx-figure-play');
        return Boolean(node) && Boolean(button) && button.textContent.trim() === 'Play';
      },
      label,
      { timeout: 20000 },
    );
    await settleFrame(page);
    const paused = decodePng(await shoot(page, figure));

    await pauseButton.click();
    await page.waitForTimeout(FRAME_GAP_MS);
    await settleFrame(page);
    const moving = decodePng(await shoot(page, figure));
    await page.waitForTimeout(FRAME_GAP_MS);
    await settleFrame(page);
    const movingLater = decodePng(await shoot(page, figure));

    const pausedDelta = changedFraction(paused, moving);
    const movingDelta = changedFraction(moving, movingLater);
    check(
      `${testCase.name}: paused end pose differs from the animated frame (> ${(
        MIN_CHANGED_FRACTION * 100
      ).toFixed(1)} % of pixels)`,
      pausedDelta > MIN_CHANGED_FRACTION,
      `${(pausedDelta * 100).toFixed(2)} % of ${paused.width}x${paused.height} pixels changed`,
    );
    check(
      `${testCase.name}: two playing frames ${FRAME_GAP_MS} ms apart differ`,
      movingDelta > MIN_CHANGED_FRACTION,
      `${(movingDelta * 100).toFixed(2)} % of pixels changed`,
    );

    if (SHOTS_DIR) {
      writeFileSync(
        path.join(SHOTS_DIR, `${testCase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`),
        await shoot(page, figure),
      );
    }
  }

  /* ------------------------ reduced-motion behaviour ---------------------- */

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.route('**/*.glb', (route) => route.abort());
  reducedPage.on('pageerror', (err) => pageErrors.push(err?.stack || String(err)));
  await reducedPage.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  await reducedPage.waitForSelector('canvas', { timeout: CANVAS_TIMEOUT_MS });
  await reducedPage.waitForTimeout(1200);
  await reducedPage.getByRole('tab', { name: 'Exercises' }).click();
  const squatRow = reducedPage
    .getByRole('button', { name: /Barbell Back Squat/i })
    .first();
  await squatRow.waitFor({ state: 'visible', timeout: 20000 });
  await squatRow.click();

  const reducedFigure = reducedPage.locator(
    'svg[role="img"][aria-label="Schematic demonstration of Barbell Back Squat"]',
  );
  let reducedVisible = true;
  try {
    await reducedFigure.waitFor({ state: 'visible', timeout: 20000 });
  } catch {
    reducedVisible = false;
  }
  check(
    'reduced motion: figure still renders',
    reducedVisible,
    reducedVisible ? 'present' : 'missing',
  );

  if (reducedVisible) {
    const noteText = await reducedPage
      .locator('.mbx-figure .mbx-figure-note')
      .first()
      .innerText()
      .catch(() => '');
    check(
      'reduced motion: static note replaces the play button',
      /static/i.test(noteText),
      JSON.stringify(noteText.trim()),
    );
    const frames = [decodePng(await shoot(reducedPage, reducedFigure))];
    await reducedPage.waitForTimeout(FRAME_GAP_MS);
    frames.push(decodePng(await shoot(reducedPage, reducedFigure)));
    const fraction = maxPairDelta(frames);
    check(
      'reduced motion: figure does not animate',
      fraction === 0,
      `${(fraction * 100).toFixed(3)} % of pixels changed`,
    );
  }
  await reducedContext.close();

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
  console.error(`e2e-figure: harness failure — ${err?.stack || err}`);
  if (browser) await browser.close().catch(() => {});
  if (server) server.stop();
  process.exit(2);
} finally {
  if (browser) await browser.close().catch(() => {});
}

if (server) server.stop();

const failures = results.filter((entry) => !entry.ok);
console.log(`\ne2e-figure: ${results.length - failures.length}/${results.length} assertions passed`);
if (failures.length) {
  console.error(`e2e-figure: FAILED — ${failures.map((entry) => entry.name).join('; ')}`);
  process.exit(1);
}
console.log('e2e-figure: OK');
process.exit(0);
