import type { ToastType } from "../../types/referee";
import ReportsListFilters from "./reports/ReportsListFilters";
import ReportsTable from "./reports/ReportsTable";
import ReportDetailView from "./reports/ReportDetailView";
import { useRaceReports } from "../../hooks/useRaceReports";

// ─── Component ────────────────────────────────────────────────────────────────

export default function RaceReportsManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const {
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
    handleSearch,
    handleKeyDown,
    handleStatusFilterChange,
    handlePageChange,
    openDetail,
    closeDetail,
    handlePublish,
  } = useRaceReports(addToast);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (selectedRaceId) {
    return (
      <ReportDetailView
        detail={detail}
        detailLoading={detailLoading}
        publishLoading={publishLoading}
        onBack={closeDetail}
        onPublish={handlePublish}
      />
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Race Reports Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review referee-submitted race reports, verify placements and
          violations, and publish official results (UC-AD-08).
        </p>
      </div>

      <ReportsListFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
      />

      <ReportsTable
        reports={reports}
        pagination={pagination}
        loading={listLoading}
        onPageChange={handlePageChange}
        onViewDetail={openDetail}
      />
    </div>
  );
}
