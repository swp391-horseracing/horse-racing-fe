import { useState, useCallback } from "react";
import {
  Trophy,
  AlertTriangle,
  FileText,
  Save,
  Send,
  CheckCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  MockRace,
  LaneEntry,
  Violation,
  ViolationCategory,
} from "../../types/referee";
import { cn } from "../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface RaceReportPanelProps {
  race: MockRace;
  activeLanes: LaneEntry[];
  allViolations: (Violation & {
    laneId: string;
    horseName: string;
    laneNumber: number;
  })[];
  onSetPlacement: (laneId: string, position: number | null) => void;
  onSetFinishTime: (laneId: string, time: string) => void;
  onSetFlag: (laneId: string, flag: "dnf" | "dsq" | null) => void;
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
  onCreateViolation: (
    laneId: string,
    violationType: ViolationCategory,
    note: string
  ) => Promise<void>;
  violationCategories: ViolationCategory[];
}

function parseAndFormatTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return trimmed;
    const minVal = parseInt(parts[0], 10);
    if (isNaN(minVal) || minVal < 0) return trimmed;
    let secWhole: number;
    let secFraction = "";
    if (parts[1].includes(".")) {
      const secParts = parts[1].split(".");
      secWhole = parseInt(secParts[0], 10);
      secFraction = secParts[1] || "";
    } else {
      secWhole = parseInt(parts[1], 10);
    }
    if (isNaN(secWhole) || secWhole < 0 || secWhole >= 60) return trimmed;
    const formattedSec = String(secWhole).padStart(2, "0");
    if (secFraction) {
      return `${minVal}:${formattedSec}.${secFraction.padEnd(2, "0")}`;
    }
    return `${minVal}:${formattedSec}`;
  }
  const numVal = parseFloat(trimmed);
  if (isNaN(numVal) || numVal < 0) return trimmed;
  const totalSeconds = Math.floor(numVal);
  const fraction = numVal - totalSeconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSec = String(seconds).padStart(2, "0");
  if (fraction > 0) {
    const fracStr = fraction.toFixed(2).substring(2);
    return `${minutes}:${formattedSec}.${fracStr}`;
  }
  return `${minutes}:${formattedSec}`;
}

function isValidTimeFormat(time: string): boolean {
  return /^\d+:\d{2}(\.\d+)?$/.test(time);
}

function timeToSeconds(time: string): number {
  const match = time.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (!match) return Infinity;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const fraction = match[3] ? parseFloat(match[3]) : 0;
  return minutes * 60 + seconds + fraction;
}

interface ValidationError {
  field: string;
  laneId: string;
  message: string;
}

