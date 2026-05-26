import { Outlet } from "react-router-dom";
import {Button} from "../components/ui/button.tsx";
import {ROUTES} from "../router/routes.tsx";
import {useNavigate} from "react-router-dom";

export default function MainLayout() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center h-screen w-screen bg-gray-200 pb-2 px-2 pt-4">
            <div className="flex w-full items-center h-12 bg-white mb-4 gap-2 px-2 rounded-sm shadow-sm">

                {/* Logo */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.HOME_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Logo
                    </Button>
                </div>

                {/* Dashboard */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.DASHBOARD_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Dashboard
                    </Button>
                </div>

                {/* Races */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.CALENDAR_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Races
                    </Button>
                </div>

                {/* Horses */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.HORSE_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Horses
                    </Button>
                </div>

                {/* Tournament */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.TOURNAMENT_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Tournament
                    </Button>
                </div>

                {/* People */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.PEOPLE_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        People
                    </Button>
                </div>

                {/* Ranking */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.RANKING_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Ranking
                    </Button>
                </div>

                {/* Finance */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.FINANCE_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Finance
                    </Button>
                </div>

                {/* Reports */}
                <div className="flex justify-center items-center h-8">
                    <Button
                        onClick={() => navigate(ROUTES.REPORTS_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Reports
                    </Button>
                </div>

                {/* Settings */}
                <div className="flex justify-center items-center h-8 ml-auto">
                    <Button
                        onClick={() => navigate(ROUTES.SETTINGS_PAGE)}
                        className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        variant="ghost"
                    >
                        Avatar
                    </Button>
                </div>

            </div>

            <div className="w-full h-full bg-white rounded-sm">
                <Outlet />
            </div>
        </div>
    );
}