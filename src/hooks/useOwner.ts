import { useState, useEffect, useCallback } from "react";
import { HorseService } from "../services/HorseService";
import { UserService } from "../services/UserService";
import { JockeyService } from "../services/JockeyService.ts";

import type { Horse } from "../types/horse";
import type {
  Tournament,
  TournamentRegistrationResponse,
} from "../types/tournament";
import type { Invitation } from "../types/invitation";
import type { Jockey } from "../types/jockey";
import type { Ride } from "../types/race.ts";
import type { Entry } from "../types/entry.ts";
import { TournamentService } from "../services/TournamentService.ts";

export type { Horse } from "../types/horse";
export type {
  Tournament,
  TournamentRegistrationResponse as TournamentRegistration,
} from "../types/tournament";
export type { Invitation } from "../types/invitation";
export type { Jockey } from "../types/jockey";
export type { Entry } from "../types/entry.ts";

export function useOwner() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<
    TournamentRegistrationResponse[]
  >([]);
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [scheduleRides, setScheduleRides] = useState<Ride[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesPagination, setEntriesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);

  const [jockeysPagination, setJockeysPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [jockeyPage, setJockeyPage] = useState(1);

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

  const loadJockeys = useCallback(async () => {
    try {
      const response = await JockeyService.getJockeys({
        page: jockeyPage,
        limit: 10,
      });

      setJockeys(response.data ?? []);
      setJockeysPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load jockeys:", error);
    }
  }, [jockeyPage]);

  const loadTournamentsList = useCallback(async () => {
    try {
      const all: Tournament[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await TournamentService.getTournaments({
          page,
          limit: 100,
        });
        all.push(...(response.data ?? []));
        totalPages = response.pagination.totalPages;
        page++;
      } while (page <= totalPages);
      setTournaments(all);
    } catch (error) {
      console.error("Failed to load tournaments:", error);
    }
  }, []);

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
        const data = (response.data ?? []).map((inv: Invitation) => ({
          ...inv,
          raceId: inv.raceId || raceId,
        }));
        setInvitations(data);
      } catch (error) {
        console.error("Failed to load invitations:", error);
      }
    },
    []
  );

  const loadEntries = useCallback(
    async (status?: string) => {
      setEntriesLoading(true);
      try {
        const response = await UserService.getMyEntries(
          status,
          entriesPage,
          10
        );
        console.log("ownerEntries is here:", response);
        setEntries(response.data ?? []);
        setEntriesPagination(response.pagination);
      } catch (error) {
        console.error("Failed to load entries:", error);
      } finally {
        setEntriesLoading(false);
      }
    },
    [entriesPage]
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

  const editHorse = async (
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
    await HorseService.editHorse(id, payload);

    await loadHorses();
  };

  const registerTournament = async (tournamentId: string, horseId: string) => {
    await TournamentService.registerHorseForTournament(tournamentId, horseId);

    await loadRegistrations();
  };

  const inviteJockey = async (
    title: string,
    entryId: string,
    jockeyId: string,
    horseId: string,
    message?: string
  ) => {
    const response = await UserService.inviteJockey(
      title,
      entryId,
      jockeyId,
      horseId,
      message
    );

    await loadInvitations(entryId);

    return response;
  };

  const confirmPairing = async (raceId: string, invitationId: string) => {
    await UserService.confirmInvitation(raceId, invitationId);

    await loadInvitations(raceId);

    return true;
  };

  const loadRegistration = useCallback(async (id: string, regId: string) => {
    try {
      const response = await TournamentService.getTournamentRegistration(
        id,
        regId
      );

      const registration = (
        response as { registration?: TournamentRegistrationResponse }
      ).registration;

      if (registration) {
        setRegistrations((prev) => {
          const exists = prev.findIndex((r) => r.id === registration.id);
          if (exists >= 0) {
            const next = [...prev];
            next[exists] = registration;
            return next;
          }
          return [...prev, registration];
        });
      }

      return registration;
    } catch (error) {
      console.error("Failed to load registration:", error);
    }
  }, []);

  const cancelInvite = async (raceId: string, invitationId: string) => {
    await UserService.cancelInvitation(raceId, invitationId);

    setInvitations((prev) => prev.filter((item) => item.id !== invitationId));

    return true;
  };

  const loadOwnerSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const approved = registrations.filter(
        (r: TournamentRegistrationResponse) => r.status === "approved"
      );
      if (approved.length === 0) {
        setScheduleRides([]);
        return;
      }

      const uniqueTournamentIds = [
        ...new Set(approved.map((reg) => reg.tournament.id)),
      ];
      const raceResults = await Promise.allSettled(
        uniqueTournamentIds.map((tournamentId) =>
          TournamentService.getTournamentRaces(tournamentId)
        )
      );
      const seenRaceIds = new Set<string>();
      const allRaces = raceResults
        .flatMap((r) => (r.status === "fulfilled" ? (r.value.data ?? []) : []))
        .filter((race) => {
          if (seenRaceIds.has(race.id)) return false;
          seenRaceIds.add(race.id);
          return true;
        });
      if (allRaces.length === 0) {
        setScheduleRides([]);
        return;
      }

      const detailResults = await Promise.allSettled(
        allRaces.map((race) => UserService.getMyRaceDetail(race.id))
      );

      const horseLookup = new Map(
        approved.map((reg) => [reg.horse.id, reg.horse.name])
      );

      const mappedRides: Ride[] = [];
      const statusMap: Record<string, "scheduled" | "live" | "completed"> = {
        scheduled: "scheduled",
        pre_race: "scheduled",
        ongoing: "live",
        under_review: "live",
        completed: "completed",
        cancelled: "completed",
        postponed: "scheduled",
      };

      for (let i = 0; i < allRaces.length; i++) {
        const detail = detailResults[i];
        if (detail.status !== "fulfilled") continue;

        const race = allRaces[i];
        const ownerEntry = detail.value.entries?.find((e) =>
          horseLookup.has(e.horseId)
        );
        if (!ownerEntry) continue;
        const horseName = ownerEntry.horseName ?? "";

        mappedRides.push({
          id: race.id,
          tournamentId: race.tournamentId,
          name: race.name,
          roundName: race.roundName,
          distanceMeters: race.distanceMeters,
          scheduledAt: race.scheduledAt,
          venue: race.venue,
          status: statusMap[race.status] ?? "scheduled",
          ride: horseName,
          laneNumber: 0,
          laneCount: race.laneCount,
          entryStatus: "accepted" as const,
          confirmedAt: null,
          horseOwner: "",
          horsesId: "",
          ownerId: "",
          trackCondition: race.trackCondition,
          course: undefined,
        });
      }

      setScheduleRides(mappedRides);
    } catch (error) {
      console.error("Failed to load owner schedule:", error);
      setScheduleRides([]);
    } finally {
      setScheduleLoading(false);
    }
  }, [registrations]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        await Promise.all([
          loadHorses(),
          loadRegistrations(),
          loadJockeys(),
          loadTournamentsList(),
          loadEntries(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadHorses(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => loadJockeys(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jockeyPage]);

  useEffect(() => {
    const timer = setTimeout(() => loadEntries(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entriesPage]);

  return {
    page,
    setPage,
    pagination,

    jockeyPage,
    setJockeyPage,
    jockeysPagination,

    horses,
    tournaments,
    setTournaments,
    registrations,
    jockeys,
    setJockeys,
    invitations,

    loading,

    loadHorses,
    loadJockeys,
    loadRegistrations,
    loadTournamentsList,
    loadRegistration,
    loadInvitations,
    loadEntries,
    loadOwnerSchedule,

    scheduleRides,
    scheduleLoading,

    entries,
    entriesLoading,
    entriesPage,
    setEntriesPage,
    entriesPagination,

    addHorse,
    updateHorse,
    editHorse,
    retireHorse,

    registerTournament,

    inviteJockey,
    confirmPairing,
    cancelInvite,
  };
}
