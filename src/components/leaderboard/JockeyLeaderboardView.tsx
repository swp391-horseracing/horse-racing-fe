import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TransformedJockeyRow {
  rank: number;
  jockey: {
    id: string | number;
    name: string;
    points: number;
    wins: number;
    totalRuns: number;
    winRate: number;
  };
}

function formatWinRate(winRate: number) {
  return `${(winRate * 100).toFixed(1)}%`;
}

export function JockeyLeaderboardView({
  sortedRows,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  isLoading,
}: {
  sortedRows: TransformedJockeyRow[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
}) {
  const top3 = sortedRows.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top hero cards — only on page 1 */}
      {page === 1 && sortedRows.length > 0 && top3.length > 0 && (
        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}
        >
          {top3.map((row, i) => {
            const jockey = row.jockey;
            const rankLabel = String(i + 1).padStart(2, "0");
            const initials = jockey.name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={jockey.id}
                className="relative rounded-2xl bg-white text-slate-900 p-6 shadow-sm border border-[#064E3B]/10"
              >
                <div className="absolute left-4 top-4 rounded-sm bg-[#064E3B] px-2.5 py-1 text-xs font-bold text-white">
                  {rankLabel}
                </div>
                <div className="flex flex-col items-start gap-4 pt-5">
                  {/* Jockey Avatar Box */}
                  <div className="flex h-40 w-full items-center justify-center rounded-lg border border-slate-100 bg-gradient-to-br from-[#064E3B]/5 to-emerald-50">
                    <div className="text-4xl font-black text-[#064E3B] tracking-tighter opacity-40">
                      {initials}
                    </div>
                  </div>

                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xl font-bold text-slate-900 leading-tight">
                        {jockey.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                        Points
                      </div>
                      <div className="text-xl font-black text-[#064E3B]">
                        {jockey.points.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase text-slate-500">
                        Win %
                      </span>
                      <span className="font-black text-slate-900">
                        {formatWinRate(jockey.winRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase text-slate-500">
                        Total Runs
                      </span>
                      <span className="font-black text-slate-900">
                        {jockey.totalRuns}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Standings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative">
        <h2 className="font-semibold text-slate-800 mb-3">Full Standings</h2>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-x-4 top-14 bottom-16 bg-white/40 backdrop-blur-[0.5px] z-10 flex items-center justify-center rounded-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent" />
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-600">
              Showing{" "}
              {sortedRows.length === 0
                ? "0–0"
                : `${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + sortedRows.length}`}{" "}
              of {totalItems}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Per page</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                disabled={isLoading}
                className="rounded border px-2 py-1 text-sm bg-white border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#064E3B] disabled:opacity-50"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-2">Rank</th>
                <th>Jockey</th>
                <th>Points</th>
                <th>Wins</th>
                <th>Win %</th>
                <th>Runs</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs font-medium text-slate-400"
                  >
                    No registered jockeys found in this database scope.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, index) => (
                  <tr
                    key={row.jockey.id}
                    className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 text-slate-500">
                      {(page - 1) * pageSize + (index + 1)}
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      {row.jockey.name}
                    </td>
                    <td className="py-3 text-slate-700">
                      {row.jockey.points.toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-700">{row.jockey.wins}</td>
                    <td className="py-3 text-slate-700">
                      {formatWinRate(row.jockey.winRate)}
                    </td>
                    <td className="py-3 text-slate-700">
                      {row.jockey.totalRuns}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="text-xs font-medium text-slate-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={
                page === totalPages || sortedRows.length === 0 || isLoading
              }
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
