import { Clock, Activity, Trophy, Flag, Calendar } from "lucide-react";
import { type MockRace, phaseBadgeStyle, phaseLabel } from "./types";
import { cn } from "../../lib/utils";

interface RefereeDashboardProps {
  races: MockRace[];
  onViewAll: () => void;
  onSelectRace: (id: string) => void;
}

export default function RefereeDashboard({
  races,
  onViewAll,
  onSelectRace,
}: RefereeDashboardProps) {
  const scheduledCount = races.filter((r) => r.phase === "scheduled").length;
  const liveCount = races.filter((r) => r.phase === "live").length;
  const concludedCount = races.filter(
    (r) => r.phase === "concluded" || r.phase === "report"
  ).length;
  const totalLanes = races.reduce((sum, r) => sum + r.lanes.length, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
          Referee Dashboard
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Overview of your track officiating assignments and pending duties.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Scheduled Races",
            val: String(scheduledCount),
            icon: <Clock />,
            color: "text-amber-700",
            bg: "bg-amber-50",
          },
          {
            label: "Live Races",
            val: String(liveCount),
            icon: <Activity />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Concluded",
            val: String(concludedCount),
            icon: <Trophy />,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Total Lanes",
            val: String(totalLanes),
            icon: <Flag />,
            color: "text-[#064E3B]",
            bg: "bg-[#064E3B]/10",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            onClick={onViewAll}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
          >
            <div
              className={cn(
                "absolute right-0 bottom-0 translate-y-2 translate-x-2 opacity-10 group-hover:scale-110 duration-500",
                stat.color
              )}
            >
              {stat.icon}
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">
              {stat.label}
            </span>
            <span
              className={cn(
                "text-2xl font-black font-headline mt-1.5 block tracking-tight",
                stat.color
              )}
            >
              {stat.val}
            </span>
          </div>
        ))}
      </div>

      {/* Upcoming Races */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Assignments
          </h3>
          <button
            onClick={onViewAll}
            className="text-[10px] font-bold text-[#064E3B] hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {races.slice(0, 3).map((race) => (
            <div
              key={race.id}
              onClick={() => onSelectRace(race.id)}
              className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{race.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {race.venue} • {new Date(race.scheduledAt).toLocaleString()}
                </p>
              </div>
              <span
                className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                  phaseBadgeStyle[race.phase]
                )}
              >
                {phaseLabel[race.phase]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
