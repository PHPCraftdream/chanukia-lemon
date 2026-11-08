// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assemble the self-contained viewer page: the HTML template + the rspack bundle +
 * the scene package (base64), all inline, so the file opens from disk without a server.
 *
 * Usage: `node src/standalone.ts [out_dir]` (after `node src/build.ts` and `rspack build`)
 *
 * @module
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OUT_DIR, ROOT, SCENE_FILE, STANDALONE_FILE, VIEWER_DIST } from './paths.ts';
import { DATA_ELEMENT_ID } from './scene-pack.ts';

/** Keep `</script` inside inlined code from closing the tag early. */
const escapeScript = (code: string): string => code.replaceAll('</script', '<\\/script');

function main(outDir: string): void {
  const template = readFileSync(join(ROOT, 'viewer', 'index.html'), 'utf8');
  const bundle = readFileSync(join(VIEWER_DIST, 'main.js'), 'utf8');
  const scene = readFileSync(join(outDir, SCENE_FILE)).toString('base64');
  const inline =
    `<script id="${DATA_ELEMENT_ID}" type="application/octet-stream">${scene}</script>\n` +
    `<script>${escapeScript(bundle)}</script>\n`;
  if (!template.includes('</body>')) throw new Error('template has no </body>');
  const page = template.replace('</body>', `${inline}</body>`);
  const path = join(outDir, STANDALONE_FILE);
  writeFileSync(path, page);
  console.log(`${path}: ${(page.length / 1e6).toFixed(1)} MB (open directly in a browser)`);
}

main(process.argv[2] ?? OUT_DIR);
