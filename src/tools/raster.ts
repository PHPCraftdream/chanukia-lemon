// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Tiny software renderer: orthographic shaded views and filled 2D sections, saved as PNG.
 * No native dependencies (PNG via node:zlib).
 *
 * @module
 */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import type { Vec2, Vec3 } from '../geom.ts';
import type { Mesh } from '../stl.ts';

export type Rgb = [number, number, number];

const WHITE: Rgb = [255, 255, 255];
const GRID_RGB: Rgb = [225, 225, 225];
const OUTLINE_RGB: Rgb = [40, 40, 40];
const GUTTER_RGB: Rgb = [120, 120, 120];
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** RGB raster image. */
export class Image {
  readonly w: number;
  readonly h: number;
  readonly px: Uint8Array;

  constructor(w: number, h: number, bg: Rgb = WHITE) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3);
    for (let i = 0; i < w * h; i++) this.px.set(bg, i * 3);
  }

  set(x: number, y: number, rgb: ArrayLike<number>): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px.set(rgb, (y * this.w + x) * 3);
  }

  get(x: number, y: number): Rgb {
    const k = (y * this.w + x) * 3;
    return [this.px[k], this.px[k + 1], this.px[k + 2]];
  }

  /** Copy another image at (ox, oy). */
  blit(img: Image, ox: number, oy: number): void {
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) this.set(ox + x, oy + y, img.get(x, y));
  }

  save(path: string): void {
    const stride = this.w * 3 + 1;
    const raw = Buffer.alloc(stride * this.h);
    for (let y = 0; y < this.h; y++)
      Buffer.from(this.px.buffer, y * this.w * 3, this.w * 3).copy(raw, y * stride + 1);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // colour type RGB
    writeFileSync(
      path,
      Buffer.concat([
        PNG_SIGNATURE,
        pngChunk('IHDR', ihdr),
        pngChunk('IDAT', deflateSync(raw)),
        pngChunk('IEND', Buffer.alloc(0)),
      ]),
    );
  }
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const negate = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];
const combine = (a: Vec3, ka: number, b: Vec3, kb: number, c: Vec3, kc: number): Vec3 => [
  a[0] * ka + b[0] * kb + c[0] * kc,
  a[1] * ka + b[1] * kb + c[1] * kc,
  a[2] * ka + b[2] * kb + c[2] * kc,
];
const byNumber = (a: number, b: number): number => a - b;

/** A mesh with a colour. */
export interface Drawable extends Mesh {
  color: Rgb;
}

/** View definition: matplotlib-like elevation/azimuth (degrees) and the framed box. */
export interface ViewSpec {
  el: number;
  az: number;
  lo: Vec3;
  hi: Vec3;
  size?: number;
}

/** Orthographic camera basis for elevation/azimuth. */
function cameraBasis(el: number, az: number): { toViewer: Vec3; right: Vec3; up: Vec3 } {
  const e = (el * Math.PI) / 180;
  const a = (az * Math.PI) / 180;
  const toViewer: Vec3 = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
  const right: Vec3 = [-Math.sin(a), Math.cos(a), 0];
  return { toViewer, right, up: cross(toViewer, right) };
}

/** Shaded orthographic view with a z-buffer. */
export function renderView(items: readonly Drawable[], { el, az, lo, hi, size = 480 }: ViewSpec): Image {
  const { toViewer, right, up } = cameraBasis(el, az);
  const light = normalize(combine(right, -0.4, up, 0.6, toViewer, 0.7));
  const centre: Vec3 = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  const half = (Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2) * 1.05;
  const s = size / (2 * half);
  const img = new Image(size, size);
  const depth = new Float32Array(size * size).fill(-Infinity);
  const project = (p: Vec3): Vec3 => {
    const q = sub(p, centre);
    return [size / 2 + dot(q, right) * s, size / 2 - dot(q, up) * s, dot(q, toViewer)];
  };

  for (const { pos, tri, color } of items) {
    const world = (i: number): Vec3 => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
    const screen: Vec3[] = [];
    for (let i = 0; i < pos.length / 3; i++) screen.push(project(world(i)));
    for (let t = 0; t < tri.length; t += 3) {
      const [ia, ib, ic] = [tri[t], tri[t + 1], tri[t + 2]];
      const a = world(ia);
      const n = normalize(cross(sub(world(ib), a), sub(world(ic), a)));
      const facing = dot(n, toViewer) < 0 ? negate(n) : n;
      const shade = 0.3 + 0.7 * Math.max(0, dot(facing, light));
      const rgb: Rgb = [color[0] * shade, color[1] * shade, color[2] * shade].map(Math.round) as Rgb;
      fillTriangle(img, depth, screen[ia], screen[ib], screen[ic], rgb);
    }
  }
  return img;
}

