// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assemble the website for GitHub Pages in `out_chabad/site/`:
 * one static page per language (`/`, `/ru/`, `/he/`, see src/seo.ts), the print files and
 * archive, licences, the social preview image, `sitemap.xml` and the Google site
 * verification file (`google*.html` from the repository root).
 *
 * Usage: `node src/site.ts [out_dir]` (after the site build and src/tools/poster.ts)
 *
 * @module
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { en, he, ru } from '../web/src/dict.ts';
import { OG_FILE, OUT_DIR, PRINT_ZIP, ROOT, STANDALONE_FILE, TOUCH_ICON_FILE } from './paths.ts';
import { PAGES, forSubdirectory, localizeHtml, sitemapXml, withSeoHead } from './seo.ts';
import type { Dict } from './seo.ts';

const DICTS: Record<string, Dict> = { en, ru, he };
/** Repository files published next to the pages. */
const REPO_FILES = ['LICENSE', 'LICENSE-MODELS.md', 'NOTICE'];

const pagePath = (p: { path: string }): string => `/${p.path}`;
const isStl = (name: string): boolean => /^chabad_.+\.stl$/.test(name);
const isGoogleVerification = (name: string): boolean => /^google[0-9a-f]+\.html$/.test(name);

function main(outDir: string): void {
  const site = join(outDir, 'site');
  rmSync(site, { recursive: true, force: true });
  mkdirSync(site, { recursive: true });

  const base = readFileSync(join(outDir, STANDALONE_FILE), 'utf8');
  for (const page of PAGES) {
    const dict = DICTS[page.code];
    let html = withSeoHead(localizeHtml(base, page, dict), page, dict);
    if (page.path) html = forSubdirectory(html);
    const dir = join(site, page.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }

  const outFiles = readdirSync(outDir).filter(isStl);
  const optional = new Set([OG_FILE, TOUCH_ICON_FILE]); // need Chrome at build time
  for (const f of [...outFiles, PRINT_ZIP, OG_FILE, TOUCH_ICON_FILE]) {
    if (existsSync(join(outDir, f))) copyFileSync(join(outDir, f), join(site, f));
    else if (!optional.has(f)) throw new Error(`site: missing ${f} — run the build first`);
  }
  for (const f of [...REPO_FILES, ...readdirSync(ROOT).filter(isGoogleVerification)]) {
    copyFileSync(join(ROOT, f), join(site, f));
  }
  writeFileSync(join(site, 'sitemap.xml'), sitemapXml());
  writeFileSync(join(site, '.nojekyll'), '');
  console.log(`${site}: ${PAGES.map(pagePath).join(' ')} + ${outFiles.length} STL, sitemap`);
}

main(process.argv[2] ?? OUT_DIR);
