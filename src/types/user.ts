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

export type UserRace = {
  id: string;
  tournamentId: string;
  name: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: string;
  laneCount: number;
  trackCondition?: string;

  ride?: string;
  horseOwner?: string;
  entryStatus?: string;
  confirmedAt?: string | null;
  laneNumber?: number;
  horsesId?: string;
  ownerId?: string;
  ranking?: number;
  roundName?: string;

  horse?: string;
  jockey?: string;
  races?: string;
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
