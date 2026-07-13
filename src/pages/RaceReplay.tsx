import { useEffect, useRef, useState, useMemo } from "react";
import {
  Flag,
  Trophy,
  Clock,
  Pause,
  Play,
  ArrowUp,
  ArrowDown,
  Minus,
  ChessKnight,
  Hash,
  Layers,
} from "lucide-react";
import { replay } from "../test/mockReplay.ts";
import type {
  HorseData,
  HorseState,
  HorseTimelinePoint,
} from "../types/live.ts";
import { useRaceDetail } from "../hooks/useRaces.ts";
import { useParams } from "react-router-dom";

const RACE_DURATION = 80000;
const RACE_DISTANCE = 600;

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

const lerp = (timeline: HorseTimelinePoint[], t: number): number => {
  if (!timeline?.length) return 0;
  if (t <= 0) return timeline[0].distance;
  if (t >= RACE_DURATION) return timeline[timeline.length - 1].distance;
  let i = 0;
  while (i < timeline.length - 1 && timeline[i + 1].time < t) i++;
  const p1 = timeline[i],
    p2 = timeline[i + 1];
  if (p2.time === p1.time) return p1.distance;
  return (
    p1.distance +
    (p2.distance - p1.distance) * ((t - p1.time) / (p2.time - p1.time))
  );
};

