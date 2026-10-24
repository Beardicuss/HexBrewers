import { createServer } from "vite";

// Release builds keep DLC activation sealed. Browser QA explicitly unlocks it
// so the expansion mechanics remain regression-tested before their launch.
process.env.VITE_DLC_ACTIVATION = "true";
const server = await createServer({ server: { host: "127.0.0.1", port: 4173 } });
await server.listen();
server.printUrls();
