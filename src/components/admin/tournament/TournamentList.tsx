import TournamentCard from "./TournamentCard";

type Props = {
  tournaments: any[];
  onManage?: (id: string) => void;
};

export default function TournamentList({
  tournaments,
  onManage,
}: Props) {
  return (
    <div className="space-y-3">
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          tournament={tournament}
          onManage={onManage}
        />
      ))}
    </div>
  );
}
