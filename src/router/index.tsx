import { createBrowserRouter } from "react-router-dom";
import MainPage from "../pages/MainPage";
import LoginPage from "../pages/LoginPage";
import { ROUTES } from "./routes";

export const router = createBrowserRouter([
    {
        path: ROUTES.HOME,
        element: <MainPage />
    },
    {
        path: ROUTES.LOGIN,
        element: <LoginPage />
    }
]);