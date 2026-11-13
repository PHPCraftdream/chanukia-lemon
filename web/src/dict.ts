// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/**
 * Site texts in English, Russian and Hebrew (pure data, no DOM).
 * English is the source dictionary: its keys define the set every language must provide.
 * `{name}` marks a placeholder filled in at runtime.
 *
 * @module
 */

export const en = {
  'meta.title': 'Chanukia Lemon — a 3D-printable Chabad hanukkiah for tea lights',
  'meta.description':
    'Open-source Chabad-style hanukkiah for tea lights: interactive 3D model, gallery and free STL ' +
    'files for 3D printing, with print-shop instructions.',
  'nav.model': '3D model',
  'nav.gallery': 'Gallery',
  'gallery.badge': 'Gallery',
  'gallery.title': 'Close-ups',
  'gallery.lead':
    'Rendered from the same model: wreaths, knops, flame tongues and the concentric circles in the ' +
    'cups. Click a picture to enlarge it.',
  'gallery.close': 'Close',
  'gallery.prev': 'Previous',
  'gallery.next': 'Next',
  'shot.overview': 'The whole hanukkiah',
  'shot.front': 'From the front',
  'shot.cups': 'Cups with laurel wreaths and leaf calyxes',
  'shot.grooves': 'Concentric circles inside a cup',
  'shot.knop': 'Knop with leaves and flame tongues',
  'shot.junction': 'Branches joining the stem',
  'shot.shamash': 'The shamash',
  'shot.flames': 'Flame tongues on the stem',
  'shot.exploded': 'Exploded view: how it goes together',
  'nav.files': 'Files',
  'nav.print': 'Printing',
  'nav.assembly': 'Assembly',
  'theme.title': 'Colour theme',
  'lang.title': 'Language',
  'hero.badge': 'Open source · 3D printing',
  'hero.title1': 'A hanukkiah for tea lights.',
  'hero.title2': 'Printed at home.',
  'hero.lead':
    'A Chabad-style hanukkiah with straight branches, knops, leaves and flame-tongue reliefs. ' +
    'Every part is generated from code and checked to fit — download the STL files and take them ' +
    'to a print shop.',
  'hero.ctaZip': 'Download everything (ZIP)',
  'hero.ctaPrint': 'How to print',
  'fact.lights': '8 lights + shamash',
  'fact.size': '545 × 180 × 414 mm',
  'fact.parts': '20 parts + a fit test',
  'fact.material': 'PETG + ASA · FDM',
  'viewer.loading': 'Loading the model…',
  'viewer.ready': '{parts} parts in the assembly',
  'viewer.error': 'Could not load the model: {message}',
  'viewer.assembly': 'Assembled',
  'viewer.print': 'For printing',
  'viewer.explode': 'Explode',
  'viewer.wire': 'Wireframe',
  'viewer.hint': 'Drag to rotate, scroll to zoom',
  'files.badge': 'Files',
  'files.title': 'Files for the print shop',
  'files.lead': 'Each part is ready to print. Hover a row to see the part in the 3D model.',
  'files.part': 'Part',
  'files.qty': 'Qty',
  'files.size': 'Size, mm',
  'files.volume': 'Volume',
  'files.download': 'Download',
  'files.cm3': 'cm³',
  'files.full': 'The whole hanukkiah as one model, for viewing only:',
  'files.zip': 'Download everything (ZIP)',
  'files.zipNote': 'All STL files, instructions for the print shop in three languages and the licence.',
  'part.foot': 'Foot',
  'part.stem_lower': 'Lower stem',
  'part.stem_upper': 'Upper stem',
  'part.shamash_cup': 'Shamash cup, heat-resistant plastic',
  'part.branch1': 'Branch 1 (inner), heat-resistant plastic',
  'part.branch2a': 'Branch 2, inner half',
  'part.branch34a': 'Branches 3 and 4, inner half',
  'part.branch23b': 'Branches 2 and 3, outer half with the cup, heat-resistant plastic',
  'part.branch4b': 'Branch 4, outer half with the cup, heat-resistant plastic',
  'part.rod_pin': 'Stiffening rod, left half',
  'part.rod_socket': 'Stiffening rod, right half',
  'part.fit_test': 'Fit test — print first; checks the fits, not part of the hanukkiah',
  'print.badge': 'Printing',
  'print.title': 'How to print',
  'print.lead': 'Settings for an FDM printer. Pass them to the print shop together with the files.',
  'print.c1.t': 'Fit test first',
  'print.c1.d':
    'Print chabad_fit_test on the same printer in both plastics. The plugs should go in firmly, ' +
    'without play.',
  'print.c2.t': 'PETG + heat-resistant',
  'print.c2.d':
    'Stem and inner branch halves in PETG; the parts with cups in ASA, ABS or PC — they sit next to the flames.',
  'print.c3.t': 'Bed from 256 mm',
  'print.c3.d': 'Branch pieces are at most 211 mm. The 272 mm rods fit diagonally on a 256 mm bed.',
  'print.c4.t': 'Walls and infill',
  'print.c4.d':
    'Stem: 4 perimeters, gyroid 12–15 %. Branches: 4–5 perimeters, gyroid 25–30 %. ' +
    'Pins and rods: solid.',
  'print.c5.t': 'Fine layers',
  'print.c5.d': '0.12–0.16 mm layers keep the wreaths, leaves and flame veins crisp.',
  'print.c6.t': 'Supports',
  'print.c6.d': 'Branches print lying down with supports; the stem pieces stand upright with a brim.',
  'asm.badge': 'Assembly',
  'asm.title': 'Assembly in four steps',
  'asm.s1.t': 'Stem',
  'asm.s1.d':
    'Join the foot, the lower stem, the upper stem and the shamash cup on their pins and glue the joints.',
  'asm.s2.t': 'Branches',
  'asm.s2.d':
    'Insert the branches from the stem outwards: 1, the inner halves of 2–4, then the outer halves with the cups. Glue every joint.',
  'asm.s3.t': 'Stiffening rod',
  'asm.s3.d':
    'Slide the two rod halves through the top knops under the cups from both sides until the joint inside the stem snaps.',
  'asm.s4.t': 'Glue',
  'asm.s4.d': 'Put a drop of epoxy or CA glue into every rod hole in the top knops from the back.',
  'safety.title': 'Safety',
  'safety.text':
    'Use tea lights only in their aluminium cups and never leave burning candles unattended. ' +
    'Plastic must not touch the flame.',
  'footer.author': 'author',
  'footer.source': 'source code on GitHub',
  'footer.license':
    'Code: GPL-3.0. Models: Chanukia Lemon Model License — printed objects may be sold only with ' +
    'the attribution and links to this website and the original repository included with every purchase.',
} as const;

