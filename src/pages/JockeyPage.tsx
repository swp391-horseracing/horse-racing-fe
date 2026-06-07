import { useState, useMemo, useCallback } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { useHorseList } from "../hooks/useHorseList.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import type { Horse } from "../types/horse.ts";
import type { Invitation, InvStatus } from "../services/invitationService.ts";

import {
  Calendar as CalendarIcon,
  Mail,
  ChessKnight,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  TrendingUp,
  Award,
  ShieldAlert,
  Search,
  Activity,
  Lock,
  Compass,
  CalendarDays,
  Flag,
  Users,
} from "lucide-react";

// Import Shared Abstracted Components
import { ScheduleLayout } from "../components/schedule/ScheduleLayout";
import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar";
import { ScheduleStatCard } from "../components/schedule/ScheduleStatCard";
import { ScheduleDetailFrame, type TabConfig } from "../components/schedule/ScheduleDetailFrame";

type FilterType = "All" | InvStatus;
type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

type MyRide = {
  id: string;
  tournamentId: string;
  name: string;
  roundName: string;
  distanceMeters: number;
  scheduledAt: string;
  venue: string;
  status: "scheduled" | "live" | "completed";
  ride: string;
  laneNumber: number;
  entryStatus: "pending" | "accepted" | "declined";
  confirmedAt: string | null;
  horseOwner: string;
  horsesId: string;
  ownerId: string;
  trackCondition: string;
  laneCount: number;
  ranking?: number;
};

type ComputedRideStatus = "pending" | "accepted" | "declined" | "finished";
type RideDetailTab = "info" | "runners";

const getComputedRideStatus = (ride: MyRide): ComputedRideStatus => {
  if (ride.status === "completed") return "finished";
  return ride.entryStatus;
};

const formatOrdinal = (num: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const val = num % 100;
  return num + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
};

const myRidesMock: MyRide[] = [
  {
    id: "f54f8b4a-0b45-4290-a8e1-de910bae8b91",
    tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d05",
    name: "Race 20 - stormy",
    roundName: "Qualifier",
    distanceMeters: 1000,
    scheduledAt: "2026-06-08T18:00:13.393Z",
    venue: "North Dorthafield",
    status: "scheduled",
    ride: "Horse-35-tempting",
    laneNumber: 1,
    entryStatus: "pending",
    confirmedAt: null,
    horseOwner: "Owner 3 Hansen",
    horsesId: "18f5e46e-f61f-4bda-8192-669300c4454c",
    ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051b",
    trackCondition: "wet",
    laneCount: 8,
  },
  {
    id: "f54f8b4a-0b45-4290-a8e1-de910bae8b92",
    tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d05",
    name: "Race 21 - breezy",
    roundName: "Qualifier",
    distanceMeters: 1600,
    scheduledAt: "2026-06-08T20:30:00.000Z",
    venue: "South Dorthafield",
    status: "scheduled",
    ride: "Silver Flash",
    laneNumber: 4,
    entryStatus: "accepted",
    confirmedAt: "2026-06-01T10:00:00.000Z",
    horseOwner: "Owner 1 Smith",
    horsesId: "18f5e46e-f61f-4bda-8192-669300c4454d",
    ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051c",
    trackCondition: "good",
    laneCount: 12,
  },
  {
    id: "f54f8b4a-0b45-4290-a8e1-de910bae8b93",
    tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d06",
    name: "Summer Cup - Finals",
    roundName: "Finals",
    distanceMeters: 2000,
    scheduledAt: "2026-06-15T16:00:00.000Z",
    venue: "West Arena",
    status: "completed",
    ride: "Thunder Bolt",
    laneNumber: 2,
    entryStatus: "accepted",
    confirmedAt: "2026-06-05T09:00:00.000Z",
    horseOwner: "Owner 2 Doe",
    horsesId: "18f5e46e-f61f-4bda-8192-669300c4454e",
    ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051d",
    trackCondition: "fast",
    laneCount: 10,
    ranking: 3,
  },
  {
    id: "f54f8b4a-0b45-4290-a8e1-de910bae8b94",
    tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d07",
    name: "Night Derby",
    roundName: "Group Stage",
    distanceMeters: 1200,
    scheduledAt: "2026-06-09T19:00:00.000Z",
    venue: "East Track",
    status: "scheduled",
    ride: "Dark Phantom",
    laneNumber: 7,
    entryStatus: "declined",
    confirmedAt: null,
    horseOwner: "Owner 4 Lee",
    horsesId: "18f5e46e-f61f-4bda-8192-669300c4454f",
    ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051e",
    trackCondition: "muddy",
    laneCount: 8,
  },
];

