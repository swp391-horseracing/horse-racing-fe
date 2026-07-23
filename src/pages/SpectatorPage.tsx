import { useLocation, useNavigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes";
import { SpectatorDashboard } from "../components/spectator/SpectatorDashboard";
import { PredictionsHub } from "../components/spectator/PredictionsHub";
import WalletPage from "./WalletPage";

export default function SpectatorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname;

  const renderContent = () => {
    switch (active) {
      case ROUTES.SPECTATOR_DASHBOARD:
        return <SpectatorDashboard setActiveTab={navigate} />;
      case ROUTES.SPECTATOR_PREDICTIONS:
        return <PredictionsHub />;
      case ROUTES.SPECTATOR_WALLET:
      case ROUTES.USER_WALLET:
        return <WalletPage />;
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={navigate}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
