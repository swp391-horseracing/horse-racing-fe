import { useState, useEffect, useCallback } from "react";
import { OwnerService } from "../services/ownerService.ts";
import type {
  Horse,
  Tournament,
  TournamentRegistration,
  Jockey,
  Invitation,
} from "../services/ownerService.ts";

export function useOwnerData() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(
    []
  );
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadData = useCallback(async () => {
    setLoading(true);
    try {
      const [h, t, r, j, i] = await Promise.all([
        OwnerService.getHorses(),
        OwnerService.getTournaments(),
        OwnerService.getRegistrations(),
        OwnerService.getJockeys(),
        OwnerService.getInvitations(),
      ]);
      setHorses(h);
      setTournaments(t);
      setRegistrations(r);
      setJockeys(j);
      setInvitations(i);
    } catch (err) {
      console.error("Failed to load owner data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHorse = async (horse: Omit<Horse, "id" | "status">) => {
    const newHorse = await OwnerService.createHorse(horse);
    setHorses((prev) => [...prev, newHorse]);
    return newHorse;
  };

  const retireHorse = async (id: number) => {
    const success = await OwnerService.retireHorse(id);
    if (success) {
      setHorses((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, status: "Retired" as const } : h
        )
      );
    }
    return success;
  };

  const registerTournament = async (
    horseId: number,
    tournamentId: number,
    status: "Pending Approval" | "Waitlisted"
  ) => {
    const newReg = await OwnerService.createRegistration(
      horseId,
      tournamentId,
      status
    );
    setRegistrations((prev) => [...prev, newReg]);
    return newReg;
  };

  const inviteJockeys = async (
    jockeyIds: number[],
    tournamentId: number,
    horseId: number
  ) => {
    const newInvites = await OwnerService.createInvitations(
      jockeyIds,
      tournamentId,
      horseId
    );
    setInvitations((prev) => [...prev, ...newInvites]);
    return newInvites;
  };

  const confirmPairing = async (invId: number) => {
    const success = await OwnerService.confirmPairing(invId);
    if (success) {
      const i = await OwnerService.getInvitations();
      setInvitations(i);
    }
    return success;
  };

  const cancelInvite = async (invId: number) => {
    const success = await OwnerService.cancelInvite(invId);
    if (success) {
      setInvitations((prev) =>
        prev.map((i) =>
          i.id === invId ? { ...i, status: "Cancelled" as const } : i
        )
      );
    }
    return success;
  };

  useEffect(() => {
    let active = true;

    const initData = async () => {
      try {
        const [h, t, r, j, i] = await Promise.all([
          OwnerService.getHorses(),
          OwnerService.getTournaments(),
          OwnerService.getRegistrations(),
          OwnerService.getJockeys(),
          OwnerService.getInvitations(),
        ]);
        if (active) {
          setHorses(h);
          setTournaments(t);
          setRegistrations(r);
          setJockeys(j);
          setInvitations(i);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load owner data on mount:", err);
        if (active) {
          setLoading(false);
        }
      }
    };

    initData();

    return () => {
      active = false;
    };
  }, []);

  return {
    horses,
    tournaments,
    registrations,
    jockeys,
    invitations,
    loading,
    reloadData,
    addHorse,
    retireHorse,
    registerTournament,
    inviteJockeys,
    confirmPairing,
    cancelInvite,
  };
}

export type { Horse, Tournament, TournamentRegistration, Jockey, Invitation };
