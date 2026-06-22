import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";

import AccessManagement from "../components/admin/AccessManagement";
import RegistryApprovals from "../components/admin/RegistryApprovals";
import TournamentRaceManager from "../components/admin/TournamentRaceManager";
import VirtualEconomy from "../components/admin/VirtualEconomy";
import ControlCenterOverview from "../components/admin/controlCenterOverview.tsx";


export type ToastType = "success" | "error" | "warning" | "info";
export type Toast = { id: number; message: string; type: ToastType };

const TAB_ROUTE_MAP: Record<string, string> = {
  [ROUTES.ADMIN_DASHBOARD]: ROUTES.ADMIN_DASHBOARD,
  [ROUTES.ADMIN_USER_LIST]: "/admin/access",
  "/admin/registry": "/admin/registry",
  [ROUTES.ADMIN_TOURNAMENT_LIST]: "/admin/tournaments",
  "/admin/economy": "/admin/economy",

};

function getTabKey(pathname: string): string {
  return TAB_ROUTE_MAP[pathname] ?? ROUTES.ADMIN_DASHBOARD;
}

export default function AdminPage() {
  const location = useLocation();
  const [active, setActive] = useState<string>(() => getTabKey(location.pathname));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const tabKey = getTabKey(location.pathname);
    if (tabKey !== active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(tabKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleActiveChange = (key: string) => {
    setActive(key);
  };

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
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
      default:
        return <ControlCenterOverview setActiveTab={handleActiveChange} />;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={handleActiveChange}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        {/* Floating Toasts */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-2.5 pointer-events-auto transform animate-in slide-in-from-top duration-200 text-xs font-semibold",
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
              <span className="shrink-0 mt-0.5">
                {t.type === "success" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {t.type === "error" && (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                {t.type === "warning" && (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                {t.type === "info" && (
                  <Activity className="w-4 h-4 text-indigo-600" />
                )}
              </span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
