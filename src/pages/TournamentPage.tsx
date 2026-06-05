// src/pages/TournamentPage.tsx

import React, { useMemo, useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { cn } from "../lib/utils";
import { ROUTES } from "../router/routes.tsx";
import {
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Search,
  Trophy,
  Users,
  CheckCircle2,
  CalendarRange,
  Crown,
  Flag,
  TimerReset,
  ShieldCheck,
  List,
  ChessKnight,
} from "lucide-react";

type TournamentStatus = "Upcoming" | "Ongoing" | "Finished";

type RaceStatus = "Scheduled" | "Ready" | "Completed" | "Locked";

type Race = {
  id: number;
  name: string;
  time: string;
  distance: string;
  status: RaceStatus;
  prize: string;
  entrants: number;
};

type Tournament = {
  id: number;
  title: string;
  location: string;
  date: string;
  status: TournamentStatus;
  participants: number;
  prizePool: string;
  description: string;
  progress: number;
  races: Race[];
};

const tournamentData: Tournament[] = [
  {
    id: 1,
    title: "Spring Turf Classic",
    location: "Saigon Turf Park",
    date: "2026-06-12",
    status: "Upcoming",
    participants: 24,
    prizePool: "$120,000",
    description: "Elite turf event with sprint and middle-distance heats.",
    progress: 18,
    races: [
      {
        id: 1,
        name: "Heat A - Maiden Sprint",
        time: "08:30",
        distance: "1200m",
        status: "Scheduled",
        prize: "$8,000",
        entrants: 12,
      },
      {
        id: 2,
        name: "Heat B - Open Turf",
        time: "10:00",
        distance: "1600m",
        status: "Ready",
        prize: "$12,000",
        entrants: 14,
      },
      {
        id: 3,
        name: "Final - Championship Run",
        time: "15:30",
        distance: "1800m",
        status: "Locked",
        prize: "$45,000",
        entrants: 8,
      },
    ],
  },
  {
    id: 2,
    title: "Royal Derby Series",
    location: "Central Grand Arena",
    date: "2026-06-18",
    status: "Ongoing",
    participants: 32,
    prizePool: "$240,000",
    description: "High-stakes derby with qualification rounds and final.",
    progress: 61,
    races: [
      {
        id: 1,
        name: "Qualifier 1",
        time: "09:00",
        distance: "1400m",
        status: "Completed",
        prize: "$10,000",
        entrants: 16,
      },
      {
        id: 2,
        name: "Qualifier 2",
        time: "12:00",
        distance: "1400m",
        status: "Ready",
        prize: "$10,000",
        entrants: 16,
      },
      {
        id: 3,
        name: "Grand Final",
        time: "17:00",
        distance: "2000m",
        status: "Scheduled",
        prize: "$80,000",
        entrants: 8,
      },
    ],
  },
  {
    id: 3,
    title: "Autumn Invitational",
    location: "North Valley Course",
    date: "2026-05-20",
    status: "Finished",
    participants: 18,
    prizePool: "$75,000",
    description: "Season wrap-up event with ranked invitations only.",
    progress: 100,
    races: [
      {
        id: 1,
        name: "Invitational Sprint",
        time: "08:15",
        distance: "1000m",
        status: "Completed",
        prize: "$5,000",
        entrants: 10,
      },
      {
        id: 2,
        name: "Invitational Mile",
        time: "11:45",
        distance: "1600m",
        status: "Completed",
        prize: "$12,500",
        entrants: 8,
      },
      {
        id: 3,
        name: "Closing Cup",
        time: "16:20",
        distance: "1800m",
        status: "Completed",
        prize: "$25,000",
        entrants: 6,
      },
    ],
  },
];

const statusStyle: Record<
  TournamentStatus,
  { label: string; chip: string; dot: string; icon: React.ElementType }
> = {
  Upcoming: {
    label: "Upcoming",
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    dot: "bg-amber-500",
    icon: CalendarRange,
  },
  Ongoing: {
    label: "Ongoing",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    dot: "bg-emerald-500",
    icon: TimerReset,
  },
  Finished: {
    label: "Finished",
    chip: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    dot: "bg-slate-500",
    icon: CheckCircle2,
  },
};

const raceStatusStyle: Record<RaceStatus, { chip: string; dot: string }> = {
  Scheduled: {
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  Ready: {
    chip: "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/20",
    dot: "bg-[#064E3B]",
  },
  Completed: {
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  Locked: {
    chip: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    dot: "bg-rose-500",
  },
};

export default function TournamentPage() {
  const [active, setActive] = useState<string>(ROUTES.TOURNAMENT);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [onlyOngoing, setOnlyOngoing] = useState(false);

  const selectedTournament =
    tournamentData.find((t) => t.id === selectedTournamentId) ??
    tournamentData[0];

  const filteredTournaments = useMemo(() => {
    return tournamentData.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());

      const matchStatus = !onlyOngoing || t.status === "Ongoing";
      return matchSearch && matchStatus;
    });
  }, [search, onlyOngoing]);

  const totalTournaments = tournamentData.length;
  const ongoingCount = tournamentData.filter(
    (t) => t.status === "Ongoing"
  ).length;
  const totalRaces = tournamentData.reduce((sum, t) => sum + t.races.length, 0);

  const renderContent = () => {
    if (active === ROUTES.TOURNAMENT) {
      return (
        <TournamentOverview
          tournaments={filteredTournaments}
          selectedTournament={selectedTournament}
          setSelectedTournamentId={setSelectedTournamentId}
          search={search}
          setSearch={setSearch}
          onlyOngoing={onlyOngoing}
          setOnlyOngoing={setOnlyOngoing}
          totalTournaments={totalTournaments}
          ongoingCount={ongoingCount}
          totalRaces={totalRaces}
        />
      );
    }

    return <TournamentRacesView tournament={selectedTournament} />;
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none font-body">
          <div className="pointer-events-auto rounded-xl border border-[#064E3B]/10 bg-white shadow-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-[#064E3B]/10 text-[#064E3B]">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#064E3B]">
                  Tournament Center
                </p>
                <p className="text-[11px] text-slate-500">
                  Manage events, races, and status
                </p>
              </div>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </UserLayout>
  );
}

