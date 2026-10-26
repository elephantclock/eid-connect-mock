import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMockBridge } from '../src/server.js';

const port = 18090;

async function readEvents(url, n, headers = {}) {
  const res = await fetch(url, { headers });
  const decoder = new TextDecoder();
  let buf = '';
  const out = [];
  for await (const chunk of res.body) {
    buf += decoder.decode(chunk);
    for (const f of buf.split('\n\n').slice(0, -1)) out.push(JSON.parse(f.slice(6)));
    buf = buf.split('\n\n').pop();
    if (out.length >= n) break;
  }
  return out;
}

test('mock streams connection then card_read with synthetic data', async () => {
  const bridge = createMockBridge({ port, log: () => {} });
  await bridge.listen();
  const pending = readEvents(`http://127.0.0.1:${port}/events`, 2);
  while (bridge.clientCount === 0) await new Promise((r) => setTimeout(r, 10));
  await fetch(`http://127.0.0.1:${port}/mock/card`, { method: 'POST' });
  const [conn, card] = await pending;
  assert.equal(conn.type, 'connection');
  assert.equal(card.type, 'card_read');
  assert.match(card.id, /^784-0000-/);
  assert.ok(card.photo.length > 100);
  const status = await (await fetch(`http://127.0.0.1:${port}/status`)).json();
  assert.equal(status.mock, true);
  await bridge.close();
});

test('mock rejects origins outside the allowlist', async () => {
  const bridge = createMockBridge({ port: port + 1, allowedOrigins: ['http://localhost:5173'], log: () => {} });
  await bridge.listen();
  const bad = await fetch(`http://127.0.0.1:${port + 1}/status`, { headers: { Origin: 'https://evil.example' } });
  const good = await fetch(`http://127.0.0.1:${port + 1}/status`, { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(bad.status, 403);
  assert.equal(good.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  await bridge.close();
});
