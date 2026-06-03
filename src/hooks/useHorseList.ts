import { useEffect, useState, useCallback } from "react";
import type { Horse } from "../types/horse.ts";
import { HorseService } from "../services/horseService.ts";

export function useHorseList() {
  const [horseList, setHorseList] = useState<Horse[]>([]);

  const getHorseRankingList = useCallback(async () => {
    try {
      const getHorse = await HorseService.getHorsesByRanking();
      setHorseList(getHorse);
    } catch (error) {
      console.error("Error fetching horse ranking list:", error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchHorses = async () => {
      try {
        const getHorse = await HorseService.getHorsesByRanking();
        if (active) {
          setHorseList(getHorse);
        }
      } catch (error) {
        console.error("Error fetching horses on mount:", error);
      }
    };

    fetchHorses();

    return () => {
      active = false;
    };
  }, []);

  return { horseList, getHorseRankingList };
}
