import { formatTournamentStatus } from "../../../styles/schema/tournamentStatusFlow";

type Props = {
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  registration_open: "bg-amber-50 text-amber-700 border-amber-200",
  registration_closed: "bg-blue-50 text-blue-700 border-blue-200",
  ongoing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  live_now: "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function TournamentStatus({ status }: Props) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-bold ${
        STATUS_STYLES[status.toLowerCase()] ??
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {formatTournamentStatus(status)}
    </span>
  );
}
