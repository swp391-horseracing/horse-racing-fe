import { useEffect, useState, useMemo } from "react";
import {
  Coins,
  HelpCircle,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Flag,
  XCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gift,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/routes";
import { WalletService } from "../../services/WalletService";
import { PredictionService } from "../../services/PredictionService";
import { RaceService } from "../../services/RaceService";
import type { Prediction } from "../../types/prediction";
import type { RaceListItem } from "../../types/race";
import type { WalletTransaction } from "../../types/wallet";

interface SpectatorDashboardProps {
  setActiveTab?: (tab: string) => void;
}

export function SpectatorDashboard({ setActiveTab }: SpectatorDashboardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [activePredictionsCount, setActivePredictionsCount] =
    useState<number>(0);
  const [recentWinsCount, setRecentWinsCount] = useState<number>(0);
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [recentCompletedRaces, setRecentCompletedRaces] = useState<
    RaceListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(new Date());

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [
          walletRes,
          activePredRes,
          winsPredRes,
          allPredRes,
          completedRacesRes,
        ] = await Promise.all([
          WalletService.getMyWallet().catch(() => null),
          PredictionService.getMyPredictions({
            status: "pending",
            limit: 1,
          }).catch(() => null),
          PredictionService.getMyPredictions({
            status: "correct",
            limit: 1,
          }).catch(() => null),
          PredictionService.getMyPredictions({ limit: 5 }).catch(() => null),
          RaceService.getRaces({ status: "completed", limit: 3 }).catch(
            () => []
          ),
        ]);

        if (isMounted) {
          if (walletRes) {
            setBalance(walletRes.balance);
            setTransactions(walletRes.transactions || []);
          }
          if (activePredRes?.pagination)
            setActivePredictionsCount(activePredRes.pagination.total);
          if (winsPredRes?.pagination)
            setRecentWinsCount(winsPredRes.pagination.total);
          if (allPredRes?.data) setRecentPredictions(allPredRes.data);
          if (completedRacesRes) setRecentCompletedRaces(completedRacesRes);
        }
      } catch (e) {
        console.error("Failed to load spectator dashboard data:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Week Navigation Handlers for Weekly Activity Heatmap
  const handlePrevWeek = () => {
    setSelectedWeekDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setSelectedWeekDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // Weekly Activity Heatmap Calculation
  const weeklyActivityData = useMemo(() => {
    const startOfWeek = new Date(selectedWeekDate);
    const day = startOfWeek.getDay(); // 0 = Sun, 6 = Sat
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    let totalLogs = 0;
    const dayCounts: number[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);

      let count = 0;
      transactions.forEach((tx) => {
        const txDate = new Date(tx.createdAt);
        if (
          txDate.getFullYear() === currentDate.getFullYear() &&
          txDate.getMonth() === currentDate.getMonth() &&
          txDate.getDate() === currentDate.getDate()
        ) {
          count++;
        }
      });

      days.push({
        date: currentDate,
        count,
        dayLabel: currentDate.toLocaleString("default", { weekday: "short" }),
        dayNum: currentDate.getDate(),
      });
      dayCounts.push(count);
      totalLogs += count;
    }

    const maxCount = Math.max(...dayCounts, 1);
    const daysWithLevels = days.map((d) => {
      let level = 0;
      if (d.count > 0) {
        const ratio = d.count / maxCount;
        if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }
      return { ...d, level };
    });

    const formatWeekRange = () => {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${endOfWeek.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    };

    return {
      weekRangeStr: formatWeekRange(),
      days: daysWithLevels,
      totalLogs,
    };
  }, [selectedWeekDate, transactions]);

  const getPositionLabel = (pos: number) => {
    if (pos === 1) return "1st";
    if (pos === 2) return "2nd";
    if (pos === 3) return "3rd";
    return `${pos}th`;
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4 max-w-7xl w-full mx-auto font-body overflow-hidden text-slate-800">
      {/* Header Section */}
      <div className="shrink-0">
        <h2 className="font-headline text-2xl text-[#064E3B] mb-0.5">
          Spectator Overview
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Welcome back. Here is your current status and racing activity.
        </p>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {/* Points Card */}
        <button
          onClick={() => setActiveTab?.(ROUTES.SPECTATOR_WALLET)}
          className="bg-white border border-[#064E3B]/10 rounded-xl p-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer text-left w-full block focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#064E3B]/5 rounded-full blur-xl group-hover:bg-[#064E3B]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Points
            </h3>
            <span className="p-1.5 rounded-lg bg-[#064E3B]/10 text-[#064E3B]">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="font-headline text-2xl md:text-3xl font-black text-[#064E3B] flex items-baseline gap-1.5 group-hover:underline">
            {balance !== null ? balance.toLocaleString() : "..."}
            <span className="text-xs font-bold font-body text-slate-500">
              PTS
            </span>
          </div>
        </button>

        {/* Active Predictions Card */}
        <button
          onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
          className="bg-white border border-[#064E3B]/10 rounded-xl p-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer text-left w-full block focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#EAB308]/5 rounded-full blur-xl group-hover:bg-[#EAB308]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Predictions
            </h3>
            <span className="p-1.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308]">
              <HelpCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="font-headline text-2xl md:text-3xl font-black text-[#064E3B] group-hover:underline flex items-baseline gap-1.5">
            {loading ? "..." : activePredictionsCount}
            <span className="text-xs font-bold font-body text-slate-500">
              pending
            </span>
          </div>
        </button>

        {/* Recent Wins Card */}
        <button
          onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
          className="bg-white border border-[#064E3B]/10 rounded-xl p-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer text-left w-full block focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#064E3B]/5 rounded-full blur-xl group-hover:bg-[#064E3B]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Wins
            </h3>
            <span className="p-1.5 rounded-lg bg-[#064E3B]/10 text-[#064E3B]">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="font-headline text-2xl md:text-3xl font-black text-[#064E3B] flex items-baseline gap-1.5 group-hover:underline">
            {loading ? "..." : recentWinsCount}
            <span className="text-xs font-bold font-body text-slate-500">
              wins
            </span>
          </div>
        </button>
      </div>

      {/* Weekly Activity Heatmap */}
      <div className="bg-white border border-[#064E3B]/10 p-3 px-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-bold font-headline text-[#064E3B] text-sm flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" /> Weekly Activity
            Heatmap
          </span>
          <span className="text-[11px] text-slate-500 font-medium font-body">
            {weeklyActivityData.weekRangeStr} ({weeklyActivityData.totalLogs}{" "}
            activity logs)
          </span>
        </div>

        {/* 7-Day compact grid */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
          {weeklyActivityData.days.map((item, idx) => {
            const levelColors = [
              "bg-slate-50 text-slate-400 border-slate-100", // Level 0
              "bg-emerald-50 text-emerald-800 border-emerald-100", // Level 1
              "bg-emerald-200 text-emerald-950 border-emerald-300 font-bold", // Level 2
              "bg-emerald-400 text-white border-emerald-500 font-bold shadow-xs", // Level 3
              "bg-[#064E3B] text-white border-emerald-800 font-black shadow-sm ring-1 ring-emerald-400/30", // Level 4
            ];
            return (
              <div
                key={idx}
                title={`${item.date.toLocaleDateString()}: ${item.count} activity logs`}
                aria-label={`${item.date.toLocaleDateString()}: ${item.count} activity logs`}
                className={`w-9 h-9 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all duration-150 cursor-default ${levelColors[item.level]}`}
              >
                <span className="text-[8px] font-label font-bold uppercase leading-none opacity-85">
                  {item.dayLabel}
                </span>
                <span className="text-xs font-headline font-extrabold leading-none mt-1">
                  {item.dayNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Week switcher controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrevWeek}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSelectedWeekDate(new Date())}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[9px] font-bold font-label transition-colors cursor-pointer"
            title="This Week"
          >
            Today
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Quick Links Section */}
        <div className="lg:col-span-1 flex flex-col space-y-3 overflow-hidden shrink-0">
          <h3 className="font-bold font-headline text-base text-[#064E3B] border-b border-slate-100 pb-1.5">
            Quick Links
          </h3>

          <div className="space-y-2">
            <Link
              to={ROUTES.SPECTATOR_WALLET}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-3 min-h-[72px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-700" /> Spectator
                  Wallet
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                View your balance, transaction history, and prediction earnings.
              </p>
            </Link>

            <Link
              to={ROUTES.RACES}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-3 min-h-[72px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5 text-amber-700" /> Top Live Races
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Browse all scheduled, live, and upcoming races.
              </p>
            </Link>

            <Link
              to={ROUTES.SPECTATOR_SHOP}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-3 min-h-[72px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 text-[#064E3B]" /> Gift Shop
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Exchange your virtual points for awesome premium merchandise.
              </p>
            </Link>

            <Link
              to={ROUTES.TOURNAMENTS}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-3 min-h-[72px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-emerald-700" /> Upcoming
                  Tournaments
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Browse and view details for major upcoming tournament events.
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Results Section */}
        <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
          <h3 className="font-bold font-headline text-base text-[#064E3B] border-b border-slate-100 pb-1.5 shrink-0">
            Recent Prediction & Race Results
          </h3>

          <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2.5 mt-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading recent results...
              </div>
            ) : recentPredictions.length > 0 ? (
              recentPredictions.map((p) => {
                const isCorrect = p.isCorrect === true;
                const isIncorrect = p.isCorrect === false;
                const isPending = p.isCorrect === null;

                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
                    className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative shadow-xs hover:border-[#064E3B]/20 cursor-pointer transition-all text-left w-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]/30"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                        isCorrect
                          ? "bg-emerald-600"
                          : isIncorrect
                            ? "bg-rose-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <div className="pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-label text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                          PREDICTION
                        </span>
                        <span className="font-bold font-headline text-[#064E3B] text-sm">
                          {p.race?.name || "Scheduled Race"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Picked:{" "}
                        <span className="font-bold text-slate-800">
                          {p.predictedEntry?.horseName || "Horse"}
                        </span>{" "}
                        to finish{" "}
                        <span className="font-bold text-slate-800">
                          {getPositionLabel(p.predictedPosition)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCorrect && (
                        <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-label text-[9px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Won +{p.rewardAmount || "0"} PTS
                        </span>
                      )}
                      {isIncorrect && (
                        <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-full font-label text-[9px] font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Incorrect
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-label text-[9px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Race
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : recentCompletedRaces.length > 0 ? (
              recentCompletedRaces.map((r) => (
                <button
                  key={r.id}
                  onClick={() =>
                    setActiveTab?.(ROUTES.RACE_DETAIL.replace(":id", r.id))
                  }
                  className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative shadow-xs hover:border-[#064E3B]/20 cursor-pointer transition-all text-left w-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]/30"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#064E3B]/30 rounded-l-xl" />
                  <div className="pl-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-label text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                        COMPLETED RACE
                      </span>
                      <span className="font-bold font-headline text-[#064E3B] text-sm">
                        {r.tournamentName || r.tournament?.name
                          ? `${r.tournamentName || r.tournament?.name} - ${r.name}`
                          : r.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Venue: {r.venue || "Official Track"} |{" "}
                      {r.scheduledAt
                        ? new Date(r.scheduledAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-label text-[9px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent predictions or completed races available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
