import api from "../lib/api";
import type { HorseListResponse, RetireHorseResponse } from "../types/horse";

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

  async retireHorse(id: string): Promise<RetireHorseResponse> {
    const response = await api.post(`/horses/${id}/retire`);
    return response.data;
  },
};
