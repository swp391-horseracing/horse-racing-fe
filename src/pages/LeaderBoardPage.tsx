import { HorseLeaderboardView } from "../components/leaderboard/HorseLeaderboardView";
import { JockeyLeaderboardView } from "../components/leaderboard/JockeyLeaderboardView";
import { useLeaderboard } from "../hooks/useLeaderboard";

export default function LeaderBoardPage() {
  const {
    activeTab,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    horseRows,
    loading,
    error,
    handleTabChange,
  } = useLeaderboard();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Racing Leaderboards
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live historical standings and current performance statistics.
          </p>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => handleTabChange("horses")}
            className={`relative pb-2 text-sm font-bold transition-all ${
              activeTab === "horses"
                ? "text-[#064E3B]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Horses
            {activeTab === "horses" && (
              <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 rounded-full bg-[#064E3B]" />
            )}
          </button>

          <button
            onClick={() => handleTabChange("jockeys")}
            className={`relative pb-2 text-sm font-bold transition-all ${
              activeTab === "jockeys"
                ? "text-[#064E3B]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Jockeys
            {activeTab === "jockeys" && (
              <div className="absolute bottom-[-17px] left-0 right-0 h-0.5 rounded-full bg-[#064E3B]" />
            )}
          </button>
        </div>
      </div>

      <div className="transition-all duration-150">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        ) : activeTab === "horses" ? (
          <HorseLeaderboardView
            sortedRows={horseRows}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            isLoading={loading}
          />
        ) : (
          <JockeyLeaderboardView
            data={[]}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        )}
      </div>
    </div>
  );
}
