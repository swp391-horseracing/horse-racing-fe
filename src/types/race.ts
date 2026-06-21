export type RaceStatus =
  | "draft"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "result_confirmed";

export interface RaceListItem {
  id: string;
  tournamentId: string;
  date: string;
  name: string;
  scheduledAt: string;
  venue: string;
  status: RaceStatus;
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
