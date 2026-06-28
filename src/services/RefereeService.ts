import api from "../lib/api.ts";
import type { RefereeReport } from "../types/referee.ts";

<<<<<<< Updated upstream
export const RefereeService = {
  async getRefereeRaceReport(raceId: string): Promise<RefereeReport> {
=======
export interface UpdatePlacementsPayload {
  placements: {
    entryId: string;
    finishedPosition: number;
    finishTime?: string;
    finishStatus?: "finished" | "dnf" | "dsq" | "dns";
    points?: number;
  }[];
}

export interface CreateViolationPayload {
  entryId: string;
  occurredAt: string;
  violationType: string;
  description: string;
  severity:
    | "warning"
    | "disqualification"
    | "result_cancellation"
    | "point_deduction";
  note?: string;
}

export interface SubmitReportPayload {
  notes?: string;
}

export const RefereeService = {
  getRefereeRaceReport: async (raceId: string): Promise<RefereeReport> => {
>>>>>>> Stashed changes
    const response = await api.get(`/referee/races/${raceId}/report`);
    return response.data;
  },

<<<<<<< Updated upstream
  async getRefereeRacePlacements(raceId: string) {
    const response = await api.put(
      `/referee/races/${raceId}/report/placements`
=======
  updatePlacements: async (
    raceId: string,
    payload: UpdatePlacementsPayload
  ): Promise<any> => {
    const response = await api.put(
      `/referee/races/${raceId}/report/placements`,
      payload
>>>>>>> Stashed changes
    );
    return response.data;
  },

<<<<<<< Updated upstream
  async getRefereeRaceViolations(raceId: string) {
    const response = await api.post(
      `/referee/races/${raceId}/report/violations`
=======
  createViolation: async (
    raceId: string,
    payload: CreateViolationPayload
  ): Promise<any> => {
    const response = await api.post(
      `/referee/races/${raceId}/report/violations`,
      payload
>>>>>>> Stashed changes
    );
    return response.data;
  },

<<<<<<< Updated upstream
  async deleteRaceViolation(raceId: string, violationId: string) {
=======
  deleteViolation: async (
    raceId: string,
    violationId: string
  ): Promise<any> => {
>>>>>>> Stashed changes
    const response = await api.delete(
      `/referee/races/${raceId}/report/violations/${violationId}`
    );
    return response.data;
  },

<<<<<<< Updated upstream
  async submitReport(raceId: string) {
    const response = await api.patch(`/referee/races/${raceId}/report/submit`);
=======
  submitReport: async (
    raceId: string,
    payload: SubmitReportPayload
  ): Promise<any> => {
    const response = await api.patch(
      `/referee/races/${raceId}/report/submit`,
      payload
    );
>>>>>>> Stashed changes
    return response.data;
  },
};
