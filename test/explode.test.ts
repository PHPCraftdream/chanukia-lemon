// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/** Staged exploded view: rods slide out first, then everything else moves. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { explodeOffset } from '../web/src/viewer/explode.ts';

const rod = {
  slide: [300, 0, 0] as [number, number, number],
  explode: [0, 0, 1.6] as [number, number, number],
};
const branch = { explode: [Math.SQRT1_2, 0, Math.SQRT1_2] as [number, number, number] };
const length = (v: readonly number[]): number => Math.hypot(...v);

describe('exploded view', () => {
  it('is assembled at 0', () => {
    assert.deepEqual(explodeOffset(rod, 0), [0, 0, 0]);
    assert.deepEqual(explodeOffset(branch, 0), [0, 0, 0]);
  });

  it('moves only the rods until they are fully out', () => {
    for (const s of [0.1, 0.2, 0.3, 0.4])
      assert.equal(length(explodeOffset(branch, s)), 0, `branch moved at ${s}`);
    assert.ok(explodeOffset(rod, 0.2)[0] > 0);
    assert.deepEqual(explodeOffset(rod, 0.4), [300, 0, 0]);
  });

  it('then takes everything apart, rods keep their slide and lift', () => {
    const r = explodeOffset(rod, 1);
    assert.equal(r[0], 300);
    assert.ok(r[2] > 0, 'rods lift above the branches');
    assert.ok(length(explodeOffset(branch, 1)) > 50);
    assert.ok(length(explodeOffset(branch, 0.7)) < length(explodeOffset(branch, 1)));
  });
});
