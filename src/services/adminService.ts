import api from "../lib/api";
import type {
  TournamentApiStatus,
  TournamentDetail,
  TournamentListResponse,
} from "../types/tournament";
import type { Tournament, UserResponse, TournamentResponse } from "../types/admin";

export const AdminService = {
  async getUsers(
    search?: string,
    status?: string,
    role?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const response = await api.get("/admin/users", {
      params: { search, status, role, page, limit },
    });
    return response.data;
  },

  async getUserById(id: string) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.horse;
  },

  async createTournament(tournament: Tournament): Promise<TournamentResponse> {
    const response = await api.post("/admin/tournaments", tournament);
    return response.data;
  },

  getAdminTournaments: async (params?: {
    status?: TournamentApiStatus;
    page?: number;
    limit?: number;
    token: string;
  }): Promise<TournamentListResponse> => {
    const response = await api.get("/tournaments", {
      params: {
        status: params?.status,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        token: params?.token ?? null,
      },
    });

    console.log(response.data.data);

    return response.data;
  },

  getAdminTournament: async (
    id: string,
    token: string
  ): Promise<TournamentDetail> => {
    const response = await api.get(`/tournaments/${id}`, {
      params: {
        token: token ?? null,
      },
    });
    return response.data;
  },

  async updateTournament(
    id: string,
    tournament: Tournament
  ): Promise<UserResponse> {
    const response = await api.patch(`/admin/tournaments/${id}`, tournament);
    return response.data;
  },

  async updateTournamentStatus(
    id: string,
    status: string
  ): Promise<UserResponse> {
    const response = await api.patch(`/admin/tournaments/${id}/status`, {
      status,
    });
    return response.data;
  },

  async updateUserRole(id: string, role: string): Promise<UserResponse> {
    const response = await api.patch(`/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  async updateUserStatus(id: string, status: string): Promise<UserResponse> {
    const response = await api.patch(`/admin/users/${id}/status`, {
      status,
    });
    return response.data;
  },
};
