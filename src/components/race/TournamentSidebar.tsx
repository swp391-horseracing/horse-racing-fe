import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Trophy, Clock, Target, Flag } from "lucide-react";
import type { TournamentDetail, RaceItem } from "../../types/tournament";
import {
  TOURNAMENT_STATUS_STYLES,
  RACE_STATUS_STYLES,
} from "../ui/StatusBadge";

interface TournamentSidebarProps {
  tournament: TournamentDetail | null;
  races: RaceItem[];
  currentRaceId: string;
}

export function TournamentSidebar({
  tournament,
  races,
  currentRaceId,
}: TournamentSidebarProps) {
  const navigate = useNavigate();

  // If no tournament is provided, we can either show a placeholder or nothing
  if (!tournament) {
    return (
      <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 p-4 items-center justify-center text-center">
        <Trophy size={32} className="text-slate-300 mb-3" />
        <h3 className="text-sm font-bold text-slate-500 mb-1">
          No Tournament Data
        </h3>
        <p className="text-[11px] text-slate-400">
          This race is not part of a tournament sequence.
        </p>
      </div>
    );
  }

  const safeRaces = races || [];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Tournament Info Card */}
      <div className="shrink-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-[#064E3B] to-[#047857] text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Tournament
            </span>
          </div>
          <h3 className="font-extrabold text-sm leading-tight line-clamp-2 text-white!">
            {tournament.name}
          </h3>
        </div>

        <div className="p-4 flex flex-col gap-2.5 text-xs">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <span className="text-slate-600 font-medium leading-tight">
              {tournament.location || "Location TBC"}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar size={13} />
              <span>Status</span>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                TOURNAMENT_STATUS_STYLES[tournament.status] ||
                "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {tournament.status.replace("_", " ")}
            </span>
          </div>
          {tournament.prizePool && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Target size={13} />
                <span>Prize Pool</span>
              </div>
              <span className="font-bold text-emerald-600">
                ${tournament.prizePool.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legs / Schedule Card */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="shrink-0 px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
            Event Schedule
          </h4>
          <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
            {safeRaces.length} Races
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {safeRaces.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic">
              No scheduled races found.
            </p>
          ) : (
            safeRaces.map((race, index) => {
              const isActive = race.id === currentRaceId;

              return (
                // We use role="button" + tabIndex instead of swapping to a <button>
                // tag because that would mess up the layout.
                // This gives keyboard users the same access without breaking the styles.
                <div
                  key={race.id || index}
                  role="button"
                  tabIndex={0}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (!isActive) navigate(`/races/${race.id}`);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isActive)
                      navigate(`/races/${race.id}`);
                  }}
                  className={`relative p-3 rounded-lg flex flex-col gap-1.5 transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? "bg-indigo-50 border-indigo-200 shadow-sm"
                      : race.status === "completed"
                        ? "bg-white border-transparent hover:bg-slate-50 opacity-70"
                        : "bg-white border-transparent hover:bg-slate-50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <h5
                      className={`font-bold text-xs leading-snug line-clamp-2 ${
                        isActive ? "text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      {race.name || `Race ${index + 1}`}
                    </h5>
                    <span
                      className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : RACE_STATUS_STYLES[race.status] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isActive ? "Current" : race.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    {race.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(race.scheduledAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Flag size={10} />
                      {race.distanceMeters}m
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
