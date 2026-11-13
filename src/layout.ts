// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Placement of branches, cups and knops (pure math, no geometry).
 *
 * Branches are numbered `j = 1..BRANCHES` from the stem outwards. `t` is the distance
 * along a branch axis from the stem axis ("branch frame").
 *
 * @module
 */
import type { Vec2 } from './geom.ts';
import {
  BRANCHES,
  CUP_SHIFT,
  JBULB_H,
  KNOP_H,
  PITCH,
  R,
  STEM_OFFSET,
  STEM_R,
  T_BODY0,
  TOP_KNOP_BACK,
  Z_CUP,
  Z_ROD,
  Z_SHAMASH,
} from './params.ts';

const oneBased = (_: unknown, i: number): number => i + 1;

/** Branch numbers `1..BRANCHES` (pass single-argument functions only to `.map`). */
export const BRANCH_IDS: readonly number[] = Array.from({ length: BRANCHES }, oneBased);

/** Knop rows step along a 45° branch (one PITCH in height). */
const KNOP_STEP = PITCH * Math.SQRT2;
/** Lowest allowed knop position (clear of the stem bulb). */
const KNOP_MIN_T = 40.0;
/**
 * Knops below the top row sit this much (mm, in height) lower than their row: the stem bulbs
 * are bigger, and at the same height the branch knops look slightly higher than them.
 */
export const KNOP_DROP = 2.0;
/** Flame spans shorter than this are skipped. */
const MIN_FLAME_SPAN = 20;
/** A free span starts this far after a knop (past its leaves). */
const SPAN_AFTER_KNOP = 25;

/** X of the cup axis of branch `j` (right half). */
export const cupX = (j: number): number => j * PITCH + STEM_OFFSET - CUP_SHIFT;

/** Height of the junction of branch `j` on the stem axis. */
export const junctionZ = (j: number): number => Z_CUP - 4.0 - (j * PITCH + STEM_OFFSET);

/**
 * Height of knop row `k` (0 = the top row under the cups, then every PITCH lower). The knops
 * of every branch and the stem bulbs sit on these rows.
 */
export const knopRowZ = (k: number): number => Z_ROD - k * PITCH;

/**
 * Height of stem bulb `j`: on knop row `j`. Bulbs 1..BRANCHES sit a little above the junction
 * of branch pair `j`; bulb 0 is on the top row, with the rod through it and the top knops.
 */
export const bulbZ = (j: number): number => knopRowZ(j);

/** Stem bulbs, top to bottom: the top row and one per branch pair. */
export const STEM_BULBS: readonly number[] = [0, ...BRANCH_IDS];

/** Length of branch `j` along its 45° axis (stem axis to cup attachment). */
export const branchLen = (j: number): number => (j * PITCH + STEM_OFFSET) * Math.SQRT2;

/**
 * Knop positions `t` of branch `j`, on rows shared by all branches: the top row sits
 * under the cups, further rows every PITCH lower (less {@link KNOP_DROP}). Ascending; the
 * last one is the top knop.
 */
export function knopTs(j: number): number[] {
  const top = branchLen(j) - TOP_KNOP_BACK;
  const out: number[] = [top];
  for (let t = top - KNOP_STEP - KNOP_DROP * Math.SQRT2; t >= KNOP_MIN_T; t -= KNOP_STEP) out.push(t);
  return out.reverse();
}

const isLongSpan = ([a, b]: Vec2): boolean => b - a > MIN_FLAME_SPAN;
const afterKnopLeaves = (t: number): number => t + SPAN_AFTER_KNOP;

/**
 * Free tube spans `[t0, t1]` of branch `j` between the stem recess / knop leaves and the
 * next knop; used for the flame reliefs.
 */
export function branchFlameSpans(j: number): Vec2[] {
  const ks = knopTs(j);
  const starts = [T_BODY0 + 32, ...ks.slice(0, -1).map(afterKnopLeaves)];
  return starts.map((a, i): Vec2 => [a, ks[i] - KNOP_H - 2]).filter(isLongSpan);
}

/** Height of the foot split: where the foot cone meets the plain stem (the foot ships separately). */
export const FOOT_SPLIT_Z = 30;

/** Stem leaves above each bulb: centre height above the bulb centre, and length. */
export const STEM_LEAF_ZC = 19;
export const STEM_LEAF_LEN = 24;

/** Height of the horizontal stem split: middle of the plain section between bulb 2 and the leaves above bulb 3. */
export const STEM_SPLIT_Z = (bulbZ(2) - JBULB_H + bulbZ(3) + STEM_LEAF_ZC + STEM_LEAF_LEN / 2) / 2;

/** Where the plain stem meets the cone under the shamash cup. */
export const SHAMASH_CONE_Z = Z_SHAMASH - (R - STEM_R);

/**
 * Height of the shamash cup split: right above the leaves of the top bulb, so the cup
 * (printed separately in heat-resistant plastic) takes the top of the stem with it.
 */
export const SHAMASH_SPLIT_Z = bulbZ(0) + STEM_LEAF_ZC + STEM_LEAF_LEN / 2 + 1;

/** XY of the stem split pins (off the branch plane, so the halves key in rotation). */
export const STEM_PINS: readonly Vec2[] = [
  [0, 6.5],
  [0, -6.5],
];

/** XY (branch frame) of the pins of the long-branch split joint. */
export const BRANCH_PINS: readonly Vec2[] = [
  [5.0, 0],
  [-5.0, 0],
];

/**
 * Branches printed in two halves: inner (into the stem) and outer (with the cup) — shorter
 * parts, and the cups can be printed in heat-resistant plastic. Branch 1 is short and printed whole.
 */
export const SPLIT_BRANCHES: readonly number[] = [2, 3, 4];

export const isSplitBranch = (j: number): boolean => SPLIT_BRANCHES.includes(j);

/** Split position `t` of a branch: the knop nearest its middle. */
export function branchSplitT(j = BRANCHES): number {
  const mid = branchLen(j) / 2;
  return knopTs(j).reduce((best, t) => (Math.abs(t - mid) < Math.abs(best - mid) ? t : best));
}
