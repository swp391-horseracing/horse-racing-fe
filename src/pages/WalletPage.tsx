import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WalletService } from "../services/WalletService";
import type { WalletResponse, WalletTransaction } from "../types/wallet";
import { PredictionService } from "../services/PredictionService";
import type { Prediction } from "../types/prediction";
import { ShopService } from "../services/ShopService";
import { ROUTES } from "../router/routes";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Gift,
  Trophy,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  BookOpen,
  Search,
  Filter,
  X,
  ShoppingBag,
  Coins,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // Trending exchangeables from the gift shop
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // Tabs for Hero Transaction History: all | earned | spent | rewards
  const [txActiveTab, setTxActiveTab] = useState<
    "all" | "earned" | "spent" | "rewards"
  >("all");

  // Filter & Search Transaction State
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const loadWalletData = async (isMounted = { current: true }) => {
    try {
      setTrendingLoading(true);
      const [walletData, shopData, predictionsData] = await Promise.all([
        WalletService.getMyWallet(),
        ShopService.listItems(1, 20).catch(() => ({ data: [] })),
        PredictionService.getMyPredictions({ limit: 200 }).catch(() => ({
          data: [],
        })),
      ]);
      if (isMounted.current) {
        setWallet(walletData);
        setPredictions(predictionsData.data || []);

        // Sort active shop items by price descending and pick the top 3
        const sortedItems = [...(shopData?.data || [])]
          .sort((a, b) => b.price - a.price)
          .slice(0, 3);
        setTrendingItems(sortedItems);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err?.response?.data?.message || "Failed to load wallet data.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setTrendingLoading(false);
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

  // Listen for Escape key to close Guide Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isGuideOpen) {
        setIsGuideOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGuideOpen]);

  // Map race UUID to race names from predictions list
  const raceNames = useMemo(() => {
    const map: Record<string, string> = {};
    predictions.forEach((p) => {
      if (p.race) {
        map[p.race.id] = p.race.name;
      }
    });
    return map;
  }, [predictions]);

  // Clean description to remove raw UUIDs and avoid "race Race" redundancy
  const formatDescription = useCallback((description: string | null) => {
    if (!description) return null;
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = description.match(uuidRegex);
    if (match) {
      const id = match[0];
      const name = raceNames[id];
      if (name) {
        // If the name already includes "Race", remove the redundant "race" prefix
        return description
          .replace(`for race ${id}`, `for ${name}`)
          .replace(`race ${id}`, name)
          .replace(id, name);
      }
      return description
        .replace(`for race ${id}`, "for Race")
        .replace(`race ${id}`, "Race")
        .replace(id, "Race");
    }
    return description;
  }, [raceNames]);

  // Filter & Search Hero Transactions (Search, Date Range, Tabs Supported)
  const filteredTransactions = useMemo(() => {
    return (wallet?.transactions || []).filter((tx) => {
      // 1. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const friendlyDesc =
          formatDescription(tx.description)?.toLowerCase() ||
          tx.type.toLowerCase();
        const descMatch = friendlyDesc.includes(query);
        const typeMatch = tx.type.toLowerCase().includes(query);
        const idMatch = tx.id.toLowerCase().includes(query);
        if (!descMatch && !typeMatch && !idMatch) return false;
      }

      // 2. Tab selection Filter
      if (txActiveTab === "earned") {
        // "earned" MUST strictly be won predictions
        const isWonPrediction =
          tx.type === "reward" &&
          (tx.description?.toLowerCase().includes("prediction") ||
            tx.description?.toLowerCase().includes("prize"));
        if (!isWonPrediction) return false;
      } else if (txActiveTab === "spent") {
        const isSpent =
          tx.type === "prediction" ||
          tx.type === "purchase" ||
          (tx.type === "admin_adjustment" && tx.amount < 0);
        if (!isSpent) return false;
      } else if (txActiveTab === "rewards") {
        // rewards include login reward and genesis drop
        const isReward =
          tx.type === "genesis" ||
          (tx.type === "reward" &&
            !tx.description?.toLowerCase().includes("prediction") &&
            !tx.description?.toLowerCase().includes("prize"));
        if (!isReward) return false;
      }

      // 3. Date Range Filter (Using UTC boundaries to avoid local timezone shifts)
      if (startDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        if (new Date(tx.createdAt) < start) return false;
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999Z`);
        if (new Date(tx.createdAt) > end) return false;
      }

      return true;
    });
  }, [
    wallet,
    searchQuery,
    txActiveTab,
    startDate,
    endDate,
    formatDescription,
  ]);

  // Balance Flow Graph data calculation
  const chartData = useMemo(() => {
    if (!wallet?.transactions || wallet.transactions.length === 0) return [];

    // Sort ascending by date
    const sortedTxs = [...wallet.transactions].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const points = sortedTxs.map((tx) => ({
      date: new Date(tx.createdAt),
      balance: tx.balanceAfter,
      label: new Date(tx.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));

    // Prepend the initial balance
    if (sortedTxs.length > 0) {
      points.unshift({
        date: new Date(
          new Date(sortedTxs[0].createdAt).getTime() - 24 * 60 * 60 * 1000
        ),
        balance: sortedTxs[0].balanceBefore,
        label: "Start",
      });
    }

    return points;
  }, [wallet]);

  // Chart configuration constants and derived coordinates
  const chartWidth = 500;
  const chartHeight = 170; // Set to a moderate size for a balanced sidebar layout
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const { maxBal, minBal, coords, linePath, areaPath } = useMemo(() => {
    if (chartData.length === 0) {
      return {
        maxBal: 10000,
        minBal: 0,
        coords: [],
        linePath: "",
        areaPath: "",
      };
    }
    const balances = chartData.map((d) => d.balance);
    const maxVal = Math.max(...balances, wallet?.balance ?? 10000);
    const minVal = Math.min(...balances, wallet?.balance ?? 10000);

    const padding = (maxVal - minVal) * 0.15 || 1000;
    const maxBal = maxVal + padding;
    const minBal = Math.max(0, minVal - padding);

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const coords = chartData.map((d, index) => {
      const x = paddingLeft + (index / (chartData.length - 1 || 1)) * plotWidth;
      const y =
        paddingTop +
        plotHeight -
        ((d.balance - minBal) / (maxBal - minBal || 1)) * plotHeight;
      return { x, y, label: d.label, balance: d.balance };
    });

    const linePath = coords.reduce((acc, curr, index) => {
      return acc + `${index === 0 ? "M" : "L"} ${curr.x} ${curr.y}`;
    }, "");

    const areaPath =
      coords.length > 0
        ? `${linePath} L ${coords[coords.length - 1].x} ${paddingTop + plotHeight} L ${coords[0].x} ${paddingTop + plotHeight} Z`
        : "";

    return { maxBal, minBal, coords, linePath, areaPath };
  }, [chartData, wallet]);

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
    const isNegative =
      tx.type === "prediction" ||
      tx.type === "purchase" ||
      (tx.type === "admin_adjustment" && tx.amount < 0);
    const amountVal = Math.abs(tx.amount);

    return (
      <span
        className={`font-bold text-xs font-label ${
          isNegative ? "text-rose-600" : "text-emerald-600"
        }`}
      >
        {isNegative ? "-" : "+"}
        {amountVal.toLocaleString()} pts
      </span>
    );
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
            Manage your virtual points and track your prediction rewards.
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
        {/* Left Column: Balance Banner + Hero Transaction History Card */}
        <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Green Balance Banner */}
          <div className="bg-gradient-to-r from-[#064E3B] via-emerald-800 to-[#043E2F] rounded-2xl p-4 md:p-5 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
            <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none text-8xl select-none">
              🏇
            </div>

            {/* Current Balance */}
            <div className="space-y-0.5 relative z-10">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-label font-bold tracking-widest text-emerald-200 uppercase">
                  CURRENT BALANCE
                </p>
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="text-emerald-200 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  title="Guide & FAQ"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
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

          {/* Hero Transaction History Card */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-xs border border-slate-100 p-4 space-y-3 overflow-hidden">
            {/* Top Navigation Tabs & Search/Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-3 shrink-0">
              <div className="flex gap-4">
                {[
                  { key: "all", label: "All" },
                  { key: "earned", label: "Earned" },
                  { key: "spent", label: "Spent" },
                  { key: "rewards", label: "Rewards" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTxActiveTab(tab.key as any)}
                    className={`pb-2 text-xs font-bold transition-all relative font-headline cursor-pointer ${
                      txActiveTab === tab.key
                        ? "text-[#064E3B] border-b-2 border-[#064E3B]"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Inline Search and Time Filtering (Top-right aligned) */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history..."
                    className="w-36 sm:w-48 pl-8 pr-6 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]/20 placeholder:text-slate-400 shadow-2xs font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                  className={`p-1.5 border rounded-lg hover:bg-slate-50 transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
                    isTimeFilterOpen || startDate || endDate
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                  title="Filter by Time"
                >
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Time Filter Panel */}
            {isTimeFilterOpen && (
              <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center flex-wrap gap-3 text-xs text-slate-600 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[10px] text-slate-400 uppercase">
                    From
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[10px] text-slate-400 uppercase">
                    To
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
            {/* Scrollable Transactions List */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 divide-y divide-slate-100 font-body">
              {loading ? (
                <div className="py-20 text-center text-slate-400 text-sm font-semibold">
                  Loading transactions...
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm font-semibold">
                  No transactions found.
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-slate-800 text-xs truncate max-w-[150px] sm:max-w-xs md:max-w-md font-body">
                            {formatDescription(tx.description) || tx.type}
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

        {/* Right Column: Balance Flow Graph & Trending Shop Items */}
        <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
          {/* Top Card: Balance Flow Graph */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 flex flex-col min-h-0 shrink-0">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-headline">
              <TrendingUp className="w-4 h-4 text-[#064E3B]" /> Balance Flow
            </h3>
            <div className="min-h-[180px] flex items-center justify-center bg-slate-50/40 rounded-xl relative p-1.5">
              {loading ? (
                <div className="text-xs text-slate-400 font-semibold">
                  Loading chart...
                </div>
              ) : chartData.length < 2 ? (
                <div className="text-xs text-slate-400 font-semibold">
                  No transactions to chart.
                </div>
              ) : (
                <div className="w-full h-full flex flex-col">
                  {/* SVG Line Graph */}
                  <svg
                    className="w-full flex-1 overflow-visible"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity="0.18"
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line
                      x1={paddingLeft}
                      y1={paddingTop}
                      x2={chartWidth - paddingRight}
                      y2={paddingTop}
                      stroke="#F1F5F9"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={paddingLeft}
                      y1={
                        paddingTop +
                        (chartHeight - paddingTop - paddingBottom) * 0.5
                      }
                      x2={chartWidth - paddingRight}
                      y2={
                        paddingTop +
                        (chartHeight - paddingTop - paddingBottom) * 0.5
                      }
                      stroke="#F1F5F9"
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={paddingLeft}
                      y1={chartHeight - paddingBottom}
                      x2={chartWidth - paddingRight}
                      y2={chartHeight - paddingBottom}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />

                    {/* Y Axis Labels */}
                    <text
                      x={paddingLeft - 8}
                      y={paddingTop + 4}
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[11px] font-bold"
                    >
                      {Math.round(maxBal).toLocaleString()}
                    </text>
                    <text
                      x={paddingLeft - 8}
                      y={
                        paddingTop +
                        (chartHeight - paddingTop - paddingBottom) * 0.5 +
                        3
                      }
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[11px] font-bold"
                    >
                      {Math.round((maxBal + minBal) * 0.5).toLocaleString()}
                    </text>
                    <text
                      x={paddingLeft - 8}
                      y={chartHeight - paddingBottom + 3}
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[11px] font-bold"
                    >
                      {Math.round(minBal).toLocaleString()}
                    </text>

                    {/* Area Fill */}
                    {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                    {/* Line Path */}
                    {linePath && (
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Circular nodes on the line */}
                    {coords.map((c, idx) => (
                      <circle
                        key={idx}
                        cx={c.x}
                        cy={c.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#10B981"
                        strokeWidth="1.8"
                        className="transition-all hover:r-5 hover:fill-emerald-600 cursor-pointer"
                      >
                        <title>{`${c.label}: ${c.balance.toLocaleString()} pts`}</title>
                      </circle>
                    ))}

                    {/* X Axis Labels */}
                    {coords
                      .filter(
                        (_, i) =>
                          i === 0 ||
                          i === Math.floor(coords.length / 2) ||
                          i === coords.length - 1
                      )
                      .map((c, idx) => (
                        <text
                          key={idx}
                          x={c.x}
                          y={chartHeight - paddingBottom + 16}
                          textAnchor={
                            idx === 0 ? "start" : idx === 2 ? "end" : "middle"
                          }
                          className="fill-slate-400 font-bold font-body text-[11px]"
                        >
                          {c.label}
                        </text>
                      ))}
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card: Trending Exchange-ables */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 flex flex-col min-h-0 flex-1 overflow-hidden">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-headline">
              <ShoppingBag className="w-4 h-4 text-emerald-700" /> Premium Items
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
              {trendingLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading items...
                </div>
              ) : trendingItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active items in the gift shop.
                </div>
              ) : (
                trendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 border border-slate-50 hover:border-slate-100 bg-slate-50/30 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">
                          🎁
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.description || "Premium gift listing"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full font-label text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />{" "}
                        {item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button
              onClick={() => navigate(ROUTES.SPECTATOR_SHOP)}
              className="w-full text-xs font-semibold py-2 bg-[#064E3B] hover:bg-emerald-950 text-white rounded-xl flex justify-center items-center gap-1 cursor-pointer font-headline shrink-0"
            >
              Go to Gift Shop <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet Guide Flyout Modal */}
      {isGuideOpen && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setIsGuideOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-modal-title"
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl border border-slate-100 flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3
                id="guide-modal-title"
                className="font-headline font-bold text-lg text-[#064E3B] flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5 text-emerald-700" /> Wallet Guide &
                FAQs
              </h3>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-1">
              {/* How It Works Section */}
              <div className="space-y-3">
                <h4 className="font-headline font-bold text-[#064E3B] text-sm flex items-center gap-1.5">
                  How It Works
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      Receive Bonus
                    </h5>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Every spectator gets 10,000 pts welcome bonus to
                      participate in predictions.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      Place Predictions
                    </h5>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Predict top jockeys/horses in races to multiply points.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      Climb Leaderboards
                    </h5>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Top predictors win reward purses from active tournaments.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <div className="space-y-3 pb-2">
                <h4 className="font-headline font-bold text-[#064E3B] text-sm">
                  Frequently Asked Questions
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="font-semibold text-slate-900 text-xs">
                      Do virtual points have real-world cash value?
                    </h5>
                    <p className="text-[10px] text-slate-600 mt-1">
                      No, all points are virtual points used solely for
                      tournament leaderboards and shop fun.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="font-semibold text-slate-900 text-xs">
                      When do prediction rewards get added?
                    </h5>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Rewards are added immediately after the referee publishes
                      the official race results.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="font-semibold text-slate-900 text-xs">
                      What happens if a race is cancelled?
                    </h5>
                    <p className="text-[10px] text-slate-600 mt-1">
                      If cancelled, your placed points are fully refunded to
                      your wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
