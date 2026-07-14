import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CalendarDays,
  Clock,
  Flag,
  Hash,
  Layers,
  Trophy,
  Target,
  Send,
  Play,
} from "lucide-react";
import { ROUTES } from "../router/routes";

import { useEvent } from "../hooks/useEvent";
import { useRaces, useRaceDetail } from "../hooks/useRaces";
import type { RaceListItem, RaceApiStatus, RaceEntry } from "../types/race";
import type { DateRange } from "react-day-picker";
import { useToast } from "../hooks/useToast";
import { useOwner } from "../hooks/useOwner";
import { formatStatus } from "../utils/formatters";
import {
  getRaceStatusStyle,
  getRaceStatusDetailStyle,
} from "../utils/statusStyles";
import { ToastContainer } from "../components/ui/toast";
import { friendlyErrorMessage } from "../utils/errorMessages";
import { cn } from "../lib/utils";

import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar";
import { ScheduleDetailFrame } from "../components/schedule/ScheduleDetailFrame";
import { PlacePredictionModal } from "../components/spectator/PlacePredictionModal";
import { EnterRaceModal } from "../components/owner/EnterRaceModal";
import { TrackService } from "../services/TrackService";

let _venueCache: Map<string, { distance: string; surface: string }> | null =
  null;
let _venueCachePromise: Promise<void> | null = null;

function loadVenueCache(): Promise<void> {
  if (_venueCache) return Promise.resolve();
  if (!_venueCachePromise) {
    _venueCachePromise = TrackService.getTracks({ limit: 100 })
      .then((res) => {
        const items = res.data ?? [];
        const map = new Map<string, { distance: string; surface: string }>();
        for (const c of items) {
          if (c.name && c.distanceMeters != null) {
            map.set(c.name, {
              distance: `${c.distanceMeters}m`,
              surface: c.surfaceType
                ? c.surfaceType.charAt(0).toUpperCase() + c.surfaceType.slice(1)
                : "",
            });
          }
        }
        _venueCache = map;
      })
      .catch(() => {
        _venueCache = new Map();
      });
  }
  return _venueCachePromise;
}

interface RaceUI extends Omit<RaceListItem, "status"> {
  title: string;
  date: string;
  time: string;
  distance: string;
  surface: string;
  className: string;
  status: RaceApiStatus;
  isOpenForPrediction: boolean;
}

