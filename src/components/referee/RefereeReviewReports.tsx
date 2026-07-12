import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Trophy,
  MapPin,
  User,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { AdminService } from "../../services/AdminService";
import { RefereeService } from "../../services/RefereeService";
import { formatStatus } from "../../utils/formatters";
import type { ToastType } from "../../types/referee";
import type { RefereeReport } from "../../types/referee";
import type { RaceReportListItem, Pagination } from "../../types/race";
import { STATUS_LABELS, STATUS_STYLES } from "../../types/report";

interface RefereeReviewReportsProps {
  addToast: (message: string, type?: ToastType) => void;
}

export default function RefereeReviewReports({
  addToast,
}: RefereeReviewReportsProps) {
  const [reports, setReports] = useState<RaceReportListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [listLoading, setListLoading] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RefereeReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await AdminService.getReports({
        page: pagination.page,
        limit: pagination.limit,
      });
      setReports(res.data);
      setPagination(res.pagination);
    } catch {
      addToast("Failed to load reports", "error");
    } finally {
      setListLoading(false);
    }
  }, [pagination.page, pagination.limit, addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const openDetail = async (raceId: string) => {
    setSelectedRaceId(raceId);
    setDetailLoading(true);
    try {
      const data = await RefereeService.getRefereeRaceReport(raceId);
      setDetail(data);
    } catch {
      addToast("Failed to load report details", "error");
      setSelectedRaceId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedRaceId(null);
    setDetail(null);
  };

  if (selectedRaceId) {
    if (detailLoading || !detail) {
      return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin" />
          </div>
        </div>
      );
    }

    return <ReportDetailView detail={detail} onBack={closeDetail} />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
          Review Reports
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Submitted race reports from your assigned races.
        </p>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {listLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-[#064E3B] animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No reports found</p>
            <p className="text-xs mt-1">
              Reports will appear here once you submit results for your assigned
              races.
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
                        {STATUS_LABELS[r.reportStatus] ||
                          formatStatus(r.reportStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openDetail(r.raceId)}
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
              <span className="font-bold text-slate-700">
                {pagination.total}
              </span>{" "}
              reports
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  handlePageChange(Math.max(1, pagination.page - 1))
                }
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
                      onClick={() => handlePageChange(pageNum)}
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
                  handlePageChange(
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
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatFinishTime(val: string | null | undefined): string {
  if (!val) return "—";
  const num = parseFloat(val);
  if (isNaN(num) || num < 0) return val;
  const totalSeconds = Math.floor(num);
  const fraction = val.includes(".") ? val.substring(val.indexOf(".")) : "";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}${fraction}`;
}

function ReportDetailView({
  detail,
  onBack,
}: {
  detail: RefereeReport;
  onBack: () => void;
}) {
  const { race, report, placements } = detail;
  const allViolations = (placements || []).flatMap(
    (p) =>
      p.violations?.map((v) => ({ ...v, laneNumber: p.laneNumber, horseName: p.horse.name })) || []
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="text-xs font-bold text-slate-500 hover:text-[#064E3B] flex items-center gap-1 transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Reports
      </button>

      <div className="border-b border-[#064E3B]/10 pb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            {race.name}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {race.venue || "Unknown"} • {race.distanceMeters}m • Track:{" "}
            {race.trackCondition || "—"}
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
            report?.status === "published"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : report?.status === "referee_confirmed"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
          )}
        >
          {STATUS_LABELS[report?.status || ""] ||
            formatStatus(report?.status ?? "")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-sm text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4" /> Race Information
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Distance</span>
              <span className="font-bold text-slate-800">
                {race.distanceMeters ? `${race.distanceMeters}m` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Track</span>
              <span className="font-bold text-slate-800 capitalize">
                {race.trackCondition || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Scheduled</span>
              <span className="font-bold text-slate-800">
                {formatDate(race.scheduledAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Status</span>
              <span className="font-bold text-slate-800 capitalize">
                {formatStatus(race.status ?? "")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-sm text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <User className="w-4 h-4" /> Assigned Referee
          </h3>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-[#064E3B]/10 flex items-center justify-center">
              <User className="w-4 h-4 text-[#064E3B]" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {report?.referee?.fullName || detail.referee?.fullName || "—"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-sm text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4" /> Report Details
          </h3>
          {report ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">
                  Confirmed At
                </span>
                <span className="font-bold text-slate-800">
                  {formatDate(report.refereeConfirmedAt)}
                </span>
              </div>
              {report.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">
                    Published At
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatDate(report.publishedAt)}
                  </span>
                </div>
              )}
              {report.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5">
                    Referee Notes
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {report.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No report submitted yet
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Trophy className="w-4 h-4" /> Race Placements
        </h3>
        {placements.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">
            No placements recorded
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Pos
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Lane
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Horse
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Jockey
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Time
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="text-left py-2 px-3 text-[10px] font-black text-slate-400 uppercase">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {placements.map((p) => (
                  <tr
                    key={p.entryId}
                    className={cn(
                      "border-b border-slate-50 transition-colors hover:bg-slate-50/50",
                      (p.finishStatus === "dnf" ||
                        p.finishStatus === "dsq" ||
                        p.finishStatus === "dns") &&
                        "opacity-50"
                    )}
                  >
                    <td className="py-2.5 px-3 font-label font-bold text-slate-500">
                      {p.finishStatus === "finished"
                        ? `#${p.finishedPosition}`
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-label text-slate-500">
                      {p.laneNumber ?? "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800">
                        {p.horse.name}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({p.horse.breed})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.jockey?.fullName || "—"}
                    </td>
                    <td className="py-2.5 px-3 font-label font-bold text-slate-600">
                      {formatFinishTime(p.finishTime)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                          p.finishStatus === "finished"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.finishStatus === "dsq"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : p.finishStatus === "dns"
                                ? "bg-slate-100 text-slate-500 border-slate-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {p.finishStatus?.toUpperCase() || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-label font-bold text-slate-600">
                      {p.points ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {allViolations.length > 0 && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-orange-600" /> Violations (
            {allViolations.length})
          </h3>
          <div className="space-y-2">
            {allViolations.map((v: any) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-orange-50/40 border border-orange-200/80 rounded-xl text-xs text-orange-950"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-orange-900">
                    Lane {v.laneNumber} — {v.horseName}
                  </p>
                  <p className="text-[10px] text-orange-800 mt-0.5">
                    {v.violationType}
                    {v.note ? ` • ${v.note}` : ""}
                  </p>
                  <p className="text-[9px] text-orange-600 mt-0.5 capitalize">
                    {v.severity?.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="text-[9px] font-label font-bold text-orange-700 ml-3 shrink-0">
                  {formatDate(v.occurredAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
