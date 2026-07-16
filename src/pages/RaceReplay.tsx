import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Flag,
  Trophy,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  ChessKnight,
  Hash,
  Layers,
  Play,
  Square,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { RaceTick } from "../types/live";
import { useRaceDetail } from "../hooks/useRaces";
import { AdminService } from "../services/AdminService";
import NotFoundContent from "../components/ui/NotFoundContent";

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

const RANK_CHANGE_DURATION_MS = 2500;

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
  } = useRaceDetail(id!);

  const prevRanksRef = useRef<Map<string, number>>(new Map());

  const [rankChanges, setRankChanges] = useState<
    Record<string, { change: number; timestamp: number }>
  >({});

  const [simulating, setSimulating] = useState(false);
  const [simLoading, setSimLoading] = useState(false);

  const currentTick: RaceTick | null = latestTick;
  const time = currentTick?.elapsedMs ?? 0;

  const handleStartSimulate = async () => {
    setSimLoading(true);
    try {
      await AdminService.startSimulation(id!);
      setSimulating(true);
    } catch {
      // ignore
    } finally {
      setSimLoading(false);
    }
  };

  const handleStopSimulate = async () => {
    setSimLoading(true);
    try {
      await AdminService.stopSimulation(id!);
      setSimulating(false);
    } catch {
      // ignore
    } finally {
      setSimLoading(false);
    }
  };

  const horseMeta = useMemo(() => {
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

    if (currentTick?.horses) {
      currentTick.horses.forEach((horse) => {
        if (!metaMap.has(horse.horseId)) {
          metaMap.set(horse.horseId, {
            id: horse.horseId,
            name: horse.name,
            laneIndex: metaMap.size + 1,
            color: HORSE_COLORS[metaMap.size % HORSE_COLORS.length],
          });
        }
      });
    }

    return Array.from(metaMap.values());
  }, [currentTick]);
  console.log("horseMeta", horseMeta);

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

  const rankedHorses = useMemo(() => {
    if (!currentTick) return [];
    return [...currentTick.horses].sort((a, b) => b.positionM - a.positionM);
  }, [currentTick]);

  const laneHorses = useMemo(() => {
    if (!currentTick) return [];
    return horseMeta.map((meta) => {
      const horse = currentTick.horses.find((h) => h.horseId === meta.id);

      console.log({
        metaId: meta.id,
        metaName: meta.name,
        tickHorseIds: currentTick.horses.map((h) => h.horseId),
        found: horse,
      });
      return {
        ...meta,
        positionM: horse?.positionM ?? 0,
        progressPct: horse?.progressPct ?? 0,
        speedMs: horse?.speedMs ?? 0,
        finished: horse?.finished ?? false,
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
    <div className="w-full h-full flex flex-col max-w-[1400px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200">
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
            <div className="flex flex-wrap items-center gap-2 font-semibold text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(RaceDetail?.scheduledAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Flag className="h-3.5 w-3.5" />
                {RaceDetail?.course?.name || "Venue"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Hash className="h-3.5 w-3.5" />
                {RaceDetail?.raceNumber
                  ? `Race #${RaceDetail.raceNumber}`
                  : "Race TBC"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Trophy className="h-3.5 w-3.5" />
                {RaceDetail?.course?.distanceMeters
                  ? `${RaceDetail.course.distanceMeters}m`
                  : RaceDetail?.distanceMeters
                    ? `${RaceDetail.distanceMeters}m`
                    : "Distance TBC"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold capitalize">
                {RaceDetail?.course?.surfaceType || "Standard"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Layers className="h-3.5 w-3.5" />
                {RaceDetail?.laneCount
                  ? `${RaceDetail.laneCount} Lanes`
                  : "Lanes TBC"}
              </span>
            </div>
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
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-3xl font-mono font-bold tabular-nums">
            {formatTime(time)}
          </span>
        </div>
      </div>

      {/* Track */}
      <div className="shrink-0 relative bg-green-800">
        <div
          className="relative w-full"
          style={{ height: horseMeta.length * 44 }}
        >
          <div
            className="absolute top-0 bottom-0 right-2 w-2 z-20"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#fff 0% 25%, #111 0% 50%)",
              backgroundSize: "8px 20px",
            }}
          />
          {laneHorses.map((horse) => (
            <div
              key={horse.id}
              className={`relative flex items-center mr-8 border-b border-slate-200 ${
                horse.laneIndex % 2 ? "bg-green-700" : "bg-green-600"
              }`}
              style={{ height: 44 }}
            >
              <div
                className="absolute left-3 z-20 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: horse.color }}
              >
                {horse.laneIndex}
              </div>
              <div
                className="absolute z-20 transition-all duration-200 linear"
                style={{
                  left: `${horse.progressPct}%`,
                  transform: "translateX(-50%)",
                  transition: "left 450ms linear",
                }}
              >
                <div className="w-10 flex items-center justify-end">
                  <div
                    className="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: horse.color }}
                  >
                    {horse.name} - {horse.positionM.toFixed(1)}m
                    {horse.entryStatus && (
                      <span className="ml-1 text-[9px] opacity-80">
                        {horse.entryStatus}
                      </span>
                    )}
                  </div>
                  <ChessKnight
                    size={20}
                    fill={horse.color}
                    className="flex-shrink-0 scale-x-[-1]"
                  />
                </div>
              </div>
            </div>
          ))}
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
        <div className="flex-col gap-px bg-slate-200 overflow-y-auto">
          {rankedHorses.map((horse) => {
            const meta = horseMeta.find((m) => m.id === horse.horseId);
            const rank =
              rankedHorses.findIndex((h) => h.horseId === horse.horseId) + 1;
            const rankData = rankChanges[horse.horseId];
            const change = rankData?.change ?? 0;
            const isActive = !!rankData;

            return (
              <div
                key={horse.horseId}
                className="bg-white p-3 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      rank === 1
                        ? "bg-[#D4AF37] text-white"
                        : rank <= 3
                          ? "bg-[#064E3B] text-white"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {rank}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="font-bold text-sm leading-tight"
                      style={{ color: meta?.color }}
                      title={
                        meta
                          ? `Jockey: ${meta.jockeyName || "N/A"}\nWeight: ${meta.weightKg || "N/A"} kg\nCloth: ${meta.clothNumber ?? "N/A"}\nTrainer: ${meta.trainerName || "N/A"}\nStatus: ${meta.entryStatus || "N/A"}`
                          : undefined
                      }
                    >
                      {horse.name}
                      {meta?.entryStatus && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                          {meta.entryStatus}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Lane {meta?.laneIndex}
                    </span>
                  </div>
                  {isActive && change > 0 && (
                    <span className="rank-change-indicator flex items-center gap-1 text-emerald-600">
                      <ArrowUp size={14} strokeWidth={3} />
                      <span className="text-xs font-bold">+{change}</span>
                    </span>
                  )}
                  {isActive && change < 0 && (
                    <span className="rank-change-indicator flex items-center gap-1 text-red-600">
                      <ArrowDown size={14} strokeWidth={3} />
                      <span className="text-xs font-bold">
                        {Math.abs(change)}
                      </span>
                    </span>
                  )}
                  {!isActive && <Minus size={12} className="text-slate-300" />}
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-sm font-bold text-slate-700 tabular-nums">
                    {horse.positionM.toFixed(1)}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">
                      m
                    </span>
                  </span>
                  <span className="text-sm font-bold text-slate-700 tabular-nums">
                    {horse.speedMs.toFixed(2)}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">
                      m/s
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "TBC";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
