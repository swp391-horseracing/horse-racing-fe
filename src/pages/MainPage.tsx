/**
 * PAGES TEMPLATE
 * Used for rendering pages
 */

import {Button} from "../components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {ROUTES} from "../router/routes.tsx";


export default function ExamplePage() {

    const navigate = useNavigate();

    return (
        <div className="h-screen bg-blue-50 flex flex-col justify-center items-center w-full">
            <Button
                className="border-2 border-blue-800"
                onClick={() => navigate(ROUTES.EXAMPLE)}
            >
                Move to login page
            </Button>
            <Button
                className="border-2 border-blue-800"
                onClick={() => navigate(ROUTES.EXAMPLE)}
            >
                Move to main page
            </Button>
        </div>
    );
}

/**
 * RULES:
 * - Does not call api
 * - Does not contain big logic
 */