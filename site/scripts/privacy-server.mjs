import { createServer } from 'node:http';
import { appendFile, mkdir, readFile, readdir, unlink, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const retentionMs = 180 * 86400000;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.rsc': 'text/x-component', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

// Behind an HTTPS reverse proxy on a host approved by the operator.
export async function createPrivacyServer({ config, root, dataDir }) {
  const site = new URL(config.siteUrl);
  const base = site.pathname.replace(/\/$/, '');
  const apiPath = `${base}/api/privacy-consent`;
  const ready = config.reviewedAndReady && /^[1-9]\d{0,14}$/.test(config.counterId) &&
    config.operatorName.trim() && config.operatorAddress.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail);
  const directory = resolve(dataDir);
  const publicRoot = resolve(root);
  if (directory === publicRoot || directory.startsWith(publicRoot + sep)) throw new Error('Consent data must be outside the public directory');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  async function purgeExpired() {
    for (const name of await readdir(directory)) {
      if (!/^\d{4}-\d{2}-\d{2}\.jsonl$/.test(name)) continue;
      if (Date.parse(name.slice(0, 10)) + 86400000 + retentionMs < Date.now()) await unlink(join(directory, name));
    }
  }
  await purgeExpired();
  let writes = Promise.resolve();
  let rateWindow = Date.now();
  let requestCount = 0;
  const server = createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'DENY');
    const reply = (status, body) => {
      response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(body));
    };
    try {
      const path = new URL(request.url, 'http://localhost').pathname;
      if (path === apiPath) {
        if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' });
        if (!ready) return reply(503, { error: 'Analytics is not configured' });
        if (request.headers.origin !== site.origin) return reply(403, { error: 'Origin rejected' });
        if (request.headers['content-type'] !== 'application/json') return reply(415, { error: 'JSON required' });
        if (Date.now() - rateWindow > 60000) { rateWindow = Date.now(); requestCount = 0; }
        if (++requestCount > 120) return reply(429, { error: 'Try again later' });
        let payload = '';
        for await (const chunk of request) {
          payload += chunk.toString('utf8');
          if (Buffer.byteLength(payload) > 1024) return reply(413, { error: 'Too large' });
        }
        let body;
        try { body = JSON.parse(payload); } catch { return reply(400, { error: 'Invalid JSON' }); }
        if (!body || body.version !== config.version || !['accepted', 'withdrawn'].includes(body.choice)) return reply(400, { error: 'Invalid consent' });
        if (body.choice === 'withdrawn' && !/^[a-f0-9-]{36}$/.test(body.receiptId || '')) return reply(400, { error: 'Invalid receipt' });
        const receiptId = body.choice === 'accepted' ? randomUUID() : body.receiptId;
        const recordedAt = new Date().toISOString();
        const record = { receiptId, choice: body.choice, version: config.version, recordedAt,
          expiresAt: new Date(Date.now() + retentionMs).toISOString(), siteUrl: config.siteUrl };
        // No IP, user-agent, query string or contact fields are copied into the journal.
        const write = writes.then(() => appendFile(join(directory, `${recordedAt.slice(0, 10)}.jsonl`), JSON.stringify(record) + '\n', { mode: 0o600, flush: true }));
        writes = write.catch(() => {});
        await write;
        return reply(201, { receiptId });
      }
      if (!['GET', 'HEAD'].includes(request.method)) return reply(405, { error: 'Method not allowed' });
      if (base && path !== base && !path.startsWith(base + '/')) return reply(404, { error: 'Not found' });
      const relative = decodeURIComponent(path.slice(base.length)).replace(/^\/+/, '');
      if (relative.split(/[\\/]/).some((part) => part.startsWith('.')) || relative.includes('\\') || relative.includes('\0')) return reply(404, { error: 'Not found' });
      let file = resolve(publicRoot, relative || 'index.html');
      if (!file.startsWith(publicRoot + sep) && file !== publicRoot) return reply(404, { error: 'Not found' });
      try {
        if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      } catch { if (!extname(file)) file += '.html'; }
      const bytes = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (error.code === 'ENOENT' || error instanceof URIError) return reply(404, { error: 'Not found' });
      console.error('Privacy server request failed:', error.code || 'request error');
      reply(503, { error: 'Service unavailable' });
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  const timer = setInterval(() => { void purgeExpired().catch(() => console.error('Consent retention cleanup failed')); }, 3600000);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = JSON.parse(await readFile(new URL('../privacy.config.json', import.meta.url), 'utf8'));
  if (!process.env.CONSENT_DATA_DIR) throw new Error('Set CONSENT_DATA_DIR outside the public website directory');
  const server = await createPrivacyServer({ config, root: resolve('dist/client'), dataDir: process.env.CONSENT_DATA_DIR });
  server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('Landing and consent API listening on 127.0.0.1'));
}
