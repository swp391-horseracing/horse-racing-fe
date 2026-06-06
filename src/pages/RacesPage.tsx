import { useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Flag, CalendarDays, ChevronRight, Radio,
  CheckCircle2, Clock, Search, X, Users, ExternalLink,
} from "lucide-react";
import { ROUTES, buildRoute } from "../router/routes.tsx";
import { useHorseList } from "../hooks/useHorseList";
import { useEvent } from "../hooks/useEvent";

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

const fmtFull = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const STATUS_ORDER: Record<RaceStatus, number> = { Live: 0, Upcoming: 1, Completed: 2 };

// ─── Shared badge components ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: RaceStatus }) {
  const styles: Record<RaceStatus, string> = {
    Live:      "bg-amber-50 text-amber-800 border-amber-200",
    Upcoming:  "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${styles[status]}`}>
      {status === "Live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />}
      {status}
    </span>
  );
}

function ClassBadge({ label }: { label: string }) {
  const map: Record<string, string> = {
    "Group 1":  "bg-violet-50 text-violet-700 border-violet-200",
    "Group 2":  "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Group 3":  "bg-sky-50 text-sky-700 border-sky-200",
    "Listed":   "bg-teal-50 text-teal-700 border-teal-200",
    "Handicap": "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${map[label] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {label}
    </span>
  );
}

function StatusIcon({ status }: { status: RaceStatus }) {
  if (status === "Live")      return <Radio className="h-3.5 w-3.5 text-amber-500 animate-pulse" />;
  if (status === "Completed") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  return <Clock className="h-3.5 w-3.5 text-slate-400" />;
}

// ─── Race Row ──────────────────────────────────────────────────────────────────

