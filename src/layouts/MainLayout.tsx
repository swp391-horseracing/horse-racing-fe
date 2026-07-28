import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ROUTES } from "../router/routes";
import { Wallet } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { useWallet } from "../hooks/useWallet";

export default function MainLayout() {
  interface LinkItem {
    label: string;
    to: string;
  }

  const { user, token, loading } = useAuthContext();

  const generalLinks: LinkItem[] = [
    {
      label: "Feed",
      to: ROUTES.FEED,
    },
    {
      label: "Horses",
      to: ROUTES.HORSES,
    },
    {
      label: "Jockeys",
      to: ROUTES.JOCKEYS,
    },
    {
      label: "Races",
      to: ROUTES.RACES,
    },
    {
      label: "Tournaments",
      to: ROUTES.TOURNAMENTS,
    },
    {
      label: "Tracks",
      to: ROUTES.TRACKS,
    },
  ];

  const roleLinkMap: Record<string, LinkItem> = {
    jockey: {
      label: "Jockey",
      to: ROUTES.JOCKEY_DASHBOARD,
    },
    horse_owner: {
      label: "Horse Owner",
      to: ROUTES.OWNER_DASHBOARD,
    },
    spectator: {
      label: "Spectator",
      to: ROUTES.SPECTATOR_DASHBOARD,
    },
    admin: {
      label: "Admin",
      to: ROUTES.ADMIN_DASHBOARD,
    },
    referee: {
      label: "Referee",
      to: ROUTES.REFEREE_DASHBOARD,
    },
  };

  const roleLinks: LinkItem[] =
    user?.role && roleLinkMap[user.role] ? [roleLinkMap[user.role]] : [];

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = loading ? !!token : !!(token && user);
  const { balance } = useWallet();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 pb-3 px-3 pt-3 overflow-hidden">
      {/* Navigation Header */}
      <div className="flex w-full items-center h-16 bg-white mb-3 gap-3 px-8 rounded-2xl shadow-md border border-slate-200/80 flex-shrink-0 flex-wrap">
        {/* Logo */}
        <div className="flex justify-center items-center shrink-0">
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 font-black text-base text-[#064E3B] bg-[#064E3B]/10 hover:bg-[#064E3B]/20 px-4 py-2"
            variant="ghost"
          >
            HRTMS
          </Button>
        </div>

        {/* Global Navigation */}
        <div className="flex items-center gap-1 flex-wrap">
          {generalLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              location.pathname.startsWith(link.to + "/");
            return (
              <Button
                key={link.to}
                onClick={() => navigate(link.to)}
                variant="ghost"
                className={`rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 flex items-center text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-700 hover:text-[#064E3B] hover:bg-[#064E3B]/10"
                }`}
              >
                {link.label}
              </Button>
            );
          })}
        </div>

        {roleLinks.length > 0 && (
          <div className="flex justify-center items-center text-slate-300 px-1 shrink-0 font-light">
            |
          </div>
        )}

        {/* Role Portals */}
        {roleLinks.map((link) => {
          const isActive = location.pathname.includes(link.to);
          return (
            <Button
              key={link.to}
              onClick={() => navigate(link.to)}
              variant="ghost"
              className={`rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
              }`}
            >
              {link.label}
            </Button>
          );
        })}

        {/* Actions Menu */}
        <div className="flex justify-center items-center ml-auto shrink-0 gap-2">
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold shadow-2xs">
              <Wallet className="w-4 h-4 text-emerald-600" />
              {balance.toLocaleString()} credits
            </div>
          )}

          {isAuthenticated && user?.role === "spectator" && (
            <Button
              onClick={() => navigate(ROUTES.SPECTATOR_WALLET)}
              variant="ghost"
              title="Spectator Wallet"
              className={`rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-xs font-bold ${
                location.pathname === ROUTES.SPECTATOR_WALLET ||
                location.pathname === ROUTES.USER_WALLET
                  ? "bg-[#064E3B]/10 text-[#064E3B]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </Button>
          )}

          {isAuthenticated ? (
            <Button
              onClick={() => navigate(ROUTES.USER_PROFILE)}
              variant="ghost"
              className={`rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 text-xs font-bold ${
                location.pathname === ROUTES.USER_PROFILE
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              My Profile
            </Button>
          ) : (
            <Button
              onClick={() => navigate(ROUTES.LOGIN)}
              variant="ghost"
              className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 text-xs font-bold bg-[#064E3B]/10 text-[#064E3B] hover:bg-[#064E3B]/20"
            >
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Application Viewport */}
      <div className="w-full flex-1 bg-white rounded-2xl min-h-0 overflow-y-auto shadow-md border border-slate-200/80">
        <Outlet />
      </div>
    </div>
  );
}
