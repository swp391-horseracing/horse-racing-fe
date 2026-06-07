import { useEffect, useState, useCallback } from "react";
import { type Horse, HorseService } from "../services/horseService.ts";

export default function useHorse() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadHorses = useCallback(async () => {
    try {
      setLoading(true);

      const res = await HorseService.getHorses(page, 10);
      console.log(res.data);

      setHorses(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHorses();
  }, [loadHorses]);

  const openHorse = async (id: string) => {
    try {
      setDetailLoading(true);

      const horse = await HorseService.getHorseById(id);
      console.log(horse);

      setSelectedHorse(horse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load detail failed");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeHorse = () => {
    setSelectedHorse(null);
  };

  return {
    horses,
    loading,
    error,

    page,
    setPage,

    pagination,

    selectedHorse,
    detailLoading,

    openHorse,
    closeHorse,
  };
}
