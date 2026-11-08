// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Fit-test coupon: block with a tenon socket and a rod hole, plus matching short plugs.
 * Print it first with the same material and printer as the real parts.
 *
 * @module
 */
import { box, cyl, union } from '../geom.ts';
import type { Manifold } from '../geom.ts';
import { flatCut, ribbed } from '../fits.ts';
import { FIT_D, ROD_FLAT, ROD_HOLE_R, ROD_R, SOCKET_R, TENON_RIB_H, TENON_R } from '../params.ts';

export function fitTest(): Manifold {
  const rodHole = cyl(-1, 13, ROD_HOLE_R).subtract(flatCut(ROD_FLAT + FIT_D, -2, 14));
  const block = box([-30, -15, 0], [30, 15, 12])
    .subtract(cyl(2, 13, SOCKET_R).translate([-15, 0, 0]))
    .subtract(rodHole.translate([12, 0, 0]));
  const tenon = ribbed(0, 25, TENON_R, TENON_RIB_H)
    .rotate([0, 90, 0])
    .translate([-30, 30, TENON_R + 0.6]);
  const rod = cyl(0, 40, ROD_R)
    .subtract(flatCut(ROD_FLAT, -1, 41))
    .rotate([0, -90, 0])
    .translate([10, -30, ROD_FLAT]); // flat side down
  return union([block, tenon, rod]);
}
