// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Project paths used by the Node scripts.
 *
 * @module
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Project root. */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Default build output. */
export const OUT_DIR = join(ROOT, 'out_chabad');
/** Packed scene for the viewer (gzip), inside the build output. */
export const SCENE_FILE = 'viewer-data.bin';
/** Self-contained viewer page, inside the build output. */
export const STANDALONE_FILE = 'hanukia.html';
/** rspack output of the site. */
export const WEB_DIST = join(ROOT, 'web', 'dist');
/** Archive for the print shop (STL + instructions + licence), inside the build output. */
export const PRINT_ZIP = 'chanukia-lemon-print-files.zip';
/** Screenshot of the model shown while the site loads it, inside the build output. */
export const POSTER_FILE = 'poster.png';
/** Site icon (front view, transparent) and home-screen icon, inside the build output. */
export const ICON_FILE = 'icon.png';
export const TOUCH_ICON_FILE = 'apple-touch-icon.png';
/** Social preview image (Open Graph), inside the build output. */
export const OG_FILE = 'og-image.png';
