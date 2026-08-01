import api from "../lib/api";
import type { RaceDetail, RaceEntry, RaceListItem } from "../types/race";

export interface RaceResultEntryDto {
  id: string;
  raceId: string;
  jockeyId: string | null;
  jockeyName: string | null;
  horseId: string;
  horseName: string;
  finishedPosition: number | null;
  finishTime: string | null;
  finishStatus: "finished" | "dnf" | "dsq" | "dns";
  points: number;
}

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

  async startRaceAdmin(raceId: string) {
    await api.post(`/admin/races/${raceId}/start`);
  },

  async getRaceResults(raceId: string): Promise<RaceResultEntryDto[] | null> {
    try {
      const response = await api.get(`/races/${raceId}/results`);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },
};
