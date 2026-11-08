// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { STL_HEADER } from '../src/credits.ts';
import { Manifold } from '../src/geom.ts';
import { meshOf, readStl, stats, writeStl } from '../src/stl.ts';

const dir = mkdtempSync(join(tmpdir(), 'chanukia-stl-'));
after(() => rmSync(dir, { recursive: true, force: true }));

describe('stl', () => {
  it('writes and reads back a closed mesh with correct volume and bounds', () => {
    const path = join(dir, 'cube.stl');
    writeStl(path, meshOf(Manifold.cube([10, 20, 5])));
    const s = stats(readStl(path));
    assert.ok(Math.abs(s.volume - 1000) < 1e-3);
    assert.deepEqual(s.size, [10, 20, 5]);
    assert.equal(s.watertight, true);
    assert.equal(s.triangles, 12);
  });

  it('stores the author attribution in the header', () => {
    const path = join(dir, 'header.stl');
    writeStl(path, meshOf(Manifold.cube([1, 1, 1])));
    const header = readFileSync(path).subarray(0, 80).toString('ascii');
    assert.ok(header.startsWith(STL_HEADER));
    assert.ok(STL_HEADER.length <= 80);
    assert.match(STL_HEADER, /PHPCraftdream/);
  });

  it('detects a hole in the mesh', () => {
    const mesh = meshOf(Manifold.cube([1, 1, 1]));
    const open = { pos: mesh.pos, tri: mesh.tri.slice(3) }; // drop one triangle
    assert.equal(stats(open).watertight, false);
  });
});
