import { ArrowUpRight, ArrowDown, MapPin, CalendarDays, Clock3, Users, Check, MoveUpRight } from 'lucide-react';
import { ProductLink } from './product-link';
import { FAQ } from './faq';
import { asset } from '@/lib/asset';

export default function Home() {
  return <main id="top">
    <a className="skip-link" href="#how">Перейти к содержимому</a>
    <div className="dark-shell">
      <header className="header wrap">
        <a className="brand" href="#top" aria-label="RentZal — на главную"><img src={asset('/brand/mainlogo.svg')} width="34" height="40" alt=""/><span>rent<span className="lime">.</span>zal</span></a>
        <nav aria-label="Основная навигация"><a href="#how">Как это работает</a><a href="#sports">Виды спорта</a><a href="#about">О проекте</a></nav>
        <ProductLink className="button button-small">Найти игру <ArrowUpRight size={18}/></ProductLink>
      </header>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><span className="status-dot"/> СПОРТ НАЧИНАЕТСЯ С ТЕБЯ</p>
          <h1 id="hero-title">Твоя игра.<br/>Твои люди.<br/><span className="lime">Твоё место.</span></h1>
          <p className="hero-description">Хочешь играть, но не с кем? Найди игру рядом,<br className="desktop-break"/> присоединяйся к другим и выходи на площадку.</p>
          <ProductLink className="button hero-button">Найти свою игру <ArrowUpRight size={23}/></ProductLink>
          <p className="hero-note">Приходи один. Играй вместе.</p>
        </div>
        <div className="hero-visual"><img className="hero-photo" src={asset('/images/basketball.jpg')} alt="Любительская баскетбольная игра в спортивном зале" width="1800" height="1200" fetchPriority="high"/>
          <div className="photo-top"><span>ЕСТЬ МЕСТО ДЛЯ ТЕБЯ</span><span>RENT.ZAL / В ИГРЕ</span></div>
          <span className="photo-label"><MapPin size={15}/> Ближе, чем кажется</span>
          <div className="photo-caption"><span>Меньше переписок.<br/><strong>Больше игры.</strong></span><a href="#how" aria-label="Узнать, как найти игру"><ArrowDown size={24}/></a></div>
        </div>
      </section>
      <div className="sport-strip wrap" id="sports"><span>ВЫБИРАЙ СВОЙ РИТМ</span><p>Баскетбол <i/> Волейбол <i/> Футбол <i/> Теннис</p><a href="#inside">Игра найдётся <ArrowUpRight size={18}/></a></div>
    </div>
    <section className="section wrap" id="how"><p className="eyebrow">01 / ВСЁ ПРОЩЕ, ЧЕМ КАЖЕТСЯ</p><h2>От «хочу поиграть»<br/>до «увидимся на площадке».</h2><div className="steps">{[['01','Найди свою игру','Выбери вид спорта, район и удобное время. Посмотри, где есть свободные места.'],['02','Займи своё место','Узнай стоимость, правила и условия участия до того, как присоединишься.'],['03','Приходи играть','Все твои записи — в одном месте. Остаётся взять форму и прийти на площадку.']].map(([n,title,text])=><article key={n}><span className="step-num">{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="inside-section" id="inside">
      <div className="wrap inside-grid">
        <div className="inside-copy"><p className="eyebrow">02 / ВСЯ ИГРА ПЕРЕД ГЛАЗАМИ</p><h2>Знаешь куда.<br/>Знаешь когда.<br/><span className="subtle">Остаётся прийти.</span></h2>
          <div className="feature-line"><span>01</span><div><h3>Удобно вписать в свой день</h3><p>Ищи по району и датам, чтобы спорт нашёл место между работой, учёбой и другими планами.</p></div></div>
          <div className="feature-line"><span>02</span><div><h3>Условия — до бронирования</h3><p>Площадка, свободные места, стоимость и правила собраны в карточке игры.</p></div></div>
          <div className="feature-line"><span>03</span><div><h3>Твои игры всегда под рукой</h3><p>Открывай «Мои участия», чтобы вернуться к своим записям и проверить их статус.</p></div></div>
        </div>
        <div className="demo-stage">
          <div className="demo-stage-top"><span>ТАК ВЫГЛЯДИТ ТВОЙ ПЛАН НА ВЕЧЕР</span><ArrowDown size={18}/></div>
          <article className="game-preview" aria-label="Пример карточки игры, не действительное предложение">
            <div className="preview-image"><img src={asset('/images/basketball.jpg')} width="1800" height="1200" loading="lazy" alt="Баскетбол на крытой площадке"/><span>БАСКЕТБОЛ</span><span className="example-tag">ПРИМЕР ИГРЫ</span></div>
            <div className="preview-body"><div className="preview-heading"><h3>Собираемся на баскетбол</h3><ArrowUpRight size={23}/></div><p className="preview-location"><MapPin size={14}/> Спорткомплекс «Север» · Северный район</p>
              <div className="game-meta"><span><CalendarDays size={17}/> Вечерняя игра</span><span><Clock3 size={17}/> 60 минут</span></div>
              <div className="game-places"><span><Users size={17}/> Есть с кем играть</span><span>1 / 8</span></div><meter className="place-meter" min="0" max="8" value="1">1 из 8 мест занято</meter>
              <div className="game-price"><span>Стоимость участия<strong>600 ₽ <small>/ человек</small></strong></span><span className="game-format">Формат 3 × 3</span></div>
              <ProductLink className="button preview-button">Посмотреть игры <ArrowUpRight size={20}/></ProductLink>
            </div>
          </article>
          <p className="demo-note"><Check size={15}/> Пример на основе демо-данных проекта.<br/>Актуальные игры и цены — в каталоге RentZal.</p>
        </div>
      </div>
    </section>
    <section className="section wrap community" id="about">
      <div className="community-image"><img src={asset('/images/volleyball.jpg')} width="1200" height="1800" loading="lazy" alt="Девушки играют в волейбол в спортивном зале"/><span>ОБЩИЙ ЯЗЫК — ИГРА.</span></div>
      <div className="community-copy"><p className="eyebrow">03 / МЕСТО ДЛЯ СВОИХ</p><h2>Необязательно<br/>знать всех.<br/><span className="subtle">Достаточно<br/>любить игру.</span></h2><p className="community-description">Переехал в новый район. Друзья снова заняты. Или просто давно хочется вернуться в спорт.</p><p className="community-description">Мы создаём RentZal, чтобы в такие моменты было легко найти людей, площадку и повод выйти из дома.</p><div className="brand-statement"><img src={asset('/brand/mainlogo.svg')} width="44" height="53" alt=""/><p>Каждый сможет<br/><strong>найти своё место.</strong></p></div></div>
    </section>
    <section className="faq-section wrap" id="faq"><div><p className="eyebrow">04 / ПЕРЕД ПЕРВОЙ ИГРОЙ</p><h2>Есть вопросы?<br/><span className="subtle">Это нормально.</span></h2></div><FAQ/></section>
    <section className="closing"><div className="wrap closing-inner"><div className="closing-top"><span className="eyebrow">МЕСТО В ИГРЕ НАЙДЁТСЯ</span><img src={asset('/brand/applogo.svg')} width="54" height="54" alt="Логотип приложения RentZal"/></div><h2>Следующая игра<br/>начинается <span>с тебя.</span></h2><div className="closing-bottom"><p>Бери форму. Остальное начинается с одного клика.</p><ProductLink className="button button-dark">Я в игре <MoveUpRight size={23}/></ProductLink></div></div></section>
    <footer className="footer"><div className="wrap"><div className="footer-top"><div><a href="#top" aria-label="RentZal — наверх"><img className="alternative-logo" src={asset('/brand/alternativelogo.svg')} width="250" height="38" alt="RentZal"/></a><p>Находим игру. Собираем людей.</p></div><nav aria-label="Навигация в подвале"><a href="#how">Как это работает</a><a href="#about">О проекте</a><a href="#faq">Вопросы и ответы</a></nav><a className="back-top" href="#top" aria-label="Вернуться наверх"><ArrowUpRight size={24}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RentZal</span><span>Приходи один. Играй вместе.</span></div></div></footer>
  </main>
}

