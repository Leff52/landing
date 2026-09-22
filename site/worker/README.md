# Бесплатный API согласий

Worker принимает только `accepted` и `withdrawn` для GitHub Pages и хранит UUID согласия в KV 180 дней. IP-адрес, User-Agent, query string и контактные данные не сохраняются.

## Первый запуск

Из каталога `site`:

```powershell
.\node_modules\.bin\wrangler.cmd login
.\node_modules\.bin\wrangler.cmd kv namespace create RENTZAL_CONSENTS
```

Скопируйте выданный `id` в `worker/wrangler.toml` вместо `REPLACE_AFTER_KV_CREATE`, затем выполните:

```powershell
.\node_modules\.bin\wrangler.cmd deploy worker/src/index.ts --config worker/wrangler.toml
```

Wrangler напечатает URL вида `https://rentzal-consent.<ваш-аккаунт>.workers.dev`. Запишите его в `site/privacy.config.json` в поле `consentApiUrl`, добавьте `/api/privacy-consent`, установите `reviewedAndReady` в `true`, пересоберите Pages и отправьте изменения в ветку `main`.

Проверка endpoint:

```powershell
$body = '{"choice":"accepted","version":"2026-09-22.2"}'
Invoke-WebRequest -Method Post -Uri 'https://ВАШ-WORKER.workers.dev/api/privacy-consent' -Headers @{ Origin = 'https://leff52.github.io'; 'Content-Type' = 'application/json' } -Body $body
```
