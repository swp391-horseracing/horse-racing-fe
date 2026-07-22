import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { JockeyService } from "../../services/JockeyService";
import type {
  JockeyRaceHistoryEntry,
  RaceHistoryStats,
} from "../../types/race";

export function RaceHistory() {
  const { user } = useAuthContext();
  const [data, setData] = useState<JockeyRaceHistoryEntry[]>([]);
  const [stats, setStats] = useState<RaceHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user?.id) return;

    let alive = true;
    JockeyService.getJockeyRaceHistory(user.id, { page, limit: 10 })
      .then((res) => {
        if (!alive) return;
        setData(res.data);
        setStats(res.stats);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user?.id, page]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto font-body">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Total Races
            </p>
            <p className="text-2xl font-black text-[#064E3B] mt-1">
              {stats.totalRaces}
            </p>
          </div>
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Wins
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {stats.wins}
            </p>
          </div>
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Places
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {stats.places}
            </p>
          </div>
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Avg Finish
            </p>
            <p className="text-2xl font-black text-[#064E3B] mt-1">
              {stats.avgFinishPosition ?? "-"}
            </p>
          </div>
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              DNF / DSQ
            </p>
            <p className="text-2xl font-black text-red-600 mt-1">
              {stats.dnfCount + stats.dsqCount}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#064E3B]" />
            <h3 className="font-bold font-headline text-[#064E3B]">
              Race History
            </h3>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-[#064E3B] disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-[#064E3B] disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading race history...
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No race history available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Horse</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((row) => (
                  <tr key={row.raceId} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                      {new Date(row.scheduledAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.raceName}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {row.horse?.name ?? "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                        {row.finishStatus === "dnf"
                          ? "DNF"
                          : row.finishStatus === "dsq"
                            ? "DSQ"
                            : row.finishedPosition != null
                              ? `#${row.finishedPosition}`
                              : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.venue}</td>
                    <td className="px-4 py-4 font-semibold text-slate-700">
                      {row.points != null ? `${row.points} pts` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
