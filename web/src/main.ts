// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Site entry: language and theme switching, the interactive 3D model (assembled /
 * exploded / print layout) and the table of print files linked to the model.
 *
 * @module
 */
import * as THREE from 'three';
import type { PackedFile } from '../../src/scene-pack.ts';
import { partKey } from './dict.ts';
import { LANGS, applyLang, initialLang, t } from './i18n.ts';
import type { Lang } from './i18n.ts';
import { applyTheme, currentTheme, initialTheme, nextTheme } from './theme.ts';
import { setupGallery } from './gallery/gallery.ts';
import type { Gallery } from './gallery/gallery.ts';
import { explodeOffset } from './viewer/explode.ts';
import { playIntro } from './viewer/intro.ts';
import { assemblyOf, loadScene, printSetOf } from './viewer/models.ts';
import type { Placed, Scene } from './viewer/models.ts';
import type { PackedInstance } from '../../src/scene-pack.ts';
import { createStage, frame, frameFromAbove, frameFront } from './viewer/stage.ts';
import type { Stage } from './viewer/stage.ts';

const HIGHLIGHT = 0x664400;
const NO_GLOW = 0x000000;

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el as T;
};

const rootOf = (p: Placed<unknown>): THREE.Group => p.root;
const glow = (p: Placed<unknown>, on: boolean): void => {
  p.mesh.material.emissive.setHex(on ? HIGHLIGHT : NO_GLOW);
};
const setWireframe =
  (on: boolean) =>
  (p: Placed<unknown>): void => {
    p.mesh.material.wireframe = on;
  };

/** Numbers keep their left-to-right order inside right-to-left text. */
const ltr = (text: string): string => `<bdi dir="ltr">${text}</bdi>`;

/** Where the downloadable files are, relative to this page ('../' on the /ru/ and /he/ pages). */
const ASSET_BASE = document.documentElement.dataset.assetBase ?? '';

const fileRow = (lang: Lang, f: PackedFile): string =>
  `<tr data-file="${f.file}">` +
  `<td>${t(lang, partKey(f.file))}<div class="file">${f.file}</div></td>` +
  `<td class="num">${ltr(`×${f.qty}`)}</td>` +
  `<td class="num">${ltr(f.size.join(' × '))}</td>` +
  `<td class="num">${ltr(String(f.volumeCm3))} ${t(lang, 'files.cm3')}</td>` +
  `<td><a class="btn btn-ghost btn-small" href="${ASSET_BASE}${f.file}" download>${t(lang, 'files.download')}</a></td>` +
  `</tr>`;

/** Wire the language buttons; `onChange` re-renders language-dependent dynamic content. */
function setupLanguage(onChange: (lang: Lang) => void): () => Lang {
  let lang = initialLang();
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-lang]');
  const apply = (next: Lang): void => {
    lang = next;
    applyLang(lang);
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    onChange(lang);
  };
  for (const b of buttons) {
    const target = LANGS.find((l) => l === b.dataset.lang);
    if (target) b.onclick = () => apply(target);
  }
  apply(lang);
  return () => lang;
}

function setupTheme(onChange: () => void): void {
  applyTheme(initialTheme());
  byId('theme').onclick = () => {
    applyTheme(nextTheme(currentTheme()));
    onChange();
  };
}

/** `?poster` renders only the model on a transparent page (the build screenshots it). */
const PARAMS = new URLSearchParams(location.search);
/** `?og` renders the model on the page background for the social preview image. */
const OG_MODE = PARAMS.has('og');
/** `?icon` renders the model straight from the front, tightly framed, for the site icon. */
const ICON_MODE = PARAMS.has('icon');
const POSTER_MODE = PARAMS.has('poster') || OG_MODE || ICON_MODE;

interface Model {
  highlight: (file: string | null) => void;
  parts: Placed<PackedInstance>[];
  assembly: THREE.Group;
}

