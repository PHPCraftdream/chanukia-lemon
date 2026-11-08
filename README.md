[![CI](https://github.com/PHPCraftdream/chanukia-lemon/actions/workflows/ci.yml/badge.svg)](https://github.com/PHPCraftdream/chanukia-lemon/actions/workflows/ci.yml)
![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue)

# Chanukia Lemon — a hanukkiah for tea lights

**Languages:** **English** · [Русский](README.ru.md) · [עברית](README.he.md)

**Website with the 3D model and print files:** https://phpcraftdream.github.io/chanukia-lemon/

A parametric Chabad-style hanukkiah for 3D printing: a central stem on a foot,
straight 45° branches with knops (kaftorim), leaves and flame-tongue reliefs,
tea-light cups with laurel wreaths, and the shamash on top of the stem.

The code is TypeScript. The geometry is built with
[manifold-3d](https://github.com/elalish/manifold) (WebAssembly); the output is STL
files for a print shop, a 3D site in a single HTML file, and inspection renders.

## Quick start

Node.js 24 or newer runs the `.ts` sources directly, without a build step.

```sh
npm install
npm run build          # STL + out_chabad/hanukia.html
npm test
```

`out_chabad/hanukia.html` is the whole site in one file: it opens with a double click,
without a server or internet access (code and models are embedded, about 6 MB).

| Command                | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| `npm run build`        | `build:stl` + `build:site`                                      |
| `npm run build:stl`    | parts → STL in `out_chabad/` + the scene package for the site   |
| `npm run build:site`   | site bundle (rspack) → `out_chabad/hanukia.html` + its check    |
| `npm run site`         | site dev server on http://localhost:5173                        |
| `npm test`             | tests (`node:test`): layout, formats, parts, fits, translations |
| `npm run review`       | assembly review: contacts, clearances, insertion paths          |
| `npm run render`       | inspection PNGs (close-ups and sections) → `out_chabad/inspect/` |
| `npm run docs`         | rebuild the README in three languages from `root-docs/`         |
| `npm run typecheck`    | type checks (Node code and the site)                            |

## Files for the print shop

All `chabad_*.stl` from `out_chabad/` (also downloadable from the website), except
`chabad_full.stl`, which is the whole hanukkiah as one model for viewing only.

| File                           | Qty | Note                                        |
| ------------------------------ | --: | ------------------------------------------- |
| `chabad_fit_test.stl`          |   1 | **print first**: checks the fits            |
| `chabad_stem_lower.stl`        |   1 | foot and lower stem                         |
| `chabad_stem_upper.stl`        |   1 | upper stem with the shamash                 |
| `chabad_branch1_x2.stl` … `3`  |   2 | branches (left and right are identical)     |
| `chabad_branch4a_inner_x2.stl` |   2 | long branch, inner half                     |
| `chabad_branch4b_outer_x2.stl` |   2 | long branch, outer half                     |
| `chabad_rod_pin_x1.stl`        |   1 | left half of the stiffening rod (with pin)  |
| `chabad_rod_socket_x1.stl`     |   1 | right half of the rod (with socket)         |

## Printing

FDM, PETG. Recommended settings:

- bed of at least 300 mm (the longest branch is 298 mm; the rods fit diagonally on 256 mm);
- stem and foot: 4 perimeters, gyroid infill 12–15 %;
- branches: 4–5 perimeters, gyroid infill 25–30 %;
- rods, tenons and pins: solid;
- layer 0.12–0.16 mm to keep the reliefs crisp;
- branches print with supports, the upper stem with a brim.

Use tea lights only in their aluminium cups and never leave a lit hanukkiah unattended.

## Assembly

1. Join the stem halves (pins with crush ribs) and glue the joint.
2. Insert the branches **from the stem outwards**: 1, 2, 3, then the long one (assemble it
   from its two halves first). Each branch slides in along its own axis: the tenon into the
   socket, the tube into the recess of the knob.
3. Push the two rod halves through the holes in the cups from both sides until the "jack"
   inside the stem snaps in.
4. Put a drop of glue (epoxy or CA) into every rod hole in the cups from the back.

Fits: 0.15 mm clearance per side on the body of a part; the crush ribs give about 0.1 mm
of interference. The rod holes in the cups are oversized (0.75 mm clearance) to absorb print
errors and shrinkage; the precise hole in the stem sets the rod line. If the fit test is too
tight or too loose, adjust `SOCKET_R`, `ROD_HOLE_R` and the rib heights `*_RIB_H` in
`src/params.ts` and rebuild.

## Parameters

All sizes live in [`src/params.ts`](src/params.ts), each with a description. The main ones:

| Parameter                        | Value | Meaning                                       |
| -------------------------------- | ----: | --------------------------------------------- |
| `POCKET_D`                       | 40 mm | pocket diameter for the tea light             |
| `GAP`                            | 14 mm | gap between cups (candle pitch 60 mm)         |
| `STEM_OFFSET`                    | 20 mm | cups moved away from the stem (shamash heat)  |
| `SHAMASH_LIFT`                   | 50 mm | how much higher the shamash stands            |
| `STEM_R` / `BRANCH_R` / `FOOT_R` |       | stem and branch thickness, foot radius        |
| `Z_J0`                           | 84 mm | height of the lowest branch above the table   |

Overall size: 545 × 180 × 414 mm.

## Code layout

```
src/
  params.ts       all parameters
  layout.ts       placement of branches, cups and knops (pure math)
  geom.ts         manifold-3d set-up, WASM memory tracking, primitives
  fits.ts         joints: ribs, D-holes, split cuts with pins
  decor.ts        wreath, grooves, calyx, leaves, flame tongues
  parts/          parts: cup, branch, stem, rod, fit-test
  assembly.ts     print-part catalogue and the whole assembly
  stl.ts          STL read/write, volume, watertightness
  scene-pack.ts   scene package format for the site (Node and browser)
  affine.ts       assembled -> print matrix from two copies of a mesh
  credits.ts      author attribution (GPL-3.0 section 7(b))
  build.ts        CLI: STL + scene package
  standalone.ts   CLI: the self-contained hanukia.html
  tools/          review, render, compare-stl, check-standalone, docs
web/              site: index.html, styles.css, src/ (i18n, themes, 3D viewer)
test/             node:test suites
root-docs/        README sources in three languages (polydoc)
```

Coordinates: Z up, the stem axis is Z, branches lie in the XZ plane (+X is the right half),
the front faces −Y. Parts are built for the right half; the left half is a mirror image.

After changing the geometry: `npm run build`, then `npm run review` and `npm run render`,
and look at the pictures. For a refactoring that must not change the shape,
`npm run compare <reference> out_chabad` must report `same` for every file.

## CI and the website

On every push and pull request GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
checks formatting, types, tests and the README translations, then builds the models and the
site. From `main` the result is published to GitHub Pages: the home page is the site with the
3D model, and all STL files sit next to it for download.

## License

The project has two licenses (details in [NOTICE](NOTICE)):

- **source code** — [GNU GPL v3](LICENSE) with an attribution term under section 7(b);
- **models** (the design, every STL, renders, printed objects and all derivatives,
  including models from forks) — [Chanukia Lemon Model License](LICENSE-MODELS.md).

You may freely use, modify, share and print the models. **Printed objects made from these
models, from forks or from any derivative may be sold only if every purchase includes the
attribution with both links** (for example a card in the package):

> Chanukia Lemon by PHPCraftdream — https://phpcraftdream.github.io/chanukia-lemon/ —
> https://github.com/PHPCraftdream/chanukia-lemon

The attribution is already embedded in the header of every STL and in the site.
