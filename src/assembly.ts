// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Catalogue of printable parts and the assembled hanukkiah.
 *
 * Each {@link PrintPart} is built once in assembled position ("world"), then placed for
 * printing; its {@link ViewInstance}s say where copies go in the assembly (mirrored for
 * the left half) and in which direction they move in an exploded view.
 *
 * @module
 */
import { ground, mirrorX, union } from './geom.ts';
import type { Manifold, Vec3 } from './geom.ts';
import { BRANCH_IDS } from './layout.ts';
import { BRANCHES, X_ROD } from './params.ts';
import { branchHalves, branchWorld, layBranch } from './parts/branch.ts';
import { fitTest } from './parts/fit-test.ts';
import { layRod, rodHalf } from './parts/rod.ts';
import { stem, stemHalves } from './parts/stem.ts';

/** One copy of a part in the assembly. */
export interface ViewInstance {
  /** Unique id, also the file name stem of the assembled-position STL. */
  id: string;
  /** Left-half copy (mirror of the built right part). */
  mirror: boolean;
  /** Unit-ish direction for the second stage of the exploded view. */
  explode: Vec3;
  /**
   * Movement (mm) in the first stage of the exploded view, before anything else moves —
   * the stiffening rod halves slide out of the cups along their axis.
   */
  slide?: Vec3;
}

/** A file for the print shop. */
export interface PrintPart {
  /** File name stem of the print STL. */
  file: string;
  /** How many to print. */
  qty: number;
  /** Display colour in the viewer. */
  color: string;
  /** Build the part in assembled position (right half). */
  world: () => Manifold;
  /** Move a world part into print orientation. */
  print: (world: Manifold) => Manifold;
  /** Copies in the assembly. */
  view: ViewInstance[];
}

const S = Math.SQRT1_2;
/** How far a rod half slides out to clear every cup (mm): its own length plus a margin. */
const ROD_PULL = X_ROD + 20;
const COLOR = { stem: '#d6ad55', branch: '#cfa54c', rod: '#b48a3e', test: '#9a9a9a' } as const;
const asIs = (m: Manifold): Manifold => m;

/** A branch part: two mirrored copies sliding in along their 45° axes. */
const branchPart = (file: string, j: number, world: () => Manifold): PrintPart => ({
  file,
  qty: 2,
  color: COLOR.branch,
  world,
  print: (m) => layBranch(m, j),
  view: [
    { id: `${file}_R`, mirror: false, explode: [S, 0, S] },
    { id: `${file}_L`, mirror: true, explode: [-S, 0, S] },
  ],
});

/** A branch printed in one piece. */
const wholeBranchPart = (j: number): PrintPart =>
  branchPart(`chabad_branch${j}_x2`, j, () => branchWorld(j, true));

/** Display branch (no rod hole). */
const displayBranch = (j: number): Manifold => branchWorld(j);

/** All files for the print shop, in assembly order. */
export const PRINT_PARTS: readonly PrintPart[] = [
  {
    file: 'chabad_stem_lower',
    qty: 1,
    color: COLOR.stem,
    world: () => stemHalves()[0],
    print: asIs,
    view: [{ id: 'stem_lower', mirror: false, explode: [0, 0, 0] }],
  },
  {
    file: 'chabad_stem_upper',
    qty: 1,
    color: COLOR.stem,
    world: () => stemHalves()[1],
    print: ground,
    view: [{ id: 'stem_upper', mirror: false, explode: [0, 0, 0.6] }],
  },
  ...BRANCH_IDS.slice(0, -1).map(wholeBranchPart),
  branchPart(`chabad_branch${BRANCHES}a_inner_x2`, BRANCHES, () => branchHalves(BRANCHES)[0]),
  branchPart(`chabad_branch${BRANCHES}b_outer_x2`, BRANCHES, () => branchHalves(BRANCHES)[1]),
  {
    file: 'chabad_rod_pin_x1',
    qty: 1,
    color: COLOR.rod,
    world: () => mirrorX(rodHalf('pin')),
    print: layRod,
    view: [{ id: 'rod_left', mirror: false, slide: [-ROD_PULL, 0, 0], explode: [0, 0, 1.6] }],
  },
  {
    file: 'chabad_rod_socket_x1',
    qty: 1,
    color: COLOR.rod,
    world: () => rodHalf('socket'),
    print: layRod,
    view: [{ id: 'rod_right', mirror: false, slide: [ROD_PULL, 0, 0], explode: [0, 0, 1.6] }],
  },
  { file: 'chabad_fit_test', qty: 1, color: COLOR.test, world: fitTest, print: asIs, view: [] },
];

/** The assembled hanukkiah as one display solid (no sockets or holes). */
export function fullAssembly(): Manifold {
  const branches = BRANCH_IDS.map(displayBranch);
  return union([stem(), rodHalf('solid'), mirrorX(rodHalf('solid')), ...branches, ...branches.map(mirrorX)]);
}

/**
 * Every physical part in assembled position, keyed by a short name (right R*, left L*).
 * Used by the review tools.
 */
export function assembledParts(): Record<string, Manifold> {
  const [stemLower, stemUpper] = stemHalves();
  const parts: Record<string, Manifold> = { stem_lo: stemLower, stem_hi: stemUpper };
  for (let j = 1; j < BRANCHES; j++) {
    const b = branchWorld(j, true);
    parts[`R${j}`] = b;
    parts[`L${j}`] = mirrorX(b);
  }
  const [inner, outer] = branchHalves(BRANCHES);
  parts[`R${BRANCHES}a`] = inner;
  parts[`R${BRANCHES}b`] = outer;
  parts[`L${BRANCHES}a`] = mirrorX(inner);
  parts[`L${BRANCHES}b`] = mirrorX(outer);
  parts.rod_L = mirrorX(rodHalf('pin'));
  parts.rod_R = rodHalf('socket');
  return parts;
}
