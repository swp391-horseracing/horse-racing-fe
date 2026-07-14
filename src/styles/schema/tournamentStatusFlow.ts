export const TOURNAMENT_STATUS_FLOW = {
  draft: ["upcoming"],
  upcoming: ["registration_open", "cancelled"],
  registration_open: ["registration_closed", "cancelled"],
  registration_closed: ["ongoing", "cancelled"],
  ongoing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
} as const;

export const TOURNAMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
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

export function formatTournamentStatus(status: string) {
  return TOURNAMENT_STATUS_LABELS[status] ?? status;
}

export function getAvailableStatuses(currentStatus: string) {
  const normalized = currentStatus.toLowerCase();

  const next =
    TOURNAMENT_STATUS_FLOW[normalized as keyof typeof TOURNAMENT_STATUS_FLOW] ??
    [];

  return [normalized, ...next];
}
