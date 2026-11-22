// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/** Staged exploded view: the rod slides out, the rest comes apart under the rising rod, then the rod halves part. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { explodeOffset } from '../web/src/viewer/explode.ts';

type V3 = [number, number, number];
const rod = {
  slide: [300, 0, 0] as V3,
  explode: [0, 0, 0] as V3,
  path: [
    [0, 0, 200],
    [-300, 0, 200],
  ] as V3[],
  split: [40, 0, 0] as V3,
};
const branch = { explode: [Math.SQRT1_2, 0, Math.SQRT1_2] as V3 };
const length = (v: readonly number[]): number => Math.hypot(...v);
/** Offsets equal up to float noise of the stage boundaries. */
const near = (a: readonly number[], b: readonly number[], msg?: string): void =>
  assert.ok(length(a.map((v, i) => v - b[i])) < 1e-6, `${msg ?? ''} ${a} != ${b}`);

describe('exploded view', () => {
  it('is assembled at 0', () => {
    assert.deepEqual(explodeOffset(rod, 0), [0, 0, 0]);
    assert.deepEqual(explodeOffset(branch, 0), [0, 0, 0]);
  });

  it('first only the rod slides out to the side', () => {
    for (const s of [0.1, 0.2, 0.3])
      assert.equal(length(explodeOffset(branch, s)), 0, `branch moved at ${s}`);
    assert.ok(explodeOffset(rod, 0.15)[0] > 0);
    near(explodeOffset(rod, 0.3), [300, 0, 0]);
  });

  it('then the rod rises before it moves back over the rest, still joined', () => {
    near(explodeOffset(rod, 0.55), [300, 0, 200], 'risen at the side');
    near(explodeOffset(rod, 0.8), [0, 0, 200], 'over the hanukkiah');
    assert.ok(length(explodeOffset(branch, 0.55)) > 0, 'the rest comes apart meanwhile');
  });

  it('the rest is apart before the rod halves part', () => {
    near(explodeOffset(branch, 0.8), explodeOffset(branch, 1));
    assert.ok(length(explodeOffset(branch, 1)) > 50);
    near(explodeOffset(rod, 1), [40, 0, 200]);
  });
});
