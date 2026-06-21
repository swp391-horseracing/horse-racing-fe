export interface Horse {
  id: string;
  name: string;
  breed: string;
  // API model
  ownerId: string;
  birthDate: string;
  weightKg: string;
  imageUrl: string;
  healthStatus: string;
  isRetired: boolean;
  createdAt: string;
  updatedAt: string;
  // Display model
  age?: number;
  gender?: "Male" | "Female";
  speed?: number;
  stamina?: number;
  owner?: string;
  jockey?: string;
  status?: "Active" | "Training" | "Injured" | "Retired";
  earnings?: number;
  winRate?: number;
  image?: string;
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
