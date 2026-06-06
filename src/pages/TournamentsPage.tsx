import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Flag, CalendarDays, ArrowRight,
  Trophy, Flame,
} from "lucide-react";
import { ROUTES } from "../router/routes.tsx";
import { useEvent } from "../hooks/useEvent";

// ─── Types ────────────────────────────────────────────────────────────────────

type TournamentStatus = "Live" | "Scheduled" | "Completed";
type FilterTab = "All" | TournamentStatus;

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

interface RaceSummary {
  id: number;
  tournamentId: number;
  status: "Live" | "Upcoming" | "Completed";
  title: string;
  time: string;
  date: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const defaultTournaments: Tournament[] = [
  { id: 1, name: "Royal Ascot Summer Series",           startDate: "2026-06-18", endDate: "2026-06-22", location: "Ascot, UK",          races: 35, status: "Live",      prizePool: "£7.5M" },
  { id: 2, name: "The Breeders' Cup World Championships",startDate: "2026-11-01", endDate: "2026-11-02", location: "Del Mar, CA",         races: 14, status: "Scheduled", prizePool: "$31M"  },
  { id: 3, name: "Dubai World Cup",                     startDate: "2027-03-29", endDate: "2027-03-29", location: "Meydan, UAE",         races: 9,  status: "Scheduled", prizePool: "$30.5M" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString("en-US", opts);

const formatRange = (start: string, end: string) => {
  const same = new Date(start).toDateString() === new Date(end).toDateString();
  return same
    ? fmt(start, { month: "short", day: "numeric", year: "numeric" })
    : `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric", year: "numeric" })}`;
};

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

function TournamentCard({ tournament, onViewRaces }: { tournament: Tournament; onViewRaces: (id: number | string) => void }) {
  const isLive = tournament.status === "Live";
  return (
    <div className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-lg ${
      isLive ? "border-amber-200 shadow-md shadow-amber-100/60" : "border-slate-200 shadow-sm hover:border-slate-300"
    }`}>
      {isLive && <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />}

      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isLive ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          }`}>
            {isLive ? <Flame className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">{tournament.name}</h3>
              <StatusBadge status={tournament.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{formatRange(tournament.startDate, tournament.endDate)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{tournament.location}</span>
              <span className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5 text-slate-400" />{tournament.races} races</span>
              {tournament.prizePool && (
                <span className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 tracking-wide">
                  Prize {tournament.prizePool}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onViewRaces(tournament.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 active:scale-95 ${
              isLive ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
          >
            View Races <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TournamentsPage() {
  const { eventList } = useEvent();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const tournaments: Tournament[] = useMemo(() => {
    if (!eventList || eventList.length === 0) return defaultTournaments;
    return eventList.map((event, index) => {
      let status: TournamentStatus = "Scheduled";
      if (event.className?.includes("yellow") || event.title.includes("Thunder")) status = "Live";
      if (event.className?.includes("green")  || event.title.includes("Qualifier")) status = "Completed";
      const startDateObj = event.start || event.date ? new Date(event.start || event.date!) : new Date();
      const endDateObj   = event.end ? new Date(event.end) : startDateObj;
      return {
        id: event.id || index + 1, name: event.title,
        startDate: startDateObj.toISOString(), endDate: endDateObj.toISOString(),
        location: ["Ascot, UK", "Churchill Downs, KY", "Meydan, UAE"][index % 3] || "TBD",
        races: event.overlap ? 14 : 35, status,
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

  const grouped = useMemo(() => ({
    Live:      filtered.filter((t) => t.status === "Live"),
    Scheduled: filtered.filter((t) => t.status === "Scheduled"),
    Completed: filtered.filter((t) => t.status === "Completed"),
  }), [filtered]);

  const handleViewRaces = (id: number | string) => navigate(`${ROUTES.RACES}?tournamentId=${id}`);

  const renderGroup = (title: string, items: Tournament[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-8">
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        <div className="space-y-3">
          {items.map((t) => <TournamentCard key={t.id} tournament={t} onViewRaces={handleViewRaces} />)}
        </div>
      </section>
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 custom-scrollbar">
      {/* Container width standardisation to max-w-5xl matches RacesPage */}
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Header Row: Title on Left, Spacious Search Bar on Top Right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tournament Hub</h1>
            <p className="mt-1 text-sm text-slate-500">Browse competitions and explore their full race roster.</p>
          </div>

          {/* STANDARDIZED SPACIOUS TOP-RIGHT SEARCH BAR */}
          <div className="relative w-full sm:w-72 md:w-80 shadow-sm rounded-xl border border-slate-200 bg-white self-end sm:self-center">
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

        {/* UNIFIED INTERACTIVE STAT CARDS */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <StatFilterCard label="Total" value={counts.All} active={activeFilter === "All"} onClick={() => setActiveFilter("All")} />
          <StatFilterCard label="Live" value={counts.Live} active={activeFilter === "Live"} onClick={() => setActiveFilter("Live")} liveDot />
          <StatFilterCard label="Scheduled" value={counts.Scheduled} active={activeFilter === "Scheduled"} onClick={() => setActiveFilter("Scheduled")} />
          <StatFilterCard label="Completed" value={counts.Completed} active={activeFilter === "Completed"} onClick={() => setActiveFilter("Completed")} />
        </div>

        {/* Groups */}
        {activeFilter === "All" ? (
          <>
            {renderGroup("🔴 Live Now",  grouped.Live)}
            {renderGroup("Upcoming",     grouped.Scheduled)}
            {renderGroup("Completed",    grouped.Completed)}
          </>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => <TournamentCard key={t.id} tournament={t} onViewRaces={handleViewRaces} />)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No tournaments found{search ? ` for "${search}"` : ""}.</p>
          </div>
        )}
      </div>
    </div>
  );
}