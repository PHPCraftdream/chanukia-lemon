// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Inspection images: close-ups and sections of the assembled parts, saved as PNG sheets.
 * Prints the panel order of every sheet.
 *
 * Usage: `node src/tools/render.ts [out_dir]` (default `out_chabad/inspect`)
 *
 * @module
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { box, mirrorX } from '../geom.ts';
import type { Manifold, Vec2, Vec3 } from '../geom.ts';
import { BRANCH_IDS, cupX, junctionZ } from '../layout.ts';
import { BRANCHES, R, Z_CUP, Z_SHAMASH } from '../params.ts';
import { branchLocal, branchWorld } from '../parts/branch.ts';
import { rowCup } from '../parts/cup.ts';
import { rodHalf } from '../parts/rod.ts';
import { stem } from '../parts/stem.ts';
import { OUT_DIR } from '../paths.ts';
import { meshOf } from '../stl.ts';
import { grid, renderSection, renderView } from './raster.ts';
import type { Image, Rgb, SectionLayer, ViewSpec } from './raster.ts';

const STEM_RGB: Rgb = [195, 190, 180];
const BRANCH_RGB: Rgb = [140, 165, 205];
const ROD_RGB: Rgb = [215, 130, 100];
const FRONT = { el: 5, az: -90 };
const THREE_QUARTER = { el: 22, az: -55 };

type Item = [Manifold, Rgb];

const crop = (m: Manifold, lo: Vec3, hi: Vec3): Manifold => m.intersect(box(lo, hi));

/** Shaded view of solids cropped to the framed box. */
const view = (items: readonly Item[], spec: ViewSpec): Image =>
  renderView(
    items.map(([m, color]) => ({ ...meshOf(crop(m, spec.lo, spec.hi)), color })),
    spec,
  );

/** Flip (x, -z) slice coordinates of a solid rotated by +90° about X back to (x, z). */
const unflip = ([x, y]: Vec2): Vec2 => [x, -y];

const unflipPolygon = (p: Vec2[]): Vec2[] => p.map(unflip);

/** Section layer of one solid through the plane y = 0. */
const layerAtY0 = ([m, color]: Item): SectionLayer => ({
  polys: m.rotate([90, 0, 0]).slice(0).toPolygons().map(unflipPolygon),
  color,
});

/** Vertical section through the plane y = 0 (XZ). */
const sectionY0 = (items: readonly Item[], lo: Vec2, hi: Vec2): Image =>
  renderSection(items.map(layerAtY0), lo, hi);

/** Horizontal section at height z. */
const sectionZ = (items: readonly Item[], z: number, lo: Vec2, hi: Vec2): Image =>
  renderSection(
    items.map(([m, color]): SectionLayer => ({ polys: m.slice(z).toPolygons(), color })),
    lo,
    hi,
  );

interface Sheet {
  name: string;
  cols: number;
  panels: Array<[string, () => Image]>;
}

const printableBranch = (j: number): Manifold => branchWorld(j, true);
const asBranchItem = (b: Manifold): Item => [b, BRANCH_RGB];
const drawPanel = ([, draw]: [string, () => Image]): Image => draw();

