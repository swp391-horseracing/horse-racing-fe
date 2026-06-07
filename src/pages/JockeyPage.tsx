import { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import useHorse from "../hooks/useHorse.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import type {InvStatus } from "../services/invitationService.ts";

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
} from "lucide-react";

// Import new separated components
import DashboardOverview from "../components/jockey/JockeyDashboardOverview.tsx";
import RidingSchedule from "../components/jockey/JockeyRidingSchedule.tsx";
import InvitationsView from "../components/jockey/InvitationsView.tsx";

// ─── Exported Types & Interfaces ──────────────────────────────────────────
export type FilterType = "All" | InvStatus;
export type ToastType = "success" | "error" | "warning" | "info";
export type Toast = { id: number; message: string; type: ToastType };

export type MyRide = {
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

export type ComputedRideStatus = "pending" | "accepted" | "declined" | "finished";
export type RideDetailTab = "info" | "runners";

export interface JockeyHorse {
  id: string | number;
  name: string;
  breed?: string;
  gender?: string;
  owner?: string;
  ownerId?: string;
  status?: string;
  performance?: string;
}

// ─── Exported Helpers, Constants, Mocks ──────────────────────────────────────
export const getComputedRideStatus = (ride: MyRide): ComputedRideStatus => {
  if (ride.status === "completed") return "finished";
  return ride.entryStatus;
};

export const formatOrdinal = (num: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const val = num % 100;
  return num + (suffixes[(val - 20) % 10] || suffixes[val] || suffixes[0]);
};

export const myRidesMock: MyRide[] = [
  { id: "f54f8b4a-0b45-4290-a8e1-de910bae8b91", tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d05", name: "Race 20 - stormy", roundName: "Qualifier", distanceMeters: 1000, scheduledAt: "2026-06-08T18:00:13.393Z", venue: "North Dorthafield", status: "scheduled", ride: "Horse-35-tempting", laneNumber: 1, entryStatus: "pending", confirmedAt: null, horseOwner: "Owner 3 Hansen", horsesId: "18f5e46e-f61f-4bda-8192-669300c4454c", ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051b", trackCondition: "wet", laneCount: 8 },
  { id: "f54f8b4a-0b45-4290-a8e1-de910bae8b92", tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d05", name: "Race 21 - breezy", roundName: "Qualifier", distanceMeters: 1600, scheduledAt: "2026-06-08T20:30:00.000Z", venue: "South Dorthafield", status: "scheduled", ride: "Silver Flash", laneNumber: 4, entryStatus: "accepted", confirmedAt: "2026-06-01T10:00:00.000Z", horseOwner: "Owner 1 Smith", horsesId: "18f5e46e-f61f-4bda-8192-669300c4454d", ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051c", trackCondition: "good", laneCount: 12 },
  { id: "f54f8b4a-0b45-4290-a8e1-de910bae8b93", tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d06", name: "Summer Cup - Finals", roundName: "Finals", distanceMeters: 2000, scheduledAt: "2026-06-15T16:00:00.000Z", venue: "West Arena", status: "completed", ride: "Thunder Bolt", laneNumber: 2, entryStatus: "accepted", confirmedAt: "2026-06-05T09:00:00.000Z", horseOwner: "Owner 2 Doe", horsesId: "18f5e46e-f61f-4bda-8192-669300c4454e", ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051d", trackCondition: "fast", laneCount: 10, ranking: 3 },
  { id: "f54f8b4a-0b45-4290-a8e1-de910bae8b94", tournamentId: "dae99c91-e11c-483d-9074-fb015ea49d07", name: "Night Derby", roundName: "Group Stage", distanceMeters: 1200, scheduledAt: "2026-06-09T19:00:00.000Z", venue: "East Track", status: "scheduled", ride: "Dark Phantom", laneNumber: 7, entryStatus: "declined", confirmedAt: null, horseOwner: "Owner 4 Lee", horsesId: "18f5e46e-f61f-4bda-8192-669300c4454f", ownerId: "84bdaf33-8f84-4d49-8151-4758ac40051e", trackCondition: "muddy", laneCount: 8 }
];

export const officialsMock = [
  { initials: "AJ", name: "Arthur Jones", title: "Chief Steward" },
  { initials: "SB", name: "Sarah Baxter", title: "Starter" },
  { initials: "MT", name: "Mark Thompson", title: "Judge" },
];

export const Icons = {
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

export const statusConfig: Record<InvStatus | "Confirmed", { color: string; bg: string; border: string; Icon: React.ElementType; label: string }> = {
  Pending: { color: "text-[#D97706]", bg: "bg-[#D97706]/10", border: "border-[#D97706]/20", Icon: Icons.Clock, label: "Pending" },
  Accepted: { color: "text-[#064E3B]", bg: "bg-[#064E3B]/10", border: "border-[#064E3B]/20", Icon: Icons.CheckCircle, label: "Accepted" },
  Confirmed: { color: "text-[#064E3B]", bg: "bg-[#064E3B]/10", border: "border-[#064E3B]/20", Icon: Icons.CheckCircle, label: "Confirmed" },
  Declined: { color: "text-rose-700", bg: "bg-rose-500/10", border: "border-rose-500/20", Icon: Icons.XCircle, label: "Declined" },
  Expired: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", Icon: Icons.Clock, label: "Expired" },
  Cancelled: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", Icon: Icons.XCircle, label: "Cancelled" },
  Superseded: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", Icon: Icons.XCircle, label: "Superseded" },
};

// ─── Main Controller Component ──────────────────────────────────────────────
export default function JockeyPage() {
  const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rides, setRides] = useState<MyRide[]>(myRidesMock);

  // Shared hooks data
  const { horses } = useHorse();
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
    addToast(`Response recorded successfully! Tentatively registered to ride ${target?.horse}. Awaiting final Owner confirmation.`, "success");
  };

  const handleDeclineInvitation = (id: number) => {
    const target = invitations.find((inv) => inv.id === id);
    updateInvitationStatus(id, "Declined");
    addToast(`You declined the invitation to ride ${target?.horse}. Deep access revoked.`, "info");
  };

  const handleAcceptRide = (id: string) => {
    setRides((prev) => prev.map((r) => r.id === id ? { ...r, entryStatus: "accepted" as const } : r));
    const target = rides.find((r) => r.id === id);
    addToast(`Response recorded! Tentatively registered to ride ${target?.ride}. Awaiting final Owner confirmation.`, "success");
  };

  const handleDeclineRide = (id: string) => {
    setRides((prev) => prev.map((r) => r.id === id ? { ...r, entryStatus: "declined" as const } : r));
    const target = rides.find((r) => r.id === id);
    addToast(`You declined the invitation to ride ${target?.ride}.`, "info");
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.JOCKEY_DASHBOARD:
        return <DashboardOverview data={invitations} setActiveTab={setActive} horseList={horses} />;
      case ROUTES.JOCKEY_SCHEDULE:
        return <RidingSchedule rides={rides} onAcceptRide={handleAcceptRide} onDeclineRide={handleDeclineRide} />;
      case ROUTES.JOCKEY_INVITATIONS:
        return <InvitationsView data={invitations} selectedId={selectedInvId} setSelectedId={setSelectedInvId} onAccept={handleAcceptInvitation} onDecline={handleDeclineInvitation} />;
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