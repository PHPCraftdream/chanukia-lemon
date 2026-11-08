// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * rspack build of the browser viewer (bundle: `viewer/dist/main.js`).
 *
 * - `npm run build` bundles it and inlines it with the scene into `out_chabad/hanukia.html`
 *   (src/standalone.ts) — a single file that opens from disk without a server.
 * - `npm run viewer` starts a dev server on http://localhost:5173 that serves
 *   `out_chabad/` as `data/` (the viewer then fetches `data/viewer-data.bin`).
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rspack/cli';
import { HtmlRspackPlugin } from '@rspack/core';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'out_chabad');

export default defineConfig({
  context: ROOT,
  entry: { main: './viewer/src/main.ts' },
  output: { path: join(ROOT, 'viewer', 'dist'), clean: true },
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
  plugins: [new HtmlRspackPlugin({ template: './viewer/index.html' })],
  devServer: {
    host: 'localhost',
    port: 5173,
    static: { directory: OUT, publicPath: '/data' },
  },
  performance: { hints: false },
});
