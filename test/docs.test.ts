// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Hand-written docs and site texts agree with the model: the file tables list exactly the
 * print files with their quantities, and the part count is the number of printed copies.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { PRINT_PARTS } from '../src/assembly.ts';

/** Doc sources (`root-docs`, one block per language) with a table of print files. */
const TABLES = ['root-docs/README/print-files/body-1.md', 'root-docs/PRINT-SHOP/parts/body-1.md'];
/** Texts that state the part count. */
const COUNTS = ['root-docs/PRINT-SHOP/intro/body-1.md', 'web/src/dict.ts', 'web/index.html'];
const LANGS = ['en', 'ru', 'he'];

const read = (path: string): string => readFileSync(path, 'utf8');
/** Language blocks of a polydoc source. */
const blocks = (src: string): Record<string, string> =>
  Object.fromEntries(
    src
      .split(/^>>>>> lang=/m)
      .slice(1)
      .map((b) => [b.slice(0, b.indexOf('\n')).trim(), b]),
  );
/** `file.stl qty` of every table row. */
const tableRows = (md: string): string[] =>
  [...md.matchAll(/^\|\s*`(chabad_\w+\.stl)`\s*\|\s*(\d+)\s*\|/gm)].map((m) => `${m[1]} ${m[2]}`).sort();

const EXPECTED_ROWS = PRINT_PARTS.map((p) => `${p.file}.stl ${p.qty}`).sort();
/** Copies in the assembly (the fit test is not one of them). */
const COPIES = PRINT_PARTS.reduce((n, p) => n + p.view.length, 0);

describe('docs', () => {
  for (const path of TABLES) {
    it(`${path}: every language lists exactly the print files and quantities`, () => {
      const byLang = blocks(read(path));
      assert.deepEqual(Object.keys(byLang).sort(), [...LANGS].sort());
      for (const lang of LANGS) assert.deepEqual(tableRows(byLang[lang]), EXPECTED_ROWS, `${path} [${lang}]`);
    });
  }

  it('the part count in the texts is the number of printed copies', () => {
    for (const path of COUNTS) {
      const found = [...read(path).matchAll(/(\d+) (?:parts|деталей|חלקים)/g)].map((m) => Number(m[1]));
      assert.ok(found.length > 0, `${path}: no part count found`);
      for (const n of found) assert.equal(n, COPIES, `${path} says ${n} parts`);
    }
  });
});
