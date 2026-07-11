import { useState, useEffect, useCallback, useMemo } from "react";
import { HorseService } from "../services/HorseService";
import { UserService } from "../services/UserService";
import { JockeyService } from "../services/JockeyService";

import type { Horse } from "../types/horse";
import type {
  Tournament,
  TournamentRegistrationResponse,
} from "../types/tournament";
import type { Invitation } from "../types/invitation";
import type { Jockey } from "../types/jockey";
import type { Ride } from "../types/race";
import type { Entry } from "../types/entry";
import type { UserRaceDetail } from "../types/user";
import { TournamentService } from "../services/TournamentService";

export type { Horse } from "../types/horse";
export type {
  Tournament,
  TournamentRegistrationResponse as TournamentRegistration,
} from "../types/tournament";
export type { Invitation } from "../types/invitation";
export type { Jockey } from "../types/jockey";
export type { Entry } from "../types/entry";

export interface HorseOption {
  id: string;
  name: string;
  breed: string;
  isRetired: boolean;
  isRacing: boolean;
  healthStatus: string;
  eligible: boolean;
  reason?: string;
}

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
    limit: 8,
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
          entriesPagination.limit
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
    [entriesPage, entriesPagination]
  );

  const addHorse = async (payload: {
    name: string;
    breed: string;
    birthDate: string;
    weightKg: string;
    imageUrl: string;
    healthStatus: string;
    baseSpeed?: number;
    stamina?: number;
  }) => {
    await HorseService.createHorse(
      payload.name,
      payload.breed,
      payload.birthDate,
      payload.weightKg,
      payload.imageUrl,
      payload.healthStatus,
      payload.baseSpeed,
      payload.stamina
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
      baseSpeed?: number;
      stamina?: number;
    }
  ) => {
    await HorseService.updateHorse(
      id,
      payload.name,
      payload.breed,
      payload.birthDate,
      payload.weightKg,
      payload.imageUrl,
      payload.healthStatus,
      payload.baseSpeed,
      payload.stamina
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
      baseSpeed?: number;
      stamina?: number;
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
    try {
      await UserService.confirmInvitation(raceId, invitationId);
    } catch (error: any) {
      if (
        error?.response?.data?.message ===
        "A jockey has already been confirmed for this horse"
      ) {
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId
              ? { ...inv, status: "cancelled" as const }
              : inv
          )
        );
        await loadEntries();
      } else {
        await Promise.all([loadInvitations(raceId), loadEntries()]);
      }
      throw error;
    }

    await Promise.all([loadInvitations(raceId), loadEntries()]);
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

  const approvedTournamentIds = useMemo(
    () =>
      new Set(
        registrations
          .filter((r) => r.status === "approved")
          .map((r) => r.tournament.id)
      ),
    [registrations]
  );

  const eligibleHorsesByTournament = useMemo(() => {
    const map = new Map<string, HorseOption[]>();
    registrations
      .filter((r) => r.status === "approved")
      .forEach((r) => {
        const existing = map.get(r.tournament.id) ?? [];
        const h = r.horse;
        const reasons: string[] = [];
        if (h.isRetired) reasons.push("Retired");
        if (h.isRacing) reasons.push("Currently racing in another event");
        if (h.healthStatus && h.healthStatus !== "healthy")
          reasons.push(`Health status: ${h.healthStatus}`);

        existing.push({
          id: h.id,
          name: h.name,
          breed: h.breed,
          isRetired: h.isRetired,
          isRacing: h.isRacing ?? false,
          healthStatus: h.healthStatus,
          eligible: reasons.length === 0,
          reason: reasons.length > 0 ? reasons.join(", ") : undefined,
        });
        map.set(r.tournament.id, existing);
      });
    return map;
  }, [registrations]);

  const enterRace = async (raceId: string, horseId: string) => {
    const res = await UserService.createRaceEntry(raceId, horseId);
    await loadEntries();
    return res;
  };

  const withdrawEntry = async (raceId: string, entryId: string) => {
    await UserService.withdrawRaceEntry(raceId, entryId);
    await loadEntries();
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

      const approvedHorseIds = new Set(approved.map((reg) => reg.horse.id));

      const entriesResponse = await UserService.getMyEntries();
      const entries = entriesResponse.data ?? [];

      const ownerEntries = entries.filter((e: Entry) =>
        approvedHorseIds.has(e.horseId)
      );

      if (ownerEntries.length === 0) {
        setScheduleRides([]);
        return;
      }

      const uniqueRaceIds = [
        ...new Set(ownerEntries.map((e: Entry) => e.raceId)),
      ];

      const raceDetailResults = await Promise.allSettled(
        uniqueRaceIds.map((raceId) => UserService.getMyRaceDetail(raceId))
      );

      const raceDetailMap = new Map<string | unknown, UserRaceDetail>();
      for (let i = 0; i < uniqueRaceIds.length; i++) {
        const result = raceDetailResults[i];
        if (result.status === "fulfilled") {
          raceDetailMap.set(uniqueRaceIds[i], result.value);
        }
      }

      const statusMap: Record<string, "scheduled" | "live" | "completed"> = {
        scheduled: "scheduled",
        pre_race: "scheduled",
        ongoing: "live",
        under_review: "live",
        completed: "completed",
        cancelled: "completed",
        postponed: "scheduled",
      };

      const mappedRides: Ride[] = ownerEntries.map((entry: Entry) => {
        const race = raceDetailMap.get(entry.raceId);
        return {
          id: entry.raceId,
          tournamentId: race?.tournamentId ?? "",
          name: race?.name ?? "",
          roundName: race?.roundName ?? "",
          distanceMeters: race?.distanceMeters ?? 0,
          scheduledAt: race?.scheduledAt ?? "",
          venue: race?.venue ?? "",
          status: statusMap[race?.status ?? ""] ?? "scheduled",
          ride: entry.horseName,
          laneNumber: entry.laneNumber ?? 0,
          laneCount: race?.laneCount ?? 0,
          entryStatus: entry.status as Ride["entryStatus"],
          confirmedAt: null,
          horseOwner: "",
          horsesId: entry.horseId,
          ownerId: "",
          trackCondition: race?.trackCondition ?? "",
          track: undefined,
        };
      });

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

    approvedTournamentIds,
    eligibleHorsesByTournament,
    enterRace,
    withdrawEntry,

    inviteJockey,
    confirmPairing,
    cancelInvite,
  };
}
