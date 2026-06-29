import { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import useHorse from "../hooks/horse/useHorse.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";

// Sub-components
import { JockeyDashboardOverview } from "../components/jockey/JockeyDashboardOverview";
import { RidingSchedule } from "../components/jockey/RidingSchedule";
import { InvitationsView } from "../components/jockey/InvitationsView";

export default function JockeyPage() {
  const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);
  const {toasts} = useToast();
  const { horses } = useHorse();
  const {
    invitations,
  } = useInvitations();



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
          <RidingSchedule/>
        );
      case ROUTES.JOCKEY_INVITATIONS:
        return (
          <InvitationsView/>
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        <ToastContainer toasts={toasts} />

        {renderContent()}
      </div>
    </UserLayout>
  );
}
