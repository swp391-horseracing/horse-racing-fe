import { useCallback, useEffect, useState } from "react";
import { AdminService } from "../../services/AdminService";
import type {
  Tournament,
  TournamentApiStatus,
  TournamentDetail,
  TournamentListResponse,
} from "../../types/tournament";
import { TournamentService } from "../../services/TournamentService";
import { extractApiErrorMessage } from "../../utils/errorMessages";

export default function useAdminTournament() {
  const [tournaments, setTournaments] = useState<TournamentListResponse>();
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

      const res = await TournamentService.getTournaments({
        status: filterStatus,
        page: pagination.page,
        limit: pagination.limit,
      });

      setTournaments(res);

      setPagination((prev) => ({
        ...prev,
        ...res.pagination,
      }));
    } catch (err) {
      setError(extractApiErrorMessage(err, "Load tournaments failed"));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTournaments();
  }, [loadTournaments]);

  const createTournament = useCallback(
    async (data: Tournament): Promise<true | string> => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.createTournament(data);

        await loadTournaments();

        return true;
      } catch (err) {
        const message = extractApiErrorMessage(err, "Create tournament failed");
        setError(message);

        return message;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTournaments]
  );

  const updateTournament = useCallback(
    async (id: string, data: Tournament): Promise<true | string> => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateTournament(id, data);

        await loadTournaments();

        return true;
      } catch (err) {
        const message = extractApiErrorMessage(err, "Update tournament failed");
        setError(message);

        return message;
      } finally {
        setActionLoading(false);
      }
    },
    [loadTournaments]
  );

  const updateTournamentStatus = useCallback(
    async (id: string, status: string): Promise<true | string> => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateTournamentStatus(id, status);

        await loadTournaments();

        return true;
      } catch (err) {
        const message = extractApiErrorMessage(err, "Update status failed");
        setError(message);

        return message;
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

      const data = await TournamentService.getTournamentByID(id);
      console.log("detail: ", data);

      setSelectedTournament(data);

      return data;
    } catch (err) {
      setError(extractApiErrorMessage(err, "Load tournament detail failed"));

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
