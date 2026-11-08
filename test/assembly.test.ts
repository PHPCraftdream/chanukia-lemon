// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assembly fit: seated parts overlap only by crush ribs at the intended joints, and
 * every part can be slid into place along its insertion direction.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assembledParts } from '../src/assembly.ts';
import type { Manifold, Vec3 } from '../src/geom.ts';
import { BRANCHES } from '../src/params.ts';

/** Max overlap of a press fit (rib crush), mm³. */
const MAX_RIB_CRUSH = 6;
/** Overlap treated as touching faces, mm³. */
const EPS_VOL = 0.01;
/** Extra overlap during sliding that counts as a collision, mm³. */
const COLLISION_VOL = 3;
const BRANCH_AXIS: Vec3 = [Math.SQRT1_2, 0, Math.SQRT1_2];

const B = BRANCHES;
/** Joints that are meant to press together (unordered pairs). */
const JOINTS = [
  ['stem_lo', 'stem_hi'],
  ['stem_hi', 'R1'],
  ['stem_hi', 'L1'],
  ['stem_hi', 'R2'],
  ['stem_hi', 'L2'],
  ['stem_lo', 'R3'],
  ['stem_lo', 'L3'],
  ['stem_lo', `R${B}a`],
  ['stem_lo', `L${B}a`],
  [`R${B}a`, `R${B}b`],
  [`L${B}a`, `L${B}b`],
  ['rod_L', 'rod_R'],
];
const pairKey = (a: string, b: string): string => [a, b].sort().join('|');
const EXPECTED = new Set(JOINTS.map(([a, b]) => pairKey(a, b)));

const parts = assembledParts();
const names = Object.keys(parts);
const overlap = (a: Manifold, b: Manifold): number => a.intersect(b).volume();
const scale = (d: Vec3, s: number): Vec3 => [d[0] * s, d[1] * s, d[2] * s];

/** First offset along `dir` where `mover` collides with `others`, or null. */
function firstCollision(
  mover: Manifold,
  dir: Vec3,
  others: readonly string[],
  steps: readonly number[],
): number | null {
  const total = (m: Manifold): number => others.reduce((s, o) => s + overlap(m, parts[o]), 0);
  const seated = total(mover);
  return steps.find((s) => total(mover.translate(scale(dir, s))) > seated + COLLISION_VOL) ?? null;
}
const steps = (to: number, step: number): number[] =>
  Array.from({ length: Math.floor(to / step) }, (_, i) => (i + 1) * step);

describe('assembly', () => {
  it('parts overlap only at the intended joints, and only by rib crush', () => {
    const found = new Set<string>();
    for (let i = 0; i < names.length; i++) {
      for (let k = i + 1; k < names.length; k++) {
        const v = overlap(parts[names[i]], parts[names[k]]);
        if (v <= EPS_VOL) continue;
        const key = pairKey(names[i], names[k]);
        found.add(key);
        assert.ok(EXPECTED.has(key), `unexpected contact ${key}: ${v.toFixed(2)} mm3`);
        assert.ok(v <= MAX_RIB_CRUSH, `${key} overlaps ${v.toFixed(2)} mm3 — more than rib crush`);
      }
    }
    assert.deepEqual([...found].sort(), [...EXPECTED].sort(), 'every joint must press-fit');
  });

  it('branches slide in along their axes, from the stem outwards', () => {
    const installed: string[] = [];
    for (const n of [...Array.from({ length: B - 1 }, (_, i) => `R${i + 1}`), `R${B}a`]) {
      const hit = firstCollision(parts[n], BRANCH_AXIS, ['stem_lo', 'stem_hi', ...installed], steps(60, 2));
      assert.equal(hit, null, `${n} collides at ${hit} mm`);
      installed.push(n);
    }
    const hit = firstCollision(parts[`R${B}b`], BRANCH_AXIS, [`R${B}a`, `R${B - 1}`], steps(60, 2));
    assert.equal(hit, null, `R${B}b collides at ${hit} mm`);
  });

  it('the rod slides in through all cups and the stem', () => {
    const others = ['stem_lo', 'stem_hi', ...names.filter((n) => /^R\d/.test(n))];
    const hit = firstCollision(parts.rod_R, [1, 0, 0], others, steps(290, 5));
    assert.equal(hit, null, `rod collides at ${hit} mm`);
  });

  it('the stem halves join vertically', () => {
    const hit = firstCollision(parts.stem_hi, [0, 0, 1], ['stem_lo'], steps(12, 0.5));
    assert.equal(hit, null, `stem halves collide at ${hit} mm`);
  });
});
