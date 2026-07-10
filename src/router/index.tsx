import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import LandingLayout from "../layouts/LandingLayout";
import LoginLayout from "../layouts/LoginLayout";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import FeedPage from "../pages/FeedPage";
import CalendarPage from "../pages/CalendarPage";
import HorsePage from "../pages/HorsePage";
import TournamentsPage from "../pages/TournamentsPage";
import RacesPage from "../pages/RacesPage";
import JockeyPage from "../pages/JockeyPage";
import AdminPage from "../pages/AdminPage";
import AdminTournamentDetailPage from "../pages/AdminTournamentDetailPage";
import AdminRaceDetailPage from "../pages/AdminRaceDetailPage";

import UserPage from "../pages/UserPage";
import OwnerPage from "../pages/OwnerPage";
import SpectatorPage from "../pages/SpectatorPage";
import RefereePage from "../pages/RefereePage";
import LeaderBoardPage from "../pages/LeaderBoardPage";
import NotFoundPage from "../pages/NotFoundPage";
import HorseDetailPage from "../pages/HorseDetailPage";
import TracksPage from "../pages/TracksPage";
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
        path: ROUTES.TRACKS,
        element: <TracksPage />,
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
          {
            path: ROUTES.JOCKEY_SCHEDULE,
            element: <JockeyPage />,
          },
          {
            path: ROUTES.JOCKEY_INVITATIONS,
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
          {
            path: ROUTES.OWNER_HORSE_MANAGEMENT,
            element: <OwnerPage />,
          },
          {
            path: ROUTES.OWNER_TOURNAMENT_REGISTER,
            element: <OwnerPage />,
          },
          {
            path: ROUTES.OWNER_JOCKEY_LIST,
            element: <OwnerPage />,
          },
          {
            path: ROUTES.OWNER_SCHEDULE,
            element: <OwnerPage />,
          },
          {
            path: ROUTES.OWNER_ENTRIES,
            element: <OwnerPage />,
          },
          {
            path: ROUTES.OWNER_ENTRY_SEND_INVITES,
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
          },
          {
            path: ROUTES.SPECTATOR_PREDICTIONS,
            element: <SpectatorPage />,
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
            path: ROUTES.ADMIN_USER_LIST,
            element: <AdminPage />,
          },
          {
            path: ROUTES.ADMIN_USER_PROFILE,
            element: <AdminPage />,
          },
          { path: "/admin/access", element: <AdminPage /> },
          { path: "/admin/registry", element: <AdminPage /> },
          {
            path: ROUTES.ADMIN_TOURNAMENT_LIST,
            element: <AdminPage />,
          },
          {
            path: ROUTES.ADMIN_TOURNAMENT_DETAIL,
            element: <AdminTournamentDetailPage />,
          },
          { path: "/admin/track", element: <AdminPage /> },
          { path: "/admin/economy", element: <AdminPage /> },
          { path: ROUTES.ADMIN_REPORTS, element: <AdminPage /> },
          {
            path: ROUTES.ADMIN_TOURNAMENT_RACE_NEW,
            element: <AdminRaceDetailPage />,
          },
          {
            path: ROUTES.ADMIN_RACE_DETAIL,
            element: <AdminRaceDetailPage />,
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
