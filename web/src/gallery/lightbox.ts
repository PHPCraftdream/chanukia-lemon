// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Full-screen image viewer: previous / next (buttons, arrow keys, swipe), close
 * (button, Esc, click on the backdrop). Arrow keys follow the reading direction, so in
 * Hebrew "next" is to the left.
 *
 * @module
 */

export interface Slide {
  url: string;
  caption: string;
}

export interface Lightbox {
  open(index: number): void;
}

/** Minimum horizontal swipe, px. */
const SWIPE = 50;

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el as T;
};

const isRtl = (): boolean => document.documentElement.dir === 'rtl';

/** Wire the lightbox markup; `slides()` is read on every open, so captions stay current. */
export function createLightbox(slides: () => readonly Slide[]): Lightbox {
  const box = byId('lightbox');
  const image = byId<HTMLImageElement>('lightbox-image');
  const caption = byId('lightbox-caption');
  const counter = byId('lightbox-counter');
  let index = 0;
  let lastFocus: HTMLElement | null = null;

  const show = (i: number): void => {
    const list = slides();
    if (list.length === 0) return;
    index = (i + list.length) % list.length;
    image.src = list[index].url;
    image.alt = list[index].caption;
    caption.textContent = list[index].caption;
    counter.textContent = `${index + 1} / ${list.length}`;
  };
  const close = (): void => {
    box.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus();
  };
  const step = (delta: number): void => show(index + delta);

  byId('lightbox-close').onclick = close;
  byId('lightbox-prev').onclick = () => step(-1);
  byId('lightbox-next').onclick = () => step(1);
  box.onclick = (e) => {
    if (e.target === box) close();
  };
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(isRtl() ? -1 : 1);
    else if (e.key === 'ArrowLeft') step(isRtl() ? 1 : -1);
  });
  let touchX: number | null = null;
  box.addEventListener('touchstart', (e) => {
    touchX = e.touches[0]?.clientX ?? null;
  });
  box.addEventListener('touchend', (e) => {
    const end = e.changedTouches[0]?.clientX;
    if (touchX === null || end === undefined) return;
    const dx = end - touchX;
    if (Math.abs(dx) > SWIPE) step(dx < 0 !== isRtl() ? 1 : -1);
    touchX = null;
  });

  return {
    open(i) {
      lastFocus = document.activeElement as HTMLElement | null;
      show(i);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      byId('lightbox-close').focus();
    },
  };
}
