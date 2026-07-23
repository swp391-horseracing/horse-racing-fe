import api from "../lib/api";
import type { TournamentApiStatus } from "../types/tournament";
import type {
  JockeyRaceHistoryEntry,
  RaceHistoryResponse,
} from "../types/race";

export const JockeyService = {
  getJockeys: async (params?: {
    search?: string;
    status?: TournamentApiStatus;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await api.get("/jockeys", {
      params: {
        search: params?.search,
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });

    return response.data;
  },

  getJockeyById: async (jockeyId: string): Promise<any> => {
    // Fetch profile for user details
    const profileRes = await api.get(`/profiles/${jockeyId}`);

    // Also fetch jockeys list to retrieve weight, experience, and isRacing status
    try {
      const listRes = await api.get("/jockeys", { params: { limit: 100 } });
      const item = (listRes.data.data || []).find(
        (j: { id: string | number }) => String(j.id) === String(jockeyId)
      );
      if (item) {
        return {
          ...profileRes.data,
          fullName: profileRes.data.full_name || item.fullName,
          avatarUrl: profileRes.data.avatar_url || item.avatarUrl,
          weightKg: item.weightKg,
          experienceYear: item.experienceYear,
          isRacing: item.isRacing,
        };
      }
    } catch {
      // Return base profile if list lookup fails
    }

    return {
      ...profileRes.data,
      fullName: profileRes.data.full_name,
      avatarUrl: profileRes.data.avatar_url,
    };
  },

  getJockeyRaceHistory: async (
    jockeyId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<any> => {
    const response = await api.get(`/jockeys/${jockeyId}/races`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        status: params?.status,
      },
    });
    return response.data;
  },

  async getJockeyRaceHistory(
    jockeyId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<RaceHistoryResponse<JockeyRaceHistoryEntry>> {
    const response = await api.get(`/jockeys/${jockeyId}/races`, { params });
    return response.data;
  },
};