function RaceRow({ race, selected, onClick }: { race: Race; selected: boolean; onClick: () => void }) {
  const isLive = race.status === "Live";
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 ${
        selected
          ? "bg-emerald-50 border-l-emerald-600"
          : isLive
          ? "bg-amber-50/40 border-l-amber-400 hover:bg-amber-50"
          : "border-l-transparent hover:bg-slate-50"
      }`}
    >
      {/* Time block */}
      <div className={`flex w-16 shrink-0 flex-col items-center rounded-lg border px-2 py-1.5 transition-colors ${
        selected
          ? "border-emerald-200 bg-emerald-100"
          : isLive
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50 group-hover:border-emerald-200 group-hover:bg-emerald-50"
      }`}>
        <span className={`text-[8px] font-black uppercase tracking-widest leading-tight ${
          selected ? "text-emerald-600" : isLive ? "text-amber-600" : "text-slate-400 group-hover:text-emerald-500"
        }`}>
          {new Date(race.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <span className={`font-mono text-sm font-black leading-snug ${
          selected ? "text-emerald-900" : isLive ? "text-amber-800" : "text-slate-800 group-hover:text-emerald-900"
        }`}>
          {race.time}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <StatusIcon status={race.status} />
          <span className={`text-sm font-bold truncate transition-colors ${selected ? "text-emerald-800" : "text-slate-900 group-hover:text-emerald-800"}`}>
            {race.title}
          </span>
          <StatusBadge status={race.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ClassBadge label={race.className} />
          <span className="flex items-center gap-1 text-[11px] text-slate-400"><Flag className="h-3 w-3" />{race.distance}</span>
          <span className="text-[11px] text-slate-400">{race.surface}</span>
        </div>
      </div>

      <ChevronRight className={`h-4 w-4 shrink-0 transition-all ${selected ? "rotate-90 text-emerald-500" : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-emerald-400"}`} />
    </button>
  );
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

function RacePanel({
  race,
  tournamentName,
  onClose,
  onViewFull,
  horseList,
}: {
  race: Race;
  tournamentName: string | null;
  onClose: () => void;
  onViewFull: () => void;
  horseList: any[];
}) {
  const drawList = useMemo(() => {
    if (!horseList || horseList.length === 0) return [];
    const startIndex = race.id % 3;
    return horseList.slice(startIndex, startIndex + 6).map((horse, idx) => ({
      draw: idx + 1,
      horse: horse.name,
      jockey: horse.jockey,
      trainer: horse.owner,
    }));
  }, [horseList, race.id]);

  const isLive = race.status === "Live";

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 ${isLive ? "bg-amber-50" : "bg-white"}`}>
        <div className="min-w-0 flex-1">
          {tournamentName && (
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">{tournamentName}</p>
          )}
          <h2 className="text-base font-black text-slate-900 leading-tight">{race.title}</h2>
          <div className="mt-1.5">
            <StatusBadge status={race.status} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Race meta */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            { label: "Date",     value: fmtShort(race.date) },
            { label: "Distance", value: race.distance        },
            { label: "Surface",  value: race.surface         },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
              <p className="text-xs font-black text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ClassBadge label={race.className} />
            <span className={`rounded-md border px-2 py-0.5 text-[9px] font-black ${
              isLive ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-600"
            }`}>
              {race.time} start
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {fmtFull(race.date)} · {race.distance} · {race.surface} · {race.className}
          </p>
        </div>

        {/* Start list */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Start List
            </h3>
            {isLive && (
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600">
                <Radio className="h-3 w-3 animate-pulse" /> Live
              </span>
            )}
          </div>

          {drawList.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["#", "Horse", "Jockey"].map((h) => (
                      <th key={h} className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drawList.map((entry) => (
                    <tr key={entry.draw} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-black text-slate-600">{entry.draw}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-bold text-emerald-900 max-w-[100px] truncate">{entry.horse}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[90px] truncate">{entry.jockey}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 font-medium">
              No draw data available yet
            </div>
          )}
        </div>

        {/* Officials */}
        <div className="px-5 py-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Officials</h3>
          <div className="space-y-2">
            {officials.map((o) => (
              <div key={o.initials} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black ring-1 ring-emerald-100">
                  {o.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{o.name}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{o.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel footer */}
      <div className="border-t border-slate-100 bg-white p-4">
        <button
          onClick={onViewFull}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-black text-white transition-all hover:bg-emerald-800 active:scale-95"
        >
          View Full Detail <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
      active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    }`}>
      {label}
      <span className={`rounded-full px-1.5 py-px text-[9px] font-black leading-none ${active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
        {count}
      </span>
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${accent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${accent ? "text-amber-600" : "text-slate-400"}`}>{label}</p>
      <p className={`text-xl font-black leading-none ${accent ? "text-amber-800" : "text-slate-900"}`}>{value}</p>
    </div>
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
        const matchSearch = !lower || r.title.toLowerCase().includes(lower) || r.className.toLowerCase().includes(lower) || r.surface.toLowerCase().includes(lower);
        return matchStatus && matchSearch;
      })
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.time.localeCompare(b.time));
  }, [baseRaces, statusFilter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Race[]>();
    filteredRaces.forEach((r) => {
      const existing = map.get(r.date) ?? [];
      map.set(r.date, [...existing, r]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRaces]);

  const handleSelectRace = useCallback((race: Race) => {
    setSelectedRace((prev) => (prev?.id === race.id ? null : race));
  }, []);

  const handleViewFull = useCallback(() => {
    if (selectedRace) navigate(buildRoute(ROUTES.RACE_DETAIL, selectedRace.id));
  }, [selectedRace, navigate]);

  const panelOpen = selectedRace !== null;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
          <div className="mx-auto max-w-2xl px-4 py-6">

            {/* Back */}
            <button
              onClick={() => tournamentId ? navigate(ROUTES.TOURNAMENTS) : navigate(-1)}
              className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {tournamentId ? "All Tournaments" : "Back"}
            </button>

            {/* Header */}
            <div className="mb-5">
              {tournamentName && (
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{tournamentName}</p>
              )}
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {tournamentId ? "Race Roster" : "All Races"}
              </h1>
            </div>

            {/* Stats */}
            <div className="mb-5 grid grid-cols-4 gap-2">
              <StatCard label="Total"     value={counts.All}       />
              <StatCard label="Live"      value={counts.Live}      accent={counts.Live > 0} />
              <StatCard label="Upcoming"  value={counts.Upcoming}  />
              <StatCard label="Completed" value={counts.Completed} />
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search races…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Status filters */}
            <div className="mb-5 flex flex-wrap gap-1.5">
              {(["All", "Live", "Upcoming", "Completed"] as StatusFilter[]).map((tab) => (
                <FilterPill key={tab} label={tab} active={statusFilter === tab} count={counts[tab as keyof typeof counts]} onClick={() => setStatusFilter(tab)} />
              ))}
            </div>

            {/* Race list grouped by date */}
            {grouped.length > 0 ? (
              <div className="space-y-4">
                {grouped.map(([date, races]) => (
                  <div key={date} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Date header */}
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-black text-slate-600">{fmtShort(date)}</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-400">{races.length} race{races.length !== 1 ? "s" : ""}</span>
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
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <CalendarDays className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">
                  No races found{search ? ` for "${search}"` : ""}.
                </p>
              </div>
            )}

            {filteredRaces.length > 0 && (
              <p className="mt-4 text-center text-xs text-slate-400 font-medium">
                {filteredRaces.length} of {baseRaces.length} race{baseRaces.length !== 1 ? "s" : ""}
                {panelOpen && " · Click a row to deselect"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Side panel ── */}
      <div
        style={{ width: panelOpen ? "360px" : "0", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }}
        className="flex-shrink-0 border-l border-slate-200 bg-white overflow-hidden"
      >
        {selectedRace && (
          <RacePanel
            race={selectedRace}
            tournamentName={tournamentName}
            onClose={() => setSelectedRace(null)}
            onViewFull={handleViewFull}
            horseList={horseList ?? []}
          />
        )}
      </div>
    </div>
  );
}