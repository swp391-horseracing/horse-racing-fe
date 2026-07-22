import { useMemo, useState, useEffect, startTransition } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  CalendarDays,
  Trophy,
  X,
  ShieldAlert,
  Flag,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { formatTournamentStatus } from "../../styles/schema/tournamentStatusFlow";
import { StatusBadge, TOURNAMENT_STATUS_STYLES } from "../ui/StatusBadge";
import type {
  Tournament,
  TournamentRegistrationResponse,
  RaceItem,
} from "../../types/tournament";
import type { Horse } from "../../types/horse";
import type { Entry } from "../../types/entry";
import { TournamentService } from "../../services/TournamentService";
import { HorseStatusIndicator } from "./HorseStatusIndicator";
import { formatAge, formatPrizePool } from "../../utils/formatters";

export interface TournamentRegisterProps {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistrationResponse[];
  onOpenRegisterModal: (
    horseId: string | null,
    tournamentId: number | null
  ) => void;
  onEnterRace: (
    raceId: string,
    raceName: string,
    laneCount: number,
    tournamentId: string
  ) => void;
  onAssignJockey: (entryId: string) => void;
  entries: Entry[];
}

type ActiveFilterType = "All" | "On going" | "Registration open" | "Completed";

function formatDate(value?: string) {
  if (!value) return "Not specified";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not specified";
  return d.toLocaleDateString("en-GB");
}

function formatDateFull(value?: string) {
  if (!value) return "Not specified";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not specified";
  return d.toLocaleDateString("en-GB");
}

function TournamentStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge
      status={status}
      styleMap={TOURNAMENT_STATUS_STYLES}
      label={formatTournamentStatus(status)}
      showDot={status === "live_now" || status === "ongoing"}
      size="md"
      className="uppercase"
    />
  );
}

function StatFilterCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 text-left rounded-xl border py-1.5 px-3 transition-all",
        active
          ? "border-primary bg-card shadow-sm ring-1 ring-primary"
          : "border-border bg-card hover:border-slate-300 hover:bg-slate-50/50"
      )}
    >
      <p
        className={cn(
          "text-[9px] font-bold uppercase tracking-wider mb-0.5",
          active ? "text-primary font-black" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p className="text-lg font-black leading-none text-foreground">{value}</p>
    </button>
  );
}

type RegistrationGroup = {
  tournament: Tournament;
  items: TournamentRegistrationResponse[];
};

