import {createBrowserRouter} from "react-router-dom";
import {ROUTES} from "./routes.tsx";
import MainLayout from "../layouts/MainLayout.tsx";
import CalendarPage from "../pages/CalendarPage.tsx";
import ExamplePage from "../pages/GuidesPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import HorsePage from "../pages/HorsePage.tsx";

export const router = createBrowserRouter([
    {
        path: ROUTES.CALENDAR_PAGE,
        element: <MainLayout/>,
        children:[{index: true, element: <CalendarPage/>}],
    },
    {
        path: ROUTES.DASHBOARD_PAGE,
        element: <MainLayout/>,
        children:[{index: true, element: <DashboardPage/>}]
    },
    {
        path: ROUTES.HORSE_PAGE,
        element: <MainLayout/>,
        children:[{index: true, element: <HorsePage/>}]
    },
    {
        path: ROUTES.GUIDE_PAGE,
        children:[{index: true, element: <ExamplePage/>}],
    },
])