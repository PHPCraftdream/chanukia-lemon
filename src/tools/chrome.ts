// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Screenshots of the built page in headless Chrome (software WebGL).
 *
 * Chrome is looked up in `CHROME_PATH`, then in the usual install locations.
 *
 * @module
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Generous time for decoding the scene in software WebGL. */
const VIRTUAL_TIME_MS = 60000;

const CANDIDATES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function runs(cmd: string): boolean {
  try {
    execFileSync(cmd, ['--version'], { stdio: 'ignore', timeout: 20000 });
    return true;
  } catch {
    return false;
  }
}

/** The first working Chrome, if any. */
export const findChrome = (): string | undefined =>
  [process.env.CHROME_PATH, ...CANDIDATES].find((c): c is string => !!c && runs(c));

export interface Shot {
  /** Query string for the page (see web/src/main.ts). */
  query: string;
  width: number;
  height: number;
  transparent: boolean;
}

/** Screenshot `page` (an HTML file) with `?query` into the PNG `target`. */
export function screenshot(chrome: string, page: string, target: string, shot: Shot): void {
  rmSync(target, { force: true });
  const profile = join(dirname(page), '.chrome-profile');
  mkdirSync(profile, { recursive: true });
  try {
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--no-first-run',
        '--hide-scrollbars',
        ...(process.env.CI ? ['--no-sandbox'] : []),
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        ...(shot.transparent ? ['--default-background-color=00000000'] : []),
        `--user-data-dir=${profile}`,
        `--window-size=${shot.width},${shot.height}`,
        `--virtual-time-budget=${VIRTUAL_TIME_MS}`,
        `--screenshot=${target}`,
        `${pathToFileURL(page).href}?${shot.query}`,
      ],
      { stdio: 'ignore', timeout: 180000 },
    );
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
  if (!existsSync(target)) throw new Error(`Chrome produced no ${target}`);
  console.log(`${target}: captured with ${chrome}`);
}
