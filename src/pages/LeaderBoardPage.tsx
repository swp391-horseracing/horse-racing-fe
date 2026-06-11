import { useState, useEffect } from "react";
import { HorseLeaderboardView } from "../components/HorseLeaderboardView";
import type { TransformedHorseRow } from "../components/HorseLeaderboardView";
import { JockeyLeaderboardView } from "../components/JockeyLeaderboardView";
import { HorseService } from "../services/horseService";
import type { Horse } from "../services/horseService";

import type { Jockey } from "../types/jockey.ts";

type LeaderboardTab = "horses" | "jockeys";

// Extend the core API Horse type to allow optional performance metrics
interface LeaderboardHorse extends Horse {
    earnings?: number;
    winRate?: number;
    speed?: number;
}

export default function LeaderBoardPage() {
    const [activeTab, setActiveTab] = useState<LeaderboardTab>("horses");

    // Shared pagination control values
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // State buckets for API tracking explicitly typed
    const [horseRows, setHorseRows] = useState<TransformedHorseRow[]>([]);
    const [jockeyRows, setJockeyRows] = useState<Jockey[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Hook into the core API services when navigation parameters shift
    useEffect(() => {
        async function loadLeaderboardData() {
            setLoading(true);
            setError(null);

            try {
                if (activeTab === "horses") {
                    // Fetch raw entries directly from the backend via HorseService
                    const response = await HorseService.getHorses(page, pageSize);

                    // Safeguard incoming structure
                    const rawHorses: Horse[] = response?.data || (Array.isArray(response) ? response : []);

                    // Map raw data profiles into the strict metadata structure 
                    const transformedRows: TransformedHorseRow[] = rawHorses.map((item: Horse, index: number) => {
                        const horse = item as LeaderboardHorse;

                        return {
                            rank: (page - 1) * pageSize + (index + 1),
                            horse: {
                                id: horse.id,
                                name: horse.name,
                                ownerId: horse.ownerId,
                                imageUrl: horse.imageUrl || null,
                                earnings: horse.earnings ?? (Math.floor(Math.random() * 80) + 20),
                                winRate: horse.winRate ?? parseFloat((Math.random() * 0.4 + 0.1).toFixed(3)),
                                speed: horse.speed ?? (Math.floor(Math.random() * 30) + 85),
                            }
                        };
                    });

                    setHorseRows(transformedRows);
                } else {
                    // Placeholder structure for JockeyService integration
                    setJockeyRows([]);
                }
            } catch (err) {
                console.error("Leaderboard Service Request Error:", err);
                setError("Failed to stream real-time leaderboard positions. Check network profiles.");
            } finally {
                setLoading(false);
            }
        }

        loadLeaderboardData();
    }, [activeTab, page, pageSize]);

    // Clean state resets to avoid cross-tab page boundary out of bound indices
    const handleTabChange = (tab: LeaderboardTab) => {
        setActiveTab(tab);
        setPage(1);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Combined Header Title and Tab Switcher Line */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Racing Leaderboards
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time historical earnings, performance standings, and efficiency ratings.
                    </p>
                </div>

                <div className="flex gap-6">
                    <button
                        onClick={() => handleTabChange("horses")}
                        className={`pb-2 text-sm font-bold transition-all relative ${activeTab === "horses"
                                ? "text-[#064E3B]"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Horses
                        {activeTab === "horses" && (
                            <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[#064E3B] rounded-full" />
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange("jockeys")}
                        className={`pb-2 text-sm font-bold transition-all relative ${activeTab === "jockeys"
                                ? "text-[#064E3B]"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        Jockeys
                        {activeTab === "jockeys" && (
                            <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[#064E3B] rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            <div className="transition-all duration-150">
                {loading ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent" />
                        <span className="text-xs font-semibold text-slate-500 tracking-wide">
                            Fetching circuit performance records...
                        </span>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                        {error}
                    </div>
                ) : activeTab === "horses" ? (
                    <HorseLeaderboardView
                        sortedRows={horseRows}
                        page={page}
                        setPage={setPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                    />
                ) : (
                    <JockeyLeaderboardView
                        data={jockeyRows}
                        page={page}
                        setPage={setPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                    />
                )}
            </div>
        </div>
    );
}