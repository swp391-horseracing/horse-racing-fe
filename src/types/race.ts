import type {
  AssignedReferee,
  Placement,
  RaceReport,
  TournamentSummary,
} from "./referee.ts";

export type RaceApiStatus =
  | "draft"
  | "scheduled"
  | "pre_race"
  | "ongoing"
  | "under_review"
  | "result_confirmed"
  | "completed"
  | "postponed"
  | "cancelled";

export interface RaceEntry {
  id: string;
  horseId: string;
  name: string;
  laneNumber: string;
  weightKg: string;
  entryStatus: string;
  jockeyName: string;
  clothNumber: number;
  trainerName?: string;
}

export type RaceSurface = "turf" | "dirt" | "synthetic";

export interface RaceCourse {
  id: string;
  name: string;
  country: string;
  city: string;
  surfaceType: RaceSurface;
  distanceMeters: number;
}

export interface RaceListItem {
  id: string;
  tournamentId: string;
  courseDistanceId: string;

  name: string;
  raceNumber: number | null;
  scheduledAt: string;
  venue: string;
  laneCount?: number;

  status: RaceApiStatus;

  createdAt: string;
  updatedAt: string;

  course?: RaceCourse;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RaceReportListItem {
  raceId: string;
  raceName: string;
  raceStatus: string;
  tournamentId: string;
  tournamentName: string;
  reportId: string;
  reportStatus: string;
  refereeConfirmedBy: string;
  refereeName: string;
  refereeConfirmedAt: string;
  publishedAt: string;
}

export interface RaceReportListResponse {
  data: RaceReportListItem[];
  pagination: Pagination;
}

export interface RaceDetail extends RaceListItem {
  roundName?: string;
  distanceMeters?: number;
  trackCondition?: string;
  laneCount?: number;
  entries?: RaceEntry[];
}

export type Ride = {
  id: string;
  tournamentId: string;
  name: string;
  roundName: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: "scheduled" | "live" | "completed";
  ride: string;
  laneNumber: number;
  entryStatus: "pending" | "accepted" | "declined" | "disqualified" | "did_not_finish" | "scratched";
  confirmedAt: string | null;
  horseOwner: string;
  horsesId: string;
  ownerId: string;
  trackCondition: string;
  laneCount: number;
  ranking?: number;
  course?: RaceCourse;
};

export interface Race {
  id: string;
  name: string;
  raceNumber: number;
  distanceMeters: number;
  trackCondition: "dry" | "wet" | "muddy" | "heavy";
  scheduledAt: string;
  venue: string;
  laneCount: number;
  status: RaceApiStatus;
  tournament: TournamentSummary;
}

export interface RaceResultDetailResponse {
  race: Race;
  referees: AssignedReferee[];
  report: RaceReport;
  placements: Placement[];
}

/* ---------- Admin ---------- */

export interface AdminRace {
  id: string;
  tournamentId: string;
  name: string;
  raceNumber: number;
  roundNumber: number;
  roundName: string;
  distanceMeters: number;
  trackCondition: "dry" | "wet" | "muddy" | "heavy";
  scheduledAt: string;
  scheduleAt: string;
  venue: string;
  laneCount: number;
  status: RaceApiStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublishRaceResponse {
  message: string;
}