/** Fade out the static poster shown while the model loads. */
function hidePoster(): void {
  const poster = document.getElementById('poster');
  if (!poster || poster.hidden) return;
  poster.classList.add('gone');
  poster.addEventListener('transitionend', () => poster.remove(), { once: true });
}

/** 3D model, mode switch, explode slider and wireframe. */
function setupModel(stage: Stage, scene: Scene): Model {
  const parts = assemblyOf(scene);
  const print = printSetOf(scene);
  const assembly = new THREE.Group();
  assembly.add(...parts.map(rootOf));
  print.group.visible = false;
  stage.scene.add(assembly, print.group);
  frame(stage, assembly);

  const modes = document.querySelectorAll<HTMLButtonElement>('[data-mode]');
  for (const button of modes) {
    button.onclick = () => {
      const printMode = button.dataset.mode === 'print';
      for (const b of modes) b.setAttribute('aria-pressed', String(b === button));
      assembly.visible = !printMode;
      print.group.visible = printMode;
      if (printMode) frameFromAbove(stage, print.group);
      else frame(stage, assembly);
    };
  }
  // `?mode=print` opens the print layout directly (shareable link)
  const initialMode = new URLSearchParams(location.search).get('mode');
  for (const button of modes) if (button.dataset.mode === initialMode) button.click();

  const explode = byId<HTMLInputElement>('explode');
  explode.oninput = () => {
    const s = Number(explode.value) / Number(explode.max);
    for (const p of parts) p.root.position.set(...explodeOffset(p.info, s));
  };

  byId<HTMLInputElement>('wire').onchange = (e) => {
    const on = (e.target as HTMLInputElement).checked;
    parts.forEach(setWireframe(on));
    print.items.forEach(setWireframe(on));
  };

  const highlight = (file: string | null): void => {
    for (const p of parts) glow(p, p.info.printFile === file);
    for (const p of print.items) glow(p, p.info.file === file);
  };
  return { highlight, parts, assembly };
}

/** Fill the files table and link row hover to the model highlight. */
function renderFiles(
  lang: Lang,
  files: readonly PackedFile[],
  highlight: (file: string | null) => void,
): void {
  const body = byId('file-rows');
  body.innerHTML = files.map((f) => fileRow(lang, f)).join('');
  for (const row of body.querySelectorAll<HTMLTableRowElement>('tr')) {
    row.onmouseenter = () => {
      row.classList.add('hl');
      highlight(row.dataset.file ?? null);
    };
    row.onmouseleave = () => {
      row.classList.remove('hl');
      highlight(null);
    };
  }
}

async function main(): Promise<void> {
  if (POSTER_MODE) document.documentElement.classList.add('poster-mode');
  if (OG_MODE) document.documentElement.classList.add('og-mode');
  if (ICON_MODE && PARAMS.get('icon') === 'bg') document.documentElement.classList.add('og-mode');
  let gallery: Gallery | null = null;
  setupTheme(() => gallery?.refresh());
  const status = byId('status');
  let scene: Scene | null = null;
  let model: Model | null = null;
  let failure: string | null = null;

  const renderDynamic = (lang: Lang): void => {
    if (failure !== null) status.textContent = t(lang, 'viewer.error', { message: failure });
    else if (scene && model) {
      status.textContent = t(lang, 'viewer.ready', { parts: scene.header.instances.length });
      renderFiles(lang, scene.header.files, model.highlight);
      gallery?.setLang(lang);
    }
  };
  const lang = setupLanguage(renderDynamic);

  try {
    const host = byId('viewer');
    const stage = createStage(host);
    scene = await loadScene();
    model = setupModel(stage, scene);
    if (ICON_MODE) frameFront(stage, model.assembly);
    if (!POSTER_MODE) {
      gallery = setupGallery(model.parts, lang());
      requestAnimationFrame(() => {
        hidePoster();
        void playIntro(model!.assembly, host);
      });
    }
  } catch (err) {
    failure = err instanceof Error ? err.message : String(err);
  }
  renderDynamic(lang());
}

void main();
