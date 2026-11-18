#!/usr/bin/env node
/**
 * Headless smoke test for the static export in out/.
 *
 * Usage:
 *   node scripts/ci-smoke.mjs http://127.0.0.1:4173/muscleBurn/
 *
 * Requires Playwright to be resolvable (the CI workflow installs it outside the
 * repo and exposes it through NODE_PATH; a local `npm i playwright` also works).
 * Exits 0 when every assertion passes, 1 on an assertion failure, 2 when the
 * harness itself cannot start (bad args, Playwright missing).
 */

import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const NAV_TIMEOUT_MS = Number(process.env.CI_SMOKE_TIMEOUT_MS || 60000);
const CANVAS_TIMEOUT_MS = Number(process.env.CI_SMOKE_CANVAS_TIMEOUT_MS || 60000);
const SETTLE_MS = Number(process.env.CI_SMOKE_SETTLE_MS || 3000);

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('ci-smoke: missing base URL\nusage: node scripts/ci-smoke.mjs http://127.0.0.1:4173/muscleBurn/');
  process.exit(2);
}

function loadPlaywright() {
  const attempts = [
    ['playwright', () => require('playwright')],
    ['./node_modules/playwright', () => require(path.join(process.cwd(), 'node_modules', 'playwright'))],
  ];
  for (const [label, load] of attempts) {
    try {
      return load();
    } catch {
      // try the next resolution strategy
    }
  }
  console.error(
    'ci-smoke: cannot resolve the "playwright" package.\n' +
      'Install it outside the repo, e.g.\n' +
      '  npm install --no-save --prefix /tmp/pw playwright@1.49.0\n' +
      '  /tmp/pw/node_modules/.bin/playwright install chromium\n' +
      'then run with NODE_PATH=/tmp/pw/node_modules node scripts/ci-smoke.mjs <url>',
  );
  process.exit(2);
}

const { chromium } = loadPlaywright();

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

// Console noise that is unrelated to the app working correctly.
const IGNORED_CONSOLE = [
  /favicon/i,
  /Download the React DevTools/i,
];

function isIgnored(text) {
  return IGNORED_CONSOLE.some((re) => re.test(text));
}

const consoleErrors = [];
const pageErrors = [];

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    // Software WebGL so the three.js canvas can initialise on a headless runner.
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!isIgnored(text)) consoleErrors.push(text);
  });
  page.on('pageerror', (err) => pageErrors.push(err?.stack || String(err)));

  console.log(`ci-smoke: loading ${baseUrl}`);

  const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  check('response received', Boolean(response), response ? response.url() : 'no response');
  check('HTTP 200', response?.status() === 200, `status ${response?.status() ?? 'n/a'}`);

  const title = await page.title();
  check('title contains "muscleBurn"', /muscleburn/i.test(title), JSON.stringify(title));

  // The 3D viewer is client-rendered, so wait for R3F to mount its canvas.
  let canvasAppeared = true;
  try {
    await page.waitForSelector('canvas', { timeout: CANVAS_TIMEOUT_MS });
  } catch {
    canvasAppeared = false;
  }
  const canvasInfo = await page.evaluate(() =>
    Array.from(document.querySelectorAll('canvas')).map((c) => ({
      width: c.width,
      height: c.height,
      clientWidth: c.clientWidth,
      clientHeight: c.clientHeight,
    })),
  );
  check('at least one <canvas> exists', canvasAppeared && canvasInfo.length > 0, `${canvasInfo.length} canvas element(s)`);
  check(
    'canvas is rendered (non-zero size)',
    canvasInfo.length > 0 && canvasInfo.every((c) => c.width > 0 && c.height > 0 && c.clientWidth > 0),
    canvasInfo.length ? JSON.stringify(canvasInfo) : 'no canvas',
  );

  // Let late-running client work (model fetch/decode, React effects) settle.
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
    console.log('note: networkidle not reached within 30s; continuing with collected errors');
  });
  await page.waitForTimeout(SETTLE_MS);

  check(
    'no uncaught page errors',
    pageErrors.length === 0,
    pageErrors.length ? `${pageErrors.length} error(s)` : 'none',
  );
  check(
    'no page console errors',
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
  console.error(`ci-smoke: harness failure — ${err?.stack || err}`);
  if (browser) await browser.close().catch(() => {});
  process.exit(2);
} finally {
  if (browser) await browser.close().catch(() => {});
}

const failures = results.filter((r) => !r.ok);
console.log(`\nci-smoke: ${results.length - failures.length}/${results.length} assertions passed`);
if (failures.length) {
  console.error(`ci-smoke: FAILED — ${failures.map((f) => f.name).join('; ')}`);
  process.exit(1);
}
console.log('ci-smoke: OK');
process.exit(0);
