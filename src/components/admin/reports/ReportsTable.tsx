import {
  FileText,
  Eye,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { formatStatus } from "../../../utils/statusFormat";
import type { RaceReportListItem, Pagination } from "../../../types/race";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  formatDate,
} from "../../../types/report";

interface ReportsTableProps {
  reports: RaceReportListItem[];
  pagination: Pagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (raceId: string) => void;
}

export default function ReportsTable({
  reports,
  pagination,
  loading,
  onPageChange,
  onViewDetail,
}: ReportsTableProps) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 text-[#064E3B] animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold">No reports found</p>
          <p className="text-xs mt-1">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                  Race
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                  Tournament
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                  Referee
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                  Submitted
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.reportId}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {r.raceName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {r.tournamentName || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {r.refereeName || "—"}
                  </td>
                  <td className="py-3 px-4 font-label text-slate-500">
                    {formatDate(r.refereeConfirmedAt)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
                        STATUS_STYLES[r.reportStatus] ||
                          "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      {r.reportStatus === "referee_confirmed" ? (
                        <Clock className="w-2.5 h-2.5" />
                      ) : r.reportStatus === "published" ? (
                        <CheckCircle className="w-2.5 h-2.5" />
                      ) : null}
                      {STATUS_LABELS[r.reportStatus] || formatStatus(r.reportStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewDetail(r.raceId)}
                      className="text-[10px] font-black uppercase text-[#064E3B] hover:text-white bg-[#064E3B]/5 hover:bg-[#064E3B] px-3 py-1.5 rounded-lg border border-[#064E3B]/20 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
          <p className="text-[10px] text-slate-500 font-semibold">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>
            –
            <span className="font-bold text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">{pagination.total}</span>{" "}
            reports
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from(
              { length: Math.min(pagination.totalPages, 5) },
              (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-[10px] font-bold transition cursor-pointer",
                      pagination.page === pageNum
                        ? "bg-[#064E3B] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 border border-slate-200"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
            <button
              onClick={() =>
                onPageChange(
                  Math.min(pagination.totalPages, pagination.page + 1)
                )
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
