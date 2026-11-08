// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Staged exploded view, in the real disassembly order: first only the stiffening rod
 * halves slide out of the cups (everything else stays put), then the rest comes apart.
 *
 * @module
 */
import type { PackedInstance } from '../../../src/scene-pack.ts';

type V3 = [number, number, number];

/** Share of the slider used by the first stage (rods sliding out). */
const SLIDE_SHARE = 0.4;
/** Second-stage distance at full explode, mm along each part's direction. */
const EXPLODE_MAX = 110;

/** Smooth start and stop within a stage. */
const ease = (x: number): number => x * x * (3 - 2 * x);
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

/**
 * Offset of a part copy at explode amount `s` (0 = assembled, 1 = fully exploded).
 */
export function explodeOffset(info: Pick<PackedInstance, 'explode' | 'slide'>, s: number): V3 {
  const slide = info.slide ?? [0, 0, 0];
  const k1 = ease(clamp01(s / SLIDE_SHARE));
  const k2 = ease(clamp01((s - SLIDE_SHARE) / (1 - SLIDE_SHARE))) * EXPLODE_MAX;
  return [
    slide[0] * k1 + info.explode[0] * k2,
    slide[1] * k1 + info.explode[1] * k2,
    slide[2] * k1 + info.explode[2] * k2,
  ];
}
