import api from "../lib/api";
import type { RefereeReport } from "../types/referee";

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
  violationTypeConfigId: string;
  severity:
    | "warning"
    | "disqualification"
    | "result_cancellation"
    | "point_deduction";
  note?: string;
}

export interface ViolationTypeConfig {
  id: string;
  violationType: string;
  pointsDeducted: number;
  description: string | null;
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

  getViolationTypes: async (): Promise<ViolationTypeConfig[]> => {
    const response = await api.get("/admin/violation-types", {
      params: { limit: 100 },
    });
    return response.data.data;
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
    result: "cleared" | "disqualified" | "withdrawn",
    healthStatus?: string
  ): Promise<any> => {
    const payload: Record<string, string> = { result };
    if (healthStatus) payload.healthStatus = healthStatus;
    const response = await api.patch(
      `/referee/races/${raceId}/entries/${entryId}/inspection`,
      payload
    );
    return response.data;
  },
};
