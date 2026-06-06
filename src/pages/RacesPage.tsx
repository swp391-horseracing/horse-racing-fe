import { useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  X,
  CalendarDays,
} from "lucide-react";
import { ROUTES, buildRoute } from "../router/routes.tsx";
import { useHorseList } from "../hooks/useHorseList";
import { useEvent } from "../hooks/useEvent";
import { Calendar } from "../components/ui/calendar";

// ─── Types ────────────────────────────────────────────────────────────────────

type RaceStatus = "Live" | "Upcoming" | "Completed";
type StatusFilter = "All" | RaceStatus;

interface Race {
  id: number;
  tournamentId: number;
  title: string;
  date: string;
  time: string;
  distance: string;
  surface: string;
  className: string;
  status: RaceStatus;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const allRaces: Race[] = [
  { id: 101, tournamentId: 1, title: "The Queen Anne Stakes",     date: "2026-06-18", time: "14:30", distance: "1600m", surface: "Turf", className: "Group 1",  status: "Completed" },
  { id: 102, tournamentId: 1, title: "Coventry Stakes",           date: "2026-06-18", time: "15:05", distance: "1200m", surface: "Turf", className: "Group 2",  status: "Completed" },
  { id: 103, tournamentId: 1, title: "King's Stand Stakes",       date: "2026-06-18", time: "15:40", distance: "1000m", surface: "Turf", className: "Group 1",  status: "Completed" },
  { id: 104, tournamentId: 1, title: "St James's Palace Stakes",  date: "2026-06-18", time: "16:20", distance: "1600m", surface: "Turf", className: "Group 1",  status: "Live"      },
  { id: 105, tournamentId: 1, title: "Ascot Stakes",              date: "2026-06-18", time: "17:00", distance: "4000m", surface: "Turf", className: "Handicap", status: "Upcoming"  },
  { id: 106, tournamentId: 1, title: "Wolferton Stakes",          date: "2026-06-18", time: "17:35", distance: "2000m", surface: "Turf", className: "Listed",   status: "Upcoming"  },
  { id: 107, tournamentId: 1, title: "Copper Horse Stakes",       date: "2026-06-18", time: "18:10", distance: "2800m", surface: "Turf", className: "Handicap", status: "Upcoming"  },
  { id: 108, tournamentId: 1, title: "Prince of Wales's Stakes",  date: "2026-06-19", time: "15:40", distance: "2000m", surface: "Turf", className: "Group 1",  status: "Upcoming"  },
  { id: 109, tournamentId: 2, title: "Classic Turf Invitational", date: "2026-11-01", time: "16:00", distance: "2000m", surface: "Turf", className: "Group 1",  status: "Upcoming"  },
  { id: 110, tournamentId: 2, title: "Night Derby",               date: "2026-11-02", time: "18:30", distance: "2400m", surface: "Dirt", className: "Group 3",  status: "Upcoming"  },
];

const tournamentNames: Record<number, string> = {
  1: "Royal Ascot Summer Series",
  2: "The Breeders' Cup World Championships",
};

const officials = [
  { initials: "AJ", name: "Arthur Jones",  title: "Chief Steward" },
  { initials: "SB", name: "Sarah Baxter",  title: "Starter"       },
  { initials: "MT", name: "Mark Thompson", title: "Judge"         },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const STATUS_ORDER: Record<RaceStatus, number> = { Live: 0, Upcoming: 1, Completed: 2 };

// ─── Compact Interactive Stat Filter Card ─────────────────────────────────────

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

// ─── Minimalist Race Row ───────────────────────────────────────────────────────

function RaceRow({ race, selected, onClick }: { race: Race; selected: boolean; onClick: () => void }) {
  const isLive = race.status === "Live";
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-4 py-3 text-left transition-all border-l-4 ${
        selected
          ? "bg-emerald-50/50 border-l-emerald-600"
          : isLive
          ? "bg-amber-50/30 border-l-amber-400 hover:bg-amber-50/50"
          : "border-l-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <span className={`font-mono text-sm font-bold tracking-tight ${selected ? "text-emerald-900" : "text-slate-800"}`}>
          {race.time}
        </span>
        <div className="truncate">
          <p className={`font-bold text-sm truncate ${selected ? "text-emerald-900" : "text-slate-900"}`}>
            {race.title}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {race.className} · {race.distance} · {race.surface}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
        {race.status === "Live" && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
        {race.status === "Completed" && <span className="h-2 w-2 rounded-full bg-slate-300" />}
        {race.status === "Upcoming" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RacesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentIdParam = searchParams.get("tournamentId");
  const tournamentId = tournamentIdParam ? Number(tournamentIdParam) : null;

  const { eventList } = useEvent();
  const { horseList } = useHorseList();

  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("All");
  const [search, setSearch]               = useState("");
  const [selectedRace, setSelectedRace]   = useState<Race | null>(null);
  
  const [selectedDate, setSelectedDate]   = useState<Date | undefined>(parseLocalDate("2026-06-18"));

  const tournamentName = useMemo(() => {
    if (!tournamentId) return null;
    if (eventList && eventList.length > 0) {
      const found = eventList.find((e) => Number(e.id) === tournamentId);
      if (found) return found.title;
    }
    return tournamentNames[tournamentId] ?? "Tournament";
  }, [tournamentId, eventList]);

  const baseRaces = useMemo(
    () => tournamentId ? allRaces.filter((r) => r.tournamentId === tournamentId) : allRaces,
    [tournamentId]
  );

  const counts = useMemo(() => ({
    All:       baseRaces.length,
    Live:      baseRaces.filter((r) => r.status === "Live").length,
    Upcoming:  baseRaces.filter((r) => r.status === "Upcoming").length,
    Completed: baseRaces.filter((r) => r.status === "Completed").length,
  }), [baseRaces]);

  const filteredRaces = useMemo(() => {
    const lower = search.toLowerCase();
    return baseRaces
      .filter((r) => {
        const matchStatus = statusFilter === "All" || r.status === statusFilter;
        const matchSearch = !lower || r.title.toLowerCase().includes(lower) || r.className.toLowerCase().includes(lower);
        return matchStatus && matchSearch;
      })
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.time.localeCompare(b.time));
  }, [baseRaces, statusFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Race[]>();
    filteredRaces.forEach((r) => {
      const existing = map.get(r.date) ?? [];
      map.set(r.date, [...existing, r]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRaces]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  const calendarFilteredRaces = useMemo(() => {
    return filteredRaces.filter((r) => r.date === formattedSelectedDate);
  }, [filteredRaces, formattedSelectedDate]);

  const raceDays = useMemo(() => {
    return baseRaces.map(r => parseLocalDate(r.date));
  }, [baseRaces]);

  const handleSelectRace = useCallback((race: Race) => {
    setSelectedRace((prev) => (prev?.id === race.id ? null : race));
  }, []);

  const panelOpen = selectedRace !== null;
  const isCalendarMode = !tournamentId;

  return (
    <div className="min-h-screen w-full bg-slate-50/40 flex flex-col">
      <div className="mx-auto max-w-5xl w-full px-4 py-4 sm:py-6 flex-1 flex flex-col">

        {/* --- TOP FIXED AREA --- */}
        <div className="flex-shrink-0">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => tournamentId ? navigate(ROUTES.TOURNAMENTS) : navigate(-1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                {tournamentName && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 truncate">{tournamentName}</p>
                )}
                <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none truncate">
                  {tournamentId ? "Race Roster" : "All Races"}
                </h1>
              </div>
            </div>

            {/* SPACIOUS SEARCH BAR */}
            <div className="relative w-full sm:w-72 md:w-80 shadow-sm rounded-xl border border-slate-200 bg-white">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search races..."
                className="w-full h-11 rounded-xl bg-transparent pl-11 pr-4 text-xs font-medium outline-none transition focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Interactive Stat Filter Cards */}
          <div className="mb-5 grid grid-cols-4 gap-3">
            <StatFilterCard label="Total" value={counts.All} active={statusFilter === "All"} onClick={() => setStatusFilter("All")} />
            <StatFilterCard label="Live" value={counts.Live} active={statusFilter === "Live"} onClick={() => setStatusFilter("Live")} liveDot />
            <StatFilterCard label="Upcoming" value={counts.Upcoming} active={statusFilter === "Upcoming"} onClick={() => setStatusFilter("Upcoming")} />
            <StatFilterCard label="Completed" value={counts.Completed} active={statusFilter === "Completed"} onClick={() => setStatusFilter("Completed")} />
          </div>
        </div>

        {/* --- DYNAMIC GRID LAYOUT (Addresses Zoom and Placement) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE CONTENT */}
          <div className={`
            ${isCalendarMode 
              ? (panelOpen ? "lg:col-span-5 space-y-4" : "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6") 
              : (panelOpen ? "lg:col-span-5" : "lg:col-span-12")
            }
          `}>
            
            {/* Calendar Block (All Races mode only) */}
            {isCalendarMode && (
              <div className={`${!panelOpen ? "lg:col-span-4" : "w-full"}`}>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm max-w-sm mx-auto lg:mx-0 w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    defaultMonth={new Date(2026, 5)}
                    modifiers={{ hasRace: raceDays }}
                    modifiersClassNames={{
                      hasRace: "font-black text-emerald-700 bg-emerald-50/50 border border-emerald-600/10 rounded-md"
                    }}
                    className="w-full flex justify-center"
                  />
                </div>
              </div>
            )}

            {/* List Block */}
            <div className={`
              ${isCalendarMode && !panelOpen ? "lg:col-span-8" : "w-full"}
              space-y-4
            `}>
              {isCalendarMode ? (
                /* --- 1. Calendar Days list --- */
                selectedDate && (
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500">
                        Races on {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {calendarFilteredRaces.length > 0 ? (
                        calendarFilteredRaces.map((race) => (
                          <RaceRow
                            key={race.id}
                            race={race}
                            selected={selectedRace?.id === race.id}
                            onClick={() => handleSelectRace(race)}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-400 font-medium">
                          No races scheduled for this day.
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : (
                /* --- 2. Tournament List View --- */
                grouped.length > 0 ? (
                  <div className="space-y-4">
                    {grouped.map(([date, races]) => (
                      <div key={date} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                          <span className="text-[11px] font-bold text-slate-500">{fmtShort(date)}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {races.map((race) => (
                            <RaceRow
                              key={race.id}
                              race={race}
                              selected={selectedRace?.id === race.id}
                              onClick={() => handleSelectRace(race)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                    <p className="text-sm font-semibold text-slate-400">No matching races found.</p>
                  </div>
                )
              )}
            </div>

          </div>

          {/* RIGHT SIDE DETAIL PANEL */}
          {panelOpen && selectedRace && (
            <div className="lg:col-span-7 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] overflow-y-auto border border-slate-200 bg-white rounded-xl shadow-lg flex flex-col">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-100">
                <div className="min-w-0 flex-1">
                  {tournamentName && (
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5 truncate">{tournamentName}</p>
                  )}
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedRace.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedRace.className} · {selectedRace.distance} · {selectedRace.surface}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRace(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="p-6 space-y-6">
                
                {/* Metrics Table */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Start List</h3>
                  
                  {horseList && horseList.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100/50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-16 text-center">#</th>
                            <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Horse</th>
                            <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Jockey</th>
                            <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Trainer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs bg-white">
                          {horseList.slice(selectedRace.id % 2, (selectedRace.id % 2) + 5).map((horse, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-center">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600 mx-auto">{idx + 1}</span>
                              </td>
                              <td className="px-4 py-3 font-bold text-emerald-900">{horse.name}</td>
                              <td className="px-4 py-3 text-slate-600">{horse.jockey}</td>
                              <td className="px-4 py-3 text-slate-500">{horse.owner}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400 font-medium">
                      No draw data available
                    </div>
                  )}
                </div>

                {/* Officials */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Officials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {officials.map((o) => (
                      <div key={o.initials} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 bg-slate-50/50">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-600 text-[10px] font-black border border-slate-200">
                          {o.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate leading-tight">{o.name}</p>
                          <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{o.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}