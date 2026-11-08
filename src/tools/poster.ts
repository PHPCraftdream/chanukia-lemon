// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Capture images of the model from the built page in headless Chrome:
 * - the loading poster (`?poster`: only the model, transparent background, same framing
 *   as the viewer card) — src/standalone.ts embeds it, so visitors see exactly the first
 *   frame of the 3D view while the model loads;
 * - the social preview image (`?og`: the model on the page background, 1200 × 630);
 * - the site icon (`?icon`: straight from the front, transparent) and the home-screen icon.
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
import { ICON_FILE, OG_FILE, OUT_DIR, POSTER_FILE, STANDALONE_FILE, TOUCH_ICON_FILE } from '../paths.ts';
import { OG_HEIGHT, OG_WIDTH } from '../seo.ts';

/** Viewer card aspect (600 × 520) at 1.6× for a crisp image. */
const WIDTH = 960;
const HEIGHT = 832;
/** Square icon captures, px. */
const ICON_SIZE = 512;
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

interface Capture {
  /** Output file name inside the build output. */
  file: string;
  /** Query string for the page (see web/src/main.ts). */
  query: string;
  width: number;
  height: number;
  transparent: boolean;
}

const CAPTURES: readonly Capture[] = [
  { file: POSTER_FILE, query: 'poster', width: WIDTH, height: HEIGHT, transparent: true },
  { file: OG_FILE, query: 'og&theme=light', width: OG_WIDTH, height: OG_HEIGHT, transparent: false },
  // icons are captured at 512 px: headless Chrome keeps windows at least ~500 px wide,
  // and browsers scale icons down themselves
  { file: ICON_FILE, query: 'icon', width: ICON_SIZE, height: ICON_SIZE, transparent: true },
  {
    file: TOUCH_ICON_FILE,
    query: 'icon=bg&theme=dark',
    width: ICON_SIZE,
    height: ICON_SIZE,
    transparent: false,
  },
];

/** Screenshot the built page in one capture mode. */
function capture(chrome: string, outDir: string, c: Capture): void {
  const target = join(outDir, c.file);
  rmSync(target, { force: true });
  const profile = join(outDir, '.chrome-profile');
  mkdirSync(profile, { recursive: true });
  const url = `${pathToFileURL(join(outDir, STANDALONE_FILE)).href}?${c.query}`;
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
        ...(c.transparent ? ['--default-background-color=00000000'] : []),
        `--user-data-dir=${profile}`,
        `--window-size=${c.width},${c.height}`,
        `--virtual-time-budget=${VIRTUAL_TIME_MS}`,
        `--screenshot=${target}`,
        url,
      ],
      { stdio: 'ignore', timeout: 180000 },
    );
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  if (!existsSync(target)) throw new Error(`poster: Chrome produced no ${c.file}`);
  console.log(`${target}: captured with ${chrome}`);
}

function main(outDir: string): void {
  const chrome = findChrome();
  if (!chrome) {
    for (const c of CAPTURES) rmSync(join(outDir, c.file), { force: true });
    console.warn('poster: Chrome not found (set CHROME_PATH) — no loading poster and no preview image');
    return;
  }
  for (const c of CAPTURES) capture(chrome, outDir, c);
}

main(process.argv[2] ?? OUT_DIR);
