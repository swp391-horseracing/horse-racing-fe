import { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

// Sub-components
import { SpectatorDashboard } from "../components/spectator/SpectatorDashboard";
import { PredictionsHub } from "../components/spectator/PredictionsHub";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

export default function SpectatorPage() {
  const [active, setActive] = useState<string>(ROUTES.SPECTATOR_DASHBOARD);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.SPECTATOR_DASHBOARD:
        return <SpectatorDashboard setActiveTab={setActive} />;
      case "/spectator/predictions":
        return <PredictionsHub addToast={addToast} />;
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        {/* Floating Toasts container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-body">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-3 rounded-lg border shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top duration-200 text-xs font-semibold",
                t.type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-955",
                t.type === "error" && "bg-rose-50 border-rose-200 text-rose-955",
                t.type === "warning" && "bg-amber-50 border-amber-200 text-amber-955",
                t.type === "info" && "bg-[#F4F6F5] border-slate-200 text-slate-800"
              )}
            >
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {t.type === "error" && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {t.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
              {t.type === "info" && <Info className="w-4 h-4 text-[#064E3B] shrink-0" />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}
