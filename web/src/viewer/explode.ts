// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Staged exploded view, in the real disassembly order: first only the joined stiffening rod
 * slides out of the top knops to one side (everything else stays put), then the rest comes
 * apart while the rod rises over it, and last the rod halves part.
 *
 * @module
 */
import type { PackedInstance } from '../../../src/scene-pack.ts';

type V3 = [number, number, number];

/** End of the first stage (the rod sliding out), as a share of the slider. */
const SLIDE_END = 0.3;
/** End of the second stage (everything coming apart); the rod halves part after it. */
const EXPLODE_END = 0.8;
/** Second-stage distance at full explode, mm along each part's direction. */
const EXPLODE_MAX = 110;

/** Smooth start and stop within a stage. */
const ease = (x: number): number => x * x * (3 - 2 * x);
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
/** Linear progress of the stage `[a, b]` at slider position `s`. */
const progress = (s: number, a: number, b: number): number => clamp01((s - a) / (b - a));
const ZERO: V3 = [0, 0, 0];

/** Point at progress `t` along waypoints `path` from the origin, equal share and easing per leg. */
function along(path: readonly V3[], t: number): V3 {
  const x = t * path.length;
  const i = Math.min(path.length - 1, Math.floor(x));
  const k = ease(clamp01(x - i));
  const from = i > 0 ? path[i - 1] : ZERO;
  const to = path[i];
  return [0, 1, 2].map((c) => from[c] + (to[c] - from[c]) * k) as V3;
}

/**
 * Offset of a part copy at explode amount `s` (0 = assembled, 1 = fully exploded).
 */
export function explodeOffset(
  info: Pick<PackedInstance, 'explode' | 'slide' | 'path' | 'split'>,
  s: number,
): V3 {
  const slide = info.slide ?? ZERO;
  const split = info.split ?? ZERO;
  const k1 = ease(progress(s, 0, SLIDE_END));
  const t2 = progress(s, SLIDE_END, EXPLODE_END);
  const k3 = ease(progress(s, EXPLODE_END, 1));
  const second = info.path?.length ? along(info.path, t2) : ZERO;
  const k2 = ease(t2) * EXPLODE_MAX;
  return [0, 1, 2].map((c) => slide[c] * k1 + info.explode[c] * k2 + second[c] + split[c] * k3) as V3;
}
