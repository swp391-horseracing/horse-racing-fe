import api from "../lib/api";
import type { HorseListResponse, RetireHorseResponse } from "../types/horse";
import type { HorseRaceHistoryEntry, RaceHistoryResponse } from "../types/race";

export const HorseService = {
  async getHorses(
    search?: string,
    breed?: string,
    isRetired?: boolean,
    page: number = 1,
    limit: number = 10,
    isRacing?: boolean
  ) {
    const response = await api.get("/horses", {
      params: { search, breed, isRetired, page, limit, isRacing },
    });
    return response.data;
  },

  createHorse: async (data: {
    name: string;
    breed: string;
    birthDate: string;
    weightKg: string;
    healthStatus: string;
    baseSpeed?: number;
    stamina?: number;
    image?: File;
  }) => {
    if (data.image) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("breed", data.breed);
      formData.append("birthDate", data.birthDate);
      formData.append("weightKg", data.weightKg);
      formData.append("healthStatus", data.healthStatus);
      formData.append("image", data.image);
      const response = await api.post("/horses", formData);
      const horseId = response.data?.horse?.id;

      if (
        horseId &&
        (data.baseSpeed !== undefined || data.stamina !== undefined)
      ) {
        const stats: Record<string, number> = {};
        if (data.baseSpeed !== undefined) stats.baseSpeed = data.baseSpeed;
        if (data.stamina !== undefined) stats.stamina = data.stamina;
        await api.patch(`/horses/${horseId}`, stats);
      }

      return response.data;
    }

    const response = await api.post("/horses", {
      name: data.name,
      breed: data.breed,
      birthDate: data.birthDate,
      weightKg: data.weightKg,
      healthStatus: data.healthStatus,
      baseSpeed: data.baseSpeed,
      stamina: data.stamina,
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

  async getHorseRaceHistory(
    id: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<RaceHistoryResponse<HorseRaceHistoryEntry>> {
    const response = await api.get(`/horses/${id}/races`, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        status: params?.status,
      },
    });
    return response.data;
  },

  editHorse: async (
    id: string,
    data: {
      name: string;
      breed: string;
      birthDate: string;
      weightKg: string;
      healthStatus: string;
      baseSpeed?: number;
      stamina?: number;
      image?: File;
    }
  ) => {
    if (data.image) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("breed", data.breed);
      formData.append("birthDate", data.birthDate);
      formData.append("weightKg", data.weightKg);
      formData.append("healthStatus", data.healthStatus);
      formData.append("image", data.image);
      const first = await api.patch(`/horses/${id}`, formData);

      if (data.baseSpeed !== undefined || data.stamina !== undefined) {
        const stats: Record<string, number> = {};
        if (data.baseSpeed !== undefined) stats.baseSpeed = data.baseSpeed;
        if (data.stamina !== undefined) stats.stamina = data.stamina;
        const second = await api.patch(`/horses/${id}`, stats);
        return second.data;
      }

      return first.data;
    }

    const response = await api.patch(`/horses/${id}`, {
      name: data.name,
      breed: data.breed,
      birthDate: data.birthDate,
      weightKg: data.weightKg,
      healthStatus: data.healthStatus,
      baseSpeed: data.baseSpeed,
      stamina: data.stamina,
    });
    return response.data;
  },

  async retireHorse(id: string): Promise<RetireHorseResponse> {
    const response = await api.post(`/horses/${id}/retire`);
    return response.data;
  },
};
