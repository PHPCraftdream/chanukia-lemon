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
import { BRANCHES, CUP_SHIFT, KNOP_H, PITCH, STEM_OFFSET, T_BODY0, Z_CUP } from './params.ts';

const oneBased = (_: unknown, i: number): number => i + 1;

/** Branch numbers `1..BRANCHES` (pass single-argument functions only to `.map`). */
export const BRANCH_IDS: readonly number[] = Array.from({ length: BRANCHES }, oneBased);

/** Knop rows step along a 45° branch. */
const KNOP_STEP = PITCH * Math.SQRT2;
/** Lowest allowed knop position (clear of the stem bulb). */
const KNOP_MIN_T = 40.0;
/** Top knop distance before the branch end. */
const TOP_KNOP_BACK = 16;
/** Flame spans shorter than this are skipped. */
const MIN_FLAME_SPAN = 20;
/** A free span starts this far after a knop (past its leaves). */
const SPAN_AFTER_KNOP = 25;

/** X of the cup axis of branch `j` (right half). */
export const cupX = (j: number): number => j * PITCH + STEM_OFFSET - CUP_SHIFT;

/** Height of the junction of branch `j` on the stem axis. */
export const junctionZ = (j: number): number => Z_CUP - 4.0 - (j * PITCH + STEM_OFFSET);

/** Length of branch `j` along its 45° axis (stem axis to cup attachment). */
export const branchLen = (j: number): number => (j * PITCH + STEM_OFFSET) * Math.SQRT2;

/**
 * Knop positions `t` of branch `j`, on rows shared by all branches: the top row sits
 * under the cups, further rows every PITCH lower. Ascending; the last one is the top knop.
 */
export function knopTs(j: number): number[] {
  const out: number[] = [];
  for (let t = branchLen(j) - TOP_KNOP_BACK; t >= KNOP_MIN_T; t -= KNOP_STEP) out.push(t);
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

/** Height of the horizontal stem split (plain section between junctions 2 and 3). */
export const STEM_SPLIT_Z = (junctionZ(2) + junctionZ(3)) / 2;

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

/** Split position `t` of a branch: the knop nearest its middle. */
export function branchSplitT(j = BRANCHES): number {
  const mid = branchLen(j) / 2;
  return knopTs(j).reduce((best, t) => (Math.abs(t - mid) < Math.abs(best - mid) ? t : best));
}
