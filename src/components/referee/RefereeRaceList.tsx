import { Flag, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { type MockRace, type RacePhase } from "../../types/referee";
import { cn } from "../../lib/utils";

interface RefereeRaceListProps {
  races: MockRace[];
  filterPhase: RacePhase | "all";
  onFilterChange: (phase: RacePhase | "all") => void;
  onSelectRace: (id: string) => void;
  phaseBadgeStyle: Record<string, string>;
  phaseLabel: Record<string, string>;
}

export default function RefereeRaceList({
  races,
  filterPhase,
  onFilterChange,
  onSelectRace,
  phaseBadgeStyle,
  phaseLabel,
}: RefereeRaceListProps) {
  const filtered =
    filterPhase === "all"
      ? races
      : races.filter((r) => r.phase === filterPhase);

  const counts = {
    all: races.length,
    scheduled: races.filter((r) => r.phase === "scheduled").length,
    live: races.filter((r) => r.phase === "live").length,
    post_race: races.filter((r) => r.phase === "post_race").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
          My Assigned Races
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Track events assigned to your officiating duties.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "scheduled", "live", "post_race"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border flex items-center gap-1.5",
              filterPhase === f
                ? "bg-[#064E3B] text-white border-[#064E3B]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/30"
            )}
          >
            {f === "all" ? "All" : phaseLabel[f]}
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-full",
                filterPhase === f
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Race Cards */}
      {filtered.length === 0 ? (
        <div className="text-center text-sm text-slate-400 py-16">
          No races match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((race) => {
            const cleared = race.lanes.filter(
              (l) => l.inspectionStatus === "cleared"
            ).length;
            const pending = race.lanes.filter(
              (l) => l.inspectionStatus === "pending"
            ).length;
            const failed = race.lanes.filter(
              (l) =>
                l.inspectionStatus === "disqualified" ||
                l.inspectionStatus === "withdrawn"
            ).length;
            const total = race.lanes.length;

            const unhealthyCount = race.lanes.filter(
              (l) => l.healthStatus && l.healthStatus !== "healthy"
            ).length;

            return (
              <div
                key={race.id}
                onClick={() => onSelectRace(race.id)}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
                  <Flag className="w-24 h-24" />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold font-headline text-[#064E3B] text-sm">
                      {race.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {race.venue} • {race.distanceMeters}m •{" "}
                      {race.trackCondition}
                      {race.carryWeight != null &&
                        ` • ${race.carryWeight} kg limit`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                      phaseBadgeStyle[race.phase]
                    )}
                  >
                    {race.phase === "post_race" &&
                    (race.reportStatus === "published" ||
                      race.reportStatus === "referee_confirmed")
                      ? "Finalized"
                      : race.phase === "post_race" &&
                          race.reportStatus === "draft"
                        ? "Results (Draft)"
                        : phaseLabel[race.phase]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(race.scheduledAt).toLocaleString()}
                  </span>
                  {race.phase === "scheduled" && total > 0 && (
                    <>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck className="w-3 h-3" />
                        {cleared}/{total} cleared
                      </span>
                      {pending > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-3 h-3" />
                          {pending} pending
                        </span>
                      )}
                      {failed > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          {failed} failed
                        </span>
                      )}
                      {unhealthyCount > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          {unhealthyCount} unfit
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
