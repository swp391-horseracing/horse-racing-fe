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
}

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const phaseLabel: Record<RacePhase, string> = {
  scheduled: "Scheduled",
  live: "Live",
  concluded: "Concluded",
  report: "Report Pending",
};

export const phaseBadgeStyle: Record<RacePhase, string> = {
  scheduled: "bg-amber-50 text-amber-900 border-amber-300 font-bold",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  concluded: "bg-indigo-100 text-indigo-800 border-indigo-200",
  report: "bg-violet-100 text-violet-800 border-violet-200",
};

export const VIOLATION_CATEGORIES: ViolationCategory[] = [
  "Whip Limit Exceeded",
  "Lane Interference",
  "Unsafe Riding",
  "Refusal to Race / Bolting",
];

export const PRE_RACE_WITHDRAW_REASONS = [
  "Veterinary Scratch (Paddock / Gate Lameness)",
  "Gate Behavior / Refusal to Load",
  "Gate Injury / Breakthrough",
  "Trainer Scratch (Track Surface Concern)",
  "Jockey Injury (No Rider Available)",
  "Other",
];

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

  finishStatus: "finished" | "dnf" | "dns" | "dq";

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

  status: "draft" | "submitted" | "confirmed" | "published";

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
  race: Race;
  referee: Referee;
  report: RaceReport;
  placements: Placement[];
}
