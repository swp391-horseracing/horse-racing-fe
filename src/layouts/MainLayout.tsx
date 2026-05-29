import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.tsx";
import { ROUTES } from "../router/routes.tsx";

export default function MainLayout() {
    const navigate = useNavigate();

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

                {/* Dashboard */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Dashboard
                    </Button>
                </div>

                {/* Schedule */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.CALENDAR)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Schedule
                    </Button>
                </div>

                {/* Horses */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.HORSE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Horses
                    </Button>
                </div>

                {/* Races */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.RACES)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Races
                    </Button>
                </div>

                {/* LeaderBoard */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.LEADERBOARD)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        LeaderBoard
                    </Button>
                </div>

                {/* Reports */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.REPORTS)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Reports
                    </Button>
                </div>


                {/* Roles */}
                <div className="flex justify-center items-center h-8">
                        [
                </div>

                {/* Jockeys */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.JOCKEY)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Jockeys
                    </Button>
                </div>

                {/* Owners */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.OWNER)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Owners
                    </Button>
                </div>

                {/* Spectators */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.SPECTATOR)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Spectators
                    </Button>
                </div>

                {/* Admin */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.ADMIN)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Admin
                    </Button>
                </div>

                {/* Roles */}
                <div className="flex justify-center items-center h-8">
                    ]
                </div>

                <div className="flex justify-center items-center h-8 ml-auto">
                    <Button
                        onClick={() => navigate(ROUTES.USER)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
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