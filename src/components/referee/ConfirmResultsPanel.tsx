import { useState, useCallback } from "react";
import { Trophy, CheckCircle, AlertCircle } from "lucide-react";
import type { MockRace, LaneEntry } from "../../types/referee";
import { cn } from "../../lib/utils";

interface ConfirmResultsPanelProps {
  race: MockRace;
  activeLanes: LaneEntry[];
  onSetPlacement: (laneId: string, position: number | null) => void;
  onSetFinishTime: (laneId: string, time: string) => void;
  onSetFlag: (laneId: string, flag: "dnf" | "dsq" | null) => void;
  onConfirmResults: () => void;
}

// ─── Time Parsing Helpers ─────────────────────────────────────────────────────

/**
 * Parses time input into a normalized "m:ss" or "m:ss.xx" format.
 * Accepts:
 *  - Pure integers (e.g. "95") → treated as total seconds → "1:35"
 *  - Decimal numbers (e.g. "95.4") → "1:35.40"
 *  - Colon notation (e.g. "1:35", "1:5", "1:35.4") → normalized
 */
function parseAndFormatTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Colon-based format: "m:ss" or "m:ss.xx"
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return trimmed; // leave as-is if malformed

    const minStr = parts[0];
    const secStr = parts[1];

    const minVal = parseInt(minStr, 10);
    if (isNaN(minVal) || minVal < 0) return trimmed;

    // Handle decimal seconds
    let secWhole: number;
    let secFraction = "";
    if (secStr.includes(".")) {
      const secParts = secStr.split(".");
      secWhole = parseInt(secParts[0], 10);
      secFraction = secParts[1] || "";
    } else {
      secWhole = parseInt(secStr, 10);
    }

    if (isNaN(secWhole) || secWhole < 0 || secWhole >= 60) return trimmed;

    const formattedSec = String(secWhole).padStart(2, "0");
    if (secFraction) {
      return `${minVal}:${formattedSec}.${secFraction.padEnd(2, "0")}`;
    }
    return `${minVal}:${formattedSec}`;
  }

  // Pure number: treat as total seconds
  const numVal = parseFloat(trimmed);
  if (isNaN(numVal) || numVal < 0) return trimmed;

  const totalSeconds = Math.floor(numVal);
  const fraction = numVal - totalSeconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSec = String(seconds).padStart(2, "0");

  if (fraction > 0) {
    const fracStr = fraction.toFixed(2).substring(2); // e.g. ".40" -> "40"
    return `${minutes}:${formattedSec}.${fracStr}`;
  }
  return `${minutes}:${formattedSec}`;
}

/**
 * Check if a finish time string is in a valid normalized format.
 */
function isValidTimeFormat(time: string): boolean {
  return /^\d+:\d{2}(\.\d+)?$/.test(time);
}

/**
 * Convert a normalized time string to total seconds for comparison.
 */
function timeToSeconds(time: string): number {
  const match = time.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (!match) return Infinity;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const fraction = match[3] ? parseFloat(match[3]) : 0;
  return minutes * 60 + seconds + fraction;
}

