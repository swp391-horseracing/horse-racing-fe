export interface Jockey {
  id: string | number;
  name: string;
  fullName: string;
  avatarUrl?: string | null;
  weightKg?: number | null;
  experienceYear?: number | null;
  isRacing?: boolean;
  licenseId?: string;
  winRate: number;
  totalRuns: number;
  podiums: number;
  club: string;
  createdAt?: string;
}

export interface JockeyLeaderboardEntry {
  rank: number;
  wins: number;
  totalRaces: number;
  totalPoints: number;
  jockey: {
    id: string | number;
    fullName: string;
    avatarUrl: string | null;
    weightKg: number | null;
    experienceYear: number | null;
  };
}

export interface JockeyLeaderboardResponse {
  data: JockeyLeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
