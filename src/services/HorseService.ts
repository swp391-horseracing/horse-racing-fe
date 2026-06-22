import api from "../lib/api";
import type { HorseListResponse, RetireHorseResponse } from "../types/horse.ts";

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

  createHorse: async (
    name: string,
    breed: string,
    birthDate: string,
    weightKg: string,
    imageUrl: string,
    healthStatus: string
  ) => {
    const response = await api.post("/horses", {
      name,
      breed,
      birthDate,
      weightKg,
      imageUrl,
      healthStatus,
    });

    return response.data;
  },

  async getHorsesByOwnerId(
    ownerId: string,
    params?: {
      search?: string;
      breed?: string;
      isRetired?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<HorseListResponse> {
    const response = await api.get(`/horses/owner/${ownerId}`, { params });
    return response.data;
  },

  async getHorseById(id: string) {
    const response = await api.get(`/horses/${id}`);
    return response.data.horse;
  },

  updateHorse: async (
    id: string,
    name: string,
    breed: string,
    birthDate: string,
    weightKg: string,
    imageUrl: string,
    healthStatus: string
  ) => {
    const response = await api.patch(`/horses/${id}`, {
      name,
      breed,
      birthDate,
      weightKg,
      imageUrl,
      healthStatus,
    });

    return response.data;
  },

  async retireHorse(id: string): Promise<RetireHorseResponse> {
    const response = await api.post(`/horses/${id}/retire`);
    return response.data;
  },

  editHorse: async (
    id: string,
    data: {
      name: string;
      breed: string;
      birthDate: string;
      weightKg: string;
      imageUrl: string;
      healthStatus: string;
    }
  ) => {
    const response = await api.patch(`/horses/${id}`, data);
    return response.data;
  },
};
