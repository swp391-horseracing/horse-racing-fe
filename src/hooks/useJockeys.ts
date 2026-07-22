import { useEffect, useState, useCallback } from "react";
import { JockeyService } from "../services/JockeyService";
import type { Jockey } from "../types/jockey";

export function useJockeys() {
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    search: "",
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadJockeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await JockeyService.getJockeys({
        search: pagination.search,
        page: pagination.page,
        limit: pagination.limit,
      });

      const rawList = res.data || [];
      const mappedList: Jockey[] = rawList.map(
        (item: {
          id: string | number;
          fullName?: string;
          name?: string;
          avatarUrl?: string | null;
          weightKg?: number | null;
          experienceYear?: number | null;
          isRacing?: boolean;
          licenseId?: string;
          winRate?: number;
          totalRuns?: number;
          podiums?: number;
          club?: string;
        }) => ({
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
        })
      );

      setJockeys(mappedList);
      if (res.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...res.pagination,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [pagination.search, pagination.page, pagination.limit]);

  useEffect(() => {
    let active = true;

    const executeFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await JockeyService.getJockeys({
          search: pagination.search,
          page: pagination.page,
          limit: pagination.limit,
        });

        if (!active) return;

        const rawList = res.data || [];
        const mappedList: Jockey[] = rawList.map(
          (item: {
            id: string | number;
            fullName?: string;
            name?: string;
            avatarUrl?: string | null;
            weightKg?: number | null;
            experienceYear?: number | null;
            isRacing?: boolean;
            licenseId?: string;
            winRate?: number;
            totalRuns?: number;
            podiums?: number;
            club?: string;
          }) => ({
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
          })
        );

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
    };

    void executeFetch();

    return () => {
      active = false;
    };
  }, [pagination.search, pagination.page, pagination.limit]);

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
