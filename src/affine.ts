// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Recover the affine transform between two copies of the same mesh (same vertex order),
 * e.g. a part in assembled position and in print orientation.
 *
 * @module
 */
import type { Mat4 } from './scene-pack.ts';

/** Max allowed deviation of any vertex after applying the recovered transform, mm. */
const MAX_ERROR = 1e-3;

type Row4 = [number, number, number, number];

/** Solve a 4×4 linear system by Gaussian elimination with partial pivoting; null if singular. */
function solve4(a: Row4[], b: number[]): number[] | null {
  const m = a.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < 4; c++) {
    let p = c;
    for (let r = c + 1; r < 4; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    if (Math.abs(m[p][c]) < 1e-9) return null;
    [m[c], m[p]] = [m[p], m[c]];
    for (let r = 0; r < 4; r++) {
      if (r === c) continue;
      const f = m[r][c] / m[c][c];
      for (let k = c; k < 5; k++) m[r][k] -= f * m[c][k];
    }
  }
  return m.map((row, i) => row[4] / row[i]);
}

type V3 = [number, number, number];

const at = (p: Float32Array, i: number): V3 => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Index of the vertex maximising `score`. */
function argmax(p: Float32Array, score: (v: V3) => number): number {
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < p.length / 3; i++) {
    const s = score(at(p, i));
    if (s > bestScore) [best, bestScore] = [i, s];
  }
  return best;
}

/**
 * Four well-spread, non-coplanar vertices: the farthest from vertex 0, the farthest from
 * it, the farthest from their line, the farthest from their plane.
 */
function spreadIndices(p: Float32Array): number[] {
  const v0 = at(p, 0);
  const a = argmax(p, (v) => dot(sub(v, v0), sub(v, v0)));
  const pa = at(p, a);
  const b = argmax(p, (v) => dot(sub(v, pa), sub(v, pa)));
  const ab = sub(at(p, b), pa);
  const c = argmax(p, (v) => {
    const n = cross(ab, sub(v, pa));
    return dot(n, n);
  });
  const normal = cross(ab, sub(at(p, c), pa));
  const d = argmax(p, (v) => Math.abs(dot(normal, sub(v, pa))));
  return [a, b, c, d];
}

/** Apply a column-major affine matrix to vertex i of `p`. */
const applyAt = (mat: Mat4, p: Float32Array, i: number, k: number): number =>
  mat[k] * p[i * 3] + mat[4 + k] * p[i * 3 + 1] + mat[8 + k] * p[i * 3 + 2] + mat[12 + k];

/**
 * Matrix M with `to = M · from` for every vertex. Throws if the meshes are not related
 * by an affine transform with identical vertex order.
 */
export function recoverAffine(from: Float32Array, to: Float32Array): Mat4 {
  if (from.length !== to.length) throw new Error('meshes differ in vertex count');
  const idx = spreadIndices(from);
  const rows = idx.map((i): Row4 => [from[i * 3], from[i * 3 + 1], from[i * 3 + 2], 1]);
  const mat: Mat4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
  for (let k = 0; k < 3; k++) {
    const c = solve4(
      rows,
      idx.map((i) => to[i * 3 + k]),
    );
    if (!c) throw new Error('degenerate reference vertices');
    [mat[k], mat[4 + k], mat[8 + k], mat[12 + k]] = c;
  }
  let worst = 0;
  for (let i = 0; i < from.length / 3; i++) {
    for (let k = 0; k < 3; k++) worst = Math.max(worst, Math.abs(applyAt(mat, from, i, k) - to[i * 3 + k]));
  }
  if (worst > MAX_ERROR)
    throw new Error(`meshes are not affinely related (max error ${worst.toFixed(4)} mm)`);
  return mat;
}
