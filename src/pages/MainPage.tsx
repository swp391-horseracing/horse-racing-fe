import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ROUTES } from "../router/routes";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  // Initialize state directly from document.documentElement if available
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line">
            <TabsTrigger value="owner">Horse Owner</TabsTrigger>
            <TabsTrigger value="jockey">Jockey</TabsTrigger>
            <TabsTrigger value="spectator">Spectator</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* RIGHT: Login Button */}
        <div className="flex items-center gap-4">
          <Button onClick={toggleTheme} variant="ghost" size="icon">
            {isDarkMode ? "☀️" : "🌙"}
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              navigate(ROUTES.LOGIN, {
                state: { background: location },
              })
            }
          >
            Login
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center text-center p-8 gap-8">
        {activeTab === "home" && (
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold">Welcome to horse racing!</h1>

            <p className="text-lg">Select a role on dashboard.</p>
          </div>
        )}

        {activeTab === "owner" && (
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold">Horse Owner Dashboard</h1>
            <p className="text-lg">Horse Owner Stuff (Use Case)</p>
            {[...Array(15)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 text-left">
                <h2 className="font-semibold mb-2">
                  Owner Use Case #{index + 1}
                </h2>
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
                <h2 className="font-semibold mb-2">
                  Jockey Use Case #{index + 1}
                </h2>
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
                <h2 className="font-semibold mb-2">
                  Spectator Use Case #{index + 1}
                </h2>
                <p>{placeholder}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}