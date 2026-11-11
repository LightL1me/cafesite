import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cafe = JSON.parse(readFileSync(path.join(root, 'src/content.json'), 'utf8'));
function requireContent(condition, message) { if (!condition) throw new Error(message); }
function webUrl(url) { try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch { return false; } }
requireContent(cafe.name?.trim() && cafe.seo?.title && cafe.seo?.description, 'Заполните название и SEO.');
requireContent(Array.isArray(cafe.hero?.title) && cafe.hero.title.length && cafe.hero.title.every(line => typeof line === 'string' && line.trim()), 'Заголовок hero.title — массив непустых строк.');
requireContent(cafe.menu?.categories?.length > 0, 'Нужна хотя бы одна категория меню.');
const categories = new Set(cafe.menu.categories.map(item => item.id));
requireContent(categories.size === cafe.menu.categories.length, 'ID категорий должны быть уникальными.');
const dishes = new Set();
for (const dish of cafe.menu.dishes) {
  requireContent(!dishes.has(dish.id), `Повтор блюда: ${dish.id}`); dishes.add(dish.id);
  requireContent(categories.has(dish.category), `Неизвестная категория: ${dish.category}`);
  requireContent(dish.name && Number.isFinite(dish.price) && dish.price >= 0, `Проверьте название и цену: ${dish.id}`);
}
requireContent(cafe.featured.every(id => dishes.has(id)), 'Блюда featured должны существовать в меню.');
const imageUrls = [cafe.hero.image, cafe.coffee.image, ...(cafe.sections.pickup ? [cafe.pickup.image] : []), ...(cafe.sections.gallery ? cafe.gallery.images.map(image => image.src) : []), ...cafe.menu.dishes.map(dish => dish.image).filter(Boolean)];
for (const url of imageUrls) {
  requireContent(url?.startsWith('/') && existsSync(path.join(root, 'public', url)), `Нет локального изображения: ${url}`);
}
for (const token of Object.values(cafe.theme)) requireContent(/^#[\da-f]{6}$/i.test(token), 'Цвета theme задаются в формате #RRGGBB.');
new Intl.DateTimeFormat('ru-RU', { timeZone: cafe.timezone }).format();
requireContent(['demo', 'external'].includes(cafe.booking.mode), 'booking.mode: demo или external.');
requireContent(cafe.booking.maxGuests >= 1 && cafe.booking.maxGuests <= 30 && Number.isInteger(cafe.booking.maxGuests), 'maxGuests: целое число от 1 до 30.');
requireContent(cafe.booking.times.length && cafe.booking.times.every(time => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)), 'Время брони: ЧЧ:ММ.');
if (cafe.booking.mode === 'external') requireContent(webUrl(cafe.booking.url), 'Укажите действующий http(s) URL сервиса брони.');
if (cafe.visit.mapUrl) requireContent(webUrl(cafe.visit.mapUrl), 'mapUrl должен быть http(s) URL.');
if (cafe.sections.pickup) {
  requireContent(cafe.sections.menu, 'Для списка навынос включите меню.');
  requireContent(['demo','external'].includes(cafe.pickup.mode), 'pickup.mode: demo или external.');
  requireContent(Number.isInteger(cafe.pickup.maxQuantity) && cafe.pickup.maxQuantity >= 1 && cafe.pickup.maxQuantity <= 99, 'pickup.maxQuantity: от 1 до 99.');
  requireContent(cafe.pickup.times.length && cafe.pickup.times.every(time => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)), 'Проверьте время самовывоза.');
  if (cafe.pickup.mode === 'external') requireContent(webUrl(cafe.pickup.url), 'Добавьте URL сервиса заказа.');
}
if (cafe.sections.gallery) requireContent(cafe.gallery.images.length > 0, 'Добавьте хотя бы одно изображение галереи.');
if (cafe.sections.faq) requireContent(cafe.faq.every(item => item.question && item.answer), 'Заполните вопросы и ответы.');
if (!cafe.demo) {
  requireContent(cafe.booking.mode === 'external', 'Для реального сайта подключите сервис бронирования.');
  if (cafe.sections.visit) requireContent(cafe.visit.address && cafe.visit.phone, 'Добавьте реальные адрес и телефон.');
  if (cafe.sections.pickup) requireContent(cafe.pickup.mode === 'external', 'Подключите сервис заказа или отключите раздел навынос.');
}
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const index = path.join(root, 'index.html');
let html = readFileSync(index, 'utf8')
  .replace(/<title>.*?<\/title>/, `<title>${escape(cafe.seo.title)}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(cafe.seo.description)}" />`)
  .replace(/<meta name="theme-color" content="[^"]*"\s*\/>/, `<meta name="theme-color" content="${cafe.theme.ink}" />`)
  .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${cafe.demo ? 'noindex, nofollow' : 'index, follow'}" />`);
writeFileSync(index, html);
console.log(`Контент проверен: ${cafe.name}. Режим: ${cafe.demo ? 'демонстрация' : 'сайт заведения'}.`);
