# EID Connect Mock: build Emirates ID integrations without a reader

> **Ready to go live with real cards?** The production EID Connect reader service is commercially licensed.
> **[Get a commercial licence or free trial →](./COMMERCIAL.md)** · [info@elephantclock.ae](mailto:info@elephantclock.ae?subject=EID%20Connect) · [WhatsApp +971 50 702 2916](https://wa.me/971507022916)

A drop-in stand-in for the EID Connect bridge. It serves the **same HTTP + Server-Sent
Events protocol** on the same port, and streams **synthetic** Emirates ID card reads. Use it
to build and test your app, in CI and in demos, with no hardware, SDK or licence.

```bash
npx @elephantclock/eid-connect-mock
```

```
[mock] EID Connect mock bridge on http://127.0.0.1:8080
[mock] press c = card, n = NFC tag, q = quit
```

Press **c** to send a card read and **n** to send a plain NFC tag.

## Options

| Flag | Default | |
|---|---|---|
| `--port`, `-p` | `8080` | Same port as the real bridge |
| `--host` | `127.0.0.1` | Use `0.0.0.0` to test from a phone or tablet on your LAN |
| `--origin` | any | Allowed browser origin. Repeat it for several. |
| `--interval`, `-i` | off | Send a card every N seconds |

## Endpoints

| | |
|---|---|
| `GET /events` | SSE stream: `connection`, `card_read`, `nfc_card_read` |
| `GET /status` | `{ "status": "running", "clients": 1, "mock": true }` |
| `POST /mock/card` | Trigger a card read (for automated tests) |
| `POST /mock/nfc` | Trigger an NFC tag read |

## Use in tests

```js
import { createMockBridge } from '@elephantclock/eid-connect-mock';

const bridge = createMockBridge({ port: 18080 });
await bridge.listen();
bridge.emitCard();          // sends the next sample card to all connected clients
await bridge.close();
```

## Sample data

All three cards are fictional. ID numbers use `0000` in the year position, so they can never
match a real person, and the photo is a plain silhouette.

| Card | Purpose |
|---|---|
| SAMPLE CARDHOLDER ONE | Adult, valid card |
| SAMPLE CARDHOLDER TWO | Adult, **expired** card |
| SAMPLE MINOR THREE | Under 18, for age-check testing |

## Licence

Free for **personal, educational and non-commercial** use under the
[PolyForm Noncommercial License 1.0.0](./LICENSE).
**Commercial use requires a licence**: see [COMMERCIAL.md](./COMMERCIAL.md).

---

Made in Abu Dhabi by [ElephantClock](https://www.elephantclock.ae) ·
[Docs](https://elephantclock.github.io/eid-connect/) ·
[Client library](https://github.com/elephantclock/eid-connect-js) ·
[Examples](https://github.com/elephantclock/eid-connect-examples).
Not affiliated with or endorsed by ICP.
