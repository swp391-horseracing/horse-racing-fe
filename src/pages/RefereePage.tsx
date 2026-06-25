import { useState, useEffect, useCallback } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { ChevronLeft, Timer } from "lucide-react";
import {
  type RacePhase,
  type ViolationCategory,
  type LaneEntry,
  type Violation,
  type MockRace,
  formatTime,
  phaseLabel,
  phaseBadgeStyle,
} from "../types/referee";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";
import RefereeDashboard from "../components/referee/RefereeDashboard";
import RefereeRaceList from "../components/referee/RefereeRaceList";
import PreRaceInspectionPanel from "../components/referee/PreRaceInspectionPanel";
import LiveMonitorPanel from "../components/referee/LiveMonitorPanel";
import ConfirmResultsPanel from "../components/referee/ConfirmResultsPanel";
import RaceReportPanel from "../components/referee/RaceReportPanel";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const createMockRaces = (): MockRace[] => [
  {
    id: "race-001",
    name: "Summer Stakes — Heat 1",
    venue: "Royal Meadow Circuit",
    scheduledAt: "2026-06-22T14:00:00",
    trackCondition: "dry",
    distanceMeters: 1600,
    phase: "scheduled",
    elapsedSeconds: 0,
    timerRunning: false,
    reportNotes: "",
    reportSubmitted: false,
    lanes: [
      {
        id: "e1",
        laneNumber: 1,
        horseName: "Thunderbolt",
        jockeyName: "J. Smith",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e2",
        laneNumber: 2,
        horseName: "Silver Arrow",
        jockeyName: "M. Chen",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e3",
        laneNumber: 3,
        horseName: "Golden Storm",
        jockeyName: "R. Garcia",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e4",
        laneNumber: 4,
        horseName: "Night Fury",
        jockeyName: "K. Tanaka",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e5",
        laneNumber: 5,
        horseName: "Emerald Wind",
        jockeyName: "L. Dubois",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e6",
        laneNumber: 6,
        horseName: "Crimson Blaze",
        jockeyName: "A. Volkov",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
    ],
  },
  {
    id: "race-002",
    name: "Summer Stakes — Heat 2",
    venue: "Royal Meadow Circuit",
    scheduledAt: "2026-06-22T15:30:00",
    trackCondition: "wet",
    distanceMeters: 2000,
    phase: "scheduled",
    elapsedSeconds: 0,
    timerRunning: false,
    reportNotes: "",
    reportSubmitted: false,
    lanes: [
      {
        id: "e7",
        laneNumber: 1,
        horseName: "Ocean Breeze",
        jockeyName: "P. Kim",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e8",
        laneNumber: 2,
        horseName: "Desert Mirage",
        jockeyName: "S. Okafor",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e9",
        laneNumber: 3,
        horseName: "Arctic Fox",
        jockeyName: "D. Mueller",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
      {
        id: "e10",
        laneNumber: 4,
        horseName: "Shadow Dancer",
        jockeyName: "T. Nguyen",
        inspectionStatus: "pending",
        inspectedAt: null,
        failReason: null,
        violations: [],
        finishPosition: null,
        finishTime: "",
        flag: null,
      },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function RefereePage() {
  const [active, setActive] = useState<string>(ROUTES.REFEREE_DASHBOARD);
  const { toasts, addToast } = useToast();
  const [races, setRaces] = useState<MockRace[]>(createMockRaces);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<RacePhase | "all">("all");

  const selectedRace = races.find((r) => r.id === selectedRaceId) ?? null;

  // Timer effect
  useEffect(() => {
    if (!selectedRace?.timerRunning) return;
    const interval = setInterval(() => {
      setRaces((prev) =>
        prev.map((r) =>
          r.id === selectedRaceId
            ? { ...r, elapsedSeconds: r.elapsedSeconds + 1 }
            : r
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedRace?.timerRunning, selectedRaceId]);

  // ── Race mutation helpers ────────────────────────────────────────────────

  const updateRace = useCallback(
    (raceId: string, updater: (r: MockRace) => MockRace) => {
      setRaces((prev) => prev.map((r) => (r.id === raceId ? updater(r) : r)));
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

  // ── UC-RR-01: Inspection actions ─────────────────────────────────────────

  const handleClearLane = (raceId: string, laneId: string) => {
    updateLane(raceId, laneId, (l) => ({
      ...l,
      inspectionStatus: "cleared",
      inspectedAt: new Date().toISOString(),
    }));
    addToast("Lane cleared for track entry.", "success");
  };

  const handleFailLane = (
    raceId: string,
    laneId: string,
    status: "disqualified" | "withdrawn",
    category: string,
    notes: string
  ) => {
    const formattedReason = `${category}${notes.trim() ? ` — ${notes.trim()}` : ""}`;
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
  };

  // ── UC-RR-02: Transition to Live ─────────────────────────────────────────

  const handleTransitionToLive = (raceId: string) => {
    const race = races.find((r) => r.id === raceId);
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

  // ── UC-RR-03: Violations ─────────────────────────────────────────────────

  const handleLogViolation = (
    raceId: string,
    laneId: string,
    category: ViolationCategory,
    notes: string
  ) => {
    const currentId = `v-${Date.now()}`;
    const currentTimestamp = new Date().toISOString();

    const violation: Violation = {
      id: currentId,
      category,
      notes,
      timestamp: currentTimestamp,
    };
    updateLane(raceId, laneId, (l) => ({
      ...l,
      violations: [...l.violations, violation],
    }));
    addToast(`Violation logged: ${category}`, "warning");
  };

  // ── UC-RR-04: End Race & Confirm Results ─────────────────────────────────

  const handleEndRace = (raceId: string) => {
    const race = races.find((r) => r.id === raceId);
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

  const handleConfirmResults = (raceId: string) => {
    const race = races.find((r) => r.id === raceId);
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
    updateRace(raceId, (r) => ({ ...r, phase: "report" }));
    addToast("Results captured. Ready for final report generation.", "success");
  };

  const handleEditResults = (raceId: string) => {
    updateRace(raceId, (r) => ({ ...r, phase: "concluded" }));
    addToast(
      "Unlocked results for editing. Make your changes and re-confirm.",
      "info"
    );
  };

  // ── UC-RR-05: Report ─────────────────────────────────────────────────────

  const handleSaveReportDraft = (raceId: string, notes: string) => {
    updateRace(raceId, (r) => ({ ...r, reportNotes: notes }));
    addToast("Draft saved.", "info");
  };

  const handleSubmitReport = (raceId: string) => {
    const race = races.find((r) => r.id === raceId);
    if (!race) return;
    const unresolvedViolations = race.lanes
      .flatMap((l) => l.violations)
      .filter((v) => !v.category);
    if (unresolvedViolations.length > 0) {
      addToast(
        "All logged violations must be fully resolved before submission.",
        "error"
      );
      return;
    }
    updateRace(raceId, (r) => ({ ...r, reportSubmitted: true }));
    addToast(
      "Report submitted successfully. Your track duties for this race are complete.",
      "success"
    );
  };

  // ── Content Switch ────────────────────────────────────────────────────────

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
          horseName: l.horseName,
          laneNumber: l.laneNumber,
        }))
      );

      return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Back Button + Header */}
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

          {/* Phase-specific content */}
          {race.phase === "scheduled" && (
            <PreRaceInspectionPanel
              race={race}
              onClearLane={(laneId) => handleClearLane(race.id, laneId)}
              onFailLane={(laneId, status, category, notes) =>
                handleFailLane(race.id, laneId, status, category, notes)
              }
              onTransitionToLive={() => handleTransitionToLive(race.id)}
            />
          )}
          {race.phase === "live" && (
            <LiveMonitorPanel
              race={race}
              allViolations={allViolations}
              onDelayRace={() => handleDelayRace(race.id)}
              onResumeRace={() => handleResumeRace(race.id)}
              onEndRace={() => handleEndRace(race.id)}
              onLogViolation={(laneId, category, notes) =>
                handleLogViolation(race.id, laneId, category, notes)
              }
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
              onSetFlag={(laneId, flag) => handleSetFlag(race.id, laneId, flag)}
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
            />
          )}
        </div>
      );
    }

    switch (active) {
      case ROUTES.REFEREE_DASHBOARD:
        return (
          <RefereeDashboard
            races={races}
            onViewAll={() => {
              setActive(ROUTES.REFEREE_RACE_LIST);
              setFilterPhase("all");
            }}
            onSelectRace={(id) => {
              setSelectedRaceId(id);
              setActive(ROUTES.REFEREE_RACE_LIST);
            }}
          />
        );
      case ROUTES.REFEREE_RACE_LIST:
        return (
          <RefereeRaceList
            races={races}
            filterPhase={filterPhase}
            onFilterChange={setFilterPhase}
            onSelectRace={(id) => setSelectedRaceId(id)}
          />
        );
      default:
        return (
          <RefereeDashboard
            races={races}
            onViewAll={() => {
              setActive(ROUTES.REFEREE_RACE_LIST);
              setFilterPhase("all");
            }}
            onSelectRace={(id) => {
              setSelectedRaceId(id);
              setActive(ROUTES.REFEREE_RACE_LIST);
            }}
          />
        );
    }
  };

  // ── Main Render ───────────────────────────────────────────────────────────

  return (
    <UserLayout
      activeKey={active}
      onActiveKeyChange={(key) => {
        setActive(key);
        setSelectedRaceId(null);
      }}
    >
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        {/* Floating Toasts */}
        <ToastContainer toasts={toasts} />

        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
