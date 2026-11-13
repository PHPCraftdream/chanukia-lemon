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
import {
  BRANCH_IDS,
  SPLIT_BRANCHES,
  STEM_SPLIT_Z,
  branchLen,
  branchSplitT,
  isSplitBranch,
  junctionZ,
} from './layout.ts';
import { X_ROD } from './params.ts';
import { branchHalves, branchWorld, layBranch } from './parts/branch.ts';
import { fitTest } from './parts/fit-test.ts';
import { layRod, rodHalf } from './parts/rod.ts';
import { stem, stemPieces } from './parts/stem.ts';

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
   * the stiffening rod halves slide out of the top knops along their axis.
   */
  slide?: Vec3;
  /** Offset of this copy from the built part (mm, applied after mirroring). */
  shift?: Vec3;
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
/** How far a rod half slides out to clear every knop (mm): its own length plus a margin. */
const ROD_PULL = X_ROD + 20;
const COLOR = { stem: '#d6ad55', branch: '#cfa54c', rod: '#b48a3e', test: '#9a9a9a' } as const;
const asIs = (m: Manifold): Manifold => m;

/** Exploded view: drop of the foot below the stem. */
const FOOT_DROP = 0.4;
/** Exploded view: rise of the upper stem (the shamash cup rises twice as far). */
const STEM_UPPER_LIFT = 0.6;
/** Exploded view: rise and outward drift of the rod halves, enough to clear the outer cups moving out. */
const ROD_LIFT = 3.0;
const ROD_DRIFT = 0.5;
/** Extra explode distance of the outer half of a split branch, so the joint opens up. */
const OUTER_HALF_SPREAD = 1.6;

/**
 * A branch print file: for each branch in `js`, two mirrored copies sliding in along their
 * 45° axes. Several branches share a file when the part has the same shape on each of them;
 * it is built on the first one and moved to the others (the branches are parallel).
 *
 * @param spread explode distance along the axis, relative to a whole branch
 * @param shiftOf offset of the copy on branch `j` from the built part (right half)
 */
function branchPart(
  name: string,
  js: readonly number[],
  world: () => Manifold,
  spread = 1,
  shiftOf: (j: number) => Vec3 = noShift,
): PrintPart {
  const file = `${name}_x${2 * js.length}`;
  const view = js.flatMap((j): ViewInstance[] => {
    // branches held by the upper stem rise with it, so they leave their sockets along their own axes
    const lift = junctionZ(j) > STEM_SPLIT_Z ? STEM_UPPER_LIFT : 0;
    const [dx, dy, dz] = shiftOf(j);
    const shared = js.length > 1;
    const id = shared ? `${file}_${j}` : file;
    return [
      {
        id: `${id}_R`,
        mirror: false,
        explode: [S * spread, 0, S * spread + lift],
        ...(shared ? { shift: [dx, dy, dz] as Vec3 } : {}),
      },
      {
        id: `${id}_L`,
        mirror: true,
        explode: [-S * spread, 0, S * spread + lift],
        ...(shared ? { shift: [-dx, dy, dz] as Vec3 } : {}),
      },
    ];
  });
  return { file, qty: 2 * js.length, color: COLOR.branch, world, print: (m) => layBranch(m, js[0]), view };
}

/** Length of half `h` (0 inner, 1 outer) of split branch `j`: equal lengths mean the same shape. */
const halfLength = (j: number, h: number): string =>
  (h === 0 ? branchSplitT(j) : branchLen(j) - branchSplitT(j)).toFixed(6);

const noShift = (): Vec3 => [0, 0, 0];

/** First split branch whose half `h` has the same shape as on branch `j`. */
const halfSource = (j: number, h: number): number =>
  SPLIT_BRANCHES.find((k) => halfLength(k, h) === halfLength(j, h)) ?? j;

/**
 * Offset (right half) that moves half `h` built on branch `first` onto branch `j`: to the
 * other junction, and along the axis by the difference of the half's start `t`.
 */
function halfShift(j: number, first: number, h: number): Vec3 {
  const dt = h === 0 ? 0 : branchSplitT(j) - branchSplitT(first);
  return [dt * S, 0, junctionZ(j) - junctionZ(first) + dt * S];
}

