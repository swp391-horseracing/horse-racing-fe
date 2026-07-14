import {
  RACE_STATUS_STYLES,
  RACE_STATUS_DETAIL_STYLES,
  ENTRY_STATUS_STYLES,
} from "../components/ui/StatusBadge";
import { formatStatus } from "./formatters";

export function getRaceStatusStyle(status: string): string {
  return (
    RACE_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
  );
}

export function getRaceStatusDetailStyle(status: string): string {
  return (
    RACE_STATUS_DETAIL_STYLES[status] ??
    "bg-slate-500/20 border-slate-400/50 text-slate-200"
  );
}

export function getEntryStatusStyle(status: string): string {
  return (
    ENTRY_STATUS_STYLES[status] ?? "border-slate-200 bg-slate-50 text-slate-400"
  );
}

export function getRaceStatusLabel(status: string): string {
  if (status === "ongoing" || status === "live") return "Live";
  if (status === "scheduled" || status === "pre_race") return "Upcoming";
  return formatStatus(status);
}
