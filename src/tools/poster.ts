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
 * Without Chrome (see src/tools/chrome.ts) the images are skipped (the page works without
 * them) and the step does not fail.
 *
 * Usage: `node src/tools/poster.ts [out_dir]` (after src/standalone.ts)
 *
 * @module
 */
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { ICON_FILE, OG_FILE, OUT_DIR, POSTER_FILE, STANDALONE_FILE, TOUCH_ICON_FILE } from '../paths.ts';
import { OG_HEIGHT, OG_WIDTH } from '../seo.ts';
import { findChrome, screenshot } from './chrome.ts';
import type { Shot } from './chrome.ts';

/** Viewer card aspect (600 × 520) at 1.6× for a crisp image. */
const WIDTH = 960;
const HEIGHT = 832;
/** Square icon captures, px. */
const ICON_SIZE = 512;

interface Capture extends Shot {
  /** Output file name inside the build output. */
  file: string;
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

function main(outDir: string): void {
  const chrome = findChrome();
  if (!chrome) {
    for (const c of CAPTURES) rmSync(join(outDir, c.file), { force: true });
    console.warn('poster: Chrome not found (set CHROME_PATH) — no loading poster and no preview image');
    return;
  }
  const page = join(outDir, STANDALONE_FILE);
  for (const c of CAPTURES) screenshot(chrome, page, join(outDir, c.file), c);
}

main(process.argv[2] ?? OUT_DIR);
