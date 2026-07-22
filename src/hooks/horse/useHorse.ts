import { useEffect, useState, useCallback } from "react";
import { HorseService } from "../../services/HorseService";
import type { Horse } from "../../types/horse";
import { extractApiErrorMessage } from "../../utils/errorMessages";
import type { RaceHistory } from "../../types/race.ts";

export default function useHorse() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [history, setHistory] = useState<RaceHistory>();

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    search: "",
    breed: "",
    isRetired: false,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadHorses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await HorseService.getHorses(
        pagination.search,
        pagination.breed,
        pagination.isRetired,
        pagination.page,
        pagination.limit
      );

      setHorses(res.data);
      setPagination((prev) => ({
        ...prev,
        ...res.pagination,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.search,
    pagination.breed,
    pagination.isRetired,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadHorses();
  }, [loadHorses]);

  const openHorse = useCallback(async (id: string) => {
    try {
      setDetailLoading(true);
      setDetailError(null);

      const horse = await HorseService.getHorseById(id);
      const history = await HorseService.getHorseRacesHistory(id);

      setSelectedHorse(horse);
      setHistory(history.data);
    } catch (err) {
      setSelectedHorse(null);
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 404) {
        setDetailError("Horse not found");
      } else if (axiosErr?.response?.status === 400) {
        setDetailError("Invalid horse");
      } else {
        setDetailError(extractApiErrorMessage(err, "Load detail failed"));
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeHorse = () => {
    setSelectedHorse(null);
  };

  return {
    horses,
    history,
    loading,
    error,
    detailError,

    page,
    setPage,

    pagination,
    setPagination,

    selectedHorse,
    detailLoading,

    openHorse,
    closeHorse,
  };
}
