// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Site translations: every language has every key, placeholders match, and every key
 * used in the page markup exists.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { en, he, ru } from '../web/src/dict.ts';
import type { Dict } from '../web/src/dict.ts';

const LANGS: Record<string, Dict> = { en, ru, he };
const SCRIPT: Record<string, RegExp> = { ru: /[А-Яа-яЁё]/, he: /[֐-׿]/ };
const placeholders = (s: string): string[] => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const keysInMarkup = (html: string): string[] => [
  ...[...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap((m) =>
    m[1].split(',').map((p) => p.split(':')[1]),
  ),
];

describe('site translations', () => {
  const keys = Object.keys(en).sort();

  for (const [lang, dict] of Object.entries(LANGS)) {
    it(`${lang}: has exactly the English keys, all non-empty, same placeholders`, () => {
      assert.deepEqual(Object.keys(dict).sort(), keys);
      for (const key of keys) {
        const text = dict[key as keyof Dict];
        assert.ok(text.trim().length > 0, `${lang} ${key} is empty`);
        assert.deepEqual(
          placeholders(text),
          placeholders(en[key as keyof Dict]),
          `${lang} ${key} placeholders`,
        );
      }
    });
  }

  for (const [lang, script] of Object.entries(SCRIPT)) {
    it(`${lang}: translated texts are written in its script`, () => {
      for (const key of keys) {
        const text = LANGS[lang][key as keyof Dict];
        if (text === en[key as keyof Dict]) continue; // brand names, numbers (e.g. "PETG · FDM")
        assert.match(text, script, `${lang} ${key} looks untranslated: ${text}`);
      }
    });
  }

  it('every key used in web/index.html exists', () => {
    const html = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
    const used = keysInMarkup(html);
    assert.ok(used.length > 30);
    for (const key of used) assert.ok(key in en, `unknown key in markup: ${key}`);
  });
});
