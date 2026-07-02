import { useState } from "react";
import {
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Trophy,
  User,
  MapPin,
  FileText,
  Loader2,
  Construction,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type {
  ReportDetailData,
  ReportDetailPlacement,
} from "../../../types/report";
import {
  STATUS_LABELS,
  STATUS_STYLES,
  formatDate,
  formatFinishTime,
} from "../../../types/report";
import RejectInfoModal from "./RejectInfoModal";
import PublishConfirmModal from "./PublishConfirmModal";
import { formatStatus } from "../../../utils/statusFormat";

interface ReportDetailViewProps {
  detail: ReportDetailData | null;
  detailLoading: boolean;
  publishLoading: boolean;
  onBack: () => void;
  onPublish: () => void;
}

export default function ReportDetailView({
  detail,
  detailLoading,
  publishLoading,
  onBack,
  onPublish,
}: ReportDetailViewProps) {
  const [showRejectInfo, setShowRejectInfo] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  if (detailLoading || !detail) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin" />
        </div>
      </div>
    );
  }

  const { race, referees, referee, report, placements } = detail as any;
  const violations = placements?.filter((p: any) => p.violation !== null) || [];
  const isPending = report?.status === "referee_confirmed";

  // Normalize referees to an array
  const activeReferees = referees || (referee ? [referee] : []);

  // Normalize course details
  const venueStr =
    race.course?.name || race.courseName || race.venue || "Unknown Venue";
  const cityStr = race.course?.city || race.courseCity || "";
  const surfaceStr = race.course?.surfaceType || race.surfaceType || "";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs font-bold text-slate-500 hover:text-[#064E3B] flex items-center gap-1 transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Reports
      </button>

      {/* Header */}
      <div className="border-b border-[#064E3B]/10 pb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            {race.name}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {race.tournament?.name || "No Tournament"} • {venueStr}
            {cityStr ? `, ${cityStr}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
            STATUS_STYLES[report?.status || "draft"] ||
              "bg-slate-100 text-slate-600 border-slate-200"
          )}
        >
          {STATUS_LABELS[report?.status || "draft"] ||
            formatStatus(report?.status ?? "")}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Race Info */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-sm text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4" /> Race Information
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Race #</span>
              <span className="font-bold text-slate-800">
                {race.raceNumber ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Distance</span>
              <span className="font-bold text-slate-800">
                {race.distanceMeters ? `${race.distanceMeters}m` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Surface</span>
              <span className="font-bold text-slate-800 capitalize">
                {surfaceStr || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Lanes</span>
              <span className="font-bold text-slate-800">
                {race.laneCount ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Scheduled</span>
              <span className="font-bold text-slate-800">
                {formatDate(race.scheduledAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Race Status</span>
              <span className="font-bold text-slate-800 capitalize">
                {formatStatus(race.status ?? "")}
              </span>
            </div>
          </div>
        </div>

        {/* Referee Info */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-sm text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <User className="w-4 h-4" /> Assigned Referees
          </h3>
          {activeReferees.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No referees assigned
            </p>
          ) : (
            <div className="space-y-3">
              {activeReferees.map((ref: any) => (
                <div
                  key={ref.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-[#064E3B]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#064E3B]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {ref.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Assigned {formatDate(ref.assignedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Info */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-sm text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4" /> Report Details
          </h3>
          {report ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">
                  Confirmed By
                </span>
                <span className="font-bold text-slate-800">
                  {report.referee?.fullName || "—"}
                </span>
              </div>
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

      {/* Placements Table */}
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
                {placements.map((p: ReportDetailPlacement) => (
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

      {/* Violations */}
      {violations.length > 0 && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-orange-600" /> Violations (
            {violations.length})
          </h3>
          <div className="space-y-2">
            {violations.map((p: ReportDetailPlacement) => {
              const v = p.violation!;
              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 bg-orange-50/40 border border-orange-200/80 rounded-xl text-xs text-orange-950"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-orange-900">
                      Lane {p.laneNumber} — {p.horse.name}
                    </p>
                    <p className="text-[10px] text-orange-800 mt-0.5">
                      {v.violationType}
                      {v.note ? ` • ${v.note}` : ""}
                    </p>
                    <p className="text-[9px] text-orange-600 mt-0.5">
                      Severity:{" "}
                      <span className="font-bold capitalize">
                        {v.severity?.replace(/_/g, " ")}
                      </span>
                    </p>
                  </div>
                  <span className="text-[9px] font-label font-bold text-orange-700 ml-3 shrink-0">
                    {formatDate(v.occurredAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setShowRejectInfo(true)}
            className="text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
          >
            <Construction className="w-3.5 h-3.5" />
            Reject Report
            <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">
              In Dev
            </span>
          </button>
          <button
            onClick={() => setShowPublishConfirm(true)}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Publish Official Results
          </button>
        </div>
      )}

      {/* Modals */}
      <RejectInfoModal
        isOpen={showRejectInfo}
        onClose={() => setShowRejectInfo(false)}
      />
      <PublishConfirmModal
        isOpen={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={onPublish}
        loading={publishLoading}
      />
    </div>
  );
}