/** Rasterise one projected triangle with depth test. */
function fillTriangle(img: Image, depth: Float32Array, p0: Vec3, p1: Vec3, p2: Vec3, rgb: Rgb): void {
  const size = img.w;
  const den = (p1[1] - p2[1]) * (p0[0] - p2[0]) + (p2[0] - p1[0]) * (p0[1] - p2[1]);
  if (Math.abs(den) < 1e-12) return;
  const x0 = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])));
  const x1 = Math.min(size - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])));
  const y0 = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])));
  const y1 = Math.min(img.h - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const w0 = ((p1[1] - p2[1]) * (x - p2[0]) + (p2[0] - p1[0]) * (y - p2[1])) / den;
      const w1 = ((p2[1] - p0[1]) * (x - p2[0]) + (p0[0] - p2[0]) * (y - p2[1])) / den;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
      const z = w0 * p0[2] + w1 * p1[2] + w2 * p2[2];
      const k = y * size + x;
      if (z > depth[k]) {
        depth[k] = z;
        img.set(x, y, rgb);
      }
    }
  }
}

/** A filled section layer: polygons (even-odd) in mm. */
export interface SectionLayer {
  polys: Vec2[][];
  color: Rgb;
}

/** Filled 2D section in the window lo..hi (mm) with a 10 mm grid; overlapping layers blend. */
export function renderSection(layers: readonly SectionLayer[], lo: Vec2, hi: Vec2, size = 480): Image {
  const img = new Image(size, size);
  const half = Math.max(hi[0] - lo[0], hi[1] - lo[1]) / 2;
  const cx = (lo[0] + hi[0]) / 2;
  const cy = (lo[1] + hi[1]) / 2;
  const s = size / (2 * half);
  const toPx = ([x, y]: Vec2): Vec2 => [size / 2 + (x - cx) * s, size / 2 - (y - cy) * s];

  for (let g = Math.ceil((cx - half) / 10) * 10; g <= cx + half; g += 10) {
    const px = Math.round(toPx([g, 0])[0]);
    for (let y = 0; y < size; y++) img.set(px, y, GRID_RGB);
  }
  for (let g = Math.ceil((cy - half) / 10) * 10; g <= cy + half; g += 10) {
    const py = Math.round(toPx([0, g])[1]);
    for (let x = 0; x < size; x++) img.set(x, py, GRID_RGB);
  }

  for (const { polys, color } of layers) {
    const px = polys.map((p) => p.map(toPx));
    fillPolygons(img, px, color);
    for (const poly of px) strokePolygon(img, poly, OUTLINE_RGB);
  }
  return img;
}

/** Even-odd scanline fill; pixels already coloured are blended. */
function fillPolygons(img: Image, polys: readonly Vec2[][], color: Rgb): void {
  for (let y = 0; y < img.h; y++) {
    const yc = y + 0.5;
    const xs: number[] = [];
    for (const poly of polys) {
      for (let i = 0; i < poly.length; i++) {
        const [x0, y0] = poly[i];
        const [x1, y1] = poly[(i + 1) % poly.length];
        if (y0 <= yc !== y1 <= yc) xs.push(x0 + ((yc - y0) / (y1 - y0)) * (x1 - x0));
      }
    }
    xs.sort(byNumber);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const from = Math.max(0, Math.ceil(xs[i] - 0.5));
      const to = Math.min(img.w - 1, Math.floor(xs[i + 1] - 0.5));
      for (let x = from; x <= to; x++) {
        const old = img.get(x, y);
        const blank = old[0] === 255 && old[1] === 255 && old[2] === 255;
        img.set(x, y, blank ? color : color.map((v, j) => Math.round((v + old[j]) / 2)));
      }
    }
  }
}

function strokePolygon(img: Image, poly: readonly Vec2[], rgb: Rgb): void {
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) + 1;
    for (let t = 0; t <= n; t++)
      img.set(Math.round(x0 + ((x1 - x0) * t) / n), Math.round(y0 + ((y1 - y0) * t) / n), rgb);
  }
}

/** Compose equally sized panels into a grid with grey gutters. */
export function grid(panels: readonly Image[], cols: number): Image {
  const { w, h } = panels[0];
  const rows = Math.ceil(panels.length / cols);
  const img = new Image(cols * w + (cols - 1) * 4, rows * h + (rows - 1) * 4, GUTTER_RGB);
  panels.forEach((p, i) => img.blit(p, (i % cols) * (w + 4), Math.floor(i / cols) * (h + 4)));
  return img;
}
