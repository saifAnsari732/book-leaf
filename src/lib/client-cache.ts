"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * High-Speed Stale-While-Revalidate (SWR) Client State Store
 * - Renders cached data in 0ms on route transitions so pages never flash blank
 * - Revalidates in the background and on configurable polling intervals
 * - Supports optimistic mutations (`mutate`) for instant UI responsiveness
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

export function setClientCache<T>(key: string, data: T): void {
  memoryStore.set(key, { data, timestamp: Date.now() });
  const subs = listeners.get(key);
  if (subs) {
    subs.forEach((fn) => fn());
  }
}

export function getClientCache<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  return entry ? (entry.data as T) : null;
}

export function invalidateClientCache(prefix: string): void {
  for (const key of Array.from(memoryStore.keys())) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}

export function useFastQuery<T>(
  key: string,
  url: string,
  options?: {
    pollIntervalMs?: number;
    enabled?: boolean;
  }
) {
  const enabled = options?.enabled !== false;
  const pollIntervalMs = options?.pollIntervalMs ?? 0;

  const [data, setData] = useState<T | null>(() => getClientCache<T>(key));
  const [isLoading, setIsLoading] = useState<boolean>(() => !memoryStore.has(key));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (background = false) => {
      if (!enabled) return;
      if (!background && !memoryStore.has(key)) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.error || `Request failed (${res.status})`);
        }
        setClientCache(key, json);
        setData(json as T);
        setError(null);
        setLastSyncedAt(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled, key, url]
  );

  useEffect(() => {
    const cached = getClientCache<T>(key);
    if (cached) {
      setData(cached);
      setIsLoading(false);
      fetchData(true);
    } else {
      fetchData(false);
    }

    const sub = () => {
      const updated = getClientCache<T>(key);
      if (updated) setData(updated);
    };
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key)!.add(sub);

    return () => {
      listeners.get(key)?.delete(sub);
      abortRef.current?.abort();
    };
  }, [key, fetchData]);

  useEffect(() => {
    if (!enabled || pollIntervalMs <= 0) return;
    const id = setInterval(() => {
      if (typeof document === "undefined" || !document.hidden) {
        fetchData(true);
      }
    }, pollIntervalMs);
    return () => clearInterval(id);
  }, [enabled, pollIntervalMs, fetchData]);

  const mutate = useCallback(
    (updater: T | null | ((prev: T | null) => T | null)) => {
      const current = getClientCache<T>(key);
      const next =
        typeof updater === "function"
          ? (updater as (prev: T | null) => T | null)(current)
          : updater;
      if (next !== null) {
        setClientCache(key, next);
      }
      setData(next);
    },
    [key]
  );

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastSyncedAt,
    refresh: () => fetchData(true),
    mutate,
  };
}
