import { Trophy, CheckCircle } from "lucide-react";
import type { MockRace, LaneEntry } from "./types";
import { cn } from "../../lib/utils";

interface ConfirmResultsPanelProps {
  race: MockRace;
  activeLanes: LaneEntry[];
  onSetPlacement: (laneId: string, position: number | null) => void;
  onSetFinishTime: (laneId: string, time: string) => void;
  onSetFlag: (laneId: string, flag: "dnf" | "dsq" | null) => void;
  onConfirmResults: () => void;
}

export default function ConfirmResultsPanel({
  race,
  activeLanes,
  onSetPlacement,
  onSetFinishTime,
  onSetFlag,
  onConfirmResults,
}: ConfirmResultsPanelProps) {
  return (
    <>
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Confirm Finish Order
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Enter placement and finish time for each active lane. Flag runners
            as DNF/DSQ if applicable.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Lane
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Horse
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Jockey
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Position
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Finish Time
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Flag
                </th>
              </tr>
            </thead>
            <tbody>
              {race.lanes
                .filter((l) => l.inspectionStatus === "cleared")
                .map((lane) => (
                  <tr
                    key={lane.id}
                    className={cn(
                      "border-b border-slate-50 transition",
                      lane.flag && "opacity-50 bg-slate-50"
                    )}
                  >
                    <td className="py-2.5 px-3 font-label font-bold text-slate-500">
                      {lane.laneNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {lane.horseName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {lane.jockeyName}
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={1}
                        max={activeLanes.length}
                        value={lane.finishPosition ?? ""}
                        onChange={(e) =>
                          onSetPlacement(
                            lane.id,
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        disabled={!!lane.flag}
                        className={cn(
                          "w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20",
                          !lane.finishPosition &&
                            !lane.flag &&
                            "border-red-300 bg-red-50/50"
                        )}
                        placeholder="#"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={lane.finishTime}
                        onChange={(e) =>
                          onSetFinishTime(lane.id, e.target.value)
                        }
                        disabled={!!lane.flag}
                        className={cn(
                          "w-24 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20",
                          !lane.finishTime &&
                            !lane.flag &&
                            "border-red-300 bg-red-50/50"
                        )}
                        placeholder="mm:ss.ms"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={lane.flag ?? ""}
                        onChange={(e) =>
                          onSetFlag(
                            lane.id,
                            (e.target.value || null) as "dnf" | "dsq" | null
                          )
                        }
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                      >
                        <option value="">—</option>
                        <option value="dnf">DNF</option>
                        <option value="dsq">DSQ</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onConfirmResults}
          className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm"
        >
          <CheckCircle className="w-4 h-4" /> Confirm Preliminary Results
        </button>
      </div>
    </>
  );
}
