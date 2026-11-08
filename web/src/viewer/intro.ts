// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * "The model is alive" hint, played once after loading: a drawn cursor presses on the
 * model (click ripples), drags sideways while the hanukkiah turns a full circle, and
 * releases. Skipped for `prefers-reduced-motion`; stops as soon as the visitor touches
 * the model.
 *
 * @module
 */
import type * as THREE from 'three';

/** Timeline, ms. */
const APPEAR = 350;
const PRESS = 450;
const TURN = 3200;
const RELEASE = 300;
const FADE = 400;
/** Cursor path across the canvas (fractions of width / height). */
const START: [number, number] = [0.66, 0.58];
const DRAG_DX = -0.32;

const CURSOR_SVG =
  '<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M5 3l14 8.2-6.3 1.4 3.9 6.6-2.6 1.5-3.9-6.6L5 18.5z" ' +
  'fill="#fff" stroke="#1a1730" stroke-width="1.4" stroke-linejoin="round"/></svg>';

const easeInOut = (x: number): number => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Two expanding rings at the cursor tip. */
function ripple(layer: HTMLElement, x: number, y: number): void {
  for (const delay of [0, 180]) {
    const ring = document.createElement('span');
    ring.className = 'demo-ripple';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.animationDelay = `${delay}ms`;
    layer.append(ring);
    ring.addEventListener('animationend', () => ring.remove());
  }
}

/**
 * Play the hint on `object` (rotated about Z) inside `host`.
 * Resolves when finished or interrupted; the object ends at its original orientation.
 */
export async function playIntro(object: THREE.Object3D, host: HTMLElement): Promise<void> {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'demo-layer';
  const cursor = document.createElement('div');
  cursor.className = 'demo-cursor';
  cursor.innerHTML = CURSOR_SVG;
  layer.append(cursor);
  host.append(layer);

  let stopped = false;
  const stop = (): void => {
    stopped = true;
  };
  host.addEventListener('pointerdown', stop, { once: true });
  host.addEventListener('wheel', stop, { once: true, passive: true });

  const { clientWidth: w, clientHeight: h } = host;
  const x0 = START[0] * w;
  const y0 = START[1] * h;
  const place = (x: number, y: number): void => {
    // the arrow tip sits at (6, 4) px inside the 30 px icon
    cursor.style.transform = `translate(${x - 6}px, ${y - 4}px)`;
  };
  const startAngle = object.rotation.z;

  try {
    place(x0, y0);
    cursor.animate([{ opacity: 0 }, { opacity: 1 }], { duration: APPEAR, fill: 'forwards' });
    await wait(PRESS);
    if (stopped) return;
    cursor.classList.add('pressed');
    ripple(layer, x0, y0);

    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number): void => {
        const k = Math.min(1, (now - t0) / TURN);
        const e = easeInOut(k);
        object.rotation.z = startAngle - e * Math.PI * 2;
        place(x0 + DRAG_DX * w * e, y0);
        if (k < 1 && !stopped) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    if (stopped) return;

    cursor.classList.remove('pressed');
    ripple(layer, x0 + DRAG_DX * w, y0);
    await wait(RELEASE);
    await cursor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE, fill: 'forwards' }).finished;
  } finally {
    object.rotation.z = startAngle;
    host.removeEventListener('pointerdown', stop);
    layer.remove();
  }
}
