// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * rspack build of the site (`web/`): `web/dist/index.html` + `web/dist/main.js`,
 * with `web/styles.css` inlined into the page head.
 *
 * - `npm run build` bundles it and inlines everything with the scene into
 *   `out_chabad/hanukia.html` (src/standalone.ts) — one file that opens from disk.
 * - `npm run site` starts a dev server on http://localhost:5173 that serves
 *   `out_chabad/` as `data/` (the page then fetches `data/viewer-data.bin`).
 *   Restart it after editing styles.css (styles are inlined at startup).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rspack/cli';
import { HtmlRspackPlugin } from '@rspack/core';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'out_chabad');
const WEB = join(ROOT, 'web');

export default defineConfig({
  context: ROOT,
  entry: { main: './web/src/main.ts' },
  output: { path: join(WEB, 'dist'), clean: true },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'builtin:swc-loader',
        options: { jsc: { parser: { syntax: 'typescript' }, target: 'es2022' } },
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './web/index.html',
      templateParameters: { styles: readFileSync(join(WEB, 'styles.css'), 'utf8') },
    }),
  ],
  devServer: {
    host: 'localhost',
    port: 5173,
    static: { directory: OUT, publicPath: '/data' },
  },
  performance: { hints: false },
});
