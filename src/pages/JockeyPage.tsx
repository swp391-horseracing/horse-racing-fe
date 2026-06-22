import { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import useHorse from "../hooks/horse/useHorse.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import { useJockey } from "../hooks/useJockey";
import { CheckCircle, XCircle, ShieldAlert, Activity } from "lucide-react";

// Sub-components
import { JockeyDashboardOverview } from "../components/jockey/JockeyDashboardOverview";
import { RidingSchedule } from "../components/jockey/RidingSchedule";
import { InvitationsView } from "../components/jockey/InvitationsView";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

export default function JockeyPage() {
  const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const { rides, loading: ridesLoading } = useJockey();
  const { horses } = useHorse();
  const { invitations, updateInvitationStatus } = useInvitations();

  const [selectedInvId, setSelectedInvId] = useState<string | null>("1");

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAcceptInvitation = (id: string) => {
    const target = invitations.find((inv) => inv.id === id);
    updateInvitationStatus(id, "accepted");
    addToast(
      `Response recorded successfully! Tentatively registered to ride ${target?.horse?.name ?? target?.horse?.id}. Awaiting final Owner confirmation.`,
      "success"
    );
  };

  const handleDeclineInvitation = (id: string) => {
    const target = invitations.find((inv) => inv.id === id);
    updateInvitationStatus(id, "declined");
    addToast(
      `You declined the invitation to ride ${target?.horse?.name ?? target?.horse?.id}. Deep access revoked.`,
      "info"
    );
  };

  const handleAcceptRide = (id: string) => {
    const target = rides.find((r) => r.id === id);
    addToast(
      `Response recorded! Tentatively registered to ride ${target?.ride}. Awaiting final Owner confirmation.`,
      "success"
    );
  };

  const handleDeclineRide = (id: string) => {
    const target = rides.find((r) => r.id === id);
    addToast(`You declined the invitation to ride ${target?.ride}.`, "info");
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.JOCKEY_DASHBOARD:
        return (
          <JockeyDashboardOverview
            data={invitations}
            setActiveTab={(tab) => setActive(tab)}
            horseList={horses}
          />
        );
      case ROUTES.JOCKEY_SCHEDULE:
        return (
          <RidingSchedule
            rides={rides}
            loading={ridesLoading}
            onAcceptRide={handleAcceptRide}
            onDeclineRide={handleDeclineRide}
          />
        );
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
                {t.type === "success" && <CheckCircle className="w-4 h-4" />}
                {t.type === "error" && <XCircle className="w-4 h-4" />}
                {t.type === "warning" && <ShieldAlert className="w-4 h-4" />}
                {t.type === "info" && <Activity className="w-4 h-4" />}
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
