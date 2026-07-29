import { useState, useMemo, type ReactNode } from "react";
import { Search, Calendar, Coins, Target, Bell } from "lucide-react";
import type { WalletTransaction } from "../../types/wallet";
import type { Prediction } from "../../types/prediction";

interface ProfileActivityHistoryProps {
  transactions: WalletTransaction[];
  predictions: Prediction[];
  notifications: any[];
}

export default function ProfileActivityHistory({
  transactions,
  predictions,
  notifications,
}: ProfileActivityHistoryProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const activities = useMemo(() => {
    const list: Array<{
      id: string;
      type: "transaction" | "prediction" | "notification";
      title: string;
      subtitle: string;
      amount?: string;
      amountType?: "positive" | "negative";
      date: Date;
      icon: ReactNode;
      bgColor: string;
    }> = [];

    // Add wallet transactions
    transactions.forEach((t) => {
      list.push({
        id: `tx-${t.id}`,
        type: "transaction",
        title: t.description || `Wallet transaction: ${t.type}`,
        subtitle: `Status: ${t.status}`,
        amount: t.amount > 0 ? `+${t.amount}` : `${t.amount}`,
        amountType: t.amount > 0 ? "positive" : "negative",
        date: new Date(t.createdAt),
        icon: <Coins className="w-4 h-4 text-emerald-600" />,
        bgColor: "bg-emerald-50",
      });
    });

    // Add predictions
    predictions.forEach((p) => {
      const statusStr =
        p.isCorrect === true
          ? "won"
          : p.isCorrect === false
            ? "lost"
            : "pending";
      const isWon = p.isCorrect === true;
      list.push({
        id: `pred-${p.id}`,
        type: "prediction",
        title: `Prediction placed on Race ${p.race?.name || p.race?.id || ""}`,
        subtitle: `Predicted Position: ${p.predictedPosition || ""} • Status: ${statusStr}`,
        amount: isWon
          ? p.rewardAmount
            ? `+${p.rewardAmount}`
            : `+${p.stakeAmount * 2}`
          : `-${p.stakeAmount || 0}`,
        amountType: isWon ? "positive" : "negative",
        date: p.placedAt ? new Date(p.placedAt) : new Date(0),
        icon: <Target className="w-4 h-4 text-blue-600" />,
        bgColor: "bg-blue-50",
      });
    });

    // Add notifications
    notifications.forEach((n) => {
      list.push({
        id: `notif-${n.id}`,
        type: "notification",
        title: n.title || "System Notification",
        subtitle: n.message || "",
        date: n.createdAt ? new Date(n.createdAt) : new Date(0),
        icon: <Bell className="w-4 h-4 text-purple-600" />,
        bgColor: "bg-purple-50",
      });
    });

    // Sort by date desc
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, predictions, notifications]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch =
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.subtitle.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || act.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [activities, search, typeFilter]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#064E3B] font-headline">
          Activity History
        </h2>
        <p className="text-xs text-slate-500 font-body mt-1">
          Detailed unified activity logs containing transactions, prediction
          records, and notifications.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-body"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-body cursor-pointer"
          >
            <option value="all">All Activities</option>
            <option value="transaction">Transactions Only</option>
            <option value="prediction">Predictions Only</option>
            <option value="notification">System Updates</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6 py-2">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="relative group flex items-start justify-between gap-4"
          >
            {/* Timeline dot */}
            <div
              className={`absolute -left-[37px] top-1.5 p-2 rounded-full border border-white shadow-sm shrink-0 ${act.bgColor}`}
            >
              {act.icon}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 font-body leading-snug group-hover:text-emerald-800 transition-colors duration-150">
                {act.title}
              </p>
              <p className="text-xs text-slate-400 font-body">{act.subtitle}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-450 font-body">
                <Calendar className="w-3 h-3" />
                <span>{act.date.toLocaleString()}</span>
              </div>
            </div>

            {act.amount !== undefined && (
              <span
                className={`text-sm font-black font-headline shrink-0 ${
                  act.amountType === "positive"
                    ? "text-emerald-600"
                    : "text-rose-650"
                }`}
              >
                {act.amount} tokens
              </span>
            )}
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-slate-450 text-xs font-body">
            No activity logs found.
          </div>
        )}
      </div>
    </div>
  );
}
