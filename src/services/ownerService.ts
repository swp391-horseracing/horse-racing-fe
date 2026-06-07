import { HorseService } from "./horseService.ts";

export interface Horse {
  id: number;
  name: string;
  breed: string;
  dob: string;
  gender: "Stallion" | "Mare" | "Gelding";
  microchipId: string;
  associationCode: string;
  status: "Active" | "Pending Approval" | "Retired";
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
  maxCapacity: number;
  currentCount: number;
  startDate?: string; // Support visual schedule mapping (BR-SCHED-01)
}

export interface TournamentRegistration {
  id: number;
  horseId: number;
  tournamentId: number;
  status: "Pending Approval" | "Approved" | "Waitlisted" | "Withdrawn";
  registrationTime: Date;
}

export interface Jockey {
  id: number;
  name: string;
  licenseId: string;
  winRate: string;
  totalRuns: number;
  podiums: number;
  club: string;
}

export interface Invitation {
  id: number;
  horseId: number;
  jockeyId: number;
  tournamentId: number;
  status:
    | "Pending"
    | "Accepted"
    | "Declined"
    | "Expired"
    | "Cancelled"
    | "Superseded";
  sentTime: Date;
}

const mockTournaments: Tournament[] = [
  {
    id: 101,
    name: "Spring Derby Classic",
    status: "Registration Open",
    allowedBreed: "Thoroughbred",
    minAge: 3,
    maxAge: 6,
    maxCapacity: 10,
    currentCount: 2,
    startDate: "2026-06-12",
  },
  {
    id: 102,
    name: "Grand Arabian Turf Championship",
    status: "Registration Open",
    allowedBreed: "Arabian",
    minAge: 4,
    maxAge: 8,
    maxCapacity: 12,
    currentCount: 5,
    startDate: "2026-06-15",
  },
  {
    id: 103,
    name: "Summer Cup Invitational",
    status: "Registration Closed",
    allowedBreed: "Thoroughbred",
    minAge: 3,
    maxAge: 5,
    maxCapacity: 10,
    currentCount: 10,
    startDate: "2026-06-20",
  },
  {
    id: 104,
    name: "Wild West Mustang Sprint",
    status: "Registration Open",
    allowedBreed: "Mustang",
    minAge: 3,
    maxAge: 8,
    maxCapacity: 8,
    currentCount: 3,
    startDate: "2026-06-25",
  },
];

const mockRegistrations: TournamentRegistration[] = [
  {
    id: 501,
    horseId: 1, // Thunder Bolt
    tournamentId: 101, // Spring Derby Classic
    status: "Approved",
    registrationTime: new Date(Date.now() - 86400000),
  },
  {
    id: 502,
    horseId: 2, // Silver Storm
    tournamentId: 103, // Summer Cup Invitational
    status: "Approved",
    registrationTime: new Date(Date.now() - 86400000),
  },
  {
    id: 503,
    horseId: 3, // Dark Phantom
    tournamentId: 104, // Wild West Mustang Sprint
    status: "Approved",
    registrationTime: new Date(Date.now() - 86400000),
  },
];

const mockJockeys: Jockey[] = [
  {
    id: 201,
    name: "Nguyễn Văn A",
    licenseId: "JC-VN-9921",
    winRate: "34.5%",
    totalRuns: 110,
    podiums: 48,
    club: "Saigon Turf Club",
  },
  {
    id: 202,
    name: "Nguyễn Văn B",
    licenseId: "JC-VN-1104",
    winRate: "28.1%",
    totalRuns: 95,
    podiums: 39,
    club: "Hanoi Racing Org",
  },
  {
    id: 203,
    name: "Nguyễn Văn C",
    licenseId: "JC-VN-4822",
    winRate: "21.9%",
    totalRuns: 140,
    podiums: 42,
    club: "Da Nang Equine Federation",
  },
  {
    id: 204,
    name: "Nguyễn Văn D",
    licenseId: "JC-VN-5039",
    winRate: "19.5%",
    totalRuns: 72,
    podiums: 20,
    club: "Saigon Turf Club",
  },
];

