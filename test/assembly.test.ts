// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Assembly fit: seated parts overlap only by crush ribs at the intended joints, every part
 * slides into place along its insertion direction, every pin stops short of its socket
 * bottom, and every socket keeps a wall around it.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assembledParts, branchPieceNames } from '../src/assembly.ts';
import type { SplitJoint } from '../src/fits.ts';
import { box, cyl, union } from '../src/geom.ts';
import type { Manifold, Vec3 } from '../src/geom.ts';
import {
  BRANCH_IDS,
  BRANCH_JOINT,
  FOOT_JOINT,
  FOOT_SPLIT_Z,
  SHAMASH_SPLIT_Z,
  SPLIT_BRANCHES,
  STEM_JOINT,
  STEM_SPLIT_Z,
  branchSplitT,
} from '../src/layout.ts';
import {
  FIT_CLEARANCE,
  PIN_L,
  PIN_R,
  PIN_TIP_ROOM,
  SOCKET_R,
  T_BODY0,
  T_TENON0,
  X_ROD,
  Z_ROD,
} from '../src/params.ts';
import { branchHalves, toBranchFrame } from '../src/parts/branch.ts';

/** Max overlap of a press fit (rib crush), mm³. */
const MAX_RIB_CRUSH = 6;
/** Overlap treated as touching faces, mm³. */
const EPS_VOL = 0.01;
/** Extra overlap during sliding that counts as a collision, mm³. */
const COLLISION_VOL = 3;
/** Shared half vs the half built on its own branch: only mesh noise of the reliefs, mm³. */
const MAX_SHARED_DIFF = 5;
const BRANCH_AXIS: Vec3 = [Math.SQRT1_2, 0, Math.SQRT1_2];

/** Socket depth of every pin joint: the same everywhere, so a changed pin needs only its own piece reprinted. */
const PIN_SOCKET_DEPTH = PIN_L + PIN_TIP_ROOM;
/** Length tolerance of the pin/socket checks (float noise of bounding boxes), mm. */
const LEN_TOL = 0.05;
/** Pin tip to socket bottom, mm. */
const MIN_TIP_GAP = 0.5;
/** Foot pins: extra room for a sagging socket roof (printed foot pins bottomed out). */
const MIN_FOOT_TIP_GAP = 1.5;
/** Wall around a press-fit socket: 4 lines of a 0.4 mm nozzle. */
const MIN_WALL = 1.6;
/** Rod jack socket: D-flat 3.2 mm off the axis leaves 1.05 mm; printed flat side down. */
const MIN_ROD_WALL = 1.0;
/** Socket length near the mouth left out of the wall check (split face, tube recess), mm. */
const MOUTH_SKIP = 0.5;
/** Shell volume outside the part still counted as a full wall (mesh noise), mm³. */
const MAX_THIN_VOL = 0.1;
/** Half-width of the probe along a pin axis, mm. */
const PROBE = 1;

/** Right-side branch pieces, inner first; `L…` are their mirrors. */
const PIECES = BRANCH_IDS.map(branchPieceNames);
/** Stem piece that holds the sockets of branch pair `j` (the stem split is between junctions 2 and 3). */
const stemOf = (j: number): string => (j <= 2 ? 'stem_hi' : 'stem_lo');
const mirrorName = (n: string): string => n.replace(/^R/, 'L');
const pairKey = (a: string, b: string): string => [a, b].sort().join('|');

/** A press-fit pin in its socket. */
interface PressFit {
  at: string;
  male: string;
  female: string;
  /** World -> frame with the pin along +Z, socket mouth at the origin. */
  frame: (m: Manifold) => Manifold;
  len: number;
  depth: number;
  /** Socket radius. */
  r: number;
  gap: number;
  wall: number;
}

/** Fits of the pins of a split joint; `toCut` moves the cut to `z = 0`. */
const splitFits = (
  joint: SplitJoint,
  male: string,
  female: string,
  toCut: (m: Manifold) => Manifold,
  gap = MIN_TIP_GAP,
): PressFit[] =>
  joint.pins.map(([x, y]) => ({
    at: `${male}/${female} pin at ${x},${y}`,
    male,
    female,
    frame: (m: Manifold) => toCut(m).translate([-x, -y, 0]),
    len: joint.len ?? PIN_L,
    depth: PIN_SOCKET_DEPTH,
    r: joint.r + FIT_CLEARANCE,
    gap,
    wall: MIN_WALL,
  }));

