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
/** rspack output of the viewer bundle. */
export const VIEWER_DIST = join(ROOT, 'viewer', 'dist');
