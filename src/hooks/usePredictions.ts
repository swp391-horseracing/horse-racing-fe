import { useState, useCallback } from "react";
import { PredictionService } from "../services/PredictionService";
import type {
  Prediction,
  PredictionFilters,
  PredictionStatus,
} from "../types/prediction";

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PredictionStatus | "all">(
    "all"
  );

  const loadPredictions = useCallback(
    async (overrideParams?: Partial<PredictionFilters>) => {
      try {
        setLoading(true);
        setError(null);
        const params: PredictionFilters = {
          page: overrideParams?.page ?? page,
          limit: 10,
        };
        if (overrideParams?.search ?? search) {
          params.search = overrideParams?.search ?? search;
        }
        if (
          (overrideParams?.status ?? statusFilter) !== "all" &&
          (overrideParams?.status ?? statusFilter)
        ) {
          params.status =
            (overrideParams?.status ?? statusFilter) as PredictionStatus;
        }
        const data = await PredictionService.getMyPredictions(params);
        setPredictions(data.data);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load predictions"
        );
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    },
    [page, search, statusFilter]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    []
  );

  const handleStatusChange = useCallback(
    (value: PredictionStatus | "all") => {
      setStatusFilter(value);
      setPage(1);
    },
    []
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    predictions,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    statusFilter,
    loadPredictions,
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
  };
}
