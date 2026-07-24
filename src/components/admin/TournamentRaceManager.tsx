import { useState, useMemo, useCallback } from "react";
import { Calendar, Loader2, Plus, Search, Trophy, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { ToastType } from "../../types/referee";
import { TournamentForm } from "./tournament/TournamentForm";
import TournamentStatus from "./tournament/TournamentStatus";
import RaceExpandableRow from "./race/RaceExpandableRow";
import RaceForm, { type RaceFormData } from "./race/RaceForm";
import TournamentDetail from "./tournament/TournamentDetail";
import useAdminTournament from "../../hooks/admin/useAdminTournament";
import useAdminRace from "../../hooks/admin/useAdminRace";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const filteredTournaments = useMemo(() => {
    return tournamentsList.filter((t) => {
      const matchSearch =
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tournamentsList, searchQuery, statusFilter]);

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
      addToast("Race updated successfully.", "success");
      setEditingRace(null);
      if (selectedTournamentId) await loadTournamentData(selectedTournamentId);
      return null;
    }
    return res.error;
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-slate-100/50">
      {/* Left Master Panel: Tournament List & Filters */}
      <div className="w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <button
            onClick={() => setShowCreateTournament(true)}
            className="w-full bg-[#064E3B] text-white px-4 py-3 rounded-xl text-xs font-black shadow-md hover:bg-[#043E2F] flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Tournament
          </button>

          <div className="relative pt-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 translate-y-0.5" />
            <input
              type="text"
              placeholder="Search tournaments or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
            {[
              "all",
              "upcoming",
              "registration_open",
              "active",
              "completed",
            ].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-[#064E3B] text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.replaceAll("_", " ")}
              </button>
            ))}
          </div>
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
              No tournaments found.
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
                        onEditRace={(r) => setEditingRace(r)}
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
