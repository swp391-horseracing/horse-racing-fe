import { useState, useEffect, useCallback } from "react";
import { HorseService } from "../services/HorseService";
import api from "../lib/api";
import type { Horse } from "../types/horse";

export interface HorseRaceHistoryItem {
  raceId: string;
  raceName: string;
  raceNumber: number;
  scheduledAt: string;
  venue: string;
  surfaceType: string;
  distanceMeters: number;
  raceStatus: string;
  laneNumber: number;
  entryStatus: string;
  finishedPosition: number | null;
  finishTime: string | null;
  finishStatus: string | null;
  points: number | null;
  jockey?: {
    id: string;
    fullName: string;
  };
}

export interface HorseRaceStats {
  totalRaces: number;
  wins: number;
  places: number;
  avgFinishPosition: number | null;
  dnfCount: number;
  dsqCount: number;
}

export function useHorseDetail(horseId?: string) {
  const [horse, setHorse] = useState<Horse | null>(null);
  const [ownerName, setOwnerName] = useState<string>("Unknown Owner");
  const [history, setHistory] = useState<HorseRaceHistoryItem[]>([]);
  const [stats, setStats] = useState<HorseRaceStats>({
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
    if (!horseId) return;

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
      if (historyData.pagination) {
        setPagination((prev) => ({ ...prev, ...historyData.pagination }));
      }

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
