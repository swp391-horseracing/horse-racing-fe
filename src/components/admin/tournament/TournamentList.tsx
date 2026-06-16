import TournamentCard from "./TournamentCard";

type Props = {
  tournaments: any[];
  onView: (id: string) => void;
};

export default function TournamentList({ tournaments, onView }: Props) {
  return (
    <div className="space-y-5">
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          tournament={tournament}
          onView={onView}
        />
      ))}
    </div>
  );
}
