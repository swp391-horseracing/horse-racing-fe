import { useLeaderboard } from "../../hooks/useLeaderboard.ts";

export interface TransformedHorseRow {
  rank: number;
  horse: {
    id: string;
    name: string;
    imageUrl: string | null;
    earnings: number;
    winRate: number;
    speed: number;
  };
}

export function HorseLeaderboardView() {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    horseRows,
    loading,
  } = useLeaderboard();

  const top3 = horseRows.slice(0, 3);
  const paginatedRows = horseRows;

  return (
      <div className="space-y-6">
        {/* Hero Cards */}
        {page === 1 && horseRows.length > 0 && top3.length > 0 && (
            <div
                className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-opacity duration-200 ${
                    loading ? "opacity-50" : "opacity-100"
                }`}
            >
              {top3.map((row, i) => {
                const horse = row.horse;

                return (
                    <div
                        key={horse.id}
                        className="relative rounded-2xl border border-[#064E3B]/10 bg-white p-6 text-slate-900 shadow-sm"
                    >
                      <div className="absolute left-4 top-4 rounded-sm bg-[#064E3B] px-2.5 py-1 text-xs font-bold text-white">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="flex flex-col items-start gap-4 pt-5">
                        <div className="h-40 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                          {horse.imageUrl?.trim() ? (
                              <img
                                  src={horse.imageUrl}
                                  alt={horse.name}
                                  className="h-full w-full object-cover"
                              />
                          ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                No Image
                              </div>
                          )}
                        </div>

                        <div className="flex w-full items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-xl font-bold leading-tight text-slate-900">
                              {horse.name}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Earnings
                            </div>
                            <div className="text-xl font-black text-[#064E3B]">
                              ${(horse.earnings * 1000).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-xs">
                          <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase text-slate-500">
                        Overall Win %
                      </span>
                            <span className="font-black text-slate-900">
                        {(horse.winRate * 100).toFixed(1)}%
                      </span>
                          </div>

                          <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase text-slate-500">
                        Speed Figure
                      </span>
                            <span className="font-black text-slate-900">
                        {horse.speed}
                      </span>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* Full Standings */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Full Standings
          </h2>

          {loading && (
              <div className="absolute inset-x-4 top-16 bottom-16 z-10 flex items-center justify-center rounded-lg bg-white/40 backdrop-blur-[1px]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent" />
              </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing{" "}
              {horseRows.length === 0
                  ? "0–0"
                  : `${(page - 1) * pageSize + 1}–${
                      (page - 1) * pageSize + horseRows.length
                  }`}{" "}
              of {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Per page</label>

              <select
                  value={pageSize}
                  disabled={loading}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#064E3B] disabled:opacity-50"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3">Rank</th>
                <th>Competitor</th>
                <th>Earnings</th>
                <th>Overall Win %</th>
                <th>Speed</th>
              </tr>
              </thead>

              <tbody>
              {paginatedRows.length === 0 && !loading ? (
                  <tr>
                    <td
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-400"
                    >
                      No registered competitors found.
                    </td>
                  </tr>
              ) : (
                  paginatedRows.map((row, index) => (
                      <tr
                          key={row.horse.id}
                          className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="py-3 text-slate-500">
                          {(page - 1) * pageSize + index + 1}
                        </td>

                        <td className="py-3 font-medium text-slate-900">
                          {row.horse.name}
                        </td>

                        <td className="py-3 text-slate-700">
                          ${(row.horse.earnings * 1000).toLocaleString()}
                        </td>

                        <td className="py-3 text-slate-700">
                          {(row.horse.winRate * 100).toFixed(1)}%
                        </td>

                        <td className="py-3 text-slate-700">
                          {row.horse.speed}
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-slate-500">
            {page} / {Math.max(totalPages, 1)}
          </span>

            <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={
                    page >= totalPages ||
                    totalPages === 0 ||
                    horseRows.length === 0 ||
                    loading
                }
                className="rounded-lg border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
  );
}