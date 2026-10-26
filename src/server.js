// EID Connect mock bridge: speaks the same HTTP + Server-Sent Events protocol as
// the real EID Connect service, but emits synthetic cards. No reader, SDK or licence needed.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { SAMPLE_CARDS, SAMPLE_NFC_TAGS, SAMPLE_PHOTO } from './samples.js';

const now = () => new Date().toISOString().slice(0, 23);

export function createMockBridge({ port = 8080, host = '127.0.0.1', allowedOrigins = [], log = console.log } = {}) {
  const clients = new Set();
  let cardCount = 0;
  let cardIndex = 0;
  let tagIndex = 0;

  function applyCors(req, res) {
    const origin = req.headers.origin;
    if (allowedOrigins.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return true;
    }
    res.setHeader('Vary', 'Origin');
    if (!origin) return true;
    if (!allowedOrigins.includes(origin)) return false;
    res.setHeader('Access-Control-Allow-Origin', origin);
    return true;
  }

  function send(event) {
    const frame = `data: ${JSON.stringify(event)}\n\n`;
    for (const res of clients) res.write(frame);
    return event;
  }

  const server = http.createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;

    if (req.method === 'OPTIONS') {
      if (!applyCors(req, res)) return res.writeHead(403).end();
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Private-Network': 'true',
        'Access-Control-Max-Age': '86400',
      });
      return res.end();
    }

    if (!applyCors(req, res)) {
      log(`rejected origin ${req.headers.origin}`);
      return res.writeHead(403).end();
    }

    if (path === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      clients.add(res);
      res.write(`data: ${JSON.stringify({ type: 'connection', status: 'connected', timestamp: now(), clientId: randomUUID() })}\n\n`);
      const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);
      req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(res);
      });
      log(`client connected (${clients.size})`);
      return;
    }

    if (path === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      return res.end(JSON.stringify({ status: 'running', clients: clients.size, timestamp: now(), mock: true }));
    }

    // Mock-only helpers so demos and tests can trigger reads over HTTP
    if (path === '/mock/card' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(emitCard()));
    }
    if (path === '/mock/nfc' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(emitNfc()));
    }

    res.writeHead(404).end();
  });

  function emitCard(index) {
    const card = SAMPLE_CARDS[index ?? cardIndex++ % SAMPLE_CARDS.length];
    const photo = SAMPLE_PHOTO;
    return send({
      type: 'card_read',
      timestamp: now(),
      ...card,
      nfcUid: card.cardSerialNumber,
      status: 'SUCCESS',
      photo,
      photoSize: photo.length,
      cardCount: ++cardCount,
      readerState: 'CONNECTED',
    });
  }

  function emitNfc() {
    const tag = SAMPLE_NFC_TAGS[tagIndex++ % SAMPLE_NFC_TAGS.length];
    return send({
      type: 'nfc_card_read',
      timestamp: now(),
      ...tag,
      readerType: 'NFC',
      readerState: 'CONNECTED',
      cardCount: ++cardCount,
    });
  }

  return {
    server,
    emitCard,
    emitNfc,
    get clientCount() {
      return clients.size;
    },
    listen: () => new Promise((resolve) => server.listen(port, host, resolve)),
    close: () =>
      new Promise((resolve) => {
        for (const res of clients) res.end();
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}
