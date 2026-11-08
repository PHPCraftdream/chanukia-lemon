// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Compact binary package of the scene for the viewer: every unique part mesh once
 * (indexed, float32 positions + uint32 indices) plus 4×4 matrices placing it in the
 * assembly (right / mirrored left copy) and in print orientation.
 *
 * Layout: `"HNK1"` · uint32 header length · UTF-8 JSON header · zero padding to 4 bytes ·
 * binary blobs (offsets in the header are relative to the start of the blobs).
 * The build gzips the whole package; this module is runtime-agnostic (Node and browser).
 *
 * @module
 */

/** Column-major 4×4 matrix (three.js `Matrix4.fromArray` order). */
export type Mat4 = number[];

export const IDENTITY: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
/** Mirror across the YZ plane (right half -> left half). */
export const MIRROR_X: Mat4 = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** A unique part mesh. */
export interface PackedMesh {
  name: string;
  /** Byte offset of float32 xyz positions. */
  positionsOffset: number;
  vertexCount: number;
  /** Byte offset of uint32 triangle indices. */
  indicesOffset: number;
  triangleCount: number;
}

/** A part copy in the assembly. */
export interface PackedInstance {
  id: string;
  /** Index into `meshes`. */
  mesh: number;
  /** World matrix of the copy (identity or mirror). */
  matrix: Mat4;
  /** CSS colour. */
  color: string;
  /** Print-shop file this copy is printed from. */
  printFile: string;
  /** Direction for the exploded view. */
  explode: [number, number, number];
}

/** A file for the print shop. */
export interface PackedFile {
  file: string;
  qty: number;
  /** Bounding box size in print orientation, mm. */
  size: number[];
  volumeCm3: number;
  /** Index into `meshes`. */
  mesh: number;
  /** Matrix from assembled position to print orientation. */
  printMatrix: Mat4;
}

export interface SceneHeader {
  version: 1;
  meshes: PackedMesh[];
  instances: PackedInstance[];
  files: PackedFile[];
}

/** Decoded mesh data. */
export interface MeshData {
  positions: Float32Array;
  indices: Uint32Array;
}

/** Id of the element carrying the base64 package in the standalone page. */
export const DATA_ELEMENT_ID = 'hanukia-data';

const MAGIC = 'HNK1';
const align4 = (n: number): number => (n + 3) & ~3;

/** Input mesh for {@link encodeScene}. */
export interface MeshInput {
  name: string;
  positions: Float32Array;
  indices: Uint32Array;
}

/** Serialise meshes and the header (whose mesh entries are filled in here). */
export function encodeScene(
  meshes: readonly MeshInput[],
  instances: PackedInstance[],
  files: PackedFile[],
): Uint8Array {
  let offset = 0;
  const packed: PackedMesh[] = meshes.map((m) => {
    const positionsOffset = offset;
    offset += m.positions.byteLength;
    const indicesOffset = offset;
    offset += m.indices.byteLength;
    return {
      name: m.name,
      positionsOffset,
      vertexCount: m.positions.length / 3,
      indicesOffset,
      triangleCount: m.indices.length / 3,
    };
  });
  const header: SceneHeader = { version: 1, meshes: packed, instances, files };
  const json = new TextEncoder().encode(JSON.stringify(header));
  const blobStart = align4(8 + json.length);
  const out = new Uint8Array(blobStart + offset);
  out.set(new TextEncoder().encode(MAGIC), 0);
  new DataView(out.buffer).setUint32(4, json.length, true);
  out.set(json, 8);
  meshes.forEach((m, i) => {
    out.set(
      new Uint8Array(m.positions.buffer, m.positions.byteOffset, m.positions.byteLength),
      blobStart + packed[i].positionsOffset,
    );
    out.set(
      new Uint8Array(m.indices.buffer, m.indices.byteOffset, m.indices.byteLength),
      blobStart + packed[i].indicesOffset,
    );
  });
  return out;
}

/** Parse a (decompressed) package. Mesh arrays are copies, safe to keep. */
export function decodeScene(bytes: Uint8Array): { header: SceneHeader; meshes: MeshData[] } {
  const magic = new TextDecoder().decode(bytes.subarray(0, 4));
  if (magic !== MAGIC) throw new Error(`not a scene package (magic "${magic}")`);
  const jsonLength = new DataView(bytes.buffer, bytes.byteOffset).getUint32(4, true);
  const header = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + jsonLength))) as SceneHeader;
  const blobs = bytes.byteOffset + align4(8 + jsonLength);
  const copy = bytes.buffer.slice(blobs, bytes.byteOffset + bytes.byteLength);
  const meshes = header.meshes.map((m) => ({
    positions: new Float32Array(copy, m.positionsOffset, m.vertexCount * 3),
    indices: new Uint32Array(copy, m.indicesOffset, m.triangleCount * 3),
  }));
  return { header, meshes };
}
