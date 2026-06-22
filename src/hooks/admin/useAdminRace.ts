import { useCallback, useState } from "react";
import { AdminService } from "../../services/AdminService";
import { RaceService } from "../../services/RaceService";
import type { RaceDetail, RaceListItem } from "../../types/race";

export default function useAdminRace() {
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [selectedRace, setSelectedRace] = useState<RaceDetail | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRaces = useCallback(async (params?: {
    year?: number;
    month?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const data = await RaceService.getRaces(params);
      setRaces(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load races failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const getRaceDetail = useCallback(async (raceId: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await RaceService.getRaceById(raceId);
      setSelectedRace(data);

      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Load race detail failed"
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRace = useCallback(
    async (tournamentId: string, data: Record<string, unknown>) => {
      try {
        setActionLoading(true);
        setError(null);

        const res = await AdminService.createRace(tournamentId, data);

        return res;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Create race failed"
        );

        return null;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const updateRace = useCallback(
    async (raceId: string, data: Record<string, unknown>) => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateRace(raceId, data);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Update race failed"
        );

        return false;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const updateRaceStatus = useCallback(
    async (raceId: string, status: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateRaceStatus(raceId, status);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Update race status failed"
        );

        return false;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  return {
    races,
    selectedRace,
    loading,
    actionLoading,
    error,
    loadRaces,
    getRaceDetail,
    createRace,
    updateRace,
    updateRaceStatus,
    clearSelectedRace: () => setSelectedRace(null),
  };
}
