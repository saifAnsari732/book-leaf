import { beforeEach, describe, expect, it } from "vitest";
import {
  broadcastRealtimeTicketEvent,
  subscribeRealtimeTicketEvents,
  getRealtimeStats,
  RealtimeTicketEvent,
} from "@/lib/realtime-service";
import {
  createAuthorTicket,
  addAuthorMessageToTicket,
  updateTicketByAdmin,
  sendAdminReplyToTicket,
  resetAndSeedDatabase,
  findUserByEmail,
} from "@/lib/repository";
import { toSafeUser } from "@/lib/auth";
import { initWebSocketServer } from "@/lib/websocket-server";
import { WebSocket } from "ws";

describe("Realtime WebSocket & Event Broadcasting Hub Tests", () => {
  beforeEach(async () => {
    await resetAndSeedDatabase();
  });

  it("1. Broadcasts events to subscribers with unique IDs, timestamps, and ring buffer tracking", () => {
    const receivedEvents: RealtimeTicketEvent[] = [];

    const unsubscribe = subscribeRealtimeTicketEvents((evt) => {
      receivedEvents.push(evt);
    });

    const evt1 = broadcastRealtimeTicketEvent({
      type: "TICKET_CREATED",
      ticket_id: "TKT-TEST-99",
      author_id: "AUTH001",
      sender_name: "Priya Sharma",
      sender_role: "AUTHOR",
      title: "Test Realtime Ticket",
      message: "Need urgent royalty assistance",
    });

    expect(evt1.id).toBeDefined();
    expect(evt1.id.startsWith("evt_")).toBe(true);
    expect(evt1.timestamp).toBeDefined();
    expect(receivedEvents.length).toBe(1);
    expect(receivedEvents[0].ticket_id).toBe("TKT-TEST-99");

    const stats = getRealtimeStats();
    expect(stats.activeSubscribers).toBeGreaterThanOrEqual(1);

    unsubscribe();

    // Verify unsubscribe no longer receives events
    broadcastRealtimeTicketEvent({
      type: "HEARTBEAT",
      ticket_id: "TKT-TEST-99",
    });

    expect(receivedEvents.length).toBe(1);
  });

  it("2. createAuthorTicket automatically broadcasts TICKET_CREATED via repository", async () => {
    const authorUser = await findUserByEmail("priya.sharma@email.com");
    expect(authorUser).not.toBeNull();
    const safeAuthor = toSafeUser(authorUser!);

    const captured: RealtimeTicketEvent[] = [];
    const unsub = subscribeRealtimeTicketEvents((evt) => {
      if (evt.type === "TICKET_CREATED") {
        captured.push(evt);
      }
    });

    const ticket = await createAuthorTicket({
      author: safeAuthor,
      book: null,
      subject: "WebSocket Live Realtime Test Query",
      description: "Checking that WebSocket event broadcasts immediately",
      attachments: [],
      aiMetadata: {
        status: "Completed",
        provider: "gemini",
        model: "gemini-2.5-flash",
        suggested_category: "General Inquiry",
        suggested_priority: "Medium",
        rationale: "Live test",
        draft_reply: "Test reply",
        tokens_estimated: 100,
        tokens_saved_pct: 75,
        human_overridden: false,
        failure_reason: null,
        analyzed_at: new Date().toISOString(),
      },
    });

    unsub();

    expect(captured.length).toBeGreaterThanOrEqual(1);
    const last = captured[captured.length - 1];
    expect(last.ticket_id).toBe(ticket.ticket_id);
    expect(last.sender_role).toBe("AUTHOR");
    expect(last.title).toBe("WebSocket Live Realtime Test Query");
  });

  it("3. addAuthorMessageToTicket automatically broadcasts MESSAGE_POSTED via repository", async () => {
    const authorUser = await findUserByEmail("priya.sharma@email.com");
    expect(authorUser).not.toBeNull();
    const safeAuthor = toSafeUser(authorUser!);

    const captured: RealtimeTicketEvent[] = [];
    const unsub = subscribeRealtimeTicketEvents((evt) => {
      if (evt.type === "MESSAGE_POSTED") {
        captured.push(evt);
      }
    });

    const result = await addAuthorMessageToTicket({
      author: safeAuthor,
      ticketId: "TKT-1003",
      content: "Hello BookLeaf support, sending a follow-up via Live WebSocket!",
      attachments: [],
    });

    unsub();

    expect(result.status).toBe("OK");
    expect(captured.length).toBeGreaterThanOrEqual(1);
    const last = captured[captured.length - 1];
    expect(last.ticket_id).toBe("TKT-1003");
    expect(last.message).toContain("sending a follow-up via Live WebSocket!");
  });

  it("4. sendAdminReplyToTicket automatically broadcasts MESSAGE_POSTED and TICKET_UPDATED", async () => {
    const adminUser = await findUserByEmail("admin@bookleafpub.com");
    expect(adminUser).not.toBeNull();
    const safeAdmin = toSafeUser(adminUser!);

    const captured: RealtimeTicketEvent[] = [];
    const unsub = subscribeRealtimeTicketEvents((evt) => {
      captured.push(evt);
    });

    const replyResult = await sendAdminReplyToTicket({
      ticketId: "TKT-1001",
      admin: safeAdmin,
      content: "We have reviewed your request and processed the payment update.",
      newStatus: "Resolved",
    });

    unsub();

    expect(replyResult).not.toBeNull();
    expect(replyResult?.ticket.status).toBe("Resolved");

    const messageEvents = captured.filter(
      (e) => e.type === "MESSAGE_POSTED" && e.ticket_id === "TKT-1001"
    );
    const updateEvents = captured.filter(
      (e) => e.type === "TICKET_UPDATED" && e.ticket_id === "TKT-1001"
    );

    expect(messageEvents.length).toBeGreaterThanOrEqual(1);
    expect(updateEvents.length).toBeGreaterThanOrEqual(1);
    expect(updateEvents[0].status).toBe("Resolved");
  });

  it("5. WebSocket Server accepts connections, performs handshake, and replies to PING with PONG", async () => {
    const testPort = 3123;
    const wss = initWebSocketServer(testPort);
    expect(wss).not.toBeNull();

    await new Promise<void>((resolve, reject) => {
      const client = new WebSocket(`ws://localhost:${testPort}`);
      let handshakeReceived = false;

      client.on("open", () => {
        client.send(JSON.stringify({ type: "PING" }));
      });

      client.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "HANDSHAKE_ACK") {
          handshakeReceived = true;
        } else if (msg.type === "PONG") {
          expect(handshakeReceived).toBe(true);
          expect(msg.timestamp).toBeDefined();
          client.close();
          resolve();
        }
      });

      client.on("error", (err) => {
        reject(err);
      });
    });

    wss?.close();
  });
});