/** Every press fit (right side; the left is its mirror). */
const PRESS_FITS: readonly PressFit[] = [
  ...splitFits(FOOT_JOINT, 'foot', 'stem_lo', (m) => m.translate([0, 0, -FOOT_SPLIT_Z]), MIN_FOOT_TIP_GAP),
  ...splitFits(STEM_JOINT, 'stem_lo', 'stem_hi', (m) => m.translate([0, 0, -STEM_SPLIT_Z])),
  ...splitFits(STEM_JOINT, 'stem_hi', 'shamash', (m) => m.translate([0, 0, -SHAMASH_SPLIT_Z])),
  ...PIECES.map(([inner], i) => ({
    at: `${inner} tenon`,
    male: inner,
    female: stemOf(i + 1),
    // the tenon points down its branch axis into the stem: flip the axis
    frame: (m: Manifold) =>
      toBranchFrame(m, i + 1)
        .mirror([0, 0, 1])
        .translate([0, 0, T_BODY0]),
    len: T_BODY0 - T_TENON0,
    depth: T_BODY0 - T_TENON0 + PIN_TIP_ROOM,
    r: SOCKET_R,
    gap: MIN_TIP_GAP,
    wall: MIN_WALL,
  })),
  ...SPLIT_BRANCHES.flatMap((j) => {
    const [inner, outer] = PIECES[j - 1];
    return splitFits(BRANCH_JOINT, inner, outer, (m) =>
      toBranchFrame(m, j).translate([0, 0, -branchSplitT(j)]),
    );
  }),
  {
    at: 'rod jack',
    male: 'rod_L',
    female: 'rod_R',
    frame: (m: Manifold) => m.translate([0, 0, -Z_ROD]).rotate([0, -90, 0]),
    len: PIN_L,
    depth: PIN_SOCKET_DEPTH,
    r: PIN_R + FIT_CLEARANCE,
    gap: MIN_TIP_GAP,
    wall: MIN_ROD_WALL,
  },
];
/** Joints that are meant to press together (unordered pairs), left side included. */
const EXPECTED = new Set(
  PRESS_FITS.flatMap(({ male, female }) => [
    pairKey(male, female),
    pairKey(mirrorName(male), mirrorName(female)),
  ]),
);

const parts = assembledParts();
const names = Object.keys(parts);
/** Each press fit with its pin part and socket part moved into the fit's frame. */
const FRAMED = PRESS_FITS.map((f) => ({
  ...f,
  pin: f.frame(parts[f.male]),
  socket: f.frame(parts[f.female]),
}));
const overlap = (a: Manifold, b: Manifold): number => a.intersect(b).volume();
const scale = (d: Vec3, s: number): Vec3 => [d[0] * s, d[1] * s, d[2] * s];

/** First offset along `dir` where `mover` collides with `others`, or null. */
function firstCollision(
  mover: Manifold,
  dir: Vec3,
  others: readonly string[],
  steps: readonly number[],
): number | null {
  const total = (m: Manifold): number => others.reduce((s, o) => s + overlap(m, parts[o]), 0);
  const seated = total(mover);
  return steps.find((s) => total(mover.translate(scale(dir, s))) > seated + COLLISION_VOL) ?? null;
}
const steps = (to: number, step: number): number[] =>
  Array.from({ length: Math.floor(to / step) }, (_, i) => (i + 1) * step);

