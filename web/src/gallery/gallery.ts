// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Gallery section: thumbnails of the rendered shots, opening the lightbox. Renders start
 * when the section comes near the viewport and are redone when the colour theme changes
 * (the backdrop follows the theme).
 *
 * @module
 */
import type { PackedInstance } from '../../../src/scene-pack.ts';
import { t } from '../i18n.ts';
import type { Lang } from '../i18n.ts';
import type { Placed } from '../viewer/models.ts';
import { createLightbox } from './lightbox.ts';
import { renderShots } from './render.ts';
import { SHOTS } from './shots.ts';

export interface Gallery {
  /** Update captions for a language. */
  setLang(lang: Lang): void;
  /** Re-render (e.g. after a theme change). */
  refresh(): void;
}

const tile = (_: unknown, i: number): string =>
  `<button type="button" class="shot glass" data-shot="${i}">` +
  `<span class="shot-img"></span><span class="shot-caption"></span></button>`;

const isRendered = (url: string): boolean => url !== '';

export function setupGallery(parts: readonly Placed<PackedInstance>[], initialLang: Lang): Gallery {
  const grid = document.getElementById('gallery-grid');
  if (!grid) throw new Error('missing #gallery-grid');
  grid.innerHTML = SHOTS.map(tile).join('');
  const tiles = [...grid.querySelectorAll<HTMLButtonElement>('[data-shot]')];
  const urls: string[] = new Array(SHOTS.length).fill('');
  let lang = initialLang;
  let rendering: Promise<void> | null = null;
  let stale = false;

  const caption = (i: number): string => t(lang, SHOTS[i].key);
  const lightbox = createLightbox(() =>
    urls.map((url, i) => ({ url, caption: caption(i) })).filter((s) => isRendered(s.url)),
  );

  const setCaptions = (): void => {
    tiles.forEach((el, i) => {
      el.querySelector('.shot-caption')!.textContent = caption(i);
      el.setAttribute('aria-label', caption(i));
    });
  };

  const showShot = (i: number, url: string): void => {
    urls[i] = url;
    const img = tiles[i].querySelector<HTMLElement>('.shot-img')!;
    img.style.backgroundImage = `url("${url}")`;
    tiles[i].classList.add('ready');
  };

  const render = (): void => {
    if (rendering) {
      stale = true;
      return;
    }
    rendering = renderShots(parts, SHOTS, showShot)
      .catch((err: unknown) => console.error('gallery:', err))
      .finally(() => {
        rendering = null;
        if (stale) {
          stale = false;
          render();
        }
      });
  };

  tiles.forEach((el, i) => {
    el.onclick = () => {
      if (urls[i] === '') return;
      const ready = urls.slice(0, i).filter(isRendered).length;
      lightbox.open(ready);
    };
  });
  setCaptions();

  // Render once the section is close to view (saves work for visitors who never scroll).
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        render();
      }
    },
    { rootMargin: '600px' },
  );
  observer.observe(grid);

  return {
    setLang(next) {
      lang = next;
      setCaptions();
    },
    refresh() {
      if (urls.some(isRendered)) render();
    },
  };
}
