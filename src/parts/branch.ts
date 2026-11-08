// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Branches: straight 45° tubes with knops, leaves and flame reliefs, ending in a ball
 * under the row cup. Built for the right half; the left half is the mirror image.
 *
 * @module
 */
import { Manifold, cyl, ellipsoid, ground, union } from '../geom.ts';
import { flameRing, leafRing } from '../decor.ts';
import { ribbed, rodHole, splitZ } from '../fits.ts';
import { BRANCH_PINS, branchFlameSpans, branchSplitT, cupX, junctionZ, knopTs } from '../layout.ts';
import {
  BRANCHES,
  BRANCH_R,
  KEY_RIB_H,
  KEY_R,
  KNOP_H,
  KNOP_R,
  ROD_HOLE_BR_R,
  SEG,
  TENON_RIB_H,
  TENON_R,
  TOP_KNOP_R,
  T_BODY0,
  T_TENON0,
  Z_CUP,
} from '../params.ts';
import { rowCup } from './cup.ts';

/** Leaves hugging the tube above each knop (tips toward the cup). */
const knopLeaves = (t: number): Manifold =>
  leafRing({ radial: BRANCH_R + 0.6, zc: t + 11, length: 24, width: 5.5, thick: 1.8 });

/** Flame ring on a free tube span. */
const spanFlames = ([a, b]: [number, number]): Manifold => flameRing(BRANCH_R, a, b - a, 4, 45);

/** Branch `j` along local +Z from the stem axis (t = distance along the axis), without its cup. */
export function branchLocal(j: number): Manifold {
  const ks = knopTs(j);
  const top = ks[ks.length - 1];
  return union([
    cyl(T_BODY0, top, BRANCH_R),
    ribbed(T_TENON0, T_BODY0 + 0.4, TENON_R, TENON_RIB_H),
    Manifold.sphere(TOP_KNOP_R, SEG).translate([0, 0, top]), // ball right under the cup axis
    ...ks
      .slice(0, -1)
      .flatMap((t) => [ellipsoid(KNOP_R, KNOP_R, KNOP_H).translate([0, 0, t]), knopLeaves(t)]),
    ...branchFlameSpans(j).map(spanFlames),
  ]);
}

/**
 * Branch `j` with its cup in assembled position (+X side, junction on the stem axis).
 *
 * @param drill cut the rod hole through the cup (printable part) or not (display solid)
 */
export function branchWorld(j: number, drill = false): Manifold {
  const x = cupX(j);
  const jz = junctionZ(j);
  const cup = rowCup().translate([x, 0, Z_CUP - jz]);
  const m = union([branchLocal(j).rotate([0, 45, 0]), cup]).translate([0, 0, jz]);
  return drill ? m.subtract(rodHole(x - 30, 60, ROD_HOLE_BR_R)) : m;
}

/** World part -> branch frame (junction at the origin, axis along +Z). */
const toBranchFrame = (m: Manifold, j: number): Manifold =>
  m.translate([0, 0, -junctionZ(j)]).rotate([0, -45, 0]);

/** Branch frame -> world (assembled position). */
const fromBranchFrame = (m: Manifold, j: number): Manifold =>
  m.rotate([0, 45, 0]).translate([0, 0, junctionZ(j)]);

/** Branch `j` split in two at the knop nearest its middle, in assembled position: `[inner, outer]`. */
export function branchHalves(j = BRANCHES): [Manifold, Manifold] {
  const [inner, outer] = splitZ(
    toBranchFrame(branchWorld(j, true), j),
    branchSplitT(j),
    BRANCH_PINS,
    KEY_R,
    KEY_RIB_H,
  );
  return [fromBranchFrame(inner, j), fromBranchFrame(outer, j)];
}

/** Print orientation of a branch part: axis horizontal along +X, resting on the bed. */
export const layBranch = (worldPart: Manifold, j: number): Manifold =>
  ground(toBranchFrame(worldPart, j).rotate([0, 90, 0]));