describe('assembly', () => {
  it('parts overlap only at the intended joints, and only by rib crush', () => {
    const found = new Set<string>();
    for (let i = 0; i < names.length; i++) {
      for (let k = i + 1; k < names.length; k++) {
        const v = overlap(parts[names[i]], parts[names[k]]);
        if (v <= EPS_VOL) continue;
        const key = pairKey(names[i], names[k]);
        found.add(key);
        assert.ok(EXPECTED.has(key), `unexpected contact ${key}: ${v.toFixed(2)} mm3`);
        assert.ok(v <= MAX_RIB_CRUSH, `${key} overlaps ${v.toFixed(2)} mm3 — more than rib crush`);
      }
    }
    assert.deepEqual([...found].sort(), [...EXPECTED].sort(), 'every joint must press-fit');
  });

  it('branches slide in along their axes: inner pieces from the stem outwards, then outer halves', () => {
    const installed: string[] = [];
    for (const [n] of PIECES) {
      const hit = firstCollision(parts[n], BRANCH_AXIS, ['stem_lo', 'stem_hi', ...installed], steps(60, 2));
      assert.equal(hit, null, `${n} collides at ${hit} mm`);
      installed.push(n);
    }
    for (const [, n] of PIECES.filter((p) => p.length === 2)) {
      const hit = firstCollision(parts[n], BRANCH_AXIS, installed, steps(60, 2));
      assert.equal(hit, null, `${n} collides at ${hit} mm`);
      installed.push(n);
    }
  });

  it('the joined rod slides in from one side through all top knops and the stem', () => {
    const others = ['stem_lo', 'stem_hi', 'shamash', ...names.filter((n) => /^[RL]\d/.test(n))];
    const rod = union([parts.rod_L, parts.rod_R]);
    const hit = firstCollision(rod, [1, 0, 0], others, steps(2 * X_ROD + 20, 10));
    assert.equal(hit, null, `rod collides at ${hit} mm`);
  });

  it('a shared print file fits every branch it is used on', () => {
    for (const j of SPLIT_BRANCHES) {
      branchHalves(j).forEach((own, h) => {
        const shared = parts[PIECES[j - 1][h]];
        const diff = own.subtract(shared).volume() + shared.subtract(own).volume();
        assert.ok(diff < MAX_SHARED_DIFF, `branch ${j} half ${h}: ${diff.toFixed(2)} mm3 apart`);
      });
    }
  });

  it('the stem pieces join vertically', () => {
    const hit = firstCollision(parts.stem_hi, [0, 0, 1], ['stem_lo'], steps(12, 0.5));
    assert.equal(hit, null, `upper stem collides with the lower stem at ${hit} mm`);
    const foot = firstCollision(parts.stem_lo, [0, 0, 1], ['foot'], steps(12, 0.5));
    assert.equal(foot, null, `lower stem collides with the foot at ${foot} mm`);
    const cup = firstCollision(parts.shamash, [0, 0, 1], ['stem_hi'], steps(12, 0.5));
    assert.equal(cup, null, `shamash cup collides at ${cup} mm`);
  });

  it('every pin stops short of its socket bottom, the foot pins with extra room', () => {
    for (const f of FRAMED) {
      const probe = box([-PROBE, -PROBE, 0.1], [PROBE, PROBE, f.depth + 1.5]);
      const tip = f.pin.intersect(probe).boundingBox().max[2];
      const depth = probe.subtract(f.socket).boundingBox().max[2];
      assert.ok(Math.abs(tip - f.len) < LEN_TOL, `${f.at}: pin ${tip.toFixed(2)} mm, want ${f.len}`);
      assert.ok(
        Math.abs(depth - f.depth) < LEN_TOL,
        `${f.at}: socket ${depth.toFixed(2)} mm, want ${f.depth}`,
      );
      const room = depth - tip;
      assert.ok(room > f.gap - LEN_TOL, `${f.at}: ${room.toFixed(2)} mm under the tip, want ${f.gap}`);
    }
  });

  it('every socket keeps a wall around it and under its bottom', () => {
    for (const f of FRAMED) {
      const shell = union([
        cyl(MOUTH_SKIP, f.depth, f.r + f.wall).subtract(cyl(0, f.depth + 1, f.r + LEN_TOL)),
        cyl(f.depth + LEN_TOL, f.depth + f.wall, f.r),
      ]);
      const thin = shell.subtract(f.socket).volume();
      assert.ok(thin < MAX_THIN_VOL, `${f.at}: ${thin.toFixed(2)} mm3 of the ${f.wall} mm wall missing`);
    }
  });
});
