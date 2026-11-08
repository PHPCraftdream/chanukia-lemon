// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Colour themes: `light` (lavender), `dark` (night) and `sand` (warm brass).
 * The toggle cycles through them; the choice is remembered.
 *
 * @module
 */

export const THEMES = ['light', 'dark', 'sand'] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = 'chanukia.theme';

const isTheme = (v: unknown): v is Theme =>
  typeof v === 'string' && (THEMES as readonly string[]).includes(v);

/** `?theme=` in the address, else the saved choice, else the system preference. */
export function initialTheme(): Theme {
  const fromUrl = new URLSearchParams(location.search).get('theme');
  if (isTheme(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // storage unavailable: fall through
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // not persisted
  }
}

/** The theme after `theme` in the cycle. */
export const nextTheme = (theme: Theme): Theme => THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];

/** Current theme of the document. */
export const currentTheme = (): Theme => {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : 'light';
};
