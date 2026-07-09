import api from "../lib/api";
import type { RaceListItem } from "../types/race";

export const ScheduleService = {
  async getRacesByMonth(year: number, month: number): Promise<RaceListItem[]> {
    const response = await api.get("/schedules/races", {
      params: { year, month },
    });
    return response.data?.data ?? response.data ?? [];
  },
};
