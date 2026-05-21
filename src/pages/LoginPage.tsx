import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ROUTES } from "../router/routes";

export default function LoginPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <h1 className="text-3xl font-bold mb-6">This is the Login Page</h1>

            <Button variant="outline" onClick={() => navigate(ROUTES.HOME)}>
                Back to Home
            </Button>
        </div>
    );
}