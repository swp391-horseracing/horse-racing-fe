import { useState, useEffect, useCallback } from "react";
import { JockeyService } from "../services/JockeyService";
import type { Jockey } from "../types/jockey";

export interface JockeyRaceHistoryItem {
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
  horse?: {
    id: string;
    name: string;
  };
}

export interface JockeyRaceStats {
  totalRaces: number;
  wins: number;
  places: number;
  avgFinishPosition: number | null;
  dnfCount: number;
  dsqCount: number;
}

export function useJockeyDetail(jockeyId?: string) {
  const [jockey, setJockey] = useState<Jockey | null>(null);
  const [history, setHistory] = useState<JockeyRaceHistoryItem[]>([]);
  const [stats, setStats] = useState<JockeyRaceStats>({
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

  const loadJockeyDetail = useCallback(async () => {
    if (!jockeyId) return;

    try {
      setLoading(true);
      setError(null);

      const [jockeyData, historyData] = await Promise.all([
        JockeyService.getJockeyById(jockeyId),
        JockeyService.getJockeyRaceHistory(jockeyId, {
          page: pagination.page,
          limit: pagination.limit,
        }),
      ]);

      setJockey(jockeyData);
      setHistory(historyData.data || []);
      if (historyData.stats) {
        setStats(historyData.stats);
      }
      if (historyData.pagination) {
        setPagination((prev) => ({ ...prev, ...historyData.pagination }));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load jockey details"
      );
    } finally {
      setLoading(false);
    }
  }, [jockeyId, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJockeyDetail();
  }, [loadJockeyDetail]);

  return {
    jockey,
    history,
    stats,
    loading,
    error,
    pagination,
    setPagination,
    loadJockeyDetail,
  };
}

export default useJockeyDetail;
