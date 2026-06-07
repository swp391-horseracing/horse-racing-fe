import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  X,
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
} from "lucide-react";
import { ROUTES } from "../router/routes.tsx";

import { useEvent } from "../hooks/useEvent";
import { useRaces, useRaceDetail } from "../hooks/useRaces";
import type { RaceListItem, RaceApiStatus } from "../services/raceService";

// Import Shared Abstracted Components
import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar";
import { ScheduleStatCard } from "../components/schedule/ScheduleStatCard";

// ── Types ───────────────────────────────────────────────────────────────────

type RaceStatus = "Live" | "Upcoming" | "Completed";
type StatusFilter = "All" | RaceStatus;

interface RaceUI extends Omit<RaceListItem, "status"> {
  title: string;
  date: string;
  time: string;
  distance: string;
  surface: string;
  className: string;
  status: RaceStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mapApiStatusToUi = (status: RaceApiStatus): RaceStatus => {
  if (status === "ongoing") return "Live";
  if (status === "completed" || status === "result_confirmed")
    return "Completed";
  return "Upcoming";
};

const mapRaceToUi = (race: RaceListItem): RaceUI => {
  const scheduled = new Date(race.scheduledAt);
  const yyyy = scheduled.getFullYear();
  const mm = String(scheduled.getMonth() + 1).padStart(2, "0");
  const dd = String(scheduled.getDate()).padStart(2, "0");
  const hh = String(scheduled.getHours()).padStart(2, "0");
  const min = String(scheduled.getMinutes()).padStart(2, "0");

  return {
    ...race,
    title: race.name,
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`,
    distance: "TBC",
    surface: race.venue,
    className: "Standard",
    status: mapApiStatusToUi(race.status),
  };
};

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

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "TBC";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function RaceRow({
  race,
  selected,
  onClick,
}: {
  race: RaceUI;
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
            {race.className} · {race.distance} · {race.surface} · {race.date}
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RacesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tournamentIdParam = searchParams.get("tournamentId");
  const tournamentId = tournamentIdParam ?? null;

  const routeState = location.state as {
    raceId?: string;
    date?: string;
  } | null;

  const { eventList } = useEvent();
  const {
    races: apiRaces,
    loading: racesLoading,
    loadRacesByMonth,
  } = useRaces();
  const {
    detail: raceDetail,
    loading: detailLoading,
    error: detailError,
    loadDetail,
    clearDetail,
  } = useRaceDetail();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    routeState?.date ? parseLocalDate(routeState.date) : new Date()
  );
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(
    routeState?.raceId ?? null
  );
  const [viewMonth, setViewMonth] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth() + 1;
    console.log("Update API");
    loadRacesByMonth(year, month);
  }, [viewMonth.getFullYear(), viewMonth.getMonth(), loadRacesByMonth]);

  // [Calendar Sync Effect]
  useEffect(() => {
    if (selectedDate) {
      setViewMonth((prev) => {
        const prevYear = prev.getFullYear();
        const prevMonth = prev.getMonth();
        const nextYear = selectedDate.getFullYear();
        const nextMonth = selectedDate.getMonth();

        if (prevYear !== nextYear || prevMonth !== nextMonth) {
          return selectedDate;
        } else {
          console.log("Update Date");
          return prev;
        }
      });
    }
  }, [selectedDate]);

  const handleMonthChange = useCallback((newMonth: Date) => {
    setViewMonth(newMonth);
  }, []);

  useEffect(() => {
    if (selectedRaceId) {
      loadDetail(selectedRaceId);
    } else {
      clearDetail();
    }
  }, [selectedRaceId, loadDetail, clearDetail]);

  const allRaces = useMemo(() => apiRaces.map(mapRaceToUi), [apiRaces]);

  const tournamentName = useMemo(() => {
    if (!tournamentId) return null;
    if (eventList && eventList.length > 0) {
      const found = eventList.find((e) => String(e.id) === tournamentId);
      if (found) return found.title;
    }
    return "Tournament";
  }, [tournamentId, eventList]);

  const counts = useMemo(
    () => ({
      All: allRaces.length,
      Live: allRaces.filter((r) => r.status === "Live").length,
      Upcoming: allRaces.filter((r) => r.status === "Upcoming").length,
      Completed: allRaces.filter((r) => r.status === "Completed").length,
    }),
    [allRaces]
  );

  const filteredRaces = useMemo(() => {
    const lower = search.toLowerCase();
    return allRaces
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
  }, [allRaces, statusFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, RaceUI[]>();
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
    return allRaces.map((r) => parseLocalDate(r.date));
  }, [allRaces]);

  const handleSelectRace = useCallback((raceId: string) => {
    setSelectedRaceId(raceId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedRaceId(null);
  }, []);

  const panelOpen = selectedRaceId !== null;
  const isCalendarMode = !tournamentId;

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 py-6 md:py-8">
        <div className="flex-shrink-0">
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

          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {(["All", "Live", "Upcoming", "Completed"] as const).map((key) => {
              const labels = {
                All: "Total",
                Live: "Live",
                Upcoming: "Upcoming",
                Completed: "Completed",
              };
              return (
                <ScheduleStatCard
                  key={key}
                  label={labels[key]}
                  value={counts[key]}
                  active={statusFilter === key}
                  onClick={() => setStatusFilter(key)}
                  liveDot={key === "Live"}
                  activeClass="border-primary bg-card shadow-sm ring-[1.5px] ring-primary"
                  inactiveClass="border-border bg-card hover:border-slate-300 hover:bg-slate-50/50"
                />
              );
            })}
          </div>
        </div>

        {/* --- DYNAMIC GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start transition-all">
          <div
            className={`
            ${
              isCalendarMode
                ? panelOpen
                  ? "lg:col-span-4"
                  : "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start"
                : panelOpen
                  ? "lg:col-span-3"
                  : "lg:col-span-12"
            }
          `}
          >
            {isCalendarMode && (
              <div
                className={`${!panelOpen ? "lg:col-span-5 flex lg:justify-center mb-8 lg:mb-0" : "w-full mb-6"}`}
              >
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                  defaultMonth={viewMonth}
                  onMonthChange={handleMonthChange}
                  raceDays={raceDays}
                  highlightClass="font-black text-primary bg-primary/10 border border-primary/20 rounded-md"
                />
              </div>
            )}

            <div
              className={`${isCalendarMode && !panelOpen ? "lg:col-span-7" : "w-full"} space-y-4`}
            >
              {racesLoading ? (
                <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Loading races...
                  </p>
                </div>
              ) : isCalendarMode ? (
                selectedDate && (
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                    <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        {fmtShort(formattedSelectedDate)}
                      </span>
                    </div>
                    <div className="divide-y divide-border flex-1">
                      {calendarFilteredRaces.length > 0 ? (
                        calendarFilteredRaces.map((race) => (
                          <RaceRow
                            key={race.id}
                            race={race}
                            selected={selectedRaceId === race.id}
                            onClick={() => handleSelectRace(race.id)}
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
              ) : grouped.length > 0 ? (
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
                            selected={selectedRaceId === race.id}
                            onClick={() => handleSelectRace(race.id)}
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
          {panelOpen && (
            <div
              className={`${isCalendarMode ? "lg:col-span-8" : "lg:col-span-9"} lg:sticky lg:top-8 overflow-hidden border border-border bg-card rounded-2xl shadow-lg flex flex-col min-h-[500px] xl:min-h-[640px] animate-in fade-in slide-in-from-right-8 duration-200`}
            >
              {detailLoading ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Loading race details...
                  </p>
                </div>
              ) : detailError ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <p className="text-sm font-semibold text-destructive">
                    {detailError}
                  </p>
                </div>
              ) : raceDetail ? (
                <>
                  <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-border bg-background">
                    <div className="min-w-0 flex-1">
                      {tournamentName && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 truncate">
                          {tournamentName}
                        </p>
                      )}
                      <h2 className="text-3xl font-bold font-headline text-primary tracking-tight leading-tight">
                        {raceDetail.name}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 font-medium tracking-tight flex-wrap">
                        <span className="px-2 py-0.5 rounded border border-border bg-card">
                          {raceDetail.roundName || "Standard"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(raceDetail.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {raceDetail.venue}
                        </span>
                        {raceDetail.distanceMeters && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {raceDetail.distanceMeters}m
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleCloseDetail}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-background hover:text-foreground transition-all shadow-sm active:scale-95"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                        Race Entries - Horses & Jockeys
                      </h3>
                      {raceDetail.entries && raceDetail.entries.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                          <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border">
                              <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-20 text-center">
                                  #
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Horse Name
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                                  Lane
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Jockey Name
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  weight
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm bg-card">
                              {raceDetail.entries.map((entry, idx) => (
                                <tr
                                  key={entry.id || idx}
                                  className="hover:bg-primary/5 transition-colors cursor-default"
                                >
                                  <td className="px-6 py-4.5 text-center">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background shadow-sm text-xs font-black text-foreground mx-auto">
                                      {entry.clothNumber || idx + 1}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4.5 font-bold font-headline text-primary text-base leading-snug">
                                    {entry.name}
                                  </td>
                                  <td className="px-6 py-4.5 text-xs text-muted-foreground font-mono break-all">
                                    {entry.laneNumber}
                                  </td>
                                  <td className="px-6 py-4.5 font-medium text-foreground">
                                    {entry.jockeyName}
                                  </td>
                                  <td className="px-6 py-4.5 text-muted-foreground hidden md:table-cell">
                                    {entry.weightKg}
                                  </td>
                                  <td className="px-6 py-4.5 font-medium text-foreground">
                                    {entry.entryStatus}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground font-medium bg-background">
                          No horse entries available yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
