import cafe from './content.json';
export const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
export function localDate(offset = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: cafe.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  return new Date(Date.UTC(+get('year'), +get('month') - 1, +get('day') + offset)).toISOString().slice(0, 10);
}
export const prettyDate = value => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
export function orderError(data) {
  if (data.date < localDate()) return 'Выберите сегодняшнюю или будущую дату.';
  if (!data.name.trim()) return 'Укажите, как к вам обращаться.';
  const digits = data.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return 'Укажите телефон: от 10 до 15 цифр.';
  const now = new Intl.DateTimeFormat('en-GB', { timeZone: cafe.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  if (data.date === localDate() && data.time <= now) return 'Это время уже прошло. Выберите более позднее время или другой день.';
  return '';
}
