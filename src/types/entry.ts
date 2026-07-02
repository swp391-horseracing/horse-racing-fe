export type Entry = {
  entryId: string;
  horseId: string;
  horseName: string;
  jockeyId: string;
  jockeyName: string;
  raceId: string;
  raceName: string;
  raceStatus: string;
  entryStatus: string;
  scheduleAt: string;
  venue: string;
  distanceMeters: number;
  laneNumber: number;
  weightKg: string;
  confirmedAt: string | null;
  pendingCount: number;
  responsesCount: number;
};
