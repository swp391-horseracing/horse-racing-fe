import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { ChevronLeft, Timer } from "lucide-react";
import {
  type RacePhase,
  type InspectionStatus,
  type ViolationCategory,
  type LaneEntry,
  type Violation,
  type MockRace,
} from "../types/referee";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";
import RefereeDashboard from "../components/referee/RefereeDashboard";
import RefereeRaceList from "../components/referee/RefereeRaceList";
import PreRaceInspectionPanel from "../components/referee/PreRaceInspectionPanel";
import LiveMonitorPanel from "../components/referee/LiveMonitorPanel";
import ConfirmResultsPanel from "../components/referee/ConfirmResultsPanel";
import RaceReportPanel from "../components/referee/RaceReportPanel";
import { UserService } from "../services/UserService.ts";
import { RefereeService } from "../services/RefereeService.ts";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const phaseLabel: Record<RacePhase, string> = {
  scheduled: "Scheduled",
  live: "Live",
  concluded: "Concluded",
  report: "Report Pending",
};

const phaseBadgeStyle: Record<RacePhase, string> = {
  scheduled: "bg-amber-50 text-amber-900 border-amber-300 font-bold",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  concluded: "bg-indigo-100 text-indigo-800 border-indigo-200",
  report: "bg-violet-100 text-violet-800 border-violet-200",
};

const VIOLATION_CATEGORIES: ViolationCategory[] = [
  "Whip Limit Exceeded",
  "Lane Interference",
  "Unsafe Riding",
  "Refusal to Race / Bolting",
];

const PRE_RACE_WITHDRAW_REASONS = [
  "Veterinary Scratch (Paddock / Gate Lameness)",
  "Gate Behavior / Refusal to Load",
  "Gate Injury / Breakthrough",
  "Trainer Scratch (Track Surface Concern)",
  "Jockey Injury (No Rider Available)",
  "Other",
];

const PRE_RACE_DISQUALIFY_REASONS = [
  "Identity Mismatch (Lip Tattoo/Microchip)",
  "Medication Violation",
  "Weight / Equipment Compliance Failure",
  "Steward Disqualification / Other",
];

const mapBackendStatusToPhase = (
  raceStatus: string,
  reportStatus?: string
): RacePhase => {
  if (reportStatus === "referee_confirmed" || reportStatus === "published")
    return "report";
  if (
    raceStatus === "completed" ||
    raceStatus === "under_review" ||
    raceStatus === "result_confirmed"
  )
    return "report";
  if (raceStatus === "ongoing") return "live";
  return "scheduled";
};

function formatSecondsToMSS(secondsStr: string | null | undefined): string {
  if (!secondsStr) return "";
  const numVal = parseFloat(secondsStr);
  if (isNaN(numVal) || numVal < 0) return secondsStr;
  const totalSeconds = Math.floor(numVal);
  const fraction = secondsStr.includes(".")
    ? secondsStr.substring(secondsStr.indexOf("."))
    : "";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSec = String(seconds).padStart(2, "0");
  return `${minutes}:${formattedSec}${fraction}`;
}

function parseMSSToSecondsString(
  timeStr: string | undefined
): string | undefined {
  if (!timeStr) return undefined;
  const match = timeStr.match(/^(\d+):(\d{2})(\.\d+)?$/);
  if (!match) return timeStr;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const fractionStr = match[3] || "";
  const totalSeconds = minutes * 60 + seconds;
  return `${totalSeconds}${fractionStr}`;
}

