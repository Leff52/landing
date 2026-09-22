type MetricaFunction = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
declare global {
  interface Window { ym?: MetricaFunction }
}

let active = false;
let generation = 0;

/** Called only after consent has been recorded by our server. */
export function startMetrica(counterId: string) {
  if (active || !/^[1-9]\d{0,14}$/.test(counterId)) return;
  active = true;
  const current = ++generation;
  const queue: MetricaFunction = (...args) => { (queue.a ||= []).push(args); };
  queue.l = Date.now();
  window.ym ||= queue;
  const script = document.createElement('script');
  script.id = 'rentzal-metrica';
  script.async = true;
  script.referrerPolicy = 'no-referrer';
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`;
  script.onload = () => {
    if (!active || generation !== current) return;
    window.ym?.(Number(counterId), 'init', {
      ssr: true, defer: true,
      webvisor: false, clickmap: false, trackLinks: false,
      trackHash: false, accurateTrackBounce: true, ecommerce: false,
      disableYtm: true, sendTitle: false,
    });
    // Do not forward query strings, fragments, or an external referrer.
    window.ym?.(Number(counterId), 'hit', location.origin + location.pathname, {
      referer: '', title: 'RentZal',
    });
  };
  script.onerror = () => { active = false; script.remove(); };
  document.head.appendChild(script);
}

export function stopMetrica(counterId: string) {
  const wasActive = active;
  active = false;
  generation++;
  if (window.ym?.a) window.ym.a = [];
  window.ym?.(Number(counterId), 'destruct');
  document.getElementById('rentzal-metrica')?.remove();
  // We can delete only first-party cookies accessible to this site.
  const names = document.cookie.split(';').map((part) => part.trim().split('=')[0])
    .filter((name) => name.startsWith('_ym_'));
  const hostParts = location.hostname.split('.');
  const paths = ['/', ...location.pathname.split('/').filter(Boolean)
    .map((_, index, parts) => '/' + parts.slice(0, index + 1).join('/') + '/')];
  for (const name of names) for (const path of paths) {
    const expired = `${name}=; Max-Age=0; path=${path}; SameSite=Lax`;
    document.cookie = expired;
    for (let index = 0; index < hostParts.length - 1; index++) {
      document.cookie = `${expired}; domain=.${hostParts.slice(index).join('.')}`;
    }
  }
  return wasActive;
}
