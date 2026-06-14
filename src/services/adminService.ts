import api from "../lib/api";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Tournament {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  rules: string;
  location: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maximumParticipants: number;
  minimumParticipants: number;
  prizePool: number;
}
export interface UserListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  message: string;
  User: User;
}

export interface TournamentResponse {
  message: string;
  Tournament: Tournament;
}

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

  //Feature
  async createTournament(tournament: Tournament): Promise<TournamentResponse> {
    const response = await api.get("/admin/users", {
      params: { tournament },
    });
    return response.data;
  },

  //Update User
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
