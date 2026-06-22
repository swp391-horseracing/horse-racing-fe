import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { usePredictions } from "../../hooks/usePredictions";
import { useNavigate } from "react-router-dom";
import type { PredictionStatus } from "../../types/prediction";
import { cn } from "../../lib/utils";

interface PredictionsHubProps {
  addToast: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

const FILTER_TABS: { key: PredictionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "correct", label: "Correct" },
  { key: "incorrect", label: "Incorrect" },
];

const POSITION_LABELS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const STATUS_BADGE: Record<
  string,
  { label: string; class: string }
> = {
  pending: {
    label: "Pending",
    class: "bg-slate-50 border-slate-200 text-slate-500",
  },
  correct: {
    label: "Correct",
    class: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  incorrect: {
    label: "Incorrect",
    class: "bg-rose-50 border-rose-200 text-rose-800",
  },
};

function getStatus(isCorrect: boolean | null): PredictionStatus {
  if (isCorrect === null) return "pending";
  return isCorrect ? "correct" : "incorrect";
}

export function PredictionsHub({ addToast: _addToast }: PredictionsHubProps) {
  const navigate = useNavigate();
  const {
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
  } = usePredictions();

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    loadPredictions();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        handleSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  useEffect(() => {
    if (search !== localSearch) {
      loadPredictions({ search: localSearch });
    }
  }, [page]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body">
      <div className="mb-6">
        <h2 className="font-headline text-3xl text-[#064E3B] mb-2">
          My Predictions
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Track your race predictions and results.
        </p>
      </div>

      <div className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by race name..."
              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-[#064E3B] focus:border-[#064E3B] transition-all"
            />
          </div>

          <div className="flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleStatusChange(tab.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                  statusFilter === tab.key
                    ? "bg-white text-[#064E3B] shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-slate-400">
              Loading predictions...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button
              onClick={() => loadPredictions()}
              className="mt-2 text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className="py-20 text-center">
            <Coins className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">
              {search || statusFilter !== "all"
                ? "No predictions match your filters."
                : "No predictions yet. Start by predicting on a race!"}
            </p>
            {!search && statusFilter === "all" && (
              <button
                onClick={() => navigate("/races")}
                className="mt-3 text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
              >
                Browse races
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40">
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Race
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Horse
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Predicted
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Reward
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {predictions.map((prediction) => {
                    const status = getStatus(prediction.isCorrect);
                    const badge = STATUS_BADGE[status];
                    return (
                      <tr
                        key={prediction.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <button
                            onClick={() =>
                              navigate(`/races/${prediction.race.id}`)
                            }
                            className="font-bold text-slate-800 hover:text-[#064E3B] hover:underline text-left cursor-pointer"
                          >
                            {prediction.race.name}
                          </button>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {prediction.race.venue}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-slate-700">
                            {prediction.predictedEntry.horseName}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-200 bg-white shadow-sm text-xs font-black text-slate-800">
                            {POSITION_LABELS[prediction.predictedPosition] ||
                              prediction.predictedPosition}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-slate-600">
                          {prediction.rewardAmount ? (
                            <span className="text-[#064E3B] font-bold">
                              {prediction.rewardAmount}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-label text-[9px] font-bold uppercase border",
                              badge.class
                            )}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400 hidden md:table-cell">
                          {formatDate(prediction.placedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/20">
                <p className="text-xs text-slate-500 font-medium">
                  Page {page} of {totalPages} ({total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
