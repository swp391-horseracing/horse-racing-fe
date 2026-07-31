export interface Horse {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  birthDate: string;
  weightKg: string;
  imageUrl: string;
  healthStatus: string;
  status: "Active" | "Retired";
  isRetired: boolean;
  baseSpeed?: number;
  stamina?: number;
  isRacing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HorseListResponse {
  data: Horse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RetireHorseResponse {
  message: string;
  horse: Horse;
}

export interface HorseLeaderboardEntry {
  rank: number;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  horse: {
    id: string;
    name: string;
    breed: string;
    imageUrl: string | null;
    healthStatus: string;
    isRetired: boolean;
  };
  owner: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export interface HorseLeaderboardResponse {
  data: HorseLeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
