import {
  RACE_STATUS_STYLES,
  RACE_STATUS_DETAIL_STYLES,
  ENTRY_STATUS_STYLES,
  USER_STATUS_STYLES,
  WALLET_TX_STATUS_STYLES,
  FINISH_STATUS_STYLES,
  RESULT_STATUS_STYLES,
  REGISTRATION_STATUS_STYLES,
  INSPECTION_STATUS_STYLES,
  SEVERITY_STYLES,
  HORSE_HEALTH_STYLES,
  HORSE_STATUS_STYLES,
  STATUS_STYLES,
} from "../components/ui/StatusBadge";
import { formatStatus } from "./formatters";

export function getStatusStyle(status: string): string {
  return (
    STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
  );
}

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

export function getUserStatusStyle(status: string): string {
  return USER_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getWalletTxStatusStyle(status: string): string {
  return WALLET_TX_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getFinishStatusStyle(status: string): string {
  return FINISH_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getResultStatusStyle(status: string): string {
  return RESULT_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getRegistrationStatusStyle(status: string): string {
  return REGISTRATION_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getInspectionStatusStyle(status: string): string {
  return INSPECTION_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getSeverityStyle(status: string): string {
  return SEVERITY_STYLES[status] ?? getStatusStyle(status);
}

export function getHorseHealthStyle(status: string): string {
  return HORSE_HEALTH_STYLES[status] ?? getStatusStyle(status);
}

export function getHorseStatusStyle(status: string): string {
  return HORSE_STATUS_STYLES[status] ?? getStatusStyle(status);
}

export function getRaceStatusLabel(status: string): string {
  if (status === "ongoing" || status === "live") return "Live";
  if (status === "scheduled" || status === "pre_race") return "Upcoming";
  return formatStatus(status);
}