function sheets(): Sheet[] {
  const st = stem(true);
  const br = BRANCH_IDS.map(printableBranch);
  const rodR = rodHalf('socket');
  const rodL = mirrorX(rodHalf('pin'));
  const j = 2;
  const jz = junctionZ(j);
  const junctionBox: [Vec3, Vec3] = [
    [-45, -45, jz - 35],
    [45, 45, jz + 45],
  ];
  const junctionItems: Item[] = [
    [st, STEM_RGB],
    [br[j - 1], BRANCH_RGB],
    [mirrorX(br[j - 1]), BRANCH_RGB],
  ];
  const xo = cupX(BRANCHES);
  const outerBox: [Vec3, Vec3] = [
    [xo - 40, -35, Z_CUP - 40],
    [xo + 30, 35, Z_CUP + 25],
  ];
  const outerItems: Item[] = [
    [br[BRANCHES - 1], BRANCH_RGB],
    [br[BRANCHES - 2], BRANCH_RGB],
    [rodR, ROD_RGB],
  ];
  const cupsBox: [Vec3, Vec3] = [
    [90, -40, Z_CUP - 60],
    [275, 40, Z_CUP + 25],
  ];
  const cupsItems: Item[] = [...br.map(asBranchItem), [rodR, ROD_RGB]];
  const centreBox: [Vec3, Vec3] = [
    [-110, -40, Z_CUP - 30],
    [110, 40, Z_SHAMASH + 30],
  ];
  const centreItems: Item[] = [
    [st, STEM_RGB],
    [br[0], BRANCH_RGB],
    [mirrorX(br[0]), BRANCH_RGB],
    [rodR, ROD_RGB],
    [rodL, ROD_RGB],
  ];
  const shamashBox: [Vec3, Vec3] = [
    [-35, -35, Z_SHAMASH - 35],
    [35, 35, Z_SHAMASH + 20],
  ];
  const local3 = branchLocal(3);

  return [
    {
      name: 'junction',
      cols: 3,
      panels: [
        [
          'junction 2: front',
          () => view(junctionItems, { ...FRONT, lo: junctionBox[0], hi: junctionBox[1] }),
        ],
        [
          'junction 2: 3/4',
          () => view(junctionItems, { ...THREE_QUARTER, lo: junctionBox[0], hi: junctionBox[1] }),
        ],
        [
          'stem alone: sockets and recesses',
          () => view([[st, STEM_RGB]], { el: 20, az: -40, lo: junctionBox[0], hi: junctionBox[1] }),
        ],
        ['section y=0 through junction 2', () => sectionY0(junctionItems, [-50, jz - 30], [50, jz + 50])],
        ['section z = junction 2 + 6', () => sectionZ(junctionItems, jz + 6, [-45, -30], [45, 30])],
      ],
    },
    {
      name: 'cups',
      cols: 3,
      panels: [
        ['row cups: front', () => view(cupsItems, { el: 8, az: -90, lo: cupsBox[0], hi: cupsBox[1] })],
        ['row cups: 3/4', () => view(cupsItems, { el: 20, az: -60, lo: cupsBox[0], hi: cupsBox[1] })],
        ['inner cups vs shamash', () => view(centreItems, { ...FRONT, lo: centreBox[0], hi: centreBox[1] })],
        [
          'shamash cup',
          () => view([[st, STEM_RGB]], { el: 8, az: -90, lo: shamashBox[0], hi: shamashBox[1] }),
        ],
        [
          'single cup from above',
          () => view([[rowCup(), BRANCH_RGB]], { el: 55, az: -60, lo: [-26, -26, -12], hi: [26, 26, 17] }),
        ],
        ['single cup: section y=0', () => sectionY0([[rowCup(), BRANCH_RGB]], [-R - 4, -12], [R + 4, 17])],
      ],
    },
    {
      name: 'rod',
      cols: 3,
      panels: [
        [
          'outer cup + rod end: front',
          () => view(outerItems, { ...FRONT, lo: outerBox[0], hi: outerBox[1] }),
        ],
        [
          'outer cup from below',
          () => view(outerItems, { el: -25, az: -30, lo: outerBox[0], hi: outerBox[1] }),
        ],
        [
          'section y=0: outer cup and rod',
          () => sectionY0(outerItems, [xo - 45, Z_CUP - 40], [xo + 30, Z_CUP + 20]),
        ],
      ],
    },
    {
      name: 'flames',
      cols: 3,
      panels: [
        [
          'upper stem: flames + rod hole',
          () => view([[st, STEM_RGB]], { el: 5, az: -60, lo: [-30, -30, 285], hi: [30, 30, 400] }),
        ],
        [
          'lower stem: flames',
          () => view([[st, STEM_RGB]], { el: 15, az: -60, lo: [-60, -60, 20], hi: [60, 60, 110] }),
        ],
        [
          'branch 3: knop, leaves, flames (cup up)',
          () => view([[local3, BRANCH_RGB]], { el: 10, az: -70, lo: [-20, -20, 115], hi: [20, 20, 200] }),
        ],
      ],
    },
  ];
}

function main(outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  for (const sheet of sheets()) {
    const images = sheet.panels.map(drawPanel);
    const path = join(outDir, `${sheet.name}.png`);
    grid(images, sheet.cols).save(path);
    console.log(`${path}:`);
    sheet.panels.forEach(([title], i) => console.log(`  ${i + 1}. ${title}`));
  }
}

main(process.argv[2] ?? join(OUT_DIR, 'inspect'));
