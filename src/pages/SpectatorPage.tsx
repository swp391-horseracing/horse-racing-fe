import { useState } from "react";
import { useLocation } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { SpectatorDashboard } from "../components/spectator/SpectatorDashboard";
import { PredictionsHub } from "../components/spectator/PredictionsHub";

export default function SpectatorPage() {
  const location = useLocation();
  const initialTab =
    (location.state as { tab?: string })?.tab === "predictions"
      ? ROUTES.SPECTATOR_PREDICTIONS
      : ROUTES.SPECTATOR_DASHBOARD;

  const [active, setActive] = useState<string>(initialTab);

  const renderContent = () => {
    switch (active) {
      case ROUTES.SPECTATOR_DASHBOARD:
        return <SpectatorDashboard setActiveTab={setActive} />;
      case ROUTES.SPECTATOR_PREDICTIONS:
        return <PredictionsHub />;
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
