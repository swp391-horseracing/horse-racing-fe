export type InvStatus =
  | "Pending"
  | "Accepted"
  | "Declined"
  | "Expired"
  | "Cancelled"
  | "Superseded";

export type Invitation = {
  id: number;
  horse: string;
  tournament: string;
  raceTime: string;
  status: InvStatus;
  breed: string;
  winRate: string;
  owner: string;
  regDeadline: string;
  medicalLogs: {
    lastCheck: string;
    checkResult: string;
    weight: string;
    restingHeartRate: string;
    injuryHistory: string;
    trainerNotes: string;
  };
};
