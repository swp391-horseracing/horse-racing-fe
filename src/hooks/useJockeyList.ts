import { useState, useCallback } from "react";
import { JockeyService } from "../services/jockeyService";
import type { Jockey } from "../types/jockey";

export function useJockeyList() {
  const [jockeyList, setJockeyList] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getJockeyRankingList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await JockeyService.getJockeysByRanking();
      setJockeyList(data);
    } catch (err) {
      setError("Failed to load jockeys. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { jockeyList, loading, error, getJockeyRankingList };
}
