import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const value = key => { const index = args.indexOf(key); return index >= 0 ? args[index + 1] : undefined; };
const slug = value('--slug');
const name = value('--name');
if (!slug || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) || !name?.trim()) {
  console.error('Использование: node tools/create-cafe.mjs --slug cafe-name --name "Название кафе"'); process.exit(1);
}
const target = path.resolve(source, '../clients', slug);
if (existsSync(target)) { console.error('Папка уже существует. Выберите другой slug.'); process.exit(1); }
const excluded = new Set(['node_modules', 'dist', '.git', '.openai', 'audit', 'design-qa.md', '.vite']);
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true, filter: file => !excluded.has(path.basename(file)) });
// Every client starts in demo mode until verified content and a booking service are supplied.
const cafe = JSON.parse(readFileSync(path.join(target, 'src/content.json'), 'utf8'));
cafe.name = name.trim(); cafe.demo = true; cafe.booking = { ...cafe.booking, mode: 'demo', url: null };
cafe.pickup = { ...cafe.pickup, mode: 'demo', url: null };
cafe.visit = { ...cafe.visit, address: null, phone: null, mapUrl: null };
cafe.seo.title = `${cafe.name} — сайт кафе · Демонстрация`;
cafe.seo.description = `Демонстрационный сайт кафе «${cafe.name}». Меню и информация требуют заполнения.`;
cafe.about.paragraphs[1] = `«${cafe.name}» — новый демонстрационный проект. Здесь будет проверенная история заведения.`;
writeFileSync(path.join(target, 'src/content.json'), JSON.stringify(cafe, null, 2) + '\n');
const pkgPath = path.join(target, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')); pkg.name = slug;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
// Starter metadata for a future independent Sites registration; no prior identity is copied.
mkdirSync(path.join(target, '.openai'), { recursive: true });
writeFileSync(path.join(target, '.openai/hosting.json'), JSON.stringify({ d1: null, r2: null }, null, 2) + '\n');
writeFileSync(path.join(target, 'AGENTS.md'), '# Правила клиентского сайта\n\nХранить содержание в src/content.json, оформление в src/styles.css. Использовать только проверенные данные и разрешённые фотографии. Демонстрационный режим выключать после заполнения реальных контактов и сервиса брони. Не выдумывать отзывы, награды или заявки. Проверять страницу в браузере на широком и узком экране и сохранять отчёт. Исходное направление: молочный фон, бордовая типографика, печатное меню. Подстраивать композицию под конкретное заведение.\n');
const brief = path.join(source, '../CLIENT-BRIEF.md');
if (existsSync(brief)) cpSync(brief, path.join(target, 'CLIENT-BRIEF.md'));
const htmlPath = path.join(target, 'index.html');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
writeFileSync(htmlPath, readFileSync(htmlPath, 'utf8').replace(/<title>.*?<\/title>/, `<title>${escape(cafe.seo.title)}</title>`));
console.log(`Создано: ${target}\nЗаполните src/content.json и замените фотографии перед публикацией.`);
