/* eslint-disable react-refresh/only-export-components */
import { cn } from "../../lib/utils";
import { formatStatus } from "../../utils/formatters";
import type { ReactNode } from "react";

const SIZE_CLASSES = {
  xs: "px-1.5 py-0.5 text-[8px]",
  sm: "px-2 py-0.5 text-[9px]",
  md: "px-2.5 py-0.5 text-[10px]",
  lg: "px-3 py-1 text-xs",
} as const;

const DEFAULT_STYLE = "bg-slate-100 text-slate-600 border-slate-200";

// ─── Canonical light status styles ────────────────────────────────────────────
// Single source of truth for every status value across all entities.
// Every entity-specific map below (and every consumer) must reuse these values
// so that the same status always renders with the same color.
export const STATUS_STYLES: Record<string, string> = {
  // Neutral / slate
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  withdrawn: "bg-slate-100 text-slate-600 border-slate-200",
  dns: "bg-slate-100 text-slate-600 border-slate-200",
  did_not_finish: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-slate-100 text-slate-600 border-slate-200",
  superseded: "bg-slate-100 text-slate-600 border-slate-200",
  rest: "bg-slate-100 text-slate-600 border-slate-200",
  retired: "bg-slate-100 text-slate-600 border-slate-200",
  not_racing: "bg-slate-100 text-slate-600 border-slate-200",
  under_observation: "bg-slate-100 text-slate-600 border-slate-200",
  unknown: "bg-slate-100 text-slate-600 border-slate-200",

  // Informational / blue
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  registration_closed: "bg-blue-50 text-blue-700 border-blue-200",
  recovering: "bg-blue-50 text-blue-700 border-blue-200",

  // Transition / violet
  pre_race: "bg-violet-50 text-violet-700 border-violet-200",

  // Pending / caution / amber
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  referee_confirmed: "bg-amber-50 text-amber-700 border-amber-200",
  scratched: "bg-amber-50 text-amber-700 border-amber-200",
  sick: "bg-amber-50 text-amber-700 border-amber-200",
  under_maintainance: "bg-amber-50 text-amber-700 border-amber-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  registration_open: "bg-amber-50 text-amber-700 border-amber-200",
  racing: "bg-amber-50 text-amber-700 border-amber-200",
  minor_injury: "bg-amber-50 text-amber-700 border-amber-200",
  awaiting_jockey: "bg-amber-50 text-amber-700 border-amber-200",
  awaiting_owner: "bg-orange-50 text-orange-700 border-orange-200",
  awaiting_referee: "bg-amber-100 text-amber-800 border-amber-300",

  // Success / emerald
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cleared: "bg-emerald-50 text-emerald-700 border-emerald-200",
  correct: "bg-emerald-50 text-emerald-700 border-emerald-200",
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  finished: "bg-emerald-50 text-emerald-700 border-emerald-200",
  result_confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",

  // Live / rose
  ongoing: "bg-rose-50 text-rose-700 border-rose-200",
  live: "bg-rose-50 text-rose-700 border-rose-200",
  live_now: "bg-rose-50 text-rose-700 border-rose-200",

  // Negative / red
  cancelled: "bg-slate-50 text-slate-700 border-slate-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  disqualified: "bg-red-50 text-red-700 border-red-200",
  dsq: "bg-red-50 text-red-700 border-red-200",
  locked: "bg-red-50 text-red-700 border-red-200",
  incorrect: "bg-red-50 text-red-700 border-red-200",
  injured: "bg-red-50 text-red-700 border-red-200",
  result_cancellation: "bg-red-50 text-red-700 border-red-200",
  disqualification: "bg-red-50 text-red-700 border-red-200",

  // Caution / orange
  postponed: "bg-orange-50 text-orange-700 border-orange-200",
  point_deduction: "bg-orange-50 text-orange-700 border-orange-200",
};

