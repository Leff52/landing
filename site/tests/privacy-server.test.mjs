import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPrivacyServer } from '../scripts/privacy-server.mjs';

test('Consent receipt: validation, durable record, privacy and static isolation', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'rentzal-consent-'));
  const root = join(temporary, 'public');
  const dataDir = join(temporary, 'private');
  await mkdir(root);
  await mkdir(dataDir);
  await writeFile(join(root, 'index.html'), '<h1>Test</h1>');
  await writeFile(join(dataDir, '2000-01-01.jsonl'), 'expired');
  const config = { siteUrl: 'https://example.test/landing/', reviewedAndReady: true, counterId: '123',
    operatorName: 'Test', operatorAddress: 'Test address', contactEmail: 'test@example.test', version: 'test-1' };
  const server = await createPrivacyServer({ config, root, dataDir });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/landing`;
  const post = (body, origin = 'https://example.test') => fetch(`${url}/api/privacy-consent`, { method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await readdir(dataDir)).length, 0);
    assert.equal((await post({ choice: 'accepted', version: 'test-1' }, 'https://evil.test')).status, 403);
    assert.equal((await post({ choice: 'accepted', version: 'old' })).status, 400);
    assert.equal((await post(null)).status, 400);
    assert.equal((await post({ choice: 'accepted', version: 'test-1', extra: 'x'.repeat(2000) })).status, 413);
    const accepted = await post({ choice: 'accepted', version: 'test-1', email: 'must-not-be-recorded' });
    assert.equal(accepted.status, 201);
    const { receiptId } = await accepted.json();
    assert.match(receiptId, /^[a-f0-9-]{36}$/);
    assert.equal((await post({ choice: 'withdrawn', version: 'test-1', receiptId })).status, 201);
    const records = (await readFile(join(dataDir, (await readdir(dataDir))[0]), 'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(records.length, 2);
    assert.equal(records[0].receiptId, records[1].receiptId);
    assert.equal(records[1].choice, 'withdrawn');
    assert.equal(JSON.stringify(records).includes('must-not-be-recorded'), false);
    assert.equal((await fetch(`${url}/`)).status, 200);
    assert.equal((await fetch(`${url}/%2e%2e%5cprivate`)).status, 404);
    assert.equal((await fetch(`${url}/.env`)).status, 404);
    assert.equal((await fetch(`${url}/api/privacy-consent`)).status, 405);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(temporary, { recursive: true });
  }
});

test('Incomplete operator configuration fails closed', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'rentzal-consent-'));
  const server = await createPrivacyServer({ config: { siteUrl: 'https://example.test/', reviewedAndReady: false },
    root: join(temporary, 'public'), dataDir: join(temporary, 'private') });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/privacy-consent`, { method: 'POST' });
    assert.equal(response.status, 503);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(temporary, { recursive: true });
  }
});