/** Half `h` of split branch `j` as printed: the shared shape, built on the first branch that has it. */
function sharedHalf(j: number, h: number): Manifold {
  const first = halfSource(j, h);
  return branchHalves(first)[h].translate(halfShift(j, first, h));
}

/** Print files of the branches: whole ones, then the inner and the outer halves of split ones. */
function branchParts(): PrintPart[] {
  const whole = BRANCH_IDS.filter((j) => !isSplitBranch(j)).map((j) =>
    branchPart(`chabad_branch${j}`, [j], () => branchWorld(j, true)),
  );
  const halves = [0, 1].flatMap((h) => {
    const groups = new Map<string, number[]>();
    for (const j of SPLIT_BRANCHES)
      groups.set(halfLength(j, h), [...(groups.get(halfLength(j, h)) ?? []), j]);
    return [...groups.values()].map((js) =>
      branchPart(
        `chabad_branch${js.join('')}${h === 0 ? 'a_inner' : 'b_outer'}`,
        js,
        () => branchHalves(js[0])[h],
        h === 0 ? 1 : OUTER_HALF_SPREAD,
        (j) => halfShift(j, js[0], h),
      ),
    );
  });
  return [...whole, ...halves];
}

/** Short names of the right-side pieces of branch `j` in {@link assembledParts}, inner first. */
export const branchPieceNames = (j: number): string[] =>
  isSplitBranch(j) ? [`R${j}a`, `R${j}b`] : [`R${j}`];

/** Display branch (no rod hole). */
const displayBranch = (j: number): Manifold => branchWorld(j);

/** All files for the print shop, in assembly order. */
export const PRINT_PARTS: readonly PrintPart[] = [
  {
    file: 'chabad_foot',
    qty: 1,
    color: COLOR.stem,
    world: () => stemPieces()[0],
    print: asIs,
    view: [{ id: 'foot', mirror: false, explode: [0, 0, -FOOT_DROP] }],
  },
  {
    file: 'chabad_stem_lower',
    qty: 1,
    color: COLOR.stem,
    world: () => stemPieces()[1],
    print: ground,
    view: [{ id: 'stem_lower', mirror: false, explode: [0, 0, 0] }],
  },
  {
    file: 'chabad_stem_upper',
    qty: 1,
    color: COLOR.stem,
    world: () => stemPieces()[2],
    print: ground,
    view: [{ id: 'stem_upper', mirror: false, explode: [0, 0, STEM_UPPER_LIFT] }],
  },
  {
    file: 'chabad_shamash_cup',
    qty: 1,
    color: COLOR.stem,
    world: () => stemPieces()[3],
    print: ground,
    view: [{ id: 'shamash_cup', mirror: false, explode: [0, 0, 2 * STEM_UPPER_LIFT] }],
  },
  ...branchParts(),
  {
    file: 'chabad_rod_pin_x1',
    qty: 1,
    color: COLOR.rod,
    world: () => mirrorX(rodHalf('pin')),
    print: layRod,
    view: [{ id: 'rod_left', mirror: false, slide: [-ROD_PULL, 0, 0], explode: [-ROD_DRIFT, 0, ROD_LIFT] }],
  },
  {
    file: 'chabad_rod_socket_x1',
    qty: 1,
    color: COLOR.rod,
    world: () => rodHalf('socket'),
    print: layRod,
    view: [{ id: 'rod_right', mirror: false, slide: [ROD_PULL, 0, 0], explode: [ROD_DRIFT, 0, ROD_LIFT] }],
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
  const [foot, stemLower, stemUpper, shamashCup] = stemPieces();
  const parts: Record<string, Manifold> = {
    foot,
    stem_lo: stemLower,
    stem_hi: stemUpper,
    shamash: shamashCup,
  };
  for (const j of BRANCH_IDS) {
    const pieces = isSplitBranch(j) ? [0, 1].map((h) => sharedHalf(j, h)) : [branchWorld(j, true)];
    branchPieceNames(j).forEach((name, i) => {
      parts[name] = pieces[i];
      parts[name.replace(/^R/, 'L')] = mirrorX(pieces[i]);
    });
  }
  parts.rod_L = mirrorX(rodHalf('pin'));
  parts.rod_R = rodHalf('socket');
  return parts;
}
