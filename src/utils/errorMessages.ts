const API_ERROR_MAP: Record<string, string> = {
  "Race is no longer accepting entries":
    "This race is no longer accepting entries.",
  "Race is full": "All slots are filled for this race.",
  "Horse is already entered in this race":
    "This horse is already entered in this race.",
  "Horse is already racing at this time":
    "Schedule conflict — this horse is already racing at the same time.",
  "Horse is not registered in this tournament":
    "This horse does not have an approved registration for this tournament.",
  "Horse name already in use":
    "A horse with this name already exists. Please choose another name.",
};

export function friendlyErrorMessage(raw: string | undefined): string {
  if (!raw) return "An unexpected error occurred.";
  return API_ERROR_MAP[raw] ?? raw;
}
