export type ToastType = "success" | "error" | "warning" | "info";
export type Toast = { id: number; message: string; type: ToastType };

export type InspectionStatus =
  | "pending"
  | "cleared"
  | "disqualified"
  | "withdrawn";

export type RacePhase = "scheduled" | "live" | "concluded" | "report";

export type ViolationCategory =
  | "Whip Limit Exceeded"
  | "Lane Interference"
  | "Unsafe Riding"
  | "Refusal to Race / Bolting";

export interface LaneEntry {
  id: string;
  laneNumber: number;
  horseName: string;
  jockeyName: string;
  inspectionStatus: InspectionStatus;
  inspectedAt: string | null;
  failReason: string | null;
  violations: Violation[];
  finishPosition: number | null;
  finishTime: string;
  flag: "dnf" | "dsq" | null;
}

export interface MockRace {
  id: string;
  name: string;
  venue: string;
  scheduledAt: string;
  trackCondition: string;
  distanceMeters: number;
  phase: RacePhase;
  lanes: LaneEntry[];
  elapsedSeconds: number;
  timerRunning: boolean;
  reportNotes: string;
  reportSubmitted: boolean;
  refereeCheckedIn: boolean;
  adminUnlocked: boolean;
}

import type { RaceDetail } from "./race.ts";

export interface TournamentSummary {
  id: string;
  name: string;
}

export interface HorseSummary {
  id: string;
  name: string;
  breed: string;
}

export interface Violation {
  id: string;
  entryId: string;
  refereeId: string;

  occurredAt: string;

<<<<<<< Updated upstream
export const PRE_RACE_DISQUALIFY_REASONS = [
  "Identity Mismatch (Lip Tattoo/Microchip)",
  "Medication Violation",
  "Weight / Equipment Compliance Failure",
  "Steward Disqualification / Other",
];

import type { Race } from "./race.ts";

export interface TournamentSummary {
  id: string;
  name: string;
}

export interface HorseSummary {
  id: string;
  name: string;
  breed: string;
}

export interface Violation {
  id: string;
  entryId: string;
  refereeId: string;

  occurredAt: string;

  violationType: string;
  description: string;

  severity: "warning" | "minor" | "major" | "critical";
=======
  violationType: string;
  description: string;

  severity:
    | "warning"
    | "disqualification"
    | "result_cancellation"
    | "point_deduction";
>>>>>>> Stashed changes

  note: string;
}

export interface Placement {
  entryId: string;

  laneNumber: number;

  horse: HorseSummary;

  jockey: {
    id: string;
    fullName: string;
  };

  finishedPosition: number;

  finishTime: string;

<<<<<<< Updated upstream
  finishStatus: "finished" | "dnf" | "dns" | "dq";
=======
  finishStatus: "finished" | "dnf" | "dns" | "dsq";
>>>>>>> Stashed changes

  points: number;

  violation: Violation | null;
}

export interface JockeySummary {
  id: string;
  fullName: string;
}

export interface Referee {
  id: string;
  fullName: string;
}

export interface AssignedReferee extends Referee {
  assignedAt: string;
}

export interface RaceReport {
  id: string;

<<<<<<< Updated upstream
  status: "draft" | "submitted" | "confirmed" | "published";
=======
  status: "draft" | "referee_confirmed" | "published";
>>>>>>> Stashed changes

  notes: string;

  refereeConfirmedBy: string;
  refereeConfirmedAt: string;

  publishedBy: string;
  publishedAt: string;

  createdAt: string;
  updatedAt: string;

  referee: Referee;
}

export interface RefereeReport {
<<<<<<< Updated upstream
  race: Race;
=======
  race: RaceDetail;
>>>>>>> Stashed changes
  referee: Referee;
  report: RaceReport;
  placements: Placement[];
}
