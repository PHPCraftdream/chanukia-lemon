// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Build all printable parts and the packed scene for the viewer.
 *
 * Usage: `node src/build.ts [out_dir]` (default `out_chabad`)
 *
 * - `<out>/chabad_*.stl` — files for the print shop (print orientation)
 * - `<out>/chabad_full.stl` — the assembled hanukkiah as one solid
 * - `<out>/viewer-data.bin` — gzipped scene package for the viewer (see scene-pack.ts)
 *
 * @module
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { recoverAffine } from './affine.ts';
import { PRINT_PARTS, fullAssembly } from './assembly.ts';
import type { PrintPart } from './assembly.ts';
import { cleanup } from './geom.ts';
import { OUT_DIR, SCENE_FILE } from './paths.ts';
import { IDENTITY, MIRROR_X, encodeScene } from './scene-pack.ts';
import type { MeshInput, PackedFile, PackedInstance } from './scene-pack.ts';
import { describe, meshOf, stats, writeStl } from './stl.ts';
import type { Mesh } from './stl.ts';

const round1 = (v: number): number => Math.round(v * 10) / 10;

/** Build one part, extract its meshes, free WASM memory. */
function buildPart(part: PrintPart): { world: Mesh; print: Mesh } {
  const world = part.world();
  const meshes = { world: meshOf(world), print: meshOf(part.print(world)) };
  cleanup();
  return meshes;
}

function main(outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  const meshes: MeshInput[] = [];
  const instances: PackedInstance[] = [];
  const files: PackedFile[] = [];

  for (const part of PRINT_PARTS) {
    const { world, print } = buildPart(part);
    writeStl(join(outDir, `${part.file}.stl`), print);
    const s = stats(print);
    console.log(describe(part.file, s));

    const mesh = meshes.length;
    meshes.push({ name: part.file, positions: world.pos, indices: world.tri });
    files.push({
      file: `${part.file}.stl`,
      qty: part.qty,
      size: s.size.map(round1),
      volumeCm3: round1(s.volume / 1000),
      mesh,
      printMatrix: recoverAffine(world.pos, print.pos),
    });
    for (const v of part.view) {
      instances.push({
        id: v.id,
        mesh,
        matrix: v.mirror ? MIRROR_X : IDENTITY,
        color: part.color,
        printFile: `${part.file}.stl`,
        explode: v.explode,
        ...(v.slide ? { slide: v.slide } : {}),
      });
    }
  }

  const full = meshOf(fullAssembly());
  cleanup();
  writeStl(join(outDir, 'chabad_full.stl'), full);
  console.log(describe('chabad_full', stats(full)));

  const packed = gzipSync(encodeScene(meshes, instances, files), { level: 9 });
  writeFileSync(join(outDir, SCENE_FILE), packed);
  console.log(`${SCENE_FILE}: ${(packed.length / 1e6).toFixed(1)} MB`);
}

main(process.argv[2] ?? OUT_DIR);
