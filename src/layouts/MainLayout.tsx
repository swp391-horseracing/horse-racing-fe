import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.tsx";
import { ROUTES } from "../router/routes.tsx";
import { Bell, Newspaper } from "lucide-react";
import React from "react";
import NotificationTab from "../components/NotificationTab.tsx";
import useAuth from "../hooks/useAuth.ts";
import Footer from "../components/Footer.tsx";
import { useUserProfile } from "../hooks/useUserProfile.ts";

export default function MainLayout() {
  interface LinkItem {
    label: string;
    to: string;
    icon?: React.ReactNode;
  }

  const { user } = useUserProfile();

  const generalLinks: LinkItem[] = [
    {
      label: "Feed",
      to: ROUTES.FEED,
      icon: <Newspaper className="w-4 h-4 mr-1.5" />,
    },
    { label: "Schedule", to: ROUTES.CALENDAR },
    { label: "Horses", to: ROUTES.HORSES },
    { label: "Races", to: ROUTES.RACES },
    { label: "Tournaments", to: ROUTES.TOURNAMENTS },
    { label: "LeaderBoard", to: ROUTES.LEADERBOARD },
  ];

  interface LinkItem {
    label: string;
    to: string;
    icon?: React.ReactNode;
  }

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

  const [show, setShow] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const token = useAuth().getToken();
  if (token == null) {
    navigate(ROUTES.LOGIN);
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-200 pb-2 px-2 pt-4 overflow-hidden">
      {/* Navigation Header */}
      <div className="flex w-full items-center h-12 bg-white mb-4 gap-2 px-2 rounded-sm shadow-sm overflow-x-auto flex-shrink-0">
        {/* Logo */}
        <div className="flex justify-center items-center h-8 shrink-0">
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 font-bold text-[#064E3B]"
            variant="ghost"
          >
            HRTMS
          </Button>
        </div>

        {/* Global Navigation */}
        {generalLinks.map((link) => (
          <div
            key={link.to}
            className="flex justify-center items-center h-8 shrink-0"
          >
            <Button
              onClick={() => navigate(link.to)}
              variant="ghost"
              className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 flex items-center
                ${
                  location.pathname === link.to
                    ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent"
                }`}
            >
              {link.icon}
              {link.label}
            </Button>
          </div>
        ))}

        <div className="flex justify-center items-center h-8 text-gray-300 px-1 shrink-0 font-light">
          |
        </div>

        {/* Role Portals */}
        {roleLinks.map((link) => (
          <div
            key={link.to}
            className="flex justify-center items-center h-8 shrink-0"
          >
            <Button
              onClick={() => navigate(link.to)}
              variant="ghost"
              className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2
                ${
                  location.pathname.includes(link.to)
                    ? "bg-gray-100 text-gray-800 font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
            >
              {link.label}
            </Button>
          </div>
        ))}

        {/* Actions Menu */}
        <div className="flex justify-center items-center h-8 ml-auto shrink-0 relative">
          <div className="flex flex-row justify-end h-8">
            <Button
              onClick={() => setShow(!show)}
              variant="ghost"
              className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 mx-1 py-2
                ${
                  show
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:text-gray-900"
                }`}
            >
              <Bell className="w-5 h-5" />
            </Button>
            {show && (
              <div className="absolute mr-110 top-0 z-50">
                <NotificationTab />
              </div>
            )}
          </div>

          <Button
            onClick={() => navigate(ROUTES.USER_PROFILE)}
            variant="ghost"
            className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-4 ml-1 py-2
              ${
                location.pathname === ROUTES.USER_PROFILE
                  ? "bg-gray-100 text-gray-800 font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
          >
            My Profile
          </Button>
        </div>
      </div>

      {/* Application Viewport */}
      <div className="w-full flex-1 bg-white rounded-sm min-h-0 overflow-y-auto  shadow-sm border border-gray-200">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
