import { SafeUser, TicketRecord, TicketMessageRecord } from "@/types/domain";

export type RealtimeTicketEventType =
  | "TICKET_CREATED"
  | "TICKET_UPDATED"
  | "MESSAGE_POSTED"
  | "NOTE_ADDED"
  | "TICKET_ASSIGNED"
  | "HEARTBEAT";

export interface RealtimeTicketEvent {
  id: string;
  type: RealtimeTicketEventType;
  ticket_id: string;
  author_id?: string;
  sender_name?: string;
  sender_role?: "AUTHOR" | "ADMIN" | "SYSTEM";
  title?: string;
  message?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string | null;
  payload?: unknown;
  timestamp: string;
}

type RealtimeListener = (event: RealtimeTicketEvent) => void;

interface RealtimeHubState {
  listeners: Set<RealtimeListener>;
  recentEvents: RealtimeTicketEvent[];
  startedAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __bookleafRealtimeHub: RealtimeHubState | undefined;
}

function getHubState(): RealtimeHubState {
  if (!globalThis.__bookleafRealtimeHub) {
    globalThis.__bookleafRealtimeHub = {
      listeners: new Set<RealtimeListener>(),
      recentEvents: [],
      startedAt: new Date().toISOString(),
    };
  }
  return globalThis.__bookleafRealtimeHub;
}

/**
 * Broadcast an event to all connected SSE clients and WebSocket clients.
 */
export function broadcastRealtimeTicketEvent(
  eventInput: Omit<RealtimeTicketEvent, "id" | "timestamp">
): RealtimeTicketEvent {
  const hub = getHubState();
  const event: RealtimeTicketEvent = {
    ...eventInput,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  // Keep a ring buffer of last 50 events
  hub.recentEvents.unshift(event);
  if (hub.recentEvents.length > 50) {
    hub.recentEvents.pop();
  }

  // Notify all connected SSE and WebSocket subscribers
  hub.listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (err) {
      console.error("[RealtimeHub] Listener error:", err);
    }
  });

  return event;
}

/**
 * Subscribe to the real-time event stream. Returns an unsubscribe function.
 */
export function subscribeRealtimeTicketEvents(listener: RealtimeListener): () => void {
  const hub = getHubState();
  hub.listeners.add(listener);

  return () => {
    hub.listeners.delete(listener);
  };
}

/**
 * Get active connection counts and health stats.
 */
export function getRealtimeStats() {
  const hub = getHubState();
  return {
    activeSubscribers: hub.listeners.size,
    recentEventsCount: hub.recentEvents.length,
    startedAt: hub.startedAt,
  };
}
