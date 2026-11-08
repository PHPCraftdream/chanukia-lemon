// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Fit-test coupon (about 5 cm³): a small block with a tenon socket and a rod hole, plus
 * two short plugs — a ribbed tenon and a D-profile rod stub. It does not attach to the
 * hanukkiah; print it first with the same material and printer as the real parts.
 *
 * @module
 */
import { box, cyl, union } from '../geom.ts';
import type { Manifold } from '../geom.ts';
import { flatCut, ribbed } from '../fits.ts';
import { FIT_D, ROD_FLAT, ROD_HOLE_R, ROD_R, SOCKET_R, TENON_RIB_H, TENON_R } from '../params.ts';

/** Block size (mm): just enough wall around the two holes. */
const BLOCK: { x: number; y: number; z: number } = { x: 32, y: 16, z: 10 };
/** Floor under the blind tenon socket. */
const SOCKET_FLOOR = 2;
/** Hole centres along X. */
const SOCKET_X = -8;
const ROD_HOLE_X = 8.5;
/** Plug lengths: enough engagement to feel the fit. */
const TENON_LEN = 14;
const ROD_LEN = 16;
/** Flat on the bottom of the lying tenon, for bed adhesion. */
const TENON_FLAT = 0.4;

/** Keep only z >= 0 (the print bed). */
const aboveBed = (m: Manifold): Manifold => m.intersect(box([-100, -100, 0], [100, 100, 100]));

export function fitTest(): Manifold {
  const rodHole = cyl(-1, BLOCK.z + 1, ROD_HOLE_R).subtract(flatCut(ROD_FLAT + FIT_D, -2, BLOCK.z + 2));
  const block = box([-BLOCK.x / 2, -BLOCK.y / 2, 0], [BLOCK.x / 2, BLOCK.y / 2, BLOCK.z])
    .subtract(cyl(SOCKET_FLOOR, BLOCK.z + 1, SOCKET_R).translate([SOCKET_X, 0, 0]))
    .subtract(rodHole.translate([ROD_HOLE_X, 0, 0]));
  const tenon = aboveBed(
    ribbed(0, TENON_LEN, TENON_R, TENON_RIB_H)
      .rotate([0, 90, 0])
      .translate([-TENON_LEN / 2, BLOCK.y / 2 + 3 + TENON_R, TENON_R - TENON_FLAT]),
  );
  const rod = cyl(0, ROD_LEN, ROD_R)
    .subtract(flatCut(ROD_FLAT, -1, ROD_LEN + 1))
    .rotate([0, -90, 0]) // flat side down
    .translate([ROD_LEN / 2, -(BLOCK.y / 2 + 3 + ROD_R), ROD_FLAT]);
  return union([block, tenon, rod]);
}
