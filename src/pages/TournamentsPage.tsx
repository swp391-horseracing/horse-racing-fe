import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Flag,
  CalendarDays,
  ArrowRight,
  Trophy,
  Radio,
} from "lucide-react";
import { ROUTES, buildRoute } from "../router/routes.tsx";
import { useEvent } from "../hooks/useEvent";

// ─── Types ────────────────────────────────────────────────────────────────────

type TournamentStatus = "Live" | "Scheduled" | "Completed";

interface Tournament {
  id: number | string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  races: number;
  status: TournamentStatus;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const defaultTournaments: Tournament[] = [
  {
    id: 1,
    name: "Royal Ascot Summer Series",
    startDate: "2026-06-18",
    endDate: "2026-06-22",
    location: "Ascot, UK",
    races: 35,
    status: "Live",
  },
  {
    id: 2,
    name: "The Breeders' Cup World Championships",
    startDate: "2026-11-01",
    endDate: "2026-11-02",
    location: "Del Mar, CA",
    races: 14,
    status: "Scheduled",
  },
  {
    id: 3,
    name: "Dubai World Cup",
    startDate: "2027-03-29",
    endDate: "2027-03-29",
    location: "Meydan, UAE",
    races: 9,
    status: "Scheduled",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const isSameDay = (a: string, b: string) =>
  new Date(a).toDateString() === new Date(b).toDateString();

const formatDateRange = (start: string, end: string) =>
  isSameDay(start, end)
    ? formatDate(start)
    : `${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${formatDate(end)}`;

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TournamentStatus }) {
  const styles: Record<TournamentStatus, string> = {
    Live: "bg-amber-50 text-amber-800 border-amber-200",
    Scheduled: "bg-slate-100 text-slate-600 border-slate-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${styles[status]}`}
    >
      {status === "Live" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {status}
    </span>
  );
}

function FilterTab({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
          active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function TournamentCard({
  tournament,
  onViewRaces,
}: {
  tournament: Tournament;
  onViewRaces: (id: number | string) => void;
}) {
  const isLive = tournament.status === "Live";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-lg ${
        isLive
          ? "border-amber-300 shadow-amber-100/60 shadow-md"
          : "border-slate-200 shadow-sm hover:border-slate-300"
      }`}
    >
      {/* Live accent stripe */}
      {isLive && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
      )}

      <div className={`flex flex-col sm:flex-row sm:items-center gap-5 p-6 ${isLive ? "pl-8" : ""}`}>
        {/* Left — icon */}
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
            isLive
              ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          }`}
        >
          {isLive ? (
            <Radio className="h-6 w-6" />
          ) : (
            <Trophy className="h-6 w-6" />
          )}
        </div>

        {/* Center — info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
              {tournament.name}
            </h3>
            <StatusBadge status={tournament.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {tournament.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5 text-slate-400" />
              {tournament.races} races
            </span>
          </div>
        </div>

        {/* Right — CTA */}
        <button
          onClick={() => onViewRaces(tournament.id)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all shrink-0 ${
            isLive
              ? "bg-amber-500 text-white hover:bg-amber-600 active:scale-95"
              : "bg-emerald-700 text-white hover:bg-emerald-800 active:scale-95"
          }`}
        >
          View Races
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterTab = "All" | TournamentStatus;

export default function TournamentsPage() {
  const { eventList } = useEvent();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const tournaments: Tournament[] = useMemo(() => {
    if (!eventList || eventList.length === 0) return defaultTournaments;
    return eventList.map((event, index) => {
      let status: TournamentStatus = "Scheduled";
      if (event.className?.includes("yellow") || event.title.includes("Thunder"))
        status = "Live";
      if (event.className?.includes("green") || event.title.includes("Qualifier"))
        status = "Completed";

      const startDateObj = event.start || event.date
        ? new Date(event.start || event.date!)
        : new Date();
      const endDateObj = event.end ? new Date(event.end) : startDateObj;

      return {
        id: event.id || index + 1,
        name: event.title,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        location: ["Ascot, UK", "Churchill Downs, KY", "Meydan, UAE"][index % 3] || "TBD",
        races: event.overlap ? 14 : 35,
        status,
      };
    });
  }, [eventList]);

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return tournaments.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(lower) ||
        t.location.toLowerCase().includes(lower);
      const matchFilter = activeFilter === "All" || t.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [tournaments, search, activeFilter]);

  const counts = useMemo(
    () => ({
      All: tournaments.length,
      Live: tournaments.filter((t) => t.status === "Live").length,
      Scheduled: tournaments.filter((t) => t.status === "Scheduled").length,
      Completed: tournaments.filter((t) => t.status === "Completed").length,
    }),
    [tournaments]
  );

  const grouped = useMemo(
    () => ({
      Live: filtered.filter((t) => t.status === "Live"),
      Scheduled: filtered.filter((t) => t.status === "Scheduled"),
      Completed: filtered.filter((t) => t.status === "Completed"),
    }),
    [filtered]
  );

  const handleViewRaces = (id: number | string) => {
    navigate(`${ROUTES.RACES}?tournamentId=${id}`);
  };

  const renderGroup = (title: string, items: Tournament[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          {title}
        </h2>
        <div className="space-y-3">
          {items.map((t) => (
            <TournamentCard key={t.id} tournament={t} onViewRaces={handleViewRaces} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 custom-scrollbar">
      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tournament Hub</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse tournaments and explore their full race roster.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Filter tabs */}
        <div className="mb-7 flex flex-wrap gap-1.5">
          {(["All", "Live", "Scheduled", "Completed"] as FilterTab[]).map((tab) => (
            <FilterTab
              key={tab}
              label={tab}
              active={activeFilter === tab}
              count={counts[tab]}
              onClick={() => setActiveFilter(tab)}
            />
          ))}
        </div>

        {/* Grouped lists */}
        {activeFilter === "All" ? (
          <>
            {renderGroup("Live Now", grouped.Live)}
            {renderGroup("Upcoming", grouped.Scheduled)}
            {renderGroup("Completed", grouped.Completed)}
          </>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <TournamentCard key={t.id} tournament={t} onViewRaces={handleViewRaces} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">
              No tournaments found{search ? ` for "${search}"` : ""}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}