export interface Env {
  CONSENTS: KVNamespace;
  SITE_ORIGIN: string;
  CONFIG_VERSION: string;
}

const retentionSeconds = 180 * 86400;
const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function response(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...jsonHeaders,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}

function preflight(origin: string) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    if (origin !== env.SITE_ORIGIN) return response({ error: 'Origin rejected' }, 403, env.SITE_ORIGIN);
    if (request.method === 'OPTIONS') return preflight(env.SITE_ORIGIN);
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/api/privacy-consent') {
      return response({ error: 'Not found' }, 404, env.SITE_ORIGIN);
    }
    if (request.headers.get('Content-Type') !== 'application/json') {
      return response({ error: 'JSON required' }, 415, env.SITE_ORIGIN);
    }
    let body: { choice?: string; version?: string; receiptId?: string };
    try {
      if ((request.headers.get('Content-Length') || '').match(/^\d+$/) && Number(request.headers.get('Content-Length')) > 1024) {
        return response({ error: 'Too large' }, 413, env.SITE_ORIGIN);
      }
      body = await request.json();
    } catch {
      return response({ error: 'Invalid JSON' }, 400, env.SITE_ORIGIN);
    }
    if (body.version !== env.CONFIG_VERSION || !['accepted', 'withdrawn'].includes(body.choice || '')) {
      return response({ error: 'Invalid consent' }, 400, env.SITE_ORIGIN);
    }
    if (body.choice === 'withdrawn' && !/^[a-f0-9-]{36}$/.test(body.receiptId || '')) {
      return response({ error: 'Invalid receipt' }, 400, env.SITE_ORIGIN);
    }
    if (body.choice === 'withdrawn') {
      await env.CONSENTS.delete(body.receiptId!);
      return response({ receiptId: body.receiptId }, 200, env.SITE_ORIGIN);
    }
    const receiptId = crypto.randomUUID();
    await env.CONSENTS.put(receiptId, JSON.stringify({
      receiptId,
      choice: 'accepted',
      version: env.CONFIG_VERSION,
      recordedAt: new Date().toISOString(),
    }), { expirationTtl: retentionSeconds });
    return response({ receiptId }, 201, env.SITE_ORIGIN);
  },
};
