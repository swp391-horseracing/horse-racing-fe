import type { RaceApiStatus, RaceCourse } from "./race.ts";

export interface LoginResponse {
  email: string;
  password: string;
  captchaToken: string;
  token: string;
  user: User;
}

export type UserFilters = {
  search?: string;
  status?: string;
  role?: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type User = {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  avatar_url: string;
  role: string;
  status: string;
  token: string;
  extendedProps?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  message: string;
  User: User;
}

export type ExtendedProps = {
  email: string;
};

export type Jockey = {
  id: string;
  user_id: string;
  weight: number;
  license_number: string;
  experience: string;
};

export type UpdateProfilePayload = {
  full_name?: string;
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
    full_name: string;
    email: string;
    role: string;
    status: string;
  };
  token?: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  avatar_url: string;
  role: string;
  status: string;
  weightKg: string;
  experienceYear: number;
  createdAt: string;
  updatedAt: string;
};

export interface UserRace {
  id: string;
  tournamentId: string;
  courseDistanceId: string;

  name: string;
  raceNumber: number | null;

  scheduledAt: string;
  laneCount: number | null;

  status: RaceApiStatus;

  createdAt: string;
  updatedAt: string;

  course: RaceCourse;

  // optional nếu backend trả thêm
  roundName?: string;
  trackCondition?: string;

  horse?: string;
  horseOwner?: string;
  jockey?: string;

  laneNumber?: number;

  entryStatus?: "pending" | "accepted" | "declined";

  confirmedAt?: string | null;

  horsesId?: string;
  ownerId?: string;

  ranking?: number;
}

export type UserRaceListResponse = {
  data: UserRace[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
