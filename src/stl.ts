// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Binary STL I/O and basic mesh statistics.
 *
 * @module
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { STL_HEADER } from './credits.ts';
import type { Manifold, Vec3 } from './geom.ts';

/** Indexed triangle mesh. */
export interface Mesh {
  /** xyz per vertex. */
  pos: Float32Array;
  /** Three vertex indices per triangle (counter-clockwise from outside). */
  tri: Uint32Array;
}

/** Summary of a closed mesh. */
export interface MeshStats {
  /** mm³ */
  volume: number;
  min: Vec3;
  max: Vec3;
  size: Vec3;
  /** Every directed edge has exactly one opposite edge. */
  watertight: boolean;
  triangles: number;
}

const HEADER_BYTES = 80;
const STL_TRI_BYTES = 50;

/** Extract the triangle mesh of a solid. */
export function meshOf(m: Manifold): Mesh {
  const mesh = m.getMesh();
  const n = mesh.vertProperties.length / mesh.numProp;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) pos[i * 3 + k] = mesh.vertProperties[i * mesh.numProp + k];
  }
  return { pos, tri: mesh.triVerts };
}

const vertex = (pos: Float32Array, i: number): Vec3 => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];

function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n: Vec3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const l = Math.hypot(...n) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}

/** Write a binary STL; the header carries the author attribution by default. */
export function writeStl(path: string, { pos, tri }: Mesh, header = STL_HEADER): void {
  const nt = tri.length / 3;
  const buf = Buffer.alloc(HEADER_BYTES + 4 + nt * STL_TRI_BYTES);
  buf.write(header.slice(0, HEADER_BYTES), 0, 'ascii');
  buf.writeUInt32LE(nt, HEADER_BYTES);
  let o = HEADER_BYTES + 4;
  for (let t = 0; t < nt; t++) {
    const a = vertex(pos, tri[t * 3]);
    const b = vertex(pos, tri[t * 3 + 1]);
    const c = vertex(pos, tri[t * 3 + 2]);
    for (const f of [...faceNormal(a, b, c), ...a, ...b, ...c]) {
      buf.writeFloatLE(f, o);
      o += 4;
    }
    buf.writeUInt16LE(0, o);
    o += 2;
  }
  writeFileSync(path, buf);
}

/** Read a binary STL into indexed form (vertices welded by exact position). */
export function readStl(path: string): Mesh {
  const buf = readFileSync(path);
  const nt = buf.readUInt32LE(HEADER_BYTES);
  const index = new Map<string, number>();
  const pos: number[] = [];
  const tri = new Uint32Array(nt * 3);
  for (let t = 0; t < nt; t++) {
    for (let k = 0; k < 3; k++) {
      const o = HEADER_BYTES + 4 + t * STL_TRI_BYTES + 12 + k * 12;
      const p = [buf.readFloatLE(o), buf.readFloatLE(o + 4), buf.readFloatLE(o + 8)];
      const key = p.join(',');
      let idx = index.get(key);
      if (idx === undefined) {
        idx = pos.length / 3;
        index.set(key, idx);
        pos.push(...p);
      }
      tri[t * 3 + k] = idx;
    }
  }
  return { pos: Float32Array.from(pos), tri };
}

/** Signed volume of the tetrahedron (origin, a, b, c). */
const tetVolume = (a: Vec3, b: Vec3, c: Vec3): number =>
  (a[0] * (b[1] * c[2] - b[2] * c[1]) -
    a[1] * (b[0] * c[2] - b[2] * c[0]) +
    a[2] * (b[0] * c[1] - b[1] * c[0])) /
  6;

/** Volume, bounding box and watertightness of a mesh. */
export function stats({ pos, tri }: Mesh): MeshStats {
  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], pos[i + k]);
      max[k] = Math.max(max[k], pos[i + k]);
    }
  }
  let volume = 0;
  const edges = new Map<string, number>();
  const addEdge = (x: number, y: number): void => {
    const key = `${x}_${y}`;
    edges.set(key, (edges.get(key) ?? 0) + 1);
  };
  for (let t = 0; t < tri.length; t += 3) {
    const [a, b, c] = [tri[t], tri[t + 1], tri[t + 2]];
    volume += tetVolume(vertex(pos, a), vertex(pos, b), vertex(pos, c));
    addEdge(a, b);
    addEdge(b, c);
    addEdge(c, a);
  }
  let watertight = true;
  for (const [key, n] of edges) {
    const [x, y] = key.split('_');
    if (n !== 1 || edges.get(`${y}_${x}`) !== 1) {
      watertight = false;
      break;
    }
  }
  const size: Vec3 = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  return { volume, min, max, size, watertight, triangles: tri.length / 3 };
}

const fixed1 = (v: number): string => v.toFixed(1);

/** One-line summary for logs. */
export const describe = (name: string, s: MeshStats): string =>
  `${name}: watertight=${s.watertight} vol=${(s.volume / 1000).toFixed(1)} cm3 ` +
  `size=${s.size.map(fixed1).join('x')} mm`;
