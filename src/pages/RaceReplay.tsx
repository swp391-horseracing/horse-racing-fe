import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Flag, Trophy, Clock, Play, Square } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { RaceTick } from "../types/live";
import type { RaceEntry } from "../types/race";
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

// Keyframe animations for rank changes
const rankChangeAnimations = `
  @keyframes moveUp {
    0% { transform: translateY(8px); opacity: 0.8; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes moveDown {
    0% { transform: translateY(-8px); opacity: 0.8; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes rankPulse {
    0%, 100% { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
    50% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
  }
`;

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
const RANK_CHANGE_DURATION_MS = 1000;

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
    s % 60
  ).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
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

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [simulating, setSimulating] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const dismissedResultRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const [predictedHorseName, setPredictedHorseName] = useState<string[]>([]);
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

  // Reset manual stop flag when navigating to a different race
  useEffect(() => {
    manuallyStoppedRef.current = false;
  }, [RaceDetail?.id]);

  useEffect(() => {
    if (
      latestTick &&
      !simulating &&
      latestTick.elapsedMs > 0 &&
      !manuallyStoppedRef.current &&
      !finalPlacements &&
      !["under_review", "completed"].includes(RaceDetail?.status ?? "")
    ) {
      const timer = setTimeout(() => setSimulating(true), 0);
      return () => clearTimeout(timer);
    }
  }, [latestTick, simulating, finalPlacements, RaceDetail?.status]);

  const handlePredictionChange = useCallback((names: string[]) => {
    setPredictedHorseName(names);
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

  const horseMeta = useMemo(() => {
    if (!currentTick?.horses?.length) return [];

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

    const entryMap = new Map<string, RaceEntry>();
    if (entries) {
      entries.forEach((e) => entryMap.set(e.horseId || e.id, e));
    }

    currentTick.horses.forEach((tickHorse, index) => {
      const entry = entryMap.get(tickHorse.horseId);
      metaMap.set(tickHorse.horseId, {
        id: tickHorse.horseId,
        name: tickHorse.name,
        laneIndex: index + 1,
        color: HORSE_COLORS[index % HORSE_COLORS.length],
        entryStatus: entry?.entryStatus,
        jockeyName: entry?.jockeyName,
        weightKg: entry?.weightKg,
        clothNumber: entry?.clothNumber,
        trainerName: entry?.trainerName,
      });
    });

    return Array.from(metaMap.values());
  }, [currentTick, entries]);

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
    if (!currentTick?.horses) return [];
    return [...currentTick.horses].sort((a, b) => b.positionM - a.positionM);
  }, [currentTick]);

  // Dynamic height calculation for live standings
  const { standingsHeight, detailsHeight } = useMemo(() => {
    const standingsHeaderHeight = 44 + 30; // h-11 + column header
    const rowHeight = 50; // Approximate height per horse row (including gaps)
    const standingsContentHeight = rankedHorses.length * rowHeight;
    const maxStandingsHeight = Math.min(
      standingsHeaderHeight + standingsContentHeight,
      Math.max(200, window.innerHeight * 0.68)
    );
    return {
      standingsHeight: `${maxStandingsHeight}px`,
      detailsHeight: `calc(100% - ${maxStandingsHeight + 12}px)`, // 12px is the gap size
    };
  }, [rankedHorses.length]);

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
      <style>{rankChangeAnimations}</style>
      {/* ═══ Left Column: Predictions + Tournament ═══ */}
      <div className="shrink-0 w-72 h-full flex flex-col gap-3 overflow-hidden">
        {/* Predictions Panel — sized to fit prediction slip perfectly */}
        <div className="h-[310px] shrink-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <PredictionsSidebar
            raceId={id!}
            raceStatus={RaceDetail?.status}
            raceName={RaceDetail?.name}
            entries={RaceDetail?.entries}
            firstHorseName={horseMeta[0]?.name}
            onPredictionChange={handlePredictionChange}
            isSimulating={simulating}
            elapsedMs={latestTick?.elapsedMs}
            predictionMinStake={RaceDetail?.predictionMinStake ?? 10}
          />
        </div>

        {/* Tournament schedule card — flex-1 to take remaining space */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <TournamentSidebar
            tournament={tournamentDetail}
            races={tournamentRaces}
            currentRaceId={id!}
          />
        </div>
      </div>

      {/* ═══ Center Column: Header + Track ═══ */}
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
            {isAdmin &&
              (!simulating ? (
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
              ))}
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

        {/* Track — Extended to take all remaining height of the center panel */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div
            className={`relative min-h-full ${
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
                const isPredicted = predictedHorseName.includes(horse.name);

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
                      {/* role="button" + keyboard handler instead of a real <button> tag —
                        doing so would break the absolute-positioned
                        gallop animation and horse name badge alignment on the track. */}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${horse.name}`}
                        className={`absolute z-20 horse-runner pr-8 ${horse.finished ? "finished" : ""} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:rounded`}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            const entry = RaceDetail?.entries?.find(
                              (en) => en.name === horse.name
                            );
                            if (entry)
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
      </div>

      {/* ═══ Right Column: Sidebar ═══ */}
      <div className="shrink-0 w-72 flex flex-col gap-3 h-full overflow-hidden">
        {/* Live Standings Panel — dynamic height based on horse count */}
        <div
          style={{ height: standingsHeight }}
          className="shrink-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden"
        >
          <div
            className="shrink-0 px-4 py-2.5 flex items-center gap-2 border-b border-slate-100"
            style={{ backgroundColor: "#ffffff", color: "#064E3B" }}
          >
            <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
            <h3 className="font-bold uppercase tracking-wider text-[11px]">
              Live Standings
            </h3>
          </div>
          {/* Compact Table Header for Sidebar */}
          <div className="shrink-0 grid grid-cols-[28px_1fr_50px_50px] gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200/60 text-[9px] font-bold text-slate-500 uppercase tracking-wider items-center">
            <div className="text-center">Rnk</div>
            <div>Horse</div>
            <div className="text-right">Dist</div>
            <div className="text-right">Spd</div>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-px bg-slate-100 p-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.5)_transparent]">
            {rankedHorses.map((horse) => {
              const meta = horseMeta.find((m) => m.id === horse.horseId);
              const rank =
                rankedHorses.findIndex((h) => h.horseId === horse.horseId) + 1;
              const rankData = rankChanges[horse.horseId];
              const change = rankData?.change ?? 0;
              const isActive = !!rankData;
              const isPredicted = predictedHorseName.includes(horse.name);
              const isSelected = selectedHorse?.name === horse.name;

              // Top 3 Styling
              let borderStyle: string;
              let bgStyle: string;
              if (rank === 1) {
                borderStyle = "border-l-[3px] border-l-[#D4AF37]"; // Gold
                bgStyle = "bg-yellow-50/50";
              } else if (rank === 2) {
                borderStyle = "border-l-[3px] border-l-[#94A3B8]"; // Silver
                bgStyle = "bg-slate-50/80";
              } else if (rank === 3) {
                borderStyle = "border-l-[3px] border-l-[#B45309]"; // Bronze
                bgStyle = "bg-orange-50/20";
              } else {
                borderStyle = "border-l-[3px] border-l-transparent";
                bgStyle = "bg-white";
              }

              const rankChangeColor =
                isActive && change > 0
                  ? "rgba(34, 197, 94, 0.15)"
                  : isActive && change < 0
                    ? "rgba(239, 68, 68, 0.15)"
                    : "transparent";

              const animationStyle: React.CSSProperties = isActive
                ? {
                    backgroundColor: rankChangeColor,
                    animation:
                      change > 0
                        ? "moveUp 0.5s ease-out"
                        : "moveDown 0.5s ease-out",
                    boxShadow:
                      change > 0
                        ? "0 4px 12px rgba(34, 197, 94, 0.3)"
                        : "0 4px 12px rgba(239, 68, 68, 0.3)",
                  }
                : {
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  };

              return (
                <div
                  key={horse.horseId}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select horse ${horse.name}`}
                  className={`grid grid-cols-[28px_1fr_50px_50px] gap-1.5 px-2 py-1.5 items-center cursor-pointer transition-all border border-slate-100/50 rounded-lg focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-emerald-500 ${bgStyle} ${borderStyle} ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-200"
                      : "hover:bg-slate-50"
                  }`}
                  style={animationStyle}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      const entry = RaceDetail?.entries?.find(
                        (en) => en.name === horse.name
                      );
                      if (entry)
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
                      className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        rank === 1
                          ? "bg-gradient-to-br from-[#FDE047] to-[#D4AF37] text-yellow-950 border border-[#D4AF37]"
                          : rank <= 3
                            ? "bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 border border-slate-350"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {rank}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className="font-extrabold text-[11px] leading-tight flex items-center gap-1"
                      style={{ color: meta?.color }}
                      title={
                        meta
                          ? `Jockey: ${meta.jockeyName || "N/A"}\nWeight: ${meta.weightKg || "N/A"} kg\nCloth: ${meta.clothNumber ?? "N/A"}\nTrainer: ${meta.trainerName || "N/A"}\nStatus: ${meta.entryStatus || "N/A"}`
                          : undefined
                      }
                    >
                      <span className="truncate">{horse.name}</span>
                      {isPredicted && (
                        <span className="inline-flex items-center text-[8px] font-black text-amber-600 shrink-0">
                          ★
                        </span>
                      )}
                    </span>
                    <span className="text-[8px] text-slate-400 font-semibold leading-none mt-0.5">
                      L: {meta?.laneIndex}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold font-mono text-slate-700 tabular-nums">
                      {horse.positionM.toFixed(0)}
                    </span>
                    <span className="text-[8px] font-normal text-slate-450 ml-0.5">
                      m
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold font-mono text-slate-700 tabular-nums">
                      {horse.speedMs.toFixed(0)}
                    </span>
                    <span className="text-[8px] font-normal text-slate-450 ml-0.5">
                      m/s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Race / Horse Details Panel — dynamic height */}
        <div
          style={{ height: detailsHeight }}
          className="min-h-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden"
        >
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