function validateResults(lanes: LaneEntry[]): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const active = lanes.filter(
    (l) => l.inspectionStatus === "cleared" && !l.flag
  );
  for (const lane of active) {
    if (!lane.finishPosition) {
      errors.push({
        field: "position",
        laneId: lane.id,
        message: `Lane ${lane.laneNumber} (${lane.horseName}) is missing a position.`,
      });
    }
    if (!lane.finishTime) {
      errors.push({
        field: "time",
        laneId: lane.id,
        message: `Lane ${lane.laneNumber} (${lane.horseName}) is missing a finish time.`,
      });
    } else if (!isValidTimeFormat(lane.finishTime)) {
      errors.push({
        field: "time",
        laneId: lane.id,
        message: `Lane ${lane.laneNumber} (${lane.horseName}) has an invalid time format. Use m:ss or m:ss.xx.`,
      });
    }
  }
  if (errors.length > 0) return { valid: false, errors };
  const positions = active.map((l) => l.finishPosition!).sort((a, b) => a - b);
  if (positions[0] !== 1) {
    errors.push({
      field: "position",
      laneId: "",
      message: "Positions must start at #1.",
    });
  }
  const uniquePositions = new Set(positions);
  if (uniquePositions.size !== positions.length) {
    errors.push({
      field: "position",
      laneId: "",
      message:
        "Each entry must have a unique position. Duplicate positions are not allowed.",
    });
  }
  if (errors.length === 0) {
    const byPosition = new Map<number, LaneEntry[]>();
    for (const lane of active) {
      const pos = lane.finishPosition!;
      if (!byPosition.has(pos)) byPosition.set(pos, []);
      byPosition.get(pos)!.push(lane);
    }
    const sortedGroups = [...byPosition.entries()].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < sortedGroups.length - 1; i++) {
      const [posA, groupA] = sortedGroups[i];
      const [posB, groupB] = sortedGroups[i + 1];
      const worstTimeA = Math.max(
        ...groupA.map((l) => timeToSeconds(l.finishTime))
      );
      const bestTimeB = Math.min(
        ...groupB.map((l) => timeToSeconds(l.finishTime))
      );
      if (worstTimeA > bestTimeB) {
        errors.push({
          field: "time",
          laneId: "",
          message: `Time inconsistency: #${posA} must have a faster time than #${posB}.`,
        });
      } else if (worstTimeA === bestTimeB) {
        errors.push({
          field: "time",
          laneId: "",
          message: `#${posA} and #${posB} have the same finish time.`,
        });
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export default function RaceReportPanel({
  race,
  activeLanes,
  allViolations,
  onSetPlacement,
  onSetFinishTime,
  onSetFlag,
  onUpdateReportNotes,
  onSaveReportDraft,
  onSubmitReport,
  onUpdateViolation,
  onDeleteViolation,
  onCreateViolation,
  violationCategories,
}: RaceReportPanelProps) {
  const isEditable = race.reportStatus === "draft";

  const [editingViolation, setEditingViolation] = useState<
    | (Violation & { laneId: string; horseName: string; laneNumber: number })
    | null
  >(null);
  const [addingViolation, setAddingViolation] = useState(false);
  const [newViolationLaneId, setNewViolationLaneId] = useState("");
  const [editType, setEditType] = useState<ViolationCategory>(
    violationCategories[0]
  );
  const [editNote, setEditNote] = useState("");
  const [isViolationMutationPending, setIsViolationMutationPending] =
    useState(false);
  const [blurredFields, setBlurredFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  const markBlurred = useCallback((key: string) => {
    setBlurredFields((prev) => new Set(prev).add(key));
  }, []);

  const allPositions = Array.from(
    { length: activeLanes.length },
    (_, i) => i + 1
  );
  const positionTakenByOther = (laneId: string, pos: number) =>
    activeLanes.some((l) => l.id !== laneId && l.finishPosition === pos);

  const handleTimeBlur = (laneId: string, rawValue: string) => {
    const formatted = parseAndFormatTime(rawValue);
    if (formatted !== rawValue) {
      onSetFinishTime(laneId, formatted);
    }
    markBlurred(`time-${laneId}`);
  };

  const handleSubmit = () => {
    const cleared = race.lanes.filter((l) => l.inspectionStatus === "cleared");
    const result = validateResults(cleared);
    setValidationErrors(result.errors);
    if (result.valid) {
      onSubmitReport();
    }
  };

  const hasFieldError = (field: string, laneId: string) =>
    validationErrors.some((e) => e.field === field && e.laneId === laneId);

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
    if (!editingViolation || isViolationMutationPending) return;
    try {
      setIsViolationMutationPending(true);
      await onUpdateViolation(
        editingViolation.laneId,
        editingViolation.id,
        editType,
        editNote
      );
      setEditingViolation(null);
    } catch {
      // Keep modal open so user doesn't lose input on failure
    } finally {
      setIsViolationMutationPending(false);
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingViolation || isViolationMutationPending) return;
    if (!confirm("Are you sure you want to delete this violation record?"))
      return;
    try {
      setIsViolationMutationPending(true);
      await onDeleteViolation(editingViolation.laneId, editingViolation.id);
      setEditingViolation(null);
    } catch {
      // Keep modal open on deletion failure
    } finally {
      setIsViolationMutationPending(false);
    }
  };

  const sortedLanes = isEditable
    ? race.lanes.filter((l) => l.inspectionStatus === "cleared")
    : [...activeLanes].sort(
        (a, b) => (a.finishPosition ?? 999) - (b.finishPosition ?? 999)
      );

  return (
    <div className="space-y-6">
      {!isEditable && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-headline font-black text-emerald-800 text-lg">
            Report Finalized
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            The race result has been published and is now final.
          </p>
        </div>
      )}

      {/* Results & Placement Entry */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Results
          </h3>
          {!isEditable && (
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              Finalized
            </span>
          )}
        </div>

        {isEditable ? (
          <>
            <p className="text-[10px] text-slate-400 font-semibold mb-4">
              Enter placement and finish time for each active lane. Time can be
              entered as total seconds (e.g. "95" → 1:35) or as m:ss. Flag
              runners as DNF/DSQ if applicable.
            </p>
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
                  {sortedLanes.map((lane) => (
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
                        <Select
                          value={lane.finishPosition?.toString() ?? ""}
                          onValueChange={(val) =>
                            onSetPlacement(
                              lane.id,
                              val ? parseInt(val, 10) : null
                            )
                          }
                          disabled={!!lane.flag}
                          onOpenChange={(open) => {
                            if (!open) markBlurred(`pos-${lane.id}`);
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-16 border rounded-lg px-2 py-1 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20",
                              !lane.finishPosition &&
                                !lane.flag &&
                                blurredFields.has(`pos-${lane.id}`)
                                ? "border-red-400 bg-red-50/50"
                                : hasFieldError("position", lane.id)
                                  ? "border-red-400 bg-red-50/50"
                                  : "border-slate-200"
                            )}
                          >
                            <SelectValue placeholder="#" />
                          </SelectTrigger>
                          <SelectContent>
                            {allPositions
                              .filter(
                                (pos) =>
                                  pos === lane.finishPosition ||
                                  !positionTakenByOther(lane.id, pos)
                              )
                              .map((pos) => (
                                <SelectItem key={pos} value={pos.toString()}>
                                  {pos}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={lane.finishTime}
                          onChange={(e) =>
                            onSetFinishTime(lane.id, e.target.value)
                          }
                          onBlur={(e) =>
                            handleTimeBlur(lane.id, e.target.value)
                          }
                          disabled={!!lane.flag}
                          className={cn(
                            "w-28 border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20",
                            blurredFields.has(`time-${lane.id}`) &&
                              lane.finishTime &&
                              !isValidTimeFormat(lane.finishTime)
                              ? "border-red-400 bg-red-50/50"
                              : !lane.finishTime &&
                                  !lane.flag &&
                                  blurredFields.has(`time-${lane.id}`)
                                ? "border-red-400 bg-red-50/50"
                                : hasFieldError("time", lane.id)
                                  ? "border-red-400 bg-red-50/50"
                                  : "border-slate-200"
                          )}
                          placeholder="ss or m:ss"
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
          </>
        ) : (
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
                {sortedLanes.map((lane) => (
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
        )}
      </div>

      {/* Validation Errors */}
      {isEditable && validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Validation Errors
          </p>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-[10px] text-red-700 font-semibold pl-5">
              • {err.message}
            </p>
          ))}
        </div>
      )}

      {/* Violations Summary */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" /> Track
            Violations ({allViolations.length})
          </h3>
          {isEditable && (
            <button
              onClick={() => {
                setAddingViolation(true);
                setEditType(violationCategories[0]);
                setEditNote("");
                setNewViolationLaneId(
                  race.lanes.find((l) => l.inspectionStatus === "cleared")
                    ?.id ?? ""
                );
              }}
              className="text-[10px] font-black uppercase text-orange-700 hover:text-white bg-orange-50 hover:bg-orange-600 px-3 py-1.5 rounded-lg border border-orange-300 transition flex items-center gap-1 cursor-pointer"
            >
              + Add Violation
            </button>
          )}
        </div>
        {allViolations.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No violations logged.
          </p>
        ) : (
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
                  {isEditable && (
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
        )}
      </div>

      {/* Track Notes */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4" /> Track Notes
        </h3>
        <textarea
          value={race.reportNotes}
          onChange={(e) => onUpdateReportNotes(e.target.value)}
          disabled={!isEditable}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 disabled:bg-slate-50 disabled:text-slate-400"
          placeholder="Enter overarching track notes (e.g., weather conditions, track state changes)..."
        />
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="flex justify-end gap-3">
          <button
            onClick={onSaveReportDraft}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save as Draft
          </button>
          <button
            onClick={handleSubmit}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Sign and Submit Report
          </button>
        </div>
      )}

      {/* Add Violation Modal */}
      {addingViolation && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() =>
            !isViolationMutationPending && setAddingViolation(false)
          }
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold font-headline text-[#064E3B] text-lg">
              Log Violation
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Lane
                </label>
                <select
                  value={newViolationLaneId}
                  onChange={(e) => setNewViolationLaneId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                >
                  {race.lanes
                    .filter(
                      (l) =>
                        l.inspectionStatus === "cleared" ||
                        l.inspectionStatus === "pending"
                    )
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        Lane {l.laneNumber} — {l.horseName}
                      </option>
                    ))}
                </select>
              </div>

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

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setAddingViolation(false)}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newViolationLaneId) return;
                  setIsViolationMutationPending(true);
                  try {
                    await onCreateViolation(
                      newViolationLaneId,
                      editType,
                      editNote
                    );
                    setAddingViolation(false);
                  } catch {
                    // Keep modal open on failure
                  } finally {
                    setIsViolationMutationPending(false);
                  }
                }}
                disabled={isViolationMutationPending || !newViolationLaneId}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log Violation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Violation Modal */}
      {editingViolation && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() =>
            !isViolationMutationPending && setEditingViolation(null)
          }
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
                disabled={isViolationMutationPending}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <div className="flex-1" />
              <button
                onClick={() =>
                  !isViolationMutationPending && setEditingViolation(null)
                }
                disabled={isViolationMutationPending}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isViolationMutationPending}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
