import api from "../lib/api";

export interface Horse {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  birthDate: string;
  weightKg: string;
  imageUrl: string;
  healthStatus: string;
  isRetired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HorseListResponse {
  data: Horse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RetireHorseResponse {
  message: string;
  horse: Horse;
}

export const HorseService = {
  async getHorses(
    search?: string,
    breed?: string,
    isRetired?: boolean,
    page: number = 1,
    limit: number = 10
  ) {
    const response = await api.get("/horses", {
      params: { search, breed, isRetired, page, limit },
    });
    return response.data;
  },

  async getHorseById(id: string) {
    const response = await api.get(`/horses/${id}`);
    return response.data.horse;
  },

  async getHorsesByOwnerId(
    ownerId: string,
    params?: {
      search?: string;
      breed?: string;
      isRetired?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<HorseListResponse> {
    const response = await api.get(`/horses/owner/${ownerId}`, { params });
    return response.data;
  },

  // NEW: Retire a horse
  async retireHorse(id: string): Promise<RetireHorseResponse> {
    const response = await api.post(`/horses/${id}/retire`);
    return response.data;
  },
};
