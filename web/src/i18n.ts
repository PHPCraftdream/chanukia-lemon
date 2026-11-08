// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Applying the site translations (see dict.ts) to the page.
 *
 * Markup carries `data-i18n="key"` (text content) and
 * `data-i18n-attr="attr:key,attr:key"` (attributes).
 *
 * @module
 */

import { en, he, ru } from './dict.ts';
import type { Dict, Key } from './dict.ts';

export type { Key } from './dict.ts';

export const LANGS = ['ru', 'en', 'he'] as const;
export type Lang = (typeof LANGS)[number];

const DICTS: Record<Lang, Dict> = { en, ru, he };
const RTL: ReadonlySet<Lang> = new Set<Lang>(['he']);
const STORAGE_KEY = 'chanukia.lang';

const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** Translate a key, substituting `{name}` placeholders. */
export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  return DICTS[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

/**
 * `?lang=` in the address, else the language of a language sub-page, else the saved choice,
 * else the browser language, else English.
 */
export function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  const page = document.documentElement.dataset.pageLang; // /ru/, /he/ pages (see src/seo.ts)
  if (isLang(page)) return page;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // storage unavailable (e.g. privacy mode): fall through
  }
  const browser = navigator.language.slice(0, 2);
  return isLang(browser) ? browser : 'en';
}

function remember(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // not persisted; the choice still applies to this page
  }
}

/** Apply a language to the whole document: texts, attributes, `lang` and direction. */
export function applyLang(lang: Lang, root: ParentNode = document): void {
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
  document.title = t(lang, 'meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t(lang, 'meta.description'));
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n]')) {
    el.textContent = t(lang, el.dataset.i18n as Key);
  }
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n-attr]')) {
    for (const pair of (el.dataset.i18nAttr ?? '').split(',')) {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr, t(lang, key as Key));
    }
  }
  remember(lang);
}
