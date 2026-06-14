import { useCallback, useEffect, useState } from "react";
import {
  type User,
  AdminService,
  type Tournament,
} from "../services/adminService.ts";

export default function useAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    search: undefined,
    status: undefined,
    role: undefined,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AdminService.getUsers(
        pagination.search,
        pagination.status,
        pagination.role,
        pagination.page,
        pagination.limit
      );

      setUsers(res.data);
      console.log(res);
      setPagination((prev) => ({
        ...prev,
        ...res.pagination,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load users failed");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.search,
    pagination.status,
    pagination.role,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [loadUsers]);

  const openUser = useCallback(async (id: string) => {
    try {
      setDetailLoading(true);
      setError(null);

      const user = await AdminService.getUserById(id);
      setSelectedUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load user detail failed");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const updateUserRole = async (id: string, role: string) => {
    try {
      setActionLoading(true);
      setError(null);

      await AdminService.updateUserRole(id, role);
      await loadUsers();

      if (selectedUser?.id === id) {
        await openUser(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update role failed");
    } finally {
      setActionLoading(false);
    }
  };

  const updateUserStatus = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      setError(null);

      await AdminService.updateUserStatus(id, status);
      await loadUsers();

      if (selectedUser?.id === id) {
        await openUser(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update status failed");
    } finally {
      setActionLoading(false);
    }
  };

  const createTournament = useCallback(async (tournament: Tournament) => {
    try {
      setActionLoading(true);
      setError(null);

      const res = await AdminService.createTournament(tournament);

      return res.Tournament;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create tournament failed");

      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,

    page,
    setPage,

    pagination,
    setPagination,

    selectedUser,
    detailLoading,
    actionLoading,

    openUser,
    closeUser,

    updateUserRole,
    updateUserStatus,
    createTournament,

    reloadUsers: loadUsers,
  };
}
