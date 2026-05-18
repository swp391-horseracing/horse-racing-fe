import {createBrowserRouter} from "react-router-dom";
import ExamplePage from "../pages/MainPage.tsx";
import {ROUTES} from "./routes.tsx";

export const router = createBrowserRouter([
    {
        path: ROUTES.EXAMPLE,
        children:[{index: true,element: <ExamplePage/>}]
    }
])