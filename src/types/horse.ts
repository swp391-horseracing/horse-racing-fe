export interface Horse {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  birthDate: string;
  weightKg: string;
  imageUrl: string;
  healthStatus: string;
  status: "Active" | "Retired";
  isRetired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HorseListResponse {
  data: Horse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RetireHorseResponse {
  message: string;
  horse: Horse;
}
