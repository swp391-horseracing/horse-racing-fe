import { useCallback, useEffect, useState } from "react";
import { AdminService, type Tournament } from "../services/adminService";
import type {
  TournamentApiStatus,
  TournamentDetail,
  TournamentListItem,
} from "../types/tournament";

export default function useAdminTournament() {
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentDetail | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filterStatus, setFilterStatus] = useState<TournamentApiStatus>();

  const loadTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") ?? "";

      const res = await AdminService.getAdminTournaments({
        status: filterStatus,
        page: pagination.page,
        limit: pagination.limit,
        token,
      });

      setTournaments(res.data);

      setPagination((prev) => ({
        ...prev,
        ...res.pagination,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load tournaments failed");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTournaments();
  }, [loadTournaments]);

  const createTournament = useCallback(
    async (data: Tournament) => {
      try {
        setActionLoading(true);
        setError(null);

        const res = await AdminService.createTournament(data);

        await loadTournaments();

        return res.Tournament;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Create tournament failed"
        );

        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTournaments]
  );

  const updateTournament = useCallback(
    async (id: string, data: Tournament) => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateTournament(id, data);

        await loadTournaments();

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Update tournament failed"
        );

        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTournaments]
  );

  const updateTournamentStatus = useCallback(
    async (id: string, status: string) => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateTournamentStatus(id, status);

        await loadTournaments();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update status failed");

        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTournaments]
  );

  const getTournamentDetail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token") ?? "";

      const data = await AdminService.getAdminTournament(id, token);
      console.log("detail: ", data);

      setSelectedTournament(data);

      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Load tournament detail failed"
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelectedTournament = useCallback(() => {
    setSelectedTournament(null);
  }, []);

  return {
    tournaments,
    getTournamentDetail,
    selectedTournament,
    clearSelectedTournament,

    loading,
    actionLoading,
    error,

    pagination,
    setPagination,

    filterStatus,
    setFilterStatus,

    createTournament,
    updateTournament,
    updateTournamentStatus,

    reloadTournaments: loadTournaments,
  };
}