// ─── Canonical dark status styles (for dark/detail panels) ───────────────────
export const STATUS_DARK_STYLES: Record<string, string> = {
  draft: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  inactive: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  withdrawn: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  dns: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  did_not_finish: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  expired: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  superseded: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  scheduled: "bg-blue-500/20 border-blue-400/50 text-blue-200",
  upcoming: "bg-blue-500/20 border-blue-400/50 text-blue-200",
  pre_race: "bg-violet-500/20 border-violet-400/50 text-violet-200",
  pending: "bg-amber-500/20 border-amber-400/50 text-amber-200",
  under_review: "bg-amber-500/20 border-amber-400/50 text-amber-200",
  scratched: "bg-amber-500/20 border-amber-400/50 text-amber-200",
  active: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
  completed: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
  confirmed: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
  accepted: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
  approved: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
  ongoing: "bg-rose-500/20 border-rose-400/50 text-rose-200",
  live: "bg-rose-500/20 border-rose-400/50 text-rose-200",
  live_now: "bg-rose-500/20 border-rose-400/50 text-rose-200",
  cancelled: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  failed: "bg-red-500/20 border-red-400/50 text-red-200",
  declined: "bg-red-500/20 border-red-400/50 text-red-200",
  disqualified: "bg-red-500/20 border-red-400/50 text-red-200",
  dsq: "bg-red-500/20 border-red-400/50 text-red-200",
  postponed: "bg-orange-500/20 border-orange-400/50 text-orange-200",
};

// ─── Canonical human-readable labels ──────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  pre_race: "Pre-Race",
  ongoing: "Live",
  under_review: "Under Review",
  result_confirmed: "Result Confirmed",
  completed: "Completed",
  postponed: "Postponed",
  cancelled: "Cancelled",
  pending: "Pending",
  active: "Active",
  locked: "Locked",
  inactive: "Inactive",
  failed: "Failed",
  upcoming: "Upcoming",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  live_now: "Live Now",
  confirmed: "Confirmed",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
  scratched: "Scratched",
  did_not_finish: "Did Not Finish",
  disqualified: "Disqualified",
  dnf: "DNF",
  dsq: "DSQ",
  dns: "DNS",
  finished: "Finished",
  approved: "Approved",
  rejected: "Rejected",
  referee_confirmed: "Pending Publication",
  published: "Published",
  healthy: "Healthy",
  injured: "Injured",
  sick: "Sick",
  rest: "Rest",
  recovering: "Recovering",
  minor_injury: "Minor Injury",
  under_observation: "Under Observation",
  under_maintainance: "Under Maintenance",
  maintenance: "Maintenance",
  expired: "Expired",
  superseded: "Superseded",
  correct: "Correct",
  incorrect: "Incorrect",
  warning: "Warning",
  disqualification: "Disqualification",
  result_cancellation: "Result Cancellation",
  point_deduction: "Point Deduction",
  cleared: "Cleared",
  retired: "Retired",
  racing: "Racing",
  not_racing: "Not Racing",
  processing: "Processing",
  awaiting_jockey: "Awaiting Jockey Response",
  awaiting_owner: "Awaiting Owner Confirmation",
  awaiting_referee: "Awaiting Referee Clearance",
};

export function formatStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? formatStatus(status);
}

// ─── Entity-specific style maps ───────────────────────────────────────────────

export const RACE_STATUS_STYLES: Record<string, string> = {
  draft: STATUS_STYLES.draft,
  scheduled: STATUS_STYLES.scheduled,
  pre_race: STATUS_STYLES.pre_race,
  ongoing: STATUS_STYLES.ongoing,
  under_review: STATUS_STYLES.under_review,
  result_confirmed: STATUS_STYLES.result_confirmed,
  completed: STATUS_STYLES.completed,
  postponed: STATUS_STYLES.postponed,
  cancelled: STATUS_STYLES.cancelled,
};

