export const RACE_STATUS_FLOW: Record<string, string[]> = {
  draft: ["scheduled", "cancelled"],
  scheduled: ["pre_race", "postponed", "cancelled"],
  pre_race: ["ongoing", "postponed", "cancelled"],
  ongoing: ["under_review"],
  under_review: ["result_confirmed"],
  result_confirmed: ["completed"],
  postponed: ["scheduled", "cancelled"],
  completed: [],
  cancelled: [],
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  pre_race: "Pre-Race",
  ongoing: "Ongoing",
  under_review: "Under Review",
  result_confirmed: "Result Confirmed",
  completed: "Completed",
  postponed: "Postponed",
  cancelled: "Cancelled",
};
