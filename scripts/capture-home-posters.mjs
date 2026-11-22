// Regenerates public/who/home-<id>.webp (one homepage poster per person) from the live line-up, so the
// posters that no-JS, reduced-motion and no-WebGL visitors see never drift from the animation.
//
// Usage (server must be running the current build):
//   npm run build && npm start            # in one terminal
//   node scripts/capture-home-posters.mjs  # in another
//   npm run build                         # again: posters are statically imported (hashed URLs)
// Options (env): QA_URL (default http://localhost:3000), CHROME_PATH (default macOS Chrome).
// Never submits a form.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_URL || 'http://localhost:3000';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const IDS = ['ai-and-data', 'software-studios', 'managed-it', 'b2b-service'];
const DIR = new URL('../public/who/', import.meta.url).pathname;

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  // bypassCSP: Playwright polls with eval, which the site's CSP (rightly) blocks for real visitors.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  await page.goto(BASE + '/?capture', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector(".hm-lineup")?.scrollIntoView());
  await page.waitForFunction(() => window.__lineupScene, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  mkdirSync(DIR, { recursive: true });
  for (const [k, id] of IDS.entries()) {
    const dataUrl = await page.evaluate(k => window.__lineupScene.snapshot(k, 640, 720), k);
    const info = await sharp(Buffer.from(dataUrl.split(',')[1], 'base64')).webp({ quality: 82 }).toFile(`${DIR}home-${id}.webp`);
    console.log(`Wrote public/who/home-${id}.webp (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
  }
} finally {
  await browser.close();
}
