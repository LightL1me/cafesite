import { useEffect, useRef, useState } from 'react';
import cafe from './content.json';
import { localDate, money, orderError, prettyDate } from './utils';

function Quantity({ dish, count, onChange }) {
  return count ? <div className="quantity" aria-label={'Количество: ' + dish.name}>
    <button aria-label={'Убрать одну порцию: ' + dish.name} onClick={() => onChange(dish.id, -1)}>Убрать</button>
    <output aria-label={'Порций: ' + dish.name}>{count}</output>
    <button aria-label={'Добавить одну порцию: ' + dish.name} disabled={count >= cafe.pickup.maxQuantity} onClick={() => onChange(dish.id, 1)}>Ещё</button>
  </div> : <button className="add-dish" onClick={() => onChange(dish.id, 1)} aria-label={'Добавить в заказ: ' + dish.name}>Добавить с собой</button>;
}

export function Catalog({ cart, onChange, standalone = false }) {
  const Heading = standalone ? 'h1' : 'h2';
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [vegetarian, setVegetarian] = useState(false);
  const shown = cafe.menu.dishes.filter(dish => (category === 'all' || dish.category === category)
    && (!vegetarian || dish.vegetarian)
    && (dish.name + ' ' + dish.description).toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
  function reset() { setCategory('all'); setQuery(''); setVegetarian(false); }
  return <div id="full-menu" className="full-menu catalog">
    <div className="menu-heading"><Heading tabIndex={-1}>Меню на весь день</Heading><p>{cafe.menu.intro}</p></div>
    <div className="catalog-tools">
      <label className="search-label">Найти блюдо или ингредиент<input type="search" placeholder="Например, сырники или грибы" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="vegetarian-filter"><input type="checkbox" checked={vegetarian} onChange={event => setVegetarian(event.target.checked)} />Без мяса и рыбы</label>
    </div>
    <div className="menu-categories" role="group" aria-label="Категории меню">
      {[{id:'all',title:'Всё меню'},...cafe.menu.categories].map(item => <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.title}</button>)}
    </div>
    <div className="catalog-status"><p role="status">Найдено позиций: {shown.length}</p><button className="text-button" onClick={reset}>Сбросить фильтры</button></div>
    <div className="catalog-list" key={`${category}-${vegetarian}`}>{shown.map(dish => <article className="catalog-dish" key={dish.id}>
      <div className="dish-heading"><h3>{dish.name}</h3><span className="dish-price">{money(dish.price)}</span></div>
      <p>{dish.description}</p>
      <div className="dish-details"><span>{dish.weight}</span><details><summary>Состав и аллергены</summary><div className="dish-expanded">
        {dish.image && <img src={dish.image} alt={dish.name + '. Сгенерированное изображение.'} width="600" height="420" loading="lazy" />}
        <p>{dish.description}. Аллергены: {dish.allergens}.</p>
      </div></details></div>
      {cafe.sections.pickup && <Quantity dish={dish} count={cart[dish.id] || 0} onChange={onChange} />}
    </article>)}</div>
    {shown.length === 0 && <div className="menu-empty"><h3>Такого блюда не нашлось.</h3><p>Попробуйте другое название или уберите фильтры.</p><button className="text-button" onClick={reset}>Показать всё меню</button></div>}
    <p className="allergen-note">{cafe.menu.allergenNote}</p>
  </div>;
}

