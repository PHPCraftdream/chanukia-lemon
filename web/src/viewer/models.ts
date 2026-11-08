// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Loading the packed scene (embedded in the standalone page, or fetched from the dev
 * server) and turning it into three.js objects: the assembly (one object per part copy)
 * and the print set (one object per print-shop file, laid out side by side).
 *
 * @module
 */
import * as THREE from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { DATA_ELEMENT_ID, decodeScene } from '../../../src/scene-pack.ts';
import type { MeshData, PackedFile, PackedInstance, SceneHeader } from '../../../src/scene-pack.ts';

/** Scene package URL on the dev server (see rspack.config.ts). */
const DATA_URL = 'data/viewer-data.bin';
const PRINT_COLOR = 0xc9a24a;
/** Normals are smoothed across angles below this, kept sharp above (30°). */
const CREASE_ANGLE = Math.PI / 6;
/** Spacing between parts in the print layout, mm. */
const PRINT_GAP = 25;
/** Row width of the print layout, mm. */
const PRINT_ROW = 640;

export interface Scene {
  header: SceneHeader;
  geometries: THREE.BufferGeometry[];
}

/** A placed object: `root` moves (explode / layout), `mesh` carries the fixed matrix. */
export interface Placed<T> {
  root: THREE.Group;
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  info: T;
}

const toCharCode = (c: string): number => c.charCodeAt(0);
const base64ToBytes = (b64: string): Uint8Array => Uint8Array.from(atob(b64.trim()), toCharCode);

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Raw (gzipped) package: embedded if present, otherwise fetched. */
async function packageBytes(): Promise<Uint8Array> {
  const embedded = document.getElementById(DATA_ELEMENT_ID);
  if (embedded?.textContent) return base64ToBytes(embedded.textContent);
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`${DATA_URL}: HTTP ${res.status} — run "npm run build" first`);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Geometry with "creased" normals: smooth across gentle curvature (no visible facets on
 * round surfaces), sharp across edges steeper than {@link CREASE_ANGLE} (cup rims, grooves).
 */
function geometryOf({ positions, indices }: MeshData): THREE.BufferGeometry {
  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  indexed.setIndex(new THREE.BufferAttribute(indices, 1));
  const creased = toCreasedNormals(indexed, CREASE_ANGLE);
  indexed.dispose();
  return creased;
}

export async function loadScene(): Promise<Scene> {
  const { header, meshes } = decodeScene(await gunzip(await packageBytes()));
  return { header, geometries: meshes.map(geometryOf) };
}

/** Polished brass; reflections come from the studio environment set up in stage.ts. */
const material = (color: THREE.ColorRepresentation): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide });

function place<T>(
  geometry: THREE.BufferGeometry,
  matrix: number[],
  color: THREE.ColorRepresentation,
  info: T,
): Placed<T> {
  const mesh = new THREE.Mesh(geometry, material(color));
  mesh.matrixAutoUpdate = false;
  mesh.matrix.fromArray(matrix);
  const root = new THREE.Group();
  root.add(mesh);
  return { root, mesh, info };
}

/** Every part copy in assembled position. */
export const assemblyOf = ({ header, geometries }: Scene): Placed<PackedInstance>[] =>
  header.instances.map((inst) => place(geometries[inst.mesh], inst.matrix, inst.color, inst));

/** Bounding box of a placed part (in its parent's space, without the root offset). */
function boxOf(p: Placed<PackedFile>): THREE.Box3 {
  p.mesh.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(p.mesh);
}
const lengthOf = (p: Placed<PackedFile>): number => boxOf(p).getSize(new THREE.Vector3()).x;
const byLengthDesc = (a: Placed<PackedFile>, b: Placed<PackedFile>): number => lengthOf(b) - lengthOf(a);

/** Every printed copy of a file (`qty` of them). */
const copiesOf =
  (geometries: readonly THREE.BufferGeometry[]) =>
  (f: PackedFile): Placed<PackedFile>[] =>
    Array.from({ length: f.qty }, () => place(geometries[f.mesh], f.printMatrix, PRINT_COLOR, f));

/**
 * Every part to print, as many copies as needed, in print orientation, laid out in rows
 * like on a print bed (longest first, rows up to {@link PRINT_ROW} mm), centred at the origin.
 */
export function printSetOf({ header, geometries }: Scene): {
  group: THREE.Group;
  items: Placed<PackedFile>[];
} {
  const items = header.files.flatMap(copiesOf(geometries));
  const group = new THREE.Group();
  let x = 0;
  let y = 0;
  let rowDepth = 0;
  for (const item of [...items].sort(byLengthDesc)) {
    const box = boxOf(item);
    const size = box.getSize(new THREE.Vector3());
    if (x > 0 && x + size.x > PRINT_ROW) {
      x = 0;
      y += rowDepth + PRINT_GAP;
      rowDepth = 0;
    }
    item.root.position.set(x - box.min.x, y - box.min.y, -box.min.z);
    x += size.x + PRINT_GAP;
    rowDepth = Math.max(rowDepth, size.y);
    group.add(item.root);
  }
  group.updateMatrixWorld(true); // apply the row offsets before measuring
  const centre = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3());
  group.position.set(-centre.x, -centre.y, 0);
  return { group, items };
}
