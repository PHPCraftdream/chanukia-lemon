// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Every print-shop part: valid closed solid, sensible volume, rests on the bed,
 * fits a 256 × 256 × 250 mm printer (long thin parts may lie diagonally).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PRINT_PARTS } from '../src/assembly.ts';
import { meshOf, stats } from '../src/stl.ts';

/** Printer build volume the parts must fit (mm). */
const BED = { xy: 256, z: 250 };
/** Smallest plausible part volume (mm³) — catches empty booleans. */
const MIN_VOLUME = 2000;
/** The fit-test coupon must stay small (material). */
const MAX_FIT_TEST_VOLUME = 8000;

describe('print parts', () => {
  it('every copy to print is a copy in the assembly, and the file name says how many', () => {
    for (const p of PRINT_PARTS.filter((q) => q.view.length > 0)) {
      assert.equal(p.view.length, p.qty, p.file);
      const n = /_x(\d+)$/.exec(p.file)?.[1];
      if (n) assert.equal(Number(n), p.qty, p.file);
    }
  });

  it('cover 8 lights + shamash: 20 parts, every branch piece on both sides', () => {
    const copies = PRINT_PARTS.reduce((n, p) => n + p.view.length, 0);
    assert.equal(copies, 20);
    for (const p of PRINT_PARTS.filter((q) => q.file.includes('branch'))) {
      assert.equal(p.view.filter((v) => v.mirror).length * 2, p.view.length, `${p.file}: left = right`);
    }
  });

  for (const part of PRINT_PARTS) {
    it(`${part.file}: closed, non-trivial, on the bed, fits the printer`, () => {
      const world = part.world();
      assert.equal(world.status(), 'NoError');
      const printed = part.print(world);
      const s = stats(meshOf(printed));
      assert.equal(s.watertight, true, 'mesh must be watertight');
      assert.ok(s.volume > MIN_VOLUME, `volume ${s.volume.toFixed(0)} mm3 too small`);
      // every separate body in the file must rest on the bed, not float above it
      for (const body of printed.decompose()) {
        const z0 = body.boundingBox().min[2];
        assert.ok(Math.abs(z0) < 1e-3, `a body starts at z = ${z0}, not on the bed`);
      }
      const [x, y, z] = s.size;
      const flat = Math.max(x, y) <= BED.xy || (x + y) / Math.SQRT2 <= BED.xy;
      assert.ok(flat && z <= BED.z, `size ${s.size.map((v) => v.toFixed(1)).join('×')} exceeds the bed`);
    });
  }

  it('the fit-test coupon uses little material', () => {
    const coupon = PRINT_PARTS.find((p) => p.file === 'chabad_fit_test');
    assert.ok(coupon);
    const v = coupon.world().volume();
    assert.ok(v < MAX_FIT_TEST_VOLUME, `fit test is ${(v / 1000).toFixed(1)} cm3`);
  });
});
