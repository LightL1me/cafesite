# Design QA

Source visual truth: ../design/01-warm-bistro.png (1374 × 1145).
Implementation: audit/desktop-full-01.png, normalized crop audit/desktop-normalized-01.png.
Viewport: 1374 × 1145 CSS px, devicePixelRatio ≈ 1. Source density 1×. Full-page browser capture 1358 × 2127; 16px scrollbar excluded, right strip padded to source width in comparison only. Initial ordinary viewport screenshot was clipped by the browser capture surface and rejected; full-page capture preserves CSS proportions.
State: initial page, menu closed, dialog closed.
Full-view evidence: audit/comparison-01.jpg, source and implementation in one image.

## Findings, pass 1

- [P2] Header links begin around x434 instead of x355; reserve less automatic space before navigation.
- [P2] Display font is noticeably thinner and the first line narrower than reference. Increase Cormorant Garamond to 500 and adjust scale slightly, retaining three lines and the same overall hero height.
- [P2] Intro wraps after «для» rather than «столик». Limit intro line width to match reference.
- [P3] Generated assets reproduce subject and art direction rather than every pixel of the concept. Acceptable: separate hero and coffee photographs replace mockup raster.
- [P3] Paper surface is flat rather than grainy; no artificial gradients or decoration have been added.

Fonts/typography: Cormorant Garamond / Manrope, locally served. Display weight and navigation positioning require fixes above. Spacing/layout: hero and menu top match reference closely. Colors/tokens: coherent ivory/wine palette; compare again after font correction. Image quality: both assets loaded, warm light and crops appropriate, generated origin labelled. Copy/content: original hero preserved, menu extension and demo information intentionally added.

## Findings, interaction pass

- [P1] Opening the complete menu triggered `ReferenceError: filtered is not defined`, leaving a blank page. Found by clicking the real control in the browser, confirmed in console. Fix: derive filtered dishes from the current category in App before rendering; repeat menu/category/detail interactions after reload.

Pass 2 visual evidence: audit/comparison-02.jpg and audit/typography-comparison-02.jpg. Navigation position and display weight improved. The description still wraps after «для»; reduce its width further. Interaction and responsive checks pending.

## Scope extension requested during verification

User supplied two articles and asked for a longer, functional site without quotes or vague promises. The selected hero and palette remain the visual target. Below it, the full menu is now visible; search, vegetarian filtering, pickup list and checkout preview, downloadable list, gallery/lightbox, booking preferences and practical FAQ were added. Prior menu-collapse tests are superseded by catalog tests. New sections require a fresh browser pass.

## Final pass — 11 November 2026

Source: ../design/01-warm-bistro.png, 1374 × 1145 px. Implementation: audit/home-expanded-final.png, 1358 × 4374 px. Viewport 1374 × 1145 CSS px, DPR ≈ 1. The browser full-page capture excludes its 16px scrollbar; audit/home-first-screen.png uses the first 1145px with a 16px paper-colour strip on the right for alignment. No scaling of content. Earlier ordinary viewport capture was clipped by the browser surface and rejected.

Same-input comparisons: audit/comparison-final.jpg (source and final implementation together); audit/typography-final.jpg (readable heading crop from both). Both opened and inspected. Additional browser evidence: audit/menu-page-desktop.png, audit/home-mobile-final.png, audit/menu-mobile-final.png, audit/mobile-content-check.png, audit/responsive.json.

### Resolution of previous findings

- Navigation margin corrected; link labels intentionally changed to the expanded guest routes.
- Display weight changed from 400 to 500, scale adjusted. Three heading lines and hero proportions preserved. The remaining typeface-shape difference is P3: generated concept has no exact supplied font; locally licensed Cormorant Garamond is used.
- Intro width corrected; it now wraps after «столик» as in the source.
- Undefined filtered-menu variable fixed and the menu interaction repeated successfully. The later requested separate /menu catalog supersedes the old collapse interaction.
- Mobile visit heading reduced to prevent clipping on narrow screens. Header's booking label becomes «Столик» while its accessible name remains «Забронировать».

### Five fidelity surfaces

