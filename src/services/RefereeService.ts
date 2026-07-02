import api from "../lib/api.ts";
import type { RefereeReport } from "../types/referee.ts";

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
    const response = await api.get(`/referee/races/${raceId}/report`);
    return response.data;
  },

  updatePlacements: async (
    raceId: string,
    payload: UpdatePlacementsPayload
  ): Promise<any> => {
    const response = await api.put(
      `/referee/races/${raceId}/report/placements`,
      payload
    );
    return response.data;
  },

  createViolation: async (
    raceId: string,
    payload: CreateViolationPayload
  ): Promise<any> => {
    const response = await api.post(
      `/referee/races/${raceId}/report/violations`,
      payload
    );
    return response.data;
  },

  deleteViolation: async (
    raceId: string,
    violationId: string
  ): Promise<any> => {
    const response = await api.delete(
      `/referee/races/${raceId}/report/violations/${violationId}`
    );
    return response.data;
  },

  submitReport: async (
    raceId: string,
    payload: SubmitReportPayload
  ): Promise<any> => {
    const response = await api.patch(
      `/referee/races/${raceId}/report/submit`,
      payload
    );
    return response.data;
  },

  getRefereeRaceEntries: async (raceId: string): Promise<any> => {
    const response = await api.get(`/referee/races/${raceId}/entries`);
    return response.data;
  },

  inspectEntry: async (
    raceId: string,
    entryId: string,
    result: "cleared" | "disqualified" | "withdrawn"
  ): Promise<any> => {
    const response = await api.patch(
      `/referee/races/${raceId}/entries/${entryId}/inspection`,
      { result }
    );
    return response.data;
  },
};
