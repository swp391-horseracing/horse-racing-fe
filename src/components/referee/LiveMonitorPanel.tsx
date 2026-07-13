import { useState } from "react";
import {
  Pause,
  Play,
  Flag,
  Activity,
  CircleAlert,
  AlertTriangle,
} from "lucide-react";
import {
  type MockRace,
  type Violation,
  type ViolationTypeConfig,
} from "../../types/referee";
import { cn } from "../../lib/utils";

const SEVERITY_OPTIONS = [
  { value: "warning", label: "Warning" },
  { value: "point_deduction", label: "Point Deduction" },
  { value: "disqualification", label: "Disqualification" },
  { value: "result_cancellation", label: "Result Cancellation" },
];

interface LiveMonitorPanelProps {
  race: MockRace;
  allViolations: (Violation & { horseName: string; laneNumber: number })[];
  onDelayRace: () => void;
  onResumeRace: () => void;
  onEndRace: () => void;
  onLogViolation: (
    laneId: string,
    violationTypeConfigId: string,
    severity: string,
    note: string
  ) => void;
  violationTypeConfigs: ViolationTypeConfig[];
}

export default function LiveMonitorPanel({
  race,
  allViolations,
  onDelayRace,
  onResumeRace,
  onEndRace,
  onLogViolation,
  violationTypeConfigs,
}: LiveMonitorPanelProps) {
  const [violationLaneId, setViolationLaneId] = useState<string | null>(null);
  const [violationConfigId, setViolationConfigId] = useState<string>(
    violationTypeConfigs[0]?.id || ""
  );
  const [violationSeverity, setViolationSeverity] = useState<string>(
    SEVERITY_OPTIONS[0].value
  );
  const [violationNote, setViolationNote] = useState("");

  const activeLanes = race.lanes.filter(
    (l) => l.inspectionStatus === "cleared"
  );

  const handleConfirmViolation = () => {
    if (!violationLaneId || !violationConfigId) return;
    onLogViolation(
      violationLaneId,
      violationConfigId,
      violationSeverity,
      violationNote
    );
    setViolationLaneId(null);
    setViolationConfigId(violationTypeConfigs[0]?.id || "");
    setViolationSeverity(SEVERITY_OPTIONS[0].value);
    setViolationNote("");
  };

  return (
    <>
      {/* Controls */}
      <div className="flex items-center gap-3">
        {race.timerRunning ? (
          <button
            onClick={onDelayRace}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition flex items-center gap-2 shadow-sm"
          >
            <Pause className="w-3.5 h-3.5" /> Delay Race
          </button>
        ) : (
          <button
            onClick={onResumeRace}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5" /> Resume
          </button>
        )}
        <button
          onClick={onEndRace}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-850 transition flex items-center gap-2 shadow-sm"
        >
          <Flag className="w-3.5 h-3.5" /> End Race
        </button>
      </div>

      {/* Active Lanes Grid */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Activity className="w-4 h-4" /> Active Track Lanes
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeLanes.map((lane) => (
            <div
              key={lane.id}
              className={cn(
                "rounded-xl border p-4 bg-white border-slate-200 relative transition-colors duration-300",
                lane.violations.length > 0 &&
                  "border-orange-600/40 bg-orange-50/5"
              )}
            >
              {lane.violations.length > 0 && (
                <div className="absolute top-2 right-2">
                  <CircleAlert className="w-4 h-4 text-orange-600" />
                </div>
              )}
              <span className="text-[10px] font-black text-slate-400 uppercase font-label">
                Lane {lane.laneNumber}
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {lane.horseName}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                {lane.jockeyName}
              </p>
              {lane.violations.length > 0 && (
                <p className="text-[9px] text-orange-900 font-black mt-1">
                  {lane.violations.length} violation(s)
                </p>
              )}
              <button
                onClick={() => {
                  setViolationLaneId(lane.id);
                  setViolationConfigId(violationTypeConfigs[0]?.id || "");
                  setViolationSeverity(SEVERITY_OPTIONS[0].value);
                  setViolationNote("");
                }}
                className="mt-3 w-full text-[10px] font-bold bg-orange-600 text-white px-2 py-1.5 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-1"
              >
                <Flag className="w-3 h-3" /> Log Violation
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Ledger */}
      {allViolations.length > 0 && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-600" /> Incident
            Ledger
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
                    {v.violationType}
                    {v.note ? ` • ${v.note}` : ""}
                  </p>
                </div>
                <span className="text-[9px] font-label font-bold text-orange-700">
                  {new Date(v.occurredAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Violation Modal */}
      {violationLaneId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setViolationLaneId(null)}
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
                  Violation Type
                </label>
                <select
                  value={violationConfigId}
                  onChange={(e) => setViolationConfigId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                >
                  {violationTypeConfigs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.violationType} ({c.pointsDeducted} pts)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Severity
                </label>
                <select
                  value={violationSeverity}
                  onChange={(e) => setViolationSeverity(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={violationNote}
                  onChange={(e) => setViolationNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                  placeholder="Additional details..."
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViolationLaneId(null)}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmViolation}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                Save Violation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
