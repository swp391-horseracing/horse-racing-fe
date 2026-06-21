export interface Invitation {
  id: string;
  horseId: string;
  tournamentId: number;
  jockeyId: number;
  status: "Pending" | "Accepted" | "Declined" | "Confirmed" | "Superseded";
  horse: string;
  tournament: string;
  owner: string;
  raceTime: string;
}
