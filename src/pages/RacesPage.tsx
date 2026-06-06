import { useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, Search, X, CalendarDays } from "lucide-react";
import { ROUTES } from "../router/routes.tsx";
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

interface LocationState {
  raceId?: number;
  date?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const allRaces: Race[] = [
  {
    id: 101,
    tournamentId: 1,
    title: "The Queen Anne Stakes",
    date: "2026-06-18",
    time: "14:30",
    distance: "1600m",
    surface: "Turf",
    className: "Group 1",
    status: "Completed",
  },
  {
    id: 102,
    tournamentId: 1,
    title: "Coventry Stakes",
    date: "2026-06-18",
    time: "15:05",
    distance: "1200m",
    surface: "Turf",
    className: "Group 2",
    status: "Completed",
  },
  {
    id: 103,
    tournamentId: 1,
    title: "King's Stand Stakes",
    date: "2026-06-18",
    time: "15:40",
    distance: "1000m",
    surface: "Turf",
    className: "Group 1",
    status: "Completed",
  },
  {
    id: 104,
    tournamentId: 1,
    title: "St James's Palace Stakes",
    date: "2026-06-18",
    time: "16:20",
    distance: "1600m",
    surface: "Turf",
    className: "Group 1",
    status: "Live",
  },
  {
    id: 105,
    tournamentId: 1,
    title: "Ascot Stakes",
    date: "2026-06-18",
    time: "17:00",
    distance: "4000m",
    surface: "Turf",
    className: "Handicap",
    status: "Upcoming",
  },
  {
    id: 106,
    tournamentId: 1,
    title: "Wolferton Stakes",
    date: "2026-06-18",
    time: "17:35",
    distance: "2000m",
    surface: "Turf",
    className: "Listed",
    status: "Upcoming",
  },
  {
    id: 107,
    tournamentId: 1,
    title: "Copper Horse Stakes",
    date: "2026-06-18",
    time: "18:10",
    distance: "2800m",
    surface: "Turf",
    className: "Handicap",
    status: "Upcoming",
  },
  {
    id: 108,
    tournamentId: 1,
    title: "Prince of Wales's Stakes",
    date: "2026-06-19",
    time: "15:40",
    distance: "2000m",
    surface: "Turf",
    className: "Group 1",
    status: "Upcoming",
  },
  {
    id: 109,
    tournamentId: 2,
    title: "Classic Turf Invitational",
    date: "2026-11-01",
    time: "16:00",
    distance: "2000m",
    surface: "Turf",
    className: "Group 1",
    status: "Upcoming",
  },
  {
    id: 110,
    tournamentId: 2,
    title: "Night Derby",
    date: "2026-11-02",
    time: "18:30",
    distance: "2400m",
    surface: "Dirt",
    className: "Group 3",
    status: "Upcoming",
  },
];

const tournamentNames: Record<number, string> = {
  1: "Royal Ascot Summer Series",
  2: "The Breeders' Cup World Championships",
};

const officials = [
  { initials: "AJ", name: "Arthur Jones", title: "Chief Steward" },
  { initials: "SB", name: "Sarah Baxter", title: "Starter" },
  { initials: "MT", name: "Mark Thompson", title: "Judge" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const STATUS_ORDER: Record<RaceStatus, number> = {
  Live: 0,
  Upcoming: 1,
  Completed: 2,
};

// ─── Compact Interactive Stat Filter Card ─────────────────────────────────────

interface StatFilterCardProps {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  liveDot?: boolean;
}

function StatFilterCard({
  label,
  value,
  active,
  onClick,
  liveDot,
}: StatFilterCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left rounded-2xl border py-2.5 px-4 transition-all ${
        active
          ? "border-primary bg-card shadow-sm ring-[1.5px] ring-primary"
          : "border-border bg-card hover:border-slate-300 hover:bg-slate-50/50"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${active ? "text-primary font-black" : "text-muted-foreground"}`}
      >
        {label}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <p className="text-xl font-black font-headline leading-none text-foreground">
          {value}
        </p>
        {liveDot && value > 0 && (
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
        )}
      </div>
    </button>
  );
}

// ─── Minimalist Race Row ───────────────────────────────────────────────────────

function RaceRow({
  race,
  selected,
  onClick,
}: {
  race: Race;
  selected: boolean;
  onClick: () => void;
}) {
  const isLive = race.status === "Live";
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-5 py-4 text-left transition-all border-l-4 ${
        selected
          ? "bg-primary/5 border-l-primary"
          : isLive
            ? "bg-secondary/5 border-l-secondary hover:bg-secondary/10"
            : "border-l-transparent hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span
          className={`font-mono text-base tracking-tight font-black ${selected ? "text-primary" : "text-muted-foreground"}`}
        >
          {race.time}
        </span>
        <div className="truncate">
          <p
            className={`font-bold font-headline text-base truncate ${selected ? "text-primary" : "text-foreground"}`}
          >
            {race.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {race.className} · {race.distance} · {race.surface}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 pl-4">
        {race.status === "Live" && (
          <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
        )}
        {race.status === "Completed" && (
          <span className="h-2 w-2 rounded-full bg-muted/80" />
        )}
        {race.status === "Upcoming" && (
          <span className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RacesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tournamentIdParam = searchParams.get("tournamentId");
  const tournamentId = tournamentIdParam ? Number(tournamentIdParam) : null;

  const { eventList } = useEvent();
  const { horseList } = useHorseList();

  // Get the route state at the top level for lazy initialization
  const routeState = location.state as LocationState;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  
  // Use lazy initialization to avoid calling setState in an effect
  const [selectedRace, setSelectedRace] = useState<Race | null>(
    () => (routeState?.raceId ? allRaces.find((r) => r.id === routeState.raceId) ?? null : null)
  );
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => (routeState?.date ? parseLocalDate(routeState.date) : parseLocalDate("2026-06-18"))
  );

  const tournamentName = useMemo(() => {
    if (!tournamentId) return null;
    if (eventList && eventList.length > 0) {
      const found = eventList.find((e) => Number(e.id) === tournamentId);
      if (found) return found.title;
    }
    return tournamentNames[tournamentId] ?? "Tournament";
  }, [tournamentId, eventList]);

  const baseRaces = useMemo(
    () =>
      tournamentId
        ? allRaces.filter((r) => r.tournamentId === tournamentId)
        : allRaces,
    [tournamentId]
  );

  const counts = useMemo(
    () => ({
      All: baseRaces.length,
      Live: baseRaces.filter((r) => r.status === "Live").length,
      Upcoming: baseRaces.filter((r) => r.status === "Upcoming").length,
      Completed: baseRaces.filter((r) => r.status === "Completed").length,
    }),
    [baseRaces]
  );

  const filteredRaces = useMemo(() => {
    const lower = search.toLowerCase();
    return baseRaces
      .filter((r) => {
        const matchStatus = statusFilter === "All" || r.status === statusFilter;
        const matchSearch =
          !lower ||
          r.title.toLowerCase().includes(lower) ||
          r.className.toLowerCase().includes(lower);
        return matchStatus && matchSearch;
      })
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.time.localeCompare(b.time)
      );
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
    return baseRaces.map((r) => parseLocalDate(r.date));
  }, [baseRaces]);

  const handleSelectRace = useCallback((race: Race) => {
    setSelectedRace((prev) => (prev?.id === race.id ? null : race));
  }, []);

  const panelOpen = selectedRace !== null;
  const isCalendarMode = !tournamentId;

  // Overwrite base ShadCN/React-Day-Picker cell widths cleanly using high specificity Tailwind rules
  const calendarScaleClasses = useMemo(() => {
    return !panelOpen
      ? "p-6 [&_.rdp-day]:!h-[46px] [&_.rdp-day]:!w-[46px] [&_.rdp-head_th]:!w-[46px] [&_.rdp-day]:!text-sm [&_.rdp-head_th]:!text-xs [&_.rdp-caption_label]:!text-base"
      : "p-4 [&_.rdp-day]:!h-9 [&_.rdp-day]:!w-9 [&_.rdp-head_th]:!w-9 [&_.rdp-day]:!text-xs [&_.rdp-head_th]:!text-[10px] [&_.rdp-caption_label]:!text-sm";
  }, [panelOpen]);

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 py-6 md:py-8">
        {/* --- TOP FIXED AREA --- */}
        <div className="flex-shrink-0">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() =>
                  tournamentId ? navigate(ROUTES.TOURNAMENTS) : navigate(-1)
                }
                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/40 transition-colors shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {tournamentName && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 truncate">
                    {tournamentName}
                  </p>
                )}
                <h1 className="text-3xl font-black font-headline text-primary tracking-tight leading-none truncate">
                  {tournamentId ? "Race Roster" : "All Races"}
                </h1>
              </div>
            </div>

            {/* SPACIOUS SEARCH BAR */}
            <div className="relative w-full sm:w-72 md:w-[22rem] shadow-sm rounded-xl border border-border bg-card">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search races..."
                className="w-full h-11 rounded-xl bg-transparent pl-11 pr-4 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Interactive Stat Filter Cards */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            <StatFilterCard
              label="Total"
              value={counts.All}
              active={statusFilter === "All"}
              onClick={() => setStatusFilter("All")}
            />
            <StatFilterCard
              label="Live"
              value={counts.Live}
              active={statusFilter === "Live"}
              onClick={() => setStatusFilter("Live")}
              liveDot
            />
            <StatFilterCard
              label="Upcoming"
              value={counts.Upcoming}
              active={statusFilter === "Upcoming"}
              onClick={() => setStatusFilter("Upcoming")}
            />
            <StatFilterCard
              label="Completed"
              value={counts.Completed}
              active={statusFilter === "Completed"}
              onClick={() => setStatusFilter("Completed")}
            />
          </div>
        </div>

        {/* --- DYNAMIC GRID LAYOUT --- */}
        {/* --- DYNAMIC GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start transition-all">
          {/* LEFT SIDE CONTENT */}
          <div
            className={`
            ${
              isCalendarMode
                ? panelOpen
                  ? "lg:col-span-4"
                  : "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start" // Increased gap here
                : panelOpen
                  ? "lg:col-span-3"
                  : "lg:col-span-12"
            }
          `}
          >
            {/* Calendar Block */}
            {isCalendarMode && (
              <div
                className={`${!panelOpen ? "lg:col-span-5 flex lg:justify-center mb-8 lg:mb-0" : "w-full mb-6"}`} // Added mb-8 for mobile spacing
              >
                <div
                  className={`rounded-2xl border border-border bg-card shadow-sm flex items-center justify-center transition-all mx-auto w-fit ${calendarScaleClasses}`}
                >
                  <div
                    className={`transform-origin-center ${!panelOpen ? "scale-100 xl:scale-105" : "scale-100"}`}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      defaultMonth={selectedDate || new Date(2026, 5)}
                      modifiers={{ hasRace: raceDays }}
                      modifiersClassNames={{
                        hasRace:
                          "font-black text-primary bg-primary/10 border border-primary/20 rounded-md",
                      }}
                      className="w-full flex justify-center text-sm font-medium mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* List Block */}
            <div
              className={`
              ${isCalendarMode && !panelOpen ? "lg:col-span-7" : "w-full"}
              space-y-4
            `}
            >
              {isCalendarMode ? (
                /* Calendar Mode filtered rows display */
                selectedDate && (
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        Schedule for{" "}
                        {selectedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="divide-y divide-border flex-1">
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
                        <div className="p-12 text-center text-sm text-muted-foreground font-medium">
                          No official races slated for this calendar day.
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : /* Group Mode listing map */
              grouped.length > 0 ? (
                <div className="space-y-6">
                  {grouped.map(([date, races]) => (
                    <div
                      key={date}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="border-b border-border bg-muted/20 px-5 py-3">
                        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                          {fmtShort(date)}
                        </span>
                      </div>
                      <div className="divide-y divide-border">
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
                <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    No matches for query found.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE DETAIL PANEL */}
          {panelOpen && selectedRace && (
            <div
              className={`${isCalendarMode ? "lg:col-span-8" : "lg:col-span-9"} lg:sticky lg:top-8 overflow-hidden border border-border bg-card rounded-2xl shadow-lg flex flex-col min-h-[500px] xl:min-h-[640px] animate-in fade-in slide-in-from-right-8 duration-200`}
            >
              {/* Context Header */}
              <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-border bg-background">
                <div className="min-w-0 flex-1">
                  {tournamentName && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 truncate">
                      {tournamentName}
                    </p>
                  )}
                  <h2 className="text-3xl font-bold font-headline text-primary tracking-tight leading-tight">
                    {selectedRace.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 font-medium tracking-tight">
                    <span className="px-2 py-0.5 rounded border border-border bg-card">
                      {selectedRace.className}
                    </span>
                    <span>
                      {selectedRace.distance} • {selectedRace.surface} Phase Run
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRace(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-background hover:text-foreground transition-all shadow-sm active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Central Information Stack */}
              <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
                {/* Embedded Horse Draw Registry Block */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                    Confirmed Runner Line-up
                  </h3>

                  {horseList && horseList.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-20 text-center">
                              Cloth #
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Nominee Registration
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Active Jockey
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                              Reg Trainer
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm bg-card">
                          {horseList
                            .slice(
                              selectedRace.id % 2,
                              (selectedRace.id % 2) + 7
                            )
                            .map((horse, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-primary/5 transition-colors cursor-default"
                              >
                                <td className="px-6 py-4.5 text-center">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background shadow-sm text-xs font-black text-foreground mx-auto">
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4.5 font-bold font-headline text-primary text-base leading-snug">
                                  {horse.name}
                                </td>
                                <td className="px-6 py-4.5 font-medium text-foreground">
                                  {horse.jockey}
                                </td>
                                <td className="px-6 py-4.5 text-muted-foreground hidden md:table-cell">
                                  {horse.owner}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground font-medium bg-background">
                      No verified roster loaded. Final draws unlisted.
                    </div>
                  )}
                </div>

                {/* Technical Board Roster Block */}
                <div className="border-t border-border pt-10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                    Racing Officials Board
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {officials.map((o) => (
                      <div
                        key={o.initials}
                        className="flex items-center gap-4 rounded-xl border border-border p-4 bg-background"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm bg-card text-primary text-sm font-black border border-border">
                          {o.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black font-headline text-foreground truncate leading-tight">
                            {o.name}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground truncate leading-tight mt-1">
                            {o.title}
                          </p>
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