export type Key = keyof typeof en;
export type Dict = Record<Key, string>;

/** Label key of a print file: `chabad_branch34a_inner_x4.stl` -> `part.branch34a`. */
export const partKey = (file: string): Key =>
  `part.${file.replace(/^chabad_|\.stl$/g, '').replace(/(_inner|_outer)?_x\d+$/, '')}` as Key;

export const ru: Dict = {
  'meta.title': 'Chanukia Lemon — ханукия для чайных свечей для 3D-печати',
  'meta.description':
    'Хабадская ханукия для чайных свечей с открытым кодом: интерактивная 3D-модель, галерея ' +
    'и бесплатные STL-файлы для 3D-печати с инструкцией для мастерской.',
  'nav.model': '3D-модель',
  'nav.gallery': 'Галерея',
  'gallery.badge': 'Галерея',
  'gallery.title': 'Крупным планом',
  'gallery.lead':
    'Кадры той же модели: венки, завязи, языки пламени и концентрические круги в чашах. ' +
    'Нажмите на снимок, чтобы увеличить.',
  'gallery.close': 'Закрыть',
  'gallery.prev': 'Назад',
  'gallery.next': 'Вперёд',
  'shot.overview': 'Ханукия целиком',
  'shot.front': 'Спереди',
  'shot.cups': 'Чаши с лавровыми венками и чашечками листьев',
  'shot.grooves': 'Концентрические круги в чаше',
  'shot.knop': 'Завязь с листьями и языки пламени',
  'shot.junction': 'Ветви выходят из ствола',
  'shot.shamash': 'Шамаш',
  'shot.flames': 'Языки пламени на стволе',
  'shot.exploded': 'Разнесённый вид: как всё собирается',
  'nav.files': 'Файлы',
  'nav.print': 'Печать',
  'nav.assembly': 'Сборка',
  'theme.title': 'Цветовая тема',
  'lang.title': 'Язык',
  'hero.badge': 'Открытый код · 3D-печать',
  'hero.title1': 'Ханукия для чайных свечей.',
  'hero.title2': 'Печатается дома.',
  'hero.lead':
    'Хабадская ханукия с прямыми ветвями, завязями, листьями и рельефом «языки пламени». ' +
    'Каждая деталь построена кодом и проверена на посадку — скачайте STL и отдайте в мастерскую ' +
    '3D-печати.',
  'hero.ctaZip': 'Скачать всё (ZIP)',
  'hero.ctaPrint': 'Как печатать',
  'fact.lights': '8 свечей + шамаш',
  'fact.size': '545 × 180 × 414 мм',
  'fact.parts': '20 деталей + тестовый образец',
  'fact.material': 'PETG + ASA · FDM',
  'viewer.loading': 'Загружаю модель…',
  'viewer.ready': 'Деталей в сборке: {parts}',
  'viewer.error': 'Не удалось загрузить модель: {message}',
  'viewer.assembly': 'Сборка',
  'viewer.print': 'Для печати',
  'viewer.explode': 'Разнести',
  'viewer.wire': 'Каркас',
  'viewer.hint': 'Вращайте мышью, колесо — масштаб',
  'files.badge': 'Файлы',
  'files.title': 'Файлы для мастерской',
  'files.lead': 'Каждая деталь готова к печати. Наведите на строку — деталь подсветится в 3D-модели.',
  'files.part': 'Деталь',
  'files.qty': 'Кол-во',
  'files.size': 'Размер, мм',
  'files.volume': 'Объём',
  'files.download': 'Скачать',
  'files.cm3': 'см³',
  'files.full': 'Вся ханукия одной моделью, только для просмотра:',
  'files.zip': 'Скачать всё (ZIP)',
  'files.zipNote': 'Все STL, инструкция для мастерской на трёх языках и лицензия.',
  'part.foot': 'Подставка (ножка)',
  'part.stem_lower': 'Низ ствола',
  'part.stem_upper': 'Верх ствола',
  'part.shamash_cup': 'Чаша шамаша, термостойкий пластик',
  'part.branch1': 'Ветвь 1 (внутренняя), термостойкий пластик',
  'part.branch2a': 'Ветвь 2, внутренняя половина',
  'part.branch34a': 'Ветви 3 и 4, внутренняя половина',
  'part.branch23b': 'Ветви 2 и 3, внешняя половина с чашей, термостойкий пластик',
  'part.branch4b': 'Ветвь 4, внешняя половина с чашей, термостойкий пластик',
  'part.rod_pin': 'Стержень жёсткости, левая половина',
  'part.rod_socket': 'Стержень жёсткости, правая половина',
  'part.fit_test': 'Тестовый образец — печатать первым; проверка посадок, к ханукии не крепится',
  'print.badge': 'Печать',
  'print.title': 'Как печатать',
  'print.lead': 'Настройки для FDM-принтера. Передайте их в мастерскую вместе с файлами.',
  'print.c1.t': 'Сначала тест посадки',
  'print.c1.d':
    'Напечатайте chabad_fit_test на том же принтере из обоих пластиков. Штыри должны входить ' +
    'плотно, без люфта.',
  'print.c2.t': 'PETG + термостойкий',
  'print.c2.d':
    'Ствол и внутренние половины ветвей — PETG; детали с чашами — ASA, ABS или PC: они рядом с огнём.',
  'print.c3.t': 'Стол от 256 мм',
  'print.c3.d': 'Части ветвей — до 211 мм. Стержни 272 мм встают на стол 256 мм по диагонали.',
  'print.c4.t': 'Стенки и заполнение',
  'print.c4.d':
    'Ствол: 4 периметра, гироид 12–15 %. Ветви: 4–5 периметров, гироид 25–30 %. ' +
    'Штыри и стержни — сплошные.',
  'print.c5.t': 'Тонкий слой',
  'print.c5.d': 'Слой 0,12–0,16 мм сохранит чёткость венков, листьев и прожилок пламени.',
  'print.c6.t': 'Поддержки',
  'print.c6.d': 'Ветви печатаются лёжа с поддержками, части ствола — стоя, с полями (brim).',
  'asm.badge': 'Сборка',
  'asm.title': 'Сборка в четыре шага',
  'asm.s1.t': 'Ствол',
  'asm.s1.d': 'Соедините подставку, низ ствола, верх ствола и чашу шамаша на штырях и проклейте стыки.',
  'asm.s2.t': 'Ветви',
  'asm.s2.d':
    'Вставьте ветви от ствола наружу: 1, внутренние половины 2–4, затем внешние половины с чашами. Каждый стык проклейте.',
  'asm.s3.t': 'Стержень жёсткости',
  'asm.s3.d':
    'Продвиньте половины стержня через верхние завязи под чашами с двух сторон до защёлкивания стыка в стволе.',
  'asm.s4.t': 'Клей',
  'asm.s4.d':
    'Капните эпоксидку или цианоакрилат в каждое отверстие стержня в верхних завязях с тыльной стороны.',
  'safety.title': 'Безопасность',
  'safety.text':
    'Используйте чайные свечи только в алюминиевых гильзах и не оставляйте горящие свечи без ' +
    'присмотра. Пластик не должен касаться пламени.',
  'footer.author': 'автор',
  'footer.source': 'исходный код на GitHub',
  'footer.license':
    'Код: GPL-3.0. Модели: Chanukia Lemon Model License — продавать напечатанные изделия можно ' +
    'только с указанием автора и ссылками на этот сайт и исходный репозиторий, приложенными к каждой покупке.',
};

