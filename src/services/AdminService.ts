import api from "../lib/api";
import type { Tournament, TournamentResponse } from "../types/tournament";
import type { UserResponse } from "../types/user";
import type { Race, RaceReportListResponse } from "../types/race";

export const AdminService = {
  // ── Users ──
  getTracks: async () => {
    const response = await api.get(`/courses`);
    return response.data;
  },
  getTrackDistances: async (id: string) => {
    const response = await api.get(`/courses/${id}/distances`);
    return response.data;
  },
  createTrackDistance: async (trackId: string, distanceMeters: number) => {
    const response = await api.post(`/courses/${trackId}/distances`, {
      distanceMeters: Number(distanceMeters),
    });
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

  async createRace(tournamentId: string, data: Partial<Race>): Promise<Race> {
    const response = await api.post(
      `/admin/tournaments/${tournamentId}/races`,
      data
    );
    return response.data;
  },

  async updateRace(raceId: string, data: Partial<Race>): Promise<Race> {
    const response = await api.patch(`/admin/races/${raceId}`, data);
    return response.data;
  },

  async updateRaceStatus(raceId: string, status: string): Promise<Race> {
    const response = await api.patch(`/admin/races/${raceId}/status`, {
      status,
    });
    return response.data;
  },

  async getReports(params?: {
    resultStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<RaceReportListResponse> {
    const response = await api.get("/admin/reports", {
      params,
    });
    return response.data;
  },

  async getRaceReport(raceId: string): Promise<any> {
    const response = await api.get(`/admin/races/${raceId}/report`);
    return response.data;
  },

  // ── Registrations ──

  async getRegistrations(params?: {
    search?: string;
    status?: string;
    raceId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/admin/registrations", {
      params,
    });
    return response.data;
  },

  async updateRegistration(regId: string, data: any) {
    const response = await api.patch(`/admin/registrations/${regId}`, data);
    return response.data;
  },

  // ── Referee Assignments ──

  async getRaceReferee(raceId: string) {
    const response = await api.get(`/admin/races/${raceId}/referee`);
    return response.data;
  },

  async assignRaceReferee(raceId: string, refereeId: string) {
    const response = await api.put(`/admin/races/${raceId}/referee`, {
      refereeId,
    });
    return response.data;
  },

  async unassignRaceReferee(raceId: string, refereeId: string) {
    const response = await api.delete(
      `/admin/races/${raceId}/referee/${refereeId}`
    );
    return response.data;
  },

  // ── Violation Type Configs ──

  async getViolationTypes(params?: {
    page?: number;
    limit?: number;
  }): Promise<any> {
    const response = await api.get("/admin/violation-types", { params });
    return response.data;
  },

  async createViolationType(data: {
    violationType: string;
    pointsDeducted: number;
    description?: string | null;
  }): Promise<any> {
    const response = await api.post("/admin/violation-types", data);
    return response.data;
  },

  async updateViolationType(
    id: string,
    data: {
      violationType?: string;
      pointsDeducted?: number;
      description?: string | null;
    }
  ): Promise<any> {
    const response = await api.patch(`/admin/violation-types/${id}`, data);
    return response.data;
  },

  async deleteViolationType(id: string): Promise<void> {
    const response = await api.delete(`/admin/violation-types/${id}`);
    return response.data;
  },
};
