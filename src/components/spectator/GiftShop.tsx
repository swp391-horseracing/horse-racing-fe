import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Gift,
  Search,
  Coins,
  ShoppingBag,
  ArrowRight,
  Loader2,
  X,
  SlidersHorizontal,
  RotateCcw,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  ShopService,
  type ShopItem,
  type InventoryItem,
  getItemMetadata,
  parseDescriptionMeta,
} from "../../services/ShopService";
import { WalletService } from "../../services/WalletService";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../ui/toast";
import { cn } from "../../lib/utils";

export function GiftShop() {
  const [activeTab, setActiveTab] = useState<"shop" | "inventory">("shop");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Shop items state
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopPage, setShopPage] = useState(1);
  const [shopTotalPages, setShopTotalPages] = useState(1);
  const [isLoadingShop, setIsLoadingShop] = useState(false);

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Advanced Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "price-desc" | "price-asc" | "tier-desc" | "tier-asc"
  >("price-desc");

  // Generic helper for toggling filter selections
  const makeToggleFilter =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (value: string) => {
      if (value === "all") {
        setter([]);
      } else {
        setter((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value]
        );
      }
    };

  const toggleSeriesFilter = makeToggleFilter(setSelectedSeries);
  const toggleCategoryFilter = makeToggleFilter(setSelectedCategories);
  const toggleTierFilter = makeToggleFilter(setSelectedTiers);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSeries([]);
    setSelectedCategories([]);
    setSelectedTiers([]);
    setSortBy("price-desc");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    count += selectedSeries.length;
    count += selectedCategories.length;
    count += selectedTiers.length;
    if (sortBy !== "price-desc") count++; // non-default sort is also a filter
    return count;
  }, [searchQuery, selectedSeries, selectedCategories, selectedTiers, sortBy]);

  // Purchase flow state
  const [confirmingItem, setConfirmingItem] = useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { toasts, addToast } = useToast();

  const fetchWallet = useCallback(async () => {
    try {
      const data = await WalletService.getMyWallet();
      setWalletBalance(data.balance);
    } catch (err: any) {
      addToast(
        err?.response?.data?.message ||
          "Couldn't load your points balance. Redemption is disabled until it loads.",
        "error"
      );
    }
  }, [addToast]);

  const fetchShopItems = useCallback(async () => {
    setIsLoadingShop(true);
    try {
      // Fetch entire catalog (limit 100) so client-side filter, search, and sort operate across all items
      const res = await ShopService.listItems(1, 100);
      setShopItems(res.data);
      setShopTotalPages(1);
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to load shop items",
        "error"
      );
    } finally {
      setIsLoadingShop(false);
    }
  }, [addToast]);

  const fetchInventory = useCallback(async () => {
    setIsLoadingInventory(true);
    try {
      const res = await ShopService.getInventory(inventoryPage, 10);
      setInventory(res.data);
      setInventoryTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to load inventory",
        "error"
      );
    } finally {
      setIsLoadingInventory(false);
    }
  }, [inventoryPage, addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (activeTab === "shop") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchShopItems();
    } else {
      fetchInventory();
    }
  }, [activeTab, fetchShopItems, fetchInventory]);

  // Client side filtering for shop items
  const filteredItems = useMemo(() => {
    const filtered = shopItems.filter((item) => {
      // Inactive filter
      if (item.isActive === false) return false;

      const meta = getItemMetadata(
        item.name,
        item.price,
        item.description ?? ""
      );

      // Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        // Search against clean description (meta suffix stripped)
        const { cleanDescription } = parseDescriptionMeta(
          item.description ?? ""
        );
        const matchesDesc = cleanDescription.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Series filter
      if (selectedSeries.length > 0) {
        if (!selectedSeries.includes(meta.series)) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(meta.category)) return false;
      }

      // Tier filter
      if (selectedTiers.length > 0) {
        if (!selectedTiers.includes(meta.tier)) return false;
      }

      return true;
    });

    // Sort items (Default: price-desc, i.e., highest points first)
    return [...filtered].sort((a, b) => {
      if (sortBy === "price-desc") {
        return b.price - a.price;
      } else if (sortBy === "price-asc") {
        return a.price - b.price;
      } else {
        const tierValue = (tier: string) => {
          switch (tier.toLowerCase()) {
            case "high":
              return 3;
            case "mid":
              return 2;
            case "low":
              return 1;
            default:
              return 0;
          }
        };
        const tierA = tierValue(
          getItemMetadata(a.name, a.price, a.description ?? "").tier
        );
        const tierB = tierValue(
          getItemMetadata(b.name, b.price, b.description ?? "").tier
        );
        if (sortBy === "tier-desc") {
          return tierB - tierA;
        } else {
          return tierA - tierB;
        }
      }
    });
  }, [
    shopItems,
    searchQuery,
    selectedSeries,
    selectedCategories,
    selectedTiers,
    sortBy,
  ]);

  // Helper for deriving display attributes from item metadata
  const deriveItemView = useCallback(
    (item: ShopItem) => {
      const meta = getItemMetadata(
        item.name,
        item.price,
        item.description ?? ""
      );
      const isAffordable =
        walletBalance !== null && walletBalance >= item.price;
      const formattedSeries =
        meta.series.charAt(0).toUpperCase() + meta.series.slice(1);
      const formattedCategory =
        meta.category.charAt(0).toUpperCase() + meta.category.slice(1);
      const seriesColor =
        meta.series === "general"
          ? "bg-teal-50 text-teal-700 border-teal-200"
          : "bg-violet-50 text-violet-700 border-violet-200";
      const categoryColor =
        meta.category === "decorative"
          ? "bg-cyan-50 text-cyan-700 border-cyan-200"
          : meta.category === "drinkware"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200";

      return {
        meta,
        isAffordable,
        formattedSeries,
        formattedCategory,
        seriesColor,
        categoryColor,
      };
    },
    [walletBalance]
  );

  const handlePurchase = async () => {
    if (!confirmingItem || isPurchasing) return;
    setIsPurchasing(true);
    try {
      const res = await ShopService.purchaseItem(confirmingItem.id);
      addToast(`Successfully purchased ${confirmingItem.name}!`, "success");
      setWalletBalance(res.balance);
      setConfirmingItem(null);
      // Refresh inventory if active, or just fetch wallet
      fetchWallet();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 402) {
        addToast("Insufficient points in your wallet.", "error");
      } else {
        addToast(err?.response?.data?.message || "Purchase failed", "error");
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-full flex flex-col font-body text-slate-800">
      <ToastContainer toasts={toasts} />

      {/* Header Section — Consistent Layout */}
      <div className="flex justify-between items-center shrink-0 border-b border-[#064E3B]/10 pb-4">
        <div>
          <h2 className="font-headline text-3xl text-[#064E3B] mb-1 flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-[#064E3B]" /> Spectator Gift Exchange
          </h2>
          <p className="text-sm text-slate-500 font-medium font-body">
            Redeem premium stickers, custom drinkware, apparel, and tournament
            memorabilia using your earned points.
          </p>
        </div>

        {/* Wallet Balance widget */}
        <div className="bg-[#064E3B] border border-[#064E3B]/20 rounded-2xl px-5 py-3 flex items-center gap-3.5 shadow-md text-white">
          <div className="w-10 h-10 rounded-xl bg-[#EAB308] flex items-center justify-center text-[#064E3B] shrink-0 shadow-sm">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 uppercase font-black tracking-wider block mb-0.5 font-label">
              Wallet Balance
            </span>
            <span className="text-xl font-black font-label text-[#EAB308]">
              {walletBalance !== null ? walletBalance.toLocaleString() : "---"}{" "}
              <span className="text-xs font-black text-white ml-0.5">
                Points
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs and Filters Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#064E3B]/10 gap-4 relative z-30">
        {/* Tabs */}
        <div className="flex -mb-px">
          <button
            onClick={() => setActiveTab("shop")}
            className={cn(
              "px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2",
              activeTab === "shop"
                ? "border-[#064E3B] text-[#064E3B]"
                : "border-transparent text-slate-400 hover:text-[#064E3B]/70"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Reward Shop</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("inventory");
              setInventoryPage(1);
            }}
            className={cn(
              "px-5 py-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2",
              activeTab === "inventory"
                ? "border-[#064E3B] text-[#064E3B]"
                : "border-transparent text-slate-400 hover:text-[#064E3B]/70"
            )}
          >
            <Gift className="w-4 h-4" />
            <span>My Inventory</span>
          </button>
        </div>

        {/* Right Aligned Search & Filter (Only when in shop tab) */}
        {activeTab === "shop" && (
          <div className="flex items-center gap-2 w-full sm:w-auto pb-2 sm:pb-0 relative z-30">
            <div className="relative w-full sm:w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                aria-label="Search items by name or description"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:border-[#064E3B] transition-colors shadow-2xs"
              />
            </div>

            <div className="relative">
              <button
                aria-expanded={isFlyoutOpen}
                aria-label="Toggle filter and sorting options"
                onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Filters & Sorting</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#064E3B] text-white font-black rounded-full text-[9px] font-label">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Flyout Dropdown */}
              {isFlyoutOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4.5 z-50 space-y-3.5 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-extrabold text-[#064E3B] text-xs flex items-center gap-1.5 font-headline">
                      <Filter className="w-3.5 h-3.5" /> Filter Options
                    </span>
                    <button
                      onClick={() => setIsFlyoutOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1. Series Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                      Series
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => toggleSeriesFilter("all")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors",
                          selectedSeries.length === 0
                            ? "bg-[#064E3B] text-white border-[#064E3B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        All
                      </button>
                      {[
                        { key: "general", label: "General" },
                        { key: "tournament", label: "Tournament" },
                      ].map((s) => {
                        const isSelected = selectedSeries.includes(s.key);
                        return (
                          <button
                            key={s.key}
                            onClick={() => toggleSeriesFilter(s.key)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors flex items-center gap-1",
                              isSelected
                                ? "bg-[#064E3B] text-white border-[#064E3B]"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {isSelected && "✓"} {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Category Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => toggleCategoryFilter("all")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors",
                          selectedCategories.length === 0
                            ? "bg-[#064E3B] text-white border-[#064E3B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        All
                      </button>
                      {[
                        { key: "decorative", label: "Decorative" },
                        { key: "drinkware", label: "Drinkware" },
                        { key: "apparel", label: "Apparel" },
                      ].map((c) => {
                        const isSelected = selectedCategories.includes(c.key);
                        return (
                          <button
                            key={c.key}
                            onClick={() => toggleCategoryFilter(c.key)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors flex items-center gap-1",
                              isSelected
                                ? "bg-[#064E3B] text-white border-[#064E3B]"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {isSelected && "✓"} {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Tier Filter */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                      Tiers
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => toggleTierFilter("all")}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors",
                          selectedTiers.length === 0
                            ? "bg-[#064E3B] text-white border-[#064E3B]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        All
                      </button>
                      {[
                        { key: "low", label: "Low" },
                        { key: "mid", label: "Mid" },
                        { key: "high", label: "High" },
                      ].map((t) => {
                        const isSelected = selectedTiers.includes(t.key);
                        return (
                          <button
                            key={t.key}
                            onClick={() => toggleTierFilter(t.key)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors flex items-center gap-1",
                              isSelected
                                ? "bg-[#064E3B] text-white border-[#064E3B]"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {isSelected && "✓"} {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort By Selector */}
                  <div className="space-y-1.5 pt-2 border-t">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "price-desc"
                            | "price-asc"
                            | "tier-desc"
                            | "tier-asc"
                        )
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#064E3B] transition-colors"
                    >
                      <option value="price-desc">
                        Value: High to Low (Default)
                      </option>
                      <option value="price-asc">Value: Low to High</option>
                      <option value="tier-desc">Tier: High to Low</option>
                      <option value="tier-asc">Tier: Low to High</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-[9px] text-slate-400">
                      Auto-applied
                    </span>
                    <button
                      onClick={resetFilters}
                      className="px-2.5 py-1 bg-[#064E3B] text-white font-bold rounded-lg text-[10px] hover:bg-[#043E2F] flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#064E3B] shadow-2xs"
                    : "text-slate-400 hover:text-slate-600"
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-[#064E3B] shadow-2xs"
                    : "text-slate-400 hover:text-slate-600"
                )}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "shop" ? (
        <div className="space-y-6 flex-1 flex flex-col animate-in fade-in duration-200">
          {/* Active Filter Chips Summary */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 py-1 border-b">
              <span className="text-[10px] text-slate-400 font-label">
                Active Filters:
              </span>
              {searchQuery && (
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold rounded-lg flex items-center gap-1">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3 cursor-pointer" />
                  </button>
                </span>
              )}
              {selectedSeries.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 bg-emerald-50 border border-[#064E3B]/10 text-emerald-900 text-[10px] font-bold rounded-lg flex items-center gap-1 capitalize"
                >
                  Series: {s}
                  <button
                    onClick={() => toggleSeriesFilter(s)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3 cursor-pointer" />
                  </button>
                </span>
              ))}
              {selectedCategories.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-0.5 bg-emerald-50 border border-[#064E3B]/10 text-emerald-900 text-[10px] font-bold rounded-lg flex items-center gap-1 capitalize"
                >
                  Category: {c}
                  <button
                    onClick={() => toggleCategoryFilter(c)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3 cursor-pointer" />
                  </button>
                </span>
              ))}
              {selectedTiers.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 bg-emerald-50 border border-[#064E3B]/10 text-emerald-900 text-[10px] font-bold rounded-lg flex items-center gap-1 capitalize"
                >
                  Tier: {t}
                  <button
                    onClick={() => toggleTierFilter(t)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3 cursor-pointer" />
                  </button>
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-[10px] text-slate-400 hover:text-[#064E3B] underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid list */}
          {isLoadingShop ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin mb-2" />
              <p className="text-slate-500 text-xs">Loading reward items...</p>
            </div>
          ) : shopItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-3xl p-6 text-center">
              <ShoppingBag className="w-12 h-12 text-[#064E3B]/20 mb-3" />
              <h3 className="font-extrabold text-sm text-slate-800">
                Reward Shop is Empty
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md leading-relaxed mx-auto">
                There are currently no items available in the shop. An
                administrator needs to seed default items or create reward items
                first.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-3xl text-center">
              <Search className="w-12 h-12 text-slate-300 mb-2 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-800">
                No items match your filters
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Try modifying your search query or removing some active filters.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
              {filteredItems.map((item) => {
                const {
                  meta,
                  isAffordable,
                  formattedSeries,
                  formattedCategory,
                  seriesColor,
                  categoryColor,
                } = deriveItemView(item);

                return (
                  <div
                    key={item.id}
                    className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col relative"
                  >
                    {/* Item Image */}
                    <div className="aspect-[4/3] bg-slate-100 relative flex items-center justify-center overflow-hidden border-b">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-indigo-50 flex items-center justify-center text-[#064E3B]/20 relative">
                          <Gift className="w-12 h-12 text-[#064E3B]/10" />
                        </div>
                      )}

                      {/* Tier Tag */}
                      <span
                        className={cn(
                          "absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm font-label",
                          meta.tier === "high"
                            ? "bg-rose-500 text-white"
                            : meta.tier === "mid"
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-500 text-white"
                        )}
                      >
                        {meta.tier}
                      </span>

                      {/* Series Badge */}
                      <span
                        className={cn(
                          "absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border",
                          seriesColor
                        )}
                      >
                        {formattedSeries}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={cn(
                          "absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm border",
                          categoryColor
                        )}
                      >
                        {formattedCategory}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1 group-hover:text-[#064E3B] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed h-8">
                          {parseDescriptionMeta(item.description ?? "")
                            .cleanDescription || "No description provided."}
                        </p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[#EAB308]">
                          <Coins className="w-4 h-4" />
                          <span className="text-sm font-black font-label">
                            {item.price.toLocaleString()}
                          </span>
                        </div>

                        <button
                          disabled={!isAffordable}
                          title={
                            isAffordable
                              ? undefined
                              : "Not enough points in wallet"
                          }
                          onClick={() => setConfirmingItem(item)}
                          className={cn(
                            "text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all",
                            isAffordable
                              ? "bg-[#064E3B] text-white hover:bg-[#043E2F]"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          <span>Redeem</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3 animate-in fade-in duration-200">
              {filteredItems.map((item) => {
                const {
                  meta,
                  isAffordable,
                  formattedSeries,
                  formattedCategory,
                  seriesColor,
                  categoryColor,
                } = deriveItemView(item);

                return (
                  <div
                    key={item.id}
                    className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border relative flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Gift className="w-6 h-6 text-[#064E3B]/10" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-[#064E3B] transition-colors">
                            {item.name}
                          </h4>
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs font-label",
                              meta.tier === "high"
                                ? "bg-rose-500 text-white"
                                : meta.tier === "mid"
                                  ? "bg-indigo-500 text-white"
                                  : "bg-slate-500 text-white"
                            )}
                          >
                            {meta.tier}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                              seriesColor
                            )}
                          >
                            {formattedSeries}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-md border",
                              categoryColor
                            )}
                          >
                            {formattedCategory}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 max-w-xl">
                          {parseDescriptionMeta(item.description ?? "")
                            .cleanDescription || "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-105">
                      <div className="flex items-center gap-1 text-[#EAB308]">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-black font-label">
                          {item.price.toLocaleString()}
                        </span>
                      </div>

                      <button
                        disabled={!isAffordable}
                        title={
                          isAffordable
                            ? undefined
                            : "Not enough points in wallet"
                        }
                        onClick={() => setConfirmingItem(item)}
                        className={cn(
                          "text-[10px] font-extrabold px-4 py-2 rounded-lg flex items-center gap-1 transition-all w-full md:w-auto justify-center",
                          isAffordable
                            ? "bg-[#064E3B] text-white hover:bg-[#043E2F]"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        <span>Redeem</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {shopTotalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
              <button
                disabled={shopPage === 1}
                onClick={() => setShopPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-label text-slate-500">
                Page {shopPage} of {shopTotalPages}
              </span>
              <button
                disabled={shopPage === shopTotalPages}
                onClick={() =>
                  setShopPage((p) => Math.min(shopTotalPages, p + 1))
                }
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col">
          {/* Inventory Table */}
          {isLoadingInventory ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#064E3B] animate-spin mb-2" />
              <p className="text-slate-500 text-xs">Loading inventory...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-2xl">
              <Gift className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-slate-500 text-xs font-semibold">
                Your inventory is empty
              </p>
              <p className="text-slate-400 text-[10px] mt-1">
                Start exchanging items from the shop to view them here.
              </p>
            </div>
          ) : (
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="px-6 py-4">Item Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Value (Points)</th>
                      <th className="px-6 py-4 text-right">Redeemed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {inventory.map((inv) => {
                      const meta = getItemMetadata(
                        inv.name,
                        inv.price,
                        inv.description ?? ""
                      );

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border">
                              {inv.imageUrl ? (
                                <img
                                  src={inv.imageUrl}
                                  alt={inv.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Gift className="w-5 h-5 text-[#064E3B]/40" />
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-800">
                                {inv.name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="capitalize">
                                  {meta.series} Series
                                </span>
                                <span>•</span>
                                <span className="uppercase text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                  {meta.tier} Tier
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                              {meta.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-black font-label text-slate-800">
                            {inv.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-400 font-label text-[10px]">
                            {new Date(inv.purchasedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {inventoryTotalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
              <button
                disabled={inventoryPage === 1}
                onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-label text-slate-500">
                Page {inventoryPage} of {inventoryTotalPages}
              </span>
              <button
                disabled={inventoryPage === inventoryTotalPages}
                onClick={() =>
                  setInventoryPage((p) => Math.min(inventoryTotalPages, p + 1))
                }
                className="px-3 py-1 bg-white border rounded-lg text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Purchase Modal */}
      {confirmingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-3xl border shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3
                id="confirm-modal-title"
                className="font-extrabold text-slate-800 text-base flex items-center gap-2"
              >
                <Gift className="w-5 h-5 text-[#EAB308]" /> Confirm Exchange
              </h3>
              <button
                aria-label="Close modal"
                onClick={() => setConfirmingItem(null)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 border mb-6">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border overflow-hidden shrink-0 flex items-center justify-center">
                {confirmingItem.imageUrl ? (
                  <img
                    src={confirmingItem.imageUrl}
                    alt={confirmingItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gift className="w-7 h-7 text-[#064E3B]/30" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-800 leading-tight">
                  {confirmingItem.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {parseDescriptionMeta(confirmingItem.description ?? "")
                    .cleanDescription || "No description provided."}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 mb-6 text-xs border-b pb-4">
              <div className="flex justify-between text-slate-500">
                <span>Item Price</span>
                <span className="font-bold text-slate-800 font-label flex items-center gap-0.5">
                  <Coins className="w-3.5 h-3.5 text-[#EAB308]" />{" "}
                  {confirmingItem.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Wallet Balance</span>
                <span className="font-bold text-slate-800 font-label">
                  {walletBalance !== null
                    ? walletBalance.toLocaleString()
                    : "---"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 pt-2 border-t border-dashed">
                <span>Balance After Redemption</span>
                <span
                  className={cn(
                    "font-black font-label",
                    walletBalance !== null &&
                      walletBalance >= confirmingItem.price
                      ? "text-[#064E3B]"
                      : "text-rose-600"
                  )}
                >
                  {walletBalance !== null
                    ? (walletBalance - confirmingItem.price).toLocaleString()
                    : "---"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingItem(null)}
                className="flex-1 border py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={
                  isPurchasing ||
                  walletBalance === null ||
                  walletBalance < confirmingItem.price
                }
                onClick={handlePurchase}
                className="flex-1 bg-[#064E3B] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#043E2F] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isPurchasing && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Confirm Exchange</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
