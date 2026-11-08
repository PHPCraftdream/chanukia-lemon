// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Verify the standalone viewer page: no external resources, and the embedded scene
 * reproduces every print STL (same bounding box after applying its print matrix).
 *
 * Usage: `node src/tools/check-standalone.ts [out_dir]`
 *
 * @module
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { OUT_DIR, STANDALONE_FILE } from '../paths.ts';
import { DATA_ELEMENT_ID, decodeScene } from '../scene-pack.ts';
import type { Mat4, MeshData } from '../scene-pack.ts';
import { readStl, stats } from '../stl.ts';

/** Bounding box tolerance, mm. */
const BOX_TOL = 0.01;
/**
 * Tags that would load something from outside the page. Inline `data:` sources and links
 * such as rel=canonical are fine.
 */
const EXTERNAL =
  /<(script|img|iframe|source|video|audio)\b[^>]*\bsrc\s*=\s*"(?!data:)|<link\b(?=[^>]*\brel="(stylesheet|preload|modulepreload|icon|manifest)")(?![^>]*\bhref="data:)[^>]*>/i;

function boundsAfter({ positions }: MeshData, m: Mat4): { min: number[]; max: number[] } {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    const [x, y, z] = [positions[i], positions[i + 1], positions[i + 2]];
    for (let k = 0; k < 3; k++) {
      const v = m[k] * x + m[4 + k] * y + m[8 + k] * z + m[12 + k];
      min[k] = Math.min(min[k], v);
      max[k] = Math.max(max[k], v);
    }
  }
  return { min, max };
}

const maxAbsDiff = (a: readonly number[], b: readonly number[]): number =>
  Math.max(...a.map((v, k) => Math.abs(v - b[k])));

function main(outDir: string): boolean {
  const html = readFileSync(join(outDir, STANDALONE_FILE), 'utf8');
  let ok = true;
  const external = html.match(EXTERNAL);
  if (external) {
    console.log(`EXTERNAL resource: ${external[0]}`);
    ok = false;
  }
  const re = new RegExp(`<script id="${DATA_ELEMENT_ID}"[^>]*>([^<]*)</script>`);
  const b64 = re.exec(html)?.[1];
  if (!b64) {
    console.log('no embedded scene');
    return false;
  }
  const { header, meshes } = decodeScene(gunzipSync(Buffer.from(b64, 'base64')));
  console.log(`embedded scene: ${header.meshes.length} meshes, ${header.instances.length} instances`);
  for (const f of header.files) {
    const ref = stats(readStl(join(outDir, f.file)));
    const got = boundsAfter(meshes[f.mesh], f.printMatrix);
    const d = Math.max(maxAbsDiff(ref.min, got.min), maxAbsDiff(ref.max, got.max));
    const same = d <= BOX_TOL;
    ok &&= same;
    console.log(`${same ? 'same' : 'DIFF'} ${f.file.padEnd(30)} bbox max diff ${d.toFixed(4)} mm`);
  }
  return ok;
}

process.exit(main(process.argv[2] ?? OUT_DIR) ? 0 : 1);