export const RACE_STATUS_DETAIL_STYLES: Record<string, string> = {
  draft: STATUS_DARK_STYLES.draft,
  scheduled: STATUS_DARK_STYLES.scheduled,
  pre_race: STATUS_DARK_STYLES.pre_race,
  ongoing: STATUS_DARK_STYLES.ongoing,
  under_review: STATUS_DARK_STYLES.under_review,
  result_confirmed: STATUS_DARK_STYLES.completed,
  completed: STATUS_DARK_STYLES.completed,
  postponed: STATUS_DARK_STYLES.postponed,
  cancelled: STATUS_DARK_STYLES.cancelled,
};

export const TOURNAMENT_STATUS_STYLES: Record<string, string> = {
  draft: STATUS_STYLES.draft,
  upcoming: STATUS_STYLES.upcoming,
  registration_open: STATUS_STYLES.registration_open,
  registration_closed: STATUS_STYLES.registration_closed,
  ongoing: STATUS_STYLES.ongoing,
  live_now: STATUS_STYLES.live_now,
  completed: STATUS_STYLES.completed,
  cancelled: STATUS_STYLES.cancelled,
};

export const ENTRY_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  confirmed: STATUS_STYLES.confirmed,
  scratched: STATUS_STYLES.scratched,
  withdrawn: STATUS_STYLES.withdrawn,
  did_not_finish: STATUS_STYLES.did_not_finish,
  disqualified: STATUS_STYLES.disqualified,
  accepted: STATUS_STYLES.accepted,
  scheduled: STATUS_STYLES.scheduled,
  declined: STATUS_STYLES.declined,
};

export const DERIVED_ENTRY_STATUS_STYLES: Record<string, string> = {
  awaiting_jockey: STATUS_STYLES.awaiting_jockey,
  awaiting_owner: STATUS_STYLES.awaiting_owner,
  awaiting_referee: STATUS_STYLES.awaiting_referee,
  confirmed: STATUS_STYLES.confirmed,
};

export const DERIVED_ENTRY_STATUS_DARK_STYLES: Record<string, string> = {
  awaiting_jockey: STATUS_DARK_STYLES.pending,
  awaiting_owner: "bg-orange-500/20 border-orange-400/50 text-orange-200",
  awaiting_referee: "bg-amber-500/20 border-amber-400/50 text-amber-200",
  confirmed: STATUS_DARK_STYLES.confirmed,
};

export const TRACK_STATUS_STYLES: Record<string, string> = {
  active: STATUS_STYLES.active,
  inactive: STATUS_STYLES.inactive,
  maintenance: STATUS_STYLES.maintenance,
  under_maintainance: STATUS_STYLES.under_maintainance,
  draft: STATUS_STYLES.draft,
};

export const RIDE_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  accepted: STATUS_STYLES.accepted,
  confirmed: STATUS_STYLES.confirmed,
  declined: STATUS_STYLES.declined,
  did_not_finish: STATUS_STYLES.did_not_finish,
  disqualified: STATUS_STYLES.disqualified,
  scratched: STATUS_STYLES.scratched,
  withdrawn: STATUS_STYLES.withdrawn,
  cancelled: STATUS_STYLES.cancelled,
};

export const RIDE_STATUS_DARK_STYLES: Record<string, string> = {
  pending: "bg-amber-600 text-white! border-transparent",
  accepted: "bg-emerald-600 text-white! border-transparent",
  confirmed: "bg-emerald-600 text-white! border-transparent",
  declined: "bg-rose-600 text-white! border-transparent",
  did_not_finish: "bg-slate-600 text-white! border-transparent",
  disqualified: "bg-red-600 text-white! border-transparent",
  scratched: "bg-amber-600 text-white! border-transparent",
  withdrawn: "bg-slate-600 text-white! border-transparent",
  cancelled: "bg-slate-600 text-white! border-transparent",
};

export const INVITATION_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  accepted: STATUS_STYLES.accepted,
  declined: STATUS_STYLES.declined,
  confirmed: STATUS_STYLES.confirmed,
  expired: STATUS_STYLES.expired,
  cancelled: STATUS_STYLES.cancelled,
  superseded: STATUS_STYLES.superseded,
};

