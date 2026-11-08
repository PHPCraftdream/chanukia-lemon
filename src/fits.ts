// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Joints: crush-ribbed pins, the D-profile rod holes and split cuts.
 *
 * @module
 */
import { Manifold, box, cyl, union } from './geom.ts';
import type { Vec2 } from './geom.ts';
import { PIN_L, RIB_R, ROD_FLAT, ROD_HOLE_R, ROD_R, Z_ROD } from './params.ts';

/** Segments of the thin rib cylinders. */
const RIB_SEG = 24;
/** Radial clearance of split-joint sockets. */
const SPLIT_SOCKET_CLEARANCE = 0.15;
/** Half-size of the boxes used to cut parts in two. */
const HALF_SPACE = 1000;

/**
 * Cylinder along Z with crush ribs; ribs start `skip` mm after `z0` to give a lead-in.
 *
 * @param r core radius
 * @param h rib height above the core
 * @param skip rib-free lead-in length
 * @param n number of ribs
 */
export function ribbed(z0: number, z1: number, r: number, h: number, skip = 3.0, n = 4): Manifold {
  const rib = Manifold.cylinder(z1 - z0 - skip, RIB_R, RIB_R, RIB_SEG).translate([
    r + h - RIB_R,
    0,
    z0 + skip,
  ]);
  const ribs = Array.from({ length: n }, (_, k) => rib.rotate([0, 0, 45 + (k * 360) / n]));
  return union([cyl(z0, z1, r), ...ribs]);
}

/**
 * Box removing local `x < -f` in a +Z rod frame; becomes the top flat after {@link alongX}.
 *
 * @param f distance of the flat from the axis
 */
export const flatCut = (f: number, z0: number, z1: number): Manifold =>
  Manifold.cube([20, 40, z1 - z0]).translate([-f - 20, -20, z0]);

/** Lay geometry built along local +Z onto the world rod line (along +X at {@link Z_ROD}). */
export const alongX = (m: Manifold, x = 0): Manifold => m.rotate([0, 90, 0]).translate([x, 0, Z_ROD]);

/** D-profile hole for the rod along X (same clearance on the flat as on the round). */
export function rodHole(x0: number, length = 60, r = ROD_HOLE_R): Manifold {
  const clearance = r - ROD_R;
  return alongX(cyl(0, length, r).subtract(flatCut(ROD_FLAT + clearance, -1, length + 1)), x0);
}

/**
 * Cut a part at `z = z0`. The lower half gets ribbed pins pointing +Z at `pins`,
 * the upper half gets matching sockets.
 *
 * @param pins XY of the pins
 * @param r pin core radius
 * @param h pin rib height
 * @returns `[lower, upper]`
 */
export function splitZ(
  m: Manifold,
  z0: number,
  pins: readonly Vec2[],
  r: number,
  h: number,
): [Manifold, Manifold] {
  const s = HALF_SPACE;
  const lower = m.intersect(box([-s, -s, z0 - 2 * s], [s, s, z0]));
  const upper = m.intersect(box([-s, -s, z0], [s, s, z0 + 2 * s]));
  const pin = ribbed(-PIN_L, 0.5, r, h, 2.0).mirror([0, 0, 1]);
  const socket = cyl(-0.5, PIN_L + 0.5, r + SPLIT_SOCKET_CLEARANCE);
  return [
    union([lower, ...pins.map(([x, y]) => pin.translate([x, y, z0]))]),
    upper.subtract(union(pins.map(([x, y]) => socket.translate([x, y, z0])))),
  ];
}
