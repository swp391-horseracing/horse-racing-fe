import { useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ToastType } from "../../types/referee";
import { TournamentForm } from "./tournament/TournamentForm";
import TournamentList from "./tournament/TournamentList";

import useAdminTournament from "../../hooks/admin/useAdminTournament";

export default function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const {
    pagination,
    setPagination,
    tournaments,
    loading: tournamentLoading,
    error: tournamentError,
    createTournament,
    actionLoading: tournamentActionLoading,
  } = useAdminTournament();

  const handleManageRaces = (id: string) => {
    navigate(`/admin/tournaments/${id}`);
  };

  const handleCreateTournament = async (data: any) => {
    const result = await createTournament(data);

    if (result === true) {
      addToast("Tournament created successfully.", "success");
      setShowForm(false);
      return result;
    }

    addToast(result || "Failed to create tournament.", "error");
    return result;
  };

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

          {tournamentLoading ? (
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
