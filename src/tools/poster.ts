// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Capture the loading poster: open the built page in headless Chrome with `?poster`
 * (only the model, transparent background, same camera framing as the viewer card) and
 * save a screenshot. src/standalone.ts embeds it, so visitors see exactly the first frame
 * of the 3D view while the model loads.
 *
 * Chrome is looked up in `CHROME_PATH`, then in the usual install locations. Without
 * Chrome the poster is skipped (the page works without it) and the step does not fail.
 *
 * Usage: `node src/tools/poster.ts [out_dir]` (after src/standalone.ts)
 *
 * @module
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { OUT_DIR, POSTER_FILE, STANDALONE_FILE } from '../paths.ts';

/** Viewer card aspect (600 × 520) at 1.6× for a crisp image. */
const WIDTH = 960;
const HEIGHT = 832;
/** Generous time for decoding the scene in software WebGL. */
const VIRTUAL_TIME_MS = 60000;

const CANDIDATES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function runs(cmd: string): boolean {
  try {
    execFileSync(cmd, ['--version'], { stdio: 'ignore', timeout: 20000 });
    return true;
  } catch {
    return false;
  }
}

const findChrome = (): string | undefined =>
  [process.env.CHROME_PATH, ...CANDIDATES].find((c): c is string => !!c && runs(c));

function main(outDir: string): void {
  const poster = join(outDir, POSTER_FILE);
  rmSync(poster, { force: true });
  const chrome = findChrome();
  if (!chrome) {
    console.warn('poster: Chrome not found (set CHROME_PATH) — the site will load without a poster');
    return;
  }
  const profile = join(outDir, '.chrome-profile');
  mkdirSync(profile, { recursive: true });
  const url = `${pathToFileURL(join(outDir, STANDALONE_FILE)).href}?poster`;
  try {
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--no-first-run',
        '--hide-scrollbars',
        ...(process.env.CI ? ['--no-sandbox'] : []),
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--default-background-color=00000000',
        `--user-data-dir=${profile}`,
        `--window-size=${WIDTH},${HEIGHT}`,
        `--virtual-time-budget=${VIRTUAL_TIME_MS}`,
        `--screenshot=${poster}`,
        url,
      ],
      { stdio: 'ignore', timeout: 180000 },
    );
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  if (!existsSync(poster)) throw new Error('poster: Chrome produced no screenshot');
  console.log(`${poster}: captured with ${chrome}`);
}

main(process.argv[2] ?? OUT_DIR);
