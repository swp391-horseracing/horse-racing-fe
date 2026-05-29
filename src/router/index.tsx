import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import LandingLayout from "../layouts/LandingLayout";
import LoginLayout from "../layouts/LoginLayout.tsx";
import MainLayout from "../layouts/MainLayout.tsx";
import GuidesPage from "../pages/GuidesPage";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage.tsx";
import CalendarPage from "../pages/CalendarPage.tsx";
import HorsePage from "../pages/HorsePage.tsx";
import RacesPage from "../pages/RacesPage.tsx";
import JockeyPage from "../pages/JockeyPage.tsx";
import OwnerPage from "../pages/OwnerPage.tsx";
import AdminPage from "../pages/AdminPage.tsx";
import UserPage from "../pages/UserPage.tsx";
import SpectatorPage from "../pages/SpectatorPage.tsx";
import LeaderBoardPage from "../pages/LeaderBoardPage.tsx";
import ReportsPage from "../pages/ReportsPage.tsx";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <LandingLayout />,
    children: [{ index: true, element: <MainPage /> }],
  },
  {
    path: ROUTES.GUIDE,
    element: <GuidesPage />,
  },

  {
    path: ROUTES.LOGIN,
    element: <LoginLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },

  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.CALENDAR,
        element: <CalendarPage />,
      },
      {
        path: ROUTES.HORSE,
        element: <HorsePage />,
      },
      {
        path: ROUTES.RACES,
        element: <RacesPage />,
      },
      {
        path: ROUTES.LEADERBOARD,
        element: <LeaderBoardPage />,
      },
      {
        path: ROUTES.REPORTS,
        element: <ReportsPage />,
      },
      {
        path: ROUTES.JOCKEY,
        element: <JockeyPage />,
      },
      {
        path: ROUTES.OWNER,
        element: <OwnerPage />,
      },
      {
        path: ROUTES.SPECTATOR,
        element: <SpectatorPage />,
      },
      {
        path: ROUTES.ADMIN,
        element: <AdminPage />,
      },
      {
        path: ROUTES.USER,
        element: <UserPage />,
      },
    ],
  },
]);