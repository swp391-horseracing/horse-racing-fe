import {Outlet, useLocation, useNavigate} from "react-router-dom";
import { Button } from "../components/ui/button.tsx";
import { ROUTES } from "../router/routes.tsx";
import {Bell} from "@phosphor-icons/react";
import React from "react";
import NotificationTab from "../components/NotificationTab.tsx";

export default function MainLayout() {
  interface LinkItem {
    label: string;
    to: string;
  }
  const generalLinks: LinkItem[] = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Schedule', to: ROUTES.CALENDAR },
    { label: 'Horses', to: ROUTES.HORSES },
    { label: 'Races', to: ROUTES.RACES },
    { label: 'LeaderBoard', to: ROUTES.LEADERBOARD },
  ];

    const roleLinks: LinkItem[] = [
        { label: "Jockeys", to: ROUTES.JOCKEY_DASHBOARD },
        { label: "Owners", to: ROUTES.OWNER_DASHBOARD },
        { label: "Spectators", to: ROUTES.SPECTATOR_DASHBOARD },
        { label: "Admin", to: ROUTES.ADMIN_DASHBOARD },
        //This for specific role like jockey/schedule or owners/horseManagement
    ];

    const [show, setShow] = React.useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex flex-col justify-center items-center h-screen w-screen bg-gray-200 pb-2 px-2 pt-4">
            <div className="flex w-full items-center h-12 bg-white mb-4 gap-2 px-2 rounded-sm shadow-sm">

                {/* Logo */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.HOME)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Logo
                    </Button>
                </div>

                {generalLinks.map((link) => (
                    <div key={link.to} className="flex justify-center items-center h-8">
                        <Button
                            onClick={() => navigate(link.to)}
                            variant="ghost"
                            className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-2
                            ${
                                console.log(location.pathname),
                                location.pathname === link.to ?
                                    "bg-green-100 text-gray-600 hover:bg-green-200 hover:border-green-300 hover:border-1"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-green-100 hover:border-green-300 hover:border-1"

                            }`}
                        >
                            {link.label}
                        </Button>
                    </div>
                ))}


                <div className="flex justify-center items-center h-8 text-gray-400 px-1">
                    [
                </div>

                {roleLinks.map((link) => (
                    <div key={link.to} className="flex justify-center items-center h-8">
                        <Button
                            onClick={() => navigate(link.to)}
                            variant="ghost"
                            className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-2
                            ${
                                location.pathname === link.to ?
                                    "bg-gray-100 text-gray-600"
                                    : "text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            {link.label}
                        </Button>
                    </div>
                ))}

                <div className="flex justify-center items-center h-8 text-gray-400 px-1">
                    ]
                </div>

                <div className="flex justify-center items-center h-8 ml-auto">
                    <div className="flex flex-row justify-end h-8">
                        <Button
                            onClick={() => setShow(!show)}
                            variant="ghost"
                            className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 mx-1 py-2
                                ${
                                show ?
                                    "bg-gray-100 text-gray-600"
                                    : "text-gray-600 hover:text-gray-900"
    
                            }`}
                        >
                            <Bell />
                        </Button>
                        {show && (
                            <NotificationTab/>
                        )}
                    </div>

                    <Button
                        onClick={() => navigate(ROUTES.USER_PROFILE)}
                        variant="ghost"
                        className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-2 ml-1 py-2
                            ${
                            location.pathname === ROUTES.USER_PROFILE ?
                                "bg-gray-100 text-gray-600"
                                : "text-gray-600 hover:text-gray-900"

                        }`}
                    >
                        User
                    </Button>
                </div>

            </div>

            <div className="w-full flex-1 bg-white rounded-sm overflow-auto min-h-0">
                <Outlet />
            </div>
        </div>

        {generalLinks.map((link) => (
          <div key={link.to} className="flex justify-center items-center h-8">
            <Button
              onClick={() => navigate(link.to)}
              variant="ghost"
              className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-2
                            ${
                              location.pathname === link.to
                                ? 'bg-gray-100 text-gray-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
            >
              {link.label}
            </Button>
          </div>
        ))}

        <div className="flex justify-center items-center h-8 text-gray-400 px-1">
          [
        </div>

        {roleLinks.map((link) => (
          <div key={link.to} className="flex justify-center items-center h-8">
            <Button
              onClick={() => navigate(link.to)}
              variant="ghost"
              className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-2
                            ${
                              location.pathname === link.to
                                ? 'bg-gray-100 text-gray-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
            >
              {link.label}
            </Button>
          </div>
        ))}

        <div className="flex justify-center items-center h-8 text-gray-400 px-1">
          ]
        </div>

        <div className="flex justify-center items-center h-8 ml-auto">
          <Button
            onClick={() => navigate(ROUTES.USER_PROFILE)}
            variant="ghost"
            className={`rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-5 py-2
                            ${
                              location.pathname === ROUTES.USER_PROFILE
                                ? 'bg-gray-100 text-gray-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
          >
            User
          </Button>
        </div>
      </div>

      <div className="w-full h-full bg-white rounded-sm overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
