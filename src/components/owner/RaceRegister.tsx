import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  Trophy,
  Clock3,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Users,
  Flag,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Tournament, TournamentRegistrationResponse } from "../../types/tournament";
import type { Horse } from "../../types/horse";

export interface RaceRegisterProps {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistrationResponse[];
  onOpenRegisterModal: (
    horseId: string | null,
    tournamentId: number | null
  ) => void;
}

type ActiveFilterType = "All" | "On going" | "Registration open" | "Completed";

function formatDate(value?: string) {
  if (!value) return "Not specified";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not specified";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatDateFull(value?: string) {
  if (!value) return "Not specified";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not specified";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatStatus(status?: string) {
  if (!status) return "Unknown";
  return status.replace(/_/g, " ");
}

function TournamentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live_now: "bg-rose-100 text-rose-700 border-rose-200",
    registration_open: "bg-emerald-100 text-emerald-700 border-emerald-200",
    upcoming: "bg-amber-100 text-amber-700 border-amber-200",
    ongoing: "bg-secondary/10 text-secondary border-secondary/30",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
        styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      )}
    >
      {status === "live_now" && (
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
      )}
      {status === "ongoing" && (
        <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
      )}
      {formatStatus(status)}
    </span>
  );
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
        styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      )}
    >
      {status === "approved" && <CheckCircle2 className="h-3 w-3" />}
      {status === "pending" && <Clock3 className="h-3 w-3" />}
      {status === "rejected" && <AlertCircle className="h-3 w-3" />}
      {formatStatus(status)}
    </span>
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
      <p className="text-lg font-black leading-none text-foreground">
        {value}
      </p>
    </button>
  );
}

function formatAge(dob: string): string {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} years`;
}

export function RaceRegister({
  registrations,
}: RaceRegisterProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilterType>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRegistrations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return registrations.filter((r) => {
      const tournament = r.tournament;
      const horse = r.horse;

      const matchesSearch =
        !keyword ||
        tournament.name.toLowerCase().includes(keyword) ||
        horse.name.toLowerCase().includes(keyword) ||
        horse.breed.toLowerCase().includes(keyword) ||
        tournament.location.toLowerCase().includes(keyword);

      const matchesFilter =
        activeFilter === "All" ||
        tournament.status === activeFilter.toLowerCase().replace(/\s+/g, "_");

      return matchesSearch && matchesFilter;
    });
  }, [registrations, search, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: registrations.length,
      ongoing: registrations.filter((r) => r.tournament.status === "ongoing").length,
      open: registrations.filter(
        (r) => r.tournament.status === "registration_open"
      ).length,
      completed: registrations.filter((r) => r.tournament.status === "completed")
        .length,
    };
  }, [registrations]);

  const selectedRegistration = useMemo(
    () => filteredRegistrations.find((r) => r.id === selectedId) ?? null,
    [filteredRegistrations, selectedId]
  );

  const isPanelOpen = selectedRegistration !== null;

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h2 className="text-3xl font-black tracking-tight text-primary font-headline">
              Race & Tournament Registration
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
              setSelectedId(null);
            }}
          />
          <StatFilterCard
            label="On going"
            value={counts.ongoing}
            active={activeFilter === "On going"}
            onClick={() => {
              setActiveFilter("On going");
              setSelectedId(null);
            }}
          />
          <StatFilterCard
            label="Registration open"
            value={counts.open}
            active={activeFilter === "Registration open"}
            onClick={() => {
              setActiveFilter("Registration open");
              setSelectedId(null);
            }}
          />
          <StatFilterCard
            label="Completed"
            value={counts.completed}
            active={activeFilter === "Completed"}
            onClick={() => {
              setActiveFilter("Completed");
              setSelectedId(null);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`space-y-3 transition-all duration-300 ${
              isPanelOpen ? "lg:col-span-3" : "lg:col-span-12"
            }`}
          >
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((r) => {
                const isSelected = selectedRegistration?.id === r.id;
                const tournament = r.tournament;
                const horse = r.horse;
                const isLive = tournament.status === "ongoing"

                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
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
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground/80">
                            {horse.name}
                          </span>
                          <RegistrationStatusBadge status={r.status} />
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

          {isPanelOpen && selectedRegistration && (
            <div className="lg:col-span-9 lg:sticky lg:top-4 bg-card border border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
              <div className="border-b border-primary/20 bg-primary px-6 py-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/70">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(selectedRegistration.tournament.startDate)} -{" "}
                    {formatDate(selectedRegistration.tournament.endDate)}
                  </span>
                  <div className="text-2xl font-black font-headline text-white tracking-tight leading-snug truncate mt-1">
                    {selectedRegistration.tournament.name}
                  </div>
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    {selectedRegistration.tournament.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-6 max-h-[550px] overflow-y-auto custom-scrollbar space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                      H
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Horse
                      </p>
                      <p className="text-base font-black text-foreground mt-1">
                        {selectedRegistration.horse.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedRegistration.horse.breed} ·{" "}
                        {formatAge(selectedRegistration.horse.dob)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                    <div className="p-2.5 bg-secondary/15 text-secondary rounded-lg">
                      <CalendarDays className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Registration Status
                      </p>
                      <div className="mt-1">
                        <RegistrationStatusBadge
                          status={selectedRegistration.status}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Submitted{" "}
                        {formatDate(selectedRegistration.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                    <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                      <ShieldAlert className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Tournament Status
                      </p>
                      <div className="mt-1">
                        <TournamentStatusBadge
                          status={selectedRegistration.tournament.status}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                    <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Registration ID
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1 font-mono">
                        #{selectedRegistration.id.slice(0, 12)}
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
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedRegistration.tournament.location ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Prize Pool
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {selectedRegistration.tournament.prizePool != null
                          ? `$${selectedRegistration.tournament.prizePool.toLocaleString()}`
                          : "Not announced"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Max Participants
                      </p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {selectedRegistration.tournament.maximumParticipants ??
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dates</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">
                        {formatDateFull(
                          selectedRegistration.tournament.startDate
                        )}{" "}
                        -{" "}
                        {formatDateFull(
                          selectedRegistration.tournament.endDate
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedRegistration.tournament.description && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">
                        Description
                      </p>
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {selectedRegistration.tournament.description}
                      </p>
                    </div>
                  )}

                  {selectedRegistration.tournament.rules && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                        Rules & Regulations
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {selectedRegistration.tournament.rules}
                      </p>
                    </div>
                  )}
                </div>

                {selectedRegistration.tournament.status ===
                  "registration_open" && (
                  <div className="flex items-center justify-end gap-3">
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
