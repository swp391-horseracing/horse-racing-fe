import { useState, useEffect } from "react";
import { HorseLeaderboardView } from "../components/HorseLeaderboardView";
import type { TransformedHorseRow } from "../components/HorseLeaderboardView";
import { JockeyLeaderboardView } from "../components/JockeyLeaderboardView";
import { HorseService } from "../services/horseService";
import type { Horse, HorseListResponse } from "../services/horseService";
import type { Jockey } from "../types/jockey.ts";

type LeaderboardTab = "horses" | "jockeys";

interface LeaderboardHorse extends Horse {
  earnings?: number;
  winRate?: number;
  speed?: number;
}

export default function LeaderBoardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("horses");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [horseRows, setHorseRows] = useState<TransformedHorseRow[]>([]);
  const [jockeyRows, setJockeyRows] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboardData() {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "horses") {
          const response: HorseListResponse = await HorseService.getHorses(
            undefined,
            undefined,
            undefined,
            page,
            pageSize
          );

          if (cancelled) return;

          const rawHorses: Horse[] = response?.data || [];

          const transformedRows: TransformedHorseRow[] = rawHorses.map(
            (item: Horse, index: number) => {
              const horse = item as LeaderboardHorse;

              return {
                rank: (page - 1) * pageSize + (index + 1),
                horse: {
                  id: horse.id,
                  name: horse.name,
                  imageUrl: horse.imageUrl || null,
                  /* the horse model doesn't have earnings, winrate, or speed fields yet.
                     using ?? 0 as a placeholder so the page doesn't crash with live data.
                     once backend updates the schema, this will catch the real values automatically.
                  */
                  earnings: horse.earnings ?? 0,
                  winRate: horse.winRate ?? 0,
                  speed: horse.speed ?? 0,
                },
              };
            }
          );

          if (!cancelled) {
            const totalCount = response?.pagination?.total ?? rawHorses.length;
            setTotalItems(totalCount);

            if (response?.pagination?.totalPages) {
              setTotalPages(response.pagination.totalPages);
            } else {
              setTotalPages(Math.max(1, Math.ceil(totalCount / pageSize)));
            }
            setHorseRows(transformedRows);
          }
        } else {
          if (!cancelled) {
            setJockeyRows([]);
            setTotalPages(1);
            setTotalItems(0);
          }
        }
      } catch (err) {
        console.error("Leaderboard Service Error:", err);
        if (!cancelled) {
          setError("Failed to stream live leaderboard metrics.");
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
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Racing Leaderboards
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live historical standings and current performance statistics.
          </p>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => handleTabChange("horses")}
            className={`relative pb-2 text-sm font-bold transition-all ${
              activeTab === "horses"
                ? "text-[#064E3B]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Horses
            {activeTab === "horses" && (
              <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 rounded-full bg-[#064E3B]" />
            )}
          </button>

          <button
            onClick={() => handleTabChange("jockeys")}
            className={`relative pb-2 text-sm font-bold transition-all ${
              activeTab === "jockeys"
                ? "text-[#064E3B]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Jockeys
            {activeTab === "jockeys" && (
              <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 rounded-full bg-[#064E3B]" />
            )}
          </button>
        </div>
      </div>

      <div className="transition-all duration-150">
        {error ? (
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
            totalItems={totalItems}
            isLoading={loading}
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
