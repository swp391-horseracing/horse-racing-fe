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

export interface RaceListItem {
  id: string;
  tournamentId: string;
  date: string;
  name: string;
  scheduledAt: string;
  venue: string;
  status: RaceApiStatus;
}

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
  entryStatus: "pending" | "accepted" | "declined";
  confirmedAt: string | null;
  horseOwner: string;
  horsesId: string;
  ownerId: string;
  trackCondition: string;
  laneCount: number;
  ranking?: number;
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

  status: "draft" | "scheduled" | "ongoing" | "completed" | "cancelled";

  tournament: TournamentSummary;
}

export interface RaceResultDetailResponse {
  race: Race;

  referees: AssignedReferee[];

  report: RaceReport;

  placements: Placement[];
}
