// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assembly review: contacts and clearances, insertion paths, key distances and the
 * weakest stem sections.
 *
 * Usage: `node src/tools/review.ts`
 *
 * @module
 */
import { assembledParts, branchPieceNames } from '../assembly.ts';
import type { Manifold, Vec3 } from '../geom.ts';
import { BRANCH_IDS, FOOT_SPLIT_Z, SHAMASH_SPLIT_Z, STEM_SPLIT_Z, cupX } from '../layout.ts';
import * as P from '../params.ts';
import { stem } from '../parts/stem.ts';

/** Intersections smaller than this are treated as touching faces. */
const EPS_VOL = 0.01;
/** Overlap above the seated baseline that counts as a collision while sliding. */
const COLLISION_VOL = 3;
/** Clearance probes (mm). */
const PROBES: readonly number[] = [0.5, 1.0];
const DIRECTIONS: readonly Vec3[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];
/** Branch insertion axis of the right half. */
const BRANCH_AXIS: Vec3 = [Math.SQRT1_2, 0, Math.SQRT1_2];

const fmt = (v: number): string => v.toFixed(1);
const scale = (d: Vec3, s: number): Vec3 => [d[0] * s, d[1] * s, d[2] * s];
const overlap = (a: Manifold, b: Manifold): number => a.intersect(b).volume();
const range = (from: number, to: number, step: number): number[] =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
const byArea = (a: [number, number], b: [number, number]): number => a[1] - b[1];

type Box = ReturnType<Manifold['boundingBox']>;
const boxesNear = (a: Box, b: Box, pad: number): boolean =>
  [0, 1, 2].every((k) => a.min[k] - pad <= b.max[k] && b.min[k] - pad <= a.max[k]);

const parts = assembledParts();
const names = Object.keys(parts);
const boxes = Object.fromEntries(names.map((n) => [n, parts[n].boundingBox()]));

/** Contacts of seated parts (rib crush) and clearances below 1 mm for the rest. */
function contactsAndClearances(): void {
  console.log('== 1. Contacts (seated) and clearances of non-mating pairs ==');
  for (let i = 0; i < names.length; i++) {
    for (let k = i + 1; k < names.length; k++) {
      const [a, b] = [names[i], names[k]];
      if (!boxesNear(boxes[a], boxes[b], 1.0)) continue;
      const v = overlap(parts[a], parts[b]);
      if (v > EPS_VOL) {
        console.log(`  contact   ${a.padEnd(8)} x ${b.padEnd(8)} ${v.toFixed(2)} mm3 (press-fit ribs)`);
        continue;
      }
      for (const delta of PROBES) {
        const dir = DIRECTIONS.find((d) => overlap(parts[a].translate(scale(d, delta)), parts[b]) > EPS_VOL);
        if (dir) {
          console.log(`  gap<${delta}mm ${a.padEnd(8)} - ${b.padEnd(8)} (toward [${dir}])`);
          break;
        }
      }
    }
  }
}

/** Slide `mover` out along `dir` and report the first position where it collides with `others`. */
function sweep(
  label: string,
  mover: Manifold,
  dir: Vec3,
  others: readonly string[],
  steps: readonly number[],
): void {
  const total = (m: Manifold): number => others.reduce((s, o) => s + overlap(m, parts[o]), 0);
  const seated = total(mover);
  for (const s of steps) {
    const v = total(mover.translate(scale(dir, s)));
    if (v > seated + COLLISION_VOL) {
      console.log(`  ${label}: COLLISION at ${fmt(s)} mm: ${fmt(v)} mm3 (seated ${fmt(seated)})`);
      return;
    }
  }
  console.log(`  ${label}: clear (seated rib crush ${fmt(seated)} mm3)`);
}

/** Insertion paths in assembly order: branches from the stem outwards, then the rod and stem pieces. */
function insertionPaths(): void {
  console.log('== 2. Insertion paths (order inner -> outer; overlap above seated baseline) ==');
  const pieces = BRANCH_IDS.map(branchPieceNames);
  const installed: string[] = [];
  for (const [n] of pieces) {
    sweep(
      `branch ${n} along its axis`,
      parts[n],
      BRANCH_AXIS,
      ['stem_lo', 'stem_hi', ...installed],
      range(0.5, 80, 0.5),
    );
    installed.push(n);
  }
  for (const [inner, n] of pieces.filter((p) => p.length === 2)) {
    sweep(`branch ${n} onto ${inner}`, parts[n], BRANCH_AXIS, installed, range(0.5, 80, 0.5));
    installed.push(n);
  }
  sweep(
    'rod R along +X (whole length)',
    parts.rod_R,
    [1, 0, 0],
    ['stem_lo', 'stem_hi', ...installed],
    range(0.5, 290, 1),
  );
  sweep('stem_lo down onto the foot', parts.stem_lo, [0, 0, 1], ['foot'], range(0.2, 12, 0.2));
  sweep('stem_hi down onto stem_lo', parts.stem_hi, [0, 0, 1], ['stem_lo'], range(0.2, 12, 0.2));
  sweep('shamash cup down onto stem_hi', parts.shamash, [0, 0, 1], ['stem_hi'], range(0.2, 12, 0.2));
}

function keyDistances(): void {
  console.log('== 3. Key distances ==');
  console.log(`  inner cup edge -> stem surface: ${fmt(cupX(1) - P.R - P.STEM_R)} mm`);
  console.log(`  inner cup edge -> shamash cup edge (horizontal): ${fmt(cupX(1) - 2 * P.R)} mm`);
  console.log(
    `  shamash cup base above row cups: ${fmt(P.SHAMASH_LIFT)} mm; gap between cups: ${fmt(P.GAP)} mm`,
  );
  console.log(`  rod top below the cup cones: ${fmt(P.Z_CUP - P.CONE_H - (P.Z_ROD + P.ROD_R))} mm`);
  console.log(
    `  rod clearance per side: stem ${(P.ROD_HOLE_R - P.ROD_R).toFixed(2)} mm, top knops ${(P.ROD_HOLE_BR_R - P.ROD_R).toFixed(2)} mm`,
  );
}

/** Weakest horizontal sections of the drilled stem. */
function stemSections(): void {
  console.log('== 4. Weakest stem sections ==');
  const st = stem(true);
  const plain = Math.PI * P.STEM_R ** 2;
  const rows = range(32, P.Z_SHAMASH - 12, 1).map((z): [number, number] => [z, st.slice(z).area()]);
  rows.sort(byArea);
  for (const [z, a] of rows.slice(0, 5))
    console.log(`  z=${z}: ${fmt(a)} mm2 (${((a / plain) * 100).toFixed(0)}% of plain stem)`);
  for (const z of [FOOT_SPLIT_Z, STEM_SPLIT_Z, SHAMASH_SPLIT_Z])
    console.log(`  split z=${fmt(z)}: ${fmt(st.slice(z).area())} mm2`);
}

contactsAndClearances();
insertionPaths();
keyDistances();
stemSections();
