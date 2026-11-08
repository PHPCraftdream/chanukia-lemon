// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { IDENTITY, MIRROR_X, decodeScene, encodeScene } from '../src/scene-pack.ts';
import type { PackedFile, PackedInstance } from '../src/scene-pack.ts';

describe('scene-pack', () => {
  it('round-trips meshes, instances and files', () => {
    const meshes = [
      {
        name: 'a',
        positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
        indices: new Uint32Array([0, 1, 2]),
      },
      {
        name: 'b',
        positions: new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2]),
        indices: new Uint32Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2]),
      },
    ];
    const instances: PackedInstance[] = [
      { id: 'a_R', mesh: 0, matrix: IDENTITY, color: '#fff', printFile: 'a.stl', explode: [1, 0, 0] },
      { id: 'a_L', mesh: 0, matrix: MIRROR_X, color: '#fff', printFile: 'a.stl', explode: [-1, 0, 0] },
    ];
    const files: PackedFile[] = [
      { file: 'a.stl', qty: 2, size: [1, 1, 0], volumeCm3: 0, mesh: 0, printMatrix: IDENTITY },
      { file: 'b.stl', qty: 1, size: [2, 2, 2], volumeCm3: 0, mesh: 1, printMatrix: MIRROR_X },
    ];
    const { header, meshes: out } = decodeScene(encodeScene(meshes, instances, files));
    assert.equal(header.version, 1);
    assert.deepEqual(header.instances, instances);
    assert.deepEqual(header.files, files);
    assert.deepEqual(
      header.meshes.map((m) => m.name),
      ['a', 'b'],
    );
    meshes.forEach((m, i) => {
      assert.deepEqual(out[i].positions, m.positions);
      assert.deepEqual(out[i].indices, m.indices);
    });
  });

  it('rejects foreign data', () => {
    assert.throws(() => decodeScene(new Uint8Array([1, 2, 3, 4, 0, 0, 0, 0])), /not a scene package/);
  });
});
