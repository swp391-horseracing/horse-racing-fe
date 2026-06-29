import api from "../lib/api";
import type {
  TournamentApiStatus,
  RaceApiStatus,
  TournamentListResponse,
  TournamentRacesResponse,
  TournamentDetail,
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

  getTournamentByID: async (id: string): Promise<TournamentDetail> => {
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

  registerHorseForTournament: async (id: string, horseId: string) => {
    console.log("horseId(ecad60d3-e83b-425a-8bbf-5274570475b9)", horseId);
    horseId = "ecad60d3-e83b-425a-8bbf-5274570475b9";
    const response = await api.post(`/tournaments/${id}/registrations`, {
      horseId,
    });

    return response.data;
  },

  getTournamentRegistration: async (id: string, regId: string) => {
    const response = await api.get(`/tournaments/${id}/registrations/${regId}`);

    return response.data;
  },
};