export function Pickup({ cart, onChange, clear, navigate }) {
  const [checkout, setCheckout] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [draft, setDraft] = useState(null);
  const title = useRef(null);
  const entries = cafe.menu.dishes.filter(dish => cart[dish.id]).map(dish => ({...dish,count:cart[dish.id]}));
  const total = entries.reduce((sum, dish) => sum + dish.price * dish.count, 0);
  useEffect(() => { if (result) title.current?.focus(); }, [result]);
  useEffect(() => { setResult(null); }, [cart]);
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const message = orderError(data);
    if (message) { setError(message); return; }
    setError(''); setDownloaded(false); setDraft(data); setResult({...data, entries, total});
  }
  function download() {
    const text = ['Демонстрационный список — ' + cafe.name, 'НЕ ОТПРАВЛЕН НА КУХНЮ. НЕ ОПЛАЧЕН.', '', prettyDate(result.date) + ', ' + result.time,
      ...result.entries.map(dish => `${dish.name} × ${dish.count} — ${money(dish.price * dish.count)}`), '', 'Итого: ' + money(result.total),
      result.comment ? 'Пожелания: ' + result.comment : '', 'Имя: ' + result.name, 'Телефон: ' + result.phone].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'spisok-s-soboy.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
  }
  return <section id="pickup" className="pickup-section page-section" aria-labelledby="pickup-title">
    <div className="pickup-intro"><p className="eyebrow">Заказ навынос</p><h2 id="pickup-title">{cafe.pickup.title}</h2><p>{cafe.pickup.description}</p><a className="text-button" href="/menu" onClick={event=>navigate(event,'/menu')}>Выбрать блюда в меню</a><img src={cafe.pickup.image} width="1466" height="1073" loading="lazy" alt={cafe.pickup.imageAlt} /><p className="image-note">{cafe.demo ? 'Пример подачи. Изображение сгенерировано.' : ''}</p></div>
    <div className="pickup-order">
      <h3 ref={title} tabIndex={-1}>{result ? 'Проверьте список.' : 'Ваш список'}</h3>
      {result ? <div className="pickup-result">
        <p className="pickup-date">{prettyDate(result.date)}, {result.time}</p>
        <ul>{result.entries.map(dish => <li key={dish.id}><span>{dish.name} <small>× {dish.count}</small></span><strong>{money(dish.price * dish.count)}</strong></li>)}</ul>
        <p className="order-total"><span>Итого</span><strong>{money(result.total)}</strong></p>
        {result.comment && <p className="order-comment">Пожелания: {result.comment}</p>}
        <p className="demo-result" role="status">Список готов. Это демонстрация: заказ не отправлен на кухню и не оплачен. Время выдачи не подтверждено.</p>
        <div className="pickup-actions pickup-actions--result"><button className="button" onClick={download}>Сохранить список</button>
        <button className="text-button order-edit" onClick={() => setResult(null)}>Изменить заказ</button>
        <button className="text-button order-edit" onClick={() => { setResult(null); setCheckout(false); clear(); }}>Очистить список</button></div>
        {downloaded && <p className="download-status" role="status">Файл со списком подготовлен для скачивания.</p>}
      </div> : <>
        {entries.length ? <><ul className="cart-items">{entries.map(dish => <li key={dish.id}>
          <div className="cart-item-title"><h4>{dish.name}</h4><strong>{money(dish.price * dish.count)}</strong></div>
          <Quantity dish={dish} count={dish.count} onChange={onChange} />
        </li>)}</ul><p className="order-total"><span>Итого</span><strong>{money(total)}</strong></p>
        <div className="pickup-actions">{cafe.pickup.mode === 'external' ? <a className="button" href={cafe.pickup.url} target="_blank" rel="noopener noreferrer">Сервис заказа</a> : <button className="button" onClick={() => setCheckout(!checkout)} aria-expanded={checkout} aria-controls="pickup-form">{checkout ? 'Скрыть оформление' : 'Выбрать время'}</button>}
        <button className="text-button order-edit" onClick={() => { clear(); setCheckout(false); }}>Очистить список</button>
        </div>
        </> : <div className="cart-empty"><p>Пока пусто.</p><p>Добавьте блюда в меню — они появятся здесь вместе с количеством и суммой.</p><a className="text-button" href="/menu" onClick={event=>navigate(event,'/menu')}>Перейти к меню</a></div>}
        {checkout && entries.length > 0 && cafe.pickup.mode === 'demo' && <form id="pickup-form" className="pickup-form" onSubmit={submit}>
          <h4>Когда заберёте?</h4><div className="form-grid"><label>Дата самовывоза<input name="date" type="date" required min={localDate()} defaultValue={draft?.date ?? localDate(1)} /></label><label>Время самовывоза<select name="time" defaultValue={draft?.time ?? '12:00'}>{cafe.pickup.times.map(time => <option key={time}>{time}</option>)}</select></label></div>
          <label>Имя для заказа<input name="name" autoComplete="given-name" required maxLength={60} defaultValue={draft?.name ?? ''} /></label><label>Телефон для заказа<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} defaultValue={draft?.phone ?? ''} /></label>
          <label>Комментарий к заказу<textarea name="comment" rows={3} maxLength={500} placeholder="Например, сколько нужно приборов" defaultValue={draft?.comment ?? ''} /></label>
          <p className="field-note">{cafe.pickup.note}</p>{error && <p className="form-error" role="alert">{error}</p>}
          <button className="button form-submit" type="submit">Проверить заказ</button>
        </form>}
      </>}
      {!result && (!checkout || entries.length === 0) && <p className="pickup-note">{cafe.pickup.note}</p>}
    </div>
  </section>;
}

export function Gallery() {
  const dialog = useRef(null);
  const opener = useRef(null);
  const [index,setIndex] = useState(0);
  const images = cafe.gallery.images;
  function open(event, i) { opener.current=event.currentTarget; setIndex(i); dialog.current.showModal(); }
  function change(delta) { setIndex(current => (current + delta + images.length) % images.length); }
  return <section id="space" className="gallery-section page-section" aria-labelledby="gallery-title">
    <div className="section-heading"><h2 id="gallery-title">{cafe.gallery.title}</h2><p>{cafe.gallery.intro}</p></div>
    <div className="gallery-layout">{images.map((item,i) => <figure key={item.src}>
      <button className="gallery-image" onClick={event=>open(event,i)} aria-label={'Увеличить: ' + item.caption}><img src={item.src} alt={item.alt} width={i===0?1586:1466} height={i===0?992:1073} loading="lazy" /></button>
      <figcaption>{item.caption}</figcaption>
    </figure>)}</div>
    {cafe.demo && <p className="image-note">Визуализация вымышленного бистро. Все изображения сгенерированы.</p>}
    <dialog ref={dialog} className="gallery-dialog" aria-label="Просмотр фотографий" onClose={()=>opener.current?.focus()} onKeyDown={event=>{ if(event.key==='ArrowRight')change(1); if(event.key==='ArrowLeft')change(-1); }}>
      <button className="text-button" onClick={()=>dialog.current.close()}>Закрыть фото</button>
      <img key={images[index].src} src={images[index].src} alt={images[index].alt} width="1586" height="992" />
      <div className="gallery-controls"><button className="text-button" onClick={()=>change(-1)}>Предыдущее фото</button><p aria-live="polite">{index+1} / {images.length}</p><button className="text-button" onClick={()=>change(1)}>Следующее фото</button></div>
      <p className="gallery-caption">{images[index].caption}</p>
    </dialog>
  </section>;
}

export function Questions() {
  return <section className="questions-section page-section" aria-labelledby="questions-title"><div><p className="eyebrow">Информация для гостей</p><h2 id="questions-title">Перед визитом.</h2><p className="image-note">{cafe.demo ? 'Примеры вопросов и условий для шаблона.' : ''}</p></div><div className="questions-list">{cafe.faq.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>;
}
