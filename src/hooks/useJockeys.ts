import { useEffect, useState, useCallback } from "react";
import { JockeyService } from "../services/JockeyService";
import type { Jockey } from "../types/jockey";

export function useJockeys() {
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<{
    search: string;
    status: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadJockeys = useCallback(async () => {
    let active = true;

    try {
      setLoading(true);
      setError(null);

      const res = await JockeyService.getJockeys({
        search: pagination.search,
        status:
          pagination.status !== "all" ? (pagination.status as any) : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (!active) return;

      const rawList = res.data || [];
      const mappedList: Jockey[] = rawList.map((item: any) => ({
        id: item.id,
        name: item.fullName || item.name || "Unknown Jockey",
        fullName: item.fullName || item.name || "Unknown Jockey",
        avatarUrl: item.avatarUrl ?? null,
        weightKg: item.weightKg ?? null,
        experienceYear: item.experienceYear ?? null,
        isRacing: item.isRacing ?? false,
        licenseId: item.licenseId ?? "",
        winRate: item.winRate ?? 0,
        totalRuns: item.totalRuns ?? 0,
        podiums: item.podiums ?? 0,
        club: item.club ?? "Independent",
      }));

      setJockeys(mappedList);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...res.pagination,
        }));
      }
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Load failed");
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }

    return () => {
      active = false;
    };
  }, [pagination.search, pagination.status, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJockeys();
  }, [loadJockeys]);

  return {
    jockeys,
    loading,
    error,
    pagination,
    setPagination,
    loadJockeys,
  };
}

export default useJockeys;
