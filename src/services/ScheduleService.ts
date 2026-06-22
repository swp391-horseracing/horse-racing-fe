import api from "../lib/api.ts";
import type { RaceListItem } from "../types/race.ts";

export const ScheduleService = {
  async getRacesByMonth(year: number, month: number): Promise<RaceListItem[]> {
    const response = await api.get("/schedules/races", {
      params: { year, month },
    });
    return response.data?.data ?? response.data ?? [];
  },
};
