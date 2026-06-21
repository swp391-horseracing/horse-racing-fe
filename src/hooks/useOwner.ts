import { useState, useEffect, useCallback } from "react";
import { HorseService } from "../services/horseService";
import { UserService } from "../services/UserService";

import type { Horse } from "../types/horse";
import type { Tournament, TournamentRegistration } from "../types/tournament";
import type { Invitation } from "../types/invitation";
import type { Jockey } from "../types/jockey";
import { TournamentService } from "../services/TournamentService.ts";

export type { Horse } from "../types/horse";
export type { Tournament, TournamentRegistration } from "../types/tournament";
export type { Invitation } from "../types/invitation";
export type { Jockey } from "../types/jockey";

export function useOwner() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(
    []
  );
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);

  const loadHorses = useCallback(async () => {
    const ownerId = sessionStorage.getItem("userId");

    if (!ownerId) return;

    try {
      const response = await HorseService.getHorsesByOwnerId(ownerId, {
        page,
        limit: 10,
      });

      setHorses(response.data ?? []);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load horses:", error);
    }
  }, [page]);

  const loadRegistrations = useCallback(async () => {
    try {
      const response = await UserService.getMyRegistrations();

      setRegistrations(response.data ?? []);
    } catch (error) {
      console.error("Failed to load registrations:", error);
    }
  }, []);

  const loadInvitations = useCallback(
    async (raceId: string, status?: "pending" | "approved" | "rejected") => {
      try {
        const response = await UserService.getRaceInvitations(raceId, status);

        setInvitations(response.data ?? []);
      } catch (error) {
        console.error("Failed to load invitations:", error);
      }
    },
    []
  );

  const addHorse = async (payload: {
    name: string;
    breed: string;
    birthDate: string;
    weightKg: string;
    imageUrl: string;
    healthStatus: string;
  }) => {
    await HorseService.createHorse(
      payload.name,
      payload.breed,
      payload.birthDate,
      payload.weightKg,
      payload.imageUrl,
      payload.healthStatus
    );

    await loadHorses();
  };

  const updateHorse = async (
    id: string,
    payload: {
      name: string;
      breed: string;
      birthDate: string;
      weightKg: string;
      imageUrl: string;
      healthStatus: string;
    }
  ) => {
    await HorseService.updateHorse(
      id,
      payload.name,
      payload.breed,
      payload.birthDate,
      payload.weightKg,
      payload.imageUrl,
      payload.healthStatus
    );

    await loadHorses();
  };

  const retireHorse = async (id: string) => {
    await HorseService.retireHorse(id);

    await loadHorses();
  };

  const registerTournament = async (tournamentId: string, horseId: string) => {
    await TournamentService.registerHorseForTournament(tournamentId, horseId);

    await loadRegistrations();
  };

  const inviteJockey = async (
    raceId: string,
    jockeyId: string,
    horseId: string
  ) => {
    const response = await UserService.inviteJockey(raceId, jockeyId, horseId);

    await loadInvitations(raceId);

    return response;
  };

  const confirmPairing = async (raceId: string, invitationId: string) => {
    await UserService.confirmInvitation(raceId, invitationId);

    await loadInvitations(raceId);

    return true;
  };

  const cancelInvite = async (raceId: string, invitationId: string) => {
    await UserService.cancelInvitation(raceId, invitationId);

    setInvitations((prev) => prev.filter((item) => item.id !== invitationId));

    return true;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        await Promise.all([loadHorses(), loadRegistrations()]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [loadHorses, loadRegistrations]);

  return {
    page,
    setPage,
    pagination,

    horses,
    tournaments,
    setTournaments,
    registrations,
    jockeys,
    setJockeys,
    invitations,

    loading,

    loadHorses,
    loadRegistrations,
    loadInvitations,

    addHorse,
    updateHorse,
    retireHorse,

    registerTournament,

    inviteJockey,
    confirmPairing,
    cancelInvite,
  };
}
