import { useMemo, useState } from "react";
import {
  Search, MapPin, Flag, CalendarDays,
  Trophy, Flame, X, Clock, CheckCircle2, Play,
  CalendarRange, Landmark, ShieldAlert, Users
} from "lucide-react";
import { useEvent } from "../hooks/useEvent";

// ─── Types ────────────────────────────────────────────────────────────────────

type TournamentStatus = "Live" | "Scheduled" | "Completed";
type FilterTab = "All" | TournamentStatus;
type DetailTab = "schedule" | "entry";

interface Tournament {
  id: number | string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  races: number;
  status: TournamentStatus;
  prizePool?: string;
}

interface RacePreview {
  id: number;
  title: string;
  time: string;
  distance: string;
  surface: string;
  status: "Live" | "Upcoming" | "Completed";
}

interface RoundDetail {
  name: string;
  date: string;
  racesRange: string;
}

interface TournamentExtraDetail {
  rounds: RoundDetail[];
  entryFee: string;
  deadline: string;
  eligibility: string;
  maxField: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const defaultTournaments: Tournament[] = [
  { id: 1, name: "Royal Ascot Summer Series",           startDate: "2026-06-18", endDate: "2026-06-22", location: "Ascot, UK",          races: 7, status: "Live",      prizePool: "£7.5M" },
  { id: 2, name: "The Breeders' Cup World Championships",startDate: "2026-11-01", endDate: "2026-11-02", location: "Del Mar, CA",         races: 2, status: "Scheduled", prizePool: "$31M"  },
  { id: 3, name: "Dubai World Cup",                     startDate: "2027-03-29", endDate: "2027-03-29", location: "Meydan, UAE",         races: 2,  status: "Scheduled", prizePool: "$30.5M" },
];

const mockRacesByTournament: Record<string | number, RacePreview[]> = {
  1: [
    { id: 101, title: "The Queen Anne Stakes", time: "14:30", distance: "1600m", surface: "Turf", status: "Completed" },
    { id: 102, title: "Coventry Stakes", time: "15:05", distance: "1200m", surface: "Turf", status: "Completed" },
    { id: 103, title: "King's Stand Stakes", time: "15:40", distance: "1000m", surface: "Turf", status: "Completed" },
    { id: 104, title: "St James's Palace Stakes", time: "16:20", distance: "1600m", surface: "Turf", status: "Live" },
    { id: 105, title: "Ascot Stakes", time: "17:00", distance: "4000m", surface: "Turf", status: "Upcoming" },
    { id: 106, title: "Wolferton Stakes", time: "17:35", distance: "2000m", surface: "Turf", status: "Upcoming" },
    { id: 107, title: "Copper Horse Stakes", time: "18:10", distance: "2800m", surface: "Turf", status: "Upcoming" },
  ],
  2: [
    { id: 109, title: "Classic Turf Invitational", time: "16:00", distance: "2000m", surface: "Turf", status: "Upcoming" },
    { id: 110, title: "Night Derby", time: "18:30", distance: "2400m", surface: "Dirt", status: "Upcoming" },
  ],
  3: [
    { id: 201, title: "Dubai Golden Shaheen", time: "15:30", distance: "1200m", surface: "Dirt", status: "Upcoming" },
    { id: 202, title: "Al Maktoum Classic", time: "17:15", distance: "1900m", surface: "Dirt", status: "Upcoming" },
  ],
};

const tournamentExtraDetails: Record<string | number, TournamentExtraDetail> = {
  1: {
    rounds: [
      { name: "Preliminary Heats", date: "June 18-19", racesRange: "Races 101 - 103" },
      { name: "Semifinal Showdowns", date: "June 20", racesRange: "Races 104 - 105" },
      { name: "The Grand Finale", date: "June 22", racesRange: "Races 106 - 107" }
    ],
    entryFee: "£2,500 per nomination",
    deadline: "June 12, 2026",
    eligibility: "Class 1 Thoroughbreds, age 3+",
    maxField: "16 Runners per Heat"
  },
  2: {
    rounds: [
      { name: "Championship Heats", date: "Nov 01", racesRange: "Race 109" },
      { name: "World Cup Finals", date: "Nov 02", racesRange: "Race 110" }
    ],
    entryFee: "$10,000 per nomination",
    deadline: "Oct 25, 2026",
    eligibility: "International Invited Graded Stakes horses",
    maxField: "14 Runners"
  },
  3: {
    rounds: [
      { name: "Qualifying Stakes", date: "Mar 29 (Morning)", racesRange: "Race 201" },
      { name: "Dubai World Cup Final", date: "Mar 29 (Evening)", racesRange: "Race 202" }
    ],
    entryFee: "$7,500 per nomination",
    deadline: "Mar 20, 2027",
    eligibility: "Horses with an official international rating of 110+",
    maxField: "12 Runners"
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => {
  try {
    return new Date(d).toLocaleDateString("en-US", opts);
  } catch {
    return d;
  }
};

const formatRange = (start: string, end: string) => {
  try {
    const same = new Date(start).toDateString() === new Date(end).toDateString();
    return same
      ? fmt(start, { month: "short", day: "numeric", year: "numeric" })
      : `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
  } catch {
    return `${start} - ${end}`;
  }
};

// ─── Compact Stat Filter Card ──────────────────────────────────────────────────

interface StatFilterCardProps {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  liveDot?: boolean;
}

function StatFilterCard({ label, value, active, onClick, liveDot }: StatFilterCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left rounded-xl border py-1.5 px-3 transition-all ${
        active
          ? "border-slate-800 bg-white shadow-sm ring-1 ring-slate-800"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${active ? "text-slate-800" : "text-slate-400"}`}>
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <p className="text-lg font-black leading-none text-slate-900">{value}</p>
        {liveDot && value > 0 && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: TournamentStatus }) {
  const styles: Record<TournamentStatus, string> = {
    Live:      "bg-amber-50 text-amber-800 border-amber-200",
    Scheduled: "bg-slate-100 text-slate-600 border-slate-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${styles[status]}`}>
      {status === "Live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />}
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentsPage() {
  const { eventList } = useEvent();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("schedule");

  const tournaments: Tournament[] = useMemo(() => {
    if (!eventList || eventList.length === 0) return defaultTournaments;
    return eventList.map((event, index) => {
      let status: TournamentStatus = "Scheduled";
      if (event.className?.includes("yellow") || event.title.includes("Thunder")) status = "Live";
      if (event.className?.includes("green")  || event.title.includes("Qualifier")) status = "Completed";
      
      const startDateObj = event.start || event.date ? new Date(event.start || event.date!) : new Date();
      const endDateObj   = event.end ? new Date(event.end) : startDateObj;
      const tId = event.id || index + 1;
      const matchedRacesCount = mockRacesByTournament[tId]?.length ?? (event.overlap ? 14 : 35);

      return {
        id: tId,
        name: event.title,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        location: ["Ascot, UK", "Churchill Downs, KY", "Meydan, UAE"][index % 3] || "TBD",
        races: matchedRacesCount,
        status,
      };
    });
  }, [eventList]);

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return tournaments.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(lower) || t.location.toLowerCase().includes(lower);
      const matchFilter = activeFilter === "All" || t.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [tournaments, search, activeFilter]);

  const counts = useMemo(() => ({
    All: tournaments.length,
    Live: tournaments.filter((t) => t.status === "Live").length,
    Scheduled: tournaments.filter((t) => t.status === "Scheduled").length,
    Completed: tournaments.filter((t) => t.status === "Completed").length,
  }), [tournaments]);

  const activeRaces = useMemo(() => {
    if (!selectedTournament) return [];
    return mockRacesByTournament[selectedTournament.id] ?? [];
  }, [selectedTournament]);

  const activeExtraDetail = useMemo(() => {
    if (!selectedTournament) return null;
    return tournamentExtraDetails[selectedTournament.id] ?? {
      rounds: [
        { name: "First Stage", date: "Day 1", racesRange: "Qualifying list" },
        { name: "Final Stage", date: "Day 2", racesRange: "Final Run" }
      ],
      entryFee: "$2,000 nomination",
      deadline: "1 week prior to start",
      eligibility: "Open to Class 1-2 standard ratings",
      maxField: "14 Runners"
    };
  }, [selectedTournament]);

  const handleSelectTournament = (t: Tournament) => {
    setSelectedTournament((prev) => (prev?.id === t.id ? null : t));
    setDetailTab("schedule");
  };

  const isPanelOpen = selectedTournament !== null;

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 custom-scrollbar">
      <div className="mx-auto max-w-5xl px-4 py-6">

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Tournament Hub</h1>
            <p className="mt-1.5 text-xs text-slate-500">Explore active competitions and inspect race lists in-place.</p>
          </div>

          <div className="relative w-full sm:w-72 md:w-80 shadow-sm rounded-xl border border-slate-200 bg-white">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full h-11 rounded-xl bg-transparent pl-11 pr-4 text-xs font-medium outline-none transition focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Interactive Stats Filters */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <StatFilterCard label="Total" value={counts.All} active={activeFilter === "All"} onClick={() => { setActiveFilter("All"); setSelectedTournament(null); }} />
          <StatFilterCard label="Live" value={counts.Live} active={activeFilter === "Live"} onClick={() => { setActiveFilter("Live"); setSelectedTournament(null); }} liveDot />
          <StatFilterCard label="Scheduled" value={counts.Scheduled} active={activeFilter === "Scheduled"} onClick={() => { setActiveFilter("Scheduled"); setSelectedTournament(null); }} />
          <StatFilterCard label="Completed" value={counts.Completed} active={activeFilter === "Completed"} onClick={() => { setActiveFilter("Completed"); setSelectedTournament(null); }} />
        </div>

        {/* Main Columns Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Tournaments List */}
          <div className={`space-y-3 transition-all duration-300 ${isPanelOpen ? "lg:col-span-5" : "lg:col-span-12"}`}>
            {filtered.map((t) => {
              const isSelected = selectedTournament?.id === t.id;
              const isLive = t.status === "Live";
              
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTournament(t)}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border bg-white transition-all duration-150 ${
                    isSelected 
                      ? "border-slate-950 ring-1 ring-slate-950 bg-slate-50/20" 
                      : isLive 
                      ? "border-amber-200 hover:border-amber-300 hover:shadow-md" 
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="p-4 flex gap-3.5 items-start">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      isLive 
                        ? "bg-amber-50 text-amber-600 border-amber-200" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                      {isLive ? <Flame className="h-4.5 w-4.5" /> : <Trophy className="h-4.5 w-4.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight truncate">{t.name}</h3>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" />{t.location}</span>
                        <span className="flex items-center gap-1"><Flag className="h-3 w-3 text-slate-400" />{t.races} races</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">No tournaments found.</p>
              </div>
            )}
          </div>

          {/* Right Column: Inline Tournament Detail Panel */}
          {isPanelOpen && selectedTournament && (
            <div className="lg:col-span-7 lg:sticky lg:top-4 bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden flex flex-col">
              
              {/* Panel Header */}
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    {formatRange(selectedTournament.startDate, selectedTournament.endDate)}
                  </span>
                  <h2 className="text-base font-black text-slate-950 tracking-tight leading-snug truncate mt-1">
                    {selectedTournament.name}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Races, structure and guidelines for {selectedTournament.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex border-b border-slate-100 px-5 bg-slate-50/50">
                <button
                  onClick={() => setDetailTab("schedule")}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                    detailTab === "schedule"
                      ? "border-slate-800 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Races & Rounds
                </button>
                <button
                  onClick={() => setDetailTab("entry")}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                    detailTab === "entry"
                      ? "border-slate-800 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Entry Info & Rules
                </button>
              </div>

              {/* Tab Panel Contents */}
              <div className="p-5 max-h-[550px] overflow-y-auto custom-scrollbar">
                
                {/* ─── TAB: SCHEDULE & ROUND BREAKDOWNS ─── */}
                {detailTab === "schedule" && (
                  <div className="space-y-6">
                    {/* Round Breakdown */}
                    {activeExtraDetail && activeExtraDetail.rounds.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
                          Round Breakdown
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {activeExtraDetail.rounds.map((round, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Phase {idx + 1}</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5 leading-tight">{round.name}</p>
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span>{round.date}</span>
                                <span className="font-mono text-[9px] bg-white border px-1.5 py-0.5 rounded text-slate-600">{round.racesRange}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Schedule List */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Races List
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {activeRaces.length} Contests
                        </span>
                      </div>

                      {activeRaces.length > 0 ? (
                        <div className="space-y-2">
                          {activeRaces.map((race) => {
                            const isRaceLive = race.status === "Live";
                            const isCompleted = race.status === "Completed";
                            
                            return (
                              <div 
                                key={race.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                                  isRaceLive 
                                    ? "bg-amber-50/40 border-amber-200" 
                                    : isCompleted 
                                    ? "bg-slate-50/50 border-slate-100" 
                                    : "bg-white border-slate-150"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="text-center shrink-0">
                                    <span className="block font-mono text-xs font-black text-slate-900 leading-none">{race.time}</span>
                                    <span className="text-[9px] text-slate-400 uppercase font-semibold mt-1 block">Start</span>
                                  </div>
                                  
                                  <div className="border-l border-slate-200 pl-3 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate leading-tight">{race.title}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {race.distance} · {race.surface}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pl-3">
                                  {isRaceLive ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                                      <Play className="h-2 w-2 text-amber-600 fill-amber-600 animate-pulse" />
                                      Live
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                      <CheckCircle2 className="h-2.5 w-2.5 text-slate-500" />
                                      Ended
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                                      <Clock className="h-2.5 w-2.5 text-emerald-600" />
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">
                          No active races listed for this tournament.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB: ENTRY INFO & RULES ─── */}
                {detailTab === "entry" && activeExtraDetail && (
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Entry Requirements & Conditions
                    </h4>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Entry Deadline */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                        <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominations Close</p>
                          <p className="text-sm font-black text-slate-900 mt-1">{activeExtraDetail.deadline}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Late entries will not be registered.</p>
                        </div>
                      </div>

                      {/* Horse Eligibility */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligibility Criteria</p>
                          <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">{activeExtraDetail.eligibility}</p>
                        </div>
                      </div>

                      {/* Field Size Restrictions */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Field Size</p>
                          <p className="text-sm font-black text-slate-900 mt-1">{activeExtraDetail.maxField}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Cap on maximum active runners.</p>
                        </div>
                      </div>

                    </div>

                    {/* Standard Terms Notice */}
                    <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/20 text-xs text-amber-900/90 leading-relaxed">
                      <p className="font-bold mb-1 flex items-center gap-1.5">
                        Tournament Notice & Regulations
                      </p>
                      All participating horses must pass pre-race veterinary evaluations on the morning of the competition. Jockeys must be licensed and weigh-in at least 45 minutes prior to post-time.
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}