// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Every print-shop part: valid closed solid, sensible volume, rests on the bed,
 * fits a 300 × 300 × 250 mm printer.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PRINT_PARTS } from '../src/assembly.ts';
import { meshOf, stats } from '../src/stl.ts';

/** Printer build volume the parts must fit (mm). */
const BED = { x: 300, y: 300, z: 250 };
/** Smallest plausible part volume (mm³) — catches empty booleans. */
const MIN_VOLUME = 5000;

describe('print parts', () => {
  it('cover 8 lights + shamash: every branch file is printed twice', () => {
    const branchFiles = PRINT_PARTS.filter((p) => p.file.includes('branch'));
    assert.ok(branchFiles.length >= 4);
    for (const p of branchFiles) assert.equal(p.qty, 2, p.file);
  });

  for (const part of PRINT_PARTS) {
    it(`${part.file}: closed, non-trivial, on the bed, fits the printer`, () => {
      const world = part.world();
      assert.equal(world.status(), 'NoError');
      const s = stats(meshOf(part.print(world)));
      assert.equal(s.watertight, true, 'mesh must be watertight');
      assert.ok(s.volume > MIN_VOLUME, `volume ${s.volume.toFixed(0)} mm3 too small`);
      assert.ok(Math.abs(s.min[2]) < 1e-3, `must rest on z = 0, min z = ${s.min[2]}`);
      const [x, y, z] = s.size;
      assert.ok(
        Math.max(x, y) <= BED.x && Math.min(x, y) <= BED.y && z <= BED.z,
        `size ${s.size.map((v) => v.toFixed(1)).join('×')} exceeds the bed`,
      );
    });
  }
});
