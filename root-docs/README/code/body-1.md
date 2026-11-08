>>>>> shared=tree
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

>>>>> lang=en
## Code layout

<<<<< include=tree

Coordinates: Z up, the stem axis is Z, branches lie in the XZ plane (+X is the right half),
the front faces −Y. Parts are built for the right half; the left half is a mirror image.

After changing the geometry: `npm run build`, then `npm run review` and `npm run render`,
and look at the pictures. For a refactoring that must not change the shape,
`npm run compare <reference> out_chabad` must report `same` for every file.

>>>>> lang=ru
## Устройство кода

<<<<< include=tree

Координаты: Z вверх, ось ствола — Z, ветви в плоскости XZ (+X — правая половина),
фронт смотрит в −Y. Детали строятся для правой половины, левая — зеркальное отражение.

После изменения геометрии: `npm run build`, затем `npm run review` и `npm run render`,
и просмотреть картинки. При рефакторинге без изменения формы
`npm run compare <эталон> out_chabad` должен показать `same` для всех файлов.

>>>>> lang=he
## מבנה הקוד

<<<<< include=tree

קואורדינטות: Z כלפי מעלה, ציר הגזע הוא Z, הקנים במישור XZ (+X הוא החצי הימני),
החזית פונה ל־−Y. החלקים נבנים לחצי הימני; החצי השמאלי הוא תמונת ראי.

אחרי שינוי בגאומטריה: `npm run build`, אחר כך `npm run review` ו־`npm run render`,
ולעבור על התמונות. בשינוי מבני שלא אמור לשנות את הצורה,
`npm run compare <reference> out_chabad` חייב להחזיר `same` לכל הקבצים.

