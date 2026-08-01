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

  // Full, unpaginated entry list — for consumers that need to check
  // existence/status across ALL of an owner's entries (Tournament Register,
  // Horse Schedule, Jockey Roster's "needs a jockey" list), as opposed to
  // the 8-per-page `entries` above, which is only correct for the "My
  // Entries" table itself.
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [allEntriesLoading, setAllEntriesLoading] = useState(false);

  // Full, unpaginated horse list — for dashboard stats that need a true
  // account-wide count (e.g. "Active Stable"), as opposed to the 10-per-page
  // `horses` below, which backs the Horse Manager table/pager.
  const [allHorses, setAllHorses] = useState<Horse[]>([]);

  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

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
    const ownerId = localStorage.getItem("userId");

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
      const all: Jockey[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await JockeyService.getJockeys({
          page,
          limit: 100,
        });
        all.push(...(response.data ?? []));
        totalPages = response.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);
      setJockeys(all);
      setJockeysPagination({
        page: 1,
        limit: all.length,
        total: all.length,
        totalPages: 1,
      });
    } catch (error) {
      console.error("Failed to load jockeys:", error);
    }
  }, []);

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

  // No backend endpoint returns "all my pending invitations across every
  // race" for an owner (getRaceInvitations requires a raceId; getMyInvitations
  // is jockey-scoped). Reconstruct the count client-side by looping the
  // existing per-race endpoint over the owner's distinct races — bounded by
  // how many races an owner actually has, which is small.
  const loadPendingInvitesSummary = useCallback(async (source: Entry[]) => {
    try {
      const raceIds = [...new Set(source.map((e) => e.raceId))];
      if (raceIds.length === 0) {
        setPendingInvitesCount(0);
        return;
      }
      const results = await Promise.all(
        raceIds.map((raceId) =>
          UserService.getRaceInvitations(raceId, "pending", 1, 1)
        )
      );
      const total = results.reduce(
        (sum, r) => sum + (r?.pagination?.total ?? 0),
        0
      );
      setPendingInvitesCount(total);
    } catch (error) {
      console.error("Failed to load pending invites summary:", error);
    }
  }, []);

  const loadEntries = useCallback(
    async (status?: string) => {
      setEntriesLoading(true);
      try {
        // Backend no longer defaults /me/entries to status="scheduled"
        // (fixed in horse-racing-api commit 32873c5) — omitting status now
        // correctly returns entries across all race statuses.
        const response = await UserService.getMyEntries(
          status,
          entriesPage,
          entriesPagination.limit
        );
        setEntries(response.data ?? []);
        setEntriesPagination(response.pagination);
      } catch (error) {
        console.error("Failed to load entries:", error);
      } finally {
        setEntriesLoading(false);
      }
    },
    [entriesPage, entriesPagination.limit]
  );

  const loadAllEntries = useCallback(async () => {
    setAllEntriesLoading(true);
    try {
      const all: Entry[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await UserService.getMyEntries(undefined, page, 100);
        all.push(...(response.data ?? []));
        totalPages = response.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);
      setAllEntries(all);
      return all;
    } catch (error) {
      console.error("Failed to load all entries:", error);
      return [];
    } finally {
      setAllEntriesLoading(false);
    }
  }, []);

  const loadAllHorses = useCallback(async () => {
    const ownerId = localStorage.getItem("userId");
    if (!ownerId) return [];
    try {
      const all: Horse[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await HorseService.getHorsesByOwnerId(ownerId, {
          page,
          limit: 100,
        });
        all.push(...(response.data ?? []));
        totalPages = response.pagination?.totalPages ?? 1;
        page++;
      } while (page <= totalPages);
      setAllHorses(all);
      return all;
    } catch (error) {
      console.error("Failed to load all horses:", error);
      return [];
    }
  }, []);

  const addHorse = async (payload: {
    name: string;
    breed: string;
    birthDate: string;
    weightKg: string;
    healthStatus: string;
    baseSpeed?: number;
    stamina?: number;
    image?: File;
  }) => {
    await HorseService.createHorse(payload);

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
      healthStatus: string;
      baseSpeed?: number;
      stamina?: number;
      image?: File;
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

    await Promise.all([
      loadInvitations(entryId),
      loadPendingInvitesSummary(allEntries),
    ]);

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

    await Promise.all([
      loadInvitations(raceId),
      loadEntries(),
      loadPendingInvitesSummary(allEntries),
    ]);
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

    await loadPendingInvitesSummary(allEntries);

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

      // Full entry list (allEntries), not the paginated `entries` — the
      // previous single-page fetch here silently dropped an owner's races
      // past the first page of entries. Reads the already-loaded allEntries
      // state instead of re-fetching it — loadAllEntries() already ran once
      // at mount, and calling it again here duplicated that entire paginated
      // sweep every time `registrations` changed.
      const ownerEntries = allEntries.filter((e: Entry) =>
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
          distanceMeters: race?.distanceMeters ?? 0,
          scheduledAt: race?.scheduledAt ?? "",
          venue: race?.venue ?? "",
          status: statusMap[race?.status ?? ""] ?? "scheduled",
          ride: entry.horseName,
          laneNumber: entry.laneNumber ?? 0,
          laneCount: race?.laneCount ?? 0,
          entryStatus: entry.status as Ride["entryStatus"],
          confirmedAt: entry.confirmedAt ?? null,
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
  }, [registrations, allEntries]);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        // Note: `loadEntries()` (the paginated "My Entries" fetch) is
        // intentionally NOT called here — the [entriesPage] effect below
        // already fires once on mount (entriesPage starts at 1), so adding
        // it here would just double-fetch the same first page.
        const allEntriesPromise = loadAllEntries();
        const [allEntriesResult] = await Promise.all([
          allEntriesPromise,
          loadHorses(),
          loadRegistrations(),
          loadJockeys(),
          loadTournamentsList(),
          loadAllHorses(),
        ]);

        await loadPendingInvitesSummary(allEntriesResult);
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

    allEntries,
    allEntriesLoading,
    loadAllEntries,

    allHorses,
    loadAllHorses,

    pendingInvitesCount,

    addHorse,
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
