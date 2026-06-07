import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Flag,
  CalendarDays,
  Trophy,
  Flame,
  X,
  Clock,
  CheckCircle2,
  Play,
  CalendarRange,
  Landmark,
  ShieldAlert,
  Users,
  ArrowRight,
} from "lucide-react";
import { useEvent } from "../hooks/useEvent";
import { ROUTES } from "../router/routes.tsx";

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
  {
    id: 1,
    name: "Royal Ascot Summer Series",
    startDate: "2026-06-18",
    endDate: "2026-06-22",
    location: "Ascot, UK",
    races: 7,
    status: "Live",
    prizePool: "£7.5M",
  },
  {
    id: 2,
    name: "The Breeders' Cup World Championships",
    startDate: "2026-11-01",
    endDate: "2026-11-02",
    location: "Del Mar, CA",
    races: 2,
    status: "Scheduled",
    prizePool: "$31M",
  },
  {
    id: 3,
    name: "Dubai World Cup",
    startDate: "2027-03-29",
    endDate: "2027-03-29",
    location: "Meydan, UAE",
    races: 2,
    status: "Scheduled",
    prizePool: "$30.5M",
  },
];

const mockRacesByTournament: Record<string | number, RacePreview[]> = {
  1: [
    {
      id: 101,
      title: "The Queen Anne Stakes",
      time: "14:30",
      distance: "1600m",
      surface: "Turf",
      status: "Completed",
    },
    {
      id: 102,
      title: "Coventry Stakes",
      time: "15:05",
      distance: "1200m",
      surface: "Turf",
      status: "Completed",
    },
    {
      id: 103,
      title: "King's Stand Stakes",
      time: "15:40",
      distance: "1000m",
      surface: "Turf",
      status: "Completed",
    },
    {
      id: 104,
      title: "St James's Palace Stakes",
      time: "16:20",
      distance: "1600m",
      surface: "Turf",
      status: "Live",
    },
    {
      id: 105,
      title: "Ascot Stakes",
      time: "17:00",
      distance: "4000m",
      surface: "Turf",
      status: "Upcoming",
    },
    {
      id: 106,
      title: "Wolferton Stakes",
      time: "17:35",
      distance: "2000m",
      surface: "Turf",
      status: "Upcoming",
    },
    {
      id: 107,
      title: "Copper Horse Stakes",
      time: "18:10",
      distance: "2800m",
      surface: "Turf",
      status: "Upcoming",
    },
  ],
  2: [
    {
      id: 109,
      title: "Classic Turf Invitational",
      time: "16:00",
      distance: "2000m",
      surface: "Turf",
      status: "Upcoming",
    },
    {
      id: 110,
      title: "Night Derby",
      time: "18:30",
      distance: "2400m",
      surface: "Dirt",
      status: "Upcoming",
    },
  ],
  3: [
    {
      id: 201,
      title: "Dubai Golden Shaheen",
      time: "15:30",
      distance: "1200m",
      surface: "Dirt",
      status: "Upcoming",
    },
    {
      id: 202,
      title: "Al Maktoum Classic",
      time: "17:15",
      distance: "1900m",
      surface: "Dirt",
      status: "Upcoming",
    },
  ],
};

