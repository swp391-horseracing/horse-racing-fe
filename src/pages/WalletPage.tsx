import { useEffect, useState, useMemo, useRef } from "react";
import { WalletService } from "../services/WalletService";
import type { WalletResponse, WalletTransaction } from "../types/wallet";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Gift,
  Trophy,
  History,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  BookOpen,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs for Main Content Area: activity_heatmap | how_it_works | faqs
  const [activeTab, setActiveTab] = useState<
    "activity_heatmap" | "how_it_works" | "faqs"
  >("activity_heatmap");

  // Selected Month for 30-Day Activity Heatmap Navigation
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());

  // Sidebar Transaction History Multi-Select Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const loadWalletData = async (isMounted = { current: true }) => {
    try {
      const data = await WalletService.getMyWallet();
      if (isMounted.current) {
        setWallet(data);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err?.response?.data?.message || "Failed to load wallet data.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    await loadWalletData();
  };

  useEffect(() => {
    const isMounted = { current: true };
    const init = async () => {
      await loadWalletData(isMounted);
    };
    init();
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Close flyout menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(event.target as Node)
      ) {
        setIsFlyoutOpen(false);
      }
    };
    if (isFlyoutOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFlyoutOpen]);

  // Month Navigation Handlers for Activity Heatmap
  const handlePrevMonth = () => {
    setSelectedMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Multi-Select Toggle Handlers
  const toggleTypeFilter = (typeKey: string) => {
    if (typeKey === "all") {
      setSelectedTypes([]);
      return;
    }
    setSelectedTypes((prev) =>
      prev.includes(typeKey)
        ? prev.filter((k) => k !== typeKey)
        : [...prev, typeKey]
    );
  };

  const toggleStatusFilter = (statusKey: string) => {
    if (statusKey === "all") {
      setSelectedStatuses([]);
      return;
    }
    setSelectedStatuses((prev) =>
      prev.includes(statusKey)
        ? prev.filter((k) => k !== statusKey)
        : [...prev, statusKey]
    );
  };

  const applyDatePreset = (daysAgo: number) => {
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    if (daysAgo === 0) {
      setStartDate(endStr);
      setEndDate(endStr);
    } else {
      const start = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(endStr);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setStartDate("");
    setEndDate("");
  };

  // 30-Day Monthly Activity Heatmap Calculation
  const monthlyActivityData = useMemo(() => {
    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat

    const dayCounts: Record<number, number> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dayCounts[day] = 0;
    }

    (wallet?.transactions || []).forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate.getFullYear() === year && txDate.getMonth() === month) {
        const day = txDate.getDate();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    const maxCount = Math.max(...Object.values(dayCounts), 1);
    let totalLogs = 0;
    let activeDaysCount = 0;
    let peakDay = { day: 0, count: 0 };

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const count = dayCounts[day] || 0;
      totalLogs += count;
      if (count > 0) activeDaysCount++;
      if (count > peakDay.count) {
        peakDay = { day, count };
      }

      let level = 0;
      if (count > 0) {
        const ratio = count / maxCount;
        if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }

      days.push({ day, count, level });
    }

    const monthName = selectedMonthDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    return {
      monthName,
      year,
      month,
      daysInMonth,
      firstDayOfWeek,
      days,
      totalLogs,
      activeDaysCount,
      peakDay,
    };
  }, [selectedMonthDate, wallet?.transactions]);

  // Filter & Search Sidebar Transactions (Multi-Select & Date Range Supported)
  const filteredTransactions = useMemo(() => {
    return (wallet?.transactions || []).filter((tx) => {
      // 1. Name / Description Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const descMatch =
          tx.description?.toLowerCase().includes(query) ?? false;
        const typeMatch = tx.type.toLowerCase().includes(query);
        const idMatch = tx.id.toLowerCase().includes(query);
        if (!descMatch && !typeMatch && !idMatch) return false;
      }

      // 2. Multi-Select Type Filter
      if (selectedTypes.length > 0) {
        const matchesType = selectedTypes.some((t) => {
          if (t === "reward")
            return tx.type === "reward" || tx.type === "genesis";
          return tx.type === t;
        });
        if (!matchesType) return false;
      }

      // 3. Multi-Select Status Filter
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(tx.status)) return false;
      }

      // 4. Date Range Filter
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(tx.createdAt) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(tx.createdAt) > end) return false;
      }

      return true;
    });
  }, [
    wallet?.transactions,
    searchQuery,
    selectedTypes,
    selectedStatuses,
    startDate,
    endDate,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    count += selectedTypes.length;
    count += selectedStatuses.length;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [searchQuery, selectedTypes, selectedStatuses, startDate, endDate]);

  // Calculate Last 30 Days Earnings
  const calculateLastMonthEarnings = () => {
    if (!wallet?.transactions) return 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return wallet.transactions.reduce((sum, tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate >= thirtyDaysAgo) {
        const netChange = tx.balanceAfter - tx.balanceBefore;
        if (netChange > 0) {
          return sum + netChange;
        }
      }
      return sum;
    }, 0);
  };

  const lastMonthEarnings = calculateLastMonthEarnings();

  const getTransactionIcon = (type: WalletTransaction["type"]) => {
    switch (type) {
      case "genesis":
        return <Gift className="w-4 h-4 text-emerald-600" />;
      case "prediction":
        return <ArrowUpRight className="w-4 h-4 text-amber-600" />;
      case "reward":
        return <Trophy className="w-4 h-4 text-emerald-600" />;
      case "refund":
        return <ArrowDownLeft className="w-4 h-4 text-blue-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: WalletTransaction["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 font-label">
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 font-label">
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-800 font-label">
            Failed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-800 font-label">
            Cancelled
          </span>
        );
    }
  };

  const formatAmount = (tx: WalletTransaction) => {
    const isPositive = tx.balanceAfter >= tx.balanceBefore;
    return (
      <span
        className={`font-bold text-xs font-label ${
          isPositive ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        {isPositive ? "+" : "-"}
        {tx.amount.toLocaleString()} pts
      </span>
    );
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-200 border-emerald-300 text-emerald-950 font-bold";
      case 2:
        return "bg-emerald-400 border-emerald-500 text-white font-extrabold";
      case 3:
        return "bg-emerald-600 border-emerald-700 text-white font-black shadow-xs";
      case 4:
        return "bg-emerald-800 border-emerald-900 text-white font-black shadow-sm ring-1 ring-emerald-400/40";
      default:
        return "bg-slate-100/90 border-slate-200/70 text-slate-500";
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-5 space-y-4 max-w-7xl w-full mx-auto font-body min-h-0 overflow-hidden text-slate-800">
      {/* Header Section — Consistent Layout */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-headline text-3xl text-[#064E3B] mb-1 flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-[#064E3B]" /> Spectator Wallet
          </h2>
          <p className="text-sm text-slate-500 font-medium font-body">
            Manage your virtual tokens and track your prediction rewards.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs font-headline"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              loading ? "animate-spin text-emerald-700" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs shrink-0 font-body">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Balance Banner + Monthly Activity Heatmap + Guide Tabs */}
        <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Green Balance Banner */}
          <div className="bg-gradient-to-r from-[#064E3B] via-emerald-800 to-[#043E2F] rounded-2xl p-4 md:p-5 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
            <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none text-8xl select-none">
              🏇
            </div>

            {/* Current Balance */}
            <div className="space-y-0.5 relative z-10">
              <p className="text-[10px] font-label font-bold tracking-widest text-emerald-200 uppercase">
                CURRENT BALANCE
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl md:text-4xl font-black tracking-tight">
                  {loading ? "..." : (wallet?.balance ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-emerald-200 font-bold font-label">
                  PTS
                </span>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-emerald-700/50" />

            {/* Last 30 Days Earnings */}
            <div className="space-y-0.5 relative z-10">
              <p className="text-[10px] font-label font-bold tracking-widest text-emerald-200 uppercase">
                LAST 30 DAYS EARNINGS
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-3xl md:text-4xl font-black tracking-tight text-emerald-300">
                  +{lastMonthEarnings.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-200 font-bold font-label">
                  PTS
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-body">
                From predictions & rewards
              </p>
            </div>
          </div>

          {/* Main Card Container */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-3 overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-slate-100 gap-6 pb-1 shrink-0">
              <button
                onClick={() => setActiveTab("activity_heatmap")}
                className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-all relative font-headline ${
                  activeTab === "activity_heatmap"
                    ? "text-[#064E3B] border-b-2 border-[#064E3B]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Monthly Activity Heatmap
              </button>

              <button
                onClick={() => setActiveTab("how_it_works")}
                className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-all relative font-headline ${
                  activeTab === "how_it_works"
                    ? "text-[#064E3B] border-b-2 border-[#064E3B]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                How It Works
              </button>

              <button
                onClick={() => setActiveTab("faqs")}
                className={`pb-2 text-xs font-bold flex items-center gap-1.5 transition-all relative font-headline ${
                  activeTab === "faqs"
                    ? "text-[#064E3B] border-b-2 border-[#064E3B]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                FAQs
              </button>
            </div>

            {/* TAB 1: 30-DAY MONTHLY ACTIVITY HEATMAP WITH MONTH SWITCHING */}
            {activeTab === "activity_heatmap" && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-hidden">
                {/* Heatmap Month Control Header Bar */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl shrink-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold font-headline text-slate-800 text-sm">
                      {monthlyActivityData.monthName}
                    </span>
                    <span className="text-[10px] font-label font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {monthlyActivityData.totalLogs} activity logs
                    </span>
                  </div>

                  {/* Previous / Next Month Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedMonthDate(new Date())}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold font-label transition-colors"
                      title="Jump to Current Month"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 30/31 Day Calendar Grid */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold font-label text-slate-400 uppercase tracking-wider">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  {/* Day Tiles Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty Padding Cells for Day Offset */}
                    {Array.from({
                      length: monthlyActivityData.firstDayOfWeek,
                    }).map((_, i) => (
                      <div
                        key={`offset-${i}`}
                        className="h-11 rounded-lg bg-transparent"
                      />
                    ))}

                    {/* Day Activity Squares */}
                    {monthlyActivityData.days.map((item) => (
                      <div
                        key={item.day}
                        title={`${monthlyActivityData.monthName.split(" ")[0]} ${item.day}: ${
                          item.count
                        } activity logs`}
                        className={`h-11 rounded-lg border flex flex-col items-center justify-center p-1 transition-all duration-150 hover:scale-105 cursor-pointer ${getHeatmapColor(
                          item.level
                        )}`}
                      >
                        <span className="text-[10px] font-label font-bold leading-none opacity-80">
                          {item.day}
                        </span>
                        <span className="text-xs font-black leading-none mt-1 font-headline">
                          {item.count > 0 ? item.count : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Footer Legend & Monthly Stats Summary */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium font-body">
                    <div className="flex items-center gap-4 text-[11px]">
                      <span>
                        Active Days:{" "}
                        <strong className="text-slate-900 font-headline">
                          {monthlyActivityData.activeDaysCount} days
                        </strong>
                      </span>
                      {monthlyActivityData.peakDay.count > 0 && (
                        <span>
                          Peak Activity:{" "}
                          <strong className="text-emerald-700 font-headline">
                            Day {monthlyActivityData.peakDay.day} (
                            {monthlyActivityData.peakDay.count} logs)
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-label">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" />
                      <div className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-300" />
                      <div className="w-2.5 h-2.5 rounded bg-emerald-400 border border-emerald-500" />
                      <div className="w-2.5 h-2.5 rounded bg-emerald-600 border border-emerald-700" />
                      <div className="w-2.5 h-2.5 rounded bg-emerald-800 border border-emerald-900" />
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HOW IT WORKS */}
            {activeTab === "how_it_works" && (
              <div className="flex-1 overflow-y-auto py-2 space-y-3 text-slate-700 font-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs font-headline">
                      1
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs font-headline">
                      Receive Welcome Bonus
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-body">
                      Every spectator gets an initial 10,000 pts bonus upon
                      signing up to participate in race predictions.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs font-headline">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs font-headline">
                      Place Predictions
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-body">
                      Browse upcoming races and predict top-performing horses or
                      jockeys to multiply your points.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs font-headline">
                      3
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs font-headline">
                      Climb Leaderboards
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-body">
                      Top-ranked spectators in tournament leaderboards earn
                      exclusive tournament reward purses!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FAQs */}
            {activeTab === "faqs" && (
              <div className="flex-1 overflow-y-auto py-2 space-y-2.5 text-slate-700 font-body">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 text-xs font-headline">
                    Do virtual tokens have real-world cash value?
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-body">
                    No, all tokens in the HRTMS platform are virtual points used
                    solely for leaderboard ranking and prediction fun.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 text-xs font-headline">
                    When do prediction rewards get credited?
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-body">
                    Rewards are automatically deposited into your spectator
                    wallet as soon as the referee verifies official race
                    results.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 text-xs font-headline">
                    What happens if a race is cancelled?
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-body">
                    If a race is cancelled, your placed tokens will be fully
                    refunded into your balance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Sidebar Transaction History & Flyout Search Menu */}
        <div className="lg:col-span-1 flex flex-col h-full min-h-0 overflow-hidden bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-3 relative font-body">
          {/* Sidebar Card Header Bar with Advanced Search & Filtering Button on the Right */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-headline">
              <History className="w-4 h-4 text-emerald-700" /> Transaction
              History
            </h3>

            {/* "Advanced Search and Filtering" Flyout Toggle Button */}
            <div className="relative font-sans" ref={flyoutRef}>
              <button
                onClick={() => setIsFlyoutOpen((prev) => !prev)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border font-sans ${
                  activeFilterCount > 0
                    ? "bg-[#064E3B] text-white border-[#064E3B] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                title="Advanced Search and Filtering"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-sans">
                  Advanced Search and Filtering
                </span>
                <span className="inline sm:hidden font-sans">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 bg-emerald-200 text-emerald-900 font-black rounded-full text-[9px] font-sans">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Flyout Menu Dropdown Panel */}
              {isFlyoutOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-4.5 z-50 space-y-4 font-sans text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="font-bold text-[#064E3B] text-sm flex items-center gap-2 font-headline">
                      <Filter className="w-4 h-4 text-emerald-700" /> Advanced
                      Filter Options
                    </span>
                    <button
                      onClick={() => setIsFlyoutOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Name / Description Search Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans block">
                      Description / Name Search
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search prediction, reward, bonus..."
                        className="w-full pl-8 pr-8 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] placeholder:text-slate-400 shadow-2xs font-sans"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Multi-Select Transaction Type Filter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans block">
                        Transaction Type
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium font-sans">
                        Multi-select
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-sans">
                      <button
                        onClick={() => toggleTypeFilter("all")}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors font-sans ${
                          selectedTypes.length === 0
                            ? "bg-[#064E3B] text-white border-[#064E3B] font-bold"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        All
                      </button>
                      {[
                        { key: "genesis", label: "Bonus" },
                        { key: "reward", label: "Rewards" },
                        { key: "prediction", label: "Predictions" },
                        { key: "refund", label: "Refunds" },
                        { key: "admin_adjustment", label: "Adjustments" },
                      ].map((chip) => {
                        const isSelected = selectedTypes.includes(chip.key);
                        return (
                          <button
                            key={chip.key}
                            onClick={() => toggleTypeFilter(chip.key)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 font-sans ${
                              isSelected
                                ? "bg-[#064E3B] text-white border-[#064E3B] shadow-xs font-bold"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            {isSelected && (
                              <span className="text-xs font-bold">✓</span>
                            )}
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Multi-Select Transaction Status Filter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans block">
                        Transaction Status
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium font-sans">
                        Multi-select
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-sans">
                      <button
                        onClick={() => toggleStatusFilter("all")}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors font-sans ${
                          selectedStatuses.length === 0
                            ? "bg-[#064E3B] text-white border-[#064E3B] font-bold"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        All
                      </button>
                      {[
                        { key: "completed", label: "Completed" },
                        { key: "pending", label: "Pending" },
                        { key: "failed", label: "Failed" },
                        { key: "cancelled", label: "Cancelled" },
                      ].map((chip) => {
                        const isSelected = selectedStatuses.includes(chip.key);
                        return (
                          <button
                            key={chip.key}
                            onClick={() => toggleStatusFilter(chip.key)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 font-sans ${
                              isSelected
                                ? "bg-[#064E3B] text-white border-[#064E3B] shadow-xs font-bold"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            {isSelected && (
                              <span className="text-xs font-bold">✓</span>
                            )}
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Date Range Filter with Dropdown Calendar Pickers */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans block">
                        Date Range Filter
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium font-sans">
                        From / To
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-sans">
                      <div>
                        <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-0.5">
                          Start Date
                        </span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] shadow-2xs font-sans"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-0.5">
                          End Date
                        </span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] shadow-2xs font-sans"
                        />
                      </div>
                    </div>
                    {/* Quick Date Range Preset Chips */}
                    <div className="flex flex-wrap gap-1 pt-1 font-sans">
                      {[
                        { label: "Today", days: 0 },
                        { label: "Last 7 Days", days: 7 },
                        { label: "Last 30 Days", days: 30 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyDatePreset(preset.days)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors font-sans"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer Bar: Auto-applied indicator on Left, Primary Reset Button on Right */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 font-sans">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 font-sans">
                      Filters applied automatically
                    </span>
                    <button
                      onClick={handleResetFilters}
                      className="px-3.5 py-1.5 bg-[#064E3B] text-white font-bold rounded-lg text-xs hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-xs font-sans"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Multi-Select & Date Filter Badges Summary */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1 shrink-0 pb-1 border-b border-slate-50 font-body">
              <span className="text-[10px] text-slate-400 font-label">
                Filters:
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  "{searchQuery}"
                  <button
                    type="button"
                    aria-label="Remove search filter"
                    onClick={() => setSearchQuery("")}
                    className="focus:outline-none focus:ring-1 focus:ring-emerald-600/30 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5 cursor-pointer" />
                  </button>
                </span>
              )}
              {selectedTypes.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1 capitalize"
                >
                  Type: {t}
                  <button
                    type="button"
                    aria-label={`Remove type ${t} filter`}
                    onClick={() => toggleTypeFilter(t)}
                    className="focus:outline-none focus:ring-1 focus:ring-emerald-600/30 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5 cursor-pointer" />
                  </button>
                </span>
              ))}
              {selectedStatuses.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1 capitalize"
                >
                  Status: {s}
                  <button
                    type="button"
                    aria-label={`Remove status ${s} filter`}
                    onClick={() => toggleStatusFilter(s)}
                    className="focus:outline-none focus:ring-1 focus:ring-emerald-600/30 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5 cursor-pointer" />
                  </button>
                </span>
              ))}
              {startDate && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  From: {startDate}
                  <button
                    type="button"
                    aria-label="Remove start date filter"
                    onClick={() => setStartDate("")}
                    className="focus:outline-none focus:ring-1 focus:ring-emerald-600/30 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5 cursor-pointer" />
                  </button>
                </span>
              )}
              {endDate && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  To: {endDate}
                  <button
                    type="button"
                    aria-label="Remove end date filter"
                    onClick={() => setEndDate("")}
                    className="focus:outline-none focus:ring-1 focus:ring-emerald-600/30 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5 cursor-pointer" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-auto font-label"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Full Sidebar Scrollable Transactions List */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 divide-y divide-slate-100 font-body">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading transactions...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No transactions found for active search/filters.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-800 text-xs capitalize truncate font-body">
                          {tx.description || tx.type}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-label">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs">{formatAmount(tx)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-label">
                      After: {tx.balanceAfter.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
