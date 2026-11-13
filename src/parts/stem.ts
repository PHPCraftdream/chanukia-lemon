// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * The stem: foot, bulbs with leaves (on the knop rows of the branches), flame reliefs,
 * shamash cup on top, tenon sockets with tube recesses, rod hole, and the horizontal splits
 * for printing (lower / upper stem, shamash cup).
 *
 * @module
 */
import { cyl, ellipsoid, mirrorX, revolve, union } from '../geom.ts';
import type { Manifold, Vec2 } from '../geom.ts';
import { decorate, flameRing, leafRing } from '../decor.ts';
import { rodHole, splitZ } from '../fits.ts';
import {
  BRANCH_IDS,
  FOOT_SPLIT_Z,
  SHAMASH_CONE_Z,
  SHAMASH_SPLIT_Z,
  STEM_LEAF_LEN,
  STEM_LEAF_ZC,
  STEM_BULBS,
  STEM_PINS,
  STEM_SPLIT_Z,
  bulbZ,
  junctionZ,
} from '../layout.ts';
import {
  BRANCHES,
  BRANCH_R,
  CUP_H,
  FOOT_R,
  JBULB_H,
  JBULB_R,
  R,
  SOCKET_R,
  STEM_PIN_RIB_H,
  STEM_PIN_R,
  STEM_R,
  T_BODY0,
  T_SOCK1,
  T_TENON0,
  Z_SHAMASH,
} from '../params.ts';
import { cupTopProfile } from './cup.ts';

/** Leaf angles on the stem above each bulb: front and back only, clear of the branches at 0°/180°. */
const STEM_LEAF_ANGLES: readonly number[] = [60, 90, 120, 240, 270, 300];
/** Flames per ring on the stem; phase keeps them off the rod line (0°/180°). */
const STEM_FLAMES = 6;
const STEM_FLAME_PHASE = 30;
/** Radial clearance of the tube recess around a branch tube. */
const RECESS_CLEARANCE = 0.15;
/** Length of the tube recess along the branch axis. */
const RECESS_LEN = 30;

/** Revolved body: foot, plain stem, shamash under-cone and cup. */
function stemBody(): Manifold {
  const zs = Z_SHAMASH;
  const profile: Vec2[] = [
    [0, 0],
    [FOOT_R - 2, 0],
    [FOOT_R, 2],
    [FOOT_R, 6],
    [30, 16],
    [STEM_R, FOOT_SPLIT_Z],
    [STEM_R, zs - (R - STEM_R)],
    [R, zs],
    ...cupTopProfile(zs + CUP_H),
  ];
  return revolve(profile);
}

/** Stem bulb `j` (0 = top row, else at branch pair `j`) with its leaves. */
function bulb(j: number): Manifold[] {
  const z = bulbZ(j);
  return [
    ellipsoid(JBULB_R, JBULB_R, JBULB_H).translate([0, 0, z]),
    leafRing({
      radial: STEM_R + 0.6,
      zc: z + STEM_LEAF_ZC,
      length: STEM_LEAF_LEN,
      width: 5.5,
      thick: 1.8,
      angles: STEM_LEAF_ANGLES,
    }),
  ];
}

/** Flame rings: lower stem, and between the shamash split (above the top bulb's leaves) and the cone. */
function stemFlames(): Manifold[] {
  const ring = (z0: number, z1: number): Manifold =>
    flameRing(STEM_R, z0, z1 - z0, STEM_FLAMES, STEM_FLAME_PHASE);
  return [
    ring(FOOT_SPLIT_Z + 2, bulbZ(BRANCHES) - JBULB_H - 2),
    ring(SHAMASH_SPLIT_Z + 2, SHAMASH_CONE_Z - 2),
  ];
}

/** Tenon socket + tube recess for the right branch of pair `j` (world frame). */
const branchSocket = (j: number): Manifold =>
  union([
    cyl(T_TENON0 - 0.5, T_SOCK1, SOCKET_R),
    cyl(T_BODY0, T_BODY0 + RECESS_LEN, BRANCH_R + RECESS_CLEARANCE),
  ])
    .rotate([0, 45, 0])
    .translate([0, 0, junctionZ(j)]);

/** All cuts of the printable stem: rod hole and both sockets of every junction. */
function stemCuts(): Manifold {
  const sockets = BRANCH_IDS.map(branchSocket);
  return union([rodHole(-30), ...sockets, ...sockets.map(mirrorX)]);
}

/**
 * The whole stem in assembled position.
 *
 * @param drill cut sockets, recesses and the rod hole (printable) or not (display solid)
 */
export function stem(drill = false): Manifold {
  const m = decorate(union([stemBody(), ...STEM_BULBS.flatMap(bulb), ...stemFlames()]), Z_SHAMASH, STEM_R);
  return drill ? m.subtract(stemCuts()) : m;
}

/** Printable stem split into `[foot, lower, upper, shamash cup]` (assembled position). */
export function stemPieces(): [Manifold, Manifold, Manifold, Manifold] {
  const cut = (m: Manifold, z: number): [Manifold, Manifold] =>
    splitZ(m, z, STEM_PINS, STEM_PIN_R, STEM_PIN_RIB_H);
  const [foot, stemAbove] = cut(stem(true), FOOT_SPLIT_Z);
  const [lower, rest] = cut(stemAbove, STEM_SPLIT_Z);
  const [upper, cup] = cut(rest, SHAMASH_SPLIT_Z);
  return [foot, lower, upper, cup];
}
