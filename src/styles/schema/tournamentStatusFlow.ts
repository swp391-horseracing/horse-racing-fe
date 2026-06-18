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
  draft: "draft",
  upcoming: "Upcoming",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
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
