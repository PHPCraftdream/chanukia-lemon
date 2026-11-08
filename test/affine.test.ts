// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { recoverAffine } from '../src/affine.ts';
import type { Mat4 } from '../src/scene-pack.ts';

/** Deterministic pseudo-random points (no Math.random in tests). */
function points(n: number): Float32Array {
  const p = new Float32Array(n * 3);
  let s = 12345;
  for (let i = 0; i < p.length; i++) {
    s = (s * 1103515245 + 12345) % 2 ** 31;
    p[i] = (s / 2 ** 31) * 200 - 100;
  }
  return p;
}

function apply(m: Mat4, p: Float32Array): Float32Array {
  const out = new Float32Array(p.length);
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      out[i + k] = m[k] * p[i] + m[4 + k] * p[i + 1] + m[8 + k] * p[i + 2] + m[12 + k];
    }
  }
  return out;
}

/** Rotation by 30° about Z, then about X by 90°, plus a translation (column-major). */
const c = Math.cos(Math.PI / 6);
const s = Math.sin(Math.PI / 6);
const RIGID: Mat4 = [c, 0, s, 0, -s, 0, c, 0, 0, -1, 0, 0, 10, -20, 30, 1];

describe('recoverAffine', () => {
  it('recovers a rigid transform', () => {
    const from = points(500);
    const got = recoverAffine(from, apply(RIGID, from));
    got.forEach((v, i) => assert.ok(Math.abs(v - RIGID[i]) < 1e-4, `m[${i}] = ${v}, expected ${RIGID[i]}`));
  });

  it('recovers a mirror', () => {
    const mirror: Mat4 = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const from = points(100);
    const got = recoverAffine(from, apply(mirror, from));
    got.forEach((v, i) => assert.ok(Math.abs(v - mirror[i]) < 1e-5));
  });

  it('handles flat (coplanar-looking) shapes with a few off-plane vertices', () => {
    const from = points(200);
    for (let i = 2; i < from.length - 3; i += 3) from[i] = 0; // all but the last vertex on z = 0
    const got = recoverAffine(from, apply(RIGID, from));
    got.forEach((v, i) => assert.ok(Math.abs(v - RIGID[i]) < 1e-3));
  });

  it('rejects meshes that are not affinely related', () => {
    const from = points(100);
    const to = apply(RIGID, from);
    to[150] += 1; // one vertex off by 1 mm
    assert.throws(() => recoverAffine(from, to), /not affinely related/);
  });

  it('rejects different vertex counts', () => {
    assert.throws(() => recoverAffine(points(10), points(11)), /vertex count/);
  });
});
