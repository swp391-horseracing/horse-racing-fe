import { useState, useEffect } from "react";

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface Horse {
  id: number;
  name: string;
  breed: string;
  dob: string;
  gender: "Stallion" | "Mare" | "Gelding";
  microchipId: string;
  associationCode: string;
  status: "Active" | "Retired";
}

export interface Tournament {
  id: number;
  name: string;
  allowedBreed: string;
  minAge: number;
  maxAge: number;
  currentCount: number;
  maxCapacity: number;
  status: "Registration Open" | "Registration Closed" | "Scheduled" | "Live" | "Concluded";
  startDate?: string;
}

export interface TournamentRegistration {
  id: number;
  horseId: number;
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
  jockeyId: number;
  horseId: number;
  tournamentId: number;
  status: "Pending" | "Accepted" | "Declined" | "Superseded";
}

// ─── Initial Mock Data ───────────────────────────────────────────────────────

const initialHorses: Horse[] = [
  {
    id: 1,
    name: "Northern Star",
    breed: "Thoroughbred",
    dob: "2020-03-12",
    gender: "Stallion",
    microchipId: "985121012345671",
    associationCode: "TB-USA-112",
    status: "Active",
  },
  {
    id: 2,
    name: "Silver Drift",
    breed: "Arabian",
    dob: "2019-05-18",
    gender: "Mare",
    microchipId: "985121012345672",
    associationCode: "AR-USA-342",
    status: "Active",
  },
  {
    id: 3,
    name: "Iron Cascade",
    breed: "Quarter Horse",
    dob: "2021-08-24",
    gender: "Gelding",
    microchipId: "985121012345673",
    associationCode: "QH-USA-990",
    status: "Active",
  },
];

const initialTournaments: Tournament[] = [
  {
    id: 1,
    name: "Royal Ascot Summer Series",
    allowedBreed: "Thoroughbred",
    minAge: 2,
    maxAge: 6,
    currentCount: 14,
    maxCapacity: 16,
    status: "Registration Open",
    startDate: "2026-06-18",
  },
  {
    id: 2,
    name: "Ho Chi Minh Classic",
    allowedBreed: "Arabian",
    minAge: 3,
    maxAge: 8,
    currentCount: 8,
    maxCapacity: 12,
    status: "Registration Open",
    startDate: "2026-06-25",
  },
  {
    id: 3,
    name: "Saigon Derby",
    allowedBreed: "Quarter Horse",
    minAge: 3,
    maxAge: 5,
    currentCount: 10,
    maxCapacity: 10,
    status: "Registration Open",
    startDate: "2026-06-30",
  },
];

const initialRegistrations: TournamentRegistration[] = [
  { id: 1, horseId: 1, tournamentId: 1, status: "Approved" },
  { id: 2, horseId: 2, tournamentId: 2, status: "Pending Approval" },
  { id: 3, horseId: 3, tournamentId: 3, status: "Waitlisted" },
];

const initialJockeys: Jockey[] = [
  { id: 1, name: "Arthur Jones", club: "Saigon Turf Club", winRate: "33.3%", totalRuns: 120 },
  { id: 2, name: "Sarah Baxter", club: "Delta Jockey Association", winRate: "28.5%", totalRuns: 95 },
  { id: 3, name: "Mark Thompson", club: "Royal Racing Club", winRate: "31.2%", totalRuns: 110 },
];

const initialInvitations: Invitation[] = [
  { id: 1, jockeyId: 1, horseId: 1, tournamentId: 1, status: "Accepted" },
  { id: 2, jockeyId: 2, horseId: 2, tournamentId: 2, status: "Pending" },
];

// ─── Custom Hook ─────────────────────────────────────────────────────────────

export function useOwnerData() {
  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>(initialRegistrations);
  const [jockeys] = useState<Jockey[]>(initialJockeys);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulating asynchronous initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const addHorse = async (newHorse: Omit<Horse, "id" | "status">) => {
    setHorses((prev) => [
      ...prev,
      {
        ...newHorse,
        id: Date.now() + Math.floor(Math.random() * 1000),
        status: "Active",
      },
    ]);
  };

  const retireHorse = async (id: number): Promise<boolean> => {
    setHorses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: "Retired" } : h))
    );
    return true;
  };

  const registerTournament = async (
    horseId: number,
    tournamentId: number,
    status: "Pending Approval" | "Waitlisted"
  ) => {
    setRegistrations((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        horseId,
        tournamentId,
        status,
      },
    ]);

    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? { ...t, currentCount: t.currentCount + 1 }
          : t
      )
    );
  };

  const inviteJockeys = async (
    jockeyIds: number[],
    tournamentId: number,
    horseId: number
  ) => {
    const newInvites: Invitation[] = jockeyIds.map((jId) => ({
      id: Date.now() + Math.floor(Math.random() * 1000) + jId,
      jockeyId: jId,
      horseId,
      tournamentId,
      status: "Pending",
    }));

    setInvitations((prev) => [...prev, ...newInvites]);
  };

  const confirmPairing = async (invId: number): Promise<boolean> => {
    const target = invitations.find((i) => i.id === invId);
    if (!target) return false;

    setInvitations((prev) =>
      prev.map((inv) => {
        if (inv.id === invId) {
          return { ...inv, status: "Accepted" };
        }
        if (
          inv.horseId === target.horseId &&
          inv.tournamentId === target.tournamentId &&
          inv.id !== invId
        ) {
          return { ...inv, status: "Superseded" };
        }
        return inv;
      })
    );
    return true;
  };

  const cancelInvite = async (invId: number): Promise<boolean> => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invId ? { ...inv, status: "Declined" } : inv))
    );
    return true;
  };

  return {
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