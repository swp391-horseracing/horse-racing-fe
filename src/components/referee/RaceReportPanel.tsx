import {
  Trophy,
  AlertTriangle,
  FileText,
  Save,
  Send,
  CheckCircle,
} from "lucide-react";
import type { MockRace, LaneEntry, Violation } from "../../types/referee";
import { cn } from "../../lib/utils";

interface RaceReportPanelProps {
  race: MockRace;
  activeLanes: LaneEntry[];
  allViolations: (Violation & { horseName: string; laneNumber: number })[];
  onEditResults: () => void;
  onUpdateReportNotes: (notes: string) => void;
  onSaveReportDraft: () => void;
  onSubmitReport: () => void;
}

export default function RaceReportPanel({
  race,
  activeLanes,
  allViolations,
  onEditResults,
  onUpdateReportNotes,
  onSaveReportDraft,
  onSubmitReport,
}: RaceReportPanelProps) {
  return (
    <div className="space-y-6">
      {race.reportSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-headline font-black text-emerald-800 text-lg">
            Report Submitted
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Your track duties for this race are complete.
          </p>
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Results Summary
          </h3>
          {!race.reportSubmitted && (
            <button
              onClick={onEditResults}
              className="text-[10px] font-black uppercase text-[#064E3B] hover:text-white bg-[#064E3B]/5 hover:bg-[#064E3B] px-3 py-1.5 rounded-lg border border-[#064E3B]/20 transition flex items-center gap-1 cursor-pointer"
            >
              Edit Results
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Pos
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Horse
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Jockey
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Time
                </th>
                <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                  Flag
                </th>
              </tr>
            </thead>
            <tbody>
              {[...activeLanes]
                .sort(
                  (a, b) =>
                    (a.finishPosition ?? 999) - (b.finishPosition ?? 999)
                )
                .map((lane) => (
                  <tr
                    key={lane.id}
                    className={cn(
                      "border-b border-slate-50",
                      lane.flag && "opacity-50"
                    )}
                  >
                    <td className="py-2.5 px-3 font-label font-bold text-slate-500">
                      {lane.flag ? "—" : `#${lane.finishPosition}`}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {lane.horseName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {lane.jockeyName}
                    </td>
                    <td className="py-2.5 px-3 font-label font-bold text-slate-600">
                      {lane.finishTime || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      {lane.flag && (
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                            lane.flag === "dnf"
                              ? "bg-slate-100 text-slate-500 border-slate-200"
                              : "bg-red-50 text-red-700 border-red-200 font-bold"
                          )}
                        >
                          {lane.flag}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violations Summary */}
      {allViolations.length > 0 && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-600" /> Track
            Violations ({allViolations.length})
          </h3>
          <div className="space-y-2">
            {allViolations.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-orange-50/40 border border-orange-200/80 rounded-xl text-xs text-orange-950"
              >
                <div>
                  <p className="font-bold text-orange-900">
                    Lane {v.laneNumber} — {v.horseName}
                  </p>
                  <p className="text-[10px] text-orange-900 mt-0.5">
                    {v.category}
                    {v.notes ? ` • ${v.notes}` : ""}
                  </p>
                </div>
                <span className="text-[9px] font-label font-bold text-orange-700">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track Notes */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4" /> Track Notes
        </h3>
        <textarea
          value={race.reportNotes}
          onChange={(e) => onUpdateReportNotes(e.target.value)}
          disabled={race.reportSubmitted}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 disabled:bg-slate-50 disabled:text-slate-400"
          placeholder="Enter overarching track notes (e.g., weather conditions, track state changes)..."
        />
      </div>

      {/* Actions */}
      {!race.reportSubmitted && (
        <div className="flex justify-end gap-3">
          <button
            onClick={onSaveReportDraft}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save as Draft
          </button>
          <button
            onClick={onSubmitReport}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Sign and Submit Report
          </button>
        </div>
      )}
    </div>
  );
}
