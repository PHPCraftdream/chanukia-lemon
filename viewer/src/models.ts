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
import { DATA_ELEMENT_ID, decodeScene } from '../../src/scene-pack.ts';
import type { MeshData, PackedFile, PackedInstance, SceneHeader } from '../../src/scene-pack.ts';

/** Scene package URL on the dev server (see rspack.config.ts). */
const DATA_URL = 'data/viewer-data.bin';
const PRINT_COLOR = 0xb9a06a;
/** Spacing between parts in the print layout, mm. */
const PRINT_GAP = 25;

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

/** Flat-shaded geometry (STL-like look) from an indexed mesh. */
function geometryOf({ positions, indices }: MeshData): THREE.BufferGeometry {
  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  indexed.setIndex(new THREE.BufferAttribute(indices, 1));
  const flat = indexed.toNonIndexed();
  indexed.dispose();
  flat.computeVertexNormals();
  return flat;
}

export async function loadScene(): Promise<Scene> {
  const { header, meshes } = decodeScene(await gunzip(await packageBytes()));
  return { header, geometries: meshes.map(geometryOf) };
}

const material = (color: THREE.ColorRepresentation): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.45, side: THREE.DoubleSide });

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

function sizeOf(p: Placed<PackedFile>): THREE.Vector3 {
  p.root.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(p.mesh).getSize(new THREE.Vector3());
}
const byLengthDesc = (a: Placed<PackedFile>, b: Placed<PackedFile>): number => sizeOf(b).x - sizeOf(a).x;

/** Print-shop files in print orientation, longest first, stacked along Y and centred. */
export function printSetOf({ header, geometries }: Scene): {
  group: THREE.Group;
  items: Placed<PackedFile>[];
} {
  const items = header.files.map((f) => place(geometries[f.mesh], f.printMatrix, PRINT_COLOR, f));
  const group = new THREE.Group();
  let y = 0;
  for (const item of [...items].sort(byLengthDesc)) {
    const size = sizeOf(item);
    item.root.position.set(-size.x / 2, y, 0);
    y += size.y + PRINT_GAP;
    group.add(item.root);
  }
  group.position.set(0, -y / 2, 0);
  return { group, items };
}
