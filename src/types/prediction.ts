export type PredictionStatus = "pending" | "correct" | "incorrect";

export interface PredictionRace {
  id: string;
  name: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: string;
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
