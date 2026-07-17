import { X, Trophy, Clock, Hourglass } from "lucide-react";
import type { FeFinalPlacement } from "../../types/live";
import type { RaceApiStatus } from "../../types/race";

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
};

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  raceName: string;
  status: RaceApiStatus;
  placements: FeFinalPlacement[] | null;
}

export function ResultModal({
  open,
  onClose,
  raceName,
  status,
  placements,
}: ResultModalProps) {
  if (!open) return null;

  const hasResults =
    placements && placements.length > 0 && status === "completed";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            {hasResults ? (
              <Trophy className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <Hourglass className="w-5 h-5 text-amber-500" />
            )}
            <h2 className="font-headline font-bold text-[#064E3B] text-lg">
              {hasResults
                ? status === "completed"
                  ? "Race Results"
                  : "Race Complete"
                : "Race Complete"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">Race</p>
            <p className="font-headline font-bold text-[#064E3B] text-base">
              {raceName}
            </p>
          </div>

          {hasResults ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Final Standings
                </span>
              </div>
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                        Pos
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Horse
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Finish Time
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {placements
                      .sort((a, b) => a.position - b.position)
                      .map((p) => (
                        <tr
                          key={p.horseId}
                          className={`hover:bg-slate-50 transition-colors ${
                            p.position <= 3 ? "bg-amber-50/40" : ""
                          }`}
                        >
                          <td className="px-3 py-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                p.position === 1
                                  ? "bg-[#D4AF37] text-white"
                                  : p.position === 2
                                    ? "bg-slate-400 text-white"
                                    : p.position === 3
                                      ? "bg-amber-700 text-white"
                                      : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {p.position}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-bold text-slate-700">
                            {p.name}
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-slate-700 tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {formatTime(p.finishTimeMs)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span
                              className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                                p.finishStatus === "placed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {p.finishStatus === "placed" ? "Finished" : "DNF"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Hourglass className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-700 text-lg mb-1">
                Under Review
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                This race is currently under review. Results will be available
                soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
