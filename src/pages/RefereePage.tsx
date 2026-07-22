import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes";
import {
  StatusBadge,
  REFEREE_PHASE_STYLES,
} from "../components/ui/StatusBadge";
import { ChevronLeft, Timer } from "lucide-react";
import {
  type RacePhase,
  type InspectionStatus,
  type LaneEntry,
  type Violation,
  type MockRace,
  type ViolationTypeConfig,
} from "../types/referee";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";
import RefereeDashboard from "../components/referee/RefereeDashboard";
import RefereeRaceList from "../components/referee/RefereeRaceList";
import PreRaceInspectionPanel from "../components/referee/PreRaceInspectionPanel";
import LiveMonitorPanel from "../components/referee/LiveMonitorPanel";
import RaceReportPanel from "../components/referee/RaceReportPanel";
import RefereeReviewReports from "../components/referee/RefereeReviewReports";
import { UserService } from "../services/UserService";
import { RefereeService } from "../services/RefereeService";
import { HorseService } from "../services/HorseService";
import { TournamentService } from "../services/TournamentService";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const phaseLabel: Record<RacePhase, string> = {
  scheduled: "Pre-Race",
  live: "Live",
  post_race: "Results",
};

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

const mapBackendStatusToPhase = (raceStatus: string): RacePhase => {
  if (raceStatus === "ongoing") return "live";
  if (raceStatus === "scheduled" || raceStatus === "pre_race")
    return "scheduled";
  return "post_race";
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
  const [violationTypeConfigs, setViolationTypeConfigs] = useState<
    ViolationTypeConfig[]
  >([]);

  // Clear selected race when navigating away from the race list
  useEffect(() => {
    if (selectedRaceId && active !== ROUTES.REFEREE_RACE_LIST) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRaceId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    UserService.getMyRaces(1, 100)
      .then((res) => {
        const races: MockRace[] = res.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          venue: r.venue || "TBC",
          scheduledAt: r.scheduledAt,
          trackCondition: r.trackCondition || "dry",
          distanceMeters: r.distanceMeters || 0,
          phase: mapBackendStatusToPhase(r.status),
          status: r.status,
          elapsedSeconds: 0,
          timerRunning: false,
          reportNotes: "",
          reportStatus: r.resultStatus ?? null,
          refereeCheckedIn: false,
          tournamentId: r.tournamentId,
          carryWeight: null,
          lanes: [],
        }));
        const phaseOrder: Record<string, number> = {
          pre_race: 0,
          scheduled: 1,
          ongoing: 2,
          live: 2,
          post_race: 3,
        };
        races.sort((a, b) => {
          const pa = phaseOrder[a.status] ?? 9;
          const pb = phaseOrder[b.status] ?? 9;
          if (pa !== pb) return pa - pb;
          return (
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
          );
        });
        setApiRaces(races);
      })
      .catch((e: any) => {
        addToast(
          e.response?.data?.message || "Failed to load assigned races",
          "error"
        );
      });
  }, [addToast]);

  useEffect(() => {
    RefereeService.getViolationTypes()
      .then(setViolationTypeConfigs)
      .catch(() => {
        addToast("Failed to load violation types", "error");
      });
  }, [addToast]);

  const handleSelectRace = useCallback(
    async (id: string) => {
      setSelectedRaceId(id);
      const race = apiRaces.find((r) => r.id === id);
      if (race && race.lanes.length === 0 && !loading) {
        setLoading(true);
        try {
          const [data, entriesData] = await Promise.all([
            RefereeService.getRefereeRaceReport(id),
            RefereeService.getRefereeRaceEntries(id),
          ]);

          const entries = entriesData?.entries || [];
          const weightMap = new Map<
            string,
            {
              horseWeightKg: number | null;
              jockeyWeightKg: number | null;
              horseId: string | null;
            }
          >();
          const horseIds: string[] = [];

          for (const e of entries) {
            const hid = e.horse?.id;
            if (hid && !horseIds.includes(hid)) horseIds.push(hid);
            weightMap.set(e.id, {
              horseWeightKg: e.horse?.weightKg ?? null,
              jockeyWeightKg: e.jockey?.weightKg ?? null,
              horseId: hid ?? null,
            });
          }

          const [healthResults, tournamentData] = await Promise.all([
            Promise.all(
              horseIds.map((hid) =>
                HorseService.getHorseById(hid).catch((err) => {
                  console.error("Failed to load horse:", hid, err);
                  return null;
                })
              )
            ),
            race.tournamentId
              ? TournamentService.getTournamentByID(race.tournamentId).catch(
                  (err) => {
                    console.error(
                      "Failed to load tournament:",
                      race.tournamentId,
                      err
                    );
                    return null;
                  }
                )
              : Promise.resolve(null),
          ]);

          const healthMap = new Map<string, string | null>();
          for (let i = 0; i < horseIds.length; i++) {
            const h = healthResults[i];
            healthMap.set(horseIds[i], h?.healthStatus ?? null);
          }

          const carryWeight = tournamentData?.carryWeight ?? null;

          setApiRaces((prev) =>
            prev.map((r) => {
              if (r.id !== id) return r;

              const backendPhase = mapBackendStatusToPhase(data.race.status);

              const entryStatusMap = new Map<string, string>();
              if (entriesData?.entries) {
                for (const e of entriesData.entries) {
                  entryStatusMap.set(e.id, e.entryStatus);
                }
              }

              const mapEntryStatusToInspectionStatus = (
                entryStatus?: string
              ): InspectionStatus | null => {
                switch (entryStatus) {
                  case "confirmed":
                    return "cleared";
                  case "disqualified":
                    return "disqualified";
                  case "withdrawn":
                  case "scratched":
                    return "withdrawn";
                  case "did_not_finish":
                    return "cleared";
                  case "pending":
                    return "pending";
                  default:
                    return null;
                }
              };

              const mapEntryStatusToInspection = (
                entryId: string,
                finishStatus: string
              ): InspectionStatus => {
                const mapped = mapEntryStatusToInspectionStatus(
                  entryStatusMap.get(entryId)
                );
                if (mapped) return mapped;
                if (finishStatus === "dns") return "withdrawn";
                return backendPhase === "scheduled" ? "pending" : "cleared";
              };

              const enrichLane = (entryId: string) => {
                const w = weightMap.get(entryId);
                return {
                  horseId: w?.horseId ?? undefined,
                  horseWeightKg: w?.horseWeightKg ?? null,
                  healthStatus: w?.horseId
                    ? (healthMap.get(w.horseId) ?? null)
                    : null,
                  jockeyWeightKg: w?.jockeyWeightKg ?? null,
                };
              };

              const lanes: LaneEntry[] = data.placements.map((p) => ({
                id: p.entryId,
                laneNumber: p.laneNumber,
                horseName: p.horse.name,
                ...enrichLane(p.entryId),
                jockeyName: p.jockey?.fullName || "No Jockey",
                inspectionStatus: mapEntryStatusToInspection(
                  p.entryId,
                  p.finishStatus
                ),
                inspectedAt: null,
                failReason: null,
                violations: (p.violations || []).map((v: any) => ({
                  id: v.id,
                  entryId: p.entryId,
                  refereeId: v.refereeId,
                  occurredAt: v.occurredAt,
                  violationTypeConfigId: v.violationTypeConfigId,
                  violationType: v.violationType,
                  description: v.description,
                  severity: v.severity,
                  note: v.note || "",
                })),
                finishPosition: p.finishedPosition,
                finishTime: formatSecondsToMSS(p.finishTime),
                flag:
                  p.finishStatus === "dnf" || p.finishStatus === "dsq"
                    ? p.finishStatus
                    : null,
              }));

              if (entriesData?.entries) {
                const placementIds = new Set(
                  data.placements.map((p: any) => p.entryId)
                );
                for (const e of entriesData.entries) {
                  if (!placementIds.has(e.id)) {
                    const inspStatus: InspectionStatus =
                      mapEntryStatusToInspectionStatus(e.entryStatus) ??
                      "pending";
                    lanes.push({
                      id: e.id,
                      laneNumber: e.laneNumber,
                      horseName: e.horse.name,
                      ...enrichLane(e.id),
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
              }
              lanes.sort((a, b) => a.laneNumber - b.laneNumber);

              return {
                ...r,
                lanes,
                carryWeight,
                reportNotes: data.report?.notes || "",
                reportStatus: data.report?.status ?? null,
                phase: backendPhase,
                status: data.race.status,
              };
            })
          );
        } catch (e: any) {
          addToast(
            e.response?.data?.message || "Failed to load race report details",
            "error"
          );
        } finally {
          setLoading(false);
        }
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
      await RefereeService.inspectEntry(raceId, laneId, "cleared", "healthy");
      updateLane(raceId, laneId, (l) => ({
        ...l,
        inspectionStatus: "cleared",
        inspectedAt: new Date().toISOString(),
        failReason: null,
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
    violationTypeConfigId: string,
    severity: string,
    note: string
  ) => {
    try {
      await RefereeService.getRefereeRaceReport(raceId);
      const config = violationTypeConfigs.find(
        (c) => c.id === violationTypeConfigId
      );
      const created = await RefereeService.createViolation(raceId, {
        entryId: laneId,
        occurredAt: new Date().toISOString(),
        violationTypeConfigId,
        severity: severity as any,
        note,
      });

      if (!(created as any).id) {
        throw new Error("Violation was created but no id was returned");
      }

      const violation: Violation = {
        id: (created as any).id,
        entryId: laneId,
        refereeId: (created as any).refereeId || "me",
        violationTypeConfigId,
        violationType: config?.violationType || "",
        description: config?.description || "",
        severity: severity as any,
        note,
        occurredAt: new Date().toISOString(),
      };
      updateLane(raceId, laneId, (l) => ({
        ...l,
        violations: [...l.violations, violation],
      }));
      addToast(`Violation logged: ${config?.violationType || ""}`, "warning");
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
      phase: "post_race",
      timerRunning: false,
      reportStatus: r.reportStatus || "draft",
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

  const savePlacements = async (raceId: string) => {
    const race = apiRaces.find((r) => r.id === raceId);
    if (!race) return;

    try {
      const payload = {
        placements: race.lanes.map((l) => ({
          entryId: l.id,
          finishedPosition: l.finishPosition ?? null,
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
      return true;
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to save placements",
        "error"
      );
      return false;
    }
  };

  const handleSaveReportDraft = (raceId: string, notes: string) => {
    updateRace(raceId, (r) => ({ ...r, reportNotes: notes }));
    addToast("Draft saved locally.", "info");
  };

  const handleSubmitReport = async (raceId: string) => {
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

    const saved = await savePlacements(raceId);
    if (!saved) return;

    try {
      await RefereeService.submitReport(raceId, { notes: race.reportNotes });

      updateRace(raceId, (r) => ({
        ...r,
        reportStatus: "published",
      }));
      addToast(
        "Report submitted successfully. Race result is now finalized.",
        "success"
      );
    } catch (e: any) {
      addToast(e.response?.data?.message || "Failed to submit report", "error");
    }
  };

  const handleUpdateViolation = async (
    raceId: string,
    laneId: string,
    violationId: string,
    violationTypeConfigId: string,
    severity: string,
    note: string
  ) => {
    let created: any = null;
    try {
      const config = violationTypeConfigs.find(
        (c) => c.id === violationTypeConfigId
      );

      // 1. Create replacement violation first
      created = await RefereeService.createViolation(raceId, {
        entryId: laneId,
        occurredAt: new Date().toISOString(),
        violationTypeConfigId,
        severity: severity as any,
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
            ? {
                ...v,
                id: created.id,
                violationTypeConfigId,
                violationType: config?.violationType || "",
                description: config?.description || "",
                severity: severity as any,
                note,
              }
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
        (l) => l.inspectionStatus === "cleared" && !l.flag
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
              <StatusBadge
                status={race.phase}
                styleMap={REFEREE_PHASE_STYLES}
                label={
                  race.phase === "post_race" &&
                  (race.reportStatus === "published" ||
                    race.reportStatus === "referee_confirmed")
                    ? "Finalized"
                    : race.phase === "post_race" &&
                        race.reportStatus === "draft"
                      ? "Results (Draft)"
                      : phaseLabel[race.phase]
                }
                className={
                  race.reportStatus === "published" ||
                  race.reportStatus === "referee_confirmed"
                    ? "bg-emerald-50! text-emerald-800! border-emerald-200!"
                    : undefined
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064E3B]"></div>
            </div>
          ) : (
            <>
              {race.phase === "scheduled" && race.status === "pre_race" && (
                <PreRaceInspectionPanel
                  race={race}
                  carryWeight={race.carryWeight ?? null}
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
              {race.phase === "scheduled" && race.status === "scheduled" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
                  <div className="text-amber-600 text-4xl mb-3">⏳</div>
                  <h3 className="text-lg font-bold text-amber-900 mb-1">
                    Race Not Yet in Pre-Race Phase
                  </h3>
                  <p className="text-sm text-amber-700 max-w-md mx-auto">
                    The race is currently scheduled. Inspections and check-in
                    will be available once the race transitions to the pre-race
                    phase.
                  </p>
                </div>
              )}
              {race.phase === "live" && (
                <LiveMonitorPanel
                  race={race}
                  allViolations={allViolations}
                  onDelayRace={() => handleDelayRace(race.id)}
                  onResumeRace={() => handleResumeRace(race.id)}
                  onEndRace={() => handleEndRace(race.id)}
                  onLogViolation={(
                    laneId,
                    violationTypeConfigId,
                    severity,
                    note
                  ) =>
                    handleLogViolation(
                      race.id,
                      laneId,
                      violationTypeConfigId,
                      severity,
                      note
                    )
                  }
                  violationTypeConfigs={violationTypeConfigs}
                />
              )}
              {race.phase === "post_race" && (
                <RaceReportPanel
                  race={race}
                  activeLanes={activeLanes}
                  allViolations={allViolations}
                  onSetPlacement={(laneId, pos) =>
                    handleSetPlacement(race.id, laneId, pos)
                  }
                  onSetFinishTime={(laneId, time) =>
                    handleSetFinishTime(race.id, laneId, time)
                  }
                  onSetFlag={(laneId, flag) =>
                    handleSetFlag(race.id, laneId, flag)
                  }
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
                    violationTypeConfigId,
                    severity,
                    note
                  ) =>
                    handleUpdateViolation(
                      race.id,
                      laneId,
                      violationId,
                      violationTypeConfigId,
                      severity,
                      note
                    )
                  }
                  onDeleteViolation={(laneId, violationId) =>
                    handleDeleteViolation(race.id, laneId, violationId)
                  }
                  onCreateViolation={(
                    laneId,
                    violationTypeConfigId,
                    severity,
                    note
                  ) =>
                    handleLogViolation(
                      race.id,
                      laneId,
                      violationTypeConfigId,
                      severity,
                      note
                    )
                  }
                  violationTypeConfigs={violationTypeConfigs}
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
            phaseBadgeStyle={REFEREE_PHASE_STYLES}
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
            phaseBadgeStyle={REFEREE_PHASE_STYLES}
            phaseLabel={phaseLabel}
          />
        );
      case ROUTES.REFEREE_REVIEW_REPORT:
        return <RefereeReviewReports addToast={addToast} />;
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
            phaseBadgeStyle={REFEREE_PHASE_STYLES}
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
