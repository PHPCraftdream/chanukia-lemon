// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Compare two folders of STL files: volume and bounding box per file.
 * Exits with code 1 if any file is missing or differs beyond the tolerances.
 *
 * Usage: `node src/tools/compare-stl.ts <reference_dir> <candidate_dir>`
 *
 * @module
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readStl, stats } from '../stl.ts';

/** Relative volume tolerance. */
const VOL_TOL = 1e-4;
/** Bounding box tolerance, mm. */
const BOX_TOL = 0.01;

const isStl = (name: string): boolean => name.endsWith('.stl');
const maxAbsDiff = (a: readonly number[], b: readonly number[]): number =>
  Math.max(...a.map((v, k) => Math.abs(v - b[k])));

function compare(refDir: string, candDir: string): boolean {
  let ok = true;
  for (const file of readdirSync(refDir).filter(isStl).sort()) {
    const ref = stats(readStl(join(refDir, file)));
    let cand;
    try {
      cand = stats(readStl(join(candDir, file)));
    } catch {
      console.log(`MISSING ${file}`);
      ok = false;
      continue;
    }
    const dv = (cand.volume - ref.volume) / ref.volume;
    const db = Math.max(maxAbsDiff(ref.min, cand.min), maxAbsDiff(ref.max, cand.max));
    const same = Math.abs(dv) <= VOL_TOL && db <= BOX_TOL;
    ok &&= same;
    console.log(
      `${same ? 'same' : 'DIFF'} ${file.padEnd(30)} vol ${(ref.volume / 1000).toFixed(2)} -> ` +
        `${(cand.volume / 1000).toFixed(2)} cm3 (${(dv * 100).toFixed(4)}%), bbox max diff ${db.toFixed(3)} mm`,
    );
  }
  return ok;
}

const [refDir, candDir] = process.argv.slice(2);
if (!refDir || !candDir) {
  console.error('usage: node src/tools/compare-stl.ts <reference_dir> <candidate_dir>');
  process.exit(2);
}
process.exit(compare(refDir, candDir) ? 0 : 1);
