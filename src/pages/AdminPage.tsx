import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";

import AccessManagement from "../components/admin/AccessManagement";
import RegistryApprovals from "../components/admin/RegistryApprovals";
import TournamentRaceManager from "../components/admin/TournamentRaceManager";
import VirtualEconomy from "../components/admin/VirtualEconomy";
import ControlCenterOverview from "../components/admin/controlCenterOverview.tsx";
import RaceReportsManager from "../components/admin/RaceReportsManager";

const TAB_ROUTE_MAP: Record<string, string> = {
  [ROUTES.ADMIN_DASHBOARD]: ROUTES.ADMIN_DASHBOARD,
  [ROUTES.ADMIN_USER_LIST]: "/admin/access",
  "/admin/access": "/admin/access",
  "/admin/registry": "/admin/registry",
  [ROUTES.ADMIN_TOURNAMENT_LIST]: "/admin/tournaments",
  "/admin/economy": "/admin/economy",
  [ROUTES.ADMIN_REPORTS]: ROUTES.ADMIN_REPORTS,
};

function getTabKey(pathname: string): string {
  return TAB_ROUTE_MAP[pathname] ?? ROUTES.ADMIN_DASHBOARD;
}

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<string>(() =>
    getTabKey(location.pathname)
  );
  const { toasts, addToast } = useToast();

  useEffect(() => {
    const tabKey = getTabKey(location.pathname);
    if (tabKey !== active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(tabKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleActiveChange = (key: string) => {
    navigate(key);
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.ADMIN_DASHBOARD:
        return <ControlCenterOverview setActiveTab={handleActiveChange} />;
      case "/admin/access":
        return <AccessManagement addToast={addToast} />;
      case "/admin/registry":
        return <RegistryApprovals addToast={addToast} />;
      case "/admin/tournaments":
        return <TournamentRaceManager addToast={addToast} />;
      case "/admin/economy":
        return <VirtualEconomy addToast={addToast} />;
      case ROUTES.ADMIN_REPORTS:
        return <RaceReportsManager addToast={addToast} />;
      default:
        return <ControlCenterOverview setActiveTab={handleActiveChange} />;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={handleActiveChange}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        <ToastContainer toasts={toasts} />

        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