// ─── Validation ───────────────────────────────────────────────────────────────

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

  // 1. Check completeness
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

  // Stop here if basic fields are missing
  if (errors.length > 0) return { valid: false, errors };

  // 2. Dead-heat position ranking validation
  const positions = active.map((l) => l.finishPosition!).sort((a, b) => a - b);

  // Check positions start at 1
  if (positions[0] !== 1) {
    errors.push({
      field: "position",
      laneId: "",
      message: "Positions must start at #1.",
    });
  }

  // Check dead-heat gap rule: if N horses share position P, next position must be P+N
  const positionCounts = new Map<number, number>();
  for (const pos of positions) {
    positionCounts.set(pos, (positionCounts.get(pos) || 0) + 1);
  }

  const sortedPositions = [...positionCounts.keys()].sort((a, b) => a - b);
  let expectedNext = 1;
  for (const pos of sortedPositions) {
    if (pos !== expectedNext) {
      errors.push({
        field: "position",
        laneId: "",
        message: `Position gap error: expected #${expectedNext} but found #${pos}. With dead-heats, positions must skip accordingly (e.g., two #1s → next is #3).`,
      });
      break;
    }
    expectedNext = pos + positionCounts.get(pos)!;
  }

  // 3. Time-position consistency
  if (errors.length === 0) {
    // Group by position
    const byPosition = new Map<number, LaneEntry[]>();
    for (const lane of active) {
      const pos = lane.finishPosition!;
      if (!byPosition.has(pos)) byPosition.set(pos, []);
      byPosition.get(pos)!.push(lane);
    }

    // Horses sharing a position must have the same time
    for (const [pos, group] of byPosition) {
      if (group.length > 1) {
        const times = group.map((l) => timeToSeconds(l.finishTime));
        const allSame = times.every((t) => t === times[0]);
        if (!allSame) {
          errors.push({
            field: "time",
            laneId: "",
            message: `Dead-heat at #${pos}: all horses sharing this position must have identical finish times.`,
          });
        }
      }
    }

    // A better position must have a faster (or equal) time than the next
    const sortedGroups = [...byPosition.entries()].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < sortedGroups.length - 1; i++) {
      const [posA, groupA] = sortedGroups[i];
      const [posB, groupB] = sortedGroups[i + 1];
      const bestTimeA = Math.min(
        ...groupA.map((l) => timeToSeconds(l.finishTime))
      );
      const worstTimeB = Math.max(
        ...groupB.map((l) => timeToSeconds(l.finishTime))
      );
      if (bestTimeA > worstTimeB) {
        errors.push({
          field: "time",
          laneId: "",
          message: `Time inconsistency: #${posA} finishers must have a faster time than #${posB} finishers.`,
        });
      } else if (
        bestTimeA ===
          Math.min(...groupB.map((l) => timeToSeconds(l.finishTime))) &&
        posA !== posB
      ) {
        errors.push({
          field: "time",
          laneId: "",
          message: `#${posA} and #${posB} have the same finish time but different positions. Consider a dead-heat.`,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfirmResultsPanel({
  race,
  activeLanes,
  onSetPlacement,
  onSetFinishTime,
  onSetFlag,
  onConfirmResults,
}: ConfirmResultsPanelProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [blurredFields, setBlurredFields] = useState<Set<string>>(new Set());

  const markBlurred = useCallback((key: string) => {
    setBlurredFields((prev) => new Set(prev).add(key));
  }, []);

  const handleTimeBlur = (laneId: string, rawValue: string) => {
    const formatted = parseAndFormatTime(rawValue);
    if (formatted !== rawValue) {
      onSetFinishTime(laneId, formatted);
    }
    markBlurred(`time-${laneId}`);
  };

  const handleConfirmClick = () => {
    const cleared = race.lanes.filter((l) => l.inspectionStatus === "cleared");
    const result = validateResults(cleared);
    setValidationErrors(result.errors);
    if (result.valid) {
      onConfirmResults();
    }
  };

  const hasFieldError = (field: string, laneId: string) =>
    validationErrors.some(
      (e) => e.field === field && (e.laneId === laneId || e.laneId === "")
    );

  return (
    <>
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Confirm Finish Order
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Enter placement and finish time for each active lane. Time can be
            entered as total seconds (e.g. &quot;95&quot; → 1:35) or as m:ss.
            Flag runners as DNF/DSQ if applicable.
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
                        onBlur={() => markBlurred(`pos-${lane.id}`)}
                        disabled={!!lane.flag}
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
                        onBlur={(e) => handleTimeBlur(lane.id, e.target.value)}
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
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Validation Errors
          </p>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-[10px] text-red-700 font-semibold pl-5">
              • {err.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleConfirmClick}
          className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm"
        >
          <CheckCircle className="w-4 h-4" /> Confirm Preliminary Results
        </button>
      </div>
    </>
  );
}
