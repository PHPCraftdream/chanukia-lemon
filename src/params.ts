// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * All design parameters (millimetres, degrees). Change values here and rebuild.
 *
 * Coordinate system of the assembled hanukkiah: Z up, stem axis on Z, branches in the
 * XZ plane (+X = right half), Y = depth (front is -Y).
 *
 * @module
 */

// ---------------------------------------------------------------- tea light cup

/** Inner diameter of the cup pocket (tea light 38–39 mm + clearance). */
export const POCKET_D = 40.0;
/** Cup wall thickness. */
export const WALL = 3.0;
/** Cup height (base to rim). */
export const CUP_H = 16.0;
/** Pocket depth (how deep the tea light sits). */
export const POCKET_DEPTH = 8.0;
/** Gap between neighbouring row cups. */
export const GAP = 14.0;
/** Cup outer diameter. */
export const OD = POCKET_D + 2 * WALL;
/** Cup outer radius. */
export const R = OD / 2;
/** Pocket radius. */
export const PR = POCKET_D / 2;
/** Distance between candle axes. */
export const PITCH = OD + GAP;
/** Height of the 45° under-cone below each row cup. */
export const CONE_H = 11.0;
/** Bottom radius of the row-cup under-cone. */
export const CONE_R0 = R - CONE_H;

// ---------------------------------------------------------------- menorah body

/** Branches per side (8 lights + shamash). */
export const BRANCHES = 4;
/** Height of the lowest branch junction on the stem. */
export const Z_J0 = 84.0;
/** Shamash cup base above the row cup base. */
export const SHAMASH_LIFT = 50.0;
/** Extra distance of all cups from the stem (keeps flames away from the shamash). */
export const STEM_OFFSET = 20.0;
/** Stem radius. */
export const STEM_R = 13.5;
/** Foot radius. */
export const FOOT_R = 90.0;
/** Branch tube radius. */
export const BRANCH_R = 8.0;
/** Knop (kaftor) radial semi-axis. */
export const KNOP_R = 12.5;
/** Knop axial semi-axis. */
export const KNOP_H = 16.0;
/** Radius of the ball under each row cup (top knop). */
export const TOP_KNOP_R = 13.0;
/** Junction bulb on the stem: radial semi-axis. */
export const JBULB_R = 20.0;
/** Junction bulb on the stem: axial semi-axis. */
export const JBULB_H = 20.0;
/** Circular segments for round primitives. */
export const SEG = 96;

// ---------------------------------------------------------------- press fits
// Ribbed fits: ribs crush ~0.1 mm, the core keeps ~0.15 mm radial clearance.

/** Radius of the crush-rib cross-section. */
export const RIB_R = 0.5;
/** Branch tenon core radius. */
export const TENON_R = 5.0;
/** Branch tenon rib height. */
export const TENON_RIB_H = 0.25;
/** Stem socket radius for the tenon. */
export const SOCKET_R = 5.15;
/** Branch frame (distance along the branch axis from the stem axis): tenon start. */
export const T_TENON0 = 7.0;
/** Branch frame: tube start (sunk ~4 mm into the junction bulb). */
export const T_BODY0 = 14.0;
/** Branch frame: end of the tenon socket in the stem. */
export const T_SOCK1 = 14.4;
/** Stiffening rod radius. */
export const ROD_R = 4.0;
/** Rod hole in the stem: slip fit, the datum of the rod line. */
export const ROD_HOLE_R = 4.15;
/** Rod holes in the top knops of the branches: oversized to absorb print/shrink errors, glued after assembly. */
export const ROD_HOLE_BR_R = 4.75;
/** D-profile flat on top of the rod (keys rotation, prints flat side down). */
export const ROD_FLAT = 3.2;
/** Clearance of the D-flat in the fit-test coupon. */
export const FIT_D = 0.15;
/** Rod "jack" pin core radius. */
export const PIN_R = 2.0;
/** Rod "jack" pin rib height. */
export const PIN_RIB_H = 0.25;
/** Rod "jack" socket radius. */
export const PIN_SOCKET_R = 2.15;
/** Length of the rod "jack" pin and of the split-joint pins. */
export const PIN_L = 10.0;
/** Long-branch split joint: pin core radius. */
export const KEY_R = 2.5;
/** Long-branch split joint: pin rib height. */
export const KEY_RIB_H = 0.25;
/** Stem split joint: pin core radius. */
export const STEM_PIN_R = 2.5;
/** Stem split joint: pin rib height. */
export const STEM_PIN_RIB_H = 0.25;

// ---------------------------------------------------------------- decoration

/** Laurel wreath on the cup wall: number of leaf pairs. */
export const WREATH_N = 18;
/** Laurel wreath relief height. */
export const WREATH_PROUD = 1.0;
/** Concentric V-grooves in the pocket floor: radii. */
export const GROOVE_RS: readonly number[] = [5.0, 9.0, 13.0, 17.0];
/** V-groove width. */
export const GROOVE_W = 1.2;
/** V-groove depth. */
export const GROOVE_D = 0.6;
/** Flame-tongue relief height above the surface. */
export const FLAME_RELIEF = 1.0;
/** Flame-tongue embedding depth below the surface. */
export const FLAME_EMBED = 0.6;
/** Leaf-vein groove width in the flames. */
export const VEIN_W = 0.6;
/** Leaf-vein groove depth in the flames. */
export const VEIN_D = 0.4;

// ---------------------------------------------------------------- derived heights

/** Row cup base height. */
export const Z_CUP = Z_J0 + BRANCHES * PITCH + STEM_OFFSET + 4.0;
/** Shamash cup base height. */
export const Z_SHAMASH = Z_CUP + SHAMASH_LIFT;
/** Top knop of a branch: distance back from the branch end (along its axis), under the cup axis. */
export const TOP_KNOP_BACK = 16.0;
/** Rod axis height: through the centres of the top knops (and the top stem bulb). */
export const Z_ROD = Z_CUP - 4.0 - TOP_KNOP_BACK / Math.SQRT2;
/** Cup axis offset from the branch end, so the cup sits over the top knop. */
export const CUP_SHIFT = TOP_KNOP_BACK / Math.SQRT2;
/** Rod half-length before the flush trim at the outer top knop. */
export const X_ROD = BRANCHES * PITCH + STEM_OFFSET + 16.0;
