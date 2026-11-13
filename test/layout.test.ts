// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BRANCH_IDS,
  branchFlameSpans,
  branchLen,
  branchSplitT,
  bulbZ,
  cupX,
  junctionZ,
  KNOP_DROP,
  knopRowZ,
  knopTs,
  FOOT_SPLIT_Z,
  SHAMASH_CONE_Z,
  SHAMASH_SPLIT_Z,
  STEM_BULBS,
  STEM_LEAF_LEN,
  STEM_LEAF_ZC,
  SPLIT_BRANCHES,
  STEM_SPLIT_Z,
} from '../src/layout.ts';
import { BRANCHES, JBULB_H, KNOP_H, PITCH, R, STEM_R, T_BODY0, Z_CUP, Z_ROD } from '../src/params.ts';

const EPS = 1e-9;
const close = (a: number, b: number, eps = 1e-6): boolean => Math.abs(a - b) <= eps;
/** World height of a knop at distance t along branch j (45° axis). */
const knopZ = (j: number, t: number): number => junctionZ(j) + t / Math.SQRT2;

describe('layout', () => {
  it('numbers branches 1..BRANCHES', () => {
    assert.deepEqual(
      BRANCH_IDS,
      Array.from({ length: BRANCHES }, (_, i) => i + 1),
    );
  });

  it('branches are straight 45° lines ending at the cup attachment height', () => {
    for (const j of BRANCH_IDS) assert.ok(close(junctionZ(j) + branchLen(j) / Math.SQRT2, Z_CUP - 4));
  });

  it('cups are spaced by PITCH and the inner cups clear the shamash cup and the stem', () => {
    for (const j of BRANCH_IDS.slice(1)) assert.ok(close(cupX(j) - cupX(j - 1), PITCH));
    assert.ok(cupX(1) - R > R, 'inner cup must be fully outside the shamash cup');
    assert.ok(cupX(1) - R > STEM_R, 'inner cup must clear the stem');
  });

  it('each cup sits right above its top knop', () => {
    for (const j of BRANCH_IDS) {
      const ks = knopTs(j);
      assert.ok(close(ks[ks.length - 1] / Math.SQRT2, cupX(j)));
    }
  });

  it('knops lie on horizontal rows shared by all branches', () => {
    const rowsOf = (j: number): number[] => knopTs(j).map((t) => knopZ(j, t));
    const outer = rowsOf(BRANCHES);
    for (const j of BRANCH_IDS) {
      for (const z of rowsOf(j)) {
        assert.ok(
          outer.some((o) => close(o, z)),
          `branch ${j} knop at z=${z} is off the rows`,
        );
      }
    }
    const n = outer.length;
    for (let i = 1; i < n - 1; i++) assert.ok(close(outer[i] - outer[i - 1], PITCH));
    assert.ok(close(outer[n - 1] - outer[n - 2], PITCH + KNOP_DROP), 'rows below the top are dropped');
  });

  it('stem bulbs are on the knop rows of the branches and still cover their junctions', () => {
    assert.deepEqual(STEM_BULBS, [0, ...BRANCH_IDS]);
    assert.equal(bulbZ(0), Z_ROD, 'top bulb is centred on the rod line');
    for (const j of STEM_BULBS) assert.ok(close(bulbZ(j), knopRowZ(j)), `stem bulb ${j} is off its row`);
    // branch knops: the top one on row 0, the others KNOP_DROP below their rows (see layout.ts)
    for (const j of BRANCH_IDS) {
      const ks = knopTs(j);
      assert.ok(close(knopZ(j, ks[ks.length - 1]), knopRowZ(0)), `branch ${j}: top knop off row 0`);
      for (const t of ks.slice(0, -1)) {
        const z = knopZ(j, t) + KNOP_DROP;
        assert.ok(
          STEM_BULBS.some((k) => close(z, knopRowZ(k))),
          `branch ${j}: knop at z=${z} is off the rows`,
        );
      }
    }
    for (const j of BRANCH_IDS) {
      assert.ok(Math.abs(bulbZ(j) - junctionZ(j)) < JBULB_H / 2, `bulb ${j} must cover its junction`);
    }
    assert.ok(
      bulbZ(0) + STEM_LEAF_ZC + STEM_LEAF_LEN / 2 < SHAMASH_SPLIT_Z && SHAMASH_SPLIT_Z < SHAMASH_CONE_Z - 8,
      'shamash split above the top leaves, with room for flames under the cone',
    );
  });

  it('stem splits lie on plain sections', () => {
    assert.ok(FOOT_SPLIT_Z < bulbZ(BRANCHES) - JBULB_H - 20, 'foot split well below the lowest bulb');
    assert.ok(STEM_SPLIT_Z < bulbZ(2) - JBULB_H, 'split below bulb 2');
    assert.ok(STEM_SPLIT_Z > bulbZ(3) + STEM_LEAF_ZC + STEM_LEAF_LEN / 2, 'split above the leaves of bulb 3');
    assert.ok(SHAMASH_SPLIT_Z > Z_ROD + 10, 'shamash split above the rod');
  });

  it('knop positions are ascending and clear of the stem bulb', () => {
    for (const j of BRANCH_IDS) {
      const ks = knopTs(j);
      assert.ok(ks.length >= 1);
      assert.ok(ks[0] >= 40 - EPS);
      for (let i = 1; i < ks.length; i++) assert.ok(ks[i] > ks[i - 1]);
    }
  });

  it('flame spans stay between the recess and the knops', () => {
    for (const j of BRANCH_IDS) {
      const ks = knopTs(j);
      for (const [a, b] of branchFlameSpans(j)) {
        assert.ok(a >= T_BODY0 + 30, 'span starts past the stem recess');
        assert.ok(b > a + 20);
        assert.ok(
          ks.every((t) => b <= t - KNOP_H || a >= t + KNOP_H),
          'span must not overlap a knop',
        );
      }
    }
  });

  it('split branches are cut at one of their knops; branch 1 stays whole', () => {
    for (const j of SPLIT_BRANCHES) assert.ok(knopTs(j).includes(branchSplitT(j)), `branch ${j}`);
    assert.ok(!SPLIT_BRANCHES.includes(1));
  });
});
