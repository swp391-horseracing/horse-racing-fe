import { useState, useCallback } from "react";
import type { Invitation } from "../types/invitation";
import { UserService } from "../services/UserService";

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);

  const getInvitationsList = useCallback(
    async (
      raceId: string,
      status?: string,
      page: number = 1,
      limit: number = 10
    ) => {
      try {
        setLoading(true);

        const response = await UserService.getRaceInvitations(
          raceId,
          status,
          page,
          limit
        );

        setInvitations(response.data ?? []);

        return response;
      } catch (error) {
        console.error("Error fetching invitations:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const acceptInvitation = useCallback(async (id: string) => {
    const response = await UserService.acceptInvitation(id);

    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "accepted" as const } : inv
      )
    );

    return response;
  }, []);

  const updateInvitationStatus = useCallback(
    async (id: string | number, status: "accepted" | "declined") => {
      const strId = String(id);
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === strId ? { ...inv, status } : inv))
      );
    },
    []
  );

  const loadAllInvitation = useCallback(
    async (status?: string, page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        const response = await UserService.getMyInvitations(
          status,
          page,
          limit
        );
        setInvitations(response.data ?? []);
        return response;
      } catch (error) {
        console.error("Error loading all invitations:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelInvitation = useCallback(async (id: string) => {
    await UserService.cancelMyInvitation(id);
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "cancelled" as const } : inv
      )
    );
  }, []);

  const declineInvitation = useCallback(async (id: string) => {
    await UserService.declineInvitation(id);
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "declined" as const } : inv
      )
    );
  }, []);

  return {
    invitations,
    loading,
    getInvitationsList,
    acceptInvitation,
    updateInvitationStatus,
    loadAllInvitation,
    cancelInvitation,
    declineInvitation,
    setInvitations,
  };
}
