import { useCallback, useEffect, useState } from "react";
import { AdminService } from "../../services/AdminService";
import type { TournamentRegistrationResponse } from "../../types/tournament";

export default function useAdminRegistration() {
  const [registrations, setRegistrations] = useState<
    TournamentRegistrationResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filterStatus, setFilterStatus] = useState<string>();
  const [search, setSearch] = useState<string>();

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AdminService.getRegistrations({
        search,
        status: filterStatus,
        page: pagination.page,
        limit: pagination.limit,
      });

      setRegistrations(res.data ?? []);
      setPagination((prev) => ({
        ...prev,
        ...res.pagination,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Load registrations failed"
      );
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRegistrations();
  }, [loadRegistrations]);

  const updateRegistration = useCallback(
    async (regId: string, data: { status: string }) => {
      try {
        setActionLoading(true);
        setError(null);

        await AdminService.updateRegistration(regId, data);

        await loadRegistrations();

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Update registration failed";
        setError(message);
        throw new Error(message, { cause: err });
      } finally {
        setActionLoading(false);
      }
    },
    [loadRegistrations]
  );

  return {
    registrations,
    loading,
    actionLoading,
    error,

    pagination,
    setPagination,

    filterStatus,
    setFilterStatus,
    search,
    setSearch,

    loadRegistrations,
    updateRegistration,
  };
}
