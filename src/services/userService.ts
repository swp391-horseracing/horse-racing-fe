import api from "../lib/api";
import type { User } from "../types/user";
import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
  UserProfile,
  UserRaceListResponse,
  UserRaceDetail,
} from "../types/user";

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
