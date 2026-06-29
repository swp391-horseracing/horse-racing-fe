import { useState, useCallback, useEffect } from "react";
import { Calendar, Flag, Loader2, ArrowLeft, Plus } from "lucide-react";
import type { ToastType } from "../../types/referee";
import { TournamentForm } from "./tournament/TournamentForm";
import TournamentList from "./tournament/TournamentList";
import TournamentDetailModal from "./tournament/TournamentDetailModal";
import useAdminTournament from "../../hooks/admin/useAdminTournament";
import useAdminRace from "../../hooks/admin/useAdminRace";
import TournamentDetail from "./tournament/TournamentDetail";
import { TournamentService } from "../../services/TournamentService";
import { STATUS_LABELS } from "./race/raceStatus";
import RaceForm, { type RaceFormData } from "./race/RaceForm";
import RaceStatusButton from "./race/RaceStatusButton";
import type { RaceItem } from "../../types/tournament";

export default function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const [view, setView] = useState<
    "list" | "tournament-detail" | "create-race" | "race-detail"
  >("list");
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(
    null
  );
  const [activeRaceId, setActiveRaceId] = useState<string | null>(null);
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [raceEditing, setRaceEditing] = useState(false);

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

  const {
    selectedRace,
    loading: raceLoading,
    actionLoading: raceActionLoading,
    getRaceDetail,
    createRace,
    updateRace,
    updateRaceStatus,
    clearSelectedRace,
  } = useAdminRace();

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

  // Fetch data on view changes
  useEffect(() => {
    if (view === "tournament-detail" && activeTournamentId) {
      void getTournamentDetail(activeTournamentId);
      Promise.resolve().then(() => loadRaces(activeTournamentId));
    } else if (view === "race-detail" && activeRaceId) {
      void getRaceDetail(activeRaceId);
    }
  }, [
    view,
    activeTournamentId,
    activeRaceId,
    getTournamentDetail,
    loadRaces,
    getRaceDetail,
  ]);

  const handleOpenDetail = async (id: string) => {
    await getTournamentDetail(id);
  };

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

  const handleUpdateTournament = async (id: string, data: any) => {
    const ok = await updateTournament(id, data);

    if (ok) {
      addToast("Tournament updated successfully.", "success");
      await getTournamentDetail(id);
    } else {
      addToast("Failed to update tournament.", "error");
    }
    return ok;
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const ok = await updateTournamentStatus(id, status);

    if (ok) {
      addToast("Tournament status updated.", "success");
      await getTournamentDetail(id);
    } else {
      addToast("Failed to update tournament status.", "error");
    }

    return ok;
  };

  const handleCreateRace = async (data: RaceFormData) => {
    if (!activeTournamentId) return false;
    const payload: Record<string, unknown> = {
      name: data.name,
      raceNumber: data.raceNumber,
      courseDistanceId: data.courseDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: new Date(data.scheduledAt).toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };
    const res = await createRace(activeTournamentId, payload);
    if (res) {
      addToast("Race created successfully.", "success");
      setView("tournament-detail");
      void loadRaces(activeTournamentId);
      return true;
    }
    addToast("Failed to create race.", "error");
    return false;
  };

  const handleUpdateRace = async (data: RaceFormData) => {
    if (!activeRaceId) return false;
    const payload: Record<string, unknown> = {
      name: data.name,
      raceNumber: data.raceNumber,
      courseDistanceId: data.courseDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: new Date(data.scheduledAt).toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };
    const ok = await updateRace(activeRaceId, payload);
    if (ok) {
      addToast("Race updated successfully.", "success");
      setRaceEditing(false);
      await getRaceDetail(activeRaceId);
    } else {
      addToast("Failed to update race.", "error");
    }
    return ok;
  };

  const handleRaceStatusChange = async (status: string) => {
    if (!activeRaceId) return;
    const ok = await updateRaceStatus(activeRaceId, status);
    if (ok) {
      addToast("Race status updated.", "success");
      await getRaceDetail(activeRaceId);
    } else {
      addToast("Failed to update race status.", "error");
    }
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
                        <span className="capitalize font-medium">
                          {STATUS_LABELS[race.status] ??
                            race.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setActiveRaceId(race.id);
                            setView("race-detail");
                            setRaceEditing(false);
                            clearSelectedRace();
                          }}
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
          />
        </div>
      </div>
    );
  }

  if (view === "race-detail" && activeRaceId) {
    if (raceLoading || !selectedRace) {
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
            setView("tournament-detail");
            setActiveRaceId(null);
            clearSelectedRace();
            if (activeTournamentId) {
              void loadRaces(activeTournamentId);
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-2 w-fit hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournament
        </button>

        <div className="space-y-5 bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center gap-3 border-b pb-4">
            <h2 className="text-xl font-bold text-[#064E3B]">
              {selectedRace.name ?? "Race Detail"}
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRaceEditing((prev) => !prev)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                {raceEditing ? "Cancel Edit" : "Edit Race"}
              </button>
              <RaceStatusButton
                currentStatus={selectedRace.status}
                onStatusChange={handleRaceStatusChange}
                actionLoading={raceActionLoading}
              />
            </div>
          </div>

          {raceEditing ? (
            <RaceForm
              initial={{
                name: selectedRace.name,
                roundName: selectedRace.roundName ?? "",
                distanceMeters: selectedRace.distanceMeters ?? 1200,
                trackCondition: selectedRace.trackCondition ?? "good",
                scheduledAt: selectedRace.scheduledAt ?? "",
                venue: selectedRace.venue ?? "",
                laneCount: selectedRace.laneCount ?? 8,
              }}
              onClose={() => setRaceEditing(false)}
              onSubmit={handleUpdateRace}
              actionLoading={raceActionLoading}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
              <div>
                <strong>Status:</strong>{" "}
                <span className="capitalize">
                  {STATUS_LABELS[selectedRace.status] ??
                    selectedRace.status.replaceAll("_", " ")}
                </span>
              </div>
              <div>
                <strong>Round:</strong> {selectedRace.roundName ?? "-"}
              </div>
              <div>
                <strong>Distance:</strong>{" "}
                {selectedRace.distanceMeters
                  ? `${selectedRace.distanceMeters}m`
                  : "-"}
              </div>
              <div>
                <strong>Track Condition:</strong>{" "}
                <span className="capitalize">
                  {selectedRace.trackCondition ?? "-"}
                </span>
              </div>
              <div>
                <strong>Venue:</strong> {selectedRace.venue ?? "-"}
              </div>
              <div>
                <strong>Lane Count:</strong> {selectedRace.laneCount ?? "-"}
              </div>
              <div>
                <strong>Scheduled:</strong>{" "}
                {selectedRace.scheduledAt
                  ? new Date(selectedRace.scheduledAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          )}
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

      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <Flag className="w-4 h-4" /> Results Pending Publication
          </h3>
          <p className="text-[11px] text-amber-700 mt-1">
            Referee &apos;Ref_Smith&apos; has submitted the final report for
            Race #42 (Concluded).
          </p>
        </div>

        <button
          onClick={() =>
            addToast(
              "Results Published. Virtual Economy updated (BR-BET-04).",
              "success"
            )
          }
          className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-amber-700 shrink-0"
        >
          Publish Official Results
        </button>
      </div>

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
              onView={handleOpenDetail}
              onManageRaces={handleManageRaces}
            />
          )}
        </div>

        <TournamentDetailModal
          isOpen={!!selectedTournament}
          onClose={clearSelectedTournament}
          tournament={selectedTournament!}
          onUpdate={handleUpdateTournament}
          onStatusChange={handleUpdateStatus}
          onManageRaces={handleManageRaces}
        />
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
