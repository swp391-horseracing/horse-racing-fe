import { useState, useMemo, useCallback } from "react";
import { cn } from "../../lib/utils";
import type { MyRide } from "../../hooks/useJockeyRaces";
import {
  Clock,
  Trophy,
  Activity,
  Compass,
  CalendarDays,
  Flag,
  Users,
  Search,
} from "lucide-react";

// Import Shared Abstracted Components
import { ScheduleLayout } from "../schedule/ScheduleLayout";
import { ScheduleCalendar } from "../schedule/ScheduleCalendar";
import { ScheduleStatCard } from "../schedule/ScheduleStatCard";
import {
  ScheduleDetailFrame,
  type TabConfig,
} from "../schedule/ScheduleDetailFrame";

type ComputedRideStatus = "pending" | "accepted" | "declined" | "finished";
type RideDetailTab = "info" | "runners";

interface RidingScheduleProps {
  rides: MyRide[];
  loading?: boolean;
  onAcceptRide: (id: string) => void;
  onDeclineRide: (id: string) => void;
}

const getComputedRideStatus = (ride: MyRide): ComputedRideStatus => {
  if (ride.status === "completed") return "finished";
  return ride.entryStatus;
};

const formatOrdinal = (num: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const val = num % 100;
  return num + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
};

export function RidingSchedule({
  rides,
  loading = false,
  onAcceptRide,
  onDeclineRide,
}: RidingScheduleProps) {
  const [statusFilter, setStatusFilter] = useState<"All" | ComputedRideStatus>(
    "All"
  );
  const [search, setSearch] = useState("");
  const [selectedRide, setSelectedRide] = useState<MyRide | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const counts = useMemo(
    () => ({
      All: rides.length,
      pending: rides.filter((r) => getComputedRideStatus(r) === "pending")
        .length,
      accepted: rides.filter((r) => getComputedRideStatus(r) === "accepted")
        .length,
      declined: rides.filter((r) => getComputedRideStatus(r) === "declined")
        .length,
      finished: rides.filter((r) => getComputedRideStatus(r) === "finished")
        .length,
    }),
    [rides]
  );

  const filteredRides = useMemo(() => {
    const lower = search.toLowerCase();
    return rides
      .filter((r) => {
        const matchStatus =
          statusFilter === "All" || getComputedRideStatus(r) === statusFilter;
        const matchSearch =
          !lower ||
          r.name.toLowerCase().includes(lower) ||
          r.ride.toLowerCase().includes(lower) ||
          r.venue.toLowerCase().includes(lower);
        return matchStatus && matchSearch;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [rides, statusFilter, search]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  const calendarFilteredRides = useMemo(() => {
    if (!selectedDate) return filteredRides;
    return filteredRides.filter((r) => {
      const d = new Date(r.scheduledAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}` === formattedSelectedDate;
    });
  }, [filteredRides, formattedSelectedDate, selectedDate]);

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
              My Rides
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Your confirmed race assignments and schedule overview
            </p>
          </div>
          <div className="relative w-full sm:w-72 shadow-sm rounded-xl border border-slate-200 bg-white">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search races, horses..."
              className="w-full h-10 rounded-xl bg-transparent pl-10 pr-4 text-xs font-medium outline-none transition focus:border-[#064E3B] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            ["All", "pending", "accepted", "declined", "finished"] as const
          ).map((key) => {
            const labels = {
              All: "Total",
              pending: "Pending",
              accepted: "Accepted",
              declined: "Declined",
              finished: "Finished",
            };
            return (
              <ScheduleStatCard
                key={key}
                label={labels[key]}
                value={counts[key]}
                active={statusFilter === key}
                onClick={() => setStatusFilter(key)}
                liveDot={key === "pending"}
              />
            );
          })}
        </div>
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
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              raceDays={raceDays}
            />
          }
          listSlot={
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-slate-100 bg-[#F4F6F5] px-5 py-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {selectedDate
                    ? `Schedule for ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "All Scheduled Assignments"}
                </span>
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {calendarFilteredRides.length > 0 ? (
                  calendarFilteredRides.map((ride) => (
                    <RideRow
                      key={ride.id}
                      ride={ride}
                      selected={activeSelectedRide?.id === ride.id}
                      onClick={() => handleSelectRide(ride)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    {selectedDate
                      ? "No assigned races for this day."
                      : "No assigned races found."}
                  </div>
                )}
              </div>
            </div>
          }
          detailSlot={
            activeSelectedRide && (
              <RidingScheduleDetailPanel
                ride={activeSelectedRide}
                onClose={() => setSelectedRide(null)}
                onAccept={onAcceptRide}
                onDecline={onDeclineRide}
              />
            )
          }
        />
      )}
    </div>
  );
}

// ─── Component: RidingScheduleDetailPanel ──────────────────

function RidingScheduleDetailPanel({
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
  const computedRideStatus = getComputedRideStatus(ride);
  const runners = buildMockRunnersForJockey(ride);

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
        <RideStatusBadge status={getComputedRideStatus(ride)} onDark />
      }
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "info" && (
        <>
          {computedRideStatus === "finished" && ride.ranking && (
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

          {computedRideStatus === "pending" && (
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
                {runners.map((runner, idx) => {
                  const isOurs = runner.horseName === ride.ride;
                  return (
                    <tr
                      key={idx}
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
                          {runner.cloth}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "font-bold font-headline text-base leading-snug",
                            isOurs ? "text-[#064E3B]" : "text-slate-800"
                          )}
                        >
                          {runner.horseName}
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
                            {computedRideStatus === "declined"
                              ? "— Refused —"
                              : "You"}
                          </span>
                        ) : (
                          runner.jockeyName
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isOurs ? (
                          <RideStatusBadge status={computedRideStatus} />
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
          </div>
        </div>
      )}
    </ScheduleDetailFrame>
  );
}

// ─── Helpers & Row Renderers ──────────────────────────────────────────

const getStatusBadgeStyles = (status: ComputedRideStatus) => {
  switch (status) {
    case "pending":
      return "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30";
    case "accepted":
      return "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30";
    case "declined":
      return "bg-rose-500/10 text-rose-700 border-rose-500/30";
    case "finished":
      return "bg-slate-500/10 text-slate-600 border-slate-500/30";
    default:
      return "bg-slate-100 text-slate-650 border-slate-200";
  }
};

function RideStatusBadge({
  status,
  onDark,
}: {
  status: ComputedRideStatus;
  onDark?: boolean;
}) {
  if (onDark) {
    const styles = {
      pending: "bg-[#D97706] !text-white border-transparent",
      accepted: "bg-emerald-600 !text-white border-transparent",
      declined: "bg-rose-600 !text-white border-transparent",
      finished: "bg-slate-600 !text-white border-transparent",
    };
    return (
      <span
        className={cn(
          "px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm !text-white",
          styles[status]
        )}
      >
        {status}
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
      {status}
    </span>
  );
}

function RideRow({
  ride,
  selected,
  onClick,
}: {
  ride: MyRide;
  selected: boolean;
  onClick: () => void;
}) {
  const computedStatus = getComputedRideStatus(ride);
  return (
    <button
      onClick={onClick}
      className={`group w-full flex flex-col px-4 py-3.5 text-left transition-all border-l-4 ${
        selected
          ? "bg-[#064E3B]/5 border-l-[#064E3B]"
          : computedStatus === "pending"
            ? "bg-[#EAB308]/5 border-l-[#EAB308] hover:bg-[#EAB308]/10"
            : "border-l-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`font-mono text-sm tracking-tight font-black shrink-0 ${selected ? "text-[#064E3B]" : "text-slate-400"}`}
          >
            {new Date(ride.scheduledAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <div className="truncate">
            <p
              className={`font-bold font-headline text-sm truncate ${selected ? "text-[#064E3B]" : "text-slate-800"}`}
            >
              {ride.name}
            </p>
            <p className="text-[10px] text-slate-555 mt-0.5 truncate font-medium">
              Ride:{" "}
              <span className="text-slate-700 font-bold">{ride.ride}</span> •
              Gate {ride.laneNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pl-3">
          <RideStatusBadge status={computedStatus} />
        </div>
      </div>
    </button>
  );
}

const buildMockRunnersForJockey = (selectedRide: MyRide) => {
  const sampleRunners = [
    { cloth: 1, horseName: "Northern Star", jockeyName: "D. Patel" },
    { cloth: 2, horseName: "Silver Drift", jockeyName: "M. Larsson" },
    { cloth: 3, horseName: "Iron Cascade", jockeyName: "C. Nguyen" },
    { cloth: 4, horseName: "Desert Wind", jockeyName: "R. Santos" },
    { cloth: 5, horseName: "Dark Current", jockeyName: "T. Evans" },
    { cloth: 6, horseName: "Golden Shore", jockeyName: "A. Kim" },
  ];
  const ours = {
    cloth: selectedRide.laneNumber,
    horseName: selectedRide.ride,
    jockeyName: "You (Pro Jockey)",
  };
  return [
    ...sampleRunners.filter((r) => r.cloth !== selectedRide.laneNumber),
    ours,
  ].sort((a, b) => a.cloth - b.cloth);
};
