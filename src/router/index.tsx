import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import LandingLayout from "../layouts/LandingLayout";
import LoginLayout from "../layouts/LoginLayout.tsx";
import MainLayout from "../layouts/MainLayout.tsx";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import FeedPage from "../pages/FeedPage.tsx";
import CalendarPage from "../pages/CalendarPage.tsx";
import HorsePage from "../pages/HorsePage.tsx";
import TournamentsPage from "../pages/TournamentsPage.tsx";
import RacesPage from "../pages/RacesPage.tsx";
import JockeyPage from "../pages/JockeyPage.tsx";
import AdminPage from "../pages/AdminPage.tsx";
import AdminTournamentDetailPage from "../pages/AdminTournamentDetailPage.tsx";
import UserPage from "../pages/UserPage.tsx";
import OwnerPage from "../pages/OwnerPage.tsx";
import SpectatorPage from "../pages/SpectatorPage.tsx";
import { SpectatorDashboard } from "../components/spectator/SpectatorDashboard.tsx";
import { PredictionsHub } from "../components/spectator/PredictionsHub.tsx";
import RefereePage from "../pages/RefereePage.tsx";
import LeaderBoardPage from "../pages/LeaderBoardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import HorseDetailPage from "../pages/HorseDetailPage.tsx";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <LandingLayout />,
    children: [{ index: true, element: <MainPage /> }],
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },

  {
    path: ROUTES.REGISTER,
    element: <LoginLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },

  {
    path: "/",
    element: <Navigate to={ROUTES.HOME} replace />,
  },

  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.FEED,
        element: <FeedPage />,
      },
      {
        path: ROUTES.CALENDAR,
        element: <CalendarPage />,
      },
      {
        path: ROUTES.HORSES,
        element: <HorsePage />,
      },
      {
        path: ROUTES.TOURNAMENTS,
        element: <TournamentsPage />,
      },
      {
        path: ROUTES.LEADERBOARD,
        element: <LeaderBoardPage />,
      },

      {
        path: ROUTES.RACES,
        element: <RacesPage />,
      },
      {
        path: ROUTES.RACE_DETAIL,
        element: <RacesPage />,
      },
      {
        path: ROUTES.RACE_PREDICT,
        element: <RacesPage />,
      },

      {
        element: <ProtectedRoute allowedRoles={["jockey"]} />,
        children: [
          {
            path: ROUTES.JOCKEY_DASHBOARD,
            element: <JockeyPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["horse_owner"]} />,
        children: [
          {
            path: ROUTES.OWNER_DASHBOARD,
            element: <OwnerPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["spectator"]} />,
        children: [
          {
            path: ROUTES.SPECTATOR_DASHBOARD,
            element: <SpectatorPage />,
            children: [
              { index: true, element: <SpectatorDashboard /> },
              { path: "predictions", element: <PredictionsHub /> },
            ],
          },
          {
            path: ROUTES.ME_PREDICTIONS,
            element: <SpectatorPage />,
            children: [{ index: true, element: <PredictionsHub /> }],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["referee"]} />,
        children: [
          {
            path: ROUTES.REFEREE_DASHBOARD,
            element: <RefereePage />,
          },
          {
            path: ROUTES.REFEREE_RACE_LIST,
            element: <RefereePage />,
          },
          {
            path: ROUTES.REFEREE_TRACKS,
            element: <RefereePage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: ROUTES.ADMIN_DASHBOARD,
            element: <AdminPage />,
          },
          {
            path: ROUTES.ADMIN_TOURNAMENT_DETAIL,
            element: <AdminTournamentDetailPage />,
          },
        ],
      },
      {
        path: ROUTES.USER_PROFILE,
        element: <UserPage />,
      },
      {
        path: ROUTES.NOTHING_DETAIL,
        element: <NotFoundPage />,
      },
      {
        path: ROUTES.HORSE_DETAIL,
        element: <HorseDetailPage />,
      },
    ],
  },
]);
