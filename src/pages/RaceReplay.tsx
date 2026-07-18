import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Flag,
  Trophy,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Square,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { RaceTick } from "../types/live";
import { useRaceDetail } from "../hooks/useRaces";
import { AdminService } from "../services/AdminService";
import NotFoundContent from "../components/ui/NotFoundContent";
import { ToastContainer } from "../components/ui/toast";
import { useToast } from "../hooks/useToast";
import { ResultModal } from "../components/race/ResultModal";
import { PredictionsSidebar } from "../components/spectator/PredictionsSidebar";
import { RaceAndHorseDetails } from "../components/race/RaceAndHorseDetails";
import { TournamentSidebar } from "../components/race/TournamentSidebar";
import { TournamentService } from "../services/TournamentService";
import type { TournamentDetail, RaceItem } from "../types/tournament";

const HORSE_COLORS = [
  "#064E3B",
  "#D4AF37",
  "#0F766E",
  "#B45309",
  "#334155",
  "#7C2D12",
  "#166534",
  "#92400E",
  "#1E3A8A",
  "#4D7C0F",
  "#065F46",
  "#9F1239",
];

const HORSE_FILTERS: Record<string, string> = {
  "#064E3B": "hue-rotate(120deg) saturate(250%) brightness(70%)",
  "#D4AF37": "hue-rotate(25deg) saturate(220%) brightness(130%)",
  "#0F766E": "hue-rotate(150deg) saturate(220%) brightness(90%)",
  "#B45309": "hue-rotate(5deg) saturate(260%) brightness(95%)",
  "#334155": "hue-rotate(200deg) saturate(40%) brightness(75%)",
  "#7C2D12": "hue-rotate(-10deg) saturate(260%) brightness(75%)",
  "#166534": "hue-rotate(110deg) saturate(220%) brightness(85%)",
  "#92400E": "hue-rotate(10deg) saturate(240%) brightness(95%)",
  "#1E3A8A": "hue-rotate(220deg) saturate(240%) brightness(85%)",
  "#4D7C0F": "hue-rotate(80deg) saturate(220%) brightness(90%)",
  "#065F46": "hue-rotate(145deg) saturate(200%) brightness(80%)",
  "#9F1239": "hue-rotate(310deg) saturate(260%) brightness(90%)",
};
const RANK_CHANGE_DURATION_MS = 2500;

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60
  ).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
};

const formatStatus = (status: string) => {
  const s = status.toLowerCase();
  switch (s) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "scratched":
      return "Scratched";
    case "dns":
      return "Did Not Start";
    case "dnf":
      return "Did Not Finish";
    case "did_not_finish":
      return "Did Not Finish";
    case "disqualified":
      return "Disqualified";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
};

const getStatusBadgeClass = (status: string) => {
  const s = status.toLowerCase();
  switch (s) {
    case "pending":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "confirmed":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "scratched":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "dns":
    case "withdrawn":
      return "border border-slate-200 bg-slate-50 text-slate-400";
    case "dnf":
    case "did_not_finish":
      return "border border-slate-200 bg-slate-100 text-slate-700";
    case "disqualified":
      return "border border-red-200 bg-red-50 text-red-800";
    default:
      return "border border-slate-100 bg-slate-50 text-slate-600";
  }
};

