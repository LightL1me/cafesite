import { useEffect, useRef, useState } from 'react';
import cafe from './content.json';
import { Catalog, Gallery, Pickup, Questions } from './Extended';
import { useMotion } from './useMotion';

const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
function localDate(offset = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: cafe.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  const date = new Date(Date.UTC(+get('year'), +get('month') - 1, +get('day') + offset));
  return date.toISOString().slice(0, 10);
}
const prettyDate = value => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));

function Dish({ dish, compact = false }) {
  return <article className={compact ? 'dish dish--compact' : 'dish'}>
    <div className="dish-heading"><h3>{dish.name}</h3><span className="dish-price">{money(dish.price)}</span></div>
    <p>{dish.description}</p>
    {!compact && <div className="dish-details"><span>{dish.weight}</span><details><summary>Состав и аллергены</summary><p>{dish.description}. Аллергены: {dish.allergens}.</p></details></div>}
  </article>;
}

function Booking({ dialog, onClose }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);
  const [session, setSession] = useState(0);
  const heading = useRef(null);
  useEffect(() => { if (result) heading.current?.focus(); }, [result]);
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (data.date < localDate()) { setError('Выберите сегодняшнюю или будущую дату.'); return; }
    if (!data.name.trim()) { setError('Укажите, как к вам обращаться.'); return; }
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) { setError('Укажите телефон: от 10 до 15 цифр.'); return; }
    if (data.date === localDate()) {
      const time = new Intl.DateTimeFormat('en-GB', { timeZone: cafe.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      if (data.time <= time) { setError('Это время уже прошло. Выберите более позднее время или другой день.'); return; }
    }
    setError(''); setDraft(data); setResult(data);
  }
  function close() { dialog.current.close(); }
  return <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-title" onClose={() => { setResult(null); setDraft(null); setError(''); setSession(value => value + 1); onClose(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
    <div className="booking-body">
      <button className="dialog-close text-button" onClick={close}>Закрыть</button>
      <p className="eyebrow">Демонстрация бронирования</p>
      <h2 id="booking-title" ref={heading} tabIndex={-1}>{result ? 'Вот ваша заявка.' : 'Столик для вас.'}</h2>
      {result ? <div className="booking-result">
        <p className="result-lead">{result.name.trim()}, {prettyDate(result.date)}, в {result.time}.</p>
        <dl><div><dt>Гостей</dt><dd>{result.guests}</dd></div><div><dt>Телефон</dt><dd>{result.phone}</dd></div><div><dt>Пожелание к месту</dt><dd>{result.preference}</dd></div></dl>
        {result.comment && <p className="order-comment">Комментарий: {result.comment}</p>}
        <p className="demo-result" role="status">Это демонстрация. Заявка никуда не отправлена, стол не забронирован. Введённые данные не сохраняются.</p>
        <button className="button" onClick={() => setResult(null)}>Изменить данные</button>
      </div> : <>
        <p className="booking-intro">Выберите день, время и количество гостей. В демоверсии можно пройти весь сценарий без отправки данных.</p>
        <form key={session} onSubmit={submit}>
          <div className="form-grid"><label>Дата<input name="date" type="date" required min={localDate()} defaultValue={draft?.date ?? localDate(1)} /></label><label>Время<select name="time" defaultValue={draft?.time ?? (cafe.booking.times.includes('19:00') ? '19:00' : cafe.booking.times[0])}>{cafe.booking.times.map(time => <option key={time}>{time}</option>)}</select></label></div>
          <label>Количество гостей<select name="guests" defaultValue={draft?.guests ?? Math.min(2, cafe.booking.maxGuests)}>{Array.from({length: cafe.booking.maxGuests}, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
          <label>Пожелание к столику<select name="preference" defaultValue={draft?.preference ?? cafe.booking.preferences[0]}>{cafe.booking.preferences.map(value=><option key={value}>{value}</option>)}</select></label>
          <label>Как к вам обращаться<input name="name" autoComplete="given-name" required maxLength={60} placeholder="Ваше имя" defaultValue={draft?.name ?? ''} /></label>
          <label>Телефон<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} placeholder="+7 900 000-00-00" aria-describedby="phone-note" defaultValue={draft?.phone ?? ''} /></label>
          <p id="phone-note" className="field-note">Можно использовать пример телефона. Данные никуда не отправляются.</p>
          <label>Комментарий к бронированию<textarea name="comment" rows={2} maxLength={500} defaultValue={draft?.comment ?? ''} placeholder="Например, придём с детской коляской" /></label>
          <p className="field-note">Пожелание не гарантирует конкретный столик. В реальном заведении его подтверждает сотрудник.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button form-submit" type="submit">Проверить заявку</button>
        </form>
      </>}
    </div>
  </dialog>;
}

export function App() {
  const [page, setPage] = useState(location.pathname === '/menu' ? 'menu' : 'home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cart, setCart] = useState({});
  useMotion(page);
  const dialog = useRef(null);
  const opener = useRef(null);
  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const cartTotal = cafe.menu.dishes.reduce((sum, dish) => sum + (cart[dish.id] || 0) * dish.price, 0);
  function changeCart(id, delta) { setCart(current => { const next = {...current}; next[id] = Math.max(0, Math.min(cafe.pickup.maxQuantity, (next[id] || 0) + delta)); if (!next[id]) delete next[id]; return next; }); }
  function navigate(event, to) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    history.pushState({}, '', to);
    setPage(new URL(to, location.origin).pathname === '/menu' ? 'menu' : 'home');
    setMobileMenu(false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = location.hash && document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      else { window.scrollTo({top:0,behavior:'instant'}); document.querySelector('main h1')?.focus({preventScroll:true}); }
    }));
  }
  useEffect(() => {
    const back = () => { setPage(location.pathname === '/menu' ? 'menu' : 'home'); setMobileMenu(false); };
    addEventListener('popstate', back);
    return () => removeEventListener('popstate', back);
  }, []);
  useEffect(() => {
    document.title = cafe.seo.title;
    document.querySelector('meta[name="description"]').content = cafe.seo.description;
    document.documentElement.style.setProperty('--ink', cafe.theme.ink);
    document.documentElement.style.setProperty('--paper', cafe.theme.paper);
    document.documentElement.style.setProperty('--line', cafe.theme.line);
  }, []);
  useEffect(() => { document.title = page === 'menu' ? `Меню — ${cafe.name}${cafe.demo ? ' · Демонстрация' : ''}` : cafe.seo.title; }, [page]);
  useEffect(() => {
    function close(event) { if (event.key === 'Escape') setMobileMenu(false); }
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  function openBooking(event) { opener.current = event.currentTarget; setMobileMenu(false); dialog.current.showModal(); }
  function bookButton(className = 'button', label = 'Забронировать') {
    const text = label === 'Забронировать' ? <><span className="desktop-label">{label}</span><span className="mobile-label">Столик</span></> : label;
    return cafe.booking.mode === 'external' && cafe.booking.url
      ? <a className={className} aria-label={label} href={cafe.booking.url} target="_blank" rel="noopener noreferrer">{text}</a>
      : <button className={className} aria-label={label} onClick={openBooking}>{text}</button>;
  }
  return <>
    <a className="skip-link" href="#main">К содержимому</a>
    <header className="site-header">
      <a className="wordmark" href="/" onClick={event=>navigate(event,'/')} aria-label={cafe.name + ' — на главную'}>{cafe.name}</a>
      <button className="mobile-toggle text-button" aria-expanded={mobileMenu} aria-controls="navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? 'Закрыть' : 'Разделы'}</button>
      <nav id="navigation" aria-label="Основная навигация" className={mobileMenu ? 'navigation is-open' : 'navigation'} onClick={() => setMobileMenu(false)}>
        {cafe.sections.menu && <a href="/menu" aria-current={page==='menu'?'page':undefined} onClick={event=>navigate(event,'/menu')}>Меню</a>}{cafe.sections.pickup && <a href="/#pickup" onClick={event=>navigate(event,'/#pickup')}>С собой</a>}{cafe.sections.gallery && <a href="/#space" onClick={event=>navigate(event,'/#space')}>Зал</a>}{cafe.sections.visit && <a href="/#visit" onClick={event=>navigate(event,'/#visit')}>Контакты</a>}
      </nav>
      <div className="header-booking">{bookButton()}</div>
    </header>
    <main id="main">
      {page === 'menu' ? <section className="menu-page page-section"><div className="menu-breadcrumb"><a href="/" onClick={event=>navigate(event,'/')}>На главную</a><p>{cafe.demo ? 'Пример меню · все цены демонстрационные' : cafe.name}</p></div><Catalog cart={cart} onChange={changeCart} standalone /><a className="button catalog-checkout" href="/#pickup" onClick={event=>navigate(event,'/#pickup')}>К заказу навынос{cartCount ? ` · ${money(cartTotal)}` : ''}</a></section> : <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title" tabIndex={-1}>{cafe.hero.title.map((line, i) => <span key={i}>{line}{i < cafe.hero.title.length - 1 ? ' ' : ''}</span>)}</h1>
          <p>{cafe.hero.description}</p>
          {cafe.sections.menu ? <a className="button hero-button" href="/menu" onClick={event=>navigate(event,'/menu')}>Смотреть меню</a> : bookButton('button hero-button')}
        </div>
        <img className="hero-image" src={cafe.hero.image} alt={cafe.hero.alt} width="1292" height="1218" fetchPriority="high" />
      </section>
      {cafe.sections.menu && <section id="menu" className="menu-section page-section" aria-labelledby="menu-title">
        <div className="menu-feature">
          <figure className="coffee-photo"><img src={cafe.coffee.image} alt={cafe.coffee.alt} width="1466" height="1073" loading="lazy" /><figcaption>{cafe.demo ? 'Вымышленное бистро. Изображения сгенерированы.' : cafe.type}</figcaption></figure>
          <div className="menu-teaser">
            <h2 id="menu-title">{cafe.demo ? 'Пример меню' : 'Меню'}</h2>
            {cafe.featured.map(id => cafe.menu.dishes.find(dish => dish.id === id)).filter(Boolean).map(dish => <Dish key={dish.id} dish={dish} compact />)}
            <a className="text-button menu-open" href="/menu" onClick={event=>navigate(event,'/menu')}>Всё меню · состав и цены</a>
          </div>
        </div>
        <p className="demo-caption">{cafe.demo ? 'Демонстрационный концепт. Данные и изображения — примеры.' : 'Сезонные блюда и напитки'}</p>
      </section>}
      {cafe.sections.pickup && <Pickup cart={cart} onChange={changeCart} clear={()=>setCart({})} navigate={navigate} />}
      {cafe.sections.about && <section id="about" className="about-section page-section" aria-labelledby="about-title">
        <p className="eyebrow">{cafe.type}</p><div className="about-layout"><h2 id="about-title">{cafe.about.title}</h2><div>{cafe.about.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></div>
      </section>}
      {cafe.sections.gallery && <Gallery />}
      {cafe.sections.faq && <Questions />}
      {cafe.sections.visit && <section id="visit" className="visit-section page-section" aria-labelledby="visit-title">
        <div className="visit-intro"><h2 id="visit-title">{cafe.visit.title}</h2><p>Для завтрака на двоих<br />и ужина без повода.</p>{bookButton('button', 'Выбрать столик')}</div>
        <div className="visit-info"><h3>{cafe.demo ? 'Пример часов работы' : 'Часы работы'}</h3><dl className="hours">{cafe.visit.hours.map(row => <div key={row.days}><dt>{row.days}</dt><dd>{row.time}</dd></div>)}</dl><h3>Адрес и связь</h3>{cafe.visit.address && <p>{cafe.visit.address}</p>}{cafe.visit.phone && <a className="contact-link" href={'tel:' + cafe.visit.phone.replace(/[^+\d]/g, '')}>{cafe.visit.phone}</a>}{cafe.visit.mapUrl && <a className="contact-link" href={cafe.visit.mapUrl} target="_blank" rel="noopener noreferrer">Открыть на карте</a>}{cafe.visit.note && <p className="visit-note">{cafe.visit.note}</p>}</div>
      </section>}
      </>}
    </main>
    <footer className="site-footer"><a href="/" onClick={event=>navigate(event,'/')} className="wordmark">{cafe.name}</a><p>{cafe.demo ? `Шаблон для кафе и ресторанов. «${cafe.name}» — вымышленное бистро.` : cafe.type}</p><a href="#main">Наверх</a></footer>
    <Booking dialog={dialog} onClose={() => opener.current?.focus()} />
    {cafe.sections.pickup && cartCount > 0 && <a className="cart-shortcut" href="/#pickup" onClick={event=>navigate(event,'/#pickup')} aria-label="Перейти к заказу навынос"><span>С собой · {cartCount}</span><strong>{money(cartTotal)}</strong></a>}
  </>;
}
