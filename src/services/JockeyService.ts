import api from "../lib/api";
import type { TournamentApiStatus } from "../types/tournament";
import type { JockeyRaceHistoryEntry, RaceHistoryResponse } from "../types/race";

export const JockeyService = {
  getJockeys: async (params?: {
    status?: TournamentApiStatus;
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const response = await api.get("/jockeys", {
      params: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });

    console.log(response.data.data);

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