const mockInvitations: Invitation[] = [
  {
    id: 1001,
    horseId: 1, // Thunder Bolt
    jockeyId: 201, // Nguyễn Văn A
    tournamentId: 101, // Spring Derby Classic
    status: "Accepted",
    sentTime: new Date(Date.now() - 3600000),
  },
  {
    id: 1002,
    horseId: 2, // Silver Storm
    jockeyId: 202, // Nguyễn Văn B
    tournamentId: 103, // Summer Cup Invitational
    status: "Pending",
    sentTime: new Date(Date.now() - 7200000),
  },
  // Dark Phantom (Horse ID 3) has no entries in mockInvitations, rendering as "No Jockey"
];

export const OwnerService = {
  getHorses: async (): Promise<Horse[]> => {
    const sharedHorses = await HorseService.getHorses();
    return sharedHorses.map((h) => {
      const mappedGender = h.gender === "Female" ? "Mare" : "Stallion";
      const birthYear = new Date().getFullYear() - (h.age || 4);
      return {
        id: Number(h.id) || Math.floor(Math.random() * 100000),
        name: h.name,
        breed: h.breed,
        dob: `${birthYear}-01-01`,
        gender: mappedGender,
        microchipId:
          (h as { microchipId?: string }).microchipId ||
          `985112003485${String(h.id).padStart(3, "0")}`,
        associationCode:
          (h as { associationCode?: string }).associationCode ||
          `ASSOC-${h.breed.substring(0, 2).toUpperCase()}-${h.id}`,
        status: h.status === "Retired" ? "Retired" : "Active",
      };
    });
  },

  createHorse: async (horse: Omit<Horse, "id" | "status">): Promise<Horse> => {
    const sharedHorse = {
      id: String(Date.now()),
      name: horse.name,
      breed: horse.breed,
      age: new Date().getFullYear() - new Date(horse.dob).getFullYear(),
      gender: horse.gender === "Mare" ? ("Female" as const) : ("Male" as const),
      speed: 80,
      stamina: 80,
      owner: "Current Owner",
      jockey: "None",
      status: "Active" as const,
      performance: 1000,
      microchipId: horse.microchipId,
      associationCode: horse.associationCode,
    };

    await HorseService.createHorse(
      sharedHorse as unknown as Parameters<typeof HorseService.createHorse>[0]
    );

    return {
      ...horse,
      id: Number(sharedHorse.id),
      status: "Active",
    };
  },

  retireHorse: async (id: number): Promise<boolean> => {
    const sharedHorses = await HorseService.getHorses();
    const target = sharedHorses.find((h) => Number(h.id) === id);
    if (!target) return false;

    target.status = "Retired";
    await HorseService.updateHorse(target.id, target);
    return true;
  },

  getTournaments: async (): Promise<Tournament[]> => [...mockTournaments],

  getRegistrations: async (): Promise<TournamentRegistration[]> => [
    ...mockRegistrations,
  ],

  createRegistration: async (
    horseId: number,
    tournamentId: number,
    status: "Pending Approval" | "Waitlisted"
  ): Promise<TournamentRegistration> => {
    const newReg: TournamentRegistration = {
      id: Date.now(),
      horseId,
      tournamentId,
      status,
      registrationTime: new Date(),
    };
    mockRegistrations.push(newReg);
    return newReg;
  },

  getJockeys: async (): Promise<Jockey[]> => [...mockJockeys],

  getInvitations: async (): Promise<Invitation[]> => [...mockInvitations],

  createInvitations: async (
    jockeyIds: number[],
    tournamentId: number,
    horseId: number
  ): Promise<Invitation[]> => {
    const newInvites: Invitation[] = jockeyIds.map((jId) => ({
      id: Math.floor(Math.random() * 100000),
      horseId,
      jockeyId: jId,
      tournamentId,
      status: "Pending",
      sentTime: new Date(),
    }));
    mockInvitations.push(...newInvites);
    return newInvites;
  },

  confirmPairing: async (invId: number): Promise<boolean> => {
    const activeInvite = mockInvitations.find((i) => i.id === invId);
    if (!activeInvite) return false;

    mockInvitations.forEach((inv) => {
      if (inv.id === invId) {
        inv.status = "Accepted";
      } else if (
        inv.horseId === activeInvite.horseId &&
        inv.tournamentId === activeInvite.tournamentId &&
        inv.status === "Pending"
      ) {
        inv.status = "Superseded";
      }
    });
    return true;
  },

  cancelInvite: async (invId: number): Promise<boolean> => {
    const inv = mockInvitations.find((i) => i.id === invId);
    if (!inv) return false;
    inv.status = "Cancelled";
    return true;
  },
};
