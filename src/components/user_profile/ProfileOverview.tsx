import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  Trophy,
  Target,
  Gift,
  Calendar,
  ClipboardList,
  UserCheck,
  Flag,
  ArrowRight,
  Shield,
  Activity,
  Plus,
} from "lucide-react";
import type { UserRace, MyEntry } from "../../types/user";
import type { WalletTransaction } from "../../types/wallet";
import type { Prediction } from "../../types/prediction";

interface ProfileOverviewProps {
  user: any;
  walletBalance: number;
  transactions: WalletTransaction[];
  predictions: Prediction[];
  races: UserRace[];
  entries: MyEntry[];
  tracks?: any[];
  onNavigateToTab: (tab: string) => void;
}

export default function ProfileOverview({
  user,
  walletBalance,
  transactions,
  predictions,
  races,
  entries,
  tracks = [],
  onNavigateToTab,
}: ProfileOverviewProps) {
  const role = user.role.toLowerCase();
  const navigate = useNavigate();

  // 1. STATS CARDS CONFIGURATION BY ROLE
  const renderStats = () => {
    switch (role) {
      case "spectator": {
        const totalEarned = transactions
          .filter((t) => t.type === "reward")
          .reduce((sum, t) => sum + t.amount, 0);
        const winPredictionCount = predictions.filter(
          (p) => p.isCorrect === true
        ).length;
        const winRate =
          predictions.length > 0
            ? Math.round((winPredictionCount / predictions.length) * 100)
            : 0;
        const uniqueTournaments = new Set(
          predictions.map((p) => p.race?.id).filter(Boolean)
        ).size;

        return (
          <>
            {/* Card 1: Available Tokens */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Available Tokens
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {walletBalance}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total Earned:{" "}
                  <span className="font-bold text-emerald-600">
                    +{totalEarned}
                  </span>
                </p>
              </div>
            </div>
            {/* Card 2: Races Predicted */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Races Predicted
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {uniqueTournaments}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Participated in races
                </p>
              </div>
            </div>
            {/* Card 3: Predictions Made */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Predictions Made
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {predictions.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Win Rate:{" "}
                  <span className="font-bold text-blue-600">{winRate}%</span>
                </p>
              </div>
            </div>
            {/* Card 4: Gifts Redeemed */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Gifts Received
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5 text-slate-400">
                  —
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Coming soon</p>
              </div>
            </div>
          </>
        );
      }

      case "referee": {
        const reportsSubmitted = races.filter(
          (r) => r.resultStatus === "published"
        ).length;
        const pendingReports = races.filter(
          (r) =>
            r.resultStatus === "draft" || r.resultStatus === "referee_confirmed"
        ).length;
        return (
          <>
            {/* Card 1: Monitored Races */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Monitored Races
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {races.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigned races total
                </p>
              </div>
            </div>
            {/* Card 2: Reports Submitted */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Reports Submitted
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {reportsSubmitted}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pending reports:{" "}
                  <span className="font-bold text-yellow-600">
                    {pendingReports}
                  </span>
                </p>
              </div>
            </div>
            {/* Card 3: Standing */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Official Standing
                </p>
                <p className="text-xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  Referee
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigned to active track panels
                </p>
              </div>
            </div>
          </>
        );
      }

      case "jockey": {
        const wins = races.filter((r) => r.ranking === 1).length;
        const completedRides = races.filter(
          (r) => r.status === "completed"
        ).length;
        const jWinRate =
          races.length > 0 ? Math.round((wins / races.length) * 100) : 0;
        return (
          <>
            {/* Card 1: Total Rides */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Total Rides
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {races.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Completed rides:{" "}
                  <span className="font-bold text-slate-700">
                    {completedRides}
                  </span>
                </p>
              </div>
            </div>
            {/* Card 2: Wins */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Riding Wins
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {wins}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Success Rate:{" "}
                  <span className="font-bold text-yellow-600">{jWinRate}%</span>
                </p>
              </div>
            </div>
            {/* Card 3: Weight & Exp */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Weight &amp; Exp
                </p>
                <p className="text-xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {user.weightKg
                    ? `${user.weightKg} kg`
                    : user.weight
                      ? `${user.weight} kg`
                      : "-"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Experience:{" "}
                  <span className="font-bold">
                    {user.experienceYear || user.experience || "-"} Years
                  </span>
                </p>
              </div>
            </div>
          </>
        );
      }

      case "owner":
      case "horse_owner": {
        const uniqueHorses = new Set(entries.map((e) => e.horseId)).size;
        const approvedEntries = entries.filter(
          (e) => e.status === "approved"
        ).length;
        const pendingEntries = entries.filter(
          (e) => e.status === "pending"
        ).length;
        return (
          <>
            {/* Card 1: Registered Horses */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Owned Horses
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {uniqueHorses}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Horses registered in stable
                </p>
              </div>
            </div>
            {/* Card 2: Tournament Entries */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Total Entries
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {entries.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Approved:{" "}
                  <span className="font-bold text-emerald-600">
                    {approvedEntries}
                  </span>
                </p>
              </div>
            </div>
            {/* Card 3: Pending Entries */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Pending Entries
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {pendingEntries}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Awaiting approvals
                </p>
              </div>
            </div>
          </>
        );
      }

      case "admin": {
        const activeCount =
          tracks?.filter((t) => t.status?.toLowerCase() === "active").length ||
          0;
        const inactiveCount =
          tracks?.filter((t) => t.status?.toLowerCase() === "inactive")
            .length || 0;
        const maintCount =
          tracks?.filter((t) => t.status?.toLowerCase() === "maintenance")
            .length || 0;
        return (
          <>
            {/* Card 1: Pending Approvals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Registry Approvals
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5 text-slate-400">
                  —
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Coming soon</p>
              </div>
            </div>
            {/* Card 2: Track Count */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium font-body">
                  Track Venues
                </p>
                <p className="text-2xl font-extrabold text-[#064E3B] font-headline mt-0.5">
                  {tracks?.length || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Active:{" "}
                  <span className="font-bold text-emerald-600">
                    {activeCount}
                  </span>{" "}
                  | Inactive: <span className="font-bold">{inactiveCount}</span>{" "}
                  | Maint:{" "}
                  <span className="font-bold text-amber-600">{maintCount}</span>
                </p>
              </div>
            </div>
          </>
        );
      }

      default: {
        return (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 col-span-3 justify-center text-slate-400 text-xs font-body">
            No statistics cards configured for this user role.
          </div>
        );
      }
    }
  };

  // 2. DYNAMIC TIMELINE STREAM
  const timelineActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      date: Date;
      icon: ReactNode;
      bgColor: string;
    }> = [];

    // Map predictions
    predictions.forEach((p) => {
      const statusStr =
        p.isCorrect === true
          ? "won"
          : p.isCorrect === false
            ? "lost"
            : "pending";
      list.push({
        id: `pred-${p.id}`,
        title: `Placed prediction on Race "${p.race?.name || "Race"}"`,
        subtitle: `Stake: ${p.stakeAmount} tokens • Position: ${p.predictedPosition} • Status: ${statusStr}`,
        time: p.placedAt ? new Date(p.placedAt).toLocaleDateString() : "",
        date: p.placedAt ? new Date(p.placedAt) : new Date(0),
        icon: <Target className="w-4 h-4 text-blue-500" />,
        bgColor: "bg-blue-50",
      });
    });

    // Map wallet transactions
    transactions.forEach((t) => {
      list.push({
        id: `tx-${t.id}`,
        title: t.description || `Wallet transaction: ${t.type}`,
        subtitle: `Amount: ${t.amount > 0 ? "+" : ""}${t.amount} tokens • Status: ${t.status}`,
        time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",
        date: t.createdAt ? new Date(t.createdAt) : new Date(0),
        icon: <Coins className="w-4 h-4 text-emerald-500" />,
        bgColor: "bg-emerald-50",
      });
    });

    // Sort by date descending and slice the top 4
    return list.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
  }, [predictions, transactions]);

  // 3. ROLE-SPECIFIC BOTTOM RIGHT WIDGET
  const renderSecondaryWidget = () => {
    switch (role) {
      case "spectator":
        return (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col h-full justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#064E3B] font-headline text-sm">
                  My Exchanges
                </h3>
                <button
                  onClick={() => onNavigateToTab("exchanges")}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 font-body transition-colors"
                >
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="py-8 text-center text-slate-400 text-xs font-body">
                No redemptions found.
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab("exchanges")}
              className="w-full py-2.5 bg-[#064E3B] hover:bg-[#043E2F] text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm font-body mt-4"
            >
              <Gift className="w-4 h-4 text-[#EAB308]" />
              Browse Gift Shop
            </button>
          </div>
        );

      case "referee":
        return (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col h-full justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#064E3B] font-headline text-sm">
                  Assigned Races
                </h3>
              </div>

              <div className="space-y-2.5">
                {races.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2.5 border border-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 shrink-0 font-headline font-bold text-xs">
                        R{item.raceNumber || idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-body truncate max-w-[140px]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-body mt-0.5">
                          {new Date(item.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
                {races.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs font-body">
                    No assigned races listed.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/referee/races")}
              className="w-full py-2.5 bg-[#064E3B] hover:bg-[#043E2F] text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm font-body mt-4"
            >
              <Calendar className="w-4 h-4 text-[#EAB308]" />
              Go to Assigned Races
            </button>
          </div>
        );

      case "jockey":
        return (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col h-full justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#064E3B] font-headline text-sm">
                  Upcoming Rides
                </h3>
              </div>

              <div className="space-y-2.5">
                {races.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2.5 border border-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-650 shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-body truncate max-w-[140px]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-body mt-0.5">
                          Horse: {item.horse || "Assigned Horse"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Confirmed
                    </span>
                  </div>
                ))}
                {races.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs font-body">
                    No upcoming rides scheduled.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/jockey/schedule")}
              className="w-full py-2.5 bg-[#064E3B] hover:bg-[#043E2F] text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm font-body mt-4"
            >
              <Calendar className="w-4 h-4 text-[#EAB308]" />
              View Riding Schedule
            </button>
          </div>
        );

      case "owner":
      case "horse_owner":
        return (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col h-full justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#064E3B] font-headline text-sm">
                  My Registered Horses
                </h3>
              </div>

              <div className="space-y-2.5">
                {entries.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2.5 border border-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 shrink-0 font-body text-sm">
                        🐎
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-body truncate max-w-[140px]">
                          {item.horseName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-body mt-0.5">
                          Jockey: {item.jockeyName || "None"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs font-body">
                    No horses currently registered.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate("/owner/tournamentRegister")}
              className="w-full py-2.5 bg-[#064E3B] hover:bg-[#043E2F] text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm font-body mt-4"
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              Register New Horse
            </button>
          </div>
        );

      case "admin":
        return (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col h-full justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#064E3B] font-headline text-sm">
                  Registry Approvals
                </h3>
              </div>

              <div className="py-8 text-center text-slate-400 text-xs font-body">
                No pending requests.
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/dashboard")}
              className="w-full py-2.5 bg-[#064E3B] hover:bg-[#043E2F] text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm font-body mt-4"
            >
              <Shield className="w-4 h-4 text-[#EAB308]" />
              Go to Control Center
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Overview stats layout */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#064E3B] font-headline">
          Your Overview
        </h2>
        <div className="relative">
          <select
            aria-label="Filter overview time range"
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-1.5 pr-8 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-body cursor-pointer shadow-sm"
          >
            <option>All Time</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            ▼
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {renderStats()}
      </div>

      {/* Two columns bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#064E3B] font-headline text-sm">
              Recent Activity
            </h3>
            <button
              onClick={() => onNavigateToTab("activity")}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold font-body transition-colors"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {timelineActivities.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 shrink-0 mr-2 max-w-[85%]">
                  <div
                    className={`p-2.5 rounded-full ${item.bgColor} shrink-0`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1E293B] font-body leading-snug truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-body mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-body whitespace-nowrap shrink-0">
                  {item.time}
                </span>
              </div>
            ))}
            {timelineActivities.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-body">
                No recent activity.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">{renderSecondaryWidget()}</div>
      </div>
    </div>
  );
}
