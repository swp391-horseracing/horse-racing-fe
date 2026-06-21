import type { Invitation, InvStatus } from "../types/invitation";

const mockInvitations: Invitation[] = [
  {
    id: 1,
    horse: "Thunder Blaze",
    tournament: "Royal Cup 2026",
    raceTime: "2026-06-14 14:00",
    status: "Pending",
    breed: "Thoroughbred",
    winRate: "72%",
    owner: "Lord Alistair",
    regDeadline: "2026-06-10T23:59:59Z",
    medicalLogs: {
      lastCheck: "2026-05-28",
      checkResult: "Perfect (Clear)",
      weight: "492 kg",
      restingHeartRate: "36 bpm",
      injuryHistory: "None recorded",
      trainerNotes:
        "Responds well to firm leads; prefers outside track position.",
    },
  },
  {
    id: 2,
    horse: "Silver Wind",
    tournament: "Grand Prix Spring",
    raceTime: "2026-06-20 10:00",
    status: "Accepted",
    breed: "Arabian",
    winRate: "68%",
    owner: "Marcus Vance",
    regDeadline: "2026-06-15T23:59:59Z",
    medicalLogs: {
      lastCheck: "2026-05-25",
      checkResult: "Healthy",
      weight: "475 kg",
      restingHeartRate: "38 bpm",
      injuryHistory: "Slight tendon strain (Oct 2025), fully recovered",
      trainerNotes:
        "Exceptional explosive start. Keep calm in heavy dirt packs.",
    },
  },
  {
    id: 3,
    horse: "Dark Matter",
    tournament: "National Derby",
    raceTime: "2026-07-01 09:30",
    status: "Pending",
    breed: "Quarter Horse",
    winRate: "55%",
    owner: "Seraphina Vance",
    regDeadline: "2026-06-25T23:59:59Z",
    medicalLogs: {
      lastCheck: "2026-05-29",
      checkResult: "Optimal Condition",
      weight: "510 kg",
      restingHeartRate: "35 bpm",
      injuryHistory: "None",
      trainerNotes:
        "Prefers shorter sprint runs. Keep riding whip actions minimal.",
    },
  },
  {
    id: 4,
    horse: "Golden Flash",
    tournament: "Summer Classic",
    raceTime: "2026-05-10 15:00",
    status: "Expired",
    breed: "Appaloosa",
    winRate: "61%",
    owner: "Elena Rostova",
    regDeadline: "2026-05-05T23:59:59Z",
    medicalLogs: {
      lastCheck: "2026-05-01",
      checkResult: "Fair",
      weight: "482 kg",
      restingHeartRate: "40 bpm",
      injuryHistory: "Splint bone bruise (Dec 2025)",
      trainerNotes: "Strong finish, needs dynamic encouragement in final 200m.",
    },
  },
  {
    id: 5,
    horse: "Storm Rider",
    tournament: "Champion League 2026",
    raceTime: "2026-06-28 11:00",
    status: "Declined",
    breed: "Standardbred",
    winRate: "48%",
    owner: "Roderick Cole",
    regDeadline: "2026-06-22T23:59:59Z",
    medicalLogs: {
      lastCheck: "2026-05-18",
      checkResult: "Perfect",
      weight: "498 kg",
      restingHeartRate: "37 bpm",
      injuryHistory: "None",
      trainerNotes: "Tends to lean left on tight corners. Watch alignment.",
    },
  },
  {
    id: 6,
    horse: "Midnight Shadow",
    tournament: "Royal Cup 2026",
    raceTime: "2026-06-14 14:00",
    status: "Pending",
    breed: "Thoroughbred",
    winRate: "64%",
    owner: "Lady Genevieve",
    regDeadline: "2026-06-10T23:59:59Z",
    medicalLogs: {
      lastCheck: "2026-05-27",
      checkResult: "Healthy",
      weight: "488 kg",
      restingHeartRate: "39 bpm",
      injuryHistory: "None",
      trainerNotes: "Loves wet tracks. Highly energetic when leading the pack.",
    },
  },
];

export const InvitationService = {
  getInvitations: async (): Promise<Invitation[]> => {
    return [...mockInvitations];
  },

  updateInvitationStatus: async (
    id: number,
    status: InvStatus
  ): Promise<Invitation | undefined> => {
    const index = mockInvitations.findIndex((inv) => inv.id === id);
    if (index === -1) return undefined;
    mockInvitations[index].status = status;
    return mockInvitations[index];
  },
};
