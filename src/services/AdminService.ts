import api from "../lib/api";
import type {
  Tournament, TournamentResponse,
} from "../types/tournament.ts";
import type {UserResponse} from "../types/user.ts";

export const AdminService = {
  // List Users
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

  // Get User By ID
  async getUserById(id: string) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.horse;
  },

  //Update User Role
  async updateUserRole(id: string, role: string): Promise<UserResponse> {
    const response = await api.patch(`/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  //Update User Status
  async updateUserStatus(id: string, status: string): Promise<UserResponse> {
    const response = await api.patch(`/admin/users/${id}/status`, {
      status,
    });
    return response.data;
  },

  //Create Tournament
  async createTournament(tournament: Tournament): Promise<TournamentResponse> {
    const response = await api.post("/admin/tournaments", tournament);
    return response.data;
  },


  // Update Tournament
  async updateTournament(
    id: string,
    tournament: Tournament
  ): Promise<UserResponse> {
    const response = await api.patch(`/admin/tournaments/${id}`, tournament);
    return response.data;
  },

  // Update Tournament Status
  async updateTournamentStatus(
    id: string,
    status: string
  ): Promise<UserResponse> {
    const response = await api.patch(`/admin/tournaments/${id}/status`, {
      status,
    });
    return response.data;
  },


};
