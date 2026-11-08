// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assemble the self-contained site page: the rspack-built HTML (styles already inline)
 * with its script tag replaced by the inline bundle, plus the scene package (base64) and,
 * if src/tools/poster.ts captured one, the loading poster — so the file opens from disk
 * without a server.
 *
 * Usage: `node src/standalone.ts [out_dir]` (after `node src/build.ts` and `rspack build`)
 *
 * @module
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ICON_FILE, OUT_DIR, POSTER_FILE, SCENE_FILE, STANDALONE_FILE, WEB_DIST } from './paths.ts';
import { DATA_ELEMENT_ID } from './scene-pack.ts';

/** The external bundle reference HtmlRspackPlugin injects. */
const BUNDLE_TAG = /<script\b[^>]*\bsrc="main\.js"[^>]*><\/script>/;

/** The poster placeholder from web/index.html (as minified by the HTML plugin). */
const POSTER_TAG = /<img\b[^>]*\bid="poster"[^>]*>/;

/** The drawn fallback icon from web/index.html, replaced by the rendered one when available. */
const ICON_TAG = /<link\b[^>]*\brel="icon"[^>]*>/;

/** Keep `</script` inside inlined code from closing the tag early. */
const escapeScript = (code: string): string => code.replaceAll('</script', '<\\/script');

function main(outDir: string): void {
  const html = readFileSync(join(WEB_DIST, 'index.html'), 'utf8');
  const bundle = readFileSync(join(WEB_DIST, 'main.js'), 'utf8');
  const scene = readFileSync(join(outDir, SCENE_FILE)).toString('base64');
  if (!BUNDLE_TAG.test(html)) throw new Error('built page has no main.js script tag');
  if (!html.includes('</body>')) throw new Error('built page has no </body>');
  const inline =
    `<script id="${DATA_ELEMENT_ID}" type="application/octet-stream">${scene}</script>\n` +
    `<script>${escapeScript(bundle)}</script>\n`;
  let page = html.replace(BUNDLE_TAG, '').replace('</body>', `${inline}</body>`);
  const posterPath = join(outDir, POSTER_FILE);
  if (existsSync(posterPath)) {
    if (!POSTER_TAG.test(page)) throw new Error('built page has no poster placeholder');
    const png = readFileSync(posterPath).toString('base64');
    page = page.replace(
      POSTER_TAG,
      `<img class="viewer-poster" id="poster" alt="" src="data:image/png;base64,${png}" />`,
    );
  }
  const iconPath = join(outDir, ICON_FILE);
  if (existsSync(iconPath)) {
    const icon = readFileSync(iconPath).toString('base64');
    page = page.replace(ICON_TAG, `<link rel="icon" type="image/png" href="data:image/png;base64,${icon}">`);
  }
  const path = join(outDir, STANDALONE_FILE);
  writeFileSync(path, page);
  console.log(`${path}: ${(page.length / 1e6).toFixed(1)} MB (open directly in a browser)`);
}

main(process.argv[2] ?? OUT_DIR);
