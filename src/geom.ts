// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Manifold WASM initialisation, memory tracking and small geometry primitives.
 *
 * Every Manifold / CrossSection created through the API is tracked; call {@link cleanup}
 * after a part's mesh has been extracted to free WASM memory.
 *
 * @module
 */
import Module from 'manifold-3d';
import { SEG } from './params.ts';

const wasm = await Module();
wasm.setup();

/** A solid. */
export type Manifold = InstanceType<typeof wasm.Manifold>;
/** A 2D region. */
export type CrossSection = InstanceType<typeof wasm.CrossSection>;
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

interface Deletable {
  delete(): void;
}

// manifold-3d's own garbage-collector helper drops `this` on member calls, hence our own.
const registry: Deletable[] = [];

const isDeletable = (o: unknown): o is Deletable =>
  typeof o === 'object' && o !== null && typeof (o as Deletable).delete === 'function';

function track<T>(obj: T): T {
  if (Array.isArray(obj)) obj.forEach(track);
  else if (isDeletable(obj)) registry.push(obj);
  return obj;
}

/** API calls returning new WASM objects. */
const STATIC_FNS = [
  'cube',
  'cylinder',
  'sphere',
  'extrude',
  'revolve',
  'union',
  'difference',
  'intersection',
  'ofMesh',
  'hull',
  'ofPolygons',
  'square',
  'circle',
  'compose',
];
const MEMBER_FNS = [
  'add',
  'subtract',
  'intersect',
  'warp',
  'warpBatch',
  'transform',
  'translate',
  'rotate',
  'scale',
  'mirror',
  'refine',
  'refineToLength',
  'simplify',
  'trimByPlane',
  'split',
  'splitByPlane',
  'slice',
  'project',
  'hull',
  'offset',
  'decompose',
  'asOriginal',
];

type AnyFn = (...args: unknown[]) => unknown;
type Patchable = Record<string, unknown> & { prototype: Record<string, unknown> };

function trackClass(cls: Patchable): void {
  for (const name of STATIC_FNS) {
    const fn = cls[name];
    if (typeof fn === 'function') cls[name] = (...a: unknown[]) => track((fn as AnyFn).apply(cls, a));
  }
  for (const name of MEMBER_FNS) {
    const fn = cls.prototype[name];
    if (typeof fn === 'function') {
      cls.prototype[name] = function (this: unknown, ...a: unknown[]) {
        return track((fn as AnyFn).apply(this, a));
      };
    }
  }
}
trackClass(wasm.Manifold as unknown as Patchable);
trackClass(wasm.CrossSection as unknown as Patchable);

/** Manifold class (calls are tracked). */
export const Manifold = wasm.Manifold;

/** Tracked constructor wrapper for CrossSection. */
export function crossSection(polys: Vec2[][]): CrossSection {
  return track(new wasm.CrossSection(polys, 'Positive'));
}

/** Free all WASM objects created since the last cleanup. */
export function cleanup(): void {
  for (const o of registry) {
    try {
      o.delete();
    } catch {
      // already freed
    }
  }
  registry.length = 0;
}

/** Boolean union of many solids. */
export const union = (parts: Manifold[]): Manifold => Manifold.union(parts);

/** Solid of revolution around Z from a counter-clockwise (r, z) profile. */
export const revolve = (profile: Vec2[], seg = SEG): Manifold =>
  Manifold.revolve(crossSection([profile]), seg);

/** Prism extruded along +Z from a counter-clockwise XY polygon. */
export const extrude = (poly: Vec2[], h: number): Manifold => Manifold.extrude(crossSection([poly]), h);

/** Cylinder along Z from z = t0 to t1. */
export const cyl = (t0: number, t1: number, r: number, seg = SEG): Manifold =>
  Manifold.cylinder(t1 - t0, r, r, seg).translate([0, 0, t0]);

/** Ellipsoid centred at the origin. */
export const ellipsoid = (rx: number, ry: number, rz: number, seg = SEG): Manifold =>
  Manifold.sphere(1, seg).scale([rx, ry, rz]);

/** Axis-aligned box between two corners. */
export const box = (lo: Vec3, hi: Vec3): Manifold =>
  Manifold.cube([hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]]).translate(lo);

/** Mirror across the YZ plane (right half -> left half). */
export const mirrorX = (m: Manifold): Manifold => m.mirror([1, 0, 0]);

/** Translate so that min x = 0, min z = 0 and the part is centred on y (print bed placement). */
export function ground(m: Manifold): Manifold {
  const { min, max } = m.boundingBox();
  return m.translate([-min[0], -(min[1] + max[1]) / 2, -min[2]]);
}

/** n evenly spaced numbers from a to b inclusive. */
export const linspace = (a: number, b: number, n: number): number[] =>
  Array.from({ length: n }, (_, i) => (n === 1 ? a : a + ((b - a) * i) / (n - 1)));

/** n angles (degrees) evenly spaced around a circle, starting at `phase`. */
export const evenAngles = (n: number, phase = 0): number[] =>
  Array.from({ length: n }, (_, k) => phase + (k * 360) / n);

/** Copies of a solid rotated around Z to the given angles (degrees), unioned. */
export const ringAround = (m: Manifold, anglesDeg: readonly number[]): Manifold =>
  union(anglesDeg.map((a) => m.rotate([0, 0, a])));
