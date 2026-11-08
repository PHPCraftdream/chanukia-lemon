// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Decoration: laurel wreath, floor grooves, calyx of leaves, leaf rings and
 * flame-tongue reliefs with leaf veins.
 *
 * @module
 */
import { Manifold, ellipsoid, evenAngles, extrude, linspace, revolve, ringAround, union } from './geom.ts';
import type { Vec2, Vec3 } from './geom.ts';
import {
  CUP_H,
  FLAME_EMBED,
  FLAME_RELIEF,
  GROOVE_D,
  GROOVE_RS,
  GROOVE_W,
  POCKET_DEPTH,
  R,
  VEIN_D,
  VEIN_W,
  WREATH_N,
  WREATH_PROUD,
} from './params.ts';

const S2 = Math.SQRT2;

// ---------------------------------------------------------------- wreath

/** Wreath leaf semi-axes: radial (thickness), tangential (length), vertical (width). */
const WREATH_LEAF: Vec3 = [1.2, 4.2, 1.6];
/** Leaf tilt against the horizontal vine (degrees). */
const WREATH_TILT = 35;
/** Vertical offset of the upper / lower leaf from the vine. */
const WREATH_LEAF_DZ = 2.2;
/** Vine: half-round bead radius. */
const VINE_R = 0.7;

/** Laurel relief band around a cup wall (axis Z, centre height `zc`). */
export function wreath(zc: number): Manifold {
  const leaf = Manifold.sphere(1, 20).scale(WREATH_LEAF);
  const vine = revolve(
    linspace(-Math.PI / 2, Math.PI / 2, 12).map((a): Vec2 => [
      R - 0.4 + VINE_R * Math.cos(a),
      zc + VINE_R * Math.sin(a),
    ]),
  );
  const leaves = [1, -1].map((sgn) => {
    const one = leaf
      .rotate([sgn * WREATH_TILT, 0, 0])
      .translate([R + WREATH_PROUD - WREATH_LEAF[0], 0, zc + sgn * WREATH_LEAF_DZ]);
    return ringAround(one, evenAngles(WREATH_N, sgn < 0 ? 180 / WREATH_N : 0));
  });
  return union([vine, ...leaves]);
}

// ---------------------------------------------------------------- floor grooves

/** Concentric V-grooves to subtract from a pocket floor at height `zf`. */
export function floorGrooves(zf: number): Manifold {
  const w = GROOVE_W / 2;
  const groove = (r: number): Manifold =>
    revolve([
      [r - w, zf + 0.01],
      [r, zf - GROOVE_D],
      [r + w, zf + 0.01],
      [r + w, zf + 0.5],
      [r - w, zf + 0.5],
    ]);
  return union(GROOVE_RS.map(groove));
}

// ---------------------------------------------------------------- calyx

/** Calyx leaf thickness semi-axis. */
const CALYX_THICK = 1.6;
const CALYX_N = 14;

interface CalyxLayer {
  /** Long semi-axis relative to half the slope length. */
  extraLength: number;
  /** Width semi-axis. */
  width: number;
  /** Centre position along the slope, relative to its middle (+ = lower). */
  shift: number;
  /** Relief height above the cone. */
  proud: number;
  /** Phase as a fraction of the leaf step. */
  phase: number;
}

const CALYX_LAYERS: readonly CalyxLayer[] = [
  { extraLength: 2.0, width: 3.6, shift: 0, proud: 1.0, phase: 0 },
  { extraLength: -0.5, width: 3.0, shift: 3.0, proud: 1.8, phase: 0.5 },
];

/** Two staggered layers of leaves lying on a 45° under-cone (`coneR0` -> R) up to the cup base `zTop`. */
export function calyx(coneR0: number, zTop: number, n = CALYX_N): Manifold {
  const slope = (R - coneR0) * S2;
  const layers = CALYX_LAYERS.map(({ extraLength, width, shift, proud, phase }) => {
    const fromTop = slope / 2 + shift;
    const sink = (CALYX_THICK - proud) / S2; // along the cone normal
    const leaf = Manifold.sphere(1, 24)
      .scale([CALYX_THICK, width, slope / 2 + extraLength])
      .rotate([0, 45, 0])
      .translate([R - fromTop / S2 - sink, 0, zTop - fromTop / S2 + sink]);
    return ringAround(leaf, evenAngles(n, (phase * 360) / n));
  });
  return union(layers);
}

/** Add calyx and wreath to a cup (base at `z0`, under-cone from `coneR0`) and cut the floor grooves. */
export const decorate = (cup: Manifold, z0: number, coneR0: number): Manifold =>
  union([cup, wreath(z0 + CUP_H / 2), calyx(coneR0, z0)]).subtract(floorGrooves(z0 + CUP_H - POCKET_DEPTH));

