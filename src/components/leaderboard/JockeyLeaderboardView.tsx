import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Jockey } from "../../types/jockey.ts";

function formatWinRate(winRate: number) {
  return `${(winRate * 100).toFixed(1)}%`;
}

export function JockeyLeaderboardView({
  data,
  page,
  setPage,
  pageSize,
  setPageSize,
}: {
  data: Jockey[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
}) {
  const top3 = data.slice(0, 3);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginatedRows = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Top hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((jockey, i) => {
          const rankLabel = String(i + 1).padStart(2, "0");
          // Get initials for the avatar box
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
                    <div className="text-xs mt-1 text-slate-500 font-medium">
                      {jockey.club}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                      Win Rate
                    </div>
                    <div className="text-xl font-black text-[#064E3B]">
                      {formatWinRate(jockey.winRate)}
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase text-slate-500">
                      Total Runs
                    </span>
                    <span className="font-black text-slate-900">
                      {jockey.totalRuns}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase text-slate-500">
                      Podiums
                    </span>
                    <span className="font-black text-slate-900">
                      {jockey.podiums}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Standings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-3">Full Standings</h2>
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-600">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, data.length)} of {data.length}
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
                <th>Jockey</th>
                <th>Club</th>
                <th>Win %</th>
                <th>Runs</th>
                <th>Podiums</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((j, index) => (
                <tr key={j.id} className="border-t border-slate-100">
                  <td className="py-3 w-12">
                    {(page - 1) * pageSize + (index + 1)}
                  </td>
                  <td className="py-3 font-medium text-slate-900">{j.name}</td>
                  <td className="py-3 text-slate-600">{j.club}</td>
                  <td className="py-3">{formatWinRate(j.winRate)}</td>
                  <td className="py-3">{j.totalRuns}</td>
                  <td className="py-3">{j.podiums}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
