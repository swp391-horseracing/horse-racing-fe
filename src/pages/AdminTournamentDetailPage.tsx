import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import TournamentDetail from "../components/admin/tournament/TournamentDetail";
import { TournamentService } from "../services/TournamentService";
import { AdminService } from "../services/AdminService";
import NotFoundContent from "../components/ui/NotFoundContent";
import { StatusBadge, RACE_STATUS_STYLES } from "../components/ui/StatusBadge";
import { STATUS_LABELS } from "../components/admin/race/raceStatus";
import { extractApiErrorMessage } from "../utils/errorMessages";
import RaceForm, { type RaceFormData } from "../components/admin/race/RaceForm";
import useAdminRace from "../hooks/admin/useAdminRace";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";
import type {
  RaceItem,
  TournamentDetail as TournamentDetailType,
} from "../types/tournament";

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { toasts, addToast } = useToast();

  const [selectedTournament, setSelectedTournament] =
    useState<TournamentDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(true);
  const [racesError, setRacesError] = useState<string | null>(null);
  const [showCreateRace, setShowCreateRace] = useState(false);

  const { createRace, actionLoading } = useAdminRace();

  useEffect(() => {
    if (!id) return;
    TournamentService.getTournamentByID(id)
      .then((data) => setSelectedTournament(data))
      .catch((err) =>
        setError(extractApiErrorMessage(err, "Failed to load tournament"))
      )
      .finally(() => setLoading(false));
    TournamentService.getTournamentRaces(id)
      .then((res) => setRaces(res.data ?? []))
      .catch(() => {
        setRaces([]);
        setRacesError("Failed to load races.");
      })
      .finally(() => setRacesLoading(false));
  }, [id]);

  const handleUpdate = async (
    tournamentId: string,
    data: Record<string, unknown>
  ): Promise<true | string> => {
    try {
      await AdminService.updateTournament(tournamentId, data as any);
      const updated = await TournamentService.getTournamentByID(tournamentId);
      setSelectedTournament(updated);
      addToast("Tournament updated successfully.", "success");
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(err, "Failed to update tournament");
      addToast(msg, "error");
      return msg;
    }
  };

  const handleStatusChange = async (
    tournamentId: string,
    status: string
  ): Promise<true | string> => {
    try {
      await AdminService.updateTournamentStatus(tournamentId, status);
      const updated = await TournamentService.getTournamentByID(tournamentId);
      setSelectedTournament(updated);
      addToast("Tournament status updated.", "success");
      return true;
    } catch (err) {
      const msg = extractApiErrorMessage(
        err,
        "Failed to update tournament status"
      );
      addToast(msg, "error");
      return msg;
    }
  };

  const handleCreateRace = async (
    data: RaceFormData
  ): Promise<string | null> => {
    if (!id) return "Tournament ID is missing.";

    const scheduledDate = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return "Invalid schedule date.";

    const payload: Record<string, unknown> = {
      name: data.name,
      raceNumber: data.raceNumber,
      courseDistanceId: data.trackDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: scheduledDate.toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };

    const res = await createRace(id, payload);
    if (res.success) {
      addToast("Race created successfully.", "success");
      setShowCreateRace(false);
      const racesRes = await TournamentService.getTournamentRaces(id);
      setRaces(racesRes.data ?? []);
      return null;
    }
    return res.error;
  };

  if (error && !selectedTournament) {
    return (
      <NotFoundContent
        title="Error"
        message={error}
        actionLabel="Go Back"
        onAction={() => navigate("/admin/tournaments")}
      />
    );
  }

  if (loading || !selectedTournament) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <UserLayout activeKey="/admin/tournaments">
      <div className="h-full w-full flex flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-4">
        <ToastContainer toasts={toasts} />

        <button
          onClick={() => navigate("/admin/tournaments")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-2 w-fit hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </button>

        <TournamentDetail
          tournament={selectedTournament}
          onUpdate={handleUpdate}
          onStatusChange={handleStatusChange}
        />

        <div className="mt-8 border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#064E3B]">Races</h3>
            <button
              onClick={() => setShowCreateRace(true)}
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
          ) : racesError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {racesError}
            </div>
          ) : races.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              No races in this tournament.
            </p>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="p-3">Name</th>
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
                        {race.scheduledAt
                          ? new Date(race.scheduledAt).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {race.venue ?? "-"}
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          status={race.status}
                          styleMap={RACE_STATUS_STYLES}
                          label={
                            STATUS_LABELS[race.status] ??
                            race.status.replaceAll("_", " ")
                          }
                          className="rounded capitalize font-bold"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            navigate(`/admin/races/${race.id}`, {
                              state: { tournamentId: race.tournamentId },
                            })
                          }
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

        {showCreateRace && (
          <RaceForm
            onClose={() => setShowCreateRace(false)}
            onSubmit={handleCreateRace}
            actionLoading={actionLoading}
            tournamentStartDate={selectedTournament.startDate}
            tournamentEndDate={selectedTournament.endDate}
            onError={(msg) => addToast(msg, "error")}
          />
        )}
      </div>
    </UserLayout>
  );
}
