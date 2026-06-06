import { useState, useEffect } from "react";
import { HorseLeaderboardView } from "../components/HorseLeaderboardView";
import { JockeyLeaderboardView } from "../components/JockeyLeaderboardView";
import { useHorseList } from "../hooks/useHorseList";
import { useJockeyList } from "../hooks/useJockeyList";
import { LoaderCircle } from "lucide-react";

export default function LeaderBoardPage() {
  const [view, setView] = useState<"horses" | "jockeys">("horses");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const {
    horseList,
    getHorseRankingList,
    loading: horseLoading,
    error: horseError,
  } = useHorseList();
  const {
    jockeyList,
    getJockeyRankingList,
    loading: jockeyLoading,
    error: jockeyError,
  } = useJockeyList();

  const error = view === "horses" ? horseError : jockeyError;

  useEffect(() => {
    // Load both datasets when component mounts
    const loadData = async () => {
      await Promise.all([getHorseRankingList(), getJockeyRankingList()]);
    };
    loadData();
  }, [getHorseRankingList, getJockeyRankingList]);

  // Prepare horse rows for the view
  const horseRows = horseList.map((horse, index) => ({
    rank: index + 1,
    horse,
  }));

  const loading = view === "horses" ? horseLoading : jockeyLoading;

  return (
    <section className="flex h-full w-full flex-col gap-6 p-6 overflow-y-auto">
      <header className="flex items-center justify-between gap-6 pb-2">
        <h1 className="text-3xl font-extrabold text-[#064E3B]">
          {view === "horses" ? "Top Earning Horses" : "Top Performing Jockeys"}
        </h1>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => {
              setView("horses");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              view === "horses"
                ? "bg-white shadow-sm text-[#064E3B]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Horses
          </button>
          <button
            onClick={() => {
              setView("jockeys");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              view === "jockeys"
                ? "bg-white shadow-sm text-[#064E3B]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Jockeys
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : view === "horses" ? (
        <HorseLeaderboardView
          sortedRows={horseRows}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      ) : (
        <JockeyLeaderboardView
          data={jockeyList}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </section>
  );
}
