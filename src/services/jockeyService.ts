import type { Jockey } from "../types/jockey.ts";

const mockJockeys: Jockey[] = [
  {
    id: 201,
    name: "Nguyễn Văn A",
    licenseId: "JC-VN-9921",
    winRate: 0.345, // 34.5%
    totalRuns: 110,
    podiums: 48,
    club: "Saigon Turf Club",
  },
  {
    id: 202,
    name: "Nguyễn Văn B",
    licenseId: "JC-VN-1104",
    winRate: 0.281, // 28.1%
    totalRuns: 95,
    podiums: 39,
    club: "Hanoi Racing Org",
  },
  {
    id: 203,
    name: "Nguyễn Văn C",
    licenseId: "JC-VN-4822",
    winRate: 0.219, // 21.9%
    totalRuns: 140,
    podiums: 42,
    club: "Da Nang Equine Federation",
  },
  {
    id: 204,
    name: "Nguyễn Văn D",
    licenseId: "JC-VN-5039",
    winRate: 0.195, // 19.5%
    totalRuns: 72,
    podiums: 20,
    club: "Saigon Turf Club",
  },
];

export const JockeyService = {
  getJockeys: async (): Promise<Jockey[]> => {
    return mockJockeys;
  },

  getJockeysByRanking: async (): Promise<Jockey[]> => {
    // Sorting by win rate (descending), then podiums
    return [...mockJockeys].sort(
      (a, b) => b.winRate - a.winRate || b.podiums - a.podiums
    );
  },

  getJockeyById: async (id: number): Promise<Jockey | undefined> => {
    return mockJockeys.find((j) => j.id === id);
  },
};
