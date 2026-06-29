import TournamentCard from "./TournamentCard";

type Props = {
  tournaments: any[];
  onView: (id: string) => void;
  onManageRaces?: (id: string) => void;
};

export default function TournamentList({
  tournaments,
  onView,
  onManageRaces,
}: Props) {
  return (
    <div className="space-y-3">
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          tournament={tournament}
          onView={onView}
          onManageRaces={onManageRaces}
        />
      ))}
    </div>
  );
}