// ---------------------------------------------------------------- leaf rings

/** Leaf ring geometry. */
export interface LeafRingSpec {
  /** Distance of the leaf centre from the axis. */
  radial: number;
  /** Centre height along the axis. */
  zc: number;
  length: number;
  width: number;
  thick: number;
  /** Outward tilt (degrees). */
  tilt?: number;
  /** Angles around the axis (degrees); default 6 evenly spaced. */
  angles?: readonly number[];
}

/** Leaves around an axis (Z), hugging the surface when `tilt` is 0. */
export function leafRing({
  radial,
  zc,
  length,
  width,
  thick,
  tilt = 0,
  angles = evenAngles(6),
}: LeafRingSpec): Manifold {
  const leaf = ellipsoid(thick, width, length / 2)
    .rotate([0, tilt, 0])
    .translate([radial, 0, zc]);
  return ringAround(leaf, angles);
}

// ---------------------------------------------------------------- flames

/** Flame sway amplitude relative to its width. */
const FLAME_SWAY = 0.45;
const FLAME_SEGMENTS = 48;
/** Max edge length before wrapping onto the cylinder. */
const FLAME_REFINE = 1.0;
/** Positions (fraction of length) of the side veins. */
const SIDE_VEINS: readonly number[] = [0.25, 0.4, 0.55, 0.7];

/** Prism cutting a vein groove from the flame's top surface. */
const veinCutter = (q: Vec2[]): Manifold => extrude(q, 2.0).translate([0, 0, FLAME_RELIEF - VEIN_D]);

/** Thin quad of width `w` along the segment p0 -> p1. */
function quad([x0, y0]: Vec2, [x1, y1]: Vec2, w: number): Vec2[] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const n = Math.hypot(dx, dy) || 1;
  const ox = ((-dy / n) * w) / 2;
  const oy = ((dx / n) * w) / 2;
  return [
    [x0 - ox, y0 - oy],
    [x1 - ox, y1 - oy],
    [x1 + ox, y1 + oy],
    [x0 + ox, y0 + oy],
  ];
}

/** Wraps flat (u, v, h) onto a cylinder of radius `rb` around Z: u -> arc, v -> z, h -> radial. */
const cylinderWrap =
  (rb: number) =>
  (v: Vec3): void => {
    const theta = v[0] / rb;
    const r = rb + v[2];
    const z = v[1];
    v[0] = r * Math.cos(theta);
    v[1] = r * Math.sin(theta);
    v[2] = z;
  };

/**
 * Flame tongue (tip up, S-sway) with leaf veins, wrapped onto a cylinder of radius `rb`
 * around Z; centred at angle 0, spans `z = 0..length`.
 */
export function flame(
  rb: number,
  length: number,
  width: number,
  sway = FLAME_SWAY,
  nseg = FLAME_SEGMENTS,
): Manifold {
  const centre = (s: number): number => sway * width * Math.sin(1.6 * Math.PI * s) * s;
  const halfWidth = (s: number): number => (width / 2) * Math.sin(Math.PI * s ** 0.6) ** 1.1 * (1 - 0.25 * s);
  const at = (s: number, side: number): Vec2 => [centre(s) + side * halfWidth(s), s * length];

  const ss = linspace(0, 1, nseg + 1);
  const outline = [
    ...ss.map((s) => at(s, 1)),
    ...ss
      .slice(1, -1)
      .reverse()
      .map((s) => at(s, -1)),
  ];
  const body = extrude(outline, FLAME_RELIEF + FLAME_EMBED).translate([0, 0, -FLAME_EMBED]);

  const mid = linspace(0.08, 0.85, 12);
  const veins = mid
    .slice(1)
    .map((s, i) => quad([centre(mid[i]), mid[i] * length], [centre(s), s * length], VEIN_W));
  for (const sv of SIDE_VEINS) {
    const from: Vec2 = [centre(sv), sv * length];
    for (const sg of [1, -1]) {
      veins.push(quad(from, [from[0] + sg * 0.65 * halfWidth(sv), from[1] + 0.12 * length], VEIN_W * 0.8));
    }
  }
  const cut = union(veins.map(veinCutter));
  return body.subtract(cut).refineToLength(FLAME_REFINE).warp(cylinderWrap(rb));
}

/** `n` flames around a cylinder of radius `rb`, from `z0` over `length`; `fill` = share of the circumference. */
export function flameRing(
  rb: number,
  z0: number,
  length: number,
  n: number,
  phase = 0,
  fill = 0.7,
): Manifold {
  const one = flame(rb, length, ((2 * Math.PI * rb) / n) * fill);
  return ringAround(one, evenAngles(n, phase)).translate([0, 0, z0]);
}
