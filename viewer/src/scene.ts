// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * three.js scene: renderer, Z-up camera with orbit controls, lights and a floor grid.
 *
 * @module
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** Default look-at height for the assembled model (mm). */
export const ASSEMBLY_TARGET_Z = 200;
/** Look-at shift to the left, so the model clears the side panel (mm). */
export const PANEL_SHIFT_X = -130;

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
}

/** Create the stage, attach the canvas and start the render loop. */
export function createStage(host: HTMLElement): Stage {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1d1f22);

  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 1, 10000);
  camera.up.set(0, 0, 1); // model is Z-up
  camera.position.set(250 + PANEL_SHIFT_X, -1000, 480);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(PANEL_SHIFT_X, 0, ASSEMBLY_TARGET_Z);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-300, -500, 800);
  scene.add(sun);
  const floor = new THREE.GridHelper(1200, 24, 0x555555, 0x333333);
  floor.rotation.x = Math.PI / 2;
  scene.add(floor);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
  return { scene, camera, controls, renderer };
}
