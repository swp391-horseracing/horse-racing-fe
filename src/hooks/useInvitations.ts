import { useState, useEffect } from "react";
import { InvitationService } from "../services/invitationService.ts";
import type { Invitation, InvStatus } from "../services/invitationService.ts";

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const getInvitationsList = async () => {
    const data = await InvitationService.getInvitations();
    setInvitations(data);
  };

  const updateInvitationStatus = async (id: number, status: InvStatus) => {
    const updated = await InvitationService.updateInvitationStatus(id, status);
    if (updated) {
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
      );
    }
  };

  useEffect(() => {
    getInvitationsList();
  }, []);

  return {
    invitations,
    getInvitationsList,
    updateInvitationStatus,
    setInvitations,
  };
}