export const he: Dict = {
  'meta.title': 'Chanukia Lemon — חנוכייה בסגנון חב״ד לנרות טי־לייט להדפסת תלת־ממד',
  'meta.description':
    'חנוכייה בסגנון חב״ד לנרות טי־לייט בקוד פתוח: מודל תלת־ממד אינטראקטיבי, גלריה וקובצי STL ' +
    'חינמיים להדפסת תלת־ממד, עם הוראות לבית הדפוס.',
  'nav.model': 'מודל תלת־ממד',
  'nav.gallery': 'גלריה',
  'gallery.badge': 'גלריה',
  'gallery.title': 'מקרוב',
  'gallery.lead':
    'תמונות מאותו מודל: זרים, כפתורים, לשונות אש ומעגלים קונצנטריים בגביעים. ' +
    'לחצו על תמונה כדי להגדיל אותה.',
  'gallery.close': 'סגירה',
  'gallery.prev': 'הקודם',
  'gallery.next': 'הבא',
  'shot.overview': 'החנוכייה כולה',
  'shot.front': 'מלפנים',
  'shot.cups': 'גביעים עם זרי דפנה ועלי גביע',
  'shot.grooves': 'מעגלים קונצנטריים בתוך גביע',
  'shot.knop': 'כפתור עם עלים ולשונות אש',
  'shot.junction': 'הקנים יוצאים מהגזע',
  'shot.shamash': 'השמש',
  'shot.flames': 'לשונות אש על הגזע',
  'shot.exploded': 'מבט מפורק: איך הכול מתחבר',
  'nav.files': 'קבצים',
  'nav.print': 'הדפסה',
  'nav.assembly': 'הרכבה',
  'theme.title': 'ערכת צבעים',
  'lang.title': 'שפה',
  'hero.badge': 'קוד פתוח · הדפסת תלת־ממד',
  'hero.title1': 'חנוכייה לנרות טי־לייט.',
  'hero.title2': 'מודפסת בבית.',
  'hero.lead':
    'חנוכייה בסגנון חב״ד עם קנים ישרים, כפתורים, עלים ותבליטי לשונות אש. כל חלק נבנה בקוד ' +
    'ונבדק להתאמה — הורידו את קובצי ה־STL ומסרו אותם לבית דפוס תלת־ממד.',
  'hero.ctaZip': 'הורדת הכול (ZIP)',
  'hero.ctaPrint': 'איך מדפיסים',
  'fact.lights': '8 נרות + שמש',
  'fact.size': '\u2066545 × 180 × 414\u2069 מ״מ', // LRI…PDI keep the numbers left-to-right
  'fact.parts': '20 חלקים + דגם בדיקה',
  'fact.material': 'PETG + ASA · FDM',
  'viewer.loading': 'טוען את המודל…',
  'viewer.ready': 'חלקים בהרכבה: {parts}',
  'viewer.error': 'לא ניתן לטעון את המודל: {message}',
  'viewer.assembly': 'מורכב',
  'viewer.print': 'להדפסה',
  'viewer.explode': 'פירוק',
  'viewer.wire': 'שלד',
  'viewer.hint': 'גררו לסיבוב, גלגלת לזום',
  'files.badge': 'קבצים',
  'files.title': 'קבצים לבית הדפוס',
  'files.lead': 'כל חלק מוכן להדפסה. העבירו את העכבר מעל שורה כדי לראות את החלק במודל.',
  'files.part': 'חלק',
  'files.qty': 'כמות',
  'files.size': 'מידות, מ״מ',
  'files.volume': 'נפח',
  'files.download': 'הורדה',
  'files.cm3': 'סמ״ק',
  'files.full': 'החנוכייה כולה כמודל אחד, לצפייה בלבד:',
  'files.zip': 'הורדת הכול (ZIP)',
  'files.zipNote': 'כל קובצי ה־STL, הוראות לבית הדפוס בשלוש שפות והרישיון.',
  'part.foot': 'בסיס',
  'part.stem_lower': 'חלק תחתון של הגזע',
  'part.stem_upper': 'חלק עליון של הגזע',
  'part.shamash_cup': 'גביע השמש, פלסטיק עמיד בחום',
  'part.branch1': 'קנה 1 (פנימי), פלסטיק עמיד בחום',
  'part.branch2a': 'קנה 2, חצי פנימי',
  'part.branch34a': 'קנים 3 ו־4, חצי פנימי',
  'part.branch23b': 'קנים 2 ו־3, חצי חיצוני עם הגביע, פלסטיק עמיד בחום',
  'part.branch4b': 'קנה 4, חצי חיצוני עם הגביע, פלסטיק עמיד בחום',
  'part.rod_pin': 'מוט חיזוק, חצי שמאלי',
  'part.rod_socket': 'מוט חיזוק, חצי ימני',
  'part.fit_test': 'דגם בדיקה — להדפיס ראשון; בודק את ההתאמות, אינו חלק מהחנוכייה',
  'print.badge': 'הדפסה',
  'print.title': 'איך מדפיסים',
  'print.lead': 'הגדרות למדפסת FDM. מסרו אותן לבית הדפוס יחד עם הקבצים.',
  'print.c1.t': 'קודם בדיקת התאמה',
  'print.c1.d': 'הדפיסו את chabad_fit_test באותה מדפסת משני החומרים. הפינים צריכים להיכנס בחוזקה, ללא משחק.',
  'print.c2.t': 'PETG + עמיד בחום',
  'print.c2.d': 'הגזע והחצאים הפנימיים של הקנים — PETG; החלקים עם הגביעים — ASA,‏ ABS או PC: הם קרובים לאש.',
  'print.c3.t': 'משטח מ־256 מ״מ',
  'print.c3.d': 'חלקי הקנים — עד 211 מ״מ. המוטות של 272 מ״מ נכנסים באלכסון על משטח של 256 מ״מ.',
  'print.c4.t': 'דפנות ומילוי',
  'print.c4.d':
    'גזע: 4 היקפים, ג׳ירואיד 12–15 %. קנים: 4–5 היקפים, ג׳ירואיד 25–30 %. ' + 'פינים ומוטות: מלאים.',
  'print.c5.t': 'שכבה דקה',
  'print.c5.d': 'שכבה של 0.12–0.16 מ״מ שומרת על חדות הזרים, העלים והעורקים בלהבות.',
  'print.c6.t': 'תמיכות',
  'print.c6.d': 'הקנים מודפסים בשכיבה עם תמיכות; חלקי הגזע — זקופים, עם שוליים (brim).',
  'asm.badge': 'הרכבה',
  'asm.title': 'הרכבה בארבעה שלבים',
  'asm.s1.t': 'גזע',
  'asm.s1.d': 'חברו את הבסיס, החלק התחתון, החלק העליון וגביע השמש על הפינים והדביקו את החיבורים.',
  'asm.s2.t': 'קנים',
  'asm.s2.d':
    'הכניסו את הקנים מהגזע החוצה: 1, החצאים הפנימיים של 2–4, ואחר כך החצאים החיצוניים עם הגביעים. הדביקו כל חיבור.',
  'asm.s3.t': 'מוט חיזוק',
  'asm.s3.d':
    'החליקו את שני חצאי המוט דרך הכפתורים העליונים שמתחת לגביעים משני הצדדים עד שהחיבור בתוך הגזע ננעל.',
  'asm.s4.t': 'הדבקה',
  'asm.s4.d': 'טפטפו אפוקסי או דבק מגע לכל חור של המוט בכפתורים העליונים מהצד האחורי.',
  'safety.title': 'בטיחות',
  'safety.text':
    'השתמשו בנרות טי־לייט רק בתוך גביעי האלומיניום שלהם ולעולם אל תשאירו נרות דולקים ללא השגחה. ' +
    'הפלסטיק אסור שייגע בלהבה.',
  'footer.author': 'יוצר',
  'footer.source': 'קוד המקור ב־GitHub',
  'footer.license':
    'קוד: GPL-3.0. מודלים: Chanukia Lemon Model License — מותר למכור חפצים מודפסים רק כאשר ' +
    'לכל רכישה מצורפים ציון היוצר וקישורים לאתר הזה ולמאגר המקורי.',
};
