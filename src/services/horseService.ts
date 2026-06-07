import api from "../lib/api.ts";

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

export const HorseService = {
  getHorses: async (page = 1, limit = 10): Promise<HorseListResponse> => {
    const response = await api.get("/horses", {
      params: {
        page,
        limit,
      },
    });

    return response.data;
  },

  getHorseById: async (id: string): Promise<Horse> => {
    const response = await api.get(`/horses/${id}`);
    return response.data.horse;
  },
};
