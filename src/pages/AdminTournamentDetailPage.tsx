import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import useAdminTournament from "../hooks/admin/useAdminTournament";
import TournamentDetail from "../components/admin/tournament/TournamentDetail";
import { TournamentService } from "../services/TournamentService";
import NotFoundContent from "../components/ui/NotFoundContent";
import { StatusBadge, RACE_STATUS_STYLES } from "../components/ui/StatusBadge";
import { STATUS_LABELS } from "../components/admin/race/raceStatus";
import type { RaceItem } from "../types/tournament";

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const addToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const {
    selectedTournament,
    loading,
    error,
    getTournamentDetail,
    updateTournament,
    updateTournamentStatus,
    clearSelectedTournament,
  } = useAdminTournament();

  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    clearSelectedTournament();
    void getTournamentDetail(id);
    Promise.resolve().then(() => {
      setRacesLoading(true);
      TournamentService.getTournamentRaces(id)
        .then((res) => setRaces(res.data ?? []))
        .catch(() => setRaces([]))
        .finally(() => setRacesLoading(false));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdate = async (
    tournamentId: string,
    data: Record<string, unknown>
  ): Promise<true | string> => {
    const result = await updateTournament(tournamentId, data as any);
    if (result === true) {
      addToast("Tournament updated successfully.", "success");
      return true;
    }
    addToast(result || "Failed to update tournament.", "error");
    return result;
  };

  const handleStatusChange = async (
    tournamentId: string,
    status: string
  ): Promise<true | string> => {
    const result = await updateTournamentStatus(tournamentId, status);
    if (result === true) {
      addToast("Tournament status updated.", "success");
      await getTournamentDetail(tournamentId);
      return true;
    }
    addToast(result || "Failed to update tournament status.", "error");
    return result;
  };

  if (error) {
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
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

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
              onClick={() => navigate(`/admin/tournaments/${id}/races/new`)}
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
    </UserLayout>
  );
}