export const PREDICTION_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  correct: STATUS_STYLES.correct,
  incorrect: STATUS_STYLES.incorrect,
};

export const REFEREE_PHASE_STYLES: Record<string, string> = {
  scheduled: STATUS_STYLES.scheduled,
  live: STATUS_STYLES.live,
  post_race: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export const HORSE_REG_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  rejected: STATUS_STYLES.rejected,
  approved: STATUS_STYLES.approved,
};

export const JOCKEY_ROSTER_STATUS_STYLES: Record<string, string> = {
  confirmed: STATUS_STYLES.confirmed,
  accepted: STATUS_STYLES.accepted,
  pending: STATUS_STYLES.pending,
  declined: STATUS_STYLES.declined,
  superseded: STATUS_STYLES.superseded,
};

// ─── New entity maps ──────────────────────────────────────────────────────────

export const USER_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  active: STATUS_STYLES.active,
  locked: STATUS_STYLES.locked,
};

export const WALLET_TX_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  completed: STATUS_STYLES.completed,
  failed: STATUS_STYLES.failed,
  cancelled: STATUS_STYLES.cancelled,
};

export const FINISH_STATUS_STYLES: Record<string, string> = {
  finished: STATUS_STYLES.finished,
  dnf: STATUS_STYLES.did_not_finish,
  dsq: STATUS_STYLES.dsq,
  dns: STATUS_STYLES.dns,
};

export const RESULT_STATUS_STYLES: Record<string, string> = {
  draft: STATUS_STYLES.draft,
  referee_confirmed: STATUS_STYLES.referee_confirmed,
  result_confirmed: STATUS_STYLES.result_confirmed,
  published: STATUS_STYLES.published,
};

export const REGISTRATION_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  approved: STATUS_STYLES.approved,
  rejected: STATUS_STYLES.rejected,
};

export const INSPECTION_STATUS_STYLES: Record<string, string> = {
  pending: STATUS_STYLES.pending,
  cleared: STATUS_STYLES.cleared,
  disqualified: STATUS_STYLES.disqualified,
  withdrawn: STATUS_STYLES.withdrawn,
};

export const SEVERITY_STYLES: Record<string, string> = {
  warning: STATUS_STYLES.warning,
  disqualification: STATUS_STYLES.disqualification,
  result_cancellation: STATUS_STYLES.result_cancellation,
  point_deduction: STATUS_STYLES.point_deduction,
};

export const HORSE_HEALTH_STYLES: Record<string, string> = {
  healthy: STATUS_STYLES.healthy,
  injured: STATUS_STYLES.injured,
  sick: STATUS_STYLES.sick,
  rest: STATUS_STYLES.rest,
  recovering: STATUS_STYLES.recovering,
  minor_injury: STATUS_STYLES.minor_injury,
  under_observation: STATUS_STYLES.under_observation,
};

export const HORSE_STATUS_STYLES: Record<string, string> = {
  Active: STATUS_STYLES.active,
  Retired: STATUS_STYLES.retired,
  Racing: STATUS_STYLES.racing,
  active: STATUS_STYLES.active,
  retired: STATUS_STYLES.retired,
  racing: STATUS_STYLES.racing,
};

// ─── StatusBadge component ────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  styleMap: Record<string, string>;
  label?: string;
  labelMap?: Record<string, string>;
  size?: keyof typeof SIZE_CLASSES;
  showDot?: boolean;
  dotClassName?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatusBadge({
  status,
  styleMap,
  label,
  labelMap,
  size = "md",
  showDot = false,
  dotClassName = "bg-rose-500",
  icon,
  className,
}: StatusBadgeProps) {
  const resolvedLabel = label ?? labelMap?.[status] ?? status;
  const styleClass = styleMap[status] ?? DEFAULT_STYLE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-black tracking-wider",
        SIZE_CLASSES[size],
        styleClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 animate-pulse rounded-full", dotClassName)}
        />
      )}
      {icon}
      {resolvedLabel}
    </span>
  );
}
