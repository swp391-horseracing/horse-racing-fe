import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import useHorse from "../hooks/horse/useHorse.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import { useJockey } from "../hooks/useJockey";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";

// Sub-components
import { JockeyDashboardOverview } from "../components/jockey/JockeyDashboardOverview";
import { RidingSchedule } from "../components/jockey/RidingSchedule";
import { InvitationsView } from "../components/jockey/InvitationsView";

export default function JockeyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname;
  const { toasts, addToast } = useToast();

  const { rides, loading: ridesLoading } = useJockey();
  const { horses } = useHorse();
  const {
    invitations,
    loading: invitesLoading,
    acceptInvitation,
    updateInvitationStatus,
    loadAllInvitation,
    cancelInvitation,
  } = useInvitations();

  const [selectedInvId, setSelectedInvId] = useState<string | null>("1");

  const handleAcceptInvitation = async (id: string) => {
    const target = invitations.find((inv) => inv.id === id);
    try {
      await acceptInvitation(id);
      addToast(
        `Response recorded successfully! Tentatively registered to ride ${target?.horse?.name ?? target?.horse?.id}. Awaiting final Owner confirmation.`,
        "success"
      );
    } catch {
      addToast("Failed to accept invitation. Please try again.", "error");
    }
  };

  const handleDeclineInvitation = (id: string) => {
    const target = invitations.find((inv) => inv.id === id);
    updateInvitationStatus(id, "declined");
    addToast(
      `You declined the invitation to ride ${target?.horse?.name ?? target?.horse?.id}. Deep access revoked.`,
      "info"
    );
  };

  const handleCancelInvitation = async (id: string) => {
    const target = invitations.find((inv) => inv.id === id);
    try {
      await cancelInvitation(id);
      addToast(
        `Invitation to ride ${target?.horse?.name ?? target?.horse?.id} has been cancelled.`,
        "warning"
      );
    } catch {
      addToast("Failed to cancel invitation. Please try again.", "error");
    }
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
            setActiveTab={navigate}
            horseList={horses}
          />
        );
      case ROUTES.JOCKEY_SCHEDULE:
        return (
          <RidingSchedule
            rides={rides}
            loading={ridesLoading}
            userRole="jockey"
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
            onCancel={handleCancelInvitation}
            loadAllInvitation={loadAllInvitation}
            loading={invitesLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={navigate}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        <ToastContainer toasts={toasts} />

        {renderContent()}
      </div>
    </UserLayout>
  );
}
