// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/** Build-time translation of the page and the SEO head / sitemap. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SITE_URL } from '../src/credits.ts';
import { PAGES, escapeHtml, forSubdirectory, localizeHtml, sitemapXml, withSeoHead } from '../src/seo.ts';
import { he, ru } from '../web/src/dict.ts';

const [EN, RU, HE] = PAGES;
const PAGE =
  '<html lang="en" data-theme="light"><head><title>Old</title>' +
  '<meta name="description" content="old" />' +
  '<link rel="canonical" href="x" /></head><body>' +
  '<h2 data-i18n="files.title">Files for the print shop</h2>' +
  '<button data-i18n-attr="title:theme.title,aria-label:theme.title" title="Colour theme">x</button>' +
  '<a href="chanukia-lemon-print-files.zip" download>zip</a> <a href="chabad_full.stl">full</a>' +
  '<a href="#files">anchor</a></body></html>';

describe('seo', () => {
  it('bakes texts, attributes, lang and direction into the page', () => {
    const html = localizeHtml(PAGE, HE, he);
    assert.match(html, /<html lang="he" data-theme="light" dir="rtl" data-page-lang="he">/);
    assert.ok(html.includes(`>${escapeHtml(he['files.title'])}</h2>`));
    assert.ok(html.includes(`title="${escapeHtml(he['theme.title'])}"`));
    assert.ok(html.includes(`aria-label="${escapeHtml(he['theme.title'])}"`));
  });

  it('keeps language auto-detection on the root page', () => {
    assert.doesNotMatch(localizeHtml(PAGE, EN, {}), /data-page-lang/);
  });

  it('points downloads one level up on language sub-pages, but not anchors', () => {
    const html = forSubdirectory(PAGE);
    assert.ok(html.includes('href="../chanukia-lemon-print-files.zip"'));
    assert.ok(html.includes('href="../chabad_full.stl"'));
    assert.ok(html.includes('href="#files"'));
    assert.match(html, /data-asset-base="\.\.\/"/);
  });

  it('writes a per-language head with canonical, hreflang, Open Graph and schema.org', () => {
    const html = withSeoHead(PAGE, RU, ru);
    assert.ok(html.includes(`<title>${escapeHtml(ru['meta.title'])}</title>`));
    assert.ok(html.includes(`<meta name="description" content="${escapeHtml(ru['meta.description'])}" />`));
    assert.equal(html.match(/rel="canonical"/g)?.length, 1);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE_URL}ru/" />`));
    for (const p of PAGES) assert.ok(html.includes(`hreflang="${p.code}" href="${SITE_URL}${p.path}"`));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(html.includes('<meta property="og:locale" content="ru_RU" />'));
    const ld = /<script type="application\/ld\+json">(.*?)<\/script>/.exec(html);
    assert.ok(ld);
    const data = JSON.parse(ld[1]) as Record<string, unknown>;
    assert.equal(data['@type'], '3DModel');
    assert.equal(data.inLanguage, 'ru');
  });

  it('lists every language page in the sitemap', () => {
    const xml = sitemapXml();
    for (const p of PAGES) assert.ok(xml.includes(`<loc>${SITE_URL}${p.path}</loc>`));
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  });
});
