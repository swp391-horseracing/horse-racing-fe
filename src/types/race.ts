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
  course: RaceCourse;
};

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
  scheduleAt: string;
  venue: string;
  laneCount?: number;

  status: RaceApiStatus;

  createdAt: string;
  updatedAt: string;

  course: RaceCourse;
}

export interface RaceDetail extends RaceListItem {
  roundName?: string;
  distanceMeters?: number;
  trackCondition?: string;
  laneCount?: number;
  entries?: RaceEntry[];
}
