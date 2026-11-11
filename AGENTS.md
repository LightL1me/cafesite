# Prototype Instructions

## Решения пользователя

Дополнение: пользователь отдельно попросил появления при прокрутке вниз. Для обычного режима — сдвиги, проявления фото и небольшой stagger существующих элементов; при уменьшенном движении — короткое проявление без перемещения. При фокусе с клавиатуры контент должен сразу становиться видимым.

Последняя правка 11 ноября: проверить отступы по всему сайту, разнести соседние действия (особенно «Выбрать время» и «Очистить список»), доработать анимации и качество существующих разделов. Новых блоков и функций не добавлять. Анимации должны учитывать prefers-reduced-motion; сохранять видимость контента без анимаций.

Пользователь выбрал 11 ноября 2026 года макет ../design/01-warm-bistro.png: молочный фон, бордовая типографика, диагональная граница фото блюда, меню как печатный лист. Сохранять это направление при доработках. Это многоразовая основа для кафе и ресторанов; содержание хранить в src/content.json. Следовать также ../../AGENTS.md, ../../DESIGN-GUIDE.md и ../../ANTI-AI-CHECKLIST.md. Не добавлять выдуманные контакты, отзывы, достижения или реальные заявки из демоформы.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
