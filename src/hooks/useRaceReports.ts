import { useState, useEffect, useCallback } from "react";
import { AdminService } from "../services/AdminService";
import type { ToastType } from "../types/referee";
import type { RaceReportListItem, Pagination } from "../types/race";
import type { ReportDetailData, StatusFilter } from "../types/report";

export function useRaceReports(addToast: (m: string, t?: ToastType) => void) {
  // ── List state ──
  const [reports, setReports] = useState<RaceReportListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [listLoading, setListLoading] = useState(false);

  // ── Detail state ──
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReportDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // ── Fetch list ──
  const fetchReports = useCallback(
    async (overridePage?: number) => {
      setListLoading(true);
      try {
        const params: Record<string, string | number | undefined> = {
          page: overridePage ?? pagination.page,
          limit: pagination.limit,
        };
        if (statusFilter) params.resultStatus = statusFilter;
        if (search.trim()) params.search = search.trim();
        if (dateFrom) params.dateFrom = new Date(dateFrom).toISOString();
        if (dateTo) params.dateTo = new Date(dateTo).toISOString();

        const res = await AdminService.getReports(
          params as Parameters<typeof AdminService.getReports>[0]
        );
        setReports(res.data);
        setPagination(res.pagination);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to load reports";
        addToast(msg, "error");
      } finally {
        setListLoading(false);
      }
    },
    [
      pagination.page,
      pagination.limit,
      statusFilter,
      search,
      dateFrom,
      dateTo,
      addToast,
    ]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const handleSearch = () => {
    fetchReports(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleStatusFilterChange = (v: StatusFilter) => {
    setStatusFilter(v);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // ── Fetch detail ──
  const openDetail = async (raceId: string) => {
    setSelectedRaceId(raceId);
    setDetailLoading(true);
    try {
      const data = await AdminService.getRaceReport(raceId);
      setDetail(data as unknown as ReportDetailData);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load report details";
      addToast(msg, "error");
      setSelectedRaceId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedRaceId(null);
    setDetail(null);
  };

  // ── Publish ──
  const handlePublish = async () => {
    if (!selectedRaceId) return;
    setPublishLoading(true);
    try {
      await AdminService.publishRace(selectedRaceId);
      addToast(
        "Race result published. Predictions resolved and race completed.",
        "success"
      );
      closeDetail();
      fetchReports();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to publish result";
      addToast(msg, "error");
    } finally {
      setPublishLoading(false);
    }
  };

  return {
    // State
    reports,
    pagination,
    search,
    setSearch,
    statusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    listLoading,
    selectedRaceId,
    detail,
    detailLoading,
    publishLoading,
    // Actions
    handleSearch,
    handleKeyDown,
    handleStatusFilterChange,
    handlePageChange,
    openDetail,
    closeDetail,
    handlePublish,
  };
}
