import type { ReactNode } from 'react';
import { asset } from '@/lib/asset';
import { consentReady, privacy } from '@/lib/privacy';

export function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
  return <main className="wrap legal-page">
    <a href={asset('/')}>← На главную RentZal</a>
    <h1>{title}</h1>
    <p>Редакция {privacy.version}</p>
    {!consentReady && <p className="legal-draft">Проект документа. Подключение аналитики ещё не завершено, Яндекс Метрика отключена. Условия ниже описывают её планируемое использование после завершения настройки.</p>}
    {children}
  </main>;
}

export function OperatorDetails() {
  return <dl>
    <dt>Оператор персональных данных</dt><dd>{privacy.operatorName}, физическое лицо</dd>
    <dt>Адрес оператора</dt><dd>{privacy.operatorAddress || 'Не указан — требуется заполнить до включения аналитики.'}</dd>
    <dt>Обращения по персональным данным</dt><dd><a href={`mailto:${privacy.contactEmail}`}>{privacy.contactEmail}</a></dd>
    <dt>Сайт</dt><dd><a href={privacy.siteUrl}>{privacy.siteUrl}</a></dd>
  </dl>;
}
