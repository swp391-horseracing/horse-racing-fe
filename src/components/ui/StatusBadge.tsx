/* eslint-disable react-refresh/only-export-components */
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

const SIZE_CLASSES = {
  xs: "px-1.5 py-0.5 text-[8px]",
  sm: "px-2 py-0.5 text-[9px]",
  md: "px-2.5 py-0.5 text-[10px]",
  lg: "px-3 py-1 text-xs",
} as const;

const DEFAULT_STYLE = "bg-slate-100 text-slate-600 border-slate-200";

export const RACE_STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  pre_race: "bg-violet-50 text-violet-700 border-violet-200",
  ongoing: "bg-rose-50 text-rose-700 border-rose-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  postponed: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const RACE_STATUS_DETAIL_STYLES: Record<string, string> = {
  draft: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  scheduled: "bg-blue-500/20 border-blue-400/50 text-blue-200",
  pre_race: "bg-violet-500/20 border-violet-400/50 text-violet-200",
  ongoing: "bg-rose-500/20 border-rose-400/50 text-rose-200",
  under_review: "bg-amber-500/20 border-amber-400/50 text-amber-200",
  completed: "bg-teal-500/20 border-teal-400/50 text-teal-200",
  postponed: "bg-orange-500/20 border-orange-400/50 text-orange-200",
  cancelled: "bg-red-500/20 border-red-400/50 text-red-200",
};

export const TOURNAMENT_STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  registration_open: "bg-amber-50 text-amber-700 border-amber-200",
  registration_closed: "bg-blue-50 text-blue-700 border-blue-200",
  ongoing: "bg-rose-50 text-rose-700 border-rose-200",
  live_now: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export const ENTRY_STATUS_STYLES: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  scheduled: "border-blue-200 bg-blue-50 text-blue-800",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  declined: "border-rose-200 bg-rose-50 text-rose-800",
  withdrawn: "border-slate-200 bg-slate-50 text-slate-400",
};

export const TRACK_STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  under_maintainance: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
};

export const RIDE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30",
  accepted: "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30",
  declined: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  did_not_finish: "bg-slate-100 text-slate-700 border-slate-300",
  disqualified: "bg-red-50 text-red-800 border-red-300",
  scratched: "bg-amber-50 text-amber-800 border-amber-300",
};

export const RIDE_STATUS_DARK_STYLES: Record<string, string> = {
  pending: "bg-[#D97706] !text-white border-transparent",
  accepted: "bg-emerald-600 !text-white border-transparent",
  declined: "bg-rose-600 !text-white border-transparent",
  did_not_finish: "bg-slate-600 !text-white border-transparent",
  disqualified: "bg-red-600 !text-white border-transparent",
  scratched: "bg-amber-600 !text-white border-transparent",
};

export const INVITATION_STATUS_STYLES: Record<string, string> = {
  pending: "text-[#D97706] bg-[#D97706]/10 border-[#D97706]/20",
  accepted: "text-[#064E3B] bg-[#064E3B]/10 border-[#064E3B]/20",
  declined: "text-rose-700 bg-rose-500/10 border-rose-500/20",
  confirmed: "text-[#064E3B] bg-[#064E3B]/10 border-[#064E3B]/20",
  expired: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  cancelled: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  superseded: "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

export const PREDICTION_STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-50 border-slate-200 text-slate-500",
  correct: "bg-emerald-50 border-emerald-200 text-emerald-800",
  incorrect: "bg-rose-50 border-rose-200 text-rose-800",
};

export const REFEREE_PHASE_STYLES: Record<string, string> = {
  scheduled: "bg-amber-50 text-amber-900 border-amber-300 font-bold",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  post_race: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export const HORSE_REG_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

export const JOCKEY_ROSTER_STATUS_STYLES: Record<string, string> = {
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  accepted: "border-blue-200 bg-blue-50 text-blue-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  declined: "border-rose-200 bg-rose-50 text-rose-800",
  superseded: "border-slate-200 bg-slate-50 text-slate-400",
};

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
