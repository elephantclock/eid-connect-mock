#!/usr/bin/env node
import { parseArgs } from 'node:util';
import readline from 'node:readline';
import { createMockBridge } from '../src/server.js';

const { values } = parseArgs({
  options: {
    port: { type: 'string', short: 'p', default: '8080' },
    host: { type: 'string', default: '127.0.0.1' },
    origin: { type: 'string', multiple: true, default: [] },
    interval: { type: 'string', short: 'i' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`eid-connect-mock - fake EID Connect bridge with synthetic Emirates ID data

Usage: eid-connect-mock [--port 8080] [--host 127.0.0.1] [--origin http://localhost:5173] [--interval 5]

  --port, -p      port to listen on (default 8080, same as the real bridge)
  --host          interface to bind (default 127.0.0.1)
  --origin        allowed browser origin; repeat for several (default: any)
  --interval, -i  emit a sample card every N seconds

Keys while running:  c = card read   n = NFC tag   q = quit
HTTP triggers:       POST /mock/card   POST /mock/nfc`);
  process.exit(0);
}

const bridge = createMockBridge({
  port: Number(values.port),
  host: values.host,
  allowedOrigins: values.origin,
  log: (m) => console.log(`[mock] ${m}`),
});

await bridge.listen();
console.log(`[mock] EID Connect mock bridge on http://${values.host}:${values.port}`);
console.log('[mock] SSE stream:  /events    status: /status');
console.log('[mock] press c = card, n = NFC tag, q = quit');
console.log('[mock] all data is synthetic - see src/samples.js');

if (values.interval) {
  setInterval(() => bridge.emitCard(), Number(values.interval) * 1000);
}

if (process.stdin.isTTY) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', async (_, key) => {
    if (key.name === 'c') console.log(`[mock] card_read -> ${bridge.emitCard().fullNameEnglish}`);
    else if (key.name === 'n') console.log(`[mock] nfc_card_read -> ${bridge.emitNfc().uid}`);
    else if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      await bridge.close();
      process.exit(0);
    }
  });
}