const officialsMock = [
  { initials: "AJ", name: "Arthur Jones", title: "Chief Steward" },
  { initials: "SB", name: "Sarah Baxter", title: "Starter" },
  { initials: "MT", name: "Mark Thompson", title: "Judge" },
];

const Icons = {
  Calendar: () => <CalendarIcon className="w-4 h-4 text-current" />,
  Mail: () => <Mail className="w-4 h-4 text-current" />,
  Horse: () => <ChessKnight className="w-5 h-5 text-current" />,
  Clock: () => <Clock className="w-4 h-4 text-current" />,
  CheckCircle: () => <CheckCircle className="w-4 h-4 text-current" />,
  XCircle: () => <XCircle className="w-4 h-4 text-current" />,
  Trophy: () => <Trophy className="w-5 h-5 text-current" />,
  TrendingUp: () => <TrendingUp className="w-5 h-5 text-current" />,
  Award: () => <Award className="w-5 h-5 text-current" />,
  ShieldAlert: () => <ShieldAlert className="w-4 h-4 text-current" />,
  Search: () => <Search className="w-4 h-4 text-current" />,
  Activity: () => <Activity className="w-4 h-4 text-current" />,
  Lock: () => <Lock className="w-5 h-5 text-current" />,
  Compass: () => <Compass className="w-4 h-4 text-current" />,
};

const statusConfig: Record<
  InvStatus,
  {
    color: string;
    bg: string;
    border: string;
    Icon: React.ElementType;
    label: string;
  }
> = {
  Pending: { color: "text-[#D97706]", bg: "bg-[#D97706]/10", border: "border-[#D97706]/20", Icon: Icons.Clock, label: "Pending" },
  Accepted: { color: "text-[#064E3B]", bg: "bg-[#064E3B]/10", border: "border-[#064E3B]/20", Icon: Icons.CheckCircle, label: "Accepted" },
  Declined: { color: "text-rose-700", bg: "bg-rose-500/10", border: "border-rose-500/20", Icon: Icons.XCircle, label: "Declined" },
  Expired: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", Icon: Icons.Clock, label: "Expired" },
  Cancelled: { color: "text-slate-505", bg: "bg-slate-500/10", border: "border-slate-500/20", Icon: Icons.XCircle, label: "Cancelled" },
  Superseded: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", Icon: Icons.XCircle, label: "Superseded" },
};

