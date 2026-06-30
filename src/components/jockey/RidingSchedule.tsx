import { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "../../lib/utils";
import type { DateRange } from "react-day-picker";
import type { MyRide } from "../../hooks/useJockey";
import {
  Clock,
  Trophy,
  Activity,
  Compass,
  CalendarDays,
  Flag,
  Users,
  Search,
  MapPin,
} from "lucide-react";

import { ScheduleLayout } from "../schedule/ScheduleLayout";
import { ScheduleCalendar } from "../schedule/ScheduleCalendar";
import { ScheduleStatCard } from "../schedule/ScheduleStatCard";
import {
  ScheduleDetailFrame,
  type TabConfig,
} from "../schedule/ScheduleDetailFrame";
import { RaceService } from "../../services/RaceService";
import type { RaceEntry } from "../../types/race";
import { formatStatus } from "../../utils/statusFormat";

type RideDetailTab = "info" | "runners";

interface RidingScheduleProps {
  rides: MyRide[];
  loading?: boolean;
  userRole: "jockey" | "owner";
  onAcceptRide?: (id: string) => void;
  onDeclineRide?: (id: string) => void;
}

const formatOrdinal = (num: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const val = num % 100;
  return num + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
};

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30";
    case "accepted":
      return "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30";
    case "declined":
      return "bg-rose-500/10 text-rose-700 border-rose-500/30";
    case "did_not_finish":
      return "bg-slate-100 text-slate-700 border-slate-300";
    case "disqualified":
      return "bg-red-50 text-red-800 border-red-300";
    case "scratched":
      return "bg-amber-50 text-amber-800 border-amber-300";
    default:
      return "bg-slate-500/10 text-slate-600 border-slate-500/30";
  }
};

