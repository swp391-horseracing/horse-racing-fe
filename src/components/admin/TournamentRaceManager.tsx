import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Calendar,
  Loader2,
  Plus,
  Search,
  Trophy,
  MapPin,
  SlidersHorizontal,
  Filter,
  X,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { ToastType } from "../../types/referee";
import { TournamentForm } from "./tournament/TournamentForm";
import TournamentStatus from "./tournament/TournamentStatus";
import RaceExpandableRow from "./race/RaceExpandableRow";
import RaceForm, { type RaceFormData } from "./race/RaceForm";
import TournamentDetail from "./tournament/TournamentDetail";
import useAdminTournament from "../../hooks/admin/useAdminTournament";
import useAdminRace from "../../hooks/admin/useAdminRace";
import { AdminService } from "../../services/AdminService";
import { RaceService } from "../../services/RaceService";
import { TournamentService } from "../../services/TournamentService";
import { formatPrizePool } from "../../utils/formatters";
import type {
  RaceItem,
  TournamentDetail as TournamentDetailType,
} from "../../types/tournament";

export default function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const navigate = useNavigate();
  const { id: urlTournamentId } = useParams<{ id?: string }>();

  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [showCreateRace, setShowCreateRace] = useState(false);
  const [editingRace, setEditingRace] = useState<RaceItem | null>(null);

  // Advanced Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const [selectedTournamentDetail, setSelectedTournamentDetail] =
    useState<TournamentDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"races" | "overview">("races");

  const {
    pagination,
    setPagination,
    tournaments,
    loading: tournamentLoading,
    error: tournamentError,
    createTournament,
    updateTournament,
    updateTournamentStatus,
    actionLoading: tournamentActionLoading,
  } = useAdminTournament();

  const {
    createRace,
    updateRace,
    actionLoading: raceActionLoading,
  } = useAdminRace();

  const tournamentsList = useMemo(
    () => tournaments?.data ?? [],
    [tournaments?.data]
  );
  const selectedTournamentId =
    urlTournamentId ??
    (tournamentsList.length > 0 ? tournamentsList[0].id : null);
  const [prevSelectedId, setPrevSelectedId] = useState(selectedTournamentId);

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

  // Load tournament detail & races
  const loadTournamentData = useCallback(async (tId: string) => {
    setDetailLoading(true);
    setRacesLoading(true);
    try {
      const [detail, res] = await Promise.all([
        TournamentService.getTournamentByID(tId),
        TournamentService.getTournamentRaces(tId),
      ]);
      setSelectedTournamentDetail(detail);
      setRaces(res.data ?? []);
    } catch {
      setSelectedTournamentDetail(null);
      setRaces([]);
    } finally {
      setDetailLoading(false);
      setRacesLoading(false);
    }
  }, []);

  if (selectedTournamentId !== prevSelectedId) {
    setPrevSelectedId(selectedTournamentId);
    if (selectedTournamentId) {
      void loadTournamentData(selectedTournamentId);
    } else {
      setSelectedTournamentDetail(null);
      setRaces([]);
    }
  }

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
    setSelectedStatuses([]);
    setStartDate("");
    setEndDate("");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    count += selectedStatuses.length;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [searchQuery, selectedStatuses, startDate, endDate]);

  const filteredTournaments = useMemo(() => {
    return tournamentsList.filter((t) => {
      // 1. Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = t.name?.toLowerCase().includes(query) ?? false;
        const matchLoc = t.location?.toLowerCase().includes(query) ?? false;
        if (!matchName && !matchLoc) return false;
      }

      // 2. Status Multi-select
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(t.status)) return false;
      }

      // 3. Date Range
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(t.startDate) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(t.startDate) > end) return false;
      }

      return true;
    });
  }, [tournamentsList, searchQuery, selectedStatuses, startDate, endDate]);

  const handleSelectTournament = (id: string) => {
    navigate(`/admin/tournaments/${id}`, { replace: true });
  };

  const handleCreateTournamentSubmit = async (data: any) => {
    const result = await createTournament(data);
    if (result === true) {
      addToast("Tournament created successfully.", "success");
      setShowCreateTournament(false);
      return result;
    }
    addToast(result || "Failed to create tournament.", "error");
    return result;
  };

  const handleUpdateTournament = async (
    tId: string,
    data: Record<string, unknown>
  ): Promise<true | string> => {
    const result = await updateTournament(tId, data as any);
    if (result === true) {
      addToast("Tournament updated successfully.", "success");
      await loadTournamentData(tId);
      return true;
    }
    addToast(result, "error");
    return result;
  };

  const handleStatusChange = async (
    tId: string,
    status: string
  ): Promise<true | string> => {
    const result = await updateTournamentStatus(tId, status);
    if (result === true) {
      addToast("Tournament status updated.", "success");
      await loadTournamentData(tId);
      return true;
    }
    addToast(result, "error");
    return result;
  };

  const handleCreateRaceSubmit = async (
    data: RaceFormData
  ): Promise<string | null> => {
    if (!selectedTournamentId) return "Tournament is not selected.";
    const scheduledDate = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return "Invalid schedule date.";

    const payload = {
      name: data.name,
      raceNumber: data.raceNumber,
      courseDistanceId: data.trackDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: scheduledDate.toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };

    const res = await createRace(selectedTournamentId, payload);
    if (res.success) {
      await AdminService.updateRacePointsConfig(res.data.id, {
        firstPlacePoints: data.firstPlacePoints,
        secondPlacePoints: data.secondPlacePoints,
        thirdPlacePoints: data.thirdPlacePoints,
      });
      addToast("Race created successfully.", "success");
      setShowCreateRace(false);
      await loadTournamentData(selectedTournamentId);
      return null;
    }
    return res.error;
  };

  const handleUpdateRaceSubmit = async (
    data: RaceFormData
  ): Promise<string | null> => {
    if (!editingRace) return "No active race selected.";
    const scheduledDate = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return "Invalid schedule date.";

    const payload = {
      name: data.name,
      raceNumber: data.raceNumber,
      courseDistanceId: data.trackDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: scheduledDate.toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };

    const res = await updateRace(editingRace.id, payload);
    if (res.success) {
      await AdminService.updateRacePointsConfig(editingRace.id, {
        firstPlacePoints: data.firstPlacePoints,
        secondPlacePoints: data.secondPlacePoints,
        thirdPlacePoints: data.thirdPlacePoints,
      });
      addToast("Race updated successfully.", "success");
      setEditingRace(null);
      if (selectedTournamentId) await loadTournamentData(selectedTournamentId);
      return null;
    }
    return res.error;
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-slate-100/50">
      {/* Left Master Panel: Tournament List & Advanced Filters */}
      <div className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <button
            onClick={() => setShowCreateTournament(true)}
            className="w-full bg-[#064E3B] text-white px-4 py-3 rounded-xl text-xs font-black shadow-md hover:bg-[#043E2F] flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Tournament
          </button>

          {/* Search & Advanced Filter Flyout Bar */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
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

            {/* Advanced Filter Button & Flyout */}
            <div className="relative" ref={flyoutRef}>
              <button
                onClick={() => setIsFlyoutOpen((prev) => !prev)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border shrink-0 ${
                  activeFilterCount > 0
                    ? "bg-[#064E3B] text-white border-[#064E3B] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                title="Advanced Filter Options"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 bg-emerald-200 text-emerald-900 font-black rounded-full text-[9px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Flyout Panel */}
              {isFlyoutOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-4.5 z-50 space-y-4 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                    <span className="font-bold text-[#064E3B] text-sm flex items-center gap-2">
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

                  {/* Multi-Select Status Filter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Tournament Status
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Multi-select
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => toggleStatusFilter("all")}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                          selectedStatuses.length === 0
                            ? "bg-[#064E3B] text-white border-[#064E3B] font-bold"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        All
                      </button>
                      {[
                        { key: "upcoming", label: "Upcoming" },
                        {
                          key: "registration_open",
                          label: "Registration Open",
                        },
                        { key: "ongoing", label: "Ongoing" },
                        { key: "completed", label: "Completed" },
                        { key: "cancelled", label: "Cancelled" },
                      ].map((chip) => {
                        const isSelected = selectedStatuses.includes(chip.key);
                        return (
                          <button
                            key={chip.key}
                            onClick={() => toggleStatusFilter(chip.key)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                              isSelected
                                ? "bg-[#064E3B] text-white border-[#064E3B] shadow-xs font-bold"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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

                  {/* Date Range Filter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Start Date Range
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        From / To
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          Start
                        </span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#064E3B]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                          End
                        </span>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#064E3B]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: "Today", days: 0 },
                        { label: "Last 7 Days", days: 7 },
                        { label: "Last 30 Days", days: 30 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyDatePreset(preset.days)}
                          className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer Reset */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Auto-applied</span>
                    <button
                      onClick={handleResetFilters}
                      className="px-3.5 py-1.5 bg-[#064E3B] text-white font-bold rounded-lg text-xs hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Badges Summary */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Active:
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {selectedStatuses.map((st) => (
                <span
                  key={st}
                  className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1 capitalize"
                >
                  {st.replaceAll("_", " ")}
                  <button
                    onClick={() => toggleStatusFilter(st)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {startDate && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  From: {startDate}
                  <button
                    onClick={() => setStartDate("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {endDate && (
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  To: {endDate}
                  <button
                    onClick={() => setEndDate("")}
                    className="hover:text-rose-600"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Tournament Card List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tournamentLoading ? (
            <div className="py-12 flex items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#064E3B]" />{" "}
              Loading tournaments...
            </div>
          ) : tournamentError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {tournamentError}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tournaments match active filters.
            </div>
          ) : (
            filteredTournaments.map((tournament) => {
              const isSelected = selectedTournamentId === tournament.id;
              return (
                <div
                  key={tournament.id}
                  onClick={() => handleSelectTournament(tournament.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#064E3B] bg-[#064E3B]/5 shadow-sm ring-1 ring-[#064E3B]/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-xs text-[#064E3B] line-clamp-1">
                      {tournament.name}
                    </h3>
                    <TournamentStatus status={tournament.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{" "}
                      {tournament.location || "Online"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{" "}
                      {tournament.startDate
                        ? new Date(tournament.startDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="border rounded-lg px-2.5 py-1 disabled:opacity-50 font-medium"
            >
              Prev
            </button>
            <span className="text-slate-600 font-medium">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="border rounded-lg px-2.5 py-1 disabled:opacity-50 font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Right Detail Workspace Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {!selectedTournamentId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <Trophy className="w-12 h-12 stroke-1 text-slate-300" />
            <h3 className="font-bold text-slate-700 text-sm">
              No Tournament Selected
            </h3>
            <p className="text-xs max-w-sm">
              Choose a tournament from the left panel to manage its races,
              schedule, entries, and referees in one place.
            </p>
          </div>
        ) : detailLoading && !selectedTournamentDetail ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 gap-2 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#064E3B]" /> Loading
            tournament workspace...
          </div>
        ) : !selectedTournamentDetail ? (
          <div className="flex-1 flex items-center justify-center text-rose-500 text-xs">
            Failed to load tournament detail.
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
            {/* Header Area */}
            <div className="border-b pb-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-headline text-[#064E3B]">
                    {selectedTournamentDetail.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                      {selectedTournamentDetail.location}
                    </span>
                    <span>•</span>
                    <span>
                      Prize Pool: $
                      {formatPrizePool(selectedTournamentDetail.prizePool) ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreateRace(true)}
                    className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#043E2F] flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Create Race
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("races")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === "races"
                      ? "border-[#064E3B] text-[#064E3B]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Races ({races.length})
                </button>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-[#064E3B] text-[#064E3B]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Tournament Overview & Edit
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "races" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">
                    Tournament Races
                  </h3>
                  <span className="text-xs text-slate-400">
                    Click any row to expand entries and referees
                  </span>
                </div>

                {racesLoading ? (
                  <div className="py-12 flex items-center justify-center text-slate-400 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#064E3B]" />{" "}
                    Loading races...
                  </div>
                ) : races.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-400">
                      No races created in this tournament yet.
                    </p>
                    <button
                      onClick={() => setShowCreateRace(true)}
                      className="text-xs font-bold text-[#064E3B] underline hover:no-underline"
                    >
                      Create first race now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {races.map((race) => (
                      <RaceExpandableRow
                        key={race.id}
                        race={race}
                        onRaceUpdated={() =>
                          loadTournamentData(selectedTournamentId)
                        }
                        onEditRace={async (r) => {
                          try {
                            const [detail, config] = await Promise.all([
                              RaceService.getRaceById(r.id),
                              AdminService.getRaceConfig(r.id),
                            ]);
                            setEditingRace({
                              ...r,
                              ...detail,
                              raceConfig: config,
                              raceConfigFailed: false,
                            } as any);
                          } catch {
                            setEditingRace({
                              ...r,
                              raceConfig: null,
                              raceConfigFailed: true,
                            } as any);
                          }
                        }}
                        addToast={addToast}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50/50 border rounded-2xl p-6">
                <TournamentDetail
                  tournament={selectedTournamentDetail}
                  onUpdate={handleUpdateTournament}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      {showCreateTournament && (
        <TournamentForm
          onClose={() => setShowCreateTournament(false)}
          createTournament={handleCreateTournamentSubmit}
          actionLoading={tournamentActionLoading}
        />
      )}

      {/* Create Race Modal */}
      {showCreateRace && selectedTournamentDetail && (
        <RaceForm
          onClose={() => setShowCreateRace(false)}
          onSubmit={handleCreateRaceSubmit}
          actionLoading={raceActionLoading}
          tournamentStartDate={selectedTournamentDetail.startDate}
          tournamentEndDate={selectedTournamentDetail.endDate}
          onError={(msg) => addToast(msg, "error")}
        />
      )}

      {/* Edit Race Modal */}
      {editingRace && selectedTournamentDetail && (
        <RaceForm
          initial={{
            name: editingRace.name,
            distanceMeters: editingRace.distanceMeters ?? 1200,
            trackCondition: editingRace.trackCondition ?? "good",
            scheduledAt: editingRace.scheduledAt ?? "",
            venue: editingRace.venue ?? "",
            laneCount: editingRace.laneCount ?? 8,
            raceNumber: (editingRace as any).raceNumber ?? undefined,
            trackDistanceId: (editingRace as any).courseDistanceId ?? "",
            firstPlacePoints: (editingRace as any).raceConfigFailed
              ? 0
              : ((editingRace as any).raceConfig?.firstPlacePoints ?? 9),
            secondPlacePoints: (editingRace as any).raceConfigFailed
              ? 0
              : ((editingRace as any).raceConfig?.secondPlacePoints ?? 8),
            thirdPlacePoints: (editingRace as any).raceConfigFailed
              ? 0
              : ((editingRace as any).raceConfig?.thirdPlacePoints ?? 7),
          }}
          initialTrackId={(editingRace as any).course?.id ?? ""}
          onClose={() => setEditingRace(null)}
          onSubmit={handleUpdateRaceSubmit}
          actionLoading={raceActionLoading}
          tournamentStartDate={selectedTournamentDetail.startDate}
          tournamentEndDate={selectedTournamentDetail.endDate}
          onError={(msg) => addToast(msg, "error")}
        />
      )}
    </div>
  );
}
