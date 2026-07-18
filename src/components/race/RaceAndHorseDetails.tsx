import {
  Flag,
  Trophy,
  User,
  Layers,
  Calendar,
  CloudSun,
  ArrowLeft,
} from "lucide-react";
import type { RaceDetail } from "../../types/race";

interface RaceAndHorseDetailsProps {
  raceDetail: RaceDetail | null;
  hoveredHorse: any | null;
  selectedHorse: any | null;
  onClearSelection: () => void;
}

export function RaceAndHorseDetails({
  raceDetail,
  hoveredHorse,
  selectedHorse,
  onClearSelection,
}: RaceAndHorseDetailsProps) {
  // Determine which horse to show (hovered horse takes temporary priority, then pinned selection)
  const activeHorse = hoveredHorse || selectedHorse;

  // A horse is pinned if a selection exists and it matches the active horse
  const isPinned = !!selectedHorse && activeHorse?.id === selectedHorse?.id;

  // Generate dynamic weather info based on track condition for realism
  const getDynamicWeather = (condition?: string) => {
    const cond = condition?.toLowerCase() || "dry";
    if (cond === "dry") return "Sunny";
    if (cond === "wet") return "Showers";
    if (cond === "muddy") return "Rainy";
    if (cond === "heavy") return "Overcast";
    return "Sunny";
  };

  // Normalise stats to a percentage for visual progress bars
  const rawSpeed = activeHorse?.baseSpeed ?? 12;
  const speedPct = Math.min(100, Math.max(10, ((rawSpeed - 8) / 12) * 100));

  const rawStamina = activeHorse?.stamina ?? 150;
  const staminaPct = Math.min(
    100,
    Math.max(10, ((rawStamina - 80) / 140) * 100)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-white">
      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-slate-700 to-slate-800 text-white z-10">
        <div className="flex items-center gap-2">
          {activeHorse ? (
            <Trophy size={14} className="text-[#D4AF37]" />
          ) : (
            <Flag size={14} className="text-[#D4AF37]" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider transition-all duration-300">
            {activeHorse
              ? isPinned
                ? "Horse Details (Pinned)"
                : "Horse Details"
              : "Race Information"}
          </span>
        </div>
        {!!selectedHorse && (
          <button
            onClick={onClearSelection}
            className="p-1 rounded hover:bg-white/15 transition-colors text-white/80 hover:text-white cursor-pointer"
            title="Clear selection"
          >
            <ArrowLeft size={13} />
          </button>
        )}
      </div>

      {/* Content wrapper with absolute transition panes */}
      <div className="flex-1 overflow-hidden relative">
        {/* Pane 1: Race Details */}
        <div
          className={`absolute inset-0 p-4 flex flex-col gap-3 transition-all duration-300 ease-in-out transform ${
            activeHorse
              ? "opacity-0 pointer-events-none translate-y-3 scale-95"
              : "opacity-100 pointer-events-auto translate-y-0 scale-100"
          }`}
        >
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 tracking-wide leading-snug">
              {raceDetail?.name || "Derby Simulation"}
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Venue:{" "}
              {raceDetail?.course?.name || raceDetail?.venue || "Unknown Track"}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Layers size={13} className="text-slate-400" />
                <span>Distance</span>
              </div>
              <span className="font-bold text-slate-700">
                {raceDetail?.course?.distanceMeters ||
                  raceDetail?.distanceMeters ||
                  "TBC"}
                m
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Flag size={13} className="text-slate-400" />
                <span>Surface</span>
              </div>
              <span className="font-bold text-slate-700 capitalize">
                {raceDetail?.course?.surfaceType || "Standard"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={13} className="text-slate-400" />
                <span>Track Condition</span>
              </div>
              <span className="font-bold text-slate-700 capitalize">
                {raceDetail?.trackCondition || "Normal"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <CloudSun size={13} className="text-slate-400" />
                <span>Weather</span>
              </div>
              <span className="font-bold text-slate-700">
                {getDynamicWeather(raceDetail?.trackCondition)}
              </span>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 italic text-center mt-auto">
            Hover track or standings to inspect horses
          </p>
        </div>

        {/* Pane 2: Horse Details */}
        <div
          className={`absolute inset-0 p-4 flex flex-col gap-3 transition-all duration-300 ease-in-out transform ${
            activeHorse
              ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
              : "opacity-0 pointer-events-none -translate-y-3 scale-95"
          }`}
        >
          {activeHorse && (
            <>
              <div>
                <h4 className="font-extrabold text-base text-slate-800 tracking-wide">
                  {activeHorse.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Breed: {activeHorse.breed || "Thoroughbred"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-y border-slate-100 py-2.5">
                <div>
                  <span className="text-slate-400 block font-semibold">
                    Lane
                  </span>
                  <span className="font-bold text-slate-700 text-xs">
                    Lane {activeHorse.laneNumber ?? activeHorse.laneIndex}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">
                    Weight
                  </span>
                  <span className="font-bold text-slate-700 text-xs">
                    {activeHorse.weightKg
                      ? `${activeHorse.weightKg} kg`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 mb-1">
                    <span>Speed Stat</span>
                    <span className="text-emerald-600 font-mono">
                      {rawSpeed.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${speedPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 mb-1">
                    <span>Stamina</span>
                    <span className="text-blue-600 font-mono">
                      {rawStamina.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${staminaPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <User size={14} className="text-slate-400" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold leading-none">
                      Jockey
                    </span>
                    <span className="font-bold text-slate-700 truncate block">
                      {activeHorse.jockeyName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {!selectedHorse && (
                <p className="text-[9px] text-slate-400 italic text-center mt-auto">
                  Click horse in standings to pin selection
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
