import { initWebSocketServer } from "../src/lib/websocket-server";

const port = Number(process.env.WS_PORT) || 3001;
console.log(`Starting BookLeaf Realtime WebSocket Engine on port ${port}...`);
initWebSocketServer(port);