function TournamentOverview({
  tournaments,
  selectedTournament,
  setSelectedTournamentId,
  search,
  setSearch,
  onlyOngoing,
  setOnlyOngoing,
  totalTournaments,
  ongoingCount,
  totalRaces,
}: {
  tournaments: Tournament[];
  selectedTournament: Tournament;
  setSelectedTournamentId: (id: number) => void;
  search: string;
  setSearch: (v: string) => void;
  onlyOngoing: boolean;
  setOnlyOngoing: (v: boolean) => void;
  totalTournaments: number;
  ongoingCount: number;
  totalRaces: number;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto font-body h-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
        <div>
          <h2 className="text-2xl font-black font-headline text-[#064E3B]">
            Tournament Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Overview of tournament events, race lineup, and status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-[#064E3B]/20 bg-[#064E3B]/10 text-[#064E3B]">
            <Trophy className="w-3.5 h-3.5" />
            {totalTournaments} Tournaments
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-amber-500/20 bg-amber-500/10 text-amber-700">
            <Clock3 className="w-3.5 h-3.5" />
            {ongoingCount} Ongoing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-slate-200 bg-white text-slate-700">
            <ChessKnight className="w-3.5 h-3.5" />
            {totalRaces} Races
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Open Tournaments"
          value={`${tournaments.filter((t) => t.status !== "Finished").length}`}
          subtitle="Available for participation or review"
          icon={List}
        />
        <StatCard
          title="Live Events"
          value={`${ongoingCount}`}
          subtitle="Currently active tournament schedules"
          icon={TimerReset}
        />
        <StatCard
          title="Total Race Slots"
          value={`${totalRaces}`}
          subtitle="All races across selected tournaments"
          icon={Flag}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#064E3B]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold font-headline text-lg text-[#064E3B]">
                Tournament List
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Search and filter tournament entries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tournament..."
                  className="w-64 max-w-full bg-[#F4F6F5]/50 border border-slate-200 hover:border-slate-300 focus:border-[#064E3B] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none transition"
                />
              </label>

              <button
                onClick={() => setOnlyOngoing(!onlyOngoing)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold border transition",
                  onlyOngoing
                    ? "bg-[#064E3B] text-white border-[#064E3B]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#064E3B]/20"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                Ongoing
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tournaments.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No tournament matches found.
              </div>
            ) : (
              tournaments.map((t) => {
                const cfg = statusStyle[t.status];
                const Icon = cfg.icon;
                const active = selectedTournament.id === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTournamentId(t.id)}
                    className={cn(
                      "w-full text-left rounded-2xl border p-4 transition-all duration-300 shadow-sm",
                      active
                        ? "border-[#064E3B] bg-[#064E3B]/5"
                        : "border-slate-200 hover:border-[#064E3B]/20 bg-white"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase",
                              cfg.chip
                            )}
                          >
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold font-label">
                            #{t.id}
                          </span>
                        </div>

                        <h4 className="text-lg font-black font-headline text-[#064E3B] truncate">
                          {t.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {t.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {t.date}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {t.participants} participants
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {t.description}
                        </p>
                      </div>

                      <div className="shrink-0 md:text-right">
                        <div className="flex items-center gap-2 md:justify-end">
                          <span className="text-[10px] font-bold text-[#064E3B]">
                            {t.progress}%
                          </span>
                          <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#064E3B]"
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 text-xs font-bold text-slate-600">
                          Prize pool
                        </div>
                        <div className="text-lg font-black font-headline text-[#064E3B]">
                          {t.prizePool}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-md font-headline text-[#064E3B] flex items-center gap-2">
              <span className="text-[#D97706]">
                <Crown className="w-4 h-4" />
              </span>
              Selected Tournament
            </h3>
            <span className="text-[9px] font-label text-slate-400 font-bold uppercase">
              Summary
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Title
              </p>
              <p className="mt-1 text-sm font-bold text-[#064E3B]">
                {selectedTournament.title}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Schedule
              </p>
              <p className="mt-1 text-sm font-bold text-[#064E3B]">
                {selectedTournament.date}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Location
              </p>
              <p className="mt-1 text-sm font-bold text-[#064E3B]">
                {selectedTournament.location}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Prize Pool
              </p>
              <p className="mt-1 text-lg font-black font-headline text-[#064E3B]">
                {selectedTournament.prizePool}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Progress
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#064E3B]"
                    style={{ width: `${selectedTournament.progress}%` }}
                  />
                </div>
                <span className="text-xs font-black text-[#064E3B]">
                  {selectedTournament.progress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentRacesView({ tournament }: { tournament: Tournament }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto font-body h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold font-headline text-[#064E3B]">
            Tournament Races
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Race lineup for {tournament.title}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#064E3B]/20 bg-[#064E3B]/10 px-3 py-1.5 text-xs font-bold text-[#064E3B]">
          <ChessKnight className="w-4 h-4" />
          {tournament.races.length} races
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {tournament.races.map((race, index) => {
            const cfg = raceStatusStyle[race.status];

            return (
              <div
                key={race.id}
                className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm hover:border-[#064E3B]/20 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[9px] font-black text-slate-500 uppercase">
                        Race #{index + 1}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase",
                          cfg.chip
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)}
                        />
                        {race.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-black font-headline text-[#064E3B]">
                      {race.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5" />
                        {race.time}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5" />
                        {race.distance}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {race.entrants} entrants
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 md:text-right">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                      Prize
                    </p>
                    <p className="text-xl font-black font-headline text-[#064E3B]">
                      {race.prize}
                    </p>

                    <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#064E3B] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#043E2F] transition">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      View Race Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-md font-headline text-[#064E3B]">
                Tournament Summary
              </h3>
              <span className="text-[9px] font-label text-slate-400 font-bold uppercase">
                Details
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <SummaryLine label="Tournament" value={tournament.title} />
              <SummaryLine label="Location" value={tournament.location} />
              <SummaryLine label="Date" value={tournament.date} />
              <SummaryLine label="Status" value={tournament.status} />
              <SummaryLine
                label="Participants"
                value={`${tournament.participants}`}
              />
              <SummaryLine label="Prize Pool" value={tournament.prizePool} />
            </div>
          </div>

          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-md font-headline text-[#064E3B] mb-4">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <button className="w-full rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] px-4 py-3 text-xs font-bold transition shadow-sm">
                Download Tournament Pack
              </button>
              <button className="w-full rounded-xl bg-white text-[#064E3B] border border-[#064E3B]/20 hover:border-[#064E3B]/40 px-4 py-3 text-xs font-bold transition">
                Export Race List
              </button>
              <button className="w-full rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 px-4 py-3 text-xs font-bold transition">
                Share Tournament Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
      <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
        <Icon />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">
          {title}
        </span>
        <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
          <Icon className="w-4 h-4" />
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
          {value}
        </span>
      </div>

      <p className="text-xs text-slate-500 mt-2 font-body font-medium">
        {subtitle}
      </p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-xs font-bold text-[#064E3B] text-right">
        {value}
      </span>
    </div>
  );
}
