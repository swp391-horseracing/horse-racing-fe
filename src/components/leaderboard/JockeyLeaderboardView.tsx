import type { Jockey } from "../../types/jockey";
import { useLeaderboard } from "../../hooks/useLeaderboard";

function formatWinRate(winRate: number) {
  return `${(winRate * 100).toFixed(1)}%`;
}

export function JockeyLeaderboardView() {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useLeaderboard();

  // TODO: Replace with API data
  const data: Jockey[] = [];

  const top3 = data.slice(0, 3);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginatedRows = data.slice(
      (page - 1) * pageSize,
      page * pageSize
  );

  return (
      <div className="space-y-6">
        {/* Top Hero Cards */}
        {top3.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {top3.map((jockey, i) => {
                const initials = jockey.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("");

                return (
                    <div
                        key={jockey.id}
                        className="relative rounded-2xl border border-[#064E3B]/10 bg-white p-6 shadow-sm"
                    >
                      <div className="absolute left-4 top-4 rounded-sm bg-[#064E3B] px-2.5 py-1 text-xs font-bold text-white">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="flex flex-col items-start gap-4 pt-5">
                        <div className="flex h-40 w-full items-center justify-center rounded-lg border border-slate-100 bg-gradient-to-br from-[#064E3B]/5 to-emerald-50">
                          <div className="text-4xl font-black tracking-tighter text-[#064E3B] opacity-40">
                            {initials}
                          </div>
                        </div>

                        <div className="flex w-full items-start justify-between gap-4">
                          <div>
                            <div className="text-xl font-bold text-slate-900">
                              {jockey.name}
                            </div>

                            <div className="mt-1 text-xs font-medium text-slate-500">
                              {jockey.club}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-semibold uppercase text-slate-500">
                              Win Rate
                            </div>

                            <div className="text-xl font-black text-[#064E3B]">
                              {formatWinRate(jockey.winRate)}
                            </div>
                          </div>
                        </div>

                        <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-xs">
                          <div className="flex justify-between">
                      <span className="font-semibold uppercase text-slate-500">
                        Total Runs
                      </span>

                            <span className="font-black">
                        {jockey.totalRuns}
                      </span>
                          </div>

                          <div className="flex justify-between">
                      <span className="font-semibold uppercase text-slate-500">
                        Podiums
                      </span>

                            <span className="font-black">
                        {jockey.podiums}
                      </span>
                          </div>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">
            Full Standings
          </h2>

          <div className="overflow-x-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing{" "}
                {data.length === 0
                    ? "0–0"
                    : `${(page - 1) * pageSize + 1}–${Math.min(
                        page * pageSize,
                        data.length
                    )}`}{" "}
                of {data.length}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">
                  Per page
                </label>

                <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded border px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
              <tr className="text-left text-xs uppercase text-slate-500">
                <th className="py-2">Rank</th>
                <th>Jockey</th>
                <th>Club</th>
                <th>Win %</th>
                <th>Runs</th>
                <th>Podiums</th>
              </tr>
              </thead>

              <tbody>
              {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                        colSpan={6}
                        className="py-8 text-center text-slate-400"
                    >
                      No jockey data available.
                    </td>
                  </tr>
              ) : (
                  paginatedRows.map((j, index) => (
                      <tr
                          key={j.id}
                          className="border-t border-slate-100"
                      >
                        <td className="py-3">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td>{j.name}</td>
                        <td>{j.club}</td>
                        <td>{formatWinRate(j.winRate)}</td>
                        <td>{j.totalRuns}</td>
                        <td>{j.podiums}</td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm">
            {page} / {totalPages}
          </span>

            <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || data.length === 0}
                className="rounded-lg border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
  );
}