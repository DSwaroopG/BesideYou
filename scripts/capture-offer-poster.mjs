// Regenerates public/offer/poster.webp from the real 3D flight scene, so the poster that
// no-JS, reduced-motion and no-WebGL visitors see never drifts from the animation.
//
// Usage (server must be running the current build):
//   npm run build && npm start            # in one terminal
//   node scripts/capture-offer-poster.mjs # in another
//   npm run build                         # again: posters are statically imported (hashed URLs)
// Options (env): QA_URL (default http://localhost:3000), CHROME_PATH (default macOS Chrome),
//                POSTER_PROGRESS (scroll progress to render, default 0.95 = final wide shot).
// Never submits a form.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_URL || 'http://localhost:3000';
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROGRESS = Number(process.env.POSTER_PROGRESS || 0.95);
const OUT = new URL('../public/offer/poster.webp', import.meta.url).pathname;

const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  // bypassCSP: Playwright polls with eval, which the site's CSP (rightly) blocks for real visitors.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  await page.goto(BASE + '/why-besideyou?capture', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('.of-track')?.scrollIntoView());
  await page.waitForFunction(() => window.__offerScene, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const dataUrl = await page.evaluate(p => window.__offerScene.snapshot(p, 1600, 900), PROGRESS);
  mkdirSync(new URL('../public/offer/', import.meta.url).pathname, { recursive: true });
  const info = await sharp(Buffer.from(dataUrl.split(',')[1], 'base64')).webp({ quality: 82 }).toFile(OUT);
  console.log(`Wrote ${OUT} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB) at progress ${PROGRESS}`);
} finally {
  await browser.close();
}
