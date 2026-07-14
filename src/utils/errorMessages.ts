export function extractApiErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred."
): string {
  if (!err) return fallback;

  const axiosErr = err as {
    response?: { data?: Record<string, unknown> };
    message?: string;
  };
  const data = axiosErr?.response?.data;

  if (data) {
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
  }

  if (err instanceof Error) return err.message;
  return fallback;
}

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
  "Invalid email or password":
    "The email or password you entered is incorrect.",
  "Token expired":
    "Your session has expired. Please log in again.",
  "Unauthorized":
    "You do not have permission to perform this action.",
  "Not found":
    "The requested resource was not found.",
  "Validation failed":
    "Some of the information provided is invalid. Please check and try again.",
  "Email already in use":
    "This email address is already registered. Please use a different email.",
  "Tournament is full":
    "This tournament has reached its maximum capacity.",
  "Race is already in progress":
    "This race has already started and cannot be modified.",
  "Prediction already placed":
    "You have already placed a prediction for this race.",
  "Insufficient balance":
    "You do not have enough balance to complete this transaction.",
};

export function friendlyErrorMessage(raw: string | undefined): string {
  if (!raw) return "An unexpected error occurred.";
  return API_ERROR_MAP[raw] ?? raw;
}
