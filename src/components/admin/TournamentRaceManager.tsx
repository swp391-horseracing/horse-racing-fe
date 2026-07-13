import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Loader2, ArrowLeft, Plus } from "lucide-react";
import type { ToastType } from "../../types/referee";
import { TournamentForm } from "./tournament/TournamentForm";
import TournamentList from "./tournament/TournamentList";

import useAdminTournament from "../../hooks/admin/useAdminTournament";
import useAdminRace from "../../hooks/admin/useAdminRace";
import TournamentDetail from "./tournament/TournamentDetail";
import { TournamentService } from "../../services/TournamentService";
import { STATUS_LABELS } from "./race/raceStatus";
import { getRaceStatusStyle } from "../../utils/statusStyles";
import RaceForm, { type RaceFormData } from "./race/RaceForm";
import type { RaceItem } from "../../types/tournament";

export default function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const navigate = useNavigate();
  const [view, setView] = useState<
    "list" | "tournament-detail" | "create-race"
  >("list");
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(
    null
  );
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    pagination,
    setPagination,
    tournaments,
    selectedTournament,
    loading: tournamentLoading,
    error: tournamentError,
    createTournament,
    actionLoading: tournamentActionLoading,
    updateTournament,
    updateTournamentStatus,
    getTournamentDetail,
    clearSelectedTournament,
  } = useAdminTournament();

  const { actionLoading: raceActionLoading, createRace } = useAdminRace();

  const loadRaces = useCallback(async (tourId: string) => {
    try {
      setRacesLoading(true);
      const res = await TournamentService.getTournamentRaces(tourId);
      setRaces(res.data ?? []);
    } catch {
      // silently fail
    } finally {
      setRacesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "tournament-detail" && activeTournamentId) {
      void getTournamentDetail(activeTournamentId);
      Promise.resolve().then(() => loadRaces(activeTournamentId));
    }
  }, [view, activeTournamentId, getTournamentDetail, loadRaces]);

  const handleManageRaces = (id: string) => {
    setActiveTournamentId(id);
    setView("tournament-detail");
    clearSelectedTournament();
  };

  const handleCreateTournament = async (data: any) => {
    const result = await createTournament(data);

    if (result) {
      addToast("Tournament created successfully.", "success");
      setShowForm(false);
      return result;
    }

    addToast("Failed to create tournament.", "error");
    return null;
  };

  const handleCreateRace = async (
    data: RaceFormData
  ): Promise<string | null> => {
    if (!activeTournamentId) return "No active tournament.";
    if (!data.scheduledAt) return "Schedule date is required.";
    const scheduledDate = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return "Invalid schedule date.";

    const payload: Record<string, unknown> = {
      name: data.name,
      raceNumber: data.raceNumber,
      roundName: data.roundName,
      courseDistanceId: data.trackDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: scheduledDate.toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };
    const res = await createRace(activeTournamentId, payload);
    if (res.success === false) {
      addToast("Failed to create race.", "error");
      return res.error ?? "Failed to create race.";
    }
    addToast("Race created successfully.", "success");
    setView("tournament-detail");
    void loadRaces(activeTournamentId);
    return null;
  };

  // RENDER SUB-VIEWS
  if (view === "tournament-detail" && activeTournamentId) {
    if (tournamentLoading || !selectedTournament) {
      return (
        <div className="flex items-center justify-center h-full p-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      );
    }

    return (
      <div className="h-full w-full flex flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-4">
        <button
          onClick={() => {
            setView("list");
            setActiveTournamentId(null);
            clearSelectedTournament();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-2 w-fit hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </button>

        <TournamentDetail
          tournament={selectedTournament}
          onUpdate={(id, data) => updateTournament(id, data as any)}
          onStatusChange={updateTournamentStatus}
        />

        {/* Races Section */}
        <div className="mt-8 border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#064E3B]">Races</h3>
            <button
              onClick={() => setView("create-race")}
              className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#043E2F] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create Race
            </button>
          </div>

          {racesLoading ? (
            <div className="flex items-center justify-center py-6 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading races...
            </div>
          ) : races.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              No races created yet for this tournament.
            </p>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Round</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Venue</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {races.map((race) => (
                    <tr key={race.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">
                        {race.name}
                      </td>
                      <td className="p-3 text-slate-600">
                        {race.roundName ?? "-"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {race.scheduledAt
                          ? new Date(race.scheduledAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {race.venue ?? "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${getRaceStatusStyle(race.status)}`}
                        >
                          {STATUS_LABELS[race.status] ??
                            race.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/admin/races/${race.id}`)}
                          className="text-[10px] font-bold text-[#064E3B] underline hover:no-underline"
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === "create-race" && activeTournamentId) {
    return (
      <div className="h-full w-full flex flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-4">
        <button
          onClick={() => setView("tournament-detail")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-2 w-fit hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournament
        </button>

        <h2 className="text-xl font-bold text-[#064E3B]">Create Race</h2>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <RaceForm
            onClose={() => setView("tournament-detail")}
            onSubmit={handleCreateRace}
            actionLoading={raceActionLoading}
            tournamentStartDate={selectedTournament?.startDate}
            tournamentEndDate={selectedTournament?.endDate}
          />
        </div>
      </div>
    );
  }

  // DEFAULT TOURNAMENT LIST VIEW
  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="border-b border-[#064E3B]/10 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Tournament & Track Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage schedules, assign referees, and publish results.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#043E2F] flex items-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5" /> Create Tournament
        </button>
      </div>

      {showForm && (
        <TournamentForm
          onClose={() => setShowForm(false)}
          createTournament={handleCreateTournament}
          actionLoading={tournamentActionLoading}
        />
      )}

      <div className="flex gap-4">
        <div className="flex-1 bg-white border rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Active Tournaments
          </h3>

          {tournamentLoading && !selectedTournament ? (
            <div className="py-10 flex items-center justify-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading tournaments...
            </div>
          ) : tournamentError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {tournamentError}
            </div>
          ) : (
            <TournamentList
              tournaments={tournaments?.data ?? []}
              onManage={handleManageRaces}
            />
          )}
        </div>
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2 pt-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
            className="border rounded-lg px-3 py-1 disabled:opacity-50 text-xs font-medium"
          >
            Prev
          </button>

          <span className="text-xs text-slate-600 font-medium">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
            className="border rounded-lg px-3 py-1 disabled:opacity-50 text-xs font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
