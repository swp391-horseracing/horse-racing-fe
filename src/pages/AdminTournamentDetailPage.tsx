import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import useAdminTournament from "../hooks/admin/useAdminTournament";
import TournamentDetail from "../components/admin/tournament/TournamentDetail";
import { TournamentService } from "../services/TournamentService";
import { STATUS_LABELS } from "../components/admin/race/RaceStatusButton";
import type { RaceItem } from "../types/tournament";
import { ROUTES } from "../router/routes";

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTournamentDetail,
    selectedTournament,
    loading,
    updateTournament,
    updateTournamentStatus,
  } = useAdminTournament();

  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesLoading, setRacesLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getTournamentDetail(id);
  }, [id, getTournamentDetail]);

  const loadRaces = useCallback(async () => {
    if (!id) return;
    try {
      setRacesLoading(true);
      const res = await TournamentService.getTournamentRaces(id);
      setRaces(res.data ?? []);
    } catch {
      // silently fail
    } finally {
      setRacesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRaces();
  }, [loadRaces]);

  if (loading || !selectedTournament) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="h-full w-full flex flex-col overflow-y-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-4 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <TournamentDetail
          tournament={selectedTournament}
          onUpdate={(id, data) => updateTournament(id, data as never)}
          onStatusChange={updateTournamentStatus}
        />

        {/* Races Section */}
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#064E3B]">Races</h3>
            <button
              onClick={() =>
                navigate(
                  ROUTES.ADMIN_TOURNAMENT_RACE_NEW.replace(":tournamentId", id!)
                )
              }
              className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#043E2F] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create Race
            </button>
          </div>

          {racesLoading ? (
            <div className="flex items-center justify-center py-6 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading races...
            </div>
          ) : races.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              No races created yet for this tournament.
            </p>
          ) : (
            <div className="border rounded-xl overflow-hidden">
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
                        <span>
                          {STATUS_LABELS[race.status] ?? race.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              ROUTES.ADMIN_RACE_DETAIL.replace(":id", race.id)
                            )
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
      </div>
    </UserLayout>
  );
}
