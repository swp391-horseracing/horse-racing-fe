// src/pages/JockeyPage.tsx
import { useState, useMemo } from "react";
import UserLayout from "../layouts/UserLayout"; // Adjust import path as needed
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { useHorseList } from "../hooks/useHorseList.ts";
import { useEvent } from "../hooks/useEvent.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import type { Horse } from "../types/horse.ts";
import type { CalendarEvent } from "../types/event.ts";
import type { Invitation, InvStatus } from "../services/invitationService.ts";
import {
  Calendar,
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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = "All" | InvStatus;
type ToastType = "success" | "error" | "warning" | "info";
type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const Icons = {
  Calendar: () => <Calendar className="w-4 h-4 text-current" />,
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

// ─── Status Config ────────────────────────────────────────────────────────────

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
  Pending: {
    color: "text-[#D97706]",
    bg: "bg-[#D97706]/10",
    border: "border-[#D97706]/20",
    Icon: Icons.Clock,
    label: "Pending",
  },
  Accepted: {
    color: "text-[#064E3B]",
    bg: "bg-[#064E3B]/10",
    border: "border-[#064E3B]/20",
    Icon: Icons.CheckCircle,
    label: "Accepted",
  },
  Declined: {
    color: "text-rose-700",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    Icon: Icons.XCircle,
    label: "Declined",
  },
  Expired: {
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    Icon: Icons.Clock,
    label: "Expired",
  },
  Cancelled: {
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    Icon: Icons.XCircle,
    label: "Cancelled",
  },
  Superseded: {
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    Icon: Icons.XCircle,
    label: "Superseded",
  },
};

export default function JockeyPage() {
  const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Shared hooks data
  const { horseList } = useHorseList();
  const { eventList } = useEvent();
  const { invitations, updateInvitationStatus } = useInvitations();

  const [selectedInvId, setSelectedInvId] = useState<number | null>(1);

  // Toast triggers
  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Actions handlers
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
    addToast(
      `You declined the invitation to ride ${target?.horse}. Deep access revoked.`,
      "info"
    );
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.JOCKEY_DASHBOARD:
        return (
          <DashboardOverview
            data={invitations}
            setActiveTab={(tab) => setActive(tab)}
            horseList={horseList}
          />
        );
      case ROUTES.JOCKEY_SCHEDULE:
        return <RidingSchedule data={invitations} eventList={eventList} />;
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
      {/* Direct structural container to lock scroll mechanics */}
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        {/* Floating Toasts container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none font-body">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 pointer-events-auto transform animate-in slide-in-from-top duration-300",
                t.type === "success" &&
                  "bg-emerald-50 border-emerald-300 text-emerald-900",
                t.type === "error" &&
                  "bg-rose-50 border-rose-300 text-rose-900",
                t.type === "warning" &&
                  "bg-amber-50 border-amber-300 text-amber-900",
                t.type === "info" &&
                  "bg-indigo-50 border-indigo-300 text-indigo-900"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 shrink-0",
                  t.type === "success" && "text-emerald-700",
                  t.type === "error" && "text-rose-700",
                  t.type === "warning" && "text-amber-700",
                  t.type === "info" && "text-indigo-700"
                )}
              >
                {t.type === "success" && <Icons.CheckCircle />}
                {t.type === "error" && <Icons.XCircle />}
                {t.type === "warning" && <Icons.ShieldAlert />}
                {t.type === "info" && <Icons.Activity />}
              </span>
              <div className="flex-1 text-xs font-semibold">{t.message}</div>
            </div>
          ))}
        </div>

        {/* Inner Content Component */}
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
      {/* Welcoming Dashboard Grid Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats 1: Win Rate */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
            <Icons.Trophy />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">
              Jockey Win Rate
            </span>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Icons.Trophy />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
              33.3%
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
              ▲ +2.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-body font-medium">
            Ranked #14 of 120 Pro Jockeys
          </p>
        </div>

        {/* Stats 2: Total Earnings */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#D97706]">
            <Icons.TrendingUp />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">
              Total Earnings
            </span>
            <span className="p-2 rounded-xl bg-[#D97706]/10 text-[#D97706]">
              <Icons.TrendingUp />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
              $142,500
            </span>
            <span className="text-xs text-slate-500 font-semibold font-body">
              (70% Owner split)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-body font-medium">
            84 Career Turf Starts (28 Wins, 18 Seconds)
          </p>
        </div>

        {/* Stats 3: Inbound Invites */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
            <Icons.Mail />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">
              Ride Invitations
            </span>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Icons.Mail />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
              {pendingInvites.length} Pending
            </span>
            {pendingInvites.length > 0 && (
              <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-[#D97706]"></span>
            )}
          </div>
          <p
            className="text-xs text-[#D97706] font-bold mt-2 hover:underline cursor-pointer"
            onClick={() => setActiveTab(ROUTES.JOCKEY_INVITATIONS)}
          >
            Inspect pending owner offers →
          </p>
        </div>
      </div>

      {/* Performance Graphs / Charts Mock and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart - pure CSS & SVG representation of Win Rate per month */}
        <div className="lg:col-span-2 bg-white border border-[#064E3B]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold font-headline text-lg text-[#064E3B]">
                Win Rate Performance Trend
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Turf win percentages for the past 5 months
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20">
                2026 Season
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="h-64 relative flex flex-col justify-between">
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
              {[75, 50, 25, 0].map((val) => (
                <div
                  key={val}
                  className="border-t border-slate-100 text-[9px] font-label text-slate-400 pt-1 flex items-start"
                >
                  {val}%
                </div>
              ))}
            </div>

            <div className="w-full h-48 mt-4 relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 600 200"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#064E3B" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 40,180 L 40,150 Q 160,130 280,95 T 520,40 L 520,180 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 40,150 Q 160,130 280,95 T 520,40"
                  fill="none"
                  stroke="#064E3B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="40"
                  cy="150"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="160"
                  cy="130"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="280"
                  cy="95"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="400"
                  cy="68"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="520"
                  cy="40"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            <div className="flex justify-between text-xs text-slate-500 font-bold px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (Now)</span>
            </div>
          </div>
        </div>

        {/* Regional Standings */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-md font-headline text-[#064E3B] flex items-center gap-2">
                <span className="text-[#D97706]">
                  <Icons.Award />
                </span>
                Registry Standings
              </h3>
              <span className="text-[9px] font-label text-slate-400 font-bold uppercase">
                Performance
              </span>
            </div>

            <div className="space-y-2.5">
              {horseList.map((horse, idx) => (
                <div
                  key={horse.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-black w-5 text-center block font-label text-slate-400">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate text-slate-700 font-semibold">
                        {horse.name}
                      </span>
                      <span className="text-[10px] text-slate-450 truncate">
                        {horse.breed} • {horse.gender}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#064E3B] font-label block">
                      ${horse.earnings.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      {horse.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Riding Matches */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold font-headline text-[#064E3B] text-md flex items-center gap-2">
              <span className="text-[#064E3B]">
                <Icons.Calendar />
              </span>
              Your Confirmed Agenda
            </h3>
            <span className="rounded bg-[#064E3B]/10 text-[#064E3B] font-bold px-2 py-0.5 text-[9px] uppercase border border-[#064E3B]/20 font-label">
              {activeRaces.length} Confirmed
            </span>
          </div>

          <div className="space-y-3">
            {activeRaces.length === 0 ? (
              <div className="text-center py-8 text-slate-450 text-xs">
                No confirmed active races. Navigate to "Invitations" to accept
                incoming offers.
              </div>
            ) : (
              activeRaces.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-[#F4F6F5]/40 flex items-center justify-between gap-4 shadow-sm hover:border-[#064E3B]/10 duration-200"
                >
                  <div>
                    <p className="font-bold text-[#064E3B] text-sm font-headline">
                      {r.horse}
                    </p>
                    <p className="text-xs text-slate-555 font-medium mt-0.5">
                      {r.tournament}
                    </p>
                    <span className="text-[10px] text-[#D97706] font-bold mt-1 block">
                      Owner: {r.owner}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[9px] bg-slate-150 border border-slate-200 text-slate-650 font-black px-2 py-0.5 rounded-full mb-1 font-label">
                      Gate 5 • Turf
                    </span>
                    <p className="text-xs text-slate-600 font-black font-label">
                      {r.raceTime}
                    </p>
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

function RidingSchedule({
  data,
  eventList,
}: {
  data: Invitation[];
  eventList: CalendarEvent[];
}) {
  const assignedRaces = data.filter((inv) => inv.status === "Accepted");

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto font-body h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
        <div>
          <h2 className="text-xl font-bold font-headline text-[#064E3B]">
            Racing Schedule
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Confirmed upcoming tournament runs and active riding assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assigned Races List */}
        <div className="space-y-4">
          <h3 className="font-bold font-headline text-[#064E3B] text-md">
            Your Confirmed Ride Schedule
          </h3>
          {assignedRaces.length === 0 ? (
            <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 text-center text-slate-500 shadow-sm">
              <p className="text-xs font-semibold text-slate-555">
                You have no upcoming confirmed rides scheduled.
              </p>
            </div>
          ) : (
            assignedRaces.map((r, index) => (
              <div
                key={r.id}
                className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:border-[#064E3B]/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#064E3B]/10 text-[#064E3B] font-extrabold px-2 py-0.5 rounded text-[9px] border border-[#064E3B]/20 font-label">
                      RACE #{index + 1}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-label">
                      Registry Confirmed
                    </span>
                  </div>
                  <h4 className="text-lg font-black font-headline text-[#064E3B]">
                    {r.horse}
                  </h4>
                  <p className="text-xs text-slate-555 font-semibold">
                    {r.tournament}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>
                      🧬 Breed:{" "}
                      <span className="text-[#064E3B] font-semibold">
                        {(r as Invitation & { breed?: string }).breed ||
                          "Thoroughbred"}
                      </span>
                    </span>
                    <span>
                      🏇 Owner:{" "}
                      <span className="text-[#064E3B] font-semibold">
                        {r.owner}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 md:border-t-0 md:border-l md:border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2.5 text-left md:text-right shrink-0">
                  <p className="text-xs font-black font-label text-[#064E3B]">
                    {r.raceTime}
                  </p>
                  <div className="flex items-center md:justify-end gap-1.5 mt-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-[11px] text-[#064E3B] font-bold">
                      Turf • 1600m Sprint
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: List of Events */}
        <div className="space-y-4">
          <h3 className="font-bold font-headline text-[#064E3B] text-md flex items-center gap-2">
            <span>🏆</span>
            System Race Calendar Events
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {eventList.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#064E3B]/20 transition"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-full shrink-0 mt-1 sm:mt-0",
                      event.className?.includes("bg-yellow-600") &&
                        "bg-yellow-600",
                      event.className?.includes("bg-red-600") && "bg-red-600",
                      event.className?.includes("bg-green-600") &&
                        "bg-green-600"
                    )}
                  />
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-snug">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                      <span>Editable: {event.editable ? "Yes" : "No"}</span>
                      <span>•</span>
                      <span>
                        Overlap: {event.overlap ? "Allowed" : "Blocked"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right font-label text-xs font-bold text-[#064E3B] pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
                  {event.start ? (
                    <span>
                      {event.start.replace("T", " ")}{" "}
                      {event.end ? `to ${event.end.split("T")[1]}` : ""}
                    </span>
                  ) : (
                    <span>{event.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const filters: FilterType[] = [
    "All",
    "Pending",
    "Accepted",
    "Declined",
    "Expired",
  ];

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchesFilter = filter === "All" || item.status === filter;
      const matchesSearch =
        item.horse.toLowerCase().includes(search.toLowerCase()) ||
        item.tournament.toLowerCase().includes(search.toLowerCase()) ||
        item.owner.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [data, filter, search]);

  const selectedInv = data.find((i) => i.id === selectedId) ?? null;
  const pendingInvites = data.filter((i) => i.status === "Pending");

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden font-body">
      {/* Left list panel */}
      <div className="w-96 shrink-0 border-r border-[#064E3B]/10 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-headline text-[#064E3B] text-lg">
              Inbound Offers
            </h2>
            {pendingInvites.length > 0 && (
              <span className="rounded bg-[#EAB308]/20 text-[#D97706] font-bold px-2.5 py-0.5 text-[9px] uppercase border border-[#EAB308]/30 font-label">
                {pendingInvites.length} Pending
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Icons.Search />
            </span>
            <input
              type="text"
              placeholder="Search horse, tournament, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F4F6F5]/50 border border-slate-200 hover:border-slate-350 focus:border-[#064E3B] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none transition"
            />
          </div>

          {/* Tabs / Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors",
                  filter === f
                    ? "bg-[#064E3B] text-white shadow-md"
                    : "bg-[#F4F6F5] text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-body">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
              <span className="h-10 w-10 opacity-30 text-[#064E3B]">
                <Icons.Mail />
              </span>
              <p className="font-bold text-slate-500">No invitations found</p>
              <p className="text-xs text-slate-400 text-center px-4">
                There are no matching ride offers in this selection.
              </p>
            </div>
          ) : (
            filtered.map((inv) => {
              const cfg = statusConfig[inv.status];
              const StatusIcon = cfg.Icon;
              const isPending = inv.status === "Pending";
              const isSelected = selectedId === inv.id;

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className={cn(
                    "relative group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-300 cursor-pointer",
                    isSelected
                      ? "border-[#064E3B] bg-[#064E3B]/5 shadow-md shadow-black/5"
                      : "border-slate-200/80 bg-white hover:bg-[#F4F6F5]/50 shadow-sm"
                  )}
                >
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="font-bold font-headline text-[#064E3B] truncate text-sm">
                        {inv.horse}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase shrink-0 font-label",
                          cfg.color,
                          cfg.bg,
                          cfg.border
                        )}
                      >
                        <StatusIcon />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-555 font-semibold truncate">
                      {inv.tournament}
                    </p>

                    <div className="flex items-center justify-between mt-3.5 text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2 pb-1 font-label">
                      <span>Owner: {inv.owner}</span>
                      <span>🕒 {inv.raceTime}</span>
                    </div>

                    {/* Deep access indicator */}
                    {isPending && (
                      <div className="mt-1.5">
                        <span className="inline-block text-[8px] text-[#D97706] font-black bg-[#EAB308]/10 px-2 py-0.5 rounded border border-[#EAB308]/20 group-hover:scale-105 duration-200 font-label">
                          🔓 DEEP ACCESS ACTIVE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right details panel */}
      <div className="flex-1 h-full overflow-hidden bg-[#F4F6F5]/30">
        <InvitationDetail
          inv={selectedInv}
          onAccept={onAccept}
          onDecline={onDecline}
        />
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
        <span className="h-16 w-16 opacity-30 text-[#064E3B]">
          <Icons.Mail />
        </span>
        <div>
          <h3 className="font-bold text-slate-500">No Offer Selected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Select an inbound invitation from the dashboard list to securely
            inspect race parameters and private horse records.
          </p>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[inv.status];
  const StatusIcon = cfg.Icon;
  const isPending = inv.status === "Pending";

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6 font-body">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[9px] text-[#064E3B] font-extrabold bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20 font-label">
              RIDING OFFER
            </span>
            <span className="text-[9px] text-slate-400 font-label">
              ID: #0087{inv.id}
            </span>
          </div>
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            {inv.horse}
          </h2>
          <p className="text-xs font-semibold text-slate-555 font-body">
            {inv.tournament}
          </p>
        </div>

        <span
          className={cn(
            "self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase font-label",
            cfg.color,
            cfg.bg,
            cfg.border
          )}
        >
          <StatusIcon />
          {cfg.label}
        </span>
      </div>

      {/* Public profile stats card */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-[10px] font-bold font-headline uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span className="text-[#064E3B]">
              <Icons.Horse />
            </span>
            Standard Horse Profile (Public)
          </h3>
          <span className="text-[9px] text-[#064E3B] font-extrabold font-label bg-[#064E3B]/5 px-2 py-0.5 rounded border border-[#064E3B]/10">
            Public Registry Verified
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              Owner
            </p>
            <p className="text-sm font-semibold text-slate-800">{inv.owner}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              Race Time
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {inv.raceTime}
            </p>
          </div>
        </div>
      </div>

      {/* Deep access / private metrics card (UC-JO-02) */}
      {isPending ? (
        <div className="bg-gradient-to-tr from-[#064E3B]/5 to-[#EAB308]/5 border border-[#064E3B]/20 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="absolute top-3 right-3 text-[#D97706] animate-pulse">
            <Icons.Compass />
          </div>

          <div className="border-b border-[#064E3B]/10 pb-3 mb-4">
            <h3 className="text-xs font-bold font-headline uppercase tracking-widest text-[#064E3B] flex items-center gap-2">
              <span>🔓</span>
              Private Health Metrics (Deep Access BR-SCHED-03)
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal font-body">
              Jockey Portal temporarily grants Deep Access to private
              veterinary, biological, and trainer track logs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2 bg-white/90 p-3.5 rounded-xl border border-[#064E3B]/10 shadow-sm">
              <span className="text-slate-500 font-bold block text-[10px] mb-1">
                Trainer Track Notes
              </span>
              <p className="text-slate-755 leading-relaxed text-xs italic">
                "
                {(
                  inv as Invitation & {
                    medicalLogs?: { trainerNotes?: string };
                  }
                ).medicalLogs?.trainerNotes ||
                  "Horse is looking strong in the final furlong. Responds well to the whip."}
                "
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 text-center space-y-3 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-450 mx-auto">
            <Icons.Lock />
          </div>
          <div>
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center justify-center gap-1.5">
              🔒 Private Records Locked
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              Under security business rule{" "}
              <strong className="text-[#064E3B] font-label text-[10px]">
                BR-SCHED-03
              </strong>
              , "Deep Access" is strictly revoked for offers with a status of
              Expired, Declined, Cancelled, or Superseded to protect the Owner's
              proprietary track data.
            </p>
          </div>
        </div>
      )}

      {/* Actions for Pending invitation (UC-JO-03) */}
      {isPending && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="text-xs font-bold text-[#064E3B] uppercase tracking-wide">
              Submit Ride Decision
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Accepting registers you tentatively. Declining releases the hold
              instantly.
            </p>
          </div>

          <div className="flex gap-4 font-body">
            <button
              onClick={() => onAccept(inv.id)}
              className="flex-1 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] px-4 py-3.5 text-xs font-bold shadow-sm transition active:scale-95 duration-200"
            >
              ✓ Accept Riding Invitation
            </button>
            <button
              onClick={() => onDecline(inv.id)}
              className="flex-1 rounded-xl border border-slate-200 bg-[#F4F6F5] text-slate-650 hover:bg-slate-100 px-4 py-3.5 text-xs font-bold transition active:scale-95 duration-200"
            >
              ✕ Decline Invitation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
