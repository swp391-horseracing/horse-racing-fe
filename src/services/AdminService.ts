import api from "../lib/api";
import type { Tournament, TournamentResponse } from "../types/tournament.ts";
import type { UserResponse } from "../types/user.ts";

export const AdminService = {
  // ── Users ──
  getCourses: async () => {
    const response = await api.get(`/courses`);
    return response.data;
  },
  getCourseDistances: async (id: string) =>{
    const response = await api.get(`/courses/${id}/distances`);
    return response.data;
  },
  createCourseDistance: async (courseId: string, distanceMeters: number) => {
    const response = await api.post(`/courses/${courseId}/distances`, { distanceMeters: Number(distanceMeters) });
    return response.data;
  },
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
    return response.data.user;
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

  // ── Tournaments ──

  async createTournament(tournament: Tournament): Promise<TournamentResponse> {
    const response = await api.post("/admin/tournaments", tournament);
    return response.data;
  },

  async updateTournament(
    id: string,
    tournament: Tournament
  ): Promise<TournamentResponse> {
    const response = await api.patch(`/admin/tournaments/${id}`, tournament);
    return response.data;
  },

  async updateTournamentStatus(
    id: string,
    status: string
  ): Promise<TournamentResponse> {
    const response = await api.patch(`/admin/tournaments/${id}/status`, {
      status,
    });
    return response.data;
  },

  // ── Races ──

  async createRace(tournamentId: string, data: Record<string, unknown>) {
    const response = await api.post(
      `/admin/tournaments/${tournamentId}/races`,
      data
    );
    return response.data;
  },

  async updateRace(raceId: string, data: Record<string, unknown>) {
    const response = await api.patch(`/admin/races/${raceId}`, data);
    return response.data;
  },

  async updateRaceStatus(raceId: string, status: string) {
    const response = await api.patch(`/admin/races/${raceId}/status`, {
      status,
    });
    return response.data;
  },
};
