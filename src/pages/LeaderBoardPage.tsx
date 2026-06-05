import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Crown, LoaderCircle } from "lucide-react";
import { useHorseList } from "../hooks/useHorseList.ts";
import type { LeaderboardData } from "../types/leaderboard.ts";

function formatWinRate(perf: number) {
  const pct = (perf % 100) / 100;
  return `${(pct * 100).toFixed(1)}%`;
}

function formatEarnings(perf: number) {
  const val = perf * 1000;
  return `$${val.toLocaleString()}`;
}

export default function LeaderBoardPage() {
  const { horseList, getHorseRankingList } = useHorseList();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const leaderboard: LeaderboardData = {
    updatedAt: new Date().toISOString(),
    rows: horseList.map((horse, index) => ({
      rank: index + 1,
      horse,
    })),
  };

  const sortedRows = leaderboard.rows;
  const top3 = sortedRows.slice(0, 3);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = sortedRows.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        await getHorseRankingList();
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [getHorseRankingList]);

  if (loading) {
    return (
      <section className="flex h-full w-full items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-emerald-600" />
          <div className="text-center text-slate-600">Loading leaderboard…</div>
        </div>
      </section>
    );
  }

  if (!loading && leaderboard.rows.length === 0) {
    return (
      <section className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-3 text-slate-700">No leaderboard data available.</p>
          <button
            onClick={() => getHorseRankingList()}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white"
          >
            Refresh
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col gap-6 p-6 overflow-y-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold text-[#064E3B]">
          Global Leaderboard
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          The definitive ranking of the world's most elite equestrian talent.
          Performance data is updated in real-time.
        </p>
      </header>

      {/* Top hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[top3[1], top3[0], top3[2]].filter(Boolean).map((row, i) => {
          const isCenter = i === 1; // first-ranked horse now appears in the middle
          const horse = row.horse;
          return (
            <div
              key={horse.id}
              className={`relative rounded-2xl p-6 shadow-sm border ${
                isCenter
                  ? "bg-[#064E3B] text-white shadow-md border-emerald-800 md:scale-105 md:shadow-lg"
                  : "bg-white text-slate-900"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {isCenter ? (
                  <Crown className="h-6 w-6 text-amber-300" />
                ) : (
                  <div className="h-6 w-6" />
                )}
                <div
                  className={`h-20 w-20 rounded-lg overflow-hidden border ${
                    isCenter ? "border-amber-500" : "border-slate-100"
                  }`}
                >
                  {horse.image ? (
                    <img
                      src={horse.image}
                      alt={horse.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div
                    className={`text-xl font-bold ${isCenter ? "text-white" : "text-slate-900"}`}
                  >
                    {horse.name}
                  </div>
                  <div
                    className={`text-xs mt-1 ${isCenter ? "text-amber-200" : "text-slate-500"}`}
                  >
                    {horse.owner}
                  </div>
                </div>

                <div className="mt-2 w-full flex flex-col sm:flex-row sm:justify-between items-center text-xs gap-2">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Win Rate</div>
                    <div
                      className={`font-bold ${isCenter ? "text-emerald-200" : "text-slate-700"}`}
                    >
                      {formatWinRate(horse.performance)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Earnings</div>
                    <div
                      className={`font-bold ${isCenter ? "text-amber-200" : "text-slate-700"}`}
                    >
                      {formatEarnings(horse.performance)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-400">Rank</div>
                    <div
                      className={`font-bold ${isCenter ? "text-white" : "text-slate-700"}`}
                    >
                      {row.rank}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* full standings (keeps previous simple table) */}
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
                <th>Performance</th>
                <th>Win %</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((r) => (
                <tr key={r.horse.id} className="border-t border-slate-100">
                  <td className="py-3 w-12">{r.rank}</td>
                  <td className="py-3">{r.horse.name}</td>
                  <td className="py-3">{r.horse.performance}</td>
                  <td className="py-3">{formatWinRate(r.horse.performance)}</td>
                  <td className="py-3">
                    {formatEarnings(r.horse.performance)}
                  </td>
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded px-3 py-1 border bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded px-3 py-1 border bg-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
