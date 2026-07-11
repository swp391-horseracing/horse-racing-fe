import { useState, useMemo } from "react";
import {
  ShieldCheck,
  ShieldX,
  Play,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Activity,
  LogOut,
} from "lucide-react";
import { type MockRace } from "../../types/referee";
import { cn } from "../../lib/utils";
import { formatStatus } from "../../utils/formatters";

interface PreRaceInspectionPanelProps {
  race: MockRace;
  carryWeight: number | null;
  onClearLane: (laneId: string) => void;
  onFailLane: (
    laneId: string,
    status: "disqualified" | "withdrawn",
    category: string,
    notes: string
  ) => void;
  onTransitionToLive: () => void;
  onToggleCheckIn: (checkedIn: boolean) => void;
  preRaceWithdrawReasons: string[];
  preRaceDisqualifyReasons: string[];
}

type Step = "attendance" | "inspection" | "ready";

const healthStatusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  healthy: {
    label: "Healthy",
    color: "text-emerald-700",
    bg: "bg-emerald-100 border-emerald-200",
  },
  injured: {
    label: "Injured",
    color: "text-red-700",
    bg: "bg-red-100 border-red-200",
  },
  sick: {
    label: "Sick",
    color: "text-orange-700",
    bg: "bg-orange-100 border-orange-200",
  },
  rest: {
    label: "Rest",
    color: "text-amber-700",
    bg: "bg-amber-100 border-amber-200",
  },
};

function getHealthConfig(status: string | null | undefined) {
  return (
    healthStatusConfig[status ?? ""] ?? {
      label: "Unknown",
      color: "text-slate-500",
      bg: "bg-slate-100 border-slate-200",
    }
  );
}

