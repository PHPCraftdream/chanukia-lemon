// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/** Exploded view of the real parts: nothing passes through anything while it comes apart. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PRINT_PARTS } from '../src/assembly.ts';
import type { Manifold } from '../src/geom.ts';
import { mirrorX } from '../src/geom.ts';
import { explodeOffset } from '../web/src/viewer/explode.ts';

/** Slider positions after the rods are out (pins still leaving their sockets at the start). */
const STEPS = [0.45, 0.55, 0.65, 0.8, 1];
/** Overlap allowed between two copies: crush ribs of a pin leaving its socket, mm³. */
const MAX_OVERLAP = 6;

const copies = PRINT_PARTS.flatMap((p) => {
  if (!p.view.length) return [];
  const world = p.world();
  return p.view.map((v) => {
    const placed = v.mirror ? mirrorX(world) : world;
    return { id: v.id, info: v, mesh: v.shift ? placed.translate(v.shift) : placed };
  });
});

const boxesMeet = (a: Manifold, b: Manifold): boolean => {
  const [p, q] = [a.boundingBox(), b.boundingBox()];
  return [0, 1, 2].every((k) => p.min[k] <= q.max[k] && q.min[k] <= p.max[k]);
};

describe('exploded view of the parts', () => {
  for (const s of STEPS) {
    it(`no part passes through another at ${s}`, () => {
      const moved = copies.map((c) => ({ id: c.id, mesh: c.mesh.translate(explodeOffset(c.info, s)) }));
      for (let i = 0; i < moved.length; i++) {
        for (let k = i + 1; k < moved.length; k++) {
          if (!boxesMeet(moved[i].mesh, moved[k].mesh)) continue;
          const v = moved[i].mesh.intersect(moved[k].mesh).volume();
          assert.ok(v <= MAX_OVERLAP, `${moved[i].id} and ${moved[k].id} overlap by ${v.toFixed(1)} mm3`);
        }
      }
    });
  }
});
