>>>>> shared=commands
```sh
npm install
npm run build          # STL + out_chabad/hanukia.html
npm test
```

>>>>> lang=en
## Quick start

Node.js 24 or newer runs the `.ts` sources directly, without a build step.

<<<<< include=commands

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

>>>>> lang=ru
## Быстрый старт

Нужен Node.js 24 или новее: он запускает `.ts` напрямую, без сборки.

<<<<< include=commands

`out_chabad/hanukia.html` — весь сайт одним файлом: открывается двойным щелчком,
без сервера и интернета (код и модели вшиты в файл, около 6 МБ).

| Команда                | Что делает                                                      |
| ---------------------- | --------------------------------------------------------------- |
| `npm run build`        | `build:stl` + `build:site`                                      |
| `npm run build:stl`    | детали → STL в `out_chabad/` + пакет сцены для сайта            |
| `npm run build:site`   | бандл сайта (rspack) → `out_chabad/hanukia.html` + его проверка |
| `npm run site`         | dev-сервер сайта на http://localhost:5173                       |
| `npm test`             | тесты (`node:test`): расстановка, форматы, детали, посадки, переводы |
| `npm run review`       | проверка сборки: касания, зазоры, пути установки               |
| `npm run render`       | проверочные PNG (крупные планы и разрезы) → `out_chabad/inspect/` |
| `npm run docs`         | пересобрать README на трёх языках из `root-docs/`              |
| `npm run typecheck`    | проверка типов (Node-код и сайт)                                |

>>>>> lang=he
## התחלה מהירה

נדרש Node.js 24 ומעלה: הוא מריץ את קובצי ה־`.ts` ישירות, בלי שלב בנייה.

<<<<< include=commands

`out_chabad/hanukia.html` — האתר כולו בקובץ אחד: נפתח בלחיצה כפולה, בלי שרת
ובלי אינטרנט (הקוד והמודלים מוטמעים בקובץ, כ־6 MB).

| פקודה                  | מה היא עושה                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `npm run build`        | `build:stl` + `build:site`                                      |
| `npm run build:stl`    | חלקים → STL בתיקייה `out_chabad/` + חבילת הסצנה לאתר             |
| `npm run build:site`   | חבילת האתר (rspack) → `out_chabad/hanukia.html` + בדיקתו         |
| `npm run site`         | שרת פיתוח לאתר בכתובת http://localhost:5173                      |
| `npm test`             | בדיקות (`node:test`): פריסה, פורמטים, חלקים, התאמות, תרגומים     |
| `npm run review`       | בדיקת ההרכבה: מגעים, מרווחים, מסלולי הכנסה                       |
| `npm run render`       | תמונות PNG לבדיקה (תקריבים וחתכים) → `out_chabad/inspect/`        |
| `npm run docs`         | בניית ה־README מחדש בשלוש שפות מתוך `root-docs/`                 |
| `npm run typecheck`    | בדיקת טיפוסים (קוד Node והאתר)                                  |

