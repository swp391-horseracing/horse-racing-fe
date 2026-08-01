import { useState, useEffect, useCallback } from "react";
import { useRef } from "react";
import { HorseService } from "../services/HorseService";
import { JockeyService } from "../services/JockeyService";
import type { TransformedHorseRow } from "../components/leaderboard/HorseLeaderboardView";
import type { TransformedJockeyRow } from "../components/leaderboard/JockeyLeaderboardView";
import type { HorseLeaderboardEntry } from "../types/horse";
import type { JockeyLeaderboardEntry } from "../types/jockey";

export type LeaderboardTab = "horses" | "jockeys";

export function useLeaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("horses");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const requestIdRef = useRef(0);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [horseRows, setHorseRows] = useState<TransformedHorseRow[]>([]);
  const [jockeyRows, setJockeyRows] = useState<TransformedJockeyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: LeaderboardTab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const loadLeaderboardData = useCallback(
    async (tab: LeaderboardTab, currentPage: number, limit: number) => {
      const currentRequestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        if (tab === "horses") {
          const response = await HorseService.getLeaderboard(
            currentPage,
            limit
          );
          if (currentRequestId !== requestIdRef.current) return;

          const rawEntries: HorseLeaderboardEntry[] = response?.data || [];

          const transformedRows: TransformedHorseRow[] = rawEntries.map(
            (item) => ({
              rank: item.rank,
              horse: {
                id: item.horse.id,
                name: item.horse.name,
                imageUrl: item.horse.imageUrl ?? null,
                points: item.totalPoints,
                wins: item.wins,
                totalRaces: item.totalRaces,
                winRate: item.totalRaces > 0 ? item.wins / item.totalRaces : 0,
              },
            })
          );

          const totalCount = response?.pagination?.total ?? rawEntries.length;
          setTotalItems(totalCount);

          if (response?.pagination?.totalPages) {
            setTotalPages(response.pagination.totalPages);
          } else {
            setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
          }
          setHorseRows(transformedRows);
        } else {
          const response = await JockeyService.getLeaderboard(
            currentPage,
            limit
          );
          if (currentRequestId !== requestIdRef.current) return;

          const rawJockeys: JockeyLeaderboardEntry[] = response?.data || [];

          const transformedRows: TransformedJockeyRow[] = rawJockeys.map(
            (item) => ({
              rank: item.rank,
              jockey: {
                id: item.jockey.id,
                name: item.jockey.fullName || "Unknown Jockey",
                points: item.totalPoints,
                wins: item.wins,
                totalRuns: item.totalRaces,
                winRate: item.totalRaces > 0 ? item.wins / item.totalRaces : 0,
              },
            })
          );

          const totalCount = response?.pagination?.total ?? rawJockeys.length;
          setTotalItems(totalCount);

          if (response?.pagination?.totalPages) {
            setTotalPages(response.pagination.totalPages);
          } else {
            setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
          }
          setJockeyRows(transformedRows);
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        console.error("Leaderboard Service Error:", err);
        setError(
          tab === "horses"
            ? "Failed to stream live leaderboard metrics."
            : "Failed to load jockeys. Please try again."
        );
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
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
