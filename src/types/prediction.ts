export type PredictionStatus = "pending" | "correct" | "incorrect";

export interface PredictionRace {
  id: string;
  name: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: string;
  predictionMinStake: number;
}

export interface PredictionEntry {
  entryId: string;
  horseName: string;
}

export interface Prediction {
  id: string;
  race: PredictionRace;
  predictedEntry: PredictionEntry;
  predictedPosition: number;
  placedAt: string;
  isCorrect: boolean | null;
  rewardAmount: string;
  stakeAmount: number;
}

export interface CreatePredictionPayload {
  predictedEntryId: string;
  predictedPosition: number;
  stakeAmount: number;
}

export interface PredictionListResponse {
  data: Prediction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PredictionFilters {
  search?: string;
  status?: PredictionStatus;
  page?: number;
  limit?: number;
}