const speedAt = (timeline: HorseTimelinePoint[], t: number) =>
  (lerp(timeline, t) - lerp(timeline, Math.max(0, t - 1000))) * 3.6;

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.${String(Math.floor((ms % 1000) / 10)).padStart(2, "0")}`;
};

const pct = (d: number) =>
  Math.min(100, Math.max(0, (d / RACE_DISTANCE) * 100));

export default function RaceReplay() {
  const { id } = useParams<{ id: string }>();

  const { detail: raceDetail } = useRaceDetail(id!);

  const animRef = useRef<number>(1);
  const prevRanksRef = useRef<Map<string, number>>(new Map());
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [horses, setHorses] = useState<HorseState[]>([]);
  const [standings, setStandings] = useState<HorseState[]>([]);
  const [rankChanges, setRankChanges] = useState<Record<string, number>>({});

  const initialHorses = useMemo(
    () =>
      (replay?.horses ?? []).map((h: HorseData, i: number) => ({
        ...h,
        laneIndex: i + 1,
        currentDistance: 0,
        rank: i + 1,
        rankChange: 0,
        speed: 0,
        finished: false,
        color: HORSE_COLORS[i % HORSE_COLORS.length],
      })),
    []
  );

  const update = (t: number) => {
    if (!initialHorses.length) return;
    const next = initialHorses.map((h) => ({
      ...h,
      currentDistance: lerp(h.timeline, t),
      speed: speedAt(h.timeline, t),
      finished: lerp(h.timeline, t) >= RACE_DISTANCE,
    }));
    const sorted = [...next].sort(
      (a, b) => b.currentDistance - a.currentDistance
    );
    sorted.forEach((h, i) => {
      const newRank = i + 1;
      const prevRank = prevRanksRef.current.get(h.id) ?? newRank;

      h.rank = newRank;
      h.rankChange = prevRank - newRank;

      if (prevRank !== newRank) {
        setRankChanges((prev) => ({
          ...prev,
          [h.id]: prevRank - newRank,
        }));
      }

      prevRanksRef.current.set(h.id, newRank);
    });
    setHorses(next);
    setStandings(sorted);
  };

  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const getRaceElapsed = () => {
    return Date.now() - startTime.current;
  };

  useEffect(() => {
    if (!raceDetail?.scheduledAt) return;

    const tick = () => {
      const elapsed = getRaceElapsed();

      if (elapsed < 0) {
        setTime(0);
        return;
      }

      if (elapsed >= RACE_DURATION) {
        setTime(RACE_DURATION);
        update(RACE_DURATION);
        setPlaying(false);
        return;
      }

      setTime(elapsed);
      update(elapsed);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceDetail]);

  return (
    <div className="w-full h-full flex flex-col max-w-[1400px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-200">
      <div className="shrink-0 bg-primary text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Flag className="w-7 h-7 text-[#D4AF37]" />
          <div className="space-y-1">
            {raceDetail?.name && (
              <div className="text-[18px] font-bold uppercase tracking-widest text-white truncate">
                {raceDetail?.name}
              </div>
            )}
            <div className="flex flex-wrap w-full items-center gap-2 font-semibold text-xs text-white">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(raceDetail?.scheduledAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Flag className="h-3.5 w-3.5" />
                {raceDetail?.course?.name || "Venue"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Hash className="h-3.5 w-3.5" />
                {raceDetail?.raceNumber != null
                  ? `Race #${raceDetail?.raceNumber}`
                  : "Race TBC"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Trophy className="h-3.5 w-3.5" />
                {raceDetail?.course?.distanceMeters
                  ? `${raceDetail?.course.distanceMeters}m`
                  : raceDetail?.distanceMeters
                    ? `${raceDetail?.distanceMeters}m`
                    : "Distance TBC"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold capitalize">
                {raceDetail?.course?.surfaceType || "Standard"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                <Layers className="h-3.5 w-3.5" />
                {raceDetail?.laneCount
                  ? `${raceDetail?.laneCount} Lanes`
                  : "Lanes TBC"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="z-30 w-8 h-8 bg-white text-[#064E3B] rounded-full flex items-center justify-center shadow border border-slate-200"
          >
            {playing ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play size={12} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          <span className="text-3xl font-mono font-bold tabular-nums">
            {formatTime(time)}
          </span>
        </div>
      </div>

      <div className="shrink-0 relative bg-green-800">
        <div className="relative w-full" style={{ height: horses.length * 44 }}>
          <div
            className="absolute top-0 bottom-0 right-2 w-2 z-10"
            style={{
              backgroundImage:
                "repeating-conic-gradient(#fff 0% 25%,#111 0% 50%)",
              backgroundSize: "8px 20px",
            }}
          />
          {horses.map((h) => (
            <div
              key={h.id}
              className={`relative flex mr-8 items-center border-b border-slate-200 ${
                h.laneIndex & 1 ? "bg-green-700" : "bg-green-600"
              }`}
              style={{ height: 44 }}
            >
              <div
                className="absolute left-3 z-20 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: h.color }}
              >
                {h.laneIndex}
              </div>
              <div
                className="absolute z-20 transition-all duration-75 ease-linear"
                style={{
                  left: `${pct(h.currentDistance)}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="w-10 flex items-center justify-end">
                  <div
                    className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: h.color }}
                  >
                    {h.name} - {h.currentDistance.toFixed(1)}m
                  </div>
                  <ChessKnight
                    className="flex-shrink-0 scale-x-[-1]"
                    fill={h.color}
                    size={20}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-slate-50 border-t border-slate-200">
        <div className="shrink-0 px-6 py-3 flex items-center gap-2 border-b border-slate-200 bg-white">
          <Trophy className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-black text-[#064E3B] uppercase tracking-wide text-sm">
            Live Standings
          </h3>
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 overflow-y-auto">
          {standings.map((h) => (
            <div
              key={h.id}
              className="bg-white p-3 flex items-center justify-between hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    h.rank === 1
                      ? "bg-[#D4AF37] text-white"
                      : h.rank <= 3
                        ? "bg-[#064E3B] text-white"
                        : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {h.rank}
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-bold text-slate-800 text-sm leading-tight"
                    style={{ color: h.color }}
                  >
                    {h.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Lane {h.laneIndex}
                  </span>
                </div>
                {(rankChanges[h.id] ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ArrowUp size={14} strokeWidth={3} />
                    <span className="text-xs font-bold">
                      +{rankChanges[h.id]}
                    </span>
                  </span>
                )}

                {(rankChanges[h.id] ?? 0) < 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <ArrowDown size={14} strokeWidth={3} />
                    <span className="text-xs font-bold">
                      {Math.abs(rankChanges[h.id])}
                    </span>
                  </span>
                )}

                {(rankChanges[h.id] ?? 0) === 0 && (
                  <Minus size={12} className="text-slate-300" />
                )}
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-sm font-bold text-slate-700 tabular-nums">
                  {h.currentDistance.toFixed(1)}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                    m
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "TBC";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