export default function JockeyPage() {
  const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rides, setRides] = useState<MyRide[]>(myRidesMock);

  const { horseList } = useHorseList();
  const { invitations, updateInvitationStatus } = useInvitations();

  const [selectedInvId, setSelectedInvId] = useState<number | null>(1);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAcceptInvitation = (id: number) => {
    const target = invitations.find((inv) => inv.id === id);
    updateInvitationStatus(id, "Accepted");
    addToast(
      `Response recorded successfully! Tentatively registered to ride ${target?.horse}. Awaiting final Owner confirmation.`,
      "success"
    );
  };

  const handleDeclineInvitation = (id: number) => {
    const target = invitations.find((inv) => inv.id === id);
    updateInvitationStatus(id, "Declined");
    addToast(`You declined the invitation to ride ${target?.horse}. Deep access revoked.`, "info");
  };

  const handleAcceptRide = (id: string) => {
    setRides((prev) => prev.map((r) => (r.id === id ? { ...r, entryStatus: "accepted" as const } : r)));
    const target = rides.find((r) => r.id === id);
    addToast(`Response recorded! Tentatively registered to ride ${target?.ride}. Awaiting final Owner confirmation.`, "success");
  };

  const handleDeclineRide = (id: string) => {
    setRides((prev) => prev.map((r) => (r.id === id ? { ...r, entryStatus: "declined" as const } : r)));
    const target = rides.find((r) => r.id === id);
    addToast(`You declined the invitation to ride ${target?.ride}.`, "info");
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.JOCKEY_DASHBOARD:
        return <DashboardOverview data={invitations} setActiveTab={(tab) => setActive(tab)} horseList={horseList} />;
      case ROUTES.JOCKEY_SCHEDULE:
        return <RidingSchedule rides={rides} onAcceptRide={handleAcceptRide} onDeclineRide={handleDeclineRide} />;
      case ROUTES.JOCKEY_INVITATIONS:
        return (
          <InvitationsView
            data={invitations}
            selectedId={selectedInvId}
            setSelectedId={setSelectedInvId}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        {/* Floating Toasts container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none font-body">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 pointer-events-auto transform animate-in slide-in-from-top duration-300",
                t.type === "success" && "bg-emerald-50 border-emerald-300 text-emerald-900",
                t.type === "error" && "bg-rose-50 border-rose-300 text-rose-900",
                t.type === "warning" && "bg-amber-50 border-amber-300 text-amber-900",
                t.type === "info" && "bg-indigo-50 border-indigo-300 text-indigo-900"
              )}
            >
              <span className={cn("mt-0.5 shrink-0", t.type === "success" && "text-emerald-700", t.type === "error" && "text-rose-700", t.type === "warning" && "text-amber-700", t.type === "info" && "text-indigo-700")}>
                {t.type === "success" && <Icons.CheckCircle />}
                {t.type === "error" && <Icons.XCircle />}
                {t.type === "warning" && <Icons.ShieldAlert />}
                {t.type === "info" && <Icons.Activity />}
              </span>
              <div className="flex-1 text-xs font-semibold">{t.message}</div>
            </div>
          ))}
        </div>

        {renderContent()}
      </div>
    </UserLayout>
  );
}

// ─── Component 1: DashboardOverview ──────────────────────────────────────────

function DashboardOverview({
  data,
  setActiveTab,
  horseList,
}: {
  data: Invitation[];
  setActiveTab: (k: string) => void;
  horseList: Horse[];
}) {
  const pendingInvites = data.filter((inv) => inv.status === "Pending");
  const activeRaces = data.filter((inv) => inv.status === "Accepted");

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto font-body h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]"><Icons.Trophy /></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-555 font-bold text-xs tracking-wider uppercase">Jockey Win Rate</span>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]"><Icons.Trophy /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">33.3%</span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">▲ +2.4%</span>
          </div>
          <p className="text-xs text-slate-555 mt-2 font-body font-medium">Ranked #14 of 120 Pro Jockeys</p>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#D97706]"><Icons.TrendingUp /></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-555 font-bold text-xs tracking-wider uppercase">Total Earnings</span>
            <span className="p-2 rounded-xl bg-[#D97706]/10 text-[#D97706]"><Icons.TrendingUp /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">$142,500</span>
            <span className="text-xs text-slate-500 font-semibold font-body">(70% Owner split)</span>
          </div>
          <p className="text-xs text-slate-505 mt-2 font-body font-medium">84 Career Turf Starts (28 Wins, 18 Seconds)</p>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]"><Icons.Mail /></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-555 font-bold text-xs tracking-wider uppercase">Ride Invitations</span>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]"><Icons.Mail /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">{pendingInvites.length} Pending</span>
            {pendingInvites.length > 0 && <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-[#D97706]"></span>}
          </div>
          <p className="text-xs text-[#D97706] font-bold mt-2 hover:underline cursor-pointer" onClick={() => setActiveTab(ROUTES.JOCKEY_INVITATIONS)}>
            Inspect pending owner offers →
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#064E3B]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold font-headline text-lg text-[#064E3B]">Win Rate Performance Trend</h3>
              <p className="text-xs text-slate-555 font-medium">Turf win percentages for the past 5 months</p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20">2026 Season</span>
            </div>
          </div>

          <div className="h-64 relative flex flex-col justify-between">
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
              {[75, 50, 25, 0].map((val) => (
                <div key={val} className="border-t border-slate-100 text-[9px] font-label text-slate-400 pt-1 flex items-start">{val}%</div>
              ))}
            </div>
            <div className="w-full h-48 mt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#064E3B" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 40,180 L 40,150 Q 160,130 280,95 T 520,40 L 520,180 Z" fill="url(#chartGradient)" />
                <path d="M 40,150 Q 160,130 280,95 T 520,40" fill="none" stroke="#064E3B" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="40" cy="150" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                <circle cx="160" cy="130" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                <circle cx="280" cy="95" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                <circle cx="400" cy="68" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                <circle cx="520" cy="40" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="flex justify-between text-xs text-slate-505 font-bold px-4">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May (Now)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-md font-headline text-[#064E3B] flex items-center gap-2">
                <span className="text-[#D97706]"><Icons.Award /></span> Registry Standings
              </h3>
              <span className="text-[9px] font-label text-slate-400 font-bold uppercase font-semibold">Performance</span>
            </div>

            <div className="space-y-2.5">
              {horseList.map((horse, idx) => (
                <div key={horse.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-black w-5 text-center block font-label text-slate-400">#{idx + 1}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate text-slate-700 font-semibold">{horse.name}</span>
                      <span className="text-[10px] text-slate-455 truncate">{horse.breed} • {horse.gender}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#064E3B] font-label block">{horse.performance}</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">{horse.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold font-headline text-[#064E3B] text-md flex items-center gap-2">
              <span className="text-[#064E3B]"><Icons.Calendar /></span> Your Confirmed Agenda
            </h3>
            <span className="rounded bg-[#064E3B]/10 text-[#064E3B] font-bold px-2.5 py-0.5 text-[9px] uppercase border border-[#064E3B]/20 font-label">{activeRaces.length} Confirmed</span>
          </div>

          <div className="space-y-3">
            {activeRaces.length === 0 ? (
              <div className="text-center py-8 text-slate-455 text-xs">No confirmed active races. Navigate to "Invitations" to accept incoming offers.</div>
            ) : (
              activeRaces.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-[#F4F6F5]/40 flex items-center justify-between gap-4 shadow-sm hover:border-[#064E3B]/10 duration-200">
                  <div>
                    <p className="font-bold text-[#064E3B] text-sm font-headline">{r.horse}</p>
                    <p className="text-xs text-slate-555 font-medium mt-0.5">{r.tournament}</p>
                    <span className="text-[10px] text-[#D97706] font-bold mt-1 block">Owner: {r.owner}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[9px] bg-slate-150 border border-slate-200 text-slate-655 font-black px-2 py-0.5 rounded-full mb-1 font-label">Gate 5 • Turf</span>
                    <p className="text-xs text-slate-600 font-black font-label">{r.raceTime}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component 2: RidingSchedule ───────────────────────────────────────────────

interface RidingScheduleProps {
  rides: MyRide[];
  onAcceptRide: (id: string) => void;
  onDeclineRide: (id: string) => void;
}

function RidingSchedule({
  rides,
  onAcceptRide,
  onDeclineRide,
}: RidingScheduleProps) {
  const [statusFilter, setStatusFilter] = useState<"All" | ComputedRideStatus>("All");
  const [search, setSearch] = useState("");
  const [selectedRide, setSelectedRide] = useState<MyRide | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const counts = useMemo(() => ({
    All: rides.length,
    pending: rides.filter((r) => getComputedRideStatus(r) === "pending").length,
    accepted: rides.filter((r) => getComputedRideStatus(r) === "accepted").length,
    declined: rides.filter((r) => getComputedRideStatus(r) === "declined").length,
    finished: rides.filter((r) => getComputedRideStatus(r) === "finished").length,
  }), [rides]);

  const filteredRides = useMemo(() => {
    const lower = search.toLowerCase();
    return rides.filter((r) => {
      const matchStatus = statusFilter === "All" || getComputedRideStatus(r) === statusFilter;
      const matchSearch = !lower || r.name.toLowerCase().includes(lower) || r.ride.toLowerCase().includes(lower) || r.venue.toLowerCase().includes(lower);
      return matchStatus && matchSearch;
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
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
            <h2 className="text-xl font-bold font-headline text-[#064E3B]">My Rides</h2>
            <p className="text-xs text-slate-555 font-semibold mt-1">Your confirmed race assignments and schedule overview</p>
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
          {(["All", "pending", "accepted", "declined", "finished"] as const).map((key) => {
            const labels = { All: "Total", pending: "Pending", accepted: "Accepted", declined: "Declined", finished: "Finished" };
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

      <ScheduleLayout
        panelOpen={panelOpen}
        calendarSlot={
          <ScheduleCalendar selectedDate={selectedDate} onSelect={setSelectedDate} raceDays={raceDays} />
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
                  {selectedDate ? "No assigned races for this day." : "No assigned races found."}
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
    </div>
  );
}

// ─── Component 2.5: RidingScheduleDetailPanel (Tabbed View) ──────────────────

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
    { key: "runners", label: "Runner Line-up", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <ScheduleDetailFrame
      title={<h2 className="text-2xl font-black font-headline tracking-tight leading-tight text-white">{ride.name}</h2>}
      subtitle={
        <div className="flex flex-wrap items-center gap-2 mt-4 font-semibold text-xs text-white">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 font-bold">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date(ride.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {new Date(ride.scheduledAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
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
      headerRight={<RideStatusBadge status={getComputedRideStatus(ride)} onDark />}
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Tab: Race Info */}
      {activeTab === "info" && (
        <>
          {computedRideStatus === "finished" && ride.ranking && (
            <div className="bg-gradient-to-r from-[#EAB308]/20 to-[#EAB308]/5 border border-[#EAB308]/40 rounded-xl p-5 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAB308] text-[#064E3B] font-black border border-[#EAB308]/20 shadow-md">
                  <Trophy className="w-6 h-6 text-[#064E3B]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D97706] block">Race Result</span>
                  <span className="text-lg font-black font-headline text-[#064E3B] block">Official Finish: {formatOrdinal(ride.ranking)} Place</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#064E3B] bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">Verified</span>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">Your Assignment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Horse</span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">{ride.ride}</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Grey · 5yo · Male</span>
              </div>
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Lane Draw</span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">Lane {ride.laneNumber}</span>
                <span className="text-xs text-slate-500 mt-0.5 block">of {ride.laneCount} runners</span>
              </div>
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Owner</span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">{ride.horseOwner}</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Juddmonte Farms</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3 block">Race Conditions</h3>
            <div className="bg-white border border-[#064E3B]/10 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-slate-555 flex items-center gap-2 font-medium">
                    <Compass className="w-4 h-4 text-slate-400" /> Distance
                  </span>
                  <span className="font-bold text-slate-800">{ride.distanceMeters}m</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-slate-555 flex items-center gap-2 font-medium">
                    <Activity className="w-4 h-4 text-slate-400" /> Going
                  </span>
                  <span className="font-bold text-slate-800 capitalize">{ride.trackCondition}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-slate-555 flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4 text-slate-400" /> Field Size
                  </span>
                  <span className="font-bold text-slate-800">{ride.laneCount} runners</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3.5 block">Racing Officials Board</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officialsMock.map((o) => (
                <div key={o.initials} className="flex items-center gap-3.5 rounded-xl border border-[#064E3B]/10 p-3.5 bg-[#F4F6F5]/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm bg-white text-[#064E3B] text-xs font-black border border-[#064E3B]/10">
                    {o.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black font-headline text-slate-800 truncate leading-tight">{o.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate leading-tight mt-1">{o.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {computedRideStatus === "pending" && (
            <div className="bg-white border-2 border-[#D97706]/20 rounded-xl p-5 shadow-md">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D97706] mb-3 block">Invitation Status</h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-800 block">Invited by {ride.horseOwner}</span>
                  <span className="text-xs text-slate-555 mt-0.5 block">Received recently · Pending response</span>
                </div>
                <div className="flex gap-2.5 shrink-0">
                  <button onClick={() => onAccept(ride.id)} className="rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] px-5 py-2.5 text-xs font-black shadow-sm transition active:scale-95 duration-200">
                    ✓ Accept Invitation
                  </button>
                  <button onClick={() => onDecline(ride.id)} className="rounded-xl border border-slate-200 bg-white text-slate-655 hover:bg-slate-50 px-5 py-2.5 text-xs font-black transition active:scale-95 duration-200">
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab: Runners List */}
      {activeTab === "runners" && (
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">Confirmed Runner Line-up</h3>
          <div className="overflow-hidden rounded-xl border border-[#064E3B]/10 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#F4F6F5] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">Gate</th>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Horse</th>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Jockey</th>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {runners.map((runner, idx) => {
                  const isOurs = runner.horseName === ride.ride;
                  return (
                    <tr key={idx} className={cn("transition-colors", isOurs ? "bg-[#064E3B]/5 font-semibold" : "hover:bg-slate-50/50")}>
                      <td className="px-5 py-3.5 text-center">
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md border text-xs font-black mx-auto shadow-sm", isOurs ? "bg-[#064E3B] text-white border-[#064E3B]" : "bg-white text-slate-700 border-slate-200")}>
                          {runner.cloth}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("font-bold font-headline text-base leading-snug", isOurs ? "text-[#064E3B]" : "text-slate-800")}>{runner.horseName}</span>
                        {isOurs && <span className="ml-2 text-[9px] font-black uppercase bg-[#064E3B]/10 text-[#064E3B] px-1.5 py-0.5 rounded">Your Ride</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">
                        {isOurs ? <span className="text-[#064E3B] font-bold">{computedRideStatus === "declined" ? "— Refused —" : "You"}</span> : runner.jockeyName}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isOurs ? <RideStatusBadge status={computedRideStatus} /> : <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-700">Confirmed</span>}
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

// ─── Riding Schedule Helper Components ──────────────────────────────────────────

const getStatusBadgeStyles = (status: ComputedRideStatus) => {
  switch (status) {
    case "pending": return "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30";
    case "accepted": return "bg-[#064E3B]/10 text-[#064E3B] border-[#064E3B]/30";
    case "declined": return "bg-rose-500/10 text-rose-700 border-rose-500/30";
    case "finished": return "bg-slate-500/10 text-slate-600 border-slate-500/30";
    default: return "bg-slate-100 text-slate-650 border-slate-200";
  }
};

function RideStatusBadge({ status, onDark }: { status: ComputedRideStatus; onDark?: boolean }) {
  if (onDark) {
    const styles = {
      pending: "bg-[#D97706] !text-white border-transparent",
      accepted: "bg-emerald-600 !text-white border-transparent",
      declined: "bg-rose-600 !text-white border-transparent",
      finished: "bg-slate-600 !text-white border-transparent",
    };
    return (
      <span className={cn("px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm !text-white", styles[status])}>
        {status}
      </span>
    );
  }
  return <span className={cn("px-2.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border shadow-sm", getStatusBadgeStyles(status))}>{status}</span>;
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
        selected ? "bg-[#064E3B]/5 border-l-[#064E3B]" : computedStatus === "pending" ? "bg-[#EAB308]/5 border-l-[#EAB308] hover:bg-[#EAB308]/10" : "border-l-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`font-mono text-sm tracking-tight font-black shrink-0 ${selected ? "text-[#064E3B]" : "text-slate-400"}`}>
            {new Date(ride.scheduledAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="truncate">
            <p className={`font-bold font-headline text-sm truncate ${selected ? "text-[#064E3B]" : "text-slate-800"}`}>{ride.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">Ride: <span className="text-slate-700 font-bold">{ride.ride}</span> • Gate {ride.laneNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 pl-3"><RideStatusBadge status={computedStatus} /></div>
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
  const ours = { cloth: selectedRide.laneNumber, horseName: selectedRide.ride, jockeyName: "You (Pro Jockey)" };
  return [...sampleRunners.filter((r) => r.cloth !== selectedRide.laneNumber), ours].sort((a, b) => a.cloth - b.cloth);
};

// ─── Component 3: InvitationsView ───────────────────────────────────────────────

function InvitationsView({
  data,
  selectedId,
  setSelectedId,
  onAccept,
  onDecline,
}: {
  data: Invitation[];
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}) {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");

  const filters: FilterType[] = ["All", "Pending", "Accepted", "Declined", "Expired"];

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchesFilter = filter === "All" || item.status === filter;
      const matchesSearch = item.horse.toLowerCase().includes(search.toLowerCase()) || item.tournament.toLowerCase().includes(search.toLowerCase()) || item.owner.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [data, filter, search]);

  const selectedInv = data.find((i) => i.id === selectedId) ?? null;
  const pendingInvites = data.filter((i) => i.status === "Pending");

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden font-body">
      <div className="w-96 shrink-0 border-r border-[#064E3B]/10 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-headline text-[#064E3B] text-lg">Inbound Offers</h2>
            {pendingInvites.length > 0 && <span className="rounded bg-[#EAB308]/20 text-[#D97706] font-bold px-2.5 py-0.5 text-[9px] uppercase border border-[#EAB308]/30">{pendingInvites.length} Pending</span>}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Icons.Search /></span>
            <input type="text" placeholder="Search horse..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#F4F6F5]/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none" />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap", filter === f ? "bg-[#064E3B] text-white" : "bg-[#F4F6F5] text-slate-555")}>{f}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
              <span className="h-10 w-10 opacity-30 text-[#064E3B]"><Icons.Mail /></span>
              <p className="font-bold">No invitations found</p>
            </div>
          ) : (
            filtered.map((inv) => {
              const cfg = statusConfig[inv.status];
              const StatusIcon = cfg.Icon;
              const isPending = inv.status === "Pending";
              return (
                <div key={inv.id} onClick={() => setSelectedId(inv.id)} className={cn("relative group flex items-start gap-3 rounded-2xl border p-4 cursor-pointer", selectedId === inv.id ? "border-[#064E3B] bg-[#064E3B]/5" : "border-slate-200 bg-white")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="font-bold font-headline text-[#064E3B] truncate text-sm">{inv.horse}</p>
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase shrink-0", cfg.color, cfg.bg, cfg.border)}>
                        <StatusIcon /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-555 font-semibold truncate">{inv.tournament}</p>
                    {isPending && <div className="mt-1.5"><span className="text-[8px] text-[#D97706] font-black bg-[#EAB308]/10 px-2 py-0.5 rounded border border-[#EAB308]/20 uppercase">🔓 DEEP ACCESS ACTIVE</span></div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 h-full overflow-hidden bg-[#F4F6F5]/30">
        <InvitationDetail inv={selectedInv} onAccept={onAccept} onDecline={onDecline} />
      </div>
    </div>
  );
}

// ─── Component 4: InvitationDetail ───────────────────────────────────────────────

function InvitationDetail({
  inv,
  onAccept,
  onDecline,
}: {
  inv: Invitation | null;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}) {
  if (!inv) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-4 p-8">
        <span className="h-16 w-16 opacity-30 text-[#064E3B]"><Icons.Mail /></span>
        <h3 className="font-bold">No Offer Selected</h3>
      </div>
    );
  }

  const cfg = statusConfig[inv.status];
  const StatusIcon = cfg.Icon;
  const isPending = inv.status === "Pending";

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
        <div>
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">{inv.horse}</h2>
          <p className="text-xs font-semibold text-slate-555">{inv.tournament}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase", cfg.color, cfg.bg, cfg.border)}>
          <StatusIcon /> {cfg.label}
        </span>
      </div>

      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Owner</p>
            <p className="text-sm font-semibold text-slate-800">{inv.owner}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Race Time</p>
            <p className="text-sm font-semibold text-slate-800">{inv.raceTime}</p>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="bg-gradient-to-tr from-[#064E3B]/5 to-[#EAB308]/5 border border-[#064E3B]/20 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold font-headline uppercase text-[#064E3B]">🔓 Private Health Metrics (Deep Access)</h3>
          <p className="text-xs text-slate-555 italic mt-3">"{(inv as any).medicalLogs?.trainerNotes || "Horse is looking strong in the final furlong. Responds well."}"</p>
        </div>
      ) : (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-455 mx-auto">
            <Icons.Lock />
          </div>
          <h3 className="font-bold text-md text-[#064E3B] mt-2">🔒 Private Records Locked</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">Deep Access is revoked for completed or non-pending offers.</p>
        </div>
      )}

      {isPending && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex gap-4">
            <button onClick={() => onAccept(inv.id)} className="flex-1 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] py-3.5 text-xs font-bold transition">Accept Invitation</button>
            <button onClick={() => onDecline(inv.id)} className="flex-1 border border-slate-200 bg-[#F4F6F5] text-slate-655 hover:bg-slate-100 py-3.5 text-xs font-bold transition">Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}