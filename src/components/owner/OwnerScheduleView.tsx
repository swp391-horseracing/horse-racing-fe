import { useState, useMemo } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Flag,
  Activity,
  Clock,
  Compass,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ScheduleLayout } from "../schedule/ScheduleLayout";
import { ScheduleCalendar } from "../schedule/ScheduleCalendar";
import { ScheduleDetailFrame } from "../schedule/ScheduleDetailFrame";
import type { MyRide } from "../../hooks/useJockey";

export interface OwnerScheduleViewProps {
  rides: MyRide[];
  loading: boolean;
}

type OwnerStatusFilterType = "All" | "scheduled" | "live" | "completed";

export function OwnerScheduleView({ rides, loading }: OwnerScheduleViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OwnerStatusFilterType>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const filteredRides = useMemo(() => {
    const lower = search.toLowerCase();
    return rides.filter((r: MyRide) => {
      const matchSearch =
        !lower ||
        r.name.toLowerCase().includes(lower) ||
        r.ride.toLowerCase().includes(lower);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rides, search, statusFilter]);

  const raceDays = useMemo(() => {
    return filteredRides.map((r: MyRide) => {
      const d = new Date(r.scheduledAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });
  }, [filteredRides]);

  const selectedRide =
    rides.find((r: MyRide) => r.id === selectedRideId) || null;

  if (loading)
    return (
      <div className="p-6 text-center text-slate-500">Loading Schedule...</div>
    );

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body h-full custom-scrollbar bg-[#F4F6F5]">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-headline text-[#064E3B]">
              Owner Schedule
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Upcoming races for your horses.
            </p>
          </div>
          <div className="relative w-full sm:w-72 shadow-sm rounded-xl border border-slate-200 bg-white">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search horses, tournaments..."
              className="w-full h-10 rounded-xl bg-transparent pl-10 pr-4 text-xs font-medium outline-none transition focus:border-[#064E3B] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "All", label: "All Races" },
            { key: "scheduled", label: "Scheduled" },
            { key: "live", label: "Live" },
            { key: "completed", label: "Completed" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key as OwnerStatusFilterType)}
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
      </div>

      <ScheduleLayout
        panelOpen={!!selectedRide}
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
                  ? `Schedule for ${selectedDate.toLocaleDateString()}`
                  : "All Races"}
              </span>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {filteredRides.length > 0 ? (
                filteredRides.map((ride: MyRide) => (
                  <button
                    key={ride.id}
                    onClick={() =>
                      setSelectedRideId(
                        ride.id === selectedRideId ? null : ride.id
                      )
                    }
                    className={cn(
                      "w-full p-4 text-left hover:bg-slate-50 transition flex items-center justify-between",
                      selectedRideId === ride.id &&
                        "bg-[#064E3B]/5 border-l-4 border-l-[#064E3B]"
                    )}
                  >
                    <div>
                      <p className="font-bold text-sm text-[#064E3B]">
                        {ride.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {ride.distanceMeters} • {ride.laneNumber}
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
                      {ride.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No races found.
                </div>
              )}
            </div>
          </div>
        }
        detailSlot={
          selectedRide && (
            <ScheduleDetailFrame
              title={
                <h2 className="text-2xl font-black font-headline tracking-tight leading-tight text-white">
                  {selectedRide.name}
                </h2>
              }
              subtitle={
                <div className="flex flex-wrap items-center gap-2 mt-4 font-semibold text-xs text-white/95">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold text-white">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(selectedRide.scheduledAt).toLocaleDateString(
                      navigator.language,
                      { weekday: "short", month: "short", day: "numeric" }
                    )}{" "}
                    ·{" "}
                    {new Date(selectedRide.scheduledAt).toLocaleTimeString(
                      navigator.language,
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold text-white">
                    <Clock className="w-3.5 h-3.5" />
                    Owner view
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold text-white">
                    <Compass className="w-3.5 h-3.5" />
                    {selectedRide.distanceMeters}m ·{" "}
                    {selectedRide.trackCondition}
                  </span>
                </div>
              }
              headerRight={
                <span className="px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm bg-secondary !text-secondary-foreground border-transparent">
                  {selectedRide.status}
                </span>
              }
              onClose={() => setSelectedRideId(null)}
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
                      {selectedRide.ride}
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
                      {selectedRide.horseOwner}
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
                      Lane {selectedRide.laneNumber}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      of {selectedRide.laneCount} runners
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
                    <span className="font-bold text-slate-800">
                      {selectedRide.venue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-slate-555 flex items-center gap-2 font-medium">
                      <Flag className="w-4 h-4 text-slate-400" />
                      Distance
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedRide.distanceMeters}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-slate-555 flex items-center gap-2 font-medium">
                      <Activity className="w-4 h-4 text-slate-400" />
                      Going
                    </span>
                    <span className="font-bold text-slate-800 capitalize">
                      {selectedRide.trackCondition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-slate-555 flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4 text-slate-400" />
                      Field Size
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedRide.laneCount} runners
                    </span>
                  </div>
                </div>
              </div>
            </ScheduleDetailFrame>
          )
        }
      />
    </div>
  );
}