export default function RefereePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname;
  const { toasts, addToast } = useToast();

  const [apiRaces, setApiRaces] = useState<MockRace[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<RacePhase | "all">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    UserService.getMyRaces(1, 100)
      .then((res) => {
        const races: MockRace[] = res.data.map((r) => ({
          id: r.id,
          name: r.name,
          venue: r.venue || "TBC",
          scheduledAt: r.scheduledAt,
          trackCondition: r.trackCondition || "dry",
          distanceMeters: r.distanceMeters || 0,
          phase: mapBackendStatusToPhase(r.status),
          elapsedSeconds: 0,
          timerRunning: false,
          reportNotes: "",
          reportSubmitted: false,
          refereeCheckedIn: false,
          adminUnlocked: false,
          lanes: [],
        }));
        setApiRaces(races);
      })
      .catch((e: any) => {
        addToast(
          e.response?.data?.message || "Failed to load assigned races",
          "error"
        );
      });
  }, [addToast]);

  const handleSelectRace = useCallback(
    (id: string) => {
      setSelectedRaceId(id);
      const race = apiRaces.find((r) => r.id === id);
      if (race && race.lanes.length === 0 && !loading) {
        setLoading(true);

        const reportPromise = RefereeService.getRefereeRaceReport(id);
        const entriesPromise = RefereeService.getRefereeRaceEntries(id).catch(
          () => null
        );

        Promise.all([reportPromise, entriesPromise])
          .then(([data, entriesData]) => {
            setApiRaces((prev) =>
              prev.map((r) => {
                if (r.id !== id) return r;

                const backendPhase = mapBackendStatusToPhase(
                  data.race.status,
                  data.report?.status
                );

                // Build an entryStatus lookup from the entries endpoint
                const entryStatusMap = new Map<string, string>();
                if (entriesData?.entries) {
                  for (const e of entriesData.entries) {
                    entryStatusMap.set(e.id, e.entryStatus);
                  }
                }

                const mapEntryStatusToInspection = (
                  entryId: string,
                  finishStatus: string
                ): InspectionStatus => {
                  // If we have the real entryStatus from the entries endpoint, use it
                  const es = entryStatusMap.get(entryId);
                  if (es) {
                    if (es === "confirmed") return "cleared";
                    if (es === "disqualified") return "disqualified";
                    if (es === "withdrawn") return "withdrawn";
                    return "pending";
                  }
                  // Fallback for non-scheduled phases
                  if (finishStatus === "dns") return "withdrawn";
                  return backendPhase === "scheduled" ? "pending" : "cleared";
                };

                const lanes: LaneEntry[] = data.placements.map((p) => ({
                  id: p.entryId,
                  laneNumber: p.laneNumber,
                  horseName: p.horse.name,
                  jockeyName: p.jockey?.fullName || "No Jockey",
                  inspectionStatus: mapEntryStatusToInspection(
                    p.entryId,
                    p.finishStatus
                  ),
                  inspectedAt: null,
                  failReason: null,
                  violations: p.violation
                    ? [
                        {
                          id: p.violation.id,
                          entryId: p.entryId,
                          refereeId: p.violation.refereeId,
                          occurredAt: p.violation.occurredAt,
                          violationType: p.violation.violationType,
                          description: p.violation.description,
                          severity: p.violation.severity as any,
                          note: p.violation.note,
                        },
                      ]
                    : [],
                  finishPosition: p.finishedPosition,
                  finishTime: formatSecondsToMSS(p.finishTime),
                  flag:
                    p.finishStatus === "dnf" || p.finishStatus === "dsq"
                      ? p.finishStatus
                      : null,
                }));

                // If in scheduled phase and entries endpoint returned entries
                // that aren't in placements yet, add them as lanes
                if (backendPhase === "scheduled" && entriesData?.entries) {
                  const placementIds = new Set(
                    data.placements.map((p: any) => p.entryId)
                  );
                  for (const e of entriesData.entries) {
                    if (!placementIds.has(e.id)) {
                      const inspStatus: InspectionStatus =
                        e.entryStatus === "confirmed"
                          ? "cleared"
                          : e.entryStatus === "disqualified"
                            ? "disqualified"
                            : e.entryStatus === "withdrawn"
                              ? "withdrawn"
                              : "pending";
                      lanes.push({
                        id: e.id,
                        laneNumber: e.laneNumber,
                        horseName: e.horse.name,
                        jockeyName: e.jockey?.fullName || "No Jockey",
                        inspectionStatus: inspStatus,
                        inspectedAt: null,
                        failReason: null,
                        violations: [],
                        finishPosition: null,
                        finishTime: "",
                        flag: null,
                      });
                    }
                  }
                  lanes.sort((a, b) => a.laneNumber - b.laneNumber);
                }

                const isSubmitted =
                  data.report?.status !== "draft" &&
                  data.report?.status !== undefined;

                return {
                  ...r,
                  lanes,
                  reportNotes: data.report?.notes || "",
                  reportSubmitted: isSubmitted,
                  phase: backendPhase,
                };
              })
            );
          })
          .catch((e: any) => {
            addToast(
              e.response?.data?.message || "Failed to load race report details",
              "error"
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [apiRaces, loading, addToast]
  );

  const selectedRace = apiRaces.find((r) => r.id === selectedRaceId) ?? null;

  useEffect(() => {
    if (!selectedRace?.timerRunning) return;
    const interval = setInterval(() => {
      setApiRaces((prev) =>
        prev.map((r) =>
          r.id === selectedRaceId
            ? { ...r, elapsedSeconds: r.elapsedSeconds + 1 }
            : r
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedRace?.timerRunning, selectedRaceId]);

  const updateRace = useCallback(
    (raceId: string, updater: (r: MockRace) => MockRace) => {
      setApiRaces((prev) =>
        prev.map((r) => (r.id === raceId ? updater(r) : r))
      );
    },
    []
  );

  const updateLane = useCallback(
    (raceId: string, laneId: string, updater: (l: LaneEntry) => LaneEntry) => {
      updateRace(raceId, (r) => ({
        ...r,
        lanes: r.lanes.map((l) => (l.id === laneId ? updater(l) : l)),
      }));
    },
    [updateRace]
  );

  const handleToggleCheckIn = (raceId: string, checkedIn: boolean) => {
    updateRace(raceId, (r) => ({ ...r, refereeCheckedIn: checkedIn }));
    addToast(
      checkedIn
        ? "Referee checked in. Inspections are now enabled."
        : "Referee check-in revoked. Inspections are locked.",
      checkedIn ? "success" : "warning"
    );
  };

  const handleClearLane = async (raceId: string, laneId: string) => {
    try {
      await RefereeService.inspectEntry(raceId, laneId, "cleared");
      updateLane(raceId, laneId, (l) => ({
        ...l,
        inspectionStatus: "cleared",
        inspectedAt: new Date().toISOString(),
      }));
      addToast("Lane cleared for track entry.", "success");
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to clear lane. Please try again.",
        "error"
      );
    }
  };

  const handleFailLane = async (
    raceId: string,
    laneId: string,
    status: "disqualified" | "withdrawn",
    category: string,
    notes: string
  ) => {
    try {
      await RefereeService.inspectEntry(raceId, laneId, status);
      const formattedReason = `${category}${notes.trim() ? " — " + notes.trim() : ""}`;
      updateLane(raceId, laneId, (l) => ({
        ...l,
        inspectionStatus: status,
        inspectedAt: new Date().toISOString(),
        failReason: formattedReason,
      }));
      addToast(
        `Lane marked as ${status} (${category}). Removed from active contention.`,
        status === "disqualified" ? "error" : "warning"
      );
    } catch (e: any) {
      addToast(
        e.response?.data?.message ||
          `Failed to mark lane as ${status}. Please try again.`,
        "error"
      );
    }
  };

  const handleTransitionToLive = (raceId: string) => {
    const race = apiRaces.find((r) => r.id === raceId);
    if (!race) return;
    const pending = race.lanes.filter((l) => l.inspectionStatus === "pending");
    if (pending.length > 0) {
      addToast(
        `Cannot start race. ${pending.length} lane(s) still pending inspection.`,
        "error"
      );
      return;
    }
    updateRace(raceId, (r) => ({ ...r, phase: "live", timerRunning: true }));
    addToast("Race is now Live. Prediction pools are locked.", "success");
  };

  const handleDelayRace = (raceId: string) => {
    updateRace(raceId, (r) => ({ ...r, timerRunning: false }));
    addToast(
      "Race delayed. Schedule countdown paused. Admins and Spectators notified.",
      "warning"
    );
  };

  const handleResumeRace = (raceId: string) => {
    updateRace(raceId, (r) => ({ ...r, timerRunning: true }));
    addToast("Race timer resumed.", "info");
  };

  const handleLogViolation = async (
    raceId: string,
    laneId: string,
    violationType: string,
    note: string
  ) => {
    try {
      const created = await RefereeService.createViolation(raceId, {
        entryId: laneId,
        occurredAt: new Date().toISOString(),
        violationType,
        description: violationType,
        severity: "warning",
        note,
      });

      if (!(created as any).id) {
        throw new Error("Violation was created but no id was returned");
      }

      const violation: Violation = {
        id: (created as any).id,
        entryId: laneId,
        refereeId: (created as any).refereeId || "me",
        violationType,
        description: violationType,
        severity: "warning",
        note,
        occurredAt: new Date().toISOString(),
      };
      updateLane(raceId, laneId, (l) => ({
        ...l,
        violations: [...l.violations, violation],
      }));
      addToast(`Violation logged: ${violationType}`, "warning");
    } catch (e: any) {
      addToast(e.response?.data?.message || "Failed to log violation", "error");
    }
  };

  const handleEndRace = (raceId: string) => {
    const race = apiRaces.find((r) => r.id === raceId);
    if (!race) return;
    if (race.elapsedSeconds < 10) {
      if (!confirm("Are you sure? Race duration is abnormally short.")) return;
    }
    updateRace(raceId, (r) => ({
      ...r,
      phase: "concluded",
      timerRunning: false,
    }));
    addToast("Race ended. Enter finish placements.", "info");
  };

  const handleSetPlacement = (
    raceId: string,
    laneId: string,
    position: number | null
  ) => {
    updateLane(raceId, laneId, (l) => ({ ...l, finishPosition: position }));
  };

  const handleSetFinishTime = (
    raceId: string,
    laneId: string,
    time: string
  ) => {
    updateLane(raceId, laneId, (l) => ({ ...l, finishTime: time }));
  };

  const handleSetFlag = (
    raceId: string,
    laneId: string,
    flag: "dnf" | "dsq" | null
  ) => {
    updateLane(raceId, laneId, (l) => ({
      ...l,
      flag,
      finishPosition: flag ? null : l.finishPosition,
      finishTime: flag ? "" : l.finishTime,
    }));
  };

  const handleConfirmResults = async (raceId: string) => {
    const race = apiRaces.find((r) => r.id === raceId);
    if (!race) return;
    const activeLanes = race.lanes.filter(
      (l) => l.inspectionStatus === "cleared" && !l.flag
    );
    const incomplete = activeLanes.filter(
      (l) => !l.finishPosition || !l.finishTime
    );
    if (incomplete.length > 0) {
      addToast(
        `All active competitors must receive a placement and finish time. ${incomplete.length} lane(s) missing.`,
        "error"
      );
      return;
    }

    try {
      const payload = {
        placements: race.lanes.map((l) => ({
          entryId: l.id,
          finishedPosition: l.finishPosition || 999,
          finishTime: parseMSSToSecondsString(l.finishTime) || undefined,
          finishStatus: (l.inspectionStatus === "withdrawn"
            ? "dns"
            : l.inspectionStatus === "disqualified"
              ? "dsq"
              : l.flag || "finished") as "finished" | "dnf" | "dsq" | "dns",
          points: 0,
        })),
      };
      await RefereeService.updatePlacements(raceId, payload);

      updateRace(raceId, (r) => ({ ...r, phase: "report" }));
      addToast(
        "Results captured. Ready for final report generation.",
        "success"
      );
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to confirm results",
        "error"
      );
    }
  };

  const handleEditResults = (raceId: string) => {
    updateRace(raceId, (r) => ({ ...r, phase: "concluded" }));
    addToast(
      "Unlocked results for editing. Make your changes and re-confirm.",
      "info"
    );
  };

  const handleSaveReportDraft = (raceId: string, notes: string) => {
    updateRace(raceId, (r) => ({ ...r, reportNotes: notes }));
    addToast("Draft saved locally.", "info");
  };

  const handleSubmitReport = async (raceId: string) => {
    const race = apiRaces.find((r) => r.id === raceId);
    if (!race) return;
    const unresolvedViolations = race.lanes
      .flatMap((l) => l.violations)
      .filter((v) => !v.violationType);
    if (unresolvedViolations.length > 0) {
      addToast(
        "All logged violations must be fully resolved before submission.",
        "error"
      );
      return;
    }

    try {
      const placementsPayload = {
        placements: race.lanes.map((l) => ({
          entryId: l.id,
          finishedPosition: l.finishPosition || 999,
          finishTime: parseMSSToSecondsString(l.finishTime) || undefined,
          finishStatus: (l.inspectionStatus === "withdrawn"
            ? "dns"
            : l.inspectionStatus === "disqualified"
              ? "dsq"
              : l.flag || "finished") as "finished" | "dnf" | "dsq" | "dns",
          points: 0,
        })),
      };
      await RefereeService.updatePlacements(raceId, placementsPayload);

      await RefereeService.submitReport(raceId, { notes: race.reportNotes });

      const isResubmission = race.adminUnlocked;
      updateRace(raceId, (r) => ({
        ...r,
        reportSubmitted: true,
        adminUnlocked: false,
      }));
      addToast(
        isResubmission
          ? "Report re-submitted successfully. Corrections have been locked."
          : "Report submitted successfully. Your track duties for this race are complete.",
        "success"
      );
    } catch (e: any) {
      addToast(e.response?.data?.message || "Failed to submit report", "error");
    }
  };

  // NOTE: This toggle emulates administrative lock/unlock overrides locally.
  // It is intentionally kept client-side for testing and QA flows (e.g. testing report re-submission).
  const handleToggleAdminLock = (raceId: string, unlocked: boolean) => {
    updateRace(raceId, (r) => ({ ...r, adminUnlocked: unlocked }));
    addToast(
      unlocked
        ? "[Admin] Report unlocked — referee may now edit and re-submit."
        : "[Admin] Report locked — editing disabled.",
      unlocked ? "warning" : "info"
    );
  };

  const handleUpdateViolation = async (
    raceId: string,
    laneId: string,
    violationId: string,
    violationType: ViolationCategory,
    note: string
  ) => {
    let created: any = null;
    try {
      // 1. Create replacement violation first
      created = await RefereeService.createViolation(raceId, {
        entryId: laneId,
        occurredAt: new Date().toISOString(),
        violationType,
        description: violationType,
        severity: "warning",
        note,
      });

      // 2. Delete the old violation
      try {
        await RefereeService.deleteViolation(raceId, violationId);
      } catch (deleteError) {
        // Rollback created violation if deletion fails
        if (created && created.id) {
          await RefereeService.deleteViolation(raceId, created.id);
        }
        throw deleteError;
      }

      updateLane(raceId, laneId, (l) => ({
        ...l,
        violations: l.violations.map((v) =>
          v.id === violationId
            ? { ...v, id: created.id, violationType, note }
            : v
        ),
      }));
      addToast("Violation updated.", "info");
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to update violation",
        "error"
      );
      throw e;
    }
  };

  const handleDeleteViolation = async (
    raceId: string,
    laneId: string,
    violationId: string
  ) => {
    try {
      await RefereeService.deleteViolation(raceId, violationId);
      updateLane(raceId, laneId, (l) => ({
        ...l,
        violations: l.violations.filter((v) => v.id !== violationId),
      }));
      addToast("Violation removed.", "warning");
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to delete violation",
        "error"
      );
      throw e;
    }
  };

  const renderContent = () => {
    if (selectedRaceId) {
      if (!selectedRace) return null;
      const race = selectedRace;
      const activeLanes = race.lanes.filter(
        (l) => l.inspectionStatus === "cleared"
      );
      const allViolations = race.lanes.flatMap((l) =>
        l.violations.map((v) => ({
          ...v,
          laneId: l.id,
          horseName: l.horseName,
          laneNumber: l.laneNumber,
        }))
      );

      return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedRaceId(null)}
              className="text-xs font-bold text-slate-500 hover:text-[#064E3B] flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Races
            </button>
          </div>

          <div className="border-b border-[#064E3B]/10 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
                {race.name}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {race.venue} • {race.distanceMeters}m • Track:{" "}
                {race.trackCondition}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {race.phase === "live" && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                  <Timer className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-sm font-black font-label text-emerald-800">
                    {formatTime(race.elapsedSeconds)}
                  </span>
                </div>
              )}
              <span
                className={cn(
                  "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
                  phaseBadgeStyle[race.phase]
                )}
              >
                {phaseLabel[race.phase]}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064E3B]"></div>
            </div>
          ) : (
            <>
              {race.phase === "scheduled" && (
                <PreRaceInspectionPanel
                  race={race}
                  onClearLane={(laneId) => handleClearLane(race.id, laneId)}
                  onFailLane={(laneId, status, violationType, note) =>
                    handleFailLane(race.id, laneId, status, violationType, note)
                  }
                  onTransitionToLive={() => handleTransitionToLive(race.id)}
                  onToggleCheckIn={(checkedIn) =>
                    handleToggleCheckIn(race.id, checkedIn)
                  }
                  preRaceWithdrawReasons={PRE_RACE_WITHDRAW_REASONS}
                  preRaceDisqualifyReasons={PRE_RACE_DISQUALIFY_REASONS}
                />
              )}
              {race.phase === "live" && (
                <LiveMonitorPanel
                  race={race}
                  allViolations={allViolations}
                  onDelayRace={() => handleDelayRace(race.id)}
                  onResumeRace={() => handleResumeRace(race.id)}
                  onEndRace={() => handleEndRace(race.id)}
                  onLogViolation={(laneId, violationType, note) =>
                    handleLogViolation(race.id, laneId, violationType, note)
                  }
                  violationCategories={VIOLATION_CATEGORIES}
                />
              )}
              {race.phase === "concluded" && (
                <ConfirmResultsPanel
                  race={race}
                  activeLanes={activeLanes}
                  onSetPlacement={(laneId, pos) =>
                    handleSetPlacement(race.id, laneId, pos)
                  }
                  onSetFinishTime={(laneId, time) =>
                    handleSetFinishTime(race.id, laneId, time)
                  }
                  onSetFlag={(laneId, flag) =>
                    handleSetFlag(race.id, laneId, flag)
                  }
                  onConfirmResults={() => handleConfirmResults(race.id)}
                />
              )}
              {race.phase === "report" && (
                <RaceReportPanel
                  race={race}
                  activeLanes={activeLanes}
                  allViolations={allViolations}
                  onEditResults={() => handleEditResults(race.id)}
                  onUpdateReportNotes={(notes) =>
                    updateRace(race.id, (r) => ({ ...r, reportNotes: notes }))
                  }
                  onSaveReportDraft={() =>
                    handleSaveReportDraft(race.id, race.reportNotes)
                  }
                  onSubmitReport={() => handleSubmitReport(race.id)}
                  onUpdateViolation={(
                    laneId,
                    violationId,
                    violationType,
                    note
                  ) =>
                    handleUpdateViolation(
                      race.id,
                      laneId,
                      violationId,
                      violationType,
                      note
                    )
                  }
                  onDeleteViolation={(laneId, violationId) =>
                    handleDeleteViolation(race.id, laneId, violationId)
                  }
                  onToggleAdminLock={(unlocked) =>
                    handleToggleAdminLock(race.id, unlocked)
                  }
                  violationCategories={VIOLATION_CATEGORIES}
                />
              )}
            </>
          )}
        </div>
      );
    }

    switch (active) {
      case ROUTES.REFEREE_DASHBOARD:
        return (
          <RefereeDashboard
            races={apiRaces}
            onViewAll={() => {
              navigate(ROUTES.REFEREE_RACE_LIST);
              setFilterPhase("all");
            }}
            onSelectRace={(id) => {
              handleSelectRace(id);
              navigate(ROUTES.REFEREE_RACE_LIST);
            }}
            phaseBadgeStyle={phaseBadgeStyle}
            phaseLabel={phaseLabel}
          />
        );
      case ROUTES.REFEREE_RACE_LIST:
        return (
          <RefereeRaceList
            races={apiRaces}
            filterPhase={filterPhase}
            onFilterChange={setFilterPhase}
            onSelectRace={handleSelectRace}
            phaseBadgeStyle={phaseBadgeStyle}
            phaseLabel={phaseLabel}
          />
        );
      default:
        return (
          <RefereeDashboard
            races={apiRaces}
            onViewAll={() => {
              navigate(ROUTES.REFEREE_RACE_LIST);
              setFilterPhase("all");
            }}
            onSelectRace={(id) => {
              handleSelectRace(id);
              navigate(ROUTES.REFEREE_RACE_LIST);
            }}
            phaseBadgeStyle={phaseBadgeStyle}
            phaseLabel={phaseLabel}
          />
        );
    }
  };

  return (
    <UserLayout
      activeKey={active}
      onActiveKeyChange={(key) => {
        navigate(key);
        setSelectedRaceId(null);
      }}
    >
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        <ToastContainer toasts={toasts} />
        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
