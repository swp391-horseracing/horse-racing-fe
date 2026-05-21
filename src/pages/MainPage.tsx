import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ROUTES } from "../router/routes";

export default function MainPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("home");
    
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setIsDarkMode(isDark);
    }, []);

    // Toggle the theme
    const toggleTheme = () => {
        const html = document.documentElement;
        if (isDarkMode) {
            html.classList.remove("dark");
            setIsDarkMode(false);
        } else {
            html.classList.add("dark");
            setIsDarkMode(true);
        }
    };

    const placeholder = `
    Horse racing is an ancient equestrian sport where jockeys (or drivers) compete to determine the fastest horse over a set distance. 
    The sport is heavily regulated by global and regional authorities, featuring major international circuits, elite rankings, and 
    breeding statistics to evaluate racehorses.
    `;

    return (
        <div className="flex flex-col min-h-screen w-full relative">

            {/* HEADER */}
            <header className="flex items-center justify-between p-5 border-b w-full shrink-0 sticky top-0 z-10 bg-background/50 backdrop-blur">

                {/* LEFT: Logo */}
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab("home")}
                        className="text-xl font-bold"
                    >
                        Logo:3
                    </Button>
                </div>

                {/* CENTER: The 3 Section Buttons */}
                <nav className="flex gap-3">
                    <Button
                        className="flex-1"
                        variant={activeTab === "owner" ? "default" : "ghost"}
                        onClick={() => setActiveTab("owner")}
                    >
                        Horse Owner
                    </Button>

                    <Button
                        className="flex-1"
                        variant={activeTab === "jockey" ? "default" : "ghost"}
                        onClick={() => setActiveTab("jockey")}
                    >
                        Jockey
                    </Button>

                    <Button
                        className="flex-1"
                        variant={activeTab === "spectator" ? "default" : "ghost"}
                        onClick={() => setActiveTab("spectator")}
                    >
                        Spectator
                    </Button>
                </nav>

                {/* RIGHT: Login Button */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(ROUTES.LOGIN)}
                    >
                        Login Page
                    </Button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col items-center text-center p-8 gap-8">

                {activeTab === "home" && (
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-5xl font-bold">
                            Welcome to horse racing!
                        </h1>

                        <p className="text-lg">
                            Select a role on dashboard.
                        </p>
                    </div>
                )}

                {activeTab === "owner" && (
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-4xl font-bold">Horse Owner Dashboard</h1>
                        <p className="text-lg">Horse Owner Stuff (Use Case)</p>
                        {[...Array(15)].map((_, index) => (
                            <div key={index} className="border rounded-lg p-4 text-left">
                                <h2 className="font-semibold mb-2">Owner Use Case #{index + 1}</h2>
                                <p>{placeholder}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "jockey" && (
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-4xl font-bold">Jockey Dashboard</h1>
                        <p className="text-lg">Jockey Stuff (Use Case)</p>
                        {[...Array(15)].map((_, index) => (
                            <div key={index} className="border rounded-lg p-4 text-left">
                                <h2 className="font-semibold mb-2">Jockey Use Case #{index + 1}</h2>
                                <p>{placeholder}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "spectator" && (
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-4xl font-bold">Spectator Dashboard</h1>
                        <p className="text-lg">Spectator Stuff (Use Case)</p>
                        {[...Array(15)].map((_, index) => (
                            <div key={index} className="border rounded-lg p-4 text-left">
                                <h2 className="font-semibold mb-2">Spectator Use Case #{index + 1}</h2>
                                <p>{placeholder}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Button
                onClick={toggleTheme}
                variant="outline"
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg text-2xl flex items-center justify-center z-50 bg-background"
            >
                {isDarkMode ? "☀️" : "🌙"}
            </Button>

        </div>
    );
}