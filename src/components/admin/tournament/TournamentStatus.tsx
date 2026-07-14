import { formatTournamentStatus } from "../../../styles/schema/tournamentStatusFlow";
import { StatusBadge, TOURNAMENT_STATUS_STYLES } from "../../ui/StatusBadge";

type Props = {
  status: string;
};

export default function TournamentStatus({ status }: Props) {
  return (
    <StatusBadge
      status={status}
      styleMap={TOURNAMENT_STATUS_STYLES}
      label={formatTournamentStatus(status)}
      size="lg"
    />
  );
}
