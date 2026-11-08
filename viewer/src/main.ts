// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Viewer entry: assembled / exploded view of the hanukkiah and the print set,
 * with a part list that highlights parts on hover.
 *
 * @module
 */
import * as THREE from 'three';
import type { PackedFile } from '../../src/scene-pack.ts';
import { assemblyOf, loadScene, printSetOf } from './models.ts';
import type { Placed } from './models.ts';
import { ASSEMBLY_TARGET_Z, PANEL_SHIFT_X, createStage } from './scene.ts';

const HIGHLIGHT = 0x553300;
const NO_GLOW = 0x000000;

const byId = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el as T;
};

const shortName = (file: string): string => file.replace('chabad_', '').replace('.stl', '');

/** Row of the part list; the name links to the STL next to the page (local build or the site). */
const partListRow = (f: PackedFile): string =>
  `<tr data-file="${f.file}"><td><a href="${f.file}" download>${shortName(f.file)}</a></td>` +
  `<td>×${f.qty}</td><td>${f.size.join('×')} мм</td></tr>`;

const setWireframe =
  (on: boolean) =>
  (p: Placed<unknown>): void => {
    p.mesh.material.wireframe = on;
  };

const rootOf = (p: Placed<unknown>): THREE.Group => p.root;

const glow = (p: Placed<unknown>, on: boolean): void => {
  p.mesh.material.emissive.setHex(on ? HIGHLIGHT : NO_GLOW);
};

async function main(): Promise<void> {
  const status = byId('status');
  const stage = createStage(document.body);
  const scene = await loadScene();
  const parts = assemblyOf(scene);
  const print = printSetOf(scene);

  const assembly = new THREE.Group();
  assembly.add(...parts.map(rootOf));
  print.group.visible = false;
  stage.scene.add(assembly, print.group);

  const highlight = (file: string | null): void => {
    for (const p of parts) glow(p, p.info.printFile === file);
    for (const p of print.items) glow(p, p.info.file === file);
  };

  const list = byId('list');
  list.innerHTML = `<table>${scene.header.files.map(partListRow).join('')}</table>`;
  for (const row of list.querySelectorAll<HTMLTableRowElement>('tr')) {
    row.onmouseenter = () => {
      row.classList.add('hl');
      highlight(row.dataset.file ?? null);
    };
    row.onmouseleave = () => {
      row.classList.remove('hl');
      highlight(null);
    };
  }

  const explode = byId<HTMLInputElement>('explode');
  explode.oninput = () => {
    const k = Number(explode.value);
    for (const p of parts)
      p.root.position.set(p.info.explode[0] * k, p.info.explode[1] * k, p.info.explode[2] * k);
  };

  byId<HTMLInputElement>('wire').onchange = (e) => {
    const on = (e.target as HTMLInputElement).checked;
    parts.forEach(setWireframe(on));
    print.items.forEach(setWireframe(on));
  };

  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name=mode]')) {
    radio.onchange = () => {
      const printMode = radio.value === 'print' && radio.checked;
      assembly.visible = !printMode;
      print.group.visible = printMode;
      stage.controls.target.set(PANEL_SHIFT_X, 0, printMode ? 0 : ASSEMBLY_TARGET_Z);
    };
  }

  status.textContent = `${parts.length} деталей в сборке, ${scene.header.files.length} файлов для печати`;
}

const showError = (err: unknown): void => {
  byId('status').textContent = `ошибка: ${err instanceof Error ? err.message : String(err)}`;
};

main().catch(showError);
