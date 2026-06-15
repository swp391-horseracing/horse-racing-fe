import { useState } from "react";
import { Calendar, Flag, ChevronLeft, Loader2 } from "lucide-react";
import type { ToastType } from "../../pages/AdminPage";
import { TournamentForm } from "./tournament/TournamentForm";
import TournamentList from "./tournament/TournamentList";
import TournamentDetail from "./tournament/TournamentDetail";
import useAdminTournament from "../../hooks/useAdminTournament";

export default function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  const {
    pagination,
    setPagination,
    tournaments,
    selectedTournament,
    loading,
    error,
    createTournament,
    actionLoading,
    updateTournament,
    updateTournamentStatus,
    getTournamentDetail,
    clearSelectedTournament,
  } = useAdminTournament();

  const handleOpenDetail = async (id: string) => {
    await getTournamentDetail(id);
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

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
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
          actionLoading={actionLoading}
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
        <div className="flex-1 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Active Tournaments
          </h3>

          {loading && !selectedTournament ? (
            <div className="py-10 flex items-center justify-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading tournaments...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <TournamentList
              tournaments={tournaments}
              onView={handleOpenDetail}
            />
          )}
        </div>

        {selectedTournament && (
          <div className="w-[550px] min-w-[550px] h-fit bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#064E3B] flex items-center gap-2">
                <button
                  onClick={clearSelectedTournament}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                Tournament Detail
              </h3>
            </div>

            <TournamentDetail
              tournament={selectedTournament}
              onUpdate={handleUpdateTournament}
              onStatusChange={handleUpdateStatus}
            />
          </div>
        )}
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
            className="border rounded-lg px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-slate-600">
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
            className="border rounded-lg px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
