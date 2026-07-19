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
  Layers,
  Trophy,
  Target,
  Send,
  Play,
  Award,
} from "lucide-react";
import { ROUTES } from "../router/routes";

import { useEvent } from "../hooks/useEvent";
import { useRaces, useRaceDetail } from "../hooks/useRaces";
import type { RaceListItem, RaceApiStatus, RaceEntry } from "../types/race";
import type { DateRange } from "react-day-picker";
import { useToast } from "../hooks/useToast";
import { useOwner } from "../hooks/useOwner";
import { formatStatus, formatRaceCountdown } from "../utils/formatters";
import {
  StatusBadge,
  RACE_STATUS_STYLES,
  RACE_STATUS_DETAIL_STYLES,
} from "../components/ui/StatusBadge";
import { ToastContainer } from "../components/ui/toast";
import { friendlyErrorMessage } from "../utils/errorMessages";
import { cn } from "../lib/utils";

import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar";
import { ScheduleDetailFrame } from "../components/schedule/ScheduleDetailFrame";
import { PredictionService } from "../services/PredictionService";
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

  const yyyy = scheduled.getFullYear();
  const mm = String(scheduled.getMonth() + 1).padStart(2, "0");
  const dd = String(scheduled.getDate()).padStart(2, "0");
  const hh = String(scheduled.getHours()).padStart(2, "0");
  const min = String(scheduled.getMinutes()).padStart(2, "0");

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
    date: `${dd}/${mm}/${yyyy}`,
    time: `${hh}:${min}`,
    distance,
    surface,
    className: "Standard",
    status: race.status,
    isOpenForPrediction:
      race.status === "scheduled" || race.status === "pre_race",
  };
};

