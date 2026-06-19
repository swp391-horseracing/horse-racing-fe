import { useState, useEffect, useCallback } from "react";
import { HorseService } from "../services/horseService";
import type { Horse } from "../services/horseService";
import { JockeyService } from "../services/jockeyService";
import type { Jockey } from "../types/jockey";
import type { TransformedHorseRow } from "../components/leaderboard/HorseLeaderboardView";

export type LeaderboardTab = "horses" | "jockeys";

interface LeaderboardHorse extends Horse {
  earnings?: number;
  winRate?: number;
  speed?: number;
}

export function useLeaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("horses");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [horseRows, setHorseRows] = useState<TransformedHorseRow[]>([]);
  const [jockeyRows, setJockeyRows] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: LeaderboardTab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const loadLeaderboardData = useCallback(
    async (tab: LeaderboardTab, currentPage: number, limit: number) => {
      setLoading(true);
      setError(null);

      try {
        if (tab === "horses") {
          const response = await HorseService.getHorses(
            undefined,
            undefined,
            undefined,
            currentPage,
            limit
          );

          const rawHorses: Horse[] = response?.data || [];

          const transformedRows: TransformedHorseRow[] = rawHorses.map(
            (item: Horse, index: number) => {
              const horse = item as LeaderboardHorse;

              return {
                rank: (currentPage - 1) * limit + (index + 1),
                horse: {
                  id: horse.id,
                  name: horse.name,
                  imageUrl: horse.imageUrl || null,
                  earnings: horse.earnings ?? 0,
                  winRate: horse.winRate ?? 0,
                  speed: horse.speed ?? 0,
                },
              };
            }
          );

          const totalCount = response?.pagination?.total ?? rawHorses.length;
          setTotalItems(totalCount);

          if (response?.pagination?.totalPages) {
            setTotalPages(response.pagination.totalPages);
          } else {
            setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
          }
          setHorseRows(transformedRows);
        } else {
          // Fetch real jockey rankings
          const data = await JockeyService.getJockeysByRanking();
          setJockeyRows(data);
          setTotalItems(data.length);
          setTotalPages(Math.max(1, Math.ceil(data.length / limit)));
        }
      } catch (err) {
        console.error("Leaderboard Service Error:", err);
        setError(
          tab === "horses"
            ? "Failed to stream live leaderboard metrics."
            : "Failed to load jockeys. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (cancelled) return;
      await loadLeaderboardData(activeTab, page, pageSize);
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [activeTab, page, pageSize, loadLeaderboardData]);

  return {
    activeTab,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    horseRows,
    jockeyRows,
    loading,
    error,
    handleTabChange,
  };
}
