// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * The stiffening rod: two D-profile halves meeting on a ribbed pin/socket "jack" inside
 * the stem, outer ends trimmed flush with the outer cones.
 *
 * @module
 */
import { Manifold, cyl, ground } from '../geom.ts';
import { alongX, flatCut, ribbed } from '../fits.ts';
import { cupX } from '../layout.ts';
import {
  BRANCHES,
  PIN_L,
  PIN_RIB_H,
  PIN_R,
  PIN_SOCKET_R,
  ROD_FLAT,
  ROD_R,
  X_ROD,
  Z_CUP,
  Z_ROD,
} from '../params.ts';
import { rowCup } from './cup.ts';

/** `pin`: carries the jack pin; `socket`: has the jack socket; `solid`: display only. */
export type RodKind = 'pin' | 'socket' | 'solid';

/** Rod body along local +Z (inner end at z = 0) with the jack feature. */
function rodBody(kind: RodKind): Manifold {
  let body = cyl(0, X_ROD, ROD_R);
  if (kind === 'pin') body = body.add(ribbed(-PIN_L, 0.5, PIN_R, PIN_RIB_H, 2.0));
  else if (kind === 'socket') body = body.subtract(cyl(-0.5, PIN_L + 0.5, PIN_SOCKET_R));
  return body.subtract(flatCut(ROD_FLAT, -PIN_L - 1, X_ROD + 1));
}

/** Right rod half in assembled position (x > 0), outer end trimmed flush with the outer cone. */
export function rodHalf(kind: RodKind): Manifold {
  const rod = alongX(rodBody(kind));
  const xo = cupX(BRANCHES);
  const inside = Manifold.cube([xo + PIN_L + 10, 40, 40]).translate([-PIN_L - 10, -20, Z_ROD - 20]);
  const outerCup = rowCup().translate([xo, 0, Z_CUP]);
  return rod.intersect(inside).add(rod.intersect(outerCup));
}

/** Print orientation of a rod half: flat side down. */
export const layRod = (m: Manifold): Manifold => ground(m.rotate([180, 0, 0]));
