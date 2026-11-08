// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BRANCH_IDS,
  branchFlameSpans,
  branchLen,
  branchSplitT,
  cupX,
  junctionZ,
  knopTs,
} from '../src/layout.ts';
import { BRANCHES, KNOP_H, PITCH, R, STEM_R, T_BODY0, Z_CUP } from '../src/params.ts';

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
    for (let i = 1; i < outer.length; i++) assert.ok(close(outer[i] - outer[i - 1], PITCH));
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

  it('the long branch is split at one of its knops', () => {
    assert.ok(knopTs(BRANCHES).includes(branchSplitT(BRANCHES)));
  });
});
