import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/routes";
import { WalletService } from "../../services/WalletService";
import { PredictionService } from "../../services/PredictionService";
import { RaceService } from "../../services/RaceService";
import type { Prediction } from "../../types/prediction";
import type { RaceListItem } from "../../types/race";

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
          if (walletRes) setBalance(walletRes.balance);
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

  const getPositionLabel = (pos: number) => {
    if (pos === 1) return "1st";
    if (pos === 2) return "2nd";
    if (pos === 3) return "3rd";
    return `${pos}th`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl w-full mx-auto font-body">
      {/* Header Section */}
      <div>
        <h2 className="font-headline text-3xl text-[#064E3B] mb-2">
          Spectator Overview
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Welcome back. Here is your current status and racing activity.
        </p>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tokens Card */}
        <div
          onClick={() => setActiveTab?.(ROUTES.SPECTATOR_WALLET)}
          className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 shadow-sm cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#064E3B]/5 rounded-full blur-xl group-hover:bg-[#064E3B]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Tokens
            </h3>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Coins className="w-5 h-5" />
            </span>
          </div>
          <div className="font-headline text-4xl font-black text-[#064E3B] flex items-baseline gap-2 group-hover:underline">
            {balance !== null ? balance.toLocaleString() : "..."}
            <span className="text-sm font-bold font-body text-slate-500">
              PTS
            </span>
          </div>
        </div>

        {/* Active Predictions Card */}
        <div
          onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
          className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 shadow-sm cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#EAB308]/5 rounded-full blur-xl group-hover:bg-[#EAB308]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Predictions
            </h3>
            <span className="p-2 rounded-xl bg-[#EAB308]/10 text-[#EAB308]">
              <HelpCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="font-headline text-4xl font-black text-[#064E3B] group-hover:underline flex items-baseline gap-2">
            {loading ? "..." : activePredictionsCount}
            <span className="text-sm font-bold font-body text-slate-500">
              pending
            </span>
          </div>
        </div>

        {/* Recent Wins Card */}
        <div
          onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
          className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 shadow-sm cursor-pointer"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#064E3B]/5 rounded-full blur-xl group-hover:bg-[#064E3B]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recent Wins
            </h3>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Trophy className="w-5 h-5" />
            </span>
          </div>
          <div className="font-headline text-4xl font-black text-[#064E3B] flex items-baseline gap-2 group-hover:underline">
            {loading ? "..." : recentWinsCount}
            <span className="text-sm font-bold font-body text-slate-500">
              correct
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links Section */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold font-headline text-xl text-[#064E3B] border-b border-slate-100 pb-2">
            Quick Links
          </h3>

          <div className="space-y-3">
            <Link
              to={ROUTES.SPECTATOR_WALLET}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-4 min-h-[88px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-700" /> Spectator
                  Wallet
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                View your balance, transaction history, and prediction earnings.
              </p>
            </Link>

            <Link
              to={ROUTES.RACES}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-4 min-h-[88px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-700" /> Top Live Races
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Browse all scheduled, live, and upcoming races.
              </p>
            </Link>

            <Link
              to={ROUTES.TOURNAMENTS}
              className="w-full flex flex-col justify-center bg-white border border-slate-100 rounded-xl p-4 min-h-[88px] hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700 group-hover:text-[#064E3B] transition-colors flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-700" /> Upcoming
                  Tournaments
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Browse and view details for major upcoming tournament events.
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Results Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold font-headline text-xl text-[#064E3B] border-b border-slate-100 pb-2">
            Recent Prediction & Race Results
          </h3>

          <div className="space-y-3">
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
                  <div
                    key={p.id}
                    onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
                    className="bg-white border border-slate-100 rounded-xl p-4 min-h-[88px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative shadow-sm hover:border-[#064E3B]/20 cursor-pointer transition-all"
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
                        <span className="font-label text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                          PREDICTION
                        </span>
                        <span className="font-bold font-headline text-[#064E3B] text-base">
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
                        <span className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Won +{p.rewardAmount || "0"} PTS
                        </span>
                      )}
                      {isIncorrect && (
                        <span className="px-3 py-1 bg-rose-50 border border-rose-250 text-rose-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Incorrect
                        </span>
                      )}
                      {isPending && (
                        <span className="px-3 py-1 bg-amber-50 border border-amber-250 text-amber-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Race
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : recentCompletedRaces.length > 0 ? (
              recentCompletedRaces.map((r) => (
                <div
                  key={r.id}
                  onClick={() =>
                    setActiveTab?.(ROUTES.RACE_DETAIL.replace(":id", r.id))
                  }
                  className="bg-white border border-slate-100 rounded-xl p-4 min-h-[88px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative shadow-sm hover:border-[#064E3B]/20 cursor-pointer transition-all"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#064E3B]/30 rounded-l-xl" />
                  <div className="pl-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-label text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        COMPLETED RACE
                      </span>
                      <span className="font-bold font-headline text-[#064E3B] text-base">
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
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </span>
                  </div>
                </div>
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