const tournamentExtraDetails: Record<string | number, TournamentExtraDetail> = {
  1: {
    rounds: [
      {
        name: "Preliminary Heats",
        date: "June 18-19",
        racesRange: "Races 101 - 103",
      },
      {
        name: "Semifinal Showdowns",
        date: "June 20",
        racesRange: "Races 104 - 105",
      },
      {
        name: "The Grand Finale",
        date: "June 22",
        racesRange: "Races 106 - 107",
      },
    ],
    entryFee: "£2,500 per nomination",
    deadline: "June 12, 2026",
    eligibility: "Class 1 Thoroughbreds, age 3+",
    maxField: "16 Runners per Heat",
  },
  2: {
    rounds: [
      { name: "Championship Heats", date: "Nov 01", racesRange: "Race 109" },
      { name: "World Cup Finals", date: "Nov 02", racesRange: "Race 110" },
    ],
    entryFee: "$10,000 per nomination",
    deadline: "Oct 25, 2026",
    eligibility: "International Invited Graded Stakes horses",
    maxField: "14 Runners",
  },
  3: {
    rounds: [
      {
        name: "Qualifying Stakes",
        date: "Mar 29 (Morning)",
        racesRange: "Race 201",
      },
      {
        name: "Dubai World Cup Final",
        date: "Mar 29 (Evening)",
        racesRange: "Race 202",
      },
    ],
    entryFee: "$7,500 per nomination",
    deadline: "Mar 20, 2027",
    eligibility: "Horses with an official international rating of 110+",
    maxField: "12 Runners",
  },
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
    const same =
      new Date(start).toDateString() === new Date(end).toDateString();
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
      className={`flex-1 text-left rounded-xl border py-1.5 px-3 transition-all ${
        active
          ? "border-primary bg-card shadow-sm ring-1 ring-primary"
          : "border-border bg-card hover:border-slate-300 hover:bg-slate-50/50"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${active ? "text-primary font-black" : "text-muted-foreground"}`}
      >
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <p className="text-lg font-black leading-none text-foreground">
          {value}
        </p>
        {liveDot && value > 0 && (
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
        )}
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: TournamentStatus }) {
  const styles: Record<TournamentStatus, string> = {
    Live: "bg-secondary/10 text-secondary border-secondary/30",
    Scheduled: "bg-muted text-muted-foreground border-border",
    Completed: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${styles[status]}`}
    >
      {status === "Live" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
      )}
      {status}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentsPage() {
  const { eventList } = useEvent();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("schedule");

  const tournaments: Tournament[] = useMemo(() => {
    if (!eventList || eventList.length === 0) return defaultTournaments;
    return eventList.map((event, index) => {
      let status: TournamentStatus = "Scheduled";
      if (
        event.className?.includes("yellow") ||
        event.title.includes("Thunder")
      )
        status = "Live";
      if (
        event.className?.includes("green") ||
        event.title.includes("Qualifier")
      )
        status = "Completed";

      const startDateObj =
        event.start || event.date
          ? new Date(event.start || event.date!)
          : new Date();
      const endDateObj = event.end ? new Date(event.end) : startDateObj;
      const tId = event.id || index + 1;
      const matchedRacesCount =
        mockRacesByTournament[tId]?.length ?? (event.overlap ? 14 : 35);

      return {
        id: tId,
        name: event.title,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        location:
          ["Ascot, UK", "Churchill Downs, KY", "Meydan, UAE"][index % 3] ||
          "TBD",
        races: matchedRacesCount,
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

  const activeRaces = useMemo(() => {
    if (!selectedTournament) return [];
    return mockRacesByTournament[selectedTournament.id] ?? [];
  }, [selectedTournament]);

  const activeExtraDetail = useMemo(() => {
    if (!selectedTournament) return null;
    return (
      tournamentExtraDetails[selectedTournament.id] ?? {
        rounds: [
          { name: "First Stage", date: "Day 1", racesRange: "Qualifying list" },
          { name: "Final Stage", date: "Day 2", racesRange: "Final Run" },
        ],
        entryFee: "$2,000 nomination",
        deadline: "1 week prior to start",
        eligibility: "Open to Class 1-2 standard ratings",
        maxField: "14 Runners",
      }
    );
  }, [selectedTournament]);

  const handleSelectTournament = (t: Tournament) => {
    setSelectedTournament((prev) => (prev?.id === t.id ? null : t));
    setDetailTab("schedule");
  };

  const handleGoToRaceDetail = (race: RacePreview) => {
    let targetDate = "2026-06-18";
    if (race.id === 109) targetDate = "2026-11-01";
    if (race.id === 110) targetDate = "2026-11-02";
    if (race.id >= 201) targetDate = "2027-03-29";

    navigate(ROUTES.RACES, {
      state: {
        raceId: race.id,
        date: targetDate,
      },
    });
  };

  const isPanelOpen = selectedTournament !== null;

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-black font-headline text-primary tracking-tight leading-none">
              Tournament Hub
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Explore active competitions and inspect race lists in-place.
            </p>
          </div>

          <div className="relative w-full sm:w-72 md:w-80 shadow-sm rounded-xl border border-border bg-card">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full h-11 rounded-xl bg-transparent pl-11 pr-4 text-xs font-medium outline-none transition focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Interactive Stats Filters */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          <StatFilterCard
            label="Total"
            value={counts.All}
            active={activeFilter === "All"}
            onClick={() => {
              setActiveFilter("All");
              setSelectedTournament(null);
            }}
          />
          <StatFilterCard
            label="Live"
            value={counts.Live}
            active={activeFilter === "Live"}
            onClick={() => {
              setActiveFilter("Live");
              setSelectedTournament(null);
            }}
            liveDot
          />
          <StatFilterCard
            label="Scheduled"
            value={counts.Scheduled}
            active={activeFilter === "Scheduled"}
            onClick={() => {
              setActiveFilter("Scheduled");
              setSelectedTournament(null);
            }}
          />
          <StatFilterCard
            label="Completed"
            value={counts.Completed}
            active={activeFilter === "Completed"}
            onClick={() => {
              setActiveFilter("Completed");
              setSelectedTournament(null);
            }}
          />
        </div>

        {/* Main Columns Container (3/4 - 1/4 layout ratio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tournaments List (Takes 1/4 column space when details open) */}
          <div
            className={`space-y-3 transition-all duration-300 ${isPanelOpen ? "lg:col-span-3" : "lg:col-span-12"}`}
          >
            {filtered.map((t) => {
              const isSelected = selectedTournament?.id === t.id;
              const isLive = t.status === "Live";

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTournament(t)}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border bg-card transition-all duration-150 ${
                    isSelected
                      ? "border-primary ring-1 ring-primary bg-primary/5"
                      : isLive
                        ? "border-secondary/50 hover:border-secondary hover:shadow-md"
                        : "border-border hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="p-4 flex gap-3.5 items-start">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                        isLive
                          ? "bg-secondary/10 text-secondary border-secondary/25"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      {isLive ? (
                        <Flame className="h-4.5 w-4.5" />
                      ) : (
                        <Trophy className="h-4.5 w-4.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-black font-headline text-primary tracking-tight leading-tight truncate">
                          {t.name}
                        </h3>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground/80" />
                          {t.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flag className="h-3 w-3 text-muted-foreground/80" />
                          {t.races} races
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No tournaments found.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Inline Tournament Detail Panel (Takes up 3/4 column space) */}
          {isPanelOpen && selectedTournament && (
            <div className="lg:col-span-9 lg:sticky lg:top-4 bg-card border border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
              {/* Panel Header */}
              <div className="border-b border-border bg-background px-6 py-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {formatRange(
                      selectedTournament.startDate,
                      selectedTournament.endDate
                    )}
                  </span>
                  <h2 className="text-2xl font-black font-headline text-primary tracking-tight leading-snug truncate mt-1">
                    {selectedTournament.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Races, structure and guidelines for{" "}
                    {selectedTournament.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex border-b border-border px-6 bg-background">
                <button
                  onClick={() => setDetailTab("schedule")}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                    detailTab === "schedule"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Races & Rounds
                </button>
                <button
                  onClick={() => setDetailTab("entry")}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                    detailTab === "entry"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entry Info & Rules
                </button>
              </div>

              {/* Tab Panel Contents */}
              <div className="p-6 max-h-[550px] overflow-y-auto custom-scrollbar">
                {/* ─── TAB: SCHEDULE & ROUND BREAKDOWNS ─── */}
                {detailTab === "schedule" && (
                  <div className="space-y-6">
                    {/* Round Breakdown */}
                    {activeExtraDetail &&
                      activeExtraDetail.rounds.length > 0 && (
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <CalendarRange className="h-3.5 w-3.5 text-muted-foreground/80" />
                            Round Breakdown
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            {activeExtraDetail.rounds.map((round, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl border border-border bg-background flex flex-col justify-between min-h-[110px]"
                              >
                                <div>
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tight">
                                    Phase {idx + 1}
                                  </p>
                                  <p className="text-sm font-black font-headline text-primary mt-0.5 leading-tight">
                                    {round.name}
                                  </p>
                                </div>
                                <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                  <span>{round.date}</span>
                                  <span className="font-mono text-[9px] bg-card border px-1.5 py-0.5 rounded text-primary">
                                    {round.racesRange}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Schedule List */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                          Races List
                        </h4>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
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
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                                  isRaceLive
                                    ? "bg-secondary/10 border-secondary/25"
                                    : isCompleted
                                      ? "bg-muted/30 border-border"
                                      : "bg-card border-border"
                                }`}
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div className="text-center shrink-0 min-w-[40px]">
                                    <span className="block font-mono text-sm font-black text-primary leading-none">
                                      {race.time}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground uppercase font-semibold mt-1 block">
                                      Start
                                    </span>
                                  </div>

                                  <div className="border-l border-border pl-4.5 min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground truncate leading-tight">
                                      {race.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      {race.distance} · {race.surface}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 pl-3">
                                  {isRaceLive ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 border border-secondary/20 px-2.5 py-0.5 text-[9px] font-bold text-secondary-foreground">
                                      <Play className="h-2 w-2 text-secondary fill-secondary animate-pulse" />
                                      Live
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                                      <CheckCircle2 className="h-2.5 w-2.5 text-muted-foreground" />
                                      Ended
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[9px] font-bold text-primary">
                                      <Clock className="h-2.5 w-2.5 text-primary" />
                                      Upcoming
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleGoToRaceDetail(race)}
                                    className="text-[10px] font-black uppercase tracking-wider bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:bg-primary/95 active:scale-95 transition-all inline-flex items-center gap-1 shrink-0"
                                  >
                                    Race Detail
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-xs text-muted-foreground font-medium">
                          No active races listed for this tournament.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB: ENTRY INFO & RULES ─── */}
                {detailTab === "entry" && activeExtraDetail && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Entry Requirements & Conditions
                    </h4>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Entry Fee card */}
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                          <Landmark className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Nomination Fee
                          </p>
                          <p className="text-base font-black text-primary mt-1">
                            {activeExtraDetail.entryFee}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Non-refundable registration dues.
                          </p>
                        </div>
                      </div>

                      {/* Entry Deadline */}
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-secondary/15 text-secondary rounded-lg">
                          <CalendarDays className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Nominations Close
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {activeExtraDetail.deadline}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Late entries will not be registered.
                          </p>
                        </div>
                      </div>

                      {/* Horse Eligibility */}
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Eligibility Criteria
                          </p>
                          <p className="text-sm font-bold text-foreground mt-1 leading-snug">
                            {activeExtraDetail.eligibility}
                          </p>
                        </div>
                      </div>

                      {/* Field Size Restrictions */}
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Max Field Size
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {activeExtraDetail.maxField}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Cap on maximum active runners.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Standard Terms Notice */}
                    <div className="p-4.5 rounded-xl border border-secondary/20 bg-secondary/5 text-xs text-foreground/90 leading-relaxed">
                      <p className="font-bold text-primary mb-1 flex items-center gap-1.5">
                        Tournament Notice & Regulations
                      </p>
                      All participating horses must pass pre-race veterinary
                      evaluations on the morning of the competition. Jockeys
                      must be licensed and weigh-in at least 45 minutes prior to
                      post-time.
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
