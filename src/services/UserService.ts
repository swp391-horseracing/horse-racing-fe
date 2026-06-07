import api from "../lib/api";
import type { User } from "../types/user.ts";

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
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar_url: string;
  avatarUrl: string;
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

export const UserService = {
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> => {
    const response = await api.patch(`/profiles/${id}`, payload);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("token");
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/me/profile");
    return response.data;
  },

  getMyRaces: async (
    page: number = 1,
    limit: number = 10
  ): Promise<UserRaceListResponse> => {
    const response = await api.get("/me/races", {
      params: { page, limit },
    });
    return response.data;
  },

  getMyRaceDetail: async (raceId: string): Promise<UserRaceDetail> => {
    const response = await api.get(`/me/races/${raceId}`);
    return response.data;
  },
};
