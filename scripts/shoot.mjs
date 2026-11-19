// Screenshot runner for the Leonida Trophy Guide. Serves app/ on
// localhost:8080 (node serve.ts), opens each shot's view in headless
// Chromium at 1280x800, seeds a small demo checklist in localStorage so the
// progress ring and earned states render, and saves JPEGs to screenshots/.
// Run: node scripts/shoot.mjs   (from the repository root)
import { chromium } from '/tmp/shoot/node_modules/playwright-core/index.mjs';
import { existsSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const base = 'http://localhost:8080';

// Demo progress: a few early trophies earned, so the ring, the per-grade
// counts and the revealed-vs-masked story rows all render honestly.
const SEED_EARNED = [2, 3, 8, 14, 15, 16, 17, 18, 19, 21, 35];

const SHOTS = [
  { file: '1-cover.jpg', url: '/?select=28', note: 'checklist + Positive Mental Attitude guide open' },
  { file: '2-roadmap.jpg', url: '/?view=roadmap', note: 'roadmap to the platinum' },
  { file: '3-spoiler-filters.jpg', url: '/?kind=missable&select=28', note: 'Missable filter active (1 result)' },
  { file: '4-guide-detail.jpg', url: '/?select=14', scroll: 220, note: 'A Long Road guide + export/import' },
];

function findChromium() {
  const cache = join(process.env.HOME, '.cache', 'ms-playwright');
  for (const dir of readdirSync(cache)) {
    if (!dir.startsWith('chromium-')) continue;
    const exe = join(cache, dir, 'chrome-linux64', 'chrome');
    if (existsSync(exe)) return exe;
    const exeAlt = join(cache, dir, 'chrome-linux', 'chrome');
    if (existsSync(exeAlt)) return exeAlt;
  }
  throw new Error('no cached Chromium found under ~/.cache/ms-playwright');
}

function waitForServer(url, tries = 20) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      fetch(url).then(() => resolve()).catch(() => {
        if (left <= 0) reject(new Error('server did not come up'));
        else setTimeout(() => attempt(left - 1), 250);
      });
    };
    attempt(tries);
  });
}

const server = spawn('node', ['serve.ts', '--port', '8080'], { cwd: repo, stdio: 'ignore' });
try {
  await waitForServer(base + '/');
  const browser = await chromium.launch({ executablePath: findChromium(), args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (error) => console.error('page error:', error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('favicon')) console.error('console error:', message.text());
  });
  const seed = JSON.stringify({ v: 1, earned: Object.fromEntries(SEED_EARNED.map((id) => [id, true])), spoiler: true });
  await page.addInitScript((seedJson) => {
    localStorage.setItem('gta6-trophy-guide-v1', seedJson);
  }, seed);
  for (const shot of SHOTS) {
    await page.goto(base + shot.url, { waitUntil: 'networkidle' });
    const waitSelector = shot.url.includes('view=roadmap') ? '.roadmap-intro' : '.trophy-card';
    await page.waitForSelector(waitSelector, { timeout: 10000, state: 'visible' });
    await page.waitForTimeout(400);
    if (shot.scroll) {
      // The detail panel is sticky, so scrolling brings its full guide and
      // sources into view while the checklist keeps scrolling beside it.
      await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
      await page.waitForTimeout(300);
    }
    const outPath = join(repo, 'screenshots', shot.file);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 80 });
    console.log(`shot ${shot.file} — ${shot.note}`);
  }
  await browser.close();
} finally {
  server.kill();
}
console.log('done');
