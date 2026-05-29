import { Outlet} from "react-router-dom";

export default function LoginLayout() {
    return (
        <div className="relative min-h-screen">
            <Outlet />
        </div>
    );
}