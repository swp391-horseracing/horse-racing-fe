import { useState, useEffect, useCallback } from "react";
import { JockeyService } from "../services/JockeyService";
import type { Jockey } from "../types/jockey";
import type { JockeyRaceHistoryEntry, RaceHistoryStats } from "../types/race";

export function useJockeyDetail(jockeyId?: string) {
  const [jockey, setJockey] = useState<Jockey | null>(null);
  const [history, setHistory] = useState<JockeyRaceHistoryEntry[]>([]);
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

  const loadJockeyDetail = useCallback(async () => {
    if (!jockeyId) {
      setLoading(false);
      return;
    }

    let active = true;

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

      if (!active) return;

      setJockey(jockeyData);
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
    } catch (err) {
      if (active) {
        setError(
          err instanceof Error ? err.message : "Failed to load jockey details"
        );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }

    return () => {
      active = false;
    };
  }, [jockeyId, pagination.page, pagination.limit]);

  useEffect(() => {
    if (!jockeyId) return;
    let active = true;

    const executeFetch = async () => {
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

        if (!active) return;

        setJockey(jockeyData);
        setHistory(historyData.data || []);
        if (historyData.stats) {
          setStats(historyData.stats);
        }
        setPagination((prev) => ({
          ...prev,
          page: historyData.page,
          limit: historyData.limit,
          total: historyData.total,
          totalPages: historyData.totalPages,
        }));
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load jockey details"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void executeFetch();

    return () => {
      active = false;
    };
  }, [jockeyId, pagination.page, pagination.limit]);

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
