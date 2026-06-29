import { X, Calendar } from "lucide-react";
import TournamentDetail from "./TournamentDetail";
import type { TournamentFormValues } from "../../../styles/schema/tournamentSchema";
import type { Tournament } from "../../../types/tournament.ts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  onUpdate?: (id: string, data: TournamentFormValues) => Promise<boolean>;
  onStatusChange?: (id: string, status: string) => Promise<boolean>;
  onManageRaces?: (id: string) => void;
};

export default function TournamentDetailModal({
  isOpen,
  onClose,
  tournament,
  onUpdate,
  onStatusChange,
  onManageRaces,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl border shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-lg text-[#064E3B]">
            Tournament Detail
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <TournamentDetail
            tournament={tournament}
            onUpdate={onUpdate}
            onStatusChange={onStatusChange}
          />

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => onManageRaces?.(tournament.id)}
              className="w-full bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-700 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Manage Races
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
