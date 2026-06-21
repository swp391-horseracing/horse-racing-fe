import api from "../lib/api";
import type {
  TournamentApiStatus,
  RaceApiStatus,
  TournamentDetail,
  TournamentListResponse,
  TournamentRacesResponse,
} from "../types/tournament";

export const TournamentService = {
  getTournaments: async (params?: {
    status?: TournamentApiStatus;
    page?: number;
    limit?: number;
  }): Promise<TournamentListResponse> => {
    const response = await api.get("/tournaments", {
      params: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });

    console.log(response.data.data);

    return response.data;
  },

  getTournament: async (id: string): Promise<TournamentDetail> => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  getTournamentRaces: async (
    id: string,
    params?: {
      status?: RaceApiStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<TournamentRacesResponse> => {
    const response = await api.get(`/tournaments/${id}/races`, {
      params: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    });

    return response.data;
  },
};
