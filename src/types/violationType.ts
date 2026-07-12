export interface ViolationTypeConfig {
  id: string;
  violationType: string;
  pointsDeducted: number;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ViolationTypeConfigListResponse {
  data: ViolationTypeConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