export function TournamentRegister({
  registrations,
  onEnterRace,
  onAssignJockey,
  entries,
}: TournamentRegisterProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilterType>("All");
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);

  const grouped = useMemo(() => {
    const map = new Map<string, RegistrationGroup>();
    registrations.forEach((r) => {
      const existing = map.get(r.tournament.id);
      if (existing) {
        existing.items.push(r);
      } else {
        map.set(r.tournament.id, {
          tournament: r.tournament,
          items: [r],
        });
      }
    });
    return Array.from(map.values());
  }, [registrations]);

  const filteredGroups = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return grouped.filter((g) => {
      const matchesSearch =
        !keyword ||
        g.tournament.name.toLowerCase().includes(keyword) ||
        g.items.some(
          (r) =>
            r.horse.name.toLowerCase().includes(keyword) ||
            r.horse.breed.toLowerCase().includes(keyword)
        ) ||
        g.tournament.location.toLowerCase().includes(keyword);

      const statusFilterMap: Record<string, string> = {
        All: "All",
        "On going": "ongoing",
        "Registration open": "registration_open",
        Completed: "completed",
      };

      const matchesFilter =
        activeFilter === "All" ||
        g.tournament.status === statusFilterMap[activeFilter];

      return matchesSearch && matchesFilter;
    });
  }, [grouped, search, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: grouped.length,
      ongoing: grouped.filter((g) => g.tournament.status === "ongoing").length,
      open: grouped.filter((g) => g.tournament.status === "registration_open")
        .length,
      completed: grouped.filter((g) => g.tournament.status === "completed")
        .length,
    };
  }, [grouped]);

  const selectedGroup = useMemo(
    () =>
      filteredGroups.find((g) => g.tournament.id === selectedTournamentId) ??
      null,
    [filteredGroups, selectedTournamentId]
  );

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "races" ? "races" : "details";
  const [detailTab, setDetailTab] = useState<"details" | "races">(defaultTab);

  const [tournamentDetail, setTournamentDetail] = useState<Tournament | null>(
    null
  );

  useEffect(() => {
    if (!selectedGroup) return;
    startTransition(() => {
      setTournamentDetail(null);
    });
    let cancelled = false;
    TournamentService.getTournamentByID(selectedGroup.tournament.id)
      .then((data) => {
        if (!cancelled) setTournamentDetail(data);
      })
      .catch(() => {
        if (!cancelled) setTournamentDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGroup]);

  const [tournamentRaces, setTournamentRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    let cancelled = false;
    startTransition(() => {
      setRacesLoading(true);
    });
    TournamentService.getTournamentRaces(selectedGroup.tournament.id, {
      limit: 100,
    })
      .then((data) => {
        if (!cancelled) setTournamentRaces(data.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setTournamentRaces([]);
      })
      .finally(() => {
        if (!cancelled) setRacesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedGroup]);

  const displayTournament =
    tournamentDetail ?? selectedGroup?.tournament ?? null;

  const isPanelOpen = selectedGroup !== null;

  const handleSelect = (id: string) => {
    setSelectedTournamentId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="text-3xl font-black tracking-tight text-primary font-headline">
              Tournament Registration
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Browse registrations with tournament, horse, and status details.
            </p>
          </div>

          <div className="relative w-full sm:w-72 md:w-80 shadow-sm rounded-xl border border-border bg-card">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search tournament or horse..."
              className="w-full h-11 rounded-xl bg-transparent pl-11 pr-4 text-xs font-medium outline-none transition focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-3">
          <StatFilterCard
            label="Total"
            value={counts.all}
            active={activeFilter === "All"}
            onClick={() => {
              setActiveFilter("All");
              setSelectedTournamentId(null);
            }}
          />
          <StatFilterCard
            label="On going"
            value={counts.ongoing}
            active={activeFilter === "On going"}
            onClick={() => {
              setActiveFilter("On going");
              setSelectedTournamentId(null);
            }}
          />
          <StatFilterCard
            label="Registration open"
            value={counts.open}
            active={activeFilter === "Registration open"}
            onClick={() => {
              setActiveFilter("Registration open");
              setSelectedTournamentId(null);
            }}
          />
          <StatFilterCard
            label="Completed"
            value={counts.completed}
            active={activeFilter === "Completed"}
            onClick={() => {
              setActiveFilter("Completed");
              setSelectedTournamentId(null);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`space-y-3 transition-all duration-300 ${
              isPanelOpen ? "lg:col-span-3" : "lg:col-span-12"
            }`}
          >
            {filteredGroups.length > 0 ? (
              filteredGroups.map((g) => {
                const isSelected =
                  selectedGroup?.tournament.id === g.tournament.id;
                const tournament = g.tournament;
                const isLive = tournament.status === "ongoing";

                return (
                  <div
                    key={g.tournament.id}
                    onClick={() => handleSelect(g.tournament.id)}
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
                        <Trophy className="h-4.5 w-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-black font-headline text-primary tracking-tight leading-tight truncate">
                            {tournament.name}
                          </h3>
                          <TournamentStatusBadge status={tournament.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground/80" />
                            {tournament.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flag className="h-3 w-3 text-muted-foreground/80" />
                            {formatDate(tournament.startDate)}
                          </span>
                        </div>
                        <div className="mt-2 divide-y divide-border border-t border-border">
                          {g.items.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between py-1.5"
                            >
                              <span className="text-sm font-bold text-primary/90 truncate pr-2">
                                {r.horse.name}
                              </span>
                              <HorseStatusIndicator status={r.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No registrations found.
                </p>
              </div>
            )}
          </div>

          {isPanelOpen && selectedGroup && (
            <div className="lg:col-span-9 lg:sticky lg:top-4 bg-card border border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
              <div className="border-b border-primary/20 bg-primary px-6 py-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/70">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(displayTournament?.startDate)} -{" "}
                    {formatDate(displayTournament?.endDate)}
                  </span>
                  <div className="text-2xl font-black font-headline text-white tracking-tight leading-snug truncate mt-1">
                    {displayTournament?.name}
                  </div>
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    {displayTournament?.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTournamentId(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="border-b border-border px-6 pt-5 pb-3">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start">
                  <button
                    onClick={() => setDetailTab("details")}
                    className={`rounded-lg px-5 py-1.5 text-xs font-bold transition-all ${
                      detailTab === "details"
                        ? "bg-white text-[#064E3B] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Tournament Details
                  </button>
                  <button
                    onClick={() => setDetailTab("races")}
                    className={`rounded-lg px-5 py-1.5 text-xs font-bold transition-all ${
                      detailTab === "races"
                        ? "bg-white text-[#064E3B] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Races
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[550px] overflow-y-auto custom-scrollbar space-y-6">
                {detailTab === "details" ? (
                  <>
                    <div className="p-4.5 rounded-xl border border-border bg-card flex flex-col gap-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Registered Horses ({selectedGroup.items.length})
                      </p>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar divide-y divide-border">
                        {selectedGroup.items.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between py-2.5"
                          >
                            <div className="min-w-0 pr-3">
                              <p className="text-sm font-bold text-foreground truncate">
                                {r.horse.name}
                              </p>
                              {r.horse.breed && (
                                <p className="text-[10px] text-muted-foreground">
                                  {r.horse.breed}
                                  {r.horse.birthDate
                                    ? ` · ${formatAge(r.horse.birthDate)}`
                                    : ""}
                                </p>
                              )}
                            </div>
                            <HorseStatusIndicator status={r.status} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4.5 rounded-xl border border-border bg-card flex flex-col items-start gap-2.5">
                        <div className="p-2 bg-secondary/15 text-secondary rounded-lg">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Tournament Status
                          </p>
                          <div className="mt-1">
                            <TournamentStatusBadge
                              status={displayTournament?.status ?? ""}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex flex-col items-start gap-2.5">
                        <div className="p-2 bg-muted text-muted-foreground rounded-lg">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Registration Period
                          </p>
                          <p className="text-sm font-bold text-foreground mt-1">
                            {displayTournament?.registrationOpenDate
                              ? `${formatDateFull(displayTournament?.registrationOpenDate)} - ${displayTournament?.registrationCloseDate ? formatDateFull(displayTournament?.registrationCloseDate) : "TBD"}`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Tournament Details
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                          <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {displayTournament?.location || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Prize Pool
                          </p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {displayTournament?.prizePool != null
                              ? `$${formatPrizePool(displayTournament?.prizePool)}`
                              : "Not announced"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Max Participants
                          </p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {displayTournament?.maximumParticipants ??
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dates</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {formatDateFull(displayTournament?.startDate)} -{" "}
                            {formatDateFull(displayTournament?.endDate)}
                          </p>
                        </div>
                      </div>

                      {displayTournament?.description && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            Description
                          </p>
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {displayTournament?.description}
                          </p>
                        </div>
                      )}

                      {displayTournament?.rules && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                            Rules & Regulations
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {displayTournament?.rules}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-border bg-card p-4.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Races
                    </p>
                    {racesLoading ? (
                      <div className="text-xs text-muted-foreground py-4 text-center">
                        Loading races...
                      </div>
                    ) : tournamentRaces.length > 0 ? (
                      <div className="space-y-2">
                        {tournamentRaces.map((race) => {
                          const isScheduled = race.status === "scheduled";
                          const groupHorseIds = new Set(
                            selectedGroup.items.map((r) => r.horse.id)
                          );
                          const groupEntries = entries.filter(
                            (e) =>
                              e.raceId === race.id &&
                              groupHorseIds.has(e.horseId)
                          );
                          const anyApproved = selectedGroup.items.some(
                            (r) => r.status === "approved"
                          );
                          return (
                            <div
                              key={race.id}
                              className="p-3 rounded-lg border border-border bg-card hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-foreground truncate">
                                    {race.name}
                                  </p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground mt-0.5">
                                    <span>
                                      {new Date(
                                        race.scheduledAt
                                      ).toLocaleString("en-GB", {
                                        day: "numeric",
                                        month: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span>{race.laneCount} lanes</span>
                                    {race.distanceMeters ? (
                                      <span>{race.distanceMeters}m</span>
                                    ) : (race as any).course?.distanceMeters ? (
                                      <span>
                                        {(race as any).course.distanceMeters}m
                                      </span>
                                    ) : null}
                                    {race.trackCondition ? (
                                      <span className="capitalize">
                                        {race.trackCondition.replaceAll(
                                          "_",
                                          " "
                                        )}
                                      </span>
                                    ) : null}
                                    {race.venue ? (
                                      <span>{race.venue}</span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="ml-3 shrink-0">
                                  {isScheduled &&
                                    anyApproved &&
                                    groupEntries.length === 0 && (
                                      <button
                                        onClick={() =>
                                          onEnterRace(
                                            race.id,
                                            race.name,
                                            race.laneCount,
                                            race.tournamentId
                                          )
                                        }
                                        className="rounded-md bg-[#064E3B] text-white px-3 py-1.5 text-[10px] font-bold hover:bg-[#043E2F] transition-colors"
                                      >
                                        Enter
                                      </button>
                                    )}
                                </div>
                              </div>
                              {groupEntries.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {groupEntries.map((entry) => {
                                    const horseName =
                                      selectedGroup.items.find(
                                        (r) => r.horse.id === entry.horseId
                                      )?.horse.name ?? "";
                                    const hasJockey =
                                      entry.jockeyName &&
                                      entry.jockeyName !== "";
                                    return (
                                      <div
                                        key={entry.entryId}
                                        className="flex items-center justify-between pl-2 pr-1 py-1.5 rounded-md bg-muted/20 border border-border/50"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <span className="text-[11px] font-semibold text-foreground">
                                            {horseName}
                                          </span>
                                          <div className="flex gap-2 text-[9px] text-muted-foreground mt-0.5">
                                            {entry.laneNumber ? (
                                              <span>
                                                Lane {entry.laneNumber}
                                              </span>
                                            ) : null}
                                            {hasJockey ? (
                                              <span>
                                                Jockey: {entry.jockeyName}
                                              </span>
                                            ) : (
                                              <span className="text-amber-600">
                                                No jockey
                                              </span>
                                            )}
                                            {entry.entryStatus ? (
                                              <span className="capitalize">
                                                {entry.entryStatus.replaceAll(
                                                  "_",
                                                  " "
                                                )}
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                        {hasJockey ? (
                                          <span className="text-[10px] text-emerald-600 font-medium shrink-0">
                                            Assigned
                                          </span>
                                        ) : isScheduled ? (
                                          <button
                                            onClick={() =>
                                              onAssignJockey(entry.entryId)
                                            }
                                            className="rounded-md border border-[#064E3B]/20 bg-[#064E3B]/5 text-[#064E3B] px-3 py-1.5 text-[10px] font-bold hover:bg-[#064E3B]/10 transition-colors shrink-0"
                                          >
                                            Assign
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                            Unassigned
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No races available for this tournament.
                      </p>
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
