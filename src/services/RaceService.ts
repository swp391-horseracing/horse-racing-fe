import api from "../lib/api.ts";
import type { RaceDetail, RaceListItem } from "../types/race.ts";

export const RaceService = {
  async getRaces(params?: {
    year?: number;
    month?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<RaceListItem[]> {
    const response = await api.get("/races", { params });
    return response.data;
  },

  async getRaceById(raceId: string): Promise<RaceDetail> {
    const response = await api.get(`/races/${raceId}`);
    return response.data;
  },

  async getRaceHorses(raceId: string) {
    const response = await api.get(`/races/${raceId}/horses/`);
    return response.data;
  },
};
