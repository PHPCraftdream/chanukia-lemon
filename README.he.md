[![CI](https://github.com/PHPCraftdream/chanukia-lemon/actions/workflows/ci.yml/badge.svg)](https://github.com/PHPCraftdream/chanukia-lemon/actions/workflows/ci.yml)
![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue)

<p align="center"><img src="docs/hanukia-front.png" alt="Chanukia Lemon — front view" width="100%"></p>

# Chanukia Lemon — חנוכייה לנרות טי־לייט

**שפות:** [English](README.md) · [Русский](README.ru.md) · **עברית**

**אתר עם מודל התלת־ממד וקובצי ההדפסה:** https://phpcraftdream.github.io/chanukia-lemon/

חנוכייה פרמטרית בסגנון חב״ד להדפסת תלת־ממד: גזע מרכזי על בסיס, קנים ישרים
בזווית 45° עם כפתורים, עלים ותבליטי לשונות אש, גביעים לנרות טי־לייט עם זרי
דפנה, והשמש בראש הגזע.

הקוד כתוב ב־TypeScript. את הגאומטריה בונה הספרייה
[manifold-3d](https://github.com/elalish/manifold) (WebAssembly); התוצר הוא קובצי
STL לבית דפוס, אתר תלת־ממד בקובץ HTML יחיד ותמונות בדיקה.

## התחלה מהירה

נדרש Node.js 24 ומעלה: הוא מריץ את קובצי ה־`.ts` ישירות, בלי שלב בנייה.

```sh
npm install
npm run build          # STL + out_chabad/hanukia.html
npm test
```

`out_chabad/hanukia.html` — האתר כולו בקובץ אחד: נפתח בלחיצה כפולה, בלי שרת
ובלי אינטרנט (הקוד והמודלים מוטמעים בקובץ, כ־6 MB).

| פקודה                  | מה היא עושה                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run build`        | `build:stl` + `build:site`                                          |
| `npm run build:stl`    | חלקים → STL בתיקייה `out_chabad/` + חבילת הסצנה לאתר                |
| `npm run build:site`   | חבילת האתר (rspack) → `out_chabad/hanukia.html` + בדיקתו            |
| `npm run site`         | שרת פיתוח לאתר בכתובת http://localhost:5173                         |
| `npm test`             | בדיקות (`node:test`): פריסה, פורמטים, חלקים, התאמות, פירוק, תרגומים |
| `npm run review`       | בדיקת ההרכבה: מגעים, מרווחים, מסלולי הכנסה                          |
| `npm run render`       | תמונות PNG לבדיקה (תקריבים וחתכים) → `out_chabad/inspect/`          |
| `npm run docs`         | בניית ה־README מחדש בשלוש שפות מתוך `root-docs/`                    |
| `npm run readme-image` | תמונת הכותרת של ה־README ← `docs/` (אחרי בנייה, דרוש Chrome)        |
| `npm run typecheck`    | בדיקת טיפוסים (קוד Node והאתר)                                      |

## קבצים לבית הדפוס

כל קובצי `chabad_*.stl` מהתיקייה `out_chabad/` (אפשר להוריד אותם גם מהאתר), מלבד
`chabad_full.stl` — החנוכייה כולה כמודל אחד, לצפייה בלבד.

| קובץ                            | כמות | הערה                                               |
| ------------------------------- | ---: | -------------------------------------------------- |
| `chabad_fit_test.stl`           |    1 | **להדפיס ראשון**: בדיקת ההתאמות                    |
| `chabad_foot.stl`               |    1 | בסיס                                               |
| `chabad_stem_lower.stl`         |    1 | חלק תחתון של הגזע                                  |
| `chabad_stem_upper.stl`         |    1 | חלק עליון של הגזע                                  |
| `chabad_shamash_cup.stl`        |    1 | גביע השמש — פלסטיק עמיד בחום                       |
| `chabad_branch1_x2.stl`         |    2 | קנה 1 — פלסטיק עמיד בחום                           |
| `chabad_branch2a_inner_x2.stl`  |    2 | קנה 2, חצי פנימי                                   |
| `chabad_branch34a_inner_x4.stl` |    4 | קנים 3 ו־4, חצי פנימי                              |
| `chabad_branch23b_outer_x4.stl` |    4 | קנים 2 ו־3, חצי חיצוני עם הגביע — פלסטיק עמיד בחום |
| `chabad_branch4b_outer_x2.stl`  |    2 | קנה 4, חצי חיצוני עם הגביע — פלסטיק עמיד בחום      |
| `chabad_rod_pin_x1.stl`         |    1 | חצי שמאלי של מוט החיזוק (עם פין)                   |
| `chabad_rod_socket_x1.stl`      |    1 | חצי ימני של המוט (עם שקע)                          |

## הדפסה

FDM: ‏PETG, ואת החלקים עם הגביעים — גביע השמש, קנה 1 והחצאים החיצוניים של הקנים —
מפלסטיק עמיד בחום (ASA,‏ ABS או PC). הגדרות מומלצות:

- משטח של 256 מ״מ לפחות (המוטות של 272 מ״מ נכנסים באלכסון; חלקי הקנים — עד 211 מ״מ);
- גזע ובסיס: 4 היקפים, מילוי ג׳ירואיד 12–15 %;
- קנים: 4–5 היקפים, מילוי ג׳ירואיד 25–30 %;
- מוטות, זיזים ופינים: מלאים;
- שכבה של 0.12–0.16 מ״מ, כדי שהתבליטים יישארו חדים;
- הקנים מודפסים עם תמיכות, חלקי הגזע — זקופים, עם שוליים (brim).

נרות טי־לייט רק בתוך גביעי האלומיניום שלהם; אין להשאיר חנוכייה דולקת ללא השגחה.

## הרכבה

1. מחברים את ארבעת חלקי הגזע — בסיס, תחתון, עליון וגביע השמש (פינים עם צלעות מעיכה) —
   ומדביקים את החיבורים.
2. מכניסים את הקנים **מהגזע החוצה**: 1, אחר כך החצאים הפנימיים של 2, 3 ו־4, ועליהם את החצאים
   החיצוניים עם הגביעים. כל חלק נכנס לאורך הציר שלו: הזיז לשקע, הצינור לשקע שבכפתור. מדביקים
   כל חיבור.
3. דוחפים את שני חצאי המוט דרך הכפתורים העליונים שמתחת לגביעים משני הצדדים, עד שה״שקע־תקע״
   בתוך הגזע ננעל.
4. מטפטפים דבק (אפוקסי או ציאנואקרילט) לכל חור של המוט בכפתורים העליונים מהצד האחורי.

התאמות: מרווח של 0.15 מ״מ לכל צד בגוף החלק; צלעות המעיכה נותנות הידוק של כ־0.1 מ״מ.
חורי המוט בכפתורים מוגדלים (מרווח 0.75 מ״מ) כדי לספוג שגיאות הדפסה והתכווצות; את קו
המוט קובע החור המדויק בגזע. אם דגם הבדיקה נכנס הדוק מדי או משוחרר מדי — שנו את
`SOCKET_R`, `ROD_HOLE_R` ואת גובה הצלעות `*_RIB_H` בקובץ `src/params.ts` ובנו מחדש.

## פרמטרים

כל המידות נמצאות ב־[`src/params.ts`](src/params.ts), לכל אחת יש תיאור. העיקריות:

| פרמטר                            |    ערך | משמעות                                   |
| -------------------------------- | -----: | ---------------------------------------- |
| `POCKET_D`                       | 40 מ״מ | קוטר השקע לנר                            |
| `GAP`                            | 14 מ״מ | מרווח בין הגביעים (פסיעת נרות 60 מ״מ)    |
| `STEM_OFFSET`                    | 20 מ״מ | הרחקת הגביעים מהגזע (חום השמש)           |
| `SHAMASH_LIFT`                   | 50 מ״מ | בכמה השמש גבוה מהשאר                     |
| `STEM_R` / `BRANCH_R` / `FOOT_R` |        | עובי הגזע והקנים, רדיוס הבסיס            |
| `Z_J0`                           | 84 מ״מ | גובה הקנה התחתון מעל השולחן              |

מידות כוללות: 545 × 180 × 414 מ״מ.

## מבנה הקוד

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
  package.ts      CLI: ZIP for the print shop (STL, instructions, licences, links)
  standalone.ts   CLI: the self-contained hanukia.html (poster and icon embedded)
  site.ts         CLI: GitHub Pages site — /, /ru/, /he/, sitemap, preview image
  seo.ts          per-language pages, hreflang, Open Graph, schema.org, sitemap
  zip.ts crc32.ts minimal deterministic ZIP writer
  tools/          review, render, compare-stl, check-standalone, docs, poster,
                  readme-image (chrome.ts: headless Chrome screenshots)
web/              site: index.html, styles.css, src/ (i18n, themes, viewer, gallery)
test/             node:test suites
root-docs/        README sources in three languages (polydoc)
docs/             README header image (npm run readme-image)
```

קואורדינטות: Z כלפי מעלה, ציר הגזע הוא Z, הקנים במישור XZ (+X הוא החצי הימני),
החזית פונה ל־−Y. החלקים נבנים לחצי הימני; החצי השמאלי הוא תמונת ראי.

אחרי שינוי בגאומטריה: `npm run build`, אחר כך `npm run review` ו־`npm run render`,
ולעבור על התמונות. בשינוי מבני שלא אמור לשנות את הצורה,
`npm run compare <reference> out_chabad` חייב להחזיר `same` לכל הקבצים.

## CI והאתר

בכל דחיפה ובכל pull request ‏GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
בודק עיצוב קוד, טיפוסים, בדיקות ותרגומי ה־README, ואז בונה את המודלים ואת האתר.
מהענף `main` התוצאה מתפרסמת ב־GitHub Pages: דף הבית הוא האתר עם מודל התלת־ממד,
ולצידו כל קובצי ה־STL להורדה.

## רישיון

לפרויקט שני רישיונות (פרטים ב־[NOTICE](NOTICE)):

- **קוד המקור** — [GNU GPL v3](LICENSE) עם תנאי ייחוס לפי סעיף 7(b);
- **המודלים** (העיצוב, כל קובצי ה־STL, ההדמיות, החפצים המודפסים וכל יצירה נגזרת,
  כולל מודלים ממזלגות) — [Chanukia Lemon Model License](LICENSE-MODELS.md).

מותר להשתמש במודלים, לשנות, להפיץ ולהדפיס אותם בחופשיות. **מותר למכור חפצים שהודפסו
מהמודלים האלה, ממזלגות או מכל יצירה נגזרת רק אם לכל רכישה מצורף ציון היוצר עם שני
הקישורים** (למשל כרטיס באריזה):

> Chanukia Lemon by PHPCraftdream — https://phpcraftdream.github.io/chanukia-lemon/ —
> https://github.com/PHPCraftdream/chanukia-lemon

הייחוס כבר מוטמע בכותרת של כל קובץ STL ובאתר.