const fmtShort = (d: string) => new Date(d).toLocaleDateString("en-GB");

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "TBC";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
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
          <StatusBadge
            status={race.status}
            styleMap={RACE_STATUS_STYLES}
            label="Live"
            size="sm"
            showDot
            className="rounded gap-1 font-bold"
          />
        ) : (
          <StatusBadge
            status={race.status}
            styleMap={RACE_STATUS_STYLES}
            label={formatStatus(race.status)}
            size="sm"
            className="rounded gap-1 font-bold"
          />
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
      const raw = localStorage.getItem("user");
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
  const [preselectedEntry, setPreselectedEntry] = useState<{
    id: string;
    name: string;
    jockeyName: string;
    laneNumber: string;
  } | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const { toasts, addToast } = useToast();

  const [myPredictions, setMyPredictions] = useState<
    Map<
      string,
      { entryId: string; horseName: string; predictedPosition: number }
    >
  >(new Map());

  useEffect(() => {
    if (!isSpectator) return;
    PredictionService.getMyPredictions({})
      .then((res) => {
        const map = new Map<
          string,
          { entryId: string; horseName: string; predictedPosition: number }
        >();
        for (const p of res.data) {
          map.set(p.race.id, {
            entryId: p.predictedEntry.entryId,
            horseName: p.predictedEntry.horseName,
            predictedPosition: p.predictedPosition,
          });
        }
        setMyPredictions(map);
      })
      .catch(() => {});
  }, [isSpectator]);

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

  const [prevRaceId, setPrevRaceId] = useState<string | null>(null);
  const [secondsUntilStart, setSecondsUntilStart] = useState<number | null>(
    null
  );
  const [userToggleOverride, setUserToggleOverride] = useState<boolean | null>(
    null
  );

  if (raceDetail && raceDetail.id !== prevRaceId) {
    setPrevRaceId(raceDetail.id);
    setUserToggleOverride(null);
    setSecondsUntilStart(null);
  }

  useEffect(() => {
    if (!raceDetail?.scheduledAt) return;
    const targetStatus = raceDetail.status;
    if (targetStatus !== "scheduled" && targetStatus !== "pre_race") return;

    const tick = () => {
      const diffMs = new Date(raceDetail.scheduledAt).getTime() - Date.now();
      const diffSec = Math.floor(diffMs / 1000);
      setSecondsUntilStart(diffSec);
    };

    const timeoutId = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [raceDetail?.id, raceDetail?.status, raceDetail?.scheduledAt]);

  const isCountdownEligible =
    raceDetail?.status === "scheduled" || raceDetail?.status === "pre_race";

  const isAutoCountdown =
    isCountdownEligible &&
    secondsUntilStart !== null &&
    secondsUntilStart <= 1800 &&
    secondsUntilStart >= -600;

  const isNearStart =
    isCountdownEligible &&
    (userToggleOverride !== null ? userToggleOverride : isAutoCountdown);

  const currentPrediction = raceDetail
    ? myPredictions.get(raceDetail.id)
    : undefined;
  const predictedEntryIds = currentPrediction
    ? [currentPrediction.entryId]
    : [];

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
    return Array.from(map.entries()).sort(
      ([, racesA], [, racesB]) =>
        new Date(racesA[0].scheduledAt).getTime() -
        new Date(racesB[0].scheduledAt).getTime()
    );
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
    if (!selectedRange?.from) return nextFiveRaces;
    const from = new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    const to = selectedRange.to
      ? new Date(selectedRange.to)
      : new Date(selectedRange.from);
    to.setHours(23, 59, 59, 999);
    return filteredRaces.filter((r) => {
      const d = new Date(r.scheduledAt);
      return d >= from && d <= to;
    });
  }, [filteredRaces, selectedRange, nextFiveRaces]);

  const calendarRaces = useMemo(() => {
    const source =
      selectedRange?.from && selectedRange?.to ? rangeRaces : apiRaces;
    return source.map(mapRaceToUi);
  }, [selectedRange?.from, selectedRange?.to, rangeRaces, apiRaces]);

  const raceDays = useMemo(() => {
    return calendarRaces.map((r) => {
      const d = new Date(r.scheduledAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });
  }, [calendarRaces]);

  const racesInRange = useMemo(() => {
    if (!isCalendarMode || !selectedRange?.from) return allRaces;
    const from = new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    const to = selectedRange.to
      ? new Date(selectedRange.to)
      : new Date(selectedRange.from);
    to.setHours(23, 59, 59, 999);
    return allRaces.filter((r) => {
      const d = new Date(r.scheduledAt);
      return d >= from && d <= to;
    });
  }, [allRaces, selectedRange, isCalendarMode]);

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
  const user = JSON.parse(localStorage.getItem("user") ?? "null");

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
                <div className="h-full h-msx-140 rounded-2xl border border-border bg-card shadow-sm overflow-y-auto flex flex-col">
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
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl font-black font-headline tracking-tight leading-tight text-white">
                        {raceDetail.name}
                      </h2>
                      <StatusBadge
                        status={raceDetail.status}
                        styleMap={RACE_STATUS_DETAIL_STYLES}
                        label={
                          raceDetail.status === "ongoing"
                            ? formatTime(elapsedSeconds)
                            : formatStatus(raceDetail.status)
                        }
                        showDot={raceDetail.status === "ongoing"}
                        dotClassName="bg-rose-300"
                        className="rounded-lg px-2.5 py-1 font-bold gap-1.5 text-[11px]"
                      />
                      {raceDetail.status === "ongoing" && (
                        <button
                          onClick={() =>
                            navigate(`/races/${raceDetail.id}/live`)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-500/20 text-rose-200 px-2.5 py-1 font-bold hover:bg-red-600/50 text-[11px] transition-all"
                        >
                          Watch Live
                        </button>
                      )}
                    </div>
                  }
                  subtitle={null}
                  bannerSlot={
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                      {/* Time card */}
                      <button
                        title={
                          isCountdownEligible
                            ? isNearStart
                              ? "Click to view scheduled start date"
                              : "Click to view countdown timer"
                            : undefined
                        }
                        onClick={
                          isCountdownEligible
                            ? (e) => {
                                e.stopPropagation();
                                setUserToggleOverride(!isNearStart);
                              }
                            : undefined
                        }
                        className={cn(
                          "p-3.5 text-left rounded-xl border transition-all flex flex-col justify-between w-full min-h-[82px] outline-none select-none",
                          isCountdownEligible
                            ? "cursor-pointer focus:ring-1 focus:ring-white/30"
                            : "cursor-default",
                          isNearStart
                            ? "bg-amber-500 border-amber-400 hover:bg-amber-400 hover:border-amber-300 shadow-sm"
                            : "bg-white/15 border-white/25 hover:bg-white/25 hover:border-white/35"
                        )}
                      >
                        {isNearStart ? (
                          <>
                            <div>
                              <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#064E3B]/80 uppercase tracking-wider">
                                <Clock className="h-3.5 w-3.5 text-[#064E3B] animate-pulse" />
                                Starts In
                              </span>
                              <span className="text-base font-bold font-mono text-[#064E3B] tracking-normal block mt-1">
                                {secondsUntilStart !== null
                                  ? formatRaceCountdown(secondsUntilStart)
                                  : ""}
                              </span>
                            </div>
                            <span className="text-[9px] text-[#064E3B]/70 block leading-normal mt-0.5">
                              {isAutoCountdown
                                ? "Countdown auto-enabled"
                                : "Click to view start date"}
                            </span>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="flex items-center gap-1.5 text-[9px] font-bold text-white/70 uppercase tracking-wider">
                                <Clock className="h-3.5 w-3.5 text-white/60" />
                                Start Time
                              </span>
                              <span className="text-sm font-black font-headline text-white block mt-1">
                                {formatDateTime(raceDetail.scheduledAt)}
                              </span>
                            </div>
                            <span className="text-[9px] text-white/50 block leading-normal mt-0.5">
                              Click to view countdown
                            </span>
                          </>
                        )}
                      </button>

                      {/* Track Card */}
                      <button
                        title={
                          raceDetail?.course?.id
                            ? "Click to view track details"
                            : "Track details unavailable"
                        }
                        onClick={() => {
                          if (raceDetail?.course?.id) {
                            navigate(`/tracks/${raceDetail.course.id}`);
                          }
                        }}
                        disabled={!raceDetail?.course?.id}
                        className={cn(
                          "p-3.5 text-left rounded-xl border transition-all flex flex-col justify-between w-full min-h-[82px] select-none outline-none focus:ring-1 focus:ring-white/30",
                          raceDetail?.course?.id
                            ? "cursor-pointer bg-white/15 border-white/25 hover:bg-white/25 hover:border-white/35 active:scale-[0.98]"
                            : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                            <Flag className="h-4 w-4 text-white/60" />
                            Track
                          </span>
                          <span className="text-sm font-black font-headline text-white block mt-1 capitalize truncate">
                            {raceDetail.course?.name || "TBC"}
                          </span>
                        </div>
                        <span className="text-xs text-white/70 mt-1 block capitalize leading-normal">
                          {raceDetail.course?.surfaceType || "Unknown"} surface
                        </span>
                      </button>

                      {/* Distance Card */}
                      <div className="p-3.5 bg-white/15 border border-white/25 hover:bg-white/25 hover:border-white/35 rounded-xl flex flex-col justify-between min-h-[82px]">
                        <div>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                            <Trophy className="h-4 w-4 text-white/60" />
                            Distance
                          </span>
                          <span className="text-sm font-black font-headline text-white block mt-1">
                            {raceDetail.course?.distanceMeters
                              ? `${raceDetail.course.distanceMeters}m`
                              : raceDetail.distanceMeters
                                ? `${raceDetail.distanceMeters}m`
                                : "TBC"}
                          </span>
                        </div>
                        <span className="text-xs text-white/70 mt-1 block leading-normal">
                          Track distance
                        </span>
                      </div>

                      {/* Tournament Card */}
                      <button
                        title={
                          raceDetail?.tournamentId
                            ? "Click to view tournament details"
                            : "Tournament details unavailable"
                        }
                        onClick={() => {
                          if (raceDetail?.tournamentId) {
                            navigate(`/tournaments/${raceDetail.tournamentId}`);
                          }
                        }}
                        disabled={!raceDetail?.tournamentId}
                        className={cn(
                          "p-3.5 text-left rounded-xl border transition-all flex flex-col justify-between w-full min-h-[82px] select-none outline-none focus:ring-1 focus:ring-white/30",
                          raceDetail?.tournamentId
                            ? "cursor-pointer bg-white/15 border-white/25 hover:bg-white/25 hover:border-white/35 active:scale-[0.98]"
                            : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                            <Award className="h-4 w-4 text-white/60" />
                            Tournament
                          </span>
                          <span
                            className="text-sm font-black font-headline text-white block mt-1 truncate text-left w-full"
                            title={tournamentName || "Single Race"}
                          >
                            {tournamentName || "Single Race"}
                          </span>
                        </div>
                        <span className="text-xs text-white/70 mt-1 block leading-normal truncate text-left w-full">
                          {tournamentName
                            ? "Tournament event"
                            : "Non-tournament race"}
                        </span>
                      </button>

                      {/* Lanes Card */}
                      <div className="p-3.5 bg-white/15 border border-white/25 hover:bg-white/25 hover:border-white/35 rounded-xl flex flex-col justify-between min-h-[82px]">
                        <div>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                            <Layers className="h-4 w-4 text-white/60" />
                            Lanes
                          </span>
                          <span className="text-sm font-black font-headline text-white block mt-1">
                            {raceDetail.laneCount
                              ? `${raceDetail.laneCount} Lanes`
                              : "TBC"}
                          </span>
                        </div>
                        <span className="text-xs text-white/70 mt-1 block capitalize leading-normal">
                          Track: {raceDetail.trackCondition || "Standard"}
                        </span>
                      </div>

                      {/* Entries Card */}
                      <div className="p-3.5 bg-white/15 border border-white/25 hover:bg-white/25 hover:border-white/35 rounded-xl flex flex-col justify-between min-h-[82px]">
                        <div>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                            <Send className="h-4 w-4 text-white/60" />
                            Entries
                          </span>
                          <span className="text-sm font-black font-headline text-white block mt-1">
                            {raceDetail.entries?.length || 0}
                          </span>
                        </div>
                        <span className="text-xs text-white/70 mt-1 block leading-normal">
                          Confirmed horses
                        </span>
                      </div>
                    </div>
                  }
                  headerRight={
                    <>
                      {canEnterRace && (
                        <button
                          onClick={() => setEnterRaceModalOpen(true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#064E3B] text-white font-bold text-[10px] border border-white/20 hover:bg-[#043E2F] transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <Send className="w-3 h-3" />
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
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EAB308] text-[#064E3B] font-bold text-[10px] hover:bg-[#D9A207] transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            <Target className="w-3 h-3" />
                            {currentPrediction
                              ? "Update Prediction"
                              : "Predict"}
                          </button>
                        )}
                      {user?.role === "admin" && (
                        <button
                          onClick={() =>
                            navigate(`/races/${raceDetail.id}/live`)
                          }
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] border border-white/20 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <Play size={10} fill="currentColor" />
                          Simulate
                        </button>
                      )}
                    </>
                  }
                  onClose={handleCloseDetail}
                  containerClass="border-slate-200 bg-white shadow-lg"
                >
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
                              {isSpectator &&
                                !currentPrediction &&
                                (raceDetail?.status === "scheduled" ||
                                  raceDetail?.status === "pre_race") && (
                                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 text-center">
                                    Action
                                  </th>
                                )}
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
                                  {isSpectator &&
                                    (raceDetail?.status === "scheduled" ||
                                      raceDetail?.status === "pre_race") && (
                                      <td className="px-6 py-4.5 text-center">
                                        {entry.entryStatus === "confirmed" &&
                                        !currentPrediction ? (
                                          <button
                                            onClick={() => {
                                              setPreselectedEntry({
                                                id: entry.id,
                                                name: entry.name,
                                                jockeyName: entry.jockeyName,
                                                laneNumber: entry.laneNumber,
                                              });
                                              setPredictModalOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAB308] text-[#064E3B] font-bold text-[10px] hover:bg-[#D9A207] hover:shadow-sm transition-all cursor-pointer"
                                          >
                                            <Target className="w-3 h-3" />
                                            Predict
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-slate-300 font-medium">
                                            —
                                          </span>
                                        )}
                                      </td>
                                    )}
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
              onClose={() => {
                setPredictModalOpen(false);
                setPreselectedEntry(null);
              }}
              onSuccess={() => {
                loadDetail();
              }}
              addToast={addToast}
              onPlaced={(data) => {
                setMyPredictions((prev) => {
                  const next = new Map(prev);
                  next.set(raceDetail.id, data);
                  return next;
                });
                setPreselectedEntry(null);
              }}
              preselectedEntry={preselectedEntry}
              predictedEntryIds={predictedEntryIds}
            />
          )}
        </div>
      </div>
    </div>
  );
}
