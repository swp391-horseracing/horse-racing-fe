import { useState, useEffect, useCallback } from "react";
import { HorseService } from "../services/HorseService";
import api from "../lib/api";
import type { Horse } from "../types/horse";
import type { HorseRaceHistoryEntry, RaceHistoryStats } from "../types/race";

export function useHorseDetail(horseId?: string) {
  const [horse, setHorse] = useState<Horse | null>(null);
  const [ownerName, setOwnerName] = useState<string>("Unknown Owner");
  const [history, setHistory] = useState<HorseRaceHistoryEntry[]>([]);
  const [stats, setStats] = useState<RaceHistoryStats>({
    totalRaces: 0,
    wins: 0,
    places: 0,
    avgFinishPosition: null,
    dnfCount: 0,
    dsqCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadHorseDetail = useCallback(async () => {
    if (!horseId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      const [horseData, historyData] = await Promise.all([
        HorseService.getHorseById(horseId),
        HorseService.getHorseRaceHistory(horseId, {
          page: pagination.page,
          limit: pagination.limit,
        }),
      ]);

      if (!isMounted) return;

      setHorse(horseData);
      setHistory(historyData.data || []);
      if (historyData.stats) {
        setStats(historyData.stats);
      }
      setPagination((prev) => ({
        ...prev,
        page: historyData.page ?? prev.page,
        limit: historyData.limit ?? prev.limit,
        total: historyData.total ?? prev.total,
        totalPages: historyData.totalPages ?? prev.totalPages,
      }));

      if (horseData?.ownerId) {
        try {
          const ownerRes = await api.get(`/profiles/${horseData.ownerId}`);
          if (isMounted) {
            setOwnerName(ownerRes.data?.full_name || "Unknown Owner");
          }
        } catch {
          if (isMounted) {
            setOwnerName("Unknown Owner");
          }
        }
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error ? err.message : "Failed to load horse details"
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [horseId, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHorseDetail();
  }, [loadHorseDetail]);

  return {
    horse,
    ownerName,
    history,
    stats,
    loading,
    error,
    pagination,
    setPagination,
    loadHorseDetail,
  };
}

export default useHorseDetail;
