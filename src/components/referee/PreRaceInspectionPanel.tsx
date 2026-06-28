import { useState } from "react";
import {
  ShieldCheck,
  ShieldX,
  Play,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { type MockRace } from "../../types/referee";
import { cn } from "../../lib/utils";

interface PreRaceInspectionPanelProps {
  race: MockRace;
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

export default function PreRaceInspectionPanel({
  race,
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
    preRaceWithdrawReasons[0]
  );
  const [failNotes, setFailNotes] = useState<string>("");
  const [showCheckInConfirm, setShowCheckInConfirm] = useState(false);

  const isCheckedIn = race.refereeCheckedIn;
  const allResolved = race.lanes.every((l) => l.inspectionStatus !== "pending");

  const handleConfirmFail = () => {
    if (!inspectingLaneId) return;
    onFailLane(inspectingLaneId, failReason, failCategory, failNotes);
    setInspectingLaneId(null);
    setFailNotes("");
  };

  return (
    <>
      {/* Referee Check-In Banner */}
      <div
        className={cn(
          "rounded-2xl p-4 border flex items-center justify-between transition-all duration-300",
          isCheckedIn
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-300"
        )}
      >
        <div className="flex items-center gap-3">
          {isCheckedIn ? (
            <UserCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-bold",
                isCheckedIn ? "text-emerald-800" : "text-amber-900"
              )}
            >
              {isCheckedIn ? "Referee Checked In" : "Referee Check-In Required"}
            </p>
            <p
              className={cn(
                "text-[10px] font-semibold mt-0.5",
                isCheckedIn ? "text-emerald-600" : "text-amber-700"
              )}
            >
              {isCheckedIn
                ? "You are checked in. Inspection controls are active."
                : "You must check in before inspecting lanes or transitioning to live."}
            </p>
          </div>
        </div>
        {isCheckedIn ? (
          <button
            onClick={() => {
              const hasClearedOrFailed = race.lanes.some(
                (l) => l.inspectionStatus !== "pending"
              );
              if (hasClearedOrFailed) {
                if (
                  !confirm(
                    "Some lanes have already been inspected. Revoking check-in will lock all further inspections. Continue?"
                  )
                )
                  return;
              }
              onToggleCheckIn(false);
            }}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition"
          >
            Revoke Check-In
          </button>
        ) : (
          <button
            onClick={() => setShowCheckInConfirm(true)}
            className="text-[10px] font-bold px-4 py-2 rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-1.5 shadow-sm"
          >
            <UserCheck className="w-3 h-3" /> Check In
          </button>
        )}
      </div>

      {/* Inspection Grid */}
      <div
        className={cn(
          "bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm transition-all duration-300",
          !isCheckedIn && "opacity-60 pointer-events-none select-none"
        )}
      >
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Pre-Race Inspection Grid
          </h3>
          <span className="text-[10px] bg-amber-100/60 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-black uppercase">
            {race.lanes.filter((l) => l.inspectionStatus === "pending").length}{" "}
            Pending
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {race.lanes.map((lane) => (
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
                  {lane.inspectionStatus}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {lane.horseName}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                {lane.jockeyName}
              </p>
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
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onClearLane(lane.id)}
                    disabled={!isCheckedIn}
                    className={cn(
                      "flex-1 text-[10px] font-bold px-2 py-1.5 rounded-lg transition flex items-center justify-center gap-1",
                      isCheckedIn
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <ShieldCheck className="w-3 h-3" /> Clear
                  </button>
                  <button
                    onClick={() => {
                      setInspectingLaneId(lane.id);
                      setFailReason("withdrawn");
                      setFailCategory(preRaceWithdrawReasons[0]);
                      setFailNotes("");
                    }}
                    disabled={!isCheckedIn}
                    className={cn(
                      "flex-1 text-[10px] font-bold px-2 py-1.5 rounded-lg transition flex items-center justify-center gap-1",
                      isCheckedIn
                        ? "bg-red-700 text-white hover:bg-red-850"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <ShieldX className="w-3 h-3" /> Fail
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transition button */}
      <div className="flex justify-end">
        <button
          onClick={onTransitionToLive}
          disabled={!allResolved || !isCheckedIn}
          className={cn(
            "text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm",
            allResolved && isCheckedIn
              ? "bg-[#064E3B] text-white hover:bg-[#043E2F]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          <Play className="w-4 h-4" /> Transition to Live
        </button>
      </div>

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
              {/* Status choice */}
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
                            ? preRaceWithdrawReasons[0]
                            : preRaceDisqualifyReasons[0]
                        );
                      }}
                      className={cn(
                        "flex-1 text-xs font-bold py-2 rounded-lg border transition capitalize",
                        failReason === status
                          ? "border-red-300 bg-red-50 text-red-800 font-extrabold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Category dropdown */}
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

              {/* Optional notes */}
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
