// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Capture the README header image: the whole hanukkiah straight from the front on a
 * transparent background, saved into the repository (`docs/hanukia-front.png`).
 *
 * Usage: `node src/tools/readme-image.ts [out_dir]` (after `npm run build`; needs Chrome)
 *
 * @module
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { OUT_DIR, README_IMAGE, ROOT, STANDALONE_FILE } from '../paths.ts';
import { findChrome, screenshot } from './chrome.ts';

/** Wide enough for the branches, tall enough for the shamash. */
const SHOT = { query: 'icon', width: 1600, height: 1300, transparent: true };

function main(outDir: string): void {
  const chrome = findChrome();
  if (!chrome) throw new Error('readme-image: Chrome not found (set CHROME_PATH)');
  const target = join(ROOT, README_IMAGE);
  mkdirSync(join(target, '..'), { recursive: true });
  screenshot(chrome, join(outDir, STANDALONE_FILE), target, SHOT);
}

main(process.argv[2] ?? OUT_DIR);
