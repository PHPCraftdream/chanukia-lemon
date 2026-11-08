// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * The stem: foot, junction bulbs with leaves, flame reliefs, shamash cup on top,
 * tenon sockets with tube recesses, rod hole, and the horizontal split for printing.
 *
 * @module
 */
import { cyl, ellipsoid, mirrorX, revolve, union } from '../geom.ts';
import type { Manifold, Vec2 } from '../geom.ts';
import { decorate, flameRing, leafRing } from '../decor.ts';
import { rodHole, splitZ } from '../fits.ts';
import { BRANCH_IDS, STEM_PINS, STEM_SPLIT_Z, junctionZ } from '../layout.ts';
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
    [STEM_R, 30],
    [STEM_R, zs - (R - STEM_R)],
    [R, zs],
    ...cupTopProfile(zs + CUP_H),
  ];
  return revolve(profile);
}

/** Junction bulb of branch pair `j` with its leaves. */
function junction(j: number): Manifold[] {
  const z = junctionZ(j);
  return [
    ellipsoid(JBULB_R, JBULB_R, JBULB_H).translate([0, 0, z]),
    leafRing({
      radial: STEM_R + 0.6,
      zc: z + 19,
      length: 24,
      width: 5.5,
      thick: 1.8,
      angles: STEM_LEAF_ANGLES,
    }),
  ];
}

/** Flame rings: lower stem, and two tiers between the top junction and the shamash cone. */
function stemFlames(): Manifold[] {
  const ring = (z0: number, z1: number): Manifold =>
    flameRing(STEM_R, z0, z1 - z0, STEM_FLAMES, STEM_FLAME_PHASE);
  const lo0 = 32.0;
  const lo1 = junctionZ(BRANCHES) - JBULB_H - 2;
  const hi0 = junctionZ(1) + 33;
  const hi1 = Z_SHAMASH - (R - STEM_R) - 2;
  const mid = (hi0 + hi1) / 2;
  return [ring(lo0, lo1), ring(hi0, mid - 2), ring(mid + 2, hi1)];
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
  const m = decorate(
    union([stemBody(), ...BRANCH_IDS.flatMap(junction), ...stemFlames()]),
    Z_SHAMASH,
    STEM_R,
  );
  return drill ? m.subtract(stemCuts()) : m;
}

/** Printable stem split into `[lower, upper]` (assembled position). */
export const stemHalves = (): [Manifold, Manifold] =>
  splitZ(stem(true), STEM_SPLIT_Z, STEM_PINS, STEM_PIN_R, STEM_PIN_RIB_H);
