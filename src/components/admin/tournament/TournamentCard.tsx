import { Trophy, MapPin, Calendar } from "lucide-react";
import TournamentStatus from "./TournamentStatus";

type Props = {
  tournament: any;
  onView: (id: string) => void;
};

export default function TournamentCard({ tournament, onView }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex justify-between items-center hover:shadow-md transition">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-full bg-[#064E3B]/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-[#064E3B]" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg text-[#064E3B]">
              {tournament.name}
            </h3>

            <TournamentStatus status={tournament.status} />
          </div>

          <div className="flex gap-5 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {tournament.location}
            </div>

            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(tournament.startDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onView(tournament.id)}
        className="px-4 py-2 bg-[#064E3B] text-white rounded-xl text-sm font-semibold hover:bg-[#043d2d]"
      >
        View Detail
      </button>
    </div>
  );
}
