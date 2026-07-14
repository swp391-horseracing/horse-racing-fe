import { formatTournamentStatus, TOURNAMENT_STATUS_STYLES } from "../../../styles/schema/tournamentStatusFlow";

type Props = {
  status: string;
};

export default function TournamentStatus({ status }: Props) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-bold ${
        TOURNAMENT_STATUS_STYLES[status.toLowerCase()] ??
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {formatTournamentStatus(status)}
    </span>
  );
}
