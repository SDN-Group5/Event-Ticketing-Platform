import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutAPI } from './layoutApiService';
import type { EventLayout } from '../types/layout';

export type SearchEvent = {
  eventId: string;
  title: string;
  description: string;
  date: string; // ISO string
  location: string;
  image: string;
  minPrice: number;
};

const getLayoutMinPrice = (layout: EventLayout): number => {
  if (typeof layout.minPrice === 'number') return layout.minPrice;
  const prices = (layout.zones || [])
    .map((z) => z.price)
    .filter((p): p is number => typeof p === 'number' && !Number.isNaN(p));
  if (prices.length === 0) return 0;
  return Math.min(...prices);
};

const fallbackImageForEvent = (eventId: string) => {
  const seed = encodeURIComponent(eventId || 'event');
  return `https://picsum.photos/seed/${seed}/800/600`;
};

export const formatMoneyVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const mapLayoutsToUpcomingEvents = (layouts: EventLayout[], nowMs: number): SearchEvent[] => {
  return layouts
    .map((l) => {
      const minPrice = getLayoutMinPrice(l);
      return {
        eventId: l.eventId,
        title: l.eventName || `Event ${l.eventId}`,
        description: l.eventDescription || '',
        date: l.eventDate || l.createdAt || '',
        location: l.eventLocation || 'Unknown',
        image: l.eventImage || fallbackImageForEvent(l.eventId),
        minPrice,
      } satisfies SearchEvent;
    })
    .filter((e) => {
      // Không render sự kiện trong quá khứ.
      // Nếu không có date hợp lệ thì vẫn giữ lại (coi như upcoming/unknown).
      if (!e.date) return true;
      const t = +new Date(e.date);
      if (Number.isNaN(t)) return true;
      return t >= nowMs;
    })
    .map((e) => ({
      ...e,
      date: e.date || new Date(nowMs).toISOString(),
    }));
};

type Cache = {
  layouts: EventLayout[] | null;
  lastFetchedAt: number;
  inflight: Promise<EventLayout[]> | null;
};

const cache: Cache = {
  layouts: null,
  lastFetchedAt: 0,
  inflight: null,
};

const DEFAULT_TTL_MS = 60_000;

async function fetchLayoutsWithCache(ttlMs: number): Promise<EventLayout[]> {
  const now = Date.now();
  if (cache.layouts && now - cache.lastFetchedAt < ttlMs) return cache.layouts;
  if (cache.inflight) return cache.inflight;

  cache.inflight = (async () => {
    const data = await LayoutAPI.getAllLayouts();
    const layouts = Array.isArray(data) ? data : [];
    cache.layouts = layouts;
    cache.lastFetchedAt = Date.now();
    return layouts;
  })();

  try {
    return await cache.inflight;
  } finally {
    cache.inflight = null;
  }
}

export function useLayoutSearchEvents(): {
  events: SearchEvent[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
} {
  const [layouts, setLayouts] = useState<EventLayout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Force re-fetch by bypassing TTL
      const data = await fetchLayoutsWithCache(0);
      setLayouts(data);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        'Không tải được dữ liệu layout.';
      setError(String(message));
      setLayouts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchLayoutsWithCache(DEFAULT_TTL_MS);
        if (!alive) return;
        setLayouts(data);
      } catch (e: any) {
        if (!alive) return;
        const message =
          e?.response?.data?.message ||
          e?.response?.data?.error?.message ||
          e?.message ||
          'Không tải được dữ liệu layout.';
        setError(String(message));
        setLayouts([]);
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const events = useMemo(() => mapLayoutsToUpcomingEvents(layouts, Date.now()), [layouts]);

  return { events, isLoading, error, reload };
}

