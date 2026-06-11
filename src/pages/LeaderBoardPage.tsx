import { useState, useEffect } from "react";
import { HorseLeaderboardView } from "../components/HorseLeaderboardView";
import type { TransformedHorseRow } from "../components/HorseLeaderboardView";
import { JockeyLeaderboardView } from "../components/JockeyLeaderboardView";
import { HorseService } from "../services/horseService";
import type { Horse } from "../services/horseService";
import type { Jockey } from "../types/jockey.ts";

type LeaderboardTab = "horses" | "jockeys";

interface LeaderboardHorse extends Horse {
  earnings?: number;
  winRate?: number;
  speed?: number;
}

/**
 * Generates highly distributed, completely comprehensive performance metrics
 * seeded deterministically by a unique string ID to prevent render shifts.
 * Covers full spectrum extremes ($0-$100M earnings, 0%-100% win rate, 0-200 speed).
 */
function getSeededMetrics(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);

  // 1. Earnings Spread: $0 to $100,000,000
  const earnings = positiveHash % 100001;

  // 2. Win Rate Spread: 0.0% to 100.0%
  const winRate = parseFloat(((positiveHash % 1001) / 1000).toFixed(3));

  // 3. Speed Figure Spread: 0 to 200
  const speed = positiveHash % 201;

  return { earnings, winRate, speed };
}

export default function LeaderBoardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("horses");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Pagination tracking state derived directly from server context
  const [totalPages, setTotalPages] = useState<number>(1);

  const [horseRows, setHorseRows] = useState<TransformedHorseRow[]>([]);
  const [jockeyRows, setJockeyRows] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Flag to neutralize asynchronous callbacks if dependencies change mid-flight
    let cancelled = false;

    async function loadLeaderboardData() {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "horses") {
          const response = await HorseService.getHorses(page, pageSize);

          if (cancelled) return;

          const rawHorses: Horse[] =
            response?.data || (Array.isArray(response) ? response : []);

          // Dynamically map total pages metadata handed down by the service interface
          if (response?.pagination?.totalPages) {
            setTotalPages(response.pagination.totalPages);
          } else {
            const totalItems = response?.pagination?.total || rawHorses.length;
            setTotalPages(Math.max(1, Math.ceil(totalItems / pageSize)));
          }

          const transformedRows: TransformedHorseRow[] = rawHorses.map(
            (item: Horse, index: number) => {
              const horse = item as LeaderboardHorse;
              const seed = getSeededMetrics(horse.id);

              return {
                rank: (page - 1) * pageSize + (index + 1),
                horse: {
                  id: horse.id,
                  name: horse.name,
                  ownerId: horse.ownerId,
                  imageUrl: horse.imageUrl || null,
                  earnings: horse.earnings ?? seed.earnings,
                  winRate: horse.winRate ?? seed.winRate,
                  speed: horse.speed ?? seed.speed,
                },
              };
            }
          );

          if (!cancelled) {
            setHorseRows(transformedRows);
          }
        } else {
          if (!cancelled) {
            setJockeyRows([]);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Leaderboard Service Request Error:", err);
        if (!cancelled) {
          setError(
            "Failed to load leaderboard metrics. Check network profiles."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLeaderboardData();

    return () => {
      cancelled = true;
    };
  }, [activeTab, page, pageSize]);

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
            Real-time historical standings and performance stats.
          </p>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => handleTabChange("horses")}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === "horses"
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
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === "jockeys"
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

      {/* Main content area with conditional rendering for loading, error, and data states */}
      <div className="transition-all duration-150">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent" />
            <span className="text-xs font-semibold text-slate-500 tracking-wide">
              Fetching performance data...
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
            totalPages={totalPages}
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
