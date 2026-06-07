import api from "../lib/api";
import type {
  TournamentApiStatus,
  RaceApiStatus,
  TournamentDetail,
  TournamentListItem,
} from "../types/tournament";

export interface TournamentListResponse {
  data: TournamentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TournamentRacesResponse {
  data: {
    id: string;
    tournamentId: string;
    name: string;
    roundName: string;
    distanceMeters: number;
    trackCondition: string;
    scheduledAt: string;
    venue: string;
    laneCount: number;
    status: RaceApiStatus;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