export default function PreRaceInspectionPanel({
  race,
  carryWeight,
  onClearLane,
  onFailLane,
  onTransitionToLive,
  onToggleCheckIn,
  preRaceWithdrawReasons,
  preRaceDisqualifyReasons,
}: PreRaceInspectionPanelProps) {
  const [inspectingLaneId, setInspectingLaneId] = useState<string | null>(null);
  const [failReason, setFailReason] = useState<"disqualified" | "withdrawn">(
    "withdrawn"
  );
  const [failCategory, setFailCategory] = useState<string>(
    preRaceWithdrawReasons[0] || "Other"
  );
  const [failNotes, setFailNotes] = useState<string>("");
  const [showCheckInConfirm, setShowCheckInConfirm] = useState(false);

  const isCheckedIn = race.refereeCheckedIn;
  const pendingCount = race.lanes.filter(
    (l) => l.inspectionStatus === "pending"
  ).length;
  const allResolved = pendingCount === 0;

  const activeStep: Step = useMemo(() => {
    if (!isCheckedIn) return "attendance";
    if (!allResolved) return "inspection";
    return "ready";
  }, [isCheckedIn, allResolved]);

  const steps: { key: Step; label: string; icon: typeof UserCheck }[] = [
    { key: "attendance", label: "Confirm Attendance", icon: UserCheck },
    { key: "inspection", label: "Inspect Lanes", icon: ShieldCheck },
    { key: "ready", label: "Ready to Race", icon: Play },
  ];

  const stepIndex = steps.findIndex((s) => s.key === activeStep);

  const handleConfirmFail = () => {
    if (!inspectingLaneId) return;
    onFailLane(inspectingLaneId, failReason, failCategory, failNotes);
    setInspectingLaneId(null);
    setFailNotes("");
  };

  const getClearDisabledReason = (lane: (typeof race.lanes)[0]) => {
    if (lane.healthStatus && lane.healthStatus !== "healthy")
      return "Horse is not fit to race";
    if (
      carryWeight &&
      lane.jockeyWeightKg &&
      Number(lane.jockeyWeightKg) > Number(carryWeight)
    )
      return "Jockey exceeds carry weight limit";
    return null;
  };

  return (
    <>
      {/* Breadcrumb Stepper */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            const isPending = i > stepIndex;
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isDone && "bg-emerald-600 border-emerald-600 text-white",
                      isActive &&
                        "bg-[#064E3B] border-[#064E3B] text-white shadow-lg shadow-[#064E3B]/20",
                      isPending && "bg-white border-slate-300 text-slate-400"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold mt-1.5 whitespace-nowrap",
                      isDone && "text-emerald-700",
                      isActive && "text-[#064E3B]",
                      isPending && "text-slate-400"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 mb-5",
                      isDone ? "bg-emerald-400" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Attendance Confirmation */}
      {activeStep === "attendance" && (
        <div className="rounded-2xl p-4 border flex items-center justify-between transition-all duration-300 bg-amber-50 border-amber-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Referee Check-In Required
              </p>
              <p className="text-[10px] font-semibold mt-0.5 text-amber-700">
                You must check in before inspecting lanes or transitioning to
                live.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCheckInConfirm(true)}
            className="text-[10px] font-bold px-4 py-2 rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-1.5 shadow-sm"
          >
            <UserCheck className="w-3 h-3" /> Check In
          </button>
        </div>
      )}

      {/* Step 1 (done) / Step 2: Inspection Grid */}
      {isCheckedIn && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm transition-all duration-300">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Health & Weight Inspection
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-100/60 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-black uppercase">
                {pendingCount} Pending
              </span>
              <button
                onClick={() => {
                  if (
                    !allResolved ||
                    confirm(
                      "Revoking check-in will lock all further inspections. Continue?"
                    )
                  )
                    onToggleCheckIn(false);
                }}
                className="text-[9px] font-bold text-slate-400 hover:text-red-600 transition flex items-center gap-1"
                title="Revoke check-in"
              >
                <LogOut className="w-3 h-3" /> Revoke
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {race.lanes.map((lane) => {
              const healthCfg = getHealthConfig(lane.healthStatus);
              const weightIssue =
                carryWeight &&
                lane.jockeyWeightKg &&
                Number(lane.jockeyWeightKg) > Number(carryWeight);
              const disableReason = getClearDisabledReason(lane);

              return (
                <div
                  key={lane.id}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    lane.inspectionStatus === "cleared" &&
                      "bg-emerald-50 border-emerald-200",
                    lane.inspectionStatus === "pending" &&
                      "bg-white border-slate-200",
                    (lane.inspectionStatus === "disqualified" ||
                      lane.inspectionStatus === "withdrawn") &&
                      "bg-slate-50 border-slate-200 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase font-label">
                      Lane {lane.laneNumber}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                        lane.inspectionStatus === "cleared" &&
                          "bg-emerald-100 text-emerald-700 border-emerald-200",
                        lane.inspectionStatus === "pending" &&
                          "bg-amber-50 text-amber-900 border-amber-300 font-extrabold",
                        lane.inspectionStatus === "disqualified" &&
                          "bg-red-50 text-red-950 border-red-300 font-extrabold",
                        lane.inspectionStatus === "withdrawn" &&
                          "bg-slate-100 text-slate-500 border-slate-200"
                      )}
                    >
                      {formatStatus(lane.inspectionStatus)}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800">
                    {lane.horseName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {lane.jockeyName}
                  </p>

                  {/* Health Status */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-semibold text-slate-500">
                      Health:
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border",
                        healthCfg.bg,
                        healthCfg.color
                      )}
                    >
                      {healthCfg.label}
                    </span>
                  </div>

                  {/* Weight Info */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <Scale className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-semibold text-slate-500">
                      Jockey:
                    </span>
                    <span className="text-[9px] font-bold text-slate-700">
                      {lane.jockeyWeightKg != null
                        ? `${lane.jockeyWeightKg} kg`
                        : "No data"}
                    </span>
                    {carryWeight != null && (
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded",
                          weightIssue
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {weightIssue ? "Exceeds" : "Within"} limit (
                        {carryWeight} kg)
                      </span>
                    )}
                  </div>

                  {lane.inspectedAt && (
                    <p className="text-[9px] text-slate-400 mt-1 font-label">
                      {new Date(lane.inspectedAt).toLocaleTimeString()}
                    </p>
                  )}
                  {lane.failReason && (
                    <p className="text-[9px] text-red-700 mt-1 font-semibold">
                      {lane.failReason}
                    </p>
                  )}

                  {lane.inspectionStatus === "pending" && (
                    <>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onClearLane(lane.id)}
                          disabled={!!disableReason}
                          title={disableReason ?? ""}
                          className={cn(
                            "flex-1 text-[10px] font-bold px-2 py-1.5 rounded-lg transition flex items-center justify-center gap-1",
                            disableReason
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                        >
                          <ShieldCheck className="w-3 h-3" /> Clear
                        </button>
                        <button
                          onClick={() => {
                            setInspectingLaneId(lane.id);
                            setFailReason("withdrawn");
                            setFailCategory(
                              preRaceWithdrawReasons[0] || "Other"
                            );
                            setFailNotes("");
                          }}
                          className="flex-1 text-[10px] font-bold px-2 py-1.5 rounded-lg transition flex items-center justify-center gap-1 bg-red-700 text-white hover:bg-red-850"
                        >
                          <ShieldX className="w-3 h-3" /> Fail
                        </button>
                      </div>
                      {disableReason && (
                        <p className="text-[9px] text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {disableReason}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Ready */}
      {activeStep === "ready" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  All Lanes Inspected
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                  {
                    race.lanes.filter((l) => l.inspectionStatus === "cleared")
                      .length
                  }{" "}
                  cleared
                  {carryWeight != null && ` • ${carryWeight} kg weight limit`}
                </p>
              </div>
            </div>
            <button
              onClick={onTransitionToLive}
              className="text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm bg-[#064E3B] text-white hover:bg-[#043E2F]"
            >
              <Play className="w-4 h-4" /> Transition to Live
            </button>
          </div>
        </div>
      )}

      {/* Check-In Confirmation Modal */}
      {showCheckInConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowCheckInConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold font-headline text-[#064E3B] text-lg">
              Confirm Referee Check-In
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              By checking in, you confirm that you are present at the venue and
              ready to officiate this race. This action enables all inspection
              controls.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCheckInConfirm(false)}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onToggleCheckIn(true);
                  setShowCheckInConfirm(false);
                }}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" /> Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Inspection Modal */}
      {inspectingLaneId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setInspectingLaneId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold font-headline text-[#064E3B] text-lg">
              Fail Inspection
            </h3>
            <p className="text-xs text-slate-500">
              Choose the scratch/disqualification details below.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Status
                </label>
                <div className="flex gap-2">
                  {(["withdrawn", "disqualified"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setFailReason(status);
                        setFailCategory(
                          status === "withdrawn"
                            ? preRaceWithdrawReasons[0] || "Other"
                            : preRaceDisqualifyReasons[0] || "Other"
                        );
                      }}
                      className={cn(
                        "flex-1 text-xs font-bold py-2 rounded-lg border transition capitalize",
                        failReason === status
                          ? "border-red-300 bg-red-50 text-red-800 font-extrabold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {formatStatus(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Reason Category
                </label>
                <select
                  value={failCategory}
                  onChange={(e) => setFailCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                >
                  {(failReason === "withdrawn"
                    ? preRaceWithdrawReasons
                    : preRaceDisqualifyReasons
                  ).map((reason: string) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                  placeholder="Additional details (e.g., vet report, weight details)..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setInspectingLaneId(null)}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFail}
                className="flex-1 text-xs font-bold px-3 py-2 rounded-lg bg-red-700 text-white hover:bg-red-850 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
