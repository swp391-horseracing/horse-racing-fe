import type {
  AssignedReferee,
  Placement,
  RaceReport,
  TournamentSummary,
} from "./referee";

export type RaceApiStatus =
  | "draft"
  | "scheduled"
  | "pre_race"
  | "ongoing"
  | "under_review"
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
  jockeyId: string;
  jockeyName: string;
  clothNumber: number;
  trainerName?: string;
}

export type RaceSurface = "turf" | "dirt" | "synthetic";

export interface RaceTrack {
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
  courseDistanceId?: string;

  name: string;
  raceNumber: number | null;
  scheduledAt: string;
  venue: string;
  laneCount?: number;

  status: RaceApiStatus;

  createdAt?: string;
  updatedAt?: string;

  course?: RaceTrack;
  entryCount?: number;
  tournamentName?: string;
  tournament?: {
    id: string;
    name: string;
  };
  predictionMinStake?: number;
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
  distanceMeters?: number;
  trackCondition?: string;
  laneCount?: number;
  entries?: RaceEntry[];
  predictionMinStake?: number;
}

export type Ride = {
  id: string;
  tournamentId: string;
  name: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: "scheduled" | "live" | "completed";
  ride: string;
  laneNumber: number;
  entryStatus:
    | "pending"
    | "accepted"
    | "declined"
    | "disqualified"
    | "did_not_finish"
    | "scratched";
  confirmedAt: string | null;
  horseOwner: string;
  horsesId: string;
  ownerId: string;
  trackCondition: string;
  laneCount: number;
  ranking?: number;
  track?: RaceTrack;
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
  distanceMeters: number;
  trackCondition: "dry" | "wet" | "muddy" | "heavy";
  scheduledAt: string;
  venue: string;
  laneCount: number;
  status: RaceApiStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Frame {
  time: number;
  distance: number;
}

export interface HorseReplay {
  id: string;
  name: string;
  timeline: Frame[];
}

export interface RaceReplay {
  duration: number;
  raceDistance: number;
  horses: HorseReplay[];
}

export interface RaceHistoryStats {
  totalRaces: number;
  wins: number;
  places: number;
  avgFinishPosition: number | null;
  dnfCount: number;
  dsqCount: number;
}

export interface HorseRaceHistoryEntry {
  raceId: string;
  raceName: string;
  raceNumber: number | null;
  scheduledAt: string;
  venue: string;
  surfaceType: string | null;
  distanceMeters: number | null;
  raceStatus: string;
  laneNumber: number | null;
  entryStatus: string;
  finishedPosition: number | null;
  finishTime: string | null;
  finishStatus: string | null;
  points: number | null;
  jockey: {
    id: string;
    fullName: string;
  } | null;
}

export interface JockeyRaceHistoryEntry {
  raceId: string;
  raceName: string;
  raceNumber: number | null;
  scheduledAt: string;
  venue: string;
  surfaceType: string | null;
  distanceMeters: number | null;
  raceStatus: string;
  laneNumber: number | null;
  entryStatus: string;
  finishedPosition: number | null;
  finishTime: string | null;
  finishStatus: string | null;
  points: number | null;
  horse: {
    id: string;
    name: string;
  } | null;
}

export interface RaceHistoryResponse<T> {
  stats: RaceHistoryStats;
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
