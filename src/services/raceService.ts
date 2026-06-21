import api from "../lib/api";
import type { RaceListItem, RaceDetail } from "../types/race";

export const RaceService = {
  async getRacesByMonth(year: number, month: number): Promise<RaceListItem[]> {
    const response = await api.get("/schedules/races", {
      params: { year, month },
    });
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
