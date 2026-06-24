import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { LiveTelemetry } from "../components/feed/LiveTelemetry";
import { useRaces } from "../hooks/useRaces";
import useTournament from "../hooks/useTournament";
import { ROUTES } from "../router/routes";
import { formatTournamentStatus } from "../styles/schema/tournamentStatusFlow";
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Flame,
  // Activity,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";

export default function FeedPage() {
  const navigate = useNavigate();

  // Load today/upcoming races
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const {
    races: apiRaces,
    loading: racesLoading,
    loadRacesByMonth,
  } = useRaces();

  // Load tournaments
  const { tournaments, loadingList: tournamentsLoading } = useTournament();

  useEffect(() => {
    loadRacesByMonth(currentYear, currentMonth + 1);
  }, [currentYear, currentMonth, loadRacesByMonth]);

  // Filter and sort races (Upcoming/Live first, then limit to 5)
  const upcomingRaces = useMemo(() => {
    return apiRaces
      .filter(
        (r) =>
          r.status === "scheduled" ||
          r.status === "pre_race" ||
          r.status === "ongoing"
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )
      .slice(0, 5);
  }, [apiRaces]);

  // Filter active/registration/upcoming tournaments
  const activeTournaments = useMemo(() => {
    return tournaments
      .filter(
        (t) =>
          t.status === "ongoing" ||
          t.status === "registration_open" ||
          t.status === "upcoming"
      )
      .slice(0, 3);
  }, [tournaments]);

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F4F6F5] custom-scrollbar">
      <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 py-6 md:py-8 space-y-6 font-body">
        {/* Hero Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#064E3B] to-[#0D7A5E] rounded-3xl p-6 md:p-8 text-white shadow-lg border border-[#064E3B]/10">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-80 h-80 bg-[#EAB308]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold w-fit mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#EAB308] animate-pulse" />
                Live Arena Central
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight leading-tight !text-white">
                Racetrack Live Feed
              </h1>
              <p className="text-slate-200 text-sm max-w-xl mt-2 font-medium">
                Real-time telemetry, featured championship tournaments, and
                upcoming schedules in one unified control center.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
              <div className="text-center px-4 border-r border-white/10">
                <span className="block text-[10px] font-bold text-slate-350 uppercase tracking-widest">
                  Live Races
                </span>
                <span className="font-headline text-2xl font-black text-[#EAB308] flex items-center justify-center gap-1.5 mt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EAB308] animate-pulse" />
                  {apiRaces.filter((r) => r.status === "ongoing").length}
                </span>
              </div>
              <div className="text-center px-4 border-r border-white/10">
                <span className="block text-[10px] font-bold text-slate-350 uppercase tracking-widest">
                  Slated Today
                </span>
                <span className="font-headline text-2xl font-black text-white mt-1 block">
                  {apiRaces.length}
                </span>
              </div>
              <div className="text-center px-4">
                <span className="block text-[10px] font-bold text-slate-350 uppercase tracking-widest">
                  Tournaments
                </span>
                <span className="font-headline text-2xl font-black text-white mt-1 block">
                  {tournaments.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Content Area (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Telemetry Card (Wraps the telemetry simulation) */}
            {/* <div className="bg-white rounded-2xl border border-[#064E3B]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-[#064E3B]/5 to-transparent px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#064E3B]" />
                  <span className="font-headline font-bold text-lg text-[#064E3B]">
                    Real-time Track Position
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Live Simulator
                </span>
              </div>
              <div className="p-2">
                <LiveTelemetry />
              </div>
            </div> */}

            {/* Featured Tournaments Widget */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#064E3B]" />
                  <h2 className="font-headline font-bold text-xl text-[#064E3B]">
                    Active Championships & Tournaments
                  </h2>
                </div>
                <button
                  onClick={() => navigate(ROUTES.TOURNAMENTS)}
                  className="group flex items-center gap-1 text-xs font-bold text-[#064E3B] hover:text-[#0D7A5E] transition-colors"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {tournamentsLoading ? (
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-400">
                    Loading tournaments...
                  </p>
                </div>
              ) : activeTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-300 group"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                              tournament.status === "ongoing"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : tournament.status === "registration_open"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {formatTournamentStatus(tournament.status)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-label">
                            ID: {tournament.id.substring(0, 6)}...
                          </span>
                        </div>
                        <h3 className="font-headline font-black text-lg text-slate-800 leading-snug group-hover:text-[#064E3B] transition-colors line-clamp-2">
                          {tournament.name}
                        </h3>
                        <div className="space-y-2 mt-4 text-xs font-medium text-slate-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {tournament.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {formatDate(tournament.startDate)} -{" "}
                              {formatDate(tournament.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4 mt-5 flex justify-end">
                        <button
                          onClick={() =>
                            navigate(
                              `${ROUTES.TOURNAMENTS}?tournamentId=${tournament.id}`
                            )
                          }
                          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#064E3B]/5 hover:bg-[#064E3B] text-[#064E3B] hover:text-white rounded-xl text-xs font-bold transition-all duration-300"
                        >
                          View Schedule
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-sm font-semibold text-slate-400">
                    No active tournaments available.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Schedule Area (1 Column) */}
          <div className="space-y-6">
            {/* Upcoming Races Card */}
            <div className="bg-white rounded-2xl border border-[#064E3B]/10 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#064E3B]" />
                  <h3 className="font-headline font-bold text-base text-[#064E3B]">
                    Upcoming Races
                  </h3>
                </div>
                <button
                  onClick={() => navigate(ROUTES.RACES)}
                  className="text-xs font-bold text-[#064E3B] hover:underline"
                >
                  Roster
                </button>
              </div>

              {racesLoading ? (
                <div className="py-8 text-center">
                  <p className="text-xs font-semibold text-slate-400">
                    Loading schedules...
                  </p>
                </div>
              ) : upcomingRaces.length > 0 ? (
                <div className="space-y-3">
                  {upcomingRaces.map((race) => (
                    <div
                      key={race.id}
                      onClick={() =>
                        navigate(`${ROUTES.RACES}`, {
                          state: { raceId: race.id, date: race.date },
                        })
                      }
                      className="group flex items-start gap-3 p-3 rounded-xl border border-slate-50 hover:border-[#064E3B]/20 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center bg-[#064E3B]/5 group-hover:bg-[#064E3B]/10 text-[#064E3B] rounded-lg p-2 shrink-0 w-12 text-center transition-colors">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-label">
                          {formatDate(race.scheduledAt).split(" ")[0]}
                        </span>
                        <span className="text-base font-black font-headline leading-none">
                          {formatDate(race.scheduledAt).split(" ")[1]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-bold text-xs text-slate-700 truncate group-hover:text-[#064E3B] transition-colors">
                            {race.name}
                          </h4>
                          {race.status === "ongoing" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                          {formatTime(race.scheduledAt)} · {race.venue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-100 rounded-xl">
                  No upcoming races scheduled for today.
                </div>
              )}
            </div>

            {/* Premium Stat Callout Widget */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-[#0D7A5E] text-white rounded-2xl p-5 border border-emerald-800/50 shadow-md">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                <Award className="w-36 h-36" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#EAB308]" />
                  <h4 className="font-headline font-bold text-sm !text-[#EAB308]">
                    Championship Stats
                  </h4>
                </div>

                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  The current horse racing season is in full swing. Keep track
                  of tournament scores, standings, and horse rosters in
                  real-time.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => navigate(ROUTES.LEADERBOARD)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#EAB308] hover:bg-[#EAB308]/90 text-slate-900 rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                  >
                    View Leaderboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