function RideStatusBadge({
  status,
  onDark,
}: {
  status: string;
  onDark?: boolean;
}) {
  if (onDark) {
    const styles: Record<string, string> = {
      pending: "bg-[#D97706] !text-white border-transparent",
      accepted: "bg-emerald-600 !text-white border-transparent",
      declined: "bg-rose-600 !text-white border-transparent",
      did_not_finish: "bg-slate-600 !text-white border-transparent",
      disqualified: "bg-red-600 !text-white border-transparent",
      scratched: "bg-amber-600 !text-white border-transparent",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm !text-white",
          styles[status] ?? "bg-slate-600 !text-white border-transparent"
        )}
      >
        {formatStatus(status)}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm",
        getStatusBadgeStyles(status)
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

export function RidingSchedule({
  rides,
  loading = false,
  userRole,
  onAcceptRide,
  onDeclineRide,
}: RidingScheduleProps) {
  const isJockey = userRole === "jockey";

  const [search, setSearch] = useState("");
  const [selectedRide, setSelectedRide] = useState<MyRide | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    undefined
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const ridesInRange = useMemo(() => {
    if (!selectedRange?.from) return rides;
    const from = new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    const to = selectedRange.to ? new Date(selectedRange.to) : new Date(from);
    to.setHours(23, 59, 59, 999);
    return rides.filter((r) => {
      const d = new Date(r.scheduledAt);
      return d >= from && d <= to;
    });
  }, [rides, selectedRange]);

  const entryStatusCounts = useMemo(() => {
    const map = new Map<string, number>();
    ridesInRange.forEach((r) => {
      const key = r.entryStatus || "pending";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [ridesInRange]);

  const uniqueEntryStatuses = useMemo(
    () => ["All", ...new Set(ridesInRange.map((r) => r.entryStatus || "pending"))],
    [ridesInRange]
  );

  const filteredRides = useMemo(() => {
    const lower = search.toLowerCase();
    return rides
      .filter((r) => {
        if (statusFilter === "All") return true;
        if (isJockey) return r.entryStatus === statusFilter;
        return r.status === statusFilter;
      })
      .filter((r) => {
        if (!lower) return true;
        const searchable = isJockey
          ? [r.name, r.ride, r.venue]
          : [r.name, r.ride];
        return searchable.some((s) => s.toLowerCase().includes(lower));
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [rides, statusFilter, search, isJockey]);

  const calendarFilteredRides = useMemo(() => {
    if (!selectedRange?.from) return filteredRides;
    const from = new Date(selectedRange.from);
    from.setHours(0, 0, 0, 0);
    const to = selectedRange.to ? new Date(selectedRange.to) : new Date(from);
    to.setHours(23, 59, 59, 999);
    return filteredRides.filter((r) => {
      const d = new Date(r.scheduledAt);
      return d >= from && d <= to;
    });
  }, [filteredRides, selectedRange]);

  const raceDays = useMemo(() => {
    return rides.map((r) => {
      const d = new Date(r.scheduledAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });
  }, [rides]);

  const handleSelectRide = useCallback((ride: MyRide) => {
    setSelectedRide((prev) => (prev?.id === ride.id ? null : ride));
  }, []);

  const activeSelectedRide = useMemo(() => {
    if (!selectedRide) return null;
    return rides.find((r) => r.id === selectedRide.id) ?? null;
  }, [rides, selectedRide]);

  const panelOpen = activeSelectedRide !== null;

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body h-full custom-scrollbar bg-[#F4F6F5]">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-headline text-[#064E3B]">
              {isJockey ? "My Rides" : "Owner Schedule"}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {isJockey
                ? "Your confirmed race assignments and schedule overview"
                : "Upcoming races for your horses."}
            </p>
          </div>
          <div className="relative w-full sm:w-72 shadow-sm rounded-xl border border-slate-200 bg-white">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isJockey
                  ? "Search races, horses..."
                  : "Search horses, tournaments..."
              }
              className="w-full h-10 rounded-xl bg-transparent pl-10 pr-4 text-xs font-medium outline-none transition focus:border-[#064E3B] placeholder:text-slate-400"
            />
          </div>
        </div>

        {isJockey ? (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {uniqueEntryStatuses.map((key) => {
              const isAll = key === "All";
              return (
                <ScheduleStatCard
                  key={key}
                  label={isAll ? "Total" : formatStatus(key)}
                  value={isAll ? ridesInRange.length : (entryStatusCounts.get(key) ?? 0)}
                  active={statusFilter === key}
                  onClick={() => setStatusFilter(key)}
                  liveDot={key === "pending"}
                />
              );
            })}
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "All", label: "All Races" },
              { key: "scheduled", label: "Scheduled" },
              { key: "live", label: "Live" },
              { key: "completed", label: "Completed" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-xs",
                  statusFilter === item.key
                    ? "bg-[#064E3B] text-white border-[#064E3B]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">
            Loading your races...
          </p>
        </div>
      ) : (
        <ScheduleLayout
          panelOpen={panelOpen}
          calendarSlot={
            <ScheduleCalendar
              selectedRange={selectedRange}
              onSelect={setSelectedRange}
              raceDays={raceDays}
            />
          }
          listSlot={
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-slate-100 bg-[#F4F6F5] px-5 py-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {selectedRange?.from
                    ? `Schedule: ${selectedRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}${selectedRange.to ? ` – ${selectedRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}`
                    : isJockey
                      ? "All Scheduled Assignments"
                      : "All Races"}
                </span>
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {calendarFilteredRides.length > 0 ? (
                  calendarFilteredRides.map((ride) => (
                    <button
                      key={ride.id}
                      onClick={() => handleSelectRide(ride)}
                      className={cn(
                        "group w-full flex flex-col px-4 py-3.5 text-left transition-all border-l-4",
                        activeSelectedRide?.id === ride.id &&
                          "bg-[#064E3B]/5 border-l-[#064E3B]",
                        isJockey &&
                          activeSelectedRide?.id !== ride.id &&
                          ride.entryStatus === "pending" &&
                          "bg-[#EAB308]/5 border-l-[#EAB308] hover:bg-[#EAB308]/10",
                        !activeSelectedRide &&
                          !isJockey &&
                          "border-l-transparent hover:bg-slate-50"
                      )}
                    >
                      {isJockey ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={cn(
                                "font-mono text-sm tracking-tight font-black shrink-0",
                                activeSelectedRide?.id === ride.id
                                  ? "text-[#064E3B]"
                                  : "text-slate-400"
                              )}
                            >
                              {new Date(ride.scheduledAt).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                            <div className="truncate">
                              <p
                                className={cn(
                                  "font-bold font-headline text-sm truncate",
                                  activeSelectedRide?.id === ride.id
                                    ? "text-[#064E3B]"
                                    : "text-slate-800"
                                )}
                              >
                                {ride.name}
                              </p>
                              <p className="text-[10px] text-slate-555 mt-0.5 truncate font-medium">
                                Ride:{" "}
                                <span className="text-slate-700 font-bold">
                                  {ride.ride}
                                </span>{" "}
                                • Gate {ride.laneNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pl-3">
                            <RideStatusBadge
                              status={ride.entryStatus}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="font-bold text-sm text-[#064E3B]">
                              {ride.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {ride.distanceMeters}m • Lane {ride.laneNumber}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                              ride.status === "live"
                                ? "bg-rose-100 text-rose-700"
                                : ride.status === "completed"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-100 text-emerald-700"
                            )}
                          >
                            {formatStatus(ride.status)}
                          </span>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    {selectedRange?.from
                      ? "No assigned races in this date range."
                      : "No assigned races found."}
                  </div>
                )}
              </div>
            </div>
          }
          detailSlot={
            activeSelectedRide &&
            (isJockey ? (
              <JockeyDetailPanel
                ride={activeSelectedRide}
                onClose={() => setSelectedRide(null)}
                onAccept={onAcceptRide!}
                onDecline={onDeclineRide!}
              />
            ) : (
              <OwnerDetailPanel
                ride={activeSelectedRide}
                onClose={() => setSelectedRide(null)}
              />
            ))
          }
        />
      )}
    </div>
  );
}

function JockeyDetailPanel({
  ride,
  onClose,
  onAccept,
  onDecline,
}: {
  ride: MyRide;
  onClose: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<RideDetailTab>("info");
  const [raceEntries, setRaceEntries] = useState<RaceEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntriesLoading(true);
    RaceService.getRaceHorses(ride.id)
      .then((data) => {
        if (!cancelled) {
          setRaceEntries(data ?? []);
          setEntriesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setEntriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ride.id]);

  const tabs: TabConfig<RideDetailTab>[] = [
    { key: "info", label: "Race Info", icon: <Flag className="w-3.5 h-3.5" /> },
    {
      key: "runners",
      label: "Runner Line-up",
      icon: <Users className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <ScheduleDetailFrame
      title={
        <h2 className="text-2xl font-black font-headline tracking-tight leading-tight text-white">
          {ride.name}
        </h2>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-2 mt-4 font-semibold text-xs text-white">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(ride.scheduledAt).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            ·{" "}
            {new Date(ride.scheduledAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-[#EAB308]/45 text-[#EAB308] px-3 py-1.5 font-bold">
            <Clock className="w-3.5 h-3.5" />
            {ride.status === "completed" ? "Finished" : "Starts in 40 min"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
            <Compass className="w-3.5 h-3.5" />
            {ride.distanceMeters}m · {ride.trackCondition}
          </span>
        </div>
      }
      headerRight={
        <RideStatusBadge status={ride.entryStatus} onDark />
      }
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "info" && (
        <>
          {ride.ranking && (
            <div className="bg-gradient-to-r from-[#EAB308]/20 to-[#EAB308]/5 border border-[#EAB308]/40 rounded-xl p-5 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAB308] text-[#064E3B] font-black border border-[#EAB308]/20 shadow-md">
                  <Trophy className="w-6 h-6 text-[#064E3B]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] block">
                    Race Result
                  </span>
                  <span className="text-lg font-black font-headline text-[#064E3B] block">
                    Official Finish: {formatOrdinal(ride.ranking)} Place
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#064E3B] bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                Verified
              </span>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">
              Your Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Horse
                </span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                  {ride.ride}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Grey · 5yo · Male
                </span>
              </div>
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Lane Draw
                </span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                  Lane {ride.laneNumber}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  of {ride.laneCount} runners
                </span>
              </div>
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Owner
                </span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                  {ride.horseOwner}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Juddmonte Farms
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">
              Race Conditions
            </h3>
            <div className="bg-white border border-[#064E3B]/10 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-slate-555 flex items-center gap-2 font-medium">
                    <Compass className="w-4 h-4 text-slate-400" /> Distance
                  </span>
                  <span className="font-bold text-slate-800">
                    {ride.distanceMeters}m
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-slate-555 flex items-center gap-2 font-medium">
                    <Activity className="w-4 h-4 text-slate-400" /> Going
                  </span>
                  <span className="font-bold text-slate-800 capitalize">
                    {ride.trackCondition}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-slate-555 flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4 text-slate-400" /> Field Size
                  </span>
                  <span className="font-bold text-slate-800">
                    {ride.laneCount} runners
                  </span>
                </div>
              </div>
            </div>
          </div>

          {ride.entryStatus === "pending" && (
            <div className="bg-white border-2 border-[#D97706]/20 rounded-xl p-5 shadow-md">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D97706] mb-3 block">
                Invitation Status
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    Invited by {ride.horseOwner}
                  </span>
                  <span className="text-xs text-slate-555 mt-0.5 block">
                    Received recently · Pending response
                  </span>
                </div>
                <div className="flex gap-2.5 shrink-0">
                  <button
                    onClick={() => onAccept(ride.id)}
                    className="rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] px-5 py-2.5 text-xs font-black shadow-sm transition active:scale-95 duration-200"
                  >
                    ✓ Accept Invitation
                  </button>
                  <button
                    onClick={() => onDecline(ride.id)}
                    className="rounded-xl border border-slate-200 bg-white text-slate-655 hover:bg-slate-50 px-5 py-2.5 text-xs font-black transition active:scale-95 duration-200"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "runners" && (
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">
            Confirmed Runner Line-up
          </h3>
          <div className="overflow-hidden rounded-xl border border-[#064E3B]/10 bg-white shadow-sm">
            {entriesLoading ? (
              <div className="p-6 text-center text-xs font-semibold text-slate-500">
                Loading entries...
              </div>
            ) : raceEntries.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-[#F4F6F5] border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">
                      Gate
                    </th>
                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Horse
                    </th>
                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Jockey
                    </th>
                    <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {raceEntries.map((entry) => {
                    const isOurs = entry.name === ride.ride;
                    return (
                      <tr
                        key={entry.id}
                        className={cn(
                          "transition-colors",
                          isOurs
                            ? "bg-[#064E3B]/5 font-semibold"
                            : "hover:bg-slate-50/50"
                        )}
                      >
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-md border text-xs font-black mx-auto shadow-sm",
                              isOurs
                                ? "bg-[#064E3B] text-white border-[#064E3B]"
                                : "bg-white text-slate-700 border-slate-200"
                            )}
                          >
                            {entry.clothNumber}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "font-bold font-headline text-base leading-snug",
                              isOurs ? "text-[#064E3B]" : "text-slate-800"
                            )}
                          >
                            {entry.name}
                          </span>
                          {isOurs && (
                            <span className="ml-2 text-[9px] font-black uppercase bg-[#064E3B]/10 text-[#064E3B] px-1.5 py-0.5 rounded">
                              Your Ride
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                          {isOurs ? (
                            <span className="text-[#064E3B] font-bold">
                              {ride.entryStatus === "declined"
                                ? "— Refused —"
                                : "You"}
                            </span>
                          ) : (
                            entry.jockeyName
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isOurs ? (
                            <RideStatusBadge status={ride.entryStatus} />
                          ) : (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-700">
                              Confirmed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs font-semibold text-slate-500">
                No horse entries available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </ScheduleDetailFrame>
  );
}

function OwnerDetailPanel({
  ride,
  onClose,
}: {
  ride: MyRide;
  onClose: () => void;
}) {
  return (
    <ScheduleDetailFrame
      title={
        <h2 className="text-2xl font-black font-headline tracking-tight leading-tight text-white">
          {ride.name}
        </h2>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-2 mt-4 font-semibold text-xs text-white/95">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold text-white">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(ride.scheduledAt).toLocaleDateString(navigator.language, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}{" "}
            ·{" "}
            {new Date(ride.scheduledAt).toLocaleTimeString(navigator.language, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold text-white">
            <Clock className="w-3.5 h-3.5" />
            Owner view
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold text-white">
            <Compass className="w-3.5 h-3.5" />
            {ride.distanceMeters}m · {ride.trackCondition}
          </span>
        </div>
      }
      headerRight={
        <span className="px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm bg-secondary !text-secondary-foreground border-transparent">
          {formatStatus(ride.status)}
        </span>
      }
      onClose={onClose}
    >
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">
          Your Horse Entry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Horse
            </span>
            <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
              {ride.ride}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Your registered runner
            </span>
          </div>
          <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Jockey
            </span>
            <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
              {ride.horseOwner}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Assigned rider
            </span>
          </div>
          <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Lane Draw
            </span>
            <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
              Lane {ride.laneNumber}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              of {ride.laneCount} runners
            </span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">
          Race Conditions
        </h3>
        <div className="bg-white border border-[#064E3B]/10 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 text-sm">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-slate-555 flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-slate-400" />
              Venue
            </span>
            <span className="font-bold text-slate-800">{ride.venue}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-slate-555 flex items-center gap-2 font-medium">
              <Flag className="w-4 h-4 text-slate-400" />
              Distance
            </span>
            <span className="font-bold text-slate-800">
              {ride.distanceMeters}m
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-slate-555 flex items-center gap-2 font-medium">
              <Activity className="w-4 h-4 text-slate-400" />
              Going
            </span>
            <span className="font-bold text-slate-800 capitalize">
              {ride.trackCondition}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-slate-555 flex items-center gap-2 font-medium">
              <Users className="w-4 h-4 text-slate-400" />
              Field Size
            </span>
            <span className="font-bold text-slate-800">
              {ride.laneCount} runners
            </span>
          </div>
        </div>
      </div>
    </ScheduleDetailFrame>
  );
}
