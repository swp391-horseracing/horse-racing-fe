import api from "../lib/api";
import type { RaceDetail, RaceEntry, RaceListItem } from "../types/race";

export const RaceService = {
  async getRaces(params?: {
    status?: string;
    limit?: number;
    sort?: string;
    order?: string;
    page?: number;
    year?: number;
    month?: number;
  }): Promise<RaceListItem[]> {
    const response = await api.get("/races", { params });
    return response.data?.data ?? response.data ?? [];
  },

  async getRaceById(raceId: string): Promise<RaceDetail> {
    const response = await api.get(`/races/${raceId}`);
    return response.data;
  },

  async getRaceHorses(raceId: string) {
    const response = await api.get(`/races/${raceId}/horses/`);
    return response.data;
  },

  async getRaceEntries(raceId: string): Promise<RaceEntry[]> {
    const response = await api.get(`/races/${raceId}/entries`);
    return response.data;
  },
};
