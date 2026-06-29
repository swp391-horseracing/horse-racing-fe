// Shared types and helpers for Admin Race Reports components

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportDetailRace {
  id: string;
  name: string;
  raceNumber: number | null;
  distanceMeters: number | null;
  courseName: string | null;
  courseCity: string | null;
  surfaceType: string | null;
  scheduledAt: string | null;
  laneCount: number | null;
  status: string;
  tournament: { id: string; name: string } | null;
}

export interface ReportDetailReferee {
  id: string;
  fullName: string;
  assignedAt: string | null;
}

export interface ReportDetailReport {
  id: string;
  status: string;
  notes: string | null;
  refereeConfirmedBy: string | null;
  refereeConfirmedAt: string | null;
  publishedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  referee: { id: string; fullName: string } | null;
}

export interface ReportDetailViolation {
  id: string;
  violationType: string;
  description: string;
  severity: string;
  note: string | null;
  occurredAt: string;
  refereeId: string;
}

export interface ReportDetailPlacement {
  entryId: string;
  laneNumber: number | null;
  horse: { id: string; name: string; breed: string };
  jockey: { id: string | null; fullName: string | null };
  finishedPosition: number | null;
  finishTime: string | null;
  finishStatus: string | null;
  points: number | null;
  violation: ReportDetailViolation | null;
}

export interface ReportDetailData {
  race: ReportDetailRace;
  referees: ReportDetailReferee[];
  report: ReportDetailReport | null;
  placements: ReportDetailPlacement[];
}

export type StatusFilter = "" | "referee_confirmed" | "published";

// ─── Constants ────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  referee_confirmed: "Pending Publication",
  published: "Published",
};

export const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  referee_confirmed: "bg-amber-50 text-amber-800 border-amber-200",
  published: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatFinishTime(val: string | null | undefined): string {
  if (!val) return "—";
  const num = parseFloat(val);
  if (isNaN(num) || num < 0) return val;
  const totalSeconds = Math.floor(num);
  const fraction = val.includes(".") ? val.substring(val.indexOf(".")) : "";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}${fraction}`;
}
