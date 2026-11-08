// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Multi-language root documents (README in English, Russian and Hebrew) assembled by
 * `@ktav-lang/polydoc` from the unit sources in `root-docs/`.
 *
 * - `node src/tools/docs.ts` — regenerate README.md, README.ru.md, README.he.md
 * - `node src/tools/docs.ts --check` — fail if a generated file is stale or hand-edited,
 *   or if a translation drifted structurally (missing bullets, unaligned parts, unwrapped lines)
 *
 * Edit the sources in `root-docs/<DOC>/<unit>/body-N.md`, never the generated files.
 *
 * @module
 */
import {
  buildRootDocs,
  checkRootDocs,
  checkSources,
  configure,
  readUnits,
  rootDocUnitsDir,
  writeRootDocs,
} from '@ktav-lang/polydoc';
import { ROOT } from '../paths.ts';

/** English first: it is the reference language of the structural checks. */
export const DOC_LANGS = ['en', 'ru', 'he'];
export const ROOT_DOCUMENTS = ['README', 'PRINT-SHOP'];

function main(check: boolean): boolean {
  configure({ langs: DOC_LANGS, rootDocuments: ROOT_DOCUMENTS });
  const docs = buildRootDocs(ROOT);
  const problems = ROOT_DOCUMENTS.flatMap(
    (doc) => checkSources(readUnits(rootDocUnitsDir(ROOT, doc))).problems,
  );
  if (check) problems.push(...checkRootDocs(ROOT, docs));
  else writeRootDocs(ROOT, docs);
  for (const p of problems) console.error(`docs: ${p}`);
  if (problems.length === 0) {
    console.log(
      `docs: ${check ? 'up to date' : 'written'} — ${ROOT_DOCUMENTS.join(', ')} × ${DOC_LANGS.join('/')}`,
    );
  }
  return problems.length === 0;
}

process.exit(main(process.argv.includes('--check')) ? 0 : 1);
