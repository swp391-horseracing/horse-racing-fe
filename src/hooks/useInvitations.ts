import { useState, useEffect, useCallback } from "react";
import { InvitationService } from "../services/invitationService.ts";
import type { Invitation, InvStatus } from "../services/invitationService.ts";

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const getInvitationsList = useCallback(async () => {
    try {
      const data = await InvitationService.getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  }, []);

  const updateInvitationStatus = useCallback(async (id: number, status: InvStatus) => {
    try {
      const updated = await InvitationService.updateInvitationStatus(id, status);
      if (updated) {
        setInvitations((prev) =>
          prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
        );
      }
    } catch (error) {
      console.error("Error updating invitation status:", error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchInvitations = async () => {
      try {
        const data = await InvitationService.getInvitations();
        if (active) {
          setInvitations(data);
        }
      } catch (error) {
        console.error("Error fetching invitations on mount:", error);
      }
    };

    fetchInvitations();

    return () => {
      active = false;
    };
  }, []);

  return {
    invitations,
    getInvitationsList,
    updateInvitationStatus,
    setInvitations,
  };
}