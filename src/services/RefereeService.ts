import api from "../lib/api.ts";
import type { RefereeReport } from "../types/referee.ts";

export const RefereeService = {
  async getRefereeRaceReport(raceId: string): Promise<RefereeReport> {
    const response = await api.get(`/referee/races/${raceId}/report`);
    return response.data;
  },

  async getRefereeRacePlacements(raceId: string) {
    const response = await api.put(
      `/referee/races/${raceId}/report/placements`
    );
    return response.data;
  },

  async getRefereeRaceViolations(raceId: string) {
    const response = await api.post(
      `/referee/races/${raceId}/report/violations`
    );
    return response.data;
  },

  async deleteRaceViolation(raceId: string, violationId: string) {
    const response = await api.delete(
      `/referee/races/${raceId}/report/violations/${violationId}`
    );
    return response.data;
  },

  async submitReport(raceId: string) {
    const response = await api.patch(`/referee/races/${raceId}/report/submit`);
    return response.data;
  },
};
