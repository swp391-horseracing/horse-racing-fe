import { formatStatus } from "./formatters";

export type DerivedEntryStatus =
  | "awaiting_jockey"
  | "awaiting_owner"
  | "awaiting_referee"
  | "confirmed"
  | "other";

export const DERIVED_ENTRY_STATUS_LABELS: Record<DerivedEntryStatus, string> = {
  awaiting_jockey: "Awaiting Jockey Response",
  awaiting_owner: "Awaiting Owner Confirmation",
  awaiting_referee: "Awaiting Referee Clearance",
  confirmed: "Confirmed",
  other: "",
};

/**
 * Reconstructs which "pending" sub-state an entry is really in from fields
 * already returned by the API. entry_status stays "pending" for three
 * unrelated reasons (no jockey, jockey accepted but owner hasn't confirmed,
 * owner confirmed but referee hasn't inspected) — this is a stopgap client
 * heuristic to distinguish them until the backend reports distinct statuses.
 * Delete/simplify this once that lands.
 */
export function deriveEntryStatus(input: {
  entryStatus: string;
  jockeyId?: string | null;
  confirmedAt?: string | null;
}): DerivedEntryStatus {
  const { entryStatus, jockeyId, confirmedAt } = input;

  if (entryStatus !== "pending") {
    return entryStatus === "confirmed" ? "confirmed" : "other";
  }

  if (!jockeyId) {
    return "awaiting_jockey";
  }

  if (!confirmedAt) {
    return "awaiting_owner";
  }

  return "awaiting_referee";
}

/**
 * Resolves the display label for an entry's status — the derived
 * awaiting-state label when applicable, otherwise a formatted version of
 * the raw entryStatus. Single source of truth for this fallback so the
 * three call sites (Jockey Roster, My Entries, Tournament Register) can't
 * drift into slightly different formatting.
 */
export function resolveEntryStatusLabel(entry: {
  entryStatus: string;
  jockeyId?: string | null;
  confirmedAt?: string | null;
}): string {
  const derived = deriveEntryStatus(entry);
  return derived === "other"
    ? formatStatus(entry.entryStatus)
    : DERIVED_ENTRY_STATUS_LABELS[derived];
}
