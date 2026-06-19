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
  ShieldAlert,
  Users,
  ArrowRight,
} from "lucide-react";
import useTournament from "../hooks/useTournament";
import { ROUTES } from "../router/routes";

function StatFilterCard({
  label,
  value,
  active,
  onClick,
  liveDot,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  liveDot?: boolean;
}) {
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
        className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${
          active ? "text-primary font-black" : "text-muted-foreground"
        }`}
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: "bg-muted text-muted-foreground border-border",
    registration_open: "bg-secondary/10 text-secondary border-secondary/30",
    registration_closed: "bg-muted text-muted-foreground border-border",
    ongoing: "bg-secondary/10 text-secondary border-secondary/30",
    completed: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const labelMap: Record<string, string> = {
    upcoming: "Upcoming",
    registration_open: "Registration Open",
    registration_closed: "Registration Closed",
    ongoing: "Live",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
        styles[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status === "ongoing" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
      )}
      {labelMap[status] ?? status}
    </span>
  );
}

function formatDateOrFallback(value?: string) {
  if (!value) return "Not specified";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "Not specified"
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export default function TournamentsPage() {
  const navigate = useNavigate();

  const {
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    tournaments,
    counts,
    pagination,
    loadingList,
    listError,
    selectedTournament,
    openTournament,
    closeTournament,
    detailTab,
    setDetailTab,
    races,
    racesLoading,
    racesError,
    page,
    setPage,
  } = useTournament();

  // Updated to pass both raceId and date
  const handleGoToRaceDetail = (race: { id: string; date: string }) => {
    console.log("race date is here: ", race.date);
    navigate(ROUTES.RACES, {
      state: {
        raceId: race.id,
        date: race.date,
      },
    });
  };

  const isPanelOpen = selectedTournament !== null;

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
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

        <div className="mb-6 grid grid-cols-4 gap-3">
          <StatFilterCard
            label="Total"
            value={counts.All}
            active={activeFilter === "All"}
            onClick={() => {
              setActiveFilter("All");
              setPage(1);
              closeTournament();
            }}
          />
          <StatFilterCard
            label="Live"
            value={counts.Live}
            active={activeFilter === "ongoing"}
            onClick={() => {
              setActiveFilter("ongoing");
              setPage(1);
              closeTournament();
            }}
            liveDot
          />
          <StatFilterCard
            label="Scheduled"
            value={counts.Scheduled}
            active={
              activeFilter === "upcoming" ||
              activeFilter === "registration_open" ||
              activeFilter === "registration_closed"
            }
            onClick={() => {
              setActiveFilter("upcoming");
              setPage(1);
              closeTournament();
            }}
          />
          <StatFilterCard
            label="Completed"
            value={counts.Completed}
            active={activeFilter === "completed"}
            onClick={() => {
              setActiveFilter("completed");
              setPage(1);
              closeTournament();
            }}
          />
        </div>

        {listError && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {listError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`space-y-3 transition-all duration-300 ${
              isPanelOpen ? "lg:col-span-3" : "lg:col-span-12"
            }`}
          >
            {loadingList ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading tournaments...
              </div>
            ) : (
              tournaments.map((t) => {
                const isSelected = selectedTournament?.id === t.id;
                const isLive = t.status === "ongoing";

                return (
                  <div
                    key={t.id}
                    onClick={() =>
                      isSelected ? closeTournament() : openTournament(t.id)
                    }
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
                            {t.startDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {!loadingList && tournaments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No tournaments found.
                </p>
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {isPanelOpen && selectedTournament && (
            <div className="lg:col-span-9 lg:sticky lg:top-4 bg-card border border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
              <div className="border-b border-primary/20 bg-primary px-6 py-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/70">
                    <CalendarDays className="h-3 w-3" />
                    {selectedTournament.startDate} -{" "}
                    {selectedTournament.endDate}
                  </span>
                  <div className="text-2xl font-black font-headline text-white tracking-tight leading-snug truncate mt-1">
                    {selectedTournament.name}
                  </div>
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    Races, structure and guidelines for{" "}
                    {selectedTournament.location}
                  </p>
                </div>
                <button
                  onClick={closeTournament}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

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

              <div className="p-6 max-h-[550px] overflow-y-auto custom-scrollbar">
                {detailTab === "schedule" && (
                  <div className="space-y-6">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                          Races List
                        </h4>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {races.length} Contests
                        </span>
                      </div>

                      {racesLoading ? (
                        <div className="text-sm text-muted-foreground">
                          Loading races...
                        </div>
                      ) : racesError ? (
                        <div className="text-sm text-destructive">
                          {racesError}
                        </div>
                      ) : races.length > 0 ? (
                        <div className="space-y-2">
                          {races.map((race) => {
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
                                      {race.distance} · {race.surface} ·{" "}
                                      {race.date}
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

                {detailTab === "entry" && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Entry Requirements & Conditions
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                          <Trophy className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Prize Pool
                          </p>
                          <p className="text-base font-black text-primary mt-1">
                            {selectedTournament.prizePool != null
                              ? `$${selectedTournament.prizePool.toLocaleString()}`
                              : "Not announced"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-secondary/15 text-secondary rounded-lg">
                          <CalendarDays className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Nominations Close
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {formatDateOrFallback(
                              selectedTournament.registrationCloseDate
                            )}
                          </p>
                          {selectedTournament.registrationOpenDate && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Opens{" "}
                              {formatDateOrFallback(
                                selectedTournament.registrationOpenDate
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                          <ShieldAlert className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Description
                          </p>
                          <p className="text-sm font-bold text-foreground mt-1 leading-snug">
                            {selectedTournament.description ||
                              "No description provided"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Max Participants
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {selectedTournament.maximumParticipants != null
                              ? selectedTournament.maximumParticipants
                              : "Not specified"}
                          </p>
                          {selectedTournament.minimumParticipants != null && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Min {selectedTournament.minimumParticipants}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedTournament.rules && (
                      <div className="p-4.5 rounded-xl border border-secondary/20 bg-secondary/5 text-xs text-foreground/90 leading-relaxed">
                        <p className="font-bold text-primary mb-1 flex items-center gap-1.5">
                          Rules & Regulations
                        </p>
                        <p className="whitespace-pre-wrap">
                          {selectedTournament.rules}
                        </p>
                      </div>
                    )}
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
