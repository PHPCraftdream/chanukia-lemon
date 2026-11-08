// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * three.js stage inside a host element: transparent renderer (the page's glass card
 * shows through), Z-up camera with orbit controls, lights, and framing helpers.
 *
 * @module
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Viewing direction toward the camera (from slightly front-right and above). */
const VIEW_DIR = new THREE.Vector3(0.25, -1, 0.42).normalize();
/** Extra room around the framed object. */
const FRAME_MARGIN = 1.08;

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
}

/** Create the stage in `host`, follow its size and start the render loop. */
export function createStage(host: HTMLElement): Stage {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 20000);
  camera.up.set(0, 0, 1); // the model is Z-up

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  setupLighting(scene, renderer);

  const resize = (): void => {
    const { clientWidth: w, clientHeight: h } = host;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
  return { scene, camera, controls, renderer };
}

/**
 * Studio look for polished brass: a soft room environment for reflections (image-based
 * lighting), a warm key light from the front-left and a rim light from behind.
 * The environment texture belongs to `renderer`'s WebGL context, so every renderer
 * (the interactive view, the gallery) sets up its own scene with this.
 */
export function setupLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a2e1c, 0.6));
  const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
  key.position.set(-300, -600, 900);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2a8, 1.2);
  rim.position.set(500, 500, 400);
  scene.add(rim);
}

/** Narrow field of view for the front icon, degrees. */
const ICON_FOV = 12;
/** Straight from the front (site icon). */
export const FRONT_DIR = new THREE.Vector3(0, -1, 0.02).normalize();

/** Fit `object` seen from the front along `dir` (width across X, height along Z). */
export function frameFront({ camera, controls }: Stage, object: THREE.Object3D, margin = 1.3): void {
  object.updateMatrixWorld(true);
  camera.fov = ICON_FOV; // nearly orthographic: a flat, symmetric front silhouette
  const box = new THREE.Box3().setFromObject(object);
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const distance =
    Math.max(size.z / 2 / tanHalf, size.x / 2 / (tanHalf * camera.aspect)) * margin + size.y / 2;
  controls.target.copy(centre);
  camera.position.copy(centre).addScaledVector(FRONT_DIR, distance);
  camera.near = distance / 100;
  camera.far = distance * 10;
  camera.updateProjectionMatrix();
  controls.update();
}

/** Looking down at a print bed from the front, slightly tilted. */
const BED_DIR = new THREE.Vector3(0, -0.45, 1).normalize();

/** Point the camera from above at a layout of flat parts (print mode) so that it fills the view. */
export function frameFromAbove({ camera, controls }: Stage, object: THREE.Object3D): void {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const height = size.y * BED_DIR.z + size.z * Math.abs(BED_DIR.y);
  const distance =
    Math.max(height / 2 / tanHalf, size.x / 2 / (tanHalf * camera.aspect)) * FRAME_MARGIN + size.z / 2;
  controls.target.copy(centre);
  camera.position.copy(centre).addScaledVector(BED_DIR, distance);
  camera.near = distance / 100;
  camera.far = distance * 10;
  camera.updateProjectionMatrix();
  controls.update();
}

/** Point the camera at `object` so that it fills the view. */
export function frame({ camera, controls }: Stage, object: THREE.Object3D): void {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const centre = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  // Fit the box silhouette (width across, height up) rather than its bounding sphere.
  const width = Math.hypot(size.x, size.y);
  const height = size.z + size.y * VIEW_DIR.z;
  const distance =
    Math.max(height / 2 / tanHalf, width / 2 / (tanHalf * camera.aspect)) * FRAME_MARGIN + size.y / 2;
  controls.target.copy(centre);
  camera.position.copy(centre).addScaledVector(VIEW_DIR, distance);
  camera.near = distance / 100;
  camera.far = distance * 10;
  camera.updateProjectionMatrix();
  controls.update();
}
