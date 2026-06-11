import { ChevronLeft, ChevronRight } from "lucide-react";

function formatWinRate(winRate: number) {
  return `${(winRate * 100).toFixed(1)}%`;
}

function formatEarnings(earnings: number) {
  const val = earnings * 1000;
  return `$${val.toLocaleString()}`;
}

export interface TransformedHorseRow {
  rank: number;
  horse: {
    id: string;
    name: string;
    ownerId: string;
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
}: {
  sortedRows: TransformedHorseRow[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  totalPages: number;
}) {
  const top3 = sortedRows.slice(0, 3);
  const paginatedRows = sortedRows;

  return (
    <div className="space-y-6">
      {/* Top hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((row, i) => {
          const horse = row.horse;
          return (
            <div
              key={horse.id}
              className="relative rounded-2xl bg-white text-slate-900 p-6 shadow-sm border border-[#064E3B]/10"
            >
              <div className="absolute left-4 top-4 rounded-sm bg-[#064E3B] px-2.5 py-1 text-xs font-bold text-white">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex flex-col items-start gap-4 pt-5">
                <div className="h-40 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  {horse.imageUrl ? (
                    <img
                      src={horse.imageUrl}
                      alt={horse.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-slate-900 leading-tight">
                      {horse.name}
                    </div>
                    <div className="text-xs mt-1 text-slate-500 font-medium">
                      {horse.ownerId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                      Earnings
                    </div>
                    <div className="text-xl font-black text-[#064E3B]">
                      {formatEarnings(horse.earnings)}
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase text-slate-500">
                      Overall Win %
                    </span>
                    <span className="font-black text-slate-900">
                      {formatWinRate(horse.winRate)}
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

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Full Standings</h2>
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-600">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, sortedRows.length)} of{" "}
              {sortedRows.length}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Per page</label>
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
              <tr className="text-left text-xs text-slate-500">
                <th className="py-2">Rank</th>
                <th>Competitor</th>
                <th>Earnings</th>
                <th>Overall Win %</th>
                <th>Speed</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((r) => (
                <tr key={r.horse.id} className="border-t border-slate-100">
                  <td className="py-3">{r.rank}</td>
                  <td className="py-3">{r.horse.name}</td>
                  <td className="py-3">{formatEarnings(r.horse.earnings)}</td>
                  <td className="py-3">{formatWinRate(r.horse.winRate)}</td>
                  <td className="py-3">{r.horse.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              className="inline-flex items-center gap-1 rounded px-3 py-1 border bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className="inline-flex items-center gap-1 rounded px-3 py-1 border bg-white"
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
