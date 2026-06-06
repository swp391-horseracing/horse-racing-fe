import { useState, useCallback } from "react";
import { HorseService } from "../services/horseService";
import type { Horse } from "../types/horse";

export function useHorseList() {
  const [horseList, setHorseList] = useState<Horse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHorseRankingList = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await HorseService.getHorsesByEarnings();
      setHorseList(data);
    } catch (err) {
      console.error("Error fetching horse ranking list:", err);
      setError("Failed to load horses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { horseList, loading, error, getHorseRankingList };
}
