import { createServer } from "vite";

// Browser release-gate tests must mirror the public base-game build. DLC
// content remains covered by unit/integration tests, while its activation UI
// stays sealed until the expansion update deliberately enables it.
delete process.env.VITE_DLC_ACTIVATION;
const server = await createServer({ server: { host: "127.0.0.1", port: 4173 } });
await server.listen();
server.printUrls();
