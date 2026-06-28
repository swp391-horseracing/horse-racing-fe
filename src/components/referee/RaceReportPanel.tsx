import { useState } from "react";
import {
  Trophy,
  AlertTriangle,
  FileText,
  Save,
  Send,
  CheckCircle,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  ShieldAlert,
} from "lucide-react";
import type {
  MockRace,
  LaneEntry,
  Violation,
  ViolationCategory,
} from "../../types/referee";
import { cn } from "../../lib/utils";

interface RaceReportPanelProps {
  race: MockRace;
  activeLanes: LaneEntry[];
  allViolations: (Violation & {
    laneId: string;
    horseName: string;
    laneNumber: number;
  })[];
  onEditResults: () => void;
  onUpdateReportNotes: (notes: string) => void;
  onSaveReportDraft: () => void;
  onSubmitReport: () => void;
  onUpdateViolation: (
    laneId: string,
    violationId: string,
    violationType: ViolationCategory,
    note: string
  ) => Promise<void>;
  onDeleteViolation: (laneId: string, violationId: string) => Promise<void>;
  onToggleAdminLock: (unlocked: boolean) => void;
  violationCategories: ViolationCategory[];
}

export default function RaceReportPanel({
  race,
  activeLanes,
  allViolations,
  onEditResults,
  onUpdateReportNotes,
  onSaveReportDraft,
  onSubmitReport,
  onUpdateViolation,
  onDeleteViolation,
  onToggleAdminLock,
  violationCategories,
}: RaceReportPanelProps) {
  const [editingViolation, setEditingViolation] = useState<
    | (Violation & { laneId: string; horseName: string; laneNumber: number })
    | null
  >(null);
  const [editType, setEditType] = useState<ViolationCategory>(
    violationCategories[0]
  );
  const [editNote, setEditNote] = useState("");

  const openEditModal = (
    v: Violation & { laneId: string; horseName: string; laneNumber: number }
  ) => {
    const matchedType = violationCategories.find(
      (category) => category === v.violationType
    );

    setEditingViolation(v);
    if (matchedType) {
      setEditType(matchedType);
    }
    setEditNote(v.note);
  };

  const handleSaveEdit = async () => {
    if (!editingViolation) return;
    try {
      await onUpdateViolation(
        editingViolation.laneId,
        editingViolation.id,
        editType,
        editNote
      );
      setEditingViolation(null);
    } catch {
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingViolation) return;
    if (!confirm("Are you sure you want to delete this violation record?"))
      return;
    try {
      await onDeleteViolation(editingViolation.laneId, editingViolation.id);
      setEditingViolation(null);
    } catch {
    }
  };

  return (
    <div className="space-y-6">
      {race.reportSubmitted && !race.adminUnlocked && (
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

      {race.reportSubmitted && race.adminUnlocked && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h3 className="font-headline font-black text-amber-900 text-lg">
            Recheck & Correction Requested
          </h3>
          <p className="text-xs text-amber-700 font-semibold mt-1">
            The administrator has unlocked this report for editing. Please
            review and correct any issues, then re-submit.
          </p>
        </div>
      )}

      {/* Admin Simulator */}
      {race.reportSubmitted && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Admin Simulator
              </p>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                Toggle the lock state to simulate admin sending results back for
                correction.
              </p>
            </div>
            <button
              onClick={() => onToggleAdminLock(!race.adminUnlocked)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase border transition-all duration-300 cursor-pointer",
                race.adminUnlocked
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
              )}
            >
              {race.adminUnlocked ? (
                <>
                  <Unlock className="w-4 h-4" /> Unlocked (Edit Mode)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Locked (Submitted)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Results Summary
          </h3>
          {(!race.reportSubmitted || race.adminUnlocked) && (
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
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-orange-900">
                    Lane {v.laneNumber} — {v.horseName}
                  </p>
                  <p className="text-[10px] text-orange-900 mt-0.5">
                    {v.violationType}
                    {v.note ? ` • ${v.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-[9px] font-label font-bold text-orange-700">
                    {new Date(v.occurredAt).toLocaleTimeString()}
                  </span>
                  {(!race.reportSubmitted || race.adminUnlocked) && (
                    <button
                      onClick={() => openEditModal(v)}
                      className="text-[9px] font-bold px-2 py-1 rounded-md border border-orange-300 text-orange-700 hover:bg-orange-100 transition flex items-center gap-1"
                    >
                      <Pencil className="w-2.5 h-2.5" /> Edit
                    </button>
                  )}
                </div>
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
          disabled={race.reportSubmitted && !race.adminUnlocked}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 disabled:bg-slate-50 disabled:text-slate-400"
          placeholder="Enter overarching track notes (e.g., weather conditions, track state changes)..."
        />
      </div>

      {/* Actions */}
      {(!race.reportSubmitted || race.adminUnlocked) && (
        <div className="flex justify-end gap-3">
          {!race.reportSubmitted && (
            <button
              onClick={onSaveReportDraft}
              className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Save as Draft
            </button>
          )}
          <button
            onClick={onSubmitReport}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />{" "}
            {race.adminUnlocked
              ? "Sign and Re-Submit Report"
              : "Sign and Submit Report"}
          </button>
        </div>
      )}

      {/* Edit Violation Modal */}
      {editingViolation && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setEditingViolation(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold font-headline text-[#064E3B] text-lg">
              Edit Violation
            </h3>
            <p className="text-xs text-slate-500">
              Lane {editingViolation.laneNumber} — {editingViolation.horseName}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={editType}
                  onChange={(e) =>
                    setEditType(e.target.value as ViolationCategory)
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                >
                  {violationCategories.map((cat: ViolationCategory) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Notes
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDeleteFromModal}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setEditingViolation(null)}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
