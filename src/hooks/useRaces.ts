import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RaceService } from "../services/RaceService";
import { ScheduleService } from "../services/ScheduleService";
import type { RaceTick } from "../types/live";
import type { FeFinalPlacement } from "../types/live";
import type { RaceDetail, RaceEntry, RaceListItem } from "../types/race";
import { extractApiErrorMessage } from "../utils/errorMessages";

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
  const subscribedRef = useRef(false);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const topicsKey = useMemo(() => JSON.stringify(topics ?? []), [topics]);

  useEffect(() => {
    if (options.enabled === false) return;
    if (!topics || topics.length === 0) return;

    shouldReconnectRef.current = true;
    subscribedRef.current = false;

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
        console.log(`[WS] Connected to ${url.hostname}`);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (!message?.type) return;

          // Subscribe only after receiving connection:ack
          if (message.type === "connection:ack") {
            console.log(
              `[WS] Authenticated as ${message.data?.role ?? "unknown"}`
            );
            subscribedRef.current = false;
          }

          if (!subscribedRef.current && topics.length > 0) {
            console.log(`[WS] Subscribing to [${topics.join(", ")}]`);
            subscribedRef.current = true;
            ws.send(
              JSON.stringify({
                type: "subscribe",
                topics,
              })
            );
          }

          onEventRef.current(message.type, message.data);
        } catch {
          // ignore malformed message
        }
      };

      ws.onerror = () => {
        console.warn(`[WS] Error (will reconnect...)`);
      };

      ws.onclose = (event) => {
        console.warn(
          `[WS] Closed (code=${event.code} reason="${event.reason}")`
        );
        subscribedRef.current = false;
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
      subscribedRef.current = false;
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
  const [rangeRaces, setRangeRaces] = useState<RaceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [upcomingRaces, setUpcomingRaces] = useState<RaceListItem[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  const loadRacesByMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const data = await ScheduleService.getRacesByMonth(year, month);
      console.log("scheduled:", data);
      setRaces(Array.isArray(data) ? data : []);
    } catch {
      setRaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRacesForRange = useCallback(async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const months: { year: number; month: number }[] = [];
      const current = new Date(from.getFullYear(), from.getMonth(), 1);
      const end = new Date(to.getFullYear(), to.getMonth(), 1);
      while (current <= end) {
        months.push({
          year: current.getFullYear(),
          month: current.getMonth() + 1,
        });
        current.setMonth(current.getMonth() + 1);
      }
      const results = await Promise.all(
        months.map((m) => ScheduleService.getRacesByMonth(m.year, m.month))
      );
      const merged: RaceListItem[] = results.flat().filter(Boolean);
      const seen = new Set<string>();
      const deduped: RaceListItem[] = [];
      for (const r of merged) {
        if (!seen.has(r.id)) {
          seen.add(r.id);
          deduped.push(r);
        }
      }
      setRangeRaces(deduped);
    } catch {
      setRangeRaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUpcomingRaces = useCallback(async (limit = 10) => {
    setUpcomingLoading(true);
    try {
      const data = await RaceService.getRaces({
        status: "scheduled,pre_race",
        limit,
        sort: "scheduleAt",
        order: "asc",
      });
      setUpcomingRaces(Array.isArray(data) ? data : []);
    } catch {
      setUpcomingRaces([]);
    } finally {
      setUpcomingLoading(false);
    }
  }, []);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const raceTopics = useMemo(() => ["race:*"], []);

  useRaceSocket(
    raceTopics,
    useCallback((type, data) => {
      const updater = (prev: RaceListItem[]) =>
        prev.map((r) => (r.id === data.raceId ? { ...r, ...data } : r));
      switch (type) {
        case "connection:ack":
          break;
        case "race:tick":
          console.log(
            `[useRaces] tick race=${data.raceId?.slice(0, 8)} idx=${data.tick?.tickIndex} horses=${data.tick?.horses?.length}`
          );
          break;
        case "race:status_changed":
          setRaces(updater);
          setRangeRaces(updater);
          setUpcomingRaces(updater);
          break;
        case "race:result_published":
          setRaces(updater);
          setRangeRaces(updater);
          setUpcomingRaces(updater);
          break;
        case "race:result_updated":
          setRaces(updater);
          setRangeRaces(updater);
          setUpcomingRaces(updater);
          break;
      }
    }, []),
    { token }
  );

  return {
    races,
    rangeRaces,
    loading,
    upcomingRaces,
    upcomingLoading,
    loadRacesByMonth,
    loadRacesForRange,
    loadUpcomingRaces,
  };
}

export function useRaceDetail(raceId: string | null) {
  const [detail, setDetail] = useState<RaceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const [latestTick, setLatestTick] = useState<RaceTick | null>(null);
  const [finalPlacements, setFinalPlacements] = useState<
    FeFinalPlacement[] | null
  >(null);

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
        } catch (err) {
          console.error("Failed to load race horses:", err);
          entries = undefined;
        }
        if (!cancelled) setDetail({ ...data, entries } as RaceDetail);
      } catch (err) {
        if (!cancelled) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr?.response?.status === 404) {
            setError("Race not found");
          } else if (axiosErr?.response?.status === 400) {
            setError("Invalid race");
          } else {
            setError(extractApiErrorMessage(err, "Failed to load race"));
          }
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

  const detailToken = useMemo(() => localStorage.getItem("token"), []);
  const detailTopics = useMemo(
    () => (raceId ? [`race:${raceId}`] : null),
    [raceId]
  );

  useRaceSocket(
    detailTopics,
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
        case "race:tick":
          console.log("response simulate tick", data);
          setLatestTick(data.tick);
          break;
        case "race:finish":
          console.log(
            `[Race] Finished — ${data.raceId?.slice(0, 8)}...`,
            data.finalResults
          );
          setFinalPlacements(data.finalResults);
          break;
      }
    }, []),
    { token: detailToken }
  );

  return {
    detail,
    loading,
    error,
    refetch,
    clearDetail,
    latestTick,
    finalPlacements,
  };
}

export async function fetchRaceEntries(raceId: string): Promise<RaceEntry[]> {
  const data = await RaceService.getRaceEntries(raceId);
  const raw = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  return raw.map((e: any) => ({
    id: e.entryId,
    horseId: e.horse?.id ?? "",
    name: e.horse?.name ?? "",
    laneNumber: String(e.laneNumber),
    weightKg: "",
    entryStatus: e.entryStatus,
    jockeyName: e.jockey?.name ?? "",
    clothNumber: 0,
  }));
}
