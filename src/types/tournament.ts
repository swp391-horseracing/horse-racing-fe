// src/types/tournament.ts
export type TournamentApiStatus =
  | "upcoming"
  | "registration_open"
  | "registration_closed"
  | "ongoing"
  | "completed"
  | "cancelled";

export type RaceApiStatus =
  | "scheduled"
  | "pre_race"
  | "ongoing"
  | "under_review"
  | "result_confirmed"
  | "completed"
  | "postponed"
  | "cancelled";

export interface TournamentListItem {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  status: TournamentApiStatus;
}

export interface TournamentDetail extends TournamentListItem {
  description?: string;
  rules?: string;
  maximumParticipants?: number;
  minimumParticipants?: number;
  prizePool?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RaceItem {
  id: string;
  tournamentId: string;
  name: string;
  roundName: string;
  distanceMeters: number;
  trackCondition: string;
  scheduledAt: string;
  venue: string;
  laneCount: number;
  status: RaceApiStatus;
}

export interface TournamentListResponse {
  data: TournamentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TournamentRacesResponse {
  data: RaceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TournamentListQuery {
  status?: TournamentApiStatus;
  page?: number;
  limit?: number;
}

export interface TournamentRacesQuery {
  status?: RaceApiStatus;
  page?: number;
  limit?: number;
}
