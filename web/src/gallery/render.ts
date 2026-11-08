// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Offline renders for the gallery: the assembly is copied into its own scene (sharing
 * geometry), rendered with MSAA at twice the output size and downsampled onto a soft
 * background — supersampling removes the jagged edges a single pass leaves.
 *
 * @module
 */
import * as THREE from 'three';
import type { PackedInstance } from '../../../src/scene-pack.ts';
import { explodeOffset } from '../viewer/explode.ts';
import type { Placed } from '../viewer/models.ts';
import { setupLighting } from '../viewer/stage.ts';
import type { Shot } from './shots.ts';

/** Output image size. */
export const SHOT_WIDTH = 1260;
export const SHOT_HEIGHT = 840;
/** Supersampling factor (render at N× and downsample). */
const SUPERSAMPLE = 2;
const IMAGE_TYPE = 'image/jpeg';
const IMAGE_QUALITY = 0.9;

/** A copy of one part in the gallery scene. */
interface Copy {
  root: THREE.Group;
  info: PackedInstance;
}

/** Copy part meshes (shared geometry, own materials so viewer highlights do not leak in). */
function copyOf(p: Placed<PackedInstance>): Copy {
  const mesh = p.mesh.clone();
  mesh.material = p.mesh.material.clone();
  mesh.material.emissive.setHex(0x000000);
  mesh.material.wireframe = false;
  const root = new THREE.Group();
  root.add(mesh);
  return { root, info: p.info };
}

/** Theme-coloured backdrop with a soft warm glow behind the model. */
function paintBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string): string => css.getPropertyValue(name).trim() || fallback;
  const base = ctx.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, color('--bg-1', '#f8f7fc'));
  base.addColorStop(1, color('--bg-0', '#eef0f7'));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.6);
  glow.addColorStop(0, color('--mesh-4', 'rgba(234,179,8,0.2)'));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

/**
 * Render every shot; `onShot` receives each image as soon as it is ready.
 * The renderer is created and disposed here, so the gallery costs nothing afterwards.
 */
export async function renderShots(
  parts: readonly Placed<PackedInstance>[],
  shots: readonly Shot[],
  onShot: (index: number, url: string) => void,
): Promise<void> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SHOT_WIDTH * SUPERSAMPLE, SHOT_HEIGHT * SUPERSAMPLE, false);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  setupLighting(scene, renderer);
  const copies = parts.map(copyOf);
  for (const c of copies) scene.add(c.root);

  const camera = new THREE.PerspectiveCamera(30, SHOT_WIDTH / SHOT_HEIGHT, 1, 20000);
  camera.up.set(0, 0, 1);
  const out = document.createElement('canvas');
  out.width = SHOT_WIDTH;
  out.height = SHOT_HEIGHT;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  try {
    for (const [i, shot] of shots.entries()) {
      for (const c of copies) c.root.position.set(...explodeOffset(c.info, shot.explode ?? 0));
      camera.fov = shot.fov;
      camera.position.set(...shot.position);
      camera.lookAt(...shot.target);
      camera.near = 5;
      camera.far = 5000;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      paintBackground(ctx, SHOT_WIDTH, SHOT_HEIGHT);
      ctx.drawImage(renderer.domElement, 0, 0, SHOT_WIDTH, SHOT_HEIGHT);
      onShot(i, out.toDataURL(IMAGE_TYPE, IMAGE_QUALITY));
      await nextFrame(); // keep the page responsive between shots
    }
  } finally {
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
