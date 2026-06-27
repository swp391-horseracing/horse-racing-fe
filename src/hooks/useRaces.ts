import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RaceService } from "../services/RaceService";
import { ScheduleService } from "../services/ScheduleService";
import type { RaceDetail, RaceEntry, RaceListItem } from "../types/race";

type SocketEventHandler = (type: string, data: any) => void;

interface UseRaceSocketOptions {
  token?: string | null;
  enabled?: boolean;
  reconnectDelayMs?: number;
}

export function useRaceSocket(
  topics: string[] | null,
  onEvent: SocketEventHandler,
  options: UseRaceSocketOptions = {}
) {
  const onEventRef = useRef(onEvent);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(false);
  const reconnectCountRef = useRef(0);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const topicsKey = useMemo(() => JSON.stringify(topics ?? []), [topics]);

  useEffect(() => {
    if (options.enabled === false) return;
    if (!topics || topics.length === 0) return;

    shouldReconnectRef.current = true;

    const WS_URL =
      import.meta.env.VITE_WS_URL || "wss://horse-racing-api.patohru.qzz.io";
    const url = new URL(WS_URL);
    if (options.token) {
      url.searchParams.set("token", options.token);
    }

    const connect = () => {
      const ws = new WebSocket(url.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectCountRef.current = 0;
        try {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              topics,
            })
          );
        } catch {
          // ignore
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message?.type) {
            console.group(`WS event: ${message.type}`);
            console.groupEnd();
            onEventRef.current(message.type, message.data);
          }
        } catch {
          // ignore malformed message
        }
      };

      ws.onerror = () => {
        console.warn(`WS error (will reconnect...)`);
      };

      ws.onclose = (event) => {
        console.warn(`WS closed (code=${event.code} reason="${event.reason}")`);
        if (!shouldReconnectRef.current) return;

        reconnectCountRef.current++;
        reconnectTimerRef.current = setTimeout(
          connect,
          options.reconnectDelayMs ?? 3000
        );
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(
            JSON.stringify({
              type: "unsubscribe",
              topics,
            })
          );
        } catch {
          // ignore
        }
      }

      try {
        ws?.close();
      } catch {
        // ignore
      }

      wsRef.current = null;
    };
  }, [
    topicsKey,
    topics,
    options.enabled,
    options.token,
    options.reconnectDelayMs,
  ]);
}

export function useRaces() {
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRacesByMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await ScheduleService.getRacesByMonth(year, month);
      console.log("scheduled:",data);
      setRaces(data);
    } catch {
      setRaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const token = localStorage.getItem("token");

  useRaceSocket(
    ["race:*"],
    useCallback((type, data) => {
      switch (type) {
        case "connection:ack":
          break;
        case "race:status_changed":
          setRaces((prev) =>
            prev.map((r) => (r.id === data.raceId ? { ...r, ...data } : r))
          );
          break;
        case "race:result_published":
          setRaces((prev) =>
            prev.map((r) => (r.id === data.raceId ? { ...r, ...data } : r))
          );
          break;
        case "race:result_updated":
          setRaces((prev) =>
            prev.map((r) => (r.id === data.raceId ? { ...r, ...data } : r))
          );
          break;
      }
    }, []),
    { token }
  );

  return { races, loading, loadRacesByMonth };
}

export function useRaceDetail(raceId: string | null) {
  const [detail, setDetail] = useState<RaceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => setRefetchIndex((i) => i + 1), []);
  const clearDetail = useCallback(() => {
    setDetail(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!raceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetail(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await RaceService.getRaceById(raceId);
        let entries: RaceEntry[] | undefined;
        try {
          const horsesResponse = await RaceService.getRaceHorses(raceId);
          entries = Array.isArray(horsesResponse)
            ? horsesResponse
            : (horsesResponse?.data ?? []);
        } catch {
          entries = undefined;
        }
        if (!cancelled) setDetail({ ...data, entries } as RaceDetail);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load race");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [raceId, refetchIndex]);

  const detailToken = localStorage.getItem("token");

  useRaceSocket(
    raceId ? [`race:${raceId}`] : null,
    useCallback((type, data) => {
      switch (type) {
        case "connection:ack":
          break;
        case "race:status_changed":
          setDetail((prev) => (prev ? { ...prev, status: data.status } : prev));
          break;
        case "race:result_published":
          setDetail((prev) => (prev ? { ...prev, ...data } : prev));
          break;
        case "race:result_updated":
          setDetail((prev) => (prev ? { ...prev, ...data } : prev));
          break;
      }
    }, []),
    { token: detailToken }
  );

  return { detail, loading, error, refetch, clearDetail };
}
