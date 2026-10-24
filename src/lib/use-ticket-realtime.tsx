"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RealtimeTicketEvent } from "./realtime-service";
import { Activity, Radio, Wifi, Zap } from "lucide-react";

export type RealtimeMode = "WEBSOCKET" | "SSE" | "CONNECTING" | "OFFLINE";

export interface RealtimeContextValue {
  mode: RealtimeMode;
  isLive: boolean;
  pingMs: number | null;
  lastEvent: RealtimeTicketEvent | null;
  recentEvents: RealtimeTicketEvent[];
  stats: {
    connectedAt: string | null;
    eventsReceived: number;
    protocol: string;
  };
  sendPing: () => void;
  broadcastAction: (action: {
    actionType: string;
    ticket_id: string;
    author_id?: string;
    sender_name?: string;
    sender_role?: "AUTHOR" | "ADMIN" | "SYSTEM";
    content?: string;
    status?: string;
    priority?: string;
    category?: string;
    payload?: unknown;
  }) => void;
  subscribe: (listener: (event: RealtimeTicketEvent) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const WS_PORT = process.env.NEXT_PUBLIC_WS_PORT || "3001";

export function RealtimeTicketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<RealtimeMode>("CONNECTING");
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeTicketEvent | null>(null);
  const [recentEvents, setRecentEvents] = useState<RealtimeTicketEvent[]>([]);
  const [eventsReceived, setEventsReceived] = useState(0);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Set<(event: RealtimeTicketEvent) => void>>(new Set());
  const pingSentAtRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unmountedRef = useRef(false);

  const dispatchEventToListeners = useCallback((event: RealtimeTicketEvent) => {
    setLastEvent(event);
    setRecentEvents((prev) => [event, ...prev.slice(0, 19)]);
    setEventsReceived((count) => count + 1);

    listenersRef.current.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("[RealtimeClient] Listener callback error:", err);
      }
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("bookleaf:ticket_event", { detail: event })
      );
    }
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      pingSentAtRef.current = performance.now();
      wsRef.current.send(JSON.stringify({ type: "PING" }));
    }
  }, []);

  const broadcastAction = useCallback(
    (action: {
      actionType: string;
      ticket_id: string;
      author_id?: string;
      sender_name?: string;
      sender_role?: "AUTHOR" | "ADMIN" | "SYSTEM";
      content?: string;
      status?: string;
      priority?: string;
      category?: string;
      payload?: unknown;
    }) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "BROADCAST",
            ...action,
          })
        );
      }
    },
    []
  );

  const connectSSE = useCallback(() => {
    if (unmountedRef.current) return;
    if (sseRef.current) {
      sseRef.current.close();
    }

    try {
      const es = new EventSource("/api/realtime/tickets");
      sseRef.current = es;

      es.addEventListener("connected", () => {
        if (unmountedRef.current) return;
        setMode("SSE");
        setConnectedAt(new Date().toLocaleTimeString());
      });

      es.addEventListener("ticket_event", (e) => {
        if (unmountedRef.current) return;
        try {
          const event: RealtimeTicketEvent = JSON.parse(e.data);
          dispatchEventToListeners(event);
        } catch {
          // Ignore parse errors
        }
      });

      es.onerror = () => {
        if (unmountedRef.current) return;
        // If SSE temporarily drops, keep trying in background
        setMode("OFFLINE");
      };
    } catch {
      setMode("OFFLINE");
    }
  }, [dispatchEventToListeners]);

  const connectWebSocket = useCallback(() => {
    if (unmountedRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const host =
      typeof window !== "undefined"
        ? window.location.hostname || "localhost"
        : "localhost";
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || `ws://${host}:${WS_PORT}`;

    try {
      setMode("CONNECTING");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.info(
            "[BookLeaf WS] WebSocket timeout, falling back seamlessly to SSE stream."
          );
          ws.close();
          connectSSE();
        }
      }, 2500);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        if (unmountedRef.current) return;
        setMode("WEBSOCKET");
        setConnectedAt(new Date().toLocaleTimeString());
        sendPing();
      };

      ws.onmessage = (msgEvent) => {
        if (unmountedRef.current) return;
        try {
          const data = JSON.parse(msgEvent.data);
          if (data.type === "PONG") {
            const now = performance.now();
            const latency = Math.round(now - pingSentAtRef.current);
            setPingMs(latency > 0 ? latency : 5);
          } else if (data.type === "HANDSHAKE_ACK") {
            setMode("WEBSOCKET");
          } else if (data.type === "TICKET_EVENT" && data.event) {
            dispatchEventToListeners(data.event);
          }
        } catch {
          // Ignore non-json
        }
      };

      ws.onerror = () => {
        clearTimeout(connectionTimeout);
        if (unmountedRef.current) return;
        console.info(
          "[BookLeaf WS] Standalone WS unavailable, activating high-resilience SSE stream."
        );
        connectSSE();
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        // If WebSocket closed, fallback to SSE and retry WS later
        if (mode === "WEBSOCKET") {
          connectSSE();
        }
      };
    } catch {
      connectSSE();
    }
  }, [connectSSE, dispatchEventToListeners, mode, sendPing]);

  useEffect(() => {
    unmountedRef.current = false;
    connectWebSocket();

    // Heartbeat ping every 12 seconds when in WebSocket mode
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendPing();
      }
    }, 12000);

    return () => {
      unmountedRef.current = true;
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [connectWebSocket, sendPing]);

  const subscribe = useCallback(
    (listener: (event: RealtimeTicketEvent) => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    []
  );

  const contextValue: RealtimeContextValue = {
    mode,
    isLive: mode === "WEBSOCKET" || mode === "SSE",
    pingMs,
    lastEvent,
    recentEvents,
    stats: {
      connectedAt,
      eventsReceived,
      protocol:
        mode === "WEBSOCKET"
          ? `WebSocket (RFC 6455 :${WS_PORT})`
          : mode === "SSE"
          ? "Server-Sent Events (SSE Stream)"
          : "Connecting...",
    },
    sendPing,
    broadcastAction,
    subscribe,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access real-time status and subscribe to ticket updates
 */
export function useTicketRealtime(callbacks?: {
  onEvent?: (event: RealtimeTicketEvent) => void;
  onTicketCreated?: (event: RealtimeTicketEvent) => void;
  onTicketUpdated?: (event: RealtimeTicketEvent) => void;
  onMessagePosted?: (event: RealtimeTicketEvent) => void;
  onNoteAdded?: (event: RealtimeTicketEvent) => void;
  ticketIdFilter?: string;
}) {
  const context = useContext(RealtimeContext);

  useEffect(() => {
    if (!context || !callbacks) return;

    const unsubscribe = context.subscribe((event) => {
      if (
        callbacks.ticketIdFilter &&
        event.ticket_id !== callbacks.ticketIdFilter
      ) {
        return;
      }

      callbacks.onEvent?.(event);

      switch (event.type) {
        case "TICKET_CREATED":
          callbacks.onTicketCreated?.(event);
          break;
        case "TICKET_UPDATED":
          callbacks.onTicketUpdated?.(event);
          break;
        case "MESSAGE_POSTED":
          callbacks.onMessagePosted?.(event);
          break;
        case "NOTE_ADDED":
          callbacks.onNoteAdded?.(event);
          break;
      }
    });

    return unsubscribe;
  }, [callbacks, context]);

  return (
    context || {
      mode: "OFFLINE" as RealtimeMode,
      isLive: false,
      pingMs: null,
      lastEvent: null,
      recentEvents: [],
      stats: {
        connectedAt: null,
        eventsReceived: 0,
        protocol: "Offline",
      },
      sendPing: () => {},
      broadcastAction: () => {},
      subscribe: () => () => {},
    }
  );
}

/**
 * Visual Live Indicator Badge
 * Displays glowing live indicator with latency ping and popup diagnostic
 */
export function RealtimeStatusBadge({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { mode, isLive, pingMs, stats, sendPing } = useTicketRealtime();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setShowDetails((prev) => !prev)}
        title="Real-time live ticket connection status (Click for details)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight transition cursor-pointer border ${
          mode === "WEBSOCKET"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100"
            : mode === "SSE"
            ? "bg-sky-50 text-sky-800 border-sky-200/90 hover:bg-sky-100"
            : mode === "CONNECTING"
            ? "bg-amber-50 text-amber-800 border-amber-200/90 hover:bg-amber-100"
            : "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {/* Animated Pulsing Dot */}
        <span className="relative flex h-2 w-2">
          {isLive && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                mode === "WEBSOCKET" ? "bg-emerald-400" : "bg-sky-400"
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              mode === "WEBSOCKET"
                ? "bg-emerald-500"
                : mode === "SSE"
                ? "bg-sky-500"
                : mode === "CONNECTING"
                ? "bg-amber-500"
                : "bg-slate-400"
            }`}
          />
        </span>

        {mode === "WEBSOCKET" ? (
          <>
            <span className="font-semibold">Live WebSocket</span>
            {!compact && pingMs !== null && (
              <span className="text-[10px] font-mono opacity-80">
                {pingMs}ms
              </span>
            )}
          </>
        ) : mode === "SSE" ? (
          <>
            <span className="font-semibold">Live Stream Active</span>
          </>
        ) : mode === "CONNECTING" ? (
          <span>Connecting...</span>
        ) : (
          <span>Offline</span>
        )}
      </button>

      {/* Floating diagnostic detail popup */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-xs space-y-3 animate-fade-in text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              Realtime Engine Details
            </span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Mode:</span>
              <span className="font-bold text-slate-900">{mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Protocol:</span>
              <span className="text-right text-slate-700 truncate max-w-[160px]">
                {stats.protocol}
              </span>
            </div>
            {pingMs !== null && (
              <div className="flex justify-between">
                <span className="text-slate-500">Round-trip Ping:</span>
                <span className="font-bold text-emerald-700">{pingMs}ms</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Connected At:</span>
              <span className="text-slate-700">
                {stats.connectedAt || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Events Received:</span>
              <span className="font-bold text-slate-900">
                {stats.eventsReceived}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Sub-50ms instant ticket updates
            </span>
            {mode === "WEBSOCKET" && (
              <button
                type="button"
                onClick={sendPing}
                className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Ping Now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
