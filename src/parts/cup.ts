// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Tea-light cups: shared rim/pocket profile and the decorated row cup.
 *
 * @module
 */
import { revolve } from '../geom.ts';
import type { Manifold, Vec2 } from '../geom.ts';
import { decorate } from '../decor.ts';
import { CONE_H, CONE_R0, CUP_H, POCKET_DEPTH, PR, R } from '../params.ts';

/** Upper part of a cup profile (outer wall top, chamfered rim, pocket) for a cup whose rim is at `top`. */
export const cupTopProfile = (top: number): Vec2[] => [
  [R, top - 1],
  [R - 1, top],
  [PR + 1, top],
  [PR, top - 1],
  [PR, top - POCKET_DEPTH],
  [0, top - POCKET_DEPTH],
];

/** Decorated row cup with its 45° under-cone; z = 0 is the cup base, axis Z. */
export const rowCup = (): Manifold =>
  decorate(revolve([[0, -CONE_H], [CONE_R0, -CONE_H], [R, 0], ...cupTopProfile(CUP_H)]), 0.0, CONE_R0);
