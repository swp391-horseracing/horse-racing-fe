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

export function HorseLeaderboardView({
  sortedRows,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  isLoading,
}: {
  sortedRows: TransformedHorseRow[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
}) {
  const top3 = sortedRows.slice(0, 3);
  const paginatedRows = sortedRows;

  return (
    <div className="space-y-6">
      {/* keeping hero cards visible on page 1 so everyone can see the full UI layout.
          the api doesn't have data for earnings/winrate/speed yet, so it will show 0 for now.
          once the backend team adds those columns, this will populate automatically.
      */}
      {page === 1 && sortedRows.length > 0 && top3.length > 0 && (
        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}
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
                    {horse.imageUrl && horse.imageUrl.trim() !== "" ? (
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

      {/* Full Standings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative">
        <h2 className="mb-3 font-semibold text-slate-800">Full Standings</h2>

        {/* Translucent Overlay */}
        {isLoading && (
          <div className="absolute inset-x-4 top-14 bottom-16 bg-white/40 backdrop-blur-[0.5px] z-10 flex items-center justify-center rounded-lg">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent" />
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="mb-3 flex items-center justify-between">
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
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-2">Rank</th>
                <th>Competitor</th>
                <th>Earnings</th>
                <th>Overall Win %</th>
                <th>Speed</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-xs font-medium text-slate-400"
                  >
                    No registered competitors found in this database scope.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r, index) => (
                  <tr
                    key={r.horse.id}
                    className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 text-slate-500">
                      {(page - 1) * pageSize + (index + 1)}
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      {r.horse.name}
                    </td>
                    <td className="py-3 text-slate-700">
                      ${(r.horse.earnings * 1000).toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-700">
                      {(r.horse.winRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 text-slate-700">{r.horse.speed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
