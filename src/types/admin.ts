export interface Tournament {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  rules: string;
  location: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maximumParticipants: number;
  minimumParticipants: number;
  prizePool: number;
}

export interface UserListResponse {
  data: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    avatarUrl: string;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    avatarUrl: string;
    createdAt: string;
  };
}

export interface TournamentResponse {
  message: string;
  tournament: Tournament;
}
