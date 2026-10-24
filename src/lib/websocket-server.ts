import { WebSocketServer, WebSocket } from "ws";
import {
  subscribeRealtimeTicketEvents,
  broadcastRealtimeTicketEvent,
  RealtimeTicketEvent,
  getRealtimeStats,
} from "./realtime-service";

let wssInstance: WebSocketServer | null = null;

export function initWebSocketServer(port = Number(process.env.WS_PORT) || 3001) {
  if (wssInstance) {
    return wssInstance;
  }

  try {
    const wss = new WebSocketServer({ port });
    wssInstance = wss;

    console.log(`[BookLeaf WS] WebSocket Server listening on ws://localhost:${port}`);

    // Bridge Realtime Hub events into WebSocket broadcasts
    subscribeRealtimeTicketEvents((event: RealtimeTicketEvent) => {
      const payload = JSON.stringify({
        type: "TICKET_EVENT",
        event,
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(payload);
          } catch (err) {
            console.error("[BookLeaf WS] Send error:", err);
          }
        }
      });
    });

    wss.on("connection", (ws, req) => {
      const clientIp = req.socket.remoteAddress;
      console.log(`[BookLeaf WS] Client connected from ${clientIp} (Total: ${wss.clients.size})`);

      // Send initial welcome & stats
      ws.send(
        JSON.stringify({
          type: "HANDSHAKE_ACK",
          message: "Connected to BookLeaf Realtime WebSocket Engine",
          stats: getRealtimeStats(),
          timestamp: new Date().toISOString(),
        })
      );

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "PING") {
            ws.send(JSON.stringify({ type: "PONG", timestamp: new Date().toISOString() }));
          } else if (msg.type === "BROADCAST") {
            // Client triggered action broadcast
            broadcastRealtimeTicketEvent({
              type: msg.actionType || "TICKET_UPDATED",
              ticket_id: msg.ticket_id,
              author_id: msg.author_id,
              sender_name: msg.sender_name || "User",
              sender_role: msg.sender_role || "SYSTEM",
              message: msg.content,
              status: msg.status,
              priority: msg.priority,
              category: msg.category,
              payload: msg.payload,
            });
          }
        } catch {
          // Ignore invalid JSON
        }
      });

      ws.on("close", () => {
        console.log(`[BookLeaf WS] Client disconnected (Remaining: ${wss.clients.size})`);
      });
    });

    return wss;
  } catch (err) {
    console.warn("[BookLeaf WS] Could not start WebSocket server (might be already running or in restricted port):", err);
    return null;
  }
}
