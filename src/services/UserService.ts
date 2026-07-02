import api from "../lib/api";
import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
  User,
  UserProfile,
  UserRaceDetail,
  UserRaceListResponse,
} from "../types/user.ts";

export const UserService = {
  //get current user
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  },

  //get current user races
  getMyRaces: async (
    page: number = 1,
    limit: number = 10
  ): Promise<UserRaceListResponse> => {
    const response = await api.get("/me/races", {
      params: { page, limit },
    });
    return response.data;
  },

  //get current user registration horse
  getMyRegistrations: async (
    status?: "pending" | "approved" | "rejected",
    page: number = 1,
    limit: number = 10
  ) => {
    const response = await api.get("/me/registrations", {
      params: {
        status,
        page,
        limit,
      },
    });

    return response.data;
  },

  //get all invitations for current user
  getMyInvitations: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const response = await api.get("/me/invitations", {
      params: { status, page, limit },
    });
    return response.data;
  },

  getMyEntries: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const response = await api.get("/me/entries", {
      params: { status, page, limit },
    });
    return response.data;
  },

  //cancel my own invitation (jockey withdraws)
  cancelMyInvitation: async (id: string) => {
    const response = await api.delete(`/me/invitations/${id}`);
    return response.data;
  },

  //get current user invitations
  getRaceInvitations: async (
    raceId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const response = await api.get(`/me/races/${raceId}/invitations`, {
      params: {
        status,
        page,
        limit,
      },
    });

    return response.data;
  },

  inviteJockey: async (
    title: string,
    entryId: string,
    jockeyId: string,
    horseId: string,
    message?: string
  ) => {
    const response = await api.post(`/me/invitations`, {
      title,
      entryId,
      jockeyId,
      horseId,
      message,
    });

    return response.data;
  },

  cancelInvitation: async (raceId: string, id: string) => {
    const response = await api.delete(`/me/races/${raceId}/invitations/${id}`);

    return response.data;
  },

  acceptInvitation: async (id: string) => {
    const response = await api.patch(`/me/invitations/${id}/accept`);

    return response.data;
  },

  confirmInvitation: async (raceId: string, id: string) => {
    const response = await api.patch(
      `/me/races/${raceId}/invitations/${id}/confirm`
    );

    return response.data;
  },

  getMyRaceDetail: async (raceId: string): Promise<UserRaceDetail> => {
    const response = await api.get(`/me/races/${raceId}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> => {
    const response = await api.patch(`/profiles/${id}`, payload);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/me/profile");
    return response.data;
  },
};
