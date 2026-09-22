'use client';

import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { CONSENT_DAYS, CONSENT_KEY, consentReady, parseConsent, privacy, type Consent } from '@/lib/privacy';
import { startMetrica, stopMetrica } from '@/lib/metrica';

export function PrivacyControls() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const operation = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const settings = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    function sync() {
      operation.current++;
      abort.current?.abort();
      setPending(false);
      let saved: Consent | null = null;
      try { saved = parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { /* Default is no analytics. */ }
      let withdrawn = location.hash === '#analytics-off';
      try { withdrawn ||= sessionStorage.getItem(CONSENT_KEY + ':withdrawn') === 'true'; } catch { /* URL fallback remains available. */ }
      if (withdrawn) saved = { choice: 'rejected', version: privacy.version, expiresAt: Date.now() + CONSENT_DAYS * 86400000 };
      setConsent(saved);
      setOpen(!saved && consentReady);
      setHydrated(true);
      if (saved?.choice === 'accepted' && consentReady) startMetrica(privacy.counterId);
      else if (stopMetrica(privacy.counterId)) location.reload();
    }
    const initial = window.setTimeout(sync, 0);
    const storage = (event: StorageEvent) => { if (!event.key || event.key === CONSENT_KEY) sync(); };
    const checkExpiry = () => {
      try {
        const raw = localStorage.getItem(CONSENT_KEY);
        if (raw && !parseConsent(raw)) {
          try { localStorage.removeItem(CONSENT_KEY); } catch { /* Cleanup must not prevent expiry. */ }
          sync();
        }
      } catch { /* Storage denied: no new permission is inferred. */ }
    };
    const visible = () => { if (document.visibilityState === 'visible') checkExpiry(); };
    const timer = window.setInterval(checkExpiry, 1000);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', visible);
    return () => {
      abort.current?.abort();
      clearTimeout(initial);
      clearInterval(timer);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);

  function persist(value: Consent) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  async function accept() {
    if (!consentReady || pending) return;
    const current = ++operation.current;
    const controller = new AbortController();
    abort.current = controller;
    setPending(true);
    setError('');
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(asset('/api/privacy-consent'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: 'accepted', version: privacy.version }),
        signal: controller.signal, credentials: 'omit',
      });
      if (!response.ok) throw new Error('Consent was not recorded');
      const body = await response.json();
      if (!body || typeof body !== 'object' || !('receiptId' in body)) throw new Error('Missing receipt');
      const saved = parseConsent(JSON.stringify({ choice: 'accepted', version: privacy.version,
        expiresAt: Date.now() + CONSENT_DAYS * 86400000, receiptId: body.receiptId }));
      if (!saved) throw new Error('Invalid receipt');
      if (operation.current !== current) return;
      if (!persist(saved)) throw new Error('Storage unavailable');
      try { sessionStorage.removeItem(CONSENT_KEY + ':withdrawn'); } catch { /* Reload will remain fail-closed. */ }
      if (location.hash === '#analytics-off') history.replaceState(null, '', location.pathname + location.search);
      setConsent(saved);
      setOpen(false);
      settings.current?.focus();
      startMetrica(privacy.counterId);
    } catch {
      if (operation.current === current) setError('Не удалось сохранить согласие. Аналитика выключена. Можно продолжить без неё или повторить позже.');
    } finally {
      clearTimeout(timeout);
      if (operation.current === current) setPending(false);
    }
  }

  function reject() {
    operation.current++;
    abort.current?.abort();
    setPending(false);
    const saved: Consent = { choice: 'rejected', version: privacy.version,
      expiresAt: Date.now() + CONSENT_DAYS * 86400000 };
    const stored = persist(saved);
    try { sessionStorage.setItem(CONSENT_KEY + ':withdrawn', 'true'); } catch { /* Storage may be unavailable. */ }
    // A URL marker survives the reload even if storage keeps an old acceptance.
    if (!stored) {
      try { localStorage.removeItem(CONSENT_KEY); } catch { /* Session marker also protects subsequent navigation. */ }
      history.replaceState(null, '', location.pathname + location.search + '#analytics-off');
    }
    const wasActive = stopMetrica(privacy.counterId);
    if (consent?.receiptId) {
      void fetch(asset('/api/privacy-consent'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        credentials: 'omit', body: JSON.stringify({ choice: 'withdrawn', version: privacy.version, receiptId: consent.receiptId }),
      }).catch(() => { /* Local withdrawal is effective even if the server is unavailable. */ });
    }
    setConsent(saved);
    setError(stored ? '' : 'Аналитика выключена. Браузер не позволяет запомнить выбор.');
    setOpen(!stored);
    settings.current?.focus();
    // Unload the third-party runtime as well as destroying its counter.
    if (wasActive) location.reload();
  }

  return <>
    <div className="privacy-footer">
      <div className="wrap privacy-links">
        <a href={asset('/privacy/')}>Политика обработки данных</a>
        <a href={asset('/analytics-consent/')}>Согласие на аналитику</a>
        <a href={asset('/cookies/')}>О файлах cookie</a>
        <button ref={settings} type="button" disabled={!hydrated} aria-expanded={open} aria-controls="cookie-settings" onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => panel.current?.focus());
        }}>Настройки cookie</button>
      </div>
    </div>
    {open && <section ref={panel} tabIndex={-1} id="cookie-settings" className="cookie-panel" aria-labelledby="cookie-title">
      <div className="cookie-heading"><h2 id="cookie-title">Ваш выбор — ваши данные</h2>
        <button type="button" className="cookie-close" aria-label="Закрыть настройки cookie" onClick={() => { setOpen(false); settings.current?.focus(); }}>×</button></div>
      {consentReady ? <>
        <p>С вашего согласия Яндекс Метрика поможет нам узнать посещаемость сайта. Она обрабатывает cookie, IP-адрес и сведения о браузере и посещённых страницах. Без согласия счётчик не загружается.</p>
        <p>Нажимая «Разрешить аналитику», вы даёте <a href={asset('/analytics-consent/')}>отдельное согласие на обработку данных</a> владельцу сайта {privacy.operatorName} с использованием сервиса ООО «ЯНДЕКС». Отозвать его можно здесь в любой момент.</p>
        <p className="cookie-status">{consent?.choice === 'accepted' ? 'Ваше согласие сохранено.' : 'Сейчас аналитика выключена.'} Выбор сохраняется на {CONSENT_DAYS} дней. <a href={asset('/cookies/')}>Подробнее о cookie</a>.</p>
        <div className="cookie-actions">
          <button className="button cookie-secondary" type="button" onClick={reject}>{consent?.choice === 'accepted' ? 'Отозвать согласие' : 'Без аналитики'}</button>
          {consent?.choice !== 'accepted' && <button className="button" type="button" disabled={pending} onClick={accept}>{pending ? 'Сохраняем согласие…' : 'Разрешить аналитику'}</button>}
        </div>
      </> : <p>Сейчас Яндекс Метрика отключена. Аналитические cookie не используются.</p>}
      {error && <p role="alert" className="cookie-error">{error}</p>}
    </section>}
  </>;
}
