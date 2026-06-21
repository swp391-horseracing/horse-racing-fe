export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl: string;
  role: string;
  status: string;
  token?: string;
  weightKg?: string;
  experienceYear?: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateProfilePayload = {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  avatar?: string;
};

export type UpdateProfileResponse = {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
  };
  token?: string;
};

export type UserRace = {
  id: string;
  tournamentId: string;
  name: string;
  roundName: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: string;
};

export type UserRaceListResponse = {
  data: UserRace[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string;
  role: string;
  status: string;
  weightKg?: string;
  experienceYear?: number;
  createdAt: string;
  updatedAt: string;
};

export type UserRaceDetail = {
  id: string;
  tournamentId: string;
  name: string;
  roundName: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: string;
  entries?: Array<{
    id: string;
    horseId: string;
    horseName: string;
    jockeyName: string;
    clothNumber: number;
    trainerName?: string;
  }>;
};
