// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assembly fit: seated parts overlap only by crush ribs at the intended joints, and
 * every part can be slid into place along its insertion direction.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assembledParts, branchPieceNames } from '../src/assembly.ts';
import { BRANCH_IDS, SPLIT_BRANCHES } from '../src/layout.ts';
import { branchHalves } from '../src/parts/branch.ts';
import type { Manifold, Vec3 } from '../src/geom.ts';

/** Max overlap of a press fit (rib crush), mm³. */
const MAX_RIB_CRUSH = 6;
/** Overlap treated as touching faces, mm³. */
const EPS_VOL = 0.01;
/** Extra overlap during sliding that counts as a collision, mm³. */
const COLLISION_VOL = 3;
/** Shared half vs the half built on its own branch: only mesh noise of the reliefs, mm³. */
const MAX_SHARED_DIFF = 5;
const BRANCH_AXIS: Vec3 = [Math.SQRT1_2, 0, Math.SQRT1_2];

/** Right-side branch pieces, inner first; `L…` are their mirrors. */
const PIECES = BRANCH_IDS.map(branchPieceNames);
/** Stem piece that holds the sockets of branch pair `j` (the stem split is between junctions 2 and 3). */
const stemOf = (j: number): string => (j <= 2 ? 'stem_hi' : 'stem_lo');
const mirrorName = (n: string): string => n.replace(/^R/, 'L');
/** Joints that are meant to press together (unordered pairs). */
const JOINTS = [
  ['foot', 'stem_lo'],
  ['stem_lo', 'stem_hi'],
  ['stem_hi', 'shamash'],
  ...PIECES.flatMap(([inner], i) => [
    [stemOf(i + 1), inner],
    [stemOf(i + 1), mirrorName(inner)],
  ]),
  ...PIECES.filter((p) => p.length === 2).flatMap(([a, b]) => [
    [a, b],
    [mirrorName(a), mirrorName(b)],
  ]),
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

  it('branches slide in along their axes: inner pieces from the stem outwards, then outer halves', () => {
    const installed: string[] = [];
    for (const [n] of PIECES) {
      const hit = firstCollision(parts[n], BRANCH_AXIS, ['stem_lo', 'stem_hi', ...installed], steps(60, 2));
      assert.equal(hit, null, `${n} collides at ${hit} mm`);
      installed.push(n);
    }
    for (const [, n] of PIECES.filter((p) => p.length === 2)) {
      const hit = firstCollision(parts[n], BRANCH_AXIS, installed, steps(60, 2));
      assert.equal(hit, null, `${n} collides at ${hit} mm`);
      installed.push(n);
    }
  });

  it('the rod slides in through all top knops and the stem', () => {
    const others = ['stem_lo', 'stem_hi', 'shamash', ...names.filter((n) => /^R\d/.test(n))];
    const hit = firstCollision(parts.rod_R, [1, 0, 0], others, steps(290, 5));
    assert.equal(hit, null, `rod collides at ${hit} mm`);
  });

  it('a shared print file fits every branch it is used on', () => {
    for (const j of SPLIT_BRANCHES) {
      branchHalves(j).forEach((own, h) => {
        const shared = parts[PIECES[j - 1][h]];
        const diff = own.subtract(shared).volume() + shared.subtract(own).volume();
        assert.ok(diff < MAX_SHARED_DIFF, `branch ${j} half ${h}: ${diff.toFixed(2)} mm3 apart`);
      });
    }
  });

  it('the stem pieces join vertically', () => {
    const hit = firstCollision(parts.stem_hi, [0, 0, 1], ['stem_lo'], steps(12, 0.5));
    assert.equal(hit, null, `upper stem collides with the lower stem at ${hit} mm`);
    const foot = firstCollision(parts.stem_lo, [0, 0, 1], ['foot'], steps(12, 0.5));
    assert.equal(foot, null, `lower stem collides with the foot at ${foot} mm`);
    const cup = firstCollision(parts.shamash, [0, 0, 1], ['stem_hi'], steps(12, 0.5));
    assert.equal(cup, null, `shamash cup collides at ${cup} mm`);
  });
});
