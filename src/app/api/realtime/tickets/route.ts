export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  RealtimeTicketEvent,
  subscribeRealtimeTicketEvents,
  getRealtimeStats,
} from "@/lib/realtime-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required for live stream" },
        { status: 401 }
      );
    }

    const encoder = new TextEncoder();
    let isStreamClosed = false;

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection handshake
        const handshake = `event: connected\ndata: ${JSON.stringify({
          status: "connected",
          user_id: user.user_id,
          role: user.role,
          author_id: user.author_id,
          stats: getRealtimeStats(),
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(handshake));

        // Subscribe to real-time events from repository / socket bus
        const unsubscribe = subscribeRealtimeTicketEvents(
          (event: RealtimeTicketEvent) => {
            if (isStreamClosed) return;

            // Security isolation: Authors only receive events for their own tickets
            if (user.role === "AUTHOR") {
              if (event.author_id && event.author_id !== user.author_id) {
                return;
              }
            }

            try {
              const payload = `event: ticket_event\ndata: ${JSON.stringify(
                event
              )}\n\n`;
              controller.enqueue(encoder.encode(payload));
            } catch {
              isStreamClosed = true;
              unsubscribe();
            }
          }
        );

        // Keep-alive heartbeat every 15s to keep NAT / proxies active
        const heartbeatInterval = setInterval(() => {
          if (isStreamClosed) {
            clearInterval(heartbeatInterval);
            return;
          }
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            isStreamClosed = true;
            clearInterval(heartbeatInterval);
            unsubscribe();
          }
        }, 15000);

        // Handle client abort / disconnect
        req.signal.addEventListener("abort", () => {
          isStreamClosed = true;
          clearInterval(heartbeatInterval);
          unsubscribe();
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[RealtimeRoute] Connection error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to establish live real-time stream" },
      { status: 500 }
    );
  }
}