1. Fonts/typography: Cormorant Garamond and Manrope load locally, display hierarchy and three-line hero retained. Body, menu labels and fields remain readable at tested widths. Exact glyph shapes differ from the generated raster concept (P3).
2. Spacing/layout: header, diagonal photograph boundary, hero height and two-column teaser follow the source. Extra guest functions appear after the teaser or on /menu. On mobile, images stack and menu rows use one column. No clipping or horizontal overflow observed.
3. Colors/tokens: wine #611d27, ivory #f8efe2, restrained dividing rules. No decorative gradients, glow or repeated card shell. Focus indicators are visible.
4. Images: separate warm burrata, coffee, syrniki and interior assets, WebP compression, no screenshot used as UI. Origins are labelled. Gallery and detail images load when opened/scrolled into view. Generated assets match the selected palette and subjects rather than every pixel.
5. Copy/content: no fabricated reviews, contacts, awards or sales promises. Example menu/prices/hours and generated imagery labelled. The user's request to avoid useless quotes and promises is respected. Demo results explicitly deny real submission/payment/confirmed availability.

### Browser interactions verified

- Direct /menu load; navigation from main, Back and return to home. Cart quantities survive internal page transitions. On home, #full-menu is absent.
- Search «сырники» yields the matching dish. No-result search displays an empty state. Reset works. The no-meat/fish filter yields 8 positions. Categories and keyboard opening of composition work.
- Two syrniki plus one cappuccino total 1330 ₽. Quantity controls update both catalog and pickup summary; clearing works. Invalid phone displays an error. Form result includes chosen date/time and comment.
- TXT was actually downloaded to Downloads/spisok-s-soboy.txt and read back: two syrniki (1040 ₽), cappuccino (290 ₽), total 1330 ₽, comment, contact and explicit demo disclaimer.
- Booking: required fields, invalid phone, past date, valid summary, edit preserves values, 8 guests / window preference / comment, Escape, return of focus.
- Gallery opens, next-photo keyboard activation changes caption, Escape closes and restores focus. FAQ opens with Enter.
- Main and menu checked at 320, 390, 768 and 1024 CSS px; desktop also at 1374. Eight responsive measurements in audit/responsive.json report no text/header overflow. 15px scrollbar differences are expected.
- Fresh browser console after the fixes: no warnings or errors. Build and four existing Worker packaging tests pass. Clone command generates a new demo with no project_id.

### Remaining limits and P3 polish

Flat paper surface instead of image grain; independently generated photos; exact serif matching is approximate. These do not obstruct use or change the selected direction. No physical iOS/Android device, screen reader, production Lighthouse/CrUX measurements, payment, real kitchen dispatch or booking service was tested. A real client still needs verified content, actual photographs and integrations. No claim of complete WCAG compliance.

Implementation checklist: complete; no actionable P0/P1/P2 findings remain. Local preview stays running. Not published.

## Последующая правка интервалов и движения

Пользователь попросил увеличить расстояния и улучшить только имеющееся. Актуальная проверка: audit/polish/REVIEW.md; сравнения audit/polish/full-comparison.jpg и audit/polish/actions-comparison.png. Измерены 18 сочетаний страниц/состояний и ширин 320–1374px; перекрытий и переполнений не обнаружено. Нулевой зазор у двух кнопок заменён на 28px на широком и 16px по вертикали на мобильном экране. Устранён скачок высоты галереи. История прежних проверок сохранена выше; последнее визуальное состояние показано в audit/polish.

Добавлены анимации существующих элементов с prefers-reduced-motion и видимым содержимым при отсутствии JS. Текущий IAB использует reduced-motion, это состояние подтверждено в DOM; нормальный режим проверен по реализации, без изменения системной настройки. Базовые шрифты, цвета, содержание и маршруты сохранены. Проверены все пять поверхностей качества, описание и ограничения в новом отчёте. Финальная сборка проходит.

## Появления при прокрутке вниз

Последняя проверка: audit/scroll-motion/REVIEW.md. Существующие блоки появляются через IntersectionObserver; нормальный режим использует сдвиги, масштаб фото и последовательные задержки, reduced-motion — короткое проявление без перемещения. Проверены главная на 1374px и 390px, быстрые перескоки, повторный проход и раскрытие строки меню при клавиатурном фокусе. Все просмотренные элементы становятся видимыми; переполнения на проверенных размерах и ошибок консоли нет. Финальная сборка проходит. Полный режим движения проверен по коду, браузерная проверка выполнена с reduced-motion.

final result: passed