export default function RaceReplay() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    detail: RaceDetail,
    loading: detailLoading,
    error: detailError,
    latestTick,
    finalPlacements,
  } = useRaceDetail(id!);

  const prevRanksRef = useRef<Map<string, number>>(new Map());

  const [rankChanges, setRankChanges] = useState<
    Record<string, { change: number; timestamp: number }>
  >({});

  const [simulating, setSimulating] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const dismissedResultRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const [predictedHorseName, setPredictedHorseName] = useState<string | null>(
    null
  );
  const [hoveredHorse, setHoveredHorse] = useState<any | null>(null);
  const [selectedHorse, setSelectedHorse] = useState<any | null>(null);
  const [countdownText, setCountdownText] = useState<string | null>(null);

  useEffect(() => {
    if (
      RaceDetail?.status !== "scheduled" &&
      RaceDetail?.status !== "pre_race"
    ) {
      const timer = setTimeout(() => setCountdownText(null), 0);
      return () => clearTimeout(timer);
    }

    const targetTime = RaceDetail.scheduledAt
      ? new Date(RaceDetail.scheduledAt).getTime()
      : 0;
    if (!targetTime) {
      const timer = setTimeout(() => setCountdownText(null), 0);
      return () => clearTimeout(timer);
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdownText("00:00");
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      if (hours > 0) {
        setCountdownText(
          `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      } else {
        setCountdownText(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [RaceDetail?.status, RaceDetail?.scheduledAt]);

  const [tournamentDetail, setTournamentDetail] =
    useState<TournamentDetail | null>(null);
  const [tournamentRaces, setTournamentRaces] = useState<RaceItem[]>([]);

  useEffect(() => {
    let active = true;
    if (RaceDetail?.tournamentId) {
      TournamentService.getTournamentByID(RaceDetail.tournamentId)
        .then((data) => {
          if (active) setTournamentDetail(data);
        })
        .catch(console.error);

      TournamentService.getTournamentRaces(RaceDetail.tournamentId, {
        limit: 50,
      })
        .then((res) => {
          if (active) setTournamentRaces(res.data || []);
        })
        .catch(console.error);
    }
    return () => {
      active = false;
    };
  }, [RaceDetail?.tournamentId]);

  useEffect(() => {
    if (
      latestTick &&
      !simulating &&
      latestTick.elapsedMs > 0 &&
      !manuallyStoppedRef.current
    ) {
      const timer = setTimeout(() => setSimulating(true), 0);
      return () => clearTimeout(timer);
    }
  }, [latestTick, simulating]);

  const handlePredictionChange = useCallback((name: string | null) => {
    setPredictedHorseName(name);
  }, []);

  const { toasts, addToast } = useToast();

  const currentTick: RaceTick | null = latestTick;
  const time = currentTick?.elapsedMs ?? 0;

  const handleStartSimulate = async () => {
    setSimLoading(true);
    try {
      await AdminService.startSimulation(id!);
      manuallyStoppedRef.current = false;
      setSimulating(true);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      addToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to start simulation",
        "error"
      );
    } finally {
      setSimLoading(false);
    }
  };

  const handleStopSimulate = async () => {
    setSimLoading(true);
    try {
      await AdminService.stopSimulation(id!);
      manuallyStoppedRef.current = true;
      setSimulating(false);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      addToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to stop simulation",
        "error"
      );
    } finally {
      setSimLoading(false);
    }
  };

  const entries = RaceDetail?.entries;

  const qualifiedEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter(
      (entry) =>
        ["pending", "confirmed", "did_not_finish", "disqualified"].includes(
          entry.entryStatus?.toLowerCase() || ""
        ) && !!entry.jockeyName
    );
  }, [entries]);

  const horseMeta = useMemo(() => {
    if (qualifiedEntries.length === 0) return [];

    const metaMap = new Map<
      string,
      {
        id: string;
        name: string;
        laneIndex: number;
        color: string;
        entryStatus?: string;
        jockeyName?: string;
        weightKg?: string;
        clothNumber?: number;
        trainerName?: string;
      }
    >();

    const sortedEntries = [...qualifiedEntries].sort((a, b) => {
      const aLane = parseInt(a.laneNumber, 10) || 0;
      const bLane = parseInt(b.laneNumber, 10) || 0;
      return aLane - bLane;
    });

    sortedEntries.forEach((entry, index) => {
      const horseId = entry.horseId || entry.id;
      metaMap.set(horseId, {
        id: horseId,
        name: entry.name,
        laneIndex: parseInt(entry.laneNumber, 10) || index + 1,
        color: HORSE_COLORS[index % HORSE_COLORS.length],
        entryStatus: entry.entryStatus,
        jockeyName: entry.jockeyName,
        weightKg: entry.weightKg,
        clothNumber: entry.clothNumber,
        trainerName: entry.trainerName,
      });
    });

    return Array.from(metaMap.values());
  }, [qualifiedEntries]);

  // Rank change detection
  useEffect(() => {
    if (!currentTick) return;

    const sorted = [...currentTick.horses].sort(
      (a, b) => b.positionM - a.positionM
    );

    const changes: Record<string, { change: number; timestamp: number }> = {};
    const newRanks = new Map<string, number>();

    sorted.forEach((horse, index) => {
      const newRank = index + 1;
      const oldRank = prevRanksRef.current.get(horse.horseId) ?? newRank;

      if (oldRank !== newRank) {
        changes[horse.horseId] = {
          change: oldRank - newRank,
          timestamp: Date.now(),
        };
      }
      newRanks.set(horse.horseId, newRank);
    });

    prevRanksRef.current = newRanks;

    if (Object.keys(changes).length > 0) {
      setRankChanges((prev) => ({ ...prev, ...changes }));
    }
  }, [currentTick]);

  // Expire rank change indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRankChanges((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([id, val]) => {
          if (now - val.timestamp > RANK_CHANGE_DURATION_MS) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      !dismissedResultRef.current &&
      (RaceDetail?.status === "under_review" ||
        RaceDetail?.status === "completed")
    ) {
      setShowResultModal(true);
      setSimulating(false);
    }
  }, [RaceDetail?.status]);

  const rankedHorses = useMemo(() => {
    if (currentTick?.horses) {
      const activeTickHorses = currentTick.horses.filter((horse) => {
        const meta = horseMeta.find((m) => m.id === horse.horseId);
        return !!meta;
      });
      return [...activeTickHorses].sort((a, b) => b.positionM - a.positionM);
    }
    return horseMeta.map((meta) => ({
      horseId: meta.id,
      name: meta.name,
      positionM: 0,
      speedMs: 0,
      progressPct: 0,
      finished: false,
    }));
  }, [currentTick, horseMeta]);

  const OVERRUN_PCT = 2;

  const laneHorses = useMemo(() => {
    return horseMeta.map((meta) => {
      const horse = currentTick?.horses?.find((h) => h.horseId === meta.id);
      const progressPct = horse?.progressPct ?? 0;
      const finished = horse?.finished ?? false;

      return {
        ...meta,
        positionM: horse?.positionM ?? 0,
        progressPct,
        displayPct: finished
          ? Math.min(100 + OVERRUN_PCT, progressPct + OVERRUN_PCT)
          : progressPct,
        speedMs: horse?.speedMs ?? 0,
        finished,
        rank: rankedHorses.findIndex((h) => h.horseId === meta.id) + 1,
      };
    });
  }, [horseMeta, currentTick, rankedHorses]);

  if (detailLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Loading race replay...
        </p>
      </div>
    );
  }

  if (detailError) {
    return (
      <NotFoundContent
        title="Error"
        message={detailError}
        actionLabel="Go Back"
        onAction={() => navigate(-1)}
      />
    );
  }

  if (!RaceDetail) {
    return (
      <NotFoundContent
        title="Race not found"
        message="We couldn't find the race you're looking for."
        actionLabel="Go Back"
        onAction={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-row gap-3 bg-slate-100 p-3 font-sans overflow-hidden">
      {/* ═══ Left Column: Tournament ═══ */}
      <div className="shrink-0 w-72 h-full flex flex-col overflow-hidden">
        <TournamentSidebar
          tournament={tournamentDetail}
          races={tournamentRaces}
          currentRaceId={id!}
        />
      </div>

      {/* ═══ Center/Left Column: Header + Track + Standings ═══ */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-primary text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition"
            >
              <ArrowLeft size={14} />
              Exit
            </button>
            <Flag className="w-7 h-7 text-[#D4AF37]" />
            <div className="space-y-1">
              {RaceDetail?.name && (
                <div className="text-[18px] font-bold uppercase tracking-widest truncate">
                  {RaceDetail.name}
                </div>
              )}
              {tournamentDetail?.name && (
                <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  {tournamentDetail.name}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!simulating ? (
              <button
                onClick={handleStartSimulate}
                disabled={simLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Play size={14} fill="currentColor" />
                Simulate
              </button>
            ) : (
              <button
                onClick={handleStopSimulate}
                disabled={simLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                <Square size={14} />
                Stop
              </button>
            )}
            {countdownText ? (
              <div
                className="flex items-center gap-2 bg-slate-900/60 shadow-inner px-4 py-1.5 rounded-lg border border-white/10"
                title="Predictions close in"
              >
                <Clock className="w-4 h-4 text-emerald-400 opacity-80" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Lock:
                </span>
                <span className="text-xl font-mono font-bold tabular-nums text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                  {countdownText}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-900/60 shadow-inner px-4 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-[#D4AF37] opacity-80" />
                <span className="text-2xl font-mono font-bold tabular-nums text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                  {formatTime(time)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Track */}
        <div className="shrink-0 max-h-[300px] overflow-y-auto border-b border-slate-200/60 shadow-inner">
          <div
            className={`relative ${
              ["dirt", "sand", "clay"].includes(
                RaceDetail?.course?.surfaceType?.toLowerCase() || ""
              )
                ? "bg-[#8B5A2B]/80"
                : "bg-[#1B4D3E]/80"
            }`}
          >
            <div
              className="relative w-full"
              style={{ height: horseMeta.length * 60 }}
            >
              {/* Checkered Finish Line */}
              <div className="absolute top-0 bottom-0 right-0 w-[60px] z-20 flex">
                <div className="w-[3px] bg-red-600 h-full shadow-[-2px_0_4px_rgba(220,38,38,0.5)] z-30" />
                <div
                  className="flex-1 h-full"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(#fff 0% 25%, #111 0% 50%)",
                    backgroundSize: "30px 30px",
                  }}
                />
              </div>

              {/* Progress Lines */}
              <div className="absolute left-[50px] right-[60px] top-0 bottom-0 pointer-events-none z-10">
                {[20, 40, 60, 80].map((pct) => {
                  const totalDist =
                    RaceDetail?.course?.distanceMeters ||
                    RaceDetail?.distanceMeters;
                  const markerDist = totalDist
                    ? `${Math.round((totalDist * pct) / 100)}m`
                    : `${pct}%`;
                  return (
                    <div
                      key={pct}
                      className="absolute top-0 bottom-0 border-l border-dashed border-white/20 flex flex-col justify-start pt-1.5"
                      style={{ left: `${pct}%` }}
                    >
                      <span className="text-[9px] font-black font-mono text-white/50 -translate-x-1/2 select-none bg-slate-900/40 px-1 py-0.5 rounded backdrop-blur-xs">
                        {markerDist}
                      </span>
                    </div>
                  );
                })}
              </div>
              {laneHorses.map((horse) => {
                const isDirt = ["dirt", "sand", "clay"].includes(
                  RaceDetail?.course?.surfaceType?.toLowerCase() || ""
                );
                const isStopped =
                  !simulating ||
                  horse.speedMs === 0 ||
                  horse.finished ||
                  ["disqualified", "dnf", "dns", "scratched"].includes(
                    horse.entryStatus?.toLowerCase() || ""
                  );
                const isPredicted = predictedHorseName === horse.name;

                return (
                  <div
                    key={horse.id}
                    className={`relative flex items-center border-b border-black/10 ${
                      horse.laneIndex % 2
                        ? isDirt
                          ? "bg-[#A0522D]/80"
                          : "bg-[#228B22]/80"
                        : isDirt
                          ? "bg-[#8B5A2B]/80"
                          : "bg-[#1B4D3E]/80"
                    }`}
                    style={{ height: 60 }}
                  >
                    {/* Metallic Starting Stalls */}
                    <div className="absolute left-0 z-10 w-[50px] h-full bg-slate-200/50 border-r-2 border-r-slate-400 flex items-center justify-center shadow-[2px_0_8px_rgba(0,0,0,0.3)]">
                      <span className="text-slate-800 font-black text-xl opacity-40">
                        {horse.laneIndex}
                      </span>
                    </div>

                    {/* Runnable Area */}
                    <div className="absolute left-[50px] right-[60px] top-0 bottom-0">
                      <div
                        className={`absolute z-20 horse-runner pr-8 ${horse.finished ? "finished" : ""} cursor-pointer`}
                        style={{
                          left: `${horse.displayPct}%`,
                          transform: "translateX(-50%)",
                          transition: horse.finished
                            ? "left 900ms cubic-bezier(0.16, 1, 0.3, 1)"
                            : "left 450ms linear",
                        }}
                        onMouseEnter={() => {
                          const entry = RaceDetail?.entries?.find(
                            (e) => e.name === horse.name
                          );
                          if (entry)
                            setHoveredHorse({
                              ...entry,
                              laneNumber: horse.laneIndex,
                            });
                        }}
                        onMouseLeave={() => setHoveredHorse(null)}
                        onClick={() => {
                          const entry = RaceDetail?.entries?.find(
                            (e) => e.name === horse.name
                          );
                          if (entry) {
                            setSelectedHorse(
                              selectedHorse?.id === entry.id
                                ? null
                                : { ...entry, laneNumber: horse.laneIndex }
                            );
                          }
                        }}
                      >
                        <div className="horse-body w-10 flex items-center justify-end mt-1.5">
                          {!isStopped && (
                            <>
                              <div
                                className="dust"
                                style={{
                                  backgroundColor: isDirt
                                    ? "#D2B48C"
                                    : "#90EE90",
                                }}
                              />
                              <div
                                className="dust delay-1"
                                style={{
                                  backgroundColor: isDirt
                                    ? "#D2B48C"
                                    : "#90EE90",
                                }}
                              />
                              <div
                                className="dust delay-2"
                                style={{
                                  backgroundColor: isDirt
                                    ? "#D2B48C"
                                    : "#90EE90",
                                }}
                              />
                            </>
                          )}

                          <div
                            className={`shrink-0 rounded-full pl-1.5 pr-3 py-0.5 flex items-center gap-1.5 backdrop-blur-xs border shadow-lg ${
                              isPredicted
                                ? "bg-gradient-to-r from-amber-400 to-[#D4AF37] text-amber-950 border-amber-300 font-extrabold ring-2 ring-[#D4AF37]/35 scale-105 shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                                : "bg-slate-900/80 border-white/10 text-white"
                            }`}
                            style={{
                              borderLeftColor: isPredicted
                                ? undefined
                                : horse.color,
                              borderLeftWidth: isPredicted ? undefined : "4px",
                            }}
                          >
                            {isPredicted && (
                              <span className="text-[10px] text-amber-900 select-none">
                                ★
                              </span>
                            )}
                            <span className="text-[10px] font-bold tracking-wide">
                              {horse.name}
                            </span>
                          </div>

                          <div
                            className="inline-block"
                            style={{
                              transform: "scaleX(-1)",
                              filter: HORSE_FILTERS[horse.color] ?? "none",
                            }}
                          >
                            <div
                              className={`horse-emoji text-4xl inline-block drop-shadow-[0_4px_4px_rgba(0,0,0,0.45)] ${
                                !isStopped ? "gallop" : ""
                              } ${horse.finished ? "finished" : ""}`}
                              style={{
                                transform: isStopped ? "scaleX(1)" : undefined,
                              }}
                            >
                              🐎
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Standings */}
        <div className="flex-1 min-h-0 flex flex-col bg-slate-50 border-t border-slate-200">
          <div className="shrink-0 px-6 py-3 flex items-center gap-2 border-b border-slate-200 bg-white">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-black text-[#064E3B] uppercase tracking-wide text-sm">
              Live Standings
            </h3>
          </div>
          {/* Table Header */}
          <div className="shrink-0 grid grid-cols-[40px_1fr_60px_80px_80px] gap-3 px-3 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div className="text-center">Rnk</div>
            <div>Horse</div>
            <div className="text-center">Chg</div>
            <div className="text-right">Dist</div>
            <div className="text-right">Spd</div>
          </div>
          <div className="flex-col gap-px bg-slate-200 overflow-y-auto">
            {rankedHorses.map((horse) => {
              const meta = horseMeta.find((m) => m.id === horse.horseId);
              const rank =
                rankedHorses.findIndex((h) => h.horseId === horse.horseId) + 1;
              const rankData = rankChanges[horse.horseId];
              const change = rankData?.change ?? 0;
              const isActive = !!rankData;
              const isPredicted = predictedHorseName === horse.name;
              const isSelected = selectedHorse?.name === horse.name;

              // Top 3 Styling
              let borderStyle: string;
              let bgStyle: string;
              if (rank === 1) {
                borderStyle = "border-l-[4px] border-l-[#D4AF37]"; // Gold
                bgStyle = "bg-yellow-50/50";
              } else if (rank === 2) {
                borderStyle = "border-l-[4px] border-l-[#94A3B8]"; // Silver
                bgStyle = "bg-slate-50/80";
              } else if (rank === 3) {
                borderStyle = "border-l-[4px] border-l-[#B45309]"; // Bronze
                bgStyle = "bg-orange-50/30";
              } else {
                borderStyle = "border-l-[4px] border-l-transparent";
                bgStyle = "bg-white";
              }

              return (
                <div
                  key={horse.horseId}
                  className={`p-3 grid grid-cols-[40px_1fr_60px_80px_80px] gap-3 items-center transition-colors cursor-pointer border-b border-slate-100 last:border-b-0 ${borderStyle} ${
                    isPredicted
                      ? isSelected
                        ? "bg-emerald-100/90 border-l-[4px] !border-l-[#D4AF37] ring-1 ring-emerald-600/10 hover:bg-emerald-200/80 shadow-xs"
                        : "bg-emerald-50/90 border-l-[4px] !border-l-[#D4AF37] ring-1 ring-emerald-600/5 hover:bg-emerald-100/80 shadow-xs"
                      : isSelected
                        ? "bg-slate-100 !border-l-slate-400 hover:bg-slate-200"
                        : `${bgStyle} hover:bg-slate-50`
                  }`}
                  onMouseEnter={() => {
                    const entry = RaceDetail?.entries?.find(
                      (e) => e.name === horse.name
                    );
                    if (entry)
                      setHoveredHorse({
                        ...entry,
                        laneNumber: meta?.laneIndex,
                      });
                  }}
                  onMouseLeave={() => setHoveredHorse(null)}
                  onClick={() => {
                    const entry = RaceDetail?.entries?.find(
                      (e) => e.name === horse.name
                    );
                    if (entry) {
                      setSelectedHorse(
                        selectedHorse?.id === entry.id
                          ? null
                          : { ...entry, laneNumber: meta?.laneIndex }
                      );
                    }
                  }}
                >
                  <div className="flex justify-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        rank === 1
                          ? "bg-gradient-to-br from-[#FDE047] to-[#D4AF37] text-yellow-900 border border-[#D4AF37]"
                          : rank <= 3
                            ? "bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800 border border-slate-400"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {rank}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className="font-bold text-sm leading-tight truncate flex items-center gap-1.5"
                      style={{ color: meta?.color }}
                      title={
                        meta
                          ? `Jockey: ${meta.jockeyName || "N/A"}\nWeight: ${meta.weightKg || "N/A"} kg\nCloth: ${meta.clothNumber ?? "N/A"}\nTrainer: ${meta.trainerName || "N/A"}\nStatus: ${meta.entryStatus || "N/A"}`
                          : undefined
                      }
                    >
                      {horse.name}
                      {isPredicted && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FDE047] to-[#D4AF37] text-[8px] font-black text-amber-950 uppercase tracking-wide shadow-xs border border-amber-300">
                          ★ Picked
                        </span>
                      )}
                      {meta?.entryStatus && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getStatusBadgeClass(meta.entryStatus)}`}
                        >
                          {formatStatus(meta.entryStatus)}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Lane {meta?.laneIndex}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    {isActive && change > 0 ? (
                      <span className="rank-change-indicator flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <ArrowUp size={12} strokeWidth={3} />
                        <span className="text-xs font-bold">{change}</span>
                      </span>
                    ) : isActive && change < 0 ? (
                      <span className="rank-change-indicator flex items-center gap-0.5 text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        <ArrowDown size={12} strokeWidth={3} />
                        <span className="text-xs font-bold">
                          {Math.abs(change)}
                        </span>
                      </span>
                    ) : (
                      <Minus size={12} className="text-slate-300" />
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-700 tabular-nums">
                      {horse.positionM.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                      m
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-slate-700 tabular-nums">
                      {horse.speedMs.toFixed(1)}
                    </span>
                    <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                      m/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Right Column: Sidebar ═══ */}
      <div className="shrink-0 w-72 flex flex-col gap-3 h-full overflow-hidden">
        {/* Predictions Panel — top ~45% */}
        <div className="h-[45%] shrink-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <PredictionsSidebar
            raceId={id!}
            raceStatus={RaceDetail?.status}
            raceName={RaceDetail?.name}
            entries={RaceDetail?.entries}
            firstHorseName={horseMeta[0]?.name}
            onPredictionChange={handlePredictionChange}
            isSimulating={simulating}
            elapsedMs={latestTick?.elapsedMs}
          />
        </div>

        {/* Race / Horse Details Panel — bottom ~55% */}
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <RaceAndHorseDetails
            raceDetail={RaceDetail}
            hoveredHorse={hoveredHorse}
            selectedHorse={selectedHorse}
            onClearSelection={() => setSelectedHorse(null)}
          />
        </div>
      </div>

      <ResultModal
        open={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          dismissedResultRef.current = true;
        }}
        raceName={RaceDetail?.name ?? "Race"}
        status={RaceDetail?.status ?? "draft"}
        placements={finalPlacements}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}
