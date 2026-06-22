import api from "../lib/api";
import type {
  PredictionListResponse,
  PredictionFilters,
} from "../types/prediction";

export const PredictionService = {
  async getMyPredictions(
    params: PredictionFilters
  ): Promise<PredictionListResponse> {
    const response = await api.get("/me/predictions", { params });
    return response.data;
  },

  async placePrediction(
    raceId: string,
    predictedEntryId: string,
    predictedPosition: number
  ) {
    const response = await api.post(`/races/${raceId}/predictions`, {
      predictedEntryId,
      predictedPosition,
    });
    return response.data;
  },
};
