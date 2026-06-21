import type {Horse} from "./horse.ts";

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

export interface Tournament {
  id: string;
  name: string;
  status: TournamentApiStatus;
  location: string;
  startDate: string;
  endDate: string;

  description?: string;
  rules?: string;

  registrationOpenDate?: string;
  registrationCloseDate?: string;

  prizePool?: number;
  maximumParticipants?: number;
  minimumParticipants?: number;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface TournamentDetail {
  id: string;
  name: string;
  status:
    | "upcoming"
      |"live_now"
    | "registration_open"
    | "registration_closed"
    | "ongoing"
    | "completed"
    | "cancelled";

  location: string;

  startDate: string;
  endDate: string;

  description?: string;
  rules?: string;

  registrationOpenDate?: string;
  registrationCloseDate?: string;

  prizePool?: number;

  maximumParticipants?: number;
  minimumParticipants?: number;

  createdBy?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  horseId: string;
  ownerId: string;
  status: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface TournamentRegistrationResponse {
  id: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  horse: Horse;
  tournament: Tournament;
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TournamentResponse {
  message: string;
  tournament: Tournament;
}

export interface TournamentListResponse {
  data: Tournament[];
  pagination: Pagination;
}

export interface TournamentRacesResponse {
  data: RaceItem[];
  pagination: Pagination;
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
