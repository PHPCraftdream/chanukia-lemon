// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Camera presets for the gallery, in model coordinates (mm, Z up, front faces −Y).
 *
 * Reference points (from src/params.ts and src/layout.ts with the default parameters):
 * row cups at x = 68.7, 128.7, 188.7, 248.7 (right half), cup base z = 348, rim z = 364;
 * shamash cup base z = 398; stem junctions z = 264, 204, 144, 84; knop rows
 * z = 332.7 (balls under the cups), 272.7, 212.7, 152.7; a knop of branch j on row z sits
 * at x = z − junction(j).
 *
 * @module
 */
import type { Key } from '../dict.ts';

type V3 = [number, number, number];

export interface Shot {
  /** Caption key. */
  key: Key;
  position: V3;
  target: V3;
  /** Vertical field of view, degrees. */
  fov: number;
  /** Explode amount: 0 = assembled, 1 = fully exploded (see viewer/explode.ts). */
  explode?: number;
}

export const SHOTS: readonly Shot[] = [
  { key: 'shot.overview', position: [390, -740, 510], target: [0, 0, 215], fov: 30 },
  { key: 'shot.front', position: [0, -1060, 225], target: [0, 0, 212], fov: 28 },
  { key: 'shot.cups', position: [280, -330, 440], target: [158, 0, 350], fov: 30 },
  { key: 'shot.grooves', position: [150, -70, 520], target: [128.7, 0, 357], fov: 22 },
  { key: 'shot.knop', position: [150, -200, 235], target: [110, 0, 195], fov: 30 },
  { key: 'shot.junction', position: [70, -190, 260], target: [0, 0, 214], fov: 30 },
  { key: 'shot.shamash', position: [80, -210, 470], target: [0, 0, 392], fov: 28 },
  { key: 'shot.flames', position: [60, -230, 345], target: [0, 0, 330], fov: 30 },
  { key: 'shot.exploded', position: [640, -1380, 860], target: [0, 0, 300], fov: 30, explode: 1 },
];