const mapRaceToUi = (race: RaceListItem): RaceUI => {
  const scheduled = new Date(race.scheduledAt);

  const yyyy = scheduled.getUTCFullYear();
  const mm = String(scheduled.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(scheduled.getUTCDate()).padStart(2, "0");
  const hh = String(scheduled.getUTCHours()).padStart(2, "0");
  const min = String(scheduled.getUTCMinutes()).padStart(2, "0");

  let distance = race.course?.distanceMeters
    ? `${race.course.distanceMeters}m`
    : "";
  let surface = race.course?.surfaceType
    ? race.course.surfaceType.charAt(0).toUpperCase() +
      race.course.surfaceType.slice(1)
    : "";

  if (!distance && _venueCache) {
    const match = _venueCache.get(race.venue);
    if (match) {
      distance = match.distance;
      surface = match.surface || surface;
    }
  }

  return {
    ...race,
    title: race.name,
    date: `${yyyy}-${mm}-${dd}`,
    time: `${hh}:${min}`,
    distance,
    surface,
    className: "Standard",
    status: race.status,
    isOpenForPrediction:
      race.status === "scheduled" || race.status === "pre_race",
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

const formatTime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

function RaceRow({
  race,
  selected,
  onClick,
  showPredictBadge,
  canEnter,
}: {
  race: RaceUI;
  selected: boolean;
  onClick: () => void;
  showPredictBadge?: boolean;
  canEnter?: boolean;
}) {
  const isLive = race.status === "ongoing";
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-3 py-3 text-left transition-all border-l-4 ${
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
            {[
              race.distance,
              race.surface,
              race.venue,
              race.date,
              race.entryCount
                ? `${race.entryCount} entries`
                : race.laneCount
                  ? `${race.laneCount} lanes`
                  : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pl-4">
        {race.isOpenForPrediction && canEnter && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20">
            Enter race
          </span>
        )}
        {race.isOpenForPrediction && showPredictBadge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EAB308]/15 text-[#8A6D00] border border-[#EAB308]/30">
            Predict
          </span>
        )}
        {isLive ? (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${getRaceStatusStyle(race.status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Live
          </span>
        ) : (
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${getRaceStatusStyle(race.status)}`}
          >
            {race.status === "completed" && (
              <span className="h-1.5 w-1.5 rounded-full bg-muted/80" />
            )}
            {formatStatus(race.status)}
          </span>
        )}
      </div>
    </button>
  );
}

export default function RacesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tournamentIdParam = searchParams.get("tournamentId");
  const tournamentId = tournamentIdParam ?? null;
  const { id: urlRaceId } = useParams<{ id: string }>();

  const routeState = location.state as {
    raceId?: string;
    date?: string;
  } | null;

  const { eventList } = useEvent();
  const {
    races: apiRaces,
    rangeRaces,
    loading: racesLoading,
    upcomingRaces,
    upcomingLoading,
    loadRacesByMonth,
    loadRacesForRange,
    loadUpcomingRaces,
  } = useRaces();

  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [selectedDistances, setSelectedDistances] = useState<Set<string>>(
    new Set()
  );
  const [distanceOpen, setDistanceOpen] = useState(false);
  const distanceRef = useRef<HTMLDivElement>(null);
  const [venueCacheReady, setVenueCacheReady] = useState(!!_venueCache);

  const [activeTab, setActiveTab] = useState<"upcoming" | "calendar">(
    "upcoming"
  );
  const isCalendarMode = activeTab === "calendar";

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    routeState?.date
      ? (() => {
          const d = parseLocalDate(routeState.date);
          return { from: d, to: d };
        })()
      : undefined
  );
  const raceId = urlRaceId ?? routeState?.raceId ?? null;

  const [viewMonth, setViewMonth] = useState<Date>(new Date());

  const [userSession] = useState<{
    id: string;
    role: string;
    fullName: string;
  } | null>(() => {
    try {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const isSpectator = userSession?.role === "spectator";
  const isOwner = userSession?.role === "horse_owner";

  const { enterRace, approvedTournamentIds, eligibleHorsesByTournament } =
    useOwner();

  const [enterRaceModalOpen, setEnterRaceModalOpen] = useState(false);

  const [predictModalOpen, setPredictModalOpen] = useState(
    () => !!(urlRaceId && searchParams.get("predict") === "true")
  );
  const [modalKey, setModalKey] = useState(0);
  const { toasts, addToast } = useToast();

  const [myPredictions, setMyPredictions] = useState<
    Map<
      string,
      { entryId: string; horseName: string; predictedPosition: number }
    >
  >(new Map());

  const viewYear = viewMonth.getFullYear();
  const viewMonthIndex = viewMonth.getMonth();

  const {
    detail: raceDetail,
    loading: detailLoading,
    error: detailError,
    refetch: loadDetail,
  } = useRaceDetail(raceId);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (raceDetail?.status !== "ongoing") return;
    const tick = () => {
      const elapsed = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(raceDetail.scheduledAt).getTime()) / 1000
        )
      );
      setElapsedSeconds(elapsed);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [raceDetail?.id, raceDetail?.status, raceDetail?.scheduledAt]);

  const currentPrediction = raceDetail
    ? myPredictions.get(raceDetail.id)
    : undefined;

  const eligibleHorsesForRace = raceDetail?.tournamentId
    ? (eligibleHorsesByTournament.get(raceDetail.tournamentId) ?? [])
    : [];

  const canEnterRace =
    isOwner &&
    (raceDetail?.status === "scheduled" || raceDetail?.status === "pre_race") &&
    raceDetail?.tournamentId &&
    approvedTournamentIds.has(raceDetail.tournamentId);

  useEffect(() => {
    loadRacesByMonth(viewYear, viewMonthIndex + 1);
  }, [viewYear, viewMonthIndex, loadRacesByMonth]);

  useEffect(() => {
    loadUpcomingRaces(20);
  }, [loadUpcomingRaces]);

  useEffect(() => {
    if (selectedRange?.from && selectedRange?.to) {
      loadRacesForRange(selectedRange.from, selectedRange.to);
    }
  }, [selectedRange?.from, selectedRange?.to, loadRacesForRange]);

  useEffect(() => {
    loadVenueCache().then(() => setVenueCacheReady(true));
  }, []);

  const effectiveRaces = useMemo(() => {
    if (isCalendarMode) {
      if (selectedRange?.from && selectedRange?.to) return rangeRaces;
      return apiRaces;
    }
    return upcomingRaces;
  }, [
    selectedRange?.from,
    selectedRange?.to,
    rangeRaces,
    upcomingRaces,
    apiRaces,
    isCalendarMode,
  ]);

  const allRaces = useMemo(
    () => effectiveRaces.map(mapRaceToUi),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveRaces, venueCacheReady]
  );

  const tournamentName = useMemo(() => {
    if (!tournamentId) return null;
    if (eventList && eventList.length > 0) {
      const found = eventList.find((e) => String(e.id) === tournamentId);
      if (found) return found.title;
    }
    return "Tournament";
  }, [tournamentId, eventList]);

  const filteredRaces = useMemo(() => {
    const lower = search.toLowerCase();
    return allRaces
      .filter((r) => {
        const matchStatus =
          selectedStatuses.size === 0 || selectedStatuses.has(r.status);
        const matchSearch =
          !lower ||
          r.title.toLowerCase().includes(lower) ||
          r.className.toLowerCase().includes(lower);
        const matchDistance =
          selectedDistances.size === 0 || selectedDistances.has(r.distance);
        return matchStatus && matchSearch && matchDistance;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [allRaces, selectedStatuses, search, selectedDistances]);

  const grouped = useMemo(() => {
    const map = new Map<string, RaceUI[]>();
    filteredRaces.forEach((r) => {
      const existing = map.get(r.date) ?? [];
      map.set(r.date, [...existing, r]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRaces]);

  const dateRangeStr = useMemo(() => {
    if (!selectedRange?.from) return undefined;
    const yyyy = selectedRange.from.getFullYear();
    const mm = String(selectedRange.from.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedRange.from.getDate()).padStart(2, "0");
    const from = `${yyyy}-${mm}-${dd}`;
    if (!selectedRange.to) return from;
    const y2 = selectedRange.to.getFullYear();
    const m2 = String(selectedRange.to.getMonth() + 1).padStart(2, "0");
    const d2 = String(selectedRange.to.getDate()).padStart(2, "0");
    return { from, to: `${y2}-${m2}-${d2}` };
  }, [selectedRange]);

  const nextFiveRaces = useMemo(() => {
    return filteredRaces.slice(0, 5);
  }, [filteredRaces]);

  const calendarFilteredRaces = useMemo(() => {
    if (!dateRangeStr) return nextFiveRaces;
    if (typeof dateRangeStr === "string") {
      return filteredRaces.filter((r) => r.date === dateRangeStr);
    }
    return filteredRaces.filter(
      (r) => r.date >= dateRangeStr.from && r.date <= dateRangeStr.to
    );
  }, [filteredRaces, dateRangeStr, nextFiveRaces]);

  const calendarRaces = useMemo(() => {
    const source =
      selectedRange?.from && selectedRange?.to ? rangeRaces : apiRaces;
    return source.map(mapRaceToUi);
  }, [selectedRange?.from, selectedRange?.to, rangeRaces, apiRaces]);

  const raceDays = useMemo(() => {
    return calendarRaces.map((r) => parseLocalDate(r.date));
  }, [calendarRaces]);

  const racesInRange = useMemo(() => {
    if (!isCalendarMode || !dateRangeStr) return allRaces;
    if (typeof dateRangeStr === "string") {
      return allRaces.filter((r) => r.date === dateRangeStr);
    }
    return allRaces.filter(
      (r) => r.date >= dateRangeStr.from && r.date <= dateRangeStr.to
    );
  }, [allRaces, dateRangeStr, isCalendarMode]);

  const handleSelectRace = useCallback(
    (id: string) => {
      navigate(`/races/${id}`);
    },
    [navigate]
  );

  const handleCloseDetail = useCallback(() => {
    navigate(ROUTES.RACES);
  }, [navigate]);

  const panelOpen = raceId !== null;

  const uniqueStatuses = useMemo(
    () => [...new Set(racesInRange.map((r) => r.status))],
    [racesInRange]
  );

  const toggleStatus = useCallback((s: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }, []);

  const uniqueDistances = useMemo(() => {
    const distances = racesInRange
      .map((r) => r.distance)
      .filter(Boolean) as string[];
    return [...new Set(distances)].sort((a, b) => parseInt(a) - parseInt(b));
  }, [racesInRange]);

  const toggleDistance = useCallback((d: string) => {
    setSelectedDistances((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        distanceRef.current &&
        !distanceRef.current.contains(e.target as Node)
      ) {
        setDistanceOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const user = JSON.parse(sessionStorage.getItem("user") ?? "null");

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 py-6 md:py-8">
        <div className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                onClick={() =>
                  tournamentId
                    ? navigate(`${ROUTES.TOURNAMENTS}?selected=${tournamentId}`)
                    : navigate(-1)
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

          <div className="flex gap-1 mb-6 rounded-xl bg-muted/30 p-1 border border-border w-fit">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 border",
                activeTab === "upcoming"
                  ? "bg-[#064E3B] text-white border-[#064E3B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/30"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Upcoming Races
              {upcomingRaces.length > 0 && (
                <span className="ml-1 text-[10px] opacity-80">
                  ({upcomingRaces.length})
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 border",
                activeTab === "calendar"
                  ? "bg-[#064E3B] text-white border-[#064E3B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/30"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Status
            </span>
            <button
              onClick={() => setSelectedStatuses(new Set())}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border",
                selectedStatuses.size === 0
                  ? "bg-[#064E3B] text-white border-[#064E3B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/30"
              )}
            >
              All
            </button>
            {uniqueStatuses.map((key) => (
              <button
                key={key}
                onClick={() => toggleStatus(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border",
                  selectedStatuses.has(key)
                    ? "bg-[#064E3B] text-white border-[#064E3B]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/30"
                )}
              >
                {formatStatus(key)}
              </button>
            ))}
          </div>

          {uniqueDistances.length > 0 && (
            <div
              className="mb-6 flex flex-wrap items-center gap-2"
              ref={distanceRef}
            >
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Distance
              </span>
              <div className="relative">
                <button
                  onClick={() => setDistanceOpen((prev) => !prev)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border",
                    selectedDistances.size > 0
                      ? "bg-[#064E3B] text-white border-[#064E3B]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/30"
                  )}
                >
                  {selectedDistances.size === 0
                    ? "All"
                    : `${selectedDistances.size} selected`}
                </button>
                {distanceOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 py-2">
                    {uniqueDistances.map((d) => (
                      <label
                        key={d}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDistances.has(d)}
                          onChange={() => toggleDistance(d)}
                          className="rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
                        />
                        {d}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {[...selectedDistances].map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20"
                >
                  {d}
                  <button
                    onClick={() => toggleDistance(d)}
                    className="hover:text-red-600 transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start transition-all">
          <div
            className={`
            ${
              isCalendarMode
                ? panelOpen
                  ? "lg:col-span-5 xl:col-span-4"
                  : "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start"
                : panelOpen
                  ? "lg:col-span-4 xl:col-span-3"
                  : "lg:col-span-12"
            }
          `}
          >
            {isCalendarMode && (
              <div
                className={`${!panelOpen ? "lg:col-span-5 flex lg:justify-center mb-8 lg:mb-0" : "w-full mb-6"}`}
              >
                <ScheduleCalendar
                  selectedRange={selectedRange}
                  onSelect={(range) => {
                    setSelectedRange(range);
                    if (!range?.from) {
                      setSelectedStatuses(new Set());
                    }
                    if (range?.from) {
                      setViewMonth(range.from);
                    }
                  }}
                  defaultMonth={viewMonth}
                  onMonthChange={setViewMonth}
                  raceDays={raceDays}
                  highlightClass="font-black text-primary bg-primary/10 border border-primary/20 rounded-md"
                />
              </div>
            )}

            <div
              className={`${isCalendarMode && !panelOpen ? "lg:col-span-7" : "w-full"} space-y-4`}
            >
              {!effectiveRaces.length && (racesLoading || upcomingLoading) ? (
                <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Loading races...
                  </p>
                </div>
              ) : isCalendarMode ? (
                <div className="h-140 rounded-2xl border border-border bg-card shadow-sm overflow-y-auto flex flex-col">
                  <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                      {dateRangeStr
                        ? typeof dateRangeStr === "string"
                          ? fmtShort(dateRangeStr)
                          : `${fmtShort(dateRangeStr.from)} – ${fmtShort(dateRangeStr.to)}`
                        : "All Races"}
                    </span>
                  </div>
                  <div className="divide-y divide-border flex-1">
                    {calendarFilteredRaces.length > 0 ? (
                      calendarFilteredRaces.map((race) => (
                        <RaceRow
                          key={race.id}
                          race={race}
                          selected={raceId === race.id}
                          onClick={() => handleSelectRace(race.id)}
                          showPredictBadge={isSpectator}
                          canEnter={
                            isOwner &&
                            race.isOpenForPrediction &&
                            approvedTournamentIds.has(race.tournamentId)
                          }
                        />
                      ))
                    ) : (
                      <div className="p-12 text-center text-sm text-muted-foreground font-medium">
                        {dateRangeStr
                          ? "No races found in this date range."
                          : "No upcoming races found."}
                      </div>
                    )}
                  </div>
                </div>
              ) : grouped.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col">
                  <div className="divide-y divide-border">
                    {filteredRaces.map((race) => (
                      <RaceRow
                        key={race.id}
                        race={race}
                        selected={raceId === race.id}
                        onClick={() => handleSelectRace(race.id)}
                        showPredictBadge={isSpectator}
                        canEnter={
                          isOwner &&
                          race.isOpenForPrediction &&
                          approvedTournamentIds.has(race.tournamentId)
                        }
                      />
                    ))}
                  </div>
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

          {panelOpen && (
            <div
              className={`${isCalendarMode ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-8 xl:col-span-9"}`}
            >
              {detailLoading ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Loading race details...
                  </p>
                </div>
              ) : detailError ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-lg">
                  <p className="text-sm font-semibold text-destructive">
                    {detailError}
                  </p>
                </div>
              ) : raceDetail ? (
                <ScheduleDetailFrame
                  title={
                    <h2 className="text-3xl font-black font-headline tracking-tight leading-tight text-white">
                      {raceDetail.name}
                    </h2>
                  }
                  subtitle={
                    <div className="mt-3 space-y-3">
                      {tournamentName && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 truncate">
                          {tournamentName}
                        </p>
                      )}
                      <div className="flex flex-wrap w-full items-center gap-2 font-semibold text-xs text-white">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDateTime(raceDetail.scheduledAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                          <Flag className="h-3.5 w-3.5" />
                          {raceDetail.course?.name || "Venue"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                          <Hash className="h-3.5 w-3.5" />
                          {raceDetail.raceNumber != null
                            ? `Race #${raceDetail.raceNumber}`
                            : "Race TBC"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                          <Trophy className="h-3.5 w-3.5" />
                          {raceDetail.course?.distanceMeters
                            ? `${raceDetail.course.distanceMeters}m`
                            : raceDetail.distanceMeters
                              ? `${raceDetail.distanceMeters}m`
                              : "Distance TBC"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold capitalize">
                          {raceDetail.course?.surfaceType || "Standard"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
                          <Layers className="h-3.5 w-3.5" />
                          {raceDetail.laneCount
                            ? `${raceDetail.laneCount} Lanes`
                            : "Lanes TBC"}
                        </span>
                        <button
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-bold ${getRaceStatusDetailStyle(raceDetail.status)}`}
                        >
                          {raceDetail.status === "ongoing" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" />
                          )}
                          {raceDetail.status === "ongoing"
                            ? formatTime(elapsedSeconds)
                            : formatStatus(raceDetail.status)}
                        </button>
                        {raceDetail.status === "ongoing" && (
                          <>
                            <button
                              onClick={() => {
                                navigate(`/races/${raceDetail.id}/live`);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border bg-rose-500/20 border-rose-400/50 text-rose-200 px-3 py-1.5 font-bold hover:bg-red-600/50"
                            >
                              Watch Live
                            </button>
                          </>
                        )}
                        {user?.role === "admin" && (
                          <button
                            onClick={() =>
                              navigate(`/races/${raceDetail.id}/live`)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border bg-emerald-500/20 border-emerald-400/50 text-emerald-200 px-3 py-1.5 font-bold hover:bg-emerald-600/50"
                          >
                            <Play size={12} fill="currentColor" />
                            Simulate
                          </button>
                        )}
                      </div>
                    </div>
                  }
                  headerRight={
                    <>
                      {canEnterRace && (
                        <button
                          onClick={() => setEnterRaceModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#064E3B] text-white font-bold text-[11px] border border-white/30 hover:bg-[#043E2F] hover:shadow-md hover:border-white/50 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Enter Race
                        </button>
                      )}
                      {isSpectator &&
                        (raceDetail?.status === "scheduled" ||
                          raceDetail?.status === "pre_race") && (
                          <button
                            onClick={() => {
                              setModalKey((k) => k + 1);
                              setPredictModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAB308] text-[#064E3B] font-bold text-[11px] hover:bg-[#D9A207] hover:shadow-md transition-all cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5" />
                            {currentPrediction
                              ? "Update Prediction"
                              : "Predict"}
                          </button>
                        )}
                    </>
                  }
                  onClose={handleCloseDetail}
                  containerClass="border-slate-200 bg-white shadow-lg"
                >
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">
                      Race Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Track
                        </span>
                        <span className="text-base font-black font-headline text-[#064E3B] block mt-1 capitalize">
                          {raceDetail.course?.name || "TBC"}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block capitalize">
                          {raceDetail.course?.surfaceType || "Unknown"} surface
                        </span>
                      </div>
                      <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Distance
                        </span>
                        <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                          {raceDetail.course?.distanceMeters
                            ? `${raceDetail.course.distanceMeters}m`
                            : raceDetail.distanceMeters
                              ? `${raceDetail.distanceMeters}m`
                              : "TBC"}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          Track distance
                        </span>
                      </div>
                      <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Race
                        </span>
                        <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                          {raceDetail.raceNumber != null
                            ? `Race #${raceDetail.raceNumber}`
                            : "TBC"}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          {raceDetail.roundName || "Standard"} round
                        </span>
                      </div>
                      <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Location
                        </span>
                        <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                          {raceDetail.course?.city || "TBC"}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          {raceDetail.course?.country || "Unknown"}
                        </span>
                      </div>
                      <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Lanes
                        </span>
                        <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                          {raceDetail.laneCount
                            ? `${raceDetail.laneCount} Lanes`
                            : "TBC"}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block capitalize">
                          Track: {raceDetail.trackCondition || "Standard"}
                        </span>
                      </div>
                      <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Entries
                        </span>
                        <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                          {raceDetail.entries?.length || 0}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          Confirmed horses
                        </span>
                      </div>
                    </div>
                  </div>
                  {currentPrediction && (
                    <div className="bg-amber-50/50 border border-[#EAB308]/20 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            Your Prediction
                          </p>
                          <p className="font-bold text-[#064E3B] text-sm">
                            {currentPrediction.horseName} →{" "}
                            {
                              { 1: "1st", 2: "2nd", 3: "3rd" }[
                                currentPrediction.predictedPosition
                              ]
                            }
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            navigate(ROUTES.SPECTATOR_DASHBOARD, {
                              state: { tab: "predictions" },
                            })
                          }
                          className="text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
                        >
                          View all predictions →
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">
                      Race Entries - Horses & Jockeys
                    </h3>
                    {raceDetail.entries && raceDetail.entries.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-[#064E3B]/10 bg-white shadow-sm">
                        <table className="w-full text-left min-w-[600px] md:min-w-0">
                          <thead className="bg-[#F4F6F5] border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-20 text-center">
                                Lane
                              </th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Horse Name
                              </th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Jockey Name
                              </th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Weight
                              </th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm bg-card">
                            {[...raceDetail.entries]
                              .sort(
                                (a, b) =>
                                  Number(a.laneNumber) - Number(b.laneNumber)
                              )
                              .map((entry: RaceEntry, idx: number) => (
                                <tr
                                  key={entry.id || idx}
                                  className="hover:bg-[#064E3B]/5 transition-colors cursor-default"
                                >
                                  <td className="px-6 py-4.5 text-center">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm text-xs font-black text-slate-800 mx-auto">
                                      {entry.laneNumber}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4.5 font-bold font-headline text-[#064E3B] text-base leading-snug">
                                    <button
                                      onClick={() => {
                                        if (!entry.id) return;
                                        navigate(`/horses/${entry.id}`);
                                      }}
                                      className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]/40 rounded"
                                    >
                                      {entry.name}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4.5 font-medium text-slate-800">
                                    {entry.jockeyName}
                                  </td>
                                  <td className="px-6 py-4.5 text-slate-500">
                                    {entry.weightKg}
                                  </td>
                                  <td className="px-6 py-4.5 font-medium text-slate-800 hidden md:table-cell">
                                    {formatStatus(entry.entryStatus)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 font-medium bg-white">
                        No horse entries available yet.
                      </div>
                    )}
                  </div>
                </ScheduleDetailFrame>
              ) : null}
            </div>
          )}

          <ToastContainer toasts={toasts} />

          {/* Place Prediction Modal */}
          {raceDetail && (
            <EnterRaceModal
              isOpen={enterRaceModalOpen}
              onClose={() => setEnterRaceModalOpen(false)}
              raceName={raceDetail.name}
              laneCount={raceDetail.laneCount ?? 0}
              currentEntryCount={raceDetail.entries?.length ?? 0}
              horseOptions={eligibleHorsesForRace}
              onSubmit={async (horseId) => {
                try {
                  await enterRace(raceDetail.id, horseId);
                  addToast("Horse entered into race successfully!", "success");
                  loadDetail();
                } catch (err: unknown) {
                  const axiosError = err as {
                    response?: { data?: { message?: string } };
                  };
                  addToast(
                    friendlyErrorMessage(axiosError?.response?.data?.message),
                    "error"
                  );
                  throw err;
                }
              }}
            />
          )}
          {raceDetail && (
            <PlacePredictionModal
              key={modalKey}
              raceId={raceDetail.id}
              raceName={raceDetail.name}
              entries={raceDetail.entries || []}
              open={predictModalOpen}
              onClose={() => setPredictModalOpen(false)}
              onSuccess={() => {
                loadDetail();
              }}
              addToast={addToast}
              existingPrediction={currentPrediction}
              onPlaced={(data) => {
                setMyPredictions((prev) => {
                  const next = new Map(prev);
                  next.set(raceDetail.id, data);
                  return next;
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
