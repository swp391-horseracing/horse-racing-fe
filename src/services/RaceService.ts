import api from "../lib/api.ts";
import type {RaceDetail} from "../types/race.ts";

export const RaceService = {

  async getRaceById(raceId: string): Promise<RaceDetail> {
    const response = await api.get(`/races/${raceId}`);
    return response.data;
  },

  async getRaceHorses(raceId: string) {
    const response = await api.get(`/races/${raceId}/horses/`);
    return response.data;
  },
};
