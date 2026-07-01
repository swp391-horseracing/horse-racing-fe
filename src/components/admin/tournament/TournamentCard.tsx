import { Trophy, MapPin, Calendar } from "lucide-react";
import TournamentStatus from "./TournamentStatus";

type Props = {
  tournament: any;
  onManage?: (id: string) => void;
};

export default function TournamentCard({
  tournament,
  onManage,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center hover:shadow-md transition">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#064E3B]/10 flex items-center justify-center shrink-0">
          <Trophy className="w-4 h-4 text-[#064E3B]" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-base text-[#064E3B]">
              {tournament.name}
            </h3>

            <TournamentStatus status={tournament.status} />
          </div>

          <div className="flex gap-3 text-sm text-slate-500">
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

      <div className="flex gap-2">
        <button
          onClick={() => onManage?.(tournament.id)}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700"
        >
          Manage
        </button>
      </div>
    </div>
  );
}
