// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Search-engine friendly pages: the site is translated at build time into one static page
 * per language (texts in the HTML, not only via script), with per-language title and
 * description, canonical and hreflang links, Open Graph / Twitter cards, schema.org data
 * and a sitemap.
 *
 * Pure string functions — used by src/site.ts and the tests.
 *
 * @module
 */
import { AUTHOR, PROJECT, REPO_URL, SITE_URL } from './credits.ts';

/** Translation dictionary: key -> text. */
export type Dict = Readonly<Record<string, string>>;

export interface PageLang {
  /** BCP 47 code. */
  code: string;
  /** Path of the page relative to the site root ('' for the root). */
  path: string;
  rtl: boolean;
  /** Open Graph locale. */
  ogLocale: string;
}

/** Site pages, the first one is the default (x-default). */
export const PAGES: readonly PageLang[] = [
  { code: 'en', path: '', rtl: false, ogLocale: 'en_US' },
  { code: 'ru', path: 'ru/', rtl: false, ogLocale: 'ru_RU' },
  { code: 'he', path: 'he/', rtl: true, ogLocale: 'he_IL' },
];

/** Home-screen icon, relative to the site root. */
export const TOUCH_ICON = 'apple-touch-icon.png';
/** Social preview image, relative to the site root. */
export const OG_IMAGE = 'og-image.png';
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const pageUrl = (page: PageLang): string => SITE_URL + page.path;

const alternateLink = (p: PageLang): string =>
  `<link rel="alternate" hreflang="${p.code}" href="${pageUrl(p)}" />`;
const sitemapAlternate = (p: PageLang): string =>
  `    <xhtml:link rel="alternate" hreflang="${p.code}" href="${pageUrl(p)}"/>`;
const ogLocaleAlternate = (p: PageLang): string =>
  `<meta property="og:locale:alternate" content="${p.ogLocale}" />`;

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeChar = (c: string): string => ESCAPES[c] ?? c;
/** Escape text for HTML content and double-quoted attributes. */
export const escapeHtml = (s: string): string => s.replace(/[&<>"]/g, escapeChar);

/** Leaf elements with `data-i18n="key"`: their text is replaced. */
const TEXT_RE = /(<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g;
/** Elements with `data-i18n-attr="attr:key,..."`. */
const ATTR_RE = /<\w+\b[^>]*\bdata-i18n-attr="([^"]+)"[^>]*>/g;

/** Set (or add) an attribute in an opening tag. */
function setAttr(tag: string, name: string, value: string): string {
  const re = new RegExp(`\\s${name}="[^"]*"`);
  const attr = ` ${name}="${escapeHtml(value)}"`;
  return re.test(tag) ? tag.replace(re, attr) : tag.replace(/\s*\/?>$/, (end) => `${attr}${end}`);
}

/**
 * Bake a language into the markup: `data-i18n` texts, `data-i18n-attr` attributes, and
 * `lang` / `dir` on <html>. Unknown keys keep the original text.
 */
export function localizeHtml(html: string, page: PageLang, dict: Dict): string {
  const texts = html.replace(
    TEXT_RE,
    (all, open: string, _tag: string, key: string, _old: string, close: string) =>
      key in dict ? `${open}${escapeHtml(dict[key])}${close}` : all,
  );
  const attrs = texts.replace(ATTR_RE, (tag: string, spec: string) =>
    spec.split(',').reduce((t, pair) => {
      const [attr, key] = pair.split(':');
      return attr && key && key in dict ? setAttr(t, attr, dict[key]) : t;
    }, tag),
  );
  return attrs.replace(/<html\b[^>]*>/, (tag) => {
    const withLang = setAttr(setAttr(tag, 'lang', page.code), 'dir', page.rtl ? 'rtl' : 'ltr');
    // language sub-pages always open in their language; the root page keeps auto-detection
    return page.path ? setAttr(withLang, 'data-page-lang', page.code) : withLang;
  });
}

/** Downloadable files referenced by the page (they live in the site root). */
const ASSET_HREF_RE = /href="((?:chabad_[^"/]+\.stl)|(?:chanukia-lemon-print-files\.zip))"/g;

/**
 * Adapt a page for a language sub-directory (`ru/`, `he/`): links to the downloadable files
 * point one level up, and the script learns the same through `data-asset-base`.
 */
export function forSubdirectory(html: string): string {
  return html
    .replace(ASSET_HREF_RE, 'href="../$1"')
    .replace(/<html\b[^>]*>/, (tag) => setAttr(tag, 'data-asset-base', '../'));
}

/** schema.org description of the model. */
function jsonLd(page: PageLang, dict: Dict): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': '3DModel',
    name: PROJECT,
    headline: dict['meta.title'],
    description: dict['meta.description'],
    url: pageUrl(page),
    inLanguage: page.code,
    image: SITE_URL + OG_IMAGE,
    encodingFormat: 'model/stl',
    isAccessibleForFree: true,
    license: `${REPO_URL}/blob/main/LICENSE-MODELS.md`,
    author: { '@type': 'Person', name: AUTHOR, url: `https://github.com/${AUTHOR}` },
    codeRepository: REPO_URL,
    keywords: 'hanukkiah, menorah, chanukah, hanukkah, tea lights, 3D printing, STL, Chabad',
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Head tags for one language page (title and description are set separately). */
export function headTags(page: PageLang, dict: Dict): string {
  const url = pageUrl(page);
  const title = escapeHtml(dict['meta.title']);
  const description = escapeHtml(dict['meta.description']);
  const alternates = PAGES.map(alternateLink);
  return [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="apple-touch-icon" href="${SITE_URL}${TOUCH_ICON}" />`,
    ...alternates,
    `<link rel="alternate" hreflang="x-default" href="${pageUrl(PAGES[0])}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${PROJECT}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${page.ogLocale}" />`,
    ...PAGES.filter((p) => p !== page).map(ogLocaleAlternate),
    `<meta property="og:image" content="${SITE_URL}${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="${OG_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${title}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SITE_URL}${OG_IMAGE}" />`,
    `<script type="application/ld+json">${jsonLd(page, dict)}</script>`,
  ].join('\n');
}

/** Replace title, description and canonical of a page and add the SEO head tags. */
export function withSeoHead(html: string, page: PageLang, dict: Dict): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(dict['meta.title'])}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(dict['meta.description'])}" />`,
    )
    .replace(/<link rel="canonical"[^>]*>\s*/, '')
    .replace('</head>', `${headTags(page, dict)}\n</head>`);
}

/** sitemap.xml listing every language page with its alternates. */
export function sitemapXml(): string {
  const alternates = PAGES.map(sitemapAlternate).join('\n');
  const urls = PAGES.map((p) => `  <url>\n    <loc>${pageUrl(p)}</loc>\n${alternates}\n  </url>`).join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    `${urls}\n</urlset>\n`
  );
}
