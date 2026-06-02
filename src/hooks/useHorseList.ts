import { useEffect, useState } from 'react';
import type { Horse } from '../types/horse.ts';
import { HorseService } from '../services/horseService.ts';

export function useHorseList() {
  const [horseList, setHorseList] = useState<Horse[]>([]);

  const getHorseRankingList = async () => {
    const getHorse = await HorseService.getHorsesByRanking();
    setHorseList(getHorse);
  };

  useEffect(() => {
    getHorseRankingList();
  });

  return { horseList, getHorseRankingList };
}
