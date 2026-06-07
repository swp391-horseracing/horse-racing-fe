import api from "../lib/api.ts";

export type RaceApiStatus =
  | "draft"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "result_confirmed";

export interface RaceListItem {
  id: string;
  tournamentId: string;
  date: string;
  name: string;
  scheduledAt: string;
  venue: string;
  status: RaceApiStatus;
}

export interface RaceEntry {
  id: string;
  horseId: string;
  name: string;
  laneNumber: string;
  weightKg: string;
  entryStatus: string;
  jockeyName: string;
  clothNumber: number;
  trainerName?: string;
}

export interface RaceDetail extends RaceListItem {
  roundName?: string;
  distanceMeters?: number;
  trackCondition?: string;
  laneCount?: number;
  entries?: RaceEntry[];
}

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
