import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { HorseService, type Horse as ApiHorse } from "../services/horseService";

export interface Horse {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  gender: string;
  dob: string;
  status: "Active" | "Retired";
}

export interface Tournament {
  id: number;
  name: string;
  status:
    | "Registration Open"
    | "Registration Closed"
    | "Scheduled"
    | "Live"
    | "Concluded";
  allowedBreed: string;
  minAge: number;
  maxAge: number;
  currentCount: number;
  maxCapacity: number;
}

export interface TournamentRegistration {
  id: number;
  horseId: string;
  tournamentId: number;
  status: "Pending Approval" | "Approved" | "Waitlisted" | "Withdrawn";
}

export interface Jockey {
  id: number;
  name: string;
  club: string;
  winRate: string;
  totalRuns: number;
}

export interface Invitation {
  id: number;
  horseId: string;
  tournamentId: number;
  jockeyId: number;
  status: "Pending" | "Accepted" | "Declined" | "Confirmed" | "Superseded";
  horse: string;
  tournament: string;
  owner: string;
  raceTime: string;
}

const mapApiHorse = (h: ApiHorse): Horse => ({
  id: h.id,
  ownerId: h.ownerId,
  name: h.name,
  breed: h.breed,
  gender: "Unknown",
  dob: h.birthDate,
  status: h.isRetired ? "Retired" : "Active",
});

// Helper to safely extract array from API response
const extractArray = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
};

export function useOwner() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(
    []
  );
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadHorses = useCallback(async () => {
    const ownerId = sessionStorage.getItem("userId");
    if (!ownerId) return;

    try {
      setLoading(true);

      const res = await HorseService.getHorsesByOwnerId(ownerId, {
        page: page,
        limit: 10,
      });

      setHorses(extractArray(res.data).map(mapApiHorse));
      setPagination(res.pagination);
    } catch (err: unknown) {
      console.error(err || "Failed to fetch horses");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHorses();
  }, [loadHorses]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        // 1. Load Horses
        await loadHorses();

        // 2. Load Tournaments - Handle paginated response
        try {
          const tournRes = await api.get("/tournaments");
          setTournaments(extractArray(tournRes.data));
        } catch (err) {
          console.error("Failed to load tournaments:", err);
          setTournaments([]);
        }

        // 3. Load Jockeys
        try {
          const jockRes = await api.get("/jockeys");
          setJockeys(extractArray(jockRes.data));
        } catch (err) {
          console.error("Failed to load jockeys:", err);
          setJockeys([]);
        }

        // 4. Load Invitations
        try {
          const invRes = await api.get("/invitations");
          setInvitations(extractArray(invRes.data));
        } catch (err) {
          console.error("Failed to load invitations:", err);
          setInvitations([]);
        }

        // 5. Load Registrations
        try {
          const regRes = await api.get("/registrations");
          setRegistrations(extractArray(regRes.data));
        } catch (err) {
          console.error("Failed to load registrations:", err);
          setRegistrations([]);
        }
      } catch (err) {
        console.error("Failed to load owner data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [loadHorses]);

  const retireHorse = async (id: string): Promise<boolean> => {
    try {
      const res = await HorseService.retireHorse(id);

      setHorses((prev) =>
        prev.map((h) => (h.id === id ? mapApiHorse(res.horse) : h))
      );
      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Cannot retire horse",
        {
          cause: err,
        }
      );
    }
  };

  const addHorse = async (data: any) => {
    try {
      await api.post("/horses", data);
      await loadHorses();
    } catch (err) {
      console.error("Failed to add horse:", err);
      throw err;
    }
  };

  const registerTournament = async (
    horseId: string,
    tournamentId: number,
    status: any
  ) => {
    try {
      await api.post("/registrations", { horseId, tournamentId, status });
      const res = await api.get("/registrations");
      setRegistrations(extractArray(res.data));
    } catch (err) {
      console.error("Failed to register:", err);
      throw err;
    }
  };

  const inviteJockeys = async (
    jockeyIds: number[],
    tournamentId: number,
    horseId: string
  ) => {
    try {
      await api.post("/invitations", { jockeyIds, tournamentId, horseId });
      const res = await api.get("/invitations");
      setInvitations(extractArray(res.data));
    } catch (err) {
      console.error("Failed to invite:", err);
      throw err;
    }
  };

  const confirmPairing = async (invId: number) => {
    try {
      await api.patch(`/invitations/${invId}`, { status: "Confirmed" });
      const res = await api.get("/invitations");
      setInvitations(extractArray(res.data));
      return true;
    } catch {
      return false;
    }
  };

  const cancelInvite = async (invId: number) => {
    try {
      await api.delete(`/invitations/${invId}`);
      const res = await api.get("/invitations");
      setInvitations(extractArray(res.data));
      return true;
    } catch {
      return false;
    }
  };

  return {
    pagination,
    page,
    setPage,
    horses,
    tournaments,
    registrations,
    jockeys,
    invitations,
    loading,
    addHorse,
    retireHorse,
    registerTournament,
    inviteJockeys,
    confirmPairing,
    cancelInvite,
  };
}
